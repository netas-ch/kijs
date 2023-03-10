/* global kijs */

window.home.test = {};
home.test.Layout = class home_test_Layout {
    
    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        this._app = config.app;
        this._content = null;
        
        this.__testState = 0;
    }
    
    
    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    getContent() {
        this._content = new kijs.gui.Panel({
            caption: 'Test für die verschiedenen Layouts',
            scrollableY: 'auto',
            style: {
                flex: 1
            },
            innerStyle: {
                padding: '10px'
            },
            headerElements:[
                {
                    xtype: 'kijs.gui.field.OptionGroup',
                    label: 'CSS-Klasse für Panel:',
                    cls: 'kijs-inline',
                    value: 'none',
                    data: [
                        { caption: 'keine', value: 'none' },
                        { caption: 'kijs-flexRow', value: 'kijs-flexRow' },
                        { caption: 'kijs-flexRowLine', value: 'kijs-flexRowLine' },
                        { caption: 'kijs-flexCol', value: 'kijs-flexCol' },
                        { caption: 'kijs-flexColLine', value: 'kijs-flexColLine' }
                    ],
                    on: {
                        change: function(e) {
                            let panel = this._content.down('myPanel');
                            panel.dom.clsRemove(['kijs-flexRow', 'kijs-flexRowLine', 'kijs-flexCol', 'kijs-flexColLine']);
                            if (e.element.value !== 'none') {
                                panel.dom.clsAdd(e.element.value);
                            }
                        },
                        context: this
                    }
                }
            ],
            elements:[
                {
                    xtype: 'kijs.gui.Panel',
                    name: 'myPanel',
                    caption: 'Test-Panel',
                    shadow: true,
                    resizable: true,
                    height: 400,
                    width: 400,
                    innerCls: 'paperBkgrnd',
                    defaults:{
                        xtype: 'kijs.gui.Element',
                        //width: 50,
                        style: { 
                            border: '1px solid #333',
                            backgroundColor: '#eee',
                            textAlign: 'center',
                            width: '50px'
                        }
                    },
                    elements: [
                        { html: "A" },
                        { html: "B" },
                        { html: "C" },
                        { html: "D" },
                        { html: "E" },
                        { xtype: 'kijs.gui.Button' },
                        { xtype: 'kijs.gui.field.Text' }
                    ]
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