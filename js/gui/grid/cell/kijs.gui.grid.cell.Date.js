/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.grid.cell.Date
// --------------------------------------------------------------
/**
 * Zelle für ein Datum in kijs.gui.grid.Grid (siehe kijs.gui.grid.columnConfig.Date). Der Wert wird mit
 * kijs.Date.create() gelesen und mit format angezeigt.
 */
kijs.gui.grid.cell.Date = class kijs_gui_grid_cell_Date extends kijs.gui.grid.cell.Cell {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
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
            hasTime: true,  // {Boolean} Mit Uhrzeit? Bestimmt das Standardformat. Default: false
            format: true    // {String|null} Format für kijs.Date.format(), z.B. 'd.m.Y'. Default: null = Format der Sprache kijs.language (siehe kijs.Date.formatLocal())
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }

    }


    // PROTECTED
    // Overwrite
    _getEditorArgs() {
        let eArgs = super._getEditorArgs();

        // field.DateTime zeigt das Datum im Format der eingestellten Sprache an
        eArgs.mode = this._hasTime ? 'dateTime' : 'date';

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
            this._dom.html = this._format ? kijs.Date.format(date, this._format) : kijs.Date.formatLocal(date, this._hasTime);
        } else {
            this._dom.html = value;
        }
    }
    
};