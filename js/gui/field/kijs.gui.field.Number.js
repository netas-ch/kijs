/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.field.Number
// --------------------------------------------------------------
/**
 * EVENTS
 * ----------
 *
 * // Geerbte Events
 * add
 * afterFirstRenderTo
 * afterRender
 * afterResize
 * beforeAdd
 * beforeRemove
 * blur
 * changeVisibility
 * childElementAfterResize
 * dblClick
 * destruct
 * drag
 * dragEnd
 * dragLeave
 * dragOver
 * dragStart
 * drop
 * focus
 * input
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
kijs.gui.field.Number = class kijs_gui_field_Number extends kijs.gui.field.Text {

    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        this._dom.clsAdd('kijs-field-number');

        // config
        this._allowDecimals = false;
        this._alwaysDisplayDecimals = false;
        this._decimalPrecision = 2;
        this._decimalSeparator = '.';
        this._minValue = null;
        this._maxValue = null;
        this._thousandsSeparator = '';


        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });

       // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            allowDecimals: true,
            alwaysDisplayDecimals: true,
            decimalPrecision: { target: 'decimalPrecision'},
            decimalSeparator: true,
            minValue: { target: 'minValue'},
            maxValue: { target: 'maxValue'},
            thousandsSeparator: true
        });

        // Listeners
        this.on('blur', this._onBlur, this);

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }
    }


    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------

    get allowDecimals() { return this._allowDecimals; }
    set allowDecimals(val) { this._allowDecimals = !!val; }

    get alwaysDisplayDecimals() { return this._alwaysDisplayDecimals; }
    set alwaysDisplayDecimals(val) { this._alwaysDisplayDecimals = !!val; }

    get decimalPrecision() { return this._decimalPrecision; }
    set decimalPrecision(val) { this._decimalPrecision = kijs.isNumeric(val) ? parseInt(val) : 2; }

    get maxValue() { return this._maxValue; }
    set maxValue(val) { this._maxValue = val === null ? null : parseFloat(val); }

    get minValue() { return this._minValue; }
    set minValue(val) { this._minValue = val === null ? null : parseFloat(val); }

    get value() {
        let val=super.value, nr=null;
        if (val !== null) {
            nr = kijs.Number.parse(val, this._decimalPrecision, this._decimalSeparator, this._thousandsSeparator);
        }
        return nr !== null ? nr : val;
    }
    set value(val) {
        if (!kijs.isNumber(val) && kijs.isString(val)) {
            val = kijs.Number.parse(val, this._decimalPrecision, this._decimalSeparator, this._thousandsSeparator);
        }
        if (kijs.isNumber(val)) {
            super.value = kijs.Number.format(val, (this._alwaysDisplayDecimals ? this._decimalPrecision : null), this._decimalSeparator, this._thousandsSeparator);

        } else if (val === null) {
            super.value = '';

        } else {
            super.value = val;
        }
    }

    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------

    _validationRules(originalValue) {
        super._validationRules(originalValue);

        let value = kijs.toString(originalValue);
        if (value.trim() !== '') {

            // Zahl parsen
            if (this._thousandsSeparator !== '') {
                value = kijs.String.replaceAll(value, this._thousandsSeparator, '');
            }
            if (this._decimalSeparator !== '.' && this._decimalSeparator !== '') {
                 value = kijs.String.replaceAll(value, this._decimalSeparator, '.');
            }
            value = value.replace(/[^\-0-9\.]/, '');

            if (this._allowDecimals) {
                value = window.parseFloat(value);
            } else {
                value = window.parseInt(value);
            }

            if (window.isNaN(value)) {
                this._errors.push(kijs.getText('%1 ist keine gültige Nummer', '', originalValue));

            } else {

                // Min. value
                if (this._minValue !== null && value < this._minValue) {
                    this._errors.push(kijs.getText('Der minimale Wert für dieses Feld ist %1', '', this._minValue));
                }

                // Max. value
                if (this._maxValue !== null && value > this._maxValue) {
                    this._errors.push(kijs.getText('Der maximale Wert für dieses Feld ist %1', '', this._maxValue));
                }
            }
        }
    }

    // EVENTS
    _onBlur() {
        // Beim verlassen des Feldes zahl auf eingestelltes Format ändern.
        let val = this.value;
        if (super.value !== val) {
            this.value = val;
        }
    }

    // overwrite
    render(superCall) {
        super.render(true);

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

        // Basisklasse entladen
        super.destruct(true);
    }
};
