/* global kijs, this, Function */

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

        this._formatFn = null;
        this._formatFnContext = null;
        this._formatRegExps = [];
        this._valueTrimEnable = true;
        this._previousChangeValue = '';
        
        this._inputDom = new kijs.gui.Dom({
            nodeTagName: 'input',
            nodeAttribute: {
                id: this._inputId
            },
            on: {
                change: this.#onInputDomChange,
                input: this.#onInputDomInput,
                context: this
            }
        });
        
        this._dom.clsAdd('kijs-field-text');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            autocomplete: false
        });
        
       // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            autocomplete: { target: 'autocomplete' },   // De-/aktiviert die Browservorschläge
            formatFn: true,
            formatFnContext: true,
            formatRegExp: { fn: 'function', target: this.addFormatRegExp, context: this },
            inputMode: { target: 'inputMode' },
            valueTrimEnable: true,             // Sollen Leerzeichen am Anfang und Ende des Values automatisch entfernt werden?
            placeholder: { target: 'placeholder' }
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

    get inputMode() { return this._inputDom.nodeAttributeGet('inputMode'); }
    set inputMode(val) { this._inputDom.nodeAttributeSet('inputMode', val); }

    // overwrite
    get isEmpty() { return kijs.isEmpty(this.value); }

    get placeholder() { this._inputDom.nodeAttributeGet('placeholder'); }
    set placeholder(val) { this._inputDom.nodeAttributeSet('placeholder', kijs.toString(val)); }

    // overwrite
    get readOnly() { return super.readOnly; }
    set readOnly(val) {
        super.readOnly = !!val;
        this._inputDom.nodeAttributeSet('readOnly', !!val);
    }
    
    // overwrite
    get value() {
        let val = kijs.toString(this._inputDom.nodeAttributeGet('value'));
        if (this._valueTrimEnable) {
            val = val.trim();
        }
        return val;
    }
    set value(val) {
        val = kijs.toString(val);
        val = this._formatRules(val, false);
        this._inputDom.nodeAttributeSet('value', val);
        this._previousChangeValue = val;
        this._isDirty = false;
    }

    get valueTrimEnable() { return this._valueTrimEnable; }
    set valueTrimEnable(val) { this._valueTrimEnable = !!val; }

    /**
     * Die virtual keyboard policy bestimmt, ob beim focus die virtuelle
     * Tastatur geöffnet wird ('auto', default) oder nicht ('manual'). (Nur Mobile, Chrome)
     */
    get virtualKeyboardPolicy() { return this._inputDom.nodeAttributeGet('virtualKeyboardPolicy'); }
    set virtualKeyboardPolicy(val) { this._inputDom.nodeAttributeSet('virtualKeyboardPolicy', val); }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
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
            
            if (ok) {
                if (kijs.isString(regExp.replace) && (regExp.toUpperCase || regExp.toLowerCase)) {
                    throw new kijs.Error(`"formatRegExp" must not have a "toUpperCase" or "toLowerCase" and a "replace" at the same time.`);
                } else if (!kijs.isString(regExp.replace) && !regExp.toUpperCase && !regExp.toLowerCase) {
                    ok = false;
                }
            }
            
            if (ok) {
                this._formatRegExps.push(regExp);
            } else {
                throw new kijs.Error(`"formatRegExp" is not valid.`);
            }
        }, this);
    }
    
    // overwrite
    changeDisabled(val, callFromParent) {
        super.changeDisabled(!!val, callFromParent);
        this._inputDom.changeDisabled(!!val, true);
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
    _applyReplaceRegExps(regExps, value) {
        if (!kijs.isEmpty(regExps)) {
            value = value.toString();
            if (value !== '') {
                kijs.Array.each(regExps, function(regExp) {
                    let r = this._stringToRegExp(regExp.regExp);
                    
                    // in Grossbuchstaben umwandeln
                    if (regExp.toUpperCase) {
                        // Wenn das literal /g vorhanden ist, wird replaceAll ausgeführt
                        if (kijs.String.contains(r.flags, 'g')) {
                            value = value.replaceAll(r, function(v) { return v.toUpperCase(); });
                        // sonst nur replace
                        } else {
                            value = value.replace(r, function(v) { return v.toUpperCase(); });
                        }
                        
                    // oder in Kleinbuchstaben umwandeln
                    } else if (regExp.toUpperCase) {
                        // Wenn das literal /g vorhanden ist, wird replaceAll ausgeführt
                        if (kijs.String.contains(r.flags, 'g')) {
                            value = value.replaceAll(r, function(v) { return v.toLowerCase(); });
                        // sonst nur replace
                        } else {
                            value = value.replace(r, function(v) { return v.toLowerCase(); });
                        }
                        
                    // oder durch String ersetzen
                    } else {
                        // Wenn das literal /g vorhanden ist, wird replaceAll ausgeführt
                        if (kijs.String.contains(r.flags, 'g')) {
                            value = value.replaceAll(r, regExp.replace);
                        // sonst nur replace
                        } else {
                            value = value.replace(r, regExp.replace);
                        }
                        
                    }
                }, this);
            }
        }
        return value;
    }
    
    /**
     * Diese Funktion ist zum Überschreiben gedacht
     * @param {String} value
     * @param {Boolean} whileTyping Wird während der Eingabe formatiert (input) oder definitiv (change oder set value)
     * @returns {undefined}
     */
    _formatRules(value, whileTyping) {
        // formatRegExps
        if (!kijs.isEmpty(this._formatRegExps)) {
            value = this._applyReplaceRegExps(this._formatRegExps, value);
        }
        
        // formatFn
        if (kijs.isFunction(this._formatFn)) {
            if (value !== null && value.toString() !== '') {
                value = this._formatFn.call(this._formatFnContext || this, value, !!whileTyping);
            }
        }
        
        return value;
    }

    
    // PRIVATE
    // LISTENERS
    #onInputDomChange(e) {
        // Sicherstellen, dass beim Verlassen des Feldes noch getrimmt wird.
        let val = this.value;
        let oldVal = this._previousChangeValue;
        
        // Wert neu reinschreiben (evtl. wurde er getrimmt)
        this.value = val;
        
        // und das change event auslösen
        if (val !== oldVal) {
            this._isDirty = true;
            this.raiseEvent('change', { oldValue: oldVal, value: val } );
        }
    }
    
    #onInputDomInput(e) {
        let val = kijs.toString(this._inputDom.nodeAttributeGet('value'));
        val = this._formatRules(val, true);
        this._inputDom.nodeAttributeSet('value', val);
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
        this._formatFn = null;
        this._formatFnContext = null;
        this._formatRegExps = null;
        
        // Basisklasse entladen
        super.destruct(true);
    }
    
};
