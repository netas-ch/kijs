/* global kijs */

home.sc.Spacer = class home_sc_Spacer {
    
    
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
            caption: 'kijs.gui.Spacer',
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
                    value: 'kijs.gui.Spacer'
                },{
                    xtype: 'kijs.gui.field.Display',
                    value: 'Kurzform: ">"'
                },{
                    xtype: 'kijs.gui.field.Display',
                    value: 'Mit dem kijs.gui.Spacer können Abstände z.B. in Toolbars eingefügt werden. Die Elemente nach einem Spacer sind rechtsbündig ausgerichtet.'
                },
                {
                    xtype: 'kijs.gui.Panel',
                    caption: 'Beispiele im header und footer',
                    cls: 'kijs-flexfit',
                    innerStyle: { minHeight:'50px' },
                    width: 600,
                    headerElements:[
                        {
                            xtype: 'kijs.gui.field.Display',
                            value: 'linksbündig'
                        },
                        '>',
                        {
                            xtype: 'kijs.gui.field.Display',
                            value: 'zentriert'
                        },
                        '>',
                        {
                            xtype: 'kijs.gui.field.Display',
                            value: 'rechtsbündig'
                        }
                    ],
                    footerElements:[
                        {
                            xtype: 'kijs.gui.field.Display',
                            value: 'linksbündig'
                        },{
                            xtype: 'kijs.gui.Spacer'
                        },{
                            xtype: 'kijs.gui.field.Display',
                            value: 'rechtsbündig'
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