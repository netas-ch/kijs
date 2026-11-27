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
            headerBarElements: [ this._app.createApiButton('kijs.gui.container.Form') ],
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
                    caption: kijs.getText('Formular'),
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
                                    value: kijs.getText('Adresse'),
                                    cls: 'kijs-title'
                                },{
                                    xtype: 'kijs.gui.field.Combo',
                                    name: 'Anrede',
                                    label: kijs.getText('Anrede'),
                                    valueField: 'value',
                                    displayTextField: 'displayText',
                                    disableFlex: true,
                                    data: [
                                        {displayText: kijs.getText('Herr'), value: 'm' },
                                        {displayText: kijs.getText('Frau'), value: 'w'},
                                        {displayText: kijs.getText('Familie'), value: 'f'}
                                    ]
                                },{
                                    xtype: 'kijs.gui.Container',
                                    cls: 'kijs-flexline',
                                    innerStyle: { gap: '0 20px' },
                                    elements:[
                                        {
                                            xtype: 'kijs.gui.field.Text',
                                            name: 'Vorname',
                                            label: kijs.getText('Vorname'),
                                            style: { flex: 1 }
                                        },{
                                            xtype: 'kijs.gui.field.Text',
                                            name: 'Name',
                                            label: kijs.getText('Name'),
                                            labelWidth: null,
                                            style: { flex: 1 }
                                        }
                                    ]
                                },{
                                    xtype: 'kijs.gui.field.Text',
                                    name: 'Strasse',
                                    label: kijs.getText('Strasse')
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
                                            label: kijs.getText('Ort'),
                                            labelWidth: null,
                                            style: { flex: 1 }
                                        }
                                    ]
                                },{
                                    xtype: 'kijs.gui.field.Combo',
                                    name: 'Land',
                                    label: kijs.getText('Land'),
                                    //rpc: 'default',
                                    rpcLoadFn: 'land.load',
                                    autoLoad: true,
                                    valueField: 'ISO',
                                    displayTextField: 'Land'
                                },

                                {
                                    xtype: 'kijs.gui.field.Display',
                                    value: kijs.getText('Kontakt'),
                                    cls: 'kijs-title'
                                },{
                                    xtype: 'kijs.gui.Container',
                                    cls: 'kijs-flexline',
                                    innerStyle: { gap: '0 20px' },
                                    elements:[
                                        {
                                            xtype: 'kijs.gui.field.Phone',
                                            name: 'TelefonP',
                                            label: kijs.getText('Telefon P')
                                        },{
                                            xtype: 'kijs.gui.field.Phone',
                                            name: 'TelefonG',
                                            label: kijs.getText('Telefon G'),
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
                                            label: kijs.getText('Mobile P')
                                        },{
                                            xtype: 'kijs.gui.field.Phone',
                                            name: 'MobileG',
                                            label: kijs.getText('Mobile G'),
                                            labelWidth: 60
                                        }
                                    ]
                                },{
                                    xtype: 'kijs.gui.field.Email',
                                    name: 'Email',
                                    label: kijs.getText('E-Mail')
                                },

                                {
                                    xtype: 'kijs.gui.field.Display',
                                    value: kijs.getText('Weitere Angaben'),
                                    cls: 'kijs-title'
                                },{
                                    xtype: 'kijs.gui.Container',
                                    cls: 'kijs-flexline',
                                    innerStyle: { gap: '0 20px' },
                                    elements:[
                                        {
                                            xtype: 'kijs.gui.field.DateTime',
                                            name: 'Geburtsdatum',
                                            label: kijs.getText('Geburtsdatum'),
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
                                            label: kijs.getText('Alter'),
                                            readOnly: true,
                                            disableFlex: true,
                                            labelWidth: null,
                                            inputWidth: 40
                                        }
                                    ]
                                },{
                                    xtype: 'kijs.gui.field.Color',
                                    name: 'Lieblingsfarbe',
                                    label: kijs.getText('Lieblingsfarbe'),
                                    value: '#fff'
                                },{
                                    xtype: 'kijs.gui.field.OptionGroup',
                                    name: 'LieblingsBetriebssystem',
                                    label: kijs.getText('Lieblingsbetriebssystem'),
                                    displayTextField: 'displayText',
                                    valueField: 'value',
                                    iconMapField: 'iconMap',
                                    data: [
                                        { displayText: 'Apple', iconMap: 'kijs.iconMap.Fa.apple', value: 1},
                                        { displayText: 'Linux', iconMap: 'kijs.iconMap.Fa.linux', value: 2},
                                        { displayText: 'Windows', iconMap: 'kijs.iconMap.Fa.windows', value: 3}
                                    ]
                                },


                                {
                                    xtype: 'kijs.gui.field.Display',
                                    value: kijs.getText('Bemerkungen'),
                                    cls: 'kijs-title'
                                },{
                                    xtype: 'kijs.gui.field.Memo',
                                    name: 'Bemerkungen',
                                    label: kijs.getText('Bemerkungen'),
                                    helpText: kijs.getText('Hier können Sie die Bemerkungen eintragen'),
                                    inputHeight: 50
                                }
                            ]
                        }
                    ],
                    
                    footerElements: [
                        '>',
                        {
                            xtype: 'kijs.gui.Button',
                            caption: kijs.getText('Leeren'),
                            on: {
                                click: function() {
                                    let form = this.upX('kijs.gui.Panel').downX('kijs.gui.container.Form');
                                    form.clear();
                                }
                            }
                        },{
                            xtype: 'kijs.gui.Button',
                            caption: kijs.getText('Validieren'),
                            on: {
                                click: function() {
                                    let form = this.upX('kijs.gui.Panel').downX('kijs.gui.container.Form');
                                    form.validate();
                                }
                            }
                        },{
                            xtype: 'kijs.gui.Button',
                            caption: kijs.getText('%1 prüfen', '', 'isDirty'),
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
                    caption: kijs.getText('Formular mit Definition über RPC'),
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
                            caption: kijs.getText('%1 laden', '', 'RPC'),
                            on: {
                                click: function() {
                                    let form = this.upX('kijs.gui.Panel').downX('kijs.gui.container.Form');
                                    form.load(null, true);
                                }
                            }
                        },{
                            xtype: 'kijs.gui.Button',
                            caption: kijs.getText('%1 speichern', '', 'RPC'),
                            on: {
                                click: function() {
                                    let form = this.upX('kijs.gui.Panel').downX('kijs.gui.container.Form');
                                    form.save();
                                }
                            }
                        },{
                            xtype: 'kijs.gui.Button',
                            caption: kijs.getText('Leeren'),
                            on: {
                                click: function() {
                                    let form = this.upX('kijs.gui.Panel').downX('kijs.gui.container.Form');
                                    form.clear();
                                }
                            }
                        },{
                            xtype: 'kijs.gui.Button',
                            caption: kijs.getText('Validieren'),
                            on: {
                                click: function() {
                                    let form = this.upX('kijs.gui.Panel').downX('kijs.gui.container.Form');
                                    form.validate();
                                }
                            }
                        },{
                            xtype: 'kijs.gui.Button',
                            caption: kijs.getText('%1 prüfen', '', 'isDirty'),
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
                    caption: kijs.getText('Formular mit flex-Containern'),
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
                                            value: kijs.getText('Adresse'),
                                            cls: 'kijs-title'
                                        },{
                                            xtype: 'kijs.gui.field.Combo',
                                            name: 'Anrede',
                                            label: kijs.getText('Anrede'),
                                            valueField: 'value',
                                            displayTextField: 'displayText',
                                            disableFlex: true,
                                            data: [
                                                {displayText: kijs.getText('Herr'), value: 'm' },
                                                {displayText: kijs.getText('Frau'), value: 'w'},
                                                {displayText: kijs.getText('Familie'), value: 'f'}
                                            ]
                                        },{
                                            xtype: 'kijs.gui.Container',
                                            cls: 'kijs-flexline',
                                            innerStyle: { gap: '0 20px' },
                                            elements:[
                                                {
                                                    xtype: 'kijs.gui.field.Text',
                                                    name: 'Vorname',
                                                    label: kijs.getText('Vorname'),
                                                    style: { flex: 1 }
                                                },{
                                                    xtype: 'kijs.gui.field.Text',
                                                    name: 'Name',
                                                    label: kijs.getText('Name'),
                                                    labelWidth: null,
                                                    style: { flex: 1 }
                                                }
                                            ]
                                        },{
                                            xtype: 'kijs.gui.field.Text',
                                            name: 'Strasse',
                                            label: kijs.getText('Strasse')
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
                                                    label: kijs.getText('Ort'),
                                                    labelWidth: null,
                                                    style: { flex: 1 }
                                                }
                                            ]
                                        },{
                                            xtype: 'kijs.gui.field.Combo',
                                            name: 'Land',
                                            label: kijs.getText('Land'),
                                            //rpc: 'default',
                                            rpcLoadFn: 'land.load',
                                            autoLoad: true,
                                            valueField: 'ISO',
                                            displayTextField: 'Land'
                                        }
                                    ]
                                },{
                                    xtype: 'kijs.gui.Container',
                                    elements:[
                                        {
                                            xtype: 'kijs.gui.field.Display',
                                            value: kijs.getText('Kontakt'),
                                            cls: 'kijs-title'
                                        },{
                                            xtype: 'kijs.gui.Container',
                                            cls: 'kijs-flexline',
                                            innerStyle: { gap: '0 20px' },
                                            elements:[
                                                {
                                                    xtype: 'kijs.gui.field.Phone',
                                                    name: 'TelefonP',
                                                    label: kijs.getText('Telefon P')
                                                },{
                                                    xtype: 'kijs.gui.field.Phone',
                                                    name: 'TelefonG',
                                                    label: kijs.getText('Telefon G'),
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
                                                    label: kijs.getText('Mobile P')
                                                },{
                                                    xtype: 'kijs.gui.field.Phone',
                                                    name: 'MobileG',
                                                    label: kijs.getText('Mobile G'),
                                                    labelWidth: 60
                                                }
                                            ]
                                        },{
                                            xtype: 'kijs.gui.field.Email',
                                            name: 'Email',
                                            label: kijs.getText('E-Mail')
                                        }
                                    ]
                                },{
                                    xtype: 'kijs.gui.Container',
                                    elements:[
                                        {
                                            xtype: 'kijs.gui.field.Display',
                                            value: kijs.getText('Weitere Angaben'),
                                            cls: 'kijs-title'
                                        },{
                                            xtype: 'kijs.gui.Container',
                                            cls: 'kijs-flexline',
                                            innerStyle: { gap: '0 20px' },
                                            elements:[
                                                {
                                                    xtype: 'kijs.gui.field.DateTime',
                                                    name: 'Geburtsdatum',
                                                    label: kijs.getText('Geburtsdatum'),
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
                                                    label: kijs.getText('Alter'),
                                                    readOnly: true,
                                                    disableFlex: true,
                                                    labelWidth: null,
                                                    inputWidth: 40
                                                }
                                            ]
                                        },{
                                            xtype: 'kijs.gui.field.Color',
                                            name: 'Lieblingsfarbe',
                                            label: kijs.getText('Lieblingsfarbe'),
                                            value: '#fff'
                                        },{
                                            xtype: 'kijs.gui.field.OptionGroup',
                                            name: 'LieblingsBetriebssystem',
                                            label: kijs.getText('Lieblingsbetriebssystem'),
                                            displayTextField: 'displayText',
                                            valueField: 'value',
                                            iconMapField: 'iconMap',
                                            data: [
                                                { displayText: 'Apple', iconMap: 'kijs.iconMap.Fa.apple', value: 1},
                                                { displayText: 'Linux', iconMap: 'kijs.iconMap.Fa.linux', value: 2},
                                                { displayText: 'Windows', iconMap: 'kijs.iconMap.Fa.windows', value: 3}
                                            ]
                                        }
                                    ]
                                },{
                                    xtype: 'kijs.gui.Container',
                                    elements:[
                                        {
                                            xtype: 'kijs.gui.field.Display',
                                            value: kijs.getText('Bemerkungen'),
                                            cls: 'kijs-title'
                                        },{
                                            xtype: 'kijs.gui.field.Memo',
                                            name: 'Bemerkungen',
                                            label: kijs.getText('Bemerkungen'),
                                            inputHeight: 50,
                                            helpText: kijs.getText('Hier können Sie die Bemerkungen eintragen')
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
                    { displayText: 'auto', value: 'auto' },
                    { displayText: 'left', value: 'left' },
                    { displayText: 'top', value: 'top' }
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