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
     * @param {number} number
     * @param {number|string|null} [decimals='']    // Anzahl Kommastellen '' oder null = auto
     * @param {string} [decPoint='.']               // Dezimaltrennzeichen
     * @param {string} [thousandsSep='\'']          // Tausendertrennzeichen
     * @returns {string}
     */
    static format(number, decimals=0, decPoint='.', thousandsSep='\'') {
        let ret = '';
        let tmp = (number + '').split('.');

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
            const len = (tmp[0]+'').length;
            for (let i=len-1; i>=0; i--) {
                ret = tmp[0].substr(i, 1) + ret;
                if ((i) % 3 === 0 && i > 0) {
                    ret = thousandsSep + ret;
                }
            }
        } else {
            ret = tmp[0]+'';
        }
        
        // Anzahl Kommastellen
        if (decimals > 0 && !kijs.isEmpty(ret) && !kijs.isEmpty(decPoint)) {
            let digits = tmp.length > 1 ? tmp[1]+'' : '';
            digits = kijs.String.padding(digits.substr(0, decimals), decimals, '0', 'right');
            ret += decPoint + digits;
        }
        
        return ret;
    }


};