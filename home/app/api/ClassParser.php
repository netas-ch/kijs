<?php
declare(strict_types=1);
/**
 * kijs Class parser
 * Liest aus dem Element-Baum des FileParsers die Klassen mit allen Informationen
 * für die API-Dokumentation heraus. Grundlage sind die Regeln im Leitfaden
 * «Kommentare»:
 *  - Klassenkommentar (JSDoc) mit Beschreibung, @example und @fires
 *  - Config-Eigenschaften aus der _configMap mit Kommentar // {Typ} Text
 *  - Standardwerte aus _defaultConfig
 *  - Getter/Setter mit JSDoc beim Getter (@type)
 *  - Funktionen mit JSDoc (@param, @returns), // overwrite
 *  - Events aus raiseEvent() und _eventForwardsAdd()
 *
 * Private Members (#xy) werden ignoriert. Der alte Kopfkommentar wird nicht
 * ausgewertet (nur die Beschreibung davor).
 *
 * Neu geschrieben 2026 auf Basis von kijs-api (2021, Gerhard Kipfer)
 */
class ClassParser {
    protected string $_content = '';
    protected string $_file = '';


    // --------------------------------------------------------------
    // PUBLIC
    // --------------------------------------------------------------
    /**
     * Gibt alle Klassen aus einem Element-Baum zurück
     * @param array $elements  Rückgabe von FileParser::parseFile()
     * @param string $content  Dateiinhalt
     * @param string $file     Dateiname (relativ), wird in die Klassen übernommen
     * @return array
     */
    public function parse(array $elements, string $content, string $file): array {
        $this->_content = $content;
        $this->_file = $file;

        $root = $elements[0] ?? null;
        if (!$root || $root->type !== 'root') {
            throw new Exception('Ungültiger root (' . $file . ')');
        }

        $classes = [];
        foreach ($root->elements as $command) {
            if ($command->type !== 'command') {
                continue;
            }
            foreach ($command->elements as $i => $el) {
                if ($el->type === 'keyword' && $el->name === 'class') {
                    $cls = $this->_parseClass($command, $i);
                    if ($cls) {
                        $classes[] = $cls;
                    }
                }
            }
        }
        return $classes;
    }


    // --------------------------------------------------------------
    // PROTECTED
    // --------------------------------------------------------------
    /**
     * Fügt die Doku aus einem JSDoc-Kommentar oder aus Zeilenkommentaren zu einem Member hinzu
     * @param stdClass $mem
     * @param array $comments  Kommentar-Elemente direkt vor dem Member
     * @param int $lineNo      Zeile des Members
     */
    protected function _applyMemberComments(stdClass $mem, array $comments, int $lineNo): void {
        $mem->doc = null;
        $mem->docSource = null;
        $mem->isOverwrite = false;

        foreach ($comments as $c) {
            if ($c->commentType === '//' && preg_match('/^overwrite\b/i', trim($c->comment))) {
                $mem->isOverwrite = true;
            }
        }

        // JSDoc: der letzte /** ... */ vor dem Member
        for ($i=count($comments)-1; $i>=0; $i--) {
            if (DocComment::isDocComment($comments[$i])) {
                $mem->doc = DocComment::parse(substr($comments[$i]->comment, 1));
                $mem->docSource = 'jsdoc';
                return;
            }
        }

        // sonst: //-Kommentare direkt über dem Member (ohne Überschriften und Markierungen)
        $lines = $this->_lineCommentsAbove($comments, $lineNo);
        if ($lines) {
            $mem->doc = DocComment::parse(implode("\n", $lines));
            $mem->docSource = 'comment';
        }
    }

    /**
     * Erstellt das Ergebnis einer Klasse aus den gesammelten Teilen
     * @param stdClass $cls
     * @param array $members
     * @param array $configMap
     * @param array $defaultConfig
     * @param array $events
     * @return stdClass
     */
    protected function _buildClass(stdClass $cls, array $members, array $configMap, array $defaultConfig, array $events): stdClass {
        $properties = [];
        $functions = [];

        // Getter, Setter und statische Felder
        foreach ($members as $mem) {
            if ($mem->kind === 'get' || $mem->kind === 'set' || $mem->kind === 'field') {
                $key = ($mem->isStatic ? 'static ' : '') . $mem->name;
                if (!isset($properties[$key])) {
                    $properties[$key] = $this->_createProperty($mem->name, $mem->isStatic, $mem->visibility);
                }
                $prop = $properties[$key];
                if ($mem->kind === 'get') {
                    $prop->hasGetter = true;
                    $prop->line = $mem->line;
                } elseif ($mem->kind === 'set') {
                    $prop->hasSetter = true;
                    $prop->line = $prop->line ?? $mem->line;
                } else {
                    $prop->isField = true;
                    $prop->defaultValue = $mem->value;
                    $prop->line = $mem->line;
                }
                if ($mem->isOverwrite) {
                    $prop->isOverwrite = true;
                }
                // Doku vom Getter hat Vorrang vor der Doku vom Setter
                if ($mem->doc && (!$prop->doc || $mem->kind === 'get' && $prop->docFrom !== 'get')) {
                    $prop->doc = $mem->doc;
                    $prop->docFrom = $mem->kind;
                    $prop->docSource = $mem->docSource === 'jsdoc' ? 'getter' : 'getterComment';
                }

            } elseif ($mem->kind === 'method' && $mem->name !== 'constructor') {
                $functions[] = $this->_createFunction($mem);
            }
        }

        // Config-Eigenschaften
        foreach ($configMap as $name => $cfg) {
            $name = (string)$name;
            if (!isset($properties[$name])) {
                $properties[$name] = $this->_createProperty($name, false, 'public');
                $properties[$name]->line = $cfg->line;
            }
            $prop = $properties[$name];
            $prop->isConfig = $cfg->mapping !== false;
            $prop->config = $cfg->mapping;
            $prop->configLine = $cfg->line;

            // Kommentar in der configMap hat Vorrang
            if ($cfg->doc) {
                $prop->doc = $cfg->doc;
                $prop->docSource = 'configMap';
            }
        }

        // Standardwerte
        foreach ($defaultConfig as $name => $value) {
            if (isset($properties[$name])) {
                $properties[$name]->defaultValue = $value;
            }
        }

        // Aufbereiten
        $propList = [];
        foreach ($properties as $prop) {
            if ($prop->visibility === 'private') {
                continue;
            }
            // Config mit false (deaktiviert) ohne eigenen Getter/Setter: weglassen
            if ($prop->config === false && !$prop->hasGetter && !$prop->hasSetter) {
                continue;
            }
            // nur die öffentlichen Eigenschaften: Configs, Getter/Setter und statische Felder ohne _
            if ($prop->visibility === 'protected' && !$prop->isConfig) {
                continue;
            }
            $prop->type = $prop->doc->type ?? null;
            $prop->description = $prop->doc->description ?? '';
            $prop->deprecated = $prop->doc->deprecated ?? null;
            $prop->isReadOnly = $prop->hasGetter && !$prop->hasSetter;
            unset($prop->doc, $prop->docFrom);
            $propList[] = $prop;
        }
        usort($propList, fn($a, $b) => strcasecmp($a->name, $b->name));
        usort($functions, fn($a, $b) => strcasecmp($a->name, $b->name));

        // Events: @fires + gefundene Aufrufe
        $eventList = [];
        foreach ($cls->doc->fires ?? [] as $f) {
            $eventList[$f->name] = (object)['name' => $f->name, 'description' => $f->description, 'isDocumented' => true, 'raisedIn' => [], 'isForwarded' => false];
        }
        foreach ($events as $ev) {
            if (!isset($eventList[$ev->name])) {
                $eventList[$ev->name] = (object)['name' => $ev->name, 'description' => '', 'isDocumented' => false, 'raisedIn' => [], 'isForwarded' => false];
            }
            if ($ev->isForwarded) {
                $eventList[$ev->name]->isForwarded = true;
            }
            if (!in_array($ev->member, $eventList[$ev->name]->raisedIn)) {
                $eventList[$ev->name]->raisedIn[] = $ev->member;
            }
        }
        ksort($eventList, SORT_FLAG_CASE | SORT_STRING);

        $result = new stdClass();
        $result->name = $cls->name;
        $result->nameInt = $cls->nameInt;
        $result->namespace = str_contains($cls->name, '.') ? substr($cls->name, 0, strrpos($cls->name, '.')) : '';
        $result->extends = $cls->extends;
        $result->description = $cls->doc->description ?? '';
        $result->examples = $cls->doc->examples ?? [];
        $result->deprecated = $cls->doc->deprecated ?? null;
        $result->see = $cls->doc->see ?? [];
        $result->hasDocComment = $cls->doc !== null;
        $result->hasOldHeader = $cls->doc->hasOldHeader ?? false;
        $result->file = $this->_file;
        $result->line = $cls->line;
        $result->properties = $propList;
        $result->functions = $functions;
        $result->events = array_values($eventList);
        return $result;
    }

    /**
     * Erstellt das Ergebnis einer Funktion inkl. Argumente
     * @param stdClass $mem
     * @return stdClass
     */
    protected function _createFunction(stdClass $mem): stdClass {
        $doc = $mem->doc;

        // Argumente aus der Deklaration mit @param zusammenführen
        $docParams = [];
        foreach ($doc->params ?? [] as $p) {
            $docParams[$p->name] = $p;
        }
        $args = [];
        foreach ($mem->arguments as $arg) {
            $p = $docParams[$arg->name] ?? null;
            $args[] = (object)[
                'name' => $arg->name,
                'type' => $p->type ?? null,
                'isOptional' => $arg->defaultValue !== null || ($p->isOptional ?? false),
                'defaultValue' => $arg->defaultValue ?? ($p->defaultValue ?? null),
                'description' => $p->description ?? '',
                'isDocumented' => $p !== null
            ];
            unset($docParams[$arg->name]);
        }
        // Unterpunkte (options.xy) und Argumente, die nur im JSDoc stehen
        foreach ($docParams as $p) {
            $args[] = (object)[
                'name' => $p->name,
                'type' => $p->type,
                'isOptional' => $p->isOptional,
                'defaultValue' => $p->defaultValue,
                'description' => $p->description,
                'isDocumented' => true
            ];
        }

        return (object)[
            'name' => $mem->name,
            'visibility' => $mem->visibility,
            'isStatic' => $mem->isStatic,
            'isAsync' => $mem->isAsync,
            'isOverwrite' => $mem->isOverwrite,
            'description' => $doc->description ?? '',
            'deprecated' => $doc->deprecated ?? null,
            'examples' => $doc->examples ?? [],
            'arguments' => $args,
            'returns' => $doc->returns ?? null,
            'docSource' => $mem->docSource,
            'line' => $mem->line
        ];
    }

    /**
     * Erstellt eine leere Eigenschaft
     * @param string $name
     * @param boolean $isStatic
     * @param string $visibility
     * @return stdClass
     */
    protected function _createProperty(string $name, bool $isStatic, string $visibility): stdClass {
        return (object)[
            'name' => $name,
            'visibility' => $visibility,
            'isConfig' => false,
            'hasGetter' => false,
            'hasSetter' => false,
            'isField' => false,
            'isStatic' => $isStatic,
            'isOverwrite' => false,
            'config' => null,
            'defaultValue' => null,
            'doc' => null,
            'docFrom' => null,
            'docSource' => null,
            'line' => null,
            'configLine' => null
        ];
    }

    /**
     * Sucht im Constructor nach _configMap und _defaultConfig
     *   Object.assign(this._configMap, { ... })
     *   this._configMap = { ... }
     * @param stdClass $parentEl
     * @param array $configMap
     * @param array $defaultConfig
     */
    protected function _findConfigs(stdClass $parentEl, array &$configMap, array &$defaultConfig): void {
        foreach ($parentEl->elements ?? [] as $i => $el) {
            if (isset($el->elements) && $el->type !== 'string') {
                $this->_findConfigs($el, $configMap, $defaultConfig);
            }

            $target = null;
            $obj = null;

            // Object.assign(this._configMap, { ... })
            if ($el->type === 'variable' && $el->name === 'Object.assign') {
                $group = $this->_nextEl($parentEl, $i);
                if ($group && $group->type === 'group') {
                    $tokens = $this->_withoutComments($group->elements);
                    if (count($tokens) >= 3 && $tokens[0]->type === 'variable'
                            && $tokens[1]->type === 'operator' && $tokens[1]->name === ','
                            && $tokens[2]->type === 'commandGroup') {
                        $target = $tokens[0]->name;
                        $obj = $tokens[2];
                    }
                }

            // this._configMap = { ... }
            } elseif ($el->type === 'variable' && in_array($el->name, ['this._configMap', 'this._defaultConfig'])) {
                $op = $this->_nextEl($parentEl, $i);
                $val = $this->_nextEl($parentEl, $i+1);
                if ($op && $op->type === 'operator' && $op->name === '=' && $val && $val->type === 'commandGroup') {
                    $target = $el->name;
                    $obj = $val;
                }
            }

            if ($obj && $target === 'this._configMap') {
                foreach ($this->_parseObjectLiteral($obj) as $entry) {
                    $configMap[$entry->name] = (object)[
                        'mapping' => $this->_parseConfigMapping($entry),
                        'doc' => $this->_parseConfigComment($entry),
                        'line' => $entry->line
                    ];
                }
            } elseif ($obj && $target === 'this._defaultConfig') {
                foreach ($this->_parseObjectLiteral($obj) as $entry) {
                    $defaultConfig[$entry->name] = $entry->value;
                }
            }
        }
    }

    /**
     * Sucht rekursiv nach raiseEvent() und _eventForwardsAdd()
     * @param stdClass $parentEl
     * @param string $memberName
     * @param array $events
     */
    protected function _findEvents(stdClass $parentEl, string $memberName, array &$events): void {
        foreach ($parentEl->elements ?? [] as $i => $el) {
            if (isset($el->elements)) {
                $this->_findEvents($el, $memberName, $events);
            }
            if ($el->type === 'variable' && ($el->name === 'this.raiseEvent' || $el->name === 'this._eventForwardsAdd')) {
                $group = $this->_nextEl($parentEl, $i);
                if ($group && $group->type === 'group') {
                    $first = $this->_nextEl($group, -1);
                    if ($first && $first->type === 'string' && $first->stringType !== '`') {
                        $events[] = (object)[
                            'name' => $first->string,
                            'member' => $memberName,
                            'isForwarded' => $el->name === 'this._eventForwardsAdd'
                        ];
                    }
                }
            }
        }
    }

    /**
     * Liest die //-Kommentare direkt über einer Zeile, ohne Überschriften,
     * Linien und Markierungen (PROTECTED, overwrite ...)
     * @param array $comments
     * @param int $lineNo
     * @return array  Textzeilen
     */
    protected function _lineCommentsAbove(array $comments, int $lineNo): array {
        $lines = [];
        $expected = $lineNo - 1;
        for ($i=count($comments)-1; $i>=0; $i--) {
            $c = $comments[$i];
            if ($c->commentType !== '//' || $c->lineNo !== $expected) {
                break;
            }
            $text = trim($c->comment);
            if (preg_match('/^overwrite\b/i', $text)) {
                $expected--;
                continue;
            }
            // Linie oder Markierung in Grossbuchstaben: Ende
            if (preg_match('/^-{3,}$/', $text) || preg_match('/^[A-ZÄÖÜ][A-ZÄÖÜ0-9 \/&()_-]*$/', $text)) {
                break;
            }
            array_unshift($lines, $text);
            $expected--;
        }
        return $lines;
    }

    /**
     * Gibt die Zeilennummer einer Position zurück
     * @param int $pos
     * @return int
     */
    protected function _lineOf(int $pos): int {
        return substr_count($this->_content, "\n", 0, max(0, $pos - 1)) + 1;
    }

    /**
     * Gibt das nächste Element nach einem Index zurück, Kommentare werden übersprungen
     * @param stdClass $parentEl
     * @param int $index
     * @return stdClass|null
     */
    protected function _nextEl(stdClass $parentEl, int $index): ?stdClass {
        for ($i=$index+1; $i<count($parentEl->elements); $i++) {
            if ($parentEl->elements[$i]->type !== 'comment') {
                return $parentEl->elements[$i];
            }
        }
        return null;
    }

    /**
     * Liest die Argumente einer Funktionsdeklaration
     * @param stdClass $group
     * @return array
     */
    protected function _parseArguments(stdClass $group): array {
        $args = [];
        $tokens = $this->_withoutComments($group->elements);
        foreach ($this->_splitByComma($tokens) as $part) {
            if (!$part) {
                continue;
            }
            $name = '';
            $k = 0;
            if ($part[0]->type === 'operator' && $part[0]->name === '...') {
                $name = '...';
                $k = 1;
            }
            $nameEl = $part[$k] ?? null;
            if (!$nameEl) {
                continue;
            }
            if ($nameEl->type === 'variable' || $nameEl->type === 'keyword') {
                $name .= $nameEl->name;
            } else {
                // Destructuring ({a, b}) oder [a, b]
                $name .= $this->_text($nameEl, $nameEl);
            }
            $defaultValue = null;
            if (isset($part[$k+1]) && $part[$k+1]->type === 'operator' && $part[$k+1]->name === '=' && isset($part[$k+2])) {
                $defaultValue = $this->_text($part[$k+2], end($part));
            }
            $args[] = (object)['name' => $name, 'defaultValue' => $defaultValue];
        }
        return $args;
    }

    /**
     * Klasse auslesen
     * Erwartet wird: [Kommentare] name = class nameInt [extends basis] { ... }
     * @param stdClass $command
     * @param int $pos  Position des Schlüsselworts class
     * @return stdClass|null
     */
    protected function _parseClass(stdClass $command, int $pos): ?stdClass {
        $els = $command->elements;

        $eq = $els[$pos-1] ?? null;
        $nameEl = $els[$pos-2] ?? null;
        if (!$eq || $eq->type !== 'operator' || $eq->name !== '=' || !$nameEl || $nameEl->type !== 'variable') {
            return null;
        }

        $cls = new stdClass();
        $cls->name = preg_replace('/^window\./', '', $nameEl->name);
        $cls->nameInt = '';
        $cls->extends = '';
        $cls->line = $nameEl->lineNo;
        $cls->doc = null;

        // Kommentare vor der Klasse: der letzte JSDoc-Kommentar ist der Klassenkommentar
        for ($i=$pos-3; $i>=0; $i--) {
            if ($els[$i]->type !== 'comment') {
                break;
            }
            if (DocComment::isDocComment($els[$i])) {
                $cls->doc = DocComment::parse(substr($els[$i]->comment, 1));
                break;
            }
        }

        $i = $pos + 1;
        if (($els[$i] ?? null) && $els[$i]->type === 'variable') {
            $cls->nameInt = $els[$i]->name;
            $i++;
        }
        if (($els[$i] ?? null) && $els[$i]->type === 'keyword' && $els[$i]->name === 'extends') {
            $cls->extends = $els[$i+1]->name ?? '';
            $i += 2;
        }
        $body = $els[$i] ?? null;
        if (!$body || $body->type !== 'commandGroup') {
            return null;
        }

        // Members
        $members = [];
        foreach ($body->elements as $cmd) {
            $this->_parseClassBody($cmd, $members);
        }

        // Configs aus dem Constructor
        $configMap = [];
        $defaultConfig = [];
        foreach ($members as $mem) {
            if ($mem->kind === 'method' && $mem->name === 'constructor') {
                $this->_findConfigs($mem->body, $configMap, $defaultConfig);
            }
        }

        // Events
        $events = [];
        foreach ($members as $mem) {
            if ($mem->body) {
                $this->_findEvents($mem->body, $mem->name, $events);
            }
        }

        return $this->_buildClass($cls, $members, $configMap, $defaultConfig, $events);
    }

    /**
     * Liest die Members aus einem command im Klassenkörper
     * (Funktionen, Getter, Setter und Felder)
     * @param stdClass $cmd
     * @param array $members
     */
    protected function _parseClassBody(stdClass $cmd, array &$members): void {
        $els = $cmd->elements;
        $count = count($els);
        $comments = [];
        $mods = [];
        $startLine = null;  // Zeile des ersten Modifikators bzw. des Namens

        for ($i=0; $i<$count; $i++) {
            $el = $els[$i];

            if ($el->type === 'comment') {
                $comments[] = $el;
                continue;
            }

            $next = $this->_nextEl($cmd, $i);

            // Modifikatoren (nur wenn danach ein Name folgt, sonst ist es der Name selbst)
            if ($el->type === 'keyword' && in_array($el->name, ['static', 'async', 'get', 'set'])
                    && $next && ($next->type === 'variable' || $next->type === 'keyword' || ($next->type === 'operator' && $next->name === '*'))) {
                $mods[] = $el->name;
                $startLine = $startLine ?? $el->lineNo;
                continue;
            }
            // Generator *name()
            if ($el->type === 'operator' && $el->name === '*') {
                continue;
            }
            // static { ... }
            if ($el->type === 'commandGroup') {
                $comments = [];
                $mods = [];
                $startLine = null;
                continue;
            }

            if ($el->type !== 'variable' && $el->type !== 'keyword' && $el->type !== 'string') {
                // unbekannt: überspringen
                $comments = [];
                $mods = [];
                $startLine = null;
                continue;
            }

            $name = $el->type === 'string' ? $el->string : $el->name;
            $mem = new stdClass();
            $mem->name = $name;
            $mem->isStatic = in_array('static', $mods);
            $mem->isAsync = in_array('async', $mods);
            $mem->visibility = str_starts_with($name, '#') ? 'private' : (str_starts_with($name, '_') ? 'protected' : 'public');
            $mem->line = $el->lineNo;
            $mem->arguments = [];
            $mem->body = null;
            $mem->value = null;

            if ($next && $next->type === 'group') {
                // Funktion, Getter oder Setter
                $mem->kind = in_array('get', $mods) ? 'get' : (in_array('set', $mods) ? 'set' : 'method');
                $mem->arguments = $this->_parseArguments($next);
                $i = array_search($next, $els, true);
                $bodyEl = $this->_nextEl($cmd, $i);
                if ($bodyEl && $bodyEl->type === 'commandGroup') {
                    $mem->body = $bodyEl;
                    $i = array_search($bodyEl, $els, true);
                }
            } else {
                // Feld: name = Wert (bis zum Ende des commands)
                $mem->kind = 'field';
                if ($next && $next->type === 'operator' && $next->name === '=') {
                    $k = array_search($next, $els, true);
                    $valueEls = $this->_withoutComments(array_slice($els, $k+1));
                    if ($valueEls) {
                        $mem->value = $this->_text($valueEls[0], end($valueEls));
                    }
                }
                $i = $count;
            }

            $this->_applyMemberComments($mem, $comments, $startLine ?? $mem->line);

            if ($mem->visibility !== 'private') {
                $members[] = $mem;
            }

            $comments = [];
            $mods = [];
            $startLine = null;
        }
    }

    /**
     * Liest den Kommentar zu einem Eintrag der configMap (Format // {Typ} Text).
     * Kommentare ohne {Typ} sind normale Code-Kommentare und werden ignoriert.
     * @param stdClass $entry
     * @return stdClass|null  {type, description}
     */
    protected function _parseConfigComment(stdClass $entry): ?stdClass {
        $texts = array_merge($entry->commentsAbove, $entry->commentsAfter);
        if (!$texts) {
            return null;
        }
        // Kommentar am Zeilenende hat Vorrang
        if ($entry->commentsAfter) {
            $typed = DocComment::parseTypedLine(implode(' ', $entry->commentsAfter));
            if ($typed) {
                return $typed;
            }
        }
        if ($entry->commentsAbove) {
            $typed = DocComment::parseTypedLine($entry->commentsAbove[0]);
            if ($typed) {
                $rest = array_slice($entry->commentsAbove, 1);
                if ($rest) {
                    $typed->description = trim($typed->description . "\n" . implode("\n", $rest));
                }
                return $typed;
            }
        }
        return null;
    }

    /**
     * Wertet den Wert eines configMap-Eintrags aus
     *   true             -> gleichnamige Eigenschaft
     *   'xy'             -> Eigenschaft xy
     *   { target, fn, context, prio }
     *   false            -> Config ist deaktiviert
     * @param stdClass $entry
     * @return stdClass|false
     */
    protected function _parseConfigMapping(stdClass $entry): stdClass|false {
        $map = (object)['target' => null, 'fn' => null, 'context' => null, 'prio' => null];

        $v = $entry->valueEls;
        if (count($v) === 1 && $v[0]->type === 'keyword' && $v[0]->name === 'false') {
            return false;
        }
        if (count($v) === 1 && $v[0]->type === 'keyword' && $v[0]->name === 'true') {
            $map->target = $entry->name;
        } elseif (count($v) === 1 && $v[0]->type === 'string') {
            $map->target = $v[0]->string;
        } elseif (count($v) === 1 && $v[0]->type === 'commandGroup') {
            foreach ($this->_parseObjectLiteral($v[0]) as $sub) {
                if (property_exists($map, $sub->name)) {
                    $val = count($sub->valueEls) === 1 && $sub->valueEls[0]->type === 'string' ? $sub->valueEls[0]->string : $sub->value;
                    $map->{$sub->name} = $val;
                }
            }
        } else {
            $map->target = $entry->value;
        }
        return $map;
    }

    /**
     * Zerlegt ein Objekt-Literal { a: 1, b: 2 } in seine Einträge.
     * Kommentare über einem Eintrag gehören zu diesem, Kommentare auf der
     * gleichen Zeile nach dem Komma gehören zum vorherigen Eintrag.
     * @param stdClass $commandGroup
     * @return array
     */
    protected function _parseObjectLiteral(stdClass $commandGroup): array {
        $entries = [];
        $cmd = $commandGroup->elements[0] ?? null;
        if (!$cmd || $cmd->type !== 'command') {
            return $entries;
        }

        $cur = null;            // aktueller Eintrag
        $prev = null;           // vorheriger, abgeschlossener Eintrag
        $prevEndLine = null;    // Zeile, auf der der vorherige Eintrag endet (Komma)
        $above = [];            // Kommentare für den nächsten Eintrag
        $aboveLastLine = null;

        $finish = function() use (&$cur, &$prev, &$entries): void {
            if ($cur) {
                if ($cur->valueEls) {
                    $cur->value = $this->_text($cur->valueEls[0], end($cur->valueEls));
                }
                $entries[] = $cur;
                $prev = $cur;
                $cur = null;
            }
        };

        foreach ($cmd->elements as $el) {
            if ($el->type === 'comment') {
                $text = trim($el->comment);
                if ($el->commentType === '/*') {
                    continue;
                }
                if ($cur && $cur->state === 'value' && $cur->valueEls) {
                    // Kommentar am Ende des letzten Eintrags (ohne Komma)
                    if ($el->lineNo === $this->_lineOf(end($cur->valueEls)->filePosEnd)) {
                        $cur->commentsAfter[] = $text;
                    }
                } elseif ($prev && $el->lineNo === $prevEndLine) {
                    $prev->commentsAfter[] = $text;
                } else {
                    if ($aboveLastLine !== null && $el->lineNo !== $aboveLastLine + 1) {
                        $above = [];    // Leerzeile dazwischen: gehört nicht dazu
                    }
                    $above[] = $text;
                    $aboveLastLine = $el->lineNo;
                }
                continue;
            }

            if ($el->type === 'operator' && $el->name === ',') {
                $finish();
                $prevEndLine = $el->lineNo;
                continue;
            }

            if (!$cur) {
                $cur = (object)[
                    'name' => $el->type === 'string' ? $el->string : ($el->name ?? ''),
                    'value' => null,
                    'valueEls' => [],
                    'commentsAbove' => ($aboveLastLine === $el->lineNo - 1) ? $above : [],
                    'commentsAfter' => [],
                    'line' => $el->lineNo,
                    'state' => 'key'
                ];
                $above = [];
                $aboveLastLine = null;
                continue;
            }

            if ($cur->state === 'key' && $el->type === 'operator' && $el->name === ':') {
                $cur->state = 'value';
                continue;
            }
            if ($cur->state === 'value') {
                $cur->valueEls[] = $el;
            }
        }
        $finish();

        foreach ($entries as $e) {
            unset($e->state);
        }
        return $entries;
    }

    /**
     * Teilt eine Liste von Elementen bei den Kommas auf
     * @param array $tokens
     * @return array
     */
    protected function _splitByComma(array $tokens): array {
        $parts = [[]];
        foreach ($tokens as $t) {
            if ($t->type === 'operator' && $t->name === ',') {
                $parts[] = [];
            } else {
                $parts[count($parts)-1][] = $t;
            }
        }
        return $parts;
    }

    /**
     * Gibt den Quelltext von einem Element bis zu einem anderen zurück
     * @param stdClass $fromEl
     * @param stdClass $toEl
     * @return string
     */
    protected function _text(stdClass $fromEl, stdClass $toEl): string {
        $end = $toEl->filePosEnd ?? $toEl->filePos;
        return trim(substr($this->_content, $fromEl->filePos, $end - $fromEl->filePos));
    }

    /**
     * Entfernt die Kommentare aus einer Liste von Elementen
     * @param array $elements
     * @return array
     */
    protected function _withoutComments(array $elements): array {
        return array_values(array_filter($elements, fn($el) => $el->type !== 'comment'));
    }

}
