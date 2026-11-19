/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.grid.cell.Icon
// --------------------------------------------------------------
/**
 * Zelle mit einem Icon in kijs.gui.grid.Grid (siehe kijs.gui.grid.columnConfig.Icon). Icon, CSS-Klasse,
 * Farbe und Tooltip werden aus den Feldern der dataRow gelesen (iconMapField, iconCharField,
 * iconClsField, iconColorField, tooltipField). Die Zelle ist nie dirty.
 */
kijs.gui.grid.cell.Icon = class kijs_gui_grid_cell_Icon extends kijs.gui.grid.cell.Cell {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        this._iconCls = null;
        this._icon = null;
        this._originalIcon = null;
        this._iconColor = null;

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
            iconChar: { target: 'iconChar' },
            iconCls: { target: 'iconCls' },
            iconColor: { target: 'iconColor' }
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
    /**
     * Codepoint des angezeigten Icons
     * @type {Number|null}
     */
    get icon() { return this._icon; }

    /**
     * Setzt das Icon: Codepoint, HTML-Entity (z.B. '&#xf00c;') oder Name einer iconMap
     * (z.B. 'kijs.iconMap.Fa.check'). Wird beim Laden der dataRow durch iconMapField bzw.
     * iconCharField überschrieben.
     * @type {String|Number|null}
     */
    set iconChar(val) { this._setDomHtml(val); }

    set iconCls(val) { this._addIconCls(val); }
    /**
     * Zusätzliche CSS-Klasse des Icons. Muss ein String sein, sonst kijs.Error.
     * @type {String|null}
     */
    get iconCls() { return this._iconCls; }

    set iconColor(val) { this._dom.style.color = val; this._iconColor = val; }
    /**
     * Farbe des Icons
     * @type {String|null}
     */
    get iconColor() { return this._iconColor; }

    set isDirty(val) {}
    /**
     * Immer false (der Setter hat keine Wirkung)
     * @type {Boolean}
     */
    get isDirty() { return false; }
    
    /**
     * Icon-Wert, wie er übergeben wurde (z.B. IconMap-Name oder HTML-Entity)
     * @type {String|Number|null}
     */
    get originalIcon() { return this._originalIcon; }
    
    

    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // Overwrite
    loadFromDataRow() {
        super.loadFromDataRow();

        if (this.row && this.row.dataRow) {

            // icon Farbe
            if (this.columnConfig.iconColorField && kijs.isDefined(this.row.dataRow[this.columnConfig.iconColorField])) {
               this._iconColor = this.row.dataRow[this.columnConfig.iconColorField];
               this._dom.style.color = this._iconColor;
            }

            // iconMap
            if (this.columnConfig.iconMapField && kijs.isDefined(this.row.dataRow[this.columnConfig.iconMapField])) {
                let value = this.row.dataRow[this.columnConfig.iconMapField];
                this._setDomHtml(value);
            }

            // iconChar
            if (this.columnConfig.iconCharField && kijs.isDefined(this.row.dataRow[this.columnConfig.iconCharField])) {
                let value = this.row.dataRow[this.columnConfig.iconCharField];
                this._setDomHtml(value);
            }

            // CSS-Klasse hinzufügen
            if (this.columnConfig.iconClsField && kijs.isDefined(this.row.dataRow[this.columnConfig.iconClsField])) {
                let cls = this.row.dataRow[this.columnConfig.iconClsField];
                this._addIconCls(cls);
            }

            // Tooltip hinzufügen
            if (this.columnConfig.tooltipField && kijs.isDefined(this.row.dataRow[this.columnConfig.tooltipField])) {
                let tooltip = this.row.dataRow[this.columnConfig.tooltipField];
                this._dom.tooltip = kijs.String.nl2br(kijs.String.htmlspecialchars(tooltip));
            }
        }
    }


    // PROTECTED
    /**
     * Icon Klasse hinzufügen
     * @param val
     * @private
     */
    _addIconCls(val) {
        if (!kijs.isString(val) && val) {
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
    
    /**
     * Icon rendern
     * @param {String|Number} value
     * @returns {undefined}
     */
    _setDomHtml(value) {
        this._originalIcon = value;

        if (kijs.isString(value) && value.substr(0,2) === '&#') {
            value = kijs.String.htmlentities_decode(value).codePointAt(0);
        }

        if (kijs.isString(value) && !isNaN(parseInt(value))) {
            value = parseInt(value);
        }

        if (kijs.isString(value) && value.substr(0, 4) === 'kijs') {
            let iconMap = kijs.getObjectFromString(value);
            if (kijs.isInteger(iconMap.char)) {
                value = iconMap.char;
            }
            if (kijs.isDefined(iconMap.cls)) {
                this._addIconCls(iconMap.cls);
            }
        }

        if (!kijs.isNumber(value)) {
            value = null;
        }

        this._icon = value;
        this._dom.html = kijs.isInteger(value) ? String.fromCodePoint(value) : '';
    }

};
