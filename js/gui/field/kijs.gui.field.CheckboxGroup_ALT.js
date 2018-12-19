/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.field.CheckboxGroup
// --------------------------------------------------------------
kijs.gui.field.CheckboxGroup = class kijs_gui_field_CheckboxGroup extends kijs.gui.field.Field {
    

    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);
    
        this._captionField = null;
        this._captionHtmlDisplayType = 'html';
        this._valueField = null;
        this._iconCharField = null;
        this._iconClsField = null;
        this._iconColorField = null;
        this._toolTipField = null;
        
        this._checkedIconChar = '&#xf046';          // Radio-Style: '&#xf05d' oder '&#xf111'
        this._checkedIconCls = null;
        this._uncheckedIconChar = '&#xf096';        // Radio-Style: '&#xf10c'
        this._uncheckedIconCls = null;
        
        this._checkboxElements = [];
        this._data = [];
        this._oldValue = [];
        
        this._dom.clsAdd('kijs-field-checkboxgroup');
       
        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            autoLoad: { target: 'autoLoad' },   // Soll nach dem ersten Rendern automatisch die Load-Funktion aufgerufen werden?
            captionHtmlDisplayType: true,   // Darstellung der captions. Default: 'html'
                                            // html: als html-Inhalt (innerHtml)
                                            // code: Tags werden als als Text angezeigt
                                            // text: Tags werden entfernt
            
            checkedIconChar: true,
            checkedIconCls: true,
            uncheckedIconChar: true,
            uncheckedIconCls: true,

            data: { target: 'data' },
            facadeFnLoad: true,             // Name der Facade-Funktion. Bsp: 'address.load'
            rpc: { target: 'rpc' },         // Instanz von kijs.gui.Rpc
            
            captionField: true,
            iconCharField: true,
            iconClsField: true,
            iconColorField: true,
            toolTipField: true,
            valueField: true
        });
        
        // Config anwenden
        if (kijs.isObject(config)) {
            this.applyConfig(config, true);
        }
    }
    
    
    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get autoLoad() {
        return this.hasListener('afterFirstRenderTo', this._onAfterFirstRenderTo, this);
    }
    set autoLoad(val) {
        if (val) {
            this.on('afterFirstRenderTo', this._onAfterFirstRenderTo, this);
        } else {
            this.off('afterFirstRenderTo', this._onAfterFirstRenderTo, this);
        }
    }
    
    get captionField() { return this._captionField; }
    set captionField(val) { this._captionField = val; }

    get valueField() { return this._valueField; }
    set valueField(val) { this._valueField = val; }

    get data() { return this._data; }
    set data(val) { 
        this._data = val;
        
        // Bestehende Elemente löschen
        kijs.Array.each(this._checkboxElements, function(el) {
            el.destruct();
        }, this);
        this._checkboxElements = [];

        // Neue Elemente einfügen
        kijs.Array.each(this._data, function(row) {
            const el = new kijs.gui.field.Checkbox({
                captionHtmlDisplayType: this._captionHtmlDisplayType,
                checkedIconChar: this._checkedIconChar,
                checkedIconCls: this._checkedIconCls,
                uncheckedIconChar: this._uncheckedIconChar,
                uncheckedIconCls: this._uncheckedIconCls,
                caption: this._captionField && row[this._captionField] ? row[this._captionField] : '',
                iconChar: this._iconCharField && row[this._iconCharField] ? row[this._iconCharField] : '',
                iconCls: this._iconClsField && row[this._iconClsField] ? row[this._iconClsField] : '',
                iconColor: this._iconColorField && row[this._iconColorField] ? row[this._iconColorField] : undefined,
                toolTip: this._toolTipField && row[this._toolTipField] ? row[this._toolTipField] : '',
                valueChecked: row[this._valueField],
                valueUnchecked: null,
                labelHide: true,
                threeState: false
            });
            el.on('input', this._onCheckboxElementInput, this);
            
            this._checkboxElements.push(el);
        }, this);

        this.value = this._value; 
        
        if (this._inputWrapperDom.isRendered) {
            kijs.Array.each(this._checkboxElements, function(el) {
                el.renderTo(this._inputWrapperDom.node);
            }, this);
        }
    }

    // overwrite
    get disabled() { return super.disabled; }
    set disabled(val) {
        super.disabled = !!val;
        kijs.Array.each(this._checkboxElements, function(el) {
            el.disabled = !!val;
        }, this);
    }
    
    get facadeFnLoad() { return this._facadeFnLoad; }
    set facadeFnLoad(val) { this._facadeFnLoad = val; }

    // overwrite
    get isEmpty() { return kijs.isEmpty(this.value); }
    
    // overwrite
    get readOnly() { return super.readOnly; }
    set readOnly(val) {
        super.readOnly = !!val;
        kijs.Array.each(this._checkboxElements, function(el) {
            el.readOnly = !!val;
        }, this);
    }
    
    get rpc() { return this._rpc;}
    set rpc(val) {
        if (val instanceof kijs.gui.Rpc) {
            this._rpc = val;
            
        } else if (kijs.isString(val)) {
            if (this._rpc) {
                this._rpc.url = val;
            } else {
                this._rpc = new kijs.gui.Rpc({
                    url: val
                });
            }
            
        } else {
            throw new Error(`Unkown format on config "rpc"`);
            
        }
    }
    
    // overwrite
    get value() {
        if (!kijs.isEmpty(this._checkboxElements)) {
            const value = [];
            kijs.Array.each(this._checkboxElements, function(el) {
                let val = el.value;
                if (!kijs.isEmpty(val)) {
                    value.push(val);
                }
            }, this);
           this._value = value;
        }
        return this._value;
    }
    set value(val) {
        if (kijs.isEmpty(val)) {
            val = [];
        } else if (!kijs.isArray(val)) {
            val = [val];
        }
        this._value = val;
        this._oldValue = val;
        kijs.Array.each(this._checkboxElements, function(el) {
            el.checked = kijs.Array.contains(val, el.valueChecked) ? 1 : 0;
        }, this);
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
        this._rpc.do(this._facadeFnLoad, args, function(response) {
            this.data = response.rows;
        }, this, true, this, 'dom', false);
    }

    // overwrite
    render(preventAfterRender) {
        super.render(true);
        
        if (this._data) {
            this.data = this._data;
        }
        
        // Event afterRender auslösen
        if (!preventAfterRender) {
            this.raiseEvent('afterRender');
        }
    }

    // overwrite
    unrender() {
        kijs.Array.each(this._checkboxElements, function(el) {
            el.destruct();
        }, this);
        super.unrender();
    }


    // EVENTS
    _onAfterFirstRenderTo(e) {
        this.load();
    }
    
    _onCheckboxElementInput(e) {
        const val = this.value;

        this._value = val;
        this.raiseEvent('input', { oldValue: this._oldValue, value: val });
        this._oldValue = val;
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
        kijs.Array.each(this._checkboxElements, function(el) {
            el.destruct();
        }, this);
        
        // Variablen (Objekte/Arrays) leeren
        this._checkboxElements = null;
        this._data = null;
        this._oldValue = null;
        
        // Basisklasse entladen
        super.destruct(true);
    }

};