/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.grid.Grid
// --------------------------------------------------------------
/**
 * EVENTS
 * ----------
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

        this._remoteDataLoaded = 0;   // Anzahl geladene Datensätze
        this._remoteDataLimit = 25;   // Anzahl Datensätze, die geladen werden
        this._remoteDataStep = 50;    // Anzahl Datensätze, die pro request hinzugefügt werden.
        this._remoteDataTotal = null; // Anzahl verfügbare Datensätze
        this._isLoading = false;      // wird zurzeit geladen?

        this._lastSelectedRow = null; // letzte Zeile, die selektiert wurde
        this._currentRow = null;      // Zeile, welche zurzeit fokusiert ist
        this._selectType = 'single';  // multiselect
        this._focusable = true;       // ob das grid focusiert weden kann

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

        // header
        this._header = new kijs.gui.grid.Header({
            parent: this
        });

        // Standard-config-Eigenschaften mergen
        config = Object.assign({}, {
            // keine
        }, config);

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            rpc: true,
            facadeFnLoad: true,
            facadeFnSave: true,
            facadeFnArgs: true,

            columnConfigs:  { fn: 'function', target: this.columnConfigAdd, context: this },
            primaryKeys:    { target: 'primaryKeys' },
            data:           { target: 'data' },

            focusable: true,
            selectType: true            // 'none': Es kann nichts selektiert werden
                                        // 'single' (default): Es kann nur ein Datensatz selektiert werden
                                        // 'multi': Mit den Shift- und Ctrl-Tasten können mehrere Datensätze selektiert werden.
                                        // 'simple': Es können mehrere Datensätze selektiert werden. Shift- und Ctrl-Tasten müssen dazu nicht gedrückt werden.

        });

        // Config anwenden
        if (kijs.isObject(config)) {
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
     * Setzt das aktuelle Zeile, dass den Fokus erhalten wird.
     * Null = automatische Ermittlung
     * Um den Fokus zu setzen verwenden sie stattdessen die Funktion .focus() vom Zeile.
     * @param {kijs.gui.grid.Row|Null} cRow
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
               throw new Error('invalid primary key');
           }
        }, this);
        this._primaryKeys = val;
    }
    get primaryKeys() { return this._primaryKeys; }

    get rows() { return this._rows; }

    get selectType() { return this._selectType; }
    set selectType(val) { this._selectType = val; }

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
     * Gibt die selektieten Zeilen zurück
     * Bei selectType='single' wird das Row direkt zurückgegeben sonst ein Array mit den Zeilenn
     * @returns {Array|kijs.gui.DataViewRow|Null}
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
            return ret.length ? ret[0] : null ;

        } else {
            return ret;
        }
    }

    rowsAdd(rows) {
        if (!kijs.isArray(rows)) {
            rows = [rows];
        }

        let renderStartOffset = this._rows.length;

        kijs.Array.each(rows, function(row) {
            // instanz einer row gegeben. Direkt einfügen
            if (row instanceof kijs.gui.grid.Row) {
                row.parent = this;
                this._rows.push(row);

            } else {
                // row per primary key suchen
                let pRow = this._getRowByPrimaryKey(row);

                if (pRow) {
                    // bestehende row updaten
                    pRow.updateDataRow(row);

                } else {

                    // neue row hinzufügen
                    this._rows.push(new kijs.gui.grid.Row({
                        parent: this,
                        dataRow: row,
                        on: {
                            click: this._onRowClick,
                            context: this
                        }
                    }));
                }
            }
        }, this);

        if (this.isRendered && this._rows.length > renderStartOffset) {
            this._renderRows(renderStartOffset);
        }
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

        if (this.isRendered) {
            this.render();
        }
    }

    rowsRemoveAll() {
        this.rowsRemove(this._rows);
    }

    /**
     * Selektiert eine oder mehrere Zeilen
     * @param {kijs.gui.grid.Row|Array} rows oder Array mit Zeilen, die selektiert werden sollen
     * @param {Boolean} [keepExisting=false]            Soll die bestehende selektion belassen werden?
     * @param {Boolean} [preventSelectionChange=false]  Soll das SelectionChange-Event verhindert werden?
     * @returns {undefined}
     */
    select(rows, keepExisting, preventSelectionChange) {
        if (kijs.isEmpty(rows)) {
            rows = [];
        }

        if (!kijs.isArray(rows)) {
            rows = [rows];
        }

        if (!keepExisting){
            this.clearSelections(true);
        }

        kijs.Array.each(rows, function(row) {
            row.selected = true;
        }, this);

        // SelectionChange auslösen
        if (!preventSelectionChange) {
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
                            throw new Error(`Unkown filter format.`);
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
                throw new Error('invalid xtype ' + defaultXType);
            }
            delete configOrInstance.xtype;
            inst = new constructor(configOrInstance);


        } else if (kijs.isObject(configOrInstance)) {
            inst = configOrInstance;
        }

        if (requiredClass !== null) {
            if (!kijs.isObject(inst) || !(inst instanceof requiredClass)) {
                throw new Error('instance not from class ' + requiredClass.name);
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
        if (this._facadeFnLoad && this._rpc && !this._isLoading && (this._remoteDataLoaded < this._remoteDataLimit || force)) {
            this._isLoading = true;

            let args = {};
            args.start = this._remoteDataLoaded;
            args.limit = this._remoteDataLimit - this._remoteDataLoaded;

            if (kijs.isObject(this._facadeFnArgs)) {
                args = Object.assign(args, this._facadeFnArgs);
            }

            // RPC ausführen
            this._rpc.do(this._facadeFnLoad, args, function(response) {
                if (kijs.isArray(response.rows)) {

                    // Datensätze hinzufügen
                    if (response.rows.length > 0) {
                        this.rowsAdd(response.rows);
                    }

                    // Firefox-Bug: Wenn das scrolltop nicht abgefragt wird,
                    // springt der browser manchmal nach oben
                    if (kijs.Navigator.isFirefox) {
                        let st = this._tableContainerDom.node.scrollTop;
                    }

                    // Anzahl DS zählen
                    this._remoteDataLoaded += response.rows.length;

                    // Falls mehr Datensätze zurückgegeben wurden als angefragt,
                    // limit erhöhen
                    if (this._remoteDataLoaded > this._remoteDataLimit) {
                        this._remoteDataLimit = this._remoteDataLoaded;
                    }
                }

                // Total Datensätze
                if (kijs.isInteger(response.count)) {
                    this._remoteDataTotal = response.count;
                }

                this.raiseEvent('afterLoad', response.rows);

                this._isLoading = false;

            }, this, true, 'none');
        }
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
                    rootMargin: '200px',
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
     * @param {type} [preventSelectionChange=false]     Soll das SelectionChange-Event verhindert werden?
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
     * @param {type} [preventSelectionChange=false]     Soll das SelectionChange-Event verhindert werden?
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

        // header
        this._header.renderTo(this._headerDom.node);

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


        // Variablen (Objekte/Arrays) leeren


        // Basisklasse entladen
        super.destruct(true);
    }
};