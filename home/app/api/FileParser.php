<?php
/**
 * kijs Javascript file parser
 * Zerlegt eine Javascript-Datei in einen Baum aus Elementen für die API-Dokumentation.
 *
 * Übernommen aus kijs-api (2021) und angepasst:
 *  - arbeitet mit Byte-Positionen statt mb_substr (alle Trennzeichen sind ASCII,
 *    darum ist das auch bei UTF-8 korrekt und viel schneller)
 *  - Template-Literals mit ${...} und Zeichenklassen [...] in Regex
 *  - Operator => und Bezeichner mit $
 *
 * Es gibt folgende Typen von Elementen (type):
 *   TYPE          EIGENSCHAFTEN
 * - comment       comment, commentType=[//, /*]
 * - string        string, stringType=[", ', `]
 * - regexp        regexp
 * - number        value
 * - keyword       name
 * - variable      name (inkl. Punkte, z.B. 'this.raiseEvent')
 * - operator      name
 * - root          elements (unterstes Start-Element, gibt es nur einmal)
 * - command       elements (Commands werden durch ; getrennt)
 * - commandGroup  elements ({ ... })
 * - group         elements (( ... ))
 * - array         elements ([ ... ])
 *
 * Eigenschaften, die alle Elemente haben: type, lineNo, linePos, filePos, filePosEnd
 *
 * (C) 2021 by Netas AG, Gerhard Kipfer
 */
class FileParser {
    protected $_content = '';           // Inhalt der Datei
    protected $_curLinePos = 0;         // Position des 1. Zeichens der aktuellen Zeile
    protected $_elements = [];          // Baum der Elemente
    protected $_file = '';              // Aktuelle Javascript-Datei (für Fehlermeldungen)
    protected $_lineNo = 1;             // Aktuelle Zeile (beginnt mit 1 wie im Editor)
    protected $_pointerStack = [];      // Stack mit Zeigern auf das aktuelle Element und seine Eltern

    protected $_keywords = ['abstract', 'arguments', 'async', 'await', 'boolean',
                            'break', 'byte', 'case', 'catch', 'char', 'class', 'const',
                            'continue', 'debugger', 'default', 'delete', 'do', 'double',
                            'else', 'enum', 'export', 'extends', 'false', 'final', 'finally',
                            'float', 'for', 'function', 'get', 'goto', 'if', 'implements', 'import', 'in',
                            'instanceof', 'int', 'interface', 'let', 'long', 'native', 'new', 'null',
                            'of', 'package', 'private', 'protected', 'public', 'return', 'set', 'short', 'static',
                            'super', 'switch', 'synchronized', 'this', 'throw', 'throws', 'transient',
                            'true', 'try', 'typeof', 'var', 'void', 'volatile', 'while', 'with', 'yield'];

    protected $_operators = ['++', '+=', '+', '--', '-=', '-', '**=', '**', '*=', '*', '/=', '/',
                             '%=', '%', '>>>=', '>>>', '>>=', '>>', '<<=', '<<', '>=', '>', '<=', '<',
                             '===', '!==', '==', '!=', '=>', '=', '!', '&&=', '&&', '||=', '||', '|>',
                             '??=', '??', '?.', '?', '&=', '&', '|=', '|', '^=', '^', '...', '~', ':', '.', ',', '@'];

    // Nach diesen Operatoren und Schlüsselwörtern beginnt ein / einen regulären Ausdruck
    protected $_regexpAfterOperators = ['=', '==', '===', '!=', '!==', '=>', '&&', '||', '??', '?', ':', ',', '!', '+', '-', '*', '<', '>', '<=', '>='];
    protected $_regexpAfterKeywords = ['return', 'typeof', 'case', 'in', 'of', 'yield', 'await'];


    // --------------------------------------------------------------
    // PUBLIC
    // --------------------------------------------------------------
    /**
     * Gibt den Dateiinhalt zurück
     * @return string
     */
    public function getContent() {
        return $this->_content;
    }

    /**
     * Parst einen Javascript-String
     * @param string $content
     * @param string $file  Dateiname für Fehlermeldungen
     * @return array  Array mit dem root-Element
     */
    public function parseContent($content, $file='') {
        $this->_content = $content;
        $this->_curLinePos = 0;
        $this->_elements = [];
        $this->_file = $file;
        $this->_lineNo = 1;
        $this->_pointerStack = [];

        $this->_parseContent();

        return $this->_elements;
    }

    /**
     * Parst eine Datei
     * @param string $file  Pfad auf die gewünschte Datei
     * @return array  Array mit dem root-Element
     */
    public function parseFile($file) {
        $content = file_get_contents($file);
        if ($content === false) {
            throw new Exception('Datei konnte nicht gelesen werden: ' . $file);
        }
        return $this->parseContent($content, $file);
    }


    // --------------------------------------------------------------
    // PROTECTED
    // --------------------------------------------------------------
    /**
     * Ist das aktuelle Element ein Text-Element (Kommentar, String, Regex)?
     * Dann wird das Zeichen einfach angehängt.
     * @param stdClass $curEl
     * @param string $text
     * @return boolean
     */
    protected function _appendText($curEl, $text) {
        switch ($curEl->type) {
            case 'comment': $curEl->comment .= $text; return true;
            case 'string':  $curEl->string .= $text;  return true;
            case 'regexp':  $curEl->regexp .= $text;  return true;
        }
        return false;
    }

    /**
     * Element schliessen und zum übergeordneten Element zurückkehren
     * @param int $filePosEnd
     * @return stdClass  das neue aktuelle Element
     */
    protected function _close($filePosEnd) {
        $el = array_pop($this->_pointerStack);
        $el->filePosEnd = $filePosEnd;
        return end($this->_pointerStack);
    }

    /**
     * Erstellt ein neues Element
     * @param string $type
     * @param int $p
     * @param array $props
     * @return stdClass
     */
    protected function _createEl($type, $p, $props=[]) {
        $el = new stdClass();
        $el->type = $type;
        foreach ($props as $key => $val) {
            $el->$key = $val;
        }
        $el->lineNo = $this->_lineNo;
        $el->linePos = $p - $this->_curLinePos + 1;
        $el->filePos = $p;
        $el->filePosEnd = null;
        return $el;
    }

    /**
     * Gibt eine Exception mit Datei und Position zurück
     * @param string $msg
     * @param int $p
     * @return Exception
     */
    protected function _error($msg, $p) {
        return new Exception('Syntax Fehler: ' . $msg . ' (' . $this->_file . ' ' . $this->_lineNo . ':' . ($p - $this->_curLinePos + 1) . ')');
    }

    /**
     * Beginnt an dieser Stelle ein regulärer Ausdruck (und keine Division)?
     * Das ist der Fall am Anfang einer Gruppierung oder nach bestimmten
     * Operatoren und Schlüsselwörtern.
     * @param stdClass $curEl
     * @return boolean
     */
    protected function _isRegexpStart($curEl) {
        // letztes Element, das kein Kommentar ist
        $previousEl = null;
        for ($i=count($curEl->elements)-1; $i>=0; $i--) {
            if ($curEl->elements[$i]->type !== 'comment') {
                $previousEl = $curEl->elements[$i];
                break;
            }
        }

        if (!$previousEl) {
            return true;
        }
        if ($previousEl->type === 'operator' && in_array($previousEl->name, $this->_regexpAfterOperators)) {
            return true;
        }
        if ($previousEl->type === 'keyword' && in_array($previousEl->name, $this->_regexpAfterKeywords)) {
            return true;
        }
        return false;
    }

    /**
     * Öffnet ein Element mit Unterelementen und macht es zum aktuellen Element
     * @param stdClass $curEl
     * @param stdClass $el
     * @return stdClass
     */
    protected function _open($curEl, $el) {
        $curEl->elements[] = $el;
        $this->_pointerStack[] = $el;
        return $el;
    }

    /**
     * Parst den Dateiinhalt
     * @throws Exception
     */
    protected function _parseContent() {
        $c = $this->_content;
        $len = strlen($c);
        $p = 0;
        $m = null;

        // root und erstes command
        $root = $this->_createEl('root', $p, ['elements' => []]);
        $this->_elements[] = $root;
        $this->_pointerStack[] = $root;
        $curEl = $this->_open($root, $this->_createEl('command', $p, ['elements' => []]));

        while ($p < $len) {
            $cc = $c[$p];

            // Escape-Zeichen \ -> Das nächste Zeichen gehört mit dazu
            if ($cc === '\\') {
                $chars = substr($c, $p, 2);
                if ($curEl->type === 'regexp' || $curEl->type === 'string' || $curEl->type === 'comment') {
                    $this->_appendText($curEl, $chars);
                } else {
                    throw $this->_error('Escape-Zeichen \\ ausserhalb eines Kommentars, Strings oder regulären Ausdrucks', $p);
                }
                if (substr($chars, 1) === "\n") {
                    $this->_lineNo++;
                    $this->_curLinePos = $p + 2;
                }
                $p += 2;
                continue;
            }

            // Zeilenumbruch
            if ($cc === "\n" || ($cc === "\r" && ($c[$p+1] ?? '') === "\n")) {
                $nl = $cc === "\r" ? "\r\n" : "\n";
                if ($curEl->type === 'comment' && $curEl->commentType === '//') {
                    $curEl = $this->_close($p);
                } elseif ($curEl->type === 'comment') {
                    $curEl->comment .= "\n";
                } else {
                    $this->_appendText($curEl, $nl);
                }
                $p += strlen($nl);
                $this->_lineNo++;
                $this->_curLinePos = $p;
                continue;
            }

            // Innerhalb eines Kommentars: nur auf das Ende achten
            if ($curEl->type === 'comment') {
                if ($curEl->commentType === '/*' && $cc === '*' && ($c[$p+1] ?? '') === '/') {
                    $curEl = $this->_close($p + 2);
                    $p += 2;
                } else {
                    $curEl->comment .= $cc;
                    $p++;
                }
                continue;
            }

            // Innerhalb eines Strings: auf das Ende und bei `...` auf ${ achten
            if ($curEl->type === 'string') {
                if ($cc === $curEl->stringType) {
                    $curEl = $this->_close($p + 1);
                    $p++;
                } elseif ($curEl->stringType === '`' && $cc === '$' && ($c[$p+1] ?? '') === '{') {
                    // Platzhalter ${...}: Inhalt als Code parsen, damit verschachtelte
                    // Strings und Klammern richtig erkannt werden. Er wird als
                    // commandGroup unter dem String abgelegt.
                    $curEl->string .= '${';
                    if (!isset($curEl->elements)) {
                        $curEl->elements = [];
                    }
                    $curEl = $this->_open($curEl, $this->_createEl('commandGroup', $p, ['elements' => [], 'isTemplatePlaceholder' => true]));
                    $curEl = $this->_open($curEl, $this->_createEl('command', $p, ['elements' => []]));
                    $p += 2;
                } else {
                    $curEl->string .= $cc;
                    $p++;
                }
                continue;
            }

            // Innerhalb eines regulären Ausdrucks
            if ($curEl->type === 'regexp') {
                $curEl->regexp .= $cc;
                if ($cc === '[') {
                    $curEl->inClass = true;
                } elseif ($cc === ']') {
                    $curEl->inClass = false;
                } elseif ($cc === '/' && !$curEl->inClass) {
                    $p++;
                    // Flags
                    if (preg_match('/\G[a-z]+/i', $c, $m, 0, $p)) {
                        $curEl->regexp .= $m[0];
                        $p += strlen($m[0]);
                    }
                    unset($curEl->inClass);
                    $curEl = $this->_close($p);
                    continue;
                }
                $p++;
                continue;
            }

            // Anweisungsende ;
            // Direkt in einer group ( ... ) ist es ein Trenner (for-Schleife),
            // sonst schliesst es das aktuelle command ab.
            if ($cc === ';') {
                if ($curEl->type === 'group') {
                    // Trenner
                } elseif ($curEl->type === 'command') {
                    $curEl = $this->_close($p);
                    $curEl = $this->_open($curEl, $this->_createEl('command', $p + 1, ['elements' => []]));
                } else {
                    throw $this->_error('; am falschen Ort', $p);
                }
                $p++;
                continue;
            }

            // Kommentar-Start // oder /*
            if ($cc === '/' && (($c[$p+1] ?? '') === '/' || ($c[$p+1] ?? '') === '*')) {
                $type = '/' . $c[$p+1];
                $curEl = $this->_open($curEl, $this->_createEl('comment', $p, ['commentType' => $type, 'comment' => '']));
                $p += 2;
                continue;
            }

            // String-Start
            if ($cc === '"' || $cc === "'" || $cc === '`') {
                $curEl = $this->_open($curEl, $this->_createEl('string', $p, ['stringType' => $cc, 'string' => '']));
                $p++;
                continue;
            }

            // Regulärer Ausdruck /.../ oder Division?
            if ($cc === '/' && $this->_isRegexpStart($curEl)) {
                $curEl = $this->_open($curEl, $this->_createEl('regexp', $p, ['regexp' => '/', 'inClass' => false]));
                $p++;
                continue;
            }

            // Whitespace
            if (preg_match('/\G[\t\f\x0B \r]+/', $c, $m, 0, $p)) {
                $p += strlen($m[0]);
                continue;
            }

            // Schlüsselwörter und Variablen (inkl. Punkte: this._dom.clsAdd)
            if (preg_match('/\G[#$a-z_][$\w]*(?:\.#?[$a-z_][$\w]*)*/i', $c, $m, 0, $p)) {
                $type = in_array($m[0], $this->_keywords) ? 'keyword' : 'variable';
                $el = $this->_createEl($type, $p, ['name' => $m[0]]);
                $el->filePosEnd = $p + strlen($m[0]);
                $curEl->elements[] = $el;
                $p += strlen($m[0]);
                continue;
            }

            // Zahlen
            if (preg_match('/\G(?:0b[01_]+|0x[0-9a-f_]+|0o[0-7_]+|(?:[0-9][0-9_]*\.?[0-9_]*|\.[0-9][0-9_]*)(?:e[+-]?[0-9]+)?n?)/i', $c, $m, 0, $p)) {
                $el = $this->_createEl('number', $p, ['value' => $m[0]]);
                $el->filePosEnd = $p + strlen($m[0]);
                $curEl->elements[] = $el;
                $p += strlen($m[0]);
                continue;
            }

            // Operatoren
            $operator = $this->_strStartsWith($p, $this->_operators);
            if ($operator !== false) {
                $el = $this->_createEl('operator', $p, ['name' => $operator]);
                $el->filePosEnd = $p + strlen($operator);
                $curEl->elements[] = $el;
                $p += strlen($operator);
                continue;
            }

            // Klammern öffnend
            if ($cc === '{') {
                $curEl = $this->_open($curEl, $this->_createEl('commandGroup', $p, ['elements' => []]));
                $curEl = $this->_open($curEl, $this->_createEl('command', $p + 1, ['elements' => []]));
                $p++;
                continue;
            }
            if ($cc === '(') {
                $curEl = $this->_open($curEl, $this->_createEl('group', $p, ['elements' => []]));
                $p++;
                continue;
            }
            if ($cc === '[') {
                $curEl = $this->_open($curEl, $this->_createEl('array', $p, ['elements' => []]));
                $p++;
                continue;
            }

            // Klammern schliessend
            if ($cc === '}') {
                if ($curEl->type !== 'command' || $this->_pointerStack[count($this->_pointerStack)-2]->type !== 'commandGroup') {
                    throw $this->_error('Falsches Klammerpaar zu }', $p);
                }
                // letztes command schliessen bzw. löschen, falls leer
                if (count($curEl->elements) > 0) {
                    $curEl = $this->_close($p);
                } else {
                    array_pop($this->_pointerStack);
                    $curEl = end($this->_pointerStack);
                    array_pop($curEl->elements);
                }
                $isPlaceholder = !empty($curEl->isTemplatePlaceholder);
                $curEl = $this->_close($p + 1);
                if ($isPlaceholder) {
                    // zurück im Template-String
                    $curEl->string .= '}';
                }
                $p++;
                continue;
            }
            if ($cc === ')') {
                if ($curEl->type !== 'group') {
                    throw $this->_error('Falsches Klammerpaar zu )', $p);
                }
                $curEl = $this->_close($p + 1);
                $p++;
                continue;
            }
            if ($cc === ']') {
                if ($curEl->type !== 'array') {
                    throw $this->_error('Falsches Klammerpaar zu ]', $p);
                }
                $curEl = $this->_close($p + 1);
                $p++;
                continue;
            }

            throw $this->_error('ungültiges Zeichen ' . $cc, $p);
        }

        // offenes abschliessen
        if ($curEl->type === 'comment' && $curEl->commentType === '//') {
            $curEl = $this->_close($p);
        }
        switch ($curEl->type) {
            case 'comment':      throw $this->_error('Fehlendes */', $p);
            case 'string':       throw $this->_error('Fehlendes ' . $curEl->stringType, $p);
            case 'regexp':       throw $this->_error('Fehlendes /', $p);
            case 'group':        throw $this->_error('Fehlende schliessende Klammer zu (', $p);
            case 'array':        throw $this->_error('Fehlende schliessende Klammer zu [', $p);
        }

        // letztes command abschliessen bzw. löschen, falls leer
        if ($curEl->type !== 'command' || count($this->_pointerStack) !== 2) {
            throw $this->_error('Fehlende schliessende Klammer zu {', $p);
        }
        if (count($curEl->elements) > 0) {
            $curEl = $this->_close($p);
        } else {
            array_pop($this->_pointerStack);
            $curEl = end($this->_pointerStack);
            array_pop($curEl->elements);
        }

        $curEl->filePosEnd = $p;
    }

    /**
     * Prüft, ob an der Position $p einer der Strings aus dem Array beginnt.
     * Gibt den gefundenen String zurück oder false.
     * @param int $p
     * @param array $needleArray
     * @return boolean|string
     */
    protected function _strStartsWith($p, $needleArray) {
        foreach ($needleArray as $needle) {
            if (substr_compare($this->_content, $needle, $p, strlen($needle)) === 0) {
                return $needle;
            }
        }
        return false;
    }

}
