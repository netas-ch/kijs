/* global kijs */

window.sc = {};
sc.Element = class sc_Element {
    
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
                    html: 'Element mit HTML Inhalt:',
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
                }
            ]
        });
        
        return this._content;
    }
    
    run() {
        this._content.down('el').dom.node.tabIndex = 1;
        this._content.down('el').focus();
    }


    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct() {
        this._content = null;
    }
};