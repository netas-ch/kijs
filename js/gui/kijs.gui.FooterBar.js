/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.FooterBar
// --------------------------------------------------------------
kijs.gui.FooterBar = class kijs_gui_FooterBar extends kijs.gui.Container {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super();
        
        this._captionDom = new kijs.gui.Dom({
            cls: 'kijs-caption',
            nodeTagName: 'span'
        });
        
        this._dom.clsRemove('kijs-container');
        this._dom.clsAdd('kijs-footerbar');
        
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
        
        // click-Event soll nur auf dem label kommen. Bei den elements nicht.
        this._eventForwardsRemove('click', this._dom);
        this._eventForwardsAdd('click', this._captionDom);
        
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

    get isEmpty() { return this._captionDom.isEmpty && super.isEmpty; }
    
    

    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // Overwrite
    render(preventAfterRender) {
        // dom mit Tools rendern (innerDom)
        super.render(true);
        
        // Span caption rendern (captionDom kijs.guiDom)
        if (!this._captionDom.isEmpty) {
            this._captionDom.render();
            this._dom.node.appendChild(this._captionDom.node);
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