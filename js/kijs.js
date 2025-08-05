/* global HTMLElement */

// --------------------------------------------------------------
// kijs (Static)
// --------------------------------------------------------------
window.kijs = class kijs {

    // PRIVATE VARS
    // __getTextFn {Function|null}      Verweise auf die getText()-Funktion
    // __getTextFnContext {Object|null} Kontext der getText()-Funktion
    // __language {String}              Aktuelle Sprache. Z.B. 'de-CH' oder 'fr' (Standard='de')
    // __rpcs {Object}                  Objekt mit Verweisen auf eine kijs.gui.Rpc-Instanz
    //                                  { default:..., myRpc2:... }
    //                                  { en:{...}, fr:{...} }
    // __uniqueId {Number|null}         Zähler der eindeutigen UniqueId



    // --------------------------------------------------------------
    // STATIC GETTERS / SETTERS
    // --------------------------------------------------------------
    static get version() { return '2.9.2'; }

    static get language() {
        if (this.__language) {
            return this.__language;
        } else {
            return 'de';
        }
    }

    static set language(val) {
        this.__language = val;
    }



    // --------------------------------------------------------------
    // STATICS
    // --------------------------------------------------------------
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
     * Erstellt aus einem String eine Funktion.
     * Dazu kann entweder eine neue Funktion als String übergeben werden:
     * 'function(myArg) { return myArg; }'
     * Oder ein Verweis auf eine bestehende Funktion:
     * 'myApp.doThis'
     * @param {String|Function} str
     * @returns {Function|Null}
     */
    static getFunctionFromString(str) {
        if (kijs.isFunction(str)) {
            return str;

        } else if (kijs.isString(str)) {
            // Funktion als String Bsp: function(a,b,...) {...}
            let res = /^function\s*\(([a-zA-Z0-9_, ]*)\)\s*\{\s(.*)\s\}/s.exec(str);
            if (res !== null) {
                // Funktionsargumente
                let args = res[1];

                // Funktionsinhalt
                let fnContent = res[2];

                // Funktion erstellen und zurückgeben
                return Function(args, fnContent);
            }

            // Verweis auf eine bestehende Funktion als String Bsp: console.log
            if (str.match(/^([a-zA-Z][a-zA-Z0-9_]*\.?)+$/s) !== null) {
                let fn = kijs.getObjectFromString(str);
                if (kijs.isFunction(fn)) {
                    return fn;
                }
            }
        }

        return null;
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
     * Erstellt aus einem String mit einem Verweis ein Objekt/Funktion
     * Beispiel: 'myApp.doThis' oder 'kijs.gui.Button'
     * @param {String} str
     * @param {Object} [parent=window]
     * @returns {Object|Funktion|Null}
     */
    static getObjectFromString(str, parent=window) {
        if (kijs.isFunction(str) || kijs.isObject(str)) {
            return str;

        } else {
            const parts = str.split('.');

            if (parts.length > 0) {
                if (parts[0] === 'window') {
                    parts.shift();

                }
            }

            for (let i=0; i<parts.length; i++) {
                let part = parts[i];
                if (!parent[part]) {
                    return null;
                }
                parent = parent[part];
            }
            return parent;
        }

        return null;
    }

    /**
     * Gibt den Verweis auf eine RPC-Instanz zurück.
     * Wird kein Name angegeben, wird der default-RPC zurückgegeben.
     * Die RPCs müssen vorgängig mit kijs.setRpc() definiert werden.
     * @param {String} [name='default']
     * @returns {undefined}
     */
    static getRpc(name = 'default') {
        if (!kijs.isObject(kijs.__rpcs) || kijs.isEmpty(kijs.__rpcs[name])) {
            throw new kijs.Error(`global RPC "${name}" is not exist.`);
        }
        return kijs.__rpcs[name];
    }

    /**
     * Text für Übersetzung zurückgeben
     * @param {String} key
     * @param {String} variant
     * @param {mixed} args
     * @param {String} language
     * @returns {String}
     */
    static getText(key, variant='', args=null, language=null) {
        let ret;

        // aktuelle Sprache
        if (!language) {
            language = kijs.language;
        }

        // Falls eine eigene getText-fn definiert ist, diese verwenden
        if (kijs.isFunction(kijs.__getTextFn)) {
            return kijs.__getTextFn.call(kijs.__getTextFnContext || this, key, variant, args, language);
        }

        // sonst schauen, ob es eine Sprachdatei von kijs in der gewünschten Sprache gibt
        if (this.isDefined(kijs.translation) && kijs.translation[language] && 
                this.isDefined(kijs.translation[language][key])) {
            let txt = kijs.translation[language][key];

            // Evtl. sind Varianten vorhanden
            if (kijs.isObject(txt)) {
                if (Object.hasOwn(txt, variant)) {
                    ret = txt[variant];
                } else if (Object.hasOwn(txt, '')) {
                    ret = txt[''];
                } else {
                    ret = key;
                }
            } else {
                ret = txt;
            }
        } else {
            ret = key;
        }

        // Evtl. noch Argumente ersetzen
        if (args !== null) {
            args = kijs.isArray(args) ? args : [args];

            for (let i=args.length; i>0; i--) {
                ret = kijs.String.replaceAll(ret, '%' + i, args[i-1]);
            }
        }

        return ret;
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
     * Prüft, ob ein Wert ein gültiges Datum ist
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
     * Prüft, ob ein value vom Typ RegExp ist.
     * @param {Object} value
     * @returns {Boolean}
     */
    static isRegExp(value) {
        return (typeof value === 'object') && (value instanceof RegExp);
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
     * Setzt eine individuelle getText-Funktion.
     * Die fn erhält folgende Argumente: key, variant, args, language
     * @param {Function} fn
     * @param {Object} [context=this]
     * @returns {undefined}
     */
    static setGetTextFn(fn, context) {
        kijs.__getTextFn = fn;
        kijs.__getTextFnContext = context || this;
    }
    
    /**
     * Erstellt einen globalen Verweis auf eine RPC-Klasse.
     * Der Standard-RPC sollte 'default' heissen.
     * Weitere sind mit beliebigen Namen möglich.
     * @param {String} name
     * @param {kijs.gui.Rpc} rpc
     * @returns {undefined}
     */
    static setRpc(name, rpc) {
        if (!kijs.isObject(kijs.__rpcs)) {
            kijs.__rpcs = {};
        }
        kijs.__rpcs[name] = rpc;
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
     * @param {Number} ms Milliseconds
     * @returns {Promise}
     */
    static wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

};
