/* global kijs */

home.sc.Element = class home_sc_Element {
    
    
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
            caption: 'kijs.gui.Element',
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
                    cls: 'kijs-largeTitle',
                    value: 'Element mit HTML Inhalt:',
                    style: { margin: '0 0 4px 0'}
                },{
                    xtype: 'kijs.gui.Element',
                    name: 'el',
                    html: 'Bitte "Enter" drücken, draufklicken oder Maus über mich bewegen',
                    style: { 
                        backgroundColor:'#ddd',
                        padding: '10px',
                        border: '1px solid #333'
                    },
                    tooltip: { 
                        html: '<p>Test</p>', 
                        followPointer: false
                    },
                    on: {
                        click: function(e) {
                            e.element.tooltip.disabled = !this.tooltip.disabled;
                            e.element.html = 'tooltip ' + (e.element.tooltip.disabled ? 'disable' : 'enable');
                        },
                        enterPress: function(e) {
                            if (kijs.isNumeric(e.element.html)) {
                                e.element.html += 1;
                            } else {
                                e.element.html = 1;
                            }
                        },
                        escPress: function(e) {
                            if (kijs.isNumeric(e.element.html)) {
                                e.element.html -= 1;
                            } else {
                                e.element.html = 99;
                            }
                        },
                        keyDown: function(e) {
                            console.log(e.nodeEvent.keyCode);
                        }
                    }
                },
                
                {
                    xtype: 'kijs.gui.field.Display',
                    cls: 'kijs-largeTitle',
                    value: 'Element mit HTML Inhalt von RPC:',
                    style: { margin: '10px 0 4px 0'}
                },{
                    xtype: 'kijs.gui.Element',
                    rpcLoadFn: 'element.load',
                    autoLoad: true,
                    html: 'HTML wird dynamisch geladen',
                    style: { 
                        backgroundColor:'#ddd',
                        padding: '10px',
                        border: '1px solid #333'
                    }
                }
            ]
        });
        
        return this._content;
    }
    
    run() {
        this._content.down('el').dom.node.tabIndex = 1;
        this._content.down('el').focus();
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