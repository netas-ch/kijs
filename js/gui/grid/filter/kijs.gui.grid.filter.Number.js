/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.grid.filter.Number
// --------------------------------------------------------------
/**
 * Zahlenfilter für kijs.gui.grid.Grid (wie kijs.gui.grid.filter.Text, mit anderen Vergleichsarten).
 */
kijs.gui.grid.filter.Number = class kijs_gui_grid_filter_Number extends kijs.gui.grid.filter.Text {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
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
            compare: true  // {String|Boolean} Vergleichsart: 'equal', 'unequal', 'smaller' oder 'bigger'. false = keine Auswahl im Menü. Default: 'equal'
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
     * Filter-Objekt für den Server: zusätzlich type 'number', search und compare
     * @type {Object}
     */
    get filter() {
        return Object.assign(super.filter, {
            type: 'number',
            search: this._searchField.value,
            compare: this._compare
        });
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