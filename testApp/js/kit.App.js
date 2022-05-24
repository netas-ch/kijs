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

        this._uploadDialog = new kijs.UploadDialog({
            fileExtensions: 'sql',
            contentTypes: 'image/*'
        });
        new kijs.gui.UploadWindow({
            uploadDialog: this._uploadDialog
        });
    }


    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    run() {
        let _this = this;

        document.title = 'kijs ' + kijs.version + ' - JavaScript GUI library by netas.ch'

        // ViewPort erstellen
        let viewport = new kijs.gui.ViewPort({
            cls: 'kijs-flexcolumn',
            elements: [
                // TOP
                {
                    xtype: 'kijs.gui.Panel',
                    caption: 'kijs ' + kijs.version + ' - JavaScript GUI library by netas.ch',
                    iconCls: 'icoKijs16',
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
                            iconMap: 'kijs.iconMap.Fa.circle-question'
                        },{
                            xtype: 'kijs.gui.Button',
                            iconMap: 'kijs.iconMap.Fa.circle-info',
                            disabled: true
                        },{
                            xtype: 'kijs.gui.Button',
                            iconMap: 'kijs.iconMap.Fa.file-arrow-up',
                            on: {
                                click: function() {
                                    this._uploadDialog.showFileSelectDialog();
                                },
                                context: this
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
                            iconMap: 'kijs.iconMap.Fa.spinner',
                            iconCls: 'fa-solid kijs-pulse',
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
                                                /*style: {
                                                    margin: '4px 4px 0 4px'
                                                }*/
                                            },
                                            style: {
                                                flex: 1
                                            },
                                            elements: [
                                                {
                                                    xtype: 'kijs.gui.Tree',
                                                    caption: 'Element 1',
//                                                    iconChar: 0xf114,
//                                                    elements: this.createTreeRecursive(6, 3),
//                                                    iconCls: 'icoFolder32',
//                                                    expandedIconCls: 'icoFolderOpen32',
//                                                    iconSize: 16,
                                                    rpc: this._rpc,
                                                    facadeFnLoad: 'tree.load',
                                                    draggable: true,
                                                    on: {
                                                        expand: function(){ console.log('expand event'); },
                                                        collapse: function(){ console.log('collapse event'); },
                                                        select: function(){ console.log('select event'); },
                                                        dragDrop: function(s) { console.log('dragDrop event'); console.log(s); },
                                                        context: this
                                                    },
                                                    style: {
                                                        flex: 1
                                                    }
                                                }/*,
                                                {
                                                    xtype: 'kijs.gui.Button',
                                                    caption: 'Wechsel zu 2',
                                                    iconChar: 0xf0d0,
                                                    tooltip: 'test',
                                                    on: {
                                                        click: function() {
                                                            let testcontainerstack = this.up('testcontainerstack');
                                                            testcontainerstack.activateAnimated('testcontainerstackpanel_2');
                                                        }
                                                    }
                                                }*/
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
                                                    iconChar: 0xf0d0,
                                                    tooltip: 'test',
                                                    on: {
                                                        click: function() {
                                                            let testcontainerstack = this.up('testcontainerstack');
                                                            testcontainerstack.activateAnimated('testcontainerstackpanel_1', 'fade');
                                                        }
                                                    }
                                                },{
                                                    xtype: 'kijs.gui.Button',
                                                    caption: 'slideLeft 1s',
                                                    iconChar: 0xf0d0,
                                                    tooltip: 'test',
                                                    on: {
                                                        click: function() {
                                                            let testcontainerstack = this.up('testcontainerstack');
                                                            testcontainerstack.activateAnimated('testcontainerstackpanel_1', 'slideLeft', 1000);
                                                        }
                                                    }
                                                },{
                                                    xtype: 'kijs.gui.Button',
                                                    caption: 'slideRight',
                                                    iconChar: 0xf0d0,
                                                    tooltip: 'test',
                                                    on: {
                                                        click: function() {
                                                            let testcontainerstack = this.up('testcontainerstack');
                                                            testcontainerstack.activateAnimated('testcontainerstackpanel_1', 'slideRight');
                                                        }
                                                    }
                                                },{
                                                    xtype: 'kijs.gui.Button',
                                                    caption: 'slideTop',
                                                    iconChar: 0xf0d0,
                                                    tooltip: 'test',
                                                    on: {
                                                        click: function() {
                                                            let testcontainerstack = this.up('testcontainerstack');
                                                            testcontainerstack.activateAnimated('testcontainerstackpanel_1', 'slideTop');
                                                        }
                                                    }
                                                },{
                                                    xtype: 'kijs.gui.Button',
                                                    caption: 'slideBottom',
                                                    iconChar: 0xf0d0,
                                                    tooltip: 'test',
                                                    on: {
                                                        click: function() {
                                                            let testcontainerstack = this.up('testcontainerstack');
                                                            testcontainerstack.activateAnimated('testcontainerstackpanel_1', 'slideBottom');
                                                        }
                                                    }
                                                },{
                                                    xtype: 'kijs.gui.Button',
                                                    caption: 'Add panel',
                                                    iconChar: 0xf0d0,
                                                    tooltip: 'test',
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
                                                                    iconChar: 0xf0d0,
                                                                    tooltip: 'test',
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
                            iconMap: 'kijs.iconMap.Fa.gamepad',
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
                                    iconMap: 'kijs.iconMap.Fa.envelope',
                                    badgeText: '4'
                                }
                            ],
                            headerElements: [
                                {
                                    xtype: 'kijs.gui.ButtonGroup',
                                    rowSizes:[2],
                                    caption: 'Funktionen',
                                    width: 400,
                                    height: 80,
                                    columns: 3,
                                    elements: [
                                        {
                                            xtype: 'kijs.gui.Button',
                                            caption: 'Neu',
                                            iconMap: 'kijs.iconMap.Fa.circle-plus'
                                        },{
                                            xtype: 'kijs.gui.Button',
                                            caption: 'Duplizieren',
                                            iconMap: 'kijs.iconMap.Fa.copy'
                                        },{
                                            xtype: 'kijs.gui.Button',
                                            caption: 'Aktionen',
                                            iconMap: 'kijs.iconMap.Fa.bolt'
                                        },{
                                            xtype: 'kijs.gui.Button',
                                            caption: 'Löschen',
                                            iconMap: 'kijs.iconMap.Fa.trash-can'
                                        },{
                                            xtype: 'kijs.gui.Button',
                                            caption: 'Address Load',
                                            iconMap: 'kijs.iconMap.Fa.arrows-rotate',
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
                                    on: {
                                        close: function() { console.log('close'); }
                                    },
//                                    innerStyle: {
//                                        padding: '10px',
//                                        overflowY: 'auto'
//                                    },
                                    elements: [{
                                        xtype: 'kijs.gui.grid.Grid',
                                         style: {
                                             flex: 1
                                         },
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
                                        filterVisible: true,
                                        on: {
                                            rowClick: function(e){ console.log(e); },
                                            rowDblClick: function(e){ console.log(e); },
                                            change: function(e){ console.log('change!');console.log(e); }
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
                                },{
                                    xtype: 'kijs.gui.Panel',
                                    caption: 'Quill Editor',
                                    shadow: true,
                                    visible: false,
                                    height: '600',
                                    cls: 'kijs-flexcolumn',
                                    elements: [/*
                                        {
                                            xtype: 'kijs.gui.field.QuillEditor',
                                            theme: 'snow',
                                            value: 'Hallo Welt',
                                            height: 300,
                                            //readOnly: true,
                                            //disabled: true,
                                            on: {
                                                change: function(e) {
                                                    viewport.down('quillContent').html = e.element.value;
                                                },
                                                context: this
                                            }
                                        },{
                                            xtype: 'kijs.gui.Element',
                                            name: 'quillContent',
                                            style: {
                                                flex: 1
                                            }
                                        }
                                    */],
                                    style: {
                                        marginTop:'10px'
                                    }
                                },{
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
                                    on: {
                                        rightClick: function(e) {
                                            e.nodeEvent.preventDefault();

                                            let menu = new kijs.gui.Menu({
                                                closeOnClick: true,
                                                elements: [{
                                                    caption:'Windows',
                                                    iconMap: 'kijs.iconMap.Fa.windows',
                                                    on: {click:() => { kijs.gui.MsgBox.alert('You choose:', 'Windows!'); }}
                                                },{
                                                    caption:'Apple',
                                                    iconMap: 'kijs.iconMap.Fa.apple',
                                                    on: {click:() => { kijs.gui.MsgBox.alert('You choose:', 'Apple!'); }}
                                                },{
                                                    caption:'Weitere',
                                                    iconMap: 'kijs.iconMap.Fa.angles-right',
                                                    menuElements: [{
                                                        caption:'Linux',
                                                        iconMap: 'kijs.iconMap.Fa.linux',
                                                        on: {click:() => {
                                                                kijs.gui.MsgBox.alert('You choose:', 'Linux!');
                                                            }}
                                                    },{
                                                        caption:'Android',
                                                        iconMap: 'kijs.iconMap.Fa.android',
                                                        on: {click:() => {
                                                                kijs.gui.MsgBox.alert('You choose:', 'Android!');
                                                            }}
                                                    },{
                                                        caption:'iOS',
                                                        iconMap: 'kijs.iconMap.Fa.apple',
                                                        on: {click:() => { kijs.gui.MsgBox.alert('You choose:', 'iOS!'); }}
                                                    }]
                                                }]
                                            });
                                            menu.show(e.nodeEvent.pageX, e.nodeEvent.pageY);

                                        },
                                        context: this
                                    },
                                    elements: [
                                        {
                                            xtype: 'kijs.gui.field.Combo',
                                            name: 'ServerSortCombo',
                                            label: 'Server Sort mit langem Label',
                                            facadeFnLoad: 'combo.load',
                                            autoLoad: true,
                                            remoteSort: true,
                                            rpc: this._rpc,
                                            spinIconVisible: true,
                                            elements: [{
                                                xtype: 'kijs.gui.Button',
                                                cls: 'kijs-inline',
                                                iconMap: 'kijs.iconMap.Fa.coins',
                                                on: {
                                                    click: function() {
                                                        this.up('ServerSortCombo').value = 3084;
                                                    }
                                                }
                                            }]
                                        },{
                                            xtype: 'kijs.gui.field.Combo',
                                            name: 'ServerSortCombo',
                                            label: 'Server Sort mit langem Label',
                                            facadeFnLoad: 'combo.load',
                                            autoLoad: true,
                                            remoteSort: true,
                                            rpc: this._rpc,
                                            spinIconVisible: true,
                                            elements: [{
                                                xtype: 'kijs.gui.Button',
                                                iconMap: 'kijs.iconMap.Fa.coins',
                                                on: {
                                                    click: function() {
                                                        this.up('ServerSortCombo').value = 3084;
                                                    }
                                                }
                                            }]
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
                                            name: 'myrange',
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
                                            xtype: 'kijs.gui.field.Color',
                                            name: 'mycolor',
                                            label: 'Color',
                                            value: 'rgb(0, 0, 255)',
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
                                            require: true,
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
                                                    iconMap: 'kijs.iconMap.Fa.computer',
                                                    tooltip: 'test',
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
                                            iconMap: 'kijs.iconMap.Fa.stamp',
                                            iconColor: '#ff8800',
                                            caption: 'Caption',
                                            width: 250
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
                                            width: 250,
                                            on: {
                                                input: function(e) {
                                                    console.log('input:' + this.value);
                                                }
                                            },
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
                                        },{
                                            xtype: 'kijs.gui.field.CheckboxGroup',
                                            label: 'CheckboxGroup Fix',
                                            checkedAll: true,
                                            data: [
                                                { caption: 'Januar', value: 1},
                                                { caption: 'Februar', value: 2},
                                                { caption: 'März', value: 3},
                                                { caption: 'April', value: 4},
                                                { caption: 'Mai', value: 5},
                                                { caption: 'Juni', value: 6},
                                                { caption: 'Juli', value: 7},
                                                { caption: 'August', value: 8},
                                                { caption: 'September', value: 9},
                                                { caption: 'Oktober', value: 10},
                                                { caption: 'November', value: 11},
                                                { caption: 'Dezember', value: 12}
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
                                                {id:1, Bezeichnung:'blau', Icon:0xf111, Color:'#0088ff' },
                                                {id:2, Bezeichnung:'grün', Icon:0xf111, Color:'#88ff00' },
                                                {id:3, Bezeichnung:'pink', Icon:0xf111, Color:'#ff0088' }
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
                                                    iconMap: 'kijs.iconMap.Fa.comment',
                                                    tooltip: 'test',
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
                                            checkedAll: true,
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
                                                {id:1, Bezeichnung:'blau', Icon:0xf111, Color:'#0088ff' },
                                                {id:2, Bezeichnung:'grün', Icon:0xf111, Color:'#88ff00' },
                                                {id:3, Bezeichnung:'pink', Icon:0xf111, Color:'#ff0088' }
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
                                                    iconMap: 'kijs.iconMap.Fa.dog',
                                                    tooltip: 'test',
                                                    on: {
                                                        click: function() {
                                                            let val = this.parent.value;
                                                            val++;
                                                            if (val > 3) {
                                                                val = null;
                                                            }
                                                            this.parent.value = val;
                                                            this.tooltip = this.parent.value + '';
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
                                                    iconMap: 'kijs.iconMap.Fa.crow',
                                                    tooltip: 'test',
                                                    on: {
                                                        click: function() {
                                                            let val = this.parent.value;
                                                            val++;
                                                            if (val > 3) {
                                                                val = null;
                                                            }
                                                            this.parent.value = val;
                                                            this.tooltip = this.parent.value + '';
                                                        }
                                                    }
                                                }
                                            ]
                                        },{
                                            xtype: 'kijs.gui.field.Month',
                                            name: 'Monat',
                                            label: 'Monat',
                                            width: 260,
                                            value: '2019-12-01',
                                            minValue: '2020-11-01',
                                            maxValue: '2022-03-30',
                                            lastDayOfMonthAsValue: true,
                                            on: {
                                                change: function(e) {
                                                    console.log('change: ' + e.element.value);
                                                }
                                            }
                                        },{
                                            xtype: 'kijs.gui.MonthPicker',
                                            value: '2020-12-01',
                                            minValue: '2021-02-01',
                                            maxValue: '2022-03-30',
                                            headerBarHide: false,
                                            currentBtnHide: false,
                                            closeBtnHide: true,
                                            on: {
                                                change: function(e) {
                                                    console.log('change: ' + e.element.value);
                                                }
                                            }
                                        },{
                                            xtype: 'kijs.gui.TimePicker',
                                            value: '14:00',
                                            headerBarHide: false,
                                            currentBtnHide: false,
                                            closeBtnHide: true,
                                            on: {
                                                change: function(e) {
                                                    console.log('change: ' + e.element.value + ' | ' + e.element.valueEnd);
                                                }
                                            }
                                        },{
                                            xtype: 'kijs.gui.field.DateTime',
                                            name: 'DatumUhrzeitSec',
                                            label: 'Datum & Zeit & Sec',
                                            mode: 'dateTime',
                                            minutesHide: false,
                                            secondsHide: false,
                                            timeRequired: true,
                                            width: 280,
                                            value: '2021-02-17 15:45:12',
                                            on: {
                                                change: function(e) {
                                                    console.log('change: ' + e.element.value + ' | ' + e.element.valueEnd);
                                                }
                                            }
                                        },{
                                            xtype: 'kijs.gui.field.DateTime',
                                            name: 'DatumUhrzeit',
                                            label: 'Datum & Zeit',
                                            mode: 'dateTime',
                                            minValue: '2021-02-01',
                                            maxValue: '2021-03-31',
                                            width: 330,
                                            elements:[
                                                {
                                                    xtype: 'kijs.gui.Button',
                                                    iconMap: 'kijs.iconMap.Fa.bahai',
                                                    tooltip: 'Feld leeren',
                                                    on: {
                                                        click: function() {
                                                            this.parent.value = '';
                                                            this.parent.valueEnd = '';
                                                        }
                                                    }
                                                }
                                            ],
                                            on: {
                                                change: function(e) {
                                                    console.log('change: ' + e.element.value + ' | ' + e.element.valueEnd);
                                                }
                                            }
                                        },{
                                            xtype: 'kijs.gui.field.DateTime',
                                            name: 'Datum',
                                            label: 'Datum',
                                            mode: 'date',
                                            width: 240,
                                            date: 1565301600,
                                            on: {
                                                change: function(e) {
                                                    console.log('change: ' + e.element.value + ' | ' + e.element.valueEnd);
                                                }
                                            }
                                        },{
                                            xtype: 'kijs.gui.field.DateTime',
                                            name: 'Uhrzeit',
                                            label: 'Uhrzeit',
                                            mode: 'time',
                                            width: 200,
                                            value: '13',
                                            on: {
                                                change: function(e) {
                                                    console.log('change: ' + e.element.value + ' | ' + e.element.valueEnd);
                                                }
                                            }
                                        },{
                                            xtype: 'kijs.gui.field.DateTime',
                                            name: 'Woche',
                                            label: 'Woche',
                                            mode: 'week',
                                            width: 240,
                                            on: {
                                                change: function(e) {
                                                    console.log('change: ' + e.element.value + ' | ' + e.element.valueEnd);
                                                }
                                            }
                                        },{
                                            xtype: 'kijs.gui.field.DateTime',
                                            name: 'rangeStart',
                                            nameEnd: 'rangeEnd',
                                            label: 'von/bis',
                                            mode: 'range',
                                            width: 320,
                                            on: {
                                                change: function(e) {
                                                    console.log('change: ' + e.element.value + ' | ' + e.element.valueEnd);
                                                }
                                            }
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
                                                    iconMap: 'kijs.iconMap.Fa.eraser',
                                                    tooltip: 'Feld leeren',
                                                    on: {
                                                        click: function() {
                                                            this.parent.value = '';
                                                        }
                                                    }
                                                }
                                            ]
                                        },{
                                            xtype: 'kijs.gui.field.Text',
                                            name: 'Feld 33',
                                            label: 'Feld 33',
                                            value: 'Hallo Welt 33',
                                            autocomplete: false
                                        },{
                                            xtype: 'kijs.gui.field.Display',
                                            name: 'displayfeld',
                                            label: 'Mein Label',
                                            value: 'Mein Text ist <b style="color:red">rot</b>',
                                            htmlDisplayType: 'html'
                                        },{
                                            xtype: 'kijs.gui.field.Display',
                                            name: 'displayfeld',
                                            label: 'Telefon',
                                            value: '+41 31 552 00 13',
                                            link: true
                                        },{
                                            xtype: 'kijs.gui.field.Display',
                                            name: 'displayfeld',
                                            label: 'E-Mail',
                                            value: 'info@netas.ch',
                                            link: true
                                        },{
                                            xtype: 'kijs.gui.field.Display',
                                            name: 'displayfeld',
                                            label: 'Webseite',
                                            value: 'www.netas.ch',
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
                                                    iconMap: 'kijs.iconMap.Fa.plus',
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
                                                    iconMap: 'kijs.iconMap.Fa.trash-can',
                                                    on: {
                                                        click: function() {
                                                            this.parent.value = '';
                                                        }
                                                    }
                                                }
                                            ]
                                        },{
                                            xtype: 'kijs.gui.field.Phone',
                                            name: 'phone',
                                            label: 'Telefon',
                                            defaultCountryCallingCode: '+41'
                                        },{
                                            xtype: 'kijs.gui.field.Email',
                                            name: 'email',
                                            label: 'E-Mail',
                                            showLinkButton: true
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
                                            helpText: 'Bitte geben Sie hier Ihre Bemerkungen ein!',
                                            elements: [{
                                                xtype: 'kijs.gui.Button',
                                                iconMap: 'kijs.iconMap.Fa.horse',
                                                cls: 'kijs-inline'
                                            }]
                                        },{
                                            xtype: 'kijs.gui.field.ListView',
                                            label: 'ListView',
                                            valueField: 'id',
                                            captionField: 'Bezeichnung',
                                            iconCharField: 'Icon',
                                            iconColorField: 'Color',
                                            tooltipField: 'Color',
                                            showCheckBoxes: true,
                                            selectType: 'simple',
                                            helpText: 'Hilfe Text!',
                                            width: 270,
                                            height: 200,
                                            style: {
                                                marginBottom: '4px'
                                            },
                                            data: [
                                                {id:1, Bezeichnung:'blau', Icon:0xf111, Color:'#0088ff' },
                                                {id:2, Bezeichnung:'grün', Icon:0xf111, Color:'#88ff00' },
                                                {id:3, Bezeichnung:'pink', Icon:0xf111, Color:'#ff0088' },
                                                {id:4, Bezeichnung:'türkis', Icon:0xf111, Color:'#00ff88' },
                                                {id:5, Bezeichnung:'orange', Icon:0xf111, Color:'#ff8800' },
                                                {id:6, Bezeichnung:'viollet', Icon:0xf111, Color:'#8800ff' },
                                                {id:7, Bezeichnung:'dunkelgrau', Icon:0xf111, Color:'#666666' },
                                                {id:8, Bezeichnung:'grau', Icon:0xf111, Color:'#999999' },
                                                {id:9, Bezeichnung:'hellgrau', Icon:0xf111, Color:'#bbbbbb' },
                                                {id:10, Bezeichnung:'weiss', Icon:0xf111, Color:'#ffffff' },
                                                {id:11, Bezeichnung:'schwarz', Icon:0xf111, Color:'#000000' }
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
                                                    cls: 'kijs-inline',
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
                                            xtype: 'kijs.gui.Button',
                                            caption: 'Menü',
                                            iconMap: 'kijs.iconMap.Fa.bars',
                                            menuElements: [
                                                {
                                                    caption:'Hallo 1'
                                                },{
                                                    caption:'Hallo 3',
                                                    iconMap: 'kijs.iconMap.Fa.brain',
                                                }, '-', {
                                                    xtype: 'kijs.gui.Button',
                                                    caption:'MULTI',
                                                    menuElements: (function(){
                                                        let steps=150, p = [];
                                                        for (let i=0; i<steps; i++) {
                                                            p.push({
                                                                caption: 'El ' + i + ' von ' + steps
                                                            });
                                                        }
                                                        return p;
                                                    })()
                                                },{
                                                    xtype: 'kijs.gui.Button',
                                                    caption:'ENDLESS',
                                                    menuElements: (function(){
                                                        let steps=20, p = [{
                                                                caption:'ÄTSCH NICHTS DA'
                                                            }];
                                                        for (let i=0; i<steps; i++) {
                                                            p = [{
                                                                    caption: 'Stufe ' + i + ' von ' + steps
                                                                },{
                                                                    xtype: 'kijs.gui.Button',
                                                                    caption:'Nächste Stufe',
                                                                    menuElements:p
                                                                }];
                                                        }
                                                        return p;
                                                    })()
                                                }
                                            ]
                                        },{
                                            xtype: 'kijs.gui.Button',
                                            caption: 'Menü',
                                            iconMap: 'kijs.iconMap.Fa.heart-circle-minus',
                                            on: {
                                                click: function() {
                                                    let spinBox = new kijs.gui.SpinBox({
                                                        target: this,
                                                        targetPos: 'tl',
                                                        ownPos: 'bl',
                                                        innerStyle: {
                                                            padding: '10px'
                                                        },
                                                        html: 'Ich bin eine SpinBox mit etwas HTML-Inhalt<br>Bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla.'
                                                    });
                                                    spinBox.show();
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
                                            badgeText: 'test',
                                            tooltip: 'Da darfst Du nicht draufdrücken!',
                                            on: {click: function() {
                                                this.tooltip = 'Nein, er hat es tatsächlich getan!';
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
                                    facadeFnLoad: 'form.load',
                                    facadeFnSave: 'form.save',
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
                                                /*overflowY: 'auto'*/
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
                                            tooltip: 'Disable/Enable dataview',
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
                                            on: {click: function(e) {
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
                                    caption: 'Datumsbereich',
                                    iconMap: 'kijs.iconMap.Fa.calendar-days',
                                    on: {click: function() {
                                        let window = new kijs.gui.Window({
                                            target: this.parent.parent.down('addressPanel'),
                                            targetDomProperty: 'innerDom',
                                            caption: 'Datumsbereich',
                                            iconMap: 'kijs.iconMap.Fa.calendar-days',
                                            collapsible: 'top',
                                            maximized: false,
                                            modal: true,
                                            height: 290,
                                            width: 188,
                                            elements:[{
                                                    xtype: 'kijs.gui.DatePicker',
                                                    mode: 'range'
                                            }]
                                        });
                                        window.show();
                                    }}
                                },{
                                    xtype: 'kijs.gui.Button',
                                    caption: 'Uhrzeit',
                                    iconMap: 'kijs.iconMap.Fa.clock',
                                    on: {click: function() {
                                        let window = new kijs.gui.Window({
                                            target: this.parent.parent.down('addressPanel'),
                                            targetDomProperty: 'innerDom',
                                            caption: 'Fenster',
                                            iconMap: 'kijs.iconMap.Fa.window-restore',
                                            collapsible: 'top',
                                            maximized: false,
                                            modal: true,
                                            height: 400,
                                            width: 260,
                                            elements:[
                                                {
                                                    xtype: 'kijs.gui.TimePicker',
                                                    minutesHide: false,
                                                    secondsHide: false,
                                                    inputHide: false,
                                                    on: {
                                                        change: function(e) {
                                                            console.log('change: ' + e.element.value);
                                                        }
                                                    }
                                                }
                                            ]
                                        });
                                        window.show();
                                    }}
                                },{
                                    xtype: 'kijs.gui.Button',
                                    caption: 'Progress Bar',
                                    iconMap: 'kijs.iconMap.Fa.bars-progress',
                                    on: {click: function() {
                                        let pgWin = new kijs.gui.Window({
                                            caption: 'Progressbar',
                                            iconMap: 'kijs.iconMap.Fa.bars-progress',
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
                                    iconMap: 'kijs.iconMap.Fa.person-through-window',
                                    on: {click: function() {
                                        let window = new kijs.gui.Window({
                                            caption: 'Fenster',
                                            iconMap: 'kijs.iconMap.Fa.person-through-window',
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
                                                },{
                                                    xtype: 'kijs.gui.Button',
                                                    caption: 'Mask',
                                                    isDefault: true,
                                                    on: {
                                                        click: function() {
                                                            let waitMask = new kijs.gui.Mask({
                                                                displayWaitIcon: true,
                                                                target: window
                                                            });
                                                            waitMask.show();
                                                        }
                                                    }
                                                }
                                            ]
                                        });
                                        window.show();
                                    }}
                                },{
                                    xtype: 'kijs.gui.Button',
                                    caption: 'Fenster modal',
                                    iconMap: 'kijs.iconMap.Fa.window-maximize',
                                    on: {click: function() {
                                        let window = new kijs.gui.Window({
                                            caption: 'Fenster',
                                            iconMap: 'kijs.iconMap.Fa.window-maximize',
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
                                                    iconChar: 0xf2d0
                                                }
                                            ]
                                        });
                                        window.show();
                                        window.elements[0].on('click', function() {
                                            let window2 = new kijs.gui.Window({
                                                caption: 'Fenster',
                                                iconMap: 'kijs.iconMap.Fa.window-maximize',
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
                                    iconMap: 'kijs.iconMap.Fa.window-maximize',
                                    on: {click: function() {
                                        let window = new kijs.gui.Window({
                                            target: this.parent.parent.down('addressPanel'),
                                            targetDomProperty: 'innerDom',
                                            caption: 'Fenster',
                                            iconMap: 'kijs.iconMap.Fa.window-maximize',
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
                                    iconMap: 'kijs.iconMap.Fa.mask',
                                    on: {click: function() {
                                        let addressPanel = this.parent.parent.down('addressPanel');
                                        addressPanel.displayWaitMask = !addressPanel.displayWaitMask;
                                    }}
                                },{
                                    xtype: 'kijs.gui.Button',
                                    caption: 'Lochmaske',
                                    iconMap: 'kijs.iconMap.Fa.masks-theater',
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
                                    iconMap: 'kijs.iconMap.Fa.arrows-rotate',
                                    on: {click: function() {
                                        location.reload();
                                    }}
                                },{
                                    xtype: 'kijs.gui.Button',
                                    caption: 'Schliessen',
                                    iconMap: 'kijs.iconMap.Fa.store-slash',
                                    on: {click: function() {
                                        viewport.destruct();
                                    }}
                                }
                            ],
                            footerBarElements:[
                                {
                                    xtype: 'kijs.gui.Button',
                                    iconMap: 'kijs.iconMap.Fa.cat',
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
                            iconMap: 'kijs.iconMap.Fa.magnifying-glass',
                            collapsible: 'right',
                            width: 240,
                            cls: 'kijs-flexrow',
                            style: {
                                flex: "none"
                            },
                            headerBarElements:[
                                {
                                    xtype: 'kijs.gui.Button',
                            iconMap: 'kijs.iconMap.Fa.print',
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
                                    window.__testState = window.__testState || 0;
                                    let el = this.parent.elements[0];
                                    let html = 'Text mit <span style="color:#f00">Formatierung</span>';
                                    switch (window.__testState) {
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
                                    window.__testState++;
                                    if (window.__testState > 2) {
                                        window.__testState = 0;
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

    createTreeRecursive(maxDeep, maxSubitem=15, currentDeep=0) {
        if (currentDeep > maxDeep) {
            return [];
        }
        let treeElements = [];
        let random = kijs.Number.random(0, maxSubitem);
        for (var i=0; i<random; i++) {
            treeElements.push({
                caption: 'Baum ' + currentDeep + '-' + i,
                elements: this.createTreeRecursive(maxDeep, maxSubitem, currentDeep+1)
            });
        }

        return treeElements;
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
//80.219.144.161