<?php
declare(strict_types=1);

/*
 * Erstellt die <script>- bzw. <link>-Tags aller Dateien der gewünschten Module (gemäss files.json)
 *
 * Variante 1: Einbinden (empfohlen, ohne Umweg über HTTP)
 * -------------------------------------------------------
 * <?php
 *   require_once '../kijs/tools/getDebugHead.php';
 *
 *   // CSS Files
 *   echo kijs_getDebugHead(['core', 'gui', 'grid', 'aceEditor', 'quillEditor'], 'css', '../kijs/');
 *
 *   // JS Files
 *   echo kijs_getDebugHead(['core', 'gui', 'grid', 'aceEditor', 'quillEditor'], 'js', '../kijs/');
 * ?>
 *
 * Variante 2: Direkter Aufruf
 * ---------------------------
 * http://localhost/kijs/tools/getDebugHead.php?modules=core,gui&fileType=js
 * http://localhost/kijs/tools/getDebugHead.php?modules=core,gui&fileType=css
 */


/**
 * Gibt die <script>- bzw. <link>-Tags aller Dateien der gewünschten Module zurück
 * @param string[] $modules   Module, z.B. ['core', 'gui', 'grid', 'aceEditor', 'quillEditor']
 * @param string $fileType    'js' oder 'css'
 * @param string $baseUrl     URL des kijs-Ordners, z.B. '../' oder '/kijs/' (mit '/' am Schluss)
 * @return string
 * @throws Exception
 */
function kijs_getDebugHead(array $modules, string $fileType, string $baseUrl): string {
    $modules = array_values(array_filter(array_map('trim', $modules)));

    // Validieren
    if (!$modules) {
        throw new Exception('Argument "modules" is missing.');
    }
    if (!in_array($fileType, ['js', 'css'], true)) {
        throw new Exception('Argument "fileType" is missing or invalid.');
    }

    // files.json lesen
    $dir = dirname(__DIR__) . '/';
    $files = json_decode((string)file_get_contents($dir . 'files.json'), true);

    // Rückgabe erstellen
    $return = '';
    foreach ($modules as $module) {
        if (!array_key_exists($fileType, $files) || !array_key_exists($module, $files[$fileType])) {
            continue;
        }

        foreach ($files[$fileType][$module] as $file) {
            // Anstelle der .less-Files .css-Files einbinden
            if ($fileType === 'css' && str_ends_with($file, '.less')) {
                $file = substr($file, 0, -strlen('.less')) . '.css';
            }

            $url = htmlspecialchars($baseUrl . $file . '?v=' . filemtime($dir . $file), ENT_QUOTES);

            if ($fileType === 'js') {
                $return .= '<script type="text/javascript" src="' . $url . '"></script>' . "\n";
            } else {
                $return .= '<link rel="stylesheet" type="text/css" href="' . $url . '">' . "\n";
            }
        }
    }

    return $return;
}


// Direkter Aufruf: Die URLs werden relativ zum Server-Stamm erstellt (z.B. '/kijs/js/kijs.js').
// Der Host-Header wird bewusst nicht verwendet, da er vom Aufrufer gefälscht werden kann.
if (realpath((string)($_SERVER['SCRIPT_FILENAME'] ?? '')) === __FILE__) {
    $modules = explode(',', (string)filter_input(INPUT_GET, 'modules'));  // gewünschte Module kommagetrennt: 'core,gui,grid,editor'
    $fileType = (string)filter_input(INPUT_GET, 'fileType');                // 'js' oder 'css'

    $baseUrl = rtrim(dirname((string)($_SERVER['SCRIPT_NAME'] ?? ''), 2), '/') . '/';

    header('Content-Type: text/plain; charset=utf-8');
    echo kijs_getDebugHead($modules, $fileType, $baseUrl);
}
