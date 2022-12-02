/* global kijs */

// ---------------------------------
// Tests mit Date
// ---------------------------------
function test_07_date(target) {
    let tx = new kijs.Test();
    if (tx.hasTests()) {
        alert('Es wurden bereits Tests gemacht! Bitte laden sie die Seite neu.');
    }

    // --------------------------------------------------------------
    // Testanweisungen
    // --------------------------------------------------------------
    let d2 = kijs.Date.create(1489583989);
    let d3 = kijs.Date.create([2017, 2, 2, 10, 5]);
    let d4 = kijs.Date.create('2017-03-04');
    let d5 = kijs.Date.create('2017-12-05 16:30:44');
    let d6 = kijs.Date.getMonday(kijs.Date.create('W5 2017'));
    let d7 = kijs.Date.getSunday(kijs.Date.create('W5 2017'));

    tx.addTest('', '', 'TESTS mit Datum');

    // Formatierung
    tx.addTest('15.03.2017 14:19', 'Datum von Unixstamp', 'Instanzierung');
    tx.addResult(kijs.Date.format(d2, 'd.m.Y H:i'));

    tx.addTest('02.02.2017 10:05', 'Datum von Werten');
    tx.addResult(kijs.Date.format(d3, 'd.m.Y H:i'));

    tx.addTest('04.03.2017 00:00:00', 'Datum vom SQL');
    tx.addResult(kijs.Date.format(d4, 'd.m.Y H:i:s'));

    tx.addTest('05.12.2017 16:30:44', 'Datum vom SQL mit Uhrzeit');
    tx.addResult(kijs.Date.format(d5, 'd.m.Y H:i:s'));

    tx.addTest('30.01.2017', 'Erster Tag KW 5 2017');
    tx.addResult(kijs.Date.format(d6, 'd.m.Y'));

    tx.addTest('05.02.2017', 'Letzter Tag KW 5 2017');
    tx.addResult(kijs.Date.format(d7, 'd.m.Y'));

    tx.addTest('Mittwoch, 15. März 2017 14:19', 'Bezeichnung', 'Formatierung');
    tx.addResult(kijs.Date.format(d2, 'l, d. F Y H:i'));

    tx.addTest('Mi, 15. Mär 2017 14:19', 'Kurzbezeichnung');
    tx.addResult(kijs.Date.format(d2, 'D, d. M Y H:i'));

    tx.addTest(11, 'Wochennummer', 'Wochen');
    tx.addResult(kijs.Date.getWeekOfYear(d2));

    tx.addTest(53, 'Anz. Wochen 2015');
    tx.addResult(kijs.Date.getNumberOfWeeks(2015));

    tx.addTest(52, 'Anz. Wochen 2017');
    tx.addResult(kijs.Date.getNumberOfWeeks(2017));

    tx.addTest(false, 'Schaltjahr', 'Jahr');
    tx.addResult(kijs.Date.isLeapYear(d2));

    tx.displayTests(target);
}
