/* global kijs, this, HTMLElement */

// --------------------------------------------------------------
// kijs.gui.ApertureMask
// --------------------------------------------------------------
/**
 * Halbtransparente Maske mit einem Ausschnitt für ein Element (target), das unmaskiert bleibt. Der
 * Rest des Bildschirms wird von vier Masken (oben, rechts, unten, links) überdeckt und kann nicht
 * bedient werden.
 *
 * Ist das target ein kijs.gui.Element, werden seine Grössenänderungen automatisch übernommen. Bei
 * einem kijs.gui.Dom muss die Position manuell nachgeführt werden (render()). Änderungen der
 * Fenstergrösse werden immer übernommen.
 *
 * @example
 * const mask = new kijs.gui.ApertureMask({ target: myField });
 * mask.show();
 * // ...
 * mask.hide();
 *
 * @fires afterRender  Nach jedem render()
 * @fires destruct  Beim Zerstören
 * @fires unrender  Beim Entfernen aus dem DOM
 */
kijs.gui.ApertureMask = class kijs_gui_ApertureMask extends kijs.Observable {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);
        
        this._defaultConfig = {};
        
        this._hideDeferId = null;   // intern: verzögertes Entfernen nach dem Ausblenden
        this._target = null;

        this._topDom = new kijs.gui.Dom({cls:['kijs-aperturemask', 'top']});
        this._rightDom = new kijs.gui.Dom({cls:['kijs-aperturemask', 'right']});
        this._bottomDom = new kijs.gui.Dom({cls:['kijs-aperturemask', 'bottom']});
        this._leftDom = new kijs.gui.Dom({cls:['kijs-aperturemask', 'left']});
        
        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            animated: true
        });
        
        // Mapping für die Zuweisung der Config-Eigenschaften
        this._configMap = {
            animated: { target: 'animated' },
            cls: { fn: 'function', target: this.clsAdd },   // {String|Array} Zusätzliche CSS-Klassen der Masken (siehe clsAdd())
            target: { target: 'target' }
        };

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }

        // window onResize überwachen
        kijs.Dom.addEventListener('resize', window, this.#onWindowResize, this);
    }



    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    /**
     * Ein- und Ausblenden animieren (CSS-Klasse animated)? Default: true
     * @type {Boolean}
     */
    get animated() { return this._topDom.clsHas('animated'); }
    set animated(val) {
        if (val) {
            this._topDom.clsAdd('animated');
            this._rightDom.clsAdd('animated');
            this._bottomDom.clsAdd('animated');
            this._leftDom.clsAdd('animated');
            
        } else {
            this._topDom.clsRemove('animated');
            this._rightDom.clsRemove('animated');
            this._bottomDom.clsRemove('animated');
            this._leftDom.clsRemove('animated');

        }
    }
    
    /**
     * Ist die Maske im DOM?
     * @type {Boolean}
     */
    get isRendered() { return !!this._topDom.isRendered; }

    /**
     * Element, das unmaskiert bleibt. Andere Werte werfen einen kijs.Error.
     * @type {kijs.gui.Element|kijs.gui.Dom|null}
     */
    get target() { return this._target; }
    set target(val) {

        // resize-Listener vom target entfernen
        if (this._target && (this._target instanceof kijs.gui.Element)) {
            this._target.off('afterResize', null, this);
        }

        // target ist kijs.gui.Element
        if (val instanceof kijs.gui.Element) {
            this._target = val;
            
            // resize-Listener zum target hinzufügen
            this._target.on('afterResize', this.#onTargetElAfterResize, this);
            
        // target ist kijs.gui.Dom
        } else if (val instanceof kijs.gui.Dom) {
            this._target = val;

        } else {
            throw new kijs.Error('kijs.gui.ApertureMask target must be an instance of kijs.gui.Element or kijs.gui.Dom');
            
        }
    }

    /**
     * Ist die Maske sichtbar (= gerendert)? Der Setter ruft show() bzw. hide() auf.
     * @type {Boolean}
     */
    get visible() { return this.isRendered; }
    set visible(val) {
        if (val && !this.visible) {
            this.show();

        } else if (!val && this.visible) {
            this.hide();
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
        // Config zuweisen
        kijs.Object.assignConfig(this, config, this._configMap);
    }

    /**
     * Fügt den DOM-Elementen eine CSS-Klasse hinzu.
     * @param {Array|String} cls
     * @returns {undefined}
     */
    clsAdd(cls) {
        this._topDom.clsAdd(cls);
        this._rightDom.clsAdd(cls);
        this._bottomDom.clsAdd(cls);
        this._leftDom.clsAdd(cls);
    }


    /**
     * Blendet die Maske aus (mit Animation)
     * @returns {undefined}
     */
    hide() {
        this._topDom.style.opacity = 0;
        this._rightDom.style.opacity = 0;
        this._bottomDom.style.opacity = 0;
        this._leftDom.style.opacity = 0;

        if (this.animated) {
            // animation läuft 0.2s, danach aus DOM entfernen
            this._clearHideDefer();
            this._hideDeferId = kijs.defer(function() {
                this._hideDeferId = null;
                this.unrender();
            }, 200, this);

        } else {
            this.unrender();
        }
    }
    
    /**
     * Aktualisiert die Position der Masken und hängt sie, falls nötig, an den Body an.
     * @returns {undefined}
     */
    render() {
        this._updatePosition();
        
        if (!this.isRendered) {
            this._topDom.renderTo(document.body);
            this._rightDom.renderTo(document.body);
            this._bottomDom.renderTo(document.body);
            this._leftDom.renderTo(document.body);
        }
        
        this.raiseEvent('afterRender');
    }
    
    /**
     * Zeigt die Maske an (mit animated nach 10 ms eingeblendet).
     * @returns {undefined}
     */
    show() {
        // ein noch ausstehendes Entfernen von hide() abbrechen
        this._clearHideDefer();

        this.render();
        
        // einblenden
        if (this.animated) {
            // einblenden nach 10ms
            kijs.defer(function() {
                this._topDom.style.opacity = 1;
                this._rightDom.style.opacity = 1;
                this._bottomDom.style.opacity = 1;
                this._leftDom.style.opacity = 1;
            }, 10, this);

        } else {
            this._topDom.style.opacity = 1;
            this._rightDom.style.opacity = 1;
            this._bottomDom.style.opacity = 1;
            this._leftDom.style.opacity = 1;
            
        }
    }
    
    /**
     * Entfernt die Masken aus dem DOM.
     * @param {Boolean} [superCall=false]  true, wenn von einer abgeleiteten Klasse aufgerufen (kein unrender-Event)
     * @returns {undefined}
     */
    unrender(superCall=false) {
        // Event auslösen.
        if (!superCall) {
            this.raiseEvent('unrender');
        }

        this._topDom.unrender();
        this._rightDom.unrender();
        this._leftDom.unrender();
        this._bottomDom.unrender();
    }

    
    // PROTECTED
    /**
     * Bricht das verzögerte Entfernen von hide() ab
     * @returns {undefined}
     */
    _clearHideDefer() {
        if (this._hideDeferId) {
            window.clearTimeout(this._hideDeferId);
            this._hideDeferId = null;
        }
    }

    /**
     * Passt Position und Grösse der Masken an die Position des targets an.
     * @returns {undefined}
     */
    _updatePosition() {
        let dom = null;
        
        if (this._target instanceof kijs.gui.Element) {
            dom = this._target.dom;
            
        } else if (this._target instanceof kijs.gui.Dom) {
            dom = this._target;
            
        }
        
        if (dom && dom.node) {
            let pos = kijs.Dom.getAbsolutePos(dom.node);

            // top element
            this._topDom.style.left = pos.x + 'px';
            this._topDom.style.height = pos.y + 'px';
            this._topDom.style.width = pos.w + 'px';

            // right element
            this._rightDom.style.left = (pos.x + pos.w) + 'px';

            // bottom element
            this._bottomDom.style.left = pos.x + 'px';
            this._bottomDom.style.top = (pos.y + pos.h) + 'px';
            this._bottomDom.style.width = pos.w + 'px';

            // left element
            this._leftDom.style.width = pos.x + 'px';
            
        }
    }

    
    // PRIVATE
    // LISTENERS
    #onTargetElAfterResize() {
        if (this.isRendered) {
            this._updatePosition();
        }
    }

    #onWindowResize() {
        if (this.isRendered) {
            this._updatePosition();
        }
    }



    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    destruct(superCall=false) {
        if (!superCall) {
            // unrender
            this.unrender(superCall);

            // Event auslösen.
            this.raiseEvent('destruct');
        }

        // verzögertes Entfernen abbrechen
        this._clearHideDefer();

        // Node-Event Listener von Window entfernen
        kijs.Dom.removeEventListener('resize', window, this);

        // Listeners entfernen
        if (this._target && (this._target instanceof kijs.gui.Element)) {
            this._target.off(null, null, this);
        }

        // Elemente/DOM-Objekte entladen
        if (this._topDom) {
            this._topDom.destruct();
        }
        if (this._rightDom) {
            this._rightDom.destruct();
        }
        if (this._leftDom) {
            this._leftDom.destruct();
        }
        if (this._bottomDom) {
            this._bottomDom.destruct();
        }

        // Variablen (Objekte/Arrays) leeren
        this._topDom = null;
        this._rightDom = null;
        this._leftDom = null;
        this._bottomDom = null;
        this._target = null;

        // Basisklasse entladen
        super.destruct();
    }

};
