/* global kijs */

window.home.sc = {};
home.sc.container_Scrollable = class home_sc_container_Scrollable {
    
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
            caption: 'kijs.gui.container.Scrollable',
            scrollableY: 'auto',
            style: {
                flex: 1
            },
            innerStyle: {
                padding: '10px'
            },
            
            headerInnerStyle:{
                padding: '10px 10px 0 10px'
            },
            
            elements:[
                {
                    xtype: 'kijs.gui.Element',
                    html: 'scrollableX=true',
                    style: { margin: '0 0 4px 0'}
                },{
                    xtype: 'kijs.gui.container.Scrollable',
                    scrollableX: true,
                    innerStyle: {
                        border: '1px solid #333',
                        padding: '10px',
                        display: 'flex',
                        flexDirection: 'row'
                    },
                    defaults:{
                        xtype: 'kijs.gui.Button',
                        caption: 'test',
                        style: {
                            flex: 'none',
                            width: '100px'
                        }
                    },
                    elements:[
                        {caption:'1/15'},{caption:'2/15'},{caption:'3/15'},{caption:'4/15'},{caption:'5/15'},
                        {caption:'6/15'},{caption:'7/15'},{caption:'8/15'},{caption:'9/15'},{caption:'10/15'},
                        {caption:'11/15'},{caption:'12/15'},{caption:'13/15'},{caption:'14/15'},{caption:'15/15'}
                    ]
                },
                
                {
                    xtype: 'kijs.gui.Element',
                    html: 'scrollableX="auto" (click on buttons to make them wider/smaller)',
                    style: { margin: '10px 0 4px 0'}
                },{
                    xtype: 'kijs.gui.container.Scrollable',
                    scrollableX: 'auto',
                    style: {
                        maxWidth: '500px',
                        marginTop: '10px'
                    },
                    innerStyle: {
                        border: '1px solid #333',
                        padding: '10px',
                        display: 'flex',
                        flexDirection: 'row'
                    },
                    defaults:{
                        xtype: 'kijs.gui.Button',
                        caption: 'test',
                        style: {
                            flex: 'none',
                            width: '50px'
                        }
                    },
                    elements:[
                        {caption:'1/5', on:{click:function(e){e.element.width = e.element.width===50 ? 100 : 50;}}},
                        {caption:'2/5', on:{click:function(e){e.element.width = e.element.width===50 ? 100 : 50;}}},
                        {caption:'3/5', on:{click:function(e){e.element.width = e.element.width===50 ? 100 : 50;}}},
                        {caption:'4/5', on:{click:function(e){e.element.width = e.element.width===50 ? 100 : 50;}}},
                        {caption:'5/5', on:{click:function(e){e.element.width = e.element.width===50 ? 100 : 50;}}}
                    ]
                },
                
                
                {
                    xtype: 'kijs.gui.Element',
                    html: 'scrollableY=true',
                    style: { margin: '10px 0 4px 0'}
                },{
                    xtype: 'kijs.gui.container.Scrollable',
                    scrollableY: true,
                    width: 200,
                    height: 200,
                    innerStyle: {
                        border: '1px solid #333',
                        padding: '10px',
                        display: 'flex',
                        flexDirection: 'column'
                    },
                    defaults:{
                        xtype: 'kijs.gui.Button',
                        caption: 'test',
                        style: {
                            flex: 'none',
                            marginBottom: '4px'
                        }
                    },
                    elements:[
                        {caption:'1/15'},{caption:'2/15'},{caption:'3/15'},{caption:'4/15'},{caption:'5/15'},
                        {caption:'6/15'},{caption:'7/15'},{caption:'8/15'},{caption:'9/15'},{caption:'10/15'},
                        {caption:'11/15'},{caption:'12/15'},{caption:'13/15'},{caption:'14/15'},{caption:'15/15'}
                    ]
                },
                
                
                {
                    xtype: 'kijs.gui.Element',
                    html: 'scrollableX="auto" und scrollableY="auto"',
                    style: { margin: '10px 0 4px 0'}
                },{
                    xtype: 'kijs.gui.Panel',
                    width: 400,
                    height: 120,
                    resizable: true,
                    innerStyle: {
                        display: 'flex',
                        flexDirection: 'column'
                    },
                    elements:[
                        {
                            xtype: 'kijs.gui.container.Scrollable',
                            html: '<div style="width:800px;">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</div>',
                            scrollableX: 'auto',
                            scrollableY: 'auto',
                            style: {
                                flex: 1
                            },
                            innerStyle: {
                                border: '1px solid #333',
                                padding: '10px'
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