<?php

// Eigene Exception
class ki_Exception_Notice extends Exception {}

$responses = array();

$requests = json_decode(file_get_contents("php://input"));

foreach ($requests as $request) {
    $response = new stdClass();
    $response->tid = $request->tid;

    switch ($request->remoteFn) {

        case 'naviDocu.load':
            $rows = _getNavigationRowsRec('data/docu', 'treeDocu', null);
            $response->config = new stdClass();
            $response->config->data = $rows;
            break;

        case 'naviShowcase.load':
            $rows = _getNavigationRowsRec('data/showcase', 'treeShowcase', null);
            $response->config = new stdClass();
            $response->config->data = $rows;
            break;

        case 'naviTest.load':
            $rows = _getNavigationRowsRec('data/test', 'treeTest', null);
            $response->config = new stdClass();
            $response->config->data = $rows;
            break;

        default:
            $response->errorMsg = 'RemoteFn "' . $request->remoteFn . '" existiert nicht.';
    }

    $responses[] = $response;
}

print(json_encode($responses));



// ------------------------------------
// Hilfsfunktionen
// ------------------------------------
function _getNavigationRowsRec($rootDir, $treeName, $nodeId) {
    $excludeFiles = ['.', '..'];

    $rows = [];

    $dirPath = $rootDir;
    if ($nodeId) {

        // sicherstellen, dass der übergebene Pfad ein Unterverzeichnis ist.
        if (!str_starts_with(realpath($nodeId), realpath($rootDir))) {
            die('invalid nodeId');
        }
        $dirPath = $nodeId;
    }

    $handle = opendir('../' . $dirPath);

    if ($handle) {
        while ( ($filename = readdir($handle)) !== false ) {
            $path = $dirPath . '/' . $filename;

            // Unbenötigte Dateien ignorieren
            if (in_array($filename, $excludeFiles)) {
                continue;
            }

            // timestamp anhängen
            $pathWithTimestamp = $path . '?v=' . filemtime('../' . $path);

            $userData  = new stdClass();
            $userData->nodeId = $path;
            $userData->treeName = $treeName;
            $userData->path = $pathWithTimestamp;
            $userData->filename = $filename;
            $userData->filetype = pathinfo($path, PATHINFO_EXTENSION);
            $userData->displayText = str_replace('_', ' ', $filename);
            if ($userData->filetype) {
                $userData->displayText = substr($userData->displayText, 0, (strlen($userData->filetype)+1) * -1);
            }

            // Dateityp
            switch ($userData->filetype) {
                case '':    // Folder
                    break;

                case 'html':
                    $userData->iconMap = 'kijs.iconMap.Fa.file-code';
                    $userData->html = file_get_contents('../' . $path);
                    break;

                case 'js':
                    $userData->iconMap = 'kijs.iconMap.Fa.js';
                    switch ($rootDir) {
                        case 'data/docu': $userData->namespace = 'docu'; break;
                        case 'data/showcase': $userData->namespace = 'sc'; break;
                        case 'data/test': $userData->namespace = 'test'; break;
                    }
                    $userData->className = str_replace(' ', '_', $userData->displayText);
                    break;

                case 'md':
                    $userData->iconMap = 'kijs.iconMap.Fa.markdown';


                    $userData->markdown = file_get_contents('../' . $path);
                    break;

                default:
                    continue 2;

            }

            $row = [];
            $row['displayText'] = $userData->displayText;
            $row['nodeId'] = $path;
            if (!empty($userData->iconMap)) {
                $row['iconMap'] = $userData->iconMap;
            }
            $row['allowChildren'] = $userData->filetype === '';
            $row['userData'] = $userData;
            $row['children'] = null;
            if ($userData->filetype === '') {
                $row['children'] = _getNavigationRowsRec($rootDir, $treeName, $path);
            }
            $rows[] = $row;
        }

        closedir($handle);
    }

    // rows Sortieren
    usort($rows, function($a, $b) {
        return strcmp(strtolower($a['displayText'] ?? ''), strtolower($b['displayText'] ?? ''));
    });

    return $rows;
}
