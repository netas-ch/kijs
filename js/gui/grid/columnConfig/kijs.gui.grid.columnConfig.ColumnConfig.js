/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.grid.column.Column (Abstract)
// --------------------------------------------------------------
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
            cellXtype: true,
            filterXtype: true,
            headerCellXtype: true,
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

    get clicksToEdit() { return this._clicksToEdit; }
    set clicksToEdit(val) { this._clicksToEdit = val === 1 ? 1 : 2; }

    get displayField() { return this._displayField ? this._displayField : this._valueField; }
    set displayField(val) { this._displayField = val; }

    get editable() { return this._editable; }
    set editable(val) {
        this._editable = !!val;
        this.raiseEvent('change', {columnConfig: this, editable: !!val});
    }

    get editorConfig() { return this._editorConfig; }
    set editorConfig(val) {
        this._editorConfig = kijs.isObject(val) ? val : null;
    }

    get editorXtype() { return this._editorXtype; }
    set editorXtype(val) {
        this._editorXtype = kijs.isString(val) ? val : null;
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
                this._filterConfig.xtype = this._filterXtype;
            }
            this._filterConfig.columnConfig = this;
        }
    }

    get grid() { return this._grid; }
    set grid(val) { this._grid = val; }

    get hideable() { return this._hideable; }
    set hideable(val) {
        this._hideable = !!val;
        this.raiseEvent('change', {columnConfig: this, hideable: !!val});
    }

    get position() {
        if (!kijs.isEmpty(this._position)) {
            return this._position;
        } else if (this._grid) {
            return this._grid.columnConfigs.indexOf(this);
        }
        return false;
    }
    set position(val) {
        if (val !== this.position) {
            this.raiseEvent('change', {columnConfig: this, position: this.position});
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

    get tooltip() { return this._tooltip };
    set tooltip(val) {
        this._tooltip = val;
        this.raiseEvent('change', {columnConfig: this, tooltip: val});
    }

    get valueField() { return this._valueField ? this._valueField : this._displayField; }
    set valueField(val) { this._valueField = val; }

    get visible() { return this._visible; }
    set visible(val) {
        if (!val && !this.hideable) {
            return;
        }
        if (val !== this._visible) {
            this._visible = !!val;
            this.raiseEvent('change', {columnConfig: this, visible: !!val});
        }
    }

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
