/* global kijs */

window.home.sc = {};
home.sc.container_Tab = class home_sc_container_Tab {
    
    
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
            caption: 'kijs.gui.container.Tab',
            scrollableY: 'auto',
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
                    caption: 'Tab',
                    cls: 'kijs-flexcolumn',
                    height: 400,
                    width: 600,
                    shadow: true,
                    closable: true,
                    collapsible: 'top',
                    resizable: true,
                    on: {
                        beforeClose: function(e) {
                            this._closePanelTabsWithMsgBox(e.element, e.element.elements[0].elements, true);
                            return false;
                        },
                        context: this
                    },
                    elements:[
                        {
                            xtype: 'kijs.gui.container.Tab',
                            name: 'tab',
                            sortable: true,
                            ddName: 'tab',
                            //tabBarScrollableX: true,
                            //tabBarScrollableY: false,
                            style: { flex: 2 },
                            currentName: 'a3',
                            defaults:{
                                innerStyle: { padding:'10px' },
                                tabClosable: true,
                                tabWidth: 90
                            },
                            on: {
                                change: function(e) {
                                    console.log(e);
                                },
                                beforeRemove(e) {
                                    this._closePanelTabsWithMsgBox(e.element, e.removeElements, false);
                                    return false;
                                },
                                context: this
                            },
                            elements: [
                                { name:'a1', tabCaption:'A 1', tabIconMap:'kijs.iconMap.Fa.house', html:'A 1', innerStyle:{ color:'#f99'} },
                                { name:'a2', tabCaption:'A 2', tabIconMap:'kijs.iconMap.Fa.user', html:'A 2', innerStyle:{ color:'#9f9'} },
                                { name:'a3', tabCaption:'A 3', tabIconMap:'kijs.iconMap.Fa.phone', html:'A 3', innerStyle:{ color:'#99f'} },
                                { name:'a4', tabCaption:'A 4', tabIconMap:'kijs.iconMap.Fa.envelope', html:'A 4', innerStyle:{ color:'#f9f'}, disabled: true },
                                { name:'a5', tabCaption:'A 5', tabIconMap:'kijs.iconMap.Fa.location-dot', html:'A 5', innerStyle:{ color:'#9ff'} }
                            ]
                        },{
                            xtype: 'kijs.gui.container.Tab',
                            name: 'tab2',
                            rpcLoadFn: 'containerTab.load',
                            rpcSaveFn: 'containerTab.save',
                            autoLoad: true,
                            autoSave: true,
                            sortable: true,
                            ddName: 'tab',
                            style: { flex: 1 },
                            defaults:{
                                innerStyle: { padding:'10px' },
                                tabClosable: true,
                                tabWidth: 90
                            }
                        }
                    ],
                    headerElements:[
                        {
                            xtype: 'kijs.gui.Button',
                            caption: 'Tab hinzufügen',
                            iconMap: 'kijs.iconMap.Fa.circle-plus',
                            on: {
                                click: function(e) {
                                    const tab = this._content.down('tab');
                                    tab.add({
                                        tabCaption: 'My new Tab',
                                        html: 'My new Tab',
                                        innerStyle: { color: this._getRandomColor() }
                                    });
                                    tab.currentIndex = tab.elements.length - 1;
                                },
                                context: this
                            }
                        },{
                            xtype: 'kijs.gui.Button',
                            caption: 'Aktiviere das letzte Tab',
                            iconMap: 'kijs.iconMap.Fa.circle-plus',
                            on: {
                                click: function(e) {
                                    const tab = this._content.down('tab');
                                    tab.currentIndex = tab.elements.length - 1;
                                },
                                context: this
                            }
                        },{
                            xtype: 'kijs.gui.Button',
                            caption: 'zurück',
                            iconMap: 'kijs.iconMap.Fa.circle-chevron-left',
                            on: {
                                click: function(e) {
                                    const tab = this._content.down('tab');
                                    let i = tab.currentIndex;
                                    i--;
                                    if (i < 0) {
                                        i = tab.elements.length - 1;
                                    }
                                    tab.setCurrentAnimated(i, 'slideRight');
                                },
                                context: this
                            }
                        },{
                            xtype: 'kijs.gui.Button',
                            caption: 'weiter',
                            iconMap: 'kijs.iconMap.Fa.circle-chevron-right',
                            on: {
                                click: function(e) {
                                    const tab = this._content.down('tab');
                                    let i = tab.currentIndex;
                                    i++;
                                    if (i >= tab.elements.length) {
                                        i = 0;
                                    }
                                    tab.setCurrentAnimated(i, 'slideLeft');
                                },
                                context: this
                            }
                        }
                    ],
                    footerElements: [
                        {
                            xtype: 'kijs.gui.field.Display',
                            value: 'Die Registerkarten können per Drag&Drop verschoben werden.'
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
    _closePanelTabsWithMsgBox(parentEl, elements, isPanel) {
        let captions = [];
        kijs.Array.each(elements, function(el) {
            captions.push('<li>' + el.tabButtonEl.caption + '</li>');
        }, this);

        let msg = 'Sollen folgende Register wirklich geschlossen werden?' + "\n";
        msg += '<ul>' + captions.join("\n") + '</ul>';

        kijs.gui.MsgBox.warning('kijs', msg).then((e) => {
            if (e.btn === 'ok') {
                if (isPanel) {
                    parentEl.close(true);
                } else {
                    parentEl.remove(elements, false, false, true);
                }
            }
        });
    }
    
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
            },{
                xtype: 'kijs.gui.Separator'
            },{
                xtype: 'kijs.gui.field.OptionGroup',
                label: 'animation:',
                cls: 'kijs-inline',
                valueField: 'id',
                captionField: 'id',
                required: true,
                data: [
                    { id:'none' },
                    { id:'fade' },
                    { id:'slideTop' },
                    { id:'slideRight' },
                    { id:'slideBottom' },
                    { id:'slideLeft' }
                ],
                value: 'fade',
                on: {
                    change: function(e) {
                        this._content.elements[0].elements[0].animation = e.value;
                    },
                    context: this
                }
            },{
                xtype: 'kijs.gui.Separator'
            },{
                xtype: 'kijs.gui.field.OptionGroup',
                label: 'tabBarPos:',
                cls: 'kijs-inline',
                valueField: 'id',
                captionField: 'id',
                required: true,
                data: [
                    { id:'top' },
                    { id:'right' },
                    { id:'bottom' },
                    { id:'left' }
                ],
                value: 'top',
                on: {
                    change: function(e) {
                        this._content.down('tab').tabBarPos = e.value;
                    },
                    context: this
                }
            },{
                xtype: 'kijs.gui.Separator'
            },{
                xtype: 'kijs.gui.field.OptionGroup',
                label: 'tabBarAlign:',
                cls: 'kijs-inline',
                valueField: 'id',
                captionField: 'id',
                required: true,
                data: [
                    { id:'start' },
                    { id:'center' },
                    { id:'end' }
                ],
                value: 'start',
                on: {
                    change: function(e) {
                        this._content.down('tab').tabBarAlign = e.value;
                    },
                    context: this
                }
            }
        ];
    }
    
    _getRandomColor() {
        return kijs.Graphic.colorGetHex([
            Math.floor(Math.random() * 200),
            Math.floor(Math.random() * 200),
            Math.floor(Math.random() * 200)
        ]);
    }
    
    
    
    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct() {
        this._content = null;
    }
    
};