/* global kijs */

home.sc.FormPanel = class home_sc_FormPanel {
    
    
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
            caption: 'kijs.gui.FormPanel',
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
                    xtype: 'kijs.gui.FormPanel',
                    caption: 'Formular',
                    //rpc: kijs.getRpc('default'),
                    //rpcLoadFn: 'form.load',
                    //rpcSaveFn: 'form.save',
                    //autoLoad: false,
                    shadow: true,
                    collapsible: 'top',
                    closable: true,
                    resizable: true,
                    scrollableY: 'auto',
                    width: 600,
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
                    },
                    on: {
                        change: console.log,
                        context: this
                    },
                    elements: [
                        {
                            xtype: 'kijs.gui.field.Display',
                            value: 'Adresse',
                            style: { fontWeight: 'bold' }
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
                                    style: { flex: 1 },
                                    labelStyle: { textAlign: 'right' }
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
                                    style: { flex: 1 },
                                    labelStyle: { textAlign: 'right' }
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
                            style: { fontWeight: 'bold' }
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
                                    labelWidth: 60,
                                    labelStyle: { textAlign: 'right' }
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
                                    labelWidth: 60,
                                    labelStyle: { textAlign: 'right' }
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
                            style: { fontWeight: 'bold' }
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
                                    inputWidth: 40,
                                    labelStyle: { textAlign: 'right' }
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
                            style: { fontWeight: 'bold' }
                        },{
                            xtype: 'kijs.gui.field.Memo',
                            name: 'Bemerkungen',
                            label: 'Bemerkungen',
                            helpText: 'Hier können Sie die Bermerkungen eintragen',
                            height: 50
                        }
                    ],
                    
                    footerElements: [
                        {
                            xtype: 'kijs.gui.Button',
                            caption: 'Leeren',
                            on: {
                                click: function() {
                                    this.upX('kijs.gui.FormPanel').clear();
                                }
                            }
                        },{
                            xtype: 'kijs.gui.Button',
                            caption: 'Validieren',
                            on: {
                                click: function() {
                                    this.upX('kijs.gui.FormPanel').validate();
                                }
                            }
                        },{
                            xtype: 'kijs.gui.Button',
                            caption: 'check isDirty',
                            on: {
                                click: function() {
                                    kijs.gui.CornerTipContainer.show('isDirty', this.upX('kijs.gui.FormPanel').isDirty ? 'true' : 'false');
                                }
                            }
                        },{
                            xtype: 'kijs.gui.field.Switch',
                            label: 'readOnly',
                            on: {
                                change: function(e) {
                                    this.upX('kijs.gui.FormPanel').readOnly = e.value;
                                }
                            }
                        },{
                            xtype: 'kijs.gui.field.Switch',
                            label: 'disabled',
                            on: {
                                change: function(e) {
                                    this.upX('kijs.gui.FormPanel').innerDisabled = e.value;
                                }
                            }
                        }
                    ]
                },
                
                
                
                {
                    xtype: 'kijs.gui.FormPanel',
                    caption: 'Formular mit definition über RPC',
                    //rpc: 'default',
                    rpcLoadFn: 'form.load',
                    rpcSaveFn: 'form.save',
                    autoLoad: true,
                    shadow: true,
                    collapsible: 'top',
                    closable: true,
                    resizable: true,
                    scrollableY: 'auto',
                    width: 600,
                    cls: 'kijs-flexform',
                    style: {
                        marginTop: '10px'
                    },
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
                    },
                    
                    footerElements: [
                        {
                            xtype: 'kijs.gui.Button',
                            caption: 'RPC Load',
                            on: {
                                click: function() {
                                    this.upX('kijs.gui.FormPanel').load(null, true);
                                }
                            }
                        },{
                            xtype: 'kijs.gui.Button',
                            caption: 'RPC Save',
                            on: {
                                click: function() {
                                    this.upX('kijs.gui.FormPanel').save();
                                }
                            }
                        },{
                            xtype: 'kijs.gui.Button',
                            caption: 'Leeren',
                            on: {
                                click: function() {
                                    this.upX('kijs.gui.FormPanel').clear();
                                }
                            }
                        },{
                            xtype: 'kijs.gui.Button',
                            caption: 'Validieren',
                            on: {
                                click: function() {
                                    this.upX('kijs.gui.FormPanel').validate();
                                }
                            }
                        },{
                            xtype: 'kijs.gui.Button',
                            caption: 'check isDirty',
                            on: {
                                click: function() {
                                    kijs.gui.CornerTipContainer.show('isDirty', this.upX('kijs.gui.FormPanel').isDirty ? 'true' : 'false');
                                }
                            }
                        },{
                            xtype: 'kijs.gui.field.Switch',
                            label: 'readOnly',
                            on: {
                                change: function(e) {
                                    this.upX('kijs.gui.FormPanel').readOnly = e.value;
                                }
                            }
                        },{
                            xtype: 'kijs.gui.field.Switch',
                            label: 'disabled',
                            on: {
                                change: function(e) {
                                    this.upX('kijs.gui.FormPanel').innerDisabled = e.value;
                                }
                            }
                        }
                    ]
                },
                
                
                
                {
                    xtype: 'kijs.gui.FormPanel',
                    caption: 'Formular mit flex-Containern',
                    shadow: true,
                    resizable: true,
                    scrollableY: 'auto',
                    width: 600,
                    cls: 'kijs-flexrowwrap',
                    style: {
                        marginTop: '10px'
                    },
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
                    elements: [
                        {
                            xtype: 'kijs.gui.Container',
                            elements:[
                                {
                                    xtype: 'kijs.gui.field.Display',
                                    value: 'Adresse',
                                    style: { fontWeight: 'bold' }
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
                                            style: { flex: 1 },
                                            labelStyle: { textAlign: 'right' }
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
                                            style: { flex: 1 },
                                            labelStyle: { textAlign: 'right' }
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
                                    style: { fontWeight: 'bold' }
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
                                            labelWidth: 60,
                                            labelStyle: { textAlign: 'right' }
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
                                            labelWidth: 60,
                                            labelStyle: { textAlign: 'right' }
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
                                    style: { fontWeight: 'bold' }
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
                                            inputWidth: 40,
                                            labelStyle: { textAlign: 'right' }
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
                                    style: { fontWeight: 'bold' }
                                },{
                                    xtype: 'kijs.gui.field.Memo',
                                    name: 'Bemerkungen',
                                    label: 'Bemerkungen',
                                    height: 50,
                                    helpText: 'Hier können Sie die Bermerkungen eintragen'
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
            }
        ];
    }
    


    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct() {
        this._content = null;
    }
    
};