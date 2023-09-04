/* global kijs */

window.home.sc = {};
home.sc.ListView = class home_sc_ListView {
    
    
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
            caption: 'kijs.gui.ListView und kijs.gui.field.ListView',
            cls: 'kijs-flexform',
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
                    xtype: 'kijs.gui.Element',
                    html: 'ListView lokal:'
                },{
                    xtype: 'kijs.gui.ListView',
                    valueField: 'id',
                    captionField: 'Bezeichnung',
                    iconMapField: 'Icon',
                    //iconColorField: 'Color',
                    //tooltipField: 'Color',
                    showCheckBoxes: false,
                    selectType: 'single',
                    width: 200,
                    data: [
                        {id:1, Bezeichnung:'Facebook', Icon:'kijs.iconMap.Fa.facebook' }, 
                        {id:2, Bezeichnung:'Twitter', Icon:'kijs.iconMap.Fa.twitter' }, 
                        {id:3, Bezeichnung:'Instagram', Icon:'kijs.iconMap.Fa.instagram' },
                        {id:4, Bezeichnung:'TikTok', Icon:'kijs.iconMap.Fa.tiktok' }, 
                        {id:5, Bezeichnung:'LinkedIn', Icon:'kijs.iconMap.Fa.linkedin' }, 
                        {id:6, Bezeichnung:'GitHub', Icon:'kijs.iconMap.Fa.github' },
                        {id:7, Bezeichnung:'Discord', Icon:'kijs.iconMap.Fa.discord' }, 
                        {id:8, Bezeichnung:'YouTube', Icon:'kijs.iconMap.Fa.youtube' }, 
                        {id:9, Bezeichnung:'WordPress', Icon:'kijs.iconMap.Fa.wordpress' }, 
                        {id:10, Bezeichnung:'Slack', Icon:'kijs.iconMap.Fa.slack' }, 
                        {id:11, Bezeichnung:'Figma', Icon:'kijs.iconMap.Fa.figma' }
                    ],
                    value: 5,
                    on: {
                        selectionChange: function(e) {
                            console.log(this.value);
                        }
                    }
                },
                
                {
                    xtype: 'kijs.gui.Element',
                    html: '2x ListView lokal mit Drag&Drop untereinander:',
                    style: { margin: '10px 0 0 0'}
                },{
                    xtype: 'kijs.gui.Container',
                    cls: 'kijs-flexrow',
                    height: 100,
                    elements:[
                        {
                            name: 'test',
                            xtype: 'kijs.gui.ListView',
                            valueField: 'id',
                            captionField: 'Bezeichnung',
                            iconMapField: 'Icon',
                            showCheckBoxes: false,
                            selectType: 'single',
                            ddName: 'kijs.gui.ListView.Test',
                            sortable: true,
                            width: 200,
                            style: {
                                flex: 'none',
                                marginRight: '10px'
                            },
                            data: [
                                {id:1, Bezeichnung:'Facebook', Icon:'kijs.iconMap.Fa.facebook' }, 
                                {id:2, Bezeichnung:'Twitter', Icon:'kijs.iconMap.Fa.twitter' }, 
                                {id:3, Bezeichnung:'Instagram', Icon:'kijs.iconMap.Fa.instagram' },
                                {id:4, Bezeichnung:'TikTok', Icon:'kijs.iconMap.Fa.tiktok' }, 
                                {id:5, Bezeichnung:'LinkedIn', Icon:'kijs.iconMap.Fa.linkedin' }, 
                                {id:6, Bezeichnung:'GitHub', Icon:'kijs.iconMap.Fa.github' },
                                {id:7, Bezeichnung:'Discord', Icon:'kijs.iconMap.Fa.discord' }, 
                                {id:8, Bezeichnung:'YouTube', Icon:'kijs.iconMap.Fa.youtube' }, 
                                {id:9, Bezeichnung:'WordPress2', Icon:'kijs.iconMap.Fa.wordpress' }, 
                                {id:10, Bezeichnung:'Slack', Icon:'kijs.iconMap.Fa.slack' }, 
                                {id:11, Bezeichnung:'Figma', Icon:'kijs.iconMap.Fa.figma' }
                            ]
                        },{
                            xtype: 'kijs.gui.ListView',
                            valueField: 'id',
                            captionField: 'Bezeichnung',
                            iconMapField: 'Icon',
                            showCheckBoxes: false,
                            selectType: 'single',
                            ddName: 'kijs.gui.ListView.Test',
                            sortable: true,
                            width: 200,
                            style: {
                                flex: 'none'
                            }
                        }
                    ]
                    
                },
                
                        
                
                {
                    xtype: 'kijs.gui.Element',
                    html: 'ListView mit RPC und Optionen:',
                    style: { margin: '10px 0 0 0'}
                },{
                    xtype: 'kijs.gui.ListView',
                    valueField: 'color',
                    captionField: 'caption',
                    iconMapField: 'iconMap',
                    iconColorField: 'color',
                    //rpc: 'default',
                    rpcLoadFn: 'listView.loadColors',
                    autoLoad: true,
                    value: '#0f0',
                    showCheckBoxes: true,
                    selectType: 'single',
                    width: 200,
                    on: {
                        selectionChange: function(e) {
                            console.log(this.value);
                        }
                    }
                },
                
                {
                    xtype: 'kijs.gui.Element',
                    html: 'ListView lokal mit Checkboxen:',
                    style: { margin: '10px 0 0 0'}
                },{
                    xtype: 'kijs.gui.ListView',
                    valueField: 'id',
                    captionField: 'Bezeichnung',
                    iconMapField: 'Icon',
                    iconColorField: 'Color',
                    tooltipField: 'Color',
                    showCheckBoxes: true,
                    selectType: 'simple',
                    width: 200,
                    data: [
                        {id:1, Bezeichnung:'blau', Icon:'kijs.iconMap.Fa.droplet', Color:'#0088ff' }, 
                        {id:2, Bezeichnung:'grün', Icon:'kijs.iconMap.Fa.droplet', Color:'#88ff00' }, 
                        {id:3, Bezeichnung:'pink', Icon:'kijs.iconMap.Fa.droplet', Color:'#ff0088' },
                        {id:4, Bezeichnung:'türkis', Icon:'kijs.iconMap.Fa.droplet', Color:'#00ff88' }, 
                        {id:5, Bezeichnung:'orange', Icon:'kijs.iconMap.Fa.droplet', Color:'#ff8800' }, 
                        {id:6, Bezeichnung:'viollet', Icon:'kijs.iconMap.Fa.droplet', Color:'#8800ff' },
                        {id:7, Bezeichnung:'dunkelgrau', Icon:'kijs.iconMap.Fa.droplet', Color:'#666666' }, 
                        {id:8, Bezeichnung:'grau', Icon:'kijs.iconMap.Fa.droplet', Color:'#999999' }, 
                        {id:9, Bezeichnung:'hellgrau', Icon:'kijs.iconMap.Fa.droplet', Color:'#bbbbbb' }, 
                        {id:10, Bezeichnung:'weiss', Icon:'kijs.iconMap.Fa.droplet', Color:'#ffffff' }, 
                        {id:11, Bezeichnung:'schwarz', Icon:'kijs.iconMap.Fa.droplet', Color:'#000000' }
                    ],
                    value: [2,3],
                    on: {
                        selectionChange: function(e) {
                            console.log(this.value);
                        }
                    }
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