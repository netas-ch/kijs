/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.container.Stack
// --------------------------------------------------------------
/**
 * Container Element, dass untergeordnete Elemente beinhalten kann.
 * Es wird jeweils nur ein Element angezeigt. 
 * Die Elemente können mit den currentEl, currentIndex und currentName
 * gewechselt werden.
 * Mit der Funktion setCurrentAnimated() können sie auch animiert gewechselt werden.
 *
 * KLASSENHIERARCHIE
 * kijs.gui.Element
 *  kijs.gui.Container
 *   kijs.gui.container.Stack
 *
 * CONFIG-Parameter (es gelten auch die Config-Parameter der Basisklassen)
 * ----------------
 * defaultAnimation    String [optional]    Typ der Animation. Gültige Werte:
 *                                              none:           Keine Animation
 *                                              fade:           Überblenden (default)
 *                                              slideLeft:      Ausfahren nach Links
 *                                              slideRight:     Ausfahren nach Rechts
 *                                              slideTop:       Ausfahren nach oben
 *                                              slideBottom:    Ausfahren nach unten
 *
 * defaultDuration     Integer [optional]   Dauer der Animation in Milisekunden (default: 1000).
 * 
 * currentEl           kijs.gui.Element [optional] Element, das als erstes angezeigt wird
 * currentIndex        Integer [optional]          Element, das als erstes angezeigt wird (default: 0)
 * currentName         String [optional]           Element, das als erstes angezeigt wird
 * 
 *
 * FUNKTIONEN (es gelten auch die Funktionen der Basisklassen)
 * ----------
 * setCurrentAnimated                       Wechselt das Element mit einer Animation
 *  Args: element   Mixed                   Element, das angezeigt werden soll.
 *                                              String = Name des Elements
 *                                              Int = Index des Elements
 *                                              Object = Verweis auf das Element
 *        animation String [optional]       Art der Animation
 *        duration  Integer [optional]      Dauer der Animation in Milisekunden
 *
 *
 * EIGENSCHAFTEN (es gelten auch die Eigenschaften der Basisklassen)
 * -------------
 *  currentEl           kijs.gui.Element    Gibt das zurzeit aktive Element zurück oder setzt es
 *  currentIndex        Integer [optional]  Gibt das zurzeit aktive Element zurück oder setzt es
 *  currentName         String [optional]   Gibt das zurzeit aktive Element zurück oder setzt es
 *  defaultAnimation String                 Gibt die Standardanimation zurück oder setzt sie
 *  defaultDuration  Integer                Gibt die Standarddauer zurück oder setzt sie
 *
 *
 * EVENTS
 * ----------
 *
 */
kijs.gui.container.Stack = class kijs_gui_container_Stack extends kijs.gui.Container {
    
    
    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);
        
        this._afterAnimationDefer = null;
        this._animationTypes = [
            'none',
            'fade',
            'slideLeft',   // gegen links fahren
            'slideRight',  // gegen rechts fahren
            'slideTop',    // gegen oben fahren
            'slideBottom'  // gegen unten fahren
        ];
        this._currentIndex = 0;     // Index des aktuellen (sichtbaren) Elements
        this._defaultAnimation = 'fade';
        this._defaultDuration = 500;
        this._topZIndex = 1;
        
        this._dom.clsRemove('kijs-container');
        this._dom.clsAdd('kijs-container-stack');
        
        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });
        
        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            currentEl:    { prio: 1001, target: 'currentEl' },
            currentIndex: { prio: 1001, target: 'currentIndex' },
            currentName:  { prio: 1001, target: 'currentName' }
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
    // Aktueller Container ermitteln/setzen
    get currentEl() { return this._elements[this._currentIndex]; }
    set currentEl(val) {
        let index = this._getElIndex(val);
        
        if (index === null) {
            throw new kijs.Error(`currentEl does not exist in elements.`);
        } else {
            this.currentIndex = index;
        }
    }
    
    // Aktueller Container ermitteln/setzen via Index
    get currentIndex() { return this._currentIndex; }
    set currentIndex(val) {
        if (!this._elements[val]) {
            throw new kijs.Error(`currentIndex does not exist in elements.`);
        }
        
        this._currentIndex = val;
        this._updateElementsVisibility();
        // und neu rendern
        if (this._elements[val].isRendered) {
            this._elements[val].render();
        }
    }
    
    // Aktueller Container ermitteln/setzen via Name
    get currentName() { return this._elements[this._currentIndex].name; }
    set currentName(val) {
        let elements = this.getElementsByName(val, 0, true);
        if (elements.length === 0) {
            throw new kijs.Error(`currentName does not exist in elements.`);
        } else {
            this.currentEl = elements[0];
        }
    }
    
    
    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // overwrite
    add(elements, index=null) {
        super.add(elements, index);
        this._updateElementsVisibility();
    }
    
    // overwrite
    remove(elements, preventRender=false, destruct=false) {
        super.remove(elements, preventRender, destruct);
        this._updateElementsVisibility();
    }
    
    // overwrite
    render(superCall) {
        this._updateElementsVisibility();
        super.render(true);
    }
    
    /**
     * Aktuelles Element wechseln und dabei eine Animation abspeielen
     * @param {Integer|String|kijs.gui.Element} el
     * @param {String} animation
     * @param {Integer} duration
     * @returns {Promise}
     */
    setCurrentAnimated(el, animation=null, duration=null) {
        return new Promise((resolve, reject) => {
            let currentEl = this._elements[this._currentIndex];

            // Argumente
            if (!animation) {
                animation = this._defaultAnimation;
            }
            if (!duration) {
                duration = this._defaultDuration;
            }
            if (animation === 'none') {
                duration = 0;
            }

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

            if (!el || !kijs.Array.contains(this._elements, el)) {
                throw new kijs.Error(`el does not exist in elements.`);
            }

            // Wenn das Element bereits aktuell ist, ist keine Animation nötig
            if (currentEl === el) {
                return;
            }

            // Bei Dauer = 0 ist keine Animation nötig
            if (duration === 0) {
                this.currentEl = el;
                return;
            }

            // Falls bereits eine Animation läuft: Abbrechen
            this._cleanUp();
            if (this._afterAnimationDefer) {
                window.clearTimeout(this._afterAnimationDefer);
            }

            // Altes Element für Animation vorbereiten
            currentEl.dom.clsAdd('kijs-animation-' + animation.toLowerCase() + '-out');
            currentEl.style.animationDuration = duration+ 'ms';

            // Neues Element für Animation vorbereiten
            el.dom.clsAdd('kijs-animation-' + animation.toLowerCase());
            el.style.animationDuration = duration + 'ms';
            el.style.zIndex = 1;
            el.visible = true;

            this._currentIndex = this._getElIndex(el);

            // Animation abwarten
            this._afterAnimationDefer = kijs.defer(function() {
                this._afterAnimationDefer = null;

                // Aufräumen und Sichtbarkeit aktualisieren
                this._updateElementsVisibility();
                this._cleanUp();

                // und neu rendern
                if (el.isRendered) {
                    el.render();
                }
                
                // promise ausführen
                resolve({
                    oldElement: currentEl,
                    element: el
                });
                
            }, duration, this);
        });
    }
    
    
    // PROTECTED
    // Entfernt CSS-Klassen, zIndex und animationDuration der Animation
    _cleanUp() {
        const animationClasses = [
            'kijs-animation-fade',
            'kijs-animation-fade-out',
            'kijs-animation-slideleft',
            'kijs-animation-slideleft-out',
            'kijs-animation-slideright',
            'kijs-animation-slideright-out',
            'kijs-animation-slidetop',
            'kijs-animation-slidetop-out',
            'kijs-animation-slidebottom',
            'kijs-animation-slidebottom-out'
        ];
        
        for (let i=0; i<this._elements.length; i++) {
            // Animations-Klassen entfernen
            this._elements[i].dom.clsRemove(animationClasses);
            
            // zIndex zurücketzen
            this._elements[i].style.zIndex = 0;
            this._elements[i].style.animationDuration = '0s';
        }
    }
    
    // Ermittelt den Index eines 
    _getElIndex(el) {
        let index = null;
        
        for (let i=0; i<this._elements.length; i++) {
            if (this._elements[i] === el) {
                index = i;
                break;
            }
        }
        
        return index;
    }
    
    // nur das currentEl ist sichtbar, alle anderen werden ausgeblendet
    _updateElementsVisibility() {
        for (let i=0; i<this._elements.length; i++) {
            this._elements[i].visible = i === this._currentIndex;
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
        
        // Variablen (Objekte/Arrays) leeren
        this._animationTypes = null;
        
        // Basisklasse entladen
        super.destruct(true);
    }
};
