/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.container.tab.Bar
// --------------------------------------------------------------
/**
 * Tab-Leiste von kijs.gui.container.Tab (scrollbar wie kijs.gui.container.Scrollable). Enthält die
 * Tab-Buttons und macht sie mit sortable per Drag&Drop verschiebbar. Sollte sonst nicht verwendet
 * werden, dafür gibt es kijs.gui.container.Scrollable.
 *
 * @fires ddTargetDrop  drop-Event des ddTarget (weitergeleitet)
 * @fires sourceDrop  Ein Tab-Button dieser Leiste wurde abgelegt (drop-Event seiner Source). e: wie drop
 * @fires targetDrop  Ein Tab-Button wurde auf dieser Leiste abgelegt (drop-Event des ddTarget). e: wie drop
 */
kijs.gui.container.tab.Bar = class kijs_gui_container_tab_Bar extends kijs.gui.container.Scrollable {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);
        
        this._ddName = kijs.uniqId('tab');
        this._ddPosBeforeAfterFactor = 0.666;  // Position, ab der nachher statt vorher eingefügt wird
        this._sortable = false; // Tabs sind per Drag&Drop verschiebbar
        this._ddMapping = {};
        
        this._ddTarget = null;
        
        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            scrollableX: 'auto',
            scrollableY: 'auto'
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            ddPosBeforeAfterFactor: true,
            ddTarget: { target: 'ddTarget' },
            ddName: { target: 'ddName' },
            
            sortable: { prio: 90, target: 'sortable' }
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
    /**
     * Drag&Drop-Mapping des ddTarget (mit sortable der Eintrag für ddName)
     * @type {Object}
     */
    get ddMapping() { return this._ddMapping; }
    /**
     * Ergänzt das ddMapping (assignDeep). Wegen des Tippfehlers im Namen nur als ddMappping erreichbar.
     * Kein Objekt = kijs.Error.
     * @type {Object}
     */
    set ddMappping(val) {
        if (!kijs.isObject(val)) {
            throw new kijs.Error(`"ddMapping" is not valid.`);
        }
        
        kijs.Object.assignDeep(this._ddMapping, val, true);
    }

    /**
     * Drag&Drop-Name der Tab-Buttons. Default: eindeutige ID
     * @type {String}
     */
    get ddName() {
        return this._ddName;
    }
    set ddName(val) {
        this._ddName = val;
    }

    /**
     * Position auf dem Ziel-Tab, ab der nachher statt vorher eingefügt wird. Default: 0.666
     * @type {Number}
     */
    get ddPosBeforeAfterFactor() { return this._ddPosBeforeAfterFactor; }
    set ddPosBeforeAfterFactor(val) { this._ddPosBeforeAfterFactor = val; }

    /**
     * Drag&Drop-Ziel der Leiste. Der Setter akzeptiert ein Config-Objekt für kijs.gui.dragDrop.Target
     * (ownerDomProperty Default 'innerDom') oder null. Andere Werte werfen einen kijs.Error.
     * @type {kijs.gui.dragDrop.Target|null}
     */
    get ddTarget() { 
        return this._ddTarget; 
    }
    set ddTarget(val) {
        // config-object
        if (kijs.isObject(val)) {
            if (kijs.isEmpty(this._ddTarget)) {
                val.ownerEl = this;
                if (kijs.isEmpty(val.ownerDomProperty)) {
                    val.ownerDomProperty = 'innerDom';
                }
                this._ddTarget = new kijs.gui.dragDrop.Target(val);
                this._eventForwardsAdd('ddTargetDrop', this.ddTarget, 'drop');
            } else {
                this._ddTarget.applyConfig(val);
            }

        // null
        } else if (val === null) {
            if (this._ddTarget) {
                this._ddTarget.destruct();
            }
            this._ddTarget = null;

        } else {
            throw new kijs.Error(`ddTarget must be a object or null`);

        }
    }
    
    /**
     * Tab-Buttons per Drag&Drop verschiebbar? Default: false
     * @type {Boolean}
     */
    get sortable() { return this._sortable; }
    set sortable(val) {
        this._sortable = !!val;
        
        // source
        this._initTabs();
        
        // target
        if (val) {
            this._ddMapping[this._ddName] = {
                allowMove: true,
                allowCopy: false,
                allowLink: false
            };
        } else {
            delete this._ddMapping[this._ddName];
        }
    }
    
    
    
    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    /**
     * Aktiviert bzw. deaktiviert Drag&Drop bei den Tab-Buttons und der Leiste (je nach sortable).
     * @param {kijs.gui.Element[]} [elements]  Tab-Buttons. Leer = es werden die Elemente von Kindern
     *                                         mit xtype 'kijs.gui.Button' genommen.
     * @returns {undefined}
     */
    _initTabs(elements) {
        if (kijs.isEmpty(elements)) {
            elements = [];
            kijs.Array.each(this._elements, (el) => {
                if (el.xtype === 'kijs.gui.Button') {
                    elements = kijs.Array.concat(elements, el.elements);
                }
            }, this);
        }
        
        // source
        kijs.Array.each(elements, function(el) {
            if (this._sortable) {
                el.ddSource = {
                    name: this._ddName,
                    allowMove: true,
                    allowCopy: false,
                    allowLink: false
                };
                el.ddSource.on('drop', this.#onElementSourceDrop, this);
            } else {
                if (el.ddSource) {
                    el.ddSource.destruct();
                }
                el.ddSource = null;
            }
        }, this);
        
        // target
        if (this._sortable) {
            this.ddTarget = {
                posBeforeFactor: this._ddPosBeforeAfterFactor,
                posAfterFactor: this._ddPosBeforeAfterFactor,
                mapping: this._ddMapping
            };
            this.ddTarget.on('drop', this.#onTargetDrop, this);
            this.on('add', this.#onAddTabs, this);
        } else {
            if (this._ddTarget) {
                this._ddTarget.destruct();
            }
            this._ddTarget = null;
        }
    }
    
    
    // PRIVATE
    // LISTENERS
    #onAddTabs(e) {
        this._initTabs(e.elements);
    }
    
    #onElementSourceDrop(e) {
        this.raiseEvent('sourceDrop', e);
    }
    
    #onTargetDrop(e) {
        this.raiseEvent('targetDrop', e);
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
        if (this._ddTarget) {
            this._ddTarget.destruct();
        }
        
        // Variablen (Objekte/Arrays) leeren
        this._ddTarget = null;
        this._ddMapping = null;
        
        // Basisklasse entladen
        super.destruct(true);
    }
    
};
