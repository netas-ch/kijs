/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.SpinBox
// --------------------------------------------------------------
kijs.gui.SpinBox = class kijs_gui_SpinBox extends kijs.gui.Container {
    
    
    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);
        
        this._innerDom = new kijs.gui.Dom();
        
        this._targetDom = null;
        
        this._ownPos = 'tl';        // Ankerpunkt bei der Spin Box
        this._targetPos = 'bl';     // Ankerpunkt beim Zielelement
                                    //       tl --- t --- tr
                                    //       |             |
                                    //       l      c      r
                                    //       |             |
                                    //       bl --- b --- br 
        
        this._allowSwapX = true;    // Swappen möglich auf X-Achse?
        this._allowSwapY = true;    // Swappen möglich auf Y-Achse?
        this._offsetX = 0;           // Verschiebung aus dem Ankerpunkt auf der X-Achse
        this._offsetY = 0;           // Verschiebung aus dem Ankerpunkt auf der Y-Achse
        
        this._targetX = null;               // Zielelement (kijs.gui.Element)
        this._targetDomProperty = 'dom';    // Dom-Eigenschaft im Zielelement (String)
        
        this._dom.clsRemove('kijs-container');
        this._dom.clsAdd('kijs-spinbox');

        
        // Standard-config-Eigenschaften mergen
        config = Object.assign({}, {
            // keine
        }, config);
        
        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            allowSwapX: true,
            allowSwapY: true,
            offsetX: true,
            offsetY: true,
            ownPos: true,
            targetPos: true,
            target: { target: 'target' },
            targetDomProperty: true
        });
        
        // Config anwenden
        if (kijs.isObject(config)) {
            this.applyConfig(config, true);
        }
    }


    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get allowSwapX() { return this._allowSwapX; }
    set allowSwapX(val) { this._allowSwapX = !!val; }

    get allowSwapY() { return this._allowSwapY; }
    set allowSwapY(val) { this._allowSwapY = !!val; }

    get offsetX() { return this._offsetX; }
    set offsetX(val) { this._offsetX = val; }

    get offsetY() { return this._offsetY; }
    set offsetY(val) { this._offsetY = val; }

    get ownPos() { this._ownPos; }
    set ownPos(val) {
        if (kijs.Array.contains(['tl', 't', 'tr', 'l', 'c', 'r', 'bl', 'b', 'br'], val)) {
            this._ownPos = val;
        } else {
            throw new Error(`Unkown format on config "pos"`);
        }
    }
    
    /**
     * Gibt den Node zurück in dem sich die Maske befindet (parentNode)
     * @returns {HTMLElement}
     */
    get parentNode() {
        return this._targetX[this._targetDomProperty].node.parentNode;
    }

    
    get target() {
        return this._targetX;
    }
    set target(val) {
        // Evtl. Listeners vom alten _targetX entfernen
        if (!kijs.isEmpty(this._targetX)) {
            this._targetX.off('afterResize', this._onTargetElAfterResize, this);
            this._targetX.off('changeVisibility', this._onTargetElChangeVisibility, this);
            this._targetX.off('destruct', this._onTargetElDestruct, this);
        }
        
        if (val instanceof kijs.gui.Element) {
            this._targetX = val;
            
            this._targetX.on('afterResize', this._onTargetElAfterResize, this);
            this._targetX.on('changeVisibility', this._onTargetElChangeVisibility, this);
            this._targetX.on('destruct', this._onTargetElDestruct, this);
            
        } else {
            throw new Error(`Unkown format on config "target"`);
            
        }
    }
    
    get targetDomProperty() { return this._targetDomProperty; };
    set targetDomProperty(val) { this._targetDomProperty = val; };

    /**
     * Gibt den Ziel-Node zurück, über den die Maske gelegt wird
     * @returns {HTMLElement}
     */
    get targetNode() {
        return this._targetX[this._targetDomProperty].node;
    }


    get targetPos() { this._targetPos; }
    set targetPos(val) {
        if (kijs.Array.contains(['tl', 't', 'tr', 'l', 'c', 'r', 'bl', 'b', 'br'], val)) {
            this._targetPos = val;
        } else {
            throw new Error(`Unkown format on config "targetPos"`);
        }
    }
    

    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    /**
     * Zeigt das Fenster an 
     * @returns {undefined}
     */
    show() {
        // SpinBox anzeigen
        this.renderTo(this.parentNode);
        
        // Ausrichten
        this._adjustPositionToTarget(true);

        // afterResize-Event zeitversetzt auslösen
        this._raiseAfterResizeEvent(true);
        
        this.focus();
    }


    // PROTECTED
    /**
     * Richtet die SpinBox am Target aus
     * @param {Boolean} [preventEvents=false]   // Das Auslösen des afterResize-Event verhindern?
     * @returns {undefined}
     */
    _adjustPositionToTarget(preventEvents=false) {
        // afterResize-Event deaktivieren
        const prevAfterRes = this._preventAfterResize;
        this._preventAfterResize = true;
        
        // Aurichten
        this._dom.alignToTarget(
            this.targetNode, 
            this._targetPos,
            this._ownPos, 
            this._allowSwapX, 
            this._allowSwapY, 
            this._offsetX, 
            this._offsetY
        );

        // afterResize-Event wieder zulassen
        this._preventAfterResize = prevAfterRes;
        
        // Evtl. afterResize-Event zeitversetzt auslösen
        if (!preventEvents && this._hasSizeChanged()) {
            this._raiseAfterResizeEvent(true);
        }
    }


    // LISTENERS
    /**
     * Listener der Aufgerufen wird, wenn die Grösse des Target-Elements geändert hat
     * @param {Object} e
     * @returns {undefined}
     */
    _onTargetElAfterResize(e) {
        // Sicherstellen, dass das Fenster im Target platz hat
        //this._adjustPositionToTarget(true);
        
        // Falls die eigene Grösse geändert hat: das eigene afterResize-Event auslösen
        this._raiseAfterResizeEvent(false, e);
    }
    
    _onTargetElChangeVisibility(e) {
        // Sichbarkeit ändern
        this.visible = e.visible;
    }
    
    _onTargetElDestruct(e) {
        this.destruct();
    }
    

    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(preventDestructEvent) {
        // Event auslösen.
        if (!preventDestructEvent) {
            this.raiseEvent('destruct');
        }
        
        // Event-Listeners entfernen
        if (this._targetX) {
            this._targetX.off(null, null, this);
        }
    
        // Elemente/DOM-Objekte entladen
        
        
        // Variablen (Objekte/Arrays) leeren
        this._targetX = null;
        
        // Basisklasse entladen
        super.destruct(true);
    }
};
