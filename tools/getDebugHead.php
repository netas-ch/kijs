<?php
// Beispielaufrufe
// http://localhost/kijs/tools/getDebugHead.php?modules=core,gui&fileType=js
// http://localhost/kijs/tools/getDebugHead.php?modules=core,gui&fileType=css

/* Beispiel
 * --------
 * <?php
 *   // Base-URL ermittlen
 *   $baseUrl = '';
 *   $baseUrl .= filter_input(INPUT_SERVER, 'HTTPS', FILTER_VALIDATE_BOOLEAN) ? "https://" : "http://";
 *   $baseUrl .= filter_input(INPUT_SERVER, 'HTTP_HOST');
 * 
 *   // CSS Files
 *   echo file_get_contents($baseUrl . '/kijs/tools/getDebugHead.php?modules=core,gui,grid,aceEditor,quillEditor&fileType=css');
 *
 *   // JS Files
 *   echo file_get_contents($baseUrl . '/kijs/tools/getDebugHead.php?modules=core,gui,grid,aceEditor,quillEditor&fileType=js');
 * ?>
 */ 

$modules = filter_input(INPUT_GET, 'modules');      // gewünschte Module kommagetrennt: 'core,gui,grid,editor'
$fileType = filter_input(INPUT_GET, 'fileType');    // 'js' oder 'css'

// Base-URL ermittlen
$baseUrl = '';
$baseUrl .= filter_input(INPUT_SERVER, 'HTTPS', FILTER_VALIDATE_BOOLEAN) ? "https://" : "http://";
$baseUrl .= filter_input(INPUT_SERVER, 'HTTP_HOST');
$baseUrl .= explode('?', filter_input(INPUT_SERVER, 'REQUEST_URI'), 2)[0];
$baseUrl = substr($baseUrl, 0, strlen('tools/getDebugHead.php')*-1);

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
if (!in_array($fileType, ['js', 'css'])) {
    throw new Exception('Argument "fileType" fehlt oder ist ungültig.');
}

// files.json lesen
$json = file_get_contents('../files.json');
$files = json_decode($json, true);

// Rückgabe erstellen
$return = '';
foreach ($modules as $module) {
    if (array_key_exists($fileType, $files) && array_key_exists($module, $files[$fileType])) {
        foreach ($files[$fileType][$module] as $file) {
            
            switch ($fileType) {
                case 'js':
                    $return .= '<script type="text/javascript" src="' . $baseUrl . $file . '?v=' . filemtime('../' . $file) . '"></script>' . "\n";
                    break;
                
                case 'css':
                    // Anstelle der .less-Files .css-Files einbinden
                    if (substr($file, strlen('.less')*-1) === '.less') {
                        $file = substr($file, 0, strlen('.less')*-1) . '.css';
                    }
                    
                    $return .= '<link rel="stylesheet" type="text/css" href="' . $baseUrl . $file . '?v=' . filemtime('../' . $file) . '">' . "\n";
                    break;
                    
            }
        }
    }
}

echo $return;
