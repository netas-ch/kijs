<?php
require_once __DIR__ . '/FileParser.php';
require_once __DIR__ . '/DocComment.php';
require_once __DIR__ . '/ClassParser.php';

/**
 * Parst alle Javascript-Dateien von kijs (gemäss files.json), übernimmt fehlende
 * Doku von Basisklassen und erstellt den Lückenbericht.
 *
 * Verwendung:
 *   $pp = new ProjectParser('/pfad/zu/kijs');
 *   $result = $pp->parseAll();
 *
 * Für das Update in Schritten (Fortschrittsanzeige) können die Dateien auch
 * einzeln mit parseFile() geparst und am Schluss mit resolve() verarbeitet werden.
 */
class ProjectParser {
    protected $_root = '';


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    /**
     * @param string $root  Verzeichnis von kijs (mit files.json)
     */
    public function __construct($root) {
        $this->_root = rtrim($root, '/');
    }


    // --------------------------------------------------------------
    // PUBLIC
    // --------------------------------------------------------------
    /**
     * Gibt die Liste aller Javascript-Dateien aus files.json zurück
     * @return array  [{module, file}, ...]
     */
    public function getFiles() {
        $json = json_decode(file_get_contents($this->_root . '/files.json'));
        if (!$json || !isset($json->js)) {
            throw new Exception('files.json konnte nicht gelesen werden');
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
     * Parst alle Dateien und verarbeitet das Ergebnis
     * @return stdClass  {classes, issues, errors, stats}
     */
    public function parseAll() {
        $start = microtime(true);
        $classes = [];
        $errors = [];
        $files = $this->getFiles();

        foreach ($files as $f) {
            try {
                foreach ($this->parseFile($f->module, $f->file) as $cls) {
                    $classes[] = $cls;
                }
            } catch (Exception $ex) {
                $errors[] = (object)['file' => $f->file, 'message' => $ex->getMessage()];
            }
        }

        $result = $this->resolve($classes);
        $result->errors = array_merge($result->errors, $errors);
        $result->stats = (object)[
            'files' => count($files),
            'classes' => count($result->classes),
            'issues' => count($result->issues),
            'errors' => count($result->errors),
            'seconds' => round(microtime(true) - $start, 2)
        ];
        return $result;
    }

    /**
     * Parst eine Datei und gibt deren Klassen zurück
     * @param string $module
     * @param string $file  Pfad relativ zum kijs-Verzeichnis
     * @return array
     */
    public function parseFile($module, $file) {
        $path = $this->_root . '/' . $file;
        $content = file_get_contents($path);
        if ($content === false) {
            throw new Exception('Datei konnte nicht gelesen werden: ' . $file);
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
    public function resolve($classes) {
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
        }

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
     * Sucht einen dokumentierten Member mit dem gleichen Namen in den Basisklassen
     * @param array $byName
     * @param stdClass $cls
     * @param string $listName  'functions' oder 'properties'
     * @param string $name
     * @param boolean $isStatic
     * @return stdClass|null  {className, member}
     */
    protected function _findInBase($byName, $cls, $listName, $name, $isStatic) {
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
    protected function _getIssues($cls) {
        $issues = [];
        $add = function($type, $member, $message) use (&$issues, $cls) {
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

}
