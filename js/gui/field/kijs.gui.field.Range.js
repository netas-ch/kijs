/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.field.Range
// --------------------------------------------------------------
/**
 * Schieberegler (HTML input type="range") für Zahlen zwischen min und max. Mit step sind auch
 * Kommazahlen möglich (z.B. step: 0.5). Mit showValue wird der aktuelle Wert neben dem Regler
 * angezeigt. Mit vertical steht der Regler senkrecht (unten min, oben max), die Länge folgt der
 * Höhe des Felds (mindestens 150px).
 *
 * Ein Schieberegler ist nie leer: Ohne value steht er in der Mitte zwischen min und max
 * (gerundet auf step), clear() setzt ihn dorthin zurück.
 *
 * @example
 * new kijs.gui.field.Range({ label: 'Lautstärke', min: 0, max: 10, value: 5, showValue: true });
 *
 * @fires blur  Weitergeleitet vom input-Node
 * @fires change  Nachdem der Benutzer den Regler losgelassen hat (DOM-Event change) und nach clear(),
 *                nur wenn sich der Wert geändert hat. e: oldValue, value
 * @fires input  Laufend beim Verschieben (weitergeleitet vom input-Node)
 */
kijs.gui.field.Range = class kijs_gui_field_Range extends kijs.gui.field.Field {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        // overwrite
        this._valuesMapping = {
            name: { valueProperty: 'value', emptyValue: null }
        };

        this._hasValue = false;             // wurde ein Wert gesetzt? Sonst steht der Regler in der Mitte
        this._previousChangeValue = null;
        this._showValue = false;

        this._inputDom = new kijs.gui.Dom({
            nodeTagName: 'input',
            nodeAttribute: {
                type: 'range',
                id: this._inputId
            },
            on: {
                change: this.#onInputDomChange,
                input: this.#onInputDomInput,
                context: this
            }
        });

        this._valueDom = new kijs.gui.Dom({
            cls: 'kijs-field-range-value',
            htmlDisplayType: 'text'
        });

        this._dom.clsAdd('kijs-field-range');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            clearButtonCls: '',
            max: 100,
            min: 0,
            step: 1
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        // min, max und step vor value, damit der Browser den Wert nicht falsch begrenzt
        Object.assign(this._configMap, {
            max: { target: 'max', prio: 100 },
            min: { target: 'min', prio: 100 },
            name: { target: 'name' },
            showValue: { target: 'showValue' },
            step: { target: 'step', prio: 100 },
            vertical: { target: 'vertical' }
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

        this._previousChangeValue = this.value;
    }



    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
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
    get inputDom() { return this._inputDom; }

    /**
     * Ein Schieberegler ist nie leer
     * @type {Boolean}
     */
    // overwrite
    get isEmpty() { return false; }

    /**
     * Grösster Wert. Default: 100
     * @type {Number}
     */
    get max() { return this._getNumberAttribute('max'); }
    set max(val) { this._setNumberAttribute('max', val); }

    /**
     * Kleinster Wert. Default: 0
     * @type {Number}
     */
    get min() { return this._getNumberAttribute('min'); }
    set min(val) { this._setNumberAttribute('min', val); }

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
     * Schreibgeschützt. Weil input type="range" kein Attribut readOnly kennt, wird der
     * input-Node dafür deaktiviert.
     * @type {Boolean}
     */
    // overwrite
    get readOnly() { return super.readOnly; }
    set readOnly(val) {
        super.readOnly = !!val;
        this._inputDom.disabled = !!val || this._dom.clsHas('kijs-disabled');
    }

    /**
     * Aktuellen Wert neben dem Regler anzeigen? Default: false
     * @type {Boolean}
     */
    get showValue() { return this._showValue; }
    set showValue(val) {
        this._showValue = !!val;
        if (this.isRendered) {
            this.render();
        }
    }

    /**
     * Schrittweite, auch Kommazahlen (z.B. 0.5). Default: 1
     * @type {Number}
     */
    get step() { return this._getNumberAttribute('step'); }
    set step(val) { this._setNumberAttribute('step', val); }

    /**
     * Wert als Zahl. Der Browser begrenzt ihn auf min bis max und rundet auf step.
     * Leer (null oder '') = Mitte zwischen min und max.
     * @type {Number}
     */
    // overwrite
    get value() { return Number(this._inputDom.nodeAttributeGet('value')); }
    set value(val) {
        if (!kijs.isEmpty(val) && isNaN(Number(val))) {
            throw new kijs.Error(`config "value" must be numeric`);
        }

        this._hasValue = !kijs.isEmpty(val);
        this._inputDom.nodeAttributeSet('value', kijs.toString(this._sanitizeValue(val)));
        this._previousChangeValue = this.value;
        this._updateValueDom();
        this._updateClearButtonVisibility();
    }

    /**
     * Regler senkrecht anzeigen (unten min, oben max)? Default: false
     * @type {Boolean}
     */
    get vertical() { return this._dom.clsHas('kijs-vertical'); }
    set vertical(val) {
        if (val) {
            this._dom.clsAdd('kijs-vertical');
        } else {
            this._dom.clsRemove('kijs-vertical');
        }
    }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    /**
     * Ändert disabled beim Feld und beim input-Node. Bei readOnly bleibt der input-Node deaktiviert.
     * @param {Boolean} val
     * @param {Boolean} [callFromParent=false]  True, wenn der Aufruf vom Elterncontainer kommt.
     * @returns {undefined}
     */
    // overwrite
    changeDisabled(val, callFromParent) {
        super.changeDisabled(!!val, callFromParent);
        this._inputDom.changeDisabled(!!val || this._dom.clsHas('kijs-readonly'), false);
    }

    /**
     * Setzt den Regler in die Mitte zwischen min und max. Löst change aus, wenn sich der Wert
     * dadurch ändert.
     * @returns {undefined}
     */
    // overwrite
    clear() {
        const oldVal = this.value;

        this.value = null;
        this.validate();

        if (this.value !== oldVal) {
            this.raiseEvent('change', { oldValue: oldVal, value: this.value } );
        }
    }

    /**
     * Setzt den Fokus auf den input-Node
     * @param {Boolean} [alsoSetIfNoTabIndex=false]  siehe kijs.gui.Dom.focus
     * @returns {HTMLElement|null|false}
     */
    // overwrite
    focus(alsoSetIfNoTabIndex) {
        return this._inputDom.focus(alsoSetIfNoTabIndex);
    }

    // overwrite
    render(superCall) {
        // Wert merken: Beim Rendern werden die Attribute in beliebiger Reihenfolge gesetzt,
        // und der Browser würde value evtl. noch mit dem alten step runden.
        const value = this.value;

        super.render(true);

        // Input rendern (kijs.gui.Dom)
        this._inputDom.renderTo(this._inputWrapperDom.node);
        this._inputDom.nodeAttributeSet('value', kijs.toString(value));

        // Wert rendern (kijs.gui.Dom)
        if (this._showValue) {
            this._updateValueDom();
            this._valueDom.renderTo(this._inputWrapperDom.node);
        } else if (this._valueDom.isRendered) {
            this._valueDom.unrender();
        }

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

        this._inputDom.unrender();
        this._valueDom.unrender();
        super.unrender(true);
    }


    // PROTECTED
    /**
     * Gibt die Anzahl Kommastellen einer Zahl zurück
     * @param {Number} number
     * @returns {Number}
     */
    _getDecimals(number) {
        const parts = kijs.toString(number).split('.');
        return parts.length > 1 ? parts[1].length : 0;
    }

    /**
     * Gibt ein Attribut des input-Nodes als Zahl zurück
     * @param {String} name
     * @returns {Number}
     */
    _getNumberAttribute(name) {
        const val = this._inputDom.nodeAttributeGet(name);

        // ohne Attribut gelten die Standardwerte des Browsers
        if (kijs.isEmpty(val) || isNaN(Number(val))) {
            return { min: 0, max: 100, step: 1 }[name];
        }
        return Number(val);
    }

    /**
     * Begrenzt einen Wert wie der Browser: auf min bis max und auf ein Vielfaches von step ab min.
     * Leer = Mitte zwischen min und max. So stimmt der Wert auch, solange das Feld nicht
     * gerendert ist.
     * @param {Number|String|null} val
     * @returns {Number}
     */
    _sanitizeValue(val) {
        const min = this.min;
        const max = Math.max(this.max, min);
        const step = this.step > 0 ? this.step : 1;

        // Anzahl Kommastellen, um Rundungsfehler (z.B. 0.30000000000000004) zu vermeiden
        const decimals = Math.max(this._getDecimals(step), this._getDecimals(min));

        val = kijs.isEmpty(val) || isNaN(Number(val)) ? min + (max - min) / 2 : Number(val);
        val = Math.min(Math.max(val, min), max);

        // auf step runden
        val = min + Math.round((val - min) / step) * step;
        if (val > max) {
            val -= step;
        }
        val = Math.max(val, min);

        return Number(val.toFixed(decimals));
    }

    /**
     * Setzt ein Attribut des input-Nodes. Der Wert muss numerisch sein.
     * Der aktuelle Wert wird danach neu begrenzt (wie im Browser).
     * @param {String} name  'min', 'max' oder 'step'
     * @param {Number|String} val
     * @returns {undefined}
     */
    _setNumberAttribute(name, val) {
        val = Number(val);
        if (isNaN(val)) {
            throw new kijs.Error(`config "${name}" must be numeric`);
        }

        this._inputDom.nodeAttributeSet(name, kijs.toString(val));

        // Wert neu begrenzen. Ist noch keiner gesetzt, steht der Regler in der Mitte.
        const current = this._hasValue ? this._inputDom.nodeAttributeGet('value') : null;
        this._inputDom.nodeAttributeSet('value', kijs.toString(this._sanitizeValue(current)));
        this._updateValueDom();
    }

    /**
     * Aktualisiert die Anzeige des Werts (showValue)
     * @returns {undefined}
     */
    _updateValueDom() {
        if (this._showValue) {
            this._valueDom.html = kijs.toString(this.value);
        }
    }


    // PRIVATE
    // LISTENERS
    #onInputDomChange() {
        const val = this.value;
        const oldVal = this._previousChangeValue;

        if (val !== oldVal) {
            this._previousChangeValue = val;
            this.raiseEvent('change', { oldValue: oldVal, value: val } );
        }
    }

    #onInputDomInput() {
        this._hasValue = true;
        this._updateValueDom();
        this.validate();
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
        if (this._valueDom) {
            this._valueDom.destruct();
        }

        // Variablen (Objekte/Arrays) leeren
        this._inputDom = null;
        this._valueDom = null;

        // Basisklasse entladen
        super.destruct(true);
    }

};
