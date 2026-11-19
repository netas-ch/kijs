/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.Element
// --------------------------------------------------------------
/**
 * Basisklasse aller GUI-Komponenten. Ein Element besteht aus einem kijs.gui.Dom-Objekt
 * (Eigenschaft dom) und kann in einem kijs.gui.Container stehen (Eigenschaft parent).
 * Siehe Leitfäden Lebenszyklus und Element, Dom und Container.
 *
 * Das Event-Objekt e enthält bei allen Events: element (dieses Element), eventName und
 * raiseElement (das Element, das das Event ursprünglich ausgelöst hat). Bei den Events, die
 * vom DOM-Node weitergeleitet werden, zusätzlich die Eigenschaften von kijs.gui.Dom
 * (nodeEvent, nodeEventName, useCapture, dom).
 *
 * @fires afterFirstRenderTo  Nach dem ersten renderTo()
 * @fires afterLoad  Nach einem erfolgreichen load(). e: zusätzlich die Antwort des RPC (response, request)
 * @fires afterRender  Nach dem Rendern
 * @fires afterResize  Nachdem sich die Grösse geändert hat (bei Änderungen über height, width oder html
 *                     um afterResizeDelay verzögert)
 * @fires changeVisibility  Nach einer Änderung von visible. e: visible
 * @fires click  Weitergeleitet vom DOM-Node
 * @fires contextMenu  Weitergeleitet vom DOM-Node (siehe kijs.gui.Dom)
 * @fires dblClick  Weitergeleitet vom DOM-Node
 * @fires destruct  Beim Freigeben mit destruct()
 * @fires enterEscPress  Weitergeleitet vom DOM-Node
 * @fires enterPress  Weitergeleitet vom DOM-Node
 * @fires escPress  Weitergeleitet vom DOM-Node
 * @fires focus  Weitergeleitet vom DOM-Node
 * @fires keyDown  Weitergeleitet vom DOM-Node
 * @fires keyPress  Soll vom DOM-Node weitergeleitet werden. Achtung: kijs.gui.Dom kennt keyPress nicht,
 *                  mit einem Listener wird darum beim Rendern der kijs.Error
 *                  «kijsEvent "keyPress" is not mapped» geworfen.
 * @fires keyUp  Weitergeleitet vom DOM-Node
 * @fires mouseDown  Weitergeleitet vom DOM-Node
 * @fires mouseEnter  Weitergeleitet vom DOM-Node
 * @fires mouseLeave  Weitergeleitet vom DOM-Node
 * @fires mouseMove  Weitergeleitet vom DOM-Node
 * @fires mouseUp  Weitergeleitet vom DOM-Node
 * @fires singleClick  Weitergeleitet vom DOM-Node (siehe kijs.gui.Dom)
 * @fires spacePress  Weitergeleitet vom DOM-Node
 * @fires touchCancel  Weitergeleitet vom DOM-Node
 * @fires touchEnd  Weitergeleitet vom DOM-Node
 * @fires touchMove  Weitergeleitet vom DOM-Node
 * @fires touchStart  Weitergeleitet vom DOM-Node
 * @fires unrender  Beim Entfernen des DOM-Nodes mit unrender()
 * @fires wheel  Weitergeleitet vom DOM-Node
 */
kijs.gui.Element = class kijs_gui_Element extends kijs.Observable {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        this._afterResizeDeferId = null;   // intern
        this._afterResizeDelay = 300;    // delay beim Aufruf des afterResize-Events
        this._disabledInitial = false;
        this._dom = new kijs.gui.Dom();
        this._name = null;
        this._ddSource = null;
        this._parentEl = null;
        this._rpc = null;           // Instanz von kijs.gui.Rpc
        this._rpcLoadFn = null;     // Name der remoteFn. Bsp: 'address.load'
        this._rpcLoadArgs = {};     // Standard RPC-Argumente
        this._visible = true;
        this._lastSize = null;    // Grösse beim letzten Aufruf vom afterResize-Event
        this._userData = null;    // Objekt mit Daten die einem Element mitgegeben können z.B. eine ID

        this._waitMaskEl = null;        // Instanz der Lademaske
        this._waitMaskCount = 0;        // Anzahl Lademasken die angezeigt werden sollen.
                                        // bei mehreren wird trotzdem nur eine angezeigt.
                                        // Sobald der Zähler wieder auf 0 ist, wird sie dann entfernt.

        this._waitMaskTarget = this;               // Element, für das die Lademaske angezeigt werden soll
        this._waitMaskTargetDomProperty = 'dom';   // Dom-Property, für das die Lademaske angezeigt werden soll

        this._preventAfterResize = false;    // Auslösen des afterResize-Events verhindern?

        this._defaultConfig = {};

        this._eventForwards = {};   // Events, die an untergeordnete kijs.gui.Dom Objekte weitergeleitet werden sollen
                                    //  {
                                    //    click: [
                                    //      { target: this._dom, targetEventName: 'click' },
                                    //      { target: this._domInner, targetEventName: 'click' }
                                    //    ],
                                    //    dblclick: [
                                    //      { target: this._dom, targetEventName: 'click' }
                                    //    ]
                                    //  }


        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        this._configMap = {
            afterResizeDelay: true,
            autoLoad: { target: 'autoLoad' },
            cls: { fn: 'function', target: this._dom.clsAdd, context: this._dom },  // {String|Array} CSS-Klassen, z.B. 'cls-a cls-b' oder ['cls-a', 'cls-b']
            disableEnterBubbeling: { target: 'disableEnterBubbeling', context: this._dom },  // {Boolean} Bubbling der Taste Enter stoppen (siehe kijs.gui.Dom)
            disableEscBubbeling: { target: 'disableEscBubbeling', context: this._dom },      // {Boolean} Bubbling der Taste Escape stoppen (siehe kijs.gui.Dom)
            nodeTagName: { target: 'nodeTagName', context: this._dom },
            defaults: { fn: 'manual' }, // {Object} Nur bei Containern: Standard-Config der Kind-Elemente (siehe kijs.gui.Container)
            ddSource: { target: 'ddSource' },
            height: { target: 'height' },
            html: { target: 'html', context: this._dom },
            htmlDisplayType: { target: 'htmlDisplayType', context: this._dom },
            left: { target: 'left' },
            name: true,
            nodeAttribute: { fn: 'function', target: this._dom.nodeAttributeSet, context: this._dom },  // {Object} Attribute des Nodes, z.B. { id: 'meinFeld', tabIndex: -1 }
            parent: { target: 'parent' },
            style : { fn: 'assign', target: 'style', context: this._dom },
            tooltip: { target: 'tooltip' },
            top: { target: 'top' },
            userData: { target: 'userData' },
            visible : true,
            displayWaitMask: { target: 'displayWaitMask' },
            width: { target: 'width' },
            xtype: { fn: 'manual' },    // {String} Klassenname. Wird beim Erstellen aus einem Config-Objekt gebraucht (z.B. in elements eines Containers)
            rpc: { target: 'rpc' },
            rpcLoadFn: true,
            rpcLoadArgs: true,
            
            waitMaskTarget: { prio: 1000, target: 'waitMaskTarget' },
            waitMaskTargetDomProperty: { prio: 1000, target: 'waitMaskTargetDomProperty' },
            on: { prio: 1500,  fn: 'assignListeners' },     // {Object} Listeners, z.B. { click: fn, context: this }. Ohne context gilt dieses Element
            disabled: { prio: 2000, target: 'disabled' }
        };

        // Event-Weiterleitungen von this._dom
        this._eventForwardsAdd('click', this._dom);
        this._eventForwardsAdd('dblClick', this._dom);
        this._eventForwardsAdd('contextMenu', this._dom);
        //this._eventForwardsAdd('drag', this._dom);
        //this._eventForwardsAdd('dragEnter', this._dom);
        //this._eventForwardsAdd('dragOver', this._dom);
        //this._eventForwardsAdd('dragStart', this._dom);
        //this._eventForwardsAdd('dragLeave', this._dom);
        //this._eventForwardsAdd('dragEnd', this._dom);
        //this._eventForwardsAdd('drop', this._dom);
        this._eventForwardsAdd('focus', this._dom);
        this._eventForwardsAdd('mouseDown', this._dom);
        this._eventForwardsAdd('mouseEnter', this._dom);
        this._eventForwardsAdd('mouseLeave', this._dom);
        this._eventForwardsAdd('mouseMove', this._dom);
        this._eventForwardsAdd('mouseUp', this._dom);
        this._eventForwardsAdd('singleClick', this._dom);
        this._eventForwardsAdd('wheel', this._dom);

        // key events
        this._eventForwardsAdd('keyDown', this._dom);
        this._eventForwardsAdd('keyUp', this._dom);
        this._eventForwardsAdd('keyPress', this._dom);
        this._eventForwardsAdd('enterPress', this._dom);
        this._eventForwardsAdd('enterEscPress', this._dom);
        this._eventForwardsAdd('escPress', this._dom);
        this._eventForwardsAdd('spacePress', this._dom);

        // touch events
        this._eventForwardsAdd('touchStart', this._dom);
        this._eventForwardsAdd('touchEnd', this._dom);
        this._eventForwardsAdd('touchMove', this._dom);
        this._eventForwardsAdd('touchCancel', this._dom);
        
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
     * Verzögerung in ms, mit der afterResize nach einer Änderung von height, width oder html ausgelöst wird. Default: 300
     * @type {Number}
     */
    get afterResizeDelay() { return this._afterResizeDelay; }
    set afterResizeDelay(val) { this._afterResizeDelay = val; }

    /**
     * Soll nach dem ersten renderTo() automatisch load() aufgerufen werden?
     * @type {Boolean}
     */
    get autoLoad() {
        return this.hasListener('afterFirstRenderTo', this.#onAfterFirstRenderTo, this);
    }
    set autoLoad(val) {
        if (val) {
            this.on('afterFirstRenderTo', this.#onAfterFirstRenderTo, this);
        } else {
            this.off('afterFirstRenderTo', this.#onAfterFirstRenderTo, this);
        }
    }

    /**
     * Damit das Element per Drag&Drop gezogen werden kann: Config-Objekt für kijs.gui.dragDrop.Source
     * oder null. Der Getter gibt die kijs.gui.dragDrop.Source-Instanz zurück. Siehe Leitfaden Drag and Drop.
     * @type {Object|kijs.gui.dragDrop.Source|null}
     */
    get ddSource() { 
        return this._ddSource; 
    }
    set ddSource(val) {
        // config-object
        if (kijs.isObject(val)) {
            if (kijs.isEmpty(this._ddSource)) {
                val.ownerEl = this;
                if (kijs.isEmpty(val.ownerDomProperty)) {
                    val.ownerDomProperty = 'dom';
                }
                this._ddSource = new kijs.gui.dragDrop.Source(val);
            } else {
                this._ddSource.applyConfig(val);
            }
            
        // null
        } else if (val === null) {
            if (this._ddSource) {
                this._ddSource.destruct();
            }
            this._ddSource = null;
            
        } else {
            throw new kijs.Error(`ddSource must be a object or null`);
            
        }
    }

    /**
     * Deaktiviert (siehe kijs.gui.Dom.disabled).
     * Getter und Setter nicht überschreiben, sondern die Funktion changeDisabled().
     * @type {Boolean}
     */
    get disabled() {  return this._dom.disabled; }
    set disabled(val) {
        this.changeDisabled(val, false);
    }
    
    /**
     * Lademaske anzeigen? false entfernt die Lademaske, auch wenn sie mit waitMaskAdd() mehrfach angefordert wurde.
     * @type {Boolean}
     */
    get displayWaitMask() { return !kijs.isEmpty(this._waitMaskEl); }
    set displayWaitMask(val) {
        if (val) {
            if (kijs.isEmpty(this._waitMaskEl)) {
                this._waitMaskEl = new kijs.gui.Mask({
                    displayWaitIcon: true,
                    target: this._waitMaskTarget,
                    targetDomProperty: this._waitMaskTargetDomProperty
                });
                this._waitMaskCount = 1;

                this._waitMaskEl.show();
            } else {
                this._waitMaskEl.show();
            }
        } else {
            if (!kijs.isEmpty(this._waitMaskEl)) {
                this._waitMaskEl.destruct();
                this._waitMaskEl = null;
                this._waitMaskCount = 0;
            }
        }
    }

    /**
     * Das kijs.gui.Dom-Objekt des Elements
     * @type {kijs.gui.Dom}
     */
    get dom() { return this._dom; }

    /**
     * Hat der DOM-Node den Fokus?
     * @type {Boolean}
     */
    get hasFocus() { return this._dom.hasFocus; }

    /**
     * Höhe in Pixel (siehe kijs.gui.Dom.height). Eine Änderung löst afterResize verzögert aus.
     * @type {Number|null}
     */
    get height() { return this._dom.height; }
    set height(val) {
        this._dom.height = val;
        // Evtl. afterResize-Event zeitversetzt auslösen
        if (this._hasSizeChanged(val)) {
            this._raiseAfterResizeEvent(true);
        }
    }

    /**
     * Inhalt des Elements (siehe kijs.gui.Dom.html). Ändert sich dadurch die Grösse, wird afterResize verzögert ausgelöst.
     * @type {String}
     */
    get html() {
        return this._dom.html;
    }
    set html(val) {
        this._dom.html = val;
        this._raiseAfterResizeEvent(true);
    }

    /**
     * Darstellung von html: 'html', 'code' oder 'text' (siehe kijs.gui.Dom.htmlDisplayType). Default: 'html'
     * @type {String}
     */
    get htmlDisplayType() { return this._dom.htmlDisplayType; }
    set htmlDisplayType(val) { this._dom.htmlDisplayType = val; }

    /**
     * Index im elements-Array des parent-Containers
     * @type {Number|null}
     */
    get index() {
        if (kijs.isEmpty(this.parent) || kijs.isEmpty(this.parent.elements)) {
            return null;
        }
        let index = this.parent.elements.indexOf(this);
        if (index === -1) {
            index = null;
        }
        return index;
    }

    /**
     * Zurzeit immer false, weil kijs.gui.Dom keine Eigenschaft isAppended hat.
     * @type {Boolean}
     */
    get isAppended() { return !!this._dom.isAppended; }

    /**
     * Ist html leer?
     * @type {Boolean}
     */
    get isEmpty() { return this._dom.isEmpty; }

    /**
     * Ist das Element gerendert?
     * @type {Boolean}
     */
    get isRendered() { return !!(this._dom && this._dom.isRendered); }

    /**
     * Abstand von links in Pixel (siehe kijs.gui.Dom.left)
     * @type {Number|null}
     */
    get left() { return this._dom.left; }
    set left(val) { this._dom.left = val; }

    /**
     * Das Element im gleichen Container, das grafisch unterhalb liegt (gleiches left, nächstgrösseres top)
     * @type {kijs.gui.Element|null}
     */
    get lowerElement() {
        if (!this._parentEl || !this._parentEl.elements || kijs.isEmpty(this.top)) {
            return null;
        }

        let curTop=null, lowerEl=null;
        kijs.Array.each(this._parentEl.elements, function(el) {
            if (!kijs.isEmpty(el.top) && el.left === this.left && el !== this) {
                if (el.top > this.top && (curTop === null || el.top < curTop)) {
                    lowerEl = el;
                    curTop = el.top;
                }
            }
        }, this);

        return lowerEl;
    }

    /**
     * Name des Elements. Damit kann es gefunden werden, z.B. mit up() oder kijs.gui.Container.down().
     * @type {String|null}
     */
    get name() { return this._name; }
    set name(val) { this._name = val; }

    /**
     * Das nächste Element im elements-Array des Containers
     * @type {kijs.gui.Element|null}
     */
    get next() {
        if (!this._parentEl || !this._parentEl.elements) {
            return null;
        }

        let index = -1;
        for (let i=0; i<this._parentEl.elements.length; i++) {
            if (this._parentEl.elements[i] === this) {
                index = i+1;
                break;
            }
        }

        if (index > -1 && this._parentEl.elements[index]) {
            return this._parentEl.elements[index];
        } else {
            return null;
        }
    }

    /**
     * Der DOM-Node, null wenn nicht gerendert
     * @type {HTMLElement|null}
     */
    get node() { return this._dom.node; }
    /**
     * Tag-Name des DOM-Nodes (siehe kijs.gui.Dom.nodeTagName). Default: 'div'
     * @type {String}
     */
    get nodeTagName() { return this._dom.nodeTagName; }

    /**
     * Elternelement (Container). Das Element reagiert auf dessen afterResize.
     * @type {kijs.gui.Element|null}
     */
    get parent() { return this._parentEl; }
    set parent(val) {
        if (val !== this._parentEl) {
            if (this._parentEl) {
                this._parentEl.off('afterResize', this.#onParentAfterResize, this);
                this._parentEl.off('childElementAfterResize', this.#onParentChildElementAfterResize, this);
            }

            this._parentEl = val;
            this._parentEl.on('afterResize', this.#onParentAfterResize, this);
            this._parentEl.on('childElementAfterResize', this.#onParentChildElementAfterResize, this);
            this.applyConfig();
        }
    }

    /**
     * Das vorherige Element im elements-Array des Containers
     * @type {kijs.gui.Element|null}
     */
    get previous() {
        if (!this._parentEl || !this._parentEl.elements) {
            return null;
        }

        let index = -1;
        for (let i=0; i<this._parentEl.elements.length; i++) {
            if (this._parentEl.elements[i] === this) {
                index = i-1;
                break;
            }
        }

        if (index > -1 && this._parentEl.elements[index]) {
            return this._parentEl.elements[index];
        } else {
            return null;
        }
    }

    /**
     * RPC-Instanz für load(): kijs.gui.Rpc oder Name einer mit kijs.setRpc() registrierten Instanz.
     * Ohne Angabe gibt der Getter kijs.getRpc('default') zurück.
     * @type {kijs.gui.Rpc|String}
     */
    get rpc() {
        return this._rpc || kijs.getRpc('default');
    }
    set rpc(val) {
        if (kijs.isString(val)) {
            val = kijs.getRpc(val);
        }

        if (val instanceof kijs.gui.Rpc) {
            this._rpc = val;
        } else {
            throw new kijs.Error(`Unknown format on config "rpc"`);
        }
    }
    
    /**
     * Argumente, die bei load() an die remoteFn übergeben werden. Sie überschreiben gleichnamige Argumente des Aufrufs.
     * @type {Object}
     */
    get rpcLoadArgs() { return this._rpcLoadArgs; }
    set rpcLoadArgs(val) { this._rpcLoadArgs = val; }

    /**
     * Name der remoteFn für load(), z.B. 'address.load'
     * @type {String|null}
     */
    get rpcLoadFn() { return this._rpcLoadFn; }
    set rpcLoadFn(val) { this._rpcLoadFn = val; }

    /**
     * CSS-Styles (siehe kijs.gui.Dom.style). Über die Config werden sie ergänzt.
     * @type {Object}
     */
    get style() { return this._dom.style; }

    /**
     * Tooltip (siehe kijs.gui.Dom.tooltip)
     * @type {String|Array|Object|kijs.gui.Tooltip|null}
     */
    get tooltip() { return this._dom.tooltip; }
    set tooltip(val) { this._dom.tooltip = val; };

    /**
     * Abstand von oben in Pixel (siehe kijs.gui.Dom.top)
     * @type {Number|null}
     */
    get top() { return this._dom.top; }
    set top(val) { this._dom.top = val; }

    /**
     * Das Element im gleichen Container, das grafisch oberhalb liegt (gleiches left, nächstkleineres top)
     * @type {kijs.gui.Element|null}
     */
    get upperElement() {
        if (!this._parentEl || !this._parentEl.elements || kijs.isEmpty(this.top)) {
            return null;
        }

        let curTop=null, upperEl=null;
        kijs.Array.each(this._parentEl.elements, function(el) {
            if (!kijs.isEmpty(el.top) && el.left === this.left && el !== this) {
                if (el.top < this.top && (curTop === null || el.top > curTop)) {
                    upperEl = el;
                    curTop = el.top;
                }
            }
        }, this);

        return upperEl;
    }

    /**
     * Beliebige Daten zum Element, z.B. eine ID. Nur Objekt oder null.
     * @type {Object|null}
     */
    get userData() { return this._userData; }
    set userData(val) {
        if (val === null || kijs.isObject(val)) {
            this._userData = val;
        } else {
            throw new kijs.Error(`userData must be object or null`);
        }
    }

    /**
     * Sichtbar? Ein unsichtbares Element hat die CSS-Klasse kijs-hidden. Eine Änderung löst changeVisibility aus. Default: true
     * @type {Boolean}
     */
    get visible() {
        return this._visible;
    }
    set visible(val) {
        const changed = !!this._visible !== !!val;

        this._visible = !!val;

        if (this._visible) {
            this._dom.clsRemove('kijs-hidden');
        } else {
            this._dom.clsAdd('kijs-hidden');
        }

        if (changed) {
            this.raiseEvent('changeVisibility', { visible: this._visible });
        }
    }

    /**
     * Element, über dem die Lademaske angezeigt wird. Default: das Element selbst.
     * Ein String wird mit kijs.getObjectFromString(val, this) aufgelöst.
     * @type {kijs.gui.Element|String}
     */
    get waitMaskTarget() { return this._waitMaskTarget; }
    set waitMaskTarget(val) {
        if (kijs.isString(val)) {
            val = kijs.getObjectFromString(val, this);
        }
        this._waitMaskTarget = val;
        if (!kijs.isEmpty(this._waitMaskEl)) {
            this._waitMaskEl.target = val;
        }
    }

    /**
     * Name der Dom-Eigenschaft von waitMaskTarget, über der die Lademaske liegt. Default: 'dom'
     * @type {String}
     */
    get waitMaskTargetDomProperty() { return this._waitMaskTargetDomProperty; }
    set waitMaskTargetDomProperty(val) {
        this._waitMaskTargetDomProperty = val;
        if (!kijs.isEmpty(this._waitMaskEl)) {
            this._waitMaskEl.targetDomProperty = val;
        }
    }

    /**
     * Breite in Pixel (siehe kijs.gui.Dom.width). Ist das Element gerendert, löst eine Änderung afterResize verzögert aus.
     * @type {Number|null}
     */
    get width() { return this._dom.width; }
    set width(val) {
        this._dom.width = val;
        // Evtl. afterResize-Event zeitversetzt auslösen
        if (this.isRendered && this._hasSizeChanged(null, val)) {
            this._raiseAfterResizeEvent(true);
        }
    }

    /**
     * Klassenname mit Punkten, z.B. 'kijs.gui.Button'
     * @type {String}
     */
    get xtype() {
        if (kijs.isString(this.constructor.name) && !kijs.isEmpty(this.constructor.name)) {
            return this.constructor.name.replace(/_/g, '.');

        // Workaround für IE und Edge
        } else {
            // Wenn der xtype noch nicht ermittelt worden ist, muss er ermittelt werden
            const proto = this;

            // Zuerst den Klassennamen suchen (Edge)
            if (!proto.__xtype) {
                let results = /\s*class\s([a-zA-Z0-9_]+)(\sextends\s[a-zA-Z0-9_.]+)?\s*{/.exec(this.constructor.toString());
                if (results && results.length > 0) {
                    proto.__xtype = results[1].trim().replace(/_/g, '.');
                }
            }

            // Sonst den Funktionsnamen suchen (IE)
            if (!proto.__xtype) {
                let results = /\s*function\s([a-zA-Z0-9_]+)\s*\(/.exec(this.constructor.toString());
                if (results && results.length > 0) {
                    proto.__xtype = results[1].trim().replace(/_/g, '.');
                }
            }

            if  (proto.__xtype) {
                return proto.__xtype;
            } else {
                throw new kijs.Error(`xtype can not be determined`);
            }
        }

    }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    /**
     * Wendet die Konfigurations-Eigenschaften an und versiegelt danach das Objekt (Object.seal).
     * Siehe Leitfaden Config-System.
     * @param {Object} config
     * @param {Boolean} [preventEvents=false]   Das Auslösen von afterResize verhindern?
     * @returns {undefined}
     */
    applyConfig(config={}, preventEvents=false) {
        // evtl. afterResize-Event deaktivieren
        const prevAfterRes = this._preventAfterResize;
        if (preventEvents) {
            this._preventAfterResize = true;
        }

        // Config zuweisen
        kijs.Object.assignConfig(this, config, this._configMap);

        // Evtl. afterResize-Event wieder zulassen
        if (preventEvents) {
            this._preventAfterResize = prevAfterRes;
        }

        // Objekt versiegeln
        // Bewirkt, dass keine neuen Properties hinzugefügt werden dürfen.
        Object.seal(this);
    }

    /**
     * Ändert die Eigenschaft disabled.
     * Sollte nicht direkt aufgerufen werden.
     * Bitte den Setter disabled verwenden.
     * @param {Boolean} val
     * @param {Boolean} [callFromParent=false]  True, wenn der Aufruf vom changeDisabled 
     *                                          des Elterncontainers kommt.
     * @returns {undefined}
     */
    changeDisabled(val, callFromParent) {
        // Falls der Aufruf vom Elterncontainer kommt, wird beim Zurücksetzen von
        // disabled wieder der vorherige Wert zugewiesen.
        if (callFromParent) {
            if (!val) {
                val = !!this._disabledInitial;
            }
            
        } else {
            this._disabledInitial = !!val;
            
        }
        
        this._dom.disabled = !!val;
    }
    
    /**
     * Setzt den Fokus auf das Element
     * @param {Boolean} [alsoSetIfNoTabIndex=false]    Fokus auch setzen, wenn tabIndex === -1
     *                                                 undefined: nicht fokussierbar (bei undefined muss die Eigenschaft mit removeAttribute('tabIndex') entfernt werden. Sonst klappts nicht)
     *                                                 tabIndex -1: nur via focus() Befehl fokussierbar
     *                                                 tabIndex  0: Fokussierbar - Browser bestimmt die Tab-Reihenfolge
     *                                                 tabIndex >0: Fokussierbar - in der Reihenfolge wie der tabIndex
     * @returns {HTMLElement|null}                     HTML-Node, das den Fokus erhalten hat
     */
    focus(alsoSetIfNoTabIndex) {
        return this._dom.focus(alsoSetIfNoTabIndex);
    }


    /**
     * Prüft, ob dieses Element ein Kind von einem anderen Element ist.
     * @param {kijs.gui.Element} element
     * @returns {Boolean}
     */
    isChildOf(element) {
        if (this.parent && (this.parent instanceof kijs.gui.Element)) {
            if (this.parent === element) {
                return true;
            } else {
                return this.parent.isChildOf(element);
            }
        } else {
            return false;
        }
    }

    /**
     * Lädt die Config via RPC (rpc, rpcLoadFn) und wendet response.config an. Danach wird
     * afterLoad ausgelöst. Ohne rpcLoadFn wird nichts geladen und das Promise nie erfüllt.
     * @param {Object}  [args] Objekt mit Argumenten, die an die remoteFn übergeben werden.
     *                         rpcLoadArgs überschreiben gleichnamige Argumente.
     * @param {Boolean} [superCall=false]   true beim Aufruf aus einer abgeleiteten Klasse (dann kein afterLoad)
     * @returns {Promise}       Wird mit dem RPC-Ergebnis erfüllt
     */
    load(args=null, superCall=false) {
        return new Promise((resolve, reject) => {
            if (this._rpcLoadFn) {

                if (!kijs.isObject(args)) {
                    args = {};
                }
                args = Object.assign({}, args, this._rpcLoadArgs);

                this.rpc.do({
                    remoteFn: this._rpcLoadFn,
                    owner: this,
                    requestData: args,
                    cancelRunningRpcs: true,
                    waitMaskTarget: this._waitMaskTarget,
                    waitMaskTargetDomProperty: this._waitMaskTargetDomProperty,
                    context: this

                }).then((e) => {
                    if (kijs.isEmpty(e.response.errorType)) {
                        // config Properties
                        if (e.response.config && this._dom) {
                            // config Properties übernehmen
                            this.applyConfig(e.response.config);
                        }

                        // 'afterLoad' auslösen
                        if (!superCall) {
                            this.raiseEvent('afterLoad', Object.assign({}, e));
                        }
                    }

                    // promise ausführen
                    resolve(e);
                    
                }).catch((ex) => {
                    reject(ex);

                });
            }
        });
    }

    // overwrite
    on(names, callback, context) {
        names = kijs.isArray(names) ? names : [names];

        // Event Weiterleitungen erstellen, falls noch nicht vorhanden
        kijs.Array.each(names, function(name) {
            if (kijs.isObject(this._eventForwards) && this._eventForwards[name]) {
                kijs.Array.each(this._eventForwards[name], function(forward) {
                    forward.target.on(forward.targetEventName, this.#onForwardEvent, this);
                }, this);
            }
        }, this);

        // Aufruf der Basisfunktion
        super.on(names, callback, context);
    }

    /**
     * Löst ein Event aus. Ergänzt e um element, eventName und raiseElement
     * (raiseElement bleibt beim Weiterleiten erhalten).
     * @param {String} name
     * @param {Object} [e={}]
     * @returns {Boolean}   false, wenn ein Listener false zurückgibt
     */
    // overwrite
    raiseEvent(name, e={}) {
        Object.assign(e, {
            element: this,
            eventName: name
        });
        // Das auszulösende Element darf nicht überschrieben werden.
        // Dieses gibt an, welches Element das Event ursprünglich ausgelöst hat
        // und bleibt bestehen, wenn das Event weitergereicht wird.
        if (kijs.isEmpty(e.raiseElement)) {
            e.raiseElement = this;
        }
        return super.raiseEvent(name, e);
    }

    /**
     * Rendert den DOM-Node und löst afterRender aus. Siehe Leitfaden Lebenszyklus.
     * @param {Boolean} [superCall=false]   true beim Aufruf aus einer abgeleiteten Klasse (dann kein afterRender)
     * @returns {undefined}
     */
    render(superCall) {
        // DOM Rendern
        this._dom.render();

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
    }

    /**
     * Rendert das Element und fügt den DOM-Node einem Parent-DOM-Node hinzu.
     * Beim ersten Mal wird afterFirstRenderTo ausgelöst.
     * @param {HTMLElement} targetNode           Eltern-Node
     * @param {HTMLElement} [referenceNode=null] Referenzknoten, Falls der Node
     *                                           statt angehängt eingefügt werden soll
     * @param {String} [insertPosition='before'] 'before': Einfügen vor dem referenceNode
     *                                           'after': Einfügen nach dem referenceNode
     * @returns {undefined}
     */
    renderTo(targetNode, referenceNode=null, insertPosition='before') {
        const firstRender = !this.isRendered;

        this.render();

        this._dom.renderTo(targetNode, referenceNode, insertPosition);

        // Event afterFirstRenderTo auslösen
        if (firstRender) {
            this.raiseEvent('afterFirstRenderTo');
        }
    }

    /**
     * Entfernt den DOM-Node aus dem DOM und löst unrender aus.
     * @param {Boolean} [superCall=false]   true beim Aufruf aus einer abgeleiteten Klasse (dann kein unrender-Event)
     * @returns {undefined}
     */
    unrender(superCall) {
        // timer abbrechen
        if (this._afterResizeDeferId) {
            window.clearTimeout(this._afterResizeDeferId);
            this._afterResizeDeferId = null;
        }

        // Event auslösen.
        if (!superCall) {
            this.raiseEvent('unrender');
        }

        if (this._dom) {
            this._dom.unrender();
        }
    }

    /**
     * Durchläuft den Element-Baum nach oben und gibt das erste Element zurück,
     * dass mit dem Namen (Eigenschaft 'name') übereinstimmt.
     * @param {String} name
     * @returns {kijs.gui.Element|null}
     */
    up(name) {
        if (!kijs.isEmpty(name) && this.parent) {
            if (this.parent.name === name) {
                return this.parent;
            } else if (this.parent.up) {
                return this.parent.up(name);
            }
        }
        return null;
    }

    /**
     * Durchläuft den Element-Baum nach oben und gibt das erste Element zurück,
     * dass mit dem Klassennamen (Eigenschaft 'xtype') übereinstimmt.
     * @param {String} xtype
     * @returns {kijs.gui.Element|null}
     */
    upX(xtype) {
        if (!kijs.isEmpty(xtype) && this.parent) {
            if (this.parent.xtype === xtype) {
                return this.parent;
            } else if (this.parent.upX) {
                return this.parent.upX(xtype);
            }
        }
        return null;
    }

    /**
     * Zeigt die Lademaske an
     * Falls sie schon angezeigt wird, so wird nur der Zähler hochgezählt
     * @returns {kijs.gui.Mask}
     */
    waitMaskAdd() {
        this._waitMaskCount++;

        if (!this._waitMaskEl) {
            this.displayWaitMask = true;
        } else {
            this._waitMaskEl.show();
        }

        return this._waitMaskEl;
    }

    /**
     * Entfernt die Lademaske
     * Falls der Zähler > 1 ist, wird sie nicht geschlossen, sondern nur der Zähler dekrementiert.
     * @returns {undefined}
     */
    waitMaskRemove() {
        if (this._waitMaskEl && this._waitMaskCount) {
            this._waitMaskCount--;

            if (this._waitMaskCount <= 0) {
                this.displayWaitMask = false;
            }
        }
    }


    // PROTECTED
    /**
     * Leitet einen Event-Listener, der mit on oder once erstellt wurde an ein untergeordnetes kijs.gui.Dom Objekt weiter
     * @param {String} eventName            kijs-Event Name
     * @param {kijs.gui.Dom|kijs.gui.Element} target  Untergeordnetes Objekt, an dieses der Listener weitergeleitet wird
     * @param {String} [targetEventName]    kijs-Event Name im untergeordneten Objekt oder leer bei gleichem Event-Namen
     * @returns {undefined}
     */
    _eventForwardsAdd(eventName, target, targetEventName) {
        if (!targetEventName) {
            targetEventName = eventName;
        }

        if (!this._eventForwardsHas(eventName, target, targetEventName)) {
            if (!this._eventForwards[eventName]) {
                this._eventForwards[eventName] = [];
            }
            const forward = {
                target: target,
                targetEventName: targetEventName
            };

            this._eventForwards[eventName].push(forward);

            /*// Bei kijs.gui.Element-Targets, wird der Forward-Listener sofort erstellt,
            // weil sonst, wenn der Listener vor dem _eventForwardsAdd gemacht wird, nicht funktioniert.
            // Da dieser Vorfall bei kijs.gui.Dom nicht auftreten kann, können wir dort den Listener erst bei einer
            // Verwendung erstellen.
            //console.log(forward.target);
            if (forward.target instanceof kijs.gui.Element) {
                forward.target.on(forward.targetEventName, this.#onForwardEvent, this);
            }*/
        }
    }

    /**
     * Überprüft, ob eine Eventweiterleitung existiert
     * @param {String} eventName            kijs-Event Name
     * @param {kijs.gui.Dom|kijs.gui.Element} target Untergeordnetes Objekt, an dieses der Listener weitergeleitet wird
     * @param {String} [targetEventName]    kijs-Event Name im untergeordneten Objekt oder leer bei gleichem Event-Namen
     * @returns {Boolean}
     */
    _eventForwardsHas(eventName, target, targetEventName) {
        if (!targetEventName) {
            targetEventName = eventName;
        }

        let ret = false;

        if (!kijs.isEmpty(this._eventForwards[eventName])) {
            kijs.Array.each(this._eventForwards[eventName], function(forward) {
                if (forward.target === target && forward.targetEventName === targetEventName) {
                    ret = true;
                    return;
                }
            }, this);
        }
        return ret;
    }

    /**
     * Entfernt eine Event-Weiterleitung
     * @param {String} eventName            Name des Events, dessen Weiterleitung entfernt werden soll
     * @param {kijs.gui.Dom|kijs.gui.Element} target  Ziel, dessen Weiterleitung entfernt werden soll
     * @param {String} [targetEventName]    kijs-Event Name im untergeordneten Objekt oder leer bei gleichem Event-Namen
     * @returns {undefined}
     */
    _eventForwardsRemove(eventName, target, targetEventName) {
        if (!targetEventName) {
            targetEventName = eventName;
        }

        let forwardToDelete = null;

        if (!kijs.isEmpty(this._eventForwards[eventName])) {
            kijs.Array.each(this._eventForwards[eventName], function(forward) {
                if (forward.target === target && forward.targetEventName === targetEventName) {
                    forwardToDelete = forward;
                    return;
                }
            }, this);
        }

        if (forwardToDelete) {
            kijs.Array.remove(this._eventForwards[eventName], forwardToDelete);
        }
    }

    /**
     * Hat die Grösse seit dem letzten Aufruf von _raiseAfterResizeEvent geändert?
     * @param {Number|null} [height=null]   null=aktuelle Höhe
     * @param {Number|null} [width=null]    null=aktuelle Breite
     * @returns {Boolean}
     */
    _hasSizeChanged(height=null, width=null) {
        if (!kijs.isObject(this._lastSize)) {
            return true;
        }

        if (height === null) {
            height = this.height;
        }
        if (width === null) {
            width = this.width;
        }

        if (height !== this._lastSize.h || width !== this._lastSize.w) {
            return true;
        }

        return false;
    }

    /**
     * Falls sich seit dem letzten Aufruf dieser Funktion die Grösse geändert hat: das afterResize-Event auslösen
     * @param {Boolean} [useDelay=false]
     * @param {Object} [e={}]   Falls das Event nur weitergereicht wird, kann hier das
     *                          e-Arg des vorherigen Events übergeben werden
     * @returns {undefined}
     */
    _raiseAfterResizeEvent(useDelay=false, e={}) {
        if (this._preventAfterResize) {
            return;
        }

        // Aufruf mit Verzögerung
        if (useDelay) {
            if (this._afterResizeDeferId) {
                window.clearTimeout(this._afterResizeDeferId);
                this._afterResizeDeferId = null;
            }

            this._afterResizeDeferId = kijs.defer(function(){
                if (this._hasSizeChanged()) {
                    this._lastSize = { h: this.height, w: this.width };
                    this.raiseEvent('afterResize', e);
                }
            }, this._afterResizeDelay, this);

        // Aufruf ohne Verzögerung
        } else {
            if (this._hasSizeChanged()) {
                this._lastSize = { h: this.height, w: this.width };
                this.raiseEvent('afterResize', e);
            }

        }
    }
    

    // PRIVATE
    // LISTENERS
    #onAfterFirstRenderTo(e) {
        this.load();
    }

    /**
     * Listener für die weitergeleiteten Events der untergeordneten kijs.gui.Dom oder kijs.gui.Element Objekte.
     * Hier werden die Events, die in (this._eventForwards) zum Weiterleiten gekennzeichnet sind weitergeleitet.
     * @param {Object} e
     * @returns {Boolean}
     */
    #onForwardEvent(e) {
        let ret = true;

        // Vorhandene Weiterleitungen durchgehen und bei Übereinstimmung das Event weiterleiten
        kijs.Object.each(this._eventForwards, function(eventName, forwards) {

            kijs.Array.each(forwards, function(forward) {
                const eventContextProperty = (forward.target instanceof kijs.gui.Dom) ? 'context' : 'element';
                if (forward.target === e[eventContextProperty] && forward.targetEventName === e.eventName) {
                    e.element = this;
                    if (this.raiseEvent(eventName, e) === false) {
                        ret = false;
                    }
                }
            }, this);
        }, this);

        return ret;
    }

    /**
     * Listener der aufgerufen wird, wenn die Grösse des Parents geändert hat
     * @param {Object} e
     * @returns {undefined}
     */
    #onParentAfterResize(e) {
        // Falls die eigene Grösse geändert hat: das eigene afterResize-Event auslösen
        this._raiseAfterResizeEvent(false, e);
    }

    /**
     * Listener der aufgerufen wird, wenn die Grösse des Parents geändert hat
     * @param {Object} e
     * @returns {undefined}
     */
    #onParentChildElementAfterResize(e) {
        // Falls die eigene Grösse geändert hat: das eigene afterResize-Event auslösen
        this._raiseAfterResizeEvent(false, e);
    }



    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    /**
     * Gibt das Element frei: unrender(), Event destruct, Unterobjekte (Dom, Lademaske,
     * Drag&Drop) freigeben. Siehe Leitfaden Lebenszyklus.
     * @param {Boolean} [superCall=false]   true beim Aufruf aus einer abgeleiteten Klasse
     * @returns {undefined}
     */
    // overwrite
    destruct(superCall) {
        // afterResize-Events verhindern
        this._preventAfterResize = true;
            
        if (!superCall) {
            // unrender
            this.unrender(superCall);

            // Event auslösen.
            this.raiseEvent('destruct');
        }

        // Listeners entfernen
        if (this._parentEl) {
            this._parentEl.off(null, null, this);
        }

        // Elemente/DOM-Objekte entladen
        if (this._dom) {
            this._dom.destruct();
        }
        if (this._waitMaskEl) {
            this._waitMaskEl.destruct();
        }
        if (this._ddSource) {
            this._ddSource.destruct();
        }

        // Variablen (Objekte/Arrays) leeren
        this._afterResizeDeferId = null;
        this._defaultConfig = null;
        this._ddSource = null;
        this._eventForwards = null;
        this._dom = null;
        this._parentEl = null;
        this._rpc = null;
        this._rpcLoadArgs = null;
        this._lastSize = null;
        this._userData = null;
        this._waitMaskEl = null;
        this._waitMaskTarget = null;

        // Basisklasse entladen
        super.destruct();
    }

};
