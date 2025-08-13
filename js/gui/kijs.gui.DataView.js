/* global kijs, this */

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

        this._elementXType = 'kijs.gui.dataView.element.AutoHtml';

        this._primaryKeyFields = null; // Array mit den Namen der Primärschlüssel-Felder

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
        this._data = [];                // Recordset mit den Daten

        this._filters = [];             // Wenn Filter definiert sind, werden nicht
                                        // alle Daten angezeigt, sondern nur Datensätze,
                                        // die die Filter passieren.

        this._selectedKeysRows = [];    // Bei primaryKeyFields: Array mit PrimaryKeys der selektierten Elemente
                                        // sonst: Array mit den dataRows der selektierten Elemente

        this._sortFields = [];          // Wenn eine Sortierung definiert ist, werden die
                                        // Daten entsprechend sortiert

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
            elementXType: true,         // xtype für DataView-Element. Muss von 'kijs.gui.dataView.element.Base' vererbt sein.
            primaryKeyFields: { target: 'primaryKeyFields' }, // Array mit den Namen der Primärschlüssel-Felder
            autoLoad: { target: 'autoLoad' },   // Soll nach dem ersten Rendern automatisch die Load-Funktion aufgerufen werden?
            
            filters: { target: 'filters' },
            sortFields: { target: 'sortFields' },
            focusable: { target: 'focusable'},  // Kann das Dataview den Fokus erhalten?
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

            data: { prio: 80, target: 'data' },   // Recordset-Array [{id:1, caption:'Wert 1'}] oder Werte-Array ['Wert 1']
            sortable: { prio: 100, target: 'sortable' },
            selectFilters: { prio: 110, fn: 'function', target: this.selectByFilters, context: this }, // Filter, die definieren, welche Datensätze die standardmässig selektiert sind.
            ddTarget: { prio: 120, target: 'ddTarget' }
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }

        // Events
        this.on('keyDown', this.#onKeyDown, this);
        this.on('elementMouseDown', this.#onElementMouseDown, this);
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
     * Vorsicht current und selected ist nicht das gleiche!
     *  current = Element das den Fokus (Tastaturnavagation) hat
     *  selected = Element oder Elemente, die selektiert sind.
     * Null = automatische Ermittlung
     * Um den Fokus zu setzen, bitte die Funktion .focus() vom Element verwenden.
     * @param {kijs.gui.dataView.element.Base|null} el
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
    set filters(val) { this._filters = val; }

    get focusable() { return this._focusable; }
    set focusable(val) {
        this._focusable = val;
    }

    // overwrite
    get hasFocus() {
        return this._currentEl ? this._currentEl.hasFocus : false;
    }

    get primaryKeyFields() { return this._primaryKeyFields; }
    set primaryKeyFields(val) {
        if (kijs.isString(val)) {
            this._primaryKeyFields = [val];
        } else if (kijs.isArray(val)) {
            this._primaryKeyFields = val;
        } else {
            throw new kijs.Error(`primaryKeyFields must be a string or an array.`);
        }
    };

    get rpcSaveArgs() { return this._rpcSaveArgs; }
    set rpcSaveArgs(val) { this._rpcSaveArgs = val; }

    get rpcSaveFn() { return this._rpcSaveFn; }
    set rpcSaveFn(val) { this._rpcSaveFn = val; }

    get selectedKeysRows() { return this._selectedKeysRows; }
    
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

    get sortFields() { return this._sortFields; }
    set sortFields(val) { this._sortFields = val; }



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
        this._createElements(data, { skipRemoveElements: true });
    }

    /**
     * Wendet Filter auf das DataView an.
     * @param {Array|Object} filters
     * @returns {undefined}
     */
    applyFilters(filters) {
        this._filters = filters;
        if (this.isRendered) {
            this._createElements(this._data);
            // Current Element ermitteln und setzen
            this.current = null;
        }
    }

    /**
     * Wendet eine Sortierung auf das DataView an.
     * @param {Array} sortFields
     * @returns {undefined}
     */
    applySortFields(sortFields) {
        this._sortFields = sortFields;
        if (this.isRendered) {
            this._createElements(this._data);
            // Current Element ermitteln und setzen
            this.current = null;
        }
    }

    /**
     * Entfernt alle Selektionen
     * @param {Boolean} [preventSelectionChange=false]    Soll das SelectionChange-Event verhindert werden?
     * @returns {Object} Mit den Änderungen { selectedElements:[], selectedKeysRows:[], unselectedElements:[], unselectedKeysRows:[] }
     */
    clearSelections(preventSelectionChange) {
        if (!kijs.isEmpty(this._primaryKeyFields)) {
            return this.unselectByPrimaryKeys(this._selectedKeysRows, preventSelectionChange);
        } else {
            return this.unselectByDataRows(this._selectedKeysRows, preventSelectionChange);
        }
    }

    /**
     * Gibt ein Element zu einer dataRow zurück
     * @param {Array} dataRow
     * @returns {kijs.gui.dataView.element.Base}
     */
    getElementByDataRow(dataRow) {
        for (let i=0, len=this._elements.length; i<len; i++) {
            if (this._elements[i].dataRow === dataRow) {
                return this._elements[i];
            }
        }

        return null;
    }

    /**
     * Gibt ein Element zu einem PrimaryKey zurück
     * @param {String} primaryKey
     * @returns {kijs.gui.dataView.element.Base}
     */
    getElementByPrimaryKey(primaryKey) {
        for (let i=0, len=this._elements.length; i<len; i++) {
            if (this._elements[i].primaryKey === primaryKey) {
                return this._elements[i];
            }
        }

        return null;
    }

    /**
     * Gibt die selektierten Elemente zurück.
     * Vorsicht: falls bei einem Tree ein Element noch nicht erstellt wurde, weil der Eltern-Knoten
     * nicht aufgeklappt wurde, wird es nicht zurückgegeben.
     * Dafür besser die Funktionen getSelectedPrimaryKeys() und getSelectedRows() verwenden!
     * Bei selectType='single' oder 'singleAndEmpty' wird das Element direkt zurückgegeben sonst ein Array mit den Elementen
     * @returns {Array|kijs.gui.dataView.element.Base|null}
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
     * Gibt die PrimaryKey-Strings der selektierten Elemente als Array zurück
     * Bei selectType='single' oder 'singleAndEmpty' wird direkt der Key-String
     * zurückgegeben sonst ein Array mit den Keys-Strings
     * Siehe dazu kijs.Data.getPrimaryKey()
     * @returns {Array|String|null}
     */
    getSelectedPrimaryKeys() {
        let primaryKeys = [];

        if (!kijs.isEmpty(this._primaryKeyFields)) {
            primaryKeys = kijs.Array.clone(this._selectedKeysRows);

        } else {
            throw new kijs.Error(`No primaryKeyFields were defined.`);

        }

        if (this._selectType === 'none') {
            return null;

        } else if (kijs.Array.contains(['single', 'singleAndEmpty'], this._selectType)) {
            return primaryKeys.length ? [primaryKeys[0]] : null ;

        } else {
            return primaryKeys;

        }
    }

    /**
     * Gibt die Data-rows der selektierten Elemente zurück
     * Bei selectType='single' oder 'singleAndEmpty' wird direkt die row
     * zurückgegeben sonst ein Array mit den rows
     * @returns {Array|null}
     */
    getSelectedRows() {
        let rows = [];

        if (!kijs.isEmpty(this._primaryKeyFields)) {
            rows = kijs.Data.filterByPrimaryKeys(this._data, this._selectedKeysRows,
                    this._primaryKeyFields);

        } else {
            rows = kijs.Array.clone(this._selectedKeysRows);

        }

        if (this._selectType === 'none') {
            return null;

        } else if (kijs.Array.contains(['single', 'singleAndEmpty'], this._selectType)) {
            return rows.length ? [rows[0]] : null ;

        } else {
            return rows;

        }
    }

    // wird auch von kijs.gui.Combo verwendet
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

    /**
     * Aktualisiert das DataView
     * @param {Object} [options={}] options mit Einstellungen zum reload
     *      {
     *       noRpc: false,              // Soll kein RPC gemacht werden?
     *       skipSelected: false        // Sollen nicht wieder die gleichen Elemente wie
     *                                  // vorher selektiert werden?
     *       skipFilters: false         // Soll nicht gefiltert werden?
     *       skipSort: false            // Soll nicht sortiert werden?
     *       skipFocus: false,          // Soll das DataView nicht wieder den Fokus
     *                                  // erhalten, wenn es ihn vorher hatte?
     *       skipRemoveElements: false  // Sollen die bestehenden Elemente nicht entfernt werden?
     *      }
     * @returns {undefined}
     */
    reload(options={}) {
        options.noRpc = !!options.noRpc;
        options.skipSelected = !!options.skipSelected;
        options.skipFilters = !!options.skipFilters;
        options.skipSort = !!options.skipSort;
        options.skipFocus = !!options.skipFocus;
        options.skipRemoveElements = !!options.skipRemoveElements;

        // Eigenschaften merken, die nach dem Laden wiederhergestellt werden sollen
        let currentConfig = this._beforeReload(options);

        // Daten neu von RPC holen
        if (this._rpcLoadFn && !options.noRpc) {
            this.load()
                .then((e) => {
                    // Elemente neu erstellen
                    this._createElements(this._data);

                    // Eigenschaften wiederherstellen
                    this._afterReload(options, currentConfig, true);
                });

        // reload mit lokalen Daten
        } else {
            // Elemente neu erstellen
            this._createElements(this._data, options);

            // Eigenschaften wiederherstellen
            this._afterReload(options, currentConfig, false);

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
     * Scrollt zu dem currentEl (dem Element mit Fokus)
     * @returns {undefined}
     */
    scrollToFocus() {
        if (this._currentEl) {
            this._currentEl.dom.scrollIntoView();
        }
    }

    /**
     * Selektiert ein oder mehrere Elemente
     * @param {kijs.gui.Element|Array} elements Element oder Array mit Elementen, die selektiert werden sollen
     * @param {Boolean} [keepExisting=false]            Soll die bestehende selektion belassen werden?
     * @param {Boolean} [preventSelectionChange=false]  Soll das SelectionChange-Event verhindert werden?
     * @returns {Object} Mit den Änderungen { selectedElements:[], selectedKeysRows:[], unselectedElements:[], unselectedKeysRows:[] }
     */
    select(elements, keepExisting=false, preventSelectionChange=false) {
        let args = {
            selectedElements: [],
            selectedKeysRows: [],
            unselectedElements: [],
            unselectedKeysRows: [],
            changed: false
        };

        if (kijs.isEmpty(elements)) {
            elements = [];
        } else {
            if (!kijs.isArray(elements)) {
                elements = [elements];
            }
        }

        if (!keepExisting){
            args = this.clearSelections(true);
        }

        for (let i=0, len=elements.length; i<len; i++) {
            if (!elements[i].selected) {
                args.selectedElements.push(elements[i]);
                args.selectedKeysRows.push(elements[i].keyRow);
                elements[i].selected = true;
                args.changed = true;
            }
        }

        // SelectionChange auslösen
        if (!preventSelectionChange && args.changed) {
            this.raiseEvent('selectionChange', args);
        }

        return args;
    }

    /**
     * Selektiert alle Elemente zwischen el1 und el2
     * @param {kijs.gui.Element} el1
     * @param {kijs.gui.Element} el2
     * @param {bool} [preventSelectionChange=false]     Soll das SelectionChange-Event verhindert werden?
     * @returns {Object} Mit den Änderungen { selectedElements:[], selectedKeysRows:[], unselectedElements:[], unselectedKeysRows:[] }
     */
    selectBetween(el1, el2, preventSelectionChange=false) {
        let found = false;

        let args = {
            selectedElements: [],
            selectedKeysRows: [],
            unselectedElements: [],
            unselectedKeysRows: [],
            changed: false
        };

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
            return this.select(elements, true, preventSelectionChange);
        } else {
            return args;
        }
    }

    /**
     * Selektiert ein oder mehrere Elemente
     * @param {Array} rows Recordset mit rows der zu selektierenden Elementen
     * @param {Boolean} [keepExisting=false]            Soll die bestehende selektion belassen werden?
     * @param {Boolean} [preventSelectionChange=false]  Soll das SelectionChange-Event verhindert werden?
     * @returns {Object} Mit den Änderungen { selectedElements:[], selectedKeysRows:[], unselectedElements:[], unselectedKeysRows:[] }
     */
    selectByDataRows(rows, keepExisting=false, preventSelectionChange=false) {
        let args = {
            selectedElements: [],
            selectedKeysRows: [],
            unselectedElements: [],
            unselectedKeysRows: [],
            changed: false
        };

        if (!keepExisting) {
            args = this.clearSelections(true);
        }

        if (kijs.isEmpty(rows)) {
            return args;
        }

        // Sichtbare Elemente selektieren (bei einem Baum kann es sein, dass
        // ein übergeordneter Ordner zugeklappt ist)
        // Bei nicht sichtbaren Elemente wird der key/row nur in das Array this._selectedKeysRows
        // aufgenommen
        for (let i=0, len=rows.length; i<len; i++) {
            let el = this.getElementByDataRow(rows[i]);

            if (el) {
                if (!el.selected) {
                    args.selectedElements.push(el);
                    el.selected = true;
                    args.changed = true;
                }
            } else {
                let keyRow;
                if (!kijs.isEmpty(this._primaryKeyFields)) {
                    keyRow = kijs.Data.getPrimaryKeyString(rows[i], this._primaryKeyFields);
                } else {
                    keyRow = rows[i];
                }

                if (!kijs.Array.contains(this._selectedKeysRows, keyRow)) {
                    this._selectedKeysRows.push(keyRow);
                    args.selectedKeysRows.push(keyRow);
                    args.changed = true;
                }
            }
        }

        // SelectionChange auslösen
        if (!preventSelectionChange && args.changed) {
            this.raiseEvent('selectionChange', args);
        }

        return args;
    }

    /**
     * Selektiert ein oder mehrere Elemente
     * @param {Array|Object} filters                    Array mit Objektdefinitionen der Elemente, die selektiert werden sollen
     *                                                  Beispiel 1 (nur ein Datensatz wird selektiert bei nur einem PrimaryKey-Field):
     *                                                  { field: "Id", value: 123 }
     *
     *                                                  Beispiel 2 (mehrere werden selektiert bei nur einem PrimaryKey-Field):
     *                                                  [ { field: "Id", value: 123 }, { field: "Id", value: 124 } ]
     *
     *                                                  Beispiel 3 (nur ein Datensatz wird selektiert bei mehreren PrimaryKey-Fields):
     *                                                  [
     *                                                    { field: "Name", value: "Muster" },
     *                                                    { field: "Vorname", value: "Max" }
     *                                                  ]
     *
     *                                                  Beispiel 4 (mehrere Datensätze werden selektiert bei mehreren PrimaryKey-Fields):
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
     * @returns {Object} Mit den Änderungen { selectedElements:[], selectedKeysRows:[], unselectedElements:[], unselectedKeysRows:[] }
     */
    selectByFilters(filters, keepExisting=false, preventSelectionChange=false) {
        let rows = kijs.Data.filter(this._data, filters);

        let ret = this.selectByDataRows(rows, keepExisting, preventSelectionChange);

        // Element mit Fokus neu ermitteln
        this._currentEl = null;
        this.current = null;

        return ret;
    }

    /**
     * Selektiert ein oder mehrere Elemente mit Index
     * @param {Array|Int} indexes Index oder Array mit Indexen, die selektiert werden sollen
     * @param {Boolean} [keepExisting=false]            Soll die bestehende selektion belassen werden?
     * @param {Boolean} [preventSelectionChange=false]  Soll das SelectionChange-Event verhindert werden?
     * @returns {Object} Mit den Änderungen { selectedElements:[], selectedKeysRows:[], unselectedElements:[], unselectedKeysRows:[] }
     */
    selectByIndexes(indexes, keepExisting=false, preventSelectionChange=false) {
        let selectElements = [];
        
        if (kijs.isEmpty(indexes)) {
            indexes = [];
        } else {
            if (!kijs.isArray(indexes)) {
                indexes = [indexes];
            }
        }

        kijs.Array.each(this.elements, function(element) {
            if (kijs.Array.contains(indexes, element.index)) {
                selectElements.push(element);
            }
        }, this);

        return this.select(selectElements, keepExisting, preventSelectionChange);
    }

    /**
     * Selektiert ein oder mehrere Elemente mittels PrimaryKey-Strings
     * @param {Array|String} primaryKeys PrimaryKey-String oder Array mit PrimaryKey-Strings, die selektiert werden sollen
     * @param {Boolean} [keepExisting=false]            Soll die bestehende selektion belassen werden?
     * @param {Boolean} [preventSelectionChange=false]  Soll das SelectionChange-Event verhindert werden?
     * @returns {Object} Mit den Änderungen { selectedElements:[], selectedKeysRows:[], unselectedElements:[], unselectedKeysRows:[] }
     */
    selectByPrimaryKeys(primaryKeys, keepExisting=false, preventSelectionChange=false) {
        let args = {
            selectedElements: [],
            selectedKeysRows: [],
            unselectedElements: [],
            unselectedKeysRows: [],
            changed: false
        };

        if (!keepExisting) {
            args = this.clearSelections(true);
        }

        if (kijs.isEmpty(primaryKeys)) {
            return args;
        }

        if (!kijs.isArray(primaryKeys)) {
            primaryKeys = [primaryKeys];
        }

        // Sichtbare Elemente selektieren (bei einem Baum kann es sein, dass
        // ein übergeordneter Ordner zugeklappt ist)
        // Bei nicht sichtbaren Elemente wird der key/row nur in das Array this._selectedKeysRows
        // aufgenommen
        for (let i=0, len=primaryKeys.length; i<len; i++) {
            let el = this.getElementByPrimaryKey(primaryKeys[i]);
            if (el) {
                if (!el.selected) {
                    args.selectedElements.push(el);
                    el.selected = true;
                    args.changed = true;
                }
            } else {
                let keyRow;
                if (!kijs.isEmpty(this._primaryKeyFields)) {
                    keyRow = primaryKeys[i];
                } else {
                    throw new kijs.Error(`No primaryKeyFields were defined.`);
                }

                if (!kijs.Array.contains(this._selectedKeysRows, keyRow)) {
                    this._selectedKeysRows.push(keyRow);
                    args.selectedKeysRows.push(keyRow);
                    args.changed = true;
                }
            }
        }

        // SelectionChange auslösen
        if (!preventSelectionChange && args.changed) {
            this.raiseEvent('selectionChange', args);
        }

        return args;
    }

    /**
     * Deselektiert ein oder mehrere Elemente
     * @param {kijs.gui.Element|Array} elements Element oder Array mit Elementen, die deselektiert werden sollen
     * @param {Boolean} [preventSelectionChange=false]     Soll das SelectionChange-Event verhindert werden?
     * @returns {Object} Mit den Änderungen { selectedElements:[], selectedKeysRows:[], unselectedElements:[], unselectedKeysRows:[] }
     */
    unSelect(elements, preventSelectionChange) {
        let args = {
            selectedElements: [],
            selectedKeysRows: [],
            unselectedElements: [],
            unselectedKeysRows: [],
            changed: false
        };

        if (kijs.isEmpty(elements)) {
            return args;
        }

        if (!kijs.isArray(elements)) {
            elements = [elements];
        }

        kijs.Array.each(elements, function(el) {
            if (el.selected) {
                args.unselectedKeysRows.push(el.keyRow);
                args.unselectedElements.push(el);
                el.selected = false;
                args.changed = true;
            }
        }, this);

        if (!preventSelectionChange && args.changed) {
            this.raiseEvent('selectionChange', args);
        }

        return args;
    }

    /**
     * Deselektiert ein oder mehrere Elemente mittels dataRow
     * @param {Array} dataRows die deselektiert werden sollen
     * @param {Boolean} [preventSelectionChange=false]  Soll das SelectionChange-Event verhindert werden?
     * @returns {Object} Mit den Änderungen { selectedElements:[], selectedKeysRows:[], unselectedElements:[], unselectedKeysRows:[] }
     */
    unselectByDataRows(dataRows, preventSelectionChange=false) {
        let args = {
            selectedElements: [],
            selectedKeysRows: [],
            unselectedElements: [],
            unselectedKeysRows: [],
            changed: false
        };

        if (kijs.isEmpty(dataRows)) {
            return args;
        }

        // Klonen
        dataRows = kijs.Array.clone(dataRows);


        // Sichtbare Elemente deselektieren (bei einem Baum kann es sein, dass
        // ein übergeordneter Ordner zugeklappt ist)
        // Bei nicht sichtbaren Elemente wird der key/row nur aus dem Array this._selectedKeysRows
        // entfernt
        for (let i=0, len=dataRows.length; i<len; i++) {
            let ok = false;

            let el = this.getElementByDataRow(dataRows[i]);
            if (el) {
                if (el.selected) {
                    args.unselectedElements.push(el);
                    el.selected = false;
                    args.changed = true;
                    ok = true;
                }
            }

            if (!ok) {
                let keyRow;
                if (!kijs.isEmpty(this._primaryKeyFields)) {
                    keyRow = kijs.Data.getPrimaryKeyString(dataRows[i], this._primaryKeyFields);
                } else {
                    keyRow = dataRows[i];
                }

                if (kijs.Array.contains(this._selectedKeysRows, keyRow)) {
                    kijs.Array.remove(this._selectedKeysRows, keyRow);
                    args.unselectedKeysRows.push(keyRow);
                    args.changed = true;
                }
            }
        }

        // SelectionChange auslösen
        if (!preventSelectionChange && args.changed) {
            this.raiseEvent('selectionChange', args);
        }

        return args;
    }

    /**
     * Deselektiert ein oder mehrere Elemente mittels PrimaryKey-Strings
     * @param {Array|String} primaryKeys PrimaryKey-String oder Array mit PrimaryKey-Strings, die deselektiert werden sollen
     * @param {Boolean} [preventSelectionChange=false]  Soll das SelectionChange-Event verhindert werden?
     * @returns {Object} Mit den Änderungen { selectedElements:[], selectedKeysRows:[], unselectedElements:[], unselectedKeysRows:[] }
     */
    unselectByPrimaryKeys(primaryKeys, preventSelectionChange=false) {
        let args = {
            selectedElements: [],
            selectedKeysRows: [],
            unselectedElements: [],
            unselectedKeysRows: [],
            changed: false
        };

        if (kijs.isEmpty(primaryKeys)) {
            return args;
        }

        if (!kijs.isArray(primaryKeys)) {
            primaryKeys = [primaryKeys];
        }

        // Klonen
        primaryKeys = kijs.Array.clone(primaryKeys);

        // Sichtbare Elemente deselektieren (bei einem Baum kann es sein, dass
        // ein übergeordneter Ordner zugeklappt ist)
        // Bei nicht sichtbaren Elemente wird der key/row nur aus dem Array this._selectedKeysRows
        // entfernt
        for (let i=0, len=primaryKeys.length; i<len; i++) {
            let ok = false;

            let el = this.getElementByPrimaryKey(primaryKeys[i]);
            if (el) {
                if (el.selected) {
                    args.unselectedElements.push(el);
                    el.selected = false;
                    args.changed = true;
                    ok = true;
                }
            }

            if (!ok) {
                let keyRow;
                if (!kijs.isEmpty(this._primaryKeyFields)) {
                    keyRow = primaryKeys[i];
                } else {
                    throw new kijs.Error(`No primaryKeyFields were defined.`);
                }

                if (kijs.Array.contains(this._selectedKeysRows, keyRow)) {
                    kijs.Array.remove(this._selectedKeysRows, keyRow);
                    args.unselectedKeysRows.push(keyRow);
                    args.changed = true;
                }
            }
        }

        // SelectionChange auslösen
        if (!preventSelectionChange && args.changed) {
            this.raiseEvent('selectionChange', args);
        }

        return args;
    }


    // PROTECTED
    /**
     * Stellt die gemerkten Eigenschaften nach dem reload wieder her
     * @param {Object} options  options mit Einstellungen zum reload
     *      {
     *       noRpc: false,              // Soll kein RPC gemacht werden?
     *       skipSelected: false        // Sollen nicht wieder die gleichen Elemente wie
     *                                  // vorher selektiert werden?
     *       skipFilters: false         // Soll nicht gefiltert werden?
     *       skipSort: false            // Soll nicht sortiert werden?
     *       skipFocus: false,          // Soll das DataView nicht wieder den Fokus
     *                                  // erhalten, wenn es ihn vorher hatte?
     *       skipRemoveElements: false  // Sollen die bestehenden Elemente nicht entfernt werden?
     *      }
     * @param {Object} currentConfig
     * @param {Boolean} isRpc Wurde ein RPC gemacht?
     * @returns {undefined}
     */
    _afterReload(options, currentConfig, isRpc) {
        // Elemente wieder selektieren
        if (!options.skipSelected) {
            if (!kijs.isEmpty(this._primaryKeyFields)) {
                this.selectByPrimaryKeys(currentConfig.selectedKeysRows, false, true);
            } else {
                // bei einem reload via RPC stimmen die selectedKeysRows nicht mehr mit
                // den Zeilem in data überein. Die selectedKeysRows müssen darum neu
                // aus dem Recordset geholt werden. Dazu wird ein Primary-Key über alle
                // Spalten angelegt und damit verglichen
                if (isRpc) {
                    currentConfig.selectedKeysRows = kijs.Data.updateRowsReferences(
                            currentConfig.selectedKeysRows, this._data);
                }

                this.selectByDataRows(currentConfig.selectedKeysRows, false, true);
            }
        }

        // Current Element ermitteln und setzen
        this.current = null;

        // evtl. Fokus wieder setzen
        if (this._focusable && !options.skipFocus && currentConfig.hasFocus) {
            this.focus();
        }

        // zur vorherigen Position scrollen
        this._innerDom.node.scrollTo(currentConfig.scrollPosition);
    }

    /**
     * Merkt sich vor dem reload die Eigenschaften, die nach dem reload wiederhergestellt
     * werden sollen
     * @param {Object} options  options mit Einstellungen zum reload
     *      {
     *       noRpc: false,              // Soll kein RPC gemacht werden?
     *       skipSelected: false        // Sollen nicht wieder die gleichen Elemente wie
     *                                  // vorher selektiert werden?
     *       skipFilters: false         // Soll nicht gefiltert werden?
     *       skipSort: false            // Soll nicht sortiert werden?
     *       skipFocus: false,          // Soll das DataView nicht wieder den Fokus
     *                                  // erhalten, wenn es ihn vorher hatte?
     *       skipRemoveElements: false  // Sollen die bestehenden Elemente nicht entfernt werden?
     *      }
     * @returns {Object}
     */
    _beforeReload(options) {
        // Eigenschaften merken, die nach dem Laden wiederhergestellt werden sollen
        let currentConfig = {
            hasFocus: false,
            selectedKeysRows: null,
            scrollPosition: null
        };

        // Ist der Fokus auf dem DataView?
        currentConfig.hasFocus = this.hasFocus;

        // Position der Scrollbars merken
        currentConfig.scrollPosition = {
            top: this._innerDom.node.scrollTop,
            left: this._innerDom.node.scrollLeft,
            behavior: 'instant'
        };

        // selektierte Elemente merken
        // Zuerst via PrimaryKey versuchen
        if (!kijs.isEmpty(this._primaryKeyFields)) {
            currentConfig.selectedKeysRows = this.getSelectedPrimaryKeys();

        // sonst muss die ganze dataRow verglichen werden
        } else {
            currentConfig.selectedKeysRows = this.getSelectedRows();

        }

        return currentConfig;
    }

    _createElement(config) {
        let newConfig = { ...config };

        if (kijs.isEmpty(newConfig.xtype)) {
            newConfig.xtype = this._elementXType;
        }

        let el = this._getInstanceForAdd(newConfig);
        if ((el instanceof kijs.gui.dataView.element.Base)) {
            // Inhalt laden
            el.update();
        } else {
            throw new kijs.Error(`Element must be an instance of kijs.gui.dataView.element.Base.`);
        }

        return el;
    }


    /**
     * Erstellt die Elemente
     * @param {array|string} data
     * @param {Object} [options={}] options mit Einstellungen zum _laden
     *      {
     *       noRpc: false,              // Soll kein RPC gemacht werden?
     *       skipSelected: false        // Sollen nicht wieder die gleichen Elemente wie
     *                                  // vorher selektiert werden?
     *       skipFilters: false         // Soll nicht gefiltert werden?
     *       skipSort: false            // Soll nicht sortiert werden?
     *       skipFocus: false,          // Soll das DataView nicht wieder den Fokus
     *                                  // erhalten, wenn es ihn vorher hatte?
     *       skipRemoveElements: false  // Sollen die bestehenden Elemente nicht entfernt werden?
     *      }
     * @returns {undefined}
     */
    _createElements(data, options={}) {
        options.noRpc = !!options.noRpc;
        options.skipSelected = !!options.skipSelected;
        options.skipFilters = !!options.skipFilters;
        options.skipSort = !!options.skipSort;
        options.skipFocus = !!options.skipFocus;
        options.skipRemoveElements = !!options.skipRemoveElements;

        // aktuelles Element merken (Element mit Fokus)
        let currentPrimaryKey = '';
        let currentDataRow = null;
        if (this._currentEl && (this._currentEl instanceof kijs.gui.dataView.element.Base)) {
            // Zuerst via PrimaryKey versuchen
            if (!kijs.isEmpty(this._currentEl.primaryKey)) {
                currentPrimaryKey = this._currentEl.primaryKey;
            }

            // sonst muss die ganze dataRow verglichen werden
            if (kijs.isEmpty(currentPrimaryKey) && kijs.isDefined(this._currentEl.dataRow)) {
                currentDataRow = this._currentEl.dataRow;
            }
        }

        // bei einem reload via RPC stimmen die selectedKeysRows nicht mehr mit
        // den Zeilem in data überein. Die selectedKeysRows müssen darum neu
        // aus dem Recordset geholt werden. Dazu wird ein Primary-Key über alle
        // Spalten angelegt und damit verglichen
        if (kijs.isEmpty(this._primaryKeyFields)) {
            if (!kijs.isEmpty(this._selectedKeysRows)) {
                this._selectedKeysRows = kijs.Data.updateRowsReferences(
                        this._selectedKeysRows, this._data);
            }
        }

        // Evtl. sortieren
        if (!options.skipSort && !kijs.isEmpty(this._sortFields)) {
            kijs.Data.sort(data, this._sortFields, null, false);
        }

        // Bestehende Elemente löschen
        if (!options.skipRemoveElements && !kijs.isEmpty(this.elements)) {
            this.removeAll({
                preventRender: true
            });
            this._currentEl = null;
        }

        // Neue Elemente generieren
        let newElements = [];
        for (let i=0, len=data.length; i<len; i++) {

            // Zeile überspringen, falls sie im Filter hängen bleibt.
            if (!options.skipFilters && !kijs.isEmpty(this._filters) &&
                    !kijs.Data.rowMatchFilters(data[i], this._filters)) {
                continue;
            }

            const newEl = this._createElement({ dataRow: data[i] });
            newEl.parent = this;

            // Selektierung anwenden
            if (!options.skipSelected) {
                if (!kijs.isEmpty(this._primaryKeyFields)) {
                    if (kijs.Array.contains(this._selectedKeysRows, newEl.primaryKey)) {
                        newEl.selected = true;
                    }
                } else {
                    if (kijs.Array.contains(this._selectedKeysRows, newEl.dataRow)) {
                        newEl.selected = true;
                    }
                }
            }

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

            // Evtl. fokus wieder setzen
            if (!kijs.isEmpty(currentPrimaryKey)) {
                if (newEl.primaryKey === currentPrimaryKey) {
                    this._currentEl = newEl;
                }
            } else if (!kijs.isEmpty(currentDataRow)) {
                if (newEl.dataRow === currentDataRow) {
                    this._currentEl = newEl;
                }
            }

            newElements.push(newEl);
        }

        // neue Elemente einfügen
        this.add(newElements);
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
