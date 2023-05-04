Ajax und RPC
============

Einführung
----------
kijs stellt verschiedene Klassen zur Verfügung um Daten mit einem Server auszutauschen:  
 - ```kijs.Ajax```  
 - ```kijs.Rpc```  
 - ```kijs.gui.Rpc```  

### kijs.Ajax
Diese Klasse bietet grundlegende Funktionen um Daten mit Servern auszutauschen.  
Auf ihr bauen auch die anderen beiden Klassen ```kijs.Rpc``` und ```kijs.gui.Rpc``` 
auf.  
In den meisten Fällen ist die direkte Verwendung dieser Klasse nicht sinnvoll.  

### kijs.RPC
Mit dieser Klasse könne "remote procedure calls" an einen Server erstellt werden.  
Dazu muss zuerst eine Instanz erstellt werden:  

    let myRpc = new kijs.Rpc({
        url: 'https://www.myserver.ch/myFile'
    });

Die dann verwendet werden kann:  

    myRpc.do({
        facadeFn: 'myModule.myFunction',    // Gewünschte Funktion des Servers
        owner: this,                        // wird gebraucht um bei cancelRunningRpcs
                                            // den owner zu unterscheiden
        requestData: { ... },               // Argumente, die an den Server übermittelt werden
    }).then((e) => {
        console.log(e.responseData);
    }).catch((ex) => {
        console.error(ex);
    });

Falls auch gui-Elemente von kijs verwendet werden, sollte die ```kijs.gui.Rpc```-Klasse 
verwendet werden (diese baut auf ```kijs.Rpc``` auf).   
Wenn nur der Core von kijs verwendet wird (kijs ohne Ordner gui), kann ```kijs.Rpc``` 
verwendet werden.  

### kijs.gui.RPC
Diese Klasse baut auf ```kijs.Rpc``` auf. Sie bietet aber noch einige Features, die 
nur funktionieren, wenn auch das GUI von kijs vorhanden ist. 
So werden z.B. zurückgegebene Fehlermeldungen oder Warnungen direkt in einem 
Meldungsfenster angezeigt und es wird eine Lademaske während des Requests angezeigt.  

Beispiel:

    myRpc.do({
        facadeFn: 'myModule.myFunction',   // Gewünschte Funktion des Servers 
        owner: this,                       // wird gebraucht um bei cancelRunningRpcs
                                           // den owner zu unterscheiden
        data: { ... },           // Argumente, die an den Server übermittelt werden
        cancelRunningRpcs: true  // Sollen bereits laufende Requests an die gleiche 
                                 // Facade abgebrochen werden
    }).then((e) => {
        console.log(e.responseData);
    }).catch((ex) => {
        console.error(ex);
    });



Aufbau des Request/Response
---------------------------
Der Datenverkehr mit kijs ist in JSON mit UTF-8.

### Aufbau der Anfrage an den Server
kijs generiert automatisch Requests mit folgendem Aufbau:  

    [
        {
            "tid":1,                            // eindeutige Id (wird automatisch 
                                                // vergeben und eingefügt)
            "facadeFn": "myModule.myFunction",  // gewünschte Funktion auf dem Server
            "requestData": {
                ...                             // beliebige Daten die zurückgegeben werden
            },
            "ignoreWarnings": false             // Sollen Warnungen ignoriert werden?
        },{
            "tid":2,
            ...
        }
    ]

### Aufbau der Antwort vom Server
Der Server sollte wie folgt antworten:  

    [
        {
            "tid":1,    // tid vom request nehmen
            "responseData": {
                "fieldErrors":{                 // (optional) nur bei Save von kijs.gui.FormPanel 
                    "Anrede": "Ungültige Anrede."   // Fehlermeldungen, die direkt in den 
                                                    // Feldern angezeigt werden.
                },
                ...     // beliebige Daten die zurückgegeben werden
            },

            "errorTitle": "kijs",               // (optional)
            "errorMsg": "Ich bin eine errorMsg",// (optional)
            "errorType": "errorNotice",         // oder "error" (optional)
            
            "infoTitle": "kijs",                // (optional)
            "infoMsg": "Ich bin eine infoMsg",  // (optional)

            "cornerTipTitle": "kijs",           // (optional)
            "cornerTipMsg": "Ich bin eine cornerTipMsg", // (optional)

            "warningTitle": "kijs",             // (optional)
            "warningMsg": "Sind Sie sicher?",   // wird bei der Meldung auf "ok" 
                                                // geklickt. Wird der gleiche Request
                                                // automatisch nochmal mit 
                                                // "ignoreWarnings": true geschickt. 
        },{
            "tid":2,
            ...
        }
    ]


Beispielskript
-----------
Hier ein einfaches PHP-Skript, dass auf der Serverseite verwendet werden kann:  

    <?php
    $responses = array();
    $requests = json_decode(file_get_contents("php://input"));

    foreach ($requests as $request) {
        $response = new stdClass();
        $response->tid = $request->tid;
        $response->responseData = new stdClass();

        switch ($request->facadeFn) {
            case 'module1.formLoad':
                try {
                    // Formular
                    $response->responseData->form = json_decode('
                        [
                            {
                                "xtype": "kijs.gui.field.Combo",
                                "name": "Anrede",
                                "label": "Anrede",
                                "facadeFnLoad": "module1.loadAnredeCombo",
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

            case 'module1.loadAnredeCombo':
                try {
                    $response->responseData->rows = [
                        ['caption' => 'Herr', 'value' => 'm'],
                        ['caption' => 'Frau', 'value' => 'w']
                    ];
                } catch (Exception $ex) {
                    $response->errorMsg = $ex->getMessage();
                }
                break;

            case 'module1.formSave':
                try {
                    $formData = $request->requestData->formData;

                    $fieldErrors = new stdClass();

                    if (!in_array($formData->Anrede, ['m', 'w'])) {
                        $fieldErrors->Anrede = 'Ungültige Anrede.';
                    }

                    if (count(get_object_vars($fieldErrors))) {
                        $response->responseData->fieldErrors = $fieldErrors;
                        $response->errorMsg = 'Einige Felder sind nicht korrekt ausgefüllt.';
                    }
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


