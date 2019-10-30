/* global kijs, this, HTMLElement */

// --------------------------------------------------------------
// kijs.gui.ApertureMask
// --------------------------------------------------------------
// Halbtransparente Maske mit einem Ausschnitt für ein Element,
// das unmaskiert bleibt.
// Das Element, dass nicht überdeckt wird, wird mit der Eigenschaft target festgelegt.
// Der Rest des Bildschirms wird von der Maske überdeckt und kann nicht mehr bedient werden.

kijs.gui.ApertureMask = class kijs_gui_ApertureMask extends kijs.Observable {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);
        
        this._targetEl = null;
        this._targetDom = null;
        this._animated = true;

        this._topDom = new kijs.gui.Dom({cls:['kijs-aperturemask', 'top']});
        this._rightDom = new kijs.gui.Dom({cls:['kijs-aperturemask', 'right']});
        this._leftDom = new kijs.gui.Dom({cls:['kijs-aperturemask', 'left']});
        this._bottomDom = new kijs.gui.Dom({cls:['kijs-aperturemask', 'bottom']});

        // Mapping für die Zuweisung der Config-Eigenschaften
        this._configMap = {
            animated: true,
            cls: { fn: 'function', target: this.clsAdd },
            target: {target: 'target'}
        };

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }

        // window onResize überwachen
        kijs.Dom.addEventListener('resize', window, this._onWindowResize, this);
    }


    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------

    get isRendered() { return !!this._topDom.isRendered; }

    get targetDom() { return this._targetDom; }
    set target(val) {

        // Listeners entfernen
        if (this._targetEl) {
            this._targetEl.off(null, null, this);
        }

        // Element übergeben: Grösse überwachen
        if (val instanceof kijs.gui.Element) {
            this._targetEl = val;
            this._targetDom = val.dom;

            this._targetEl.on('afterResize', this._onAfterResize, this);

        } else if (val instanceof kijs.gui.Dom) {
            this._targetEl = null;
            this._targetDom = val;

        } else {
            throw new kijs.Error('invalid element for kijs.gui.ApertureMask target');
        }
    }

    get visible() { return this.isRendered; }
    set visible(val) {
        if (val && !this.visible) {
            this.show();

        } else if (!val && this.visible) {
            this.hide();
        }
    }

    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    /**
     * Wendet die Konfigurations-Eigenschaften an
     * @param {Object} config
     * @returns {undefined}
     */
    applyConfig(config={}) {
        // Config zuweisen
        kijs.Object.assignConfig(this, config, this._configMap);
    }

    /**
     * Fügt den DOM-Elementen eine CSS-Klasse hinzu.
     * @param {Array|String} cls
     * @returns {undefined}
     */
    clsAdd(cls) {
        this._topDom.clsAdd(cls);
        this._rightDom.clsAdd(cls);
        this._bottomDom.clsAdd(cls);
        this._leftDom.clsAdd(cls);
    }


    /**
     * Blendet die Maske aus (mit Animation)
     * @returns {undefined}
     */
    hide() {
        this._topDom.style.opacity = 0;
        this._rightDom.style.opacity = 0;
        this._bottomDom.style.opacity = 0;
        this._leftDom.style.opacity = 0;

        if (this._animated) {
            // animation läuft 0.2s, danach aus DOM entfernen
            kijs.defer(function() {
                this.unrender();
            }, 200, this);

        } else {
            this.unrender();
        }
    }

    render() {
        this._topDom.renderTo(document.body);
        this._rightDom.renderTo(document.body);
        this._bottomDom.renderTo(document.body);
        this._leftDom.renderTo(document.body);
        this.raiseEvent('afterRender');
    }

    /**
     * Zeigt die Maske an.
     * @returns {undefined}
     */
    show() {
        this.updatePosition();
        this.render();

        if (this._animated) {
            // einblenden nach 10ms
            kijs.defer(function() {
                this._topDom.style.opacity = 1;
                this._rightDom.style.opacity = 1;
                this._bottomDom.style.opacity = 1;
                this._leftDom.style.opacity = 1;
            }, 10, this);

        } else {
            this._topDom.style.opacity = 1;
            this._rightDom.style.opacity = 1;
            this._bottomDom.style.opacity = 1;
            this._leftDom.style.opacity = 1;
        }
    }

    /**
     * Aktualisiert die Position des DOM-Nodes
     * @returns {undefined}
     */
    updatePosition() {
        let node = this._targetDom && this._targetDom.node ? this._targetDom.node : null;
        let pos = node ? kijs.Dom.getAbsolutePos(node) : {x:0, y:0, w:0, h:0}; // x, y, w, h

        // top element
        this._topDom.style.left = pos.x + 'px';
        this._topDom.style.height = pos.y + 'px';
        this._topDom.style.width = pos.w + 'px';

        // right element
        this._rightDom.style.left = (pos.x + pos.w) + 'px';

        // bottom element
        this._bottomDom.style.left = pos.x + 'px';
        this._bottomDom.style.top = (pos.y + pos.h) + 'px';
        this._bottomDom.style.width = pos.w + 'px';

        // left element
        this._leftDom.style.width = pos.x + 'px';
    }


    // PROTECTED
    _onAfterResize() {
        if (this.isRendered) {
            this.updatePosition();
        }
    }

    _onWindowResize() {
        if (this.isRendered) {
            this.updatePosition();
        }
    }


    unrender(superCall=false) {
        // Event auslösen.
        if (!superCall) {
            this.raiseEvent('unrender');
        }

        this._topDom.unrender();
        this._rightDom.unrender();
        this._leftDom.unrender();
        this._bottomDom.unrender();
    }

    destruct(superCall=false) {
        if (!superCall) {
            // unrender
            this.unrender(superCall);

            // Event auslösen.
            this.raiseEvent('destruct');
        }

        // Listeners entfernen
        if (this._targetEl) {
            this._targetEl.off(null, null, this);
        }
        this._targetEl = null;
        this._targetDom = null;

        // Node-Event Listener auf Window entfernen
        kijs.Dom.removeEventListener('resize', window, this);

        // Elemente/DOM-Objekte entladen
        if (this._topDom) {
            this._topDom.destruct();
        }
        if (this._rightDom) {
            this._rightDom.destruct();
        }
        if (this._leftDom) {
            this._leftDom.destruct();
        }
        if (this._bottomDom) {
            this._bottomDom.destruct();
        }

        // Variablen (Objekte/Arrays) leeren
        this._topDom = null;
        this._rightDom = null;
        this._leftDom = null;
        this._bottomDom = null;

        // Basisklasse entladen
        super.destruct();
    }

};