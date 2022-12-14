/* global kijs */

window.sc = {};
sc.Field_DateTime = class sc_Field_DateTime {
    
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
            caption: 'kijs.gui.field.DateTime',
            autoScroll: true,
            style: {
                flex: 1
            },
            innerStyle: {
                padding: '10px'
            },
            
            headerInnerStyle:{
                padding: '10px'
            },
            
            headerElements:[
                {
                    xtype: 'kijs.gui.field.Switch',
                    caption: 'disabled',
                    on: {
                        change: function(e) {
                            this._updateProperty('disabled', e.element.value);
                        },
                        context: this
                    }
                },{
                    xtype: 'kijs.gui.field.Switch',
                    caption: 'disableFlex',
                    value: 1,
                    on: {
                        change: function(e) {
                            this._updateProperty('disableFlex', e.element.value);
                        },
                        context: this
                    }
                },{
                    xtype: 'kijs.gui.field.Switch',
                    caption: 'labelHide',
                    on: {
                        change: function(e) {
                            this._updateProperty('labelHide', e.element.value);
                        },
                        context: this
                    }
                },{
                    xtype: 'kijs.gui.field.Switch',
                    caption: 'labelWidth = 120',
                    on: {
                        change: function(e) {
                            this._updateProperty('labelWidth', e.element.value ? 120 : null);
                        },
                        context: this
                    }
                },{
                    xtype: 'kijs.gui.field.Switch',
                    caption: 'readOnly',
                    on: {
                        change: function(e) {
                            this._updateProperty('readOnly', e.element.value);
                        },
                        context: this
                    }
                },{
                    xtype: 'kijs.gui.field.Switch',
                    caption: 'required',
                    on: {
                        change: function(e) {
                            this._updateProperty('required', e.element.value);
                            this._callFunction('validate');
                        },
                        context: this
                    }
                },{
                    xtype: 'kijs.gui.field.Switch',
                    caption: 'showHelp',
                    on: {
                        change: function(e) {
                            let value = '';
                            if (e.element.value) {
                                value = 'Dies ist ein Hilfetext';
                            }
                            this._updateProperty('helpText', value);
                        },
                        context: this
                    }
                },{
                    xtype: 'kijs.gui.Button',
                    caption: 'Validate',
                    on: {
                        click: function(e) {
                            this._callFunction('validate');
                        },
                        context: this
                    }
                },{
                    xtype: 'kijs.gui.Button',
                    caption: 'Buttons hinzufügen',
                    on: {
                        click: function(e) {
                            kijs.Array.each(this._content.elements, function(el) {
                                if (el instanceof kijs.gui.field.Field) {
                                    el.add(new kijs.gui.Button({
                                        caption: 'value anzeigen',
                                        iconMap: 'kijs.iconMap.Fa.wand-magic-sparkles',
                                        on: {
                                            click: function(e) {
                                                kijs.gui.CornerTipContainer.show('value', '<pre style="border:1px solid #000">'+el.value+'</pre>');
                                            },
                                            context: this
                                        }
                                    }));
                                }
                            }, this);
                        },
                        context: this
                    }
                }
            ],
            
            elements:[
                {
                    xtype: 'kijs.gui.Element',
                    html: 'Minimalkonfiguration:',
                    style: { margin: '0 0 4px 0'}
                },{
                    xtype: 'kijs.gui.field.DateTime'
                },
                
                {
                    xtype: 'kijs.gui.Element',
                    html: 'mode: \'date\'',
                    style: { margin: '10px 0 4px 0'}
                },{
                    xtype: 'kijs.gui.field.DateTime',
                    label: 'Datum',
                    mode: 'date',
                    date: new Date(),
                    minValue: kijs.Date.addDays(new Date(), -15),
                    maxValue: kijs.Date.addDays(new Date(), 15),
                    on: {
                        focus:  console.log,
                     
                        keyDown:  console.log,
                        enterPress:  console.log,
                        enterEscPress:  console.log,
                        escPress:  console.log,
                        spacePress:  console.log,
                        
                        blur:  console.log,
                        input:  console.log,

                        context: this
                    }
                },
                
                {
                    xtype: 'kijs.gui.Element',
                    html: 'mode: \'dateTime\'',
                    style: { margin: '10px 0 4px 0'}
                },{
                    xtype: 'kijs.gui.field.DateTime',
                    label: 'Datum & Zeit & Sec',
                    mode: 'dateTime',
                    minutesHide: false,
                    secondsHide: false,
                    timeRequired: true,
                    date: new Date(),
                    minValue: kijs.Date.addDays(new Date(), -15),
                    maxValue: kijs.Date.addDays(new Date(), 15)
                },{
                    xtype: 'kijs.gui.field.DateTime',
                    label: 'Datum & Zeit',
                    mode: 'dateTime',
                    minutesHide: false,
                    secondsHide: true,
                    timeRequired: false
                },{
                    xtype: 'kijs.gui.field.DateTime',
                    label: 'Datum & Stunden',
                    mode: 'dateTime',
                    minutesHide: true,
                    secondsHide: true,
                    timeRequired: false,
                    date: new Date()
                },
                
                {
                    xtype: 'kijs.gui.Element',
                    html: 'mode: \'time\'',
                    style: { margin: '10px 0 4px 0'}
                },{
                    xtype: 'kijs.gui.field.DateTime',
                    label: 'Uhrzeit',
                    mode: 'time',
                    value: '13'
                },
                
                {
                    xtype: 'kijs.gui.Element',
                    html: 'mode: \'week\'',
                    style: { margin: '10px 0 4px 0'}
                },{
                    xtype: 'kijs.gui.field.DateTime',
                    label: 'Woche',
                    mode: 'week'
                },
                
                {
                    xtype: 'kijs.gui.Element',
                    html: 'mode: \'range\'',
                    style: { margin: '10px 0 4px 0'}
                },{
                    xtype: 'kijs.gui.field.DateTime',
                    name: 'rangeStart',
                    nameEnd: 'rangeEnd',
                    label: 'von/bis',
                    mode: 'range'
                },
                
                {
                    xtype: 'kijs.gui.Element',
                    html: '<b>Siehe auch:</b><br>kijs.gui.DatePicker<br>kijs.gui.MonthPicker<br>kijs.gui.TimePicker<br>kijs.gui.field.Month',
                    style: { margin: '10px 0 4px 0'}
                }
            ]
        });
        
        return this._content;
    }
    
    run() {

    }
    
    
    // PROTECTED
    _callFunction(fnName) {
        kijs.Array.each(this._content.elements, function(el) {
            if (el instanceof kijs.gui.field.Field) {
                el[fnName]();
            }
        }, this);
    }
    
    _updateProperty(propertyName, value) {
        kijs.Array.each(this._content.elements, function(el) {
            if (el instanceof kijs.gui.field.Field) {
                el[propertyName] = value;
            }
        }, this);
    }
    
    
    
    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct() {
        this._content = null;
    }
};