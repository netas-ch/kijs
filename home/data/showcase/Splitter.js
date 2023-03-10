/* global kijs */

window.sc = {};
sc.Splitter = class sc_Splitter {
    
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
            caption: 'kijs.gui.Splitter',
            cls: 'kijs-flexcolumn',
            style: {
                flex: 1
            },
            elements:[
                {
                    xtype: 'kijs.gui.Panel',
                    caption: 'Top',
                    collapsible: 'top',
                    collapsed: false,
                    height: 100,
                    elements: [

                    ]
                },{
                    xtype: 'kijs.gui.Splitter',
                    targetPos: 'top'
                },{
                    xtype: 'kijs.gui.Panel',
                    caption: 'Center',
                    cls: 'kijs-flexrow',
                    style: {
                        flex: 1
                    },
                    elements: [
                        {
                            xtype: 'kijs.gui.Panel',
                            caption: 'Left',
                            collapsible: 'left',
                            collapsed: false,
                            width: 100,
                            elements: [

                            ]
                        },{
                            xtype: 'kijs.gui.Splitter',
                            targetPos: 'left'
                        },{
                            xtype: 'kijs.gui.Panel',
                            caption: 'Center',
                            style: {
                                flex: 1
                            },
                            elements: [

                            ]
                        },{
                            xtype: 'kijs.gui.Splitter',
                            targetPos: 'right'
                        },{
                            xtype: 'kijs.gui.Panel',
                            caption: 'Right',
                            collapsible: 'right',
                            collapsed: false,
                            width: 100,
                            elements: [

                            ]
                        }
                    ]
                },{
                    xtype: 'kijs.gui.Splitter',
                    targetPos: 'bottom'
                },{
                    xtype: 'kijs.gui.Panel',
                    caption: 'Bottom',
                    collapsible: 'bottom',
                    collapsed: false,
                    height: 100,
                    elements: [

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