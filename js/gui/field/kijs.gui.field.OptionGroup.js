/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.field.OptionGroup
// --------------------------------------------------------------
kijs.gui.field.OptionGroup = class kijs_gui_field_OptionGroup extends kijs.gui.field.ListView {
    

    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);
        
        this._dom.clsRemove('kijs-field-listview');
        this._dom.clsAdd('kijs-field-optiongroup');
    
        // Standard-config-Eigenschaften mergen
        config = Object.assign({}, {
            showCheckBoxes: true,
            selectType: 'single'
        }, config);
                
        // Config anwenden
        if (kijs.isObject(config)) {
            this.applyConfig(config, true);
        }
    }
};