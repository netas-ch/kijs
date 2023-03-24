/* global kijs */

window.home.sc = {};
home.sc.DatePicker = class home_sc_DatePicker {
    
    
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
            caption: 'kijs.gui.DatePicker',
            scrollableY: 'auto',
            cls: 'kijs-flexform',
            style: {
                flex: 1
            },
            innerStyle: {
                padding: '10px'
            },
            headerElements: this._getHeaderElements(),
            elements:[
                {
                    xtype: 'kijs.gui.Element',
                    html: 'Minimalkonfiguration:'
                },{
                    xtype: 'kijs.gui.DatePicker'
                },
                
                {
                    xtype: 'kijs.gui.Element',
                    html: 'mode:  \'date\' mit minValue und maxValue:',
                    style: { margin: '10px 0 0 0'}
                },{
                    xtype: 'kijs.gui.DatePicker',
                    mode: 'date',
                    minValue: kijs.Date.addDays(new Date(), -15),
                    maxValue: kijs.Date.addDays(new Date(), 15)
                },
                
                {
                    xtype: 'kijs.gui.Element',
                    html: 'mode:  \'week\':',
                    style: { margin: '10px 0 0 0'}
                },{
                    xtype: 'kijs.gui.DatePicker',
                    mode: 'week'
                },
                
                {
                    xtype: 'kijs.gui.Element',
                    html: 'mode:  \'range\':',
                    style: { margin: '10px 0 0 0'}
                },{
                    xtype: 'kijs.gui.DatePicker',
                    mode: 'range'
                },
                
                {
                    xtype: 'kijs.gui.Element',
                    html: 'weekNumbersHide: true:',
                    style: { margin: '10px 0 0 0'}
                },{
                    xtype: 'kijs.gui.DatePicker',
                    weekNumbersHide: true
                },
                
                {
                    xtype: 'kijs.gui.Element',
                    html: '<b>Siehe auch:</b><br>kijs.gui.TimePicker<br>kijs.gui.MonthPicker<br>kijs.gui.field.DateTime<br>kijs.gui.field.Month',
                    style: { margin: '10px 0 0 0'}
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