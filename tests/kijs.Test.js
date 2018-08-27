/* global kijs */

// --------------------------------------------------------------
// kijs.Test (Singleton)
// --------------------------------------------------------------
kijs.Test = class kijs_Test {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor() {
        // Singleton (es wird immer die gleiche Instanz zurückgegeben)
        if (!kijs_Test._singletonInstance) {
            kijs_Test._singletonInstance = this;

            // Variablen
            this._testArray = [];
            this._no = 0;
        }
        return kijs_Test._singletonInstance;
    }

    
    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    /**
     * Definiert einen neuen Test
     * @param {string|number|null|undefined|array} expectedValue - Erwarteter Wert oder Array mit erwarteten Werten
     * @param {string} description - Beschrieb des Tests
     * @param {string} [title] - Eventuelle Überschrift
     * @returns {number}
     */
    addTest(expectedValue, description, title) {
        let index = this._testArray.length;
        
        if (!this._testArray[index]) {
            this._testArray[index] = {
                expected    : [],
                effective   : [],
                description : '',
                title       : ''
            };
        }

        let expVals = this._testArray[index].expected;
        
        if (kijs.isArray(expectedValue)) {
            expVals = expVals.concat(expectedValue);
        } else {
            expVals.push(expectedValue);
        }
        this._testArray[index].expected = expVals;


        if (description) {
            this._testArray[index].description = description;
        }
        if (title) {
            this._testArray[index].title = title;
        }
        
        this._no  = index;
        
        return index;
    }
    
    /**
     * Übernimmt ein Testergebnis
     * @param {string|number|null|undefined|array} result - Testergebnis
     * @returns {number}
     */
    addResult(result) {
        let index = this._no;

        if (!this._testArray[index]) {
            this._testArray[index] = {
                expected    : [],
                effective   : [],
                description : '',
                title       : ''
            };
        }

        let effVals = this._testArray[index].effective;
        if (kijs.isArray(result)) {
            effVals = effVals.concat(result);
        } else {
            effVals.push(result);
        }
        this._testArray[index].effective = effVals;

        return index;
    }
    
    hasTests() {
        return this._testArray.length > 0;
    }

    displayTests(target) {
        let arr = this._testArray;
        let failuresCount = 0;
        
        let html = '';
        html += '<table class="testResultTable">' + "\n";
        html += '<tr><th style="text-align:right">Nr.</th><th>Beschrieb</th><th>Soll</th><th>Ist</th><th>Ok</th></tr>' + "\n";
        for (let i=0; i<arr.length; i++) {

            // Titelzeile
            if (arr[i].title && !arr[i].description) {
                html += '<tr><td colspan="5" class="title">' + arr[i].title + '</td></tr>' + "\n";
            } else if (arr[i].title) {
                html += '<tr><td colspan="5" class="subtitle">' + arr[i].title + '</td></tr>' + "\n";
            }

            // Datenzeile
            if (arr[i].description) {
                let exp='', eff='', ok=true;

                let len = arr[i].expected.length;
                if (arr[i].effective.length > len) {
                    len = arr[i].effective.length;
                }

                for (let j=0; j<len; j++) {
                    let expTmp = j<arr[i].expected.length ? arr[i].expected[j] : '';
                    let effTmp = j<arr[i].effective.length ? arr[i].effective[j] : '';

                    if (expTmp!==effTmp) {
                        ok = false;
                    }
                    if (exp || eff) {
                        exp += '<br />';
                        eff += '<br />';
                    }
                    exp += expTmp;
                    eff += effTmp;
                }

                html += '<tr>';
                html += '<td style="text-align:right">' + i + '</td>';
                html += '<td>' + arr[i].description + '</td>';
                html += '<td>' + exp + '</td>';
                html += '<td>' + eff + '</td>';
                if (ok) {
                    html += '<td class="ok">Ok</td>';
                } else {
                    html += '<td class="failure">Fehlgeschlagen</td>';
                    failuresCount++;
                }
                html += "</tr>\n";
            }
        }
        html += "</table>\n";
        
        let msg = '';
        if (failuresCount===0) {
            msg += '<section class="okBox">';
            msg += 'Alle Tests waren erfolgreich! <a href="" class="reloadButton">Neu laden</a>';
            msg += '</section>';
        } else {
            msg += '<section class="failureBox">';
            msg += failuresCount + ' Tests waren nicht erfolgreich!  <a href="" class="reloadButton">Neu laden</a>';
            msg += '</section>';
        }
        html = msg + html + msg;

        this.pushHtml(target, html);
    }

    pushHtml(target, html) {
        if (target) {
            if (kijs.isString(target)) {
                target = document.getElementById(target);
            }
        } else {
            target = document.body;
        }
        let div = document.createElement('section');
        div.className = 'testAusgabe';
        div.innerHTML = html;
        target.appendChild(div);
    }
    
};