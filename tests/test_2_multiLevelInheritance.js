/* global kijs */

// ---------------------------------
// Tests mit mehrstufiger Vererbung
// ---------------------------------
function test_2_multiLevelInheritance(target) {
    let tx = new kijs.Test();
    if (tx.hasTests()) {
        alert('Es wurden bereits Tests gemacht! Bitte laden sie die Seite neu.');
    }
    
    
    // --------------------------------------------------------------
    // kijs.Vehicle
    // --------------------------------------------------------------
    kijs.Vehicle = class kijs_Vehicle extends kijs.Observable {
        
        constructor(param1, param2) {
            super();
            this.vehicleProperty = 'vehicle property';
            this.vehicleConstructorParam1 = param1;
            this.vehicleConstructorParam2 = param2;
            this.vehicleObject = {value: 'vehicle object', param1: param1, param2: param2};
            
            this._protectedProperty = 'vehicle protected property';
            
            this.on('hupe', this._onHupe, this);
            
            tx.addResult('vehicle constructor: ' + param1 + ', ' + param2);
        }


        getVehicleType() {
            return 'Vehicle';
        }

        getProtectedProperty() {
            return this._protectedProperty;
        }
        
        hup() {
            this.raiseEvent('hupe');
        }
        
        hupe() {
            tx.addResult('Vehicle.hupe()');
        }
        
        setProtectedProperty(arg) {
            this._protectedProperty = arg;
        }
        
        vehicleFunction() {
            return this.vehicleProperty + ', ' + this.vehicleObject.value;
        }

        _onHupe(){
            tx.addResult('Vehicle._onHupe()');
        }
        
        
        destruct() {
            tx.addResult('vehicle destructor');
            super.destruct();
        }
    };



    // --------------------------------------------------------------
    // kijs.Car
    // --------------------------------------------------------------
    kijs.Car = class kijs_Car extends kijs.Vehicle {

        constructor(param1, param2) {
            super(param1, param2);
            
            this.carProperty = 'car property';
            this.carConstructorParam1 = param1;
            this.carConstructorParam2 = param2;
            this.carObject = {value: 'car object', param1: param1, param2: param2};
            
            this._protectedProperty = 'car protected property';
            
            tx.addResult('car constructor: ' + param1 + ', ' + param2);
        }
        
        getVehicleType() {
            return super.getVehicleType() + ' - Car';
        }

        carFunction() {
            return this.carProperty + ', ' + this.carObject.value;
        }
        

        destruct() {
            tx.addResult('car destructor');
            super.destruct();
        }
    };



    // --------------------------------------------------------------
    // kijs.Cabrio
    // --------------------------------------------------------------
    kijs.Cabrio = class kijs_Cabrio extends kijs.Car {


        constructor(param1, param2) {
            super(param1, param2);
            
            this.cabrioProperty = 'cabrio property';
            this.cabrioConstructorParam1 = param1;
            this.cabrioConstructorParam2 = param2;
            this.cabrioObject = {value: 'cabrio object', param1: param1, param2: param2};
            
            this._protectedProperty = 'cabrio protected property';
            
            tx.addResult('cabrio constructor: ' + param1 + ', ' + param2);
        }
        
        getVehicleType() {
            return super.getVehicleType() + ' - Cabrio';
        }

        cabrioFunction() {
            return this.cabrioProperty + ', ' + this.cabrioObject.value;
        }

        destruct() {
            tx.addResult('cabrio destructor');
            super.destruct();
        }
    };
    
    
    
    // --------------------------------------------------------------
    // kijs.Van
    // --------------------------------------------------------------
    kijs.Van = class kijs_Van extends kijs.Car {
        

        constructor(param1, param2) {
            super(param1, param2);
            
            this.vanProperty = 'van property';
            this.vanConstructorParam1 = param1;
            this.vanConstructorParam2 = param2;
            this.vanObject = {value: 'van object', param1: param1, param2: param2};
            
            this._protectedProperty = 'van protected property';
            
            tx.addResult('van constructor: ' + param1 + ', ' + param2);
        }
        
        getVehicleType() {
            return super.getVehicleType() + ' - Van';
        }
        
        hupe() {
            tx.addResult('Van.hupe()');
        }

        vanFunction() {
            return this.vanProperty + ', ' + this.vanObject.value;
        }

        destruct() {
            tx.addResult('van destructor');
            super.destruct();
        }
    };
    
    
    
    
    // --------------------------------------------------------------
    // kijs.SuperVan
    // --------------------------------------------------------------
    kijs.SuperVan = class kijs_SuperVan extends kijs.Van {

        constructor(param1, param2) {
            super(param1, param2);
            
            this.on('hupe', this._onSuperVanHupe, this);
            
            tx.addResult('superVan constructor: ' + param1 + ', ' + param2);
        }
        
        getVehicleType() {
            return super.getVehicleType() + ' - SuperVan';
        }
        
        _onSuperVanHupe(){
            tx.addResult('SuperVan._onSuperVanHupe()');
        }
        
        destruct() {
            tx.addResult('supervan destructor');
            super.destruct();
        }
    };
    
    
    
    


    // --------------------------------------------------------------
    // Testanweisungen
    // --------------------------------------------------------------
    tx.addTest('', '', 'Tests mit mehrstufiger Vererbung');
    tx.addTest('', '', ' ');

   
    // Tests mit vererbten Eigenschaften, Methoden
    // ---------------
    tx.addTest('', '', 'Tests mit vererbten Eigenschaften, Methoden');
    
    // kijs.Vehicle
    tx.addTest('vehicle constructor: vehicle 1, vehicle 2', 'constructor', 'kijs.Vehicle');
    try {
        let vehicle = new kijs.Vehicle('vehicle 1', 'vehicle 2');
    }
    catch(exception){ 
        tx.addResult('ERROR');
    }
    
    
    // kijs.Car
    tx.addTest(['vehicle constructor: car 1, car 2','car constructor: car 1, car 2'], 'constructor', 'kijs.Car');
    let car = new kijs.Car('car 1', 'car 2');

    tx.addTest('vehicle property', 'car.vehicleProperty');
    tx.addResult(car.vehicleProperty);
    
    tx.addTest('vehicle object', 'car.vehicleObject');
    tx.addResult(car.vehicleObject.value);
    
    tx.addTest('vehicle property, vehicle object', 'car.vehicleFunction()');
    tx.addResult(car.vehicleFunction());
    
    tx.addTest('car protected property', 'car.getProtectedProperty()');
    tx.addResult(car.getProtectedProperty());    
    
    
    tx.addTest('car property', 'car.carProperty');
    tx.addResult(car.carProperty);

    tx.addTest('car object', 'car.carObject');
    tx.addResult(car.carObject.value);
    
    tx.addTest('car property, car object', 'car.carFunction()');
    tx.addResult(car.carFunction());
    
    tx.addTest('Vehicle.hupe()', 'car.hupe()');
    car.hupe();
    
    
    // kijs.Cabrio
    tx.addTest(['vehicle constructor: cabrio 1, cabrio 2','car constructor: cabrio 1, cabrio 2','cabrio constructor: cabrio 1, cabrio 2'], 'constructor', 'kijs.Cabrio');
    let cabrio = new kijs.Cabrio('cabrio 1', 'cabrio 2');

    tx.addTest('vehicle property', 'cabrio.vehicleProperty');
    tx.addResult(cabrio.vehicleProperty);
    
    tx.addTest('vehicle object', 'cabrio.vehicleObject');
    tx.addResult(cabrio.vehicleObject.value);
    
    tx.addTest('vehicle property, vehicle object', 'cabrio.vehicleFunction()');
    tx.addResult(cabrio.vehicleFunction());
    
    tx.addTest('cabrio protected property', 'cabrio.getProtectedProperty()');
    tx.addResult(cabrio.getProtectedProperty());    

        
    tx.addTest('cabrio property', 'cabrio.cabrioProperty');
    tx.addResult(cabrio.cabrioProperty);

    tx.addTest('cabrio object', 'cabrio.cabrioObject');
    tx.addResult(cabrio.cabrioObject.value);
    
    tx.addTest('cabrio property, cabrio object', 'cabrio.cabrioFunction()');
    tx.addResult(cabrio.cabrioFunction());

    tx.addTest('Vehicle - Car - Cabrio', 'inheritance string');
    tx.addResult(cabrio.getVehicleType());
    
    tx.addTest('Vehicle.hupe()', 'cabrio.hupe()');
    cabrio.hupe();
    
    
    // kijs.Van
    tx.addTest(['vehicle constructor: van 1, van 2','car constructor: van 1, van 2','van constructor: van 1, van 2'], 'constructor', 'kijs.Van');
    let van = new kijs.Van('van 1', 'van 2');

    tx.addTest('vehicle property', 'van.vehicleProperty');
    tx.addResult(van.vehicleProperty);
    
    tx.addTest('vehicle object', 'van.vehicleObject');
    tx.addResult(van.vehicleObject.value);

    tx.addTest('vehicle property, vehicle object', 'van.vehicleFunction()');
    tx.addResult(van.vehicleFunction());
    
    tx.addTest('van protected property', 'van.getProtectedProperty()');
    tx.addResult(van.getProtectedProperty());

        
    tx.addTest('van property', 'van.vanProperty');
    tx.addResult(van.vanProperty);

    tx.addTest('van object', 'van.vanObject');
    tx.addResult(van.vanObject.value);
    
    tx.addTest('van property, van object', 'van.vanFunction()');
    tx.addResult(van.vanFunction());

    tx.addTest('Vehicle - Car - Van', 'inheritance string');
    tx.addResult(van.getVehicleType());
    
    tx.addTest('Van.hupe()', 'Van.hupe() überschreibt Vehicle.hupe()');
    van.hupe();

    
    
    
    // kijs.SuperVan
    tx.addTest(['vehicle constructor: superVan 1, superVan 2','car constructor: superVan 1, superVan 2','van constructor: superVan 1, superVan 2','superVan constructor: superVan 1, superVan 2'], 'constructor', 'kijs.SuperVan');
    let supervan = new kijs.SuperVan('superVan 1', 'superVan 2');

    tx.addTest('Vehicle - Car - Van - SuperVan', 'inheritance string');
    tx.addResult(supervan.getVehicleType());
    
    tx.addTest('Van.hupe()', 'SuperVan.hupe()');
    supervan.hupe();
    
    
    
    // kijs.Cabrio & kijs.Van
    tx.addTest('van protected property AKTUALISIERT', 'van.getProtectedProperty()', 'kijs.Cabrio & kijs.Van');
    van.setProtectedProperty('van protected property AKTUALISIERT');
    tx.addResult(van.getProtectedProperty());

    tx.addTest('car protected property', 'car.getProtectedProperty()');
    tx.addResult(car.getProtectedProperty());    

    tx.addTest('cabrio protected property', 'cabrio.getProtectedProperty()');
    tx.addResult(cabrio.getProtectedProperty());



    // Events
    tx.addTest('Vehicle._onHupe()', 'car.hup()', 'Events');
    car.hup();
    
    tx.addTest('Vehicle._onHupe()', 'car.raiseEvent(\'hupe\')');
    car.raiseEvent('hupe');
    
    tx.addTest('Vehicle._onHupe()', 'cabrio.raiseEvent(\'hupe\')');
    cabrio.raiseEvent('hupe');
    
    tx.addTest('Vehicle._onHupe()', 'van.raiseEvent(\'hupe\')');
    van.raiseEvent('hupe');
    
    
    tx.addTest('', 'van.raiseEvent(dachfenster)');
    van.raiseEvent('dachfenster');

    tx.addTest(['Vehicle._onHupe()','SuperVan._onSuperVanHupe()'], 'supervan.raiseEvent(\'hupe\')');
    supervan.raiseEvent('hupe');


    supervan.on('hupe', function(){tx.addResult('krasseste Hupe!');}, this);
     
    tx.addTest(['Vehicle._onHupe()','SuperVan._onSuperVanHupe()','krasseste Hupe!'], 'supervan.raiseEvent(\'hupe\')');
    supervan.raiseEvent('hupe');
    

    // Destructor
    tx.addTest(['car destructor','vehicle destructor'], 'car Destructor', 'Destructor');
    car.destruct();
    
    tx.addTest(['cabrio destructor','car destructor','vehicle destructor'], 'cabrio Destructor');
    cabrio.destruct();

    tx.addTest(['van destructor','car destructor','vehicle destructor'], 'van Destructor');
    van.destruct();

    tx.addTest(['supervan destructor','van destructor','car destructor','vehicle destructor'],'supervan Destructor');
    supervan.destruct();


    tx.displayTests(target);
}

