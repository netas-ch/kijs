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
        this._iconCharField = null;
        this._iconClsField = null;
        this._iconAnimationClsField = null;
        this._iconColorField = null;
        this._iconMapField = null;
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
            iconCharField: true,
            iconClsField: true,
            iconAnimationClsField: true,
            iconColorField: true,
            iconMapField: true,
            showCheckBoxes: true,
            tooltipField: true,
            valueField: true,

            value: { target: 'value' }
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

    get iconAnimationClsField() { return this._iconAnimationClsField; }
    set iconAnimationClsField(val) { this._iconAnimationClsField = val; }

    get iconCharField() { return this._iconCharField; }
    set iconCharField(val) { this._iconCharField = val; }

    get iconClsField() { return this._iconClsField; }
    set iconClsField(val) { this._iconClsField = val; }

    get iconColorField() { return this._iconColorField; }
    set iconColorField(val) { this._iconColorField = val; }

    get iconMapField() { return this._iconMapField; }
    set iconMapField(val) { this._iconMapField = val; }

    get showCheckBoxes() { return this._showCheckBoxes; }
    set showCheckBoxes(val) { this._showCheckBoxes = val; }

    get tooltipField() { return this._tooltipField; }
    set tooltipField(val) { this._tooltipField = val; }

    get value() {
        let val = null;
        
        if (!kijs.isEmpty(this._data) && this._valueField) {
            let selElements = this.getSelected();
            if (kijs.isArray(selElements)) {
                val = [];
                kijs.Array.each(selElements, function(el) {
                    val.push(el.dataRow[this._valueField]);
                }, this);
            } else if (!kijs.isEmpty(selElements)) {
                val = selElements.dataRow[this._valueField];
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
