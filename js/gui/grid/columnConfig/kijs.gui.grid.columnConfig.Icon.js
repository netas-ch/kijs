/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.grid.columnConfig.Column
// --------------------------------------------------------------
/**
 * Spalte mit Icons in kijs.gui.grid.Grid (Zelle kijs.gui.grid.cell.Icon, Filter kijs.gui.grid.filter.Icon).
 * Icon, CSS-Klasse, Farbe und Tooltip kommen aus Feldern des Datensatzes.
 *
 * @example
 * { xtype: 'kijs.gui.grid.columnConfig.Icon', caption: 'Status', iconMapField: 'statusIcon', iconColorField: 'statusColor' }
 */
kijs.gui.grid.columnConfig.Icon = class kijs_gui_grid_columnConfig_Icon extends kijs.gui.grid.columnConfig.ColumnConfig {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        // default xtype
        this._cellXtype = 'kijs.gui.grid.cell.Icon';
        this._filterXtype = 'kijs.gui.grid.filter.Icon';
        this._iconCharField = null;
        this._iconClsField = null;
        this._iconMapField = null;
        this._iconColorField = null;
        this._iconsCnt = null;
        this._tooltipField = null;

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {

        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            iconCharField:  true,
            iconClsField:  true,
            iconMapField:  true,
            iconColorField: true,
            iconsCnt: true,         // {Number|null} Max. Anzahl Icons in der Auswahl des Filters. Default: null (keine Auswahl)
            tooltipField: true
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
    get displayField() { return super.displayField ? super.displayField : this._iconCharField; }
    set displayField(val) { this.iconCharField = val; }
    
    /**
     * Feld mit dem Icon-Zeichen (Codepoint oder HTML-Entity). Leer = displayField, ausser es ist ein
     * iconMapField gesetzt.
     * @type {String|null}
     */
    get iconCharField() {
        if (this._iconCharField) {
            return this._iconCharField;
        }
        return this._iconMapField ? null : super.displayField;
    }
    set iconCharField(val) { this._iconCharField = val; }

    /**
     * Feld mit einer zusätzlichen CSS-Klasse des Icons
     * @type {String|null}
     */
    get iconClsField() { return this._iconClsField; }
    set iconClsField(val) { this._iconClsField = val; }

    /**
     * Feld mit der Farbe des Icons
     * @type {String|null}
     */
    get iconColorField() { return this._iconColorField; }
    set iconColorField(val) { this._iconColorField = val; }

    /**
     * Feld mit dem Namen einer IconMap, z.B. 'kijs.iconMap.Fa.house'
     * @type {String|null}
     */
    get iconMapField() { return this._iconMapField; }
    set iconMapField(val) { this._iconMapField = val; }

    /**
     * Maximale Anzahl verschiedener Icons, die der Filter (kijs.gui.grid.filter.Icon) als Auswahl
     * anbietet. Kommen mehr Icons vor, wird keine Auswahl angezeigt. null = keine Auswahl.
     * Der Server muss den Filter mit type 'icon' auswerten (Array icons mit den ausgewählten Icons).
     * @type {Number|null}
     */
    get iconsCnt() { return this._iconsCnt; }
    set iconsCnt(val) { this._iconsCnt = val; }

    /**
     * Feld mit dem Tooltip-Text
     * @type {String|null}
     */
    get tooltipField() { return this._tooltipField; }
    set tooltipField(val) { this._tooltipField = val; }

};
