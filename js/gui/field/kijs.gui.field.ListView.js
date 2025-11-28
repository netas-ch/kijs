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

        this._listViewEl = new kijs.gui.ListView({});

        this._dom.clsAdd('kijs-field-listview');
        
        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            ddName: kijs.uniqId('listView.element')
        });
        
        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            showCheckBoxes: { target: 'showCheckBoxes', context: this._listViewEl },
            selectType: { target: 'selectType', context: this._listViewEl },
            
            displayTextField: { target: 'displayTextField', context: this._listViewEl },
            iconCharField: { target: 'iconCharField', context: this._listViewEl },
            iconMapField: { target: 'iconMapField', context: this._listViewEl },
            iconClsField: { target: 'iconClsField', context: this._listViewEl },
            iconAnimationClsField: { target: 'iconAnimationClsField', context: this._listViewEl },
            iconColorField: { target: 'iconColorField', context: this._listViewEl },
            tooltipField: { target: 'tooltipField', context: this._listViewEl },
            disabledField: { target: 'disabledField', context: this._listViewEl },
            valueField: { target: 'valueField', context: this._listViewEl },
            
            ddName: { target: 'ddName', context: this._listViewEl },
            ddPosAfterFactor: { target: 'ddPosAfterFactor', context: this._listViewEl },
            ddPosBeforeFactor: { target: 'ddPosBeforeFactor', context: this._listViewEl },
            sortable: { target: 'sortable', context: this._listViewEl },
            ddTarget: { target: 'ddTarget', context: this._listViewEl },
            
            rpcSaveFn: { target: 'rpcSaveFn', context: this._listViewEl },
            rpcSaveArgs: { target: 'rpcSaveArgs', context: this._listViewEl },
            autoSave: { target: 'autoSave', context: this._listViewEl }, // Auto-Speichern bei DD
            
            minSelectCount: true,
            maxSelectCount: true,

            data: { prio: 1000, target: 'data', context: this._listViewEl },
            value: { prio: 1001, target: 'value' }
        });

        // Listeners
        this._listViewEl.on('selectionChange', this.#onListViewSelectionChange, this);
        this._listViewEl.once('afterLoad', this.#onceListViewAfterLoad, this);
        this._eventForwardsAdd('ddOver', this._listViewEl);
        this._eventForwardsAdd('ddDrop', this._listViewEl.dom);

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }
    }



    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get data() { return this._listViewEl.data; }
    set data(val) { this._listViewEl.data = val; }

    get displayTextField() { return this._listViewEl.displayTextField; }
    set displayTextField(val) { this._listViewEl.displayTextField = val; }

    // overwrite
    get elements() { return this._listViewEl.elements; }

    // overwrite
    get hasFocus() { return this._listViewEl.hasFocus; }

    // overwrite
    get isEmpty() { return kijs.isEmpty(this.value); }

    get listView() { return this._listViewEl; }
    
    // overwrite
    get readOnly() { return super.readOnly; }
    set readOnly(val) {
        super.readOnly = !!val;
        this._listViewEl.disabled = val || this._dom.clsHas('kijs-disabled');
    }

    get selectType() { return this._listViewEl.selectType; }
    set selectType(val) { this._listViewEl.selectType = val; }

    // overwrite
    get value() { return this._listViewEl.value; }
    set value(val) {
        this._listViewEl.value = val;
        this._previousChangeValue = val;
        this._updateClearButtonVisibility();
    }

    get valueField() { return this._listViewEl.valueField; }
    set valueField(val) { this._listViewEl.valueField = val; }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    /**
     * Fügt Daten hinzu
     * @param {Array} data
     * @returns {undefined}
     */
    addData(data) {
        this._listViewEl.addData(data);
    }

    // overwrite
    changeDisabled(val, callFromParent) {
        super.changeDisabled(!!val, callFromParent);
        this._listViewEl.changeDisabled(!!val || this._dom.clsHas('kijs-readonly'), false);
    }

    // overwrite
    focus(alsoSetIfNoTabIndex) {
        return this._listViewEl.focus(alsoSetIfNoTabIndex);
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
                if (kijs.isEmpty(e.response.errorType)) {
                    let config = e.response.config ?? {};

                    if ('data' in config) {
                        this._listViewEl.data = config.data;
                    }
                    if (!kijs.isEmpty(config.selectFilters)) {
                        this._listViewEl.selectByFilters(config.selectFilters);
                    }

                    // 'afterLoad' auslösen
                    if (!superCall) {
                        this.raiseEvent('afterLoad', Object.assign({}, e));
                    }
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

        this._listViewEl.renderTo(this._inputWrapperDom.node);

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

        this._listViewEl.unrender();
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
        if (this._listViewEl) {
            this._listViewEl.destruct();
        }

        // Variablen (Objekte/Arrays) leeren
        this._listViewEl = null;
        this._minSelectCount = null;
        this._maxSelectCount = null;
        this._previousChangeValue = [];

        // Basisklasse entladen
        super.destruct(true);
    }

};
