/* global kijs */

window.sc = {};
sc.Icon = class sc_Icon {
    
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
            autoScroll: true,
            style: {
                flex: 1
            },
            innerStyle: {
                padding: '10px'
            },
            elements:[
                {
                    xtype: 'kijs.gui.Element',
                    html: 'Icon aus IconMap:',
                    style: { margin: '0 0 4px 0'}
                },{
                    xtype: 'kijs.gui.Icon',
                    iconMap: 'kijs.iconMap.Fa.gamepad'
                },
                
                {
                    xtype: 'kijs.gui.Element',
                    html: 'Icon mit Bild:',
                    style: { margin: '10px 0 4px 0'}
                },{
                    xtype: 'kijs.gui.Icon',
                    iconCls: 'icoWizard16'
                },

                {
                    xtype: 'kijs.gui.Element',
                    html: 'Icon aus IconMap rotierend:',
                    style: { margin: '10px 0 4px 0'}
                },{
                    xtype: 'kijs.gui.Icon',
                    iconMap: 'kijs.iconMap.Fa.gamepad',
                    cls: 'kijs-spin'
                },
                
                {
                    xtype: 'kijs.gui.Element',
                    html: '<a href="https://fontawesome.com/search?o=r&m=free" target="blank">FontAwesome free Icons</a>',
                    style: { margin: '20px 0 4px 0'}
                }
            ]
        });
        
        return this._content;
    }
    
    run() {
        
    }


    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct() {
        this._content = null;
    }
};