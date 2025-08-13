/* global kijs, this */


/*
 * TODO
 * [x] Wenn Fokus auf Baum/DataView: blauer Rahmen
 * [ ] Drag & Drop
 * [x] Aktueller DS wieder selektieren nach reload()
 * [x] Bedienung über Tastatur (Pfeiltasten, evtl. Space)
 * [x] Design (expand Button & runde Ecken bei blauem Rahmen)
 * [x] Daten von Remote
 * [o] Dynamisch nachladen reload() bei remoteData?
 * [x] Sollte auch ohne expandedField funktionieren
 * [ ] Scrollen zum 1. selektierten
 * [x] Mehrfachselektion
 * [x] Checkboxen
 * [x] ob expandiert oder nicht muss in einem Array im Tree gespeichert sein,
 *     nicht im Node. Die Daten sollten dabei nicht verändert werden.
 * [x] config expandFilters und function expandByFilters
 * [ ] kijs.gui.ListView: valueField sollte evtl. direkt primaryKeyFields setzen?
 * [o] reload Funktion mit reset Argument
 * [x] icons für Ordner
 * [-] expand mit doppelklick oder single click
 * [x] expand/collapse event: Abfragemöglichkeit auf Tree
 * [ ] Wenn lokaler value und rpc, wird der value nicht zugewiesen?
 * [ ] value beibehalten, wenn der übergeordnete Knoten zugeklappt wird
 * [x] destruct()
 * [x] DataView: Selektionen sind neu in this._selectedKeysRows gespeichert. Muss noch fertig programmiert und getestet werden.
 * [x] DataView: Reload bei RPC testen() --> selektierte anschliessend wieder selektieren
 * [x] DataView: _afterReload() selektiert nicht
 * [x] Wenn Sortierung ändert, trotzdem die Selektierung wieder anwenden.
 * [x] Auch bei ListView testen
 * [x] Auch bei Tree testen
 * [x] Selektieren innerhalb von Ordnern
 * [x] Children (plural) umbenennen zu Children. Child (singular) bleibt Child
 * [ ] Code vom Element zum Tree zügeln
 */

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

        // Feldnamen für Icons (optional)
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
            selectType: 'single'
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

            expandFilters: { prio: 85, fn: 'function', target: this.expandByFilters, context: this }, // Filter, die definieren, welche Knoten die expandiert werden.

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

    get childrenField() { return this._childrenField; }
    set childrenField(val) { this._childrenField = val; }

    get collapsedIconMap() { return this._collapsedIconMap; }
    set collapsedIconMap(val) { this._collapsedIconMap = val; }

    get collapsedIconMapField() { return this._collapsedIconMapField; }
    set collapsedIconMapField(val) { this._collapsedIconMapField = val; }

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
            let selElements = this.getSelected();
            if (kijs.isArray(selElements)) {
                val = [];
                kijs.Array.each(selElements, function(el) {
                    val.push(el.dataRow[this._valueField]);
                }, this);
            } else if (!kijs.isEmpty(selElements)) {
                val = selElements.dataRow[this._valueField];
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
            kijs.Array.each(this._elements, function(el) {
                if (el instanceof kijs.gui.dataView.element.Base) {
                    if (kijs.Data.rowMatchFilters(el.dataRow, filters)) {
                        if (!kijs.isEmpty(this._primaryKeyFields)) {
                            this._expandedKeysRows.push(el.primaryKey);
                        } else {
                            this._expandedKeysRows.push(el.dataRow);
                        }
                    }
                }
            }, this);
        }

        // Neu Laden
        this._parentEl.reload(true);
    }

    /**
     * Gibt die PrimaryKey-Strings der expandierten Elemente als Array zurück
     * Siehe dazu kijs.Data.getPrimaryKey()
     * @returns {Array}
     */
    getExpandedPrimaryKeys() {
        let primaryKeys = [];

        for (let i=0, len=this._elements.length; i<len; i++) {
            if (this._elements[i].expanded) {
                primaryKeys.push(this._elements[i].primaryKey);
            }
        }

        return primaryKeys;
    }

    /**
     * Gibt die Data-rows der expandierten Elemente zurück
     * @returns {Array}
     */
    getExpandedRows() {
        let rows = [];

        for (let i=0, len=this._elements.length; i<len; i++) {
            if (this._elements[i].expanded) {
                rows.push(this._elements[i].dataRow);
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
            return rows.length ? [rows[0]] : null ;

        } else {
            return rows;

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

// TODO: Unschön !!!!!!!!!!!!!!!¨¨¨
    selectEl(el, shift, ctrl) {
        this._selectEl(el, shift, ctrl);
    }


    // PROTECTED
    // overwrite
    /*_afterReload(currentConfig, isRpc) {
        // TODO: Funktion entspricht noch der vom DataView: Kann evtl. hier gelöscht werden.

        // Elemente wieder selektieren
        if (!kijs.isEmpty(this._primaryKeyFields)) {
            this.selectByPrimaryKeys(currentConfig.selectedKeysRows, false, true);
        } else {
            // bei einem reload via RPC stimmen die selectedKeysRows nicht mehr mit
            // den Zeilem in data überein. Die selectedKeysRows müssen darum neu
            // Aus dem Recordset geholt werden. Dazu wird ein Primary-Key über alle
            // Spalten angelegt und damit verglichen
            if (isRpc) {
                currentConfig.selectedKeysRows = kijs.Data.updateRowsReferences(
                        currentConfig.selectedKeysRows, this._data);
            }

            this.selectByDataRows(currentConfig.selectedKeysRows, false, true);
        }

        // Current Element ermitteln und setzen
        this.current = null;

        // evtl. Fokus wieder setzen
        if (this._focusable && currentConfig.hasFocus) {
            this.focus();
        }

        // zur vorherigen Position scrollen
        this._innerDom.node.scrollTo(currentConfig.scrollPosition);
    }*/


    // overwrite
    /*_beforeReload() {
        // TODO: Kann evtl. gelöscht werden, weil expandedPrimaryKeys nicht nötig ist.

        // Eigenschaften merken, die nach dem Laden wiederhergestellt werden sollen
        let currentConfig = {
            hasFocus: false,
            expandedPrimaryKeys: null,
            expandedDataRows: null,
            selectedPrimaryKeys: null,
            selectedDataRows: null,
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

        // expandierte und selektierte Elemente merken
        // Zuerst via PrimaryKey versuchen
        if (!kijs.isEmpty(this._primaryKeyFields)) {
            currentConfig.expandedPrimaryKeys = this.getExpandedPrimaryKeys();
            currentConfig.selectedPrimaryKeys = this.getSelectedPrimaryKeys();

        // sonst muss die ganze dataRow verglichen werden
        } else {
            currentConfig.expandedDataRows = this.getExpandedRows();
            currentConfig.selectedDataRows = this.getSelectedRows();

        }

        return currentConfig;
    }*/

    // overwrite
    _createElements(data, removeElements=true) {

        // Sollen gemäss recordset expandiert werden?
        let expandFromData = !!this._expandedField && kijs.isEmpty(this._expandedKeysRows);

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
        if (this._sortFields) {
            kijs.Data.sort(data, this._sortFields, this._childrenField, false);
        }

        // Bestehende Elemente löschen
        if (this.elements && removeElements) {
            this.removeAll({
                preventRender: true
            });
            this._currentEl = null;
        }
        
        // Neue Elemente generieren
        let newElements = this._createElementsRec(data, 0, null, currentPrimaryKey, currentDataRow, expandFromData);
        
        // neue Elemente einfügen
        this.add(newElements);
    }

    /**
     * Neue Elemente Rekursiv generieren
     * @param {Array} data
     * @param {Number} depth  Stufe in der Hierarchie (0=oberste Stufe)
     * @param {kijs.gui.dataView.element.Tree} parentNode
     * @param {String} currentPrimaryKey
     * @param {Array} currentDataRow
     * @param {Boolean} expandFromData Sollen die expandierten Elemente aus dem
     *                                 Recordset ermittelt werden?
     * @returns {Array}
     */
    _createElementsRec(data, depth, parentNode, currentPrimaryKey, currentDataRow, expandFromData) {
        let newElements = [];

        for (let i=0, len=data.length; i<len; i++) {

            // Zeile überspringen, falls sie im Filter hängen bleibt.
            if (!kijs.Data.rowMatchFilters(data[i], this._filters)) {
                continue;
            }

            // Primärschlüssel oder rows der expandierten Elemente aus den Daten holen
            if (expandFromData && data[i][this._expandedField]) {
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
                parentNode: parentNode
            });
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
                            expandFromData);

                    newElements = kijs.Array.concat(newElements, newChildElements);
                }
            }

        }

        return newElements;
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
        
        // Basisklasse entladen
        super.destruct(true);
    }

};
