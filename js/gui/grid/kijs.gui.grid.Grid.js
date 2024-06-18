/* global kijs, this */

// TODO: load() ist nicht kompatibel mit Basisklasse
// TODO: Sortable für Spaltenreihenfolge
// TODO: Sortable für Zeilenreihenfolge
// --------------------------------------------------------------
// kijs.gui.grid.Grid
// --------------------------------------------------------------
/**
 * EVENTS
 * ----------
 * afterLoad
 * beforeSelectionChange
 * selectionChange
 * rowClick
 * rowDblClick
 *
 */
kijs.gui.grid.Grid = class kijs_gui_grid_Grid extends kijs.gui.Element {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        this._rpc = null;                   // Instanz von kijs.gui.Rpc
        this._rows = [];
        this._columnConfigs = [];
        this._primaryKeys = [];
        this._rpcLoadFn = null;
        this._rpcLoadArgs = null;
        this._rpcSaveFn = null;      // TODO: Wird nicht verwendet !!!!!!!!!
        this._rpcSaveArgs = null;    // TODO: Wird nicht verwendet !!!!!!!!!
        this._waitMaskTarget = null;
        this._waitMaskTargetDomProperty = null;

        this._autoLoad = true;              // Datensätze nach dem Rendern automatisch vom Server laden
        this._remoteDataLoaded = 0;         // Anzahl im Grid geladener Datensätze
        this._remoteDataStartIndex = 0;     // Start-Index für Datensätze, die als nächstes geladen werden
        this._remoteDataStep = 100;         // Anzahl Datensätze, die pro request hinzugefügt werden.
        this._remoteDataTotal = null;       // Falls von Server verfügbar die total verfügbaren Datensätze, sonst die bisher geladenen
        this._remoteDataLastRowCnt = 0;     // Anzahl Datensätze des letzten Remote-Loads
        this._getRemoteMetaData = true;     // Metadaten laden?
        this._isLoading = false;            // wird zurzeit geladen?
        this._remoteSort = null;            // Remote-Sortierung

        this._lastSelectedRow = null;       // letzte Zeile, die selektiert wurde
        this._currentRow = null;            // Zeile, welche zurzeit fokusiert ist
        this._selectType = 'single';        // multiselect: single|multi|simple|none
        this._focusable = true;             // ob das grid focusiert weden kann
        this._filterable = false;

        // Intersection Observer (endless grid loader)
        this._intersectionObserver = null;

        this._dom.clsAdd('kijs-grid');

        // dom - elemente erstellen

        // 3 Zeilen
        this._topDom = new kijs.gui.Dom({cls: 'kijs-top'});
        this._middleDom = new kijs.gui.Dom({cls: 'kijs-center'});
        this._bottomDom = new kijs.gui.Dom({cls: 'kijs-bottom'});

        this._tableContainerDom = new kijs.gui.Dom({cls: 'kijs-tablecontainer', on:{scroll: this.#onTableScroll, context: this}});
        this._tableDom = new kijs.gui.Dom({nodeTagName: 'table'});

        this._headerContainerDom = new kijs.gui.Dom({cls: 'kijs-headercontainer'});
        this._headerDom = new kijs.gui.Dom({nodeTagName: 'table'});

        this._footerContainerDom = new kijs.gui.Dom({cls: 'kijs-footercontainer'});
        this._footerDom = new kijs.gui.Dom({nodeTagName: 'table'});

        this._leftContainerDom = new kijs.gui.Dom({cls: 'kijs-leftcontainer'});
        this._leftDom = new kijs.gui.Dom({nodeTagName: 'table'});

        this._rightContainerDom = new kijs.gui.Dom({cls: 'kijs-rightcontainer'});
        this._rightDom = new kijs.gui.Dom({nodeTagName: 'table'});

        // header
        this._headerLeftContainerDom = new kijs.gui.Dom({cls: 'kijs-headercontainer-left'});
        this._headerLeftDom = new kijs.gui.Dom({nodeTagName: 'table'});

        this._headerRightContainerDom = new kijs.gui.Dom({cls: 'kijs-headercontainer-right'});
        this._headerRightDom = new kijs.gui.Dom({nodeTagName: 'table'});

        // footer
        this._footerLeftContainerDom = new kijs.gui.Dom({cls: 'kijs-footercontainer-left'});
        this._footerLeftDom = new kijs.gui.Dom({nodeTagName: 'table'});

        this._footerRightContainerDom = new kijs.gui.Dom({cls: 'kijs-footercontainer-right'});
        this._footerRightDom = new kijs.gui.Dom({nodeTagName: 'table'});

        // header / filter
        this._header = new kijs.gui.grid.Header({parent: this});
        this._filter = new kijs.gui.grid.Filter({parent: this});

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            waitMaskTarget           : this,
            waitMaskTargetDomProperty: 'dom'
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            autoLoad:       true,
            rpc:            { target: 'rpc' },  // Instanz von kijs.gui.Rpc oder Name einer RPC
            rpcLoadFn:      true,
            rpcLoadArgs:    true,
            rpcSaveFn:      true,
            rpcSaveArgs:    true,
            waitMaskTarget: true,
            waitMaskTargetDomProperty: true,

            columnConfigs:  { fn: 'function', target: this.columnConfigAdd, context: this },
            primaryKeys:    { target: 'primaryKeys' },
            data:           { target: 'data' },
            remoteDataStep: { target: 'remoteDataStep' },

            focusable: true,
            filterable: true,
            filterVisible: { target: 'filterVisible' },
            selectType: { target: 'selectType' } // 'none': Es kann nichts selektiert werden
                                                 // 'single' (default): Es kann nur ein Datensatz selektiert werden
                                                 // 'multi': Mit den Shift- und Ctrl-Tasten können mehrere Datensätze selektiert werden.
                                                 // 'simple': Es können mehrere Datensätze selektiert werden. Shift- und Ctrl-Tasten müssen dazu nicht gedrückt werden.
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }

        // Events
        this.on('keyDown', this.#onKeyDown, this);
    }


    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get current() { return this._currentRow; }
    /**
     * Setzt die aktuelle Zeile, die den Fokus erhalten wird.
     * Null = automatische Ermittlung
     * Um den Fokus zu setzen verwenden Sie stattdessen die Funktion .focus() von der Zeile.
     * @param {kijs.gui.grid.Row|null} cRow
     * @returns {undefined}
     */
    set current(cRow) {
        // Falls kein cRow übergeben wurde:
        if (!cRow && !kijs.isEmpty(this._rows)) {

            // Falls es schon ein gültiges Current-Zeile gibt, dieses nehmen
            if (this._currentRow && kijs.Array.contains(this._rows, this._currentRow)) {
                cRow = this._currentRow;
            }

            // Sonst die erste selektierte Zeile
            if (!cRow) {
                let sel = this.getSelected();
                if (!kijs.isEmpty(sel)) {
                    if (kijs.isArray(sel)) {
                        sel = sel[0];
                    }
                    cRow = sel;
                }
            }

            // Sonst halt die erste Zeile
            if (!cRow) {
                cRow = this._rows[0];
            }
        }

        this._currentRow = cRow;

        kijs.Array.each(this._rows, function(row) {
            if (row === cRow) {
                row.dom.clsAdd('kijs-current');
            } else {
                row.dom.clsRemove('kijs-current');
            }
            // Nur das currentRow darf den Fokus erhalten können
            if (this._focusable && row === cRow) {
                cRow.dom.nodeAttributeSet('tabIndex', 0);
            } else {
                row.dom.nodeAttributeSet('tabIndex', undefined);
            }
        }, this);
    }

    get columnConfigs() { return this._columnConfigs; }

    set data(val) {
        if (!kijs.isArray(val)) {
            val = [val];
        }
        this.rowsRemoveAll();
        this.rowsAdd(val);
    }
    get data() {
        let dataRows = [];
        kijs.Array.each(this._rows, function(row) {
            dataRows.push(row.dataRow);
        }, this);
        return dataRows;
    }

    get filter() { return this._filter; }

    get filterable() { return this._filterable; }
    set filterable(val) { this._filterable = !!val; }

    get filterVisible() { return this._filter.visible; }
    set filterVisible(val) { this._filter.visible = !!val; }

    get firstRow() {
        if (this._rows.length > 0) {
            return this._rows[0];
        }
        return null;
    }

    get lastRow() {
        if (this._rows.length > 0) {
            return this._rows[this._rows.length-1];
        }
        return null;
    }

    set primaryKeys(val) {
        if (!kijs.isArray(val)) {
            val = [val];
        }
        kijs.Array.each(val, function(k) {
           if (!kijs.isString(k)) {
               throw new kijs.Error('invalid primary key');
           }
        }, this);
        this._primaryKeys = val;
    }
    get primaryKeys() { return this._primaryKeys; }

    get remoteDataStep() { return this._remoteDataStep; }
    set remoteDataStep(val) {
        if (!kijs.isInteger(val)) {
            val = 100;
        }
        this._remoteDataStep = val;
    }

    get rows() { return this._rows; }

    get rowsCount() { return this._remoteDataTotal || this._remoteDataLoaded; }

    get rpc() {
        return this._rpc || kijs.getRpc('default');
    }
    set rpc(val) {
        if (kijs.isString(val)) {
            val = kijs.getRpc(val);
        }

        if (val instanceof kijs.gui.Rpc) {
            this._rpc = val;
        } else {
            throw new kijs.Error(`Unkown format on config "rpc"`);
        }
    }

    get rpcLoadArgs() { return this._rpcLoadArgs; }
    set rpcLoadArgs(val) { this._rpcLoadArgs = val; }

    get rpcSaveArgs() { return this._rpcSaveArgs; }
    set rpcSaveArgs(val) { this._rpcSaveArgs = val; }

    get selectType() { return this._selectType; }
    set selectType(val) {
        if (!kijs.Array.contains(['single', 'multi', 'simple', 'none'], val)) {
            throw new kijs.Error('invalid value for selectType');
        }
        this._selectType = val;
    }


    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    /**
     * Entfernt alle Selektionen
     * @param {Boolean} [preventSelectionChange=false]    Soll das SelectionChange-Event verhindert werden?
     * @returns {undefined}
     */
    clearSelections(preventSelectionChange) {
        this.unSelect(this._rows, preventSelectionChange);
    }

    /**
     * Setzt alle dirty-records zurück.
     * @returns {undefined}
     */
    commit() {
        kijs.Array.each(this._rows, function(row) {
            row.commit();
        }, this);
    }

    columnConfigAdd(columnConfigs) {
        if (!kijs.isArray(columnConfigs)) {
            columnConfigs = [columnConfigs];
        }

        kijs.Array.each(columnConfigs, function(columnConfig) {
            let inst = this._getInstance(columnConfig, 'kijs.gui.grid.columnConfig.Text', kijs.gui.grid.columnConfig.ColumnConfig);
            inst.grid = this;
            this._columnConfigs.push(inst);
        }, this);

        if (this.isRendered) {
            this.render();
        }
    }

    /**
     * Gibt eine columnConfig anhand ihres valueField-Wertes zurück
     * @param {String} valueField
     * @returns {kijs.gui.grid.columnConfig.ColumnConfig|null}
     */
    getColumnConfigByValueField(valueField) {
        let cC = null;
        kijs.Array.each(this._columnConfigs, function(columnConfig) {
            if (columnConfig.valueField === valueField) {
                cC = columnConfig;
                return false;
            }
        }, this);

        return cC;
    }

    /**
     * Gibt die rows zurück, welche das dirty-flag haben.
     * @returns {Array}
     */
    getDirtyRows() {
        let dirtyRows = [];
        kijs.Array.each(this._rows, function(row) {
            if (row.isDirty) {
                dirtyRows.push(row);
            }
        }, this);

        return dirtyRows;
    }

    /**
     * Gibt die selektieten Zeilen zurück
     * Bei selectType='single' wird das Row direkt zurückgegeben, sonst ein Array mit den Zeilen
     * @returns {Array|kijs.gui.grid.Row|null}
     */
    getSelected() {
        let ret = [];
        for (let i=0; i<this._rows.length; i++) {
            if (this._rows[i].selected) {
                ret.push(this._rows[i]);
            }
        }

        if (this._selectType === 'none') {
            return null;

        } else if (this._selectType === 'single') {
            return ret.length ? ret[0] : null;

        } else {
            return ret;
        }
    }

    /**
     * Gibt die IDs der selektierten Datensätze zurück.
     * @returns {Array}
     */
    getSelectedIds() {
        let rows = this.getSelected(),
            hasPrimarys = this._primaryKeys.length > 0,
            multiPrimarys = this._primaryKeys.length > 1;

        // keine Rows selektiert
        if (!rows) {
            return [];
        }

        // single type: Es kommt ein Objekt
        if (!kijs.isArray(rows)) {
            rows = [rows];
        }

        // Falls keine Primaries vorhanden sind, werden die rows zurückgegeben.
        if (!hasPrimarys) {
            return rows;

        // Falls nur ein primary existiert, wird ein array mit den Ids zurückgegeben
        } else if (!multiPrimarys) {
            let ids = [], primaryKey = this._primaryKeys[0];
            kijs.Array.each(rows, function(row) {
                ids.push(row.dataRow[primaryKey]);
            }, this);

            return ids;

        // Mehrere primary keys: Pro Zeile ein Objekt mit dem Ids zurückgeben
        } else {
            let ids = [];
            kijs.Array.each(rows, function(row) {
                let idRow = {};
                kijs.Array.each(this._primaryKeys, function(pk) {
                    idRow[pk] = row.dataRow[pk];
                }, this);
                ids.push(idRow);
            }, this);

            return ids;
        }
    }

    /**
     * TODO: Wir müssten nur einzelne Rows updaten können.
     * Wenn Zeile 1000 geändert wird sind wir wieder bei 1 und müssen bis Zeile 1000 scrollen, da diese nicht mehr geladen ist.
     * Als Workaround laden wir bei resetData = false alle im Grid vorhandenen Rows neu. Siehe this._remoteLoad():
     *
     * Lädt die Daten im Grid neu.
     * @param {Boolean} restoreSelection
     * @param {Boolean} resetData Vollständig & von Anfang an neu laden (z.B. beim Filtern, Sortieren)
     * @returns {Promise}
     */
    reload(restoreSelection = true, resetData = true) {
        let selected = this.getSelectedIds();
        return this._remoteLoad(resetData).then((responseData) => {

            // Selektion wiederherstellen
            if (selected && restoreSelection) {
                this.selectByIds(selected, false, true);
            }

            if (
                this._tableDom.node
                && !this._tableDom.node.height
                && !this._tableDom.node.scrollWidth
                && this._header.node.scrollWidth
            ) {

                // Falls keine Zeilen vorhanden sind, lässt sich die Tabelle nicht mehr scrollen.
                // Also geben wir der leeren Tabelle eine Grösse, damit man dort scrollen kann.
                this._tableDom.width = this._header.node.scrollWidth;
                this._tableDom.height = 200;
            } else {
                this._tableDom.width = null;
                this._tableDom.height = null;
            }

            return responseData;
        });
    }

    // Overwrite
    render(superCall) {
        super.render(true);

        // Elemente in den haupt-dom
        this._topDom.renderTo(this._dom.node);
        this._middleDom.renderTo(this._dom.node);
        this._bottomDom.renderTo(this._dom.node);

        // header / filter
        this._headerLeftContainerDom.renderTo(this._topDom.node);
        this._headerContainerDom.renderTo(this._topDom.node);
        this._headerRightContainerDom.renderTo(this._topDom.node);

        // center (grid)
        this._leftContainerDom.renderTo(this._middleDom.node);
        this._tableContainerDom.renderTo(this._middleDom.node);
        this._rightContainerDom.renderTo(this._middleDom.node);

        // footer (summary)
        this._footerLeftContainerDom.renderTo(this._bottomDom.node);
        this._footerContainerDom.renderTo(this._bottomDom.node);
        this._footerRightContainerDom.renderTo(this._bottomDom.node);

        // header
        this._headerLeftDom.renderTo(this._headerLeftContainerDom.node);
        this._headerDom.renderTo(this._headerContainerDom.node);
        this._headerRightDom.renderTo(this._headerRightContainerDom.node);

        // center
        this._leftDom.renderTo(this._leftContainerDom.node);
        this._tableDom.renderTo(this._tableContainerDom.node);
        this._rightDom.renderTo(this._rightContainerDom.node);

        // bottom
        this._footerLeftDom.renderTo(this._footerLeftContainerDom.node);
        this._footerDom.renderTo(this._footerContainerDom.node);
        this._footerRightDom.renderTo(this._footerRightContainerDom.node);

        // header / filter
        this._header.renderTo(this._headerDom.node);
        this._filter.renderTo(this._headerDom.node);

        // rows
        this._renderRows();

        // footer (TODO)

        // Event afterRender auslösen
        if (!superCall) {
            this.raiseEvent('afterRender');
        }

        // Daten laden
        if (this._autoLoad) {
            this._autoLoad = false; // Daten nur beim ersten rendern automatisch laden.
            kijs.defer(function() {
                if (this._remoteDataLoaded === 0) {
                    this._remoteLoad(true);
                }
            }, 30, this);
        }
    }

    /**
     * Fügt eine neue Zeile hinzu oder aktualisiert eine bestehende
     * @param {Array} rows
     * @param {Number} startOffset Offset, ab dem die Rows einsortiert werden, wenn bestehende rows aktualisiert werden
     * @returns {Number} Anzahl neue Zeilen
     */
    rowsAdd(rows, startOffset=null) {
        if (!kijs.isArray(rows)) {
            rows = [rows];
        }

        let renderStartOffset = this._rows.length,
            newRows = 0,
            rowPos=0,
            offsets=[];

        kijs.Array.each(rows, function(row) {
            let currentPos = null;

            // instanz einer row gegeben. Direkt einfügen
            if (row instanceof kijs.gui.grid.Row) {
                row.parent = this;
                this._rows.push(row);

                // Position der neuen row merken
                currentPos = this._rows.length-1;

            } else {

                // row per primary key suchen
                let pRow = this._getRowByPrimaryKey(row);

                if (pRow) {

                    // bestehende row updaten
                    pRow.updateDataRow(row);

                    // Position der bestehenden Row merken
                    currentPos = this._rows.indexOf(pRow);

                } else {
                    newRows++;

                    // neue row hinzufügen
                    this._rows.push(new kijs.gui.grid.Row({
                        parent: this,
                        dataRow: row,
                        on: {
                            click: this.#onRowClick,
                            dblClick: this.#onRowDblClick,
                            context: this
                        }
                    }));

                    // Position der neuen row merken
                    currentPos = this._rows.length-1;
                }
            }

            // korrekt einsortieren
            if (startOffset !== null && currentPos !== (startOffset + rowPos)) {
                kijs.Array.move(this._rows, currentPos, startOffset + rowPos);
            }
            offsets.push(startOffset + rowPos);

            // Zähler
            rowPos++;

        }, this);

        // Alle Elemente ab dem ersten neu eingefügten Element neu rendern
        if (offsets.length > 0) {
            renderStartOffset = kijs.Array.min(offsets);
        }
        if (this.isRendered && this._rows.length > renderStartOffset) {
            this._renderRows(renderStartOffset);
        }

        return newRows;
    }

    rowsRemove(rows) {
        if (!kijs.isArray(rows)) {
            rows = [rows];
        }

        kijs.Array.each(rows, function(delRow) {

            // Row-Objekt: Dieses entfernen
            if (delRow instanceof kijs.gui.grid.Row) {
                kijs.Array.remove(this._rows, delRow);
                delRow.destruct();

            } else {
                // DataRow-Objekt: Suchen und entfernen
                kijs.Array.each(this._rows, function(row) {
                    if (row.dataRow === delRow) {
                        this.rowsRemove([row]);
                    }
                }, this);
            }
        }, this);
    }

    rowsRemoveAll() {
        this._remoteDataLoaded = 0;
        this._remoteDataStartIndex = 0;
        while (this._rows.length > 0) {
            this.rowsRemove(this._rows[0]);
        }
        this.scrollTo(0);
    }

    scrollTo(scrollTop, scrollLeft) {
        if (kijs.isInteger(scrollTop)) {
            if (this._leftContainerDom && this._leftContainerDom.node && this._leftContainerDom.node.scrollTop) {
                this._leftContainerDom.node.scrollTop = scrollTop;
            }
            if (this._rightContainerDom && this._rightContainerDom.node && this._rightContainerDom.node.scrollTop) {
                this._rightContainerDom.node.scrollTop = scrollTop;
            }
        }

        if (kijs.isInteger(scrollLeft)) {
            if (this._headerContainerDom && this._headerContainerDom.node && this._headerContainerDom.node.scrollTop) {
                this._headerContainerDom.node.scrollLeft = scrollLeft;
            }
            if (this._footerContainerDom && this._footerContainerDom.node && this._footerContainerDom.node.scrollTop) {
                this._footerContainerDom.node.scrollLeft = scrollLeft;
            }
        }
    }

    /**
     * Selektiert eine oder mehrere Zeilen
     * @param {kijs.gui.grid.Row|Array} rows oder Array mit Zeilen, die selektiert werden sollen
     * @param {Boolean} [keepExisting=false]  Soll die bestehende selektion belassen werden?
     * @param {Boolean} [preventEvent=false]  Soll der SelectionChange-Event verhindert werden?
     * @returns {Boolean} Erfolgreich?
     */
    select(rows, keepExisting=false, preventEvent=false) {
        if (kijs.isEmpty(rows)) {
            rows = [];
        }

        if (!kijs.isArray(rows)) {
            rows = [rows];
        }

        // beforeSelectionChange-Event
        if (!preventEvent) {
            let beforeSelectionChangeArgs = {rows: rows, unSelect: false, keepExisting: keepExisting, cancel: false};
            this.raiseEvent('beforeSelectionChange', beforeSelectionChangeArgs);

            // selectionChange verhindern?
            if (beforeSelectionChangeArgs.cancel === true) {
                return false;
            }
        }

        if (!keepExisting) {
            this.clearSelections(true);
        }

        kijs.Array.each(rows, function(row) {
            row.selected = true;
            row.focus();
        }, this);

        // SelectionChange auslösen
        if (!preventEvent) {
            this.raiseEvent('selectionChange', { rows: rows, unSelect: false });
        }

        return true;
    }

    /**
     * Selektiert alle Zeilen zwischen row1 und row2
     * @param {kijs.gui.grid.Row} row1
     * @param {kijs.gui.grid.Row} row2
     * @param {Boolean} [keepExisting=true]                Soll die bestehende Selektion belassen werden?
     * @param {Boolean} [preventSelectionChange=false]     Soll das SelectionChange-Event verhindert werden?
     * @returns {Boolean} Erfolgreich?
     */
    selectBetween(row1, row2, keepExisting=true, preventSelectionChange=false) {
        let found = false;
        let rows = [];

        // Alle Zeilen zwischen dem vorher selektierten Row und dem aktuellen Row selektieren
        kijs.Array.each(this._rows, function(row) {
            if (!found) {
                if (row === row1) {
                    found = 'row1';
                } else if (row === row2) {
                    found = 'row2';
                }
            }

            if (found) {
                rows.push(row);
            }

            if ((found==='row1' && row===row2) || (found==='row2' && row===row1)) {
                return false;
            }
        }, this);


        if (!kijs.isEmpty(rows)) {
            return this.select(rows, keepExisting, preventSelectionChange);
        }

        return true;
    }

    /**
     * Selektiert Datensätze anhand der ID
     * @param {Array} ids Array vonIds [id1, id2] oder bei mehreren primaryKeys ein Objekt mit {pkName: pkValue, pk2Name: pk2Value}
     * @param {Boolean} [keepExisting=false]  Soll die bestehende Selektion belassen werden?
     * @param {Boolean} [preventEvent=false]  Soll der SelectionChange-Event verhindert werden?
     * @returns {Boolean} Erfolgreich?
     */
    selectByIds(ids, keepExisting=false, preventEvent=false) {
        let hasPrimarys = this._primaryKeys.length > 0,
            multiPrimarys = this._primaryKeys.length > 1,
            rows = [];

        if (!kijs.isArray(ids)) {
            ids = [ids];
        }

        // Keine Primarys, keine ID's
        if (!hasPrimarys || !ids) {
            return;
        }

        // Array mit ID's übergeben: umwandeln in Array mit Objekten
        if (!multiPrimarys && !kijs.isObject(ids[0])) {
            let pk = this._primaryKeys[0];
            for (let i=0; i<ids.length; i++) {
                let val = ids[i];
                ids[i] = {};
                ids[i][pk] = val;
            }
        }

        // Zeilen holen
        for (let i=0; i<ids.length; i++) {
            if (kijs.isObject(ids[i])) {
                let match=false;

                kijs.Array.each(this._rows, function(row) {
                    match = true;

                    for (let idKey in ids[i]) {
                        if (row.dataRow[idKey] !== ids[i][idKey]) {
                            match = false;
                        }
                    }

                    if (match) {
                        rows.push(row);
                    }

                }, this);

            }
        }

        return this.select(rows, keepExisting, preventEvent);
    }


    /**
     * Selektiert eine oder mehrere Zeilen
     * @param {Array|Object} filters                    Array mit Objektdefinitionen der Zeilen, die selektiert werden sollen
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
     * @param {Boolean} [keepExisting=false]            Soll die bestehende Selektion belassen werden?
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

        // Nun die Zeilen durchgehen und wenn sie zum Filter passen: die Zeile vormerken
        const selRows = [];
        if (!kijs.isEmpty(filters)) {
            kijs.Array.each(this._rows, function(row) {
                const dataRow = row.dataRow;

                kijs.Array.each(filters, function(filterFields) {
                    let ok = false;
                    kijs.Array.each(filterFields, function(filterField) {
                        if (kijs.isEmpty(filterField.value) || kijs.isEmpty(filterField.field)) {
                            throw new kijs.Error(`Unkown filter format.`);
                        }

                        if (filterField.value === dataRow[filterField.field]) {
                            ok = true;
                        } else {
                            ok = false;
                            return false;
                        }
                    }, this);
                    if (ok) {
                        selRows.push(row);
                        return false;
                    }
                }, this);

            }, this);
        }

        // Zeilen selektieren
        const success = this.select(selRows, keepExisting, preventSelectionChange);

        // Element mit Fokus neu ermitteln
        if (success) {
            this._currentRow = null;
            this.current = null;
        }

        return success;
    }

    /**
     * Sortiert die Tabelle nach einer bestimmten Spalte.
     * @param {String} field
     * @param {String} [direction] ASC oder DESC
     * @returns {undefined}
     */
    sort(field, direction='ASC') {
        direction = direction.toUpperCase();
        if (!kijs.Array.contains(['ASC', 'DESC'], direction)) {
            throw new kijs.Error('invalid value for sort direction');
        }

        // entsprechende columnConfig finden
        let columnConfig = null;
        kijs.Array.each(this._columnConfigs, function(cC) {
            if (cC.valueField === field) {
                columnConfig = cC;
                return false;
            }
        }, this);

        if (columnConfig === null) {
            throw new kijs.Error('invalid sort field name');
        }

        this._remoteSort = {
            field: field,
            direction: direction
        };

        // store laden
        this._remoteLoad(true);
    }

    /**
     * Startet das editieren.
     * @param {null|Int|Array|kijs.gui.grid.cell.Cell} offset  Int: Row-Index; Array: [RowIndex, CellIndex].
     * @param {Boolean} reverse
     * @returns {kijs.gui.grid.cell.Cell|null} Die cell oder null, falls keine gefunden.
     */
    startCellEdit(offset=null, reverse=false) {
        let cellToEdit = null;
        let offsetMatch = offset === null;

        kijs.Array.each(this.rows, function(row, rowIndex) {
            kijs.Array.each(row.cells, function(cell, cellIndex) {

                // wird ein Int angegeben, ist der offset die row-nummer
                if (kijs.isInteger(offset) && offset === rowIndex) {
                    offsetMatch = true;
                }

                // Wird ein Array [1, 2] angegeben, wird nach [RowIndex, CellIndex] gesucht.
                if (kijs.isArray(offset) && offset.length === 2
                        && kijs.isInteger(offset[0]) && kijs.isInteger(offset[1])
                        && ((offset[0] === rowIndex && cellIndex >= offset[1]) || rowIndex > offset[0])) {
                    offsetMatch = true;
                }

                // edit starten falls cell gefunden.
                if (offsetMatch && cell.columnConfig.editable) {
                    this.select(row);
                    this.current = row;
                    cell.startCellEdit();
                    cellToEdit = cell;
                    return false;
                }

                // offset ist eine cell: nächste cell bearbeiten
                if (!offsetMatch && offset === cell) {
                    offsetMatch = true;
                }

            }, this, reverse);

            if (cellToEdit) {
                return false;
            }

        }, this, reverse);

        return cellToEdit;
    }

    /**
     * Stoppt alle aktiven Edits
     * @param {Boolean} cancelEdit true, falls Abgebrochen werden soll
     * @returns {undefined}
     */
    stopCellEdit(cancelEdit=false) {
        kijs.Array.each(this.rows, function(row) {
            kijs.Array.each(row.cells, function(cell) {
                cell.stopCellEdit(cancelEdit);
            }, this);
        }, this);

    }

    // overwrite
    unrender(superCall) {
        // Event auslösen.
        if (!superCall) {
            this.raiseEvent('unrender');
        }

        // header / filter
        this._header.unrender();
        this._filter.unrender();

        // bottom
        this._footerLeftDom.unrender();
        this._footerDom.unrender();
        this._footerRightDom.unrender();

        // center
        this._leftDom.unrender();
        this._tableDom.unrender();
        this._rightDom.unrender();

        // header
        this._headerLeftDom.unrender();
        this._headerDom.unrender();
        this._headerRightDom.unrender();

        // footer (summary)
        this._footerLeftContainerDom.unrender();
        this._footerContainerDom.unrender();
        this._footerRightContainerDom.unrender();

        // center (grid)
        this._leftContainerDom.unrender();
        this._tableContainerDom.unrender();
        this._rightContainerDom.unrender();

        // header / filter
        this._headerLeftContainerDom.unrender();
        this._headerContainerDom.unrender();
        this._headerRightContainerDom.unrender();

        this._topDom.unrender();
        this._middleDom.unrender();
        this._bottomDom.unrender();

        super.unrender(true);
    }

    /**
     * Deselektiert ein oder mehrere Zeilen
     * @param {kijs.gui.grid.Row|Array} rows Row oder Array mit Zeilen, die deselektiert werden sollen
     * @param {Boolean} [preventEvent=false]     Soll das (Before-)SelectionChange-Event verhindert werden?
     * @returns {Boolean} Erfolgreich?
     */
    unSelect(rows, preventEvent=false) {
        if (!kijs.isArray(rows)) {
            rows = [rows];
        }

        // beforeSelectionChange-Event
        if (!preventEvent) {
            let beforeSelectionChangeArgs = {rows: rows, unSelect: true, keepExisting: false, cancel: false};
            this.raiseEvent('beforeSelectionChange', beforeSelectionChangeArgs);

            // selectionChange verhindern?
            if (beforeSelectionChangeArgs.cancel === true) {
                return false;
            }
        }

        kijs.Array.each(rows, function(row) {
            row.selected = false;
        }, this);

        if (!preventEvent) {
            this.raiseEvent('selectionChange', { rows: rows, unSelect: true } );
        }

        return true;
    }



    // PROTECTED
    /**
     * Es kann eine Config oder eine Instanz übergeben werden. Wird eine config übergeben, wird eine instanz
     * erstellt. Wenn eine Instanz übergeben wird, wird deren typ geprüft.
     * @param {Object} configOrInstance
     * @param {String} defaultXType wird verwendet wenn in der config kein xtype definiert wurde.
     * @param {constructor} requiredClass
     * @returns {inst}
     */
    _getInstance(configOrInstance, defaultXType, requiredClass=null) {
        let inst = null;

        // Standard-Objekt übergeben: instanz von xType erstellen und config übergeben
        if (kijs.isObject(configOrInstance) && configOrInstance.constructor === window.Object) {
            configOrInstance.xtype = configOrInstance.xtype || defaultXType;
            let constructor = kijs.getObjectFromString(configOrInstance.xtype);
            if (constructor === false) {
                throw new kijs.Error('invalid xtype ' + configOrInstance.xtype);
            }
            delete configOrInstance.xtype;
            inst = new constructor(configOrInstance);


        } else if (kijs.isObject(configOrInstance)) {
            inst = configOrInstance;
        }

        if (requiredClass !== null) {
            if (!kijs.isObject(inst) || !(inst instanceof requiredClass)) {
                throw new kijs.Error('instance not from class ' + requiredClass.name);
            }
        }

        return inst;
    }

    /**
     * Sucht eine Row anhand des Primary keys
     * @param {Object} data
     * @returns {kijs.gui.grid.Row|null} die Row oder null, wenn nicht gefunden.
     */
    _getRowByPrimaryKey(data) {
        let rowMatch = null;
        if (this._primaryKeys && this._primaryKeys.length > 0) {

            kijs.Array.each(this._rows, function(row) {
                let primMatch = true;

                kijs.Array.each(this._primaryKeys, function(primaryKey) {
                    if (!data[primaryKey] || data[primaryKey] !== row.dataRow[primaryKey]) {
                        primMatch = false;
                        return false;
                    }
                }, this);

                if (primMatch) {
                    rowMatch = row;
                    return false;
                }

            }, this);
        }

        return rowMatch;
    }

    _remoteLoad(resetData=false, loadNextData=false) {
        return new Promise((resolve, reject) => {
            if (
                this._rpcLoadFn
                && !this._isLoading
                && (
                    !this._remoteDataLoaded // Erster Aufruf
                    || resetData            // Alles neu laden
                    || !loadNextData        // Reload der letzten geladenen Daten
                    || this._remoteDataLastRowCnt === this._remoteDataStep // Letzter Aufruf hatte nicht die letzten Rows, sonst wären es weniger als _remoteDataStep
                )
            ) {
                this._isLoading = true;

                let args = {};
                args.config = {};
                args.config.sort = this._remoteSort;
                args.config.getMetaData = this._getRemoteMetaData;
                args.config.filter = this._filter.getFilters();

                // alle Daten neu laden
                if (resetData) {
                    this._remoteDataStartIndex = 0;
                } else if (loadNextData) {
                    this._remoteDataStartIndex += this._remoteDataStep;
                } else {

                    // Bei normalem Reload (Update) alle bisher geladenen Daten neu laden.
                    // Dazu muss _remoteDataStep angepasst werden und alle weiteren Requests laden auch so viele Daten.
                    // TODO Besser ist es nur den / die geänderten Daten neu zu laden. Siehe this.reload().
                    // Das Grid aktualisiert dann nur diese Zeilen (ist schon so).
                    this._remoteDataStep += this._remoteDataStartIndex;
                    this._remoteDataStartIndex = 0;
                }

                args.config.start = this._remoteDataStartIndex;
                args.config.limit = this._remoteDataStep;

                if (kijs.isObject(this._rpcLoadArgs)) {
                    args = Object.assign(args, this._rpcLoadArgs);
                }

                // Lademaske wird angezeigt, wenn das erste Mal geladen wird, oder
                // wenn sämtliche Datensätze neu geladen werden.
                let showWaitMask = this._remoteDataStartIndex === 0;

                // RPC ausführen
                this.rpc.do({
                    remoteFn: this._rpcLoadFn,
                    owner: this,
                    data: args,
                    cancelRunningRpcs: true,                                        // Cancel running
                    waitMaskTarget: showWaitMask ? this._waitMaskTarget : 'none',   // Wait Mask Target
                    waitMaskTargetDomProperty: this._waitMaskTargetDomProperty      // Wait Mask Target Dom Property
                }).then((e) => {
                    this._remoteProcess(e, args, resetData);
                    resolve(e.responseData);
                }).catch((ex) => {
                    reject(ex);
                });
            }
        });
    }

    _remoteProcess(e, args, resetData) {
        // columns
        if (kijs.isArray(e.responseData.columns)) {
            kijs.Array.clear(this._columnConfigs);
            this.columnConfigAdd(e.responseData.columns);

            this._getRemoteMetaData = false;
        }

        // primary keys
        if (e.responseData.primaryKeys) {
            this.primaryKeys = e.responseData.primaryKeys;
        }

        if (resetData) {
            this.rowsRemoveAll();
        }

        // rows
        let addedRowsCnt = 0;
        if (kijs.isArray(e.responseData.rows)) {

            // Datensätze hinzufügen
            if (e.responseData.rows.length > 0) {
                this._remoteDataLastRowCnt = e.responseData.rows.length;
                addedRowsCnt = this.rowsAdd(e.responseData.rows, args.start);
            }

            // Anzahl DS zählen
            this._remoteDataLoaded += addedRowsCnt;
        }

        // Total Datensätze
        if (kijs.isInteger(e.responseData.count)) {
            this._remoteDataTotal = e.responseData.count;
        } else if (e.responseData.rows && e.responseData.rows.length) {
            this._remoteDataTotal = args.start + e.responseData.rows.length;
        }

        // Sortierungs-Icon in Header-Bar
        this._header.setSortIcons(kijs.isObject(e.responseData.sort) ? e.responseData.sort : this._remoteSort);

        this._isLoading = false;

        // event
        this.raiseEvent('afterLoad', e);
    }

    _renderRows(offset=0) {
        for (let i=offset; i<this._rows.length; i++) {
            this._rows[i].renderTo(this._tableDom.node);
        }

        this._setIntersectionObserver();
    }

    /**
     * Selektiert eine Zeile und berücksichtigt dabei die selectType und die Tasten shift und ctrl
     * @param {kijs.gui.grid.Row} row
     * @param {Boolean} shift   // Shift gedrückt?
     * @param {Boolean} ctrl    // Ctrl gedrückt?
     * @returns {Boolean}
     */
    _selectRow(row, shift, ctrl) {
        let success = false;

        if (!row) {
            return false;
        }

        // darf überhaupt selektiert werden?
        switch (this._selectType) {
            case 'single':
                shift = false;
                ctrl = false;
                break;

            case 'multi':
                // nix
                break;

            case 'simple':
                ctrl = true;
                break;

            case 'none':
            default:
                return false;
        }

        // Shift: von der selektierten bis zur ausgewählten
        if (shift && this._lastSelectedRow) {

            // selektieren
            if (this.selectBetween(this._lastSelectedRow, row, !!ctrl, false)) {
                this.current = row;
                success = true;
            }

        } else {

            // ctrl und bereits selektiert: Abwählen
            if (ctrl && row.selected) {
                if (this.unSelect(row)) {
                    this.current = null;
                    success = true;
                }
                if (row === this._lastSelectedRow) {
                    this._lastSelectedRow = null;
                }
            } else {
                if (this.select(row, !!ctrl)) {
                    this.current = row;
                    success = true;
                }
                if (row.selected) {
                    this._lastSelectedRow = row;
                }
            }
        }
        return success;
    }

    /**
     * Setzt den intersection observer auf die letzte row.
     * @returns {undefined}
     */
    _setIntersectionObserver() {
        // Der Intersection Observer beobachtet die Scroll-Position und wirft ein Event, wenn
        // das Scrolling gegen das Ende der Seite kommt.
        if (window.IntersectionObserver) {
            if (!this._intersectionObserver || this._intersectionObserver.root !== this._tableContainerDom.node) {
                this._intersectionObserver = new IntersectionObserver(this.#onIntersect.bind(this), {
                    root: this._tableContainerDom.node,
                    rootMargin: '100px',
                    threshold: 0
                });
            }

            // observer auf letzte zeile setzen
            if (this._intersectionObserver) {
                this._intersectionObserver.disconnect();

                if (this._rows.length > 0) {
                    this._intersectionObserver.observe(this._rows[this._rows.length - 1].node);
                }
            }
        }
    }



    // PRIVATE
    // LISTENERS
    /**
     * Wird ausgelöst, wenn die Scrollbar 200px von der letzten Zeile entfernt ist.
     * @param {IntersectionObserverEntrys} intersections
     * @returns {undefined}
     */
    #onIntersect(intersections) {
        if (intersections.length > 0) {
            kijs.Array.each(intersections, function(intersection) {
                if (intersection.isIntersecting) {
                    this._remoteLoad(false, true);
                }
            }, this);
        }
    }

    #onKeyDown(e) {
        let kCode=e.nodeEvent.code, ctrl=e.nodeEvent.ctrlKey, shift=e.nodeEvent.shiftKey;

        if (!this.disabled) {
            let targetRow = null;

            if (this._currentRow) {
                switch (kCode) {
                    case 'ArrowDown': targetRow = this._currentRow.next; break;
                    case 'ArrowUp': targetRow = this._currentRow.previous; break;
                    case 'Space': targetRow = this._currentRow; break;
                }
            }

            if (!this.disabled && targetRow) {
                if (this._selectRow(targetRow, shift, ctrl)) {
                    targetRow.focus();
                }

                e.nodeEvent.preventDefault();
            }
        }
    }

    #onRowClick(e) {
        let targetRow = e.element, ctrl=e.nodeEvent.ctrlKey, shift=e.nodeEvent.shiftKey;

        if (!this.disabled && this._selectRow(targetRow, shift, ctrl)) {
            targetRow.focus();
        }

        // Event weiterreichen
        this.raiseEvent('rowClick', e);
    }

    #onRowDblClick(e) {
        // Event weiterreichen
        this.raiseEvent('rowDblClick', e);
    }

    #onTableScroll(e) {
        let scrollTop = e.dom.node.scrollTop;
        let scrollLeft = e.dom.node.scrollLeft;

        this._headerContainerDom.node.scrollLeft = scrollLeft;
        this._footerContainerDom.node.scrollLeft = scrollLeft;

        this._leftContainerDom.node.scrollTop = scrollTop;
        this._rightContainerDom.node.scrollTop = scrollTop;
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

        // header / filter
        this._header.destruct();
        this._filter.destruct();

        // bottom
        this._footerLeftDom.destruct();
        this._footerDom.destruct();
        this._footerRightDom.destruct();

        // center
        this._leftDom.destruct();
        this._tableDom.destruct();
        this._rightDom.destruct();

        // header
        this._headerLeftDom.destruct();
        this._headerDom.destruct();
        this._headerRightDom.destruct();

        // footer (summary)
        this._footerLeftContainerDom.destruct();
        this._footerContainerDom.destruct();
        this._footerRightContainerDom.destruct();

        // center (grid)
        this._leftContainerDom.destruct();
        this._tableContainerDom.destruct();
        this._rightContainerDom.destruct();

        // header / filter
        this._headerLeftContainerDom.destruct();
        this._headerContainerDom.destruct();
        this._headerRightContainerDom.destruct();

        this._topDom.destruct();
        this._middleDom.destruct();
        this._bottomDom.destruct();

        // Variablen (Objekte/Arrays) leeren
        // -----------------------------------

        // header / filter
        this._header = null;
        this._filter = null;

        // bottom
        this._footerLeftDom = null;
        this._footerDom = null;
        this._footerRightDom = null;

        // center
        this._leftDom = null;
        this._tableDom = null;
        this._rightDom = null;

        // header
        this._headerLeftDom = null;
        this._headerDom = null;
        this._headerRightDom = null;

        // footer (summary)
        this._footerLeftContainerDom = null;
        this._footerContainerDom = null;
        this._footerRightContainerDom = null;

        // center (grid)
        this._leftContainerDom = null;
        this._tableContainerDom = null;
        this._rightContainerDom = null;

        // header / filter
        this._headerLeftContainerDom = null;
        this._headerContainerDom = null;
        this._headerRightContainerDom = null;

        this._topDom = null;
        this._middleDom = null;
        this._bottomDom = null;

        this._rpc = null;
        this._rpcLoadArgs = null;
        this._rpcSaveArgs = null;

        // Basisklasse entladen
        super.destruct(true);
    }

};
