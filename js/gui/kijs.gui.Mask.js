/* global kijs, this, HTMLElement */

// --------------------------------------------------------------
// kijs.gui.Mask
// --------------------------------------------------------------
// Halbtransparente Maske, die über den Body oder ein kijs.gui.Element gelegt wird
// und so die Bedienung der dahinterliegenden Oberfläche verhindert.
// Mit der Eigenschaft displayWaitIcon=true kann ein Ladesymbol mitangezeigt werden.
// Das Element, dass überdeckt wird, wird mit der Eigenschaft target festgelegt.
// Dies kann der document.body sein oder ein kijs.gui.Element.
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
// Mit dem Attribut "text" kann ein Text unterhalb des icons angezeigt werden.
// --------------------------------------------------------------
kijs.gui.Mask = class kijs_gui_Mask extends kijs.gui.Element {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        this._iconEl = new kijs.gui.Icon({ parent: this });
        this._textEl = new kijs.gui.Dom({cls:'kijs-mask-text'});

        this._targetElement = null;           // Zielelement (kijs.gui.Element) oder Body (HTMLElement)
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
            iconChar: { target: 'iconChar', context: this._iconEl },
            iconCls: { target: 'iconCls', context: this._iconEl },
            iconColor: { target: 'iconColor', context: this._iconEl },
            target: { target: 'target' }, // kijs.gui.Element oder body
            text: { target: 'html', context: this._textEl },
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
        return this._iconEl.iconChar === '&#xf110';
    }
    set displayWaitIcon(val) {
        if (val) {
            this.iconChar = '&#xf110';
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
    set iconChar(val) {
        this._iconEl.iconChar = val;
        if (this.isRendered) {
            this.render();
        }
    }

    get iconCls() { return this._iconEl.iconCls; }
    set iconCls(val) {
        this._iconEl.iconCls = val;
        if (this.isRendered) {
            this.render();
        }
    }

    get iconColor() { return this._iconEl.iconColor; }
    set iconColor(val) {
        this._iconEl.iconColor = val;
        if (this.isRendered) {
            this.render();
        }
    }

    // overwrite
    get isEmpty() { return this._iconEl.isEmpty; }

    /**
     * Gibt den Node zurück in dem sich die Maske befindet (parentNode)
     * @returns {HTMLElement}
     */
    get parentNode() {
        if (this._targetElement instanceof kijs.gui.Element) {
            let domEl = this._targetElement[this._targetDomProperty];

            if (domEl && domEl.isAppended) {
                return domEl.node.parentNode;

            } else {
                return null;
            }

        } else {
            return this._targetElement; // document.body
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

            this._targetElement.on('afterResize', this._onTargetElAfterResize, this);
            this._targetElement.on('changeVisibility', this._onTargetElChangeVisibility, this);
            this._targetElement.on('destruct', this._onTargetElDestruct, this);

        // Target ist der Body
        } else if (val === document.body || kijs.isEmpty(val)) {
            this._targetElement = document.body;

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
            return this._targetElement;
        }
    }


    get text() { return this._textEl.html; }
    set text(val) { this._textEl.html = val; }




    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // Overwrite
    render(superCall) {
        super.render(true);

        // Maskierung positionieren
        this._updateMaskPosition();

        // Span icon rendern (kijs.gui.Icon)
        if (!this._iconEl.isEmpty) {
            this._iconEl.renderTo(this._dom.node);
        } else {
            this._iconEl.unrender();
        }

        this._textEl.renderTo(this._dom.node);

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

        this._iconEl.unrender();
        this._textEl.unrender();
        super.unrender(true);
    }

    /**
     * Zeigt die Maskierung an
     * @returns {undefined}
     */
    show() {

        // falls das item noch nicht mit "renderTo" an einem Element angehängt wurde,
        // können wir noch nichts anzeigen. show nochmals nach renderTo ausführen.
        if (!this.parentNode) {
            this._targetElement.once('afterFirstRenderTo', this._onceTargetAfterFirstRenderTo, this);

        } else {
            this.renderTo(this.parentNode);
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
        }
    }


    // LISTENERS
    _onceTargetAfterFirstRenderTo(e) {
        this.show();
    }

    _onTargetElAfterResize(e) {
        // Maskierung positionieren
        this._updateMaskPosition();
    }

    _onTargetElChangeVisibility(e) {
        // Maskierung positionieren
        this._updateMaskPosition();

        // Sichbarkeit ändern
        this.visible = e.visible;
    }

    _onTargetElDestruct(e) {
        this.destruct();
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

        // Event-Listeners entfernen
        if (this._targetElement instanceof kijs.gui.Element) {
            this._targetElement.off(null, null, this);
        }

        // Elemente/DOM-Objekte entladen
        if (this._iconEl) {
            this._iconEl.destruct();
        }

        if (this._textEl) {
            this._textEl.destruct();
        }

        // Basisklasse entladen
        super.destruct(true);

        // Variablen (Objekte/Arrays) leeren
        this._iconEl = null;
        this._targetElement = null;
    }
};