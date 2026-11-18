<?php
declare(strict_types=1);
/**
 * Zerlegt einen JSDoc-Kommentar (/** ... * /) in Beschreibung und Tags.
 *
 * Unterstützte Tags: @deprecated, @example, @fires, @param, @returns (@return),
 * @see, @type. Unbekannte Tags werden unter 'other' abgelegt.
 */
class DocComment {

    // Überschriften des alten Kopfkommentars. Ab hier wird die Beschreibung
    // nicht mehr übernommen.
    protected static array $_oldHeaderSections = ['CONFIG-Parameter', 'FUNKTIONEN', 'EIGENSCHAFTEN', 'EVENTS'];


    // --------------------------------------------------------------
    // PUBLIC
    // --------------------------------------------------------------
    /**
     * Ist der Kommentar ein JSDoc-Kommentar (/** ...)?
     * @param stdClass $commentEl  Kommentar-Element aus dem FileParser
     * @return boolean
     */
    public static function isDocComment(stdClass $commentEl): bool {
        return $commentEl->type === 'comment' && $commentEl->commentType === '/*'
                && str_starts_with($commentEl->comment, '*')
                && !str_starts_with($commentEl->comment, '**');
    }

    /**
     * Zerlegt einen JSDoc-Kommentar
     * @param string $comment  Text nach /* (ohne * /)
     * @return stdClass
     */
    public static function parse(string $comment): stdClass {
        $doc = new stdClass();
        $doc->description = '';
        $doc->deprecated = null;
        $doc->examples = [];
        $doc->fires = [];
        $doc->hasOldHeader = false;
        $doc->other = [];
        $doc->params = [];
        $doc->returns = null;
        $doc->see = [];
        $doc->type = null;

        // Zeilen ohne führendes * aufbereiten
        $lines = preg_split('/\r?\n/', $comment);
        $clean = [];
        foreach ($lines as $line) {
            $clean[] = preg_replace('/^\s*\*+ ?/', '', $line);
        }

        // In Beschreibung und Tags aufteilen
        $descLines = [];
        $tags = [];
        $cur = null;
        foreach ($clean as $line) {
            if (preg_match('/^\s*@(\w+)\s?(.*)$/', $line, $m)) {
                $cur = (object)['name' => $m[1], 'lines' => [$m[2]]];
                $tags[] = $cur;
            } elseif ($cur) {
                $cur->lines[] = $line;
            } else {
                $descLines[] = $line;
            }
        }

        // Alter Kopfkommentar: Beschreibung nur bis zur ersten alten Überschrift
        foreach ($descLines as $i => $line) {
            if (in_array(trim($line), self::$_oldHeaderSections)) {
                $doc->hasOldHeader = true;
                $descLines = array_slice($descLines, 0, $i);
                break;
            }
        }

        $doc->description = self::_trimLines($descLines);

        foreach ($tags as $tag) {
            $text = self::_trimLines($tag->lines);
            switch ($tag->name) {
                case 'deprecated':
                    $doc->deprecated = $text;
                    break;

                case 'example':
                    $doc->examples[] = self::_trimLines($tag->lines, false);
                    break;

                case 'fires':
                case 'event':
                    if (preg_match('/^(\S+)\s*(.*)$/s', $text, $m)) {
                        $doc->fires[] = (object)['name' => $m[1], 'description' => trim($m[2])];
                    }
                    break;

                case 'param':
                    $doc->params[] = self::_parseParam($text);
                    break;

                case 'return':
                case 'returns':
                    [$type, $rest] = self::_splitType($text);
                    $doc->returns = (object)['type' => $type, 'description' => $rest];
                    break;

                case 'see':
                    $doc->see[] = $text;
                    break;

                case 'type':
                    [$type, $rest] = self::_splitType($text);
                    $doc->type = $type;
                    if ($rest !== '' && $doc->description === '') {
                        $doc->description = $rest;
                    }
                    break;

                default:
                    $doc->other[] = (object)['name' => $tag->name, 'text' => $text];
            }
        }

        return $doc;
    }

    /**
     * Zerlegt einen Zeilenkommentar im Format "{Typ} Beschreibung"
     * @param string $text
     * @return stdClass|null  {type, description} oder null, falls kein Typ angegeben ist
     */
    public static function parseTypedLine(string $text): ?stdClass {
        $text = trim($text);
        if (!str_starts_with($text, '{')) {
            return null;
        }
        [$type, $rest] = self::_splitType($text);
        if ($type === null) {
            return null;
        }
        return (object)['type' => $type, 'description' => $rest];
    }


    // --------------------------------------------------------------
    // PROTECTED
    // --------------------------------------------------------------
    /**
     * Zerlegt den Text eines @param-Tags
     * Formate: {Typ} name Beschreibung, {Typ} [name] ..., {Typ} [name=default] ...
     * @param string $text
     * @return stdClass
     */
    protected static function _parseParam(string $text): stdClass {
        [$type, $rest] = self::_splitType($text);

        $param = (object)['name' => '', 'type' => $type, 'isOptional' => false, 'defaultValue' => null, 'description' => ''];

        if (preg_match('/^\[([^\]=]+)(?:=([^\]]*))?\]\s*(.*)$/s', $rest, $m)) {
            $param->name = trim($m[1]);
            $param->isOptional = true;
            $param->defaultValue = isset($m[2]) && $m[2] !== '' ? trim($m[2]) : null;
            $param->description = trim($m[3]);
        } elseif (preg_match('/^(\S+)\s*(.*)$/s', $rest, $m)) {
            $param->name = $m[1];
            $param->description = trim($m[2]);
        }
        return $param;
    }

    /**
     * Trennt einen Typ in geschweiften Klammern vom Rest ab. Verschachtelte
     * Klammern (z.B. {Object<String, {a:Number}>}) werden berücksichtigt.
     * @param string $text
     * @return array  [Typ oder null, Rest]
     */
    protected static function _splitType(string $text): array {
        $text = ltrim($text);
        if (!str_starts_with($text, '{')) {
            return [null, trim($text)];
        }
        $depth = 0;
        for ($i=0; $i<strlen($text); $i++) {
            if ($text[$i] === '{') {
                $depth++;
            } elseif ($text[$i] === '}') {
                $depth--;
                if ($depth === 0) {
                    return [trim(substr($text, 1, $i-1)), trim(substr($text, $i+1))];
                }
            }
        }
        return [null, trim($text)];
    }

    /**
     * Fügt Zeilen zusammen und entfernt leere Zeilen am Anfang und Ende
     * @param array $lines
     * @param boolean $trimEachLine  Einrückung entfernen? (nicht bei Beispielcode)
     * @return string
     */
    protected static function _trimLines(array $lines, bool $trimEachLine=true): string {
        if ($trimEachLine) {
            $lines = array_map('rtrim', $lines);
        }
        while (count($lines) && trim($lines[0]) === '') {
            array_shift($lines);
        }
        while (count($lines) && trim(end($lines)) === '') {
            array_pop($lines);
        }
        return implode("\n", $lines);
    }

}
