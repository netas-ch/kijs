/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.ButtonGroup
// --------------------------------------------------------------
kijs.gui.ButtonGroup = class kijs_gui_ButtonGroup extends kijs.gui.Container {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);
        
        this._captionDom = new kijs.gui.Dom({
            cls: 'kijs-caption',
            nodeTagName: 'span'
        });
        
        this._dom.clsRemove('kijs-container');
        this._dom.clsAdd('kijs-buttongroup');
        
        // Standard-config-Eigenschaften mergen
        config = Object.assign({}, {
            // keine
        }, config);
        
        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            caption: { target: 'html', context: this._captionDom },
            captionCls: { fn: 'function', target: this._captionDom.clsAdd, context: this._captionDom },
            captionHtmlDisplayType: { target: 'htmlDisplayType', context: this._captionDom },
            captionStyle: { fn: 'assign', target: 'style', context: this._captionDom }
        });
        
        // Config anwenden
        if (kijs.isObject(config)) {
            this.applyConfig(config, true);
        }
    }


    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get caption() { return this._captionDom.html; }
    set caption(val) { 
        this._captionDom.html = val; 
        if (this.isRendered) {
            this.render();
        }
    }
    
    get captionDom() { return this._captionDom; }

    get captionHtmlDisplayType() { return this._captionDom.htmlDisplayType; }
    set captionHtmlDisplayType(val) { this._captionDom.htmlDisplayType = val; }
    
    // overwrite
    get isEmpty() { return this._captionDom.isEmpty && kijs.isEmpty(this._elements); }
    
    
    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // Overwrite
    render(preventAfterRender) {
        super.render(true);
        
        // Span caption rendern (kijs.guiDom)
        if (!this._captionDom.isEmpty) {
            this._captionDom.renderTo(this._dom.node, this._innerDom.node);
        } else {
            this._captionDom.unRender();
        }

        // Event afterRender auslösen
        if (!preventAfterRender) {
            this.raiseEvent('afterRender');
        }
    }

    // overwrite
    unRender() {
        this._captionDom.unRender();
        super.unRender();
    }
    
    
    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(preventDestructEvent) {
        // Event auslösen.
        if (!preventDestructEvent) {
            this.raiseEvent('destruct');
        }
        
        // Elemente/DOM-Objekte entladen
        if (this._captionDom) {
            this._captionDom.destruct();
        }
    
        // Variablen (Objekte/Arrays) leeren
        this._captionDom = null;
        
        // Basisklasse entladen
        super.destruct(true);
    }
};