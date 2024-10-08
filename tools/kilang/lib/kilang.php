<?php
// kilang Stand: 26.08.2024
class KiLang {


    // -------------------------------------------------------
    // Public Static Methods
    // -------------------------------------------------------

    /**
     *
     * @param string $key               Text
     * @param string $variant           Varianten-Bezeichnung
     * @param string $usageGrpName      Name der usages-Eigenschaft. Bsp:'usagesPhp'
     * @param string $usageName         Wert der usages-Eigenschaft. Bsp:'app/php/client.js'
     * @param string $customerName      Name des Kunden. Bsp:'Muster AG' oder Setting: default/default
     * @param array $usages             Hier kann ein bestehendes Array oder ein leeres Array übergeben werden
     */
    public static function addUsage($key,
                                    $variant,
                                    $usageGrpName,
                                    $usageName,
                                    $customerName,
                                    &$usages
    ) {
        self::_addUsage($usages, $key, $variant, $usageGrpName, $usageName, $customerName);
    }

    /**
     * Durchsucht einen String mit PHP/JS-Code nach getText()-Aufrufen und gibt sie in einem Array zurück
     *
     * @param string $code              Text in dem gesucht wird
     * @param string $usageGrpName      Name der usages-Eigenschaft. Bsp:'usagesPhp'
     * @param string $usageName         Wert der usages-Eigenschaft. Bsp:'app/php/client.js'
     * @param string $fnName            Name der Funktion, wie er im Quellcode verwendet wird als Regulärer Ausdruck.
     *                                  Beispiele: '\\$app->translate' für PHP und 'app.translate' für JS
     *                                  Es können auch mehrere angegeben werden: '\\$app->translate|\\$this->_app->translate'
     * @param array $usages             Hier kann ein bestehendes Array oder ein leeres Array übergeben werden
     * @throws \Exception
     */
    public static function browseCode($code,
                                      $usageGrpName,
                                      $usageName,
                                      $fnName,
                                      &$usages
    ) {

        // Suche alle getText() aufrufe

        // RegExp für Key und Variant
        $reg1 = "'(?:[^'\\\\]|\\\\.)*'";
        $reg2 = '"(?:[^"\\\\]|\\\\.)*"';
        $reg   = "(?:(?:$reg1|$reg2)*[\\s\\.\\+]*)*";
        unset($reg1, $reg2);

        // RegExp für Mehrzeilige Keys
        $subReg1 = "'(?:[^'\\\\]|\\\\.)*'";
        $subReg2 = '"(?:[^"\\\\]|\\\\.)*"';

        $matches = null;
        // $fnName $reg  $reg
        // getText($key, $variant='', $args=null, $languageId=null)
        if (preg_match_all("/(?:$fnName)\\s*\\(\\s*($reg)\\s*,?\\s*($reg)?/",
                $code, $matches, PREG_SET_ORDER | PREG_OFFSET_CAPTURE)) {

            // Treffer durchgehen, validieren und als Array zurückgeben
            foreach ($matches as $match) {
                $pos = $match[0][1];
                $key = $match[1][0];
                $variant = $match[2][0];
                $error = '';

                // Mehrzeilige Texte in einen String umwandeln
                $subMatches = null;
                if (preg_match_all("/$subReg1|$subReg2/", $key, $subMatches, PREG_SET_ORDER)) {

                    // Einzelne zeilen zusammenfügen
                    $key = '';
                    foreach ($subMatches as $subMatch) {

                        // Gänsefüsschen am Anfang und Ende entfernen
                        $key .= substr($subMatch[0], 1, -1);
                    }

                    // \n in Zeilenumbrüche umwandeln
                    $key = str_replace("\\n", "\n", $key);

                    // Maskierungen entfernen
                    $key = stripslashes($key);
                }

                // Zeilennummer anhand der Position im String und der Anzahl Zeilenumbrüche berechnen
                $lineNo = substr_count(mb_substr($code, 0, $pos), "\n") + 1;

                // Bei falschen Argumenten Fehler ausgeben
                if ($error) {
                    throw new Exception("Falscher Funktionsaufruf von getText(): $error ($usageName Zeile $lineNo)");
                }

                if (strlen($variant) >= 2) {
                    $variant = substr($variant, 1, -1);
                    $variant = stripslashes($variant);
                }

                if ($key) {
                    self::_addUsage($usages, $key, $variant, $usageGrpName, $usageName, $lineNo);
                }
            }
        }
    }


    /**
     * Durchsucht einen JSON-String oder Object nach Eigenschaften, die Überstzt werden können und gibt sie in einem Array zurück
     *
     * @param string|Object $json       JSON-String oder Object
     * @param string $usageGrpName      Name der usages-Eigenschaft. Bsp:'usagesSetting'
     * @param string $usageName         Wert der usages-Eigenschaft. Bsp:'address.grid'
     * @param string $customerName      Name des Kunden. Bsp:'Muster AG'
     * @param array $usages
     * @param stdClass|array $config    Config-Objekt mit Anweisungen in folgendem Format:
     *                                  {
     *                                      propertiesToTranslate: ['caption', 'header', 'title'],  // erforderlich
     *                                      variantPostfix: 'V',                                    // optional
     *                                      languagePostfix: 'L',                                   // optional
     *                                      languageProperty: 'languageId',                         // optional
     *                                      noTranslate: false,                                     // optional
     *                                      trimChars: array(':'),                                  // optional
     *                                      ignoreNonWords: true                                    // optional
     *                                      replaceParameters: true                                 // optional
     *                                  }
     *                                  Oder als Kursform nur ['caption', 'header', 'title']
     */
    public static function browseJson($json,
                                      $usageGrpName,
                                      $usageName,
                                      $customerName,
                                      &$usages,
                                      $config
    ) {

        // Anstelle des Config-Objekts, kann als Kurzform auch ein Array mit den propertiesToTranslate übergeben werden
        $propertiesToTranslate = [];
        if (is_array($config)) {
            $propertiesToTranslate = $config;
            $config = new stdClass();
        }

        // Standardwerte
        if (!property_exists($config, 'propertiesToTranslate')) {
            $config->propertiesToTranslate = $propertiesToTranslate;
        }
        if (!property_exists($config, 'variantPostfix')) {
            $config->variantPostfix = 'V';
        }
        if (!property_exists($config, 'languagePostfix')) {
            $config->languagePostfix = 'L';
        }
        if (!property_exists($config, 'languageProperty')) {
            $config->languageProperty = 'languageId';
        }
        if (!property_exists($config, 'noTranslate')) {
            $config->noTranslate = false;
        }

        if ($json && is_string($json)) {
            $json = json_decode($json);
        }

        if ($json) {
            self::_browseJson($json, $usageGrpName, $usageName, $customerName, $usages, $config);
        }
    }


    /**
     * Durchsucht die übergebenen Dateien nach getText()-Aufrufen und gibt sie in einem Array zurück
     *
     * @param array|String $filenames   Dateiname der php oder js-Datei mit Pfad oder Array mit Dateinamen
     * @param string $fnName            Name der Funktion, wie er im Quellcode verwendet wird als Regulärer Ausdruck.
     *                                  Beispiele: '\\$app->translate' für PHP und 'app.translate' für JS
     *                                  Es können auch mehrere angegeben werden: '\\$app->translate|\\$this->_app->translate'
     * @param array $usages             Hier kann ein bestehendes Array oder ein leeres Array übergeben werden
     * @throws Exception
     */
    public static function browseFiles($filenames, $fnName, &$usages) {

        if (!is_array($filenames)) {
            $filenames = [$filenames];
        }

        foreach ($filenames as $filename) {
            $usageGrpName = '';
            $fileExtension = pathinfo($filename, PATHINFO_EXTENSION);

            switch ($fileExtension) {
                case 'js': $usageGrpName = 'usagesJs'; break;
                case 'php': $usageGrpName = 'usagesPhp'; break;
                default:
                    throw new Exception('Ungültiger Dateityp!');
            }

            if (!file_exists($filename)) {
                throw new Exception('Datei "' . $filename . '" ist nicht vorhanden!');
            }

            $usageName = $filename;

            $text = file_get_contents($filename);

            self::browseCode($text, $usageGrpName, $usageName, $fnName, $usages);
        }
    }


    /**
     * Übersetzt einen Text in eine gewünschte Sprache
     *
     * @param string $key
     * @param string $variant
     * @param $args
     * @param string $languageId
     * @return string
     */
    public static function getText($key, $variant, $args, $languageId) {
        if ($languageId !== 'de') {
            // TODO: übersetzung laden
            throw new \Exception('translation not implemented');
        }
        $text = $key;

        // Argumente aufbereiten
        if ($args !== null) {
            if (!is_array($args)) {
                $args = [$args];
            }

            // Parameter in umgekehrter Reihenfolge ersetzen, damit %11 nicht von %1 ersetzt wird.
            for ($i = count($args); $i > 0; $i--) {
                $text = str_replace('%' . $i, (string)$args[$i - 1], $text);
            }
            unset ($i);
        }

        return $text;
    }


    /**
     * Erstellt die usages-Datei
     *
     * @param string $filename
     * @param string $variableName  Name der globalen Variable ohne $
     * @param array $usages
     */
    public static function writeUsagesFile($filename, $variableName, &$usages) {
        self::_mergeUsagesArrayWithExistingFile($filename, $variableName, $usages);

        // Infos zum Header hinzufügen
        self::_addVariantProperty($usages, '', '', 'Info', 'kijs Sprachdatei');
        self::_addVariantProperty($usages, '', '', 'Sprachdatei', 'Usages');
        self::_addVariantProperty($usages, '', '', 'Erstelldatum', date('Y-m-d'));
        self::_addVariantProperty($usages, '', '', 'Copyright', date('Y') . ' by Netas AG (www.netas.ch)');

        // Sortieren
        self::_sortUsages($usages);

        self::_writePhpFile($filename, $variableName, $usages);
    }


    // -------------------------------------------------------
    // Private Static Methods
    // -------------------------------------------------------

    /**
     * Fügt einem Verwendungs-Array eine Verwendung hinzu
     *
     * @param array $usages
     * @param string $key
     * @param string $variant
     * @param string $variantProperty
     * @param string $fileSetting Dateiname oder Settingname
     * @param int|string $lineNrCustomer Zeilennummer oder Settingbezeichnung
     */
    private static function _addUsage(&$usages,
                                      $key,
                                      $variant,
                                      $variantProperty,
                                      $fileSetting,
                                      $lineNrCustomer
    ) {
        if (!array_key_exists($key, $usages)) {
            $usages[$key] = [];
        }

        if (!array_key_exists($variant, $usages[$key])) {
            $usages[$key][$variant] = [];
        }

        if (!array_key_exists($variantProperty, $usages[$key][$variant])) {
            $usages[$key][$variant][$variantProperty] = [];
        }

        if (!array_key_exists($fileSetting, $usages[$key][$variant][$variantProperty])) {
            $usages[$key][$variant][$variantProperty][$fileSetting] = [];
        }

        if (!in_array($lineNrCustomer, $usages[$key][$variant][$variantProperty][$fileSetting], true)) {
            $usages[$key][$variant][$variantProperty][$fileSetting][] = $lineNrCustomer;
        }
    }


    /**
     * Fügt einem Verwendungs-Array zu einer Variant-Variable eine Eigenschaft hinzu.
     *
     * @param array $usages
     * @param string $key
     * @param string $variant
     * @param string $variantProperty
     * @param string|Number|Boolean $value
     */
    private static function _addVariantProperty(&$usages,
                                                $key,
                                                $variant,
                                                $variantProperty,
                                                $value
    ) {
        if (!array_key_exists($key, $usages)) {
            $usages[$key] = [];
        }
        if (!array_key_exists($variant, $usages[$key])) {
            $usages[$key][$variant] = [];
        }
        if (!array_key_exists($variantProperty, $usages[$key][$variant])) {
            $usages[$key][$variant][$variantProperty] = [];
        }

        $usages[$key][$variant][$variantProperty][] = $value;
    }


    /**
     * Durchsucht die übergebenen Dateien nach getText()-Aufrufen (rekursiv)
     * Gehört zur Funktion browseJson()
     *
     * @param $json
     * @param string $usageGrpName
     * @param string $usageName
     * @param string $customerName
     * @param array $usages
     * @param stdClass $config
     * @param bool|null $noTranslate
     */
    private static function _browseJson($json,
                                        $usageGrpName,
                                        $usageName,
                                        $customerName,
                                        &$usages,
                                        $config,
                                        $noTranslate = null
    ) {
        if ($json) {

            if ($noTranslate === null) {
                $noTranslate = !!$config->noTranslate;
            }

            if (is_array($json)) {

                // Bei Arrays: rekursiver Aufruf
                foreach ($json as $value) {
                    self::_browseJson($value, $usageGrpName, $usageName, $customerName, $usages, $config, $noTranslate);
                }

            } elseif (is_object($json)) {

                // Bei Objekten evtl. gewisse Eigenschaften übersetzen

                // Wenn in einem language-Property "-" ist, wird darin und in allen untergeordneten
                // Eigenschaften nichts übersetzt.
                if (property_exists($json, $config->languageProperty)) {
                    $noTranslate = $json->{$config->languageProperty} === '-';
                }

                // Eigenschaften durchgehen
                foreach ($json as $key => $value) {

                    if ($value && is_string($value)) {
                        $value = trim($value);

                        // Bei Strings
                        if (in_array($key, $config->propertiesToTranslate, true)) {
                            $variantKey = $key . $config->variantPostfix;
                            $languageKey = $key . $config->languagePostfix;

                            $variant = property_exists($json, $variantKey) ? $json->{$variantKey} . '' : '';

                            // Soll der Begriff übersetzt werden?
                            // Falls das Objekt keine direkte Eigenschaft mit einer languagePostfix hat (z.B. 'titleL'),
                            // So gilt das language-Property des Objekts oder eines übergeordneten Objekts.
                            $propertyNoTranslate = false;
                            if (property_exists($json, $languageKey)) {
                                $propertyNoTranslate = $json->{$languageKey} === '-';
                            }

                            // Satzzeichen vom value trimmen
                            if (property_exists($config, 'trimChars') && $config->trimChars) {
                                $trimChars = is_array($config->trimChars) ? $config->trimChars : array($config->trimChars);
                                $trimChars = array_map(function($v) {
                                    return preg_quote($v, '/');
                                }, $trimChars);
                                $value = preg_replace('/(' . implode('|', $trimChars) . ')$/', '', $value);
                            }

                            // Parameter aus Reports ersetzen durch %1 %2 etc.
                            if (property_exists($config, 'replaceParameters') && $config->replaceParameters) {
                                $value = self::_replaceParameters($value);
                            }

                            // values ohne Buchstaben ignorieren
                            if (property_exists($config, 'ignoreNonWords') && $config->ignoreNonWords) {
                                if (preg_match('/(?:[a-z]|ö|ü|ä|é|è|à|â|ê|î|ô|û|Ö|Ü|Ä|É|È|À|Â|Ê|Î|Ô|Û)/i', $value) === 0) {
                                    $propertyNoTranslate = true;
                                }
                            }

                            // Text in die usages übernehmen
                            if (!$noTranslate && !$propertyNoTranslate) {
                                self::_addUsage($usages, $value, $variant, $usageGrpName, $usageName, $customerName);
                            }

                        }

                    } else {

                        // sonst: rekursiver Aufruf
                        self::_browseJson($value, $usageGrpName, $usageName, $customerName, $usages, $config, $noTranslate);
                    }

                }

            }

        }
    }


    /**
     * Handelt es sich um ein assoziatives oder sequentielles Array?
     *
     * @param array $arr
     * @return boolean
     */
    private static function _isAssociative($arr) {
        if ($arr === []) {
            return false;
        }
        return array_keys($arr) !== range(0, count($arr) - 1);
    }


    /**
     * Maskiert einen String zum Schreiben in eine PHP-Datei
     *
     * @param string $text
     * @return string
     */
    private static function _maskString($text) {
        $text = str_replace(["\\", "\"", "\n", "\r"], ["\\\\", "\\\"", "\\n", ""], $text);
        return "\"$text\"";
    }


    /**
     * Ergänzt das usages-Array mit Infos aus der bestehenden usages-Datei
     *
     * @param string $filename
     * @param string $variableName  Name der globalen Variable ohne $
     * @param array $usages
     */
    private static function _mergeUsagesArrayWithExistingFile($filename, $variableName, &$usages) {
        if (file_exists($filename)) {
            include_once $filename;
            // Die bestehenden Verwendungen sind nun in der globalen Variable $so_usages
        }

        // Bestehende Verwendungen in neue Verwendungen integrieren
        $existingUsages = null;
        if (!empty($$variableName)) {
            $existingUsages = $$variableName;

            // SCHRITT 1 von 2
            // Die neuen Verwendungen durchgehen und als fuzzy kennzeichnen, wenn sie vorher noch nicht existierten
            // =================================================================
            foreach ($usages as $key => $variants) {
                foreach ($variants as $variant => $variantProperties) {
                    if (!self::_usageExist($existingUsages, $key, $variant)) {
                        self::_addVariantProperty($usages, $key, $variant, 'fuzzy', true);
                    }
                }
            }

            // SCHRITT 2 von 2
            // Die bestehenden Verwendungen durchgehen und in neue rüberkopieren
            // =================================================================
            foreach ($existingUsages as $key => $variants) {
                foreach ($variants as $variant => $variantProperties) {
                    $hasUsages = false;
                    $fuzzy = false;

                    // usagesJs
                    if (array_key_exists('usagesJs', $variantProperties) && $variantProperties['usagesJs']) {
                        foreach ($variantProperties['usagesJs'] as $file => $lineNos) {
                            foreach ($lineNos as $lineNo) {

                                // Falls die Verwendung nicht mehr existiert, noch unter usagesJsOld eintragen
                                if (!self::_usageExist($usages, $key, $variant, 'usagesJs', $file, $lineNo)) {
                                    self::_addUsage($usages, $key, $variant, 'usagesJsOld', $file, $lineNo);
                                    $fuzzy = true;
                                }
                                $hasUsages = true;
                            }
                        }
                    }

                    // usagesPhp
                    if (array_key_exists('usagesPhp', $variantProperties) && $variantProperties['usagesPhp']) {
                        foreach ($variantProperties['usagesPhp'] as $file => $lineNos) {
                            foreach ($lineNos as $lineNo) {

                                // Falls die Verwendung nicht mehr existiert, noch unter usagesPhpOld eintragen
                                if (!self::_usageExist($usages, $key, $variant, 'usagesPhp', $file, $lineNo)) {
                                    self::_addUsage($usages, $key, $variant, 'usagesPhpOld', $file, $lineNo);
                                    $fuzzy = true;
                                }
                                $hasUsages = true;
                            }
                        }
                    }

                    // usagesReport
                    if (array_key_exists('usagesReport', $variantProperties) && $variantProperties['usagesReport']) {
                        foreach ($variantProperties['usagesReport'] as $setting => $customers) {
                            foreach ($customers as $customer) {

                                // Falls die Verwendung nicht mehr existiert, noch unter usagesReportOld eintragen
                                if (!self::_usageExist($usages, $key, $variant, 'usagesReport', $setting, $customer)) {
                                    self::_addUsage($usages, $key, $variant, 'usagesReportOld', $setting, $customer);
                                    $fuzzy = true;
                                }
                                $hasUsages = true;
                            }
                        }
                    }

                    // usagesReportForm
                    if (array_key_exists('usagesReportForm', $variantProperties) && $variantProperties['usagesReportForm']) {
                        foreach ($variantProperties['usagesReportForm'] as $setting => $customers) {
                            foreach ($customers as $customer) {

                                // Falls die Verwendung nicht mehr existiert, noch unter usagesReportFormOld eintragen
                                if (!self::_usageExist($usages, $key, $variant, 'usagesReportForm', $setting, $customer)) {
                                    self::_addUsage($usages, $key, $variant, 'usagesReportFormOld', $setting, $customer);
                                    $fuzzy = true;
                                }
                                $hasUsages = true;
                            }
                        }
                    }

                    // usagesSetting
                    if (array_key_exists('usagesSetting', $variantProperties) && $variantProperties['usagesSetting']) {
                        foreach ($variantProperties['usagesSetting'] as $setting => $customers) {
                            foreach ($customers as $customer) {

                                // Falls die Verwendung nicht mehr existiert, noch unter usagesSettingOld eintragen
                                if (!self::_usageExist($usages, $key, $variant, 'usagesSetting', $setting, $customer)) {
                                    self::_addUsage($usages, $key, $variant, 'usagesSettingOld', $setting, $customer);
                                    $fuzzy = true;
                                }
                                $hasUsages = true;
                            }
                        }
                    }

                    // Falls es noch eine Verwendung oder eine alte-Verwendung gibt, die anderen Eigenschaften auch übernehmen
                    if ($hasUsages) {

                        // comments
                        if (array_key_exists('comments', $variantProperties) && $variantProperties['comments']) {
                            self::_addVariantProperty($usages, $key, $variant, 'comments', $variantProperties['comments']);
                        }

                        // previous
                        if (array_key_exists('previous', $variantProperties) && $variantProperties['previous']) {
                            self::_addVariantProperty($usages, $key, $variant, 'previous', $variantProperties['previous']);
                        }

                        // fuzzy
                        if (array_key_exists('fuzzy', $variantProperties) && $variantProperties['fuzzy']) {
                            $fuzzy = true;
                        }
                        if ($fuzzy) {
                            self::_addVariantProperty($usages, $key, $variant, 'fuzzy', true);
                        }

                    }


                }
            }


        }
    }


    /**
     * Ersetzt Report-Parameter in einem Value mit %1 %2 etc.
     * @param string $value
     * @return string
     */
    private static function _replaceParameters($value) {

        // [Parameter]
        $value = preg_replace('/\[[^\[\]#\(\)\{\}]+\]/', '~~~', $value);

        // #Parameter#
        $value = preg_replace('/\#[^\[\]#\(\)\{\}]+\#/', '~~~', $value);

        // isTrue() isFalse()
        $value = preg_replace('/(?:boolean|date|isTrue|isFalse)\([^\(\)]+\)/i', '~~~', $value);

        // Rechnungen {{3+3}}
        $value = preg_replace('/\{\{[^\{\}]+\}\}/', '~~~', $value);

        // Parameter erstellen
        $cnt = PHP_INT_MAX;
        $paramNr = 0;
        while ($cnt > 0) {
            $paramNr++;
            $value = preg_replace('/~~~/', '%' . $paramNr, $value, 1, $cnt);
        }

        return trim($value);
    }


    /**
     * Generiert aus einem Array PHP-Code (Rekursiv)
     *
     * @param array $array
     * @param int $indent Anzahl Leerzeichen für den Einzug
     * @return string
     */
    private static function _serializeArrayToPhpCode($array, $indent=0) {
        $content = '';
        $length = count($array);
        $index = 0;

        foreach ($array as $key => $value) {

            // Erste Hierarchiestufe zur besseren Lesbarkeit mit zusätzlichen Zeilenumbrüchen abtrennen
            if ($indent === 1) {
                $content .= "\n";
            }

            if (self::_isAssociative($array)) {
                $content .= str_repeat(' ', $indent);
                $content .= self::_maskString($key) . ' => ';
            }

            if (is_array($value)) {
                if (self::_isAssociative($value)) {
                    $content .= "[\n";
                    $content .= self::_serializeArrayToPhpCode($value, $indent+1);
                    $content .= str_repeat(' ', $indent) . ']';
                } else {
                    $content .= "[";
                    $content .= self::_serializeArrayToPhpCode($value, $indent+1);
                    $content .= ']';
                }

            } elseif (is_object($value)) {
                    $content .= "[\n";
                    $content .= self::_serializeArrayToPhpCode($value, $indent+1);
                    $content .= str_repeat(' ', $indent) . ']';

            } elseif (is_int($value) || is_float($value)) {
                $content .= $value;

            } elseif (is_bool($value)) {
                $content .= $value ? 'true' : 'false';

            } else {
                $content .= self::_maskString($value);

            }

            // Komma anhängen, ausser beim letzten
            if ($index !== $length-1) {
                $content .= ", ";
            }

            if (self::_isAssociative($array)) {
                $content .= "\n";
            }

            $index++;
        }

        return $content;
    }


    /**
     * Verwendungsarray alphabetisch sortieren
     *
     * @param array $usages
     */
    private static function _sortUsages(&$usages) {

        if ($usages && is_array($usages)) {

            // Zuerst nach Key sortieren
            ksort($usages);

            foreach ($usages as &$variants) {
                if ($variants && is_array($variants)) {

                    // Dann nach Variante sortieren
                    ksort($variants);

                    foreach ($variants as &$variantProperties) {
                        if ($variantProperties && is_array($variantProperties)) {

                            // Dann nach variantProperty sortieren
                            ksort($variantProperties);

                            foreach ($variantProperties as &$fileSettings) {
                                if ($fileSettings && is_array($fileSettings)) {

                                    // Dann nach Verwendung (Dateiname/Settingname) sortieren
                                    ksort($fileSettings);

                                    foreach ($fileSettings as &$lineNoCustomers) {
                                        if ($lineNoCustomers && is_array($lineNoCustomers)) {

                                            // Dann noch nach Zeilennummer/Kunde sortieren
                                            asort($lineNoCustomers);
                                        }
                                    }
                                    unset($lineNoCustomers);
                                }
                            }
                            unset($fileSettings);
                        }
                    }
                    unset($variantProperties);
                }
            }
            unset($variants);
        }
    }


    /**
     * Existiert eine Verwendung?
     *
     * @param array $usages
     * @param string $key
     * @param string [$variant=null]
     * @param string [$variantProperty=null]
     * @param string [$fileSetting=null]
     * @param string|Number [$lineNoCustomer=null]
     * @return boolean
     */
    private static function _usageExist(&$usages,
                                        $key,
                                        $variant=null,
                                        $variantProperty=null,
                                        $fileSetting=null,
                                        $lineNoCustomer=null
    ) {
        if (!array_key_exists($key, $usages)) {
            return false;
        }

        if ($variant === null) {
            return true;
        }
        if (!array_key_exists($variant, $usages[$key])) {
            return false;
        }

        if ($variantProperty === null) {
            return true;
        }
        if (!array_key_exists($variantProperty, $usages[$key][$variant])) {
            return false;
        }

        if ($fileSetting === null) {
            return true;
        }
        if (!array_key_exists($fileSetting, $usages[$key][$variant][$variantProperty])) {
            return false;
        }

        if ($lineNoCustomer === null) {
            return true;
        }
        if (!in_array($lineNoCustomer, $usages[$key][$variant][$variantProperty][$fileSetting], true)) {
            return false;
        }
        return true;
    }


    /**
     * Generiert aus einem Array eine PHP-Datei
     *
     * @param string $filename
     * @param string $variableName  Name der globalen Variable ohne $
     * @param array|stdClass|int|float|bool $array
     */
    private static function _writePhpFile($filename, $variableName, $array) {

        // Inhalt der PHP-Datei erstellen
        $content = '<?php' . "\n";
        $content .= '$' . $variableName . ' = ';

        if (is_array($array)) {
            if (self::_isAssociative($array)) {
                $content .= "[\n";
                $content .= self::_serializeArrayToPhpCode($array, 1);
                $content .= ']';
            } else {
                $content .= "[";
                $content .= self::_serializeArrayToPhpCode($array, 1);
                $content .= ']';
            }

        } elseif (is_object($array)) {
                $content .= "[\n";
                $content .= self::_serializeArrayToPhpCode($array, 1);
                $content .= ']';

        } elseif (is_int($array) || is_float($array)) {
            $content .= $array;

        } elseif (is_bool($array)) {
            $content .= $array ? 'true' : 'false';

        } else {
            $content .= self::_maskString($array);
        }

        $content .= ';';
        $content .= "\n";

        // Datei schreiben
        file_put_contents($filename, $content);
    }

}
