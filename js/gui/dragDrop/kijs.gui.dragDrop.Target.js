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
        this._ownerDomProperty = null;   // Property-Name des kijs.gui.Dom, der als 
                                         // Ziel dient.
        this._mapping = {};
        
        this._targetEl = null;      // Ziel kijs.gui.Element der aktuellen Drag&Drop-Operation
        this._targetPos = null;     // Einfügeposition beim Ziel {String} 'before', 'after', 'child'
        this._operation = 'none';   // operation 'move', 'copy', 'link' oder 'none'
        
        this._ddMarkerTagName = 'div';  // tagName des ddMarkers
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
            ddMarkerTagName: true,
            posBeforeFactor: true,
            posAfterFactor: true,
            on: { fn: 'assignListeners' },
            mapping: { target: 'mapping' },
            ownerDomProperty: { prio: 1000, target: 'ownerDomProperty' } // Property-Name des kijs.gui.Dom, der als Ziel dient
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
    get ddMarkerTagName() { return this._ddMarkerTagName; }
    set ddMarkerTagName(val) {
        this._ddMarkerTagName = val.toLowerCase();
    }
    
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

    // Verweis auf den kijs.gui.Dom, das als Ziel dient
    get ownerDom() {
        if (kijs.isEmpty(this._ownerEl)) {
            throw new kijs.Error(`target Elements must have a 'ddTarget.ownerEl'`);
        }
        
        let dom = kijs.getObjectFromString(this._ownerDomProperty, this._ownerEl);
        
        if (kijs.isEmpty(dom)) {
            throw new kijs.Error(`target Elements must have a valide 'ddTarget.ownerDomProperty'`);
        }
        
        return dom;
    }
    
    // Property-Name des kijs.gui.Dom, das als Ziel dient
    get ownerDomProperty() { return this._ownerDomProperty; }
    set ownerDomProperty(val) {
        this._ownerDomProperty = val;
        
        // Drag&Drop Listeners
        this.ownerDom.on('dragEnter', this.#onDragEnter, this);
        this.ownerDom.on('dragLeave', this.#onDragLeave, this);
        this.ownerDom.on('dragOver', this.#onDragOver, this);
        this.ownerDom.on('drop', this.#onDrop, this);
    }
    
    // Eigentümmer kijs.gui.Element dieser Instanz
    get ownerEl() { return this._ownerEl; }
    set ownerEl(val) { this._ownerEl = val; }
    
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
     * Gibt das Kind Element zurück, dass sich unter dem Mauszeiger oder am nähesten befindet
     * @param {Array} elements  Elements-Array
     * @param {Number} clientX  Maus-Position vom nodeEvent
     * @param {Number} clientY  Maus-Position vom nodeEvent
     * @returns {Object} { el:..., diffX,... diffY:..., w:..., h:... };
     *                   el: Element unter dem Mauszeiger oder nähestes Element
     *                   diffX Abstand des Mauszeiger zum linken Rand des gefundenen Elements
     *                   diffY: Abstand des Mauszeiger zum oberen Rand des gefundenen Elements
     *                   w: Breite des gefundenen Elements
     *                   h: Höhe des gefundenen Elements
     */
    _getDragOverChild(elements, clientX, clientY) {
        let ret = null;
        
        if (kijs.isEmpty(elements)) {
            return ret;
        }
        
        const rectMouse = { 
            x: clientX,
            y: clientY, 
            w: 0,
            h: 0
        };
        
        // Ausrichtung der Elemente ermitteln
        const ndeParent = elements[0].dom.node.parentElement;
        const ndeParentTagName = this.ownerDom.node.tagName.toLowerCase();
        const ndeParentStyle = window.getComputedStyle(ndeParent);
        const flexDirection = ndeParentStyle.flexDirection;
        const flexWrap = ndeParentStyle.flexWrap;
        const isFlex = ndeParentStyle.display === 'flex';
        const isWrap = isFlex && flexWrap !== 'nowrap';
        const isHorizontal = (isFlex && !!flexDirection.startsWith('row')) || ndeParentTagName === 'tr';
        
        let minDistance = null;
        
        // Elemente durchgehen und das näheste Element ermitteln
        kijs.Array.each(elements, function(el) {
            let rectEl = kijs.Dom.getAbsolutePos(el.node);
            
            let ok = false;
            
            // Falls das Layout umgebrochen wird, muss sichergestellt werden, dass
            // nicht zwischen zwei Einfügepositionen hin und her geflackert wird.
            // Dies erreichen wir, indem der Mauszeiger in der aktuellen Spalte oder Zeile
            // auch in der richtigen Spalte oder Zeile sein muss.
            if (isWrap) {
                if (isHorizontal) {
                    let distanceY = clientY - rectEl.y;
                    ok = distanceY >= 0 && distanceY <= rectEl.h;
                } else {
                    let distanceX = clientX - rectEl.x;
                    ok = distanceX >= 0 && distanceX <= rectEl.w;
                }

            } else {
                ok = true;
                
            }
            
            if (ok) {
                // Distanz zwischen Mauszeiger und Mitte des Elements ermitteln
                let distance = kijs.Graphic.rectsDistance(rectMouse, rectEl);

                if (minDistance === null || distance < minDistance) {
                    ret = { 
                        el: el, 
                        diffX: clientX - rectEl.x,  // Abstand des Mauszeigers zum linken Rand
                        diffY: clientY - rectEl.y,  // Abstand des Mauszeigers zum oberen Rand
                        w: rectEl.w,
                        h: rectEl.h
                    };
                    minDistance = distance;
                }
            }
        }, this);
        
        return ret;
    }
    
    // Marker positionieren, Source ein-/ausblenden, CSS aktualisieren
    _updateGuiIndicator(e, targetEl, targetPos=null, operation='none', mapping=null) {
        
        if (kijs.isEmpty(operation)) {
            operation = 'none';
        }
        
        // icon bei Mauszeiger (move, copy, link, none) aktualisieren
        if (kijs.isEmpty(mapping)) {
            e.nodeEvent.dataTransfer.effectAllowed = 'none';
        } else {
            e.nodeEvent.dataTransfer.effectAllowed = kijs.gui.DragDrop.getddEffect(
                    kijs.gui.DragDrop.source.allowMove && mapping.allowMove, 
                    kijs.gui.DragDrop.source.allowCopy && mapping.allowCopy, 
                    kijs.gui.DragDrop.source.allowLink && mapping.allowLink);
        }
        
        // muss die Einfügeposition aktualisiert werden?
        let update = false;
        
        // kein Ziel => Bei Source-Position belassen
        if (!targetEl) {
            update = true;
            
        // hat sich die Position verändert?
        } else if (targetEl !== this._targetEl || targetPos !== this._targetPos || operation !== this._operation) {
            update = true;
        }
        
        // Einfügeposition hat sich verändert
        if (update) {
            // Bei move Source-Element ausblenden, sonst einblenden
            if (targetPos && operation === 'move') {
                kijs.gui.DragDrop.source.ownerEl.style.display = 'none';
            } else {
                kijs.gui.DragDrop.source.ownerEl.style.display = kijs.gui.DragDrop.source.display;
            }

            // CSS kijs-dragover
            if (targetPos) {
                kijs.gui.DragDrop.source.ownerEl.dom.clsRemove('kijs-dragover');
            } else {
                kijs.gui.DragDrop.source.ownerEl.dom.clsAdd('kijs-dragover');
            }

            // Grösse des Markers an Source-Element anpassen
            let markerWidth = null;
            let markerHeight = null;
            if (mapping && targetPos && !mapping.disableMarkerAutoSize) {
                markerWidth = kijs.gui.DragDrop.source.width;
                markerHeight = kijs.gui.DragDrop.source.height;
            }

            // Marker positionieren
            if (targetEl) {
                kijs.gui.DragDrop.dropMarkerUpdate(targetEl.dom, targetPos, 
                        this._ddMarkerTagName, markerWidth, markerHeight);
            }
        }
        
        this._targetEl = targetEl;
        this._targetPos = targetPos;
        this._operation = operation;
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
                let mapping = this._mapping[kijs.gui.DragDrop.source.name];
                if (mapping) {
                    this._updateGuiIndicator(e);
                } else {
                    return;
                }
            }
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
        
        // Mapping ermitteln
        let mapping = this._mapping[kijs.gui.DragDrop.source.name];
        if (!mapping) {
            return;
        }
        let operation = e.nodeEvent.dataTransfer.dropEffect;
        let targetEl = null;
        let targetPos = null;
       
        // Auf Targets, die disabled sind, kann nichts abgelegt werden.
        if (this.ownerEl.disabled) {
            return false;
        }
        
        // Ausrichtung der Elemente ermitteln
        const ndeParentStyle = window.getComputedStyle(this.ownerDom.node);
        const ndeParentTagName = this.ownerDom.node.tagName.toLowerCase();
        const flexDirection = ndeParentStyle.flexDirection;
        const isFlex = ndeParentStyle.display === 'flex';
        const isHorizontal = (isFlex && !!flexDirection.startsWith('row')) || ndeParentTagName === 'tr';
        const isReverse = isFlex && !!flexDirection.endsWith('-reverse');
        
        // nähestes Element mit Positionen ermitteln {el:..., diffX:..., diffY:..., w:..., h:... }
        // x und y enthallten den Abstand des Mauszeigers zum linken/oberen Rand des Elements
        let ddCPos = this._getDragOverChild(
                this._ownerEl.elements, 
                e.nodeEvent.clientX, 
                e.nodeEvent.clientY);
        
        // Falls kein Element in der Nähe gefunden wurde
        if (kijs.isEmpty(ddCPos)) {
            // gibt es bereits Elemente im Container
            if (!kijs.isEmpty(this._ownerEl.elements)) {
                if (isReverse) {
                    // am Anfang einfügen
                    targetEl = this._ownerEl.elements[0];
                    targetPos = 'after';
                } else {
                    
                    // am Ende einfügen
                    targetEl = this._ownerEl.elements[this._ownerEl.elements.length-1];
                    targetPos = 'after';
                }
            } else {
                targetEl = this._ownerEl;
                targetPos = 'child';
            }
            
        // Es wurde ein Element in der Nähe gefunden
        } else {
            targetEl = ddCPos.el;

            // bei horizontaler Ausrichtung (flex-direction = 'row' oder 'row-reverse')
            if (isHorizontal) {
                if (ddCPos.diffX < ddCPos.w * this._posBeforeFactor) {
                    targetPos = 'before';
                } else if (ddCPos.diffX > ddCPos.w * this._posAfterFactor) {
                    targetPos = 'after';
                }
                
           // bei vertikaler Ausrichtung (flex-direction = 'column' oder 'column-reverse')
           } else {
                if (ddCPos.diffY < ddCPos.h * this._posBeforeFactor) {
                    targetPos = 'before';
                } else if (ddCPos.diffY > ddCPos.h * this._posAfterFactor) {
                    targetPos = 'after';
                }

            }
        }
        
        // Bei flex-direction = '...-reverse' müssen 'before' und 'after' getauscht werden
        if (targetPos && isReverse) {
            if (targetPos === 'before') {
                targetPos = 'after';
            } else if (targetPos === 'after') {
                targetPos = 'before';
            }
        }

        // Bei move: Wenn Source=Target: Nichts tun
        if (targetPos && operation === 'move') {
            if (targetEl === kijs.gui.DragDrop.source.ownerEl) {
                targetEl = null;
                targetPos = null;
            } else if (targetPos === 'before' && targetEl.previous === kijs.gui.DragDrop.source.ownerEl) {
                targetEl = null;
                targetPos = null;
            } else if (targetPos === 'after' && targetEl.next === kijs.gui.DragDrop.source.ownerEl) {
                targetEl = null;
                targetPos = null;
            }
        }
        
        this._updateGuiIndicator(e, targetEl, targetPos, operation, mapping);
    }
    
    #onDrop(e) {
        event.preventDefault();
        
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
        
        // Source-Element wieder einblenden
        kijs.gui.DragDrop.source.ownerEl.style.display = kijs.gui.DragDrop.source.display;
        
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
        if (this.ownerDom) {
            this.ownerDom.off(null, null, this);
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
