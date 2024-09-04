<?php

// Erstellt die usages.php

// Beispielaufruf mit allen Modulen:
// http://localhost/kijs/tools/kilang/generateUsages.php

// Beispielaufruf mit gewünscchten Modulen:
// http://localhost/kijs/tools/kilang/generateUsages.php?modules=core,gui


include_once 'lib/kilang.php';


$usages = array();
$fnName = 'kijs.getText';
$dir = '../../';


$modules = filter_input(INPUT_GET, 'modules');      // gewünschte Module kommagetrennt: 'core,gui,grid,editor'

// Modules in array umwandeln
$modules = explode(',', $modules);
foreach ($modules as &$module) {
    $module = trim($module);
}
unset($module);

// Validieren
if (!$modules) {
    throw new Exception('Argument "modules" fehlt.');
}

// files.json lesen
$json = file_get_contents($dir.'files.json');
$files = json_decode($json, true);

// Falls keine Module angegeben wurden, nehmen wir alle vorhandenen Module
if (!$modules || !$modules[0]) {
    $modules = [];
    foreach ($files as $filetype => $mods) {
        foreach ($mods as $mod => $tmp) {
            $modules[] = $mod;
        }
    }
}

// duplikate entfernen
$modules = array_unique($modules);

// Texte aus Dateien holen
foreach ($modules as $module) {
    if (array_key_exists('js', $files) && array_key_exists($module, $files['js'])) {

        foreach ($files['js'][$module] as $file) {
            KiLang::browseFiles($dir.$file, $fnName, $usages);
        }
    }
}

// usages.php-Datei erstellen
KiLang::writeUsagesFile('data/usages.php', 'translations', $usages);

// Ausgabe auf Bildschirm
echo '<pre>';
include 'data/usages.php';
print_r($translations);
echo '</pre>';
