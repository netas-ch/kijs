/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.field.Email
// --------------------------------------------------------------
/**
 * Textfeld für eine E-Mail-Adresse mit Validierung (validationRegExp) und einem Button, der mit
 * mailto: eine E-Mail an die gültige Adresse erstellt.
 *
 * @example
 * new kijs.gui.field.Email({ label: 'E-Mail', name: 'email' });
 */
kijs.gui.field.Email = class kijs_gui_field_Email extends kijs.gui.field.Text {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        // overwrite
        this._valuesMapping = {
            name: { valueProperty: 'value', emptyValue: '' }
        };

        this._preventLinkButtonDisable = false;
        this._linkButtonEl = new kijs.gui.Button({
            parent: this,
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
        
        this._dom.clsRemove('kijs-field-text');
        this._dom.clsAdd('kijs-field-email');
        
        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            linkButtonCls: 'kijs-inline',
            inputMode: 'email',
            validationRegExp: { // Validierung ist hier, damit sie überschrieben werden kann
                regExp: /^[^\s\:@]+@[^\s@]+\.[a-z]+$/,
                msg: kijs.getText('Ungültige E-Mail-Adresse')
            }
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            linkButtonCls: { fn: 'function', target: this._linkButtonEl.dom.clsAdd, context: this._linkButtonEl.dom },  // {String|Array} CSS-Klassen des Link-Buttons. Default: 'kijs-inline'
            linkButtonHide: { target: 'linkButtonHide' },
            linkButtonIconChar: { target: 'iconChar', context: this._linkButtonEl },
            linkButtonIconCls: { target: 'iconCls', context: this._linkButtonEl },
            linkButtonIconColor: { target: 'iconColor', context: this._linkButtonEl },
            linkButtonIconMap: { target: 'iconMap', context: this._linkButtonEl },
            preventLinkButtonDisable: { target: 'preventLinkButtonDisable' }
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
    /**
     * Button, der eine E-Mail an die Adresse erstellt (mailto:)
     * @type {kijs.gui.Button}
     */
    get linkButton() { return this._linkButtonEl; }
    
    /**
     * Link-Button ausblenden?
     * @type {Boolean}
     */
    get linkButtonHide() { return !this._linkButtonEl.visible; }
    set linkButtonHide(val) { this._linkButtonEl.visible = !val; }

    /**
     * Zeichen des Icons im Link-Button
     * @type {String|Number}
     */
    get linkButtonIconChar() { return this._linkButtonEl.iconChar; }
    set linkButtonIconChar(val) { this._linkButtonEl.iconChar = val; }

    /**
     * CSS-Klasse des Icons im Link-Button
     * @type {String|null}
     */
    get linkButtonIconCls() { return this._linkButtonEl.iconCls; }
    set linkButtonIconCls(val) { this._linkButtonEl.iconCls = val; }

    /**
     * Farbe des Icons im Link-Button
     * @type {String|null}
     */
    get linkButtonIconColor() { return this._linkButtonEl.iconColor; }
    set linkButtonIconColor(val) { this._linkButtonEl.iconColor = val; }

    /**
     * Icon des Link-Buttons. Default: 'kijs.iconMap.Fa.envelope'
     * @type {String}
     */
    get linkButtonIconMap() { return this._linkButtonEl.iconMap; }
    set linkButtonIconMap(val) { this._linkButtonEl.iconMap = val; }

    /**
     * Link-Button aktiv lassen, wenn das Feld deaktiviert ist? Default: false
     * @type {Boolean}
     */
    get preventLinkButtonDisable() { return this._preventLinkButtonDisable; }
    set preventLinkButtonDisable(val) { this._preventLinkButtonDisable = val; }
    
    
    
    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // overwrite
    changeDisabled(val, callFromParent) {
        super.changeDisabled(!!val, callFromParent);

        if (this._preventLinkButtonDisable) {
            this._linkButtonEl.changeDisabled(false, true);
        } else {
            this._linkButtonEl.changeDisabled(!!val, true);
        }
    }
    
    // overwrite
    render(superCall) {
        super.render(true);
        
        // Link Button rendern (kijs.gui.Button)
        this._linkButtonEl.renderTo(this._contentDom.node, this._innerDom.node, 'before');

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
        
        super.unrender(true);
    }
    
    
    // PRIVATE
    // LISTENERS
    #onLinkButtonClick() {
        let val = this.value;
        if ((this._preventLinkButtonDisable && !this._linkButtonEl.disabled || !this.disabled) && !kijs.isEmpty(val) && this.validate(val)) {
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
        if (this._linkButtonEl) {
            this._linkButtonEl.destruct();
        }
        
        // Variablen (Objekte/Arrays) leeren
        this._linkButtonEl = null;
        this._preventLinkButtonDisable = null;

        // Basisklasse entladen
        super.destruct(true);
    }
    
};
