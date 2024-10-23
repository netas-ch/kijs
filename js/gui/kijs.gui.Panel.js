/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.Panel
// --------------------------------------------------------------
kijs.gui.Panel = class kijs_gui_Panel extends kijs.gui.Container {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        this._headerBarEl = new kijs.gui.PanelBar({
            cls: 'kijs-headerbar',
            parent: this,
            on: {
                click: this.#onHeaderBarClick,
                dblClick: this.#onHeaderBarDblClick,
                context: this
            }
        });

        this._headerEl = new kijs.gui.container.Scrollable({
            cls: 'kijs-header',
            parent: this
        });

        this._footerEl = new kijs.gui.container.Scrollable({
            cls: 'kijs-footer',
            parent: this
        });

        this._footerBarEl = new kijs.gui.PanelBar({
            cls: 'kijs-footerbar',
            parent: this
        });

        this._collapseHeight = null;    // Schwellwert, wenn die Höhe kleiner ist, wird zugeklappt
        this._collapseWidth = null;     // Schwellwert, wenn die Breite kleiner ist, wird zugeklappt
        
        // Masse, die bei collapse oder Maximize hier zwischengespeichert werden, damit sie dann bei 
        // expand/restore wieder wie vorher sind.
        this._expandedSize = { 
            left:null, top:null,
            width:null, height:null, 
            marginLeft:null, marginRight:null, marginTop:null, marginBottom:null
        };
        
        this._domPos = null;
        
        this._closeButtonEl = null;
        this._collapseButtonEl = null;
        this._innerDisabled = false;
        this._maximizeButtonEl = null;
        this._collapsible = false;
        this._resizerEl = null;

        this._dom.clsRemove('kijs-container');
        this._dom.clsAdd('kijs-panel');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            collapseHeight: 50,
            collapseWidth: 50,
            headerScrollableX: 'auto',
            headerScrollableY: false,
            footerScrollableX: 'auto',
            footerScrollableY: false
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            // headerBar
            caption: { target: 'html', context: this._headerBarEl },
            
            collapseHeight: true,
            collapseWidth: true,

            iconChar: { target: 'iconChar', context: this._headerBarEl },
            iconCls: { target: 'iconCls', context: this._headerBarEl },
            iconColor: { target: 'iconColor', context: this._headerBarEl },
            iconMap: { target: 'iconMap', context: this._headerBarEl },
            
            headerBarCls: { fn: 'function', target: this._headerBarEl.dom.clsAdd, context: this._headerBarEl.dom },
            headerBarDefaults: { target: 'defaults', context: this._headerBarEl },
            headerBarDisabled: { target: 'disabled', context: this._headerBarEl },
            headerBarElements: { fn: 'function', target: this._headerBarEl.containerRightEl.add, context: this._headerBarEl.containerRightEl },
            headerBarStyle: { fn: 'assign', target: 'style', context: this._headerBarEl.dom },

            // header
            headerCls: { fn: 'function', target: this._headerEl.dom.clsAdd, context: this._headerEl.dom },
            headerDefaults: { target: 'defaults', context: this._headerEl },
            headerDisabled: { target: 'disabled', context: this._headerEl },
            headerElements: { fn: 'function', target: this._headerEl.add, context: this._headerEl },
            headerInnerCls: { fn: 'function', target: this._headerEl.innerDom.clsAdd, context: this._headerEl.innerDom },
            headerInnerStyle: { fn: 'assign', target: 'style', context: this._headerEl.innerDom },
            headerScrollableX: { target: 'scrollableX', context: this._headerEl },
            headerScrollableY: { target: 'scrollableY', context: this._headerEl },
            headerStyle: { fn: 'assign', target: 'style', context: this._headerEl.dom },
            
            // inner
            innerDisabled: { target: 'innerDisabled' },
            
            // footer
            footerCls: { fn: 'function', target: this._footerEl.dom.clsAdd, context: this._footerEl.dom },
            footerDefaults: { target: 'defaults', context: this._footerEl },
            footerDisabled: { target: 'disabled', context: this._footerEl },
            footerElements: { fn: 'function', target: this._footerEl.add, context: this._footerEl },
            footerInnerCls: { fn: 'function', target: this._footerEl.innerDom.clsAdd, context: this._footerEl.innerDom },
            footerInnerStyle: { fn: 'assign', target: 'style', context: this._footerEl.innerDom },
            footerScrollableX: { target: 'scrollableX', context: this._footerEl },
            footerScrollableY: { target: 'scrollableY', context: this._footerEl },
            footerStyle: { fn: 'assign', target: 'style', context: this._footerEl.dom },

            // footerBar
            footerBarCaption: { target: 'html', context: this._footerBarEl },
            footerBarDefaults: { target: 'defaults', context: this._footerBarEl },
            footerBarDisabled: { target: 'disabled', context: this._footerBarEl },
            footerBarElements: { fn: 'function', target: this._footerBarEl.containerLeftEl.add, context: this._footerBarEl.containerLeftEl },
            footerBarStyle: { fn: 'assign', target: 'style', context: this._footerBarEl.dom },

            resizable: { target: 'resizable' }, // Soll in der rechten unteren Ecke das resize-Symbol zum Ändern der Grösse angezeigt werden.
            resizableWidth: { target: 'resizableWidth' }, // Soll in der rechten unteren Ecke das resize-Symbol zum Ändern der Breite angezeigt werden.
            resizableHeight: { target: 'resizableHeight' }, // Soll in der rechten unteren Ecke das resize-Symbol zum Ändern der Höhe angezeigt werden.
            
            collapsible: { prio: 1002, target: 'collapsible' },
            collapseButton: { prio: 1003, target: 'collapseButton' },
            collapsed: { prio: 1004, target: 'collapsed' },

            maximizable: { prio: 1010, target: 'maximizable' },
            maximizeButton: { prio: 1011, target: 'maximizeButton' },
            maximized: { prio: 1012, target: 'maximized' },

            closable: { prio: 1013, target: 'closable' },
            closeButton: { prio: 1014, target: 'closeButton' }

        });

        // Listeners
        this.on('enterPress', this.#onEnterPress, this);
        this.on('escPress', this.#onEscPress, this);

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }
    }



    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get caption() { return this._headerBarEl.html; }
    set caption(val) { this._headerBarEl.html = val; }

    get closable() { return !!this._closeButtonEl;}
    set closable(val) {
        if (val) {
            if (!this._closeButtonEl) {
                this.closeButton = {
                    iconMap: 'kijs.iconMap.Fa.xmark'
                };
            }
        } else {
            if (this._closeButtonEl) {
                this.closeButton = null;
            }
        }
    }

    get closeButton() { return this._closeButtonEl; }
    set closeButton(val) {
        // Button entfernen
        if (kijs.isEmpty(val)) {
            this._headerBarEl.containerRightEl.remove(this._closeButtonEl);
            this._closeButtonEl = null;

        // Instanz von kijs.gui.Button
        } else if (val instanceof kijs.gui.Button) {
            if (this._closeButtonEl) {
                this._headerBarEl.containerRightEl.remove(this._closeButtonEl);
            }
            this._closeButtonEl = val;
            this._closeButtonEl.on('click', this.#onCloseClick, this);
            this._headerBarEl.containerRightEl.add(this._closeButtonEl);

        // Config-Objekt
        } else if (kijs.isObject(val)) {
            if (this._closeButtonEl) {
                this._closeButtonEl.applyConfig(val);
            } else {
                this._closeButtonEl = new kijs.gui.Button(val);
                this._closeButtonEl.on('click', this.#onCloseClick, this);
                this._headerBarEl.containerRightEl.add(this._closeButtonEl);
            }

        } else {
            throw new kijs.Error(`Unknown format on config "closeButton"`);
        }

        if (this.isRendered) {
            this.render();
        }
    }

    get collapseButton() { return this._collapseButtonEl; }
    set collapseButton(val) {
        // Button entfernen
        if (kijs.isEmpty(val)) {
            if (this._collapseButtonEl) {
                this._headerBarEl.containerRightEl.remove(this._collapseButtonEl);
            }
            this._collapseButtonEl = null;

        // Instanz von kijs.gui.Button
        } else if (val instanceof kijs.gui.Button) {
            if (this._collapseButtonEl) {
                this._headerBarEl.containerRightEl.remove(this._collapseButtonEl);
            }
            this._collapseButtonEl = val;
            this._collapseButtonEl.on('click', this.#onCollapseClick, this);
            this._headerBarEl.containerRightEl.add(this._collapseButtonEl);

        // Config-Objekt
        } else if (kijs.isObject(val)) {
            if (this._collapseButtonEl) {
                this._collapseButtonEl.applyConfig(val);
            } else {
                this._collapseButtonEl = new kijs.gui.Button(val);
                this._collapseButtonEl.on('click', this.#onCollapseClick, this);
                this._headerBarEl.containerRightEl.add(this._collapseButtonEl);
            }

        } else {
            throw new kijs.Error(`Unknown format on config "collapseButton"`);
        }

        if (this.isRendered) {
            this.render();
        }
    }

    get collapsed() {
        return this._dom.clsHas('kijs-collapse-top') ||
                this._dom.clsHas('kijs-collapse-right') ||
                this._dom.clsHas('kijs-collapse-bottom') ||
                this._dom.clsHas('kijs-collapse-left');
    }
    set collapsed(val) {
        if (val) {
            if (val === 'toggle') {
                if (this.collapsed) {
                    this.expand();
                } else {
                    this.collapse();
                }
            } else {
                this.collapse();
            }
        } else {
            this.expand();
        }
    }

    get collapseHeight() { return this._collapseHeight; }
    set collapseHeight(val) { this._collapseHeight = val; }

    get collapseWidth() { return this._collapseWidth; }
    set collapseWidth(val) { this._collapseWidth = val; }

    get collapsible() {
        if (this._collapseButtonEl) {
            return this._collapsible;
        } else {
            return false;
        }
    }
    set collapsible(val) {
        const validePos = ['top', 'right', 'bottom', 'left'];

        if (kijs.isEmpty(val) || val === false) {
            val = false;
            this._collapsible = false;
        } else {
            if (kijs.Array.contains(validePos, val)) {
                this._collapsible = val;
            } else {
                throw new kijs.Error(`Unknown pos on config "collapsible"`);
            }
        }

        if (val) {
            if (!this._collapseButtonEl) {
                this.collapseButton = {
                    iconMap: this._getCollapseIconMap()
                };
            }
        } else {
            if (this._collapseButtonEl) {
                this.collapseButton = null;
            }
        }
    }
    
    get draggable() { return false; }

    get footer() { return this._footerEl; }

    get footerBar() { return this._footerBarEl; }

    get header() { return this._headerEl; }

    get headerBar() { return this._headerBarEl; }

    // overwrite
    get height() { return super.height; }
    set height(val) {
        let doFn = false;

        if (kijs.Array.contains(['top', 'bottom'], this.collapsible) && kijs.isNumber(this._collapseHeight)) {
            if (val <= this._collapseHeight) {
                doFn = 'collapse';
            } else if (this.collapsed) {
                doFn = 'expand';
            }
        }
        
        // Höhe merken, damit beim Aufklappen, wieder die gleiche Höhe wiederhergestellt werden kann
        if (kijs.isNumber(this._collapseHeight) && val > kijs.isNumber(this._collapseHeight)) {
            this._expandedSize.height = val;
        }
        
        if (doFn === 'collapse') {
            if (!this.collapsed) {
                this.collapse();
            }
        } else if (doFn === 'expand') {
            this.expand(val);
        } else {
            super.height = val;
        }
    }

    get innerDisabled() { return this._innerDisabled; }
    set innerDisabled(val) {
        this._innerDisabled = !!val;
        kijs.Array.each(this._elements, function(el) {
            el.changeDisabled(!!val, true);
        }, this);
    }

    get maximizable() { return !!this._maximizeButtonEl; }
    set maximizable(val) {
        if (val) {
            if (!this._maximizeButtonEl) {
                this.maximizeButton = new kijs.gui.Button({
                    iconMap: this._getMaximizeIconMap()
                });
            }
        } else {
            if (this._maximizeButtonEl) {
                this.maximizeButton = null;
            }
        }
    }

    get maximizeButton() { return this._maximizeButtonEl; }
    set maximizeButton(val) {
        // Button entfernen
        if (kijs.isEmpty(val)) {
            this._headerBarEl.containerRightEl.remove(this._maximizeButtonEl);
            this._maximizeButtonEl = null;

        // Instanz von kijs.gui.Button
        } else if (val instanceof kijs.gui.Button) {
            if (this._maximizeButtonEl) {
                this._headerBarEl.containerRightEl.remove(this._maximizeButtonEl);
            }
            this._maximizeButtonEl = val;
            this._maximizeButtonEl.on('click', this.#onMaximizeClick, this);
            this._headerBarEl.containerRightEl.add(this._maximizeButtonEl);

        // Config-Objekt
        } else if (kijs.isObject(val)) {
            if (this._maximizeButtonEl) {
                this._maximizeButtonEl.applyConfig(val);
            } else {
                this._maximizeButtonEl = new kijs.gui.Button(val);
                this._maximizeButtonEl.on('click', this.#onMaximizeClick, this);
                this._headerBarEl.containerRightEl.add(this._maximizeButtonEl);
            }

        } else {
            throw new kijs.Error(`Unknown format on config "maximizeButton"`);
        }

        if (this.isRendered) {
            this.render();
        }
    }

    get maximized() {
        return this._dom.clsHas('kijs-maximize');
    }
    set maximized(val) {
        if (val) {
            this.maximize();
        } else {
            this.restore();
        }
    }

    get resizable() { return !!this._resizerEl; }
    set resizable(val) {
        if (val) {
            this._setResizable(true, true);
        } else {
            this._setResizable(false, false);
        }
    }
    
    get resizableHeight() {
        return this._resizerEl && this._resizerEl.allowResizeHeight;
    }
    set resizableHeight(val) {
        this._setResizable(null, !!val);
    }
    
    get resizableWidth() {
        return this._resizerEl && this._resizerEl.allowResizeWidth;
    }
    set resizableWidth(val) {
        this._setResizable(!!val, null);
    }
    
    // overwrite
    get width() { return super.width; }
    set width(val) {
        let doFn = false;

        if (kijs.Array.contains(['left', 'right'], this.collapsible) && kijs.isNumber(this._collapseWidth)) {
            if (val <= this._collapseWidth) {
                doFn = 'collapse';
            } else if (this.collapsed) {
                doFn = 'expand';
            }
        }
        
        // Breite merken, damit beim Aufklappen, wieder die gleiche Breite wiederhergestellt werden kann
        if (kijs.isNumber(this._collapseWidth) && val > kijs.isNumber(this._collapseWidth)) {
            this._expandedSize.width = val;
        }
        
        if (doFn === 'collapse') {
            if (!this.collapsed) {
                this.collapse();
            }
        } else if (doFn === 'expand') {
            this.expand(val);
        } else {
            super.width = val;
        }
    }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // overwrite
    changeDisabled(val, callFromParent) {
        super.changeDisabled(!!val, callFromParent);
        this._headerBarEl.changeDisabled(!!val, true);
        this._headerEl.changeDisabled(!!val, true);
        this._footerEl.changeDisabled(!!val, true);
        this._footerBarEl.changeDisabled(!!val, true);
        if (this._resizerEl) {
            this._resizerEl.changeDisabled(!!val, true);
        }
    }
    
    /**
     * Schliesst das Panel
     * @param {Boolean} [preventDestruct=false]  Kein 'close' Event auslösen
     * @param {Boolean} [preventEvents=false]    Das Auslösen des beforeClose und close-Events verhindern?
     * @param {Boolean} [superCall=false]
     * @returns {undefined}
     */
    close(preventDestruct, preventEvents, superCall) {
        if (!superCall) {
            if (!preventEvents) {
                // beforeClose Event. Bei Rückgabe=false -> abbrechen
                if (this.raiseEvent('beforeClose') === false) {
                    return;
                }
            }
        }
        
        if (this._parentEl && (this._parentEl instanceof kijs.gui.Container) && this._parentEl.hasChild(this)) {
            this._parentEl.remove([this], {
                preventRender: false,
                preventDestruct: true,
                preventEvents: preventEvents
            });
        } else {
            this.unrender();
        }
        
        if (!preventEvents) {
            this.raiseEvent('close');
        }

        if (!preventDestruct) {
            this.destruct();
        }
    }

    /**
     * Minimiert das Panel in eine gewünschte Richtung
     * @param {String} direction [optional]
     * @returns {undefined}
     */
    collapse(direction) {
        // afterResize-Event deaktivieren
        const prevAfterRes = this._preventAfterResize;
        this._preventAfterResize = true;

        if (this.maximized) {
            this.restore();
        }

        if (direction) {
            this._collapsible = direction;
        }

        if (!this._collapsible) {
            this._collapsible = 'top';
        }

        this._dom.clsRemove(['kijs-collapse-top', 'kijs-collapse-right', 'kijs-collapse-bottom', 'kijs-collapse-left']);

        switch (this._collapsible) {
            case 'top':
                this._dom.clsAdd('kijs-collapse-top');
                this._dom.height = null;
                break;
                
            case 'right':
                this._dom.clsAdd('kijs-collapse-right');
                this._dom.width = null;
                break;
                
            case 'bottom':
                this._dom.clsAdd('kijs-collapse-bottom');
                this._dom.height = null;
                break;
                
            case 'left':
                this._dom.clsAdd('kijs-collapse-left');
                this._dom.width = null;
                break;
                
        }

        // das richtige Icon in den Button
        if (this._collapseButtonEl) {
            this._collapseButtonEl.iconMap = this._getCollapseIconMap();
        }

        // Event werfen
        this.raiseEvent('collapse');

        // afterResize-Event wieder aktivieren
        this._preventAfterResize = prevAfterRes;

        // Evtl. afterResize-Event zeitversetzt auslösen
        this._raiseAfterResizeEvent(true);
    }

    /**
     * Expandiert das Panel
     * @param {Number} size [optional] Breite oder Höhe in die das Panel wiederhergestellt werden soll
     * @returns {undefined}
     */
    expand(size) {
        // afterResize-Event deaktivieren
        const prevAfterRes = this._preventAfterResize;
        this._preventAfterResize = true;

        this._dom.clsRemove(['kijs-collapse-top', 'kijs-collapse-right', 'kijs-collapse-bottom', 'kijs-collapse-left']);

        // das richtige Icon in den Button
        if (this._collapseButtonEl) {
            this._collapseButtonEl.iconMap = this._getCollapseIconMap();
        }
        
        // falls kein size übergeben wurde, die letzte breite/höhe nehmen
        if (kijs.isEmpty(size)) {
            switch (this._collapsible) {
                case 'top':
                case 'bottom':
                    if (!kijs.isEmpty(this._expandedSize.height)) {
                        size = this._expandedSize.height;
                    }
                    break;

                case 'right':
                case 'left':
                    if (!kijs.isEmpty(this._expandedSize.width)) {
                        size = this._expandedSize.width;
                    }
                    break;
            }
        }
        
        // Übergebene Grösse wiederherstellen
        if (!kijs.isEmpty(size)) {
            switch (this._collapsible) {
                case 'top':
                case 'bottom':
                    if (size > this._collapseHeight) {
                        this.height = size;
                    }
                    break;

                case 'right':
                case 'left':
                    if (size > this._collapseWidth) {
                        this.width = size;
                    }
                    break;
            }
        }

        // Event werfen
        this.raiseEvent('expand');

        // afterResize-Event wieder aktivieren
        this._preventAfterResize = prevAfterRes;

        // Evtl. afterResize-Event zeitversetzt auslösen
        this._raiseAfterResizeEvent(true);
    }

    // overwrite
    focus(alsoSetIfNoTabIndex) {
        if (alsoSetIfNoTabIndex) {
            return super.focus(alsoSetIfNoTabIndex);

        } else {
            // Zuerst versuchen den Fokus auf ein Element im innerDom zu setzen
            let nde = this._innerDom.focus(false);
            // dann auf eine Schaltfläche im footer
            if (!nde && !this._footerEl.isEmpty && this._footerEl.isRendered) {
                nde = this._footerEl.focus(alsoSetIfNoTabIndex);
            }
            // falls nicht erfolgreich. Den Fokus direkt auf das Fenster setzen
            if (!nde) {
                nde = super.focus(alsoSetIfNoTabIndex);
            }
            return nde;
        }

        // Darf der Node den Fokus erhalten?
        if (alsoSetIfNoTabIndex) {
            this._dom.node.focus();

        // sonst den Fokus auf den ersten möglichen untergeordneten Node setzen
        } else {
            const nde = kijs.Dom.getFirstFocusableNode(this._node);
            if (nde) {
                nde.focus();
                return nde;
            }
        }
        
        return false;
    }

    /**
     * Maximiert das Panel
     * @returns {undefined}
     */
    maximize() {
        if (this.maximized) {
            return;
        }

        // afterResize-Event deaktivieren
        const prevAfterRes = this._preventAfterResize;
        this._preventAfterResize = true;

        if (this.collapsed) {
            this.expand();
        }

        if (this.isRendered) {
            this._domPos = {
                parent: this._dom.node.parentNode,
                nextSibling: this._dom.node.nextSibling
            };
            document.body.appendChild(this._dom.node);
        }
        
        this._expandedSize.left = this._dom.style.left;
        this._expandedSize.top = this._dom.style.top;
        this._expandedSize.marginLeft = this._dom.style.marginLeft;
        this._expandedSize.marginRight = this._dom.style.marginRight;
        this._expandedSize.marginTop = this._dom.style.marginTop;
        this._expandedSize.marginBottom = this._dom.style.marginBottom;
        
        this._dom.clsAdd('kijs-maximize');
        this.left = 0;
        this.top = 0;
        this._dom.width = null;
        this._dom.height = null;
        this._dom.style.marginLeft = 0;
        this._dom.style.marginRight = 0;
        this._dom.style.marginTop = 0;
        this._dom.style.marginBottom = 0;
        
        // das richtige Icon in den Button
        if (this._maximizeButtonEl) {
            this._maximizeButtonEl.iconMap = this._getMaximizeIconMap();
        }

        // afterResize-Event wieder aktivieren
        this._preventAfterResize = prevAfterRes;

        // Evtl. afterResize-Event zeitversetzt auslösen
        this._raiseAfterResizeEvent(true);
    }

    // Overwrite
    render(superCall) {
        // dom mit elements rendern (innerDom)
        super.render(true);

        // HeaderBar rendern (kijs.gui.Bar)
        if (!this._headerBarEl.isEmpty) {
            this._headerBarEl.renderTo(this._dom.node, this._innerDom.node);
        } else if (this._headerBarEl.isRendered) {
            this._headerBarEl.unrender();
        }

        // Header rendern (kijs.gui.Container)
        if (!this._headerEl.isEmpty) {
            this._headerEl.renderTo(this._dom.node, this._innerDom.node);
        } else if (this._headerEl.isRendered) {
            this._headerEl.unrender();
        }

        // Footer rendern (kijs.gui.Container)
        if (!this._footerEl.isEmpty) {
            this._footerEl.renderTo(this._dom.node);
        } else if (this._footerEl.isRendered) {
            this._footerEl.unrender();
        }

        // FooterBar rendern (kijs.gui.Bar)
        if (!this._footerBarEl.isEmpty) {
            this._footerBarEl.renderTo(this._dom.node);
        } else if (this._footerBarEl.isRendered) {
            this._footerBarEl.unrender();
        }

        // resizer
        if (this._resizerEl) {
            this._resizerEl.renderTo(this._dom.node);
        }

        // Event afterRender auslösen
        if (!superCall) {
            this.raiseEvent('afterRender');
        }
    }

    // Overwrite
    renderTo(targetNode, insertBefore) {
        // Falls das Panel schon maximiert geöffnet werden soll, muss der Node zum body verschoben werden
        if (this.maximized && kijs.isEmpty(this._domPos)) {
            this._domPos = {
                parent: targetNode,
                nextSibling: insertBefore
            };
            targetNode = document.body;
            insertBefore = null;
        }

        super.renderTo(targetNode, insertBefore);
    }

    /**
     * Verlässt die maximierte Ansicht
     * @returns {undefined}
     */
    restore() {
        if (!this.maximized) {
            return;
        }

        // afterResize-Event deaktivieren
        const prevAfterRes = this._preventAfterResize;
        this._preventAfterResize = true;

        if (this._domPos.nextSibling) {
            this._domPos.parent.insertBefore(this._dom.node, this._domPos.nextSibling);
        } else {
            this._domPos.parent.appendChild(this._dom.node);
        }

        this._dom.clsRemove('kijs-maximize');

        if (!kijs.isEmpty(this._expandedSize.left)) {
            this._dom.style.left = this._expandedSize.left;
        }
        if (!kijs.isEmpty(this._expandedSize.top)) {
            this._dom.style.top = this._expandedSize.top;
        }
        if (!kijs.isEmpty(this._expandedSize.width)) {
            this._dom.width = this._expandedSize.width;
        }
        if (!kijs.isEmpty(this._expandedSize.height)) {
            this._dom.height = this._expandedSize.height;
        }
        if (!kijs.isEmpty(this._expandedSize.marginLeft)) {
            this._dom.style.marginLeft = this._expandedSize.marginLeft;
        }
        if (!kijs.isEmpty(this._expandedSize.marginRight)) {
            this._dom.style.marginRight = this._expandedSize.marginRight;
        }
        if (!kijs.isEmpty(this._expandedSize.marginTop)) {
            this._dom.style.marginTop = this._expandedSize.marginTop;
        }
        if (!kijs.isEmpty(this._expandedSize.marginBottom)) {
            this._dom.style.marginBottom = this._expandedSize.marginBottom;
        }

        // das richtige Icon in den Button
        if (this._maximizeButtonEl) {
            this._maximizeButtonEl.iconMap = this._getMaximizeIconMap();
        }

        // afterResize-Event wieder aktivieren
        this._preventAfterResize = prevAfterRes;

        // Evtl. afterResize-Event zeitversetzt auslösen
        this._raiseAfterResizeEvent(true);
    }

    // overwrite
    unrender(superCall) {
        // Event auslösen.
        if (!superCall) {
            this.raiseEvent('unrender');
        }
        
        if (this._headerBarEl) {
            this._headerBarEl.unrender();
        }
        if (this._headerEl) {
            this._headerEl.unrender();
        }
        if (this._footerEl) {
            this._footerEl.unrender();
        }
        if (this._footerBarEl) {
            this._footerBarEl.unrender();
        }
        if (this._resizerEl) {
            this._resizerEl.unrender();
        }
        super.unrender(true);
    }


    // PROTECTED
    /**
     * Gibt das Icon für den Maximieren-Knopf zurück
     * @returns {String}
     */
    _getMaximizeIconMap() {
        if (this.maximized) {
            return 'kijs.iconMap.Fa.window-restore';
        } else {
            return 'kijs.iconMap.Fa.window-maximize';
        }
    }

    /**
     * Gibt das Icon für den Collapse-Knopf zurück
     * @returns {undefined}
     */
    _getCollapseIconMap() {
        if (this.collapsed) {
            switch (this._collapsible) {
                case 'top': return 'kijs.iconMap.Fa.caret-down';
                case 'right': return 'kijs.iconMap.Fa.caret-left';
                case 'bottom': return 'kijs.iconMap.Fa.caret-up';
                case 'left': return 'kijs.iconMap.Fa.caret-right';
            }
        } else {
            switch (this._collapsible) {
                case 'top': return 'kijs.iconMap.Fa.caret-up';
                case 'right': return 'kijs.iconMap.Fa.caret-right';
                case 'bottom': return 'kijs.iconMap.Fa.caret-down';
                case 'left': return 'kijs.iconMap.Fa.caret-left';
            }
        }
        return '';
    }
    
    /**
     * Zeigt das Resize-Icon in der unteren rechten Ecke an oder blendet es aus.
     * @param {Boolean|null} resizeWidth Breite änderbar
     * @param {Boolean|null} resizeHeight Höhe änderbar
     * @returns {undefined}
     */
    _setResizable(resizeWidth, resizeHeight) {
        if (resizeWidth === null) {
            resizeWidth = this._resizerEl && this._resizerEl.allowResizeWidth;
        }
        if (resizeHeight === null) {
            resizeHeight = this._resizerEl && this._resizerEl.allowResizeHeight;
        }
        
        const hasResizer = resizeWidth || resizeHeight;
        
        if (hasResizer !== !!this._resizerEl) {
            if (this._resizerEl) {
                this._resizerEl.destruct();
                this._resizerEl = null;
            } else {
                this._resizerEl = new kijs.gui.Resizer({
                    target: this
                });
                if (this._dom.node) {
                    this._resizerEl.renderTo(this._dom.node);
                }
            }
        }
        
        if (hasResizer) {
            this._resizerEl.allowResizeWidth = resizeWidth;
            this._resizerEl.allowResizeHeight = resizeHeight;
        }
    }


    // PRIVATE
    // LISTENERS
    #onCloseClick(e) {
        this.close();
    }

    #onCollapseClick(e) {
        if (this.collapsed) {
            this.expand();
        } else {
            this.collapse();
        }
    }

    #onEnterPress(e) {
        // Gibt es einen Button mit Eigenschaft isDefault?
        if (this._footerEl) {
            kijs.Array.each(this._footerEl.elements, function(el) {
                if ((el instanceof kijs.gui.Button) && el.dom && el.isDefault) {

                    // Wenn der Fokus nicht auf dem Element, Click-Event werfen
                    if (document.activeElement !== el.dom.node) {
                        el.raiseEvent('click');
                    }
                    return;
                }
            }, this);
        }
    }
    
    #onEscPress(e) {
        if (this.closable) {
            this.close();
        }
    }

    #onHeaderBarClick(e) {
        // Ein Panel (draggable=false) kann per click auf die HeaderBar auf/zugeklappt werden.
        if (this.collapsible && !this.maximized && !this.draggable) {
            if (this.collapsed) {
                this.expand();
            } else {
                this.collapse();
            }
        }
    }

    #onHeaderBarDblClick(e) {
        // Ein Fenster (draggable=true) kann per dblClick auf die HeaderBar maximiert werden.
        if (this.maximizable && this.draggable) {
            if (this.maximized) {
                this.restore();
            } else {
                this.maximize();
            }

        // Falls das Fenster maximiert ist, kann es jederzeit durch einen Doppelklick wiederhergestellt werden
        } else if (this.maximizable && this.maximized) {
            this.restore();
        }
    }

    #onMaximizeClick(e) {
        if (this.maximized) {
            this.restore();
        } else {
            this.maximize();
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

        // Elemente/DOM-Objekte entladen
        if (this._headerBarEl) {
            this._headerBarEl.destruct();
        }
        if (this._headerEl) {
            this._headerEl.destruct();
        }
        if (this._footerEl) {
            this._footerEl.destruct();
        }
        if (this._footerBarEl) {
            this._footerBarEl.destruct();
        }
        if (this._resizerEl) {
            this._resizerEl.destruct();
        }

        // Variablen (Objekte/Arrays) leeren
        this._domPos = null;
        this._headerBarEl = null;
        this._headerEl = null;
        this._footerEl = null;
        this._footerBarEl = null;
        this._closeButtonEl = null;
        this._collapseButtonEl = null;
        this._maximizeButtonEl = null;
        this._resizerEl = null;
        this._expandedSize = null;

        // Basisklasse entladen
        super.destruct(true);
    }

};
