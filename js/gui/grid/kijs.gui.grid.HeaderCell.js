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
        this._dom.on('dragStart', this._onDragStart, this);
        this._dom.on('dragEnter', this._onDragEnter, this);
        this._dom.on('dragOver', this._onDragOver, this);
        this._dom.on('dragExit', this._onDragLeave, this);
        this._dom.on('drop', this._onDrop, this);

        // DOM für label
        this._captionDom = new kijs.gui.Dom({cls:'kijs-caption'});

        // DOM für Menu
        this._menuButtonEl = new kijs.gui.MenuButton({
            parent: this,
            elements: [{
                    caption:'Aufsteigend sortieren',
                    iconChar: '&#xf15d' // fa-sort-alpha-asc
                },{
                    caption:'Absteigend sortieren',
                    iconChar: '&#xf15e' // fa-sort-alpha-desc
                },{
                    caption:'Spalten...',
                    iconChar: '&#xf0db', //  fa-columns
                    on: {
                        click: function() {
                            (new kijs.gui.grid.columnWindow({parent: this})).show();
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
        config = Object.assign({}, {
            // keine
        }, config);

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            columnConfig: true
        });

        // Config anwenden
        if (kijs.isObject(config)) {
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
    _onDragStart(e) {
        // wenn splitter nicht bewegt wird, drag starten
        if (!this._splitterMove) {
            e.nodeEvent.dataTransfer.setData('text/headercellindex', this.index);
        }
    }

    _onDragEnter(e) {
        if (!this._splitterMove) {
            this._dom.style.borderLeft = '3px solid red';
        }
    }

    _onDragOver(e) {
        e.nodeEvent.preventDefault();
    }

    _onDragLeave(e) {
        this._dom.style.borderLeft = '';
    }

    _onDrop(e) {
        this._dom.style.borderLeft = '';
        if (!this._splitterMove && kijs.Array.contains(e.nodeEvent.dataTransfer.types, 'text/headercellindex')) {
            e.nodeEvent.preventDefault();

            // Index des drag-element auslesen und bei diesem der aktuelle index einstellen
            let dragIndex = parseInt(e.nodeEvent.dataTransfer.getData('text/headercellindex'));
            if (kijs.isInteger(dragIndex) && kijs.isInteger(this.index) && dragIndex !== this.index) {
                let newIndex = dragIndex > this.index ? this.index : this.index - 1;
                this.header.grid.columnConfigs[dragIndex].position = newIndex;
            }
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

        // caption dom
        this._captionDom.renderTo(this._dom.node);

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