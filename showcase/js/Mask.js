/* global kijs */

window.sc = {};
sc.Mask = class sc_Mask {
    
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
                    cls: 'kijs-flexrow',

                    elements: [
                        {
                            xtype: 'kijs.gui.Element',
                            name: 'elRed',
                            html: 'maskCount: 0',
                            height: 50,
                            style: { 
                                flex: 1,
                                margin: '10px',
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
                                margin: '10px',
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
                                margin: '10px',
                                border:'1px solid #00f',
                                textAlign: 'center'
                            }
                        }
                    ],

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
                        { id:'elRed', caption:'rot', color:'#f00', icon:'kijs.iconMap.Fa.circle' },
                        { id:'elGreen', caption:'grün', color:'#0f0', icon:'kijs.iconMap.Fa.circle' },
                        { id:'elBlue', caption:'blau', color:'#00f', icon:'kijs.iconMap.Fa.circle' }
                    ],
                    value: 'elGreen'
                },{
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
                },
                
                
                {
                    xtype: 'kijs.gui.Element',
                    html: 'Masken bei Panels:',
                    style: { margin: '20px 0 0 0'}
                },{
                    xtype: 'kijs.gui.Container',
                    cls: 'kijs-flexrow',
                    elements:[
                        {
                            xtype: 'kijs.gui.Panel',
                            caption: 'Panel',
                            shadow: true,
                            displayWaitMask: true,
                            height: 100,
                            width: 200,
                            style: { margin: '10px' },
                            innerStyle: { padding: '10px' },
                            html: 'Maske auf ganzem Panel'
                        },{
                            xtype: 'kijs.gui.Panel',
                            caption: 'Panel',
                            shadow: true,
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
    
    
    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct() {
        this._content = null;
    }
};