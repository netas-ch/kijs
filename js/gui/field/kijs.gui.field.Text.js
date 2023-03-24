/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.field.Text
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
kijs.gui.field.Text = class kijs_gui_field_Text extends kijs.gui.field.Field {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        this._inputDom = new kijs.gui.Dom({
            nodeTagName: 'input',
            nodeAttribute: {
                id: this._inputId
            }
        });
        
        this._formatRegExps = [];
        
        this._valueTrim = true;

        this._dom.clsAdd('kijs-field-text');

       // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            formatRegExp: { fn: 'function', target: this.addFormatRegExp, context: this },
            valueTrim: true,             // Sollen Leerzeichen am Anfang und Ende des Values automatisch entfernt werden?
            placeholder: { target: 'placeholder' }
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
        this.on('input', this.#onInput, this);

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }
    }



    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get inputDom() { return this._inputDom; }

    // overwrite
    get isEmpty() { return kijs.isEmpty(this.value); }

    get placeholder() { this._inputDom.nodeAttributeGet('placeholder'); }
    set placeholder(val) { this._inputDom.nodeAttributeSet('placeholder', kijs.toString(val)); }

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

    get validateRegExp() { return this._validateRegExp; }
    set validateRegExp(val) {
        if (kijs.isRegExp(val)) {
            this._validateRegExp = val.toString();
        } else if (kijs.isString(val)) {
            this._validateRegExp = val;
        } else {
            throw new kijs.Error(`config "validateRegExp" is not valid.`);
        }
    }

    // overwrite
    get value() {
        let val = this._inputDom.nodeAttributeGet('value');
        if (this._valueTrim && kijs.isString(val)) {
            val = val.trim();
        }
        return val === null ? '' : val;
    }
    set value(val) {
        this._inputDom.nodeAttributeSet('value', kijs.toString(val));
        this.validate();
    }

    get valueTrim() { return this._valueTrim; }
    set valueTrim(val) { this._valueTrim = !!val; }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // overwrite
    changeDisabled(val, callFromParent) {
        super.changeDisabled(val, callFromParent);
        this._inputDom.disabled = !!val;
    }
    
    /**
     * Fügt einen oder mehrere regulären Ausdruck (replace) zum Formatieren hinzu
     * @param {Object|Array} regExps 
     *                       Beispiel: { regExp: '/([0-9]{3})([0-9]{3})/', replace: '$1 $2'  }
     *                       Wenn das literal /g vorhanden ist, wird replaceAll ausgeführt,
     *                       sonst replace() 
     * @returns {undefined}
     */
    addFormatRegExp(regExps) {
        if (!kijs.isArray(regExps)) {
            regExps = [regExps];
        }
        
        kijs.Array.each(regExps, function(regExp) {
            let ok = true;
            
            if (typeof regExp !== 'object') {
                ok = false;
            }

            if (ok) {
                if (kijs.isRegExp(regExp.regExp)) {
                    regExp.regExp = regExp.regExp.toString();
                } else if (!kijs.isString(regExp.regExp)) {
                    ok = false;
                }
            }
            
            if (!kijs.isString(regExp.replace)) {
                ok = false;
            }

            if (ok) {
                this._formatRegExps.push(regExp);
            } else {
                throw new kijs.Error(`"formatRegExp" is not valid.`);
            }
        }, this);
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
    
    
    // PROTECTED
    _applyFormatRegExp(value) {
        if (this._formatRegExps) {
            value = value.toString();
            if (value !== '') {
                kijs.Array.each(this._formatRegExps, function(regExp) {
                    let r = this._stringToRegExp(regExp.regExp);

                    // Wenn das literal /g vorhanden ist, wird replaceAll ausgeführt
                    if (kijs.String.contains(r.flags, 'g')) {
                        value = value.replaceAll(r, regExp.replace);
                    // sonst nur replace
                    } else {
                        value = value.replace(r, regExp.replace);
                    }
                }, this);
            }
        }
        return value;
    }
    
    
    // PRIVATE
    // LISTENERS
    #onInput(e) {
        this.value = this._applyFormatRegExp(this.value);
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
        this._formatRegExps = null;
        
        // Basisklasse entladen
        super.destruct(true);
    }
    
};
