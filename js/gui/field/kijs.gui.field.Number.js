/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.field.Number
// --------------------------------------------------------------
/**
 * Zahlenfeld mit Buttons zum Hoch- und Runterzählen (gedrückt halten zählt beschleunigt weiter).
 * Beim Verlassen des Felds wird die Zahl gerundet und formatiert (Dezimal- und
 * Tausendertrennzeichen). Validiert werden gültige Zahl, minValue und maxValue.
 *
 * @example
 * new kijs.gui.field.Number({ label: 'Betrag', allowDecimals: true, alwaysDisplayDecimals: true,
 *     thousandsSeparator: "'", minValue: 0 });
 *
 * @fires blur  Weitergeleitet vom input-Node
 * @fires change  Nach dem Verlassen des Felds (DOM-Event change) bzw. nach dem Loslassen eines
 *                Spin-Buttons, wenn sich der Wert geändert hat, und nach clear(). e: oldValue, value
 * @fires input  Bei jeder Eingabe (weitergeleitet vom input-Node) und bei jedem Schritt mit den
 *               Spin-Buttons (e: value, oldValue)
 */
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
            allowedDecimalSeparators: true,     // {Array} Bei der Eingabe erlaubte Dezimaltrennzeichen. Default: ['.', ',']
            allowedThousandsSeparators: true,   // {Array} Bei der Eingabe erlaubte Tausendertrennzeichen. Default: ["'", ' ', '`', '´']
            alwaysDisplayDecimals: true,
            autocomplete: { target: 'autocomplete' },
            name: { target: 'name' },
            decimalPrecision: { target: 'decimalPrecision'},
            decimalSeparator: true,
            inputMode: { target: 'inputMode' },
            minValue: { target: 'minValue'},
            maxValue: { target: 'maxValue'},
            placeholder: { target: 'placeholder' },
            spinAcceleration: true,
            spinButtonsHide: { target: 'spinButtonsHide' },
            spinDelay: true,
            spinStep: true,
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
    /**
     * Dezimalstellen erlaubt? Sonst wird auf ganze Zahlen gerundet. Default: false
     * @type {Boolean}
     */
    get allowDecimals() { return this._allowDecimals; }
    set allowDecimals(val) { this._allowDecimals = !!val; }

    /**
     * Immer decimalPrecision Dezimalstellen anzeigen (z.B. 5.00)? Default: false
     * @type {Boolean}
     */
    get alwaysDisplayDecimals() { return this._alwaysDisplayDecimals; }
    set alwaysDisplayDecimals(val) {
        this._alwaysDisplayDecimals = !!val;
    }

    /**
     * Vorschläge des Browsers: true (Attribut 'on'), false ('off') oder ein Wert für das
     * Attribut autocomplete. Default: false
     * @type {Boolean|String}
     */
    get autocomplete() { return this._inputDom.nodeAttributeGet('autocomplete'); }
    set autocomplete(val) {
        let value = 'on';

        if (kijs.isString(val)) {
            value = val;
        } else if (val === false) {
            value = 'off';
        }

        // De-/aktiviert die Browser-Vorschläge
        this._inputDom.nodeAttributeSet('autocomplete', value);
    }

    /**
     * Anzahl Dezimalstellen beim Runden (nur mit allowDecimals). Ungültige Werte ergeben 2. Default: 2
     * @type {Number}
     */
    get decimalPrecision() { return this._decimalPrecision; }
    set decimalPrecision(val) {
        this._decimalPrecision = kijs.isNumeric(val) ? parseInt(val) : 2;
    }

    /**
     * Dezimaltrennzeichen in der Anzeige. Default: '.'
     * @type {String}
     */
    get decimalSeparator() { return this._decimalSeparator; }
    set decimalSeparator(val) {
        this._decimalSeparator = val;
    }

    /**
     * Hat der input-Node den Fokus?
     * @type {Boolean}
     */
    // overwrite
    get hasFocus() { return this._inputDom.hasFocus; }

    /**
     * kijs.gui.Dom des input-Nodes
     * @type {kijs.gui.Dom}
     */
    // overwrite
    get inputDom() { return this._inputDom; }

    /**
     * Attribut inputmode des input-Nodes (virtuelle Tastatur). Default: 'decimal'
     * @type {String}
     */
    get inputMode() { return this._inputDom.nodeAttributeGet('inputMode'); }
    set inputMode(val) { this._inputDom.nodeAttributeSet('inputMode', val); }

    /**
     * Ist der Wert leer?
     * @type {Boolean}
     */
    // overwrite
    get isEmpty() { return kijs.isEmpty(this.value); }

    /**
     * Grösster erlaubter Wert (Validierung, Grenze beim Hochzählen)
     * @type {Number|null}
     */
    get maxValue() { return this._maxValue; }
    set maxValue(val) {
        this._maxValue = val === null ? null : parseFloat(val);
    }

    /**
     * Kleinster erlaubter Wert (Validierung, Grenze beim Runterzählen)
     * @type {Number|null}
     */
    get minValue() { return this._minValue; }
    set minValue(val) {
        this._minValue = val === null ? null : parseFloat(val);
    }

    /**
     * Name des Felds. Wird auch als Attribut name des input-Nodes gesetzt.
     * @type {String|null}
     */
    // overwrite
    get name() { return this._name; }
    set name(val) {
        super.name = val;
        this._inputDom.nodeAttributeSet('name', kijs.toString(val));
    }

    /**
     * Platzhalter-Text im leeren Feld. Zurzeit gibt der Getter immer undefined zurück (fehlendes return).
     * @type {String}
     */
    get placeholder() { this._inputDom.nodeAttributeGet('placeholder'); }
    set placeholder(val) { this._inputDom.nodeAttributeSet('placeholder', kijs.toString(val)); }

    /**
     * Schreibgeschützt. Setzt auch readOnly beim input-Node und deaktiviert die Spin-Buttons.
     * @type {Boolean}
     */
    // overwrite
    get readOnly() { return super.readOnly; }
    set readOnly(val) {
        super.readOnly = !!val;
        this._inputDom.nodeAttributeSet('readOnly', !!val);
        this._spinUpButtonEl.disabled = val;
        this._spinDownButtonEl.disabled = val;
    }

    /**
     * Beschleunigung beim gedrückt gehaltenen Spin-Button: um so viel Prozent wird der Abstand
     * pro Schritt kleiner (mindestens 10 ms). Default: 20
     * @type {Number}
     */
    get spinAcceleration() { return this._spinAcceleration; }
    set spinAcceleration(val) { this._spinAcceleration = val; }

    /**
     * Spin-Buttons ausblenden?
     * @type {Boolean}
     */
    get spinButtonsHide() { return !this._spinUpButtonEl.visible; }
    set spinButtonsHide(val) { 
        this._spinUpButtonEl.visible = !val;
        this._spinDownButtonEl.visible = !val;
    }

    /**
     * Abstand in ms zwischen den ersten Schritten beim gedrückt gehaltenen Spin-Button. Default: 400
     * @type {Number}
     */
    get spinDelay() { return this._spinDelay; }
    set spinDelay(val) { this._spinDelay = val; }

    /**
     * Button zum Runterzählen
     * @type {kijs.gui.Button}
     */
    get spinDownButton() { return this._spinDownButtonEl; }

    /**
     * Schrittweite der Spin-Buttons. Default: 1
     * @type {Number}
     */
    get spinStep() { return this._spinStep; }
    set spinStep(val) { this._spinStep = val; }

    /**
     * Button zum Hochzählen
     * @type {kijs.gui.Button}
     */
    get spinUpButton() { return this._spinUpButtonEl; }

    /**
     * Tausendertrennzeichen in der Anzeige. Default: '' (keines)
     * @type {String}
     */
    get thousandsSeparator() { return this._thousandsSeparator; }
    set thousandsSeparator(val) {
        this._thousandsSeparator = val;
    }

    /**
     * Wert als String ohne Formatierung mit '.' als Dezimaltrennzeichen, z.B. '1234.5'.
     * Leer = null. Beim Zuweisen wird eine gültige Zahl gerundet und formatiert angezeigt.
     * @type {String|null}
     */
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
        this._updateClearButtonVisibility();
    }

    /**
     * Bestimmt, ob beim Fokus die virtuelle Tastatur geöffnet wird ('auto', Default)
     * oder nicht ('manual'). Nur auf Mobilgeräten mit Chrome.
     * @type {String}
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
     * Setzt den Fokus auf den input-Node. Optional wird der Text markiert.
     * @param {Boolean} [alsoSetIfNoTabIndex=false]  siehe kijs.gui.Dom.focus
     * @param {Boolean} [selectText=false]           Text markieren?
     * @returns {HTMLElement|null|false}
     */
    // overwrite
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
        this._buttonsDom.renderTo(this._contentDom.node, this._innerDom.node, 'before');

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
    /**
     * Rundet und formatiert eine Zahl für die Anzeige. Ungültige Zahlen werden unverändert
     * (ohne Formatierung) zurückgegeben.
     * @param {Number|String} value
     * @returns {String}
     */
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

    /**
     * Zählt einen Schritt hoch oder runter (begrenzt auf minValue und maxValue), löst input aus
     * und wiederholt das beschleunigt bis _spinStop()
     * @param {String} dir  'up' oder 'down'
     * @returns {undefined}
     */
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

    /**
     * Stoppt das Zählen und löst change aus, falls sich der Wert geändert hat
     * @returns {undefined}
     */
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

    /**
     * Entfernt die Formatierung: Tausendertrennzeichen weg, Dezimaltrennzeichen wird '.'
     * (nach allowedThousandsSeparators und allowedDecimalSeparators)
     * @param {*} value
     * @returns {String}
     */
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
        // Beim Verlassen des Feldes, Zahl auf eingestelltes Format ändern.
        // Wenn Nummer ungültig, die Nummer belassen
        let val = this.value;
        let oldVal = this._previousChangeValue;

        // Wert neu reinschreiben (evtl. wurde er formatiert)
        this.value = val;
        
        // und das change event auslösen
        if (val !== oldVal) {
            this.raiseEvent('change', { oldValue: oldVal, value: val } );
        }
    }

    #onInputDomInput(e) {
        this.validate();
        this._updateClearButtonVisibility();
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
