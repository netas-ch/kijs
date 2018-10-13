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
        
        this._dom.clsRemove('kijs-field-listview');
        this._dom.clsAdd('kijs-field-checkboxgroup');
    
        // Standard-config-Eigenschaften mergen
        config = Object.assign({}, {
            showCheckBoxes: true,
            selectType: 'simple'
        }, config);
                
        // Config anwenden
        if (kijs.isObject(config)) {
            this.applyConfig(config, true);
        }
    }
};