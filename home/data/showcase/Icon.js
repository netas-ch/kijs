/* global kijs */

home.sc.Icon = class home_sc_Icon {
    
    
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
            caption: 'kijs.gui.Icon',
            cls: 'kijs-borderless',
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
                    value: 'Icon aus IconMap:',
                    style: { margin: '0 0 4px 0'}
                },{
                    xtype: 'kijs.gui.Icon',
                    iconMap: 'kijs.iconMap.Fa.gamepad'
                },
                
                {
                    xtype: 'kijs.gui.field.Display',
                    cls: 'kijs-titleLarge',
                    value: 'Icon mit Bild:',
                    style: { margin: '10px 0 4px 0'}
                },{
                    xtype: 'kijs.gui.Icon',
                    iconCls: 'icoWizard16'
                },

                {
                    xtype: 'kijs.gui.field.Display',
                    cls: 'kijs-titleLarge',
                    value: 'Icon aus IconMap rotierend:',
                    style: { margin: '10px 0 4px 0'}
                },{
                    xtype: 'kijs.gui.Icon',
                    iconMap: 'kijs.iconMap.Fa.gamepad',
                    iconAnimationCls: 'kijs-spin'
                },
                
                {
                    xtype: 'kijs.gui.field.Display',
                    cls: 'kijs-titleLarge',
                    value: 'FontAwesome free Icons: https://fontawesome.com/search?o=r&m=free',
                    clickableLinks: true,
                    style: { margin: '20px 0 4px 0'}
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