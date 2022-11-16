<?php
$responses = array();

$requests = json_decode(file_get_contents("php://input"));

foreach ($requests as $request) {
    $response = new stdClass();
    $response->tid = $request->tid;
    $response->responseData = new stdClass();

    switch ($request->facadeFn) {

        case 'colors.load':
            try {
                $rows = array();

                $rows[] = array('Bez' => 'rot', 'color' => '#f00', 'iconChar' => 0xf111);
                $rows[] = array('Bez' => 'grün', 'color' => '#0f0', 'iconChar' => 0xf111);
                $rows[] = array('Bez' => 'blau', 'color' => '#00f', 'iconChar' => 0xf111);
                $rows[] = array('Bez' => 'gelb', 'color' => '#ff0', 'iconChar' => 0xf111);
                $rows[] = array('Bez' => 'violett', 'color' => '#f0f', 'iconChar' => 0xf111);
                $rows[] = array('Bez' => 'hellblau', 'color' => '#0ff', 'iconChar' => 0xf111);
                $response->responseData->rows = $rows;

                //sleep(1);

            } catch (Exception $ex) {
                $response->errorMsg = $ex->getMessage();
            }
            break;
        
        case 'combo.load':
            try {
                $query = $request->requestData->query; // suchbegriff
                $value = $request->requestData->value; // aktuell selektierte ID
                $noRemoteSort = ($request->requestData->remoteSort ?? null) == false; // Bei remoteSort=false alles zurückgeben
                $rows = array();
                
                // Bei remoteSort=false max. 100 Datensätze zurückgeben, weil sonst der Browser überfordert ist
                $count = 0;
                
                $berufe = file('../testData/beruf.csv');
                foreach ($berufe as $beruf) {
                    $beruf = explode(';', trim($beruf));
                    
                    if ($noRemoteSort) {
                        if ($count <= 100) {
                            $rows[] = array('value' => (int)$beruf[0], 'caption' => $beruf[1]);
                        }
                    } else {
                        if ($value === (int)$beruf[0] || ($query && mb_stristr($beruf[1], $query))) {
                            $rows[] = array('value' => (int)$beruf[0], 'caption' => $beruf[1]);
                        }
                    }
                    
                    $count++;
                }

                if ($query) {
                    usort($rows, function ($a, $b) use ($query) {
                        if (mb_strtolower(mb_substr($a['caption'], 0, mb_strlen($query))) === mb_strtolower($query)) {
                            return -1;
                        }
                        return 0;
                    });
                }

                $response->responseData->rows = $rows;

            } catch (Exception $ex) {
                $response->errorMsg = $ex->getMessage();
            }
            break;
            
        case 'dataview.load':
            try {
                $rows = array();

                $rows[] = array('Name' => 'Muster', 'Vorname' => 'Peter');
                $rows[] = array('Name' => 'Zürcher', 'Vorname' => 'Vreni');
                $rows[] = array('Name' => 'Keller', 'Vorname' => 'Hans');
                $rows[] = array('Name' => 'Müller', 'Vorname' => 'Max');
                $rows[] = array('Name' => 'Tobler', 'Vorname' => 'Silvia');
                $rows[] = array('Name' => 'Wehrli', 'Vorname' => 'Klara');
                $rows[] = array('Name' => 'Zwahlen', 'Vorname' => 'Susanne');
                $rows[] = array('Name' => 'Meier', 'Vorname' => 'Kurt');
                $rows[] = array('Name' => 'Meier', 'Vorname' => 'Karin');
                $rows[] = array('Name' => 'Schneider', 'Vorname' => 'Peter');
                $rows[] = array('Name' => 'Koch', 'Vorname' => 'Marlies');
                $rows[] = array('Name' => 'Koch', 'Vorname' => 'Stephan');
                $rows[] = array('Name' => 'Wenger', 'Vorname' => 'Sandro');
                $rows[] = array('Name' => 'Schuster', 'Vorname' => 'Lia');
                $rows[] = array('Name' => 'Schuster', 'Vorname' => 'Franz');
                $rows[] = array('Name' => 'Zürcher', 'Vorname' => 'Benjamin');
                $rows[] = array('Name' => 'Kaiser', 'Vorname' => 'Sigfried');
                $rows[] = array('Name' => 'Tanner', 'Vorname' => 'Ursula');
                $rows[] = array('Name' => 'Tanner', 'Vorname' => 'Fred');
                $rows[] = array('Name' => 'Kocher', 'Vorname' => 'Paul');
                $rows[] = array('Name' => 'Schneeberger', 'Vorname' => 'Sandro');

                $response->responseData->rows = $rows;
                $response->responseData->selectFilters = array();

                $filter = array();
                $flt = new stdClass();
                $flt->field = 'Name';
                $flt->value = 'Meier';
                $filter[] = $flt;
                $flt = new stdClass();
                $flt->field = 'Vorname';
                $flt->value = 'Kurt';
                $filter[] = $flt;
                $response->responseData->selectFilters[] = $filter;

                $filter = array();
                $flt = new stdClass();
                $flt->field = 'Name';
                $flt->value = 'Tobler';
                $filter[] = $flt;
                $flt = new stdClass();
                $flt->field = 'Vorname';
                $flt->value = 'Silvia';
                $filter[] = $flt;
                $response->responseData->selectFilters[] = $filter;


                //sleep(1);

            } catch (Exception $ex) {
                $response->errorMsg = $ex->getMessage();
            }
            break;
        
        case 'listView.loadColors':
            try {
                $rows = array();

                $rows[] = array('caption'=>'rot', 'color'=>'#f00', 'iconMap'=>'kijs.iconMap.Fa.circle');
                $rows[] = array('caption'=>'grün', 'color'=>'#0f0', 'iconMap'=>'kijs.iconMap.Fa.circle');
                $rows[] = array('caption'=>'blau', 'color'=>'#00f', 'iconMap'=>'kijs.iconMap.Fa.circle');
                $rows[] = array('caption'=>'gelb', 'color'=>'#ff0', 'iconMap'=>'kijs.iconMap.Fa.circle');
                $rows[] = array('caption'=>'violett', 'color'=>'#f0f', 'iconMap'=>'kijs.iconMap.Fa.circle');
                $rows[] = array('caption'=>'hellblau', 'color'=>'#0ff', 'iconMap'=>'kijs.iconMap.Fa.circle');
                $response->responseData->rows = $rows;

                //sleep(1);

            } catch (Exception $ex) {
                $response->errorMsg = $ex->getMessage();
            }
            break;
        
        case 'navigation.load':
            $nodeId = $request->requestData->nodeId;
            $nodes = _readNavigationTree($nodeId);
            $response->responseData->tree = $nodes;
            break;
        
        case 'tree.load':
            $tree = array();
            $nodeId = $request->requestData->nodeId;

            for ($i = 0; $i < 3; $i++) {
                $node = new stdClass();

                if ($nodeId === null) {
                    $node->caption = 'Root ' . $i;
                    $node->nodeId = $i;
                    $node->leaf = $i <> 1;
                } else {
                    $node->caption = 'Knoten ' . $nodeId . '-' . $i;
                    $node->nodeId = $nodeId . '-' . $i;
                    $node->leaf = $i <> 1;
                }
                $tree[] = $node;

            }

            // verzögerung um Lademaske anzuzeigen
            if ($nodeId !== null) {
                sleep(rand(0, 2));
            }

            $response->responseData->tree = $tree;
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
function _readNavigationTree($nodeId) {
    $rootDir = '../js';
    $extension = '.js';
    $excludeFiles = ['.', '..', 'sc.App.js'];
    
    $nodes = [];
    
    $handle = opendir($rootDir . '/' . $nodeId);
    
    if ($handle) {
        while ( ($filename = readdir($handle)) !== false ) {
            $path = $nodeId ? $nodeId . '/' . $filename : $filename;
                    
            // Unbenötigte Dateien ignorieren
            if (in_array($filename, $excludeFiles)) {
                continue;
            }
            
            // Verzeichnis
            if (is_dir($rootDir . '/' . $path)) {
                $node = new stdClass();
                $node->caption = str_replace('_', ' ', $filename);
                $node->nodeId = $path;
                $node->leaf = false;
                $nodes[] = $node;
                
            // js-Datei
            } else {
                if (!str_ends_with($filename, $extension)) {
                    continue;
                }
                
                $node = new stdClass();
                $node->caption = str_replace('_', ' ', substr($filename, 0, strlen($extension) * -1));
                $node->nodeId = $path;
                $node->iconMap = 'kijs.iconMap.Fa.file';
                $node->leaf = true;
                $nodes[] = $node;
                
            }
        }

        closedir($handle);
    }
    
    return $nodes;
}