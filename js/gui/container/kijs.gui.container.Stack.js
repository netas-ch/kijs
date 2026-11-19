/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.container.Stack
// --------------------------------------------------------------
/**
 * Container, der jeweils nur eines seiner Elemente anzeigt. Das angezeigte Element wird mit
 * currentEl, currentIndex oder currentName gewechselt, mit setCurrentAnimated() auch animiert.
 * Wird ein Element entfernt, wird das zuvor angezeigte wieder aktiviert (History).
 *
 * @example
 * const stack = new kijs.gui.container.Stack({
 *     animation: 'slideLeft',
 *     elements: [
 *         { xtype: 'kijs.gui.Element', name: 'liste', html: 'Liste' },
 *         { xtype: 'kijs.gui.Element', name: 'detail', html: 'Detail' }
 *     ]
 * });
 * stack.setCurrentAnimated('detail');
 *
 * @fires beforeChange  Vor dem Wechsel mit setCurrentAnimated(). Rückgabe false bricht ab. e: newEl, oldEl
 * @fires change  Nach dem Wechsel des aktuellen Elements (nur wenn gerendert). e: currentEl, oldEl
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

        this._currentEl = null;     // Aktuelles (sichtbares) Element
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
    /**
     * Standard-Animation beim Wechsel: 'none', 'fade', 'slideTop', 'slideRight', 'slideBottom' oder
     * 'slideLeft'. Andere Werte werfen einen kijs.Error. Default: 'fade'
     * @type {String}
     */
    get animation() { return this._animation; }
    set animation(val) {
        if (this._getAnimationCls(val, 'in') === null) {
            throw new kijs.Error(`unknown animation.`);
        }

        this._animation = val;
    }
    
    /**
     * Standard-Dauer der Animation in ms. Default: 500
     * @type {Number}
     */
    get animationDuration() { return this._animationDuration; }
    set animationDuration(val) {
        this._animationDuration = val;
    }
    
    /**
     * Aktuell angezeigtes Element. Der Setter wechselt ohne Animation und wirft einen kijs.Error, wenn
     * das Element nicht enthalten ist.
     * @type {kijs.gui.Element|null}
     */
    get currentEl() { return this._currentEl; }
    set currentEl(val) {
        if (!this.hasChild(val)) {
            throw new kijs.Error(`currentEl does not exist in elements.`);
        }

        // Aktuelles Element setzen, history aktualisieren und change-event auslösen.
        // Das Change Event kommt sofort. Das Promise dann erst nach der Animation
        if (this._setCurrent(val)) {
            this._updateElementsVisibility();
        
            // Container evtl. neu rendern
            if (val.isRendered) {
               val.render();
            }
        }
    }
    
    /**
     * Index des aktuellen Elements. Ein nicht vorhandener Index wird ignoriert. Default: 0
     * @type {Number|null}
     */
    get currentIndex() { return this._getElIndex(this._currentEl); }
    set currentIndex(val) {
        if (this._elements[val]) {
            this.currentEl = this._elements[val];
        }
    }
    
    /**
     * Name des aktuellen Elements. Der Setter wirft einen kijs.Error, wenn es keines mit diesem Namen gibt.
     * @type {String|null}
     */
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
    add(elements, index=null, options={}) {
        super.add(elements, index, options);
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

        // Elemente aus elHistory entfernen
        kijs.Array.removeMultiple(this._elHistory, elements);

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
        
        super.remove(elements, options, true);
    }
    
    // overwrite
    render(superCall) {
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

        this._updateElementsVisibility();
        super.render(true);
    }
    
    /**
     * Aktuelles Element wechseln und dabei eine Animation abspielen. change wird sofort ausgelöst, das
     * Promise nach der Animation erfüllt. Ist das Element schon aktuell, ist noch keines aktiv, ist die
     * Dauer 0 oder bricht beforeChange ab, wird es sofort erfüllt (bei einem Abbruch mit dem
     * unveränderten Element als currentEl).
     * @param {Integer|String|kijs.gui.Element} el  Index, Name oder Element (sonst kijs.Error)
     * @param {String|null} [animation=null]  null = animation
     * @param {Integer|null} [duration=null]  Dauer in ms. null = animationDuration
     * @returns {Promise}  e: currentEl, oldEl
     */
    setCurrentAnimated(el, animation=null, duration=null) {
        return new Promise((resolve, reject) => {
            let oldEl = this._currentEl;
            
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

            if (this._getAnimationCls(animation, 'in') === null) {
                throw new kijs.Error(`unknown animation.`);
            }

            // Element aus Index, Name oder Element ermitteln
            el = this._getElFromIndexNameEl(el);

            // Wenn kein Element oder das Element bereits aktuell ist,
            // nichts tun
            if (kijs.isEmpty(el) || oldEl === el) {
                resolve({ currentEl: oldEl, oldEl: oldEl });
                return;
            }

            // beforeChange Event ausführen
            if (this.raiseEvent('beforeChange', {newEl: el, oldEl: this._currentEl}) === false) {
                resolve({ currentEl: oldEl, oldEl: oldEl });
                return;
            }

            // Wenn noch kein Element aktiv ist oder bei Dauer = 0 ist keine 
            // Animation nötig
            if (!oldEl || duration === 0) {
                this.currentEl = el;
                resolve({ currentEl: el, oldEl: oldEl });
                return;
            }

            // Falls bereits eine Animation läuft: Abbrechen
            if (this._afterAnimationDeferId) {
                window.clearTimeout(this._afterAnimationDeferId);
                this._afterAnimationDeferId = null;
                this._cleanUp();
            }
            
            // Altes Element für Animation vorbereiten
            oldEl.dom.clsAdd(this._getAnimationCls(animation, 'out'));
            oldEl.style.animationDuration = duration+ 'ms';

            // Neues Element für Animation vorbereiten
            el.dom.clsAdd(this._getAnimationCls(animation, 'in'));
            el.style.animationDuration = duration + 'ms';
            el.style.zIndex = 1;
            el.visible = true;

            // Aktuelles Element setzen, history aktualisieren und change-event auslösen.
            // Das Change Event kommt sofort. Das Promise dann erst nach der Animation
            this._setCurrent(el);

            // Animation abwarten
            this._afterAnimationDeferId = kijs.defer(function() {
                this._afterAnimationDeferId = null;

                // Sichtbarkeit der Elemente aktualisieren
                this._updateElementsVisibility();

                // Aufräumen: Animationsklassen wieder entfernen
                this._cleanUp();

                // aktueller Container neu rendern
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

    /**
     * Aktiviert das vorherige Element aus der History (siehe setCurrentAnimated())
     * @param {String|null} [animation=null]
     * @param {Integer|null} [duration=null]
     * @returns {Promise}  e: currentEl, oldEl. Ohne vorheriges Element mit null erfüllt.
     */
    setPreviousAnimated(animation=null, duration=null) {
        if (this._elHistory.length > 1) {
            const el = this._elHistory[this._elHistory.length - 2];
            this._elHistory.pop();
            return this.setCurrentAnimated(el, animation, duration);
        }
        return Promise.resolve(null);
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
    /**
     * Entfernt bei allen Elementen die Animations-Klassen und setzt zIndex und animationDuration zurück.
     * @returns {undefined}
     */
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
    
    /**
     * Gibt die CSS-Klasse einer Animation zurück, z.B. 'kijs-slide-in-left'
     * @param {String} animation
     * @param {String} dir  'in' oder 'out'
     * @returns {String|null}  '' bei 'none', null bei unbekannter Animation
     */
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
    
    /**
     * Gibt ein Element anhand eines Index, eines Namens oder eines Elements zurück. Wirft einen
     * kijs.Error, wenn es nicht enthalten ist.
     * @param {Integer|String|kijs.gui.Element} el
     * @returns {kijs.gui.Element}
     */
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
    
    /**
     * Ermittelt den Index eines Elements
     * @param {kijs.gui.Element} el
     * @returns {Number|null}  null, wenn nicht enthalten
     */
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
    
    /**
     * Setzt das aktuelle Element, aktualisiert die History und löst change aus (wenn gerendert)
     * @param {kijs.gui.Element} el
     * @returns {Boolean}  Hat das aktuelle Element geändert?
     */
    _setCurrent(el) {
        if (el !== this._currentEl) {
            let oldEl = this._currentEl;

            // Falls das element bereits in der History ist: entfernen
            kijs.Array.remove(this._elHistory, el);

            // Neues Element am Ende der History anfügen
            this._elHistory.push(el);

            this._currentEl = el;
            if (this.isRendered) {
                this.raiseEvent('change', {currentEl: el, oldEl: oldEl});
            }
            return true;
        }
        return false;
    }
    
    /**
     * Macht nur currentEl sichtbar und blendet alle anderen Elemente aus.
     * @returns {undefined}
     */
    _updateElementsVisibility() {
        for (let i=0; i<this._elements.length; i++) {
            this._elements[i].visible = this._elements[i] === this._currentEl;
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
        
        // Variablen (Objekte/Arrays) leeren
        this._currentEl = null;
        this._elHistory = null;

        // Basisklasse entladen
        super.destruct(true);
    }
    
};
