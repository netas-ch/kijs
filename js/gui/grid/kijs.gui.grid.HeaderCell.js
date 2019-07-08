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

        // drag events
        this._dom.nodeAttributeSet('draggable', true);
        kijs.DragDrop.addDragEvents(this, this._dom);
        kijs.DragDrop.addDropEvents(this, this._dom);

        this.on('ddStart', this._onDdStart, this);
        this.on('ddOver', this._onDdOver, this);
        this.on('ddDrop', this._onDdDrop, this);

        // DOM für label
        this._captionContainerDom = new kijs.gui.Dom({cls:'kijs-caption'});
        this._captionDom = new kijs.gui.Dom({nodeTagName:'span', htmlDisplayType: 'code'});
        this._sortDom = new kijs.gui.Dom({nodeTagName:'span', cls:'kijs-sort', htmlDisplayType: 'code'});

        // DOM für Menu
        this._menuButtonEl = new kijs.gui.MenuButton({
            parent: this,
            elements: [{
                    name    : 'btn-sort-asc',
                    caption : kijs.getText('Aufsteigend sortieren'),
                    iconChar: '&#xf15d', // fa-sort-alpha-asc
                    on: {
                        click: function() {
                            this.header.grid.sort(this.columnConfig.valueField, 'ASC');
                            this._menuButtonEl.menuCloseAll();
                        },
                        context: this
                    }
                },{
                    name    : 'btn-sort-desc',
                    caption : kijs.getText('Absteigend sortieren'),
                    iconChar: '&#xf15e', // fa-sort-alpha-desc
                    on: {
                        click: function() {
                            this.header.grid.sort(this.columnConfig.valueField, 'DESC');
                            this._menuButtonEl.menuCloseAll();
                        },
                        context: this
                    }
                },{
                    name    : 'btn-columns',
                    caption : kijs.getText('Spalten...'),
                    iconChar: '&#xf0db', // fa-columns
                    on: {
                        click: function() {
                            (new kijs.gui.grid.columnWindow({parent: this})).show();
                            this._menuButtonEl.menuCloseAll();
                        },
                        context: this
                    }
                },{
                    name    : 'btn-filters',
                    caption : kijs.getText('Filter...'),
                    iconChar: '&#xf0b0', // fa-filter
                    on: {
                        click: function() {
                            this.parent.grid.filter.visible = !this.parent.grid.filter.visible;
                            this._menuButtonEl.menuCloseAll();
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
            sort: { target: 'sort' }
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
    get index() {
        if (this.header) {
            return this.header.cells.indexOf(this);
        }
        return null;
    }

    get sort() {
        if (this._sortDom.html === String.fromCharCode(0xf0dd)) {
            return 'DESC';
        } else if (this._sortDom.html === String.fromCharCode(0xF0de)) {
            return 'ASC';
        }
        return null;
    }
    set sort(val) {
        if (val === 'DESC') {
            this._sortDom.html = String.fromCharCode(0xf0dd); // fa-sort-desc
        } else if (val === 'ASC') {
            this._sortDom.html = String.fromCharCode(0xF0de); // fa-sort-asc
        } else {
            this._sortDom.html = '';
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
        let c = this._columnConfig.caption;
        this.setCaption(c, false);

        this._menuButtonEl.spinbox.down('btn-filters').visible = !!this.parent.grid.filterable;
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
        this._menuButtonEl.destruct();
        this._splitterDom.destruct();

        // Variablen (Objekte/Arrays) leeren
        this._captionDom = null;
        this._menuButtonEl = null;
        this._splitterDom = null;

        // Basisklasse entladen
        super.destruct(true);
    }
};