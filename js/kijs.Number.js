/* global kijs */

// --------------------------------------------------------------
// kijs.Number (Static)
// --------------------------------------------------------------
kijs.Number = class kijs_String {


    // --------------------------------------------------------------
    // STATICS
    // --------------------------------------------------------------

    /**
     * Formatiert eine Zahl
     * @param {Number} number
     * @param {Number|String|null} [decimals='']    // Anzahl Kommastellen '' oder null = auto
     * @param {String} [decPoint='.']               // Dezimaltrennzeichen
     * @param {String} [thousandsSep='\'']          // Tausendertrennzeichen
     * @returns {String}
     */
    static format(number, decimals=0, decPoint='.', thousandsSep='\'') {
        let ret = '';
        let tmp = kijs.toString(number).split('.');

        // Bei decimals==='' oder null automatisch die Anzahl Kommastellen ermitteln
        if (decimals==='' || decimals===null) {
            if (tmp.length > 1) {
                decimals = tmp[1].length;
            } else {
                decimals = 0;
            }
        } else {
            decimals = Number(decimals);
        }

        // Tausendertrennzeichen einfügen
        if (!kijs.isEmpty(thousandsSep) && !kijs.isEmpty(tmp[0])) {
            const len = kijs.toString(tmp[0]).length;
            for (let i=len-1; i>=0; i--) {
                ret = tmp[0].substr(i, 1) + ret;
                if ((len-i) % 3 === 0 && i > 0) {
                    ret = thousandsSep + ret;
                }
            }
        } else {
            ret = tmp[0]+'';
        }

        // Anzahl Kommastellen
        if (decimals > 0 && !kijs.isEmpty(ret) && !kijs.isEmpty(decPoint)) {
            let digits = tmp.length > 1 ? kijs.toString(tmp[1]) : '';
            digits = kijs.String.padding(digits.substr(0, decimals), decimals, '0', 'right');
            ret += decPoint + digits;
        }

        return ret;
    }

    /**
     * Parst ein String zu einer Nummer und rundet auf die angegebenen Decimals.
     * Die Funktion rundet kaufmännisch, d.H. 0.5 wird immer  aufgerundet.
     * @param {String} number
     * @param {Number} decimals
     * @param {String} decPoint
     * @param {String} thousandsSep
     * @returns {Number}
     */
    static parse(number, decimals=0, decPoint='.', thousandsSep='\'') {
        if (thousandsSep !== '') {
            number = kijs.String.replaceAll(number, thousandsSep, '');
        }
        if (decPoint !== '.' && decPoint !== '') {
            number = kijs.String.replaceAll(number, decPoint, '.');
        }
        number = number.replace(/[^\-0-9\.]/, '');
        number = window.parseFloat(number);

        if (!window.isNaN(number)) {
            if (decimals === 0) {
                number = window.parseInt(number.toFixed(0));
            } else {
                number = window.parseFloat(number.toFixed(decimals));
            }

            return number;
        }

        return null;
    }

    /**
     * Rundet einen Fliesskommawert.
     * Halbe werden aufgerundet: Somit wird 1.5 zu 2 und -1.5 zu -2 (Kaufmännisches Runden).
     * @param {Number} number
     * @param {Number} precision
     * @returns {Number}
     */
    static round(number, precision=0) {
        return window.parseFloat(number.toFixed(precision));
    }

};