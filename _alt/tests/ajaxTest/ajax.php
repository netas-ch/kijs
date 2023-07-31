<?php
    $responses = array();
        
    $requests = json_decode(file_get_contents("php://input"));
    
    foreach ($requests as $request) {
        $response = new stdClass();
        $response->tid = $request->tid;
        
        switch ($request->remoteFn) {
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
                    $response->columns = array('Name', 'Vorname');
                    $response->rows = array(array('Muster','Peter'),array('Zürcher','Vreni'),array('Keller','Hans'),array('Müller','Max'),array('Tobler','Silvia'),array('Wehrli','Klara'),array('Zwahlen','Susanne'),array('Meier','Kurt'),array('Meier','Karin'),array('Schneider','Peter'),array('Koch','Marlies'),array('Koch','Stephan'),array('Wenger','Sandro'),array('Schuster','Lia'),array('Schuster','Franz'),array('Zürcher','Benjamin'),array('Kaiser','Sigfried'),array('Tanner','Ursula'),array('Tanner','Fred'),array('Kocher','Paul'),array('Schneeberger','Sandro'));
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
                                "data": {
                                    "xtype": "kijs.Data",
                                    "rows": [
                                        {"caption": "Herr", "value": "m"},
                                        {"caption": "Frau", "value": "w"},
                                        {"caption": "Familie", "value": "f"}
                                    ]
                                }
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

                    if ($fieldErrors && $fieldErrors !== new stdClass()) {
                        $response->fieldErrors = $fieldErrors;
                    }
                } catch (Exception $ex) {
                    $response->errorMsg = $ex->getMessage();
                }
                break;
            
            case 'test.test':
                try {                
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
                
        }
        
        $responses[] = $response;
    }
    
    print(json_encode($responses));
    
    