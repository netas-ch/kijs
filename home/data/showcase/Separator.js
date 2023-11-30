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
                    value: 'Mit dem kijs.gui.Separator können Trennlinien z.B. in Toolbars eingefügt werden.'
                },{
                    xtype: 'kijs.gui.Separator'
                },{
                    xtype: 'kijs.gui.field.Display',
                    value: 'Er passt seine Ausrichtung (horizontal/vertical) automatisch der aktuellen flex-direction an.'
                },{
                    xtype: 'kijs.gui.Separator'
                },
                {
                    xtype: 'kijs.gui.FormPanel',
                    caption: 'Beispiel Toolbar und Formlayout',
                    scrollableY: 'auto',
                    width: 600,
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
                        },{
                            xtype: 'kijs.gui.Separator'
                        },{
                            xtype: 'kijs.gui.Button',
                            caption: 'Sonnencreme',
                            on: {
                                click: (e) => { kijs.gui.CornerTipContainer.show('Test', 'Bäh!', 'info'); }
                            }
                        },{
                            xtype: 'kijs.gui.Separator'
                        },{
                            xtype: 'kijs.gui.field.Display',
                            value: 'Separators in einer Toolbar (vertikale Linien)'
                        }
                    ],
                    elements: [
                        {
                            xtype: 'kijs.gui.field.Display',
                            value: 'Separators in einem Formular (horizontale Linien)',
                            labelHide: true,
                            cls: 'kijs-title'
                        },{
                            xtype: 'kijs.gui.Separator'
                        },{
                            xtype: 'kijs.gui.field.Email',
                            name: 'Email',
                            label: 'E-Mail'
                        },{
                            xtype: 'kijs.gui.Separator'
                        },{
                            xtype: 'kijs.gui.field.Color',
                            name: 'Lieblingsfarbe',
                            label: 'Lieblingsfarbe',
                            value: '#fff'
                        },{
                            xtype: 'kijs.gui.Separator'
                        },{
                            xtype: 'kijs.gui.field.OptionGroup',
                            name: 'LieblingsBetriebssystem',
                            label: 'Lieblings Betriebssystem',
                            captionField: 'caption',
                            valueField: 'value',
                            iconMapField: 'iconMap',
                            data: [
                                { caption: 'Apple', iconMap: 'kijs.iconMap.Fa.apple', value: 1},
                                { caption: 'Linux', iconMap: 'kijs.iconMap.Fa.linux', value: 2},
                                { caption: 'Windows', iconMap: 'kijs.iconMap.Fa.windows', value: 3}
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