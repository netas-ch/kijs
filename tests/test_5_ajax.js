/* global kijs */

// ---------------------------------
// Tests mit Ajax
// ---------------------------------
function test_5_ajax() {
    let tx = new kijs.Test();
    if (tx.hasTests()) {
        alert('Es wurden bereits Tests gemacht! Bitte laden sie die Seite neu.');
    }

    function testxx(arg1, arg2) {
        tx.addResult(arg1 + '-' + arg2);
        tx.displayTests();
    }
    
    
    // --------------------------------------------------------------
    // Testanweisungen
    // --------------------------------------------------------------
     tx.addTest('', '', 'TESTS mit Ajax');
    
    // JSON
    kijs.Ajax.request({
        url: 'tests/ajaxTest/ajaxTest.json',
        fn: function(ret) {
            tx.addTest('{"temperature":23.6,"humidity":44,"plantLevel":94,"childs":[{"name":"a1","value":1},{"name":"a2","value":2},{"name":"a3","value":3}]}', 'JSON');
            tx.addResult(JSON.stringify(ret));

            // XML
            kijs.Ajax.request({
                url: 'tests/ajaxTest/ajaxTest.xml', 
                fn: function(ret) {
                    tx.addTest('{"xml":{"temperature":"23.6","humidity":"44.0","plantLevel":"94","childs":[{"name":"a1","value":"1"},{"name":"a2","value":"2"},{"name":"a3","value":"3"}]}}', 'XML');
                    tx.addResult(JSON.stringify(ret));

                    // Text
                    kijs.Ajax.request({
                        url: 'tests/ajaxTest/ajaxTest.txt',
                        fn: function(ret) {
                            tx.addTest("Hallo Welt!", 'Text');
                            tx.addResult(ret);

                            tx.addTest('a-b', 'defer');
                            kijs.defer(testxx, 1000, this, ['a', 'b']);
                        },
                        context: this,
                        format: 'text'
                    });

                },
                context: this,
                format: 'xml'
            });
            
        },
        context: this
    });
    
    
    
    
    
    /*// Gleiche tests mit Promise
    tx.addTest('', '', 'TESTS mit Ajax');

    // Einfacher JSON request
    tx.addTest('{"temperature":23.6,"humidity":44,"plantLevel":94,"childs":[{"name":"a1","value":1},{"name":"a2","value":2},{"name":"a3","value":3}]}', 'Einfacher JSON-Request');
    kijs.Ajax.requestPromise({
        url: 'tests/ajaxTest/ajaxTest.json' 
        
    }).then(function(cfg) {
        tx.addResult(JSON.stringify(cfg.ret));
        
    }).catch(function(cfg) {
        tx.addResult(cfg.errorMsg);
        
    });


    // Einfacher JSON request mit Fehler
    kijs.defer(function(){
        tx.addTest('Verbindung konnte nicht aufgebaut werden!', 'Einfacher JSON-Request mit Fehler');
        kijs.Ajax.requestPromise({
            url: 'tests/ajaxTest/fehlendeDatei.json' 

        }).then(function(cfg) {
            tx.addResult(JSON.stringify(cfg.ret));

        }).catch(function(cfg) {
            tx.addResult(cfg.errorMsg);

        });
    }, 100);
    
    
    // Verkettete Requests
    kijs.defer(function(){
        tx.addTest([
            '{"temperature":23.6,"humidity":44,"plantLevel":94,"childs":[{"name":"a1","value":1},{"name":"a2","value":2},{"name":"a3","value":3}]}',
            '{"xml":{"temperature":"23.6","humidity":"44.0","plantLevel":"94","childs":[{"name":"a1","value":"1"},{"name":"a2","value":"2"},{"name":"a3","value":"3"}]}}',
            "Hallo Welt!\r\nZweite Zeile."
        ],
        'Verkettete Requests');
        
        
        // JSON
        kijs.Ajax.requestPromise({
            url: 'tests/ajaxTest/ajaxTest.json' 
        }).then(function(cfg) {
            tx.addResult(JSON.stringify(cfg.ret));

        // XML
            return kijs.Ajax.requestPromise({
                url: 'tests/ajaxTest/ajaxTest.xml', 
                format: 'xml'
            });
        }).then(function(cfg) {
            tx.addResult(JSON.stringify(cfg.ret));
            
        // Text
            return kijs.Ajax.requestPromise({
                url: 'tests/ajaxTest/ajaxTest.txt',
                format: 'text'
            });
        }).then(function(cfg) {
            tx.addResult(cfg.ret);
            
        }).catch(function(cfg){
            console.log(cfg.errorMsg);

        });

    }, 200);

    kijs.defer(tx.displayTests, 1000, tx);*/

}

