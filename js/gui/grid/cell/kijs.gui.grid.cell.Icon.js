/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.grid.cell.Icon
// --------------------------------------------------------------
/**
 * EVENTS
 * ----------
 *
 */
kijs.gui.grid.cell.Icon = class kijs_gui_grid_cell_Icon extends kijs.gui.grid.cell.Cell {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        this._iconCls = null;
        this._icon = null;
        this._originalIcon = null;
        this._iconColor = null;
        this._caption = null;

        //this._dom.nodeTagName = 'span';
        this._dom.clsAdd('kijs-icon');

        // class
        this.dom.clsAdd('kijs-grid-cell-icon');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            iconChar: true,   // Alias für html
            iconCls: { target: this._iconCls },
            iconColor: { target: 'iconColor' },
            iconCharField: true,
            iconClsField: true,
            iconColorField: true,
            caption: { target: 'caption' }
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

    get icon() { return this._icon; }

    get originalIcon() { return this._originalIcon; }

    set caption(val) { this._caption = val; }
    get caption() { return this._caption; }

    set iconColor(val) { this._dom.style.color = val; this._iconColor = val; }
    get iconColor() { return this._iconColor; }

    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------


    // Overwrite

     loadFromDataRow() {
        super.loadFromDataRow();

        if (this.row && this.row.dataRow && kijs.isDefined(this.row.dataRow[this.columnConfig.iconColorField])) {
           this._iconColor = this.row.dataRow[this.columnConfig.iconColorField];
           this._dom.style.color = this._iconColor;
        }

        let value = null;
        if (!value && this.row && this.row.dataRow && kijs.isDefined(this.row.dataRow[this.columnConfig.iconCharField])) {
           value = this.row.dataRow[this.columnConfig.iconCharField];
        } else if (!value && this.row && this.row.dataRow && kijs.isDefined(this.row.dataRow[this.columnConfig.iconClsField])) {
           value = this.row.dataRow[this.columnConfig.iconClsField];
        }
        this._caption = this.row.dataRow[this.columnConfig.valueField];
        this._setDomHtml(value);
    }

    /**
     * Icon rendern
     * @param {String|Number} value
     * @returns {undefined}
     */
    _setDomHtml(value) {
        this._originalIcon = value;

        if (kijs.isInteger(value)){
            value = String.fromCodePoint(value);

        } else if (kijs.isString(value)) {
            value = kijs.String.htmlentities_decode(value);
        }

        this._icon = value;
        this._dom.html = this._icon;
    }

    _iconCls(val) {
        if (kijs.isEmpty(val)) {
            val = null;
        }
        if (!kijs.isString && !val) {
            throw new kijs.Error(`config "iconCls" is not a string`);
        }
        if (this._iconCls) {
            this._dom.clsRemove(this._iconCls);
        }
        this._iconCls = val;
        if (this._iconCls) {
            this._dom.clsAdd(this._iconCls);
        }
    }
};
