/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.grid.cell.Button
// --------------------------------------------------------------
/**
 * EVENTS
 * ----------
 *
 */
kijs.gui.grid.cell.Button = class kijs_gui_grid_cell_Button extends kijs.gui.grid.cell.Cell {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config = {}) {
        super(false);

        this._button = null;

        // class
        this.dom.clsAdd('kijs-grid-cell-button');

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
    }

    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------

    get button() {
        return this._button;
    }

    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------

    // overwrite
    setValue(config, silent = false, markDirty = true, updateDataRow = true) {

        if (config) {
            this._button = new kijs.gui.Button(config);
            this._button.on('click', this._onButtonClick, this);
        }

        // dataRow aktualisieren
        if (updateDataRow) {
            this._setRowDataRow(value);
        }

        this.isDirty = false;

        if (!silent) {
            this.raiseEvent('change', {value: this.value});
        }

        if (this.isRendered) {
            this.render();
        }
    }

    // overwrite
    render(superCall) {
        super.render(true);

        if (this._button) {
            this._button.renderTo(this.dom.node);
        }

        // Event afterRender auslösen
        if (!superCall) {
            this.raiseEvent('afterRender');
        }
    }

    // Listeners
    _onButtonClick(e) {
        this.raiseEvent('buttonClick', e);
    }
};
