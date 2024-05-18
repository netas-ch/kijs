/* global kijs */

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
            cls: ['kijs-borderless', 'kijs-flexform'],
            style: {
                flex: 1
            },
            innerStyle: {
                padding: '10px'
            },
            headerElements: this._getHeaderElements(),
            elements:[
                {
                    xtype: 'kijs.gui.field.Display',
                    cls: 'kijs-largeTitle',
                    value: 'Minimalkonfiguration:'
                },{
                    xtype: 'kijs.gui.DatePicker'
                },
                
                {
                    xtype: 'kijs.gui.field.Display',
                    cls: 'kijs-largeTitle',
                    value: 'mode:  \'date\' mit minValue und maxValue:',
                    style: { margin: '10px 0 0 0'}
                },{
                    xtype: 'kijs.gui.DatePicker',
                    mode: 'date',
                    minValue: kijs.Date.addDays(new Date(), -15),
                    maxValue: kijs.Date.addDays(new Date(), 15),
                    on: {
                        change: console.log,
                        context: this
                    }
                },
                
                {
                    xtype: 'kijs.gui.field.Display',
                    cls: 'kijs-largeTitle',
                    value: 'mode:  \'week\':',
                    style: { margin: '10px 0 0 0'}
                },{
                    xtype: 'kijs.gui.DatePicker',
                    mode: 'week',
                    on: {
                        change: console.log,
                        context: this
                    }
                },
                
                {
                    xtype: 'kijs.gui.field.Display',
                    cls: 'kijs-largeTitle',
                    value: 'mode:  \'range\':',
                    style: { margin: '10px 0 0 0'}
                },{
                    xtype: 'kijs.gui.DatePicker',
                    mode: 'range',
                    on: {
                        change: console.log,
                        context: this
                    }
                },
                
                {
                    xtype: 'kijs.gui.field.Display',
                    cls: 'kijs-largeTitle',
                    value: 'weekNumbersHide: true:',
                    style: { margin: '10px 0 0 0'}
                },{
                    xtype: 'kijs.gui.DatePicker',
                    weekNumbersHide: true
                },
                
                {
                    xtype: 'kijs.gui.field.Display',
                    cls: 'kijs-largeTitle',
                    value: '<b>Siehe auch:</b><br>kijs.gui.TimePicker<br>kijs.gui.MonthPicker<br>kijs.gui.field.DateTime<br>kijs.gui.field.Month',
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