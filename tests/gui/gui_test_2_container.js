/* global kijs */

// ---------------------------------
// Tests mit kijs.gui.Container
// ---------------------------------
function gui_test_2_container() {
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
    // Container mit html, ToolTip und Events
    let cont = new kijs.gui.Container({
        html: 'Bitte "Enter" drücken, draufklicken oder Maus über mich bewegen',
        style: { backgroundColor:'#ddd'},
        innerStyle: { backgroundColor: '#afa' },
        toolTip: { html: '<p>Test</p>', followPointer: false },
        on: {
            click: function(e) {
                e.element.toolTip.disabled = !this.toolTip.disabled;
                cont.html = 'toolTip ' + (e.element.toolTip.disabled ? 'disable' : 'enable');
            },
            enterPress: function(e) {
                if (kijs.isNumeric(cont.html)) {
                    cont.html += 1;
                } else {
                    cont.html = 1;
                }
            },
            escPress: function(e) {
                if (kijs.isNumeric(cont.html)) {
                    cont.html -= 1;
                } else {
                    cont.html = 99;
                }
            },
            keyDown: function(e) {
                console.log(e.nodeEvent.keyCode);
            }
        }
    });
    cont.renderTo(testCont);

    cont.style.padding = '10px';
    cont.style.border = '1px solid #333';
    cont.dom.node.tabIndex = 1;
    cont.render();
    cont.focus();


    // Container mit elements
    let cont2 = new kijs.gui.Container({
        style: { border: '2px solid #999', marginTop: '10px' },
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
                name: 'Mein Container',
                height: null,
                width: 200,
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
                        name: 'Mein Element',
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
        ]
    });
    cont2.renderTo(testCont);


    cont2.down('Mein Element').upX('kijs.gui.Container').downX('kijs.gui.Element').next.next.previous.html = 'Gugus';
}

