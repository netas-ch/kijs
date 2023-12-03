/* global kijs */

home.test.ScrollIntoView = class home_test_ScrollIntoView {
    
    
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
            caption: 'Test für kijs.gui.Dom.scrollIntoView()',
            scrollableY: 'auto',
            cls: ['kijs-borderless', 'kijs-flexform'],
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
                    value: 'Testseite für die Methoden'
                },{
                    xtype: 'kijs.gui.field.Display',
                    value: ' - kijs.Dom.ScrollIntoView(node, options)'
                },{
                    xtype: 'kijs.gui.field.Display',
                    value: ' - kijs.gui.Dom.ScrollIntoView(options)'
                },{
                    xtype: 'kijs.gui.Panel',
                    name: 'panel1',
                    caption: 'Panel 1',
                    resizable: true,
                    scrollableY: 'auto',
                    height: 100,
                    width: 400,
                    cls: 'kijs-flexcolumn',
                    style: {
                        margin: '10px 0 0 0'
                    },
                    innerStyle: {
                        padding: '10px',
                        gap: '4px'
                    },
                    elements: [
                        {
                            xtype: 'kijs.gui.Button',
                            name: 'button1.1',
                            caption: 'Button 1.1'
                        },{
                            xtype: 'kijs.gui.Button',
                            name: 'button1.2',
                            caption: 'Button 1.2'
                        },{
                            xtype: 'kijs.gui.Button',
                            name: 'button1.3',
                            caption: 'Button 1.3'
                        },{
                            xtype: 'kijs.gui.Button',
                            name: 'button1.4',
                            caption: 'Button 1.4'
                        },{
                            xtype: 'kijs.gui.Button',
                            name: 'button1.5',
                            caption: 'Button 1.5'
                        },{
                            xtype: 'kijs.gui.Button',
                            name: 'button1.6',
                            caption: 'Button 1.6'
                        }
                    ]
                },{
                    xtype: 'kijs.gui.Button',
                    name: 'button1',
                    caption: 'Button 1',
                    style: {
                        margin: '10px 0 0 0'
                    }
                },{
                    xtype: 'kijs.gui.Panel',
                    name: 'panel2',
                    caption: 'Panel 2',
                    resizable: true,
                    scrollableX: 'auto',
                    height: 100,
                    width: 180,
                    cls: 'kijs-flexrow',
                    style: {
                        margin: '10px 0 0 0'
                    },
                    innerStyle: {
                        padding: '10px',
                        gap: '4px'
                    },
                    elements: [
                        {
                            xtype: 'kijs.gui.Button',
                            name: 'button2.1',
                            caption: 'Button 2.1'
                        },{
                            xtype: 'kijs.gui.Button',
                            name: 'button2.2',
                            caption: 'Button 2.2'
                        },{
                            xtype: 'kijs.gui.Button',
                            name: 'button2.3',
                            caption: 'Button 2.3'
                        },{
                            xtype: 'kijs.gui.Button',
                            name: 'button2.4',
                            caption: 'Button 2.4'
                        },{
                            xtype: 'kijs.gui.Button',
                            name: 'button2.5',
                            caption: 'Button 2.5'
                        },{
                            xtype: 'kijs.gui.Button',
                            name: 'button2.6',
                            caption: 'Button 2.6'
                        }
                    ]
                },{
                    xtype: 'kijs.gui.Button',
                    name: 'button2',
                    caption: 'Button 2',
                    style: {
                        margin: '10px 0 0 0'
                    }
                },{
                    xtype: 'kijs.gui.Panel',
                    name: 'panel3',
                    caption: 'Panel 3',
                    resizable: true,
                    width: 400,
                    cls: 'kijs-flexform',
                    style: {
                        margin: '10px 0 0 0'
                    },
                    innerStyle: {
                        padding: '10px'
                    },
                    elements: [
                        {
                            xtype: 'kijs.gui.Button',
                            name: 'button3.1',
                            caption: 'Button 3.1'
                        },{
                            xtype: 'kijs.gui.Button',
                            name: 'button3.2',
                            caption: 'Button 3.2'
                        },{
                            xtype: 'kijs.gui.Button',
                            name: 'button3.3',
                            caption: 'Button 3.3'
                        },{
                            xtype: 'kijs.gui.Button',
                            name: 'button3.4',
                            caption: 'Button 3.4'
                        },{
                            xtype: 'kijs.gui.Button',
                            name: 'button3.5',
                            caption: 'Button 3.5'
                        },{
                            xtype: 'kijs.gui.Button',
                            name: 'button3.6',
                            caption: 'Button 3.6'
                        },{
                            xtype: 'kijs.gui.Button',
                            name: 'button3.7',
                            caption: 'Button 3.7'
                        },{
                            xtype: 'kijs.gui.Button',
                            name: 'button3.8',
                            caption: 'Button 3.8'
                        },{
                            xtype: 'kijs.gui.Button',
                            name: 'button3.9',
                            caption: 'Button 3.9'
                        },{
                            xtype: 'kijs.gui.Button',
                            name: 'button3.10',
                            caption: 'Button 3.10'
                        },{
                            xtype: 'kijs.gui.Button',
                            name: 'button3.11',
                            caption: 'Button 3.11'
                        },{
                            xtype: 'kijs.gui.Button',
                            name: 'button3.12',
                            caption: 'Button 3.12'
                        },{
                            xtype: 'kijs.gui.Button',
                            name: 'button3.13',
                            caption: 'Button 3.13'
                        },{
                            xtype: 'kijs.gui.Button',
                            name: 'button3.14',
                            caption: 'Button 3.14'
                        },{
                            xtype: 'kijs.gui.Button',
                            name: 'button3.15',
                            caption: 'Button 3.15'
                        },{
                            xtype: 'kijs.gui.Button',
                            name: 'button3.16',
                            caption: 'Button 3.16'
                        },{
                            xtype: 'kijs.gui.Button',
                            name: 'button3.17',
                            caption: 'Button 3.17'
                        },{
                            xtype: 'kijs.gui.Button',
                            name: 'button3.18',
                            caption: 'Button 3.18'
                        },{
                            xtype: 'kijs.gui.Button',
                            name: 'button3.19',
                            caption: 'Button 3.19'
                        },{
                            xtype: 'kijs.gui.Button',
                            name: 'button3.20',
                            caption: 'Button 3.20'
                        },{
                            xtype: 'kijs.gui.Button',
                            name: 'button3.21',
                            caption: 'Button 3.21'
                        },{
                            xtype: 'kijs.gui.Button',
                            name: 'button3.22',
                            caption: 'Button 3.22'
                        },{
                            xtype: 'kijs.gui.Button',
                            name: 'button3.23',
                            caption: 'Button 3.23'
                        },{
                            xtype: 'kijs.gui.Button',
                            name: 'button3.24',
                            caption: 'Button 3.24'
                        },{
                            xtype: 'kijs.gui.Button',
                            name: 'button3.25',
                            caption: 'Button 3.25'
                        },{
                            xtype: 'kijs.gui.Button',
                            name: 'button3.26',
                            caption: 'Button 3.26'
                        },{
                            xtype: 'kijs.gui.Button',
                            name: 'button3.27',
                            caption: 'Button 3.27'
                        },{
                            xtype: 'kijs.gui.Button',
                            name: 'button3.28',
                            caption: 'Button 3.28'
                        },{
                            xtype: 'kijs.gui.Button',
                            name: 'button3.29',
                            caption: 'Button 3.29'
                        },{
                            xtype: 'kijs.gui.Button',
                            name: 'button3.30',
                            caption: 'Button 3.30'
                        }
                    ]
                },{
                    xtype: 'kijs.gui.Button',
                    name: 'button3',
                    caption: 'Button 3',
                    style: {
                        margin: '10px 0 0 0'
                    }
                },{
                    xtype: 'kijs.gui.Element',
                    html: 'whitespace',
                    height: 500,
                    style: {
                        color: 'var(--grey3)'
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
            },{
                xtype: 'kijs.gui.Separator'
            },{
                xtype: 'kijs.gui.field.Combo',
                name: 'elName',
                label: 'Scroll to Element:',
                value: 'button3.20',
                width: 200,
                data: [
                    { caption: 'Panel 1', value: 'panel1' },
                    { caption: 'Button 1.1', value: 'button1.1' },
                    { caption: 'Button 1.2', value: 'button1.2' },
                    { caption: 'Button 1.3', value: 'button1.3' },
                    { caption: 'Button 1.4', value: 'button1.4' },
                    { caption: 'Button 1.5', value: 'button1.5' },
                    { caption: 'Button 1.6', value: 'button1.6' },
                    { caption: 'Button 1', value: 'button1' },
                    
                    { caption: 'Panel 2', value: 'panel2' },
                    { caption: 'Button 2.1', value: 'button2.1' },
                    { caption: 'Button 2.2', value: 'button2.2' },
                    { caption: 'Button 2.3', value: 'button2.3' },
                    { caption: 'Button 2.4', value: 'button2.4' },
                    { caption: 'Button 2.5', value: 'button2.5' },
                    { caption: 'Button 2.6', value: 'button2.6' },
                    { caption: 'Button 2', value: 'button2' },
                    
                    { caption: 'Panel 3', value: 'panel3' },
                    { caption: 'Button 3.1', value: 'button3.1' },
                    { caption: 'Button 3.2', value: 'button3.2' },
                    { caption: 'Button 3.3', value: 'button3.3' },
                    { caption: 'Button 3.4', value: 'button3.4' },
                    { caption: 'Button 3.5', value: 'button3.5' },
                    { caption: 'Button 3.6', value: 'button3.6' },
                    { caption: 'Button 3.7', value: 'button3.7' },
                    { caption: 'Button 3.8', value: 'button3.8' },
                    { caption: 'Button 3.9', value: 'button3.9' },
                    { caption: 'Button 3.10', value: 'button3.10' },
                    { caption: 'Button 3.11', value: 'button3.11' },
                    { caption: 'Button 3.12', value: 'button3.12' },
                    { caption: 'Button 3.13', value: 'button3.13' },
                    { caption: 'Button 3.14', value: 'button3.14' },
                    { caption: 'Button 3.15', value: 'button3.15' },
                    { caption: 'Button 3.16', value: 'button3.16' },
                    { caption: 'Button 3.17', value: 'button3.17' },
                    { caption: 'Button 3.18', value: 'button3.18' },
                    { caption: 'Button 3.19', value: 'button3.19' },
                    { caption: 'Button 3.20', value: 'button3.20' },
                    { caption: 'Button 3.21', value: 'button3.21' },
                    { caption: 'Button 3.22', value: 'button3.22' },
                    { caption: 'Button 3.23', value: 'button3.23' },
                    { caption: 'Button 3.24', value: 'button3.24' },
                    { caption: 'Button 3.25', value: 'button3.25' },
                    { caption: 'Button 3.26', value: 'button3.26' },
                    { caption: 'Button 3.27', value: 'button3.27' },
                    { caption: 'Button 3.28', value: 'button3.28' },
                    { caption: 'Button 3.29', value: 'button3.29' },
                    { caption: 'Button 3.30', value: 'button3.30' },
                    { caption: 'Button 3', value: 'button3' }
                ]
            },{
                xtype: 'kijs.gui.Button',
                caption: 'scrollIntoView()',
                iconMap: 'kijs.iconMap.Fa.arrows-to-dot',
                on: {
                    click: function(e) {
                        const header = this._content.header;
                        const elName = header.down('elName').value;
                        const horizontalPosition = header.down('horizontalPosition').value;
                        const verticalPosition = header.down('verticalPosition').value;
                        const horizontalOffset = header.down('horizontalOffset').value;
                        const verticalOffset = header.down('verticalOffset').value;
                        const behavior = header.down('behavior').value;
                        const scrollParentsTo = header.down('scrollParentsTo').value;

                        const el = this._content.down(elName);

                        el.dom.scrollIntoView({
                            horizontalPosition: horizontalPosition,
                            verticalPosition: verticalPosition,
                            horizontalOffset: horizontalOffset,
                            verticalOffset: verticalOffset,
                            behavior: behavior,
                            scrollParentsTo: scrollParentsTo
                        });
                    },
                    context: this
                }
            },{
                xtype: 'kijs.gui.Separator'
            },{
                xtype: 'kijs.gui.field.Combo',
                name: 'verticalPosition',
                label: 'verticalPosition:',
                value: 'auto',
                width: 170,
                data: [
                    { caption: 'start', value: 'start' },
                    { caption: 'end', value: 'end' },
                    { caption: 'center', value: 'center' },
                    { caption: 'auto', value: 'auto' }
                ]
            },{
                xtype: 'kijs.gui.field.Number',
                name: 'verticalOffset',
                label: 'verticalOffset:',
                value: 0,
                width: 120
            },{
                xtype: 'kijs.gui.field.Combo',
                name: 'horizontalPosition',
                label: 'horizontalPosition:',
                value: 'auto',
                width: 170,
                data: [
                    { caption: 'start', value: 'start' },
                    { caption: 'end', value: 'end' },
                    { caption: 'center', value: 'center' },
                    { caption: 'auto', value: 'auto' }
                ]
            },{
                xtype: 'kijs.gui.field.Number',
                name: 'horizontalOffset',
                label: 'horizontalOffset:',
                value: 0,
                width: 120
            },{
                xtype: 'kijs.gui.field.Combo',
                name: 'behavior',
                label: 'behavior:',
                value: 'auto',
                width: 120,
                data: [
                    { caption: 'smooth', value: 'smooth' },
                    { caption: 'instant', value: 'instant' },
                    { caption: 'auto', value: 'auto' }
                ]
            },{
                xtype: 'kijs.gui.field.Switch',
                name: 'scrollParentsTo',
                label: 'scrollParentsTo:',
                value: false
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