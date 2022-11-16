/* global kijs */

window.sc = {};
sc.Panel = class sc_Panel {
    
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
            caption: 'kijs.gui.Panel',
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
                    caption: 'Mein Panel',
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
                    defaults: {
                        xtype: 'kijs.gui.Element',
                        height: 20,
                        width: 20,
                        style: {
                            margin: '10px',
                            textAlign: 'center',
                            backgroundColor:'#ddd'
                        }
                    },

                    headerBarElements: [
                        {
                            xtype: 'kijs.gui.Button',
                            caption: 'Hide',
                            iconCls: 'icoWizard16',
                            badgeText: '1',
                            tooltip: { html: '<p>Test</p>', followPointer: false },
                            on: {
                                click: function() {
                                    this.visible = false;
                                }
                            }
                        },{
                            xtype: 'kijs.gui.Button',
                            iconMap: 'kijs.iconMap.Fa.user'
                        },{
                            xtype: 'kijs.gui.Button',
                            iconMap: 'kijs.iconMap.Fa.star',
                            badgeText: '2'
                        }
                    ],

                    headerElements: [
                        {
                            xtype: 'kijs.gui.Button',
                            iconCls: 'icoWizard16',
                            caption: 'Toggle Text',
                            badgeText: '1',
                            on: {
                                click: function() {
                                    if (this.caption === 'Text A') {
                                        this.caption = 'Text B';
                                    } else {
                                        this.caption = 'Text A';
                                    }
                                }
                            }
                        }
                    ],

                    elements: [
                        {
                            html: 'A',
                            style: { border:'1px solid #f00' }
                        },{
                            html: 'B',
                            style: { border:'1px solid #0f0' }
                        },{
                            html: 'C',
                            style: { border:'1px solid #00f' }
                        },{
                            html: 'D',
                            style: { border:'1px solid #ff0' }
                        },{
                            xtype: 'kijs.gui.Container',
                            height: null,
                            width: 200,
                            style: { 
                                border:'1px solid #000',
                                backgroundColor:'#fdf'
                            },
                            elements: [
                                {
                                    xtype: 'kijs.gui.Element',
                                    html: 'A1',
                                    style: { border:'1px solid #f00' }
                                },{
                                    xtype: 'kijs.gui.Element',
                                    html: 'B1',
                                    style: { border:'1px solid #0f0' }
                                },{
                                    xtype: 'kijs.gui.Element',
                                    html: 'C1',
                                    style: { border:'1px solid #00f' }
                                },{
                                    xtype: 'kijs.gui.Element',
                                    html: 'D1',
                                    style: { border:'1px solid #ff0' }
                                }
                            ]
                        },{
                            xtype: 'kijs.gui.Container',
                            height: null,
                            width: 200,
                            style: { 
                                border:'1px solid #000',
                                backgroundColor:'#ffd'
                            },
                            defaults: {
                                width: 80
                            },
                            elements: [
                                {
                                    xtype: 'kijs.gui.Element',
                                    html: 'A1',
                                    style: { border:'1px solid #f00' }
                                },{
                                    xtype: 'kijs.gui.Element',
                                    html: 'B1',
                                    style: { border:'1px solid #0f0' }
                                },{
                                    xtype: 'kijs.gui.Element',
                                    html: 'C1',
                                    style: { border:'1px solid #00f' }
                                },{
                                    xtype: 'kijs.gui.Element',
                                    html: 'D1',
                                    style: { border:'1px solid #ff0' }
                                }
                            ]
                        }
                    ],

                    footerCaption: 'Meine FooterBar',
                    footerStyle: { padding: '10px' },
                    footerElements: [
                        {
                            xtype: 'kijs.gui.Button',
                            caption: 'OK',
                            iconMap: 'kijs.iconMap.Fa.check',
                            badgeText: '1',
                            isDefault: true,
                            on: {
                                click: function(e) {
                                    console.log('OK click');
                                    this.upX('kijs.gui.Panel').close();
                                }
                            }
                        },{
                            xtype: 'kijs.gui.Button',
                            caption: 'Abbrechen',
                            iconMap: 'kijs.iconMap.Fa.xmark',
                            badgeText: '2',
                            on: {
                                click: function(e) {
                                    console.log('Abbrechen click');
                                    e.element.upX('kijs.gui.Panel').close();
                                }
                            }
                        }
                    ],

                    footerBarElements: [
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
                            iconMap: 'kijs.iconMap.Fa.user',
                            badgeText: '1'
                        },{
                            xtype: 'kijs.gui.Button',
                            iconMap: 'kijs.iconMap.Fa.star',
                            badgeText: '2'
                        }
                    ],
                    
                    on: {
                        afterFirstRenderTo: function() {  kijs.gui.CornerTipContainer.show('Event', 'afterFirstRenderTo'); },
                        afterRender: function() {  kijs.gui.CornerTipContainer.show('Event', 'afterRender'); },
                        expand: function() {  kijs.gui.CornerTipContainer.show('Event', 'expand'); },
                        collapse: function() {  kijs.gui.CornerTipContainer.show('Event', 'collapse'); },
                        beforeAdd: function() {  kijs.gui.CornerTipContainer.show('Event', 'beforeAdd'); },
                        add: function() {  kijs.gui.CornerTipContainer.show('Event', 'add'); },
                        beforeRemove: function() {  kijs.gui.CornerTipContainer.show('Event', 'beforeRemove'); },
                        remove: function() {  kijs.gui.CornerTipContainer.show('Event', 'remove'); },
                        childElementAfterResize: function() {  kijs.gui.CornerTipContainer.show('Event', 'childElementAfterResize'); },
                        changeVisibility: function() {  kijs.gui.CornerTipContainer.show('Event', 'changeVisibility'); },
                        close: function() {  kijs.gui.CornerTipContainer.show('Event', 'close'); },
                        unrender: function() {  kijs.gui.CornerTipContainer.show('Event', 'unrender'); },
                        destruct: function() {  kijs.gui.CornerTipContainer.show('Event', 'destruct'); },
                        context: this
                    }
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