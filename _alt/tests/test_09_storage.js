/* global kijs */

// ---------------------------------
// Tests mit Date
// ---------------------------------
function test_09_storage(target) {
    let tx = new kijs.Test();
    if (tx.hasTests()) {
        alert('Es wurden bereits Tests gemacht! Bitte laden sie die Seite neu.');
        return;
    }

    // --------------------------------------------------------------
    // Testanweisungen
    // --------------------------------------------------------------
    kijs.Storage.setItem('test_1', 'Hallo Welt');
    kijs.Storage.setItem('test_2', 'Hallo Mond');
    kijs.Storage.setItem('test_3', 'Hallo Mars');
    kijs.Storage.setItem('test_4', 'Hallo Pluto', 'local', 'myprefix');

    tx.addTest('', '', 'TESTS mit Storage');

    // Formatierung
    tx.addTest('["test_3","test_1","test_2"]', 'Definierte Schlüssel', 'Static');
    tx.addResult(JSON.stringify(kijs.Storage.getKeys()));

    tx.addTest(null, 'Undefinierter Schlüssel', 'Static');
    tx.addResult(kijs.Storage.getItem('notdefined'));

    tx.addTest('Hallo Mond', 'Zugriff auf Schlüssel', 'Static');
    tx.addResult(kijs.Storage.getItem('test_2'));

    // Alle löschen
    kijs.Storage.removeAll();

    tx.addTest(null, 'Zugriff auf Schlüssel nach löschen', 'Static');
    tx.addResult(kijs.Storage.getItem('test_2'));

    tx.addTest('Hallo Pluto', 'Zugriff auf Schlüssel mit anderem Prefix', 'Static');
    tx.addResult(kijs.Storage.getItem('test_4', 'local', 'myprefix'));


    tx.displayTests(target);
}
