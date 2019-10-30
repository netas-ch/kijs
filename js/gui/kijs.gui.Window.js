/* global kijs, this, HTMLElement */

// --------------------------------------------------------------
// kijs.gui.Window
// --------------------------------------------------------------
// Das Fenster kann mit der Mehtode .show() angezeigt werden.
// Es wird dann in das target gerendert.
// Als target kann der document.body oder ein kijs.gui.Element angegeben
// werden.
// Beim Body als target ist der Body auch gleich der übergeordnete Node (parentNode).
// Beim einem kijs.gui.Element als target ist das übergeordnete Element nicht der node
// des Elements, sondern dessen parentNode.
// Deshalb gibt es die Eigenschaften targetNode und parentNode, welche bei einem
// kijs.gui.Element als target nicht den gleichen node als Inhalt haben. Beim body
// als target, hingegen schon.
// Mit der targetDomProperty kann noch festgelegt werden, welcher node eines Elements
// als target dient, wird nichts angegeben, so dient das ganze Element als target.
// Es kann z.B. bei einem kijs.gui.Panel nur der innere Teil als target angegeben werden.
// Dazu kann die Eigenschaft targetDomProperty="innerDom" definiert werden.
// --------------------------------------------------------------
kijs.gui.Window = class kijs_gui_Window extends kijs.gui.Panel {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        this._resizeDeferHandle = null;   // intern
        this._dragInitialPos = null;      // intern

        this._modalMaskEl = null;

        this._draggable = false;
        //this._focusDelay = 300;    // Delay zwischen dem rendern und dem setzen vom Fokus
        this._resizeDelay = 300;    // min. Delay zwischen zwei Resize-Events

        this._targetX = null;           // Zielelement (kijs.gui.Element) oder Body (HTMLElement)
        this._targetDomProperty = 'dom'; // Dom-Eigenschaft im Zielelement (String) (Spielt bei Body als target keine Rolle)

        this._dom.clsAdd('kijs-window');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            draggable: true,
            target: document.body,

            // defaults overwrite kijs.gui.Panel
            closable: true,
            maximizable: true,
            resizable: true,
            shadow: true
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            draggable: { target: 'draggable' },
            //focusDelay: true,
            modal: { target: 'modal' },     // Soll das Fenster modal geöffnet werden (alles Andere wird mit einer halbtransparenten Maske verdeckt)?
            resizeDelay: true,
            target: { target: 'target' },
            targetDomProperty: true
        });

        // Listeners
        this.on('mouseDown', this._onMouseDown, this);

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }
    }


    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get draggable() { return this._draggable; }
    set draggable(val) {
        if (val && !this._draggable) {
            this._headerBarEl.on('mouseDown', this._onHeaderBarMouseDown, this);
        } else if (!val && this._draggable) {
            this._headerBarEl.off('mouseDown', this._onHeaderBarMouseDown, this);
            kijs.Dom.removeEventListener('mousemove', document, this);
            kijs.Dom.removeEventListener('mouseup', document, this);
        }
        this._draggable = !!val;
    }

    //get focusDelay() { return this._focusDelay; }
    //set focusDelay(val) { this._focusDelay = val; }

    get modal() { return !kijs.isEmpty(this._modalMaskEl); }
    set modal(val) {
        if (val) {
            if (kijs.isEmpty(this._modalMaskEl)) {
                this._modalMaskEl = new kijs.gui.Mask({
                    target: this.target,
                    targetDomProperty: this.targetDomProperty
                });
            }
        } else {
            if (!kijs.isEmpty(this._modalMaskEl)) {
                this._modalMaskEl.destruct();
            }
        }
    }


    /**
     * Gibt den Node zurück in dem sich die Maske befindet (parentNode)
     * @returns {HTMLElement}
     */
    get parentNode() {
        if (this._targetX instanceof kijs.gui.Element) {
            return this._targetX[this._targetDomProperty].node.parentNode;
        } else {
            return this._targetX;
        }
    }

    get resizeDelay() { return this._resizeDelay; }
    set resizeDelay(val) { this._resizeDelay = val; }

    get target() {
        return this._targetX;
    }
    set target(val) {
        // Evtl. Listeners vom alten _targetX entfernen
        if (!kijs.isEmpty(this._targetX)) {
            if (this._targetX instanceof kijs.gui.Element) {
                this._targetX.off('afterResize', this._onTargetElAfterResize, this);
                this._targetX.off('changeVisibility', this._onTargetElChangeVisibility, this);
                this._targetX.off('destruct', this._onTargetElDestruct, this);
            } else if (this._targetX === document.body) {
                kijs.Dom.removeEventListener('resize', window, this);
            }
        }

        // Target ist ein kijs.gui.Element
        if (val instanceof kijs.gui.Element) {
            this._targetX = val;

            this._targetX.on('afterResize', this._onTargetElAfterResize, this);
            this._targetX.on('changeVisibility', this._onTargetElChangeVisibility, this);
            this._targetX.on('destruct', this._onTargetElDestruct, this);

        // Target ist der Body
        } else if (val === document.body || val === null) {
            this._targetX = document.body;

            // onResize überwachen
            // Wenn der Browser langsam grösser gezogen wird, wird der event dauernd
            // ausgelöst, darum wird er verzögert weitergegeben.
            kijs.Dom.addEventListener('resize', window, this._onWindowResize, this);

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
        if (this._targetX instanceof kijs.gui.Element) {
            return this._targetX[this._targetDomProperty].node;
        } else {
            return this._targetX;
        }
    }


    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    /**
     * Zentriert das Fenster auf dem Bildschirm
     * @param {Boolean} [preventEvents=false]   // Das Auslösen des afterResize-Event verhindern?
     * @returns {undefined}
     */
    center(preventEvents=false) {
        const targetNode = this.targetNode;

        // afterResize-Event deaktivieren
        const prevAfterRes = this._preventAfterResize;
        this._preventAfterResize = true;

        // Zentrieren
        this.left = targetNode.offsetLeft + (targetNode.offsetWidth - this.width) / 2;
        this.top = targetNode.offsetTop + (targetNode.offsetHeight - this.height) / 2;

       // afterResize-Event wieder zulassen
       this._preventAfterResize = prevAfterRes;

       // Evtl. afterResize-Event zeitversetzt auslösen
        if (!preventEvents && this._hasSizeChanged()) {
            this._raiseAfterResizeEvent(true);
        }
    }


    // overwrite
    restore() {
        if (!this.maximized) {
            return;
        }

        // afterResize-Event deaktivieren
        const prevAfterRes = this._preventAfterResize;
        this._preventAfterResize = true;

        super.restore();

        // evtl. Fester zentrieren
        if (!this._dom.hasLeft || !this._dom.hasTop) {
            this.center(true);
        }

        // Sicherstellen, dass es platz hat
        this._adjustPositionToTarget(true);

        // afterResize-Event wieder aktivieren
        this._preventAfterResize = prevAfterRes;

        // Evtl. afterResize-Event zeitversetzt auslösen
        this._raiseAfterResizeEvent(true);
    }

    /**
     * Zeigt das Fenster an
     * @returns {undefined}
     */
    show() {
        // Evtl. Maske für modale anzeige einblenden
        if (this._modalMaskEl) {
            this._modalMaskEl.renderTo(this.parentNode);
             new kijs.gui.LayerManager().setActive(this._modalMaskEl);
        }

        // Fenster anzeigen
        this.renderTo(this.parentNode);

        if (!this.maximized) {
            // evtl. Fenster zentrieren
            if (!this._dom.hasLeft || !this._dom.hasTop) {
                this.center(true);

            // sonst nur sicherstellen, dass es ins target passt
            } else {
                this._adjustPositionToTarget(true);
            }
        }

        // afterResize-Event zeitversetzt auslösen
        this._raiseAfterResizeEvent(true);

        this.toFront();
    }

    toFront() {
        if (this._dom.node && this._dom.node.parentNode &&
                (!this.resizer || (this.resizer && !this.resizer.domOverlay))) {
            new kijs.gui.LayerManager().setActive(this);
        }
    }


    // overwrite
    unrender(superCall) {
        // Event auslösen.
        if (!superCall) {
            this.raiseEvent('unrender');
        }

        // Elemente/DOM-Objekte entladen
        if (this._modalMaskEl) {
            this._modalMaskEl.unrender();
        }

        super.unrender(true);
    }
    // PROTECTED
    /**
     * Stellt sicher, dass das Fenster innerhalb des Targets angezeigt wird
     * @param {Boolean} [preventEvents=false]   // Das Auslösen des afterResize-Event verhindern?
     * @returns {undefined}
     */
    _adjustPositionToTarget(preventEvents=false) {
        const targetNode = this.targetNode;

        // afterResize-Event deaktivieren
        const prevAfterRes = this._preventAfterResize;
        this._preventAfterResize = true;

        let left = this.left;
        let top = this.top;
        let width = this.width;
        let height = this.height;

        // Höhe und Breite evtl. an target anpassen
        if (width > targetNode.offsetWidth) {
            width = targetNode.offsetWidth;
        }
        if (height > targetNode.offsetHeight) {
            height = targetNode.offsetHeight;
        }
        this.width = width;
        this.height = height;

        // Evtl. Position an Target anpassen
        if (left + width > targetNode.offsetLeft + targetNode.offsetWidth) {
            left = targetNode.offsetLeft + (targetNode.offsetWidth - width);
        }
        if (left < 0) {
            left = 0;
        }
        if (top + height > targetNode.offsetTop + targetNode.offsetHeight) {
            top = targetNode.offsetTop + (targetNode.offsetHeight - height);
        }
        if (top < 0) {
            top = 0;
        }
        this.left = left;
        this.top = top;

        // afterResize-Event wieder zulassen
        this._preventAfterResize = prevAfterRes;

        // Evtl. afterResize-Event zeitversetzt auslösen
        if (!preventEvents && this._hasSizeChanged()) {
            this._raiseAfterResizeEvent(true);
        }
    }


    // LISTENERS
    _onHeaderBarMouseDown(e) {
        this.toFront();

        if (this.maximized) {
            return;
        }

        this._dragInitialPos = {
            mouseX: e.nodeEvent.clientX,
            mouseY: e.nodeEvent.clientY,
            windowX: this.left,
            windowY: this.top,
            windowTransition: this.style.transition ? this.style.transition : ''
        };

        // Allfällige Transitionen temporär abschalten
        this.style.transition = 'none';

        // mousemove und mouseup Listeners auf das document setzen
        // (Workaround, weil sonst manchmal der Resizer stehen bleibt)
        kijs.Dom.addEventListener('mousemove', document, this._onDocumentMouseMove, this);
        kijs.Dom.addEventListener('mouseup', document, this._onDocumentMouseUp, this);
    }

    _onDocumentMouseMove(e) {
        if (kijs.isEmpty(this._dragInitialPos)) {
            return;
        }

        // Neue Position ermitteln
        let x = this._dragInitialPos.windowX + (e.nodeEvent.clientX - this._dragInitialPos.mouseX);
        let y = this._dragInitialPos.windowY + (e.nodeEvent.clientY - this._dragInitialPos.mouseY);

        // Min-Position begrenzen
        if (x < 0) {
            x = 0;
        }
        if (y < 0) {
            y = 0;
        }

        // Evtl. max-Position begrenzen
        const targetNode = this.targetNode;
        if (x < targetNode.offsetLeft) {
            x = targetNode.offsetLeft;
        }
        if ((x + this._dom.width) > (targetNode.offsetLeft + targetNode.offsetWidth)) {
            x = targetNode.offsetLeft + targetNode.offsetWidth - this._dom.width;
        }

        if (y < targetNode.offsetTop) {
            y = targetNode.offsetTop;
        }
        if ((y + this._dom.height) > (targetNode.offsetTop + targetNode.offsetHeight)) {
            y = targetNode.offsetTop + targetNode.offsetHeight - this._dom.height;
        }

        // Grösse zuweisen
        this.left = x;
        this.top = y;
    }

    _onDocumentMouseUp(e) {
        // Beim ersten auslösen Listeners gleich wieder entfernen
        kijs.Dom.removeEventListener('mousemove', document, this);
        kijs.Dom.removeEventListener('mouseup', document, this);

        if (kijs.isEmpty(this._dragInitialPos)) {
            return;
        }

        // Transitions-sperre wieder aufheben
        this.dom.style.transition = this._dragInitialPos.windowTransition;
        this._dragInitialPos = null;
    }

    _onMouseDown(e) {
        this.toFront();
    }

    /**
     * Listener der Aufgerufen wird, wenn die Grösse des Target-Elements geändert hat
     * @param {Object} e
     * @returns {undefined}
     */
    _onTargetElAfterResize(e) {
        // Sicherstellen, dass das Fenster im Target platz hat
        this._adjustPositionToTarget(true);

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

    _onWindowResize(e) {
         // Sicherstellen, dass das Fenster im Target platz hat
        this._adjustPositionToTarget(true);

        this._raiseAfterResizeEvent(true, e);
    }


    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(superCall) {
        if (!superCall) {
            // unrender
            this.unrender();

            // Event auslösen.
            this.raiseEvent('destruct');
        }

        // Node-Event Listeners entfernen
        if (this._targetX === document.body) {
            kijs.Dom.removeEventListener('resize', window, this);
        }
        kijs.Dom.removeEventListener('mouseMove', document, this);
        kijs.Dom.removeEventListener('mouseUp', document, this);

        // Event-Listeners entfernen
        if (this._targetX instanceof kijs.gui.Element) {
            this._targetX.off(null, null, this);
        }

        if (this._resizeDeferHandle) {
            window.clearTimeout(this._resizeDeferHandle);
        }

        // Elemente/DOM-Objekte entladen
        if (this._modalMaskEl) {
            this._modalMaskEl.destruct();
        }

        // Variablen (Objekte/Arrays) leeren
        this._dragInitialPos = null;
        this._modalMaskEl = null;
        this._resizeDeferHandle = null;
        this._targetX = null;

        // Basisklasse auch entladen
        super.destruct(true);
    }
};