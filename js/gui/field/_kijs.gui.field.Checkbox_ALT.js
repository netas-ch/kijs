/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.field.Checkbox
// --------------------------------------------------------------
kijs.gui.field.Checkbox = class kijs_gui_field_Checkbox extends kijs.gui.field.Field {
    

    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);
        
        this._captionHide = false;
        this._valueChecked = true;
        this._valueUnchecked = false;
    
        this._inputDom = new kijs.gui.Dom({
            disableEnterEscBubbeling: true,
            nodeTagName: 'input',
            nodeAttribute: {
                id: this._inputId,
                type: 'checkbox'
            }
        });
        
        this._captionDom = new kijs.gui.Dom({
            cls: 'kijs-caption',
            nodeTagName: 'label',
            nodeAttribute: {
                htmlFor: this._inputId
            }
        });
        
        this._dom.clsAdd('kijs-field-checkbox');
       
        // Standard-config-Eigenschaften mergen
        config = Object.assign({}, {
            valueChecked: true,         // Wert, wenn angehäckelt
            valueUnchecked : false      // Wert, wenn nicht angehäckelt
        }, config);
        
        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            caption: { target: 'html', context: this._captionDom },
            captionCls: { fn: 'function', target: this._captionDom.clsAdd, context: this._captionDom },
            captionHide: true,
            captionHtmlDisplayType: { target: 'htmlDisplayType', context: this._captionDom },
            captionStyle: { fn: 'assign', target: 'style', context: this._captionDom },
            captionWidth: { target: 'captionWidth' },

            valueChecked: true,
            valueUnchecked: true
        });
        
        // Event-Weiterleitungen von this._inputDom
        this._eventForwardsAdd('input', this._inputDom);
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
    get caption() { return this._captionDom.html; }
    set caption(val) { 
        this._captionDom.html = val; 
    }
    
    get captionHide() { return this._captionHide; }
    set captionHide(val) { 
        this._captionHide = val;
        if (this.isRendered) {
            if (val) {
                this._captionDom.renderTo(this._inputWrapperDom.node, this._inputDom.node);
            } else {
                this._captionDom.unRender();
            }
        }
    }
    
    get captionDom() { return this._captionDom; }
    
    get captionHtmlDisplayType() { return this._captionDom.htmlDisplayType; }
    set captionHtmlDisplayType(val) { this._captionDom.htmlDisplayType = val; }
    
    get captionWidth() { return this._captionDom.width; }
    set captionWidth(val) { this._captionDom.width = val; }
    
    // overwrite
    get disabled() { return super.disabled; }
    set disabled(val) {
        super.disabled = !!val;
        if (val || this._dom.clsHas('kijs-readonly')) {
            this._inputDom.nodeAttributeSet('disabled', true);
        } else {
            this._inputDom.nodeAttributeSet('disabled', false);
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
            this._inputDom.nodeAttributeSet('disabled', true);
        } else {
            this._inputDom.nodeAttributeSet('disabled', false);
        }
    }
    
    // overwrite
    get value() { return this._inputDom.nodeAttributeGet('checked') ? this._valueChecked : this._valueUnchecked; }
    set value(val) { 
        this._inputDom.nodeAttributeSet('checked', !!val);
    }

    get valueChecked() { return this._valueChecked; }
    set valueChecked(val) { this._valueChecked = val; }

    get valueChecked() { return this._valueChecked; }
    set valueUnchecked(val) { this._valueUnchecked = val; }

    
    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // overwrite
    render(preventAfterRender) {
        super.render(true);
        
        // Input rendern (kijs.guiDom)
        this._inputDom.renderTo(this._inputWrapperDom.node);
        
        // Caption rendern (kijs.guiDom)
        if (!this._captionHide) {
            this._captionDom.renderTo(this._inputWrapperDom.node);
        } else {
            this._captionDom.unRender();
        }
        
        // Event afterRender auslösen
        if (!preventAfterRender) {
            this.raiseEvent('afterRender');
        }
    }


    // overwrite
    unRender() {
        this._inputDom.unRender();
        this._captionDom.unRender();
        super.unRender();
    }


    // LISTENERS
    _onInput(e) {
        this.validate();
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
        
        if (this._captionDom) {
            this._captionDom.destruct();
        }
        
        // Variablen (Objekte/Arrays) leeren
        this._inputDom = null;
        this._captionDom = null;
        
        // Basisklasse entladen
        super.destruct(true);
    }
};