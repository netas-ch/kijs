<?php
declare(strict_types=1);
require_once __DIR__ . '/FileParser.php';
require_once __DIR__ . '/DocComment.php';
require_once __DIR__ . '/ClassParser.php';

/**
 * Parst alle Javascript-Dateien von kijs (gemäss files.json), übernimmt fehlende
 * Doku von Basisklassen und erstellt den Lückenbericht.
 *
 * Verwendung (Update in Schritten, siehe ApiUpdate.php):
 *   $pp = new ProjectParser('/pfad/zu/kijs');
 *   foreach ($pp->getFiles() as $f) { $classes = array_merge($classes, $pp->parseFile($f->module, $f->file)); }
 *   $result = $pp->resolve($classes);
 */
class ProjectParser {
    protected string $_root = '';


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    /**
     * @param string $root  Verzeichnis von kijs (mit files.json)
     */
    public function __construct(string $root) {
        $this->_root = rtrim($root, '/');
    }


    // --------------------------------------------------------------
    // PUBLIC
    // --------------------------------------------------------------
    /**
     * Gibt die Liste aller Javascript-Dateien aus files.json zurück
     * @return array  [{module, file}, ...]
     */
    public function getFiles(): array {
        $json = json_decode(file_get_contents($this->_root . '/files.json'));
        if (!$json || !isset($json->js)) {
            throw new Exception('files.json could not be read');
        }
        $files = [];
        foreach ($json->js as $module => $list) {
            foreach ($list as $file) {
                $files[] = (object)['module' => $module, 'file' => $file];
            }
        }
        return $files;
    }

    /**
     * Parst eine Datei und gibt deren Klassen zurück
     * @param string $module
     * @param string $file  Pfad relativ zum kijs-Verzeichnis
     * @return array
     */
    public function parseFile(string $module, string $file): array {
        $path = $this->_root . '/' . $file;
        $content = file_get_contents($path);
        if ($content === false) {
            throw new Exception('File could not be read: ' . $file);
        }

        $fileParser = new FileParser();
        $elements = $fileParser->parseContent($content, $file);

        $classParser = new ClassParser();
        $classes = $classParser->parse($elements, $content, $file);
        foreach ($classes as $cls) {
            $cls->module = $module;
        }
        return $classes;
    }

    /**
     * Übernimmt fehlende Doku von den Basisklassen und erstellt den Lückenbericht
     * @param array $classes
     * @return stdClass  {classes, issues, errors}
     */
    public function resolve(array $classes): stdClass {
        $byName = [];
        $errors = [];
        foreach ($classes as $cls) {
            if (isset($byName[$cls->name])) {
                $errors[] = (object)['file' => $cls->file, 'message' => 'Klasse ' . $cls->name . ' ist doppelt deklariert (auch in ' . $byName[$cls->name]->file . ')'];
                continue;
            }
            $byName[$cls->name] = $cls;
        }

        // abgeleitete Klassen
        foreach ($byName as $cls) {
            $cls->subclasses = [];
        }
        foreach ($byName as $cls) {
            if ($cls->extends && isset($byName[$cls->extends])) {
                $byName[$cls->extends]->subclasses[] = $cls->name;
            }
        }

        // Fehlende Doku von den Basisklassen übernehmen
        foreach ($byName as $cls) {
            foreach ($cls->functions as $fn) {
                if ($fn->description === '' && $fn->docSource !== 'jsdoc') {
                    $base = $this->_findInBase($byName, $cls, 'functions', $fn->name, $fn->isStatic);
                    if ($base) {
                        $fn->description = $base->member->description;
                        $fn->returns = $fn->returns ?? $base->member->returns;
                        foreach ($fn->arguments as $arg) {
                            foreach ($base->member->arguments as $baseArg) {
                                if ($baseArg->name === $arg->name && !$arg->isDocumented) {
                                    $arg->type = $baseArg->type;
                                    $arg->description = $baseArg->description;
                                    $arg->isDocumented = $baseArg->isDocumented;
                                }
                            }
                        }
                        $fn->docSource = 'base';
                        $fn->docFrom = $base->className;
                    }
                }
            }
            foreach ($cls->properties as $prop) {
                if ($prop->description === '') {
                    $base = $this->_findInBase($byName, $cls, 'properties', $prop->name, $prop->isStatic);
                    if ($base) {
                        $prop->description = $base->member->description;
                        $prop->type = $prop->type ?? $base->member->type;
                        $prop->docSource = 'base';
                        $prop->docFrom = $base->className;
                    }
                }
            }

            // Events, die schon in einer Basisklasse dokumentiert sind (geerbte Events)
            foreach ($cls->events as $ev) {
                if (!$ev->isDocumented) {
                    $baseEv = $this->_findEventInBase($byName, $cls, $ev->name);
                    if ($baseEv) {
                        $ev->description = $baseEv->member->description;
                        $ev->isDocumented = true;
                        $ev->docFrom = $baseEv->className;
                    }
                }
            }
        }

        // Standardwerte von Configs, die an ein Unterelement weitergeleitet werden
        $this->_resolveForwardedDefaults($byName);

        // Lückenbericht
        $issues = [];
        foreach ($byName as $cls) {
            foreach ($this->_getIssues($cls) as $issue) {
                $issues[] = $issue;
            }
        }

        ksort($byName, SORT_FLAG_CASE | SORT_STRING);
        return (object)['classes' => array_values($byName), 'issues' => $issues, 'errors' => $errors];
    }


    // --------------------------------------------------------------
    // PROTECTED
    // --------------------------------------------------------------
    /**
     * Gibt den Standardwert einer Eigenschaft zurück, wie er in einer Klasse gilt: _defaultConfig
     * der Klasse oder einer Basisklasse (die unterste gewinnt), sonst der Standardwert der
     * Eigenschaft selbst (eigene oder geerbte).
     * @param array $byName
     * @param string $className
     * @param string $name
     * @return string|null
     */
    protected function _effectiveDefault(array $byName, string $className, string $name): ?string {
        $guard = 0;
        $cur = $byName[$className] ?? null;
        while ($cur && $guard++ < 50) {
            $defaultConfig = (array)($cur->defaultConfig ?? []);
            if (array_key_exists($name, $defaultConfig)) {
                return (string)$defaultConfig[$name];
            }
            foreach ($cur->properties as $prop) {
                if ($prop->name === $name && !$prop->isStatic && $prop->defaultValue !== null) {
                    return (string)$prop->defaultValue;
                }
            }
            $cur = $byName[$cur->extends] ?? null;
        }
        return null;
    }

    /**
     * Sucht ein dokumentiertes Event mit dem gleichen Namen in den Basisklassen
     * @param array $byName
     * @param stdClass $cls
     * @param string $name
     * @return stdClass|null  {className, member}
     */
    protected function _findEventInBase(array $byName, stdClass $cls, string $name): ?stdClass {
        $guard = 0;
        $base = $byName[$cls->extends] ?? null;
        while ($base && $guard++ < 50) {
            foreach ($base->events as $ev) {
                if ($ev->name === $name && $ev->isDocumented) {
                    return (object)['className' => $base->name, 'member' => $ev];
                }
            }
            $base = $byName[$base->extends] ?? null;
        }
        return null;
    }

    /**
     * Sucht einen dokumentierten Member mit dem gleichen Namen in den Basisklassen
     * @param array $byName
     * @param stdClass $cls
     * @param string $listName  'functions' oder 'properties'
     * @param string $name
     * @param boolean $isStatic
     * @return stdClass|null  {className, member}
     */
    protected function _findInBase(array $byName, stdClass $cls, string $listName, string $name, bool $isStatic): ?stdClass {
        $guard = 0;
        $base = $byName[$cls->extends] ?? null;
        while ($base && $guard++ < 50) {
            foreach ($base->$listName as $mem) {
                if ($mem->name === $name && $mem->isStatic === $isStatic && $mem->description !== '') {
                    return (object)['className' => $base->name, 'member' => $mem];
                }
            }
            $base = $byName[$base->extends] ?? null;
        }
        return null;
    }

    /**
     * Gibt die Lücken in der Doku einer Klasse zurück
     * @param stdClass $cls
     * @return array
     */
    protected function _getIssues(stdClass $cls): array {
        $issues = [];
        $add = function(string $type, ?string $member, string $message) use (&$issues, $cls): void {
            $issues[] = (object)['class' => $cls->name, 'member' => $member, 'type' => $type, 'message' => $message];
        };

        if (!$cls->hasDocComment) {
            $add('classNoDoc', null, 'Klasse ohne Klassenkommentar');
        } elseif ($cls->description === '' && !$cls->hasOldHeader) {
            $add('classNoDoc', null, 'Klassenkommentar ohne Beschreibung');
        }
        if ($cls->hasOldHeader) {
            $add('oldHeader', null, 'Alter Kopfkommentar (CONFIG-Parameter ...) vorhanden');
        }

        foreach ($cls->properties as $prop) {
            if ($prop->description === '' && $prop->visibility === 'public') {
                $kind = $prop->isConfig ? 'Config' : ($prop->isField ? 'Statische Eigenschaft' : 'Eigenschaft');
                $add('propertyNoDoc', $prop->name, $kind . ' ohne Doku');
            }
        }

        foreach ($cls->functions as $fn) {
            if ($fn->description === '' && $fn->docSource !== 'jsdoc') {
                $add('functionNoDoc', $fn->name, 'Funktion ohne JSDoc');
            } elseif ($fn->docSource === 'comment') {
                $add('functionNoJsDoc', $fn->name, 'Funktion nur mit //-Kommentar, ohne JSDoc');
            } elseif ($fn->docSource === 'jsdoc') {
                foreach ($fn->arguments as $arg) {
                    if (!$arg->isDocumented) {
                        $add('argumentNoDoc', $fn->name, 'Argument ' . $arg->name . ' ohne @param');
                    }
                }
            }
        }

        foreach ($cls->events as $ev) {
            if (!$ev->isDocumented) {
                $add('eventNoDoc', $ev->name, 'Event ohne @fires (ausgelöst in ' . implode(', ', $ev->raisedIn) . ')');
            }
        }

        return $issues;
    }


    /**
     * Löst die Standardwerte der Configs auf, die an ein Unterelement weitergeleitet werden
     * (defaultForward aus dem ClassParser): Der Wert ist der Standardwert des Ziels in der Klasse
     * des Unterelements. In mehreren Durchgängen, damit auch Ketten aufgelöst werden.
     * @param array $byName
     */
    protected function _resolveForwardedDefaults(array $byName): void {
        for ($pass = 0; $pass < 5; $pass++) {
            $changed = false;
            foreach ($byName as $cls) {
                foreach ($cls->properties as $prop) {
                    $fwd = $prop->defaultForward ?? null;
                    if (!$fwd || $prop->defaultValue !== null) {
                        continue;
                    }
                    $value = $this->_effectiveDefault($byName, $fwd->class, $fwd->member);
                    if ($value !== null) {
                        $prop->defaultValue = $value;
                        $prop->defaultFrom = $fwd->class . '.' . $fwd->member;
                        $changed = true;
                    }
                }
            }
            if (!$changed) {
                break;
            }
        }
    }

}
