/* global kijs, this, HTMLElement */

// --------------------------------------------------------------
// kijs.gui.Mask
// --------------------------------------------------------------
/**
 * Halbtransparente Maske, die über den Body oder ein kijs.gui.Element (target) gelegt wird und so
 * die Bedienung der dahinterliegenden Oberfläche verhindert. Optional mit Ladesymbol
 * (displayWaitIcon) und Text darunter.
 * Beim Body als target wird die Maske als natives dialog-Tag modal angezeigt. Das verhindert auch
 * die Navigation per Tastatur unter der Maske.
 * Bei anderen targets wird zuerst ein Anker-Div (0x0px) als erster Node in das target eingefügt,
 * darin liegt das div der Maske. Mit inert (Default: true) wird das target dabei nicht interaktiv
 * und nicht fokussierbar. Mit targetDomProperty kann ein Teil des Elements maskiert werden, z.B.
 * bei einem kijs.gui.Panel mit 'innerDom' nur der Inhalt.
 *
 * @example
 * const mask = new kijs.gui.Mask({ target: myPanel, targetDomProperty: 'innerDom', displayWaitIcon: true, text: 'Laden...' });
 * mask.show();
 * // ...
 * mask.destruct();
 */
kijs.gui.Mask = class kijs_gui_Mask extends kijs.gui.Element {

    // PRIVATE VARS
    // __defaultIconAnimationCls {String|null}   Standard Icon animation. Default: 'kijs-spin'
    // __defaultIconMap {String|null}   Standard IconMap. Default: 'kijs.iconMap.Fa.circle-notch'



    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        this._displayWaitIcon = false; // Lade Icon anzeigen?
        this._setInert = true; // inert setzen (Maskiertes Element ist nicht mehr interaktiv/fokusierbar)

        // Anker-Node von 0x0px mit position:relative in dem sich die Maske befindet.
        // Nur nötig, wenn das Target nicht der Body ist
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
            cls: 'kijs-mask-icon'
        });

        // Statische Standardwerte für Ladeicon
        if (kijs.gui.Mask.defaultIconMap) {
            this._iconEl.iconMap = kijs.gui.Mask.defaultIconMap;
        }
        if (kijs.gui.Mask.defaultIconAnimationCls) {
            this._iconEl.iconAnimationCls = kijs.gui.Mask.defaultIconAnimationCls;
        }



        // Ladetext
        this._textDom = new kijs.gui.Dom({
            cls: 'kijs-mask-text'
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
            displayWaitIcon: true,
            icon: { target: 'icon' },
            text: { target: 'html', context: this._textDom },
            iconChar: { target: 'iconChar', context: this._iconEl },
            iconAnimationCls: { target: 'iconAnimationCls', context: this._iconEl },
            iconCls: { target: 'iconCls', context: this._iconEl },
            iconColor: { target: 'iconColor', context: this._iconEl },
            iconMap: { target: 'iconMap', context: this._iconEl },
            target: { target: 'target' }, // kijs.gui.Element oder body
            inert: { target: 'inert' }, // Macht, dass Elemente hinter der Lademaske nicht interaktiv sind (Nicht fokusierbar)
            targetDomProperty: true
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }
    }



    // --------------------------------------------------------------
    // STATIC GETTERS / SETTERS
    // --------------------------------------------------------------
    /**
     * Standard-Animation des Ladesymbols für neue Masken. Default: 'kijs-spin'
     * @type {String|null}
     */
    static get defaultIconAnimationCls() {
        if (kijs.isDefined(kijs.gui.Mask.__defaultIconAnimationCls)) {
            return kijs.gui.Mask.__defaultIconAnimationCls;
        } else {
            return 'kijs-spin';
            //return 'kijs-pulse';
        }
    }
    static set defaultIconAnimationCls(iconAnimationCls) {
        kijs.gui.Mask.__defaultIconAnimationCls = iconAnimationCls;
    }

    /**
     * Standard-Icon des Ladesymbols für neue Masken. Default: 'kijs.iconMap.Fa.circle-notch'
     * @type {String|null}
     */
    static get defaultIconMap() {
        if (kijs.isDefined(kijs.gui.Mask.__defaultIconMap)) {
            return kijs.gui.Mask.__defaultIconMap;
        } else {
            return 'kijs.iconMap.Fa.circle-notch';
            //return 'kijs.iconMap.Fa.spinner';
        }
    }
    static set defaultIconMap(iconMap) {
        kijs.gui.Mask.__defaultIconMap = iconMap;
    }



    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    /**
     * Ladesymbol anzeigen? Default: false
     * @type {Boolean}
     */
    get displayWaitIcon() { return !!this._displayWaitIcon; }
    set displayWaitIcon(val) {
        this._displayWaitIcon = !!val;
        if (this.isRendered) {
            this.render();
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
            this._iconEl.iconAnimationCls = null;
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

    /**
     * Animations-Klasse des Ladesymbols (siehe defaultIconAnimationCls)
     * @type {String|null}
     */
    get iconAnimationCls() { return this._iconEl.iconAnimationCls; }
    set iconAnimationCls(val) { this._iconEl.iconAnimationCls = val; }

    /**
     * Zeichen des Ladesymbols
     * @type {String|Number}
     */
    get iconChar() { return this._iconEl.iconChar; }
    set iconChar(val) { this._iconEl.iconChar = val; }

    /**
     * CSS-Klasse des Ladesymbols
     * @type {String|null}
     */
    get iconCls() { return this._iconEl.iconCls; }
    set iconCls(val) { this._iconEl.iconCls = val; }

    /**
     * Farbe des Ladesymbols
     * @type {String|null}
     */
    get iconColor() { return this._iconEl.iconColor; }
    set iconColor(val) { this._iconEl.iconColor = val; }

    /**
     * Icon des Ladesymbols aus einer IconMap (siehe defaultIconMap)
     * @type {String|null}
     */
    get iconMap() { return this._iconEl.iconMap; }
    set iconMap(val) { this._iconEl.iconMap = val; }

    /**
     * Maskiertes Element beim Anzeigen nicht mehr interaktiv und fokussierbar machen (Attribut inert)?
     * Gilt nicht für den Body als target. Default: true
     * @type {Boolean}
     */
    get inert() { return this._setInert; }

    set inert(val) {
        this._setInert = !!val;
        if (this.targetElementDom) {
            this.targetElementDom.nodeAttributeSet('inert', !!val);
        }
    }

    // overwrite
    get isEmpty() { return this._iconEl.isEmpty; }

    /**
     * Element, das überdeckt wird. Der Setter akzeptiert ein kijs.gui.Element, document.body oder
     * leer (= Body). Ein kijs.gui.ViewPort gilt auch als Body. Der Getter gibt beim Body null zurück.
     * Bei Grössenänderungen und Sichtbarkeitswechsel des Elements wird die Maske angepasst, beim
     * Zerstören des Elements wird sie auch zerstört.
     * @type {kijs.gui.Element|null}
     */
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

    /**
     * Name der Dom-Eigenschaft des targets, die überdeckt wird, z.B. 'innerDom'. Gilt nicht für den Body. Default: 'dom'
     * @type {String}
     */
    get targetDomProperty() { return this._targetDomProperty; };
    set targetDomProperty(val) { this._targetDomProperty = val; };

    /**
     * Überdecktes kijs.gui.Dom (target[targetDomProperty]) oder null beim Body
     * @type {kijs.gui.Dom|null}
     */
    get targetElementDom() {
        return this._targetElement instanceof kijs.gui.Element ? this._targetElement[this._targetDomProperty] : null;
    }

    /**
     * Text unter dem Ladesymbol
     * @type {String}
     */
    get text() { return this._textDom.html; }
    set text(val) {
        this._textDom.html = val;

        // Ist die Maske bereits angezeigt, neu rendern, damit der Text erscheint.
        // Sonst wird er beim Anzeigen gerendert.
        if (this.isRendered && !this._textDom.isRendered) {
            this.render();
        }
    }



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

        // Grösse der Maske an target anpassen
        this._updateMaskSize();

        // centerDom rendern
        this._maskCenterDom.renderTo(this._dom.node);

        // Span icon rendern (kijs.gui.Icon)
        if (this._displayWaitIcon && !this._iconEl.isEmpty) {
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

    /**
     * Zeigt die Maskierung an
     * @returns {undefined}
     */
    show() {
        if (this._targetElement instanceof kijs.gui.Element) {
            let nde = this.targetElementDom?.node;

            if (nde) {
                if (nde.hasChildNodes()) {
                    this.renderTo(nde, nde.firstChild);
                } else {
                    this.renderTo(nde);
                }

                if (this._setInert) {
                    this.targetElementDom.nodeAttributeSet('inert', true);
                }
            }

        } else {
            this.renderTo(document.body);
            this._dom.node.showModal();
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

        // inert entfernen
        if (this.targetElementDom) {
            this.targetElementDom.nodeAttributeSet('inert', false);
        }

        super.unrender(true);
    }


    // PROTECTED
    /**
     * Passt Position, Grösse und Eckenradius der Maske an targetElementDom an (Rahmen und Padding
     * des targets werden berücksichtigt). Beim Body passiert nichts.
     * @returns {undefined}
     */
    _updateMaskSize() {
        // nur nötig, wenn Target != Body
        if (this._targetElement instanceof kijs.gui.Element) {
            let style;

            let top = 0;
            let left = 0;
            let height = this.targetElementDom.height;
            let width = this.targetElementDom.width;

            // Weitere Eigenschaften
            // Bereits gerendert: direkt aus CSS nehmen
            if (this.targetElementDom?.node) {
                style = window.getComputedStyle(this.targetElementDom.node);
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
