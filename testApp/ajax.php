<?php
    require_once 'rpc/RpcResponseBase.php';
    require_once 'rpc/RpcResponseDefault.php';
    require_once 'rpc/RpcResponseCombo.php';
    require_once 'rpc/RpcResponseForm.php';
    
    $responses = array();
        
    $requests = json_decode(file_get_contents("php://input"));
    
    foreach ($requests as $request) {
        $response = new stdClass();
        $response->tid = $request->tid;
        $response->responseData = new RpcResponseDefault();
        
        switch ($request->facadeFn) {
            case 'address.load':
                try {
                    $response->responseData = new RpcResponseForm();
                    $response->responseData->setFormData(array(
                        'Passwort'=>'123',
                        'Checkbox'=>true,
                        'CheckboxIcon'=>false,
                        'CheckboxColor'=>2,
                        'CheckboxOption'=>'Aus',
                        'CheckboxGroup'=>array(1,3),
                        'CheckboxGroupInline'=>array('#f00', '#f0f'),
                        'RadioGroup'=>1,
                        'RadioGroupInline'=>3,
                        'Feld 1'=>'Text von RPC 1',
                        'Feld 2'=>'Text von RPC 2',
                        'Feld 3'=>'Text von RPC 3',
                        'Anrede'=>'m',
                        'editor'=>'bla();',
                        'Bemerkungen'=>"Meine Bemerkung\nvon RPC"
                    ));
                } catch (Exception $ex) {
                    $response->responseData->showErrorMsg($ex->getMessage());
                }
                break;
            
            case 'color.load':
                try {
                    $rows = array();
                    
                    $rows[] = array('Bez'=>'rot', 'color'=>'#f00', 'iconChar'=>'&#xf111');
                    $rows[] = array('Bez'=>'grün', 'color'=>'#0f0', 'iconChar'=>'&#xf111');
                    $rows[] = array('Bez'=>'blau', 'color'=>'#00f', 'iconChar'=>'&#xf111');
                    $rows[] = array('Bez'=>'gelb', 'color'=>'#ff0', 'iconChar'=>'&#xf111');
                    $rows[] = array('Bez'=>'violett', 'color'=>'#f0f', 'iconChar'=>'&#xf111');
                    $rows[] = array('Bez'=>'hellblau', 'color'=>'#0ff', 'iconChar'=>'&#xf111');
                    $response->responseData->rows = $rows;

                    //sleep(1);
                    
                } catch (Exception $ex) {
                    $response->responseData->showErrorMsg($ex->getMessage());
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
                    $response->responseData->showErrorMsg($ex->getMessage());
                }
                break;
            
            case 'land.load':
                try {
                    $rows = array();
                    
                    $rows[] = array('value'=>'CH', 'caption'=>'Schweiz');
                    $rows[] = array('value'=>'DE', 'caption'=>'Deutschland');
                    $rows[] = array('value'=>'IT', 'caption'=>'Italien');
                    $rows[] = array('value'=>'FR', 'caption'=>'Frankreich');

                    $response->responseData = new RpcResponseCombo();
                    $response->responseData->addRows($rows);
                    $response->responseData->addRows(array('value'=>'LI', 'caption'=>'Liechtenstein'));
                    //sleep(1);
                    
                } catch (Exception $ex) {
                    $response->responseData->showErrorMsg($ex->getMessage());
                }
                break;
            
            case 'test.load':
                try {
                    // Formular
                    $response->responseData = new RpcResponseForm();
                    $response->responseData->addItems(json_decode('
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
                    '));

                    // Formulardaten
                    $response->responseData->setFormData(array(
                        'Anrede'=>'w',
                        'Name'=>'Meier',
                        'Vorname'=>'Susanne'
                    ));
                } catch (Exception $ex) {
                    $response->responseData->showErrorMsg($ex->getMessage());
                }
                break;
            
            case 'test.save':
                try {
                
                    $fieldErrors = array();
                    $response->responseData = new RpcResponseForm();

                    $formData = $request->requestData->formData;

                    if (!property_exists($formData, 'Anrede')) {
                        throw new Exception("Das Feld 'Anrede' ist nicht vorhanden.");
                    }
                    
                    if ($formData->Vorname === 'Susanne' && $formData->Anrede !== 'w') {
                        $fieldErrors['Anrede'] = 'Falsche Anrede.';
                    }

                    if ($fieldErrors) {
                        $response->responseData->setFieldErrors($fieldErrors);
                        $response->responseData->showErrorMsg('Es wurden noch nicht alle Felder richtig ausgefüllt');
                    }
                } catch (Exception $ex) {
                    $response->responseData->showErrorMsg($ex->getMessage());
                }
                break;
            
            case 'test.test':
                try {
                    sleep(1);
                    $ignoreWarnings = property_exists($request, 'ignoreWarnings') && $request->ignoreWarnings;

                    if ($ignoreWarnings) {
                        $response->responseData->showInfoMsg('Habs geschafft','Gratuliere!');
                        $response->responseData->showInfoMsg('Bin völlig fertig.');
                    } else {
                        $response->responseData->showWarningMsg('Willst Du das wirklich tun?');
                    }
                    $response->responseData->showCornerTipMsg('Hänudehaut');
                    
                    $response->responseData->result = 'test';
                } catch (Exception $ex) {
                    $response->responseData->showErrorMsg($ex->getMessage());
                }
                break;
            
            default:
                $response->responseData->showErrorMsg('FacadeFn "' . $request->facadeFn . '" existiert nicht.');
        }

        if ($response->responseData instanceof RpcResponseBase) {
            foreach ($response->responseData->getMessages() as $key => $value) {
                $response->{$key} = $value;
            }
        }
        
        $responses[] = $response;
    }
    
    print(json_encode($responses));
    
    