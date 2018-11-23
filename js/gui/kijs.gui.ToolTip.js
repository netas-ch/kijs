/* global kijs */

// --------------------------------------------------------------
// kijs.gui.ToolTip
// --------------------------------------------------------------
kijs.gui.ToolTip = class kijs_gui_ToolTip extends kijs.Observable {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config) {
        super(false);
        
        this._disabled = false;
        this._dom = new kijs.gui.Dom();
        this._followPointer = false;    // Soll sich der TipText mit dem Mauszeiger verschieben?
        this._offsetX = 10;
        this._offsetY = 10;
        this._target = null;

        // Standard-config-Eigenschaften mergen
        config = Object.assign({}, {
            // keine
        }, config);
        
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
        if (this._dom) {
            this._dom.clsAdd('kijs-hidden');
        }

        // listener auf body entfernen
        kijs.Dom.removeEventListener('mousemove', document.body, this);
    }

    /**
     * rendert den DOM-Node
     * @param {Boolean} [preventAfterRender=false]
     * @returns {undefined}
     */
    render(preventAfterRender) {
        // DOM Rendern
        this._dom.render();
    }

    show(x, y) {
        const create = !this.dom.node;

        if (create) {
            this.render();
        }

        // Position setzen
        if (create || this._dom.clsHas('kijs-hidden') || this._followPointer) {
            // X
            if (kijs.isDefined(x)) {
                // Offset addieren
                if (this._offsetX) {
                    x += this._offsetX;
                }
                
                // Sicherstellen, dass der ToolTip auf dem Bildschirm platz hat
                if (x+this._dom.node.offsetWidth > window.innerWidth) {
                    x = Math.abs(window.innerWidth - this._dom.node.offsetWidth);
                }
                
                // Position zuweisen
                this._dom.style.left = x + 'px';
            }
            
            // Y
            if (kijs.isDefined(y)) {
                // Offset addieren
                if (this._offsetY) {
                    y += this._offsetY;
                }
                
                // Sicherstellen, dass der ToolTip auf dem Bildschirm platz hat
                if (y+this._dom.node.offsetHeight > window.innerHeight) {
                    y = Math.abs(window.innerHeight - this._dom.node.offsetHeight);
                }
                
                // Position zuweisen
                this._dom.style.top = y + 'px';
            }
            
            // Einblenden
            this._dom.clsRemove('kijs-hidden');

            // listener auf body
            kijs.Dom.addEventListener('mousemove', document.body, this._onMouseMoveOnBody, this);
        }
        
        if (create) {
            document.body.appendChild(this._dom.node);
        }
    }


    /**
     * Node aus DOM entfernen, falls vorhanden
     * @returns {undefined}
     */
    unRender() {
        this._dom.unRender();        
    }


    // PROTECTED
    _bindEventsToTarget() {
        this._target.on('mouseMove', this._onMouseMoveTarget, this);
        this._target.on('mouseLeave', this._onMouseLeave, this);
    }
    
    /*_onMouseMoveTipText(e) {
        if (!this.disabled) {
            this.show();
        }
    }*/

    _onMouseMoveOnBody(e) {
        if (this._target) {
            let mouseX = e.nodeEvent.clientX, mouseY = e.nodeEvent.clientY;
            let top = this._target.topAbsolute,
                    left = this._target.leftAbsolute,
                    width = this._target.width,
                    height = this._target.height;

            if (top && left && width && height) {
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
    destruct(preventDestructEvent) {
        // Event auslösen.
        if (!preventDestructEvent) {
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
        super.destruct();
    }
};