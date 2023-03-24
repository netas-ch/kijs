/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.grid.filter.Checkbox
// --------------------------------------------------------------
kijs.gui.grid.filter.Checkbox = class kijs_gui_grid_filter_Checkbox extends kijs.gui.grid.filter.Filter {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        this._checkedType = '';
        this._searchContainer.clsAdd('kijs-icon');
        this._compare = null;

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
    get filter() {
        return Object.assign(super.filter, {
            type: 'checkbox',
            checkbox: this._compare
        });
    }

    get isFiltered() { return super.isFiltered || this._compare !== null; }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    reset() {
        this._compare = '';
        super.reset();
    }


    // PROTECTED
    _applyToGrid() {
        if (this._compare === 'checked') {
            this._searchContainer.html = String.fromCharCode(kijs.iconMap.Fa['square-check'].char);
        } else if (this._compare === 'unchecked') {
            this._searchContainer.html = String.fromCharCode(kijs.iconMap.Fa['square'].char);
        } else {
            this._searchContainer.html = '';
        }

        super._applyToGrid();
    }

    // overwrite
    _getMenuButtons() {
        return kijs.Array.concat(this._getDefaultMenuButtons(), ['-',{
            name: 'btn_compare_checked',
            caption : kijs.getText('Alle angewählten'),
            iconMap: 'kijs.iconMap.Fa.square-check', //  fa-square-o
            on: {
                click: this.#onFilterChange,
                context: this
            }
        },{
            caption : kijs.getText('Alle nicht angewählten'),
            name: 'btn_compare_unchecked',
            iconMap: 'kijs.iconMap.Fa.square-check', // fa-square-o
            on: {
                click: this.#onFilterChange,
                context: this
            }
        }]);
    }


    // PRIVATE
    // LISTENERS
    #onFilterChange(e) {
        if (e.element.name === 'btn_compare_checked') {
            this._compare = 'checked';
        } else if (e.element.name === 'btn_compare_unchecked') {
            this._compare = 'unchecked';
        }

        kijs.Array.each(e.element.parent.elements, function(element) {
            if (element.name === e.element.name) {
                element.iconMap = 'kijs.iconMap.Fa.square-check';
            } else if (kijs.Array.contains(['btn_compare_checked', 'btn_compare_unchecked'], element.name)) {
                element.iconMap = 'kijs.iconMap.Fa.square';
            }
        });

        this._applyToGrid();
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
        
        // Variablen (Objekte/Arrays) leeren
        
        // Basisklasse entladen
        super.destruct(true);
    }
    
};