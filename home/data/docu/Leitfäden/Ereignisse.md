Ereignisse
==========

Einführung
----------
kijs verfügt über ein eigenes System von Ereignissen. Es funktioniert unabhängig 
von den nativen JavaScript events.  

Die abstrakte Klasse [```kijs.Observable```](api:kijs.Observable) enthält diese Funktionalität.  
Fast alle Klassen in kijs erben von ```kijs.Observable``` und erhalten dadurch 
die Möglichkeit kijs-Ereignisse auszulösen.  


Funktionen
----------
### raiseEvent(name, e)  
Löst ein Ereignis aus.  
Argumente:  
 - ```name``` gewünschter Name des Ereignisses.  
 - ```e``` Objekt mit Infos zum Ereignis.  

Theoretisch können auch mehrere Argumente zu einem Ereignis definiert werden.  
[```raiseEvent(name, ...args)```](api:kijs.Observable#raiseEvent). Darauf sollte aber in kijs verzichtet werden und 
neben ```name``` immer nur ein Argument ```e``` verwendet werden.  

Ein Ereignis muss in kijs nicht definiert werden. Sobald mit ```raiseEvent(name, e)``` 
ein Ereignis ausgelöst wird, existiert es.  

Rückgabe: ```false```, wenn mindestens ein Listener ```false``` zurückgegeben hat, 
sonst ```true``` (siehe unten «Listeners mit Rückgabewerten»).  

### on(names, callback, context)  
Erstellt einen Listener für ein Ereignis.  
Argumente:  
 - ```names``` String mit dem Namen des Ereignisses oder ein Array mit mehreren Namen.  
 - ```callback``` Funktion, die ausgeführt werden soll, wenn das Ereignis auftritt.  
   Hier gibt es verschiedene Möglichkeiten eine Funktion zu definieren:  
    - Direkt eine Funktion übergeben ```function(e) { ... }```  
    - Eine bestehende Funktion aufrufen ```myApp.macheDies```  
    - Eine Funktion als String übergeben ```'function(e) { ... }'```  
    - Eine bestehende **statische** Funktion als String aufrufen ```'myApp.macheDies'```  
   Die Möglichkeit Funktionen als String zu übergeben, kann z.B. bei Configs, die 
   via RPC vom Server geholt werden benutzt werden. Da in JSON keine Funktionen möglich 
   sind, können auf diese Weise trotzdem Funktionen benutzt werden.  
 - ```context``` (optional) Kontext in dem die Funktion ausgeführt werden soll.  
   Standard = ```this```.  
   Bei der Benutzung von ```this``` innerhalb der Funktion, wird dieser Kontext verwendet.  
   Auch ein Kontext kann als String übergeben werden. Bsp: ```'myApp.Functions'```  

### once(names, callback, context)  
Gleich wie [```on()```](api:kijs.Observable#on), jedoch wird der Listener nach dem 1. Aufruf wieder entfernt.  

### off(names, callback, context)  
Entfernt einen Listener.  
Argumente:  
 - ```names``` (optional) String mit dem Namen des Ereignisses oder ein Array mit mehreren Namen.  
   Optional. Wenn leer, werden alle Listeners entfernt.  
 - ```callback``` (optional) Falls nur ein Listener mit einer bestimmten Funktion entfernt werden 
   soll, kann hier die Funktion angegeben werden. Sonst werden alle Listeners entfernt.  
 - ```context``` (optional) Es werden nur Listeners von diesem Kontext entfernt. 
   Sonst werden alle Listeners entfernt.  

### hasListener(name, callback, context)  
Überprüft ob ein Listener vorhanden ist.  
Rückgabe: true=Listener ist vorhanden, false=Listener ist nicht vorhanden.  
Argumente:  
 - ```name``` (optional) String mit dem Namen des Ereignisses.  
 - ```callback``` (optional) Funktion des Listeners. 
 - ```context``` (optional) Kontext des Listeners. 


Listeners via Config
--------------------
Bei allen [```kijs.gui.Element```](api:kijs.gui.Element) (und [```kijs.gui.Dom```](api:kijs.gui.Dom)) können Listeners auch 
direkt in der Config mit ```on``` angegeben werden. Der optionale Eintrag ```context``` 
gilt für alle Listeners im Objekt:  

    {
        xtype: 'kijs.gui.Button',
        caption: 'Speichern',
        on: {
            click: this.#onSaveClick,
            dblClick: function(e) { ... },
            context: this
        }
    }

Ohne ```context``` werden die Funktionen im Kontext des Elements selbst ausgeführt.  


Das Event-Objekt e
------------------
Bei ```kijs.gui.Element``` und ```kijs.gui.Dom``` wird das Event-Objekt ```e``` 
automatisch ergänzt:  

| Eigenschaft          | Gesetzt von              | Inhalt                                          |
|----------------------|--------------------------|-------------------------------------------------|
| ```e.eventName```    | Element, Dom             | Name des Ereignisses                            |
| ```e.element```      | Element                  | Element, auf dem das Ereignis gerade ausgelöst wird |
| ```e.raiseElement``` | Element                  | Element, das das Ereignis ursprünglich ausgelöst hat. Bleibt beim Weiterleiten gleich |
| ```e.dom```          | Dom                      | ```kijs.gui.Dom```, das das Ereignis ausgelöst hat |
| ```e.nodeEvent```    | Dom (nur Node-Events)    | Originales Browser-Event, z.B. für ```e.nodeEvent.preventDefault()``` |
| ```e.nodeEventName```| Dom (nur Node-Events)    | Name des Browser-Events                         |

Dazu kommen die Eigenschaften, die beim ```raiseEvent(name, e)``` übergeben werden, 
z.B. ```oldValue``` und ```value``` beim ```change``` eines Felds.  

Wie Events von Unterobjekten an ein Element weitergeleitet werden, steht im 
Leitfaden [Element, Dom und Container](Element_Dom_und_Container.md).  


Listeners mit Rückgabewerten
----------------------------
Bei allen Ereignissen deren Namen mit ```'before...``` beginnt, wird ein Rückgabewert 
vom Listener erwartet ```true```=ok oder ```false```=abbrechen.  
Diese Ereignisse werden jeweils am Anfang einer Operation aufgerufen und bieten 
dadurch die Möglichkeit, dass ein Listener die Operation abbricht.  

Abgebrochen wird nur bei genau ```false```. Gibt ein Listener nichts zurück 
(```undefined```), gilt das als ok. Es werden immer alle Listeners aufgerufen, auch 
wenn ein früherer bereits ```false``` zurückgegeben hat.  

Beispiel:  
Wenn ein Fenster [```kijs.gui.Window```](api:kijs.gui.Window) geschlossen wird, wird vorher das Ereignis 
```beforeClose``` aufgerufen. Soll das Schliessen verhindert werden, kann dies über 
einen Listener gemacht werden:

    myWindow.on('beforeClose', function(e) {
        if (e.element.down('myField').value === 'xy') {
            kijs.gui.MsgBox.alert('Ooops', 'Im Feld steht noch "xy"!');
            return false;
        }
        return true;
    }, this);

