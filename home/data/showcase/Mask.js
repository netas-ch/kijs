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
                            html: 'rot',
                            tooltip: 'maskCount: 0',
                            height: 50,
                            style: { 
                                flex: 1,
                                border:'4px solid #f00',
                                textAlign: 'center'
                            }
                        },{
                            xtype: 'kijs.gui.Element',
                            name: 'elGreen',
                            html: 'grün',
                            tooltip: 'maskCount: 1',
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
                            html: 'blau',
                            tooltip: 'maskCount: 0',
                            height: 50,
                            style: { 
                                flex: 1,
                                borderRadius: '20px',
                                border:'1px solid #00f',
                                textAlign: 'center'
                            }
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
                                    targetEl.tooltip = 'maskCount: ' + targetEl._waitMaskCount;
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
                                    targetEl.tooltip = 'maskCount: ' + targetEl._waitMaskCount;
                                },
                                context: this
                            }
                        }
                    ]
                },
                
                
                {
                    xtype: 'kijs.gui.field.Display',
                    cls: 'kijs-titleLarge',
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
                            maximizable: true,
                            height: 100,
                            width: 200,
                            style: { margin: '10px' },
                            innerStyle: { padding: '10px' },
                            html: 'Maske auf ganzem Panel'
                        },{
                            xtype: 'kijs.gui.Panel',
                            caption: 'Panel',
                            maximizable: true,
                            waitMaskTargetDomProperty: 'innerDom',
                            displayWaitMask: true,
                            height: 100,
                            width: 200,
                            style: { margin: '10px' },
                            innerStyle: { padding: '10px' },
                            html: 'Maske nur auf innerDom'
                        }
                    ]
                },


                {
                    xtype: 'kijs.gui.field.Display',
                    cls: 'kijs-titleLarge',
                    value: 'Maske mit Text:',
                    style: { margin: '20px 0 0 0'}
                },{
                    xtype: 'kijs.gui.Container',
                    cls: 'kijs-flexrow',
                    elements:[
                        {
                            xtype: 'kijs.gui.Panel',
                            caption: 'Panel',
                            height: 100,
                            maximizable: true,
                            width: 200,
                            style: { margin: '10px' },
                            innerStyle: { padding: '10px' },
                            html: 'Maske mit Text',
                            on: {
                                afterFirstRenderTo: function(e) {
                                    const waitMaskEl = new kijs.gui.Mask({
                                        displayWaitIcon: true,
                                        text: 'Bitte warten...',
                                        target: e.raiseElement,
                                        targetDomProperty: 'dom'
                                    });
                                    kijs.defer(()=>{
                                        waitMaskEl.show();
                                    }, 100, this);
                                },
                                context: this
                            }
                        }
                    ]
                },


                {
                    xtype: 'kijs.gui.Container',
                    cls: 'kijs-flexline',
                    elements :[
                        {
                            xtype: 'kijs.gui.Button',
                            caption: 'Maske auf Viewport für 2s',
                            on: {
                                click: function(e) {
                                    const targetEl = this._app.viewport;
                                    targetEl.waitMaskAdd();
                                    kijs.defer(()=>{
                                        targetEl.waitMaskRemove();
                                    }, 2000, this);
                                },
                                context: this
                            }
                        },{
                            xtype: 'kijs.gui.Button',
                            caption: 'Maske auf BODY für 2s',
                            on: {
                                click: function(e) {
                                    const waitMaskEl = new kijs.gui.Mask({
                                        displayWaitIcon: true,
                                        target: document.body
                                    });
                                    waitMaskEl.show();
                                    kijs.defer(()=>{
                                        waitMaskEl.destruct();
                                    }, 2000, this);
                                },
                                context: this
                            }
                        }
                    ]
                },

                {
                    xtype: 'kijs.gui.Button',
                    caption: 'Grösse ändern',
                    height: 30,
                    style: { margin: '10px' },
                    on: {
                        click: function(e) {
                            this.height = this.height === 30 ? 100 : 30;
                        }
                    }
                },{
                    xtype: 'kijs.gui.Panel',
                    caption: 'Panel',
                    displayWaitMask: true,
                    maximizable: true,
                    height: 100,
                    width: 200,
                    style: { margin: '10px' },
                    innerStyle: { padding: '10px' },
                    html: 'Bitte Grösse ändern. Die Maske auf dem folgenden Panel sollte sich verschieben.'
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