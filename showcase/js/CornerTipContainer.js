/* global kijs */

window.sc = {};
sc.CornerTipContainer = class sc_CornerTipContainer {
    
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
            caption: 'kijs.gui.CornerTipContainer',
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
                    html: 'CornerTipContainer mit Icon:',
                    style: { margin: '0 0 4px 0'}
                },{
                    xtype: 'kijs.gui.Button',
                    caption: 'alert',
                    on: {
                        click: function() {
                            kijs.gui.CornerTipContainer.show('Test', 'Meine Nachricht!', 'alert');
                        }
                    }
                },{
                    xtype: 'kijs.gui.Button',
                    caption: 'info',
                    on: {
                        click: function() {
                            kijs.gui.CornerTipContainer.show('Test', 'Meine Nachricht!', 'info');
                        }
                    }
                },{
                    xtype: 'kijs.gui.Button',
                    caption: 'error',
                    on: {
                        click: function() {
                            kijs.gui.CornerTipContainer.show('Test', 'Meine Nachricht!', 'error');
                        }
                    }
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