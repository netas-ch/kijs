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


Beispielaufbau
--------------
Klassen sollte immer nach folgendem Schema aufgebaut sein:

    /* global kijs, this */

    // --------------------------------------------------------------
    // xy.Classname
    // --------------------------------------------------------------
    xy.Classname = class xy_Classname extends kijs.gui.Elements {


        // --------------------------------------------------------------
        // CONSTRUCTOR
        // --------------------------------------------------------------
        // overwrite
        constructor(config={}) {
            super(false);

            ...
        }



        // --------------------------------------------------------------
        // GETTERS / SETTERS
        // --------------------------------------------------------------
        get text() { return this._text; }
        set text(val) {
            this._text = val;
        }



        // --------------------------------------------------------------
        // MEMBERS
        // --------------------------------------------------------------
        render() {
            ...
        }


        // PROTECTED
        // overwrite
        _overwriteMethod() {
            ...
            super.unrender(true);
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
                this._myObj.destruct()
            }
            ...

            // Variablen (Objekte/Arrays) leeren
            this._myObj = null;
            ...

            // Basisklasse entladen
            super.destruct(true);
        }

    };
