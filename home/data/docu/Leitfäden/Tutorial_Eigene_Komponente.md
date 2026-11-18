Tutorial: Eine eigene Komponente
================================

In diesem Tutorial bauen wir Schritt für Schritt eine kleine Komponente: einen 
Zähler mit Beschriftung und den Schaltflächen **-** und **+**.  

    Anzahl  [ - ]  3  [ + ]

Dabei kommen die Themen aus diesen Leitfäden zusammen:  
- Aufbau einer Klasse  
- Config-System  
- Lebenszyklus  
- Element, Dom und Container  
- Ereignisse  

Anforderungen an den Zähler:  
- Config-Eigenschaften ```caption```, ```value```, ```min```, ```max```, ```step```  
- Der Wert bleibt immer zwischen ```min``` und ```max```  
- Events ```beforeChange``` (kann die Änderung abbrechen) und ```change```  
- Ist der Zähler ```disabled```, sind auch die Schaltflächen ```disabled```  


Schritt 1: Klasse und Namespace
-------------------------------
Eigene Klassen gehören **nicht** in den Namespace ```kijs```, sondern in einen eigenen, 
z.B. den der Applikation. In diesem Beispiel ```my.gui```.  

    /* global kijs, this */

    // --------------------------------------------------------------
    // my.gui.Counter
    // --------------------------------------------------------------
    kijs.createNamespace('my.gui');

    my.gui.Counter = class my_gui_Counter extends kijs.gui.Element {
        ...
    };

**Wichtig:** Der interne Klassenname (```my_gui_Counter```) muss dem vollständigen 
Namen entsprechen, wobei die Punkte durch ```_``` ersetzt werden. Daraus ermittelt 
kijs die Eigenschaft ```xtype```. Stimmt er nicht, funktionieren ```upX()```, 
```downX()``` und ```getElementsByXtype()``` nicht.  

```kijs.createNamespace('my.gui')``` erstellt ```window.my.gui```, falls es noch 
nicht existiert.  

Weil der Zähler keine beliebigen Kind-Elemente aufnehmen soll, leiten wir von 
```kijs.gui.Element``` ab und nicht von ```kijs.gui.Container```.  


Schritt 2: Der Klassenkommentar
-------------------------------
Direkt über der Klasse steht ein kurzer JSDoc-Kommentar mit Beschreibung, Beispiel 
und den Events, die die Klasse auslöst (siehe Leitfaden «Kommentare»):  

    /**
     * Zähler mit Beschriftung und den Schaltflächen - und +
     *
     * @example
     * new my.gui.Counter({ caption: 'Anzahl', min: 1, max: 10 });
     *
     * @fires beforeChange  Vor einer Änderung durch den Benutzer. e: oldValue, value.
     *                      Rückgabe false bricht die Änderung ab.
     * @fires change        Nach einer Änderung durch den Benutzer. e: oldValue, value
     */
    my.gui.Counter = class my_gui_Counter extends kijs.gui.Element {

Config-Eigenschaften, Eigenschaften und Funktionen werden hier **nicht** aufgelistet. 
Sie werden dort dokumentiert, wo sie im Code stehen (Schritte 3 bis 6).  


Schritt 3: Der Konstruktor
--------------------------
Der Konstruktor folgt immer dem gleichen Ablauf (siehe Leitfaden «Config-System»):  

    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        // Klassenvariablen
        this._min = 0;
        this._max = null;
        this._step = 1;
        this._value = 0;

        // Unterobjekte
        this._captionDom = new kijs.gui.Dom({
            cls: 'my-counter-caption',
            nodeTagName: 'span'
        });

        this._minusBtnEl = new kijs.gui.Button({
            parent: this,
            iconMap: 'kijs.iconMap.Fa.minus'
        });
        this._minusBtnEl.on('click', this.#onMinusBtnClick, this);

        this._valueDom = new kijs.gui.Dom({
            cls: 'my-counter-value',
            nodeTagName: 'span'
        });

        this._plusBtnEl = new kijs.gui.Button({
            parent: this,
            iconMap: 'kijs.iconMap.Fa.plus'
        });
        this._plusBtnEl.on('click', this.#onPlusBtnClick, this);

        this._dom.clsAdd('my-counter');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            value: 0    // damit der Setter läuft und die Zahl angezeigt wird
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            caption: { target: 'caption' },
            max: true,
            min: true,
            step: true,
            value: { target: 'value', prio: 100 }  // erst nach min und max zuweisen
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }
    }

Was hier passiert:  
- **Unterobjekte:** Beschriftung und Zahl sind einfache Nodes, also 
  ```kijs.gui.Dom``` (Variablenname ```_xyDom```). Die Schaltflächen sind 
  eigenständige Komponenten, also ```kijs.gui.Element``` mit ```parent: this``` 
  (Variablenname ```_xyEl```).  
- **Listeners** auf die Unterobjekte sind private Funktionen (```#on...```).  
- **```min```, ```max```, ```step```** brauchen keinen Setter-Aufruf. ```true``` 
  schreibt den Wert direkt in ```_min```, ```_max```, ```_step```.  
- **```value```** geht über den Setter, weil die Zahl im ```_valueDom``` 
  nachgeführt werden muss. Mit ```prio: 100``` wird ```value``` erst nach ```min``` 
  und ```max``` zugewiesen. Sonst würde z.B. bei ```{ value: 5, max: 3 }``` noch 
  ohne Grenze begrenzt.  
- **```_defaultConfig```** enthält ```value: 0```. Damit läuft der Setter auch, 
  wenn kein Wert angegeben wird, und die ```0``` wird angezeigt. Die Deklaration 
  ```this._value = 0``` allein würde den ```_valueDom``` nicht füllen.  
- **Kommentare in der configMap** braucht es hier keine: Alle Config-Eigenschaften 
  haben einen gleichnamigen Getter/Setter und werden dort dokumentiert (Schritt 4). 
  Der Kommentar bei ```value``` erklärt nur das ```prio``` und gehört nicht zur 
  API-Doku.  


Schritt 4: Getter und Setter
----------------------------
    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    /**
     * Beschriftung (HTML). Leer = keine Beschriftung
     * @type {String}
     */
    get caption() { return this._captionDom.html; }
    set caption(val) {
        this._captionDom.html = val;
        // render() entscheidet, ob die Beschriftung angezeigt wird
        if (this.isRendered) {
            this.render();
        }
    }

    /**
     * Maximalwert. null = keine Grenze. Default: null
     * @type {Number|null}
     */
    get max() { return this._max; }
    set max(val) { this._max = val; }

    /**
     * Minimalwert. null = keine Grenze. Default: 0
     * @type {Number|null}
     */
    get min() { return this._min; }
    set min(val) { this._min = val; }

    /**
     * Schrittweite der Schaltflächen. Default: 1
     * @type {Number}
     */
    get step() { return this._step; }
    set step(val) { this._step = val; }

    /**
     * Aktueller Wert. Wird auf min und max begrenzt.
     * Das Setzen löst kein change-Event aus.
     * @type {Number}
     */
    get value() { return this._value; }
    set value(val) {
        this._value = this._limit(Number(val));
        // Dom.html schreibt selbst in den Node, falls er existiert.
        // Darum ist hier kein render() nötig.
        this._valueDom.html = String(this._value);
    }

Die zwei Setter zeigen die beiden Fälle aus dem Leitfaden «Lebenszyklus»:  
- ```caption``` ändert, **ob** ein Node vorhanden ist (leere Beschriftung = kein 
  Node). Darum muss neu gerendert werden.  
- ```value``` ändert nur den Inhalt eines bestehenden Dom-Objekts. Das schreibt 
  ```kijs.gui.Dom``` selbst in den Node.  

Der Setter ```value``` löst **kein** ```change``` aus. Events gibt es nur bei einer 
Änderung durch den Benutzer, gleich wie bei den Formularfeldern.  

Jedes Getter/Setter-Paar hat einen JSDoc-Kommentar beim Getter. Er dokumentiert 
gleichzeitig die gleichnamige Config-Eigenschaft. Steht der Standardwert nicht in 
```_defaultConfig```, wird er mit ```Default: ...``` angegeben (bei ```value``` 
liest ihn der Generator aus ```_defaultConfig```).  


Schritt 5: Öffentliche Funktionen und render
--------------------------------------------
    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // overwrite
    changeDisabled(val, callFromParent) {
        super.changeDisabled(!!val, callFromParent);
        this._minusBtnEl.changeDisabled(!!val, true);
        this._plusBtnEl.changeDisabled(!!val, true);
    }

    /**
     * Verringert den Wert um step, wie ein Klick auf die Schaltfläche -
     * (löst beforeChange und change aus)
     * @returns {undefined}
     */
    decrement() {
        this._changeValue(this._value - this._step);
    }

    /**
     * Erhöht den Wert um step, wie ein Klick auf die Schaltfläche +
     * (löst beforeChange und change aus)
     * @returns {undefined}
     */
    increment() {
        this._changeValue(this._value + this._step);
    }

    // overwrite
    render(superCall) {
        super.render(true);

        // Beschriftung nur rendern, wenn vorhanden
        if (!this._captionDom.isEmpty) {
            this._captionDom.renderTo(this._dom.node);
        } else if (this._captionDom.isRendered) {
            this._captionDom.unrender();
        }

        this._minusBtnEl.renderTo(this._dom.node);
        this._valueDom.renderTo(this._dom.node);
        this._plusBtnEl.renderTo(this._dom.node);

        // Event afterRender auslösen
        if (!superCall) {
            this.raiseEvent('afterRender');
        }
    }

    // overwrite
    unrender(superCall) {
        // Event auslösen.
        if (!superCall) {
            this.raiseEvent('unrender');
        }

        this._captionDom.unrender();
        this._minusBtnEl.unrender();
        this._valueDom.unrender();
        this._plusBtnEl.unrender();

        super.unrender(true);
    }

- **```changeDisabled```**: Weil die Schaltflächen keine Kinder eines Containers 
  sind, müssen wir ```disabled``` selbst weitergeben. Laut Leitfaden «Disabled und 
  ReadOnly» wird dafür ```changeDisabled()``` überschrieben, nicht der Setter 
  ```disabled```. Das zweite Argument ```true``` (```callFromParent```) sorgt 
  dafür, dass eine Schaltfläche, die selbst ```disabled``` war, es auch bleibt.  
- **```render```**: zuerst ```super.render(true)```, dann die Unterobjekte in der 
  gewünschten Reihenfolge. ```render()``` kann beliebig oft aufgerufen werden.  
- **```unrender```**: Event am Anfang, dann die Unterobjekte, dann die Basisklasse.  


Schritt 6: Geschützte Funktionen und Listeners
----------------------------------------------
    // PROTECTED
    /**
     * Ändert den Wert durch eine Benutzeraktion und löst die Events aus
     * @param {Number} val
     * @returns {undefined}
     */
    _changeValue(val) {
        const oldValue = this._value;
        val = this._limit(val);

        if (val === oldValue) {
            return;
        }

        // Abbrechen, wenn ein Listener false zurückgibt
        if (this.raiseEvent('beforeChange', { oldValue: oldValue, value: val }) === false) {
            return;
        }

        this.value = val;

        this.raiseEvent('change', { oldValue: oldValue, value: this._value });
    }

    /**
     * Begrenzt einen Wert auf min und max
     * @param {Number} val
     * @returns {Number}
     */
    _limit(val) {
        if (!kijs.isEmpty(this._min) && val < this._min) {
            val = this._min;
        }
        if (!kijs.isEmpty(this._max) && val > this._max) {
            val = this._max;
        }
        return val;
    }


    // PRIVATE
    // LISTENERS
    #onMinusBtnClick(e) {
        this.decrement();
    }

    #onPlusBtnClick(e) {
        this.increment();
    }

- Hilfsfunktionen sind **protected** (```_...```). So können abgeleitete Klassen 
  sie überschreiben, z.B. ```_limit()``` für eine andere Begrenzung.  
- Listeners sind **private** (```#on...```) und haben genau ein Argument ```e```.  
- Events mit ```before...``` werden **vor** der Änderung ausgelöst. Gibt ein 
  Listener ```false``` zurück, wird abgebrochen (siehe Leitfaden «Ereignisse»).  
- Das Event-Objekt enthält wie bei den Formularfeldern ```oldValue``` und ```value```. 
  ```element``` und ```raiseElement``` ergänzt ```kijs.gui.Element``` automatisch.  


Schritt 7: Der Destruktor
-------------------------
    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    destruct(superCall) {
        if (!superCall) {
            // unrendern
            this.unrender(superCall);

            // Event auslösen.
            this.raiseEvent('destruct');
        }

        // Elemente/DOM-Objekte entladen
        if (this._captionDom) {
            this._captionDom.destruct();
        }
        if (this._minusBtnEl) {
            this._minusBtnEl.destruct();
        }
        if (this._valueDom) {
            this._valueDom.destruct();
        }
        if (this._plusBtnEl) {
            this._plusBtnEl.destruct();
        }

        // Variablen (Objekte/Arrays) leeren
        this._captionDom = null;
        this._minusBtnEl = null;
        this._valueDom = null;
        this._plusBtnEl = null;

        // Basisklasse entladen
        super.destruct(true);
    }

Alle Unterobjekte, die der Zähler selbst erstellt hat, werden auch von ihm zerstört. 
Die Listeners auf den Schaltflächen müssen nicht entfernt werden: Sie sind auf den 
Schaltflächen registriert und verschwinden mit ihnen.  
Zahlen wie ```_min``` oder ```_value``` müssen nicht geleert werden, nur Objekte und 
Arrays.  


Schritt 8: CSS
--------------
CSS-Klassen eigener Komponenten bekommen ein eigenes Präfix (hier ```my-```), nicht 
```kijs-```. Das CSS gehört in die Stylesheet-Datei der Applikation (Layer ```app```).  

    .my-counter {
        display: flex;
        align-items: center;
        gap: 6px;
    }

    .my-counter-value {
        min-width: 2em;
        text-align: center;
    }

Farben werden nicht fix angegeben, sondern über die CSS-Variablen des Themes 
(z.B. ```var(--accentColor)```). So passt die Komponente auch zum dunklen Theme.  


Schritt 9: Verwenden
--------------------
Die Datei (z.B. ```my.gui.Counter.js```) wird **nach** den kijs-Dateien geladen. 
Danach kann der Zähler wie jede andere kijs-Komponente verwendet werden, als 
Instanz oder als Config mit ```xtype```:  

    new kijs.gui.Window({
        caption: 'Bestellung',
        cls: 'kijs-flexform',
        elements: [
            {
                xtype: 'my.gui.Counter',
                name: 'anzahl',
                caption: 'Anzahl',
                min: 1,
                max: 10,
                value: 1,
                on: {
                    beforeChange: function(e) {
                        // z.B. nur gerade Werte erlauben
                        return e.value % 2 === 0;
                    },
                    change: function(e) {
                        console.log(e.oldValue + ' -> ' + e.value);
                    }
                }
            }
        ]
    }).show();

Zugriff von aussen:  

    const counter = myWindow.down('anzahl');
    counter.value = 5;          // kein change-Event
    counter.increment();        // löst beforeChange und change aus
    myWindow.disabled = true;   // Zähler und Schaltflächen sind disabled


Zusammenfassung
---------------
| Schritt          | Regel                                                            |
|------------------|------------------------------------------------------------------|
| Klasse           | eigener Namespace, interner Klassenname = Name mit ```_```       |
| Kommentare       | Klasse: Beschreibung + ```@fires```, JSDoc bei Gettern und Funktionen, keine Listen |
| Konstruktor      | ```super(false)```, Variablen, Unterobjekte, ```_defaultConfig```, ```_configMap```, ```applyConfig``` |
| Setter           | Wert speichern, bei Bedarf ```if (this.isRendered) this.render()``` |
| disabled         | ```changeDisabled()``` überschreiben und an Unterelemente weitergeben |
| render/unrender  | ```superCall```-Muster, Unterobjekte in den eigenen Node rendern |
| Events           | ```before...``` mit Abbruch, Event-Objekt ```e```, nur bei Benutzeraktion |
| destruct         | alles zerstören, was selbst erstellt wurde                       |
| CSS              | eigenes Präfix, Farben über Theme-Variablen                      |
