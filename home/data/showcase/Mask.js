/* global kijs */

home.sc.Mask = class home_sc_Mask {
    
    
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
            caption: 'kijs.gui.Mask',
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
                    cls: 'kijs-flexrow',
                    innerStyle: {
                        padding: '10px',
                        gap: '10px'
                    },

                    elements: [
                        {
                            xtype: 'kijs.gui.Element',
                            name: 'elRed',
                            html: 'maskCount: 0',
                            height: 50,
                            style: { 
                                flex: 1,
                                border:'1px solid #f00',
                                textAlign: 'center'
                            }
                        },{
                            xtype: 'kijs.gui.Element',
                            name: 'elGreen',
                            html: 'maskCount: 1',
                            height: 50,
                            displayWaitMask: true,
                            style: { 
                                flex: 1,
                                border:'1px solid #0f0',
                                textAlign: 'center'
                            }
                        },{
                            xtype: 'kijs.gui.Element',
                            name: 'elBlue',
                            html: 'maskCount: 0',
                            height: 50,
                            style: { 
                                flex: 1,
                                border:'1px solid #00f',
                                textAlign: 'center'
                            }
                        }
                    ],

                    footerBarCaption: 'Meine FooterBar',
                    footerElements: [
                        {
                            xtype: 'kijs.gui.Element',
                            style: { flex: 1 }
                        },{
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

                },
                
                
                {
                    xtype: 'kijs.gui.field.OptionGroup',
                    name: 'targetElName',
                    label: 'targetEl',
                    cls: 'kijs-inline',
                    valueField: 'id',
                    captionField: 'caption',
                    iconMapField: 'icon',
                    iconColorField: 'color',
                    required: true,
                    style: { 
                        margin: '15px'
                    },
                    data: [
                        { id:'elRed', caption:'rot', color:'#f00', icon:'kijs.iconMap.Fa.droplet' },
                        { id:'elGreen', caption:'grün', color:'#0f0', icon:'kijs.iconMap.Fa.droplet' },
                        { id:'elBlue', caption:'blau', color:'#00f', icon:'kijs.iconMap.Fa.droplet' }
                    ],
                    value: 'elGreen'
                },
                
                {
                    xtype: 'kijs.gui.Container',
                    cls: 'kijs-flexline',
                    elements :[
                        {
                            xtype: 'kijs.gui.Button',
                            caption: 'addMask',
                            iconMap: 'kijs.iconMap.Fa.plus',
                            on: {
                                click: function(e) {
                                    const targetEl = this._content.down(this._content.down('targetElName').value);
                                    targetEl.waitMaskAdd();
                                    targetEl.html = 'maskCount: ' + targetEl._waitMaskCount;
                                },
                                context: this
                            }
                        },{
                            xtype: 'kijs.gui.Button',
                            caption: 'removeMask',
                            iconMap: 'kijs.iconMap.Fa.minus',
                            on: {
                                click: function(e) {
                                    const targetEl = this._content.down(this._content.down('targetElName').value);
                                    targetEl.waitMaskRemove();
                                    targetEl.html = 'maskCount: ' + targetEl._waitMaskCount;
                                },
                                context: this
                            }
                        }
                    ]
                },
                
                
                {
                    xtype: 'kijs.gui.field.Display',
                    cls: 'kijs-largeTitle',
                    value: 'Masken bei Panels:',
                    style: { margin: '20px 0 0 0'}
                },{
                    xtype: 'kijs.gui.Container',
                    cls: 'kijs-flexrow',
                    elements:[
                        {
                            xtype: 'kijs.gui.Panel',
                            caption: 'Panel',
                            displayWaitMask: true,
                            height: 100,
                            width: 200,
                            style: { margin: '10px' },
                            innerStyle: { padding: '10px' },
                            html: 'Maske auf ganzem Panel'
                        },{
                            xtype: 'kijs.gui.Panel',
                            caption: 'Panel',
                            waitMaskTargetDomProperty: 'innerDom',
                            displayWaitMask: true,
                            height: 100,
                            width: 200,
                            style: { margin: '10px' },
                            innerStyle: { padding: '10px' },
                            html: 'Maske nur auf innerDom'
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