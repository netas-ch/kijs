/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.Panel
// --------------------------------------------------------------
kijs.gui.Panel = class kijs_gui_Panel extends kijs.gui.Container {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super();

        this._headerBarEl = new kijs.gui.PanelBar({
            cls: 'kijs-headerbar',
            parent: this,
            on: {
                click: this._onHeaderBarClick,
                dblClick: this._onHeaderBarDblClick,
                context: this
            }
        });

        this._headerEl = new kijs.gui.Container({
            cls: 'kijs-header',
            parent: this
        });

        this._footerEl = new kijs.gui.Container({
            cls: 'kijs-footer',
            parent: this
        });

        this._footerBarEl = new kijs.gui.PanelBar({
            cls: 'kijs-footerbar',
            parent: this
        });

        this._collapseHeight = null;
        this._collapseWidth = null;

        this._domPos = null;

        this._closeButtonEl = null;
        this._collapseButtonEl = null;
        this._maximizeButtonEl = null;
        this._collapsible = false;
        this._resizerEl = null;

        this._dom.clsRemove('kijs-container');
        this._dom.clsAdd('kijs-panel');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            collapseHeight: 50,
            collapseWidth: 50
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            // headerBar
            caption: { target: 'html', context: this._headerBarEl },
            headerBarElements: { fn: 'function', target: this._headerBarEl.containerRightEl.add, context: this._headerBarEl.containerRightEl },
            headerBarStyle: { fn: 'assign', target: 'style', context: this._headerBarEl.dom },
            iconChar: { target: 'iconChar', context: this._headerBarEl },
            iconCls: { target: 'iconCls', context: this._headerBarEl },
            iconColor: { target: 'iconColor', context: this._headerBarEl },

            // header
            headerCls: { fn: 'function', target: this._headerEl.dom.clsAdd, context: this._headerEl.dom },
            headerElements: { fn: 'function', target: this._headerEl.add, context: this._headerEl },
            headerStyle: { fn: 'assign', target: 'style', context: this._headerEl.dom },

            // footer
            footerCls: { fn: 'function', target: this._footerEl.dom.clsAdd, context: this._footerEl.dom },
            footerElements: { fn: 'function', target: this._footerEl.add, context: this._footerEl },
            footerStyle: { fn: 'assign', target: 'style', context: this._footerEl.dom },

            // footerBar
            footerCaption: { target: 'html', context: this._footerBarEl },
            footerBarElements: { fn: 'function', target: this._footerBarEl.containerLeftEl.add, context: this._footerBarEl.containerLeftEl },
            footerBarStyle: { fn: 'assign', target: 'style', context: this._footerBarEl.dom },

            resizable: { target: 'resizable' }, // Soll in der rechten unteren Ecke das resize-Sybmol zum ändern der Grösse angezeigt werden.
            shadow: { target: 'shadow' },       // Soll ein Schatten angezeigt werden?

            collapseHeight: true,
            collapseWidth: true,

            collapsePos: { prio: 1001, target: 'collapsePos' },
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
        this.on('enterPress', this._onEnterPress, this);
        this.on('escPress', this._onEscPress, this);

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }
    }


    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get closable() { return !!this._closeButtonEl;}
    set closable(val) {
        if (val) {
            if (!this._closeButtonEl) {
                this.closeButton = {
                    iconChar: '&#xf00d'
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
            this._closeButtonEl.on('click', this._onCloseClick, this);
            this._headerBarEl.containerRightEl.add(this._closeButtonEl);

        // Config-Objekt
        } else if (kijs.isObject(val)) {
            if (this._closeButtonEl) {
                this._closeButtonEl.applyConfig(val);
            } else {
                this._closeButtonEl = new kijs.gui.Button(val);
                this._closeButtonEl.on('click', this._onCloseClick, this);
                this._headerBarEl.containerRightEl.add(this._closeButtonEl);
            }

        } else {
            throw new kijs.Error(`Unkown format on config "closeButton"`);
        }

        if (this.isRendered) {
            this.render();
        }
    }


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
                throw new kijs.Error(`Unkown pos on config "collapsible"`);
            }
        }

        if (val) {
            if (!this._collapseButtonEl) {
                this.collapseButton = {
                    iconChar: this._getCollapseIconChar()
                };
            }
        } else {
            if (this._collapseButtonEl) {
                this.collapseButton = null;
            }
        }
    }

    get collapseButton() { return this._collapseButtonEl; }
    set collapseButton(val) {

        // Button entfernen
        if (kijs.isEmpty(val)) {
            this._headerBarEl.containerRightEl.remove(this._collapseButtonEl);
            this._collapseButtonEl = null;

        // Instanz von kijs.gui.Button
        } else if (val instanceof kijs.gui.Button) {
            if (this._collapseButtonEl) {
                this._headerBarEl.containerRightEl.remove(this._collapseButtonEl);
            }
            this._collapseButtonEl = val;
            this._collapseButtonEl.on('click', this._onCollapseClick, this);
            this._headerBarEl.containerRightEl.add(this._collapseButtonEl);

        // Config-Objekt
        } else if (kijs.isObject(val)) {
            if (this._collapseButtonEl) {
                this._collapseButtonEl.applyConfig(val);
            } else {
                this._collapseButtonEl = new kijs.gui.Button(val);
                this._collapseButtonEl.on('click', this._onCollapseClick, this);
                this._headerBarEl.containerRightEl.add(this._collapseButtonEl);
            }

        } else {
            throw new kijs.Error(`Unkown format on config "collapseButton"`);
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
            this.collapse();
        } else {
            this.expand();
        }
    }

    get collapseHeight() { return this._collapseHeight; }
    set collapseHeight(val) { this._collapseHeight = val; }

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

    get maximizable() { return !!this._closeButtonEl;}
    set maximizable(val) {
        if (val) {
            if (!this._maximizeButtonEl) {
                this.maximizeButton = new kijs.gui.Button({
                    iconChar: this._getMaximizeIconChar()
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
            this._maximizeButtonEl.on('click', this._onMaximizeClick, this);
            this._headerBarEl.containerRightEl.add(this._maximizeButtonEl);

        // Config-Objekt
        } else if (kijs.isObject(val)) {
            if (this._maximizeButtonEl) {
                this._maximizeButtonEl.applyConfig(val);
            } else {
                this._maximizeButtonEl = new kijs.gui.Button(val);
                this._maximizeButtonEl.on('click', this._onMaximizeClick, this);
                this._headerBarEl.containerRightEl.add(this._maximizeButtonEl);
            }

        } else {
            throw new kijs.Error(`Unkown format on config "maximizeButton"`);
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
        if (!!val !== !!this._resizerEl) {
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
    }

    get shadow() { this._dom.clsHas('kijs-shadow'); }
    set shadow(val) {
        if (val) {
            this._dom.clsAdd('kijs-shadow');
        } else {
            this._dom.clsRemove('kijs-shadow');
        }
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
    /**
     * Schliesst das Panel
     * @param {bool} [preventEvent=false] Kein 'close' Event auslösen
     * @returns {undefined}
     */
    close(preventEvent=false) {
        if (!preventEvent) {
            this.raiseEvent('close');
        }
        
        if (this._parentEl && this._parentEl instanceof kijs.gui.Container && this._parentEl.hasChild(this)) {
            this._parentEl.remove(this);
        } else {
            this.unrender();
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
            case 'top':    this._dom.clsAdd('kijs-collapse-top'); break;
            case 'right':  this._dom.clsAdd('kijs-collapse-right'); break;
            case 'bottom': this._dom.clsAdd('kijs-collapse-bottom'); break;
            case 'left':   this._dom.clsAdd('kijs-collapse-left'); break;
        }

        // das richtige Icon in den Button
        if (this._collapseButtonEl) {
            this._collapseButtonEl.iconChar = this._getCollapseIconChar();
        }

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
            this._collapseButtonEl.iconChar = this._getCollapseIconChar();
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

        // afterResize-Event wieder aktivieren
        this._preventAfterResize = prevAfterRes;

        // Evtl. afterResize-Event zeitversetzt auslösen
        this._raiseAfterResizeEvent(true);
    }

    // overwrite
    focus(alsoSetIfNoTabIndex=false) {
        if (alsoSetIfNoTabIndex) {
            return super.focus(alsoSetIfNoTabIndex);

        } else {
            // Zuerst versuchen den Fokus auf ein Element im innerDom zu setzen
            let node = this._innerDom.focus(false);
            // dann auf eine Schaltfläche im footer
            if (!node && !this._footerEl.isEmpty && this._footerEl.isRendered) {
                node = this._footerEl.focus(alsoSetIfNoTabIndex);
            }
            // falls nicht erfolgreich. Den Fokus direkt auf das Fenster setzen
            if (!node) {
                node = super.focus(alsoSetIfNoTabIndex);
            }
            return node;
        }

        // Darf der Node den Fokus erhalten?
        if (alsoSetIfNoTabIndex) {
            this._dom.node.focus();

        // sonst den Fokus auf den ersten möglichen untegeordneten Node settzen
        } else {
            const node = kijs.Dom.getFirstFocusableNode(this._node);
            if (node) {
                node.focus();
            }
        }
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

        this._dom.clsAdd('kijs-maximize');

        // das richtige Icon in den Button
        if (this._maximizeButtonEl) {
            this._maximizeButtonEl.iconChar = this._getMaximizeIconChar();
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
        } else {
            this._headerBarEl.unrender();
        }

        // Header rendern (kijs.gui.Container)
        if (!this._headerEl.isEmpty) {
            this._headerEl.renderTo(this._dom.node, this._innerDom.node);
        } else {
            this._headerEl.unrender();
        }

        // Footer rendern (kijs.gui.Container)
        if (!this._footerEl.isEmpty) {
            this._footerEl.renderTo(this._dom.node);
        } else {
            this._footerEl.unrender();
        }

        // FooterBar rendern (kijs.gui.Bar)
        if (!this._footerBarEl.isEmpty) {
            this._footerBarEl.renderTo(this._dom.node);
        } else {
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

        // das richtige Icon in den Button
        if (this._maximizeButtonEl) {
            this._maximizeButtonEl.iconChar = this._getMaximizeIconChar();
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

        this._headerBarEl.unrender();
        this._headerEl.unrender();
        this._footerEl.unrender();
        this._footerBarEl.unrender();
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
    _getMaximizeIconChar() {
        let char = '';

        if (this.maximized) {
            char = '&#xf2d2';   // restore
        } else {
            char = '&#xf2d0';   // maximize
        }

        return char;
    }

    /**
     * Gibt das Icon für den Collapse-Knopf zurück
     * @returns {undefined}
     */
    _getCollapseIconChar() {
        let char = '';

        if (this.collapsed) {
            switch (this._collapsible) {
                case 'top': char = '&#xf0d7'; break;   // carret-down
                case 'right': char = '&#xf0d9'; break; // carret-left
                case 'bottom': char = '&#xf0d8'; break;// carret-up
                case 'left': char = '&#xf0da'; break;  // carret-right
            }
        } else {
            switch (this._collapsible) {
                case 'top': char = '&#xf0d8'; break;   // carret-up
                case 'right': char = '&#xf0da'; break; // carret-right
                case 'bottom': char = '&#xf0d7'; break;// carret-down
                case 'left': char = '&#xf0d9'; break;  // carret-left
            }
        }
        return char;
    }

    // LISTENERS
    _onCloseClick(e) {
        this.close();
    }

    _onCollapseClick(e) {
        if (this.collapsed) {
            this.expand();
        } else {
            this.collapse();
        }
    }

    _onEscPress(e) {
        if (this.closable) {
            this.close();
        }
    }

    _onEnterPress(e) {
        // Gibt es einen Button mit Eigenschaft isDefault?
        if (this._footerEl) {
            kijs.Array.each(this._footerEl.elements, function(el) {
                if (el instanceof kijs.gui.Button && el.dom && el.isDefault) {
                    el.raiseEvent('click');
                    return;
                }
            }, this);
        }
    }

    _onHeaderBarClick(e) {
        // Ein Panel (draggable=false) kann per click auf die HeaderBar auf/zugeklappt werden.
        if (this.collapsible && !this.maximized && !this.draggable) {
            if (this.collapsed) {
                this.expand();
            } else {
                this.collapse();
            }
        }
    }

    _onHeaderBarDblClick(e) {
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

    _onMaximizeClick(e) {
        if (this.maximized) {
            this.restore();
        } else {
            this.maximize();
        }
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

        // Basisklasse entladen
        super.destruct(true);
    }

};