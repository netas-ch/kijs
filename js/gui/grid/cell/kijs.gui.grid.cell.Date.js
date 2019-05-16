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

        // default xtype
        this._editorXType = 'kijs.gui.field.Date';
        this._hasTime = false;
        this._format = 'd.m.Y';

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