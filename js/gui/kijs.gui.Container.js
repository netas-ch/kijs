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
 * remove                               Löscht ein oder mehrere untergeordenete Elemente
 *  Args:
 *   elements    Object|Array
 *
 * removeAll                            Löscht alle untergeordeneten Elemente
 *
 * down                                 Durchläuft den Element-Baum nach unten und gibt das erste Element zurück,
 *  Args:                               dass mit dem Namen (Eigenschaft 'name') übereinstimmt.
 *   name       String
 *  Return: kijs.gui.Element|Null
 *
 * downX                                Durchläuft den Element-Baum nach unten und gibt das erste Element zurück,
 *  Args:                               dass mit dem Klassennamen (Eigenschaft 'xtype') übereinstimmt.
 *   xtype      String
 *  Return: kijs.gui.Element|Null
 *
 *
 * EIGENSCHAFTEN (es gelten auch die Eigenschaften der Basisklassen)
 * -------------
 * innerDom     HTML-Element            Verweis auf den inneren dom-Node
 *
 * elements     Array                   Array mit den untergeordeten elements
 *
 * isEmpty      Boolean (readonly)
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
 * wheel
 *
 * // key events
 * keyDown
 * enterPress
 * enterEscPress
 * escPress
 * spacePress
 */
kijs.gui.Container = class kijs_gui_Container extends kijs.gui.Element {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
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
            autoScroll: { target: 'autoScroll' },
            defaults: true,
            html: { target: 'html', context: this._innerDom },
            htmlDisplayType: { target: 'htmlDisplayType', context: this._innerDom },
            innerCls: { fn: 'function', target: this._innerDom.clsAdd, context: this._innerDom },
            innerStyle : { fn: 'assign', target: 'style', context: this._innerDom },

            elements: { prio: 1000, fn: 'function', target: this.add, context: this }
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
    get autoScroll() { return this._innerDom.clsHas('kijs-autoscroll'); }
    set autoScroll(val) {
        if (val) {
            this._innerDom.clsAdd('kijs-autoscroll');
        } else {
            this._innerDom.clsRemove('kijs-autoscroll');
        }
    }

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



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    /**
     * Fügt ein oder mehrere Elemente hinzu.
     * @param {Object|Array} elements
     * @param {Number} [index=null] Position an der Eingefügt werden soll null=am Schluss
     * @returns {undefined}
     */
    add(elements, index=null) {
        if (!kijs.isArray(elements)) {
            elements = [elements];
        }

        const newElements = [];
        for (let i=0,len=elements.length; i<len; i++) {
            let el = this._getInstanceForAdd(elements[i]);
            if (el && !kijs.Array.contains(this._elements, el)) {
                el.on('afterResize', this._onChildElementAfterResize, this);
                newElements.push(el);
            }
        }
        elements = null;

        // event ausführen
        if (this.raiseEvent('beforeAdd', {elements: newElements}) === false) {
            return;
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
        if (this._innerDom.node) {
            this.render();
        }

        // Hinzugefügt, Event auslösen.
        this.raiseEvent('add', {elements: newElements});
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
        } else  {
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
        } else  {
            return null;
        }
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
    getElements(deep=-1) {
        let ret = [];

        // elements im aktuellen Container
        kijs.Array.each(this._elements, function(el) {
            ret.push(el);
        }, this);

        // rekursiv unterelemente hinzufügen
        if (deep !== 0) {
            if (deep>0) {
                deep--;
            }
            kijs.Array.each(this._elements, function(el) {
                if (kijs.isFunction(el.getElements)) {
                    let retSub = el.getElements(deep);
                    if (!kijs.isEmpty(retSub)) {
                        ret = ret.concat(retSub);
                    }
                }
            }, this);
        }

        return ret;
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

        // Evtl. untergeordnete Container rekursiv duchsuchen
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
     * @returns {undefined}
     */
    remove(elements) {
        if (!kijs.isArray(elements)) {
            elements = [elements];
        }

        const removeElements = [];
        for (let i=0,len=elements.length; i<len; i++) {
            if (kijs.Array.contains(this._elements, elements[i])) {
                removeElements.push(elements[i]);
            }
        }
        elements = null;

        // event ausführen
        if (this.raiseEvent('beforeRemove', {elements: removeElements}) === false) {
            return;
        }

        // löschen
        kijs.Array.each(removeElements, function(el) {
            el.off(null, null, this);
            if (el.unrender) {
                el.unrender();
            }
            kijs.Array.remove(this._elements, el);
        }, this);

        // Falls der DOM gemacht ist, wird neu gerendert.
        if (this.dom) {
            this.render();
        }

        // Gelöscht, Event auslösen.
        this.raiseEvent('remove');
    }

    /**
     * Löscht alle untergeordeneten Elemente
     * @param {Boolean} [preventRender=false]
     * @returns {undefined}
     */
    removeAll(preventRender) {
        // event ausführen
        if (this.raiseEvent('beforeRemove', {elements: this._elements}) === false) {
            return;
        }

        // leeren
        kijs.Array.each(this._elements, function(el) {
            el.off(null, null, this);
            if (el.unrender) {
                el.unrender();
            }
        }, this);
        kijs.Array.clear(this._elements);

        // Falls der DOM gemacht ist, wird neu gerendert.
        if (this.dom && !preventRender) {
            this.render();
        }

        // Gelöscht, Event ausführen
        this.raiseEvent('remove');
    }



    // overwrite
    render(superCall) {
        super.render(true);

        // innerDOM rendern
        this._innerDom.renderTo(this._dom.node);

        // elements im innerDOM rendern
        kijs.Array.each(this._elements, function(el) {
            el.renderTo(this._innerDom.node);
        }, this);


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

        kijs.Array.each(this._elements, function(el) {
            el.unrender();
        }, this);

        this._innerDom.unrender();

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
        // Falls eine Instanz übergeben wird
        if (obj instanceof kijs.gui.Element) {
            // Da das Element bereits erstellt wurde, werden hier keine defaults übernommen

            // Parent zuweisen
            obj.parent = this;

        // Falls ein Config-Objekt übergeben wird
        } else  if (kijs.isObject(obj)) {

            // defaults
            if (!kijs.isEmpty(this._defaults)) {
                // Bei unbekannten defaults soll kein Fehler ausgelöst werden
                this._defaults.skipUnknownConfig = true;

                // defaults in die config übernehmen. Bereits vorhandene Eigenschaften werden nicht verändert.
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
            const constr = kijs.gui.getClassFromXtype(obj.xtype);
            if (!kijs.isFunction(constr)) {
                throw new kijs.Error(`Unknown xtype "${obj.xtype}".`);
            }

            // Parent zuweisen
            obj.parent = this;

            // Element erstellen
            obj = new constr(obj);
            
        // Ungültige Übergabe
        } else {
            throw new kijs.Error(`kijs.gui.Container: invalid element.`);
        }

        return obj;
    }


    // LISTENERS
    /**
     * Listener der aufgerufen wird, wenn sich die Grösse eines untergeordneten Elements ändert
     * @param {Object} e
     * @returns {undefined}
     */
    _onChildElementAfterResize(e) {
        this.raiseEvent('childElementAfterResize', {childElement: e.element});
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
