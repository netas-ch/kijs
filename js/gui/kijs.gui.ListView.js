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

        this._captionField = null;
        this._captionHtmlDisplayType = 'code';
        this._valueField = null;

        // Standard-Icon (optional)
        this._iconMap = null;
        this._iconChar = null;
        this._iconCls = null;
        this._iconAnimationCls = null;
        this._iconColor = null;

        // Feldnamen (optional)
        this._clsField = null;
        this._iconMapField = null;
        this._iconCharField = null;
        this._iconClsField = null;
        this._iconAnimationClsField = null;
        this._iconColorField = null;
        
        this._tooltipField = null;
        this._showCheckBoxes = false;
        this._value = null;

        this._dom.clsRemove('kijs-dataview');
        this._dom.clsAdd('kijs-listview');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            elementXType: 'kijs.gui.dataView.element.ListView',
            selectType: 'single'
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            captionField: true,
            captionHtmlDisplayType: true,

            iconMap: true,
            iconChar: true,
            iconCls: true,
            iconAnimationCls: true,
            iconColor: true,

            clsField: true,
            iconMapField: true,
            iconCharField: true,
            iconClsField: true,
            iconAnimationClsField: true,
            iconColorField: true,

            showCheckBoxes: true,
            tooltipField: true,
            valueField: true,

            value: { prio: 200, target: 'value' }
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }

        // Events
        this.on('afterLoad', this.#onAfterLoad, this);
    }



    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get captionHtmlDisplayType() { return this._captionHtmlDisplayType; }    
    set captionHtmlDisplayType(val) { this._captionHtmlDisplayType = val; }
    
    get captionField() { return this._captionField; }
    set captionField(val) { this._captionField = val; }

    get clsField() { return this._clsField; }
    set clsField(val) { this._clsField = val; }
    
    get iconAnimationCls() { return this._iconAnimationCls; }
    set iconAnimationCls(val) { this._iconAnimationCls = val; }

    get iconAnimationClsField() { return this._iconAnimationClsField; }
    set iconAnimationClsField(val) { this._iconAnimationClsField = val; }

    get iconChar() { return this._iconChar; }
    set iconChar(val) { this._iconChar = val; }

    get iconCharField() { return this._iconCharField; }
    set iconCharField(val) { this._iconCharField = val; }

    get iconCls() { return this._iconCls; }
    set iconCls(val) { this._iconCls= val; }

    get iconClsField() { return this._iconClsField; }
    set iconClsField(val) { this._iconClsField = val; }

    get iconColor() { return this._iconColor; }
    set iconColor(val) { this._iconColor = val; }

    get iconColorField() { return this._iconColorField; }
    set iconColorField(val) { this._iconColorField = val; }

    get iconMap() { return this._iconMap; }
    set iconMap(val) { this._iconMap = val; }

    get iconMapField() { return this._iconMapField; }
    set iconMapField(val) { this._iconMapField = val; }

    get showCheckBoxes() { return this._showCheckBoxes; }
    set showCheckBoxes(val) { this._showCheckBoxes = val; }

    get tooltipField() { return this._tooltipField; }
    set tooltipField(val) { this._tooltipField = val; }

    get value() {
        let val = null;

        if (!kijs.isEmpty(this._data) && this._valueField) {
            let rows = this.getSelectedRows();
            if (!kijs.isEmpty(rows)) {
                val = [];
                kijs.Array.each(rows, function(row) {
                    if (kijs.isEmpty(this.disabledField) || kijs.isEmpty(row[this.disabledField]) || !row[this.disabledField]) {
                        val.push(row[this._valueField]);
                    }
                }, this);

                let returnAsArray = true;
                switch (this._selectType) {
                    case 'none':
                    case 'single':
                    case 'singleAndEmpty':
                        returnAsArray = false;
                        break;

                    case 'multi':
                    case 'simple':
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
        if (kijs.isEmpty(this._valueField)) {
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
                        field: this._valueField,
                        operator: '=',
                        value: v
                    });
                }
            }, this);
        } else if (!kijs.isEmpty(val)) {
            filters = {
                field: this._valueField,
                operator: '=',
                value: val
            };
        }
        this.selectByFilters(filters, false, true);
    }

    get valueField() { return this._valueField; }
    set valueField(val) { this._valueField = val; }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // PRIVATE
    // LISTENERS
    #onAfterLoad(e) {
        if (!kijs.isEmpty(this._value)) {
            this.value = this._value;
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
