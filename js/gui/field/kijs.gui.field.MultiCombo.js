/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.field.MultiCombo
// --------------------------------------------------------------

kijs.gui.field.MultiCombo = class kijs_gui_field_MultiCombo extends kijs.gui.field.Field {

    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config = {}) {
        super(false);

        this._listView = null;
        this._searchPlace = 'begin';
        this._searchField = null;
        this._searchSpinBox = null;
        this._searchListView = null;
        this._storage = [];
        this._values = [];

        // CSS-Klasse hinzufügen
        this._dom.clsAdd('kijs-field-multicombo');

        // Elemente erstellen
        this._createElements()

        // Standard-config-Eigenschaften
        Object.assign(this._defaultConfig, {
            autoLoad: true
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            captionField: {target: 'captionField'},
            data: {target: 'data'},
            placeholder: {placeholder: 'placeholder'},
            searchPlace: {target: 'searchPlace'},
            valueField: {target: 'valueField'}
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }
    }

    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------

    get captionField() {
        return this._listView.captionField;
    }

    set captionField(val) {
        this._listView.captionField = val;
        this._searchListView.captionField = val;
    }

    get data() {
        return this._storage;
    }

    set data(val) {
        this._storage = val;
    }

    get placeholder() {
        return this._searchField.placeholder;
    }

    set placeholder(val) {
        this._searchField.placeholder = val;
    }

    get rpcLoadFn() {
        return this._listView.rpcLoadFn;
    }

    set rpcLoadFn(val) {
        this._listView.rpcLoadFn = val;
        this._searchListView.rpcLoadFn = val;
    }

    get searchPlace() {
        return this._searchPlace;
    }

    set searchPlace(val) {
        if (!kijs.Array.contains(['begin', 'contains', 'end'], val)) {
            throw new kijs.Error('invalid value for searchPlace');
        }
        this._searchPlace = val;
    }

    get value() {
        let values = [];
        if (this._listView) {
            kijs.Array.each(this._listView.data, element => {
                values.push(element[this._listView.valueField]);
            }, this);
        }
        return values;
    }

    set value(vals) {
        this._values = vals;

        this._setValues();
    }

    get valueField() {
        return this._listView.valueField;
    }

    set valueField(val) {
        this._listView.valueField = val;
        this._searchListView.valueField = val;
    }

    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------

    // overwrite
    /**
     * Füllt das Listview mit Daten vom Server
     * @param {Object|Null} [args] Objekt mit Argumenten, die an die remoteFn übergeben werden
     * @param {Boolean} [superCall=false]
     * @param {Object|Null} config
     * @returns {Promise}
     */
    load(args, superCall = false, config = null) {
        return new Promise((resolve, reject) => {
            super.load(args, true, config).then((e) => {

                this._storage = e.responseData.rows;

                // Werte setzen
                this._setValues();

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

        this._searchField.renderTo(this._inputWrapperDom.node);
        this._listView.renderTo(this._inputWrapperDom.node);

        // Event afterRender auslösen
        if (!superCall) {
            this.raiseEvent('afterRender');
        }
    }

    // PROTECTED
    _createElements() {
        this._listView = new kijs.gui.ListView(
            {
                selectType: 'single',
                captionField: 'caption',
                valueField: 'value',
                height: 100,
                on: {
                    elementClick: this.#onElementClick,
                    context: this
                }
            }
        );

        this._searchField = new kijs.gui.field.Text(
            {
                labelHide: true,
                autocomplete: false,
                required: false,
                on: {
                    input: this.#onSearchFieldChange,
                    context: this
                }
            }
        );

        this._searchListView = new kijs.gui.ListView(
            {
                selectType: 'single',
                captionField: 'caption',
                valueField: 'value',
                on: {
                    elementClick: this.#onSearchElementClick,
                    context: this
                }
            }
        );

        this._searchSpinBox = new kijs.gui.SpinBox({
            target: this._searchField,
            elements: this._searchListView
        });
    }

    _setValues() {
        let data = [];

        if (!kijs.isEmpty(this._values)) {
            kijs.Array.each(this._storage, element => {
                if (kijs.Array.contains(this._values, element[this._listView.valueField])) {
                    data.push(element);
                }
            }, this);
        }

        this._listView.data = data;
    }

    // PRIVATE
    // LISTENERS
    #onElementClick(e) {
        let data = [];

        // Element entfernen
        kijs.Array.each(this._listView.data, element => {
            if (e.raiseElement.dataRow[this._listView.valueField] !== element[this._listView.valueField]) {
                data.push(element);
            }
        }, this);
        this._listView.data = data;

        // Event werfen
        this.raiseEvent('change', {element: e.element});
    }

    #onSearchElementClick(e) {
        this._searchField.value = null;
        this._searchSpinBox.close();

        let data = this._listView.data;
        data.push(e.raiseElement.dataRow);

        // Werte sortieren
        data = data.sort(
            (a, b) => (a[this.captionField].toUpperCase() < b[this.captionField].toUpperCase()) ? -1 : (a[this.captionField].toUpperCase() > b[this.captionField].toUpperCase()) ? 1 : 0
        );

        // Neue Werte zuweisen
        this._listView.data = data;

        // Event werfen
        this.raiseEvent('change', {element: e.element});
    }

    #onSearchFieldChange(e) {

        let data = [];
        const searchString = e.element.value.toLowerCase();

        if (searchString.length) {
            kijs.Array.each(this._storage, element => {
                let match = false;
                const elementString = element[this._listView.captionField].toLowerCase();

                switch (this.searchPlace) {
                    default:
                    case 'begin' :
                        if (kijs.String.beginsWith(elementString, searchString)) {
                            match = true;
                        }
                        break;

                    case 'contains':
                        if (kijs.String.contains(elementString, searchString)) {
                            match = true;
                        }
                        break;

                    case 'end':
                        if (kijs.String.endsWith(elementString, searchString)) {
                            match = true;
                        }
                        break;
                }

                if (match) {
                    data.push(element);
                }
            }, this);
        }

        // Elemente ignorieren die schon in der ListView sind
        kijs.Array.each(data, element => {
            if (kijs.Array.contains(this._listView.data, element)) {
                kijs.Array.remove(data, element);
            }
        }, this);

        // Elemente setzen
        this._searchListView.data = data;

        if (kijs.isEmpty(data)) {
            this._searchSpinBox.close();
        } else {
            this._searchSpinBox.show();
        }

        // Event werfen
        this.raiseEvent('input', e);
    }

    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(preventDestructEvent) {

        // Event auslösen.
        if (!preventDestructEvent) {
            this.raiseEvent('destruct');
        }

        // Basisklasse auch entladen
        super.destruct(true);

        // Variablen (Objekte/Arrays) leeren
        this._listView = null;
        this._searchPlace = null;
        this._searchField = null;
        this._searchSpinBox = null;
        this._searchListView = null;
        this._storage = null;
        this._values = null;
    }
};
