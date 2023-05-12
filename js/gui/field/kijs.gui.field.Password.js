/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.field.Password
// --------------------------------------------------------------
kijs.gui.field.Password = class kijs_gui_field_Password extends kijs.gui.field.Field {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        this._disableBrowserSecurityWarning = false;
        this._passwordChar = '●';
        this._valueTrimEnable = false;
        this._previousChangeValue = '';

        this._value = '';

        this._inputDom = new kijs.gui.Dom({
            nodeTagName: 'input',
            nodeAttribute: {
                id: this._inputId,
                type: 'password',
                autocomplete: 'off'
            },
            on: {
                change: this.#onInputDomChange,
                input: this.#onInputDomInput,
                context: this
            }
        });

        this._dom.clsAdd('kijs-field-password');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            disableBrowserSecurityWarning: false
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            disableBrowserSecurityWarning: { prio: -1, target: 'disableBrowserSecurityWarning' },  // false: Nimmt das Standard Passwort-Feld
                                                                    // true:  Eigenes Feld, dass nicht als Kennwort-Feld erkannt wird und
                                                                    //        deshalb auch keine Warnung bei unsicherer Verbindung ausgibt
                                                                    // 'auto' bei unsicherer Verbindung && Firefox = true sonst false
            passwordChar: true,
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
    get disableBrowserSecurityWarning() { return this._disableBrowserSecurityWarning; }
    set disableBrowserSecurityWarning(val) {
        if (val === 'auto') {
            val = kijs.Navigator.isFirefox && window.isSecureContext === false;
        }

        // Evtl. eigenes Passwort-Feld ohne Sicherheitswarnung erstellen
        if (val) {
            this._inputDom.nodeAttributeSet('type', 'text');

            // DOM-Events
            this._inputDom.on('keyUp', this.#onInputDomKeyUp, this);
            this._inputDom.on('mouseUp', this.#onInputDomMouseUp, this);
        } else {
            this._inputDom.nodeAttributeSet('type', 'password');

            // DOM-Events
            this._inputDom.off('keyUp', this.#onInputDomKeyUp, this);
            this._inputDom.off('mouseUp', this.#onInputDomMouseUp, this);

        }

        this._disableBrowserSecurityWarning = !!val;
    }

    // overwrite
    get hasFocus() { return this._inputDom.hasFocus; }

    get inputDom() { return this._inputDom; }

    // overwrite
    get isEmpty() { return kijs.isEmpty(this.value); }

    get passwordChar() { return this._passwordChar; }
    set passwordChar(val) { this._passwordChar = val; }

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
        let val;

        if (this._disableBrowserSecurityWarning) {
            val = this._value;
        } else {
            val = kijs.toString(this._inputDom.nodeAttributeGet('value'));
        }
        if (this._valueTrimEnable) {
            val = val.trim();
        }
        return val;
    }
    set value(val) {
        val = kijs.toString(val);
        if (this._disableBrowserSecurityWarning) {
            this._value = val;
            this._inputDom.nodeAttributeSet('value', val.replace(/./g, this._passwordChar));
        } else {
            this._inputDom.nodeAttributeSet('value', val);
        }
        this._previousChangeValue = val;
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
    // Stellt sicher, dass der Cursor nur ans Feldende gesetzt oder alles markiert werden kann
    _reposCursor() {
        const val = this._inputDom.node.value;
        const len = val.length;

        if (this._inputDom.node.selectionStart===0 && this._inputDom.node.selectionEnd===len)  {
            // alles ist markiert: ok
        } else if (this._inputDom.node.selectionStart===len && this._inputDom.node.selectionEnd===len)  {
            // cursor ist am Ende: ok
        } else {
            // sonst alles markieren
            this._inputDom.node.selectionStart = 0;
            this._inputDom.node.selectionEnd = len;
        }
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
            this.raiseEvent('change', { oldValue: oldVal, value: val } );
        }
    }

    #onInputDomInput(e) {
        if (this._disableBrowserSecurityWarning) {
            const val = kijs.toString(this._inputDom.nodeAttributeGet('value'));
            const len = val.length;

            this._value = kijs.isEmpty(this._value) ? '' : this._value;

            // Neue Zeichen ermittteln
            var newChars = kijs.String.replaceAll(val, this._passwordChar, '');

            // Ist das Feld nun leer?
            if (val === '') {
                this._value = '';

            // Sonst: Wenn das erste Zeichen neu ist, so ist der ganze Wert neu
            } else if (val.substr(0,1) !== this._passwordChar) {
                this._value = newChars;

            // Sonst: Wenn das letzte Zeichen neu ist, so bleibt der Anfang evtl. bestehen
            // und die neuen Zeichen werden am Ende angefügt
            } else if (val.substr(len-1,1) !== this._passwordChar) {
                // alte Zeichen bleiben bestehen
                const oldChars = this._value.substr(0, len - newChars.length);
                this._value = oldChars + newChars;

            // Oder wurde mit Backspace das letzte Zeichen gelöscht?
            } else if (len < this._value.length) {
                this._value = this._value.substr(0, len);

            }

            this._inputDom.nodeAttributeSet('value', this._value.replace(/./g, this._passwordChar));
        }

        this.validate();
    }

    #onInputDomKeyUp(e) {
        this._reposCursor();
    }

    #onInputDomMouseUp(e) {
        kijs.defer(this._reposCursor, 10, this);
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
