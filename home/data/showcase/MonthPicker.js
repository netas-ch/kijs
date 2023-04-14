/* global kijs */

window.home.sc = {};
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
            caption: 'kijs.gui.MonthPicker',
            cls: 'kijs-flexform',
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
                    xtype: 'kijs.gui.Element',
                    html: 'Minimalkonfiguration:'
                },{
                    xtype: 'kijs.gui.MonthPicker'
                },
                
                {
                    xtype: 'kijs.gui.Element',
                    html: 'mit minValue und maxValue:',
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
                    xtype: 'kijs.gui.Element',
                    html: 'ohne headerBar:',
                    style: { margin: '10px 0 0 0'}
                },{
                    xtype: 'kijs.gui.MonthPicker',
                    value: new Date(),
                    headerBarHide: true,
                    currentBtnHide: true
                },
                
                {
                    xtype: 'kijs.gui.Element',
                    html: '<b>Siehe auch:</b><br>kijs.gui.DatePicker<br>kijs.gui.TimePicker<br>kijs.gui.field.DateTime<br>kijs.gui.field.Month',
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