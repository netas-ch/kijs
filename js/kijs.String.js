/* global kijs */

// --------------------------------------------------------------
// kijs.String (Static)
// --------------------------------------------------------------
kijs.String = class kijs_String {


    // --------------------------------------------------------------
    // STATICS
    // --------------------------------------------------------------
    
    /**
     * Überprüft, ob ein String mit einem gesuchten String beginnt
     * @param {String} text
     * @param {String} search
     * @returns {Boolean}
     */
    static beginsWith(text, search) {
        return text.indexOf(search) === 0;
    }
    
    /**
     * Überprüft, ob ein String einen gesuchten String enthält
     * @param {String} text
     * @param {String} search
     * @returns {Boolean}
     */
    static contains(text, search) {
        return text.indexOf(search) >= 0;
    }
    
    /**
     * Überprüft, ob ein String mit einem gesuchten String endet
     * @param {String} text
     * @param {String} search
     * @returns {Boolean}
     */
    static endsWith(text, search) {
        return text.indexOf(search, text.length - search.length) !== -1;
    }
    
    /**
     * Ersetzt alle Vorkommen in einem String ohne reguläre Ausdrücke
     * @param {String} text
     * @param {String} search
     * @param {String} replace
     * @returns {String} replace
     */
    static replaceAll(text, search, replace) {
        text = kijs.isEmpty(text) ? '' : text;
        search = kijs.isEmpty(search) ? '' : search;
        replace = kijs.isEmpty(replace) ? '' : replace;
        return text.split(search).join(replace);
    }
    
    /**
     * Ergänzt eine Zahl mit vorangestellten Nullen
     * @param {String} input
     * @param {Number} length
     * @param {String} [padString=' ']
     * @param {String} [type='right'] 'left', 'right' oder 'both'
     * @returns {String}
     */
    static padding(input, length, padString, type) {
        length = length || 0;
        input = input + '';
        while (input.length < length) {
            if (type === 'left' || type === 'both') {
                input = padString + input;
            }
            
            if (!type || type === 'right' || type === 'both') {
                input = input + padString;
            }
        }
        return input;
    }

};