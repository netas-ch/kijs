/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.grid.filter.Filter (Abstract)
// --------------------------------------------------------------
/**
 * EVENTS
 * ----------
 *
 */
kijs.gui.grid.filter.Filter = class kijs_gui_grid_filter_Filter extends kijs.gui.Element {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        // DOM type
        this._dom.nodeTagName = 'td';
        this._columnConfig;
        this._filter = {};

        this._searchContainer = new kijs.gui.Dom({html: '&nbsp;'});
        this._removeFilterIcon = new kijs.gui.Dom({
            cls: 'kijs-grid-filter-reset',
            htmlDisplayType: 'code',
            html: String.fromCharCode(0xf00d), // fa-times
            on: {
                click: function() { this.reset(); },
                context: this
            }
        });


        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {

        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            columnConfig: true
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

    get columnConfig() { return this._columnConfig; }
    get filter() { return this._filter; }


    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------

    reset() {
        // Filter zurücksetzen
    }


    // Overwrite
    render(superCall) {
        super.render(true);

        this._searchContainer.renderTo(this._dom.node);
        this._removeFilterIcon.renderTo(this._dom.node);

        // breite
        this._dom.width = this._columnConfig.width;

        // sichtbar?
        this.visible = this._columnConfig.visible;

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

        this._searchContainer.unrender();
        this._removeFilterIcon.unrender();

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

        this._searchContainer.destruct();
        this._removeFilterIcon.destruct();

        // Variablen (Objekte/Arrays) leeren
        this._searchContainer = null;
        this._removeFilterIcon = null;

        // Basisklasse entladen
        super.destruct(true);
    }
};