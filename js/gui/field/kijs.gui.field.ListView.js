/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.field.ListView
// --------------------------------------------------------------
kijs.gui.field.ListView = class kijs_gui_field_ListView extends kijs.gui.field.Field {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        this._minSelectCount = null;
        this._maxSelectCount = null;
        this._oldValue = [];
        this._rpc = null;               // Instanz von kijs.gui.Rpc

        this._listView = new kijs.gui.ListView({});

        this._dom.clsAdd('kijs-field-listview');

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            autoLoad: { target: 'autoLoad', context: this._listView },

            ddSort: { target: 'ddSort', context: this._listView },

            showCheckBoxes: { target: 'showCheckBoxes', context: this._listView },
            selectType: { target: 'selectType', context: this._listView },

            facadeFnLoad: { target: 'facadeFnLoad', context: this._listView },
            facadeFnArgs: { target: 'facadeFnArgs', context: this._listView },
            rpc: { target: 'rpc' },

            captionField: { target: 'captionField', context: this._listView },
            iconCharField: { target: 'iconCharField', context: this._listView },
            iconClsField: { target: 'iconClsField', context: this._listView },
            iconColorField: { target: 'iconColorField', context: this._listView },
            tooltipField: { target: 'tooltipField', context: this._listView },
            valueField: { target: 'valueField', context: this._listView },

            minSelectCount: true,
            maxSelectCount: true,

            data: { prio: 1000, target: 'data', context: this._listView },
            value: { prio: 1001, target: 'value' }
        });

        // Listeners
        this._listView.on('selectionChange', this._onListViewSelectionChange, this);
        this._eventForwardsAdd('ddOver', this._listView);
        this._eventForwardsAdd('ddDrop', this._listView.dom);

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }
    }


    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get autoLoad() { return this._listView.autoLoad; }
    set autoLoad(val) { this._listView.autoLoad = val; }

    get data() { return this._listView.data; }
    set data(val) { this._listView.data = val; }

    get captionField() { return this._listView.captionField; }
    set captionField(val) { this._listView.captionField = val; }

    get valueField() { return this._listView.valueField; }
    set valueField(val) { this._listView.valueField = val; }

    // overwrite
    get disabled() { return super.disabled; }
    set disabled(val) {
        super.disabled = !!val;
        this._listView.disabled = val || this._dom.clsHas('kijs-readonly');
    }

    get elements() { return this._listView.elements; }

    get facadeFnLoad() { return this._listView.facadeFnLoad; }
    set facadeFnLoad(val) { this._listView.facadeFnLoad = val; }

    // overwrite
    get isEmpty() { return kijs.isEmpty(this.value); }

    // overwrite
    get readOnly() { return super.readOnly; }
    set readOnly(val) {
        super.readOnly = !!val;
        this._listView.disabled = val || this._dom.clsHas('kijs-disabled');
    }

    get rpc() {

        if (!this._rpc) {

            // Sucht nach einem FormPanel oberhalb
            let formPanel = this.upX('kijs.gui.FormPanel');

            // Wenn ein FormPanel gefunden wurde und dort eine RPC-Instance vorhanden ist, wird diese genommen
            if (formPanel && formPanel.rpc) {
                this._rpc = formPanel.rpc;
            }
        }
        return this._rpc;
    }
    set rpc(val) {
        if (val instanceof kijs.gui.Rpc) {
            this._rpc = val;
            this._listView.rpc = val;

        } else {
            throw new kijs.Error(`Unkown format on config "rpc"`);
        }
    }

    // overwrite
    get value() { return this._listView.value; }
    set value(val) {
        this._listView.value = val;
        this._oldValue = this._listView.value;
    }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------

    /**
     * Fügt Daten hinzu
     * @param {Array} data
     * @returns {undefined}
     */
    addData(data) {
        this._listView.addData(data);
    }

    /**
     * Füllt das Combo mit Daten vom Server
     * @param {Array} args Array mit Argumenten, die an die Facade übergeben werden
     * @returns {undefined}
     */
    load(args) {
        this._listView.load(args);
    }

    // overwrite
    render(superCall) {
        super.render(true);

        this._listView.rpc = this.rpc;
        this._listView.renderTo(this._inputWrapperDom.node);

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

        this._listView.unrender();
        super.unrender(true);
    }


    // PROTECTED
    // overwrite
    _validationRules(value) {
        super._validationRules(value);

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
    _onListViewSelectionChange() {
        const val = this.value;

        this.raiseEvent(['input', 'change'], { oldValue: this._oldValue, value: val });
        this._oldValue = val;

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
        if (this._listView) {
            this._listView.destruct();
        }

        // Variablen (Objekte/Arrays) leeren
        this._listView = null;
        this._oldValue = null;
        this._rpc = null;

        // Basisklasse entladen
        super.destruct(true);
    }

};
