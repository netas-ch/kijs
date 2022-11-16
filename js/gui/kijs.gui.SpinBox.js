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

        this._autoSize = 'min';     // Grösse (je nach Pos die Breite oder Höhe) an das targetEl anpassen.
                                    // Werte: 'min' Grösse ist mind. wie beim targetEl
                                    //        'max' Grösse ist höchstens wie beim targetEl
                                    //        'fit' Grösse ist gleich wie beim targetEl
                                    //        'none' Grösse wird nicht angepasst

        this._offsetX = 0;           // Verschiebung aus dem Ankerpunkt auf der X-Achse
        this._offsetY = 0;           // Verschiebung aus dem Ankerpunkt auf der Y-Achse

        this._ownerNodes = [this._dom]; // Events auf diesen kijs.gui.Dom oder HTMLNodes werden ignoriert, die SpinBox wird nicht geschlossen

        this._preventHide = false;  // das Ausblenden der SpinBox verhindern

        this._targetEl = null;              // Zielelement (kijs.gui.Element)
        this._targetDomProperty = 'dom';    // Dom-Eigenschaft im Zielelement (String)
        this._autoWidth = true;

        this._dom.clsRemove('kijs-container');
        this._dom.clsAdd('kijs-spinbox');


        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            allowSwapX: true,
            allowSwapY: true,
            autoSize: { target: 'autoSize' },
            offsetX: true,
            offsetY: true,
            ownPos: true,
            targetPos: true,
            target: { target: 'target' },
            targetDomProperty: true,
            ownerNodes: { fn: 'appendUnique', target: '_ownerNodes' }
        });

        // Listener
        this.on('keyDown', this._onKeyDown, this);

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
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

    // overwrite, damit overflow beim dom statt innerDom zugewiesen wird
    get autoScroll() { return this._dom.clsHas('kijs-autoscroll'); }
    set autoScroll(val) {
        if (val) {
            this._dom.clsAdd('kijs-autoscroll');
        } else {
            this._dom.clsRemove('kijs-autoscroll');
        }
    }

    get autoSize() { return this._autoSize; }
    set autoSize(val) {
        if (kijs.Array.contains(['min', 'max', 'fit', 'none'], val)) {
            this._autoSize = val;
        } else {
            throw new kijs.Error(`Unkown format on config "autoSize"`);
        }
    }

    get offsetX() { return this._offsetX; }
    set offsetX(val) { this._offsetX = val; }

    get offsetY() { return this._offsetY; }
    set offsetY(val) { this._offsetY = val; }

    get ownPos() { this._ownPos; }
    set ownPos(val) {
        if (kijs.Array.contains(['tl', 't', 'tr', 'l', 'c', 'r', 'bl', 'b', 'br'], val)) {
            this._ownPos = val;
        } else {
            throw new kijs.Error(`Unkown format on config "pos"`);
        }
    }

    get target() {
        return this._targetEl;
    }
    set target(val) {
        // Evtl. Listeners vom alten _targetEl entfernen
        if (!kijs.isEmpty(this._targetEl)) {
            this._targetEl.off('keyDown', this._onTargetElKeyDown, this);
        }

        if (val instanceof kijs.gui.Element) {
            this._targetEl = val;
            this._targetEl.on('keyDown', this._onTargetElKeyDown, this);

        } else if (val === null) {
            this._targetEl = null;

        } else {
            throw new kijs.Error(`Unkown format on config "target"`);

        }
    }

    get targetDomProperty() { return this._targetDomProperty; };
    set targetDomProperty(val) { this._targetDomProperty = val; };

    /**
     * Gibt den Ziel-Node zurück, über den die Maske gelegt wird
     * @returns {HTMLElement}
     */
    get targetNode() {
        return this._targetEl ? this._targetEl[this._targetDomProperty].node : null;
    }


    get targetPos() { this._targetPos; }
    set targetPos(val) {
        if (kijs.Array.contains(['tl', 't', 'tr', 'l', 'c', 'r', 'bl', 'b', 'br'], val)) {
            this._targetPos = val;
        } else {
            throw new kijs.Error(`Unkown format on config "targetPos"`);
        }
    }

    // overwrite
    get width() { return super.width; }
    set width(val) {
        this._autoWidth = kijs.isNumeric(val) ? false : true;
        super.width = val;
    }


    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    /**
     * Schliesst die SpinBox
     * @returns {undefined}
     */
    close() {
        // bei allen übergeordneten Spinboxes die aktuelle Spinbox wieder rausnehmen.
        // Siehe dazu auch den Kommentar in der Funktion show()
        let p = this.parent;
        while (p) {
            if (p instanceof kijs.gui.SpinBox) {
                p.ownerNodeRemove(this);
            }
            p = p.parent;
        }

        this.unrender();
        this.raiseEvent('close');
    }

    /**
     * Fügt eine Node hinzu, bei Klick auf diese wird das Fenster nicht geschlossen.
     * @param {kijs.gui.Element|kijs.gui.Dom|DOMElement} ownerNode
     * @returns {undefined}
     */
    ownerNodeAdd(ownerNode) {
        if (!kijs.Array.contains(this._ownerNodes, ownerNode)) {
            this._ownerNodes.push(ownerNode);
        }

        if (ownerNode instanceof kijs.gui.Element) {
            ownerNode = ownerNode.dom;
        }
        if (ownerNode instanceof kijs.gui.Dom) {
            ownerNode = ownerNode.node;
        }
        if (ownerNode) {
            kijs.Dom.addEventListener('mousedown', ownerNode, this._onNodeMouseDown, this);
            kijs.Dom.addEventListener('resize', ownerNode, this._onNodeResize, this);
            kijs.Dom.addEventListener('wheel', ownerNode, this._onNodeWheel, this);
        }
    }

    /**
     * Entfernt eine Node aus den überwachten elementen
     * @param {kijs.gui.Element|kijs.gui.Dom|DOMElement} ownerNode
     * @param {Bool} removeFromObservedNodes soll die Node von der Überwachung entfernt werden?
     * @returns {undefined}
     */
    ownerNodeRemove(ownerNode, removeFromObservedNodes=true) {
        if (removeFromObservedNodes) {
            kijs.Array.remove(this._ownerNodes, ownerNode);
        }

        if (ownerNode instanceof kijs.gui.Element) {
            ownerNode = ownerNode.dom;
        }
        if (ownerNode instanceof kijs.gui.Dom) {
            ownerNode = ownerNode.node;
        }
        if (ownerNode) {
            kijs.Dom.removeEventListener('mousedown', ownerNode, this);
            kijs.Dom.removeEventListener('resize', ownerNode, this);
            kijs.Dom.removeEventListener('wheel', ownerNode, this);
        }
    }

    /**
     * Zeigt die SpinBox an
     * @param {Number|null} x X-Koordinate (null, falls an target ausgerichtet werden soll)
     * @param {Number|null} y Y-Koordinate (null, falls an target ausgerichtet werden soll)
     * @returns {undefined}
     */
    show(x=null, y=null) {
        if (this.isRendered) {
            return;
        }

        // SpinBox anzeigen
        this.renderTo(document.body);

        // Workaround um die Breite zu rechnen.
        // Ist z.T. nötig, damit sich die Breite richtig an die Breite des Inhalts anpasst,
        // auch wenn der Inhalt keine definierte Breite hat (z.B. bei einem Menu).
        this._widthWorkaround();

        // Ausrichten
        if ((kijs.isNumber(x) && kijs.isNumber(y)) || this._targetEl) {
            this._adjustPositionToTarget(x, y, true);
        }

        // allen übergeordneten Spinboxes mitteilen, dass beim Klick auf dieses Element
        // die Spnbox nicht geschlossen werden soll.
        let p = this.parent;
        while (p) {
            if (p instanceof kijs.gui.SpinBox) {
                p.ownerNodeAdd(this);
            }
            p = p.parent;
        }

        // afterResize-Event zeitversetzt auslösen
        this._raiseAfterResizeEvent(true);

        if (this._targetEl) {
            this._targetEl.focus();
        }

        // Listeners auf body/window zum ausblenden
        kijs.Dom.addEventListener('mousedown', document.body, this._onBodyMouseDown, this);
        kijs.Dom.addEventListener('resize', window, this._onWindowResize, this);
        kijs.Dom.addEventListener('wheel', window, this._onWindowWheel, this);

        // Listeners auf die _ownerNodes die das Ausblenden verhindern
        kijs.Array.each(this._ownerNodes, function(ownerNode) {
            this.ownerNodeAdd(ownerNode);
        }, this);

        this.raiseEvent('show');
    }

    unrender(superCall) {
        // Event auslösen.
        if (!superCall) {
            this.raiseEvent('unrender');
        }

        kijs.Dom.removeEventListener('mousedown', document.body, this);
        kijs.Dom.removeEventListener('resize', window, this);
        kijs.Dom.removeEventListener('wheel', window, this);

        kijs.Array.each(this._ownerNodes, function(ownerNode) {
            this.ownerNodeRemove(ownerNode, false);
        }, this);

        super.unrender(true);
    }


    // PROTECTED
    /**
     * Richtet die SpinBox am Target aus
     * @param {Number|null} [x=null]            // X-Koordinate
     * @param {Number|null} [y=null]            // Y-Koordinate
     * @param {Boolean} [preventEvents=false]   // Das Auslösen des afterResize-Event verhindern?
     * @returns {undefined}
     */
    _adjustPositionToTarget(x=null, y=null, preventEvents=false) {
        // afterResize-Event deaktivieren
        const prevAfterRes = this._preventAfterResize;
        this._preventAfterResize = true;

        // Evtl. Grösse automatisch anpassen
        if (this._autoSize !== 'none') {
            // Breite anpassen
            if ( (this._targetPos.indexOf('t') !== -1 || this._targetPos.indexOf('b') !== -1) &&
                    (this._ownPos.indexOf('t') !== -1 || this._ownPos.indexOf('b') !== -1) ) {
                
                let width = 0;
                if (this._targetEl) {
                    if (this._targetEl.hasOwnProperty('spinBoxWidth')) {
                        width = this._targetEl.spinBoxWidth;
                    } else {
                        width = this._targetEl.width;
                    }
                }
                
                switch (this._autoSize) {
                    case 'min': this.style.minWidth = width + 'px'; break;
                    case 'max': this.style.maxWidth = width + 'px'; break;
                    case 'fit': this.style.width = width + 'px'; break;
                }

            // Höhe anpassen
            } else if ( (this._targetPos.indexOf('l') !== -1 || this._targetPos.indexOf('r') !== -1) &&
                    (this._ownPos.indexOf('l') !== -1 || this._ownPos.indexOf('r') !== -1) ) {
                
                let height = 0;
                if (this._targetEl) {
                    if (this._targetEl.hasOwnProperty('spinBoxHeight')) {
                        height = this._targetEl.spinBoxHeight;
                    } else {
                        height = this._targetEl.height;
                    }
                }
                
                switch (this._autoSize) {
                    case 'min': this.style.minHeight = height + 'px'; break;
                    case 'max': this.style.maxHeight = height + 'px'; break;
                    case 'fit': this.style.height = height + 'px'; break;
                }
            }
        }

        // Aurichten an X, Y
        let positions = null;
        if (kijs.isNumber(x) && kijs.isNumber(y)) {
            positions = this._dom.alignToRect(
                {x: x, y: y, w: 0, h: 0},
                this._targetPos,
                this._ownPos,
                this._allowSwapX,
                this._allowSwapY,
                this._offsetX,
                this._offsetY
            );

        // Ausrichten an Node
        } else {
            positions = this._dom.alignToTarget(
                this.targetNode,
                this._targetPos,
                this._ownPos,
                this._allowSwapX,
                this._allowSwapY,
                this._offsetX,
                this._offsetY
            );
        }

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


    /**
     * Workaround um die Breite zu rechnen.
     * Ist z.T. nötig, damit sich die Breite richtig an die Breite des Inhalts anpasst,
     * auch wenn der Inhalt keine definierte Breite hat (z.B. bei einem Menu).
     * Schaut, wie breit das Element ohne Scrollbar ist, und stellt diese Fix ein.
     * @returns {undefined}
     */
    _widthWorkaround() {
        if (this._autoWidth && this.autoScroll) {
            this.autoScroll = false;
            this._dom.width = null;
            let pos = kijs.Dom.getAbsolutePos(this._dom.node);
            let sbw = kijs.Dom.getScrollbarWidth();
            let w = pos.w + sbw + 10;

            this._dom.width = w;
            this.autoScroll = true;
        }
    }


    // LISTENERS
    _onBodyMouseDown(e) {
        if (!this._preventHide) {
            this.close();
        }
        this._preventHide = false;
    }

    _onKeyDown(e) {
        switch (e.nodeEvent.code) {
            case 'Escape':
            case 'F4':
            case 'Tab':
                this.close();
                break;
        }
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

    _onNodeWheel(e) {
        this._preventHide = true;
    }

    _onTargetElKeyDown(e) {
        switch (e.nodeEvent.code) {
            case 'Escape':
            case 'Tab':
                this.close();
                break;

            case 'F4':
                if (this.isRendered) {
                    this.close();
                } else {
                    this.show();
                }
                break;

            case 'ArrowDown':
                this.show();
                break;
        }
    }



    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(superCall) {
        if (!superCall) {
            // unrender
            this.unrender(superCall);

            // Event auslösen.
            this.raiseEvent('destruct');
        }

        // Event-Listeners entfernen
        if (this._targetEl) {
            this._targetEl.off(null, null, this);
        }


        // Variablen (Objekte/Arrays) leeren
        this._targetEl = null;
        this._ownerNodes = null;

        // Basisklasse entladen
        super.destruct(true);
    }
};
