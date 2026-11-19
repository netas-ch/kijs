/* global kijs */

// --------------------------------------------------------------
// kijs.gui.Tooltip
// --------------------------------------------------------------
/**
 * Tooltip, der beim Bewegen der Maus über ein kijs.gui.Dom (target) als Popover beim Mauszeiger
 * angezeigt und beim Verlassen wieder ausgeblendet wird. Wird normalerweise nicht direkt
 * erstellt, sondern über die Eigenschaft tooltip von kijs.gui.Dom bzw. kijs.gui.Element.
 *
 * @example
 * new kijs.gui.Button({ caption: 'Speichern', tooltip: 'Speichert die Änderungen' });
 * new kijs.gui.Button({ caption: 'Info', tooltip: { html: 'Hinweis', followPointer: false } });
 *
 * @fires afterRender  Nach dem Rendern
 * @fires destruct  Beim Zerstören
 * @fires unrender  Beim Ausblenden bzw. Entfernen aus dem DOM
 */
kijs.gui.Tooltip = class kijs_gui_Tooltip extends kijs.Observable {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        this._disabled = false;
        this._dom = new kijs.gui.Dom({
            nodeAttribute: {
                popover: 'manual'
            }
        });
        this._followPointer = true;    // Soll sich der TipText mit dem Mauszeiger verschieben?
        this._offsetX = 13;
        this._offsetY = 10;
        this._target = null;
        this._defaultConfig = {};

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        this._configMap = {
            cls             : { fn: 'function', target: this._dom.clsAdd, context: this._dom },  // {String|Array} Zusätzliche CSS-Klassen
            disabled        : true,     // {Boolean} Tooltip deaktivieren (wird dann nicht angezeigt). Achtung: Über die Config wird hide() nicht aufgerufen.
            followPointer   : true,     // {Boolean} Soll sich der Tooltip mit dem Mauszeiger verschieben? Default: true
            html            : { target: 'html', context: this._dom },
            htmlDisplayType : { target: 'htmlDisplayType', context: this._dom },    // {String} Darstellung von html (siehe kijs.gui.Dom.htmlDisplayType)
            offsetX         : true,     // {Number} Horizontaler Abstand zum Mauszeiger in px. Default: 13
            offsetY         : true,     // {Number} Vertikaler Abstand zum Mauszeiger in px. Default: 10
            on              : { fn: 'assignListeners' },    // {Object} Listeners, z.B. { afterRender: fn, context: this }
            style           : { fn: 'assign', target: 'style', context: this._dom },    // {Object} CSS-Styles des Tooltips
            target          : { target: 'target' }
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
    /**
     * Tooltip deaktiviert? Beim Deaktivieren wird er ausgeblendet.
     * @type {Boolean}
     */
    get disabled() { return this._disabled; }
    set disabled(val) {
        this._disabled = !!val;

        if (this._disabled) {
            this.hide();
        }
    }

    /**
     * kijs.gui.Dom des Tooltips
     * @type {kijs.gui.Dom}
     */
    get dom() { return this._dom; }

    /**
     * Inhalt des Tooltips
     * @type {String}
     */
    get html() { return this._dom.html; }
    set html(val) { this._dom.html = val; }

    /**
     * Ist der Inhalt leer?
     * @type {Boolean}
     */
    get isEmpty() { return this._dom.isEmpty; }

    /**
     * Element, bei dem der Tooltip angezeigt wird. Beim Zuweisen werden Listeners für
     * mouseMove und mouseLeave darauf gesetzt und vom bisherigen Element entfernt. null = keines.
     * @type {kijs.gui.Dom|null}
     */
    get target() { return this._target; }
    set target(val) {
        if (this._target !== val) {
            // Listeners vom bisherigen target entfernen
            if (this._target) {
                this._target.off('mouseMove', this.#onMouseMoveTarget, this);
                this._target.off('mouseLeave', this.#onMouseLeave, this);
            }

            this._target = val;
            if (this._target) {
                this._bindEventsToTarget();
            }
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

    /**
     * Blendet den Tooltip aus (siehe unrender()).
     * @returns {undefined}
     */
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

    /**
     * Zeigt den Tooltip an. Die Position (plus offsetX/offsetY) wird beim ersten Anzeigen und mit
     * followPointer bei jedem Aufruf gesetzt und so angepasst, dass der Tooltip im Fenster Platz hat.
     * Bewegt sich die Maus ausserhalb von target, wird er wieder ausgeblendet.
     * @param {Number} [x]  x-Position (clientX) des Mauszeigers
     * @param {Number} [y]  y-Position (clientY) des Mauszeigers
     * @returns {undefined}
     */
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
            kijs.Dom.addEventListener('mousemove', document.body, this.#onMouseMoveOnBody, this);

            // position aktualisieren
            updatePos = true;
        }

        // show popover
        this._dom.node.showPopover();

        if (this._followPointer) {
            updatePos = true;
        }

        // X
        if (updatePos && kijs.isDefined(x)) {
            // Offset addieren
            if (this._offsetX) {
                x += this._offsetX;
            }

            // Sicherstellen, dass der Tooltip auf dem Bildschirm Platz hat
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

            // Sicherstellen, dass der Tooltip auf dem Bildschirm Platz hat
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

        // hide popover
        if (this._dom.node) {
            this._dom.node.hidePopover();
        }

        // Event entfernen
        kijs.Dom.removeEventListener('mousemove', document.body, this);

        this._dom.unrender();
    }


    // PROTECTED
    /**
     * Setzt die Listeners für mouseMove (show) und mouseLeave (hide) auf target.
     * @returns {undefined}
     */
    _bindEventsToTarget() {
        this._target.on('mouseMove', this.#onMouseMoveTarget, this);
        this._target.on('mouseLeave', this.#onMouseLeave, this);
    }
    
    
    // PRIVATE
    // LISTENERS
    #onMouseLeave(e) {
        this.hide();
    }
    
    #onMouseMoveOnBody(e) {
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

    #onMouseMoveTarget(e) {
        if (!this.disabled) {
            this.show(e.nodeEvent.clientX, e.nodeEvent.clientY);
        }
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
