/* global kijs */

home.sc.Splitter = class home_sc_Splitter {
    
    
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
            cls: ['kijs-borderless', 'kijs-flexcolumn'],
            style: {
                flex: 1
            },
            headerElements: this._getHeaderElements(),
            elements:[
                {
                    xtype: 'kijs.gui.Panel',
                    caption: 'Top',
                    cls: 'kijs-borderless',
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
                    cls: ['kijs-borderless', 'kijs-flexrow'],
                    style: {
                        flex: 1
                    },
                    elements: [
                        {
                            xtype: 'kijs.gui.Panel',
                            caption: 'Left',
                            cls: 'kijs-borderless',
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
                            cls: 'kijs-borderless',
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
                            cls: 'kijs-borderless',
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
                    cls: 'kijs-borderless',
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