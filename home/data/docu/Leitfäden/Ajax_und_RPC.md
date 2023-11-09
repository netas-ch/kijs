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
        remoteFn: 'myModule.myFunction',    // Gewünschte Funktion des Servers
        owner: this,                        // wird gebraucht um bei cancelRunningRpcs
                                            // den owner zu unterscheiden
        requestData: { ... },               // Argumente, die an den Server übermittelt werden
    }).then((e) => {
        console.log(e.responseData);
        if (kijs.isEmpty(e.errorType)) {
            // ...
        }
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

    kijs.getRpc('default').do({
        remoteFn: 'myModule.myFunction',   // Gewünschte Funktion des Servers 
        owner: this,                       // wird gebraucht um bei cancelRunningRpcs
                                           // den owner zu unterscheiden
        data: { ... },           // Argumente, die an den Server übermittelt werden
        cancelRunningRpcs: true  // Sollen bereits laufende Requests an die gleiche 
                                 // remoteFn abgebrochen werden
    }).then((e) => {
        console.log(e.responseData);
        if (kijs.isEmpty(e.errorType)) {
            // ...
        }
    });

#### globale RPC-Instanzen
Damit nicht in jedem Element, dass ein RPC-Objekt benutzt, die Instanz eines 
```kijs.gui.Rpc``` übergeben werden muss, können globale ```kijs.gui.Rpc```-Objekte 
mit einem Namen definiert werden.  
Bei allen Elementen kann dann anstelle einer kijs.gui.Rpc-Instanz auch nur der 
Name der globalen Instanz als String übergeben werden. 
Wird kein Name angegeben, wird standardmässig die globale Instanz 'default' 
verwendet.  
Globale Instanzen können über folgende Funktionen definiert/abgerufen werden:
 - ```kijs.setRpc(name, rpc)``` Erstellt eine neue globale Instanz.  
    Die Standard-Instanz muss 'default' heissen.  
 - ```kijs.getRpc(name)``` Gibt eine globale Instanz zurück.  
   Falls kein name angegeben wird, wird die globale Instanz 'default' zurückgegeben.  


Callback Funktion ```fn```
--------------------------
Die übergebene (optionale) callback-fn ```fn``` wird immer ausgeführt. Auch wenn der  
Server nicht Antwortet (dann verzögert).

### fn bei kijs.gui.Rpc
Auch hier wird die callback-fn immer ausgeführt.  

Wenn auf dem Server eine Exception auftritt, wird eine ```errorMsg``` zurückgegeben.  
Der Type der Exception wird mit ```errorType``` zurückgegeben. Mögliche errorTypes:  
 - ```errorNotice``` Anwenderfehler. Z.B. ein Pflichtfeld wurde nicht ausgefüllt.  
 - ```error```       Applikationsfehler.  

```errorMsg``` werden von kijs automatisch mit einer ```kijs.gui.MsgBox``` angezeigt.  
Das Icon entspricht dem ```errorType```.  

Es ist wichtig, dass in der callback-fn, ein auf dem Server aufgetretener Fehler, noch 
ausgewertet wird. Meistens muss der Code in der Callback-fn ja nur ausgeführt werden, 
wenn auf dem Server alles ok ist. Dazu kann folgender Code verwendet werden:  

    #myCallbackFn(e) {
        if (kijs.isEmpty(e.errorType)) {  
            // ...
        }
    }



Promise
-------
### Promise bei kijs.gui.Rpc
Die Funktion ```do()``` gibt als return ein Promise zurück. Die Antwort vom Server 
kann also anstelle einer callback-fn auch mit einem Promise ausgewertet werden.  

Beispiel:  

    kijs.getRpc('default').do({
        remoteFn: 'myModule.myFunction',
        owner: this,
        data: { ... }
    }).then((e) => {
        if (kijs.isEmpty(e.errorType)) {
            // mach dies
        }
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
            "remoteFn": "myModule.myFunction",  // gewünschte Funktion auf dem Server
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

        switch ($request->remoteFn) {
            case 'module1.formLoad':
                try {
                    // Formular
                    $response->responseData->config = json_decode('
                        {
                            "elements": [
                                {
                                    "xtype": "kijs.gui.field.Combo",
                                    "name": "Anrede",
                                    "label": "Anrede",
                                    "rpcLoadFn": "module1.loadAnredeCombo",
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
                        }
                    ');

                    // Formulardaten
                    $response->responseData->data = array(
                        'Anrede' => 'w',
                        'Name' => 'Meier',
                        'Vorname' => 'Susanne'
                    );

                } catch (Exception $ex) {
                    $response->errorType = 'error';
                    $response->errorMsg = $ex->getMessage();
                }
                break;

            case 'module1.loadAnredeCombo':
                try {
                    $response->responseData->data = [
                        ['caption' => 'Herr', 'value' => 'm'],
                        ['caption' => 'Frau', 'value' => 'w']
                    ];
                } catch (Exception $ex) {
                    $response->errorType = 'error';
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
                        $response->errorType = 'errorNotice';
                        $response->errorMsg = 'Einige Felder sind nicht korrekt ausgefüllt.';
                    }
                } catch (Exception $ex) {
                    $response->errorType = 'error';
                    $response->errorMsg = $ex->getMessage();
                }
                break;

            default:
                $response->errorType = 'error';
                $response->errorMsg = 'RemoteFn "' . $request->remoteFn . '" existiert nicht.';
        }

        $responses[] = $response;
    }

    print(json_encode($responses));


Laden von configs
-----------
Alle Elemente (kijs.gui.Element + vererbte) bieten die Möglichkeit die config dynamisch 
über RPC zu laden.

    {
        xtype: 'kijs.gui.Element',
        rpcLoadFn: 'element.load',
        // rpc: 'default',
        rpcLoadArgs: {
            myArgument: 'test'
        },
        autoLoad: true
    }

Die vom Server erhaltene config wird automatisch beim Empfang übernommen.  
Bei der Antwort vom Server muss die Config als Objekt wie folgt zurückgegeben werden:  

    $config = new stdClass();
    $config->html = '<b>Ich komme vom Server</b>';
    $config->tooltip = 'Ich auch';
    $response->responseData->config = $config;

Beispiel für das Laden von Kind-Elementen bei einem Panel:  
    
    $response->responseData->config = json_decode('
        {
            "caption": "Dynamisch geladenes Panel",
            "elements": [
                {
                    "xtype":"kijs.gui.Button",
                    "caption":"Button vom Server",
                    "on":{
                        "click":"myStyticClass.onAwesomeButtonClick"  // listener must be static
                    }
                }
            ]
        }
    ');


