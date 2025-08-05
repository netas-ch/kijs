/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.field.ListView
// --------------------------------------------------------------
kijs.gui.field.ListView = class kijs_gui_field_ListView extends kijs.gui.field.Field {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);
        this._minSelectCount = null;
        this._maxSelectCount = null;
        this._previousChangeValue = [];
        this._value = null;

        this._listView = new kijs.gui.ListView({});

        this._dom.clsAdd('kijs-field-listview');
        
        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            ddName: kijs.uniqId('listView.element')
        });
        
        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            showCheckBoxes: { target: 'showCheckBoxes', context: this._listView },
            selectType: { target: 'selectType', context: this._listView },
            
            captionField: { target: 'captionField', context: this._listView },
            iconCharField: { target: 'iconCharField', context: this._listView },
            iconMapField: { target: 'iconMapField', context: this._listView },
            iconClsField: { target: 'iconClsField', context: this._listView },
            iconAnimationClsField: { target: 'iconAnimationClsField', context: this._listView },
            iconColorField: { target: 'iconColorField', context: this._listView },
            tooltipField: { target: 'tooltipField', context: this._listView },
            valueField: { target: 'valueField', context: this._listView },
            
            ddName: { target: 'ddName', context: this._listView },
            ddPosAfterFactor: { target: 'ddPosAfterFactor', context: this._listView },
            ddPosBeforeFactor: { target: 'ddPosBeforeFactor', context: this._listView },
            sortable: { target: 'sortable', context: this._listView },
            ddTarget: { target: 'ddTarget', context: this._listView },
            
            rpcSaveFn: { target: 'rpcSaveFn', context: this._listView },
            rpcSaveArgs: { target: 'rpcSaveArgs', context: this._listView },
            autoSave: { target: 'autoSave', context: this._listView }, // Auto-Speichern bei DD
            
            minSelectCount: true,
            maxSelectCount: true,

            data: { prio: 1000, target: 'data', context: this._listView },
            value: { prio: 1001, target: 'value' }
        });

        // Listeners
        this._listView.on('selectionChange', this.#onListViewSelectionChange, this);
        this._listView.once('afterLoad', this.#onceListViewAfterLoad, this);
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
    get captionField() { return this._listView.captionField; }
    set captionField(val) { this._listView.captionField = val; }

    get data() { return this._listView.data; }
    set data(val) { this._listView.data = val; }

    // overwrite
    get elements() { return this._listView.elements; }

    // overwrite
    get hasFocus() { return this._listView.hasFocus; }

    // overwrite
    get isEmpty() { return kijs.isEmpty(this.value); }

    get listView() { return this._listView; }
    
    // overwrite
    get readOnly() { return super.readOnly; }
    set readOnly(val) {
        super.readOnly = !!val;
        this._listView.disabled = val || this._dom.clsHas('kijs-disabled');
    }

    get selectType() { return this._listView.selectType; }
    set selectType(val) { this._listView.selectType = val; }

    // overwrite
    get value() { return this._listView.value; }
    set value(val) {
        this._value = val;
        this._listView.value = this._value;
        this._previousChangeValue = this._value;
    }

    get valueField() { return this._listView.valueField; }
    set valueField(val) { this._listView.valueField = val; }



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

    // overwrite
    changeDisabled(val, callFromParent) {
        super.changeDisabled(!!val, callFromParent);
        this._listView.changeDisabled(!!val || this._dom.clsHas('kijs-readonly'), false);
    }

    // overwrite
    focus(alsoSetIfNoTabIndex) {
        return this._listView.focus(alsoSetIfNoTabIndex);
    }
    
    /**
     * Füllt das Listview mit Daten vom Server
     * @param {Object|Null} [args] Objekt mit Argumenten, die an die remoteFn übergeben werden
     * @param {Boolean} [superCall=false]
     * @returns {Promise}
     */
    load(args, superCall=false) {
        return new Promise((resolve, reject) => {
            super.load(args, true).then((e) => {
                let config = e.responseData.config ?? {};
                
                // Falls ein neuer Wert zurückgegeben wird, diesen nehmen
                if (kijs.isDefined(config.value)) {
                    this._value = config.value;
                }
                
                this._listView.data = config.data;

                if (!kijs.isEmpty(this._value)) {
                    this.value = this._value;
                }
                
                if (!kijs.isEmpty(config.selectFilters)) {
                    this._listView.selectByFilters(config.selectFilters);
                }
                
                // 'afterLoad' auslösen
                if (!superCall) {
                    this.raiseEvent('afterLoad', e);
                }
                
                // Promise ausführen
                resolve(e);
                
            }).catch((ex) => {
                reject(ex);
                
            });
        });
    }

    // overwrite
    render(superCall) {
        super.render(true);

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
    _validationRules(value, ignoreEmpty) {
        if (ignoreEmpty && kijs.isEmpty(value)) {
            return;
        }

        super._validationRules(value, ignoreEmpty);

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


    // PRIVATE
    // LISTENERS
    #onceListViewAfterLoad() {
        this.isDirty = false; // reset the dirty flag after first loading data from remote
    }

    #onListViewSelectionChange() {
        const val = this.value;

        this.raiseEvent('input', { oldValue: this._previousChangeValue, value: val });
        this.raiseEvent('change', { oldValue: this._previousChangeValue, value: val });
        this._previousChangeValue = val;

        this.validate();
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
        if (this._listView) {
            this._listView.destruct();
        }

        // Variablen (Objekte/Arrays) leeren
        this._listView = null;
        this._minSelectCount = null;
        this._maxSelectCount = null;
        this._previousChangeValue = [];
        this._value = null;

        // Basisklasse entladen
        super.destruct(true);
    }

};
