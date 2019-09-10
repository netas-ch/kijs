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
        Object.assign(this._defaultConfig, {
            // keine
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            dataRow: true
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

    get cells() {
        let cells = [];
        for (let i=0; i<this._cells.length; i++) {
            cells.push(this._cells[i].cell);
        }
        return cells;
    }

    get current() { return !!this._dom.clsHas('kijs-current'); }
    set current(val) {
        if (val) {
            this._dom.clsAdd('kijs-current');
        } else {
            this._dom.clsRemove('kijs-current');
        }
    }

    get grid() { return this.parent; }

    get dataRow() { return this._dataRow; }
    set dataRow(val) { this._dataRow = val; }

    get impair() {
        return this.rowIndex % 2 === 0;
    }

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

    get next() {
        let i = this.rowIndex + 1;
        if (i > this.grid.rows.length -1) {
            return null;
        }
        return this.grid.rows[i];
    }

    get previous() {
        let i = this.rowIndex - 1;
        if (i < 0) {
            return null;
        }
        return this.grid.rows[i];
    }

    get rowIndex() {
        return this.grid.rows.indexOf(this);
    }

    get selected() { return !!this._dom.clsHas('kijs-selected'); }
    set selected(val) {
        if (val) {
            this._dom.clsAdd('kijs-selected');
        } else {
            this._dom.clsRemove('kijs-selected');
        }
    }
    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------

    /**
     * Aktualisiert die DataRow. Falls an der Row etwas geändert hat,
     * wird die Zeile neu gerendert.
     * @param {Object} newDataRow
     * @returns {undefined}
     */
    updateDataRow(newDataRow) {
        let isChanged = false;

        // Wenn bereits gerendert, vergleichen und falls geändert neu rendern
        if (this.isRendered) {
            kijs.Array.each(this.grid.columnConfigs, function(columnConfig) {
                if (newDataRow[columnConfig.valueField] !== this.dataRow[columnConfig.valueField]) {
                    isChanged = true;
                    return false;
                }
            }, this);
        }

        // aktualisieren
        this.dataRow = newDataRow;

        // rendern
        if (isChanged) {
            this.render();
        }
    }

    // PROTECTED
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
                throw new kijs.Error('invalid cell xtype for column ' + columnConfig.caption);
            }

            // change listener
            columnConfig.on('change', this._onColumnConfigChange, this);

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

    // EVENTS
    _onColumnConfigChange(e) {
        if ('visible' in e || 'width' in e) {
            kijs.Array.each(this.cells, function(cell) {
                if (e.columnConfig === cell.columnConfig) {
                    cell.render();
                    return false;
                }
            }, this);

        }
        if ('position' in e) {
            this.render();
        }
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
            cell.columnConfig.off('change', this._onColumnConfigChange, this);
            cell.destruct();
        }, this);

        // Variablen (Objekte/Arrays) leeren
        this._cells = null;
        this._dataRow = null;

        // Basisklasse entladen
        super.destruct(true);
    }
};