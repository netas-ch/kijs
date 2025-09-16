<?php

/*
 * Copyright © 2025 Netas AG, Switzerland.
 * @date    2025-09-05
 * Erstellt den Inhalt der Datei kijs/js/iconMap/kijs.iconMap.Fa.js
 * Anleitung:
 *  1. In der Variable $version die gewünschte Versionsnummer eintragen
 *  2. getFontAwesomeIcons.php im Browser öffnen
 *  3. den Inhalt des Browsers in die Datei kijs.iconMap.Fa.js kopieren
 */
$version = '7.0.1'; // Hier die gewünschte Version eintragen

$t = new getFontAwesomeIcons();
$t->getData($version);


class getFontAwesomeIcons {
    protected $_apiUrl = 'https://api.fontawesome.com';


    public function __construct() {

    }


    public function getData(string $version) {

        $graphSql = '{
            release(version:' . json_encode($version) . ') {
              version,
              isLatest,
              icons(license: "free") {
                id,
                unicode,
                styles
              }
            }
        }';

        $json = $this->_makeRequest($graphSql);

        //echo('<pre>');
        //print_r($json->data->release);
        //die('</pre>');

        $icons = $json->data->release->icons ?? [];

        if (!$icons) {
            die('no icons found');
        }

        $maxLen = 0;
        foreach ($icons as $icon) {
            $maxLen = max($maxLen, strlen($icon->id)+2);
        }

        // Sortieren
        usort($icons, function($a, $b) {
            $aStyles = $a->styles ?? [];
            $bStyles = $b->styles ?? [];

            if (!in_array('solid', $aStyles) && in_array('solid', $bStyles)) {
                return 1;
            }
            if (in_array('solid', $aStyles) && !in_array('solid', $bStyles)) {
                return -1;
            }

            if (!in_array('brands', $aStyles) && in_array('brands', $bStyles)) {
                return -1;
            }
            if (in_array('brands', $aStyles) && !in_array('brands', $bStyles)) {
                return 1;
            }

            return strcasecmp($a->id, $b->id);


        });

        $lines = [];

        foreach ($icons as $icon) {
            $id = $icon->id;
            $unicode = $icon->unicode;
            $styles = $icon->styles ?? [];

            // "arrow-up-9-1": { iconChar: "&#xf887" },

            if (!in_array('solid', $styles) && !in_array('brands', $styles)) {
                throw new Exception('not solid, not brands');
            }

            $line = '    ';
            $line .= str_pad("'" . $id . "'", $maxLen, ' ');
            $line .= ': ';
            $line .= '{ ';
            $line .= 'char: 0x' . str_pad($unicode, 4, '0', STR_PAD_LEFT);

            if (in_array('solid', $styles)) {
                $line .= ', cls: "fa-solid"';
            } else if (in_array('brands', $styles)) {
                $line .= ', cls: "fa-brands"';
            }

            $line .= ' }';
            $lines[] = $line;
        }

        echo '<pre>';
        echo '/* global kijs */' . "\n";
        echo "\n";
        echo '// --------------------------------------------------------------' . "\n";
        echo '// kijs.iconMap.Fa' . "\n";
        echo '// --------------------------------------------------------------' . "\n";
        echo '// Font Awesome Icons' . "\n";
        echo '// Version ' . $version . "\n";
        echo 'kijs.iconMap.Fa = {' . "\n";

        echo implode(",\n", $lines) . "\n";

        echo '};' . "\n";
        echo '</pre>';
    }

    protected function _makeRequest($post) {
        $ch = curl_init();

        // setze die URL und andere Optionen
        curl_setopt($ch, CURLOPT_URL, $this->_apiUrl);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $post);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/graphql']);
        curl_setopt($ch, CURLOPT_AUTOREFERER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 50);
        curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla 5.0/www.netas.ch');

        $response = curl_exec($ch);

        if ($response === false) {
            throw new Exception('curl error: ' . curl_error($ch));
        }

        curl_close($ch);

        // decodieren
        $response = json_decode($response);
        if (!is_object($response)) {
            throw new Exception('json error: ' . json_last_error_msg());
        }

        return $response;
    }

}
