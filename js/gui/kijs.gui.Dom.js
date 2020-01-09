/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.Dom
// --------------------------------------------------------------
/**
 * Hilfsobjekt zum Handeln von DOM-Nodes
 *
 * CONFIG-Parameter
 * ----------------
 * cls          Array|String [optional] CSS-Klassennamen
 *                                      Beispiel: cls:['cls-a','cls-b'] oder cls:'cls-a cls-b'
 *
 * disabled     Boolean
 *
 * disableEnterBubbeling Boolean [optional] Stoppt das Bubbeling der KeyDown-Events von Enter
 *
 * disableEscBubbeling Boolean [optional] Stoppt das Bubbeling der KeyDown-Events von Escape
 *
 * eventMap     Object [optional]
 *
 * html         String [optional]       HTML-Code, der in das Element eingefügt wird
 *                                      Beispiel: html:'<p>Hallo Welt</p>'
 *
 * htmlDisplayType String [optional]    Darstellung der Eigenschaft 'html'. Default: 'html'
 *                                      html: als html-Inhalt (innerHtml)
 *                                      code: Tags werden als als Text angezeigt
 *                                      text: Tags werden entfernt
 *
 * nodeAttribute Object [optional]      Eigenschaften, die in den Node übernommen werden sollen. Bsp: { id: 123, for: 'meinFeld' }
 *
 * nodeTagName  String [optional]       Tag-Name des DOM-node. Default='div'
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
 * style        Object [optional]       Objekt mit CSS-Style Anweisungen als Javascript
 *                                      Beispiel: style:{background-color:'#ff8800'}
 *
 *
 * FUNKTIONEN
 * ----------
 * alignToTarget                        Richtet ein Element nach einem Ziel-Element aus.
 * applyConfig                          Wendet ein Konfigurations-Objekt an
 *  Args:
 *   config     Object
 *
 * destruct                             Destruktor ->Entlädt das Objekt samt allen untergeordneten Objekten
 *
 * clsAdd                                  Fügt eine oder mehrere CSS-Klassen hinzu
 *  Args: cls   String|Array
 *
 * clsHas                                  Überprüft, ob das Element eine CSS-Klasse hat
 *  Args:
 *   cls        String
 *  Return: Boolean
 *
 * clsRemove                               Entfernt eine oder mehrere CSS-Klassen
 *  Args:
 *   cls        String|Array
 *
 * clsRemoveAll                            Entfernt alle CSS-Klassen
 *
 * clsToggle                               Schaltet die übergebenen CSS-Klassen ein oder aus
 *  Args:
 *   cls        String|Array
 *
 * keyEventAdd                              Erstellt einen Tastendruck-Listener
 *  Args:
 *   keys       Number|Array                Tastencode der Taste, oder Array mit Tastencodes. Bsp: [kijs.KeyMap.keys.ENTER, 65, 66]
 *   fn         Function|String             Funktion oder Name des kijs-Events das ausgelöst werden soll
 *   context     [kijs.gui.Element|kijs.gui.Dom]  Kontext
 *   modifier    [Object]                   Muss eine Modifier-Taste gedrückt sein? null=egal
 *                                          modifier={shift:null, ctrl:false, alt:false}
 *   stopPropagation [Boolean]              Bubbeling ausschalten?
 *   preventDefault   [Boolean]             Listeners vom Browser deaktivieren?
 *
 * keyEventStopBubbeling                    Stoppt das Bubbeling der KeyDown-Events
 *  Args:
 *   keys           Array                   Array mit KeyCodes Bsp: [kijs.KeyMap.ENTER, kijs.KeyMap.ESC]
 *   modifier       [modifier]              Muss eine Modifier-Taste gedrückt sein?
 *                                          modifier = {shift:false, ctrl:false, alt:false}]
 *
 * nodeAttributeGet                         Gibt den Wert einer Eigenschaft des DOM-Nodes zurück
 *  Args:
 *   name           String
 *  Return: Boolean
 *
 * nodeAttributeSet                         Fügt eine Eigenschaft zum DOM-Node hinzu
 *  Args:
 *   name           String
 *   value          String|Null
 *
 * nodeAttributeHas                         Überprüft, ob der DOM-Node eine Eigenschaft bestimmte hat
 *  Args:
 *   name           String
 *
 * nodeAttributeRemove                      Entfernt eine Eigenschaft vom DOM-Node
 *  Args:
 *   name           String
 *
 * render                               rendert den DOM-Node
 *
 * renderTo                             rendert den DOM-Node und fügt ihn einem Parent-DOM-Node hinzu
 *  Args:
 *   targetNode    HTMLElement
 *   insertBefore  HTMLElement [optional]
 *
 *
 * EIGENSCHAFTEN
 * -------------
 * disabled
 * disableEnterBubbeling
 * disableEscBubbeling
 * height
 * html
 * htmlDisplayType
 * isEmpty          Boolean (readonly)
 * isRendered       Boolean (readonly)
 * left
 * node             HTML-Element            Verweis auf den DOM-Node
 * nodeTagName
 * style
 * top
 * width
 */
kijs.gui.Dom = class kijs_gui_Dom extends kijs.Observable {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        this._cls = [];
        this._disableEnterBubbeling = false;
        this._disableEscBubbeling = false;
        this._html = undefined;
        this._htmlDisplayType = 'html', // Darstellung der Eigenschaft 'html'. Default: 'html'
                                        // html: als html-Inhalt (innerHtml)
                                        // code: Tags werden als als Text angezeigt
                                        // text: Tags werden entfernt

        this._node = null;

        this._nodeEventListeners = {}; // Delegates der DOM-Node Events, die mit kijs.Dom.addEventListener gesetzt wurden
                                        // {
                                        //     click: [
                                        //         {node: ..., useCapture: true/false, delegate: ...},
                                        //         {node: ..., useCapture: true/false, delegate: ...}
                                        //     ],
                                        //
                                        //     mousemove: [
                                        //         {node: ..., useCapture: true/false, delegate: ...},
                                        //         {node: ..., useCapture: true/false, delegate: ...}
                                        //     ]
                                        // }

        this._defaultConfig = {};

        this._disabled = false;

        this._nodeAttribute = {};

        this._left = undefined;
        this._top = undefined;
        this._width = undefined;
        this._height = undefined;

        this._nodeTagName = 'div';

        this._style = {};

        this._toolTip = null;

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        this._configMap = {
            cls: { fn: 'function', target: this.clsAdd },
            disabled: true,
            disableEnterBubbeling: { target: 'disableEnterBubbeling' },
            disableEscBubbeling: { target: 'disableEscBubbeling' },
            eventMap: { fn: 'assign' },
            html: true,
            htmlDisplayType: true,
            left: true,
            top: true,
            width: true,
            height: true,
            nodeAttribute: { fn: 'assign' },
            nodeTagName: true,
            on: { fn: 'assignListeners' },
            style : { fn: 'assign' },
            toolTip: { target: 'toolTip' }
        };

        // Mapping das aussagt, welche DOM-Node-Events bei welchem kijs-Event abgefragt werden sollen
        this._eventMap = {
            blur: { nodeEventName: 'blur', useCapture: false },
            change: { nodeEventName: 'change', useCapture: false },
            click: { nodeEventName: 'click', useCapture: false },
            dblClick: { nodeEventName: 'dblclick', useCapture: false },
            drag: { nodeEventName: 'drag', useCapture: false },
            dragEnd: { nodeEventName: 'dragend', useCapture: false },
            dragEnter: { nodeEventName: 'dragenter', useCapture: false },
            dragExit: { nodeEventName: 'dragexit', useCapture: false },
            dragLeave: { nodeEventName: 'dragleave', useCapture: false },
            dragOver: { nodeEventName: 'dragover', useCapture: false },
            dragStart: { nodeEventName: 'dragstart', useCapture: false },
            drop: { nodeEventName: 'drop', useCapture: false },
            focus: { nodeEventName: 'focus', useCapture: false },
            mouseDown: { nodeEventName: 'mousedown', useCapture: false },
            mouseEnter: { nodeEventName: 'mouseenter', useCapture: false },
            mouseLeave: { nodeEventName: 'mouseleave', useCapture: false },
            mouseMove: { nodeEventName: 'mousemove', useCapture: false },
            mouseUp: { nodeEventName: 'mouseup', useCapture: false },
            scroll: { nodeEventName: 'scroll', useCapture: false },
            touchStart: { nodeEventName: 'touchstart', useCapture: false },
            wheel: { nodeEventName: 'wheel', useCapture: false },

            // key events
            input: { nodeEventName: 'input', useCapture: false },
            keyDown: { nodeEventName: 'keydown', useCapture: false },
            keyUp: { nodeEventName: 'keyup', useCapture: false },
            enterPress: {
                nodeEventName: 'keydown',       // Node-Event Name
                keys: [kijs.keys.ENTER],        // Bei welchen Tasten soll das Event ausgelöst werden?
                shiftKey: null,                 // Muss dazu shift gedrückt werden? (null=egal)
                ctrlKey: null,                  // Muss dazu ctgrl gedrückt werden? (null=egal)
                altKey: null,                   // Muss dazu alt gedrückt werden? (null=egal)
                usecapture: false               // Soll das Event in der Capturing- statt der Bubbeling-Phase ausgelöst werden?
            },
            enterEscPress: {
                nodeEventName: 'keydown',       // Node-Event Name
                keys: [kijs.keys.ENTER, kijs.keys.ESC], // Bei welchen Tasten soll das Event ausgelöst werden?
                shiftKey: null,                 // Muss dazu shift gedrückt werden? (null=egal)
                ctrlKey: null,                  // Muss dazu ctgrl gedrückt werden? (null=egal)
                altKey: null,                   // Muss dazu alt gedrückt werden? (null=egal)
                usecapture: false               // Soll das Event in der Capturing- statt der Bubbeling-Phase ausgelöst werden?
            },
            escPress: {
                nodeEventName: 'keydown',       // Node-Event Name
                keys: [kijs.keys.ESC],          // Bei welchen Tasten soll das Event ausgelöst werden?
                shiftKey: null,                 // Muss dazu shift gedrückt werden? (null=egal)
                ctrlKey: null,                  // Muss dazu ctgrl gedrückt werden? (null=egal)
                altKey: null,                   // Muss dazu alt gedrückt werden? (null=egal)
                usecapture: false               // Soll das Event in der Capturing- statt der Bubbeling-Phase ausgelöst werden?
            },
            spacePress: {
                nodeEventName: 'keydown',       // Node-Event Name
                keys: [kijs.keys.SPACE],        // Bei welchen Tasten soll das Event ausgelöst werden?
                shiftKey: null,                 // Muss dazu shift gedrückt werden? (null=egal)
                ctrlKey: null,                  // Muss dazu ctgrl gedrückt werden? (null=egal)
                altKey: null,                   // Muss dazu alt gedrückt werden? (null=egal)
                usecapture: false               // Soll das Event in der Capturing- statt der Bubbeling-Phase ausgelöst werden?
            }
        };

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config);
        }
    }


    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get disabled() {
        if (this._node) {
            return !!this._node.disabled;
        } else {
            return this._disabled;
        }
    }
    set disabled(val) {
        this._disabled = !!val;

        if (this._node) {
            this._node.disabled = !!val;
        }
        if (this._toolTip) {
            this._toolTip.disabled = !!val;
        }
    }

    /**
     * Stoppt das Bubbeling der KeyDown-Events von Enter
     * @returns {Boolean}
     */
    get disableEnterBubbeling() { return this._disableEnterBubbeling;  }
    set disableEnterBubbeling(val) {
        this._disableEnterBubbeling = val;
        if (val) {
            this.on('enterPress', this._onKeyPressStopBubbeling, this);
        } else {
            this.off('enterPress', this._onKeyPressStopBubbeling, this);
        }
    }

    /**
     * Stoppt das Bubbeling der KeyDown-Events von Escape
     * @returns {Boolean}
     */
    get disableEscBubbeling() { return this._disableEscBubbeling;  }
    set disableEscBubbeling(val) {
        this._disableEscBubbeling = val;
        if (val) {
            this.on('escPress', this._onKeyPressStopBubbeling, this);
        } else {
            this.off('escPress', this._onKeyPressStopBubbeling, this);
        }
    }

    /**
     * Wurde die Eigenschaft "left" manuell zugewiesen?
     * @returns {Boolean}
     */
    get hasLeft() {
        if (this._node) {
            return !kijs.isEmpty(this._node.style.left);
        } else {
            return !kijs.isEmpty(this._left);
        }
    }

    /**
     * Wurde die Eigenschaft "height" manuell zugewiesen?
     * @returns {Boolean}
     */
    get hasHeight() {
        if (this._node) {
            return !kijs.isEmpty(this._node.style.height);
        } else {
            return !kijs.isEmpty(this._height);
        }
    }

    /**
     * Wurde die Eigenschaft "top" manuell zugewiesen?
     * @returns {Boolean}
     */
    get hasTop() {
        if (this._node) {
            return !kijs.isEmpty(this._node.style.top);
        } else {
            return !kijs.isEmpty(this._top);
        }
    }

    /**
     * Wurde die Eigenschaft "width" manuell zugewiesen?
     * @returns {Boolean}
     */
    get hasWidth() {
        if (this._node) {
            return !kijs.isEmpty(this._node.style.width);
        } else {
            return !kijs.isEmpty(this._width);
        }
    }

    get height() {
        if (this._node) {
            return this._node.offsetHeight;
        } else {
            return this._height;
        }
    }
    set height(val) {
        if (kijs.isEmpty(val)) {
            val = null;
        }
        if (val !== null && !kijs.isNumeric(val)) {
            throw new kijs.Error('set height(x). x must be numeric.');
        }

        this._height = val;

        if (this._node) {
            if (!kijs.isEmpty(val)) {
                val += 'px';
            }
            this._node.style.height = val;
        }
    }

    get html() { return this._html; }
    set html(val) {
        this._html = val;
        if (this._node) {
            kijs.Dom.setInnerHtml(this._node, this._html, this._htmlDisplayType);
        }
    }

    get htmlDisplayType() { return this._htmlDisplayType; }
    set htmlDisplayType(val) { this._htmlDisplayType = val; }

    get isEmpty() { return kijs.isEmpty(this.html); }

    get isRendered() { return !!this._node; }

    get left() {
        if (this._node) {
            return this._node.offsetLeft;
        } else {
            return this._left;
        }
    }
    set left(val) {
        if (kijs.isEmpty(val)) {
            val = null;
        }
        if (val !== null && !kijs.isNumeric(val)) {
            throw new kijs.Error('set left(x). x must be numeric.');
        }

        this._left = val;

        if (this._node) {
            if (!kijs.isEmpty(val)) {
                val += 'px';
            }
            this._node.style.left = val;
        }
    }

    get node() { return this._node; }
    set node(val) { this._node = val; }

    get nodeTagName() { return this._nodeTagName; }
    set nodeTagName(val) {
        this._nodeTagName = val;

        if (!this._node) {
            this._nodeTagName = val;
        } else if (this._node.tagName.toLowerCase() !== val) {
            throw new kijs.Error(`Property "nodeTagName" can not be set. The node has allready been rendered.`);
        }
    }

    get style() {
        if (this._node) {
            return this._node.style;
        } else {
            return this._style;
        }
    }
    set style(val) {
        if (!this._node) {
            this._style = val;
        } else {
            throw new kijs.Error(`Property "style" can not be set. The node has allready been rendered.`);
        }
    }

    get toolTip() { return this._toolTip; }
    set toolTip(val) {
        if (kijs.isEmpty(val)) {
            if (this._toolTip) {
                this._toolTip.destruct();
            }
            this._toolTip = null;

        } else if (val instanceof kijs.gui.ToolTip) {
            this._toolTip = val;

        } else if (kijs.isObject(val)) {
            if (this._toolTip) {
                this._toolTip.applyConfig(val);
            } else {
                this._toolTip = new kijs.gui.ToolTip(val);
            }

        } else if (kijs.isArray(val)) {
            if (val.length > 1) {
                let tmp = '<ul>';
                kijs.Array.each(val, function(v) {
                    tmp += '<li>' + v + '</li>';
                }, this);
                tmp += '</ul>';
                val = tmp;
            } else if (val.length === 1) {
                val = val[0];
            } else {
                val = '';
            }
            if (this._toolTip) {
                this._toolTip.html = val;
            } else {
                this._toolTip = new kijs.gui.ToolTip({ html: val });
            }

        } else if (kijs.isString(val)) {
            if (this._toolTip) {
                this._toolTip.html = val;
            } else {
                this._toolTip = new kijs.gui.ToolTip({ html: val });
            }

        } else {
            throw new kijs.Error(`Unkown toolTip format`);

        }

        if (this._toolTip) {
            this._toolTip.target = this;
        }
    }

    get top() {
        if (this._node) {
            return this._node.offsetTop;
        } else {
            return this._top;
        }
    }
    set top(val) {
        if (kijs.isEmpty(val)) {
            val = null;
        }
        if (val !== null && !kijs.isNumeric(val)) {
            throw new kijs.Error('set top(x). x must be numeric.');
        }

        this._top = val;

        if (this._node) {
            if (!kijs.isEmpty(val)) {
                val += 'px';
            }
            this._node.style.top = val;
        }
    }

    get width() {
        if (this._node) {
            return this._node.offsetWidth;
        } else {
            return this._width;
        }
    }
    set width(val) {
        if (kijs.isEmpty(val)) {
            val = null;
        }
        if (val !== null && !kijs.isNumeric(val)) {
            throw new kijs.Error('set width(x). x must be numeric.');
        }

        this._width = val;

        if (this._node) {
            if (!kijs.isEmpty(val)) {
                val += 'px';
            }
            this._node.style.width = val;
        }
    }




    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    /**
     * Richtet ein Element nach einem Ziel-Element aus.
     * Dazu wird für beide Elemente ein Ankerpunkt angegeben. Das Element wird dann so positioniert,
     * dass sein Ankerpunkt die gleichen Koordinaten wie der Ankerpunkt des Ziel-Elements hat.
     * Falls das Element an der neuen Position nicht platz haben sollte, kann die Position automatisch
     * gewechselt werden (allowSwapX & allowSwapY)
     * @param {kijs.gui.Element|HTMLElement} targetNode
     * @param {String} [targetPos='bl'] Ankerpunkt beim Zielelement
     *                                   tl --- t --- tr
     *                                   |             |
     *                                   l      c      r
     *                                   |             |
     *                                   bl --- b --- br
     *
     * @param {String} [pos='tl'] Ankerpunkt beim Element das Ausgerichtet werden soll
     * @param {Boolean} [allowSwapX=true]   Swappen möglich auf X-Achse?
     * @param {Boolean} [allowSwapY=true]   Swappen möglich auf Y-Achse?
     * @param {Number} [offsetX=0]          Verschiebung aus dem Ankerpunkt auf der X-Achse
     * @param {Number} [offsetY=0]          Verschiebung aus dem Ankerpunkt auf der Y-Achse
     * @param {Boolean} [swapOffset=true]   Der Offset wird Mitgeswappt (* -1 gerechnet), wenn das Element kein Platz hat
     * @returns {Object}    Gibt die endgültige Positionierung zurück: { pos:..., targetPos:... }
     */
    alignToTarget(targetNode, targetPos, pos, allowSwapX, allowSwapY, offsetX, offsetY, swapOffset=true) {
        targetPos = targetPos || 'bl';
        pos = pos || 'tl';

        if (targetNode instanceof kijs.gui.Element) {
            targetNode = targetNode.dom;
        }

        if (allowSwapX === undefined) {
            allowSwapX = true;
        }

        if (allowSwapY === undefined) {
            allowSwapY = true;
        }

        offsetX = offsetX || 0;
        offsetY = offsetY || 0;

        // Wenn der offset geswappt werden soll, wird dieser *-1 gerechnet.
        const swapOffsetFactor = swapOffset ? -1 : 1;

        const b = kijs.Dom.getAbsolutePos(document.body);
        const e = kijs.Dom.getAbsolutePos(this._node);
        const t = kijs.Dom.getAbsolutePos(targetNode);

        let rect = kijs.Grafic.alignRectToRect(e, t, targetPos, pos, offsetX, offsetY);

        const overlap = kijs.Grafic.rectsOverlap(rect, b);
        let posSwap, targetPosSwap;
        let rectSwap, overlapSwap;
        let fit = true;

        let setHeight = false;
        let setWidth = false;

        // Wenns inder Höhe nicht passt...
        if (!overlap.fitY) {
            fit = false;

            // evtl. von oben nach unten oder unten nach oben swappen
            if (allowSwapY) {
                // Swap positionen ermitteln
                posSwap = null;
                if (pos.indexOf('t')!==-1 && targetPos.indexOf('b')!==-1) {
                    posSwap = pos.replace('t', 'b');
                    targetPosSwap = targetPos.replace('b', 't');
                } else if (pos.indexOf('b')!==-1 && targetPos.indexOf('t')!==-1) {
                    posSwap = pos.replace('b', 't');
                    targetPosSwap = targetPos.replace('t', 'b');
                }

                // Kann in der Höhe die Position gewechselt werden? (t->b und b->t)
                if (posSwap) {
                    rectSwap = kijs.Grafic.alignRectToRect(e, t, targetPosSwap, posSwap, offsetX, offsetY*swapOffsetFactor);
                    overlapSwap = kijs.Grafic.rectsOverlap(rectSwap, b);

                    if (overlapSwap.fitY) {
                        rect = rectSwap;
                        fit = true;
                    }
                }
            }

            // Wenns immer noch nicht passt: unten oder oben am Body-Rand beginnen und über das Target hinausfahren
            // Dabei sicherstellen, dass das Element nicht grösser als der Body ist. Sonst Scrollbar.
            if (!fit) {
                // Höhe darf nicht grösser als Body höhe sein, sonst begrenzen und Scrollbar
                if (rect.h > b.h) {
                    rect.h = b.h;
                    setHeight = true;
                }

                // Am unteren/oberen Rand ausrichten
                if (pos.indexOf('t')!==-1) {
                    // Unten ausrichten
                    rect.y = b.h - rect.h;
                } else {
                    // oben ausrichten
                    rect.y = 0;
                }
                fit = true;
            }
        }

        // Wenns in der Breite nicht passt...
        if (!overlap.fitX) {
            fit = false;

            // evtl. von rechts nach links oder links nach rechts swappen
            if (allowSwapX) {
                // Swap positionen ermitteln
                posSwap = null;
                if (pos.indexOf('l')!==-1 && targetPos.indexOf('r')!==-1) {
                    posSwap = pos.replace('l', 'r');
                    targetPosSwap = targetPos.replace('r', 'l');
                } else if (pos.indexOf('r')!==-1 && targetPos.indexOf('l')!==-1) {
                    posSwap = pos.replace('r', 'l');
                    targetPosSwap = targetPos.replace('l', 'r');
                }

                // Kann in der Breite die Position gewechselt werden? (l->r und r->l)
                if (posSwap) {
                    rectSwap = kijs.Grafic.alignRectToRect(e, t, targetPosSwap, posSwap, offsetX*swapOffsetFactor, offsetY);
                    overlapSwap = kijs.Grafic.rectsOverlap(rectSwap, b);

                    if (overlapSwap.fitX) {
                        // Y Achse übernehmen, da vorgängig berechnet
                        rectSwap.y = rect.y;
                        rect = rectSwap;
                        fit = true;
                    }
                }
            }

            // Wenns immer noch nicht passt: links oder rechts am Body-Rand beginnen und über das Target hinausfahren
            // Dabei sicherstellen, dass das Element nicht grösser als der Body ist. Sonst Scrollbar.
            if (!fit) {
                // Breite darf nicht grösser als Body breite sein, sonst begrenzen und Scrollbar
                if (rect.w > b.w) {
                    rect.w = b.w;
                    setWidth = true;
                }

                // Am linken/rechten Rand ausrichten
                if (pos.indexOf('l')!==-1) {
                    rect.x = b.w - rect.w;
                } else if (pos.indexOf('r')!==-1) {
                    rect.x = 0;
                }
                fit = true;
            }
        }

        this.left = rect.x;
        this.top = rect.y;

        // Abmessungen nur setzen, wenn unbedingt nötig.
        if (setWidth) {
            this.width = rect.w;
        }
        if (setHeight) {
            this.height = rect.h;
        }

        return {
            pos: posSwap ? posSwap : pos,
            targetPos: targetPosSwap ? targetPosSwap : targetPos
        };
    }

    /**
     * Wendet die Konfigurations-Eigenschaften an
     * @param {Object} config
     * @returns {undefined}
     */
    applyConfig(config={}) {
        kijs.Object.assignConfig(this, config, this._configMap);
    }


    /**
     * Fügt eine oder mehrere CSS-Klassen hinzu
     * @param {String|Array} cls
     * @returns {undefined}
     */
    clsAdd(cls) {
        if (!cls) {
            return;
        }
        if (!kijs.isArray(cls)) {
            cls = cls.split(' ');
        }
        this._cls = kijs.Array.concatUnique(this._cls, cls);

        this._clsApply();
    }

    /**
     * Überprüft, ob das Element eine CSS-Klasse hat
     * @param {String} cls
     * @returns {Boolean}
     */
    clsHas(cls) {
        return kijs.Array.contains(this._cls, cls);
    }

    /**
     * Entfernt eine oder mehrere CSS-Klassen
     * @param {String|Array} cls
     * @returns {undefined}
     */
    clsRemove(cls) {
        if (!cls) {
            return;
        }

        if (!kijs.isArray(cls)) {
            cls = cls.split(' ');
        }
        kijs.Array.removeMultiple(this._cls, cls);

        this._clsApply();
    }

    /**
     * Entfernt alle CSS-Klassen
     * @returns {undefined}
     */
    clsRemoveAll() {
        this._cls = [];
        this._clsApply();
    }

    /**
     * Schaltet die übergebenen CSS-Klassen ein oder aus
     * @param {String|Array} cls
     * @returns {undefined}
     */
    clsToggle(cls) {
        if (!cls) {
            return;
        }

        const newCls = [];
        if (!kijs.isArray(cls)) {
            cls = cls.split(' ');
        }
        kijs.Array.each(this._cls, function(cl) {
            if (kijs.Array.contains(cls, cl)) {
                kijs.Array.remove(cls, cl);
            } else {
                newCls.push(cl);
            }
        }, this);

        if (cls) {
            this._cls = newCls.concat(cls);
        }

        this._clsApply();
    }

    /**
     * Setzt den Fokus auf den Node
     * @param {Boolean} [alsoSetIfNoTabIndex=false]    Fokus auch setzen, wenn tabIndex === -1
     *                                                 undefined: nicht fokussierbar (bei undefined muss die Eigenschaft mit removeAttribute('tabIndex') entfernt werden. Sonst klappts nicht)
     *                                                 tabIndex -1: nur via focus() Befehl oder click fokussierbar
     *                                                 tabIndex  0: Fokussierbar - Browser betimmt die Tabreihenfolge
     *                                                 tabIndex >0: Fokussierbar - in der Reihenfolge wie der tabIndex
     * @returns {HTMLElement|Null|false}               HTML-Node, das den Fokus erhalten hat oder false, wenn nicht gerendert.
     */
    focus(alsoSetIfNoTabIndex=false) {
        if (this._node) {
            // Darf der Node den Fokus erhalten?
            if (alsoSetIfNoTabIndex) {
                this._node.focus();
                return this._node;

            // sonst den Fokus auf den ersten möglichen untegeordneten Node settzen
            } else {
                const node = kijs.Dom.getFirstFocusableNode(this._node);
                if (node) {
                    node.focus();
                }
                return node;
            }
        } else {
            return false;
        }
    }

    /**
     * Gibt den Wert eine Eigenschaft des DOM-Nodes zurück
     * @param {String} name
     * @returns {String|Null|Boolean|Undefined}
     */
    nodeAttributeGet(name) {
        if (kijs.isEmpty(name)) {
            return null;
        }

        if (this._node) {
            return this._node[name];

        } else {
            if (this._nodeAttribute.hasOwnProperty(name)) {
                return this._nodeAttribute[name];
            } else {
                return null;
            }
        }
    }

    /**
     * Fügt eine Eigenschaft zum DOM-Node hinzu
     * @param {String} name
     * @param {String|Null|Boolean|Undefined} value
     * @returns {undefined}
     */
    nodeAttributeSet(name, value) {
        if (kijs.isEmpty(name)) {
            return;
        }

        if (kijs.isEmpty(value)) {
            if (this._nodeAttribute.hasOwnProperty(name)) {
                delete this._nodeAttribute[name];
            }
        } else {
            this._nodeAttribute[name] = value;
        }

        if (this._node) {
            this._node[name] = value;
            // Kleiner murgs, weil obige Zeile nicht zum Entfernen der Eigenschaft 'tabIndex' funktioniert
            if (kijs.isEmpty(value)) {
                this._node.removeAttribute(name);
            }
        }
    }

    /**
     * Überprüft, ob der DOM-Node eine bestimmte Eigenschaft hat
     * @param {String} name
     * @returns {Boolean}
     */
    nodeAttributeHas(name) {
        if (this._node) {
            return kijs.isEmpty(this._nodeAttribute[name]);
        } else {
            return !!this._nodeAttribute.hasOwnProperty(name);
        }
    }

    // overwrite
    on(names, callback, context) {
        // Anzahl kijs-Events ermitteln
        const eventsCountBefore = Object.keys(this._events).length;

        // Aufruf der Basisfunktion
        super.on(names, callback, context);

        // Anzahl kijs-Events ermitteln
        const eventsCountAfter = Object.keys(this._events).length;

        // Evtl. die Listeners auf den DOM-Node aktualisieren
        if (this._node && eventsCountAfter - eventsCountBefore) {
            this._nodeEventListenersAppy();
        }
    }

    // overwrite
    off(names, callback, context) {
        // Anzahl kijs-Events ermitteln
        const eventsCountBefore = Object.keys(this._events).length;

        // Aufruf der Basisfunktion
        super.off(names, callback, context);

        // Anzahl kijs-Events ermitteln
        const eventsCountAfter = Object.keys(this._events).length;

        // Evtl. die Listeners auf den DOM-Node aktualisieren
        if (this._node && eventsCountAfter - eventsCountBefore) {
            this._nodeEventListenersAppy();
        }
    }

    // overwrite
    raiseEvent(name, e={}) {
        Object.assign(e, {
            dom: this,
            eventName: name
        });
        return super.raiseEvent(name, e);
    }

    /**
     * rendert den DOM-Node
     * @returns {undefined}
     */
    render() {
        // Node erstellen und Events abfragen
        if (!this._node) {
            this._node = document.createElement(this._nodeTagName);

            // Styles mergen
            if (!kijs.isEmpty(this._style)) {
                Object.assign(this._node.style, this._style);
            }

            // Positionierung
            if (!kijs.isEmpty(this._width)) {
                this.width = this._width;
            }
            if (!kijs.isEmpty(this._height)) {
                this.height = this._height;
            }
            if (!kijs.isEmpty(this._top)) {
                this.top = this._top;
            }
            if (!kijs.isEmpty(this._left)) {
                this.left = this._left;
            }

            // nodeAttribute
            this._nodeAttributeApply();

            // disabled
            this.disabled = this._disabled;
        }

        // HTML
        if (kijs.isDefined(this._html)) {
            kijs.Dom.setInnerHtml(this._node, this._html, this._htmlDisplayType);
        }

        // CSS-Klassen zuweisen
        this._clsApply();

        // DOM-Node-Event Listeners erstellen
        this._nodeEventListenersAppy();
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
                targetNode.insertBefore(this._node, insert);

            // Element nach dem insert-Element einfügen
            } else if (insertPosition === 'after') {
                targetNode.insertBefore(this._node, insert.nextSibling);

            } else {
                throw new kijs.Error('invalid insert position for renderTo');
            }

        // Element anhängen
        } else {
            targetNode.appendChild(this._node);
        }
    }

    /**
     * Scrollt den Node in den sichtbaren Bereich
     * @returns {undefined}
     */
    scrollIntoView(){
        this._node.scrollIntoView();
    }


    /**
     * Node aus DOM entfernen, falls vorhanden
     * @returns {undefined}
     */
    unrender() {
        if (this._node) {
            // Node-Event-Listeners entfernen
            if (!kijs.isEmpty(this._nodeEventListeners)) {
                kijs.Dom.removeAllEventListenersFromContext(this);
            }

            // Childs löschen
            kijs.Dom.removeAllChildNodes(this._node);

            // Node selber löschen
            if (this._node !== document.body && this._node.parentNode) {
                this._node.parentNode.removeChild(this._node);
            }
        }
        this._node = null;

        if (this._toolTip) {
            this._toolTip.unrender();
        }
    }



    // PROTECTED
    /**
     * Weist die CSS-Klassen dem DOM-Node zu.
     * @returns {undefined}
     */
    _clsApply() {
        if (this._node && (this._node.className || !kijs.isEmpty(this._cls))) {
            this._node.className = this._cls ? this._cls.join(' ') : '';
        }
    }

    /**
     * Weist die Eigenschaften dem DOM-Node zu.
     * @param {String} [name=null] Name der Eigenschaft, die angewendet werden soll oder Null für alle
     * @returns {undefined}
     */
    _nodeAttributeApply() {
        kijs.Object.each(this._nodeAttribute, function(name, value) {
            this._node[name] = value;
            // Kleiner murgs, weil obige Zeiele nicht zum Entfernen der Eigenschaft 'tabIndex' funktioniert
            if (kijs.isEmpty(value)) {
                this._node.removeAttribute(name);
            }
        }, this);
    }

    /**
     * Erstellt oder entfernt Listeners auf den DOM-Node aufgrund der _events
     * @returns {undefined}
     */
    _nodeEventListenersAppy() {
        // kijs-Events-Namen ermitteln
        const kijsEvents = Object.keys(this._events);

        // Falls es bereits Node-Event-Listeners gibt, diese entfernen
        if (!kijs.isEmpty(this._nodeEventListeners)) {
            kijs.Dom.removeAllEventListenersFromContext(this);
        }

        // DOM-Node Listeners erstellen
        kijs.Array.each(kijsEvents, function(kijsEvent) {
            if (this._eventMap[kijsEvent]) {
                const nodeEventName = this._eventMap[kijsEvent].nodeEventName;
                const useCapture = !!this._eventMap[kijsEvent].useCapture;

                // Wenn der DOM-Node Listener noch nicht vorhanden ist: erstellen
                if (!kijs.Dom.hasEventListener(nodeEventName, this._node, this, useCapture)) {
                    kijs.Dom.addEventListener(nodeEventName, this._node, this._onNodeEvent, this, useCapture);
                }
            } else {
                throw new kijs.Error(`kijsEvent "${kijsEvent}" is not mapped`);
            }
        }, this);
    }


    // LISTENERS
    _onKeyPressStopBubbeling(e) {
        e.nodeEvent.stopPropagation();
    }

    /**
     * Listener für alle DOM-Node-Events, der die kijs-Events auslösen.
     * @param {Object} e
     * @returns {Boolean}
     */
    _onNodeEvent(e) {
        let ret = true;

        // kijs-Events ermitteln, die aufgrund des DOM-Node-Events ausgelöst werden sollen
        kijs.Object.each(this._eventMap, function(eventName, val) {
            // Eventname und useCapture muss übereinstimmen
            if (val.nodeEventName !== e.nodeEventName || !!val.useCapture !== !!e.useCapture) {
                return;
            }

            // Tastencode muss übereinstimmen, wenn vorhanden
            if (!kijs.isEmpty(val.keys)) {
                const keys = kijs.isArray(val.keys) ? val.keys : [val.keys];
                if (!kijs.Array.contains(keys, e.nodeEvent.keyCode)) {
                    return;
                }
            }

            // Zusatztaste shift muss übereinstimmen, wenn vorhanden
            if (!kijs.isEmpty(val.shiftKey)) {
                if (!!val.shiftKey !== !!e.nodeEvent.shiftKey) {
                    return;
                }
            }

            // Zusatztaste ctrl muss übereinstimmen, wenn vorhanden
            if (!kijs.isEmpty(val.ctrlKey)) {
                if (!!val.ctrlKey !== !!e.nodeEvent.ctrlKey) {
                    return;
                }
            }

            // Zusatztaste alt muss übereinstimmen, wenn vorhanden
            if (!kijs.isEmpty(val.altKey)) {
                if (!!val.altKey !== !!e.nodeEvent.altKey) {
                    return;
                }
            }

            // kijs-Event auslösen
            e.dom = this;
            e.eventName = eventName;

            if (this.raiseEvent(eventName, e) === false) {
                ret = false;
            }
        }, this);

        return ret;
    }



    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct() {
        // Unrender
        this.unrender();

        // ToolTip entladen
        if (this._toolTip) {
            this._toolTip.destruct();
        }

        // Variablen (Objekte/Arrays) leeren
        this._cls = null;
        this._configMap = null;
        this._eventMap = null;
        this._node = null;
        this._nodeAttribute = null;
        this._nodeEventListeners = null;
        this._style = null;
        this._toolTip = null;

        // Basisklasse entladen
        super.destruct();
    }
};