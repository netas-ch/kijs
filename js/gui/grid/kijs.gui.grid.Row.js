/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.grid.Row
// --------------------------------------------------------------
/**
 * EVENTS
 * ----------
 *
 */
kijs.gui.grid.Row = class kijs_gui_grid_Row extends kijs.gui.Element {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        // dom type
        this._dom.nodeTagName = 'tr';
        
        this._dataRow = null;
        this._cells = [];

        // Standard-config-Eigenschaften mergen
        config = Object.assign({}, {
            // keine
        }, config);

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            dataRow: true
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            this.applyConfig(config, true);
        }
    }

    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------

    get cells() {
        let cells = [];
        for (let i=0; i<this._cells.length; i++) {
            cells.push(this._cells[i].cell);
        }
        return cells;
    }
    get dataRow() { return this._dataRow; }
    set dataRow(val) { this._dataRow = val; }
    
    get grid() { return this.parent; }

    get isDirty() {
        let isDirty = false;
        kijs.Array.each(this._cells, function(cell) {
            if (cell.isDirty) {
                isDirty = true;
                return false;
            }
        }, this);
        return isDirty;
    }

    get rowIndex() {
        return this.grid.rows.indexOf(this);
    }

    get impair() {
        return this.rowIndex % 2 === 0;
    }

    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------

    _createCells() {
        let newColumnConfigs = [];
        
        // Prüfen, ob für jede columnConfig eine cell existiert.
        // Wenn nicht, in Array schreiben.
        kijs.Array.each(this.grid.columnConfigs, function(columnConfig) {
            let exist = false;
            for (let i=0; i<this._cells.length; i++) {
                if (this._cells[i].columnConfig === columnConfig) {
                    exist = true;
                    break;
                }
            }
            if (!exist) {
                newColumnConfigs.push(columnConfig);
            }
        }, this);

        // Falls cell noch nicht vorhanden, neue cell erstellen.
        kijs.Array.each(newColumnConfigs, function(columnConfig) {
            let cellConfig = columnConfig.cellConfig;
            let constr = kijs.getObjectFromNamespace(cellConfig.xtype);

            if (!constr) {
                throw new Error('invalid cell xtype for column ' + columnConfig.caption);
            }

            cellConfig.parent = this;
            delete cellConfig.xtype;

            let cell = new constr(cellConfig);
            cell.loadFromDataRow();

            this._cells.push({columnConfig: columnConfig, cell: cell});
        }, this);
    }

    _sortCells() {
        this._cells.sort(function(a, b) {
            if (a.columnConfig.position < b.columnConfig.position) {
                return -1;
            }
            if (a.columnConfig.position > b.columnConfig.position) {
                return 1;
            }
            return 0;
        });
    }

    // Overwrite
    render(superCall) {
        super.render(true);

        // cells erstellen
        this._createCells();

        // cells sortieren
        this._sortCells();

        // cells rendern
        kijs.Array.each(this.cells, function(cell) {
            cell.renderTo(this._dom.node);
        }, this);

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

        // cells unrendern
        kijs.Array.each(this.cells, function(cell) {
            cell.unrender();
        }, this);

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

        // cells destructen
        kijs.Array.each(this.cells, function(cell) {
            cell.destruct();
        }, this);

        // Variablen (Objekte/Arrays) leeren
        this._cells = null;
        this._dataRow = null;

        // Basisklasse entladen
        super.destruct(true);
    }
};