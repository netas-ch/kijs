/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.field.CheckboxGroup
// --------------------------------------------------------------
/**
 * Gruppe von Checkboxen (kijs.gui.field.ListView mit selectType 'simple-multi'). Der Wert ist ein
 * Array mit den valueField-Werten der ausgewählten Einträge. Die Daten haben standardmässig die
 * Felder value und displayText.
 *
 * @example
 * new kijs.gui.field.CheckboxGroup({
 *     label: 'Farben',
 *     name: 'farben',
 *     data: [ { value: 'r', displayText: 'Rot' }, { value: 'g', displayText: 'Grün' } ]
 * });
 */
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
            clearButtonCls: '',
            disableFlex: true,
            showCheckBoxes: true,
            selectType: 'simple-multi',
            displayTextField: 'displayText',
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
    }



    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    /**
     * Sind alle Checkboxen ausgewählt? Beim Setzen werden alle aus- bzw. abgewählt, mit true auch
     * nach jedem load().
     * @type {Boolean}
     */
    get checkedAll () {
        // value ist null, wenn nichts ausgewählt ist
        const value = this.value;
        return (kijs.isArray(value) ? value.length : 0) === (this.data ? this.data.length : 0);
    }
    set checkedAll (val) {
        this._checkedAll = !!val;
        if (this.data) {
           this._checkAll(val);
        }
    }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // overwrite
    load(args, superCall=false) {
        return super.load(args, true).then((e) => {
            if (kijs.isEmpty(e.response.errorType)) {
                if (this._checkedAll) {
                    this._checkAll(true);
                }

                // 'afterLoad' auslösen
                if (!superCall) {
                    this.raiseEvent('afterLoad', e);
                }
            }
        });
    }


    // PROTECTED
    /**
     * Wählt alle Einträge aus (value = alle valueField-Werte) bzw. keinen.
     * @param {Boolean} val
     * @returns {undefined}
     */
    _checkAll(val) {
        let ids = [];

        if (val) {
            kijs.Array.each(this.data, function (row) {
                ids.push(row[this.valueField]);
            }, this);
        }
        this.value = ids;
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
