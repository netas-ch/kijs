/* global kijs */

home.sc.PanelBar = class home_sc_PanelBar {
    
    
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
            caption: 'kijs.gui.PanelBar',
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
                    xtype: 'kijs.gui.PanelBar',
                    html: 'Meine PanelBar',
                    style: {
                        marginBottom: '10px'
                    },
                    iconCls: 'icoWizard16',
                    elementsLeft: [
                        {
                            xtype: 'kijs.gui.Button',
                            iconMap: 'kijs.iconMap.Fa.user',
                            badgeText: '5'
                        },{
                            xtype: 'kijs.gui.Button',
                            iconMap: 'kijs.iconMap.Fa.star',
                            badgeText: '6'
                        },{
                            xtype: 'kijs.gui.Button',
                            caption: 'Hide',
                            iconCls: 'icoWizard16',
                            tooltip: { html: '<p>Test</p>', followPointer: false },
                            on: {
                                click: function() {
                                    this.visible = false;
                                }
                            }
                        }
                    ],
                    elementsRight: [
                        {
                            xtype: 'kijs.gui.Button',
                            caption: 'Hide',
                            iconCls: 'icoWizard16',
                            tooltip: { html: '<p>Test</p>', followPointer: false },
                            on: {
                                click: function() {
                                    this.visible = false;
                                }
                            }
                        },{
                            xtype: 'kijs.gui.Button',
                            iconMap: 'kijs.iconMap.Fa.music',
                            badgeText: '5'
                        },{
                            xtype: 'kijs.gui.Separator'
                        },{
                            xtype: 'kijs.gui.Button',
                            iconMap: 'kijs.iconMap.Fa.face-smile',
                            badgeText: '6'
                        }
                    ]
                },

                {
                    xtype: 'kijs.gui.PanelBar',
                    html: 'Meine HeaderBar',
                    cls: 'kijs-headerbar',
                    style: {
                        marginBottom: '10px'
                    },
                    /*iconCls: 'icoWizard16',*/
                    elementsRight: [
                        {
                            xtype: 'kijs.gui.Button',
                            caption: 'Hide',
                            iconCls: 'icoWizard16',
                            tooltip: { html: '<p>Test</p>', followPointer: false },
                            on: {
                                click: function() {
                                    this.visible = false;
                                }
                            }
                        },{
                            xtype: 'kijs.gui.Button',
                            iconMap: 'kijs.iconMap.Fa.music',
                            badgeText: '5'
                        },{
                            xtype: 'kijs.gui.Separator'
                        },{
                            xtype: 'kijs.gui.Button',
                            iconMap: 'kijs.iconMap.Fa.face-smile',
                            badgeText: '6'
                        }
                    ]
                },

                {
                    xtype: 'kijs.gui.PanelBar',
                    html: 'Meine PanelBar (freistehend)',
                    cls: 'kijs-headerbar-center',
                    style: {
                        marginBottom: '10px'
                    },
                    elementsLeft: [
                        {
                            xtype: 'kijs.gui.Button',
                            iconMap: 'kijs.iconMap.Fa.music'
                        }
                    ],
                    elementsRight: [
                        {
                            xtype: 'kijs.gui.Button',
                            iconMap: 'kijs.iconMap.Fa.face-smile'
                        }
                    ]
                },

                {
                    xtype: 'kijs.gui.PanelBar',
                    html: 'Meine FooterBar',
                    cls: 'kijs-footerbar',
                    style: {
                        marginBottom: '10px'
                    },
                    iconCls: 'icoWizard16',
                    elementsLeft: [
                        {
                            xtype: 'kijs.gui.Button',
                            iconMap: 'kijs.iconMap.Fa.music',
                            badgeText: '5'
                        },{
                            xtype: 'kijs.gui.Button',
                            iconMap: 'kijs.iconMap.Fa.face-smile',
                            badgeText: '6'
                        },{
                            xtype: 'kijs.gui.Button',
                            caption: 'Hide',
                            iconCls: 'icoWizard16',
                            tooltip: { html: '<p>Test</p>', followPointer: false },
                            on: {
                                click: function() {
                                    this.visible = false;
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