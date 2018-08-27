/* global kijs */

// ---------------------------------
// Tests mit Klassen
// ---------------------------------
function test_1_class(target) {
    let tx = new kijs.Test();
    if (tx.hasTests()) {
        alert('Es wurden bereits Tests gemacht! Bitte laden sie die Seite neu.');
    }

    
    // --------------------------------------------------------------
    // kijs.Vehicle
    // --------------------------------------------------------------
    kijs.Vehicle = class kijs_Vehicle {


        // --------------------------------------------------------------
        // CONSTRUCTOR
        // --------------------------------------------------------------
        constructor(color, speed) {
            this.color = color;
            this._speed = speed;
            this.gear = {};
            tx.addResult('Vehicle constructor: ' + color + ', ' + speed);
        }

        
        // --------------------------------------------------------------
        // STATIC GETTERS / SETTERS
        // --------------------------------------------------------------
        static get basisType() { return 'Vehicle'; }
        static get machineType() { return 'Vehicle'; }
        
        
        // --------------------------------------------------------------
        // STATICS
        // --------------------------------------------------------------
        static getStaticMachineType() {
            return this.machineType;
        }
        

        // --------------------------------------------------------------
        // MEMBERS
        // --------------------------------------------------------------
        // PUBLIC
        getBasisType() {
            return this.basisType;
        }
        
        getMachineType() {
            return this.machineType;
        }
        
        faster(step) {
            this._speed += (step || 1);
            return this._speed;
        }
        
        slower(step) {
            this._speed -= (step || 1);
            return this._speed;
        }
        
        setSpeed(speed) {
            this._speed = speed;
        }
        
        
        // PROTECTED
        _method(arg) {

        }
        
        
        // PRIVATE
        __method(arg) {

        }

            
        // --------------------------------------------------------------
        // DESTRUCTOR
        // --------------------------------------------------------------
        destruct() {
            tx.addResult('Vehicle destructor');
        }

    };



    // --------------------------------------------------------------
    // kijs.Car
    // --------------------------------------------------------------
    kijs.Car = class kijs_Car extends kijs.Vehicle {


        // --------------------------------------------------------------
        // CONSTRUCTOR
        // --------------------------------------------------------------
        constructor(color, speed, cabriolet) {
            super(color, speed);
            this._cabriolet = cabriolet;
            tx.addResult('Car constructor: ' + color + ', ' + speed + ', ' + cabriolet);
        }


        // --------------------------------------------------------------
        // STATIC GETTERS / SETTERS
        // --------------------------------------------------------------
        static get basisType() { return 'Car'; }    // overwrite
        static get machineType2() { return 'Car'; }

        
        // --------------------------------------------------------------
        // STATICS
        // --------------------------------------------------------------
        static getStaticMachineType2() {
            return this.machineType2;
        }


        // --------------------------------------------------------------
        // MEMBERS
        // --------------------------------------------------------------
        // PUBLIC
        faster(step) {
            step = step || 10;

            let val = this._speed;
            val = super.faster(step);

            return val;
        }


        // --------------------------------------------------------------
        // DESTRUCTOR
        // --------------------------------------------------------------
        destruct() {
            tx.addResult('Car destructor');
            super.destruct();
        }

    };




    // --------------------------------------------------------------
    // Testanweisungen
    // --------------------------------------------------------------
    tx.addTest('', '', 'TESTS mit Klassen vom Typ regular');

    // kijs.Vehicle Static
    tx.addTest('Vehicle', 'static getter basisType', 'kijs.Vehicle Static');
    tx.addResult(kijs.Vehicle.basisType);
    
    tx.addTest('Vehicle', 'static getter machineType');
    tx.addResult(kijs.Vehicle.machineType);
    tx.addTest('Vehicle', 'static function getMachineType()');
    tx.addResult(kijs.Vehicle.getStaticMachineType());


    // kijs.Vehicle Instance
    tx.addTest('Vehicle constructor: red, 10', 'constructor', 'kijs.Vehicle Instance');
    let vehicle = new kijs.Vehicle('red', 10);

    tx.addTest('red', 'property color');
    tx.addResult(vehicle.color);

    tx.addTest(11, 'function faster()');
    tx.addResult(vehicle.faster());

    tx.addTest(16, 'function faster(5)');
    tx.addResult(vehicle.faster(5));

    tx.addTest(5, 'function slower(11)');
    tx.addResult(vehicle.slower(11));
    

    // kijs.Vehicle Instance mit Zugriff auf Static getters
    tx.addTest(undefined, 'static function getBasisType()', 'kijs.Vehicle Instance mit Zugriff auf Static getters');
    tx.addResult(vehicle.getBasisType());
    
    
    // kijs.Car Static
    tx.addTest('Vehicle', 'static getter machineType', 'kijs.Car Static');
    tx.addResult(kijs.Car.machineType);

    tx.addTest('Car', 'static function getMachineType2()');
    tx.addResult(kijs.Car.getStaticMachineType2());
    

    tx.addTest('Car', 'Don\'t Update static getter machineType');
    try {
        kijs.Car.machineType = 'Car modified';
    }
    catch(exception) {
        
    }
    tx.addResult(kijs.Car.getStaticMachineType2());

    tx.addTest(undefined, 'Statics werden nicht vererbt');
    tx.addResult(vehicle.basisType);

    
    // kijs.Car Instance
    tx.addTest(['Vehicle constructor: yellow, 10','Car constructor: yellow, 10, true'], 'constructor', 'kijs.Car Instance');
    let car = new kijs.Car('yellow', 10, true);


    // kijs.Car Members
    tx.addTest('yellow', 'property color', 'kijs.Car Members');
    tx.addResult(car.color);


    // kijs.Car Members mit Basisklassenaufruf
    tx.addTest(20, 'function faster()', 'kijs.Car Members mit Basisklassenaufruf');
    tx.addResult(car.faster());

    tx.addTest(25, 'function faster(5)');
    tx.addResult(car.faster(5));

    tx.addTest(5, 'function slower(11)');
    tx.addResult(car.slower(20));


    // kijs.Vehicle Static (zum 2.) --> Sicherstellen, das die Static-Werte in der Basisklasse nicht verändert wurden
    tx.addTest('Vehicle', 'static getter machineType', 'kijs.Vehicle Static (zum 2.)');
    tx.addResult(kijs.Vehicle.machineType);

    tx.addTest('Vehicle', 'static function getMachineType()');
    tx.addResult(kijs.Vehicle.getStaticMachineType());

    tx.addTest('Car', 'static function getMachineType2()');
    tx.addResult(kijs.Car.getStaticMachineType2());

    tx.addTest('Car', 'Dont\'t Update static getter machineType');
    try {
        kijs.Car.machineType = 'Car Modified';
    }
    catch(exception) {
        
    }
    tx.addResult(kijs.Car.getStaticMachineType2());


    // mehrere Instanzen
    tx.addTest(['Vehicle constructor: red, 11', 'Car constructor: red, 11, false'], 'constructor', 'mehrere Instanzen');
    let car2 = new kijs.Car('red', 11, false);

    tx.addTest('yellow', 'property color');
    tx.addResult(car.color);
    
    tx.addTest('red', 'property color');
    tx.addResult(car2.color);
    
    car.gear.size = 10;
    car2.gear.size = 11;
    
    tx.addTest(10, 'mehrere Instanzen');
    tx.addResult(car.gear.size);
    
    tx.addTest(11, 'mehrere Instanzen');
    tx.addResult(car2.gear.size);
    
    
    // Destructor
    tx.addTest(['Car destructor','Vehicle destructor'], 'car2 Destructor', 'Destructor');
    car2.destruct();
    
    tx.addTest(['Car destructor','Vehicle destructor'], 'car Destructor');
    car.destruct();

    tx.addTest('Vehicle destructor', 'vehicle Destructor');
    vehicle.destruct();

    
    // Vererbung static
//    tx.addTest(undefined, 'Static', 'Vererbung Static (darf nicht funktionieren)', 'Vererbung Static');
//    tx.addResult(car.self.basisType);
    
    
    // Array- und Object-Propertys, dürfen erst im Konstruktor also solche deklariert werden
    tx.addTest('ERROR', 'Falsche Klassendefinition', 'Array- und Object-Propertys, dürfen erst im Konstruktor also solche deklariert werden');
    try {
        kijs.Class.define('kijs.Oops', {
            type: 'regular',
            members: {
                _array : [],
                _object: {}
            }
        });
    }
    catch(exception){ 
        tx.addResult('ERROR');
    }

    tx.displayTests(target);
}

