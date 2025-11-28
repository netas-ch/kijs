/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.field.Phone
// --------------------------------------------------------------
kijs.gui.field.Phone = class kijs_gui_field_Phone extends kijs.gui.field.Text {


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

        this._defaultCountryCallingCode = '+41';
        this._internationalCallPrefix = '00';
        this._preventLinkButtonDisable = false;
        
        this._inputDom.nodeAttributeSet('type', 'tel');
        
        this._linkButtonEl = new kijs.gui.Button({
            parent: this,
            iconMap: 'kijs.iconMap.Fa.phone',
            tooltip: kijs.getText('Anrufen'),
            nodeAttribute: {
                tabIndex: -1
            },
            on: {
                click: this.#onLinkButtonClick,
                context: this
            }
        });
        
        this._dom.clsRemove('kijs-field-text');
        this._dom.clsAdd('kijs-field-phone');
        
        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            linkButtonCls: 'kijs-inline',
            disableFlex: true,
            inputMode: 'tel',
            formatRegExp:[  // Formatierung (kann mit config ersetzt werden)
                { 
                    regExp: /^\+41([89][0-9]{2})([0-9]{3})([0-9]{3})$/, // CH 0800 + 0900
                    replace: '+41 $1 $2 $3'
                },{
                    regExp: /^\+41([1-7][0-9])([0-9]{3})([0-9]{2})([0-9]{2})$/, // CH default
                    replace: '+41 $1 $2 $3 $4'
                },{ 
                    regExp: /^\+423([0-9]{3})([0-9]{2})([0-9]{2})$/, // LI
                    replace: '+423 $1 $2 $3'
                },{ 
                    regExp: /^\+43([0-9]{3})([0-9]{4})([0-9]{6})([0-9]{4})$/, // A
                    replace: '+43 $1 $2 $3 $4'
                //},{ 
                //    regExp: /^\+49([0-9]{3})([0-9]{3})([0-9]{11})$/, // D // TODO: richtige Formatierung?
                //    replace: '+49 $1 $2 $3'
                },{ 
                    regExp: /^\+33([0-9])([0-9]{2})([0-9]{2})([0-9]{2})([0-9]{2})$/, // F
                    replace: '+33 $1 $2 $3 $4 $5'
                }
            ]
        });

       // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            defaultCountryCallingCode: true,    // Standard Landesvorwahl

            linkButtonCls: { fn: 'function', target: this._linkButtonEl.dom.clsAdd, context: this._linkButtonEl.dom },
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
    get defaultCountryCallingCode() { return this._defaultCountryCallingCode; }
    set defaultCountryCallingCode(val) { this._defaultCountryCallingCode = val; }

    get internationalCallPrefix() { return this._internationalCallPrefix; }
    set internationalCallPrefix(val) { this._internationalCallPrefix = val; }
    
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
    
    
    // PROTECTED
    // overwrite
    _formatRules(value, whileTyping) {
        // führende 00 durch + ersetzen
        if (!kijs.isEmpty(this._internationalCallPrefix)) {
            if (value.substring(0, this._internationalCallPrefix.length) === this._internationalCallPrefix) {
                value = '+' + value.substring(this._internationalCallPrefix.length, value.length);
            }
        }
        
        // formatRegExps 
        // Diese haben hier ein anderes Verhalten. Falls keine regExp anwendung findet,
        // wird die Nummer so belassen, wie sie eingegeben wurde.
        if (this._formatRegExps) {
            let val = '';
            let origVal = '';
            
            val = value;
            
            // Alles andere als Zahlen und das + am Anfang entfernen
            val = val.replace(/(?!^\+)[^0-9]+/g, '');
            
            // Bei lokaler Nummer: Landesvorwahl hinzufügen
            if (!kijs.isEmpty(this._defaultCountryCallingCode)) {
                if (val.match(/^[0][1-9][0-9]+$/)){
                    val = this._defaultCountryCallingCode + val.substring(1);
                }
                val = val.replace(/^[0][1-9][0-9]+$/, this._defaultCountryCallingCode);
            }
            origVal = val;
            
            // Formatierung temporär anwenden           
            val = this._formatApplyFormatRegExp(value, whileTyping);
            
            // hat eine Formatierung gepasst? 
            // Dann Formatierung anwenden. Sonst nicht formatieren
            if (val !== origVal) {
                value = val;
            }
        }
        
        // Evtl. in lokale Nummer konvertieren
        if (!kijs.isEmpty(this._defaultCountryCallingCode)) {
            if (value.substring(0, this._defaultCountryCallingCode.length) === this._defaultCountryCallingCode) {
                value = value.substring(this._defaultCountryCallingCode.length, value.length);
                // Leerzeichen am Anfang entfernen
                value = value.replace(/^[ ]+/, '');
                // 0 als Präfix
                value = '0' + value;
            }
        }
        
        // formatFn
        value = this._formatApplyFormatFn(value, whileTyping);
        
        return value;
    }


    // PRIVATE
    // LISTENERS
    #onLinkButtonClick() {
        let val = this.value;
        if ((this._preventLinkButtonDisable && !this._linkButtonEl.disabled || !this.disabled) && !kijs.isEmpty(val) && this.validate(val)) {
            
            // Alles andere als Zahlen und das + am Anfang entfernen
            val = val.replace(/(?!^\+)[^0-9]+/g, '');
            
            // Bei lokaler Nummer: Landesvorwahl hinzufügen
            if (!kijs.isEmpty(this._defaultCountryCallingCode)) {
                if (val.match(/^[0][1-9][0-9]+$/)){
                    val = this._defaultCountryCallingCode + val.substring(1);
                }
                val = val.replace(/^[0][1-9][0-9]+$/, this._defaultCountryCallingCode);
            }
            
            // Link, öffnen
            kijs.Navigator.openEmailPhoneLink('tel:' + val);
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
        this._defaultCountryCallingCode = null;
        this._internationalCallPrefix = null;
        this._linkButtonEl = null;
        this._preventLinkButtonDisable = null;
        
        // Basisklasse entladen
        super.destruct(true);
    }
    
};
