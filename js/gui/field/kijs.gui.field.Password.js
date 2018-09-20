/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.field.Password
// --------------------------------------------------------------
kijs.gui.field.Password = class kijs_gui_field_Password extends kijs.gui.field.Field {
    

    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);
        
        this._inputDom = new kijs.gui.Dom({
            disableEscBubbeling: true,
            nodeTagName: 'password',
            nodeAttribute: {
                id: this._inputId
            }
        });
        
        this._disableBrowserSecurityWarning = false;
        this._passwordChar = '•';
        this._trimValue = false;
        
        this._value = null;
        
        this._dom.clsAdd('kijs-field-password');
       
        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            disableBrowserSecurityWarning: { target: 'disableBrowserSecurityWarning' },  // false: Nimmt das Standard Passwort-Feld
                                                                    // true:  Eigenes Feld, dass nicht als Kennwort-Feld erkannt wird und 
                                                                    //        deshalb auch keine Warnung bei unsicherer Verbindung ausgibt
                                                                    // 'auto' bei unsicherer Verbindung && Firefox = true sonst false
            passwordChar: true,
            trimValue: true             // Sollen Leerzeichen am Anfang und Ende des Values automatisch entfernt werden?
        });
        
        // Event-Weiterleitungen von this._inputDom
        //this._eventForwardsAdd('input', this._inputDom);
        this._eventForwardsAdd('blur', this._inputDom);
        
        this._eventForwardsRemove('enterPress', this._dom);
        this._eventForwardsRemove('enterEscPress', this._dom);
        this._eventForwardsRemove('escPress', this._dom);
        this._eventForwardsAdd('enterPress', this._inputDom);
        this._eventForwardsAdd('enterEscPress', this._inputDom);
        this._eventForwardsAdd('escPress', this._inputDom);
        
        // Listeners
        this.on('input', this._onInput, this);
        this._inputDom.on('input', this._onDomInput, this);
        
        // Config anwenden
        if (kijs.isObject(config)) {
            this.applyConfig(config, true);
        }
    }
    
    
    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get disableBrowserSecurityWarning() { return this._disableBrowserSecurityWarning; }
    set disableBrowserSecurityWarning(val) {
        if (val === 'auto') {
            if (location.protocol !== 'https:' && kijs.isFirefox()) {
                this.disableBrowserSecurityWarning = true;
            } else {
                this.disableBrowserSecurityWarning = false;
            }
        } else {
            this._disableBrowserSecurityWarning = !!val;
        }
    }
    
    // overwrite
    get disabled() { return super.disabled; }
    set disabled(val) {
        super.disabled = !!val;
        if (val || this._dom.clsHas('kijs-readonly')) {
            this._inputDom.nodeAttributeSet('readOnly', true);
        } else {
            this._inputDom.nodeAttributeSet('readOnly', false);
        }
    }
    
    // overwrite
    get isEmpty() { return kijs.isEmpty(this._inputDom.value); }

    get inputDom() { return this._inputDom; }
    
    get passwordChar() { return this._passwordChar; }
    set passwordChar(val) { this._passwordChar = val; }
    
    // overwrite
    get readOnly() { return super.readOnly; }
    set readOnly(val) {
        super.readOnly = !!val;
        if (val || this._dom.clsHas('kijs-disabled')) {
            this._inputDom.nodeAttributeSet('readOnly', true);
        } else {
            this._inputDom.nodeAttributeSet('readOnly', false);
        }
    }
    
    get trimValue() { return this._trimValue; }
    set trimValue(val) { this._trimValue = val; }
    
    // overwrite
    get value() {
        let val;
        
        if (this._disableBrowserSecurityWarning) {
            val = this._value;
        } else {
            val = this._inputDom.nodeAttributeGet('value');
        }
        
        if (this._trimValue && kijs.isString(val)) {
            val = val.trim();
        }
        
        return val;
    }
    set value(val) {
        if (this._disableBrowserSecurityWarning) {
            let oldValue = this.value;
            
            this._value = val;
            
            this._inputDom.nodeAttributeSet('value', kijs.isEmpty(val) ? '' : val.replace(/./g, this._passwordChar));
            
            if (this._value !== oldValue) {
                this.raiseEvent('change', {eventName:'change', value: val, oldValue: oldValue}, this);
            }
        } else {
            this._inputDom.nodeAttributeSet('value', val);
        }
    }
    
    
    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // overwrite
    render(preventAfterRender) {
        // Evtl. eigenes Passwort-Feld ohne Sicherheitswarnung erstellen
        if (this._disableBrowserSecurityWarning) {
            this._inputDom.nodeTagName = 'input';
            
            // DOM-Events
            this._inputDom.on('keyUp', this._onKeyUp, this);
            this._inputDom.on('mouseUp', this._onMouseUp, this);
            this._inputDom.on('input', this._onInput, this);
        }
        
        super.render(true);

        // Input rendern (kijs.guiDom)
        this._inputDom.renderTo(this._inputWrapperDom.node);

        // Event afterRender auslösen
        if (!preventAfterRender) {
            this.raiseEvent('afterRender');
        }
    }


    // overwrite
    unRender() {
        this._inputDom.unRender();
        super.unRender();
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
    

    // LISTENERS
    _onInput(e) {
        this.validate();
    }
    
    _onDomInput(e) {
        if (this._disableBrowserSecurityWarning) {
            const val = this._inputDom.node.value;
            const len = val.length;

            this._value = kijs.isEmpty(this._value) ? '' : this._value;

            // Neue Zeichen ermittteln
            var newChars = kijs.String.replaceAll(val, this._passwordChar, '');

            // Ist das Feld nun leer?
            if (val === '') {
                this.value = '';

            // Sonst: Wenn das erste Zeichen neu ist, so ist der ganze Wert neu
            } else if (val.substr(0,1) !== this._passwordChar) {
                this.value = newChars;


            // Sonst: Wenn das letzte Zeichen neu ist, so bleibt der Anfang evtl. bestehen 
            // und die neuen Zeichen werden am Ende angefügt
            } else if (val.substr(len-1,1) !== this._passwordChar) {
                // alte Zeichen bleiben bestehen
                const oldChars = this._value.substr(0, len - newChars.length);
                this.value = oldChars + newChars;

            // Oder wurde mit Backspace das letzte Zeichen gelöscht?
            } else if (len < this._value.length) {
                this.value = this._value.substr(0, len);

            }
        }
        
        // Nun noch unser Input Event auslösen
        e.eventName = 'input';
        return this.raiseEvent('input', e, this);
    }

    _onKeyUp(e) {
        this._reposCursor();
    }

    _onMouseUp(e) {
        kijs.defer(this._reposCursor, 10, this);
    }

    
    
    
    
    
    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(preventDestructEvent) {
        // Event auslösen.
        if (!preventDestructEvent) {
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
