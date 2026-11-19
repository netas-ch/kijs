/* global kijs */

home.sc.TimePicker = class home_sc_TimePicker {
    
    
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
            headerBarElements: [ this._app.createApiButton('kijs.gui.TimePicker') ],
            cls: ['kijs-borderless', 'kijs-flexform'],
            scrollableY: 'auto',
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
                    cls: 'kijs-titleLarge',
                    value: 'Minimalkonfiguration:'
                },{
                    xtype: 'kijs.gui.TimePicker'
                },
                
                {
                    xtype: 'kijs.gui.field.Display',
                    cls: 'kijs-titleLarge',
                    value: 'mit minValue und maxValue:',
                    style: { margin: '10px 0 0 0'}
                },{
                    xtype: 'kijs.gui.TimePicker',
                    value: kijs.Date.getSqlTime(new Date()),
                    headerBarHide: false,
                    emptyBtnHide: false,
                    nowBtnHide: false,
                    on: {
                        change: console.log,
                        context: this
                    }
                },
                
                {
                    xtype: 'kijs.gui.field.Display',
                    cls: 'kijs-titleLarge',
                    value: 'ohne headerBar:',
                    style: { margin: '10px 0 0 0'}
                },{
                    xtype: 'kijs.gui.TimePicker',
                    value: kijs.Date.getSqlTime(new Date()),
                    headerBarHide: true,
                    emptyBtnHide: true,
                    nowBtnHide: true
                },
                
                {
                    xtype: 'kijs.gui.field.Display',
                    cls: 'kijs-titleLarge',
                    valueDisplayType: 'html',
                    value: '<b>Siehe auch:</b><ul>'
                         + '<li><a href="DatePicker.js">kijs.gui.DatePicker</a></li>'
                         + '<li><a href="MonthPicker.js">kijs.gui.MonthPicker</a></li>'
                         + '<li><a href="field/field_DateTime.js">kijs.gui.field.DateTime</a></li>'
                         + '<li><a href="field/field_Month.js">kijs.gui.field.Month</a></li>'
                         + '</ul>',
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