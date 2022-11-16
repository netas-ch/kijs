/* global kijs */

window.sc = {};
sc.Resizer = class sc_Resizer {
    
    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        this._app = config.app;
        this._content = null;
        this._win = null;
    }
    
    
    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    getContent() {
        this._content = new kijs.gui.Panel({
            caption: 'kijs.gui.Resizer',
            autoScroll: true,
            style: {
                flex: 1
            },
            innerStyle: {
                padding: '10px'
            },
            elements:[
                {
                    xtype: 'kijs.gui.Panel',
                    caption: 'Panel mit Resizer',
                    iconMap: 'kijs.iconMap.Fa.up-right-and-down-left-from-center',
                    shadow: true,
                    resizable: true,
                    width: 150,
                    height: 100,
                    elements: []/*,
                    footerCaption: 'Meine FooterBar'*/
                }
                
                
            ]
        });
        
        return this._content;
    }
    
    run() {
        this._win = new kijs.gui.Window({
            caption: 'Window mit Resizer',
            iconMap: 'kijs.iconMap.Fa.up-right-and-down-left-from-center',
            resizable: true,
            maximizable: false,
            width: 200,
            height: 100,
            elements: []/*,
            footerCaption: 'Meine FooterBar'*/
        });
        this._win.show();
    }

        

    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct() {
        if (this._win) {
            this._win.destruct();
        }
        
        this._win = null;
        this._content = null;
    }
};