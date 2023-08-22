Layout
=====================

In kijs gibt es ein paar Standard CSS-Klassen, die beim Layouten von GUIs verwendet 
werden können.

Diese Klassen sind ganz zuunterst in der ```kijs.gui.less``` definiert.


Klassen für kijs.gui.Container (+ vererbte)
-------------------------------------------
### kijs-flexfit
Passt den Inhalt an die Containergrösse an (nur für Container mit einem Kind geeignet).  

    .kijs-flexfit > .kijs-container-inner {
        display: flex;
        flex-direction: column;
        flex-wrap: nowrap;
        align-items: stretch;

        > * {
            flex: 1 1 auto;
        }
    }


### kijs-flexcolumn
Flext den Inhalt in eine Spalte.  

    .kijs-flexcolumn > .kijs-container-inner {
        display: flex;
        flex-direction: column;
        flex-wrap: nowrap;
    }


### kijs-flexrow
Flext den Inhalt in eine Zeile.  

    .kijs-flexrow > .kijs-container-inner {
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
    }


### kijs-flexrowwrap
Flext die Kinder in Zeilen mit Abständen zwischen den Elementen. Kinder die nicht 
mehr platz in der Zeile haben gehen auf die nächste Zeile.  
Ist geignet für FormPanel mit Containern als Inhalt die dann ```kijs-flexform``` 
zugewiesen haben.  

    .kijs-flexrowwrap > .kijs-container-inner {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        align-content: start;
        justify-content: start;
        align-items: stretch;
        padding: 10px;
        gap: 6px 18px;

        > * {
            flex: 1 0 auto;
        }
    }


### kijs-flexform
Für Container mit Formularfeldern.  
Listet die Formularfelder in einer Spalte auf.  
Bei jedem Feld kann via config ```disableFlex``` eingestellt werden, ob das Feld 
die ganze Spaltenbreite benutzen soll oder ob es eine fixe Breite hat. 
**Hinweis:** Je nach Feldtyp ist der Standardwert von ```disableFlex``` anders. 

    .kijs-flexform > .kijs-container-inner {
        display: flex;
        flex-direction: column;
        flex-wrap: nowrap;

        gap: 4px;

         > * {
            flex: none;
            max-width: 500px;
        }
    }


### kijs-flexline
Um Elemente nebeneinander darstellen zu können, z.B. in Formularen.  
Dazu einen kijs.gui.Container mit den gewünschten kijs.gui.Fields erstellen und 
diese Klasse zuweisen. 

    .kijs-flexline > .kijs-container-inner {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        align-content: start;
        justify-content: start;
        align-items: start;
        gap: 4px;

         > * {
            flex: none;
        }
    }



Klassen für kijs.gui.Icons
--------------------------
### kijs-spin
Dreh-Effekt  

    .kijs-spin {
      animation: kijs-spin 2s infinite linear;
    }


### kijs-pulse
Pulse-Effekt (z.B. für Load-Icons)  

    .kijs-pulse {
      animation: kijs-spin 1s infinite steps(8);
    }
