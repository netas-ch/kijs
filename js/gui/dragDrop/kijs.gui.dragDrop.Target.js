/* global kijs, this */

// Klasse mit Drag&Drop-Events/Funktionen, für das Ziel-Element

// --------------------------------------------------------------
// kijs.gui.dragDrop.Target
// --------------------------------------------------------------
kijs.gui.dragDrop.Target = class kijs_gui_dragDrop_Target extends kijs.Observable {
     
    
    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        this._ownerEl = null;            // Eigentümmer kijs.gui.Element dieser Instanz
        this._targetDomProperty = null;  // Property-Name des kijs.gui.Dom, der als 
                                         // Ziel dient.
        this._mapping = {};
        
        this._targetEl = null;      // Ziel kijs.gui.Element der aktuellen Drag&Drop-Operation
        this._targetPos = null;     // Einfügeposition beim Ziel {String} 'before', 'after', 'child'
        this._direction = 'vertical'; // Richtung der Elemente 'vertical' (default) oder 'horizontal'
        this._posBeforeFactor = 0.666;
        this._posAfterFactor = 0.666;
        
        
        // Workaround, weil das dragLeave auch kommt, wenn die Maus über ein Kind-Element 
        // gezogen wird.
        this._ddEnterTarget = null;
        
        this._defaultConfig = {};
        
        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        this._configMap = {
            ownerEl: true,
            direction: true,
            posBeforeFactor: true,
            posAfterFactor: true,
            on: { fn: 'assignListeners' },
            mapping: { target: 'mapping' },
            targetDomProperty: { prio: 1000, target: 'targetDomProperty' } // Property-Name des kijs.gui.Dom, der als Ziel dient
        };

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }
    }
    
    
    
    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get direction() { return this._direction; }
    set direction(val) { this._direction = val; }
    
    get mapping() { return this._mapping; }
    set mapping(val) { this._mapping = val; }
    
    get posAfterFactor() { return this._posAfterFactor; }
    set posAfterFactor(val) { 
        if (val < 0 || val > 1) {
            throw new kijs.Error(`'posBeforeFactor' must be between 0 and 1`);
        }
        this._posAfterFactor = val;
    }
    
    get posBeforeFactor() { return this._posBeforeFactor; }
    set posBeforeFactor(val) { 
        if (val < 0 || val > 1) {
            throw new kijs.Error(`'posBeforeFactor' must be between 0 and 1`);
        }
        this._posBeforeFactor = val;
    }

    // Eigentümmer kijs.gui.Element dieser Instanz
    get ownerEl() { return this._ownerEl; }
    set ownerEl(val) { this._ownerEl = val; }

    get ownerEl() { return this._ownerEl; }
    set ownerEl(val) { this._ownerEl = val; }

    // Verweis auf den kijs.gui.Dom, das als Ziel dient
    get targetDom() {
        if (kijs.isEmpty(this._ownerEl)) {
            throw new kijs.Error(`target Elements must have a 'ddTarget.ownerEl'`);
        }
        
        let dom = kijs.getObjectFromString(this._targetDomProperty, this._ownerEl);
        
        if (kijs.isEmpty(dom)) {
            throw new kijs.Error(`target Elements must have a valide 'ddTarget.targetDomProperty'`);
        }
        
        return dom;
    }
    
    // Property-Name des kijs.gui.Dom, das als Ziel dient
    get targetDomProperty() { return this._targetDomProperty; }
    set targetDomProperty(val) {
        this._targetDomProperty = val;
        
        // Drag&Drop Listeners
        this.targetDom.on('dragEnter', this.#onDragEnter, this);
        this.targetDom.on('dragLeave', this.#onDragLeave, this);
        this.targetDom.on('dragOver', this.#onDragOver, this);
        this.targetDom.on('drop', this.#onDrop, this);
    }
    
    // Zielelement, auf das, das Element gedroppt wurde
    get targetEl() { return this._targetEl; }
    
    // Einfügeposition beim Ziel {String} 'before', 'after', 'child'
    get targetPos() { return this._targetPos; }
    
    
    
    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    /**
     * Wendet die Konfigurations-Eigenschaften an
     * @param {Object} config
     * @param {Boolean} [preventEvents=false]   // Das Auslösen des afterResize-Event verhindern?
     * @returns {undefined}
     */
    applyConfig(config={}, preventEvents=false) {
        // Config zuweisen
        kijs.Object.assignConfig(this, config, this._configMap);
        
        // Objekt versiegeln
        // Bewirkt, dass keine neuen propertys hinzugefügt werden dürfen.
        Object.seal(this);
    }

    /**
     * Gibt das Kind Element zurück, dass sich unter dem Mauszeiger befindet
     * @param {Array} elements  Elements-Array
     * @param {Number} clientX  Maus-Position vom nodeEvent
     * @param {Number} clientY  Maus-Position vom nodeEvent
     * @param {String} [dir='vertical'] Anordnung der elements 'vertical' oder 'horizontal'
     * @returns {Object} { el:..., closestElBefore:..., y:..., height:... };
     *                   el: Element unter dem Mauszeiger oder null
     *                   closestElBefore: Element unter dem Mauszeiger oder nächstes Element vorher auf Y/X-Achse
     *                   y: y-Position des Mauszeiger innerhalb des closestElBefore
     *                   x: x-Position des Mauszeiger innerhalb des closestElBefore
     *                   height: Höhe des closestElBefore
     *                   width: Breite des closestElBefore
     */
    _getDragOverChild(elements, clientX, clientY, dir='vertical') {
        let ret = { 
            el: null, 
            closestElBefore: null, 
            x: null,
            y: null, 
            w: null,
            h: null
        };
        
        if (kijs.isEmpty(elements)) {
            return ret;
        }
        
        // Wenn ein Element vorhanden ist, dieses schon mal nehmen, für den Fall,
        // dass der Mauszeiger oberhalb/links des Elements ist.
        let pos = kijs.Dom.getAbsolutePos(elements[0].node);
        ret = {
            el: null,
            closestElBefore: elements[0],
            x: clientX - pos.x,
            y: clientY - pos.y,
            w: pos.w,
            h: pos.h
        };
        
        // Elemente durchgehen
        // Abstände zwischen Elementen gehören zum vorherigen Element
        kijs.Array.each(elements, function(el) {
            let pos = kijs.Dom.getAbsolutePos(el.node);
            
            ret.el = null;
            
            if ( (dir === 'vertical'   && clientY >= pos.y) 
              || (dir === 'horizontal' && clientX >= pos.x) ) {
                
                ret = {
                    el: null,
                    closestElBefore: el,
                    x: clientX - pos.x,
                    y: clientY - pos.y,
                    w: pos.w,
                    h: pos.h
                };
                if (clientX >= pos.x && clientX <= pos.x + pos.w && 
                    clientY >= pos.y && clientY <= pos.y + pos.h) {
                    ret.el = el;
                }
                
            } else if (!kijs.Array.contains(['horizontal', 'vertical'], dir)) {
                throw new kijs.Error(`Argument "dir" is not valid.`);
                
            } else {
                return false;
            }
            
        }, this);
        
        return ret;
    }
    
    
    // PRIVATE
    // LISTENERS
    #onDragEnter(e) {
        e.nodeEvent.preventDefault();
        // Workaround, weil das dragLeave auch kommt, wenn die Maus von einem Kind-Element weggezogen wird.
        this._ddEnterTarget = e.nodeEvent.target;
    }
    
    #onDragLeave(e) {
        // Workaround, weil das dragLeave auch kommt, wenn die Maus von einem Kind-Element weggezogen wird.
        if (this._ddEnterTarget === e.nodeEvent.target) {
            if (kijs.gui.DragDrop.source) {
                kijs.gui.DragDrop.source.ownerEl.dom.clsRemove('kijs-dragover');
            }
            kijs.gui.DragDrop.dropMarkerRemove();
        }
    }
    
    #onDragOver(e) {
        e.nodeEvent.preventDefault();
        
        // Validieren
        if (!kijs.gui.DragDrop.source || !kijs.gui.DragDrop.source.ownerEl) {
            return false;
        }
        
        if (this._posBeforeFactor > this._posAfterFactor) {
            throw new kijs.Error(`'posBeforeFactor' must be smaller than 'posAfterFactor'`);
        }
        
        // Auf Targets, die disabled sind, kann nichts abgelegt werden.
        if (this.ownerEl.disabled) {
            return false;
        }
        
        // Mapping ermitteln
        let mapping = this._mapping[kijs.gui.DragDrop.source.name];
        if (!mapping) {
            return false;
        }
        
        e.nodeEvent.dataTransfer.effectAllowed = kijs.gui.DragDrop.getddEffect(
                kijs.gui.DragDrop.source.allowMove && mapping.allowMove, 
                kijs.gui.DragDrop.source.allowCopy && mapping.allowCopy, 
                kijs.gui.DragDrop.source.allowLink && mapping.allowLink);
        
        let operation = e.nodeEvent.dataTransfer.dropEffect;
        
        // nächstes Element mit Positionen ermitteln
        let ddCPos = this._getDragOverChild(
                this._ownerEl.elements, 
                e.nodeEvent.clientX, 
                e.nodeEvent.clientY, 
                this._direction);

        
        // Einfügeposition anzeigen
        // In dem Container ist noch kein Element
        if (kijs.isEmpty(ddCPos.closestElBefore)) {
            this._targetEl = this._ownerEl;
            this._targetPos = 'child';
            kijs.gui.DragDrop.dropMarkerDom.renderTo(this.targetDom.node);
            kijs.gui.DragDrop.dropMarkerDom.scrollIntoView();
            
        // Es gibt bereits min. ein Element im Container
        } else {
            let insertPos = 'none';
            switch (this._direction) {
                case 'vertical':
                    if (ddCPos.y < ddCPos.h * this._posBeforeFactor) {
                        insertPos = 'before';
                    } else if (ddCPos.y > ddCPos.h * this._posAfterFactor) {
                        insertPos = 'after';
                    }
                    break;
                    
                case 'horizontal':
                    if (ddCPos.x < ddCPos.w * this._posBeforeFactor) {
                        insertPos = 'before';
                    } else if (ddCPos.x > ddCPos.w * this._posAfterFactor) {
                        insertPos = 'after';
                    }
                    break;
            }
            
            // Bei move: Wenn Source=Target: Nichts tun
            if (operation === 'move' && insertPos !== 'none') {
                if (ddCPos.closestElBefore === kijs.gui.DragDrop.source.ownerEl) {
                    insertPos = 'none';
                } else if (insertPos === 'before' && ddCPos.closestElBefore.previous === kijs.gui.DragDrop.source.ownerEl) {
                    insertPos = 'none';
                } else if (insertPos === 'after' && ddCPos.closestElBefore.next === kijs.gui.DragDrop.source.ownerEl) {
                    insertPos = 'none';
                }
            }
            
            // Ist der Marker bereits dort vorhanden?
            if (insertPos !== 'none') {
                if (kijs.gui.DragDrop.dropMarkerDom.node === ddCPos.closestElBefore.dom.node) {
                    insertPos = 'none';
                }
            }
            
            if (insertPos !== 'none') {
                this._targetEl = ddCPos.closestElBefore;
                this._targetPos = insertPos;
                kijs.gui.DragDrop.source.ownerEl.dom.clsRemove('kijs-dragover');
                kijs.gui.DragDrop.dropMarkerDom.renderTo(this.targetDom.node, ddCPos.closestElBefore.dom.node, insertPos);
                kijs.gui.DragDrop.dropMarkerDom.scrollIntoView();
            } else {
                this._targetEl = null;
                this._targetPos = null;
                kijs.gui.DragDrop.source.ownerEl.dom.clsAdd('kijs-dragover');
                kijs.gui.DragDrop.dropMarkerRemove();
            }
        }
    }
    
    #onDrop(e) {
        // Validieren
        if (!kijs.gui.DragDrop.source) {
            return false;
        }
        
        // Mapping ermitteln
        let mapping = this._mapping[kijs.gui.DragDrop.source.name];
        if (!mapping) {
            return false;
        }
                
        kijs.gui.DragDrop.source.ownerEl.dom.clsRemove('kijs-dragover');
        
        if (kijs.isEmpty(this._targetEl) || kijs.isEmpty(this._targetPos)) {
            return;
        }
        
        // 'move', 'copy' oder 'link'
        let operation = e.nodeEvent.dataTransfer.dropEffect;
        
        // drop-Event bei source auslösen
        if (kijs.gui.DragDrop.source.raiseEvent('drop', { 
            source: kijs.gui.DragDrop.source, 
            target: this, 
            operation: operation,
            mapping: mapping
        }) !== false) {
            // Wenn kein Abbruch: drop-Event bei target auslösen
            this.raiseEvent('drop', { 
                source: kijs.gui.DragDrop.source, 
                target: this, 
                operation: operation,
                mapping: mapping
            });
        }
        kijs.gui.DragDrop.source.dragEnd();
    }
    
    
    
    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    destruct(superCall) {
        if (!superCall) {
            // Event auslösen.
            this.raiseEvent('destruct');
        }

        // Listeners entfernen
        if (this.targetDom) {
            this.targetDom.off(null, null, this);
        }

        // Elemente/DOM-Objekte entladen
        
        // Variablen (Objekte/Arrays) leeren
        this._defaultConfig = null;
        this._ownerEl = null;
        this._mapping = null;
        
        this._targetEl = null;
        this._ddEnterTarget = null;

        // Basisklasse entladen
        super.destruct();
    }
    
};
