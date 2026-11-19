/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.field.Color
// --------------------------------------------------------------
/**
 * Farbfeld mit der Farbauswahl des Browsers (HTML input type="color"). Der Wert ist eine
 * Farbe als Hex-Code in Kleinbuchstaben, z.B. '#ff8800'. Weil das Feld des Browsers nicht leer
 * sein kann, gilt ohne Wert '#ffffff'.
 *
 * @example
 * new kijs.gui.field.Color({ label: 'Farbe', name: 'farbe', value: '#ff8800' });
 *
 * @fires blur  Weitergeleitet vom input-Node
 * @fires change  Nach einer Änderung durch den Benutzer (DOM-Event change) und nach clear().
 *                e: oldValue (Wert vor der Änderung), value
 * @fires input  Bei jeder Änderung in der Farbauswahl (weitergeleitet vom input-Node)
 */
kijs.gui.field.Color = class kijs_gui_field_Color extends kijs.gui.field.Field {


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

        this._previousChangeValue = '';
        this._defaultColor = '#ffffff'; // Standardfarbe, wenn leer.
                                        // Weil das native Color-Field kann nicht leer sein.

        this._inputDom = new kijs.gui.Dom({
            nodeTagName: 'input',
            nodeAttribute: {
                type: 'color',
                id: this._inputId,
                value: this._defaultColor
            },
            on: {
                change: this.#onInputDomChange,
                input: this.#onInputDomInput,
                context: this
            }
        });

        this._dom.clsAdd('kijs-field-color');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            clearButtonCls: '',
            autocomplete: false,
            disableFlex: true
        });

       // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            autocomplete: { target: 'autocomplete' },
            name: { target: 'name' }
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
     * Ist der Wert leer? Weil ohne Wert '#ffffff' gilt, praktisch immer false.
     * @type {Boolean}
     */
    // overwrite
    get isEmpty() { return kijs.isEmpty(this.value); }

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
     * Schreibgeschützt. Weil input type="color" kein Attribut readOnly kennt, wird der
     * input-Node dafür deaktiviert.
     * @type {Boolean}
     */
    // overwrite
    get readOnly() { return super.readOnly; }
    set readOnly(val) {
        super.readOnly = !!val;
        this._inputDom.disabled = val || this._dom.clsHas('kijs-disabled');
    }

    /**
     * Farbe als Hex-Code in Kleinbuchstaben, z.B. '#ff8800'. Der Setter akzeptiert alle Formate,
     * die kijs.Graphic.colorGetHex() kennt. Leer = '#ffffff'.
     * @type {String}
     */
    // overwrite
    get value() {
        let val = this._inputDom.nodeAttributeGet('value');
        return kijs.toString(val).toLowerCase();
    }
    set value(val) {
        val = kijs.toString(val);

        if (kijs.isEmpty(val)) {
            val = this._defaultColor;
        } else {
            val = kijs.Graphic.colorGetHex(val);
        }

        // Kleinbuchstaben wie beim Getter, damit der Vergleich beim change stimmt
        val = val.toLowerCase();

        this._inputDom.nodeAttributeSet('value', val);
        this._previousChangeValue = val;
        this._updateClearButtonVisibility();
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
        super.render(true);

        // Input rendern (kijs.guiDom)
        this._inputDom.renderTo(this._inputWrapperDom.node);

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
        super.unrender(true);
    }


    // PRIVATE
    // LISTENERS
    #onInputDomChange(e) {
        // Sicherstellen, dass beim Verlassen des Feldes noch getrimmt wird.
        let val = this.value;
        let oldVal = this._previousChangeValue;

        // und das change event auslösen
        if (val !== oldVal) {
            this._previousChangeValue = val;
            this.raiseEvent('change', { oldValue: oldVal, value: val } );
        }
    }

    #onInputDomInput(e) {
        this.validate();
        this._updateClearButtonVisibility();
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

        // Variablen (Objekte/Arrays) leeren
        this._inputDom = null;

        // Basisklasse entladen
        super.destruct(true);
    }

};
