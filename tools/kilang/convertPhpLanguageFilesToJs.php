<?php

// Konvertiert aus die php-Sprachdateien im Ordner data zu js-Sprachdateien im Ordner kijs/js/translation

// Beispielaufruf:
// http://localhost/kijs/tools/kilang/convertPhpLanguageFilesToJs.php


$sourceDir = 'data/';
$targetDir = '../../js/translation/';


$translations = [];
$languages = [];

// source-Dateien durchgehen
foreach (new DirectoryIterator($sourceDir) as $file) {
    if ($file->isDot()) {
        continue;
    }
    
    $sourceFilename = $file->getFilename();

    if (preg_match('/kijs_([a-z]{2}(?>\-[a-z]{2})?)\.php/i', $sourceFilename, $matches, PREG_OFFSET_CAPTURE)) {
        $lang = $matches[1][0];

        // PHP Datei öffnen
        include $sourceDir . $sourceFilename;

        // und als JSON speichern
        $targetFilename = 'kijs.translation.' . $lang . '.js';
        $json = json_encode($translations[$lang], JSON_PRETTY_PRINT);

        $content = '';
        $content .= 'kijs.translation = kijs.translation || {};' . "\n";
        $content .= 'kijs.translation["' . $lang . '"] = ';
        $content .= $json;
        $content .= ';';

        file_put_contents($targetDir . $targetFilename, $content);

        $languages[] = $lang;
    }
}

// Ausgabe auf Bildschirm
echo '<pre>';
print_r($languages);
echo '</pre>';
