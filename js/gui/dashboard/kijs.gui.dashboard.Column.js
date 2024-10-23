/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.dashboard.Column
// --------------------------------------------------------------
/**
 * Panel Element, zur Verwendung in kijs.gui.dashboard Elementen.
 *
 * KLASSENHIERARCHIE
 * kijs.gui.Element
 *  kijs.gui.Container
 *   kijs.gui.dashboard.Column
 *
 */
kijs.gui.dashboard.Column = class kijs_gui_dashboard_Column extends kijs.gui.Container {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);
        
        this._ddTarget = null;
        
        this._dom.clsRemove('kijs-container');
        this._dom.clsAdd('kijs-dashboard-column');
        
        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // nix
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            ddTarget: { target: 'ddTarget' }
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
    get ddTarget() { 
        return this._ddTarget; 
    }
    set ddTarget(val) {
        // config-object
        if (kijs.isObject(val)) {
            if (kijs.isEmpty(this._ddTarget)) {
                val.ownerEl = this;
                if (kijs.isEmpty(val.ownerDomProperty)) {
                    val.ownerDomProperty = 'innerDom';
                }
                this._ddTarget = new kijs.gui.dragDrop.Target(val);
            } else {
                this._ddTarget.applyConfig(val);
            }

        // null
        } else if (val === null) {
            if (this._ddTarget) {
                this._ddTarget.destruct();
            }
            this._ddTarget = null;
            
        } else {
            throw new kijs.Error(`ddTarget must be a object or null`);
            
        }
    }
    
    // gibt Grund-Daten zur Spalte zurück.
    // der Inhalt der Panels hingegen, wird von den Panels selbst verwaltet.
    get posData() {
        let ret = {
            xtype: this.xtype,
            elements: []
        };
        
        kijs.Array.each(this._elements, function(el) {
            ret.elements.push(el.posData);
        }, this);
        
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
        if (this._ddTarget) {
            this._ddTarget.destruct();
        }
        
        // Variablen (Objekte/Arrays) leeren
        this._ddTarget = null;
                
        // Basisklasse entladen
        super.destruct(true);
    }
    
};
