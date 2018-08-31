<?php
    $responses = array();
        
    $requests = json_decode(file_get_contents("php://input"));
    
    foreach ($requests as $request) {
        $response = new stdClass();
        $response->tid = $request->tid;
        
        switch ($request->facadeFn) {
            case 'address.load':
                try {
                    $response->formData = array(
                        'Passwort'=>'123',
                        'Checkbox'=>true,
                        'CheckboxGroup'=>array(1,3),
                        'CheckboxGroupInline'=>array(2),
                        'RadioGroup'=>1,
                        'RadioGroupInline'=>3,
                        'Feld 1'=>'Text von RPC 1',
                        'Feld 2'=>'Text von RPC 2',
                        'Feld 3'=>'Text von RPC 3',
                        'Anrede'=>'m',
                        'editor'=>'bla();',
                        'Bemerkungen'=>"Meine Bemerkung\nvon RPC"
                    );
                } catch (Exception $ex) {
                    $response->errorMsg = $ex->getMessage();
                }
                break;
            
            case 'dataview.load':
                try {
                    $rows = array();
                    
                    $rows[] = array('Name'=>'Muster', 'Vorname'=>'Peter');
                    $rows[] = array('Name'=>'Zürcher', 'Vorname'=>'Vreni');
                    $rows[] = array('Name'=>'Keller', 'Vorname'=>'Hans');
                    $rows[] = array('Name'=>'Müller', 'Vorname'=>'Max');
                    $rows[] = array('Name'=>'Tobler', 'Vorname'=>'Silvia');
                    $rows[] = array('Name'=>'Wehrli', 'Vorname'=>'Klara');
                    $rows[] = array('Name'=>'Zwahlen', 'Vorname'=>'Susanne');
                    $rows[] = array('Name'=>'Meier', 'Vorname'=>'Kurt');
                    $rows[] = array('Name'=>'Meier', 'Vorname'=>'Karin');
                    $rows[] = array('Name'=>'Schneider', 'Vorname'=>'Peter');
                    $rows[] = array('Name'=>'Koch', 'Vorname'=>'Marlies');
                    $rows[] = array('Name'=>'Koch', 'Vorname'=>'Stephan');
                    $rows[] = array('Name'=>'Wenger', 'Vorname'=>'Sandro');
                    $rows[] = array('Name'=>'Schuster', 'Vorname'=>'Lia');
                    $rows[] = array('Name'=>'Schuster', 'Vorname'=>'Franz');
                    $rows[] = array('Name'=>'Zürcher', 'Vorname'=>'Benjamin');
                    $rows[] = array('Name'=>'Kaiser', 'Vorname'=>'Sigfried');
                    $rows[] = array('Name'=>'Tanner', 'Vorname'=>'Ursula');
                    $rows[] = array('Name'=>'Tanner', 'Vorname'=>'Fred');
                    $rows[] = array('Name'=>'Kocher', 'Vorname'=>'Paul');
                    $rows[] = array('Name'=>'Schneeberger', 'Vorname'=>'Sandro');
                    
                    $response->rows = $rows;
                    //sleep(1);
                    
                } catch (Exception $ex) {
                    $response->errorMsg = $ex->getMessage();
                }
                break;
            
            case 'land.load':
                try {
                    $rows = array();
                    
                    $rows[] = array('value'=>'CH', 'caption'=>'Schweiz');
                    $rows[] = array('value'=>'DE', 'caption'=>'Deutschland');
                    $rows[] = array('value'=>'IT', 'caption'=>'Italien');
                    $rows[] = array('value'=>'FR', 'caption'=>'Frankreich');
                    
                    $response->rows = $rows;
                    //sleep(1);
                    
                } catch (Exception $ex) {
                    $response->errorMsg = $ex->getMessage();
                }
                break;
            
            case 'test.load':
                try {
                    // Formular
                    $response->form = json_decode('
                        [
                            {
                                "xtype": "kijs.gui.field.Combo",
                                "name": "Anrede",
                                "label": "Anrede",
                                "data": [
                                    {"caption": "Herr", "value": "m"},
                                    {"caption": "Frau", "value": "w"},
                                    {"caption": "Familie", "value": "f"}
                                ]
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
                    $response->formData = array(
                        'Anrede'=>'w',
                        'Name'=>'Meier',
                        'Vorname'=>'Susanne'
                    );
                } catch (Exception $ex) {
                    $response->errorMsg = $ex->getMessage();
                }
                break;
            
            case 'test.save':
                try {
                
                    $fieldErrors = new stdClass();

                    $formData = $request->data->formData;

                    if (!property_exists($formData, 'Anrede')) {
                        throw new Exception("Das Feld 'Anrede' ist nicht vorhanden.");
                    }
                    
                    if ($formData->Vorname === 'Susanne' && $formData->Anrede !== 'w') {
                        $fieldErrors->Anrede = 'Falsche Anrede.';
                    }

                    if (count(get_object_vars($fieldErrors))) {
                        $response->fieldErrors = $fieldErrors;
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
                    
                    $response->result = 'test';
                } catch (Exception $ex) {
                    $response->errorMsg = $ex->getMessage();
                }
                break;
            
            default:
                $response->errorMsg = 'FacadeFn "' . $request->facadeFn . '" existiert nicht.';
        }
        
        $responses[] = $response;
    }
    
    print(json_encode($responses));
    
    