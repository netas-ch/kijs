/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.grid.HeaderCell
// --------------------------------------------------------------
/**
 * EVENTS
 * ----------
 *
 */
kijs.gui.grid.HeaderCell = class kijs_gui_grid_HeaderCell extends kijs.gui.Element {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        // DOM type
        this._dom.nodeTagName = 'td';
        this._columnConfig = null;
        this._initialPos = 0;
        this._splitterMove = false;
        this._sort = null;

        // drag events
        this._dom.nodeAttributeSet('draggable', false);
        kijs.DragDrop.addDragEvents(this, this._dom);
        kijs.DragDrop.addDropEvents(this, this._dom);

        this.on('ddStart', this._onDdStart, this);
        this.on('ddOver', this._onDdOver, this);
        this.on('ddDrop', this._onDdDrop, this);

        // DOM für label
        this._captionContainerDom = new kijs.gui.Dom({cls:'kijs-caption'});
        this._captionDom = new kijs.gui.Dom({nodeTagName:'span', htmlDisplayType: 'code'});
        this._sortDom = new kijs.gui.Dom({nodeTagName:'span', cls:'kijs-sort', htmlDisplayType: 'code'});

        this._helpIconEl = new kijs.gui.Icon({
            parent  : this,
            iconChar: 0xf29C,
            iconCls : 'kijs-icon-help kijs-tooltip-icon',
            visible : false,
            tooltip : new kijs.gui.Tooltip({
                cls: 'kijs-help',
                followPointer: false
            })
        });

        // DOM für Menu
        this._menuButtonEl = new kijs.gui.Button({
            parent: this,
            menuElements: [{
                    name    : 'btn-sort-asc',
                    caption : kijs.getText('Aufsteigend sortieren'),
                    iconMap: 'kijs.iconMap.Fa.arrow-down-a-z',
                    on: {
                        click: function() {
                            this.header.grid.sort(this.columnConfig.valueField, 'ASC');
                            this._menuButtonEl.menu.close();
                        },
                        context: this
                    }
                },{
                    name    : 'btn-sort-desc',
                    caption : kijs.getText('Absteigend sortieren'),
                    iconMap: 'kijs.iconMap.Fa.arrow-down-z-a',
                    on: {
                        click: function() {
                            this.header.grid.sort(this.columnConfig.valueField, 'DESC');
                            this._menuButtonEl.menu.close();
                        },
                        context: this
                    }
                },{
                    name    : 'btn-columns',
                    caption : kijs.getText('Spalten') + '...',
                    iconMap: 'kijs.iconMap.Fa.table-columns',
                    on: {
                        click: function() {
                            (new kijs.gui.grid.ColumnWindow({parent: this})).show();
                            this._menuButtonEl.menu.close();
                        },
                        context: this
                    }
                },{
                    name    : 'btn-filters',
                    caption : kijs.getText('Filter') + '...',
                    iconMap: 'kijs.iconMap.Fa.filter',
                    on: {
                        click: function() {
                            this.parent.grid.filter.visible = !this.parent.grid.filter.visible;
                            this._menuButtonEl.menu.close();
                        },
                        context: this
                    }
                }]
        });

        // DOM für Schieber
        this._splitterDom = new kijs.gui.Dom({
            cls:'kijs-splitter',
            on: {
                mouseDown: this._onSplitterMouseDown,
                context: this
            }
        });

        // DOM für Schieber overlay
        this._overlayDom = new kijs.gui.Dom({cls:'kijs-splitter-overlay'});

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            columnConfig: true,
            sort: { target: 'sort' },

            helpIcon: { target: 'helpIcon' },
            helpIconChar: { target: 'iconChar', context: this._helpIconEl },
            helpIconCls: { target: 'iconCls', context: this._helpIconEl },
            helpIconColor: { target: 'iconColor', context: this._helpIconEl },
            helpIconMap: { target: 'iconMap', context: this._helpIconEl },
            helpText: { target: 'helpText' }
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

    get caption() { return this._captionDom.html; }
    set caption(val) { this.setCaption(val); }

    get columnConfig() { return this._columnConfig; }
    set columnConfig(val) { this._columnConfig = val; }

    get header() { return this.parent; }

    get helpIcon() { return this._helpIconEl; }
    /**
     * Icon zuweisen
     * @param {kijs.gui.Icon|Object} val     Icon als icon-Config oder kijs.gui.Icon Element
     */
    set helpIcon(val) {
        if (kijs.isEmpty(val)) {

            // Icon zurücksetzen?
            this._helpIconEl.iconChar = null;
            this._helpIconEl.iconCls = null;
            this._helpIconEl.iconColor = null;

        } else if (val instanceof kijs.gui.Icon) {

            // kijs.gui.Icon Instanz
            this._helpIconEl.destruct();
            this._helpIconEl = val;
            if (this.isRendered) {
                this.render();
            }

        } else if (kijs.isObject(val)) {

            // Config Objekt
            this._helpIconEl.applyConfig(val);
            if (this.isRendered) {
                this._helpIconEl.render();
            }

        } else {
            throw new kijs.Error(`config "helpIcon" is not valid.`);
        }
    }

    get helpIconChar() { return this._helpIconEl.iconChar; }
    set helpIconChar(val) { this._helpIconEl.iconChar = val; }

    get helpIconCls() { return this._helpIconEl.iconCls; }
    set helpIconCls(val) { this._helpIconEl.iconCls = val; }

    get helpIconColor() { return this._helpIconEl.iconColor; }
    set helpIconColor(val) { this._helpIconEl.iconColor = val; }

    get helpIconMap() { return this._helpIconEl.iconMap; }
    set helpIconMap(val) { this._helpIconEl.iconMap = val; }

    get helpText() { return this._helpIconEl.tooltip.html; }
    set helpText(val) {
        this._helpIconEl.tooltip.html = val;
        this._helpIconEl.visible = !kijs.isEmpty(this._helpIconEl.tooltip.html);
    }

    get index() {
        if (this.header) {
            return this.header.cells.indexOf(this);
        }
        return null;
    }

    get sort() { return this._sort; }
    set sort(val) {
        if (val === 'DESC') {
            this._sortDom.html = String.fromCodePoint(0xf0d7); // caret-down
            this._sort = val;

        } else if (val === 'ASC') {
            this._sortDom.html = String.fromCodePoint(0xf0d8); // caret-up
            this._sort = val;

        } else {
            this._sortDom.html = '';
            this._sort = null;
        }
    }


    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------

    /**
     * Setzt das caption der Zelle.
     * @param {String} caption
     * @param {Boolean} [updateColumnConfig=true] true, falls kein change-event ausgelöst werden soll.
     * @returns {undefined}
     */
    setCaption(caption, updateColumnConfig=true) {
        // HTML aktualisieren
        this._captionDom.html = caption;

        if (updateColumnConfig) {
            this._columnConfig.caption = caption;
        }

        if (this.isRendered) {
            this.render();
        }
    }

    /**
     * Lädt das value von der dataRow
     * @returns {undefined}
     */
    loadFromColumnConfig() {

        // Caption
        let c = this._columnConfig.caption;
        this.setCaption(c, false);

        // Tooltip
        if (this._columnConfig.tooltip) {
            this.helpText = this._columnConfig.tooltip;
        } else {
            this.helpText = '';
        }

        this._menuButtonEl.menu.down('btn-filters').visible = !!this.parent.grid.filterable;
        this._menuButtonEl.menu.down('btn-sort-asc').visible = !!this._columnConfig.sortable;
        this._menuButtonEl.menu.down('btn-sort-desc').visible = !!this._columnConfig.sortable;
    }

    // PROTECTED
    /**
     * Aktualisiert die Overlay-Position aufgrund der Mauszeigerposition
     * @param {Number} xAbs     Mausposition clientX
     * @param {Number} yAbs     Mausposition clientY
     * @returns {undefined}
     */
    _updateOverlayPosition(xAbs, yAbs) {
        // Berechnet aus der absoluten Position bezogen zum Browserrand,
        // die relative Position bezogen zum übergeordneten DOM-Node
        const parentPos = kijs.Dom.getAbsolutePos(this.parent.grid.dom.node);
        const newPos = {
            x: xAbs - parentPos.x,
            y: yAbs - parentPos.x
        };

        this._overlayDom.left = newPos.x;
    }

    // LISTENER
    _onDdStart(e) {
        // wenn splitter nicht bewegt wird, drag starten
        if (this._splitterMove) {
            return false;
        }
    }

    _onDdOver(e) {
        if (this._splitterMove || this.header.cells.indexOf(e.sourceElement) === -1 || e.sourceElement.columnConfig.sortable === false) {
            // fremdes Element, kein Drop.
            e.position.allowAbove = false;
            e.position.allowBelow = false;
            e.position.allowLeft = false;
            e.position.allowOnto = false;
            e.position.allowRight = false;

        } else {
            // erlaubte Positionen (links, rechts)
            e.position.allowAbove = false;
            e.position.allowBelow = false;
            e.position.allowLeft = true;
            e.position.allowOnto = false;
            e.position.allowRight = true;
        }
    }


    _onDdDrop(e) {
        let tIndex = this.header.cells.indexOf(e.targetElement);
        let sIndex = this.header.cells.indexOf(e.sourceElement);
        let pos = e.position.position;

        if (!this._splitterMove && tIndex !== -1 && sIndex !== -1 && tIndex !== sIndex && (pos === 'left' || pos === 'right')) {
            if (pos === 'right') {
                tIndex += 1;
            }
            this.header.grid.columnConfigs[sIndex].position = tIndex;
        }
    }

    _onSplitterMouseDown(e) {
        if (!this._columnConfig.resizable) {
            return;
        }
        this._splitterMove = true;

        this._initialPos = e.nodeEvent.clientX;

        // Overlay Positionieren
        this._updateOverlayPosition(e.nodeEvent.clientX, e.nodeEvent.clientY);

        // Overlay rendern
        this._overlayDom.render();
        this.parent.grid.dom.node.appendChild(this._overlayDom.node);

        // mousemove und mouseup Listeners auf das document setzen
        kijs.Dom.addEventListener('mousemove', document, this._onSplitterMouseMove, this);
        kijs.Dom.addEventListener('mouseup', document, this._onSplitterMouseUp, this);
    }

    _onSplitterMouseMove(e) {
        // Overlay Positionieren
        this._updateOverlayPosition(e.nodeEvent.clientX, e.nodeEvent.clientY);
    }

    _onSplitterMouseUp(e) {
        // Beim ersten auslösen Listeners gleich wieder entfernen
        kijs.Dom.removeEventListener('mousemove', document, this);
        kijs.Dom.removeEventListener('mouseup', document, this);

        // Overlay wieder ausblenden
        this._overlayDom.unrender();

        // Differenz zur vorherigen Position ermitteln
        let offset = e.nodeEvent.clientX - this._initialPos;

        if (this._columnConfig.resizable) {
            this._columnConfig.width = Math.max(this._columnConfig.width + offset, 40);
        }

        this._splitterMove = false;
    }

    // Overwrite
    render(superCall) {
        super.render(true);

        // container
        this._captionContainerDom.renderTo(this._dom.node);

        // caption dom
        this._captionDom.renderTo(this._captionContainerDom.node);

        // sort dom
        this._sortDom.renderTo(this._captionContainerDom.node);

        // Help icon rendern (kijs.gui.Icon)
        this._helpIconEl.renderTo(this._dom.node);

        // dropdown
        this._menuButtonEl.renderTo(this._dom.node);

        // Splitter
        this._splitterDom.renderTo(this._dom.node);

        // Breite
        this._dom.width = this._columnConfig.width;

        // sichtbar?
        this.visible = this._columnConfig.visible;

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

        this._captionDom.unrender();
        this._captionContainerDom.unrender();
        this._helpIconEl.unrender();
        this._menuButtonEl.unrender();
        this._splitterDom.unrender();

        super.unrender(true);
    }


    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(superCall) {
        if (!superCall) {
            // unrendern
            this.unrender(superCall);

            // Event auslösen.
            this.raiseEvent('destruct');
        }

        this._captionDom.destruct();
        this._captionContainerDom.destruct();
        this._helpIconEl.destruct();
        this._menuButtonEl.destruct();
        this._splitterDom.destruct();

        // Variablen (Objekte/Arrays) leeren
        this._captionDom = null;
        this._helpIconEl = null;
        this._menuButtonEl = null;
        this._splitterDom = null;

        // Basisklasse entladen
        super.destruct(true);
    }
};
