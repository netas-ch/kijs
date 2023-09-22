/* global kijs */

window.home.sc = {};
home.sc.DataView = class home_sc_DataView {
    
    
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
            headerElements: this._getHeaderElements(),
            elements:[
                {
                    xtype: 'kijs.gui.Panel',
                    caption: 'DataView local',
                    scrollableY: 'auto',
                    cls: 'kijs-flexrow',
                    style: {
                        flex: 1
                    },
                    
                    elements:[
                        {
                            xtype: 'kijs.gui.DataView',
                            selectType: 'multi',
                            data: [{A:'A1', B:'B1'}, {A:'A2', B:'B2'}, {A:'A3', B:'B3'}],
                            selectFilters: [{field:'A', 'value':'A2'}],
                            //scrollableY: 'auto',
                            style: {
                                flex: 1
                            },
                            innerStyle: {
                                padding: '4px'
                            }
                        }
                    ]
                },
                
                {
                    xtype: 'kijs.gui.Panel',
                    caption: '2x DataView local mit Drag&Drop untereinander',
                    scrollableY: 'auto',
                    cls: 'kijs-flexrow',
                    style: {
                        flex: 1
                    },
                    
                    elements:[
                        {
                            xtype: 'kijs.gui.DataView',
                            selectType: 'multi',
                            ddName: 'kijs.gui.Dashboard.Test',
                            sortable: true,
                            data: [{key:'A1'}, {key:'A2'}, {key:'A3'}],
                            //scrollableY: 'auto',
                            style: {
                                flex: 1,
                                borderRight: '4px solid var(--panel-borderColor)'
                            },
                            innerStyle: {
                                padding: '4px'
                            }
                        },{
                            xtype: 'kijs.gui.DataView',
                            selectType: 'multi',
                            ddName: 'kijs.gui.Dashboard.Test',
                            sortable: true,
                            data: [{key:'B1'}, {key:'B2'}, {key:'B3'}],
                            //scrollableY: 'auto',
                            style: {
                                flex: 1
                            },
                            innerStyle: {
                                padding: '4px'
                            }
                        }
                    ]
                },
                
                
                {
                    xtype: 'kijs.gui.Panel',
                    caption: 'DataView RPC',
                    scrollableY: 'auto',
                    cls: 'kijs-flexrow',
                    style: {
                        flex: 2
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
                            xtype: 'kijs.gui.Button',
                            caption: 'Disable/Enable first Child',
                            on: {
                                click: function() {
                                    const dv = this._content.down('dataViewRpc');
                                    dv.elements[0].disabled = !dv.elements[0].disabled;
                                },
                                context: this
                            }
                        },{
                            xtype: 'kijs.gui.Separator'
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
                                change: function(e) {
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
                            rpcLoadFn: 'dataview.load',
                            rpcSaveFn: 'dataview.save',
                            autoLoad: true,
                            autoSave: true,
                            sortable: true,
                            waitMaskTargetDomProperty: 'innerDom',
                            //scrollableY: 'auto',
                            style: {
                                flex: 1
                            },
                            innerStyle: {
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