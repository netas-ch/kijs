/* global kijs */

window.home.sc = {};
home.sc.grid_Grid = class home_sc_grid_Grid {
    
    
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
            //scrollableY: 'auto',
            cls: 'kijs-flexcolumn',
            style: {
                flex: 1
            },
            headerElements: this._getHeaderElements(),
            elements:[
                {
                    xtype: 'kijs.gui.grid.Grid',
                    rpc: this._app.rpc,
                    facadeFnLoad: 'grid.load',
                    filterable: true,
                    filterVisible: true,
                    style: {
                        flex: 1
                    },
                    
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
                        rowClick: function(e){ console.log(e); },
                        rowDblClick: function(e){ console.log(e); },
                        change: function(e){ console.log('change!');console.log(e); },
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