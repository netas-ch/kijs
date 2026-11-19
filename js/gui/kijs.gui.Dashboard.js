/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.Dashboard
// --------------------------------------------------------------
/**
 * Dashboard aus Spalten (kijs.gui.dashboard.Column) mit Panels (kijs.gui.dashboard.Panel). Mit
 * sortable (Default: true) können die Panels über ihre Kopfzeile per Drag&Drop zwischen den Spalten
 * verschoben werden. Mit rpcSaveFn und autoSave werden die Positionen (posData) nach dem Verschieben
 * oder Schliessen eines Panels an den Server gesendet.
 *
 * @example
 * new kijs.gui.Dashboard({
 *     cls: 'kijs-flexrow',
 *     rpcSaveFn: 'dashboard.save',
 *     autoSave: true,
 *     elements: [
 *         { xtype: 'kijs.gui.dashboard.Column', elements: [ { xtype: 'kijs.gui.dashboard.Panel', name: 'news', caption: 'News' } ] },
 *         { xtype: 'kijs.gui.dashboard.Column', elements: [ { xtype: 'kijs.gui.dashboard.Panel', name: 'todo', caption: 'Aufgaben' } ] }
 *     ]
 * });
 *
 * @fires afterSave  Nach dem Speichern mit save(). e: Antwort des RPC
 */
kijs.gui.Dashboard = class kijs_gui_Dashboard extends kijs.gui.Container {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);
        
        this._sortable = false;      // Panels sind per Drag&Drop verschiebbar
        this._ddPosBeforeAfterFactor = 0.66;  // Position, ab der nachher statt vorher eingefügt wird
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
            
            rpcSaveFn: true,
            rpcSaveArgs: true,
            autoSave: true,
            
            sortable: { prio: 90, target: 'sortable' },
            ddMapping: { prio: 100, target: 'ddMapping' }   // {Object} Zusätzliches Drag&Drop-Mapping der Spalten. Achtung: Es gibt keinen Setter ddMapping (Tippfehler ddMappping), die Zuweisung wirft darum einen TypeError
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
    /**
     * Nach dem Verschieben oder Schliessen eines Panels automatisch save() aufrufen? Nur mit rpcSaveFn. Default: false
     * @type {Boolean}
     */
    get autoSave() { return this._autoSave; }
    set autoSave(val) { this._autoSave = !!val; }

    /**
     * Drag&Drop-Mapping der Spalten (mit sortable der Eintrag für ddPanelName)
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
     * Drag&Drop-Name der Panels. Default: 'kijs.gui.dashboard.Panel'
     * @type {String}
     */
    get ddPanelName() { return this._ddPanelName; }
    set ddPanelName(val) { this._ddPanelName = val; }
    
    /**
     * Position auf dem Ziel-Panel, ab der nachher statt vorher eingefügt wird. Default: 0.66
     * @type {Number}
     */
    get ddPosBeforeAfterFactor() { return this._ddPosBeforeAfterFactor; }
    set ddPosBeforeAfterFactor(val) { this._ddPosBeforeAfterFactor = val; }

    /**
     * Positionsdaten aller Spalten mit ihren Panels (posData der Spalten)
     * @type {Object[]}
     */
    get posData() {
        // Positionsdaten der Spalten + Panels ermitteln
        let data = [];
        kijs.Array.each(this._elements, function(el) {
            data.push(el.posData);
        }, this);
        
        return data;
    }

    /**
     * Zusätzliche RPC-Argumente fürs Speichern. Überschreiben gleichnamige Argumente von save().
     * @type {Object}
     */
    get rpcSaveArgs() { return this._rpcSaveArgs; }
    set rpcSaveArgs(val) { this._rpcSaveArgs = val; }
    
    /**
     * Name der remoteFn zum Speichern, z.B. 'dashboard.save'
     * @type {String|null}
     */
    get rpcSaveFn() { return this._rpcSaveFn; }
    set rpcSaveFn(val) { this._rpcSaveFn = val; }

    /**
     * Panels per Drag&Drop verschiebbar? Default: true
     * @type {Boolean}
     */
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
    /**
     * Sendet die Positionsdaten (posData) an rpcSaveFn. Enthält die Antwort config, wird sie
     * angewendet. Danach wird afterSave ausgelöst.
     * @param {Object|null} [args=null]  Argumente für den Server (rpcSaveArgs haben Vorrang)
     * @returns {Promise}  Wird mit der Antwort des RPC aufgelöst
     */
    save(args=null) {
        return new Promise((resolve, reject) => {
            // Args
            if (!kijs.isObject(args)) {
                args = {};
            }
            args = Object.assign({}, args, this._rpcSaveArgs);
            
            // Positionsdaten der Spalten + Panels
            let posData = this.posData;
            
            // an den Server senden
            this.rpc.do({
                remoteFn: this.rpcSaveFn,
                owner: this,
                requestData: {
                    posData: posData,
                    args: args
                },
                cancelRunningRpcs: false,
                waitMaskTarget: this,
                waitMaskTargetDomProperty: 'dom',
                context: this
                
            }).then((e) => {
                // config Properties anwenden, falls vorhanden
                if (e.response.config) {
                    // config Properties übernehmen
                    this.applyConfig(e.response.config);
                }
                
                // 'afterSave' auslösen
                this.raiseEvent('afterSave', Object.assign({}, e));
                
                // Promise auslösen
                resolve(e);
                
            }).catch((ex) => {
                reject(ex);
                
            });
        });
    }


    // PROTECTED
    /**
     * Richtet Drag&Drop-Ziele der Spalten ein (bzw. entfernt sie ohne sortable) und danach deren Panels.
     * @param {kijs.gui.Element[]} [elements]  Leer = alle Elemente
     * @returns {undefined}
     */
    _initColumns(elements) {
        let panels = [];
        
        if (kijs.isEmpty(elements)) {
            elements = this._elements;
        }
        
        kijs.Array.each(elements, (el) => {
            if (el instanceof kijs.gui.dashboard.Column) {
                if (this._sortable) {
                    el.ddTarget = {
                        posBeforeFactor: this._ddPosBeforeAfterFactor,
                        posAfterFactor: this._ddPosBeforeAfterFactor,
                        mapping: this._ddMapping
                    };
                    el.ddTarget.on('drop', this.#onDdTargetDrop, this);
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
    
    /**
     * Setzt die Listeners der Panels und richtet ihre Drag&Drop-Quelle (Kopfzeile) ein bzw. entfernt sie.
     * Andere Elemente als kijs.gui.dashboard.Panel werfen einen Error.
     * @param {kijs.gui.Element[]} [elements]  Leer = alle Panels aller Spalten
     * @returns {undefined}
     */
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
                        name: this._ddPanelName,
                        ownerDomProperty: 'headerBar.dom',
                        allowMove: true,
                        allowCopy: false,
                        allowLink: false
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
    #onDdTargetDrop(e) {
        if (e.source.name === this._ddPanelName) {
            kijs.gui.DragDrop.dropFnMoveEl(e);
            if (this._autoSave && this._rpcSaveFn) {
                this.save();
            }
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
