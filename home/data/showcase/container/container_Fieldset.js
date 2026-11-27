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
            headerBarElements: [ this._app.createApiButton('kijs.gui.container.Fieldset') ],
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
                    caption: kijs.getText('Name'),
                    //iconMap: 'kijs.iconMap.Fa.user',
                    collapsible: true,
                    elements:[
                        {
                            xtype: 'kijs.gui.field.Combo',
                            name: 'Anrede',
                            label: kijs.getText('Anrede'),
                            valueField: 'value',
                            displayTextField: 'displayText',
                            data: [
                                {displayText: kijs.getText('Herr'), value: 'm' },
                                {displayText: kijs.getText('Frau'), value: 'w'},
                                {displayText: kijs.getText('Familie'), value: 'f'}
                            ]
                        },{
                            xtype: 'kijs.gui.field.Text',
                            name: 'Vorname',
                            label: kijs.getText('Vorname')
                        },{
                            xtype: 'kijs.gui.field.Text',
                            name: 'Name',
                            label: kijs.getText('Name')
                        }
                    ]
                },

                {
                    xtype: 'kijs.gui.container.Fieldset',
                    caption: kijs.getText('Adresse'),
                    //iconMap: 'kijs.iconMap.Fa.user',
                    collapsible: true,
                    elements:[
                        {
                            xtype: 'kijs.gui.field.Text',
                            name: 'Strasse',
                            label: kijs.getText('Strasse')
                        },{
                            xtype: 'kijs.gui.field.Text',
                            name: 'Ort',
                            label: kijs.getText('Ort')
                        },{
                            xtype: 'kijs.gui.field.Combo',
                            name: 'Land',
                            label: kijs.getText('Land'),
                            rpcLoadFn: 'land.load',
                            autoLoad: true,
                            valueField: 'ISO',
                            displayTextField: 'Land'
                        }
                    ]
                },

                {
                    xtype: 'kijs.gui.container.Fieldset',
                    caption: kijs.getText('Bemerkungen'),
                    collapsible: true,
                    elements: [
                        {
                            xtype: 'kijs.gui.field.Memo',
                            name: 'Bemerkungen',
                            label: kijs.getText('Bemerkungen'),
                            inputHeight: 50
                        }
                    ]
                },

                {
                    xtype: 'kijs.gui.container.Fieldset',
                    caption: kijs.getText('Weiteres'),
                    iconMap: 'kijs.iconMap.Fa.comment-dots',
                    collapsible: true,
                    collapsed: true,
                    elements: [
                        {
                            xtype: 'kijs.gui.container.Fieldset',
                            caption: kijs.getText('Haustiere'),
                            //iconMap: 'kijs.iconMap.Fa.dog',
                            elements: [
                                {
                                    xtype: 'kijs.gui.field.Memo',
                                    name: 'Haustiere',
                                    label: kijs.getText('Haustiere'),
                                    inputHeight: 50
                                }
                            ]
                        },{
                            xtype: 'kijs.gui.container.Fieldset',
                            caption: kijs.getText('Hobbys'),
                            //iconMap: 'kijs.iconMap.Fa.volleyball',
                            elements: [
                                {
                                    xtype: 'kijs.gui.field.Memo',
                                    name: 'Hobbys',
                                    label: kijs.getText('Hobbys'),
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