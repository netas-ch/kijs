/* global kijs */

home.sc.container_Fieldset = class home_sc_container_Fieldset {
    
    
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
            caption: 'kijs.gui.container.Fieldset',
            cls: ['kijs-borderless','kijs-flexform'],
            scrollableY: 'auto',
            style: {
                flex: 1
            },
            innerStyle: {
                padding: '10px'
            },
            headerElements: this._getHeaderElements(),
            defaults: {
                labelWidth: 110,
                required: true,
                defaults: {
                    labelWidth: 110,
                    required: true,
                    defaults: {
                        labelWidth: 110,
                        required: true
                    }
                }
            },
            elements:[
                {
                    xtype: 'kijs.gui.container.Fieldset',
                    caption: 'Name',
                    //iconMap: 'kijs.iconMap.Fa.user',
                    collapsible: true,
                    elements:[
                        {
                            xtype: 'kijs.gui.field.Combo',
                            name: 'Anrede',
                            label: 'Anrede',
                            valueField: 'value',
                            displayTextField: 'displayText',
                            data: [
                                {displayText: 'Herr', value: 'm' },
                                {displayText: 'Frau', value: 'w'},
                                {displayText: 'Familie', value: 'f'}
                            ]
                        },{
                            xtype: 'kijs.gui.field.Text',
                            name: 'Vorname',
                            label: 'Vorname'
                        },{
                            xtype: 'kijs.gui.field.Text',
                            name: 'Name',
                            label: 'Name'
                        }
                    ]
                },

                {
                    xtype: 'kijs.gui.container.Fieldset',
                    caption: 'Adresse',
                    //iconMap: 'kijs.iconMap.Fa.user',
                    collapsible: true,
                    elements:[
                        {
                            xtype: 'kijs.gui.field.Text',
                            name: 'Strasse',
                            label: 'Strasse'
                        },{
                            xtype: 'kijs.gui.field.Text',
                            name: 'Ort',
                            label: 'Ort'
                        },{
                            xtype: 'kijs.gui.field.Combo',
                            name: 'Land',
                            label: 'Land',
                            rpcLoadFn: 'land.load',
                            autoLoad: true,
                            valueField: 'value',
                            displayTextField: 'displayText'
                        }
                    ]
                },

                {
                    xtype: 'kijs.gui.container.Fieldset',
                    caption: 'Bemerkungen',
                    collapsible: true,
                    elements: [
                        {
                            xtype: 'kijs.gui.field.Memo',
                            name: 'Bemerkungen',
                            label: 'Bemerkungen',
                            inputHeight: 50
                        }
                    ]
                },

                {
                    xtype: 'kijs.gui.container.Fieldset',
                    caption: 'Weiteres',
                    iconMap: 'kijs.iconMap.Fa.comment-dots',
                    collapsible: true,
                    collapsed: true,
                    elements: [
                        {
                            xtype: 'kijs.gui.container.Fieldset',
                            caption: 'Haustiere',
                            //iconMap: 'kijs.iconMap.Fa.dog',
                            elements: [
                                {
                                    xtype: 'kijs.gui.field.Memo',
                                    name: 'Haustiere',
                                    label: 'Haustiere',
                                    inputHeight: 50
                                }
                            ]
                        },{
                            xtype: 'kijs.gui.container.Fieldset',
                            caption: 'Hobbys',
                            //iconMap: 'kijs.iconMap.Fa.volleyball',
                            elements: [
                                {
                                    xtype: 'kijs.gui.field.Memo',
                                    name: 'Hobbys',
                                    label: 'Hobbys',
                                    inputHeight: 50
                                }
                            ]
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