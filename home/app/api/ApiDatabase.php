<?php
declare(strict_types=1);
/**
 * SQLite-Datenbank der API-Dokumentation
 *
 * Die Datenbank wird bei jedem Update komplett neu aufgebaut. Eine
 * Änderungshistorie gibt es nicht. Schema siehe createSchema().
 */
class ApiDatabase {
    protected ?PDO $_pdo = null;


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    /**
     * @param string $path  Pfad zur SQLite-Datei
     */
    public function __construct(string $path) {
        $this->_pdo = new PDO('sqlite:' . $path);
        $this->_pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $this->_pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_OBJ);
        $this->_pdo->exec('PRAGMA foreign_keys = ON');
    }


    // --------------------------------------------------------------
    // PUBLIC
    // --------------------------------------------------------------
    /**
     * Löscht den Zwischenspeicher und verkleinert die Datei
     */
    public function cleanup(): void {
        $this->_pdo->exec('DROP TABLE IF EXISTS parsed');
        $this->_pdo->exec('VACUUM');
    }
    /**
     * Schliesst die Verbindung (nötig vor dem Umbenennen der Datei)
     */
    public function close(): void {
        $this->_pdo = null;
    }

    /**
     * Erstellt alle Tabellen
     */
    public function createSchema(): void {
        $this->_pdo->exec("
            -- Metadaten: Datum des Updates, kijs-Version, Dauer, Statistik
            CREATE TABLE meta (
                key TEXT PRIMARY KEY,
                value TEXT
            );

            -- Zwischenspeicher für das Update in Schritten (wird am Schluss gelöscht)
            CREATE TABLE parsed (
                idx INTEGER PRIMARY KEY,
                module TEXT,
                file TEXT,
                classes TEXT,       -- JSON
                error TEXT
            );

            -- Klassen
            CREATE TABLE class (
                classId INTEGER PRIMARY KEY,
                name TEXT UNIQUE,           -- kijs.gui.Button
                nameInt TEXT,               -- kijs_gui_Button
                namespace TEXT,             -- kijs.gui
                extends TEXT,               -- kijs.gui.Element
                module TEXT,                -- core, gui, grid ...
                description TEXT,           -- Markdown
                examples TEXT,              -- JSON-Array
                see TEXT,                   -- JSON-Array
                deprecated TEXT,
                hasDocComment INTEGER,
                hasOldHeader INTEGER,
                file TEXT,
                line INTEGER
            );

            -- Eigene Einträge einer Klasse (ohne vererbte)
            CREATE TABLE member (
                memberId INTEGER PRIMARY KEY,
                classId INTEGER REFERENCES class(classId),
                name TEXT,
                kind TEXT,                  -- 'property' (Config/Getter/Setter), 'function', 'event'
                visibility TEXT,            -- 'public', 'protected'
                isConfig INTEGER,
                hasGetter INTEGER,
                hasSetter INTEGER,
                isReadOnly INTEGER,
                isStatic INTEGER,
                isAsync INTEGER,
                isOverwrite INTEGER,
                isForwarded INTEGER,        -- nur Events: mit _eventForwardsAdd weitergeleitet
                isDocumented INTEGER,       -- nur Events: mit @fires dokumentiert
                type TEXT,                  -- Typ bzw. Rückgabetyp
                defaultValue TEXT,
                description TEXT,           -- Markdown
                returnsDescription TEXT,
                deprecated TEXT,
                examples TEXT,              -- JSON-Array
                configTarget TEXT,          -- z.B. 'html'
                configFn TEXT,              -- z.B. 'assign', 'function'
                configContext TEXT,         -- z.B. 'this._captionDom'
                configPrio TEXT,
                raisedIn TEXT,              -- nur Events: JSON-Array mit Funktionsnamen
                docSource TEXT,             -- 'jsdoc', 'configMap', 'getter', 'getterComment', 'comment', 'base'
                docFrom TEXT,               -- bei docSource='base': Klasse, von der die Doku stammt
                line INTEGER,
                configLine INTEGER
            );
            CREATE INDEX member_class ON member(classId);

            -- Argumente von Funktionen
            CREATE TABLE argument (
                memberId INTEGER REFERENCES member(memberId),
                idx INTEGER,
                name TEXT,
                type TEXT,
                isOptional INTEGER,
                defaultValue TEXT,
                description TEXT,
                isDocumented INTEGER,
                PRIMARY KEY (memberId, idx)
            );

            -- Alle Einträge einer Klasse inkl. vererbte
            -- inheritedFromClassId ist NULL bei eigenen Einträgen
            CREATE TABLE class_member (
                classId INTEGER REFERENCES class(classId),
                memberId INTEGER REFERENCES member(memberId),
                inheritedFromClassId INTEGER,
                PRIMARY KEY (classId, memberId)
            );

            -- Lückenbericht
            CREATE TABLE issue (
                classId INTEGER REFERENCES class(classId),
                memberName TEXT,
                type TEXT,
                message TEXT
            );
        ");
    }

    /**
     * Gibt einen Wert aus der Tabelle meta zurück
     * @param string $key
     * @return string|null
     */
    public function getMeta(string $key): ?string {
        $stmt = $this->_pdo->prepare('SELECT value FROM meta WHERE key = ?');
        $stmt->execute([$key]);
        $val = $stmt->fetchColumn();
        return $val === false || $val === null ? null : (string)$val;
    }

    /**
     * Gibt alle Zeilen der Tabelle parsed zurück
     * @return array
     */
    public function getParsed(): array {
        return $this->_pdo->query('SELECT * FROM parsed ORDER BY idx')->fetchAll();
    }

    /**
     * Schreibt alle Klassen inkl. Members, Vererbung und Lückenbericht
     * @param array $classes  Klassen aus ProjectParser::resolve()
     * @param array $issues
     */
    public function saveClasses(array $classes, array $issues): void {
        $this->_pdo->beginTransaction();

        $insClass = $this->_pdo->prepare('INSERT INTO class (name, nameInt, namespace, extends, module, description, examples, see, deprecated, hasDocComment, hasOldHeader, file, line)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        $insMember = $this->_pdo->prepare('INSERT INTO member (classId, name, kind, visibility, isConfig, hasGetter, hasSetter, isReadOnly, isStatic, isAsync, isOverwrite,
            isForwarded, isDocumented, type, defaultValue, description, returnsDescription, deprecated, examples, configTarget, configFn, configContext, configPrio,
            raisedIn, docSource, docFrom, line, configLine)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        $insArg = $this->_pdo->prepare('INSERT INTO argument (memberId, idx, name, type, isOptional, defaultValue, description, isDocumented) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');

        $classIds = [];     // Name -> classId
        $ownMembers = [];   // classId -> [key -> memberId]

        foreach ($classes as $cls) {
            $insClass->execute([
                $cls->name, $cls->nameInt, $cls->namespace, $cls->extends, $cls->module ?? null,
                $cls->description, $this->_json($cls->examples), $this->_json($cls->see), $cls->deprecated,
                (int)$cls->hasDocComment, (int)$cls->hasOldHeader, $cls->file, $cls->line
            ]);
            $classId = (int)$this->_pdo->lastInsertId();
            $classIds[$cls->name] = $classId;
            $ownMembers[$classId] = [];

            foreach ($cls->properties as $p) {
                $insMember->execute([
                    $classId, $p->name, 'property', $p->visibility, (int)$p->isConfig, (int)$p->hasGetter, (int)$p->hasSetter,
                    (int)$p->isReadOnly, (int)$p->isStatic, 0, (int)$p->isOverwrite, null, null,
                    $p->type, $p->defaultValue, $p->description, null, $p->deprecated, null,
                    $p->config->target ?? null, $p->config->fn ?? null, $p->config->context ?? null, $p->config->prio ?? null,
                    null, $p->docSource, $p->docFrom ?? null, $p->line, $p->configLine
                ]);
                $ownMembers[$classId][$this->_key('property', $p->name, $p->isStatic)] = (int)$this->_pdo->lastInsertId();
            }

            foreach ($cls->functions as $f) {
                $insMember->execute([
                    $classId, $f->name, 'function', $f->visibility, 0, 0, 0, 0, (int)$f->isStatic, (int)$f->isAsync, (int)$f->isOverwrite,
                    null, null, $f->returns->type ?? null, null, $f->description, $f->returns->description ?? null, $f->deprecated,
                    $this->_json($f->examples), null, null, null, null, null, $f->docSource, $f->docFrom ?? null, $f->line, null
                ]);
                $memberId = (int)$this->_pdo->lastInsertId();
                $ownMembers[$classId][$this->_key('function', $f->name, $f->isStatic)] = $memberId;
                foreach ($f->arguments as $idx => $a) {
                    $insArg->execute([$memberId, $idx, $a->name, $a->type, (int)$a->isOptional, $a->defaultValue, $a->description, (int)$a->isDocumented]);
                }
            }

            foreach ($cls->events as $e) {
                $insMember->execute([
                    $classId, $e->name, 'event', 'public', 0, 0, 0, 0, 0, 0, 0, (int)$e->isForwarded, (int)$e->isDocumented,
                    null, null, $e->description, null, null, null, null, null, null, null,
                    $this->_json($e->raisedIn), $e->isDocumented ? (isset($e->docFrom) ? 'base' : 'jsdoc') : null, $e->docFrom ?? null, null, null
                ]);
                $ownMembers[$classId][$this->_key('event', $e->name, false)] = (int)$this->_pdo->lastInsertId();
            }
        }

        // Vererbung: alle Einträge inkl. der Basisklassen. Der Eintrag der
        // abgeleiteten Klasse überschreibt den gleichnamigen der Basisklasse.
        $insClassMember = $this->_pdo->prepare('INSERT INTO class_member (classId, memberId, inheritedFromClassId) VALUES (?, ?, ?)');
        $byName = [];
        foreach ($classes as $cls) {
            $byName[$cls->name] = $cls;
        }
        foreach ($classes as $cls) {
            $classId = $classIds[$cls->name];
            $all = [];
            $cur = $cls;
            $guard = 0;
            while ($cur && $guard++ < 50) {
                $curId = $classIds[$cur->name];
                foreach ($ownMembers[$curId] as $key => $memberId) {
                    if (!isset($all[$key])) {
                        $all[$key] = [$memberId, $curId === $classId ? null : $curId];
                    }
                }
                $cur = $byName[$cur->extends] ?? null;
            }
            foreach ($all as [$memberId, $fromId]) {
                $insClassMember->execute([$classId, $memberId, $fromId]);
            }
        }

        // Lückenbericht
        $insIssue = $this->_pdo->prepare('INSERT INTO issue (classId, memberName, type, message) VALUES (?, ?, ?, ?)');
        foreach ($issues as $i) {
            $insIssue->execute([$classIds[$i->class] ?? null, $i->member, $i->type, $i->message]);
        }

        $this->_pdo->commit();
    }

    /**
     * Speichert das Ergebnis einer geparsten Datei zwischen
     * @param int $idx
     * @param string $module
     * @param string $file
     * @param array|null $classes
     * @param string|null $error
     */
    public function saveParsed(int $idx, string $module, string $file, ?array $classes, ?string $error): void {
        $stmt = $this->_pdo->prepare('INSERT OR REPLACE INTO parsed (idx, module, file, classes, error) VALUES (?, ?, ?, ?, ?)');
        $stmt->execute([$idx, $module, $file, $classes === null ? null : $this->_json($classes), $error]);
    }

    /**
     * Schreibt einen Wert in die Tabelle meta
     * @param string $key
     * @param mixed $value
     */
    public function setMeta(string $key, mixed $value): void {
        $stmt = $this->_pdo->prepare('INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)');
        $stmt->execute([$key, is_scalar($value) || $value === null ? $value : $this->_json($value)]);
    }



    // --------------------------------------------------------------
    // PROTECTED
    // --------------------------------------------------------------
    /**
     * Wandelt einen Wert in JSON um
     * @param mixed $val
     * @return string
     */
    protected function _json(mixed $val): string {
        return json_encode($val, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
    }

    /**
     * Schlüssel eines Members für die Vererbung
     * @param string $kind
     * @param string $name
     * @param boolean $isStatic
     * @return string
     */
    protected function _key(string $kind, string $name, bool $isStatic): string {
        return $kind . ':' . ($isStatic ? 'static:' : '') . $name;
    }

}
