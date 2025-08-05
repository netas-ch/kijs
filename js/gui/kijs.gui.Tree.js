/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.Tree
// --------------------------------------------------------------
kijs.gui.Tree = class kijs_gui_Tree extends kijs.gui.ListView {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);
        
        this._childsField = null;

        this._dom.clsRemove('kijs-listview');
        this._dom.clsAdd('kijs-tree');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            elementXType: 'kijs.gui.dataView.element.Tree',
            selectType: 'single'
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            childsField: true
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
    get childsField() { return this._childsField; }
    set childsField(val) { this._childsField = val; }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------



    #onNodeContextMenu(e) {
        if (this.loadSpinner || this.disabled) {
            return;
        }
        this._raiseRootEvent('nodeContextMenu', e);
    }


    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    destruct(superCall) {
        if (!superCall) {
            // unrender
            this.unrender(superCall);

            // Event auslösen.
            this.raiseEvent('destruct');
        }

        // Variablen (Objekte/Arrays) leeren

        // Basisklasse entladen
        super.destruct(true);
    }

};
