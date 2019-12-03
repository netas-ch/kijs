/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.Splitter
// --------------------------------------------------------------
kijs.gui.Splitter = class kijs_gui_Splitter extends kijs.gui.Element {

    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        this._overlayDom = new kijs.gui.Dom();

        this._initialPos = null;
        this._targetPos = null;
        this._targetEl = null;      // Zielelement (kijs.gui.Element)

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            targetPos: 'left'
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            target: { target: 'target' },   // Optional. Wenn leer wird das Target aufgrund der targetPos ermittelt
            targetPos: { target: 'targetPos' }
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
    get direction() {
        if (this._targetPos === 'left' || this._targetPos === 'right') {
            return 'horizontal';
        } else if (this._targetPos === 'top' || this._targetPos === 'bottom') {
            return 'vertical';
        } else {
            throw new kijs.Error(`unknown targetPos`);
        }
    }

    get target() {
        // Falls das Target nicht bekannt ist: automatisch aufgrund der targetPos ermitteln
        if (!this._targetEl) {
            this.target = this._detectTarget();
            if (!this._targetEl) {
                throw new kijs.Error(`config missing "target"`);
            }
        }

        return this._targetEl;
    }
    set target(val) {
        if (!val instanceof kijs.gui.Element) {
            throw new kijs.Error(`Unkown format on config "target"`);
        }
        this._targetEl = val;
    }

    get targetPos() { return this._targetPos; }
    set targetPos(val) {
        if (!kijs.Array.contains(['top', 'right', 'left', 'bottom'], val)) {
            throw new kijs.Error(`unknown targetPos`);
        }

        this._targetPos = val;

        this._dom.clsRemove(['kijs-splitter-horizontal', 'kijs-splitter-vertical']);
        this._dom.clsAdd('kijs-splitter-' + this.direction);

        this._overlayDom.clsRemove(['kijs-splitter-overlay-horizontal', 'kijs-splitter-overlay-vertical']);
        this._overlayDom.clsAdd('kijs-splitter-overlay-' + this.direction);
    }




    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // PROTECTED
    /**
     * Ermittelt den Ziel-Node (target), dessen Grösse angepasst werden soll aufgrund der targetPos
     * @returns {HTMLELement}
     */
    _detectTarget() {
        let targetEl = null;
        if (this._targetPos === 'left' || this._targetPos === 'top') {
            targetEl = this.previous;

        } else if (this._targetPos === 'right' || this._targetPos === 'bottom') {
            targetEl = this.next;

        }
        return targetEl;
    }

    /**
     * Aktualisiert die Overlay-Position aufgrund der Mauszeigerposition
     * @param {Number} xAbs     Mausposition clientX
     * @param {Number} yAbs     Mausposition clientY
     * @returns {undefined}
     */
    _updateOverlayPosition(xAbs, yAbs) {
        // Berechnet aus der absoluten Position bezogen zum Browserrand,
        // die relative Position bezogen zum übergeordneten DOM-Node
        const parentPos = kijs.Dom.getAbsolutePos(this._dom.node.parentNode);
        const newPos = {
            x: xAbs - parentPos.x,
            y: yAbs - parentPos.x
        };

        if (this.direction === 'horizontal') {
            this._overlayDom.left = newPos.x;
        } else {
            this._overlayDom.top = newPos.y;
        }
    }


    // LISTENERS
    _onMouseDown(e) {
        if (this.direction === 'horizontal') {
            this._initialPos = e.nodeEvent.clientX;
        } else {
            this._initialPos = e.nodeEvent.clientY;
        }

        // Overlay Positionieren
        this._updateOverlayPosition(e.nodeEvent.clientX, e.nodeEvent.clientY);

        // Overlay rendern
        this._overlayDom.render();
        this._dom.node.parentNode.appendChild(this._overlayDom.node);

        // mousemove und mouseup Listeners auf das document setzen
        kijs.Dom.addEventListener('mousemove', document, this._onMouseMove, this);
        kijs.Dom.addEventListener('mouseup', document, this._onMouseUp, this);
    }

    _onMouseMove(e) {
        // Overlay Positionieren
        this._updateOverlayPosition(e.nodeEvent.clientX, e.nodeEvent.clientY);
    }

    _onMouseUp(e) {
        // Beim ersten auslösen Listeners gleich wieder entfernen
        kijs.Dom.removeEventListener('mousemove', document, this);
        kijs.Dom.removeEventListener('mouseup', document, this);

        // Overlay wieder ausblenden
        this._overlayDom.unrender();

        // Differenz zur vorherigen Position ermitteln
        let offset;
        if (this.direction === 'horizontal') {
            offset = e.nodeEvent.clientX - this._initialPos;
        } else {
            offset = e.nodeEvent.clientY - this._initialPos;
        }

        // Neue Breite des Zielelements berechnen und zuweisen
        switch (this._targetPos) {
            case 'top': this.target.height = this.target.height + offset; break;
            case 'right': this.target.width = this.target.width - offset; break;
            case 'bottom': this.target.height = this.target.height - offset; break;
            case 'left': this.target.width = this.target.width + offset; break;
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

        // Elemente/DOM-Objekte entladen
        if (this._overlayDom) {
            this._overlayDom.destruct();
        }

        // Variablen (Objekte/Arrays) leeren
        this._overlayDom = null;
        this._targetEl = null;

        // Basisklasse entladen
        super.destruct(true);
    }

};