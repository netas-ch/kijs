/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.field.Color
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
kijs.gui.field.Color = class kijs_gui_field_Color extends kijs.gui.field.Field {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        this._previousChangeValue = '';
        this._defaultColor = '#ffffff'; // Standardfarbe wenn leer.
                                        // Weil das native Color-Field kann nicht leer sein.

        this._inputDom = new kijs.gui.Dom({
            nodeTagName: 'input',
            nodeAttribute: {
                type: 'color',
                id: this._inputId
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
            autocomplete: false,
            disableFlex: true
        });

       // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            autocomplete: { target: 'autocomplete' }   // De-/aktiviert die Browservorschläge
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

    // overwrite
    get hasFocus() { return this._inputDom.hasFocus; }

    get inputDom() { return this._inputDom; }

    // overwrite
    get isEmpty() { return kijs.isEmpty(this.value); }

    // overwrite
    get readOnly() { return super.readOnly; }
    set readOnly(val) {
        super.readOnly = !!val;
        this._inputDom.disabled = val || this._dom.clsHas('kijs-disabled');
    }

    // overwrite
    get value() {
        let val = this._inputDom.nodeAttributeGet('value');
        return val === null ? '' : val;
    }
    set value(val) {
        val = kijs.toString(val);

        if (kijs.isEmpty(val)) {
            val = this._defaultColor;
        } else {
            val = kijs.Graphic.colorGetHex(val);
        }

        this._inputDom.nodeAttributeSet('value', val);
        this._previousChangeValue = val;
    }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // overwrite
    changeDisabled(val, callFromParent) {
        super.changeDisabled(!!val, callFromParent);
        this._inputDom.changeDisabled(!!val || this._dom.clsHas('kijs-readonly'), false);
    }

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
            this.raiseEvent('change', { oldValue: oldVal, value: val } );
        }
    }

    #onInputDomInput(e) {
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

        // Variablen (Objekte/Arrays) leeren
        this._inputDom = null;

        // Basisklasse entladen
        super.destruct(true);
    }

};
