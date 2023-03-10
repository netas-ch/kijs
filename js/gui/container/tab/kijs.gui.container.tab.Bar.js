/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.container.tab.Bar
// --------------------------------------------------------------
/**
 * Funktionsweise, wie kijs.gui.container.Scrollable.
 * Das Element wird für die Tab-Leiste in kijs.gui.container.Tab verwendet.
 * Es sollte sonst nicht verwendet werden. sonst bitte kijs.gui.container.Scrollable
 * nehmen.
 *
 * KLASSENHIERARCHIE
 * kijs.gui.Element
 *  kijs.gui.Container
 *   kijs.gui.container.Scrollable
 *    kijs.gui.container.tab.Bar
 *
 * 
 */
kijs.gui.container.tab.Bar = class kijs_gui_container_tab_Bar extends kijs.gui.container.Scrollable {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);
        
        //this._dom.clsRemove('kijs-container');
        //this._dom.clsAdd('kijs-container-scrollable');
        
        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            scrollableX: 'auto',
            scrollableY: 'auto'
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


    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    
    // PROTECTED
    
    // LISTENERS
    
    
    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(superCall) {
        if (!superCall) {
            // unrender
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
