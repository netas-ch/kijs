/* global kijs */

// --------------------------------------------------------------
// kijs.gui.grid.filter.Number
// --------------------------------------------------------------
/**
 * EVENTS
 * ----------
 *
 */
kijs.gui.grid.filter.Number = class kijs_gui_grid_filter_Number extends kijs.gui.grid.filter.Text {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        this._compare = 'equal';

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            placeholder: kijs.getText('Filtern...')
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
            type: 'number',
            search: this._searchField.value,
            compare: this._compare
        });
    }

    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------

    // overwrite
    _getMenuButtons() {
        return kijs.Array.concat(this._getDefaultMenuButtons(), ['-',{
            name: 'btn_compare_equal',
            caption : kijs.getText('Gleich'),
            iconChar: '&#xf046', //  fa-check-square-o
            on: {
                click: this._onCompareBtnClick,
                context: this
            }
        },{
            name: 'btn_compare_unequal',
            caption : kijs.getText('Ungleich'),
            iconChar: '&#xf096', // fa-square-o
            on: {
                click: this._onCompareBtnClick,
                context: this
            },
        },{
            caption : kijs.getText('Kleiner als'),
            name: 'btn_compare_smaller',
            iconChar: '&#xf096', // fa-square-o
            on: {
                click: this._onCompareBtnClick,
                context: this
            }
        },{
            caption : kijs.getText('Grösser als'),
            name: 'btn_compare_bigger',
            iconChar: '&#xf096', // fa-square-o
            on: {
                click: this._onCompareBtnClick,
                context: this
            }
        }]);
    }

    _onCompareBtnClick(e) {
        this._menuButton.menuCloseAll();

        if (e.element.name === 'btn_compare_equal') {
            this._compare = 'equal';
        } else if (e.element.name === 'btn_compare_unequal') {
            this._compare = 'unequal';
        } else if (e.element.name === 'btn_compare_smaller') {
            this._compare = 'smaller';
        } else if (e.element.name === 'btn_compare_bigger') {
            this._compare = 'bigger';
        }

        kijs.Array.each(e.element.parent.elements, function(element) {
            if (element.name === e.element.name) {
                element.iconChar = '&#xf046';
            } else if (kijs.Array.contains(['btn_compare_equal', 'btn_compare_unequal', 'btn_compare_smaller', 'btn_compare_bigger'], element.name)) {
                element.iconChar = '&#xf096';
            }
        });
    }

};