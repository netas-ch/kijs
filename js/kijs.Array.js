/* global kijs */

// --------------------------------------------------------------
// kijs.Array (Static)
// --------------------------------------------------------------
kijs.Array = class kijs_Array {


    // --------------------------------------------------------------
    // STATICS
    // --------------------------------------------------------------
    /**
     * Leert ein Array
     * @param {Array} array
     */
    static clear(array) {
        while(array.length > 0) {
            array.pop();
        }
    }
    
    /**
     * Erstellt eine Kopie eines flachen Arrays
     * @param {Array} array
     * @returns {Array}
     */
    static clone(array) {
        return Array.prototype.slice.call(array);
    }

    /**
     * Vergleicht zwei Arrays und Gibt bei gleichem Inhalt true zurück
     * @param {Array} array1
     * @param {Array} array2
     * @returns {Boolean}
     */
    static compare(array1, array2) {
        // Beides muss ein Array sein
        if (!kijs.isArray(array1) || !kijs.isArray(array2)) {
            return false;
        }
        
        // Die Länge muss übereinstimmen
        if (array1.length !== array2.length) {
            return false;
        }
        
        // Elemente durchgehen un den Inhalt vergleichen
        for (let i=0, l=array1.length; i<l; i++) {
            // Bei sub-Arrays: Rekursiver Aufruf
            if (array1[i] instanceof Array && array2[i] instanceof Array) {
                if (!this.compare(array1[i], array2[i])) {
                    return false;
                }
            
            // Datumswerte vergleichen
            } else if (array1[i] instanceof Date && array2[i] instanceof Date) {
                if (array1[i].getTime() !== array2[i].getTime()) {
                    return false;
                }
                
            // Bei allen anderen Datentypen: direkter Vergleich
            // ACHTUNG bei Objekten: {x:20} != {x:20}
            } else if (array1[i] !== array2[i]) { 
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Fügt Arrays zusammen
     * @param {...Array} arrays
     * @returns {Array}
     */
    static concat(...arrays) {
        let arr;
        [arr, ...arrays] = arrays;
        return arr.slice(0).concat(...arrays);
    }
    
    /**
     * Fügt Arrays zusammen und entfernt Duplikate
     * @param {...Array} arrays
     * @returns {Array}
     */
    static concatUnique(...arrays) {
        return kijs.Array.unique(kijs.Array.concat(...arrays));
    }
    
    /**
     * Prüft, ob ein Wert in einem Array vorkommt
     * @param {Array} array
     * @param {mixed} value
     * @returns {Boolean}
     */
    static contains(array, value) {
        return array.indexOf(value) !== -1;
    }

    /**
     * Durchläuft ein Array und ruft pro Element die callback-Funktion auf.
     * Die Iteration kann durch die Rückgabe von false gestoppt werden.
     * @param {Array} array
     * @param {Function} fn - Callback Funktion
     * @param {Object} context - Gültigkeitebereich
     * @param {Boolean} [reverse=false] - Soll das Array rückwärts durchlaufen werden?
     * @returns {Boolean}
     */
    static each(array, fn, context, reverse) {
        const len = array.length;

        if (reverse) {
            for (let i=len-1; i>-1; i--) {
                if (fn.call(context, array[i], i, array) === false) {
                    return i;
                }
            }

        } else {
            for (let i=0; i<len; i++) {
                if (fn.call(context, array[i], i, array) === false) {
                    return i;
                }
            }
        }

        return true;
    }
    
    /**
     * Löscht einen Wert aus einem Array und gibt dieses zurück.
     * @param {Array} array
     * @param {mixed} value
     * @returns {Array}
     */
    static remove(array, value) {
        const index = array.indexOf(value);
        
        if (index !== -1) {
            array.splice(index, 1);
        }
        
        return array;
    }
    
    /*static remove(array, value, strict=true) {
        const len = array.length;
        const ret = [];

        for (let i=0; i<len; i++) {
            if (strict && array[i] !== value) {
                ret.push(array[i]);
            }
            if (!strict && array[i] != value) {
                ret.push(array[i]);
            }
        }
        return ret;
    }*/
    
    /**
     * Löscht Werte aus einem Array und gibt ein neues zurück. Die Werte werden mittels Array übergeben
     * @param {Array} array
     * @param {Array} values    Array mit zu entfernenden Werten
     * @returns {Array}
     */
    static removeMultiple(array, values) {
        const len = array.length;
        const ret = [];
        
        for (let i=0; i<len; i++) {
            if (values.indexOf(array[i]) === -1) {
                ret.push(array[i]);
            }
        }
        return ret;
    }
    
    /**
     * Gibt einen Teil des Arrays als Kopie zurück.
     * @param {Array} array
     * @param {Number} [begin] - Erstes Element des genommen werden soll. Leer = Element mit Index 0.
     * @param {Number} [end] - Letztes Element des genommen werden soll. Leer = letztes Element.
    * @returns {Array}
     */
    static slice(array, begin, end) {
        if ([1,2].slice(1, undefined).length) {
            return Array.prototype.slice.call(array, begin, end);
        } else {
            // see http://jsperf.com/slice-fix
            if (typeof begin === 'undefined') {
                return Array.prototype.slice.call(array);
            }
            if (typeof end === 'undefined') {
                return Array.prototype.slice.call(array, begin);
            }
            return Array.prototype.slice.call(array, begin, end);
        }
    }
    
    /**
     * Klont ein neues Array ohne Duplikate und gibt dieses zurück
     * @param {Array} array
     * @returns {Array}
     */
    static unique(array) {
        const ret = [];
        
        for (let i=0; i<array.length; ++i) {
            if (ret.indexOf(array[i]) === -1) {
                ret.push(array[i]);
            }
        }

        return ret;
    }
};