/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.grid.cell.Text
// --------------------------------------------------------------
/**
 * EVENTS
 * ----------
 *
 */
kijs.gui.grid.cell.Text = class kijs_gui_grid_cell_Text extends kijs.gui.grid.cell.Cell {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);
        
        // Standard-config-Eigenschaften mergen
        config = Object.assign({}, {
            // Keine
        }, config);

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {

        });

        // Config anwenden
        if (kijs.isObject(config)) {
            this.applyConfig(config, true);
        }
    }


};