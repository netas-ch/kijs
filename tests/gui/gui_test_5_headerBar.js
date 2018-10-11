/* global kijs */

// ---------------------------------
// Tests mit kijs.gui.HeaderBar
// ---------------------------------
function gui_test_5_headerBar() {
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
    let cont = new kijs.gui.HeaderBar({
        caption: 'Meine HeaderBar',
        iconCls: 'icoWizard16',
        elements: [
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


}

