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

        this._defaultCountryCallingCode = '+41';
        this._internationalCallPrefix = '00';
        this._linkButtonVisible = true;
        
        this._linkButtonEl = new kijs.gui.Button({
            iconMap: 'kijs.iconMap.Fa.phone',
            cls: 'kijs-inline',
            tooltip: kijs.getText('Anrufen'),
            nodeAttribute: {
                tabIndex: -1
            },
            on: {
                click: this.#onLinkButtonClick,
                context: this
            }
        });
        this.add(this._linkButtonEl);
        
        this._inputDom.nodeAttributeSet('type', 'tel');
        
        this._dom.clsRemove('kijs-field-text');
        this._dom.clsAdd('kijs-field-phone');
        
        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
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
            linkButtonVisible: { target: 'visible', context: this._linkButtonEl }
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
    
    get linkButtonVisible() { return this._linkButtonEl.visible; }
    set linkButtonVisible(val) { this._linkButtonEl.visible = val; }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // PROTECTED
    // overwrite
    _formatRules(value) {
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
            val = this._applyReplaceRegExps(this._formatRegExps, val);
            
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
        if (kijs.isFunction(this._formatFn)) {
            if (value !== null && value.toString() !== '') {
                value = this._formatFn.call(this._formatFnContext || this, value);
            }
        }
        
        return value;
    }


    // PRIVATE
    // LISTENERS
    #onLinkButtonClick() {
        let val = this.value;
        if (!this.disabled && !kijs.isEmpty(val) && this.validate(val)) {
            
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
        this._linkButtonEl = null;
        
        // Basisklasse entladen
        super.destruct(true);
    }
    
};
