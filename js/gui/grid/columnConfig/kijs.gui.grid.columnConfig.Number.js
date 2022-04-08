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
        this._editorXtype = 'kijs.gui.field.Number';

        this._decimalPrecision = null;
        this._decimalSeparator = '.';
        this._thousandsSeparator = '\'';

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
            decimalSeparator: true,
            thousandsSeparator: true,
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
            decimalSeparator: this._decimalSeparator,
            thousandsSeparator: this._thousandsSeparator,
            numberStyles: this._numberStyles,
            unitBefore: this._unitBefore,
            unitAfter: this._unitAfter
        };
    }

    /**
     * Gibt die Argumente für den Celleditor zurück
     * @returns {Object}
     */
    get editorConfig() {
        let editorConfig = super.editorConfig;

        if (this._editorXtype === 'kijs.gui.field.Number') {
            if (!kijs.isObject(editorConfig)) {
                editorConfig = {};
            }
            // config für Nummerfeld übernehmen
            if (this._decimalPrecision !== null && !kijs.isDefined(editorConfig.decimalPrecision)) {
                editorConfig.decimalPrecision = this._decimalPrecision;
            }
            if (this._decimalSeparator !== null && !kijs.isDefined(editorConfig.decimalSeparator)) {
                editorConfig.decimalSeparator = this._decimalSeparator;
            }
            if (this._thousandsSeparator !== null && !kijs.isDefined(editorConfig.thousandsSeparator)) {
                editorConfig.thousandsSeparator = this._thousandsSeparator;
            }
            
        }
        return editorConfig;
    }

    set editorConfig(val) {
        super.editorConfig = val;
    }
};