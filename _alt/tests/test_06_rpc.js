/* global kijs */

// ---------------------------------
// Tests mit RPC
// ---------------------------------
function test_06_rpc() {
    let tx = new kijs.Test();
    if (tx.hasTests()) {
        alert('Es wurden bereits Tests gemacht! Bitte laden sie die Seite neu.');
    }

    
    // --------------------------------------------------------------
    // Testanweisungen
    // --------------------------------------------------------------
    tx.addTest('', '', 'TESTS mit RPC');

    // RPC request mit callbackFn
    let rpc = new kijs.Rpc({ url: 'tests/rpcTest/rpc.php' });
    rpc.do({
        remoteFn: 'myFacade.myFunction',
        requestData: 'test',
        fn: function(ajaxData) {
            tx.addTest('{"response":{"tid":1,"responseData":"test"},"request":{"remoteFn":"myFacade.myFunction","requestData":"test","type":"rpc","tid":1,"state":2}}', 'RPC request mit callbackFn');
            tx.addResult(JSON.stringify(ajaxData));
        }   
    });
    
    
    //  RPC request mit callbackFn und Fehler
    rpc.do({
        remoteFn: 'myFacade.myErrorNoticeFunction',
        requestData: 'test',
        fn: function(ajaxData) {
            tx.addTest('{"response":{"tid":2,"responseData":"test","errorMsg":"Fehler, aber nicht tragisch.","errorType":"errorNotice"},"request":{"remoteFn":"myFacade.myErrorNoticeFunction","requestData":"test","type":"rpc","tid":2,"state":2}}', 'RPC request mit callbackFn und Fehler (Notice)');
            tx.addResult(JSON.stringify(ajaxData));
        }   
    });
    
    //  RPC request mit callbackFn und unerwartetem Fehler
    rpc.do({
        remoteFn: 'myFacade.myErrorFunction',
        requestData: 'test',
        fn: function(ajaxData) {
            tx.addTest('{"response":{"tid":3,"responseData":"test","errorMsg":"Fehler! Schrecklich!!!","errorType":"error"},"request":{"remoteFn":"myFacade.myErrorFunction","requestData":"test","type":"rpc","tid":3,"state":2}}', 'RPC request mit callbackFn und unerwartetem Fehler');
            tx.addResult(JSON.stringify(ajaxData));
        }
    });
    
    // RPC request mit Promise
    rpc.do({
        remoteFn: 'myFacade.myFunction',
        requestData: 'test'
    }).then((ajaxData) => {
        tx.addTest('{"response":{"tid":4,"responseData":"test"},"request":{"remoteFn":"myFacade.myFunction","requestData":"test","type":"rpc","tid":4,"state":2}}', 'RPC request mit Promise');
        tx.addResult(JSON.stringify(ajaxData));
    }).catch((ex) => {
        tx.addTest('{"response":{"tid":4,"responseData":"test"},"request":{"remoteFn":"myFacade.myFunction","requestData":"test","type":"rpc","tid":4,"state":2}}', 'RPC request mit Promise');
        tx.addResult(ex.message);
    });
    
    // RPC request mit Promise und Fehler
    rpc.do({
        remoteFn: 'myFacade.myErrorNoticeFunction',
        requestData: 'test'
    }).then((ajaxData) => {
        tx.addTest('{"response":{"tid":5,"responseData":"test","errorMsg":"Fehler, aber nicht tragisch.","errorType":"errorNotice"},"request":{"remoteFn":"myFacade.myErrorNoticeFunction","requestData":"test","type":"rpc","tid":5,"state":2}}', 'RPC request mit Promise und Fehler');
        tx.addResult(JSON.stringify(ajaxData));
    }).catch((ex) => {
        tx.addTest('{"response":{"tid":5,"responseData":"test","errorMsg":"Fehler, aber nicht tragisch.","errorType":"errorNotice"},"request":{"remoteFn":"myFacade.myErrorNoticeFunction","requestData":"test","type":"rpc","tid":5,"state":2}}', 'RPC request mit Promise und Fehler');
        tx.addResult(ex.message);
    });
    
    // RPC request mit Promise und unerwartetem Fehler
    rpc.do({
        remoteFn: 'myFacade.myErrorFunction',
        requestData: 'test'
    }).then((ajaxData) => {
        tx.addTest('Fehler! Schrecklich!!!', 'RPC request mit Promise und Fehler');
        tx.addResult(JSON.stringify(ajaxData));
    }).catch((ex) => {
        console.log(ex);
        tx.addTest('Fehler! Schrecklich!!!', 'RPC request mit Promise und Fehler');
        tx.addResult(ex.message);
    });
    
    
    kijs.defer(tx.displayTests, 500, tx);
}

