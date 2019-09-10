/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.ContainerStack
// --------------------------------------------------------------
/**
 * Container Element, dass untergeordnete Elemente beinhalten kann.
 * Es wird jeweils nur ein Element angezeigt, die Elemente können
 * animiert gewechselt werden.
 * Das Element besteht aus der innerNode des Containers, in dem sich
 * pro Element eine DOM-Node befindet, in der sich das Element befindet.
 *
 * KLASSENHIERARCHIE
 * kijs.gui.Element
 *  kijs.gui.BoxElement
 *   kijs.gui.Container
 *    kijs.gui.ContainerStack
 *
 * CONFIG-Parameter (es gelten auch die Config-Parameter der Basisklassen)
 * ----------------
 * defaultAnimation    String [optional]    Typ der Animation. Gültige Werte:
 *                                              none:           Keine Animation (default)
 *                                              fade:           Überblenden
 *                                              slideLeft:      Ausfahren nach Links
 *                                              slideRight:     Ausfahren nach Rechts
 *                                              slideTop:       Ausfahren nach oben
 *                                              slideBottom:    Ausfahren nach unten
 *
 * defaultDuration     Integer [optional]   Dauer der Animation in Milisekunden (default: 1000).
 * activeEl            Mixed [optional]     Element, das als erstes angezeigt wird (default: 0 = erstes Element)
 *                                              String = Name des Elements
 *                                              Int = Index des Elements
 *                                              Object = Verweis auf das Element
 *
 *
 * FUNKTIONEN (es gelten auch die Funktionen der Basisklassen)
 * ----------
 * activateAnimated                         Zeigt ein Panel animiert an
 *  Args: element   Mixed                   Element, das als erstes angezeigt wird.
 *                                              String = Name des Elements
 *                                              Int = Index des Elements
 *                                              Object = Verweis auf das Element
 *        animation String [optional]       Art der Animation
 *        duration  Integer [optional]      Dauer der Animation in Milisekunden
 *

 * EIGENSCHAFTEN (es gelten auch die Eigenschaften der Basisklassen)
 * -------------
 *  activeEl         Object                 Gibt das zurzeit aktive Element zurück oder setzt es
 *  defaultAnimation String                 Gibt die Standardanimation zurück oder setzt sie
 *  defaultDuration  Integer                Gibt die Standarddauer zurück oder setzt sie
 *
 *
 * EVENTS
 * ----------

 *
 *
 */
kijs.gui.ContainerStack = class kijs_gui_ContainerStack extends kijs.gui.Container {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        this._activeElOnConstruct = null;
        this._animationTypes = [
            'none',
            'fade',
            'slideLeft',   // gegen links fahren
            'slideRight',  // gegen rechts fahren
            'slideTop',    // gegen oben fahren
            'slideBottom'  // gegen unten fahren
        ];
        this._afterAnimationDefer = null;
        this._defaultAnimation = 'none';
        this._defaultDuration = 500;
        this._domElements = [];
        this._topZIndex = 1;

        // CSS
        this._dom.clsAdd('kijs-containerstack');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            activeEl: 0
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            defaultAnimation: { target: 'defaultAnimation' },
            defaultDuration: { target: 'defaultDuration' },
            activeEl: { target: '_activeElOnConstruct' }
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }

        // Default-Element aktivieren, falls elements vorhanden sind.
        if (this._elements.length > 0 && this._activeElOnConstruct !== null) {
            this.activateAnimated(this._activeElOnConstruct, 'none');
        }
    }


    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------

    get activeEl() { return this._getTopElement(); }
    set activeEl(val) { this.activateAnimated(val); }

    get defaultAnimation() { return this._defaultAnimation; }
    set defaultAnimation(val) {
        if (!kijs.Array.contains(this._animationTypes, val)) {
            throw new kijs.Error(`config "defaultAnimation" is not valid.`);
        }
        this._defaultAnimation = val;
    }

    get defaultDuration() { return this._defaultDuration; }
    set defaultDuration(val) { this._defaultDuration = val; };

    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------

    /**
     * Fügt ein neues Element hinzu.
     * @param {Array|Object} elements
     * @param {Integer|null} index
     * @returns {undefined}
     */
    add(elements, index=null) {
        super.add(elements, index);

        // falls Element in Hintergrund kommt,
        // wird es ausgeblendet.
        this._setSubElementsVisible();
    }

    /**
     * Aktiviert
     * @param {Integer|String|Object} el
     * @param {String} animation
     * @param {Integer} duration Zeit in Milisekunden
     * @returns {undefined}
     */
    activateAnimated(el, animation=null, duration=null) {
        animation = animation || this._defaultAnimation;
        duration = duration || this._defaultDuration;
        let activeEl = this.activeEl;

        if (!kijs.Array.contains(this._animationTypes, animation)) {
            throw new kijs.Error(`animation type not valid.`);
        }

        // by index
        if (kijs.isInteger(el)) {
            el = this._elements[el];

        // by name
        } else if (kijs.isString(el)) {
            el = this.getElementsByName(el, 0, true).shift();
        }

        // Prüfen, ob element in den elements ist ist.
        if (!el || !kijs.Array.contains(this._elements, el)) {
            throw new kijs.Error(`element for animated activation not found.`);
        }

        // falls das neue das alte ist, nichts tun.
        if (activeEl === el) {
            return;
        }

        // Dauer ist 0, wenn ohne Animation
        duration = animation === 'none' ? 0 : duration;

        // DOM-Container-Element abfragen oder erstellen
        let dom = this._getDomOfElement(el);

        // alle animation class entfernen
        kijs.Array.each(this._animationTypes, function(at) {
            dom.clsRemove([
                'kijs-animation-' + at.toLowerCase(),
                'kijs-animation-' + at.toLowerCase() + '-out'
            ]);
        }, this);

        // animation class hinzufügen
        dom.clsAdd('kijs-animation-' + animation.toLowerCase());
        dom.style.animationDuration = duration + 'ms';

        // Element ganz nach oben
        this._topZIndex++;
        dom.style.zIndex = this._topZIndex;

        // element anzeigen
        el.visible = true;

        // beim aktuellen element die 'animation-out' Klasse hinzufügen
        if (activeEl) {
            let activeDom = this._getDomOfElement(activeEl);

            // alle animation class entfernen
            kijs.Array.each(this._animationTypes, function(at) {
                activeDom.clsRemove([
                    'kijs-animation-' + at.toLowerCase(),
                    'kijs-animation-' + at.toLowerCase() + '-out'
                ]);
            }, this);

            // 'out' Klasse hinzufügen
            activeDom.clsAdd('kijs-animation-' + animation.toLowerCase() + '-out');
            activeDom.style.animationDuration = duration+ 'ms';
        }

        // nach der Animation die Elemente ausblenden
        if (this._afterAnimationDefer) {
            window.clearTimeout(this._afterAnimationDefer);
        }
        this._afterAnimationDefer = kijs.defer(function() {
            this._afterAnimationDefer = null;
            this._setSubElementsVisible();
            this._removeAllAnimationClasses();
        }, duration, this);


        // Falls der DOM gemacht ist, wird neu gerendert.
        if (this._innerDom.node) {
            this.render();
        }
    }

    // Overwrite
    remove(elements) {
        if (!kijs.isArray(elements)) {
            elements = [elements];
        }

        // Parent
        super.remove(elements);

        // Element aus dem DOM-Stack entfernen
        kijs.Array.each(elements, function(element) {
            kijs.Array.removeIf(this._domElements, function(domEl) {
                if (domEl.element === element) {
                    domEl.dom.unrender();
                    domEl.dom.destruct();
                    return true;
                }
            }, this);
        }, this);

        // Top-Element sichtbar machen
        this._setSubElementsVisible();
    }

    // Overwrite
    removeAll(preventRender) {

        // Parent
        super.removeAll(preventRender);

        // DOM-Elemente entfernen
        kijs.Array.each(this._domElements, function(domEl) {
            domEl.dom.unrender();
            domEl.dom.destruct();
        }, this);
        kijs.Array.clear(this._domElements);

    }

    // Overwrite
    render(superCall) {
        // Renderer vom Container überspringen, damit
        // elements nicht in innerDom gerendert werden.
        kijs.gui.Element.prototype.render.call(this, arguments);

        // innerDOM rendern
        this._innerDom.renderTo(this._dom.node);

        // die Elemente in die DOM-Elemente rendern
        kijs.Array.each(this._elements, function(element) {
            let dom = this._getDomOfElement(element);
            dom.renderTo(this._innerDom.node);
            element.renderTo(dom.node);
        }, this);

        // Event afterRender auslösen
        if (!superCall) {
            this.raiseEvent('afterRender');
        }
    }


    // PROTECTED
    /**
     * Gibt das DOM-Element zurück, das ein Element kapselt
     * @param {Object} element
     * @returns {kijs.gui.Dom}
     */
    _getDomOfElement(element) {
        for (let i=0; i<this._domElements.length; i++) {
            if (this._domElements[i].element === element) {
                return this._domElements[i].dom;
            }
        }

        // element nicht gefunden, erstellen
        let newDom = new kijs.gui.Dom({
            cls: ['kijs-containerstack-element'],
            style: {
                zIndex: 0
            }
        });

        this._domElements.push({element: element, dom: newDom});
        return newDom;
    }

    /**
     * Liefert das Element mit dem höchsten z-index (=sichtbares element)
     * @returns {element}
     */
    _getTopElement() {
        let topIndex = 0, topElement = null;
        kijs.Array.each(this._elements, function(element) {
            let domEl = this._getDomOfElement(element);
            if (kijs.isNumeric(domEl.style.zIndex) && parseInt(domEl.style.zIndex) >= topIndex) {
                topIndex = parseInt(domEl.style.zIndex);
                topElement = element;
            }
        }, this);
        return topElement;
    }

    /**
     * Setzt die Sichtbarkeit aller unterelemente auf false,
     * ausser vom top-element.
     * @returns {undefined}
     */
    _setSubElementsVisible() {
        let topEl = this._getTopElement();
        kijs.Array.each(this._elements, function(element) {
            if (element !== topEl && kijs.isBoolean(element.visible)) {
                element.visible = false;

            } else if (element === topEl && kijs.isBoolean(element.visible)) {
                element.visible = true;
            }
        }, this);
    }

    /**
     * Entfernt alle CSS Animationen
     * @returns {undefined}
     */
    _removeAllAnimationClasses() {
        kijs.Array.each(this._elements, function(element) {
            kijs.Array.each(this._animationTypes, function(at) {
                this._getDomOfElement(element).clsRemove([
                    'kijs-animation-' + at.toLowerCase(),
                    'kijs-animation-' + at.toLowerCase() + '-out'
                ]);
            }, this);
        }, this);
    }


    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------

    destruct(superCall) {
        if (!superCall) {
            // unrendern
            this.unrender(superCall);

            // Event auslösen.
            this.raiseEvent('destruct');
        }

        // Elemente/DOM-Objekte entladen
        kijs.Array.each(this._innerDomStack, function(dom) {
           dom.destruct();
        }, this);

        // Variablen (Objekte/Arrays) leeren
        this._innerDomStack = null;

        // Basisklasse entladen
        super.destruct(true);
    }

};