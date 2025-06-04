/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.Container
// --------------------------------------------------------------
/**
 * Container Element, welches untergeordnete Elemente beinhalten kann.
 * Das Element besteht aus zwei ineinanderliegenden dom-Nodes.
 *
 * KLASSENHIERARCHIE
 * kijs.gui.Element
 *  kijs.gui.Container
 *
 * CONFIG-Parameter (es gelten auch die Config-Parameter der Basisklassen)
 * ----------------
 * defaults     Object [optional]       Objekt mit Config-Parameter, die bei allen untergeordneten elements
 *                                      angewendet werden.
 *
 * clsInner     Array|String [optional] CSS-Klassennamen für den inneren dom-Node
 *                                      Beispiel: clsInner:['cls-a','cls-b'] oder cls:'cls-a cls-b'
 *
 * styleInner   Object [optional]       Objekt mit CSS-Style Anweisungen als Javascript für das innere dom-Element
 *                                      Beispiel: styleInner:{background-color:'#ff8800'}
 *
 * elements     Array|Object            Array mit den untergeordneten elements.
 *                                      Es können sowohl Config-Objekte, als auch Instanzen der Klasse im Array sein.
 *                                      Beispiel: elements:[
 *                                          {
 *                                              xtype: 'kijs.gui.Element',
 *                                              html: 'Hello World'
 *                                          }, new kijs.gui.Element({
 *                                              html: 'Hallo Welt'
 *                                          })
 *                                      ]
 *
 * scrollableX  Boolean|String [optional] default=false     Soll auf der X-Achse gescrollt werden können?
 *                                                          true=Ja, false=Nein, 'auto'=wenn erforderlich
 *
 * scrollableY  Boolean|String [optional] default=false     Soll auf der Y-Achse gescrollt werden können?
 *                                                          true=Ja, false=Nein, 'auto'=wenn erforderlich
 *
 *
 * FUNKTIONEN (es gelten auch die Funktionen der Basisklassen)
 * ----------
 * addClsInner                          Fügt eine oder mehrere CSS-Klassen zum inneren dom-Node hinzu
 *  Args: cls   String|Array
 *
 * hasClsInner                          Überprüft, ob der innere dom-Node eine CSS-Klasse hat
 *  Args:
 *   cls        String
 *  Return: Boolean
 *
 * removeClsInner                       Entfernt eine oder mehrere CSS-Klassen vom inneren dom-Node
 *  Args:
 *   cls        String|Array
 *
 *
 * add                                  Fügt ein oder mehrere Elemente hinzu
 *  Args:
 *   elements   Array|Object            Es können sowohl Config-Objekte, als auch Instanzen der Klasse im Array sein.
 *   before     Number|Function [optional]  Index der Position oder Verweis auf das Element, vor dem eingefügt werden soll.
 *   options
 *
 * getElementsByName                    Gibt untergeordnete Elemente aufgrund ihres 'name' zurück
 *  Args:
 *   name       String
 *   deep       Number [optional] default=-1 Gewünschte Suchtiefe
 *                                            0=nur im aktuellen Container
 *                                            1=im aktuellen Container und in deren untergeordneten
 *                                            2=im aktuellen Container, deren untergeordneten und deren untergeordneten
 *                                            n=...
 *                                            -1=unendlich
 *   breakOnFirst {Boolean} [optional] default=false Soll nur das Erste Element zurückgegeben werden?
 *  Return: Array
 *
 * getElementsByXtype                   Gibt untergeordnete Elemente aufgrund ihres 'xtype' zurück
 *  Args:
 *   xtype      String
 *   deep       Number [optional] default=-1 Gewünschte Suchtiefe
 *                                            0=nur im aktuellen Container
 *                                            1=im aktuellen Container und in deren untergeordneten
 *                                            2=im aktuellen Container, deren untergeordneten und deren untergeordneten
 *                                            n=...
 *                                            -1=unendlich
 *   breakOnFirst {Boolean} [optional] default=false Soll nur das Erste Element zurückgegeben werden?
 *  Return: Array
 *
 * hasChild                             Überprüft, ob ein untergeordnetes Element existiert
 *  Args:
 *   element    kijs.gui.Element
 *  Return: Boolean
 *
 * remove                               Löscht ein oder mehrere untergeordnete Elemente
 *  Args:
 *   elements    Object|Array
 *   options
 *
 * removeAll                            Löscht alle untergeordneten Elemente
 *  Args:
 *   options
 *   
 * down                                 Durchläuft den Element-Baum nach unten und gibt das erste Element zurück,
 *  Args:                               dass mit dem Namen (Eigenschaft 'name') übereinstimmt.
 *   name       String
 *  Return: kijs.gui.Element|null
 *
 * downX                                Durchläuft den Element-Baum nach unten und gibt das erste Element zurück,
 *  Args:                               dass mit dem Klassennamen (Eigenschaft 'xtype') übereinstimmt.
 *   xtype      String
 *  Return: kijs.gui.Element|null
 *
 *
 * EIGENSCHAFTEN (es gelten auch die Eigenschaften der Basisklassen)
 * -------------
 * innerDom     HTML-Element            Verweis auf den inneren dom-Node
 *
 * elements     Array                   Array mit den untergeordneten Elementen
 *
 * isEmpty      Boolean (readonly)
 *
 * scrollableX  Boolean|String [optional] default=false     Soll auf der X-Achse gescrollt werden können?
 *                                                          true=Ja, false=Nein, 'auto'=wenn erforderlich
 *
 * scrollableY  Boolean|String [optional] default=false     Soll auf der Y-Achse gescrollt werden können?
 *                                                          true=Ja, false=Nein, 'auto'=wenn erforderlich
 *
 *
 * EVENTS
 * ----------
 * add
 * beforeAdd
 * beforeRemove
 * childElementAfterResize
 * remove
 *
 * // Geerbte Events
 * afterFirstRenderTo
 * afterRender
 * afterResize
 * changeVisibility
 * click
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
 * mouseEnter
 * mouseLeave
 * mouseMove
 * mouseUp
 * singleClick
 * touchStart
 * touchEnd
 * touchMove
 * touchCancel
 * unrender
 * wheel
 *
 * // key events
 * keyDown
 * keyUp
 * keyPress
 * enterPress
 * enterEscPress
 * escPress
 * spacePress
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
            innerCls: { fn: 'function', target: this._innerDom.clsAdd, context: this._innerDom },
            innerStyle : { fn: 'assign', target: 'style', context: this._innerDom },

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
    get defaults() { return this._defaults; }
    set defaults(val) { this._defaults = val; }
    
    get elements() { return this._elements; }

    get firstChild() {
        if (this._elements.length > 0) {
            return this._elements[0];
        }
        return null;
    }

    // overwrite
    get html() { return this._innerDom.html; }
    set html(val) { this._innerDom.html = val; }

    // overwrite
    get htmlDisplayType() { return this._innerDom.htmlDisplayType; }
    set htmlDisplayType(val) { this._innerDom.htmlDisplayType = val; }

    get innerDom() { return this._innerDom; }

    get lastChild() {
        if (this._elements.length > 0) {
            return this._elements[this._elements.length-1];
        }
        return null;
    }

    // overwrite
    get isEmpty() { return this._innerDom.isEmpty && kijs.isEmpty(this._elements); }


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
     * Fügt ein oder mehrere Elemente hinzu.
     * @param {Object|Array} elements
     * @param {Number} [index=null] Position an der Eingefügt werden soll null=am Schluss
     * @param {Object} [options={}]
     *  options Eigenschaften:
     *    {Boolean} [preventRender=false]   render verhindern?
     *    {Boolean} [preventEvents=false]   Das Auslösen des beforeAdd und add-Events verhindern?
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
     * @returns {kijs_gui_Element|null}
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
     * @returns {kijs_gui_Element|null}
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
     * @param {Number} deep [optional] default=-1    Gewünschte Suchtiefe
     *                                               0=nur im aktuellen Container
     *                                               1=im aktuellen Container und in deren untergeordneten
     *                                               2=im aktuellen Container, deren untergeordneten und deren untergeordneten
     *                                               n=...
     *                                               -1=unendlich
     * @param {Boolean} breakOnFirst [optional] default=false Soll nur das erste Element zurückgegeben werden?
     * @returns {Array}
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
     * @param {Number} deep [optional] default=-1    Gewünschte Suchtiefe
     *                                               0=nur im aktuellen Container
     *                                               1=im aktuellen Container und in deren untergeordneten
     *                                               2=im aktuellen Container, deren untergeordneten und deren untergeordneten
     *                                               n=...
     *                                               -1=unendlich
     * @param {Boolean} breakOnFirst [optional] default=false Soll nur das erste Element zurückgegeben werden?
     * @returns {Array}
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
     * @param {Number} [deep]         default=-1    Gewünschte Suchtiefe
     *                                              0=nur im aktuellen Container
     *                                              1=im aktuellen Container und in deren untergeordneten
     *                                              2=im aktuellen Container, deren untergeordneten und deren untergeordneten
     *                                              n=...
     *                                              -1=unendlich
     * @returns {Array}
     */
    getElementsRec(deep=-1) {
        let ret = [];

        // elements im aktuellen Container werden zuerst zurückgegeben
        kijs.Array.each(this._elements, function(el) {
            ret.push(el);
        }, this);

        // Evtl. untergeordnete Container rekursiv duchsuchen
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
        return kijs.Array.contains(this._elements, element);
    }

    /**
     * Löscht ein oder mehrere untergeordnete Elemente
     * @param {Object|Array} elements
     * @param {Object} [options={}]
     *  options Eigenschaften:
     *    {Boolean} [preventDestruct=false] desctruct verhindern?
     *    {Boolean} [preventUnrender=false] unrender verhindern?
     *    {Boolean} [preventRender=false]   render verhindern?
     *    {Boolean} [preventEvents=false]   Das Auslösen des beforeRemove und remove-Events verhindern?
     * @param {Boolean} [superCall=false]
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
     * Löscht alle untergeordneten Elemente
     * @param {Object} [options={}]
     *  options Eigenschaften:
     *    {Boolean} [preventDestruct=false] desctruct verhindern?
     *    {Boolean} [preventUnrender=false] unrender verhindern?
     *    {Boolean} [preventRender=false]   render verhindern?
     *    {Boolean} [preventEvents=false]   Das Auslösen des beforeRemove und remove-Events verhindern?
     * @returns {undefined}
     */
    removeAll(options={}) {
        if (this._elements && this._elements.length > 0) {
            this.remove(this._elements, options);
        }
    }

    /**
     * Sortiert die Elemente mit einer Funktion. Der Funktion werden
     * zwei Elemente zum Vergleich übergeben, die Funktion
     * muss 1, 0 oder -1 zurückgeben, wenn a grösser, gleich oder kleiner b ist.
     * @param {Function} compareFn
     * @param {Object|null} context
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



    // PRVATE
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
