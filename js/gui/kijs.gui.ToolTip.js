/* global kijs */

// --------------------------------------------------------------
// kijs.gui.ToolTip
// --------------------------------------------------------------
kijs.gui.ToolTip = class kijs_gui_ToolTip extends kijs.Observable {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        this._disabled = false;
        this._dom = new kijs.gui.Dom();
        this._followPointer = false;    // Soll sich der TipText mit dem Mauszeiger verschieben?
        this._offsetX = 10;
        this._offsetY = 10;
        this._target = null;
        this._defaultConfig = {};

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });

        // Mapping für die Zuweisung der Config-Eigenmschaften
        this._configMap = {
            cls: { fn: 'function', target: this._dom.clsAdd, context: this._dom },
            disabled: true,
            followPointer: true,
            html: { target: 'html', context: this._dom },
            htmlDisplayType: { target: 'htmlDisplayType', context: this._dom },
            offsetX : true,
            offsetY: true,
            on: { fn: 'assignListeners' },
            target: { target: 'target' },
            style : { fn: 'assign', target: 'style', context: this._dom }
        };

        this._dom.clsAdd('kijs-tooltip');

        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config);
        }
    }


    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get disabled() { return this._disabled; }
    set disabled(val) {
        this._disabled = !!val;

        if (this._disabled) {
            this.hide();
        }
    }

    get dom() { return this._dom; }

    get html() { return this._dom.html; }
    set html(val) { this._dom.html = val; }

    get isEmpty() { return this._dom.isEmpty; }

    get target() { return this._target; }
    set target(val) {
        if (this._target !== val) {
            this._target = val;
            this._bindEventsToTarget();
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
        kijs.Object.assignConfig(this, config, this._configMap);
    }


    hide() {
        this.unrender();
    }

    /**
     * rendert den DOM-Node
     * @param {Boolean} [superCall=false]
     * @returns {undefined}
     */
    render(superCall) {
        // DOM Rendern
        this._dom.render();

        // Event auslösen.
        if (!superCall) {
            this.raiseEvent('afterRender');
        }
    }

    show(x, y) {
        let updatePos = false;

        // rendern
        if (!this._dom.node) {
            this.render();
        }

        // an body anhängen
        if (this._dom.node.parentNode !== document.body) {
            document.body.appendChild(this._dom.node);

            // listener auf body
            kijs.Dom.addEventListener('mousemove', document.body, this._onMouseMoveOnBody, this);

            // position aktualisieren
            updatePos = true;
        }

        if (this._followPointer) {
            updatePos = true;
        }

        // X
        if (updatePos && kijs.isDefined(x)) {
            // Offset addieren
            if (this._offsetX) {
                x += this._offsetX;
            }

            // Sicherstellen, dass der ToolTip auf dem Bildschirm platz hat
            if (x+this._dom.node.offsetWidth > window.innerWidth) {
                x = Math.abs(window.innerWidth - this._dom.node.offsetWidth - 5);
            }

            // Position zuweisen
            this._dom.style.left = x + 'px';
        }

        // Y
        if (updatePos && kijs.isDefined(y)) {
            // Offset addieren
            if (this._offsetY) {
                y += this._offsetY;
            }

            // Sicherstellen, dass der ToolTip auf dem Bildschirm platz hat
            if (y+this._dom.node.offsetHeight > window.innerHeight) {
                y = Math.abs(window.innerHeight - this._dom.node.offsetHeight - 5);
            }

            // Position zuweisen
            this._dom.style.top = y + 'px';
        }
    }


    /**
     * Node aus DOM entfernen, falls vorhanden
     * @param {bool} superCall true, if called from child
     * @returns {undefined}
     */
    unrender(superCall) {
        // Event auslösen.
        if (!superCall) {
            this.raiseEvent('unrender');
        }

        // Event entfernen
        kijs.Dom.removeEventListener('mousemove', document.body, this);

        this._dom.unrender();
    }


    // PROTECTED
    _bindEventsToTarget() {
        this._target.on('mouseMove', this._onMouseMoveTarget, this);
        this._target.on('mouseLeave', this._onMouseLeave, this);
    }

    _onMouseMoveOnBody(e) {
        if (this._target) {
            let mouseX = e.nodeEvent.clientX, mouseY = e.nodeEvent.clientY;
            let top = kijs.Dom.getAbsolutePos(this._target.node).y,
                    left = kijs.Dom.getAbsolutePos(this._target.node).x,
                    width = this._target.width,
                    height = this._target.height;

            if (width && height) {
                // prüfen, ob der Mauszeiger über dem Element ist.
                if (mouseX < left || mouseX > left+width || mouseY < top || mouseY > top+height) {
                    this.hide();
                }
            } else {
                this.hide();
            }
        } else {
            this.hide();
        }
    }

    _onMouseMoveTarget(e) {
        if (!this.disabled) {
            this.show(e.nodeEvent.clientX, e.nodeEvent.clientY);
        }
    }

    _onMouseLeave(e) {
        this.hide();
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

        // Listeners entfernen
        if (this._target) {
            this._target.off(null, null, this);
        }

        // Elemente/DOM-Objekte entladen
        if (this._dom) {
            this._dom.destruct();
        }

        // Variablen (Objekte/Arrays) leeren
        this._dom = null;
        this._target = null;

        // Basisklasse entladen
        super.destruct(true);
    }
};