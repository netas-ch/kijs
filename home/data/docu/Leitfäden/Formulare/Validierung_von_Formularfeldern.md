Validierung von Formularfeldern
===============================

Formularfelder werden bei folgenden Ereignissen validiert:
- Während der Eingabe
- beim Verlassen des Felds
- beim Aufrufen von validate()

Und auch bei folgenden Funktionen des FormPanels:
- load() ???
- save()
- validate()

**Hinweis:** Beim Aufruf des Setters ```value``` wird nicht validiert! Darum muss 
anschliessend noch ```validate()``` aufgerufen werden.


Es gibt verschiedene Möglichkeiten um Validierungen zu definieren:

### required
Pflichtfeld ja/nein.   
Beispiel: ```required: true```  
Diese Eigenchaft haben alle Felder.  
Diese Validierung ist etwas anders alls alle Anderen: 
- Diese Validierung wird, im Gegensatz zu allen anderen Validierungen, auch 
  ausgeführt, wenn das Feld leer ist.  
- Sie wird bei einem neuen Datensatz nicht ausgeführt, weil sonst alle 
  Pflichtfelder bereits rot wären, bevor das Feld ausgefüllt wird.  

### maxLength, minLength
Minimum und maximum Zeichenlänge.  
Beispiel: ```maxLength: 50```  
Diese Eigenchaften haben alle Felder.  

### validationFn, validationFnContext
Benutzerdefinierte Funktion, die den Wert validiert.  
Beispiel:  

    validationFn: function(value) {
        return value === 'test';
    },
    validationFnContext: this

Diese Eigenchaften haben alle Felder.  
Wenn die Validierung ok ist, muss die Funktion ```true```zurückgeben, sonst 
```false```.  
Wenn der Wert leer ist, wird die Funktion nicht ausgeführt.  

### validationRegExp
Benutzerdefinierte reguläre Ausdrücke zur Validierung.  
Beispiel:  

    validationRegExp: [
        { 
            regExp: /^Test$/,
            msg: 'Wert muss \'Test\' sein'
        }
    ]

Diese Eigenchaften haben alle Felder.  
Es kann ein oder mehrere Ausdrücke zur Validierung angegeben werden.  
Alle Ausdrücke müssen erfüllt sein, damit die Validierung ok ist.  
Pro Validierung kann eine ```msg``` angegeben werden, die im Fehlerfall angezeigt 
wird.  
Wenn der Wert leer ist, werden die Ausdrücke nicht ausgeführt.  

### weitere
Je nach Feldtyp, gibt es weitere Eigenschaften, mit denen validiert werden kann.  
Beispiel bei ```kijs.gui.field.Number```: ```minValue``` und ```maxValue```.  
Diese sind bei den entsprechenden Feldern dokumentiert.  

### Validieren auf dem Webserver
Auf dem Webserver können auch Validierungen ausgeführt werden.  
Validierungsfehler können im response des Servers mitgegeben werden. Sie werden 
dann in den betroffenen Feldern angezeigt.

Beispiel-Response:

    {
        "responseData":{
            "fieldErrors":{
                "Anrede":"Ungültige Anrede.",
                "Geburtsdatum":"Diese Person ist zu jung."
            }
        }
    }

