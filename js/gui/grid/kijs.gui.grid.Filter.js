/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.grid.Filter
// --------------------------------------------------------------
/**
 * Filterzeile (tr) von kijs.gui.grid.Grid mit einem Filter (kijs.gui.grid.filter.Filter) pro Spalte.
 * Standardmässig ausgeblendet (über das Menü einer Kopfzelle einblendbar). Ändert ein Filter, wird das
 * Grid nach 50 ms neu geladen, sobald kein Filterfeld mehr den Fokus hat (bzw. sofort mit forceReload).
 */
kijs.gui.grid.Filter = class kijs_gui_grid_Filter extends kijs.gui.Element {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        // dom type
        this._dom.nodeTagName = 'tr';

        this._filters = [];
        this._filterReloadDeferId = null;

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            cls: 'kijs-grid-filter',
            visible: false
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
    /**
     * Filter in der aktuellen Reihenfolge
     * @type {kijs.gui.grid.filter.Filter[]}
     */
    get filters() {
        let filters = [];
        for (let i=0; i<this._filters.length; i++) {
            filters.push(this._filters[i].filter);
        }
        return filters;
    }

    /**
     * Grid der Filterzeile (parent)
     * @type {kijs.gui.grid.Grid}
     */
    get grid() { return this.parent; }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    /**
     * Gibt die Filter-Objekte der aktiven Filter zurück, welche auf dem Server angewendet werden.
     * @returns {Object[]}
     */
    getFilters() {
        let filters = [];

        kijs.Array.each(this.filters, function(filter) {
            if (filter.isFiltered) {
                filters.push(filter.filter);
            }
        }, this);

        return filters;
    }
    
    // Overwrite
    render(superCall) {
        super.render(true);

        // filters erstellen
        this._createFilters();

        // filters sortieren
        this._sortFilters();

        // filters rendern
        kijs.Array.each(this.filters, function(filter) {
            filter.renderTo(this._dom.node);
        }, this);

        // Event afterRender auslösen
        if (!superCall) {
            this.raiseEvent('afterRender');
        }
    }

    /**
     * Setzt alle Filter zurück.
     * @returns {undefined}
     */
    reset() {
        kijs.Array.each(this.filters, function(filter) {
            filter.reset();
        }, this);
    }
    
    // overwrite
    unrender(superCall) {
        // timer abbrechen
        if (this._filterReloadDeferId) {
            window.clearTimeout(this._filterReloadDeferId);
            this._filterReloadDeferId = null;
        }
        
        // Event auslösen.
        if (!superCall) {
            this.raiseEvent('unrender');
        }

        // filters unrendern
        kijs.Array.each(this.filters, function(filter) {
            filter.unrender();
        }, this);

        super.unrender(true);
    }


    // PROTECTED
    /**
     * Erstellt für jede Spalte ohne Filter einen neuen Filter (xtype aus filterConfig). Wirft einen
     * kijs.Error bei ungültigem xtype.
     * @returns {undefined}
     */
    _createFilters() {
        let newColumnConfigs = [];

        // Prüfen, ob für jede columnConfig einen Filter existiert.
        // Wenn nicht, in Array schreiben.
        kijs.Array.each(this.grid.columnConfigs, function(columnConfig) {
            let exist = false;
            for (let i=0; i<this._filters.length; i++) {
                if (this._filters[i].columnConfig === columnConfig) {
                    exist = true;
                    break;
                }
            }
            if (!exist) {
                newColumnConfigs.push(columnConfig);
            }
        }, this);

        // Falls Filter noch nicht vorhanden, neue Filter erstellen.
        kijs.Array.each(newColumnConfigs, function(columnConfig) {
            // Kopie, damit die filterConfig der Spalte unverändert bleibt
            let filterConfig = Object.assign({}, columnConfig.filterConfig);
            let constr = kijs.getObjectFromString(filterConfig.xtype);

            if (!constr) {
                throw new kijs.Error('invalid filter xtype for column ' + columnConfig.caption);
            }

            // change listener
            columnConfig.on('change', this.#onColumnConfigChange, this);

            filterConfig.parent = this;
            delete filterConfig.xtype;

            let filter = new constr(filterConfig);
            filter.on('filter', this.#onFilter, this);
            this._filters.push({columnConfig: columnConfig, filter: filter});
        }, this);
    }

    /**
     * Hat ein Filterfeld den Fokus?
     * @returns {Boolean}
     */
    _filterHasFocus() {
        let hasFocus = false;
        kijs.Array.each(this.filters, function(filter) {
            if (filter.hasFocus()) {
                hasFocus = true;
                return false;
            }
        }, this);
        return hasFocus;
    }
    
    /**
     * Sortiert die Filter nach der Position ihrer Spalte.
     * @returns {undefined}
     */
    _sortFilters() {
        this._filters.sort(function(a, b) {
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
            kijs.Array.each(this.filters, function(filter) {
                if (e.columnConfig === filter.columnConfig) {
                    filter.render();
                    return false;
                }
            }, this);

        }
        if ('newPosition' in e) {
            this.render();
        }
    }

    #onFilter(e) {
        let forceReload = !!e.forceReload;

        // Filter verzögert zurücksetzen, da der "Filter"
        // Event gleich mehrmals von mehreren Filtern kommen kann.
        if (this._filterReloadDeferId) {
            window.clearTimeout(this._filterReloadDeferId);
            this._filterReloadDeferId = null;
        }

        // Es wird nur neu gefiltert, wenn entweder force gewählt wurde oder kein Filterfeld den Focus hat.
        this._filterReloadDeferId = kijs.defer(function() {
            if (forceReload || !this._filterHasFocus()) {
                this.grid.reload();
            }
        }, 50, this);
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

        // pendenten reload-Timer abbrechen
        if (this._filterReloadDeferId) {
            window.clearTimeout(this._filterReloadDeferId);
            this._filterReloadDeferId = null;
        }

        // filters destructen
        kijs.Array.each(this.filters, function(filter) {
            filter.columnConfig.off('change', this.#onColumnConfigChange, this);
            filter.destruct();
        }, this);

        // Variablen (Objekte/Arrays) leeren
        this._filters = null;

        // Basisklasse entladen
        super.destruct(true);
    }
    
};
