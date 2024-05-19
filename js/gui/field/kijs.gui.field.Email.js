/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.field.Email
// --------------------------------------------------------------
kijs.gui.field.Email = class kijs_gui_field_Email extends kijs.gui.field.Text {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        this._linkButtonEl = new kijs.gui.Button({
            parent: this,
            cls: 'kijs-inline',
            iconMap: 'kijs.iconMap.Fa.envelope',
            tooltip: kijs.getText('E-Mail erstellen'),
            disableFlex: true,
            nodeAttribute: {
                tabIndex: -1
            },
            on: {
                click: this.#onLinkButtonClick,
                context: this
            }
        });
        
        this._buttonsDom = new kijs.gui.Dom({
            cls: 'kijs-buttons'
        });
        
        this._dom.clsRemove('kijs-field-text');
        this._dom.clsAdd('kijs-field-email');
        
        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            inputMode: 'email',
            validationRegExp: { // Validierung ist hier, damit sie überschrieben werden kann
                regExp: /^[^\s\:@]+@[^\s@]+\.[a-z]+$/,
                msg: kijs.getText('Ungültige E-Mail-Adresse')
            }
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            linkButtonHide: { target: 'linkButtonHide' },
            linkButtonIconChar: { target: 'iconChar', context: this._linkButtonEl },
            linkButtonIconCls: { target: 'iconCls', context: this._linkButtonEl },
            linkButtonIconColor: { target: 'iconColor', context: this._linkButtonEl },
            linkButtonIconMap: { target: 'iconMap', context: this._linkButtonEl }
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
    get linkButton() { return this._linkButtonEl; }
    
    get linkButtonHide() { return !this._linkButtonEl.visible; }
    set linkButtonHide(val) { this._linkButtonEl.visible = !val; }

    get linkButtonIconChar() { return this._linkButtonEl.iconChar; }
    set linkButtonIconChar(val) { this._linkButtonEl.iconChar = val; }

    get linkButtonIconCls() { return this._linkButtonEl.iconCls; }
    set linkButtonIconCls(val) { this._linkButtonEl.iconCls = val; }

    get linkButtonIconColor() { return this._linkButtonEl.iconColor; }
    set linkButtonIconColor(val) { this._linkButtonEl.iconColor = val; }

    get linkButtonIconMap() { return this._linkButtonEl.iconMap; }
    set linkButtonIconMap(val) { this._linkButtonEl.iconMap = val; }
    
    
    
    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // overwrite
    changeDisabled(val, callFromParent) {
        super.changeDisabled(!!val, callFromParent);
        this._linkButtonEl.changeDisabled(!!val, true);
    }
    
    // overwrite
    render(superCall) {
        super.render(true);
        
        // Buttons-Container rendern (kijs.gui.Dom)
        this._buttonsDom.renderTo(this._contentDom.node, this._inputWrapperDom.node, 'after');
        
        // Link Button rendern (kijs.gui.Button)
        this._linkButtonEl.renderTo(this._buttonsDom.node);

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

        this._buttonsDom.unrender();
        
        super.unrender(true);
    }
    
    
    // PRIVATE
    // LISTENERS
    #onLinkButtonClick() {
        let val = this.value;
        if (!this.disabled && !kijs.isEmpty(val) && this.validate(val)) {
            kijs.Navigator.openEmailPhoneLink('mailto:' + val);
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
        if (this._buttonsDom) {
            this._buttonsDom.destruct();
        }
        if (this._linkButtonEl) {
            this._linkButtonEl.destruct();
        }
        
        // Variablen (Objekte/Arrays) leeren
        this._buttonsDom = null;
        this._linkButtonEl = null;

        // Basisklasse entladen
        super.destruct(true);
    }
    
};
