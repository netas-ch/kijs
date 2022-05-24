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

        this._checkboxFilterGroup = null;

        this._searchContainer = new kijs.gui.Dom();
        this._removeFilterIcon = new kijs.gui.Dom({
            cls: 'kijs-grid-filter-reset'
        });

        this._menuButton = new kijs.gui.Button({
            parent: this,
            icon2Map: 'kijs.iconMap.Fa.filter', // fa-filter
            menuElements: []
        });


        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            columnConfig: true,
            checkboxFilterValues: { target: 'checkboxFilterValues' }
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
    get filter() {
        let flt = {
            type: '',
            valueField: this._columnConfig.valueField
        };
        if (this._checkboxFilterGroup) {
            flt.checkboxFilter = this.checkboxFilterValues;
        }
        return flt;
    }
    get isFiltered() { return !!(this.checkboxFilterValues.length > 0); }

    get checkboxFilterValues() { return this._checkboxFilterGroup ? this._checkboxFilterGroup.value : []; }
    set checkboxFilterValues(val) {

        // convert data to array
        if (!kijs.isArray(val)) {
            val = [val];
        }
        let data = [];
        kijs.Array.each(val, (arrVal) => {
            if (kijs.isString(arrVal)) {
                data.push({caption: arrVal, value: arrVal});
            } else if (kijs.isObject(arrVal) && kijs.isDefined(arrVal.caption) && kijs.isDefined(arrVal.value)) {
                data.push(arrVal);
            }
        });

        // checkboxgruppe
        if (this._checkboxFilterGroup === null) {
            this._checkboxFilterGroup = new kijs.gui.field.CheckboxGroup({
                cls: 'kijs-filter-checkboxgroup',
                on: {
                    change: this._applyToGrid,
                    context: this
                }
            });
        }

        // Daten hinzufügen
        this._checkboxFilterGroup.data = data;
    }


    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------

    reset() {
        // Filter zurücksetzen
        if (this._checkboxFilterGroup !== null) {
            this._checkboxFilterGroup.checkedAll = false;
        }

        // muss in abgeleiteter Klasse überschrieben werden

        this._applyToGrid();
    }

    // wendet den Filter auf das grid an.
    _applyToGrid() {
        this.raiseEvent('filter', this.filter);
    }

    _getCheckboxMenuButtons() {
        return this._checkboxFilterGroup !== null ? ['-', this._checkboxFilterGroup] : [];
    }

    _getDefaultMenuButtons() {
        return [{
            caption : kijs.getText('Filter löschen'),
            iconMap: 'kijs.iconMap.Fa.filter-circle-xmark',
            on: {
                click: function() {
                    this.reset();
                    this._menuButton.menu.close();
                },
                context: this
            }
        },{
            caption : kijs.getText('Alle Filter löschen'),
            iconMap: 'kijs.iconMap.Fa.filter-circle-xmark',
            on: {
                click: function() {
                    this.parent.reset();
                    this._menuButton.menu.close();
                },
                context: this
            }
        }];
    }

    _getMenuButtons() {
        return kijs.Array.concat(this._getDefaultMenuButtons(), this._getCheckboxMenuButtons());
    }



    // Overwrite
    render(superCall) {
        super.render(true);

        this._searchContainer.renderTo(this._dom.node);
        this._removeFilterIcon.renderTo(this._dom.node);

        this._menuButton.menu.removeAll();
        this._menuButton.menu.add(this._getMenuButtons());
        this._menuButton.renderTo(this._removeFilterIcon.node);

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
