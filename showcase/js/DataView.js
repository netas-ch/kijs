/* global kijs */

window.sc = {};
sc.DataView = class sc_DataView {
    
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
            caption: 'kijs.gui.DataView',
            cls: 'kijs-flexcolumn',
            style: {
                flex: 1
            },
            elements:[
                {
                    xtype: 'kijs.gui.Panel',
                    caption: 'DataView local',
                    autoScroll: true,
                    cls: 'kijs-flexrow',
                    style: {
                        flex: 1
                    },
                    
                    elements:[
                        {
                            xtype: 'kijs.gui.DataView',
                            selectType: 'multi',
                            data: [{A:'A1', B:'B1'}, {A:'A2', B:'B2'}],
                            waitMaskTargetDomProperty: 'innerDom',
                            style: {
                                flex: 1
                            },
                            innerStyle: {
                                padding: '10px'
                                //overflowY: 'auto'
                            }
                        }
                    ]
                },
                
                {
                    xtype: 'kijs.gui.Panel',
                    caption: 'DataView RPC',
                    autoScroll: true,
                    cls: 'kijs-flexrow',
                    style: {
                        flex: 1
                    },
                    
                    headerElements:[
                        {
                            xtype: 'kijs.gui.Button',
                            caption: 'Disable/Enable',
                            tooltip: 'Disable/Enable dataview',
                            on: {
                                click: function() {
                                    const dv = this._content.down('dataViewRpc');
                                    dv.disabled = !dv.disabled;
                                },
                                context: this
                            }
                        },{
                            xtype: 'kijs.gui.field.OptionGroup',
                            label: 'selectType',
                            cls: 'kijs-inline',
                            valueField: 'id',
                            captionField: 'id',
                            required: true,
                            data: [
                                {id:'none' },
                                {id:'single' },
                                {id:'multi' },
                                {id:'simple' }
                            ],
                            value: 'multi',
                            on: {
                                input: function(e) {
                                    const dv = this._content.down('dataViewRpc');
                                    dv.clearSelections();
                                    dv.selectType = e.value;
                                },
                                context: this
                            }
                        }
                    ],
                    
                    elements:[
                        {
                            xtype: 'kijs.gui.DataView',
                            name: 'dataViewRpc',
                            selectType: 'multi',
                            rpc: this._app.rpc,
                            //data: [{A:'A1', B:'B1'}, {A:'A2', B:'B2'}],
                            autoLoad: true,
                            facadeFnLoad: 'dataview.load',
                            waitMaskTargetDomProperty: 'innerDom',
                            style: {
                                flex: 1
                            },
                            innerStyle: {
                                padding: '10px'
                                //overflowY: 'auto'
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