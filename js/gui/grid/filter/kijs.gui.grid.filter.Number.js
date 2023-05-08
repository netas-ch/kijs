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

        // compare types
        this._compareTypes = {
            equal: kijs.getText('Ist gleich...'),
            unequal: kijs.getText('Ist nicht gleich...'),
            smaller: kijs.getText('Kleiner als...'),
            bigger: kijs.getText('Grösser als...')
        };

        this._compare = 'equal';

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            placeholder: kijs.getText('Filtern') + '...'
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            compare: true
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
};