/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.grid.column.Column
// --------------------------------------------------------------
/**
 * EVENTS
 * ----------
 *
 */
kijs.gui.grid.columnConfig.Number = class kijs_gui_grid_columnConfig_Number extends kijs.gui.grid.columnConfig.ColumnConfig {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        // default xtype
        this._cellXtype = 'kijs.gui.grid.cell.Number';
        this._filterXtype = 'kijs.gui.grid.filter.Number';

        this._decimalPrecision = null;
        this._decimalPoint = '.';
        this._decimalThousandSep = '\'';

        this._numberStyles = [];

        this._unitBefore = '';
        this._unitAfter = '';

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            decimalPrecision: true,
            decimalPoint: true,
            decimalThousandSep: true,
            numberStyles: true,
            unitBefore: true,
            unitAfter: true
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }

        this.cellConfig = {
            decimalPrecision: this._decimalPrecision,
            decimalPoint: this._decimalPoint,
            decimalThousandSep: this._decimalThousandSep,
            numberStyles: this._numberStyles,
            unitBefore: this._unitBefore,
            unitAfter: this._unitAfter
        };
    }
};