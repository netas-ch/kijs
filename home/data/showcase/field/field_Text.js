/* global kijs */

window.home.sc = {};
home.sc.field_Text = class home_sc_field_Text {
    
    
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
            caption: 'kijs.gui.field.Text',
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
                    xtype: 'kijs.gui.field.Text'
                },
                
                {
                    xtype: 'kijs.gui.Element',
                    html: 'mit Label',
                    style: { margin: '10px 0 0 0'}
                },{
                    xtype: 'kijs.gui.field.Text',
                    label: 'Label',
                    on: {
                        focus:  console.log,
                     
                        keyDown:  console.log,
                        enterPress:  console.log,
                        enterEscPress:  console.log,
                        escPress:  console.log,
                        spacePress:  console.log,
                        
                        blur:  console.log,
                        change:  console.log,
                        input:  console.log,

                        context: this
                    }
                },{
                    xtype: 'kijs.gui.field.Text',
                    label: 'mit Button',
                    helpText: 'Hilfe',
                    elements:[
                        {
                            xtype: 'kijs.gui.Button',
                            iconMap: 'kijs.iconMap.Fa.stamp'
                        }
                    ]
                },{
                    xtype: 'kijs.gui.field.Text',
                    label: 'Button inline',
                    helpText: 'Hilfe',
                    elements:[
                        {
                            xtype: 'kijs.gui.Button',
                            cls: 'kijs-inline',
                            iconMap: 'kijs.iconMap.Fa.stamp'
                        }
                    ]
                },{
                    xtype: 'kijs.gui.field.Text',
                    label: 'mit 2 Buttons',
                    helpText: 'Hilfe',
                    elements:[
                        {
                            xtype: 'kijs.gui.Button',
                            iconMap: 'kijs.iconMap.Fa.stamp'
                        },{
                            xtype: 'kijs.gui.Button',
                            iconMap: 'kijs.iconMap.Fa.heart'
                        }
                    ]
                },{
                    xtype: 'kijs.gui.field.Text',
                    label: '2 Buttons inline',
                    helpText: 'Hilfe',
                    elements:[
                        {
                            xtype: 'kijs.gui.Button',
                            cls: 'kijs-inline',
                            iconMap: 'kijs.iconMap.Fa.stamp'
                        },{
                            xtype: 'kijs.gui.Button',
                            cls: 'kijs-inline',
                            iconMap: 'kijs.iconMap.Fa.heart'
                        }
                    ]
                },{
                    xtype: 'kijs.gui.field.Text',
                    label: 'Button mit caption',
                    helpText: 'Hilfe',
                    elements:[
                        {
                            xtype: 'kijs.gui.Button',
                            caption: 'Test',
                            iconMap: 'kijs.iconMap.Fa.stamp'
                        }
                    ]
                },{
                    xtype: 'kijs.gui.field.Text',
                    label: 'Button mit caption inline',
                    helpText: 'Hilfe',
                    elements:[
                        {
                            xtype: 'kijs.gui.Button',
                            caption: 'Test',
                            cls: 'kijs-inline',
                            iconMap: 'kijs.iconMap.Fa.stamp'
                        }
                    ]
                },{
                    xtype: 'kijs.gui.field.Text',
                    label: 'mit spinIcon',
                    spinIconVisible: true
                },
                
                {
                    xtype: 'kijs.gui.Element',
                    html: 'mit Validierung',
                    style: { margin: '10px 0 0 0'}
                },{
                    xtype: 'kijs.gui.field.Text',
                    label: 'Test',
                    required: true,
                    //value: 'sdfg',
                    validationRegExp: { 
                        regExp: /^Test$/,
                        msg: 'Wert muss \'Test\' sein'
                    }
                },
                
                {
                    xtype: 'kijs.gui.Element',
                    html: 'mit Formatierung',
                    style: { margin: '10px 0 0 0'}
                },{
                    xtype: 'kijs.gui.field.Text',
                    label: 'Test',
                    required: true,
                    value: 'sdfg',
                    helpText: 'nach 3 Zeichen wird eine Lücke eingefügt und es werden nur Grossbuchstaben verwendet.',
                    formatRegExp: [
                        { 
                            regExp: /\s/g, // Whitespace entfernen
                            replace: ''
                        },{ 
                            regExp: /(\S{3})/g, // alle 3 Zeichen eine Lücke einfügen
                            replace: '$1 '
                        },{ 
                            regExp: /\s$/, // Whitespace am Ende entfernen
                            replace: ''
                        },{ 
                            regExp: /(.*)/g, // Buchstaben in Grossbauchstaben umwandeln
                            toUpperCase: true
                        }
                    ]
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
            },{
                xtype: 'kijs.gui.field.Switch',
                label: 'disableFlex',
                on: {
                    change: function(e) {
                        this._updateProperty('disableFlex', e.element.value);
                    },
                    context: this
                }
            },{
                xtype: 'kijs.gui.field.Switch',
                label: 'labelHide',
                on: {
                    change: function(e) {
                        this._updateProperty('labelHide', e.element.value);
                    },
                    context: this
                }
            },{
                xtype: 'kijs.gui.field.Switch',
                label: 'labelWidth = 120',
                on: {
                    change: function(e) {
                        this._updateProperty('labelWidth', e.element.value ? 120 : null);
                    },
                    context: this
                }
            },{
                xtype: 'kijs.gui.field.Switch',
                label: 'readOnly',
                on: {
                    change: function(e) {
                        this._updateProperty('readOnly', e.element.value);
                    },
                    context: this
                }
            },{
                xtype: 'kijs.gui.field.Switch',
                label: 'required',
                on: {
                    change: function(e) {
                        this._updateProperty('required', e.element.value);
                        this._callFunction('validate');
                    },
                    context: this
                }
            },{
                xtype: 'kijs.gui.field.Switch',
                label: 'showHelp',
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
                xtype: 'kijs.gui.field.Switch',
                label: 'valueTrimEnable',
                value: true,
                on: {
                    change: function(e) {
                        this._updateProperty('valueTrimEnable', e.element.value);
                    },
                    context: this
                }
            },{
                xtype: 'kijs.gui.field.Switch',
                label: 'placeholder',
                on: {
                    change: function(e) {
                        this._updateProperty('placeholder', e.element.value ? 'Hier Wert eingeben' : '');
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
        ];
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