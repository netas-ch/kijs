/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.grid.cell.Text
// --------------------------------------------------------------
/**
 * Zelle für Text in kijs.gui.grid.Grid (siehe kijs.gui.grid.columnConfig.Text).
 */
kijs.gui.grid.cell.Text = class kijs_gui_grid_cell_Text extends kijs.gui.grid.cell.Cell {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {

        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }
    }


};