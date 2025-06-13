/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.grid.cell.Checkbox
// --------------------------------------------------------------
kijs.gui.grid.cell.Checkbox = class kijs_gui_grid_cell_Checkbox extends kijs.gui.grid.cell.Cell {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        // value
        this._checked = false;

        // class
        this._dom.clsAdd('kijs-grid-cell-checkbox');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            // keine
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }

        // Events
        this._dom.on('click', this.#onClick, this);
    }



    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    // Overwrite
    get value() { return this._checked; }
    set value(val) { this.setValue(val); }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------


    /**
     * Setzt das value der Zelle.
     * @param {String} value
     * @param {Boolean} [silent=false] true, falls kein change-event ausgelöst werden soll.
     * @param {Boolean} [markDirty=true] false, falls der Eintrag nicht als geändert markiert werden soll.
     * @param {Boolean} [updateDataRow=true] false, falls die dataRow nicht aktualisiert werden soll.
     * @returns {undefined}
     */
    setValue(value, silent=false, markDirty=true, updateDataRow=true) {
        value = (value === true || value === 1 || value === '1');
        this._checked = value;
        return super.setValue(value, silent, markDirty, updateDataRow);
    }


    // PROTECTED
    /**
     * icon rendern
     * @param {String|Number} value
     * @returns {undefined}
     */
    _setDomHtml(value) {
        if (value === true || value === 1 || value === '1') {
            this._dom.html = String.fromCharCode(0xf046); // fa-check-square-o
        } else {
            this._dom.html = String.fromCharCode(0xf096); // fa-square-o
        }
    }

    
    // PRIVATE
    // LISTENERS
    #onClick() {
        if (!this._editable) {
            return;
        }

        // value invertieren
        this.setValue(!this._checked);
    }

    /**
     * overwrite
     * prevent edit
     */
    #onDblClick() {
        return;
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
        
        // Variablen (Objekte/Arrays) leeren

        // Basisklasse entladen
        super.destruct(true);
    }
    
};
