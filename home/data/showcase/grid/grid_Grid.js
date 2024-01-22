/* global kijs */

home.sc.grid_Grid = class home_sc_grid_Grid {
    #cancelSelectionChange = false;

    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        this._app = config.app;
        this._content = null;
    }

    // TODO: Beispiel mit Autoload in einem eigenen Tab



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    getContent() {
        this._content = new kijs.gui.Panel({
            caption: 'kijs.gui.grid.Grid',
            cls: ['kijs-borderless', 'kijs-flexfit'],
            //scrollableY: 'auto',
            style: {
                flex: 1
            },
            headerElements: this._getHeaderElements(),
            elements:[
                {
                    xtype: 'kijs.gui.grid.Grid',
                    //rpc: 'default',
                    rpcLoadFn: 'grid.load',
                    filterable: true,
                    filterVisible: true,

                    /*columnConfigs: (function(){
                        let cols = [ {caption:'Vorname', valueField:'vorname'} ];
                        for (let i=0; i<26; i++) {
                            cols.push({
                               caption:'Spalte ' + ('ABCDEFGHIJKLMNOPQRSTUVWXYZ').substr(i,1),
                               valueField:'field_' + ('ABCDEFGHIJKLMNOPQRSTUVWXYZ').substr(i,1).toLowerCase()
                            });
                        }
                        return cols;
                    })(),

                    primaryKeys:'field_a',

                    data:(function(){
                        let rows = [];
                        for (let i=0; i<200; i++) {
                            let row = {};
                            for (let y=0; y<26; y++) {
                                row['field_' + ('ABCDEFGHIJKLMNOPQRSTUVWXYZ').substr(y,1).toLowerCase()] =
                                        ('ABCDEFGHIJKLMNOPQRSTUVWXYZ').substr(y,1) + (i+1);
                            }
                            rows.push(row);
                        }
                        return rows;
                    })(),*/

                    on: {
                        rowClick: (e) => { console.log(e); },
                        rowDblClick: (e) => { console.log(e); },
                        change: (e) => { console.log('change!');console.log(e); },
                        beforeSelectionChange: (e) => {
                            if (this.#cancelSelectionChange) {
                                e.cancel = true;
                            }
                        },
                        context: this
                    }
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
                        this._content.innerDisabled = !!e.element.value;
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
                inputWidth: 60, // 'single', 'multi', 'simple', 'none'
                data: [
                    { caption: 'single', value: 'single' },
                    { caption: 'multi', value: 'multi' },
                    { caption: 'simple', value: 'simple' },
                    { caption: 'none', value: 'none' }
                ],
                on: {
                    change: function(e) {
                        this._content.downX('kijs.gui.grid.Grid').selectType = e.element.value;
                    },
                    context: this
                }
            }
        ];
    }



    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct() {
        this._content = null;
    }

};