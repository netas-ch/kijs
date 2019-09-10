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
        if (kijs.isFunction(array.indexOf)) {
            return array.indexOf(value) !== -1;

        // gewisse List Elemente haben keine indexOf-Funktion
        // z.B. DOMStringList im Edge
        } else if (kijs.isInteger(array.length)) {
            for (let i=0; i<array.length; i++) {
                if (array[i] === value) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Vergleicht array1 mit einem oder mehr anderen Arrays und gibt die Werte
     * aus array1 zurück, die in keinem der anderen Arrays enthalten sind.
     * @param {Array} array1
     * @param {Array} arrays 2...x
     * @returns {Array}
     */
    static diff(array1, ...arrays) {
        let diff = [];
        kijs.Array.each(array1, function(v) {
            let uniqueVal = true;
            kijs.Array.each(arrays, function(compareArray) {
                if (kijs.Array.contains(compareArray, v)) {
                    uniqueVal = false;
                    return false;
                }
            }, this);

            if (uniqueVal) {
                diff.push(v);
            }

        }, this);

        return diff;
    }

    /**
     * Durchläuft ein Array und ruft pro Element die callback-Funktion auf.
     * Die Iteration kann durch die Rückgabe von false gestoppt werden.
     * @param {Array} array
     * @param {Function} fn - Callback Funktion
     * @param {Object} context - Gültigkeitsbereich
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
     * Gibt den grössten Wert eines Arrays zurück
     * @param {Array} array
     * @returns {Mixed} Den grössten Wert im Array
     */
    static max(array) {
        let max;
        for (let i=0; i<array.length; i++) {
            if (max === undefined || array[i] > max) {
                max = array[i];
            }
        }
        return max;
    }

    /**
     * Gibt den kleinsten Wert eines Arrays zurück
     * @param {Array} array
     * @returns {Mixed} Den kleinsten Wert im Array
     */
    static min(array) {
        let min;
        for (let i=0; i<array.length; i++) {
            if (min === undefined || array[i] < min) {
                min = array[i];
            }
        }
        return min;
    }

    /**
     * Schiebt ein Element in einem Array um einen bestimmten Offset
     * @param {Array} array
     * @param {Int} fromIndex Index des Elements, das geschoben werden soll
     * @param {Int} toIndex Index der neuen Position
     * @returns {Array}
     */
    static move(array, fromIndex, toIndex) {
        fromIndex = Math.max(0, Math.min(fromIndex, array.length));
        toIndex = Math.max(0, Math.min(toIndex, array.length));
        const value = array[fromIndex];

        // Da das array um eine Position kürzer ist, wenn das element
        // entfernt wird, muss eine pos. abgezogen werden.
        if (toIndex > fromIndex) {
            toIndex -= 1;
        }

        if (fromIndex !== toIndex) {
            array.splice(fromIndex, 1);
            array.splice(toIndex, 0, value);
        }

        return array;
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

    /**
     * Löscht einen Wert aus einem Array, wenn die übergebene Funktion
     * true zurückgibt. Die Fn wird für jedes Item aufgerufen.
     * @param {Array} array     Array, aus dem gelöscht wird
     * @param {Function} fn     Funktion, die die Löschung prüft
     * @param {Object} context  Kontext der Funktion
     * @returns {Array}
     */
    static removeIf(array, fn, context) {
        let toDelete = [];
        kijs.Array.each(array, function(item) {
            if (fn.call(context, item) === true) {
                toDelete.push(item);
            }
        }, this);
        kijs.Array.removeMultiple(array, toDelete);
        return array;
    }

    /**
     * Löscht Werte aus einem Array. Die Werte werden mittels Array übergeben.
     * @param {Array} array     Array, aus dem die Werte gelöscht werden.
     * @param {Array} values    Array mit zu entfernenden Werten
     * @returns {Array}
     */
    static removeMultiple(array, values) {
        kijs.Array.each(values, function(value) {
            kijs.Array.remove(array, value);
        });
        return array;
    }

    /**
     * Gibt einen Teil des Arrays als Kopie zurück.
     * @param {Array} array
     * @param {Number} [begin]  Erstes Element des genommen werden soll. Leer = Element mit Index 0.
     * @param {Number} [end]    Letztes Element des genommen werden soll. Leer = letztes Element.
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

        for (let i=0; i<array.length; i++) {
            if (ret.indexOf(array[i]) === -1) {
                ret.push(array[i]);
            }
        }

        return ret;
    }
};