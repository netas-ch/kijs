/* global kijs */

window.sc = {};
sc.Window = class sc_Window {
    
    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        this._app = config.app;
        this._content = null;
        this._win1 = null;
        this._win2 = null;
    }
    
    
    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    getContent() {
        this._content = new kijs.gui.Panel({
            caption: 'kijs.gui.Window',
            autoScroll: true,
            style: {
                flex: 1
            },
            innerStyle: {
                padding: '10px'
            },
            elements:[
                
            ]
        });
        
        return this._content;
    }
    
    run() {
        this._win1 = new kijs.gui.Window({
            caption: 'Mein Fenster',
            iconCls: 'icoWizard16',
            modal: true,
            width: 450,
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
                },{
                    xtype: 'kijs.gui.Button',
                    caption: 'remove WaitMask',
                    badgeText: '2',
                    on: {
                        click: function() {
                            this.upX('kijs.gui.Window').downX('kijs.gui.Container').waitMaskRemove();
                        }
                    }
                },{
                    xtype: 'kijs.gui.Button',
                    caption: 'add WaitMask',
                    on: {
                        click: function() {
                            this.upX('kijs.gui.Window').downX('kijs.gui.Container').waitMaskAdd();
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
                    displayWaitMask: true,
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
                             this.upX('kijs.gui.Window').close();
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
                            this.upX('kijs.gui.Window').close();
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
            ]
        });
        this._win1.show();
        
        
        this._win2 = new kijs.gui.Window({
            caption: 'Mein 2. Fenster',
            html: 'Gugus',
            //target: testCont,
            modal: true,
            width: 400,
            height: 300
        });
        this._win2.show();
    }


    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct() {
        if (this._win1) {
            this._win1.destruct();
        }
        
        if (this._win2) {
            this._win2.destruct();
        }
        
        this._win1 = null;
        this._win2 = null;
        this._content = null;
    }
};