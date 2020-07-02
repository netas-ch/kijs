/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.field.CheckboxGroup
// --------------------------------------------------------------
kijs.gui.field.CheckboxGroup = class kijs_gui_field_CheckboxGroup extends kijs.gui.field.ListView {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        this._checkedAll = false;

        this._dom.clsRemove('kijs-field-listview');
        this._dom.clsAdd('kijs-field-checkboxgroup');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            showCheckBoxes: true,
            selectType: 'simple',
            captionField: 'caption',
            valueField: 'value'
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            checkedAll: { target: 'checkedAll', prio: 1005 }
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }

        this._listView.on('afterLoad', this._onAfterLoad, this);
    }

    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------

    // Alle Checkboxen auswählen / sind ausgewählt
    get checkedAll () { return this.value.length === this.data.length ? true : false; }
    set checkedAll (val) {
        this._checkedAll = !!val;

        if (!this._autoLoad && this.data) {
           this._checkeAll(val);
        }
    }

    // Checkboxen die ausgewählt werden sollen / sind
    // TODO: unterschied zu value?
    get checkedValues () { return this.value.length ? this.value : []; }
    set checkedValues (val) {
        let value = this.value;

        if (!kijs.isArray(val)){
            val = [val];
        }
        kijs.Array.each(val, function(v){
            if (kijs.Array.contains(value, v)){
                kijs.Array.remove(value, v);
            } else {
                value.push(v);
            }

        }, this);

        this.value = value;
    }

    _checkeAll(val) {
        let ids = [];

        if (val) {
            kijs.Array.each(this.data, function (row) {
                ids.push(row[this.valueField]);
            }, this);
        }
        this.value = ids;
    }

    // Events
    _onAfterLoad(e) {
        if (this._checkedAll) {
            this._checkeAll(true);
        }
    }


};
