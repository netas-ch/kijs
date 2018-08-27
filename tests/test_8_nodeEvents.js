/* global kijs */

// ---------------------------------
// Tests mit Node-Events
// ---------------------------------
function test_8_nodeEvents(target) {
    let tx = new kijs.Test();
    if (tx.hasTests()) {
        alert('Es wurden bereits Tests gemacht! Bitte laden sie die Seite neu.');
    }

    // --------------------------------------------------------------
    // Testanweisungen
    // --------------------------------------------------------------
    
    
    kijs.Vehicle = class kijs_Vehicle extends kijs.Observable {
        constructor() {
            super();
            
            // Test-Nodes
            this._parentNode = document.createElement('div');
            this._parentNode.name = 'parent';
            
            this._node = document.createElement('p');
            this._node.name = 'node';
            this._parentNode.appendChild(this._node);
            
            // Eigener Event
            this._myEvent = new CustomEvent('myEvent', {
                bubbles: true,
                cancelable: true
            });
        }

        get node() { return this._node; }
        
        test1() {
            // Listener auf node erstellen
            kijs.Dom.addEventListener('myEvent', this._node, this._onEvent, this, false);
            
            // Bubbeling Listener auf Parent erstellen
            kijs.Dom.addEventListener('myEvent', this._parentNode, this._onEvent, this, false);
            
            // Capturing Listener auf Parent erstellen
            kijs.Dom.addEventListener('myEvent', this._parentNode, this._onEvent, this, true);
            
            // Event auslösen
            this._node.dispatchEvent(this._myEvent);
        }
        
        test2() {
            // Gleicher Listener auf node nochmal erstellen (sollte keine Auswirkung haben)
            kijs.Dom.addEventListener('myEvent', this._node, this._onEvent, this, false);
            
            // Capturing Listener auf parent entfernen
            kijs.Dom.removeEventListener('myEvent', this._parentNode, this, true);
            
            // kijs-Event auf node erstellen (sollte keine Auswirkung haben, weil bereits ein Listener auf diesen context existiert)
            kijs.Dom.addEventListener('myEvent', this._node, 'myKijsEvent', this, false);
            
            this.on('myKijsEvent', this._onKijsEvent);
            
            // Event auslösen
            this._node.dispatchEvent(this._myEvent);
        }
        
        test3() {
            // Alle Listeners entfernen
            kijs.Dom.removeAllEventListenersFromContext(this);
            
            // kijs Event erstellen
            kijs.Dom.addEventListener('myEvent', this._node, 'myKijsEvent', this, false);
            
            // Event auslösen
            this._node.dispatchEvent(this._myEvent);
        }
        
        _onEvent(e) {
            let phase = '';
            
            switch (e.nodeEvent.eventPhase) {
                case 1: phase = 'capturing'; break;
                case 2: phase = 'target'; break;
                case 3: phase = 'bubbeling'; break;
            }
            
            let str = '';
            str += 'currentTarget: ' + e.nodeEvent.currentTarget.name + ', ';
            str += 'type: ' + e.nodeEvent.type + ', ';
            str += 'phase: ' + phase;
            
            tx.addResult(str);
        }
        
        _onKijsEvent(e) {
            let phase = '';
            
            switch (e.nodeEvent.eventPhase) {
                case 1: phase = 'capturing'; break;
                case 2: phase = 'target'; break;
                case 3: phase = 'bubbeling'; break;
            }
            
            let str = '';
            str += 'kijsEventName: ' + e.eventName + ', ';
            str += 'currentTarget: ' + e.nodeEvent.currentTarget.name + ', ';
            str += 'type: ' + e.nodeEvent.type + ', ';
            str += 'phase: ' + phase;
            
            tx.addResult(str);
        }
    };
    
    let vehicle = new kijs.Vehicle();
    
    tx.addTest(['currentTarget: parent, type: myEvent, phase: capturing', 'currentTarget: node, type: myEvent, phase: target', 'currentTarget: parent, type: myEvent, phase: bubbeling'], '1 Listener auf node und 2 auf parent', 'Node-Events');
    vehicle.test1();
    
    
    tx.addTest(['currentTarget: node, type: myEvent, phase: target', 'currentTarget: parent, type: myEvent, phase: bubbeling'], 'Listener wiederholt setzen und Listener löschen');
    vehicle.test2();
    
    tx.addTest('kijsEventName: myKijsEvent, currentTarget: node, type: myEvent, phase: target', 'Alle Listeners löschen und kijs-Event testen');
    vehicle.test3();
    
    tx.displayTests(target);
}
