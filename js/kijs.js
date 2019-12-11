/* global HTMLElement */

// --------------------------------------------------------------
// kijs (Static)
// --------------------------------------------------------------
window.kijs = class kijs {


    // --------------------------------------------------------------
    // STATIC GETTERS / SETTERS
    // --------------------------------------------------------------
    static get version() { return '0.0.1'; }

    static get keys() {
        return {
            BACKSPACE: 8,
            TAB: 9,
            ENTER: 13,
            SHIFT: 16,
            ESC: 27,
            SPACE: 32,
            PAGE_UP: 33,
            PAGE_DOWN: 34,
            END: 35,
            HOME: 36,

            LEFT_ARROW: 37,
            UP_ARROW: 38,
            RIGHT_ARROW: 39,
            DOWN_ARROW: 40,

            INS: 45,
            DEL: 46,

            0: 48,
            1: 49,
            2: 50,
            3: 51,
            4: 52,
            5: 53,
            6: 54,
            7: 55,
            8: 56,
            9: 57,
            A: 65,
            B: 66,
            C: 67,
            D: 68,
            E: 69,
            F: 70,
            G: 71,
            H: 72,
            I: 73,
            J: 74,
            K: 75,
            L: 76,
            M: 77,
            N: 78,
            O: 79,
            P: 80,
            Q: 81,
            R: 82,
            S: 83,
            T: 84,
            U: 85,
            V: 86,
            W: 87,
            X: 88,
            Y: 89,
            Z: 90,

            KEYPAD_0: 96,
            KEYPAD_1: 97,
            KEYPAD_2: 98,
            KEYPAD_3: 99,
            KEYPAD_4: 100,
            KEYPAD_5: 101,
            KEYPAD_6: 102,
            KEYPAD_7: 103,
            KEYPAD_8: 104,
            KEYPAD_9: 105,

            F1: 112,
            F2: 113,
            F3: 114,
            F4: 115,
            F5: 116,
            F6: 117,
            F7: 118,
            F8: 119,
            F9: 120,
            F10: 121,
            F11: 122,
            F12: 123
        };
    }



    // --------------------------------------------------------------
    // STATICS
    // --------------------------------------------------------------

    // Static Properties in this Class
    // __uniqueId {Number|null}       Zähler der eindeutigen UniqueId
    // __getTextFn {Function|null}    getText-Methode
    // __getTextFnScope {Object|null} Kontext der getText-Methode


    /**
     * Erstellt eine Delegate
     * @param {Function} fn
     * @param {Object} context
     * @param {Mixed} args
     * @returns {Function}
     */
    static createDelegate(fn, context, args) {
        return function() {
            const callArgs = args || arguments;
            return fn.apply(context || window, callArgs);
        };
    }

    /**
     * Erstellt einen Namespace
     * @param {String} name - Name des Namespace. Beispiel: 'kijs.gui.field'
     * @param {Object} [object] - Objekt das zugewiesen wird
     * @returns {String}
     */
    static createNamespace(name, object) {
        const parts = name.split('.');
        let parent = window;
        let part;

        for (let i=0; i<parts.length; i++) {
            part = parts[i];
            if (!parent[part]) {
                parent[part] = i===parts.length-1 && object ? object : {};
            }
            parent = parent[part];
        }

        return part;
    }

    /**
     * Führt eine Funktion zeitverzögert aus
     * @param {Function} fn
     * @param {Number} millis
     * @param {Object} context
     * @param {mixed} [args]
     * @returns {Number} Timeout-ID die mit clearTimeout gelöscht werden kann
     */
    static defer(fn, millis, context, args = null) {
        if (args !== null) {
            args = kijs.isArray(args) ? args : [args];
        }

        fn = this.createDelegate(fn, context, args);
        if (millis > 0) {
            return setTimeout(fn, millis);
        } else {
            fn();
            return 0;
        }
    }

    /**
     * Gibt die Parameter zurück, die mittels GET an die URL übergeben werden
     * @param {String} [parameterName] Den Parameter, der gesucht wird. Ohne Argument werden alle zurückgegeben.
     * @returns {String|Object}
     */
    static getGetParameter(parameterName) {
        const params = {};
        if ('search' in window.location) {
            const pt = window.location.search.substr(1).split('&');
            for (let i=0; i<pt.length; i++) {
                let tmp = pt[i].split('=');
                params[tmp[0]] = tmp.length === 2 ? tmp[1] : null;
            };
        }

        if (parameterName === undefined) {
            return params;
        } else {
            return params[parameterName];
        }
    }

    /**
     * Gibt das Objekt/Funktion eines Namespaces zurück.
     * Falls der Namespace nicht existiert wird false zurückgegeben.
     * @param {String} name - Name des Namespace. Beispiel: 'kijs.gui.field'
     * @returns {Function|Object|false}
     */
    static getObjectFromNamespace(name) {
        const parts = name.split('.');
        let parent = window;
        let part;

        for (let i=0; i<parts.length; i++) {
            part = parts[i];
            if (!parent[part]) {
                return false;
            }
            parent = parent[part];
        }

        return parent;
    }

    /**
     * Text für übersetzung zurückgeben
     * @param {String} key
     * @param {String} variant
     * @param {mixed} args
     * @param {String} comment          Kommentar für den Übersetzer. Wird nur zum Generieren der Usages-Datei benötigt.
     * @param {String} languageId
     * @returns {String}
     */
    static getText(key, variant='', args=null, comment='', languageId=null) {
        if (kijs.isFunction(kijs.__getTextFn)) {
            return kijs.__getTextFn.call(kijs.__getTextFnScope || this, key, variant, args, comment, languageId);
        }

        // keine getText-Fn definiert: Argumente ersetzen
        let text = key;
        if (args !== null) {
            args = kijs.isArray(args) ? args : [args];

            for (var i=args.length; i>0; i--) {
                text = kijs.String.replaceAll(text, '%' + i, args[i-1]);
            }
        }

        return text;
    }

    /**
     * Führt eine Funktion in einem Interval aus
     * @param {Function} fn
     * @param {Number} millis
     * @param {Object} context
     * @param {Array} [args]
     * @returns {Number} Interval-ID die mit clearInterval gelöscht werden kann
     */
    static interval(fn, millis, context, args) {
        fn = this.createDelegate(fn, context, args);
        return setInterval(fn, millis);
    }

    /**
     * Prüft, ob ein value vom Typ Array ist.
     * @param {Array} value
     * @returns {Boolean}
     */
    static isArray(value) {
        return Object.prototype.toString.call(value) === '[object Array]';
    }

    /**
     * Prüft, ob ein value vom Typ Boolean ist
     * @param {Boolean} value
     * @returns {Boolean}
     */
    static isBoolean(value) {
        return value===true || value===false;
    }

    /**
     * Prüft ob ein Wert ein gültiges Datum ist
     * @param {Date} value
     * @returns {Boolean}
     */
    static isDate(value) {
        return value instanceof Date && !isNaN(value.valueOf());
    }

    /**
     * Prüft, ob ein value definiert ist.
     * @param {undefined} value
     * @returns {Boolean}
     */
    static isDefined(value) {
        return typeof value !== 'undefined';
    }

    /**
     * Prüft, ob ein value leer ist.
     * @param {Mixed} value
     * @returns {Boolean}
     */
    static isEmpty(value){
        if (value === null || value === '' || value === undefined) {
            return true;
        }

        if (this.isArray(value)) {
            return value.length === 0;
        }

        if (this.isObject(value)) {
            return Object.keys(value).length === 0;
        }

        return false;
    }

    /**
     * Prüft, ob ein value vom Typ Float ist, d.h. Nachkommastellen hat.
     * @param {Number} value
     * @returns {Boolean}
     */
    static isFloat(value) {
      return this.isInteger(value) === false && parseFloat(value) === value;
    }

    /**
     * Prüft, ob ein value vom Typ Function ist.
     * @param {Function} value
     * @returns {Boolean}
     */
    static isFunction(value){
        return typeof value === 'function';
    }

    /**
     * Prüft, ob ein value vom Typ HTMLElement ist.
     * @param {Mixed} value
     * @returns {Boolean}
     */
    static isHTMLElement(value) {
        return value instanceof HTMLElement;
    }

    /**
     * Prüft, ob ein value vom Typ Number und kein Float ist.
     * @param {Number} value
     * @returns {Boolean}
     */
    static isInteger(value) {
        return parseInt(value) === value;
    }

    /**
     * Prüft, ob ein value vom Typ Number ist.
     * @param {Number} value
     * @returns {Boolean}
     */
    static isNumber(value) {
        return typeof value === 'number' && !window.isNaN(value);
    }

    /**
     * Prüft, ob ein value einen numerischen Wert enthält (Number oder String)
     * @param {Number|String} value
     * @returns {Boolean}
     */
    static isNumeric(value) {
        return this.isNumber(value) || !!(this.isString(value) && value.match(/^-{0,1}[0-9]+(\.[0-9]+){0,1}$/));
    }

    /**
     * Prüft, ob ein value vom Typ Objekt ist.
     * @param {Object} value
     * @returns {Boolean}
     */
    static isObject(value) {
        return Object.prototype.toString.call(value) === '[object Object]';
    }

    /**
     * Erstellt einen DOMContentLoaded Listener
     * @param {Function} fn
     * @param {Object} context
     * @returns {undefined}
     */
    static isReady(fn, context) {
        document.addEventListener('DOMContentLoaded', this.createDelegate(fn, context || this), false);
    }

    /**
     * Prüft, ob ein value vom Typ String ist.
     * @param {String} value
     * @returns {Boolean}
     */
    static isString(value) {
        return typeof value === 'string';
    }

    /**
     * Wandelt einen beliebigen Wert in einen String um.
     * @param {mixed} value
     * @returns {String}
     */
    static toString(value) {
        if (kijs.isString(value)) {
            return value;

        } else if (value === null || !kijs.isDefined(value)) {
            return '';

        } else if (kijs.isBoolean(value)) {
            return value ? '1' : '0';

        } else if (kijs.isFunction(value.toString)) {
            return value.toString();
        }

        return (value + '');
    }

    /**
     * Setzt eine individuelle getText-Funktion.
     * Die fn erhält folgende Variablen: key, variant, args, comment, languageId
     * @param {Function} fn
     * @param {Object} scope
     * @returns {undefined}
     */
    static setGetTextFn(fn, scope=null) {
        kijs.__getTextFn = fn;
        kijs.__getTextFnScope = scope;
    }

    /**
     * Gibt eine eindeutige ID zurück.
     * @param {String} [prefix=''] Ein optionales Prefix
     * @returns {String}
     */
    static uniqId(prefix = '') {
        if (!window.kijs.__uniqId) {
            window.kijs.__uniqId = 0;
        }
        window.kijs.__uniqId++;
        return 'kijs-' + (prefix ? prefix + '-' : '') + window.kijs.__uniqId;
    }
};
