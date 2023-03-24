/* global kijs */

window.home.sc = {};
home.sc.Tooltip = class home_sc_Tooltip {
    
    
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
            caption: 'kijs.gui.Tooltip',
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
                    xtype: 'kijs.gui.Element',
                    html: ' Die "tooltip"-Eigenschaft haben kijs.gui.Element und kijs.gui.Dom und alle davon vererbten Klassen:',
                    style: { margin: '0 0 4px 0'}
                },{
                    xtype: 'kijs.gui.Element',
                    name: 'el',
                    html: 'Einfacher Tooltip',
                    style: { 
                        backgroundColor:'#ddd',
                        padding: '10px',
                        border: '1px solid #333'
                    },
                    tooltip: 'Ich bin ein <b>Tooltip</b>'
                },{
                    xtype: 'kijs.gui.Button',
                    caption: 'tooltip = \'\'',
                    on: {
                        click: function(e) {
                            e.element.previous.tooltip = '';
                        },
                        context: this
                    }
                },
                
                {
                    xtype: 'kijs.gui.Element',
                    html: 'Tooltip',
                    style: { 
                        backgroundColor:'#ddd',
                        margin: '10px 0 0 0',
                        padding: '10px',
                        border: '1px solid #333'
                    },
                    tooltip: { 
                        html: 'Ich bin ein <b>Tooltip</b>',
                        htmlDisplayType: 'code', 
                        followPointer: true
                    }
                },{
                    xtype: 'kijs.gui.Button',
                    caption: 'tooltip = \'\'',
                    on: {
                        click: function(e) {
                            e.element.previous.tooltip = '';
                        },
                        context: this
                    }
                },
                
                {
                    xtype: 'kijs.gui.Element',
                    html: 'Tooltip mit followPointer: false',
                    style: { 
                        backgroundColor:'#ddd',
                        margin: '10px 0 0 0',
                        padding: '10px',
                        border: '1px solid #333'
                    },
                    tooltip: { 
                        html: 'Ich bin ein <b>Tooltip</b>',
                        htmlDisplayType: 'text', 
                        followPointer: false
                    }
                },{
                    xtype: 'kijs.gui.Button',
                    caption: 'tooltip = \'\'',
                    on: {
                        click: function(e) {
                            e.element.previous.tooltip = '';
                        },
                        context: this
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