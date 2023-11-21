/* global kijs */

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
            headerElements: this._getHeaderElements(),
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
            },{
                xtype: 'kijs.gui.field.Combo',
                label: 'CSS-Klasse für Panel:',
                value: 'kijs-flexform',
                width: 230,
                data: [
                    { caption: 'keine', value: 'none' },
                    { caption: 'kijs-flexrow', value: 'kijs-flexrow' },
                    { caption: 'kijs-flexcolumn', value: 'kijs-flexcolumn' },
                    { caption: 'kijs-flexform', value: 'kijs-flexform' },
                    { caption: 'kijs-flexline', value: 'kijs-flexline' }
                ],
                on: {
                    change: function(e) {
                        let panel = this._content.down('myPanel');
                        panel.dom.clsRemove(['kijs-flexrow', 'kijs-flexcolumn', 
                            'kijs-flexform', 'kijs-flexline']);
                        if (e.element.value !== 'none') {
                            panel.dom.clsAdd(e.element.value);
                        }
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