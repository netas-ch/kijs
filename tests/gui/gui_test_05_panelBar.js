/* global kijs */

// ---------------------------------
// Tests mit kijs.gui.PanelBar
// ---------------------------------
function gui_test_05_panelBar() {
    let tx = new kijs.Test();
    if (tx.hasTests()) {
        alert('Es wurden bereits Tests gemacht! Bitte laden sie die Seite neu.');
        return;
    }

    let testCont = document.createElement('div');
    testCont.className = 'testContainer kijs';
    testCont.innerHTML = '<a class="testContainerCloser" href="javascript:window.location.reload(true)">Reload</a>';
    document.body.appendChild(testCont);


    // --------------------------------------------------------------
    // Testanweisungen
    // --------------------------------------------------------------
    let cont = new kijs.gui.PanelBar({
        html: 'Meine PanelBar',
        style: {
            marginBottom: '10px'
        },
        iconCls: 'icoWizard16',
        elementsLeft: [
            {
                xtype: 'kijs.gui.Button',
                iconChar: '&#xf02f',
                badgeText: '5'
            },{
                xtype: 'kijs.gui.Button',
                iconChar: '&#xf164',
                badgeText: '6'
            },{
                xtype: 'kijs.gui.Button',
                caption: 'Hide',
                iconCls: 'icoWizard16',
                toolTip: { html: '<p>Test</p>', followPointer: false },
                on: {
                    click: function() {
                        this.visible = false;
                    }
                }
            }
        ],
        elementsRight: [
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
                iconChar: '&#xf02f',
                badgeText: '5'
            },{
                xtype: 'kijs.gui.Button',
                iconChar: '&#xf164',
                badgeText: '6'
            }
        ]
    });
    cont.renderTo(testCont);
    
    
    let cont2 = new kijs.gui.PanelBar({
        html: 'Meine HeaderBar',
        cls: 'kijs-headerbar',
        style: {
            marginBottom: '10px'
        },
        iconCls: 'icoWizard16',
        elementsRight: [
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
                iconChar: '&#xf02f',
                badgeText: '5'
            },{
                xtype: 'kijs.gui.Button',
                iconChar: '&#xf164',
                badgeText: '6'
            }
        ]
    });
    cont2.renderTo(testCont);
    
    
    let cont3 = new kijs.gui.PanelBar({
        html: 'Meine HeaderBar Zentriert',
        cls: 'kijs-headerbar-center',
        style: {
            marginBottom: '10px'
        },
        elementsLeft: [
            {
                xtype: 'kijs.gui.Button',
                iconChar: '&#xf137'
            }
        ],
        elementsRight: [
            {
                xtype: 'kijs.gui.Button',
                iconChar: '&#xf138'
            }
        ]
    });
    cont3.renderTo(testCont);
    
    
    let cont4 = new kijs.gui.PanelBar({
        html: 'Meine FooterBar',
        cls: 'kijs-footerbar',
        style: {
            marginBottom: '10px'
        },
        iconCls: 'icoWizard16',
        elementsLeft: [
            {
                xtype: 'kijs.gui.Button',
                iconChar: '&#xf02f',
                badgeText: '5'
            },{
                xtype: 'kijs.gui.Button',
                iconChar: '&#xf164',
                badgeText: '6'
            },{
                xtype: 'kijs.gui.Button',
                caption: 'Hide',
                iconCls: 'icoWizard16',
                toolTip: { html: '<p>Test</p>', followPointer: false },
                on: {
                    click: function() {
                        this.visible = false;
                    }
                }
            }
        ]
    });
    cont4.renderTo(testCont);


}

