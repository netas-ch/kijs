Ereignisse
==========

Einführung
----------
kijs verfügt über ein eigenes System von Ereignissen. Es funktioniert unabhängig 
von den nativen JavaScript events.  

Die abstrakte Klasse ```kijs.Observable``` enthält diese Funktionalität.  
Fast alle Klassein in kijs erben von ```kijs.Observable``` und erhalten dadurch 
die Möglichkeit kijs-Ereignisse auszulösen.  


Funktionen
----------
### raiseEvent(name, e)  
Löst ein Ereignis aus.  
Argumente:  
 - ```name``` gewünschter Name des Ereignisses.  
 - ```e``` Objekt mit Infos zum Ereignis.  

Theoretisch können auch mehrere Argumente zu einem Eregnis definiert werden.  
```raiseEvent(name, ...args)```. Darauf sollte aber in kijs verzeichtet werden und 
naben ```name``` immer nur ein Argument ```e```verwendet werden.  

Ein Ereignis muss in kijs nicht definiert werden. Sobald mit ```raiseEvent(name, e)``` 
ein Eregnis ausgelöst wird, existiert es.  

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
Gleich wie ```on()```, jedoch wird der Listener nach dem 1. Aufruf wieder entfernt.  

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




Listeners mit Rückgabewerten
----------------------------
Bei allen Ereignissen deren Namen mit ```'before...``` beginnt, wird ein Rückgabewert 
vom Listener erwartet ```true```=ok oder ```false```=abbrechen.  
Diese Ereignisse werden jeweils am Anfang einer Operation aufgerufen und bieten 
dadurch die Möglichkeit, dass ein Listener die Operation abbricht.  

Beispiel:  
Wenn ein Fenster ```kijs.gui.Window``` geschlossen wird. Wird vorher das Ereignis 
```beforeClose``` aufgerufen. Soll dies verhindert werden, kann dies über einen 
Listener verhindert werden:

    myWindow.on('beforeClose', function(e) {
        if (e.element.down('myField').value === 'xy') {
            kijs.gui.MsgBox.alert('Ooops', 'Im Feld steht noch "xy"!');
            return false;
        }
        return true;
    }, this);

