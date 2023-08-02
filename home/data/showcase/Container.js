/* global kijs */

window.home.sc = {};
home.sc.Container = class home_sc_Container {
    
    
    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        this._app = config.app;
        this._content = null;
    }
    
    
    
    // --------------------------------------------------------------
    // STATICS
    // --------------------------------------------------------------
    // Listener für dynamisch geladenen Button
    static onRpcButtonClick(e) {
        e.element.caption = 'Ich wurde angeklickt';
    }
    
    
    
    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    getContent() {
        this._content = new kijs.gui.Panel({
            caption: 'kijs.gui.Container',
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
                    html: 'Container mit HTML Inhalt:',
                    style: { margin: '0 0 4px 0'}
                },{
                    xtype: 'kijs.gui.Container',
                    name: 'cont',
                    html: 'Bitte "Enter" drücken, draufklicken oder Maus über mich bewegen',
                    style: {
                        backgroundColor:'#ddd',
                        padding: '10px',
                        border: '1px solid #333'
                    },
                    innerStyle: {
                        backgroundColor: '#afa'
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
                    xtype: 'kijs.gui.Element',
                    html: 'Container mit Elementen als Inhalt:',
                    style: { margin: '10px 0 4px 0'}
                },{
                    xtype: 'kijs.gui.Container',
                    style: { border: '2px solid #999' },
                    defaults: {
                        xtype: 'kijs.gui.Element',
                        height: 20,
                        width: 20,
                        style: {
                            margin: '10px',
                            textAlign: 'center',
                            backgroundColor:'#ddd'
                        }
                    },
                    elements: [
                        {
                            html: 'A',
                            style: { border:'1px solid #f00' }
                        },{
                            html: 'B',
                            style: { border:'1px solid #0f0' }
                        },{
                            html: 'C',
                            style: { border:'1px solid #00f' }
                        },{
                            html: 'D',
                            style: { border:'1px solid #ff0' }
                        },{
                            xtype: 'kijs.gui.Container',
                            name: 'Mein Container',
                            height: null,
                            width: 200,
                            style: { 
                                border:'1px solid #000',
                                backgroundColor:'#fdf'
                            },
                            elements: [
                                {
                                    xtype: 'kijs.gui.Element',
                                    html: 'A1',
                                    style: { border:'1px solid #f00' }
                                },{
                                    xtype: 'kijs.gui.Element',
                                    name: 'Mein Element',
                                    html: 'B1',
                                    style: { border:'1px solid #0f0' }
                                },{
                                    xtype: 'kijs.gui.Element',
                                    html: 'C1',
                                    style: { border:'1px solid #00f' }
                                },{
                                    xtype: 'kijs.gui.Element',
                                    html: 'D1',
                                    style: { border:'1px solid #ff0' }
                                }
                            ]
                        },{
                            xtype: 'kijs.gui.Container',
                            height: null,
                            width: 200,
                            style: { 
                                border:'1px solid #000',
                                backgroundColor:'#ffd'
                            },
                            defaults: {
                                width: 80
                            },
                            elements: [
                                {
                                    xtype: 'kijs.gui.Element',
                                    html: 'A1',
                                    style: { border:'1px solid #f00' }
                                },{
                                    xtype: 'kijs.gui.Element',
                                    html: 'B1',
                                    style: { border:'1px solid #0f0' }
                                },{
                                    xtype: 'kijs.gui.Element',
                                    html: 'C1',
                                    style: { border:'1px solid #00f' }
                                },{
                                    xtype: 'kijs.gui.Element',
                                    html: 'D1',
                                    style: { border:'1px solid #ff0' }
                                }
                            ]
                        }
                    ]
                },
                
                {
                    xtype: 'kijs.gui.Element',
                    html: 'Container mit HTML Inhalt von RPC:',
                    style: { margin: '10px 0 4px 0'}
                },{
                    xtype: 'kijs.gui.Container',
                    rpcLoadFn: 'container.load',
                    autoLoad: true,
                    elements: [
                        {
                            xtype: 'kijs.gui.Element',
                            html: 'HTML wird dynamisch geladen'
                        }
                    ],
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
        this._content.down('Mein Element').upX('kijs.gui.Container').downX('kijs.gui.Element').next.next.previous.html = 'Gugus';
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