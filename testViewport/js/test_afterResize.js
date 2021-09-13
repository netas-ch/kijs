/* global kijs */

// --------------------------------------------------------------
// kit.App
// --------------------------------------------------------------
kit = {__elements:[]};
kit.getCountPerElement = function(element, type) {
    for (var i = 0; i < kit.__elements.length; i++) {
        if (kit.__elements[i].el === element && kit.__elements[i].type === type) {
            kit.__elements[i].cnt++;
            return kit.__elements[i].cnt;
        }
    }
    kit.__elements.push({
        type: type,
        el: element,
        cnt: 1
    });
    return 1;
};
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
                    this.elements[0].elements[2].html = 'viewPort afterResize: ' + kit.getCountPerElement(this, 'afterRender');
                },
                afterRender: function() {
                    this.elements[0].elements[2].html = 'viewPort render: ' + kit.getCountPerElement(this, 'render');
                },
                unrender: function() {
                    this.elements[0].elements[2].html = 'viewPort unrender: ' + kit.getCountPerElement(this, 'unrender');
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
                                    this.caption = 'afterResize: ' + kit.getCountPerElement(this, 'afterRender');
                                },
                                afterRender: function() {
                                    console.log('render');
                                    this.caption += ' R' + kit.getCountPerElement(this, 'render');
                                },
                                unrender: function() {
                                    console.log('unrender');
                                    this.caption += 'U' + kit.getCountPerElement(this, 'unrender');
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
                                                        this.caption = 'afterResize: ' + kit.getCountPerElement(this, 'afterRender');
                                                    },
                                                    afterRender: function() {
                                                        console.log('render');
                                                    },
                                                    unrender: function() {
                                                        console.log('unrender');
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
                                                        this.caption = 'afterResize: ' + kit.getCountPerElement(this, 'afterRender');
                                                    },
                                                    afterRender: function() {
                                                        console.log('render');
                                                    },
                                                    unrender: function() {
                                                        console.log('unrender');
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
                                    this.caption = 'afterResize: ' + kit.getCountPerElement(this, 'afterRender');
                                },
                                afterRender: function() {
                                    console.log('render');
                                },
                                unrender: function() {
                                    console.log('unrender');
                                }
                            }
                        }
                    ],
                    on: {
                        afterResize: function() {
                            this.caption = 'afterResize: ' + kit.getCountPerElement(this, 'afterRender');
                        },
                        afterRender: function() {
                            console.log('render');
                        },
                        unrender: function() {
                            console.log('unrender');
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
                                    this.caption = 'afterResize: ' + kit.getCountPerElement(this, 'afterRender');
                                },
                                afterRender: function() {
                                    console.log('render');
                                },
                                unrender: function() {
                                    console.log('unrender');
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
                                            this.caption = 'Header L: afterResize: ' + kit.getCountPerElement(this, 'afterRender');
                                        },
                                        afterRender: function() {
                                            console.log('render');
                                        },
                                        unrender: function() {
                                            console.log('unrender');
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
                                            this.caption = 'Header R: afterResize: ' + kit.getCountPerElement(this, 'afterRender');
                                        },
                                        afterRender: function() {
                                            console.log('render');
                                        },
                                        unrender: function() {
                                            console.log('unrender');
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
                                            this.caption = 'afterResize: ' + kit.getCountPerElement(this, 'afterRender');
                                        },
                                        afterRender: function() {
                                            console.log('render');
                                        },
                                        unrender: function() {
                                            console.log('unrender');
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
                                            this.caption = 'afterResize: ' + kit.getCountPerElement(this, 'afterRender');
                                        },
                                        afterRender: function() {
                                            console.log('render');
                                        },
                                        unrender: function() {
                                            console.log('unrender');
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
                                            this.caption = 'Footer L: afterResize: ' + kit.getCountPerElement(this, 'afterRender');
                                        },
                                        afterRender: function() {
                                            console.log('render');
                                        },
                                        unrender: function() {
                                            console.log('unrender');
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
                                            this.caption = 'Footer R: afterResize: ' + kit.getCountPerElement(this, 'afterRender');
                                        },
                                        afterRender: function() {
                                            console.log('render');
                                        },
                                        unrender: function() {
                                            console.log('unrender');
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
                                    this.caption = 'afterResize: ' + kit.getCountPerElement(this, 'afterRender');
                                },
                                afterRender: function() {
                                    console.log('render');
                                },
                                unrender: function() {
                                    console.log('unrender');
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
                                    this.caption = 'afterResize: ' + kit.getCountPerElement(this, 'afterRender');
                                },
                                afterRender: function() {
                                    console.log('render');
                                },
                                unrender: function() {
                                    console.log('unrender');
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
                            this.caption = 'afterResize: ' + kit.getCountPerElement(this, 'afterRender');
                        },
                        afterRender: function() {
                            console.log('render');
                        },
                        unrender: function() {
                            console.log('unrender');
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