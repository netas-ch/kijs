<?php
declare(strict_types=1);

// Antwort immer als JSON ausliefern, damit der Browser sie nie als HTML interpretiert
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

// Übersetzung der Texte (Sprache aus dem GET-Parameter lang)
require_once __DIR__ . '/HomeLang.php';

// Eigene Exception
class ki_Exception_Notice extends Exception {}

$responses = array();

$requests = json_decode((string)file_get_contents("php://input")) ?: [];

foreach ($requests as $request) {
    $response = new stdClass();
    $response->tid = $request->tid;

    switch ($request->remoteFn) {

        // API-Dokumentation: Stand und Update in Schritten (nur lokal)
        case 'api.status':
        case 'api.updateCancel':
        case 'api.updateFile':
        case 'api.updateFinish':
        case 'api.updateStart':
            require_once __DIR__ . '/api/ApiUpdate.php';
            try {
                $update = new ApiUpdate();
                switch ($request->remoteFn) {
                    case 'api.status':       $response->data = $update->getStatus(); break;
                    case 'api.updateCancel': $update->cancel(); $response->data = true; break;
                    case 'api.updateFile':   $response->data = $update->updateFile((int)($request->requestData->idx ?? -1)); break;
                    case 'api.updateFinish': $response->data = $update->finish(); break;
                    case 'api.updateStart':  $response->data = $update->start(); break;
                }
            } catch (Throwable $ex) {
                $response->errorMsg = $ex->getMessage();
            }
            break;

        // API-Dokumentation: Klassenseite
        case 'api.class':
            require_once __DIR__ . '/api/ApiReader.php';
            try {
                $response->data = (new ApiReader())->getClass((string)($request->requestData->name ?? ''));
            } catch (Throwable $ex) {
                $response->errorMsg = $ex->getMessage();
            }
            break;

        // API-Dokumentation: Lückenbericht
        case 'api.issues':
            require_once __DIR__ . '/api/ApiReader.php';
            try {
                $response->data = (new ApiReader())->getIssues();
            } catch (Throwable $ex) {
                $response->errorMsg = $ex->getMessage();
            }
            break;

        // Werkzeuge: Stand der generierten Dateien und Ausführen (nur lokal)
        case 'tools.run':
        case 'tools.status':
            require_once __DIR__ . '/tools/HomeTools.php';
            try {
                $tools = new HomeTools();
                switch ($request->remoteFn) {
                    case 'tools.run':    $response->data = $tools->run((string)($request->requestData->id ?? '')); break;
                    case 'tools.status': $response->data = $tools->getStatus(); break;
                }
            } catch (Throwable $ex) {
                $response->errorMsg = $ex->getMessage();
            }
            break;

        // Globale Suche über API, Leitfäden, Showcase und Tests
        case 'home.search':
            require_once __DIR__ . '/api/HomeSearch.php';
            try {
                $response->data = (new HomeSearch())->search((string)($request->requestData->query ?? ''));
            } catch (Throwable $ex) {
                $response->errorMsg = $ex->getMessage();
            }
            break;

        // API-Dokumentation: Klassenbaum
        case 'naviApi.load':
            require_once __DIR__ . '/api/ApiReader.php';
            try {
                $response->config = new stdClass();
                $response->config->data = (new ApiReader())->getTree();
            } catch (Throwable $ex) {
                $response->errorMsg = $ex->getMessage();
            }
            break;

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

print(json_encode($responses, JSON_HEX_TAG | JSON_HEX_AMP));



// ------------------------------------
// Hilfsfunktionen
// ------------------------------------
function _getNavigationRowsRec(string $rootDir, string $treeName, ?string $nodeId): array {
    $excludeFiles = ['.', '..'];

    $rows = [];

    $dirPath = $rootDir;
    if ($nodeId) {

        // sicherstellen, dass der übergebene Pfad ein Unterverzeichnis ist.
        // (Pfade sind relativ zum Ordner home, das Skript läuft in home/app)
        $realNode = realpath('../' . $nodeId);
        $realRoot = realpath('../' . $rootDir);
        if ($realNode === false || $realRoot === false || !str_starts_with($realNode, $realRoot)) {
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
