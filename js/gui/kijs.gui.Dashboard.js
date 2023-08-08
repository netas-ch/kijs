/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.Dashboard
// --------------------------------------------------------------
kijs.gui.Dashboard = class kijs_gui_Dashboard extends kijs.gui.Container {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);
        
        this._sortable = false;      // Panels sind per Drag&Drop verschiebbar
        this._ddPosBeforeAfterFactor = 0.666;  // Position, ab der nachher statt vorher eingefügt wird
        this._ddPanelName = 'kijs.gui.dashboard.Panel';
        this._ddMapping = {};
        
        this._rpcSaveFn = null;     // Name der remoteFn. Bsp: 'dashboard.save'
        this._rpcSaveArgs = {};     // Standard RPC-Argumente fürs Speichern
        this._autoSave = false;     // Automatisches Speichern bei Änderungen
        
        this._dom.clsRemove('kijs-container');
        this._dom.clsAdd('kijs-dashboard');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            sortable: true,
            scrollableY: 'auto'
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            ddPanelName: true,
            ddPosBeforeAfterFactor: true,
            
            rpcSaveFn: true,    // Name der remoteFn. Bsp: 'dashboard.save'
            rpcSaveArgs: true,  // Standard RPC-Argumente fürs Speichern
            autoSave: true,     // Automatisches Speichern bei Änderungen
            
            sortable: { prio: 90, target: 'sortable' },
            ddMapping: { prio: 100, target: 'ddMapping' }
        });
        
        // Listeners
        this.on('add', this.#onAddColumns, this);

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }
    }



    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get autoSave() { return this._autoSave; }
    set autoSave(val) { this._autoSave = !!val; }

    get ddMapping() { return this._ddMapping; }
    set ddMappping(val) {
        if (!kijs.isObject(val)) {
            throw new kijs.Error(`"ddMapping" is not valid.`);
        }
        
        kijs.Object.assignDeep(this._ddMapping, val, true);
    }
    
    get ddPanelName() { return this._ddPanelName; }
    set ddPanelName(val) { this._ddPanelName = val; }
    
    get ddPosBeforeAfterFactor() { return this._ddPosBeforeAfterFactor; }
    set ddPosBeforeAfterFactor(val) { this._ddPosBeforeAfterFactor = val; }
    
    get rpcSaveArgs() { return this._rpcSaveArgs; }
    set rpcSaveArgs(val) { this._rpcSaveArgs = val; }
    
    get rpcSaveFn() { return this._rpcSaveFn; }
    set rpcSaveFn(val) { this._rpcSaveFn = val; }

    get sortable() { return this._sortable; }
    set sortable(val) { 
        this._sortable = !!val;
        
        if (val) {
            this._ddMapping[this._ddPanelName] = {
                allowMove: true,
                allowCopy: false,
                allowLink: false
            };
        } else {
            delete this._ddMapping[this._ddPanelName];
        }
        
        this._initColumns();
    }

    
    
    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    save() {
        return new Promise((resolve, reject) => {
            let args = {};
            
            args = Object.assign({}, args, this._rpcSaveArgs);
            
            // Positionsdaten der Spalten + Panels ermitteln
            args.elements = [];
            kijs.Array.each(this._elements, function(el) {
                args.elements.push(el.posData);
            }, this);
            
            // an den Server senden
            this.rpc.do({
                remoteFn: this.rpcSaveFn,
                owner: this,
                data: args,
                cancelRunningRpcs: false,
                waitMaskTarget: this,
                waitMaskTargetDomProperty: 'dom',
                context: this
                
            }).then((e) => {
                // 'afterSave' auslösen
                this.raiseEvent('afterSave', e);
                
                // Promise auslösen
                resolve(e);
                
            }).catch((ex) => {
                reject(ex);
                
            });
        });
    }
    
    // PROTECTED
    _initColumns(elements) {
        let panels = [];
        
        if (kijs.isEmpty(elements)) {
            elements = this._elements;
        }
        
        kijs.Array.each(elements, (el) => {
            if (el instanceof kijs.gui.dashboard.Column) {
                if (this._sortable) {
                    el.ddTarget = {
                        direction: 'vertical',
                        posBeforeFactor: this._ddPosBeforeAfterFactor,
                        posAfterFactor: this._ddPosBeforeAfterFactor,
                        mapping: this._ddMapping
                    };
                    el.ddTarget.on('drop', this.#onDrop, this);
                    el.on('add', this.#onAddPanels, this);
                } else {
                    if (el.ddTarget) {
                        el.ddTarget.destruct();
                    }
                    el.ddTarget = null;
                }
                panels = kijs.Array.concat(panels, el.elements);
            }
        }, this);
        
        this._initPanels(panels);
    }
    
    _initPanels(elements) {
        if (kijs.isEmpty(elements)) {
            elements = [];
            kijs.Array.each(this._elements, (el) => {
                if (el.xtype === 'kijs.gui.dashboard.Column') {
                    elements = kijs.Array.concat(elements, el.elements);
                }
            }, this);
        }
        
        kijs.Array.each(elements, (el) => {
            if (el instanceof kijs.gui.dashboard.Panel) {
                el.on('close', this.#onPanelClose, this);
                if (this._sortable) {
                    el.ddSource = { 
                        allowMove: true,
                        allowCopy: false,
                        allowLink: false,
                        name: this._ddPanelName
                    };
                } else {
                    if (el.ddSource) {
                        el.ddSource.destruct();
                    }
                    el.ddSource = null;
                }
                
            } else {
                throw new Error('The elements of a dashboard-Column must be an instance of kijs.gui.dashboard.Panel');
            }
        }, this);
    }
    
    
    // PRIVATE
    // LISTENERS
    // Beim hinzufügen einer Spalte: Spalte konfigurieren
    #onAddColumns(e) {
        this._initColumns(e.elements);
    }
    #onAddPanels(e) {
        this._initPanels(e.elements);
    }
    #onDrop(e) {
        kijs.gui.DragDrop.dropFnMoveEl(e);
        if (this._autoSave && this._rpcSaveFn) {
            this.save();
        }
    }
    
    #onPanelClose(e) {
        if (this._autoSave && this._rpcSaveFn) {
            this.save();
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
        
        // Variablen (Objekte/Arrays) leeren
        this._rpcSaveArgs = null;
        this._ddMapping = null;
        
        // Basisklasse entladen
        super.destruct(true);
    }
    
};
