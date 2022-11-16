/* global kijs */

window.sc = {};
sc.SpinBox = class sc_SpinBox {
    
    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        this._app = config.app;
        this._content = null;
        this._spinBox = null;
    }
    
    
    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    getContent() {
        this._content = new kijs.gui.Panel({
            caption: 'kijs.gui.SpinBox',
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
                    html: 'Button mit spinBox:',
                    style: { margin: '0 0 4px 0'}
                },{
                    xtype: 'kijs.gui.Button',
                    caption: 'open',
                    iconMap: 'kijs.iconMap.Fa.rectangle-list',
                    on: {
                        click: function(e) {
                            const spinBox = new kijs.gui.SpinBox({
                                target: e.element,
                                targetPos: 'tl',
                                ownPos: 'bl',
                                innerStyle: {
                                    padding: '10px'
                                },
                                html: 'Ich bin eine SpinBox mit etwas HTML-Inhalt<br>Bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla.'
                            });
                            spinBox.show();
                        },
                        context: this
                    }
                },
                
                
                {
                    xtype: 'kijs.gui.Element',
                    html: 'target:',
                    style: { margin: '100px 0 4px 0'}
                },{
                    xtype: 'kijs.gui.Container',
                    name: 'targetEl',
                    width: 150,
                    height: 150,
                    cls: 'kijs-flexcolumn',
                    style: { 
                        margin: '0 0 4px 100px',
                        padding: '10px',
                        border: '1px solid #333',
                        background: '#ddd'
                    },
                    innerStyle: { justifyContent: 'space-between' },
                    elements:[
                        { 
                            xtype: 'kijs.gui.Container',
                            cls: 'kijs-flexrow',
                            style: { flex: 'none' },
                            elements:[
                                { xtype: 'kijs.gui.Element', style: {flex: 1, textAlign:'left'}, html: 'tl' },
                                { xtype: 'kijs.gui.Element', style: {flex: 1, textAlign:'center'}, html: 't' },
                                { xtype: 'kijs.gui.Element', style: {flex: 1, textAlign:'right'}, html: 'tr' }
                            ]
                        },{ 
                            xtype: 'kijs.gui.Container',
                            cls: 'kijs-flexrow',
                            style: { flex: 'none' },
                            elements:[
                                { xtype: 'kijs.gui.Element', style: {flex: 1, textAlign:'left'}, html: 'l' },
                                { xtype: 'kijs.gui.Element', style: {flex: 1, textAlign:'center'}, html: 'c' },
                                { xtype: 'kijs.gui.Element', style: {flex: 1, textAlign:'right'}, html: 'r' }
                            ]
                        },{ 
                            xtype: 'kijs.gui.Container',
                            cls: 'kijs-flexrow',
                            style: { flex: 'none' },
                            elements:[
                                { xtype: 'kijs.gui.Element', style: {flex: 1, textAlign:'left'}, html: 'bl' },
                                { xtype: 'kijs.gui.Element', style: {flex: 1, textAlign:'center'}, html: 'b' },
                                { xtype: 'kijs.gui.Element', style: {flex: 1, textAlign:'right'}, html: 'br' }
                            ]
                        }
                    ]
                },
                
                
                {
                    xtype: 'kijs.gui.Element',
                    html: 'SpinBox-Einstellungen',
                    style: { margin: '100px 0 4px 0'}
                },{
                    xtype: 'kijs.gui.field.OptionGroup',
                    name: 'ownPos',
                    label: 'ownPos',
                    cls: 'kijs-inline',
                    valueField: 'id',
                    captionField: 'id',
                    required: true,
                    data: [
                        { id: 'tl' },
                        { id: 't' },
                        { id: 'tr' },
                        { id: 'l' },
                        { id: 'c' },
                        { id: 'r' },
                        { id: 'bl' },
                        { id: 'b' },
                        { id: 'br' }
                    ],
                    value: 'c',
                    on: {
                        change: this._updateSpinBox,
                        context: this
                    }
                },{
                    xtype: 'kijs.gui.field.OptionGroup',
                    name: 'targetPos',
                    label: 'targetPos',
                    cls: 'kijs-inline',
                    valueField: 'id',
                    captionField: 'id',
                    required: true,
                    data: [
                        { id: 'tl' },
                        { id: 't' },
                        { id: 'tr' },
                        { id: 'l' },
                        { id: 'c' },
                        { id: 'r' },
                        { id: 'bl' },
                        { id: 'b' },
                        { id: 'br' }
                    ],
                    value: 'c',
                    on: {
                        change: this._updateSpinBox,
                        context: this
                    }
                },{
                    xtype: 'kijs.gui.field.OptionGroup',
                    name: 'autoSize',
                    label: 'autoSize',
                    cls: 'kijs-inline',
                    valueField: 'id',
                    captionField: 'id',
                    required: true,
                    data: [
                        { id: 'min' },
                        { id: 'max' },
                        { id: 'fit' },
                        { id: 'none' }
                    ],
                    value: 'min',
                    on: {
                        change: this._updateSpinBox,
                        context: this
                    }
                },{
                    xtype: 'kijs.gui.Button',
                    caption: 'SpinBox anzeigen',
                    style: { margin: '4px 0 4px 0'},
                    on: {
                        click: this._updateSpinBox,
                        context: this
                    }
                }
            ]
        });
        
        return this._content;
    }
    
    run() {
        this._spinBox = new kijs.gui.SpinBox({
            target: this._content.down('targetEl'),
            style: {
                padding: '10px',
                border: '1px solid #333',
                background: '#fdd'
            },
            html: 'spinBox'
        });
        this._updateSpinBox();
    }
    
    _updateSpinBox() {
        this._spinBox.ownPos = this._content.down('ownPos').value;
        this._spinBox.targetPos = this._content.down('targetPos').value;
        this._spinBox.autoSize = this._content.down('autoSize').value;
        this._spinBox.show();
    }
    
    
    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct() {
        if (this._spinBox) {
            this._spinBox.destruct();
        }
        
        this._spinBox = null;
        this._content = null;
    }
};