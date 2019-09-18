/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.DataViewElement
// --------------------------------------------------------------
kijs.gui.DataViewElement = class kijs_gui_DataViewElement extends kijs.gui.Element {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        this._dataRow = {};     // Verweis auf den Data-Datensatz
        this._index = null;
        this._selected = false;

        this._dom.clsAdd('kijs-dataviewelement');

        //this._dom.nodeAttributeSet('tabIndex', -1);
        this._dom.nodeAttributeSet('draggable', true);

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            dataRow: true,
            disabled: { target: 'disabled', context: this._dom },
            index: true,
            selected: { target: 'selected' }
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }

        this.applyConfig(config);
    }


    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get dataRow() { return this._dataRow; }
    set dataRow(val) { this._dataRow = val; }

    get disabled() { return this._dom.disabled; }
    set disabled(val) { this._dom.disabled = val; }

    get index() { return this._index; }
    set index(val) { this._index = val; }

    get selected() { return this._dom.clsHas('kijs-selected'); }
    set selected(val) {
        if (val) {
            this._dom.clsAdd('kijs-selected');
        } else {
            this._dom.clsRemove('kijs-selected');
        }
    }

    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(superCall) {
        if (!superCall) {
            // unrender
            this.unrender(superCall);

            // Event auslösen.
            this.raiseEvent('destruct');
        }

        // Variablen (Objekte/Arrays) leeren
        this._dataRow = null;

        // Basisklasse entladen
        super.destruct(true);
    }
};
