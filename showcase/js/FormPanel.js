/* global kijs */

window.sc = {};
sc.FormPanel = class sc_FormPanel {
    
    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        this._app = config.app;
        this._content = null;
    }
    
    // TODO: Beispiel mit Autoload in einem eigenen Tab
    
    
    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    getContent() {
        this._content = new kijs.gui.Panel({
            caption: 'kijs.gui.FormPanel',
            autoScroll: true,
            style: {
                flex: 1
            },
            innerStyle: {
                padding: '10px'
            },
            elements:[
                {
                    xtype: 'kijs.gui.FormPanel',
                    caption: 'Formular',
                    //rpc: this._app.rpc,
                    //autoLoad: false,
                    //facadeFnLoad: 'form.load',
                    //facadeFnSave: 'form.save',
                    shadow: true,
                    collapsible: 'top',
                    closable: true,
                    resizable: true,
                    autoScroll: true,
                    width: 600,
                    innerStyle: {
                        padding: '10px'
                    },
                    defaults: {
                        labelWidth: 100,
                        style: { maxWidth: '500px', marginBottom: '4px' },
                        required: true,
                        defaults: {
                            labelWidth: 100,
                            required: true
                        }
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
                            cls: 'kijs-flexrow',
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
                                    labelWidth: 45,
                                    style: { marginLeft:'20px', flex: 1 }
                                }
                            ]
                        },{
                            xtype: 'kijs.gui.field.Text',
                            name: 'Strasse',
                            label: 'Strasse'
                        },{
                            xtype: 'kijs.gui.Container',
                            cls: 'kijs-flexrow',
                            elements:[
                                {
                                    xtype: 'kijs.gui.field.Text',
                                    name: 'Plz',
                                    label: 'PLZ',
                                    width: 200,
                                    style: { flex: 'none' }
                                },{
                                    xtype: 'kijs.gui.field.Text',
                                    name: 'Ort',
                                    label: 'Ort',
                                    labelWidth: 30,
                                    style: { marginLeft:'20px', flex: 1 }
                                }
                            ]
                        },{
                            xtype: 'kijs.gui.field.Combo',
                            name: 'Land',
                            label: 'Land',
                            rpc: this._app.rpc,
                            facadeFnLoad: 'land.load',
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
                            cls: 'kijs-flexrow',
                            elements:[
                                {
                                    xtype: 'kijs.gui.field.Phone',
                                    name: 'TelefonP',
                                    label: 'Telefon P',
                                    style: { flex: 1 }
                                },{
                                    xtype: 'kijs.gui.field.Phone',
                                    name: 'TelefonG',
                                    label: 'Telefon G',
                                    labelWidth: 65,
                                    style: { marginLeft:'20px', flex: 1 }
                                }
                            ]
                        },{
                            xtype: 'kijs.gui.Container',
                            cls: 'kijs-flexrow',
                            elements:[
                                {
                                    xtype: 'kijs.gui.field.Phone',
                                    name: 'MobileP',
                                    label: 'Mobile P',
                                    style: { flex: 1 }
                                },{
                                    xtype: 'kijs.gui.field.Phone',
                                    name: 'MobileG',
                                    label: 'Mobile G',
                                    labelWidth: 65,
                                    style: { marginLeft:'20px', flex: 1 }
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
                            cls: 'kijs-flexrow',
                            elements:[
                                {
                                    xtype: 'kijs.gui.field.DateTime',
                                    name: 'Geburtsdatum',
                                    label: 'Geburtsdatum',
                                    mode: 'date',
                                    on: {
                                        change: function(e) {
                                            e.element.next.value = this._calculateAge(e.value);
                                        },
                                        context: this
                                    }
                                },{
                                    xtype: 'kijs.gui.field.Text',
                                    name: 'Alter',
                                    label: 'Alter',
                                    disableFlex: true,
                                    width: 80,
                                    labelWidth: 35,
                                    readOnly: true,
                                    style: { marginLeft:'20px' }
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
                            height: 50,
                            helpText: 'Hier können Sie die Bermerkungen eintragen'
                        }
                    ],
                    
                    footerElements: [
                        {
                            xtype: 'kijs.gui.Button',
                            caption: 'Validieren',
                            on: {
                                click: function() {
                                    this.upX('kijs.gui.FormPanel').validate();
                                }
                            }
                        },{
                            xtype: 'kijs.gui.Button',
                            name: 'btnReadOnly',
                            caption: 'ReadOnly',
                            on: {
                                click: function() {
                                    this.parent.parent.readOnly = true;
                                    this.disabled = true;
                                    this.parent.down('btnEnable').disabled = false;
                                }
                            }
                        },{
                            xtype: 'kijs.gui.Button',
                            name: 'btnDisable',
                            caption: 'Deaktivieren',
                            on: {
                                click: function() {
                                    this.upX('kijs.gui.FormPanel').disabled = true;
                                    this.disabled = true;
                                    this.parent.down('btnEnable').disabled = false;
                                }
                            }
                        },{
                            xtype: 'kijs.gui.Button',
                            name: 'btnEnable',
                            caption: 'Aktivieren',
                            disabled: true,
                            on: {
                                click: function() {
                                    kijs.Array.each(this.parent.parent.elements, function(element) {
                                        if (element instanceof kijs.gui.field.Field) {
                                            element.readOnly = false;
                                        }
                                    }, this);
                                    this.upX('kijs.gui.FormPanel').disabled = false;
                                    this.disabled = true;
                                    this.parent.down('btnReadOnly').disabled = false;
                                    this.parent.down('btnDisable').disabled = false;
                                }
                            }
                        }
                    ]
                },
                
                {
                    xtype: 'kijs.gui.FormPanel',
                    caption: 'Formular mit definition über RPC',
                    rpc: this._app.rpc,
                    autoLoad: true,
                    facadeFnLoad: 'form.load',
                    facadeFnSave: 'form.save',
                    shadow: true,
                    collapsible: 'top',
                    closable: true,
                    resizable: true,
                    autoScroll: true,
                    width: 600,
                    style: {
                        marginTop: '10px'
                    },
                    innerStyle: {
                        padding: '10px'
                    },
                    defaults: {
                        labelWidth: 100,
                        style: { maxWidth: '500px', marginBottom: '4px' },
                        required: true,
                        defaults: {
                            labelWidth: 100,
                            required: true
                        }
                    },
                    
                    footerElements: [
                        {
                            xtype: 'kijs.gui.Button',
                            name: 'btnLoad',
                            caption: 'RPC Load',
                            on: {
                                click: function() {
                                    this.upX('kijs.gui.FormPanel').load(null, true);
                                }
                            }
                        },{
                            xtype: 'kijs.gui.Button',
                            name: 'btnSave',
                            caption: 'RPC Save',
                            on: {
                                click: function() {
                                    this.upX('kijs.gui.FormPanel').save();
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
                            name: 'btnReadOnly',
                            caption: 'ReadOnly',
                            on: {
                                click: function() {
                                    this.parent.parent.readOnly = true;
                                    this.disabled = true;
                                    this.parent.down('btnEnable').disabled = false;
                                }
                            }
                        },{
                            xtype: 'kijs.gui.Button',
                            name: 'btnDisable',
                            caption: 'Deaktivieren',
                            on: {
                                click: function() {
                                    this.upX('kijs.gui.FormPanel').disabled = true;
                                    this.disabled = true;
                                    this.parent.down('btnEnable').disabled = false;
                                }
                            }
                        },{
                            xtype: 'kijs.gui.Button',
                            name: 'btnEnable',
                            caption: 'Aktivieren',
                            disabled: true,
                            on: {
                                click: function() {
                                    kijs.Array.each(this.parent.parent.elements, function(element) {
                                        if (element instanceof kijs.gui.field.Field) {
                                            element.readOnly = false;
                                        }
                                    }, this);
                                    this.upX('kijs.gui.FormPanel').disabled = false;
                                    this.disabled = true;
                                    this.parent.down('btnReadOnly').disabled = false;
                                    this.parent.down('btnDisable').disabled = false;
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
    
    
    _calculateAge(birthday) {
        birthday = kijs.Date.create(birthday);
        const ageDifMs = Date.now() - birthday.getTime();
        const ageDate = new Date(ageDifMs);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    }
    

    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct() {
        this._content = null;
    }
};