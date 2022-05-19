<?php

/*
 * Copyright © 2022 Netas Ltd., Switzerland.
 * @date    2022-05-18
 */

$t = new getFontAwesomeIcons();
$t->getData("6.1.1");


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

        $icons = $json->data->release->icons ?? [];

        if (!$icons) {
            throw new Exception('no icons found');
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

        foreach ($icons as $icon) {
            $id = $icon->id;
            $unicode = $icon->unicode;
            $styles = $icon->styles ?? [];

            // "arrow-up-9-1": { iconChar: "&#xf887" },

            if (!in_array('solid', $styles) && !in_array('brands', $styles)) {
                throw new Exception('not solid, not brands');
            }

            print(str_pad(str_replace("_", "_", '\'' . $id . '\''), $maxLen, ' ') . ': { char: 0x' . str_pad($unicode, 4, '0', STR_PAD_LEFT) . '');
            if (in_array('solid', $styles)) {
                print(', cls: "fa-solid"');
            } else if (in_array('brands', $styles)) {
                print(', cls: "fa-brands"');
            }

            print(' },' . "\n");


        }
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