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
        this._icon2El = new kijs.gui.Icon({ parent: this, cls:'kijs-icon2' });

        this._badgeDom = new kijs.gui.Dom({
            cls: 'kijs-badge',
            nodeTagName: 'span'
        });

        this._dom.nodeTagName = 'button';
        this._dom.nodeAttributeSet('type', 'button');

        this._dom.clsAdd('kijs-button');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
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
            icon: { target: 'icon' },
            iconChar: { target: 'iconChar', context: this._iconEl },
            iconCls: { target: 'iconCls', context: this._iconEl },
            iconColor: { target: 'iconColor', context: this._iconEl },
            icon2: { target: 'icon2' },
            icon2Char: { target: 'iconChar', context: this._icon2El },
            icon2Cls: { target: 'iconCls', context: this._icon2El },
            icon2Color: { target: 'iconColor', context: this._icon2El },
            isDefault: { target: 'isDefault' },

            disabled: { prio: 100, target: 'disabled' }
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
    get badgeText() { return this._badgeDom.html; }
    set badgeText(val) {
        this._badgeDom.html = val;
        if (this.isRendered) {
            this.render();
        }
    }

    get badgeDom() { return this._badgeDom; }

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
    render(superCall) {
        super.render(true);

        // Span icon rendern (kijs.gui.Icon)
        if (!this._iconEl.isEmpty) {
            this._iconEl.renderTo(this._dom.node);
        } else {
            this._iconEl.unrender();
        }

        // Span caption rendern (kijs.guiDom)
        if (!this._captionDom.isEmpty) {
            this._captionDom.renderTo(this._dom.node);
        } else {
            this._captionDom.unrender();
        }

        // Div badge rendern (kijs.guiDom)
        if (!this._badgeDom.isEmpty) {
            this._badgeDom.renderTo(this._dom.node);
        } else {
            this._badgeDom.unrender();
        }

        // Span icon2 rendern (kijs.gui.Icon)
        if (!this._icon2El.isEmpty) {
            this._icon2El.renderTo(this._dom.node);
        } else {
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

        this._iconEl.unrender();
        this._icon2El.unrender();
        this._captionDom.unrender();
        this._badgeDom.unrender();
        super.unrender(true);
    }


    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
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

        // Variablen (Objekte/Arrays) leeren
        this._badgeDom = null;
        this._captionDom = null;
        this._iconEl = null;

        // Basisklasse entladen
        super.destruct(true);
    }

};