/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.field.OptionGroup
// --------------------------------------------------------------
kijs.gui.field.OptionGroup = class kijs_gui_field_OptionGroup extends kijs.gui.field.CheckboxGroup {
    

    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);
    
        // Standard-config-Eigenschaften mergen
        config = Object.assign({}, {
            checkedIconChar: '&#xf05d',
            uncheckedIconChar: '&#xf10c'
            
        }, config);
                
        // Config anwenden
        if (kijs.isObject(config)) {
            this.applyConfig(config, true);
        }
    }
    
    
    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    // overwrite
    get value() {
        const val = super.value;
        if (kijs.isEmpty(val)) {
            return null;
        } else {
            return val[0];
        }
    }
    set value(val) {
        super.value = val;
    }


    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // LISTENERS
    // overwrite
    _onCheckboxElementInput(e) {
        // Bei singleSelect kann eine Checkbox nicht unchecked werden
        if (e.checked === 0) {
            e.element.checked = 1;
            return;
        }
        // sicherstellen, dass nur eine Checkbox ausgewählt ist
        kijs.Array.each(this._checkboxElements, function(el) {
            if (e.element !== el) {
                el.checked = 0;
            }
        }, this);
        
        const val = e.value;
        
        this._value = [val];
        this.raiseEvent('input', { 
            oldValue: (kijs.isEmpty(this._oldValue) ? null : this._oldValue[0]),
            value: (kijs.isEmpty(val) ? null : val)
        });
        this._oldValue = [val];
    }
};