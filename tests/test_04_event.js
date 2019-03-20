/* global kijs */

// ---------------------------------
// Tests mit Events
// ---------------------------------
function test_04_event() {
    let tx = new kijs.Test();
    if (tx.hasTests()) {
        alert('Es wurden bereits Tests gemacht! Bitte laden sie die Seite neu.');
    }



    // --------------------------------------------------------------
    // kijs.Vehicle
    // --------------------------------------------------------------
    kijs.Vehicle = class kijs_Vehicle extends kijs.Observable {


        // --------------------------------------------------------------
        // CONSTRUCTOR
        // --------------------------------------------------------------
        constructor() {
            super();
            
            this._color = '';

            this.on('hupe', function(arg1, arg2){
                tx.addResult('hup 1! ' + this._color + ' ' + arg1 + ' ' + arg2);
            }, this);
            
            this.on('hupe', function(arg1, arg2){
                tx.addResult('hup 2! ' + this._color + ' ' + arg1 + ' ' + arg2);
            }, this);
            
            this.on('hupe', this._onHupe, this);
            // mehrfache Listener auf gleiche Funktion sollten nur einmal ausgeführt werden
            this.on('hupe', this._onHupe, this);
            
            this.once('hupe', function(arg1, arg2){
                tx.addResult('hup once 1! ' + this._color + ' ' + arg1 + ' ' + arg2);
            }, this);
            
            this.once('hupe', function(arg1, arg2){
                tx.addResult('hup once 2! ' + this._color + ' ' + arg1 + ' ' + arg2);
            }, this);
        }

        
        // --------------------------------------------------------------
        // GETTERS / SETTERS
        // --------------------------------------------------------------
        get color() { return this._color; }
        set color(color) { this._color = color; }

        
        // --------------------------------------------------------------
        // MEMBERS
        // --------------------------------------------------------------
        hupe(a, b) {
            this.raiseEvent('hupe', a, b);
        }
        
        _onHupe(arg1, arg2) {
            tx.addResult('hup function! ' + this._color + ' ' + arg1 + ' ' + arg2);
        }
        
        

        // --------------------------------------------------------------
        // DESTRUCTOR
        // --------------------------------------------------------------
        destruct() {
            tx.addResult('Vehicle destructor');
            tx.addResult(Object.keys(this._events).length);
            super.destruct();
            tx.addResult(Object.keys(this._events).length);
        }

    };





    // --------------------------------------------------------------
    // Testanweisungen
    // --------------------------------------------------------------
    // kijs.Vehicle Instance
    let vehicle = new kijs.Vehicle('vehicle');
    vehicle.color = 'red';
    
    let vehicle2 = new kijs.Vehicle('vehicle2');
    vehicle2.color = 'blue';
    
    tx.addTest(['hup 1! red a1 a2','hup 2! red a1 a2','hup function! red a1 a2','hup once 1! red a1 a2','hup once 2! red a1 a2'], 'Event Test');
    vehicle.hupe('a1', 'a2');

    tx.addTest(['hup 1! red b1 b2','hup 2! red b1 b2','hup function! red b1 b2'], 'Event Test');
    vehicle.hupe('b1', 'b2');
    
    tx.addTest(['hup 1! blue a1 a2','hup 2! blue a1 a2','hup function! blue a1 a2','hup once 1! blue a1 a2','hup once 2! blue a1 a2'], 'Event Test');
    vehicle2.hupe('a1', 'a2');

    tx.addTest(['hup 1! blue b1 b2','hup 2! blue b1 b2','hup function! blue b1 b2'], 'Event Test');
    vehicle2.hupe('b1', 'b2');
    
    
    // Destructor
    tx.addTest(['Vehicle destructor',1,0], 'Vehicle2 Destructor', 'Destructor');
    vehicle2.destruct();
    
    tx.addTest(['Vehicle destructor',1,0], 'Vehicle Destructor');
    vehicle.destruct();
    
    
    tx.displayTests();
}

