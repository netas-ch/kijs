/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.Tree
// --------------------------------------------------------------
kijs.gui.Tree = class kijs_gui_Tree extends kijs.gui.DataView {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        this._captionField = null;
        this._captionHtmlDisplayType = 'code';
        this._valueField = null;

        this._elementDdTargetConfig = null; // Konfiguration Ordner, damit ein Drop
        //                                  // in den Ordner gemacht werden kann.

        // Icons für expand-Button
        this._expandButtonCollapsedIconMap = 'kijs.iconMap.Fa.caret-right';
        this._expandButtonExpandedIconMap = 'kijs.iconMap.Fa.caret-down';

        // Standard-Icon (optional)
        this._iconMap = 'kijs.iconMap.Fa.file';                 // Datei (overwrite)
        this._iconChar = null;
        this._iconCls = null;
        this._iconAnimationCls = null;
        this._iconColor = null;

        this._collapsedIconMap = 'kijs.iconMap.Fa.folder';      // Ordner zu
        this._expandedIconMap = 'kijs.iconMap.Fa.folder-open';  // Ordner auf

        // Feldnamen (optional)
        this._clsField = null;
        this._iconMapField = null;
        this._iconCharField = null;
        this._iconClsField = null;
        this._iconAnimationClsField = null;
        this._iconColorField = null;

        this._collapsedIconMapField = null;
        this._expandedIconMapField = null;

        // Feldnamen für weitere Eigenschaften
        this._childrenField = null;       // Feldname für Kinder
        this._expandedField = null;     // Feldname für expandiert-Feld (optional)

        this._allowChildrenField = null;  // Sind Kinder erlaubt? Ja=Ordner, Nein=leaf/Datei
        this._indent = 16;              // Einrückungstiefe pro Hierarchiestufe in Pixel
        this._expandedKeysRows = [];    // Bei primaryKeyFields: Array mit PrimaryKeys der expandierten Elemente
                                        // sonst: Array mit den dataRows der expandierten Elemente
        this._tooltipField = null;
        this._showCheckBoxes = false;
        this._value = null;

        this._dom.clsRemove('kijs-dataview');
        this._dom.clsAdd('kijs-tree');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            elementXType: 'kijs.gui.dataView.element.Tree',
            selectType: 'single',
            ddName: kijs.uniqId('tree.element'),
            ddPosBeforeFactor: 0.5,
            ddPosAfterFactor: 0.8
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            expandButtonExpandedIconMap: true,
            expandButtonCollapsedIconMap: true,

            captionField: true,
            captionHtmlDisplayType: true,

            iconMap: true,
            iconChar: true,
            iconCls: true,
            iconAnimationCls: true,
            iconColor: true,

            collapsedIconMap: true,
            expandedIconMap: true,

            clsField: true,
            iconMapField: true,
            iconCharField: true,
            iconClsField: true,
            iconAnimationClsField: true,
            iconColorField: true,

            collapsedIconMapField: true,
            expandedIconMapField: true,

            showCheckBoxes: true,
            tooltipField: true,
            valueField: true,

            childrenField: true,
            expandedField: true,
            allowChildrenField: true,

            indent: true,

            elementDdTargetConfig: true,

            expandFilters: { prio: 90, fn: 'function', target: this.expandByFilters, context: this }, // Filter, die definieren, welche Knoten die expandiert werden.

            value: { prio: 200, target: 'value' }
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }

        // Events
        this.on('afterLoad', this.#onAfterLoad, this);
    }



    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get allowChildrenField() { return this._allowChildrenField; }
    set allowChildrenField(val) { this._allowChildrenField = val; }

    get captionHtmlDisplayType() { return this._captionHtmlDisplayType; }
    set captionHtmlDisplayType(val) { this._captionHtmlDisplayType = val; }

    get captionField() { return this._captionField; }
    set captionField(val) { this._captionField = val; }

    get clsField() { return this._clsField; }
    set clsField(val) { this._clsField = val; }

    get childrenField() { return this._childrenField; }
    set childrenField(val) { this._childrenField = val; }

    get collapsedIconMap() { return this._collapsedIconMap; }
    set collapsedIconMap(val) { this._collapsedIconMap = val; }

    get collapsedIconMapField() { return this._collapsedIconMapField; }
    set collapsedIconMapField(val) { this._collapsedIconMapField = val; }

    get elementDdTargetConfig() {
        return this._elementDdTargetConfig;
    }
    set elementDdTargetConfig(val) {
        this._elementDdTargetConfig = val;
    }

    get expandButtonCollapsedIconMap() { return this._expandButtonCollapsedIconMap; }
    set expandButtonCollapsedIconMap(val) { this._expandButtonCollapsedIconMap = val; }

    get expandButtonExpandedIconMap() { return this._expandButtonExpandedIconMap; }
    set expandButtonExpandedIconMap(val) { this._expandButtonExpandedIconMap = val; }

    get expandedField() { return this._expandedField; }
    set expandedField(val) { this._expandedField = val; }

    get expandedIconMap() { return this._expandedIconMap; }
    set expandedIconMap(val) { this._expandedIconMap = val; }

    get expandedIconMapField() { return this._expandedIconMapField; }
    set expandedIconMapField(val) { this._expandedIconMapField = val; }

    get expandedKeysRows() { return this._expandedKeysRows; }

    get iconAnimationCls() { return this._iconAnimationCls; }
    set iconAnimationCls(val) { this._iconAnimationCls = val; }

    get iconAnimationClsField() { return this._iconAnimationClsField; }
    set iconAnimationClsField(val) { this._iconAnimationClsField = val; }

    get iconChar() { return this._iconChar; }
    set iconChar(val) { this._iconChar = val; }

    get iconCharField() { return this._iconCharField; }
    set iconCharField(val) { this._iconCharField = val; }

    get iconCls() { return this._iconCls; }
    set iconCls(val) { this._iconCls= val; }

    get iconClsField() { return this._iconClsField; }
    set iconClsField(val) { this._iconClsField = val; }

    get iconColor() { return this._iconColor; }
    set iconColor(val) { this._iconColor = val; }

    get iconColorField() { return this._iconColorField; }
    set iconColorField(val) { this._iconColorField = val; }

    get iconMap() { return this._iconMap; }
    set iconMap(val) { this._iconMap = val; }

    get iconMapField() { return this._iconMapField; }
    set iconMapField(val) { this._iconMapField = val; }

    get indent() { return this._indent; }

    get showCheckBoxes() { return this._showCheckBoxes; }
    set showCheckBoxes(val) { this._showCheckBoxes = val; }

    get tooltipField() { return this._tooltipField; }
    set tooltipField(val) { this._tooltipField = val; }

    get value() {
        let val = null;

        if (!kijs.isEmpty(this._data) && this._valueField) {
            let rows = this.getSelectedRows();
            if (!kijs.isEmpty(rows)) {
                val = [];
                kijs.Array.each(rows, function(row) {
                    val.push(row[this._valueField]);
                }, this);

                let returnAsArray = true;
                switch (this._selectType) {
                    case 'none':
                    case 'single':
                    case 'singleAndEmpty':
                        returnAsArray = false;
                        break;

                    case 'multi':
                    case 'simple':
                        returnAsArray = true;
                        break;

                    case 'manual':
                        returnAsArray = val.length > 1;
                        break;

                }

                // bei nur einem Wert direkt den Wert, ohne Array zurückgeben
                if (!returnAsArray) {
                    if (val.length === 1) {
                        val = val[0];
                    } else if (val.length === 0) {
                        val = null;
                    }
                }
            }

        } else {
            val = this._value;

        }

        return val;
    }
    set value(val) {
        if (kijs.isEmpty(this._valueField)) {
            throw new kijs.Error(`Es wurde kein "valueField" definiert.`);
        }

        this._value = val;

        let filters = null;

        if (kijs.isArray(val)) {
            filters = {
                operator: 'OR',
                parts:[]
            };
            kijs.Array.each(val, function(v) {
                if (!kijs.isEmpty(v)) {
                    filters.parts.push({
                        field: this._valueField,
                        operator: '=',
                        value: v
                    });
                }
            }, this);
        } else if (!kijs.isEmpty(val)) {
            filters = {
                field: this._valueField,
                operator: '=',
                value: val
            };
        }
        this.selectByFilters(filters, false, true);
    }

    get valueField() { return this._valueField; }
    set valueField(val) { this._valueField = val; }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    /**
     * Alle Knoten zuklappen
     * @returns {undefined}
     */
    collapseAll() {
        this._expandedKeysRows = [];

        // Neu Laden
        if (this.isRendered) {
            this.reload({ noRpc:true, skipExpandedFromExpandedField:true });
        }
    }

    /**
     * Expandiert ein oder mehrere Elemente
     * @param {Array|Object} filters                    Array mit Objektdefinitionen der Elemente, die expandiert werden sollen
     *                                                  Beispiel 1 (nur ein Datensatz wird selektiert bei nur einem PrimaryKey-Field):
     *                                                  { field: "Id", value: 123 }
     *
     *                                                  Beispiel 2 (mehrere werden expandiert bei nur einem PrimaryKey-Field):
     *                                                  [ { field: "Id", value: 123 }, { field: "Id", value: 124 } ]
     *
     *                                                  Beispiel 3 (nur ein Datensatz wird expandiert bei mehreren PrimaryKey-Fields):
     *                                                  [
     *                                                    { field: "Name", value: "Muster" },
     *                                                    { field: "Vorname", value: "Max" }
     *                                                  ]
     *
     *                                                  Beispiel 4 (mehrere Datensätze werden expandiert bei mehreren PrimaryKey-Fields):
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
     * @returns {undefined}
     */
    collapseByFilters(filters) {

        // Die Elemente durchgehen und wenn sie zum Filter passen: das Element vormerken
        if (!kijs.isEmpty(this._expandedKeysRows) && !kijs.isEmpty(filters)) {

            let keysRows = [];
            let rows = kijs.Data.filter(this._data, filters, this._childrenField);

            if (kijs.isEmpty(this._primaryKeyFields)) {
                keysRows = rows;
            } else if (!kijs.isEmpty(rows)) {
                for (let i=0, len=rows.length; i<len; i++) {
                    keysRows.push(kijs.Data.getPrimaryKeyString(rows[i], this._primaryKeyFields));
                }
            }

            if (!kijs.isEmpty(keysRows)) {
                this._expandedKeysRows = kijs.Array.diff(this._expandedKeysRows, keysRows);
            }
        }

        // Neu Laden
        if (this.isRendered) {
            this.reload({ noRpc:true, skipExpandedFromExpandedField:true });
        }
    }
    
    /**
     * Alle Knoten aufklappen
     * @param {Boolean} [deep=null] Tiefe. 1=nur 1. Hierarchiestufe, 2=..., null=alle Stufen
     * @returns {undefined}
     */
    expandAll(deep=null) {
        this._expandedKeysRows = [];

        this._expandAllRec(this._data, deep);

        // Neu Laden
        if (this.isRendered) {
            this.reload({ noRpc:true, skipExpandedFromExpandedField:true });
        }
    }

    /**
     * Expandiert ein oder mehrere Elemente
     * @param {Array|Object} filters                    Array mit Objektdefinitionen der Elemente, die expandiert werden sollen
     *                                                  Beispiel 1 (nur ein Datensatz wird selektiert bei nur einem PrimaryKey-Field):
     *                                                  { field: "Id", value: 123 }
     *
     *                                                  Beispiel 2 (mehrere werden expandiert bei nur einem PrimaryKey-Field):
     *                                                  [ { field: "Id", value: 123 }, { field: "Id", value: 124 } ]
     *
     *                                                  Beispiel 3 (nur ein Datensatz wird expandiert bei mehreren PrimaryKey-Fields):
     *                                                  [
     *                                                    { field: "Name", value: "Muster" },
     *                                                    { field: "Vorname", value: "Max" }
     *                                                  ]
     *
     *                                                  Beispiel 4 (mehrere Datensätze werden expandiert bei mehreren PrimaryKey-Fields):
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
     * @param {Boolean} [keepExisting=false]            Sollen die bereits Expandierten expandiert bleiben?
     * @returns {undefined}
     */
    expandByFilters(filters, keepExisting=false) {
        if (!keepExisting) {
            this._expandedKeysRows = [];
        }

        // Die Elemente durchgehen und wenn sie zum Filter passen: das Element vormerken
        if (!kijs.isEmpty(filters)) {

            let keysRows = [];
            let rows = kijs.Data.filter(this._data, filters, this._childrenField);

            if (kijs.isEmpty(this._primaryKeyFields)) {
                keysRows = rows;
            } else if (!kijs.isEmpty(rows)) {
                for (let i=0, len=rows.length; i<len; i++) {
                    keysRows.push(kijs.Data.getPrimaryKeyString(rows[i], this._primaryKeyFields));
                }
            }

            if (!kijs.isEmpty(keysRows)) {
                if (kijs.isEmpty(this._expandedKeysRows)) {
                    this._expandedKeysRows = keysRows;
                } else {
                    this._expandedKeysRows = kijs.Array.concatUnique(keysRows, this._expandedKeysRows);
                }
            }
        }

        // Neu Laden
        if (this.isRendered) {
            this.reload({ noRpc:true, skipExpandedFromExpandedField:true });
        }
    }

    /**
     * Gibt die expandierten Elemente zurück.
     * Vorsicht: falls bei einem Tree ein Element noch nicht erstellt wurde, weil der Eltern-Knoten
     * nicht aufgeklappt wurde, wird es nicht zurückgegeben.
     * Dafür besser die Funktionen getExpandedPrimaryKeys() und getExpandedRows() verwenden!
     * @returns {Array}
     */
    getExpanded() {
        let ret = [];
        for (let i=0, len=this._elements.length; i<len; i++) {
            if (this._elements[i].expanded) {
                ret.push(this._elements[i]);
            }
        }

        return ret;
    }
    
    /**
     * Gibt die PrimaryKey-Strings der expandierten Elemente als Array zurück
     * Siehe dazu kijs.Data.getPrimaryKey()
     * @returns {Array}
     */
    getExpandedPrimaryKeys() {
        let primaryKeys = [];

        if (kijs.isEmpty(this._primaryKeyFields)) {
            throw new kijs.Error(`No primaryKeyFields were defined.`);
        } else  {
            for (let i=0, len=this._expandedKeysRows.length; i<len; i++) {
                primaryKeys.push(kijs.Data.getPrimaryKeyString(
                        this._expandedKeysRows[i], this._primaryKeyFields));
            }
        }
        
        return primaryKeys;
    }

    /**
     * Gibt die dataRows der expandierten Elemente zurück
     * @returns {Array}
     */
    getExpandedRows() {
        let rows = [];

        if (!kijs.isEmpty(this._expandedKeysRows)) {
            if (kijs.isEmpty(this._primaryKeyFields)) {
                rows = kijs.Array.clone(this._expandedKeysRows);
            } else {
                for (let i=0, len=this._expandedKeysRows.length; i<len; i++) {
                    rows = filterByPrimaryKeys(this._data, this._expandedKeysRows,
                            this._primaryKeyFields, this._childrenField);
                }
            }
        }

         return rows;
    }

    // overwrite
    getSelectedRows() {
        let rows = [];

        if (!kijs.isEmpty(this._primaryKeyFields)) {
            rows = kijs.Data.filterByPrimaryKeys(this._data, this._selectedKeysRows,
                    this._primaryKeyFields, this._childrenField);

        } else {
            rows = kijs.Array.clone(this._selectedKeysRows);

        }

        if (this._selectType === 'none') {
            return null;

        } else if (kijs.Array.contains(['single', 'singleAndEmpty'], this._selectType)) {
            return rows.length ? [rows[0]] : null;

        } else {
            return rows;

        }
    }

    // overwrite
    handleKeyDown(nodeEvent) {
        let isShiftPress = !!nodeEvent.shiftKey;
        let isCtrlPress = !!nodeEvent.ctrlKey;

        if (kijs.Navigator.isMac) {
            isCtrlPress = !!nodeEvent.metaKey;
        }

        let expanded = this._currentEl ? this._currentEl.expanded : false;

        if (!this.disabled) {
            switch (nodeEvent.code) {
                case 'ArrowLeft':
                    // falls expandiert: zusammenklappen
                    if (this._currentEl) {
                        if (expanded && !this._currentEl.disabled) {
                            this._currentEl.collapse();

                        // falls nicht expandiert und Eltern-Knoten vorhanden:
                        // den Fokus auf Eltern-Knoten setzen
                        } else if (this._currentEl.parentElement) {
                            this.current = this._currentEl.parentElement;
                            if (this._focusable) {
                                this._currentEl.focus();
                            }

                            if (isShiftPress || (!isCtrlPress && kijs.Array.contains(['single', 'singleAndEmpty', 'multi'], this._selectType))) {
                                this._selectEl(this._currentEl, isShiftPress, isCtrlPress);
                            }

                        // falls nicht expandiert und kein Eltern-Knoten vorhanden:
                        // den Fokus auf vorherigen Knoten setzen
                        } else {
                            let prev = this._currentEl.previous;
                            while (prev && prev.disabled) {
                                prev = prev.previous;
                            }

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
                    }
                    nodeEvent.preventDefault();
                    break;

                case 'ArrowUp':
                    if (this._currentEl && this._elements) {
                        let found = false;

                        kijs.Array.each(this._elements, function (el) {
                            if (found) {
                                if (!el.disabled && el.top < this._currentEl.top && el.left === this._currentEl.left) {
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
                        // falls nicht expandiert und Kinder: expandieren
                        if (!expanded && this._currentEl.hasChildren) {
                            this._currentEl.expand();

                        // sonst zum nächsten Knoten gehen
                        } else {
                            let next = this._currentEl.next;
                            while (next && next.disabled) {
                                next = next.next;
                            }

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
                    }
                    nodeEvent.preventDefault();
                    break;

                case 'ArrowDown':
                    if (this._currentEl && this._elements) {
                        let found = false;
                        kijs.Array.each(this._elements, function(el) {
                            if (found) {
                                if (!el.disabled && el.top > this._currentEl.top && el.left === this._currentEl.left) {
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
                    nodeEvent.preventDefault();
                    break;

            }
        }
    }

    // overwrite
    selectByFilters(filters, keepExisting=false, preventSelectionChange=false) {
        let rows = kijs.Data.filter(this._data, filters, this._childrenField);

        let ret = this.selectByDataRows(rows, keepExisting, preventSelectionChange);

        // Element mit Fokus neu ermitteln
        this._currentEl = null;
        this.current = null;

        return ret;
    }


    // PROTECTED
    /**
     * Erstellt die Elemente
     * overwrite
     * @param {array|string} data
     * @param {Object} [options={}] options mit Einstellungen zum _laden
     *      {
     *       noRpc: false,              // Soll kein RPC gemacht werden?
     *       skipSelected: false        // Sollen nicht wieder die gleichen Elemente wie
     *                                  // vorher selektiert werden?
     *       skipExpandedFromExpandedField: false  // Soll nicht gemäss expandedField
     *                                  // expandiert werden?
     *       skipFilters: false         // Soll nicht gefiltert werden?
     *       skipSort: false            // Soll nicht sortiert werden?
     *       skipFocus: false,          // Soll das DataView nicht wieder den Fokus
     *                                  // erhalten, wenn es ihn vorher hatte?
     *       skipRemoveElements: false  // Sollen die bestehenden Elemente nicht entfernt werden?
     *       skipScroll: false          // Soll nicht wieder zur gleichen Position gescrollt werden?
     *      }
     * @returns {undefined}
     */
    _createElements(data, options={}) {
        options.noRpc = !!options.noRpc;
        options.skipSelected = !!options.skipSelected;
        options.skipExpandedFromExpandedField = !!options.skipExpandedFromExpandedField;
        options.skipFilters = !!options.skipFilters;
        options.skipSort = !!options.skipSort;
        options.skipFocus = !!options.skipFocus;
        options.skipRemoveElements = !!options.skipRemoveElements;

        // Sollen gemäss recordset expandiert werden?
        if (kijs.isEmpty(this._expandedField) && !kijs.isEmpty(this._expandedKeysRows)) {
            options.skipExpandedFromExpandedField = true;
        }

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

        // Evtl. sortieren
        if (!options.skipSort && this._sortFields) {
            kijs.Data.sort(data, this._sortFields, this._childrenField, false);
        }

        // Bestehende Elemente löschen
        if (!options.skipRemoveElements && this.elements) {
            this.removeAll({
                preventRender: true
            });
            this._currentEl = null;
        }
        
        // Neue Elemente generieren
        let newElements = this._createElementsRec(data, 0, null, currentPrimaryKey, currentDataRow, options);
        
        // neue Elemente einfügen
        this.add(newElements);
    }

    /**
     * Neue Elemente Rekursiv generieren
     * @param {Array} data
     * @param {Number} depth  Stufe in der Hierarchie (0=oberste Stufe)
     * @param {kijs.gui.dataView.element.Tree} parentElement
     * @param {String} currentPrimaryKey
     * @param {Array} currentDataRow
     * @param {Object} options  options mit Einstellungen zum _laden
     *      {
     *       noRpc: false,              // Soll kein RPC gemacht werden?
     *       skipSelected: false        // Sollen nicht wieder die gleichen Elemente wie
     *                                  // vorher selektiert werden?
     *       skipExpandedFromExpandedField: false  // Soll nicht gemäss expandedField
     *                                  // expandiert werden?
     *       skipFilters: false         // Soll nicht gefiltert werden?
     *       skipSort: false            // Soll nicht sortiert werden?
     *       skipFocus: false,          // Soll das DataView nicht wieder den Fokus
     *                                  // erhalten, wenn es ihn vorher hatte?
     *       skipRemoveElements: false  // Sollen die bestehenden Elemente nicht entfernt werden?
     *       skipScroll: false          // Soll nicht wieder zur gleichen Position gescrollt werden?
     *      }
     * @returns {Array}
     */
    _createElementsRec(data, depth, parentElement, currentPrimaryKey, currentDataRow, options) {
        let newElements = [];

        for (let i=0, len=data.length; i<len; i++) {

            // Zeile überspringen, falls sie im Filter hängen bleibt.
            if (!options.skipFilters && !kijs.isEmpty(this._filters) &&
                    !kijs.Data.rowMatchFilters(data[i], this._filters)) {
                continue;
            }

            // Primärschlüssel oder rows der expandierten Elemente aus den Daten holen
            if (!options.skipExpandedFromExpandedField && data[i][this._expandedField]) {
                // Falls vorhanden, die primaryKeys merken
                if (!kijs.isEmpty(this._primaryKeyFields)) {
                    this._expandedKeysRows.push(
                            kijs.Data.getPrimaryKeyString(data[i], this._primaryKeyFields));

                // sonst muss die gesammte dataRow gemerkt werden
                } else {
                    this._expandedKeysRows.push(data[i]);

                }
            }

            const newEl = this._createElement({
                dataRow: data[i],
                depth: depth,
                parentElement: parentElement
            });
            newEl.parent = this;

            // Disabled
            if (!kijs.isEmpty(this._disabledField) && !kijs.isEmpty(data[i][this._disabledField])
                    && !!data[i][this._disabledField]) {
                newEl.disabled = true;
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

            if (this._elementDdTargetConfig) {
                newEl.ddTarget = this._elementDdTargetConfig;
            } else if (this._sortable) {
                if (newEl.allowChildren) {
                    let ddTarget = {
                        posBeforeFactor: this._ddPosBeforeFactor,
                        posAfterFactor: this._ddPosAfterFactor,
                        on: {
                            drop: this.#onTargetChildDrop,
                            context: this
                        }
                    };

                    ddTarget.mapping = {};
                    ddTarget.mapping[this._ddName] = {
                        allowMove: true,
                        allowCopy: false,
                        allowLink: false,
                        disableMarker: true
                    };

                    newEl.ddTarget = ddTarget;
                }
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

            // expand-Event
            newEl.on('expand', function(e) {
                return this.raiseEvent('elementExpand', e);
            }, this);

            // collapse-Event
            newEl.on('collapse', function(e) {
                return this.raiseEvent('elementCollapse', e);
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

            // Falls Kinder existieren und der Knoten expandiert ist: die Kinder auch laden
            if (!kijs.isEmpty(this._childrenField)) {
                if (newEl.expanded && !kijs.isEmpty(data[i][this._childrenField])) {
                    let newChildElements = this._createElementsRec(
                            data[i][this._childrenField],
                            depth+1,
                            newEl,
                            currentPrimaryKey,
                            currentDataRow,
                            options);

                    newElements = kijs.Array.concat(newElements, newChildElements);
                }
            }

        }

        return newElements;
    }

    /**
     * Expandiert die Knoten des Recordsets rekursiv auf
     * @param {Array} rows
     * @param {Number|Null} deep
     * @returns {undefined}
     */
    _expandAllRec(rows, deep) {
        if (deep === null || deep >= 1) {
            for (let i=0, len=rows.length; i<len; i++) {
                // Sind Kinder vorhanden
                if (!kijs.isEmpty(rows[i][this._childrenField])) {
                    // expandieren
                    if (kijs.isEmpty(this._primaryKeyFields)) {
                        this._expandedKeysRows.push(rows[i]);
                    } else {
                        this._expandedKeysRows.push(
                                kijs.Data.getPrimaryKeyString(rows[i], this._primaryKeyFields));
                    }

                    // rekursiver Aufruf
                    this._expandAllRec(rows[i][this._childrenField], deep ? deep-1 : null);
                }
            }
        }
    }


    // PRIVATE
    // LISTENERS
    #onAfterLoad(e) {
        if (!kijs.isEmpty(this._value)) {
            this.value = this._value;
        }
    }

    // overwrite
    #onSourceDrop(e) {
        let dataRows = [];

        // Source Element
        let sourceEl = e.source.ownerEl;

        let targetOwnerTree = e.target.ownerEl;
        if (targetOwnerTree instanceof kijs.gui.dataView.element.Tree) {
            targetOwnerTree = targetOwnerTree.parent;
        }

        // Source dataRow merken, damit beim Ziel wieder eingefügt werden kann
        kijs.gui.DragDrop.data.sourceDataRow = sourceEl.dataRow;

        if (e.source.name === this._ddName && e.operation === 'move') {
            // betroffene dataRows ermitteln
            if (sourceEl.parentElement) {
                dataRows = sourceEl.parentElement.dataRow[this._childrenField];
            } else {
                dataRows = this._data;
            }

            // Zeile aus Source entfernen
            kijs.Array.remove(dataRows, sourceEl.dataRow);

            // speichern
            if (this._autoSave && this._rpcSaveFn) {
                // nur speichern, wenn das Target ein anderes Element ist
                // (sonst wird ja beim target bereits gespeichert)
                if (targetOwnerTree !== this) {
                    this.save();
                }
            }

            // evtl. neu laden
            if (targetOwnerTree !== this) {
                this.reload({ noRpc:true });
            }
        }
    }

    // overwrite
    #onTargetDrop(e) {
        if (e.source.name === this._ddName) {
            let dataRows = [];
            let targetIndex = null;

            // after auf einen geöffneten Ordner: einfügen als 1. Kind
            if (e.target.targetPos === 'after' && e.target.targetEl.expanded) {

                // betroffene dataRows ermitteln
                dataRows = e.target.targetEl.dataRow[this._childrenField];

                targetIndex = 0;

                // dataRow bei gewünschtem Index einfügen
                dataRows.splice(targetIndex, 0, kijs.gui.DragDrop.data.sourceDataRow);

            // before oder after
            } else if (e.target.targetPos === 'before' || e.target.targetPos === 'after') {
                // betroffene dataRows ermitteln
                if (e.target.targetEl.parentElement) {
                    dataRows = e.target.targetEl.parentElement.dataRow[this._childrenField];
                } else {
                    dataRows = this._data;
                }

                // target index ermitteln
                targetIndex = dataRows.indexOf(e.target.targetEl.dataRow);
                if (e.target.targetPos === 'after') {
                    targetIndex++;
                }

                // dataRow bei gewünschtem Index einfügen
                dataRows.splice(targetIndex, 0, kijs.gui.DragDrop.data.sourceDataRow);

            // child
            } else if (e.target.targetPos === 'child') {
                // betroffene dataRow ermitteln
                dataRows = e.target.targetEl.dataRow[this._childrenField];

                dataRows.push(kijs.gui.DragDrop.data.sourceDataRow);

            }

            // neu laden
            this.reload({ noRpc:true });

            // speichern
            if (this._autoSave && this._rpcSaveFn) {
                this.save();
            }
        }
    }

    // Drop als Child
    #onTargetChildDrop(e) {
        if (e.source.name === this._ddName) {
            
            // dataRow am Ende anfügen
            if (e.target.ownerEl) {
                e.target.ownerEl.dataRow[this._childrenField].push(kijs.gui.DragDrop.data.sourceDataRow);

            }

            // neu laden
            this.reload({ noRpc:true });

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
            // unrender
            this.unrender(superCall);

            // Event auslösen.
            this.raiseEvent('destruct');
        }

        // Variablen (Objekte/Arrays) leeren
        this._value = null;
        this._expandedKeysRows = null;
        this._elementDdTargetConfig = null;

        // Basisklasse entladen
        super.destruct(true);
    }

};
