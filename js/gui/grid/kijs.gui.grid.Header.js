/* global kijs, this */

// TODO: Damit Drag&Drop funktioniert, muss diese Klasse von kijs.gui.Container
// erben!


// --------------------------------------------------------------
// kijs.gui.grid.Header
// --------------------------------------------------------------
kijs.gui.grid.Header = class kijs_gui_grid_Header extends kijs.gui.Element {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);
        
        // dom type
        this._dom.nodeTagName = 'tr';
        
        this._cells = [];
        
        /*this._ddName = kijs.uniqId('kijs.gui.grid.HeaderCell');
        
        this.ddTarget = {
            ddMarkerTagName: 'td',
            posBeforeFactor: 0.666,
            posAfterFactor: 0.666,
            mapping: {
                [this._ddName]:{
                    allowMove: true,
                    allowCopy: false,
                    allowLink: false,
                    disableMarkerAutoSize: false
                }
            },
            on: {
                drop: this.#onDrop,
                context: this
            }
        };*/
        
        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            cls: 'kijs-grid-header'
        });
        
        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            // keine
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
    
    /*get ddTarget() { 
        return this._ddTarget; 
    }
    set ddTarget(val) {
        // config-object
        if (kijs.isObject(val)) {
            if (kijs.isEmpty(this._ddTarget)) {
                val.ownerEl = this;
                if (kijs.isEmpty(val.ownerDomProperty)) {
                    val.ownerDomProperty = 'dom';
                }
                this._ddTarget = new kijs.gui.dragDrop.Target(val);
            } else {
                this._ddTarget.applyConfig(val);
            }

        // null
        } else if (val === null) {
            if (this._ddTarget) {
                this._ddTarget.destruct();
            }
            this._ddTarget = null;

        } else {
            throw new kijs.Error(`ddTarget must be a object or null`);

        }
    }*/

    get grid() { return this.parent; }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    clear() {
        // cells entfernen
        kijs.Array.each(this._cells, function(cell) {
            cell.cell.destruct();
        }, this);
        kijs.Array.clear(this._cells);
    }

    // overwrite
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

    /**
     * Setzt bei allen columns das richtige Sort-Icon
     * @param {Array|Object} sort
     * @returns {undefined}
     */
    setSortIcons(sort) {
        if (kijs.isObject(sort) && sort.field && sort.direction) {
            sort = [sort];
        }

        if (!kijs.isArray(sort)) {
            return;
        }

        let sortedCells = [];
        kijs.Array.each(this._cells, function(headerCell) {
            kijs.Array.each(sort, function(srt) {
                if (srt.field === headerCell.cell.columnConfig.displayField) {
                    headerCell.cell.sort = srt.direction;
                    sortedCells.push(headerCell.cell);
                }
            }, this);
        }, this);

        // icon von header, welche nicht sortiert wurden, entfernen
        kijs.Array.each(this._cells, function(headerCell) {
            if (!kijs.Array.contains(sortedCells, headerCell.cell)) {
                headerCell.cell.sort = '';
            }
        });

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


    // PROTECTED
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
                columnConfig: columnConfig/*,
                ddSource:{
                    name: this._ddName,
                    allowMove: true,
                    allowCopy: false,
                    allowLink: false,
                    ownerDomProperty: 'dom'
                }*/
            });

            // change listener
            columnConfig.on('change', this.#onColumnConfigChange, this);

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


    // PRIVATE
    // LISTENERS
    #onColumnConfigChange(e) {
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

    // TODO !!!!!
    /*#onDrop(e) {
        console.log('drop');
        //let tIndex = this.header.cells.indexOf(e.targetElement);
        //let sIndex = this.header.cells.indexOf(e.sourceElement);
        //let pos = e.position.position;

        //if (!this._splitterMove && tIndex !== -1 && sIndex !== -1 && tIndex !== sIndex && (pos === 'left' || pos === 'right')) {
        //    if (pos === 'right') {
        //        tIndex += 1;
        //    }
        //    this.header.grid.columnConfigs[sIndex].position = tIndex;
        //}
    }*/
    
    

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
        
        // Elemente/DOM-Objekte entladen
        if (this._ddTarget) {
            this._ddTarget.destruct();
        }
        
        // cells destructen
        kijs.Array.each(this.cells, function(cell) {
            cell.destruct();
        }, this);

        // Variablen (Objekte/Arrays) leeren
        this._cells = null;
        //this._ddTarget = null;

        // Basisklasse entladen
        super.destruct(true);
    }
    
};
