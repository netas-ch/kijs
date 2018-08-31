/* global kijs */

// --------------------------------------------------------------
// kit.App
// --------------------------------------------------------------
kit = {};
kit.App = class kit_App {

    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {

        // RPC-Instanz
        var rpcConfig = {};
        if (config.ajaxUrl) {
            rpcConfig.url = config.ajaxUrl;
        }
        this._rpc = new kijs.gui.Rpc(rpcConfig);
    }


    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    run() {
        let _this = this;
        
        // ViewPort erstellen
        let viewport = new kijs.gui.ViewPort({
            cls: 'kijs-flexcolumn',
            elements: [                
                // TOP
                {
                    xtype: 'kijs.gui.Panel',
                    caption: 'kijs the new aera of multidevice apps',
                    iconCls: 'icoWizard16',
                    collapsible: 'top',
                    collapsed: true,
                    height: 300,
                    style: {
                        margin: '0 0 4px 0'
                    },
                    headerBarElements:[
                        {
                            xtype: 'kijs.gui.Button',
                            iconChar: '&#xf059'
                        },{
                            xtype: 'kijs.gui.Button',
                            iconChar: '&#xf059',
                            disabled: true
                        }
                    ],
                    elements:[
                        /*{
                            xtype: 'kijs.gui.DatePicker',
                            value: '2017-07-13'
                        }*/
                    ]
                },{
                    xtype: 'kijs.gui.Container',
                    cls: 'kijs-flexrow',
                    style: {
                        flex: 1,
                        minHeight: '40px'
                    },
                    elements: [
                        // LEFT
                        {
                            xtype: 'kijs.gui.Panel',
                            caption: 'Navigation',
                            iconChar: '&#xf110',
                            iconCls: 'kijs-pulse',
                            collapsible: 'left',
                            width: 180,
                            cls: 'kijs-flexcolumn',
                            elements:[
                                /*{
                                    xtype: 'kijs.gui.Accordion',
                                    currentElement: 0,
                                    style: {
                                        flex: '1 1 auto'
                                    },
                                    elements:[
                                        {
                                            xtype: 'kijs.gui.Panel',
                                            caption: 'Accordion 1',
                                            styleInner: {
                                                overflowY: 'auto'
                                            },
                                            elements:[
                                                {
                                                    xtype: 'kijs.gui.BoxElement',
                                                    height: 400,
                                                    style: { backgroundColor: '#ccf'}
                                                }
                                            ]
                                        },{
                                            xtype: 'kijs.gui.Panel',
                                            caption: 'Accordion 2',
                                            styleInner: {
                                                overflowY: 'auto'
                                            },
                                            elements:[
                                                {
                                                    xtype: 'kijs.gui.BoxElement',
                                                    height: 400,
                                                    style: { backgroundColor: '#cfc'}
                                                }
                                            ]
                                        },{
                                            xtype: 'kijs.gui.Panel',
                                            caption: 'Accordion 3',
                                            styleInner: {
                                                overflowY: 'auto'
                                            },
                                            elements:[
                                                {
                                                    xtype: 'kijs.gui.BoxElement',
                                                    height: 400,
                                                    style: { backgroundColor: '#fcc'}
                                                }
                                            ]
                                        }
                                    ]
                                }*/
                            ]
                        },{
                            xtype: 'kijs.gui.Splitter',
                            targetPos: 'left'
                        },
                        // CENTER
                        {
                            xtype: 'kijs.gui.Panel',
                            caption: 'Formular',
                            iconChar: '&#xf2bc',
                            footerCaption: 'FooterBar',
                            style: {
                                flex: 1,
                                minWidth: '40px'
                            },
                            innerStyle: {
                                padding: '10px',
                                overflowY: 'auto'
                            },
                            headerBarElements:[
                                {
                                    xtype: 'kijs.gui.Button',
                                    iconChar: '&#xf085'
                                }
                            ],
                            headerElements: [
                                {
                                    xtype: 'kijs.gui.ButtonGroup',
                                    caption: 'Funktionen',
                                    width: 240,
                                    height: 150,
                                    innerStyle: {
                                        columnCount: 3
                                    },
                                    elements: [
                                        {
                                            xtype: 'kijs.gui.Button',
                                            caption: 'Neu',
                                            iconChar: '&#xf0c7',
                                            height: 120
                                        },{
                                            xtype: 'kijs.gui.Button',
                                            caption: 'Duplizieren',
                                            iconChar: '&#xf0c7'
                                        },{
                                            xtype: 'kijs.gui.Button',
                                            caption: 'Aktionen',
                                            iconChar: '&#xf02f'
                                        },{
                                            xtype: 'kijs.gui.Button',
                                            caption: 'Löschen',
                                            iconChar: '&#xf0c7'
                                        },{
                                            xtype: 'kijs.gui.Button',
                                            caption: 'Address Load',
                                            on: {
                                                click: function() {
                                                    //let addressPanel = this.parent.parent.parent.getElementByName('addressPanel');
                                                    //addressPanel.load(1);
                                                }
                                            }
                                        }
                                    ]
                                }
                            ],
                            elements: [
                                {
                                    xtype: 'kijs.gui.FormPanel',
                                    name: 'addressPanel',
                                    caption: 'Adresse',
                                    closable: true,
                                    collapsible: 'top',
                                    resizable: true,
                                    height: 300,
                                    shadow: true,
                                    autoLoad: false,
                                    rpc: this._rpc,
                                    waitMaskTargetDomProperty: 'innerDom',
                                    facadeFnLoad: 'address.load',
                                    facadeFnSave: 'address.save',
                                    innerStyle: {
                                        padding: '10px',
                                        overflowY: 'auto'
                                    },
                                    defaults: {
                                        labelWidth: 110,
                                        required: true,
                                        maxLength: 50,
                                        style: {marginBottom: '4px'}
                                    },
                                    elements: [
                                        /*{
                                            xtype: 'kijs.gui.field.Date',
                                            name: 'Datum',
                                            label: 'Datum',
                                            value: '2017-07-28',
                                            weekSelect: false,
                                            width: 230
                                        },*/{
                                            xtype: 'kijs.gui.field.Password',
                                            name: 'Passwort',
                                            label: 'Passwort',
                                            disableBrowserSecurityWarning: false,
                                            width: 200,
                                            on: {
                                                input: function(e) {
                                                    this.parent.down('Feld 1').value = this.value;
                                                }
                                            }
                                        },{
                                            xtype: 'kijs.gui.field.Checkbox',
                                            name: 'Checkbox',
                                            label: 'Label',
                                            caption: 'Caption',
                                            valueChecked: 'Individueller Wert',
                                            value: true,
                                            //width: 400,
                                            on: {
                                                input: function(e) {
                                                    console.log('input:' + this.value);
                                                }
                                            },
                                            elements: [
                                                {
                                                    xtype: 'kijs.gui.Button',
                                                    iconChar: '&#xf0d0',
                                                    toolTip: 'test',
                                                    on: {
                                                        click: function() {
                                                            let chkBox = this.upX('kijs.gui.field.Checkbox');
                                                            console.log(chkBox.value);
                                                            chkBox.value = !chkBox.value;
                                                            console.log(chkBox.value);
                                                        }
                                                    }
                                                }
                                            ]
                                        },/*{
                                            xtype: 'kijs.gui.field.CheckboxGroup',
                                            name: 'CheckboxGroup',
                                            label: 'CheckboxGroup',
                                            idField: 'id',
                                            captionField: 'Bezeichnung',
                                            data: new kijs.Data({
                                                rows:[
                                                    {id:1, Bezeichnung:'Wert A'}, 
                                                    {id:2, Bezeichnung:'Wert B'}, 
                                                    {id:3, Bezeichnung:'Wert C'}
                                                ]
                                            }),
                                            value: [2,3],
                                            on: {
                                                input: function(e, el) {
                                                    console.log(this.getValue());
                                                }
                                            },
                                            elements: [
                                                {
                                                    xtype: 'kijs.gui.Button',
                                                    iconChar: '&#xf0d0',
                                                    toolTip: 'test',
                                                    on: {
                                                        click: function() {
                                                            let val = this.parent.value;
                                                            if (kijs.isEmpty(val)) {
                                                                val = 0;
                                                            } else {
                                                                val = val[0];
                                                            }
                                                            val++;
                                                            if (val > 3) {
                                                                val = null;
                                                            }
                                                            if (!kijs.isEmpty(val)) {
                                                                val = [val];
                                                            }
                                                            this.parent.value = val;
                                                        }
                                                    }
                                                }
                                            ]
                                        },{
                                            xtype: 'kijs.gui.field.CheckboxGroup',
                                            name: 'CheckboxGroupInline',
                                            label: 'CheckboxGroup Inline',
                                            cls: 'kijs-inline',
                                            idField: 'id',
                                            captionField: 'caption',
                                            data: new kijs.Data({
                                                rows:[
                                                    {id:1, caption:'Wert A'}, 
                                                    {id:2, caption:'Wert B'}, 
                                                    {id:3, caption:'Wert C'}
                                                ]
                                            }),
                                            value: [3]
                                        },{
                                            xtype: 'kijs.gui.field.RadioGroup',
                                            name: 'RadioGroup',
                                            label: 'RadioGroup',
                                            idField: 'id',
                                            captionField: 'caption',
                                            data: [
                                                {id:1, caption:'Wert A'},
                                                {id:2, caption:'Wert B'},
                                                {id:3, caption:'Wert C'}
                                            ],
                                            value: 2,
                                            on: {
                                                input: function(e, el) {
                                                    console.log('input:' + this.getValue());
                                                }
                                            },
                                            elements: [
                                                {
                                                    xtype: 'kijs.gui.Button',
                                                    iconChar: '&#xf0d0',
                                                    toolTip: 'test',
                                                    on: {
                                                        click: function() {
                                                            let val = this.parent.value;
                                                            val++;
                                                            if (val > 3) {
                                                                val = null;
                                                            }
                                                            this.parent.value = val;
                                                            this.toolTip = this.parent.value;
                                                        }
                                                    }
                                                }
                                            ]
                                        },{
                                            xtype: 'kijs.gui.field.RadioGroup',
                                            name: 'RadioGroupInline',
                                            label: 'RadioGroup Inline',
                                            cls: 'kijs-inline',
                                            data: ['1', '2', '3'],
                                            value: 2,
                                            on: {
                                                input: function(e, el) {
                                                    console.log('input:' + this.getValue());
                                                }
                                            },
                                            elements: [
                                                {
                                                    xtype: 'kijs.gui.Button',
                                                    iconChar: '&#xf0d0',
                                                    toolTip: 'test',
                                                    on: {
                                                        click: function() {
                                                            let val = this.parent.value;
                                                            val++;
                                                            if (val > 3) {
                                                                val = null;
                                                            }
                                                            this.parent.value = val;
                                                            this.toolTip = this.parent.value;
                                                        }
                                                    }
                                                }
                                            ]
                                        },*/{
                                            xtype: 'kijs.gui.field.Text',
                                            name: 'Feld 1',
                                            label: 'Feld <b>1</b>',
                                            labelHtmlDisplayType : 'html',
                                            value: 'Hallo Welt 1',
                                            helpText: 'Hilfe Text!',
                                            elements: [
                                                {
                                                    xtype: 'kijs.gui.Button',
                                                    iconChar: '&#xf0d0',
                                                    toolTip: 'Feld leeren',
                                                    on: {
                                                        click: function() {
                                                            this.parent.value = '';
                                                        }
                                                    }
                                                }
                                            ]
                                        },{
                                            xtype: 'kijs.gui.field.Text',
                                            name: 'Feld 2',
                                            label: 'Feld <b>2</b>',
                                            labelHtmlDisplayType : 'code',
                                            value: 'Hallo Welt 2',
                                            elements:[
                                                {
                                                    xtype: 'kijs.gui.Button',
                                                    iconChar: '&#xf0d0',
                                                    caption: 'neuer Wert',
                                                    on: {
                                                        click: function() {
                                                            this.parent.value = 'neuer Wert';
                                                        }
                                                    }
                                                }
                                            ]
                                        }, new kijs.gui.field.Text({
                                            name: 'Feld 3',
                                            label: 'Feld <b>3</b>',
                                            labelWidth: 110,
                                            labelHtmlDisplayType : 'text'
                                        }),{
                                            xtype: 'kijs.gui.field.Combo',
                                            name: 'Anrede',
                                            label: 'Anrede',
                                            optionCaptionDisplayType: 'html',
                                            value: 'w',
                                            data: [
                                                {caption: 'Herr', value: 'm'},
                                                {caption: 'Frau', value: 'w'},
                                                {caption: 'Familie', value: 'f'}
                                            ],
                                            elements: [
                                                {
                                                    xtype: 'kijs.gui.Button',
                                                    iconChar: '&#xf00d',
                                                    on: {
                                                        click: function() {
                                                            this.parent.value = '';
                                                        }
                                                    }
                                                }
                                            ]
                                        },{
                                            xtype: 'kijs.gui.field.Combo',
                                            name: 'Land',
                                            label: 'Land',
                                            rpc: this._rpc,
                                            facadeFnLoad: 'land.load',
                                            autoLoad: true,
                                            value: 'CH'
                                        }/*,{
                                            xtype: 'kijs.gui.field.Editor',
                                            name: 'editor',
                                            label: 'Editor',
                                            mode: 'javascript',
                                            value: 'function test(x) {\n    console.log(x);\n}\n\ntest("Hallo Welt!");\nFehler',
                                            height: 100
                                        }*/,{
                                            xtype: 'kijs.gui.field.Memo',
                                            name: 'Bemerkungen',
                                            label: 'Bemerkungen (test)',
                                            value: 'Dieses Bemerkungsfeld hat\nmehrere Zeilen!',
                                            helpText: 'Bitte geben Sie hier Ihre Bemerkungen ein!'
                                        }
                                    ],
                                    footerStyle: {
                                        padding: '10px'
                                    },
                                    footerElements: [
                                        {
                                            xtype: 'kijs.gui.Button',
                                            caption: 'Menü',
                                            iconChar: '&#xf0d7',
                                            on: {
                                                click: function() {
                                                    /*if (!this.menu) {
                                                        this.menu = new kijs.gui.menu.Menu({
                                                            targetEl: this,
                                                            width: 100,
                                                            defaults: {
                                                                xtype: 'kijs.gui.Button',
                                                                style: {
                                                                    width: '100%'
                                                                }
                                                            },
                                                            elements: [
                                                                { caption: 'Punkt 1 ' },
                                                                { caption: 'Punkt 2' },
                                                                { 
                                                                    caption: 'Sub Menü', 
                                                                    iconChar: '&#xf105',
                                                                    on: {
                                                                        click: function() {
                                                                            if (!this.subMenu) {
                                                                                this.subMenu = new kijs.gui.menu.Menu({
                                                                                    parentMenu: this.parent,
                                                                                    targetEl: this,
                                                                                    targetPos: 'tr',
                                                                                    width: 100,
                                                                                    defaults: {
                                                                                        xtype: 'kijs.gui.Button',
                                                                                        style: {
                                                                                            width: '100%'
                                                                                        }
                                                                                    },
                                                                                    elements: [
                                                                                        { caption: 'Punkt 1' },
                                                                                        { caption: 'Punkt 2' },
                                                                                        { caption: 'Punkt 3' }
                                                                                    ]
                                                                                });
                                                                            }
                                                                            this.subMenu.show();
                                                                        }
                                                                    }
                                                                },
                                                                { caption: 'Punkt 3' }
                                                            ]
                                                        });
                                                    }
                                                    this.menu.show();*/
                                                }
                                            }
                                        },{
                                            xtype: 'kijs.gui.Button',
                                            caption: 'Menü',
                                            iconChar: '&#xf0d8',
                                            on: {
                                                click: function() {
                                                    /*if (!this.menu) {
                                                        this.menu = new kijs.gui.menu.Menu({
                                                            targetEl: this,
                                                            targetPos: 'tl',
                                                            pos: 'bl',
                                                            innerStyle: {
                                                                padding: '10px'
                                                            },
                                                            html: 'Ich bin ein Menü mit etwas HTML-Inhalt<br>Bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla.'
                                                        });
                                                    }
                                                    this.menu.show();*/
                                                }
                                            }
                                        },{
                                            xtype: 'kijs.gui.Button',
                                            name: 'btnLoad',
                                            caption: 'RPC Load',
                                            on: {
                                                click: function() {
                                                    this.upX('kijs.gui.FormPanel').load();
                                                }
                                            }
                                        },{
                                            xtype: 'kijs.gui.Button',
                                            caption: 'Validieren',
                                            toolTip: 'Da darfst Du nicht draufdrücken!',
                                            on: {click: function() {
                                                this.toolTip = 'Nein, er hat es tatsächlich getan!';
                                                kijs.Array.each(this.parent.parent.elements, function(element) {
                                                    if (element instanceof kijs.gui.field.Field) {
                                                        element.validate();
                                                    }
                                                }, this);
                                            }}
                                        },{
                                            xtype: 'kijs.gui.Button',
                                            name: 'btnReadOnly',
                                            caption: 'ReadOnly',
                                            on: {click: function() {
                                                kijs.Array.each(this.parent.parent.elements, function(element) {
                                                    if (element instanceof kijs.gui.field.Field) {
                                                        element.readOnly = true;
                                                    }
                                                }, this);
                                                this.disabled = true;
                                                this.parent.down('btnEnable').disabled = false;
                                            }}
                                        },{
                                            xtype: 'kijs.gui.Button',
                                            name: 'btnDisable',
                                            caption: 'Deaktivieren',
                                            on: {click: function() {
                                                kijs.Array.each(this.parent.parent.elements, function(element) {
                                                    if (element instanceof kijs.gui.field.Field) {
                                                        element.disabled = true;
                                                    }
                                                }, this);
                                                this.disabled = true;
                                                this.parent.down('btnEnable').disabled = false;
                                            }}
                                        },{
                                            xtype: 'kijs.gui.Button',
                                            name: 'btnEnable',
                                            caption: 'Aktivieren',
                                            disabled: true,
                                            on: {click: function() {
                                                kijs.Array.each(this.parent.parent.elements, function(element) {
                                                    if (element instanceof kijs.gui.field.Field) {
                                                        element.readOnly = false;
                                                        element.disabled = false;
                                                    }
                                                }, this);
                                                this.disabled = true;
                                                this.parent.down('btnReadOnly').disabled = false;
                                                this.parent.down('btnDisable').disabled = false;
                                            }}
                                        },{
                                            xtype: 'kijs.gui.Button',
                                            name: 'btnRpc',
                                            caption: 'RPC',
                                            on: {
                                                click: function() {
                                                    _this._rpc.do('test.test', 'data', function(response){
                                                        // nix
                                                    }, _this, true, this.parent.parent, 'innerDom');
                                                }
                                            }
                                        }
                                    ]

                                },{
                                    xtype: 'kijs.gui.FormPanel',
                                    rpc: this._rpc,
                                    facadeFnLoad: 'test.load',
                                    facadeFnSave: 'test.save',
                                    shadow: true,
                                    style: {
                                        marginTop: '10px'
                                    },
                                    innerStyle: {
                                        padding: '10px',
                                        overflowY: 'auto'
                                    },
                                    defaults: {
                                        labelWidth: 100,
                                        required: true,
                                        maxLength: 50,
                                        style: {marginBottom: '4px'}
                                    },
                                    on: {
                                        afterSave: function(e) {
                                            kijs.gui.CornerTipContainer.show('Info', 'Speichern erfolgreich.' , 'info');
                                        },
                                        enterPress: function(e) { console.log("Panel: enterPress"); }
                                    },
                                    elements: [
                                        {
                                            xtype: 'kijs.gui.field.Memo',
                                            name: 'Bemerkungen',
                                            label: 'Bemerkungen (test)',
                                            value: 'Dieses Bemerkungsfeld hat\nmehrere Zeilen!',
                                            helpText: 'Bitte geben Sie hier Ihre Bemerkungen ein!',
                                            height: 100,
                                            on: {
                                                enterPress: function(e) {
                                                    console.log('Memo: enterPress');
                                                }
                                            }
                                        }
                                    ],
                                    footerStyle: {
                                        padding: '10px'
                                    },
                                    footerElements: [
                                        {
                                            xtype: 'kijs.gui.Button',
                                            name: 'btnLoad',
                                            caption: 'Load',
                                            on: {
                                                click: function() {
                                                    this.parent.parent.load(1);
                                                }
                                            }
                                        },{
                                            xtype: 'kijs.gui.Button',
                                            name: 'btnSave',
                                            caption: 'Save',
                                            on: {
                                                click: function() {
                                                    this.parent.parent.save(1);
                                                }
                                            }
                                        }
                                    ]
                                },{
                                    xtype: 'kijs.gui.Panel',
                                    caption: 'Panel 2',
                                    closable: true,
                                    collapsible: 'top',
                                    resizable: true,
                                    maximizable: true,
                                    height: 200,
                                    shadow: true,
                                    cls: 'kijs-flexrow',
                                    style: {
                                        marginTop: '10px'
                                    },
                                    /*innerStyle: {
                                        padding: '10px',
                                        overflowY: 'auto'
                                    },*/
                                    elements: [
                                        {
                                            xtype: 'kijs.gui.DataView',
                                            selectType: 'multi',
                                            rpc: this._rpc,
                                            //data: [{A:'A1', B:'B1'}, {A:'A2', B:'B2'}],
                                            autoLoad: true,
                                            facadeFnLoad: 'dataview.load',
                                            waitMaskTargetDomProperty: 'innerDom',
                                            style: {
                                                flex: 1
                                            },
                                            innerStyle: {
                                                padding: '10px',
                                                overflowY: 'auto'
                                            }
                                        }
                                    ],
                                    footerStyle: {
                                        padding: '10px'
                                    },
                                    footerElements: [
                                        {
                                            xtype: 'kijs.gui.Button',
                                            caption: 'Alert',
                                            on: {click: function() {
                                                kijs.gui.MsgBox.alert('Test', 'Alert! Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans...', function(e, el) {
                                                    kijs.gui.MsgBox.alert('Es wurde geklickt auf', e.btn);
                                                });
                                            }}
                                        },{
                                            xtype: 'kijs.gui.Button',
                                            caption: 'Info',
                                            on: {click: function() {
                                                kijs.gui.MsgBox.info('Test', 'Info!', function(e) {
                                                    kijs.gui.MsgBox.alert('Es wurde geklickt auf', e.btn);
                                                });
                                            }}
                                        },{
                                            xtype: 'kijs.gui.Button',
                                            caption: 'Warning',
                                            on: {click: function() {
                                                kijs.gui.MsgBox.warning('Test', 'Warning!', function(e) {
                                                    kijs.gui.MsgBox.alert('Es wurde geklickt auf', e.btn);
                                                });
                                            }}
                                        },{
                                            xtype: 'kijs.gui.Button',
                                            caption: 'Error',
                                            on: {click: function() {
                                                kijs.gui.MsgBox.error('Test', 'Error!', function(e) {
                                                    kijs.gui.MsgBox.alert('Es wurde geklickt auf', e.btn);
                                                });
                                            }}
                                        },{
                                            xtype: 'kijs.gui.Button',
                                            caption: 'Confirm',
                                            on: {click: function() {
                                                kijs.gui.MsgBox.confirm('Test', 'Confirm!', function(e) {
                                                    kijs.gui.MsgBox.alert('Es wurde geklickt auf ', e.btn);
                                                });
                                            }}
                                        },{
                                            xtype: 'kijs.gui.Button',
                                            caption: 'CornerTip',
                                            on: {
                                                click: function() {
                                                    if (!this.___cornerTipIcon || this.___cornerTipIcon === 'error') {
                                                        this.___cornerTipIcon = 'alert';
                                                    } else if (this.___cornerTipIcon === 'alert') {
                                                        this.___cornerTipIcon = 'info';
                                                    } else if (this.___cornerTipIcon === 'info') {
                                                        this.___cornerTipIcon = 'warning';
                                                    } else if (this.___cornerTipIcon === 'warning') {
                                                        this.___cornerTipIcon = 'error';
                                                    }
                                                    
                                                    kijs.gui.CornerTipContainer.show('Test', 'Meine Nachricht!', this.___cornerTipIcon);
                                                },
                                                context: this
                                            }
                                        }
                                    ]
                                }
                            ],
                            footerStyle: {
                                padding: '10px'
                            },
                            footerElements: [
                                {
                                    xtype: 'kijs.gui.Button',
                                    caption: 'Fenster',
                                    iconChar: '&#xf2d0',
                                    on: {click: function() {
                                        let window = new kijs.gui.Window({
                                            caption: 'Fenster',
                                            iconChar: '&#xf2d0',
                                            collapsible: 'top',
                                            modal: false,
                                            height: 200,
                                            width: 250,
                                            innerStyle: {
                                                padding: '10px'
                                            },
                                            elements:[
                                                /*{
                                                    xtype: 'kijs.gui.field.Memo',
                                                    value: 'Bemerkungsfeld',
                                                    height: 100
                                                }*/
                                            ],
                                            footerStyle: {
                                                padding: '10px'
                                            },
                                            footerElements:[
                                                {
                                                    xtype: 'kijs.gui.Button',
                                                    caption: 'OK',
                                                    isDefault: true,
                                                    on: {click: function() {
                                                        kijs.gui.MsgBox.warning('Warnung', 'Wirklich schliessen?', function(e) {
                                                            if (e.btn === 'ok') {
                                                                window.destruct();
                                                            }
                                                        });
                                                    }}
                                                }
                                            ]
                                        });
                                        window.show();
                                    }}
                                },{
                                    xtype: 'kijs.gui.Button',
                                    caption: 'Fenster modal',
                                    iconChar: '&#xf2d0',
                                    on: {click: function() {
                                        let window = new kijs.gui.Window({
                                            caption: 'Fenster',
                                            iconChar: '&#xf2d0',
                                            collapsible: 'top',
                                            modal: true,
                                            height: 160,
                                            width: 210,
                                            innerStyle: {
                                                padding: '10px'
                                            },
                                            elements: [
                                                {
                                                    xtype: 'kijs.gui.Button',
                                                    caption: 'weiteres Fenster',
                                                    iconChar: '&#xf2d0'
                                                }
                                            ]
                                        });
                                        window.show();
                                        window.elements[0].on('click', function() {
                                            let window2 = new kijs.gui.Window({
                                                caption: 'Fenster',
                                                iconChar: '&#xf2d0',
                                                collapsible: 'top',
                                                //modal: true,
                                                target: window.dom.node.parentNode,
                                                height: 160,
                                                width: 210
                                            });
                                            window2.show();
                                        }, this);
                                    }}
                                },{
                                    xtype: 'kijs.gui.Button',
                                    caption: 'Fenster modal mit target+maximiert',
                                    iconChar: '&#xf2d0',
                                    on: {click: function() {
                                        let window = new kijs.gui.Window({
                                            target: this.parent.parent.down('addressPanel'),
                                            targetDomProperty: 'innerDom',
                                            caption: 'Fenster',
                                            iconChar: '&#xf2d0',
                                            collapsible: 'top',
                                            maximized: true,
                                            modal: true,
                                            height: 170,
                                            width: 220
                                        });
                                        window.show();
                                    }}
                                },{
                                    xtype: 'kijs.gui.Button',
                                    caption: 'Lademaske',
                                    iconChar: '&#xf1ce',
                                    on: {click: function() {
                                        let addressPanel = this.parent.parent.down('addressPanel');
                                        addressPanel.displayWaitMask = !addressPanel.displayWaitMask;
                                    }}
                                },{
                                    xtype: 'kijs.gui.Button',
                                    caption: 'Neu laden',
                                    iconChar: '&#xf021',
                                    on: {click: function() {
                                        location.reload();
                                    }}
                                },{
                                    xtype: 'kijs.gui.Button',
                                    caption: 'Schliessen',
                                    iconChar: '&#xf00d',
                                    on: {click: function() {
                                        viewport.destruct();
                                    }}
                                }
                            ],
                            footerBarElements:[
                                {
                                    xtype: 'kijs.gui.Button',
                                    iconChar: '&#xf085'
                                }
                            ]

                        },
                        // RIGHT
                        {
                            xtype: 'kijs.gui.Splitter',
                            targetPos: 'right'
                        },{
                            xtype: 'kijs.gui.Panel',
                            caption: 'Vorschau',
                            iconChar: '&#xf2c8',
                            collapsible: 'right',
                            width: 240,
                            cls: 'kijs-flexrow',
                            headerBarElements:[
                                {
                                    xtype: 'kijs.gui.Button',
                                    iconChar: '&#xf02f',
                                    on: {
                                        click: function(e, el) {
                                            let editor = el.parent.parent.up('editor');
                                            console.log(editor.getValue());
                                        }
                                    }
                                }
                            ],
                            elements:[
                                /*{
                                    xtype: 'kijs.gui.field.Editor',
                                    name: 'editor',
                                    hideLabel: true,
                                    mode: 'javascript',
                                    value: 'function test(x) {\n    console.log(x);\n}\n\ntest("Hallo Welt!");',
                                    style: {
                                        flex: '1 1 auto'
                                    }
                                }*/
                            ]
                        }
                    ]
                },
                // BOTTOM
                {
                    xtype: 'kijs.gui.Splitter',
                    targetPos: 'bottom'
                },{
                    xtype: 'kijs.gui.Panel',
                    caption: 'Panel Süd',
                    collapsible: 'bottom',
                    collapsed: true,
                    height: 200,
                    elements: [
                        {
                            xtype: 'kijs.gui.Element',
                            style: {
                                margin: '4px 0 0 4px'
                            }
                        },{
                            xtype: 'kijs.gui.Button',
                            caption: 'set html',
                            on: {
                                click: function(e) {
                                    this.__testState = this.__testState || 0;
                                    let el = this.parent.elements[0];
                                    let html = 'Text mit <span style="color:#f00">Formatierung</span>';
                                    switch (this.__testState) {
                                        case 0: 
                                            el.htmlDisplayType = 'html';
                                            el.html = html;
                                            this.caption = 'code'; 
                                            break;
                                        case 1:
                                            el.htmlDisplayType = 'code';
                                            el.html = html;
                                            this.caption = 'text'; 
                                            break;
                                        case 2:
                                            el.htmlDisplayType = 'text';
                                            el.html = html;
                                            this.caption = 'html'; 
                                            break;
                                    }
                                    this.__testState++;
                                    if (this.__testState > 2) {
                                        this.__testState = 0;
                                    }
                                }
                            }
                        }
                    ]
                }
            ]
        });
        viewport.render();
    }
    
    
    rpc(facadeFn, data, fn, context, cancelRunningRpcs, waitMaskTarget, waitMaskTargetDomPropertyName='dom', ignoreWarnings, fnBeforeDisplayError) {
        this._rpc.do(facadeFn, data, fn, context, cancelRunningRpcs, waitMaskTarget, waitMaskTargetDomPropertyName, ignoreWarnings, fnBeforeDisplayError);
    }
    
    /*_rpc(facadeFn, data, fn, context, cancelRunningRpcs, waitMaskTarget, ignoreWarnings) {
        
        // Lademaske anzeigen
        let waitMask;
        if (waitMaskTarget instanceof kijs.gui.Element) {
            waitMask = waitMaskTarget.waitMaskAdd();
        } else {
            waitMask = new kijs.gui.Mask({
                displayWaitIcon: true,
                target: waitMaskTarget
            });
            waitMask.show();
        }
    
        this._rpc.do(facadeFn, data, function(response, request) {
            
            // Lademaske entfernen
            if (request.responseArgs && request.responseArgs.waitMask) {
                if (request.responseArgs.waitMask.target instanceof kijs.gui.Element) {
                    request.responseArgs.waitMask.target.waitMaskRemove();
                } else {
                    request.responseArgs.waitMask.destruct();
                }
            }
            
            if (!response.canceled) {
                // Fehler --> FehlerMsg + Abbruch
                // data.errorMsg (String oder Array mit Strings, die mit Aufzählungszeichen angezeigt werden)
                if (!kijs.isEmpty(response.errorMsg)) {
                    kijs.gui.MsgBox.error('Fehler', response.errorMsg);
                    return;
                }

                // Warning --> WarnungMsg mit OK, Cancel. Bei Ok wird der gleiche request nochmal gesendet mit dem Flag ignoreWarnings
                // data.warningMsg (String oder Array mit Strings, die mit Aufzählungszeichen angezeigt werden)
                if (!kijs.isEmpty(response.warningMsg)) {
                    kijs.gui.MsgBox.warning('Warnung', response.warningMsg, function(e) {
                        if (e.btn === 'ok') {
                            // Request nochmal senden mit Flag ignoreWarnings
                            this.rpc(facadeFn, data, fn, this, cancelRunningRpcs, waitMaskTarget, true);
                        }
                    }, this);
                    return;
                }

                // Info --> Msg ohne Icon kein Abbruch
                // data.infoMsg (String oder Array mit Strings, die mit Aufzählungszeichen angezeigt werden)
                if (!kijs.isEmpty(response.infoMsg)) {
                    kijs.gui.MsgBox.info('Info', response.infoMsg);

                }
                // Tip -> Msg, die automatisch wieder verschwindet kein Abbruch
                // data.tipMsg (String oder Array mit Strings, die mit Aufzählungszeichen angezeigt werden)
                if (!kijs.isEmpty(response.cornerTipMsg)) {
                    kijs.gui.CornerTipContainer.show('Info', response.cornerTipMsg, 'info');
                }

                // callback-fn ausführen
                if (fn && kijs.isFunction(fn)) {
                    fn.call(context || this, response || null);
                }
            }

        }, this, cancelRunningRpcs, {ignoreWarnings: !!ignoreWarnings}, {waitMask: waitMask});
    }*/
    
    
    
    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct() {
        // RPC entladen
        this._rpc.destruct();
        
        // Variablen
        this._rpc = null;
    }
    
};