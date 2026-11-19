/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.grid.cell.Icon
// --------------------------------------------------------------
/**
 * Zelle mit einem Icon in kijs.gui.grid.Grid (siehe kijs.gui.grid.columnConfig.Icon). Icon, CSS-Klasse,
 * Farbe und Tooltip werden aus den Feldern der dataRow gelesen (iconMapField, iconCharField,
 * iconClsField, iconColorField, tooltipField). Die Zelle ist nie dirty.
 *
 * Das Icon kann als Name einer iconMap (z.B. 'kijs.iconMap.Fa.house', empfohlen) oder als
 * Codepoint (z.B. 0xf015 bzw. '61461') angegeben werden. Eine HTML-Entity (z.B. '&#xf015;')
 * wirft einen kijs.Error.
 */
kijs.gui.grid.cell.Icon = class kijs_gui_grid_cell_Icon extends kijs.gui.grid.cell.Cell {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        this._icon = null;
        this._iconCls = null;           // eigene CSS-Klasse (iconCls, iconClsField)
        this._iconColor = null;
        this._iconMapCls = null;        // Schriftklasse aus der iconMap, z.B. 'fa-brands'
        this._originalIcon = null;

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
     * Icon als Name einer iconMap (z.B. 'kijs.iconMap.Fa.check', empfohlen) oder Codepoint
     * (z.B. 0xf00c). Eine HTML-Entity wirft einen kijs.Error. Der Getter gibt den Codepoint zurück.
     * Wird beim Laden der dataRow durch iconMapField bzw. iconCharField überschrieben.
     * @type {String|Number|null}
     */
    get iconChar() { return this._icon; }
    set iconChar(val) { this._setDomHtml(val); }

    /**
     * Zusätzliche CSS-Klasse des Icons. Muss ein String sein, sonst kijs.Error.
     * Die Schriftklasse einer iconMap (iconMapCls) bleibt davon unberührt.
     * @type {String|null}
     */
    get iconCls() { return this._iconCls; }
    set iconCls(val) { this._setIconCls(val); }

    /**
     * Farbe des Icons
     * @type {String|null}
     */
    get iconColor() { return this._iconColor; }
    set iconColor(val) {
        this._dom.style.color = val;
        this._iconColor = val;
    }

    /**
     * Schriftklasse der iconMap des aktuellen Icons, z.B. 'fa-solid' oder 'fa-brands'
     * @type {String|null}
     */
    get iconMapCls() { return this._iconMapCls; }

    /**
     * Immer false (der Setter hat keine Wirkung)
     * @type {Boolean}
     */
    get isDirty() { return false; }
    set isDirty(val) {}

    /**
     * Icon-Wert, wie er übergeben wurde (z.B. Name einer iconMap oder Codepoint).
     * Wird vom Filter (kijs.gui.grid.filter.Icon) an den Server gesendet.
     * @type {String|Number|null}
     */
    get originalIcon() { return this._originalIcon; }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // overwrite
    loadFromDataRow() {
        super.loadFromDataRow();

        if (this.row && this.row.dataRow) {

            // icon Farbe
            if (this.columnConfig.iconColorField && kijs.isDefined(this.row.dataRow[this.columnConfig.iconColorField])) {
                this.iconColor = this.row.dataRow[this.columnConfig.iconColorField];
            }

            // iconMap
            if (this.columnConfig.iconMapField && kijs.isDefined(this.row.dataRow[this.columnConfig.iconMapField])) {
                this._setDomHtml(this.row.dataRow[this.columnConfig.iconMapField]);
            }

            // iconChar
            if (this.columnConfig.iconCharField && kijs.isDefined(this.row.dataRow[this.columnConfig.iconCharField])) {
                this._setDomHtml(this.row.dataRow[this.columnConfig.iconCharField]);
            }

            // CSS-Klasse
            if (this.columnConfig.iconClsField && kijs.isDefined(this.row.dataRow[this.columnConfig.iconClsField])) {
                this._setIconCls(this.row.dataRow[this.columnConfig.iconClsField]);
            }

            // Tooltip
            if (this.columnConfig.tooltipField && kijs.isDefined(this.row.dataRow[this.columnConfig.tooltipField])) {
                let tooltip = this.row.dataRow[this.columnConfig.tooltipField];
                this._dom.tooltip = kijs.String.nl2br(kijs.String.htmlspecialchars(tooltip));
            }
        }
    }


    // PROTECTED
    /**
     * Setzt das Icon und die Schriftklasse der iconMap (wird auch von setValue() aufgerufen)
     * @param {String|Number|null} value  Name einer iconMap oder Codepoint
     * @returns {undefined}
     */
    // overwrite
    _setDomHtml(value) {
        let mapCls = null;

        this._originalIcon = value;

        // HTML-Entity wird nicht mehr unterstützt
        if (kijs.isString(value) && value.substr(0,2) === '&#') {
            throw new kijs.Error(`icon must be a Number (code point) or an iconMap name, e.g. 'kijs.iconMap.Fa.house' instead of "${value}"`);
        }

        // Name einer iconMap
        if (kijs.isString(value) && value.substr(0, 5) === 'kijs.') {
            const iconMap = kijs.getObjectFromString(value);
            if (kijs.isObject(iconMap) && kijs.isInteger(iconMap.char)) {
                value = iconMap.char;
                mapCls = iconMap.cls || null;
            } else {
                console.warn(`kijs.gui.grid.cell.Icon: unknown iconMap "${value}"`);
                value = null;
            }

        // Codepoint als String, z.B. '61461' oder '0xf015'
        } else if (kijs.isString(value) && !isNaN(parseInt(value))) {
            value = parseInt(value);
        }

        if (!kijs.isInteger(value)) {
            value = null;
        }

        // Schriftklasse der iconMap austauschen (eine gleichnamige eigene Klasse bleibt)
        if (this._iconMapCls && this._iconMapCls !== this._iconCls) {
            this._dom.clsRemove(this._iconMapCls);
        }
        this._iconMapCls = mapCls;
        if (this._iconMapCls) {
            this._dom.clsAdd(this._iconMapCls);
        }

        this._icon = value;
        this._dom.html = kijs.isInteger(value) ? String.fromCodePoint(value) : '';
    }

    /**
     * Setzt die eigene CSS-Klasse des Icons
     * @param {String|null} val
     * @returns {undefined}
     */
    _setIconCls(val) {
        if (!kijs.isString(val) && val) {
            throw new kijs.Error(`config "iconCls" is not a string`);
        }
        if (this._iconCls && this._iconCls !== this._iconMapCls) {
            this._dom.clsRemove(this._iconCls);
        }
        this._iconCls = val || null;
        if (this._iconCls) {
            this._dom.clsAdd(this._iconCls);
        }
    }

};
