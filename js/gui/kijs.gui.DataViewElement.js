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
    // MEMBERS
    // --------------------------------------------------------------


    /**
     * Setzt display und oder zurück
     * @returns {undefined}
     */
    resetDisplayAndOrder() {
        this._dom.style.order = 0;
        this._dom.style.display = 'initial';
    }

    /**
     * Setzt css order und display, damit das Element in seinem Container
     * sortiert und ein- und ausgeblendet werden kann.
     * @param {String} pattern
     * @param {String} dataRowKey
     * @returns {undefined}
     */
    setDisplayAndOrderByPattern(pattern, dataRowKey) {
        if (pattern !== null && pattern !== '') {
            pattern = pattern + '';
            let value = (this._dataRow[dataRowKey] || '') + '';

            // Übereinstimmung
            if (pattern.toLowerCase() === value.toLowerCase()) {
                this._dom.style.order = -3;
                this.visible = true;

            // Übereinstimmung am Anfang
            } else if (pattern.length <= value.length && pattern.toLowerCase() === value.toLowerCase().substr(0, pattern.length)) {
                this._dom.style.order = -2;
                this.visible = true;

            // Übereinstimmung zwischendrinn
            } else if (pattern.length <= value.length && value.toLowerCase().match(pattern.toLowerCase())) {
                this._dom.style.order = -1;
                this.visible = true;

            // keine Übereinstimmung
            } else {
                this._dom.style.order = 1;
                this.visible = false;
            }

        } else {
            this._dom.style.order = 0;
            this.visible = true;
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
