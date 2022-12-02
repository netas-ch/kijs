/* global kijs */

// ---------------------------------
// Tests mit Klasse vom Typ singleton
// ---------------------------------
function test_03_singleton() {
    let tx = new kijs.Test();
    if (tx.hasTests()) {
        alert('Es wurden bereits Tests gemacht! Bitte laden sie die Seite neu.');
    }


    // --------------------------------------------------------------
    // kijs.Singleton
    // --------------------------------------------------------------
    kijs.Singleton = class kijs_Singleton {


        // --------------------------------------------------------------
        // CONSTRUCTOR
        // --------------------------------------------------------------
        constructor() {
            // Singleton (es wird immer die gleiche Instanz zurückgegeben)
            if (!kijs_Singleton._singletonInstance) {
                kijs_Singleton._singletonInstance = this;
                
                // Variablen
                this._value = null;
                tx.addResult('Singleton constructor');
            }
            return kijs_Singleton._singletonInstance;
        }


        // --------------------------------------------------------------
        // GETTERS / SETTERS
        // --------------------------------------------------------------
        get value() { return this._value; }
        set value(val) { this._value = val; }

    
        // --------------------------------------------------------------
        // DESTRUCTOR
        // --------------------------------------------------------------
        destruct() {
            tx.addResult('Singleton destructor');
        }

    };



    // --------------------------------------------------------------
    // Testanweisungen
    // --------------------------------------------------------------
    tx.addTest('', '', 'TESTS mit Klasse vom Typ singleton');
    
    
    // kijs.Singleton Instance
    tx.addTest('Singleton constructor', 'constructor', 'kijs.Singleton Instance');
    let single1 = new kijs.Singleton();
    single1.value = 1;

    
    tx.addTest(1, 'constructor');
    let single2 = new kijs.Singleton();
    tx.addResult(single2.value);
    
    
    tx.addTest(2, 'constructor');
    let single3 = new kijs.Singleton();
    single2.value = 2;
    tx.addResult(single3.value);

    tx.addTest(true, 'gleiche Instanz');
    tx.addResult(single1 === single2 && single2 === single3);

    tx.displayTests();
}

