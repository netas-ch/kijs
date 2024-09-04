/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.field.Number
// --------------------------------------------------------------
kijs.gui.field.Number = class kijs_gui_field_Number extends kijs.gui.field.Field {


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

        this._spinStep = 1;
        this._spinDelay = 400;
        this._spinAcceleration = 20;

        this._spinDelayCurrent = null;
        this._spinDeferId = null;

        this._allowedDecimalSeparators = ['.', ','];
        this._allowedThousandsSeparators = ['\'', ' ', '`', '´'];

        this._previousChangeValue = '';

        this._inputDom = new kijs.gui.Dom({
            nodeTagName: 'input',
            nodeAttribute: {
                id: this._inputId,
                inputMode: 'decimal'
            },
            on: {
                change: this.#onInputDomChange,
                input: this.#onInputDomInput,
                context: this
            }
        });

        // Spin Up/Down Buttons
        this._spinUpButtonEl = new kijs.gui.Button({
            parent: this,
            cls: 'kijs-inline',
            iconMap: 'kijs.iconMap.Fa.caret-up',
            disableFlex: false,
            nodeAttribute: {
                tabIndex: -1
            },
            on: {
                mouseDown: this.#onSpinUpButtonMouseDown,
                mouseUp: this.#onSpinUpButtonMouseUp,
                mouseLeave: this.#onSpinUpButtonMouseLeave,
                context: this
            }
        });
        
        this._spinDownButtonEl = new kijs.gui.Button({
            parent: this,
            cls: 'kijs-inline',
            iconMap: 'kijs.iconMap.Fa.caret-down',
            disableFlex: false,
            nodeAttribute: {
                tabIndex: -1
            },
            on: {
                mouseDown: this.#onSpinDownButtonMouseDown,
                mouseUp: this.#onSpinDownButtonMouseUp,
                mouseLeave: this.#onSpinDownButtonMouseLeave,
                context: this
            }
        });
        
        this._buttonsDom = new kijs.gui.Dom({
            cls: 'kijs-buttons'
        });

        this._dom.clsAdd('kijs-field-number');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            autocomplete: false,
            disableFlex: true
        });

       // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            allowDecimals: true,
            allowedDecimalSeparators: true,
            allowedThousandsSeparators: true,
            alwaysDisplayDecimals: true,
            autocomplete: { target: 'autocomplete' },   // De-/aktiviert die Browservorschläge
            decimalPrecision: { target: 'decimalPrecision'},
            decimalSeparator: true,
            inputMode: { target: 'inputMode' },
            minValue: { target: 'minValue'},
            maxValue: { target: 'maxValue'},
            placeholder: { target: 'placeholder' },
            spinAcceleration: true,     // Beschleunigung in %
            spinButtonsHide: { target: 'spinButtonsHide' },  // Spin-Buttons ausblenden
            spinDelay: true,            // Intervall in ms
            spinStep: true,             // Schrittgrösse
            thousandsSeparator: true,
            virtualKeyboardPolicy: { target: 'virtualKeyboardPolicy' }
        });

        // Event-Weiterleitungen von this._inputDom
        this._eventForwardsAdd('blur', this._inputDom);
        this._eventForwardsAdd('focus', this._inputDom);
        this._eventForwardsAdd('input', this._inputDom);

        this._eventForwardsRemove('enterPress', this._dom);
        this._eventForwardsRemove('enterEscPress', this._dom);
        this._eventForwardsRemove('escPress', this._dom);
        this._eventForwardsAdd('enterPress', this._inputDom);
        this._eventForwardsAdd('enterEscPress', this._inputDom);
        this._eventForwardsAdd('escPress', this._inputDom);

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

    get autocomplete() { return this._inputDom.nodeAttributeGet('autocomplete'); }
    set autocomplete(val) {
        let value = 'on';

        if (kijs.isString(val)) {
            value = val;
        } else if (val === false) {
            value = 'off';
        }

        // De-/aktiviert die Browservorschläge
        this._inputDom.nodeAttributeSet('autocomplete', value);
    }

    get decimalPrecision() { return this._decimalPrecision; }
    set decimalPrecision(val) {
        this._decimalPrecision = kijs.isNumeric(val) ? parseInt(val) : 2;
    }

    get decimalSeparator() { return this._decimalSeparator; }
    set decimalSeparator(val) {
        this._decimalSeparator = val;
    }

    // overwrite
    get hasFocus() { return this._inputDom.hasFocus; }

    // overwrite
    get inputDom() { return this._inputDom; }

    get inputMode() { return this._inputDom.nodeAttributeGet('inputMode'); }
    set inputMode(val) { this._inputDom.nodeAttributeSet('inputMode', val); }

    // overwrite
    get isEmpty() { return kijs.isEmpty(this.value); }

    get maxValue() { return this._maxValue; }
    set maxValue(val) {
        this._maxValue = val === null ? null : parseFloat(val);
    }

    get minValue() { return this._minValue; }
    set minValue(val) {
        this._minValue = val === null ? null : parseFloat(val);
    }

    get placeholder() { this._inputDom.nodeAttributeGet('placeholder'); }
    set placeholder(val) { this._inputDom.nodeAttributeSet('placeholder', kijs.toString(val)); }

    // overwrite
    get readOnly() { return super.readOnly; }
    set readOnly(val) {
        super.readOnly = !!val;
        this._inputDom.nodeAttributeSet('readOnly', !!val);
        this._spinUpButtonEl.disabled = val;
        this._spinDownButtonEl.disabled = val;
    }

    get spinAcceleration() { return this._spinAcceleration; }
    set spinAcceleration(val) { this._spinAcceleration = val; }

    get spinButtonsHide() { return !this._spinUpButtonEl.visible; }
    set spinButtonsHide(val) { 
        this._spinUpButtonEl.visible = !val;
        this._spinDownButtonEl.visible = !val;
    }

    get spinDelay() { return this._spinDelay; }
    set spinDelay(val) { this._spinDelay = val; }

    get spinDownButton() { return this._spinDownButtonEl; }

    get spinStep() { return this._spinStep; }
    set spinStep(val) { this._spinStep = val; }

    get spinUpButton() { return this._spinUpButtonEl; }

    get thousandsSeparator() { return this._thousandsSeparator; }
    set thousandsSeparator(val) {
        this._thousandsSeparator = val;
    }

    // overwrite
    get value() {
        let val = this._inputDom.nodeAttributeGet('value');
        val = this._unformatNumber(val);
        // Zahlen sind entweder eine Ziffer oder Null;
        return val === '' ? null : val;
    }
    // overwrite
    set value(val) {
        // Formatierung: bei ungültiger Nummer, wird der ursprüngliche Wert verwendet
        val = this._formatNumber(val);
        this._inputDom.nodeAttributeSet('value', kijs.toString(val));
        this._previousChangeValue = val;
    }

    /**
     * Die virtual keyboard policy bestimmt, ob beim focus die virtuelle
     * Tastatur geöffnet wird ('auto', default) oder nicht ('manual'). (Nur Mobile, Chrome)
     */
    get virtualKeyboardPolicy() { return this._inputDom.nodeAttributeGet('virtualKeyboardPolicy'); }
    set virtualKeyboardPolicy(val) { this._inputDom.nodeAttributeSet('virtualKeyboardPolicy', val); }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // overwrite
    changeDisabled(val, callFromParent) {
        super.changeDisabled(!!val, callFromParent);
        this._inputDom.changeDisabled(!!val, true);
        this._spinUpButtonEl.changeDisabled(!!val, true);
        this._spinDownButtonEl.changeDisabled(!!val, true);
    }
    
    /**
     * Setzt den Focus auf das Feld. Optional wird der Text selektiert.
     * @param {Boolean} [alsoSetIfNoTabIndex=false]
     * @param {Boolean} [selectText=false]
     * @returns {undefined}
     * @overwrite
     */
    focus(alsoSetIfNoTabIndex, selectText) {
        let nde = this._inputDom.focus(alsoSetIfNoTabIndex);
        if (selectText) {
            if (nde) {
                nde.select();
            }
        }
        return nde;
    }

    // overwrite
    render(superCall) {
        super.render(true);

        // Input rendern (kijs.guiDom)
        this._inputDom.renderTo(this._inputWrapperDom.node);

        // Buttons-Container rendern (kijs.gui.Dom)
        this._buttonsDom.renderTo(this._contentDom.node, this._inputWrapperDom.node, 'after');
        
        // Spin Buttons rendern (kijs.gui.Button)
        this._spinUpButtonEl.renderTo(this._buttonsDom.node);
        this._spinDownButtonEl.renderTo(this._buttonsDom.node);
        
        // Event afterRender auslösen
        if (!superCall) {
            this.raiseEvent('afterRender');
        }
    }

    // overwrite
    unrender(superCall) {
        if (this._spinDeferId) {
            clearTimeout(this._spinDeferId);
            this._spinDeferId = null;
        }

        // Event auslösen.
        if (!superCall) {
            this.raiseEvent('unrender');
        }

        this._inputDom.unrender();
        this._buttonsDom.unrender();
        
        super.unrender(true);
    }


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

    // Startet das Hoch-/runterzählen von einem Spinnbutton
    _spinStart(dir) {
        // falls bereits gescrollt wird: abbrechen
        if (this._spinDeferId) {
            clearTimeout(this._spinDeferId);
            this._spinDeferId = null;
        }

        if (this.disabled) {
            return;
        }

        let val = this.value;
        const oldValue = val;

        if (kijs.isEmpty(val)) {
            val = 0;
        }

        val = window.parseFloat(val);

        if (window.isNaN(val)) {
            return;
        }

        switch (dir) {
            case 'up':    val += this._spinStep; break;
            case 'down':  val -= this._spinStep; break;
        }

        if (this._maxValue !== null && val > this._maxValue) {
            val = this._maxValue;
        }

        if (this._minValue !== null && val < this._minValue) {
            val = this._minValue;
        }

        val = this._formatNumber(val);
        this._inputDom.nodeAttributeSet('value', kijs.toString(val));

        let step = 10; // Minimalintervall
        if (this._spinAcceleration > 0) {
            step = parseInt(this._spinDelayCurrent / 100 * this._spinAcceleration);
        }
        this._spinDelayCurrent = this._spinDelayCurrent - step;
        if (this._spinDelayCurrent < 10) {
            this._spinDelayCurrent = 10;
        }

        // Validieren
        this.validate();

        // input-event auslösen
        this.raiseEvent('input', {
            value: val,
            oldValue: oldValue
        });

        this._spinDeferId = kijs.defer(this._spinStart, this._spinDelayCurrent, this, dir);
    }

    // Stopt das Hoch-/Runterzählen von einem Spinnbutton
    _spinStop() {
        if (this._spinDeferId) {
            clearTimeout(this._spinDeferId);
            this._spinDeferId = null;
        }

        let val = this.value;
        let oldVal = this._previousChangeValue;
        this._previousChangeValue = val;

        // und das change event auslösen
        if (val !== oldVal) {
            this.raiseEvent('change', { oldValue: oldVal, value: val } );
        }
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
    _validationRules(value, ignoreEmpty) {
        if (ignoreEmpty && kijs.isEmpty(value)) {
            return;
        }

        let initialValue = value;

        super._validationRules(value, ignoreEmpty);

        value = kijs.toString(value).trim();

        // Falls das Feld leer ist, nichts weiter tun.
        if (value === '') {
            return;
        }

        // Formatierung entfernen
        value = this._unformatNumber(value);

        // valide Nummer?
        if (!value.match(/^-?[0-9]+\.?[0-9]*?$/)) {
            this._errors.push(kijs.getText('%1 ist keine gültige Nummer', '', initialValue));
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
    #onInputDomChange(e) {
        // Beim verlassen des Feldes, Zahl auf eingestelltes Format ändern.
        // Wenn Nummer ungültig, die Nummer belassen
        let val = this.value;
        let oldVal = this._previousChangeValue;

        // Wert neu reinschreiben (evtl. wurde er Formatiert)
        this.value = val;
        
        // und das change event auslösen
        if (val !== oldVal) {
            this.raiseEvent('change', { oldValue: oldVal, value: val } );
        }
    }

    #onInputDomInput(e) {
        this.validate();
    }

    #onSpinDownButtonMouseDown() {
        this._spinDelayCurrent = this._spinDelay;
        this._spinStart('down');
    }

    #onSpinDownButtonMouseLeave() {
        this._spinStop();
        this._inputDom.focus();
    }
    
    #onSpinDownButtonMouseUp() {
        this._spinStop();
        this._inputDom.focus();
    }

    #onSpinUpButtonMouseDown() {
        this._spinDelayCurrent = this._spinDelay;
        this._spinStart('up');
    }

    #onSpinUpButtonMouseLeave() {
        this._spinStop();
        this._inputDom.focus();
    }
    #onSpinUpButtonMouseUp() {
        this._spinStop();
        this._inputDom.focus();
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
        if (this._inputDom) {
            this._inputDom.destruct();
        }
        if (this._spinUpButtonEl) {
            this._spinUpButtonEl.destruct();
        }
        if (this._buttonsDom) {
            this._buttonsDom.destruct();
        }
        if (this._spinDownButtonEl) {
            this._spinDownButtonEl.destruct();
        }

        // Variablen (Objekte/Arrays) leeren
        this._allowedDecimalSeparators = null;
        this._allowedThousandsSeparators = null;
        this._inputDom = null;
        this._buttonsDom = null;
        this._spinUpButtonEl = null;
        this._spinDownButtonEl = null;

        // Basisklasse entladen
        super.destruct(true);
    }

};
