kijs.gui.field.Combo
=====================

Arten des Datenbezugs
---------------------
Das Combo kann auf drei Arten verwendet werden:
 - Lokal
 - Einmaliger RPC zu Beginn
 - RPCs während dem Schreiben



### Lokal
Es wird kein RPC gemacht, die Daten müssen direkt zugewiesen werden
Beispiel für ein lokales Combo:

    {
        xtype: 'kijs.gui.field.Combo',
        data: [
            { displayText: 'Apple', value: 1},
            { displayText: 'Linux', value: 2},
            { displayText: 'Windows', value: 3}
        ]
    }

Mit der Eigenschaft ```displayLimit``` (Standard=30) kann festgelegt werden, wie viele 
Datensätze maximal in der Liste angezeigt werden. Gibt es mehr Datensätze, 
wird die Anzahl beschränkt und es erscheint der Text 
```Schreiben für Daten...```.  

Mit der Eigenschaft ```queryOperator``` (Standard='BEGIN') kann festgelegt werden, 
wie beim Schreiben gefiltert werden soll. Es gibt folgende Möglichkeiten:  
 - ```'BEGIN'```: Der geschriebene Text muss am Anfang des Texts sein.  
 - ```'PART'```: Der geschriebene Text kann an einer beliebigen Stelle im Text 
   sein.  


### Einmaliger RPC zu Beginn
Gleich zum Beginn werden alle Daten per RPC geladen, dann arbeitet das Combo 
ohne RPC weiter.  
Beispiel:  

    {
        xtype: 'kijs.gui.field.Combo',
        label: 'Stadt',
        rpcLoadFn: 'combo.stadt.load',
        valueField: 'Stadt',
        displayTextField: 'Stadt',
        autoLoad: true
    }

Dieses Combo funktioniert gleich, wie ein Lokales, mit dem Unterschied, dass zu 
Beginn die Daten per RPC geladen werden.  


### RPCs während dem Schreiben
Zu Beginn werden nur soviele Datensätze geladen, wie angezeigt werden können.  
Beim Tippen werden dynamisch die benötigten Datensätze nachgeladen.  
Beispiel:  

    {
        xtype: 'kijs.gui.field.Combo',
        label: 'Berufe',
        rpcLoadFn: 'combo.beruf.load',
        valueField: 'BerufId',
        displayTextField: 'Beruf',
        enableRemoteFiltering: true,
        autoLoad: true
    }

Die Eigenschaft ```enableRemoteFiltering``` sagt, dass beim Tippen ein RPC gemacht 
werden soll. Standardmässig wird der RPC um 200ms verzögert gemacht, so dass beim 
schnellen Tippen weniger RPCs ausgelöst werden. Die Verzögerung kann mit der 
Eigenschaft ```remoteFilteringDefer``` auch angepasst werden.  

```autoLoad``` kann bei Bedarf auch auf ```false``` gestellt werden, dann werden 
in der Liste zu Beginn keine Werte angezeigt, sondern nur der Hinweis 
```Schreiben für Daten...```.  

Datenverkehr zum Server
-----------------------
### Einmaliger RPC zu Beginn
Bei einfachen Combos ohne ```enableRemoteFiltering``` wird beim Laden einfach ein 
Request gemacht, auf den dann mit den Daten geantwortet wird:

    Request:
    {
        "initialLoad": true,
        "value": "48"           // zum Abrufen der valueRow (nur, wenn der value 
                                // bereits zu Beginn bekannt ist, sonst wird 
                                // evtl. ein eigener Request zum Abfragen der
                                // valueRow gemacht)
    }

    Response:
    {
        "config":{
            "data":[
             {"value":1, "displayText":"Wert 1"},
             {"value":2, "displayText":"Wert 2"},
             ...
             {"value":50, "displayText":"Wert 50"}
            ],
            "valueRow":{"value":48, "displayText":"Wert 48"}    // nur, wenn ```value``` 
                                                                // im Request
            // und evtl. noch weitere Eigenschaften vie value, etc.
        }
    }

### RPCs während dem Schreiben
Bei Combos mit ```enableRemoteFiltering:true``` wird dem Server mitgeteilt, was 
für Daten verlangt werden:

    Request:
    {
        "initialLoad": true,
        "query": "Tes",
        "queryOperator": "BEGIN",
        "queryLimit": 31,
        "value": "48"           // zum Abrufen der valueRow (nur, wenn der value 
                                // bereits zu Beginn bekannt ist, sonst wird 
                                // evtl. ein eigener Request zum Abfragen der
                                // valueRow gemacht)
    }

    Response:
    {
        "config":{
            "data":[
             {"value":1, "displayText":"Wert 1"},
             {"value":2, "displayText":"Wert 2"},
             ...
             {"value":31, "displayText":"Wert 31"}
            ],
            "valueRow":{"value":48, "displayText":"Wert 48"}    // nur, wenn ```value``` 
                                                                // im Request
            // und evtl. noch weitere Eigenschaften vie value, etc.
        }
    }


Argumente
---------
### initialLoad
```initialLoad``` ist beim ersten Request auf ```true```. Bei den weiteren dann 
auf false. Serverseitig können beim ersten Request zusätzliche config-Eigenschaften 
zurückgegeben werden.  

### value
Manchmal ist der Datensatz zum aktuellen Wert (```value```) nicht vorhanden. 
Das kann sein, wenn:
 - ```autoLoad:false``` ist
 - bei ```enableRemoteFiltering:true``` das ```displayLimit``` verhindert, dass 
   der Datensatz vorhanden ist.
 - der ```value``` nicht mehr vorhanden ist.

In diesem Fall muss dem Combo eine ```valueRow``` übergeben werden. Diese beinhaltet 
den Datensatz zum ```value```.  
Die ```valueRow``` kann lokal oder per RPC übergeben werden.  
Wird dem Combo keine ```valueRow``` übergeben, versucht es sie aus ```data``` 
zu ermitteln. Wenn das nicht funktioniert, macht es dafür einen RPC:

    Request:
    {
        "initialLoad": false,
        "value": "48"
    }

    Response:
    {
        "config":{
            "valueRow":{"value":48, "displayText":"Wert 48"}
        }
    }

Falls auch der RPC keine ```valueRow``` zurückgibt, wird der ```value``` auch als 
```displayText``` angezeigt.  

### query
Nur bei ```enableRemoteFiltering: true```.  
```query```. Enthält den bereits eingegebenen Text im Textfeld. Damit müssen nun 
Serverseitig die Resultate gefiltert werden.  

### queryOperator
Nur bei ```enableRemoteFiltering: true```.  
```queryOperator```. Damit der Server weiss, wie gefilert werden soll, wird diese 
Eigenschaft auch übermittelt.  

### queryLimit
```queryLimit```. Damit der Server weiss, wie viele Datensätze das Combo anzeigen 
kann, wird mit diesem Wert die Anzahl mitgeteilt. Die übergebene Anzahl ist um 
eins höher als im Combo eingestellt. Also zB. 31 statt 30. Wenn der Server so 31 
Datensätze zurückgibt, zeigt das Combo trotzdem nur 30 Datensätze an. Es weiss 
aber, dass es noch mehr Datensätze gibt.  
