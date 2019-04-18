/* global kijs */

// --------------------------------------------------------------
// kijs.gui (Static)
// --------------------------------------------------------------
kijs.gui = class kijs_gui {
    
    
    // --------------------------------------------------------------
    // STATICS
    // --------------------------------------------------------------
    /**
     * Erstellt einen Namespace
     * @param {String} xtype    Beispiel: 'kijs.gui.Element'
     * @returns {kijs.gui.Element|null}
     */
    static getClassFromXtype(xtype) {
        const parts = xtype.split('.');
        let parent = window;
        
        for (let i=0; i<parts.length; i++) {
            let part = parts[i];
            if (!parent[part]) {
                console.log(part);
                return null;
            }
            parent = parent[part];
        }
        return parent;
    }
    
    
};
