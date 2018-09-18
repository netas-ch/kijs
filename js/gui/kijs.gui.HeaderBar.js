/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.HeaderBar
// --------------------------------------------------------------
kijs.gui.HeaderBar = class kijs_gui_HeaderBar extends kijs.gui.Container {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super();
        
        this._captionDom = new kijs.gui.Dom({
            cls: 'kijs-caption',
            nodeTagName: 'span'
        });
        
        this._iconEl = new kijs.gui.Icon({ parent: this });
        
        this._dom.clsRemove('kijs-container');
        this._dom.clsAdd('kijs-headerbar');
        
        // Standard-config-Eigenschaften mergen
        config = Object.assign({}, {
            // keine
        }, config);
        
        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            caption: { target: 'html', context: this._captionDom },
            captionCls: { fn: 'function', target: this._captionDom.clsAdd, context: this._captionDom },
            captionHtmlDisplayType: { target: 'htmlDisplayType', context: this._captionDom },
            captionStyle: { fn: 'assign', target: 'style', context: this._captionDom },
            icon: { target: 'icon' },
            iconChar: { target: 'iconChar', context: this._iconEl },
            iconCls: { target: 'iconCls', context: this._iconEl },
            iconColor: { target: 'iconColor', context: this._iconEl }
        });
        
        // click- und mouseDown-Event soll nur auf dem label und icon kommen. Bei den elements nicht.
        this._eventForwardsRemove('click', this._dom);
        this._eventForwardsAdd('click', this._captionDom);
        this._eventForwardsAdd('click', this._iconEl.dom);

        this._eventForwardsRemove('dblClick', this._dom);
        this._eventForwardsAdd('dblClick', this._captionDom);
        this._eventForwardsAdd('dblClick', this._iconEl.dom);

        this._eventForwardsRemove('mouseDown', this._dom);
        this._eventForwardsAdd('mouseDown', this._captionDom);
        this._eventForwardsAdd('mouseDown', this._iconEl.dom);

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
    
    get icon() { return this._iconEl; }
    /**
     * Icon zuweisen
     * @param {kijs.gui.Icon|Object} val     Icon als icon-Config oder kijs.gui.Icon Element
     */
    set icon(val) {
        // Icon zurücksetzen?
        if (kijs.isEmpty(val)) {
            this._iconEl.iconChar = null;
            this._iconEl.iconCls = null;
            this._iconEl.iconColor = null;
            if (this.isRendered) {
                this.render();
            }
            
        // kijs.gui.Icon Instanz
        } else if (val instanceof kijs.gui.Icon) {
            this._iconEl.destruct();
            this._iconEl = val;
            if (this.isRendered) {
                this.render();
            }
            
        // Config Objekt
        } else if (kijs.isObject(val)) {
            this._iconEl.applyConfig(val);
            if (this.isRendered) {
                this.render();
            }
            
        } else {
            throw new Error(`config "icon" is not valid.`);
            
        }
    }
    
    get iconChar() { return this._iconEl.iconChar; }
    set iconChar(val) { 
        this._iconEl.iconChar = val;
        if (this.isRendered) {
            this.render();
        }
    }

    get iconCls() { return this._iconEl.iconCls; }
    set iconCls(val) {
        this._iconEl.iconCls = val;
        if (this.isRendered) {
            this.render();
        }
    }
    
    get iconColor() { return this._iconEl.iconColor; }
    set iconColor(val) {
        this._iconEl.iconColor = val;
        if (this.isRendered) {
            this.render();
        }
    }
    
    get isEmpty() { return this._captionDom.isEmpty && this._iconEl.isEmpty && super.isEmpty; }


    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // Overwrite
    render(preventAfterRender) {
        // dom mit Tools rendern (innerDom)
        super.render(true);
        
        // Span icon rendern (icon kijs.gui.Icon)
        if (!this._iconEl.isEmpty) {
            this._iconEl.renderTo(this._dom.node, this._innerDom.node);
        } else {
            this._iconEl.unRender();
        }

        // Span caption rendern (captionDom kijs.guiDom)
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
        this._iconEl.unRender();
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
        if (this._iconEl) {
            this._iconEl.destruct();
        }
        
        // Variablen (Objekte/Arrays) leeren
        this._captionDom = null;
        this._iconEl = null;
        
        // Basisklasse entladen
        super.destruct(true);
    }
    
};