/* global kijs */

window.home.sc = {};
home.sc.container_Stack = class home_sc_container_Stack {
    
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
            caption: 'kijs.gui.container.Stack',
            scrollableY: 'auto',
            style: {
                flex: 1
            },
            innerStyle: {
                padding: '10px'
            },
            
            elements:[
                {
                    xtype: 'kijs.gui.Panel',
                    caption: 'Wizard',
                    cls: 'kijs-flexcolumn',
                    height: 200,
                    elements:[
                        {
                            xtype: 'kijs.gui.container.Stack',
                            style: { flex: 1 },
                            currentName: 's3',
                            defaults:{
                                xtype: 'kijs.gui.Container',
                                innerStyle: { padding:'10px' }
                            },
                            on: {
                                change: function(e) {
                                    console.log(e);
                                },
                                context: this
                            },
                            elements: [
                                { name:'s1', html:'Seite 1', style:{backgroundColor:'#f99'} },
                                { name:'s2', html:'Seite 2', style:{backgroundColor:'#9f9'} },
                                { name:'s3', html:'Seite 3', style:{backgroundColor:'#99f'} },
                                { name:'s4', html:'Seite 4', style:{backgroundColor:'#ff9'} },
                                { name:'s5', html:'Seite 5', style:{backgroundColor:'#9ff'} }
                            ]
                        }
                    ],
                    footerElements:[
                        {
                            xtype: 'kijs.gui.Button',
                            caption: 'Element hinzufügen',
                            iconMap: 'kijs.iconMap.Fa.circle-plus',
                            on: {
                                click: function(e) {
                                    const cStack = this.parent.parent.elements[0];
                                    cStack.add({
                                          html: 'My new Element'
                                    });
                                    cStack.currentIndex = cStack.elements.length - 1;
                                }
                            }
                        },{
                            xtype: 'kijs.gui.Button',
                            caption: 'zurück',
                            iconMap: 'kijs.iconMap.Fa.circle-chevron-left',
                            on: {
                                click: function(e) {
                                    const cStack = this.parent.parent.elements[0];
                                    let i = cStack.currentIndex;
                                    i--;
                                    if (i < 0) {
                                        i = cStack.elements.length - 1;
                                    }
                                    cStack.setCurrentAnimated(i, 'slideRight').then((e) => {
                                        console.log('animation end');
                                    });
                                }
                            }
                        },{
                            xtype: 'kijs.gui.Button',
                            caption: 'weiter',
                            iconMap: 'kijs.iconMap.Fa.circle-chevron-right',
                            on: {
                                click: function(e) {
                                    const cStack = this.parent.parent.elements[0];
                                    let i = cStack.currentIndex;
                                    i++;
                                    if (i >= cStack.elements.length) {
                                        i = 0;
                                    }
                                    cStack.setCurrentAnimated(i, 'slideLeft').then((e) => {
                                        console.log('animation end');
                                    });
                                }
                            }
                        }
                    ]
                },
                
                {
                    xtype: 'kijs.gui.container.Stack',
                    name: 'testcontainerstack',
                    height: 230,
                    style: { marginTop: '10px', border: '1px solid #333' },
                    defaults:{
                        innerStyle: {
                            padding: '4px'
                        }
                    },
                    elements: [
                        {
                            xtype: 'kijs.gui.Panel',
                            name: 'testcontainerstackpanel_1',
                            caption: 'Panel 1',
                            cls: 'kijs-flexcolumn',
                            style: {
                                flex: 1
                            },
                            elements: [
                                {
                                    xtype: 'kijs.gui.Button',
                                    caption: 'Wechsel zu 2',
                                    iconMap: 'kijs.iconMap.Fa.caret-right',
                                    tooltip: 'test',
                                    on: {
                                        click: function() {
                                            const el = this.up('testcontainerstack');
                                            el.setCurrentAnimated('testcontainerstackpanel_2');
                                        }
                                    }
                                }
                            ]
                        },{
                            xtype: 'kijs.gui.Panel',
                            name: 'testcontainerstackpanel_2',
                            caption: 'Panel 2',
                            cls: 'kijs-flexcolumn',
                            defaults:{
                                style: {
                                    margin: '4px 4px 0 4px'
                                }
                            },
                            elements: [
                                {
                                    xtype: 'kijs.gui.Button',
                                    caption: 'fade',
                                    iconMap: 'kijs.iconMap.Fa.caret-left',
                                    tooltip: 'test',
                                    on: {
                                        click: function() {
                                            const el = this.up('testcontainerstack');
                                            el.setCurrentAnimated('testcontainerstackpanel_1', 'fade');
                                        }
                                    }
                                },{
                                    xtype: 'kijs.gui.Button',
                                    caption: 'slideLeft 1s',
                                    iconMap: 'kijs.iconMap.Fa.caret-left',
                                    tooltip: 'test',
                                    on: {
                                        click: function() {
                                            const el = this.up('testcontainerstack');
                                            el.setCurrentAnimated('testcontainerstackpanel_1', 'slideLeft', 1000);
                                        }
                                    }
                                },{
                                    xtype: 'kijs.gui.Button',
                                    caption: 'slideRight',
                                    iconMap: 'kijs.iconMap.Fa.caret-left',
                                    tooltip: 'test',
                                    on: {
                                        click: function() {
                                            const el = this.up('testcontainerstack');
                                            el.setCurrentAnimated('testcontainerstackpanel_1', 'slideRight');
                                        }
                                    }
                                },{
                                    xtype: 'kijs.gui.Button',
                                    caption: 'slideTop',
                                    iconMap: 'kijs.iconMap.Fa.caret-left',
                                    tooltip: 'test',
                                    on: {
                                        click: function() {
                                            const el = this.up('testcontainerstack');
                                            el.setCurrentAnimated('testcontainerstackpanel_1', 'slideTop');
                                        }
                                    }
                                },{
                                    xtype: 'kijs.gui.Button',
                                    caption: 'slideBottom',
                                    iconMap: 'kijs.iconMap.Fa.caret-left',
                                    tooltip: 'test',
                                    on: {
                                        click: function() {
                                            const el = this.up('testcontainerstack');
                                            el.setCurrentAnimated('testcontainerstackpanel_1', 'slideBottom');
                                        }
                                    }
                                },{
                                    xtype: 'kijs.gui.Button',
                                    caption: 'Add panel',
                                    iconMap: 'kijs.iconMap.Fa.caret-left',
                                    tooltip: 'test',
                                    on: {
                                        click: function() {
                                            const el = this.up('testcontainerstack');
                                            el.add({
                                                xtype: 'kijs.gui.Panel',
                                                name: 'addedpanel',
                                                caption: 'Neues Panel',
                                                cls: 'kijs-flexcolumn',
                                                defaults:{
                                                    style: {
                                                        margin: '4px 4px 0 4px'
                                                    }
                                                },
                                                elements: [{
                                                    xtype: 'kijs.gui.Button',
                                                    caption: 'Remove panel',
                                                    iconMap: 'kijs.iconMap.Fa.caret-left',
                                                    tooltip: 'test',
                                                    on: {
                                                        click: function() {
                                                            const el = this.up('testcontainerstack');
                                                            el.remove(this.up('addedpanel'));
                                                        }
                                                    }
                                                }]
                                            }, 0);
                                            el.setCurrentAnimated('addedpanel', 'fade');
                                        }
                                    }
                                }
                            ]
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