/* global HTMLElement */

// --------------------------------------------------------------
// kijs (Static)
// --------------------------------------------------------------
window.kijs = class kijs {


    // --------------------------------------------------------------
    // STATIC GETTERS / SETTERS
    // --------------------------------------------------------------
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
    //__uniqueId {Number|Null}    Zähler der eindeutigen UniqueId
    
    
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
     * @param {Array} [args]
     * @returns {Number} Timeout-ID die mit clearTimeout gelöscht werden kann
     */
    static defer(fn, millis, context, args) {
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
        if (value === null || value === '' || value === undefined ) {
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
     * Handelt es sich um einen FireFox-Browser?
     * @returns {Boolean}
     */
    static isFirefox() {
        return navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
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
        return typeof value === 'number';
    }

    /**
     * Prüft, ob ein value einen numerischen Wert enthält (Number oder String)
     * @param {Number|String} value
     * @returns {Boolean}
     */
    static isNumeric(value) {
        return this.isNumber(value) || (this.isString(value) && value.match(/^[0-9]+\.{0,1}[0-9]*$/));
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
        document.addEventListener('DOMContentLoaded', this.createDelegate(fn, context||this), false);
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
     * @param {String} text
     * @param {Number} length
     * @param {String} [padString=' ']
     * @param {String} [type='right'] 'left', 'right' oder 'both'
     * @returns {String}
     */
    static padding(text, length, padString, type) {
        length = length || 0;
        text = text + '';
        while (text.length < length) {
            if (type === 'left' || type === 'both') {
                text = padString + text;
            }
            
            if (!type || type === 'right' || type === 'both') {
                text = text + padString;
            }
        }
        return text;
    }
    
    /**
     * Kürzt eine Zeichenkette auf eine maximale Länge und fügt ein "…"-Zeichen an
     * @param {string} text
     * @param {number} length maximlae Länge
     * @param {boolean} [useWordBoundary=false] Nur bei Leerzeichen abschnieden
     * @param {string} [postFixChar='…'] Zeichen, dass beim Abschneiden angehängt wird
     * @returns {String}
     */
    static trunc(text, length, useWordBoundary=false, postFixChar='…') {
        if (kijs.isEmpty(text) || !length || text.length <= length) {
            return text;
        }
        let subString = text.substr(0, length-1);
        if (useWordBoundary) {
            subString = subString.substr(0, subString.lastIndexOf(' '));
        }
        return subString + '' + postFixChar;
    }

    /**
     * Fügt Zeilenumbrüche in eine Zeichenkette ein
     * https://stackoverflow.com/a/51506718
     * @param {string} text
     * @param {number} length Anzahl Zeichen pro Zeile
     * @param {boolean} [useWordBoundary=true] Nur bei Leerzeichen Umbrüche einfügen
     * @returns {string}
     */
    static wrap(text, length, useWordBoundary=true) {
        if (useWordBoundary) {
            return text.replace(new RegExp(`(?![^\\n]{1,${length}}$)([^\\n]{1,${length}})\\s`, 'g'), '$1\n');
        } else {
            return text.replace(new RegExp(`(?![^\\n]{1,${length}}$)([^\\n]{1,${length}})`, 'g'), '$1\n');
        }
    }
};
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
/* global kijs */

// --------------------------------------------------------------
// kijs.Object (Static)
// --------------------------------------------------------------
kijs.Object = class kijs_Object {


    // --------------------------------------------------------------
    // STATICS
    // --------------------------------------------------------------
    /**
     * Wendet Konfigurations-Eigenschaften auf ein Objekt an
     * @param {Object} object       Ziel Objekt
     * @param {Object} config       Config Objekt
     * @param {Object} configMap    Config Map
     * @returns {undefined}
     */
    static assignConfig(object, config, configMap) {
        
        // 1. Shortcuts auflösen, Standardwerte übernehmen und configs in temporäres Array 'tmpConfigs' übernehmen
        let tmpConfigs = [];
        kijs.Object.each(config, function(cfgKey, cfgVal){
            
            if (!configMap.hasOwnProperty(cfgKey)) {
                throw new Error(`Unkown config "${cfgKey}"`);
            }
            
            // fn und target ermitteln
            // -----------------------
            let prio = Number.MIN_VALUE;
            let fn = 'replace';
            let target = '_' + cfgKey;
            let context = object;
            let map = configMap[cfgKey];
                    
            // True
            if (map === true) {
                // Standards nehmen

            } else if (map === false) {
                fn = 'error';

            // String (mit Target
            } else if (kijs.isString(map)) {
                target = map;

            // Objekt im Format { fn: '...', target:'...' }
            } else if (kijs.isObject(map)) {
                if (kijs.isNumeric(map.prio)) {
                    prio = Number(map.prio);
                }
                if (map.fn) {
                    fn = map.fn;
                }
                if (map.target) {
                    target = map.target;
                }
                if (map.context) {
                    context = map.context;
                }
            } else {
                throw new Error(`Unkown format on configMap "${cfgKey}"`);
                
            }
            
            tmpConfigs.push({
                prio: prio,
                key: cfgKey,
                fn: fn,
                target: target,
                context: context,
                value: cfgVal
            });
        }, this);
        
        // 2. Sortieren nach Priorität je grösser die Zahl desto später wird die Eigenschaft zugewiesen
        tmpConfigs.sort(function(a, b) {
            return a.prio - b.prio;
        });
                
        // 3. Eigenschjaften in der Reihenfolge ihrer Priorität zuweisen
        kijs.Array.each(tmpConfigs, function(cfg) {
            
            // Je nach fn den Wert zuweisen
            // ----------------------------
            switch (cfg.fn) {
                // Manuelle Zuweisung. Hier muss nichts getan werden
                case 'manual':
                    break;

                // Bestehenden Wert ersetzen
                case 'replace':
                    cfg.context[cfg.target] = cfg.value;
                    break;

                // zum Array hinzufügen
                case 'append':
                    if (kijs.isArray(cfg.context[cfg.target])) {
                        if (kijs.isArray(cfg.value)) {
                            cfg.context[cfg.target] = kijs.Array.concat(cfg.context[cfg.target], cfg.value);
                        } else if (cfg.value) {
                            cfg.context[cfg.target].push(cfg.value);
                        }

                    } else {
                        if (kijs.isArray(cfg.value)) {
                            cfg.context[cfg.target] = cfg.value;
                        } else if (cfg.value) {
                            cfg.context[cfg.target] = [cfg.value];
                        }

                    }
                    break;

                // zum Array hinzufügen und duplikate entfernen
                case 'appendUnique':
                    if (kijs.isArray(cfg.context[cfg.target])) {
                        if (kijs.isArray(cfg.value)) {
                            cfg.context[cfg.target] = kijs.Array.concatUnique(cfg.context[cfg.target], cfg.value);
                        } else if (cfg.value) {
                            cfg.context[cfg.target].push(cfg.value);
                            kijs.Array.unique(cfg.context[cfg.target]);
                        }

                    } else {
                        if (kijs.isArray(cfg.value)) {
                            cfg.context[cfg.target] = cfg.value;
                            kijs.Array.unique(cfg.context[cfg.target]);
                        } else if (cfg.value) {
                            cfg.context[cfg.target] = [cfg.value];
                        }

                    }
                    break;

                // Objekt mergen (nur 1. Hierarchiestufe)
                case 'assign':
                    if (kijs.isObject(cfg.context[cfg.target])) {
                        if (kijs.isObject(cfg.value)) {
                            Object.assign(cfg.context[cfg.target], cfg.value);
                        } else if (cfg.value) {
                            throw new Error(`config "${cfg.key}" is not an object`);
                        }
                    } else {
                        if (kijs.isObject(cfg.value)) {
                            cfg.context[cfg.target] = cfg.value;
                        } else if (cfg.value) {
                            throw new Error(`config "${cfg.key}" is not an object`);
                        }
                    }
                    break;
                
                // Objekt mergen (ganze Hierarchie)
                case 'assignDeep':
                    if (kijs.isObject(cfg.context[cfg.target])) {
                        if (kijs.isObject(cfg.value)) {
                            kijs.Object.assignDeep(cfg.context[cfg.target], cfg.value);
                        } else if (cfg.value) {
                            throw new Error(`config "${cfg.key}" is not an object`);
                        }
                    } else {
                        if (kijs.isObject(cfg.value)) {
                            cfg.context[cfg.target] = cfg.value;
                        } else if (cfg.value) {
                            throw new Error(`config "${cfg.key}" is not an object`);
                        }
                    }
                    break;

                // Listeners des "on"-Objekts mergen
                case 'assignListeners':
                    if (kijs.isObject(cfg.value)) {
                        for (let k in cfg.value) {
                            if (k !== 'context') {
                                if (!kijs.isFunction(cfg.value[k])) {
                                    throw new Error('Listener "' + k + '" ist not a function.');
                                }
                                cfg.context.on(k, cfg.value[k], cfg.value.context || cfg.context);
                            }
                        }
                    }
                    break;

                // Funktion ausführen
                case 'function':
                    if (kijs.isFunction(cfg.target)) {
                        cfg.target.call(cfg.context, cfg.value);
                    } else {
                        throw new Error(`config "${cfg.key}" is not a function`);
                    }
                    break;

                // Zuweisung der Eigenschaft verbieten: Fehler ausgeben
                case 'error':
                    throw new Error(`Assignment of config "${cfg.key}" is prohibited`);
                    break;

            }
        }, this);
        tmpConfigs = null;
    }
    
    /**
    * Kopiert alle Eigenschaften des source-Objekts in das target-Objekt (rekursiv)
    * @param {object} target Ziel-Objekt
    * @param {object} source Quell-Objekt
    * @param {boolean} [overwrite=true] Sollen bereits existierende Objekte überschrieben werden?
    * @return {object} Erweiteres Ziel-Objekt
    */
    static assignDeep(target, source, overwrite=true) {
        kijs.Object.each(source, function(key, val){
            
            // Object -> mergen oder überschreiben mit Klon
            if (kijs.isObject(val)) {
                if (kijs.isObject(target[key])) {
                    kijs.Object.assignDeep(target[key], val, overwrite);
                } else {
                    target[key] = kijs.Object.clone(val);
                }
                
            // Array -> überschreiben per Klon
            } else if (kijs.isArray(val)) {
                if (overwrite || target[key] === undefined) {
                    target[key] = kijs.Array.clone(val);
                }
                
            // alles andere (inkl. Funktionen) -> überschreiben
            } else {
                if (overwrite || target[key] === undefined) {
                    target[key] = val;
                }
                
            }
        }, this);

        return target;
    }
    
    /**
     * Klont das übergebene Objekt
     * @param {Object} object
     * @returns {Object}
     */
    static clone(object) {
        return JSON.parse(JSON.stringify(object));
    }
    
    /**
     * Durchläuft ein Objekt ruft pro Element die callback-Funktion auf.
     * Die Iteration kann durch die Rückgabe von false gestoppt werden.
     * @param {Object} object
     * @param {Function} fn - Callback Funktion
     * @param {Object} context - Gültigkeitebereich
     * @returns {undefined}
     */
    static each(object, fn, context) {
        for (let key in object) {
            if (object.hasOwnProperty(key)) {
                if (fn.call(context, key, object[key]) === false) {
                    return;
                }
            }
        }
    }

};
/* global kijs */

// --------------------------------------------------------------
// kijs.Date (Static)
// --------------------------------------------------------------
/*
 * Datumsformatierung
 * ------------------
 * date.format(date, 'd.m.Y H:i', de);
 * 
 * Tag
 * d   Tag des Monats, 2-stellig mit führender Null  01 bis 31
 * D   Wochentag, gekürzt auf zwei Buchstaben  Mo bis So
 * j   Tag des Monats ohne führende Nullen    1 bis 31
 * l   (kleines 'L') Ausgeschriebener Wochentag Montag bis Sontag
 *
 * Monat
 * F   Monat als ganzes Wort, wie Januar bis Dezember
 * m   Monat als Zahl, mit führenden Nullen  01 bis 12
 * M   Monatsname mit drei Buchstaben  Jan bis Dez
 * n   Monatszahl, ohne führende Nullen  1 bis 12
 *
 * Woche
 * W  ISO-8601 Wochennummer des Jahres, die Woche beginnt am Montag
 *
 * Jahr
 * Y   Vierstellige Jahreszahl  Beispiele: 1999 oder 2003
 * y   Jahreszahl, zweistellig  Beispiele: 99 oder 03
 * L   Schaltjahr oder nicht  1 für ein Schaltjahr, ansonsten 0
 *
 * Uhrzeit
 * G   Stunde im 24-Stunden-Format, ohne führende Nullen  0 bis 23
 * H   Stunde im 24-Stunden-Format, mit führenden Nullen  00 bis 23
 * i   Minuten, mit führenden Nullen  00 bis 59
 * s   Sekunden, mit führenden Nullen  00 bis 59
 */
kijs.Date = class kijs_Date {
    

    // --------------------------------------------------------------
    // STATIC GETTERS / SETTERS
    // --------------------------------------------------------------
    static get weekdays() {
        return {
            en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            de: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
            fr: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
        };
    }

    static get weekdays_short() {
        return {
            en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            de: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
            fr: ['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa']
        };
    }

    static get months() {
        return {
            en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            de: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
            fr: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
        };
    }

    static get months_short() {
        return {
            en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            de: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
            fr: ['JAN', 'FÉV', 'MAR', 'AVR', 'MAI', 'JUN', 'JUL', 'AOÛ', 'SEP', 'OCT', 'NOV', 'DÉC']
        };
    }
    
    
    // --------------------------------------------------------------
    // STATICS
    // --------------------------------------------------------------
    /**
     * Addiert oder subtrahiert Tage zu einem Datum
     * @param {Date} date
     * @param {Number} days
     * @returns {Date}
     */
    static addDays(date, days) {
        const ret = new Date(date.valueOf());
        ret.setDate(ret.getDate() + days);
        return ret;
    }
    
    /**
     * Addiert oder subtrahiert Monate zu einem Datum
     * @param {Date} date
     * @param {Number} months
     * @returns {Date}
     */
    static addMonths(date, months) {
        const ret = new Date(date.valueOf());
        ret.setMonth(ret.getMonth() + months);
        return ret;
    }
    
    /**
     * Addiert oder subtrahiert Jahre zu einem Datum
     * @param {Date} date
     * @param {Number} yars
     * @returns {Date}
     */
    static addYears(date, yars) {
        const ret = new Date(date.valueOf());
        ret.setFullYear(ret.getFullYear() + yars);
        return ret;
    }
    
    /**
     * Klont ein Datumsobjekt
     * @param {Date} date
     * @returns {Date}
     */
    static clone(date) {
        return new Date(date.getTime());
    }

    /**
     * Vergleicht zwei Datumswerte und gibt bei identischem Wert true zurück
     * @param {Date|Null} date1
     * @param {Date|Null} date2
     * @returns {Boolean}
     */
    static compare(date1, date2) {
        if (date1 instanceof Date !== date2 instanceof Date) {
            return false;
        }
        
        if (date1 instanceof Date) {
            return date1.getTime() === date2.getTime();
        } else {
            return date1 === date2;
        }
    }

    /**
     * Erstellt ein Datum aus
     *  - Datum: Datum wird geklont
     *  - Unix-Zeitstempel (Sekunden)
     *  - SQL-Datums-String "2017-01-01 10:00:00"
     *  - Deutscher Datums-String "01.04.2017"
     *  - Deutscher Wochen-String "KW 4 2017"
     *  - Array mit folgenden Werten [Jahr, Monat, Tag, Stunden, Minuten, Sekunden]
     *  @param {String|Date|Number} arg
     * @returns {Date|Null}
     */
    static create(arg) {
        let ret = null;

        // Date übergeben: Klonen
        if (arg instanceof Date) {
            ret = this.clone(arg);
            
        // Unix-Zeitstempel (Sekunden)
        } else if (kijs.isNumber(arg)) {
            ret = new Date(arg*1000);

        // SQL-Zeitstempel '2017-01-01' oder '2017-01-01 10:00:00'
        } else if (kijs.isString(arg) && arg.match(/^[0-9]{4}-[0-9]{2}-[0-9]{2}/)) {
            ret = this.getDateFromSqlString(arg);

        // Deutsches Datum (d.m.Y) Beispiele: '1.1.16', '01.04.2017', '2.4', '02.04.', '06', '6.'
        // Falls Teile des Datums weggelassen wedrden, wird der aktuelle Monat/Jahr genommen.
        } else if (kijs.isString(arg) && arg.match(/^[0-9]{1,2}\.?([0-9]{1,2}\.?([0-9]{2,4})?)?/)) {
            ret = this.getDateFromGermanString(arg);

        // Woche
        // Beispiel: 'Woche 3 2017', 'W3 17', 'Wo 3 2017' 
        } else if (kijs.isString(arg) && arg.match(/^[^0-9]+[0-9]{1,2}[^0-9]?([0-9]{2,4})?/)) {
            ret = this.getDateFromWeekString(arg);
            
        // Array
        // Beispiele: [2018, 05, 26, 14, 57, 12] => "2018-05-26 14:57:12"
        //            [2018, 05] => "2018-05-01 00:00:00"
        //            [2018] => "2018-01-01 00:00:00"
        } else if (kijs.isArray(arg) && arg.length > 0) {
            let year = parseInt(arg[0]);
            let month = 1;
            let day = 1;
            let hour = 0;
            let minute = 0;
            let second = 0;
            
            if (arg.length > 1) month = parseInt(arg[1]);
            if (arg.length > 2) day = parseInt(arg[2]);
            if (arg.length > 3) hour = parseInt(arg[3]);
            if (arg.length > 4) minute = parseInt(arg[4]);
            if (arg.length > 5) second = parseInt(arg[5]);

            ret = new Date(year, month-1, day, hour, minute, second);
        }
        
        // Ist das Datum ungültig?
        if (ret && isNaN(ret.valueOf())) {
            ret = null;
        }
        
        return ret;
    }
    
    /**
     * Gibt ein formatierter Datumsstring zurück.
     * Parameterliste siehe PHP
     * @param {Date} date
     * @param {String} format
     * @param {String} languageId
     * @returns {String}
     */
    static format(date, format, languageId) {
        const _this = this;
        format = format + '';
        this.languageId = languageId || 'de';
        return format.replace(/[a-zA-Z]/g, function(letter){
            return _this.__formatReplace(letter, date, languageId);
        });
    }
    
    /**
     * Konvertiert ein Datum im Format 'd.m.Y' oder 'd.m.Y h:i:s' in ein Datum-Objekt
     * Die Uhrzeit kann hinten mit einem Leerzeichen getrennt angehängt werden. Sie muss mind. ein : enthalten, 
     * damit sie als Uhrzeit erkannt wird.
     * Beispiele: '1.1.16', '01.04.2017', '2.4', '02.04.', '06', '6.'
     * Beispiele mit Zeit: '1.1.16 20:00', '01.04.2017 20:00:05', '2.4 8:5', '20:07'
     * @param {String} strDate
     * @returns {Date}
     */
    static getDateFromGermanString(strDate) {
        const args = strDate.split(' ');
        let argsTmp;
        let strTime = '';

        // Teil 1 (kann Datum oder Uhrzeit sein
        if (args.length >= 1) {
            // Handelt es sich um eine Uhrzeit?
            if (args[0].indexOf(':') >= 0) {
                strTime = args[0];
            } else {
                strDate = args[0];
            }
        }

        // Teil 2 (kann nur Uhrzeit sein
        if (args.length >= 2) {
            if (args[1].indexOf(':') >= 0) {
                strTime = args[1];
            }
        }
        
        // Datum ermitteln
        argsTmp = strDate.split('.');
        let day = argsTmp.length >= 1 && argsTmp[0] ? parseInt(argsTmp[0]) : (new Date).getDate();
        let month = argsTmp.length >= 2 && argsTmp[1] ? parseInt(argsTmp[1]) : (new Date).getMonth()+1;
        let year = argsTmp.length >= 3 && argsTmp[2] ? parseInt(argsTmp[2]) : (new Date).getFullYear();
        
        // Kurzschreibweisen vom Jahr konventieren
        if (year < 100) {
            if (year < 70) {
                year += 2000;
            } else if (year >= 70) {
                year += 1900;
            }
        }
        
        // Uhrzeit ermitteln
        argsTmp = strTime.split(':');
        let hours = argsTmp.length >= 2 ? parseInt(argsTmp[0]) : 0;
        let minutes = argsTmp.length >= 2 ? parseInt(argsTmp[1]) : 0;
        let seconds = argsTmp.length >= 3 ? parseInt(argsTmp[2]) : 0;

        return new Date(year, month-1, day, hours, minutes, seconds, 0);
    }
    
    /**
     * Konvertiert eine Wochennummer ein Datum-Objekt
     * Format: [A-Z ]+([0-9]+) ([0-9]+)
     *         Prefix  Woche   Jahr
     *  
     * Es muss mit einem beliebigen String begonnen werden. 
     * Darauf folgt die Wochen-Nr und mit einem Leerzeichen getrennt das Jahr.
     * Anschliessend können noch andere Texte/Zahlen/Zeichen sein, diese werden aber ignoriert.
     * Beispiele: 'Woche 4 2017', 'W4 17', 'W 4 2017', 'Wo 4 17'
     * Weitere Beispiele: 'Wo 4 2017 vom 23.01.2017'
     * @param {String} strWeek
     * @returns {Date}  Datum des Montags der gewählten Woche
     */
    static getDateFromWeekString(strWeek) {
        const matches = strWeek.match(/^[^0-9]+([0-9]{1,2})[^0-9]?([0-9]{2,4})?/);
        const week = parseInt(matches[1]);
        let year = matches[2] ? parseInt(matches[2]) : (new Date).getFullYear();
        
        // Kurzschreibweisen vom Jahr konventieren
        if (year < 100) {
            if (year < 70) {
                year += 2000;
            } else if (year >= 70) {
                year += 1900;
            }
        }
        
        return this.getFirstOfWeek(week, year);
    }
    
    /**
     * Konvertiert ein SQL-Datum im Format '2016-01-01' oder '2016-01-01 08:55:00' in ein Datum-Objekt
     * @param {String} sqlDate
     * @returns {Date}
     */
    static getDateFromSqlString(sqlDate) {
        let year = parseInt(sqlDate.substr(0,4));
        let month = parseInt(sqlDate.substr(5,2));
        let day = parseInt(sqlDate.substr(8,2));
        let hours = 0;
        let minutes = 0;
        let seconds = 0;

        if (sqlDate.length > 10) {
            hours = parseInt(sqlDate.substr(11,2));
            minutes = parseInt(sqlDate.substr(14,2));
            seconds = parseInt(sqlDate.substr(17,2));
        }

        return new Date(year, month-1, day, hours, minutes, seconds, 0);
    }
    
    /**
     * Gibt ein Datum ohne Uhrzeit zurück
     * @param {Date} date
     * @returns {Date}
     */
    static getDatePart(date) {
        return new Date(date.getFullYear(),date.getMonth(),date.getDate());
    }
    
    /**
     * Gibt das Datum des ersten Tags eines Monats zurück
     * @param {Date} date
     * @returns {Date} letztes Datum des Monats
     */
    static getFirstOfMonth(date) {
        return new Date(date.getFullYear(), date.getMonth(), 1);
    }
    
    /**
     * Gibt das Datum des ersten Tags einer Kalenderwoche nach ISO-8601 zurück
     * @param {Number} week
     * @param {Number} year
     * @returns {Date} Montag der Woche
     */
    static getFirstOfWeek(week, year) {
        // Der 4. Januar ist immer in der ersten Woche
        let date = new Date(year, 0, 4, 0, 0, 0, 0);
        
        // Montag dieser Woche ermitteln
        date = this.getMonday(date);
        
        // Wochen addieren
        return this.addDays(date, (week-1) * 7);
    }
    
    /**
     * BUG: Rechnet die Sommerzeit falsch. Deshalb wurde diese Funktion ersetzt.
     * Gibt das Datum des ersten Tags einer Kalenderwoche nach ISO-8601 zurück
     * @param {Number} week
     * @param {Number} year
     * @returns {Date} Montag der Woche
     */
    /*static getFirstOfWeek_OLD(week, year) {
        // Der 4. Januar ist immer in der ersten Woche
        let u = parseInt(Date.UTC(year,0,4,0,0,0,0)/1000), d = new Date(u*1000).getUTCDay();
        // Auf den Montag zurückrechnen
        if (d > 1) {
            u -= (d - 1) * 3600 * 24;
        }
        if (d === 0) {
            u -= 6 * 3600 * 24;
        }
        // Wochen dazuzählen
        u += (week-1) * (7 * 24 * 3600);

        return new Date(this.create(u));
    }*/
    
    /**
     * Gibt das Datum des letzten Tags eines Monats zurück
     * @param {Date} date
     * @returns {Date} letztes Datum des Monats
     */
    static getLastOfMonth(date) {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0);
    }
    
    /**
     * Gibt das Datum des ersten Tags (Montag) einer Kalenderwoche nach ISO-8601 zurück
     * @param {Date} date Beliebiges Datum in der Woche
     * @returns {Date} Montag der Woche
     */
    static getMonday(date) {
        const day = date.getDay(),
            diff = date.getDate() - day + (day === 0 ? -6:1);
        return new Date(date.setDate(diff));
    }
    
    /**
     * Gibt den Namen eines Monats zurück
     * @param {Date} date                   Datum
     * @param {String} [languageId='de']    Gewünschte Sprache
     * @param {Boolean} [short=false]       Kurzform
     * @returns {String}
     */
    static getMonthName(date, languageId, short) {
        languageId = languageId || 'de';
        if (short) {
            return this.months_short[languageId][date.getMonth()];
        } else {
            return this.months[languageId][date.getMonth()];
        }
    }

    /**
     * Gibt zurück, ob ein Jahr nach ISO-8601 52 oder 53 Wochen hat.
     * @param {Number} year
     * @returns {Number}
     */
    static getNumberOfWeeks(year) {
        const fd = new Date(year,0,1).getDay(); // first day
        const ld = new Date(year,11,31).getDay(); // last day
        const ly = this.isLeapYear(new Date(year, 0, 1)); //leap year
        if (ly) {
            if (fd === 3 && ld === 4) return 53;
            if (fd === 4 && ld === 5) return 53;
        } else {
            if (fd === 4 && ld === 4) return 53;
        }
        return 52;
    }
    
    /**
     * Gibt das Datum des letzten Tags (Sonntag) einer Kalenderwoche nach ISO-8601 zurück
     * @param {Date} date Beliebiges Datum in der Woche
     * @returns {Date} Sonntag der Woche
     */
    static getSunday(date) {
        const f = this.getMonday(date);
        f.setDate(f.getDate()+6);
        return f;
    }
    
    /**
     * Gibt den Namen eines Wochentags zurück
     * @param {Date} date                   Datum
     * @param {String} [languageId='de']    Gewünschte Sprache
     * @param {Boolean} [short=false]       Kurzform
     * @returns {String}
     */
    static getWeekday(date, languageId, short) {
        languageId = languageId || 'de';
        if (short) {
            return this.weekdays_short[languageId][date.getDay()];
        } else {
            return this.weekdays[languageId][date.getDay()];                
        }
    }
    
    /**
     * Gibt die ISO-8601 Wochennummer zurück
     * @param {Date} date
     * @return {Number} 1 to 53
     */
    static getWeekOfYear(date) {
        // adapted from http://www.merlyn.demon.co.uk/weekcalc.htm
        const ms1d = 864e5;    // milliseconds in a day
        const ms7d = 7 * ms1d; // milliseconds in a week
            
        const DC3 = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate() + 3) / ms1d; // an Absolute Day Number
        const AWN = Math.floor(DC3 / 7); // an Absolute Week Number
        const Wyr = new Date(AWN * ms7d).getUTCFullYear();

        return AWN - Math.floor(Date.UTC(Wyr, 0, 7) / ms7d) + 1;
    }
    
    /**
     * Gibt zurück, ob das Datum in einem Schaltjahr liegt
     * @param {Date} date
     * @returns {Boolean}
     */
    static isLeapYear(date) {
        const year = date.getFullYear();
        return !!((year & 3) === 0 && (year % 100 || (year % 400 === 0 && year)));
    }

    /**
     * Gibt die Anzahl Sekunden seit dem 01.01.1970 zurück
     * @param {Date} date
     * @returns {Number}
     */
    static unixTimestamp(date) {
        return parseInt(date.getTime() / 1000);
    }
    
    
    // PRIVATE
    static __formatReplace(letter, date, languageId) {
        switch (letter) {
            // Tag
            // d  Tag des Monats, 2-stellig mit führender Null  01 bis 31
            case 'd': return kijs.String.padding(date.getDate(), 2, '0', 'left');
            // D  Wochentag, gekürzt auf zwei Buchstaben  Mo bis So
            case 'D': return this.getWeekday(date, languageId, true);
            // j  Tag des Monats ohne führende Nullen  1 bis 31
            case 'j': return date.getDate();
            // l (kleines 'L')  Ausgeschriebener Wochentag  Montag bis Sontag
            case 'l': return this.getWeekday(date, languageId, false);
            
            // Monat
            // F  Monat als ganzes Wort, wie Januar bis Dezember
            case 'F': return this.getMonthName(date, languageId, false);
            // m  Monat als Zahl, mit führenden Nullen  01 bis 12
            case 'm': return kijs.String.padding(date.getMonth()+1, 2, '0', 'left');
            // M  Monatsname mit drei Buchstaben  Jan bis Dez
            case 'M': return this.getMonthName(date, languageId, true);
            // n  Monatszahl, ohne führende Nullen  1 bis 12
            case 'n': return (date.getMonth()+1);

            // Woche
            // W  ISO-8601 Wochennummer des Jahres, die Woche beginnt am Montag
            case 'W': return kijs.String.padding(this.getWeekOfYear(date), 2, '0', 'left');

            // Jahr                
            // Y  Vierstellige Jahreszahl  Beispiele: 1999 oder 2003
            case 'Y': return date.getFullYear();
            // y  Jahreszahl, zweistellig  Beispiele: 99 oder 03
            case 'y': return (date.getFullYear() + '').substr(2);
            // L  Schaltjahr oder nicht  1 für ein Schaltjahr, ansonsten 0
            case 'L': return this.isLeapYear(date) ? '1' : '0';

            // Uhrzeit
            // G  Stunde im 24-Stunden-Format, ohne führende Nullen  0 bis 23
            case 'G': return date.getHours();
            // H  Stunde im 24-Stunden-Format, mit führenden Nullen  00 bis 23
            case 'H': return kijs.String.padding(date.getHours(), 2, '0', 'left');
            // i  Minuten, mit führenden Nullen  00 bis 59
            case 'i': return kijs.String.padding(date.getMinutes(), 2, '0', 'left');
            // s  Sekunden, mit führenden Nullen  00 bis 59
            case 's': return kijs.String.padding(date.getSeconds(), 2, '0', 'left');

            default: return letter;
        }
    }
};


/* global kijs */

// --------------------------------------------------------------
// kijs.Dom (Static)
// --------------------------------------------------------------
kijs.Dom = class kijs_Dom {
    
    // --------------------------------------------------------------
    // STATICS GETTERS
    // --------------------------------------------------------------
    /**
     * Array mit den Propertys, die nicht direkt gesetzt werden können (node.Eigenschaft = Wert), sondern
     * via die Funktion node.setAttribute(Eigenschaft, Wert) gesetzt werden müssen.
     * @returns {Array}
     */
    //static get murgsPropertyNames() { return ['for']; }


    // --------------------------------------------------------------
    // STATICS
    // --------------------------------------------------------------
    
    // Static Properties in this Class
    //__scrollbarWidth {Number|Null}    Damit die Funktion getScrollbarWidth() nur einmal rechnen muss, 
    //                                  wird das ergebnis hier gemerkt.
    
    /**
     * Lesen einer Eigenschaft eines Nodes.
     * Dabei werden Murgs-Attribute automatisch anders gelesen.
     * @param {HTMLElement} node
     * @param {String} name
     * @returns {String|Null|Booelan|Undefined}
     */
    /*static getAttribute(node, name) {
        // Murgs-Attribute
        if (kijs.Array.contains(this.murgsPropertyNames, name)) {
            if (node.hasAttribute(name)) {
                return node.getAttribute(name);
            } else {
                return null;
            }
            
        // Normale Attribute
        } else {
            return node[name];
            
        }
    }*/
    
    /**
     * Zuweisen einer Eigenschaft zu einem node. 
     * Dabei werden Murgs-Attribute automatisch anders zugewiesen.
     * @param {HTMLElement} node
     * @param {String} name
     * @param {String|Null|Boolean|Undefined} value
     * @returns {undefined}
     */
    /*static setAttribute(node, name, value) {
        // Murgs-Attribute müssen über node.setAttribute(name, value) gesetzt werden.
        if (kijs.Array.contains(this.murgsPropertyNames, name)) {
            if (!kijs.isEmpty(value)) {
                node.setAttribute(name, value);
            } else {
                node.removeAttribute(name);
            }
            
        // alle anderen können normal zugewiesen werden
        } else {
            node[name] = value;
            
        }
    }*/
    
    /**
     * Überprüft ob ein Node über eine Eigenschaft verfügt.
     * Dabei werden Murgs-Attribute automatisch anders gelesen.
     * @param {HTMLElement} node
     * @param {String} name
     * @returns {Boolean}
     */
    /*static hasAttribute(node, name) {
        // Murgs-Attribute
        if (kijs.Array.contains(this.murgsPropertyNames, name)) {
            return node.hasAttribute(name);
            
        // Normale Attribute
        } else {
            return kijs.isEmpty(node[name]);
            
        }
    }*/
    
    
    /**
     * Erstellt einen Event-Listener auf ein HTMLElement
     * 
     * Die Delegates werden dann in der Eigenschaft context._nodeEventListeners gespeichert,
     * damit kann dann ein Listener später auch wieder entfernt werden.
     *  
     * context._nodeEventListeners: {
     *     click: [
     *         {node: ..., useCapture: true/false, delegate: ...},
     *         {node: ..., useCapture: true/false, delegate: ...}
     *     ],
     *     
     *     mousemove: [
     *         {node: ..., useCapture: true/false, delegate: ...},
     *         {node: ..., useCapture: true/false, delegate: ...}
     *     ]
     * }
     * 
     * @param {String} eventName Name des DOM-Events
     * @param {HTMLElement} node DOM-Node
     * @param {Function|String} fn  Funktion oder Name des kijs-Events das ausgelöst werden soll
     * @param {kijs.Observable} context
     * @param {Boolean} [useCapture=false] false: Event wird in Bubbeling-Phase ausgelöst
     *                                     true:  Event wird in Capturing-Phase ausgelöst
     * @returns {undefined}
     */
    static addEventListener(eventName, node, fn, context, useCapture) {
        useCapture = !!useCapture;
        
        context._nodeEventListeners = context._nodeEventListeners || {};
        context._nodeEventListeners[eventName] = context._nodeEventListeners[eventName] || [];
        
        // Wenn noch kein Delegate existiert: eines erstellen
        if (!this.hasEventListener(eventName, node, context, useCapture)) {
            let delegate = null;
            
            // Falls keine Funktion, sondern ein kijs-Eventname übergeben wurde, so wird ein kijs-Event ausgelöst
            if (kijs.isString(fn)) {
                let kijsEventName = fn;
                delegate = function(e) {
                    return context.raiseEvent(kijsEventName, {
                        eventName: kijsEventName,
                        nodeEventName: eventName,
                        useCapture: useCapture,
                        nodeEvent: e,
                        context: context
                    }, this);
                };
            } else if (kijs.isFunction(fn)) {
                delegate = function(e) {
                    return fn.apply(context, [{ 
                        nodeEventName: eventName,
                        useCapture: useCapture,
                        nodeEvent: e,
                        context: context
                    }]);
                };
                
            } else {
                throw new Error(`Parameter "fn" can not be empty`);
            }

            context._nodeEventListeners[eventName].push({node:node, useCapture:useCapture, delegate:delegate });
            node.addEventListener(eventName, delegate, useCapture);
        }
    }
    
    
    /**
     * Gibt die absolute Position eines HTMLElements bezogen zum Browserrand zurück
     * @param {HTMLElement} node
     * @returns {Object} im Format {x: 100, y: 80, w: 20, h: 40}
     */
    static getAbsolutePos(node) {
        let x = 0;
        let y = 0;
        let w = node.offsetWidth;
        let h = node.offsetHeight;
        
        while (!!node) {
            x += node.offsetLeft - node.scrollLeft;
            y += node.offsetTop - node.scrollTop;
            node = node.offsetParent;
        }
        return {x: x,y: y, w: w, h: h};        
    }
    
    /**
     * Gibt das erste untegeordnete Element zurück, dass Selektiert werden kann (tabIndex >= 0).
     *     tabIndex -1: nur via focus() Befehl fokussierbar
     *     tabIndex  0: Fokussierbar - Browser betimmt die Tabreihenfolge
     *     tabIndex >0: Fokussierbar - in der Reihenfolge wie der tabIndex
     * @param {HTMLElement} node
     * @returns {HTMLElement|Null}
     */
    static getFirstFocusableNode(node) {
        let subNode = null;
        
        if (node.tabIndex >= 0) {
            return node;
            
        } else {
            if (node.hasChildNodes()) {
                for (let i=0, len=node.children.length; i<len; i++) {
                    subNode = this.getFirstFocusableNode(node.children[i]);
                    if (subNode) {
                        return subNode;
                    }
                }
            }
        }
        
        return null;
    }
    
    /**
     * Berechnet die Breite einer Scrollbar und gibt diese zurück
     * @returns {Number}
     */
    static getScrollbarWidth() {
        // Scrollbarbreite berechnen, falls noch nicht geschehen
        if (!this.__scrollbarWidth) {
            // Siehe https://stackoverflow.com/questions/13382516/getting-scroll-bar-width-using-javascript#13382873
            const outer = document.createElement("div");
            outer.style.visibility = "hidden";
            outer.style.width = "100px";
            outer.style.msOverflowStyle = "scrollbar"; // needed for WinJS apps

            document.body.appendChild(outer);

            const widthNoScroll = outer.offsetWidth;
            // Scrollbar einschalten
            outer.style.overflow = "scroll";

            // inner-DIV einfügen
            const inner = document.createElement("div");
            inner.style.width = "100%";
            outer.appendChild(inner);        
            
            const widthWithScroll = inner.offsetWidth;

            // Aufräumen
            outer.parentNode.removeChild(outer);

            // Breite der Scrollbar berechnen
            this.__scrollbarWidth = widthNoScroll - widthWithScroll;
        }
        
        return this.__scrollbarWidth;
    }
    
    /**
     * Überprüft, ob ein Event-Listener auf ein HTMLElement existiert
     * @param {String} eventName Name des DOM-Events
     * @param {HTMLElement} node DOM-Node
     * @param {kijs.Observable} context
     * @param {Boolean} [useCapture=false] false: Event wird in Bubbeling-Phase ausgelöst
     *                                     true:  Event wird in Capturing-Phase ausgelöst
     * @returns {undefined}
     */
    static hasEventListener(eventName, node, context, useCapture) {
        useCapture = !!useCapture;
        
        context._nodeEventListeners = context._nodeEventListeners || {};
        context._nodeEventListeners[eventName] = context._nodeEventListeners[eventName] || [];
        
        // Ist der Listener bereits vorhanden?
        let ret = false;
        if (context._nodeEventListeners[eventName]) {
            kijs.Array.each(context._nodeEventListeners[eventName], function(listener) {
                if (listener.node === node && listener.useCapture === useCapture) {
                    ret = true;
                    return false;
                }
            }, this);
        }
        
        return ret;
    }
    
    /**
     * Konvertiert einen HTML-String in einen String, in dem die HTML-Zeichen als Unicode eingebunden sind
     * Es werden folgende Zeichen ersetzt
     *  - Unicode 00A0 - 9999
     *  - < und >
     *  - &
     * Beispiel: '<p>Test</p>' => '&#60;p&#62;Test&#60;/p&#62;'
     * @param {type} html
     * @returns {String}
     */
    static htmlentities(html) {
        return (html+'').replace(/[\u00A0-\u9999<>\&]/gim, function(i) {
            return '&#'+i.charCodeAt(0)+';';
        });
    }
    
    /**
     * Fügt einen Node in den Dom ein, direkt nach einem anderen Knoten
     * @param {HTMLElement} node
     * @param {HTMLElement} targetNode
     * @returns {undefined}
     */
    static insertNodeAfter(node, targetNode) {
        targetNode.parentNode.insertBefore(node, targetNode.nextSibling);
    }
    
    /**
     * Schaut, ob ein Node ein Kindknoten (oder Grosskind, etc.) von einem anderen Node ist (rekursiv).
     * @param {HTMLElement} childNode
     * @param {HTMLElement} parentNode
     * @param {Boolean} [sameAlso=false] Soll bei childNode===parentNode auch true zurückgegeben werden?
     * @returns {Boolean}
     */
    static isChildOf(childNode, parentNode, sameAlso) {
        if (childNode === parentNode) {
            return !!sameAlso;
        }

        if (childNode.parentNode) {
            if (this.isChildOf(childNode.parentNode, parentNode, true)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Entfernt alle Event-Listeners eines Context
     * @param {kijs.Observable} context
     * @returns {undefined}
     */
    static removeAllEventListenersFromContext(context) {
        if (!kijs.isEmpty(context._nodeEventListeners)) {
            kijs.Object.each(context._nodeEventListeners, function(eventName, listeners) {
                kijs.Array.each(listeners, function(listener) {
                    listener.node.removeEventListener(eventName, listener.delegate, listener.useCapture);
                }, this);
            }, this);
        }
        
        context._nodeEventListeners = {};
    }
    
    
    /**
     * Entfernt einen Event-Listener von einem HTMLElement
     * @param {String} eventName
     * @param {HTMLElement} node
     * @param {kijs.Observable} context
     * @param {Boolean} [useCapture=false] false: Event wird in Bubbeling-Phase ausgelöst
     *                                     true:  Event wird in Capturing-Phase ausgelöst
     * @returns {undefined}
     */
    static removeEventListener(eventName, node, context, useCapture) {
        useCapture = !!useCapture;
        
        context._nodeEventListeners = context._nodeEventListeners || {};
        context._nodeEventListeners[eventName] = context._nodeEventListeners[eventName] || [];
        
        // Delegate ermitteln und Listener aus Array entfernen
        let delegate = null;
        if (!kijs.isEmpty(context._nodeEventListeners[eventName])) {
            const arr = [];
            
            kijs.Array.each(context._nodeEventListeners[eventName], function(listener) {
                if (listener.node === node && listener.useCapture === useCapture) {
                    delegate = listener.delegate;
                } else {
                    arr.push(listener);
                }
            }, this);
            
            context._nodeEventListeners[eventName] = arr;
        }
        
        // Listener entfernen
        if (delegate) {
            node.removeEventListener(eventName, delegate, useCapture);
        }
    }
    
    
    /**
     * Fügt html-Code in einen Node. Je nach htmlDisplayType geschieht dies auf unterschiedliche Weise.
     * Bereits vorhandener Inhalt wird gelöscht.
     * @param {HTMLELement} node
     * @param {String} html
     * @param {String} htmlDisplayType [optional]   'html': als html-Inhalt (innerHtml)
     *                                              'code': Tags werden als als Text angezeigt
     *                                              'text': Tags werden entfernt
     * @returns {undefined}
     */
    static setInnerHtml(node, html, htmlDisplayType) {
        html = kijs.isEmpty(html) ? '' : html;
        
        switch (htmlDisplayType) {
            case 'code':
                this.removeAllChildNodes(node);
                node.appendChild(document.createTextNode(html));
                break;
                
            case 'text': 
                let d = document.createElement('div');
                d.innerHTML = html;
                node.innerHTML = d.textContent || d.innerText || '';
                d = null;
                break;
            
            case 'html':
            default:
                node.innerHTML = html; 
                break;
        }
    }
    
    
    /**
     * Entfernt alle Unterelemente eines DOM-Elements
     * @param {HTMLElement} node
     */
    static removeAllChildNodes(node) {
        while (node.hasChildNodes()) {
            node.removeChild(node.lastChild);
        }
    }
};

/* global kijs */

// --------------------------------------------------------------
// kijs.Grafic (Static)
// --------------------------------------------------------------
kijs.Grafic = class kijs_Grafic {


    // --------------------------------------------------------------
    // STATICS
    // --------------------------------------------------------------
    /**
     * Gibt die Positionierung für ein Rechteck zurück, wenn dieses anhand eines anderen Rechtecks positioniert werden soll
     * @param {Object} rect im Format: {x:..., y:..., w:..., h:...}
     * @param {Object} targetRect im Format: {x:..., y:..., w:..., h:...}
     * @param {String} [targetPos='bl'] Ankerpunkt beim Zielelement
     *                                   tl --- t --- tr
     *                                   |             |
     *                                   l      c      r
     *                                   |             |
     *                                   bl --- b --- br 
     * 
     * @param {String} [pos='tl'] Ankerpunkt beim neuen Element
     * @param {Number} [offsetX=0]
     * @param {Number} [offsetY=0]
     * @returns {Object} {x:..., y:..., w:..., h:...}
     */
    static alignRectToRect(rect, targetRect, targetPos, pos, offsetX, offsetY) {
        const ret = {
            x: rect.x,
            y: rect.y,
            w: rect.w,
            h: rect.h
        };
        targetPos = targetPos || 'bl';
        pos = pos || 'tl';
        
        offsetX = offsetX || 0;
        offsetY = offsetY || 0;
        
        // Position des Zielankers ermitteln
        const tAnchor = this.getAnchorPos(targetRect, targetPos);
        
        // Position des Element-Ankers ermitteln
        const eAnchor = this.getAnchorPos({x:0, y:0, w:rect.w, h:rect.h}, pos);
        
        ret.x = tAnchor.x - eAnchor.x + offsetX;
        ret.y = tAnchor.y - eAnchor.y + offsetY;
        
        return ret;
    }
    
    
    /**
     * Gibt die Position eines Ankers zu einem Rechteck zurück
     * @param {Object} rect       Rechteck  im Format: {x:..., y:..., w:..., h:...}
     * @param {String} [pos='tl'] Ankerpunkt
     *                            tl --- t --- tr
     *                            |             |
     *                            l      c      r
     *                            |             |
     *                            bl --- b --- br 
     * @returns {Object} Position im Format {x:..., y:...}
     */
    static getAnchorPos(rect, pos) {
        const ret = { x: 0, y: 0 };
        
        // Y-Achse oben
        if (pos.indexOf('t') !== -1) {
            ret.y = rect.y;
            
        // Y-Achse unten
        } else if (pos.indexOf('b') !== -1) {
            ret.y = rect.y + rect.h;
            
        // Y-Achse mitte
        } else {
            ret.y = rect.y + Math.floor(rect.h / 2);
            
        }
        
        // X-Achse links
        if (pos.indexOf('l') !== -1) {
            ret.x = rect.x;
            
        // X-Achse rechts
        } else if (pos.indexOf('r') !== -1) {
            ret.x = rect.x + rect.w;
            
        // X-Achse mitte
        } else {
            ret.x = rect.x + Math.floor(rect.w / 2);
            
        }

        return ret;
    }
    
    
    /**
     * Schaut ob ein Rechteck in einem anderen Platz hat
     * @param {Object} rect Masse des Rechtecks im Format: {x:..., y:..., w:..., h:...}
     * @param {Object} rectOuter Masse des äusseren Rechtecks im Format: {x:..., y:..., w:..., h:...}
     * @returns {Object} Beispiel: {
     *                              fit: false      // Hat das Rechteck ganz im äusseren platz?
     *                              fitX: false,    // Hat es auf der X-Achse platz?
     *                              fitY: true,     // Hat es auf der Y-Achse platz?
     *                              sizeL: 0,       // Abstand zwischen den linken Rändern der beiden Rechtecke (Minuswert=inneres ragt heraus)
     *                              sizeR: -10,     
     *                              sizeT: 10,      
     *                              sizeB: 0,       
     *                             }
     *                             
     */
    static rectsOverlap(rect, rectOuter) {
        const ret = {};
        
        ret.sizeL = rect.x - rectOuter.x;
        ret.sizeR = (rectOuter.x + rectOuter.w) - (rect.x + rect.w);
        
        ret.sizeT = rect.y - rectOuter.y;
        ret.sizeB = (rectOuter.y + rectOuter.h) - (rect.y + rect.h);
        
        
        ret.fitX = ret.sizeL >= 0 && ret.sizeR >= 0;
        ret.fitY = ret.sizeT >= 0 && ret.sizeB >= 0;
        
        ret.fit = ret.fitX && ret.fitY;
        
        return ret;
    }
    
};
/* global kijs */

// --------------------------------------------------------------
// kijs.Observable (Abstract)
// --------------------------------------------------------------
kijs.Observable = class kijs_Observable {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor() {
        this._events = this._events || {};  // Beispiel: {
                                            //              click: [
                                            //                {
                                            //                  callback: fn, 
                                            //                  context: context
                                            //                },{
                                            //                  callback: fn, 
                                            //                  context: context
                                            //                }
                                            //              ],
                                            //              mouseOver: [
                                            //                {
                                            //                  callback: fn, 
                                            //                  context: context
                                            //                },{
                                            //                  callback: fn, 
                                            //                  context: context
                                            //                }
                                            //              ]
                                            //           }
    }
    

    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    /**
     * Überprüft ob ein Listener existiert
     * @param {String} name                     Name des Listeners
     * @param {function|null} [callback=null]   Callback Funktion oder null für alle
     * @param {object|null} [context=null]      Kontext oder null für alle
     * @returns {Boolean}
     */
    hasListener(name, callback=null, context=null) {
        let listeners = this._events[name];
            
        if (listeners) {
            if (!callback && !context) {
                return true;
                
            } else {
                for (let i=0; i<listeners.length; i++) {
                    let listener = listeners[i];
                    
                    const callbackOk = !callback || callback === listener.callback;
                    const contextOk = !context || context === listener.context;
                    
                    if (callbackOk && contextOk) {
                        return true;
                    }
                }

            }
        }
        
        return false;
    }
    
    /**
     * Entfernt ein oder mehrere Listeners
     * @param {string|array|null} [names] - Name oder Array mit Namen der Listeners oder leer um alle zu löschen.
     *                                
     * @param {function|null} [callback]  - Callback Funktion, deren Listeners gelöscht werden sollen. 
     *                                      Wenn leer, werden alle gelöscht.
     *                                
     * @param {object|null} [context]     - Kontext der Callback Funktion, deren Listeners gelöscht werden sollen.
     *                                      Wenn leer, werden alle gelöscht.
     *                                
     * @returns {undefined}
     */
    off(names=null, callback=null, context=null) {
        
        // Wenn kein Argument übergeben wurde: alle Listeners entfernen
        if (!names && !callback && !context) {
            this._events = {};
            return;
        }
        
        if (kijs.isEmpty(names)) {
            names = Object.keys(this._events);
        } else if (!kijs.isArray(names)) {
            names = [names];
        }
        
        // Listeners duchgehen und wenn sie mit den übergebenen Argumenten übereinstimmen: entfernen
        kijs.Array.each(names, function(name) {
            let skip = false;
            
            // Wenn kein Listener existiert: skip
            let listeners = this._events[name];
            if (!listeners) {
                skip = true;
            }

            // Wenn alle callbacks & context entfernt werden können: entfernen
            if (!skip && !callback && !context) {
                delete this._events[name];
                skip = true;
            }

            // ... sonst nur die listeners entfernen, die den Argumenten entsprechen
            // dafür die Listeners durchgehen und die noch gewünschten merken
            if (!skip) {
                let remaining = [];
                for (let j=0; j<listeners.length; j++) {
                    let listener = listeners[j];
                    if ( (callback && callback !== listener.callback)
                            || (context && context !== listener.context) ) {
                        remaining.push(listener);
                    }
                }

                if (remaining.length) {
                    this._events[name] = remaining;
                } else {
                    delete this._events[name];
                }
            }
        }, this);
    }

    /**
     * Erstellt einen Listener
     * @param {string|array} names - Name oder Array mit Namen des Listeners
     * @param {function} callback - Callback-Funktion oder bei name=Object: Standard-Callback-Fn 
     * @param {object} context - Kontext für die Callback-Funktion
     * @returns {undefined}
     */
    on(names, callback, context) {
        
        names = kijs.isArray(names) ? names : [names];
        
        kijs.Array.each(names, function(name) {
            // Falls der Listener noch nicht existiert: einfügen
            if (!this.hasListener(name, callback, context)) {
                if (!this._events[name]) {
                    this._events[name] = [];
                }
                
                this._events[name].push({
                    callback: callback, 
                    context: context
                });
            }
            
        }, this);
    }

    /**
     * Erstellt einen Listener, der nur einmal ausgeführt wird und sich dann selber wieder entfernt
     * @param {string|array} names - Name oder Array mit Namen des Listeners
     * @param {function} callback - Callback-Funktion oder bei name=Object: Standard-Callback-Fn 
     * @param {object} context - Kontext für die Callback-Funktion
     * @returns {undefined}
     */
    once(names, callback, context) {
        // Wrapper, der anstelle der Callback-Funktion aufgerufen wird.
        // Dieser entfernt den Listener und ruft die Callback-Funktion auf.
        const callbackWrapper = function(e) {
            this.off(names, callbackWrapper, context);
            return callback.apply(context, arguments);
        };
        
        this.on(names, callbackWrapper, this);
    }

    /**
     * Löst einen Event aus
     * @param {string} [name] - Name des Events oder leer um alle Events auszulösen
     * @param {type} [args] - beliebig viele Argumente, die dem Event übergeben werden
     * @returns {Boolean} - Falls ein Listener false zurückgibt, ist die Rückgabe false, sonst true
     */
    raiseEvent(name, ...args) {
        this._events = this._events || {};

        if (kijs.isEmpty(this._events)) {
            return true;
        }

        // Wenn kein Name übergeben wurde: alle Events auslösen
        if (!kijs.isDefined(name)) {
            name = Object.keys(this._events);
        }

        if (!kijs.isArray(name)) {
            name = [name];
        }

        // Listeners durchgehen und auslösen
        const names = name;
        let returnValue = true;
        for (let i=0; i<names.length; i++) {
            name = names[i];
            const listeners = this._events[name];
            if (listeners) {
                for (let j=0; j<listeners.length; j++) {
                    const listener = listeners[j];
                    if (listener.callback.apply(listener.context, args) === false) {
                        returnValue = false;
                    }
                }
            }

        }

        return returnValue;
    }


    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct() {
        this.off();
    }

};
/* global kijs */

// --------------------------------------------------------------
// kijs.Ajax (Static)
// --------------------------------------------------------------
kijs.Ajax = class kijs_Ajax {


    // --------------------------------------------------------------
    // STATICS
    // --------------------------------------------------------------
    /**
    * Führt einen Ajax Request aus
    * 
    * @param {object} config
    *  config Eigenschaften:
    *     {string} url
    *     {object} [parameters]        Objekt mit gewünschten Parametern
    *     {object|string} [postData]   Daten die gesendet werden (nur bei POST)
    *     {string} [method='GET']      'GET' oder 'POST'
    *     {string} [format='json']     'json', 'xml' oder 'text'
    *     {function} fn                Callback Funktion
    *     {object} context             Kontext für die Callback Funktion
    *     {object} [headers]           Objekt mit heders die mitgesendet werden 
    *                                  Bsp: {"content-type":"application/x-www-form-urlencoded; charset=UTF-8"}
    *     {boolean} [disableCaching=false]    Um Antworten aus dem Cache zu verhindern wird ein Parameter
    *                                         'noCache' mit dem aktuellen Timestamp als Wert erstellt 
    * 
    */
    static request(config = {}) {
        let postData;

        config.method = config.method || 'GET';
        config.format = config.format || 'json';
        config.parameters = config.parameters || {};

        if (config.disableCaching) {
            config.parameters.noCache = (new Date()).getTime();
        }

        // Content-Type in den Header schreiben
        if (!config.headers || !config.headers['Content-Type']) {
            let contentType = '';
            switch (config.format) {
                case 'json': contentType = 'application/json'; break;
                case 'xml': contentType = 'application/xml'; break;
                case 'text': contentType = 'text/plain'; break;
            }
            if (contentType) {
                config.headers = config.headers || {};
                config.headers['Content-Type'] = contentType;
            }
        }

        // Bei GET-Requests werden die Parameter an die URL angehängt
        if (config.method === 'GET') {
            const parString = kijs.Ajax.createQueryStringFromObject(config.parameters);
            if (parString) {
                config.url += (/\?/.test(config.url) ? '&' : '?') + parString;
            }
            postData = null;

        } else {
            postData = config.postData || null;
            if (kijs.isObject(postData) || kijs.isArray(postData)) {
                postData = JSON.stringify(postData);
            }

        }

        const xmlhttp = new XMLHttpRequest();

        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState === 4) {
                let val = null;
                if (xmlhttp.status === 200) {
                    switch (config.format) {
                        case 'text': val = xmlhttp.responseText; break;
                        case 'json': val = JSON.parse(xmlhttp.responseText); break;
                        case 'xml': val = kijs.Ajax.parseXml(xmlhttp.responseXML); break;
                    }
                    config.fn.call(config.context || this, val, config, false);
                } else {
                    const error = 'Verbindung konnte nicht aufgebaut werden!';
                    config.fn.call(config.context || this, val, config, error);
                }
            }
        };

        xmlhttp.open(config.method, config.url, true);
        if (config.headers) {
            for (let name in config.headers) {
                if (config.headers[name] !== null) {
                    xmlhttp.setRequestHeader(name, config.headers[name]);
                }
            }
        }
        xmlhttp.send(postData);
    }
    
    /**
     * Erstellt aus einem XML-Document ein Objekt
     * @param {HTMLElement} xml
     * @returns {object}
     */
     static parseXml(xml) {
        let ret = {};

        // element
        if (xml.nodeType === 1) {
            // do attributes
            if (xml.attributes.length > 0) {
                for (let j=0; j<xml.attributes.length; j++) {
                    let attribute = xml.attributes.item(j);
                    ret[attribute.nodeName] = attribute.nodeValue;
                }
            }
            
        // text
        } else if (xml.nodeType === 3) {
            ret = xml.nodeValue.trim();
        }
        
        // do children
        if (xml.hasChildNodes()) {
            for(let i=0; i<xml.childNodes.length; i++) {
                let item = xml.childNodes.item(i);
                let nodeName = item.nodeName;
                
                if (typeof(ret[nodeName]) === 'undefined') {
                    let tmp = kijs.Ajax.parseXml(item);
                    if (tmp !== '') {
                        ret[nodeName] = tmp;
                    }
                } else {
                    if (typeof(ret[nodeName].push) === "undefined") {
                        let old = ret[nodeName];
                        ret[nodeName] = [];
                        ret[nodeName].push(old);
                    }
                    let tmp = kijs.Ajax.parseXml(item);
                    if (tmp !== '') {
                        ret[nodeName].push(tmp);
                    }
                }
            }
        }
        return ret;
    }
    
    /**
     * Generiert aus einem parameters-Object einen String, der an die URL angehängt werden kann
     * @param {type} obj
     * @returns {string}
     */
    static createQueryStringFromObject(obj) {
        let params = [];
        
        for (let key in obj) {
            let name = encodeURIComponent(key);
            let val = obj[key];
            
            // object
            if (kijs.isObject(val)) {
                throw new Error('Objects can not be convert to query strings.');
                
            // array
            } else if (kijs.isArray(val)) {
                kijs.Array.each(val, function(v) {
                    v = encodeURIComponent(v);
                    params.push(name + '=' + v);
                }, this);
                
            // string, number, boolean
            } else {
                val = encodeURIComponent(val);
                params.push(name + '=' + val);
            }
        }
        return params.join('&');
    }
    
};
/* global kijs, this */

// --------------------------------------------------------------
// kijs.Rpc
// --------------------------------------------------------------
kijs.Rpc = class kijs_Rpc {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        this._url = '.';                    // URL Beispiel: '.' oder 'index.php'
        this._timeout = 10;
        
        this._deferId = null;
        this._queue = null;
        this._tid = 0;
        
        this._queue = [];
        
        // Mapping für die Zuweisung der Config-Eigenschaften
        this._configMap = {
            url: true,
            timeout: true
        };
        
        // Config anwenden
        if (kijs.isObject(config)) {
            this.applyConfig(config);
        }
    }


    // --------------------------------------------------------------
    // STATIC GETTERS / SETTERS
    // --------------------------------------------------------------
    static get states() {
        return {
            QUEUE: 1,
            TRANSMITTED: 2,
            CANCELED_BEFORE_TRANSMIT: 3,
            CANCELED_AFTER_TRANSMIT: 4
        };
    }
    

    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get timeout() { return this._timeout; }
    set timeout(val) { this._timeout = val; }
    
    get url() { return this._url; }
    set url(val) { this._url = val; }
    
    
    
    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    /**
     * Wendet die Konfigurations-Eigenschaften an
     * @param {Object} config
     * @returns {undefined}
     */
    applyConfig(config={}) {
        kijs.Object.assignConfig(this, config, this._configMap);
    }
    
    /**
     * Führt einen RPC aus.
     * @param {String} facadeFn      Modul/Facaden-name und Methodenname Bsp: 'address.save'
     * @param {Mixed} data           Argumente/Daten, die an die Server-RPC Funktion übergeben werden.
     * @param {Function} fn          Callback-Funktion
     * @param {Object} context       Kontext für die Callback-Funktion
     * @param {Boolean} [cancelRunningRpcs=false] Bei true, werden alle laufenden Requests an die selbe facadeFn abgebrochen
     * @param {Object} [rpcParams]   Hier können weitere Argumente, zum Datenverkehr (z.B. ignoreWarnings)
     * @param {Mixed} [responseArgs] Hier können Daten übergeben werden, 
     *                               die in der Callback-Fn dann wieder zur Verfügung stehen.
     *                               z.B. die loadMask, damit sie in der Callback-FN wieder entfernt werden kann.
     * @returns {undefined}
     */
    do(facadeFn, data, fn, context, cancelRunningRpcs, rpcParams, responseArgs) {
        if (this._deferId) {
            clearTimeout(this._deferId);
        }

        if (cancelRunningRpcs) {
            for (let i=0; i<this._queue.length; i++) {
                if (this._queue[i].facadeFn === facadeFn) {
                    switch (this._queue[i].state) {
                        case 1: // queue
                            this._queue[i].state = kijs.Rpc.states.CANCELED_BEFORE_TRANSMIT;
                            this._receive([{tid: this._queue[i].tid}], {postData:[this._queue[i]]});
                            break;

                        case 2: // transmitted
                            this._queue[i].state = kijs.Rpc.states.CANCELED_AFTER_TRANSMIT;
                            break;
                    }
                }
            }
        }

        this._queue.push({
            facadeFn: facadeFn,
            data: data,
            type: 'rpc',
            tid: this._createTid(),
            fn: fn,
            context: context,
            rpcParams: rpcParams,
            responseArgs: responseArgs,
            state: kijs.Rpc.states.QUEUE
        });

        this._deferId = kijs.defer(this._transmit, this.timeout, this);
    }
    
    
    // PROTECTED
    /**
     * Generiert die nächste Transfer-ID und gibt sie zurück
     * @returns {Number}
     */
    _createTid() {
        this._tid++;
        return this._tid;
    }
    
    /**
     * Holt einen Request aufgrund der Transfer-ID aus der Queue zurück.
     * @param {type} tid
     * @returns {Array}
     */
     _getByTid(tid) {
        for (let i=0; i<this._queue.length; i++) {
            if (this._queue[i].tid === tid) {
                return this._queue[i];
            }
        }
        return null;
    }

    /**
     * Interne callback-Funktion für den Ajax-Request
     * @param {Array} response Array mit den Antworten (subResponses) auf die einzelnen subRequests
     * @param {Object} request Request der gesendet wurde
     * @param {String} errorMsg Falls ein übertragungsfehler vorliegt, wird hier der Fehlertext übergeben
     * @returns {undefined}
     */
   _receive(response, request, errorMsg) {
        // Antworten für die einzelnen Requests durchgehen
        for (let i=0; i<request.postData.length; i++) {
            let subResponse = response[i];

            // Passenden subRequest aus Queue holen
            let subRequest = this._getByTid(request.postData[i].tid);

            // Behandlung von Übertragungsfehlern
            if (kijs.isEmpty(subResponse)) {
                subResponse = {
                    errorMsg: 'Übertragungsfehler'
                };
            }
            if (!errorMsg && subResponse.tid !== subRequest.tid) {
                errorMsg = 'Die RPC-Antwort passt nicht zum Request';
            }
            if (errorMsg) {
                subResponse.errorMsg = errorMsg;
            }

            // Abbruch durch neueren Request?
            if (subRequest.state === kijs.Rpc.states.CANCELED_BEFORE_TRANSMIT || 
                    subRequest.state === kijs.Rpc.states.CANCELED_AFTER_TRANSMIT) {
                subResponse.canceled = true;
            }

            // Transfer-ID aus der Queue entfernen
            this._removeTid(subRequest.tid);

            // callback-fn ausführen
            if (subRequest.fn && kijs.isFunction(subRequest.fn)) {
                subRequest.fn.call(subRequest.context || this, subResponse, subRequest);
            }
        }
    }
    
    
    /**
     * Entfernt eine Transfer-ID aus der Queue
     * @param {Number} tid
     * @returns {undefined}
     */
    _removeTid(tid) {
        const newQueue = [];
        for (let i=0; i<this._queue.length; i++) {
            if (this._queue[i].tid !== tid) {
                newQueue.push(this._queue[i]);
            }
        }
        this._queue = newQueue;
    }

    /**
     * Übermittelt die subRequests in der queue an den Server
     * @returns {undefined}
     */
    _transmit() {
        this._deferId = null;
        const transmitData = [];
        
        for (let i=0; i<this._queue.length; i++) {
            if (this._queue[i].state === kijs.Rpc.states.QUEUE) {
                const subRequest = kijs.isObject(this._queue[i].rpcParams) ? this._queue[i].rpcParams : {};
                subRequest.facadeFn = this._queue[i].facadeFn;
                subRequest.data = this._queue[i].data;
                subRequest.type = this._queue[i].type;
                subRequest.tid = this._queue[i].tid;
                
                transmitData.push(subRequest);
                this._queue[i].state = kijs.Rpc.states.TRANSMITTED;
            }
        }
        
        if (transmitData.length > 0) {
            kijs.Ajax.request({
                method  : 'POST',
                headers: {'X-LIBRARY': 'kijs'},
                postData: transmitData,
                url     : this.url,
                fn      : this._receive,
                context : this
            });
        }

    }



    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct() {
        // Bestehendes Timeout aufheben
        if (this._deferId) {
            clearTimeout(this._deferId);
        }
        
        // Variablen
        this._queue = null;
    }
};
/* global kijs */

// --------------------------------------------------------------
// kijs.gui (Static)
// --------------------------------------------------------------
kijs.gui = class kijs_gui {
    
    
    // --------------------------------------------------------------
    // STATICS
    // --------------------------------------------------------------
    /**
     * Erstellt einen Namespace
     * @param {String} xtype    Beispiel: 'kijs.gui.Element'
     * @returns {kijs.gui.Element|Null}
     */
    static getClassFromXtype(xtype) {
        const parts = xtype.split('.');
        let parent = window;
        
        for (let i=0; i<parts.length; i++) {
            let part = parts[i];
            if (!parent[part]) {
                console.log(part);
                return null;
            }
            parent = parent[part];
        }
        return parent;
    }
    
    
};

/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.Dom
// --------------------------------------------------------------
/**
 * Hilfsobjekt zum Handeln von DOM-Nodes
 * 
 * CONFIG-Parameter
 * ----------------
 * cls          Array|String [optional] CSS-Klassennamen
 *                                      Beispiel: cls:['cls-a','cls-b'] oder cls:'cls-a cls-b'
 * 
 * disabled     Boolean
 * 
 * disableEnterEscBubbeling Boolean [optional] Stoppt das Bubbeling der KeyDown-Events von Enter und Escape
 *
 * eventMap     Object [optional]
 * 
 * html         String [optional]       HTML-Code, der in das Element eingefügt wird
 *                                      Beispiel: html:'<p>Hallo Welt</p>'
 * 
 * htmlDisplayType String [optional]    Darstellung der Eigenschaft 'html'. Default: 'html'
 *                                      html: als html-Inhalt (innerHtml)
 *                                      code: Tags werden als als Text angezeigt
 *                                      text: Tags werden entfernt
 * 
 * nodeAttribute Object [optional]      Eigenschaften, die in den Node übernommen werden sollen. Bsp: { id: 123, for: 'meinFeld' }
 * 
 * nodeTagName  String [optional]       Tag-Name des DOM-node. Default='div'
 *                                      Beispiel: nodeTagName='section'
 * 
 * on           Object [optional]       Objekt mit Listener-Funktionen und optionalem context.
 *                                      Wenn kein context angegeben wird, so wird das aktuelle Objekt genommen.
 *                                      Beispiel: on: {
 *                                          click: function(e) {
 *                                              ...
 *                                          },
 *                                          dblclick: function(e) {
 *                                              ...
 *                                          },
 *                                          context: xy
 *                                      }
 * 
 * style        Object [optional]       Objekt mit CSS-Style Anweisungen als Javascript 
 *                                      Beispiel: style:{background-color:'#ff8800'}
 *
 * 
 * FUNKTIONEN
 * ----------
 * alignToTarget                        Richtet ein Element nach einem Ziel-Element aus.
 * applyConfig                          Wendet ein Konfigurations-Objekt an
 *  Args:
 *   config     Object
 * 
 * destruct                             Destruktor ->Entlädt das Objekt samt allen untergeordneten Objekten
 * 
 * clsAdd                                  Fügt eine oder mehrere CSS-Klassen hinzu
 *  Args: cls   String|Array
 *
 * clsHas                                  Überprüft, ob das Element eine CSS-Klasse hat
 *  Args: 
 *   cls        String
 *  Return: Boolean
 *    
 * clsRemove                               Entfernt eine oder mehrere CSS-Klassen
 *  Args: 
 *   cls        String|Array
 * 
 * clsRemoveAll                            Entfernt alle CSS-Klassen
 * 
 * clsToggle                               Schaltet die übergebenen CSS-Klassen ein oder aus
 *  Args: 
 *   cls        String|Array
 *    
 * keyEventAdd                              Erstellt einen Tastendruck-Listener
 *  Args:
 *   keys       Number|Array                Tastencode der Taste, oder Array mit Tastencodes. Bsp: [kijs.KeyMap.keys.ENTER, 65, 66]
 *   fn         Function|String             Funktion oder Name des kijs-Events das ausgelöst werden soll
 *   context     [kijs.gui.Element|kijs.gui.Dom]  Kontext
 *   modifier    [Object]                   Muss eine Modifier-Taste gedrückt sein? null=egal
 *                                          modifier={shift:null, ctrl:false, alt:false}
 *   stopPropagation [Boolean]              Bubbeling ausschalten?
 *   preventDefault   [Boolean]             Listeners vom Browser deaktivieren?
 *
 * keyEventStopBubbeling                    Stoppt das Bubbeling der KeyDown-Events
 *  Args:
 *   keys           Array                   Array mit KeyCodes Bsp: [kijs.KeyMap.ENTER, kijs.KeyMap.ESC]
 *   modifier       [modifier]              Muss eine Modifier-Taste gedrückt sein?
 *                                          modifier = {shift:false, ctrl:false, alt:false}]
 * 
 * nodeAttributeGet                         Gibt den Wert einer Eigenschaft des DOM-Nodes zurück
 *  Args:
 *   name           String
 *  Return: Boolean
 *   
 * nodeAttributeSet                         Fügt eine Eigenschaft zum DOM-Node hinzu
 *  Args:
 *   name           String
 *   value          String|Null
 * 
 * nodeAttributeHas                         Überprüft, ob der DOM-Node eine Eigenschaft bestimmte hat
 *  Args:
 *   name           String
 *   
 * nodeAttributeRemove                      Entfernt eine Eigenschaft vom DOM-Node
 *  Args:
 *   name           String
 * 
 * render                               rendert den DOM-Node
 * 
 * renderTo                             rendert den DOM-Node und fügt ihn einem Parent-DOM-Node hinzu
 *  Args: 
 *   targetNode    HTMLElement
 *   insertBefore  HTMLElement [optional]
 *
 * 
 * EIGENSCHAFTEN
 * -------------
 * disabled
 * disableEnterEscBubbeling
 * height
 * html
 * htmlDisplayType
 * isEmpty          Boolean (readonly)
 * isRendered       Boolean (readonly)
 * left
 * node             HTML-Element            Verweis auf den DOM-Node
 * nodeTagName
 * style
 * top
 * width
 */
kijs.gui.Dom = class kijs_gui_Dom extends kijs.Observable {
    
    
    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super();
        
        this._cls = [];
        this._disableEnterEscBubbeling = false;
        this._html = undefined;
        this._htmlDisplayType = 'html', // Darstellung der Eigenschaft 'html'. Default: 'html'
                                        // html: als html-Inhalt (innerHtml)
                                        // code: Tags werden als als Text angezeigt
                                        // text: Tags werden entfernt
        
        this._node = null;
        
        this._nodeEventListeners = {}; // Delegates der DOM-Node Events, die mit kijs.Dom.addEventListener gesetzt wurden
                                        // {
                                        //     click: [
                                        //         {node: ..., useCapture: true/false, delegate: ...},
                                        //         {node: ..., useCapture: true/false, delegate: ...}
                                        //     ],
                                        //     
                                        //     mousemove: [
                                        //         {node: ..., useCapture: true/false, delegate: ...},
                                        //         {node: ..., useCapture: true/false, delegate: ...}
                                        //     ]
                                        // }

        this._disabled = false;
        
        this._nodeAttribute = {};
        
        this._left = undefined;
        this._top = undefined;
        this._width = undefined;
        this._height = undefined;
        
        this._nodeTagName = 'div';
        
        this._style = {};
        
        this._toolTip = null;
        
        // Standard-config-Eigenschaften mergen
        config = Object.assign({}, {
            // keine
        }, config);
        
        // Mapping für die Zuweisung der Config-Eigenschaften
        this._configMap = {
            cls: { fn: 'function', target: this.clsAdd },
            disabled: true,
            disableEnterEscBubbeling: { target: 'disableEnterEscBubbeling' },
            eventMap: { fn: 'assign' },
            html: true,
            htmlDisplayType: true,
            left: true,
            top: true,
            width: true,
            height: true,
            nodeAttribute: { fn: 'assign' },
            nodeTagName: true,
            on: { fn: 'assignListeners' },
            style : { fn: 'assign' },
            toolTip: { target: 'toolTip' }
        };
        
        // Mapping das aussagt, welche DOM-Node-Events bei welchem kijs-Event abgefragt werden sollen
        this._eventMap = {
            blur: { nodeEventName: 'blur', useCapture: false },
            click: { nodeEventName: 'click', useCapture: false },
            dblClick: { nodeEventName: 'dblclick', useCapture: false },
            drag: { nodeEventName: 'drag', useCapture: false },
            dragOver: { nodeEventName: 'dragover', useCapture: false },
            dragStart: { nodeEventName: 'dragstart', useCapture: false },
            dragLeave: { nodeEventName: 'dragleave', useCapture: false },
            dragEnd: { nodeEventName: 'dragend', useCapture: false },
            drop: { nodeEventName: 'drop', useCapture: false },
            focus: { nodeEventName: 'focus', useCapture: false },
            mouseDown: { nodeEventName: 'mousedown', useCapture: false },
            mouseLeave: { nodeEventName: 'mouseleave', useCapture: false },
            mouseMove: { nodeEventName: 'mousemove', useCapture: false },
            mouseUp: { nodeEventName: 'mouseup', useCapture: false },
            wheel: { nodeEventName: 'wheel', useCapture: false },
            
            // key events
            input: { nodeEventName: 'input', useCapture: false },
            keyDown: { nodeEventName: 'keydown', useCapture: false },
            keyUp: { nodeEventName: 'keyup', useCapture: false },
            enterPress: { 
                nodeEventName: 'keydown',       // Node-Event Name
                keys: [kijs.keys.ENTER],        // Bei welchen Tasten soll das Event ausgelöst werden?
                shiftKey: null,                 // Muss dazu shift gedrückt werden? (null=egal)
                ctrlKey: null,                  // Muss dazu ctgrl gedrückt werden? (null=egal)
                altKey: null,                   // Muss dazu alt gedrückt werden? (null=egal)
                usecapture: false               // Soll das Event in der Capturing- statt der Bubbeling-Phase ausgelöst werden?
            },
            enterEscPress: {
                nodeEventName: 'keydown',       // Node-Event Name
                keys: [kijs.keys.ENTER, kijs.keys.ESC], // Bei welchen Tasten soll das Event ausgelöst werden?
                shiftKey: null,                 // Muss dazu shift gedrückt werden? (null=egal)
                ctrlKey: null,                  // Muss dazu ctgrl gedrückt werden? (null=egal)
                altKey: null,                   // Muss dazu alt gedrückt werden? (null=egal)
                usecapture: false               // Soll das Event in der Capturing- statt der Bubbeling-Phase ausgelöst werden?
            },
            escPress: { 
                nodeEventName: 'keydown',       // Node-Event Name
                keys: [kijs.keys.ESC],          // Bei welchen Tasten soll das Event ausgelöst werden?
                shiftKey: null,                 // Muss dazu shift gedrückt werden? (null=egal)
                ctrlKey: null,                  // Muss dazu ctgrl gedrückt werden? (null=egal)
                altKey: null,                   // Muss dazu alt gedrückt werden? (null=egal)
                usecapture: false               // Soll das Event in der Capturing- statt der Bubbeling-Phase ausgelöst werden?
            },
            spacePress: { 
                nodeEventName: 'keydown',       // Node-Event Name
                keys: [kijs.keys.SPACE],        // Bei welchen Tasten soll das Event ausgelöst werden?
                shiftKey: null,                 // Muss dazu shift gedrückt werden? (null=egal)
                ctrlKey: null,                  // Muss dazu ctgrl gedrückt werden? (null=egal)
                altKey: null,                   // Muss dazu alt gedrückt werden? (null=egal)
                usecapture: false               // Soll das Event in der Capturing- statt der Bubbeling-Phase ausgelöst werden?
            }
        };
        
        // Config anwenden
        if (kijs.isObject(config)) {
            this.applyConfig(config);
        }
    }
    
    
    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get disabled() {
        if (this._node) {
            return !!this._node.disabled;
        } else {
            return this._disabled;
        }
    }
    set disabled(val) {
        this._disabled = !!val;
        
        if (this._node) {
            this._node.disabled = !!val;
        }
        if (this._toolTip) {
            this._toolTip.disabled = !!val;
        }
    }
    
    /**
     * Stoppt das Bubbeling der KeyDown-Events von Enter und Escape
     * @returns {Boolean}
     */
    get disableEnterEscBubbeling() { return this._disableEnterEscBubbeling;  }
    set disableEnterEscBubbeling(val) {
        this._disableEnterEscBubbeling = val;
        if (val) {
            this.on('enterEscPress', this._onEnterEscPress, this);
        } else {
            this.off('enterEscPress', this._onEnterEscPress, this);
        }
    }

    /**
     * Wurde die Eigenschaft "left" manuell zugewiesen?
     * @returns {Boolean}
     */
    get hasLeft() {
        if (this._node) {
            return !kijs.isEmpty(this._node.style.left);
        } else {
            return !kijs.isEmpty(this._left);
        }
    }
    
    /**
     * Wurde die Eigenschaft "height" manuell zugewiesen?
     * @returns {Boolean}
     */
    get hasHeight() {
        if (this._node) {
            return !kijs.isEmpty(this._node.style.height);
        } else {
            return !kijs.isEmpty(this._height);
        }
    }
    
    /**
     * Wurde die Eigenschaft "top" manuell zugewiesen?
     * @returns {Boolean}
     */
    get hasTop() {
        if (this._node) {
            return !kijs.isEmpty(this._node.style.top);
        } else {
            return !kijs.isEmpty(this._top);
        }
    }
    
    /**
     * Wurde die Eigenschaft "width" manuell zugewiesen?
     * @returns {Boolean}
     */
    get hasWidth() {
        if (this._node) {
            return !kijs.isEmpty(this._node.style.width);
        } else {
            return !kijs.isEmpty(this._width);
        }
    }
    
    get height() {
        if (this._node) {
            return this._node.offsetHeight;
        } else {
            return this._height;
        }
    }
    set height(val) {
        if (kijs.isEmpty(val)) {
            val = null;
        }
        if (val !== null && !kijs.isNumeric(val)) {
            throw new Error('set height(x). x must be numeric.');
        }            
        
        this._height = val;
        
        if (this._node) {
            if (!kijs.isEmpty(val)) {
                val += 'px';
            }
            this._node.style.height = val;
        }
    }
    
    get html() { return this._html; }
    set html(val) {
        this._html = val;
        if (this._node) {
            kijs.Dom.setInnerHtml(this._node, this._html, this._htmlDisplayType);
        }
    }
    
    get htmlDisplayType() { return this._htmlDisplayType; }
    set htmlDisplayType(val) { this._htmlDisplayType = val; }

    get isEmpty() { return kijs.isEmpty(this.html); }
    
    get isRendered() { return !!this._node; }

    get left() {
        if (this._node) {
            return this._node.offsetLeft;
        } else {
            return this._left;
        }
    }
    set left(val) {
        if (kijs.isEmpty(val)) {
            val = null;
        }
        if (val !== null && !kijs.isNumeric(val)) {
            throw new Error('set left(x). x must be numeric.');
        }
        
        this._left = val;
        
        if (this._node) {
            if (!kijs.isEmpty(val)) {
                val += 'px';
            }
            this._node.style.left = val;
        }
    }

    get node() { return this._node; }
    set node(val) { this._node = val; }
    
    get nodeTagName() { return this._nodeTagName; }
    set nodeTagName(val) { 
        this._nodeTagName = val;
        
        if (!this._node) {
            this._nodeTagName = val;
        } else if (this._node.tagName.toLowerCase() !== val) {
            throw new Error(`Property "nodeTagName" can not be set. The node has allready been rendered.`); 
        }
    }
    
    get style() {
        if (this._node) {
            return this._node.style;
        } else {
            return this._style;
        }
    }
    set style(val) { 
        if (!this._node) {
            this._style = val;
        } else {
            throw new Error(`Property "style" can not be set. The node has allready been rendered.`); 
        }
    }
    
    get toolTip() { return this._toolTip; }
    set toolTip(val) {
        if (val instanceof kijs.gui.ToolTip) {
            this._toolTip = val;
            
        } else if (kijs.isObject(val)) {
            if (this._toolTip) {
                this._toolTip.applyConfig(val);
            } else {
                this._toolTip = new kijs.gui.ToolTip(val);
            }

        } else if (kijs.isArray(val)) {
            if (val.length > 1) {
                let tmp = '<ul>';
                kijs.Array.each(val, function(v) {
                    tmp += '<li>' + v + '</li>';
                }, this);
                tmp += '</ul>';
                val = tmp;
            } else if (val.length === 1) {
                val = val[0];
            } else {
                val = '';
            }
            if (this._toolTip) {
                this._toolTip.html = val;
            } else {
                this._toolTip = new kijs.gui.ToolTip({ html: val });
            }
            
        } else if (kijs.isString(val)) {
            if (this._toolTip) {
                this._toolTip.html = val;
            } else {
                this._toolTip = new kijs.gui.ToolTip({ html: val });
            }
            
        } else if (kijs.isEmpty(val)) {
            if (this._toolTip) {
                this._toolTip.destruct();
            }
            this._toolTip = null;
            
        } else {
            throw new Error(`Unkown toolTip format`);
            
        }
        
        if (this._toolTip) {
            this._toolTip.target = this;
        }
    }

    get top() {
        if (this._node) {
            return this._node.offsetTop;
        } else {
            return this._top;
        }
    }
    set top(val) {
        if (kijs.isEmpty(val)) {
            val = null;
        }
        if (val !== null && !kijs.isNumeric(val)) {
            throw new Error('set top(x). x must be numeric.');
        }
        
        this._top = val;
        
        if (this._node) {
            if (!kijs.isEmpty(val)) {
                val += 'px';
            }
            this._node.style.top = val;
        }
    }
    
    get width() {
        if (this._node) {
            return this._node.offsetWidth;
        } else {
            return this._width;
        }
    }
    set width(val) {
        if (kijs.isEmpty(val)) {
            val = null;
        }
        if (val !== null && !kijs.isNumeric(val)) {
            throw new Error('set width(x). x must be numeric.');
        }
        
        this._width = val;
        
        if (this._node) {
            if (!kijs.isEmpty(val)) {
                val += 'px';
            }
            this._node.style.width = val;
        }
    }

    
    
    
    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    /**
     * Richtet ein Element nach einem Ziel-Element aus.
     * Dazu wird für beide Elemente ein Ankerpunkt angegeben. Das Element wird dann so positioniert,
     * dass sein Ankerpunkt die gleichen Koordinaten wie der Ankerpunkt des Ziel-Elements hat.
     * Falls das Element an der neuen Position nicht platz haben sollte, kann die Position automatisch
     * gewechselt werden (allowSwapX & allowSwapY)
     * @param {kijs.gui.Element|HTMLElement} targetNode
     * @param {String} [targetPos='bl'] Ankerpunkt beim Zielelement
     *                                   tl --- t --- tr
     *                                   |             |
     *                                   l      c      r
     *                                   |             |
     *                                   bl --- b --- br 
     * 
     * @param {String} [pos='tl'] Ankerpunkt beim Element das Ausgerichtet werden soll
     * @param {Boolean} [allowSwapX=true]   Swappen möglich auf X-Achse?
     * @param {Boolean} [allowSwapY=true]   Swappen möglich auf Y-Achse?
     * @param {Number} [offsetX=0]          Verschiebung aus dem Ankerpunkt auf der X-Achse
     * @param {Number} [offsetY=0]          Verschiebung aus dem Ankerpunkt auf der Y-Achse
     * @returns {Object}    Gibt die endgültige Positionierung zurück: { pos:..., targetPos:... }
     */
    alignToTarget(targetNode, targetPos, pos, allowSwapX, allowSwapY, offsetX, offsetY) {
        targetPos = targetPos || 'bl';
        pos = pos || 'tl';

        if (targetNode instanceof kijs.gui.Element) {
            targetNode = targetNode.dom;
        }

        if (allowSwapX === undefined) {
            allowSwapX = true;
        }

        if (allowSwapY === undefined) {
            allowSwapY = true;
        }

        offsetX = offsetX || 0;
        offsetY = offsetY || 0;

        const b = kijs.Dom.getAbsolutePos(document.body);
        const e = kijs.Dom.getAbsolutePos(this._node);
        const t = kijs.Dom.getAbsolutePos(targetNode);

        let rect = kijs.Grafic.alignRectToRect(e, t, targetPos, pos, offsetX, offsetY);

        const overlap = kijs.Grafic.rectsOverlap(rect, b);
        let posSwap, targetPosSwap;
        let rectSwap, overlapSwap;
        let fit = true;

        let setHeight = false;
        let setWidth = false;

        // Wenns inder Höhe nicht passt...
        if (!overlap.fitY) {
            fit = false;

            // evtl. von oben nach unten oder unten nach oben swappen
            if (allowSwapY) {
                // Swap positionen ermitteln
                posSwap = null;
                if (pos.indexOf('t')!==-1 && targetPos.indexOf('b')!==-1) {
                    posSwap = pos.replace('t', 'b');
                    targetPosSwap = targetPos.replace('b', 't');
                } else if (pos.indexOf('b')!==-1 && targetPos.indexOf('t')!==-1) {
                    posSwap = pos.replace('b', 't');
                    targetPosSwap = targetPos.replace('t', 'b');
                }

                // Kann in der Höhe die Position gewechselt werden? (t->b und b->t)
                if (posSwap) {
                    rectSwap = kijs.Grafic.alignRectToRect(e, t, targetPosSwap, posSwap, offsetX, offsetY);
                    overlapSwap = kijs.Grafic.rectsOverlap(rectSwap, b);

                    if (overlapSwap.fitY) {
                        rect = rectSwap;
                        fit = true;
                    }
                }
            }

            // Wenns immer noch nicht passt: unten oder oben am Body-Rand beginnen und über das Target hinausfahren
            // Dabei sicherstellen, dass das Element nicht grösser als der Body ist. Sonst Scrollbar.
            if (!fit) {
                // Höhe darf nicht grösser als Body höhe sein, sonst begrenzen und Scrollbar
                if (rect.h > b.h) {
                    rect.h = b.h;
                    setHeight = true;
                }

                // Am unteren/oberen Rand ausrichten
                if (pos.indexOf('t')!==-1) {
                    // Unten ausrichten
                    rect.t = b.h - rect.h;
                } else {
                    // oben ausrichten
                    rect.t = 0;
                }
                fit = true;
            }
        }

        // Wenns in der Breite nicht passt...
        if (!overlap.fitX) {
            fit = false;

            // evtl. von rechts nach links oder links nach rechts swappen
            if (allowSwapX) {
                // Swap positionen ermitteln
                posSwap = null;
                if (pos.indexOf('l')!==-1 && targetPos.indexOf('r')!==-1) {
                    posSwap = pos.replace('l', 'r');
                    targetPosSwap = targetPos.replace('r', 'l');
                } else if (pos.indexOf('r')!==-1 && targetPos.indexOf('l')!==-1) {
                    posSwap = pos.replace('r', 'l');
                    targetPosSwap = targetPos.replace('l', 'r');
                }

                // Kann in der Breite die Position gewechselt werden? (l->r und r->l)
                if (posSwap) {
                    rectSwap = kijs.Grafic.alignRectToRect(e, t, targetPosSwap, posSwap, offsetX, offsetY);
                    overlapSwap = kijs.Grafic.rectsOverlap(rectSwap, b);

                    if (overlapSwap.fitX) {
                        rect = rectSwap;
                        fit = true;
                    }
                }
            }

            // Wenns immer noch nicht passt: links oder rechts am Body-Rand beginnen und über das Target hinausfahren
            // Dabei sicherstellen, dass das Element nicht grösser als der Body ist. Sonst Scrollbar.
            if (!fit) {
                // Breite darf nicht grösser als Body breite sein, sonst begrenzen und Scrollbar
                if (rect.w > b.w) {
                    rect.w = b.w;
                    setWidth = true;
                }

                // Am linken/rechten Rand ausrichten
                if (pos.indexOf('l')!==-1) {
                    rect.x = b.w - rect.w;
                } else if (pos.indexOf('r')!==-1) {
                    rect.x = 0;
                }
                fit = true;
            }
        }

        this.left = rect.x;
        this.top = rect.y;
        
        // Abmessungen nur setzen, wenn unbedingt nötig.
        if (setWidth) {
            this.width = rect.w;
        }
        if (setHeight) {
            this.height = rect.h;
        }
        
        return {
            pos: posSwap ? posSwap : pos,
            targetPos: targetPosSwap ? targetPosSwap : targetPos
        };
    }
    
    /**
     * Wendet die Konfigurations-Eigenschaften an
     * @param {Object} config
     * @returns {undefined}
     */
    applyConfig(config={}) {
        kijs.Object.assignConfig(this, config, this._configMap);
    }
    
    
    /**
     * Fügt eine oder mehrere CSS-Klassen hinzu
     * @param {String|Array} cls
     * @returns {undefined}
     */
    clsAdd(cls) {
        if (!cls) {
            return;
        }
        if (!kijs.isArray(cls)) {
            cls = cls.split(' ');
        }
        this._cls = kijs.Array.concatUnique(this._cls, cls);
        
        this._clsApply();
    }
    
    /**
     * Überprüft, ob das Element eine CSS-Klasse hat
     * @param {String} cls
     * @returns {Boolean}
     */
    clsHas(cls) {
        return kijs.Array.contains(this._cls, cls);
    }

    /**
     * Entfernt eine oder mehrere CSS-Klassen
     * @param {String|Array} cls
     * @returns {undefined}
     */
    clsRemove(cls) {
        if (!cls) {
            return;
        }
        
        if (!kijs.isArray(cls)) {
            cls = cls.split(' ');
        }
        this._cls = kijs.Array.removeMultiple(this._cls, cls);
        
        this._clsApply();
    }
    
    /**
     * Entfernt alle CSS-Klassen
     * @returns {undefined}
     */
    clsRemoveAll() {
        this._cls = [];
        this._clsApply();
    }

    /**
     * Schaltet die übergebenen CSS-Klassen ein oder aus
     * @param {String|Array} cls
     * @returns {undefined}
     */
    clsToggle(cls) {
        if (!cls) {
            return;
        }
        
        const newCls = [];
        if (!kijs.isArray(cls)) {
            cls = cls.split(' ');
        }
        kijs.Array.each(this._cls, function(cl) {
            if (kijs.Array.contains(cls, cl)) {
                kijs.Array.remove(cls, cl);
            } else {
                newCls.push(cl);
            }
        }, this);
        
        if (cls) {
            this._cls = newCls.concat(cls);
        }
        
        this._clsApply();
    }
    
    /**
     * Setzt den Fokus auf den Node
     * @param {Boolean} [alsoSetIfNoTabIndex=false]    Fokus auch setzen, wenn tabIndex === -1
     *                                                 tabIndex -1: nur via focus() Befehl oder click fokussierbar
     *                                                 tabIndex  0: Fokussierbar - Browser betimmt die Tabreihenfolge
     *                                                 tabIndex >0: Fokussierbar - in der Reihenfolge wie der tabIndex
     * @returns {HTMLElement|Null}                     HTML-Node, das den Fokus erhalten hat
     */
    focus(alsoSetIfNoTabIndex=false) {
        // Darf der Node den Fokus erhalten?
        if (alsoSetIfNoTabIndex) {
            this._node.focus();
            return this._node;
            
        // sonst den Fokus auf den ersten möglichen untegeordneten Node settzen
        } else {
            const node = kijs.Dom.getFirstFocusableNode(this._node);
            if (node) {
                node.focus();
            }
            return node;
        }
    }
        
    /**
     * Gibt den Wert eine Eigenschaft des DOM-Nodes zurück
     * @param {String} name
     * @returns {String|Null|Boolean|Undefined}
     */
    nodeAttributeGet(name) {
        if (kijs.isEmpty(name)) {
            return null;
        }
        
        if (this._node) {
            return this._node[name];
            
        } else {
            if (this._nodeAttribute.hasOwnProperty(name)) {
                return this._nodeAttribute[name];
            } else {
                return null;
            }
        }
    }
    
    /**
     * Fügt eine Eigenschaft zum DOM-Node hinzu
     * @param {String} name
     * @param {String|Null|Boolean|Undefined} value
     * @returns {undefined}
     */
    nodeAttributeSet(name, value) {
        if (kijs.isEmpty(name)) {
            return;
        }
        
        if (kijs.isEmpty(value)) {
            if (this._nodeAttribute.hasOwnProperty(name)) {
                delete this._nodeAttribute[name];
            }
        } else {
            this._nodeAttribute[name] = value;
        }
                
        if (this._node) {
            this._node[name] = value;
        }
    }
    
    /**
     * Überprüft, ob der DOM-Node eine bestimmte Eigenschaft hat
     * @param {String} name
     * @returns {Boolean}
     */
    nodeAttributeHas(name) {
        if (this._node) {
            return kijs.isEmpty(this._nodeAttribute[name]);
        } else {
            return !!this._nodeAttribute.hasOwnProperty(name);
        }
    }

    // overwrite
    on(names, callback, context) {
        // Anzahl kijs-Events ermitteln
        const eventsCountBefore = Object.keys(this._events).length;

        // Aufruf der Basisfunktion
        super.on(names, callback, context);
        
        // Anzahl kijs-Events ermitteln
        const eventsCountAfter = Object.keys(this._events).length;

        // Evtl. die Listeners auf den DOM-Node aktualisieren
        if (this._node && eventsCountAfter - eventsCountBefore) {
            this._nodeEventListenersAppy();
        }
    }
    
    // overwrite
    off(names, callback, context) {
        // Anzahl kijs-Events ermitteln
        const eventsCountBefore = Object.keys(this._events).length;

        // Aufruf der Basisfunktion
        super.off(names, callback, context);
        
        // Anzahl kijs-Events ermitteln
        const eventsCountAfter = Object.keys(this._events).length;

        // Evtl. die Listeners auf den DOM-Node aktualisieren
        if (this._node && eventsCountAfter - eventsCountBefore) {
            this._nodeEventListenersAppy();
        }
    }
    
    // overwrite
    raiseEvent(name, e={}) {
        Object.assign(e, {
            dom: this,
            eventName: name
        });
        return super.raiseEvent(name, e);
    }

    /**
     * rendert den DOM-Node
     * @returns {undefined}
     */
    render() {
        // Node erstellen und Events abfragen
        if (!this._node) {
            this._node = document.createElement(this._nodeTagName);
            
            // Styles mergen
            if (!kijs.isEmpty(this._style)) { 
                Object.assign(this._node.style, this._style);
            }
            
            // Positionierung
            if (!kijs.isEmpty(this._width)) {
                this.width = this._width;
            }
            if (!kijs.isEmpty(this._height)) {
                this.height = this._height;
            }
            if (!kijs.isEmpty(this._top)) {
                this.top = this._top;
            }
            if (!kijs.isEmpty(this._left)) {
                this.left = this._left;
            }
            
            // nodeAttribute
            this._nodeAttributeApply();
            
            // disabled
            this.disabled = this._disabled;
        }
        
        // HTML
        if (kijs.isDefined(this._html)) {
            kijs.Dom.setInnerHtml(this._node, this._html, this._htmlDisplayType);
        }
        
        // CSS-Klassen zuweisen
        this._clsApply();
        
        // DOM-Node-Event Listeners erstellen
        this._nodeEventListenersAppy();
    }
    
    /**
     * rendert den DOM-Node und fügt ihn einem Parent-DOM-Node hinzu
     * @param {HTMLElement} targetNode
     * @param {HTMLElement} insertBefore - Falls das Element statt angehängt eingefügt werden soll.
     * @returns {undefined}
     */
    renderTo(targetNode, insertBefore) {
        this.render();

        if (insertBefore) {
            targetNode.insertBefore(this._node, insertBefore);
        } else {
            targetNode.appendChild(this._node);
        }
    }
    
    /**
     * Node aus DOM entfernen, falls vorhanden
     * @returns {undefined}
     */
    unRender() {
        if (this._node) {
            // Node-Event-Listeners entfernen
            if (!kijs.isEmpty(this._nodeEventListeners)) {
                kijs.Dom.removeAllEventListenersFromContext(this);
            }
            
            // Childs löschen
            kijs.Dom.removeAllChildNodes(this._node);
            
            // Node selber löschen
            if (this._node !== document.body) {
                this._node.parentNode.removeChild(this._node);
            }
        }
        this._node = null;
    }



    // PROTECTED
    /**
     * Weist die CSS-Klassen dem DOM-Node zu.
     * @returns {undefined}
     */
    _clsApply() {
        if (this._node) {
            this._node.className = this._cls ? this._cls.join(' ') : '';
        }
    }
    
    /**
     * Weist die Eigenschaften dem DOM-Node zu.
     * @param {String} [name=null] Name der Eigenschaft, die angewendet werden soll oder Null für alle
     * @returns {undefined}
     */
    _nodeAttributeApply() {
        kijs.Object.each(this._nodeAttribute, function(name, value) {
            this._node[name] = value;
        }, this);
    }
    
    /**
     * Erstellt oder entfernt Listeners auf den DOM-Node aufgrund der _events
     * @returns {undefined}
     */
    _nodeEventListenersAppy() {
        // kijs-Events-Namen ermitteln
        const kijsEvents = Object.keys(this._events);
        
        // Falls es bereits Node-Event-Listeners gibt, diese entfernen
        if (!kijs.isEmpty(this._nodeEventListeners)) {
            kijs.Dom.removeAllEventListenersFromContext(this);
        }
        
        // DOM-Node Listeners erstellen
        kijs.Array.each(kijsEvents, function(kijsEvent) {
            if (this._eventMap[kijsEvent]) {
                const nodeEventName = this._eventMap[kijsEvent].nodeEventName;
                const useCapture = !!this._eventMap[kijsEvent].useCapture;
                
                // Wenn der DOM-Node Listener noch nicht vorhanden ist: erstellen
                if (!kijs.Dom.hasEventListener(nodeEventName, this._node, this, useCapture)) {
                    kijs.Dom.addEventListener(nodeEventName, this._node, this._onNodeEvent, this, useCapture);
                }
            } else {
                throw new Error(`kijsEvent "${kijsEvent}" is not mapped`);
            }
        }, this);
    }
    
    
    // LISTENERS
    _onEnterEscPress(e) {
        e.nodeEvent.stopPropagation();
    }
    
    /**
     * Listener für alle DOM-Node-Events, der die kijs-Events auslösen.
     * @param {Object} e
     * @returns {Boolean}
     */
    _onNodeEvent(e) {
        let ret = true;

        // kijs-Events ermitteln, die aufgrund des DOM-Node-Events ausgelöst werden sollen
        kijs.Object.each(this._eventMap, function(eventName, val) {
            // Eventname und useCapture muss übereinstimmen
            if (val.nodeEventName !== e.nodeEventName || !!val.useCapture !== !!e.useCapture) {
                return;
            }
            
            // Tastencode muss übereinstimmen, wenn vorhanden
            if (!kijs.isEmpty(val.keys)) {
                const keys = kijs.isArray(val.keys) ? val.keys : [val.keys];
                if (!kijs.Array.contains(keys, e.nodeEvent.keyCode)) {
                    return;
                }
            }
            
            // Zusatztaste shift muss übereinstimmen, wenn vorhanden
            if (!kijs.isEmpty(val.shiftKey)) {
                if (!!val.shiftKey !== !!e.nodeEvent.shiftKey) {
                    return;
                }
            }

            // Zusatztaste ctrl muss übereinstimmen, wenn vorhanden
            if (!kijs.isEmpty(val.ctrlKey)) {
                if (!!val.ctrlKey !== !!e.nodeEvent.ctrlKey) {
                    return;
                }
            }

            // Zusatztaste alt muss übereinstimmen, wenn vorhanden
            if (!kijs.isEmpty(val.altKey)) {
                if (!!val.altKey !== !!e.nodeEvent.altKey) {
                    return;
                }
            }

            // kijs-Event auslösen
            e.dom = this;
            e.eventName = eventName;
            
            if (this.raiseEvent(eventName, e) === false) {
                ret = false;
            }
        }, this);
        
        return ret;
    }
    
    
    
    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct() {
        // ToolTip entladen
        if (this._toolTip) {
            this._toolTip.destruct();
        }
        
        // Listeners vom DOM-Node entfernen
        kijs.Dom.removeAllEventListenersFromContext(this);
        
        // DOM-Nodes entfernen
        if (this._node) {
            kijs.Dom.removeAllChildNodes(this._node);
            if (this._node !== document.body) {
                this._node.parentNode.removeChild(this._node);
            }
        }
        
        // Variablen (Objekte/Arrays) leeren
        this._cls = null;
        this._configMap = null;
        this._eventMap = null;
        this._node = null;
        this._nodeAttribute = null;
        this._nodeEventListeners = null;
        this._style = null;
        this._toolTip = null;

        // Basisklasse entladen
        super.destruct();
    }
};
/* global kijs */

// --------------------------------------------------------------
// kijs.gui.ToolTip
// --------------------------------------------------------------
kijs.gui.ToolTip = class kijs_gui_ToolTip extends kijs.Observable {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config) {
        super(false);
        
        this._disabled = false;
        this._dom = new kijs.gui.Dom();
        this._followPointer = false;    // Soll sich der TipText mit dem Mauszeiger verschieben?
        this._offsetX = 10;
        this._offsetY = 10;
        this._target = null;

        // Standard-config-Eigenschaften mergen
        config = Object.assign({}, {
            // keine
        }, config);
        
        // Mapping für die Zuweisung der Config-Eigenmschaften
        this._configMap = {
            cls: { fn: 'function', target: this._dom.clsAdd, context: this._dom },
            disabled: true,
            followPointer: true,
            html: { target: 'html', context: this._dom },
            htmlDisplayType: { target: 'htmlDisplayType', context: this._dom },
            offsetX : true,
            offsetY: true,
            on: { fn: 'assignListeners' },
            target: { target: 'target' },
            style : { fn: 'assign', target: 'style', context: this._dom }
        };
        
        this._dom.clsAdd('kijs-tooltip');
        
        if (kijs.isObject(config)) {
            this.applyConfig(config);
        }
    }


    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get disabled() { return this._disabled; }
    set disabled(val) {
        this._disabled = !!val;
        
        if (this._disabled) {
            this.hide();
        }
    }
    
    get dom() { return this._dom; }
    
    get html() { return this._dom.html; }
    set html(val) { this._dom.html = val; }
    
    get isEmpty() { return this._dom.isEmpty; }
    
    get target() { return this._target; }
    set target(val) {
        if (this._target !== val) {
            this._target = val;
            this._bindEventsToTarget();
        }
    }
    
    
    

    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    /**
     * Wendet die Konfigurations-Eigenschaften an
     * @param {Object} config
     * @returns {undefined}
     */
    applyConfig(config={}) {
        kijs.Object.assignConfig(this, config, this._configMap);
    }
    
    
    hide() {
        this._dom.clsAdd('kijs-hidden');
    }

    /**
     * rendert den DOM-Node
     * @param {Boolean} [preventAfterRender=false]
     * @returns {undefined}
     */
    render(preventAfterRender) {
        // DOM Rendern
        this._dom.render();
    }

    show(x, y) {
        const create = !this.dom.node;

        if (create) {
            this.render();
        }
        
        // Position setzen
        if (create || this._dom.clsHas('kijs-hidden') || this._followPointer) {
            // X
            if (kijs.isDefined(x)) {
                // Offset addieren
                if (this._offsetX) {
                    x += this._offsetX;
                }
                
                // Sicherstellen, dass der ToolTip auf dem Bildschirm platz hat
                if (x+this._dom.node.offsetWidth > window.innerWidth) {
                    x = Math.abs(window.innerWidth - this._dom.node.offsetWidth);
                }
                
                // Position zuweisen
                this._dom.style.left = x + 'px';
            }
            
            // Y
            if (kijs.isDefined(y)) {
                // Offset addieren
                if (this._offsetY) {
                    y += this._offsetY;
                }
                
                // Sicherstellen, dass der ToolTip auf dem Bildschirm platz hat
                if (y+this._dom.node.offsetHeight > window.innerHeight) {
                    y = Math.abs(window.innerHeight - this._dom.node.offsetHeight);
                }
                
                // Position zuweisen
                this._dom.style.top = y + 'px';
            }
            
            // Einblenden
            this._dom.clsRemove('kijs-hidden');
        }

        if (create) {
            document.body.appendChild(this._dom.node);
        }
    }


    // PROTECTED
    _bindEventsToTarget() {
        this._target.on('mouseMove', this._onMouseMoveTarget, this);
        this._target.on('mouseLeave', this._onMouseLeave, this);
    }
    
    /*_onMouseMoveTipText(e) {
        if (!this.disabled) {
            this.show();
        }
    }*/

    _onMouseMoveTarget(e) {
        if (!this.disabled) {
            this.show(e.nodeEvent.clientX, e.nodeEvent.clientY);
        }
    }

    _onMouseLeave(e) {
        this.hide();
    }


    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(preventDestructEvent) {
        // Event auslösen.
        if (!preventDestructEvent) {
            this.raiseEvent('destruct');
        }
        
        // Listeners entfernen
        if (this._target) {
            this._target.off(null, null, this);
        }
    
        // Elemente/DOM-Objekte entladen
        if (this._dom) {
            this._dom.destruct();
        }
       
        // Variablen (Objekte/Arrays) leeren
        this._dom = null;
        this._target = null;
                
        // Basisklasse entladen
        super.destruct();
    }
};
/* global kijs */

// --------------------------------------------------------------
// kijs.gui.Element
// --------------------------------------------------------------
/**
 * Ein einfaches DOM-Element ohne Positionierungen.
 * 
 * CONFIG-Parameter
 * ----------------
 * afterResizeDelay Number [optional=300]
 * 
 * cls          Array|String [optional] CSS-Klassennamen
 *                                      Beispiel: cls:['cls-a','cls-b'] oder cls:'cls-a cls-b'
 * 
 * displayWaitMask Booelan [optional]   Soll die Lademaske angezeigt werden?
 * 
 * height       Number [optional]       Höhe
 * 
 * html         String [optional]       HTML-Code, der in das Element eingefügt wird
 *                                      Beispiel: html:'<p>Hallo Welt</p>'
 * 
 * htmlDisplayType String [optional]    Darstellung der Eigenschaft 'html'. Default: 'html'
 *                                      html: als html-Inhalt (innerHtml)
 *                                      code: Tags werden als als Text angezeigt
 *                                      text: Tags werden entfernt
 * 
 * left         Number [optional]       X-Koordinate
 * 
 * name         String [optional]       Element-Namen Siehe dazu auch kijs.gui.Container.getElementByName()
 * 
 * nodeTagName   String [optional]       Tag-Name des DOM-node. Default='div'
 *                                      Beispiel: nodeTagName='section'
 * 
 * on           Object [optional]       Objekt mit Listener-Funktionen und optionalem context.
 *                                      Wenn kein context angegeben wird, so wird das aktuelle Objekt genommen.
 *                                      Beispiel: on: {
 *                                          click: function(e) {
 *                                              ...
 *                                          },
 *                                          dblclick: function(e) {
 *                                              ...
 *                                          },
 *                                          context: xy
 *                                      }
 * 
 * parent       kijs.gui.Element [optional] Verweis auf das übergeordenete Element    
 * 
 * style        Object [optional]       Objekt mit CSS-Style Anweisungen als Javascript 
 *                                      Beispiel: style:{background-color:'#ff8800'}
 * 
 * toolTip      String|Object|kijs.gui.ToolTip [optional]  ToolTip als
 *                                                   - String (HTML-Code). Beispiel: html:'<p>Hallo Welt</p>'
 *                                                   - ToolTip-Config Objekt
 *                                                   - kijs.gui.ToolTip-Instanz
 * 
 * top          Number [optional]       Y-Koordinate
 * 
 * visible      Boolean [optional]      Sichtbarkeit des Elements Default=true
 *                                      Beispiel: visible:false
 * 
 * width        Number [optional]      Breite
 * 
 *  
 *  
 * FUNKTIONEN
 * ----------
 * applyConfig                          Wendet ein Konfigurations-Objekt an
 *  Args:
 *   config     Object
 * 
 * destruct                             Destruktor ->Entlädt das Objekt samt allen untergeordneten Objekten

 * waitMaskAdd                          Zeigt die Lademaske an oder zählt den Zähler hoch, falls sie schon sichtbar ist
 * 
 * waitMaskRemove                       Zählt den Zähler nach unten und blendet bei 0 die Lademaske aus
 * 
 * render                               rendert den DOM-Node
 * 
 * renderTo                             rendert den DOM-Node und fügt ihn einem Parent-DOM-Node hinzu
 *  Args: 
 *   targetNode    HTMLElement
 *   insertBefore  HTMLElement [optional]
 * 
 * up                                   Durchläuft den Element-Baum nach oben und gibt das erste Element zurück, 
 *  Args:                               dass mit dem Namen (Eigenschaft 'name') übereinstimmt.
 *   name          String 
 *  Return:        kijs_gui_Element|Null
 *
 * upX                                  Durchläuft den Element-Baum nach oben und gibt das erste Element zurück, 
 *  Args:                               dass mit dem Klassennamen (Eigenschaft 'xtype') übereinstimmt.
 *   name          String 
 *  Return:        kijs_gui_Element|Null
 * 
 * 
 * EIGENSCHAFTEN
 * -------------
 * afterResizeDelay
 * 
 * cls          kijs.helper.Cls         Verweis auf den Cls-Helper
 * 
 * height       Number                  Höhe
 * 
 * html         String                  Siehe kijs.gui.Dom.html
 * 
 * htmlDisplayType String               Siehe kijs.gui.Dom.htmlDisplayType
 * 
 * isEmpty      Boolean (readonly)
 * 
 * isRendered   Boolean (readonly)
 * 
 * left         Number                  X-Koordinate
 * 
 * node         HTML-Element (readonly) Verweis auf den DOM-Node
 * 
 * name
 * 
 * next         kijs.gui.Element|Null (readonly)   Gibt das nächste element im elements-Array zurück
 * 
 * parent       kijs.gui.Element|Null (readonly)   Verweis auf das übergeordnete Element
 * 
 * previous     kijs.gui.Element|Null (readonly)   Gibt das vorherige element im elements-Array zurück
 *  
 * style        (readonly)
 * 
 * toolTip
 * 
 * top          Number                  Y-Koordinate
 * 
 * visible
 * 
 * width        Number                  Breite
 * 
 * xtype        String (readonly)       Gibt den Namen der Klasse zurück
 * 
 * 
 * EVENTS
 * ----------
 * afterRender
 * afterResize
 * afterFirstRenderTo
 * changeVisibility
 * destruct
 */
kijs.gui.Element = class kijs_gui_Element extends kijs.Observable {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super();
        
        this._afterResizeDeferHandle = null;   // intern
        this._afterResizeDelay = 300;    // delay beim Aufruf des afterResize-Events
        this._dom = new kijs.gui.Dom();
        this._name = null;
        this._parentEl = null;
        this._visible = true;
        this._lastSize = null;    // Grösse beim letzten Aufruf vom afterResize-Event
        
        this._waitMaskEl = null;        // Instanz der Lademaske
        this._waitMaskCount = 0;        // Anzahl Lademasken die angezeigt werden sollen. 
                                        // bei mehreren wird trotzdem nur eine angezeigt. 
                                        // Sobald der Zähler wieder auf 0 ist, wird sie dann entfernt.
                                        
        this._waitMaskTargetDomProperty = 'dom';   // Dom-Property, für das die Lademaske angezeigt werden soll
        
        this._preventAfterResize = false;    // Auslösen des afterResize-Events verhindern?
        
        this._eventForwards = {};   // Events, die an untergeordnete kijs.gui.Dom Objekte weitergeleitet werden sollen
                                    //  {
                                    //    click: [
                                    //      { target: this._dom, targetEventName: 'click' },
                                    //      { target: this._domInner, targetEventName: 'click' }
                                    //    ],
                                    //    dblclick: [
                                    //      { target: this._dom, targetEventName: 'click' }
                                    //    ]
                                    //  }


        // Standard-config-Eigenschaften mergen
        config = Object.assign({}, {
            // keine
        }, config);
        
        // Mapping für die Zuweisung der Config-Eigenschaften
        this._configMap = {
            afterResizeDelay: true,
            cls: { fn: 'function', target: this._dom.clsAdd, context: this._dom },
            disableEnterEscBubbeling: { target: 'disableEnterEscBubbeling', context: this._dom },
            nodeTagName: { target: 'nodeTagName', context: this._dom },
            defaults: { fn: 'manual' }, // wird nur bei containern gebraucht
            height: { target: 'height' },
            html: { target: 'html', context: this._dom },
            htmlDisplayType: { target: 'htmlDisplayType', context: this._dom },
            left: { target: 'left' },
            name: true,
            on: { fn: 'assignListeners' },
            parent: { target: 'parent' },
            style : { fn: 'assign', target: 'style', context: this._dom },
            toolTip: { target: 'toolTip' },
            top: { target: 'top' },
            visible : true,
            displayWaitMask: { target: 'displayWaitMask' },
            waitMaskTargetDomProperty: { target: 'waitMaskTargetDomProperty' },
            width: { target: 'width' },
            xtype: { fn: 'manual' }
        };
        
        // Event-Weiterleitungen von this._dom
        this._eventForwardsAdd('click', this._dom);
        this._eventForwardsAdd('dblClick', this._dom);
        this._eventForwardsAdd('drag', this._dom);
        this._eventForwardsAdd('dragOver', this._dom);
        this._eventForwardsAdd('dragStart', this._dom);
        this._eventForwardsAdd('dragLeave', this._dom);
        this._eventForwardsAdd('dragEnd', this._dom);
        this._eventForwardsAdd('drop', this._dom);
        this._eventForwardsAdd('focus', this._dom);
        this._eventForwardsAdd('mouseDown', this._dom);
        this._eventForwardsAdd('mouseLeafe', this._dom);
        this._eventForwardsAdd('mouseMove', this._dom);
        this._eventForwardsAdd('mouseUp', this._dom);
        this._eventForwardsAdd('wheel', this._dom);
        
        // key events
        this._eventForwardsAdd('keyDown', this._dom);
        this._eventForwardsAdd('enterPress', this._dom);
        this._eventForwardsAdd('enterEscPress', this._dom);
        this._eventForwardsAdd('escPress', this._dom);
        this._eventForwardsAdd('spacePress', this._dom);
        
        
        // Config anwenden
        if (kijs.isObject(config)) {
            this.applyConfig(config, true);
        }
    }
    
    
    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get afterResizeDelay() { return this._afterResizeDelay; }
    set afterResizeDelay(val) { this._afterResizeDelay = val; }
    
    get displayWaitMask() { return !kijs.isEmpty(this._waitMaskEl); }
    set displayWaitMask(val) { 
        if (val) {
            if (kijs.isEmpty(this._waitMaskEl)) {
                this._waitMaskEl = new kijs.gui.Mask({
                    displayWaitIcon: true,
                    target: this,
                    targetDomProperty: this._waitMaskTargetDomProperty
                });
                this._waitMaskCount = 1;
                
                if (this.isRendered) {
                    this._waitMaskEl.show();
                }
            }
        } else {
            if (!kijs.isEmpty(this._waitMaskEl)) {
                this._waitMaskEl.destruct();
                this._waitMaskEl = null;
                this._waitMaskCount = 0;
            }
        }
    }

    get dom() { return this._dom; }

    get isRendered() { return !!this._dom.isRendered; }
    
    get node() { return this._dom.node; }
    get nodeTagName() { return this._dom.nodeTagName; }
    
    get height() { return this._dom.height; }
    set height(val) {
        this._dom.height = val;
        // Evtl. afterResize-Event zeitversetzt auslösen
        if (this._hasSizeChanged(val)) {
            this._raiseAfterResizeEvent(true);
        }
    }
    
    get html() { return this._dom.html; }
    set html(val) { this._dom.html = val; }
    
    get htmlDisplayType() { return this._dom.htmlDisplayType; }
    set htmlDisplayType(val) { this._dom.htmlDisplayType = val; }
    
    get isEmpty() { return this._dom.isEmpty; }
    
    get left() { return this._dom.left; }
    set left(val) { this._dom.left = val; }
    
    get name() { return this._name; }
    set name(val) { this._name = val; }
    
    /**
     * Gibt das nächste element im elements-Array zurück
     * @returns {kijs.gui.Element|Null}
     */
    get next() {
        if (!this._parentEl || !this._parentEl.elements) {
            return null;
        }

        let index = -1;
        for (let i=0; i<this._parentEl.elements.length; i++) {
            if (this._parentEl.elements[i] === this) {
                index = i+1;
                break;
            }
        }

        if (index > -1 && this._parentEl.elements[index]) {
            return this._parentEl.elements[index];
        } else {
            return null;
        }
    }

    /**
     * Gibt das Elternelement zurück
     * @returns {kijs.gui.Element|Null}
     */
    get parent() { return this._parentEl; }
    set parent(val) {
        if (val !== this._parentEl) {
            if (this._parentEl) {
                this._parentEl.off('afterResize', this._onParentAfterResize, this);
                this._parentEl.off('childElementAfterResize', this._onParentChildElementAfterResize, this);
            }
            
            this._parentEl = val;
            this._parentEl.on('afterResize', this._onParentAfterResize, this);
            this._parentEl.on('childElementAfterResize', this._onParentChildElementAfterResize, this);
            this.applyConfig();
        }
    }
    
    /**
     * Gibt das vorherige element im elements-Array zurück
     * @returns {kijs.gui.Element|Null}
     */
    get previous() {
        if (!this._parentEl || !this._parentEl.elements) {
            return null;
        }

        let index = -1;
        for (let i=0; i<this._parentEl.elements.length; i++) {
            if (this._parentEl.elements[i] === this) {
                index = i-1;
                break;
            }
        }

        if (index > -1 && this._parentEl.elements[index]) {
            return this._parentEl.elements[index];
        } else {
            return null;
        }
    }

    get style() { return this._dom.style; }
    
    get toolTip() { return this._dom.toolTip; }
    set toolTip(val) {
        this._dom.toolTip = val;
    };
    
    get top() { return this._dom.top; }
    set top(val) { this._dom.top = val; }
    
    get visible() { 
        return this._visible;
    }
    set visible(val) {
        const changed = !!this._visible !== !!val;
        
        this._visible = !!val;
        
        if (this._visible) {
            this._dom.clsRemove('kijs-hidden');
        } else {
            this._dom.clsAdd('kijs-hidden');
        }
        
        if (changed) {
            this.raiseEvent('changeVisibility', { visible: this._visible });
        }
    }
    
    get waitMaskTargetDomProperty() { return this._waitMaskTargetDomProperty; }
    set waitMaskTargetDomProperty(val) {
        this._waitMaskTargetDomProperty = val;
        if (!kijs.isEmpty(this._waitMaskEl)) {
            this._waitMaskEl.targetDomProperty = val;
        }
    }
    
    get width() { return this._dom.width; }
    set width(val) {
        this._dom.width = val;
        // Evtl. afterResize-Event zeitversetzt auslösen
        if (this._hasSizeChanged(null, val)) {
            this._raiseAfterResizeEvent(true);
        }
    }
    
    get xtype() { 
        if (kijs.isString(this.constructor.name) && !kijs.isEmpty(this.constructor.name)) {
            return this.constructor.name.replace(/_/g, '.');
            
        // Workaround für IE und Edge
        } else {
            // Wenn der xtype noch nicht ermittelt worden ist, muss er ermittelt werden
            const proto = this;
            
            // Zuerst den Klassennamen suchen (Edge)
            if (!proto.__xtype) {
                let results = /\s*class\s([a-zA-Z0-9_]+)(\sextends\s[a-zA-Z0-9_.]+)?\s*{/.exec(this.constructor.toString());
                if (results && results.length > 0) {
                    proto.__xtype = results[1].trim().replace(/_/g, '.');
                }
            }
            
            // Sonst den Funktionsname suchen (IE)
            if (!proto.__xtype) {
                let results = /\s*function\s([a-zA-Z0-9_]+)\s*\(/.exec(this.constructor.toString());
                if (results && results.length > 0) {
                    proto.__xtype = results[1].trim().replace(/_/g, '.');
                }
            }

            if  (proto.__xtype) {
                return proto.__xtype;
            } else {
                throw new Error(`xtype can not be determined`);
            }
        }
        
    }
    

    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    /**
     * Wendet die Konfigurations-Eigenschaften an
     * @param {Object} config
     * @param {Boolean} [preventEvents=false]   // Das Auslösen des afterResize-Event verhindern?
     * @returns {undefined}
     */
    applyConfig(config={}, preventEvents=false) {
        // evtl. afterResize-Event deaktivieren
        const prevAfterRes = this._preventAfterResize;
        if (preventEvents) {
            this._preventAfterResize = true;
        }
        
        // Config zuweisen
        kijs.Object.assignConfig(this, config, this._configMap);
        
        // Evtl. afterResize-Event wieder zulassen
        if (preventEvents) {
            this._preventAfterResize = prevAfterRes;
        }
    }

    /**
     * Setzt den Fokus auf das Element
     * @param {Boolean} [alsoSetIfNoTabIndex=false]    Fokus auch setzen, wenn tabIndex === -1
     *                                                 tabIndex -1: nur via focus() Befehl fokussierbar
     *                                                 tabIndex  0: Fokussierbar - Browser betimmt die Tabreihenfolge
     *                                                 tabIndex >0: Fokussierbar - in der Reihenfolge wie der tabIndex
     * @returns {HTMLElement|Null}                     HTML-Node, das den Fokus erhalten hat
     */
    focus(alsoSetIfNoTabIndex=false) {
        return this._dom.focus(alsoSetIfNoTabIndex);
    }

    // overwrite
    on(names, callback, context) {
        names = kijs.isArray(names) ? names : [names];
        
        // Event Weiterleitungen erstellen, falls noch nicht vorhanden
        kijs.Array.each(names, function(name) {
            if (this._eventForwards[name]) {
                kijs.Array.each(this._eventForwards[name], function(forward) {
                    forward.target.on(forward.targetEventName, this._onForwardEvent, this);
                }, this);
            }
        }, this);
        
        // Aufruf der Basisfunktion
        super.on(names, callback, context);
    }

    // overwrite
    raiseEvent(name, e={}) {
        Object.assign(e, {
            element: this,
            eventName: name
        });
        // Das auszulösende Element darf nicht überschrieben werden.
        // Dieses gibt an, welches Element das Event ursprünglich ausgelöst hat
        // und bleibt bestehen, wenn das Event weitergereicht wird.
        if (kijs.isEmpty(e.raiseElement)) {
            e.raiseElement = this;
        }
        return super.raiseEvent(name, e);
    }

    /**
     * rendert den DOM-Node
     * @param {Boolean} [preventAfterRender=false]
     * @returns {undefined}
     */
    render(preventAfterRender) {
        // DOM Rendern
        this._dom.render();

        // Sichtbarkeit
        if (kijs.isDefined(this._visible)) {
            this.visible = this._visible;
        }
        
        if (this._waitMaskEl) {
            kijs.defer(function() {
                if (this._waitMaskEl) {
                    this._waitMaskEl.show();
                }
            }, 300, this);
        }

        // Event afterRender auslösen
        if (!preventAfterRender) {
            this.raiseEvent('afterRender');
        }
    }

    /**
     * rendert den DOM-Node und fügt ihn einem Parent-DOM-Node hinzu
     * @param {HTMLElement} targetNode
     * @param {HTMLElement} insertBefore - Falls das Element statt angehängt eingefügt werden soll.
     * @returns {undefined}
     */
    renderTo(targetNode, insertBefore) {
        const firstRender = !this.isRendered;
        
        this.render();

        if (insertBefore) {
            targetNode.insertBefore(this._dom.node, insertBefore);
        } else {
            targetNode.appendChild(this._dom.node);
        }

        // Event afterFirstRenderTo auslösen
        if (firstRender) {
            this.raiseEvent('afterFirstRenderTo');
        }
    }
    
    /**
     * Node aus DOM entfernen, falls vorhanden
     * @returns {undefined}
     */
    unRender() {
        this._dom.unRender();
    }
    
    /**
     * Durchläuft den Element-Baum nach oben und gibt das erste Element zurück, 
     * dass mit dem Namen (Eigenschaft 'name') übereinstimmt.
     * @param {String} name
     * @returns {kijs_gui_Element|Null}
     */
    up(name) {
        if (!kijs.isEmpty(name) && this.parent) {
            if (this.parent.name === name) {
                return this.parent;
            } else if (this.parent.up) {
                return this.parent.up(name);
            }
        }
        return null;
    }
    
    /**
     * Durchläuft den Element-Baum nach oben und gibt das erste Element zurück, 
     * dass mit dem Klassennamen (Eigenschaft 'xtype') übereinstimmt.
     * @param {String} xtype
     * @returns {kijs_gui_Element|Null}
     */
    upX(xtype) {
        if (!kijs.isEmpty(xtype) && this.parent) {
            if (this.parent.xtype === xtype) {
                return this.parent;
            } else if (this.parent.upX) {
                return this.parent.upX(xtype);
            }
        }
        return null;
    }

    /**
     * Zeigt die Lademaske an
     * Falls sie schon angezeigt wird, so wird nur der Zähler hochgezählt
     * @returns {kijs.gui.Mask}
     */
    waitMaskAdd() {
        this._waitMaskCount++;
        
        if (!this._waitMaskEl) {
            this.displayWaitMask = true;
        }
        
        return this._waitMaskEl;
    }
    
    /**
     * Entfernt die Lademaske
     * Falls der Zähler > 1 ist, wird sie nicht geschlossen, sondern nur der Zähler dekrementiert.
     * @returns {undefined}
     */
    waitMaskRemove() {
        if (this._waitMaskEl && this._waitMaskCount) {
            this._waitMaskCount--;

            if (this._waitMaskCount <= 0) {
                this.displayWaitMask = false;
            }
        }
    }


    // PROTECTED
    /**
     * Leitet einen Event-Listener, der mit on oder once erstellt wurde an ein untergeordnetes kijs.gui.Dom Objekt weiter
     * @param {String} eventName            kijs-Event Name
     * @param {kijs.gui.Dom|kijs.gui.Element} target  Untergeordnetes Objekt, an dieses der Listener weitergeleitet wird
     * @param {String} [targetEventName]    kijs-Event Name im untergeordneten Objekt oder leer bei gleichem Event-Namen
     * @returns {undefined}
     */
    _eventForwardsAdd(eventName, target, targetEventName) {
        if (!targetEventName) {
            targetEventName = eventName;
        }
        
        if (!this._eventForwardsHas(eventName, target, targetEventName)) {
            this._eventForwards[eventName] = this._eventForwards[eventName] || [];
            const forward = {
                target: target,
                targetEventName: targetEventName
            };
            
            this._eventForwards[eventName].push(forward);
            
            /*// Bei kijs.gui.Element-Targets, wird der Forward-Listener sofort erstellt, 
            // weil sonst, wenn der Listener vor dem _eventForwardsAdd gemacht wird, nicht funktioniert.
            // Da dieser Vorfall bei kijs.gui.Dom nicht auftreten kann, können wir dort den Listener erst bei einer
            // Verwendung erstellen.
            //console.log(forward.target);
            if (forward.target instanceof kijs.gui.Element) {
                console.log('test');
                forward.target.on(forward.targetEventName, this._onForwardEvent, this);
            }*/
        }
    }
    
    /**
     * Überprüft, ob eine Eventweiterleitung existiert
     * @param {String} eventName            kijs-Event Name
     * @param {kijs.gui.Dom|kijs.gui.Element} target Untergeordnetes Objekt, an dieses der Listener weitergeleitet wird
     * @param {String} [targetEventName]    kijs-Event Name im untergeordneten Objekt oder leer bei gleichem Event-Namen
     * @returns {Boolean}
     */
    _eventForwardsHas(eventName, target, targetEventName) {
        if (!targetEventName) {
            targetEventName = eventName;
        }
        
        let ret = false;
        
        if (!kijs.isEmpty(this._eventForwards[eventName])) {
            kijs.Array.each(this._eventForwards[eventName], function(forward) {
                if (forward.target === target && forward.targetEventName === targetEventName) {
                    ret = true;
                    return;
                }
            }, this);
        }
        return ret;
    }
    
    /**
     * Entfernt eine Event-Weiterleitung
     * @param {String} eventName            Name des Events, dessen Weiterleitung entfernt werden soll 
     * @param {kijs.gui.Dom|kijs.gui.Element} target  Ziel, dessen Weiterleitung entfernt werden soll
     * @param {String} [targetEventName]    kijs-Event Name im untergeordneten Objekt oder leer bei gleichem Event-Namen
     * @returns {undefined}
     */
    _eventForwardsRemove(eventName, target, targetEventName) {
        if (!targetEventName) {
            targetEventName = eventName;
        }
        
        let forwardToDelete = null;
        
        if (!kijs.isEmpty(this._eventForwards[eventName])) {
            kijs.Array.each(this._eventForwards[eventName], function(forward) {
                if (forward.target === target && forward.targetEventName === targetEventName) {
                    forwardToDelete = forward;
                    return;
                }
            }, this);
        }
        
        if (forwardToDelete) {
            kijs.Array.remove(this._eventForwards[eventName], forwardToDelete);
        }
    }
    
    /**
     * Hat die Grösse seit dem letzten Aufruf von _raiseAfterResizeEvent geändert?
     * @param {Number|null} [height=null]   null=aktuelle Höhe 
     * @param {Number|null} [width=null]    null=aktuelle Breite
     * @returns {Boolean}
     */
    _hasSizeChanged(height=null, width=null) {
        if (!kijs.isObject(this._lastSize)) {
            return true;
        }
        
        if (height === null) {
            height = this.height;
        }
        if (width === null) {
            width = this.width;
        }
        
        if (height !== this._lastSize.h || width !== this._lastSize.w) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Falls sich seit dem letzten aufruf dieser Funktion die Grösse geändert hat: das afterResize-Event auslösen
     * @param {Boolean} [useDelay=false]
     * @param {type} [e={}]   Falls das Event nur weitergereicht wird, kann hier das 
     *                          e-Arg des vorherigen Events übergeben werden
     * @returns {undefined}
     */
    _raiseAfterResizeEvent(useDelay=false, e={}) {
        if (this._preventAfterResize) {
            return;
        }
        
        // Aufruf mit Verzögerung
        if (useDelay) {
            if (this._afterResizeDeferHandle) {
                window.clearTimeout(this._afterResizeDeferHandle);
            }

            this._afterResizeDeferHandle = kijs.defer(function(){
                this._afterResizeDeferHandle = null;

                if (this._hasSizeChanged()) {
                    this._lastSize = { h: this.height, w: this.width };
                    this.raiseEvent('afterResize', e);
                }
            }, this._afterResizeDelay, this);
            
        // Aufruf ohne Verzögerung
        } else {
            if (this._hasSizeChanged()) {
                this._lastSize = { h: this.height, w: this.width };
                this.raiseEvent('afterResize', e);
            }
            
        }
    }
    
    
    // LISTENERS
    /**
     * Listener für die weitergeleiteten Events der untergeordneten kijs.gui.Dom oder kijs.gui.Element Objekte
     * Hier werden die Events, die in (this._eventForwards) zum weiterleiten gekennzeichnet sind weitergeleitet
     * @param {Object} e
     * @returns {Boolean}
     */
    _onForwardEvent(e) {
        let ret = true;
        
        // Vorhandene Weiterleitungen durchgehen und bei Übereinstimmung das Event weiterleiten
        kijs.Object.each(this._eventForwards, function(eventName, forwards) {

            kijs.Array.each(forwards, function(forward) {
                const eventContextProperty = forward.target instanceof kijs.gui.Dom ? 'context' : 'element';
                if (forward.target === e[eventContextProperty] && forward.targetEventName === e.eventName) {
                    e.element = this;
                    if (!this.raiseEvent(eventName, e) === false) {
                        ret = false;
                    }
                }
            }, this);
        }, this);

        return ret;
    }
    
    /**
     * Listener der Aufgerufen wird, wenn die Grösse des Parents geändert hat
     * @param {Object} e
     * @returns {undefined}
     */
    _onParentAfterResize(e) {
        // Falls die eigene Grösse geändert hat: das eigene afterResize-Event auslösen
        this._raiseAfterResizeEvent(false, e);
    }

    /**
     * Listener der Aufgerufen wird, wenn die Grösse des Parents geändert hat
     * @param {type} e
     * @returns {undefined}
     */
    _onParentChildElementAfterResize(e) {
        // Falls die eigene Grösse geändert hat: das eigene afterResize-Event auslösen
        this._raiseAfterResizeEvent(false, e);
    }

    
    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(preventDestructEvent) {
        // atferResize-Events verhindern
        this._preventAfterResize = true;
        if (this._afterResizeDeferHandle) {
            window.clearTimeout(this._afterResizeDeferHandle);
        }
        
        // Event auslösen.
        if (!preventDestructEvent) {
            this.raiseEvent('destruct');
        }
        
        // Listeners entfernen
        if (this._parentEl) {
            this._parentEl.off(null, null, this);
        }
    
        // Elemente/DOM-Objekte entladen
        if (this._dom) {
            this._dom.destruct();
        }
        if (this._waitMaskEl) {
            this._waitMaskEl.destruct;
        }

        // Variablen (Objekte/Arrays) leeren
        this._afterResizeDeferHandle = null;
        this._dom = null;
        this._parentEl = null;
        this._eventForwards = null;
        this._configMap = null;
        this._lastSize = null;
        this._waitMaskEl = null;
        
        // Basisklasse entladen
        super.destruct();
    }
};
/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.Container
// --------------------------------------------------------------
/**
 * Container Element, dass untergeordnete Elemente beinhalten kann.
 * Das Element besteht aus zwei ineinanderliegenden dom-Nodes.
 * 
 * KLASSENHIERARCHIE
 * kijs.gui.Element 
 *  kijs.gui.BoxElement
 *   kijs.gui.Container
 * 
 * CONFIG-Parameter (es gelten auch die Config-Parameter der Basisklassen)
 * ----------------
 * defaults     Object [optional]       Objekt mit Config-Parameter, die bei allen untergeordneten elements
 *                                      angewendet werden.
 * 
 * clsInner     Array|String [optional] CSS-Klassennamen für den inneren dom-Node
 *                                      Beispiel: clsInner:['cls-a','cls-b'] oder cls:'cls-a cls-b'
 *                              
 * styleInner   Object [optional]       Objekt mit CSS-Style Anweisungen als Javascript für das innere dom-Element
 *                                      Beispiel: styleInner:{background-color:'#ff8800'}
 * 
 * elements     Array|Object            Array mit den untergeordneten elements.
 *                                      Es können sowohl Config-Objekte, als auch Instanzen der Klasse im Array sein.
 *                                      Beispiel: elements:[
 *                                          {
 *                                              xtype: 'kijs.gui.Element',
 *                                              html: 'Hello World'
 *                                          }, new kijs.gui.Element({
 *                                              html: 'Hallo Welt'
 *                                          })
 *                                      ]
 * 
 * 
 * FUNKTIONEN (es gelten auch die Funktionen der Basisklassen)
 * ----------
 * addClsInner                          Fügt eine oder mehrere CSS-Klassen zum inneren dom-Node hinzu
 *  Args: cls   String|Array
 * 
 * hasClsInner                          Überprüft, ob der innere dom-Node eine CSS-Klasse hat
 *  Args: 
 *   cls        String
 *  Return: Boolean
 *    
 * removeClsInner                       Entfernt eine oder mehrere CSS-Klassen vom inneren dom-Node
 *  Args: 
 *   cls        String|Array
 * 
 * 
 * add                                  Fügt ein oder mehrere Elemente hinzu
 *  Args: 
 *   elements   Array|Object            Es können sowohl Config-Objekte, als auch Instanzen der Klasse im Array sein.
 *   before     Number|Function [optional]  Index der Position oder Verweis auf das Element, vor dem eingefügt werden soll.
 *   
 * getElementsByName                    Gibt untergeordnete Elemente aufgrund ihres 'name' zurück
 *  Args:
 *   name       String
 *   deep       Number [optional] default=-1 Gewünschte Suchtiefe 
 *                                            0=nur im aktuellen Container
 *                                            1=im aktuellen Container und in deren untergeordneten
 *                                            2=im aktuellen Container, deren untergeordneten und deren untergeordneten
 *                                            n=... 
 *                                            -1=unendlich
 *   breakOnFirst {Boolean} [optional] default=false Soll nur das Erste Element zurückgegeben werden?
 *  Return: Array
 *   
 * getElementsByXtype                   Gibt untergeordnete Elemente aufgrund ihres 'xtype' zurück
 *  Args:
 *   xtype      String
 *   deep       Number [optional] default=-1 Gewünschte Suchtiefe 
 *                                            0=nur im aktuellen Container
 *                                            1=im aktuellen Container und in deren untergeordneten
 *                                            2=im aktuellen Container, deren untergeordneten und deren untergeordneten
 *                                            n=... 
 *                                            -1=unendlich
 *   breakOnFirst {Boolean} [optional] default=false Soll nur das Erste Element zurückgegeben werden?
 *  Return: Array
 *   
 * hasChild                             Überprüft, ob ein untergeordnetes Element existiert
 *  Args:
 *   element    kijs.gui.Element
 *  Return: Boolean
 *   
 * remove                               Löscht ein oder mehrere untergeordenete Elemente
 *  Args:
 *   elements    Object|Array
 *   
 * removeAll                            Löscht alle untergeordeneten Elemente
 * 
 * down                                 Durchläuft den Element-Baum nach unten und gibt das erste Element zurück, 
 *  Args:                               dass mit dem Namen (Eigenschaft 'name') übereinstimmt.
 *   name       String
 *  Return: kijs.gui.Element|Null
 *  
 * downX                                Durchläuft den Element-Baum nach unten und gibt das erste Element zurück, 
 *  Args:                               dass mit dem Klassennamen (Eigenschaft 'xtype') übereinstimmt.
 *   xtype      String
 *  Return: kijs.gui.Element|Null
 *  
 * 
 * EIGENSCHAFTEN (es gelten auch die Eigenschaften der Basisklassen)
 * -------------
 * innerDom     HTML-Element            Verweis auf den inneren dom-Node
 * 
 * elements     Array                   Array mit den untergeordeten elements
 * 
 * isEmpty      Boolean (readonly)
 * 
 * 
 * EVENTS
 * ----------
 * add
 * 
 * beforeadd
 * 
 * beforeremove
 * 
 * childElementAfterResize
 * 
 * remove
 * 
 * 
 */
kijs.gui.Container = class kijs_gui_Container extends kijs.gui.Element {
    
    
    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);
        
        this._innerDom = new kijs.gui.Dom();
        
        this._defaults = {};
        this._elements = [];
        
        this._dom.clsAdd('kijs-container');
        this._innerDom.clsAdd('kijs-container-inner');
        
        // Standard-config-Eigenschaften mergen
        config = Object.assign({}, {
            // keine
        }, config);
        
        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            autoScroll: { target: 'autoScroll' },
            defaults: true,
            html: { target: 'html', context: this._innerDom },
            htmlDisplayType: { target: 'htmlDisplayType', context: this._innerDom },
            innerCls: { fn: 'function', target: this._innerDom.clsAdd, context: this._innerDom },
            innerStyle : { fn: 'assign', target: 'style', context: this._innerDom },
            
            elements: { prio: 1000, fn: 'function', target: this.add, context: this }
        });
        
        // Config anwenden
        if (kijs.isObject(config)) {
            this.applyConfig(config, true);
        }
    }


    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get autoScroll() { return this._innerDom.clsHas('kijs-autoscroll'); }
    set autoScroll(val) {
        if (val) {
            this._innerDom.clsAdd('kijs-autoscroll');
        } else {
            this._innerDom.clsRemove('kijs-autoscroll');
        }
    }
    
    get elements() { return this._elements; }
    
    // overwrite
    get html() { return this._innerDom.html; }
    set html(val) { this._innerDom.html = val; }
    
    // overwrite
    get htmlDisplayType() { return this._innerDom.htmlDisplayType; }
    set htmlDisplayType(val) { this._innerDom.htmlDisplayType = val; }

    get innerDom() { return this._innerDom; }
    
    // overwrite
    get isEmpty() { return kijs.isEmpty(this._elements); }
    
    
    
    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    /**
     * Fügt ein oder mehrere Elemente hinzu.
     * @param {Object|Array} elements
     * @param {Number} [index=null] Position an der Eingefügt werden soll null=am Schluss
     * @returns {undefined}
     */
    add(elements, index) {
        if (!kijs.isArray(elements)) {
            elements = [elements];
        }

        const newElements = [];
        for (let i=0,len=elements.length; i<len; i++) {
            let el = this._getInstanceForAdd(elements[i]);
            if (el && !kijs.Array.contains(this._elements, el)) {
                el.on('afterResize', this._onChildElementAfterResize, this);
                newElements.push(el);
            }
        }
        elements = null;
        
        // event ausführen
        if (this.raiseEvent('beforeAdd', {elements: newElements}) === false) {
            return;
        }

        // zu elements hinzufügen.
        kijs.Array.each(newElements, function(el) {
            this._elements.push(el);

            // rendern falls DOM vorhanden
            if (this._innerDom.node) {
                el.renderTo(this._innerDom.node);
            }
        }, this);

        // Falls der DOM gemacht ist, wird neu gerendert.
        if (this._innerDom.node) {
            this.render();
        }

        // Hinzugefügt, Event auslösen.
        this.raiseEvent('add', {elements: newElements});
    }

    /**
     * Durchläuft den Element-Baum nach unten und gibt das erste Element zurück, 
     * dass mit dem Namen (Eigenschaft 'name') übereinstimmt.
     * @param {String} name
     * @returns {kijs_gui_Element|Null}
     */
    down(name) {
        const ret = this.getElementsByName(name, -1, true);
        if (!kijs.isEmpty(ret)) {
            return ret[0];
        } else  {
            return null;
        }
    }
    
    /**
     * Durchläuft den Element-Baum nach unten und gibt das erste Element zurück, 
     * dass mit dem Klassennamen (Eigenschaft 'xtype') übereinstimmt.
     * @param {String} xtype
     * @returns {kijs_gui_Element|Null}
     */
    downX(xtype) {
        const ret = this.getElementsByXtype(xtype, -1, true);
        if (!kijs.isEmpty(ret)) {
            return ret[0];
        } else  {
            return null;
        }
    }

    /**
     * Gibt untergeordnete Elemente aufgrund ihres 'name' zurück
     * @param {String} name
     * @param {Number} deep [optional] default=-1    Gewünschte Suchtiefe 
     *                                               0=nur im aktuellen Container
     *                                               1=im aktuellen Container und in deren untergeordneten
     *                                               2=im aktuellen Container, deren untergeordneten und deren untergeordneten
     *                                               n=...
     *                                               -1=unendlich
     * @param {Boolean} breakOnFirst [optional] default=false Soll nur das erste Element zurückgegeben werden?
     * @returns {Array}
     */
    getElementsByName(name, deep=-1, breakOnFirst=false) {
        let ret=[];
        
        if (kijs.isEmpty(name)) {
            return [];
        }
        
        // elements im aktuellen Container werden zuerst zurückgegeben
        kijs.Array.each(this._elements, function(el) {
            if (el.name === name) {
                ret.push(el);
                if (breakOnFirst) {
                    return false;
                }
            }
        }, this);

        // Evtl. untergeordnete Container rekursiv duchsuchen
        if (!breakOnFirst || kijs.isEmpty(ret)) {
            if (deep && deep!==0) {
                if (deep>0) {
                    deep--;
                }
                kijs.Array.each(this._elements, function(el) {
                    if (kijs.isFunction(el.getElementsByName)) {
                        let retSub = el.getElementsByName(name, deep, breakOnFirst);
                        if (!kijs.isEmpty(retSub)) {
                            ret = ret.concat(retSub);
                            if (breakOnFirst) {
                                return false;
                            }
                        }
                    }
                }, this);
            }
        }

        // Rückgabe
        return ret;
    }
    
    /**
     * Gibt untergeordnete Elemente aufgrund ihres 'xtype' zurück
     * @param {String} xtype
     * @param {Number} deep [optional] default=-1    Gewünschte Suchtiefe 
     *                                               0=nur im aktuellen Container
     *                                               1=im aktuellen Container und in deren untergeordneten
     *                                               2=im aktuellen Container, deren untergeordneten und deren untergeordneten
     *                                               n=...
     *                                               -1=unendlich
     * @param {Boolean} breakOnFirst [optional] default=false Soll nur das erste Element zurückgegeben werden?
     * @returns {Array}
     */
    getElementsByXtype(xtype, deep=-1, breakOnFirst=false) {
        let ret=[];
        
        if (kijs.isEmpty(xtype)) {
            return [];
        }
        
        // elements im aktuellen Container werden zuerst zurückgegeben
        kijs.Array.each(this._elements, function(el) {
            if (el.xtype === xtype) {
                ret.push(el);
                if (breakOnFirst) {
                    return false;
                }
            }
        }, this);

        // Evtl. untergeordnete Container rekursiv duchsuchen
        if (!breakOnFirst || kijs.isEmpty(ret)) {
            if (deep && deep!==0) {
                if (deep>0) {
                    deep--;
                }
                kijs.Array.each(this._elements, function(el) {
                    if (kijs.isFunction(el.getElementsByXtype)) {
                        let retSub = el.getElementsByXtype(xtype, deep, breakOnFirst);
                        if (!kijs.isEmpty(retSub)) {
                            ret = ret.concat(retSub);
                            if (breakOnFirst) {
                                return false;
                            }
                        }
                    }
                }, this);
            }
        }

        // Rückgabe
        return ret;
    }
    
    /**
     * Überprüft ob ein untergeordnetes Element existiert
     * @param {kijs.gui.Element} element
     * @returns {Boolean}
     */
    hasChild(element) {
        return kijs.Array.contains(this._elements, element);
    }

    /**
     * Löscht ein oder mehrere untergeordnete Elemente
     * @param {Object|Array} elements
     * @returns {undefined}
     */
    remove(elements) {
        if (!kijs.isArray(elements)) {
            elements = [elements];
        }

        const removeElements = [];
        for (let i=0,len=elements.length; i<len; i++) {
            if (kijs.Array.contains(this._elements, elements[i])) {
                removeElements.push(elements[i]);
            }
        }
        elements = null;

        // event ausführen
        if (this.raiseEvent('beforeRemove', {elements: removeElements}) === false) {
            return;
        }
        
        // löschen
        kijs.Array.each(removeElements, function(el) {
            el.off(null, null, this);
            if (el.destruct) {
                el.destruct();
            }
            kijs.Array.remove(this._elements, el);
        }, this);

        // Falls der DOM gemacht ist, wird neu gerendert.
        if (this.dom) {
            this.render();
        }

        // Gelöscht, Event auslösen.
        this.raiseEvent('remove');
    }

    /**
     * Löscht alle untergeordeneten Elemente
     * @param {Boolean} [preventRender=false]
     * @returns {undefined}
     */
    removeAll(preventRender) {
        // event ausführen
        if (this.raiseEvent('beforeRemove', {elements: this._elements}) === false) {
            return;
        }

        // leeren
        kijs.Array.each(this._elements, function(el) {
            if (el.destruct) {
                el.destruct();
            }
        }, this);
        this._elements = [];

        // Falls der DOM gemacht ist, child löschen und es wird neu gerendert.
        if (this._innerDom) {
            while (this._innerDom.firstChild) {
                this._innerDom.removeChild(this._innerDom.firstChild);
            }
        }
        if (this.dom && !preventRender) {
            this.render();
        }

        // Gelöscht, Event ausführen
        this.raiseEvent('remove');
    }



    // overwrite
    render(preventAfterRender) {
        super.render(true);
        
        // innerDOM rendern
        this._innerDom.render();
        this._dom.node.appendChild(this._innerDom.node);

        // elements im innerDOM rendern
        kijs.Array.each(this._elements, function(el) {
            el.renderTo(this._innerDom.node);
        }, this);
        

        // Event afterRender auslösen
        if (!preventAfterRender) {
            this.raiseEvent('afterRender');
        }
    }

    // overwrite
    unRender() {
        this._innerDom.unRender();
        super.unRender();
    }
    

    // PROTECTED
    /**
     * Gibt eine Instanz des Elements zurück, das hinzugefügt werden soll.
     * Falls ein xtype angegeben wird, wird eine neue instanz erstellt.
     * @param {kijs.gui.Element|Object} obj
     * @returns {kijs.gui.Element}
     */
    _getInstanceForAdd(obj) {
        // Falls eine Instanz übergeben wird
        if (obj instanceof kijs.gui.Element) {
            // Da das Element bereits erstellt wurde, werden hier keine defaults übernommen

        // Falls ein Config-Objekt übergeben wird
        } else  if (kijs.isObject(obj)) {
            
            // defaults
            if (!kijs.isEmpty(this._defaults)) {
                // defaults in die config übernehmen. Bereits vorhandene Eigenschaften werden nicht verändert.
                kijs.Object.assignDeep(obj, this._defaults, false);
                
                // Defaults wiederum als defaults weitergeben, damit evtl. vorhandene subElements diese auch übernehmen können
                /*if (kijs.isObject(obj.defaults)) {
                    kijs.Object.assignDeep(obj.defaults, this._defaults, false);
                } else {
                    obj.defaults = kijs.Object.clone(this._defaults);
                }*/
            }
                        
            // xtype vorhanden?
            if (!kijs.isString(obj.xtype)) {
                throw new Error(`config missing "xtype".`);
            }
            
            // Konstruktor ermitteln
            const constr = kijs.gui.getClassFromXtype(obj.xtype);
            if (!kijs.isFunction(constr)) {
                throw new Error(`Unknown xtype "${obj.xtype}".`);
            }

            // Element erstellen
            obj = new constr(obj);

        // Ungültige Übergabe
        } else {
            throw new Error(`kijs.gui.Container: invalid element.`);
            obj = null;
        }
        
        // Parent zuweisen
        obj.parent = this;
        
        return obj;
    }


    // LISTENERS
    /**
     * Listener der aufgerufen wird, wenn sich die Grösse eines untergeordneten Elements ändert
     * @param {Object} e
     * @returns {undefined}
     */
    _onChildElementAfterResize(e) {
        this.raiseEvent('childElementAfterResize', {childElement: e.element});
    }


    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(preventDestructEvent) {
        // Event auslösen.
        if (!preventDestructEvent) {
            this.raiseEvent('destruct');
        }
        
        // Elemente/DOM-Objekte entladen
        if (this._elements) {
            kijs.Array.each(this._elements, function(el) {
                if (el && el.destruct) {
                    el.destruct();
                }
            }, this);
        }
        if (this._innerDom) {
            this._innerDom.destruct();
        }
        
        // Variablen (Objekte/Arrays) leeren
        this._defaults = null;
        this._elements = null;
        this._innerDom = null;
        
        // Basisklasse entladen
        super.destruct(true);
    }
};

/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.SpinBox
// --------------------------------------------------------------
kijs.gui.SpinBox = class kijs_gui_SpinBox extends kijs.gui.Container {
    
    
    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);
        
        this._ownPos = 'tl';        // Ankerpunkt bei der Spin Box
        this._targetPos = 'bl';     // Ankerpunkt beim Zielelement
                                    //       tl --- t --- tr
                                    //       |             |
                                    //       l      c      r
                                    //       |             |
                                    //       bl --- b --- br 
        
        this._allowSwapX = true;    // Swappen möglich auf X-Achse?
        this._allowSwapY = true;    // Swappen möglich auf Y-Achse?
        this._offsetX = 0;           // Verschiebung aus dem Ankerpunkt auf der X-Achse
        this._offsetY = 0;           // Verschiebung aus dem Ankerpunkt auf der Y-Achse
        
        this._ownerNodes = [this._dom]; // Events auf diesen kijs.gui.Dom oder HTMLNodes werden ignoriert, die SpinBox wird nicht geschlossen
        
        this._openOnInput = true;   // Soll beim Texteingeben in Inputfield die SpinBox automatisch geöffnet werden?
        
        this._preventHide = false;  // das Ausblenden der SpinBox verhindern
        
        this._targetEl = null;              // Zielelement (kijs.gui.Element)
        this._targetDomProperty = 'dom';    // Dom-Eigenschaft im Zielelement (String)
        
        //this._dom.nodeAttributeSet('tabIndex', -1);
        
        this._dom.clsRemove('kijs-container');
        this._dom.clsAdd('kijs-spinbox');
        
        
        // Standard-config-Eigenschaften mergen
        config = Object.assign({}, {
            // keine
        }, config);
        
        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            allowSwapX: true,
            allowSwapY: true,
            offsetX: true,
            offsetY: true,
            ownPos: true,
            openOnInput: true,
            targetPos: true,
            target: { target: 'target' },
            targetDomProperty: true,
            ownerNodes: { fn: 'appendUnique', target: '_ownerNodes' }
        });
        
        // Listeners
        this.on('wheel', this._onWheel, this);
        
        // Config anwenden
        if (kijs.isObject(config)) {
            this.applyConfig(config, true);
        }
    }
    
    
    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get allowSwapX() { return this._allowSwapX; }
    set allowSwapX(val) { this._allowSwapX = !!val; }

    get allowSwapY() { return this._allowSwapY; }
    set allowSwapY(val) { this._allowSwapY = !!val; }

    get offsetX() { return this._offsetX; }
    set offsetX(val) { this._offsetX = val; }

    get offsetY() { return this._offsetY; }
    set offsetY(val) { this._offsetY = val; }

    get ownPos() { this._ownPos; }
    set ownPos(val) {
        if (kijs.Array.contains(['tl', 't', 'tr', 'l', 'c', 'r', 'bl', 'b', 'br'], val)) {
            this._ownPos = val;
        } else {
            throw new Error(`Unkown format on config "pos"`);
        }
    }
    
    get openOnInput() { return this._openOnInput; }
    set openOnInput(val) { this._openOnInput = val; }
    
    get target() {
        return this._targetEl;
    }
    set target(val) {
        // Evtl. Listeners vom alten _targetEl entfernen
        if (!kijs.isEmpty(this._targetEl)) {
            this._targetEl.off('input', this._onTargetElInput, this);
            this._targetEl.off('keyDown', this._onTargetElKeyDown, this);
            this._targetEl.off('destruct', this._onTargetElDestruct, this);
        }
        
        if (val instanceof kijs.gui.Element) {
            this._targetEl = val;
            this._targetEl.on('input', this._onTargetElInput, this);
            this._targetEl.on('keyDown', this._onTargetElKeyDown, this);
            this._targetEl.on('destruct', this._onTargetElDestruct, this);
            
        } else {
            throw new Error(`Unkown format on config "target"`);
            
        }
    }
    
    get targetDomProperty() { return this._targetDomProperty; };
    set targetDomProperty(val) { this._targetDomProperty = val; };

    /**
     * Gibt den Ziel-Node zurück, über den die Maske gelegt wird
     * @returns {HTMLElement}
     */
    get targetNode() {
        return this._targetEl[this._targetDomProperty].node;
    }


    get targetPos() { this._targetPos; }
    set targetPos(val) {
        if (kijs.Array.contains(['tl', 't', 'tr', 'l', 'c', 'r', 'bl', 'b', 'br'], val)) {
            this._targetPos = val;
        } else {
            throw new Error(`Unkown format on config "targetPos"`);
        }
    }
    

    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    close() {
        kijs.Dom.removeEventListener('mousedown', document.body, this);
        kijs.Dom.removeEventListener('resize', window, this);
        kijs.Dom.removeEventListener('wheel', window, this);
        
        kijs.Array.each(this._ownerNodes, function(x) {
            const node = x instanceof kijs.gui.Dom ? x.node : x;
            kijs.Dom.removeEventListener('mousedown', node, this);
            kijs.Dom.removeEventListener('resize', node, this);
        }, this);
        
        this.unRender();
    }
    
    /**
     * Zeigt die SpinBox an 
     * @returns {undefined}
     */
    show() {
        // SpinBox anzeigen
        this.renderTo(document.body);
        
        // Ausrichten
        this._adjustPositionToTarget(true);

        // afterResize-Event zeitversetzt auslösen
        this._raiseAfterResizeEvent(true);
        
        this._targetEl.focus();
        
        // Listeners auf body/window zum ausblenden
        kijs.Dom.addEventListener('mousedown', document.body, this._onBodyMouseDown, this);
        kijs.Dom.addEventListener('resize', window, this._onWindowResize, this);
        kijs.Dom.addEventListener('wheel', window, this._onWindowWheel, this);
        
        // Listeners auf die _ownerNodes die das Ausblenden verhindern
        kijs.Array.each(this._ownerNodes, function(x) {
            const node = x instanceof kijs.gui.Dom ? x.node : x;
            kijs.Dom.addEventListener('mousedown', node, this._onNodeMouseDown, this);
            kijs.Dom.addEventListener('resize', node, this._onNodeResize, this);
        }, this);
    }


    // PROTECTED
    /**
     * Richtet die SpinBox am Target aus
     * @param {Boolean} [preventEvents=false]   // Das Auslösen des afterResize-Event verhindern?
     * @returns {undefined}
     */
    _adjustPositionToTarget(preventEvents=false) {
        // afterResize-Event deaktivieren
        const prevAfterRes = this._preventAfterResize;
        this._preventAfterResize = true;
        
        // Aurichten
        const positions = this._dom.alignToTarget(
            this.targetNode, 
            this._targetPos,
            this._ownPos, 
            this._allowSwapX, 
            this._allowSwapY, 
            this._offsetX, 
            this._offsetY
        );
        
        // Je nach Position eine CSS-Klasse zuweisen
        let cls = '';
        if (positions.targetPos.indexOf('t') !== -1 && positions.pos.indexOf('b') !== -1) {
            cls = 'kijs-pos-top';
        } else if (positions.targetPos.indexOf('b') !== -1 && positions.pos.indexOf('t') !== -1) {
            cls = 'kijs-pos-bottom';
        } else if (positions.targetPos.indexOf('l') !== -1 && positions.pos.indexOf('r') !== -1) {
            cls = 'kijs-pos-left';
        } else if (positions.targetPos.indexOf('r') !== -1 && positions.pos.indexOf('l') !== -1) {
            cls = 'kijs-pos-right';
        }
        this._dom.clsRemove(['kijs-pos-top', 'kijs-pos-bottom', 'kijs-pos-left', 'kijs-pos-right']);
        if (cls) {
            this._dom.clsAdd(cls);
        }
        
        // afterResize-Event wieder zulassen
        this._preventAfterResize = prevAfterRes;
        
        // Evtl. afterResize-Event zeitversetzt auslösen
        if (!preventEvents && this._hasSizeChanged()) {
            this._raiseAfterResizeEvent(true);
        }
    }


    // LISTENERS
    _onBodyMouseDown(e) {
        if (!this._preventHide) {
            this.close();
        }
        this._preventHide = false;
    }
    
    _onWindowResize(e) {
        if (!this._preventHide) {
            this.close();
        }
        this._preventHide = false;
    }
    
    _onWindowWheel(e) {
        if (!this._preventHide) {
            this.close();
        }
        this._preventHide = false;
    }
    
    // Wir nutzen das Bubbeling der Events um auszuschliessen, dass die Events vom Node kommen.
    // Das Event kommt zuerst beim Node und wir setzen _preventHide=true
    // Dann kommt das Event beim Body und wenn die Variable _preventHide!==true ist, kann ausgeblendet werden
    _onNodeMouseDown(e) {
        this._preventHide = true;
    }
    
    _onNodeResize(e) {
        this._preventHide = true;
    }
    
    _onWheel(e) {
        this._preventHide = true;
    }
    
    _onTargetElInput(e) {
        if (this._openOnInput && !this.isRendered) {
            this.show();
        }
    }
    
    _onTargetElKeyDown(e) {
        switch (e.nodeEvent.keyCode) {
            case kijs.keys.ESC:
            case kijs.keys.TAB:
                this.close();
                break;
                
            case kijs.keys.F4:
                if (this.isRendered) {
                    this.close();
                } else {
                    this.show();
                }
                break;
        }
    }
    
    _onTargetElDestruct(e) {
        this.destruct();
    }
    

    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(preventDestructEvent) {
        // Event auslösen.
        if (!preventDestructEvent) {
            this.raiseEvent('destruct');
        }
        
        // Event-Listeners entfernen
        if (this._targetEl) {
            this._targetEl.off(null, null, this);
        }
        
        kijs.Dom.removeEventListener('mousedown', document.body, this);
        kijs.Dom.removeEventListener('resize', window, this);
        kijs.Dom.removeEventListener('wheel', window, this);
        

        if (!kijs.isEmpty(this._ownerNodes)) {
            kijs.Array.each(this._ownerNodes, function(x) {
                if (x) {
                    const node = x instanceof kijs.gui.Dom ? x.node : x;
                    if (node) {
                        kijs.Dom.removeEventListener('mousedown', node, this);
                        kijs.Dom.removeEventListener('resize', node, this);
                    }
                }
            }, this);
        }
        
        // Elemente/DOM-Objekte entladen
        
        
        // Variablen (Objekte/Arrays) leeren
        this._targetEl = null;
        this._ownerNodes = null;
        
        // Basisklasse entladen
        super.destruct(true);
    }
};

/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.ViewPort
// --------------------------------------------------------------
kijs.gui.ViewPort = class kijs_gui_ViewPort extends kijs.gui.Container {
    

    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);
                
        this._dom.node = document.body;
        
        this._dom.clsRemove('kijs-container');
        this._dom.clsAdd('kijs-viewport');
        
        // Standard-config-Eigenschaften mergen
        config = Object.assign({}, {
            // keine
        }, config);
        
        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            // Keine
        });
        
        // onResize überwachen
        // Wenn der Browser langsam grösser gezogen wird, wird der event dauernd
        // ausgelöst, darum wird er verzögert weitergegeben.
        kijs.Dom.addEventListener('resize', window, this._onWindowResize, this);
        
        // Config anwenden
        if (kijs.isObject(config)) {
            this.applyConfig(config, true);
        }
    }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // overwrite
    render(preventAfterRender) {
        super.render(true);
        
        // innerDOM Rendern
        this._innerDom.render();
        this._dom.node.appendChild(this._innerDom.node);

        // elements im innerDOM rendern
        kijs.Array.each(this._elements, function(el) {
            el.renderTo(this._innerDom.node);
        }, this);
        
        // Event afterRender auslösen
        if (!preventAfterRender) {
            this.raiseEvent('afterRender');
        }
        
        // afterResize-Event zeitversetzt auslösen
        this._raiseAfterResizeEvent(true);
    }


    // PROTECTED
    _onWindowResize(e) {
        this._raiseAfterResizeEvent(true, e);
    }
    
    
    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(preventDestructEvent) {
        // Event auslösen.
        if (!preventDestructEvent) {
            this.raiseEvent('destruct');
        }
        
        // Node-Event Listener auf Window entfernen
        kijs.Dom.removeEventListener('resize', window, this);
        
        // Basisklasse auch entladen
        super.destruct(true);
    }

};

/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.Icon
// --------------------------------------------------------------
kijs.gui.Icon = class kijs_gui_Icon extends kijs.gui.Element {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);
        
        this._iconCls = null;
        
        this._dom.nodeTagName = 'span';
        this._dom.clsAdd('kijs-icon');
        
        // Standard-config-Eigenschaften mergen
        config = Object.assign({}, {
            // keine
        }, config);
        
        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            disabled: { target: 'disabled' },
            iconChar: { target: 'html', context: this._dom },   // Alias für html
            iconCls: { target: 'iconCls' },
            iconColor: { target: 'iconColor' }
        });
        
        // Config anwenden
        if (kijs.isObject(config)) {
            this.applyConfig(config, true);
        }
    }


    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get disabled() { return this._dom.clsHas('kijs-disabled'); }
    set disabled(val) {
        if (val) {
            this._dom.clsAdd('kijs-disabled');
        } else {
            this._dom.clsRemove('kijs-disabled');
        }
        this._dom.disabled = !!val;
    }
    
    get iconChar() { return this._dom.html; }
    set iconChar(val) { this._dom.html = val; }

    get iconCls() { return this._iconCls; }
    set iconCls(val) {
        if (kijs.isEmpty(val)) {
            val = null;
        }
        if (!kijs.isString && !val) {
            throw new Error(`config "iconCls" is not a string`);
        }
        if (this._iconCls) {
            this._dom.clsRemove(this._iconCls);
        }
        this._iconCls = val;
        if (this._iconCls) {
            this._dom.clsAdd(this._iconCls);
        }
    }
    
    get iconColor() {
        return this._dom.style.color;
    }
    set iconColor(val) {
        this._dom.style.color = val;
    }

    get isEmpty() {
        return kijs.isEmpty(this._dom.html) && kijs.isEmpty(this._iconCls);
    }

};
/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.Button
// --------------------------------------------------------------
kijs.gui.Button = class kijs_gui_Button extends kijs.gui.Element {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);
        
        this._captionDom = new kijs.gui.Dom({
            cls: 'kijs-caption',
            nodeTagName: 'span'
        });
        
        this._iconEl = new kijs.gui.Icon({ parent: this });
        
        this._dom.nodeTagName = 'button';
        this._dom.nodeAttributeSet('type', 'button');
        
        this._dom.clsAdd('kijs-button');
        
        // Standard-config-Eigenschaften mergen
        config = Object.assign({}, {
            // keine
        }, config);
        
        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            caption: { target: 'html', context: this._captionDom },
            captionCls: { fn: 'function', target: this._captionDom.clsAdd, context: this._captionDom },
            captionHtmlDisplayType: { target: 'htmlDisplayType', context: this._captionDom },
            captionStyle: { fn: 'assign', target: 'style', context: this._captionDom },
            icon: { target: 'icon' },
            iconChar: { target: 'iconChar', context: this._iconEl },
            iconCls: { target: 'iconCls', context: this._iconEl },
            iconColor: { target: 'iconColor', context: this._iconEl },
            isDefault: { target: 'isDefault' },
            
            disabled: { prio: 100, target: 'disabled' }
        });
        
        // Config anwenden
        if (kijs.isObject(config)) {
            this.applyConfig(config, true);
        }
    }


    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get caption() { return this._captionDom.html; }
    set caption(val) { 
        this._captionDom.html = val; 
        if (this.isRendered) {
            this.render();
        }
    }
    
    get captionDom() { return this._captionDom; }

    get captionHtmlDisplayType() { return this._captionDom.htmlDisplayType; }
    set captionHtmlDisplayType(val) { this._captionDom.htmlDisplayType = val; }
    
    get disabled() { return this._dom.disabled; }
    set disabled(val) {
        if (val) {
            this._dom.clsAdd('kijs-disabled');
        } else {
            this._dom.clsRemove('kijs-disabled');
        }
        this._dom.disabled = val;
    }
    
    get icon() { return this._iconEl; }
    /**
     * Icon zuweisen
     * @param {kijs.gui.Icon|Object} val     Icon als icon-Config oder kijs.gui.Icon Element
     */
    set icon(val) {
        // Icon zurücksetzen?
        if (kijs.isEmpty(val)) {
            this._iconEl.iconChar = null;
            this._iconEl.iconCls = null;
            this._iconEl.iconColor = null;
            if (this.isRendered) {
                this.render();
            }
            
        // kijs.gui.Icon Instanz
        } else if (val instanceof kijs.gui.Icon) {
            this._iconEl.destruct();
            this._iconEl = val;
            if (this.isRendered) {
                this.render();
            }
            
        // Config Objekt
        } else if (kijs.isObject(val)) {
            this._iconEl.applyConfig(val);
            if (this.isRendered) {
                this.render();
            }
            
        } else {
            throw new Error(`config "icon" is not valid.`);
            
        }
    }
    
    get iconChar() { return this._iconEl.iconChar; }
    set iconChar(val) { 
        this._iconEl.iconChar = val;
        if (this.isRendered) {
            this.render();
        }
    }

    get iconCls() { return this._iconEl.iconCls; }
    set iconCls(val) {
        this._iconEl.iconCls = val;
        if (this.isRendered) {
            this.render();
        }
    }
    
    get iconColor() { return this._iconEl.iconColor; }
    set iconColor(val) {
        this._iconEl.iconColor = val;
        if (this.isRendered) {
            this.render();
        }
    }

    get isDefault() {
        return this._dom.clsHas('kijs-default');
    }
    set isDefault(val) {
        if (val) {
            this._dom.clsAdd('kijs-default');
        } else {
            this._dom.clsRemove('kijs-default');
        }
    }
    
    // overwrite
    get isEmpty() { return this._captionDom.isEmpty && this._iconEl.isEmpty; }
    
    
    
    
    // TODO: Instanz eines Menüs. Beim Klicken, wird dieses geöffnet
        /*if (this.menu) {
            if (kijs.isEmpty(this.menu.targetEl)) {
                this.menu.targetEl = this;
            }
            this.on('click', function(e, el){
                this.menu.show();
            }, this);
        }*/



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // Overwrite
    render(preventAfterRender) {
        super.render(true);
        
        // Span icon rendern (kijs.gui.Icon)
        if (!this._iconEl.isEmpty) {
            this._iconEl.renderTo(this._dom.node);
        } else {
            this._iconEl.unRender();
        }

        // Span caption rendern (kijs.guiDom)
        if (!this._captionDom.isEmpty) {
            this._captionDom.renderTo(this._dom.node);
        } else {
            this._captionDom.unRender();
        }

        // Event afterRender auslösen
        if (!preventAfterRender) {
            this.raiseEvent('afterRender');
        }
    }

    // overwrite
    unRender() {
        this._iconEl.unRender();
        this._captionDom.unRender();
        super.unRender();
    }
    
    
    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(preventDestructEvent) {
        // Event auslösen.
        if (!preventDestructEvent) {
            this.raiseEvent('destruct');
        }
        
        // Elemente/DOM-Objekte entladen
        if (this._captionDom) {
            this._captionDom.destruct();
        }
        if (this._iconEl) {
            this._iconEl.destruct();
        }
    
        // Variablen (Objekte/Arrays) leeren
        this._captionDom = null;
        this._iconEl = null;
        
        // Basisklasse entladen
        super.destruct(true);
    }
    
};
/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.ButtonGroup
// --------------------------------------------------------------
kijs.gui.ButtonGroup = class kijs_gui_ButtonGroup extends kijs.gui.Container {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);
        
        this._captionDom = new kijs.gui.Dom({
            cls: 'kijs-caption',
            nodeTagName: 'span'
        });
        
        this._dom.clsRemove('kijs-container');
        this._dom.clsAdd('kijs-buttongroup');
        
        // Standard-config-Eigenschaften mergen
        config = Object.assign({}, {
            // keine
        }, config);
        
        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            caption: { target: 'html', context: this._captionDom },
            captionCls: { fn: 'function', target: this._captionDom.clsAdd, context: this._captionDom },
            captionHtmlDisplayType: { target: 'htmlDisplayType', context: this._captionDom },
            captionStyle: { fn: 'assign', target: 'style', context: this._captionDom }
        });
        
        // Config anwenden
        if (kijs.isObject(config)) {
            this.applyConfig(config, true);
        }
    }


    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get caption() { return this._captionDom.html; }
    set caption(val) { 
        this._captionDom.html = val; 
        if (this.isRendered) {
            this.render();
        }
    }
    
    get captionDom() { return this._captionDom; }

    get captionHtmlDisplayType() { return this._captionDom.htmlDisplayType; }
    set captionHtmlDisplayType(val) { this._captionDom.htmlDisplayType = val; }
    
    // overwrite
    get isEmpty() { return this._captionDom.isEmpty && kijs.isEmpty(this._elements); }
    
    
    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // Overwrite
    render(preventAfterRender) {
        super.render(true);
        
        // Span caption rendern (kijs.guiDom)
        if (!this._captionDom.isEmpty) {
            this._captionDom.renderTo(this._dom.node, this._innerDom.node);
        } else {
            this._captionDom.unRender();
        }

        // Event afterRender auslösen
        if (!preventAfterRender) {
            this.raiseEvent('afterRender');
        }
    }

    // overwrite
    unRender() {
        this._captionDom.unRender();
        super.unRender();
    }
    
    
    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(preventDestructEvent) {
        // Event auslösen.
        if (!preventDestructEvent) {
            this.raiseEvent('destruct');
        }
        
        // Elemente/DOM-Objekte entladen
        if (this._captionDom) {
            this._captionDom.destruct();
        }
    
        // Variablen (Objekte/Arrays) leeren
        this._captionDom = null;
        
        // Basisklasse entladen
        super.destruct(true);
    }
};
/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.HeaderBar
// --------------------------------------------------------------
kijs.gui.HeaderBar = class kijs_gui_HeaderBar extends kijs.gui.Container {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super();
        
        this._captionDom = new kijs.gui.Dom({
            cls: 'kijs-caption',
            nodeTagName: 'span'
        });
        
        this._iconEl = new kijs.gui.Icon({ parent: this });
        
        this._dom.clsRemove('kijs-container');
        this._dom.clsAdd('kijs-headerbar');
        
        // Standard-config-Eigenschaften mergen
        config = Object.assign({}, {
            // keine
        }, config);
        
        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            caption: { target: 'html', context: this._captionDom },
            captionCls: { fn: 'function', target: this._captionDom.clsAdd, context: this._captionDom },
            captionHtmlDisplayType: { target: 'htmlDisplayType', context: this._captionDom },
            captionStyle: { fn: 'assign', target: 'style', context: this._captionDom },
            icon: { target: 'icon' },
            iconChar: { target: 'iconChar', context: this._iconEl },
            iconCls: { target: 'iconCls', context: this._iconEl },
            iconColor: { target: 'iconColor', context: this._iconEl }
        });
        
        // click- und mouseDown-Event soll nur auf dem label und icon kommen. Bei den elements nicht.
        this._eventForwardsRemove('click', this._dom);
        this._eventForwardsAdd('click', this._captionDom);
        this._eventForwardsAdd('click', this._iconEl.dom);

        this._eventForwardsRemove('dblClick', this._dom);
        this._eventForwardsAdd('dblClick', this._captionDom);
        this._eventForwardsAdd('dblClick', this._iconEl.dom);

        this._eventForwardsRemove('mouseDown', this._dom);
        this._eventForwardsAdd('mouseDown', this._captionDom);
        this._eventForwardsAdd('mouseDown', this._iconEl.dom);

        // Config anwenden
        if (kijs.isObject(config)) {
            this.applyConfig(config, true);
        }
    }


    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get caption() { return this._captionDom.html; }
    set caption(val) { 
        this._captionDom.html = val; 
        if (this.isRendered) {
            this.render();
        }
    }
    
    get captionDom() { return this._captionDom; }

    get captionHtmlDisplayType() { return this._captionDom.htmlDisplayType; }
    set captionHtmlDisplayType(val) { this._captionDom.htmlDisplayType = val; }
    
    get icon() { return this._iconEl; }
    /**
     * Icon zuweisen
     * @param {kijs.gui.Icon|Object} val     Icon als icon-Config oder kijs.gui.Icon Element
     */
    set icon(val) {
        // Icon zurücksetzen?
        if (kijs.isEmpty(val)) {
            this._iconEl.iconChar = null;
            this._iconEl.iconCls = null;
            this._iconEl.iconColor = null;
            if (this.isRendered) {
                this.render();
            }
            
        // kijs.gui.Icon Instanz
        } else if (val instanceof kijs.gui.Icon) {
            this._iconEl.destruct();
            this._iconEl = val;
            if (this.isRendered) {
                this.render();
            }
            
        // Config Objekt
        } else if (kijs.isObject(val)) {
            this._iconEl.applyConfig(val);
            if (this.isRendered) {
                this.render();
            }
            
        } else {
            throw new Error(`config "icon" is not valid.`);
            
        }
    }
    
    get iconChar() { return this._iconEl.iconChar; }
    set iconChar(val) { 
        this._iconEl.iconChar = val;
        if (this.isRendered) {
            this.render();
        }
    }

    get iconCls() { return this._iconEl.iconCls; }
    set iconCls(val) {
        this._iconEl.iconCls = val;
        if (this.isRendered) {
            this.render();
        }
    }
    
    get iconColor() { return this._iconEl.iconColor; }
    set iconColor(val) {
        this._iconEl.iconColor = val;
        if (this.isRendered) {
            this.render();
        }
    }
    
    get isEmpty() { return this._captionDom.isEmpty && this._iconEl.isEmpty && super.isEmpty; }


    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // Overwrite
    render(preventAfterRender) {
        // dom mit Tools rendern (innerDom)
        super.render(true);
        
        // Span icon rendern (icon kijs.gui.Icon)
        if (!this._iconEl.isEmpty) {
            this._iconEl.renderTo(this._dom.node, this._innerDom.node);
        } else {
            this._iconEl.unRender();
        }

        // Span caption rendern (captionDom kijs.guiDom)
        if (!this._captionDom.isEmpty) {
            this._captionDom.renderTo(this._dom.node, this._innerDom.node);
        } else {
            this._captionDom.unRender();
        }

        // Event afterRender auslösen
        if (!preventAfterRender) {
            this.raiseEvent('afterRender');
        }
    }

    // overwrite
    unRender() {
        this._iconEl.unRender();
        this._captionDom.unRender();
        super.unRender();
    }


    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(preventDestructEvent) {
        // Event auslösen.
        if (!preventDestructEvent) {
            this.raiseEvent('destruct');
        }
        
        // Elemente/DOM-Objekte entladen
        if (this._captionDom) {
            this._captionDom.destruct();
        }
        if (this._iconEl) {
            this._iconEl.destruct();
        }
        
        // Variablen (Objekte/Arrays) leeren
        this._captionDom = null;
        this._iconEl = null;
        
        // Basisklasse entladen
        super.destruct(true);
    }
    
};
/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.FooterBar
// --------------------------------------------------------------
kijs.gui.FooterBar = class kijs_gui_FooterBar extends kijs.gui.Container {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super();
        
        this._captionDom = new kijs.gui.Dom({
            cls: 'kijs-caption',
            nodeTagName: 'span'
        });
        
        this._dom.clsRemove('kijs-container');
        this._dom.clsAdd('kijs-footerbar');
        
        // Standard-config-Eigenschaften mergen
        config = Object.assign({}, {
            // keine
        }, config);
        
        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            caption: { target: 'html', context: this._captionDom },
            captionCls: { fn: 'function', target: this._captionDom.clsAdd, context: this._captionDom },
            captionHtmlDisplayType: { target: 'htmlDisplayType', context: this._captionDom },
            captionStyle: { fn: 'assign', target: 'style', context: this._captionDom }
        });
        
        // click-Event soll nur auf dem label kommen. Bei den elements nicht.
        this._eventForwardsRemove('click', this._dom);
        this._eventForwardsAdd('click', this._captionDom);
        
        // Config anwenden
        if (kijs.isObject(config)) {
            this.applyConfig(config, true);
        }
    }


    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get caption() { return this._captionDom.html; }
    set caption(val) { 
        this._captionDom.html = val; 
        if (this.isRendered) {
            this.render();
        }
    }
    
    get captionDom() { return this._captionDom; }

    get captionHtmlDisplayType() { return this._captionDom.htmlDisplayType; }
    set captionHtmlDisplayType(val) { this._captionDom.htmlDisplayType = val; }

    get isEmpty() { return this._captionDom.isEmpty && super.isEmpty; }
    
    

    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // Overwrite
    render(preventAfterRender) {
        // dom mit Tools rendern (innerDom)
        super.render(true);
        
        // Span caption rendern (captionDom kijs.guiDom)
        if (!this._captionDom.isEmpty) {
            this._captionDom.render();
            this._dom.node.appendChild(this._captionDom.node);
        } else {
            this._captionDom.unRender();
        }

        // Event afterRender auslösen
        if (!preventAfterRender) {
            this.raiseEvent('afterRender');
        }
    }

    // overwrite
    unRender() {
        this._captionDom.unRender();
        super.unRender();
    }


    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(preventDestructEvent) {
        // Event auslösen.
        if (!preventDestructEvent) {
            this.raiseEvent('destruct');
        }
        
        // Elemente/DOM-Objekte entladen
        if (this._captionDom) {
            this._captionDom.destruct();
        }
    
        // Variablen (Objekte/Arrays) leeren
        this._captionDom = null;
        
        // Basisklasse entladen
        super.destruct(true);
    }
};
/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.Resizer
// --------------------------------------------------------------
kijs.gui.Resizer = class kijs_gui_Resizer extends kijs.gui.Element {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super();
        
        this._initialPos = null;
        this._targetEl = null;
        
        this._targetMaxHeight = null;
        this._targetMaxWidth = null;
        this._targetMinHeight = null;
        this._targetMinWidth = null;
        
        this._overlayDom = new kijs.gui.Dom({
            cls: 'kijs-resizer-overlay'
        });
        
        this._dom.clsAdd('kijs-resizer');
        
        // Standard-config-Eigenschaften mergen
        config = Object.assign({}, {
            // keine
        }, config);
        
        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            target: { target: '_targetEl' },
            targetMaxHeight: true,
            targetMaxWidth: true,
            targetMinHeight: true,
            targetMinWidth: true
        });
        
        // Listeners
        this.on('mouseDown', this._onMouseDown, this);
        
        // Config anwenden
        if (kijs.isObject(config)) {
            this.applyConfig(config, true);
        }
    }


    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get target() { return this._targetEl; }
    
    get targetMaxHeight() { return this._targetMaxHeight; }
    set targetMaxHeight(val) { this._targetMaxHeight = val; }
    
    get targetMaxWidth() { return this._targetMaxWidth; }
    set targetMaxWidth(val) { this._targetMaxWidth = val; }
    
    get targetMinHeight() { return this._targetMinHeight; }
    set targetMinHeight(val) { this._targetMinHeight = val; }
    
    get targetMinWidth() { return this._targetMinWidth; }
    set targetMinWidth(val) { this._targetMinWidth = val; }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // PROTECTED
    /**
     * Ermittelt die maximale Grösse, die das Element haben darf
     * @returns {Object}
     */
    _getMinMaxSize() {
        const ret = {
            wMin: null,
            wMax: null,
            hMin: null,
            hMax: null
        };

        let parentNode;

        // kijs.gui.Window haben die Eigenschaft targetNode
        const isWindow = !!this._targetEl.targetNode;
        if (isWindow) {
            parentNode = this._targetEl.targetNode;
            
        // Bei allen anderen Elementen ermitteln wir selber
        } else {
            parentNode = this._targetEl.dom.node.parentNode;
        }


        // Maximale Grösse aufgrund des übergeordneten Elements
        // -------------
        // Window
        if (isWindow) {
            ret.wMax = parentNode.clientWidth + parentNode.offsetLeft - this._targetEl.left;
            ret.hMax = parentNode.clientHeight + parentNode.offsetTop - this._targetEl.top;
            
        // Panel und andere Elemente
        } else {
            // Breite
            switch (parentNode.style.overflowX) {
                case 'visible':
                case 'scroll':
                case 'auto':
                    ret.wMax = null;
                    break;

                case 'hidden':
                default:
                    ret.wMax = parentNode.clientWidth - this._targetEl.left;
            }

            // Höhe
            switch (parentNode.style.overflowY) {
                case 'visible':
                case 'scroll':
                case 'auto':
                    ret.hMax = null;
                    break;

                case 'hidden':
                default:
                    ret.hMax = parentNode.clientHeight - this._targetEl.top;
            }
            
        }

        // Max/min Grösse aufgrund der config des resizers
        // -------------
        if (!kijs.isEmpty(this._targetMaxWidth)) {
            if (ret.wMax === null || this._targetMaxWidth < ret.wMax) {
                ret.wMax = this._targetMaxWidth;
            }
        }
        if (!kijs.isEmpty(this._targetMaxHeight)) {
            if (ret.hMax === null || this._targetMaxHeight < ret.hMax) {
                ret.hMax = this._targetMaxHeight;
            }
        }

        if (!kijs.isEmpty(this._targetMinWidth)) {
            if (ret.wMin === null || this._targetMinWidth < ret.wMin) {
                ret.wMin = this._targetMinWidth;
            }
        }
        if (!kijs.isEmpty(this._targetMinHeight)) {
            if (ret.hMin === null || this._targetMinHeight < ret.hMin) {
                ret.hMin = this._targetMinHeight;
            }
        }

        return ret;
    }

    // LISTENERS
    _onMouseDown(e) {
        this._initialPos = {
            x: e.nodeEvent.clientX,
            y: e.nodeEvent.clientY,
            w: this._targetEl.width,
            h: this._targetEl.height
        };

        // Overlay positionieren
        this._overlayDom.top = this._targetEl.top;
        this._overlayDom.left = this._targetEl.left;
        this._overlayDom.width = this._targetEl.width;
        this._overlayDom.height = this._targetEl.height;
        
        // Overlay rendern
        this._overlayDom.render();
        this._targetEl.dom.node.parentNode.appendChild(this._overlayDom.node);

        // mousemove und mouseup Listeners auf das document setzen
        kijs.Dom.addEventListener('mousemove', document, this._onMouseMove, this);
        kijs.Dom.addEventListener('mouseup', document, this._onMouseUp, this);
    }

    _onMouseMove(e) {
        // Neue Grösse ermitteln
        let w = this._initialPos.w + (e.nodeEvent.clientX - this._initialPos.x);
        let h = this._initialPos.h + (e.nodeEvent.clientY - this._initialPos.y);

        // Max/min-Grösse begrenzen
        const minMaxSize = this._getMinMaxSize();
        if (minMaxSize.wMin !== null && w < minMaxSize.wMin) {
            w = minMaxSize.wMin;
        }
        if (minMaxSize.hMin !== null && h < minMaxSize.hMin) {
            h = minMaxSize.hMin;
        }

        if (minMaxSize.wMax !== null && w > minMaxSize.wMax) {
            w = minMaxSize.wMax;
        }
        if (minMaxSize.hMax !== null && h > minMaxSize.hMax) {
            h = minMaxSize.hMax;
        }

        // Grösse zuweisen
        this._overlayDom.width = w;
        this._overlayDom.height = h;
    }

    _onMouseUp(e) {
        // Beim ersten auslösen Listeners gleich wieder entfernen
        kijs.Dom.removeEventListener('mousemove', document, this);
        kijs.Dom.removeEventListener('mouseup', document, this);

        // Neue Grösse ermitteln
        let w = this._initialPos.w + (e.nodeEvent.clientX - this._initialPos.x);
        let h = this._initialPos.h + (e.nodeEvent.clientY - this._initialPos.y);

        // Max/min-Grösse begrenzen
        const minMaxSize = this._getMinMaxSize();
        if (minMaxSize.wMin !== null && w < minMaxSize.wMin) {
            w = minMaxSize.wMin;
        }
        if (minMaxSize.hMin !== null && h < minMaxSize.hMin) {
            h = minMaxSize.hMin;
        }

        if (minMaxSize.wMax !== null && w > minMaxSize.wMax) {
            w = minMaxSize.wMax;
        }
        if (minMaxSize.hMax !== null && h > minMaxSize.hMax) {
            h = minMaxSize.hMax;
        }

        // Grösse zuweisen
        this._targetEl.width = w;
        this._targetEl.height = h;
        
        // Overlay wieder ausblenden
        this._overlayDom.unRender();
    }
    
    
    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(preventDestructEvent) {
        // Event auslösen.
        if (!preventDestructEvent) {
            this.raiseEvent('destruct');
        }
        
        // Elemente/DOM-Objekte entladen
        if (this._overlayDom) {
            this._overlayDom.destruct();
        }
        
        // Variablen (Objekte/Arrays) leeren
        this._initialPos = null;
        this._overlayDom = null;
        this._targetEl = null;
        
        // Basisklasse entladen
        super.destruct(true);
    }
    
};
/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.Splitter
// --------------------------------------------------------------
kijs.gui.Splitter = class kijs_gui_Splitter extends kijs.gui.Element {

    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);
        
        this._overlayDom = new kijs.gui.Dom();
        
        this._targetPos = null;
        this._targetEl = null;      // Zielelement (kijs.gui.Element)
        
        // Standard-config-Eigenschaften mergen
        config = Object.assign({}, {
            targetPos: 'left'
        }, config);
        
        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            target: { target: 'target' },   // Optional. Wenn leer wird das Target aufgrund der targetPos ermittelt
            targetPos: { target: 'targetPos' }
        });
        
        // Listeners
        this.on('mouseDown', this._onMouseDown, this);
        
        // Config anwenden
        if (kijs.isObject(config)) {
            this.applyConfig(config, true);
        }
    }
    
    
    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get direction() {
        if (this._targetPos === 'left' || this._targetPos === 'right') {
            return 'horizontal';
        } else if (this._targetPos === 'top' || this._targetPos === 'bottom') {
            return 'vertical';
        } else {
            throw new Error(`unknown targetPos`);
        }
    }
    
    get target() {
        // Falls das Target nicht bekannt ist: automatisch aufgrund der targetPos ermitteln
        if (!this._targetEl) {
            this.target = this._detectTarget();
            if (!this._targetEl) {
                throw new Error(`config missing "target"`);
            }
        }
        
        return this._targetEl;
    }
    set target(val) {
        if (!val instanceof kijs.gui.Element) {
            throw new Error(`Unkown format on config "target"`);
        }
        this._targetEl = val;
    }

    get targetPos() { return this._targetPos; }
    set targetPos(val) {
        if (!kijs.Array.contains(['top', 'right', 'left', 'bottom'], val)) {
            throw new Error(`unknown targetPos`);
        }
        
        this._targetPos = val;
        
        this._dom.clsRemove(['kijs-splitter-horizontal', 'kijs-splitter-vertical']);
        this._dom.clsAdd('kijs-splitter-' + this.direction);

        this._overlayDom.clsRemove(['kijs-splitter-overlay-horizontal', 'kijs-splitter-overlay-vertical']);
        this._overlayDom.clsAdd('kijs-splitter-overlay-' + this.direction);
    }
    
    


    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // PROTECTED
    /**
     * Ermittelt den Ziel-Node (target), dessen Grösse angepasst werden soll aufgrund der targetPos
     * @returns {HTMLELement}
     */
    _detectTarget() {
        let targetEl = null;
        if (this._targetPos === 'left' || this._targetPos === 'top') {
            targetEl = this.previous;
            
        } else if (this._targetPos === 'right' || this._targetPos === 'bottom') {
            targetEl = this.next;
            
        } 
        return targetEl;
    }
  
    /**
     * Aktualisiert die Overlay-Position aufgrund der Mauszeigerposition
     * @param {Number} xAbs     Mausposition clientX
     * @param {Number} yAbs     Mausposition clientY
     * @returns {undefined}
     */
    _updateOverlayPosition(xAbs, yAbs) {
        // Berechnet aus der absoluten Position bezogen zum Browserrand, 
        // die relative Position bezogen zum übergeordneten DOM-Node
        const parentPos = kijs.Dom.getAbsolutePos(this._dom.node.parentNode);
        const newPos = {
            x: xAbs - parentPos.x,
            y: yAbs - parentPos.x
        };
        
        if (this.direction === 'horizontal') {
            this._overlayDom.left = newPos.x;
        } else {
            this._overlayDom.top = newPos.y;
        }
    }


    // LISTENERS
    _onMouseDown(e) {
        if (this.direction === 'horizontal') {
            this._initialPos = e.nodeEvent.clientX;
        } else {
            this._initialPos = e.nodeEvent.clientY;
        }
        
        // Overlay Positionieren
        this._updateOverlayPosition(e.nodeEvent.clientX, e.nodeEvent.clientY);
        
        // Overlay rendern
        this._overlayDom.render();
        this._dom.node.parentNode.appendChild(this._overlayDom.node);

        // mousemove und mouseup Listeners auf das document setzen
        kijs.Dom.addEventListener('mousemove', document, this._onMouseMove, this);
        kijs.Dom.addEventListener('mouseup', document, this._onMouseUp, this);
    }

    _onMouseMove(e) {
        // Overlay Positionieren
        this._updateOverlayPosition(e.nodeEvent.clientX, e.nodeEvent.clientY);
    }

    _onMouseUp(e) {
        // Beim ersten auslösen Listeners gleich wieder entfernen
        kijs.Dom.removeEventListener('mousemove', document, this);
        kijs.Dom.removeEventListener('mouseup', document, this);

        // Overlay wieder ausblenden
        this._overlayDom.unRender();

        // Differenz zur vorherigen Position ermitteln
        let offset;
        if (this.direction === 'horizontal') {
            offset = e.nodeEvent.clientX - this._initialPos;
        } else {
            offset = e.nodeEvent.clientY - this._initialPos;
        }
        
        // Neue Breite des Zielelements berechnen und zuweisen
        switch (this._targetPos) {
            case 'top': this.target.height = this.target.height + offset; break;
            case 'right': this.target.width = this.target.width - offset; break;
            case 'bottom': this.target.height = this.target.height - offset; break;
            case 'left': this.target.width = this.target.width + offset; break;
        }
    }
    
    
    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(preventDestructEvent) {
        // Event auslösen.
        if (!preventDestructEvent) {
            this.raiseEvent('destruct');
        }
        
        // Elemente/DOM-Objekte entladen
        if (this._overlayDom) {
            this._overlayDom.destruct();
        }
    
        // Variablen (Objekte/Arrays) leeren
        this._overlayDom = null;
        this._targetEl = null;
        
        // Basisklasse entladen
        super.destruct(true);
    }
    
};
/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.Panel
// --------------------------------------------------------------
kijs.gui.Panel = class kijs_gui_Panel extends kijs.gui.Container {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super();
        
        this._headerBarEl = new kijs.gui.HeaderBar({
            parent: this,
            on: {
                click: this._onHeaderBarClick,
                dblClick: this._onHeaderBarDblClick,
                context: this
            }
        });
        
        this._headerEl = new kijs.gui.Container({
            cls: 'kijs-header',
            parent: this
        });
        
        this._footerEl = new kijs.gui.Container({
            cls: 'kijs-footer',
            parent: this
        });
        
        this._footerBarEl = new kijs.gui.FooterBar({
            parent: this
        });
        
        this._collapseHeight = null;
        this._collapseWidth = null;
        
        this._domPos = null;
        
        this._closeButtonEl = null;
        this._collapseButtonEl = null;
        this._maximizeButtonEl = null;
        this._collapsible = false;
        this._resizerEl = null;
        
        this._dom.clsRemove('kijs-container');
        this._dom.clsAdd('kijs-panel');
        
        // Standard-config-Eigenschaften mergen
        config = Object.assign({}, {
            collapseHeight: 50,
            collapseWidth: 50
        }, config);
        
        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            // headerBar
            caption: { target: 'caption', context: this._headerBarEl },
            headerBarElements: { fn: 'function', target: this._headerBarEl.add, context: this._headerBarEl },
            iconChar: { target: 'iconChar', context: this._headerBarEl },
            iconCls: { target: 'iconCls', context: this._headerBarEl },
            iconColor: { target: 'iconColor', context: this._headerBarEl },
            
            // header
            headerCls: { fn: 'function', target: this._headerEl.dom.clsAdd, context: this._headerEl.dom },
            headerElements: { fn: 'function', target: this._headerEl.add, context: this._headerEl },
            headerStyle: { fn: 'assign', target: 'style', context: this._headerEl.dom },
            
            // footer
            footerCls: { fn: 'function', target: this._footerEl.dom.clsAdd, context: this._footerEl.dom },
            footerElements: { fn: 'function', target: this._footerEl.add, context: this._footerEl },
            footerStyle: { fn: 'assign', target: 'style', context: this._footerEl.dom },
            
            // footerBar
            footerCaption: { target: 'caption', context: this._footerBarEl },
            footerBarElements: { fn: 'function', target: this._footerBarEl.add, context: this._footerBarEl },
            
            resizable: { target: 'resizable' }, // Soll in der rechten unteren Ecke das resize-Sybmol zum ändern der Grösse angezeigt werden.
            shadow: { target: 'shadow' },       // Soll ein Schatten angezeigt werden?
            
            collapseHeight: true,
            collapseWidth: true,
            
            collapsePos: { prio: 1001, target: 'collapsePos' },
            collapsible: { prio: 1002, target: 'collapsible' },
            collapseButton: { prio: 1003, target: 'collapseButton' },
            collapsed: { prio: 1004, target: 'collapsed' },

            maximizable: { prio: 1010, target: 'maximizable' },
            maximizeButton: { prio: 1011, target: 'maximizeButton' },
            maximized: { prio: 1012, target: 'maximized' },
            
            closable: { prio: 1013, target: 'closable' },
            closeButton: { prio: 1014, target: 'closeButton' }
            
        });
        
        // Listeners
        this.on('enterPress', this._onEnterPress, this);
        this.on('escPress', this._onEscPress, this);
        
        // Config anwenden
        if (kijs.isObject(config)) {
            this.applyConfig(config, true);
        }
    }


    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get closable() { return !!this._closeButtonEl;}
    set closable(val) {
        if (val) {
            if (!this._closeButtonEl) {
                this.closeButton = {
                    iconChar: '&#xf00d'
                }; 
            }
        } else {
            if (this._closeButtonEl) {
                this.closeButton = null; 
            }
        }
    }
    
    get closeButton() { return this._closeButtonEl; }
    set closeButton(val) {
        
        // Button entfernen
        if (kijs.isEmpty(val)) {
            this._headerBarEl.remove(this._closeButtonEl);
            this._closeButtonEl = null;
        
        // Instanz von kijs.gui.Button
        } else if (val instanceof kijs.gui.Button) {
            if (this._closeButtonEl) {
                this._headerBarEl.remove(this._closeButtonEl);
            }
            this._closeButtonEl = val;
            this._closeButtonEl.on('click', this._onCloseClick, this);
            this._headerBarEl.add(this._closeButtonEl);
            
        // Config-Objekt
        } else if (kijs.isObject(val)) {
            if (this._closeButtonEl) {
                this._closeButtonEl.applyConfig(val);
            } else {
                this._closeButtonEl = new kijs.gui.Button(val);
                this._closeButtonEl.on('click', this._onCloseClick, this);
                this._headerBarEl.add(this._closeButtonEl);
            }
            
        } else {
            throw new Error(`Unkown format on config "closeButton"`);
        }
        
        if (this.isRendered) {
            this.render();
        }
    }
    
    
    get collapsible() {
        if (this._collapseButtonEl) {
            return this._collapsible;
        } else {
            return false;
        }
    }
    set collapsible(val) {
        const validePos = ['top', 'right', 'bottom', 'left'];
        
        if (kijs.isEmpty(val) || val === false) {
            val = false;
            this._collapsible = false;
        } else {
            if (kijs.Array.contains(validePos, val)) {
                this._collapsible = val;
            } else {
                throw new Error(`Unkown pos on config "collapsible"`); 
            }
        }
        
        if (val) {
            if (!this._collapseButtonEl) {
                this.collapseButton = {
                    iconChar: this._getCollapseIconChar()
                }; 
            }
        } else {
            if (this._collapseButtonEl) {
                this.collapseButton = null; 
            }
        }
    }
    
    get collapseButton() { return this._collapseButtonEl; }
    set collapseButton(val) {
        
        // Button entfernen
        if (kijs.isEmpty(val)) {
            this._headerBarEl.remove(this._collapseButtonEl);
            this._collapseButtonEl = null;
        
        // Instanz von kijs.gui.Button
        } else if (val instanceof kijs.gui.Button) {
            if (this._collapseButtonEl) {
                this._headerBarEl.remove(this._collapseButtonEl);
            }
            this._collapseButtonEl = val;
            this._collapseButtonEl.on('click', this._onCollapseClick, this);
            this._headerBarEl.add(this._collapseButtonEl);
            
        // Config-Objekt
        } else if (kijs.isObject(val)) {
            if (this._collapseButtonEl) {
                this._collapseButtonEl.applyConfig(val);
            } else {
                this._collapseButtonEl = new kijs.gui.Button(val);
                this._collapseButtonEl.on('click', this._onCollapseClick, this);
                this._headerBarEl.add(this._collapseButtonEl);
            }
            
        } else {
            throw new Error(`Unkown format on config "collapseButton"`); 
        }
        
        if (this.isRendered) {
            this.render();
        }
    }
    
    get collapsed() {
        return this._dom.clsHas('kijs-collapse-top') || 
                this._dom.clsHas('kijs-collapse-right') || 
                this._dom.clsHas('kijs-collapse-bottom') ||
                this._dom.clsHas('kijs-collapse-left');
    }
    set collapsed(val) {
        if (val) {
            this.collapse();
        } else {
            this.expand();
        }
    }
    
    get collapseHeight() { return this._collapseHeight; }
    set collapseHeight(val) { this._collapseHeight = val; }
    
    get draggable() { return false; }
    
    get footer() { return this._footerEl; }
    
    get footerBar() { return this._footerBarEl; }
    
    get header() { return this._headerEl; }
    
    get headerBar() { return this._headerBarEl; }

    // overwrite
    get height() { return super.height; }
    set height(val) {
        let doFn = false;
        
        if (kijs.Array.contains(['top', 'bottom'], this.collapsible) && kijs.isNumber(this._collapseHeight)) {
            if (val <= this._collapseHeight) {
                doFn = 'collapse';
            } else if (this.collapsed) {
                doFn = 'expand';
            }
        }
        
        if (doFn === 'collapse') {
            if (!this.collapsed) {
                this.collapse();
            }
        } else if (doFn === 'expand') {
            this.expand(val);
        } else {
            super.height = val;
        }
    }

    get maximizable() { return !!this._closeButtonEl;}
    set maximizable(val) {
        if (val) {
            if (!this._maximizeButtonEl) {
                this.maximizeButton = new kijs.gui.Button({
                    iconChar: this._getMaximizeIconChar()
                });
            }
        } else {
            if (this._maximizeButtonEl) {
                this.maximizeButton = null; 
            }
        }
    }
    
    get maximizeButton() { return this._maximizeButtonEl; }
    set maximizeButton(val) {
        // Button entfernen
        if (kijs.isEmpty(val)) {
            this._headerBarEl.remove(this._maximizeButtonEl);
            this._maximizeButtonEl = null;
        
        // Instanz von kijs.gui.Button
        } else if (val instanceof kijs.gui.Button) {
            if (this._maximizeButtonEl) {
                this._headerBarEl.remove(this._maximizeButtonEl);
            }
            this._maximizeButtonEl = val;
            this._maximizeButtonEl.on('click', this._onMaximizeClick, this);
            this._headerBarEl.add(this._maximizeButtonEl);
            
        // Config-Objekt
        } else if (kijs.isObject(val)) {
            if (this._maximizeButtonEl) {
                this._maximizeButtonEl.applyConfig(val);
            } else {
                this._maximizeButtonEl = new kijs.gui.Button(val);
                this._maximizeButtonEl.on('click', this._onMaximizeClick, this);
                this._headerBarEl.add(this._maximizeButtonEl);
            }
            
        } else {
            throw new Error(`Unkown format on config "maximizeButton"`); 
        }
        
        if (this.isRendered) {
            this.render();
        }
    }
    
    get maximized() {
        return this._dom.clsHas('kijs-maximize');
    }
    set maximized(val) {
        if (val) {
            this.maximize();
        } else {
            this.restore();
        }
    }


    get resizable() { return !!this._resizerEl; }
    set resizable(val) {
        if (!!val !== !!this._resizerEl) {
            if (this._resizerEl) {
                this._resizerEl.destruct();
                this._resizerEl = null;
            } else {
                this._resizerEl = new kijs.gui.Resizer({
                    target: this
                });
                if (this._dom.node) {
                    this._resizerEl.renderTo(this._dom.node);
                }
            }
        }
    }
    
    get shadow() { this._dom.clsHas('kijs-shadow'); }
    set shadow(val) {
        if (val) {
            this._dom.clsAdd('kijs-shadow');
        } else {
            this._dom.clsRemove('kijs-shadow');
        }
    }
    
    // overwrite
    get width() { return super.width; }
    set width(val) {
        let doFn = false;
        
        if (kijs.Array.contains(['left', 'right'], this.collapsible) && kijs.isNumber(this._collapseWidth)) {
            if (val <= this._collapseWidth) {
                doFn = 'collapse';
            } else if (this.collapsed) {
                doFn = 'expand';
            }
        }
        
        if (doFn === 'collapse') {
            if (!this.collapsed) {
                this.collapse();
            }
        } else if (doFn === 'expand') {
            this.expand(val);
        } else {
            super.width = val;
        }
    }
    

    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    /**
     * Schliesst das Panel
     * @returns {undefined}
     */
    close() {
        if (this._parentEl && this._parentEl instanceof kijs.gui.Container && this._parentEl.hasChild(this)) {
            this._parentEl.remove(this);
        } else {
            this.destruct();
        }
    }

    /**
     * Minimiert das Panel in eine gewünschte Richtung
     * @param {String} direction [optional]
     * @returns {undefined}
     */
    collapse(direction) {
        // afterResize-Event deaktivieren
        const prevAfterRes = this._preventAfterResize;
        this._preventAfterResize = true;

        if (this.maximized) {
            this.restore();
        }
        
        if (direction) {
            this._collapsible = direction;
        }

        if (!this._collapsible) {
            this._collapsible = 'top';
        }
        
        this._dom.clsRemove(['kijs-collapse-top', 'kijs-collapse-right', 'kijs-collapse-bottom', 'kijs-collapse-left']);

        switch (this._collapsible) {
            case 'top':    this._dom.clsAdd('kijs-collapse-top'); break;
            case 'right':  this._dom.clsAdd('kijs-collapse-right'); break;
            case 'bottom': this._dom.clsAdd('kijs-collapse-bottom'); break;
            case 'left':   this._dom.clsAdd('kijs-collapse-left'); break;
        }
        
        // das richtige Icon in den Button
        if (this._collapseButtonEl) {
            this._collapseButtonEl.iconChar = this._getCollapseIconChar();
        }

        // afterResize-Event wieder aktivieren
        this._preventAfterResize = prevAfterRes;
        
        // Evtl. afterResize-Event zeitversetzt auslösen
        this._raiseAfterResizeEvent(true);
    }

    /**
     * Expandiert das Panel
     * @param {number} size [optional] Breite oder Höhe in die das Panel wiederhergestellt werden soll
     * @returns {undefined}
     */
    expand(size) {
        // afterResize-Event deaktivieren
        const prevAfterRes = this._preventAfterResize;
        this._preventAfterResize = true;
        
        this._dom.clsRemove(['kijs-collapse-top', 'kijs-collapse-right', 'kijs-collapse-bottom', 'kijs-collapse-left']);

        // das richtige Icon in den Button
        if (this._collapseButtonEl) {
            this._collapseButtonEl.iconChar = this._getCollapseIconChar();
        }
        
        // Übergebene Grösse wiederherstellen
        if (!kijs.isEmpty(size)) {
            switch (this._collapsible) {
                case 'top':
                case 'bottom':
                    if (size > this._collapseHeight) {
                        this.height = size;
                    }
                    break;

                case 'right':
                case 'left':
                    if (size > this._collapseWidth) {
                        this.width = size;
                    }
                    break;
            }
        }
        
        // afterResize-Event wieder aktivieren
        this._preventAfterResize = prevAfterRes;
        
        // Evtl. afterResize-Event zeitversetzt auslösen
        this._raiseAfterResizeEvent(true);
    }
    
    // overwrite
    focus(alsoSetIfNoTabIndex=false) {
        if (alsoSetIfNoTabIndex) {
            return super.focus(alsoSetIfNoTabIndex);
            
        } else {
            // Zuerst versuchen den Fokus auf ein Element im innerDom zu setzen
            let node = this._innerDom.focus(false);
            // dann auf eine Schaltfläche im footer
            if (!node && !this._footerEl.isEmpty && this._footerEl.isRendered) {
                node = this._footerEl.focus(alsoSetIfNoTabIndex);
            }
            // falls nicht erfolgreich. Den Fokus direkt auf das Fenster setzen
            if (!node) {
                node = super.focus(alsoSetIfNoTabIndex);
            }
            return node;
        }
        
        // Darf der Node den Fokus erhalten?
        if (alsoSetIfNoTabIndex) {
            this._dom.node.focus();

        // sonst den Fokus auf den ersten möglichen untegeordneten Node settzen
        } else {
            const node = kijs.Dom.getFirstFocusableNode(this._node);
            if (node) {
                node.focus();
            }
        }
    }
    
    /**
     * Maximiert das Panel
     * @returns {undefined}
     */
    maximize() {
        if (this.maximized) {
            return;
        }
        
        // afterResize-Event deaktivieren
        const prevAfterRes = this._preventAfterResize;
        this._preventAfterResize = true;

        if (this.collapsed) {
            this.expand();
        }
        
        if (this.isRendered) {
            this._domPos = {
                parent: this._dom.node.parentNode,
                nextSibling: this._dom.node.nextSibling
            };
            document.body.appendChild(this._dom.node);
        }

        this._dom.clsAdd('kijs-maximize');

        // das richtige Icon in den Button
        if (this._maximizeButtonEl) {
            this._maximizeButtonEl.iconChar = this._getMaximizeIconChar();
        }
        
        // afterResize-Event wieder aktivieren
        this._preventAfterResize = prevAfterRes;
        
        // Evtl. afterResize-Event zeitversetzt auslösen
        this._raiseAfterResizeEvent(true);
    }

    // Overwrite
    render(preventAfterRender) {
        // dom mit elements rendern (innerDom)
        super.render(true);
        
        // Panel selektierbar machen
        this._dom.node.tabIndex = -1;
        
        // HeaderBar rendern (kijs.gui.HeaderBar)
        if (!this._headerBarEl.isEmpty) {
            this._headerBarEl.renderTo(this._dom.node, this._innerDom.node);
        } else {
            this._headerBarEl.unRender();
        }

        // Header rendern (kijs.gui.Container)
        if (!this._headerEl.isEmpty) {
            this._headerEl.renderTo(this._dom.node, this._innerDom.node);
        } else {
            this._headerEl.unRender();
        }
        
        // Footer rendern (kijs.gui.Container)
        if (!this._footerEl.isEmpty) {
            this._footerEl.renderTo(this._dom.node);
        } else {
            this._footerEl.unRender();
        }
        
        // FooterBar rendern (kijs.gui.FooterBar)
        if (!this._footerBarEl.isEmpty) {
            this._footerBarEl.renderTo(this._dom.node);
        } else {
            this._footerBarEl.unRender();
        }

        // resizer
        if (this._resizerEl) {
            this._resizerEl.renderTo(this._dom.node);
        }
        
        // Event afterRender auslösen
        if (!preventAfterRender) {
            this.raiseEvent('afterRender');
        }
    }
    
    // Overwrite
    renderTo(targetNode, insertBefore) {
        // Falls das Panel schon maximiert geöffnet werden soll, muss der Node zum body verschoben werden
        if (this.maximized && kijs.isEmpty(this._domPos)) {
            this._domPos = {
                parent: targetNode,
                nextSibling: insertBefore
            };
            targetNode = document.body;
            insertBefore = null;
        }
        
        super.renderTo(targetNode, insertBefore);
    }

    /**
     * Verlässt die maximierte Ansicht
     * @returns {undefined}
     */
    restore() {
        if (!this.maximized) {
            return;
        }
        
        // afterResize-Event deaktivieren
        const prevAfterRes = this._preventAfterResize;
        this._preventAfterResize = true;
        
        if (this._domPos.nextSibling) {
            this._domPos.parent.insertBefore(this._dom.node, this._domPos.nextSibling);
        } else {
            this._domPos.parent.appendChild(this._dom.node);
        }
        
        this._dom.clsRemove('kijs-maximize');

        // das richtige Icon in den Button
        if (this._maximizeButtonEl) {
            this._maximizeButtonEl.iconChar = this._getMaximizeIconChar();
        }
        
        // afterResize-Event wieder aktivieren
        this._preventAfterResize = prevAfterRes;
        
        // Evtl. afterResize-Event zeitversetzt auslösen
        this._raiseAfterResizeEvent(true);
    }

    // overwrite
    unRender() {
        this._headerBarEl.unRender();
        this._headerEl.unRender();
        this._footerEl.unRender();
        this._footerBarEl.unRender();
        this._resizerEl.unRender();
        super.unRender();
    }
    
    
    // PROTECTED
    /**
     * Gibt das Icon für den Maximieren-Knopf zurück
     * @returns {String}
     */
    _getMaximizeIconChar() {
        let char = '';

        if (this.maximized) {
            char = '&#xf2d2';   // restore
        } else {
            char = '&#xf2d0';   // maximize
        }
        
        return char;
    }

    /**
     * Gibt das Icon für den Collapse-Knopf zurück
     * @returns {undefined}
     */
    _getCollapseIconChar() {
        let char = '';

        if (this.collapsed) {
            switch (this._collapsible) {
                case 'top': char = '&#xf0d7'; break;   // carret-down
                case 'right': char = '&#xf0d9'; break; // carret-left
                case 'bottom': char = '&#xf0d8'; break;// carret-up
                case 'left': char = '&#xf0da'; break;  // carret-right
            }
        } else {
            switch (this._collapsible) {
                case 'top': char = '&#xf0d8'; break;   // carret-up
                case 'right': char = '&#xf0da'; break; // carret-right
                case 'bottom': char = '&#xf0d7'; break;// carret-down
                case 'left': char = '&#xf0d9'; break;  // carret-left
            }
        }
        return char;
    }

    // LISTENERS
    _onCloseClick(e) {
        this.close();
    }
    
    _onCollapseClick(e) {
        if (this.collapsed) {
            this.expand();
        } else {
            this.collapse();
        }
    }

    _onEscPress(e) {
        if (this.closable) {
            this.close();
        }
    }

    _onEnterPress(e) {
        // Gibt es einen Button mit Eigenschaft isDefault?
        if (this._footerEl) {
            kijs.Array.each(this._footerEl.elements, function(el) {
                if (el instanceof kijs.gui.Button && el.dom && el.isDefault) {
                    el.raiseEvent('click');
                    return;
                }
            }, this);
        }
    }

    _onHeaderBarClick(e) {
        // Ein Panel (draggable=false) kann per click auf die HeaderBar auf/zugeklappt werden.
        if (this.collapsible && !this.maximized && !this.draggable) {
            if (this.collapsed) {
                this.expand();
            } else {
                this.collapse();
            }
        }
    }
    
    _onHeaderBarDblClick(e) {
        // Ein Fenster (draggable=true) kann per dblClick auf die HeaderBar maximiert werden.
        if (this.maximizable && this.draggable) {
            if (this.maximized) {
                this.restore();
            } else {
                this.maximize();
            }
            
        // Falls das Fenster maximiert ist, kann es jederzeit durch einen Doppelklick wiederhergestellt werden
        } else if (this.maximizable && this.maximized) {
            this.restore();
        }
    }

    _onMaximizeClick(e) {
        if (this.maximized) {
            this.restore();
        } else {
            this.maximize();
        }
    }
    
    
    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(preventDestructEvent) {
        // Event auslösen.
        if (!preventDestructEvent) {
            this.raiseEvent('destruct');
        }
        
        // Elemente/DOM-Objekte entladen
        if (this._headerBarEl) {
            this._headerBarEl.destruct();
        }
        if (this._headerEl) {
            this._headerEl.destruct();
        }
        if (this._footerEl) {
            this._footerEl.destruct();
        }
        if (this._footerBarEl) {
            this._footerBarEl.destruct();
        }
        if (this._resizerEl) {
            this._resizerEl.destruct();
        }
        
        // Variablen (Objekte/Arrays) leeren
        this._domPos = null;
        this._headerBarEl = null;
        this._headerEl = null;
        this._footerEl = null;
        this._footerBarEl = null;
        this._closeButtonEl = null;
        this._collapseButtonEl = null;
        this._maximizeButtonEl = null;
        this._resizerEl = null;
        
        // Basisklasse entladen
        super.destruct(true);
    }
    
};
/* global kijs, this, HTMLElement */

// --------------------------------------------------------------
// kijs.gui.Mask
// --------------------------------------------------------------
// Halbtransparente Maske, die über den Body oder ein kijs.gui.Element gelegt wird
// und so die Bedienung der dahinterliegenden Oberfläche verhindert.
// Mit der Eigenschaft displayWaitIcon=true kann ein Ladesymbol mitangezeigt werden.
// Das Element, dass überdeckt wird, wird mit der Eigenschaft target festgelegt.
// Dies kann der document.body sein oder ein kijs.gui.Element.
// Beim Body als target ist der Body auch gleich der übergeordnete Node (parentNode).
// Beim einem kijs.gui.Element als target ist das übergeordnete Element nicht der node 
// des Elements, sondern dessen parentNode.
// Deshalb gibt es die Eigenschaften targetNode und parentNode, welche bei einem
// kijs.gui.Element als target nicht den gleichen node als Inhalt haben. Beim body 
// als target, hingegen schon.
// Mit der targetDomProperty kann noch festgelegt werden, welcher node eines Elements 
// als target dient, wird nichts angegeben, so dient das ganze Element als target. 
// Es kann z.B. bei einem kijs.gui.Panel nur der innere Teil als target angegeben werden.
// Dazu kann die Eigenschaft targetDomProperty="innerDom" definiert werden.
// --------------------------------------------------------------
kijs.gui.Mask = class kijs_gui_Mask extends kijs.gui.Element {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);
        
        this._iconEl = new kijs.gui.Icon({ parent: this });
        
        this._targetX = null;           // Zielelement (kijs.gui.Element) oder Body (HTMLElement)
        this._targetDomProperty = 'dom'; // Dom-Eigenschaft im Zielelement (String) (Spielt bei Body als target keine Rolle)
        
        this._dom.clsAdd('kijs-mask');
        
        // Standard-config-Eigenschaften mergen
        config = Object.assign({}, {
            target: document.body
        }, config);
        
        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            displayWaitIcon: { target: 'displayWaitIcon' },
            icon: { target: 'icon' },
            iconChar: { target: 'iconChar', context: this._iconEl },
            iconCls: { target: 'iconCls', context: this._iconEl },
            iconColor: { target: 'iconColor', context: this._iconEl },
            target: { target: 'target' },
            targetDomProperty: true
        });
        
        // Config anwenden
        if (kijs.isObject(config)) {
            this.applyConfig(config, true);
        }
    }


    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get displayWaitIcon() {
        return this._iconEl.iconChar === '&#xf110;';
    }
    set displayWaitIcon(val) {
        if (val) {
            this.iconChar = '&#xf110;';
            this._iconEl.dom.clsAdd('kijs-pulse');
        } else {
            this.iconChar = null;
            this._iconEl.dom.clsRemove('kijs-pulse');
        }
    }
    get icon() { return this._iconEl; }
    /**
     * Icon zuweisen
     * @param {kijs.gui.Icon|Object} val     Icon als icon-Config oder kijs.gui.Icon Element
     */
    set icon(val) {
        // Icon zurücksetzen?
        if (kijs.isEmpty(val)) {
            this._iconEl.iconChar = null;
            this._iconEl.iconCls = null;
            this._iconEl.iconColor = null;
            if (this.isRendered) {
                this.render();
            }
            
        // kijs.gui.Icon Instanz
        } else if (val instanceof kijs.gui.Icon) {
            this._iconEl.destruct();
            this._iconEl = val;
            if (this.isRendered) {
                this.render();
            }
            
        // Config Objekt
        } else if (kijs.isObject(val)) {
            this._iconEl.applyConfig(val);
            if (this.isRendered) {
                this.render();
            }
            
        } else {
            throw new Error(`config "icon" is not valid.`);
            
        }
    }
    
    get iconChar() { return this._iconEl.iconChar; }
    set iconChar(val) { 
        this._iconEl.iconChar = val;
        if (this.isRendered) {
            this.render();
        }
    }

    get iconCls() { return this._iconEl.iconCls; }
    set iconCls(val) {
        this._iconEl.iconCls = val;
        if (this.isRendered) {
            this.render();
        }
    }
    
    get iconColor() { return this._iconEl.iconColor; }
    set iconColor(val) {
        this._iconEl.iconColor = val;
        if (this.isRendered) {
            this.render();
        }
    }
    
    // overwrite
    get isEmpty() { return this._iconEl.isEmpty; }
    
    /**
     * Gibt den Node zurück in dem sich die Maske befindet (parentNode)
     * @returns {HTMLElement}
     */
    get parentNode() {
        if (this._targetX instanceof kijs.gui.Element) {
            return this._targetX[this._targetDomProperty].node.parentNode;
        } else {
            return this._targetX;
        }
    }
    
    get target() {
        return this._targetX;
    }
    set target(val) {
        // Evtl. Listeners vom alten _targetX entfernen
        if (!kijs.isEmpty(this._targetX)) {
            if (this._targetX instanceof kijs.gui.Element) {
                this._targetX.off('afterResize', this._onTargetElAfterResize, this);
                this._targetX.off('changeVisibility', this._onTargetElChangeVisibility, this);
                this._targetX.off('destruct', this._onTargetElDestruct, this);
            }
        }
        
        // Target ist ein kijs.gui.Element
        if (val instanceof kijs.gui.Element) {
            this._targetX = val;
            
            this._targetX.on('afterResize', this._onTargetElAfterResize, this);
            this._targetX.on('changeVisibility', this._onTargetElChangeVisibility, this);
            this._targetX.on('destruct', this._onTargetElDestruct, this);
            
        // Target ist der Body
        } else if (val === document.body || val === null) {
            this._targetX = document.body;
            
        } else {
            throw new Error(`Unkown format on config "target"`);
            
        }
    }
    
    get targetDomProperty() { return this._targetDomProperty; };
    set targetDomProperty(val) { this._targetDomProperty = val; };
    
    /**
     * Gibt den Ziel-Node zurück, über den die Maske gelegt wird
     * @returns {HTMLElement}
     */
    get targetNode() {
        if (this._targetX instanceof kijs.gui.Element) {
            return this._targetX[this._targetDomProperty].node;
        } else {
            return this._targetX;
        }
    }
    

    
    
    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // Overwrite
    render(preventAfterRender) {
        super.render(true);
        
        // Maskierung positionieren
        this._updateMaskPosition();
        
        // Span icon rendern (kijs.gui.Icon)
        if (!this._iconEl.isEmpty) {
            this._iconEl.renderTo(this._dom.node);
        } else {
            this._iconEl.unRender();
        }

        // Event afterRender auslösen
        if (!preventAfterRender) {
            this.raiseEvent('afterRender');
        }
    }

    // overwrite
    unRender() {
        this._iconEl.unRender();
        super.unRender();
    }

    /**
     * Zeigt die Maskierung an
     * @returns {undefined}
     */
    show() {
        // Maske anzeigen
        this.renderTo(this.parentNode);
    }


    // PROTECTED
    _updateMaskPosition() {
        // targetX === kijs.gui.Element
        if (this._targetX instanceof kijs.gui.Element) {
            this.top = this._targetX[this._targetDomProperty].top;
            this.left = this._targetX[this._targetDomProperty].left;
            this.height = this._targetX[this._targetDomProperty].height;
            this.width = this._targetX[this._targetDomProperty].width;
        }
    }


    // LISTENERS
    _onTargetElAfterResize(e) {
        // Maskierung positionieren
        this._updateMaskPosition();
    }

    _onTargetElChangeVisibility(e) {
        // Maskierung positionieren
        this._updateMaskPosition();
        // Sichbarkeit ändern
        this.visible = e.visible;
    }

    _onTargetElDestruct(e) {
        this.destruct();
    }


    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(preventDestructEvent) {
        // Event auslösen.
        if (!preventDestructEvent) {
            this.raiseEvent('destruct');
        }
        
        // Event-Listeners entfernen
        if (this._targetX instanceof kijs.gui.Element) {
            this._targetX.off(null, null, this);
        }
        
        // Elemente/DOM-Objekte entladen
        if (this._iconEl) {
            this._iconEl.destruct();
        }
    
        // Variablen (Objekte/Arrays) leeren
        this._iconEl = null;
        this._targetX = null;
        
        // Basisklasse entladen
        super.destruct(true);
    }
};
/* global kijs, HTMLElement */

// --------------------------------------------------------------
// kijs.gui.LayerManager (Singleton)
// --------------------------------------------------------------
// Der Layermanager wird verwendet um den z-index von Fenstern zu managen.
// Wird ein Fenster angeklickt, so wird der z-index aller Fenster mit dem gleichen 
// parentNode neu berechnet und es erscheint zuvorderst.
// Neben kijs.gui.Window können auch Masken (kijs.gui.Mask) in den Layermanager 
// aufgenommen werden. Dies ist bei modalen Fenster notwendig. Deren masken werden
// separat im Layermanager geführt.
// --------------------------------------------------------------
kijs.gui.LayerManager = class kijs_gui_LayerManager {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor() {
        // Singleton (es wird immer die gleiche Instanz zurückgegeben)
        if (!kijs_gui_LayerManager._singletonInstance) {
            kijs_gui_LayerManager._singletonInstance = this;

            // Variablen
            this._parents = new Map();  // Map mit allen parents
                                        // key = parentNode (HTMLElement)
                                        // value = {
                                        //   activeEl: Verweis auf das aktive Fenster (kijs.gui.Window|kijs.gui.Mask)
                                        //   stack: [
                                        //       el: Verweis auf Fenster/Maske (kijs.gui.Window|kijs.gui.Mask)
                                        //   ]
                                        // }
                                        //
                                        // Die Elemente im Stack sind normalerweise kijs.gui.Window.
                                        // Es können aber auch kijs.gui.Mask sein, dies sind die Mask-Layers von
                                        // modalen Fenstern, die einen eigenen z-index erhalten.
            
            this._startZIndex = 10000;
        }
        return kijs_gui_LayerManager._singletonInstance;
    }


    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    /**
     * Gibt das oberste Element zurück
     * @param {HTMLElement} parentNode
     * @returns {kijs.gui.Element|Null}
     */
    getActive(parentNode) {
        const parentProp =  this._parents.get(parentNode);
        
        if (parentProp && parentProp.activeEl) {
            return parentProp.activeEl;
        } else {
            return null;
        }
    }
    

    /**
     * Bringt ein Element in den Vordergrund
     * @param {kijs.gui.Element} el
     * @returns {Boolean} Wurden Änderungen gemacht?
     */
    setActive(el) {
        // Ist das Element schon zuoberst?
        if (el === this.getActive(el.parentNode)) {
            return false;
        }
        
        // falls das Element schon drin ist: entfernen
        this.removeElement(el, true);
        
        // und am Ende wieder anfügen
        this.addElement(el);
        
        // z-indexe den Elementen neu zuweisen
        this._assignZIndexes(el.parentNode);

        // Oberstes sichtbares Element aktualisieren und Fokus setzen
        const parentProp =  this._parents.get(el.parentNode);
        parentProp.activeEl = this._getTopVisibleElement(el.parentNode);
        if (parentProp.activeEl) {
            parentProp.activeEl.focus();
        }

        return true;
    }
    
    /**
     * Fügt eine Element an
     * @param {kijs.gui.Element} el
     * @returns {undefined}
     */
    addElement(el) {
        let parentProp =  this._parents.get(el.parentNode);
        if (!parentProp) {
            parentProp = {
                activeEl: null,
                stack: []
            };
            this._parents.set(el.parentNode, parentProp);
        }
        
        // Wenn das Element schon drin ist: Fehler
        if (kijs.Array.contains(parentProp.stack, el)) {
            throw new Error(`element is duplicated in layermanager`);
        }
        
        parentProp.stack.push(el);
        
        // Listeners erstellen, damit wenn, dass Element entladen wird alles neu geordnet wird 
        // Wenn die Sichtbarkeit ändert, wird ein anderes element aktiviert
        el.on('destruct', this._onElementDestruct, this);
        el.on('changeVisibility', this._onElementChangeVisibility, this);
    }
    
    /**
     * Entfernt ein Element aus dem LayerManager
     * @param {kijs.gui.Element} el
     * @param {Boolean} [preventReorder=false] z-Indexe nicht neu zuweisen?
     * @returns {Boolean} Wurden Änderungen gemacht?
     */
    removeElement(el, preventReorder) {
        let changed = false;
        let parentProp =  this._parents.get(el.parentNode);
        
        if (kijs.isEmpty(parentProp) || kijs.isEmpty(parentProp.stack)) {
            return changed;
        }
        
        const newElements = [];
        for (let i=0; i<parentProp.stack.length; i++) {
            if (parentProp.stack[i] === el) {
                changed = true;
            } else {
                newElements.push(parentProp.stack[i]);
            }
        }
        parentProp.stack = newElements;
        
        // Evtl. parentNode entfernen, wenn leer
        if (parentProp.stack.length === 0) {
            this._parents.delete(el.parentNode);
            parentProp = null;
        }
        
        // Listeners entfernen
        el.off('destruct', this._onElementDestruct, this);
        el.off('changeVisibility', this._onElementChangeVisibility, this);
        
        // falls was geändert hat
        if (parentProp && changed && !preventReorder) {
            // z-indexe der Fenster neu zuweisen
            this._assignZIndexes(el.parentNode);

            // Oberstes sichtbares Element aktualisieren und Fokus setzen
            parentProp.activeEl = this._getTopVisibleElement(el.parentNode);
            if (parentProp.activeEl) {
                parentProp.activeEl.focus();
            }
        }
        
        return changed;
    }


    // PROTECTED
    /**
     * Nummeriert die z-Indexe der Elemente neu durch und entfernt gelöschte Fenster
     * @param {HTMLElement} parentNode
     * @returns {undefined}
     */
    _assignZIndexes(parentNode) {
        let zIndex = this._startZIndex;
        const parentProp =  this._parents.get(parentNode);
        
        if (kijs.isEmpty(parentProp) || kijs.isEmpty(parentProp.stack)) {
            return;
        }
        
        kijs.Array.each(parentProp.stack, function(el) {
            el.style.zIndex = zIndex;
            zIndex += 10;
        }, this);
    }

    /**
     * Gibt das oberste sichtbare Element zurück
     * @param {HTMLElement} parentNode
     * @returns {kijs.gui.Element}
     */
    _getTopVisibleElement(parentNode) {
        const parentProp =  this._parents.get(parentNode);
        
        if (kijs.isEmpty(parentProp) || kijs.isEmpty(parentProp.stack)) {
            return;
        }
        
        for (let i=parentProp.stack.length-1; i>=0; i--) {
            if (parentProp.stack[i].visible) {
                return parentProp.stack[i];
            }
        }
        
        return null;
    }


    // LISTENERS
    _onElementDestruct(e) {
        this.removeElement(e.element);
    }

    _onElementChangeVisibility(e) {
        const el = e.element;
        const parentProp =  this._parents.get(el.parentNode);
        
        if (kijs.isEmpty(parentProp) || kijs.isEmpty(parentProp.stack)) {
            return;
        }
        
        // Oberstes sichtbares Element aktualisieren und Fokus setzen
        parentProp.activeEl = this._getTopVisibleElement(el.parentNode);
        if (parentProp.activeEl) {
            parentProp.activeEl.focus();
        }
    }


    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct() {
        // Listeners entfernen
        for (var parentProp of this._parents.values()) {
            kijs.Array.each(parentProp.stack, function(el) {
                el.off(null, null, this);
            }, this);
        }
        
        this._parents.clear();
        this._parents = null;
    }

};
/* global kijs, this, HTMLElement */

// --------------------------------------------------------------
// kijs.gui.Window
// --------------------------------------------------------------
// Das Fenster kann mit der Mehtode .show() angezeigt werden.
// Es wird dann in das target gerendert.
// Als target kann der document.body oder ein kijs.gui.Element angegeben 
// werden.
// Beim Body als target ist der Body auch gleich der übergeordnete Node (parentNode).
// Beim einem kijs.gui.Element als target ist das übergeordnete Element nicht der node 
// des Elements, sondern dessen parentNode.
// Deshalb gibt es die Eigenschaften targetNode und parentNode, welche bei einem
// kijs.gui.Element als target nicht den gleichen node als Inhalt haben. Beim body 
// als target, hingegen schon.
// Mit der targetDomProperty kann noch festgelegt werden, welcher node eines Elements 
// als target dient, wird nichts angegeben, so dient das ganze Element als target. 
// Es kann z.B. bei einem kijs.gui.Panel nur der innere Teil als target angegeben werden.
// Dazu kann die Eigenschaft targetDomProperty="innerDom" definiert werden.
// --------------------------------------------------------------
kijs.gui.Window = class kijs_gui_Window extends kijs.gui.Panel {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super();
        
        this._resizeDeferHandle = null;   // intern
        this._dragInitialPos = null;      // intern
        
        this._modalMaskEl = null;
        
        this._draggable = false;
        this._focusDelay = 300;    // Delay zwischen dem rendern und dem setzen vom Fokus
        this._resizeDelay = 300;    // min. Delay zwischen zwei Resize-Events
        
        this._targetX = null;           // Zielelement (kijs.gui.Element) oder Body (HTMLElement)
        this._targetDomProperty = 'dom'; // Dom-Eigenschaft im Zielelement (String) (Spielt bei Body als target keine Rolle)
        
        this._dom.clsAdd('kijs-window');
        
        // Standard-config-Eigenschaften mergen
        config = Object.assign({}, {
            draggable: true,
            target: document.body,
            
            // defaults overwrite kijs.gui.Panel
            closable: true,
            maximizable: true,
            resizable: true,
            shadow: true
        }, config);
        
        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            draggable: { target: 'draggable' },
            focusDelay: true,
            modal: { target: 'modal' },     // Soll das Fenster modal geöffnet werden (alles Andere wird mit einer halbtransparenten Maske verdeckt)?
            resizeDelay: true,
            target: { target: 'target' },
            targetDomProperty: true
        });
        
        // Listeners
        this.on('mouseDown', this._onMouseDown, this);
        
        // Config anwenden
        if (kijs.isObject(config)) {
            this.applyConfig(config, true);
        }
    }
    
    
    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get draggable() { return this._draggable; }
    set draggable(val) {
        if (val && !this._draggable) {
            this._headerBarEl.on('mouseDown', this._onHeaderBarMouseDown, this);
        } else if (!val && this._draggable) {
            this._headerBarEl.off('mouseDown', this._onHeaderBarMouseDown, this);
            kijs.Dom.removeEventListener('mousemove', document, this);
            kijs.Dom.removeEventListener('mouseup', document, this);
        }
        this._draggable = !!val;
    }
    
    get focusDelay() { return this._focusDelay; }
    set focusDelay(val) { this._focusDelay = val; }
    
    get modal() { return !kijs.isEmpty(this._modalMaskEl); }
    set modal(val) { 
        if (val) {
            if (kijs.isEmpty(this._modalMaskEl)) {
                this._modalMaskEl = new kijs.gui.Mask({
                    target: this.target,
                    targetDomProperty: this.targetDomProperty
                });
            }
        } else {
            if (!kijs.isEmpty(this._modalMaskEl)) {
                this._modalMaskEl.destruct();
            }
        }
    }
    
    
    /**
     * Gibt den Node zurück in dem sich die Maske befindet (parentNode)
     * @returns {HTMLElement}
     */
    get parentNode() {
        if (this._targetX instanceof kijs.gui.Element) {
            return this._targetX[this._targetDomProperty].node.parentNode;
        } else {
            return this._targetX;
        }
    }
    
    get resizeDelay() { return this._resizeDelay; }
    set resizeDelay(val) { this._resizeDelay = val; }

    get target() {
        return this._targetX;
    }
    set target(val) {
        // Evtl. Listeners vom alten _targetX entfernen
        if (!kijs.isEmpty(this._targetX)) {
            if (this._targetX instanceof kijs.gui.Element) {
                this._targetX.off('afterResize', this._onTargetElAfterResize, this);
                this._targetX.off('changeVisibility', this._onTargetElChangeVisibility, this);
                this._targetX.off('destruct', this._onTargetElDestruct, this);
            } else if (this._targetX === document.body) {
                kijs.Dom.removeEventListener('resize', window, this);
            }
        }
        
        // Target ist ein kijs.gui.Element
        if (val instanceof kijs.gui.Element) {
            this._targetX = val;
            
            this._targetX.on('afterResize', this._onTargetElAfterResize, this);
            this._targetX.on('changeVisibility', this._onTargetElChangeVisibility, this);
            this._targetX.on('destruct', this._onTargetElDestruct, this);
            
        // Target ist der Body
        } else if (val === document.body || val === null) {
            this._targetX = document.body;
            
            // onResize überwachen
            // Wenn der Browser langsam grösser gezogen wird, wird der event dauernd
            // ausgelöst, darum wird er verzögert weitergegeben.
            kijs.Dom.addEventListener('resize', window, this._onWindowResize, this);
            
        } else {
            throw new Error(`Unkown format on config "target"`);
            
        }
    }
    
    get targetDomProperty() { return this._targetDomProperty; };
    set targetDomProperty(val) { this._targetDomProperty = val; };

    /**
     * Gibt den Ziel-Node zurück, über den die Maske gelegt wird
     * @returns {HTMLElement}
     */
    get targetNode() {
        if (this._targetX instanceof kijs.gui.Element) {
            return this._targetX[this._targetDomProperty].node;
        } else {
            return this._targetX;
        }
    }


    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    /**
     * Zentriert das Fenster auf dem Bildschirm
     * @param {Boolean} [preventEvents=false]   // Das Auslösen des afterResize-Event verhindern?
     * @returns {undefined}
     */
    center(preventEvents=false) {
        const targetNode = this.targetNode;
        
        // afterResize-Event deaktivieren
        const prevAfterRes = this._preventAfterResize;
        this._preventAfterResize = true;
        
        // Zentrieren
        this.left = targetNode.offsetLeft + (targetNode.offsetWidth - this.width) / 2;
        this.top = targetNode.offsetTop + (targetNode.offsetHeight - this.height) / 2;
       
       // afterResize-Event wieder zulassen
       this._preventAfterResize = prevAfterRes;
       
       // Evtl. afterResize-Event zeitversetzt auslösen
        if (!preventEvents && this._hasSizeChanged()) {
            this._raiseAfterResizeEvent(true);
        }
    }
    
    
    // overwrite
    restore() {
        if (!this.maximized) {
            return;
        }
        
        // afterResize-Event deaktivieren
        const prevAfterRes = this._preventAfterResize;
        this._preventAfterResize = true;
        
        super.restore();
        
        // evtl. Fester zentrieren
        if (!this._dom.hasLeft || !this._dom.hasTop) {
            this.center(true);
        }
        
        // Sicherstellen, dass es platz hat
        this._adjustPositionToTarget(true);
        
        // afterResize-Event wieder aktivieren
        this._preventAfterResize = prevAfterRes;
        
        // Evtl. afterResize-Event zeitversetzt auslösen
        this._raiseAfterResizeEvent(true);
    }
    
    /**
     * Zeigt das Fenster an 
     * @returns {undefined}
     */
    show() {
        // Evtl. Maske für modale anzeige einblenden
        if (this._modalMaskEl) {
            this._modalMaskEl.renderTo(this.parentNode);
             new kijs.gui.LayerManager().setActive(this._modalMaskEl);
        }
        
        // Fenster anzeigen
        this.renderTo(this.parentNode);
        
        if (!this.maximized) {
            // evtl. Fenster zentrieren
            if (!this._dom.hasLeft || !this._dom.hasTop) {
                this.center(true);

            // sonst nur sicherstellen, dass es ins target passt
            } else {
                this._adjustPositionToTarget(true);
            }
        }
        
        // afterResize-Event zeitversetzt auslösen
        this._raiseAfterResizeEvent(true);
        
        this.toFront();
        this.focus();
    }
    
    toFront() {
        if (this._dom.node && this._dom.node.parentNode && 
                (!this.resizer || (this.resizer && !this.resizer.domOverlay))) {
            new kijs.gui.LayerManager().setActive(this);
        }
    }


    // PROTECTED
    /**
     * Stellt sicher, dass das Fenster innerhalb des Targets angezeigt wird
     * @param {Boolean} [preventEvents=false]   // Das Auslösen des afterResize-Event verhindern?
     * @returns {undefined}
     */
    _adjustPositionToTarget(preventEvents=false) {
        const targetNode = this.targetNode;
        
        // afterResize-Event deaktivieren
        const prevAfterRes = this._preventAfterResize;
        this._preventAfterResize = true;
        
        let left = this.left;
        let top = this.top;
        let width = this.width;
        let height = this.height;
        
        // Höhe und Breite evtl. an target anpassen
        if (width > targetNode.offsetWidth) {
            width = targetNode.offsetWidth;
        }
        if (height > targetNode.offsetHeight) {
            height = targetNode.offsetHeight;
        }
        this.width = width;
        this.height = height;
        
        // Evtl. Position an Target anpassen
        if (left + width > targetNode.offsetLeft + targetNode.offsetWidth) {
            left = targetNode.offsetLeft + (targetNode.offsetWidth - width);
        }
        if (left < 0) {
            left = 0;
        }
        if (top + height > targetNode.offsetTop + targetNode.offsetHeight) {
            top = targetNode.offsetTop + (targetNode.offsetHeight - height);
        }
        if (top < 0) {
            top = 0;
        }
        this.left = left;
        this.top = top;
        
        // afterResize-Event wieder zulassen
        this._preventAfterResize = prevAfterRes;
        
        // Evtl. afterResize-Event zeitversetzt auslösen
        if (!preventEvents && this._hasSizeChanged()) {
            this._raiseAfterResizeEvent(true);
        }
    }
    

    // LISTENERS
    _onHeaderBarMouseDown(e) {
        this.toFront();

        if (this.maximized) {
            return;
        }
        
        this._dragInitialPos = {
            mouseX: e.nodeEvent.clientX,
            mouseY: e.nodeEvent.clientY,
            windowX: this.left,
            windowY: this.top,
            windowTransition: this.style.transition ? this.style.transition : ''
        };

        // Allfällige Transitionen temporär abschalten
        this.style.transition = 'none';
        
        // mousemove und mouseup Listeners auf das document setzen
        // (Workaround, weil sonst manchmal der Resizer stehen bleibt)
        kijs.Dom.addEventListener('mousemove', document, this._onDocumentMouseMove, this);
        kijs.Dom.addEventListener('mouseup', document, this._onDocumentMouseUp, this);
    }

    _onDocumentMouseMove(e) {
        if (kijs.isEmpty(this._dragInitialPos)) {
            return;
        }
        
        // Neue Position ermitteln
        let x = this._dragInitialPos.windowX + (e.nodeEvent.clientX - this._dragInitialPos.mouseX);
        let y = this._dragInitialPos.windowY + (e.nodeEvent.clientY - this._dragInitialPos.mouseY);

        // Min-Position begrenzen
        if (x < 0) {
            x = 0;
        }
        if (y < 0) {
            y = 0;
        }
        
        // Evtl. max-Position begrenzen
        const targetNode = this.targetNode;
        if (x < targetNode.offsetLeft) {
            x = targetNode.offsetLeft;
        }
        if ((x + this._dom.width) > (targetNode.offsetLeft + targetNode.offsetWidth)) {
            x = targetNode.offsetLeft + targetNode.offsetWidth - this._dom.width;
        }

        if (y < targetNode.offsetTop) {
            y = targetNode.offsetTop;
        }
        if ((y + this._dom.height) > (targetNode.offsetTop + targetNode.offsetHeight)) {
            y = targetNode.offsetTop + targetNode.offsetHeight - this._dom.height;
        }

        // Grösse zuweisen
        this.left = x;
        this.top = y;
    }

    _onDocumentMouseUp(e) {
        // Beim ersten auslösen Listeners gleich wieder entfernen
        kijs.Dom.removeEventListener('mousemove', document, this);
        kijs.Dom.removeEventListener('mouseup', document, this);

        if (kijs.isEmpty(this._dragInitialPos)) {
            return;
        }
        
        // Transitions-sperre wieder aufheben
        this.dom.style.transition = this._dragInitialPos.windowTransition;
        this._dragInitialPos = null;
    }

    _onMouseDown(e) {
        this.toFront();
    }
    
    /**
     * Listener der Aufgerufen wird, wenn die Grösse des Target-Elements geändert hat
     * @param {Object} e
     * @returns {undefined}
     */
    _onTargetElAfterResize(e) {
        // Sicherstellen, dass das Fenster im Target platz hat
        this._adjustPositionToTarget(true);
        
        // Falls die eigene Grösse geändert hat: das eigene afterResize-Event auslösen
        this._raiseAfterResizeEvent(false, e);
    }
    
    _onTargetElChangeVisibility(e) {
        // Sichbarkeit ändern
        this.visible = e.visible;
    }
    
    _onTargetElDestruct(e) {
        this.destruct();
    }

    _onWindowResize(e) {
         // Sicherstellen, dass das Fenster im Target platz hat
        this._adjustPositionToTarget(true);
        
        this._raiseAfterResizeEvent(true, e);
    }


    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(preventDestructEvent) {
        // Event auslösen.
        if (!preventDestructEvent) {
            this.raiseEvent('destruct');
        }
        
        // Node-Event Listeners entfernen
        if (this._targetX === document.body) {
            kijs.Dom.removeEventListener('resize', window, this);
        }
        kijs.Dom.removeEventListener('mouseMove', document, this);
        kijs.Dom.removeEventListener('mouseUp', document, this);
        
        // Event-Listeners entfernen
        if (this._targetX instanceof kijs.gui.Element) {
            this._targetX.off(null, null, this);
        }
                        
        if (this._resizeDeferHandle) {
            window.clearTimeout(this._resizeDeferHandle);
        }
        
        // Elemente/DOM-Objekte entladen
        if (this._modalMaskEl) {
            this._modalMaskEl.destruct();
        }
        
        // Variablen (Objekte/Arrays) leeren
        this._dragInitialPos = null;
        this._modalMaskEl = null;
        this._resizeDeferHandle = null;
        this._targetX = null;
        
        // Basisklasse auch entladen
        super.destruct(true);
    }
};
/* global kijs */

// --------------------------------------------------------------
// kijs.gui.MsgBox (static)
// --------------------------------------------------------------
kijs.gui.MsgBox = class kijs_gui_MsgBox {


    // --------------------------------------------------------------
    // STATICS
    // --------------------------------------------------------------
    /**
     * Zeigt ein normales Meldungsfenster mit OK-Schaltfläche
     * @param {String} caption
     * @param {String} msg
     * @param {Function} fn
     * @param {Object} context
     * @returns {undefined}
     */
    static alert(caption, msg, fn, context) {
        if (kijs.isArray(msg)) {
            msg = this._convertArrayToHtml(msg);
        }

        this.show({
            caption: caption,
            msg: msg,
            fn: fn,
            context: context,
            buttons: [
                {
                    name: 'ok',
                    caption: 'OK',
                    isDefault: true
                }
            ]
        });            
    }

    /**
     * Zeigt ein Meldungsfenster mit Ja/Nein-Schaltfläche und einem Fragezeichen-Symbol
     * @param {String} caption
     * @param {String} msg
     * @param {Function} fn
     * @param {Object} context
     * @returns {undefined}
     */
    static confirm(caption, msg, fn, context) {
        if (kijs.isArray(msg)) {
            msg = this._convertArrayToHtml(msg);
        }

        this.show({
            caption: caption,
            msg: msg,
            fn: fn,
            context: context,
            icon: {
                iconChar: '&#xf059',
                style: {
                    color: '#4398dd'
                }
            },
            buttons: [
                {
                    name: 'yes',
                    caption: 'Ja'
                },{
                    name: 'no',
                    caption: 'Nein'
                }
            ]
        });            
    }

    /**
     * Zeigt ein Meldungsfenster mit OK-Schaltfläche und einem Fehler-Symbol
     * @param {String} caption
     * @param {String} msg
     * @param {Function} fn
     * @param {Object} context
     * @returns {undefined}
     */
    static error(caption, msg, fn, context) {
        if (kijs.isArray(msg)) {
            msg = this._convertArrayToHtml(msg);
        }

        this.show({
            caption: caption,
            msg: msg,
            fn: fn,
            context: context,
            icon: {
                iconChar: '&#xf06a',
                style: {
                    color: '#be6280'
                }
            },
            buttons: [
                {
                    name: 'ok',
                    caption: 'OK',
                    isDefault: true
                }
            ]
        });            
    }

    /**
     * Zeigt ein Meldungsfenster mit OK-Schaltfläche und einem Info-Symbol
     * @param {String} caption
     * @param {String} msg
     * @param {Function} fn
     * @param {Object} context
     * @returns {undefined}
     */
    static info(caption, msg, fn, context) {
        if (kijs.isArray(msg)) {
            msg = this._convertArrayToHtml(msg);
        }

        this.show({
            caption: caption,
            msg: msg,
            fn: fn,
            context: context,
            icon: {
                iconChar: '&#xf05a',
                style: {
                    color: '#4398dd'
                }
            },
            buttons: [
                {
                    name: 'ok',
                    caption: 'OK',
                    isDefault: true
                }
            ]
        });            
    }

    /**
     * Zeigt ein individuelles Meldungsfenster
     * Beispiel config:
     * config = {
     *     caption = 'Testmeldung',
     *     msg = 'Hallo Welt!'
     *     fn = function(e, el) {
     *         alert('Es wurde geklickt auf: ' . e.btn);
     *     },
     *     context: this,
     *     iconChar: '',
     *     icon: {
     *         iconChar: '&#xf071',
     *         style: {
     *             color: '#ff9900'
     *         }
     *     }
     *     buttons: [
     *         {
     *             name: 'ok',
     *             caption: 'OK'
     *         },{
     *             name: 'cancel',
     *             caption: 'Abbrechen'
     *         }
     *     ]
     * }
     * @param {Object} config
     * @returns {undefined}
     */
    static show(config) {
        let btn = 'none';
        const elements = [];
        const footerElements = [];

        // Icon
        if (config.icon) {
            if (!(config.icon instanceof kijs.gui.Icon)) {
                config.icon.xtype = 'kijs.gui.Icon';
            }
            elements.push(config.icon);
        }

        // Text
        elements.push({
            xtype: 'kijs.gui.Element',
            html: config.msg,
            htmlDisplayType: 'html',
            cls: 'kijs-msgbox-inner'
        });

        // Buttons
        kijs.Array.each(config.buttons, function(button) {
            if (!(button instanceof kijs.gui.Button)) {
                button.xtype = 'kijs.gui.Button';
                if (!button.on) {
                    button.on = {};
                }
                if (!button.on.click) {
                    button.on.click = function() {
                        btn = button.name;
                        this.upX('kijs.gui.Window').destruct();
                    };
                }
            }

            footerElements.push(button);
        }, this);

        // Fenster erstellen
        const win = new kijs.gui.Window({
            caption: config.caption,
            iconChar: config.iconChar ? config.iconChar : '',
            collapsible: false,
            resizable: false,
            maximizable: false,
            modal: true,
            cls: 'kijs-msgbox',
            elements: elements,
            footerElements: footerElements
        });

        // Listener
        if (config.fn) {
            win.on('destruct', function(e){
                e.btn = btn;
                config.fn.call(config.context, e);
            });
        }

        // Fenster anzeigen
        win.show();
    }


    /**
     * Zeigt ein Meldungsfenster mit OK/Abbrechen-Schaltflächen und einem Achtung-Symbol
     * @param {String} caption
     * @param {String} msg
     * @param {Function} fn
     * @param {Object} context
     * @returns {undefined}
     */
    static warning(caption, msg, fn, context) {
        if (kijs.isArray(msg)) {
            msg = this._convertArrayToHtml(msg);
        }

        this.show({
            caption: caption,
            msg: msg,
            fn: fn,
            context: context,
            icon: {
                iconChar: '&#xf071',
                style: {
                    color: '#ff9900'
                }
            },
            buttons: [
                {
                    name: 'ok',
                    caption: 'OK',
                    isDefault: true
                },{
                    name: 'cancel',
                    caption: 'Abbrechen'
                }
            ]
        });            
    }


    // PROTECTED
    static _convertArrayToHtml(messages) {
        let ret = '<ul>';
        kijs.Array.each(messages, function(msg) {
            ret += '<li>' + msg + '</li>';
        }, this);
         ret += '</ul>';
        return ret;
    }

};
/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.CornerTipContainer
// --------------------------------------------------------------
kijs.gui.CornerTipContainer = class kijs_gui_CornerTipContainer extends kijs.gui.Container {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super();

        this._dismissDelay = null;

        this._dom.clsRemove('kijs-container');
        this._dom.clsAdd('kijs-cornertipcontainer');

        // Standard-config-Eigenschaften mergen
        config = Object.assign({}, {
            dismissDelay: 5000,
            width: 230
        }, config);

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            dismissDelay: true
        });
        
        // Config anwenden
        if (kijs.isObject(config)) {
            this.applyConfig(config, true);
        }
    }
    
    
    // --------------------------------------------------------------
    // STATICS
    // --------------------------------------------------------------
    /**
     * Zeigt einen CornerTip an und erstellt dafür eine Singleton-Instanz
     * @param {String} caption
     * @param {String} html
     * @param {String} [icon='alert'] 'alert', 'info' oder 'error'
     * @returns {undefined}
     */
    static show(caption, html, icon='alert') {
        // Singleton-Instanz ermitteln oder erstellen
        let instance = kijs_gui_CornerTipContainer._singletonInstance;
        if (!instance) {
            instance = new kijs.gui.CornerTipContainer();
            instance.renderTo(document.body);
            kijs_gui_CornerTipContainer._singletonInstance = instance;
        }

        switch (icon) {
            case 'alert': instance.alert(caption, html); break;
            case 'info': instance.info(caption, html); break;
            case 'warning': instance.warning(caption, html); break;
            case 'error': instance.error(caption, html); break;
            default:
                throw new Error(`Unknown value on argument "icon"`);
        }
    }


    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get dismissDelay() { return this._dismissDelay; }
    set dismissDelay(val) { this._dismissDelay = val; }


    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------

     /**
     * Zeigt ein normaler CornerTip
     * @param {type} caption
     * @param {type} msg
     * @returns {undefined}
     */
    alert(caption, msg) {
        if (kijs.isArray(msg)) {
            msg = this._convertArrayToHtml(msg);
        }

        this.show({
            caption: caption,
            msg: msg
        });            
    }


    /**
     * Zeigt ein CornerTip mit einem Fehler-Symbol
     * @param {type} caption
     * @param {type} msg
     * @returns {undefined}
     */
    error(caption, msg) {
        if (kijs.isArray(msg)) {
            msg = this._convertArrayToHtml(msg);
        }

        this.show({
            caption: caption,
            msg: msg,
            icon: {
                iconChar: '&#xf06a',
                style: {
                    color: '#be6280'
                }
            }
        });            
    }

    /**
     * Zeigt ein CornerTip mit einem Info-Symbol
     * @param {type} caption
     * @param {type} msg
     * @returns {undefined}
     */
    info(caption, msg) {
        if (kijs.isArray(msg)) {
            msg = this._convertArrayToHtml(msg);
        }

        this.show({
            caption: caption,
            msg: msg,
            icon: {
                iconChar: '&#xf05a',
                style: {
                    color: '#4398dd'
                }
            }
        });            
    }

    /**
     * Zeigt ein individueller CornerTip
     * Beispiel config:
     * config = {
     *     caption = 'Testmeldung',
     *     msg = 'Hallo Welt!'
     *     iconChar: '',
     *     icon: {
     *         iconChar: '&#xf071',
     *         style: {
     *             color: '#ff9900'
     *         }
     *     }
     * }
     * @param {type} config
     * @returns {undefined}
     */
    show(config) {
        const elements = [];

        // Icon
        if (config.icon) {
            if (!(config.icon instanceof kijs.gui.Icon)) {
                config.icon.xtype = 'kijs.gui.Icon';
            }
            elements.push(config.icon);
        }

        // Text
        elements.push({
            xtype: 'kijs.gui.Element',
            html: config.msg,
            htmlDisplayType: 'html',
            cls: 'kijs-msgbox-inner'
        });

        // CornerTip erstellen
        const tip = new kijs.gui.Panel({
            caption: config.caption,
            iconChar: config.iconChar ? config.iconChar : '',
            closable: true,
            shadow: true,
            elements: elements,
            on: {
                destruct: this._onCornerTipDestruct,
                context: this
            }
        });

        // CornerTip anzeigen
        this.add(tip);

        // Nach einer bestimmten Zeit wieder automatisch schliessen
        if (this._dismissDelay) {
            kijs.defer(function() {
                if (tip) {
                    tip.destruct();
                }
            }, this._dismissDelay, this);
        }
    }

    /**
     * Zeigt ein CornerTip mit einem Warnungs-Symbol
     * @param {type} caption
     * @param {type} msg
     * @returns {undefined}
     */
    warning(caption, msg) {
        if (kijs.isArray(msg)) {
            msg = this._convertArrayToHtml(msg);
        }

        this.show({
            caption: caption,
            msg: msg,
            icon: {
                iconChar: '&#xf071',
                style: {
                    color: '#ff9900'
                }
            }
        });            
    }


    // PROTECTED
    _convertArrayToHtml(messages) {
        let ret = '<ul>';
        kijs.Array.each(messages, function(msg) {
            ret += '<li>' + msg + '</li>';
        }, this);
         ret += '</ul>';
        return ret;
    }


    // LISTENERS
    _onCornerTipDestruct(e) {
        this.remove(e.element);
    }
    
    
    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct() {
        this.base(arguments);
    }
    
};
/* global kijs */

// --------------------------------------------------------------
// kijs.gui.Rpc
// --------------------------------------------------------------
// Erweiterung von kijs.Rpc, der die Meldungsfenster anzeigt
kijs.gui.Rpc = class kijs_gui_Rpc extends kijs.Rpc {


    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------

    /**
     * Führt einen RPC aus
     * @param {String} facadeFn         Modul/Facaden-name und Methodenname Bsp: 'address.save'
     * @param {Mixed} data              Argumente/Daten, die an die Server-RPC Funktion übergeben werden.
     * @param {Function} fn             Callback-Funktion
     * @param {Object} context          Kontext für die Callback-Funktion
     * @param {Boolean} [cancelRunningRpcs=false] Bei true, werden alle laufenden Requests an die selbe facadeFn abgebrochen
     * @param {kijs.gui.BoxElement|HTMLElement} [waitMaskTarget=document.body]  Ziel-BoxElement oder Ziel-Node 
     *                                                                          für Lademaske, NULL=document.body
     * @param {String} [waitMaskTargetDomProperty='dom']        Name der DOM-Eigenschaft in der die Lademaske 
     *                                                          angezeigt werden soll.
     * @param {Boolean} [ignoreWarnings=false]  Sollen Warnungen ignoriert werden?
     * @param {Function} [fnBeforeMessages]     Callback-Funktion, die vor der Ausgabe von Meldungsfenstern ausgeführt wird
     *                                          Wird z.B. verwendet um bei Formularen die Fehler bei den einzelnen Feldern
     *                                          anzuzeigen.
     * @returns {undefined}
     */
    // overwrite (Vorsicht andere Argumente!)
    do(facadeFn, data, fn, context, cancelRunningRpcs, waitMaskTarget, waitMaskTargetDomProperty='dom', ignoreWarnings, fnBeforeMessages) {
        // Lademaske anzeigen
        let waitMask;
        if (waitMaskTarget instanceof kijs.gui.Element) {
            waitMask = waitMaskTarget.waitMaskAdd();
        } else {
            waitMask = new kijs.gui.Mask({
                displayWaitIcon: true,
                target: waitMaskTarget,
                targetDomProperty: waitMaskTargetDomProperty
            });
            waitMask.show();
        }

        super.do(facadeFn, data, function(response, request) {
            // Lademaske entfernen
            if (request.responseArgs && request.responseArgs.waitMask) {
                if (request.responseArgs.waitMask.target instanceof kijs.gui.Element) {
                    request.responseArgs.waitMask.target.waitMaskRemove();
                } else {
                    request.responseArgs.waitMask.destruct();
                }
            }

            if (!response.canceled) {
                // Evtl. callback-fnBeforeMessages ausführen
                if (fnBeforeMessages && kijs.isFunction(fnBeforeMessages)) {
                    fnBeforeMessages.call(context || this, response || null);
                }
                
                // Fehler --> FehlerMsg + Abbruch
                // response.errorMsg (String oder Array mit Strings, die mit Aufzählungszeichen angezeigt werden)
                if (!kijs.isEmpty(response.errorMsg)) {
                    kijs.gui.MsgBox.error('Fehler', response.errorMsg);
                    return;
                }

                // Warning --> WarnungMsg mit OK, Cancel. Bei Ok wird der gleiche request nochmal gesendet mit dem Flag ignoreWarnings
                // response.warningMsg (String oder Array mit Strings, die mit Aufzählungszeichen angezeigt werden)
                if (!kijs.isEmpty(response.warningMsg)) {
                    kijs.gui.MsgBox.warning('Warnung', response.warningMsg, function(e) {
                        if (e.btn === 'ok') {
                            // Request nochmal senden mit Flag ignoreWarnings
                            this.do(facadeFn, data, fn, context, cancelRunningRpcs, waitMaskTarget, waitMaskTargetDomProperty, true);
                        }
                    }, this);
                    return;
                }

                // Info --> Msg ohne Icon kein Abbruch
                // response.infoMsg (String oder Array mit Strings, die mit Aufzählungszeichen angezeigt werden)
                if (!kijs.isEmpty(response.infoMsg)) {
                    kijs.gui.MsgBox.info('Info', response.infoMsg);

                }
                // Tip -> Msg, die automatisch wieder verschwindet kein Abbruch
                // response.tipMsg (String oder Array mit Strings, die mit Aufzählungszeichen angezeigt werden)
                if (!kijs.isEmpty(response.cornerTipMsg)) {
                    kijs.gui.CornerTipContainer.show('Info', response.cornerTipMsg, 'info');
                }

                // callback-fn ausführen
                if (fn && kijs.isFunction(fn)) {
                    fn.call(context || this, response || null);
                }
            }

        }, this, cancelRunningRpcs, {ignoreWarnings: !!ignoreWarnings}, {waitMask: waitMask});
        
    }

};

/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.DataViewElement
// --------------------------------------------------------------
kijs.gui.DataViewElement = class kijs_gui_DataViewElement extends kijs.gui.Element {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);
        
        this._dataRow = [];     // Verweis auf den Data-Datensatz
        this._index = null;
        this._selected = false;
        
        this._dom.clsAdd('kijs-dataviewelement');
        
        this._dom.nodeAttributeSet('tabIndex', -1);
        this._dom.nodeAttributeSet('draggable', true);
        
        // Standard-config-Eigenschaften mergen
        config = Object.assign({}, {
            // keine
        }, config);
        
        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            dataRow: true,
            index: true,
            selected: { target: 'selected' }
        });
        
        // Config anwenden
        if (kijs.isObject(config)) {
            this.applyConfig(config, true);
        }
        
        this.applyConfig(config);
    }


    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get dataRow() { return this._dataRow; }
    set dataRow(val) { this._dataRow = val; }
    
    get index() { return this._index; }
    set index(val) { this._index = val; }
    
    get selected() { return this._dom.clsHas('kijs-selected'); }
    set selected(val) {
        if (val) {
            this._dom.clsAdd('kijs-selected');
        } else {
            this._dom.clsRemove('kijs-selected');
        }
    }
    
    
    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(preventDestructEvent) {
        // Event auslösen.
        if (!preventDestructEvent) {
            this.raiseEvent('destruct');
        }
            
        // Variablen (Objekte/Arrays) leeren
        this._dataRow = null;
        
        // Basisklasse entladen
        super.destruct(true);
    }
};

/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.DataView
// --------------------------------------------------------------
kijs.gui.DataView = class kijs_gui_DataView extends kijs.gui.Container {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);
        
        this._currentEl = null;         // Aktuelles Element (Wenn der Fokus auf dem DataView ist, 
                                        // hat dieses Element den Fokus)
        this._lastSelectedEl = null;    // Letztes Element das Selektiert wurde. Wird gebraucht, 
                                        // wenn mit der Shift-Taste mehrere selektiert werden.


        
        this._currentEl = null;
        this._data = [];
        this._facadeFnLoad = null;
        this._rpc = null;           // Instanz von kijs.gui.Rpc
        this._selectType = 'none';
        
        this._dom.clsRemove('kijs-container');
        this._dom.clsAdd('kijs-dataview');
        
        this._dom.nodeAttributeSet('tabIndex', -1);
        
        // Standard-config-Eigenschaften mergen
        config = Object.assign({}, {
            selectType: 'single'
        }, config);
        
        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            autoLoad: { target: 'autoLoad' },   // Soll nach dem erten Rendern automatisch die Load-Funktion aufgerufen werden?
            data: { target: 'data' },   // Recordset-Array [{id:1, caption:'Wert 1'}] oder Werte-Array ['Wert 1']
            facadeFnLoad: true,         // Name der Facade-Funktion. Bsp: 'address.load'
            rpc: { target: 'rpc' },     // Instanz von kijs.gui.Rpc
            selectType: true            // 'none': Es kann nichts selektiert werden
                                        // 'single' (default): Es kann nur ein Datensatz selektiert werden
                                        // 'multi': Mit den Shift- und Ctrl-Tasten können mehrere Datensätze selektiert werden.
                                        // 'simple': Es können mehrere Datensätze selektiert werden. Shift- und Ctrl-Tasten müssen dazu nicht gedrückt werden.
        });
        
        // Config anwenden
        if (kijs.isObject(config)) {
            this.applyConfig(config, true);
        }
        
        this.applyConfig(config);
        
        // Events
        this.on('keyDown', this._onKeyDown, this);
        this.on('elementClick', this._onElementClick, this);
        this.on('elementFocus', this._onElementFocus, this);
    }
    
    
    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get autoLoad() {
        return this.hasListener('afterFirstRenderTo', this._onAfterFirstRenderTo, this);
    }
    set autoLoad(val) {
        if (val) {
            this.on('afterFirstRenderTo', this._onAfterFirstRenderTo, this);
        } else {
            this.off('afterFirstRenderTo', this._onAfterFirstRenderTo, this);
        }
    }
    

    get current() { return this._currentEl; }
    /**
     * Setzt das aktuelle Element, dass den Fokus erhalten wird
     * Um den Fokus zu setzen verwenden sie stattdessen die Funktion .focus() vom Element.
     * @param {kijs.gui.DataViewElement} el
     * @returns {undefined}
     */
    set current(el) {
        this._currentEl = el;
        kijs.Array.each(this._elements, function(elem) {
            if (elem === el) {
                elem.dom.clsAdd('kijs-current');
            } else {
                elem.dom.clsRemove('kijs-current');
            }
        }, this);
        
        if (el) {
            this.setFocussableElement(el);
        }
    }
    
    
    get data() { return this._data; }
    set data(val) { 
        this._data = val;
        
        // Bestehende Elemente löschen
        if (this._elements) {
            this.removeAll(true);
        }

        // Neue Elemente generieren
        let newElements = [];
        for (let i=0, len=this._data.length; i<len; i++) {
            const newEl = this.createElement(this._data[i], i);
            newEl.index = i;
            newEl.parent = this;
            
            // click-Event
            newEl.on('click', function(e) {
                return this.raiseEvent('elementClick', e);
            }, this);

            // dblclick-Event
            newEl.on('dblClick', function(e) {
                return this.raiseEvent('elementDblClick', e);
            }, this);

            // focus-Event
            newEl.on('focus', function(e) {
                return this.raiseEvent('elementFocus', e);
            }, this);

            // dragstart-Event
            newEl.on('dragStart', function(e) {
                return this.raiseEvent('elementDragStart', e);
            }, this);

            // dragover-Event
            newEl.on('dragOver', function(e) {
                return this.raiseEvent('elementDragOver', e);
            }, this);

            // drag-Event
            newEl.on('drag', function(e) {
                return this.raiseEvent('elementDrag', e);
            }, this);

            // dragleave-Event
            newEl.on('dragLeave', function(e) {
                return this.raiseEvent('elementDragLeave', e);
            }, this);

            // dragend-Event
            newEl.on('dragEnd', function(e) {
                return this.raiseEvent('elementDragEnd', e);
            }, this);

            // drop-Event
            newEl.on('drop', function(e) {
                return this.raiseEvent('elementDrop', e);
            }, this);

            newElements.push(newEl);
        }
        
        // neue Elemente einfügen
        this.add(newElements);
        
        // Current = erstes Element
        this.current = !kijs.isEmpty(this._elements) ? this._elements[0] : null;
    }
    
    get facadeFnLoad() { return this._facadeFnLoad; }
    set facadeFnLoad(val) { this._facadeFnLoad = val; }

    get rpc() { return this._rpc;}
    set rpc(val) {
        if (val instanceof kijs.gui.Rpc) {
            this._rpc = val;
            
        } else if (kijs.isString(val)) {
            if (this._rpc) {
                this._rpc.url = val;
            } else {
                this._rpc = new kijs.gui.Rpc({
                    url: val
                });
            }
            
        } else {
            throw new Error(`Unkown format on config "rpc"`);
            
        }
    }

    get selectType() { return this._selectType; }
    set selectType(val) { this._selectType = val; }
    
    
    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    /**
     * Entfernt alle Selektionen
     * @param {Boolean} [preventSelectionChange=false]    Soll das SelectionChange-Event verhindert werden?
     * @returns {undefined}
     */
    clearSelections(preventSelectionChange) {
        this.unSelect(this._elements, preventSelectionChange);
    }

    /**
     * Erstellt aus einem Recordset ein getDataViewElement
     * Diese Funktion muss überschrieben werden.
     * @param {Array} dataRow   Datensatz, der gerendert werden soll
     * @param {Number} index    Index des Datensatzes. Die Datensätze werden durchnummeriert 0 bis ...
     * @returns {kijs.gui.getDataViewElement}
     */
    createElement(dataRow, index) {
        let html = '';

        html += '<div>';
        html += ' <span class="label">Nr. ' + index + '</span>';
        html += '</div>';

        kijs.Object.each(dataRow, function(key, val) {
            html += '<div>';
            html += ' <span class="label">' + key + ': </span>';
            html += ' <span class="value">' + val + '</span>';
            html += '</div>';
        }, this);
        
        return new kijs.gui.DataViewElement({
            dataRow: dataRow,
            html: html
        });
    }

    /**
     * Gibt die selektieten Elemente zurück
     * Bei selectType='single' wird das Element direkt zurückgegeben sonst ein Array mit den Elementen
     * @returns {Array|kijs.gui.DataViewElement|Null}
     */
    getSelected() {
        let ret = [];
        for (let i=0, len=this._elements.length; i<len; i++) {
            if (this._elements[i].selected) {
                ret.push(this._elements[i]);
            }
        }

        if (this._selectType === 'none') {
            return null;

        } else if (this._selectType === 'single') {
            return ret.length ? ret[0] : null ;

        } else {
            return ret;

        }
    }

    /**
     * Füllt das Dataview mit Daten vom Server
     * @param {Array} args Array mit Argumenten, die an die Facade übergeben werden
     * @returns {undefined}
     */
    load(args) {
        this._rpc.do(this._facadeFnLoad, args, function(response) {
            this.data = response.rows;
            if (!kijs.isEmpty(response.selectFilters)) {
                this.selectByFilters(response.selectFilters);
            }
        }, this, true, this, 'dom', false);
    }


    /**
     * Selektiert ein oder mehrere Elemente
     * @param {kijs.gui.Element|Array} elements Element oder Array mit Elementen, die selektiert werden sollen
     * @param {Boolean} [keepExisting=false]            Soll die bestehende selektion belassen werden?
     * @param {Boolean} [preventSelectionChange=false]  Soll das SelectionChange-Event verhindert werden?
     * @returns {undefined}
     */
    select(elements, keepExisting, preventSelectionChange) {
        if (kijs.isEmpty(elements)) {
            elements = [];
        }

        if (!kijs.isArray(elements)) {
            elements = [elements];
        }

        if (!keepExisting){
            this.clearSelections(true);
        }

        kijs.Array.each(elements, function(el) {
            el.selected = true;
        }, this);

        if (!preventSelectionChange) {
            this.raiseEvent('selectionchange', elements, this);
        }
    }
    
    /**
     * Selektiert ein oder mehrere Elemente
     * @param {Array|Object} filters                    Array mit Objektdefinitionen der Elemente, die selektiert werden sollen
     *                                                  Beispiel 1 (nur ein Datensatz wird selektiert bei nur einem Primary-Field):
     *                                                  { field: "Id", value: 123 }
     *                                                  
     *                                                  Beispiel 2 (mehrere werden selektiert bei nur einem Primary-Field):
     *                                                  [ { field: "Id", value: 123 }, { field: "Id", value: 124 } ]
     *                                                  
     *                                                  Beispiel 3 (nur ein Datensatz wird selektiert bei mehreren Primary-Fields):
     *                                                  [
     *                                                    { field: "Name", value: "Muster" },
     *                                                    { field: "Vorname", value: "Max" }
     *                                                  ]
     *                                                  
     *                                                  Beispiel 4 (mehrere Datensätze werden selektiert bei mehreren Primary-Fields):
     *                                                  [
     *                                                    [
     *                                                      { field: "Name", value: "Muster" },
     *                                                      { field: "Vorname", value: "Max" }
     *                                                    ],[
     *                                                      { field: "Name", value: "Muster" },
     *                                                      { field: "Vorname", value: "Max" }
     *                                                    ]
     *                                                  ]
     * 
     * @param {Boolean} [keepExisting=false]            Soll die bestehende selektion belassen werden?
     * @param {Boolean} [preventSelectionChange=false]  Soll das SelectionChange-Event verhindert werden?
     * @returns {undefined}
     */
    selectByFilters(filters, keepExisting, preventSelectionChange) {
        if (kijs.isEmpty(filters)) {
            return;
        }
        
        // Evtl. das Format ändern auf: [ [{...}, {...}], [{...}, {...}] ]
        if (kijs.isObject(filters)) {
            filters = [filters];
        }
        for (let i=0; i<filters.length; i++) {
            if (kijs.isObject(filters[i])) {
                filters[i] = [filters[i]];
            }
        }
        
        // Nun die Elemente durchgehen und wenn sie zum Filter passen: das Element vormerken
        const selElements = [];
        kijs.Array.each(this._elements, function(el) {
            const row = el.dataRow;

            kijs.Array.each(filters, function(filterFields) {
                let ok = false;
                kijs.Array.each(filterFields, function(filterField) {
                    if (kijs.isEmpty(filterField.value) || kijs.isEmpty(filterField.field)) {
                        throw new Error(`Unkown filter format.`);
                    }
                    
                    if (filterField.value === row[filterField.field]) {
                        ok = true;
                    } else {
                        ok = false;
                        return false;
                    }
                }, this);
                if (ok) {
                    selElements.push(el);
                    return false;
                }
            }, this);

        }, this);
        
        // Elemente selektieren
        if (!kijs.isEmpty(selElements)) {
            this.select(selElements, keepExisting, preventSelectionChange);
        }
    }

    /**
     * Selektiert alle Elemente zwischen el1 und el2
     * @param {kijs.gui.Element} el1
     * @param {kijs.gui.Element} el2
     * @param {type} [preventSelectionChange=false]     Soll das SelectionChange-Event verhindert werden?
     * @returns {undefined}
     */
    selectBetween(el1, el2, preventSelectionChange) {
        let found = false;
        let elements = [];

        // Alle Elemente zwischen dem vorher selektierten Element und dem aktuellen Element selektieren
        kijs.Array.each(this._elements, function(el) {
            if (!found) {
                if (el === el1) {
                    found = 'el1';
                } else if (el === el2) {
                    found = 'el2';
                }
            }

            if (found) {
                elements.push(el);
            }

            if ((found==='el1' && el===el2) || (found==='el2' && el===el1)) {
                return false;
            }
        }, this);
        

        if (!kijs.isEmpty(elements)) {
            this.select(elements, true, preventSelectionChange);
        }
    }

    /**
     * Element festlegen, welches über die Tabulator-Taste den Fokus erhält
     * Setzt den tabIndex des Elements auf 0
     * und bei allen anderen Elementen auf -1
     * @param {type} el
     * @returns {undefined}
     */
    setFocussableElement(el) {
        // Sicherstellen, dass alle anderen Elemente den Fokus nicht mehr über die Tabulator-Taste erhalten können
        kijs.Array.each(this._elements, function(elem) {
            elem.dom.nodeAttributeSet('tabIndex', -1);
        }, this);
        
        if (!el && !kijs.isEmpty(this._elements)) {
            el = this._elements[0];
        }

        // Beim neuen Element: tabIndex einschalten
        // kann nun auch über die Tastatur und Maus fokussiert werden.
        if (el) {
            el.dom.nodeAttributeSet('tabIndex', 0);
        }
    }

    /**
     * Deselektiert ein oder mehrere Elemente
     * @param {kijs.gui.Element|Array} elements Element oder Array mit Elementen, die deselektiert werden sollen
     * @param {type} [preventSelectionChange=false]     Soll das SelectionChange-Event verhindert werden?
     * @returns {undefined}
     */
    unSelect(elements, preventSelectionChange) {
        if (!kijs.isArray(elements)) {
            elements = [elements];
        }

        kijs.Array.each(elements, function(el) {
            el.selected = false;
        }, this);
        
        if (!preventSelectionChange) {
            this.raiseEvent('selectionchange', [], this);
        }
    }


    // PROTECTED
    /**
     * Selektiert ein Element und berücksichtigt dabei die selectType und die tasten shift und ctrl
     * @param {kijs.gui.Element} el
     * @param {boolean} shift   // Shift gedrückt?
     * @param {boolean} ctrl    // Ctrl gedrückt?
     * @returns {undefined}
     */
    _selectEl(el, shift, ctrl) {
        if (!el) {
            return;
        }

        // darf überhaupt selektiert werden?
        switch (this._selectType) {
            case 'single':
                shift = false;
                ctrl = false;
                break;
                
            case 'multi':
                // nix
                break;
                
            case 'simple':
                ctrl = true;
                break;
                
            case 'none':
            default:
                return;
        }
        

        if (shift && this._lastSelectedEl) {
            // bestehende Selektierung entfernen
            if (!ctrl) {
                this.clearSelections(true);
            }

            // selektieren
            this.selectBetween(this._lastSelectedEl, el);

        } else {

            // bestehende Selektierung entfernen
            if (!ctrl) {
                this.clearSelections(true);
            }

            if (el.selected) {
                this.unSelect(el);
                if (el === this._lastSelectedEl) {
                    this._lastSelectedEl = null;
                }
            } else {
                this.select(el, true);
                this._lastSelectedEl = el;
            }
        }
    }


    // EVENTS
    _onAfterFirstRenderTo(e) {
        this.load();
    }
    
    _onElementClick(e) {
        this.current = e.raiseElement;
        e.raiseElement.focus();
        this._selectEl(this._currentEl, e.nodeEvent.shiftKey, e.nodeEvent.ctrlKey);
    }

    _onElementFocus(e) {
        // Element festlegen, welches über die Tabulator-Taste den Fokus erhält
        this.setFocussableElement(e.raiseElement);
    }

    _onKeyDown(e) {
        switch (e.nodeEvent.keyCode) {
            case kijs.keys.LEFT_ARROW:
                if (this._currentEl) {
                    const prev = this._currentEl.previous;
                    if (prev) {
                        this.current = prev;
                        prev.focus();
                    }

                    if (e.nodeEvent.shiftKey || (!e.nodeEvent.ctrlKey && (this.selectType === 'single' || this.selectType === 'multi'))) {
                        this._selectEl(this._currentEl, e.nodeEvent.shiftKey, e.nodeEvent.ctrlKey);
                    }
                }
                e.nodeEvent.preventDefault();
                break;
                
            case kijs.keys.UP_ARROW:
                if (this._currentEl && this._elements) {
                    let found = false;
                    
                    kijs.Array.each(this._elements, function(el) {
                        if (found) {
                            if (el.top < this._currentEl.top && el.left === this._currentEl.left) {
                                this.current = el;
                                el.focus();
                                return false;
                            }
                        } else {
                            if (el === this._currentEl) {
                                found = true;
                            }
                        }
                    }, this, true);


                    if (e.nodeEvent.shiftKey || (!e.nodeEvent.ctrlKey && (this._selectType === 'single' || this._selectType === 'multi'))) {
                        this._selectEl(this._currentEl, e.nodeEvent.shiftKey, e.nodeEvent.ctrlKey);
                    }
                }
                e.nodeEvent.preventDefault();
                break;
            
            case kijs.keys.RIGHT_ARROW:
                if (this._currentEl) {
                    const next = this._currentEl.next;
                    if (next) {
                        this.current = next;
                        next.focus();
                    }

                    if (e.nodeEvent.shiftKey || (!e.nodeEvent.ctrlKey && (this._selectType === 'single' || this._selectType === 'multi'))) {
                        this._selectEl(this._currentEl, e.nodeEvent.shiftKey, e.nodeEvent.ctrlKey);
                    }
                }
                e.nodeEvent.preventDefault();
                break;
                
            case kijs.keys.DOWN_ARROW:
                if (this._currentEl && this._elements) {
                    let found = false;
                    kijs.Array.each(this._elements, function(el) {
                        if (found) {
                            if (el.top > this._currentEl.top && el.left === this._currentEl.left) {
                                this.current = el;
                                el.focus();
                                return false;
                            }
                        } else {
                            if (el === this._currentEl) {
                                found = true;
                            }
                        }
                    }, this);
                    
                    if (e.nodeEvent.shiftKey || (!e.nodeEvent.ctrlKey && (this._selectType === 'single' || this._selectType === 'multi'))) {
                        this._selectEl(this._currentEl, e.nodeEvent.shiftKey, e.nodeEvent.ctrlKey);
                    }
                }
                e.nodeEvent.preventDefault();
                break;

            case kijs.keys.SPACE:
                this._selectEl(this._currentEl, e.nodeEvent.shiftKey, e.nodeEvent.ctrlKey);
                e.nodeEvent.preventDefault();
                break;
                
        }
    }
    
    
    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(preventDestructEvent) {
        // Event auslösen.
        if (!preventDestructEvent) {
            this.raiseEvent('destruct');
        }
            
        // Variablen (Objekte/Arrays) leeren
        this._currentEl = null;
        this._lastSelectedEl = null;
        this._data = null;
        this._rpc = null;
        
        // Basisklasse entladen
        super.destruct(true);
    }
    
};
/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.FormPanel
// --------------------------------------------------------------
kijs.gui.FormPanel = class kijs_gui_FormPanel extends kijs.gui.Panel {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super();
        
        this._data = {};
        this._facadeFnLoad = null;  // Name der Facade-Funktion. Bsp: 'address.load'
        this._facadeFnSave = null;  // Name der Facade-Funktion. Bsp: 'address.save'
        this._fields = null;        // Array mit kijs.gui.field.Fields-Elementen
        this._rpc = null;           // Instanz von kijs.gui.Rpc
        
        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            autoLoad: { target: 'autoLoad' },   // Soll nach dem ersten Rendern automatisch die Load-Funktion aufgerufen werden?
            data: { target: 'data'},    //Recordset-Row-Objekt {id:1, caption:'Wert 1'}
            facadeFnLoad: true,
            facadeFnSave: true,
            rpc: { target: 'rpc' }
        });
        
        // Config anwenden
        if (kijs.isObject(config)) {
            this.applyConfig(config, true);
        }
    }
    
    
    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get autoLoad() {
        return this.hasListener('afterFirstRenderTo', this._onAfterFirstRenderTo, this);
    }
    set autoLoad(val) {
        if (val) {
            this.on('afterFirstRenderTo', this._onAfterFirstRenderTo, this);
        } else {
            this.off('afterFirstRenderTo', this._onAfterFirstRenderTo, this);
        }
    }

    get data() {
        let data = {};
        // Evtl. Daten aus Formular holen
        if (!kijs.isEmpty(this._fields)) {
            kijs.Array.each(this._fields, function(field) {
                data[field.name] = field.value;
            }, this);
        }
        // Bestehendes Recordset mit Daten aus Formular ergänzen
        Object.assign(this._data, data);
        return this._data;
    }
    set data(val) {
        this._data = val;
        // Evtl. Daten in Formular einfüllen
        if (!kijs.isEmpty(this._fields)) {
            kijs.Array.each(this._fields, function(field) {
                if (field.name in this._data) {
                    field.value = this._data[field.name];
                }
            }, this);
        }
    }
    
    get fields() { return this._fields; }
    
    get facadeFnLoad() { return this._facadeFnLoad; }
    set facadeFnLoad(val) { this._facadeFnLoad = val; }

    get facadeFnSave() { return this._facadeFnSave; }
    set facadeFnSave(val) { this._facadeFnSave = val; }

    get rpc() { return this._rpc;}
    set rpc(val) {
        if (val instanceof kijs.gui.Rpc) {
            this._rpc = val;
            
        } else if (kijs.isString(val)) {
            if (this._rpc) {
                this._rpc.url = val;
            } else {
                this._rpc = new kijs.gui.Rpc({
                    url: val
                });
            }
            
        } else {
            throw new Error(`Unkown format on config "rpc"`);
            
        }
    }
    

    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    /**
     * Lädt das Formular mit Daten vom Server
     * @param {Object} args
     * @param {Boolean} [searchFields=false] Sollen die Formularfelder neu gesucht werden?
     * @returns {undefined}
     */
    load(args, searchFields) {
        this._rpc.do(this._facadeFnLoad, args, function(response) {
            
            // Formular
            if (response.form) {
                this.removeAll();
                this.add(response.form);
            }

            if (searchFields || response.form || kijs.isEmpty(this._fields)) {
                this.searchFields();
            }
            
            // Formulardaten in Formular einfüllen
            if (response.formData) {
                this.data = response.formData;
            }
            
            this.raiseEvent('afterLoad');
        }, this, true, this, 'dom', false, this._onRpcBeforeMessages);
    }

    /**
     * Sendet die Formulardaten an den Server
     * @param {Boolean} [searchFields=false] Sollen die Formularfelder neu gesucht werden?
     * @returns {undefined}
     */
    save(searchFields) {
        let args = {};
        args.formData = {};

        if (searchFields || kijs.isEmpty(this._fields)) {
            this.searchFields();
        }

        // Zuerst lokal validieren
        let ok = this.validate();
        
        // formData ermitteln
        args.formData = this.data;
                
        // Wenn die lokale Validierung ok ist, an den Server senden
        if (ok) {
            this._rpc.do(this.facadeFnSave, args, function(response) {
                this.raiseEvent('afterSave');
            }, this, false, this, 'dom', false, this._onRpcBeforeMessages);
        } else {
            kijs.gui.MsgBox.error('Fehler', 'Es wurden noch nicht alle Felder richtig ausgefüllt.');
        }
    }

    /**
     * Sucht alle Felder im Formular und schreibt einen Verweis darauf in this._fields
     * @param {kijs.gui.Container} [parent=this]
     * @returns {Array}
     */
    searchFields(parent=this) {
        let ret = [];

        for (let i=0; i<parent.elements.length; i++) {
            let el = parent.elements[i];
            if (el instanceof kijs.gui.field.Field && !kijs.isEmpty(el.name)) {
                ret.push(el);
            } else if (el instanceof kijs.gui.Container) {
                ret = ret.concat(this.searchFields(el));
            }
        }

        if (parent === this) {
            this._fields = ret;
        }

        return ret;
    }

    /**
     * Validiert das Formular (Validierung nur im JavaScript)
     * @returns {Boolean}
     */
    validate() {
        let ret = true;

        for (let i=0; i<this._fields.length; i++) {
            if (!this._fields[i].validate()) {
                ret = false;
            }
        }

        return ret;
    }

    // EVENTS
    /**
     * callback-fnBeforeMessages, die eventuelle Fehler direkt im Formular anzeigt
     * @param {type} response
     * @returns {undefined}
     */
    _onRpcBeforeMessages(response) {
        if (!kijs.isEmpty(response.fieldErrors)) {
            // Fehler bei den entsprechenden Feldern anzeigen
            if (!kijs.isEmpty(this._fields)) {
                kijs.Array.each(this._fields, function(field) {
                    if (response.fieldErrors[field.name]) {
                        field.addValidateErrors(response.fieldErrors[field.name]);
                    }
                }, this);
            }
            
            // Fehler als Meldung anzeigen
            const msg = 'Es wurden noch nicht alle Felder richtig ausgefüllt.';
            if (kijs.isEmpty(response.errorMsg)) {
                response.errorMsg = msg;
            }
        }
    }

    _onAfterFirstRenderTo(e) {
        this.load();
    }
    
    
    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(preventDestructEvent) {
        // Event auslösen.
        if (!preventDestructEvent) {
            this.raiseEvent('destruct');
        }
        
        // Variablen (Objekte/Arrays) leeren
        this._data = null;
        this._fields = null;
        this._rpc = null;
        
        // Basisklasse entladen
        super.destruct(true);
    }
    
};
/* global kijs */

// --------------------------------------------------------------
// kijs.gui (Static)
// --------------------------------------------------------------
kijs.gui.field = class kijs_gui_field {
    
};

/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.field.Field (Abstract)
// --------------------------------------------------------------
kijs.gui.field.Field = class kijs_gui_field_Field extends kijs.gui.Container {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);
        
        this._labelHide = false;
        
        this._inputId = kijs.uniqId('kijs_-_input_');
        
        this._inputWrapperDom = new kijs.gui.Dom({
            cls: 'kijs-inputwrapper'
        });
        
        this._labelDom = new kijs.gui.Dom({
            cls: 'kijs-label',
            nodeTagName: 'label',
            nodeAttribute: {
                htmlFor: this._inputId
            }
        });
        
        this._spinIconEl = new kijs.gui.Icon({
            parent: this,
            iconChar: '&#xf0d7',
            cls: 'kijs-icon-spindown',
            visible: false
        });
        
        this._errorIconEl = new kijs.gui.Icon({
            parent: this,
            iconChar: '&#xf05a',
            cls: 'kijs-icon-error',
            toolTip: new kijs.gui.ToolTip({ cls: 'kijs-error' }),
            visible: false
        });
        
        this._errors = [];
        
        this._helpIconEl = new kijs.gui.Icon({
            parent: this,
            iconChar: '&#xf059',
            cls: 'kijs-icon-help',
            toolTip: new kijs.gui.ToolTip({ cls: 'kijs-help' }),
            visible: false
        });
        
        this._spinBoxEl = null;
        /*this._spinBoxEl = new kijs.gui.SpinBox({
            target: this,
            targetDomProperty: 'inputWrapperDom',
            ownerNodes: [this._inputWrapperDom, this._spinIconEl.dom],
            openOnInput: true,
            style: {
                padding: '10px'
            },
            html: 'XXXX<br>XXXX<br><br><br><br>XX<br>XX<br>XXX<br><br>XXX<br>XX<br><br>XXXXXXXX'
        });*/
        
        this._maxLength = null;
        this._required = false;


        this._dom.clsRemove('kijs-container');
        this._dom.clsAdd('kijs-field');

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            disabled: { target: 'disabled' },   // deaktiviert das Feld mit den Buttons (siehe auch readOnly)
            
            label: { target: 'html', context: this._labelDom },
            labelCls: { fn: 'function', target: this._labelDom.clsAdd, context: this._labelDom },
            labelHide: true,
            labelHtmlDisplayType: { target: 'htmlDisplayType', context: this._labelDom },
            labelStyle: { fn: 'assign', target: 'style', context: this._labelDom },
            labelWidth: { target: 'labelWidth' },
            value: { target: 'value' },
            
            errorIcon: { target: 'errorIcon' },
            errorIconChar: { target: 'errorIconChar', context: this._errorIconEl },
            errorIconCls: { target: 'errorIconCls', context: this._errorIconEl },
            errorIconColor: { target: 'errorIconColor', context: this._errorIconEl },

            helpIcon: { target: 'helpIcon' },
            helpIconChar: { target: 'helpIconChar', context: this._helpIconEl },
            helpIconCls: { target: 'helpIconCls', context: this._helpIconEl },
            helpIconColor: { target: 'helpIconColor', context: this._helpIconEl },
            
            helpText: { target: 'helpText' },
            
            maxLength: true,
            readOnly: { target: 'readOnly' },   // deaktiviert das Feld, die Buttons bleiben aber aktiv (siehe auch disabled)
            required: true,
            
            spinIcon: { target: 'spinIcon' },
            spinIconChar: { target: 'iconChar', context: this._spinIconEl },
            spinIconCls: { target: 'iconCls', context: this._spinIconEl },
            spinIconColor: { target: 'iconColor', context: this._spinIconEl },
            spinIconVisible: { target: 'visible', context: this._spinIconEl }
        });
        
        // Listeners
        this._spinIconEl.on('click', this._onSpinButtonClick, this);
        
        //this.on('keyDown', function() { console.log('keyDown Field'); }, this);
        
        // Config anwenden
        if (kijs.isObject(config)) {
            this.applyConfig(config, true);
        }
    }


    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get disabled() { return this._dom.clsHas('kijs-disabled'); }
    set disabled(val) {
        if (val) {
            this._dom.clsAdd('kijs-disabled');
        } else {
            this._dom.clsRemove('kijs-disabled');
        }
        
        // Icons auch aktivieren/deaktivieren
        this._spinIconEl.disabled = val;
        this._errorIconEl.disabled = val;
        this._helpIconEl.disabled = val;
        
        // Buttons auch aktivieren/deaktivieren
        const buttons = this.getElementsByXtype('kijs.gui.Button', 1);
        kijs.Array.each(buttons, function(button) {
            button.disabled = val;
        }, this);
    }

    get errorIcon() { return this._errorIconEl; }
    /**
     * Icon zuweisen
     * @param {kijs.gui.Icon|Object} val     Icon als icon-Config oder kijs.gui.Icon Element
     */
    set errorIcon(val) {
        // Icon zurücksetzen?
        if (kijs.isEmpty(val)) {
            this._errorIconEl.iconChar = null;
            this._errorIconEl.iconCls = null;
            this._errorIconEl.iconColor = null;
            if (this.isRendered) {
                this.render();
            }
            
        // kijs.gui.Icon Instanz
        } else if (val instanceof kijs.gui.Icon) {
            this._errorIconEl.destruct();
            this._errorIconEl = val;
            if (this.isRendered) {
                this.render();
            }
            
        // Config Objekt
        } else if (kijs.isObject(val)) {
            this._errorIconEl.applyConfig(val);
            if (this.isRendered) {
                this.render();
            }
            
        } else {
            throw new Error(`config "errorIcon" is not valid.`);
            
        }
    }
    
    get errorIconChar() { return this._errorIconEl.iconChar; }
    set errorIconChar(val) { 
        this._errorIconEl.iconChar = val;
        if (this.isRendered) {
            this.render();
        }
    }

    get errorIconCls() { return this._errorIconEl.iconCls; }
    set errorIconCls(val) {
        this._errorIconEl.iconCls = val;
        if (this.isRendered) {
            this.render();
        }
    }
    
    get errorIconColor() { return this._errorIconEl.iconColor; }
    set errorIconColor(val) {
        this._errorIconEl.iconColor = val;
        if (this.isRendered) {
            this.render();
        }
    }
    
    
    get helpIcon() { return this._helpIconEl; }
    /**
     * Icon zuweisen
     * @param {kijs.gui.Icon|Object} val     Icon als icon-Config oder kijs.gui.Icon Element
     */
    set helpIcon(val) {
        // Icon zurücksetzen?
        if (kijs.isEmpty(val)) {
            this._helpIconEl.iconChar = null;
            this._helpIconEl.iconCls = null;
            this._helpIconEl.iconColor = null;
                        
        // kijs.gui.Icon Instanz
        } else if (val instanceof kijs.gui.Icon) {
            this._helpIconEl.destruct();
            this._helpIconEl = val;
            if (this.isRendered) {
                this.render();
            }
            
        // Config Objekt
        } else if (kijs.isObject(val)) {
            this._helpIconEl.applyConfig(val);
            if (this.isRendered) {
                this._helpIconEl.render();
            }
            
        } else {
            throw new Error(`config "helpIcon" is not valid.`);
            
        }
    }
    
    get helpIconChar() { return this._helpIconEl.iconChar; }
    set helpIconChar(val) { 
        this._helpIconEl.iconChar = val;
    }

    get helpIconCls() { return this._helpIconEl.iconCls; }
    set helpIconCls(val) {
        this._helpIconEl.iconCls = val;
    }
    
    get helpIconColor() { return this._helpIconEl.iconColor; }
    set helpIconColor(val) {
        this._helpIconEl.iconColor = val;
        if (this.isRendered) {
            this.render();
        }
    }
    
    get helpText() { return this._helpIconEl.toolTip.html; }
    set helpText(val) {
        this._helpIconEl.toolTip = val;
        this._helpIconEl.visible = !kijs.isEmpty(this._helpIconEl.toolTip.html);
    }

    get inputWrapperDom() { return this._inputWrapperDom; }
    
    get label() { return this._labelDom.html; }
    set label(val) { 
        this._labelDom.html = val; 
    }
    
    get labelHide() { return this._labelHide; }
    set labelHide(val) { 
        this._labelHide = val;
        if (this.isRendered) {
            if (val) {
                this._labelDom.renderTo(this._dom.node, this._inputWrapperDom.node);
            } else {
                this._labelDom.unRender();
            }
        }
    }
    
    get labelDom() { return this._labelDom; }

    get labelHtmlDisplayType() { return this._labelDom.htmlDisplayType; }
    set labelHtmlDisplayType(val) { this._labelDom.htmlDisplayType = val; }

    get labelWidth() { return this._labelDom.width; }
    set labelWidth(val) { this._labelDom.width = val; }
    
    get readOnly() { return this._dom.clsHas('kijs-readonly'); }
    set readOnly(val) {
        if (val) {
            this._dom.clsAdd('kijs-readonly');
        } else {
            this._dom.clsRemove('kijs-readonly');
        }
    }
    
    
    get spinIcon() { return this._spinIconEl; }
    /**
     * Button zuweisen
     * @param {kijs.gui.Button|Object} val     Button als icon-Config oder kijs.gui.Button Element
     */
    set spinIcon(val) {
        // Button zurücksetzen?
        if (kijs.isEmpty(val)) {
            this._spinIconEl.iconChar = null;
            this._spinIconEl.iconCls = null;
            this._spinIconEl.iconColor = null;
            if (this.isRendered) {
                this.render();
            }
            
        // kijs.gui.Button Instanz
        } else if (val instanceof kijs.gui.Button) {
            this._spinIconEl.destruct();
            this._spinIconEl = val;
            if (this.isRendered) {
                this.render();
            }
            
        // Config Objekt
        } else if (kijs.isObject(val)) {
            this._spinIconEl.applyConfig(val);
            if (this.isRendered) {
                this.render();
            }
            
        } else {
            throw new Error(`config "spinIcon" is not valid.`);
            
        }
    }
    
    get spinIconChar() { return this._spinIconEl.iconChar; }
    set spinIconChar(val) { 
        this._spinIconEl.iconChar = val;
        if (this.isRendered) {
            this.render();
        }
    }

    get spinIconCls() { return this._spinIconEl.iconCls; }
    set spinIconCls(val) {
        this._spinIconEl.iconCls = val;
        if (this.isRendered) {
            this.render();
        }
    }
    
    get spinIconColor() { return this._spinIconEl.iconColor; }
    set spinIconColor(val) {
        this._spinIconEl.iconColor = val;
        if (this.isRendered) {
            this.render();
        }
    }
    
    get spinIconVisible() { return !!this._spinIconEl.visible; }
    set spinIconVisible(val) { 
        this._spinIconEl.visible = !!val;
        if (this.isRendered) {
            this.render();
        } }
    
    // Muss überschrieben werden
    get value() { return null; }
    set value(val) {}


    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    /**
     * Fügt Fehler aus einer externen Validation hinzu
     * @param {String|Array} errors
     */
    addValidateErrors(errors) {
        if (!errors) {
            return;
        }

        if (!kijs.isArray(errors)) {
            errors = [errors];
        }

        this._errors = this._errors.concat(errors);

        // Fehler anzeigen, falls vorhanden
        this._displayErrors();
    }

    // overwrite
    render(preventAfterRender) {
        // dom mit elements rendern (innerDom)
        super.render(true);
        
        // Label rendern (kijs.guiDom)
        if (!this._labelHide) {
            this._labelDom.renderTo(this._dom.node, this._innerDom.node);
        } else {
            this._labelDom.unRender();
        }
        
        // InputWrapper rendern (kijs.guiDom)
        this._inputWrapperDom.renderTo(this._dom.node, this._innerDom.node);
        
         // Spin icon rendern (kijs.gui.Icon)
        this._spinIconEl.renderTo(this._dom.node, this._innerDom.node);
        
        // Help icon rendern (kijs.gui.Icon)
        this._helpIconEl.renderTo(this._dom.node);
        
        // Error icon rendern (kijs.gui.Icon)
        this._errorIconEl.renderTo(this._dom.node);
        
        // Event afterRender auslösen
        if (!preventAfterRender) {
            this.raiseEvent('afterRender');
        }
    }


    // overwrite
    unRender() {
        this._labelDom.unRender();
        this._inputWrapperDom.unRender();
        if (this._spinBox) {
            this._spinBox.unRender();
        }
        this._spinIconEl.unRender();
        this._errorIconEl.unRender();
        this._helpIconEl.unRender();
        super.unRender();
    }

    /**
     * Validiert den Inhalt des Felds
     * @returns {Boolean}
     */
    validate() {
        this._errors = [];

        // Validierungen anwenden
        this._validationRules(this.value);
        
        // Fehler anzeigen, falls vorhanden
        this._displayErrors();
        
        return kijs.isEmpty(this._errors);
    }


    // PROTECTED
    /**
     * Zeigt die Fehler aus this._errors im errorIcon an
     * @returns {undefined}
     */
    _displayErrors() {
        if (!kijs.isEmpty(this._errors)) {
            this._dom.clsAdd('kijs-error');
            this._errorIconEl.toolTip = this._errors;
            this._errorIconEl.visible = true;
        } else {
            this._dom.clsRemove('kijs-error');
            this._errorIconEl.visible = false;
        }
    }
    
   /**
     * Diese Funktion ist zum Überschreiben gedacht
     * @param {type} value
     * @returns {undefined}
     */
    _validationRules(value) {

        // Eingabe erforderlich
        if (this._required) {
            if (kijs.isEmpty(value)) {
                this._errors.push('Dieses Feld darf nicht leer sein');
            }
        }

        // Maximale Länge
        if (!kijs.isEmpty(this._maxLength)) {
            if (!kijs.isEmpty(value) && value.length > this._maxLength) {
                this._errors.push('Dieses Feld darf maximal ' + this._maxLength + ' Zeichen enthalten');
            }
        }
    }
    
    
    // LISTENERS
    _onSpinButtonClick(e) {
        if (this._spinBoxEl) {
            if (this._spinBoxEl.isRendered) {
                this._spinBoxEl.close();
            } else {
                const width = this._inputWrapperDom.width + this._spinIconEl.width;
                this._spinBoxEl.style.minWidth = width + 'px';
                this._spinBoxEl.show();
            }
        }
    }
    
    
    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(preventDestructEvent) {
        // Event auslösen.
        if (!preventDestructEvent) {
            this.raiseEvent('destruct');
        }
        
        // Elemente/DOM-Objekte entladen
        if (this._labelDom) {
            this._labelDom.destruct();
        }
        if (this._inputWrapperDom) {
            this._inputWrapperDom.destruct();
        }
        if (this._spinBoxEl) {
            this._spinBoxEl.destruct();
        }
        if (this._spinIconEl) {
            this._spinIconEl.destruct();
        }
        if (this._errorIconEl) {
            this._errorIconEl.destruct();
        }
        if (this._helpIconEl) {
            this._helpIconEl.destruct();
        }
            
        // Variablen (Objekte/Arrays) leeren
        this._errors = null;
        this._labelDom = null;
        this._inputWrapperDom = null;
        this._spinBoxEl = null;
        this._spinIconEl = null;
        this._errorIconEl = null;
        this._helpIconEl = null;
        this._value = null;
        
        // Basisklasse entladen
        super.destruct(true);
    }
};

/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.field.Text
// --------------------------------------------------------------
kijs.gui.field.Text = class kijs_gui_field_Text extends kijs.gui.field.Field {
    
    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);
        
        this._inputDom = new kijs.gui.Dom({
            disableEnterEscBubbeling: true,
            nodeTagName: 'input',
            nodeAttribute: {
                id: this._inputId
            }
        });
        
        this._trimValue = true;
        
        this._dom.clsAdd('kijs-field-text');
       
       // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            trimValue: true             // Sollen Leerzeichen am Anfang und Ende des Values automatisch entfernt werden?
        });
        
        // Event-Weiterleitungen von this._inputDom
        this._eventForwardsAdd('input', this._inputDom);
        this._eventForwardsAdd('blur', this._inputDom);
        
        this._eventForwardsRemove('enterPress', this._dom);
        this._eventForwardsRemove('enterEscPress', this._dom);
        this._eventForwardsRemove('escPress', this._dom);
        this._eventForwardsAdd('enterPress', this._inputDom);
        this._eventForwardsAdd('enterEscPress', this._inputDom);
        this._eventForwardsAdd('escPress', this._inputDom);
        
        // Listeners
        this.on('input', this._onInput, this);
        
        // Config anwenden
        if (kijs.isObject(config)) {
            this.applyConfig(config, true);
        }
    }
    
    
    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    // overwrite
    get disabled() { return super.disabled; }
    set disabled(val) {
        super.disabled = !!val;
        if (val || this._dom.clsHas('kijs-readonly')) {
            this._inputDom.nodeAttributeSet('readOnly', true);
        } else {
            this._inputDom.nodeAttributeSet('readOnly', false);
        }
    }
    
    // overwrite
    get isEmpty() { return kijs.isEmpty(this._inputDom.value); }

    get inputDom() { return this._inputDom; }
    
    // overwrite
    get readOnly() { return super.readOnly; }
    set readOnly(val) {
        super.readOnly = !!val;
        if (val || this._dom.clsHas('kijs-disabled')) {
            this._inputDom.nodeAttributeSet('readOnly', true);
        } else {
            this._inputDom.nodeAttributeSet('readOnly', false);
        }
    }
    
    get trimValue() { return this._trimValue; }
    set trimValue(val) { this._trimValue = val; }
    
    // overwrite
    get value() {
        let val = this._inputDom.nodeAttributeGet('value');
        if (this._trimValue && kijs.isString(val)) {
            val = val.trim();
        }
        return val;
    }
    set value(val) { 
        this._inputDom.nodeAttributeSet('value', val);
    }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // overwrite
    render(preventAfterRender) {
        super.render(true);
        
        // Input rendern (kijs.guiDom)
        this._inputDom.renderTo(this._inputWrapperDom.node);

        // Event afterRender auslösen
        if (!preventAfterRender) {
            this.raiseEvent('afterRender');
        }
    }


    // overwrite
    unRender() {
        this._inputDom.unRender();
        super.unRender();
    }


    // LISTENERS
    _onInput(e) {
        this.validate();
    }
    
    
    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(preventDestructEvent) {
        // Event auslösen.
        if (!preventDestructEvent) {
            this.raiseEvent('destruct');
        }
        
        // Elemente/DOM-Objekte entladen
        if (this._inputDom) {
            this._inputDom.destruct();
        }
            
        // Variablen (Objekte/Arrays) leeren
        this._inputDom = null;
        
        // Basisklasse entladen
        super.destruct(true);
    }
};
/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.field.Memo
// --------------------------------------------------------------
kijs.gui.field.Memo = class kijs_gui_field_Memo extends kijs.gui.field.Field {
    
    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);
        
        this._inputDom = new kijs.gui.Dom({
            disableEnterEscBubbeling: true,
            nodeTagName: 'textarea',
            nodeAttribute: {
                id: this._inputId
            }
        });
        
        this._trimValue = true;
        
        this._dom.clsAdd('kijs-field-memo');
        
        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            trimValue: true             // Sollen Leerzeichen am Anfang und Ende des Values automatisch entfernt werden?
        });
        
        // Event-Weiterleitungen von this._inputDom
        this._eventForwardsAdd('input', this._inputDom);
        this._eventForwardsAdd('blur', this._inputDom);
        
        this._eventForwardsRemove('enterPress', this._dom);
        this._eventForwardsRemove('enterEscPress', this._dom);
        this._eventForwardsRemove('escPress', this._dom);
        
        this._eventForwardsAdd('enterPress', this._inputDom);
        this._eventForwardsAdd('enterEscPress', this._inputDom);
        this._eventForwardsAdd('escPress', this._inputDom);

        // Listeners
        this.on('input', this._onInput, this);
        
        // Config anwenden
        if (kijs.isObject(config)) {
            this.applyConfig(config, true);
        }
    }
    
    
    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    // overwrite
    get disabled() { return super.disabled; }
    set disabled(val) {
        super.disabled = val;
        if (val) {
            this._inputDom.nodeAttributeSet('readOnly', true);
        } else {
            this._inputDom.nodeAttributeSet('readOnly', false);
        }
    }
    
    // overwrite
    get isEmpty() { return kijs.isEmpty(this._inputDom.value); }

    get inputDom() { return this._inputDom; }
    
    // overwrite
    get readOnly() { return super.readOnly; }
    set readOnly(val) {
        super.readOnly = !!val;
        if (val || this._dom.clsHas('kijs-disabled')) {
            this._inputDom.nodeAttributeSet('readOnly', true);
        } else {
            this._inputDom.nodeAttributeSet('readOnly', false);
        }
    }

    get trimValue() { return this._trimValue; }
    set trimValue(val) { this._trimValue = val; }
    
    // overwrite
    get value() {
        let val = this._inputDom.nodeAttributeGet('value');
        if (this._trimValue && kijs.isString(val)) {
            val = val.trim();
        }
        return val;
    }
    set value(val) { 
        this._inputDom.nodeAttributeSet('value', val);
    }


    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // overwrite
    render(preventAfterRender) {
        super.render(true);
        
        // Input rendern (kijs.guiDom)
        this._inputDom.renderTo(this._inputWrapperDom.node);

        // Event afterRender auslösen
        if (!preventAfterRender) {
            this.raiseEvent('afterRender');
        }
    }


    // overwrite
    unRender() {
        this._inputDom.unRender();
        super.unRender();
    }


    // LISTENERS
    _onInput(e) {
        this.validate();
    }
    
    
    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(preventDestructEvent) {
        // Event auslösen.
        if (!preventDestructEvent) {
            this.raiseEvent('destruct');
        }
        
        // Elemente/DOM-Objekte entladen
        if (this._inputDom) {
            this._inputDom.destruct();
        }
            
        // Variablen (Objekte/Arrays) leeren
        this._inputDom = null;
        
        // Basisklasse entladen
        super.destruct(true);
    }
};
/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.field.Password
// --------------------------------------------------------------
kijs.gui.field.Password = class kijs_gui_field_Password extends kijs.gui.field.Field {
    

    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);
        
        this._inputDom = new kijs.gui.Dom({
            disableEnterEscBubbeling: true,
            nodeTagName: 'password',
            nodeAttribute: {
                id: this._inputId
            }
        });
        
        this._disableBrowserSecurityWarning = false;
        this._passwordChar = '•';
        this._trimValue = false;
        
        this._value = null;
        
        this._dom.clsAdd('kijs-field-password');
       
        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            disableBrowserSecurityWarning: { target: 'disableBrowserSecurityWarning' },  // false: Nimmt das Standard Passwort-Feld
                                                                    // true:  Eigenes Feld, dass nicht als Kennwort-Feld erkannt wird und 
                                                                    //        deshalb auch keine Warnung bei unsicherer Verbindung ausgibt
                                                                    // 'auto' bei unsicherer Verbindung && Firefox = true sonst false
            passwordChar: true,
            trimValue: true             // Sollen Leerzeichen am Anfang und Ende des Values automatisch entfernt werden?
        });
        
        // Event-Weiterleitungen von this._inputDom
        //this._eventForwardsAdd('input', this._inputDom);
        this._eventForwardsAdd('blur', this._inputDom);
        
        this._eventForwardsRemove('enterPress', this._dom);
        this._eventForwardsRemove('enterEscPress', this._dom);
        this._eventForwardsRemove('escPress', this._dom);
        this._eventForwardsAdd('enterPress', this._inputDom);
        this._eventForwardsAdd('enterEscPress', this._inputDom);
        this._eventForwardsAdd('escPress', this._inputDom);
        
        // Listeners
        this.on('input', this._onInput, this);
        this._inputDom.on('input', this._onDomInput, this);
        
        // Config anwenden
        if (kijs.isObject(config)) {
            this.applyConfig(config, true);
        }
    }
    
    
    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get disableBrowserSecurityWarning() { return this._disableBrowserSecurityWarning; }
    set disableBrowserSecurityWarning(val) {
        if (val === 'auto') {
            if (location.protocol !== 'https:' && kijs.isFirefox()) {
                this.disableBrowserSecurityWarning = true;
            } else {
                this.disableBrowserSecurityWarning = false;
            }
        } else {
            this._disableBrowserSecurityWarning = !!val;
        }
    }
    
    // overwrite
    get disabled() { return super.disabled; }
    set disabled(val) {
        super.disabled = !!val;
        if (val || this._dom.clsHas('kijs-readonly')) {
            this._inputDom.nodeAttributeSet('readOnly', true);
        } else {
            this._inputDom.nodeAttributeSet('readOnly', false);
        }
    }
    
    // overwrite
    get isEmpty() { return kijs.isEmpty(this._inputDom.value); }

    get inputDom() { return this._inputDom; }
    
    get passwordChar() { return this._passwordChar; }
    set passwordChar(val) { this._passwordChar = val; }
    
    // overwrite
    get readOnly() { return super.readOnly; }
    set readOnly(val) {
        super.readOnly = !!val;
        if (val || this._dom.clsHas('kijs-disabled')) {
            this._inputDom.nodeAttributeSet('readOnly', true);
        } else {
            this._inputDom.nodeAttributeSet('readOnly', false);
        }
    }
    
    get trimValue() { return this._trimValue; }
    set trimValue(val) { this._trimValue = val; }
    
    // overwrite
    get value() {
        let val;
        
        if (this._disableBrowserSecurityWarning) {
            val = this._value;
        } else {
            val = this._inputDom.nodeAttributeGet('value');
        }
        
        if (this._trimValue && kijs.isString(val)) {
            val = val.trim();
        }
        
        return val;
    }
    set value(val) {
        if (this._disableBrowserSecurityWarning) {
            let oldValue = this.value;
            
            this._value = val;
            
            this._inputDom.nodeAttributeSet('value', kijs.isEmpty(val) ? '' : val.replace(/./g, this._passwordChar));
            
            if (this._value !== oldValue) {
                this.raiseEvent('change', {eventName:'change', value: val, oldValue: oldValue}, this);
            }
        } else {
            this._inputDom.nodeAttributeSet('value', val);
        }
    }
    
    
    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // overwrite
    render(preventAfterRender) {
        // Evtl. eigenes Passwort-Feld ohne Sicherheitswarnung erstellen
        if (this._disableBrowserSecurityWarning) {
            this._inputDom.nodeTagName = 'input';
            
            // DOM-Events
            this._inputDom.on('keyUp', this._onKeyUp, this);
            this._inputDom.on('mouseUp', this._onMouseUp, this);
            this._inputDom.on('input', this._onInput, this);
        }
        
        super.render(true);

        // Input rendern (kijs.guiDom)
        this._inputDom.renderTo(this._inputWrapperDom.node);

        // Event afterRender auslösen
        if (!preventAfterRender) {
            this.raiseEvent('afterRender');
        }
    }


    // overwrite
    unRender() {
        this._inputDom.unRender();
        super.unRender();
    }


    // PROTECTED
    // Stellt sicher, dass der Cursor nur ans Feldende gesetzt oder alles markiert werden kann
    _reposCursor() {
        const val = this._inputDom.node.value;
        const len = val.length;

        if (this._inputDom.node.selectionStart===0 && this._inputDom.node.selectionEnd===len)  {
            // alles ist markiert: ok
        } else if (this._inputDom.node.selectionStart===len && this._inputDom.node.selectionEnd===len)  {
            // cursor ist am Ende: ok
        } else {
            // sonst alles markieren
            this._inputDom.node.selectionStart = 0;
            this._inputDom.node.selectionEnd = len;
        }
    }
    

    // LISTENERS
    _onInput(e) {
        this.validate();
    }
    
    _onDomInput(e) {
        if (this._disableBrowserSecurityWarning) {
            const val = this._inputDom.node.value;
            const len = val.length;

            this._value = kijs.isEmpty(this._value) ? '' : this._value;

            // Neue Zeichen ermittteln
            var newChars = kijs.String.replaceAll(val, this._passwordChar, '');

            // Ist das Feld nun leer?
            if (val === '') {
                this.value = '';

            // Sonst: Wenn das erste Zeichen neu ist, so ist der ganze Wert neu
            } else if (val.substr(0,1) !== this._passwordChar) {
                this.value = newChars;


            // Sonst: Wenn das letzte Zeichen neu ist, so bleibt der Anfang evtl. bestehen 
            // und die neuen Zeichen werden am Ende angefügt
            } else if (val.substr(len-1,1) !== this._passwordChar) {
                // alte Zeichen bleiben bestehen
                const oldChars = this._value.substr(0, len - newChars.length);
                this.value = oldChars + newChars;

            // Oder wurde mit Backspace das letzte Zeichen gelöscht?
            } else if (len < this._value.length) {
                this.value = this._value.substr(0, len);

            }
        }
        
        // Nun noch unser Input Event auslösen
        e.eventName = 'input';
        return this.raiseEvent('input', e, this);
    }

    _onKeyUp(e) {
        this._reposCursor();
    }

    _onMouseUp(e) {
        kijs.defer(this._reposCursor, 10, this);
    }

    
    
    
    
    
    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(preventDestructEvent) {
        // Event auslösen.
        if (!preventDestructEvent) {
            this.raiseEvent('destruct');
        }
        
        // Elemente/DOM-Objekte entladen
        if (this._inputDom) {
            this._inputDom.destruct();
        }
            
        // Variablen (Objekte/Arrays) leeren
        this._inputDom = null;
        
        // Basisklasse entladen
        super.destruct(true);
    }
};

/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.field.Checkbox
// --------------------------------------------------------------
kijs.gui.field.Checkbox = class kijs_gui_field_Checkbox extends kijs.gui.field.Field {
    

    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);
        
        this._captionHide = false;                  // caption ausblenden?
        
        this._checked = 0;                          // 0=checked, 1=unchecked, 2=indeterminated

        this._checkedIconChar = '&#xf046';          // Radio-Style: '&#xf05d' oder '&#xf111'
        this._checkedIconCls = null;
        this._determinatedIconChar = '&#xf147';
        this._determinatedIconCls = null;
        this._uncheckedIconChar = '&#xf096';        // Radio-Style: '&#xf10c'
        this._uncheckedIconCls = null;
        
        this._threeState = false;                   // Erreichen des dritte Status "Intermediate" per Klick möglich?
        
        this._valueChecked = true;
        this._valueDeterminated = 2;
        this._valueUnchecked = false;
        
        this._inputWrapperDom.nodeAttributeSet('tabIndex', 0);
        
        this._checkboxIconEl = new kijs.gui.Icon({
            parent: this,
            cls: 'kijs-checkbox-input'
        });
        
        this._iconEl = new kijs.gui.Icon({ 
            parent: this,
            cls: 'kijs-checkbox-icon'
        });
        
        this._captionDom = new kijs.gui.Dom({
            cls: 'kijs-caption',
            nodeTagName: 'span'
        });
        
        this._dom.clsAdd('kijs-field-checkbox');
       
        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            caption: { target: 'html', context: this._captionDom },
            captionCls: { fn: 'function', target: this._captionDom.clsAdd, context: this._captionDom },
            captionHide: true,
            captionHtmlDisplayType: { target: 'htmlDisplayType', context: this._captionDom },
            captionStyle: { fn: 'assign', target: 'style', context: this._captionDom },
            captionWidth: { target: 'captionWidth' },
            
            checkedIconChar: true,
            checkedIconCls: true,
            determinatedIconChar: true,
            determinatedIconCls: true,
            uncheckedIconChar: true,
            uncheckedIconCls: true,

            icon: { target: 'icon' },
            iconChar: { target: 'iconChar', context: this._iconEl },
            iconCls: { target: 'iconCls', context: this._iconEl },
            iconColor: { target: 'iconColor', context: this._iconEl },
            
            threeState: { prio: 1001, target: '_threeState' },
            
            valueChecked: { prio: 1002, target: '_valueChecked' },
            valueUnchecked: { prio: 1002, target: '_valueUnchecked' },
            valueDeterminated: { prio: 1002, target: '_valueDeterminated' },
            
            value: { prio: 1003, target: 'value' },
            checked: { prio: 1004, target: 'checked' }
        });
        
        // Event-Weiterleitungen von this._inputWrapperDom
        this._eventForwardsAdd('focus', this._inputWrapperDom);
        this._eventForwardsAdd('blur', this._inputWrapperDom);
        
        // Listeners
        this._inputWrapperDom.on('click', this._onClick, this);
        this._inputWrapperDom.on('spacePress', this._onSpacePress, this);
        
        // Config anwenden
        if (kijs.isObject(config)) {
            this.applyConfig(config, true);
        }
    }
    
    
    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get caption() { return this._captionDom.html; }
    set caption(val) { 
        this._captionDom.html = val; 
    }
    
    get captionHide() { return this._captionHide; }
    set captionHide(val) { 
        this._captionHide = val;
        if (this.isRendered) {
            if (val) {
                this._captionDom.renderTo(this._inputWrapperDom.node, this._inputDom.node);
            } else {
                this._captionDom.unRender();
            }
        }
    }
    
    get captionDom() { return this._captionDom; }
    
    get captionHtmlDisplayType() { return this._captionDom.htmlDisplayType; }
    set captionHtmlDisplayType(val) { this._captionDom.htmlDisplayType = val; }
    
    get captionWidth() { return this._captionDom.width; }
    set captionWidth(val) { this._captionDom.width = val; }
    
    get checked() { return this._checked; }
    set checked(val) { 
        if (val === 2 || val === '2') {
            this._checked = 2;
        } else if (val === 1 || val === '1' || val === true) {
            this._checked = 1;
        } else if (val === 0 || val === '0' || val === false || kijs.isEmpty(val)) {
            this._checked = 0;
        } else {
            throw new Error(`config "checked" is not valid.`);
        }
        this._updateCheckboxIcon();
    }

    get checkboxIcon() { return this._checkboxIconEl; }

    get icon() { return this._iconEl; }
    /**
     * Icon zuweisen
     * @param {kijs.gui.Icon|Object} val     Icon als icon-Config oder kijs.gui.Icon Element
     */
    set icon(val) {
        // Icon zurücksetzen?
        if (kijs.isEmpty(val)) {
            this._iconEl.iconChar = null;
            this._iconEl.iconCls = null;
            this._iconEl.iconColor = null;
            if (this.isRendered) {
                this.render();
            }
            
        // kijs.gui.Icon Instanz
        } else if (val instanceof kijs.gui.Icon) {
            this._iconEl.destruct();
            this._iconEl = val;
            if (this.isRendered) {
                this.render();
            }
            
        // Config Objekt
        } else if (kijs.isObject(val)) {
            this._iconEl.applyConfig(val);
            if (this.isRendered) {
                this.render();
            }
            
        } else {
            throw new Error(`config "icon" is not valid.`);
            
        }
    }
    
    get iconChar() { return this._iconEl.iconChar; }
    set iconChar(val) { 
        this._iconEl.iconChar = val;
        if (this.isRendered) {
            this.render();
        }
    }

    get iconCls() { return this._iconEl.iconCls; }
    set iconCls(val) {
        this._iconEl.iconCls = val;
        if (this.isRendered) {
            this.render();
        }
    }

    get iconColor() { return this._iconEl.iconColor; }
    set iconColor(val) {
        this._iconEl.iconColor = val;
        if (this.isRendered) {
            this.render();
        }
    }

    // overwrite
    get isEmpty() { return kijs.isEmpty(this._checked === 0); }

    get threeState() { return this._threeState; }
    set threeState(val) { this._threeState = val; }
    
    // overwrite
    get value() {
        switch (this._checked) {
            case 0: return this._valueUnchecked;
            case 1: return this._valueChecked;
            case 2: return this._valueDeterminated;
        }
    }
    set value(val) {
        if (val === this._valueUnchecked) {
            this._checked = 0;
        } else if (val === this._valueChecked) {
            this._checked = 1;
        } else if (val === this._valueDeterminated) {
            this._checked = 2;
        } else {
            throw new Error(`config "value" is not valid.`);
        }
        this._updateCheckboxIcon();
    }

    get valueChecked() { return this._valueChecked; }
    set valueChecked(val) { this._valueChecked = val; }

    get valueDeterminated() { return this._valueDeterminated; }
    set valueDeterminated(val) { this._valueDeterminated = val; }

    get valueUnchecked() { return this._valueUnchecked; }
    set valueUnchecked(val) { this._valueUnchecked = val; }

    
    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // overwrite
    render(preventAfterRender) {
        super.render(true);
        
        // Checkbox rendern (kijs.guiDom)
        this._checkboxIconEl.renderTo(this._inputWrapperDom.node);
        this._updateCheckboxIcon();
        
        // Span icon rendern (kijs.gui.Icon)
        if (!this._iconEl.isEmpty) {
            this._iconEl.renderTo(this._inputWrapperDom.node);
        } else {
            this._iconEl.unRender();
        }

        // Span caption rendern (kijs.guiDom)
        if (!this._captionHide) {
            this._captionDom.renderTo(this._inputWrapperDom.node);
        } else {
            this._captionDom.unRender();
        }
        
        // Event afterRender auslösen
        if (!preventAfterRender) {
            this.raiseEvent('afterRender');
        }
    }

    // overwrite
    unRender() {
        this._checkboxIconEl.unRender();
        this._iconEl.unRender();
        this._captionDom.unRender();
        super.unRender();
    }


    // PROTECTED
    _updateCheckboxIcon() {
        let cls, iconChar, iconCls;
        
        switch (this._checked) {
            case 0:
                cls = 'kijs-unchecked';
                iconChar = this._uncheckedIconChar;
                iconCls = this._uncheckedIconCls;
                break;
                
            case 1:
                cls = 'kijs-checked';
                iconChar = this._checkedIconChar;
                iconCls = this._checkedIconCls;
                break;
                
            case 2:
                cls = 'kijs-determinated';
                iconChar = this._determinatedIconChar;
                iconCls = this._determinatedIconCls;
                break;
        }
        
        this._dom.clsRemove(['kijs-checked', 'kijs-determinated', 'kijs-unchecked']);
        this._dom.clsAdd(cls);
        this._checkboxIconEl.iconChar = iconChar;
        this._checkboxIconEl.iconCls = iconCls;
    }


    // LISTENERS
    _onClick(e) {
        if (!this.readOnly && !this.disabled) {
            const oldChecked = this._checked;
            const oldValue = this.value;

            this._checked ++;
            
            if (this._threeState) {
                if (this._checked > 2) {
                    this._checked = 0;
                }
            } else {
                if (this._checked > 1) {
                    this._checked = 0;
                }
            }
            
            this._updateCheckboxIcon();
            this._checkboxIconEl.focus();
            this.validate();

            this.raiseEvent('input', { oldChecked: oldChecked, checked: this._checked, oldValue: oldValue, value: this.value } );
        }
    }

    _onSpacePress(e) {
        if (!this.readOnly && !this.disabled) {
            const oldChecked = this._checked;
            const oldValue = this.value;

            this._checked ++;
            
            if (this._threeState) {
                if (this._checked > 2) {
                    this._checked = 0;
                }
            } else {
                if (this._checked > 1) {
                    this._checked = 0;
                }
            }
            
            this._updateCheckboxIcon();
            this.validate();

            this.raiseEvent('input', { oldChecked: oldChecked, checked: this._checked, oldValue: oldValue, value: this.value } );
        }
        // Bildlauf der Space-Taste verhindern
        e.nodeEvent.preventDefault();
    }

    
    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(preventDestructEvent) {
        // Event auslösen.
        if (!preventDestructEvent) {
            this.raiseEvent('destruct');
        }
        
        // Elemente/DOM-Objekte entladen
        if (this._checkboxIconEl) {
            this._checkboxIconEl.destruct();
        }
        
        if (this._iconEl) {
            this._iconEl.destruct();
        }
        
        if (this._captionDom) {
            this._captionDom.destruct();
        }
        
        // Variablen (Objekte/Arrays) leeren
        this._checkboxIconEl = null;
        this._iconEl = null;
        this._captionDom = null;
        
        // Basisklasse entladen
        super.destruct(true);
    }
};
/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.field.CheckboxGroup
// --------------------------------------------------------------
kijs.gui.field.CheckboxGroup = class kijs_gui_field_CheckboxGroup extends kijs.gui.field.Field {
    

    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);
    
        this._captionField = null;
        this._captionHtmlDisplayType = 'html';
        this._valueField = null;
        this._iconCharField = null;
        this._iconClsField = null;
        this._iconColorField = null;
        
        this._checkedIconChar = '&#xf046';          // Radio-Style: '&#xf05d' oder '&#xf111'
        this._checkedIconCls = null;
        this._uncheckedIconChar = '&#xf096';        // Radio-Style: '&#xf10c'
        this._uncheckedIconCls = null;
        
        this._checkboxElements = [];
        this._data = [];
        this._oldValue = [];
        
        this._dom.clsAdd('kijs-field-checkboxgroup');
       
        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            autoLoad: { target: 'autoLoad' },   // Soll nach dem erten Rendern automatisch die Load-Funktion aufgerufen werden?
            captionHtmlDisplayType: true,   // Darstellung der captions. Default: 'html'
                                            // html: als html-Inhalt (innerHtml)
                                            // code: Tags werden als als Text angezeigt
                                            // text: Tags werden entfernt
            
            checkedIconChar: true,
            checkedIconCls: true,
            uncheckedIconChar: true,
            uncheckedIconCls: true,

            data: { target: 'data' },
            facadeFnLoad: true,             // Name der Facade-Funktion. Bsp: 'address.load'
            rpc: { target: 'rpc' },         // Instanz von kijs.gui.Rpc
            
            captionField: true,
            iconCharField: true,
            iconClsField: true,
            iconColorField: true,
            valueField: true
        });
        
        // Config anwenden
        if (kijs.isObject(config)) {
            this.applyConfig(config, true);
        }
    }
    
    
    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get autoLoad() {
        return this.hasListener('afterFirstRenderTo', this._onAfterFirstRenderTo, this);
    }
    set autoLoad(val) {
        if (val) {
            this.on('afterFirstRenderTo', this._onAfterFirstRenderTo, this);
        } else {
            this.off('afterFirstRenderTo', this._onAfterFirstRenderTo, this);
        }
    }
    
    get captionField() { return this._captionField; }
    set captionField(val) { this._captionField = val; }

    get valueField() { return this._valueField; }
    set valueField(val) { this._valueField = val; }

    get data() { return this._data; }
    set data(val) { 
        this._data = val;
        
        // Bestehende Elemente löschen
        kijs.Array.each(this._checkboxElements, function(el) {
            el.destruct();
        }, this);
        this._checkboxElements = [];

        // Neue Elemente einfügen
        kijs.Array.each(this._data, function(row) {
            const el = new kijs.gui.field.Checkbox({
                captionHtmlDisplayType: this._captionHtmlDisplayType,
                checkedIconChar: this._checkedIconChar,
                checkedIconCls: this._checkedIconCls,
                uncheckedIconChar: this._uncheckedIconChar,
                uncheckedIconCls: this._uncheckedIconCls,
                caption: this._captionField && row[this._captionField] ? row[this._captionField] : '',
                iconChar: this._iconCharField && row[this._iconCharField] ? row[this._iconCharField] : '',
                iconCls: this._iconClsField && row[this._iconClsField] ? row[this._iconClsField] : '',
                iconColor: this._iconColorField && row[this._iconColorField] ? row[this._iconColorField] : undefined,
                valueChecked: row[this._valueField],
                valueUnchecked: null,
                labelHide: true,
                threeState: false
            });
            el.on('input', this._onCheckboxElementInput, this);
            
            this._checkboxElements.push(el);
        }, this);

        this.value = this._value; 
        
        if (this._inputWrapperDom.isRendered) {
            kijs.Array.each(this._checkboxElements, function(el) {
                el.renderTo(this._inputWrapperDom.node);
            }, this);
        }
    }

    // overwrite
    get disabled() { return super.disabled; }
    set disabled(val) {
        super.disabled = !!val;
        kijs.Array.each(this._checkboxElements, function(el) {
            el.disabled = !!val;
        }, this);
    }
    
    get facadeFnLoad() { return this._facadeFnLoad; }
    set facadeFnLoad(val) { this._facadeFnLoad = val; }

    // overwrite
    get isEmpty() { return kijs.isEmpty(this.value); }
    
    // overwrite
    get readOnly() { return super.readOnly; }
    set readOnly(val) {
        super.readOnly = !!val;
        kijs.Array.each(this._checkboxElements, function(el) {
            el.readOnly = !!val;
        }, this);
    }
    
    get rpc() { return this._rpc;}
    set rpc(val) {
        if (val instanceof kijs.gui.Rpc) {
            this._rpc = val;
            
        } else if (kijs.isString(val)) {
            if (this._rpc) {
                this._rpc.url = val;
            } else {
                this._rpc = new kijs.gui.Rpc({
                    url: val
                });
            }
            
        } else {
            throw new Error(`Unkown format on config "rpc"`);
            
        }
    }
    
    // overwrite
    get value() {
        if (!kijs.isEmpty(this._checkboxElements)) {
            const value = [];
            kijs.Array.each(this._checkboxElements, function(el) {
                let val = el.value;
                if (!kijs.isEmpty(val)) {
                    value.push(val);
                }
            }, this);
           this._value = value;
        }
        return this._value;
    }
    set value(val) {
        if (kijs.isEmpty(val)) {
            val = [];
        } else if (!kijs.isArray(val)) {
            val = [val];
        }
        this._value = val;
        this._oldValue = val;
        kijs.Array.each(this._checkboxElements, function(el) {
            el.checked = kijs.Array.contains(val, el.valueChecked) ? 1 : 0;
        }, this);
    }
    


    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    /**
     * Füllt das Combo mit Daten vom Server
     * @param {Array} args Array mit Argumenten, die an die Facade übergeben werden
     * @returns {undefined}
     */
    load(args) {
        this._rpc.do(this._facadeFnLoad, args, function(response) {
            this.data = response.rows;
        }, this, true, this, 'dom', false);
    }

    // overwrite
    render(preventAfterRender) {
        super.render(true);
        
        // Event afterRender auslösen
        if (!preventAfterRender) {
            this.raiseEvent('afterRender');
        }
        
        if (this._data) {
            this.data = this._data;
        }
        
        // Event afterRender auslösen
        if (!preventAfterRender) {
            this.raiseEvent('afterRender');
        }
    }

    // overwrite
    unRender() {
        kijs.Array.each(this._checkboxElements, function(el) {
            el.destruct();
        }, this);
        super.unRender();
    }


    // EVENTS
    _onAfterFirstRenderTo(e) {
        this.load();
    }
    
    _onCheckboxElementInput(e) {
        const val = this.value;

        this._value = val;
        this.raiseEvent('input', { oldValue: this._oldValue, value: val });
        this._oldValue = val;
    }
    
    

    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(preventDestructEvent) {
        // Event auslösen.
        if (!preventDestructEvent) {
            this.raiseEvent('destruct');
        }
        
        // Elemente/DOM-Objekte entladen
        kijs.Array.each(this._checkboxElements, function(el) {
            el.destruct();
        }, this);
        
        // Variablen (Objekte/Arrays) leeren
        this._checkboxElements = null;
        this._data = null;
        this._oldValue = null;
        
        // Basisklasse entladen
        super.destruct(true);
    }

};
/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.field.OptionGroup
// --------------------------------------------------------------
kijs.gui.field.OptionGroup = class kijs_gui_field_OptionGroup extends kijs.gui.field.CheckboxGroup {
    

    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);
    
        // Standard-config-Eigenschaften mergen
        config = Object.assign({}, {
            checkedIconChar: '&#xf05d',
            uncheckedIconChar: '&#xf10c'
            
        }, config);
                
        // Config anwenden
        if (kijs.isObject(config)) {
            this.applyConfig(config, true);
        }
    }
    
    
    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    // overwrite
    get value() {
        const val = super.value;
        if (kijs.isEmpty(val)) {
            return null;
        } else {
            return val[0];
        }
    }
    set value(val) {
        super.value = val;
    }


    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // LISTENERS
    // overwrite
    _onCheckboxElementInput(e) {
        // Bei singleSelect kann eine Checkbox nicht unchecked werden
        if (e.checked === 0) {
            e.element.checked = 1;
            return;
        }
        // sicherstellen, dass nur eine Checkbox ausgewählt ist
        kijs.Array.each(this._checkboxElements, function(el) {
            if (e.element !== el) {
                el.checked = 0;
            }
        }, this);
        
        const val = e.value;
        
        this._value = [val];
        this.raiseEvent('input', { 
            oldValue: (kijs.isEmpty(this._oldValue) ? null : this._oldValue[0]),
            value: (kijs.isEmpty(val) ? null : val)
        });
        this._oldValue = [val];
    }
};
/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.field.Combo
// --------------------------------------------------------------
// TODO: Icons in Combo
// TODO: autoComplete
// TODO: remoteCombo, localCombo
kijs.gui.field.Combo = class kijs_gui_field_Combo extends kijs.gui.field.Field {
    
    
    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);
        
        this._captionField = null;
        this._data = [];
        this._facadeFnLoad = null;
        this._optionCaptionDisplayType = null;
        this._rpc = null;           // Instanz von kijs.gui.Rpc
        this._valueField = null;
        this._value = null;
        
        this._inputDom = new kijs.gui.Dom({
            disableEnterEscBubbeling: true,
            nodeTagName: 'select',
            nodeAttribute: {
                id: this._inputId
            }
        });
        
        this._dom.clsAdd('kijs-field-combo');
       
       // Standard-config-Eigenschaften mergen
        config = Object.assign({}, {
            captionField: 'caption',
            optionCaptionDisplayType : 'code',
            size: 1,
            valueField: 'value'
        }, config);
        
       // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            autoLoad: { target: 'autoLoad' },   // Soll nach dem erten Rendern automatisch die Load-Funktion aufgerufen werden?
            captionField: true,
            data: { target: 'data' },
            facadeFnLoad: true,             // Name der Facade-Funktion. Bsp: 'address.load'
            multiselect: { target: 'multiselect' },
            optionCaptionDisplayType: true, // Darstellung der captions. Default: 'html'
                                            // html: als html-Inhalt (innerHtml)
                                            // code: Tags werden als als Text angezeigt
                                            // text: Tags werden entfernt
            rpc: { target: 'rpc' },         // Instanz von kijs.gui.Rpc
            size: { target: 'size' },
            valueField: true
        });
        
        // Event-Weiterleitungen von this._inputDom
        this._eventForwardsAdd('input', this._inputDom);
        this._eventForwardsAdd('blur', this._inputDom);
        
        this._eventForwardsRemove('enterPress', this._dom);
        this._eventForwardsRemove('enterEscPress', this._dom);
        this._eventForwardsRemove('escPress', this._dom);
        this._eventForwardsAdd('enterPress', this._inputDom);
        this._eventForwardsAdd('enterEscPress', this._inputDom);
        this._eventForwardsAdd('escPress', this._inputDom);
        
        // Listeners
        this.on('input', this._onInput, this);
        
        // Config anwenden
        if (kijs.isObject(config)) {
            this.applyConfig(config, true);
        }
    }

    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get autoLoad() {
        return this.hasListener('afterFirstRenderTo', this._onAfterFirstRenderTo, this);
    }
    set autoLoad(val) {
        if (val) {
            this.on('afterFirstRenderTo', this._onAfterFirstRenderTo, this);
        } else {
            this.off('afterFirstRenderTo', this._onAfterFirstRenderTo, this);
        }
    }
    
    get captionField() { return this._captionField; }
    set captionField(val) { this._captionField = val; }

    get valueField() { return this._valueField; }
    set valueField(val) { this._valueField = val; }

    get data() { return this._data; }
    set data(val) { 
        this._data = val;
        
        if (this._inputDom.isRendered) {
            
            // Bestehende Elemente löschen
            kijs.Dom.removeAllChildNodes(this._inputDom.node);
            
            // Neue Elemente einfügen
            kijs.Array.each(this._data, function(row) {
                const opt = document.createElement('option');
                kijs.Dom.setInnerHtml(opt, row[this._captionField], this._optionCaptionDisplayType);
                opt.value = row[this._valueField];
                this._inputDom.node.appendChild(opt);
            }, this);
            
            this.value = this._value; 
        }
    }
    
    
    // overwrite
    get disabled() { return super.disabled; }
    set disabled(val) {
        super.disabled = !!val;
        if (val || this._dom.clsHas('kijs-readonly')) {
            this._inputDom.nodeAttributeSet('disabled', true);  // (readOnly gibts leider nicht bei select-tags)
        } else {
            this._inputDom.nodeAttributeSet('disabled', false);
        }
    }
    
    get facadeFnLoad() { return this._facadeFnLoad; }
    set facadeFnLoad(val) { this._facadeFnLoad = val; }

    // overwrite
    get isEmpty() { return kijs.isEmpty(this._inputDom.value); }

    get inputDom() { return this._inputDom; }
    
    get multiselect() { return !!this._inputDom.nodeAttributeGet('multiple'); }
    set multiselect(val) { this._inputDom.nodeAttributeSet('multiple', !!val); }
    
    // overwrite
    get readOnly() { return super.readOnly; }
    set readOnly(val) {
        super.readOnly = !!val;
        if (val || this._dom.clsHas('kijs-disabled')) {
            this._inputDom.nodeAttributeSet('disabled', true);  // (readOnly gibts leider nicht bei select-tags)
        } else {
            this._inputDom.nodeAttributeSet('disabled', false);
        }
    }
    
    get rpc() { return this._rpc;}
    set rpc(val) {
        if (val instanceof kijs.gui.Rpc) {
            this._rpc = val;
            
        } else if (kijs.isString(val)) {
            if (this._rpc) {
                this._rpc.url = val;
            } else {
                this._rpc = new kijs.gui.Rpc({
                    url: val
                });
            }
            
        } else {
            throw new Error(`Unkown format on config "rpc"`);
            
        }
    }
    
    get size() { return this._inputDom.nodeAttributeGet('size'); }
    set size(val) { this._inputDom.nodeAttributeSet('size', val); }
    
    // overwrite
    get value() { 
        return this._inputDom.nodeAttributeGet('value');
    }
    set value(val) {
        this._value = val;
        this._inputDom.nodeAttributeSet('value', val);
    }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    /**
     * Füllt das Combo mit Daten vom Server
     * @param {Array} args Array mit Argumenten, die an die Facade übergeben werden
     * @returns {undefined}
     */
    load(args) {
        this._rpc.do(this._facadeFnLoad, args, function(response) {
            this.data = response.rows;
        }, this, true, this, 'dom', false);
    }

    // overwrite
    render(preventAfterRender) {
        super.render(true);
        
        // Input rendern (kijs.guiDom)
        this._inputDom.renderTo(this._inputWrapperDom.node);

        // Event afterRender auslösen
        if (!preventAfterRender) {
            this.raiseEvent('afterRender');
        }
        
        if (this._data) {
            this.data = this._data;
        }
        
        if (!kijs.isEmpty(this._value)) {
            this.value = this._value;
        }
    }


    // overwrite
    unRender() {
        this._inputDom.unRender();
        super.unRender();
    }


    // EVENTS
    _onAfterFirstRenderTo(e) {
        this.load();
    }

    _onInput(e) {
        this._value = this.value;
        this.validate();
    }


    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(preventDestructEvent) {
        // Event auslösen.
        if (!preventDestructEvent) {
            this.raiseEvent('destruct');
        }
        
        // Elemente/DOM-Objekte entladen
        if (this._inputDom) {
            this._inputDom.destruct();
        }
            
        // Variablen (Objekte/Arrays) leeren
        this._data = null;
        this._inputDom = null;
        this._rpc = null;
        
        // Basisklasse entladen
        super.destruct(true);
    }

};
/* global kijs */

// --------------------------------------------------------------
// kit.App
// --------------------------------------------------------------
kit = {};
kit.App = class kit_App {

    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {

        // RPC-Instanz
        var rpcConfig = {};
        if (config.ajaxUrl) {
            rpcConfig.url = config.ajaxUrl;
        }
        this._rpc = new kijs.gui.Rpc(rpcConfig);
    }


    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    run() {
        let _this = this;
        
        // ViewPort erstellen
        let viewport = new kijs.gui.ViewPort({
            cls: 'kijs-flexcolumn',
            elements: [                
                // TOP
                {
                    xtype: 'kijs.gui.Panel',
                    caption: 'kijs the new aera of multidevice apps',
                    iconCls: 'icoWizard16',
                    collapsible: 'top',
                    collapsed: true,
                    height: 300,
                    style: {
                        margin: '0 0 4px 0'
                    },
                    headerBarElements:[
                        {
                            xtype: 'kijs.gui.Button',
                            iconChar: '&#xf059'
                        },{
                            xtype: 'kijs.gui.Button',
                            iconChar: '&#xf059',
                            disabled: true
                        }
                    ],
                    elements:[
                        /*{
                            xtype: 'kijs.gui.DatePicker',
                            value: '2017-07-13'
                        }*/
                    ]
                },{
                    xtype: 'kijs.gui.Container',
                    cls: 'kijs-flexrow',
                    style: {
                        flex: 1,
                        minHeight: '40px'
                    },
                    elements: [
                        // LEFT
                        {
                            xtype: 'kijs.gui.Panel',
                            caption: 'Navigation',
                            iconChar: '&#xf110',
                            iconCls: 'kijs-pulse',
                            collapsible: 'left',
                            width: 180,
                            cls: 'kijs-flexcolumn',
                            elements:[
                                /*{
                                    xtype: 'kijs.gui.Accordion',
                                    currentElement: 0,
                                    style: {
                                        flex: '1 1 auto'
                                    },
                                    elements:[
                                        {
                                            xtype: 'kijs.gui.Panel',
                                            caption: 'Accordion 1',
                                            styleInner: {
                                                overflowY: 'auto'
                                            },
                                            elements:[
                                                {
                                                    xtype: 'kijs.gui.BoxElement',
                                                    height: 400,
                                                    style: { backgroundColor: '#ccf'}
                                                }
                                            ]
                                        },{
                                            xtype: 'kijs.gui.Panel',
                                            caption: 'Accordion 2',
                                            styleInner: {
                                                overflowY: 'auto'
                                            },
                                            elements:[
                                                {
                                                    xtype: 'kijs.gui.BoxElement',
                                                    height: 400,
                                                    style: { backgroundColor: '#cfc'}
                                                }
                                            ]
                                        },{
                                            xtype: 'kijs.gui.Panel',
                                            caption: 'Accordion 3',
                                            styleInner: {
                                                overflowY: 'auto'
                                            },
                                            elements:[
                                                {
                                                    xtype: 'kijs.gui.BoxElement',
                                                    height: 400,
                                                    style: { backgroundColor: '#fcc'}
                                                }
                                            ]
                                        }
                                    ]
                                }*/
                            ]
                        },{
                            xtype: 'kijs.gui.Splitter',
                            targetPos: 'left'
                        },
                        // CENTER
                        {
                            xtype: 'kijs.gui.Panel',
                            caption: 'Formular',
                            iconChar: '&#xf2bc',
                            footerCaption: 'FooterBar',
                            style: {
                                flex: 1,
                                minWidth: '40px'
                            },
                            innerStyle: {
                                padding: '10px',
                                overflowY: 'auto'
                            },
                            headerBarElements:[
                                {
                                    xtype: 'kijs.gui.Button',
                                    iconChar: '&#xf085'
                                }
                            ],
                            headerElements: [
                                {
                                    xtype: 'kijs.gui.ButtonGroup',
                                    caption: 'Funktionen',
                                    width: 240,
                                    height: 150,
                                    innerStyle: {
                                        columnCount: 3
                                    },
                                    elements: [
                                        {
                                            xtype: 'kijs.gui.Button',
                                            caption: 'Neu',
                                            iconChar: '&#xf0c7',
                                            height: 120
                                        },{
                                            xtype: 'kijs.gui.Button',
                                            caption: 'Duplizieren',
                                            iconChar: '&#xf0c7'
                                        },{
                                            xtype: 'kijs.gui.Button',
                                            caption: 'Aktionen',
                                            iconChar: '&#xf02f'
                                        },{
                                            xtype: 'kijs.gui.Button',
                                            caption: 'Löschen',
                                            iconChar: '&#xf0c7'
                                        },{
                                            xtype: 'kijs.gui.Button',
                                            caption: 'Address Load',
                                            on: {
                                                click: function() {
                                                    //let addressPanel = this.parent.parent.parent.getElementByName('addressPanel');
                                                    //addressPanel.load(1);
                                                }
                                            }
                                        }
                                    ]
                                }
                            ],
                            elements: [
                                {
                                    xtype: 'kijs.gui.FormPanel',
                                    name: 'addressPanel',
                                    caption: 'Adresse',
                                    closable: true,
                                    collapsible: 'top',
                                    resizable: true,
                                    height: 300,
                                    shadow: true,
                                    autoLoad: false,
                                    rpc: this._rpc,
                                    waitMaskTargetDomProperty: 'innerDom',
                                    facadeFnLoad: 'address.load',
                                    facadeFnSave: 'address.save',
                                    innerStyle: {
                                        padding: '10px',
                                        overflowY: 'auto'
                                    },
                                    defaults: {
                                        labelWidth: 120,
                                        required: true,
                                        maxLength: 50,
                                        style: {marginBottom: '4px'}
                                    },
                                    elements: [
                                        /*{
                                            xtype: 'kijs.gui.field.Date',
                                            name: 'Datum',
                                            label: 'Datum',
                                            value: '2017-07-28',
                                            weekSelect: false,
                                            width: 230
                                        },*/{
                                            xtype: 'kijs.gui.field.Password',
                                            name: 'Passwort',
                                            label: 'Passwort',
                                            disableBrowserSecurityWarning: false,
                                            width: 200,
                                            on: {
                                                input: function(e) {
                                                    this.parent.down('Feld 1').value = this.value;
                                                }
                                            }
                                        },{
                                            xtype: 'kijs.gui.field.Checkbox',
                                            name: 'Checkbox',
                                            label: 'Checkbox',
                                            caption: 'Caption',
                                            threeState: true,
                                            //value: false,
                                            width: 250,
                                            on: {
                                                input: function(e) {
                                                    console.log('input:' + this.value);
                                                }
                                            },
                                            elements: [
                                                {
                                                    xtype: 'kijs.gui.Button',
                                                    iconChar: '&#xf0d0',
                                                    toolTip: 'test',
                                                    on: {
                                                        click: function() {
                                                            this.upX('kijs.gui.field.Checkbox').checked = 2;
                                                        }
                                                    }
                                                }
                                            ]
                                        },{
                                            xtype: 'kijs.gui.field.Checkbox',
                                            name: 'CheckboxIcon',
                                            label: '... mit Icon',
                                            iconCls: 'icoWizard16',
                                            caption: 'Caption',
                                            checked: 1,
                                            width: 250
                                        },{
                                            xtype: 'kijs.gui.field.Checkbox',
                                            name: 'CheckboxColor',
                                            label: '... mit Farbe',
                                            iconChar: '&#xf111',
                                            iconColor: '#ff8800',
                                            caption: 'Caption',
                                            width: 250
                                        },{
                                            xtype: 'kijs.gui.field.Checkbox',
                                            name: 'CheckboxOption',
                                            label: '... als Option',
                                            caption: 'Caption',
                                            checkedIconChar: '&#xf05d',
                                            uncheckedIconChar: '&#xf10c',
                                            determinatedIconChar: '&#xf111',
                                            valueChecked: 'Ein',
                                            valueDeterminated: 'wedernoch',
                                            valueUnchecked: 'Aus',
                                            value: 'Ein',
                                            width: 250,
                                            on: {
                                                input: function(e) {
                                                    console.log('input:' + this.value);
                                                }
                                            },
                                            elements: [
                                                {
                                                    xtype: 'kijs.gui.Button',
                                                    iconChar: '&#xf0d0',
                                                    toolTip: 'test',
                                                    on: {
                                                        click: function() {
                                                            let chkBox = this.upX('kijs.gui.field.Checkbox');
                                                            console.log(chkBox.value);
                                                            chkBox.checked = 2;
                                                            console.log(chkBox.value);
                                                        }
                                                    }
                                                }
                                            ]
                                        },{
                                            xtype: 'kijs.gui.field.CheckboxGroup',
                                            name: 'CheckboxGroup',
                                            label: 'CheckboxGroup',
                                            valueField: 'id',
                                            captionField: 'Bezeichnung',
                                            iconCharField: 'Icon',
                                            iconColorField: 'Color',
                                            helpText: 'Hilfe Text!',
                                            data: [
                                                {id:1, Bezeichnung:'blau', Icon:'&#xf111', Color:'#0088ff' }, 
                                                {id:2, Bezeichnung:'grün', Icon:'&#xf111', Color:'#88ff00' }, 
                                                {id:3, Bezeichnung:'pink', Icon:'&#xf111', Color:'#ff0088' }, 
                                            ],
                                            value: [2,3],
                                            on: {
                                                input: function(e) {
                                                    console.log(e);
                                                }
                                            },
                                            elements: [
                                                {
                                                    xtype: 'kijs.gui.Button',
                                                    iconChar: '&#xf0d0',
                                                    toolTip: 'test',
                                                    on: {
                                                        click: function() {
                                                            let val = this.parent.value;
                                                            if (kijs.isEmpty(val)) {
                                                                val = 0;
                                                            } else {
                                                                val = val[0];
                                                            }
                                                            val++;
                                                            if (val > 3) {
                                                                val = null;
                                                            }
                                                            if (!kijs.isEmpty(val)) {
                                                                val = [val];
                                                            }
                                                            this.parent.value = val;
                                                        }
                                                    }
                                                }
                                            ]
                                        },{
                                            xtype: 'kijs.gui.field.CheckboxGroup',
                                            name: 'CheckboxGroupInline',
                                            label: 'CheckboxGroup Inline',
                                            cls: 'kijs-inline',
                                            valueField: 'color',
                                            captionField: 'Bez',
                                            iconCharField: 'iconChar',
                                            iconColorField: 'color',
                                            rpc: this._rpc,
                                            facadeFnLoad: 'color.load',
                                            autoLoad: true,
                                            value: ['#0f0', '#ff0'],
                                            on: {
                                                input: function(e) {
                                                    console.log(e);
                                                }
                                            }
                                        },{
                                            xtype: 'kijs.gui.field.OptionGroup',
                                            name: 'OptionGroupInline',
                                            label: 'OptionGroup Inline',
                                            cls: 'kijs-inline',
                                            valueField: 'id',
                                            captionField: 'Bezeichnung',
                                            iconCharField: 'Icon',
                                            iconColorField: 'Color',
                                            data: [
                                                {id:1, Bezeichnung:'blau', Icon:'&#xf111', Color:'#0088ff' }, 
                                                {id:2, Bezeichnung:'grün', Icon:'&#xf111', Color:'#88ff00' }, 
                                                {id:3, Bezeichnung:'pink', Icon:'&#xf111', Color:'#ff0088' }, 
                                            ],
                                            value: 2,
                                            on: {
                                                input: function(e) {
                                                    console.log('oldValue:' + e.oldValue + ' value:' + e.value);
                                                }
                                            }
                                        },/*{
                                            xtype: 'kijs.gui.field.RadioGroup',
                                            name: 'RadioGroup',
                                            label: 'RadioGroup',
                                            idField: 'id',
                                            captionField: 'caption',
                                            data: [
                                                {id:1, caption:'Wert A'},
                                                {id:2, caption:'Wert B'},
                                                {id:3, caption:'Wert C'}
                                            ],
                                            value: 2,
                                            on: {
                                                input: function(e, el) {
                                                    console.log('input:' + this.getValue());
                                                }
                                            },
                                            elements: [
                                                {
                                                    xtype: 'kijs.gui.Button',
                                                    iconChar: '&#xf0d0',
                                                    toolTip: 'test',
                                                    on: {
                                                        click: function() {
                                                            let val = this.parent.value;
                                                            val++;
                                                            if (val > 3) {
                                                                val = null;
                                                            }
                                                            this.parent.value = val;
                                                            this.toolTip = this.parent.value;
                                                        }
                                                    }
                                                }
                                            ]
                                        },{
                                            xtype: 'kijs.gui.field.RadioGroup',
                                            name: 'RadioGroupInline',
                                            label: 'RadioGroup Inline',
                                            cls: 'kijs-inline',
                                            data: ['1', '2', '3'],
                                            value: 2,
                                            on: {
                                                input: function(e, el) {
                                                    console.log('input:' + this.getValue());
                                                }
                                            },
                                            elements: [
                                                {
                                                    xtype: 'kijs.gui.Button',
                                                    iconChar: '&#xf0d0',
                                                    toolTip: 'test',
                                                    on: {
                                                        click: function() {
                                                            let val = this.parent.value;
                                                            val++;
                                                            if (val > 3) {
                                                                val = null;
                                                            }
                                                            this.parent.value = val;
                                                            this.toolTip = this.parent.value;
                                                        }
                                                    }
                                                }
                                            ]
                                        },*/{
                                            xtype: 'kijs.gui.field.Text',
                                            name: 'Feld 1',
                                            label: 'Feld <b>1</b>',
                                            labelHtmlDisplayType : 'html',
                                            value: 'Hallo Welt 1',
                                            helpText: 'Hilfe Text!',
                                            elements: [
                                                {
                                                    xtype: 'kijs.gui.Button',
                                                    iconChar: '&#xf0d0',
                                                    toolTip: 'Feld leeren',
                                                    on: {
                                                        click: function() {
                                                            this.parent.value = '';
                                                        }
                                                    }
                                                }
                                            ]
                                        },{
                                            xtype: 'kijs.gui.field.Text',
                                            name: 'Feld 2',
                                            label: 'Feld <b>2</b>',
                                            labelHtmlDisplayType : 'code',
                                            value: 'Hallo Welt 2',
                                            elements:[
                                                {
                                                    xtype: 'kijs.gui.Button',
                                                    iconChar: '&#xf0d0',
                                                    caption: 'neuer Wert',
                                                    on: {
                                                        click: function() {
                                                            this.parent.value = 'neuer Wert';
                                                        }
                                                    }
                                                }
                                            ]
                                        }, new kijs.gui.field.Text({
                                            name: 'Feld 3',
                                            label: 'Feld <b>3</b>',
                                            labelWidth: 120,
                                            labelHtmlDisplayType : 'text'
                                        }),{
                                            xtype: 'kijs.gui.field.Combo',
                                            name: 'Anrede',
                                            label: 'Anrede',
                                            optionCaptionDisplayType: 'html',
                                            value: 'w',
                                            data: [
                                                {caption: 'Herr', value: 'm'},
                                                {caption: 'Frau', value: 'w'},
                                                {caption: 'Familie', value: 'f'}
                                            ],
                                            elements: [
                                                {
                                                    xtype: 'kijs.gui.Button',
                                                    iconChar: '&#xf00d',
                                                    on: {
                                                        click: function() {
                                                            this.parent.value = '';
                                                        }
                                                    }
                                                }
                                            ]
                                        },{
                                            xtype: 'kijs.gui.field.Combo',
                                            name: 'Land',
                                            label: 'Land',
                                            rpc: this._rpc,
                                            facadeFnLoad: 'land.load',
                                            autoLoad: true,
                                            value: 'CH'
                                        }/*,{
                                            xtype: 'kijs.gui.field.Editor',
                                            name: 'editor',
                                            label: 'Editor',
                                            mode: 'javascript',
                                            value: 'function test(x) {\n    console.log(x);\n}\n\ntest("Hallo Welt!");\nFehler',
                                            height: 100
                                        }*/,{
                                            xtype: 'kijs.gui.field.Memo',
                                            name: 'Bemerkungen',
                                            label: 'Bemerkungen (test)',
                                            value: 'Dieses Bemerkungsfeld hat\nmehrere Zeilen!',
                                            helpText: 'Bitte geben Sie hier Ihre Bemerkungen ein!'
                                        }
                                    ],
                                    footerStyle: {
                                        padding: '10px'
                                    },
                                    footerElements: [
                                        {
                                            xtype: 'kijs.gui.Button',
                                            caption: 'Menü',
                                            iconChar: '&#xf0d7',
                                            on: {
                                                click: function() {
                                                    /*if (!this.menu) {
                                                        this.menu = new kijs.gui.menu.Menu({
                                                            targetEl: this,
                                                            width: 100,
                                                            defaults: {
                                                                xtype: 'kijs.gui.Button',
                                                                style: {
                                                                    width: '100%'
                                                                }
                                                            },
                                                            elements: [
                                                                { caption: 'Punkt 1 ' },
                                                                { caption: 'Punkt 2' },
                                                                { 
                                                                    caption: 'Sub Menü', 
                                                                    iconChar: '&#xf105',
                                                                    on: {
                                                                        click: function() {
                                                                            if (!this.subMenu) {
                                                                                this.subMenu = new kijs.gui.menu.Menu({
                                                                                    parentMenu: this.parent,
                                                                                    targetEl: this,
                                                                                    targetPos: 'tr',
                                                                                    width: 100,
                                                                                    defaults: {
                                                                                        xtype: 'kijs.gui.Button',
                                                                                        style: {
                                                                                            width: '100%'
                                                                                        }
                                                                                    },
                                                                                    elements: [
                                                                                        { caption: 'Punkt 1' },
                                                                                        { caption: 'Punkt 2' },
                                                                                        { caption: 'Punkt 3' }
                                                                                    ]
                                                                                });
                                                                            }
                                                                            this.subMenu.show();
                                                                        }
                                                                    }
                                                                },
                                                                { caption: 'Punkt 3' }
                                                            ]
                                                        });
                                                    }
                                                    this.menu.show();*/
                                                }
                                            }
                                        },{
                                            xtype: 'kijs.gui.Button',
                                            caption: 'Menü',
                                            iconChar: '&#xf0d8',
                                            on: {
                                                click: function() {
                                                    /*if (!this.menu) {
                                                        this.menu = new kijs.gui.menu.Menu({
                                                            targetEl: this,
                                                            targetPos: 'tl',
                                                            pos: 'bl',
                                                            innerStyle: {
                                                                padding: '10px'
                                                            },
                                                            html: 'Ich bin ein Menü mit etwas HTML-Inhalt<br>Bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla.'
                                                        });
                                                    }
                                                    this.menu.show();*/
                                                }
                                            }
                                        },{
                                            xtype: 'kijs.gui.Button',
                                            name: 'btnLoad',
                                            caption: 'RPC Load',
                                            on: {
                                                click: function() {
                                                    this.upX('kijs.gui.FormPanel').load();
                                                }
                                            }
                                        },{
                                            xtype: 'kijs.gui.Button',
                                            caption: 'Validieren',
                                            toolTip: 'Da darfst Du nicht draufdrücken!',
                                            on: {click: function() {
                                                this.toolTip = 'Nein, er hat es tatsächlich getan!';
                                                kijs.Array.each(this.parent.parent.elements, function(element) {
                                                    if (element instanceof kijs.gui.field.Field) {
                                                        element.validate();
                                                    }
                                                }, this);
                                            }}
                                        },{
                                            xtype: 'kijs.gui.Button',
                                            name: 'btnReadOnly',
                                            caption: 'ReadOnly',
                                            on: {click: function() {
                                                kijs.Array.each(this.parent.parent.elements, function(element) {
                                                    if (element instanceof kijs.gui.field.Field) {
                                                        element.readOnly = true;
                                                    }
                                                }, this);
                                                this.disabled = true;
                                                this.parent.down('btnEnable').disabled = false;
                                            }}
                                        },{
                                            xtype: 'kijs.gui.Button',
                                            name: 'btnDisable',
                                            caption: 'Deaktivieren',
                                            on: {click: function() {
                                                kijs.Array.each(this.parent.parent.elements, function(element) {
                                                    if (element instanceof kijs.gui.field.Field) {
                                                        element.disabled = true;
                                                    }
                                                }, this);
                                                this.disabled = true;
                                                this.parent.down('btnEnable').disabled = false;
                                            }}
                                        },{
                                            xtype: 'kijs.gui.Button',
                                            name: 'btnEnable',
                                            caption: 'Aktivieren',
                                            disabled: true,
                                            on: {click: function() {
                                                kijs.Array.each(this.parent.parent.elements, function(element) {
                                                    if (element instanceof kijs.gui.field.Field) {
                                                        element.readOnly = false;
                                                        element.disabled = false;
                                                    }
                                                }, this);
                                                this.disabled = true;
                                                this.parent.down('btnReadOnly').disabled = false;
                                                this.parent.down('btnDisable').disabled = false;
                                            }}
                                        },{
                                            xtype: 'kijs.gui.Button',
                                            name: 'btnRpc',
                                            caption: 'RPC',
                                            on: {
                                                click: function() {
                                                    _this._rpc.do('test.test', 'data', function(response){
                                                        // nix
                                                    }, _this, true, this.parent.parent, 'innerDom');
                                                }
                                            }
                                        }
                                    ]

                                },{
                                    xtype: 'kijs.gui.FormPanel',
                                    rpc: this._rpc,
                                    facadeFnLoad: 'test.load',
                                    facadeFnSave: 'test.save',
                                    shadow: true,
                                    style: {
                                        marginTop: '10px'
                                    },
                                    innerStyle: {
                                        padding: '10px',
                                        overflowY: 'auto'
                                    },
                                    defaults: {
                                        labelWidth: 100,
                                        required: true,
                                        maxLength: 50,
                                        style: {marginBottom: '4px'}
                                    },
                                    on: {
                                        afterSave: function(e) {
                                            kijs.gui.CornerTipContainer.show('Info', 'Speichern erfolgreich.' , 'info');
                                        },
                                        enterPress: function(e) { console.log("Panel: enterPress"); }
                                    },
                                    elements: [
                                        {
                                            xtype: 'kijs.gui.field.Memo',
                                            name: 'Bemerkungen',
                                            label: 'Bemerkungen (test)',
                                            value: 'Dieses Bemerkungsfeld hat\nmehrere Zeilen!',
                                            helpText: 'Bitte geben Sie hier Ihre Bemerkungen ein!',
                                            height: 100,
                                            on: {
                                                enterPress: function(e) {
                                                    console.log('Memo: enterPress');
                                                }
                                            }
                                        }
                                    ],
                                    footerStyle: {
                                        padding: '10px'
                                    },
                                    footerElements: [
                                        {
                                            xtype: 'kijs.gui.Button',
                                            name: 'btnLoad',
                                            caption: 'Load',
                                            on: {
                                                click: function() {
                                                    this.parent.parent.load(1);
                                                }
                                            }
                                        },{
                                            xtype: 'kijs.gui.Button',
                                            name: 'btnSave',
                                            caption: 'Save',
                                            on: {
                                                click: function() {
                                                    this.parent.parent.save(1);
                                                }
                                            }
                                        }
                                    ]
                                },{
                                    xtype: 'kijs.gui.Panel',
                                    caption: 'Panel 2',
                                    closable: true,
                                    collapsible: 'top',
                                    resizable: true,
                                    maximizable: true,
                                    height: 200,
                                    shadow: true,
                                    cls: 'kijs-flexrow',
                                    style: {
                                        marginTop: '10px'
                                    },
                                    /*innerStyle: {
                                        padding: '10px',
                                        overflowY: 'auto'
                                    },*/
                                    elements: [
                                        {
                                            xtype: 'kijs.gui.DataView',
                                            selectType: 'multi',
                                            rpc: this._rpc,
                                            //data: [{A:'A1', B:'B1'}, {A:'A2', B:'B2'}],
                                            autoLoad: true,
                                            facadeFnLoad: 'dataview.load',
                                            waitMaskTargetDomProperty: 'innerDom',
                                            style: {
                                                flex: 1
                                            },
                                            innerStyle: {
                                                padding: '10px',
                                                overflowY: 'auto'
                                            }
                                        }
                                    ],
                                    footerStyle: {
                                        padding: '10px'
                                    },
                                    footerElements: [
                                        {
                                            xtype: 'kijs.gui.Button',
                                            caption: 'Alert',
                                            on: {click: function() {
                                                kijs.gui.MsgBox.alert('Test', 'Alert! Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans...', function(e, el) {
                                                    kijs.gui.MsgBox.alert('Es wurde geklickt auf', e.btn);
                                                });
                                            }}
                                        },{
                                            xtype: 'kijs.gui.Button',
                                            caption: 'Info',
                                            on: {click: function() {
                                                kijs.gui.MsgBox.info('Test', 'Info!', function(e) {
                                                    kijs.gui.MsgBox.alert('Es wurde geklickt auf', e.btn);
                                                });
                                            }}
                                        },{
                                            xtype: 'kijs.gui.Button',
                                            caption: 'Warning',
                                            on: {click: function() {
                                                kijs.gui.MsgBox.warning('Test', 'Warning!', function(e) {
                                                    kijs.gui.MsgBox.alert('Es wurde geklickt auf', e.btn);
                                                });
                                            }}
                                        },{
                                            xtype: 'kijs.gui.Button',
                                            caption: 'Error',
                                            on: {click: function() {
                                                kijs.gui.MsgBox.error('Test', 'Error!', function(e) {
                                                    kijs.gui.MsgBox.alert('Es wurde geklickt auf', e.btn);
                                                });
                                            }}
                                        },{
                                            xtype: 'kijs.gui.Button',
                                            caption: 'Confirm',
                                            on: {click: function() {
                                                kijs.gui.MsgBox.confirm('Test', 'Confirm!', function(e) {
                                                    kijs.gui.MsgBox.alert('Es wurde geklickt auf ', e.btn);
                                                });
                                            }}
                                        },{
                                            xtype: 'kijs.gui.Button',
                                            caption: 'CornerTip',
                                            on: {
                                                click: function() {
                                                    if (!this.___cornerTipIcon || this.___cornerTipIcon === 'error') {
                                                        this.___cornerTipIcon = 'alert';
                                                    } else if (this.___cornerTipIcon === 'alert') {
                                                        this.___cornerTipIcon = 'info';
                                                    } else if (this.___cornerTipIcon === 'info') {
                                                        this.___cornerTipIcon = 'warning';
                                                    } else if (this.___cornerTipIcon === 'warning') {
                                                        this.___cornerTipIcon = 'error';
                                                    }
                                                    
                                                    kijs.gui.CornerTipContainer.show('Test', 'Meine Nachricht!', this.___cornerTipIcon);
                                                },
                                                context: this
                                            }
                                        }
                                    ]
                                }
                            ],
                            footerStyle: {
                                padding: '10px'
                            },
                            footerElements: [
                                {
                                    xtype: 'kijs.gui.Button',
                                    caption: 'Fenster',
                                    iconChar: '&#xf2d0',
                                    on: {click: function() {
                                        let window = new kijs.gui.Window({
                                            caption: 'Fenster',
                                            iconChar: '&#xf2d0',
                                            collapsible: 'top',
                                            modal: false,
                                            height: 200,
                                            width: 250,
                                            innerStyle: {
                                                padding: '10px'
                                            },
                                            elements:[
                                                /*{
                                                    xtype: 'kijs.gui.field.Memo',
                                                    value: 'Bemerkungsfeld',
                                                    height: 100
                                                }*/
                                            ],
                                            footerStyle: {
                                                padding: '10px'
                                            },
                                            footerElements:[
                                                {
                                                    xtype: 'kijs.gui.Button',
                                                    caption: 'OK',
                                                    isDefault: true,
                                                    on: {click: function() {
                                                        kijs.gui.MsgBox.warning('Warnung', 'Wirklich schliessen?', function(e) {
                                                            if (e.btn === 'ok') {
                                                                window.destruct();
                                                            }
                                                        });
                                                    }}
                                                }
                                            ]
                                        });
                                        window.show();
                                    }}
                                },{
                                    xtype: 'kijs.gui.Button',
                                    caption: 'Fenster modal',
                                    iconChar: '&#xf2d0',
                                    on: {click: function() {
                                        let window = new kijs.gui.Window({
                                            caption: 'Fenster',
                                            iconChar: '&#xf2d0',
                                            collapsible: 'top',
                                            modal: true,
                                            height: 160,
                                            width: 210,
                                            innerStyle: {
                                                padding: '10px'
                                            },
                                            elements: [
                                                {
                                                    xtype: 'kijs.gui.Button',
                                                    caption: 'weiteres Fenster',
                                                    iconChar: '&#xf2d0'
                                                }
                                            ]
                                        });
                                        window.show();
                                        window.elements[0].on('click', function() {
                                            let window2 = new kijs.gui.Window({
                                                caption: 'Fenster',
                                                iconChar: '&#xf2d0',
                                                collapsible: 'top',
                                                //modal: true,
                                                target: window.dom.node.parentNode,
                                                height: 160,
                                                width: 210
                                            });
                                            window2.show();
                                        }, this);
                                    }}
                                },{
                                    xtype: 'kijs.gui.Button',
                                    caption: 'Fenster modal mit target+maximiert',
                                    iconChar: '&#xf2d0',
                                    on: {click: function() {
                                        let window = new kijs.gui.Window({
                                            target: this.parent.parent.down('addressPanel'),
                                            targetDomProperty: 'innerDom',
                                            caption: 'Fenster',
                                            iconChar: '&#xf2d0',
                                            collapsible: 'top',
                                            maximized: true,
                                            modal: true,
                                            height: 170,
                                            width: 220
                                        });
                                        window.show();
                                    }}
                                },{
                                    xtype: 'kijs.gui.Button',
                                    caption: 'Lademaske',
                                    iconChar: '&#xf1ce',
                                    on: {click: function() {
                                        let addressPanel = this.parent.parent.down('addressPanel');
                                        addressPanel.displayWaitMask = !addressPanel.displayWaitMask;
                                    }}
                                },{
                                    xtype: 'kijs.gui.Button',
                                    caption: 'Neu laden',
                                    iconChar: '&#xf021',
                                    on: {click: function() {
                                        location.reload();
                                    }}
                                },{
                                    xtype: 'kijs.gui.Button',
                                    caption: 'Schliessen',
                                    iconChar: '&#xf00d',
                                    on: {click: function() {
                                        viewport.destruct();
                                    }}
                                }
                            ],
                            footerBarElements:[
                                {
                                    xtype: 'kijs.gui.Button',
                                    iconChar: '&#xf085'
                                }
                            ]

                        },
                        // RIGHT
                        {
                            xtype: 'kijs.gui.Splitter',
                            targetPos: 'right'
                        },{
                            xtype: 'kijs.gui.Panel',
                            caption: 'Vorschau',
                            iconChar: '&#xf2c8',
                            collapsible: 'right',
                            width: 240,
                            cls: 'kijs-flexrow',
                            headerBarElements:[
                                {
                                    xtype: 'kijs.gui.Button',
                                    iconChar: '&#xf02f',
                                    on: {
                                        click: function(e, el) {
                                            let editor = el.parent.parent.up('editor');
                                            console.log(editor.getValue());
                                        }
                                    }
                                }
                            ],
                            elements:[
                                /*{
                                    xtype: 'kijs.gui.field.Editor',
                                    name: 'editor',
                                    hideLabel: true,
                                    mode: 'javascript',
                                    value: 'function test(x) {\n    console.log(x);\n}\n\ntest("Hallo Welt!");',
                                    style: {
                                        flex: '1 1 auto'
                                    }
                                }*/
                            ]
                        }
                    ]
                },
                // BOTTOM
                {
                    xtype: 'kijs.gui.Splitter',
                    targetPos: 'bottom'
                },{
                    xtype: 'kijs.gui.Panel',
                    caption: 'Panel Süd',
                    collapsible: 'bottom',
                    collapsed: true,
                    height: 200,
                    elements: [
                        {
                            xtype: 'kijs.gui.Element',
                            style: {
                                margin: '4px 0 0 4px'
                            }
                        },{
                            xtype: 'kijs.gui.Button',
                            caption: 'set html',
                            on: {
                                click: function(e) {
                                    this.__testState = this.__testState || 0;
                                    let el = this.parent.elements[0];
                                    let html = 'Text mit <span style="color:#f00">Formatierung</span>';
                                    switch (this.__testState) {
                                        case 0: 
                                            el.htmlDisplayType = 'html';
                                            el.html = html;
                                            this.caption = 'code'; 
                                            break;
                                        case 1:
                                            el.htmlDisplayType = 'code';
                                            el.html = html;
                                            this.caption = 'text'; 
                                            break;
                                        case 2:
                                            el.htmlDisplayType = 'text';
                                            el.html = html;
                                            this.caption = 'html'; 
                                            break;
                                    }
                                    this.__testState++;
                                    if (this.__testState > 2) {
                                        this.__testState = 0;
                                    }
                                }
                            }
                        }
                    ]
                }
            ]
        });
        viewport.render();
    }
    
    
    rpc(facadeFn, data, fn, context, cancelRunningRpcs, waitMaskTarget, waitMaskTargetDomPropertyName='dom', ignoreWarnings, fnBeforeDisplayError) {
        this._rpc.do(facadeFn, data, fn, context, cancelRunningRpcs, waitMaskTarget, waitMaskTargetDomPropertyName, ignoreWarnings, fnBeforeDisplayError);
    }
    
    /*_rpc(facadeFn, data, fn, context, cancelRunningRpcs, waitMaskTarget, ignoreWarnings) {
        
        // Lademaske anzeigen
        let waitMask;
        if (waitMaskTarget instanceof kijs.gui.Element) {
            waitMask = waitMaskTarget.waitMaskAdd();
        } else {
            waitMask = new kijs.gui.Mask({
                displayWaitIcon: true,
                target: waitMaskTarget
            });
            waitMask.show();
        }
    
        this._rpc.do(facadeFn, data, function(response, request) {
            
            // Lademaske entfernen
            if (request.responseArgs && request.responseArgs.waitMask) {
                if (request.responseArgs.waitMask.target instanceof kijs.gui.Element) {
                    request.responseArgs.waitMask.target.waitMaskRemove();
                } else {
                    request.responseArgs.waitMask.destruct();
                }
            }
            
            if (!response.canceled) {
                // Fehler --> FehlerMsg + Abbruch
                // data.errorMsg (String oder Array mit Strings, die mit Aufzählungszeichen angezeigt werden)
                if (!kijs.isEmpty(response.errorMsg)) {
                    kijs.gui.MsgBox.error('Fehler', response.errorMsg);
                    return;
                }

                // Warning --> WarnungMsg mit OK, Cancel. Bei Ok wird der gleiche request nochmal gesendet mit dem Flag ignoreWarnings
                // data.warningMsg (String oder Array mit Strings, die mit Aufzählungszeichen angezeigt werden)
                if (!kijs.isEmpty(response.warningMsg)) {
                    kijs.gui.MsgBox.warning('Warnung', response.warningMsg, function(e) {
                        if (e.btn === 'ok') {
                            // Request nochmal senden mit Flag ignoreWarnings
                            this.rpc(facadeFn, data, fn, this, cancelRunningRpcs, waitMaskTarget, true);
                        }
                    }, this);
                    return;
                }

                // Info --> Msg ohne Icon kein Abbruch
                // data.infoMsg (String oder Array mit Strings, die mit Aufzählungszeichen angezeigt werden)
                if (!kijs.isEmpty(response.infoMsg)) {
                    kijs.gui.MsgBox.info('Info', response.infoMsg);

                }
                // Tip -> Msg, die automatisch wieder verschwindet kein Abbruch
                // data.tipMsg (String oder Array mit Strings, die mit Aufzählungszeichen angezeigt werden)
                if (!kijs.isEmpty(response.cornerTipMsg)) {
                    kijs.gui.CornerTipContainer.show('Info', response.cornerTipMsg, 'info');
                }

                // callback-fn ausführen
                if (fn && kijs.isFunction(fn)) {
                    fn.call(context || this, response || null);
                }
            }

        }, this, cancelRunningRpcs, {ignoreWarnings: !!ignoreWarnings}, {waitMask: waitMask});
    }*/
    
    
    
    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct() {
        // RPC entladen
        this._rpc.destruct();
        
        // Variablen
        this._rpc = null;
    }
    
};
