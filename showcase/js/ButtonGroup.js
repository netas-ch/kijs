/* global kijs */

window.sc = {};
sc.ButtonGroup = class sc_ButtonGroup {
    
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
            caption: 'kijs.gui.ButtonGroup',
            autoScroll: true,
            style: {
                flex: 1
            },
            innerStyle: {
                padding: '10px'
            },
            elements:[
                {
                    xtype: 'kijs.gui.Panel',
                    caption: 'Panel',
                    iconCls: 'icoWizard16',
                    shadow: true,
                    closable: true,
                    collapsible: 'top',
                    collapsed: false,
                    maximizable: true,
                    maximized: false,
                    resizable: true,
                    autoScroll: true,
                    width: 500,
                    height: 400,
                    
                    headerCls: 'kijs-flexrow',
                    
                    headerElements: [
                        {
                            xtype: 'kijs.gui.ButtonGroup',
                            rowSizes:[2],
                            caption: 'Funktionen',
                            width: 350,
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
                                }
                            ]
                        },{
                            xtype: 'kijs.gui.ButtonGroup',
                            rowSizes:[2],
                            caption: 'Filter',
                            width: 350,
                            height: 80,
                            columns: 2,
                            elements: [
                                {
                                    xtype: 'kijs.gui.field.Text',
                                    label: 'Name'
                                },{
                                    xtype: 'kijs.gui.field.Text',
                                    label: 'Vorname'
                                },{
                                    xtype: 'kijs.gui.Button',
                                    caption: 'Sterne',
                                    iconMap: 'kijs.iconMap.Fa.star',
                                    badgeText: '2'
                                }
                            ]
                        }
                    ],

                    elements: [],

                    footerCaption: 'Meine FooterBar',
                    footerStyle: { padding: '10px' },
                    footerElements: [
                        {
                            xtype: 'kijs.gui.Button',
                            caption: 'OK',
                            iconMap: 'kijs.iconMap.Fa.check',
                            isDefault: true
                        },{
                            xtype: 'kijs.gui.Button',
                            caption: 'Abbrechen',
                            iconMap: 'kijs.iconMap.Fa.xmark'
                        }
                    ]

                }
            ]
        });
        
        return this._content;
    }
    
    run() {

    }

        

    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct() {
        this._content = null;
    }
};