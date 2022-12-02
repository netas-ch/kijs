/* global kijs */

// ---------------------------------
// Tests mit kijs.gui.Element
// ---------------------------------
function gui_test_01_element() {
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
    let el = new kijs.gui.Element({
        html: 'Bitte "Enter" drücken, draufklicken oder Maus über mich bewegen',
        style: { backgroundColor:'#ddd'},
        tooltip: { html: '<p>Test</p>', followPointer: false },
        on: {
            click: function(e) {
                e.element.tooltip.disabled = !this.tooltip.disabled;
                el.html = 'tooltip ' + (e.element.tooltip.disabled ? 'disable' : 'enable');
            },
            enterPress: function(e) {
                if (kijs.isNumeric(el.html)) {
                    el.html += 1;
                } else {
                    el.html = 1;
                }
            },
            escPress: function(e) {
                if (kijs.isNumeric(el.html)) {
                    el.html -= 1;
                } else {
                    el.html = 99;
                }
            },
            keyDown: function(e) {
                console.log(e.nodeEvent.keyCode);
            }
        }
    });
    el.renderTo(testCont);
    
    el.style.padding = '10px';
    el.style.border = '1px solid #333';
    el.dom.node.tabIndex = 1;
    el.render();
    el.focus();
}