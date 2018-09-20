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
        
        this._ownerNodes = [this._dom]; // Events auf diesen kijs.gui.Dom oder HTMLNodes werden ignoriert, die SpinBox wird nicht geschlossen
        
        this._openOnInput = true;   // Soll beim Texteingeben in Inputfield die SpinBox automatisch geöffnet werden?
        
        this._preventHide = false;  // das Ausblenden der SpinBox verhindern
        
        this._targetEl = null;              // Zielelement (kijs.gui.Element)
        this._targetDomProperty = 'dom';    // Dom-Eigenschaft im Zielelement (String)
        
        //this._dom.nodeAttributeSet('tabIndex', -1);
        
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
            openOnInput: true,
            targetPos: true,
            target: { target: 'target' },
            targetDomProperty: true,
            ownerNodes: { fn: 'appendUnique', target: '_ownerNodes' }
        });
        
        // Listeners
        this.on('wheel', this._onWheel, this);
        
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
    
    get openOnInput() { return this._openOnInput; }
    set openOnInput(val) { this._openOnInput = val; }
    
    get target() {
        return this._targetEl;
    }
    set target(val) {
        // Evtl. Listeners vom alten _targetEl entfernen
        if (!kijs.isEmpty(this._targetEl)) {
            this._targetEl.off('input', this._onTargetElInput, this);
            this._targetEl.off('keyDown', this._onTargetElKeyDown, this);
            this._targetEl.off('destruct', this._onTargetElDestruct, this);
        }
        
        if (val instanceof kijs.gui.Element) {
            this._targetEl = val;
            this._targetEl.on('input', this._onTargetElInput, this);
            this._targetEl.on('keyDown', this._onTargetElKeyDown, this);
            this._targetEl.on('destruct', this._onTargetElDestruct, this);
            
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
        return this._targetEl[this._targetDomProperty].node;
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
    close() {
        kijs.Dom.removeEventListener('mousedown', document.body, this);
        kijs.Dom.removeEventListener('resize', window, this);
        kijs.Dom.removeEventListener('wheel', window, this);
        
        kijs.Array.each(this._ownerNodes, function(x) {
            const node = x instanceof kijs.gui.Dom ? x.node : x;
            kijs.Dom.removeEventListener('mousedown', node, this);
            kijs.Dom.removeEventListener('resize', node, this);
        }, this);
        
        this.unRender();
    }
    
    /**
     * Zeigt die SpinBox an 
     * @returns {undefined}
     */
    show() {
        // SpinBox anzeigen
        this.renderTo(document.body);
        
        // Ausrichten
        this._adjustPositionToTarget(true);

        // afterResize-Event zeitversetzt auslösen
        this._raiseAfterResizeEvent(true);
        
        this._targetEl.focus();
        
        // Listeners auf body/window zum ausblenden
        kijs.Dom.addEventListener('mousedown', document.body, this._onBodyMouseDown, this);
        kijs.Dom.addEventListener('resize', window, this._onWindowResize, this);
        kijs.Dom.addEventListener('wheel', window, this._onWindowWheel, this);
        
        // Listeners auf die _ownerNodes die das Ausblenden verhindern
        kijs.Array.each(this._ownerNodes, function(x) {
            const node = x instanceof kijs.gui.Dom ? x.node : x;
            kijs.Dom.addEventListener('mousedown', node, this._onNodeMouseDown, this);
            kijs.Dom.addEventListener('resize', node, this._onNodeResize, this);
        }, this);
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
        const positions = this._dom.alignToTarget(
            this.targetNode, 
            this._targetPos,
            this._ownPos, 
            this._allowSwapX, 
            this._allowSwapY, 
            this._offsetX, 
            this._offsetY
        );
        
        // Je nach Position eine CSS-Klasse zuweisen
        let cls = '';
        if (positions.targetPos.indexOf('t') !== -1 && positions.pos.indexOf('b') !== -1) {
            cls = 'kijs-pos-top';
        } else if (positions.targetPos.indexOf('b') !== -1 && positions.pos.indexOf('t') !== -1) {
            cls = 'kijs-pos-bottom';
        } else if (positions.targetPos.indexOf('l') !== -1 && positions.pos.indexOf('r') !== -1) {
            cls = 'kijs-pos-left';
        } else if (positions.targetPos.indexOf('r') !== -1 && positions.pos.indexOf('l') !== -1) {
            cls = 'kijs-pos-right';
        }
        this._dom.clsRemove(['kijs-pos-top', 'kijs-pos-bottom', 'kijs-pos-left', 'kijs-pos-right']);
        if (cls) {
            this._dom.clsAdd(cls);
        }
        
        // afterResize-Event wieder zulassen
        this._preventAfterResize = prevAfterRes;
        
        // Evtl. afterResize-Event zeitversetzt auslösen
        if (!preventEvents && this._hasSizeChanged()) {
            this._raiseAfterResizeEvent(true);
        }
    }


    // LISTENERS
    _onBodyMouseDown(e) {
        if (!this._preventHide) {
            this.close();
        }
        this._preventHide = false;
    }
    
    _onWindowResize(e) {
        if (!this._preventHide) {
            this.close();
        }
        this._preventHide = false;
    }
    
    _onWindowWheel(e) {
        if (!this._preventHide) {
            this.close();
        }
        this._preventHide = false;
    }
    
    // Wir nutzen das Bubbeling der Events um auszuschliessen, dass die Events vom Node kommen.
    // Das Event kommt zuerst beim Node und wir setzen _preventHide=true
    // Dann kommt das Event beim Body und wenn die Variable _preventHide!==true ist, kann ausgeblendet werden
    _onNodeMouseDown(e) {
        this._preventHide = true;
    }
    
    _onNodeResize(e) {
        this._preventHide = true;
    }
    
    _onWheel(e) {
        this._preventHide = true;
    }
    
    _onTargetElInput(e) {
        if (this._openOnInput && !this.isRendered) {
            this.show();
        }
    }
    
    _onTargetElKeyDown(e) {
        switch (e.nodeEvent.keyCode) {
            case kijs.keys.ESC:
            case kijs.keys.TAB:
                this.close();
                break;
                
            case kijs.keys.F4:
                if (this.isRendered) {
                    this.close();
                } else {
                    this.show();
                }
                break;
        }
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
        if (this._targetEl) {
            this._targetEl.off(null, null, this);
        }
        
        kijs.Dom.removeEventListener('mousedown', document.body, this);
        kijs.Dom.removeEventListener('resize', window, this);
        kijs.Dom.removeEventListener('wheel', window, this);
        

        if (!kijs.isEmpty(this._ownerNodes)) {
            kijs.Array.each(this._ownerNodes, function(x) {
                if (x) {
                    const node = x instanceof kijs.gui.Dom ? x.node : x;
                    if (node) {
                        kijs.Dom.removeEventListener('mousedown', node, this);
                        kijs.Dom.removeEventListener('resize', node, this);
                    }
                }
            }, this);
        }
        
        // Elemente/DOM-Objekte entladen
        
        
        // Variablen (Objekte/Arrays) leeren
        this._targetEl = null;
        this._ownerNodes = null;
        
        // Basisklasse entladen
        super.destruct(true);
    }
};
