/* global kijs */

// --------------------------------------------------------------
// kijs.gui.Dom (Static)
// --------------------------------------------------------------
kijs.gui.DragDrop = class kijs_gui_DragDrop {
     
    // PRIVATE VARS
    // __source {kijs.gui.Element} Element das aktuell gezogen wird
    // __target {kijs.gui.Element} Ziel-Element
    // __data   {Object} Objekt für die Zuweisung beliebiger Daten
    // __dropMarkerDom {kijs.gui.Dom} Marker, der die Einfügeposition visualisiert
    
    
    // --------------------------------------------------------------
    // STATIC GETTERS / SETTERS
    // --------------------------------------------------------------
    static get data() {
        if (!kijs.isDefined(this.__data)) {
            this.__data = {};
        }
        return this.__data;
    }
    static set data(val) {
        if (kijs.isObject(val)) {
            this.__data = val;
        } else {
            throw new kijs.Error(`kijs.gui.DragDrop.data must be an object.`);
        }
    }
    
    // Gibt den kijs.gui.Dom des DropMarkers zurück, der die Einfügeposition beim 
    // dragOver anzeigt
    static get dropMarkerDom() {
        if (!kijs.isDefined(this.__dropMarkerDom)) {
            this.__dropMarkerDom = new kijs.gui.Dom({
                cls: 'kijs-dropmarker'
            });
        }
        return this.__dropMarkerDom;
    }
    
    // kijs.gui.Element der aktuellen Drag&Drop-Operation
    static get source() { 
        if (!kijs.isDefined(this.__source)) {
            this.__source = null;
        }
        return this.__source; 
    }    
    static set source(val) {
        this.__source = val;
    }
    
    static get target() {
        if (!kijs.isDefined(this.__target)) {
            this.__target = null;
        }
        return this.__target;
    }
    static set target(val) {
        this.__target = val;
    }
    
    
    
    // --------------------------------------------------------------
    // STATICS
    // --------------------------------------------------------------
    /**
     * Entfernt den Marker, der die Einfügeposition anzeigt
     * @returns {undefined}
     */
    static dropMarkerRemove() {
        if (this.dropMarkerDom.node && this.dropMarkerDom.node.parentNode) {
            this.dropMarkerDom.node.parentNode.removeChild(this.dropMarkerDom.node);
        }
    }
    
    /**
     * Erstellt den effectAllowed-String aus boolschen Variablen
     * @param {Boolean} ddAllowMove
     * @param {Boolean} ddAllowCopy
     * @param {Boolean} ddAllowLink
     * @returns {String}
     */
    static getddEffect(ddAllowMove, ddAllowCopy, ddAllowLink) {
        let ret = '';
        
        if (ddAllowCopy) {
            ret += 'Copy';
        }
        if (ddAllowLink) {
            ret += 'Link';
        }
        if (ddAllowMove) {
            ret += 'Move';
        }
        
        // nichts => 'none'
        if (!ret) {
            ret = 'none';
        }
        
        // 1. Buchstaben klein machen
        ret = ret.substring(0,1).toLowerCase() + ret.substring(1);
        
        // 'copyLinkMove' => 'all'
        if (ret === 'copyLinkMove') {
            ret = 'all';
        }
        
        return ret;
    }
    
    
    
    // --------------------------------------------------------------
    // dropFn-Funktionen für Drag&Drop-mapping
    // --------------------------------------------------------------
    // Verschiebt das Element an den neuen Ort
    static dropFnMoveEl(e) {
        // vom alten Ort entfernen
        e.source.ownerEl.parent.remove(e.source.ownerEl, false, true, false);
        
        // und beim neuen Ort wieder einfügen
        switch (e.target.targetPos){
            case 'child':
                e.target.targetEl.add(e.source.ownerEl);
                break;
                
            case 'before':
                e.target.targetEl.parent.add(e.source.ownerEl, e.target.targetEl.index);
                break;
                
            case 'after':
                e.target.targetEl.parent.add(e.source.ownerEl, e.target.targetEl.index+1);
                break;
        }
    }
    
    static dropFnGetSourceIndex(e) {
        return e.source.ownerEl.index;
    }
    
    static dropFnGetSourceEl(e) {
        return e.source.ownerEl;
    }
    
    // Gibt die Einfügeposition im Ziel Container zurück
    static dropFnGetTargetIndex(e) {
        let targetIndex = null;
        
        // Zielindex ermitteln
        switch (e.target.targetPos){
            case 'child':
                targetIndex = e.target.targetEl.elements.length;
                break;
                
            case 'before':
                targetIndex =  e.target.targetEl.index;
                break;
                
            case 'after':
                targetIndex =  e.target.targetEl.index + 1;
                break;
        }
        
        return targetIndex;
    }
    
    static dropFnGetTargetEl(e) {
        return e.target.ownerEl;
    }

};
