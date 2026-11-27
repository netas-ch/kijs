<?php
declare(strict_types=1);

// Nur lokal ausführbar
require_once __DIR__ . '/../localOnly.php';

// Konvertiert die php-Sprachdateien im Ordner data zu js-Sprachdateien:
//  - kijs_xx.php -> kijs/js/translation/kijs.translation.xx.js
//  - home_xx.php -> kijs/home/app/translation/home.translation.xx.js
//    Die Texte der Home-App werden beim Laden in kijs.translation[xx] eingefügt,
//    damit sie mit kijs.getText() übersetzt werden.

// Beispielaufruf:
// http://localhost/kijs/tools/kilang/convertPhpLanguageFilesToJs.php


$sourceDir = 'data/';
$targetDirs = [
    'kijs' => '../../js/translation/',
    'home' => '../../home/app/translation/'
];


$translations = [];
$languages = [];

// source-Dateien durchgehen
foreach (new DirectoryIterator($sourceDir) as $file) {
    if ($file->isDot()) {
        continue;
    }

    $sourceFilename = $file->getFilename();

    if (preg_match('/^(kijs|home)_([a-z]{2}(?:\-[a-z]{2})?)\.php$/i', $sourceFilename, $matches)) {
        $prefix = $matches[1];
        $lang = $matches[2];

        // PHP Datei öffnen
        include $sourceDir . $sourceFilename;

        $targetDir = $targetDirs[$prefix];
        if (!is_dir($targetDir)) {
            mkdir($targetDir, 0775, true);
        }

        // und als JSON speichern
        $targetFilename = $prefix . '.translation.' . $lang . '.js';

        $content = '';
        if ($prefix === 'kijs') {
            $json = json_encode($translations[$lang], JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR);
            $content .= 'kijs.translation = kijs.translation || {};' . "\n";
            $content .= 'kijs.translation["' . $lang . '"] = ';
            $content .= $json;
            $content .= ';';

        } else {
            // Ohne Header, damit derjenige von kijs erhalten bleibt
            $texts = $translations[$lang];
            unset($texts['']);
            $json = json_encode((object)$texts, JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR);
            $content .= '// Automatisch erstellt aus tools/kilang/data/' . $sourceFilename . "\n";
            $content .= '// mit tools/kilang/convertPhpLanguageFilesToJs.php. Nicht von Hand ändern.' . "\n";
            $content .= 'kijs.translation = kijs.translation || {};' . "\n";
            $content .= 'kijs.translation["' . $lang . '"] = Object.assign(kijs.translation["' . $lang . '"] || {}, ';
            $content .= $json;
            $content .= ');';
        }

        file_put_contents($targetDir . $targetFilename, $content);

        $languages[] = $prefix . ' ' . $lang;
    }
}

// Ausgabe auf Bildschirm
echo '<pre>';
print_r($languages);
echo '</pre>';
