/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.grid.column.Column
// --------------------------------------------------------------
/**
 * EVENTS
 * ----------
 *
 */
kijs.gui.grid.columnConfig.Icon = class kijs_gui_grid_columnConfig_Icon extends kijs.gui.grid.columnConfig.ColumnConfig {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        // default xtype
        this._cellXtype = 'kijs.gui.grid.cell.Icon';
        this._filterXtype = 'kijs.gui.grid.filter.Icon';
        this._iconCharField = null;
        this._iconClsField = null;
        this._iconColorField = null;
        this._iconsCnt = null;
        this._captionField = null;

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            iconsCnt: 155
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            iconCharField:  true,
            iconClsField:  true,
            iconColorField: true,
            iconsCnt: true,
            captionField: true
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }
    }
    
    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------

    get captionField() { return this._captionField; }
    set captionField(val) { this._captionField = val; }

    get iconCharField() { return this._iconCharField; }
    set iconCharField(val) { this._iconCharField = val;}

    get iconClsField() { return this._iconClsField; }
    set iconClsField(val) { this._iconClsField = val; }

    get iconColorField() { return this._iconColorField; }
    set iconColorField(val) { this._iconColorField = val; }
    
    get iconsCnt() { return this._iconsCnt; }
    set iconsCnt(val) { this._iconsCnt = val; }
    
    get valueField() { return this._valueField; }
    set valueField(val) { this._valueField = val; }
};
