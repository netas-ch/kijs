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
    // __targetDragOverDom {kijs.gui.Dom} Dom, das aktuellen targets, dass die CSS-Klasse kijs-targetDragOver hat

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

    // CSS-Klasse kijs-targetDragOver einem DOM zuweisen/entfernen
    static get targetDragOverDom() {
        if (!kijs.isDefined(this.__targetDragOverDom)) {
            this.__targetDragOverDom = null;
        }
        return this.__targetDragOverDom;
    }
    static set targetDragOverDom(val) {
        if (kijs.isDefined(this.__targetDragOverDom) && !kijs.isEmpty(this.__targetDragOverDom)) {
            this.__targetDragOverDom.clsRemove('kijs-targetDragOver');
        }
        
        if (!kijs.isEmpty(val)) {
            this.__targetDragOverDom = val;
            this.__targetDragOverDom.clsAdd('kijs-targetDragOver');
        } else {
            this.__targetDragOverDom = null;
        }
    }
    


    // --------------------------------------------------------------
    // STATICS
    // --------------------------------------------------------------
    /**
     * Entfernt den Marker, der die Einfügeposition anzeigt
     * @returns {undefined}
     */
    static dropMarkerRemove() {
        if (this.__dropMarkerDom && this.__dropMarkerDom.node && this.__dropMarkerDom.node.parentNode) {
            this.__dropMarkerDom.node.parentNode.removeChild(this.__dropMarkerDom.node);
        }
        this.__dropMarkerDom = null;
    }

    /**
     * Positioniert den dropMarker
     * @param {kijs.gui.Dom|Null} [targetDom=null] Null = ausblenden
     * @param {String|Null|} [targetPos=null] 'before', 'after', 'child' oder null zum ausblenden
     * @param {String|Null|} [tagName=null]
     * @param {Number|Null} [width=null] Breite des Markers
     * @param {Number|Null} [height=null] Höhe des Markers
     * @param {String|Array|Null} [markerCls=null]  zusätzliche CSS Klassen für Marker
     * @param {String|Null|} [markerHtml=null]       innerHTML für Marker
     * @returns {undefined}
     */
    static dropMarkerUpdate(targetDom=null, targetPos=null, tagName=null, 
        width=null, height=null, markerCls=null, markerHtml=null) {
        // evtl. nur ausblenden
        if (kijs.isEmpty(targetDom) || kijs.isEmpty(targetPos) || kijs.isEmpty(tagName)) {
            this.dropMarkerRemove();
            return;
        }

        let reCreate = true;
        if (this.__dropMarkerDom && this.__dropMarkerDom.node) {
            const currentTagName = this.__dropMarkerDom.node.tagName.toLowerCase();

            // falls der tagName noch stimmt, muss der node nicht neu erstellt werden
            if (currentTagName === tagName) {
                reCreate = false;
            }
        }

        // Evtl. den Marker neu erstellen
        if (reCreate) {
            this.dropMarkerRemove();

            this.__dropMarkerDom = new kijs.gui.Dom({
                nodeTagName: tagName
            });
        }

        // optionale CSS-Klassen hinzufügen
        this.__dropMarkerDom.clsRemoveAll();
        this.__dropMarkerDom.clsAdd('kijs-dropMarker');
        if (markerCls) {
            this.__dropMarkerDom.clsAdd(markerCls);
        }
        
        // evtl. HTML-Inhalt einfügen
        if (!kijs.isEmpty(markerHtml)) {
            this.__dropMarkerDom.html = markerHtml;
        } else {
            this.__dropMarkerDom.html = '';
        }
        
        // Grösse anpassen
        this.__dropMarkerDom.width = width;
        this.__dropMarkerDom.height = height;

        switch (targetPos) {
            case 'before':
            case 'after':
                this.__dropMarkerDom.renderTo(targetDom.node.parentNode, targetDom.node, targetPos);
                break;

            case 'child':
                this.__dropMarkerDom.renderTo(targetDom.node);
                break;
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
        e.source.ownerEl.parent.remove(e.source.ownerEl, {
            preventDestruct: true,
            preventUnrender: true,
            preventRender: false,
            preventEvents: false
        });

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
