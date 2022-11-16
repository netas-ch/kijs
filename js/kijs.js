/* global HTMLElement */

// --------------------------------------------------------------
// kijs (Static)
// --------------------------------------------------------------
window.kijs = class kijs {


    // --------------------------------------------------------------
    // STATIC GETTERS / SETTERS
    // --------------------------------------------------------------
    static get version() { return '1.4.1'; }


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
     * Erstellt eine Klasse/Objekt aus einem Namespace (xtype, iconMap)
     * @param {String} xtype    Beispiel: 'kijs.gui.Element'
     * @returns {kijs.gui.Element|Object|null}
     */
    static getClassFromXtype(xtype) {
        const parts = xtype.split('.');
        let parent = window;

        for (let i=0; i<parts.length; i++) {
            let part = parts[i];
            if (!parent[part]) {
                return null;
            }
            parent = parent[part];
        }
        return parent;
    }

    /**
     * Gibt die Parameter zurück, die mittels GET an die URL übergeben werden
     * @param {String} [parameterName] Den Parameter, der gesucht wird. Ohne Argument werden alle zurückgegeben.
     * @returns {String|Object|undefined}
     */
    static getGetParameter(parameterName) {
        console.warn(`DEPRECATED: use "kijs.Navigator.getGetParameter" instead of "kijs.getGetParameter"`);
        return kijs.Navigator.getGetParameter(parameterName);
    }

    /**
     * Text für Übersetzung zurückgeben
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

            for (let i=args.length; i>0; i--) {
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
        return value instanceof Date && !window.isNaN(value.valueOf());
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
        return this.isNumber(value) || !!(this.isString(value) && value.match(/^-?[0-9]+(?:\.[0-9]+)?$/));
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
     * Prüft, ob ein Wert eine Instanz von einem Standard-Objekt ist. (z.B. let obj = {};)
     * @param {Mixed} value
     * @returns {Boolean}
     */
    static isStandardObject(value) {
        return kijs.isObject(value) && value.constructor === window.Object;
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
            return value ? '1' : ''; // Achtung: '0' wird zu true ausgewertet.

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
        if (!kijs.__uniqId) {
            kijs.__uniqId = 0;
        }
        kijs.__uniqId++;
        return 'kijs-' + (prefix ? prefix + '-' : '') + kijs.__uniqId;
    }

    /**
     * Kleine Hilfsfunktion, um ein Timeout in einer Async-Funktion zu nutzen.
     * @param {Number} ms Miliseconds
     * @returns {Promise}
     */
    static wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};
