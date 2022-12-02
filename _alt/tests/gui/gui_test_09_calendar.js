/* global kijs */

// ---------------------------------
// Tests mit kijs.gui.DatePicker und kijs.gui.TimePicker
// ---------------------------------
function gui_test_09_calendar() {
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
    let el = new kijs.gui.DatePicker({
        //todayText: 'Heute',
        //value: "2019-02-14"
    });
    el.renderTo(testCont);
    
    let el2 = new kijs.gui.DatePicker({
        rangeFrom: new Date(2019, 0, 1),
        rangeTo: new Date(2019, 0, 10)
        //todayText: 'Heute',
        //value: "2019-02-14"
    });
    el2.renderTo(testCont);
    
    let el3 = new kijs.gui.TimePicker({
        //todayText: 'Heute',
        //value: "2019-02-14"

    });
    el3.renderTo(testCont);


}

