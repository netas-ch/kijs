/* global kijs */

// --------------------------------------------------------------
// kit.App
// --------------------------------------------------------------
kit = {};
kit.App = class kit_App {

    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    run() {
        // ViewPort erstellen
        let viewport = new kijs.gui.ViewPort({
            cls: 'kijs-flexcolumn',
            on: {
                afterResize: function() {
                    if (!this.__count) {
                        this.__count = 0;
                    }
                    this.__count++;
                    this.elements[0].elements[2].html = 'viewPort afterResize: ' + this.__count;
                }
            },
            elements: [                
                // TOP
                {
                    xtype: 'kijs.gui.Panel',
                    caption: 'Panel',
                    iconCls: 'icoWizard16',
                    collapsible: 'top',
                    collapsed: false,
                    height: 250,
                    cls: 'kijs-flexrow',
                    headerBarElements:[
                        {
                            xtype: 'kijs.gui.Button',
                            iconChar: '&#xf059'
                        },{
                            xtype: 'kijs.gui.Button',
                            iconChar: '&#xf059',
                            disabled: true
                        }
                    ],
                    elements:[
                        {
                            xtype: 'kijs.gui.Panel',
                            caption: 'Panel',
                            collapsible: 'left',
                            collapsed: false,
                            width: 300,
                            on: {
                                afterResize: function() {
                                    if (!this.__count) {
                                        this.__count = 0;
                                    }
                                    this.__count++;
                                    this.headerBar.caption = 'afterResize: ' + this.__count;
                                }
                            },
                            elements:[
                                {
                                    xtype: 'kijs.gui.Button',
                                    caption: 'Fenster mit Target öffnen',
                                    on: {
                                        click: function() {
                                            new kijs.gui.Window({
                                                caption: 'Fenster',
                                                target: this.upX('kijs.gui.Panel'),
                                                modal: true,
                                                collapsible: 'top',
                                                height: 100,
                                                width: 200,
                                                on: {
                                                    afterResize: function() {
                                                        if (!this.__count) {
                                                            this.__count = 0;
                                                        }
                                                        this.__count++;
                                                        this.headerBar.caption = 'afterResize: ' + this.__count;
                                                    }
                                                }
                                            }).show();
                                        }
                                    }
                                },{
                                    xtype: 'kijs.gui.Button',
                                    caption: 'Fenster öffnen',
                                    on: {
                                        click: function() {
                                            new kijs.gui.Window({
                                                caption: 'Fenster',
                                                collapsible: 'top',
                                                height: 100,
                                                width: 200,
                                                on: {
                                                    afterResize: function() {
                                                        if (!this.__count) {
                                                            this.__count = 0;
                                                        }
                                                        this.__count++;
                                                        this.headerBar.caption = 'afterResize: ' + this.__count;
                                                    }
                                                }
                                            }).show();
                                        }
                                    }
                                }
                            ]
                        },{
                            xtype: 'kijs.gui.Splitter',
                            targetPos: 'left'
                        },{
                            xtype: 'kijs.gui.Panel',
                            caption: 'Panel',
                            style: {
                                flex: 1,
                                minWidth: '40px'
                            },
                            on: {
                                afterResize: function() {
                                    if (!this.__count) {
                                        this.__count = 0;
                                    }
                                    this.__count++;
                                    this.headerBar.caption = 'afterResize: ' + this.__count;
                                }
                            }
                        }
                    ],
                    on: {
                        afterResize: function() {
                            if (!this.__count) {
                                this.__count = 0;
                            }
                            this.__count++;
                            this.headerBar.caption = 'afterResize: ' + this.__count;
                        }
                    }
                },{
                    xtype: 'kijs.gui.Splitter',
                    targetPos: 'top'
                },{
                    xtype: 'kijs.gui.Container',
                    cls: 'kijs-flexrow',
                    style: {
                        flex: 1,
                        minHeight: '40px'
                    },
                    elements: [
                        // LEFT
                        {
                            xtype: 'kijs.gui.Panel',
                            caption: 'Panel',
                            iconChar: '&#xf110',
                            iconCls: 'kijs-pulse',
                            collapsible: 'left',
                            width: 180,
                            cls: 'kijs-flexcolumn',
                            on: {
                                afterResize: function() {
                                    if (!this.__count) {
                                        this.__count = 0;
                                    }
                                    this.__count++;
                                    this.headerBar.caption = 'afterResize: ' + this.__count;
                                }
                            }
                        },{
                            xtype: 'kijs.gui.Splitter',
                            targetPos: 'left'
                        },
                        // CENTER
                        {
                            xtype: 'kijs.gui.Panel',
                            caption: 'Panel',
                            iconChar: '&#xf2bc',
                            footerCaption: 'FooterBar',
                            cls: 'kijs-flexrow',
                            style: {
                                flex: 1,
                                minWidth: '40px'
                            },
                            innerStyle: {
                                padding: '10px',
                                overflowY: 'auto'
                            },
                            headerBarElements:[
                                {
                                    xtype: 'kijs.gui.Button',
                                    iconChar: '&#xf085'
                                }
                            ],
                            headerCls: 'kijs-flexrow',
                            headerStyle: {
                                flex: 1,
                                minWidth: '40px',
                                padding: '10px'
                            },
                            headerElements: [
                                // CENTER-HEADER-LEFT
                                {
                                    xtype: 'kijs.gui.Panel',
                                    caption: 'Panel Header L',
                                    style: {
                                        flex: 1,
                                        minWidth: '40px'
                                    },
                                    on: {
                                        afterResize: function() {
                                            if (!this.__count) {
                                                this.__count = 0;
                                            }
                                            this.__count++;
                                            this.headerBar.caption = 'Header L: afterResize: ' + this.__count;
                                        }
                                    }
                                },{
                                    xtype: 'kijs.gui.Splitter',
                                    targetPos: 'right'
                                // CENTER-HEADER-RIGHT
                                },{
                                    xtype: 'kijs.gui.Panel',
                                    caption: 'Panel Header R',
                                    collapsible: 'right',
                                    width: 200,
                                    on: {
                                        afterResize: function() {
                                            if (!this.__count) {
                                                this.__count = 0;
                                            }
                                            this.__count++;
                                            this.headerBar.caption = 'Header R: afterResize: ' + this.__count;
                                        }
                                    }
                                }
                            ],
                            elements:[
                                {
                                    xtype: 'kijs.gui.Panel',
                                    caption: 'Panel',
                                    collapsible: 'left',
                                    collapsed: false,
                                    width: 300,
                                    on: {
                                        afterResize: function() {
                                            if (!this.__count) {
                                                this.__count = 0;
                                            }
                                            this.__count++;
                                            this.headerBar.caption = 'afterResize: ' + this.__count;
                                        }
                                    }
                                },{
                                    xtype: 'kijs.gui.Splitter',
                                    targetPos: 'left'
                                },{
                                    xtype: 'kijs.gui.Panel',
                                    caption: 'Panel',
                                    style: {
                                        flex: 1,
                                        minWidth: '40px'
                                    },
                                    on: {
                                        afterResize: function() {
                                            if (!this.__count) {
                                                this.__count = 0;
                                            }
                                            this.__count++;
                                            this.headerBar.caption = 'afterResize: ' + this.__count;
                                        }
                                    }
                                }
                            ],
                            footerCls: 'kijs-flexrow',
                            footerStyle: {
                                flex: 1,
                                minWidth: '40px',
                                padding: '10px'
                            },
                            footerElements: [
                                // CENTER-FOOTER-LEFT
                                {
                                    xtype: 'kijs.gui.Panel',
                                    caption: 'Panel Footer L',
                                    style: {
                                        flex: 1,
                                        minWidth: '40px'
                                    },
                                    on: {
                                        afterResize: function() {
                                            if (!this.__count) {
                                                this.__count = 0;
                                            }
                                            this.__count++;
                                            this.headerBar.caption = 'Footer L: afterResize: ' + this.__count;
                                        }
                                    }
                                },{
                                    xtype: 'kijs.gui.Splitter',
                                    targetPos: 'right'
                                // CENTER-FOOTER-RIGHT
                                },{
                                    xtype: 'kijs.gui.Panel',
                                    caption: 'Panel Footer R',
                                    collapsible: 'right',
                                    width: 200,
                                    on: {
                                        afterResize: function() {
                                            if (!this.__count) {
                                                this.__count = 0;
                                            }
                                            this.__count++;
                                            this.headerBar.caption = 'Footer R: afterResize: ' + this.__count;
                                        }
                                    }
                                }
                            ],
                            footerBarElements:[
                                {
                                    xtype: 'kijs.gui.Button',
                                    iconChar: '&#xf085'
                                }
                            ],
                            on: {
                                afterResize: function() {
                                    if (!this.__count) {
                                        this.__count = 0;
                                    }
                                    this.__count++;
                                    this.headerBar.caption = 'afterResize: ' + this.__count;
                                }
                            }

                        },
                        // RIGHT
                        {
                            xtype: 'kijs.gui.Splitter',
                            targetPos: 'right'
                        },{
                            xtype: 'kijs.gui.Panel',
                            caption: 'Panel',
                            iconChar: '&#xf2c8',
                            collapsible: 'right',
                            width: 240,
                            cls: 'kijs-flexrow',
                            headerBarElements:[
                                {
                                    xtype: 'kijs.gui.Button',
                                    iconChar: '&#xf02f'
                                }
                            ],
                            on: {
                                afterResize: function() {
                                    if (!this.__count) {
                                        this.__count = 0;
                                    }
                                    this.__count++;
                                    this.headerBar.caption = 'afterResize: ' + this.__count;
                                }
                            }
                        }
                    ]
                },
                // BOTTOM
                {
                    xtype: 'kijs.gui.Splitter',
                    targetPos: 'bottom'
                },{
                    xtype: 'kijs.gui.Panel',
                    caption: 'Panel',
                    collapsible: 'bottom',
                    collapsed: false,
                    height: 100,
                    on: {
                        afterResize: function() {
                            if (!this.__count) {
                                this.__count = 0;
                            }
                            this.__count++;
                            this.headerBar.caption = 'afterResize: ' + this.__count;
                        }
                    }
                }
            ]
        });
        viewport.render();
    }
    
    
    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct() {

    }
    
};