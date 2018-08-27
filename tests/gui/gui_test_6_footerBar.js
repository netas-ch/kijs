/* global kijs */

// ---------------------------------
// Tests mit kijs.gui.FooterBar
// ---------------------------------
function gui_test_6_footerBar() {
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
    let cont = new kijs.gui.FooterBar({
        caption: 'Meine FooterBar',
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
                iconChar: '&#xf02f'
            },{
                xtype: 'kijs.gui.Button',
                iconChar: '&#xf164'
            }
        ]
    });
    cont.renderTo(testCont);


}

