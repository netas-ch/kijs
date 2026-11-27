<?php
declare(strict_types=1);
require_once __DIR__ . '/ApiUpdate.php';
require_once __DIR__ . '/../HomeLang.php';

/**
 * Liest die API-Dokumentation aus der SQLite-Datenbank für die Home-App
 * (Klassenbaum und Klassenseite).
 */
class ApiReader {
    protected ?PDO $_pdo = null;
    protected string $_showcaseDir = '';


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    public function __construct() {
        $dbPath = __DIR__ . '/../../data/api.sqlite';
        $this->_showcaseDir = realpath(__DIR__ . '/../../data/showcase') ?: '';

        if (is_file($dbPath)) {
            $this->_pdo = new PDO('sqlite:' . $dbPath, null, null, [Pdo\Sqlite::ATTR_OPEN_FLAGS => Pdo\Sqlite::OPEN_READONLY]);
            $this->_pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->_pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_OBJ);
        }
    }


    // --------------------------------------------------------------
    // PUBLIC
    // --------------------------------------------------------------
    /**
     * Gibt alle Infos zu einer Klasse inkl. vererbter Einträge zurück
     * @param string $name  z.B. 'kijs.gui.Button'
     * @return stdClass
     */
    public function getClass(string $name): stdClass {
        $this->_checkDb();

        $cls = $this->_query('SELECT * FROM class WHERE name = ?', [$name])[0] ?? null;
        if (!$cls) {
            throw new Exception(HomeLang::getText('Die Klasse %1 gibt es nicht in der API.', '', $name));
        }
        $cls->examples = json_decode($cls->examples ?? '[]');
        $cls->see = json_decode($cls->see ?? '[]');
        $cls->hasDocComment = (bool)$cls->hasDocComment;
        $cls->hasOldHeader = (bool)$cls->hasOldHeader;

        // Vererbungskette (von der Basis bis zur Klasse selbst)
        $chain = [(object)['name' => $cls->name, 'exists' => true]];
        $cur = $cls->extends;
        $guard = 0;
        while ($cur && $guard++ < 50) {
            $base = $this->_query('SELECT name, extends FROM class WHERE name = ?', [$cur])[0] ?? null;
            array_unshift($chain, (object)['name' => $cur, 'exists' => (bool)$base]);
            $cur = $base ? $base->extends : null;
        }
        $cls->chain = $chain;

        // Abgeleitete Klassen
        $cls->subclasses = array_map(fn($r) => $r->name,
            $this->_query('SELECT name FROM class WHERE extends = ? ORDER BY name COLLATE NOCASE', [$cls->name]));

        // Showcase-Seite
        $cls->showcase = $this->_getShowcasePath($cls->name);

        // Einträge inkl. vererbte
        $rows = $this->_query("
            SELECT m.*, src.name AS ownerClass, src.file AS file, inh.name AS inheritedFrom,
                cm.defaultValue AS classDefaultValue
            FROM class_member cm
            JOIN member m ON m.memberId = cm.memberId
            JOIN class src ON src.classId = m.classId
            LEFT JOIN class inh ON inh.classId = cm.inheritedFromClassId
            WHERE cm.classId = ?
              AND (m.kind <> 'function' OR m.visibility = 'public')
            ORDER BY m.name COLLATE NOCASE, m.isStatic", [$cls->classId]);

        // Argumente der Funktionen
        $args = [];
        $ids = array_map(fn($r) => $r->memberId, array_filter($rows, fn($r) => $r->kind === 'function'));
        if ($ids) {
            $sql = 'SELECT * FROM argument WHERE memberId IN (' . implode(',', array_map('intval', $ids)) . ') ORDER BY memberId, idx';
            foreach ($this->_query($sql) as $a) {
                $a->isOptional = (bool)$a->isOptional;
                $a->isDocumented = (bool)$a->isDocumented;
                $args[$a->memberId][] = $a;
            }
        }

        $cls->properties = [];
        $cls->functions = [];
        $cls->events = [];
        $boolFields = ['isConfig', 'hasGetter', 'hasSetter', 'isReadOnly', 'isStatic', 'isAsync', 'isOverwrite', 'isForwarded', 'isDocumented'];
        foreach ($rows as $r) {
            foreach ($boolFields as $f) {
                $r->$f = $r->$f === null ? null : (bool)$r->$f;
            }
            $r->examples = json_decode($r->examples ?? '[]');
            $r->raisedIn = json_decode($r->raisedIn ?? '[]');

            // Geerbte Config: Standardwert, den diese Klasse (bzw. eine dazwischen) überschreibt
            if ($r->classDefaultValue !== null) {
                $r->defaultValue = $r->classDefaultValue;
                $r->defaultFrom = null;
            }
            unset($r->classDefaultValue);

            switch ($r->kind) {
                case 'property':
                    $cls->properties[] = $r;
                    break;
                case 'function':
                    $r->arguments = $args[$r->memberId] ?? [];
                    $cls->functions[] = $r;
                    break;
                case 'event':
                    $cls->events[] = $r;
                    break;
            }
        }

        // Ziele für Links in den Beschreibungen (siehe home.ApiClassPage._formatDescription)
        $cls->textLinks = (object)[
            'classes' => array_map(fn($r) => $r->name, $this->_query('SELECT name FROM class')),
            'guides' => $this->_getGuides()
        ];

        return $cls;
    }

    /**
     * Gibt den Lückenbericht zurück (Doku, die im Code noch fehlt), sortiert nach Klasse
     * @return stdClass  {types: {type: Anzahl}, issues: [{className, memberName, type, message, file}, ...]}
     */
    public function getIssues(): stdClass {
        $this->_checkDb();

        $issues = $this->_query("
            SELECT c.name AS className, c.file AS file, i.memberName, i.type, i.message
            FROM issue i
            JOIN class c ON c.classId = i.classId
            ORDER BY c.name COLLATE NOCASE, i.type = 'classNoDoc' DESC, i.type = 'oldHeader' DESC,
                     i.memberName COLLATE NOCASE, i.message");

        $types = [];
        foreach ($this->_query('SELECT type, count(*) AS cnt FROM issue GROUP BY type ORDER BY cnt DESC') as $r) {
            $types[$r->type] = (int)$r->cnt;
        }

        return (object)['types' => (object)$types, 'issues' => $issues];
    }

    /**
     * Gibt den Klassenbaum für die Navigation zurück (gegliedert nach Namespace)
     * @return array
     */
    public function getTree(): array {
        if (!$this->_pdo) {
            return [];
        }

        // Baum aufbauen: Namespace -> {classes, namespaces}
        $root = (object)['classes' => [], 'namespaces' => []];
        foreach ($this->_query('SELECT name FROM class ORDER BY name COLLATE NOCASE') as $r) {
            $parts = explode('.', $r->name);
            $short = array_pop($parts);
            $node = $root;
            $ns = '';
            foreach ($parts as $part) {
                $ns .= ($ns ? '.' : '') . $part;
                if (!isset($node->namespaces[$part])) {
                    $node->namespaces[$part] = (object)['name' => $ns, 'classes' => [], 'namespaces' => []];
                }
                $node = $node->namespaces[$part];
            }
            $node->classes[] = (object)['name' => $r->name, 'short' => $short];
        }

        // Zuerst die Namespaces, ganz unten der Lückenbericht
        $issues = (int)$this->_query('SELECT count(*) AS cnt FROM issue')[0]->cnt;
        $rows = $this->_getTreeRows($root);
        $rows[] = [
            'displayText' => 'Lückenbericht (' . $issues . ')',
            'nodeId' => 'apiissues',
            'iconMap' => 'kijs.iconMap.Fa.list-check',
            'allowChildren' => false,
            'children' => null,
            'userData' => (object)[
                'nodeId' => 'apiissues',
                'treeName' => 'treeApi',
                'path' => 'apiissues',
                'displayText' => 'Lückenbericht',
                'filetype' => 'apiissues',
                'iconMap' => 'kijs.iconMap.Fa.list-check'
            ]
        ];
        return $rows;
    }


    // --------------------------------------------------------------
    // PROTECTED
    // --------------------------------------------------------------
    /**
     * Wirft eine Exception, wenn die DB fehlt
     */
    protected function _checkDb(): void {
        if (!$this->_pdo) {
            throw new Exception(HomeLang::getText('Die API-Datenbank fehlt noch.') . ' ' . (ApiUpdate::isLocal()
                    ? HomeLang::getText('Sie kann über das Zahnrad oben rechts (Werkzeuge) erstellt werden.')
                    : HomeLang::getText('Sie kann nur lokal (localhost) erstellt werden.')));
        }
    }

    /**
     * Gibt die Leitfäden zurück: Titel (Dateiname mit Leerzeichen statt _) -> Pfad relativ zum Ordner home
     *   'Drag and Drop' -> 'data/docu/Leitfäden/Drag_and_Drop.md'
     * @return array
     */
    protected function _getGuides(): array {
        $guides = [];
        $dir = realpath(__DIR__ . '/../../data/docu/Leitfäden');
        if (!$dir) {
            return $guides;
        }
        $it = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dir, FilesystemIterator::SKIP_DOTS));
        foreach ($it as $file) {
            if ($file->getExtension() === 'md') {
                $title = str_replace('_', ' ', $file->getBasename('.md'));
                $guides[$title] = 'data/docu/Leitfäden/' . ltrim(str_replace('\\', '/', substr($file->getPathname(), strlen($dir))), '/');
            }
        }
        ksort($guides);
        return $guides;
    }

    /**
     * Sucht die passende Showcase-Seite zu einer Klasse
     *   kijs.gui.Button          -> data/showcase/Button.js
     *   kijs.gui.field.Text      -> data/showcase/field/field_Text.js
     * @param string $className
     * @return string|null  Pfad relativ zum Ordner home
     */
    protected function _getShowcasePath(string $className): ?string {
        if (!str_starts_with($className, 'kijs.gui.') || !$this->_showcaseDir) {
            return null;
        }
        $parts = explode('.', substr($className, strlen('kijs.gui.')));
        $rel = count($parts) === 1 ? $parts[0] . '.js' : $parts[0] . '/' . implode('_', $parts) . '.js';
        return is_file($this->_showcaseDir . '/' . $rel) ? 'data/showcase/' . $rel : null;
    }

    /**
     * Wandelt einen Namespace-Knoten in Zeilen für kijs.gui.Tree um.
     * Klassen und Unter-Namespaces werden gemeinsam alphabetisch sortiert
     * (wie im Showcase). Der Namespace 'kijs' ist aufgeklappt.
     * @param stdClass $node
     * @return array
     */
    protected function _getTreeRows(stdClass $node): array {
        $rows = [];
        foreach ($node->classes as $c) {
            // Gibt es einen gleichnamigen Namespace (z.B. Klasse kijs und Namespace kijs),
            // kommt die Klasse als erster Eintrag in den Namespace
            if (isset($node->namespaces[$c->short])) {
                array_unshift($node->namespaces[$c->short]->classes, $c);
                continue;
            }
            $rows[] = [
                'displayText' => $c->short,
                'nodeId' => 'api:' . $c->name,
                'iconMap' => 'kijs.iconMap.Fa.cube',
                'allowChildren' => false,
                'children' => null,
                'userData' => (object)[
                    'nodeId' => 'api:' . $c->name,
                    'treeName' => 'treeApi',
                    'path' => 'api:' . $c->name,
                    'displayText' => $c->name,
                    'filetype' => 'api',
                    'iconMap' => 'kijs.iconMap.Fa.cube',
                    'className' => $c->name
                ]
            ];
        }
        foreach ($node->namespaces as $part => $ns) {
            $rows[] = [
                'displayText' => (string)$part,
                'nodeId' => 'apins:' . $ns->name,
                'allowChildren' => true,
                'expanded' => $ns->name === 'kijs',
                'children' => $this->_getTreeRows($ns),
                'userData' => (object)['nodeId' => 'apins:' . $ns->name, 'treeName' => 'treeApi', 'filetype' => '']
            ];
        }

        // Alphabetisch, ohne Rücksicht auf Ordner/Knoten (wie in app/ajax.php)
        usort($rows, fn($a, $b) => strcmp(strtolower($a['displayText']), strtolower($b['displayText'])));
        return $rows;
    }

    /**
     * Führt eine Abfrage aus
     * @param string $sql
     * @param array $params
     * @return array
     */
    protected function _query(string $sql, array $params=[]): array {
        $stmt = $this->_pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

}
