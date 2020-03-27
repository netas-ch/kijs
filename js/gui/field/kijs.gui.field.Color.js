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
    constructor(config={}) {
        super(false);

        this._inputDom = new kijs.gui.Dom({
            disableEscBubbeling: true,
            nodeTagName: 'input',
            nodeAttribute: {
                type: 'color',
                id: this._inputId
            }
        });

        this._dom.clsAdd('kijs-field-color');

       // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {

        });

        // Event-Weiterleitungen von this._inputDom
        this._eventForwardsAdd('blur', this._inputDom);
        this._eventForwardsAdd('change', this._inputDom);
        this._eventForwardsAdd('focus', this._inputDom);
        this._eventForwardsAdd('input', this._inputDom);

        this._eventForwardsRemove('enterPress', this._dom);
        this._eventForwardsRemove('enterEscPress', this._dom);
        this._eventForwardsRemove('escPress', this._dom);
        this._eventForwardsAdd('enterPress', this._inputDom);
        this._eventForwardsAdd('enterEscPress', this._inputDom);
        this._eventForwardsAdd('escPress', this._inputDom);

        // Listeners
        this.on('input', this._onInput, this);

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }
    }


    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    // overwrite
    get disabled() { return super.disabled; }
    set disabled(val) {
        super.disabled = !!val;
        if (val || this._dom.clsHas('kijs-disabled')) {
            this._inputDom.nodeAttributeSet('disabled', true);
        } else {
            this._inputDom.nodeAttributeSet('disabled', false);
        }
    }

    // overwrite
    get isEmpty() { return kijs.isEmpty(this.value); }

    get inputDom() { return this._inputDom; }



    // overwrite
    get readOnly() { return super.readOnly; }
    set readOnly(val) {
        super.readOnly = !!val;
        if (val) {
            this._inputDom.nodeAttributeSet('readOnly', true);
        } else {
            this._inputDom.nodeAttributeSet('readOnly', false);
        }
    }


    // overwrite
    get value() {
        let val = this._inputDom.nodeAttributeGet('value');
        return val === null ? '' : val;
    }
    set value(val) {
        val = this._valueToHex(val);
        this._inputDom.nodeAttributeSet('value', val);
        this.validate();
    }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------

    /**
     * Konvertiert eingaben in das Hex-Format (#FF00FF)
     * @param {String|Array} value
     * @returns {String}
     */
    _valueToHex(value) {
        // rgb-array [r, g, b]
        if (kijs.isArray(value) && value.length === 3) {
            return '#'
                + this._dec2hex(value[0])
                + this._dec2hex(value[1])
                + this._dec2hex(value[2]);


        } else if (kijs.isString(value)) {
            value = value.toUpperCase();

            // #FFF oder AAFF11
            if (value.match(/^#?([0-9A-F]{6}|[0-9A-F]{3})$/)) {
                return value.replace(/^#?([0-9A-F]{6}|[0-9A-F]{3})$/, (m, clr) => {
                    if (clr.length === 6) {
                        return '#' + clr;
                    } else {
                        return '#' + kijs.String.repeat(clr[0], 2) + kijs.String.repeat(clr[1], 2) + kijs.String.repeat(clr[2], 2);
                    }
                });
            }

            // rgb(244, 0, 244)
            if (value.match(/^\s*RGB\(\s*([0-9]+),\s*([0-9]+),\s*([0-9]+)\s*\)\s*$/)) {
                return value.replace(/^\s*RGB\(\s*([0-9]+),\s*([0-9]+),\s*([0-9]+)\s*\)\s*$/, (m, r, g, b) => {
                   return '#'
                        + this._dec2hex(r)
                        + this._dec2hex(g)
                        + this._dec2hex(b);
                });
            }
        } else {
            return '#FFFFFF';
        }
    }

    _dec2hex(dec) {
        dec = window.parseInt(dec);
        if (dec > 255) {
            dec = 255;
        }
        if (dec < 0) {
            dec = 0;
        }
        return kijs.String.padding(dec.toString(16), 2, '0', 'left');
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


    // LISTENERS
    _onInput(e) {
        this.validate();
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
