/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.field.OptionGroup
// --------------------------------------------------------------
/**
 * Gruppe von Optionsfeldern (kijs.gui.field.ListView mit selectType 'single'). Ohne required kann
 * die Auswahl auch wieder aufgehoben werden ('singleAndEmpty'). Die Daten haben standardmässig die
 * Felder value und displayText.
 *
 * @example
 * new kijs.gui.field.OptionGroup({
 *     label: 'Anrede',
 *     name: 'anrede',
 *     required: true,
 *     data: [ { value: 'f', displayText: 'Frau' }, { value: 'm', displayText: 'Herr' } ]
 * });
 */
kijs.gui.field.OptionGroup = class kijs_gui_field_OptionGroup extends kijs.gui.field.ListView {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        this._dom.clsRemove('kijs-field-listview');
        this._dom.clsAdd('kijs-field-optiongroup');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            clearButtonCls: '',
            disableFlex: true,
            showCheckBoxes: true,
            selectType: 'single',
            valueField: 'value',
            displayTextField: 'displayText'
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
    // overwrite
    get required() { return super.required; }
    set required(val) {
        this.selectType = val ? 'single' : 'singleAndEmpty';
        super.required = !!val;
    }
    
};
