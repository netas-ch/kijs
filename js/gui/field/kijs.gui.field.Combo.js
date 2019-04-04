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
        this._caption = null;
        this._oldCaption = null;
        this._oldValue = null;
        this._value = null;

        this._inputDom = new kijs.gui.Dom({
            disableEscBubbeling: true,
            nodeTagName: 'input',
            nodeAttribute: {
                id: this._inputId
            }
        });

        this._listViewEl = new kijs.gui.ListView({
            autoLoad: false,
            focusable: false
        });

        this._spinBoxEl = new kijs.gui.SpinBox({
            target: this,
            targetDomProperty: 'inputWrapperDom',
            ownerNodes: [this._inputWrapperDom, this._spinIconEl.dom],
            openOnInput: true,
            elements: [
                this._listViewEl
            ]
        });

        this._dom.clsAdd('kijs-field-combo');


        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            //autoLoad: true,
            spinIconVisible: true
        });

       // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            autoLoad: { target: 'autoLoad' },

            showCheckBoxes: { target: 'showCheckBoxes', context: this._listViewEl },
            selectType: { target: 'selectType', context: this._listViewEl },

            facadeFnLoad: { target: 'facadeFnLoad', context: this._listViewEl },
            rpc: { target: 'rpc', context: this._listViewEl },

            captionField: { target: 'captionField', context: this._listViewEl },
            iconCharField: { target: 'iconCharField', context: this._listViewEl },
            iconClsField: { target: 'iconClsField', context: this._listViewEl },
            iconColorField: { target: 'iconColorField', context: this._listViewEl },
            toolTipField: { target: 'toolTipField', context: this._listViewEl },
            valueField: { target: 'valueField', context: this._listViewEl },

            minSelectCount: true,
            maxSelectCount: true,

            data: { prio: 1000, target: 'data', context: this._listViewEl },
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
        this._listViewEl.on('click', this._onListViewClick, this);
        this._listViewEl.on('afterLoad', this._onListViewAfterLoad, this);
        //this._listViewEl.on('selectionChange', this._onListViewSelectionChange, this);

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
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

    get captionField() { return this._listViewEl.captionField; }
    set captionField(val) { this._listViewEl.captionField = val; }

    get valueField() { return this._listViewEl.valueField; }
    set valueField(val) { this._listViewEl.valueField = val; }

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

    get facadeFnLoad() { return this._listViewEl.facadeFnLoad; }
    set facadeFnLoad(val) { this._listViewEl.facadeFnLoad = val; }

    get inputDom() { return this._inputDom; }

    // overwrite
    get isEmpty() { return kijs.isEmpty(this.value); }

    // overwrite
    get readOnly() { return super.readOnly; }
    set readOnly(val) {
        super.readOnly = !!val;
        this._listViewEl.disabled = val || this._dom.clsHas('kijs-disabled');
        if (val || this._dom.clsHas('kijs-disabled')) {
            this._inputDom.nodeAttributeSet('readOnly', true);
        } else {
            this._inputDom.nodeAttributeSet('readOnly', false);
        }
    }

    get rpc() { return this._listViewEl.rpc; }
    set rpc(val) { this._listViewEl.rpc = val; }

    // overwrite
    get value() { return this._value; }
    set value(val) {
        this._oldcaption = this._caption;
        this._oldValue = this._value;
        this._caption  = this._getCaptionFromValue(val);
        this._value = val;
        console.log(this._caption);
        this._listViewEl.value = val;
        this._inputDom.nodeAttributeSet('value', this._caption);
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
        this._listViewEl.load(args);
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
    /**
     * Caption zu einem Value ermitteln
     * @param {String|Number|Null} val
     * @returns {String}
     */
    _getCaptionFromValue(val) {
        let found = false;
        let caption = null;
        kijs.Array.each(this._listViewEl.data, function(row) {
            if (row[this._listViewEl.valueField] === val) {
                found = true;
                caption = row[this._listViewEl.captionField];
                return false;
            }
        }, this);

        // Falls kein Datensatz existiert, zeigen wir halt den value an
        if (!found) {
            caption = val;
        }

        return caption;
    }

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
        console.log('load');
        this.load();
    }

    /*_onInput(e) {
        this.validate();
    }*/

    _onKeyDown(e) {
        this._listViewEl.raiseEvent('keyDown', e);
    }

    _onListViewAfterLoad(e) {
        this.value = this._value;
    }

    _onListViewClick(e) {
        this._spinBoxEl.close();
        this.value = this._listViewEl.value;
    }

    /*_onListViewSelectionChange(e) {

    }*/

    _onSpinBoxClick() {
        this._inputDom.focus();
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
        if (this._listViewEl) {
            this._listViewEl.destruct();
        }

        // Variablen (Objekte/Arrays) leeren
        this._inputDom = null;
        this._listViewEl = null;
        this._oldValue = null;

        // Basisklasse entladen
        super.destruct(true);
    }
};