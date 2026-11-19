/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.grid.column.Column
// --------------------------------------------------------------
/**
 * Spalte mit Checkboxen in kijs.gui.grid.Grid (Zelle kijs.gui.grid.cell.Checkbox, Filter
 * kijs.gui.grid.filter.Checkbox). Die Checkbox wird direkt angeklickt, es gibt keinen Editor.
 */
kijs.gui.grid.columnConfig.Checkbox = class kijs_gui_grid_columnConfig_Checkbox extends kijs.gui.grid.columnConfig.ColumnConfig {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        // default xtype
        this._cellXtype = 'kijs.gui.grid.cell.Checkbox';
        this._filterXtype = 'kijs.gui.grid.filter.Checkbox';

        this._editorXtype = null;

        this._disabled = false;

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            disabled: true     // {Boolean} Checkboxen deaktivieren (nicht anklickbar)? Default: false
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config);
        }

        this.cellConfig = {
            disabled: this._disabled
        };
    }
    
};
