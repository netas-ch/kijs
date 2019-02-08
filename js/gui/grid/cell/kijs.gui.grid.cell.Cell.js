/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.grid.cell.Cell (Abstract)
// --------------------------------------------------------------
/**
 * EVENTS
 * ----------
 *
 */
kijs.gui.grid.cell.Cell = class kijs_gui_grid_cell_Cell extends kijs.gui.Element {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        // DOM type
        this._dom.nodeTagName = 'td';
        
        this._originalValue = null;
        this._columnConfig = null;

        // Standard-config-Eigenschaften mergen
        config = Object.assign({}, {
            // keine
        }, config);

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            columnConfig: true
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            this.applyConfig(config, true);
        }
    }

    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------

    get isDirty() { return this._originalValue !== this.value; }
    set isDirty(val) {
        if (val === false) {
            this._originalValue = this.value;
        } else {
            this._originalValue = null;
        }
    }

    get originalValue() { return this._originalValue; }

    get row() { return this.parent; }

    get value() { return this._dom.html; }
    set value(val) { this.setValue(val); }


    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------

    /**
     * Setzt den Wert auf den Standardwert zurück
     * @param {Boolean} [silent=false] true, falls kein change-event ausgelöst werden soll.
     * @returns {undefined}
     */
    resetValue(silent=false) {
        this.setValue(this.originalValue, silent);
    }

    /**
     * Setzt das value der Zelle.
     * @param {String} value
     * @param {Boolean} [silent=false] true, falls kein change-event ausgelöst werden soll.
     * @param {Boolean} [markDirty=true] false, falls der Eintrag nicht als geändert markiert werden soll.
     * @param {Boolean} [updateDataRow=true] false, falls die dataRow nicht aktualisiert werden soll.
     * @returns {undefined}
     */
    setValue(value, silent=false, markDirty=true, updateDataRow=true) {
        // HTML aktualisieren
        this._setDomHtml(value);

        // dataRow aktualisieren
        if (updateDataRow) {
            this._setRowDataRow(value);
        }
        
        if (!markDirty) {
            this.isDirty = false;
        }

        if (!silent) {
            this.raiseEvent('change', {value: this.value});
        }

        if (this.isRendered) {
            this.render();
        }
    }

    /**
     * Lädt das value von der dataRow
     * @returns {undefined}
     */
    loadFromDataRow() {
        let vF = this._columnConfig.valueField;
        if (this.row && this.row.dataRow[vF]) {
            this.setValue(this.row.dataRow[vF], true, false, false);
        }
    }

    // PROTECTED
    /**
     * Setzt das HTML im DOM. Kann in abgeleiteter Klasse überschrieben werden,
     * falls ein anderer Wert angezeigt werden soll als das Value.
     * @param {String} value
     * @returns {undefined}
     */
    _setDomHtml(value) {
        this._dom.html = value;
    }

    /**
     * Schreibt das value zurück in die DataRow
     * @param {String} value
     * @returns {undefined}
     */
    _setRowDataRow(value) {
        let vF = this._columnConfig.valueField;
        if (this.row) {
            this.row.dataRow[vF] = value;
        }
    }

    // LISTENER
    _onColumnConfigChange(e) {
        this.render();
    }

    // Overwrite
    render(superCall) {
        super.render(true);

        this._columnConfig.off('change', this._onColumnConfigChange, this);
        this._columnConfig.on('change', this._onColumnConfigChange, this);

        // breite
        this._dom.width = this._columnConfig.width;

        // sichtbar?
        this.visible = this._columnConfig.visible;

        // dirty  zeilen: Klasse hinzufügen
        if (this.isDirty) {
            this._dom.clsAdd('kijs-grid-cell-dirty');
        } else {
            this._dom.clsRemove('kijs-grid-cell-dirty');
        }

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

        super.unrender(true);
    }


    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(superCall) {
        if (!superCall) {
            // unrendern
            this.unrender(superCall);

            // Event auslösen.
            this.raiseEvent('destruct');
        }


        // Variablen (Objekte/Arrays) leeren


        // Basisklasse entladen
        super.destruct(true);
    }
};