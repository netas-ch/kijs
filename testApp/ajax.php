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
                    $col->tooltip = 'Franz fährt im komplett verwahrlosten Taxi quer durch Bayern';
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
                    $col->caption = 'Zahl 1 NS';
                    $col->valueField = 'number1';
                    $col->editable = true;
                    $col->clicksToEdit = 1;
                    $col->sortable = false;
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
                    $row->icon = getIcon($rwId);
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




function getIcon($id) {
    $icons = [0xe005,0xe006,0xe00d,0xe012,0xe03f,0xe040,0xe041,0xe059,0xe05a,0xe05b,0xe05c,0xe05d,0xe05e,0xe05f,0xe060,0xe061,0xe062,0xe063,0xe064,0xe065,
        0xe066,0xe067,0xe068,0xe069,0xe06a,0xe06b,0xe06c,0xe06d,0xe06e,0xe06f,0xe070,0xe071,0xe072,0xe073,0xe074,0xe075,0xe076,0xe085,0xe086,0xe097,0xe098,
        0xe09a,0xe0a9,0xe0ac,0xe0b4,0xe0b7,0xe0bb,0xe0d8,0xe0df,0xe0e3,0xe0e4,0xe131,0xe139,0xe13a,0xe13b,0xe13c,0xe140,0xe152,0xe163,0xe169,0xe16d,0xe17b,
        0xe184,0xe185,0xe18f,0xe19a,0xe19b,0xe1a8,0xe1b0,0xe1bc,0xe1c4,0xe1c8,0xe1d3,0xe1d5,0xe1d7,0xe1ed,0xe1f3,0xe1f6,0xe209,0xe221,0xe222,0xe22d,0xe23d,
        0xe289,0xe29c,0xe2b7,0xe2bb,0xe2c5,0xe2ca,0xe2cd,0xe2ce,0xe2eb,0xe31e,0xe3af,0xe3b1,0xe3b2,0xe3f5,0xe433,0xe43b,0xe43c,0xe445,0xe447,0xe448,0xe46c,
        0xe473,0xe476,0xe477,0xe47a,0xe47b,0xe490,0xe493,0xe494,0xe4a5,0xe4a8,0xe4a9,0xe4aa,0xe4ab,0xe4ac,0xe4ad,0xe4af,0xe4b0,0xe4b3,0xe4b5,0xe4b6,0xe4b7,
        0xe4b8,0xe4b9,0xe4ba,0xe4bb,0xe4bc,0xe4bd,0xe4be,0xe4bf,0xe4c0,0xe4c1,0xe4c2,0xe4c3,0xe4c4,0xe4c5,0xe4c6,0xe4c7,0xe4c8,0xe4c9,0xe4ca,0xe4cb,0xe4cc,
        0xe4ce,0xe4cf,0xe4d0,0xe4d1,0xe4d2,0xe4d3,0xe4d4,0xe4d5,0xe4d6,0xe4d7,0xe4d8,0xe4d9,0xe4da,0xe4db,0xe4dc,0xe4dd,0xe4de,0xe4e0,0xe4e1,0xe4e2,0xe4e3,
        0xe4e4,0xe4e5,0xe4e6,0xe4e8,0xe4e9,0xe4ea,0xe4eb,0xe4ed,0xe4ee,0xe4ef,0xe4f0,0xe4f1,0xe4f2,0xe4f3,0xe4f4,0xe4f5,0xe4f6,0xe4f7,0xe4f8,0xe4f9,0xe4fa,
        0xe4fb,0xe4fc,0xe4fd,0xe4fe,0xe4ff,0xe500,0xe501,0xe502,0xe503,0xe507,0xe508,0xe509,0xe50a,0xe50b,0xe50c,0xe50d,0xe50e,0xe50f,0xe510,0xe511,0xe512,
        0xe513,0xe514,0xe515,0xe516,0xe517,0xe518,0xe519,0xe51a,0xe51b,0xe51c,0xe51d,0xe51e,0xe51f,0xe520,0xe521,0xe522,0xe523,0xe524,0xe525,0xe527,0xe528,
        0xe529,0xe52a,0xe52b,0xe52c,0xe52d,0xe52e,0xe52f,0xe531,0xe532,0xe533,0xe534,0xe535,0xe536,0xe537,0xe538,0xe539,0xe53a,0xe53b,0xe53c,0xe53d,0xe53e,
        0xe53f,0xe540,0xe541,0xe542,0xe543,0xe544,0xe545,0xe546,0xe547,0xe548,0xe549,0xe54a,0xe54b,0xe54c,0xe54d,0xe54e,0xe54f,0xe551,0xe552,0xe553,0xe554,
        0xe555,0xe556,0xe557,0xe558,0xe55a,0xe55b,0xe55c,0xe55d,0xe55e,0xe55f,0xe560,0xe561,0xe562,0xe563,0xe564,0xe565,0xe566,0xe567,0xe568,0xe569,0xe56a,
        0xe56b,0xe56c,0xe56d,0xe56e,0xe56f,0xe571,0xe572,0xe573,0xe574,0xe576,0xe577,0xe578,0xe579,0xe57a,0xe57b,0xe57c,0xe57d,0xe57e,0xe57f,0xe580,0xe581,
        0xe582,0xe583,0xe584,0xe585,0xe586,0xe587,0xe589,0xe58a,0xe58b,0xe58c,0xe58d,0xe58e,0xe58f,0xe591,0xe592,0xe593,0xe594,0xe595,0xe596,0xe597,0xe598,
        0xe599,0xe59a,0xe59c,0xe59d,0xf000,0xf001,0xf002,0xf004,0xf005,0xf007,0xf008,0xf009,0xf00a,0xf00b,0xf00c,0xf00d,0xf00e,0xf010,0xf011,0xf012,0xf013,
        0xf015,0xf017,0xf018,0xf019,0xf01c,0xf01e,0xf021,0xf022,0xf023,0xf024,0xf025,0xf026,0xf027,0xf028,0xf029,0xf02a,0xf02b,0xf02c,0xf02d,0xf02e,0xf02f,
        0xf030,0xf031,0xf032,0xf033,0xf034,0xf035,0xf036,0xf037,0xf038,0xf039,0xf03a,0xf03b,0xf03c,0xf03d,0xf03e,0xf041,0xf042,0xf043,0xf044,0xf047,0xf048,
        0xf049,0xf04a,0xf04b,0xf04c,0xf04d,0xf04e,0xf050,0xf051,0xf052,0xf053,0xf054,0xf055,0xf056,0xf057,0xf058,0xf059,0xf05a,0xf05b,0xf05e,0xf060,0xf061,
        0xf062,0xf063,0xf064,0xf065,0xf066,0xf068,0xf06a,0xf06b,0xf06c,0xf06d,0xf06e,0xf070,0xf071,0xf072,0xf073,0xf074,0xf075,0xf076,0xf077,0xf078,0xf079,
        0xf07a,0xf07b,0xf07c,0xf07d,0xf07e,0xf080,0xf083,0xf084,0xf085,0xf086,0xf089,0xf08b,0xf08d,0xf08e,0xf090,0xf091,0xf093,0xf094,0xf095,0xf098,0xf09c,
        0xf09d,0xf09e,0xf0a0,0xf0a1,0xf0a3,0xf0a4,0xf0a5,0xf0a6,0xf0a7,0xf0a8,0xf0a9,0xf0aa,0xf0ab,0xf0ac,0xf0ad,0xf0ae,0xf0b0,0xf0b1,0xf0b2,0xf0c0,0xf0c1,
        0xf0c2,0xf0c3,0xf0c4,0xf0c5,0xf0c6,0xf0c7,0xf0c8,0xf0c9,0xf0ca,0xf0cb,0xf0cc,0xf0cd,0xf0ce,0xf0d0,0xf0d1,0xf0d6,0xf0d7,0xf0d8,0xf0d9,0xf0da,0xf0db,
        0xf0dc,0xf0dd,0xf0de,0xf0e0,0xf0e2,0xf0e3,0xf0e7,0xf0e8,0xf0e9,0xf0ea,0xf0eb,0xf0ec,0xf0ed,0xf0ee,0xf0f0,0xf0f1,0xf0f2,0xf0f3,0xf0f4,0xf0f8,0xf0f9,
        0xf0fa,0xf0fb,0xf0fc,0xf0fd,0xf0fe,0xf100,0xf101,0xf102,0xf103,0xf104,0xf105,0xf106,0xf107,0xf109,0xf10a,0xf10b,0xf10d,0xf10e,0xf110,0xf111,0xf118,
        0xf119,0xf11a,0xf11b,0xf11c,0xf11e,0xf120,0xf121,0xf122,0xf124,0xf125,0xf126,0xf127,0xf129,0xf12b,0xf12c,0xf12d,0xf12e,0xf130,0xf131,0xf132,0xf133,
        0xf134,0xf135,0xf137,0xf138,0xf139,0xf13a,0xf13d,0xf13e,0xf140,0xf141,0xf142,0xf143,0xf144,0xf145,0xf146,0xf148,0xf149,0xf14a,0xf14b,0xf14c,0xf14d,
        0xf14e,0xf150,0xf151,0xf152,0xf153,0xf154,0xf156,0xf157,0xf158,0xf159,0xf15b,0xf15c,0xf15d,0xf15e,0xf160,0xf161,0xf162,0xf163,0xf164,0xf165,0xf175,
        0xf176,0xf177,0xf178,0xf182,0xf183,0xf185,0xf186,0xf187,0xf188,0xf191,0xf192,0xf193,0xf195,0xf197,0xf199,0xf19c,0xf19d,0xf1ab,0xf1ac,0xf1ad,0xf1ae,
        0xf1b0,0xf1b2,0xf1b3,0xf1b8,0xf1b9,0xf1ba,0xf1bb,0xf1c0,0xf1c1,0xf1c2,0xf1c3,0xf1c4,0xf1c5,0xf1c6,0xf1c7,0xf1c8,0xf1c9,0xf1cd,0xf1ce,0xf1d8,0xf1da,
        0xf1dc,0xf1dd,0xf1de,0xf1e0,0xf1e1,0xf1e2,0xf1e3,0xf1e4,0xf1e5,0xf1e6,0xf1ea,0xf1eb,0xf1ec,0xf1f6,0xf1f8,0xf1f9,0xf1fb,0xf1fc,0xf1fd,0xf1fe,0xf200,
        0xf201,0xf204,0xf205,0xf206,0xf207,0xf20a,0xf20b,0xf217,0xf218,0xf219,0xf21a,0xf21b,0xf21c,0xf21d,0xf21e,0xf221,0xf222,0xf223,0xf224,0xf225,0xf226,
        0xf227,0xf228,0xf229,0xf22a,0xf22b,0xf22c,0xf22d,0xf233,0xf234,0xf235,0xf236,0xf238,0xf239,0xf240,0xf241,0xf242,0xf243,0xf244,0xf245,0xf246,0xf247,
        0xf248,0xf249,0xf24d,0xf24e,0xf251,0xf252,0xf253,0xf254,0xf255,0xf256,0xf257,0xf258,0xf259,0xf25a,0xf25b,0xf25c,0xf25d,0xf26c,0xf271,0xf272,0xf273,
        0xf274,0xf275,0xf276,0xf277,0xf279,0xf27a,0xf28b,0xf28d,0xf290,0xf291,0xf293,0xf29a,0xf29d,0xf29e,0xf2a0,0xf2a1,0xf2a2,0xf2a3,0xf2a4,0xf2a7,0xf2a8,
        0xf2b4,0xf2b5,0xf2b6,0xf2b9,0xf2bb,0xf2bd,0xf2c1,0xf2c2,0xf2c7,0xf2c8,0xf2c9,0xf2ca,0xf2cb,0xf2cc,0xf2cd,0xf2ce,0xf2d0,0xf2d1,0xf2d2,0xf2d3,0xf2db,
        0xf2dc,0xf2e5,0xf2e7,0xf2ea,0xf2ed,0xf2f1,0xf2f2,0xf2f5,0xf2f6,0xf2f9,0xf2fe,0xf302,0xf303,0xf304,0xf305,0xf309,0xf30a,0xf30b,0xf30c,0xf31c,0xf31e,
        0xf328,0xf337,0xf338,0xf358,0xf359,0xf35a,0xf35b,0xf35d,0xf360,0xf362,0xf363,0xf386,0xf387,0xf390,0xf3a5,0xf3be,0xf3bf,0xf3c1,0xf3c5,0xf3c9,0xf3cd,
        0xf3ce,0xf3cf,0xf3d1,0xf3dd,0xf3e0,0xf3e5,0xf3ed,0xf3fa,0xf3fb,0xf3ff,0xf406,0xf410,0xf422,0xf424,0xf432,0xf433,0xf434,0xf436,0xf439,0xf43a,0xf43c,
        0xf43f,0xf441,0xf443,0xf445,0xf447,0xf44b,0xf44e,0xf450,0xf453,0xf458,0xf45c,0xf45d,0xf45f,0xf461,0xf462,0xf466,0xf468,0xf469,0xf46a,0xf46b,0xf46c,
        0xf46d,0xf470,0xf471,0xf472,0xf474,0xf477,0xf478,0xf479,0xf47e,0xf47f,0xf481,0xf482,0xf484,0xf485,0xf486,0xf487,0xf48b,0xf48d,0xf48e,0xf490,0xf491,
        0xf492,0xf493,0xf494,0xf496,0xf497,0xf49e,0xf4ad,0xf4b3,0xf4b8,0xf4b9,0xf4ba,0xf4bd,0xf4be,0xf4c0,0xf4c1,0xf4c2,0xf4c4,0xf4c6,0xf4cd,0xf4ce,0xf4d3,
        0xf4d6,0xf4d7,0xf4d8,0xf4d9,0xf4da,0xf4db,0xf4de,0xf4df,0xf4e2,0xf4e3,0xf4fa,0xf4fb,0xf4fc,0xf4fd,0xf4fe,0xf4ff,0xf500,0xf501,0xf502,0xf503,0xf504,
        0xf505,0xf506,0xf507,0xf508,0xf509,0xf515,0xf516,0xf517,0xf518,0xf519,0xf51a,0xf51b,0xf51c,0xf51d,0xf51e,0xf51f,0xf520,0xf521,0xf522,0xf523,0xf524,
        0xf525,0xf526,0xf527,0xf528,0xf529,0xf52a,0xf52b,0xf52d,0xf52e,0xf52f,0xf530,0xf532,0xf533,0xf534,0xf535,0xf537,0xf538,0xf539,0xf53a,0xf53b,0xf53c,
        0xf53d,0xf53e,0xf53f,0xf540,0xf542,0xf543,0xf544,0xf545,0xf546,0xf547,0xf548,0xf549,0xf54a,0xf54b,0xf54c,0xf54d,0xf54e,0xf54f,0xf550,0xf551,0xf552,
        0xf553,0xf554,0xf555,0xf556,0xf557,0xf558,0xf559,0xf55a,0xf55b,0xf55c,0xf55d,0xf55e,0xf55f,0xf560,0xf561,0xf562,0xf563,0xf564,0xf565,0xf566,0xf567,
        0xf568,0xf569,0xf56a,0xf56b,0xf56c,0xf56d,0xf56e,0xf56f,0xf570,0xf571,0xf572,0xf573,0xf574,0xf575,0xf576,0xf577,0xf578,0xf579,0xf57a,0xf57b,0xf57c,
        0xf57d,0xf57e,0xf57f,0xf580,0xf581,0xf582,0xf583,0xf584,0xf585,0xf586,0xf587,0xf588,0xf589,0xf58a,0xf58b,0xf58c,0xf58d,0xf58e,0xf58f,0xf590,0xf591,
        0xf593,0xf594,0xf595,0xf596,0xf597,0xf598,0xf599,0xf59a,0xf59b,0xf59c,0xf59d,0xf59f,0xf5a0,0xf5a1,0xf5a2,0xf5a4,0xf5a5,0xf5a6,0xf5a7,0xf5aa,0xf5ab,
        0xf5ac,0xf5ad,0xf5ae,0xf5af,0xf5b0,0xf5b1,0xf5b3,0xf5b4,0xf5b6,0xf5b7,0xf5b8,0xf5ba,0xf5bb,0xf5bc,0xf5bd,0xf5bf,0xf5c0,0xf5c1,0xf5c2,0xf5c3,0xf5c4,
        0xf5c5,0xf5c7,0xf5c8,0xf5c9,0xf5ca,0xf5cb,0xf5cd,0xf5ce,0xf5d0,0xf5d1,0xf5d2,0xf5d7,0xf5da,0xf5dc,0xf5de,0xf5df,0xf5e1,0xf5e4,0xf5e7,0xf5eb,0xf5ee,
        0xf5fc,0xf5fd,0xf601,0xf604,0xf610,0xf613,0xf619,0xf61f,0xf621,0xf624,0xf625,0xf629,0xf62a,0xf62e,0xf62f,0xf630,0xf637,0xf63b,0xf63c,0xf641,0xf644,
        0xf647,0xf64a,0xf64f,0xf651,0xf653,0xf654,0xf655,0xf658,0xf65d,0xf65e,0xf662,0xf664,0xf665,0xf666,0xf669,0xf66a,0xf66b,0xf66d,0xf66f,0xf674,0xf676,
        0xf678,0xf679,0xf67b,0xf67c,0xf67f,0xf681,0xf682,0xf683,0xf684,0xf687,0xf688,0xf689,0xf696,0xf698,0xf699,0xf69a,0xf69b,0xf6a0,0xf6a1,0xf6a7,0xf6a9,
        0xf6ad,0xf6b6,0xf6b7,0xf6bb,0xf6be,0xf6c0,0xf6c3,0xf6c4,0xf6c8,0xf6cf,0xf6d1,0xf6d3,0xf6d5,0xf6d7,0xf6d9,0xf6dd,0xf6de,0xf6e2,0xf6e3,0xf6e6,0xf6e8,
        0xf6ec,0xf6ed,0xf6f0,0xf6f1,0xf6f2,0xf6fa,0xf6fc,0xf6ff,0xf700,0xf70b,0xf70c,0xf70e,0xf714,0xf715,0xf717,0xf71e,0xf722,0xf728,0xf729,0xf72b,0xf72e,
        0xf72f,0xf73b,0xf73c,0xf73d,0xf740,0xf743,0xf747,0xf74d,0xf751,0xf752,0xf753,0xf756,0xf75a,0xf75b,0xf75e,0xf75f,0xf769,0xf76b,0xf76c,0xf76f,0xf770,
        0xf772,0xf773,0xf77c,0xf77d,0xf780,0xf781,0xf783,0xf784,0xf786,0xf787,0xf788,0xf78c,0xf793,0xf794,0xf796,0xf79c,0xf79f,0xf7a0,0xf7a2,0xf7a4,0xf7a5,
        0xf7a6,0xf7a9,0xf7aa,0xf7ab,0xf7ad,0xf7ae,0xf7b5,0xf7b6,0xf7b9,0xf7ba,0xf7bd,0xf7bf,0xf7c0,0xf7c2,0xf7c4,0xf7c5,0xf7c9,0xf7ca,0xf7cc,0xf7cd,0xf7ce,
        0xf7d0,0xf7d2,0xf7d7,0xf7d8,0xf7d9,0xf7da,0xf7e4,0xf7e5,0xf7e6,0xf7ec,0xf7ef,0xf7f2,0xf7f3,0xf7f5,0xf7f7,0xf7fa,0xf7fb,0xf802,0xf805,0xf806,0xf807,
        0xf80d,0xf80f,0xf810,0xf812,0xf815,0xf816,0xf818,0xf81d,0xf828,0xf829,0xf82a,0xf82f,0xf83e,0xf84a,0xf84c,0xf850,0xf853,0xf85e,0xf863,0xf86d,0xf879,
        0xf87b,0xf87c,0xf87d,0xf881,0xf882,0xf884,0xf885,0xf886,0xf887,0xf891,0xf897,0xf8c0,0xf8c1,0xf8cc,0xf8d7,0xf8d9,0xf8ef,0xf8ff];
    $cnt = count($icons);
    return $icons[$id % $cnt];

}