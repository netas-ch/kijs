/* global kijs */

home.sc.field_ListView = class home_sc_field_ListView {


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
            caption: 'kijs.gui.field.ListView',
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
                    xtype: 'kijs.gui.field.ListView',
                    valueField: 'value',
                    captionField: 'caption',
                    data: [
                        { caption: 'Apple', value: 1},
                        { caption: 'Linux', value: 2},
                        { caption: 'Windows', value: 3}
                    ]
                },

                {
                    xtype: 'kijs.gui.Element',
                    html: 'mit Label',
                    style: { margin: '10px 0 0 0'}
                },{
                    xtype: 'kijs.gui.field.ListView',
                    label: 'Label',
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
                    ],
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
                    html: 'mit RPC und Drg&Drop',
                    style: { margin: '10px 0 0 0'}
                },{
                    xtype: 'kijs.gui.field.ListView',
                    label: 'ListView remote',
                    valueField: 'color',
                    //checkedAll: true,
                    captionField: 'Bez',
                    iconCharField: 'iconChar',
                    iconColorField: 'color',
                    //rpc: 'default',
                    rpcLoadFn: 'colors.load',
                    autoLoad: true,
                    showCheckBoxes: false,
                    selectType: 'multi',
                    value: ['#0f0', '#ff0'],
                    minSelectCount: 2,
                    maxSelectCount: 3,
                    sortable: true
                },

                {
                    xtype: 'kijs.gui.Element',
                    html: 'ListView local:',
                    style: { margin: '10px 0 0 0'}
                },{
                    xtype: 'kijs.gui.field.ListView',
                    label: 'ListView local',
                    valueField: 'id',
                    captionField: 'Bezeichnung',
                    iconMapField: 'Icon',
                    iconColorField: 'Color',
                    tooltipField: 'Color',
                    showCheckBoxes: true,
                    selectType: 'simple',
                    helpText: 'Hilfe Text!',
                    required: true,
                    width: 350,
                    sortable: true,
                    data: [
                        {id:1, Bezeichnung:'blau', Icon:'kijs.iconMap.Fa.droplet', Color:'#0088ff' },
                        {id:2, Bezeichnung:'grün', Icon:'kijs.iconMap.Fa.droplet', Color:'#88ff00' },
                        {id:3, Bezeichnung:'pink', Icon:'kijs.iconMap.Fa.droplet', Color:'#ff0088' },
                        {id:4, Bezeichnung:'türkis', Icon:'kijs.iconMap.Fa.droplet', Color:'#00ff88' },
                        {id:5, Bezeichnung:'orange', Icon:'kijs.iconMap.Fa.droplet', Color:'#ff8800' },
                        {id:6, Bezeichnung:'viollet', Icon:'kijs.iconMap.Fa.droplet', Color:'#8800ff' },
                        {id:7, Bezeichnung:'dunkelgrau', Icon:'kijs.iconMap.Fa.droplet', Color:'#666666' },
                        {id:8, Bezeichnung:'grau', Icon:'kijs.iconMap.Fa.droplet', Color:'#999999' },
                        {id:9, Bezeichnung:'hellgrau', Icon:'kijs.iconMap.Fa.droplet', Color:'#bbbbbb' },
                        {id:10, Bezeichnung:'weiss', Icon:'kijs.iconMap.Fa.droplet', Color:'#ffffff' },
                        {id:11, Bezeichnung:'schwarz', Icon:'kijs.iconMap.Fa.droplet', Color:'#000000' }
                    ],
                    value: [2,3],
                    on: {
                        change: console.log
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
                xtype: 'kijs.gui.field.OptionGroup',
                label: 'selectType',
                cls: 'kijs-inline',
                valueField: 'id',
                captionField: 'id',
                required: true,
                data: [
                    {id:'none' },
                    {id:'single' },
                    {id:'multi' },
                    {id:'simple' }
                ],
                value: 'single',
                on: {
                    input: function(e) {
                        this._updateProperty('value', null);
                        this._updateProperty('selectType', e.value);
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