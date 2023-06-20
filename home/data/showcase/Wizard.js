/* global kijs */

window.home.sc = {};
home.sc.Wizard = class home_sc_Wizard {
    
    
    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        this._app = config.app;
        this._content = null;
        this._wizard = null;
    }
    
    
    
    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    getContent() {
        this._content = new kijs.gui.Panel({
            caption: 'kijs.gui.Wizard',
            scrollableY: 'auto',
            style: {
                flex: 1
            },
            innerStyle: {
                padding: '10px'
            },
            elements:[
                {
                    xtype: 'kijs.gui.Button',
                    caption: 'Run',
                    iconMap: 'kijs.iconMap.Fa.play',
                    on: {
                        click: this.run,
                        context: this
                    }
                }
            ]
        });
        
        return this._content;
    }
    
    run() {
        this._wizard = new kijs.gui.Wizard({
            width: 450,
            height: 450,
            elements: [
                {
                    xtype: 'kijs.gui.Container',
                    height: null,
                    width: 200,
                    style: {
                        margin: '10px'
                    },
                    elements: [
                        {
                            xtype: 'kijs.gui.Element',
                            html: 'A1',
                            style: {border: '1px solid #f00'}
                        }, {
                            xtype: 'kijs.gui.Element',
                            html: 'B1',
                            style: {border: '1px solid #0f0'}
                        }, {
                            xtype: 'kijs.gui.Element',
                            html: 'C1',
                            style: {border: '1px solid #00f'}
                        }, {
                            xtype: 'kijs.gui.Element',
                            html: 'D1',
                            style: {border: '1px solid #ff0'}
                        }
                    ]
                }, {
                    xtype: 'kijs.gui.Container',
                    height: null,
                    width: 200,
                    style: {
                        margin: '10px',
                        border: '1px solid #000',
                        backgroundColor: '#ffd'
                    },
                    defaults: {
                        width: 80
                    },
                    elements: [
                        {
                            xtype: 'kijs.gui.Element',
                            html: 'A1',
                            style: {border: '1px solid #f00'}
                        }, {
                            xtype: 'kijs.gui.Element',
                            html: 'B1',
                            style: {border: '1px solid #0f0'}
                        }, {
                            xtype: 'kijs.gui.Element',
                            html: 'C1',
                            style: {border: '1px solid #00f'}
                        }, {
                            xtype: 'kijs.gui.Element',
                            html: 'D1',
                            style: {border: '1px solid #ff0'}
                        }
                    ]
                }
            ]
        });
        this._wizard.show();
    }


    // PROTECTED



    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct() {
        if (this._wizard) {
            this._wizard.destruct();
        }

        this._app = null;
        this._wizard = null;
        this._content = null;
    }
    
};
