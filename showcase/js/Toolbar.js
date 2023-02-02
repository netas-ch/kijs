/* global kijs */

window.sc = {};
sc.Toolbar = class sc_Toolbar {
    
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
            caption: 'kijs.gui.Toolbar',
            scrollableY: 'auto',
            style: {
                flex: 1
            },
            innerStyle: {
                padding: '10px'
            },
            elements:[
                {
                    xtype: 'kijs.gui.Toolbar',
                    html: 'Meine PanelBar',
                    style: {
                        marginBottom: '10px'
                    },
                    iconCls: 'icoWizard16',
                    elements: [
                        {
                            xtype: 'kijs.gui.Button',
                            iconMap: 'kijs.iconMap.Fa.user',
                            badgeText: '5'
                        },{
                            xtype: 'kijs.gui.Button',
                            iconMap: 'kijs.iconMap.Fa.star',
                            badgeText: '6'
                        },{
                            xtype: 'kijs.gui.Button',
                            caption: 'Hide',
                            iconCls: 'icoWizard16',
                            tooltip: { html: '<p>Test</p>', followPointer: false },
                            on: {
                                click: function() {
                                    this.visible = false;
                                }
                            }
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