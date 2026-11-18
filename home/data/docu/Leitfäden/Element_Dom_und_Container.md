Element, Dom und Container
==========================

Das GUI von kijs baut auf drei Grundklassen auf:  

| Klasse                   | Erbt von              | Aufgabe                                                    |
|--------------------------|-----------------------|------------------------------------------------------------|
| ```kijs.gui.Dom```       | ```kijs.Observable``` | Kapselt **einen** DOM-Node: CSS-Klassen, Style, HTML, Attribute, Node-Events |
| ```kijs.gui.Element```   | ```kijs.Observable``` | Eine **Komponente** im GUI-Baum. Besitzt ein ```kijs.gui.Dom``` (```this._dom```) und kann weitere enthalten |
| ```kijs.gui.Container``` | ```kijs.gui.Element```| Element mit **Kind-Elementen** (```elements```)              |

Fast alle GUI-Klassen erben von ```kijs.gui.Element``` oder ```kijs.gui.Container```.  


kijs.gui.Dom
------------
```kijs.gui.Dom``` ist ein Hilfsobjekt rund um einen einzelnen HTML-Node. Man 
arbeitet nie direkt mit dem Node, sondern immer über das Dom-Objekt. So bleiben 
alle Eigenschaften auch dann erhalten, wenn der Node noch nicht existiert oder 
beim ```unrender()``` gelöscht wird (siehe Leitfaden «Lebenszyklus»).  

Wichtige Funktionen und Eigenschaften:  

| Bereich       | Funktionen / Eigenschaften                                             |
|---------------|------------------------------------------------------------------------|
| CSS-Klassen   | ```clsAdd()```, ```clsRemove()```, ```clsHas()```, ```clsToggle()```, ```clsRemoveAll()``` |
| Inhalt        | ```html```, ```htmlDisplayType``` (```'html'```, ```'code'```, ```'text'```), ```isEmpty``` |
| Darstellung   | ```style```, ```width```, ```height```, ```top```, ```left```          |
| Attribute     | ```nodeAttributeSet()```, ```nodeAttributeGet()```, ```nodeAttributeHas()```, ```nodeAttributeRemove()``` |
| Node          | ```node```, ```nodeTagName```, ```isRendered```, ```render()```, ```renderTo()```, ```unrender()``` |
| Tastatur      | ```keyEventAdd()```, ```keyEventStopBubbeling()```                     |

Ein Dom-Objekt ist **kein** Element: Es hat keinen ```parent```, kein ```afterResize``` 
und taucht nicht im Element-Baum auf. Es ist nur ein Baustein innerhalb eines Elements.  

### Node-Events
Die Events eines Dom-Objekts sind kijs-Events (siehe Leitfaden «Ereignisse») mit 
camelCase-Namen. Die Zuordnung zu den Browser-Events steht in ```_eventMap```:  

| kijs-Event      | Browser-Event  |
|-----------------|----------------|
| ```click```     | ```click```    |
| ```dblClick```  | ```dblclick``` |
| ```mouseDown``` | ```mousedown```|
| ```keyDown```   | ```keydown```  |
| ```enterPress```| ```keydown``` mit Taste Enter |
| ...             | ...            |

Der Listener auf dem DOM-Node wird erst erstellt, wenn jemand mit ```on()``` auf 
das kijs-Event hört **und** der Node existiert. Beim Rendern werden die Listeners 
nachgeholt, beim Unrendern entfernt. Man muss sich also nicht darum kümmern, ob der 
Node schon existiert.  

Wird auf ein Event gehört, das nicht in der ```_eventMap``` steht, gibt es den Fehler 
```kijsEvent "xy" is not mapped```.  

Das Event-Objekt ```e``` enthält:  

| Eigenschaft          | Inhalt                                                  |
|----------------------|---------------------------------------------------------|
| ```e.dom```          | Das ```kijs.gui.Dom```, das das Event ausgelöst hat     |
| ```e.eventName```    | Name des kijs-Events                                    |
| ```e.nodeEvent```    | Das originale Browser-Event (z.B. für ```preventDefault()```) |
| ```e.nodeEventName```| Name des Browser-Events                                 |


kijs.gui.Element
----------------
Ein Element besitzt immer ein Dom-Objekt ```this._dom``` für seinen Haupt-Node. 
Viele Config-Eigenschaften des Elements werden direkt an dieses Dom-Objekt 
weitergegeben (```cls```, ```style```, ```html```, ```nodeTagName```, 
```nodeAttribute``` ...).  

Komplexere Elemente bestehen aus weiteren Unterobjekten. Beispiel ```kijs.gui.Button```:  

    this._dom               // <button class="kijs-button">
    this._iconEl            //   kijs.gui.Icon     (Element)
    this._captionDom        //   <span class="kijs-caption">  (Dom)
    this._badgeDom          //   <span class="kijs-badge">    (Dom)
    this._icon2El           //   kijs.gui.Icon     (Element)

### Dom oder Element als Unterobjekt?
| Unterobjekt ist ein ...  | wenn ...                                                         |
|--------------------------|------------------------------------------------------------------|
| ```kijs.gui.Dom```       | es nur ein einfacher Node ist (Text, Container für Styling, ...) |
| ```kijs.gui.Element```   | es eine eigenständige Komponente mit eigener Logik ist (Icon, Button, Feld ...). Dann wird ```parent: this``` übergeben |

Namenskonvention für die Variablen: ```_xyDom``` für Dom-Objekte und ```_xyEl``` für 
Elemente.  

Unterobjekte werden im Konstruktor erstellt, im ```render()``` in den eigenen Node 
gerendert und im ```destruct()``` zerstört.  

### Event-Weiterleitung
Ein Element löst Events wie ```click``` nicht selbst aus. Es leitet sie von einem 
Unterobjekt weiter. Dazu wird im Konstruktor ```_eventForwardsAdd()``` aufgerufen:  

    // click des Haupt-Nodes als click des Elements weiterleiten
    this._eventForwardsAdd('click', this._dom);

    // click des Schliessen-Buttons als closeClick weiterleiten
    this._eventForwardsAdd('closeClick', this._closeBtn, 'click');

Argumente: ```_eventForwardsAdd(eventName, target, targetEventName)```  
- ```eventName``` Name des Events im eigenen Element  
- ```target``` Unterobjekt (```kijs.gui.Dom``` oder ```kijs.gui.Element```)  
- ```targetEventName``` (optional) Name des Events im Unterobjekt, falls er anders ist  

```kijs.gui.Element``` leitet standardmässig die Maus-, Tastatur- und Touch-Events 
von ```this._dom``` weiter, ```kijs.gui.Container``` zusätzlich ```scroll``` und 
```scrollEnd``` vom inneren Node.  

Auch hier gilt: Der Listener auf dem Unterobjekt wird erst erstellt, wenn jemand 
mit ```on()``` auf das Event des Elements hört.  

Beim Weiterleiten wird das Event-Objekt ergänzt:  

| Eigenschaft          | Inhalt                                                         |
|----------------------|----------------------------------------------------------------|
| ```e.element```      | Das Element, auf dem das Event gerade ausgelöst wird           |
| ```e.raiseElement``` | Das Element, das das Event ursprünglich ausgelöst hat. Bleibt beim Weiterleiten gleich |

### Navigation im Element-Baum
Jedes Element kennt sein Elternelement. Damit kann im Baum navigiert werden:  

| Eigenschaft / Funktion | Ergebnis                                                         |
|------------------------|------------------------------------------------------------------|
| ```parent```           | Übergeordnetes Element                                           |
| ```next```, ```previous``` | Nächstes bzw. vorheriges Element im selben Container         |
| ```up(name)```         | Erstes übergeordnetes Element mit diesem ```name```              |
| ```upX(xtype)```       | Erstes übergeordnetes Element dieser Klasse, z.B. ```upX('kijs.gui.Window')``` |
| ```isChildOf(el)```    | Liegt das Element (irgendwo) unterhalb von ```el```?             |

Siehe aber Leitfaden «Kapselung»: Der Zugriff auf übergeordnete Elemente sollte 
die Ausnahme sein. Meistens ist ein Event die bessere Lösung.  


kijs.gui.Container
------------------
Ein Container besteht aus zwei ineinanderliegenden Nodes:  

    this._dom          // <div class="kijs-container">
    this._innerDom     //   <div class="kijs-container-inner">
                       //     ... Nodes der Kind-Elemente

Die Kind-Elemente werden in den inneren Node gerendert. Darum gibt es für viele 
Eigenschaften zwei Varianten:  

| Äusserer Node    | Innerer Node       |
|------------------|--------------------|
| ```cls```        | ```innerCls```     |
| ```style```      | ```innerStyle```   |

```html``` und ```htmlDisplayType``` gehen beim Container in den inneren Node. 
Die Layout-Klassen (```kijs-flexrow```, ```kijs-flexform``` ... siehe Leitfaden 
«Layout») werden mit ```cls``` auf den äusseren Node gesetzt und wirken auf 
den inneren.  

### elements
In ```elements``` können Instanzen und Config-Objekte gemischt werden. Bei 
Config-Objekten erstellt der Container die Instanz anhand von ```xtype``` selbst. 
Mit ```defaults``` können Standardwerte für alle Config-Objekte angegeben werden 
(Details siehe Leitfaden «Config-System»).  

    new kijs.gui.Container({
        cls: 'kijs-flexrow',
        defaults: { disableFlex: false },
        elements: [
            { xtype: 'kijs.gui.Button', name: 'btnOk', caption: 'OK' },
            '>',
            new kijs.gui.Button({ name: 'btnCancel', caption: 'Abbrechen' })
        ]
    });

### Elemente hinzufügen und entfernen
| Funktion                          | Beschreibung                                         |
|-----------------------------------|------------------------------------------------------|
| ```add(elements, index, options)```   | Fügt ein oder mehrere Elemente hinzu (optional an einer Position) |
| ```remove(elements, options)```   | Entfernt Elemente. Standardmässig werden sie dabei **zerstört** |
| ```removeAll(options)```          | Entfernt alle Elemente                               |
| ```hasChild(el)```                | Ist das Element ein direktes Kind?                   |
| ```elements```, ```firstChild```, ```lastChild``` | Zugriff auf die Kind-Elemente        |

Mögliche ```options```:  
- ```preventRender``` nicht neu rendern (z.B. bei mehreren Änderungen nacheinander)  
- ```preventEvents``` keine ```beforeAdd```/```add``` bzw. ```beforeRemove```/```remove``` Events  
- ```preventDestruct``` (nur remove) Element nicht zerstören, z.B. um es in einen 
  anderen Container zu verschieben  
- ```preventUnrender``` (nur remove, zusammen mit ```preventDestruct```) Node im DOM lassen  

Gibt ein Listener auf ```beforeAdd``` bzw. ```beforeRemove``` ```false``` zurück, 
wird der Vorgang abgebrochen.  

### Elemente suchen
| Funktion                                  | Ergebnis                                       |
|-------------------------------------------|------------------------------------------------|
| ```down(name)```                          | Erstes Element mit diesem ```name``` (beliebige Tiefe) oder ```null``` |
| ```downX(xtype)```                        | Erstes Element dieser Klasse oder ```null```   |
| ```getElementsByName(name, deep, breakOnFirst)```   | Array mit allen passenden Elementen  |
| ```getElementsByXtype(xtype, deep, breakOnFirst)``` | Array mit allen passenden Elementen  |

```deep```: ```0``` = nur direkte Kinder, ```1``` = Kinder und Enkel, ... ```-1``` = 
unendlich (Standard).  
Gesucht wird zuerst unter den direkten Kindern. Erst wenn dort nichts gefunden 
wird, wird jedes Kind der Reihe nach rekursiv durchsucht (der erste Ast ganz, 
dann der nächste). Gibt es denselben ```name``` mehrmals in verschiedenen Ästen, 
liefert ```down()``` also nicht zwingend das Element, das am wenigsten tief liegt.  

Damit Elemente gefunden werden können, sollten sie einen ```name``` haben. Typisch 
ist das Muster: GUI als Config-Baum aufbauen und danach mit ```down()``` auf die 
einzelnen Elemente zugreifen.  

    const btnOk = this._content.down('btnOk');
    btnOk.on('click', this.#onBtnOkClick, this);

**Hinweis:** ```down()``` durchsucht den ganzen Baum. In sehr grossen GUIs oder in 
Schleifen kann es sinnvoll sein, die Referenz einmal in einer Klassenvariable zu 
speichern.  


Welche Klasse ableiten?
-----------------------
| Die neue Komponente ...                                    | ableiten von                |
|------------------------------------------------------------|-----------------------------|
| hat keine Kind-Elemente, nur eigene Unterobjekte           | ```kijs.gui.Element```      |
| soll beliebige Kind-Elemente aufnehmen können              | ```kijs.gui.Container```    |
| braucht Titelleiste, Kopf-/Fusszeile, Schliessen-Button ...| ```kijs.gui.Panel```        |
| ist ein Formularfeld                                       | ```kijs.gui.field.Field``` (oder ein passendes Feld) |
