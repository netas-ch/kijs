/* global kijs */

window.home.sc = {};
home.sc.Resizer = class home_sc_Resizer {
    
    
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
                    caption: 'Panel mit Resizer',
                    iconMap: 'kijs.iconMap.Fa.up-right-and-down-left-from-center',
                    shadow: true,
                    resizable: true,
                    resizableWidth: true,
                    resizableHeight: true,
                    width: 150,
                    height: 100,
                    elements: []/*,
                    footerBarCaption: 'Meine FooterBar'*/
                }
                
                
            ]
        });
        
        return this._content;
    }
    
    run() {
        this._win = new kijs.gui.Window({
            caption: 'Window mit Resizer',
            iconMap: 'kijs.iconMap.Fa.up-right-and-down-left-from-center',
            resizableWidth: false,
            resizableHeight: true,
            maximizable: false,
            width: 200,
            height: 100,
            elements: []/*,
            footerBarCaption: 'Meine FooterBar'*/
        });
        this._win.show();
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
        if (this._win) {
            this._win.destruct();
        }
        
        this._win = null;
        this._content = null;
    }
    
};