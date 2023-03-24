/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.field.Number
// --------------------------------------------------------------

// TODO: Besser direkt von kijs.gui.field.Field erben?

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
 * rightClick
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
    // overwrite
    constructor(config={}) {
        super(false);

        this._allowDecimals = false;
        this._alwaysDisplayDecimals = false;
        this._decimalPrecision = 2;
        this._decimalSeparator = '.';
        this._minValue = null;
        this._maxValue = null;
        this._thousandsSeparator = '';
        
        this._allowedDecimalSeparators = ['.', ','];
        this._allowedThousandsSeparators = ['\'', ' ', '`', '´'];

        this._dom.clsRemove('kijs-field-text');
        this._dom.clsAdd('kijs-field-number');
        
        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            disableFlex: true,
            inputMode: 'decimal'
        });

       // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            allowDecimals: true,
            allowedDecimalSeparators: true,
            allowedThousandsSeparators: true,
            alwaysDisplayDecimals: true,
            decimalPrecision: { target: 'decimalPrecision'},
            decimalSeparator: true,
            minValue: { target: 'minValue'},
            maxValue: { target: 'maxValue'},
            thousandsSeparator: true
        });

        // Listeners
        this.on('blur', this.#onBlur, this);

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
    set alwaysDisplayDecimals(val) { 
        this._alwaysDisplayDecimals = !!val;
    }

    get decimalPrecision() { return this._decimalPrecision; }
    set decimalPrecision(val) { 
        this._decimalPrecision = kijs.isNumeric(val) ? parseInt(val) : 2;
    }

    get decimalSeparator() { return this._decimalSeparator; }
    set decimalSeparator(val) { 
        this._decimalSeparator = val;
    }
    
    get maxValue() { return this._maxValue; }
    set maxValue(val) { 
        this._maxValue = val === null ? null : parseFloat(val);
    }

    get minValue() { return this._minValue; }
    set minValue(val) { 
        this._minValue = val === null ? null : parseFloat(val);
    }

    get thousandsSeparator() { return this._thousandsSeparator; }
    set thousandsSeparator(val) {
        this._thousandsSeparator = val;
    }
    
    // overwrite
    get value() {
        let val = this._unformatNumber(super.value);
        // Zahlen sind entweder eine Ziffer oder Null;
        return val === '' ? null : val;
    }
    // overwrite
    set value(val) {
        // Formatieren (bei ungültiger Nummer, wird der ursprüngliche Wert verwendet)
        super.value = this._formatNumber(val);
    }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // PROTECTED
    // Zahl formatieren
    _formatNumber(value) {
        // vorhandene Formatierung entfernen
        value = this._unformatNumber(value);
        
        // Wenn Nummer nicht valide ist, wird der Ursprungswert zurückgegeben?
        if (!value.match(/^-?[0-9]+(?:\.[0-9]+)?$/)) {
            return value;
        }
        
        // Runden
        let digits = 0;
        if (this._allowDecimals) {
            digits = this.decimalPrecision;
        }
        value = kijs.Number.round(value, digits);
        
        // formatieren
        value = kijs.Number.format(
                value, 
                (this._alwaysDisplayDecimals ? this._decimalPrecision : null), 
                this._decimalSeparator, 
                this._thousandsSeparator);
        
        return value;
    }
    
    // Formatierung einer Zahl entfernen
    _unformatNumber(value) {
        value = kijs.toString(value).trim();
        
        // Tausendertrennzeichen entfernen
        kijs.Array.each(this._allowedThousandsSeparators, function(sep) {
            value = kijs.String.replaceAll(value, sep, '');
        }, this);
        
        // Dezimaltrennzeichen durch . ersetzen
        kijs.Array.each(this._allowedDecimalSeparators, function(sep) {
            value = kijs.String.replaceAll(value, sep, '.');
        }, this);
        
        // Falls die Zahl mit einem Dezimaltrennzeichen endet, dieses entfernen.
        value = value.replace(/[\.]+$/, '');
        
        return value;
    }
    
    // overwrite
    _validationRules(value) {
        let originalValue = value;
        
        super._validationRules(value);

        value = kijs.toString(value).trim();
        
        // Falls das Feld leer ist, nichts weiter tun.
        if (value === '') {
            return;
        }
        
        // Formatierung entfernen
        value = this._unformatNumber(value);
        
        // valide Nummer?
        if (!value.match(/^-?[0-9]+\.?[0-9]*?$/)) {
            this._errors.push(kijs.getText('%1 ist keine gültige Nummer', '', originalValue));
            return;
        }
        
        // runden, damit min und max geprüft werden können
        if (this._allowDecimals) {
            value = window.parseFloat(value);
            value = kijs.Number.round(value, this._decimalPrecision);
        } else {
            value = window.parseInt(value);
        }

        // Min. value testen
        if (this._minValue !== null && value < this._minValue) {
            this._errors.push(kijs.getText('Der minimale Wert für dieses Feld ist %1', '', this._minValue));
        }

        // Max. value testen
        if (this._maxValue !== null && value > this._maxValue) {
            this._errors.push(kijs.getText('Der maximale Wert für dieses Feld ist %1', '', this._maxValue));
        }
    }


    // PRIVATE
    // LISTENERS
    #onBlur() {
        // Beim verlassen des Feldes, Zahl auf eingestelltes Format ändern.
        // Wenn Nummer ungültig, die Nummer belassen
        let val = this.value;
        this.value = val;
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

        // Variablen (Objekte/Arrays) leeren
        this._allowedDecimalSeparators = null;
        this._allowedThousandsSeparators = null;
        
        // Basisklasse entladen
        super.destruct(true);
    }
    
};
