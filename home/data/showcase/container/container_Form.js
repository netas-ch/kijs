/* global kijs */

home.sc.container_Form = class home_sc_container_Form {
    
    
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
            caption: 'kijs.gui.container.Form',
            cls: 'kijs-borderless',
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
                    xtype: 'kijs.gui.Panel',
                    caption: 'Formular',
                    collapsible: 'top',
                    closable: true,
                    resizable: true,
                    scrollableY: 'auto',
                    width: 700,
                    cls: 'kijs-flexfit',
                    elements: [
                        {
                            xtype: 'kijs.gui.container.Form',
                            //rpc: kijs.getRpc('default'),
                            //rpcLoadFn: 'form.load',
                            //rpcSaveFn: 'form.save',
                            //autoLoad: false,
                            cls: 'kijs-flexform',
                            innerStyle: {
                                padding: '10px'
                            },
                            defaults: {
                                labelWidth: 110,
                                required: true,
                                defaults: {
                                    labelWidth: 110,
                                    required: true
                                }
                            },
                            on: {
                                change: console.log,
                                context: this
                            },
                            elements: [
                                {
                                    xtype: 'kijs.gui.field.Display',
                                    value: 'Adresse',
                                    cls: 'kijs-title'
                                },{
                                    xtype: 'kijs.gui.field.Combo',
                                    name: 'Anrede',
                                    label: 'Anrede',
                                    valueField: 'value',
                                    captionField: 'caption',
                                    disableFlex: true,
                                    data: [
                                        {caption: 'Herr', value: 'm' },
                                        {caption: 'Frau', value: 'w'},
                                        {caption: 'Familie', value: 'f'}
                                    ]
                                },{
                                    xtype: 'kijs.gui.Container',
                                    cls: 'kijs-flexline',
                                    innerStyle: { gap: '0 20px' },
                                    elements:[
                                        {
                                            xtype: 'kijs.gui.field.Text',
                                            name: 'Vorname',
                                            label: 'Vorname',
                                            style: { flex: 1 }
                                        },{
                                            xtype: 'kijs.gui.field.Text',
                                            name: 'Name',
                                            label: 'Name',
                                            labelWidth: null,
                                            style: { flex: 1 }
                                        }
                                    ]
                                },{
                                    xtype: 'kijs.gui.field.Text',
                                    name: 'Strasse',
                                    label: 'Strasse'
                                },{
                                    xtype: 'kijs.gui.Container',
                                    cls: 'kijs-flexline',
                                    innerStyle: { gap: '0 20px' },
                                    elements:[
                                        {
                                            xtype: 'kijs.gui.field.Text',
                                            name: 'Plz',
                                            label: 'PLZ',
                                            disableFlex: true,
                                            inputWidth: 100
                                        },{
                                            xtype: 'kijs.gui.field.Text',
                                            name: 'Ort',
                                            label: 'Ort',
                                            labelWidth: null,
                                            style: { flex: 1 }
                                        }
                                    ]
                                },{
                                    xtype: 'kijs.gui.field.Combo',
                                    name: 'Land',
                                    label: 'Land',
                                    //rpc: 'default',
                                    rpcLoadFn: 'land.load',
                                    autoLoad: true,
                                    valueField: 'value',
                                    captionField: 'caption'
                                },

                                {
                                    xtype: 'kijs.gui.field.Display',
                                    value: 'Kontakt',
                                    cls: 'kijs-title'
                                },{
                                    xtype: 'kijs.gui.Container',
                                    cls: 'kijs-flexline',
                                    innerStyle: { gap: '0 20px' },
                                    elements:[
                                        {
                                            xtype: 'kijs.gui.field.Phone',
                                            name: 'TelefonP',
                                            label: 'Telefon P'
                                        },{
                                            xtype: 'kijs.gui.field.Phone',
                                            name: 'TelefonG',
                                            label: 'Telefon G',
                                            labelWidth: 60
                                        }
                                    ]
                                },{
                                    xtype: 'kijs.gui.Container',
                                    cls: 'kijs-flexline',
                                    innerStyle: { gap: '0 20px' },
                                    elements:[
                                        {
                                            xtype: 'kijs.gui.field.Phone',
                                            name: 'MobileP',
                                            label: 'Mobile P'
                                        },{
                                            xtype: 'kijs.gui.field.Phone',
                                            name: 'MobileG',
                                            label: 'Mobile G',
                                            labelWidth: 60
                                        }
                                    ]
                                },{
                                    xtype: 'kijs.gui.field.Email',
                                    name: 'Email',
                                    label: 'E-Mail'
                                },

                                {
                                    xtype: 'kijs.gui.field.Display',
                                    value: 'Weitere Angaben',
                                    cls: 'kijs-title'
                                },{
                                    xtype: 'kijs.gui.Container',
                                    cls: 'kijs-flexline',
                                    innerStyle: { gap: '0 20px' },
                                    elements:[
                                        {
                                            xtype: 'kijs.gui.field.DateTime',
                                            name: 'Geburtsdatum',
                                            label: 'Geburtsdatum',
                                            mode: 'date',
                                            on: {
                                                change: function(e) {
                                                    let birthday = e.value ? kijs.Date.create(e.value) : null;
                                                    e.element.next.value =kijs.Date.getAge(birthday);
                                                },
                                                context: this
                                            }
                                        },{
                                            xtype: 'kijs.gui.field.Text',
                                            name: 'Alter',
                                            label: 'Alter',
                                            readOnly: true,
                                            disableFlex: true,
                                            labelWidth: null,
                                            inputWidth: 40
                                        }
                                    ]
                                },{
                                    xtype: 'kijs.gui.field.Color',
                                    name: 'Lieblingsfarbe',
                                    label: 'Lieblingsfarbe',
                                    value: '#fff'
                                },{
                                    xtype: 'kijs.gui.field.OptionGroup',
                                    name: 'LieblingsBetriebssystem',
                                    label: 'Lieblings Betriebssystem',
                                    captionField: 'caption',
                                    valueField: 'value',
                                    iconMapField: 'iconMap',
                                    data: [
                                        { caption: 'Apple', iconMap: 'kijs.iconMap.Fa.apple', value: 1},
                                        { caption: 'Linux', iconMap: 'kijs.iconMap.Fa.linux', value: 2},
                                        { caption: 'Windows', iconMap: 'kijs.iconMap.Fa.windows', value: 3}
                                    ]
                                },


                                {
                                    xtype: 'kijs.gui.field.Display',
                                    value: 'Bemerkungen',
                                    cls: 'kijs-title'
                                },{
                                    xtype: 'kijs.gui.field.Memo',
                                    name: 'Bemerkungen',
                                    label: 'Bemerkungen',
                                    helpText: 'Hier können Sie die Bermerkungen eintragen',
                                    inputHeight: 50
                                }
                            ]
                        }
                    ],
                    
                    footerElements: [
                        '>',
                        {
                            xtype: 'kijs.gui.Button',
                            caption: 'Leeren',
                            on: {
                                click: function() {
                                    let form = this.upX('kijs.gui.Panel').downX('kijs.gui.container.Form');
                                    form.clear();
                                }
                            }
                        },{
                            xtype: 'kijs.gui.Button',
                            caption: 'Validieren',
                            on: {
                                click: function() {
                                    let form = this.upX('kijs.gui.Panel').downX('kijs.gui.container.Form');
                                    form.validate();
                                }
                            }
                        },{
                            xtype: 'kijs.gui.Button',
                            caption: 'check isDirty',
                            on: {
                                click: function() {
                                    let form = this.upX('kijs.gui.Panel').downX('kijs.gui.container.Form');
                                    kijs.gui.CornerTipContainer.show('isDirty', form.isDirty ? 'true' : 'false');
                                }
                            }
                        },{
                            xtype: 'kijs.gui.field.Switch',
                            label: 'readOnly',
                            on: {
                                change: function(e) {
                                    let form = this.upX('kijs.gui.Panel').downX('kijs.gui.container.Form');
                                    form.readOnly = e.value;
                                }
                            }
                        },{
                            xtype: 'kijs.gui.field.Switch',
                            label: 'disabled',
                            on: {
                                change: function(e) {
                                    let form = this.upX('kijs.gui.Panel').downX('kijs.gui.container.Form');
                                    form.disabled = e.value;
                                }
                            }
                        }
                    ]
                },
                
                
                
                {
                    xtype: 'kijs.gui.Panel',
                    caption: 'Formular mit definition über RPC',
                    collapsible: 'top',
                    closable: true,
                    resizable: true,
                    scrollableY: 'auto',
                    width: 600,
                    cls: 'kijs-flexfit',
                    style: {
                        marginTop: '10px'
                    },
                    
                    elements:[
                        {
                            xtype: 'kijs.gui.container.Form',
                            //rpc: 'default',
                            rpcLoadFn: 'form.load',
                            rpcSaveFn: 'form.save',
                            autoLoad: true,
                            cls: 'kijs-flexform',
                            innerStyle: {
                                padding: '10px'
                            },
                            defaults: {
                                labelWidth: 100,
                                required: true,
                                defaults: {
                                    labelWidth: 100,
                                    required: true
                                }
                            }
                        }
                    ],
                    
                    footerElements: [
                        '>',
                        {
                            xtype: 'kijs.gui.Button',
                            caption: 'RPC Load',
                            on: {
                                click: function() {
                                    let form = this.upX('kijs.gui.Panel').downX('kijs.gui.container.Form');
                                    form.load(null, true);
                                }
                            }
                        },{
                            xtype: 'kijs.gui.Button',
                            caption: 'RPC Save',
                            on: {
                                click: function() {
                                    let form = this.upX('kijs.gui.Panel').downX('kijs.gui.container.Form');
                                    form.save();
                                }
                            }
                        },{
                            xtype: 'kijs.gui.Button',
                            caption: 'Leeren',
                            on: {
                                click: function() {
                                    let form = this.upX('kijs.gui.Panel').downX('kijs.gui.container.Form');
                                    form.clear();
                                }
                            }
                        },{
                            xtype: 'kijs.gui.Button',
                            caption: 'Validieren',
                            on: {
                                click: function() {
                                    let form = this.upX('kijs.gui.Panel').downX('kijs.gui.container.Form');
                                    form.validate();
                                }
                            }
                        },{
                            xtype: 'kijs.gui.Button',
                            caption: 'check isDirty',
                            on: {
                                click: function() {
                                    let form = this.upX('kijs.gui.Panel').downX('kijs.gui.container.Form');
                                    kijs.gui.CornerTipContainer.show('isDirty', form.isDirty ? 'true' : 'false');
                                }
                            }
                        },{
                            xtype: 'kijs.gui.field.Switch',
                            label: 'readOnly',
                            on: {
                                change: function(e) {
                                    let form = this.upX('kijs.gui.Panel').downX('kijs.gui.container.Form');
                                    form.readOnly = e.value;
                                }
                            }
                        },{
                            xtype: 'kijs.gui.field.Switch',
                            label: 'disabled',
                            on: {
                                change: function(e) {
                                    let form = this.upX('kijs.gui.Panel').downX('kijs.gui.container.Form');
                                    form.disabled = e.value;
                                }
                            }
                        }
                    ]
                },
                
                
                
                {
                    xtype: 'kijs.gui.Panel',
                    caption: 'Formular mit flex-Containern',
                    resizable: true,
                    scrollableY: 'auto',
                    width: 600,
                    cls: 'kijs-flexfit',
                    style: {
                        marginTop: '10px'
                    },
                    
                    elements: [
                        {
                            xtype: 'kijs.gui.container.Form',
                            cls: 'kijs-flexrowwrap',
                            defaults: {
                                cls: 'kijs-flexform',
                                width: 500,
                                defaults: {
                                    labelWidth: 100,
                                    required: true,
                                    defaults: {
                                        labelWidth: 100,
                                        required: true
                                    }
                                }
                            },
                            
                            elements:[
                                {
                                    xtype: 'kijs.gui.Container',
                                    elements:[
                                        {
                                            xtype: 'kijs.gui.field.Display',
                                            value: 'Adresse',
                                            cls: 'kijs-title'
                                        },{
                                            xtype: 'kijs.gui.field.Combo',
                                            name: 'Anrede',
                                            label: 'Anrede',
                                            valueField: 'value',
                                            captionField: 'caption',
                                            disableFlex: true,
                                            data: [
                                                {caption: 'Herr', value: 'm' },
                                                {caption: 'Frau', value: 'w'},
                                                {caption: 'Familie', value: 'f'}
                                            ]
                                        },{
                                            xtype: 'kijs.gui.Container',
                                            cls: 'kijs-flexline',
                                            innerStyle: { gap: '0 20px' },
                                            elements:[
                                                {
                                                    xtype: 'kijs.gui.field.Text',
                                                    name: 'Vorname',
                                                    label: 'Vorname',
                                                    style: { flex: 1 }
                                                },{
                                                    xtype: 'kijs.gui.field.Text',
                                                    name: 'Name',
                                                    label: 'Name',
                                                    labelWidth: null,
                                                    style: { flex: 1 }
                                                }
                                            ]
                                        },{
                                            xtype: 'kijs.gui.field.Text',
                                            name: 'Strasse',
                                            label: 'Strasse'
                                        },{
                                            xtype: 'kijs.gui.Container',
                                            cls: 'kijs-flexline',
                                            innerStyle: { gap: '0 20px' },
                                            elements:[
                                                {
                                                    xtype: 'kijs.gui.field.Text',
                                                    name: 'Plz',
                                                    label: 'PLZ',
                                                    disableFlex: true,
                                                    inputWidth: 100
                                                },{
                                                    xtype: 'kijs.gui.field.Text',
                                                    name: 'Ort',
                                                    label: 'Ort',
                                                    labelWidth: null,
                                                    style: { flex: 1 }
                                                }
                                            ]
                                        },{
                                            xtype: 'kijs.gui.field.Combo',
                                            name: 'Land',
                                            label: 'Land',
                                            //rpc: 'default',
                                            rpcLoadFn: 'land.load',
                                            autoLoad: true,
                                            valueField: 'value',
                                            captionField: 'caption'
                                        }
                                    ]
                                },{
                                    xtype: 'kijs.gui.Container',
                                    elements:[
                                        {
                                            xtype: 'kijs.gui.field.Display',
                                            value: 'Kontakt',
                                            cls: 'kijs-title'
                                        },{
                                            xtype: 'kijs.gui.Container',
                                            cls: 'kijs-flexline',
                                            innerStyle: { gap: '0 20px' },
                                            elements:[
                                                {
                                                    xtype: 'kijs.gui.field.Phone',
                                                    name: 'TelefonP',
                                                    label: 'Telefon P'
                                                },{
                                                    xtype: 'kijs.gui.field.Phone',
                                                    name: 'TelefonG',
                                                    label: 'Telefon G',
                                                    labelWidth: 60
                                                }
                                            ]
                                        },{
                                            xtype: 'kijs.gui.Container',
                                            cls: 'kijs-flexline',
                                            innerStyle: { gap: '0 20px' },
                                            elements:[
                                                {
                                                    xtype: 'kijs.gui.field.Phone',
                                                    name: 'MobileP',
                                                    label: 'Mobile P'
                                                },{
                                                    xtype: 'kijs.gui.field.Phone',
                                                    name: 'MobileG',
                                                    label: 'Mobile G',
                                                    labelWidth: 60
                                                }
                                            ]
                                        },{
                                            xtype: 'kijs.gui.field.Email',
                                            name: 'Email',
                                            label: 'E-Mail'
                                        }
                                    ]
                                },{
                                    xtype: 'kijs.gui.Container',
                                    elements:[
                                        {
                                            xtype: 'kijs.gui.field.Display',
                                            value: 'Weitere Angaben',
                                            cls: 'kijs-title'
                                        },{
                                            xtype: 'kijs.gui.Container',
                                            cls: 'kijs-flexline',
                                            innerStyle: { gap: '0 20px' },
                                            elements:[
                                                {
                                                    xtype: 'kijs.gui.field.DateTime',
                                                    name: 'Geburtsdatum',
                                                    label: 'Geburtsdatum',
                                                    mode: 'date',
                                                    on: {
                                                        change: function(e) {
                                                            let birthday = e.value ? kijs.Date.create(e.value) : null;
                                                            e.element.next.value =kijs.Date.getAge(birthday);
                                                        },
                                                        context: this
                                                    }
                                                },{
                                                    xtype: 'kijs.gui.field.Text',
                                                    name: 'Alter',
                                                    label: 'Alter',
                                                    readOnly: true,
                                                    disableFlex: true,
                                                    labelWidth: null,
                                                    inputWidth: 40
                                                }
                                            ]
                                        },{
                                            xtype: 'kijs.gui.field.Color',
                                            name: 'Lieblingsfarbe',
                                            label: 'Lieblingsfarbe',
                                            value: '#fff'
                                        },{
                                            xtype: 'kijs.gui.field.OptionGroup',
                                            name: 'LieblingsBetriebssystem',
                                            label: 'Lieblings Betriebssystem',
                                            captionField: 'caption',
                                            valueField: 'value',
                                            iconMapField: 'iconMap',
                                            data: [
                                                { caption: 'Apple', iconMap: 'kijs.iconMap.Fa.apple', value: 1},
                                                { caption: 'Linux', iconMap: 'kijs.iconMap.Fa.linux', value: 2},
                                                { caption: 'Windows', iconMap: 'kijs.iconMap.Fa.windows', value: 3}
                                            ]
                                        }
                                    ]
                                },{
                                    xtype: 'kijs.gui.Container',
                                    elements:[
                                        {
                                            xtype: 'kijs.gui.field.Display',
                                            value: 'Bemerkungen',
                                            cls: 'kijs-title'
                                        },{
                                            xtype: 'kijs.gui.field.Memo',
                                            name: 'Bemerkungen',
                                            label: 'Bemerkungen',
                                            inputHeight: 50,
                                            helpText: 'Hier können Sie die Bermerkungen eintragen'
                                        }
                                    ]
                                }
                            ]
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
                xtype: 'kijs.gui.field.Combo',
                label: 'labelPosition:',
                value: 'left',
                inputWidth: 40,
                data: [
                    { caption: 'auto', value: 'auto' },
                    { caption: 'left', value: 'left' },
                    { caption: 'top', value: 'top' }
                ],
                on: {
                    change: function(e) {
                        this._updatePropertyRec(this._content, 'labelPosition', e.element.value);
                    },
                    context: this
                }
            }
        ];
    }
    
    _updatePropertyRec(parentEl, propertyName, value) {
        kijs.Array.each(parentEl.elements, function(el) {
            if (el instanceof kijs.gui.field.Field) {
                el[propertyName] = value;
            }
            
            if (el instanceof kijs.gui.Container) {
                this._updatePropertyRec(el, propertyName, value);
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