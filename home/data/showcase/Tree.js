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
                    caption: 'Tree local',
                    scrollableY: 'auto',
                    cls: 'kijs-flexrow',
                    style: {
                        flex: 1,
                        minHeight: '90px'
                    },
                    
                    elements:[
                        {
                            xtype: 'kijs.gui.Tree',
                            valueField: 'id',
                            captionField: 'caption',
                            iconMapField: 'icon',
                            //iconColorField: 'Color',
                            childsField: 'childs',
                            //tooltipField: 'Color',
                            showCheckBoxes: false,
                            selectType: 'singleAndEmpty',
                            width: 200,
                            data: [
                                {id:1, caption:'Facebook', icon:'kijs.iconMap.Fa.facebook', childs:[{id:11, caption:'GitHub', icon:'kijs.iconMap.Fa.github', childs:[{id:111, caption:'TikTok', icon:'kijs.iconMap.Fa.tiktok'},{id:112, caption:'LinkedIn', icon:'kijs.iconMap.Fa.linkedin'}]},{id:12, caption:'Discord', icon:'kijs.iconMap.Fa.discord'},{id:13, caption:'YouTube', icon:'kijs.iconMap.Fa.youtube' }] }, 
                                {id:2, caption:'Twitter', icon:'kijs.iconMap.Fa.twitter', childs:[{id:21, caption:'WordPress', icon:'kijs.iconMap.Fa.wordpress'},{id:22, caption:'Slack', icon:'kijs.iconMap.Fa.slack'},{id:23, caption:'Figma', icon:'kijs.iconMap.Fa.figma'}]}, 
                                {id:3, caption:'Instagram', icon:'kijs.iconMap.Fa.instagram'}                                
                            ],
                            value: 2
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