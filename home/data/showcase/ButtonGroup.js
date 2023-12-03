/* global kijs */

home.sc.ButtonGroup = class home_sc_ButtonGroup {
    
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
                    caption: 'Panel',
                    iconCls: 'icoWizard16',
                    closable: true,
                    collapsible: 'top',
                    collapsed: false,
                    maximizable: true,
                    maximized: false,
                    resizable: true,
                    scrollableY: 'auto',
                    width: 500,
                    height: 400,
                    
                    //headerCls: 'kijs-flexrow',
                    
                    headerElements: [
                        {
                            xtype: 'kijs.gui.ButtonGroup',
                            rowSizes:[2],
                            caption: 'Funktionen',
                            width: 250,
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

                    footerBarCaption: 'Meine FooterBar',
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