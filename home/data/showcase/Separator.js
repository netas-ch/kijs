/* global kijs */

home.sc.Separator = class home_sc_Separator {
    
    
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
            caption: 'kijs.gui.Separator',
            headerBarElements: [ this._app.createApiButton('kijs.gui.Separator') ],
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
                    xtype: 'kijs.gui.field.Display',
                    cls: 'kijs-titleLarge',
                    value: 'kijs.gui.Separator'
                },
                "-",
                {
                    xtype: 'kijs.gui.field.Display',
                    value: kijs.getText('Mit dem kijs.gui.Separator können Trennlinien z.B. in Toolbars eingefügt werden.')
                },{
                    xtype: 'kijs.gui.Separator'
                },{
                    xtype: 'kijs.gui.field.Display',
                    value: kijs.getText('Er passt seine Ausrichtung (horizontal/vertical) automatisch der aktuellen flex-direction an.')
                },
                "-",
                {
                    xtype: 'kijs.gui.Panel',
                    caption: kijs.getText('Beispiel Toolbar und Formularlayout'),
                    cls: 'kijs-flexfit',
                    width: 600,
                    headerElements:[
                        {
                            xtype: 'kijs.gui.Button',
                            iconMap: 'kijs.iconMap.Fa.apple'
                        },{
                            xtype: 'kijs.gui.Button',
                            iconMap: 'kijs.iconMap.Fa.linux'
                        },{
                            xtype: 'kijs.gui.Button',
                            iconMap: 'kijs.iconMap.Fa.windows'
                        },
                        "-",
                        {
                            xtype: 'kijs.gui.Button',
                            caption: kijs.getText('Sonnencreme'),
                            on: {
                                click: (e) => { kijs.gui.CornerTipContainer.show('Test', kijs.getText('Bäh!'), 'info'); }
                            }
                        },
                        "-",
                        {
                            xtype: 'kijs.gui.field.Display',
                            value: kijs.getText('Separators in einer Toolbar (vertikale Linien)')
                        }
                    ],
                    elements: [
                        {
                            xtype: 'kijs.gui.container.Form',
                            cls: 'kijs-flexform',
                            innerStyle: {
                                padding: '10px'
                            },
                            defaults: {
                                labelWidth: 100,
                                required: true,
                                defaults: {
                                    labelWidth: 100,
                                    required: true
                                }
                            },
                            elements:[
                                {
                                    xtype: 'kijs.gui.field.Display',
                                    value: kijs.getText('Separators in einem Formular (horizontale Linien)'),
                                    labelHide: true,
                                    cls: 'kijs-title'
                                },{
                                    xtype: 'kijs.gui.Separator'
                                },{
                                    xtype: 'kijs.gui.field.Email',
                                    name: 'Email',
                                    label: kijs.getText('E-Mail')
                                },{
                                    xtype: 'kijs.gui.Separator'
                                },{
                                    xtype: 'kijs.gui.field.Color',
                                    name: kijs.getText('Lieblingsfarbe'),
                                    label: kijs.getText('Lieblingsfarbe'),
                                    value: '#fff'
                                },{
                                    xtype: 'kijs.gui.Separator'
                                },{
                                    xtype: 'kijs.gui.field.OptionGroup',
                                    name: 'LieblingsBetriebssystem',
                                    label: kijs.getText('Lieblingsbetriebssystem'),
                                    displayTextField: 'displayText',
                                    valueField: 'value',
                                    iconMapField: 'iconMap',
                                    data: [
                                        { displayText: 'Apple', iconMap: 'kijs.iconMap.Fa.apple', value: 1},
                                        { displayText: 'Linux', iconMap: 'kijs.iconMap.Fa.linux', value: 2},
                                        { displayText: 'Windows', iconMap: 'kijs.iconMap.Fa.windows', value: 3}
                                    ]
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