/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.Element
// --------------------------------------------------------------
/**
 * Ein einfaches DOM-Element ohne Positionierungen.
 *
 * CONFIG-Parameter
 * ----------------
 * afterResizeDelay Number [optional=300]
 *
 * cls          Array|String [optional] CSS-Klassennamen
 *                                      Beispiel: cls:['cls-a','cls-b'] oder cls:'cls-a cls-b'
 *
 * displayWaitMask Booelan [optional]   Soll die Lademaske angezeigt werden?
 *
 * height       Number [optional]       Höhe
 *
 * html         String [optional]       HTML-Code, der in das Element eingefügt wird
 *                                      Beispiel: html:'<p>Hallo Welt</p>'
 *
 * htmlDisplayType String [optional]    Darstellung der Eigenschaft 'html'. Default: 'html'
 *                                      html: als html-Inhalt (innerHtml)
 *                                      code: Tags werden als als Text angezeigt
 *                                      text: Tags werden entfernt
 *
 * left         Number [optional]       X-Koordinate
 *
 * name         String [optional]       Element-Namen Siehe dazu auch kijs.gui.Container.getElementByName()
 *
 * nodeTagName   String [optional]       Tag-Name des DOM-node. Default='div'
 *                                      Beispiel: nodeTagName='section'
 *
 * on           Object [optional]       Objekt mit Listener-Funktionen und optionalem context.
 *                                      Wenn kein context angegeben wird, so wird das aktuelle Objekt genommen.
 *                                      Beispiel: on: {
 *                                          click: function(e) {
 *                                              ...
 *                                          },
 *                                          dblclick: function(e) {
 *                                              ...
 *                                          },
 *                                          context: xy
 *                                      }
 *
 * parent       kijs.gui.Element [optional] Verweis auf das übergeordenete Element
 *
 * style        Object [optional]       Objekt mit CSS-Style Anweisungen als Javascript
 *                                      Beispiel: style:{background-color:'#ff8800'}
 *
 * toolTip      String|Object|kijs.gui.ToolTip [optional]  ToolTip als
 *                                                   - String (HTML-Code). Beispiel: html:'<p>Hallo Welt</p>'
 *                                                   - ToolTip-Config Objekt
 *                                                   - kijs.gui.ToolTip-Instanz
 *
 * top          Number [optional]       Y-Koordinate
 *
 * visible      Boolean [optional]      Sichtbarkeit des Elements Default=true
 *                                      Beispiel: visible:false
 *
 * width        Number [optional]      Breite
 *
 *
 *
 * FUNKTIONEN
 * ----------
 * applyConfig                          Wendet ein Konfigurations-Objekt an
 *  Args:
 *   config     Object
 *
 * destruct                             Destruktor ->Entlädt das Objekt samt allen untergeordneten Objekten

 * waitMaskAdd                          Zeigt die Lademaske an oder zählt den Zähler hoch, falls sie schon sichtbar ist
 *
 * waitMaskRemove                       Zählt den Zähler nach unten und blendet bei 0 die Lademaske aus
 *
 * render                               rendert den DOM-Node
 *
 * renderTo                             rendert den DOM-Node und fügt ihn einem Parent-DOM-Node hinzu
 *  Args:
 *   targetNode    HTMLElement
 *   insertBefore  HTMLElement [optional]
 *
 * up                                   Durchläuft den Element-Baum nach oben und gibt das erste Element zurück,
 *  Args:                               dass mit dem Namen (Eigenschaft 'name') übereinstimmt.
 *   name          String
 *  Return:        kijs_gui_Element|Null
 *
 * upX                                  Durchläuft den Element-Baum nach oben und gibt das erste Element zurück,
 *  Args:                               dass mit dem Klassennamen (Eigenschaft 'xtype') übereinstimmt.
 *   name          String
 *  Return:        kijs_gui_Element|Null
 *
 *
 * EIGENSCHAFTEN
 * -------------
 * afterResizeDelay
 *
 * cls          kijs.helper.Cls         Verweis auf den Cls-Helper
 *
 * height       Number                  Höhe
 *
 * html         String                  Siehe kijs.gui.Dom.html
 *
 * htmlDisplayType String               Siehe kijs.gui.Dom.htmlDisplayType
 *
 * isEmpty      Boolean (readonly)
 *
 * isRendered   Boolean (readonly)
 *
 * left         Number                  X-Koordinate
 *
 * node         HTML-Element (readonly) Verweis auf den DOM-Node
 *
 * name
 *
 * next         kijs.gui.Element|Null (readonly)   Gibt das nächste element im elements-Array zurück
 *
 * parent       kijs.gui.Element|Null (readonly)   Verweis auf das übergeordnete Element
 *
 * previous     kijs.gui.Element|Null (readonly)   Gibt das vorherige element im elements-Array zurück
 *
 * style        (readonly)
 *
 * toolTip
 *
 * top          Number                  Y-Koordinate
 *
 * visible
 *
 * width        Number                  Breite
 *
 * xtype        String (readonly)       Gibt den Namen der Klasse zurück
 *
 *
 * EVENTS
 * ----------
 * afterFirstRenderTo
 * afterRender
 * afterResize
 * changeVisibility
 * dblClick
 * destruct
 * drag
 * dragEnd
 * dragLeave
 * dragOver
 * dragStart
 * drop
 * focus
 * mouseDown
 * mouseLeave
 * mouseMove
 * mouseUp
 * unrender
 * wheel
 *
 * // key events
 * keyDown
 * enterPress
 * enterEscPress
 * escPress
 * spacePress
 */
kijs.gui.Element = class kijs_gui_Element extends kijs.Observable {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super();

        this._afterResizeDeferHandle = null;   // intern
        this._afterResizeDelay = 300;    // delay beim Aufruf des afterResize-Events
        this._dom = new kijs.gui.Dom();
        this._name = null;
        this._parentEl = null;
        this._visible = true;
        this._lastSize = null;    // Grösse beim letzten Aufruf vom afterResize-Event

        this._waitMaskEl = null;        // Instanz der Lademaske
        this._waitMaskCount = 0;        // Anzahl Lademasken die angezeigt werden sollen.
                                        // bei mehreren wird trotzdem nur eine angezeigt.
                                        // Sobald der Zähler wieder auf 0 ist, wird sie dann entfernt.

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
            cls: { fn: 'function', target: this._dom.clsAdd, context: this._dom },
            disableEnterBubbeling: { target: 'disableEnterBubbeling', context: this._dom },
            disableEscBubbeling: { target: 'disableEscBubbeling', context: this._dom },
            nodeTagName: { target: 'nodeTagName', context: this._dom },
            defaults: { fn: 'manual' }, // wird nur bei containern gebraucht
            height: { target: 'height' },
            html: { target: 'html', context: this._dom },
            htmlDisplayType: { target: 'htmlDisplayType', context: this._dom },
            left: { target: 'left' },
            name: true,
            on: { fn: 'assignListeners' },
            parent: { target: 'parent' },
            style : { fn: 'assign', target: 'style', context: this._dom },
            toolTip: { target: 'toolTip' },
            top: { target: 'top' },
            visible : true,
            displayWaitMask: { target: 'displayWaitMask' },
            waitMaskTargetDomProperty: { target: 'waitMaskTargetDomProperty' },
            width: { target: 'width' },
            xtype: { fn: 'manual' }
        };

        // Event-Weiterleitungen von this._dom
        this._eventForwardsAdd('click', this._dom);
        this._eventForwardsAdd('dblClick', this._dom);
        this._eventForwardsAdd('drag', this._dom);
        this._eventForwardsAdd('dragOver', this._dom);
        this._eventForwardsAdd('dragStart', this._dom);
        this._eventForwardsAdd('dragLeave', this._dom);
        this._eventForwardsAdd('dragEnd', this._dom);
        this._eventForwardsAdd('drop', this._dom);
        this._eventForwardsAdd('focus', this._dom);
        this._eventForwardsAdd('mouseDown', this._dom);
        this._eventForwardsAdd('mouseEnter', this._dom);
        this._eventForwardsAdd('mouseLeave', this._dom);
        this._eventForwardsAdd('mouseMove', this._dom);
        this._eventForwardsAdd('mouseUp', this._dom);
        this._eventForwardsAdd('touchStart', this._dom);
        this._eventForwardsAdd('wheel', this._dom);

        // key events
        this._eventForwardsAdd('keyDown', this._dom);
        this._eventForwardsAdd('keyUp', this._dom);
        this._eventForwardsAdd('keyPress', this._dom);
        this._eventForwardsAdd('enterPress', this._dom);
        this._eventForwardsAdd('enterEscPress', this._dom);
        this._eventForwardsAdd('escPress', this._dom);
        this._eventForwardsAdd('spacePress', this._dom);


        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }
    }


    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get afterResizeDelay() { return this._afterResizeDelay; }
    set afterResizeDelay(val) { this._afterResizeDelay = val; }

    get displayWaitMask() { return !kijs.isEmpty(this._waitMaskEl); }
    set displayWaitMask(val) {
        if (val) {
            if (kijs.isEmpty(this._waitMaskEl)) {
                this._waitMaskEl = new kijs.gui.Mask({
                    displayWaitIcon: true,
                    target: this,
                    targetDomProperty: this._waitMaskTargetDomProperty
                });
                this._waitMaskCount = 1;

                if (this.isRendered) {
                    this._waitMaskEl.show();
                }
            }
        } else {
            if (!kijs.isEmpty(this._waitMaskEl)) {
                this._waitMaskEl.destruct();
                this._waitMaskEl = null;
                this._waitMaskCount = 0;
            }
        }
    }

    get dom() { return this._dom; }

    get isRendered() { return !!this._dom.isRendered; }

    get node() { return this._dom.node; }
    get nodeTagName() { return this._dom.nodeTagName; }

    get height() { return this._dom.height; }
    set height(val) {
        this._dom.height = val;
        // Evtl. afterResize-Event zeitversetzt auslösen
        if (this._hasSizeChanged(val)) {
            this._raiseAfterResizeEvent(true);
        }
    }

    get html() { return this._dom.html; }
    set html(val) { this._dom.html = val; }

    get htmlDisplayType() { return this._dom.htmlDisplayType; }
    set htmlDisplayType(val) { this._dom.htmlDisplayType = val; }

    get isEmpty() { return this._dom.isEmpty; }

    get left() { return this._dom.left; }
    set left(val) { this._dom.left = val; }

    /**
     * Gibt das Element zurück, das grafisch unterhalb liegt.
     * @returns {kijs.gui.Element|null}
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

    get name() { return this._name; }
    set name(val) { this._name = val; }

    /**
     * Gibt das nächste element im elements-Array zurück
     * @returns {kijs.gui.Element|null}
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
     * Gibt das Elternelement zurück
     * @returns {kijs.gui.Element|null}
     */
    get parent() { return this._parentEl; }
    set parent(val) {
        if (val !== this._parentEl) {
            if (this._parentEl) {
                this._parentEl.off('afterResize', this._onParentAfterResize, this);
                this._parentEl.off('childElementAfterResize', this._onParentChildElementAfterResize, this);
            }

            this._parentEl = val;
            this._parentEl.on('afterResize', this._onParentAfterResize, this);
            this._parentEl.on('childElementAfterResize', this._onParentChildElementAfterResize, this);
            this.applyConfig();
        }
    }

    /**
     * Gibt das vorherige element im elements-Array zurück
     * @returns {kijs.gui.Element|null}
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

    get style() { return this._dom.style; }

    get toolTip() { return this._dom.toolTip; }
    set toolTip(val) {
        this._dom.toolTip = val;
    };

    get top() { return this._dom.top; }
    set top(val) { this._dom.top = val; }

    /**
     * Gibt das Element zurück, das grafisch oberhalb liegt.
     * @returns {kijs.gui.Element|null}
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

    get waitMaskTargetDomProperty() { return this._waitMaskTargetDomProperty; }
    set waitMaskTargetDomProperty(val) {
        this._waitMaskTargetDomProperty = val;
        if (!kijs.isEmpty(this._waitMaskEl)) {
            this._waitMaskEl.targetDomProperty = val;
        }
    }

    get width() { return this._dom.width; }
    set width(val) {
        this._dom.width = val;
        // Evtl. afterResize-Event zeitversetzt auslösen
        if (this._hasSizeChanged(null, val)) {
            this._raiseAfterResizeEvent(true);
        }
    }

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

            // Sonst den Funktionsname suchen (IE)
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
     * Wendet die Konfigurations-Eigenschaften an
     * @param {Object} config
     * @param {Boolean} [preventEvents=false]   // Das Auslösen des afterResize-Event verhindern?
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
    }

    /**
     * Setzt den Fokus auf das Element
     * @param {Boolean} [alsoSetIfNoTabIndex=false]    Fokus auch setzen, wenn tabIndex === -1
     *                                                 undefined: nicht fokussierbar (bei undefined muss die Eigenschaft mit removeAttribute('tabIndex') entfernt werden. Sonst klappts nicht)
     *                                                 tabIndex -1: nur via focus() Befehl fokussierbar
     *                                                 tabIndex  0: Fokussierbar - Browser betimmt die Tabreihenfolge
     *                                                 tabIndex >0: Fokussierbar - in der Reihenfolge wie der tabIndex
     * @returns {HTMLElement|null}                     HTML-Node, das den Fokus erhalten hat
     */
    focus(alsoSetIfNoTabIndex=false) {
        return this._dom.focus(alsoSetIfNoTabIndex);
    }

    // overwrite
    on(names, callback, context) {
        names = kijs.isArray(names) ? names : [names];

        // Event Weiterleitungen erstellen, falls noch nicht vorhanden
        kijs.Array.each(names, function(name) {
            if (this._eventForwards[name]) {
                kijs.Array.each(this._eventForwards[name], function(forward) {
                    forward.target.on(forward.targetEventName, this._onForwardEvent, this);
                }, this);
            }
        }, this);

        // Aufruf der Basisfunktion
        super.on(names, callback, context);
    }

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
     * rendert den DOM-Node
     * @param {Boolean} [superCall=false]
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
     * rendert den DOM-Node und fügt ihn einem Parent-DOM-Node hinzu
     * @param {HTMLElement} targetNode
     * @param {HTMLElement} [insert] - Falls das Element statt angehängt eingefügt werden soll.
     * @param {String} [insertPosition='before'] before, falls das Element vor dem insert-Element eingefügt werden soll, 'after' für nach dem Element.
     * @returns {undefined}
     */
    renderTo(targetNode, insert, insertPosition='before') {
        const firstRender = !this.isRendered;

        this.render();

        if (insert) {

            // Element vor dem insert-Element einfügen
            if (insertPosition === 'before') {
                targetNode.insertBefore(this._dom.node, insert);

            // Element nach dem insert-Element einfügen
            } else if (insertPosition === 'after') {
                targetNode.insertBefore(this._dom.node, insert.nextSibling);

            } else {
                throw new kijs.Error('invalid insert position for renderTo');
            }

        // Element anhängen
        } else {
            targetNode.appendChild(this._dom.node);
        }

        // Event afterFirstRenderTo auslösen
        if (firstRender) {
            this.raiseEvent('afterFirstRenderTo');
        }
    }

    /**
     * Node aus DOM entfernen, falls vorhanden
     * @param {Boolean} superCall
     * @returns {undefined}
     */
    unrender(superCall) {
        // Event auslösen.
        if (!superCall) {
            this.raiseEvent('unrender');
        }

        this._dom.unrender();
    }

    /**
     * Durchläuft den Element-Baum nach oben und gibt das erste Element zurück,
     * dass mit dem Namen (Eigenschaft 'name') übereinstimmt.
     * @param {String} name
     * @returns {kijs_gui_Element|null}
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
     * @returns {kijs_gui_Element|null}
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
            this._eventForwards[eventName] = this._eventForwards[eventName] || [];
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
                console.log('test');
                forward.target.on(forward.targetEventName, this._onForwardEvent, this);
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
     * Falls sich seit dem letzten aufruf dieser Funktion die Grösse geändert hat: das afterResize-Event auslösen
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
            if (this._afterResizeDeferHandle) {
                window.clearTimeout(this._afterResizeDeferHandle);
            }

            this._afterResizeDeferHandle = kijs.defer(function(){
                this._afterResizeDeferHandle = null;

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


    // LISTENERS
    /**
     * Listener für die weitergeleiteten Events der untergeordneten kijs.gui.Dom oder kijs.gui.Element Objekte
     * Hier werden die Events, die in (this._eventForwards) zum weiterleiten gekennzeichnet sind weitergeleitet
     * @param {Object} e
     * @returns {Boolean}
     */
    _onForwardEvent(e) {
        let ret = true;

        // Vorhandene Weiterleitungen durchgehen und bei Übereinstimmung das Event weiterleiten
        kijs.Object.each(this._eventForwards, function(eventName, forwards) {

            kijs.Array.each(forwards, function(forward) {
                const eventContextProperty = forward.target instanceof kijs.gui.Dom ? 'context' : 'element';
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
     * Listener der Aufgerufen wird, wenn die Grösse des Parents geändert hat
     * @param {Object} e
     * @returns {undefined}
     */
    _onParentAfterResize(e) {
        // Falls die eigene Grösse geändert hat: das eigene afterResize-Event auslösen
        this._raiseAfterResizeEvent(false, e);
    }

    /**
     * Listener der Aufgerufen wird, wenn die Grösse des Parents geändert hat
     * @param {Object} e
     * @returns {undefined}
     */
    _onParentChildElementAfterResize(e) {
        // Falls die eigene Grösse geändert hat: das eigene afterResize-Event auslösen
        this._raiseAfterResizeEvent(false, e);
    }


    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(superCall) {
        // atferResize-Events verhindern
        this._preventAfterResize = true;
        if (this._afterResizeDeferHandle) {
            window.clearTimeout(this._afterResizeDeferHandle);
        }

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
            this._waitMaskEl.destruct;
        }

        // Variablen (Objekte/Arrays) leeren
        this._afterResizeDeferHandle = null;
        this._dom = null;
        this._parentEl = null;
        this._eventForwards = null;
        this._configMap = null;
        this._lastSize = null;
        this._waitMaskEl = null;

        // Basisklasse entladen
        super.destruct();
    }
};
