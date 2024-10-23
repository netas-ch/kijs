/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.container.Scrollable
// --------------------------------------------------------------
/**
 * Wie kijs.gui.Container, jedoch werden anstelle von Scrollbars Scroll-Buttons angezeigt.
 *
 * KLASSENHIERARCHIE
 * kijs.gui.Element
 *  kijs.gui.Container
 *   kijs.gui.container.Scrollable
 *
 * CONFIG-Parameter (es gelten auch die Config-Parameter der Basisklassen)
 * ----------------
 * disableSmoothScrolling Boolean [optional] default=false  Sanftes Scrollen ausschalten
 * 
 * scrollableX  Boolean|String [optional] default=false     Soll auf der X-Achse gescrollt werden können?
 *                                                          true=Ja, false=Nein, 'auto'=wenn erforderlich
 * 
 * scrollableY  Boolean|String [optional] default=false     Soll auf der Y-Achse gescrollt werden können?
 *                                                          true=Ja, false=Nein, 'auto'=wenn erforderlich
 *
 * scrollDelay  Number [optional] default=150               Wert in ms. Wenn eine Scroll-Taste 
 *                                                          gehalten wird, wird in diesem Abstand gescrollt
 * 
 * scrollStep   Number [optional] default=20                Anzahl Pixel, die bei einem Klick auf einen
 *                                                          Scroll-Button gescrollt wird
 * 
 * EIGENSCHAFTEN (es gelten auch die Eigenschaften der Basisklassen)
 * -------------
 * scrollableX  Boolean|String [optional] default=false     Soll auf der X-Achse gescrollt werden können?
 *                                                          true=Ja, false=Nein, 'auto'=wenn erforderlich
 * 
 * scrollableY  Boolean|String [optional] default=false     Soll auf der Y-Achse gescrollt werden können?
 *                                                          true=Ja, false=Nein, 'auto'=wenn erforderlich
 *
 *
 * EVENTS
 * ----------
 * 
 */
kijs.gui.container.Scrollable = class kijs_gui_container_Scrollable extends kijs.gui.Container {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);
        
        this._scrollableX = false;
        this._scrollableY = false;
        this._scrollDeferId = null;
        this._scrollStep = 20;
        this._scrollDelay = 150;
        this._disableSmoothScrolling = false;
        this._touchXStart = null;
        this._touchYStart = null;

        this._btnUpDom = new kijs.gui.Dom({
            cls: 'kijs-btn-scrollup',
            on: {
                mouseDown: this.#onBtnScrollUpMouseDown,
                touchStart: this.#onBtnScrollUpMouseDown,
                dragOver: this.#onBtnScrollUpMouseDown,
                mouseUp: this.#onBtnScrollMouseUp,
                touchEnd: this.#onBtnScrollMouseUp,
                dragLeave: this.#onBtnScrollMouseUp,
                context: this
            }
        });
        
        this._btnLeftDom = new kijs.gui.Dom({
            cls: 'kijs-btn-scrollleft',
            on: {
                mouseDown: this.#onBtnScrollLeftMouseDown,
                touchStart: this.#onBtnScrollLeftMouseDown,
                dragOver: this.#onBtnScrollLeftMouseDown,
                mouseUp: this.#onBtnScrollMouseUp,
                touchEnd: this.#onBtnScrollMouseUp,
                dragLeave: this.#onBtnScrollMouseUp,
                context: this
            }
        });
        
        this._btnRightDom = new kijs.gui.Dom({
            cls: 'kijs-btn-scrollright',
            on: {
                mouseDown: this.#onBtnScrollRightMouseDown,
                touchStart: this.#onBtnScrollRightMouseDown,
                dragOver: this.#onBtnScrollRightMouseDown,
                mouseUp: this.#onBtnScrollMouseUp,
                touchEnd: this.#onBtnScrollMouseUp,
                dragLeave: this.#onBtnScrollMouseUp,
                context: this
            }
        });
        
        this._btnDownDom = new kijs.gui.Dom({
            cls: 'kijs-btn-scrolldown',
            on: {
                mouseDown: this.#onBtnScrollDownMouseDown,
                touchStart: this.#onBtnScrollDownMouseDown,
                dragOver: this.#onBtnScrollDownMouseDown,
                mouseUp: this.#onBtnScrollMouseUp,
                touchEnd: this.#onBtnScrollMouseUp,
                dragLeave: this.#onBtnScrollMouseUp,
                context: this
            }
        });
        
        
        this._iconUpEl = new kijs.gui.Icon({
            parent: this,
            name: 'up',
            cls: 'kijs-icon-scrollup'
        });
        
        this._iconLeftEl = new kijs.gui.Icon({
            parent: this,
            name: 'left',
            cls: 'kijs-icon-scrollleft',
            on: {
                mouseDown: this.#onBtnScrollLeftMouseDown,
                mouseUp: this.#onBtnScrollMouseUp,
                context: this
            }
        });
        
        this._iconRightEl = new kijs.gui.Icon({
            parent: this,
            name: 'right',
            cls: 'kijs-icon-scrollright',
            on: {
                mouseDown: this.#onBtnScrollRightMouseDown,
                mouseUp: this.#onBtnScrollMouseUp,
                context: this
            }
        });
        
        this._iconDownEl = new kijs.gui.Icon({
            parent: this,
            name: 'down',
            cls: 'kijs-icon-scrolldown',
            on: {
                mouseDown: this.#onBtnScrollDownMouseDown,
                mouseUp: this.#onBtnScrollMouseUp,
                context: this
            }
        });
        
        this._dom.clsRemove('kijs-container');
        this._dom.clsAdd('kijs-container-scrollable');
        
        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            iconDownMap: 'kijs.iconMap.Fa.chevron-down',
            iconLeftMap: 'kijs.iconMap.Fa.chevron-left',
            iconRightMap: 'kijs.iconMap.Fa.chevron-right',
            iconUpMap: 'kijs.iconMap.Fa.chevron-up'
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            disableSmoothScrolling: true,
            scrollableX: { target: 'scrollableX' },
            scrollableY: { target: 'scrollableY' },
            scrollDelay: true,
            scrollStep: true,
            
            iconDown: { target: 'iconDown' },
            iconDownMap: { target: 'iconMap', context: this._iconDownEl },
            iconDownChar: { target: 'iconChar', context: this._iconDownEl },
            iconDownCls: { target: 'iconCls', context: this._iconDownEl },
            iconDownColor: { target: 'iconColor', context: this._iconDownEl },
            
            iconLeft: { target: 'iconLeft' },
            iconLeftMap: { target: 'iconMap', context: this._iconLeftEl },
            iconLeftChar: { target: 'iconChar', context: this._iconLeftEl },
            iconLeftCls: { target: 'iconCls', context: this._iconLeftEl },
            iconLeftColor: { target: 'iconColor', context: this._iconLeftEl },
            
            iconRight: { target: 'iconRight' },
            iconRightMap: { target: 'iconMap', context: this._iconRightEl },
            iconRightChar: { target: 'iconChar', context: this._iconRightEl },
            iconRightCls: { target: 'iconCls', context: this._iconRightEl },
            iconRightColor: { target: 'iconColor', context: this._iconRightEl },

            iconUp: { target: 'iconUp' },
            iconUpMap: { target: 'iconMap', context: this._iconUpEl },
            iconUpChar: { target: 'iconChar', context: this._iconUpEl },
            iconUpCls: { target: 'iconCls', context: this._iconUpEl },
            iconUpColor: { target: 'iconColor', context: this._iconUpEl }
        });
        
        // Listeners
        this.on('afterResize', this.#onAfterResize, this);
        this.on('childElementAfterResize', this.#onChildElementAfterResize, this);
        this.on('scrollEnd', this.#onScrollEnd, this);
        this.on('touchEnd', this.#onTouchEnd, this);
        this.on('touchMove', this.#onTouchMove, this);
        this.on('touchStart', this.#onTouchStart, this);
        this.on('wheel', this.#onWheel, this);

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }
    }



    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get disableSmoothScrolling() { return this._disableSmoothScrolling; }
    set disableSmoothScrolling(val) { this._disableSmoothScrolling = val; }
    
    
    get iconDown() { return this._iconDownEl; }
    /**
     * Icon zuweisen
     * @param {kijs.gui.Icon|Object} val     Icon als icon-Config oder kijs.gui.Icon Element
     */
    set iconDown(val) {
        // Icon zurücksetzen?
        if (kijs.isEmpty(val)) {
            this._iconDownEl.iconChar = null;
            this._iconDownEl.iconCls = null;
            this._iconDownEl.iconColor = null;
            if (this.isRendered) {
                this.render();
            }

        // kijs.gui.Icon Instanz
        } else if (val instanceof kijs.gui.Icon) {
            this._iconDownEl.destruct();
            this._iconDownEl = val;
            if (this.isRendered) {
                this.render();
            }

        // Config Objekt
        } else if (kijs.isObject(val)) {
            this._iconDownEl.applyConfig(val);
            if (this.isRendered) {
                this.render();
            }

        } else {
            throw new kijs.Error(`config "iconDown" is not valid.`);

        }
    }

    get iconDownChar() { return this._iconDownEl.iconChar; }
    set iconDownChar(val) { this._iconDownEl.iconChar = val; }

    get iconDownCls() { return this._iconDownEl.iconCls; }
    set iconDownCls(val) { this._iconDownEl.iconCls = val; }

    get iconDownColor() { return this._iconDownEl.iconColor; }
    set iconDownColor(val) { this._iconDownEl.iconColor = val; }

    set iconDownMap(val) { this._iconDownEl.iconMap = val; }
    
    
    get iconLeft() { return this._iconLeftEl; }
    /**
     * Icon zuweisen
     * @param {kijs.gui.Icon|Object} val     Icon als icon-Config oder kijs.gui.Icon Element
     */
    set iconLeft(val) {
        // Icon zurücksetzen?
        if (kijs.isEmpty(val)) {
            this._iconLeftEl.iconChar = null;
            this._iconLeftEl.iconCls = null;
            this._iconLeftEl.iconColor = null;
            if (this.isRendered) {
                this.render();
            }

        // kijs.gui.Icon Instanz
        } else if (val instanceof kijs.gui.Icon) {
            this._iconLeftEl.destruct();
            this._iconLeftEl = val;
            if (this.isRendered) {
                this.render();
            }

        // Config Objekt
        } else if (kijs.isObject(val)) {
            this._iconLeftEl.applyConfig(val);
            if (this.isRendered) {
                this.render();
            }

        } else {
            throw new kijs.Error(`config "iconLeft" is not valid.`);

        }
    }

    get iconLeftChar() { return this._iconLeftEl.iconChar; }
    set iconLeftChar(val) { this._iconLeftEl.iconChar = val; }

    get iconLeftCls() { return this._iconLeftEl.iconCls; }
    set iconLeftCls(val) { this._iconLeftEl.iconCls = val; }

    get iconLeftColor() { return this._iconLeftEl.iconColor; }
    set iconLeftColor(val) { this._iconLeftEl.iconColor = val; }

    set iconLeftMap(val) { this._iconLeftEl.iconMap = val; }
    
    
    get iconRight() { return this._iconRightEl; }
    /**
     * Icon zuweisen
     * @param {kijs.gui.Icon|Object} val     Icon als icon-Config oder kijs.gui.Icon Element
     */
    set iconRight(val) {
        // Icon zurücksetzen?
        if (kijs.isEmpty(val)) {
            this._iconRightEl.iconChar = null;
            this._iconRightEl.iconCls = null;
            this._iconRightEl.iconColor = null;
            if (this.isRendered) {
                this.render();
            }

        // kijs.gui.Icon Instanz
        } else if (val instanceof kijs.gui.Icon) {
            this._iconRightEl.destruct();
            this._iconRightEl = val;
            if (this.isRendered) {
                this.render();
            }

        // Config Objekt
        } else if (kijs.isObject(val)) {
            this._iconRightEl.applyConfig(val);
            if (this.isRendered) {
                this.render();
            }

        } else {
            throw new kijs.Error(`config "iconRight" is not valid.`);

        }
    }

    get iconRightChar() { return this._iconRightEl.iconChar; }
    set iconRightChar(val) { this._iconRightEl.iconChar = val; }

    get iconRightCls() { return this._iconRightEl.iconCls; }
    set iconRightCls(val) { this._iconRightEl.iconCls = val; }

    get iconRightColor() { return this._iconRightEl.iconColor; }
    set iconRightColor(val) { this._iconRightEl.iconColor = val; }

    set iconRightMap(val) { this._iconRightEl.iconMap = val; }
    
    
    get iconUp() { return this._iconUpEl; }
    /**
     * Icon zuweisen
     * @param {kijs.gui.Icon|Object} val     Icon als icon-Config oder kijs.gui.Icon Element
     */
    set iconUp(val) {
        // Icon zurücksetzen?
        if (kijs.isEmpty(val)) {
            this._iconUpEl.iconChar = null;
            this._iconUpEl.iconCls = null;
            this._iconUpEl.iconColor = null;
            if (this.isRendered) {
                this.render();
            }

        // kijs.gui.Icon Instanz
        } else if (val instanceof kijs.gui.Icon) {
            this._iconUpEl.destruct();
            this._iconUpEl = val;
            if (this.isRendered) {
                this.render();
            }

        // Config Objekt
        } else if (kijs.isObject(val)) {
            this._iconUpEl.applyConfig(val);
            if (this.isRendered) {
                this.render();
            }

        } else {
            throw new kijs.Error(`config "iconUp" is not valid.`);

        }
    }

    get iconUpChar() { return this._iconUpEl.iconChar; }
    set iconUpChar(val) { this._iconUpEl.iconChar = val; }

    get iconUpCls() { return this._iconUpEl.iconCls; }
    set iconUpCls(val) { this._iconUpEl.iconCls = val; }

    get iconUpColor() { return this._iconUpEl.iconColor; }
    set iconUpColor(val) { this._iconUpEl.iconColor = val; }

    set iconUpMap(val) { this._iconUpEl.iconMap = val; }
    
    
    // overwrite
    get scrollableX() { return this._scrollableX; };
    // overwrite
    set scrollableX(val) {
        this._scrollableX = val;
        if (this.isRendered) {
            this._renderScrollButtons();
        }
    }
    
    // overwrite
    get scrollableY() { return this._scrollableY; }
    // overwrite
    set scrollableY(val) {
        this._scrollableY = val;
        if (this.isRendered) {
            this._renderScrollButtons();
        }
    }
    
    get scrollDelay() { return this._scrollDelay; }
    set scrollDelay(val) { this._scrollDelay = val; }

    get scrollStep() { return this._scrollStep; }
    set scrollStep(val) { this._scrollStep = val; }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // overwrite
    changeDisabled(val, callFromParent) {
        super.changeDisabled(!!val, callFromParent);
        this._btnUpDom.changeDisabled(!!val, true);
        this._btnLeftDom.changeDisabled(!!val, true);
        this._btnRightDom.changeDisabled(!!val, true);
        this._btnDownDom.changeDisabled(!!val, true);
    }
    
    // overwrite
    render(superCall) {
        super.render(true);
        
        // Scroll-Buttons rendern/entfernen
        this._renderScrollButtons();
        
        // Zeitverzögert kontrollieren, ob der Inhalt Platz hat oder ob Scrollbuttons nötig sind,
        // wenn Ja: diese noch rendern. Wenn nein: unrendern
        if (this._scrollableX === 'auto' || this._scrollableY === 'auto') {
            kijs.defer(this._renderScrollButtons, 20, this);
            
        // Wenn Scrollbar sichtbar Schaltflächen aktivieren/deaktivieren
        } else if (this._scrollableX || this._scrollableY) {
            kijs.defer(this._updateButtons, 20, this);
        }
        
        // Event afterRender auslösen
        if (!superCall) {
            this.raiseEvent('afterRender');
        }
    }

    // overwrite
    unrender(superCall) {
        this._scrollStop();
        
        // Event auslösen.
        if (!superCall) {
            this.raiseEvent('unrender');
        }
        
        this._iconUpEl.unrender();
        this._iconLeftEl.unrender();
        this._iconRightEl.unrender();
        this._iconDownEl.unrender();
        
        this._btnUpDom.unrender();
        this._btnLeftDom.unrender();
        this._btnRightDom.unrender();
        this._btnDownDom.unrender();
        
        super.unrender(true);
    }


    // PROTECTED
    // Scroll-Buttons rendern/entfernen
    _renderScrollButtons() {
        let hasScrollX = false;
        let hasScrollY = false;
        
        if (!this._innerDom || !this._innerDom.node) {
            return;
        }
        
        // Buttons auf X-Achse nötig?
        if (this._scrollableX === 'auto') {
            if (this._innerDom.node.scrollWidth > this._dom.node.clientWidth) {
                hasScrollX = true;
            }
        } else if (this._scrollableX) {
            hasScrollX = true;
        }
        
        // Buttons auf Y-Achse nötig?
        if (this._scrollableY === 'auto') {
            if (this._innerDom.node.scrollHeight > this._dom.node.clientHeight) {
                hasScrollY = true;
            }
        } else if (this._scrollableY) {
            hasScrollY = true;
        }
        
        
        // CSS hinzufügen/entfernen
        if (hasScrollX) {
            this._dom.clsAdd('kijs-scrollable-x-enable');
        } else {
            this._dom.clsRemove('kijs-scrollable-x-enable');
        }
        
        if (hasScrollY) {
            this._dom.clsAdd('kijs-scrollable-y-enable');
        } else {
            this._dom.clsRemove('kijs-scrollable-y-enable');
        }
        
        
        // Rendern oder unrendern
        // Up (kijs.guiDom)
        if (hasScrollY) {
            this._btnUpDom.renderTo(this._dom.node, this._innerDom.node);
            this._iconUpEl.renderTo(this._btnUpDom.node);
        } else if (this._iconUpEl.isRendered) {
            this._iconUpEl.unrender();
            this._btnUpDom.unrender();
        }

        // Left (kijs.guiDom)
        if (hasScrollX) {
            this._btnLeftDom.renderTo(this._dom.node, this._innerDom.node);
            this._iconLeftEl.renderTo(this._btnLeftDom.node);
        } else if (this._iconLeftEl.isRendered) {
            this._iconLeftEl.unrender();
            this._btnLeftDom.unrender();
        }

        // Right (kijs.guiDom)
        if (hasScrollX) {
            this._btnRightDom.renderTo(this._dom.node);
            this._iconRightEl.renderTo(this._btnRightDom.node);
        } else if (this._iconRightEl.isRendered) {
            this._iconRightEl.unrender();
            this._btnRightDom.unrender();
        }

        // Down (kijs.guiDom)
        if (hasScrollY) {
            this._btnDownDom.renderTo(this._dom.node);
            this._iconDownEl.renderTo(this._btnDownDom.node);
        } else if (this._iconDownEl.isRendered) {
            this._iconDownEl.unrender();
            this._btnDownDom.unrender();
        }
        
        // Schaltflächen aktivieren/deaktivieren
        this._updateButtons();
    }
    
    // starten das Scrollen in eine Richtung
    _scrollStart(dir) {
        // falls bereits gescrollt wird: abbrechen
        this._scrollStop();
        
        let opt = {};
        
        switch (dir) {
            case 'up':    opt.top  = this._innerDom.node.scrollTop + this._scrollStep*-1; break;
            case 'left':  opt.left = this._innerDom.node.scrollLeft + this._scrollStep*-1; break;
            case 'right': opt.left = this._innerDom.node.scrollLeft + this._scrollStep; break;
            case 'down':  opt.top  = this._innerDom.node.scrollTop + this._scrollStep; break;
        }
        
        if (!this._disableSmoothScrolling) {
            opt.behavior = 'smooth';
        }
        
        this._innerDom.node.scrollTo(opt);
        
        this._scrollDeferId = kijs.defer(this._scrollStart, this._scrollDelay, this, dir);
    }
    
    // stoppt das Scrollen
    _scrollStop() {
        if (this._scrollDeferId) {
            clearTimeout(this._scrollDeferId);
            this._scrollDeferId = null;
        }
    }
    
    // Schaltflächen aktivieren/deaktivieren
    _updateButtons() {
        if (!this._innerDom) {
            return;
        }
        
        if (this.disabled) {
            return;
        }
        
        this._btnUpDom.disabled = this._innerDom.node.scrollTop <= 0;
        this._btnLeftDom.disabled = this._innerDom.node.scrollLeft <= 0;
        this._btnRightDom.disabled = Math.abs(this._innerDom.node.scrollWidth - 
                this._innerDom.node.clientWidth - 
                this._innerDom.node.scrollLeft) <= 1;
        this._btnDownDom.disabled = Math.abs(this._innerDom.node.scrollHeight - 
                this._innerDom.node.clientHeight - 
                this._innerDom.node.scrollTop) <= 1;
    }
    
    
    // PRIVATE
    // LISTENERS
    #onBtnScrollDownMouseDown(e) {
        if (!this._btnDownDom.disabled) {
            this._scrollStart('down');
        }
    }
    
    #onBtnScrollLeftMouseDown(e) {
        if (!this._btnLeftDom.disabled) {
            this._scrollStart('left');
        }
    }
    
    #onBtnScrollMouseUp(e) {
        this._scrollStop();
    }
    
    #onBtnScrollRightMouseDown(e) {
        if (!this._btnRightDom.disabled) {
            this._scrollStart('right');
        }
    }
    
    #onBtnScrollUpMouseDown(e) {
        if (!this._btnUpDom.disabled) {
            this._scrollStart('up');
        }
    }
    
    // Wenn die Grösse des Containers verändert wird, müssen evtl. 
    // die Buttons ein-/ausgeblendet werden
    #onAfterResize(e) {
        if (this._scrollableX === 'auto' || this._scrollableY === 'auto') {
            kijs.defer(this._renderScrollButtons, 20, this);
        } else if (this._scrollableX || this._scrollableY) {
            kijs.defer(this._updateButtons, 20, this);
        }
    }
    
    // Wenn die Grösse eines Kind-Elements verändert wird, müssen evtl. 
    // die Buttons ein-/ausgeblendet werden
    #onChildElementAfterResize(e) {
        if (this._scrollableX === 'auto' || this._scrollableY === 'auto') {
            kijs.defer(this._renderScrollButtons, 20, this);
        } else if (this._scrollableX || this._scrollableY) {
            kijs.defer(this._updateButtons, 20, this);
        }
    }
    
    #onScrollEnd(e) {
        // Schaltflächen aktivieren/deaktivieren
        this._updateButtons();
    }
    
    #onTouchEnd(e) {
        // Buttons rendern
        this._renderScrollButtons();
    }

    #onTouchMove(e) {
        const hasScrollbarX = this._dom.clsHas('kijs-scrollable-x-enable');
        const hasScrollbarY = this._dom.clsHas('kijs-scrollable-y-enable');

        const deltaX = this._touchXStart - e.nodeEvent.touches[0].clientX;
        const deltaY = this._touchYStart - e.nodeEvent.touches[0].clientY;

        // Scrollbar auf Y + X Achse
        if (hasScrollbarY && hasScrollbarX) {
            this._innerDom.node.scrollTop += deltaY;
            this._innerDom.node.scrollLeft += deltaX;

            // Scrollbar nur auf Y Achse
        } else if (hasScrollbarY) {
            this._innerDom.node.scrollTop += deltaY;

            // Scrollbar nur auf X Achse
        } else if (hasScrollbarX) {
            this._innerDom.node.scrollLeft += deltaX;
        }

        // Aktuelle Startpunkte setzen
        this._touchXStart = e.nodeEvent.touches[0].clientX;
        this._touchYStart = e.nodeEvent.touches[0].clientY;

        if (hasScrollbarX || hasScrollbarY) {
            // Bubbeling und native Listeners verhindern
            e.nodeEvent.stopPropagation();
            e.nodeEvent.preventDefault();
        }
    }

    #onTouchStart(e) {
        // Startpunkte setzen
        this._touchXStart = e.nodeEvent.touches[0].clientX;
        this._touchYStart = e.nodeEvent.touches[0].clientY;
    }
       
    #onWheel(e) {
        const hasScrollbarX = this._dom.clsHas('kijs-scrollable-x-enable');
        const hasScrollbarY = this._dom.clsHas('kijs-scrollable-y-enable');
        
        // Scrollbar auf Y + X Achse
        if (hasScrollbarY && hasScrollbarX) {
            this._innerDom.node.scrollTop += e.nodeEvent.deltaY;
            this._innerDom.node.scrollLeft += e.nodeEvent.deltaX;
            
        // Scrollbar nur auf Y Achse
        } else if (hasScrollbarY) {
            this._innerDom.node.scrollTop += e.nodeEvent.deltaY;
            
        // Scrollbar nur auf X Achse
        } else if (hasScrollbarX) {
            // Mit dem Mausrad kann auf der X-Achse gescrollt werden
            if (e.nodeEvent.deltaX) {
                this._innerDom.node.scrollLeft += e.nodeEvent.deltaX;
            } else {
                this._innerDom.node.scrollLeft += e.nodeEvent.deltaY;
            }
        }
        
        if (hasScrollbarX || hasScrollbarY) {
            // Bubbeling und native Listeners verhindern
            e.nodeEvent.stopPropagation();
            e.nodeEvent.preventDefault();
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
        if (this._iconUpEl) {
            this._iconUpEl.destruct();
        }
        if (this._iconLeftEl) {
            this._iconLeftEl.destruct();
        }
        if (this._iconRightEl) {
            this._iconRightEl.destruct();
        }
        if (this._iconDownEl) {
            this._iconDownEl.destruct();
        }
        
        if (this._btnUpDom) {
            this._btnUpDom.destruct();
        }
        if (this._btnLeftDom) {
            this._btnLeftDom.destruct();
        }
        if (this._btnRightDom) {
            this._btnRightDom.destruct();
        }
        if (this._btnDownDom) {
            this._btnDownDom.destruct();
        }
        
        // Variablen (Objekte/Arrays) leeren
        this._iconUpEl = null;
        this._iconLeftEl = null;
        this._iconRightEl = null;
        this._iconDownEl = null;
        
        this._btnUpDom = null;
        this._btnLeftDom = null;
        this._btnRightDom = null;
        this._btnDownDom = null;

        // Basisklasse entladen
        super.destruct(true);
    }
    
};
