<?php
declare(strict_types=1);
require_once __DIR__ . '/ProjectParser.php';
require_once __DIR__ . '/ApiDatabase.php';

/**
 * Update der API-Dokumentation in Schritten, damit die Home-App einen
 * Fortschritt anzeigen kann:
 *   1. start()        Sperre setzen, leere temporäre DB anlegen, Dateiliste zurückgeben
 *   2. updateFile()   eine Datei parsen und zwischenspeichern (einmal pro Datei)
 *   3. finish()       Vererbung, Lückenbericht, DB umbenennen, Sperre aufheben
 *
 * Die neue DB wird erst am Schluss umbenannt. So bleibt die API während des
 * Updates benutzbar und es gibt nie einen halb aktualisierten Stand.
 * Das Update ist nur lokal (localhost) erlaubt.
 */
class ApiUpdate {
    const LOCK_TIMEOUT = 600;   // Sekunden, danach gilt eine Sperre als verwaist

    protected string $_dataDir = '';   // home/data
    protected string $_kijsDir = '';   // kijs


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    public function __construct() {
        $this->_dataDir = realpath(__DIR__ . '/../../data') ?: '';
        $this->_kijsDir = realpath(__DIR__ . '/../../..') ?: '';
    }


    // --------------------------------------------------------------
    // STATICS
    // --------------------------------------------------------------
    /**
     * Ist der Aufruf lokal (Kommandozeile oder localhost)?
     * @return boolean
     */
    public static function isLocal(): bool {
        if (PHP_SAPI === 'cli') {
            return true;
        }
        $addr = $_SERVER['REMOTE_ADDR'] ?? '';
        return in_array($addr, ['127.0.0.1', '::1', '::ffff:127.0.0.1'], true);
    }



    // --------------------------------------------------------------
    // PUBLIC
    // --------------------------------------------------------------
    /**
     * Bricht ein Update ab: temporäre DB löschen und Sperre aufheben
     */
    public function cancel(): void {
        $this->_checkLocal();
        if (is_file($this->_tmpPath())) {
            unlink($this->_tmpPath());
        }
        $this->_unlock();
    }

    /**
     * Schritt 3: Abschluss
     * @return stdClass  Zusammenfassung
     */
    public function finish(): stdClass {
        $this->_checkLocal();
        $this->_checkLock();
        $start = microtime(true);

        $db = new ApiDatabase($this->_tmpPath());

        // Zwischengespeicherte Klassen laden
        $classes = [];
        $errors = [];
        foreach ($db->getParsed() as $row) {
            if ($row->error) {
                $errors[] = (object)['file' => $row->file, 'message' => $row->error];
            } else {
                foreach (json_decode($row->classes) as $cls) {
                    $classes[] = $cls;
                }
            }
        }

        // Doku von Basisklassen übernehmen, Lückenbericht
        $pp = new ProjectParser($this->_kijsDir);
        $result = $pp->resolve($classes);
        $errors = array_merge($errors, $result->errors);

        $db->saveClasses($result->classes, $result->issues);

        $stats = (object)[
            'files' => count($db->getParsed()),
            'classes' => count($result->classes),
            'issues' => count($result->issues),
            'errors' => count($errors)
        ];
        $db->setMeta('updated', date('c'));
        $db->setMeta('kijsVersion', $this->_getKijsVersion());
        $db->setMeta('stats', $stats);
        $db->setMeta('errors', $errors);
        $db->cleanup();
        $db->close();
        unset($db);

        // Neue DB aktivieren
        if (!rename($this->_tmpPath(), $this->_dbPath())) {
            throw new Exception('Die Datenbank konnte nicht umbenannt werden.');
        }
        $this->_unlock();

        $stats->errorList = $errors;
        $stats->seconds = round(microtime(true) - $start, 2);
        return $stats;
    }

    /**
     * Gibt den Stand der API-Datenbank zurück
     * @return stdClass  {exists, updated, kijsVersion, stats, isLocal, isRunning}
     */
    public function getStatus(): stdClass {
        $status = (object)[
            'exists' => is_file($this->_dbPath()),
            'updated' => null,
            'kijsVersion' => null,
            'stats' => null,
            'isLocal' => self::isLocal(),
            'isRunning' => $this->_isLocked()
        ];
        if ($status->exists) {
            $db = new ApiDatabase($this->_dbPath());
            $status->updated = $db->getMeta('updated');
            $status->kijsVersion = $db->getMeta('kijsVersion');
            $status->stats = json_decode($db->getMeta('stats') ?? 'null');
            $db->close();
        }
        return $status;
    }

    /**
     * Schritt 1: Start
     * @return stdClass  {files: [{module, file}, ...]}
     */
    public function start(): stdClass {
        $this->_checkLocal();
        if ($this->_isLocked()) {
            throw new Exception('Es läuft bereits ein Update. Bitte warten oder später nochmals versuchen.');
        }
        file_put_contents($this->_lockPath(), (string)time());

        try {
            if (is_file($this->_tmpPath())) {
                unlink($this->_tmpPath());
            }
            $db = new ApiDatabase($this->_tmpPath());
            $db->createSchema();
            $db->close();

            $pp = new ProjectParser($this->_kijsDir);
            return (object)['files' => $pp->getFiles()];

        } catch (Throwable $ex) {
            $this->cancel();
            throw $ex;
        }
    }

    /**
     * Schritt 2: Eine Datei parsen und zwischenspeichern
     * @param int $idx  Index in der Dateiliste von start()
     * @return stdClass  {file, classes, error}
     */
    public function updateFile(int $idx): stdClass {
        $this->_checkLocal();
        $this->_checkLock();

        $pp = new ProjectParser($this->_kijsDir);
        $files = $pp->getFiles();
        if (!isset($files[$idx])) {
            throw new Exception('Ungültiger Datei-Index: ' . $idx);
        }
        $f = $files[$idx];

        $classes = null;
        $error = null;
        try {
            $classes = $pp->parseFile($f->module, $f->file);
        } catch (Exception $ex) {
            $error = $ex->getMessage();
        }

        $db = new ApiDatabase($this->_tmpPath());
        $db->saveParsed($idx, $f->module, $f->file, $classes, $error);
        $db->close();

        // Sperre verlängern
        file_put_contents($this->_lockPath(), (string)time());

        return (object)['file' => $f->file, 'classes' => $classes === null ? 0 : count($classes), 'error' => $error];
    }


    // --------------------------------------------------------------
    // PROTECTED
    // --------------------------------------------------------------
    /**
     * Wirft eine Exception, wenn der Aufruf nicht lokal ist
     */
    protected function _checkLocal(): void {
        if (!self::isLocal()) {
            throw new Exception('Das Update der API ist nur lokal (localhost) möglich.');
        }
    }

    /**
     * Wirft eine Exception, wenn kein Update läuft
     */
    protected function _checkLock(): void {
        if (!$this->_isLocked() || !is_file($this->_tmpPath())) {
            throw new Exception('Es läuft kein Update. Bitte neu starten.');
        }
    }

    /**
     * @return string
     */
    protected function _dbPath(): string {
        return $this->_dataDir . '/api.sqlite';
    }

    /**
     * Gibt die kijs-Version aus js/kijs.js zurück
     * @return string|null
     */
    protected function _getKijsVersion(): ?string {
        $content = (string)file_get_contents($this->_kijsDir . '/js/kijs.js');
        if (preg_match("/static get version\(\)\s*\{\s*return\s*'([^']+)'/", $content, $m)) {
            return $m[1];
        }
        return null;
    }

    /**
     * Läuft ein Update? Eine Sperre, die älter als LOCK_TIMEOUT ist, gilt als verwaist.
     * @return boolean
     */
    protected function _isLocked(): bool {
        if (!is_file($this->_lockPath())) {
            return false;
        }
        $time = (int)file_get_contents($this->_lockPath());
        return time() - $time < self::LOCK_TIMEOUT;
    }

    /**
     * @return string
     */
    protected function _lockPath(): string {
        return $this->_dataDir . '/api.lock';
    }

    /**
     * @return string
     */
    protected function _tmpPath(): string {
        return $this->_dataDir . '/api.sqlite.tmp';
    }

    /**
     * Sperre aufheben
     */
    protected function _unlock(): void {
        if (is_file($this->_lockPath())) {
            unlink($this->_lockPath());
        }
    }

}
