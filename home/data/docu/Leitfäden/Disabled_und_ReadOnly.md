Disabled und ReadOnly
=====================

Die Eigenschaften ```disabled``` und ```readOnly``` sind sich auf den ersten Blick 
sehr ähnlich. Es gibt aber wichtige Unterschiede.

| Funktion                     | disabled | readOnly                   |
|------------------------------|----------|----------------------------|
| Fokussierbar (focus)         | nein     | ja                         |
| Wert wird übermittelt        | nein     | ja                         |
| Selektierbar                 | ja       | ja                         |
| Felder änderbar              | nein     | nein                       |
| Schaltflächen bedienbar      | nein     | ja, wenn sie nichts ändern |
| Wird an Kinder weitergegeben | ja       | nein                       |


disabled
--------
Betrifft alle ```kijs.gui.Element``` Elemente inkl. vererbte (also fast alle).  

Wird ein Container auf ```disabled: true``` gesetzt, werden damit auch sämtliche 
Kinder disabled.  
So kann z.B. ein ganzes GUI disabled werden, indem der Viewport auf 
```disabled: true``` gesetzt wird.  
Gibt es Kind-Elemente, die schon vorher disabled waren, so bleiben sie auch nach 
dem zurücksetzen mit ```disabled: false``` auf dem Eltern-Element immmer noch 
disabled.

Elemente die disabled sind, haben die CSS Klasse ```kijs-disabled```.  

Bei Panels können die einzelnen Bereich einzeln disabled werden:

| Bereich      | config            | Getter/Setter      |
|--------------|-------------------|--------------------|
| Header Bar   | headerBarDisabled | headerBar.disabled |
| Header       | headerDisabled    | header.disabled    |
| Container    | innerDisabled     | innerDisabled      |
| Footer       | footerDisabled    | footer.disabled    |
| Footer Bar   | footerBarDisabled | footerBar.disabled |
| ganzes Panel | disabled          | disabled           |

Die Funktion ```changeDisabled(val, callFromParent)``` sollte nie direkt 
aufgerufen werden. Sie wird intern verwendet. Stattdessen ```disable``` verwenden.  

Der Getter/Setter ```disabled``` sollte nie überschrieben werden. Stattdessen die Funktion
```changeDisabled(val, callFromParent)``` überschreiben.  


readOnly
--------
Betrifft nur kijs.gui.field.* Elemente.  

Elemente die readOnly sind, haben die CSS Klasse ```kijs-readonly```.  