<?php
declare(strict_types=1);

/**
 * Übersetzt Texte der Home-App auf dem Server, analog zu kijs.getText().
 * Die Sprache kommt als GET-Parameter lang (z.B. 'fr-CH'), die Übersetzungen aus
 * tools/kilang/data/home_xx.php (gleiche Dateien wie im Browser).
 */
class HomeLang {

    // --------------------------------------------------------------
    // STATICS
    // --------------------------------------------------------------
    private static ?array $_texts = null;


    // --------------------------------------------------------------
    // PUBLIC STATIC METHODS
    // --------------------------------------------------------------
    /**
     * Gibt die Sprache des Aufrufs ohne Region zurück (z.B. 'fr-CH' -> 'fr')
     * @return string  zweistelliges Sprachkürzel, Standard 'de'
     */
    public static function getLanguage(): string {
        $lang = strtolower(explode('-', (string)filter_input(INPUT_GET, 'lang'))[0]);
        return preg_match('/^[a-z]{2}$/', $lang) ? $lang : 'de';
    }

    /**
     * Übersetzt einen Text in die Sprache des Aufrufs
     * @param string $key       deutscher Text
     * @param string $variant   Variante (optional)
     * @param mixed $args       Argument oder Array mit Argumenten für %1, %2 ... (optional)
     * @return string
     */
    public static function getText(string $key, string $variant='', mixed $args=null): string {
        if (self::$_texts === null) {
            self::$_texts = self::_loadTexts(self::getLanguage());
        }

        $text = self::$_texts[$key] ?? $key;

        // Evtl. sind Varianten vorhanden
        if (is_array($text)) {
            $text = $text[$variant] ?? $text[''] ?? $key;
        }

        // Argumente in umgekehrter Reihenfolge ersetzen, damit %11 nicht von %1 ersetzt wird
        if ($args !== null) {
            $args = is_array($args) ? $args : [$args];
            for ($i = count($args); $i > 0; $i--) {
                $text = str_replace('%' . $i, (string)$args[$i - 1], $text);
            }
        }

        return (string)$text;
    }


    // --------------------------------------------------------------
    // PRIVATE STATIC METHODS
    // --------------------------------------------------------------
    /**
     * Lädt die Übersetzungen einer Sprache
     * @param string $lang  zweistelliges Sprachkürzel
     * @return array  leer bei Deutsch oder wenn es keine Sprachdatei gibt
     */
    private static function _loadTexts(string $lang): array {
        $file = __DIR__ . '/../../tools/kilang/data/home_' . $lang . '.php';
        if ($lang === 'de' || !is_file($file)) {
            return [];
        }

        $translations = [];
        include $file;
        return $translations[$lang] ?? [];
    }
}
