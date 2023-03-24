/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.grid.filter.Date
// --------------------------------------------------------------
kijs.gui.grid.filter.Date = class kijs_gui_grid_filter_Date extends kijs.gui.grid.filter.Number {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

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
            type: 'date'
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