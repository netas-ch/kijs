/* global kijs */

// --------------------------------------------------------------
// kijs.gui.grid.filter.Checkbox
// --------------------------------------------------------------
/**
 * EVENTS
 * ----------
 *
 */
kijs.gui.grid.filter.Checkbox = class kijs_gui_grid_filter_Checkbox extends kijs.gui.grid.filter.Filter {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
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

    get isFiltered() { return this._compare !== null; }

    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------

    reset() {
        this._compare = '';
        super.reset();
    }

    _applyToGrid() {
        if (this._compare === 'checked') {
            this._searchContainer.html = String.fromCharCode(0xf046);
        } else if (this._compare === 'unchecked') {
            this._searchContainer.html = String.fromCharCode(0xf096);
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
            iconChar: '&#xf096', //  fa-square-o
            on: {
                click: this._onFilterChange,
                context: this
            }
        },{
            caption : kijs.getText('Alle nicht angewählten'),
            name: 'btn_compare_unchecked',
            iconChar: '&#xf096', // fa-square-o
            on: {
                click: this._onFilterChange,
                context: this
            }
        }]);
    }

    _onFilterChange(e) {
        if (e.element.name === 'btn_compare_checked') {
            this._compare = 'checked';
        } else if (e.element.name === 'btn_compare_unchecked') {
            this._compare = 'unchecked';
        }

        kijs.Array.each(e.element.parent.elements, function(element) {
            if (element.name === e.element.name) {
                element.iconChar = '&#xf046';
            } else if (kijs.Array.contains(['btn_compare_checked', 'btn_compare_unchecked'], element.name)) {
                element.iconChar = '&#xf096';
            }
        });

        this._applyToGrid();
    }
};