/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.grid.cell.Date
// --------------------------------------------------------------
/**
 * EVENTS
 * ----------
 *
 */
kijs.gui.grid.cell.Date = class kijs_gui_grid_cell_Date extends kijs.gui.grid.cell.Cell {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        this._hasTime = false;
        this._format = null;

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            hasTime: true,
            format: true
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }

        if (!this._format) {
            if (this._hasTime) {
                this._format = 'd.m.Y H:i';
            } else {
                this._format = 'd.m.Y';
            }
        }
    }

    // Overwrite
    _getEditorArgs() {
        let eArgs = super._getEditorArgs();

        eArgs.hasTime = this._hasTime;
        eArgs.displayFormat = this._format;

        return eArgs;
    }

    /**
     * Zahl rendern
     * @param {String|Number} value
     * @returns {undefined}
     */
    _setDomHtml(value) {
        let date = kijs.Date.create(value);

        if (kijs.isDate(date)) {
            this._dom.html = kijs.Date.format(date, this._format);
        } else {
            this._dom.html = value;
        }
    }
};