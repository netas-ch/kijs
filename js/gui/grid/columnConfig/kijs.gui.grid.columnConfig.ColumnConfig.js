/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.grid.columnConfig.ColumnConfig (Abstract)
// --------------------------------------------------------------
/**
 * Abstrakte Basisklasse für die Konfiguration einer Spalte von kijs.gui.grid.Grid. Legt fest,
 * welches Feld des Datensatzes angezeigt wird, sowie Beschriftung, Breite, Sichtbarkeit und mit
 * welchen Klassen Zelle (cellXtype), Filter (filterXtype) und Editor (editorXtype) erstellt werden.
 *
 * Nicht direkt instanzieren, sondern eine abgeleitete Klasse verwenden, z.B.
 * kijs.gui.grid.columnConfig.Text.
 *
 * Achtung: Über die Config werden die Werte direkt zugewiesen, ohne Prüfung und ohne change-Event
 * (ausser bei caption).
 *
 * @example
 * new kijs.gui.grid.Grid({
 *     columnConfigs: [
 *         { xtype: 'kijs.gui.grid.columnConfig.Text', caption: 'Name', valueField: 'name', width: 200 }
 *     ]
 * });
 *
 * @fires change  Beim Setzen von caption, editable, hideable, position, resizable, sortable, tooltip,
 *                visible und width. e: columnConfig und die geänderte Eigenschaft mit dem neuen Wert
 *                (bei position: oldPosition, newPosition)
 */
kijs.gui.grid.columnConfig.ColumnConfig = class kijs_gui_grid_columnConfig_ColumnConfig extends kijs.Observable {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        // check if abstract
        if (kijs.isObject(config)) {
            throw new kijs.Error('do not create a instance of kijs.gui.grid.columnConfig.ColumnConfig directly');
        }

        this._caption = '';
        this._visible = true;
        this._hideable = true;
        this._position = null;
        this._resizable = true;
        this._sortable = true;
        this._tooltip = '';
        this._valueField = '';
        this._displayField = '';
        this._width = 100;

        // xtypes
        this._cellXtype = null;
        this._filterXtype = null;
        this._headerCellXtype = null;
        this._editorXtype = null;

        // Editable?
        this._editable = false;
        this._clicksToEdit = 2;

        // Configs
        this._cellConfig = null;
        this._filterConfig = null;
        this._editorConfig = null;
        this._defaultConfig = {};

        // grid
        this._grid = null;

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        this._configMap = {
            grid: true,
            cellXtype: true,        // {String} xtype der Zelle, z.B. 'kijs.gui.grid.cell.Text' (Default je nach Klasse)
            filterXtype: true,      // {String} xtype des Filters, z.B. 'kijs.gui.grid.filter.Text' (Default je nach Klasse)
            headerCellXtype: true,  // {String} Wird zurzeit nicht verwendet
            editorXtype: true,

            caption: { target: 'caption' },
            editable: true,
            clicksToEdit: true,
            visible: true,
            hideable: true,
            position: true,
            resizable: true,
            sortable: true,
            tooltip: true,
            valueField: true,
            displayField: true,
            width: true,

            cellConfig: { target: 'cellConfig' },
            filterConfig: { target: 'filterConfig' },
            editorConfig: { target: 'editorConfig' }
        };

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config);
        }

        if (this._cellConfig === null) {
            this.cellConfig = this._cellXtype;
        }
        if (this.filterConfig === null) {
            this.filterConfig = this._filterXtype;
        }
    }



    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    /**
     * Spaltenbeschriftung
     * @type {String}
     */
    get caption() { return this._caption; }
    set caption(val) {
        this._caption = val;
        this.raiseEvent('change', { columnConfig: this, caption: val });
    }

    /**
     * Config für die Zellen. Der Getter gibt eine Kopie mit columnConfig und xtype (Default cellXtype)
     * zurück. Der Setter akzeptiert ein Objekt oder einen String (= xtype).
     * @type {Object}
     */
    get cellConfig() {
        let cCnf =  this._cellConfig ? kijs.Object.clone(this._cellConfig) : {};
        cCnf.columnConfig = this;
        if (!cCnf.xtype) {
            cCnf.xtype = this._cellXtype;
        }
        return cCnf;
    }
    set cellConfig(val) {
        if (kijs.isString(val)) {
            this._cellConfig = {
                xtype: val
            };
        } else if (kijs.isObject(val)) {
            this._cellConfig = val;
        }
    }

    /**
     * Anzahl Klicks auf eine Zelle, um den Editor zu öffnen: 1 oder 2 (alles andere wird zu 2). Default: 2
     * @type {Number}
     */
    get clicksToEdit() { return this._clicksToEdit; }
    set clicksToEdit(val) { this._clicksToEdit = val === 1 ? 1 : 2; }

    /**
     * Feld des Datensatzes, das angezeigt wird. Leer = valueField
     * @type {String}
     */
    get displayField() { return this._displayField ? this._displayField : this._valueField; }
    set displayField(val) { this._displayField = val; }

    /**
     * Können die Zellen bearbeitet werden? Default: false
     * @type {Boolean}
     */
    get editable() { return this._editable; }
    set editable(val) {
        this._editable = !!val;
        this.raiseEvent('change', { columnConfig: this, editable: !!val });
    }

    /**
     * Zusätzliche Config für den Editor (wird beim Öffnen auf die Argumente des Editors gemergt).
     * Kein Objekt = null.
     * @type {Object|null}
     */
    get editorConfig() { return this._editorConfig; }
    set editorConfig(val) {
        this._editorConfig = kijs.isObject(val) ? val : null;
    }

    /**
     * xtype des Editors, z.B. 'kijs.gui.field.Text' (Default je nach Klasse). Kein String = null
     * @type {String|null}
     */
    get editorXtype() { return this._editorXtype; }
    set editorXtype(val) {
        this._editorXtype = kijs.isString(val) ? val : null;
    }

    /**
     * Config für den Filter mit columnConfig und xtype (Default filterXtype). Der Setter akzeptiert
     * ein Objekt oder einen String (= xtype).
     * @type {Object}
     */
    get filterConfig() {
        let cCnf =  this._filterConfig || { xtype: this._filterXtype };
        cCnf.columnConfig = this;
        return cCnf;
    }
    set filterConfig(val) {
        if (kijs.isString(val)) {
            this._filterConfig = {
                xtype: val
            };
        } else if (kijs.isObject(val)) {
            this._filterConfig = val;
            if (!this._filterConfig.xtype) {
                this._filterConfig.xtype = this._filterXtype;
            }
            this._filterConfig.columnConfig = this;
        }
    }

    /**
     * Grid, zu dem die Spalte gehört
     * @type {kijs.gui.grid.Grid|null}
     */
    get grid() { return this._grid; }
    set grid(val) { this._grid = val; }

    /**
     * Kann die Spalte ausgeblendet werden? Wenn nicht, wird visible=false ignoriert. Default: true
     * @type {Boolean}
     */
    get hideable() { return this._hideable; }
    set hideable(val) {
        this._hideable = !!val;
        this.raiseEvent('change', { columnConfig: this, hideable: !!val });
    }

    /**
     * Position der Spalte. Ohne eigenen Wert der Index in grid.columnConfigs, ohne Grid false.
     * Der Setter (nur mit Grid, Integer) speichert den Wert nicht, sondern löst nur change mit
     * oldPosition und newPosition aus.
     * @type {Number|Boolean}
     */
    get position() {
        if (!kijs.isEmpty(this._position)) {
            return this._position;
        } else if (this._grid) {
            return this._grid.columnConfigs.indexOf(this);
        }
        return false;
    }
    set position(val) {
        if (this._grid) {
            if (!kijs.isInteger(val)) {
                throw new kijs.Error('invalid position value');
            }

            if (val !== this.position) {
                this.raiseEvent('change', { columnConfig: this, oldPosition: this.position, newPosition: val });
            }
        }
    }

    /**
     * Kann die Breite verändert werden? Default: true
     * @type {Boolean}
     */
    get resizable() { return this._resizable; }
    set resizable(val) {
        this._resizable = !!val;
        this.raiseEvent('change', { columnConfig: this, resizable: !!val });
    }

    /**
     * Kann nach der Spalte sortiert werden? Default: true
     * @type {Boolean}
     */
    get sortable() { return this._sortable; }
    set sortable(val) {
        this._sortable = !!val;
        this.raiseEvent('change', { columnConfig: this, sortable: !!val });
    }

    /**
     * Tooltip der Spalte
     * @type {String}
     */
    get tooltip() { return this._tooltip; };
    set tooltip(val) {
        this._tooltip = val;
        this.raiseEvent('change', { columnConfig: this, tooltip: val });
    }

    /**
     * Feld des Datensatzes mit dem Wert (wird z.B. zum Sortieren verwendet). Leer = displayField
     * @type {String}
     */
    get valueField() { return this._valueField ? this._valueField : this._displayField; }
    set valueField(val) { this._valueField = val; }

    /**
     * Ist die Spalte sichtbar? Default: true
     * @type {Boolean}
     */
    get visible() { return this._visible; }
    set visible(val) {
        if (!val && !this.hideable) {
            return;
        }
        if (val !== this._visible) {
            this._visible = !!val;
            this.raiseEvent('change', { columnConfig: this, visible: !!val });
        }
    }

    /**
     * Breite der Spalte in px. Der Setter wirft einen kijs.Error, wenn der Wert nicht numerisch ist. Default: 100
     * @type {Number}
     */
    get width() { return this._width; }
    set width(val) {
        if (!kijs.isNumeric(val)) {
            throw new kijs.Error('invalid width value for columnConfig');
        }
        this._width = val;
        this.raiseEvent('change', { columnConfig: this, width: val });
    }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    /**
     * Wendet die Konfigurations-Eigenschaften an
     * @param {Object} config
     * @returns {undefined}
     */
    applyConfig(config={}) {
        kijs.Object.assignConfig(this, config, this._configMap);
    }
    
};
