/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.Button
// --------------------------------------------------------------
kijs.gui.Button = class kijs_gui_Button extends kijs.gui.Element {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);
        
        this._captionDom = new kijs.gui.Dom({
            cls: 'kijs-caption',
            nodeTagName: 'span'
        });
        
        this._iconEl = new kijs.gui.Icon({ parent: this });
        
        this._dom.nodeTagName = 'button';
        this._dom.nodeAttributeSet('type', 'button');
        
        this._dom.clsAdd('kijs-button');
        
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
            iconColor: { target: 'iconColor', context: this._iconEl },
            isDefault: { target: 'isDefault' },
            
            disabled: { prio: 100, target: 'disabled' }
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
    
    get disabled() { return this._dom.disabled; }
    set disabled(val) {
        if (val) {
            this._dom.clsAdd('kijs-disabled');
        } else {
            this._dom.clsRemove('kijs-disabled');
        }
        this._dom.disabled = val;
    }
    
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

    get isDefault() {
        return this._dom.clsHas('kijs-default');
    }
    set isDefault(val) {
        if (val) {
            this._dom.clsAdd('kijs-default');
        } else {
            this._dom.clsRemove('kijs-default');
        }
    }
    
    // overwrite
    get isEmpty() { return this._captionDom.isEmpty && this._iconEl.isEmpty; }
    
    
    
    
    // TODO: Instanz eines Menüs. Beim Klicken, wird dieses geöffnet
        /*if (this.menu) {
            if (kijs.isEmpty(this.menu.targetEl)) {
                this.menu.targetEl = this;
            }
            this.on('click', function(e, el){
                this.menu.show();
            }, this);
        }*/



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // Overwrite
    render(preventAfterRender) {
        super.render(true);
        
        // Span icon rendern (kijs.gui.Icon)
        if (!this._iconEl.isEmpty) {
            this._iconEl.renderTo(this._dom.node);
        } else {
            this._iconEl.unRender();
        }

        // Span caption rendern (kijs.guiDom)
        if (!this._captionDom.isEmpty) {
            this._captionDom.renderTo(this._dom.node);
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