/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.grid.column.Column
// --------------------------------------------------------------
/**
 * Spalte für Zahlen in kijs.gui.grid.Grid (Zelle kijs.gui.grid.cell.Number, Filter
 * kijs.gui.grid.filter.Number, Editor kijs.gui.field.Number). Die Zahlen-Einstellungen werden an die
 * Zellen und den Editor weitergegeben.
 *
 * @example
 * { xtype: 'kijs.gui.grid.columnConfig.Number', caption: 'Betrag', valueField: 'betrag', decimalPrecision: 2, unitAfter: ' CHF' }
 */
kijs.gui.grid.columnConfig.Number = class kijs_gui_grid_columnConfig_Number extends kijs.gui.grid.columnConfig.ColumnConfig {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        // default xtype
        this._cellXtype = 'kijs.gui.grid.cell.Number';
        this._filterXtype = 'kijs.gui.grid.filter.Number';
        this._editorXtype = 'kijs.gui.field.Number';

        this._decimalPrecision = null;
        this._decimalSeparator = null;      // null = aus kijs.language
        this._thousandsSeparator = null;    // null = aus kijs.language

        this._numberStyles = [];

        this._unitBefore = '';
        this._unitAfter = '';

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            decimalPrecision: true,     // {Number|null} Anzahl Nachkommastellen. null = unverändert
            decimalSeparator: true,     // {String|null} Dezimaltrennzeichen. Default: null = das der Sprache kijs.language
            thousandsSeparator: true,   // {String|null} Tausendertrennzeichen ('' = keines). Default: null = das der Sprache kijs.language
            numberStyles: true,         // {Object[]} CSS-Styles je nach Wert (siehe kijs.gui.grid.cell.Number.numberStyles)
            unitBefore: true,           // {String} Text vor der Zahl
            unitAfter: true             // {String} Text nach der Zahl
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config);
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



    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
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
            // config für Nummernfeld übernehmen
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
