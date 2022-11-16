/* global kijs */

window.sc = {};
sc.MonthPicker = class sc_MonthPicker {
    
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
            caption: 'kijs.gui.MonthPicker',
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
                    xtype: 'kijs.gui.MonthPicker'
                },
                
                {
                    xtype: 'kijs.gui.Element',
                    html: 'mit minValue und maxValue:',
                    style: { margin: '10px 0 4px 0'}
                },{
                    xtype: 'kijs.gui.MonthPicker',
                    minValue: kijs.Date.addDays(new Date(), -62),
                    maxValue: kijs.Date.addDays(new Date(), 62),
                    value: new Date(),
                    headerBarHide: false,
                    currentBtnHide: false,
                    closeBtnHide: true,
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
                    xtype: 'kijs.gui.MonthPicker',
                    value: new Date(),
                    headerBarHide: true,
                    currentBtnHide: true
                },
                
                {
                    xtype: 'kijs.gui.Element',
                    html: '<b>Siehe auch:</b><br>kijs.gui.DatePicker<br>kijs.gui.TimePicker<br>kijs.gui.field.DateTime<br>kijs.gui.field.Month',
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