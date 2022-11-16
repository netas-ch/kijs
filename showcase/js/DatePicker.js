/* global kijs */

window.sc = {};
sc.DatePicker = class sc_DatePicker {
    
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
                    xtype: 'kijs.gui.DatePicker'
                },
                
                {
                    xtype: 'kijs.gui.Element',
                    html: 'mode:  \'date\' mit minValue und maxValue:',
                    style: { margin: '10px 0 4px 0'}
                },{
                    xtype: 'kijs.gui.DatePicker',
                    mode: 'date',
                    minValue: kijs.Date.addDays(new Date(), -15),
                    maxValue: kijs.Date.addDays(new Date(), 15)
                },
                
                {
                    xtype: 'kijs.gui.Element',
                    html: 'mode:  \'week\':',
                    style: { margin: '10px 0 4px 0'}
                },{
                    xtype: 'kijs.gui.DatePicker',
                    mode: 'week'
                },
                
                {
                    xtype: 'kijs.gui.Element',
                    html: 'mode:  \'range\':',
                    style: { margin: '10px 0 4px 0'}
                },{
                    xtype: 'kijs.gui.DatePicker',
                    mode: 'range'
                },
                
                {
                    xtype: 'kijs.gui.Element',
                    html: '<b>Siehe auch:</b><br>kijs.gui.TimePicker<br>kijs.gui.MonthPicker<br>kijs.gui.field.DateTime<br>kijs.gui.field.Month',
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