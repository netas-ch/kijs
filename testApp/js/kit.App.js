/* global kijs */

// --------------------------------------------------------------
// kit.App
// --------------------------------------------------------------
window.kit = {};
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
                    headerBarStyle: {
                        fontSize: '16px'
                    },
                    headerBarElements:[
                        {
                            xtype: 'kijs.gui.Button',
                            iconChar: '&#xf059'
                        },{
                            xtype: 'kijs.gui.Button',
                            iconChar: '&#xf059',
                            disabled: true
                        },{
                            xtype: 'kijs.gui.Button',
                            iconChar: '&#xf0ee',
                            on: {
                                click: function() {
                                    let uploadDialog = new kijs.UploadDialog({
                                        directory: true
                                    });
                                    uploadDialog.showFileSelectDialog();

                                    let uploadWin = new kijs.gui.UploadWindow({
                                        uploadDialog: uploadDialog
                                    });
                                }
                            }
                        }
                    ],
                    elements:[
                        {
                            xtype: 'kijs.gui.DropZone',
                            height: 150,
                            style: {
                                margin: '20px',
                                borderRadius: '10px',
                                lineHeight: '150px',
                                fontFamily: '"Open Sans", "Helvetica Neue", helvetica, arial, verdana, sans-serif',
                                fontSize: '50px',
                                fontWeight: 'bold',
                                color: '#fff',
                                textAlign: 'center',
                                verticalAlign: 'center',
                                backgroundImage: 'repeating-linear-gradient(45deg, #fff 0%, #fff 0.1%, #eee 0.1%, #eee 2%, #fff 2%)'
                            },
                            html: 'Drop Zone',
                            contentTypes: 'image',
                            on: {
                                drop: function(e) { console.log(e); }
                            }
                        }
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
                            style: {
                                flex: "none"
                            },
                            cls: 'kijs-flexcolumn',
                            elements:[
                                {
                                    xtype: 'kijs.gui.ContainerStack',
                                    name: 'testcontainerstack',
                                    elements: [
                                        {
                                            xtype: 'kijs.gui.Panel',
                                            name: 'testcontainerstackpanel_1',
                                            caption: 'Panel 1',
                                            cls: 'kijs-flexcolumn',
                                            defaults:{
                                                style: {
                                                    margin: '4px 4px 0 4px'
                                                }
                                            },
                                            elements: [
                                                {
                                                    xtype: 'kijs.gui.Button',
                                                    caption: 'Wechsel zu 2',
                                                    iconChar: '&#xf0d0',
                                                    toolTip: 'test',
                                                    on: {
                                                        click: function() {
                                                            let testcontainerstack = this.up('testcontainerstack');
                                                            testcontainerstack.activateAnimated('testcontainerstackpanel_2');
                                                        }
                                                    }
                                                }
                                            ]
                                        },{
                                            xtype: 'kijs.gui.Panel',
                                            name: 'testcontainerstackpanel_2',
                                            caption: 'Panel 2',
                                            cls: 'kijs-flexcolumn',
                                            defaults:{
                                                style: {
                                                    margin: '4px 4px 0 4px'
                                                }
                                            },
                                            elements: [
                                                {
                                                    xtype: 'kijs.gui.Button',
                                                    caption: 'fade',
                                                    iconChar: '&#xf0d0',
                                                    toolTip: 'test',
                                                    on: {
                                                        click: function() {
                                                            let testcontainerstack = this.up('testcontainerstack');
                                                            testcontainerstack.activateAnimated('testcontainerstackpanel_1', 'fade');
                                                        }
                                                    }
                                                },{
                                                    xtype: 'kijs.gui.Button',
                                                    caption: 'slideLeft 1s',
                                                    iconChar: '&#xf0d0',
                                                    toolTip: 'test',
                                                    on: {
                                                        click: function() {
                                                            let testcontainerstack = this.up('testcontainerstack');
                                                            testcontainerstack.activateAnimated('testcontainerstackpanel_1', 'slideLeft', 1000);
                                                        }
                                                    }
                                                },{
                                                    xtype: 'kijs.gui.Button',
                                                    caption: 'slideRight',
                                                    iconChar: '&#xf0d0',
                                                    toolTip: 'test',
                                                    on: {
                                                        click: function() {
                                                            let testcontainerstack = this.up('testcontainerstack');
                                                            testcontainerstack.activateAnimated('testcontainerstackpanel_1', 'slideRight');
                                                        }
                                                    }
                                                },{
                                                    xtype: 'kijs.gui.Button',
                                                    caption: 'slideTop',
                                                    iconChar: '&#xf0d0',
                                                    toolTip: 'test',
                                                    on: {
                                                        click: function() {
                                                            let testcontainerstack = this.up('testcontainerstack');
                                                            testcontainerstack.activateAnimated('testcontainerstackpanel_1', 'slideTop');
                                                        }
                                                    }
                                                },{
                                                    xtype: 'kijs.gui.Button',
                                                    caption: 'slideBottom',
                                                    iconChar: '&#xf0d0',
                                                    toolTip: 'test',
                                                    on: {
                                                        click: function() {
                                                            let testcontainerstack = this.up('testcontainerstack');
                                                            testcontainerstack.activateAnimated('testcontainerstackpanel_1', 'slideBottom');
                                                        }
                                                    }
                                                },{
                                                    xtype: 'kijs.gui.Button',
                                                    caption: 'Add panel',
                                                    iconChar: '&#xf0d0',
                                                    toolTip: 'test',
                                                    on: {
                                                        click: function() {
                                                            let testcontainerstack = this.up('testcontainerstack');
                                                            testcontainerstack.add({
                                                                xtype: 'kijs.gui.Panel',
                                                                name: 'addedpanel',
                                                                caption: 'Neues Panel',
                                                                cls: 'kijs-flexcolumn',
                                                                defaults:{
                                                                    style: {
                                                                        margin: '4px 4px 0 4px'
                                                                    }
                                                                },
                                                                elements: [{
                                                                    xtype: 'kijs.gui.Button',
                                                                    caption: 'Remove panel',
                                                                    iconChar: '&#xf0d0',
                                                                    toolTip: 'test',
                                                                    on: {
                                                                        click: function() {
                                                                            let testcontainerstack = this.up('testcontainerstack');
                                                                            testcontainerstack.remove(this.up('addedpanel'));
                                                                        }
                                                                    }
                                                                }]
                                                            }, 0);
                                                            testcontainerstack.activateAnimated('addedpanel', 'fade');
                                                        }
                                                    }
                                                }
                                            ]
                                        }
                                    ]
                                }
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
                                    iconChar: '&#xf085',
                                    badgeText: '4'
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
                                            iconChar: '&#xf055',
                                            height: 120
                                        },{
                                            xtype: 'kijs.gui.Button',
                                            caption: 'Duplizieren',
                                            iconChar: '&#xf0c5'
                                        },{
                                            xtype: 'kijs.gui.Button',
                                            caption: 'Aktionen',
                                            iconChar: '&#xf0e7'
                                        },{
                                            xtype: 'kijs.gui.Button',
                                            caption: 'Löschen',
                                            iconChar: '&#xf1f8'
                                        },{
                                            xtype: 'kijs.gui.Button',
                                            caption: 'Address Load',
                                            iconChar: '&#xf0e7',
                                            on: {
                                                click: function() {
                                                    const addressPanel = this.upX('kijs.gui.Panel').down('addressPanel');
                                                    addressPanel.load();
                                                }
                                            }
                                        }
                                    ]
                                }
                            ],
                            elements: [
                                {
                                    xtype: 'kijs.gui.Panel',
                                    name: 'gridPanel',
                                    caption: 'Tabelle',
                                    closable: true,
                                    collapsible: 'top',
                                    resizable: true,
                                    height: 200,
                                    shadow: true,
                                    waitMaskTargetDomProperty: 'innerDom',
                                    cls: 'kijs-flexcolumn',
//                                    innerStyle: {
//                                        padding: '10px',
//                                        overflowY: 'auto'
//                                    },
                                    elements: [{
                                        xtype: 'kijs.gui.grid.Grid',
//                                        columnConfigs: (function(){
//                                            let cols = [{caption:'Vorname', valueField:'vorname'}];
//                                            for (let i=0; i<26; i++) {
//                                                cols.push({
//                                                   caption:'Spalte ' + ('ABCDEFGHIJKLMNOPQRSTUVWXYZ').substr(i,1),
//                                                   valueField:'field_' + ('ABCDEFGHIJKLMNOPQRSTUVWXYZ').substr(i,1).toLowerCase()
//                                                });
//                                            }
//                                            return cols;
//                                        })(),

                                        facadeFnLoad: 'grid.load',
                                        rpc: this._rpc,
                                        filterable: true,
                                        editable: false,
                                        filterVisible: true,
                                        on: {
                                            click: function(e){ console.log(e); },
                                            dblClick: function(e){ console.log(e); }
                                        }
//                                        primaryKeys:'field_a'
//                                        data:(function(){
//                                            let rows = [];
//                                            for (let i=0; i<200; i++) {
//                                                let row = {};
//                                                for (let y=0; y<26; y++) {
//                                                    row['field_' + ('ABCDEFGHIJKLMNOPQRSTUVWXYZ').substr(y,1).toLowerCase()] =
//                                                            ('ABCDEFGHIJKLMNOPQRSTUVWXYZ').substr(y,1) + (i+1);
//                                                }
//                                                rows.push(row);
//                                            }
//                                            return rows;
//                                        })()
                                    }]
                                }, {
                                    xtype: 'kijs.gui.FormPanel',
                                    name: 'addressPanel',
                                    caption: 'Adresse',
                                    closable: true,
                                    collapsible: 'top',
                                    resizable: true,
                                    height: 600,
                                    shadow: true,
                                    autoLoad: false,
                                    rpc: this._rpc,
                                    waitMaskTargetDomProperty: 'innerDom',
                                    facadeFnLoad: 'address.load',
                                    facadeFnSave: 'address.save',
                                    style: {
                                        marginTop:'10px'
                                    },
                                    innerStyle: {
                                        padding: '10px',
                                        overflowY: 'auto'
                                    },
                                    defaults: {
                                        labelWidth: 120,
                                        required: true,
                                        maxLength: 50,
                                        style: {marginBottom: '4px'}
                                    },
                                    elements: [
                                        {
                                            xtype: 'kijs.gui.field.Combo',
                                            name: 'Test',
                                            label: 'Server Sort',
                                            facadeFnLoad: 'combo.load',
                                            autoLoad: true,
                                            remoteSort: true,
                                            rpc: this._rpc,
                                            spinIconVisible: true
                                        },{
                                            xtype: 'kijs.gui.field.Combo',
                                            name: 'Test',
                                            label: 'Kein Force',
                                            facadeFnLoad: 'combo.load',
                                            autoLoad: true,
                                            remoteSort: true,
                                            rpc: this._rpc,
                                            spinIconVisible: false,
                                            forceSelection: false,
                                            showPlaceholder: false
                                        },{
                                            xtype: 'kijs.gui.field.Combo',
                                            name: 'Land',
                                            label: 'Remote',
                                            rpc: this._rpc,
                                            facadeFnLoad: 'land.load',
                                            autoLoad: true,
                                            value: 'CH',
                                            valueField: 'value',
                                            captionField: 'caption'
                                        },{
                                            xtype: 'kijs.gui.field.Combo',
                                            name: 'localcombo',
                                            label: 'Local',
                                            disabled: true,
                                            data: [
                                                {value: 1, caption: 'Datensatz 1'},
                                                {value: 2, caption: 'Datensatz 2'},
                                                {value: 3, caption: 'Datensatz 3'}
                                            ]
                                        },{
                                            xtype: 'kijs.gui.field.Range',
                                            label: 'Range',
                                            min: 1,
                                            max: 10,
                                            on: {
                                                change: function(e) {
                                                    console.log(e.element.value);
                                                },
                                                context: this
                                            }
                                        },{
                                            xtype: 'kijs.gui.field.Checkbox',
                                            name: 'Checkbox',
                                            label: 'Checkbox',
                                            caption: 'Caption',
                                            threeState: true,
                                            //value: false,
                                            width: 250,
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
                                                            this.upX('kijs.gui.field.Checkbox').checked = 2;
                                                        }
                                                    }
                                                }
                                            ]
                                        },{
                                            xtype: 'kijs.gui.field.Checkbox',
                                            name: 'CheckboxIcon',
                                            label: '... mit Icon',
                                            iconCls: 'icoWizard16',
                                            caption: 'Caption',
                                            checked: 1,
                                            width: 250
                                        },{
                                            xtype: 'kijs.gui.field.Checkbox',
                                            name: 'CheckboxColor',
                                            label: '... mit Farbe',
                                            iconChar: '&#xf111',
                                            iconColor: '#ff8800',
                                            caption: 'Caption',
                                            width: 250
                                        },{
                                            xtype: 'kijs.gui.field.Checkbox',
                                            name: 'CheckboxOption',
                                            label: '... als Option',
                                            caption: 'Caption',
                                            checkedIconChar: '&#xf05d',
                                            uncheckedIconChar: '&#xf10c',
                                            determinatedIconChar: '&#xf111',
                                            valueChecked: 'Ein',
                                            valueDeterminated: 'wedernoch',
                                            valueUnchecked: 'Aus',
                                            value: 'Ein',
                                            width: 250,
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
                                                            chkBox.checked = 2;
                                                            console.log(chkBox.value);
                                                        }
                                                    }
                                                }
                                            ]
                                        },{
                                            xtype: 'kijs.gui.field.CheckboxGroup',
                                            name: 'CheckboxGroup',
                                            label: 'CheckboxGroup',
                                            valueField: 'id',
                                            captionField: 'Bezeichnung',
                                            iconCharField: 'Icon',
                                            iconColorField: 'Color',
                                            helpText: 'Hilfe Text!',
                                            data: [
                                                {id:1, Bezeichnung:'blau', Icon:'&#xf111', Color:'#0088ff' },
                                                {id:2, Bezeichnung:'grün', Icon:'&#xf111', Color:'#88ff00' },
                                                {id:3, Bezeichnung:'pink', Icon:'&#xf111', Color:'#ff0088' }
                                            ],
                                            value: [2,3],
                                            on: {
                                                input: function(e) {
                                                    console.log(e);
                                                }
                                            },
                                            elements: [
                                                {
                                                    xtype: 'kijs.gui.Button',
                                                    iconChar: '&#xf0d0',
                                                    toolTip: 'test',
                                                    on: {
                                                        click: function() {
                                                            console.log(this.parent);
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
                                            valueField: 'color',
                                            captionField: 'Bez',
                                            iconCharField: 'iconChar',
                                            iconColorField: 'color',
                                            rpc: this._rpc,
                                            facadeFnLoad: 'color.load',
                                            autoLoad: true,
                                            value: ['#0f0', '#ff0'],
                                            on: {
                                                input: function(e) {
                                                    console.log(e);
                                                }
                                            }
                                        },{
                                            xtype: 'kijs.gui.field.OptionGroup',
                                            name: 'OptionGroupInline',
                                            label: 'OptionGroup Inline',
                                            cls: 'kijs-inline',
                                            valueField: 'id',
                                            captionField: 'Bezeichnung',
                                            iconCharField: 'Icon',
                                            iconColorField: 'Color',
                                            required: true,
                                            data: [
                                                {id:1, Bezeichnung:'blau', Icon:'&#xf111', Color:'#0088ff' },
                                                {id:2, Bezeichnung:'grün', Icon:'&#xf111', Color:'#88ff00' },
                                                {id:3, Bezeichnung:'pink', Icon:'&#xf111', Color:'#ff0088' }
                                            ],
                                            //value: 2,
                                            on: {
                                                input: function(e) {
                                                    console.log('oldValue:' + e.oldValue + ' value:' + e.value);
                                                }
                                            }
                                        },{
                                            xtype: 'kijs.gui.field.OptionGroup',
                                            name: 'OptionGroup',
                                            label: 'OptionGroup',
                                            valueField: 'id',
                                            captionField: 'caption',
                                            data: [
                                                {id:1, caption:'Wert A'},
                                                {id:2, caption:'Wert B'},
                                                {id:3, caption:'Wert C'}
                                            ],
                                            value: 2,
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
                                                            let val = this.parent.value;
                                                            val++;
                                                            if (val > 3) {
                                                                val = null;
                                                            }
                                                            this.parent.value = val;
                                                            this.toolTip = this.parent.value + '';
                                                        }
                                                    }
                                                }
                                            ]
                                        },{
                                            xtype: 'kijs.gui.field.OptionGroup',
                                            name: 'OptionGroupInline',
                                            label: 'OptionGroup Inline',
                                            valueField: 'id',
                                            captionField: 'id',
                                            cls: 'kijs-inline',
                                            data: [{id:1}, {id:2}, {id:3}],
                                            value: 2,
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
                                                            let val = this.parent.value;
                                                            val++;
                                                            if (val > 3) {
                                                                val = null;
                                                            }
                                                            this.parent.value = val;
                                                            this.toolTip = this.parent.value + '';
                                                        }
                                                    }
                                                }
                                            ]
                                        },{
                                            xtype: 'kijs.gui.field.DateTime',
                                            name: 'DatumUhrzeit',
                                            label: 'Datum & Zeit',
                                            hasSeconds: true,
                                            readOnly: true,
                                            width: 290,
                                            value: 1571314912
                                        },{
                                            xtype: 'kijs.gui.field.DateTime',
                                            name: 'Datum',
                                            label: 'Datum',
                                            hasTime: false,
                                            width: 240,
                                            value: 1565301600
                                        },{
                                            xtype: 'kijs.gui.field.DateTime',
                                            name: 'Uhrzeit',
                                            label: 'Uhrzeit',
                                            hasDate: false,
                                            width: 200
                                        },{
                                            xtype: 'kijs.gui.field.Password',
                                            name: 'Passwort',
                                            label: 'Passwort',
                                            //disableBrowserSecurityWarning: 'auto',
                                            width: 200,
                                            on: {
                                                input: function(e) {
                                                    this.parent.down('Feld 1').value = this.value;
                                                }
                                            }
                                        },{
                                            xtype: 'kijs.gui.field.Number',
                                            name: 'Nummer',
                                            label: 'Nummer',
                                            allowBlank: true,
                                            thousandsSeparator: '\'',
                                            alwaysDisplayDecimals: true,
                                            width: 200
                                        },{
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
                                            xtype: 'kijs.gui.field.Display',
                                            name: 'displayfeld',
                                            label: 'Mein Label',
                                            value: 'Mein Text<b>t</b>'
                                        },{
                                            xtype: 'kijs.gui.field.Display',
                                            name: 'displayfeld',
                                            label: 'Telefon',
                                            value: '+41 31 552 00 13',
                                            link: true
                                        },{
                                            xtype: 'kijs.gui.field.Display',
                                            name: 'displayfeld',
                                            label: 'Email',
                                            value: 'info@kipferinformatik.ch',
                                            link: true
                                        },{
                                            xtype: 'kijs.gui.field.Display',
                                            name: 'displayfeld',
                                            label: 'Webseite',
                                            value: 'www.kipferinformatik.ch',
                                            link: true
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
                                            labelWidth: 120,
                                            labelHtmlDisplayType : 'text',
                                            style: {marginBottom: '4px'}
                                        }),{
                                            xtype: 'kijs.gui.field.Combo',
                                            name: 'Anrede',
                                            label: 'Anrede',
                                            value: 'w',
                                            valueField: 'value',
                                            captionField: 'caption',
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
                                            value: 'CH',
                                            valueField: 'value',
                                            captionField: 'caption'
                                        },{
                                            xtype: 'kijs.gui.field.Editor',
                                            name: 'editor',
                                            label: 'Editor',
                                            mode: 'javascript',
                                            //theme: 'monokai',
                                            value: 'function test(x) {\n    console.log(x);\n}\n\ntest("Hallo Welt!");\nFehler',
                                            height: 100
                                        },{
                                            xtype: 'kijs.gui.field.Memo',
                                            name: 'Bemerkungen',
                                            label: 'Bemerkungen (test)',
                                            value: 'Dieses Bemerkungsfeld hat\nmehrere Zeilen!',
                                            helpText: 'Bitte geben Sie hier Ihre Bemerkungen ein!'
                                        },{
                                            xtype: 'kijs.gui.field.ListView',
                                            label: 'ListView',
                                            valueField: 'id',
                                            captionField: 'Bezeichnung',
                                            iconCharField: 'Icon',
                                            iconColorField: 'Color',
                                            toolTipField: 'Color',
                                            showCheckBoxes: true,
                                            selectType: 'simple',
                                            helpText: 'Hilfe Text!',
                                            width: 270,
                                            height: 200,
                                            style: {
                                                marginBottom: '4px'
                                            },
                                            data: [
                                                {id:1, Bezeichnung:'blau', Icon:'&#xf111', Color:'#0088ff' },
                                                {id:2, Bezeichnung:'grün', Icon:'&#xf111', Color:'#88ff00' },
                                                {id:3, Bezeichnung:'pink', Icon:'&#xf111', Color:'#ff0088' },
                                                {id:4, Bezeichnung:'türkis', Icon:'&#xf111', Color:'#00ff88' },
                                                {id:5, Bezeichnung:'orange', Icon:'&#xf111', Color:'#ff8800' },
                                                {id:6, Bezeichnung:'viollet', Icon:'&#xf111', Color:'#8800ff' },
                                                {id:7, Bezeichnung:'dunkelgrau', Icon:'&#xf111', Color:'#666666' },
                                                {id:8, Bezeichnung:'grau', Icon:'&#xf111', Color:'#999999' },
                                                {id:9, Bezeichnung:'hellgrau', Icon:'&#xf111', Color:'#bbbbbb' },
                                                {id:10, Bezeichnung:'weiss', Icon:'&#xf111', Color:'#ffffff' },
                                                {id:11, Bezeichnung:'schwarz', Icon:'&#xf111', Color:'#000000' }
                                            ],
                                            value: [2,3],
                                            on: {
                                                input: function(e) {
                                                    console.log(e.oldValue);
                                                    console.log(e.value);
                                                }
                                            }
                                        },{
                                            xtype: 'kijs.gui.field.ListView',
                                            label: 'ListView remote',
                                            valueField: 'color',
                                            captionField: 'Bez',
                                            iconCharField: 'iconChar',
                                            iconColorField: 'color',
                                            rpc: this._rpc,
                                            facadeFnLoad: 'color.load',
                                            autoLoad: true,
                                            value: '#0f0',
                                            showCheckBoxes: false,
                                            selectType: 'single',
                                            style: {
                                                marginBottom: '4px'
                                            },
                                            on: {
                                                selectionChange: function(e) {
                                                    console.log(this.value);
                                                }
                                            },
                                            elements: [
                                                {
                                                    xtype: 'kijs.gui.Button',
                                                    caption: 'Load',
                                                    on: {
                                                        click: function() {
                                                            this.parent.load();
                                                        }
                                                    }
                                                }
                                            ]
                                        },{
                                            xtype: 'kijs.gui.field.ListView',
                                            label: 'ListView remote',
                                            valueField: 'color',
                                            captionField: 'Bez',
                                            iconCharField: 'iconChar',
                                            iconColorField: 'color',
                                            rpc: this._rpc,
                                            facadeFnLoad: 'color.load',
                                            autoLoad: true,
                                            value: '#ff0',
                                            showCheckBoxes: true,
                                            selectType: 'simple',
                                            minSelectCount: 2,
                                            maxSelectCount: 3,
                                            style: {
                                                marginBottom: '4px'
                                            },
                                            on: {
                                                selectionChange: function(e) {
                                                    console.log(this.value);
                                                }
                                            },
                                            elements: [
                                                {
                                                    xtype: 'kijs.gui.Button',
                                                    caption: 'Load',
                                                    on: {
                                                        click: function() {
                                                            this.parent.load();
                                                        }
                                                    }
                                                }
                                            ]
                                        }
                                    ],
                                    footerStyle: {
//                                        padding: '10px'
                                    },
                                    footerElements: [
                                        {
                                            xtype: 'kijs.gui.MenuButton',
                                            caption: 'Menü',
                                            iconChar: '&#xf135',
                                            elements: [{
                                                caption:'Hallo 1'
                                            },{
                                                caption:'Hallo 3',
                                                iconChar: '&#xf135'
                                            },{
                                                xtype: 'kijs.gui.MenuButton',
                                                caption:'MULTI',
                                                elements: (function(){
                                                    let steps=150, p = [];
                                                    for (let i=0; i<steps; i++) {
                                                        p.push({
                                                            caption: 'El ' + i + ' von ' + steps
                                                        });
                                                    }
                                                    return p;
                                                })()
                                            },{
                                                xtype: 'kijs.gui.MenuButton',
                                                caption:'ENDLESS',
                                                elements: (function(){
                                                    let steps=20, p = [{
                                                            caption:'ÄTSCH NICHTS DA'
                                                        }];
                                                    for (let i=0; i<steps; i++) {
                                                        p = [{
                                                                caption: 'Stufe ' + i + ' von ' + steps
                                                            },{
                                                                xtype: 'kijs.gui.MenuButton',
                                                                caption:'Nächste Stufe',
                                                                elements:p
                                                            }];
                                                    }
                                                    return p;
                                                })()
                                            }]
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
                                            badgeText: 'test',
                                            toolTip: 'Da darfst Du nicht draufdrücken!',
                                            on: {click: function() {
                                                this.toolTip = 'Nein, er hat es tatsächlich getan!';
                                                this.parent.parent.validate();
                                            }}
                                        },{
                                            xtype: 'kijs.gui.Button',
                                            name: 'btnReadOnly',
                                            caption: 'ReadOnly',
                                            badgeText: '7',
                                            on: {click: function() {
                                                this.parent.parent.readOnly = true;

                                                this.disabled = true;
                                                this.parent.down('btnEnable').disabled = false;
                                            }}
                                        },{
                                            xtype: 'kijs.gui.Button',
                                            name: 'btnDisable',
                                            caption: 'Deaktivieren',
                                            on: {click: function() {
                                                this.parent.parent.disabled = true;

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
                                                    }
                                                }, this);
                                                this.parent.parent.disabled = false;
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
//                                        padding: '10px'
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
//                                        padding: '10px'
                                    },
                                    footerElements: [
                                        {
                                            xtype: 'kijs.gui.Button',
                                            caption: 'Disable/Enable',
                                            on: {click: function() {
                                                let dataView = this.upX('kijs.gui.Panel').downX('kijs.gui.DataView');
                                                dataView.disabled = !dataView.disabled;
                                            }}
                                        },{
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
//                                padding: '10px'
                            },
                            footerElements: [
                                {
                                    xtype: 'kijs.gui.Button',
                                    caption: 'Uhrzeit',
                                    iconChar: '&#xf017',
                                    on: {click: function() {
                                        let window = new kijs.gui.Window({
                                            target: this.parent.parent.down('addressPanel'),
                                            targetDomProperty: 'innerDom',
                                            caption: 'Fenster',
                                            iconChar: '&#xf017',
                                            collapsible: 'top',
                                            maximized: false,
                                            modal: true,
                                            height: 270,
                                            width: 160,
                                            elements:[{
                                                    xtype: 'kijs.gui.TimePicker'
                                            }]
                                        });
                                        window.show();
                                    }}
                                },{
                                    xtype: 'kijs.gui.Button',
                                    caption: 'Progress Bar',
                                    iconChar: '&#xf0ae',
                                    on: {click: function() {
                                        let pgWin = new kijs.gui.Window({
                                            caption: 'Progressbar',
                                            iconChar: '&#xf2d0',
                                            collapsible: 'top',
                                            modal: false,
//                                            height: 200,
                                            width: 250,
                                            innerStyle: {
                                                padding: '10px'
                                            },
                                            elements:[
                                                {
                                                    xtype: 'kijs.gui.ProgressBar',
                                                    name: 'myprogressbar',
                                                    showPercent: true
                                                },{
                                                    xtype: 'kijs.gui.ProgressBar',
                                                    name: 'myprogressbar2',
                                                    caption: 'Caption',
                                                    bottomCaption: 'Bottom Caption',
                                                    style: {
                                                        marginTop:'10px'
                                                    }
                                                }
                                            ],
                                            footerStyle: {
//                                                padding: '10px'
                                            },
                                            footerElements:[
                                                {
                                                    xtype: 'kijs.gui.Button',
                                                    caption: 'OK',
                                                    isDefault: true,
                                                    on: {click: function() {
                                                        pgWin.destruct();
                                                    }}
                                                }
                                            ]
                                        });
                                        pgWin.show();
                                        let perc = 0, perc1= 0;
                                        window.setInterval(function(){
                                            if (!pgWin || !pgWin.dom) return;
                                            pgWin.down('myprogressbar').percent = perc;
                                            pgWin.down('myprogressbar2').percent = perc1;
                                            perc += 6;
                                            perc1 += 1;
                                            if (perc > 100)  perc -= 99;
                                            if (perc1 > 100)  perc1 = 1;
                                        },900);
                                    }}
                                },{
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
                                                {
                                                    xtype: 'kijs.gui.field.Memo',
                                                    value: 'Bemerkungsfeld',
                                                    style: {
                                                        height: '100%'
                                                    }
                                                }
                                            ],
                                            footerStyle: {
//                                                padding: '10px'
                                            },
                                            footerElements:[
                                                {
                                                    xtype: 'kijs.gui.Button',
                                                    caption: 'OK',
                                                    isDefault: true,
                                                    on: {click: function() {
                                                        kijs.gui.MsgBox.warning('Warnung', 'Wirklich schliessen?', function(e) {
                                                            if (e.btn === 'ok') {
                                                                window.close();
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
                                    caption: 'Lochmaske',
                                    iconChar: '&#xf192',
                                    on: {click: function() {
                                        let addressPanel = this.parent.parent.down('addressPanel');
                                        let maske = new kijs.gui.ApertureMask({
                                            target: addressPanel
                                        });
                                        maske.show();

                                        // maske nach 3s wieder entfernen
                                        kijs.defer(function() {
                                            maske.hide();
                                        }, 3000, this);
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
                                    iconChar: '&#xf085',
                                    badgeText: '2'
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
                            style: {
                                flex: "none"
                            },
                            headerBarElements:[
                                {
                                    xtype: 'kijs.gui.Button',
                                    iconChar: '&#xf02f',
                                    badgeText: '5',
                                    on: {
                                        click: function(e) {
                                            let editor = this.upX('kijs.gui.Panel').down('editor');
                                            console.log(editor.value);
                                        }
                                    }
                                }
                            ],
                            elements:[
                                {
                                    xtype: 'kijs.gui.field.Editor',
                                    name: 'editor',
                                    labelHide: true,
                                    mode: 'javascript',
                                    value: 'function test(x) {\n    console.log(x);\n}\n\ntest("Hallo Welt!");',
                                    style: {
                                        flex: '1 1 auto'
                                    }
                                }
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