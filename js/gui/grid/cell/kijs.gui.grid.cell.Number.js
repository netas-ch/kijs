/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.grid.cell.Number
// --------------------------------------------------------------
/**
 * EVENTS
 * ----------
 *
 */
kijs.gui.grid.cell.Number = class kijs_gui_grid_cell_Number extends kijs.gui.grid.cell.Cell {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        // default xtype
        this._editorXType = 'kijs.gui.field.Number';

        // Nummer-Einstellungen
        this._decimalPrecision = null;
        this._decimalPoint = '.';
        this._decimalThousandSep = '\'';

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            cls: 'kijs-grid-cell-number'
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            decimalPrecision: true,
            decimalPoint: true,
            decimalThousandSep: true
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

        eArgs.allowDecimals = this._decimalPrecision > 0;
        eArgs.alwaysDisplayDecimals = this._decimalPrecision > 0;
        eArgs.decimalPrecision = this._decimalPrecision;
        eArgs.decimalSeparator = this._decimalPoint;
        eArgs.thousandsSeparator = this._decimalThousandSep;

        return eArgs;
    }

    /**
     * Zahl rendern
     * @param {String|Number} value
     * @returns {undefined}
     */
    _setDomHtml(value) {
        let num = parseFloat(value);

        if (kijs.isNumber(num)) {
            this._dom.html = kijs.Number.format(num, this._decimalPrecision, this._decimalPoint, this._decimalThousandSep);
        } else {
            this._dom.html = value;
        }
    }
};