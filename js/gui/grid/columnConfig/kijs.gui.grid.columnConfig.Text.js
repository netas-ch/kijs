/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.grid.column.Column
// --------------------------------------------------------------
/**
 * Spalte für Text in kijs.gui.grid.Grid (Zelle kijs.gui.grid.cell.Text, Filter kijs.gui.grid.filter.Text,
 * Editor kijs.gui.field.Text). Standard-Spalte des Grids.
 */
kijs.gui.grid.columnConfig.Text = class kijs_gui_grid_columnConfig_Text extends kijs.gui.grid.columnConfig.ColumnConfig {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        // default xtype
        this._cellXtype = 'kijs.gui.grid.cell.Text';
        this._filterXtype = 'kijs.gui.grid.filter.Text';
        this._editorXtype = 'kijs.gui.field.Text';

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            // Keine
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }
    }
    
};