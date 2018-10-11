/* global kijs */

// ---------------------------------
// Tests mit kijs.gui.Icon
// ---------------------------------
function gui_test_3_icon() {
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
    // Icon mit Bild
    let icon = new kijs.gui.Icon({
        iconCls: 'icoWizard16',
        style: { marginRight: '4px'}
    });
    icon.renderTo(testCont);
    
    // Icon mit Font-Icon
    icon = new kijs.gui.Icon({
        iconChar: '&#xf02f',
        style: { marginRight: '4px'}
    });
    icon.renderTo(testCont);
    
    // Gemischt Bild und Font-Icon
    icon = new kijs.gui.Icon({
        iconCls: 'icoWizard16',
        iconChar: 'x',
        style: { marginRight: '4px'}
    });
    icon.renderTo(testCont);
    
    // Font-Icon rotieren
    icon = new kijs.gui.Icon({
        iconChar: '&#xf01a;',
        cls: 'kijs-spin',
        style: { marginRight: '4px'}
    });
    icon.renderTo(testCont);

}

