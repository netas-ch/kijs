/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.ListView
// --------------------------------------------------------------
kijs.gui.ListView = class kijs_gui_ListView extends kijs.gui.DataView {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        this._captionField = null;
        this._captionHtmlDisplayType = 'html';
        this._valueField = null;
        this._iconCharField = null;
        this._iconClsField = null;
        this._iconColorField = null;
        this._toolTipField = null;
        this._showCheckBoxes = false;
        this._value = null;
        this._ddSort = false;

        this._dom.clsRemove('kijs-dataview');
        this._dom.clsAdd('kijs-listview');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            selectType: 'single'
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            captionField: true,
            iconCharField: true,
            iconClsField: true,
            iconColorField: true,
            showCheckBoxes: true,
            toolTipField: true,
            valueField: true,
            ddSort: true,

            value: { target: 'value' }
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }

        this.applyConfig(config);

        // Events
        this.on('afterLoad', this._onAfterLoad, this);
    }


    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get captionField() { return this._captionField; }
    set captionField(val) { this._captionField = val; }

    get ddSort() { return this._ddSort; }
    set ddSort(val) { this._ddSort = !!val; }

    get iconCharField() { return this._iconCharField; }
    set iconCharField(val) { this._iconCharField = val; }

    get iconClsField() { return this._iconClsField; }
    set iconClsField(val) { this._iconClsField = val; }

    get iconColorField() { return this._iconColorField; }
    set iconColorField(val) { this._iconColorField = val; }

    get showCheckBoxes() { return this._showCheckBoxes; }
    set showCheckBoxes(val) { this._showCheckBoxes = val; }

    get toolTipField() { return this._toolTipField; }
    set toolTipField(val) { this._toolTipField = val; }

    get valueField() { return this._valueField; }
    set valueField(val) { this._valueField = val; }

    get value() {
        let val = null;

        if (this._valueField) {
            let selElements = this.getSelected();
            if (kijs.isArray(selElements)) {
                val = [];
                kijs.Array.each(selElements, function(el) {
                    val.push(el.dataRow[this._valueField]);
                }, this);
            } else if (!kijs.isEmpty(selElements)) {
                val = selElements.dataRow[this._valueField];
            }
        }

        return val;
    }
    set value(val) {
        if (kijs.isEmpty(this._valueField)) {
            throw new kijs.Error(`Es wurde kein "valueField" definiert.`);
        }

        this._value = val;

        let filters = [];

        if (kijs.isArray(val)) {
            kijs.Array.each(val, function(v) {
                filters.push({
                    field: this._valueField,
                    value: v
                });
            }, this);
        } else if (!kijs.isEmpty(val)) {
            filters = {
                field: this._valueField,
                value: val
            };
        }
        this.selectByFilters(filters, false, true);
    }


    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // overwrite
    createElement(dataRow, index) {
        let html = '';

        // Icon/Color
        html += '<span class="kijs-icon';
        if (!kijs.isEmpty(this._iconClsField) && !kijs.isEmpty(dataRow[this._iconClsField])) {
            html += ' ' + dataRow[this._iconClsField];
        }
        html += '"';

        if (!kijs.isEmpty(this._iconColorField) && !kijs.isEmpty(dataRow[this._iconColorField])) {
            html += ' style="color:' + dataRow[this._iconColorField] + '"';
        }
        html += '>';
        if (!kijs.isEmpty(this._iconCharField) && !kijs.isEmpty(dataRow[this._iconCharField])) {
            html += dataRow[this._iconCharField];
        }
        html += '</span>';

        // Caption
        html += '<span class="kijs-caption">';
        if (!kijs.isEmpty(this._captionField) && !kijs.isEmpty(dataRow[this._captionField])) {
            html += dataRow[this._captionField];
        }
        html += '</span>';

        // ToolTip
        let toolTip = '';
        if (!kijs.isEmpty(this._toolTipField) && !kijs.isEmpty(dataRow[this._toolTipField])) {
            toolTip = dataRow[this._toolTipField];
        }

        // Checkbox
        let cls = '';
        if (this._showCheckBoxes) {
            switch (this._selectType) {
                case 'single':
                    cls = 'kijs-display-options';
                    break;

                case 'simple':
                case 'multi':
                    cls = 'kijs-display-checkboxes';
                    break;

            }
        }

        let dve = new kijs.gui.DataViewElement({
            dataRow: dataRow,
            html: html,
            toolTip: toolTip,
            cls: cls
        });

        // Drag-Drop Events setzen
        kijs.DragDrop.addDragEvents(dve, dve.dom);
        kijs.DragDrop.addDropEvents(dve, dve.dom);

        dve.on('ddOver', this._onDdOver, this);
        dve.on('ddDrop', this._onDdDrop, this);

        return dve;
    }

    // LISTENERS
    _onAfterLoad(e) {
        if (!kijs.isEmpty(this._value)) {
            this.value = this._value;
        }
    }

    _onDdDrop(e) {
        let tIndex = this._elements.indexOf(e.targetElement);
        let sIndex = this._elements.indexOf(e.sourceElement);
        let pos = e.position.position;

        if (this.raiseEvent('ddDrop', e) === false) {
            return;
        }

        if (this._ddSort && tIndex !== -1 && sIndex !== -1 && tIndex !== sIndex && (pos === 'above' || pos === 'below')) {
            if (pos === 'below') {
                tIndex += 1;
            }

            // Element im Array an richtige Position schieben
            kijs.Array.move(this._elements, sIndex, tIndex);

            if (this.isRendered) {
                this.render();
            }

        }
    }

    _onDdOver(e) {
        if (!this._ddSort || this._elements.indexOf(e.sourceElement) === -1 || this.raiseEvent('ddOver', e) === false) {
            // fremdes Element, kein Drop.
            e.position.allowAbove = false;
            e.position.allowBelow = false;
            e.position.allowLeft = false;
            e.position.allowOnto = false;
            e.position.allowRight = false;

        } else {
            // erlaubte Positionen (ober-, unterhalb)
            e.position.allowAbove = true;
            e.position.allowBelow = true;
            e.position.allowLeft = false;
            e.position.allowOnto = false;
            e.position.allowRight = false;
        }
    }




    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
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