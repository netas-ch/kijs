/* global kijs */

window.sc = {};
sc.TimePicker = class sc_TimePicker {
    
    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        this._app = config.app;
        this._content = null;
    }
    
    
    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    getContent() {
        this._content = new kijs.gui.Panel({
            caption: 'kijs.gui.TimePicker',
            autoScroll: true,
            style: {
                flex: 1
            },
            innerStyle: {
                padding: '10px'
            },
            elements:[
                {
                    xtype: 'kijs.gui.Element',
                    html: 'Minimalkonfiguration:',
                    style: { margin: '0 0 4px 0'}
                },{
                    xtype: 'kijs.gui.TimePicker'
                },
                
                {
                    xtype: 'kijs.gui.Element',
                    html: 'mit minValue und maxValue:',
                    style: { margin: '10px 0 4px 0'}
                },{
                    xtype: 'kijs.gui.TimePicker',
                    value: kijs.Date.getSqlTime(new Date()),
                    headerBarHide: false,
                    emptyBtnHide: false,
                    nowBtnHide: false,
                    on: {
                        change: function(e) {
                            console.log('change: ' + e.element.value);
                        },
                        context: this
                    }
                },
                
                {
                    xtype: 'kijs.gui.Element',
                    html: 'ohne headerBar:',
                    style: { margin: '10px 0 4px 0'}
                },{
                    xtype: 'kijs.gui.TimePicker',
                    value: kijs.Date.getSqlTime(new Date()),
                    headerBarHide: true,
                    emptyBtnHide: true,
                    nowBtnHide: true
                },
                
                {
                    xtype: 'kijs.gui.Element',
                    html: '<b>Siehe auch:</b><br>kijs.gui.DatePicker<br>kijs.gui.MonthPicker<br>kijs.gui.field.DateTime<br>kijs.gui.field.Month',
                    style: { margin: '10px 0 4px 0'}
                }
            ]
        });
        
        return this._content;
    }
    
    run() {

    }


    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct() {
        this._content = null;
    }
};