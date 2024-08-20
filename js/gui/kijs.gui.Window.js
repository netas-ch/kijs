/* global kijs, this, HTMLElement */

// --------------------------------------------------------------
// kijs.gui.Window
// --------------------------------------------------------------
// Das Fenster kann mit der Methode .show() angezeigt werden.
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
    // overwrite
    constructor(config={}) {
        super(false);

        this._resizeDeferHandle = null;   // intern
        this._dragInitialPos = null;      // intern

        this._moveWhenVirtualKeyboard = false; // Fenster neu zentrieren, falls das Virtual Keyboard eingeblendet wird.

        //this._modalMaskEl = null;
        this._modal = false;

        this._draggable = false;
        this._resizeDelay = 300;    // min. Delay zwischen zwei Resize-Events

        this._targetX = null;           // Zielelement (kijs.gui.Element) oder Body (HTMLElement)
        this._targetDomProperty = 'dom'; // Dom-Eigenschaft im Zielelement (String) (Spielt bei Body als target keine Rolle)

        this._dom.clsAdd('kijs-window');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            nodeTagName: 'dialog',
            draggable: true,
            target: document.body,

            // defaults overwrite kijs.gui.Panel
            closable: true,
            maximizable: true,
            resizable: true
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            draggable: { target: 'draggable' },
            modal: { target: 'modal' },     // Soll das Fenster modal geöffnet werden (alles Andere wird mit einer halbtransparenten Maske verdeckt)?
            resizeDelay: true,
            target: { target: 'target' },
            targetDomProperty: true,
            moveWhenVirtualKeyboard: true
        });

        // Listeners
        this.on('mouseDown', this.#onMouseDown, this);

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }

        // Virtual Keyboard API (Nur in Chrome mit SSL)
        if (this._moveWhenVirtualKeyboard && 'virtualKeyboard' in navigator) {
            navigator.virtualKeyboard.overlaysContent = true;
            kijs.Dom.addEventListener('geometrychange', navigator.virtualKeyboard, this.#onVirtualKeyboardGemoetryChange, this);
        }

    }
    


    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get draggable() { return this._draggable; }
    set draggable(val) {
        if (val && !this._draggable) {
            this._headerBarEl.on('mouseDown', this.#onHeaderBarMouseDown, this);
            this._headerBarEl.on('touchStart', this.#onHeaderBarTouchStart, this);
            this._headerBarEl.on('touchMove', this.#onHeaderBarTouchMove, this);
            this._headerBarEl.on('touchEnd', this.#onHeaderBarTouchEnd, this);
        } else if (!val && this._draggable) {
            this._headerBarEl.off('mouseDown', this.#onHeaderBarMouseDown, this);
            this._headerBarEl.off('touchStart', this.#onHeaderBarTouchStart, this);
            this._headerBarEl.off('touchMove', this.#onHeaderBarTouchMove, this);
            this._headerBarEl.off('touchEnd', this.#onHeaderBarTouchEnd, this);
            kijs.Dom.removeEventListener('mousemove', document, this);
            kijs.Dom.removeEventListener('mouseup', document, this);
        }
        this._draggable = !!val;
    }

    get modal() { return !!this._modal; }
    set modal(val) {
        this._modal = !!val;
        if (this.isRendered) {
            this.show();
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
                this._targetX.off('afterResize', this.#onTargetElAfterResize, this);
                this._targetX.off('changeVisibility', this.#onTargetElChangeVisibility, this);
                this._targetX.off('destruct', this.#onTargetElDestruct, this);
            } else if (this._targetX === document.body) {
                kijs.Dom.removeEventListener('resize', window, this);
            }
        }

        // Target ist ein kijs.gui.Element
        if (val instanceof kijs.gui.Element) {
            this._targetX = val;

            this._targetX.on('afterResize', this.#onTargetElAfterResize, this);
            this._targetX.on('changeVisibility', this.#onTargetElChangeVisibility, this);
            this._targetX.on('destruct', this.#onTargetElDestruct, this);

        // Target ist der Body
        } else if (val === document.body || val === null) {
            this._targetX = document.body;

            // onResize überwachen
            // Wenn der Browser langsam grösser gezogen wird, wird der event dauernd
            // ausgelöst, darum wird er verzögert weitergegeben.
            kijs.Dom.addEventListener('resize', window, this.#onWindowResize, this);

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

    // overwrite
    get visible() { return super.visible; }
    set visible(val) {
        super.visible = val;
    }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    /**
     * Zentriert das Fenster auf dem Bildschirm
     * @param {Boolean} [preventEvents=false]   // Das Auslösen des afterResize-Event verhindern?
     * @param {Number} [offsetX=0]              // X-Offset
     * @param {Number} [offsetY=0]              // Y-Offset
     * @returns {undefined}
     */
    center(preventEvents=false, offsetX=0, offsetY=0) {
        const targetNode = this.targetNode;

        // afterResize-Event deaktivieren
        const prevAfterRes = this._preventAfterResize;
        this._preventAfterResize = true;

        // Zentrieren
        this.left = targetNode.offsetLeft + ((targetNode.offsetWidth - this.width) / 2) + offsetX;
        this.top = targetNode.offsetTop + ((targetNode.offsetHeight - this.height) / 2) + offsetY;

       // afterResize-Event wieder zulassen
       this._preventAfterResize = prevAfterRes;

       // Evtl. afterResize-Event zeitversetzt auslösen
        if (!preventEvents && this._hasSizeChanged()) {
            this._raiseAfterResizeEvent(true);
        }
    }
    
    // overwrite
    close(preventDestruct, preventEvents, superCall) {
        if (!superCall) {
            if (!preventEvents) {
                // beforeClose Event. Bei Rückgabe=false -> abbrechen
                if (this.raiseEvent('beforeClose') === false) {
                    return;
                }
            }
        }
        
        this.unrender();
        
        if (!preventEvents) {
            this.raiseEvent('close');
        }
        
        if (!preventDestruct) {
            this.destruct();
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
        // Fenster rendern und anzeigen
        if (this.isRendered) {
            this._dom.node.close();
        } else {
            this.renderTo(this.parentNode);
        }



        if (this._modal) {
            this._dom.node.showModal();
        } else {
            this._dom.node.show();
        }
        
        this.visible = true;

        if (!this.maximized) {
            // evtl. Fenster zentrieren
            if (!this._dom.hasLeft || !this._dom.hasTop) {
                this.center(true);

            // sonst nur sicherstellen, dass es ins Target passt
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

    
    // PRIVATE
    // LISTENERS
    #onHeaderBarMouseDown(e) {
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
        kijs.Dom.addEventListener('mousemove', document, this.#onDocumentMouseMove, this);
        kijs.Dom.addEventListener('mouseup', document, this.#onDocumentMouseUp, this);
    }

    #onHeaderBarTouchEnd(e) {
        if (kijs.isEmpty(this._dragInitialPos)) {
            return;
        }

        // Transitions-sperre wieder aufheben
        this.dom.style.transition = this._dragInitialPos.windowTransition;
        this._dragInitialPos = null;
    }

    #onHeaderBarTouchMove(e) {
        if (kijs.isEmpty(this._dragInitialPos)) {
            return;
        }

        // Neue Position ermitteln
        let x = this._dragInitialPos.windowX + (e.nodeEvent.touches[0].clientX - this._dragInitialPos.mouseX);
        let y = this._dragInitialPos.windowY + (e.nodeEvent.touches[0].clientY - this._dragInitialPos.mouseY);

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

        // Bubbeling und native Listeners verhindern
        e.nodeEvent.stopPropagation();
        e.nodeEvent.preventDefault();
    }

    #onHeaderBarTouchStart(e) {
        if (e.nodeEvent.touches.length > 1) {
            return;
        }

        this.toFront();

        if (this.maximized) {
            return;
        }

        this._dragInitialPos = {
            mouseX: e.nodeEvent.touches[0].clientX,
            mouseY: e.nodeEvent.touches[0].clientY,
            windowX: this.left,
            windowY: this.top,
            windowTransition: this.style.transition ? this.style.transition : ''
        };

        // Allfällige Transitionen temporär abschalten
        this.style.transition = 'none';
    }

    #onDocumentMouseMove(e) {
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

    #onDocumentMouseUp(e) {
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

    #onMouseDown(e) {
        this.toFront();
    }

    /**
     * Listener der Aufgerufen wird, wenn die Grösse des Target-Elements geändert hat
     * @param {Object} e
     * @returns {undefined}
     */
    #onTargetElAfterResize(e) {
        // Sicherstellen, dass das Fenster im Target platz hat
        this._adjustPositionToTarget(true);

        // Falls die eigene Grösse geändert hat: das eigene afterResize-Event auslösen
        this._raiseAfterResizeEvent(false, e);
    }

    #onTargetElChangeVisibility(e) {
        // Sichbarkeit ändern
        this.visible = e.visible;
    }

    #onTargetElDestruct(e) {
        this.destruct();
    }

    // Fenster neu zentrieren wenn eine virtuelle Tastatur eingeblendet wird (Mobile)
    #onVirtualKeyboardGemoetryChange(e) {

        if (this.isRendered && this._moveWhenVirtualKeyboard && e.nodeEvent.target) {
            const { x, y, width, height } = e.nodeEvent.target.boundingRect;
            
            // Tastatur geschlossen: Fenster zentrieren
            if (width === 0 && height === 0) {
                this.center();

            // Falls möglich, Fenster so zentrieren, dass es nicht von der Tastatur verdeckt wird.
            } else {
                this.center(false, 0, height * -1);
            }

        }

    }

    #onWindowResize(e) {
         // Sicherstellen, dass das Fenster im Target platz hat
        this._adjustPositionToTarget(true);

        this._raiseAfterResizeEvent(true, e);
    }



    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    // overwrite
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

        if ('virtualKeyboard' in navigator) {
            kijs.Dom.removeEventListener('geometrychange', navigator.virtualKeyboard, this);
        }

        // Event-Listeners entfernen
        if (this._targetX instanceof kijs.gui.Element) {
            this._targetX.off(null, null, this);
        }

        if (this._resizeDeferHandle) {
            window.clearTimeout(this._resizeDeferHandle);
        }

        // Elemente/DOM-Objekte entladen

        // Variablen (Objekte/Arrays) leeren
        this._dragInitialPos = null;
        this._resizeDeferHandle = null;
        this._targetX = null;

        // Basisklasse auch entladen
        super.destruct(true);
    }
    
};
