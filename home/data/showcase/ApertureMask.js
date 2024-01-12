/* global kijs */

home.sc.ApertureMask = class home_sc_ApertureMask {
    
    
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
            caption: 'kijs.gui.ApertureMask',
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
                    
                    elements: [
                        {
                            xtype: 'kijs.gui.Element',
                            name: 'element1',
                            html: 'Element 1',
                            style: { 
                                flex: 1,
                                margin: '10px',
                                //border:'1px solid #f00',
                                backgroundColor:'#bbb',
                                textAlign: 'center'
                            }
                        }
                    ],

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

                },
                
                {
                    xtype: 'kijs.gui.Element',
                    name: 'element2',
                    html: 'Element 2',
                    width: 200,
                    style: { 
                        margin: '15px',
                        //border:'1px solid #f00',
                        backgroundColor:'#bbb',
                        textAlign: 'center'
                    }
                },
                
                {
                    xtype: 'kijs.gui.Element',
                    html: 'ApertureMask für 3s anzeigen auf:',
                    style: { margin: '10px 0 4px 0'}
                },{
                    xtype: 'kijs.gui.Container',
                    cls: 'kijs-flexline',
                    elements: [
                        {
                            xtype: 'kijs.gui.Button',
                            caption: 'Content-Panel',
                            iconMap: 'kijs.iconMap.Fa.crop-simple',
                            on: {
                                click: function(e) {
                                    this._test(this._content);
                                },
                                context: this
                            }
                        },{
                            xtype: 'kijs.gui.Button',
                            caption: 'Panel',
                            iconMap: 'kijs.iconMap.Fa.crop-simple',
                            on: {
                                click: function(e) {
                                    this._test(this._content.downX('kijs.gui.Panel'));
                                },
                                context: this
                            }
                        },{
                            xtype: 'kijs.gui.Button',
                            caption: 'Panel.innerDom',
                            iconMap: 'kijs.iconMap.Fa.crop-simple',
                            on: {
                                click: function(e) {
                                    this._test(this._content.downX('kijs.gui.Panel').innerDom);
                                },
                                context: this
                            }
                        },{
                            xtype: 'kijs.gui.Button',
                            caption: 'Element 1',
                            iconMap: 'kijs.iconMap.Fa.crop-simple',
                            on: {
                                click: function(e) {
                                    this._test(this._content.downX('kijs.gui.Panel').down('element1'));
                                },
                                context: this
                            }
                        },{
                            xtype: 'kijs.gui.Button',
                            caption: 'Element 1.dom',
                            iconMap: 'kijs.iconMap.Fa.crop-simple',
                            on: {
                                click: function(e) {
                                    this._test(this._content.downX('kijs.gui.Panel').down('element1').dom);
                                },
                                context: this
                            }
                        },{
                            xtype: 'kijs.gui.Button',
                            caption: 'Element 2',
                            iconMap: 'kijs.iconMap.Fa.crop-simple',
                            on: {
                                click: function(e) {
                                    this._test(this._content.down('element2'));
                                },
                                context: this
                            }
                        },{
                            xtype: 'kijs.gui.Button',
                            caption: 'Element 2.dom',
                            iconMap: 'kijs.iconMap.Fa.crop-simple',
                            on: {
                                click: function(e) {
                                    this._test(this._content.down('element2').dom);
                                },
                                context: this
                            }
                        }
                    ]
                },
                
                {
                    xtype: 'kijs.gui.field.Number',
                    name: 'duration',
                    label: 'duration:',
                    value: 3000,
                    inputWidth: 40,
                    style: { margin: '10px 0 0 0'}
                },{
                    xtype: 'kijs.gui.field.Checkbox',
                    name: 'animated',
                    caption: 'animated',
                    value: true
                },{
                    xtype: 'kijs.gui.field.Checkbox',
                    name: 'testResize',
                    caption: 'test resize panel'
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

    _test(target) {
        const duration = this._content.down('duration').value;
        const animated = !!this._content.down('animated').value;
        const testResizePanel = !!this._content.down('testResize').value;
        
        const mask = new kijs.gui.ApertureMask({
            target: target,
            animated: animated
        });
        mask.show();
        
        if (testResizePanel) {
            const panel = this._content.downX('kijs.gui.Panel');
            
            kijs.defer(function() {
                panel.height = 200 + Math.random() * 200;
                panel.width = 200 + Math.random() * 600;
            }, 1000, this);
        }

        // maske nach gewünschter Zeit wieder entfernen
        if (duration) {
            kijs.defer(function() {
                mask.hide();
            }, duration, this);
        }
    }
    
    

    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct() {
        this._content = null;
    }
    
};