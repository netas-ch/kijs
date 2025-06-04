/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.Resizer
// --------------------------------------------------------------
kijs.gui.Resizer = class kijs_gui_Resizer extends kijs.gui.Element {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        this._initialPos = null;
        this._targetEl = null;

        this._targetMaxHeight = null;
        this._targetMaxWidth = null;
        this._targetMinHeight = null;
        this._targetMinWidth = null;

        this._overlayDom = new kijs.gui.Dom({
            cls: 'kijs-resizer-overlay'
        });

        this._dom.clsAdd('kijs-resizer');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            allowResizeWidth: true,
            allowResizeHeight: true
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            target: { target: '_targetEl' },
            targetMaxHeight: true,
            targetMaxWidth: true,
            targetMinHeight: true,
            targetMinWidth: true,
            allowResizeWidth: { target: 'allowResizeWidth' },
            allowResizeHeight: { target: 'allowResizeHeight' }
        });

        // Listeners
        this.on('mouseDown', this.#onMouseDown, this);
        this.on('touchStart', this.#onTouchStart, this);
        this.on('touchMove', this.#onTouchMove, this);
        this.on('touchEnd', this.#onTouchEnd, this);

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }
    }



    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get allowResizeHeight() {
        return this._dom.clsHas('kijs-resizer-height');
    }
    set allowResizeHeight(val) {
        if (val) {
            this._dom.clsAdd('kijs-resizer-height');
        } else {
            this._dom.clsRemove('kijs-resizer-height');
        }
    }
    
    get allowResizeWidth() {
        return this._dom.clsHas('kijs-resizer-width');
    }
    set allowResizeWidth(val) {
        if (val) {
            this._dom.clsAdd('kijs-resizer-width');
        } else {
            this._dom.clsRemove('kijs-resizer-width');
        }
    }
    
    get target() { return this._targetEl; }

    get targetMaxHeight() { return this._targetMaxHeight; }
    set targetMaxHeight(val) { this._targetMaxHeight = val; }

    get targetMaxWidth() { return this._targetMaxWidth; }
    set targetMaxWidth(val) { this._targetMaxWidth = val; }

    get targetMinHeight() { return this._targetMinHeight; }
    set targetMinHeight(val) { this._targetMinHeight = val; }

    get targetMinWidth() { return this._targetMinWidth; }
    set targetMinWidth(val) { this._targetMinWidth = val; }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // PROTECTED
    /**
     * Ermittelt die maximale Grösse, die das Element haben darf
     * @returns {Object}
     */
    _getMinMaxSize() {
        const ret = {
            wMin: null,
            wMax: null,
            hMin: null,
            hMax: null
        };

        let parentNode;

        // kijs.gui.Window haben die Eigenschaft targetNode
        const isWindow = !!this._targetEl.targetNode;
        if (isWindow) {
            parentNode = this._targetEl.targetNode;

        // Bei allen anderen Elementen ermitteln wir selber
        } else {
            parentNode = this._targetEl.dom.node.parentNode;
        }


        // Maximale Grösse aufgrund des übergeordneten Elements
        // -------------
        // Window
        if (isWindow) {
            ret.wMax = parentNode.clientWidth + parentNode.offsetLeft - this._targetEl.left;
            ret.hMax = parentNode.clientHeight + parentNode.offsetTop - this._targetEl.top;

        // Panel und andere Elemente
        } else {
            // Breite
            switch (parentNode.style.overflowX) {
                case 'visible':
                case 'scroll':
                case 'auto':
                    ret.wMax = null;
                    break;

                case 'hidden':
                default:
                    ret.wMax = parentNode.clientWidth - this._targetEl.left;
            }

            // Höhe
            switch (parentNode.style.overflowY) {
                case 'visible':
                case 'scroll':
                case 'auto':
                    ret.hMax = null;
                    break;

                case 'hidden':
                default:
                    ret.hMax = parentNode.clientHeight - this._targetEl.top;
            }

        }

        // Max/min Grösse aufgrund der config des Resizers
        // -------------
        if (!kijs.isEmpty(this._targetMaxWidth)) {
            if (ret.wMax === null || this._targetMaxWidth < ret.wMax) {
                ret.wMax = this._targetMaxWidth;
            }
        }
        if (!kijs.isEmpty(this._targetMaxHeight)) {
            if (ret.hMax === null || this._targetMaxHeight < ret.hMax) {
                ret.hMax = this._targetMaxHeight;
            }
        }

        if (!kijs.isEmpty(this._targetMinWidth)) {
            if (ret.wMin === null || this._targetMinWidth < ret.wMin) {
                ret.wMin = this._targetMinWidth;
            }
        }
        if (!kijs.isEmpty(this._targetMinHeight)) {
            if (ret.hMin === null || this._targetMinHeight < ret.hMin) {
                ret.hMin = this._targetMinHeight;
            }
        }

        return ret;
    }


    // PRIVATE
    // LISTENERS
    #onMouseDown(e) {
        if (this.disabled) {
            return;
        }

        this._initialPos = {
            x: e.nodeEvent.clientX,
            y: e.nodeEvent.clientY,
            w: this._targetEl.width,
            h: this._targetEl.height
        };
        
        let targetElPos = kijs.Dom.getAbsolutePos(this._targetEl.dom.node);
        
        // Overlay positionieren
        this._overlayDom.top = targetElPos.y;
        this._overlayDom.left = targetElPos.x;
        this._overlayDom.width = targetElPos.w;
        this._overlayDom.height = targetElPos.h;

        // Overlay rendern
        this._overlayDom.render();
        document.body.appendChild(this._overlayDom.node);

        // mousemove und mouseup Listeners auf das document setzen
        kijs.Dom.addEventListener('mousemove', document, this.#onMouseMove, this);
        kijs.Dom.addEventListener('mouseup', document, this.#onMouseUp, this);
    }

    #onMouseMove(e) {
        if (this.disabled || this._initialPos === null) {
            return;
        }

        // Neue Grösse ermitteln
        let w = this._initialPos.w + (e.nodeEvent.clientX - this._initialPos.x);
        let h = this._initialPos.h + (e.nodeEvent.clientY - this._initialPos.y);

        // Max/min-Grösse begrenzen
        const minMaxSize = this._getMinMaxSize();
        if (minMaxSize.wMin !== null && w < minMaxSize.wMin) {
            w = minMaxSize.wMin;
        }
        if (minMaxSize.hMin !== null && h < minMaxSize.hMin) {
            h = minMaxSize.hMin;
        }

        if (minMaxSize.wMax !== null && w > minMaxSize.wMax) {
            w = minMaxSize.wMax;
        }
        if (minMaxSize.hMax !== null && h > minMaxSize.hMax) {
            h = minMaxSize.hMax;
        }
        
        // Wenn Breite nicht veränderbar
        if (!this._dom.clsHas('kijs-resizer-width')) {
            w = this._initialPos.w;
        }
        if (!this._dom.clsHas('kijs-resizer-height')) {
            h = this._initialPos.h;
        }
        
        // Grösse zuweisen
        this._overlayDom.width = w;
        this._overlayDom.height = h;
    }

    #onMouseUp(e) {
        // Beim ersten Auslösen Listeners gleich wieder entfernen
        kijs.Dom.removeEventListener('mousemove', document, this);
        kijs.Dom.removeEventListener('mouseup', document, this);

        // Neue Grösse ermitteln
        let w = this._initialPos.w + (e.nodeEvent.clientX - this._initialPos.x);
        let h = this._initialPos.h + (e.nodeEvent.clientY - this._initialPos.y);

        // Max/min-Grösse begrenzen
        const minMaxSize = this._getMinMaxSize();
        if (minMaxSize.wMin !== null && w < minMaxSize.wMin) {
            w = minMaxSize.wMin;
        }
        if (minMaxSize.hMin !== null && h < minMaxSize.hMin) {
            h = minMaxSize.hMin;
        }

        if (minMaxSize.wMax !== null && w > minMaxSize.wMax) {
            w = minMaxSize.wMax;
        }
        if (minMaxSize.hMax !== null && h > minMaxSize.hMax) {
            h = minMaxSize.hMax;
        }

        // Grösse zuweisen
        if (this._dom.clsHas('kijs-resizer-width')) {
            this._targetEl.width = w;
        }
        if (this._dom.clsHas('kijs-resizer-height')) {
            this._targetEl.height = h;
        }

        // Overlay wieder ausblenden
        this._overlayDom.unrender();
    }

    #onTouchEnd(e) {
        if (this.disabled || this._initialPos === null) {
            return;
        }

        // Neue Grösse ermitteln
        let w = this._overlayDom.width;
        let h = this._overlayDom.height;

        // Max/min-Grösse begrenzen
        const minMaxSize = this._getMinMaxSize();
        if (minMaxSize.wMin !== null && w < minMaxSize.wMin) {
            w = minMaxSize.wMin;
        }
        if (minMaxSize.hMin !== null && h < minMaxSize.hMin) {
            h = minMaxSize.hMin;
        }

        if (minMaxSize.wMax !== null && w > minMaxSize.wMax) {
            w = minMaxSize.wMax;
        }
        if (minMaxSize.hMax !== null && h > minMaxSize.hMax) {
            h = minMaxSize.hMax;
        }

        // Grösse zuweisen
        if (this._dom.clsHas('kijs-resizer-width')) {
            this._targetEl.width = w;
        }
        if (this._dom.clsHas('kijs-resizer-height')) {
            this._targetEl.height = h;
        }

        // Overlay wieder ausblenden
        this._overlayDom.unrender();

        this._initialPos = null;
    }


    #onTouchMove(e) {
        if (this.disabled || this._initialPos === null) {
            return;
        }

        // Neue Grösse ermitteln
        let w = this._initialPos.w + (e.nodeEvent.touches[0].clientX - this._initialPos.x);
        let h = this._initialPos.h + (e.nodeEvent.touches[0].clientY - this._initialPos.y);

        // Max/min-Grösse begrenzen
        const minMaxSize = this._getMinMaxSize();
        if (minMaxSize.wMin !== null && w < minMaxSize.wMin) {
            w = minMaxSize.wMin;
        }
        if (minMaxSize.hMin !== null && h < minMaxSize.hMin) {
            h = minMaxSize.hMin;
        }

        if (minMaxSize.wMax !== null && w > minMaxSize.wMax) {
            w = minMaxSize.wMax;
        }
        if (minMaxSize.hMax !== null && h > minMaxSize.hMax) {
            h = minMaxSize.hMax;
        }

        // Wenn Breite nicht veränderbar
        if (!this._dom.clsHas('kijs-resizer-width')) {
            w = this._initialPos.w;
        }
        if (!this._dom.clsHas('kijs-resizer-height')) {
            h = this._initialPos.h;
        }

        // Grösse zuweisen
        this._overlayDom.width = w;
        this._overlayDom.height = h;

        // Bubbeling und native Listeners verhindern
        e.nodeEvent.stopPropagation();
        e.nodeEvent.preventDefault();
    }

    #onTouchStart(e) {
        if (this.disabled || e.nodeEvent.touches.length > 1) {
            return;
        }

        this._initialPos = {
            x: e.nodeEvent.touches[0].clientX,
            y: e.nodeEvent.touches[0].clientY,
            w: this._targetEl.width,
            h: this._targetEl.height
        };

        let targetElPos = kijs.Dom.getAbsolutePos(this._targetEl.dom.node);

        // Overlay positionieren
        this._overlayDom.top = targetElPos.y;
        this._overlayDom.left = targetElPos.x;
        this._overlayDom.width = targetElPos.w;
        this._overlayDom.height = targetElPos.h;

        // Overlay rendern
        this._overlayDom.render();
        document.body.appendChild(this._overlayDom.node);
    }



    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    destruct(superCall) {
        if (!superCall) {
            // unrender
            this.unrender(superCall);

            // Event auslösen.
            this.raiseEvent('destruct');
        }

        // Elemente/DOM-Objekte entladen
        if (this._overlayDom) {
            this._overlayDom.destruct();
        }

        // Variablen (Objekte/Arrays) leeren
        this._initialPos = null;
        this._overlayDom = null;
        this._targetEl = null;

        // Basisklasse entladen
        super.destruct(true);
    }

};
