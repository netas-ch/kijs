/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.field.Iban
// --------------------------------------------------------------

/**
 * EVENTS
 * ----------
 * blur
 * input
 *
 * // Geerbte Events
 * add
 * afterFirstRenderTo
 * afterRender
 * afterResize
 * beforeAdd
 * beforeRemove
 * changeVisibility
 * childElementAfterResize
 * dblClick
 * rightClick
 * destruct
 * drag
 * dragEnd
 * dragLeave
 * dragOver
 * dragStart
 * drop
 * focus
 * mouseDown
 * mouseLeave
 * mouseMove
 * mouseUp
 * remove
 * wheel
 *
 * // key events
 * keyDown
 * enterPress
 * enterEscPress
 * escPress
 * spacePress
 */
kijs.gui.field.Iban = class kijs_gui_field_Iban extends kijs.gui.field.Text {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        this._formatValue = true;

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            formatValue: true
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }

        // Listeners
        this.on('change', this.#onChange, this);
    }



    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get formatValue() { return !!this._formatValue; }
    set formatValue(val) { this._formatValue = !!val; }

    get value() { return super.value; }
    set value(val) { super.value = this._formatValue ? this._formatIban(val) : val; }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // PROTECTED
    _formatIban(iban) {
        if (this._isValidIban(iban)) {
            iban = kijs.toString(iban).toUpperCase().replace(/\s/g, '');
            let formated = '';
            while (iban.length > 0) {
                if (formated !== '') {
                    formated += ' ';
                }
                formated += iban.substr(0, Math.min(iban.length, 4));
                iban = iban.substr(Math.min(iban.length, 4));
            }
            iban = formated;
        }
        return iban;
    }

    _isValidIban(value) {
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

    // overwrite
    _validationRules(value) {
        super._validationRules(value);

        // IBAN validieren
        if (!kijs.isEmpty(value) && !this._isValidIban(value)) {
            this._errors.push(kijs.getText('Ungültige IBAN'));
        }
    }
    
    
    // PRIVATE
    // LISTENERS
    #onChange() {
        if (this._formatValue) {
            let val = this.value, formated = this._formatIban(val);

            if (formated !== val) {
                this.value = formated;
            }
        }
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

        // Variablen (Objekte/Arrays) leeren
        this._formatValue = null;

        // Basisklasse entladen
        super.destruct(true);
    }
    
};
