/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.ListView
// --------------------------------------------------------------
/**
 * Liste zum Auswählen von Datensätzen (DataView mit Elementen vom Typ
 * kijs.gui.dataView.element.ListView). Jeder Eintrag zeigt einen Text und optional ein Icon,
 * Optionsfeld oder Checkbox. Der Wert (value) ist der Inhalt von valueField der selektierten
 * Datensätze. valueField wird auch als primaryKeyFields verwendet.
 *
 * Für Text, Icon, CSS-Klasse und Tooltip können Feldnamen der Datensätze angegeben werden
 * (…Field). Ist für das Icon kein Feldname angegeben, gilt das Icon der ListView für alle Einträge.
 *
 * @example
 * new kijs.gui.ListView({
 *     data: [ { value: 1, displayText: 'Eins' }, { value: 2, displayText: 'Zwei' } ],
 *     value: 2
 * });
 */
kijs.gui.ListView = class kijs_gui_ListView extends kijs.gui.DataView {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        this._displayTextField = null;
        this._displayTextDisplayType = 'code';
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
            selectType: 'single',
            valueField: 'value',
            displayTextField: 'displayText'
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            displayTextField: true,
            displayTextDisplayType: true,

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

            valueField: { prio: 60, target: 'valueField' },
            primaryKeyFields: { prio: 61, target: 'primaryKeyFields' },

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
    /**
     * Name des Felds mit zusätzlichen CSS-Klassen pro Eintrag
     * @type {String|null}
     */
    get clsField() { return this._clsField; }
    set clsField(val) { this._clsField = val; }

    /**
     * Recordset mit den Daten (siehe kijs.gui.DataView.data). Der Wert (value) bleibt beim Zuweisen erhalten.
     * @type {Array}
     */
    // overwrite
    get data() { return this._data; }
    // overwrite
    set data(val) {
        // Sicherstellen, dass nach dem zuweisen von data der value erhalten bleibt
        let v = this.value;
        super.data = val;
        this.value = v;
    }

    /**
     * Darstellung des Texts: 'html', 'code' oder 'text' (siehe kijs.gui.Dom.htmlDisplayType). Default: 'code'
     * @type {String}
     */
    get displayTextDisplayType() { return this._displayTextDisplayType; }
    set displayTextDisplayType(val) { this._displayTextDisplayType = val; }

    /**
     * Name des Felds mit dem angezeigten Text. Default: 'displayText'
     * @type {String|null}
     */
    get displayTextField() { return this._displayTextField; }
    set displayTextField(val) { this._displayTextField = val; }

    /**
     * CSS-Klasse für eine Animation des Icons aller Einträge (ohne iconAnimationClsField)
     * @type {String|null}
     */
    get iconAnimationCls() { return this._iconAnimationCls; }
    set iconAnimationCls(val) { this._iconAnimationCls = val; }

    /**
     * Name des Felds mit der CSS-Klasse für eine Animation des Icons
     * @type {String|null}
     */
    get iconAnimationClsField() { return this._iconAnimationClsField; }
    set iconAnimationClsField(val) { this._iconAnimationClsField = val; }

    /**
     * Zeichen des Icons aller Einträge (ohne iconCharField, siehe kijs.gui.Icon.iconChar)
     * @type {Number|null}
     */
    get iconChar() { return this._iconChar; }
    set iconChar(val) { this._iconChar = val; }

    /**
     * Name des Felds mit dem Zeichen des Icons
     * @type {String|null}
     */
    get iconCharField() { return this._iconCharField; }
    set iconCharField(val) { this._iconCharField = val; }

    /**
     * CSS-Klasse des Icons aller Einträge (ohne iconClsField)
     * @type {String|null}
     */
    get iconCls() { return this._iconCls; }
    set iconCls(val) { this._iconCls= val; }

    /**
     * Name des Felds mit der CSS-Klasse des Icons
     * @type {String|null}
     */
    get iconClsField() { return this._iconClsField; }
    set iconClsField(val) { this._iconClsField = val; }

    /**
     * Farbe des Icons aller Einträge (ohne iconColorField)
     * @type {String|null}
     */
    get iconColor() { return this._iconColor; }
    set iconColor(val) { this._iconColor = val; }

    /**
     * Name des Felds mit der Farbe des Icons
     * @type {String|null}
     */
    get iconColorField() { return this._iconColorField; }
    set iconColorField(val) { this._iconColorField = val; }

    /**
     * Icon aller Einträge aus einer iconMap (ohne iconMapField), z.B. 'kijs.iconMap.Fa.file'
     * @type {String|null}
     */
    get iconMap() { return this._iconMap; }
    set iconMap(val) { this._iconMap = val; }

    /**
     * Name des Felds mit dem Icon aus einer iconMap
     * @type {String|null}
     */
    get iconMapField() { return this._iconMapField; }
    set iconMapField(val) { this._iconMapField = val; }

    /**
     * Optionsfelder (bei einfacher Selektion) bzw. Checkboxen (bei multi) anzeigen? Default: false
     * @type {Boolean}
     */
    get showCheckBoxes() { return this._showCheckBoxes; }
    set showCheckBoxes(val) { this._showCheckBoxes = val; }

    /**
     * Name des Felds mit dem Tooltip pro Eintrag
     * @type {String|null}
     */
    get tooltipField() { return this._tooltipField; }
    set tooltipField(val) { this._tooltipField = val; }

    /**
     * Wert: der Inhalt von valueField der selektierten Datensätze.
     * - Bei einfacher Selektion ein einzelner Wert
     * - bei 'multi' und 'simple-multi' ein Array
     * - bei 'manual' ein Array nur bei mehreren Werten
     * - Nichts selektiert = null
     *
     * Der Setter selektiert die passenden Datensätze (ohne selectionChange); ohne valueField gibt es
     * einen Fehler.
     * @type {*|Array|null}
     */
    get value() {
        let val = null;

        if (!kijs.isEmpty(this._data) && this._valueField) {
            let rows = this.getSelectedRows();
            if (!kijs.isEmpty(rows)) {
                val = [];
                kijs.Array.each(rows, function(row) {
                    val.push(row[this._valueField]);
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

    /**
     * Name des Felds mit dem Wert. Wird auch als primaryKeyFields verwendet. Default: 'value'
     * @type {String|null}
     */
    get valueField() { return this._valueField; }
    set valueField(val) {
        this._valueField = val;

        // auch ins primaryKeyFields übernehmen
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
