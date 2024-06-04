/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.dataView.element.Base
// --------------------------------------------------------------
kijs.gui.dataView.element.Base = class kijs_gui_dataView_element_Base extends kijs.gui.Container {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        this._dataRow = {};     // Verweis auf den Data-Datensatz
        this._dataIndex = null; // Index des Datensatzes im Recordset

        this._selected = false;

        this._dom.clsRemove('kijs-container');
        this._dom.clsAdd('kijs-dataview-element');
        this._dom.htmlDisplayType = 'html';

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            dataIndex: { target: 'dataIndex' },
            dataRow: { target: 'dataRow' },
            selected: { target: 'selected' }
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }

        // Inhalt erstellen
        this.update();
    }



    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get dataIndex() { return this._dataIndex; }
    set dataIndex(val) { this._dataIndex = val; }

    get dataRow() { return this._dataRow; }
    set dataRow(val) { this._dataRow = val; }

    get selected() { return this._dom.clsHas('kijs-selected'); }
    set selected(val) {
        if (val) {
            this._dom.clsAdd('kijs-selected');
        } else {
            this._dom.clsRemove('kijs-selected');
        }
    }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    /**
     * Erstellt den Inhalt
     * Diese Funktion muss überschrieben werden.
     */
    update() {

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
        this._dataRow = null;

        // Basisklasse entladen
        super.destruct(true);
    }

};
