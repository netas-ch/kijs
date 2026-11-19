/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.grid.Row
// --------------------------------------------------------------
/**
 * Zeile (tr) von kijs.gui.grid.Grid mit einer Zelle pro Spalte (columnConfigs des Grids). Die Zellen
 * werden beim Rendern erstellt und nach der Position der Spalten sortiert.
 *
 * @fires change  Wird von einer Zelle ausgelöst, wenn sich ihr Wert ändert. e: value, valueDisplay, cell
 */
kijs.gui.grid.Row = class kijs_gui_grid_Row extends kijs.gui.Element {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
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
            dataRow: true     // {Object} Datensatz der Zeile
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
     * Zellen der Zeile in der aktuellen Reihenfolge
     * @type {kijs.gui.grid.cell.Cell[]}
     */
    get cells() {
        let cells = [];
        for (let i=0; i<this._cells.length; i++) {
            cells.push(this._cells[i].cell);
        }
        return cells;
    }

    /**
     * Ist die Zeile die aktuelle (CSS-Klasse kijs-current)?
     * @type {Boolean}
     */
    get current() { return !!this._dom.clsHas('kijs-current'); }
    set current(val) {
        if (val) {
            this._dom.clsAdd('kijs-current');
        } else {
            this._dom.clsRemove('kijs-current');
        }
    }

    /**
     * Datensatz der Zeile (siehe auch updateDataRow())
     * @type {Object|null}
     */
    get dataRow() { return this._dataRow; }
    set dataRow(val) { this._dataRow = val; }

    /**
     * Grid der Zeile (parent)
     * @type {kijs.gui.grid.Grid}
     */
    get grid() { return this.parent; }
    
    /**
     * Hat die Zeile einen geraden Index (0, 2, 4 …)?
     * @type {Boolean}
     */
    get impair() {
        return this.rowIndex % 2 === 0;
    }

    /**
     * Wurde eine Zelle der Zeile geändert?
     * @type {Boolean}
     */
    get isDirty() {
        let isDirty = false;
        kijs.Array.each(this._cells, function(cell) {
            if (cell.cell && cell.cell.isDirty) {
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

    /**
     * Index der Zeile in den rows des Grids
     * @type {Number}
     */
    get rowIndex() {
        return this.grid.rows.indexOf(this);
    }

    /**
     * Ist die Zeile selektiert (CSS-Klasse kijs-selected)?
     * @type {Boolean}
     */
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
     * Setzt alle 'dirty' records zurück.
     * @returns {undefined}
     */
    commit() {
        kijs.Array.each(this._cells, function(cell) {
            if (cell.cell) {
                cell.cell.isDirty = false;
            }
        }, this);
    }

    /**
     * Sucht eine Cell anhand der Cell-Config
     * @param {Object} config
     * @returns {kijs.gui.grid.cell.Cell|null} die Cell oder null, wenn nicht gefunden.
     */
    getCellByConfig(config) {
        let cell = null;

        for (let i = 0; i < this._cells.length; i++) {
            if (this._cells[i].columnConfig === config) {
                if (this._cells[i].cell) {
                    cell = this._cells[i].cell;
                }
                break;
            }
        }

        return cell;
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
    
    /**
     * Aktualisiert die DataRow. Falls an der Row etwas geändert hat,
     * wird die Zeile aktualisiert.
     *
     * @param {Object} newDataRow
     * @returns {undefined}
     */
    updateDataRow(newDataRow) {
        let cell = null;

        // Wenn bereits gerendert, vergleichen und falls geändert neu rendern
        if (this.isRendered) {
            kijs.Array.each(this.grid.columnConfigs, function(columnConfig) {
                if (newDataRow[columnConfig.displayField] !== this.dataRow[columnConfig.displayField]) {
                    cell = this.getCellByConfig(columnConfig);
                    if (cell) {
                        cell.setValue(newDataRow[columnConfig.displayField], true, false, false);
                    }
                }
            }, this);
        }

        // aktualisieren
        this.dataRow = newDataRow;
    }


    // PROTECTED
    /**
     * Erstellt für jede Spalte ohne Zelle eine neue Zelle (xtype aus cellConfig) und lädt ihren Wert aus
     * der dataRow. Wirft einen kijs.Error bei ungültigem xtype.
     * @returns {undefined}
     */
    _createCells() {
        let newColumnConfigs = [];

        // Prüfen, ob für jede columnConfig eine cell existiert.
        // Wenn nicht, in Array schreiben.
        kijs.Array.each(this.grid.columnConfigs, function(columnConfig) {
            if (!this.getCellByConfig(columnConfig)) {
                newColumnConfigs.push(columnConfig);
            }
        }, this);

        // Falls cell noch nicht vorhanden, neue cell erstellen.
        kijs.Array.each(newColumnConfigs, function(columnConfig) {
            let cellConfig = columnConfig.cellConfig;
            let constr = kijs.getObjectFromString(cellConfig.xtype);

            if (!constr) {
                throw new kijs.Error('invalid cell xtype for column ' + columnConfig.caption);
            }

            // change listener
            columnConfig.on('change', this.#onColumnConfigChange, this);

            cellConfig.parent = this;
            delete cellConfig.xtype;

            let cell = new constr(cellConfig);
            cell.loadFromDataRow();

            this._cells.push({columnConfig: columnConfig, cell: cell});
        }, this);
    }

    /**
     * Sortiert die Zellen nach der Position ihrer Spalte.
     * @returns {undefined}
     */
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


    // PRIVATE
    // LISTENERS
    #onColumnConfigChange(e) {
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

    

    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    destruct(superCall) {
        if (!superCall) {
            // unrendern
            this.unrender(superCall);

            // Event auslösen.
            this.raiseEvent('destruct');
        }

        // cells destructen
        kijs.Array.each(this.cells, function(cell) {
            cell.columnConfig.off('change', this.#onColumnConfigChange, this);
            cell.destruct();
        }, this);

        // Variablen (Objekte/Arrays) leeren
        this._cells = null;
        this._dataRow = null;

        // Basisklasse entladen
        super.destruct(true);
    }
    
};
