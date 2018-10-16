/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.field.Combo
// --------------------------------------------------------------
kijs.gui.field.Combo = class kijs_gui_field_Combo extends kijs.gui.field.Field {
    
    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);
        
        this._minSelectCount = null;
        this._maxSelectCount = null;
        this._oldValue = [];
        
        this._inputDom = new kijs.gui.Dom({
            disableEscBubbeling: true,
            nodeTagName: 'input',
            nodeAttribute: {
                id: this._inputId
            }
        });
        
        this._listView = new kijs.gui.ListView({
            focusable: false
        });
        
        this._spinBoxEl = new kijs.gui.SpinBox({
            target: this,
            targetDomProperty: 'inputWrapperDom',
            ownerNodes: [this._inputWrapperDom, this._spinIconEl.dom],
            openOnInput: true,
            elements: [
                this._listView
            ]
        });
        
        this._dom.clsAdd('kijs-field-combo');
       

       // Standard-config-Eigenschaften mergen
        config = Object.assign({}, {
            spinIconVisible: true
        }, config);
        
       // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            autoLoad: { target: 'autoLoad', context: this._listView },
            
            showCheckBoxes: { target: 'showCheckBoxes', context: this._listView },
            selectType: { target: 'selectType', context: this._listView },
            
            facadeFnLoad: { target: 'facadeFnLoad', context: this._listView },
            rpc: { target: 'rpc', context: this._listView },
            
            captionField: { target: 'captionField', context: this._listView },
            iconCharField: { target: 'iconCharField', context: this._listView },
            iconClsField: { target: 'iconClsField', context: this._listView },
            iconColorField: { target: 'iconColorField', context: this._listView },
            toolTipField: { target: 'toolTipField', context: this._listView },
            valueField: { target: 'valueField', context: this._listView },
            
            minSelectCount: true,
            maxSelectCount: true,
            
            data: { prio: 1000, target: 'data', context: this._listView },
            value: { prio: 1001, target: 'value' }
        });
        
        // Event-Weiterleitungen von this._inputDom
        /*this._eventForwardsAdd('input', this._inputDom);
        this._eventForwardsAdd('blur', this._inputDom);
        
        this._eventForwardsRemove('enterPress', this._dom);
        this._eventForwardsRemove('enterEscPress', this._dom);
        this._eventForwardsRemove('escPress', this._dom);
        this._eventForwardsAdd('enterPress', this._inputDom);
        this._eventForwardsAdd('enterEscPress', this._inputDom);
        this._eventForwardsAdd('escPress', this._inputDom);*/
        
        
        
        // Listeners
        //this.on('input', this._onInput, this);
        this.on('keyDown', this._onKeyDown, this);
        this._spinBoxEl.on('click', this._onSpinBoxClick, this);
        this._listView.on('selectionChange', this._onListViewSelectionChange, this);
        
        // Config anwenden
        if (kijs.isObject(config)) {
            this.applyConfig(config, true);
        }
    }
    
    
    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get autoLoad() { return this._listView.autoLoad; }
    set autoLoad(val) { this._listView.autoLoad = val; }
    
    get captionField() { return this._listView.captionField; }
    set captionField(val) { this._listView.captionField = val; }

    get valueField() { return this._listView.valueField; }
    set valueField(val) { this._listView.valueField = val; }

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
    
    get facadeFnLoad() { return this._listView.facadeFnLoad; }
    set facadeFnLoad(val) { this._listView.facadeFnLoad = val; }

    get inputDom() { return this._inputDom; }

    // overwrite
    get isEmpty() { return kijs.isEmpty(this.value); }
    
    // overwrite
    get readOnly() { return super.readOnly; }
    set readOnly(val) {
        super.readOnly = !!val;
        this._listView.disabled = val || this._dom.clsHas('kijs-disabled');
        if (val || this._dom.clsHas('kijs-disabled')) {
            this._inputDom.nodeAttributeSet('readOnly', true);
        } else {
            this._inputDom.nodeAttributeSet('readOnly', false);
        }
    }
    
    get rpc() { return this._listView.rpc; }
    set rpc(val) { this._listView.rpc = val; }
    
    // overwrite
    get value() { return this._listView.value; }
    set value(val) { 
        this._listView.value = val;
        this._inputDom.nodeAttributeSet('value', val);
        this._oldValue = this._listView.value;
    }
    

    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    /**
     * Füllt das Combo mit Daten vom Server
     * @param {Array} args Array mit Argumenten, die an die Facade übergeben werden
     * @returns {undefined}
     */
    load(args) {
        this._listView.load(args);
    }
    
    // overwrite
    render(preventAfterRender) {
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
    // overwrite
    _validationRules(value) {

        // Eingabe erforderlich
        if (this._required) {
            if (kijs.isEmpty(value)) {
                this._errors.push('Dieses Feld darf nicht leer sein');
            }
        }

        // minSelectCount
        if (!kijs.isEmpty(this._minSelectCount)) {
            const minSelectCount = this._minSelectCount;
            
            if (kijs.isArray(value)) {
                if (value.length < minSelectCount) {
                    this._errors.push(`Min. ${minSelectCount} müssen ausgewählt werden`);
                }
            } else if (kijs.isEmpty(value) && minSelectCount > 0) {
                this._errors.push(`Min. ${minSelectCount} müssen ausgewählt werden`);
            }
        }
        
        // maxSelectCount
        if (!kijs.isEmpty(this._maxSelectCount)) {
            const maxSelectCount = this._maxSelectCount;
            
            if (kijs.isArray(value)) {
                if (value.length > maxSelectCount) {
                    this._errors.push(`Max. ${maxSelectCount} dürfen ausgewählt werden`);
                }
            } else if (!kijs.isEmpty(value) && maxSelectCount < 1) {
                this._errors.push(`Max. ${maxSelectCount} dürfen ausgewählt werden`);
            }
        }
    }
    
    
    // LISTENERS
    _onAfterFirstRenderTo(e) {
        this.load();
    }
    
    /*_onInput(e) {
        this.validate();
    }*/
    
    _onKeyDown(e) {
        this._listView.raiseEvent('keyDown', e);
    }
    
    
    _onListViewSelectionChange(e) {
        const val = this.value;

        this._value = val;
        this.raiseEvent('input', { oldValue: this._oldValue, value: val });
        this._oldValue = val;
        
        this.validate();
    }
    
    _onSpinBoxClick() {
        this._inputDom.focus();
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
        if (this._listView) {
            this._listView.destruct();
        }
            
        // Variablen (Objekte/Arrays) leeren
        this._inputDom = null;
        this._listView = null;
        this._oldValue = null;
        
        // Basisklasse entladen
        super.destruct(true);
    }
};