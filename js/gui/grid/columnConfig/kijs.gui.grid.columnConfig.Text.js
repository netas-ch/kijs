/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.grid.column.Column
// --------------------------------------------------------------
/**
 * EVENTS
 * ----------
 *
 */
kijs.gui.grid.columnConfig.Text = class kijs_gui_grid_columnConfig_Text extends kijs.gui.grid.columnConfig.ColumnConfig {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        // default xtype
        this._cellXtype = 'kijs.gui.grid.cell.Text';
        this._filterFieldXtype = 'kijs.gui.grid.filterField.Text';
        this._headerCellXtype = 'kijs.gui.grid.headerCell.Text';
        
        // Standard-config-Eigenschaften mergen
        config = Object.assign({}, {
            // Keine
        }, config);

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            // Keine
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            this.applyConfig(config, true);
        }
    }
};