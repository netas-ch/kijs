/* global kijs, HTMLElement */

// --------------------------------------------------------------
// kijs.gui.LayerManager (Singleton)
// --------------------------------------------------------------
// Der Layermanager wird verwendet um den z-index von Fenstern zu managen.
// Wird ein Fenster angeklickt, so wird der z-index aller Fenster mit dem gleichen 
// parentNode neu berechnet und es erscheint zuvorderst.
// Neben kijs.gui.Window können auch Masken (kijs.gui.Mask) in den Layermanager 
// aufgenommen werden. Dies ist bei modalen Fenster notwendig. Deren masken werden
// separat im Layermanager geführt.
// --------------------------------------------------------------
kijs.gui.LayerManager = class kijs_gui_LayerManager {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor() {
        // Singleton (es wird immer die gleiche Instanz zurückgegeben)
        if (!kijs_gui_LayerManager._singletonInstance) {
            kijs_gui_LayerManager._singletonInstance = this;

            // Variablen
            this._parents = new Map();  // Map mit allen parents
                                        // key = parentNode (HTMLElement)
                                        // value = {
                                        //   activeEl: Verweis auf das aktive Fenster (kijs.gui.Window|kijs.gui.Mask)
                                        //   stack: [
                                        //       el: Verweis auf Fenster/Maske (kijs.gui.Window|kijs.gui.Mask)
                                        //   ]
                                        // }
                                        //
                                        // Die Elemente im Stack sind normalerweise kijs.gui.Window.
                                        // Es können aber auch kijs.gui.Mask sein, dies sind die Mask-Layers von
                                        // modalen Fenstern, die einen eigenen z-index erhalten.
            
            this._startZIndex = 10000;
        }
        return kijs_gui_LayerManager._singletonInstance;
    }


    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    /**
     * Gibt das oberste Element zurück
     * @param {HTMLElement} parentNode
     * @returns {kijs.gui.Element|null}
     */
    getActive(parentNode) {
        const parentProp =  this._parents.get(parentNode);
        
        if (parentProp && parentProp.activeEl) {
            return parentProp.activeEl;
        } else {
            return null;
        }
    }
    

    /**
     * Bringt ein Element in den Vordergrund
     * @param {kijs.gui.Element} el
     * @returns {Boolean} Wurden Änderungen gemacht?
     */
    setActive(el) {
        // Ist das Element schon zuoberst?
        if (el === this.getActive(el.parentNode)) {
            return false;
        }
        
        // falls das Element schon drin ist: entfernen
        this.removeElement(el, true);
        
        // und am Ende wieder anfügen
        this.addElement(el);
        
        // z-indexe den Elementen neu zuweisen
        this._assignZIndexes(el.parentNode);

        // Oberstes sichtbares Element aktualisieren und Fokus setzen
        const parentProp =  this._parents.get(el.parentNode);
        parentProp.activeEl = this._getTopVisibleElement(el.parentNode);
        if (parentProp.activeEl) {
            parentProp.activeEl.focus();
        }

        return true;
    }
    
    /**
     * Fügt eine Element an
     * @param {kijs.gui.Element} el
     * @returns {undefined}
     */
    addElement(el) {
        let parentProp =  this._parents.get(el.parentNode);
        if (!parentProp) {
            parentProp = {
                activeEl: null,
                stack: []
            };
            this._parents.set(el.parentNode, parentProp);
        }
        
        // Wenn das Element schon drin ist: Fehler
        if (kijs.Array.contains(parentProp.stack, el)) {
            throw new kijs.Error(`element is duplicated in layermanager`);
        }
        
        parentProp.stack.push(el);
        
        // Listeners erstellen, damit wenn, dass Element entladen wird alles neu geordnet wird 
        // Wenn die Sichtbarkeit ändert, wird ein anderes element aktiviert
        el.on('destruct', this._onElementDestruct, this);
        el.on('changeVisibility', this._onElementChangeVisibility, this);
    }
    
    /**
     * Entfernt ein Element aus dem LayerManager
     * @param {kijs.gui.Element} el
     * @param {Boolean} [preventReorder=false] z-Indexe nicht neu zuweisen?
     * @returns {Boolean} Wurden Änderungen gemacht?
     */
    removeElement(el, preventReorder) {
        let changed = false;
        let parentProp =  this._parents.get(el.parentNode);
        
        if (kijs.isEmpty(parentProp) || kijs.isEmpty(parentProp.stack)) {
            return changed;
        }
        
        const newElements = [];
        for (let i=0; i<parentProp.stack.length; i++) {
            if (parentProp.stack[i] === el) {
                changed = true;
            } else {
                newElements.push(parentProp.stack[i]);
            }
        }
        parentProp.stack = newElements;
        
        // Evtl. parentNode entfernen, wenn leer
        if (parentProp.stack.length === 0) {
            this._parents.delete(el.parentNode);
            parentProp = null;
        }
        
        // Listeners entfernen
        el.off('destruct', this._onElementDestruct, this);
        el.off('changeVisibility', this._onElementChangeVisibility, this);
        
        // falls was geändert hat
        if (parentProp && changed && !preventReorder) {
            // z-indexe der Fenster neu zuweisen
            this._assignZIndexes(el.parentNode);

            // Oberstes sichtbares Element aktualisieren und Fokus setzen
            parentProp.activeEl = this._getTopVisibleElement(el.parentNode);
            if (parentProp.activeEl) {
                parentProp.activeEl.focus();
            }
        }
        
        return changed;
    }


    // PROTECTED
    /**
     * Nummeriert die z-Indexe der Elemente neu durch und entfernt gelöschte Fenster
     * @param {HTMLElement} parentNode
     * @returns {undefined}
     */
    _assignZIndexes(parentNode) {
        let zIndex = this._startZIndex;
        const parentProp =  this._parents.get(parentNode);
        
        if (kijs.isEmpty(parentProp) || kijs.isEmpty(parentProp.stack)) {
            return;
        }
        
        kijs.Array.each(parentProp.stack, function(el) {
            el.style.zIndex = zIndex;
            zIndex += 10;
        }, this);
    }

    /**
     * Gibt das oberste sichtbare Element zurück
     * @param {HTMLElement} parentNode
     * @returns {kijs.gui.Element}
     */
    _getTopVisibleElement(parentNode) {
        const parentProp =  this._parents.get(parentNode);
        
        if (kijs.isEmpty(parentProp) || kijs.isEmpty(parentProp.stack)) {
            return;
        }
        
        for (let i=parentProp.stack.length-1; i>=0; i--) {
            if (parentProp.stack[i].visible) {
                return parentProp.stack[i];
            }
        }
        
        return null;
    }


    // LISTENERS
    _onElementDestruct(e) {
        this.removeElement(e.element);
    }

    _onElementChangeVisibility(e) {
        const el = e.element;
        const parentProp =  this._parents.get(el.parentNode);
        
        if (kijs.isEmpty(parentProp) || kijs.isEmpty(parentProp.stack)) {
            return;
        }
        
        // Oberstes sichtbares Element aktualisieren und Fokus setzen
        parentProp.activeEl = this._getTopVisibleElement(el.parentNode);
        if (parentProp.activeEl) {
            parentProp.activeEl.focus();
        }
    }


    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct() {
        // Listeners entfernen
        for (var parentProp of this._parents.values()) {
            kijs.Array.each(parentProp.stack, function(el) {
                el.off(null, null, this);
            }, this);
        }
        
        this._parents.clear();
        this._parents = null;
    }

};