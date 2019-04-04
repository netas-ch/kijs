/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.grid.Header
// --------------------------------------------------------------
/**
 * EVENTS
 * ----------
 *
 */
kijs.gui.grid.Header = class kijs_gui_grid_Header extends kijs.gui.Element {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        // dom type
        this._dom.nodeTagName = 'tr';

        this._cells = [];

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
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

    get grid() { return this.parent; }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------

    _createCells() {
        let newColumnConfigs = [];

        // Prüfen, ob für jede columnConfig eine headerCell existiert.
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
            let cell = new kijs.gui.grid.HeaderCell({
                parent: this,
                columnConfig: columnConfig
            });

            // change listener
            columnConfig.on('change', this._onColumnConfigChange, this);

            cell.loadFromColumnConfig();

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

    _onColumnConfigChange(e) {
        if ('visible' in e || 'width' in e || 'caption' in e || 'resizable' in e || 'sortable' in e) {
            kijs.Array.each(this.cells, function(cell) {
                if (e.columnConfig === cell.columnConfig) {
                    if (e.caption) {
                        cell.caption = e.caption;
                    } else {
                        cell.render();
                    }
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
            cell.destruct();
        }, this);

        // Variablen (Objekte/Arrays) leeren
        this._cells = null;
        this._dataRow = null;

        // Basisklasse entladen
        super.destruct(true);
    }
};