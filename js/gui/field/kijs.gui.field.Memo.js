/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.field.Memo
// --------------------------------------------------------------
kijs.gui.field.Memo = class kijs_gui_field_Memo extends kijs.gui.field.Field {
    
    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);
        
        this._inputDom = new kijs.gui.Dom({
            disableEnterBubbeling: true,
            disableEscBubbeling: true,
            nodeTagName: 'textarea',
            nodeAttribute: {
                id: this._inputId
            }
        });
        
        this._trimValue = true;
        
        this._dom.clsAdd('kijs-field-memo');
        
        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            trimValue: true             // Sollen Leerzeichen am Anfang und Ende des Values automatisch entfernt werden?
        });
        
        // Event-Weiterleitungen von this._inputDom
        this._eventForwardsAdd('input', this._inputDom);
        this._eventForwardsAdd('change', this._inputDom);
        this._eventForwardsAdd('blur', this._inputDom);
        
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
            this.applyConfig(config, true);
        }
    }
    
    
    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    // overwrite
    get disabled() { return super.disabled; }
    set disabled(val) {
        super.disabled = val;
        if (val) {
            this._inputDom.nodeAttributeSet('readOnly', true);
        } else {
            this._inputDom.nodeAttributeSet('readOnly', false);
        }
    }
    
    // overwrite
    get isEmpty() { return kijs.isEmpty(this._inputDom.value); }

    get inputDom() { return this._inputDom; }
    
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
        let val = this._inputDom.nodeAttributeGet('value');
        if (this._trimValue && kijs.isString(val)) {
            val = val.trim();
        }
        return val;
    }
    set value(val) { 
        this._inputDom.nodeAttributeSet('value', val);
    }


    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
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
        if (!superCall) {
            // Event auslösen.
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