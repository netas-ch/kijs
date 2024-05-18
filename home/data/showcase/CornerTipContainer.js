/* global kijs */

home.sc.CornerTipContainer = class home_sc_CornerTipContainer {
    
    
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
                    cls: 'kijs-largeTitle',
                    value: 'CornerTipContainer mit Icon:',
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
                    caption: 'errorNotice',
                    on: {
                        click: function() {
                            kijs.gui.CornerTipContainer.show('Test', 'Meine Nachricht!', 'errorNotice');
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