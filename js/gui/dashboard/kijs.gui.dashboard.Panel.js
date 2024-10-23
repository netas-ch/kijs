/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.dashboard.Panel
// --------------------------------------------------------------
/**
 * Panel Element, zur Verwendung in kijs.gui.dashboard Elementen.
 *
 * KLASSENHIERARCHIE
 * kijs.gui.Element
 *  kijs.gui.Container
 *   kijs.gui.Panel
 *    kijs.gui.dashboard.Panel
 *
 */
kijs.gui.dashboard.Panel = class kijs_gui_dashboard_Panel extends kijs.gui.Panel {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);
        
        this._dom.clsRemove('kijs-container');
        this._dom.clsAdd('kijs-dashboard-panel');
        
        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // nix
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            // nix
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
    // gibt Grund-Daten zum Panel zurück, wie caption und Position.
    // der Inhalt des Panels hingegen, wird vom Panel selbst verwaltet.
    get posData() {
        let ret = {
            xtype: this.xtype
        };
        if (!kijs.isEmpty(this.name)) {
            ret.name = this.name;
        }
        if (this.collapsed) {
            ret.collapsed = this.collapsed;
        } else {
            if (this.resizableHeight) {
                ret.height = this.height;
            }
        }
        if (this.userData) {
            ret.userData = this.userData;
        }
        return ret;
    }
    
    
    
    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // overwrite
    unrender(superCall) {
        // Event auslösen.
        if (!superCall) {
            this.raiseEvent('unrender');
        }
        
        super.unrender(true);
    }
    
    
    
    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    // overwrite
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
