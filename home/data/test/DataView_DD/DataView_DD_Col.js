/* global kijs */

window.home.test = {};
home.test.DataView_DD_Col = class home_test_Dataview_DD_Col {
    
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
            caption: 'kijs.gui.DataView Drag&Drop mit column layout',
            cls: 'kijs-flexrow',
            style: {
                flex: 1
            },
            elements:[
                {
                    xtype: 'kijs.gui.Panel',
                    caption: 'flex-wrap: nowrap',
                    scrollableY: false,
                    shadow: true,
                    cls: 'kijs-flexrow',
                    style: { flex: 1 },
                    headerBarStyle: { backgroundColor: '#0559a2' },
                    elements:[
                        {
                            xtype: 'kijs.gui.DataView',
                            selectType: 'multi',
                            sortable: true,
                            scrollableY: 'auto',
                            scrollableX: false,
                            data: [{A:'11111111'}, {A:'22222222'}, {A:'33333333'}, {A:'44444444'}, {A:'55555555'}],
                            style: { flex: 1 },
                            innerStyle: {
                                flexDirection: 'column',
                                flexWrap: 'nowrap',
                                padding: '4px'
                            }
                        }
                    ]
                },{
                    xtype: 'kijs.gui.Panel',
                    caption: 'flex-wrap: wrap',
                    scrollableY: false,
                    shadow: true,
                    cls: 'kijs-flexrow',
                    style: { flex: 1 },
                    headerBarStyle: { backgroundColor: '#7509a5' },
                    elements:[
                        {
                            xtype: 'kijs.gui.DataView',
                            selectType: 'multi',
                            sortable: true,
                            scrollableX: 'auto',
                            scrollableY: false,
                            data: [{A:'11111111'}, {A:'22222222'}, {A:'33333333'}, {A:'44444444'}, {A:'55555555'}],
                            style: { flex: 1 },
                            innerStyle: {
                                flexDirection: 'column',
                                flexWrap: 'wrap',
                                padding: '4px'
                            }
                        }
                    ]
                },{
                    xtype: 'kijs.gui.Panel',
                    caption: 'flex-wrap: wrap-reverse',
                    scrollableY: false,
                    shadow: true,
                    cls: 'kijs-flexrow',
                    style: { flex: 1 },
                    headerBarStyle: { backgroundColor: '#a50968' },
                    elements:[
                        {
                            xtype: 'kijs.gui.DataView',
                            selectType: 'multi',
                            sortable: true,
                            scrollableX: 'auto',
                            scrollableY: false,
                            data: [{A:'11111111'}, {A:'22222222'}, {A:'33333333'}, {A:'44444444'}, {A:'55555555'}],
                            style: { flex: 1 },
                            innerStyle: {
                                flexDirection: 'column',
                                flexWrap: 'wrap-reverse',
                                padding: '4px'
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