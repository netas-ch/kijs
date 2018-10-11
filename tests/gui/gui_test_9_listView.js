/* global kijs */

// ---------------------------------
// Tests mit kijs.gui.ListView
// ---------------------------------
function gui_test_9_listView() {
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
    let el = new kijs.gui.ListView({
        valueField: 'id',
        captionField: 'Bezeichnung',
        iconCharField: 'Icon',
        iconColorField: 'Color',
        toolTipField: 'Color',
        showCheckBoxes: false,
        selectType: 'single',
        width: 200,
        height: 200,
        data: [
            {id:1, Bezeichnung:'blau', Icon:'&#xf111', Color:'#0088ff' }, 
            {id:2, Bezeichnung:'grün', Icon:'&#xf111', Color:'#88ff00' }, 
            {id:3, Bezeichnung:'pink', Icon:'&#xf111', Color:'#ff0088' },
            {id:4, Bezeichnung:'türkis', Icon:'&#xf111', Color:'#00ff88' }, 
            {id:5, Bezeichnung:'orange', Icon:'&#xf111', Color:'#ff8800' }, 
            {id:6, Bezeichnung:'viollet', Icon:'&#xf111', Color:'#8800ff' },
            {id:7, Bezeichnung:'dunkelgrau', Icon:'&#xf111', Color:'#666666' }, 
            {id:8, Bezeichnung:'grau', Icon:'&#xf111', Color:'#999999' }, 
            {id:9, Bezeichnung:'hellgrau', Icon:'&#xf111', Color:'#bbbbbb' }, 
            {id:10, Bezeichnung:'weiss', Icon:'&#xf111', Color:'#ffffff' }, 
            {id:11, Bezeichnung:'schwarz', Icon:'&#xf111', Color:'#000000' }
        ],
        value: 5,
        on: {
            selectionChange: function(e) {
                console.log(this.value);
            }
        }
    });
    el.renderTo(testCont);
    
    let el2 = new kijs.gui.ListView({
        valueField: 'id',
        captionField: 'Bezeichnung',
        iconCharField: 'Icon',
        iconColorField: 'Color',
        toolTipField: 'Color',
        showCheckBoxes: true,
        selectType: 'single',
        width: 200,
        height: 200,
        data: [
            {id:1, Bezeichnung:'blau', Icon:'&#xf111', Color:'#0088ff' }, 
            {id:2, Bezeichnung:'grün', Icon:'&#xf111', Color:'#88ff00' }, 
            {id:3, Bezeichnung:'pink', Icon:'&#xf111', Color:'#ff0088' },
            {id:4, Bezeichnung:'türkis', Icon:'&#xf111', Color:'#00ff88' }, 
            {id:5, Bezeichnung:'orange', Icon:'&#xf111', Color:'#ff8800' }, 
            {id:6, Bezeichnung:'viollet', Icon:'&#xf111', Color:'#8800ff' },
            {id:7, Bezeichnung:'dunkelgrau', Icon:'&#xf111', Color:'#666666' }, 
            {id:8, Bezeichnung:'grau', Icon:'&#xf111', Color:'#999999' }, 
            {id:9, Bezeichnung:'hellgrau', Icon:'&#xf111', Color:'#bbbbbb' }, 
            {id:10, Bezeichnung:'weiss', Icon:'&#xf111', Color:'#ffffff' }, 
            {id:11, Bezeichnung:'schwarz', Icon:'&#xf111', Color:'#000000' }
        ],
        value: 5,
        on: {
            selectionChange: function(e) {
                console.log(this.value);
            }
        }
    });
    el2.renderTo(testCont);
    
    let el3 = new kijs.gui.ListView({
        valueField: 'id',
        captionField: 'Bezeichnung',
        iconCharField: 'Icon',
        iconColorField: 'Color',
        toolTipField: 'Color',
        showCheckBoxes: true,
        selectType: 'simple',
        width: 200,
        height: 200,
        data: [
            {id:1, Bezeichnung:'blau', Icon:'&#xf111', Color:'#0088ff' }, 
            {id:2, Bezeichnung:'grün', Icon:'&#xf111', Color:'#88ff00' }, 
            {id:3, Bezeichnung:'pink', Icon:'&#xf111', Color:'#ff0088' },
            {id:4, Bezeichnung:'türkis', Icon:'&#xf111', Color:'#00ff88' }, 
            {id:5, Bezeichnung:'orange', Icon:'&#xf111', Color:'#ff8800' }, 
            {id:6, Bezeichnung:'viollet', Icon:'&#xf111', Color:'#8800ff' },
            {id:7, Bezeichnung:'dunkelgrau', Icon:'&#xf111', Color:'#666666' }, 
            {id:8, Bezeichnung:'grau', Icon:'&#xf111', Color:'#999999' }, 
            {id:9, Bezeichnung:'hellgrau', Icon:'&#xf111', Color:'#bbbbbb' }, 
            {id:10, Bezeichnung:'weiss', Icon:'&#xf111', Color:'#ffffff' }, 
            {id:11, Bezeichnung:'schwarz', Icon:'&#xf111', Color:'#000000' }
        ],
        value: [2,3],
        on: {
            selectionChange: function(e) {
                console.log(this.value);
            }
        }
    });
    el3.renderTo(testCont);


}

