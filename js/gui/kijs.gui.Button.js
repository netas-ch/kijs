/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.Button
// --------------------------------------------------------------
kijs.gui.Button = class kijs_gui_Button extends kijs.gui.Element {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);
        
        this._smallPaddings = 'auto';
        
        this._captionDom = new kijs.gui.Dom({
            cls: 'kijs-caption',
            nodeTagName: 'span'
        });

        this._iconEl = new kijs.gui.Icon({ parent: this });
        this._icon2El = new kijs.gui.Icon({ parent: this, cls:'kijs-icon2' });

        this._menuEl = null;

        this._badgeDom = new kijs.gui.Dom({
            cls: 'kijs-badge',
            nodeTagName: 'span'
        });

        this._dom.nodeTagName = 'button';
        this._dom.nodeAttributeSet('type', 'button');

        this._dom.clsAdd('kijs-button');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            disableFlex: true
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            badgeText: { target: 'html', context: this._badgeDom },
            badgeCls: { fn: 'function', target: this._badgeDom.clsAdd, context: this._badgeDom },
            badgeTextHtmlDisplayType: { target: 'htmlDisplayType', context: this._badgeDom },
            badgeStyle: { fn: 'assign', target: 'style', context: this._badgeDom },
            caption: { target: 'html', context: this._captionDom },
            captionCls: { fn: 'function', target: this._captionDom.clsAdd, context: this._captionDom },
            captionHtmlDisplayType: { target: 'htmlDisplayType', context: this._captionDom },
            captionStyle: { fn: 'assign', target: 'style', context: this._captionDom },
            disableFlex: { target: 'disableFlex' }, // false=ganze Breite wird genutzt, true=nur die benötigte Breite wird genutzt
            smallPaddings: true,                    // false=breite Abstände, true=schmale Abstände, 'auto'=automatisch (default)
            icon: { target: 'icon' },
            iconMap: { target: 'iconMap', context: this._iconEl },
            iconChar: { target: 'iconChar', context: this._iconEl },
            iconCls: { target: 'iconCls', context: this._iconEl },
            iconColor: { target: 'iconColor', context: this._iconEl },
            icon2: { target: 'icon2' },
            icon2Map: { target: 'iconMap', context: this._icon2El },
            icon2Char: { target: 'iconChar', context: this._icon2El },
            icon2Cls: { target: 'iconCls', context: this._icon2El },
            icon2Color: { target: 'iconColor', context: this._icon2El },
            isDefault: { target: 'isDefault' },
            menu: { target: 'menu' },
            menuElements: { target: 'menuElements', prio: 200 },
            menuCloseOnClick: { target: 'menuCloseOnClick', prio: 201 },
            menuDirection: { target: 'menuDirection', prio: 200 },
            menuExpandOnHover: { target: 'menuExpandOnHover', prio: 200 }
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
    get badgeDom() { return this._badgeDom; }

    get badgeText() { return this._badgeDom.html; }
    set badgeText(val) {
        this._badgeDom.html = val;
        if (this.isRendered) {
            this.render();
        }
    }

    get badgeTextHtmlDisplayType() { return this._badgeDom.htmlDisplayType; }
    set badgeTextHtmlDisplayType(val) { this._badgeDom.htmlDisplayType = val; }

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

    get disableFlex() { return this._dom.clsHas('kijs-disableFlex'); }
    set disableFlex(val) {
        if (val) {
            this._dom.clsAdd('kijs-disableFlex');
        } else {
            this._dom.clsRemove('kijs-disableFlex');
        }
        if (this.isRendered) {
            this.render();
        }
    }
    
    // overwrite
    get html() { return this.caption; }
    set html(val) { this.caption = val; }

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
            throw new kijs.Error(`config "icon" is not valid.`);

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

    get iconMap() { return this._iconEl.iconMap; }
    set iconMap(val) { 
        this._iconEl.iconMap = val;
        if (this.isRendered) {
            this.render();
        }
    }

    get icon2() { return this._icon2El; }
    /**
     * Icon zuweisen
     * @param {kijs.gui.Icon|Object} val     Icon als icon2-Config oder kijs.gui.Icon Element
     */
    set icon2(val) {
        // Icon zurücksetzen?
        if (kijs.isEmpty(val)) {
            this._icon2El.iconChar = null;
            this._icon2El.iconCls = null;
            this._icon2El.iconColor = null;
            if (this.isRendered) {
                this.render();
            }

        // kijs.gui.Icon Instanz
        } else if (val instanceof kijs.gui.Icon) {
            this._icon2El.destruct();
            this._icon2El = val;
            if (this.isRendered) {
                this.render();
            }

        // Config Objekt
        } else if (kijs.isObject(val)) {
            this._icon2El.applyConfig(val);
            if (this.isRendered) {
                this.render();
            }

        } else {
            throw new kijs.Error(`config "icon2" is not valid.`);

        }
    }

    get icon2Char() { return this._icon2El.iconChar; }
    set icon2Char(val) {
        this._icon2El.iconChar = val; 
        if (this.isRendered) {
            this.render();
        }
    }

    get icon2Cls() { return this._icon2El.iconCls; }
    set icon2Cls(val) { 
        this._icon2El.iconCls = val; 
        if (this.isRendered) {
            this.render();
        }
    }

    get icon2Color() { return this._icon2El.iconColor; }
    set icon2Color(val) { 
        this._icon2El.iconColor = val; 
        if (this.isRendered) {
            this.render();
        }
    }

    set icon2Map(val) { 
        this._icon2El.iconMap = val; 
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
    get isEmpty() { return this._captionDom.isEmpty && this._iconEl.isEmpty && this._icon2El.isEmpty && this._badgeDom.isEmpty; }

    get menu() { return this._menuEl; }
    set menu(val) {
        // Menu zurücksetzen?
        if (kijs.isEmpty(val)) {
            if (this._menuEl) {
                this._menuEl.destruct();
                this._menuEl = null;
            }

        // kijs.gui.Menu Instanz
        } else if (val instanceof kijs.gui.Menu) {
            if (this._menuEl) {
                this._menuEl.destruct();
            }
            this._menuEl = val;
            this._createMenu();

        // Config Objekt
        } else if (kijs.isObject(val)) {
            if (!this._menuEl) {
                this._createMenu();
            }
            this._menuEl.applyConfig(val);

        } else {
            throw new kijs.Error(`config "menu" is not valid.`);
        }
    }
    
    set menuElements(val) { this._createMenu().add(val); }
    set menuCloseOnClick(val) { this._createMenu().closeOnClick = val; }
    set menuDirection(val) { this._createMenu().direction = val; }
    set menuExpandOnHover(val) { this._createMenu().expandOnHover = val; }

    get smallPaddings() { return this._smallPaddings; }
    set smallPaddings(val) {
        let changed = this._smallPaddings !== val;
        this._smallPaddings = val;
        if (changed && this.isRendered) {
            this.render();
        }
    }
    
    

    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // overwrite
    changeDisabled(val, callFromParent) {
        super.changeDisabled(!!val, callFromParent);
        this._iconEl.changeDisabled(!!val, true);
        this._icon2El.changeDisabled(!!val, true);
        this._iconEl.changeDisabled(!!val, true);
    }
    
    // Overwrite
    render(superCall) {
        // Evtl. schmale Ränder anzeigen?
        if (this._hasSmallPaddings()) {
            this._dom.clsAdd('kijs-smallpaddings');
        } else {
            this._dom.clsRemove('kijs-smallpaddings');
        }
        
        super.render(true);
        
        // Span icon rendern (kijs.gui.Icon)
        if (!this._iconEl.isEmpty) {
            this._iconEl.renderTo(this._dom.node);
        } else if (this._iconEl.isRendered) {
            this._iconEl.unrender();
        }

        // Span caption rendern (kijs.guiDom)
        if (!this._captionDom.isEmpty) {
            this._captionDom.renderTo(this._dom.node);
        } else if (this._captionDom.isRendered) {
            this._captionDom.unrender();
        }

        // Div badge rendern (kijs.guiDom)
        if (!this._badgeDom.isEmpty) {
            this._badgeDom.renderTo(this._dom.node);
        } else if (this._badgeDom.isRendered) {
            this._badgeDom.unrender();
        }

        // Span icon2 rendern (kijs.gui.Icon)
        if (!this._icon2El.isEmpty) {
            this._icon2El.renderTo(this._dom.node);
        } else if (this._icon2El.isRendered) {
            this._icon2El.unrender();
        }

        // Event afterRender auslösen
        if (!superCall) {
            this.raiseEvent('afterRender');
        }
    }

    // overwrite
    unrender(superCall) {
        // Event auslösen.
        if (!superCall) {
            this.raiseEvent('unrender');
        }
        
        if (this._iconEl) {
            this._iconEl.unrender();
        }
        if (this._icon2El) {
            this._icon2El.unrender();
        }
        if (this._captionDom) {
            this._captionDom.unrender();
        }
        if (this._badgeDom) {
            this._badgeDom.unrender();
        }
        if (this._menuEl) {
            this._menuEl.unrender();
        }

        super.unrender(true);
    }


    // PROTECTED
    /**
     * Erstellt die Instanz vom Menu.
     * @returns {kijs.gui.Menu}
     */
    _createMenu() {
        if (this._menuEl) {
            this._menuEl.parent = this;
            this._menuEl.button = this;
        } else {
            this._menuEl = new kijs.gui.Menu({
                parent: this,
                button: this
            });
        }

        if (!this.icon2Char) {
            this.icon2Map = this._menuEl.getIconMap();
        }

        return this._menuEl;
    }
    
    // Sollen links/rechts nur schmale Paddings angezeigt werden?
    _hasSmallPaddings() {
        // 'auto' = falls der Button keine caption hat und nicht disableFlex hat, 
        // wird er mit kleineren Paddings angezeigt.
        if (this._smallPaddings === 'auto') {
            return this._captionDom.isEmpty && this._dom.clsHas('kijs-disableFlex');
        } else {
            return !!this._smallPaddings;
        }
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
        if (this._badgeDom) {
            this._badgeDom.destruct();
        }
        if (this._captionDom) {
            this._captionDom.destruct();
        }
        if (this._iconEl) {
            this._iconEl.destruct();
        }
        if (this._icon2El) {
            this._icon2El.destruct();
        }
        if (this._menuEl) {
            this._menuEl.destruct();
        }

        // Variablen (Objekte/Arrays) leeren
        this._badgeDom = null;
        this._captionDom = null;
        this._iconEl = null;
        this._menuEl = null;

        // Basisklasse entladen
        super.destruct(true);
    }

};
