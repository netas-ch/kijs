/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.grid.Grid
// --------------------------------------------------------------
/**
 * EVENTS
 * ----------
 *
 */
kijs.gui.grid.Grid = class kijs_gui_grid_Grid extends kijs.gui.Element {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        this._rows = [];
        this._columnConfigs = [];

        this._dom.clsAdd('kijs-grid');

        // dom - elemente erstellen

        // 3 Zeilen
        this._topDom = new kijs.gui.Dom({cls: 'kijs-top'});
        this._middleDom = new kijs.gui.Dom({cls: 'kijs-center'});
        this._bottomDom = new kijs.gui.Dom({cls: 'kijs-bottom'});

        this._tableContainerDom = new kijs.gui.Dom({cls: 'kijs-tablecontainer', on:{scroll: this._onTableScroll, context: this}});
        this._tableDom = new kijs.gui.Dom({nodeTagName: 'table'});

        this._headerContainerDom = new kijs.gui.Dom({cls: 'kijs-headercontainer'});
        this._headerDom = new kijs.gui.Dom({nodeTagName: 'table'});

        this._footerContainerDom = new kijs.gui.Dom({cls: 'kijs-footercontainer'});
        this._footerDom = new kijs.gui.Dom({nodeTagName: 'table'});

        this._leftContainerDom = new kijs.gui.Dom({cls: 'kijs-leftcontainer'});
        this._leftDom = new kijs.gui.Dom({nodeTagName: 'table'});

        this._rightContainerDom = new kijs.gui.Dom({cls: 'kijs-rightcontainer'});
        this._rightDom = new kijs.gui.Dom({nodeTagName: 'table'});

        // header
        this._headerLeftContainerDom = new kijs.gui.Dom({cls: 'kijs-headercontainer-left'});
        this._headerLeftDom = new kijs.gui.Dom({nodeTagName: 'table'});

        this._headerRightContainerDom = new kijs.gui.Dom({cls: 'kijs-headercontainer-right'});
        this._headerRightDom = new kijs.gui.Dom({nodeTagName: 'table'});

        // footer
        this._footerLeftContainerDom = new kijs.gui.Dom({cls: 'kijs-footercontainer-left'});
        this._footerLeftDom = new kijs.gui.Dom({nodeTagName: 'table'});

        this._footerRightContainerDom = new kijs.gui.Dom({cls: 'kijs-footercontainer-right'});
        this._footerRightDom = new kijs.gui.Dom({nodeTagName: 'table'});

        // header
        this._header = new kijs.gui.grid.Header({
            parent: this
        });

        // Standard-config-Eigenschaften mergen
        config = Object.assign({}, {
            // keine
        }, config);

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            rpc: true,
            facadeFnLoad: true,
            facadeFnSave: true,
            columnConfigs: { fn: 'function', target: this.columnConfigAdd, context: this },

            data: { target: 'data' }

        });

        // Config anwenden
        if (kijs.isObject(config)) {
            this.applyConfig(config, true);
        }
    }


    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------

    get columnConfigs() { return this._columnConfigs; }
    get rows() { return this._rows; }

    set data(val) {
        if (!kijs.isArray(val)) {
            val = [val];
        }
        this.rowsRemoveAll();
        this.rowsAdd(val);
    }
    get data() {
        let dataRows = [];
        kijs.Array.each(this._rows, function(row) {
            dataRows.push(row.dataRow);
        }, this);
        return dataRows;
    }

    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    columnConfigAdd(columnConfigs) {
        if (!kijs.isArray(columnConfigs)) {
            columnConfigs = [columnConfigs];
        }

        kijs.Array.each(columnConfigs, function(columnConfig) {
            let inst = this._getInstance(columnConfig, 'kijs.gui.grid.columnConfig.Text', kijs.gui.grid.columnConfig.ColumnConfig);
            inst.grid = this;
            this._columnConfigs.push(inst);
        }, this);
    }

    rowsAdd(rows) {
        if (!kijs.isArray(rows)) {
            rows = [rows];
        }

        kijs.Array.each(rows, function(row) {
            if (row instanceof kijs.gui.grid.Row) {
                row.parent = this;
                this._rows.push(row);
            } else {
                this._rows.push(new kijs.gui.grid.Row({
                    parent: this,
                    dataRow: row
                }));
            }
        }, this);
    }

    rowsRemove(rows) {
        if (!kijs.isArray(rows)) {
            rows = [rows];
        }

        kijs.Array.each(rows, function(delRow) {

            // Row-Objekt: Dieses entfernen
            if (delRow instanceof kijs.gui.grid.Row) {
                kijs.Array.remove(this._rows, delRow);
                delRow.destruct();

            } else {
                // DataRow-Objekt: Suchen und entfernen
                kijs.Array.each(this._rows, function(row) {
                    if (row.dataRow === delRow) {
                        this.rowsRemove([row]);
                    }
                }, this);
            }
        }, this);
    }

    rowsRemoveAll() {
        this.rowsRemove(this._rows);
    }

    // PROTECTED
    /**
     * Es kann eine Config oder eine Instanz übergeben werden. Wird eine config übergeben, wird eine instanz
     * erstellt. Wenn eine Instanz übergeben wird, wird deren typ geprüft.
     * @param {Object} configOrInstance
     * @param {String} defaultXType wird verwendet wenn in der config kein xtype definiert wurde.
     * @param {constructor} requiredClass
     * @returns {inst}
     */
    _getInstance(configOrInstance, defaultXType, requiredClass=null) {
        let inst = null;

        // Standard-Objekt übergeben: instanz von xType erstellen und config übergeben
        if (kijs.isObject(configOrInstance) && configOrInstance.constructor === window.Object) {
            configOrInstance.xtype = configOrInstance.xtype || defaultXType;
            let constructor = kijs.getObjectFromNamespace(configOrInstance.xtype);
            if (constructor === false) {
                throw new Error('invalid xtype ' + defaultXType);
            }
            delete configOrInstance.xtype;
            inst = new constructor(configOrInstance);


        } else if (kijs.isObject(configOrInstance)) {
            inst = configOrInstance;
        }

        if (requiredClass !== null) {
            if (!kijs.isObject(inst) || !(inst instanceof requiredClass)) {
                throw new Error('instance not from class ' + requiredClass.name);
            }
        }

        return inst;
    }

    _onTableScroll(e) {
        let scrollTop = e.dom.node.scrollTop;
        let scrollLeft = e.dom.node.scrollLeft;

        this._headerContainerDom.node.scrollLeft = scrollLeft;
        this._footerContainerDom.node.scrollLeft = scrollLeft;

        this._leftContainerDom.node.scrollTop = scrollTop;
        this._rightContainerDom.node.scrollTop = scrollTop;
    }

    // Overwrite
    render(superCall) {
        super.render(true);

        // Elemente in den haupt-dom
        this._topDom.renderTo(this._dom.node);
        this._middleDom.renderTo(this._dom.node);
        this._bottomDom.renderTo(this._dom.node);

        // header / filter
        this._headerLeftContainerDom.renderTo(this._topDom.node);
        this._headerContainerDom.renderTo(this._topDom.node);
        this._headerRightContainerDom.renderTo(this._topDom.node);

        // center (grid)
        this._leftContainerDom.renderTo(this._middleDom.node);
        this._tableContainerDom.renderTo(this._middleDom.node);
        this._rightContainerDom.renderTo(this._middleDom.node);

        // footer (summary)
        this._footerLeftContainerDom.renderTo(this._bottomDom.node);
        this._footerContainerDom.renderTo(this._bottomDom.node);
        this._footerRightContainerDom.renderTo(this._bottomDom.node);

        // header
        this._headerLeftDom.renderTo(this._headerLeftContainerDom.node);
        this._headerDom.renderTo(this._headerContainerDom.node);
        this._headerRightDom.renderTo(this._headerRightContainerDom.node);

        // center
        this._leftDom.renderTo(this._leftContainerDom.node);
        this._tableDom.renderTo(this._tableContainerDom.node);
        this._rightDom.renderTo(this._rightContainerDom.node);

        // bottom
        this._footerLeftDom.renderTo(this._footerLeftContainerDom.node);
        this._footerDom.renderTo(this._footerContainerDom.node);
        this._footerRightDom.renderTo(this._footerRightContainerDom.node);

        // header
        this._header.renderTo(this._headerDom.node);

        // rows
        kijs.Array.each(this._rows, function(row) {
            row.renderTo(this._tableDom.node);
        }, this);

        // header (todo)


        // Event afterRender auslösen
        if (!superCall) {
            this.raiseEvent('afterRender');
        }
    }

    // overwrite
    unrender(superCall) {
        // Event auslösen.
        if (!superCall) {
            this.raiseEvent('unrender');
        }

        super.unrender(true);
    }


    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(superCall) {
        if (!superCall) {
            // unrendern
            this.unrender(superCall);

            // Event auslösen.
            this.raiseEvent('destruct');
        }


        // Variablen (Objekte/Arrays) leeren


        // Basisklasse entladen
        super.destruct(true);
    }
};