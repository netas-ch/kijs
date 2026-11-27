<?php
declare(strict_types=1);
require_once __DIR__ . '/../api/ApiUpdate.php';
require_once __DIR__ . '/../HomeLang.php';

/**
 * Werkzeuge der Home-App: Stand der generierten Dateien (aktuell/veraltet) und
 * Ausführen der Generatoren. Die API-Dokumentation wird über ApiUpdate aktualisiert,
 * hier wird nur ihr Stand ermittelt.
 * Ausführen ist nur lokal (localhost) erlaubt.
 */
class HomeTools {
    protected string $_kijsDir = '';   // kijs


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    public function __construct() {
        $this->_kijsDir = realpath(__DIR__ . '/../../..') ?: '';
    }


    // --------------------------------------------------------------
    // PUBLIC
    // --------------------------------------------------------------
    /**
     * Gibt den Stand aller Werkzeuge zurück
     * @return stdClass  {isLocal, tools: [{id, outdated, info, version, files: [{file, time}]}]}
     */
    public function getStatus(): stdClass {
        $jsTime = $this->_getNewestTime($this->_getJsFiles());

        return (object)[
            'isLocal' => ApiUpdate::isLocal(),
            'tools' => [
                $this->_getApiStatus($jsTime),
                $this->_getUsagesStatus($jsTime),
                $this->_getTranslationsStatus(),
                $this->_getFontAwesomeStatus(),
                $this->_getCssStatus()
            ]
        ];
    }

    /**
     * Führt ein Werkzeug aus
     * @param string $id  'usages' oder 'translations'
     * @return stdClass  {id, files: [{file, time}]}
     */
    public function run(string $id): stdClass {
        if (!ApiUpdate::isLocal()) {
            throw new Exception(HomeLang::getText('Die Werkzeuge können nur lokal (localhost) ausgeführt werden.'));
        }

        $start = time();
        switch ($id) {
            case 'usages':
                $this->_includeScript('tools/kilang/generateUsages.php');
                $files = $this->_getFileInfos(['tools/kilang/data/usages.php', 'tools/kilang/data/home_usages.php']);
                break;

            case 'translations':
                $this->_includeScript('tools/kilang/convertPhpLanguageFilesToJs.php');
                $files = $this->_getFileInfos(array_merge(
                        $this->_glob('js/translation/kijs.translation.*.js'),
                        $this->_glob('home/app/translation/home.translation.*.js')
                ));
                break;

            default:
                throw new Exception(HomeLang::getText('Unbekanntes Werkzeug: %1', '', $id));
        }

        // Prüfen, ob die Dateien wirklich geschrieben wurden (die Skripte melden keine Fehler)
        $notWritten = [];
        foreach ($files as $f) {
            if ($f->time === null || $f->time < $start) {
                $notWritten[] = $f->file;
            }
        }
        if ($notWritten) {
            throw new Exception(HomeLang::getText('Nicht geschrieben (fehlende Schreibrechte für den Webserver?): %1', '',
                    implode(', ', $notWritten)));
        }

        return (object)['id' => $id, 'files' => $files];
    }


    // --------------------------------------------------------------
    // PROTECTED
    // --------------------------------------------------------------
    /**
     * Stand der API-Dokumentation: veraltet, wenn eine JS-Datei neuer ist oder die Version abweicht
     * @param int $jsTime  Zeitstempel der neusten JS-Datei
     * @return stdClass
     */
    protected function _getApiStatus(int $jsTime): stdClass {
        $status = (new ApiUpdate())->getStatus();
        $updated = $status->updated ? (int)strtotime($status->updated) : 0;

        $info = '';
        if (!$status->exists) {
            $info = HomeLang::getText('Die Datenbank fehlt noch.');
        } elseif ($status->kijsVersion !== $this->_getKijsVersion()) {
            $info = HomeLang::getText('Erstellt mit kijs %1.', '', $status->kijsVersion);
        } elseif ($updated < $jsTime) {
            $info = HomeLang::getText('Es gibt neuere JS-Dateien.');
        }

        return (object)[
            'id' => 'api',
            'outdated' => $info !== '',
            'info' => $info,
            'version' => $status->exists ? 'kijs ' . $status->kijsVersion : '',
            'files' => $status->exists ? [(object)['file' => 'home/data/api.sqlite', 'time' => $updated]] : []
        ];
    }

    /**
     * Stand der CSS-Dateien: veraltet, wenn eine LESS-Datei neuer ist als ihre CSS-Datei
     * @return stdClass
     */
    protected function _getCssStatus(): stdClass {
        $outdated = [];
        $files = [];
        foreach ($this->_glob('css/*.less') as $less) {
            $css = substr($less, 0, -5) . '.css';
            $files[] = $css;
            if (!is_file($this->_path($css)) || filemtime($this->_path($less)) > filemtime($this->_path($css))) {
                $outdated[] = basename($css);
            }
        }

        return (object)[
            'id' => 'css',
            'outdated' => count($outdated) > 0,
            'info' => $outdated ? HomeLang::getText('Veraltet: %1.', '', implode(', ', $outdated)) : '',
            'version' => '',
            'files' => $this->_getFileInfos($files)
        ];
    }

    /**
     * Gibt Pfad und Änderungszeit von Dateien zurück
     * @param array $files  Pfade relativ zum kijs-Ordner
     * @return array  [{file, time}]
     */
    protected function _getFileInfos(array $files): array {
        clearstatcache();
        $ret = [];
        foreach ($files as $file) {
            $ret[] = (object)[
                'file' => $file,
                'time' => is_file($this->_path($file)) ? (int)filemtime($this->_path($file)) : null
            ];
        }
        return $ret;
    }

    /**
     * Stand der Font-Awesome-IconMap: Version aus dem Dateikopf
     * @return stdClass
     */
    protected function _getFontAwesomeStatus(): stdClass {
        $file = 'js/iconMap/kijs.iconMap.Fa.js';
        $head = (string)file_get_contents($this->_path($file), false, null, 0, 500);
        $version = preg_match('/Version\s+([\d.]+)/', $head, $m) ? $m[1] : '?';

        return (object)[
            'id' => 'fontawesome',
            'outdated' => false,
            'info' => '',
            'version' => 'Font Awesome ' . $version,
            'files' => $this->_getFileInfos([$file])
        ];
    }

    /**
     * Gibt die JS-Dateien von kijs gemäss files.json zurück
     * @return array  Pfade relativ zum kijs-Ordner
     */
    protected function _getJsFiles(): array {
        $json = json_decode((string)file_get_contents($this->_path('files.json')));
        $files = [];
        foreach ($json->js ?? [] as $list) {
            foreach ($list as $file) {
                $files[] = $file;
            }
        }
        return $files;
    }

    /**
     * Gibt die Versionsnummer von kijs zurück (aus js/kijs.js)
     * @return string
     */
    protected function _getKijsVersion(): string {
        $content = (string)file_get_contents($this->_path('js/kijs.js'));
        return preg_match("/static get version\(\)\s*\{\s*return '([^']+)'/", $content, $m) ? $m[1] : '';
    }

    /**
     * Gibt die Änderungszeit der neusten Datei zurück
     * @param array $files  Pfade relativ zum kijs-Ordner
     * @return int  0, wenn keine Datei existiert
     */
    protected function _getNewestTime(array $files): int {
        $time = 0;
        foreach ($files as $file) {
            if (is_file($this->_path($file))) {
                $time = max($time, (int)filemtime($this->_path($file)));
            }
        }
        return $time;
    }

    /**
     * Stand der JS-Sprachdateien: veraltet, wenn eine PHP-Sprachdatei neuer ist
     * @return stdClass
     */
    protected function _getTranslationsStatus(): stdClass {
        $phpFiles = array_merge(
                $this->_glob('tools/kilang/data/kijs_*.php'),
                $this->_glob('tools/kilang/data/home_??.php')
        );
        $jsFiles = array_merge(
                $this->_glob('js/translation/kijs.translation.*.js'),
                $this->_glob('home/app/translation/home.translation.*.js')
        );

        $info = '';
        $jsTimes = array_map(fn(string $f): int => (int)filemtime($this->_path($f)), $jsFiles);
        if (!$jsFiles) {
            $info = HomeLang::getText('Es gibt noch keine JS-Sprachdateien.');
        } elseif ($this->_getNewestTime($phpFiles) > min($jsTimes)) {
            $info = HomeLang::getText('Es gibt neuere PHP-Sprachdateien.');
        }

        return (object)[
            'id' => 'translations',
            'outdated' => $info !== '',
            'info' => $info,
            'version' => '',
            'files' => $this->_getFileInfos($jsFiles)
        ];
    }

    /**
     * Stand der usages.php: veraltet, wenn eine JS-Datei neuer ist
     * @param int $jsTime  Zeitstempel der neusten JS-Datei
     * @return stdClass
     */
    protected function _getUsagesStatus(int $jsTime): stdClass {
        $file = 'tools/kilang/data/usages.php';
        $time = is_file($this->_path($file)) ? (int)filemtime($this->_path($file)) : 0;

        return (object)[
            'id' => 'usages',
            'outdated' => $time < $jsTime,
            'info' => $time < $jsTime ? HomeLang::getText('Es gibt neuere JS-Dateien.') : '',
            'version' => '',
            'files' => $this->_getFileInfos([$file])
        ];
    }

    /**
     * Sucht Dateien
     * @param string $pattern  Muster relativ zum kijs-Ordner
     * @return array  sortierte Pfade relativ zum kijs-Ordner
     */
    protected function _glob(string $pattern): array {
        $len = strlen($this->_kijsDir) + 1;
        $files = array_map(fn(string $f): string => substr($f, $len), glob($this->_path($pattern)) ?: []);
        sort($files);
        return $files;
    }

    /**
     * Führt ein PHP-Skript aus dem Ordner tools in seinem Ordner aus. Die Ausgabe wird verworfen.
     * @param string $script  Pfad relativ zum kijs-Ordner
     */
    protected function _includeScript(string $script): void {
        $cwd = (string)getcwd();
        ob_start();
        try {
            chdir(dirname($this->_path($script)));
            (static function(string $__file): void {
                include $__file;
            })($this->_path($script));
        } finally {
            ob_end_clean();
            chdir($cwd);
        }
    }

    /**
     * Gibt den absoluten Pfad zurück
     * @param string $file  Pfad relativ zum kijs-Ordner
     * @return string
     */
    protected function _path(string $file): string {
        return $this->_kijsDir . '/' . $file;
    }

}
