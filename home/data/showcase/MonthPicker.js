/* global kijs */

home.sc.MonthPicker = class home_sc_MonthPicker {
    
    
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
            caption: '<a href="api:kijs.gui.MonthPicker">kijs.gui.MonthPicker</a>',
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
                    xtype: 'kijs.gui.MonthPicker'
                },
                
                {
                    xtype: 'kijs.gui.field.Display',
                    cls: 'kijs-titleLarge',
                    value: 'mit minValue und maxValue:',
                    style: { margin: '10px 0 0 0'}
                },{
                    xtype: 'kijs.gui.MonthPicker',
                    minValue: kijs.Date.addDays(new Date(), -62),
                    maxValue: kijs.Date.addDays(new Date(), 62),
                    value: new Date(),
                    headerBarHide: false,
                    currentBtnHide: false,
                    closeBtnHide: true,
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
                    xtype: 'kijs.gui.MonthPicker',
                    value: new Date(),
                    headerBarHide: true,
                    currentBtnHide: true
                },
                
                {
                    xtype: 'kijs.gui.field.Display',
                    cls: 'kijs-titleLarge',
                    valueDisplayType: 'html',
                    value: '<b>Siehe auch:</b><ul>'
                         + '<li><a href="DatePicker.js">kijs.gui.DatePicker</a></li>'
                         + '<li><a href="TimePicker.js">kijs.gui.TimePicker</a></li>'
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