/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.grid.filter.Filter (Abstract)
// --------------------------------------------------------------
/**
 * Abstrakte Basisklasse für einen Filter (td) in der Filterzeile (kijs.gui.grid.Filter) von
 * kijs.gui.grid.Grid. Hat ein Menü zum Löschen des Filters bzw. aller Filter und optional eine
 * Auswahl fester Werte (checkboxFilterValues). Das Filter-Objekt (filter) wird an den Server gesendet.
 *
 * @fires filter  Wenn der Filter geändert hat. e: filter, forceReload (sofort neu laden?)
 */
kijs.gui.grid.filter.Filter = class kijs_gui_grid_filter_Filter extends kijs.gui.Element {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
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
            columnConfig: true,     // {kijs.gui.grid.columnConfig.ColumnConfig} Spalte des Filters
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
    /**
     * Feste Werte zur Auswahl im Menü (CheckboxGroup). Der Setter akzeptiert Strings oder Objekte
     * {displayText, value} (auch einzeln), der Getter gibt die ausgewählten Werte zurück.
     * @type {Array}
     */
    get checkboxFilterValues() {
        if (kijs.isEmpty(this._checkboxFilterGroup)) {
            return [];
        } else {
            let val = this._checkboxFilterGroup.value;
            return kijs.isEmpty(val) ? [] : val;
        }
    }
    set checkboxFilterValues(val) {
        // convert data to array
        if (!kijs.isArray(val)) {
            val = [val];
        }
        let data = [];
        kijs.Array.each(val, (arrVal) => {
            if (kijs.isString(arrVal)) {
                data.push({displayText: arrVal, value: arrVal});
            } else if (kijs.isObject(arrVal) && kijs.isDefined(arrVal.displayText) && kijs.isDefined(arrVal.value)) {
                data.push(arrVal);
            }
        });

        // checkboxgruppe
        if (this._checkboxFilterGroup === null) {
            this._checkboxFilterGroup = new kijs.gui.field.CheckboxGroup({
                cls: 'kijs-filter-checkboxgroup',
                disableFlex: false,
                on: {
                    change: this._applyToGrid,
                    context: this
                }
            });
        }

        // Daten hinzufügen
        this._checkboxFilterGroup.data = data;
    }
    
    /**
     * Spalte des Filters
     * @type {kijs.gui.grid.columnConfig.ColumnConfig}
     */
    get columnConfig() { return this._columnConfig; }
    
    /**
     * Filter-Objekt für den Server: {type, valueField} und mit checkboxFilterValues zusätzlich checkboxFilter
     * @type {Object}
     */
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
    
    /**
     * Ist der Filter aktiv?
     * @type {Boolean}
     */
    get isFiltered() { return !!(this.checkboxFilterValues.length > 0); }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    /**
     * Hat der Filter den Fokus (Menü offen)?
     * @returns {Boolean}
     */
    hasFocus() {
        return !!this._menuButton.menu.isRendered;
    }
    
    // Overwrite
    render(superCall) {
        super.render(true);

        this._searchContainer.renderTo(this._dom.node);
        this._removeFilterIcon.renderTo(this._dom.node);

        this._menuButton.menu.removeAll({
            preventRender: true,
            preventDestruct: true
        });
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

    /**
     * Setzt den Filter zurück und löst filter aus.
     * @returns {undefined}
     */
    reset() {
        // Filter zurücksetzen
        if (this._checkboxFilterGroup !== null) {
            this._checkboxFilterGroup.checkedAll = false;
        }

        // muss in abgeleiteter Klasse überschrieben werden
        this._applyToGrid();
    }

    // overwrite
    unrender(superCall) {
        // Event auslösen.
        if (!superCall) {
            this.raiseEvent('unrender');
        }

        this._menuButton.unrender();
        if (this._checkboxFilterGroup) {
            this._checkboxFilterGroup.unrender();
        }
        this._searchContainer.unrender();
        this._removeFilterIcon.unrender();

        super.unrender(true);
    }
    
    
    // PROTECTED
    /**
     * Löst filter aus, damit die Filterzeile das Grid neu lädt.
     * @param {Boolean} [forceReload=false]  Sofort neu laden, auch wenn ein Filterfeld den Fokus hat?
     * @returns {undefined}
     */
    _applyToGrid(forceReload=false) {
        this.raiseEvent('filter', {filter: this.filter, forceReload: forceReload});
    }

    /**
     * Gibt die Menü-Elemente der Auswahl fester Werte zurück (Trennlinie und CheckboxGroup)
     * @returns {Array}  Leer ohne checkboxFilterValues
     */
    _getCheckboxMenuButtons() {
        return this._checkboxFilterGroup !== null ? ['-', this._checkboxFilterGroup] : [];
    }

    /**
     * Gibt die Menü-Buttons «Filter löschen» und «Alle Filter löschen» zurück
     * @returns {Object[]}
     */
    _getDefaultMenuButtons() {
        return [
            {
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
            }
        ];
    }

    /**
     * Gibt alle Menü-Elemente des Filters zurück
     * @returns {Array}
     */
    _getMenuButtons() {
        return kijs.Array.concat(this._getDefaultMenuButtons(), this._getCheckboxMenuButtons());
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
        
        // Elemente/DOM-Objekte entladen
        // Die CheckboxGroup wird mit dem Menü entladen, falls sie darin ist (nach dem Rendern)
        const groupInMenu = !!(this._checkboxFilterGroup && this._checkboxFilterGroup.parent);
        this._menuButton.destruct();
        if (this._checkboxFilterGroup && !groupInMenu) {
            this._checkboxFilterGroup.destruct();
        }
        this._searchContainer.destruct();
        this._removeFilterIcon.destruct();

        // Variablen (Objekte/Arrays) leeren
        this._menuButton = null;
        this._checkboxFilterGroup = null;
        this._searchContainer = null;
        this._removeFilterIcon = null;

        // Basisklasse entladen
        super.destruct(true);
    }
    
};
