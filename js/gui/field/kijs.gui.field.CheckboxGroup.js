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
    
        this._data = [];
        
        this._captionHtmlDisplayType = 'html';
        this._elements = [];
        
        this._dom.clsAdd('kijs-field-checkboxgroup');
       
        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            autoLoad: { target: 'autoLoad' },   // Soll nach dem erten Rendern automatisch die Load-Funktion aufgerufen werden?
            //captionField: true,
            data: { target: 'data' },
            facadeFnLoad: true,             // Name der Facade-Funktion. Bsp: 'address.load'
            multiselect: { target: 'multiselect' },
            captionField: true,
            captionHtmlDisplayType: true,   // Darstellung der captions. Default: 'html'
                                            // html: als html-Inhalt (innerHtml)
                                            // code: Tags werden als als Text angezeigt
                                            // text: Tags werden entfernt
            rpc: { target: 'rpc' },         // Instanz von kijs.gui.Rpc

            valueField: true
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
        kijs.Array.each(this._elements, function(el) {
            el.destruct();
        }, this);
        this._elements = [];

        // Neue Elemente einfügen
        kijs.Array.each(this._data, function(row) {
            const el = new kijs.gui.field.Checkbox({
                captionHtmlDisplayType: this._captionHtmlDisplayType,
                caption: row[this._captionField],
                valueChecked: row[this._valueField],
                valueUnchecked: false,
                value: false,
                threeState: false
            });
            this._elements.push(el);
        }, this);

        this.value = this._value; 
        
        if (this._inputWrapperDom.isRendered) {
            kijs.Array.each(this._elements, function(el) {
                el.renderTo(this._inputWrapperDom.node);
            }, this);
        }
    }

    // overwrite
    /*get disabled() { return super.disabled; }
    set disabled(val) {
        super.disabled = !!val;
        if (val || this._dom.clsHas('kijs-readonly')) {
            this._inputDom.nodeAttributeSet('disabled', true);  // (readOnly gibts leider nicht bei select-tags)
        } else {
            this._inputDom.nodeAttributeSet('disabled', false);
        }
    }*/
    
    get facadeFnLoad() { return this._facadeFnLoad; }
    set facadeFnLoad(val) { this._facadeFnLoad = val; }

    // overwrite
    //get isEmpty() { return kijs.isEmpty(this._inputDom.value); }
    
    //get multiselect() { return !!this._inputDom.nodeAttributeGet('multiple'); }
    //set multiselect(val) { this._inputDom.nodeAttributeSet('multiple', !!val); }
    
    // overwrite
    /*get readOnly() { return super.readOnly; }
    set readOnly(val) {
        super.readOnly = !!val;
        if (val || this._dom.clsHas('kijs-disabled')) {
            this._inputDom.nodeAttributeSet('disabled', true);  // (readOnly gibts leider nicht bei select-tags)
        } else {
            this._inputDom.nodeAttributeSet('disabled', false);
        }
    }*/
    
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
        if (!kijs.isEmpty(this._elements)) {
            const value = [];
            kijs.Array.each(this._elements, function(el) {
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
        }
        this._value = val;
        kijs.Array.each(this._elements, function(el) {
            el.value = kijs.Array.contains(val, el.valueChecked) ? el.valueChecked : false;
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
        
        // Event afterRender auslösen
        if (!preventAfterRender) {
            this.raiseEvent('afterRender');
        }
        
        if (this._data) {
            this.data = this._data;
        }
    }


    // overwrite
    unRender() {
        //this._inputDom.unRender();
        super.unRender();
    }

        // EVENTS
    _onAfterFirstRenderTo(e) {
        this.load();
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
        kijs.Array.each(this._elements, function(el) {
            el.destruct();
        }, this);
        
        // Variablen (Objekte/Arrays) leeren
        this._data = null;
        this._elements = null;
        
        // Basisklasse entladen
        super.destruct(true);
    }

};