/* global kijs, this */

// TODO: Es gibt zwei unterschiedliche Möglichkeiten um zu Filtern 
// - selectByFilters()
// - this.filters (Entfernen: Ist nicht dokumentiert)
// Es sollte nur eine Möglichkeit geben!


// --------------------------------------------------------------
// kijs.gui.DataView
// --------------------------------------------------------------
kijs.gui.DataView = class kijs_gui_DataView extends kijs.gui.Container {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);
        
        this._sortable = false;          // Elements sind per Drag&Drop verschiebbar
        
        this._elementXType = 'kijs.gui.dataView.Element';
        
        this._ddPosAfterFactor = 0.666;  // Position, ab der nachher eingefügt wird
        this._ddPosBeforeFactor = 0.666; // Position, ab der vorher eingefügt wird
        this._ddName = kijs.uniqId('dataview.element');
        this._ddTarget = null;
        this._elementDdSourceConfig = null;
        
        this._rpcSaveFn = null;         // Name der remoteFn. Bsp: 'dataview.save'
        this._rpcSaveArgs = {};         // Standard RPC-Argumente fürs Speichern
        this._autoSave = false;         // Automatisches Speichern bei Änderungen
        
        this._currentEl = null;         // Aktuelles Element (Wenn der Fokus auf dem DataView ist,
                                        // hat dieses Element den Fokus)
        this._lastSelectedEl = null;    // Letztes Element das Selektiert wurde. Wird gebraucht,
                                        // wenn mit der Shift-Taste mehrere selektiert werden.
        this._data = [];
        this._filters = [];
        this._focusable = true;
        this._selectType = 'none';
        
        this._dom.clsRemove('kijs-container');
        this._dom.clsAdd('kijs-dataview');
        
        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            scrollableY: 'auto',
            focusable: true,
            selectType: 'single'
        });
        
        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            elementXType: true,         // xtype für DataView-Element. Muss 'kijs.gui.dataView.Element' oder davon vererbt sein.
            autoLoad: { target: 'autoLoad' },   // Soll nach dem ersten Rendern automatisch die Load-Funktion aufgerufen werden?
            data: { target: 'data' },   // Recordset-Array [{id:1, caption:'Wert 1'}] oder Werte-Array ['Wert 1']
            filters: { target: 'filters' },
            focusable: { target: 'focusable'},  // Kann das Dataview den Fokus erhalten?
            selectFilters: { fn: 'function', target: this.selectByFilters, context: this }, // Filter, die definieren, welche Datensätze das per default Selektiert sind.
            selectType: true,           // 'none': Es kann nichts selektiert werden
                                        // 'single' (default): Es kann nur ein Datensatz selektiert werden. Abwählen ist nicht möglich.
                                        // 'singleAndEmpty': Wie Single. Der aktuelle Datensatz kann aber abgewählt werden.
                                        // 'multi': Mit den Shift- und Ctrl-Tasten können mehrere Datensätze selektiert werden.
                                        // 'simple': Es können mehrere Datensätze selektiert werden. Shift- und Ctrl-Tasten müssen dazu nicht gedrückt werden.
            rpcSaveFn: true,    // Name der remoteFn. Bsp: 'dashboard.save'
            rpcSaveArgs: true,  // Standard RPC-Argumente fürs Speichern
            autoSave: true,     // Automatisches Speichern bei Änderungen
            
            ddName: true,
            ddPosBeforeFactor: true,
            ddPosAfterFactor: true,
            elementDdSourceConfig: true,
            sortable: { prio: 90, target: 'sortable' },
            ddTarget: { prio: 100, target: 'ddTarget' }
        });
        
        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }
        
        // Events
        this.on('keyDown', this.#onKeyDown, this);
        this.on('elementMouseDown', this.#onElementMouseDown, this);
        //this.on('elementFocus', this.#onElementFocus, this);
    }
    
    
    
    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get autoLoad() {
        return this.hasListener('afterFirstRenderTo', this.#onAfterFirstRenderTo, this);
    }
    set autoLoad(val) {
        if (val) {
            this.on('afterFirstRenderTo', this.#onAfterFirstRenderTo, this);
        } else {
            this.off('afterFirstRenderTo', this.#onAfterFirstRenderTo, this);
        }
    }
    
    get autoSave() { return this._autoSave; }
    set autoSave(val) { this._autoSave = !!val; }
    
    get current() { return this._currentEl; }
    /**
     * Setzt das aktuelle Element, dass den Fokus erhalten wird.
     * Null = automatische Ermittlung
     * Um den Fokus zu setzen, bitte die Funktion .focus() vom Element verwenden.
     * @param {kijs.gui.dataView.Element|null} el
     * @returns {undefined}
     */
    set current(el) {
        // Falls kein el übergeben wurde:
        if (!el && !kijs.isEmpty(this._elements)) {
            // Falls es schon ein gültiges Current-Element gibt, dieses nehmen
            if (this._currentEl && kijs.Array.contains(this._elements, this._currentEl)) {
                el = this._currentEl;
            }
            // Sonst das erste selektierte Element
            if (!el) {
                let sel = this.getSelected();
                if (!kijs.isEmpty(sel)) {
                    if (kijs.isArray(sel)) {
                        sel = sel[0];
                    }
                    el = sel;
                }
            }
            // Sonst halt das erste Element
            if (!el) {
                el = this._elements[0];
            }
        }
        
        this._currentEl = el;
        kijs.Array.each(this._elements, function(elem) {
            if (elem === el) {
                elem.dom.clsAdd('kijs-current');
            } else {
                elem.dom.clsRemove('kijs-current');
            }
            // Nur das currentEl darf den Fokus erhalten können
            if (this._focusable && elem === el) {
                el.dom.nodeAttributeSet('tabIndex', 0);
            } else {
                elem.dom.nodeAttributeSet('tabIndex', undefined);
            }
        }, this);
    }
    
    get data() { return this._data; }
    set data(val) { 
        this._data = kijs.isEmpty(val) ? [] : val;
        this._createElements(this._data);
        
        // Current Element ermitteln und setzen
        this.current = null;
    }
    
    get elementXType() { return this._elementXType; }
    set elementXType(val) { this._elementXType = val; }
    
    get ddName() { return this._ddName; }
    set ddName(val) {
        this._ddName = val;
        if (this._ddTarget && this._sortable) {
            // Elements neu laden
            if (!kijs.isEmpty(this._elements)) {
                this._createElements(this._data);
                // Current Element ermitteln und setzen
                this.current = null;
            }
        }
    }
    
    get ddPosAfterFactor() { return this._ddPosAfterFactor; }
    set ddPosAfterFactor(val) {
        this._ddPosAfterFactor = val;
        if (this._ddTarget) {
            this._ddTarget.posAfterFactor = val;
        }
    }
    
    get ddPosBeforeFactor() { return this._ddPosBeforeFactor; }
    set ddPosBeforeFactor(val) {
        this._ddPosBeforeFactor = val;
        if (this._ddTarget) {
            this._ddTarget.posBeforeFactor = val;
        }
    }
    
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
                if (kijs.isEmpty(val.posBeforeFactor)) {
                    val.posBeforeFactor = this._ddPosBeforeFactor;
                }
                if (kijs.isEmpty(val.posAfterFactor)) {
                    val.posAfterFactor = this._ddPosAfterFactor;
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
    
    get elementDdSourceConfig() {
        return this._elementDdSourceConfig;
    }
    set elementDdSourceConfig(val) {
        this._elementDdSourceConfig = val;
    }
    
    get filters() { return this._filters; }
    set filters(val) {
        if (!val) {
            this._filters = [];
        } else {
            if (!kijs.isArray(val)) {
                val = [val];
            }
            
            // einzelne Filter validieren
            kijs.Array.each(val, function(filter) {
                if (!kijs.isObject(filter) || !('field' in filter) || !('value' in filter) || !kijs.isString(filter.field) || !kijs.isString(filter.value)) {
                    throw new kijs.Error(`invalid argument for filters in kijs.gui.DataView`);
                }
                if (!('compare' in filter) || !kijs.Array.contains(['begin', 'part', 'end', 'full'], filter.compare)) {
                    filter.compare = 'begin';
                }
            }, this);
            
            this._filters = val;
        }
    }
    
    get focusable() { return this._focusable; }
    set focusable(val) { 
        this._focusable = val; 
        if (val) {
            //this._dom.nodeAttributeSet('tabIndex', -1);
        } else {
            //this._dom.nodeAttributeSet('tabIndex', undefined);
        }
    }
    
    // overwrite
    get hasFocus() {
        return this._currentEl ? this._currentEl.hasFocus : false;
    }
    
    get rpcSaveArgs() { return this._rpcSaveArgs; }
    set rpcSaveArgs(val) { this._rpcSaveArgs = val; }
    
    get rpcSaveFn() { return this._rpcSaveFn; }
    set rpcSaveFn(val) { this._rpcSaveFn = val; }
    
    get selectType() { return this._selectType; }
    set selectType(val) { this._selectType = val; }
    
    get sortable() { return this._sortable; }
    set sortable(val) { 
        this._sortable = !!val;
        
        // Evtl. ddTarget erstellen
        if (val && !this._ddTarget) {
            this.ddTarget = {
                posBeforeFactor: this._ddPosBeforeAfterFactor,
                posAfterFactor: this._ddPosBeforeAfterFactor
            };
            this._ddTarget.on('drop', this.#onTargetDrop, this);
        }
        
        // Mapping
        if (val) {
            this._ddTarget.mapping[this._ddName] = {
                allowMove: true,
                allowCopy: false,
                allowLink: false
            };
        } else {
            delete this._ddTarget.mapping[this._ddName];
        }
        
        // evtl. ddTarget löschen
        if (this._ddTarget && kijs.isEmpty(this._ddTarget.mapping)) {
            if (this._ddTarget) {
                this._ddTarget.destruct();
            }
            this._ddTarget = null;
        }
        
        // Elements neu laden
        if (!kijs.isEmpty(this._elements)) {
            this._createElements(this._data);
            // Current Element ermitteln und setzen
            this.current = null;
        }
    }
    
    
    
    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    /**
     * Fügt Daten hinzu
     * @param {type} data
     * @returns {undefined}
     */
    addData(data){
        if (!kijs.isArray(data)) {
            data = [data];
        }
        
        this._data = kijs.Array.concat(this._data, data);
        
        this._createElements(data, false);
    }
    
    /**
     * Wendet Filter auf das DataView an.
     * @param {Array|Object} filters
     * @returns {undefined}
     */
    applyFilters(filters) {
        this.filters = filters;
        if (this.isRendered) {
            this._createElements(this._data);
            // Current Element ermitteln und setzen
            this.current = null;
        }
    }
    
    /**
     * Entfernt alle Selektionen
     * @param {Boolean} [preventSelectionChange=false]    Soll das SelectionChange-Event verhindert werden?
     * @returns {undefined}
     */
    clearSelections(preventSelectionChange) {
        this.unSelect(this._elements, preventSelectionChange);
    }
    
    /**
     * Erstellt aus einem Recordset ein getDataViewElement
     * Diese Funktion muss überschrieben werden.
     * @param {Array} dataRow   Datensatz, der gerendert werden soll
     * @param {Number} index    Index des Datensatzes. Die Datensätze werden durchnummeriert 0 bis ...
     * @returns {kijs.gui.getDataViewElement}
     */
    createElement(dataRow, index) {
        let el = this._getInstanceForAdd({
            xtype: this._elementXType,
            dataRow: dataRow
        });
        
        if (!(el instanceof kijs.gui.dataView.Element)) {
            throw new kijs.Error(`Element must be an instance of kijs.gui.dataView.Element.`);
        }
        
        if (this._elementXType === 'kijs.gui.dataView.Element') {
            let html = '';
            
            html += '<div>';
            html += ' <span class="label">Nr. ' + index + '</span>';
            html += '</div>';



            kijs.Object.each(dataRow, function(key, val) {
                html += '<div>';
                html += ' <span class="label">' + key + ': </span>';
                html += ' <span class="value">' + val + '</span>';
                html += '</div>';
            }, this);
            
            el.html = html;
        }
        
        return el;
    }
    
    /**
     * Gibt die selektieten Elemente zurück
     * Bei selectType='single' oder 'singleAndEmpty' wird das Element direkt zurückgegeben sonst ein Array mit den Elementen
     * @returns {Array|kijs.gui.dataView.Element|null}
     */
    getSelected() {
        let ret = [];
        for (let i=0, len=this._elements.length; i<len; i++) {
            if (this._elements[i].selected) {
                ret.push(this._elements[i]);
            }
        }
        
        if (this._selectType === 'none') {
            return null;
            
        } else if (kijs.Array.contains(['single', 'singleAndEmpty'], this._selectType)) {
            return ret.length ? ret[0] : null ;
            
        } else {
            return ret;
            
        }
    }
    
    /**
     * Gibt die Data-rows der selektieten Elemente zurück
     * @returns {Array|null}
     */
    getSelectedRows() {
        let rows = [];
        
        for (let i=0, len=this._elements.length; i<len; i++) {
            if (this._elements[i].selected) {
                rows.push(this._elements[i].dataRow);
            }
        }
        
        if (this._selectType === 'none') {
            return null;
            
        } else if (kijs.Array.contains(['single', 'singleAndEmpty'], this._selectType)) {
            return rows.length ? [rows[0]] : null ;
            
        } else {
            return rows;
            
        }
    }
    
    // wird von kijs.gui.Combo verwendet
    // TODO: schönere Lösung?
    handleKeyDown(nodeEvent) {
        let isShiftPress = !!nodeEvent.shiftKey;
        let isCtrlPress = !!nodeEvent.ctrlKey;
        
        if (kijs.Navigator.isMac) {
            isCtrlPress = !!nodeEvent.metaKey;
        }
        
        if (!this.disabled) {
            switch (nodeEvent.code) {
                case 'ArrowLeft':
                    if (this._currentEl) {
                        const prev = this._currentEl.previous;
                        if (prev) {
                            this.current = prev;
                            if (this._focusable) {
                                prev.focus();
                            }
                        }
                        
                        if (isShiftPress || (!isCtrlPress && kijs.Array.contains(['single', 'singleAndEmpty', 'multi'], this._selectType))) {
                            this._selectEl(this._currentEl, isShiftPress, isCtrlPress);
                        }
                    }
                    nodeEvent.preventDefault();
                    break;
                    
                case 'ArrowUp':
                    if (this._currentEl && this._elements) {
                        let found = false;
                        
                        kijs.Array.each(this._elements, function(el) {
                            if (found) {
                                if (el.top < this._currentEl.top && el.left === this._currentEl.left) {
                                    this.current = el;
                                    if (this._focusable) {
                                        el.focus();
                                    }
                                    return false;
                                }
                            } else {
                                if (el === this._currentEl) {
                                    found = true;
                                }
                            }
                        }, this, true);
                        
                        if (isShiftPress || (!isCtrlPress && kijs.Array.contains(['single', 'singleAndEmpty', 'multi'], this._selectType))) {
                            this._selectEl(this._currentEl, isShiftPress, isCtrlPress);
                        }
                    }
                    nodeEvent.preventDefault();
                    break;
                    
                case 'ArrowRight':
                    if (this._currentEl) {
                        const next = this._currentEl.next;
                        if (next) {
                            this.current = next;
                            if (this._focusable) {
                                next.focus();
                            }
                        }
                        
                        if (isShiftPress || (!isCtrlPress && kijs.Array.contains(['single', 'singleAndEmpty', 'multi'], this._selectType))) {
                            this._selectEl(this._currentEl, isShiftPress, isCtrlPress);
                        }
                    }
                    nodeEvent.preventDefault();
                    break;
                    
                case 'ArrowDown':
                    if (this._currentEl && this._elements) {
                        let found = false;
                        kijs.Array.each(this._elements, function(el) {
                            if (found) {
                                if (el.top > this._currentEl.top && el.left === this._currentEl.left) {
                                    this.current = el;
                                    if (this._focusable) {
                                        el.focus();
                                    }
                                    return false;
                                }
                            } else {
                                if (el === this._currentEl) {
                                    found = true;
                                }
                            }
                        }, this);
                        
                        if (isShiftPress || (!isCtrlPress && kijs.Array.contains(['single', 'singleAndEmpty', 'multi'], this._selectType))) {
                            this._selectEl(this._currentEl, isShiftPress, isCtrlPress);
                        }
                    }
                    nodeEvent.preventDefault();
                    break;
                    
                case 'Space':
                    this._selectEl(this._currentEl, isShiftPress, isCtrlPress);
                    break;
                    
            }
        }
    }
    
    save() {
        return new Promise((resolve, reject) => {
            let args = {};
            
            args = Object.assign({}, args, this._rpcSaveArgs);
            
            // an den Server senden
            this.rpc.do({
                remoteFn: this.rpcSaveFn,
                owner: this,
                data: this._data,
                cancelRunningRpcs: false,
                waitMaskTarget: this,
                waitMaskTargetDomProperty: 'dom',
                context: this
                
            }).then((e) => {
                // config Properties anwenden, falls vorhanden
                if (e.responseData.config) {
                    // config Properties übernehmen
                    this.applyConfig(e.responseData.config);
                }
                
                // 'afterSave' auslösen
                this.raiseEvent('afterSave', e);
                
                // Promise auslösen
                resolve(e);
                
            }).catch((ex) => {
                reject(ex);
                
            });
        });
    }
    
    /**
     * Selektiert ein oder mehrere Elemente
     * @param {kijs.gui.Element|Array} elements Element oder Array mit Elementen, die selektiert werden sollen
     * @param {Boolean} [keepExisting=false]            Soll die bestehende selektion belassen werden?
     * @param {Boolean} [preventSelectionChange=false]  Soll das SelectionChange-Event verhindert werden?
     * @returns {undefined}
     */
    select(elements, keepExisting=false, preventSelectionChange=false) {
        if (kijs.isEmpty(elements)) {
            elements = [];
        }
        
        if (!kijs.isArray(elements)) {
            elements = [elements];
        }
        
        if (!keepExisting){
            this.clearSelections(true);
        }
        
        var changed = false;
        kijs.Array.each(elements, function(el) {
            changed = changed || !el.selected;
            el.selected = true;
        }, this);
        
        // SelectionChange auslösen
        if (!preventSelectionChange && changed) {
            this.raiseEvent('selectionChange', { elements: elements, unSelect: false } );
        }
    }
    
    /**
     * Selektiert alle Elemente zwischen el1 und el2
     * @param {kijs.gui.Element} el1
     * @param {kijs.gui.Element} el2
     * @param {bool} [preventSelectionChange=false]     Soll das SelectionChange-Event verhindert werden?
     * @returns {undefined}
     */
    selectBetween(el1, el2, preventSelectionChange=false) {
        let found = false;
        let elements = [];
        
        // Alle Elemente zwischen dem vorher selektierten Element und dem aktuellen Element selektieren
        kijs.Array.each(this._elements, function(el) {
            if (!found) {
                if (el === el1) {
                    found = 'el1';
                } else if (el === el2) {
                    found = 'el2';
                }
            }
            
            if (found) {
                elements.push(el);
            }
            
            if ((found==='el1' && el===el2) || (found==='el2' && el===el1)) {
                return false;
            }
        }, this);
        
        if (!kijs.isEmpty(elements)) {
            this.select(elements, true, preventSelectionChange);
        }
    }
    
    /**
     * Selektiert ein oder mehrere Elemente
     * @param {Array} rows Recordset mit rows der zu selektierenden Elementen
     * @param {Boolean} [keepExisting=false]            Soll die bestehende selektion belassen werden?
     * @param {Boolean} [preventSelectionChange=false]  Soll das SelectionChange-Event verhindert werden?
     * @returns {undefined}
     */
    selectByDataRows(rows, keepExisting=false, preventSelectionChange=false) {
        if (kijs.isEmpty(rows)) {
            return;
        }
        
        let selectedElements = [];
        
        if (!keepExisting){
            this.clearSelections(true);
        }
        
        var changed = false;
        kijs.Array.each(this._elements, function(el) {
            if (kijs.Array.contains(rows, el.dataRow)) {
                changed = changed || !el.selected;
                el.selected = true;
                selectedElements.push(el);
            }
        }, this);
        
        // current aktualisieren
        this._currentEl = null;
        this.current = null;
        
        // SelectionChange auslösen
        if (!preventSelectionChange && changed) {
            this.raiseEvent('selectionChange', { elements: selectedElements, unSelect: false } );
        }
    }
    
    /**
     * Selektiert ein oder mehrere Elemente
     * @param {Array|Object} filters                    Array mit Objektdefinitionen der Elemente, die selektiert werden sollen
     *                                                  Beispiel 1 (nur ein Datensatz wird selektiert bei nur einem Primary-Field):
     *                                                  { field: "Id", value: 123 }
     *                                                  
     *                                                  Beispiel 2 (mehrere werden selektiert bei nur einem Primary-Field):
     *                                                  [ { field: "Id", value: 123 }, { field: "Id", value: 124 } ]
     *                                                  
     *                                                  Beispiel 3 (nur ein Datensatz wird selektiert bei mehreren Primary-Fields):
     *                                                  [
     *                                                    { field: "Name", value: "Muster" },
     *                                                    { field: "Vorname", value: "Max" }
     *                                                  ]
     *                                                  
     *                                                  Beispiel 4 (mehrere Datensätze werden selektiert bei mehreren Primary-Fields):
     *                                                  [
     *                                                    [
     *                                                      { field: "Name", value: "Muster" },
     *                                                      { field: "Vorname", value: "Max" }
     *                                                    ],[
     *                                                      { field: "Name", value: "Muster" },
     *                                                      { field: "Vorname", value: "Max" }
     *                                                    ]
     *                                                  ]
     * 
     * @param {Boolean} [keepExisting=false]            Soll die bestehende selektion belassen werden?
     * @param {Boolean} [preventSelectionChange=false]  Soll das SelectionChange-Event verhindert werden?
     * @returns {undefined}
     */
    selectByFilters(filters, keepExisting, preventSelectionChange) {
        if (kijs.isEmpty(filters)) {
            filters = [];
        }
        
        // Evtl. das Format ändern auf: [ [{...}, {...}], [{...}, {...}] ]
        if (kijs.isObject(filters)) {
            filters = [filters];
        }
        for (let i=0; i<filters.length; i++) {
            if (kijs.isObject(filters[i])) {
                filters[i] = [filters[i]];
            }
        }
        
        // Nun die Elemente durchgehen und wenn sie zum Filter passen: das Element vormerken
        const selElements = [];
        if (!kijs.isEmpty(filters)) {
            kijs.Array.each(this._elements, function(el) {
                if (el instanceof kijs.gui.dataView.Element) {
                    const row = el.dataRow;

                    kijs.Array.each(filters, function(filterFields) {
                        let ok = false;
                        kijs.Array.each(filterFields, function(filterField) {
                            if (kijs.isEmpty(filterField.value) || kijs.isEmpty(filterField.field)) {
                                throw new kijs.Error(`Unkown filter format.`);
                            }
                            
                            if (filterField.value === row[filterField.field]) {
                                ok = true;
                            } else {
                                ok = false;
                                return false;
                            }
                        }, this);
                        if (ok) {
                            selElements.push(el);
                            return false;
                        }
                    }, this);
                }
            }, this);
        }
        
        // Elemente selektieren
        this.select(selElements, keepExisting, preventSelectionChange);
        
        // Element mit Fokus neu ermitteln
        this._currentEl = null;
        this.current = null;
    }
    
    /**
     * Selektiert ein oder mehrere Elemente
     * @param {Array|Int} indexes Index oder Array mit Indexes, die selektiert werden sollen
     * @param {Boolean} [keepExisting=false]            Soll die bestehende selektion belassen werden?
     * @param {Boolean} [preventSelectionChange=false]  Soll das SelectionChange-Event verhindert werden?
     * @returns {undefined}
     */
    selectByIndex(indexes, keepExisting=false, preventSelectionChange=false) {
        if (!kijs.isArray(indexes)) {
            indexes = [indexes];
        }
        let selectElements = [];
        kijs.Array.each(indexes, function(index) {
            kijs.Array.each(this.elements, function(element) {
                if (element.index === index) {
                    selectElements.push(element);
                    return false;
                }
            }, this);
        }, this);
        
        this.select(selectElements, keepExisting, preventSelectionChange);
    }
    
    /**
     * Element festlegen, welches über die Tabulator-Taste den Fokus erhält
     * Setzt den tabIndex des Elements auf 0
     * und bei allen anderen Elementen auf undefined
     * @param {Object} el
     * @returns {undefined}
     */
    /*setFocusableElement(el) {
        // Sicherstellen, dass alle anderen Elemente den Fokus nicht mehr über die Tabulator-Taste erhalten können
        kijs.Array.each(this._elements, function(elem) {
            elem.dom.nodeAttributeSet('tabIndex', undefined);
        }, this);
        
        //if (!el && !kijs.isEmpty(this._elements)) {
        //    el = this._elements[0];
        //}

        // Beim neuen Element: tabIndex einschalten
        // kann nun auch über die Tastatur und Maus fokussiert werden.
        if (this._focusable) {
            if (el) {
                el.dom.nodeAttributeSet('tabIndex', 0);
                //this._dom.nodeAttributeSet('tabIndex', undefined);
            } else {
                //this._dom.nodeAttributeSet('tabIndex', 0);
            }
        } else {
            //this._dom.nodeAttributeSet('tabIndex', undefined);
        }
    }*/

    /**
     * Deselektiert ein oder mehrere Elemente
     * @param {kijs.gui.Element|Array} elements Element oder Array mit Elementen, die deselektiert werden sollen
     * @param {bool} [preventSelectionChange=false]     Soll das SelectionChange-Event verhindert werden?
     * @returns {undefined}
     */
    unSelect(elements, preventSelectionChange) {
        if (!kijs.isArray(elements)) {
            elements = [elements];
        }
        
        kijs.Array.each(elements, function(el) {
            if ('selected' in el) {
                el.selected = false;
            }
        }, this);
        
        if (!preventSelectionChange) {
            this.raiseEvent('selectionChange', { elements: elements, unSelect: true } );
        }
    }
    
    
    // PROTECTED
    /**
     * Erstellt die Elemente
     * @param {array|string} data
     * @param {bool}  removeElements
     * @returns {undefined}
     */
    _createElements(data, removeElements = true) {
        
        // index des aktuellen Elements merken (Element mit Fokus)
        let currentIndex = null;
        if (this._currentEl && (this._currentEl instanceof kijs.gui.dataView.Element) && kijs.isDefined(this._currentEl.index)) {
            currentIndex = this._currentEl.index;
        }
        
        // Bestehende Elemente löschen
        if (this.elements && removeElements) {
            this.removeAll({
                preventRender: true
            });
            this._currentEl = null;
        }
        
        // Neue Elemente generieren
        let newElements = [];
        for (let i=0, len=data.length; i<len; i++) {
            
            // Zeile überspringen, falls sie im Filter hängen bleibt.
            if (this._filterMatch(data[i])) {
                continue;
            }
            
            const newEl = this.createElement(data[i], i);
            newEl.index = i;
            newEl.parent = this;
            
            // Drag&Drop
            if (this._elementDdSourceConfig) {
                newEl.ddSource = this._elementDdSourceConfig;
            } else if (this._sortable) {
                newEl.ddSource = { 
                    allowMove: true,
                    allowCopy: true,
                    allowLink: false,
                    name: this._ddName
                };
                newEl.ddSource.on('drop', this.#onSourceDrop, this);
            }
            
            // click-Event
            newEl.on('click', function(e) {
                return this.raiseEvent('elementClick', e);
            }, this);
            
            // dblclick-Event
            newEl.on('dblClick', function(e) {
                return this.raiseEvent('elementDblClick', e);
            }, this);
            
            // mouseDown-Event
            newEl.on('mouseDown', function(e) {
                return this.raiseEvent('elementMouseDown', e);
            }, this);
            
            // mouseUp-Event
            newEl.on('mouseUp', function(e) {
                return this.raiseEvent('elementMouseUp', e);
            }, this);
            
            // contextMenu-Event
            newEl.on('contextMenu', function(e) {
                return this.raiseEvent('elementContextMenu', e);
            }, this);
            
            // focus-Event
            newEl.on('focus', function(e) {
                return this.raiseEvent('elementFocus', e);
            }, this);
            
            // Evtl. fokus setzen
            if (newEl.index === currentIndex) {
                this._currentEl = newEl;
            }
            
            newElements.push(newEl);
        }
        
        // neue Elemente einfügen
        this.add(newElements);
    }
    
    /**
     * Prüft, ob ein Filter auf einen Record matcht
     * @param {Object} record
     * @returns {Boolean}
     */
    _filterMatch(record) {
        let filterMatch = false;
        
        kijs.Array.each(this.filters, function(filter) {
            if (!kijs.isDefined(record[filter.field])) {
                filterMatch = true;
            }
            
            let rgx;
            if (filter.compare === 'begin') {
                rgx = new RegExp('^' + kijs.Char.getRegexPattern(kijs.String.regexpEscape(filter.value)), 'i');
                
            } else if (filter.compare === 'part') {
                rgx = new RegExp(kijs.Char.getRegexPattern(kijs.String.regexpEscape(filter.value)), 'i');
                
            } else if (filter.compare === 'end') {
                rgx = new RegExp(kijs.Char.getRegexPattern(kijs.String.regexpEscape(filter.value)) + '$', 'i');
                
            } else if (filter.compare === 'full') {
                rgx = new RegExp('^' + kijs.Char.getRegexPattern(kijs.String.regexpEscape(filter.value)) + '$', 'i');
                
            } else {
                throw new kijs.Error(`invalid value for filter.compare in kijs.gui.DataView`);
            }
            
            if (!kijs.toString(record[filter.field]).match(rgx)) {
                filterMatch = true;
            }
        }, this);
        
        return filterMatch;
    }

    /**
     * Selektiert ein Element und berücksichtigt dabei die selectType und die tasten shift und ctrl
     * @param {kijs.gui.Element} el
     * @param {Boolean} shift   // Shift gedrückt?
     * @param {Boolean} ctrl    // Ctrl gedrückt?
     * @returns {undefined}
     */
    _selectEl(el, shift, ctrl) {
        if (!el) {
            return;
        }
        
        // darf überhaupt selektiert werden?
        switch (this._selectType) {
            case 'single':
                shift = false;
                ctrl = false;
                break;
                
            case 'singleAndEmpty':
                shift = false;
                ctrl = false;
                
                // 1. Selektiertes Element ermitteln
                let sel = this.getSelected();
                if (!kijs.isEmpty(sel)) {
                    if (kijs.isArray(sel)) {
                        sel = sel[0];
                    }
                }

                // Falls auf das selektierte Element geklickt wurde: Selektierung entfernen
                if (sel && sel === el) {
                    ctrl = true;
                }
                break;

            
            case 'multi':
                // nix
                break;
                
            case 'simple':
                ctrl = true;
                break;
                
            case 'none':
            default:
                return;
        }
        
        if (shift && this._lastSelectedEl) {
            // bestehende Selektierung entfernen
            if (!ctrl) {
                this.clearSelections(true);
            }
            
            // selektieren
            this.selectBetween(this._lastSelectedEl, el);
            
        } else {
            // bestehende Selektierung entfernen
            if (!ctrl) {
                this.clearSelections(true);
            }
            
            if (el.selected) {
                this.unSelect(el);
                if (el === this._lastSelectedEl) {
                    this._lastSelectedEl = null;
                }
            } else {
                this.select(el, true);
                this._lastSelectedEl = el;
            }
        }
    }
    
    
    // PRIVATE
    // LISTENERS
    #onAfterFirstRenderTo(e) {
        this.load();
    }
    
    #onElementMouseDown(e) {
        if (!this.disabled) {
            this.current = e.raiseElement;
            if (this._focusable) {
                e.raiseElement.focus();
            }
            
            let isShiftPress = !!e.nodeEvent.shiftKey;
            let isCtrlPress = !!e.nodeEvent.ctrlKey;
            
            if (kijs.Navigator.isMac) {
                isCtrlPress = !!e.nodeEvent.metaKey;
            }
            
            this._selectEl(this._currentEl, isShiftPress, isCtrlPress);
        }
    }
    
    /*#onElementFocus(e) {
        if (!this.disabled) {
            // Element festlegen, welches über die Tabulator-Taste den Fokus erhält
            //this.setFocusableElement(e.raiseElement);
        }
    }*/
    
    #onKeyDown(e) {
        this.handleKeyDown(e.nodeEvent);
    }
    
    #onSourceDrop(e) {
        // Source Element
        let sourceEl = e.source.ownerEl;
        
        // Source dataRow merken, damit beim Ziel wieder eingefügt werden kann
        kijs.gui.DragDrop.data.sourceDataRow = sourceEl.dataRow;
        
        if (e.source.name === this._ddName && e.operation === 'move') {
            // Zeile aus Source entfernen
            kijs.Array.remove(this._data, sourceEl.dataRow);
            
            // speichern
            if (this._autoSave && this._rpcSaveFn) {
                // nur speichern, wenn das Target ein anderes Element ist
                // (sonst wird ja beim target bereits gespeichert)
                if (e.target.ownerEl !== this) {
                    this.save();
                }
            }
            
            // evtl. neu laden
            if (e.target.ownerEl !== this) {
                // rows der selektierten Zeilen ermitteln
                let selectedDataRows = this.getSelectedRows();
                
                // neu laden
                this._createElements(this._data);
                
                // und wieder selektieren
                this.selectByDataRows(selectedDataRows, false, true);
                
                // Current Element ermitteln und setzen
                this.current = null;
            }
        }
    }
    
    #onTargetDrop(e) {
        if (e.source.name === this._ddName) {
            let targetIndex = null;
            
            // before oder after
            if (e.target.targetPos === 'before' || e.target.targetPos === 'after') {
                // target index ermitteln
                targetIndex = this._data.indexOf(e.target.targetEl.dataRow);
                if (e.target.targetPos === 'after') {
                    targetIndex++;
                }
                
                // dataRow bei gewünschtem Index einfügen
                this._data.splice(targetIndex, 0, kijs.gui.DragDrop.data.sourceDataRow);
                
            // child
            } else if (e.target.targetPos === 'child') {
                this._data.push(kijs.gui.DragDrop.data.sourceDataRow);
                targetIndex = this._data.length -1;
            }
            
            // rows der selektierten Zeilen ermitteln
            let selectedDataRows = this.getSelectedRows();
            
            // neu laden
            this._createElements(this._data);
            
            // und wieder selektieren
            this.selectByDataRows(selectedDataRows, false, true);
            
            // Current Element ermitteln und setzen
            this.current = null;
            
            // in sichtbaren Bereich scrollen?
            this._elements[targetIndex].dom.scrollIntoView();
            
            // speichern
            if (this._autoSave && this._rpcSaveFn) {
                this.save();
            }
        }
    }
    
    
    
    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    destruct(superCall) {
        if (!superCall) {
            // unrendern
            this.unrender(superCall);
            
            // Event auslösen.
            this.raiseEvent('destruct');
        }
        
        // Elemente/DOM-Objekte entladen
        if (this._ddTarget) {
            this._ddTarget.destruct();
        }
        
        // Variablen (Objekte/Arrays) leeren
        this._currentEl = null;
        this._lastSelectedEl = null;
        this._ddTarget = null;
        this._elementDdSourceConfig = null;
        this._data = null;
        
        // Basisklasse entladen
        super.destruct(true);
    }
    
};