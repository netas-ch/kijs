/* global kijs, this, HTMLElement */

// --------------------------------------------------------------
// kijs.gui.Mask
// --------------------------------------------------------------
// Halbtransparente Maske, die über den Body oder ein kijs.gui.Element gelegt wird
// und so die Bedienung der dahinterliegenden Oberfläche verhindert.
//
// Mit der Eigenschaft displayWaitIcon=true kann ein Ladesymbol mitangezeigt werden.
//
// Das Element, dass überdeckt wird, wird mit der Eigenschaft target festgelegt.
// Dies kann der document.body sein oder ein kijs.gui.Element.
//
// Beim Body als target ist der Body auch gleich der übergeordnete Node (parentNode)
// und die Maske wird mit dem nativen dialog-tag erstellt. Dies verhindert auch die 
// Navigation via Tastatur unterhalb der Maske.
//
// Beim einem kijs.gui.Element als target ist das übergeordnete Element nicht der node
// des Elements, sondern dessen parentNode und die Maske wird mit einem div-tag erstellt.
// Eine Navigation via Tastatur wird damit nicht verhindert.
//
// Deshalb gibt es die Eigenschaften targetNode und parentNode, welche bei einem
// kijs.gui.Element als target nicht den gleichen node als Inhalt haben. Beim body
// als target, hingegen schon.
//
// Mit der targetDomProperty kann noch festgelegt werden, welcher node eines Elements
// als target dient, wird nichts angegeben, so dient das ganze Element als target.
// Es kann z.B. bei einem kijs.gui.Panel nur der innere Teil als target angegeben werden.
// Dazu kann die Eigenschaft targetDomProperty="innerDom" definiert werden.
// Mit dem Attribut "text" kann ein Text unterhalb des icons angezeigt werden.
// --------------------------------------------------------------
kijs.gui.Mask = class kijs_gui_Mask extends kijs.gui.Element {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        this._maskCenterDom = new kijs.gui.Dom({
            cls:'kijs-mask-center'
        });

        this._iconEl = new kijs.gui.Icon({
            parent: this,
            cls:'kijs-mask-icon'
        });

        this._textDom = new kijs.gui.Dom({
            cls:'kijs-mask-text'
        });

        this._targetElement = null;      // Zielelement (kijs.gui.Element) oder NULL=document.body (HTMLElement)
        this._targetDomProperty = 'dom'; // Dom-Eigenschaft im Zielelement (String) (Spielt bei Body als target keine Rolle)

        this._dom.clsAdd('kijs-mask');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            target: document.body
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            displayWaitIcon: { target: 'displayWaitIcon' },
            icon: { target: 'icon' },
            text: { target: 'html', context: this._textDom },
            iconChar: { target: 'iconChar', context: this._iconEl },
            iconCls: { target: 'iconCls', context: this._iconEl },
            iconColor: { target: 'iconColor', context: this._iconEl },
            iconMap: { target: 'iconMap', context: this._iconEl },
            target: { target: 'target' }, // kijs.gui.Element oder body
            targetDomProperty: true
        });
        
        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }
    }



    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get displayWaitIcon() {
        return this._iconEl.iconChar === kijs.iconMap.Fa.spinner.char;
    }
    set displayWaitIcon(val) {
        if (val) {
            this.iconMap = 'kijs.iconMap.Fa.spinner';
            this._iconEl.dom.clsAdd('kijs-pulse');
        } else {
            this.iconChar = null;
            this._iconEl.dom.clsRemove('kijs-pulse');
        }
    }
    get icon() { return this._iconEl; }
    /**
     * Icon zuweisen
     * @param {kijs.gui.Icon|Object} val     Icon als icon-Config oder kijs.gui.Icon Element
     */
    set icon(val) {
        // Icon zurücksetzen?
        if (kijs.isEmpty(val)) {
            this._iconEl.iconChar = null;
            this._iconEl.iconCls = null;
            this._iconEl.iconColor = null;
            if (this.isRendered) {
                this.render();
            }

        // kijs.gui.Icon Instanz
        } else if (val instanceof kijs.gui.Icon) {
            this._iconEl.destruct();
            this._iconEl = val;
            if (this.isRendered) {
                this.render();
            }

        // Config Objekt
        } else if (kijs.isObject(val)) {
            this._iconEl.applyConfig(val);
            if (this.isRendered) {
                this.render();
            }

        } else {
            throw new kijs.Error(`config "icon" is not valid.`);

        }
    }

    get iconChar() { return this._iconEl.iconChar; }
    set iconChar(val) { this._iconEl.iconChar = val; }

    get iconCls() { return this._iconEl.iconCls; }
    set iconCls(val) { this._iconEl.iconCls = val; }

    get iconColor() { return this._iconEl.iconColor; }
    set iconColor(val) { this._iconEl.iconColor = val; }

    get iconMap() { return this._iconEl.iconMap; }
    set iconMap(val) { this._iconEl.iconMap = val; }

    // overwrite
    get isEmpty() { return this._iconEl.isEmpty; }

    /**
     * Gibt den Node zurück in dem sich die Maske befindet (parentNode)
     * @returns {HTMLElement}
     */
    get parentNode() {
        if (this._targetElement instanceof kijs.gui.Element) {
            let domEl = this._targetElement[this._targetDomProperty];
            if (domEl && domEl.node) {
                if (domEl.node === document.body) {
                    return document.body;
                } else if (domEl.node.parentNode) {
                    return domEl.node.parentNode;
                }
            }

            // wenn node nicht im Dom
            return null;

        } else {
            return document.body;
        }
    }

    get target() {
        return this._targetElement;
    }
    set target(val) {
        // Evtl. Listeners vom alten _targetElement entfernen
        if (!kijs.isEmpty(this._targetElement)) {
            if (this._targetElement instanceof kijs.gui.Element) {
                this._targetElement.off(null, null, this);
            }
        }

        // Target ist ein kijs.gui.Element
        if (val instanceof kijs.gui.Element) {
            this._targetElement = val;

            this._targetElement.on('afterResize', this.#onTargetElAfterResize, this);
            this._targetElement.on('changeVisibility', this.#onTargetElChangeVisibility, this);
            this._targetElement.on('destruct', this.#onTargetElDestruct, this);

            // Falls das target ein z-index hat, übernehmen wir diesen für diese Maske und rechnen + 2
            if (!isNaN(parseInt(this._targetElement.dom.style.zIndex))) {
                this._dom.style.zIndex = parseInt(this._targetElement.dom.style.zIndex) + 2;
            }

        // Target ist der Body
        } else if (val === document.body || kijs.isEmpty(val)) {
            this._targetElement = null;

        } else {
            throw new kijs.Error(`kijs.gui.Mask: Unkown format on config "target"`);

        }
    }

    get targetDomProperty() { return this._targetDomProperty; };
    set targetDomProperty(val) { this._targetDomProperty = val; };

    /**
     * Gibt den Ziel-Node zurück, über den die Maske gelegt wird
     * @returns {HTMLElement}
     */
    get targetNode() {
        if (this._targetElement instanceof kijs.gui.Element) {
            return this._targetElement[this._targetDomProperty].node;
        } else {
            return document.body;
        }
    }

    get text() { return this._textDom.html; }
    set text(val) { this._textDom.html = val; }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // Overwrite
    render(superCall) {
        const isBody = this.parentNode === document.body;

        // Bei body, wird ein dialog-Tag verwendet, sonst ein div-Tag
        this._dom.nodeTagName = isBody ? 'dialog' : 'div';

        super.render(true);

        // Maskierung positionieren
        this._updateMaskPosition();

        // centerDom rendern
        this._maskCenterDom.renderTo(this._dom.node);
        
        // Span icon rendern (kijs.gui.Icon)
        if (!this._iconEl.isEmpty) {
            this._iconEl.renderTo(this._maskCenterDom.node);
        } else if (this._iconEl.isRendered) {
            this._iconEl.unrender();
        }

        // Text rendern (kijs.gui.Dom)
        if (!this._textDom.isEmpty) {
            this._textDom.renderTo(this._maskCenterDom.node);
        }

        // Event afterRender auslösen
        if (!superCall) {
            this.raiseEvent('afterRender');
        }
    }

    // overwrite
    unrender(superCall) {
        // Event auslösen.
        if (!superCall) {
            this.raiseEvent('unrender');
        }

        if (this._maskCenterDom) {
            this._maskCenterDom.unrender();
        }
        
        super.unrender(true);
    }

    /**
     * Zeigt die Maskierung an
     * @returns {undefined}
     */
    show() {
        const parentNode = this.parentNode;
        if (parentNode) {
            this.renderTo(parentNode);
        }
        if (this._dom.nodeTagName === 'dialog') {
            this._dom.node.showModal();
        }
    }


    // PROTECTED
    _updateMaskPosition() {
        // targetX === kijs.gui.Element
        if (this._targetElement instanceof kijs.gui.Element) {
            this.top = this._targetElement[this._targetDomProperty].top;
            this.left = this._targetElement[this._targetDomProperty].left;
            this.height = this._targetElement[this._targetDomProperty].height;
            this.width = this._targetElement[this._targetDomProperty].width;

            // Border-Radius vom Target übernehmen
            
            // Bereits gerendert: Radius direkt aus CSS nehmen
            if (this._targetElement[this._targetDomProperty] && this._targetElement[this._targetDomProperty].node) {
                const style = window.getComputedStyle(this._targetElement[this._targetDomProperty].node);

                this._dom.style.borderTopLeftRadius = style.borderTopLeftRadius;
                this._dom.style.borderTopRightRadius = style.borderTopRightRadius;
                this._dom.style.borderBottomLeftRadius = style.borderBottomLeftRadius;
                this._dom.style.borderBottomRightRadius = style.borderBottomRightRadius;

            // noch nicht gerendert: CSS kann noch nicht gelesen werden, deshalb nur
            // Style lesen.
            } else {
                this._dom.style.borderTopLeftRadius = this._targetElement.style.borderTopLeftRadius;
                this._dom.style.borderTopRightRadius = this._targetElement.style.borderTopRightRadius;
                this._dom.style.borderBottomLeftRadius = this._targetElement.style.borderBottomLeftRadius;
                this._dom.style.borderBottomRightRadius = this._targetElement.style.borderBottomRightRadius;

            }

        }
    }


    // PRIVATE
    // LISTENERS
    #onTargetElAfterResize(e) {
        // Maskierung positionieren
        this._updateMaskPosition();
    }

    #onTargetElChangeVisibility(e) {
        // Maskierung positionieren
        this._updateMaskPosition();

        // Sichbarkeit ändern
        this.visible = e.visible;
    }

    #onTargetElDestruct(e) {
        this.destruct();
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

        // Event-Listeners entfernen
        if (this._targetElement instanceof kijs.gui.Element) {
            this._targetElement.off(null, null, this);
        }

        // Elemente/DOM-Objekte entladen
        if (this._iconEl) {
            this._iconEl.destruct();
        }
        if (this._textDom) {
            this._textDom.destruct();
        }
        if (this._maskCenterDom) {
            this._maskCenterDom.destruct();
        }

        // Basisklasse entladen
        super.destruct(true);

        // Variablen (Objekte/Arrays) leeren
        this._iconEl = null;
        this._textDom = null;
        this._maskCenterDom = null;
        this._targetElement = null;
    }
    
};
