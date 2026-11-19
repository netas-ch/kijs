/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.Container
// --------------------------------------------------------------
/**
 * Element mit Kind-Elementen. Es besteht aus zwei DOM-Nodes: dom (aussen) und innerDom
 * (innen). Die Kind-Elemente und html werden in innerDom gerendert.
 * Siehe Leitfaden Element, Dom und Container.
 *
 * @example
 * new kijs.gui.Container({
 *     defaults: { style: { margin: '4px' } },
 *     elements: [
 *         { xtype: 'kijs.gui.Element', html: 'Hallo' },
 *         new kijs.gui.Button({ caption: 'OK' })
 *     ]
 * });
 *
 * @fires add  Nach dem Hinzufügen mit add(). e: elements (die neuen Elemente)
 * @fires beforeAdd  Vor dem Hinzufügen mit add(). e: elements. Rückgabe false bricht ab
 * @fires beforeRemove  Vor dem Entfernen mit remove(). e: removeElements. Rückgabe false bricht ab
 * @fires childElementAfterResize  Nach afterResize eines Kind-Elements. e: childElement
 * @fires remove  Nach dem Entfernen mit remove()
 * @fires scroll  Weitergeleitet von innerDom
 * @fires scrollEnd  Weitergeleitet von innerDom
 */
kijs.gui.Container = class kijs_gui_Container extends kijs.gui.Element {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        this._innerDom = new kijs.gui.Dom();

        this._defaults = {};
        this._elements = [];

        this._dom.clsAdd('kijs-container');
        this._innerDom.clsAdd('kijs-container-inner');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            scrollableX: { target: 'scrollableX' },
            scrollableY: { target: 'scrollableY' },
            defaults: true,
            html: { target: 'html', context: this._innerDom },
            htmlDisplayType: { target: 'htmlDisplayType', context: this._innerDom },
            innerCls: { fn: 'function', target: this._innerDom.clsAdd, context: this._innerDom },  // {String|Array} CSS-Klassen von innerDom
            innerStyle : { fn: 'assign', target: 'style', context: this._innerDom },             // {Object} CSS-Styles von innerDom, z.B. { padding: '10px' }

            elements: { prio: 1000, fn: 'function', target: this._replaceElements, context: this }
        });

        // Event-Weiterleitungen von this._innerDom
        this._eventForwardsAdd('scroll', this._innerDom);
        this._eventForwardsAdd('scrollEnd', this._innerDom);
        
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
     * Standard-Config für Kind-Elemente, die als Config-Objekt hinzugefügt werden. Eigenschaften,
     * die in der Config des Kind-Elements schon vorhanden sind, werden nicht überschrieben.
     * Unbekannte Eigenschaften lösen beim Kind-Element keinen Fehler aus.
     * @type {Object}
     */
    get defaults() { return this._defaults; }
    set defaults(val) { this._defaults = val; }
    
    /**
     * Kind-Elemente. In der Config: Array mit Instanzen oder Config-Objekten (mit xtype).
     * Als Kurzform gibt es '-' für kijs.gui.Separator und '>' für kijs.gui.Spacer.
     * Die Config ersetzt alle bestehenden Kind-Elemente. Sonst add() und remove() verwenden.
     * @type {kijs.gui.Element[]}
     */
    get elements() { return this._elements; }

    /**
     * Erstes Kind-Element oder null
     * @type {kijs.gui.Element|null}
     */
    get firstChild() {
        if (this._elements.length > 0) {
            return this._elements[0];
        }
        return null;
    }

    /**
     * Inhalt von innerDom (siehe kijs.gui.Dom.html)
     * @type {String}
     */
    // overwrite
    get html() { return this._innerDom.html; }
    set html(val) { this._innerDom.html = val; }

    /**
     * Darstellung von html in innerDom: 'html', 'code' oder 'text' (siehe kijs.gui.Dom.htmlDisplayType)
     * @type {String}
     */
    // overwrite
    get htmlDisplayType() { return this._innerDom.htmlDisplayType; }
    set htmlDisplayType(val) { this._innerDom.htmlDisplayType = val; }

    /**
     * Innerer DOM-Node, in den die Kind-Elemente und html gerendert werden
     * @type {kijs.gui.Dom}
     */
    get innerDom() { return this._innerDom; }

    /**
     * Leer, wenn innerDom kein html und der Container keine Kind-Elemente hat
     * @type {Boolean}
     */
    // overwrite
    get isEmpty() { return this._innerDom.isEmpty && kijs.isEmpty(this._elements); }

    /**
     * Letztes Kind-Element oder null
     * @type {kijs.gui.Element|null}
     */
    get lastChild() {
        if (this._elements.length > 0) {
            return this._elements[this._elements.length-1];
        }
        return null;
    }

    /**
     * Scrollen auf der X-Achse: true=immer, false=nie, 'auto'=wenn nötig. Default: false
     * @type {Boolean|String}
     */
    get scrollableX() {
        if (this._innerDom.clsHas('kijs-scrollable-x-enable')) {
            return true;
        } else if (this._innerDom.clsHas('kijs-scrollable-x-auto')) {
            return 'auto';
        } else {
            return false;
        }
    }
    set scrollableX(val) {
        this._innerDom.clsRemove('kijs-scrollable-x-enable');
        this._innerDom.clsRemove('kijs-scrollable-x-auto');
        
        if (val === 'auto') {
            this._innerDom.clsAdd('kijs-scrollable-x-auto');
        } else if (val) {
            this._innerDom.clsAdd('kijs-scrollable-x-enable');
        }
    }
    
    /**
     * Scrollen auf der Y-Achse: true=immer, false=nie, 'auto'=wenn nötig. Default: false
     * @type {Boolean|String}
     */
    get scrollableY() {
        if (this._innerDom.clsHas('kijs-scrollable-y-enable')) {
            return true;
        } else if (this._innerDom.clsHas('kijs-scrollable-y-auto')) {
            return 'auto';
        } else {
            return false;
        }
    }
    set scrollableY(val) {
        this._innerDom.clsRemove('kijs-scrollable-y-enable');
        this._innerDom.clsRemove('kijs-scrollable-y-auto');
            
        if (val === 'auto') {
            this._innerDom.clsAdd('kijs-scrollable-y-auto');
        } else if (val) {
            this._innerDom.clsAdd('kijs-scrollable-y-enable');
        }
    }
    
    
    
    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    /**
     * Fügt ein oder mehrere Elemente hinzu. Elemente, die schon im Container sind, werden ignoriert.
     * Ist der Container gerendert, wird er neu gerendert. Danach wird afterResize ausgelöst.
     * @param {kijs.gui.Element|Object|String|Array} elements  Instanz, Config-Objekt (mit xtype), '-' oder '>' oder ein Array davon
     * @param {Number|null} [index=null]          Position, an der eingefügt werden soll. null=am Schluss
     * @param {Object} [options={}]
     * @param {Boolean} [options.preventRender=false]   render verhindern?
     * @param {Boolean} [options.preventEvents=false]   beforeAdd und add nicht auslösen?
     * @returns {undefined}
     */
    add(elements, index=null, options={}) {
        if (!kijs.isArray(elements)) {
            elements = [elements];
        }

        const newElements = [];
        for (let i=0,len=elements.length; i<len; i++) {
            let el = this._getInstanceForAdd(elements[i]);
            if (el && !kijs.Array.contains(this._elements, el)) {
                el.on('afterResize', this.#onChildElementAfterResize, this);
                newElements.push(el);
            }
        }
        elements = null;

        if (!options.preventEvents) {
            // event ausführen
            if (this.raiseEvent('beforeAdd', {elements: newElements}) === false) {
                return;
            }
        }

        // zu elements hinzufügen.
        kijs.Array.each(newElements, function(el) {
            if (kijs.isInteger(index)) {
                this._elements.splice(index, 0, el);
            } else {
                this._elements.push(el);
            }
        }, this);

        // Falls der DOM gemacht ist, wird neu gerendert.
        if (this._innerDom.node && !options.preventRender) {
            this.render();
        }
        
        // Hinzugefügt, Event auslösen.
        if (!options.preventEvents) {
            this.raiseEvent('add', {elements: newElements});
        }
        
        this.raiseEvent('afterResize');
    }

    /**
     * Ändert disabled beim Container und allen Kind-Elementen (siehe kijs.gui.Element.changeDisabled)
     * @param {Boolean} val
     * @param {Boolean} [callFromParent=false]  True, wenn der Aufruf vom Elterncontainer kommt.
     * @returns {undefined}
     */
    // overwrite
    changeDisabled(val, callFromParent) {
        super.changeDisabled(!!val, callFromParent);
        kijs.Array.each(this._elements, function(el) {
            el.changeDisabled(!!val, true);
        }, this);
    }
    
    /**
     * Durchläuft den Element-Baum nach unten und gibt das erste Element zurück,
     * dass mit dem Namen (Eigenschaft 'name') übereinstimmt.
     * @param {String} name
     * @returns {kijs.gui.Element|null}
     */
    down(name) {
        const ret = this.getElementsByName(name, -1, true);
        if (!kijs.isEmpty(ret)) {
            return ret[0];
        } else {
            return null;
        }
    }

    /**
     * Durchläuft den Element-Baum nach unten und gibt das erste Element zurück,
     * dass mit dem Klassennamen (Eigenschaft 'xtype') übereinstimmt.
     * @param {String} xtype
     * @returns {kijs.gui.Element|null}
     */
    downX(xtype) {
        const ret = this.getElementsByXtype(xtype, -1, true);
        if (!kijs.isEmpty(ret)) {
            return ret[0];
        } else {
            return null;
        }
    }

    /**
     * Gibt untergeordnete Elemente aufgrund ihres 'name' zurück
     * @param {String} name
     * @param {Number} [deep=-1]    Suchtiefe: 0=nur im aktuellen Container, 1=zusätzlich in den
     *                               Kind-Containern, n=..., -1=unendlich
     * @param {Boolean} [breakOnFirst=false] Nur das erste gefundene Element zurückgeben?
     * @returns {kijs.gui.Element[]}
     */
    getElementsByName(name, deep=-1, breakOnFirst=false) {
        let ret=[];

        if (kijs.isEmpty(name)) {
            return [];
        }

        // elements im aktuellen Container werden zuerst zurückgegeben
        kijs.Array.each(this._elements, function(el) {
            if (el.name === name) {
                ret.push(el);
                if (breakOnFirst) {
                    return false;
                }
            }
        }, this);

        // Evtl. untergeordnete Container rekursiv duchsuchen
        if (!breakOnFirst || kijs.isEmpty(ret)) {
            if (deep && deep!==0) {
                if (deep>0) {
                    deep--;
                }
                kijs.Array.each(this._elements, function(el) {
                    if (kijs.isFunction(el.getElementsByName)) {
                        let retSub = el.getElementsByName(name, deep, breakOnFirst);
                        if (!kijs.isEmpty(retSub)) {
                            ret = ret.concat(retSub);
                            if (breakOnFirst) {
                                return false;
                            }
                        }
                    }
                }, this);
            }
        }

        // Rückgabe
        return ret;
    }

    /**
     * Gibt untergeordnete Elemente aufgrund ihres 'xtype' zurück
     * @param {String} xtype
     * @param {Number} [deep=-1]    Suchtiefe: 0=nur im aktuellen Container, 1=zusätzlich in den
     *                               Kind-Containern, n=..., -1=unendlich
     * @param {Boolean} [breakOnFirst=false] Nur das erste gefundene Element zurückgeben?
     * @returns {kijs.gui.Element[]}
     */
    getElementsByXtype(xtype, deep=-1, breakOnFirst=false) {
        let ret=[];

        if (kijs.isEmpty(xtype)) {
            return [];
        }

        // elements im aktuellen Container werden zuerst zurückgegeben
        kijs.Array.each(this._elements, function(el) {
            if (el.xtype === xtype) {
                ret.push(el);
                if (breakOnFirst) {
                    return false;
                }
            }
        }, this);

        // Evtl. untergeordnete Container rekursiv durchsuchen
        if (!breakOnFirst || kijs.isEmpty(ret)) {
            if (deep && deep!==0) {
                if (deep>0) {
                    deep--;
                }
                kijs.Array.each(this._elements, function(el) {
                    if (kijs.isFunction(el.getElementsByXtype)) {
                        let retSub = el.getElementsByXtype(xtype, deep, breakOnFirst);
                        if (!kijs.isEmpty(retSub)) {
                            ret = ret.concat(retSub);
                            if (breakOnFirst) {
                                return false;
                            }
                        }
                    }
                }, this);
            }
        }

        // Rückgabe
        return ret;
    }
    
    /**
     * Gibt alle Unterelemente als flaches Array zurück
     * @param {Number} [deep=-1]    Suchtiefe: 0=nur im aktuellen Container, 1=zusätzlich in den
     *                               Kind-Containern, n=..., -1=unendlich
     * @returns {kijs.gui.Element[]}
     */
    getElementsRec(deep=-1) {
        let ret = [];

        // elements im aktuellen Container werden zuerst zurückgegeben
        kijs.Array.each(this._elements, function(el) {
            ret.push(el);
        }, this);

        // Evtl. untergeordnete Container rekursiv durchsuchen
        if (deep !== 0) {
            if (deep>0) {
                deep--;
            }
            kijs.Array.each(this._elements, function(el) {
                if (kijs.isFunction(el.getElementsRec)) {
                    let retSub = el.getElementsRec(deep);
                    if (!kijs.isEmpty(retSub)) {
                        ret = ret.concat(retSub);
                    }
                }
            }, this);
        }

        return ret;
    }

    /**
     * Überprüft ob ein untergeordnetes Element existiert
     * @param {kijs.gui.Element} element
     * @returns {Boolean}
     */
    hasChild(element) {
        if (kijs.isEmpty(this._elements) || kijs.isEmpty(element)) {
            return false;
        }
        return kijs.Array.contains(this._elements, element);
    }

    /**
     * Entfernt ein oder mehrere Kind-Elemente. Standardmässig werden sie dabei zerstört (destruct).
     * Ist ein Element nicht im Container, gibt es einen Fehler.
     * @param {kijs.gui.Element|Array} elements
     * @param {Object} [options={}]
     * @param {Boolean} [options.preventDestruct=false] destruct verhindern? Dann wird nur unrender ausgeführt
     * @param {Boolean} [options.preventUnrender=false] unrender verhindern (nur zusammen mit preventDestruct)?
     * @param {Boolean} [options.preventRender=false]   Neu-Rendern des Containers verhindern?
     * @param {Boolean} [options.preventEvents=false]   beforeRemove und remove nicht auslösen?
     * @param {Boolean} [superCall=false]   true beim Aufruf aus einer abgeleiteten Klasse (dann kein beforeRemove)
     * @returns {undefined}
     */
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
        
        // löschen
        kijs.Array.each(kijs.Array.clone(elements), function(el) {
            if (!kijs.Array.contains(this._elements, el)) {
                throw new kijs.Error(`el does not exist in elements.`);
            }
            
            if (!options.preventDestruct && el.destruct) {
                el.destruct();

            } else if (el.isRendered && el.unrender && !options.preventUnrender) {
                el.unrender();
            }
            el.off(null, null, this);
            kijs.Array.remove(this._elements, el);
        }, this);

        // Falls der DOM gemacht ist, wird neu gerendert.
        if (this.dom.node && !options.preventRender) {
            this.render();
        }

        // Gelöscht, Event auslösen.
        if (!options.preventEvents) {
            this.raiseEvent('remove');
        }
    }

    /**
     * Entfernt alle Kind-Elemente (siehe remove())
     * @param {Object} [options={}]   Optionen wie bei remove()
     * @returns {undefined}
     */
    removeAll(options={}) {
        if (this._elements && this._elements.length > 0) {
            this.remove(this._elements, options);
        }
    }

    /**
     * Rendert den Container, innerDom und alle Kind-Elemente und löst afterRender aus.
     * @param {Boolean} [superCall=false]   true beim Aufruf aus einer abgeleiteten Klasse (dann kein afterRender)
     * @returns {undefined}
     */
    // overwrite
    render(superCall) {
        super.render(true);

        // innerDOM rendern
        this._innerDom.renderTo(this._dom.node);

        // Render der Elemente als Funktion, damit dies
        // in Vererbungen überschrieben werden könnte.
        this._renderElements();

        // Event afterRender auslösen
        if (!superCall) {
            this.raiseEvent('afterRender');
        }
    }

    /**
     * Sortiert die Kind-Elemente mit einer Funktion. Der Funktion werden
     * zwei Elemente zum Vergleich übergeben, die Funktion
     * muss 1, 0 oder -1 zurückgeben, wenn a grösser, gleich oder kleiner b ist.
     *
     * Ist der Container gerendert, werden die Elemente in der neuen Reihenfolge gerendert.
     * @param {Function} compareFn
     * @param {Object|null} [context=null]   Kontext der Funktion. Default: der Container
     * @returns {undefined}
     */
    sort(compareFn, context=null) {
        if (kijs.isFunction(compareFn)) {
            this._elements.sort((a, b) => {
                return compareFn.call(context || this, a, b);
            });

            // elemente in der neuen Reihenfolge rendern.
            if (this.isRendered) {
                this._renderElements();
            }
        }
    }

    /**
     * Entfernt den Container und alle Kind-Elemente aus dem DOM und löst unrender aus.
     * @param {Boolean} [superCall=false]   true beim Aufruf aus einer abgeleiteten Klasse (dann kein unrender-Event)
     * @returns {undefined}
     */
    // overwrite
    unrender(superCall) {
        // Event auslösen.
        if (!superCall) {
            this.raiseEvent('unrender');
        }
        
        if (this._elements) {
            kijs.Array.each(this._elements, function(el) {
                el.unrender();
            }, this);
        }
        
        if (this._innerDom) {
            this._innerDom.unrender();
        }
        
        super.unrender(true);
    }


    // PROTECTED
    /**
     * Gibt eine Instanz des Elements zurück, das hinzugefügt werden soll.
     * Falls ein xtype angegeben wird, wird eine neue instanz erstellt.
     * @param {kijs.gui.Element|Object} obj
     * @returns {kijs.gui.Element}
     */
    _getInstanceForAdd(obj) {
        // String (Kurzform für einen xtype)
        if (kijs.isString(obj)) {
            switch (obj) {
                // '-' -> kijs.gui.Separator
                case '-':
                    obj = new kijs.gui.Separator({});
                    break;
                    
                // '>' -> kijs.gui.Spacer
                case '>':
                    obj = new kijs.gui.Spacer({});
                    break;
            }
        }
        
        // Falls eine Instanz übergeben wird
        if (obj instanceof kijs.gui.Element) {
            // Da das Element bereits erstellt wurde, werden hier keine defaults übernommen

            // Parent zuweisen
            obj.parent = this;

        // Falls ein Config-Objekt übergeben wird
        } else  if (kijs.isObject(obj)) {
            
            // defaults
            if (!kijs.isEmpty(this._defaults)) {
                
                // Damit unbekannte defaults keinen Fehler auslösen, die Namen der
                // defaults in die skipUnknownConfigs schreiben
                this._defaults.skipUnknownConfigs = Object.getOwnPropertyNames(this._defaults);
                
                // defaults in die config übernehmen. 
                // Bereits vorhandene Eigenschaften werden nicht verändert.
                kijs.Object.assignDeep(obj, this._defaults, false);
                
                // Defaults wiederum als defaults weitergeben, damit evtl. vorhandene subElements diese auch übernehmen können
                /*if (kijs.isObject(obj.defaults)) {
                    kijs.Object.assignDeep(obj.defaults, this._defaults, false);
                } else {
                    obj.defaults = kijs.Object.clone(this._defaults);
                }*/
            }

            // xtype vorhanden?
            if (!kijs.isString(obj.xtype)) {
                throw new kijs.Error(`config missing "xtype".`);
            }

            // Konstruktor ermitteln
            const constr = kijs.getObjectFromString(obj.xtype);
            if (!kijs.isFunction(constr)) {
                throw new kijs.Error(`Unknown xtype "${obj.xtype}".`);
            }
            
            // Parent zuweisen
            obj.parent = this;

            // Element erstellen
            obj = new constr(obj);

        // Ungültige Übergabe
        } else {
            throw new kijs.Error(`kijs.gui.Container: invalid element: ` + typeof obj);
            
        }

        return obj;
    }

    /**
     * Rendert die elements in den innerDom.
     */
    _renderElements() {
        // elements im innerDOM rendern
        kijs.Array.each(this._elements, function(el) {
            el.renderTo(this._innerDom.node);
        }, this);
    }

    /**
     * Entfernt alle elements und fügt neue hinzu.
     * Wird intern von der config elements verwendet
     * @param {Object|Array} elements
     * @returns {undefined}
     */
    _replaceElements(elements) {
        // Bestehende Elemente löschen
        this.removeAll({
            preventRender: true
        });

        // Neue Elemente hinzufügen
        this.add(elements, null);
    }


    // PRIVATE
    // LISTENERS
    /**
     * Listener der aufgerufen wird, wenn sich die Grösse eines untergeordneten Elements ändert
     * PRIVATE! Bitte diese Funktion nicht vererben, sondern Listener verwenden!
     * @param {Object} e
     * @returns {undefined}
     */
    #onChildElementAfterResize(e) {
        // Endlosschlaufe verhindern: wenn der Event von dieser Klasse ausgelöst wurde,
        // den Event nicht erneut auslösen
        if (e.raiseElement === this) {
            return;
        }

        this.raiseEvent('childElementAfterResize', {childElement: e.element});
    }



    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    /**
     * Gibt den Container und alle Kind-Elemente frei (siehe kijs.gui.Element.destruct)
     * @param {Boolean} [superCall=false]   true beim Aufruf aus einer abgeleiteten Klasse
     * @returns {undefined}
     */
    // overwrite
    destruct(superCall) {
        if (!superCall) {
            // unrender
            this.unrender(superCall);

            // Event auslösen.
            this.raiseEvent('destruct');
        }

        // Elemente/DOM-Objekte entladen
        if (this._elements) {
            kijs.Array.each(this._elements, function(el) {
                if (el && el.destruct) {
                    el.destruct();
                }
            }, this);
        }
        if (this._innerDom) {
            this._innerDom.destruct();
        }

        // Variablen (Objekte/Arrays) leeren
        this._defaults = null;
        this._elements = null;
        this._innerDom = null;

        // Basisklasse entladen
        super.destruct(true);
    }
    
};
