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
            cls: ['kijs-borderless', 'kijs-flexform'],
            style: {
                flex: 1
            },
            innerStyle: {
                padding: '10px'
            },
            headerElements: this._getHeaderElements(),
            elements:[
                {
                    xtype: 'kijs.gui.Panel',
                    caption: 'Tree simple',
                    scrollableY: 'auto',
                    cls: 'kijs-flexrow',
                    style: {
                        height: '200px'
                    },

                    elements:[
                        {
                            xtype: 'kijs.gui.Tree',
                            valueField: 'id',
                            captionField: 'caption',
                            childsField: 'childs',
                            width: 200,
                            data: [
                                {id:1, caption:'Facebook', childs:[{id:11, caption:'GitHub', childs:[{id:111, caption:'TikTok'},{id:112, caption:'LinkedIn'}]},{id:12, caption:'Discord'},{id:13, caption:'YouTube'}] },
                                {id:2, caption:'Twitter',childs:[{id:21, caption:'WordPress'},{id:22, caption:'Slack'},{id:23, caption:'Figma'}]},
                                {id:3, caption:'Instagram'}
                            ],
                            value: 2
                        }
                    ]
                },{
                    xtype: 'kijs.gui.Panel',
                    caption: 'Tree local',
                    scrollableY: 'auto',
                    cls: 'kijs-flexrow',
                    style: {
                        height: '200px'
                    },

                    elements:[
                        {
                            xtype: 'kijs.gui.Tree',
                            valueField: 'id',
                            captionField: 'caption',
                            iconMapField: 'icon',
                            expandedIconMapField: 'icon',
                            collapsedIconMapField: 'icon',
                            //iconColorField: 'color',
                            childsField: 'childs',
                            expandedField: 'expanded',
                            //tooltipField: 'Color',
                            //showCheckBoxes: true,
                            //selectType: 'singleAndEmpty',
                            width: 200,
                            data: [
                                {id:1, caption:'Facebook', icon:'kijs.iconMap.Fa.facebook', expanded:true, childs:[{id:11, caption:'GitHub', icon:'kijs.iconMap.Fa.github', expanded:true, childs:[{id:111, caption:'TikTok', icon:'kijs.iconMap.Fa.tiktok'},{id:112, caption:'LinkedIn', icon:'kijs.iconMap.Fa.linkedin'}]},{id:12, caption:'Discord', icon:'kijs.iconMap.Fa.discord'},{id:13, caption:'YouTube', icon:'kijs.iconMap.Fa.youtube' }] },
                                {id:2, caption:'Twitter', icon:'kijs.iconMap.Fa.twitter', childs:[{id:21, caption:'WordPress', icon:'kijs.iconMap.Fa.wordpress'},{id:22, caption:'Slack', icon:'kijs.iconMap.Fa.slack'},{id:23, caption:'Figma', icon:'kijs.iconMap.Fa.figma'}]},
                                {id:3, caption:'Instagram', icon:'kijs.iconMap.Fa.instagram'}
                            ],
                            value: 2
                        }
                    ]
                },{
                    xtype: 'kijs.gui.Panel',
                    caption: 'Tree remote',
                    scrollableY: 'auto',
                    cls: 'kijs-flexrow',
                    style: {
                        height: '200px'
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
                            childsField: 'childs',
                            expandedField: 'expanded',
                            tooltipField: 'color',
                            //showCheckBoxes: true,
                            //selectType: 'simple',
                            width: 200,
                            rpcLoadFn: 'tree.largeData.load',
                            autoLoad: true
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