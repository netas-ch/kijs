/* global kijs, this */


// TODO: Eigenschaft "checkedValues" entfernen. Der Name ist verwirrend und es besteht eine grosse 
// Ähnlichkeit zu value. Evtl. dafür neue Funktionen: checkAll(), uncheckAll() oder noch besser die 
// Filter des zugrundeliegenden DataView verwenden.

// --------------------------------------------------------------
// kijs.gui.field.CheckboxGroup
// --------------------------------------------------------------
kijs.gui.field.CheckboxGroup = class kijs_gui_field_CheckboxGroup extends kijs.gui.field.ListView {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        this._checkedAll = false;

        this._dom.clsRemove('kijs-field-listview');
        this._dom.clsAdd('kijs-field-checkboxgroup');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            disableFlex: true,
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

        this.on('afterLoad', this.#onAfterLoad, this);
    }



    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    // Alle Checkboxen auswählen / sind ausgewählt
    get checkedAll () { return this.value.length === this.data.length; }
    set checkedAll (val) {
        this._checkedAll = !!val;
        if (this.data) {
           this._checkAll(val);
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



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // PROTECTED
    _checkAll(val) {
        let ids = [];

        if (val) {
            kijs.Array.each(this.data, function (row) {
                ids.push(row[this.valueField]);
            }, this);
        }
        this.value = ids;
    }

    
    // PRIVATE
    // LISTENERS
    #onAfterLoad(e) {
        if (this._checkedAll) {
            this._checkAll(true);
        }
        this.raiseEvent('afterLoad', e);
    }
    
    
    
    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    destruct(superCall) {
        if (!superCall) {
            // unrender
            this.unrender(superCall);

            // Event auslösen.
            this.raiseEvent('destruct');
        }

        // Elemente/DOM-Objekte entladen

        // Variablen (Objekte/Arrays) leeren

        // Basisklasse entladen
        super.destruct(true);
    }

};
