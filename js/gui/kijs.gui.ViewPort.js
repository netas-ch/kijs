/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.ViewPort
// --------------------------------------------------------------
kijs.gui.ViewPort = class kijs_gui_ViewPort extends kijs.gui.Container {
    

    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);
                
        this._dom.node = document.body;
        
        this._dom.clsRemove('kijs-container');
        this._dom.clsAdd('kijs-viewport');
        
        // Standard-config-Eigenschaften mergen
        config = Object.assign({}, {
            // keine
        }, config);
        
        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            // Keine
        });
        
        // onResize überwachen
        // Wenn der Browser langsam grösser gezogen wird, wird der event dauernd
        // ausgelöst, darum wird er verzögert weitergegeben.
        kijs.Dom.addEventListener('resize', window, this._onWindowResize, this);
        
        // Config anwenden
        if (kijs.isObject(config)) {
            this.applyConfig(config, true);
        }
    }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // overwrite
    render(preventAfterRender) {
        super.render(true);
        
        // innerDOM Rendern
        this._innerDom.render();
        this._dom.node.appendChild(this._innerDom.node);

        // elements im innerDOM rendern
        kijs.Array.each(this._elements, function(el) {
            el.renderTo(this._innerDom.node);
        }, this);
        
        // Event afterRender auslösen
        if (!preventAfterRender) {
            this.raiseEvent('afterRender');
        }
        
        // afterResize-Event zeitversetzt auslösen
        this._raiseAfterResizeEvent(true);
    }


    // PROTECTED
    _onWindowResize(e) {
        this._raiseAfterResizeEvent(true, e);
    }
    
    
    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(preventDestructEvent) {
        // Event auslösen.
        if (!preventDestructEvent) {
            this.raiseEvent('destruct');
        }
        
        // Node-Event Listener auf Window entfernen
        kijs.Dom.removeEventListener('resize', window, this);
        
        // Basisklasse auch entladen
        super.destruct(true);
    }

};
