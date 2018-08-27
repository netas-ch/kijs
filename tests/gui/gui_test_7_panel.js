/* global kijs */

// ---------------------------------
// Tests mit kijs.gui.Panel
// ---------------------------------
function gui_test_7_panel() {
    let tx = new kijs.Test();
    if (tx.hasTests()) {
        alert('Es wurden bereits Tests gemacht! Bitte laden sie die Seite neu.');
        return;
    }

    let testCont = document.createElement('div');
    testCont.className = 'testContainer';
    testCont.innerHTML = '<a class="testContainerCloser" href="javascript:window.location.reload(true)">Reload</a>';
    document.body.appendChild(testCont);



    // --------------------------------------------------------------
    // Testanweisungen
    // --------------------------------------------------------------
    let pan = new kijs.gui.Panel({
        caption: 'Mein Panel',
        iconCls: 'icoWizard16',
        shadow: true,
        closable: true,
        collapsible: 'top',
        collapsed: false,
        maximizable: true,
        maximized: false,
        resizable: true,
        autoScroll: true,
        width: 500,
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
        
        headerBarElements: [
            {
                xtype: 'kijs.gui.Button',
                caption: 'Hide',
                iconCls: 'icoWizard16',
                toolTip: { html: '<p>Test</p>', followPointer: false },
                on: {
                    click: function() {
                        this.visible = false;
                    }
                }
            },{
                xtype: 'kijs.gui.Button',
                iconChar: '&#xf02f'
            },{
                xtype: 'kijs.gui.Button',
                iconChar: '&#xf164'
            }
        ],
        
        headerElements: [
            {
                xtype: 'kijs.gui.Button',
                iconCls: 'icoWizard16',
                caption: 'Toggle Text',
                on: {
                    click: function() {
                        if (this.caption === 'Text A') {
                            this.caption = 'Text B';
                        } else {
                            this.caption = 'Text A';
                        }
                    }
                }
            },{
                xtype: 'kijs.gui.Button',
                caption: 'add WaitMask',
                on: {
                    click: function() {
                        this.upX('kijs.gui.Panel').downX('kijs.gui.Container').waitMaskAdd();
                    }
                }
            },{
                xtype: 'kijs.gui.Button',
                caption: 'remove WaitMask',
                on: {
                    click: function() {
                        this.upX('kijs.gui.Panel').downX('kijs.gui.Container').waitMaskRemove();
                    }
                }
            }
        ],
        
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
                height: null,
                width: 200,
                displayWaitMask: true,
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
        ],
        
        footerCaption: 'Meine FooterBar',
        footerStyle: { padding: '10px' },
        footerElements: [
            {
                xtype: 'kijs.gui.Button',
                caption: 'OK',
                iconChar: '&#xf00c',
                isDefault: true,
                on: {
                    click: function(e) {
                        console.log('OK click');
                        this.upX('kijs.gui.Panel').close();
                    }
                }
            },{
                xtype: 'kijs.gui.Button',
                caption: 'Abbrechen',
                iconChar: '&#xf00d',
                on: {
                    click: function(e) {
                        console.log('Abbrechen click');
                        e.element.upX('kijs.gui.Panel').close();
                    }
                }
            }
        ],
        
        footerBarElements: [
            {
                xtype: 'kijs.gui.Button',
                caption: 'Hide',
                iconCls: 'icoWizard16',
                toolTip: { html: '<p>Test</p>', followPointer: false },
                on: {
                    click: function() {
                        this.visible = false;
                    }
                }
            },{
                xtype: 'kijs.gui.Button',
                iconChar: '&#xf02f'
            },{
                xtype: 'kijs.gui.Button',
                iconChar: '&#xf164'
            }
        ]
    });
    pan.renderTo(testCont);


}

