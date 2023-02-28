# Aufbau einer Klasse
=====================

## Sortierung
Sortiert wird wie folgt:
1. Nach Hauptelementen jeweils mit einer entsprechenden Kommentar-Überschrift
- Constructor
- Getters / Setters
- Members
- Destructor

2. Innerhalb der Members mit einer entsprechenden Kommentar-Überschrift
  - Public
  - Protected
  - Listeners

3. dann alphabetisch


## Beispielaufbau
Klassen sollte immer nach folgendem Schema aufgebaut sein:

    /* global kijs, this */

    // --------------------------------------------------------------
    // xy.Classname
    // --------------------------------------------------------------
    xy.Button = class xy_Classname {


        // --------------------------------------------------------------
        // CONSTRUCTOR
        // --------------------------------------------------------------
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


        // LISTENERS
        _onElementClick(e) {
            ...
        }


        // --------------------------------------------------------------
        // DESTRUCTOR
        // --------------------------------------------------------------
        destruct(superCall) {

            ...

            // Variablen (Objekte/Arrays) leeren
            this._myObj = null;
            ...

            // Basisklasse entladen
            super.destruct(true);
        }

    };
