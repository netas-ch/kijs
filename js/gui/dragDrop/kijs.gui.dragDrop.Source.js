/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.dragDrop.Source
// --------------------------------------------------------------
/**
 * Drag&Drop-Quelle eines Elements: macht den Dom ownerDomProperty des Elements ownerEl ziehbar. Wird
 * meist über die Eigenschaft ddSource eines kijs.gui.Element erstellt. Ein kijs.gui.dragDrop.Target
 * nimmt die Quelle an, wenn sein mapping einen Eintrag mit dem name der Quelle enthält.
 *
 * @example
 * myPanel.ddSource = { name: 'myPanels', ownerDomProperty: 'headerBar.dom', allowMove: true };
 *
 * @fires destruct  Beim Zerstören
 * @fires dragEnd  Nach Abschluss des Drag&Drop (durch drop oder Abbruch). e: source
 * @fires dragStart  Beim Start des Ziehens. e: source
 * @fires drop  Wird vom Target vor dessen drop-Event ausgelöst. Rückgabe false bricht ab.
 *              e: source, target, operation ('move', 'copy', 'link' oder 'none'), mapping
 */
kijs.gui.dragDrop.Source = class kijs_gui_dragDrop_Source extends kijs.Observable {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        this._ownerEl = null;            // Eigentümmer kijs.gui.Element dieser Instanz
        this._ownerDomProperty = null;   // Property-Name des kijs.gui.Dom, der 
                                         // draggable ist. In der Regel kann dafür 'dom'
                                         // verwendet werden.

        this._name = null;
        this._caption = null;
        this._captionPlural = null;

        this._allowMove = true;
        this._allowCopy = false;
        this._allowLink = false;

        // Grösse des Source-Elements bei DragStart, damit diese später für den 
        // Drop-Marker verwendet werden kann.
        this._width = null;
        this._height = null;

        this._display = null; // CSS-display Wert bei DragStart, damit nach dem 
                              // Ausblenden des Source el wieder eingeblendet werden kann.

        this._defaultConfig = {};

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        this._configMap = {
            allowMove: true,
            allowCopy: true,
            allowLink: true,
            name: true,
            caption: true,
            captionPlural: true,
            on: { fn: 'assignListeners' },  // {Object} Listeners, z.B. { drop: fn, context: this }
            ownerEl: true,
            ownerDomProperty: { prio: 1000, target: 'ownerDomProperty' }
        };

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
     * Darf das Element per Drag&Drop kopiert werden (Ctrl bzw. Alt auf dem Mac)? Default: false
     * @type {Boolean}
     */
    get allowCopy() { return this._allowCopy; }
    set allowCopy(val) { this._allowCopy = !!val; }

    /**
     * Darf per Drag&Drop eine Verknüpfung erstellt werden (Ctrl+Shift bzw. Alt+Cmd auf dem Mac)? Default: false
     * @type {Boolean}
     */
    get allowLink() { return this._allowLink; }
    set allowLink(val) { this._allowLink = !!val; }

    /**
     * Darf das Element per Drag&Drop verschoben werden? Default: true
     * @type {Boolean}
     */
    get allowMove() { return this._allowMove; }
    set allowMove(val) { this._allowMove = !!val; }

    /**
     * Text im Bild beim Mauszeiger beim Ziehen eines Elements
     * @type {String|null}
     */
    get caption()  { return this._caption; }
    set caption(val)  { this._caption = val; }

    /**
     * Text im Bild beim Mauszeiger beim Ziehen mehrerer Elemente
     * @type {String|null}
     */
    get captionPlural()  { return this._captionPlural; }
    set captionPlural(val)  { this._captionPlural = val; }

    /**
     * CSS-display des Elements beim Start des Ziehens (zum Wiedereinblenden nach dem Ausblenden bei move)
     * @type {String|null}
     */
    get display() { return this._display; }

    /**
     * Höhe des Elements beim Start des Ziehens (für den Drop-Marker)
     * @type {Number|null}
     */
    get height() { return this._height; }

    /**
     * Drag&Drop-Name. Das Target akzeptiert die Quelle, wenn sein mapping diesen Namen enthält.
     * Pflicht beim Ziehen, sonst kijs.Error.
     * @type {String|null}
     */
    get name() { return this._name; }
    set name(val) { this._name = val; }

    /**
     * kijs.gui.Dom, der gezogen werden kann (ownerEl[ownerDomProperty]). Wirft einen kijs.Error ohne
     * ownerEl oder bei ungültiger ownerDomProperty.
     * @type {kijs.gui.Dom}
     */
    get ownerDom() {
        if (kijs.isEmpty(this._ownerEl)) {
            throw new kijs.Error(`draggable Elements must have a 'ddSource.ownerEl'`);
        }

        let dom = kijs.getObjectFromString(this._ownerDomProperty, this._ownerEl);

        if (kijs.isEmpty(dom)) {
            throw new kijs.Error(`draggable Elements must have a valide 'ddSource.ownerDomProperty'`);
        }

        return dom;
    }

    /**
     * Name (auch Pfad, z.B. 'headerBar.dom') der Dom-Eigenschaft von ownerEl, die gezogen werden kann.
     * Beim Setzen wird der Dom draggable gemacht.
     * @type {String|null}
     */
    get ownerDomProperty() { return this._ownerDomProperty; }
    set ownerDomProperty(val) {
        this._ownerDomProperty = val;

        // DOM draggable machen
        this.ownerDom.nodeAttributeSet('draggable', true);

        // Drag&Drop Listeners
        this.ownerDom.on('dragStart', this.#onDragStart, this);
        this.ownerDom.on('dragEnd', this.#onDragEnd, this);
    }

    /**
     * Element, zu dem die Quelle gehört
     * @type {kijs.gui.Element|null}
     */
    get ownerEl() { return this._ownerEl; }
    set ownerEl(val) {
        this._ownerEl = val;
    }

    /**
     * Breite des Elements beim Start des Ziehens (für den Drop-Marker)
     * @type {Number|null}
     */
    get width() { return this._width; }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    /**
     * Wendet die Konfigurations-Eigenschaften an
     * @param {Object} config
     * @param {Boolean} [preventEvents=false]   // Das Auslösen des afterResize-Event verhindern?
     * @returns {undefined}
     */
    applyConfig(config={}, preventEvents=false) {
        // Config zuweisen
        kijs.Object.assignConfig(this, config, this._configMap);

        // Objekt versiegeln.
        // Bewirkt, dass keine neuen Properties hinzugefügt werden dürfen.
        Object.seal(this);
    }

    /**
     * Schliesst das Drag&Drop ab (durch drop oder Abbruch): entfernt den Drop-Marker und die CSS-Klassen,
     * blendet das Element wieder ein, löst dragEnd aus und setzt kijs.gui.DragDrop zurück.
     * @returns {undefined}
     */
    dragEnd() {
        // dropMarker entfernen
        kijs.gui.DragDrop.dropMarkerRemove();

        // CSS-Klassen bei Source entfernen und Source einblenden, falls ausgeblendet
        if (this._ownerEl && this._ownerEl.dom) {
            this._ownerEl.dom.clsRemove('kijs-dragging');
            this._ownerEl.dom.clsRemove('kijs-sourceDragOver');
            this._ownerEl.style.display = this._display;
        }

        // CSS-Klasse kijs-targetDragOver entfernen
        kijs.gui.DragDrop.targetDragOverDom = null;

        // dragEnd-Event bei source auslösen
        this.raiseEvent('dragEnd', {
            source: this
        });

        // Aufräumen
        this._width = null;
        this._height = null;
        this._display = null;
        kijs.gui.DragDrop.source = null;
        kijs.gui.DragDrop.target = null;
        kijs.gui.DragDrop.dragImageDom = null;
        kijs.gui.DragDrop.sourceCount = null;
        kijs.gui.DragDrop.data = {};
    }


    // PRIVATE
    // LISTENERS
    #onDragEnd(e) {
        this.dragEnd();
    }

    #onDragStart(e) {
        e.nodeEvent.stopPropagation();

        if (kijs.isEmpty(this._name)) {
            throw new kijs.Error(`draggable Elements must have a 'ddSource.name'`);
        }

        // Grösse des Elements merken, damit diese später für den Drop-Marker 
        // verwendet werden kann.
        this._width = this._ownerEl.width;
        this._height = this._ownerEl.height;
        this._display = this.ownerEl.style.display;

        kijs.gui.DragDrop.source = this;
        kijs.gui.DragDrop.target = null;
        
        this._ownerEl.dom.clsAdd('kijs-dragging');

        e.nodeEvent.dataTransfer.setData('application/' + this._name, '');

        e.nodeEvent.dataTransfer.effectAllowed = kijs.gui.DragDrop.getddEffect(
            this._allowMove, this._allowCopy, this._allowLink);

        // dragStart-Event bei source auslösen
        this.raiseEvent('dragStart', {
            source: this
        });

        // DragImage definieren
        kijs.gui.DragDrop.createDragImage(e);

        // keine weiteren bubbeling-Listeners mehr ausführen
        e.nodeEvent.stopPropagation();
    }



    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    destruct(superCall) {
        if (!superCall) {
            // Event auslösen.
            this.raiseEvent('destruct');
        }

        // Drag&Drop Listeners entfernen
        if (!kijs.isEmpty(this._ownerEl)) {
            let dom = kijs.getObjectFromString(this._ownerDomProperty, this._ownerEl);
            if (dom) {
                this.ownerDom.off('dragStart', this.#onDragStart, this);
                this.ownerDom.off('dragEnd', this.#onDragEnd, this);
            }
        }

        // Elemente/DOM-Objekte entladen

        // Variablen (Objekte/Arrays) leeren
        this._defaultConfig = null;
        this._ownerEl = null;

        // Basisklasse entladen
        super.destruct();
    }

};
