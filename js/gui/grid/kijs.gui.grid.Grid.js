/* global kijs, this */

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
    constructor(config={}) {
        super(false);

        this._rpc = null;
        this._rows = [];
        this._columnConfigs = [];
        this._primaryKeys = [];
        this._facadeFnLoad = null;
        this._facadeFnSave = null;
        this._facadeFnArgs = null;
        this._facadeFnBeforeMsgFn = null;
        this._waitMaskTarget = null;
        this._waitMaskTargetDomProperty = null;

        this._remoteDataLoaded = 0;   // Anzahl geladene Datensätze
        this._remoteDataLimit = 50;   // Anzahl Datensätze, die geladen werden
        this._remoteDataStep = 50;    // Anzahl Datensätze, die pro request hinzugefügt werden.
        this._remoteDataTotal = null; // Anzahl verfügbare Datensätze
        this._getRemoteMetaData = true;  // Metadaten laden?
        this._isLoading = false;      // wird zurzeit geladen?
        this._remoteSort = null;      // Remote-Sortierung

        this._lastSelectedRow = null; // letzte Zeile, die selektiert wurde
        this._currentRow = null;      // Zeile, welche zurzeit fokusiert ist
        this._selectType = 'single';  // multiselect: single|multi|simple|none
        this._focusable = true;       // ob das grid focusiert weden kann
        this._editable = false;       // editierbare zeilen?
        this._filterable = false;

        // Intersection Observer (endless grid loader)
        this._intersectionObserver = null;

        this._dom.clsAdd('kijs-grid');

        // dom - elemente erstellen

        // 3 Zeilen
        this._topDom = new kijs.gui.Dom({cls: 'kijs-top'});
        this._middleDom = new kijs.gui.Dom({cls: 'kijs-center'});
        this._bottomDom = new kijs.gui.Dom({cls: 'kijs-bottom'});

        this._tableContainerDom = new kijs.gui.Dom({cls: 'kijs-tablecontainer', on:{scroll: this._onTableScroll, context: this}});
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
            rpc                       : true,
            facadeFnLoad              : true,
            facadeFnSave              : true,
            facadeFnArgs              : true,
            facadeFnBeforeMsgFn       : true,
            waitMaskTarget            : true,
            waitMaskTargetDomProperty : true,

            columnConfigs:  { fn: 'function', target: this.columnConfigAdd, context: this },
            primaryKeys:    { target: 'primaryKeys' },
            data:           { target: 'data' },

            editable: true,
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
        this.on('keyDown', this._onKeyDown, this);
    }


    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------

    get columnConfigs() { return this._columnConfigs; }

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

    get editable() { return this._editable; }
    set editable(val) { this._editable = !!val; }

    get facadeFnArgs() { return this._facadeFnArgs; }
    set facadeFnArgs(val) { this._facadeFnArgs = val; }

    get firstRow() {
        if (this._rows.length > 0) {
            return this._rows[0];
        }
        return null;
    }

    get filter() { return this._filter; }

    get filterable() { return this._filterable; }
    set filterable(val) { this._filterable = !!val; }
    
    get filterVisible() { return this._filter.visible; }
    set filterVisible(val) { this._filter.visible = !!val; }

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

    get rows() { return this._rows; }

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
     * Gibt die selektieten Zeilen zurück
     * Bei selectType='single' wird das Row direkt zurückgegeben, sonst ein Array mit den Zeilen
     * @returns {Array|kijs.gui.DataViewRow|null}
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
            return ret.length ? ret[0] : [];

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

        if (!kijs.isArray(rows)) {
            rows = [rows];
        }

        // Falls keine Primarys vorhanden sind, werden die rows zurückgegeben.
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
     * Lädt alle Daten im Grid neu.
     * @param {boolean} restoreSelection
     * @returns {Promise}
     */
    reload(restoreSelection = true) {
        let selected = this.getSelectedIds();
        return this._remoteLoad(true).then((response) => {

            // selektion wiederherstellen
            if (selected && restoreSelection) {
                this.selectByIds(selected, false, true);
            }

            return response;
        });
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
                            click: this._onRowClick,
                            dblClick: this._onRowDblClick,
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
        while (this._rows.length > 0) {
            this.rowsRemove(this._rows[0]);
        }
    }

    /**
     * Selektiert eine oder mehrere Zeilen
     * @param {kijs.gui.grid.Row|Array} rows oder Array mit Zeilen, die selektiert werden sollen
     * @param {Boolean} [keepExisting=false]  Soll die bestehende selektion belassen werden?
     * @param {Boolean} [preventEvent=false]  Soll der SelectionChange-Event verhindert werden?
     * @returns {undefined}
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
            let beforeSelectionChangeArgs = {rows: rows, keepExisting: keepExisting, cancel: false};
            this.raiseEvent('beforeSelectionChange', beforeSelectionChangeArgs);

            // selectionChange verhindern?
            if (beforeSelectionChangeArgs.cancel === true) {
                return;
            }
        }

        if (!keepExisting){
            this.clearSelections(true);
        }

        kijs.Array.each(rows, function(row) {
            row.selected = true;
        }, this);

        // SelectionChange auslösen
        if (!preventEvent) {
            this.raiseEvent('selectionChange', { rows: rows, unSelect: false } );
        }
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
        this.select(selRows, keepExisting, preventSelectionChange);

        // Element mit Fokus neu ermitteln
        this._currentRow = null;
        this.current = null;
    }

    /**
     * Selektiert Datensätze Anhand der ID
     * @param {Array} ids Array vonIds [id1, id2] oder bei mehreren primaryKeys ein Objekt mit {pkName: pkValue, pk2Name: pk2Value}
     * @param {Boolean} [keepExisting=false]  Soll die bestehende selektion belassen werden?
     * @param {Boolean} [preventEvent=false]  Soll der SelectionChange-Event verhindert werden?
     * @returns {undefined}
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

        this.select(rows, keepExisting, preventEvent);
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
            let constructor = kijs.getObjectFromNamespace(configOrInstance.xtype);
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
                    if (data[primaryKey] !== row.dataRow[primaryKey]) {
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

    _remoteLoad(force=false) {
        return new Promise((resolve) => {
            if (this._facadeFnLoad && this._rpc && !this._isLoading && (this._remoteDataLoaded < this._remoteDataLimit || force)) {
                this._isLoading = true;

                let args = {};
                args.sort = this._remoteSort;
                args.getMetaData = this._getRemoteMetaData;
                args.filter = this._filter.getFilters();

                // alle Daten neu laden
                if (force) {
                    args.start = 0;
                    args.limit = this._remoteDataLimit;

                // Nächste Daten laden
                } else {
                    args.start = this._remoteDataLoaded;
                    args.limit = this._remoteDataLimit - this._remoteDataLoaded;

                    // Falls alle vorhandenen Daten geladen sind, brechen wir ab.
                    if (this._remoteDataTotal !== null && this._remoteDataLoaded >= this._remoteDataTotal) {
                        this._isLoading = false;
                        return;
                    }
                }

                if (kijs.isObject(this._facadeFnArgs)) {
                    args = Object.assign(args, this._facadeFnArgs);
                }

                // Lademaske wird angezeigt, wenn das erste mal geladen  wird, oder
                // wenn sämtliche Datensätze neu geladen werden.
                let showWaitMask = force || this._remoteDataLoaded === 0;

                // RPC ausführen
                this._rpc.do(this._facadeFnLoad, args, function(response) {
                        this._remoteProcess(response, args, force);

                        // Promise auflösen
                        resolve(response);

                    },
                    this,                                           // Context
                    true,                                           // Cancel running
                    showWaitMask ? this._waitMaskTarget : 'none',   // Wait Mask Target
                    this._waitMaskTargetDomProperty,                // Wait Mask Target Dom Property
                    false,                                          // Ignore Warnings
                    this._facadeFnBeforeMsgFn
                );
            }
        });
    }

    _remoteProcess(response, args, force) {

        // columns
        if (kijs.isArray(response.columns)) {
            kijs.Array.clear(this._columnConfigs);
            this.columnConfigAdd(response.columns);

            this._getRemoteMetaData = false;
        }

        // primary keys
        if (response.primaryKeys) {
            this.primaryKeys = response.primaryKeys;
        }

        // force?
        if (force) {
            this.rowsRemoveAll();
            this._remoteDataLoaded = 0;
        }

        // rows
        if (kijs.isArray(response.rows)) {
            let addedRowsCnt = 0;

            // Datensätze hinzufügen
            if (response.rows.length > 0) {
                addedRowsCnt = this.rowsAdd(response.rows, args.start);
            }

            // Anzahl DS zählen
            this._remoteDataLoaded += addedRowsCnt;

            // Falls mehr Datensätze zurückgegeben wurden als angefragt,
            // limit erhöhen
            if (this._remoteDataLoaded > this._remoteDataLimit) {
                this._remoteDataLimit = this._remoteDataLoaded;
            }
        }

        // Total Datensätze
        if (kijs.isInteger(response.count)) {
            this._remoteDataTotal = response.count;
        } else {
            if (response.rows && response.rows.length < args.limit) {
                this._remoteDataTotal = args.start + response.rows.length;
            }
        }

        this.raiseEvent('afterLoad', response);

        this._isLoading = false;
    }

    _renderRows(offset=0) {
        for (let i=offset; i<this._rows.length; i++) {
            this._rows[i].renderTo(this._tableDom.node);
        }

        this._setIntersectionObserver();
    }

    // PROTECTED
    /**
     * Selektiert eine Zeile und berücksichtigt dabei die selectType und die Tasten shift und ctrl
     * @param {kijs.gui.grid.Row} row
     * @param {boolean} shift   // Shift gedrückt?
     * @param {boolean} ctrl    // Ctrl gedrückt?
     * @returns {undefined}
     */
    _selectRow(row, shift, ctrl) {
        if (!row) {
            return;
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
                return;
        }


        if (shift && this._lastSelectedRow) {
            // bestehende Selektierung entfernen
            if (!ctrl) {
                this.clearSelections(true);
            }

            // selektieren
            this.selectBetween(this._lastSelectedRow, row);

        } else {

            // bestehende Selektierung entfernen
            if (!ctrl) {
                this.clearSelections(true);
            }

            if (row.selected) {
                this.unSelect(row);
                if (row === this._lastSelectedRow) {
                    this._lastSelectedRow = null;
                }
            } else {
                this.select(row, true);
                this._lastSelectedRow = row;
            }
        }
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
                this._intersectionObserver = new IntersectionObserver(this._onIntersect.bind(this), {
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

    /**
     * Deselektiert ein oder mehrere Zeilen
     * @param {kijs.gui.grid.Row|Array} rows Row oder Array mit Zeilen, die deselektiert werden sollen
     * @param {boolean} [preventSelectionChange=false]     Soll das SelectionChange-Event verhindert werden?
     * @returns {undefined}
     */
    unSelect(rows, preventSelectionChange) {
        if (!kijs.isArray(rows)) {
            rows = [rows];
        }

        kijs.Array.each(rows, function(row) {
            row.selected = false;
        }, this);

        if (!preventSelectionChange) {
            this.raiseEvent('selectionChange', { rows: rows, unSelect: true } );
        }
    }

    /**
     * Selektiert alle Zeilen zwischen row1 und row2
     * @param {kijs.gui.grid.Row} row1
     * @param {kijs.gui.grid.Row} row2
     * @param {boolean} [preventSelectionChange=false]     Soll das SelectionChange-Event verhindert werden?
     * @returns {undefined}
     */
    selectBetween(row1, row2, preventSelectionChange) {
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
            this.select(rows, true, preventSelectionChange);
        }
    }

    // EVENTS


    _onKeyDown(e) {
        let keyCode=e.nodeEvent.keyCode, ctrl=e.nodeEvent.ctrlKey, shift=e.nodeEvent.shiftKey;

        if (!this.disabled) {
            let targetRow = null;

            if (this._currentRow) {
                switch (keyCode) {
                    case kijs.keys.DOWN_ARROW: targetRow = this._currentRow.next; break;
                    case kijs.keys.UP_ARROW: targetRow = this._currentRow.previous; break;
                    case kijs.keys.SPACE: targetRow = this._currentRow; break;
                }
            }

            if (targetRow) {
                this.current = targetRow;
                if (this._focusable) {
                    targetRow.focus();
                }

                if (this.selectType !== 'simple' || shift || ctrl || keyCode === kijs.keys.SPACE) {
                    this._selectRow(this._currentRow, shift, ctrl);
                }

                e.nodeEvent.preventDefault();
            }
        }
    }

    _onRowClick(e) {
        let row = e.element, ctrl=e.nodeEvent.ctrlKey, shift=e.nodeEvent.shiftKey;

        if (!this.disabled) {
            this.current = row;
            if (this._focusable) {
                row.focus();
            }
            this._selectRow(this._currentRow, shift, ctrl);
        }

        // Event weiterreichen
        this.raiseEvent('rowClick', e);
    }

    _onRowDblClick(e) {
        // Event weiterreichen
        this.raiseEvent('rowDblClick', e);
    }

    _onTableScroll(e) {
        let scrollTop = e.dom.node.scrollTop;
        let scrollLeft = e.dom.node.scrollLeft;

        this._headerContainerDom.node.scrollLeft = scrollLeft;
        this._footerContainerDom.node.scrollLeft = scrollLeft;

        this._leftContainerDom.node.scrollTop = scrollTop;
        this._rightContainerDom.node.scrollTop = scrollTop;
    }

    /**
     * Wird ausgelöst, wenn die Scrollbar 200px von der letzten Zeile entfernt ist.
     * @param {IntersectionObserverEntrys} intersections
     * @returns {undefined}
     */
    _onIntersect(intersections) {
        if (intersections.length > 0) {
            kijs.Array.each(intersections, function(intersection) {
                if (intersection.isIntersecting) {
                    this._remoteDataLimit += this._remoteDataStep;
                    this._remoteLoad();
                }
            }, this);
        }
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
        this._remoteLoad();
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


    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
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

        // Basisklasse entladen
        super.destruct(true);
    }
};
