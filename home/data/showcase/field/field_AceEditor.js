/* global kijs */

home.sc.field_AceEditor = class home_sc_field_AceEditor {


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
            caption: 'kijs.gui.field.AceEditor',
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
                    xtype: 'kijs.gui.Element',
                    html: 'Minimalkonfiguration:'
                },{
                    xtype: 'kijs.gui.field.AceEditor'
                },

                {
                    xtype: 'kijs.gui.Element',
                    html: 'mit Label',
                    style: { margin: '10px 0 0 0'}
                },{
                    xtype: 'kijs.gui.field.AceEditor',
                    label: 'Label',
                    mode: 'javascript',
                    //theme: 'monokai',
                    value: 'function test(x) {\n    console.log(x);\n}\n\ntest("Hallo Welt!");\nFehler',
                    inputHeight: 100,
                    on: {
                        focus:  console.log,

                        keyDown:  console.log,
                        enterPress:  console.log,
                        enterEscPress:  console.log,
                        escPress:  console.log,
                        spacePress:  console.log,

                        blur:  console.log,
                        change: console.log,
                        input:  console.log,

                        context: this
                    }
                },
                
                {
                    xtype: 'kijs.gui.Panel',
                    caption: 'Geflexter ACE-Editor',
                    cls: 'kijs-flexfit',
                    maximizable: true,
                    maximized: false,
                    resizable: true,
                    width: 500,
                    height: 100,
                    elements: [
                        {
                            xtype: 'kijs.gui.field.AceEditor'
                        }
                    ]
                },

                {
                    xtype: 'kijs.gui.Element',
                    html: '<a href="https://ace.c9.io/" target="blank">ACE Webseite</a><br><a href="https://github.com/ajaxorg/ace-builds" target="blank">GitHub</a>',
                    style: { margin: '20px 0 4px 0'}
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
                label: 'Debug-Buttons',
                on: {
                    change: function(e) {
                        kijs.Array.each(this._content.elements, function(el) {
                            if (el instanceof kijs.gui.field.Field) {
                                if (e.value) {
                                    el.add(new kijs.gui.Button({
                                        name: 'showValue',
                                        tooltip: 'value anzeigen',
                                        iconMap: 'kijs.iconMap.Fa.eye',
                                        on: {
                                            click: function(e) {
                                                kijs.gui.CornerTipContainer.show('value', '<pre style="border:1px solid #000">'+el.value+'</pre>');
                                            },
                                            context: this
                                        }
                                    }));
                                    el.add(new kijs.gui.Button({
                                        name: 'setValue',
                                        tooltip: 'value neu setzen (value=value)',
                                        iconMap: 'kijs.iconMap.Fa.pen',
                                        on: {
                                            click: function(e) {
                                                let val = el.value;
                                                el.value = val;
                                                this._updateIsDirtyButton(el, e.value);
                                            },
                                            context: this
                                        }
                                    }));
                                    el.add(new kijs.gui.Button({
                                        name: 'resetValue',
                                        tooltip: 'valuesReset',
                                        iconMap: 'kijs.iconMap.Fa.arrow-rotate-left',
                                        on: {
                                            click: function(e) {
                                                el.valuesReset();
                                                this._updateIsDirtyButton(el, e.value);
                                            },
                                            context: this
                                        }
                                    }));
                                    el.on('input', this.#onInputForIsDirty, this);
                                } else {
                                    el.remove([
                                        el.down('showValue'),
                                        el.down('setValue'),
                                        el.down('resetValue')
                                    ]);
                                    
                                    el.off('input', this.#onInputForIsDirty, this);
                                }
                                this._updateIsDirtyButton(el, e.value);
                            }
                        }, this);
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
                caption: 'valuesReset',
                on: {
                    click: function(e) {
                        kijs.Array.each(this._content.elements, function(el) {
                            if (el instanceof kijs.gui.field.Field) {
                                el.valuesReset();
                            }
                        }, this);
                    },
                    context: this
                }
            }
        ];
    }

    // Zeigt beim Übergebenen Feld einen isDirty-Button an, wenn etwas geändert wurde
    _updateIsDirtyButton(el, addRemove=null) {
        let btn = el.down('isDirtyResetButton');
        
        // button erstellen
        if (addRemove===true && !btn) {
            btn = new kijs.gui.Button({
                xtype: 'kijs.gui.Button',
                name: 'isDirtyResetButton',
                caption: 'isDirty',
                tooltip: 'isDirty zurücksetzen',
                style: { borderColor: '#ff8800' },
                captionStyle: { color: '#ff8800' },
                on: {
                    click: (e) => {
                        e.element.parent.isDirty = false;
                        this._updateIsDirtyButton(el);
                    },
                    context: this
                }
            });
            el.add(btn);
        }
        
        // button ein-/ausblenden
        if (btn) {
            btn.visible = el.isDirty;
        }
        
        // button entfernen
        if (addRemove===false && btn) {
            el.remove(btn);
        }
    }

    _updateProperty(propertyName, value) {
        kijs.Array.each(this._content.elements, function(el) {
            if (el instanceof kijs.gui.field.Field) {
                el[propertyName] = value;
            }
        }, this);
    }


    // PRIVATE
    // LISTENERS
    #onInputForIsDirty(e) {
        this._updateIsDirtyButton(e.element);
    }



    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct() {
        this._content = null;
    }

};