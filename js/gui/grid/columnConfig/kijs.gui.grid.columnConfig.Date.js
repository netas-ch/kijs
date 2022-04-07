/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.grid.column.Column
// --------------------------------------------------------------
/**
 * EVENTS
 * ----------
 *
 */
kijs.gui.grid.columnConfig.Date = class kijs_gui_grid_columnConfig_Date extends kijs.gui.grid.columnConfig.ColumnConfig {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        // default xtype
        this._cellXtype = 'kijs.gui.grid.cell.Date';
        this._filterXtype = 'kijs.gui.grid.filter.Date';

        // Editor
        this._editorXtype = 'kijs.gui.field.Date';

        this._hasTime = false;
        this._format = null;

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            hasTime: true,
            format: true
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }

        if (!this._format) {
            if (this._hasTime) {
                this._format = 'd.m.Y H:i';
            } else {
                this._format = 'd.m.Y';
            }
        }

        this.cellConfig = {
            hasTime: this._hasTime,
            format: this._format
        };
    }
};