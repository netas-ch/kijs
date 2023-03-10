/* global kijs */

window.home.test = {};
home.test.ElementAlignment = class home_test_ElementAlignment {
    
    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        this._app = config.app;
        this._content = null;
        
        this.__testState = 0;
    }
    
    
    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    getContent() {
        this._content = new kijs.gui.Panel({
            caption: 'Test zur Ausrichtung von Elementen',
            scrollableY: 'auto',
            cls: 'kijs-flexform',
            innerCls: 'paperBkgrnd',
            style: {
                flex: 1
            },
            innerStyle: {
                padding: '10px'
            },
            
            headerElements:[
                {
                    xtype: 'kijs.gui.field.Combo',
                    label: 'CSS-Klasse für Panel:',
                    value: 'kijs-flexform',
                    width: 230,
                    data: [
                        { caption: 'keine', value: 'none' },
                        { caption: 'kijs-flexrow', value: 'kijs-flexrow' },
                        { caption: 'kijs-flexcolumn', value: 'kijs-flexcolumn' },
                        { caption: 'kijs-flexform', value: 'kijs-flexform' },
                        { caption: 'kijs-flexline', value: 'kijs-flexline' }
                    ],
                    on: {
                        change: function(e) {
                            this._content.dom.clsRemove(['kijs-flexrow', 'kijs-flexcolumn', 
                                'kijs-flexform', 'kijs-flexline']);
                            if (e.element.value !== 'none') {
                                this._content.dom.clsAdd(e.element.value);
                            }
                        },
                        context: this
                    }
                },{
                    xtype: 'kijs.gui.field.Switch',
                    label: 'disableFlex:',
                    on: {
                        change: function(e) {
                            this._updateProperty('disableFlex', e.element.value);
                        },
                        context: this
                    }
                },{
                    xtype: 'kijs.gui.field.Switch',
                    label: 'labelWidth: 100px:',
                    value: true,
                    on: {
                        change: function(e) {
                            // labelWidth=100px
                            if (e.element.value) {
                                this._updateProperty('labelWidth', 100);
                                
                            // labelWidth=null
                            } else {
                                this._updateProperty('labelWidth', null);
                                
                            }
                        },
                        context: this
                    }
                }
            ],
            
            defaults:{
                labelWidth: 100
            },
            
            elements:[
                {
                    xtype: 'kijs.gui.field.Text',
                    label: 'field.Text',
                    value: 'Test'
                },{
                    xtype: 'kijs.gui.field.Display',
                    label: 'field.Display',
                    value: 'Test'
                },{
                    xtype: 'kijs.gui.field.Text',
                    label: 'field.Text',
                    value: 'Test',
                    helpText: 'Info'
                },{
                    xtype: 'kijs.gui.Button',
                    caption: 'Button'
                },{
                    xtype: 'kijs.gui.field.Combo',
                    label: 'field.Combo',
                    valueField: 'value',
                    captionField: 'caption',
                    value: 'm',
                    data: [
                        {caption: 'Herr', value: 'm' },
                        {caption: 'Frau', value: 'w'},
                        {caption: 'Familie', value: 'f'}
                    ]
                },{
                    xtype: 'kijs.gui.field.Phone',
                    label: 'field.Phone',
                    value: '012 345 67 89'
                },{
                    xtype: 'kijs.gui.field.Checkbox',
                    label: 'field.Checkbox',
                    caption: 'caption',
                    helpText: 'Info'
                },{
                    xtype: 'kijs.gui.field.Switch',
                    label: 'field.Switch',
                    caption: 'caption',
                    helpText: 'Info'
                },{
                    xtype: 'kijs.gui.field.Email',
                    label: 'field.Email',
                    value: 'info@mail.com'
                },{
                    xtype: 'kijs.gui.field.DateTime',
                    label: 'field.DateTime',
                    mode: 'date',
                    date: new Date()
                },{
                    xtype: 'kijs.gui.field.Month',
                    label: 'field.Month'
                },{
                    xtype: 'kijs.gui.field.Color',
                    label: 'field.Color',
                    value: '#fff',
                    helpText: 'Info'
                },{
                    xtype: 'kijs.gui.field.OptionGroup',
                    label: 'field.OptionGroup',
                    captionField: 'caption',
                    valueField: 'value',
                    iconMapField: 'iconMap',
                    value: 2,
                    data: [
                        { caption: 'Apple', iconMap: 'kijs.iconMap.Fa.apple', value: 1},
                        { caption: 'Linux', iconMap: 'kijs.iconMap.Fa.linux', value: 2},
                        { caption: 'Windows', iconMap: 'kijs.iconMap.Fa.windows', value: 3}
                    ]
                },{
                    xtype: 'kijs.gui.field.Password',
                    label: 'field.Password',
                    value: 'value'
                },{
                    xtype: 'kijs.gui.field.OptionGroup',
                    label: 'field.OptionGroup inline',
                    cls: 'kijs-inline',
                    captionField: 'caption',
                    valueField: 'value',
                    iconMapField: 'iconMap',
                    value: 2,
                    data: [
                        { caption: 'Apple', iconMap: 'kijs.iconMap.Fa.apple', value: 1},
                        { caption: 'Linux', iconMap: 'kijs.iconMap.Fa.linux', value: 2},
                        { caption: 'Windows', iconMap: 'kijs.iconMap.Fa.windows', value: 3}
                    ]
                },{
                    xtype: 'kijs.gui.field.Memo',
                    label: 'field.Memo',
                    value: 'Ich bin ein Mehr-\nzeiliger Text',
                    height: 50,
                    helpText: 'Info'
                },{
                    xtype: 'kijs.gui.field.ListView',
                    label: 'field.ListView',
                    captionField: 'caption',
                    valueField: 'value',
                    iconMapField: 'iconMap',
                    iconColorField: '',
                    value: 2,
                    //showCheckBoxes: true,
                    data: [
                        { caption: 'Apple', iconMap: 'kijs.iconMap.Fa.apple', value: 1},
                        { caption: 'Linux', iconMap: 'kijs.iconMap.Fa.linux', value: 2},
                        { caption: 'Windows', iconMap: 'kijs.iconMap.Fa.windows', value: 3}
                    ]
                },{
                    xtype: 'kijs.gui.field.Range',
                    label: 'field.Range',
                    helpText: 'Info'
                },{
                    xtype: 'kijs.gui.field.Editor',
                    label: 'field.Editor',
                    value: 'Text',
                    helpText: 'Info'
                }
            ]
        });
        
        return this._content;
    }
    
    
    run() {

    }
    
    
    // PROTECTED
    _updateProperty(propertyName, value) {
        kijs.Array.each(this._content.elements, function(el) {
            if (el instanceof kijs.gui.Element) {
                if (propertyName in el) {
                    el[propertyName] = value;
                }
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