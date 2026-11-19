/* global kijs */

home.sc.grid_Grid = class home_sc_grid_Grid {
    #cancelSelectionChange = false;
    #logEntries = [];

    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        this._app = config.app;
        this._content = null;
    }

    // TODO: Beispiel mit Autoload in einem eigenen Tab



    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get grid() { return this._content ? this._content.down('grid') : null; }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    getContent() {
        this._content = new kijs.gui.Panel({
            caption: 'kijs.gui.grid.Grid',
            headerBarElements: [ this._app.createApiButton('kijs.gui.grid.Grid') ],
            cls: ['kijs-borderless', 'kijs-flexrow'],
            style: {
                flex: 1
            },
            headerElements: this._getHeaderElements(),
            elements:[
                {
                    xtype: 'kijs.gui.grid.Grid',
                    name: 'grid',
                    rpcLoadFn: 'grid.load',
                    filterable: true,
                    filterVisible: true,
                    autoLoad: true,
                    style: {
                        flex: 1
                    },
                    on: {
                        afterLoad: (e) => {
                            this._log('afterLoad', e.response.rows.length + ' Zeilen geladen, Total ' + e.response.count);
                        },
                        beforeSelectionChange: (e) => {
                            if (this.#cancelSelectionChange) {
                                e.cancel = true;
                                this._log('beforeSelectionChange', 'abgebrochen');
                            }
                        },
                        change: (e) => {
                            this._log('change', this._rowText(e.row) + ', ' + e.cell.columnConfig.caption
                                    + ': ' + kijs.toString(e.value));
                        },
                        columnChange: (e) => {
                            let props = Object.keys(e).filter(k => k !== 'columnConfig');
                            this._log('columnChange', e.columnConfig.caption + ': '
                                    + props.map(k => k + '=' + kijs.toString(e[k])).join(', '));
                        },
                        rowClick: (e) => {
                            // e.element ist das Grid, die Zeile steht in e.raiseElement
                            this._log('rowClick', this._rowText(e.raiseElement));
                        },
                        rowDblClick: (e) => {
                            // e.element ist das Grid, die Zeile steht in e.raiseElement
                            this._log('rowDblClick', this._rowText(e.raiseElement));
                        },
                        selectionChange: (e) => {
                            this._log('selectionChange', (e.unSelect ? 'abgewählt: ' : 'ausgewählt: ')
                                    + e.rows.map(row => this._rowText(row)).join(', '));
                        },
                        context: this
                    }
                },{
                    xtype: 'kijs.gui.Splitter',
                    targetPos: 'right'
                },{
                    xtype: 'kijs.gui.Panel',
                    caption: 'Ereignisse',
                    collapsible: 'right',
                    scrollableY: 'auto',
                    width: 300,
                    headerBarElements: [
                        {
                            xtype: 'kijs.gui.Button',
                            iconMap: 'kijs.iconMap.Fa.trash-can',
                            tooltip: 'Leeren',
                            on: {
                                click: function() {
                                    this.#logEntries = [];
                                    this._content.down('eventLog').html = '';
                                },
                                context: this
                            }
                        }
                    ],
                    innerStyle: {
                        padding: '6px 10px'
                    },
                    elements: [
                        {
                            xtype: 'kijs.gui.Element',
                            name: 'eventLog',
                            cls: 'home-sc-grid-eventlog'
                        }
                    ]
                }
            ]
        });

        return this._content;
    }

    run() {

    }


    // PROTECTED
    _getHeaderElements() {
        return [
            {
                xtype: 'kijs.gui.field.Switch',
                label: 'disabled',
                on: {
                    change: function(e) {
                        this.grid.disabled = !!e.element.value;
                    },
                    context: this
                }
            },{
                xtype: 'kijs.gui.field.Switch',
                label: 'filterVisible',
                value: true,
                on: {
                    change: function(e) {
                        this.grid.filterVisible = !!e.element.value;
                    },
                    context: this
                }
            },{
                xtype: 'kijs.gui.field.Switch',
                label: 'cancel beforeSelectionChange',
                on: {
                    change: (e) => {
                        this.#cancelSelectionChange = !!e.element.value;
                    },
                    context: this
                }
            },{
                xtype: 'kijs.gui.field.Combo',
                label: 'selectType:',
                value: 'single',
                inputWidth: 100,
                data: [
                    { displayText: 'none', value: 'none' },
                    { displayText: 'single', value: 'single' },
                    { displayText: 'multi', value: 'multi' },
                    { displayText: 'simple-multi', value: 'simple-multi' }
                ],
                on: {
                    change: function(e) {
                        this.grid.selectType = e.element.value;
                    },
                    context: this
                }
            },{
                xtype: 'kijs.gui.Button',
                caption: 'Methoden',
                iconMap: 'kijs.iconMap.Fa.list',
                menuElements: this._getMethodMenuElements()
            }
        ];
    }

    /**
     * Menü-Einträge zum Ausprobieren der Methoden
     * @returns {Array}
     */
    _getMethodMenuElements() {
        return [
            {
                xtype: 'kijs.gui.Button',
                caption: 'getSelected()',
                on: {
                    click: function() {
                        let sel = this.grid.getSelected();
                        sel = kijs.isArray(sel) ? sel : (sel ? [sel] : []);
                        this._log('getSelected()', sel.length ? sel.map(row => this._rowText(row)).join(', ') : 'keine');
                    },
                    context: this
                }
            },{
                xtype: 'kijs.gui.Button',
                caption: 'getSelectedIds()',
                on: {
                    click: function() {
                        this._log('getSelectedIds()', JSON.stringify(this.grid.getSelectedIds()));
                    },
                    context: this
                }
            },{
                xtype: 'kijs.gui.Button',
                caption: 'selectByIds([2, 4, 6])',
                on: {
                    click: function() {
                        this._log('selectByIds()', this.grid.selectByIds([2, 4, 6]) ? 'erfolgreich' : 'nicht gefunden');
                    },
                    context: this
                }
            },{
                xtype: 'kijs.gui.Button',
                caption: 'clearSelections()',
                on: {
                    click: function() {
                        this.grid.clearSelections();
                    },
                    context: this
                }
            },
            '-',
            {
                xtype: 'kijs.gui.Button',
                caption: 'getDirtyRows()',
                on: {
                    click: function() {
                        const rows = this.grid.getDirtyRows();
                        this._log('getDirtyRows()', rows.length ? rows.map(row => this._rowText(row)).join(', ') : 'keine');
                    },
                    context: this
                }
            },{
                xtype: 'kijs.gui.Button',
                caption: 'commit()',
                on: {
                    click: function() {
                        this.grid.commit();
                        this._log('commit()', 'Änderungen übernommen');
                    },
                    context: this
                }
            },{
                xtype: 'kijs.gui.Button',
                caption: 'startCellEdit(0)',
                on: {
                    click: function() {
                        const cell = this.grid.startCellEdit(0);
                        this._log('startCellEdit(0)', cell ? cell.columnConfig.caption : 'keine Zelle');
                    },
                    context: this
                }
            },
            '-',
            {
                xtype: 'kijs.gui.Button',
                caption: 'reload()',
                on: {
                    click: function() {
                        this.grid.reload();
                    },
                    context: this
                }
            },{
                xtype: 'kijs.gui.Button',
                caption: 'sort(\'number\', \'DESC\')',
                on: {
                    click: function() {
                        this.grid.sort('number', 'DESC');
                    },
                    context: this
                }
            },{
                xtype: 'kijs.gui.Button',
                caption: 'scrollTo(0, 0)',
                on: {
                    click: function() {
                        this.grid.scrollTo(0, 0);
                    },
                    context: this
                }
            }
        ];
    }

    /**
     * Schreibt einen Eintrag ins Ereignis-Protokoll (neuste zuoberst)
     * @param {String} name
     * @param {String} [text='']
     * @returns {undefined}
     */
    _log(name, text='') {
        const time = new Date().toLocaleTimeString();
        this.#logEntries.unshift('<div><span class="home-sc-grid-eventlog-time">' + time + '</span> <b>'
                + kijs.String.htmlspecialchars(name) + '</b> ' + kijs.String.htmlspecialchars(text) + '</div>');
        this.#logEntries.length = Math.min(this.#logEntries.length, 100);

        const logEl = this._content ? this._content.down('eventLog') : null;
        if (logEl) {
            logEl.html = this.#logEntries.join('');
        }
    }

    /**
     * Kurzbeschreibung einer Zeile für das Protokoll
     * @param {kijs.gui.grid.Row} row
     * @returns {String}
     */
    _rowText(row) {
        return row && row.dataRow ? '#' + row.dataRow.number + ' ' + row.dataRow.vorname : '?';
    }



    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct() {
        this._content = null;
    }

};
