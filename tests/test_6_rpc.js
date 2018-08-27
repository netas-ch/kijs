/* global kijs */

// ---------------------------------
// Tests mit RPC
// ---------------------------------
function test_6_rpc() {
    let tx = new kijs.Test();
    if (tx.hasTests()) {
        alert('Es wurden bereits Tests gemacht! Bitte laden sie die Seite neu.');
    }

    
    // --------------------------------------------------------------
    // Testanweisungen
    // --------------------------------------------------------------
    tx.addTest('', '', 'TESTS mit RPC');

    // Einfacher RPC request
    tx.addTest('{"meinString":"blabla","meineZahl":53.4,"meinArray":[1,2,3]}', 'Einfacher RPC-Request');
    let rpc = new kijs.Rpc({ url: 'tests/rpcTest/rpc.php' });
    rpc.do('myFacade.myFunction', {
        meinString: 'blabla',
        meineZahl: 53.4,
        meinArray: [1, 2, 3]
    }, function(response, request) {
        tx.addResult(JSON.stringify(response.data));
    });
    
    kijs.defer(tx.displayTests, 500, tx);
}

