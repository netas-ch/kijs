/* global kijs */

home.sc.Window = class home_sc_Window {
    
    
    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        this._app = config.app;
        this._content = null;
        this._win1 = null;
        this._wins2 = [];
    }
    
    
    
    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    getContent() {
        this._content = new kijs.gui.Panel({
            caption: 'kijs.gui.Window',
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
                    xtype: 'kijs.gui.Button',
                    caption: 'Run',
                    iconMap: 'kijs.iconMap.Fa.play',
                    on: {
                        click: this.run,
                        context: this
                    }
                }
            ]
        });
        
        return this._content;
    }
    
    run() {
        this._win1 = new kijs.gui.Window({
            caption: 'Fenster mit Maske',
            iconCls: 'icoWizard16',
            //modal: true,
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
                    //tooltip: { html: '<p>Test</p>', followPointer: false },
                    tooltip: 'Test',
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
                    xtype: 'kijs.gui.field.Switch',
                    label: 'modal',
                    on: {
                        change: function(e) {
                            this._win1.modal = !!e.element.value;
                        },
                        context: this
                    }
                },{
                    xtype: 'kijs.gui.Separator'
                },{
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
                    caption: 'WaitMask',
                    badgeText: 1,
                    menuElements: [
                        {
                            xtype: 'kijs.gui.Button',
                            caption: 'add',
                            iconMap: 'kijs.iconMap.Fa.circle-plus',
                                on: {
                                click: function() {
                                    this.upX('kijs.gui.Window').downX('kijs.gui.Container').waitMaskAdd();
                                    this.upX('kijs.gui.Button').badgeText += 1;
                                }
                            }
                        },{
                            xtype: 'kijs.gui.Button',
                            caption: 'remove',
                            iconMap: 'kijs.iconMap.Fa.circle-minus',
                            on: {
                                click: function() {
                                    this.upX('kijs.gui.Window').downX('kijs.gui.Container').waitMaskRemove();
                                    let count = this.upX('kijs.gui.Button').badgeText;
                                    count -= 1;
                                    if (count < 0) {
                                        count = 0;
                                    }
                                    this.upX('kijs.gui.Button').badgeText = count;
                                }
                            }
                        }
                    ]
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

            footerBarCaption: 'Meine FooterBar',
            footerElements: [
                '>',
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
        
        this._openWindow();
    }


    // PROTECTED
    _getHeaderElements() {
        return [
            {
                xtype: 'kijs.gui.field.Switch',
                label: 'disabled',
                on: {
                    change: function(e) {
                        if (this._win1) {
                            this._win1.disabled = !!e.element.value;
                        }

                        if (!kijs.isEmpty(this._wins2)) {
                            kijs.Array.each(this._wins2, (win)=>{
                                win.disabled = !!e.element.value;
                            }, this);
                        }
                    },
                    context: this
                }
            },{
                xtype: 'kijs.gui.Separator'
            },{
                xtype: 'kijs.gui.Button',
                caption: 'Top Win Caption',
                on: {
                    click: function(e) {
                        const lm = new kijs.gui.LayerManager();
                        const win = lm.getActive(document.body);
                        if (win) {
                            kijs.gui.CornerTipContainer.show('Test', win.headerBar.html);
                        }
                    },
                    context: this
                }
            }
        ];
    }

    _openWindow(isModal=false) {
        let no = this._wins2.length + 1;
        let win = new kijs.gui.Window({
            caption: 'Mein ' + no + '. Fenster',
            modal: !!isModal,
            width: 400,
            height: 300,
            cls: 'kijs-flexform',
            innerStyle: { 
                padding: '10px'/*,
                gap: '10px'*/
            },
            headerElements:[
                {
                    xtype: 'kijs.gui.field.Switch',
                    label: 'modal',
                    value: !!isModal,
                    on: {
                        change: function(e) {
                            this.upX('kijs.gui.Window').modal = !!e.element.value;
                        }
                    }
                }
            ],
            elements:[
                {
                    xtype: 'kijs.gui.Button',
                    caption: 'Weiteres Fenster normal öffnen',
                    tooltip: 'Weiteres Fenster normal öffnen',
                    on: {
                        click: function(e) {
                            this._openWindow(false);
                        },
                        context: this
                    }
                },{
                    xtype: 'kijs.gui.Button',
                    caption: 'Weiteres Fenster modal öffnen',
                    tooltip: 'Weiteres Fenster modal öffnen',
                    on: {
                        click: function(e) {
                            this._openWindow(true);
                        },
                        context: this
                    }
                }
            ],
            on: {
                destruct: function(e) {
                    kijs.Array.remove(this._wins2, e.raiseElement);
                },
                context: this
            }
        });
        this._wins2.push(win);
        win.show();
    }



    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct() {
        if (this._win1) {
            this._win1.destruct();
        }
        
        if (!kijs.isEmpty(this._wins2)) {
            kijs.Array.each(this._wins2, (win)=>{
                win.destruct();
            }, this);
        }
        
        this._win1 = null;
        this._wins2 = null;
        this._content = null;
    }
    
};