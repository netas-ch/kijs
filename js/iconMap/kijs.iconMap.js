/* global kijs */

// --------------------------------------------------------------
// kijs.iconMap (Static)
// --------------------------------------------------------------
kijs.iconMap = class kijs_iconMap {
    
    // --------------------------------------------------------------
    // STATIC GETTERS / SETTERS
    // --------------------------------------------------------------
    static get defaultCls() {
        if (kijs.isEmpty(kijs.iconMap.__defaultCls)) {
            kijs.iconMap.__defaultCls = 'fa-solid';
        }
        return kijs.iconMap.__defaultCls;
    }
    
    static set defaultCls(val) {
        kijs.iconMap.__defaultCls = val;
    }


    // --------------------------------------------------------------
    // STATICS
    // --------------------------------------------------------------
    // Static Properties in this Class
    // __defaultCls {String|null}
};
