/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.ListView
// --------------------------------------------------------------
kijs.gui.ListView = class kijs_gui_ListView extends kijs.gui.DataView {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        this._displayTextDisplayType = 'code';

        // Standard-Icon (optional)
        this._iconMap = null;
        this._iconChar = null;
        this._iconCls = null;
        this._iconAnimationCls = null;
        this._iconColor = null;

        this._showCheckBoxes = false;
        this._value = null;

        this._dom.clsRemove('kijs-dataview');
        this._dom.clsAdd('kijs-listview');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            elementXType: 'kijs.gui.dataView.element.ListView',
            selectType: 'single',
            valueField: 'value',
            displayTextField: 'displayText'
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            displayTextField: { target: 'displayTextField' },
            displayTextDisplayType: true,

            iconMap: true,
            iconChar: true,
            iconCls: true,
            iconAnimationCls: true,
            iconColor: true,

            clsField: { target: 'clsField' },
            iconMapField: { target: 'iconMapField' },
            iconCharField: { target: 'iconCharField' },
            iconClsField: { target: 'iconClsField' },
            iconAnimationClsField: { target: 'iconAnimationClsField' },
            iconColorField: { target: 'iconColorField' },

            showCheckBoxes: true,
            tooltipField: { target: 'tooltipField' },
            valueField: { target: 'valueField' },

            value: { prio: 200, target: 'value' }
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
    get clsField() { return this._fieldsMapping.clsField; }
    set clsField(val) { this._fieldsMapping.clsField = val; }

    // overwrite
    get data() { return this._data; }
    // overwrite
    set data(val) {
        // Sicherstellen, dass nach dem Zuweisen von data der value erhalten bleibt
        let v = this.value;
        super.data = val;
        this.value = v;
    }

    get displayTextDisplayType() { return this._displayTextDisplayType; }
    set displayTextDisplayType(val) { this._displayTextDisplayType = val; }

    get displayTextField() { return this._fieldsMapping.displayTextField; }
    set displayTextField(val) { this._fieldsMapping.displayTextField = val; }

    get iconAnimationCls() { return this._iconAnimationCls; }
    set iconAnimationCls(val) { this._iconAnimationCls = val; }

    get iconAnimationClsField() { return this._fieldsMapping.iconAnimationClsField; }
    set iconAnimationClsField(val) { this._fieldsMapping.iconAnimationClsField = val; }

    get iconChar() { return this._iconChar; }
    set iconChar(val) { this._iconChar = val; }

    get iconCharField() { return this._fieldsMapping.iconCharField; }
    set iconCharField(val) { this._fieldsMapping.iconCharField = val; }

    get iconCls() { return this._iconCls; }
    set iconCls(val) { this._iconCls= val; }

    get iconClsField() { return this._fieldsMapping.iconClsField; }
    set iconClsField(val) { this._fieldsMapping.iconClsField = val; }

    get iconColor() { return this._iconColor; }
    set iconColor(val) { this._iconColor = val; }

    get iconColorField() { return this._fieldsMapping.iconColorField; }
    set iconColorField(val) { this._fieldsMapping.iconColorField = val; }

    get iconMap() { return this._iconMap; }
    set iconMap(val) { this._iconMap = val; }

    get iconMapField() { return this._fieldsMapping.iconMapField; }
    set iconMapField(val) { this._fieldsMapping.iconMapField = val; }

    get showCheckBoxes() { return this._showCheckBoxes; }
    set showCheckBoxes(val) { this._showCheckBoxes = val; }

    get tooltipField() { return this._fieldsMapping.tooltipField; }
    set tooltipField(val) { this._fieldsMapping.tooltipField = val; }

    get value() {
        let val = null;

        if (!kijs.isEmpty(this._data) && this._fieldsMapping.valueField) {
            let rows = this.getSelectedRows();
            if (!kijs.isEmpty(rows)) {
                val = [];
                kijs.Array.each(rows, function(row) {
                    val.push(row[this._fieldsMapping.valueField]);
                }, this);

                let returnAsArray = true;
                switch (this._selectType) {
                    case 'none':
                    case 'single':
                    case 'singleAndEmpty':
                    case 'simple-single':
                    case 'simple-singleAndEmpty':
                        returnAsArray = false;
                        break;

                    case 'multi':
                    case 'simple-multi':
                        returnAsArray = true;
                        break;

                    case 'manual':
                        returnAsArray = val.length > 1;
                        break;

                }

                // bei nur einem Wert direkt den Wert, ohne Array zurückgeben
                if (!returnAsArray) {
                    if (val.length === 1) {
                        val = val[0];
                    } else if (val.length === 0) {
                        val = null;
                    }
                }
            }

        } else {
            val = this._value;

        }

        return val;
    }
    set value(val) {
        if (kijs.isEmpty(this._fieldsMapping.valueField)) {
            throw new kijs.Error(`Es wurde kein "valueField" definiert.`);
        }

        this._value = val;

        let filters = null;

        if (kijs.isArray(val)) {
            filters = {
                operator: 'OR',
                parts:[]
            };
            kijs.Array.each(val, function(v) {
                if (!kijs.isEmpty(v)) {
                    filters.parts.push({
                        field: this._fieldsMapping.valueField,
                        operator: '=',
                        value: v
                    });
                }
            }, this);
        } else if (!kijs.isEmpty(val)) {
            filters = {
                field: this._fieldsMapping.valueField,
                operator: '=',
                value: val
            };
        }
        this.selectByFilters(filters, false, true);
    }

    get valueField() { return this._fieldsMapping.valueField; }
    set valueField(val) {
        this._fieldsMapping.valueField = val;
        if (kijs.isEmpty(val)) {
            this._primaryKeyFields = [];
        } else {
            this._primaryKeyFields = [val];
        }
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

        // Variablen (Objekte/Arrays) leeren
        this._value = null;

        // Basisklasse entladen
        super.destruct(true);
    }

};
