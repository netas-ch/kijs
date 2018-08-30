/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.field.Combo
// --------------------------------------------------------------
// TODO: Icons in Combo
// TODO: autoComplete
// TODO: remoteCombo, localCombo
kijs.gui.field.Combo = class kijs_gui_field_Combo extends kijs.gui.field.Field {
    
    
    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);
        
        this._captionField = null;
        this._optionCaptionDisplayType = null;
        this._valueField = null;
        this._data = [];
        this._value = null;
        
        this._inputDom = new kijs.gui.Dom({
            disableEnterEscBubbeling: true,
            nodeTagName: 'select',
            nodeAttribute: {
                id: this._inputId
            }
        });
        
        this._dom.clsAdd('kijs-field-combo');
       
       // Standard-config-Eigenschaften mergen
        config = Object.assign({}, {
            captionField: 'caption',
            optionCaptionDisplayType : 'code',      // Darstellung der captions. Default: 'html'
                                                    // html: als html-Inhalt (innerHtml)
                                                    // code: Tags werden als als Text angezeigt
                                                    // text: Tags werden entfernt
            size: 1,
            valueField: 'value'
        }, config);
        
       // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            captionField: true,
            data: { target: 'data' },
            multiselect: { target: 'multiselect' },
            optionCaptionDisplayType: true,
            size: { target: 'size' },
            valueField: true
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
    get captionField() { return this._captionField; }
    set captionField(val) { this._captionField = val; }

    get valueField() { return this._valueField; }
    set valueField(val) { this._valueField = val; }

    get data() { return this._data; }
    set data(val) { 
        this._data = val;
        
        if (this._inputDom.isRendered) {
            
            // Bestehende Elemente löschen
            kijs.Dom.removeAllChildNodes(this._inputDom.node);
            
            // Neue Elemente einfügen
            kijs.Array.each(this._data, function(row) {
                const opt = document.createElement('option');
                kijs.Dom.setInnerHtml(opt, row[this._captionField], this._optionCaptionDisplayType);
                opt.value = row[this._valueField];
                this._inputDom.node.appendChild(opt);
            }, this);
        }
    }
    
    
    // overwrite
    get disabled() { return super.disabled; }
    set disabled(val) {
        super.disabled = !!val;
        if (val || this._dom.clsHas('kijs-readonly')) {
            this._inputDom.nodeAttributeSet('disabled', true);  // (readOnly gibts leider nicht bei select-tags)
        } else {
            this._inputDom.nodeAttributeSet('disabled', false);
        }
    }
    
    // overwrite
    get isEmpty() { return kijs.isEmpty(this._inputDom.value); }

    get inputDom() { return this._inputDom; }
    
    get multiselect() { return !!this._inputDom.nodeAttributeGet('multiple'); }
    set multiselect(val) { this._inputDom.nodeAttributeSet('multiple', !!val); }
    
    // overwrite
    get readOnly() { return super.readOnly; }
    set readOnly(val) {
        super.readOnly = !!val;
        if (val || this._dom.clsHas('kijs-disabled')) {
            this._inputDom.nodeAttributeSet('disabled', true);  // (readOnly gibts leider nicht bei select-tags)
        } else {
            this._inputDom.nodeAttributeSet('disabled', false);
        }
    }
    
    get size() { return this._inputDom.nodeAttributeGet('size'); }
    set size(val) { this._inputDom.nodeAttributeSet('size', val); }
    
    // overwrite
    get value() { 
        return this._inputDom.nodeAttributeGet('value');
    }
    set value(val) {
        this._value = val;
        this._inputDom.nodeAttributeSet('value', val);
    }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // overwrite
    render(preventAfterRender) {
        super.render(true);
        
        // Input rendern (kijs.guiDom)
        this._inputDom.renderTo(this._inputWrapperDom.node);

        // Event afterRender auslösen
        if (!preventAfterRender) {
            this.raiseEvent('afterRender');
        }
        
        if (this._data) {
            this.data = this._data;
        }
        
        if (!kijs.isEmpty(this._value)) {
            this.value = this._value;
        }
    }


    // overwrite
    unRender() {
        this._inputDom.unRender();
        super.unRender();
    }


    // LISTENERS
    _onInput(e) {
        this._value = this.value;
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
            
        // Variablen (Objekte/Arrays) leeren
        this._data = null;
        this._inputDom = null;

        // Basisklasse entladen
        super.destruct(true);
    }

};