/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.grid.column.Column (Abstract)
// --------------------------------------------------------------
/**
 * EVENTS
 * ----------
 *
 */
kijs.gui.grid.columnConfig.ColumnConfig = class kijs_gui_grid_columnConfig_ColumnConfig extends kijs.Observable {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        if (config !== false) {
            throw new kijs.Error('do not create a instance of kijs.gui.grid.columnConfig.ColumnConfig directly');
        }

        this._caption = '';
        this._editable = false;
        this._visible = true;
        this._hideable = true;
        this._resizable = true;
        this._sortable = true;
        this._valueField = '';
        this._width = 100;

        // xtypes
        this._cellXtype = null;
        this._filterXtype = null;
        this._headerCellXtype = null;

        // Configs
        this._cellConfig = null;
        this._filterConfig = null;
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
            cellXtype: true,
            filterXtype: true,
            headerCellXtype: true,

            caption: {target: 'caption' },
            editable: true,
            visible: true,
            hideable: true,
            resizable: true,
            sortable: true,
            valueField: true,
            width: true,

            cellConfig: {target: 'cellConfig' },
            filterConfig: {target: 'filterConfig' }

        };

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
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

    get caption() { return this._caption; }
    set caption(val) {
        this._caption = val;
        this.raiseEvent('change', {columnConfig: this, caption: val});
    }

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

    get editable() { return this._editable; }
    set editable(val) {
        this._editable = !!val;
        this.raiseEvent('change', {columnConfig: this, editable: !!val});
    }

    get filterConfig() {
        let cCnf =  this._filterConfig || {xtype: this._filterXtype};
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
                this._filterConfig.xtype = this._cellXtype;
            }
            this._filterConfig.columnConfig = this;
        }
    }

    get grid() { return this._grid; }
    set grid(val) { this._grid = val; }

    get visible() { return this._visible; }
    set visible(val) {
        if (!val && !this.hideable) {
            return;
        }
        this._visible = !!val;
        this.raiseEvent('change', {columnConfig: this, visible: !!val});
    }

    get hideable() { return this._hideable; }
    set hideable(val) {
        this._hideable = !!val;
        this.raiseEvent('change', {columnConfig: this, hideable: !!val});
    }

    get position() {
        if (this._grid) {
            return this._grid.columnConfigs.indexOf(this);
        }
        return false;
    }
    set position(val) {
        if (this._grid) {
            let curPos = this.position;

            if (!kijs.isInteger(val)) {
                throw new kijs.Error('invalid position value');
            }

            if (val !== curPos) {
                kijs.Array.move(this._grid.columnConfigs, curPos, val);
                this.raiseEvent('change', {columnConfig: this, position: this.position});
            }
        }
    }

    get resizable() { return this._resizable; }
    set resizable(val) {
        this._resizable = !!val;
        this.raiseEvent('change', {columnConfig: this, resizable: !!val});
    }

    get sortable() { return this._sortable; }
    set sortable(val) {
        this._sortable = !!val;
        this.raiseEvent('change', {columnConfig: this, sortable: !!val});
    }

    get valueField() { return this._valueField; }

    get width() { return this._width; }
    set width(val) {
        if (!kijs.isNumeric(val)) {
            throw new kijs.Error('invalid width value for columnConfig');
        }
        this._width = val;
        this.raiseEvent('change', {columnConfig: this, width: val});
    }


    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------

    /**
     * Wendet die Konfigurations-Eigenschaften an
     * @param {Object} config
     * @param {Boolean} [preventEvents=false]   // Das Auslösen des afterResize-Event verhindern?
     * @returns {undefined}
     */
    applyConfig(config={}, preventEvents=false) {
        // evtl. afterResize-Event deaktivieren
        const prevAfterRes = this._preventAfterResize;
        if (preventEvents) {
            this._preventAfterResize = true;
        }

        // Config zuweisen
        kijs.Object.assignConfig(this, config, this._configMap);

        // Evtl. afterResize-Event wieder zulassen
        if (preventEvents) {
            this._preventAfterResize = prevAfterRes;
        }
    }
};