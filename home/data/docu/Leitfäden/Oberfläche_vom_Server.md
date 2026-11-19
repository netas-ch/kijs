Oberfläche vom Server
=====================
Eine Stärke von kijs: Die Oberfläche muss nicht im JavaScript stehen. Der Server kann sie 
ganz oder teilweise erzeugen und dem Browser als JSON schicken. kijs baut daraus die 
Elemente auf.  

Das ist z.B. praktisch, wenn  
- ein Formular je nach Benutzer, Rechten oder Datensatz andere Felder hat,  
- Masken in der Datenbank konfiguriert werden,  
- die Logik ohnehin auf dem Server liegt und das JavaScript schlank bleiben soll.  


Das Prinzip
-----------
Jedes Element wird mit einem Config-Objekt erstellt (siehe Leitfaden 
[Config-System](Config-System.md)). Ein Config-Objekt ist ein reines Objekt, darum kann es 
auch als JSON vom Server kommen. Mit ```xtype``` steht darin, welche Klasse erstellt werden 
soll (siehe Leitfaden [Element, Dom und Container](Element_Dom_und_Container.md)):  

    {
        "xtype": "kijs.gui.Panel",
        "caption": "Adresse",
        "elements": [
            { "xtype": "kijs.gui.field.Text", "name": "Name", "label": "Name" },
            { "xtype": "kijs.gui.Button", "caption": "Speichern" }
        ]
    }

Damit das funktioniert, müssen im Browser die Dateien aller verwendeten Klassen geladen sein. 
Sonst kommt der Fehler ```Unknown xtype "..."```.  


Laden mit load()
----------------
Jedes Element (```kijs.gui.Element``` und alle abgeleiteten Klassen) kann seine Config selbst 
vom Server holen:  

| Config / Funktion | Bedeutung |
|-------------------|-----------|
| [```rpcLoadFn```](api:kijs.gui.Element#rpcLoadFn) | Name der Funktion auf dem Server, z.B. ```'address.load'``` |
| [```rpcLoadArgs```](api:kijs.gui.Element#rpcLoadArgs) | Argumente, die immer mitgeschickt werden, z.B. ```{ id: 4 }``` |
| [```autoLoad```](api:kijs.gui.Element#autoLoad) | ```true```: nach dem ersten Rendern automatisch laden |
| [```rpc```](api:kijs.gui.Element#rpc) | ```kijs.gui.Rpc``` oder Name einer globalen Instanz. Default: ```'default'``` |
| [```load(args)```](api:kijs.gui.Element#load) | Lädt (erneut) und gibt ein Promise zurück |
| Event ```afterLoad``` | Nach dem Laden und Anwenden der Config |

Während des Ladens zeigt das Element eine Lademaske.  

**Im Browser:**  

    {
        xtype: 'kijs.gui.Container',
        rpcLoadFn: 'address.loadForm',
        rpcLoadArgs: { addressId: 4 },
        autoLoad: true
    }

**Antwort des Servers:** Die Config steht in ```config```. Sie wird mit ```applyConfig()``` 
auf das Element angewendet:  

    {
        "tid": 1,
        "config": {
            "elements": [
                { "xtype": "kijs.gui.field.Text", "name": "Name", "label": "Name" },
                { "xtype": "kijs.gui.field.Text", "name": "Ort", "label": "Ort" }
            ]
        }
    }

Wie Anfrage und Antwort genau aussehen und wie ein einfaches PHP-Skript dafür aussieht, steht 
im Leitfaden [Ajax und RPC](Ajax_und_RPC.md). Fehler meldet der Server mit ```errorMsg``` 
(siehe Leitfaden [Fehlerbehandlung](Fehlerbehandlung.md)). Dann wird die Config nicht 
angewendet.  

Gut zu wissen:  
- ```elements``` **ersetzt** die bisherigen Kind-Elemente. Ein Platzhalter wie «wird 
  geladen ...» verschwindet also automatisch.  
- Es können beliebige Configs geladen werden, nicht nur ```elements```, z.B. ```caption```, 
  ```html```, ```disabled``` oder ```style```.  
- ```load()``` kann jederzeit erneut aufgerufen werden, z.B. mit anderen Argumenten: 
  ```panel.load({ addressId: 5 })```.  
- Elemente in der geladenen Config können selbst wieder ```rpcLoadFn``` und ```autoLoad``` 
  haben. So lädt z.B. eine Combo in einem geladenen Formular ihre Auswahl selbst nach.  


Formulare
---------
Bei [```kijs.gui.container.Form```](api:kijs.gui.container.Form) kann der Server mit 
```load()``` gleichzeitig die Felder und die Daten schicken:  

    {
        "tid": 1,
        "config": {
            "elements": [
                { "xtype": "kijs.gui.field.Text", "name": "Name", "label": "Name" },
                { "xtype": "kijs.gui.field.Text", "name": "Ort", "label": "Ort" }
            ],
            "data": { "Name": "Muster", "Ort": "Bern" }
        }
    }

Werden ```elements``` geladen, sucht das Formular seine Felder danach neu. Mit 
```rpcSaveFn``` und ```save()``` werden die Daten zurückgeschickt; der Server kann Fehler pro 
Feld mit ```fieldErrors``` melden (siehe Leitfaden 
[Validierung von Formularfeldern](Formulare/Validierung_von_Formularfeldern.md)).  


Daten statt Oberfläche
----------------------
Bei Elementen, die Daten anzeigen, lädt ```load()``` vor allem die Daten:  
- [```kijs.gui.field.Combo```](api:kijs.gui.field.Combo), ListView, CheckboxGroup, OptionGroup: 
  die Auswahl (siehe Leitfaden [Combo](Felder/Combo.md))  
- [```kijs.gui.DataView```](api:kijs.gui.DataView), ListView, Tree: die Datensätze (siehe 
  Leitfaden [Daten](Daten.md))  
- [```kijs.gui.grid.Grid```](api:kijs.gui.grid.Grid): Spalten und Zeilen, auch schrittweise 
  beim Scrollen  


Listeners vom Server
--------------------
JSON kann keine Funktionen enthalten. Listeners werden darum als **Name einer Funktion** 
angegeben, die im Browser existiert:  

    {
        "xtype": "kijs.gui.Button",
        "caption": "Speichern",
        "on": {
            "click": "myApp.Address.onSaveClick"
        }
    }

kijs sucht die Funktion über ```kijs.getFunctionFromString()```. Sie erhält wie jeder Listener 
das Event-Objekt ```e``` mit ```e.element```.  

**Sicherheit:** ```getFunctionFromString()``` versteht auch Funktionen als Text 
(```"function(e) { ... }"```) und führt diesen Code aus. Der Server darf darum nie Text von 
Benutzern in eine Config einsetzen, aus der Funktionen gelesen werden (```on```, 
```formatFn```, ```validationFn``` ...). Am sichersten sind Namen von Funktionen, die im 
JavaScript der App definiert sind. Dasselbe gilt für ```html```: Texte von Benutzern mit 
```htmlDisplayType: 'code'``` bzw. ```'text'``` anzeigen.  


Die ganze Oberfläche vom Server
-------------------------------
Auch die oberste Ebene kann vom Server kommen. Der ViewPort lädt seine Config dann selbst:  

    kijs.isReady(function() {
        kijs.setRpc('default', new kijs.gui.Rpc({ url: 'ajax.php' }));

        const viewport = new kijs.gui.ViewPort({
            cls: 'kijs-flexfit',
            rpcLoadFn: 'app.load'
        });
        viewport.render();
        viewport.load();
    });

Beim ViewPort ```load()``` selbst aufrufen: ```autoLoad``` lädt erst nach dem ersten 
```renderTo()```, der ViewPort wird aber mit ```render()``` angezeigt.  

Der Server liefert dann z.B. Navigation und Inhalt als ```config.elements```. Im JavaScript 
bleiben nur der Start und die Listeners.  


Beispiele
---------
- [Showcase Element](../../showcase/Element.js): ```html``` und ```tooltip``` vom Server  
- [Showcase Container](../../showcase/Container.js): Elemente mit Listener vom Server  
- [Showcase container Form](../../showcase/container/container_Form.js): Felder und Daten vom Server  
- [Showcase container Tab](../../showcase/container/container_Tab.js)  
- [Showcase Dashboard](../../showcase/Dashboard.js)  
- Das Demo-Backend dieser Showcases: ```home/dataResources/php/ajax.php``` (z.B. 
  ```element.load```, ```container.load```, ```form.load```)  
