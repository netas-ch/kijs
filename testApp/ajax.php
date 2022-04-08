<?php
$responses = array();

$requests = json_decode(file_get_contents("php://input"));

foreach ($requests as $request) {
    $response = new stdClass();
    $response->tid = $request->tid;
    $response->responseData = new stdClass();

    switch ($request->facadeFn) {
        case 'address.load':
            try {
                $response->responseData->formData = array(
                    'Passwort' => '123',
                    'Checkbox' => true,
                    'CheckboxIcon' => false,
                    'CheckboxColor' => 2,
                    'CheckboxOption' => 'Aus',
                    'CheckboxGroup' => array(1, 3),
                    'CheckboxGroupInline' => array('#f00', '#f0f'),
                    'RadioGroup' => 1,
                    'RadioGroupInline' => 3,
                    'Feld 1' => 'Text von RPC 1',
                    'Feld 2' => 'Text von RPC 2',
                    'Feld 3' => 'Text von RPC 3',
                    'Anrede' => 'm',
                    'editor' => 'bla();',
                    'Bemerkungen' => "Meine Bemerkung\nvon RPC",
                    'rangeStart' => '2021-01-10',
                    'rangeEnd' => '2021-01-20'
                );
            } catch (Exception $ex) {
                $response->errorMsg = $ex->getMessage();
            }
            break;

        case 'color.load':
            try {
                $rows = array();

                $rows[] = array('Bez' => 'rot', 'color' => '#f00', 'iconChar' => '&#xf111');
                $rows[] = array('Bez' => 'grün', 'color' => '#0f0', 'iconChar' => '&#xf111');
                $rows[] = array('Bez' => 'blau', 'color' => '#00f', 'iconChar' => '&#xf111');
                $rows[] = array('Bez' => 'gelb', 'color' => '#ff0', 'iconChar' => '&#xf111');
                $rows[] = array('Bez' => 'violett', 'color' => '#f0f', 'iconChar' => '&#xf111');
                $rows[] = array('Bez' => 'hellblau', 'color' => '#0ff', 'iconChar' => '&#xf111');
                $response->responseData->rows = $rows;

                //sleep(1);

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

        case 'land.load':
            try {
                $rows = array();

                $laender = file('testData/land.csv');

                foreach ($laender as $land) {
                    $land = explode(';', trim($land));
                    $rows[] = array('value' => $land[0], 'caption' => $land[1]);
                }

//                    $rows[] = array('value'=>'CH', 'caption'=>'Schweiz');
//                    $rows[] = array('value'=>'DE', 'caption'=>'Deutschland');
//                    $rows[] = array('value'=>'IT', 'caption'=>'Italien');
//                    $rows[] = array('value'=>'FR', 'caption'=>'Frankreich');

                $response->responseData->rows = $rows;
                //sleep(1);

            } catch (Exception $ex) {
                $response->errorMsg = $ex->getMessage();
            }
            break;

        case 'form.load':
            try {
                // Formular
                $response->responseData->form = json_decode('
                        [
                            {
                                "xtype": "kijs.gui.field.Combo",
                                "name": "Anrede",
                                "label": "Anrede",
                                "facadeFnLoad": "form.loadCombo",
                                "autoLoad": true
                            },{
                                "xtype": "kijs.gui.field.Text",
                                "name": "Name",
                                "label": "Name"
                            },{
                                "xtype": "kijs.gui.field.Text",
                                "name": "Vorname",
                                "label": "Vorname"
                            }
                        ]
                    ');

                // Formulardaten
                $response->responseData->formData = array(
                    'Anrede' => 'w',
                    'Name' => 'Meier',
                    'Vorname' => 'Susanne'
                );
            } catch (Exception $ex) {
                $response->errorMsg = $ex->getMessage();
            }
            break;

        case 'form.loadCombo':
            try {
                // Formular
                $response->responseData->rows = [
                    ['caption' => 'Herr', 'value' => 'm'],
                    ['caption' => 'Frau', 'value' => 'w'],
                    ['caption' => 'Sonstiges', 'value' => 'd']
                ];

            } catch (Exception $ex) {
                $response->errorMsg = $ex->getMessage();
            }
            break;

        case 'form.save':
            try {

                $fieldErrors = new stdClass();

                $formData = $request->requestData->formData;

                if (!property_exists($formData, 'Anrede')) {
                    throw new Exception("Das Feld 'Anrede' ist nicht vorhanden.");
                }

                if ($formData->Vorname === 'Susanne' && $formData->Anrede !== 'w') {
                    $fieldErrors->Anrede = 'Falsche Anrede.';
                }

                if (count(get_object_vars($fieldErrors))) {
                    $response->responseData->fieldErrors = $fieldErrors;
                    $response->errorMsg = 'Es wurden noch nicht alle Felder richtig ausgefüllt';
                }
            } catch (Exception $ex) {
                $response->errorMsg = $ex->getMessage();
            }
            break;

        case 'test.test':
            try {
                sleep(1);
                $ignoreWarnings = property_exists($request, 'ignoreWarnings') && $request->ignoreWarnings;

                if ($ignoreWarnings) {
                    $response->infoMsg = 'Habs geschafft';
                } else {
                    $response->warningMsg = 'Willst Du das wirklich tun?';
                }
                $response->cornerTipMsg = 'Hänudehaut';

                $response->responseData->result = 'test';
            } catch (Exception $ex) {
                $response->errorMsg = $ex->getMessage();
            }
            break;

        case 'grid.load':
            try {
                $start = (int)$request->requestData->start;
                $limit = (int)$request->requestData->limit;
                $vornamen = file('testData/vornamen.txt');

                // Spalten zurückgeben (wenn verlangt)
                if ($request->requestData->getMetaData === true) {
                    $response->responseData->columns = array();

                    $col = new stdClass();
                    $col->caption = 'Vorname';
                    $col->valueField = 'vorname';
                    $col->editable = true;
                    $response->responseData->columns[] = $col;
                    unset ($col);

                    $col = new stdClass();
                    $col->xtype = 'kijs.gui.grid.columnConfig.Number';
                    $col->caption = 'Zahl';
                    $col->valueField = 'number';

                    // nummern stylen
                    $numberStyles = [];
                    $numberStyle = new stdClass();
                    $numberStyle->color = '#000';
                    $numberStyle->fontWeight = 'normal';
                    $numberStyles[] = $numberStyle;

                    $numberStyle = new stdClass();
                    $numberStyle->from = 10;
                    $numberStyle->to = 30;
                    $numberStyle->color = '#FF0000';
                    $numberStyles[] = $numberStyle;

                    $numberStyle = new stdClass();
                    $numberStyle->from = 20;
                    $numberStyle->to = 40;
                    $numberStyle->fontWeight = 'bold';
                    $numberStyles[] = $numberStyle;

                    $col->numberStyles = $numberStyles;
                    $col->unitAfter = '%';

                    $response->responseData->columns[] = $col;
                    unset ($col);

                    $col = new stdClass();
                    $col->xtype = 'kijs.gui.grid.columnConfig.Icon';
                    $col->caption = 'Icon';
                    $col->valueField = 'vorname';
                    $col->iconCharField = 'icon';
                    $col->iconColorField = 'color';
                    $response->responseData->columns[] = $col;
                    unset ($col);

                    $col = new stdClass();
                    $col->xtype = 'kijs.gui.grid.columnConfig.Date';
                    $col->caption = 'Date';
                    $col->valueField = 'date';
                    $response->responseData->columns[] = $col;
                    unset ($col);


                    $col = new stdClass();
                    $col->caption = 'Combo';
                    $col->valueField = 'combovalue';
                    $col->displayField = 'combodisplay';
                    $col->editable = true;
                    $col->clicksToEdit = 1;
                    $col->editorXtype = 'kijs.gui.field.Combo';
                    $col->editorConfig = new stdClass();
                    $col->editorConfig->data = [
                        ['value' => 1, 'caption' => 'Datensatz 1'],
                        ['value' => 2, 'caption' => 'Datensatz 2'],
                        ['value' => 3, 'caption' => 'Datensatz 3']
                    ];
                    $response->responseData->columns[] = $col;
                    unset ($col);

                    $col = new stdClass();
                    $col->xtype = 'kijs.gui.grid.columnConfig.Number';
                    $col->caption = 'Zahl 1';
                    $col->valueField = 'number1';
                    $col->editable = true;
                    $col->clicksToEdit = 1;
                    $response->responseData->columns[] = $col;
                    unset ($col);

                    $col = new stdClass();
                    $col->xtype = 'kijs.gui.grid.columnConfig.Number';
                    $col->caption = 'Zahl 2';
                    $col->valueField = 'number2';
                    $col->editable = true;
                    $col->clicksToEdit = 1;
                    $response->responseData->columns[] = $col;
                    unset ($col);

                    $col = new stdClass();
                    $col->xtype = 'kijs.gui.grid.columnConfig.Checkbox';
                    $col->caption = 'Check';
                    $col->valueField = 'checkbox';
                    $col->disabled = false;
                    $response->responseData->columns[] = $col;
                    unset ($col);


                    for ($y = 0; $y < 26; $y++) {
                        $col = new stdClass();
                        $col->caption = 'Spalte ' . substr('ABCDEFGHIJKLMNOPQRSTUVWXYZ', $y, 1);
                        $col->valueField = 'field_' . strtolower(substr('ABCDEFGHIJKLMNOPQRSTUVWXYZ', $y, 1));
                        $col->visible = $y === 5 ? false : true; // F
                        $col->hideable = $y === 6 ? false : true; // G
                        $col->resizable = $y === 7 ? false : true; // H
                        $col->sortable = $y === 8 ? false : true; // I

                        // Filter mit checkbox
                        if ($y === 0) {
                            $col->filterConfig = new stdClass();
                            $col->filterConfig->checkboxFilterValues = ['A1', 'A2', 'A3'];
                        }

                        if ($y === 9) {
                            $col->width = 300;
                        }

                        $response->responseData->columns[] = $col;
                        unset ($col);
                    }

                    $response->responseData->primaryKeys = array('vorname');
                }

                // Zeilen zurückgeben
                $response->responseData->rows = array();
                for ($i = 0; $i < $limit; $i++) {
                    $rwId = $start + $i;

                    $row = new stdClass();
                    for ($y = 0; $y < 26; $y++) {
                        $row->{'field_' . strtolower(substr('ABCDEFGHIJKLMNOPQRSTUVWXYZ', $y, 1))} = substr('ABCDEFGHIJKLMNOPQRSTUVWXYZ', $y, 1) . $rwId;
                    }

                    $row->vorname = array_key_exists($rwId, $vornamen) ? $vornamen[$rwId] : '';
                    $row->number = $rwId;
                    $row->number1 = $rwId*2;
                    $row->number2 = null;
                    $row->date = time() + (3600 * 24 * $rwId);
                    $row->icon = '&#x' . dechex(61440 + $rwId);
                    $row->color = '#' . dechex($rwId * 100);
                    $row->checkbox = $rwId % 2 === 0;

                    $response->responseData->rows[] = $row;
                }

            } catch (Exception $ex) {
                $response->errorMsg = $ex->getMessage();
            }
            break;

        case 'combo.load':
            try {
                $query = $request->requestData->query; // suchbegriff
                $value = $request->requestData->value; // aktuell selektierte ID
                $rows = array();

                $berufe = file('testData/beruf.csv');
                foreach ($berufe as $beruf) {
                    $beruf = explode(';', trim($beruf));

                    if ($value === (int)$beruf[0] || ($query && mb_stristr($beruf[1], $query))) {
                        $rows[] = array('value' => (int)$beruf[0], 'caption' => $beruf[1]);
                    }
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

