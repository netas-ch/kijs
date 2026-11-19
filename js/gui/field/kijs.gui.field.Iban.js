/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.field.Iban
// --------------------------------------------------------------
/**
 * Textfeld für eine IBAN. Die Eingabe wird in Vierergruppen und Grossbuchstaben formatiert und über die
 * Prüfsumme (Modulo 97) validiert.
 *
 * @example
 * new kijs.gui.field.Iban({ label: 'IBAN', name: 'iban' });
 */
kijs.gui.field.Iban = class kijs_gui_field_Iban extends kijs.gui.field.Text {


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

        this._dom.clsRemove('kijs-field-text');
        this._dom.clsAdd('kijs-field-iban');
        
        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            disableFlex: true,
            formatRegExp:[  // Formatierung (kann mit config ersetzt werden)
                { 
                    regExp: /\s/g, // Whitespace entfernen
                    replace: ''
                },{
                    regExp: /(\S{4})/g, // alle 4 Zeichen eine Lücke einfügen
                    replace: '$1 '
                },{ 
                    regExp: /\s$/, // Whitespace am Ende entfernen
                    replace: ''
                },{ 
                    regExp: /(.*)/g, // Buchstaben in Grossbuchstaben umwandeln
                    toUpperCase: true
                }
            ]
        });
        
        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }
    }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // PROTECTED
    /**
     * Berechnet den Rest einer Division für eine Zahl als String (auch für sehr lange Zahlen).
     * @param {String} aNumStr  Zahl als String
     * @param {Number} aDiv  Divisor
     * @returns {Number}
     */
    _modulo(aNumStr, aDiv) {
        let tmp = "";
        let i, r;
        for (i = 0; i < aNumStr.length; i++) {
            tmp += aNumStr.charAt(i);
            r = tmp % aDiv;
            tmp = r.toString();
        }
        return tmp / 1;
    }
    
    /**
     * Prüft eine IBAN: nur A-Z und 0-9 (Leerzeichen werden ignoriert) und Prüfsumme Modulo 97 = 1.
     * Die Länge pro Land wird nicht geprüft.
     * @param {String} value
     * @returns {Boolean}
     */
    _validateIban(value) {
        value = kijs.toString(value).toUpperCase().replace(/\s/g, '');

        // Nicht erlaubte Zeichen?
        if (!value || /[^A-Z0-9]/.test(value)) {
            return false;
        }

        let rearrange =
            value.substring(4, value.length)
            + value.substring(0, 4);
        let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
        let alphaMap = {};
        let number = [];

        alphabet.forEach((value, index) => {
            alphaMap[value] = index + 10;
        });

        rearrange.split('').forEach((value, index) => {
            number[index] = alphaMap[value] || value;
        });

        return this._modulo(number.join('').toString(), 97) === 1;
    }
    
    // overwrite
    _validationRules(value, ignoreEmpty) {
        if (ignoreEmpty && kijs.isEmpty(value)) {
            return;
        }
        
        super._validationRules(value, ignoreEmpty);

        // IBAN validieren
        if (!kijs.isEmpty(value) && !this._validateIban(value)) {
            this._errors.push(kijs.getText('Ungültige IBAN'));
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

        // Basisklasse entladen
        super.destruct(true);
    }
    
};
