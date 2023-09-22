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
 * animation           String [optional]     Standard Animation. Gültige Werte:
 *                                              none:           Keine Animation
 *                                              fade:           Überblenden (default)
 *                                              slideLeft:      Ausfahren nach Links
 *                                              slideRight:     Ausfahren nach Rechts
 *                                              slideTop:       Ausfahren nach oben
 *                                              slideBottom:    Ausfahren nach unten
 *
 * animationDuration   Integer [optional]   Dauer der Animation in Milisekunden (default: 1000).
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
 *  animation           String              Gibt die Standardanimation zurück oder setzt sie
 *  animationDuration   Integer             Gibt die Standarddauer zurück oder setzt sie
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
    // overwrite
    constructor(config={}) {
        super(false);
        
        this._afterAnimationDeferId = null;
        this._animation = 'fade';
        this._animationDuration = 500;

        this._currentEl = null;     // Aktuelles (sichtbaren) Element
        this._elHistory = [];       // Auflistung der Elemente, die als letztes
                                    // angeklickt wurden.
                                    // Mit Hilfe dieser Auflistung kann beim 
                                    // Löschen eines Elements das vorher 
                                    // selektierte wieder ausgewählt werden.
        
        this._dom.clsRemove('kijs-container');
        this._dom.clsAdd('kijs-container-stack');
        
        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            currentIndex: 0
        });
        
        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            currentEl:    { prio: 1001, target: 'currentEl' },
            currentIndex: { prio: 1001, target: 'currentIndex' },
            currentName:  { prio: 1001, target: 'currentName' },
            animation:    { target: 'animation' },
            animationDuration: true
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
    get animation() { return this._animation; }
    set animation(val) {
        if (this._validateAnimation(val)) {
            this._animation = val;
        } else {
            throw new kijs.Error(`unknown animation.`);
        }
    }
    
    get animationDuration() { return this._animationDuration; }
    set animationDuration(val) {
        this._animationDuration = val;
    }
    
    // Aktueller Container ermitteln/setzen
    get currentEl() { return this._currentEl; }
    set currentEl(val) {
        if (!this.hasChild(val)) {
            throw new kijs.Error(`currentEl does not exist in elements.`);
        }
        
        this._setCurrent(val);
        
        this._updateElementsVisibility();
        
        // und neu rendern
        if (val.isRendered) {
           val.render();
        }
    }
    
    // Aktueller Container ermitteln/setzen via Index
    get currentIndex() { return this._getElIndex(this._currentEl); }
    set currentIndex(val) {
        if (this._elements[val]) {
            this.currentEl = this._elements[val];
        }
    }
    
    // Aktueller Container ermitteln/setzen via Name
    get currentName() { 
        if (this._currentEl) {
            return this._currentEl.name;
        } else {
            return null;
        }
    }
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
    add(elements, index=null, preventRender=false) {
        super.add(elements, index, preventRender);
    }
    
    // overwrite
    remove(elements, options={}, superCall) {
        if (!superCall) {
            if (!kijs.isArray(elements)) {
                elements = [elements];
            }
            
            if (!options.preventEvents) {
                // beforeRemove Event. Bei Rückgabe=false -> abbrechen
                if (this.raiseEvent('beforeRemove', {removeElements: elements}) === false) {
                    return;
                }
            }
        }
        
        super.remove(elements, options, true);
        
        // Elemente auch aus elHistory entfernen
        kijs.Array.each(elements, function(el) {
            this._elHistoryRemove(el);
        }, this);
        
        // Falls das aktuelle Element gelöscht wurde, das vorherige aktivieren
        if (kijs.Array.contains(elements, this._currentEl)) {
            if (this._elements.length) {
                // Wenn noch eines in der History ist: dieses nehmen
                if (this._elHistory.length) {
                    this.currentEl = this._elHistory[this._elHistory.length-1];
                    
                // sonst das Element mit Index 0 nehmen
                } else {
                    this.currentIndex = 0;
                }
            } else {
                // es gibt keine Elemente
                this._currentEl = null;
            }
        }
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
            let oldEl = this._currentEl;

            // Event ausführen
            if (this._currentEl.raiseEvent('beforeChange', {element: this._currentEl}) === false) {
                return;
            }
            
            // Argumente
            if (!animation) {
                animation = this._animation;
            }
            if (!duration) {
                duration = this._animationDuration;
            }
            if (animation === 'none') {
                duration = 0;
            }

            if (!this._validateAnimation(animation)) {
                throw new kijs.Error(`unknown animation.`);
            }

            // Element aus Index, Name oder Element ermitteln
            el = this._getElFromIndexNameEl(el);

            // Wenn das Element bereits aktuell ist, ist keine Animation nötig
            if (oldEl === el) {
                return;
            }
            
            // Wenn noch kein Element aktiv ist oder bei Dauer = 0 ist keine 
            // Animation nötig
            if (!oldEl || duration === 0) {
                this.currentEl = el;
                return;
            }

            // Falls bereits eine Animation läuft: Abbrechen
            this._cleanUp();
            if (this._afterAnimationDeferId) {
                window.clearTimeout(this._afterAnimationDeferId);
                this._afterAnimationDeferId = null;
            }
            
            // Altes Element für Animation vorbereiten
            oldEl.dom.clsAdd(this._getAnimationCls(animation, 'out'));
            oldEl.style.animationDuration = duration+ 'ms';

            // Neues Element für Animation vorbereiten
            el.dom.clsAdd(this._getAnimationCls(animation, 'in'));
            el.style.animationDuration = duration + 'ms';
            el.style.zIndex = 1;
            el.visible = true;

            // Das Change Event kommt sofort. Das Promise dann erst nach der Animation
            this._setCurrent(el);

            // Animation abwarten
            this._afterAnimationDeferId = kijs.defer(function() {
                this._afterAnimationDeferId = null;

                // Aufräumen und Sichtbarkeit aktualisieren
                this._updateElementsVisibility();
                this._cleanUp();

                // und neu rendern
                if (el.isRendered) {
                    el.render();
                }
                
                // promise ausführen
                resolve({
                    currentEl: el,
                    oldEl: oldEl
                });
                
            }, duration, this);
        });
    }
    
    // overwrite
    unrender(superCall) {
        // timer abbrechen
        if (this._afterAnimationDeferId) {
            window.clearTimeout(this._afterAnimationDeferId);
            this._afterAnimationDeferId = null;
        }
        
        // Event auslösen.
        if (!superCall) {
            this.raiseEvent('unrender');
        }
        
        super.unrender(true);
    }
    
    
    // PROTECTED
    // Entfernt CSS-Klassen, zIndex und animationDuration der Animation
    _cleanUp() {
        const animationClasses = [
            'kijs-fade-in',
            'kijs-slide-in-top',
            'kijs-slide-in-right',
            'kijs-slide-in-bottom',
            'kijs-slide-in-left',
            'kijs-fade-out',
            'kijs-slide-out-top',
            'kijs-slide-out-right',
            'kijs-slide-out-bottom',
            'kijs-slide-out-left'
        ];
        
        for (let i=0; i<this._elements.length; i++) {
            // Animations-Klassen entfernen
            this._elements[i].dom.clsRemove(animationClasses);
            
            // zIndex zurücketzen
            this._elements[i].style.zIndex = 0;
            this._elements[i].style.animationDuration = '0s';
        }
    }
    
    // Fügt einen neues Element zur Element History hinzu
    _elHistoryAdd(el) {
        // Falls das element bereits im Array ist: entfernen
        this._elHistory = kijs.Array.remove(this._elHistory, el);
        
        // Neues Element am Ende anfügen
        this._elHistory.push(el);
    }
    
    // Entfernt ein Element aus der Element History.
    _elHistoryRemove(el) {
        this._elHistory = kijs.Array.remove(this._elHistory, el);
    }
    
    _getAnimationCls(animation, dir) {
        let ret = null;
        
        switch (animation) {
            case 'none':        ret = '';                           break;
            case 'fade':        ret = `kijs-fade-${dir}`;            break;
            case 'slideTop':    ret = `kijs-slide-${dir}-top`;       break;
            case 'slideRight':  ret = `kijs-slide-${dir}-right`;     break;
            case 'slideBottom': ret = `kijs-slide-${dir}-bottom`;    break;
            case 'slideLeft':   ret = `kijs-slide-${dir}-left`;      break;
        }
        
        return ret;
    }
    
    // Gibt ein Element anhand eines Index, eines Namens oder einem Element zurück
    _getElFromIndexNameEl(el) {
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
        
        return el;
    }
    
    // Ermittelt den Index eines Elements
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
    
    // Setzt das aktuelle Element und wirft das change-Event
    _setCurrent(element) {
        if (element !== this._currentEl) {
            let oldEl = this._currentEl;
            
            this._elHistoryAdd(element);
            this._currentEl = element;
            if (this.isRendered) {
                this.raiseEvent('change', {currentEl: element, oldEl: oldEl});
            }
        }
    }
    
    // nur das currentEl ist sichtbar, alle anderen werden ausgeblendet
    _updateElementsVisibility() {
        // Falls es noch kein aktuelles Element gibt
        if (!this._currentEl) {
            if (this._elements.length) {
                // Wenn noch eines in der History ist: dieses nehmen
                if (this._elHistory.length) {
                    this.currentEl = this._elHistory[this._elHistory.length-1];
                // sonst das Element mit Index 0 nehmen
                } else {
                    this.currentIndex = 0;
                }
            } else {
                // es gibt keine Elemente
                this._currentEl = null;
            }
        }
        
        for (let i=0; i<this._elements.length; i++) {
            this._elements[i].visible = this._elements[i] === this._currentEl;
        }
    }
    
    // Überprüft, ob eine animation gültig ist
    _validateAnimation(animation) {
        return this._getAnimationCls(animation, 'in') !== null;
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
        
        // Variablen (Objekte/Arrays) leeren
        this._currentEl = null;
        
        // Basisklasse entladen
        super.destruct(true);
    }
    
};
