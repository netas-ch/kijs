/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.field.ListView
// --------------------------------------------------------------
/**
 * Formularfeld mit einer kijs.gui.ListView. Der Wert ist der Wert der ListView (siehe
 * kijs.gui.ListView.value). Die meisten Config-Eigenschaften werden an die ListView
 * weitergegeben. Mit minSelectCount und maxSelectCount kann die Anzahl ausgewählter
 * Einträge validiert werden.
 *
 * @example
 * new kijs.gui.field.ListView({
 *     label: 'Farben',
 *     selectType: 'simple-multi',
 *     showCheckBoxes: true,
 *     data: [ { value: 'r', displayText: 'Rot' }, { value: 'g', displayText: 'Grün' } ]
 * });
 *
 * @fires change  Nach einer Änderung der Selektion. e: oldValue, value
 * @fires input  Nach einer Änderung der Selektion. e: oldValue, value
 */
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
            showCheckBoxes: { target: 'showCheckBoxes', context: this._listViewEl },   // {Boolean} siehe kijs.gui.ListView.showCheckBoxes
            selectType: { target: 'selectType', context: this._listViewEl },
            
            displayTextField: { target: 'displayTextField', context: this._listViewEl },
            iconCharField: { target: 'iconCharField', context: this._listViewEl },   // {String} siehe kijs.gui.ListView.iconCharField
            iconMapField: { target: 'iconMapField', context: this._listViewEl },   // {String} siehe kijs.gui.ListView.iconMapField
            iconClsField: { target: 'iconClsField', context: this._listViewEl },   // {String} siehe kijs.gui.ListView.iconClsField
            iconAnimationClsField: { target: 'iconAnimationClsField', context: this._listViewEl },   // {String} siehe kijs.gui.ListView.iconAnimationClsField
            iconColorField: { target: 'iconColorField', context: this._listViewEl },   // {String} siehe kijs.gui.ListView.iconColorField
            tooltipField: { target: 'tooltipField', context: this._listViewEl },   // {String} siehe kijs.gui.ListView.tooltipField
            disabledField: { target: 'disabledField', context: this._listViewEl },   // {String} siehe kijs.gui.DataView.disabledField
            valueField: { target: 'valueField', context: this._listViewEl },
            
            ddName: { target: 'ddName', context: this._listViewEl },   // {String} siehe kijs.gui.DataView.ddName
            ddPosAfterFactor: { target: 'ddPosAfterFactor', context: this._listViewEl },   // {Number} siehe kijs.gui.DataView.ddPosAfterFactor
            ddPosBeforeFactor: { target: 'ddPosBeforeFactor', context: this._listViewEl },   // {Number} siehe kijs.gui.DataView.ddPosBeforeFactor
            sortable: { target: 'sortable', context: this._listViewEl },   // {Boolean} siehe kijs.gui.DataView.sortable
            ddTarget: { target: 'ddTarget', context: this._listViewEl },   // {Object|null} siehe kijs.gui.DataView.ddTarget
            
            rpcSaveFn: { target: 'rpcSaveFn', context: this._listViewEl },   // {String} siehe kijs.gui.DataView.rpcSaveFn
            rpcSaveArgs: { target: 'rpcSaveArgs', context: this._listViewEl },   // {Object} siehe kijs.gui.DataView.rpcSaveArgs
            autoSave: { target: 'autoSave', context: this._listViewEl },     // {Boolean} siehe kijs.gui.DataView.autoSave
            
            minSelectCount: true,   // {Number|null} Minimale Anzahl ausgewählter Einträge (Validierung)
            maxSelectCount: true,   // {Number|null} Maximale Anzahl ausgewählter Einträge (Validierung)

            data: { prio: 1000, target: 'data', context: this._listViewEl },
            value: { prio: 1001, target: 'value' }
        });

        // Listeners
        this._listViewEl.on('selectionChange', this.#onListViewSelectionChange, this);
        this._listViewEl.once('afterLoad', this.#onceListViewAfterLoad, this);

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }
    }



    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    /**
     * Daten der ListView (siehe kijs.gui.ListView.data)
     * @type {Array}
     */
    get data() { return this._listViewEl.data; }
    set data(val) { this._listViewEl.data = val; }

    /**
     * Name des Felds mit dem angezeigten Text (siehe kijs.gui.ListView.displayTextField)
     * @type {String|null}
     */
    get displayTextField() { return this._listViewEl.displayTextField; }
    set displayTextField(val) { this._listViewEl.displayTextField = val; }

    /**
     * Elemente der ListView
     * @type {kijs.gui.Element[]}
     */
    // overwrite
    get elements() { return this._listViewEl.elements; }

    /**
     * Hat die ListView den Fokus?
     * @type {Boolean}
     */
    // overwrite
    get hasFocus() { return this._listViewEl.hasFocus; }

    /**
     * Ist der Wert leer?
     * @type {Boolean}
     */
    // overwrite
    get isEmpty() { return kijs.isEmpty(this.value); }

    /**
     * Die kijs.gui.ListView des Felds
     * @type {kijs.gui.ListView}
     */
    get listView() { return this._listViewEl; }
    
    /**
     * Schreibgeschützt. Die ListView wird dafür deaktiviert.
     * @type {Boolean}
     */
    // overwrite
    get readOnly() { return super.readOnly; }
    set readOnly(val) {
        super.readOnly = !!val;
        this._listViewEl.disabled = val || this._dom.clsHas('kijs-disabled');
    }

    /**
     * Art der Selektion (siehe kijs.gui.DataView.selectType)
     * @type {String}
     */
    get selectType() { return this._listViewEl.selectType; }
    set selectType(val) { this._listViewEl.selectType = val; }

    /**
     * Wert der ListView (siehe kijs.gui.ListView.value)
     * @type {*|Array|null}
     */
    // overwrite
    get value() { return this._listViewEl.value; }
    set value(val) {
        this._listViewEl.value = val;
        this._previousChangeValue = val;
        this._updateClearButtonVisibility();
    }

    /**
     * Name des Felds mit dem Wert (siehe kijs.gui.ListView.valueField)
     * @type {String|null}
     */
    get valueField() { return this._listViewEl.valueField; }
    set valueField(val) { this._listViewEl.valueField = val; }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    /**
     * Fügt der ListView Datensätze hinzu
     * @param {Object|Array} data
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
     * Lädt per RPC (siehe kijs.gui.Element.load()). Aus response.config werden data in die
     * ListView übernommen und selectFilters angewendet. Danach wird afterLoad ausgelöst.
     * @param {Object|Null} [args] Objekt mit Argumenten, die an die remoteFn übergeben werden
     * @param {Boolean} [superCall=false]   true beim Aufruf aus einer abgeleiteten Klasse (dann kein afterLoad)
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
                    this._errors.push(kijs.getText('Min. %1 müssen ausgewählt werden', '', minSelectCount));
                }
            } else if (kijs.isEmpty(value) && minSelectCount > 0) {
                this._errors.push(kijs.getText('Min. %1 müssen ausgewählt werden', '', minSelectCount));
            }
        }

        // maxSelectCount
        if (!kijs.isEmpty(this._maxSelectCount)) {
            const maxSelectCount = this._maxSelectCount;

            if (kijs.isArray(value)) {
                if (value.length > maxSelectCount) {
                    this._errors.push(kijs.getText('Max. %1 dürfen ausgewählt werden', '', maxSelectCount));
                }
            } else if (!kijs.isEmpty(value) && maxSelectCount < 1) {
                this._errors.push(kijs.getText('Max. %1 dürfen ausgewählt werden', '', maxSelectCount));
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
