/* global kijs */

window.home.sc = {};
home.sc.field_Iban = class home_sc_field_Iban {

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
            caption: 'kijs.gui.field.Iban',
            scrollableY: 'auto',
            style: {
                flex: 1
            },
            innerStyle: {
                padding: '10px'
            },

            headerInnerStyle:{
                gap: '6px'
            },

            headerElements:[
                {
                    xtype: 'kijs.gui.field.Switch',
                    label: 'disabled',
                    on: {
                        change: function(e) {
                            this._updateProperty('disabled', e.element.value);
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
                    label: 'valueTrim',
                    value: true,
                    on: {
                        change: function(e) {
                            this._updateProperty('valueTrim', e.element.value);
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
                    xtype: 'kijs.gui.field.Switch',
                    label: 'formatValue',
                    value: true,
                    on: {
                        change: function(e) {
                            this._updateProperty('formatValue', e.element.value ? true : false);
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
                    caption: 'value setzen',
                    on: {
                        click: function(e) {
                            kijs.Array.each(this._content.elements, function(el) {
                                if (el instanceof kijs.gui.field.Field) {
                                    el.value = 'CH9709000000300097000';
                                }
                            }, this);
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
                    xtype: 'kijs.gui.field.Iban'
                },

                {
                    xtype: 'kijs.gui.Element',
                    html: 'mit Label',
                    style: { margin: '10px 0 4px 0'}
                },{
                    xtype: 'kijs.gui.field.Iban',
                    label: 'Label',
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