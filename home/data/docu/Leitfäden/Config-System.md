Config-System
=============

Fast alle Klassen in kijs werden mit einem einzigen Argument ```config``` erstellt. 
Das ist ein einfaches Objekt mit den gewünschten Eigenschaften:  

    let button = new kijs.gui.Button({
        caption: 'Speichern',
        iconMap: 'kijs.iconMap.Fa.floppy-disk',
        on: {
            click: this.#onSaveClick,
            context: this
        }
    });

Weil die Config ein reines Objekt ist, kann sie auch als JSON vom Server kommen 
oder als Kind-Element in einem Container angegeben werden (siehe ```xtype``` weiter unten).  

Damit das funktioniert, besitzt jede Klasse drei Bausteine:  

| Baustein          | Aufgabe                                                        |
|-------------------|----------------------------------------------------------------|
| ```_defaultConfig``` | Standardwerte, die verwendet werden, wenn in der Config nichts steht |
| ```_configMap```     | Legt fest, welche Config-Eigenschaften erlaubt sind und wie sie zugewiesen werden |
| [```applyConfig()```](api:kijs.gui.Element#applyConfig)  | Weist eine Config gemäss ```_configMap``` zu                |

Die eigentliche Arbeit macht die statische Funktion [```kijs.Object.assignConfig()```](api:kijs.Object#assignConfig).  


Ablauf im Konstruktor
---------------------
Jede Klasse in der Vererbungskette ergänzt ```_defaultConfig``` und ```_configMap``` 
um ihre eigenen Einträge. Angewendet wird die Config aber nur **einmal**, und zwar 
in der untersten (zuletzt abgeleiteten) Klasse.  

Darum ruft jede Klasse den Konstruktor der Basisklasse mit ```super(false)``` auf. 
Weil ```false``` kein Objekt ist, überspringt die Basisklasse das Anwenden der Config. 
Erst die Klasse, die mit ```new``` erstellt wurde, erhält die richtige Config und wendet sie an.  

    constructor(config={}) {
        // 1. Basisklasse aufrufen, ohne Config
        super(false);

        // 2. Alle Klassenvariablen deklarieren
        this._smallPaddings = 'auto';
        this._captionDom = new kijs.gui.Dom({ cls: 'kijs-caption', nodeTagName: 'span' });
        this._menuEl = null;

        // 3. Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            disableFlex: true
        });

        // 4. Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            caption: { target: 'html', context: this._captionDom },
            disableFlex: { target: 'disableFlex' },
            smallPaddings: true
        });

        // 5. Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }
    }

(gekürzt aus [```kijs.gui.Button```](api:kijs.gui.Button))  

**Wichtig:**  
- ```_defaultConfig``` und ```_configMap``` werden in der Basisklasse (z.B. 
  [```kijs.gui.Element```](api:kijs.gui.Element)) erstellt. Abgeleitete Klassen **ergänzen** sie mit 
  ```Object.assign(...)```. Sie dürfen sie nie neu zuweisen, sonst gehen die 
  Einträge der Basisklassen verloren.  
- Der Block «Config anwenden» steht am Ende **jedes** Konstruktors, auch wenn er 
  identisch ist mit dem der Basisklasse. Nur so wird die Config auch angewendet, 
  wenn die Klasse direkt mit ```new``` erstellt wird.  
- Die Werte aus ```_defaultConfig``` werden nur flach (1. Ebene) mit der Config 
  zusammengeführt. Was in der Config steht, gewinnt.  
- Eine Klasse kann einen Standardwert der Basisklasse überschreiben, indem sie 
  denselben Schlüssel in ```_defaultConfig``` nochmals setzt.  


Object.seal()
-------------
Am Ende von ```applyConfig()``` wird ```Object.seal(this)``` aufgerufen. Danach 
können dem Objekt **keine neuen Eigenschaften** mehr hinzugefügt werden. 
Bestehende Eigenschaften können aber weiterhin geändert werden.  

Darum müssen alle Klassenvariablen im Konstruktor **vor** dem Anwenden der Config 
deklariert werden (siehe auch Leitfaden [Namensgebung](Namensgebung.md)). Wird eine Variable erst 
später in einer Funktion angelegt, löst JavaScript einen TypeError aus (Klassen 
laufen immer im strict mode).  


Die configMap
-------------
Die ```_configMap``` ist ein Objekt. Jeder Schlüssel ist der Name einer erlaubten 
Config-Eigenschaft. Der Wert beschreibt, wie sie zugewiesen wird.  

### Schreibweisen

| Wert in der configMap       | Bedeutung                                                             |
|-----------------------------|-----------------------------------------------------------------------|
| ```true```                  | Wert wird in die Klassenvariable ```_name``` geschrieben (Setter wird **nicht** aufgerufen) |
| ```false```                 | Die Eigenschaft ist verboten, die Zuweisung löst einen Fehler aus     |
| ```'meinSetter'```          | Wert wird der Eigenschaft ```meinSetter``` zugewiesen                 |
| ```{ ... }```               | Objekt mit den Eigenschaften ```target```, ```context```, ```fn``` und ```prio``` |

Beispiele aus ```kijs.gui.Element```:  

    this._configMap = {
        afterResizeDelay: true,                         // -> this._afterResizeDelay
        height: { target: 'height' },                   // -> Setter this.height
        html: { target: 'html', context: this._dom },   // -> Setter this._dom.html
        cls: { fn: 'function', target: this._dom.clsAdd, context: this._dom },
        style : { fn: 'assign', target: 'style', context: this._dom },
        xtype: { fn: 'manual' },
        on: { prio: 1500,  fn: 'assignListeners' },
        disabled: { prio: 2000, target: 'disabled' }
    };

### target
Name der Eigenschaft, in die geschrieben wird. Das kann eine Klassenvariable 
(```'_name'```) oder ein Setter (```'name'```) sein.  
Standard: ```'_' + Name der Config-Eigenschaft```.  

**Tipp:** Wenn beim Zuweisen etwas ausgeführt werden muss (z.B. eine CSS-Klasse 
setzen oder neu rendern), dann einen Setter als ```target``` verwenden. Sonst 
reicht ```true```.  

Bei ```fn: 'function'``` ist ```target``` keine Eigenschaft, sondern eine Funktion.  

### context
Objekt, in dem das ```target``` liegt.  
Standard: die eigene Instanz (```this```).  

Damit kann eine Config-Eigenschaft direkt an ein Unterobjekt weitergeleitet werden. 
So gibt der Button seine Config ```caption``` an das Unterobjekt ```_captionDom``` weiter:  

    caption: { target: 'html', context: this._captionDom },
    captionCls: { fn: 'function', target: this._captionDom.clsAdd, context: this._captionDom },
    captionStyle: { fn: 'assign', target: 'style', context: this._captionDom },

Wichtig: Das Unterobjekt muss **vor** der ```_configMap``` erstellt werden, weil 
hier eine Referenz darauf gespeichert wird.  

### fn
Art der Zuweisung. Standard: ```'replace'```.  

| fn                    | Wirkung                                                                 |
|-----------------------|-------------------------------------------------------------------------|
| ```replace```         | Bestehenden Wert ersetzen (Standard)                                    |
| ```append```          | Wert an ein bestehendes Array anhängen (einzelner Wert oder Array)      |
| ```appendUnique```    | Wie ```append```, Duplikate werden aber entfernt                        |
| ```assign```          | Objekt mit dem bestehenden Objekt zusammenführen (nur 1. Ebene)         |
| ```assignDeep```      | Objekt mit dem bestehenden Objekt zusammenführen (ganze Hierarchie)     |
| ```assignListeners``` | Objekt mit Listeners übernehmen (wird nur für ```on``` verwendet)       |
| ```function```        | Die Funktion ```target``` mit dem Wert als Argument aufrufen            |
| ```manual```          | Nichts tun. Die Eigenschaft ist erlaubt, wird aber von Hand verarbeitet |
| ```error```           | Zuweisung verbieten (gleich wie ```false```)                            |

```manual``` wird z.B. für ```xtype``` und ```defaults``` verwendet. Diese Eigenschaften 
werden vom Container ausgewertet und dürfen in der Config stehen, ohne dass sie 
einen Fehler auslösen.  

### prio
Reihenfolge der Zuweisung. Je grösser die Zahl, desto **später** wird die Eigenschaft 
zugewiesen. Eigenschaften ohne ```prio``` werden zuerst zugewiesen (in der Reihenfolge, 
in der sie in der Config stehen).  

```prio``` wird gebraucht, wenn eine Eigenschaft von einer anderen abhängt. Beispiele:  

| prio | Eigenschaft                  | Grund                                                    |
|------|------------------------------|----------------------------------------------------------|
| 200  | ```menuElements``` (Button)  | Das Menü muss vorher mit ```menu``` erstellt worden sein |
| 1000 | ```elements``` (Container)   | Kind-Elemente erst, wenn der Container selbst fertig konfiguriert ist |
| 1000 | ```waitMaskTarget```         | Das Ziel-Element muss vorher vorhanden sein              |
| 1003–1014 | ```collapseButton```, ```closeButton``` ... (Panel) | Buttons in der Kopfzeile in einer festen Reihenfolge erstellen |
| 1500 | ```on```                     | Listeners werden erst nach den übrigen Eigenschaften registriert |
| 2000 | ```disabled```               | Muss nach den ```elements``` zugewiesen werden, damit es an alle Kinder weitergegeben wird |


Unbekannte Config-Eigenschaften
-------------------------------
Steht in der Config eine Eigenschaft, die nicht in der ```_configMap``` vorkommt, 
wird ein Fehler ausgelöst:  

    Unknown config "captoin"

Das ist gewollt: Tippfehler fallen so sofort auf und werden nicht einfach ignoriert.  

Will man trotzdem eine bestimmte unbekannte Eigenschaft zulassen, kann man ihren 
Namen in ```skipUnknownConfigs``` angeben:  

    {
        xtype: 'kijs.gui.Button',
        caption: 'OK',
        meineEigenschaft: 123,
        skipUnknownConfigs: ['meineEigenschaft']
    }

Das wird vor allem intern von ```defaults``` des Containers verwendet (siehe unten).  


Config nachträglich anwenden
----------------------------
```applyConfig(config)``` ist öffentlich und kann auch nach dem Erstellen aufgerufen 
werden, um mehrere Eigenschaften auf einmal zu ändern. Dabei werden die ```_defaultConfig``` 
**nicht** nochmals angewendet.  

Das Muster wird oft in Settern verwendet, die entweder eine Instanz oder eine Config 
akzeptieren. Beispiel ```closeButton``` aus [```kijs.gui.Panel```](api:kijs.gui.Panel) (vereinfacht):  

    set closeButton(val) {
        // Instanz von kijs.gui.Button
        if (val instanceof kijs.gui.Button) {
            this._closeButtonEl = val;
            ...

        // Config-Objekt
        } else if (kijs.isObject(val)) {
            if (this._closeButtonEl) {
                this._closeButtonEl.applyConfig(val);
            } else {
                this._closeButtonEl = new kijs.gui.Button(val);
                ...
            }
        }
    }

So kann man beim Panel z.B. ```closeButton: { iconMap: '...', tooltip: '...' }``` 
angeben, ohne selbst einen Button erstellen zu müssen.  

Mit dem zweiten Argument ```preventEvents=true``` wird während der Zuweisung das 
Event ```afterResize``` unterdrückt. Im Konstruktor wird immer ```true``` übergeben.  


xtype und defaults im Container
-------------------------------
In ```elements``` eines [```kijs.gui.Container```](api:kijs.gui.Container) können statt Instanzen auch 
Config-Objekte angegeben werden. Der Container erstellt die Instanz dann selbst. 
Dafür muss ```xtype``` mit dem vollständigen Klassennamen angegeben werden:  

    new kijs.gui.Container({
        defaults: {
            disableFlex: false
        },
        elements: [
            {
                xtype: 'kijs.gui.Button',
                caption: 'OK'
            },
            '>',            // Kurzform für kijs.gui.Spacer
            {
                xtype: 'kijs.gui.field.Text',
                label: 'Name'
            }
        ]
    });

Ablauf beim Hinzufügen (```kijs.gui.Container._getInstanceForAdd()```):  
1. Die ```defaults``` des Containers werden in die Config übernommen. Was bereits 
   in der Config steht, wird **nicht** überschrieben.  
2. Die Namen aller ```defaults``` werden in ```skipUnknownConfigs``` geschrieben. 
   So dürfen die ```defaults``` Eigenschaften enthalten, die nicht jedes Kind kennt 
   (im Beispiel oben kennt das Textfeld ```disableFlex```, ein anderes Element evtl. nicht).  
3. ```parent``` wird auf den Container gesetzt.  
4. Der Konstruktor wird über ```kijs.getObjectFromString(xtype)``` ermittelt und 
   mit der Config aufgerufen.  

Wird eine fertige Instanz übergeben, werden die ```defaults``` **nicht** angewendet.  

Die Kurzformen ```'-'``` ([```kijs.gui.Separator```](api:kijs.gui.Separator)) und ```'>'``` ([```kijs.gui.Spacer```](api:kijs.gui.Spacer)) 
können ebenfalls verwendet werden.  


Checkliste für eine neue Config-Eigenschaft
-------------------------------------------
1. Klassenvariable im Konstruktor deklarieren: ```this._meineEigenschaft = null;```  
2. Falls nötig Getter/Setter schreiben.  
3. Eintrag in der ```_configMap``` ergänzen (```true``` oder ```{ target: ... }```).  
4. Falls es einen Standardwert braucht: Eintrag in ```_defaultConfig```.  
   (Alternativ kann der Standardwert auch direkt bei der Deklaration der 
   Klassenvariable gesetzt werden. ```_defaultConfig``` ist nötig, wenn dabei der 
   Setter durchlaufen werden soll.)  
5. Falls die Eigenschaft von anderen abhängt: ```prio``` setzen.  
6. Dokumentieren (siehe Leitfaden [Kommentare](Kommentare.md)): beim Getter, oder als ```// {Typ} Text``` 
   in der ```_configMap```, falls es keinen gleichnamigen Getter gibt.  
7. Bei Objekten/Arrays: Variable im [```destruct()```](api:kijs.gui.Element#destruct) auf ```null``` setzen.  
