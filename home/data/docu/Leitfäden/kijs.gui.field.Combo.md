kijs.gui.field.Combo
=====================

Das Combo kann auf drei Arten verwendet werden:

Lokal
---------------------------
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
```Schreiben für weitere...```.  

Mit der Eigenschaft ```queryOperator``` (Standard='BEGIN') kann festgelegt werden, 
wie beim Schreiben gefiltert werden soll. Es gibt folgende Möglichkeiten:  
 - ```'BEGIN'```: Der geschriebene Text muss am Anfang des Texts sein.  
 - ```'PART'```: Der geschriebene Text kann an einer beliebigen Stelle im Text 
   sein.  


Einmaliger RPC zu Beginn
---------------------------
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
Beginn die Daten per RPX geladen werden.  


Mehrere RPCs während dem Schreiben

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

Die Eigenschaft ```enableRemoteFiltering``` sagt, dass beim Tippen ein RPX gemacht 
werden soll. Standardmässig wird der RPC um 200ms verzögert gemacht, so dass beim 
schnellen Tippen weniger RPCs ausgelöst werden. Die Verzögerung kann mit der 
Eigenschaft ```remoteFilteringDefer``` auch angepasst werden.  

```autoLoad``` kann bei Bedarf auch auf ```false``` gestellt werden, dann werden 
in der Liste zu Beginn keine Werte angezeigt, sondern nur der Hinweis 
```Schreiben für weitere...```.  

### Datenverkehr zum Server
Bei einfachen Combos ohne ```enableRemoteFiltering``` wird beim Laden einfach ein 
Request gemacht, auf den dann mit den Daten geantwortet wird:

    Response:
    {
        "config":{
            "data":[
             {"value":1, "displayText":"Wert 1"},
             {"value":2, "displayText":"Wert 2"},
             ...
             {"value":50, "displayText":"Wert 50"}
            ]
            // und evtl. noch weitere Eigenschaften vie value, etc.
        }
    }

Bei Combos mit ```enableRemoteFiltering:true``` wird dem Server mitgeteilt, was 
für Daten verlangt werden:

    Request:
    {
        "initialLoad": true,
        "query": "Tes",
        "queryOperator": "BEGIN",
        "queryLimit": 31
    }

```initialLoad``` ist beim ersten Request auf ```true```. Bei den weiteren dann 
auf false. 
Wenn dem Combo zu Beginn z.B. der ```value``` übergeben werden soll, dann kann 
Serverseitig geschaut werden, ob ```initialLoad === true``` ist und nur dann die
betroffenen Configs übergeben werden. Der value würde ansonsten bei jedem RPC 
wieder auf den ursprünglichen Wert gesetzt.  

```query```. Enthält den bereits eingegebenen Text im Textfeld. Damit müssen nun 
Serverseitig die Resultate gefiltert werden.  

```queryOperator```. Damit der Server weiss, wie gefilert werden soll, wird diese 
Eigenschaft auch übermittelt.  

```queryLimit```. Damit der Server weiss, wie viele Datensätze das Combo anzeigen 
kann, wird mit diesem Wert die Anzahl mitgeteilt. Die übergebene Anzahl ist um 
eins höher als im Combo eingestellt. Also zB. 31 statt 30. Wenn der Server so 31 
Datensätze zurückgibt, zeigt das Combo trotzdem nur 30 Datensätze an. Es weiss 
aber, dass es noch mehr Datensätze gibt.  

Der Response sieht ähnlich aus, wie beim Beispiel oben. Jedoch muss evtl. beim 
ersten Request noch die ```valueRow``` übergeben werden.  
Diese ist dann nötig, wenn in der ersten RPC-Antwort der Datensatz mit dem Wert 
nicht vorhanden ist, weil er wegen dem ```queryLimit``` herausgefiltert wurde.  
Am einfachsten wird bei jedem ersten Request zusätzlich zum dem ```value``` auch 
die passende ```valueRow``` zurückgegeben. Das Combo entnimmt der ```valueRow``` 
dann die Daten für displayText, icon, farbe, etc.  
Die "valueRow" kann auch verwendet werden um einen Wert anzuzeigen, den es nicht 
mehr gibt, der früher aber mal ausgewählt werden konnte.  

    Response mit valueRow:
    {
        "config":{
            "data":[
             {"value":1, "displayText":"Wert 1"},
             {"value":2, "displayText":"Wert 2"},
             ...
             {"value":31, "displayText":"Wert 31"}
            ],
            "valueRow":{"value":48, "displayText":"Wert 48"}
            // und evtl. noch weitere Eigenschaften vie value, etc.
        }
    }
