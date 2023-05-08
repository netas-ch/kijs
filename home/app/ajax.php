<?php

// Eigene Exception
class ki_Exception_Notice extends Exception {}

$responses = array();

$requests = json_decode(file_get_contents("php://input"));

foreach ($requests as $request) {
    $response = new stdClass();
    $response->tid = $request->tid;
    $response->responseData = new stdClass();

    switch ($request->facadeFn) {

        case 'naviDocu.load':
            $nodeId = $request->requestData->nodeId;
            $nodes = _readNavigationTree($nodeId, 'data/docu');
            $response->responseData->tree = $nodes;
            break;
        
        case 'naviShowcase.load':
            $nodeId = $request->requestData->nodeId;
            $nodes = _readNavigationTree($nodeId, 'data/showcase');
            $response->responseData->tree = $nodes;
            break;
        
        case 'naviTest.load':
            $nodeId = $request->requestData->nodeId;
            $nodes = _readNavigationTree($nodeId, 'data/test');
            $response->responseData->tree = $nodes;
            break;
            
        default:
            $response->errorMsg = 'FacadeFn "' . $request->facadeFn . '" existiert nicht.';
    }

    $responses[] = $response;
}

print(json_encode($responses));





// ------------------------------------
// Hilfsfunktionen
// ------------------------------------
function _readNavigationTree($nodeId, $rootDir) {
    $excludeFiles = ['.', '..'];
    
    $nodes = [];
    
    $dirPath = $nodeId ? $nodeId : $rootDir;
    
    $handle = opendir('../' . $dirPath);
    
    if ($handle) {
        while ( ($filename = readdir($handle)) !== false ) {
            $path = $dirPath . '/' . $filename;
                    
            // Unbenötigte Dateien ignorieren
            if (in_array($filename, $excludeFiles)) {
                continue;
            }
            
            $userData  = new stdClass();
            $userData->path = $path;
            $userData->filename = $filename;
            $userData->filetype = $ext = pathinfo($path, PATHINFO_EXTENSION);
            $userData->caption = str_replace('_', ' ', $filename);
            if ($userData->filetype) {
                $userData->caption = substr($userData->caption, 0, (strlen($userData->filetype)+1) * -1);
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
                    $userData->className = str_replace(' ', '_', $userData->caption);
                    break;
                    
                case 'md':
                    $userData->iconMap = 'kijs.iconMap.Fa.markdown';
                    
                    
                    $userData->markdown = file_get_contents('../' . $path);
                    break;
                
                default:
                    continue 2;
                    
            }
            
            
            $node = new stdClass();
            $node->caption = $userData->caption;
            $node->nodeId = $userData->path;
            if (!empty($userData->iconMap)) {
                $node->iconMap = $userData->iconMap;
            }
            $node->leaf = $userData->filetype !== '';
            $node->userData = $userData;
            $nodes[] = $node;
        }

        closedir($handle);
    }
    
    return $nodes;
}