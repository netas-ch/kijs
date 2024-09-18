/* global kijs, this, HTMLElement */

// --------------------------------------------------------------
// kijs.gui.Mask
// --------------------------------------------------------------
// Halbtransparente Maske, die über den Body oder ein kijs.gui.Element gelegt wird
// und so die Bedienung der dahinterliegenden Oberfläche verhindert.
//
// Mit der Eigenschaft displayWaitIcon=true kann ein Ladesymbol mitangezeigt werden.
//
// Mit text kann ein Ladetext unterhalb des Icons angezeigt werden.
//
// Das Element, dass überdeckt wird, wird mit der Eigenschaft target festgelegt.
// Dies kann der document.body sein oder ein kijs.gui.Element.
//
// Beim Body als target wird die Maske mit dem nativen dialog-Tag dem body angefügt.
// Dies verhindert auch die Navigation via Tastatur unterhalb der Maske.
//
// Bei allen anderen targets, wird in den target zuerst ein Anchor-Div (0x0px div)
// als erster Node eingefügt und darin befindet sich das div der Maske.
// Eine Navigation via Tastatur wird damit nicht verhindert.
//
// Mit der targetDomProperty kann noch festgelegt werden, welcher node eines Elements
// als target dient. Wird nichts angegeben, so dient das ganze Element als target.
// Es kann z.B. bei einem kijs.gui.Panel nur der innere Teil als target angegeben werden.
// Dazu kann die Eigenschaft targetDomProperty="innerDom" definiert werden.
// --------------------------------------------------------------
kijs.gui.Mask = class kijs_gui_Mask extends kijs.gui.Element {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        // Anker-Node von 0x0px mit position:relative in dem sich die Maske befindet.
        // Nur nötig, wenn der Target nicht der Body ist
        this._maskAnchorDom = new kijs.gui.Dom({
            cls:'kijs-mask-anchor'
        });

        // Zetriertes div, in dem sich das Ladeicon und der Ladetext befindet
        this._maskCenterDom = new kijs.gui.Dom({
            cls:'kijs-mask-center'
        });

        // Ladeicon
        this._iconEl = new kijs.gui.Icon({
            parent: this,
            cls:'kijs-mask-icon'
        });

        // Ladetext
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

        // Target ist der Viewport
        if (val instanceof kijs.gui.ViewPort) {
            this._targetElement = null;
            
        // Target ist ein kijs.gui.Element
        } else if ((val instanceof kijs.gui.Element) && !(val instanceof kijs.gui.ViewPort)) {
            this._targetElement = val;

            this._targetElement.on('afterResize', this.#onTargetElAfterResize, this);
            this._targetElement.on('changeVisibility', this.#onTargetElChangeVisibility, this);
            this._targetElement.on('destruct', this.#onTargetElDestruct, this);

        // Target ist der Body
        } else if (val === document.body || kijs.isEmpty(val)) {
            this._targetElement = null;

        } else {
            throw new kijs.Error(`kijs.gui.Mask: Unknown format on config "target"`);
        }
    }

    get targetDomProperty() { return this._targetDomProperty; };
    set targetDomProperty(val) { this._targetDomProperty = val; };

    get text() { return this._textDom.html; }
    set text(val) { this._textDom.html = val; }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // Overwrite
    render(superCall) {
        const isBody = !(this._targetElement instanceof kijs.gui.Element);

        // Bei body, wird ein dialog-Tag verwendet, sonst ein div-Tag
        this._dom.nodeTagName = isBody ? 'dialog' : 'div';

        // Falls target != Body: Muss die Maske in ein Anchor-Element.
        if (!isBody) {
            this._maskAnchorDom.render();
        }

        // DOM Rendern
        if (isBody) {
            this._dom.render();
        } else {
            this._dom.renderTo(this._maskAnchorDom.node);
        }

        // Sichtbarkeit
        if (kijs.isDefined(this._visible)) {
            this.visible = this._visible;
        }

        if (this._waitMaskEl) {
            kijs.defer(function() {
                if (this._waitMaskEl) {
                    this._waitMaskEl.show();
                }
            }, 300, this);
        }

        // Event afterRender auslösen
        if (!superCall) {
            this.raiseEvent('afterRender');
        }

        // Grösse der Maske an target anpassen
        this._updateMaskSize();

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
    renderTo(targetNode, referenceNode=null, insertPosition='before') {
        // Wenn nicht im Viewport, wird die Maske in ein 0x0px Anker-Div gerendert
        if (this._targetElement instanceof kijs.gui.Element) {
            const firstRender = !this.isRendered;

            this.render();

            this._maskAnchorDom.renderTo(targetNode, referenceNode, insertPosition);

            // Event afterFirstRenderTo auslösen
            if (firstRender) {
                this.raiseEvent('afterFirstRenderTo');
            }

        } else {
            super.renderTo(targetNode, referenceNode, insertPosition);
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

        if (this._maskAnchorDom) {
            this._maskAnchorDom.unrender();
        }
        
        super.unrender(true);
    }

    /**
     * Zeigt die Maskierung an
     * @returns {undefined}
     */
    show() {
        if (this._targetElement instanceof kijs.gui.Element) {
            let nde = this._targetElement[this._targetDomProperty].node;

            if (nde) {
                if (nde.hasChildNodes()) {
                    this.renderTo(nde, nde.firstChild);
                } else {
                    this.renderTo(nde);
                }
            }
            
        } else {
            this.renderTo(document.body);
            this._dom.node.showModal();
        }
    }


    // PROTECTED
    _updateMaskSize() {
        // nur nötig, wenn Target != Body
        if (this._targetElement instanceof kijs.gui.Element) {
            let style;

            let top = 0;
            let left = 0;
            let height = this._targetElement[this._targetDomProperty].height;
            let width = this._targetElement[this._targetDomProperty].width;

            // Weitere Eigenschaften
            // Bereits gerendert: direkt aus CSS nehmen
            if (this._targetElement[this._targetDomProperty] && this._targetElement[this._targetDomProperty].node) {
                style = window.getComputedStyle(this._targetElement[this._targetDomProperty].node);
            } else {
                style = this._targetElement.style;
            }

            // Border abziehen
            top -= style.borderTopWidth ? parseFloat(style.borderTopWidth) : 0;
            left -= style.borderLeftWidth ? parseFloat(style.borderLeftWidth) : 0;

            // Padding abziehen
            top -= style.paddingTop ? parseFloat(style.paddingTop) : 0;
            left -= style.paddingLeft ? parseFloat(style.paddingLeft) : 0;

            // Masse übernehmen
            this.top = top;
            this.left = left;
            this.height = height;
            this.width = width;

            // Border-Radius auch von target übernehmen
            this._dom.style.borderTopLeftRadius = style.borderTopLeftRadius;
            this._dom.style.borderTopRightRadius = style.borderTopRightRadius;
            this._dom.style.borderBottomLeftRadius = style.borderBottomLeftRadius;
            this._dom.style.borderBottomRightRadius = style.borderBottomRightRadius;
        }
    }


    // PRIVATE
    // LISTENERS
    #onTargetElAfterResize(e) {
        this._updateMaskSize();
    }

    #onTargetElChangeVisibility(e) {
        this._updateMaskSize();
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

        if (this._maskAnchorDom) {
            this._maskAnchorDom.destruct();
        }

        // Basisklasse entladen
        super.destruct(true);

        // Variablen (Objekte/Arrays) leeren
        this._iconEl = null;
        this._textDom = null;
        this._maskCenterDom = null;
        this._targetElement = null;
        this._maskAnchorDom = null;
    }
    
};
