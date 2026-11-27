/* global kijs */

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
            caption: kijs.getText('%1 und %2', '', ['kijs.gui.ListView', 'kijs.gui.field.ListView']),
            headerBarElements: [ this._app.createApiButton(['kijs.gui.ListView', 'kijs.gui.field.ListView']) ],
            cls: ['kijs-borderless', 'kijs-flexform'],
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
                    caption: kijs.getText('%1 lokal', '', 'ListView'),
                    scrollableY: 'auto',
                    cls: 'kijs-flexrow',
                    collapsible: 'top',
                    collapsed: false,
                    style: {
                        flex: 'none'
                    },

                    headerElements:[
                        {
                            xtype: 'kijs.gui.Button',
                            caption: kijs.getText('Deaktivieren/Aktivieren'),
                            tooltip: kijs.getText('%1 deaktivieren/aktivieren', '', 'ListView'),
                            on: {
                                click: function() {
                                    const dv = this._content.down('listViewLocal');
                                    dv.disabled = !dv.disabled;
                                },
                                context: this
                            }
                        },{
                            xtype: 'kijs.gui.Button',
                            caption: kijs.getText('Erstes Kind-Element deaktivieren/aktivieren'),
                            on: {
                                click: function() {
                                    const dv = this._content.down('listViewLocal');
                                    dv.elements[0].disabled = !dv.elements[0].disabled;
                                },
                                context: this
                            }
                        },{
                            xtype: 'kijs.gui.Button',
                            caption: kijs.getText('Neu laden'),
                            on: {
                                click: function() {
                                    const dv = this._content.down('listViewLocal');
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
                                { id:'simple-single' },
                                { id:'simple-singleAndEmpty' },
                                { id:'simple-multi' }
                            ],
                            value: 'single',
                            on: {
                                change: function(e) {
                                    const dv = this._content.down('listViewLocal');
                                    dv.clearSelections();
                                    dv.selectType = e.value;
                                },
                                context: this
                            }
                        },{
                            xtype: 'kijs.gui.field.Combo',
                            label: kijs.getText('Sortierung:'),
                            value: 'none',
                            inputWidth: 90,
                            data: [
                                { displayText: kijs.getText('keine'), value: 'none' },
                                { displayText: kijs.getText('Aufsteigend'), value: 'asc' },
                                { displayText: kijs.getText('Absteigend'), value: 'desc' }
                            ],
                            on: {
                                change: function(e) {
                                    const dv = this._content.down('listViewLocal');
                                    let sortFields = [];

                                    switch (e.element.value) {
                                        case 'asc':
                                            sortFields.push('Bezeichnung');
                                            break;
                                        case 'desc':
                                            sortFields.push({field:'Bezeichnung', desc:true});
                                            break;
                                    }

                                    dv.applySortFields(sortFields);
                                },
                                context: this
                            }
                        }
                    ],

                    elements:[
                        {
                            xtype: 'kijs.gui.ListView',
                            name: 'listViewLocal',
                            valueField: 'id',
                            displayTextField: 'Bezeichnung',
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
                        }
                    ]
                },
                
                {
                    xtype: 'kijs.gui.field.Display',
                    cls: 'kijs-titleLarge',
                    value: kijs.getText('2x %1 lokal mit Drag&Drop untereinander:', '', 'ListView'),
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
                            displayTextField: 'Bezeichnung',
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
                            displayTextField: 'Bezeichnung',
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
                    xtype: 'kijs.gui.field.Display',
                    cls: 'kijs-titleLarge',
                    value: kijs.getText('%1 mit RPC und Optionen:', '', 'ListView'),
                    style: { margin: '10px 0 0 0'}
                },{
                    xtype: 'kijs.gui.ListView',
                    valueField: 'color',
                    displayTextField: 'displayText',
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
                    xtype: 'kijs.gui.field.Display',
                    cls: 'kijs-titleLarge',
                    value: kijs.getText('%1 lokal mit Checkboxen:', '', 'ListView'),
                    style: { margin: '10px 0 0 0'}
                },{
                    xtype: 'kijs.gui.ListView',
                    valueField: 'id',
                    displayTextField: 'Bezeichnung',
                    iconMapField: 'Icon',
                    iconColorField: 'Color',
                    tooltipField: 'Color',
                    disabledField: 'disabled',
                    showCheckBoxes: true,
                    selectType: 'simple-multi',
                    width: 200,
                    data: [
                        {id:1, Bezeichnung:kijs.getText('blau'), Icon:'kijs.iconMap.Fa.droplet', Color:'#0088ff' }, 
                        {id:2, Bezeichnung:kijs.getText('grün'), Icon:'kijs.iconMap.Fa.droplet', Color:'#88ff00' }, 
                        {id:3, Bezeichnung:kijs.getText('pink'), Icon:'kijs.iconMap.Fa.droplet', Color:'#ff0088' },
                        {id:4, Bezeichnung:kijs.getText('türkis'), Icon:'kijs.iconMap.Fa.droplet', Color:'#00ff88', disabled: true },
                        {id:5, Bezeichnung:kijs.getText('orange'), Icon:'kijs.iconMap.Fa.droplet', Color:'#ff8800' }, 
                        {id:6, Bezeichnung:kijs.getText('violett'), Icon:'kijs.iconMap.Fa.droplet', Color:'#8800ff' },
                        {id:7, Bezeichnung:kijs.getText('dunkelgrau'), Icon:'kijs.iconMap.Fa.droplet', Color:'#666666' }, 
                        {id:8, Bezeichnung:kijs.getText('grau'), Icon:'kijs.iconMap.Fa.droplet', Color:'#999999' }, 
                        {id:9, Bezeichnung:kijs.getText('hellgrau'), Icon:'kijs.iconMap.Fa.droplet', Color:'#bbbbbb' }, 
                        {id:10, Bezeichnung:kijs.getText('weiss'), Icon:'kijs.iconMap.Fa.droplet', Color:'#ffffff' }, 
                        {id:11, Bezeichnung:kijs.getText('schwarz'), Icon:'kijs.iconMap.Fa.droplet', Color:'#000000' }
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
