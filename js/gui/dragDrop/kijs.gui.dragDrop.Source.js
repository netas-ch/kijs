/* global kijs, this */

// Klasse mit Drag&Drop-Events/Funktionen, für das Element das gezogen wird

// --------------------------------------------------------------
// kijs.gui.dragDrop.Source
// --------------------------------------------------------------
kijs.gui.dragDrop.Source = class kijs_gui_dragDrop_Source extends kijs.Observable {
     
     
    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        this._ownerEl = null;            // Eigentümmer kijs.gui.Element dieser Instanz
        this._sourceDomProperty = null;  // Property-Name des kijs.gui.Dom, der 
                                         // draggable ist. In der Regel kann dafür 'dom'
                                         // verwendet werden.
        
        this._name = null;
        
        this._allowMove = true;
        this._allowCopy = false;
        this._allowLink = false;
        
        this._defaultConfig = {};
        
        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        this._configMap = {
            allowMove: true,    // Darf das Element per Drag&Drop verschoben werden?
            allowCopy: true,    // Darf das Element per Drag&Drop kopiert werden?
            allowLink: true,    // Darf per Drag&Drop eine Verknüpfung auf das Element erstellt werden?
            name: true,         // Drag&Drop Name
            on: { fn: 'assignListeners' },
            ownerEl: true,
            sourceDomProperty: { prio: 1000, target: 'sourceDomProperty' } // Property-Name des kijs.gui.Dom, der draggable ist
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
    get allowCopy() { return this._allowCopy; }
    set allowCopy(val) { this._allowCopy = !!val; }

    get allowLink() { return this._allowLink; }
    set allowLink(val) { this._allowLink = !!val; }

    get allowMove() { return this._allowMove; }
    set allowMove(val) { this._allowMove = !!val; }

    // Drag&Drop Name
    get name() { return this._name; }
    set name(val) { this._name = val; }
    
    // Eigentümmer kijs.gui.Element dieser Instanz
    get ownerEl() { 
        return this._ownerEl; 
    }
    set ownerEl(val) {
        this._ownerEl = val;
    }
    
    // Verweis auf den kijs.gui.Dom, der draggable ist
    get sourceDom() {
        if (kijs.isEmpty(this._ownerEl)) {
            throw new kijs.Error(`draggable Elements must have a 'ddSource.ownerEl'`);
        }
        
        let dom = kijs.getObjectFromString(this._sourceDomProperty, this._ownerEl);
        
        if (kijs.isEmpty(dom)) {
            throw new kijs.Error(`draggable Elements must have a valide 'ddSource.sourceDomProperty'`);
        }
        
        return dom;
    }
    
    // Property-Name des kijs.gui.Dom, der draggable ist
    get sourceDomProperty() {
        return this._sourceDomProperty;
    }
    set sourceDomProperty(val) {
        this._sourceDomProperty = val;
        
        // DOM draggable machen
        this.sourceDom.nodeAttributeSet('draggable', true);
        
        // Drag&Drop Listeners
        this.sourceDom.on('dragStart', this.#onDragStart, this);
        this.sourceDom.on('dragEnd', this.#onDragEnd, this);
    }
    
    
    
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
        
        // Objekt versiegeln
        // Bewirkt, dass keine neuen propertys hinzugefügt werden dürfen.
        Object.seal(this);
    }
    
    // Drag&Drop ist abgeschlossen (durch drop oder Abbruch)
    dragEnd() {
        kijs.gui.DragDrop.dropMarkerRemove();
        this._ownerEl.dom.clsRemove('kijs-dragging');
        kijs.gui.DragDrop.source = null;
        kijs.gui.DragDrop.target = null;
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
        
        kijs.gui.DragDrop.source = this;
        kijs.gui.DragDrop.target = null;
        
        this._ownerEl.dom.clsAdd('kijs-dragging');
        
        e.nodeEvent.dataTransfer.setData('application/' + this._name, '');
        
        e.nodeEvent.dataTransfer.effectAllowed = kijs.gui.DragDrop.getddEffect(
                this._allowMove, this._allowCopy, this._allowLink);
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

        // Elemente/DOM-Objekte entladen
        
        // Variablen (Objekte/Arrays) leeren
        this._defaultConfig = null;
        this._ownerEl = null;

        // Basisklasse entladen
        super.destruct();
    }
    
};
