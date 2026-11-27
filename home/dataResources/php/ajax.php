<?php
declare(strict_types=1);

// Antwort immer als JSON ausliefern, damit der Browser sie nie als HTML interpretiert
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

// Eigene Exception
class ki_Exception_Notice extends Exception {}


$responses = array();

$requests = json_decode((string)file_get_contents("php://input")) ?: [];

foreach ($requests as $request) {
    $response = new stdClass();
    $response->tid = $request->tid;

    switch ($request->remoteFn) {

        case 'colors.load':
            try {
                $rows = [];

                $rows[] = array('Bez' => _getText('rot'), 'color' => '#f00', 'iconMap' => 'kijs.iconMap.Fa.droplet');
                $rows[] = array('Bez' => _getText('grün'), 'color' => '#0f0', 'iconMap' => 'kijs.iconMap.Fa.droplet');
                $rows[] = array('Bez' => _getText('blau'), 'color' => '#00f', 'iconMap' => 'kijs.iconMap.Fa.droplet');
                $rows[] = array('Bez' => _getText('gelb'), 'color' => '#ff0', 'iconMap' => 'kijs.iconMap.Fa.droplet');
                $rows[] = array('Bez' => _getText('violett'), 'color' => '#f0f', 'iconMap' => 'kijs.iconMap.Fa.droplet');
                $rows[] = array('Bez' => _getText('hellblau'), 'color' => '#0ff', 'iconMap' => 'kijs.iconMap.Fa.droplet');
                
                $response->config = new stdClass();
                //$response->config->value = ['#0f0'];
                $response->config->data = $rows;

                //sleep(1);

            } catch (Exception $ex) {
                $response->errorMsg = $ex->getMessage();
            }
            break;

        case 'combo.beruf.load':
            // Dieser rpcLoadFn unterstützt kijs.gui.field.Combo mit enableRemoteFiltering:true
            // und auch solche mit enableRemoteFiltering:false
            try {
                // Feldnamen
                $valueField = 'BerufId';
                $displayTextField = 'Beruf';

                // Berufe laden
                $rows = _loadJsonFile('../testData/beruf.json');

                if (!isset($response->config)) {
                    $response->config = new stdClass();
                }

                // 1. Aufruf?
                $initialLoad = $request->requestData->initialLoad ?? false;

                // Daten laden (beim 1. Aufruf oder wenn query vorhanden)
                if (isset($request->requestData->query) || $initialLoad) {
                    // Suchbegriff = '' --> alle
                    $query = '';
                    if (isset($request->requestData->query)) {
                        $query = strval($request->requestData->query);
                    }

                    // Vergleichsart 'BEGIN' oder 'PART'
                    $queryOperator = 'BEGIN';
                    if (isset($request->requestData->queryOperator)) {
                        $queryOperator = strval($request->requestData->queryOperator);
                    }

                    // Anzahl Datensätze, die maximal zurückgegeben werden dürfen (0=unbeschränkt)
                    $queryLimit = 0;
                    if (isset($request->requestData->queryLimit)) {
                        $queryLimit = (int) $request->requestData->queryLimit;
                    }

                    // Daten filtern
                    $response->config->data = _recordsetFilter($rows, $displayTextField,
                            $query, $queryOperator, $queryLimit);
                }


                // valueRow ermitteln
                if (isset($request->requestData->value)) {
                    $value = strval($request->requestData->value);

                    // Beispiel für ein Land das es nicht mehr gibt
                    if ($value === '99999') {
                        $response->config->valueRow = json_decode('{"BerufId":99999, "Beruf":"Weihnachtsmann"}');

                    } else {
                        $response->config->valueRow = _recordsetGetRowFromValue(
                                $rows, $valueField, $value);
                    }
                }

                
                // Evtl. beim 1. Aufruf noch weitere Config-Argumente mitgeben
                if (!empty($request->requestData->initialLoad)) {
                    //$response->config->value = 1889;
                    //$response->config->valueRow = array('BerufId'=>1889, 'Beruf'=>'Anknüpfer');

                    //$response->config->value = 129234;
                    //$response->config->valueRow = array('BerufId'=>129234, 'Beruf'=>'Beruf, den es nicht mehr gibt');
                }

            } catch (Exception $ex) {
                $response->errorMsg = $ex->getMessage();
            }
            break;

        case 'combo.farbe.load':
            try {
                $rows = [];

                $rows[] = array('displayText'=>_getText('rot'),     'color'=>'#f00', 'iconMap'=>'kijs.iconMap.Fa.droplet');
                $rows[] = array('displayText'=>_getText('grün'),    'color'=>'#0f0', 'iconMap'=>'kijs.iconMap.Fa.droplet');
                $rows[] = array('displayText'=>_getText('blau'),    'color'=>'#00f', 'iconMap'=>'kijs.iconMap.Fa.droplet');
                $rows[] = array('displayText'=>_getText('gelb'),    'color'=>'#ff0', 'iconMap'=>'kijs.iconMap.Fa.droplet');
                $rows[] = array('displayText'=>_getText('violett'), 'color'=>'#f0f', 'iconMap'=>'kijs.iconMap.Fa.droplet');
                $rows[] = array('displayText'=>_getText('hellblau'),'color'=>'#0ff', 'iconMap'=>'kijs.iconMap.Fa.droplet');

                $response->config = new stdClass();
                $response->config->value = '#0f0';
                $response->config->data = $rows;

                //sleep(1);

            } catch (Exception $ex) {
                $response->errorMsg = $ex->getMessage();
            }
            break;

        case 'combo.land.load':
            try {
                $response->config = new stdClass();
                $response->config->data = _translateCountries(_loadJsonFile('../testData/land.json'));
                //sleep(1);

            } catch (Exception $ex) {
                $response->errorMsg = $ex->getMessage();
            }
            break;

        case 'combo.stadt.load':
            try {
                $response->config = new stdClass();
                $response->config->data = _loadJsonFile('../testData/stadt.json');

            } catch (Exception $ex) {
                $response->errorMsg = $ex->getMessage();
            }
            break;
            
        case 'container.load':
            try {
                // config
                $response->config = json_decode('
                    {
                        "elements": [
                            {
                                "xtype": "kijs.gui.Button",
                                "height": 40,
                                "caption": ' . json_encode(_getText('Button vom Server')) . ',
                                "on": {
                                    "click": "home.sc.Container.onRpcButtonClick"
                                }
                            }
                        ]
                    }
                ');
                
                sleep(1);
                
            } catch (Exception $ex) {
                $response->errorMsg = $ex->getMessage();
            }
            break;
        
        case 'containerStack.load':
            try {
                // config
                $response->config = json_decode('
                    {
                        "style": { "flex": 1 },
                        
                        "defaults":{
                            "xtype": "kijs.gui.Container",
                            "innerStyle": { "padding":"10px" }
                        },
                        "elements": [
                            { "name":"s1", "html":' . json_encode(_getText('Seite %1', '', 1)) . ', "style":{"backgroundColor":"#f99"} },
                            { "name":"s2", "html":' . json_encode(_getText('Seite %1', '', 2)) . ', "style":{"backgroundColor":"#9f9"} },
                            { "name":"s3", "html":' . json_encode(_getText('Seite %1', '', 3)) . ', "style":{"backgroundColor":"#99f"} },
                            { "name":"s4", "html":' . json_encode(_getText('Seite %1', '', 4)) . ', "style":{"backgroundColor":"#ff9"} },
                            { "name":"s5", "html":' . json_encode(_getText('Seite %1', '', 5)) . ', "style":{"backgroundColor":"#9ff"} }
                        ]
                    }
                ');
                
                //sleep(1);
                
            } catch (Exception $ex) {
                $response->errorMsg = $ex->getMessage();
            }
            break;
        
        case 'containerTab.load':
            try {
                // config
                $response->config = json_decode('
                    {
                        "elements": [
                            { "name":"b1", "tabCaption":"B 1", "tabIconMap":"kijs.iconMap.Fa.house", "html":"B 1", "innerStyle":{ "color":"#f99"} },
                            { "name":"b2", "tabCaption":"B 2", "tabIconMap":"kijs.iconMap.Fa.user", "html":"B 2", "innerStyle":{ "color":"#9f9"} },
                            { "name":"b3", "tabCaption":"B 3", "tabIconMap":"kijs.iconMap.Fa.phone", "html":"B 3", "innerStyle":{ "color":"#99f"} },
                            { "name":"b4", "tabCaption":"B 4", "tabIconMap":"kijs.iconMap.Fa.envelope", "html":"B 4", "innerStyle":{ "color":"#f9f" }, "disabled":true },
                            { "name":"b5", "tabCaption":"B 5", "tabIconMap":"kijs.iconMap.Fa.location-dot", "html":"B 5", "innerStyle":{ "color":"#9ff" } }
                        ]
                    }
                ');
                
                //sleep(1);
                
            } catch (Exception $ex) {
                $response->errorMsg = $ex->getMessage();
            }
            break;
        
        case 'containerTab.save':
            try {
                // config
                $response->cornerTipMsg = _getText('Gespeichert (Demo: die Daten werden nicht wirklich gespeichert)');
                
                //sleep(1);
                
            } catch (Exception $ex) {
                $response->errorMsg = $ex->getMessage();
            }
            break;
        
        case 'dashboard.load':
            try {
                // config
                $response->config = json_decode('
                    {
                        "elements": [
                            {
                                "xtype": "kijs.gui.dashboard.Column",
                                "elements": [
                                    {
                                        "xtype":"kijs.gui.dashboard.Panel",
                                        "caption": "Info",
                                        "iconMap":"kijs.iconMap.Fa.circle-info",
                                        "html":' . json_encode(_getText('Dies ist ein <b>Info</b>-Text.')) . ',
                                        "innerStyle": { "padding": "10px" }
                                    },{
                                        "xtype":"home.sc.DashboardItemPanel",
                                        "caption": ' . json_encode(_getText('Elemente %1', '', 1)) . ',
                                        "elements": [
                                            {
                                                "xtype": "kijs.gui.Element",
                                                "height": 31,
                                                "ddSource":{
                                                    "name": "dashboardItem",
                                                    "allowMove": true,
                                                    "allowCopy": false,
                                                    "allowLink": false
                                                },
                                                "html": ' . json_encode(_getText('Element %1 (verschieben)', '', 1)) . ',
                                                "style": {
                                                    "padding": "4px 10px",
                                                    "border": "1px solid var(--panel-borderColor)",
                                                    "borderRadius": "5px",
                                                    "backgroundColor": "var(--viewport-bkgrndColor)"
                                                }
                                            },{
                                                "xtype": "kijs.gui.Element",
                                                "height": 31,
                                                "ddSource":{
                                                    "name": "dashboardItem",
                                                    "allowMove": true,
                                                    "allowCopy": false,
                                                    "allowLink": false
                                                },
                                                "html": ' . json_encode(_getText('Element %1 (verschieben)', '', 2)) . ',
                                                "style": {
                                                    "padding": "4px 10px",
                                                    "border": "1px solid var(--panel-borderColor)",
                                                    "borderRadius": "5px",
                                                    "backgroundColor": "var(--viewport-bkgrndColor)"
                                                }
                                            },{
                                                "xtype": "kijs.gui.Element",
                                                "height": 31,
                                                "ddSource":{
                                                    "name": "dashboardItem",
                                                    "allowMove": true,
                                                    "allowCopy": false,
                                                    "allowLink": false
                                                },
                                                "html": ' . json_encode(_getText('Element %1 (verschieben)', '', 3)) . ',
                                                "style": {
                                                    "padding": "4px 10px",
                                                    "border": "1px solid var(--panel-borderColor)",
                                                    "borderRadius": "5px",
                                                    "backgroundColor": "var(--viewport-bkgrndColor)"
                                                }
                                            },{
                                                "xtype": "kijs.gui.Element",
                                                "height": 31,
                                                "ddSource":{
                                                    "name": "dashboardItem",
                                                    "allowMove": true,
                                                    "allowCopy": false,
                                                    "allowLink": false
                                                },
                                                "html": ' . json_encode(_getText('Element %1 (verschieben)', '', 4)) . ',
                                                "style": {
                                                    "padding": "4px 10px",
                                                    "border": "1px solid var(--panel-borderColor)",
                                                    "borderRadius": "5px",
                                                    "backgroundColor": "var(--viewport-bkgrndColor)"
                                                }
                                            }
                                        ]
                                    },{
                                        "xtype":"home.sc.DashboardItemPanel",
                                        "caption": ' . json_encode(_getText('Elemente %1', '', 2)) . ',
                                        "elements": [
                                            {
                                                "xtype": "kijs.gui.Element",
                                                "height": 31,
                                                "ddSource":{
                                                    "name": "dashboardItem",
                                                    "allowMove": false,
                                                    "allowCopy": true,
                                                    "allowLink": false
                                                },
                                                "html": ' . json_encode(_getText('Element (kopieren)')) . ',
                                                "style": {
                                                    "padding": "4px 10px",
                                                    "border": "var(--panel-borderColor)",
                                                    "borderRadius": "5px",
                                                    "backgroundColor": "var(--viewport-bkgrndColor)"
                                                }
                                            }
                                        ]
                                    }
                                ]
                            },{
                                "xtype": "kijs.gui.dashboard.Column",
                                "elements": [
                                    {
                                        "xtype":"home.sc.DashboardFormPanel",
                                        "caption": ' . json_encode(_getText('Formular')) . ',
                                        "rpcLoadFn":"dashboardFormPanel.load",
                                        "rpcSaveFn":"dashboardFormPanel.save",
                                        "autoLoad":true
                                    }
                                ]
                            },{
                                "xtype": "kijs.gui.dashboard.Column",
                                "elements": [
                                    {
                                        "xtype":"home.sc.DashboardFormPanel",
                                        "caption": ' . json_encode(_getText('Formular')) . ',
                                        "rpcLoadFn":"dashboardFormPanel.load",
                                        "rpcSaveFn":"dashboardFormPanel.save",
                                        "autoLoad":true
                                    }
                                ]
                            }
                        ]
                    }
                ');
                
                //sleep(1);
                
            } catch (Exception $ex) {
                $response->errorMsg = $ex->getMessage();
            }
            break;
        
        case 'dashboard.save':
            try {
                // config
                $response->cornerTipMsg = _getText('Gespeichert (Demo: die Daten werden nicht wirklich gespeichert)');
                
                //sleep(1);
                
            } catch (Exception $ex) {
                $response->errorMsg = $ex->getMessage();
            }
            break;
        
        case 'dashboardFormPanel.load':
            try {
                $response->config = new stdClass();
                $response->config->data = json_decode('
                    {
                        "memo":' . json_encode(_getText('Ich bin eine Bemerkung!')) . '
                    }
                ');
                
                sleep(1);
                
            } catch (Exception $ex) {
                $response->errorMsg = $ex->getMessage();
            }
            break;
        
        case 'dashboardFormPanel.save':
            try {
                // config
                $response->cornerTipMsg = _getText('Gespeichert (Demo: die Daten werden nicht wirklich gespeichert)');
                
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
                $rows[] = array('Name' => 'Wenger', 'Vorname' => 'Sandro', 'Deaktiviert' => 1);
                $rows[] = array('Name' => 'Schuster', 'Vorname' => 'Lia', 'Deaktiviert' => 1);
                $rows[] = array('Name' => 'Schuster', 'Vorname' => 'Franz');
                $rows[] = array('Name' => 'Zürcher', 'Vorname' => 'Benjamin');
                $rows[] = array('Name' => 'Kaiser', 'Vorname' => 'Sigfried', 'Deaktiviert' => 1);
                $rows[] = array('Name' => 'Tanner', 'Vorname' => 'Ursula');
                $rows[] = array('Name' => 'Tanner', 'Vorname' => 'Fred');
                $rows[] = array('Name' => 'Kocher', 'Vorname' => 'Paul');
                $rows[] = array('Name' => 'Schneeberger', 'Vorname' => 'Sandro');

                $response->config = new stdClass();
                $response->config->primaryKeyFields = ['Name','Vorname'];
                $response->config->disabledField = 'Deaktiviert';
                $response->config->data = $rows;

                $filter = array();
                $selectFilters = '
                    {
                     "operator":"OR",
                     "parts":[
                      {
                       "operator":"AND",
                       "parts": [
                        { "field":"Name", "value":"Meier" },
                        { "field":"Vorname", "value":"Kurt" }
                       ]
                      },{
                       "operator":"AND",
                       "parts": [
                        { "field":"Name", "value":"Tobler" },
                        { "field":"Vorname", "value":"Silvia" }
                       ]
                      }
                     ]
                    }
                ';
                $response->config->selectFilters = json_decode($selectFilters);

                /*$filter = array();
                $flt = new stdClass();
                $flt->field = 'Name';
                $flt->value = 'Meier';
                $filter[] = $flt;
                $flt = new stdClass();
                $flt->field = 'Vorname';
                $flt->value = 'Kurt';
                $filter[] = $flt;
                $response->config->selectFilters[] = $filter;

                $filter = array();
                $flt = new stdClass();
                $flt->field = 'Name';
                $flt->value = 'Tobler';
                $filter[] = $flt;
                $flt = new stdClass();
                $flt->field = 'Vorname';
                $flt->value = 'Silvia';
                $filter[] = $flt;
                $response->config->selectFilters[] = $filter;*/
                
                //sleep(1);

            } catch (Exception $ex) {
                $response->errorMsg = $ex->getMessage();
            }
            break;
        
        case 'dataview.save':
            try {
                // config
                $response->cornerTipMsg = _getText('Gespeichert (Demo: die Daten werden nicht wirklich gespeichert)');
                
                //sleep(1);
                
            } catch (Exception $ex) {
                $response->errorMsg = $ex->getMessage();
            }
            break;
        
        case 'element.load':
            try {
                // config
                $response->config = json_decode('
                    {
                        "html": ' . json_encode(_getText('Ich wurde geladen :)')) . ',
                        "tooltip": ' . json_encode(_getText('Ich bin ein Tooltip vom Server')) . '
                    }
                ');
                
                sleep(1);
                
            } catch (Exception $ex) {
                $response->errorMsg = $ex->getMessage();
            }
            break;
        
        case 'form.load':
            try {
                $response->config = new stdClass();
                
                // Formular
                $response->config->elements = json_decode('
                    [
                        {
                            "xtype": "kijs.gui.field.Combo",
                            "name": "Anrede",
                            "label": ' . json_encode(_getText('Anrede')) . ',
                            "rpcLoadFn": "form.loadCombo",
                            "autoLoad": true,
                            "disableFlex":true
                        },{
                            "xtype": "kijs.gui.field.Text",
                            "name": "Name",
                            "label": ' . json_encode(_getText('Name')) . '
                        },{
                            "xtype": "kijs.gui.field.Text",
                            "name": "Vorname",
                            "label": ' . json_encode(_getText('Vorname')) . '
                        },{
                            "xtype": "kijs.gui.field.Combo",
                            "name": "BerufId",
                            "label": ' . json_encode(_getText('Beruf')) . ',
                            "rpcLoadFn": "combo.beruf.load",
                            "valueField": "BerufId",
                            "displayTextField": "Beruf",
                            "enableRemoteFiltering": true,
                            "autoLoad": false,
                            "on":{
                             "change": "console.log"
                            }
                        }
                    ]
                ');

                // Formulardaten
                $response->config->data = array(
                    'Anrede' => 'w',
                    'Name' => 'Meier',
                    'Vorname' => 'Susanne',
                    'BerufId' => 18675
                );
                
                //sleep(1);
                
            } catch (Exception $ex) {
                $response->errorMsg = $ex->getMessage();
            }
            break;
        
        case 'form.loadCombo':
            try {
                $response->config = new stdClass();
                $response->config->data = [
                    ['displayText' => _getText('Herr'), 'value' => 'm'],
                    ['displayText' => _getText('Frau'), 'value' => 'w']
                ];

            } catch (Exception $ex) {
                $response->errorMsg = $ex->getMessage();
            }
            break;
        
        case 'form.save':
            try {

                $fieldErrors = new stdClass();

                $formData = $request->requestData->data;

                if (!property_exists($formData, 'Anrede')) {
                    throw new Exception("Das Feld 'Anrede' ist nicht vorhanden.");
                }

                if ($formData->Vorname === 'Susanne' && $formData->Anrede !== 'w') {
                    $fieldErrors->Anrede = _getText('Falsche Anrede.');
                }

                if (count(get_object_vars($fieldErrors))) {
                    $response->fieldErrors = $fieldErrors;
                    $response->errorMsg = _getText('Es wurden noch nicht alle Felder richtig ausgefüllt');
                    $response->errorType = 'errorNotice';
                }
            } catch (Exception $ex) {
                $response->errorMsg = $ex->getMessage();
            }
            break;
            
        case 'grid.load':
            try {
                $config = $request->requestData->config ?? new stdClass();
            
            
                $start = (int)($config->start ?? 0);
                $limit = (int)($config->limit ?? 100);
                $vornamen = file('../testData/vornamen.txt', FILE_IGNORE_NEW_LINES);

                // Spalten zurückgeben (wenn verlangt)
                if ($config->getMetaData === true) {
                    $response->columnConfigs = array();

                    $col = new stdClass();
                    $col->caption = _getText('Vorname');
                    $col->valueField = 'vorname';
                    $col->editable = true;
                    $response->columnConfigs[] = $col;
                    unset ($col);

                    $col = new stdClass();
                    $col->xtype = 'kijs.gui.grid.columnConfig.Number';
                    $col->caption = _getText('Zahl');
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

                    $response->columnConfigs[] = $col;
                    unset ($col);

                    $col = new stdClass();
                    $col->xtype = 'kijs.gui.grid.columnConfig.Icon';
                    $col->caption = 'Icon';
                    $col->iconCharField = 'icon';
                    $col->iconColorField = 'color';
                    $col->tooltipField = 'iconText';
                    $col->iconsCnt = 10;
                    $response->columnConfigs[] = $col;
                    unset ($col);

                    // Status-Icon mit Tooltip und Icon-Auswahl im Filter
                    $col = new stdClass();
                    $col->xtype = 'kijs.gui.grid.columnConfig.Icon';
                    $col->caption = 'Status';
                    $col->iconMapField = 'status';
                    $col->iconColorField = 'statusColor';
                    $col->tooltipField = 'statusText';
                    $col->iconsCnt = 10;
                    $col->width = 70;
                    $response->columnConfigs[] = $col;
                    unset ($col);

                    $col = new stdClass();
                    $col->xtype = 'kijs.gui.grid.columnConfig.Date';
                    $col->caption = _getText('Datum');
                    $col->valueField = 'date';
                    $response->columnConfigs[] = $col;
                    unset ($col);


                    $col = new stdClass();
                    $col->caption = 'Combo';
                    $col->valueField = 'value';
                    $col->displayField = 'displayText';
                    $col->tooltip = _getText('Franz fährt im komplett verwahrlosten Taxi quer durch Bayern');
                    $col->editable = true;
                    $col->clicksToEdit = 1;
                    $col->editorXtype = 'kijs.gui.field.Combo';
                    $col->editorConfig = new stdClass();
                    $col->editorConfig->data = [
                        ['value' => 1, 'displayText' => _getText('Datensatz %1', '', 1)],
                        ['value' => 2, 'displayText' => _getText('Datensatz %1', '', 2)],
                        ['value' => 3, 'displayText' => _getText('Datensatz %1', '', 3)]
                    ];
                    $response->columnConfigs[] = $col;
                    unset ($col);

                    $col = new stdClass();
                    $col->xtype = 'kijs.gui.grid.columnConfig.Number';
                    $col->caption = _getText('Zahl %1', '', 1) . ' NS';
                    $col->valueField = 'number1';
                    $col->editable = true;
                    $col->clicksToEdit = 1;
                    $col->sortable = false;
                    $response->columnConfigs[] = $col;
                    unset ($col);

                    $col = new stdClass();
                    $col->xtype = 'kijs.gui.grid.columnConfig.Number';
                    $col->caption = _getText('Zahl %1', '', 2);
                    $col->valueField = 'number2';
                    $col->editable = true;
                    $col->clicksToEdit = 1;
                    $response->columnConfigs[] = $col;
                    unset ($col);

                    $col = new stdClass();
                    $col->xtype = 'kijs.gui.grid.columnConfig.Checkbox';
                    $col->caption = 'Check';
                    $col->valueField = 'checkbox';
                    $col->editable = false;
                    $response->columnConfigs[] = $col;
                    unset ($col);


                    for ($y=0; $y<26; $y++) {
                        $col = new stdClass();
                        $col->caption = _getText('Spalte %1', '', substr('ABCDEFGHIJKLMNOPQRSTUVWXYZ', $y, 1));
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

                        $response->columnConfigs[] = $col;
                        unset ($col);
                    }

                    $response->primaryKeys = array('number');
                }

                // Alle Zeilen erzeugen, filtern und sortieren
                $rows = [];
                for ($rwId = 0; $rwId < 1000; $rwId++) {
                    $rows[] = _gridGetRow($rwId, $vornamen);
                }
                $rows = _gridFilterRows($rows, is_array($config->filter ?? null) ? $config->filter : []);
                if (isset($config->sort) && is_object($config->sort) && !empty($config->sort->field)) {
                    $rows = _gridSortRows($rows, (string)$config->sort->field, (string)($config->sort->direction ?? 'ASC'));
                    $response->sort = $config->sort;
                }

                // Gewünschten Bereich zurückgeben
                $response->count = count($rows);
                $response->rows = array_slice($rows, $start, $limit);

            } catch (Exception $ex) {
                $response->errorMsg = $ex->getMessage();
            }
            break;
        
        case 'land.load':
            try {
                $response->config = new stdClass();
                $response->config->data = _translateCountries(_loadJsonFile('../testData/land.json'));
                //sleep(1);

            } catch (Exception $ex) {
                $response->errorMsg = $ex->getMessage();
            }
            break;
            
        case 'listView.loadColors':
            try {
                $rows = array();

                $rows[] = array('displayText'=>_getText('rot'), 'color'=>'#f00', 'iconMap'=>'kijs.iconMap.Fa.droplet');
                $rows[] = array('displayText'=>_getText('grün'), 'color'=>'#0f0', 'iconMap'=>'kijs.iconMap.Fa.droplet');
                $rows[] = array('displayText'=>_getText('blau'), 'color'=>'#00f', 'iconMap'=>'kijs.iconMap.Fa.droplet');
                $rows[] = array('displayText'=>_getText('gelb'), 'color'=>'#ff0', 'iconMap'=>'kijs.iconMap.Fa.droplet');
                $rows[] = array('displayText'=>_getText('violett'), 'color'=>'#f0f', 'iconMap'=>'kijs.iconMap.Fa.droplet');
                $rows[] = array('displayText'=>_getText('hellblau'), 'color'=>'#0ff', 'iconMap'=>'kijs.iconMap.Fa.droplet');
                $response->config = new stdClass();
                $response->config->data = $rows;

                //sleep(1);

            } catch (Exception $ex) {
                $response->errorMsg = $ex->getMessage();
            }
            break;
        
        case 'rpc.simple':
            $response->infoMsg = _getText('Ich bin eine Nachricht vom Server');
            $response->data = $request->requestData;
            break;
        
        case 'rpc.delay':
            sleep(1);
            $response->data = $request->requestData;
            break;
        
        case 'rpc.infoMsg':
            $response->infoMsg = _getText('Ich bin eine %1', '', 'infoMsg');
            //$response->infoTitle = 'Eigener Titel';
            $response->data = $request->requestData;
            break;
        
        case 'rpc.cornerTipMsg':
            $response->cornerTipMsg = _getText('Ich bin eine %1', '', 'cornerTipMsg');
            //$response->cornerTipTitle = 'Eigener Titel';
            $response->data = $request->requestData;
            break;
        
        case 'rpc.warningMsg':
            $ignoreWarnings = $request->ignoreWarnings ?? false;
            if ($ignoreWarnings) {
                $response->data = $request->requestData;
            } else {
                $response->warningMsg = _getText('Sind Sie sicher?');
               // $response->warningTitle = 'Eigener Titel';
            }
            break;
        
        case 'rpc.errorMsg':
            $response->errorMsg = _getText('Ich bin eine %1', '', 'errorMsg');
            //$response->errorTitle = 'Eigener Titel';
            $response->data = $request->requestData;
            break;
        
        case 'rpc.errorNotice':
            try {
                $response->data = $request->requestData;
                throw new ki_Exception_Notice(_getText('Fehler, aber nicht tragisch.'));
                
            } catch (Exception $ex) {
                $response->errorMsg = $ex->getMessage();
                $response->errorType = $ex instanceof ki_Exception_Notice ? 'errorNotice' : 'error';
            }
            break;
        
        case 'rpc.error':
            try {
                $response->data = $request->requestData;
                throw new Exception(_getText('Fehler! Schrecklich!!!'));
                
            } catch (Exception $ex) {
                $response->errorMsg = $ex->getMessage();
                $response->errorType = $ex instanceof ki_Exception_Notice ? 'errorNotice' : 'error';
            }
            break;

        case 'tree.largeData.load':
            $response->data = $request->requestData;

            //$rows = [];

            $rows = _recordsetGenerateRec(16, 16, 16, '', ['15', '15.15']);

            // Verzögerung um Lademaske anzuzeigen
            //sleep(rand(0, 2));

            $response->config = new stdClass();
            $response->config->data = $rows;
            $response->config->value = '15.15.15';
            //$response->config->expandFilters = json_decode('{ "field":"id", "operator":"IN", "value":["1","1.1"] }');
            break;

        case 'tree.save':
            $response->cornerTipMsg = 'tree.save';
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
/**
 * Gibt die Sprache des Aufrufs ohne Region zurück (GET-Parameter lang, z.B. 'fr-CH' -> 'fr')
 * @return string  zweistelliges Sprachkürzel, Standard 'de'
 */
function _getLanguage(): string {
    $lang = strtolower(explode('-', (string)filter_input(INPUT_GET, 'lang'))[0]);
    return preg_match('/^[a-z]{2}$/', $lang) ? $lang : 'de';
}

/**
 * Übersetzt einen Text in die Sprache des Aufrufs, analog zu kijs.getText().
 * Die Übersetzungen kommen aus tools/kilang/data/home_xx.php (gleiche Dateien wie im Showcase).
 * @param string $key       deutscher Text
 * @param string $variant   Variante (optional)
 * @param mixed $args       Argument oder Array mit Argumenten für %1, %2 ... (optional)
 * @return string
 */
function _getText(string $key, string $variant='', mixed $args=null): string {
    static $texts = null;

    // Sprachdatei einmal laden
    if ($texts === null) {
        $texts = [];
        $lang = _getLanguage();
        $file = __DIR__ . '/../../../tools/kilang/data/home_' . $lang . '.php';
        if ($lang !== 'de' && is_file($file)) {
            $translations = [];
            include $file;
            $texts = $translations[$lang] ?? [];
        }
    }

    $text = $texts[$key] ?? $key;

    // Evtl. sind Varianten vorhanden
    if (is_array($text)) {
        $text = $text[$variant] ?? $text[''] ?? $key;
    }

    // Argumente in umgekehrter Reihenfolge ersetzen, damit %11 nicht von %1 ersetzt wird
    if ($args !== null) {
        $args = is_array($args) ? $args : [$args];
        for ($i = count($args); $i > 0; $i--) {
            $text = str_replace('%' . $i, (string)$args[$i - 1], $text);
        }
    }

    return (string)$text;
}

/**
 * Erzeugt eine Zeile für das Showcase-Grid (grid.load)
 */
function _gridGetRow(int $rwId, array $vornamen): stdClass {
    $states = [
        ['kijs.iconMap.Fa.circle-check', '#2e7d32', _getText('Erledigt')],
        ['kijs.iconMap.Fa.spinner', '#ef6c00', _getText('In Arbeit')],
        ['kijs.iconMap.Fa.circle-pause', '#757575', _getText('Pausiert')],
        ['kijs.iconMap.Fa.circle-xmark', '#c62828', _getText('Fehler')],
        ['kijs.iconMap.Fa.star', '#f9a825', _getText('Wichtig')]
    ];

    $row = new stdClass();
    for ($y=0; $y<26; $y++) {
        $row->{'field_' . strtolower(substr('ABCDEFGHIJKLMNOPQRSTUVWXYZ', $y, 1))} = substr('ABCDEFGHIJKLMNOPQRSTUVWXYZ', $y, 1) . $rwId;
    }

    $state = $states[$rwId % count($states)];

    // Vornamen über die ganze (alphabetische) Liste verteilen
    $row->vorname = $vornamen ? trim((string)$vornamen[($rwId * 47) % count($vornamen)]) : '';
    $row->number = $rwId;
    $row->number1 = $rwId*2;
    $row->number2 = null;
    $row->date = mktime(0, 0, 0, 1, 1, 2026) + (3600 * 24 * $rwId);
    // Spalte Icon: 8 verschiedene Icons (Codepoint) mit Farbe und Tooltip
    $icons = [
        [0xf015, '#1565c0', _getText('Haus')],
        [0xf007, '#6a1b9a', _getText('Person')],
        [0xf0e0, '#00838f', _getText('Brief')],
        [0xf095, '#2e7d32', _getText('Telefon')],
        [0xf1b9, '#455a64', _getText('Auto')],
        [0xf004, '#c62828', _getText('Herz')],
        [0xf0f3, '#ef6c00', _getText('Glocke')],
        [0xf013, '#5d4037', _getText('Zahnrad')]
    ];
    $icon = $icons[$rwId % count($icons)];
    $row->icon = $icon[0];
    $row->color = $icon[1];
    $row->iconText = $icon[2];
    $row->status = $state[0];
    $row->statusColor = $state[1];
    $row->statusText = $state[2];
    $row->checkbox = $rwId % 2 === 0;

    // Spalte Combo (Werte wie in editorConfig->data)
    $row->value = ($rwId % 3) + 1;
    $row->displayText = _getText('Datensatz %1', '', $row->value);

    return $row;
}

/**
 * Filtert die Zeilen des Showcase-Grids nach den Filtern von kijs.gui.grid.Filter
 * (Typen text, number, date, checkbox, icon und checkboxFilter)
 */
function _gridFilterRows(array $rows, array $filters): array {
    foreach ($filters as $filter) {
        if (!is_object($filter) || empty($filter->valueField)) {
            continue;
        }
        $field = (string)$filter->valueField;

        $rows = array_values(array_filter($rows, function(stdClass $row) use ($filter, $field): bool {
            $value = $row->$field ?? null;

            // Auswahl fester Werte (checkboxFilterValues)
            if (!empty($filter->checkboxFilter) && !in_array((string)$value, array_map('strval', $filter->checkboxFilter), true)) {
                return false;
            }

            $search = isset($filter->search) ? trim((string)$filter->search) : '';
            $compare = (string)($filter->compare ?? '');

            switch ($filter->type ?? '') {
                case 'text':
                    if ($search === '') {
                        return true;
                    }
                    // Text im angezeigten Feld suchen (z.B. Spalte Combo: displayText statt value)
                    if (!empty($filter->displayField)) {
                        $value = $row->{(string)$filter->displayField} ?? null;
                    }
                    $v = mb_strtolower((string)$value);
                    $s = mb_strtolower($search);
                    return match ($compare) {
                        'equal' => $v === $s,
                        'unequal' => $v !== $s,
                        'end' => str_ends_with($v, $s),
                        'part' => str_contains($v, $s),
                        'notpart' => !str_contains($v, $s),
                        default => str_starts_with($v, $s)
                    };

                case 'number':
                case 'date':
                    if ($search === '') {
                        return true;
                    }
                    if ($filter->type === 'date') {
                        // TT.MM.JJ (zweistelliges Jahr), TT.MM.JJJJ oder JJJJ-MM-TT
                        if (preg_match('/^\d{1,2}\.\d{1,2}\.\d{2}$/', $search)) {
                            $d = DateTime::createFromFormat('!d.m.y', $search);
                        } else {
                            $d = DateTime::createFromFormat('!d.m.Y', $search) ?: DateTime::createFromFormat('!Y-m-d', $search);
                        }
                        if (!$d) {
                            return true;
                        }
                        $s = (float)$d->getTimestamp();
                        $v = $value === null ? null : (float)mktime(0, 0, 0, (int)date('n', (int)$value), (int)date('j', (int)$value), (int)date('Y', (int)$value));
                    } else {
                        // Zahl wie im Grid angezeigt erlauben: 1'120, 5%, 5,0
                        $search = str_replace(["'", '’', ' ', '%'], '', $search);
                        $search = str_replace(',', '.', $search);
                        if (!is_numeric($search)) {
                            return true;
                        }
                        $s = (float)$search;
                        $v = $value === null ? null : (float)$value;
                    }
                    if ($v === null) {
                        return $compare === 'unequal';
                    }
                    return match ($compare) {
                        'unequal' => $v !== $s,
                        'smaller' => $v < $s,
                        'bigger' => $v > $s,
                        default => $v === $s
                    };

                case 'checkbox':
                    return match ($filter->checkbox ?? null) {
                        'checked' => (bool)$value,
                        'unchecked' => !$value,
                        default => true
                    };

                case 'icon':
                    return !is_array($filter->icons ?? null) || in_array($value, $filter->icons, true);
            }
            return true;
        }));
    }
    return $rows;
}

/**
 * Sortiert die Zeilen des Showcase-Grids
 */
function _gridSortRows(array $rows, string $field, string $direction): array {
    $factor = strtoupper($direction) === 'DESC' ? -1 : 1;
    usort($rows, function(stdClass $a, stdClass $b) use ($field, $factor): int {
        $va = $a->$field ?? null;
        $vb = $b->$field ?? null;
        if (is_string($va) || is_string($vb)) {
            return $factor * strnatcasecmp((string)$va, (string)$vb);
        }
        return $factor * ($va <=> $vb);
    });
    return $rows;
}

function _loadJsonFile(string $path): array {
    $content = (string)file_get_contents($path);
    return json_decode($content, true) ?? [];
}

function _recordsetGetRowFromValue(array $rows, string $fieldName, string $value): ?array {
    $value = strval($value);

    foreach ($rows as $row) {
        if ($value === strval($row[$fieldName])) {
            return $row;
        }
    }
    unset($rows, $row);

    return null;
}

function _recordsetFilter(array $rows, string $fieldName, string $query, 
        string $queryOperator, int $queryLimit): array {
    $retRows = [];
    
    foreach ($rows as $row) {
        $ok = true;

        if ($query !== '') {
            $ok = false;
            $pos = mb_stripos($row[$fieldName], $query);

            switch ($queryOperator) {
                case 'PART':
                    if ($pos !== false) {
                        $ok = true;
                    }
                    break;

                case 'BEGIN':
                    if ($pos === 0) {
                        $ok = true;
                    }
                    break;
            }
            if (!$ok) {
                continue;
            }
        }

        // Maximale Anzahl Datensätze begrenzen
        if ($queryLimit && count($retRows) >= $queryLimit) {
            break;
        }

        // Zeile übernehmen
        $retRows[] = $row;
    }
    unset($rows, $row);

    return $retRows;
}

function _recordsetGenerateRec(int $rowsCount, int $childrenCount=0,
        int $subChildrenCount=0, string $prefix='', array $expandedIds=[]): array {
    $rows = [];

    for ($i=1; $i<=$rowsCount; $i++) {
        $id = $prefix;
        if ($id) {
            $id .= '.';
        }
        $id .= $i;
        
        $children = [];
        if ($childrenCount) {
            $children = _recordsetGenerateRec($childrenCount, $subChildrenCount, 0, $id, $expandedIds);
        }

        $row = [];
        $row['id'] = $id;
        $row['displayText'] = $id;
        $row['color'] = '#' . dechex(rand(0, 240)) . dechex(rand(0, 240)) . dechex(rand(0, 240));
        $row['icon'] = $children ? 'kijs.iconMap.Fa.folder' : 'kijs.iconMap.Fa.' . ( $i % 10);
        $row['allowChildren'] = !!$children;
        if ($children) {
            $row['children'] = $children;

            if (in_array($id, $expandedIds)) {
                $row['expanded'] = true;
            }
        }
        $rows[] = $row;
    }

    return $rows;
}

/**
 * Übersetzt die Ländernamen (Feld 'Land') anhand des ISO-Codes in die Sprache des Aufrufs
 * und sortiert neu. Die Namen liefert die PHP-Erweiterung intl; ohne intl bleibt die Liste deutsch.
 * @param array $rows  Datensätze mit den Feldern 'ISO' und 'Land'
 * @return array
 */
function _translateCountries(array $rows): array {
    $lang = _getLanguage();
    if ($lang === 'de' || !class_exists('Locale')) {
        return $rows;
    }

    foreach ($rows as &$row) {
        $name = Locale::getDisplayRegion('-' . $row['ISO'], $lang);
        if ($name && $name !== $row['ISO']) {
            $row['Land'] = $name;
        }
    }
    unset($row);

    $collator = new Collator($lang);
    usort($rows, fn(array $a, array $b): int => (int)$collator->compare($a['Land'], $b['Land']));

    return $rows;
}
