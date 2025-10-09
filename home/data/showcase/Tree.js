/* global kijs, home */

home.sc.Tree = class home_sc_Tree {
    
    
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
            caption: 'kijs.gui.Tree',
            scrollableY: 'auto',
            cls: ['kijs-borderless', 'kijs-flexrowwrap'],
            style: {
                flex: 1
            },
            headerElements: this._getHeaderElements(),
            elements:[
                {
                    xtype: 'kijs.gui.Panel',
                    caption: 'Tree simple',
                    scrollableY: 'auto',
                    cls: 'kijs-flexfit',
                    style: {
                        maxHeight: '300px'
                    },

                    elements:[
                        {
                            xtype: 'kijs.gui.Tree',
                            valueField: 'id',
                            captionField: 'caption',
                            childrenField: 'children',
                            data: [
                                {id:1, caption:'Facebook', children:[{id:11, caption:'GitHub', children:[{id:111, caption:'TikTok'},{id:112, caption:'LinkedIn'}]},{id:12, caption:'Discord'},{id:13, caption:'YouTube'}] },
                                {id:2, caption:'Twitter',children:[{id:21, caption:'WordPress'},{id:22, caption:'Slack'},{id:23, caption:'Figma'}]},
                                {id:3, caption:'Instagram'}
                            ],
                            value: 2
                        }
                    ]
                },{
                    xtype: 'kijs.gui.Panel',
                    caption: 'Tree local',
                    scrollableY: 'auto',
                    cls: 'kijs-flexfit',
                    style: {
                        maxHeight: '300px'
                    },

                    elements:[
                        {
                            xtype: 'kijs.gui.Tree',
                            valueField: 'id',
                            captionField: 'caption',
                            iconMapField: 'icon',
                            disabledField: 'disabled',
                            expandedIconMapField: 'icon',
                            collapsedIconMapField: 'icon',
                            //iconColorField: 'color',
                            childrenField: 'children',
                            expandedField: 'expanded',
                            //tooltipField: 'Color',
                            //showCheckBoxes: true,
                            //selectType: 'singleAndEmpty',
                            data: [
                                {id:1, caption:'Facebook', icon:'kijs.iconMap.Fa.facebook', expanded:true, children:[{id:11, caption:'GitHub', icon:'kijs.iconMap.Fa.github', disabled:1, expanded:true, children:[{id:111, caption:'TikTok', icon:'kijs.iconMap.Fa.tiktok'},{id:112, caption:'LinkedIn', icon:'kijs.iconMap.Fa.linkedin'}]},{id:12, caption:'Discord', icon:'kijs.iconMap.Fa.discord'},{id:13, caption:'YouTube', icon:'kijs.iconMap.Fa.youtube', disabled:1 }] },
                                {id:2, caption:'Twitter', icon:'kijs.iconMap.Fa.twitter', children:[{id:21, caption:'WordPress', icon:'kijs.iconMap.Fa.wordpress'},{id:22, caption:'Slack', icon:'kijs.iconMap.Fa.slack'},{id:23, caption:'Figma', icon:'kijs.iconMap.Fa.figma'}]},
                                {id:3, caption:'Instagram', icon:'kijs.iconMap.Fa.instagram'}
                            ],
                            value: 2
                        }
                    ]
                },{
                    xtype: 'kijs.gui.Panel',
                    caption: '2x Tree local mit Drag&Drop untereinander',
                    scrollableY: 'auto',
                    cls: 'kijs-flexrow',
                    collapsible: 'top',
                    collapsed: false,
                    style: {
                        maxHeight: '300px'
                    },
                    elements:[
                        {
                            xtype: 'kijs.gui.Tree',
                            valueField: 'key',
                            captionField: 'key',
                            childrenField: 'children',
                            selectType: 'multi',
                            ddName: 'kijs.gui.Tree.Test',
                            sortable: true,
                            data: [{key:'A1',children:[{key:'A1.1'},{key:'A1.2'},{key:'A1.3'}]}, {key:'A2',children:[{key:'A2.1'},{key:'A2.2'},{key:'A2.3'}]}, {key:'A3'}],
                            expandFilters: { field:'key', operator:'IN', value:['A1'] },
                            style: {
                                flex: 1,
                                borderRight: '1px solid var(--panel-borderColor)'
                            },
                            innerStyle: {
                                padding: '4px'
                            }
                        },{
                            xtype: 'kijs.gui.Tree',
                            valueField: 'key',
                            captionField: 'key',
                            childrenField: 'children',
                            selectType: 'multi',
                            ddName: 'kijs.gui.Tree.Test',
                            sortable: true,
                            data: [{key:'B1'}, {key:'B2'}, {key:'B3',children:[{key:'B3.1'},{key:'B3.2'},{key:'B3.3'}]}],
                            expandFilters: { field:'key', operator:'IN', value:['B3'] },
                            style: {
                                flex: 1
                            },
                            innerStyle: {
                                padding: '4px'
                            }
                        }
                    ]
                },{
                    xtype: 'kijs.gui.Panel',
                    caption: 'Tree remote',
                    scrollableY: 'auto',
                    cls: 'kijs-flexfit',
                    style: {
                        maxHeight: '300px'
                    },

                    headerElements:[
                        {
                            xtype: 'kijs.gui.Button',
                            caption: 'Reload',
                            on: {
                                click: function() {
                                    const dv = this._content.down('treeRemote');
                                    dv.reload();
                                },
                                context: this
                            }
                        },{
                            xtype: 'kijs.gui.Button',
                            caption: 'expand+select 1.1.2',
                            on: {
                                click: function() {
                                    const el = this._content.down('treeRemote');
                                    el.expandByFilters({ field:'id', operator:'IN', value:['1','1.1'] });
                                    el.value = '1.1.2';
                                },
                                context: this
                            }
                        },{
                            xtype: 'kijs.gui.Button',
                            caption: 'collapse 1.1',
                            on: {
                                click: function() {
                                    const el = this._content.down('treeRemote');
                                    el.collapseByFilters({ field:'id', operator:'IN', value:['1.1'] });
                                },
                                context: this
                            }
                        },{
                            xtype: 'kijs.gui.Button',
                            caption: 'expand/collapse all',
                            on: {
                                click: function() {
                                    const el = this._content.down('treeRemote');
                                    if (kijs.isEmpty(el.getExpanded())) {
                                        el.expandAll();
                                    } else {
                                        el.collapseAll();
                                    }
                                },
                                context: this
                            }
                        },{
                            xtype: 'kijs.gui.Button',
                            caption: 'get value',
                            on: {
                                click: function() {
                                    const el = this._content.down('treeRemote');
                                    kijs.gui.CornerTipContainer.show('value', el.value);
                                },
                                context: this
                            }
                        },{
                            xtype: 'kijs.gui.Button',
                            caption: 'scroll to focus',
                            on: {
                                click: function() {
                                    const el = this._content.down('treeRemote');
                                    el.scrollToFocus();
                                },
                                context: this
                            }
                        }
                    ],

                    elements:[
                        {
                            xtype: 'kijs.gui.Tree',
                            name: 'treeRemote',
                            primaryKeyFields: ['id'],
                            valueField: 'id',
                            captionField: 'caption',
                            iconMapField: 'icon',
                            iconColorField: 'color',
                            childrenField: 'children',
                            tooltipField: 'color',
                            //showCheckBoxes: true,
                            //selectType: 'simple',
                            rpcLoadFn: 'tree.largeData.load',
                            autoLoad: true,

                            expandedField: 'expanded',
                            value: '1.1.2'
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