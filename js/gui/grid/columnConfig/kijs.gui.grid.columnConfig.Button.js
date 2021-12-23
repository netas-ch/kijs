/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.grid.columnConfig.Button
// --------------------------------------------------------------
/**
 * EVENTS
 * ----------
 *
 */
kijs.gui.grid.columnConfig.Button = class kijs_gui_grid_columnConfig_Button extends kijs.gui.grid.columnConfig.ColumnConfig {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        // default xtype
        this._buttonConfig = null;
        this._cellXtype = 'kijs.gui.grid.cell.Button';
        this._filterXtype = 'kijs.gui.grid.filter.Button';

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
};
