/* global kijs, this */

// --------------------------------------------------------------
// kijs.Fi.grid.Filter
// --------------------------------------------------------------
/**
 * EVENTS
 * ----------
 *
 */
kijs.gui.grid.Filter = class kijs_gui_grid_Filter extends kijs.gui.Element {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        // dom type
        this._dom.nodeTagName = 'tr';

        this._filters = [];
        this._filterReloadDefer = null;

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

    get filters() {
        let filters = [];
        for (let i=0; i<this._filters.length; i++) {
            filters.push(this._filters[i].filter);
        }
        return filters;
    }

    get grid() { return this.parent; }

    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------

    /**
     * Gibt die Filter-Objekte als Array  zurück, welche auf dem Server angewendet werden.
     * @returns {undefined}
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

    /**
     * Setzt alle Filter zurück.
     * @returns {undefined}
     */
    reset() {
        kijs.Array.each(this.filters, function(filter) {
            filter.reset();
        }, this);
    }

    // PROTECTED
    _createFilters() {
        let newColumnConfigs = [];

        // Prüfen, ob für jede columnConfig eine filter existiert.
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

        // Falls filter noch nicht vorhanden, neue filter erstellen.
        kijs.Array.each(newColumnConfigs, function(columnConfig) {
            let filterConfig = columnConfig.filterConfig;
            let constr = kijs.getObjectFromNamespace(filterConfig.xtype);

            if (!constr) {
                throw new kijs.Error('invalid filter xtype for column ' + columnConfig.caption);
            }

            // change listener
            columnConfig.on('change', this._onColumnConfigChange, this);

            filterConfig.parent = this;
            delete filterConfig.xtype;

            let filter = new constr(filterConfig);
            filter.on('filter', this._onFilter, this);
            this._filters.push({columnConfig: columnConfig, filter: filter});
        }, this);
    }

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

    // EVENTS
    _onColumnConfigChange(e) {
        if ('visible' in e || 'width' in e) {
            kijs.Array.each(this.filters, function(filter) {
                if (e.columnConfig === filter.columnConfig) {
                    filter.render();
                    return false;
                }
            }, this);

        }
        if ('position' in e) {
            this.render();
        }
    }

    _onFilter(e) {
        // Filter verzögert zurücksetzen, da der "filter"
        // event gleich mehrmals von mehreren Filter kommen kann.
        if (this._filterReloadDefer) {
            window.clearTimeout(this._filterReloadDefer);
            this._filterReloadDefer = null;
        }

        this._filterReloadDefer = kijs.defer(function() {
            this.grid.reload();
        }, 20, this);
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

    // overwrite
    unrender(superCall) {
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

        // filters destructen
        kijs.Array.each(this.filters, function(filter) {
            filter.columnConfig.off('change', this._onColumnConfigChange, this);
            filter.destruct();
        }, this);

        // Variablen (Objekte/Arrays) leeren
        this._filters = null;
        this._dataRow = null;

        // Basisklasse entladen
        super.destruct(true);
    }
};