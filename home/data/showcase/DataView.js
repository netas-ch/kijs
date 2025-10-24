/* global kijs */

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
            scrollableY: 'auto',
            cls: ['kijs-borderless'],
            style: {
                flex: 1
            },
            innerStyle: {
                padding: '10px',
                gap: '10px'
            },
            headerElements: this._getHeaderElements(),
            elements:[
                {
                    xtype: 'kijs.gui.Panel',
                    caption: 'DataView local',
                    scrollableY: 'auto',
                    cls: 'kijs-flexrow',
                    collapsible: 'top',
                    collapsed: true,
                    style: {
                        flex: 'none'
                    },

                    headerElements:[
                        {
                            xtype: 'kijs.gui.Button',
                            caption: 'Disable/Enable',
                            tooltip: 'Disable/Enable dataview',
                            on: {
                                click: function() {
                                    const dv = this._content.down('dataViewLocal');
                                    dv.disabled = !dv.disabled;
                                },
                                context: this
                            }
                        },{
                            xtype: 'kijs.gui.Button',
                            caption: 'Disable/Enable first Child',
                            on: {
                                click: function() {
                                    const dv = this._content.down('dataViewLocal');
                                    dv.elements[0].disabled = !dv.elements[0].disabled;
                                },
                                context: this
                            }
                        },{
                            xtype: 'kijs.gui.Button',
                            caption: 'Reload',
                            on: {
                                click: function() {
                                    const dv = this._content.down('dataViewLocal');
                                    dv.reload();
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
                            displayTextField: 'id',
                            required: true,
                            data: [
                                { id:'none' },
                                { id:'single' },
                                { id:'singleAndEmpty' },
                                { id:'multi' },
                                { id:'simple' }
                            ],
                            value: 'single',
                            on: {
                                change: function(e) {
                                    const dv = this._content.down('dataViewLocal');
                                    dv.clearSelections();
                                    dv.selectType = e.value;
                                },
                                context: this
                            }
                        },{
                            xtype: 'kijs.gui.field.Combo',
                            label: 'Sortierung:',
                            value: 'none',
                            inputWidth: 90,
                            data: [
                                { displayText: 'keine', value: 'none' },
                                { displayText: 'A', value: 'A' },
                                { displayText: 'B', value: 'B' }
                            ],
                            on: {
                                change: function(e) {
                                    const dv = this._content.down('dataViewLocal');
                                    let sortFields = [];

                                    if (e.element.value !== 'none') {
                                        sortFields.push(e.element.value);
                                    }

                                    dv.applySortFields(sortFields);
                                },
                                context: this
                            }
                        }
                    ],
                    
                    elements:[
                        {
                            xtype: 'kijs.gui.DataView',
                            name: 'dataViewLocal',
                            selectType: 'single',
                            primaryKeyFields:['A'],
                            data: [{A:'A1', B:'B3'}, {A:'A2', B:'B2'}, {A:'A3', B:'B1'}],
                            selectFilters: [{field:'A', value:'A2'}],
                            //scrollableY: 'auto',
                            style: {
                                flex: 1
                            },
                            innerStyle: {
                                padding: '4px'
                            },
                            on: {
                                selectionChange: function(e) {
                                    console.log(e);
                                    console.log(e.element.selectedKeysRows);
                                },
                                context: this
                            }
                        }
                    ]
                },
                
                {
                    xtype: 'kijs.gui.Panel',
                    caption: '2x DataView local mit Drag&Drop untereinander',
                    scrollableY: 'auto',
                    cls: 'kijs-flexrow',
                    collapsible: 'top',
                    collapsed: true,
                    style: {
                        flex: 'none'
                    },
                    elements:[
                        {
                            xtype: 'kijs.gui.DataView',
                            selectType: 'multi',
                            ddName: 'kijs.gui.DataView.Test',
                            sortable: true,
                            data: [{key:'A1'}, {key:'A2'}, {key:'A3'}],
                            //scrollableY: 'auto',
                            style: {
                                flex: 1,
                                borderRight: '1px solid var(--panel-borderColor)'
                            },
                            innerStyle: {
                                padding: '4px'
                            }
                        },{
                            xtype: 'kijs.gui.DataView',
                            selectType: 'multi',
                            ddName: 'kijs.gui.DataView.Test',
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
                    collapsible: 'top',
                    collapsed: true,
                    style: {
                        flex: 'none'
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
                            xtype: 'kijs.gui.Button',
                            caption: 'Reload',
                            on: {
                                click: function() {
                                    const dv = this._content.down('dataViewRpc');
                                    dv.reload();
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
                            displayTextField: 'id',
                            required: true,
                            data: [
                                { id:'none' },
                                { id:'single' },
                                { id:'singleAndEmpty' },
                                { id:'multi' },
                                { id:'simple' }
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
                        },{
                            xtype: 'kijs.gui.field.Combo',
                            label: 'Sortierung:',
                            value: 'none',
                            inputWidth: 90,
                            data: [
                                { displayText: 'keine', value: 'none' },
                                { displayText: 'Name', value: 'Name' },
                                { displayText: 'Vorname', value: 'Vorname' }
                            ],
                            on: {
                                change: function(e) {
                                    const dv = this._content.down('dataViewRpc');
                                    let sortFields = [];

                                    if (e.element.value !== 'none') {
                                        sortFields.push(e.element.value);
                                    }

                                    dv.applySortFields(sortFields);
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