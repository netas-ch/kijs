Aufbau einer Klasse
=====================

Sortierung
----------
Sortiert wird wie folgt:
1. Nach Hauptelementen jeweils mit einer entsprechenden Kommentar-Überschrift
   - Constructor
   - Getters / Setters
   - Members
   - Destructor

2. Innerhalb der Members mit einer entsprechenden Kommentar-Überschrift
   - Public
   - Protected
   - Private
   - Listeners

3. dann alphabetisch


Kommentare
----------
Welche Kommentare wo hingehören (Klassenkommentar, configMap, Getter, Funktionen), 
steht im Leitfaden [Kommentare](Kommentare.md). Ein vollständiges Beispiel steht im Leitfaden 
[Tutorial Eigene Komponente](Tutorial_Eigene_Komponente.md).  


Beispielaufbau
--------------
Klassen sollten immer nach folgendem Schema aufgebaut sein:

    /* global kijs, this */

    // --------------------------------------------------------------
    // xy.Classname
    // --------------------------------------------------------------
    /**
     * Beschreibung der Klasse
     *
     * @fires myEvent  Beschreibung. e: ...
     */
    xy.Classname = class xy_Classname extends kijs.gui.Element {


        // --------------------------------------------------------------
        // CONSTRUCTOR
        // --------------------------------------------------------------
        // overwrite
        constructor(config={}) {
            super(false);

            // Klassenvariablen deklarieren
            this._text = null;
            this._myObj = new kijs.gui.Dom();
            ...

            // Standard-config-Eigenschaften mergen
            Object.assign(this._defaultConfig, {
                ...
            });

            // Mapping für die Zuweisung der Config-Eigenschaften
            Object.assign(this._configMap, {
                text: { target: 'text' },
                ...
            });

            // Config anwenden
            if (kijs.isObject(config)) {
                config = Object.assign({}, this._defaultConfig, config);
                this.applyConfig(config, true);
            }
        }



        // --------------------------------------------------------------
        // GETTERS / SETTERS
        // --------------------------------------------------------------
        /**
         * Beschreibung der Eigenschaft
         * @type {String}
         */
        get text() { return this._text; }
        set text(val) {
            this._text = val;
        }



        // --------------------------------------------------------------
        // MEMBERS
        // --------------------------------------------------------------
        // overwrite
        render(superCall) {
            super.render(true);
            ...

            // Event afterRender auslösen
            if (!superCall) {
                this.raiseEvent('afterRender');
            }
        }


        // PROTECTED
        /**
         * Beschreibung der Funktion
         * @param {Number} val
         * @returns {Boolean}
         */
        _protectedMethod(val) {
            ...
        }


        // PRIVATE
        // LISTENERS
        #onElementClick(e) {
            ...
        }



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
            if (this._myObj) {
                this._myObj.destruct();
            }
            ...

            // Variablen (Objekte/Arrays) leeren
            this._myObj = null;
            ...

            // Basisklasse entladen
            super.destruct(true);
        }

    };

Details zu den einzelnen Teilen:  
- Konstruktor, ```_defaultConfig``` und ```_configMap```: Leitfaden [Config-System](Config-System.md)  
- ```render```, ```unrender```, ```destruct``` und ```superCall```: Leitfaden [Lebenszyklus](Lebenszyklus.md)  
- Unterobjekte und Event-Weiterleitung: Leitfaden [Element, Dom und Container](Element_Dom_und_Container.md)  
