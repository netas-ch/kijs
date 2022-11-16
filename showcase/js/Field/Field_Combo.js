/* global kijs */

window.sc = {};
sc.Field_Combo = class sc_Field_Combo {
    
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
            caption: 'kijs.gui.field.Combo',
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
                    xtype: 'kijs.gui.field.Switch',
                    caption: 'spinIconVisible',
                    value: true,
                    on: {
                        change: function(e) {
                            this._updateProperty('spinIconVisible', e.element.value);
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
                    xtype: 'kijs.gui.field.Combo',
                    data: [
                        { caption: 'Apple', value: 1},
                        { caption: 'Linux', value: 2},
                        { caption: 'Windows', value: 3}
                    ]
                },
                
                {
                    xtype: 'kijs.gui.Element',
                    html: 'mit Label',
                    style: { margin: '10px 0 4px 0'}
                },{
                    xtype: 'kijs.gui.field.Combo',
                    label: 'Label',
                    captionField: 'caption',
                    valueField: 'value',
                    iconMapField: 'iconMap',
                    iconColorField: '',
                    value: 2,
                    data: [
                        { caption: 'Apple', iconMap: 'kijs.iconMap.Fa.apple', value: 1},
                        { caption: 'Linux', iconMap: 'kijs.iconMap.Fa.linux', value: 2},
                        { caption: 'Windows', iconMap: 'kijs.iconMap.Fa.windows', value: 3}
                    ],
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
                    html: 'RPC',
                    style: { margin: '10px 0 4px 0'}
                },{
                    xtype: 'kijs.gui.field.Combo',
                    label: 'Server Sort',
                    facadeFnLoad: 'combo.load',
                    rpc: this._app.rpc,
                    autoLoad: true,
                    remoteSort: true
                },{
                    xtype: 'kijs.gui.field.Combo',
                    label: 'Local Sort',
                    facadeFnLoad: 'combo.load',
                    rpc: this._app.rpc,
                    autoLoad: true,
                    remoteSort: false
                },{
                    xtype: 'kijs.gui.field.Combo',
                    label: 'Kein Force',
                    facadeFnLoad: 'combo.load',
                    autoLoad: true,
                    remoteSort: true,
                    rpc: this._app.rpc,
                    forceSelection: false,
                    showPlaceholder: false
                }/*,
                                        
                {
                    xtype: 'kijs.gui.field.CheckboxGroup',
                    label: 'CheckboxGroup Inline',
                    cls: 'kijs-inline',
                    valueField: 'color',
                    //checkedAll: true,
                    captionField: 'Bez',
                    iconCharField: 'iconChar',
                    iconColorField: 'color',
                    rpc: this._app.rpc,
                    facadeFnLoad: 'colors.load',
                    autoLoad: true,
                    value: ['#0f0', '#ff0']
                }*/
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