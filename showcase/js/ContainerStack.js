/* global kijs */

window.sc = {};
sc.ContainerStack = class sc_ContainerStack {
    
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
            caption: 'kijs.gui.ContainerStack',
            cls: 'kijs-flexcolumn',
            style: {
                flex: 1
            },
            innerStyle: {
                padding: '10px'
            },
            elements:[
                {
                    xtype: 'kijs.gui.ContainerStack',
                    name: 'testcontainerstack',
                    elements: [
                        {
                            xtype: 'kijs.gui.Panel',
                            name: 'testcontainerstackpanel_1',
                            caption: 'Panel 1',
                            cls: 'kijs-flexcolumn',
                            defaults:{
                                /*style: {
                                    margin: '4px 4px 0 4px'
                                }*/
                            },
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
                                            el.activateAnimated('testcontainerstackpanel_2');
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
                                            el.activateAnimated('testcontainerstackpanel_1', 'fade');
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
                                            el.activateAnimated('testcontainerstackpanel_1', 'slideLeft', 1000);
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
                                            el.activateAnimated('testcontainerstackpanel_1', 'slideRight');
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
                                            el.activateAnimated('testcontainerstackpanel_1', 'slideTop');
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
                                            el.activateAnimated('testcontainerstackpanel_1', 'slideBottom');
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
                                            el.activateAnimated('addedpanel', 'fade');
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