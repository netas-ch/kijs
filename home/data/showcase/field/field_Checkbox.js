/* global kijs */

home.sc.field_Checkbox = class home_sc_field_Checkbox {


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
            caption: 'kijs.gui.field.Checkbox',
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
                    xtype: 'kijs.gui.field.Checkbox'
                },

                {
                    xtype: 'kijs.gui.Element',
                    html: 'mit Label',
                    style: { margin: '10px 0 0 0'}
                },{
                    xtype: 'kijs.gui.field.Checkbox',
                    label: 'Label',
                    caption: 'Caption',
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
                    xtype: 'kijs.gui.Element',
                    html: 'weitere Beispiele',
                    style: { margin: '10px 0 0 0'}
                },{
                    xtype: 'kijs.gui.field.Checkbox',
                    label: 'Checkbox',
                    threeState: true,
                    helpText: 'threeState'
                },{
                    xtype: 'kijs.gui.field.Checkbox',
                    name: 'CheckboxIcon',
                    label: '... mit Icon',
                    iconCls: 'icoWizard16',
                    caption: 'Caption',
                    checked: 1
                },{
                    xtype: 'kijs.gui.field.Checkbox',
                    name: 'CheckboxColor',
                    label: '... mit Farbe',
                    iconMap: 'kijs.iconMap.Fa.stamp',
                    iconColor: '#ff8800',
                    helpText: 'Info'
                },{
                    xtype: 'kijs.gui.field.Checkbox',
                    name: 'CheckboxOption',
                    label: '... als Option',
                    caption: 'Caption',
                    checkedIconMap: 'kijs.iconMap.Fa.circle-check',
                    uncheckedIconMap: 'kijs.iconMap.Fa.circle',
                    determinatedIconMap: 'kijs.iconMap.Fa.circle-dot',
                    valueChecked: 'Ein',
                    valueDeterminated: 'wedernoch',
                    valueUnchecked: 'Aus',
                    value: 'Ein',
                    helpText: 'Info',
                    elements: [
                        {
                            xtype: 'kijs.gui.Button',
                            iconMap: 'kijs.iconMap.Fa.comment-sms',
                            tooltip: 'test',
                            on: {
                                click: function() {
                                    let chkBox = this.upX('kijs.gui.field.Checkbox');
                                    console.log(chkBox.value);
                                    chkBox.checked = 2;
                                    console.log(chkBox.value);
                                }
                            }
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
                value: true,
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
                label: 'threeState',
                on: {
                    change: function(e) {
                        this._updateProperty('threeState', e.element.value);
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