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
            iconCls: { target: 'iconCls' },
            iconColor: { target: 'iconColor' },
            iconCharField: true,
            iconClsField: true,
            iconColorField: true,
            caption: true
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

    set iconCls(val) { this._addIconCls(val); }
    get iconCls() { return this._iconCls; }

    set iconColor(val) { this._dom.style.color = val; this._iconColor = val; }
    get iconColor() { return this._iconColor; }

    set isDirty(val) {}
    get isDirty() { return false; }

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

        if (this.row && this.row.dataRow) {

            // Icon hinzufügen
            if (kijs.isDefined(this.row.dataRow[this.columnConfig.iconCharField])) {
                let value = this.row.dataRow[this.columnConfig.iconCharField];
                this._setDomHtml(value);
            }

            // CSS-Klasse hinzufügen
            if (kijs.isDefined(this.row.dataRow[this.columnConfig.iconClsField])) {
                let cls = this.row.dataRow[this.columnConfig.iconClsField];
                this._addIconCls(cls);
            }

            // Caption zuweisen
            this._caption = this.row.dataRow[this.columnConfig.valueField];
        }
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

    /**
     * Icon Klasse hinzufügen
     * @param val
     * @private
     */
    _addIconCls(val) {
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
