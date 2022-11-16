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
    * @param {Object} config
    *  config Eigenschaften:
    *     {String} url
    *     {Object} [parameters]        Objekt mit gewünschten Parametern
    *     {object|string} [postData]   Daten die gesendet werden (nur bei POST)
    *     {String} [method='GET']      'GET' oder 'POST'
    *     {Number} [timeout=0]         Timeout des Requests in Millisekunden
    *     {String} [format='json']     'json', 'xml' oder 'text'
    *     {function} fn                Callback Funktion
    *     {function} progressFn        Progress Funktion
    *     {Object} context             Kontext für die Callback Funktion
    *     {Object} [headers]           Objekt mit heders die mitgesendet werden
    *                                  Bsp: {"content-type":"application/x-www-form-urlencoded; charset=UTF-8"}
    *     {boolean} [disableCaching=false]    Um Antworten aus dem Cache zu verhindern wird ein Parameter
    *                                         'noCache' mit dem aktuellen Timestamp als Wert erstellt
    * @returns {XMLHttpRequest}
    */
    static request(config = {}) {
        let postData;

        config.method = config.method || 'GET';
        config.format = config.format || 'json';
        config.parameters = config.parameters || {};
        config.abortHappened = false;
        config.timeoutHappened = false;

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

        // GET-Parameters
        if (config.parameters) {
            const parString = kijs.Ajax.createQueryStringFromObject(config.parameters);
            if (parString) {
                config.url += (/\?/.test(config.url) ? '&' : '?') + parString;
            }
        }

        // postData
        if (config.method === 'GET') {
            postData = null;

        } else {
            postData = config.postData || null;
            if (kijs.isObject(postData) || kijs.isArray(postData)) {
                postData = JSON.stringify(postData);
            }

        }

        const xmlhttp = new XMLHttpRequest();

        // Timeout übergeben
        if ('timeout' in config && kijs.isInteger(config.timeout)) {
            xmlhttp.timeout = config.timeout;
        }

        // fortschritt überwachen
        if (kijs.isFunction(config.progressFn)) {
            xmlhttp.onprogress = function(oEvent) {
                config.progressFn.call(config.context || this, oEvent, config);
            };
        }

        xmlhttp.onabort = function() {
            config.abortHappened = true;
        };
        xmlhttp.ontimeout = function() {
            config.timeoutHappened = true;
        };

        xmlhttp.onloadend = function() {
            let val = null;
            if (xmlhttp.status >= 200 && xmlhttp.status <= 299) {
                switch (config.format) {
                    case 'text':
                        val = xmlhttp.responseText;
                        break;

                    case 'json':
                        try {
                            val = JSON.parse(xmlhttp.responseText);
                        } catch (e) {
                            val = xmlhttp.responseText;
                        }
                        break;

                    case 'xml':
                        val = kijs.Ajax.parseXml(xmlhttp.responseXML);
                        break;
                }
                config.fn.call(config.context || this, val, config, null);
            } else {
                let error = '';
                if (xmlhttp.status > 0) {
                    error = kijs.getText('Der Server hat mit einem Fehler geantwortet') + ': ' + xmlhttp.statusText + ' (Code ' + xmlhttp.status + ')';

                } else if (config.abortHappened) {
                    error = kijs.getText('Die Verbindung wurde abgebrochen') + '.';

                } else if (config.timeoutHappened) {
                    error = kijs.getText('Der Server brauchte zu lange, um eine Antwort zu senden') + '. ' +
                            kijs.getText('Die Verbindung wurde abgebrochen') + '.';

                } else {
                    error = kijs.getText('Die Verbindung konnte nicht aufgebaut werden') + '.';
                }
                config.fn.call(config.context || this, val, config, error);
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

        // XMLHttpRequest zurückgeben, damit mit abort() abgebrochen werden könnte.
        return xmlhttp;
    }

    /**
     * Erstellt aus einem XML-Document ein Objekt
     * @param {HTMLElement} xml
     * @returns {Object}
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
     * @param {Object} obj
     * @returns {String}
     */
    static createQueryStringFromObject(obj) {
        let params = [];

        for (let key in obj) {
            let name = encodeURIComponent(key);
            let val = obj[key];

            // object
            if (kijs.isObject(val)) {
                throw new kijs.Error('Objects can not be convert to query strings.');

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
/* global kijs */

// --------------------------------------------------------------
// kijs.Char (Static)
// --------------------------------------------------------------

kijs.Char = class kijs_Char {

    // --------------------------------------------------------------
    // STATIC GETTERS / SETTERS
    // --------------------------------------------------------------
    static get charTable() {
        return {
            A: [     // capital A
                0x00C1, // Á    capital A with ACUTE
                0x0102, // Ă    capital A with BREVE
                0x1EAE, // Ắ    capital A with BREVE and ACUTE
                0x1EB6, // Ặ    capital A with BREVE and DOT BELOW
                0x1EB0, // Ằ    capital A with BREVE and GRAVE
                0x1EB2, // Ẳ    capital A with BREVE and HOOK ABOVE
                0x1EB4, // Ẵ    capital A with BREVE and TILDE
                0x01CD, // Ǎ    capital A with CARON
                0x00C2, // Â    capital A with CIRCUMFLEX
                0x1EA4, // Ấ    capital A with CIRCUMFLEX and ACUTE
                0x1EAC, // Ậ    capital A with CIRCUMFLEX and DOT BELOW
                0x1EA6, // Ầ    capital A with CIRCUMFLEX and GRAVE
                0x1EA8, // Ẩ    capital A with CIRCUMFLEX and HOOK ABOVE
                0x1EAA, // Ẫ    capital A with CIRCUMFLEX and TILDE
                0x00C4, // Ä    capital A with DIAERESIS
                0x1EA0, // Ạ    capital A with DOT BELOW
                0x00C0, // À    capital A with GRAVE
                0x1EA2, // Ả    capital A with HOOK ABOVE
                0x0100, // Ā    capital A with MACRON
                0x0104, // Ą    capital A with OGONEK
                0x00C5, // Å    capital A with RING ABOVE
                0x01FA, // Ǻ    capital A with RING ABOVE and ACUTE
                0x00C3, // Ã    capital A with TILDE
                0x00C6, // Æ    capital AE
                0x01FC  // Ǽ    capital AE with ACUTE
            ],

            B: [     // capital B
                0x1E04, // Ḅ    capital B with DOT BELOW
                0x0181  // Ɓ    capital B with HOOK
            ],

            C: [     // capital C
                0x0106, // Ć    capital C with ACUTE
                0x010C, // Č    capital C with CARON
                0x00C7, // Ç    capital C with CEDILLA
                0x0108, // Ĉ    capital C with CIRCUMFLEX
                0x010A, // Ċ    capital C with DOT ABOVE
                0x0186, // Ɔ    capital OPEN O
                0x0297  // ʗ    LATIN LETTER STRETCHED C
            ],

            D: [     // capital D
                0x010E, // Ď    capital D with CARON
                0x1E12, // Ḓ    capital D with CIRCUMFLEX BELOW
                0x1E0C, // Ḍ    capital D with DOT BELOW
                0x018A, // Ɗ    capital D with HOOK
                0x1E0E, // Ḏ    capital D with LINE BELOW
                0x01F2, // ǲ    capital D with SMALL LETTER Z
                0x01C5, // ǅ    capital D with SMALL LETTER Z with CARON
                0x0110, // Đ    capital D with STROKE
                0x00D0, // Ð    capital ETH
                0x01F1, // Ǳ    capital DZ
                0x01C4  // Ǆ    capital DZ with CARON
            ],

            E: [     // capital E
                0x00C9, // É    capital E with ACUTE
                0x0114, // Ĕ    capital E with BREVE
                0x011A, // Ě    capital E with CARON
                0x00CA, // Ê    capital E with CIRCUMFLEX
                0x1EBE, // Ế    capital E with CIRCUMFLEX and ACUTE
                0x1EC6, // Ệ    capital E with CIRCUMFLEX and DOT BELOW
                0x1EC0, // Ề    capital E with CIRCUMFLEX and GRAVE
                0x1EC2, // Ể    capital E with CIRCUMFLEX and HOOK ABOVE
                0x1EC4, // Ễ    capital E with CIRCUMFLEX and TILDE
                0x00CB, // Ë    capital E with DIAERESIS
                0x0116, // Ė    capital E with DOT ABOVE
                0x1EB8, // Ẹ    capital E with DOT BELOW
                0x00C8, // È    capital E with GRAVE
                0x1EBA, // Ẻ    capital E with HOOK ABOVE
                0x0112, // Ē    capital E with MACRON
                0x0118, // Ę    capital E with OGONEK
                0x1EBC, // Ẽ    capital E with TILDE
                0x0190, // Ɛ    capital OPEN E
                0x018F  // Ə    capital SCHWA
            ],

            F: [     // capital F
                0x0191  // Ƒ    capital F with HOOK
            ],

            G: [     // capital G
                0x01F4, // Ǵ    capital G with ACUTE
                0x011E, // Ğ    capital G with BREVE
                0x01E6, // Ǧ    capital G with CARON
                0x0122, // Ģ    capital G with CEDILLA
                0x011C, // Ĝ    capital G with CIRCUMFLEX
                0x0120, // Ġ    capital G with DOT ABOVE
                0x1E20, // Ḡ    capital G with MACRON
                0x029B  // ʛ    LATIN LETTER SMALL CAPITAL G with HOOK
            ],

            H: [     // capital H
                0x1E2A, // Ḫ    capital H with BREVE BELOW
                0x0124, // Ĥ    capital H with CIRCUMFLEX
                0x1E24, // Ḥ    capital H with DOT BELOW
                0x0126  // Ħ    capital H with STROKE
            ],

            I: [     // capital I
                0x00CD, // Í    capital I with ACUTE
                0x012C, // Ĭ    capital I with BREVE
                0x01CF, // Ǐ    capital I with CARON
                0x00CE, // Î    capital I with CIRCUMFLEX
                0x00CF, // Ï    capital I with DIAERESIS
                0x0130, // İ    capital I with DOT ABOVE
                0x1ECA, // Ị    capital I with DOT BELOW
                0x00CC, // Ì    capital I with GRAVE
                0x1EC8, // Ỉ    capital I with HOOK ABOVE
                0x012A, // Ī    capital I with MACRON
                0x012E, // Į    capital I with OGONEK
                0x0128, // Ĩ    capital I with TILDE
                0x0132  // Ĳ    LATIN CAPITAL LIGATURE IJ
            ],

            J: [     // capital J
                0x0134  // Ĵ    capital J with CIRCUMFLEX
            ],

            K: [     // capital K
                0x0136, // Ķ    capital K with CEDILLA
                0x1E32, // Ḳ    capital K with DOT BELOW
                0x0198, // Ƙ    capital K with HOOK
                0x1E34  // Ḵ    capital K with LINE BELOW
            ],

            L: [     // capital L
                0x0139, // Ĺ    capital L with ACUTE
                0x023D, // Ƚ    capital L with BAR
                0x013D, // Ľ    capital L with CARON
                0x013B, // Ļ    capital L with CEDILLA
                0x1E3C, // Ḽ    capital L with CIRCUMFLEX BELOW
                0x1E36, // Ḷ    capital L with DOT BELOW
                0x1E38, // Ḹ    capital L with DOT BELOW and MACRON
                0x1E3A, // Ḻ    capital L with LINE BELOW
                0x013F, // Ŀ    capital L with MIDDLE DOT
                0x01C8, // ǈ    capital L with SMALL LETTER J
                0x0141, // Ł    capital L with STROKE
                0x01C7  // Ǉ    capital LJ
            ],

            M: [     // capital M
                0x1E3E, // Ḿ    capital M with ACUTE
                0x1E40, // Ṁ    capital M with DOT ABOVE
                0x1E42  // Ṃ    capital M with DOT BELOW
            ],

            N: [     // capital N
                0x0143, // Ń    capital N with ACUTE
                0x0147, // Ň    capital N with CARON
                0x0145, // Ņ    capital N with CEDILLA
                0x1E4A, // Ṋ    capital N with CIRCUMFLEX BELOW
                0x1E44, // Ṅ    capital N with DOT ABOVE
                0x1E46, // Ṇ    capital N with DOT BELOW
                0x01F8, // Ǹ    capital N with GRAVE
                0x019D, // Ɲ    capital N with LEFT HOOK
                0x1E48, // Ṉ    capital N with LINE BELOW
                0x01CB, // ǋ    capital N with SMALL LETTER J
                0x00D1, // Ñ    capital N with TILDE
                0x01CA  // Ǌ    capital NJ
            ],

            O: [     // capital O
                0x00D3, // Ó    capital O with ACUTE
                0x014E, // Ŏ    capital O with BREVE
                0x01D1, // Ǒ    capital O with CARON
                0x00D4, // Ô    capital O with CIRCUMFLEX
                0x1ED0, // Ố    capital O with CIRCUMFLEX and ACUTE
                0x1ED8, // Ộ    capital O with CIRCUMFLEX and DOT BELOW
                0x1ED2, // Ồ    capital O with CIRCUMFLEX and GRAVE
                0x1ED4, // Ổ    capital O with CIRCUMFLEX and HOOK ABOVE
                0x1ED6, // Ỗ    capital O with CIRCUMFLEX and TILDE
                0x00D6, // Ö    capital O with DIAERESIS
                0x1ECC, // Ọ    capital O with DOT BELOW
                0x0150, // Ő    capital O with DOUBLE ACUTE
                0x00D2, // Ò    capital O with GRAVE
                0x1ECE, // Ỏ    capital O with HOOK ABOVE
                0x01A0, // Ơ    capital O with HORN
                0x1EDA, // Ớ    capital O with HORN and ACUTE
                0x1EE2, // Ợ    capital O with HORN and DOT BELOW
                0x1EDC, // Ờ    capital O with HORN and GRAVE
                0x1EDE, // Ở    capital O with HORN and HOOK ABOVE
                0x1EE0, // Ỡ    capital O with HORN and TILDE
                0x014C, // Ō    capital O with MACRON
                0x019F, // Ɵ    capital O with MIDDLE TILDE
                0x01EA, // Ǫ    capital O with OGONEK
                0x00D8, // Ø    capital O with STROKE
                0x01FE, // Ǿ    capital O with STROKE and ACUTE
                0x00D5, // Õ    capital O with TILDE
                0x0152, // Œ    LATIN CAPITAL LIGATURE OE
                0x0276  // ɶ    LATIN LETTER SMALL CAPITAL OE
            ],

            P: [     // capital P
                0x00DE  // Þ    capital THORN
            ],

            Q: [     // capital Q
            ],

            R: [     // capital R
                0x0154, // Ŕ    capital R with ACUTE
                0x0158, // Ř    capital R with CARON
                0x0156, // Ŗ    capital R with CEDILLA
                0x1E58, // Ṙ    capital R with DOT ABOVE
                0x1E5A, // Ṛ    capital R with DOT BELOW
                0x1E5C, // Ṝ    capital R with DOT BELOW and MACRON
                0x1E5E, // Ṟ    capital R with LINE BELOW
                0x0281  // ʁ    LATIN LETTER SMALL CAPITAL INVERTED R
            ],

            S: [     // capital S
                0x015A, // Ś    capital S with ACUTE
                0x0160, // Š    capital S with CARON
                0x015E, // Ş    capital S with CEDILLA
                0x015C, // Ŝ    capital S with CIRCUMFLEX
                0x0218, // Ș    capital S with COMMA BELOW
                0x1E60, // Ṡ    capital S with DOT ABOVE
                0x1E62, // Ṣ    capital S with DOT BELOW
                0x1E9E  // ẞ    capital SHARP S
            ],

            T: [     // capital T
                0x0164, // Ť    capital T with CARON
                0x0162, // Ţ    capital T with CEDILLA
                0x1E70, // Ṱ    capital T with CIRCUMFLEX BELOW
                0x021A, // Ț    capital T with COMMA BELOW
                0x1E6C, // Ṭ    capital T with DOT BELOW
                0x1E6E, // Ṯ    capital T with LINE BELOW
                0x0166, // Ŧ    capital T with STROKE
                0x00DE, // Þ    capital THORN
                0x00D0  // Ð    capital ETH
            ],

            U: [     // capital U
                0x00DA, // Ú    capital U with ACUTE
                0x016C, // Ŭ    capital U with BREVE
                0x01D3, // Ǔ    capital U with CARON
                0x00DB, // Û    capital U with CIRCUMFLEX
                0x00DC, // Ü    capital U with DIAERESIS
                0x01D7, // Ǘ    capital U with DIAERESIS and ACUTE
                0x01D9, // Ǚ    capital U with DIAERESIS and CARON
                0x01DB, // Ǜ    capital U with DIAERESIS and GRAVE
                0x01D5, // Ǖ    capital U with DIAERESIS and MACRON
                0x1EE4, // Ụ    capital U with DOT BELOW
                0x0170, // Ű    capital U with DOUBLE ACUTE
                0x00D9, // Ù    capital U with GRAVE
                0x1EE6, // Ủ    capital U with HOOK ABOVE
                0x01AF, // Ư    capital U with HORN
                0x1EE8, // Ứ    capital U with HORN and ACUTE
                0x1EF0, // Ự    capital U with HORN and DOT BELOW
                0x1EEA, // Ừ    capital U with HORN and GRAVE
                0x1EEC, // Ử    capital U with HORN and HOOK ABOVE
                0x1EEE, // Ữ    capital U with HORN and TILDE
                0x016A, // Ū    capital U with MACRON
                0x0172, // Ų    capital U with OGONEK
                0x016E, // Ů    capital U with RING ABOVE
                0x0168  // Ũ    capital U with TILDE
            ],

            V: [     // capital V
            ],

            W: [     // capital W
                0x1E82, // Ẃ    capital W with ACUTE
                0x0174, // Ŵ    capital W with CIRCUMFLEX
                0x1E84, // Ẅ    capital W with DIAERESIS
                0x1E80, // Ẁ    capital W with GRAVE
                0x02AC  // ʬ    LATIN LETTER BILABIAL PERCUSSIVE
            ],

            X: [     // capital X
            ],

            Y: [     // capital Y
                0x00DD, // Ý    capital Y with ACUTE
                0x0176, // Ŷ    capital Y with CIRCUMFLEX
                0x0178, // Ÿ    capital Y with DIAERESIS
                0x1E8E, // Ẏ    capital Y with DOT ABOVE
                0x1EF4, // Ỵ    capital Y with DOT BELOW
                0x1EF2, // Ỳ    capital Y with GRAVE
                0x01B3, // Ƴ    capital Y with HOOK
                0x1EF6, // Ỷ    capital Y with HOOK ABOVE
                0x0232, // Ȳ    capital Y with MACRON
                0x1EF8  // Ỹ    capital Y with TILDE
            ],

            Z: [     // capital Z
                0x0179, // Ź    capital Z with ACUTE
                0x017D, // Ž    capital Z with CARON
                0x017B, // Ż    capital Z with DOT ABOVE
                0x1E92, // Ẓ    capital Z with DOT BELOW
                0x1E94, // Ẕ    capital Z with LINE BELOW
                0x01B5  // Ƶ    capital Z with STROKE
            ],

            a: [     // lowercase A
                0x00E1, // á    lowercase A with ACUTE
                0x0103, // ă    lowercase A with BREVE
                0x1EAF, // ắ    lowercase A with BREVE and ACUTE
                0x1EB7, // ặ    lowercase A with BREVE and DOT BELOW
                0x1EB1, // ằ    lowercase A with BREVE and GRAVE
                0x1EB3, // ẳ    lowercase A with BREVE and HOOK ABOVE
                0x1EB5, // ẵ    lowercase A with BREVE and TILDE
                0x01CE, // ǎ    lowercase A with CARON
                0x00E2, // â    lowercase A with CIRCUMFLEX
                0x1EA5, // ấ    lowercase A with CIRCUMFLEX and ACUTE
                0x1EAD, // ậ    lowercase A with CIRCUMFLEX and DOT BELOW
                0x1EA7, // ầ    lowercase A with CIRCUMFLEX and GRAVE
                0x1EA9, // ẩ    lowercase A with CIRCUMFLEX and HOOK ABOVE
                0x1EAB, // ẫ    lowercase A with CIRCUMFLEX and TILDE
                0x00E4, // ä    lowercase A with DIAERESIS
                0x1EA1, // ạ    lowercase A with DOT BELOW
                0x00E0, // à    lowercase A with GRAVE
                0x1EA3, // ả    lowercase A with HOOK ABOVE
                0x0101, // ā    lowercase A with MACRON
                0x0105, // ą    lowercase A with OGONEK
                0x00E5, // å    lowercase A with RING ABOVE
                0x01FB, // ǻ    lowercase A with RING ABOVE and ACUTE
                0x00E3, // ã    lowercase A with TILDE
                0x00E6, // æ    lowercase AE
                0x01FD, // ǽ    lowercase AE with ACUTE
                0x0251, // ɑ    lowercase ALPHA
                0x0250, // ɐ    lowercase TURNED A
                0x0252  // ɒ    lowercase TURNED ALPHA
            ],

            b: [     // lowercase B
                0x1E05, // ḅ    lowercase B with DOT BELOW
                0x0253, // ɓ    lowercase B with HOOK
                0x00DF  // ß    lowercase SHARP S
            ],

            c: [     // lowercase C
                0x0107, // ć    lowercase C with ACUTE
                0x010D, // č    lowercase C with CARON
                0x00E7, // ç    lowercase C with CEDILLA
                0x0109, // ĉ    lowercase C with CIRCUMFLEX
                0x0255, // ɕ    lowercase C with CURL
                0x010B  // ċ    lowercase C with DOT ABOVE
            ],

            d: [     // lowercase D
                0x010F, // ď    lowercase D with CARON
                0x1E13, // ḓ    lowercase D with CIRCUMFLEX BELOW
                0x1E0D, // ḍ    lowercase D with DOT BELOW
                0x0257, // ɗ    lowercase D with HOOK
                0x1E0F, // ḏ    lowercase D with LINE BELOW
                0x0111, // đ    lowercase D with STROKE
                0x0256, // ɖ    lowercase D with TAIL
                0x02A4, // ʤ    lowercase DEZH DIGRAPH
                0x01F3, // ǳ    lowercase DZ
                0x02A3, // ʣ    lowercase DZ DIGRAPH
                0x02A5, // ʥ    lowercase DZ DIGRAPH with CURL
                0x01C6, // ǆ    lowercase DZ with CARON
                0x00F0  // ð    lowercase ETH
            ],

            e: [     // lowercase E
                0x00E9, // é    lowercase E with ACUTE
                0x0115, // ĕ    lowercase E with BREVE
                0x011B, // ě    lowercase E with CARON
                0x00EA, // ê    lowercase E with CIRCUMFLEX
                0x1EBF, // ế    lowercase E with CIRCUMFLEX and ACUTE
                0x1EC7, // ệ    lowercase E with CIRCUMFLEX and DOT BELOW
                0x1EC1, // ề    lowercase E with CIRCUMFLEX and GRAVE
                0x1EC3, // ể    lowercase E with CIRCUMFLEX and HOOK ABOVE
                0x1EC5, // ễ    lowercase E with CIRCUMFLEX and TILDE
                0x00EB, // ë    lowercase E with DIAERESIS
                0x0117, // ė    lowercase E with DOT ABOVE
                0x1EB9, // ẹ    lowercase E with DOT BELOW
                0x00E8, // è    lowercase E with GRAVE
                0x1EBB, // ẻ    lowercase E with HOOK ABOVE
                0x0113, // ē    lowercase E with MACRON
                0x0119, // ę    lowercase E with OGONEK
                0x1EBD, // ẽ    lowercase E with TILDE
                0x0292, // ʒ    lowercase EZH
                0x01EF, // ǯ    lowercase EZH with CARON
                0x0293, // ʓ    lowercase EZH with CURL
                0x0258, // ɘ    lowercase REVERSED E
                0x025C, // ɜ    lowercase REVERSED OPEN E
                0x025D, // ɝ    lowercase REVERSED OPEN E with HOOK
                0x0259, // ə    lowercase SCHWA
                0x025A, // ɚ    lowercase SCHWA with HOOK
                0x029A, // ʚ    lowercase CLOSED OPEN E
                0x025E  // ɞ    lowercase CLOSED REVERSED OPEN E
            ],

            f: [     // lowercase F
                0x0192, // ƒ    lowercase F with HOOK
                0x017F, // ſ    lowercase LONG S
                0x02A9, // ʩ    lowercase FENG DIGRAPH
                0xFB01, // ﬁ    LATIN SMALL LIGATURE FI
                0xFB02, // ﬂ    LATIN SMALL LIGATURE FL
                0x0283, // ʃ    lowercase ESH
                0x0286, // ʆ    lowercase ESH with CURL
                0x0285, // ʅ    lowercase SQUAT REVERSED ESH
                0x025F, // ɟ    lowercase DOTLESS J with STROKE
                0x0284  // ʄ    lowercase DOTLESS J with STROKE and HOOK
            ],

            g: [     // lowercase G
                0x01F5, // ǵ    lowercase G with ACUTE
                0x011F, // ğ    lowercase G with BREVE
                0x01E7, // ǧ    lowercase G with CARON
                0x0123, // ģ    lowercase G with CEDILLA
                0x011D, // ĝ    lowercase G with CIRCUMFLEX
                0x0121, // ġ    lowercase G with DOT ABOVE
                0x0260, // ɠ    lowercase G with HOOK
                0x1E21, // ḡ    lowercase G with MACRON
                0x0261, // ɡ    lowercase SCRIPT G
                0x0263  // ɣ    lowercase GAMMA
            ],

            h: [     // lowercase H
                0x1E2B, // ḫ    lowercase H with BREVE BELOW
                0x0125, // ĥ    lowercase H with CIRCUMFLEX
                0x1E25, // ḥ    lowercase H with DOT BELOW
                0x0266, // ɦ    lowercase H with HOOK
                0x1E96, // ẖ    lowercase H with LINE BELOW
                0x0127, // ħ    lowercase H with STROKE
                0x0267, // ɧ    lowercase HENG with HOOK
                0x0265, // ɥ    lowercase TURNED H
                0x02AE, // ʮ    lowercase TURNED H with FISHHOOK
                0x02AF, // ʯ    lowercase TURNED H with FISHHOOK and TAIL
                0x0173  // ų    lowercase U with OGONEK
            ],

            i: [     // lowercase I
                0x00ED, // í    lowercase I with ACUTE
                0x012D, // ĭ    lowercase I with BREVE
                0x01D0, // ǐ    lowercase I with CARON
                0x00EE, // î    lowercase I with CIRCUMFLEX
                0x00EF, // ï    lowercase I with DIAERESIS
                0x1ECB, // ị    lowercase I with DOT BELOW
                0x00EC, // ì    lowercase I with GRAVE
                0x1EC9, // ỉ    lowercase I with HOOK ABOVE
                0x012B, // ī    lowercase I with MACRON
                0x012F, // į    lowercase I with OGONEK
                0x0268, // ɨ    lowercase I with STROKE
                0x0129, // ĩ    lowercase I with TILDE
                0x0269, // ɩ    lowercase IOTA
                0x0131, // ı    lowercase DOTLESS I
                0x0133, // ĳ    LATIN SMALL LIGATURE IJ
                0x025F  // ɟ    lowercase DOTLESS J with STROKE
            ],

            j: [     // lowercase J
                0x01F0, // ǰ    lowercase J with CARON
                0x0135, // ĵ    lowercase J with CIRCUMFLEX
                0x029D, // ʝ    lowercase J with CROSSED-TAIL
                0x0237, // ȷ    lowercase DOTLESS J
                0x025F, // ɟ    lowercase DOTLESS J with STROKE
                0x0284  // ʄ    lowercase DOTLESS J with STROKE and HOOK
            ],

            k: [     // lowercase K
                0x0137, // ķ    lowercase K with CEDILLA
                0x1E33, // ḳ    lowercase K with DOT BELOW
                0x0199, // ƙ    lowercase K with HOOK
                0x1E35, // ḵ    lowercase K with LINE BELOW
                0x0138, // ĸ    lowercase KRA
                0x029E  // ʞ    lowercase TURNED K
            ],

            l: [     // lowercase L
                0x013A, // ĺ    lowercase L with ACUTE
                0x019A, // ƚ    lowercase L with BAR
                0x026C, // ɬ    lowercase L with BELT
                0x013E, // ľ    lowercase L with CARON
                0x013C, // ļ    lowercase L with CEDILLA
                0x1E3D, // ḽ    lowercase L with CIRCUMFLEX BELOW
                0x1E37, // ḷ    lowercase L with DOT BELOW
                0x1E39, // ḹ    lowercase L with DOT BELOW and MACRON
                0x1E3B, // ḻ    lowercase L with LINE BELOW
                0x0140, // ŀ    lowercase L with MIDDLE DOT
                0x026B, // ɫ    lowercase L with MIDDLE TILDE
                0x026D, // ɭ    lowercase L with RETROFLEX HOOK
                0x0142, // ł    lowercase L with STROKE
                0x019B, // ƛ    lowercase LAMBDA with STROKE
                0x026E, // ɮ    lowercase LEZH
                0x01C9, // ǉ    lowercase LJ
                0x02AA, // ʪ    lowercase LS DIGRAPH
                0x02AB  // ʫ    lowercase LZ DIGRAPH
            ],

            m: [     // lowercase M
                0x1E3F, // ḿ    lowercase M with ACUTE
                0x1E41, // ṁ    lowercase M with DOT ABOVE
                0x1E43, // ṃ    lowercase M with DOT BELOW
                0x0271, // ɱ    lowercase M with HOOK
                0x026F, // ɯ    lowercase TURNED M
                0x0270  // ɰ    lowercase TURNED M with LONG LEG
            ],

            n: [     // lowercase N
                0x0149, // ŉ    lowercase N PRECEDED BY APOSTROPHE
                0x0144, // ń    lowercase N with ACUTE
                0x0148, // ň    lowercase N with CARON
                0x0146, // ņ    lowercase N with CEDILLA
                0x1E4B, // ṋ    lowercase N with CIRCUMFLEX BELOW
                0x1E45, // ṅ    lowercase N with DOT ABOVE
                0x1E47, // ṇ    lowercase N with DOT BELOW
                0x01F9, // ǹ    lowercase N with GRAVE
                0x0272, // ɲ    lowercase N with LEFT HOOK
                0x1E49, // ṉ    lowercase N with LINE BELOW
                0x0273, // ɳ    lowercase N with RETROFLEX HOOK
                0x00F1, // ñ    lowercase N with TILDE
                0x01CC, // ǌ    lowercase NJ
                0x014B, // ŋ    lowercase ENG
                0x014A  // Ŋ    capital ENG
            ],

            o: [     // lowercase O
                0x00F3, // ó    lowercase O with ACUTE
                0x014F, // ŏ    lowercase O with BREVE
                0x01D2, // ǒ    lowercase O with CARON
                0x00F4, // ô    lowercase O with CIRCUMFLEX
                0x1ED1, // ố    lowercase O with CIRCUMFLEX and ACUTE
                0x1ED9, // ộ    lowercase O with CIRCUMFLEX and DOT BELOW
                0x1ED3, // ồ    lowercase O with CIRCUMFLEX and GRAVE
                0x1ED5, // ổ    lowercase O with CIRCUMFLEX and HOOK ABOVE
                0x1ED7, // ỗ    lowercase O with CIRCUMFLEX and TILDE
                0x00F6, // ö    lowercase O with DIAERESIS
                0x1ECD, // ọ    lowercase O with DOT BELOW
                0x0151, // ő    lowercase O with DOUBLE ACUTE
                0x00F2, // ò    lowercase O with GRAVE
                0x1ECF, // ỏ    lowercase O with HOOK ABOVE
                0x01A1, // ơ    lowercase O with HORN
                0x1EDB, // ớ    lowercase O with HORN and ACUTE
                0x1EE3, // ợ    lowercase O with HORN and DOT BELOW
                0x1EDD, // ờ    lowercase O with HORN and GRAVE
                0x1EDF, // ở    lowercase O with HORN and HOOK ABOVE
                0x1EE1, // ỡ    lowercase O with HORN and TILDE
                0x014D, // ō    lowercase O with MACRON
                0x01EB, // ǫ    lowercase O with OGONEK
                0x00F8, // ø    lowercase O with STROKE
                0x01FF, // ǿ    lowercase O with STROKE and ACUTE
                0x00F5, // õ    lowercase O with TILDE
                0x025B, // ɛ    lowercase OPEN E
                0x0254, // ɔ    lowercase OPEN O
                0x0275, // ɵ    lowercase BARRED O
                0x0298, // ʘ    LATIN LETTER BILABIAL CLICK
                0x0153  // œ    LATIN SMALL LIGATURE OE
            ],

            p: [     // lowercase P
                0x0278, // ɸ    lowercase PHI
                0x00FE  // þ    lowercase THORN
            ],

            q: [     // lowercase Q
                0x02A0  // ʠ    lowercase Q with HOOK
            ],

            r: [     // lowercase R
                0x0155, // ŕ    lowercase R with ACUTE
                0x0159, // ř    lowercase R with CARON
                0x0157, // ŗ    lowercase R with CEDILLA
                0x1E59, // ṙ    lowercase R with DOT ABOVE
                0x1E5B, // ṛ    lowercase R with DOT BELOW
                0x1E5D, // ṝ    lowercase R with DOT BELOW and MACRON
                0x027E, // ɾ    lowercase R with FISHHOOK
                0x1E5F, // ṟ    lowercase R with LINE BELOW
                0x027C, // ɼ    lowercase R with LONG LEG
                0x027D, // ɽ    lowercase R with TAIL
                0x027F, // ɿ    lowercase REVERSED R with FISHHOOK
                0x0279, // ɹ    lowercase TURNED R
                0x027B, // ɻ    lowercase TURNED R with HOOK
                0x027A  // ɺ    lowercase TURNED R with LONG LEG
            ],

            s: [     // lowercase S
                0x015B, // ś    lowercase S with ACUTE
                0x0161, // š    lowercase S with CARON
                0x015F, // ş    lowercase S with CEDILLA
                0x015D, // ŝ    lowercase S with CIRCUMFLEX
                0x0219, // ș    lowercase S with COMMA BELOW
                0x1E61, // ṡ    lowercase S with DOT ABOVE
                0x1E63, // ṣ    lowercase S with DOT BELOW
                0x0282, // ʂ    lowercase S with HOOK
                0x017F, // ſ    lowercase LONG S
                0x0283, // ʃ    lowercase ESH
                0x0286, // ʆ    lowercase ESH with CURL
                0x00DF, // ß    lowercase SHARP S
                0x0285  // ʅ    lowercase SQUAT REVERSED ESH
            ],

            t: [     // lowercase T
                0x0165, // ť    lowercase T with CARON
                0x0163, // ţ    lowercase T with CEDILLA
                0x1E71, // ṱ    lowercase T with CIRCUMFLEX BELOW
                0x021B, // ț    lowercase T with COMMA BELOW
                0x1E97, // ẗ    lowercase T with DIAERESIS
                0x1E6D, // ṭ    lowercase T with DOT BELOW
                0x1E6F, // ṯ    lowercase T with LINE BELOW
                0x0288, // ʈ    lowercase T with RETROFLEX HOOK
                0x0167, // ŧ    lowercase T with STROKE
                0x02A8, // ʨ    lowercase TC DIGRAPH with CURL
                0x02A7, // ʧ    lowercase TESH DIGRAPH
                0x00FE, // þ    lowercase THORN
                0x00F0, // ð    lowercase ETH
                0x02A6, // ʦ    lowercase TS DIGRAPH
                0x0287  // ʇ    lowercase TURNED T
            ],

            u: [     // lowercase U
                0x0289, // ʉ    lowercase U BAR
                0x00FA, // ú    lowercase U with ACUTE
                0x016D, // ŭ    lowercase U with BREVE
                0x01D4, // ǔ    lowercase U with CARON
                0x00FB, // û    lowercase U with CIRCUMFLEX
                0x00FC, // ü    lowercase U with DIAERESIS
                0x01D8, // ǘ    lowercase U with DIAERESIS and ACUTE
                0x01DA, // ǚ    lowercase U with DIAERESIS and CARON
                0x01DC, // ǜ    lowercase U with DIAERESIS and GRAVE
                0x01D6, // ǖ    lowercase U with DIAERESIS and MACRON
                0x1EE5, // ụ    lowercase U with DOT BELOW
                0x0171, // ű    lowercase U with DOUBLE ACUTE
                0x00F9, // ù    lowercase U with GRAVE
                0x1EE7, // ủ    lowercase U with HOOK ABOVE
                0x01B0, // ư    lowercase U with HORN
                0x1EE9, // ứ    lowercase U with HORN and ACUTE
                0x1EF1, // ự    lowercase U with HORN and DOT BELOW
                0x1EEB, // ừ    lowercase U with HORN and GRAVE
                0x1EED, // ử    lowercase U with HORN and HOOK ABOVE
                0x1EEF, // ữ    lowercase U with HORN and TILDE
                0x016B, // ū    lowercase U with MACRON
                0x0173, // ų    lowercase U with OGONEK
                0x016F, // ů    lowercase U with RING ABOVE
                0x0169, // ũ    lowercase U with TILDE
                0x028A  // ʊ    lowercase UPSILON
            ],

            v: [     // lowercase V
                0x028B, // ʋ    lowercase V with HOOK
                0x028C  // ʌ    lowercase TURNED V
            ],

            w: [     // lowercase W
                0x1E83, // ẃ    lowercase W with ACUTE
                0x0175, // ŵ    lowercase W with CIRCUMFLEX
                0x1E85, // ẅ    lowercase W with DIAERESIS
                0x1E81, // ẁ    lowercase W with GRAVE
                0x028D  // ʍ    lowercase TURNED W
            ],

            x: [     // lowercase X
            ],

            y: [     // lowercase Y
                0x00FD, // ý    lowercase Y with ACUTE
                0x0177, // ŷ    lowercase Y with CIRCUMFLEX
                0x00FF, // ÿ    lowercase Y with DIAERESIS
                0x1E8F, // ẏ    lowercase Y with DOT ABOVE
                0x1EF5, // ỵ    lowercase Y with DOT BELOW
                0x1EF3, // ỳ    lowercase Y with GRAVE
                0x01B4, // ƴ    lowercase Y with HOOK
                0x1EF7, // ỷ    lowercase Y with HOOK ABOVE
                0x0233, // ȳ    lowercase Y with MACRON
                0x1EF9, // ỹ    lowercase Y with TILDE
                0x028E  // ʎ    lowercase TURNED Y
            ],

            z: [     // lowercase Z
                0x017A, // ź    lowercase Z with ACUTE
                0x017E, // ž    lowercase Z with CARON
                0x0291, // ʑ    lowercase Z with CURL
                0x017C, // ż    lowercase Z with DOT ABOVE
                0x1E93, // ẓ    lowercase Z with DOT BELOW
                0x1E95, // ẕ    lowercase Z with LINE BELOW
                0x0290, // ʐ    lowercase Z with RETROFLEX HOOK
                0x01B6  // ƶ    lowercase Z with STROKE
            ]
        };
    };


    // --------------------------------------------------------------
    // STATICS
    // --------------------------------------------------------------

    /**
     * Returns a RegExp String with every letter (a-zA-Z) replaced with all variants of this letter.
     * Ex.: 'a' => '[aáăắặằẳẵǎâấậầẩẫäạàảāąåǻãæǽɑɐɒ]'
     * @param {String} text
     * @returns {String}
     */
    static getRegexPattern(text) {

        // String in Buchstabenarray aufteilen
        let letters = null;
        if (kijs.isFunction(Array.from)) {
            letters = Array.from(text);
            
        } else { // Fallback für IE
            letters = text.split('');
        }

        let regex = '';
        kijs.Array.each(letters, function(letter) {
            if (kijs.isArray(kijs.Char.charTable[letter]) && kijs.Char.charTable[letter].length > 0) {
                regex += '[' + letter;
                kijs.Array.each(kijs.Char.charTable[letter], function(specialLetter) {
                    regex += String.fromCodePoint ? String.fromCodePoint(specialLetter) : String.fromCharCode(specialLetter);
                }, this);
                regex += ']';
            } else {
                regex += '' + letter;
            }
        }, this);

        return regex;
    }

    /**
     * Replaces special chars with their base char (öüä => oua).
     * @param {String} text
     * @returns {String}
     */
    static replaceSpecialChars(text) {

        // String in Buchstabenarray aufteilen
        let letters = null;
        if (kijs.isFunction(Array.from)) {
            letters = Array.from(text);
        } else { // Fallback für IE
            letters = text.split('');
        }

        let responseText = '';
        kijs.Array.each(letters, function(letter) {
           for (let char in kijs.Char.charTable) {
               if (kijs.Array.contains(kijs.Char.charTable[char], letter.codePointAt ? letter.codePointAt(0) : letter.charCodeAt(0))) {
                   responseText += char;
                   return;
               }
           }

           // no match
           responseText += letter;
        });

        return responseText;
    }
};
/* global kijs, this */

// --------------------------------------------------------------
// kijs.Data
// --------------------------------------------------------------
kijs.Data = class kijs_Data {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        this._columns = [];      // Array mit Spaltennamen
        this._rows = [];         // Recordset-Array
        this._primary = [];      // Array mit Namen der Primärschlüssel

        this._disableDuplicateCheck = false;    // Duplikat-Kontrolle ausschalten

        // Mapping für die Zuweisung der Config-Eigenschaften
        this._configMap = {
            disableDuplicateCheck: true,
            rows: true,
            columns: true,
            primary: true
        };

        // Config anwenden
        if (kijs.isObject(config)) {
            this.applyConfig(config);
        }
    }


    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get columns() { return this._columns; }
    set columns(val) { this._columns = val; }

    get disableDuplicateCheck() { return this._disableDuplicateCheck; }
    set disableDuplicateCheck(val) { this._disableDuplicateCheck = !!val; }

    get rows() { return this._rows; }

    /**
     * Setzt die Rows-Datenquelle.Das Array muss in einem der folgenden Formate sein:
     * - einfaches Wertearray = ['Herr', 'Frau', 'Familie'] (nur ein Wert pro Zeile)
     * - mehrdimensionales Wertearray = [['Herr', 'Muster'], ['Frau', 'Müller']]
     * - Recordset-Array = [{Anrede: 'Herr', Name='Muster'}, {Anrede: 'Frau', Name='Müller'}]
     * Alle Datensätze im Array müssen das gleiche Format haben.
     * @param {Array} val
     * @returns {undefined}
     */
    set rows(val) {
        if (kijs.isEmpty(val)) {
            this._rows = [];
            return;
        }

        if (!kijs.isArray(val)) {
            val = [val];
        }

        // Falls ein anderes Format als unser erwartetes Recordset-Array übergeben wurde: konvertieren
        this._convertFromAnyDataArray(val);

        // Sicherstellen, dass es keine duplikate im Primary gibt
        if (!this._disableDuplicateCheck) {
            if (this.duplicateCheck(val)) {
                throw new Error('Not unique primary-key on (' + this._primary.join(', ') + ').');
            }
        }

        this._rows = val;
    }

    get primary() { return this._primary; }
    set primary(val) { this._primary = val; }


    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    /**
    * Fügt eine oder mehrere neue rows hinzu. Das Array muss in einem der folgenden Formate sein:
    * - einfaches Wertearray = ['Herr', 'Frau', 'Familie'] (nur ein Wert pro Zeile)
    * - mehrdimensionales Wertearray = [['Herr', 'Muster'], ['Frau', 'Müller']]
    * - Recordset-Array = [{Anrede:'Herr', Name:'Muster'}, {Anrede:'Frau', Name:'Müller'}]
    * Alle Datensätze im Array müssen das gleiche Format haben.
    * @param {Object|Array} rows
    * @param {Boolean|null} [duplicateCheck=false]
    * @returns {undefined}
    */
    add(rows, duplicateCheck) {
        if (kijs.isEmpty(rows)) {
            return;
        }

        if (!kijs.isArray(rows)) {
            rows = [rows];
        }

        // Falls ein anderes Format als unser erwartetes Recordset-Array übergeben wurde: konvertieren
        this._convertFromAnyDataArray(rows);

        // Sicherstellen, dass es keine duplikate im Primary gibt
        if (duplicateCheck) {
            if (this.duplicateCheck(rows)) {
                throw new Error('Not unique primary-key on (' + this.primary.join(', ') + ').');
            }
        }

        // einfügen
        for (let i=0; i<rows.length; i++) {
            let row = rows[i];
            this.rows.push(row);
        }
    }


    /**
     * Wendet die Konfigurations-Eigenschaften an
     * @param {Object} config
     * @returns {undefined}
     */
    applyConfig(config={}) {
        kijs.Object.assignConfig(this, config, this._configMap);

        // Evtl. die Rows in win Recordset-Array konvertieren
        this._convertFromAnyDataArray(this._rows);

        // Falls nur rows übergeben wurden und keine columns: Die columns automatisch generieren
        if (kijs.isEmpty(this._columns)) {
            this._columns = this._getColumnsFromRows(this._rows);
        }
    }

    /**
     * Prüft, ob eine Spalte existiert
     * @param {String} columnName
     * @returns {Boolean}
     */
    columnExist(columnName) {
        return kijs.Array.contains(this._columns, columnName);
    }

    /**
     * Prüft, ob ein Primary einer Row schon im Recordset ist.
     * @param {Array|Object} rows   // einzelnes row-Objekt oder rows-Array
     * @returns {Boolean} true, falls bereits enthalten
     */
    duplicateCheck(rows) {
        let hasDuplicate = false;

        if (kijs.isEmpty(rows)) {
            return false;
        }

        if (!kijs.isArray(rows)) {
            rows = [rows];
        }

        kijs.Array.each(this._rows, function(item) {
            let match = 0;
            for (let i=0; i<this._primary.length; i++) {
                let pk = this._primary[i];
                if (rows[pk] === item[pk]) {
                    match++;
                }
            }

            if (match === this._primary.length) {
                hasDuplicate = true;
                return false; // schlaufe brechen
            }
        }, this);

        return hasDuplicate;
    }


    /**
     * Eine Funktion auf jede Row ausführen
     * @param {Function} fn Als argument wird die Row übergeben.
     * @param {Object} context
     * @returns {Number|Boolean}
     */
    each(fn, context) {
        if (kijs.isEmpty(this._rows)) {
            return;
        }
        return kijs.Array.each(this._rows, fn, context);
    }

    /**
     * Gibt die Anzahl Zeilen zurück
     * @returns {Number}
     */
    getCount() {
        return this._rows.length;
    }


    /**
     * gibt ein leeres Row-Objekt zurück.
     * @returns {Object}
     */
    getEmptyRowObject() {
        const o = {};
        for (let i=0; i<this._columns.length; i++) {
            o[this._columns[i]] = null;
        }
        return o;
    }

    /**
     * gibt Zeilen zurück, deren Inhalt dem Value entspricht
     * @param {String} columnName Spaltenname
     * @param {Number|String|NULL} value
     * @returns {Array}
     */
    getRowsByFieldValue(columnName, value) {
        const len = this._rows.length;
        const ret = [];

        // Zeilen durchgehen
        for (let i=0, len; i<len; i++) {
            if (kijs.toString(this._rows[i][columnName]) === kijs.toString(value)) {
                ret.push(this._rows[i]);
            }
        }

        return ret;
    }

    /**
     * gibt eine Zeile aufgrund des Primary zurück
     * @param {String|Number|Array|Object} primary
     * @returns {Object}
     */
    getRowByPrimary(primary) {
        let keys = {};

        // Wenn kein Primary definiert ist: Fehler
        if (kijs.isEmpty(this._primary)) {
            throw new Error('No primary key is defined in this data object.');
        }

        // String oder Number
        if (kijs.isString(primary) || kijs.isNumber(primary)) {
            keys[this._primary[0]] = primary;
        }

        // Array
        if (kijs.isArray(primary)) {
            for (let i=0; i< primary.length; i++) {
                keys[this._primary[i]] = primary;
            }
        }

        // Objekt
        if (kijs.isObject(primary)) {
            keys = primary;
        }

        // Kontrollieren ob die Parameter stimmen
        for (let i=0; i< this._primary.length; i++) {
            if (kijs.isEmpty(keys[this._primary[i]])) {
                throw new Error('Number of primary-columns does not match.');
            }
        }

        // Zeilen durchgehen, bis die erste passt
        const len = this._rows.length;
        for (let i=0, len; i<len; i++) {
            let ok = true;
            for (let j=0; j<this._primary.length; j++) {
                const col = this._primary[j];
                if (kijs.toString(this._rows[i][col]) !== kijs.toString(keys[col])) {
                    ok = false;
                    break;
                }
            }
            if (ok) {
                return this._rows[i];
            }
        }

        return null;
    }

    /**
     * Fügt eine Row vor eine andere ein.
     * @param {Object} newRow
     * @param {Object} row
     * @returns {Boolean}
     */
    insertBefore(newRow, row) {
        this._completeRowObject(newRow);
        if (this._duplicateCheck(row)) {
            return false;
        }

        const pos = this._rows.indexOf(row);
        if (pos === -1) {
            this._rows.push(row);
        } else {
            this._rows.splice(pos, 0, newRow);
        }
        return true;
    }

    /**
     * Löscht eine Zeile
     * @param {Object} row
     * @returns {Array}
     */
    remove(row) {
        const pos = this._rows.indexOf(row);
        if (pos === -1) return false;

        this._rows.splice(pos, 1);
        return true;
    }

    /**
     * Löscht alle Zeilen
     * @returns {undefined}
     */
    removeAll() {
        this._rows = [];
    }


    // PROTECTED
    /**
     * Prüft, ob in einem Row-Object alle columns existieren, oder erstellt diese.
     * @param {Object} row
     * @returns {Boolean} Wurde etwas geändert?
     */
    _completeRowObject(row) {
        let ret = false;
        for (let i=0; i<this._columns.length; i++) {
            let col = this._columns[i];

            if (!kijs.isDefined(row[col])) {
                row[col] = null;
                ret = true;
            }
        }
        return ret;
    }

    /**
     * Konvertiert ein Daten-Array aus einem der folgenden Formate in unser Recordset-Array
     * - einfaches Wertearray = ['Herr', 'Frau', 'Familie'] (nur ein Wert pro Zeile)
     * - mehrdimensionales Wertearray = [['Herr', 'Muster'], ['Frau', 'Müller']]
     * - Recordset-Array = [{Anrede:'Herr', Name:'Muster'}, {Anrede:'Frau', Name:'Müller'}]
     * @param {Array} rows
     * @returns {undefined}
     */
    _convertFromAnyDataArray(rows) {
        if (kijs.isEmpty(rows)) {
            return;
        }

        // Die erste Zeile im Array bestimmt das Format.
        // Ein Mix von Formaten im selben Array ist deshalb nicht erlaubt.
        let format;

        // Objekt -> keine Konventierung notwendig
        if (kijs.isObject(rows[0])) {
            format = 'object';

        // Array mit Werten -> konvertieren
        } else if (kijs.isArray(rows[0])) {
            // Spaltenanzahl muss übereinstimmen
            if (!kijs.isEmpty(this._columns) && rows[0].length === this._columns.length) {
                format = 'array';
            } else {
                throw new Error('The number of columns does not match.');
            }

        // alle anderen Datentypen (String, Number, Boolean) -> enthalten direkt den Wert, sie werden konventiert.
        } else {
            format = 'value';

        }


        // Daten evtl. in den richtigen Datentyp konvertieren
        switch (format) {
            // Objekt -> keine Konventierung notwendig
            case 'object':
                // Sicherstellen, dass die Zeilen auch alle erforderlichen Spalten haben.
                if (this._completeRowObject(rows[0]) && rows.length>1) {
                    for (let i=1; i<rows.length; i++) {
                        this._completeRowObject(rows[i]);
                    }
                }
                break;

            // Array mit Werten -> konvertieren
            case 'array':
                // Daten konvertieren
                for (let i=0; i<rows.length; i++) {
                    let row = {};

                    for (let j=0; j<this._columns.length; j++) {
                        const name = this._columns[j];
                        row[name] = rows[i][j];
                    }

                    rows[i] = row;
                }
                break;

            // alle anderen Datentypen -> enthalten direkt den Wert (nur ein Wert pro Zeile), sie werden konventiert.
            case 'value':
                // Feldname ermitteln
                let name;

                // 1. Priorität: 1. Primary nehmen
                if (!kijs.isEmpty(this._primary)) {
                    name = this._primary[0];

                // 2. Priorität: 1. Spalte nehmen
                } else if (!kijs.isEmpty(this._columns)) {
                    name = this._columns[0];

                // sonst 'id' nehmen
                } else {
                    name = 'id';
                    this._columns.push(name);

                    // Daten konvertieren
                    for (let i=0; i<rows.length; i++) {
                        let row = this.getEmptyRowObject();
                        row[name] = rows[i];

                        // Sicherstellen, dass die neue Zeile auch alle erforderlichen Spalten hat.
                        this._completeRowObject(row);

                        rows[i] = row;
                    }

                }
                break;
        }
    }

    /**
     * Die Columns automatisch anhand der rows ermitteln
     * @param {Array} rows
     * @returns {Array} Array mit den Spaltennamen
     */
    _getColumnsFromRows(rows) {
        const columns = [];

        // Falls nur rows übergeben wurden und keine columns: Die columns automatisch generieren
        if (rows.length > 0) {
            for (let argName in rows[0]) {
                columns.push(argName);
            }
        }

        return columns;
    }


    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct() {
        // Variablen
        this._columns = null;
        this._rows = null;
        this._primary = null;
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
        return [
            kijs.getText('Sonntag'),
            kijs.getText('Montag'),
            kijs.getText('Dienstag'),
            kijs.getText('Mittwoch'),
            kijs.getText('Donnerstag'),
            kijs.getText('Freitag'),
            kijs.getText('Samstag')
        ];
        /*{
            en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            de: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
            fr: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
        };*/
    }

    static get weekdays_short() {
        return [
            kijs.getText('So', '3'),
            kijs.getText('Mo', '3'),
            kijs.getText('Di', '3'),
            kijs.getText('Mi', '3'),
            kijs.getText('Do', '3'),
            kijs.getText('Fr', '3'),
            kijs.getText('Sa', '3')
        ];
        /*{
            en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            de: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
            fr: ['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa']
        };*/
    }

    static get months() {
        return [
            kijs.getText('Januar'),
            kijs.getText('Februar'),
            kijs.getText('März'),
            kijs.getText('April'),
            kijs.getText('Mai'),
            kijs.getText('Juni'),
            kijs.getText('Juli'),
            kijs.getText('August'),
            kijs.getText('September'),
            kijs.getText('Oktober'),
            kijs.getText('November'),
            kijs.getText('Dezember')
        ];
        /*{
            en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            de: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
            fr: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
        };*/
    }

    static get months_short() {
        return [
            kijs.getText('Jan', '3'),
            kijs.getText('Feb', '3'),
            kijs.getText('Mär', '3'),
            kijs.getText('Apr', '3'),
            kijs.getText('Mai', '3'),
            kijs.getText('Jun', '3'),
            kijs.getText('Jul', '3'),
            kijs.getText('Aug', '3'),
            kijs.getText('Sep', '3'),
            kijs.getText('Okt', '3'),
            kijs.getText('Nov', '3'),
            kijs.getText('Dez', '3')
        ];
        /*{
            en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            de: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
            fr: ['JAN', 'FÉV', 'MAR', 'AVR', 'MAI', 'JUN', 'JUL', 'AOÛ', 'SEP', 'OCT', 'NOV', 'DÉC']
        };*/
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
     * @param {Date|null} date1
     * @param {Date|null} date2
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
     * @returns {Date|null}
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
     * @returns {String}
     */
    static format(date, format) {
        return kijs.toString(format).replace(/[a-zA-Z]/g, (letter) => {
            return this.__formatReplace(letter, date);
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
     * @param {Boolean} [short=false]       Kurzform
     * @returns {String}
     */
    static getMonthName(date, short=false) {
        if (short) {
            return this.months_short[date.getMonth()];
        } else {
            return this.months[date.getMonth()];
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
     * @param {Boolean} [short=false]       Kurzform
     * @returns {String}
     */
    static getWeekday(date, short) {
        if (short) {
            return this.weekdays_short[date.getDay()];
        } else {
            return this.weekdays[date.getDay()];
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
        return Math.round(date.getTime() / 1000);
    }


    // PRIVATE
    static __formatReplace(letter, date) {
        switch (letter) {
            // Tag
            // d  Tag des Monats, 2-stellig mit führender Null  01 bis 31
            case 'd': return kijs.String.padding(date.getDate(), 2, '0', 'left');
            // D  Wochentag, gekürzt auf zwei Buchstaben  Mo bis So
            case 'D': return this.getWeekday(date, true);
            // j  Tag des Monats ohne führende Nullen  1 bis 31
            case 'j': return date.getDate();
            // l (kleines 'L')  Ausgeschriebener Wochentag  Montag bis Sontag
            case 'l': return this.getWeekday(date, false);

            // Monat
            // F  Monat als ganzes Wort, wie Januar bis Dezember
            case 'F': return this.getMonthName(date, false);
            // m  Monat als Zahl, mit führenden Nullen  01 bis 12
            case 'm': return kijs.String.padding(date.getMonth()+1, 2, '0', 'left');
            // M  Monatsname mit drei Buchstaben  Jan bis Dez
            case 'M': return this.getMonthName(date, true);
            // n  Monatszahl, ohne führende Nullen  1 bis 12
            case 'n': return (date.getMonth()+1);

            // Woche
            // W  ISO-8601 Wochennummer des Jahres, die Woche beginnt am Montag
            case 'W': return kijs.String.padding(this.getWeekOfYear(date), 2, '0', 'left');

            // Jahr
            // Y  Vierstellige Jahreszahl  Beispiele: 1999 oder 2003
            case 'Y': return date.getFullYear();
            // y  Jahreszahl, zweistellig  Beispiele: 99 oder 03
            case 'y': return kijs.toString(date.getFullYear()).substr(2);
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

            // Vollständige(s) Datum/Uhrzeit
            // c  ISO 8601 Datum (2011-10-05T14:48:00.000Z)
            case 'c': return date.toISOString();
            // r  Gemäß RFC 2822 formatiertes Datum (Tue Aug 19 1975 23:15:30 GMT+0200 (CEST))
            case 'r': return date.toString();
            // U  Sekunden seit Beginn der UNIX-Epoche
            case 'U': return kijs.toString(kijs.Date.unixTimestamp(date));

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
    //__scrollbarWidth {Number|null}    Damit die Funktion getScrollbarWidth() nur einmal rechnen muss,
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
                throw new kijs.Error(`Parameter "fn" can not be empty`);
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

        while (node) {
            x += node.offsetLeft - node.scrollLeft;
            y += node.offsetTop - node.scrollTop;
            node = node.offsetParent;
        }
        return {x: x,y: y, w: w, h: h};
    }

    /**
     * Gibt das erste untegeordnete Element zurück, dass Selektiert werden kann (tabIndex >= 0).
     *     undefined: nicht fokussierbar (bei undefined muss die Eigenschaft mit removeAttribute('tabIndex') entfernt werden. Sonst klappts nicht)
     *     tabIndex -1: nur via focus() Befehl fokussierbar
     *     tabIndex  0: Fokussierbar - Browser betimmt die Tabreihenfolge
     *     tabIndex >0: Fokussierbar - in der Reihenfolge wie der tabIndex
     * @param {HTMLElement} node
     * @returns {HTMLElement|null}
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
     * Entfernt alle Unterelemente eines DOM-Elements
     * @param {HTMLElement} node
     */
    static removeAllChildNodes(node) {
        while (node.hasChildNodes()) {
            node.removeChild(node.lastChild);
        }
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
        html = kijs.toString(html);

        switch (htmlDisplayType) {
            case 'code':
                this.removeAllChildNodes(node);
                node.appendChild(document.createTextNode(html));
                break;

            case 'text':
                //node.textContent = html;
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
    
};

/* global kijs */

// --------------------------------------------------------------
// kijs.Dom (Static)
// --------------------------------------------------------------
kijs.DragDrop = class kijs_DragDrop {

    // --------------------------------------------------------------
    // STATICS GETTERS
    // --------------------------------------------------------------


    // --------------------------------------------------------------
    // STATICS
    // --------------------------------------------------------------

    /**
     * Fügt dem element einen 'ddStart'-Event hinzu.
     * sofern der ddStart-Event nicht false zurückgibt, wird das DragDrop gestartet.
     * @param {kijs.Observable} element
     * @param {HTMLElement|kijs.gui.Dom} dom
     * @returns {undefined}
     */
    static addDragEvents(element, dom) {
        // Event von DOM-Element
        if (dom instanceof kijs.gui.Dom) {
            dom.on('dragStart', function(e) {
                this._onDragStart(e.nodeEvent, element, dom);
            }, this);

            dom.on('dragEnd', function(e) {
                this._onDragEnd(e.nodeEvent, element, dom);
            }, this);

        // Event von HTML-Node
        } else {
            dom.addEventListener('dragstart', this._onDragStart.bind(this, element, dom));
            dom.addEventListener('dragend', this._onDragEnd.bind(this, element, dom));
        }
    }

    /**
     * Fügt dem Element die Drop-Events hinzu, damit dieses als Drop-Zone genutzt werden kann.
     * @param {kijs.Observable} element
     * @param {HTMLElement|kijs.gui.Dom} dom
     * @returns {undefined}
     */
    static addDropEvents(element, dom) {
        // Event von DOM-Element
        if (dom instanceof kijs.gui.Dom) {
            dom.on('dragEnter', function(e) {
                this._onDragEnter(e.nodeEvent, element, dom);
            }, this);

            dom.on('dragOver', function(e) {
                this._onDragOver(e.nodeEvent, element, dom);
            }, this);

            dom.on('dragLeave', function(e) {
                this._onDragLeave(e.nodeEvent, element, dom);
            }, this);

            dom.on('drop', function(e) {
                this._onDrop(e.nodeEvent, element, dom);
            }, this);

        // Event von HTML-Node
        } else {
            dom.addEventListener('dragenter', this._onDragEnter.bind(this, element, dom));
            dom.addEventListener('dragover', this._onDragOver.bind(this, element, dom));
            dom.addEventListener('dragleave', this._onDragLeave.bind(this, element, dom));
            dom.addEventListener('drop', this._onDrop.bind(this, element, dom));
        }
    }



    // PROTECTED

    static _getDataFromNodeEvent(nodeEvent, targetElement, targetDom) {
        // eigener Transfer?
        if (nodeEvent.dataTransfer && kijs.Array.contains(nodeEvent.dataTransfer.types, 'application/kijs-dragdrop') && kijs.DragDrop._ddData) {
            kijs.DragDrop._ddData.nodeEvent = nodeEvent;
            kijs.DragDrop._ddData.targetElement = targetElement;
            kijs.DragDrop._ddData.targetDom = targetDom instanceof kijs.gui.Dom ? targetDom : null;
            kijs.DragDrop._ddData.targetNode = targetDom instanceof kijs.gui.Dom ? targetDom.node : targetDom;
            return kijs.DragDrop._ddData;

        // Anderer DragDrop (von Dateisystem etc)
        } else {
            return {
                nodeEvent       : nodeEvent,
                data            : null,
                sourceElement   : null,
                sourceDom       : null,
                sourceNode      : null,
                targetElement   : targetElement,
                targetDom       : targetDom instanceof kijs.gui.Dom ? targetDom : null,
                targetNode      : targetDom instanceof kijs.gui.Dom ? targetDom.node : targetDom,
                markTarget      : true,
                position        : {
                    allowOnto: false,
                    allowAbove: false,
                    allowBelow: false,
                    allowLeft: false,
                    allowRight: false,
                    margin: 0
                }
            };
        }
    }

    /**
     * Gibt die Seite an, an die ein element angehängt wird, wenn mit der Maus über
     * das Element gefahren wird.
     * @param {Int} w Elementbreite
     * @param {Int} h Elementhöhe
     * @param {Int} x Maus-X
     * @param {Int} y Maus-Y
     * @param {Boolean} hasOnto
     * @param {Boolean} hasAbove
     * @param {Boolean} hasBelow
     * @param {Boolean} hasLeft
     * @param {Boolean} hasRight
     * @param {Int} margin
     * @returns {String|Boolean}
     */
    static _getPosition(w, h, x, y, hasOnto, hasAbove, hasBelow, hasLeft, hasRight, margin) {
        let distToBt = h - y;
        let distToRt = w - x;
        let distToTp = y;
        let distToLt = x;

        // nur ein Wert gültig
        if (hasOnto && !hasAbove && !hasBelow && !hasLeft  && !hasRight) {
            return 'onto';
        } else if (!hasOnto && hasAbove && !hasBelow && !hasLeft  && !hasRight) {
            return 'above';
        } else if (!hasOnto && !hasAbove && hasBelow && !hasLeft  && !hasRight) {
            return 'below';
        } else if (!hasOnto && !hasAbove && !hasBelow && hasLeft  && !hasRight) {
            return 'left';
        } else if (!hasOnto && !hasAbove && !hasBelow && !hasLeft  && hasRight) {
            return 'right';
        }

        // maus auf allen achsen über margin
        if (hasOnto && distToLt > margin && distToTp > margin && distToBt > margin && distToRt > margin) {
            return 'onto';
        }

        // oberhalb?
        if (hasAbove
                && (!hasBelow || distToTp < distToBt)
                && (!hasRight || distToTp < distToRt)
                && (!hasLeft  || distToTp < distToLt)
            ) {
            return 'above';
        }

        // unterhalb?
        if (hasBelow
                && (!hasAbove || distToBt < distToTp)
                && (!hasRight || distToBt < distToRt)
                && (!hasLeft  || distToBt < distToLt)
            ) {
            return 'below';
        }

        // Links?
        if (hasLeft
                && (!hasAbove || distToLt < distToTp)
                && (!hasRight || distToLt < distToRt)
                && (!hasBelow || distToLt < distToBt)
            ) {
            return 'left';
        }

        // rechts?
        if (hasRight
                && (!hasAbove || distToRt < distToTp)
                && (!hasLeft  || distToRt < distToLt)
                && (!hasBelow || distToRt < distToBt)
            ) {
            return 'right';
        }

        return false;
    }

    /**
     * Markiert das Ziel-Element mit einem Rahmen
     * @param {Int} w
     * @param {Int} h
     * @param {Int} x
     * @param {Int} y
     * @param {String} pos
     * @returns {undefined}
     */
    static _markTargetShow(w, h, x, y, pos) {
        if (!kijs.DragDrop._ddMarker) {
            kijs.DragDrop._ddMarker = {};
            kijs.DragDrop._ddMarker.top = document.createElement('div');
            kijs.DragDrop._ddMarker.bottom = document.createElement('div');
            kijs.DragDrop._ddMarker.left = document.createElement('div');
            kijs.DragDrop._ddMarker.right = document.createElement('div');

            kijs.DragDrop._ddMarker.top.className = 'kijs-dragdrop-marker top';
            kijs.DragDrop._ddMarker.bottom.className = 'kijs-dragdrop-marker bottom';
            kijs.DragDrop._ddMarker.left.className = 'kijs-dragdrop-marker left';
            kijs.DragDrop._ddMarker.right.className = 'kijs-dragdrop-marker right';
        }

        kijs.DragDrop._ddMarker.top.style.width = w + 'px';
        kijs.DragDrop._ddMarker.top.style.left = x + 'px';
        kijs.DragDrop._ddMarker.top.style.top = (y-2) + 'px';

        kijs.DragDrop._ddMarker.bottom.style.width = w + 'px';
        kijs.DragDrop._ddMarker.bottom.style.left = x + 'px';
        kijs.DragDrop._ddMarker.bottom.style.top = (y + h) + 'px';

        kijs.DragDrop._ddMarker.left.style.height = (h+4) + 'px';
        kijs.DragDrop._ddMarker.left.style.left = (x-2) + 'px';
        kijs.DragDrop._ddMarker.left.style.top = (y-2) + 'px';

        kijs.DragDrop._ddMarker.right.style.height = (h+4) + 'px';
        kijs.DragDrop._ddMarker.right.style.left = (x + w) + 'px';
        kijs.DragDrop._ddMarker.right.style.top = (y-2) + 'px';

        if (pos === 'onto' || pos === 'above') {
            document.body.appendChild(kijs.DragDrop._ddMarker.top);
        } else if (kijs.DragDrop._ddMarker.top.parentNode === document.body) {
            document.body.removeChild(kijs.DragDrop._ddMarker.top);
        }

        if (pos === 'onto' || pos === 'below') {
            document.body.appendChild(kijs.DragDrop._ddMarker.bottom);

        } else if (kijs.DragDrop._ddMarker.bottom.parentNode === document.body) {
            document.body.removeChild(kijs.DragDrop._ddMarker.bottom);
        }

        if (pos === 'onto' || pos === 'left') {
            document.body.appendChild(kijs.DragDrop._ddMarker.left);

        } else if (kijs.DragDrop._ddMarker.left.parentNode === document.body) {
            document.body.removeChild(kijs.DragDrop._ddMarker.left);
        }

        if (pos === 'onto' || pos === 'right') {
            document.body.appendChild(kijs.DragDrop._ddMarker.right);

        } else if (kijs.DragDrop._ddMarker.right.parentNode === document.body) {
            document.body.removeChild(kijs.DragDrop._ddMarker.right);
        }
    }

    /**
     * Entfernt den Drag'n'Drop Marker
     * @returns {undefined}
     */
    static _markTargetHide() {
        if (kijs.DragDrop._ddMarker) {
            if (kijs.DragDrop._ddMarker.top.parentNode === document.body) {
                document.body.removeChild(kijs.DragDrop._ddMarker.top);
            }
            if (kijs.DragDrop._ddMarker.bottom.parentNode === document.body) {
                document.body.removeChild(kijs.DragDrop._ddMarker.bottom);
            }
            if (kijs.DragDrop._ddMarker.left.parentNode === document.body) {
                document.body.removeChild(kijs.DragDrop._ddMarker.left);
            }
            if (kijs.DragDrop._ddMarker.right.parentNode === document.body) {
                document.body.removeChild(kijs.DragDrop._ddMarker.right);
            }
        }
    }

    /**
     * Event vom Drag-Soruce
     * @param {DragEvent} nodeEvent
     * @param {kijs.Observable} element
     * @param {kijs.gui.Dom|DomNode} dom
     * @returns {undefined}
     */
    static _onDragStart(nodeEvent, element, dom) {
        // Daten für Listener vorbereiten
        kijs.DragDrop._ddData = {
            nodeEvent       : nodeEvent,
            data            : null,
            sourceElement   : element,
            sourceDom       : dom instanceof kijs.gui.Dom ? dom : null,
            sourceNode      : dom instanceof kijs.gui.Dom ? dom.node : dom,
            targetElement   : null,
            targetDom       : null,
            targetNode      : null,
            markTarget      : true,
            position        : {
                allowOnto: true,
                allowAbove: true,
                allowBelow: true,
                allowLeft: true,
                allowRight: true,
                margin: 8
            }
        };

        if (element.raiseEvent('ddStart', kijs.DragDrop._ddData)) {
            nodeEvent.dataTransfer.setData('application/kijs-dragdrop', '');

        } else {
            kijs.DragDrop._ddData = null;
        }
    }

    /**
     * Event vom Drag-Soruce
     * @param {DragEvent} nodeEvent
     * @param {kijs.Observable} element
     * @param {kijs.gui.Dom|DomNode} dom
     * @returns {undefined}
     */
    static _onDragEnd(nodeEvent, element, dom) {
        this._markTargetHide();
        kijs.DragDrop._ddData = null;
        kijs.DragDrop._ddMarker = null;
    }


    /**
     * Event vom Drag-Target
     * @param {DragEvent} nodeEvent
     * @param {kijs.Observable} element
     * @param {kijs.gui.Dom|DomNode} dom
     * @returns {undefined}
     */
    static _onDragEnter(nodeEvent, element, dom) {
        element.raiseEvent('ddEnter', this._getDataFromNodeEvent(nodeEvent, element, dom));
        nodeEvent.preventDefault();
        nodeEvent.stopPropagation();
    }

    /**
     * Event vom Drag-Target
     * @param {DragEvent} nodeEvent
     * @param {kijs.Observable} element
     * @param {kijs.gui.Dom|DomNode} dom
     * @returns {undefined}
     */
    static _onDragOver(nodeEvent, element, dom) {
        let dropData = this._getDataFromNodeEvent(nodeEvent, element, dom);
        element.raiseEvent('ddOver', dropData);

        // Falls das Element nicht gedropt werden darf, anzeigen
        if (!dropData.position.allowOnto && !dropData.position.allowAbove && !dropData.position.allowBelow
                && !dropData.position.allowLeft && !dropData.position.allowRight) {
            nodeEvent.dataTransfer.dropEffect  = 'none';
        }

        // Ziel markieren
        if (dropData.markTarget) {

            // mausposition des elements
            let absPos = kijs.Dom.getAbsolutePos(dom instanceof kijs.gui.Dom ? dom.node : dom);
            let x = nodeEvent.pageX - absPos.x, y = nodeEvent.pageY - absPos.y;


            let pos = this._getPosition(
                    absPos.w, absPos.h,
                    x, y,
                    dropData.position.allowOnto, dropData.position.allowAbove,
                    dropData.position.allowBelow, dropData.position.allowLeft,
                    dropData.position.allowRight, dropData.position.margin);

            this._markTargetShow(absPos.w, absPos.h, absPos.x, absPos.y, pos);
        }

        nodeEvent.preventDefault();
        nodeEvent.stopPropagation();
    }

    /**
     * Event vom Drag-Target
     * @param {DragEvent} nodeEvent
     * @param {kijs.Observable} element
     * @param {kijs.gui.Dom|DomNode} dom
     * @returns {undefined}
     */
    static _onDragLeave(nodeEvent, element, dom) {
        element.raiseEvent('ddLeave', this._getDataFromNodeEvent(nodeEvent, element, dom));
        this._markTargetHide();
        nodeEvent.preventDefault();
        nodeEvent.stopPropagation();
    }

    /**
     * Event vom Drag-Target
     * @param {DragEvent} nodeEvent
     * @param {kijs.Observable} element
     * @param {kijs.gui.Dom|DomNode} dom
     * @returns {undefined}
     */
    static _onDrop(nodeEvent, element, dom) {
        nodeEvent.preventDefault();
        let dropData = this._getDataFromNodeEvent(nodeEvent, element, dom);
        this._markTargetHide();

        // mausposition des elements
        let absPos = kijs.Dom.getAbsolutePos(dom instanceof kijs.gui.Dom ? dom.node : dom);
        let x = nodeEvent.pageX - absPos.x, y = nodeEvent.pageY - absPos.y;

        // position über dem Element
        dropData.position.position = this._getPosition(
                absPos.w, absPos.h,
                x, y,
                dropData.position.allowOnto, dropData.position.allowAbove,
                dropData.position.allowBelow, dropData.position.allowLeft,
                dropData.position.allowRight, dropData.position.margin);

        element.raiseEvent('ddDrop', dropData);
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
// kijs.Navigator (Static)
// --------------------------------------------------------------
/**
 * Klasse gibt Angaben zu Browser und Betriebssystem des Browsers zurück.
 */
kijs.Navigator = class kijs_Navigator {


    // --------------------------------------------------------------
    // STATIC GETTERS / SETTERS
    // --------------------------------------------------------------
    static get browser() { return kijs.Navigator.getBrowserInfo().browser; }
    static get browserVendor() { return kijs.Navigator.getBrowserInfo().browserVendor; }
    static get browserVersion() { return kijs.Navigator.getBrowserInfo().browserVersion; }

    static get isChrome() { return kijs.Navigator.getBrowserInfo().isChrome; }
    static get isChromium() { return kijs.Navigator.getBrowserInfo().isChromium; }
    static get isFirefox() { return kijs.Navigator.getBrowserInfo().isFirefox; }
    static get isEdge() { return kijs.Navigator.getBrowserInfo().isEdge; }
    static get isIE() { return kijs.Navigator.getBrowserInfo().isIE; }
    static get isSafari() { return kijs.Navigator.getBrowserInfo().isSafari; }

    static get isWindows() { return kijs.Navigator.getBrowserInfo().isWindows; }
    static get isMac() { return kijs.Navigator.getBrowserInfo().isMac; }
    static get isAndroid() { return kijs.Navigator.getBrowserInfo().isAndroid; }
    static get isIOS() { return kijs.Navigator.getBrowserInfo().isIOS; }
    static get isLinux() { return kijs.Navigator.getBrowserInfo().isLinux; }

    static get os() { return kijs.Navigator.getBrowserInfo().os; }
    static get osVendor()  { return kijs.Navigator.getBrowserInfo().osVendor; }
    static get osVersion() { return kijs.Navigator.getBrowserInfo().osVersion; }

    // --------------------------------------------------------------
    // STATICS
    // --------------------------------------------------------------

    static getBrowserInfo(userAgent=null) {
        let ua = userAgent || window.navigator.userAgent;

        // antwort aus cache
        if (userAgent === null && kijs.Navigator._bi) {
            return kijs.Navigator._bi;
        }

        let bi = {
            browserVersion: '',
            browserVendor: '',
            browser: '',
            os: '',
            osVersion: '',
            osVendor: '',
            isChrome: false,
            isChromium: false,
            isFirefox: false,
            isEdge: false,
            isIE: false,
            isSafari: false,
            isWindows: false,
            isMac: false,
            isAndroid: false,
            isIOS: false,
            isLinux: false
        };

        // Edge
        if (kijs.Navigator._browserVersion(ua, 'Edge')) {
            bi.browser = 'Edge';
            bi.browserVendor = 'Microsoft';
            bi.browserVersion = kijs.Navigator._browserVersion(ua, 'Edge');
            bi.isEdge = true;

        // Edge (Chromium)
        } else if (kijs.Navigator._browserVersion(ua, 'Edg')) {
            bi.browser = 'Edge';
            bi.browserVendor = 'Microsoft';
            bi.browserVersion = kijs.Navigator._browserVersion(ua, 'Edg');
            bi.isEdge = true;
            bi.isChromium = true;

        // Firefox
        } else if (kijs.Navigator._browserVersion(ua, 'Firefox')) {
            bi.browser = 'Firefox';
            bi.browserVendor = 'Mozilla';
            bi.browserVersion = kijs.Navigator._browserVersion(ua, 'Firefox');
            bi.isFirefox = true;

        // IE 11
        } else if (ua.match(/Trident/i) && ua.match(/rv:11/i)) {
            bi.browser = 'Internet Explorer';
            bi.browserVendor = 'Microsoft';
            bi.browserVersion = '11.0';
            bi.isIE = true;

        // Vivaldi (Chromium)
        } else if (kijs.Navigator._browserVersion(ua, 'Vivaldi')) {
            bi.browser = 'Vivaldi';
            bi.browserVendor = 'Vivaldi';
            bi.browserVersion = kijs.Navigator._browserVersion(ua, 'Vivaldi');
            bi.isChromium = true;

        // Opera (Chromium)
        } else if (kijs.Navigator._browserVersion(ua, 'Opera')) {
            bi.browser = 'Opera';
            bi.browserVendor = 'Opera';
            bi.browserVersion = kijs.Navigator._browserVersion(ua, 'Opera');
            bi.isChromium = true;

        // Samsung Browser (Chromium)
        } else if (kijs.Navigator._browserVersion(ua, 'SamsungBrowser')) {
            bi.browser = 'Internet Browser';
            bi.browserVendor = 'Samsung';
            bi.browserVersion = kijs.Navigator._browserVersion(ua, 'SamsungBrowser');
            bi.isChromium = true;

        // Chrome
        } else if (kijs.Navigator._browserVersion(ua, 'Chrome')) {
            bi.browser = 'Chrome';
            bi.browserVendor = 'Google';
            bi.browserVersion = kijs.Navigator._browserVersion(ua, 'Chrome');
            bi.isChrome = true;
            bi.isChromium = true;

        // Safari
        } else if (kijs.Navigator._browserVersion(ua, 'Safari')) {
            bi.browser = 'Safari';
            bi.browserVendor = 'Apple';
            bi.browserVersion = kijs.Navigator._browserVersion(ua, 'Version');
            if (!bi.browserVersion) {
                bi.browserVersion = kijs.Navigator._browserVersion(ua, 'Safari');
            }
            bi.isSafari = true;
        }

        // Windows
        let win = ua.match(/Windows NT ([0-9\.]+)/i);
        if (win && win[1]){
            let NtVersion = parseFloat(win[1]);
            bi.isWindows = true;
            bi.os = 'Windows';
            bi.osVendor = 'Microsoft';
            switch (NtVersion) {
                case 5.1:
                case 5.2: bi.osVersion = 'XP'; break;
                case 6.0: bi.osVersion = 'Vista'; break;
                case 6.1: bi.osVersion = '7'; break;
                case 6.2: bi.osVersion = '8'; break;
                case 6.3: bi.osVersion = '8.1'; break;
                case 6.4:
                case 10.0: bi.osVersion = '10'; break;
                default: bi.osVersion = 'NT ' + NtVersion; break;
            }
        }

        // iPad / Iphone
        if (!bi.os && ua.match(/(iPad|iPhone|iPod)/i)) {
            bi.isIOS = true;
            bi.os = ua.match(/iPad/i) ? 'iPadOS' : 'iOS';
            bi.osVendor = 'Apple';
            let os = ua.match(/OS ([0-9_]+)/i);
            if (os) {
                bi.osVersion = kijs.String.replaceAll(os[1], '_', '.');
            }
        }

        // Mac
        if (!bi.os && ua.match(/Macintosh/i)) {
            bi.isMac = true;
            bi.os = 'macOS';
            bi.osVendor = 'Apple';
            let os = ua.match(/OS (?:X )?([0-9_]+)/i);
            if (os) {
                bi.osVersion = kijs.String.replaceAll(os[1], '_', '.');
            }
        }

        // Android
        if (!bi.os && ua.match(/Android/i)) {
            bi.isAndroid = true;
            bi.os = 'Android';
            bi.osVendor = 'Google';
            let os = ua.match(/Android ([0-9\.]+)/i);
            if (os) {
                bi.osVersion = os[1];
            }
        }

        // Linux
        if (!bi.os && ua.match(/Linux/i)) {
            bi.isLinux = true;
            bi.os = 'Linux';
            let os = ua.match(/rv:([0-9\.]+)/i);
            if (os) {
                bi.osVersion = os[1];
            }
        }

        // Speichern für schnellerer Zugriff
        if (userAgent === null) {
            kijs.Navigator._bi = bi;
        }

        return bi;
    }

    static _browserVersion(ua, browser) {
        let re = new RegExp(browser + '/([0-9\\.]+)', 'i');
        let match = ua.match(re);

        if (match && match[1]) {
            return match[1];
        }
        return '';
    }
};
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

        // Bei decimals==='' oder null automatisch die Anzahl Kommastellen ermitteln
        if (decimals==='' || decimals===null) {
            let tmp = kijs.toString(number).split('.');
            if (tmp.length > 1) {
                decimals = tmp[1].length;
            } else {
                decimals = 0;
            }
        } else {
            decimals = Number(decimals);
        }

        // Zahl auf gegebene Präzision runden und in Array wandeln.
        let tmp = kijs.toString(Math.abs(kijs.Number.round(number, decimals))).split('.');

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


        // Negative Nummer
        if (kijs.Number.round(number, decimals) < 0) {
            ret = '-' + ret;
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
        return Number(Math.round(number + 'e' + precision) + 'e-' + precision);
    }

    /**
     * Rundet eine Zahl auf eine angegebene Präzision
     * @param {Number} number
     * @param {Number} roundTo Auf 5er Runden:0.05 auf 10er Runden:0.1 auf Franken:1
     * @returns {Number}
     */
    static roundTo(number, roundTo=0) {
        if (roundTo > 0) {
            return kijs.Number.round(number/roundTo) * roundTo;
        } else {
            return kijs.Number.round(number);
        }
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
                // Bei unbekannten Config-Eigenschaften kein Fehler ausgeben (wird bei der Zuweisung der defaults vom ki.gui.Container verwendet)
                if (config.skipUnknownConfig || cfgKey === 'skipUnknownConfig') {
                    return;
                } else {
                    throw new kijs.Error(`Unkown config "${cfgKey}"`);
                }
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
                throw new kijs.Error(`Unkown format on configMap "${cfgKey}"`);
                
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
                            throw new kijs.Error(`config "${cfg.key}" is not an object`);
                        }
                    } else {
                        if (kijs.isObject(cfg.value)) {
                            cfg.context[cfg.target] = cfg.value;
                        } else if (cfg.value) {
                            throw new kijs.Error(`config "${cfg.key}" is not an object`);
                        }
                    }
                    break;
                
                // Objekt mergen (ganze Hierarchie)
                case 'assignDeep':
                    if (kijs.isObject(cfg.context[cfg.target])) {
                        if (kijs.isObject(cfg.value)) {
                            kijs.Object.assignDeep(cfg.context[cfg.target], cfg.value);
                        } else if (cfg.value) {
                            throw new kijs.Error(`config "${cfg.key}" is not an object`);
                        }
                    } else {
                        if (kijs.isObject(cfg.value)) {
                            cfg.context[cfg.target] = cfg.value;
                        } else if (cfg.value) {
                            throw new kijs.Error(`config "${cfg.key}" is not an object`);
                        }
                    }
                    break;

                // Listeners des "on"-Objekts mergen
                case 'assignListeners':
                    if (kijs.isObject(cfg.value)) {
                        for (let k in cfg.value) {
                            if (k !== 'context') {
                                if (!kijs.isFunction(cfg.value[k])) {
                                    throw new kijs.Error('Listener "' + k + '" ist not a function.');
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
                        throw new kijs.Error(`config "${cfg.key}" is not a function`);
                    }
                    break;

                // Zuweisung der Eigenschaft verbieten: Fehler ausgeben
                case 'error':
                    throw new kijs.Error(`Assignment of config "${cfg.key}" is prohibited`);
                    break;

            }
        }, this);
        tmpConfigs = null;
    }
    
    /**
    * Kopiert alle Eigenschaften des source-Objekts in das target-Objekt (rekursiv)
    * @param {Object} target Ziel-Objekt
    * @param {Object} source Quell-Objekt
    * @param {boolean} [overwrite=true] Sollen bereits existierende Objekte überschrieben werden?
    * @return {Object} Erweiteres Ziel-Objekt
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
// kijs.Observable (Abstract)
// --------------------------------------------------------------
kijs.Observable = class kijs_Observable {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor() {
        this._nodeEventListeners = {};
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
    // GETTERS / SETTERS
    // --------------------------------------------------------------

    /**
     * Gibt den Namen der Javascript-Klasse zurück
     * @returns {String|null}
     */
    get jsClassName() {
        if (kijs.isString(this.constructor.name)) {
            return kijs.String.replaceAll(this.constructor.name, '_', '.');
        }

        return null;
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
     * @param {Object} context - Kontext für die Callback-Funktion
     * @returns {undefined}
     */
    on(names, callback, context) {

        if (!kijs.isString(names) && !kijs.isArray(names)) {
            throw new kijs.Error(`invalid argument 1 for on(names, callback, context): string or array expected`);
        }
        if (!kijs.isFunction(callback)) {
            throw new kijs.Error(`invalid argument 2 for on(names, callback, context): function expected`);
        }

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
     * @param {Object} context - Kontext für die Callback-Funktion
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
     * @param {String} [name] - Name des Events oder leer um alle Events auszulösen
     * @param {Mixed} [args] - beliebig viele Argumente, die dem Event übergeben werden
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
        this._parameters = {};              // Objekt mit optionalem GET-Parametern
        this._defer = 10;
        this._timeout = 0;

        this._deferId = null;
        this._queue = null;
        this._tid = 0;

        this._queue = [];

        // Mapping für die Zuweisung der Config-Eigenschaften
        this._configMap = {
            defer: true,        // millisekunden, in denen auf weitere RPC gewartet wird
            timeout: true,      // millisekunden, nach denenen der RPC abgebrochen wird
            url: true,          // server URL
            parameters: true    // optionale GET-Parameter
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
    get defer() { return this._defer; }
    set defer(val) { this._defer = val; }

    get url() { return this._url; }
    set url(val) { this._url = val; }

    get timeout() { return this._timeout; }
    set timeout(val) { this._timeout = parseInt(val); }

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
     * @param {String} facadeFn                     Modul/Facaden-name und Methodenname Bsp: 'address.save'
     * @param {Mixed} requestData                   Argumente/Daten, die an die Server-RPC Funktion übergeben werden.
     * @param {Function} fn                         Callback-Funktion
     * @param {Object} context                      Kontext für die Callback-Funktion
     * @param {Boolean} [cancelRunningRpcs=false]   Bei true, werden alle laufenden Requests an die selbe facadeFn abgebrochen
     * @param {Object} [rpcParams]                  Hier können weitere Argumente, zum Datenverkehr (z.B. ignoreWarnings)
     * @param {Mixed} [responseArgs]                Hier können Daten übergeben werden,
     *                                              die in der Callback-Fn dann wieder zur Verfügung stehen.
     *                                              z.B. die loadMask, damit sie in der Callback-FN wieder entfernt werden kann.
     * @returns {undefined}
     */
    do(facadeFn, requestData, fn, context, cancelRunningRpcs, rpcParams, responseArgs) {
        if (!facadeFn) {
            throw new kijs.Error('RPC call without facade function');
        }
        if (this._deferId) {
            clearTimeout(this._deferId);
        }

        if (cancelRunningRpcs) {
            for (let i=0; i<this._queue.length; i++) {
                if (this._queue[i].facadeFn === facadeFn && this._queue[i].context === context && this._queue[i].fn === fn) {
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
            requestData: requestData,
            type: 'rpc',
            tid: this._createTid(),
            fn: fn,
            context: context,
            rpcParams: rpcParams,
            responseArgs: responseArgs,
            state: kijs.Rpc.states.QUEUE
        });

        this._deferId = kijs.defer(this._transmit, this.defer, this);
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
     * @param {Number} tid
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
            let subResponse = kijs.isArray(response) ? response[i] : null;

            // Passenden subRequest aus Queue holen
            let subRequest = this._getByTid(request.postData[i].tid);

            if (!kijs.isObject(subResponse)) {
                subResponse = {
                    errorMsg: 'RPC-Antwort im falschen Format'
                };
            }

            // Behandlung von Übertragungsfehlern
            if (errorMsg) {
                subResponse.errorMsg = errorMsg;
            }
            if (!subResponse.errorMsg && subResponse.tid !== subRequest.tid) {
                subResponse.errorMsg = 'Die RPC-Antwort passt nicht zum Request';
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
                subRequest.requestData = this._queue[i].requestData;
                subRequest.type = this._queue[i].type;
                subRequest.tid = this._queue[i].tid;

                transmitData.push(subRequest);
                this._queue[i].state = kijs.Rpc.states.TRANSMITTED;
            }
        }

        if (transmitData.length > 0) {
            kijs.Ajax.request({
                method      : 'POST',
                headers     : {'X-LIBRARY': 'kijs'},
                postData    : transmitData,
                url         : this.url,
                parameters  : this._parameters,
                fn          : this._receive,
                context     : this,
                timeout     : this.timeout
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
        this._parameters = null;
        this._queue = null;
    }
};
/* global kijs */

// --------------------------------------------------------------
// kijs.Storage (Static)
// --------------------------------------------------------------
/**
 * Klasse zum Lesen und Schreiben in den Local- oder Sessionstorage.
 * Damit keine Konflikte entstehen, wenn mehrere KIJS-Frameworks unter
 * der selben Domain laufen, wird standardmässig der Titel der Webseite
 * als prefix verwendet. Wenn dieses nicht sein soll, kann als argument
 * ein anderes Prefix übergeben werden.
 */
kijs.Storage = class kijs_Storage {


    // --------------------------------------------------------------
    // STATICS
    // --------------------------------------------------------------

    /**
     * Liest einen Wert aus dem Storage.
     * @param {String} key
     * @param {String} [mode]                  'local' für LocalStorage oder 'session' für SessionStorage
     * @param {Boolean|String} [keyPrefix]     individuelles prefix, falls nicht der titel verwendet werden soll.
     * @returns {Mixed}
     */
    static getItem(key, mode='local', keyPrefix=true) {
        let prefix = kijs.Storage._getPrefix(keyPrefix),
                storage = kijs.Storage._getStorage(mode);
        try {
            if (!storage) {
                return false;
            }

            let val = storage.getItem(prefix + key);
            if (val) {
                val = JSON.parse(val);
                if (val && kijs.isObject(val) && val.value !== undefined) {
                    return val.value;
                }
            }
            return null;

        } catch (e) {
            return false;
        }
    }

    /**
     * Gibt alle gespeicherten Schlüssel in einem Array zurück
     * @param {String} [mode]                  'local' für LocalStorage oder 'session' für SessionStorage
     * @param {Boolean|String} [keyPrefix]     individuelles prefix, falls nicht der titel verwendet werden soll.
     * @returns {Array}
     */
    static getKeys(mode='local', keyPrefix=true) {
        let prefix = kijs.Storage._getPrefix(keyPrefix),
                storage = kijs.Storage._getStorage(mode);
        try {
            if (!storage || !storage.key) {
                return false;
            }
            let keys = [], i, k;
            for (i=0; i< storage.length; i++) {
                k = storage.key(i);
                if (k && k.substr(0, prefix.length) === prefix) {
                    keys.push(k.substr(prefix.length));
                }
            }
            return keys;

        } catch (e) {
            return false;
        }
    }

    /**
     * Löscht alle Elemente aus dem localStorage.
     * @param {String} [mode]                  'local' für LocalStorage oder 'session' für SessionStorage
     * @param {Boolean|String} [keyPrefix]     individuelles prefix, falls nicht der titel verwendet werden soll.
     * @returns {Boolean}
     */
    static removeAll(mode='local', keyPrefix=true) {
        let keys = kijs.Storage.getKeys(mode, keyPrefix);

        if (keys === false) {
            return false;
        }

        for (let i=0; i<keys.length; i++) {
            kijs.Storage.removeItem(keys[i], mode, keyPrefix);
        }
        return true;
    }

    /**
     * Löscht ein Wert aus dem LocalStorage.
     * @param {String} key
     * @param {String} [mode]                  'local' für LocalStorage oder 'session' für SessionStorage
     * @param {Boolean|String} [keyPrefix]     individuelles prefix, falls nicht der titel verwendet werden soll.
     * @returns {Boolean}
     */
    static removeItem(key, mode='local', keyPrefix=true) {
        let prefix = kijs.Storage._getPrefix(keyPrefix),
                storage = kijs.Storage._getStorage(mode);
        try {
            if (!storage) {
                return false;
            }
            storage.removeItem(prefix + key);

        } catch (e) {
            return false;
        }
    }

    /**
     * Speichert einen Wert im LocalStorage.
     * @param {String} key
     * @param {Mixed} value
     * @param {String} [mode]                  'local' für LocalStorage oder 'session' für SessionStorage
     * @param {Boolean|String} [keyPrefix]     individuelles prefix, falls nicht der titel verwendet werden soll.
     * @returns {Boolean}
     */
    static setItem(key, value, mode='local', keyPrefix=true) {
        let prefix = kijs.Storage._getPrefix(keyPrefix),
                storage = kijs.Storage._getStorage(mode);
        try {
            if (!storage || !storage.setItem) {
                return false;
            }
            storage.setItem(prefix + key, JSON.stringify({value: value}));
            return true;

        } catch (e) {
            return false;
        }
    }

    /**
     * Aktualisiert ein Objekt im LocalStorage
     * @param {String} key
     * @param {Object} value
     * @param {String} [mode]                  'local' für LocalStorage oder 'session' für SessionStorage
     * @param {Boolean|String} [keyPrefix]     individuelles prefix, falls nicht der titel verwendet werden soll.
     * @returns {Boolean}
     */
    static updateItem(key, value, mode='local', keyPrefix=true) {
        if (!kijs.isObject(value)) {
            return false;
        }
        
        let oldValue = kijs.Storage.getItem(key, mode, keyPrefix);
        if (!kijs.isObject(oldValue)) {
            oldValue = {};
        }

        // update
        for (let k in value) {
            oldValue[k] = value[k];
        }

        return kijs.Storage.setItem(key, oldValue, mode, keyPrefix);
    }

    // --------------------------------------------------------------
    // PROTECTED STATICS
    // --------------------------------------------------------------

    /**
     * Gibt die instanz auf den Storage zurück.
     * @returns {window.localStorage|window.sessionStorage}
     */
    static _getStorage(mode) {
        if (!kijs.Array.contains(['session', 'local'], mode)) {
            throw new kijs.Error('invalid storage mode');
        }
        return mode === 'session' ? window.sessionStorage : window.localStorage;
    }

    /**
     * Gibt das Prefix zurück
     * @param {String|Boolean} prefix
     * @returns {String}
     */
    static _getPrefix(pref) {
        let prefix = 'kijs-';
        if (pref === true && document.title) {
            prefix += document.title.toLowerCase().replace(/[^a-z0-9]/, '') + '-';
        } else if (kijs.isString(pref) && pref) {
            prefix += pref + '-';
        }
        return prefix;
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
     * Konvertiert einen HTML-String in einen String, in dem die HTML-Zeichen als Unicode eingebunden sind
     * Es werden folgende Zeichen ersetzt
     *  - Unicode 00A0 - 9999
     *  - < und >
     *  - &
     *  - "
     *  - '
     * Beispiel: '<p>Test</p>' => '&#60;p&#62;Test&#60;/p&#62;'
     * @param {String} html
     * @returns {String}
     */
    static htmlentities(html) {
        return kijs.toString(html).replace(/[\u00A0-\u9999<>\&\'\"]/gim, function(i) {
            return '&#x' + i.codePointAt(0).toString(16) + ';';
        });
    }

    /**
     * Konvertiert einen HTML-String in einen String, in dem die HTML-Entities als Unicode ersetzt sind
     * @param {String} html
     * @returns {String}
     */
    static htmlentities_decode(html) {
        return kijs.toString(html).replace(/&#(x[0-9a-f]+|[0-9]+)(;|$)/gim, function(entity, number) {
            let nr = null;
            if (number.substr(0,1).toLowerCase() === 'x') {
                nr = window.parseInt(number.substr(1), 16);
            } else {
                nr = window.parseInt(number, 10);
            }

            if (kijs.isNumber(nr)) {
                return String.fromCodePoint(nr);
            } else {
                return entity;
            }
        });
    }

    /**
     * Wandelt Sonderzeichen in HTML-Codes um
     * @param {String}  text           Die zu konvertierende Zeichenkette.
     * @param {Boolean} [doubleEncode] Wird der Parameter doubleEncode ausgeschaltet,
     *                                 kodiert es bereits existierende HTML-Entities
     *                                 nicht noch einmal. Standardmässig werden
     *                                 jedoch alle Zeichen konvertiert.
     * @returns {String}
     */
    static htmlspecialchars(text, doubleEncode=true) {
        let replaces = [
            {f:'&', t: '&amp;'},
            {f:'"', t: '&quot;'},
            {f:'\'', t: '&apos;'},
            {f:'<', t: '&lt;'},
            {f:'>', t: '&gt;'}
        ];

        if (!doubleEncode) {
            kijs.Array.each(replaces, function(replace) {
                text = kijs.String.replaceAll(text, replace.t, replace.f);
            }, this);
        }

        kijs.Array.each(replaces, function(replace) {
            text = kijs.String.replaceAll(text, replace.f, replace.t);
        }, this);

        return text;
    }

    /**
     * Ergänzt eine Zahl mit vorangestellten Nullen
     * @param {String} text
     * @param {Number} length
     * @param {String} [padString=' ']
     * @param {String} [type='right'] 'left', 'right' oder 'both'
     * @returns {String}
     */
    static padding(text, length, padString=' ', type='right') {
        length = length || 0;
        text = kijs.toString(text);
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
     * Maskiert Zeichen regulärer Ausdrücke
     * @param {String} text
     * @returns {String}
     */
    static regexpEscape(text) {
        return kijs.toString(text).replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&');
    }

    /**
     * Wiederholt einen String.
     * Gibt text multiplier mal wiederholt zurück.
     * @param {String} text
     * @param {Number} multiplier
     * @returns {String}
     */
    static repeat(text, multiplier) {
        let response = '';
        for (let i=0; i<multiplier; i++) {
            response += kijs.toString(text);
        }
        return response;
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
     * Kürzt eine Zeichenkette auf eine maximale Länge und fügt ein "…"-Zeichen an
     * @param {String} text
     * @param {Number} length maximlae Länge
     * @param {boolean} [useWordBoundary=false] Nur bei Leerzeichen abschneiden
     * @param {String} [postFixChar='…'] Zeichen, dass beim Abschneiden angehängt wird
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
     * @param {String} text
     * @param {Number} length Anzahl Zeichen pro Zeile
     * @param {boolean} [useWordBoundary=true] Nur bei Leerzeichen Umbrüche einfügen
     * @returns {String}
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
// kijs.gui (Static)
// --------------------------------------------------------------
kijs.gui = class kijs_gui {
    
    
    // --------------------------------------------------------------
    // STATICS
    // --------------------------------------------------------------
    /**
     * Erstellt einen Namespace
     * @param {String} xtype    Beispiel: 'kijs.gui.Element'
     * @returns {kijs.gui.Element|null}
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
     * @returns {kijs.gui.Element|null}
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
            throw new kijs.Error(`element is duplicated in layermanager`);
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
                    caption: kijs.getText('OK'),
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
                    caption: kijs.getText('Ja')
                },{
                    name: 'no',
                    caption: kijs.getText('Nein')
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
                    caption: kijs.getText('OK'),
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
                    caption: kijs.getText('OK'),
                    isDefault: true
                }
            ]
        });
    }
    
    /**
     * Zeigt ein Eingabefenster mit OK/Abbrechen-Schaltflächen und einem Achtung-Symbol
     * @param {String} caption
     * @param {String} msg
     * @param {String} label
     * @param {String} value
     * @param {Function} fn
     * @param {Object} context
     * @returns {undefined}
     */
    static prompt(caption, msg, label, value, fn, context) {
        if (kijs.isArray(msg)) {
            msg = this._convertArrayToHtml(msg);
        }

        this.show({
            caption: caption,
            msg: msg,
            
            fieldXtype: 'kijs.gui.field.Text',
            label: label,
            value: value, 
            
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
                    name: 'ok',
                    caption: kijs.getText('OK'),
                    isDefault: true
                },{
                    name: 'cancel',
                    caption: kijs.getText('Abbrechen')
                }
            ]
        });
    }
    
    /**
     * Zeigt ein individuelles Meldungsfenster
     * Beispiel config:
     * config = {
     *     caption: 'Testmeldung',
     *     msg: 'Hallo Welt!',
     *     
     *     // Falls ein Input gewünscht wird, können noch folgende Eigenschaften verwendet werden:
     *     fieldXtype: 'kijs.gui.field.Text',
     *     label: 'Wert',
     *     value: 'Mein Testwert', 
     *     
     *     fn: function(e, el) {
     *         alert('Es wurde geklickt auf: ' + e.btn);
     *     },
     *     context: this,
     *     iconChar: '',
     *     icon: {
     *         iconChar: '&#xf071',
     *         style: {
     *             color: '#ff9900'
     *         }
     *     },
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
        let value = null;
        const elements = [];
        const footerElements = [];

        // Icon
        if (config.icon) {
            if (!(config.icon instanceof kijs.gui.Icon)) {
                config.icon.xtype = 'kijs.gui.Icon';
            }
            elements.push(config.icon);
        }
        
        if (config.fieldXtype) {
            // Beschrieb und Textfeld
            elements.push({
                xtype: 'kijs.gui.Container',
                htmlDisplayType: 'html',
                cls: 'kijs-msgbox-inner',
                elements:[
                    {
                        xtype: 'kijs.gui.Element',
                        html: config.msg,
                        htmlDisplayType: 'html',
                        style: {
                            marginBottom: '4px'
                        }
                    },{
                        xtype: config.fieldXtype,
                        name: 'field',
                        label: config.label,
                        value: config.value,
                        labelStyle: {
                            marginRight: '4px'
                        },
                        on: {
                            enterPress: function(e) {
                                if (config.fieldXtype) {
                                    btn = 'ok';
                                    value = e.element.upX('kijs.gui.Window').down('field').value;
                                    e.element.upX('kijs.gui.Window').destruct();
                                }
                            },
                            context: this
                        }
                    }
                ]
            });
            
        } else {
            // Text
            elements.push({
                xtype: 'kijs.gui.Element',
                html: config.msg,
                htmlDisplayType: 'html',
                cls: 'kijs-msgbox-inner'
            });

        }

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
                        if (config.fieldXtype) {
                            value = this.upX('kijs.gui.Window').down('field').value;
                        }
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
                e.value = value;
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
                    caption: kijs.getText('OK'),
                    isDefault: true
                },{
                    name: 'cancel',
                    caption: kijs.getText('Abbrechen')
                }
            ]
        });
    }


    // PROTECTED
    static _convertArrayToHtml(messages) {
        if (messages.length === 1) {
            return messages[0];
        }

        let ret = '<ul>';
        kijs.Array.each(messages, function(msg) {
            ret += '<li>' + msg + '</li>';
        }, this);
         ret += '</ul>';
        return ret;
    }

};
/* global kijs */

// --------------------------------------------------------------
// kijs.gui (Static)
// --------------------------------------------------------------
kijs.gui.field = class kijs_gui_field {
    
};

/* global kijs */

// --------------------------------------------------------------
// kijs.gui.grid (Static)
// --------------------------------------------------------------
kijs.gui.grid = class kijs_gui_grid {

};

/* global kijs */

// --------------------------------------------------------------
// kijs.gui.grid.cell (Static)
// --------------------------------------------------------------
kijs.gui.grid.cell = class kijs_gui_grid_cell {

};

/* global kijs */

// --------------------------------------------------------------
// kijs.gui.grid.column (Static)
// --------------------------------------------------------------
kijs.gui.grid.columnConfig = class kijs_gui_grid_columnConfig {

};

/* global kijs */

// --------------------------------------------------------------
// kijs.gui.grid.filter (Static)
// --------------------------------------------------------------
kijs.gui.grid.filter = class kijs_gui_grid_filter {

};

/* global kijs, this */

// --------------------------------------------------------------
// kijs.FileUpload
// --------------------------------------------------------------

/**
 * Die Klasse öffnet ein Fenster zum Auswählen einer Datei zum Upload
 * oder nimmt die Datei über eine Dropzone entgegen. Nach Auswahl wird
 * die Datei an den Server gesendet.
 *
 *  * EVENTS
 * ----------
 * failUpload   -- MIME nicht erlaubt
 * startUpload  -- Upload wird gestartet
 * progress     -- Fortschritt beim Upload
 * upload       -- Upload abgeschlossen
 * endUpload    -- alle Uploads in der Schlange abgeschlossen
 *
 */
kijs.FileUpload = class kijs_FileUpload extends kijs.Observable {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        this._ajaxUrl = 'index.php';
        this._contentTypes = [];
        this._currentUploadIds = [];
        this._directory = false;
        this._dropZones = [];
        this._maxFilesize = null;
        this._multiple = true;
        this._sanitizeFilename = false;
        this._uploadId = 1;
        this._uploadResponses = {};

        this._filenameHeader = 'X-Filename';
        this._pathnameHeader = 'X-Filepath';

        this._validMediaTypes = [
            'application',
            'audio',
            'example',
            'image',
            'message',
            'model',
            'multipart',
            'text',
            'video'
        ];

        // Standard-config-Eigenschaften mergen
        config = Object.assign({}, {
            // keine
        }, config);

        // Mapping für die Zuweisung der Config-Eigenschaften
        this._configMap = {
            ajaxUrl: true,
            directory: { target: 'directory' },
            multiple: { target: 'multiple' },
            filenameHeader: true,
            pathnameHeader: true,
            maxFilesize: true,
            sanitizeFilename: true,
            dropZones: { target: 'dropZone' },
            contentTypes: { target: 'contentTypes' }
        };

        // Config anwenden
        if (kijs.isObject(config)) {
            this.applyConfig(config, true);
        }
    }


    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------


    get contentTypes() { return this._contentTypes; }
    set contentTypes(val) {
        if (!kijs.isArray(val)) {
            val = [val];
        }

        this._contentTypes = [];

        // prüfen, ob der media-type gültig ist.
        kijs.Array.each(val, function(contentType) {
            let parts = contentType.toLowerCase().split('/', 2);
            if (!kijs.Array.contains(this._validMediaTypes, parts[0])) {
                throw new kijs.Error('invalid content type "' + contentType + '"');
            }
            if (parts.length === 1) {
                parts.push('*');
            }
            this._contentTypes.push(parts.join('/'));
        }, this);
    }

    get dropZones() { return this._dropZones; }
    set dropZones(val) { this.bindDropZones(val); }

    get directory() { return this._directory; }
    set directory(val) { this._directory = !!val && this._browserSupportsDirectoryUpload(); }

    get multiple() { return this._multiple; }
    set multiple(val) { this._multiple = !!val; }

    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------

    /**
     * Verbindet eine Dropzone mit dem FileUpload. Wird eine
     * Datei auf die Dropzone gezogen, wird sie mit der Upload-Funktion
     * von dieser Klasse hochgeladen.
     * @param {kijs.gui.DropZone|Array} dropZones
     * @returns {undefined}
     */
    bindDropZones(dropZones) {
        if (!kijs.isArray(dropZones)) {
            dropZones = [dropZones];
        }
        kijs.Array.each(dropZones, function(dropZone) {
            if (!(dropZone instanceof kijs.gui.DropZone)) {
                throw new kijs.Error('added zone not of type kijs.gui.DropZone');
            }

            // hinzufügen falls noch nicht da.
            if (!kijs.Array.contains(this._dropZones, dropZone)) {

                // Events entfernen und wieder setzen.
                dropZone.off(null, null, this);
                dropZone.on('drop', this._onDropZoneDrop, this);
                this._dropZones.push(dropZone);
            }
        }, this);
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
     * Zeit den "Datei öffnen" Dialog vom Browser an.
     * @param {Boolean} [multiple] Dürfen mehrere Dateien ausgewählt werden?
     * @param {Boolean} [directory] Soll statt einer Datei ein ganzer Ordner hochgeladen werden?
     * @returns {undefined}
     */
    showFileOpenDialog(multiple=null, directory=null) {
        multiple = multiple === null ? this._multiple : multiple;
        directory = directory === null ? this._directory : directory;

        let input = document.createElement('input');
        input.setAttribute('type', 'file');
        if (multiple) {
            input.setAttribute('multiple', 'multiple');
        }
        if (directory) {
            input.setAttribute('directory', 'directory');
            input.setAttribute('webkitdirectory', 'webkitdirectory');
            input.setAttribute('mozdirectory', 'mozdirectory');
        }
        if (this._contentTypes.length > 0) {
            input.setAttribute('accept', this._contentTypes.join(','));
        }

        kijs.Dom.addEventListener('change', input, function(e) {
            if (e.nodeEvent.target && e.nodeEvent.target.files) {
                this._uploadFiles(e.nodeEvent.target.files);
            }
        }, this);

        // öffnen
        input.click();
    }

    // PROTECTED
    /**
     * Prüft, ob der Browser das hochladen von ganzen Ordner unterstützt.
     * @returns {Boolean}
     */
    _browserSupportsDirectoryUpload() {
        let uploadEl = document.createElement('input'), support = false;
        uploadEl.setAttribute('type', 'file');
        uploadEl.setAttribute('multiple', 'multiple');

        if (kijs.isBoolean(uploadEl.webkitdirectory) || kijs.isBoolean(uploadEl.directory)) {
            support = true;
        }
        uploadEl = null;
        return support;
    }

    /**
     * Prüft, ob der übergebene MIME type einem der erlaubten MIME entspricht
     * @param {String} mime
     * @returns {Boolean}
     */
    _checkMime(mime) {
        let match=false;
        if (mime && this._contentTypes.length > 0) {
            mime = mime.toLowerCase();
            let mimeParts = mime.split('/', 2);

            kijs.Array.each(this._contentTypes, function(contentType) {
                if (mime === contentType || contentType === mimeParts[0] + '/*') {
                    match = true;
                }
            }, this);
        }
        
        return match;
    }

    _getFilename(filename) {
        if (this._sanitizeFilename) {
            filename = kijs.Char.replaceSpecialChars(filename);
            let filenameParts = filename.split('.'), extension = '';
            if (filenameParts.length > 1) {
                extension = filenameParts.pop().replace(/[^a-zA-Z0-9]/g, '');
            }
            filename = filenameParts.join('_').replace(/[^a-zA-Z0-9\-]/g, '_');

            if (extension) {
                filename += '.' + extension;
            }
        }

        return filename;
    }

    _onDropZoneDrop(e) {
        this._uploadFiles(e.nodeEvent.dataTransfer.files);
    }

    _uploadFiles(fileList) {
        this._uploadResponses = {};
        if (fileList) {
            for (let i=0; i<fileList.length; i++) {
                if (this._checkMime(fileList[i].type)) {
                    this._uploadFile(fileList[i]);
                } else {
                    this.raiseEvent('failUpload', this, this._getFilename(fileList[i].name), fileList[i].type);
                }
            }
        }
    }

    _uploadFile(file) {
        let uploadId = this._uploadId++,
            headers = {},
            filename = this._getFilename(file.name),
            filedir = this._getRelativeDir(file.name, file.relativePath || file.webkitRelativePath),
            filetype = file.type || 'application/octet-stream';

        headers[this._filenameHeader] = filename;
        headers[this._pathnameHeader] = filedir;
        headers['Content-Type'] = filetype;

        kijs.Ajax.request({
            url: this._ajaxUrl,
            method: 'POST',
            format: 'json',
            headers: headers,
            postData: file,
            fn: this._onEndUpload,
            progressFn: this._onProgress,
            context: this,
            uploadId: uploadId
        });

        this._currentUploadIds.push(uploadId);
        this.raiseEvent('startUpload', this, filename, filedir, filetype, uploadId);
    }

    _onEndUpload(val, config, error) {
        kijs.Array.remove(this._currentUploadIds, config.uploadId);

        // Fehlermeldung vom server
        if (!val || !val.success) {
            error = error || val.msg || kijs.getText('Es ist ein unbekannter Fehler aufgetreten') + '.';
        }

        // Antwort vom Server
        let uploadResponse = val ? (val.upload || null) : null;

        // Responses in Objekt sammeln
        this._uploadResponses[config.uploadId] = uploadResponse;

        // Event werfen
        this.raiseEvent('upload', this, uploadResponse, error, config.uploadId);

        // wenn alle laufenden Uploads abgeschlossen sind, endUpload ausführen.
        if (this._currentUploadIds.length === 0) {
            this.raiseEvent('endUpload', this, this._uploadResponses);
        }
    }

    _onProgress(e, config) {
        let percent = null;

        if (e.lengthComputable && e.total > 0) {
            percent = Math.round(100 / e.total * e.loaded);
            percent = Math.min(100, Math.max(0, percent)); // Wert zwischen 0-100
        }

        this.raiseEvent('progress', this, e, config.uploadId, percent);
    }


    /**
     * Schneidet den Dateinamen vom Pfad ab,
     * gibt das Verzeichnis zurück.
     * @param {String} name
     * @param {String} path
     * @returns {String}
     */
    _getRelativeDir(name, path) {
        if (path && path.substr(path.length - name.length) === name) {
            return path.substr(0, path.length - name.length - 1);
        }
        return '';
    }



    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------

    destruct() {
        this._dropZones = null;
        this._contentTypes = null;
        super.destruct();
    }
};
/* global kijs, this, HTMLElement */

// --------------------------------------------------------------
// kijs.gui.ApertureMask
// --------------------------------------------------------------
// Halbtransparente Maske mit einem Ausschnitt für ein Element,
// das unmaskiert bleibt.
// Das Element, dass nicht überdeckt wird, wird mit der Eigenschaft target festgelegt.
// Der Rest des Bildschirms wird von der Maske überdeckt und kann nicht mehr bedient werden.

kijs.gui.ApertureMask = class kijs_gui_ApertureMask extends kijs.Observable {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);
        
        this._targetEl = null;
        this._targetDom = null;
        this._animated = true;

        this._topDom = new kijs.gui.Dom({cls:['kijs-aperturemask', 'top']});
        this._rightDom = new kijs.gui.Dom({cls:['kijs-aperturemask', 'right']});
        this._leftDom = new kijs.gui.Dom({cls:['kijs-aperturemask', 'left']});
        this._bottomDom = new kijs.gui.Dom({cls:['kijs-aperturemask', 'bottom']});

        // Mapping für die Zuweisung der Config-Eigenschaften
        this._configMap = {
            animated: true,
            cls: { fn: 'function', target: this.clsAdd },
            target: {target: 'target'}
        };

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }

        // window onResize überwachen
        kijs.Dom.addEventListener('resize', window, this._onWindowResize, this);
    }


    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------

    get isRendered() { return !!this._topDom.isRendered; }

    get targetDom() { return this._targetDom; }
    set target(val) {

        // Listeners entfernen
        if (this._targetEl) {
            this._targetEl.off(null, null, this);
        }

        // Element übergeben: Grösse überwachen
        if (val instanceof kijs.gui.Element) {
            this._targetEl = val;
            this._targetDom = val.dom;

            this._targetEl.on('afterResize', this._onAfterResize, this);

        } else if (val instanceof kijs.gui.Dom) {
            this._targetEl = null;
            this._targetDom = val;

        } else {
            throw new kijs.Error('invalid element for kijs.gui.ApertureMask target');
        }
    }

    get visible() { return this.isRendered; }
    set visible(val) {
        if (val && !this.visible) {
            this.show();

        } else if (!val && this.visible) {
            this.hide();
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
        // Config zuweisen
        kijs.Object.assignConfig(this, config, this._configMap);
    }

    /**
     * Fügt den DOM-Elementen eine CSS-Klasse hinzu.
     * @param {Array|String} cls
     * @returns {undefined}
     */
    clsAdd(cls) {
        this._topDom.clsAdd(cls);
        this._rightDom.clsAdd(cls);
        this._bottomDom.clsAdd(cls);
        this._leftDom.clsAdd(cls);
    }


    /**
     * Blendet die Maske aus (mit Animation)
     * @returns {undefined}
     */
    hide() {
        this._topDom.style.opacity = 0;
        this._rightDom.style.opacity = 0;
        this._bottomDom.style.opacity = 0;
        this._leftDom.style.opacity = 0;

        if (this._animated) {
            // animation läuft 0.2s, danach aus DOM entfernen
            kijs.defer(function() {
                this.unrender();
            }, 200, this);

        } else {
            this.unrender();
        }
    }

    render() {
        this._topDom.renderTo(document.body);
        this._rightDom.renderTo(document.body);
        this._bottomDom.renderTo(document.body);
        this._leftDom.renderTo(document.body);
        this.raiseEvent('afterRender');
    }

    /**
     * Zeigt die Maske an.
     * @returns {undefined}
     */
    show() {
        this.updatePosition();
        this.render();

        if (this._animated) {
            // einblenden nach 10ms
            kijs.defer(function() {
                this._topDom.style.opacity = 1;
                this._rightDom.style.opacity = 1;
                this._bottomDom.style.opacity = 1;
                this._leftDom.style.opacity = 1;
            }, 10, this);

        } else {
            this._topDom.style.opacity = 1;
            this._rightDom.style.opacity = 1;
            this._bottomDom.style.opacity = 1;
            this._leftDom.style.opacity = 1;
        }
    }

    /**
     * Aktualisiert die Position des DOM-Nodes
     * @returns {undefined}
     */
    updatePosition() {
        let node = this._targetDom && this._targetDom.node ? this._targetDom.node : null;
        let pos = node ? kijs.Dom.getAbsolutePos(node) : {x:0, y:0, w:0, h:0}; // x, y, w, h

        // top element
        this._topDom.style.left = pos.x + 'px';
        this._topDom.style.height = pos.y + 'px';
        this._topDom.style.width = pos.w + 'px';

        // right element
        this._rightDom.style.left = (pos.x + pos.w) + 'px';

        // bottom element
        this._bottomDom.style.left = pos.x + 'px';
        this._bottomDom.style.top = (pos.y + pos.h) + 'px';
        this._bottomDom.style.width = pos.w + 'px';

        // left element
        this._leftDom.style.width = pos.x + 'px';
    }


    // PROTECTED
    _onAfterResize() {
        if (this.isRendered) {
            this.updatePosition();
        }
    }

    _onWindowResize() {
        if (this.isRendered) {
            this.updatePosition();
        }
    }


    unrender(superCall=false) {
        // Event auslösen.
        if (!superCall) {
            this.raiseEvent('unrender');
        }

        this._topDom.unrender();
        this._rightDom.unrender();
        this._leftDom.unrender();
        this._bottomDom.unrender();
    }

    destruct(superCall=false) {
        if (!superCall) {
            // unrender
            this.unrender(superCall);

            // Event auslösen.
            this.raiseEvent('destruct');
        }

        // Listeners entfernen
        if (this._targetEl) {
            this._targetEl.off(null, null, this);
        }
        this._targetEl = null;
        this._targetDom = null;

        // Node-Event Listener auf Window entfernen
        kijs.Dom.removeEventListener('resize', window, this);

        // Elemente/DOM-Objekte entladen
        if (this._topDom) {
            this._topDom.destruct();
        }
        if (this._rightDom) {
            this._rightDom.destruct();
        }
        if (this._leftDom) {
            this._leftDom.destruct();
        }
        if (this._bottomDom) {
            this._bottomDom.destruct();
        }

        // Variablen (Objekte/Arrays) leeren
        this._topDom = null;
        this._rightDom = null;
        this._leftDom = null;
        this._bottomDom = null;

        // Basisklasse entladen
        super.destruct();
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
 * disableEnterBubbeling Boolean [optional] Stoppt das Bubbeling der KeyDown-Events von Enter
 *
 * disableEscBubbeling Boolean [optional] Stoppt das Bubbeling der KeyDown-Events von Escape
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
 * disableEnterBubbeling
 * disableEscBubbeling
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
        super(false);

        this._cls = [];
        this._disableEnterBubbeling = false;
        this._disableEscBubbeling = false;
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

        this._defaultConfig = {};

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
        Object.assign(this._defaultConfig, {
            // keine
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        this._configMap = {
            cls: { fn: 'function', target: this.clsAdd },
            disabled: true,
            disableEnterBubbeling: { target: 'disableEnterBubbeling' },
            disableEscBubbeling: { target: 'disableEscBubbeling' },
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
            change: { nodeEventName: 'change', useCapture: false },
            click: { nodeEventName: 'click', useCapture: false },
            dblClick: { nodeEventName: 'dblclick', useCapture: false },
            drag: { nodeEventName: 'drag', useCapture: false },
            dragEnd: { nodeEventName: 'dragend', useCapture: false },
            dragEnter: { nodeEventName: 'dragenter', useCapture: false },
            dragExit: { nodeEventName: 'dragexit', useCapture: false },
            dragLeave: { nodeEventName: 'dragleave', useCapture: false },
            dragOver: { nodeEventName: 'dragover', useCapture: false },
            dragStart: { nodeEventName: 'dragstart', useCapture: false },
            drop: { nodeEventName: 'drop', useCapture: false },
            focus: { nodeEventName: 'focus', useCapture: false },
            mouseDown: { nodeEventName: 'mousedown', useCapture: false },
            mouseEnter: { nodeEventName: 'mouseenter', useCapture: false },
            mouseLeave: { nodeEventName: 'mouseleave', useCapture: false },
            mouseMove: { nodeEventName: 'mousemove', useCapture: false },
            mouseUp: { nodeEventName: 'mouseup', useCapture: false },
            scroll: { nodeEventName: 'scroll', useCapture: false },
            touchStart: { nodeEventName: 'touchstart', useCapture: false },
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
            config = Object.assign({}, this._defaultConfig, config);
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
     * Stoppt das Bubbeling der KeyDown-Events von Enter
     * @returns {Boolean}
     */
    get disableEnterBubbeling() { return this._disableEnterBubbeling;  }
    set disableEnterBubbeling(val) {
        this._disableEnterBubbeling = val;
        if (val) {
            this.on('enterPress', this._onKeyPressStopBubbeling, this);
        } else {
            this.off('enterPress', this._onKeyPressStopBubbeling, this);
        }
    }

    /**
     * Stoppt das Bubbeling der KeyDown-Events von Escape
     * @returns {Boolean}
     */
    get disableEscBubbeling() { return this._disableEscBubbeling;  }
    set disableEscBubbeling(val) {
        this._disableEscBubbeling = val;
        if (val) {
            this.on('escPress', this._onKeyPressStopBubbeling, this);
        } else {
            this.off('escPress', this._onKeyPressStopBubbeling, this);
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
            throw new kijs.Error('set height(x). x must be numeric.');
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
            throw new kijs.Error('set left(x). x must be numeric.');
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
            throw new kijs.Error(`Property "nodeTagName" can not be set. The node has allready been rendered.`);
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
            throw new kijs.Error(`Property "style" can not be set. The node has allready been rendered.`);
        }
    }

    get toolTip() { return this._toolTip; }
    set toolTip(val) {
        if (kijs.isEmpty(val)) {
            if (this._toolTip) {
                this._toolTip.destruct();
            }
            this._toolTip = null;

        } else if (val instanceof kijs.gui.ToolTip) {
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

        } else {
            throw new kijs.Error(`Unkown toolTip format`);

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
            throw new kijs.Error('set top(x). x must be numeric.');
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
            throw new kijs.Error('set width(x). x must be numeric.');
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
     * @param {Boolean} [swapOffset=true]   Der Offset wird Mitgeswappt (* -1 gerechnet), wenn das Element kein Platz hat
     * @returns {Object}    Gibt die endgültige Positionierung zurück: { pos:..., targetPos:... }
     */
    alignToTarget(targetNode, targetPos, pos, allowSwapX, allowSwapY, offsetX, offsetY, swapOffset=true) {
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

        // Wenn der offset geswappt werden soll, wird dieser *-1 gerechnet.
        const swapOffsetFactor = swapOffset ? -1 : 1;

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
                    rectSwap = kijs.Grafic.alignRectToRect(e, t, targetPosSwap, posSwap, offsetX, offsetY*swapOffsetFactor);
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
                    rect.y = b.h - rect.h;
                } else {
                    // oben ausrichten
                    rect.y = 0;
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
                    rectSwap = kijs.Grafic.alignRectToRect(e, t, targetPosSwap, posSwap, offsetX*swapOffsetFactor, offsetY);
                    overlapSwap = kijs.Grafic.rectsOverlap(rectSwap, b);

                    if (overlapSwap.fitX) {
                        // Y Achse übernehmen, da vorgängig berechnet
                        rectSwap.y = rect.y;
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
        kijs.Array.removeMultiple(this._cls, cls);

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
     *                                                 undefined: nicht fokussierbar (bei undefined muss die Eigenschaft mit removeAttribute('tabIndex') entfernt werden. Sonst klappts nicht)
     *                                                 tabIndex -1: nur via focus() Befehl oder click fokussierbar
     *                                                 tabIndex  0: Fokussierbar - Browser betimmt die Tabreihenfolge
     *                                                 tabIndex >0: Fokussierbar - in der Reihenfolge wie der tabIndex
     * @returns {HTMLElement|Null|false}               HTML-Node, das den Fokus erhalten hat oder false, wenn nicht gerendert.
     */
    focus(alsoSetIfNoTabIndex=false) {
        if (this._node) {
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
        } else {
            return false;
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
            // Kleiner murgs, weil obige Zeile nicht zum Entfernen der Eigenschaft 'tabIndex' funktioniert
            if (kijs.isEmpty(value)) {
                this._node.removeAttribute(name);
            }
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
     * @param {HTMLElement} [insert] - Falls das Element statt angehängt eingefügt werden soll.
     * @param {String} [insertPosition='before'] before, falls das Element vor dem insert-Element eingefügt werden soll, 'after' für nach dem Element.
     * @returns {undefined}
     */
    renderTo(targetNode, insert, insertPosition='before') {
        const firstRender = !this.isRendered;

        this.render();

        if (insert) {

            // Element vor dem insert-Element einfügen
            if (insertPosition === 'before') {
                targetNode.insertBefore(this._node, insert);

            // Element nach dem insert-Element einfügen
            } else if (insertPosition === 'after') {
                targetNode.insertBefore(this._node, insert.nextSibling);

            } else {
                throw new kijs.Error('invalid insert position for renderTo');
            }

        // Element anhängen
        } else {
            targetNode.appendChild(this._node);
        }
    }

    /**
     * Scrollt den Node in den sichtbaren Bereich
     * @returns {undefined}
     */
    scrollIntoView(){
        this._node.scrollIntoView();
    }


    /**
     * Node aus DOM entfernen, falls vorhanden
     * @returns {undefined}
     */
    unrender() {
        if (this._node) {
            // Node-Event-Listeners entfernen
            if (!kijs.isEmpty(this._nodeEventListeners)) {
                kijs.Dom.removeAllEventListenersFromContext(this);
            }

            // Childs löschen
            kijs.Dom.removeAllChildNodes(this._node);

            // Node selber löschen
            if (this._node !== document.body && this._node.parentNode) {
                this._node.parentNode.removeChild(this._node);
            }
        }
        this._node = null;

        if (this._toolTip) {
            this._toolTip.unrender();
        }
    }



    // PROTECTED
    /**
     * Weist die CSS-Klassen dem DOM-Node zu.
     * @returns {undefined}
     */
    _clsApply() {
        if (this._node && (this._node.className || !kijs.isEmpty(this._cls))) {
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
            // Kleiner murgs, weil obige Zeiele nicht zum Entfernen der Eigenschaft 'tabIndex' funktioniert
            if (kijs.isEmpty(value)) {
                this._node.removeAttribute(name);
            }
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
                throw new kijs.Error(`kijsEvent "${kijsEvent}" is not mapped`);
            }
        }, this);
    }


    // LISTENERS
    _onKeyPressStopBubbeling(e) {
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
        // Unrender
        this.unrender();

        // ToolTip entladen
        if (this._toolTip) {
            this._toolTip.destruct();
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
/* global kijs, this */

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
 * afterFirstRenderTo
 * afterRender
 * afterResize
 * changeVisibility
 * dblClick
 * destruct
 * drag
 * dragEnd
 * dragLeave
 * dragOver
 * dragStart
 * drop
 * focus
 * mouseDown
 * mouseLeave
 * mouseMove
 * mouseUp
 * unrender
 * wheel
 *
 * // key events
 * keyDown
 * enterPress
 * enterEscPress
 * escPress
 * spacePress
 */
kijs.gui.Element = class kijs_gui_Element extends kijs.Observable {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

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

        this._defaultConfig = {};

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
        Object.assign(this._defaultConfig, {
            // keine
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        this._configMap = {
            afterResizeDelay: true,
            cls: { fn: 'function', target: this._dom.clsAdd, context: this._dom },
            disableEnterBubbeling: { target: 'disableEnterBubbeling', context: this._dom },
            disableEscBubbeling: { target: 'disableEscBubbeling', context: this._dom },
            nodeTagName: { target: 'nodeTagName', context: this._dom },
            defaults: { fn: 'manual' }, // wird nur bei containern gebraucht
            height: { target: 'height' },
            html: { target: 'html', context: this._dom },
            htmlDisplayType: { target: 'htmlDisplayType', context: this._dom },
            left: { target: 'left' },
            name: true,
            nodeAttribute: { target: 'nodeAttribute', context: this._dom },
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
        this._eventForwardsAdd('mouseEnter', this._dom);
        this._eventForwardsAdd('mouseLeave', this._dom);
        this._eventForwardsAdd('mouseMove', this._dom);
        this._eventForwardsAdd('mouseUp', this._dom);
        this._eventForwardsAdd('touchStart', this._dom);
        this._eventForwardsAdd('wheel', this._dom);

        // key events
        this._eventForwardsAdd('keyDown', this._dom);
        this._eventForwardsAdd('keyUp', this._dom);
        this._eventForwardsAdd('keyPress', this._dom);
        this._eventForwardsAdd('enterPress', this._dom);
        this._eventForwardsAdd('enterEscPress', this._dom);
        this._eventForwardsAdd('escPress', this._dom);
        this._eventForwardsAdd('spacePress', this._dom);


        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
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

    /**
     * Gibt das Element zurück, das grafisch unterhalb liegt.
     * @returns {kijs.gui.Element|null}
     */
    get lowerElement() {
        if (!this._parentEl || !this._parentEl.elements || kijs.isEmpty(this.top)) {
            return null;
        }

        let curTop=null, lowerEl=null;
        kijs.Array.each(this._parentEl.elements, function(el) {
            if (!kijs.isEmpty(el.top) && el.left === this.left && el !== this) {
                if (el.top > this.top && (curTop === null || el.top < curTop)) {
                    lowerEl = el;
                    curTop = el.top;
                }
            }
        }, this);

        return lowerEl;
    }

    get name() { return this._name; }
    set name(val) { this._name = val; }

    /**
     * Gibt das nächste element im elements-Array zurück
     * @returns {kijs.gui.Element|null}
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
     * @returns {kijs.gui.Element|null}
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
     * @returns {kijs.gui.Element|null}
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

    /**
     * Gibt das Element zurück, das grafisch oberhalb liegt.
     * @returns {kijs.gui.Element|null}
     */
    get upperElement() {
        if (!this._parentEl || !this._parentEl.elements || kijs.isEmpty(this.top)) {
            return null;
        }

        let curTop=null, upperEl=null;
        kijs.Array.each(this._parentEl.elements, function(el) {
            if (!kijs.isEmpty(el.top) && el.left === this.left && el !== this) {
                if (el.top < this.top && (curTop === null || el.top > curTop)) {
                    upperEl = el;
                    curTop = el.top;
                }
            }
        }, this);

        return upperEl;
    }

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
                throw new kijs.Error(`xtype can not be determined`);
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

        // Objekt versiegeln
        // Bewirkt, dass keine neuen propertys hinzugefügt werden dürfen.
        Object.seal(this);
    }

    /**
     * Setzt den Fokus auf das Element
     * @param {Boolean} [alsoSetIfNoTabIndex=false]    Fokus auch setzen, wenn tabIndex === -1
     *                                                 undefined: nicht fokussierbar (bei undefined muss die Eigenschaft mit removeAttribute('tabIndex') entfernt werden. Sonst klappts nicht)
     *                                                 tabIndex -1: nur via focus() Befehl fokussierbar
     *                                                 tabIndex  0: Fokussierbar - Browser betimmt die Tabreihenfolge
     *                                                 tabIndex >0: Fokussierbar - in der Reihenfolge wie der tabIndex
     * @returns {HTMLElement|null}                     HTML-Node, das den Fokus erhalten hat
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
     * @param {Boolean} [superCall=false]
     * @returns {undefined}
     */
    render(superCall) {
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
        if (!superCall) {
            this.raiseEvent('afterRender');
        }
    }

    /**
     * rendert den DOM-Node und fügt ihn einem Parent-DOM-Node hinzu
     * @param {HTMLElement} targetNode
     * @param {HTMLElement} [insert] - Falls das Element statt angehängt eingefügt werden soll.
     * @param {String} [insertPosition='before'] before, falls das Element vor dem insert-Element eingefügt werden soll, 'after' für nach dem Element.
     * @returns {undefined}
     */
    renderTo(targetNode, insert, insertPosition='before') {
        const firstRender = !this.isRendered;

        this.render();

        if (insert) {

            // Element vor dem insert-Element einfügen
            if (insertPosition === 'before') {
                targetNode.insertBefore(this._dom.node, insert);

            // Element nach dem insert-Element einfügen
            } else if (insertPosition === 'after') {
                targetNode.insertBefore(this._dom.node, insert.nextSibling);

            } else {
                throw new kijs.Error('invalid insert position for renderTo');
            }

        // Element anhängen
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
     * @param {Boolean} superCall
     * @returns {undefined}
     */
    unrender(superCall) {
        // Event auslösen.
        if (!superCall) {
            this.raiseEvent('unrender');
        }

        this._dom.unrender();
    }

    /**
     * Durchläuft den Element-Baum nach oben und gibt das erste Element zurück,
     * dass mit dem Namen (Eigenschaft 'name') übereinstimmt.
     * @param {String} name
     * @returns {kijs_gui_Element|null}
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
     * @returns {kijs_gui_Element|null}
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
     * @param {Object} [e={}]   Falls das Event nur weitergereicht wird, kann hier das
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
                    if (this.raiseEvent(eventName, e) === false) {
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
     * @param {Object} e
     * @returns {undefined}
     */
    _onParentChildElementAfterResize(e) {
        // Falls die eigene Grösse geändert hat: das eigene afterResize-Event auslösen
        this._raiseAfterResizeEvent(false, e);
    }


    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(superCall) {
        // atferResize-Events verhindern
        this._preventAfterResize = true;
        if (this._afterResizeDeferHandle) {
            window.clearTimeout(this._afterResizeDeferHandle);
        }

        if (!superCall) {
            // unrender
            this.unrender(superCall);

            // Event auslösen.
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
     *                                                                          für Lademaske, NULL=document.body, 'none' für keine Maske.
     * @param {String} [waitMaskTargetDomProperty='dom']        Name der DOM-Eigenschaft in der die Lademaske
     *                                                          angezeigt werden soll.
     * @param {Boolean} [ignoreWarnings=false]  Sollen Warnungen ignoriert werden?
     * @param {Function} [fnBeforeMessages]     Callback-Funktion, die vor der Ausgabe von Meldungsfenstern ausgeführt wird.
     *                                          Wird z.B. verwendet um bei Formularen die Fehler bei den einzelnen Feldern
     *                                          anzuzeigen.
     * @returns {undefined}
     */
    // overwrite (Vorsicht andere Argumente!)
    do(facadeFn, data, fn, context, cancelRunningRpcs, waitMaskTarget, waitMaskTargetDomProperty='dom', ignoreWarnings, fnBeforeMessages) {
        // Lademaske anzeigen
        let waitMask;
        if (waitMaskTarget === 'none') {
            waitMask = null;
        } else if (waitMaskTarget instanceof kijs.gui.Element) {
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
                if (response.errorMsg) {
                    let err = this._getMsg(response.errorMsg, kijs.getText('Fehler'));
                    kijs.gui.MsgBox.error(err.title, err.msg);
                    if (response.errorMsg.cancelCb !== false) {
                        return;
                    }
                }

                // Warning --> WarnungMsg mit OK, Cancel. Bei Ok wird der gleiche request nochmal gesendet mit dem Flag ignoreWarnings
                // response.warningMsg (String oder Array mit Strings, die mit Aufzählungszeichen angezeigt werden)
                if (response.warningMsg) {
                    let warn = this._getMsg(response.warningMsg, kijs.getText('Warnung'));
                    kijs.gui.MsgBox.warning(warn.title, warn.msg, function(e) {
                        if (e.btn === 'ok') {
                            // Request nochmal senden mit Flag ignoreWarnings
                            this.do(facadeFn, data, fn, context, cancelRunningRpcs, waitMaskTarget, waitMaskTargetDomProperty, true);
                        }
                    }, this);
                    return;
                }

                // Info --> Msg ohne Icon kein Abbruch
                // response.infoMsg (String oder Array mit Strings, die mit Aufzählungszeichen angezeigt werden)
                if (response.infoMsg) {
                    let info = this._getMsg(response.infoMsg, kijs.getText('Info'));
                    kijs.gui.MsgBox.info(info.title, info.msg);
                }

                // Tip -> Msg, die automatisch wieder verschwindet kein Abbruch
                // response.tipMsg (String oder Array mit Strings, die mit Aufzählungszeichen angezeigt werden)
                if (response.cornerTipMsg) {
                    let info = this._getMsg(response.cornerTipMsg, kijs.getText('Info'));
                    kijs.gui.CornerTipContainer.show(info.title, info.msg, 'info');
                }


                // callback-fn ausführen
                if (fn && kijs.isFunction(fn)) {
                    fn.call(context || this, response.responseData || null);
                }
            }

        }, this, cancelRunningRpcs, {ignoreWarnings: !!ignoreWarnings}, {waitMask: waitMask});
    }


    /**
     * Ist die msg ein String, wird dieser mit dem Standardtitel zurückgegeben-
     * Ansonsten wird Titel und Text aus Objekt gelesen
     * @param {String|Object|Array} msg
     * @param {String} defaultTitle
     * @returns {Object}
     */
    _getMsg(msg, defaultTitle) {
        let returnMsg = {msg:'', title: ''};

        if (kijs.isString(msg) || kijs.isArray(msg)) {
            returnMsg.msg = msg;
            returnMsg.title = defaultTitle;

        } else if (kijs.isObject(msg)) {
            returnMsg.msg = msg.msg;
            returnMsg.title = msg.title ? msg.title : defaultTitle;
        }
        return returnMsg;
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
    constructor(config={}) {
        super(false);

        this._disabled = false;
        this._dom = new kijs.gui.Dom();
        this._followPointer = false;    // Soll sich der TipText mit dem Mauszeiger verschieben?
        this._offsetX = 10;
        this._offsetY = 10;
        this._target = null;
        this._defaultConfig = {};

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });

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
            config = Object.assign({}, this._defaultConfig, config);
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
        this.unrender();
    }

    /**
     * rendert den DOM-Node
     * @param {Boolean} [superCall=false]
     * @returns {undefined}
     */
    render(superCall) {
        // DOM Rendern
        this._dom.render();

        // Event auslösen.
        if (!superCall) {
            this.raiseEvent('afterRender');
        }
    }

    show(x, y) {
        let updatePos = false;

        // rendern
        if (!this._dom.node) {
            this.render();
        }

        // an body anhängen
        if (this._dom.node.parentNode !== document.body) {
            document.body.appendChild(this._dom.node);

            // listener auf body
            kijs.Dom.addEventListener('mousemove', document.body, this._onMouseMoveOnBody, this);

            // position aktualisieren
            updatePos = true;
        }

        if (this._followPointer) {
            updatePos = true;
        }

        // X
        if (updatePos && kijs.isDefined(x)) {
            // Offset addieren
            if (this._offsetX) {
                x += this._offsetX;
            }

            // Sicherstellen, dass der ToolTip auf dem Bildschirm platz hat
            if (x+this._dom.node.offsetWidth > window.innerWidth) {
                x = Math.abs(window.innerWidth - this._dom.node.offsetWidth - 5);
            }

            // Position zuweisen
            this._dom.style.left = x + 'px';
        }

        // Y
        if (updatePos && kijs.isDefined(y)) {
            // Offset addieren
            if (this._offsetY) {
                y += this._offsetY;
            }

            // Sicherstellen, dass der ToolTip auf dem Bildschirm platz hat
            if (y+this._dom.node.offsetHeight > window.innerHeight) {
                y = Math.abs(window.innerHeight - this._dom.node.offsetHeight - 5);
            }

            // Position zuweisen
            this._dom.style.top = y + 'px';
        }
    }


    /**
     * Node aus DOM entfernen, falls vorhanden
     * @param {bool} superCall true, if called from child
     * @returns {undefined}
     */
    unrender(superCall) {
        // Event auslösen.
        if (!superCall) {
            this.raiseEvent('unrender');
        }

        // Event entfernen
        kijs.Dom.removeEventListener('mousemove', document.body, this);

        this._dom.unrender();
    }


    // PROTECTED
    _bindEventsToTarget() {
        this._target.on('mouseMove', this._onMouseMoveTarget, this);
        this._target.on('mouseLeave', this._onMouseLeave, this);
    }

    _onMouseMoveOnBody(e) {
        if (this._target) {
            let mouseX = e.nodeEvent.clientX, mouseY = e.nodeEvent.clientY;
            let top = kijs.Dom.getAbsolutePos(this._target.node).y,
                    left = kijs.Dom.getAbsolutePos(this._target.node).x,
                    width = this._target.width,
                    height = this._target.height;

            if (width && height) {
                // prüfen, ob der Mauszeiger über dem Element ist.
                if (mouseX < left || mouseX > left+width || mouseY < top || mouseY > top+height) {
                    this.hide();
                }
            } else {
                this.hide();
            }
        } else {
            this.hide();
        }
    }

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
    destruct(superCall) {
        if (!superCall) {
            // unrender
            this.unrender(superCall);

            // Event auslösen.
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
        super.destruct(true);
    }
};
/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.grid.column.Column (Abstract)
// --------------------------------------------------------------
/**
 * EVENTS
 * ----------
 *
 */
kijs.gui.grid.columnConfig.ColumnConfig = class kijs_gui_grid_columnConfig_ColumnConfig extends kijs.Observable {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        // check if abstract
        if (kijs.isObject(config)) {
            throw new kijs.Error('do not create a instance of kijs.gui.grid.columnConfig.ColumnConfig directly');
        }

        this._caption = '';
        this._editable = false;
        this._visible = true;
        this._hideable = true;
        this._resizable = true;
        this._sortable = true;
        this._valueField = '';
        this._width = 100;

        // xtypes
        this._cellXtype = null;
        this._filterXtype = null;
        this._headerCellXtype = null;

        // Configs
        this._cellConfig = null;
        this._filterConfig = null;
        this._defaultConfig = {};

        // grid
        this._grid = null;

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        this._configMap = {
            grid: true,
            cellXtype: true,
            filterXtype: true,
            headerCellXtype: true,

            caption: {target: 'caption' },
            editable: true,
            visible: true,
            hideable: true,
            resizable: true,
            sortable: true,
            valueField: true,
            width: true,

            cellConfig: {target: 'cellConfig' },
            filterConfig: {target: 'filterConfig' }

        };

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }

        if (this._cellConfig === null) {
            this.cellConfig = this._cellXtype;
        }
        if (this.filterConfig === null) {
            this.filterConfig = this._filterXtype;
        }
    }

    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------

    get caption() { return this._caption; }
    set caption(val) {
        this._caption = val;
        this.raiseEvent('change', {columnConfig: this, caption: val});
    }

    get cellConfig() {
        let cCnf =  this._cellConfig ? kijs.Object.clone(this._cellConfig) : {};
        cCnf.columnConfig = this;
        if (!cCnf.xtype) {
            cCnf.xtype = this._cellXtype;
        }
        return cCnf;
    }
    set cellConfig(val) {
        if (kijs.isString(val)) {
            this._cellConfig = {
                xtype: val
            };
        } else if (kijs.isObject(val)) {
            this._cellConfig = val;
        }
    }

    get editable() { return this._editable; }
    set editable(val) {
        this._editable = !!val;
        this.raiseEvent('change', {columnConfig: this, editable: !!val});
    }

    get filterConfig() {
        let cCnf =  this._filterConfig || {xtype: this._filterXtype};
        cCnf.columnConfig = this;
        return cCnf;
    }
    set filterConfig(val) {
        if (kijs.isString(val)) {
            this._filterConfig = {
                xtype: val
            };
        } else if (kijs.isObject(val)) {
            this._filterConfig = val;
            if (!this._filterConfig.xtype) {
                this._filterConfig.xtype = this._cellXtype;
            }
            this._filterConfig.columnConfig = this;
        }
    }

    get grid() { return this._grid; }
    set grid(val) { this._grid = val; }

    get visible() { return this._visible; }
    set visible(val) {
        if (!val && !this.hideable) {
            return;
        }
        this._visible = !!val;
        this.raiseEvent('change', {columnConfig: this, visible: !!val});
    }

    get hideable() { return this._hideable; }
    set hideable(val) {
        this._hideable = !!val;
        this.raiseEvent('change', {columnConfig: this, hideable: !!val});
    }

    get position() {
        if (this._grid) {
            return this._grid.columnConfigs.indexOf(this);
        }
        return false;
    }
    set position(val) {
        if (this._grid) {
            let curPos = this.position;

            if (!kijs.isInteger(val)) {
                throw new kijs.Error('invalid position value');
            }

            if (val !== curPos) {
                kijs.Array.move(this._grid.columnConfigs, curPos, val);
                this.raiseEvent('change', {columnConfig: this, position: this.position});
            }
        }
    }

    get resizable() { return this._resizable; }
    set resizable(val) {
        this._resizable = !!val;
        this.raiseEvent('change', {columnConfig: this, resizable: !!val});
    }

    get sortable() { return this._sortable; }
    set sortable(val) {
        this._sortable = !!val;
        this.raiseEvent('change', {columnConfig: this, sortable: !!val});
    }

    get valueField() { return this._valueField; }

    get width() { return this._width; }
    set width(val) {
        if (!kijs.isNumeric(val)) {
            throw new kijs.Error('invalid width value for columnConfig');
        }
        this._width = val;
        this.raiseEvent('change', {columnConfig: this, width: val});
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
        this._icon2El = new kijs.gui.Icon({ parent: this, cls:'kijs-icon2' });

        this._badgeDom = new kijs.gui.Dom({
            cls: 'kijs-badge',
            nodeTagName: 'span'
        });

        this._dom.nodeTagName = 'button';
        this._dom.nodeAttributeSet('type', 'button');

        this._dom.clsAdd('kijs-button');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            badgeText: { target: 'html', context: this._badgeDom },
            badgeCls: { fn: 'function', target: this._badgeDom.clsAdd, context: this._badgeDom },
            badgeTextHtmlDisplayType: { target: 'htmlDisplayType', context: this._badgeDom },
            badgeStyle: { fn: 'assign', target: 'style', context: this._badgeDom },
            caption: { target: 'html', context: this._captionDom },
            captionCls: { fn: 'function', target: this._captionDom.clsAdd, context: this._captionDom },
            captionHtmlDisplayType: { target: 'htmlDisplayType', context: this._captionDom },
            captionStyle: { fn: 'assign', target: 'style', context: this._captionDom },
            icon: { target: 'icon' },
            iconChar: { target: 'iconChar', context: this._iconEl },
            iconCls: { target: 'iconCls', context: this._iconEl },
            iconColor: { target: 'iconColor', context: this._iconEl },
            icon2: { target: 'icon2' },
            icon2Char: { target: 'iconChar', context: this._icon2El },
            icon2Cls: { target: 'iconCls', context: this._icon2El },
            icon2Color: { target: 'iconColor', context: this._icon2El },
            isDefault: { target: 'isDefault' },

            disabled: { prio: 100, target: 'disabled' }
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }
    }


    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get badgeText() { return this._badgeDom.html; }
    set badgeText(val) {
        this._badgeDom.html = val;
        if (this.isRendered) {
            this.render();
        }
    }

    get badgeDom() { return this._badgeDom; }

    get badgeTextHtmlDisplayType() { return this._badgeDom.htmlDisplayType; }
    set badgeTextHtmlDisplayType(val) { this._badgeDom.htmlDisplayType = val; }

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
            throw new kijs.Error(`config "icon" is not valid.`);

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


    get icon2() { return this._icon2El; }
    /**
     * Icon zuweisen
     * @param {kijs.gui.Icon|Object} val     Icon als icon2-Config oder kijs.gui.Icon Element
     */
    set icon2(val) {
        // Icon zurücksetzen?
        if (kijs.isEmpty(val)) {
            this._icon2El.iconChar = null;
            this._icon2El.iconCls = null;
            this._icon2El.iconColor = null;
            if (this.isRendered) {
                this.render();
            }

        // kijs.gui.Icon Instanz
        } else if (val instanceof kijs.gui.Icon) {
            this._icon2El.destruct();
            this._icon2El = val;
            if (this.isRendered) {
                this.render();
            }

        // Config Objekt
        } else if (kijs.isObject(val)) {
            this._icon2El.applyConfig(val);
            if (this.isRendered) {
                this.render();
            }

        } else {
            throw new kijs.Error(`config "icon2" is not valid.`);

        }
    }

    get icon2Char() { return this._icon2El.iconChar; }
    set icon2Char(val) {
        this._icon2El.iconChar = val;
        if (this.isRendered) {
            this.render();
        }
    }

    get icon2Cls() { return this._icon2El.iconCls; }
    set icon2Cls(val) {
        this._icon2El.iconCls = val;
        if (this.isRendered) {
            this.render();
        }
    }

    get icon2Color() { return this._icon2El.iconColor; }
    set icon2Color(val) {
        this._icon2El.iconColor = val;
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
    get isEmpty() { return this._captionDom.isEmpty && this._iconEl.isEmpty && this._icon2El.isEmpty && this._badgeDom.isEmpty; }




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
    render(superCall) {
        super.render(true);

        // Span icon rendern (kijs.gui.Icon)
        if (!this._iconEl.isEmpty) {
            this._iconEl.renderTo(this._dom.node);
        } else {
            this._iconEl.unrender();
        }

        // Span caption rendern (kijs.guiDom)
        if (!this._captionDom.isEmpty) {
            this._captionDom.renderTo(this._dom.node);
        } else {
            this._captionDom.unrender();
        }

        // Div badge rendern (kijs.guiDom)
        if (!this._badgeDom.isEmpty) {
            this._badgeDom.renderTo(this._dom.node);
        } else {
            this._badgeDom.unrender();
        }

        // Span icon2 rendern (kijs.gui.Icon)
        if (!this._icon2El.isEmpty) {
            this._icon2El.renderTo(this._dom.node);
        } else {
            this._icon2El.unrender();
        }

        // Event afterRender auslösen
        if (!superCall) {
            this.raiseEvent('afterRender');
        }
    }

    // overwrite
    unrender(superCall) {
        // Event auslösen.
        if (!superCall) {
            this.raiseEvent('unrender');
        }

        this._iconEl.unrender();
        this._icon2El.unrender();
        this._captionDom.unrender();
        this._badgeDom.unrender();
        super.unrender(true);
    }


    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(superCall) {
        if (!superCall) {
            // unrendern
            this.unrender(superCall);

            // Event auslösen.
            this.raiseEvent('destruct');
        }

        // Elemente/DOM-Objekte entladen
        if (this._badgeDom) {
            this._badgeDom.destruct();
        }
        if (this._captionDom) {
            this._captionDom.destruct();
        }
        if (this._iconEl) {
            this._iconEl.destruct();
        }
        if (this._icon2El) {
            this._icon2El.destruct();
        }

        // Variablen (Objekte/Arrays) leeren
        this._badgeDom = null;
        this._captionDom = null;
        this._iconEl = null;

        // Basisklasse entladen
        super.destruct(true);
    }

};
/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.Container
// --------------------------------------------------------------
/**
 * Container Element, welches untergeordnete Elemente beinhalten kann.
 * Das Element besteht aus zwei ineinanderliegenden dom-Nodes.
 *
 * KLASSENHIERARCHIE
 * kijs.gui.Element
 *  kijs.gui.Container
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
 * beforeAdd
 * beforeRemove
 * childElementAfterResize
 * remove
 *
 * // Geerbte Events
 * afterFirstRenderTo
 * afterRender
 * afterResize
 * changeVisibility
 * dblClick
 * destruct
 * drag
 * dragEnd
 * dragLeave
 * dragOver
 * dragStart
 * drop
 * focus
 * mouseDown
 * mouseLeave
 * mouseMove
 * mouseUp
 * wheel
 *
 * // key events
 * keyDown
 * enterPress
 * enterEscPress
 * escPress
 * spacePress
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
        Object.assign(this._defaultConfig, {
            // keine
        });

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
            config = Object.assign({}, this._defaultConfig, config);
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

    get defaults() { return this._defaults; }
    set defaults(val) { this._defaults = val; }

    get elements() { return this._elements; }

    get firstChild() {
        if (this._elements.length > 0) {
            return this._elements[0];
        }
        return null;
    }

    // overwrite
    get html() { return this._innerDom.html; }
    set html(val) { this._innerDom.html = val; }

    // overwrite
    get htmlDisplayType() { return this._innerDom.htmlDisplayType; }
    set htmlDisplayType(val) { this._innerDom.htmlDisplayType = val; }

    get innerDom() { return this._innerDom; }

    get lastChild() {
        if (this._elements.length > 0) {
            return this._elements[this._elements.length-1];
        }
        return null;
    }

    // overwrite
    get isEmpty() { return this._innerDom.isEmpty && kijs.isEmpty(this._elements); }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    /**
     * Fügt ein oder mehrere Elemente hinzu.
     * @param {Object|Array} elements
     * @param {Number} [index=null] Position an der Eingefügt werden soll null=am Schluss
     * @returns {undefined}
     */
    add(elements, index=null) {
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
            if (kijs.isInteger(index)) {
                this._elements.splice(index, 0, el);
            } else {
                this._elements.push(el);
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
     * @returns {kijs_gui_Element|null}
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
     * @returns {kijs_gui_Element|null}
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
     * Gibt alle Unterelemente als flaches Array zurück
     * @param {Number} [deep]         default=-1    Gewünschte Suchtiefe
     *                                              0=nur im aktuellen Container
     *                                              1=im aktuellen Container und in deren untergeordneten
     *                                              2=im aktuellen Container, deren untergeordneten und deren untergeordneten
     *                                              n=...
     *                                              -1=unendlich
     * @returns {Array}
     */
    getElements(deep=-1) {
        let ret = [];

        // elements im aktuellen Container
        kijs.Array.each(this._elements, function(el) {
            ret.push(el);
        }, this);

        // rekursiv unterelemente hinzufügen
        if (deep !== 0) {
            if (deep>0) {
                deep--;
            }
            kijs.Array.each(this._elements, function(el) {
                if (kijs.isFunction(el.getElements)) {
                    let retSub = el.getElements(deep);
                    if (!kijs.isEmpty(retSub)) {
                        ret = ret.concat(retSub);
                    }
                }
            }, this);
        }

        return ret;
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
            if (el.unrender) {
                el.unrender();
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
            el.off(null, null, this);
            if (el.unrender) {
                el.unrender();
            }
        }, this);
        kijs.Array.clear(this._elements);

        // Falls der DOM gemacht ist, wird neu gerendert.
        if (this.dom && !preventRender) {
            this.render();
        }

        // Gelöscht, Event ausführen
        this.raiseEvent('remove');
    }



    // overwrite
    render(superCall) {
        super.render(true);

        // innerDOM rendern
        this._innerDom.renderTo(this._dom.node);

        // elements im innerDOM rendern
        kijs.Array.each(this._elements, function(el) {
            el.renderTo(this._innerDom.node);
        }, this);


        // Event afterRender auslösen
        if (!superCall) {
            this.raiseEvent('afterRender');
        }
    }

    // overwrite
    unrender(superCall) {
        // Event auslösen.
        if (!superCall) {
            this.raiseEvent('unrender');
        }

        kijs.Array.each(this._elements, function(el) {
            el.unrender();
        }, this);

        this._innerDom.unrender();

        super.unrender(true);
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

            // Parent zuweisen
            obj.parent = this;

        // Falls ein Config-Objekt übergeben wird
        } else  if (kijs.isObject(obj)) {

            // defaults
            if (!kijs.isEmpty(this._defaults)) {
                // Bei unbekannten defaults soll kein Fehler ausgelöst werden
                this._defaults.skipUnknownConfig = true;

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
                throw new kijs.Error(`config missing "xtype".`);
            }

            // Konstruktor ermitteln
            const constr = kijs.gui.getClassFromXtype(obj.xtype);
            if (!kijs.isFunction(constr)) {
                throw new kijs.Error(`Unknown xtype "${obj.xtype}".`);
            }

            // Parent zuweisen
            obj.parent = this;

            // Element erstellen
            obj = new constr(obj);
            
        // Ungültige Übergabe
        } else {
            throw new kijs.Error(`kijs.gui.Container: invalid element.`);
        }

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
    destruct(superCall) {
        if (!superCall) {
            // unrender
            this.unrender(superCall);

            // Event auslösen.
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
// kijs.gui.DataViewElement
// --------------------------------------------------------------
kijs.gui.DataViewElement = class kijs_gui_DataViewElement extends kijs.gui.Element {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        this._dataRow = {};     // Verweis auf den Data-Datensatz
        this._index = null;
        this._selected = false;

        this._dom.clsAdd('kijs-dataviewelement');

        //this._dom.nodeAttributeSet('tabIndex', -1);
        this._dom.nodeAttributeSet('draggable', true);

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            dataRow: true,
            disabled: { target: 'disabled', context: this._dom },
            index: true,
            selected: { target: 'selected' }
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }

        this.applyConfig(config);
    }


    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get dataRow() { return this._dataRow; }
    set dataRow(val) { this._dataRow = val; }

    get disabled() { return this._dom.disabled; }
    set disabled(val) { this._dom.disabled = val; }

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
    destruct(superCall) {
        if (!superCall) {
            // unrender
            this.unrender(superCall);

            // Event auslösen.
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
// kijs.gui.DatePicker
// --------------------------------------------------------------
kijs.gui.DatePicker = class kijs_gui_DatePicker extends kijs.gui.Element {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        this._startWeekday = 1; // Erster Tag in der Ansicht (1=Montag)
        this._showWeekNumbers = true; // Wochennummern
        this._weekSelect = false; // ganze Woche auswählen?
        this._showCalendar = true; // Kalender oder Monatswahl?

        this._visibleMonthDate = kijs.Date.getFirstOfMonth(new Date()); // Sichtbarer Monat

        this._value = new Date(); //null; // ausgewähltes Datum
        this._rangeFrom = null; //new Date(2019, 0, 1);
        this._rangeTo = null; // new Date(2019, 0, 10);


        this._nextBtn = new kijs.gui.Button({
            iconChar: '&#xf138', // fa-chevron-circle-right
            on: {
                click: this._onNextBtnClick,
                context: this
            }
        });

        this._previousBtn = new kijs.gui.Button({
            iconChar: '&#xf137', // fa-chevron-circle-left
            on: {
                click: this._onPreviousBtnClick,
                context: this
            }
        });

        this._headerBar = new kijs.gui.PanelBar({
            cls: 'kijs-headerbar-center',
            elementsLeft: [this._previousBtn],
            elementsRight: [this._nextBtn],
            on: {
                click: this._onHeaderBarClick,
                context: this
            }
        });

        this._calendarDom = new kijs.gui.Dom({
            cls: 'kijs-datepicker-calendar',
            on: {
                mouseLeave: this._onCalendarMouseLeave,
                wheel: this._onCalendarWheel,
                context: this
            }
        });

        // Zweidimensionales Grid-Array aufbauen
        this._gridColumns = [];
        for (let y=0; y<7; y++) { // max 6 Datumzeilen + 1 Header
            let rows = [];

            // Dom-Element für Zeile
            let colDom = new kijs.gui.Dom();

            // Dom-Elemente für Spalten
            for (let x=0; x<8; x++) { // 7 Tage + 1 Wochen-Nr.
                rows.push({
                    x: x,
                    y: y,
                    dom: new kijs.gui.Dom({
                        on: {
                            mouseEnter: this._onDateMouseEnter,
                            click: this._onDateMouseClick,
                            context: this
                        }
                    }),
                    isHeader: y===0,
                    isWeekNr: x===0,
                    date: null
                });
            }

            this._gridColumns.push({
                y: y,
                dom: colDom,
                rows: rows
            });
        }

        // Selector für Monat / Jahr
        this._yearMonthDom = new kijs.gui.Dom({
            cls: 'kijs-datepicker-monthyearselector'
        });
        this._monthDom = new kijs.gui.Dom({
            cls: 'kijs-datepicker-monthselector'
        });
        this._yearDom = new kijs.gui.Dom({
            cls: 'kijs-datepicker-yearselector'
        });

        this._monthSelector = [];
        for (let m=0; m<12; m++) { // Jan-Dez
            this._monthSelector.push({
                month: m,
                dom: new kijs.gui.Dom({
                    html: kijs.Date.months_short[m],
                    on: {
                        click: this._onMonthSelectorClick,
                        context: this
                    }
                })
            });
        }

        // Selector für Jahr
        this._yearSelector = [];


        // Knopf auf
        this._yearSelector.push({
            dir: 'up',
            dom: new kijs.gui.Dom({
                cls: 'kijs-btn-up',
                html: '▴',
                on: {
                    click: this._onYearSelectorUpClick,
                    context: this
                }
            })
        });

        // 5 Jahre
        for (let y=0; y < 5; y++) {
            this._yearSelector.push({
                year: (new Date()).getFullYear() - 2 + y,
                dom: new kijs.gui.Dom({
                    html: (new Date()).getFullYear() - 2 + y,
                    on: {
                        click: this._onYearSelectorClick,
                        wheel: this._onYearSelectorWheel,
                        context: this
                    }
                })
            });
        }


        // Knopf ab
        this._yearSelector.push({
            dir: 'down',
            dom: new kijs.gui.Dom({
                cls: 'kijs-btn-down',
                html: '▾',
                on: {
                    click: this._onYearSelectorDownClick,
                    context: this
                }
            })
        });


        // Button 'heute'
        this._todayBtn = new kijs.gui.Button({
            parent: this,
            caption: kijs.getText('Heute'),
            on: {
                click: this._onTodayButtonClick,
                context: this
            }
        });

        this._dom.clsAdd('kijs-datepicker');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            rangeFrom: true,
            rangeTo: true,
            value: { target: 'value' }
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }

    }


    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get value() { return this._value;}

    set value(val) {
        this._value = kijs.Date.create(val);
        this._visibleMonthDate = kijs.Date.getFirstOfMonth(this._value);
        this._calculateCalendar();
    }

    get inputField() {
        let p = this;
        while (p.parent) {
            if (p.parent instanceof kijs.gui.field.Field) {
                return p.parent;
            }
            p = p.parent;
        }
    }


    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // Overwrite
    render(superCall) {
        super.render(true);

        // Header rendern
        this._headerBar.renderTo(this._dom.node);

        // Kalender berechnen
        this._calculateCalendar();

        // Picker berechnen
        this._calculateMonthYearPicker();

        // Calendar Container
        if (this._showCalendar) {
        this._yearMonthDom.unrender();
        this._calendarDom.renderTo(this._dom.node);

            // Einzelne Elemente
            kijs.Array.each(this._gridColumns, function(column) {
                column.dom.renderTo(this._calendarDom.node);

                kijs.Array.each(column.rows, function(row) {
                    row.dom.renderTo(column.dom.node);
                }, this);
            }, this);
        } else {
            this._calendarDom.unrender();
            this._yearMonthDom.renderTo(this._dom.node);

            this._monthDom.renderTo(this._yearMonthDom.node);
            this._yearDom.renderTo(this._yearMonthDom.node);

            for (let i=0; i<this._monthSelector.length; i++) {
                this._monthSelector[i].dom.renderTo(this._monthDom.node);
            }
            for (let i=0; i<this._yearSelector.length; i++) {
                this._yearSelector[i].dom.renderTo(this._yearDom.node);
            }
        }

        // Button für "Heute"
        if (!this._todayBtn.isEmpty) {
            this._todayBtn.renderTo(this._dom.node);
        } else {
            this._todayBtn.unrender();
        }

        // Event afterRender auslösen
        if (!superCall) {
            this.raiseEvent('afterRender');
        }

        let ip = this.inputField;
        if (ip) {
            ip.on('keyUp', this._onInputKeyUp, this);
        }

    }

    _calculateMonthYearPicker() {
        // Monat
        for (let i=0; i<this._monthSelector.length; i++) {

            // Text
            this._monthSelector[i].dom.html = kijs.Date.months_short[this._monthSelector[i].month];

            // aktueller monat
            if (this._visibleMonthDate && this._visibleMonthDate.getMonth() === this._monthSelector[i].month) {
                this._monthSelector[i].dom.clsAdd('kijs-value');
            } else {
                this._monthSelector[i].dom.clsRemove('kijs-value');
            }
        }

        // Jahr aktualisieren
        for (let i=1; i<this._yearSelector.length-1; i++) {
            // jahr schreiben
            this._yearSelector[i].dom.html = this._yearSelector[i].year;

            // aktuelles Jahr
            if (this._visibleMonthDate && this._visibleMonthDate.getFullYear() === this._yearSelector[i].year) {
                this._yearSelector[i].dom.clsAdd('kijs-value');
            } else {
                this._yearSelector[i].dom.clsRemove('kijs-value');
            }
        }
    }

    _calculateCalendar(rangeTo=null) {
        let offset;
        let day, firstDay, lastDay, monthIndex;

        // Aufbereiten
        rangeTo = rangeTo ? rangeTo : this._rangeTo;

        // Titel schreiben
        this._headerBar.html = kijs.Date.format(this._visibleMonthDate, 'F Y');

        monthIndex = this._visibleMonthDate.getMonth(); // Vorsicht: 0-basierend

        // Erster Tag im Kalender ermitteln
       firstDay = kijs.Date.clone(this._visibleMonthDate);
       offset = firstDay.getDay() - this._startWeekday;
       if (offset < 0) offset += 7;
       firstDay = kijs.Date.addDays(firstDay, offset*-1);


       // letzter Tag im Kalender ermitteln
       lastDay = kijs.Date.getLastOfMonth(this._visibleMonthDate);
       offset = this._startWeekday - lastDay.getDay() - 1;
       if (offset < 0) offset += 7;
       lastDay = kijs.Date.addDays(lastDay, offset);

       // Spaltenüberschriften (Mo-Fr)
       for (let i=0; i<this._gridColumns[0].rows.length; i++) {
           let fldDom = this._gridColumns[0].rows[i].dom;
           fldDom.clsAdd('kijs-head');
           if (i === 0)  {
               fldDom.clsAdd('kijs-weekno');
               fldDom.html = this._showWeekNumbers ? '&nbsp;' : '';

           } else {
               let wdNo = (i - 1) + this._startWeekday;
               if (wdNo > 6) {
                   wdNo -= 7;
               }
               fldDom.html = kijs.Date.weekdays_short[wdNo];

                if (wdNo === 0 || wdNo === 6) {
                    fldDom.clsAdd('kijs-weekend');
                } else {
                    fldDom.clsRemove('kijs-weekend');
                }
           }
       }

       day = kijs.Date.clone(firstDay);

       // Kalender-Zeilen
       for (let i=1; i < this._gridColumns.length; i++) {

           if (this._weekSelect) {
               this._gridColumns[i].dom.clsAdd('kijs-weekselect');
               this._gridColumns[i].dom.clsRemove('kijs-dayselect');
           } else {
               this._gridColumns[i].dom.clsAdd('kijs-dayselect');
               this._gridColumns[i].dom.clsRemove('kijs-weekselect');
           }

           // Kalender-Spalten
           for (let x=1; x<8; x++) {
               let fldDom = this._gridColumns[i].rows[x].dom;

               // datum eintragen
               this._gridColumns[i].rows[x].date = kijs.Date.clone(day);

               // Tag schreiben
               fldDom.html = kijs.Date.format(day, 'j');

               // Tag ausserhalb vom Monat?
               if (day.getMonth() !== monthIndex) {
                    fldDom.clsAdd('kijs-outofmonth');
               } else {
                    fldDom.clsRemove('kijs-outofmonth');
               }

               // aktueller Tag?
               if (kijs.Date.getDatePart(day).getTime() === kijs.Date.getDatePart(new Date()).getTime()) {
                   fldDom.clsAdd('kijs-today');
               } else {
                   fldDom.clsRemove('kijs-today');
               }

               // Weekend?
               if (day.getDay() === 0 || day.getDay() === 6) {
                   fldDom.clsAdd('kijs-weekend');
               } else {
                   fldDom.clsRemove('kijs-weekend');
               }

               // selektiertes Datum?
                if (this._value instanceof Date && kijs.Date.getDatePart(day).getTime() === kijs.Date.getDatePart(this._value).getTime()) {
                    fldDom.clsAdd('kijs-value');
                } else {
                    fldDom.clsRemove('kijs-value');
                }

                // range start
                if (this._rangeFrom && rangeTo && kijs.Date.getDatePart(day).getTime() === kijs.Date.getDatePart(this._rangeFrom).getTime()) {
                    fldDom.clsAdd('kijs-range-start');
                } else {
                    fldDom.clsRemove('kijs-range-start');
                }

                // range end
                if (this._rangeFrom && rangeTo && kijs.Date.getDatePart(day).getTime() === kijs.Date.getDatePart(rangeTo).getTime()) {
                    fldDom.clsAdd('kijs-range-end');
                } else {
                    fldDom.clsRemove('kijs-range-end');
                }

                // range between
                if (this._rangeFrom && rangeTo && kijs.Date.getDatePart(day).getTime() > kijs.Date.getDatePart(this._rangeFrom).getTime()
                        && kijs.Date.getDatePart(day).getTime() < kijs.Date.getDatePart(rangeTo).getTime()) {
                    fldDom.clsAdd('kijs-range-between');
                } else {
                    fldDom.clsRemove('kijs-range-between');
                }

               // Wochen-Nummer schreiben
               if (x===1) {
                   this._gridColumns[i].rows[0].dom.html = this._showWeekNumbers ? parseInt(kijs.Date.format(day, 'W')) : '';
                   this._gridColumns[i].rows[0].dom.clsAdd('kijs-weekno');
               }

               // 1 Tag addieren
               day.setDate(day.getDate()+1);
           }


       }

    }

    _getElementByDom(dom) {
        for (let y=0; y < this._gridColumns.length; y++) {
            for (let x=0; x < this._gridColumns[y].rows.length; x++) {
                if (dom === this._gridColumns[y].rows[x].dom || dom === this._gridColumns[y].rows[x].dom.dom) {
                    return this._gridColumns[y].rows[x];
                }
            }
        }

        for (let i=0; i<this._monthSelector.length; i++) {
            if (this._monthSelector[i].dom === dom ||this._monthSelector[i].dom.dom === dom) {
                return this._monthSelector[i];
            }
        }

        for (let i=0; i<this._yearSelector.length; i++) {
            if (this._yearSelector[i].dom === dom || this._yearSelector[i].dom.dom === dom) {
                return this._yearSelector[i];
            }
        }

        return null;
    }

    _setYearPicker(year) {
        year -= 2;
        for (let i=1; i<this._yearSelector.length-1; i++) {
            this._yearSelector[i].year = year;
            year++;
        }
    }

    // EVENTS
    _onNextBtnClick() {
        this._visibleMonthDate.setMonth(this._visibleMonthDate.getMonth()+1);
        this._setYearPicker(this._visibleMonthDate.getFullYear());
        this._calculateCalendar();
        this._calculateMonthYearPicker();
    }

    _onPreviousBtnClick() {
        this._visibleMonthDate.setMonth(this._visibleMonthDate.getMonth()-1);
        this._setYearPicker(this._visibleMonthDate.getFullYear());
        this._calculateCalendar();
        this._calculateMonthYearPicker();
    }
    _onDateMouseClick(e) {
        let dt = this._getElementByDom(e.dom);
        if (dt && dt.date instanceof Date) {
            this.value = dt.date;
        }
        if (this.inputField) {
            this.inputField.focus();
        }

        this.raiseEvent('dateChanged', this.value);
    }

    _onDateMouseEnter(e) {
        let dt = this._getElementByDom(e.dom);

        // range zeichen
        if (!dt.isHeader && !dt.isWeekNr && dt.date instanceof Date) {
            this._calculateCalendar(dt.date);
        }
    }

    _onCalendarMouseLeave() {
        // Kalender mit standardwerten zeichnen
        this._calculateCalendar();
    }

    _onInputKeyUp(e) {
        if (this._dom.node && kijs.Array.contains(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'], e.nodeEvent.key)) {
            e.nodeEvent.preventDefault();
            if (this.value instanceof Date) {
                switch (e.nodeEvent.key) {
                    case 'ArrowUp': this.value = kijs.Date.addDays(this.value, -7); break;
                    case 'ArrowDown': this.value = kijs.Date.addDays(this.value, 7); break;
                    case 'ArrowLeft': this.value = kijs.Date.addDays(this.value, -1); break;
                    case 'ArrowRight': this.value = kijs.Date.addDays(this.value, 1); break;
                }
                this.raiseEvent('dateChanged', this.value);
            }
        } else if (this._dom.node && e.nodeEvent.key === 'Enter') {
            this.raiseEvent('dateSelected', this.value);
        }
    }

    _onCalendarWheel(e) {
        if (e.nodeEvent.deltaY < 0) {
            this._onPreviousBtnClick();
        } else {
            this._onNextBtnClick()
        }
    }

    _onHeaderBarClick() {
        this._showCalendar = !this._showCalendar;
        this.render();
    }

    _onTodayButtonClick(e) {
        this._value = kijs.Date.getDatePart(new Date());
        this._visibleMonthDate = kijs.Date.getFirstOfMonth(this._value);
        this._setYearPicker(this._visibleMonthDate.getFullYear());
        this._calculateCalendar();
        this._calculateMonthYearPicker();

        if (this.inputField) {
            this.inputField.focus();
        }
        this.raiseEvent('dateChanged', this.value);
        this.raiseEvent('dateSelected', this.value);
    }

    _onMonthSelectorClick(e) {
        let m = this._getElementByDom(e.dom);
        if (m.month || m.month === 0) {
            this._visibleMonthDate.setMonth(m.month);
            this._calculateCalendar();
            this._calculateMonthYearPicker();
        }

        if (this.inputField) {
            this.inputField.focus();
        }
    }

    _onYearSelectorClick(e) {
        let y = this._getElementByDom(e.dom);
        if (y.year) {
            this._visibleMonthDate.setFullYear(y.year);
            this._calculateCalendar();
            this._calculateMonthYearPicker();
        }

        if (this.inputField) {
            this.inputField.focus();
        }
    }

    _onYearSelectorUpClick() {
        for (let i=1; i<this._yearSelector.length-1; i++) {
            this._yearSelector[i].year--;
        }
        this._calculateCalendar();
        this._calculateMonthYearPicker();

        if (this.inputField) {
            this.inputField.focus();
        }
    }

    _onYearSelectorDownClick() {
        for (let i=1; i<this._yearSelector.length-1; i++) {
            this._yearSelector[i].year++;
        }
        this._calculateCalendar();
        this._calculateMonthYearPicker();

        if (this.inputField) {
            this.inputField.focus();
        }
    }

    _onYearSelectorWheel(e) {
        if (e.nodeEvent.deltaY < 0) {
            this._onYearSelectorUpClick();
        } else {
            this._onYearSelectorDownClick();
        }
    }


    // overwrite
    unrender(superCall) {
        // Event auslösen.
        if (!superCall) {
            this.raiseEvent('unrender');
        }

        this._headerBar.unrender();
        this._calendarDom.unrender();
        this._todayBtn.unrender();
        super.unrender(true);
    }


    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------

    destruct(superCall) {
        if (!superCall) {
            // unrendern
            this.unrender(superCall);

            // Event auslösen.
            this.raiseEvent('destruct');
        }

        // Elemente/DOM-Objekte entladen
        if (this._headerBar) {
            this._headerBar.destruct();
        }
        if (this._calendarDom) {
            this._calendarDom.destruct();
        }
        if (this._todayBtn) {
            this._todayBtn.destruct();
        }


        // Variablen (Objekte/Arrays) leeren
        this._nextBtn = null;
        this._previousBtn = null;
        this._headerBar = null;

        this._calendarDom = null;
        this._todayBtn = null;

        // Basisklasse entladen
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
        Object.assign(this._defaultConfig, {
            // keine
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            disabled: { target: 'disabled' },
            iconChar: { target: 'html', context: this._dom },   // Alias für html
            iconCls: { target: 'iconCls' },
            iconColor: { target: 'iconColor' }
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
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
            throw new kijs.Error(`config "iconCls" is not a string`);
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
// Mit dem Attribut "text" kann ein Text unterhalb des icons angezeigt werden.
// --------------------------------------------------------------
kijs.gui.Mask = class kijs_gui_Mask extends kijs.gui.Element {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        this._iconEl = new kijs.gui.Icon({ parent: this });
        this._textEl = new kijs.gui.Dom({cls:'kijs-mask-text'});

        this._targetX = null;           // Zielelement (kijs.gui.Element) oder Body (HTMLElement)
        this._targetDomProperty = 'dom'; // Dom-Eigenschaft im Zielelement (String) (Spielt bei Body als target keine Rolle)

        this._dom.clsAdd('kijs-mask');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            target: document.body
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            displayWaitIcon: { target: 'displayWaitIcon' },
            icon: { target: 'icon' },
            iconChar: { target: 'iconChar', context: this._iconEl },
            iconCls: { target: 'iconCls', context: this._iconEl },
            iconColor: { target: 'iconColor', context: this._iconEl },
            target: { target: 'target' },
            text: { target: 'html', context: this._textEl },
            targetDomProperty: true
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
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
            throw new kijs.Error(`config "icon" is not valid.`);

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
            if (this._targetX[this._targetDomProperty].node.parentNode) {
                return this._targetX[this._targetDomProperty].node.parentNode;
            } else {
                // Vielleicht ist es besser wenigstens auf dem Node eine Maske anzuzeigen falls es keinen Parent gibt (Window).
                // Falls nicht halt gar keine Maske anzeigen.
                return this._targetX[this._targetDomProperty].node;
            }
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
        } else if (val === document.body || kijs.isEmpty(val)) {
            this._targetX = document.body;

        } else {
            throw new kijs.Error(`Unkown format on config "target"`);

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


    get text() { return this._textEl.html; }
    set text(val) { this._textEl.html = val; }




    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // Overwrite
    render(superCall) {
        super.render(true);

        // Maskierung positionieren
        this._updateMaskPosition();

        // Span icon rendern (kijs.gui.Icon)
        if (!this._iconEl.isEmpty) {
            this._iconEl.renderTo(this._dom.node);
        } else {
            this._iconEl.unrender();
        }

        this._textEl.renderTo(this._dom.node);

        // Event afterRender auslösen
        if (!superCall) {
            this.raiseEvent('afterRender');
        }
    }

    // overwrite
    unrender(superCall) {
        // Event auslösen.
        if (!superCall) {
            this.raiseEvent('unrender');
        }

        this._iconEl.unrender();
        this._textEl.unrender();
        super.unrender(true);
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
    destruct(superCall) {
        if (!superCall) {
            // unrender
            this.unrender(superCall);

            // Event auslösen.
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

        if (this._textEl) {
            this._textEl.destruct();
        }

        // Basisklasse entladen
        super.destruct(true);

        // Variablen (Objekte/Arrays) leeren
        this._iconEl = null;
        this._targetX = null;
    }
};
/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.ProgressBar
// --------------------------------------------------------------
/**
 * ProgressBar Element, welches einen Ladebalken anzeigt.
 *
 * KLASSENHIERARCHIE
 * kijs.gui.Element
 *  kijs.gui.ProgressBar
 *
 * EVENTS
 * ----------
 *

 */
kijs.gui.ProgressBar = class kijs_gui_ProgressBar extends kijs.gui.Element {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        this._percent = 0;
        this._showPercent = true;
        this._fileUpload = null;
        this._fileUploadId = null;

        this._captionDom = new kijs.gui.Dom();
        this._bottomCaptionDom = new kijs.gui.Dom();

        this._fieldDom = new kijs.gui.Dom();
        this._barDom = new kijs.gui.Dom();
        this._textDom = new kijs.gui.Dom();

        this._dom.clsAdd('kijs-progressbar');
        this._captionDom.clsAdd('kijs-progressbar-caption');
        this._bottomCaptionDom.clsAdd('kijs-progressbar-caption-bottom');

        this._fieldDom.clsAdd('kijs-progressbar-field');
        this._barDom.clsAdd('kijs-progressbar-bar');
        this._textDom.clsAdd('kijs-progressbar-text');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            percent: 0,
            showPercent: true
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            showPercent: true,
            caption: { target: 'html', context: this._captionDom },
            bottomCaption: { target: 'html', context: this._bottomCaptionDom },
            percent: { target: 'percent' },
            fileUpload: { target: 'fileUpload' },
            fileUploadId: { target: 'fileUploadId' }
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }
    }


    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------

    get caption() { return this._captionDom.html; }
    set caption(val) { this._captionDom.html = val;  }

    get bottomCaption() { return this._bottomCaptionDom.html; }
    set bottomCaption(val) { this._bottomCaptionDom.html = val;  }

    get percent() { return this._percent; }
    set percent(val) { this.setProgress(val); }

    get fileUpload() { return this._fileUpload; }
    set fileUpload(val) { this.bindFileUpload(val); }

    get fileUploadId() { return this._fileUploadId; }
    set fileUploadId(val) { this._fileUploadId = val; }


    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------

    /**
     * Binden einen kijs.Uploaddialog an die Progressbar, um den Upload-Fortschritt
     * anzuzeigen.
     * @param {kijs.FileUpload} fileUpload
     * @param {Int} [uploadId] ID vom Upload. Wenn null übergeben wird, wird der erste genommen.
     * @returns {undefined}
     */
    bindFileUpload(fileUpload, uploadId=null) {
        if (!(fileUpload instanceof kijs.FileUpload)) {
            throw new kijs.Error('Upload Dialog must be of type kijs.FileUpload');
        }

        // Events entfernen, wenn bereits eine Klasse verknüpft war.
        if (this._fileUpload instanceof kijs.FileUpload) {
            this._fileUpload.off(null, null, this);
        }

        this._fileUpload = fileUpload;
        if (uploadId !== null) {
            this._fileUploadId = uploadId;
        }

        fileUpload.on('progress', this._onFileUploadProgress, this);
        fileUpload.on('upload', this._onFileUploadUpload, this);
    }

    /**
     * aktualisiert den Balken
     * @param {int} percent Prozent zwischen 0-100
     * @returns {undefined}
     */
    setProgress(percent) {
        percent = window.parseInt(percent);
        if (window.isNaN(percent) || percent < 0 || percent > 100) {
            throw new kijs.Error('percent must be numeric between 0 and 100');
        }

        this._percent = percent;
        this._textDom.html = this._showPercent ? this._percent + '%' : '';

        if (this._barDom.node) {
            this._barDom.node.style.width = this._percent + '%';
        }

        if (this._showPercent && this._textDom.node) {
            if (this._barDom.width >= this._textDom.width+3 || this._percent === 100) {
                this._textDom.node.style.opacity = 1;

            } else {
                this._textDom.node.style.opacity = 0;
            }
        }
    }


    // overwrite
    render(superCall) {
        super.render(true);

        // innerDOM rendern
        this._captionDom.renderTo(this._dom.node);
        this._fieldDom.renderTo(this._dom.node);
        this._bottomCaptionDom.renderTo(this._dom.node);
        this._barDom.renderTo(this._fieldDom.node);
        if (this._showPercent) {
            this._textDom.renderTo(this._fieldDom.node);
        }

        this._barDom.node.style.width = this._percent + '%';

        if (this._showPercent && (this._barDom.width >= this._textDom.width+3 || this._percent === 100)) {
            this._textDom.node.style.opacity = 1;
        }

        // Event afterRender auslösen
        if (!superCall) {
            this.raiseEvent('afterRender');
        }
    }

    // overwrite
    unrender(superCall) {
        // Event auslösen.
        if (!superCall) {
            this.raiseEvent('unrender');
        }

        this._barDom.unrender();
        this._textDom.unrender();

        super.unrender(true);
    }


    _onFileUploadProgress(ud, e, id, percent) {
        if (this._fileUploadId === null) {
            this._fileUploadId = id;
        }

        if (kijs.isInteger(percent) && this._fileUploadId === id) {
            this.setProgress(percent);
        }
    }

    // Upload fertig
    _onFileUploadUpload(ud, resp, error, id) {
        if (this._fileUploadId === id) {
            this.setProgress(100);
        }
    }


    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(superCall) {
        if (!superCall) {
            // unrender
            this.unrender(superCall);

            // Event auslösen.
            this.raiseEvent('destruct');
        }

        // Events entfernen
        if (this._fileUpload instanceof kijs.FileUpload) {
            this._fileUpload.off(null, null, this);
        }

        this._captionDom.destruct();
        this._bottomCaptionDom.destruct();

        this._fieldDom.destruct();
        this._barDom.destruct();
        this._textDom.destruct();

        this._captionDom = null;
        this._bottomCaptionDom = null;

        this._fieldDom = null;
        this._barDom = null;
        this._textDom = null;

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
        super(false);

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
        Object.assign(this._defaultConfig, {
            // keine
        });

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
            config = Object.assign({}, this._defaultConfig, config);
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
        this._overlayDom.unrender();
    }


    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(superCall) {
        if (!superCall) {
            // unrender
            this.unrender(superCall);

            // Event auslösen.
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

        this._initialPos = null;
        this._targetPos = null;
        this._targetEl = null;      // Zielelement (kijs.gui.Element)

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            targetPos: 'left'
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            target: { target: 'target' },   // Optional. Wenn leer wird das Target aufgrund der targetPos ermittelt
            targetPos: { target: 'targetPos' }
        });

        // Listeners
        this.on('mouseDown', this._onMouseDown, this);

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
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
            throw new kijs.Error(`unknown targetPos`);
        }
    }

    get target() {
        // Falls das Target nicht bekannt ist: automatisch aufgrund der targetPos ermitteln
        if (!this._targetEl) {
            this.target = this._detectTarget();
            if (!this._targetEl) {
                throw new kijs.Error(`config missing "target"`);
            }
        }

        return this._targetEl;
    }
    set target(val) {
        if (!val instanceof kijs.gui.Element) {
            throw new kijs.Error(`Unkown format on config "target"`);
        }
        this._targetEl = val;
    }

    get targetPos() { return this._targetPos; }
    set targetPos(val) {
        if (!kijs.Array.contains(['top', 'right', 'left', 'bottom'], val)) {
            throw new kijs.Error(`unknown targetPos`);
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
        this._overlayDom.unrender();

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
    destruct(superCall) {
        if (!superCall) {
            // unrender
            this.unrender(superCall);

            // Event auslösen.
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
// kijs.gui.TimePicker
// --------------------------------------------------------------
kijs.gui.TimePicker = class kijs_gui_TimePicker extends kijs.gui.Element {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        this._hasSeconds = false;
        this._separator;
        this._hour = 0;
        this._minute = 0;
        this._second = 0;

        this._canvas = null;            // canvas context objekt
        this._canvasSize  = null;       // Grösse des Canvas
        this._clockRadius = null;       // Radius der Uhr
        this._clockColor = '#f6f6f6';   // Farbe des Ziffernblattes
        this._clockMode = 1;            // 1=Stunde 2=Minute 3=Sekunde
        this._distance = {
            hourAm: 32,                 // Distanz vom Kreisrand für Stunden 1-12
            hourPm: 12,                 // Distanz vom Kreisrand für Stunden 13-24
            minute: 20,                 // Distanz vom Kreisrand für Minuten
            second: 20                  // Distanz vom Kreisrand für Sekunden
        };

        this._headerBar = new kijs.gui.PanelBar({
            cls: 'kijs-headerbar-center'
        });

        this._timeDom = new kijs.gui.Dom({
            cls: 'kijs-inputcontainer'
        });
        this._inputHourDom = new kijs.gui.Dom({
            cls: 'kijs-hour',
            nodeTagName: 'input',
            nodeAttribute: {
                maxLength: 2
            },
            on: {
                blur: this._onTimeBlur,
                change: this._onTimeChange,
                click: this._onTimeClick,
                focus: this._onTimeFocus,
                keyUp: this._onTimeKeyUp,
                context: this
            }
        });
        this._inputMinuteDom = new kijs.gui.Dom({
            cls: 'kijs-minute',
            nodeTagName: 'input',
            nodeAttribute: {
                maxLength: 2
            },
            on: {
                blur: this._onTimeBlur,
                change: this._onTimeChange,
                click: this._onTimeClick,
                focus: this._onTimeFocus,
                keyUp: this._onTimeKeyUp,
                context: this
            }
        });
        this._inputSecondDom = new kijs.gui.Dom({
            cls: 'kijs-second',
            nodeTagName: 'input',
            nodeAttribute: {
                maxLength: 2
            },
            on: {
                blur: this._onTimeBlur,
                change: this._onTimeChange,
                click: this._onTimeClick,
                focus: this._onTimeFocus,
                keyUp: this._onTimeKeyUp,
                context: this
            }
        });

        this._canvasContainerDom = new kijs.gui.Dom({
            cls: 'kijs-canvascontainer'
        });

        this._canvasDom = new kijs.gui.Dom({
            nodeTagName: 'canvas',
            on: {
                mouseMove: this._onCanvasMouseMove,
                mouseLeave: this._onCanvasMouseLeave,
                click: this._onCanvasMouseClick,
                context: this
            }
        });

        // Button 'jetzt'
        this._nowBtn = new kijs.gui.Button({
            parent: this,
            on: {
                click: this._onNowButtonClick,
                context: this
            }
        });

        this._dom.clsAdd('kijs-timepicker');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            headerText: kijs.getText('Uhrzeit'),
            nowText: kijs.getText('Jetzt'),
            separator: ':',
            value: '00:00'
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            nowText: { target: 'caption', context: this._nowBtn },
            headerText: { target: 'html', context: this._headerBar },
            value: { target: 'value' },
            hasSeconds: true,
            separator: true,
            clockColor: true
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }
    }


    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------

    get hasSeconds() { return this._hasSeconds; }
    set hasSeconds(val) { this._hasSeconds = !!val; }

    get value() {
        let val = '';
        val += this._zeroPad(this._hour) + this._separator + this._zeroPad(this._minute);
        if (this._hasSeconds) {
            val += this._separator + this._zeroPad(this._second);
        }
        return val;
    }

    set value(val) {
        val = kijs.toString(val);
        val = val.split(this._separator);

        this._hour = val[0] ? parseInt(val[0]) : 0;
        this._minute = val[1] ? parseInt(val[1]) : 0;
        this._second = val[2] && this._hasSeconds ? parseInt(val[2]) : 0;
        this._clockMode = 1;

        if (this._hour === 24) {
            this._hour = 0;
        }
        if (this._minute === 60) {
            this._minute = 0;
        }
        if (this._second === 60) {
            this._second = 0;
        }

        if (this._hour > 23 || this._hour < 0) {
            throw new kijs.Error('invalid time: hour');
        }
        if (this._minute > 60 || this._minute < 0) {
            throw new kijs.Error('invalid time: minute');
        }
        if (this._second > 60 || this._second < 0) {
            throw new kijs.Error('invalid time: second');
        }

        // zeichnen falls gerendert
        if (this._dom.node) {
            this.paint();
        }

        if (this._inputHourDom.node) {
            this._inputHourDom.node.value = this._zeroPad(this._hour);
        }
        if (this._inputMinuteDom.node) {
            this._inputMinuteDom.node.value = this._zeroPad(this._minute);
        }
        if (this._inputSecondDom.node) {
            this._inputSecondDom.node.value = this._zeroPad(this._second);
        }
        return;
    }

    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------

    // Overwrite
    render(superCall) {
        super.render(true);

        // HeaderBar
        if (!this._headerBar.isEmpty) {
            this._headerBar.renderTo(this._dom.node);
        } else {
            this._headerBar.unrender();
        }

        // Time DOM
        this._timeDom.renderTo(this._dom.node);
        this._inputHourDom.renderTo(this._timeDom.node);
        new kijs.gui.Dom({nodeTagName: 'span', html: this._separator}).renderTo(this._timeDom.node);
        this._inputMinuteDom.renderTo(this._timeDom.node);
        if (this._hasSeconds) {
            new kijs.gui.Dom({nodeTagName: 'span', html: this._separator}).renderTo(this._timeDom.node);
            this._inputSecondDom.renderTo(this._timeDom.node);
        } else {
            this._inputSecondDom.unrender();
        }

        // Canvas für timepicker
        this._canvasContainerDom.renderTo(this._dom.node);
        this._canvasDom.renderTo(this._canvasContainerDom.node);

        // Context
        this._canvas =  this._canvasDom.node.getContext('2d');

        // Button für "Jetzt"
        if (this._nowBtn.caption) {
            this._nowBtn.renderTo(this._dom.node);
        } else {
            this._nowBtn.unrender();
        }

        // Werte Schreiben
        if (this._inputHourDom.node) {
            this._inputHourDom.node.value = this._zeroPad(this._hour);
        }
        if (this._inputMinuteDom.node) {
            this._inputMinuteDom.node.value = this._zeroPad(this._minute);
        }
        if (this._inputSecondDom.node) {
            this._inputSecondDom.node.value = this._zeroPad(this._second);
        }

        // Event afterRender auslösen
        if (!superCall) {
            this.raiseEvent('afterRender');
        }

        // canvas zeichnen
        kijs.defer(function() {
            this.paint();
        }, 10, this);
    }

    // overwrite
    unrender(superCall) {
        // Event auslösen.
        if (!superCall) {
            this.raiseEvent('unrender');
        }

        this._headerBar.unrender();
        this._inputHourDom.unrender();
        this._inputMinuteDom.unrender();
        this._inputSecondDom.unrender();
        this._timeDom.unrender();
        this._canvasDom.unrender();
        this._canvasContainerDom.unrender();
        this._nowBtn.unrender();
        super.unrender(true);
    }

    paint(pointerPos=null) {
        // Grösse einstellen.
        this._canvasSize = Math.min(this._canvasContainerDom.width, this._canvasContainerDom.height);
        if (this._canvasSize === 0 || !this._canvasDom.node) {
            return;
        }

        this._canvasDom.node.width = this._canvasSize;
        this._canvasDom.node.height = this._canvasSize;
        this._clockRadius = this._canvasSize / 2 - 1;

        // Löschen
        this._canvas.clearRect(0, 0, this._canvasSize, this._canvasSize);

        // Hintergrund
        this._drawBackground();

        // zeiger-pos von Uhrzeit
        if (pointerPos === null && this._clockMode === 1) {
            pointerPos = this._degreeByHour(this._hour);
        }
        if (pointerPos === null && this._clockMode === 2) {
            pointerPos = this._degreeByMinute(this._minute);
        }
        if (pointerPos === null && this._clockMode === 3) {
            pointerPos = this._degreeBySecond(this._second);
        }

        // Zeiger
        this._drawPointer(pointerPos.degree, pointerPos.distance);

        // Stunden
        if (this._clockMode === 1) {
            this._drawHours();
        }
        if (this._clockMode === 2) {
            this._drawMinutes();
        }
        if (this._clockMode === 3) {
            this._drawSeconds();
        }
    }

    _drawBackground() {
        // Kreis für Uhr zeichnen
        this._canvas.beginPath();
        this._canvas.fillStyle = this._clockColor;
        this._canvas.arc(
                (this._canvasSize / 2),
                (this._canvasSize / 2),
                this._clockRadius,
                0,
                Math.PI*2
            );
        this._canvas.fill();
    }

    _drawHours() {
        for (let i=1;i<=24;i++) {
            let dist = i <= 12 ? this._distance.hourAm : this._distance.hourPm;
            let deg = i <= 12 ? i * 30 : (i*30)-360;
            let size = i <= 12 ? 15 : 10;
            let text = i != 24 ? i : '00';
            this._addTextToArc(text, size, deg, dist);
        }
    }

    _drawMinutes() {
        for (let i=0;i<12;i++) {
            let text = i != 0 ? i*5 : '00';
            this._addTextToArc(text, 15, (i*30), this._distance.minute);
        }
    }

    _drawSeconds() {
        for (let i=0;i<12;i++) {
            let text = i != 0 ? i*5 : '00';
            this._addTextToArc(text, 15, (i*30), this._distance.second);
        }
    }

    _drawPointer(degree, distance) {
        let coords = this._degreeToCoordinates(degree, distance);
        this._canvas.beginPath();
        this._canvas.strokeStyle = '#d9e7fd';
        this._canvas.lineWidth = 2.0;
        this._canvas.moveTo(this._clockRadius, this._clockRadius);
        this._canvas.lineTo(coords.x, coords.y);
        this._canvas.stroke();
        this._canvas.beginPath();
        this._canvas.fillStyle = '#d9e7fd';
        this._canvas.arc(coords.x, coords.y, 12, 0, Math.PI*2); // Kreis
        this._canvas.fill();
    }

    _addTextToArc(text, fontSize, degree, distance) {
        let coords = this._degreeToCoordinates(degree, distance);
        this._canvas.font = fontSize+'px Arial,sans-serif';
        this._canvas.fillStyle = '#000';

        let measure = this._canvas.measureText(text);
        this._canvas.fillText(text, coords.x - (measure.width /2), coords.y + (fontSize / 2));
    }

    _degreeToCoordinates(degree, distance) {
        degree = degree+90;
        // h = c * sinus(degree)
        let a = (this._clockRadius - distance) * Math.sin(degree * ((Math.PI)/180));
        let b = Math.sqrt(Math.pow((this._clockRadius - distance),2) - Math.pow(a,2));

        let x=0,y=0;
        if (degree <= 270) {
            x = (this._canvasSize / 2)+b, y = (this._canvasSize / 2) - a;
        } else {
            x = (this._canvasSize / 2)-b, y = (this._canvasSize / 2) - a;
        }

        return {x: x, y: y};
    }

    _degreeByHour(hour) {
        let ret = {degree: 0, distance: 0};
        ret.distance = hour < 13 && hour > 0 ? this._distance.hourAm : this._distance.hourPm;
        if (hour > 11) {
            hour -= 12;
        }
        ret.degree = hour * 30;
        return ret;
    }

    _degreeByMinute(minute) {
        return {degree: minute / 60 * 360, distance: this._distance.minute};
    }

    _degreeBySecond(second) {
        return {degree: second / 60 * 360, distance: this._distance.second};
    }

    _coordinatesToDegree(ox, oy) {
        let x = ox - (this._canvasSize / 2);
        let y = (this._canvasSize / 2) - oy;

        let c = Math.sqrt(Math.pow(y,2) + Math.pow(x,2));
        let distance = this._clockRadius - c;
        let alphaRad =  Math.asin(y/c);
        let degree = 90 - (alphaRad / (Math.PI/180));

        if (ox < (this._canvasSize /2)) {
            degree = (180 - degree) + 180;
        }

        return {degree: degree, distance: distance};
    }

    // EVENTS

    /**
     * Beim bewegen der Maus wird die Kelle darunter angezeigt.
     * @param {Object} e
     * @returns {undefined}
     */
    _onCanvasMouseMove(e) {
        let x = e.nodeEvent.layerX, y = e.nodeEvent.layerY, pointerPos = {};
        let dg = this._coordinatesToDegree(x, y);

        // auf 30 grad runden
        pointerPos.degree = Math.round(dg.degree / 30) * 30;

        if (this._clockMode === 1) {
            pointerPos.distance = dg.distance > ((this._distance.hourAm+this._distance.hourPm)/2) ? this._distance.hourAm : this._distance.hourPm;

        } else if (this._clockMode === 2) {
            pointerPos.distance = this._distance.minute;

        } else if (this._clockMode ===  3) {
            pointerPos.distance = this._distance.second;

        } else {
            throw new kijs.Error('invalid clock mode');
        }

        this.paint(pointerPos);
    }

    /**
     * Kelle zurücksetzen
     * @returns {undefined}
     */
    _onCanvasMouseLeave() {
        this.paint();
    }

    /**
     * Beim Klick wird die Uhrzeit übernommen.
     * @param {Object} e
     * @returns {undefined}
     */
    _onCanvasMouseClick(e) {
        let x = e.nodeEvent.layerX, y = e.nodeEvent.layerY;
        let dg = this._coordinatesToDegree(x, y);

        // ausserhalb kreis
        if (dg.distance < 0) {
            return;
        }

        // auf 30 grad runden
        dg.degree = Math.round(dg.degree / 30) * 30;

        // Stunde
        if (this._clockMode === 1) {
            let hour = 12 / 360 * dg.degree;
            if (dg.distance < ((this._distance.hourAm+this._distance.hourPm)/2)) {
                if (hour !== 0) {
                    hour += 12;
                }
            } else if (hour === 0) {
                hour += 12;
            }

            this._hour = hour;
            this._inputHourDom.node.value = this._zeroPad(this._hour);
            this._inputMinuteDom.focus();

        // Minute
        } else if (this._clockMode === 2) {
            let min = 60 / 360 * dg.degree;
            this._minute = min === 60 ? 0 : min;
            this._inputMinuteDom.node.value = this._zeroPad(this._minute);

            if (this._inputSecondDom.node) {
                this._inputSecondDom.focus();
            } else {
                this._inputMinuteDom.focus();
                this.raiseEvent('change', {value: this.value});
            }

        // Sekunde
        } else if (this._clockMode === 3) {
            let sec = 60 / 360 * dg.degree;
            this._second = sec === 60 ? 0 : sec;
            if (this._inputSecondDom.node) {
                this._inputSecondDom.node.value = this._zeroPad(this._second);
                this._inputSecondDom.focus();
            }

            this.raiseEvent('change', {value: this.value});
        }
    }

    /**
     * Wenn die Uhrzeit mit Tastatur eingegeben wird
     * @param {Object} e
     * @returns {undefined}
     */
    _onTimeKeyUp(e) {
        let type, fld = e.context;
        if (fld === this._inputHourDom) {
            type = 'hour';
        }
        if (fld === this._inputMinuteDom) {
            type = 'minute';
        }
        if (fld === this._inputSecondDom) {
            type = 'second';
        }

        // Falsche Zeichen ersetzen
        fld.node.value = fld.node.value.replace(/[^0-9]/, '');

        // Stunden 00 - 23
        if (type === 'hour') {
            // Wenn eine Zahl > 2 eingegeben wurde, 0 padden
            if (fld.node.value.match(/^[3-9]$/)) {
                fld.node.value = '0' + fld.node.value;
            }

            // Wenn zu Grosse zahl eingegeben
            if (fld.node.value.match(/^[0-9]+$/) && parseInt(fld.node.value) > 23) {
                fld.node.value = '00';
            }

        // Minuten/Sekunden 00-59
        } else {
            // Wenn zu Grosse zahl eingegeben
            if (fld.node.value.match(/^[0-9]+$/) && parseInt(fld.node.value) > 59) {
                fld.node.value = '00';
            }
        }

        // wenn eine zahl eingegeben wurde, fokus evtl auf nächstes Feld.
        if (kijs.isString(e.nodeEvent.key) && e.nodeEvent.key.match(/^[0-9]$/)) {
            if (fld.node.value.length === 2) {
                switch (type) {
                    case 'hour':
                        this._inputMinuteDom.focus();
                        this._inputMinuteDom.node.select();
                        break;
                    case 'minute':
                        if (this._inputSecondDom.node) {
                            this._inputSecondDom.focus();
                            this._inputSecondDom.node.select();
                        }
                        break;
                    case 'second':
                        break;
                }
            }

        // ins vordere Feld springen beim Löschen
        } else if (e.nodeEvent.key === 'Backspace' && fld.node.value === '' && (type === 'minute' || type === 'second')) {
            switch (type) {
                case 'minute': this._inputHourDom.focus(); break;
                case 'second': this._inputMinuteDom.focus(); break;
            }
        }
    }

    /**
     * Beim Klick ins Zeitfeld wird alles selektiert, dass überschrieben werden kann.
     * @param {Object} e
     * @returns {undefined}
     */
    _onTimeClick(e) {
        e.context.node.select();
    }

    /**
     * Beim Fokussieren wird die passende Auswahl gezeigt.
     * @param {Object} e
     * @returns {undefined}
     */
    _onTimeFocus(e) {
        let fld = e.context;
        if (fld === this._inputHourDom) {
            this._clockMode = 1;
        }
        if (fld === this._inputMinuteDom) {
            this._clockMode = 2;
        }
        if (fld === this._inputSecondDom) {
            this._clockMode = 3;
        }

        // zeichnen
        this.paint();
    }

    /**
     * Zahlen mit 0 padden, beim verlassen des Feldes
     * @param {Object} e
     * @returns {undefined}
     */
    _onTimeBlur(e) {
        let fld = e.context;
        // 0 padding
        if (fld.node.value.match(/^[0-9]$/)) {
            fld.node.value = '0' + fld.node.value;
        }
    }

    /**
     * Nach dem Ändern Zeit übernehmen
     * @param {Object} e
     * @returns {undefined}
     */
    _onTimeChange(e) {
        let fld = e.context;
        if (fld === this._inputHourDom) {
            this._hour = parseInt(fld.node.value);
        }
        if (fld === this._inputMinuteDom) {
            this._minute = fld.node.value ? parseInt(fld.node.value) : 0;

            if (!this._hasSeconds && fld.node.value !== '') {
                this.raiseEvent('change', {value: this.value});
            }
        }

        if (fld === this._inputSecondDom) {
            this._second = fld.node.value ? parseInt(fld.node.value) : 0;
            if (fld.node.value !== '') {
                this.raiseEvent('change', {value: this.value});
            }
        }

        // zeichnen
        this.paint();
    }

    /**
     * Die aktuelle Zeit übernehmen
     * @returns {undefined}
     */
    _onNowButtonClick() {
        let time = new Date();
        this.value =  '' + time.getHours() + this._separator + time.getMinutes() + this._separator + time.getSeconds();

        // Event
        this.raiseEvent('change', {value: this.value});
    }

    /**
     * Ergänzt die 0 einer Zahl.
     * @param {Integer|String} number
     * @param {Integer} lenght
     * @returns {String}
     */
    _zeroPad(number, lenght=2) {
        number = kijs.toString(number);
        while (number.length < lenght) {
            number = '0' + number;
        }
        return number;
    }

    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------

    destruct(superCall) {
        if (!superCall) {
            // unrendern
            this.unrender(superCall);

            // Event auslösen.
            this.raiseEvent('destruct');
        }

        // Elemente/DOM-Objekte entladen
        if (this._headerBar) {
            this._headerBar.destruct();
        }
        if (this._inputHourDom) {
            this._inputHourDom.destruct();
        }
        if (this._inputMinuteDom) {
            this._inputMinuteDom.destruct();
        }
        if (this._inputSecondDom) {
            this._inputSecondDom.destruct();
        }
        if (this._timeDom) {
            this._timeDom.destruct();
        }
        if (this._canvasDom) {
            this._canvasDom.destruct();
        }
        if (this._canvasContainerDom) {
            this._canvasContainerDom.destruct();
        }
        if (this._nowBtn) {
            this._nowBtn.destruct();
        }

        // Variablen (Objekte/Arrays) leeren
        this._headerBar = null;
        this._inputHourDom = null;
        this._inputMinuteDom = null;
        this._inputSecondDom = null;
        this._timeDom = null;
        this._canvasDom = null;
        this._canvasContainerDom = null;
        this._nowBtn = null;

        // Basisklasse entladen
        super.destruct(true);
    }

};
/* global kijs, this */

// --------------------------------------------------------------
// kijs.Fi.grid.Filter
// --------------------------------------------------------------
/**
 * EVENTS
 * ----------
 *
 */
kijs.gui.grid.Filter = class kijs_gui_grid_Filter extends kijs.gui.Element {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        // dom type
        this._dom.nodeTagName = 'tr';

        this._filters = [];
        this._filterReloadDefer = null;

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            cls: 'kijs-grid-filter',
            visible: false
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            // keine
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }
    }

    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------

    get filters() {
        let filters = [];
        for (let i=0; i<this._filters.length; i++) {
            filters.push(this._filters[i].filter);
        }
        return filters;
    }

    get grid() { return this.parent; }

    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------

    /**
     * Gibt die Filter-Objekte als Array  zurück, welche auf dem Server angewendet werden.
     * @returns {undefined}
     */
    getFilters() {
        let filters = [];

        kijs.Array.each(this.filters, function(filter) {
            if (filter.isFiltered) {
                filters.push(filter.filter);
            }
        }, this);

        return filters;
    }

    /**
     * Setzt alle Filter zurück.
     * @returns {undefined}
     */
    reset() {
        kijs.Array.each(this.filters, function(filter) {
            filter.reset();
        }, this);
    }

    // PROTECTED
    _createFilters() {
        let newColumnConfigs = [];

        // Prüfen, ob für jede columnConfig eine filter existiert.
        // Wenn nicht, in Array schreiben.
        kijs.Array.each(this.grid.columnConfigs, function(columnConfig) {
            let exist = false;
            for (let i=0; i<this._filters.length; i++) {
                if (this._filters[i].columnConfig === columnConfig) {
                    exist = true;
                    break;
                }
            }
            if (!exist) {
                newColumnConfigs.push(columnConfig);
            }
        }, this);

        // Falls filter noch nicht vorhanden, neue filter erstellen.
        kijs.Array.each(newColumnConfigs, function(columnConfig) {
            let filterConfig = columnConfig.filterConfig;
            let constr = kijs.getObjectFromNamespace(filterConfig.xtype);

            if (!constr) {
                throw new kijs.Error('invalid filter xtype for column ' + columnConfig.caption);
            }

            // change listener
            columnConfig.on('change', this._onColumnConfigChange, this);

            filterConfig.parent = this;
            delete filterConfig.xtype;

            let filter = new constr(filterConfig);
            filter.on('filter', this._onFilter, this);
            this._filters.push({columnConfig: columnConfig, filter: filter});
        }, this);
    }

    _sortFilters() {
        this._filters.sort(function(a, b) {
            if (a.columnConfig.position < b.columnConfig.position) {
                return -1;
            }
            if (a.columnConfig.position > b.columnConfig.position) {
                return 1;
            }
            return 0;
        });
    }

    // EVENTS
    _onColumnConfigChange(e) {
        if ('visible' in e || 'width' in e) {
            kijs.Array.each(this.filters, function(filter) {
                if (e.columnConfig === filter.columnConfig) {
                    filter.render();
                    return false;
                }
            }, this);

        }
        if ('position' in e) {
            this.render();
        }
    }

    _onFilter(e) {
        // Filter verzögert zurücksetzen, da der "filter"
        // event gleich mehrmals von mehreren Filter kommen kann.
        if (this._filterReloadDefer) {
            window.clearTimeout(this._filterReloadDefer);
            this._filterReloadDefer = null;
        }

        this._filterReloadDefer = kijs.defer(function() {
            this.grid.reload();
        }, 20, this);
    }

    // Overwrite
    render(superCall) {
        super.render(true);

        // filters erstellen
        this._createFilters();

        // filters sortieren
        this._sortFilters();

        // filters rendern
        kijs.Array.each(this.filters, function(filter) {
            filter.renderTo(this._dom.node);
        }, this);

        // Event afterRender auslösen
        if (!superCall) {
            this.raiseEvent('afterRender');
        }
    }

    // overwrite
    unrender(superCall) {
        // Event auslösen.
        if (!superCall) {
            this.raiseEvent('unrender');
        }

        // filters unrendern
        kijs.Array.each(this.filters, function(filter) {
            filter.unrender();
        }, this);

        super.unrender(true);
    }


    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(superCall) {
        if (!superCall) {
            // unrendern
            this.unrender(superCall);

            // Event auslösen.
            this.raiseEvent('destruct');
        }

        // filters destructen
        kijs.Array.each(this.filters, function(filter) {
            filter.columnConfig.off('change', this._onColumnConfigChange, this);
            filter.destruct();
        }, this);

        // Variablen (Objekte/Arrays) leeren
        this._filters = null;
        if (this._dataRow) {
            this._dataRow = null;
        }

        // Basisklasse entladen
        super.destruct(true);
    }
};
/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.grid.Grid
// --------------------------------------------------------------
/**
 * EVENTS
 * ----------
 * afterLoad
 * beforeSelectionChange
 * selectionChange
 * rowClick
 * rowDblClick
 *
 */
kijs.gui.grid.Grid = class kijs_gui_grid_Grid extends kijs.gui.Element {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        this._rpc = null;
        this._rows = [];
        this._columnConfigs = [];
        this._primaryKeys = [];
        this._facadeFnLoad = null;
        this._facadeFnSave = null;
        this._facadeFnArgs = null;
        this._facadeFnBeforeMsgFn = null;
        this._waitMaskTarget = null;
        this._waitMaskTargetDomProperty = null;

        this._autoLoad = true;        // Datensätze nach dem Rendern automatisch vom Server laden
        this._remoteDataLoaded = 0;   // Anzahl geladene Datensätze
        this._remoteDataLimit = 50;   // Anzahl Datensätze, die geladen werden
        this._remoteDataStep = 50;    // Anzahl Datensätze, die pro request hinzugefügt werden.
        this._remoteDataTotal = null; // Anzahl verfügbare Datensätze
        this._getRemoteMetaData = true;  // Metadaten laden?
        this._isLoading = false;      // wird zurzeit geladen?
        this._remoteSort = null;      // Remote-Sortierung

        this._lastSelectedRow = null; // letzte Zeile, die selektiert wurde
        this._currentRow = null;      // Zeile, welche zurzeit fokusiert ist
        this._selectType = 'single';  // multiselect: single|multi|simple|none
        this._focusable = true;       // ob das grid focusiert weden kann
        this._editable = false;       // editierbare zeilen?
        this._filterable = false;

        // Intersection Observer (endless grid loader)
        this._intersectionObserver = null;

        this._dom.clsAdd('kijs-grid');

        // dom - elemente erstellen

        // 3 Zeilen
        this._topDom = new kijs.gui.Dom({cls: 'kijs-top'});
        this._middleDom = new kijs.gui.Dom({cls: 'kijs-center'});
        this._bottomDom = new kijs.gui.Dom({cls: 'kijs-bottom'});

        this._tableContainerDom = new kijs.gui.Dom({cls: 'kijs-tablecontainer', on:{scroll: this._onTableScroll, context: this}});
        this._tableDom = new kijs.gui.Dom({nodeTagName: 'table'});

        this._headerContainerDom = new kijs.gui.Dom({cls: 'kijs-headercontainer'});
        this._headerDom = new kijs.gui.Dom({nodeTagName: 'table'});

        this._footerContainerDom = new kijs.gui.Dom({cls: 'kijs-footercontainer'});
        this._footerDom = new kijs.gui.Dom({nodeTagName: 'table'});

        this._leftContainerDom = new kijs.gui.Dom({cls: 'kijs-leftcontainer'});
        this._leftDom = new kijs.gui.Dom({nodeTagName: 'table'});

        this._rightContainerDom = new kijs.gui.Dom({cls: 'kijs-rightcontainer'});
        this._rightDom = new kijs.gui.Dom({nodeTagName: 'table'});

        // header
        this._headerLeftContainerDom = new kijs.gui.Dom({cls: 'kijs-headercontainer-left'});
        this._headerLeftDom = new kijs.gui.Dom({nodeTagName: 'table'});

        this._headerRightContainerDom = new kijs.gui.Dom({cls: 'kijs-headercontainer-right'});
        this._headerRightDom = new kijs.gui.Dom({nodeTagName: 'table'});

        // footer
        this._footerLeftContainerDom = new kijs.gui.Dom({cls: 'kijs-footercontainer-left'});
        this._footerLeftDom = new kijs.gui.Dom({nodeTagName: 'table'});

        this._footerRightContainerDom = new kijs.gui.Dom({cls: 'kijs-footercontainer-right'});
        this._footerRightDom = new kijs.gui.Dom({nodeTagName: 'table'});

        // header / filter
        this._header = new kijs.gui.grid.Header({parent: this});
        this._filter = new kijs.gui.grid.Filter({parent: this});

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            waitMaskTarget           : this,
            waitMaskTargetDomProperty: 'dom'
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            autoLoad                  : true,
            rpc                       : true,
            facadeFnLoad              : true,
            facadeFnSave              : true,
            facadeFnArgs              : true,
            facadeFnBeforeMsgFn       : true,
            waitMaskTarget            : true,
            waitMaskTargetDomProperty : true,

            columnConfigs:  { fn: 'function', target: this.columnConfigAdd, context: this },
            primaryKeys:    { target: 'primaryKeys' },
            data:           { target: 'data' },

            editable: true,
            focusable: true,
            filterable: true,
            filterVisible: { target: 'filterVisible' },
            selectType: { target: 'selectType' } // 'none': Es kann nichts selektiert werden
                                                 // 'single' (default): Es kann nur ein Datensatz selektiert werden
                                                 // 'multi': Mit den Shift- und Ctrl-Tasten können mehrere Datensätze selektiert werden.
                                                 // 'simple': Es können mehrere Datensätze selektiert werden. Shift- und Ctrl-Tasten müssen dazu nicht gedrückt werden.

        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }

        // Events
        this.on('keyDown', this._onKeyDown, this);
    }


    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------

    get columnConfigs() { return this._columnConfigs; }

    get current() { return this._currentRow; }
    /**
     * Setzt die aktuelle Zeile, die den Fokus erhalten wird.
     * Null = automatische Ermittlung
     * Um den Fokus zu setzen verwenden Sie stattdessen die Funktion .focus() von der Zeile.
     * @param {kijs.gui.grid.Row|null} cRow
     * @returns {undefined}
     */
    set current(cRow) {
        // Falls kein cRow übergeben wurde:
        if (!cRow && !kijs.isEmpty(this._rows)) {
            // Falls es schon ein gültiges Current-Zeile gibt, dieses nehmen
            if (this._currentRow && kijs.Array.contains(this._rows, this._currentRow)) {
                cRow = this._currentRow;
            }
            // Sonst die erste selektierte Zeile
            if (!cRow) {
                let sel = this.getSelected();
                if (!kijs.isEmpty(sel)) {
                    if (kijs.isArray(sel)) {
                        sel = sel[0];
                    }
                    cRow = sel;
                }
            }
            // Sonst halt die erste Zeile
            if (!cRow) {
                cRow = this._rows[0];
            }
        }

        this._currentRow = cRow;

        kijs.Array.each(this._rows, function(row) {
            if (row === cRow) {
                row.dom.clsAdd('kijs-current');
            } else {
                row.dom.clsRemove('kijs-current');
            }
            // Nur das currentRow darf den Fokus erhalten können
            if (this._focusable && row === cRow) {
                cRow.dom.nodeAttributeSet('tabIndex', 0);
            } else {
                row.dom.nodeAttributeSet('tabIndex', undefined);
            }
        }, this);
    }

    set data(val) {
        if (!kijs.isArray(val)) {
            val = [val];
        }
        this.rowsRemoveAll();
        this.rowsAdd(val);
    }
    get data() {
        let dataRows = [];
        kijs.Array.each(this._rows, function(row) {
            dataRows.push(row.dataRow);
        }, this);
        return dataRows;
    }

    get editable() { return this._editable; }
    set editable(val) { this._editable = !!val; }

    get facadeFnArgs() { return this._facadeFnArgs; }
    set facadeFnArgs(val) { this._facadeFnArgs = val; }

    get firstRow() {
        if (this._rows.length > 0) {
            return this._rows[0];
        }
        return null;
    }

    get filter() { return this._filter; }

    get filterable() { return this._filterable; }
    set filterable(val) { this._filterable = !!val; }

    get filterVisible() { return this._filter.visible; }
    set filterVisible(val) { this._filter.visible = !!val; }

    get lastRow() {
        if (this._rows.length > 0) {
            return this._rows[this._rows.length-1];
        }
        return null;
    }

    set primaryKeys(val) {
        if (!kijs.isArray(val)) {
            val = [val];
        }
        kijs.Array.each(val, function(k) {
           if (!kijs.isString(k)) {
               throw new kijs.Error('invalid primary key');
           }
        }, this);
        this._primaryKeys = val;
    }
    get primaryKeys() { return this._primaryKeys; }

    get rows() { return this._rows; }

    get selectType() { return this._selectType; }
    set selectType(val) {
        if (!kijs.Array.contains(['single', 'multi', 'simple', 'none'], val)) {
            throw new kijs.Error('invalid value for selectType');
        }
        this._selectType = val;
    }

    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    /**
     * Entfernt alle Selektionen
     * @param {Boolean} [preventSelectionChange=false]    Soll das SelectionChange-Event verhindert werden?
     * @returns {undefined}
     */
    clearSelections(preventSelectionChange) {
        this.unSelect(this._rows, preventSelectionChange);
    }

    columnConfigAdd(columnConfigs) {
        if (!kijs.isArray(columnConfigs)) {
            columnConfigs = [columnConfigs];
        }

        kijs.Array.each(columnConfigs, function(columnConfig) {
            let inst = this._getInstance(columnConfig, 'kijs.gui.grid.columnConfig.Text', kijs.gui.grid.columnConfig.ColumnConfig);
            inst.grid = this;
            this._columnConfigs.push(inst);
        }, this);

        if (this.isRendered) {
            this.render();
        }
    }

    /**
     * Gibt eine columnConfig anhand ihres valueField-Wertes zurück
     * @param {String} valueField
     * @returns {kijs.gui.grid.columnConfig.ColumnConfig|null}
     */
    getColumnConfigByValueField(valueField) {
        let cC = null;
        kijs.Array.each(this._columnConfigs, function(columnConfig) {
            if (columnConfig.valueField === valueField) {
                cC = columnConfig;
                return false;
            }
        }, this);

        return cC;
    }

    /**
     * Gibt die selektieten Zeilen zurück
     * Bei selectType='single' wird das Row direkt zurückgegeben, sonst ein Array mit den Zeilen
     * @returns {Array|kijs.gui.DataViewRow|null}
     */
    getSelected() {
        let ret = [];
        for (let i=0; i<this._rows.length; i++) {
            if (this._rows[i].selected) {
                ret.push(this._rows[i]);
            }
        }

        if (this._selectType === 'none') {
            return null;

        } else if (this._selectType === 'single') {
            return ret.length ? ret[0] : [];

        } else {
            return ret;
        }
    }

    /**
     * Gibt die IDs der selektierten Datensätze zurück.
     * @returns {Array}
     */
    getSelectedIds() {
        let rows = this.getSelected(),
                hasPrimarys = this._primaryKeys.length > 0,
                multiPrimarys = this._primaryKeys.length > 1;

        if (!kijs.isArray(rows)) {
            rows = [rows];
        }

        // Falls keine Primarys vorhanden sind, werden die rows zurückgegeben.
        if (!hasPrimarys) {
            return rows;

        // Falls nur ein primary existiert, wird ein array mit den Ids zurückgegeben
        } else if (!multiPrimarys) {
            let ids = [], primaryKey = this._primaryKeys[0];
            kijs.Array.each(rows, function(row) {
                ids.push(row.dataRow[primaryKey]);
            }, this);

            return ids;

        // Mehrere primary keys: Pro Zeile ein Objekt mit dem Ids zurückgeben
        } else {
            let ids = [];
            kijs.Array.each(rows, function(row) {
                let idRow = {};
                kijs.Array.each(this._primaryKeys, function(pk) {
                    idRow[pk] = row.dataRow[pk];
                }, this);
                ids.push(idRow);
            }, this);

            return ids;
        }
    }

    /**
     * Lädt alle Daten im Grid neu.
     * @param {boolean} restoreSelection
     * @returns {Promise}
     */
    reload(restoreSelection = true) {
        let selected = this.getSelectedIds();
        return this._remoteLoad(true).then((response) => {

            // selektion wiederherstellen
            if (selected && restoreSelection) {
                this.selectByIds(selected, false, true);
            }

            return response;
        });
    }

    /**
     * Fügt eine neue Zeile hinzu oder aktualisiert eine bestehende
     * @param {Array} rows
     * @param {Number} startOffset Offset, ab dem die Rows einsortiert werden, wenn bestehende rows aktualisiert werden
     * @returns {Number} Anzahl neue Zeilen
     */
    rowsAdd(rows, startOffset=null) {
        if (!kijs.isArray(rows)) {
            rows = [rows];
        }

        let renderStartOffset = this._rows.length,
                newRows = 0,
                rowPos=0,
                offsets=[];

        kijs.Array.each(rows, function(row) {
            let currentPos = null;

            // instanz einer row gegeben. Direkt einfügen
            if (row instanceof kijs.gui.grid.Row) {
                row.parent = this;
                this._rows.push(row);

                // Position der neuen row merken
                currentPos = this._rows.length-1;

            } else {
                // row per primary key suchen
                let pRow = this._getRowByPrimaryKey(row);

                if (pRow) {
                    // bestehende row updaten
                    pRow.updateDataRow(row);

                    // Position der bestehenden Row merken
                    currentPos = this._rows.indexOf(pRow);

                } else {
                    newRows++;

                    // neue row hinzufügen
                    this._rows.push(new kijs.gui.grid.Row({
                        parent: this,
                        dataRow: row,
                        on: {
                            click: this._onRowClick,
                            dblClick: this._onRowDblClick,
                            context: this
                        }
                    }));

                    // Position der neuen row merken
                    currentPos = this._rows.length-1;
                }
            }

            // korrekt einsortieren
            if (startOffset !== null && currentPos !== (startOffset + rowPos)) {
                kijs.Array.move(this._rows, currentPos, startOffset + rowPos);
            }
            offsets.push(startOffset + rowPos);

            // Zähler
            rowPos++;

        }, this);

        // Alle Elemente ab dem ersten neu eingefügten Element neu rendern
        if (offsets.length > 0) {
            renderStartOffset = kijs.Array.min(offsets);
        }
        if (this.isRendered && this._rows.length > renderStartOffset) {
            this._renderRows(renderStartOffset);
        }

        return newRows;
    }

    rowsRemove(rows) {
        if (!kijs.isArray(rows)) {
            rows = [rows];
        }

        kijs.Array.each(rows, function(delRow) {

            // Row-Objekt: Dieses entfernen
            if (delRow instanceof kijs.gui.grid.Row) {
                kijs.Array.remove(this._rows, delRow);
                delRow.destruct();

            } else {
                // DataRow-Objekt: Suchen und entfernen
                kijs.Array.each(this._rows, function(row) {
                    if (row.dataRow === delRow) {
                        this.rowsRemove([row]);
                    }
                }, this);
            }
        }, this);
    }

    rowsRemoveAll() {
        while (this._rows.length > 0) {
            this.rowsRemove(this._rows[0]);
        }
    }

    /**
     * Selektiert eine oder mehrere Zeilen
     * @param {kijs.gui.grid.Row|Array} rows oder Array mit Zeilen, die selektiert werden sollen
     * @param {Boolean} [keepExisting=false]  Soll die bestehende selektion belassen werden?
     * @param {Boolean} [preventEvent=false]  Soll der SelectionChange-Event verhindert werden?
     * @returns {undefined}
     */
    select(rows, keepExisting=false, preventEvent=false) {
        if (kijs.isEmpty(rows)) {
            rows = [];
        }

        if (!kijs.isArray(rows)) {
            rows = [rows];
        }

        // beforeSelectionChange-Event
        if (!preventEvent) {
            let beforeSelectionChangeArgs = {rows: rows, keepExisting: keepExisting, cancel: false};
            this.raiseEvent('beforeSelectionChange', beforeSelectionChangeArgs);

            // selectionChange verhindern?
            if (beforeSelectionChangeArgs.cancel === true) {
                return;
            }
        }

        if (!keepExisting){
            this.clearSelections(true);
        }

        kijs.Array.each(rows, function(row) {
            row.selected = true;
        }, this);

        // SelectionChange auslösen
        if (!preventEvent) {
            this.raiseEvent('selectionChange', { rows: rows, unSelect: false } );
        }
    }

    /**
     * Selektiert eine oder mehrere Zeilen
     * @param {Array|Object} filters                    Array mit Objektdefinitionen der Zeilen, die selektiert werden sollen
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
            filters = [];
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

        // Nun die Zeilen durchgehen und wenn sie zum Filter passen: die Zeile vormerken
        const selRows = [];
        if (!kijs.isEmpty(filters)) {
            kijs.Array.each(this._rows, function(row) {
                const dataRow = row.dataRow;

                kijs.Array.each(filters, function(filterFields) {
                    let ok = false;
                    kijs.Array.each(filterFields, function(filterField) {
                        if (kijs.isEmpty(filterField.value) || kijs.isEmpty(filterField.field)) {
                            throw new kijs.Error(`Unkown filter format.`);
                        }

                        if (filterField.value === dataRow[filterField.field]) {
                            ok = true;
                        } else {
                            ok = false;
                            return false;
                        }
                    }, this);
                    if (ok) {
                        selRows.push(row);
                        return false;
                    }
                }, this);

            }, this);
        }

        // Zeilen selektieren
        this.select(selRows, keepExisting, preventSelectionChange);

        // Element mit Fokus neu ermitteln
        this._currentRow = null;
        this.current = null;
    }

    /**
     * Selektiert Datensätze Anhand der ID
     * @param {Array} ids Array vonIds [id1, id2] oder bei mehreren primaryKeys ein Objekt mit {pkName: pkValue, pk2Name: pk2Value}
     * @param {Boolean} [keepExisting=false]  Soll die bestehende selektion belassen werden?
     * @param {Boolean} [preventEvent=false]  Soll der SelectionChange-Event verhindert werden?
     * @returns {undefined}
     */
    selectByIds(ids, keepExisting=false, preventEvent=false) {
        let hasPrimarys = this._primaryKeys.length > 0,
            multiPrimarys = this._primaryKeys.length > 1,
            rows = [];

        if (!kijs.isArray(ids)) {
            ids = [ids];
        }

        // Keine Primarys, keine ID's
        if (!hasPrimarys || !ids) {
            return;
        }

        // Array mit ID's übergeben: umwandeln in Array mit Objekten
        if (!multiPrimarys && !kijs.isObject(ids[0])) {
            let pk = this._primaryKeys[0];
            for (let i=0; i<ids.length; i++) {
                let val = ids[i];
                ids[i] = {};
                ids[i][pk] = val;
            }
        }

        // Zeilen holen
        for (let i=0; i<ids.length; i++) {
            if (kijs.isObject(ids[i])) {
                let match=false;

                kijs.Array.each(this._rows, function(row) {
                    match = true;

                    for (let idKey in ids[i]) {
                        if (row.dataRow[idKey] !== ids[i][idKey]) {
                            match = false;
                        }
                    }

                    if (match) {
                        rows.push(row);
                    }

                }, this);

            }
        }

        this.select(rows, keepExisting, preventEvent);
    }

    /**
     * Sortiert die Tabelle nach einer bestimmten Spalte.
     * @param {String} field
     * @param {String} [direction] ASC oder DESC
     * @returns {undefined}
     */
    sort(field, direction='ASC') {
        direction = direction.toUpperCase();
        if (!kijs.Array.contains(['ASC', 'DESC'], direction)) {
            throw new kijs.Error('invalid value for sort direction');
        }

        let columnConfig = null;
        kijs.Array.each(this._columnConfigs, function(cC) {
            if (cC.valueField === field) {
                columnConfig = cC;
                return false;
            }
        }, this);

        if (columnConfig === null) {
            throw new kijs.Error('invalid sort field name');
        }

        this._remoteSort = {
            field: field,
            direction: direction
        };

        // store laden
        this._remoteLoad(true);
    }

    // PROTECTED
    /**
     * Es kann eine Config oder eine Instanz übergeben werden. Wird eine config übergeben, wird eine instanz
     * erstellt. Wenn eine Instanz übergeben wird, wird deren typ geprüft.
     * @param {Object} configOrInstance
     * @param {String} defaultXType wird verwendet wenn in der config kein xtype definiert wurde.
     * @param {constructor} requiredClass
     * @returns {inst}
     */
    _getInstance(configOrInstance, defaultXType, requiredClass=null) {
        let inst = null;

        // Standard-Objekt übergeben: instanz von xType erstellen und config übergeben
        if (kijs.isObject(configOrInstance) && configOrInstance.constructor === window.Object) {
            configOrInstance.xtype = configOrInstance.xtype || defaultXType;
            let constructor = kijs.getObjectFromNamespace(configOrInstance.xtype);
            if (constructor === false) {
                throw new kijs.Error('invalid xtype ' + configOrInstance.xtype);
            }
            delete configOrInstance.xtype;
            inst = new constructor(configOrInstance);


        } else if (kijs.isObject(configOrInstance)) {
            inst = configOrInstance;
        }

        if (requiredClass !== null) {
            if (!kijs.isObject(inst) || !(inst instanceof requiredClass)) {
                throw new kijs.Error('instance not from class ' + requiredClass.name);
            }
        }

        return inst;
    }

    /**
     * Sucht eine Row anhand des Primary keys
     * @param {Object} data
     * @returns {kijs.gui.grid.Row|null} die Row oder null, wenn nicht gefunden.
     */
    _getRowByPrimaryKey(data) {
        let rowMatch = null;
        if (this._primaryKeys && this._primaryKeys.length > 0) {

            kijs.Array.each(this._rows, function(row) {
                let primMatch = true;

                kijs.Array.each(this._primaryKeys, function(primaryKey) {
                    if (data[primaryKey] !== row.dataRow[primaryKey]) {
                        primMatch = false;
                        return false;
                    }
                }, this);

                if (primMatch) {
                    rowMatch = row;
                    return false;
                }

            }, this);
        }

        return rowMatch;
    }

    _remoteLoad(force=false) {
        return new Promise((resolve) => {
            if (this._facadeFnLoad && this._rpc && !this._isLoading && (this._remoteDataLoaded < this._remoteDataLimit || force)) {
                this._isLoading = true;

                let args = {};
                args.sort = this._remoteSort;
                args.getMetaData = this._getRemoteMetaData;
                args.filter = this._filter.getFilters();

                // alle Daten neu laden
                if (force) {
                    args.start = 0;
                    args.limit = this._remoteDataLimit;

                // Nächste Daten laden
                } else {
                    args.start = this._remoteDataLoaded;
                    args.limit = this._remoteDataLimit - this._remoteDataLoaded;

                    // Falls alle vorhandenen Daten geladen sind, brechen wir ab.
                    if (this._remoteDataTotal !== null && this._remoteDataLoaded >= this._remoteDataTotal) {
                        this._isLoading = false;
                        return;
                    }
                }

                if (kijs.isObject(this._facadeFnArgs)) {
                    args = Object.assign(args, this._facadeFnArgs);
                }

                // Lademaske wird angezeigt, wenn das erste mal geladen  wird, oder
                // wenn sämtliche Datensätze neu geladen werden.
                let showWaitMask = force || this._remoteDataLoaded === 0;

                // RPC ausführen
                this._rpc.do(this._facadeFnLoad, args, function(response) {
                        this._remoteProcess(response, args, force);

                        // Promise auflösen
                        resolve(response);

                    },
                    this,                                           // Context
                    true,                                           // Cancel running
                    showWaitMask ? this._waitMaskTarget : 'none',   // Wait Mask Target
                    this._waitMaskTargetDomProperty,                // Wait Mask Target Dom Property
                    false,                                          // Ignore Warnings
                    this._facadeFnBeforeMsgFn
                );
            }
        });
    }

    _remoteProcess(response, args, force) {

        // columns
        if (kijs.isArray(response.columns)) {
            kijs.Array.clear(this._columnConfigs);
            this.columnConfigAdd(response.columns);

            this._getRemoteMetaData = false;
        }

        // primary keys
        if (response.primaryKeys) {
            this.primaryKeys = response.primaryKeys;
        }

        // force?
        if (force) {
            this.rowsRemoveAll();
            this._remoteDataLoaded = 0;
        }

        // rows
        if (kijs.isArray(response.rows)) {
            let addedRowsCnt = 0;

            // Datensätze hinzufügen
            if (response.rows.length > 0) {
                addedRowsCnt = this.rowsAdd(response.rows, args.start);
            }

            // Anzahl DS zählen
            this._remoteDataLoaded += addedRowsCnt;

            // Falls mehr Datensätze zurückgegeben wurden als angefragt,
            // limit erhöhen
            if (this._remoteDataLoaded > this._remoteDataLimit) {
                this._remoteDataLimit = this._remoteDataLoaded;
            }
        }

        // Total Datensätze
        if (kijs.isInteger(response.count)) {
            this._remoteDataTotal = response.count;
        } else {
            if (response.rows && response.rows.length < args.limit) {
                this._remoteDataTotal = args.start + response.rows.length;
            }
        }

        this.raiseEvent('afterLoad', response);

        this._isLoading = false;
    }

    _renderRows(offset=0) {
        for (let i=offset; i<this._rows.length; i++) {
            this._rows[i].renderTo(this._tableDom.node);
        }

        this._setIntersectionObserver();
    }

    // PROTECTED
    /**
     * Selektiert eine Zeile und berücksichtigt dabei die selectType und die Tasten shift und ctrl
     * @param {kijs.gui.grid.Row} row
     * @param {boolean} shift   // Shift gedrückt?
     * @param {boolean} ctrl    // Ctrl gedrückt?
     * @returns {undefined}
     */
    _selectRow(row, shift, ctrl) {
        if (!row) {
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


        if (shift && this._lastSelectedRow) {
            // bestehende Selektierung entfernen
            if (!ctrl) {
                this.clearSelections(true);
            }

            // selektieren
            this.selectBetween(this._lastSelectedRow, row);

        } else {

            // bestehende Selektierung entfernen
            if (!ctrl) {
                this.clearSelections(true);
            }

            if (row.selected) {
                this.unSelect(row);
                if (row === this._lastSelectedRow) {
                    this._lastSelectedRow = null;
                }
            } else {
                this.select(row, true);
                this._lastSelectedRow = row;
            }
        }
    }

    /**
     * Setzt den intersection observer auf die letzte row.
     * @returns {undefined}
     */
    _setIntersectionObserver() {
        // Der Intersection Observer beobachtet die Scroll-Position und wirft ein Event, wenn
        // das Scrolling gegen das Ende der Seite kommt.
        if (window.IntersectionObserver) {
            if (!this._intersectionObserver || this._intersectionObserver.root !== this._tableContainerDom.node) {
                this._intersectionObserver = new IntersectionObserver(this._onIntersect.bind(this), {
                    root: this._tableContainerDom.node,
                    rootMargin: '100px',
                    threshold: 0
                });
            }

            // observer auf letzte zeile setzen
            if (this._intersectionObserver) {
                this._intersectionObserver.disconnect();

                if (this._rows.length > 0) {
                    this._intersectionObserver.observe(this._rows[this._rows.length - 1].node);
                }
            }
        }
    }

    /**
     * Deselektiert ein oder mehrere Zeilen
     * @param {kijs.gui.grid.Row|Array} rows Row oder Array mit Zeilen, die deselektiert werden sollen
     * @param {boolean} [preventSelectionChange=false]     Soll das SelectionChange-Event verhindert werden?
     * @returns {undefined}
     */
    unSelect(rows, preventSelectionChange) {
        if (!kijs.isArray(rows)) {
            rows = [rows];
        }

        kijs.Array.each(rows, function(row) {
            row.selected = false;
        }, this);

        if (!preventSelectionChange) {
            this.raiseEvent('selectionChange', { rows: rows, unSelect: true } );
        }
    }

    /**
     * Selektiert alle Zeilen zwischen row1 und row2
     * @param {kijs.gui.grid.Row} row1
     * @param {kijs.gui.grid.Row} row2
     * @param {boolean} [preventSelectionChange=false]     Soll das SelectionChange-Event verhindert werden?
     * @returns {undefined}
     */
    selectBetween(row1, row2, preventSelectionChange) {
        let found = false;
        let rows = [];

        // Alle Zeilen zwischen dem vorher selektierten Row und dem aktuellen Row selektieren
        kijs.Array.each(this._rows, function(row) {
            if (!found) {
                if (row === row1) {
                    found = 'row1';
                } else if (row === row2) {
                    found = 'row2';
                }
            }

            if (found) {
                rows.push(row);
            }

            if ((found==='row1' && row===row2) || (found==='row2' && row===row1)) {
                return false;
            }
        }, this);


        if (!kijs.isEmpty(rows)) {
            this.select(rows, true, preventSelectionChange);
        }
    }

    // EVENTS


    _onKeyDown(e) {
        let keyCode=e.nodeEvent.keyCode, ctrl=e.nodeEvent.ctrlKey, shift=e.nodeEvent.shiftKey;

        if (!this.disabled) {
            let targetRow = null;

            if (this._currentRow) {
                switch (keyCode) {
                    case kijs.keys.DOWN_ARROW: targetRow = this._currentRow.next; break;
                    case kijs.keys.UP_ARROW: targetRow = this._currentRow.previous; break;
                    case kijs.keys.SPACE: targetRow = this._currentRow; break;
                }
            }

            if (targetRow) {
                this.current = targetRow;
                if (this._focusable) {
                    targetRow.focus();
                }

                if (this.selectType !== 'simple' || shift || ctrl || keyCode === kijs.keys.SPACE) {
                    this._selectRow(this._currentRow, shift, ctrl);
                }

                e.nodeEvent.preventDefault();
            }
        }
    }

    _onRowClick(e) {
        let row = e.element, ctrl=e.nodeEvent.ctrlKey, shift=e.nodeEvent.shiftKey;

        if (!this.disabled) {
            this.current = row;
            if (this._focusable) {
                row.focus();
            }
            this._selectRow(this._currentRow, shift, ctrl);
        }

        // Event weiterreichen
        this.raiseEvent('rowClick', e);
    }

    _onRowDblClick(e) {
        // Event weiterreichen
        this.raiseEvent('rowDblClick', e);
    }

    _onTableScroll(e) {
        let scrollTop = e.dom.node.scrollTop;
        let scrollLeft = e.dom.node.scrollLeft;

        this._headerContainerDom.node.scrollLeft = scrollLeft;
        this._footerContainerDom.node.scrollLeft = scrollLeft;

        this._leftContainerDom.node.scrollTop = scrollTop;
        this._rightContainerDom.node.scrollTop = scrollTop;
    }

    /**
     * Wird ausgelöst, wenn die Scrollbar 200px von der letzten Zeile entfernt ist.
     * @param {IntersectionObserverEntrys} intersections
     * @returns {undefined}
     */
    _onIntersect(intersections) {
        if (intersections.length > 0) {
            kijs.Array.each(intersections, function(intersection) {
                if (intersection.isIntersecting) {
                    this._remoteDataLimit += this._remoteDataStep;
                    this._remoteLoad();
                }
            }, this);
        }
    }


    // Overwrite
    render(superCall) {
        super.render(true);

        // Elemente in den haupt-dom
        this._topDom.renderTo(this._dom.node);
        this._middleDom.renderTo(this._dom.node);
        this._bottomDom.renderTo(this._dom.node);

        // header / filter
        this._headerLeftContainerDom.renderTo(this._topDom.node);
        this._headerContainerDom.renderTo(this._topDom.node);
        this._headerRightContainerDom.renderTo(this._topDom.node);

        // center (grid)
        this._leftContainerDom.renderTo(this._middleDom.node);
        this._tableContainerDom.renderTo(this._middleDom.node);
        this._rightContainerDom.renderTo(this._middleDom.node);

        // footer (summary)
        this._footerLeftContainerDom.renderTo(this._bottomDom.node);
        this._footerContainerDom.renderTo(this._bottomDom.node);
        this._footerRightContainerDom.renderTo(this._bottomDom.node);

        // header
        this._headerLeftDom.renderTo(this._headerLeftContainerDom.node);
        this._headerDom.renderTo(this._headerContainerDom.node);
        this._headerRightDom.renderTo(this._headerRightContainerDom.node);

        // center
        this._leftDom.renderTo(this._leftContainerDom.node);
        this._tableDom.renderTo(this._tableContainerDom.node);
        this._rightDom.renderTo(this._rightContainerDom.node);

        // bottom
        this._footerLeftDom.renderTo(this._footerLeftContainerDom.node);
        this._footerDom.renderTo(this._footerContainerDom.node);
        this._footerRightDom.renderTo(this._footerRightContainerDom.node);

        // header / filter
        this._header.renderTo(this._headerDom.node);
        this._filter.renderTo(this._headerDom.node);

        // rows
        this._renderRows();

        // footer (TODO)

        // Event afterRender auslösen
        if (!superCall) {
            this.raiseEvent('afterRender');
        }

        // Daten laden
        if (this._autoLoad) {
            this._remoteLoad();
        }
    }

    // overwrite
    unrender(superCall) {
        // Event auslösen.
        if (!superCall) {
            this.raiseEvent('unrender');
        }

        // header / filter
        this._header.unrender();
        this._filter.unrender();

        // bottom
        this._footerLeftDom.unrender();
        this._footerDom.unrender();
        this._footerRightDom.unrender();

        // center
        this._leftDom.unrender();
        this._tableDom.unrender();
        this._rightDom.unrender();

        // header
        this._headerLeftDom.unrender();
        this._headerDom.unrender();
        this._headerRightDom.unrender();

        // footer (summary)
        this._footerLeftContainerDom.unrender();
        this._footerContainerDom.unrender();
        this._footerRightContainerDom.unrender();

        // center (grid)
        this._leftContainerDom.unrender();
        this._tableContainerDom.unrender();
        this._rightContainerDom.unrender();

        // header / filter
        this._headerLeftContainerDom.unrender();
        this._headerContainerDom.unrender();
        this._headerRightContainerDom.unrender();

        this._topDom.unrender();
        this._middleDom.unrender();
        this._bottomDom.unrender();

        super.unrender(true);
    }


    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(superCall) {
        if (!superCall) {
            // unrendern
            this.unrender(superCall);

            // Event auslösen.
            this.raiseEvent('destruct');
        }

        // header / filter
        this._header.destruct();
        this._filter.destruct();

        // bottom
        this._footerLeftDom.destruct();
        this._footerDom.destruct();
        this._footerRightDom.destruct();

        // center
        this._leftDom.destruct();
        this._tableDom.destruct();
        this._rightDom.destruct();

        // header
        this._headerLeftDom.destruct();
        this._headerDom.destruct();
        this._headerRightDom.destruct();

        // footer (summary)
        this._footerLeftContainerDom.destruct();
        this._footerContainerDom.destruct();
        this._footerRightContainerDom.destruct();

        // center (grid)
        this._leftContainerDom.destruct();
        this._tableContainerDom.destruct();
        this._rightContainerDom.destruct();

        // header / filter
        this._headerLeftContainerDom.destruct();
        this._headerContainerDom.destruct();
        this._headerRightContainerDom.destruct();

        this._topDom.destruct();
        this._middleDom.destruct();
        this._bottomDom.destruct();

        // Variablen (Objekte/Arrays) leeren
        // -----------------------------------

        // header / filter
        this._header = null;
        this._filter = null;

        // bottom
        this._footerLeftDom = null;
        this._footerDom = null;
        this._footerRightDom = null;

        // center
        this._leftDom = null;
        this._tableDom = null;
        this._rightDom = null;

        // header
        this._headerLeftDom = null;
        this._headerDom = null;
        this._headerRightDom = null;

        // footer (summary)
        this._footerLeftContainerDom = null;
        this._footerContainerDom = null;
        this._footerRightContainerDom = null;

        // center (grid)
        this._leftContainerDom = null;
        this._tableContainerDom = null;
        this._rightContainerDom = null;

        // header / filter
        this._headerLeftContainerDom = null;
        this._headerContainerDom = null;
        this._headerRightContainerDom = null;

        this._topDom = null;
        this._middleDom = null;
        this._bottomDom = null;

        // Basisklasse entladen
        super.destruct(true);
    }
};

/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.grid.Header
// --------------------------------------------------------------
/**
 * EVENTS
 * ----------
 *
 */
kijs.gui.grid.Header = class kijs_gui_grid_Header extends kijs.gui.Element {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        // dom type
        this._dom.nodeTagName = 'tr';

        this._cells = [];

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            cls: 'kijs-grid-header'
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }
    }

    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------

    get cells() {
        let cells = [];
        for (let i=0; i<this._cells.length; i++) {
            cells.push(this._cells[i].cell);
        }
        return cells;
    }

    get grid() { return this.parent; }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------

    _createCells() {
        let newColumnConfigs = [];

        // Prüfen, ob für jede columnConfig eine headerCell existiert.
        // Wenn nicht, in Array schreiben.
        kijs.Array.each(this.grid.columnConfigs, function(columnConfig) {
            let exist = false;
            for (let i=0; i<this._cells.length; i++) {
                if (this._cells[i].columnConfig === columnConfig) {
                    exist = true;
                    break;
                }
            }
            if (!exist) {
                newColumnConfigs.push(columnConfig);
            }
        }, this);

        // Falls cell noch nicht vorhanden, neue cell erstellen.
        kijs.Array.each(newColumnConfigs, function(columnConfig) {
            let cell = new kijs.gui.grid.HeaderCell({
                parent: this,
                columnConfig: columnConfig
            });

            // change listener
            columnConfig.on('change', this._onColumnConfigChange, this);

            cell.loadFromColumnConfig();

            this._cells.push({columnConfig: columnConfig, cell: cell});
        }, this);
    }

    _sortCells() {
        this._cells.sort(function(a, b) {
            if (a.columnConfig.position < b.columnConfig.position) {
                return -1;
            }
            if (a.columnConfig.position > b.columnConfig.position) {
                return 1;
            }
            return 0;
        });
    }

    _onColumnConfigChange(e) {
        if ('visible' in e || 'width' in e || 'caption' in e || 'resizable' in e || 'sortable' in e) {
            kijs.Array.each(this.cells, function(cell) {
                if (e.columnConfig === cell.columnConfig) {
                    if (e.caption) {
                        cell.caption = e.caption;
                    } else {
                        cell.render();
                    }
                    return false;
                }
            }, this);

        }
        if ('position' in e) {
            this.render();
        }
    }

    // Overwrite
    render(superCall) {
        super.render(true);

        // cells erstellen
        this._createCells();

        // cells sortieren
        this._sortCells();

        // cells rendern
        kijs.Array.each(this.cells, function(cell) {
            cell.renderTo(this._dom.node);
        }, this);

        // Event afterRender auslösen
        if (!superCall) {
            this.raiseEvent('afterRender');
        }
    }

    // overwrite
    unrender(superCall) {
        // Event auslösen.
        if (!superCall) {
            this.raiseEvent('unrender');
        }

        // cells unrendern
        kijs.Array.each(this.cells, function(cell) {
            cell.unrender();
        }, this);

        super.unrender(true);
    }


    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(superCall) {
        if (!superCall) {
            // unrendern
            this.unrender(superCall);

            // Event auslösen.
            this.raiseEvent('destruct');
        }

        // cells destructen
        kijs.Array.each(this.cells, function(cell) {
            cell.destruct();
        }, this);

        // Variablen (Objekte/Arrays) leeren
        this._cells = null;
        if (this._dataRow) {
            this._dataRow = null;
        }

        // Basisklasse entladen
        super.destruct(true);
    }
};
/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.grid.HeaderCell
// --------------------------------------------------------------
/**
 * EVENTS
 * ----------
 *
 */
kijs.gui.grid.HeaderCell = class kijs_gui_grid_HeaderCell extends kijs.gui.Element {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        // DOM type
        this._dom.nodeTagName = 'td';
        this._columnConfig = null;
        this._initialPos = 0;
        this._splitterMove = false;

        // drag events
        this._dom.nodeAttributeSet('draggable', true);
        kijs.DragDrop.addDragEvents(this, this._dom);
        kijs.DragDrop.addDropEvents(this, this._dom);

        this.on('ddStart', this._onDdStart, this);
        this.on('ddOver', this._onDdOver, this);
        this.on('ddDrop', this._onDdDrop, this);

        // DOM für label
        this._captionContainerDom = new kijs.gui.Dom({cls:'kijs-caption'});
        this._captionDom = new kijs.gui.Dom({nodeTagName:'span', htmlDisplayType: 'code'});
        this._sortDom = new kijs.gui.Dom({nodeTagName:'span', cls:'kijs-sort', htmlDisplayType: 'code'});

        // DOM für Menu
        this._menuButtonEl = new kijs.gui.MenuButton({
            parent: this,
            elements: [{
                    name    : 'btn-sort-asc',
                    caption : kijs.getText('Aufsteigend sortieren'),
                    iconChar: '&#xf15d', // fa-sort-alpha-asc
                    on: {
                        click: function() {
                            this.header.grid.sort(this.columnConfig.valueField, 'ASC');
                            this._menuButtonEl.menuCloseAll();
                        },
                        context: this
                    }
                },{
                    name    : 'btn-sort-desc',
                    caption : kijs.getText('Absteigend sortieren'),
                    iconChar: '&#xf15e', // fa-sort-alpha-desc
                    on: {
                        click: function() {
                            this.header.grid.sort(this.columnConfig.valueField, 'DESC');
                            this._menuButtonEl.menuCloseAll();
                        },
                        context: this
                    }
                },{
                    name    : 'btn-columns',
                    caption : kijs.getText('Spalten') + '...',
                    iconChar: '&#xf0db', // fa-columns
                    on: {
                        click: function() {
                            (new kijs.gui.grid.columnWindow({parent: this})).show();
                            this._menuButtonEl.menuCloseAll();
                        },
                        context: this
                    }
                },{
                    name    : 'btn-filters',
                    caption : kijs.getText('Filter') + '...',
                    iconChar: '&#xf0b0', // fa-filter
                    on: {
                        click: function() {
                            this.parent.grid.filter.visible = !this.parent.grid.filter.visible;
                            this._menuButtonEl.menuCloseAll();
                        },
                        context: this
                    }
                }]
        });

        // DOM für Schieber
        this._splitterDom = new kijs.gui.Dom({
            cls:'kijs-splitter',
            on: {
                mouseDown: this._onSplitterMouseDown,
                context: this
            }
        });

        // DOM für Schieber overlay
        this._overlayDom = new kijs.gui.Dom({cls:'kijs-splitter-overlay'});

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            columnConfig: true,
            sort: { target: 'sort' }
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }
    }

    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------

    get caption() { return this._captionDom.html; }
    set caption(val) { this.setCaption(val); }

    get columnConfig() { return this._columnConfig; }
    set columnConfig(val) { this._columnConfig = val; }

    get header() { return this.parent; }
    get index() {
        if (this.header) {
            return this.header.cells.indexOf(this);
        }
        return null;
    }

    get sort() {
        if (this._sortDom.html === String.fromCharCode(0xf0dd)) {
            return 'DESC';
        } else if (this._sortDom.html === String.fromCharCode(0xF0de)) {
            return 'ASC';
        }
        return null;
    }
    set sort(val) {
        if (val === 'DESC') {
            this._sortDom.html = String.fromCharCode(0xf0dd); // fa-sort-desc
        } else if (val === 'ASC') {
            this._sortDom.html = String.fromCharCode(0xF0de); // fa-sort-asc
        } else {
            this._sortDom.html = '';
        }
    }


    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------

    /**
     * Setzt das caption der Zelle.
     * @param {String} caption
     * @param {Boolean} [updateColumnConfig=true] true, falls kein change-event ausgelöst werden soll.
     * @returns {undefined}
     */
    setCaption(caption, updateColumnConfig=true) {
        // HTML aktualisieren
        this._captionDom.html = caption;

        if (updateColumnConfig) {
            this._columnConfig.caption = caption;
        }

        if (this.isRendered) {
            this.render();
        }
    }

    /**
     * Lädt das value von der dataRow
     * @returns {undefined}
     */
    loadFromColumnConfig() {
        let c = this._columnConfig.caption;
        this.setCaption(c, false);

        this._menuButtonEl.spinbox.down('btn-filters').visible = !!this.parent.grid.filterable;
    }

    // PROTECTED
    /**
     * Aktualisiert die Overlay-Position aufgrund der Mauszeigerposition
     * @param {Number} xAbs     Mausposition clientX
     * @param {Number} yAbs     Mausposition clientY
     * @returns {undefined}
     */
    _updateOverlayPosition(xAbs, yAbs) {
        // Berechnet aus der absoluten Position bezogen zum Browserrand,
        // die relative Position bezogen zum übergeordneten DOM-Node
        const parentPos = kijs.Dom.getAbsolutePos(this.parent.grid.dom.node);
        const newPos = {
            x: xAbs - parentPos.x,
            y: yAbs - parentPos.x
        };

        this._overlayDom.left = newPos.x;
    }

    // LISTENER
    _onDdStart(e) {
        // wenn splitter nicht bewegt wird, drag starten
        if (this._splitterMove) {
            return false;
        }
    }

    _onDdOver(e) {
        if (this._splitterMove || this.header.cells.indexOf(e.sourceElement) === -1 || e.sourceElement.columnConfig.sortable === false) {
            // fremdes Element, kein Drop.
            e.position.allowAbove = false;
            e.position.allowBelow = false;
            e.position.allowLeft = false;
            e.position.allowOnto = false;
            e.position.allowRight = false;

        } else {
            // erlaubte Positionen (links, rechts)
            e.position.allowAbove = false;
            e.position.allowBelow = false;
            e.position.allowLeft = true;
            e.position.allowOnto = false;
            e.position.allowRight = true;
        }
    }


    _onDdDrop(e) {
        let tIndex = this.header.cells.indexOf(e.targetElement);
        let sIndex = this.header.cells.indexOf(e.sourceElement);
        let pos = e.position.position;

        if (!this._splitterMove && tIndex !== -1 && sIndex !== -1 && tIndex !== sIndex && (pos === 'left' || pos === 'right')) {
            if (pos === 'right') {
                tIndex += 1;
            }
            this.header.grid.columnConfigs[sIndex].position = tIndex;
        }
    }

    _onSplitterMouseDown(e) {
        if (!this._columnConfig.resizable) {
            return;
        }
        this._splitterMove = true;

        this._initialPos = e.nodeEvent.clientX;

        // Overlay Positionieren
        this._updateOverlayPosition(e.nodeEvent.clientX, e.nodeEvent.clientY);

        // Overlay rendern
        this._overlayDom.render();
        this.parent.grid.dom.node.appendChild(this._overlayDom.node);

        // mousemove und mouseup Listeners auf das document setzen
        kijs.Dom.addEventListener('mousemove', document, this._onSplitterMouseMove, this);
        kijs.Dom.addEventListener('mouseup', document, this._onSplitterMouseUp, this);
    }

    _onSplitterMouseMove(e) {
        // Overlay Positionieren
        this._updateOverlayPosition(e.nodeEvent.clientX, e.nodeEvent.clientY);
    }

    _onSplitterMouseUp(e) {
        // Beim ersten auslösen Listeners gleich wieder entfernen
        kijs.Dom.removeEventListener('mousemove', document, this);
        kijs.Dom.removeEventListener('mouseup', document, this);

        // Overlay wieder ausblenden
        this._overlayDom.unrender();

        // Differenz zur vorherigen Position ermitteln
        let offset = e.nodeEvent.clientX - this._initialPos;

        if (this._columnConfig.resizable) {
            this._columnConfig.width = Math.max(this._columnConfig.width + offset, 40);
        }

        this._splitterMove = false;
    }

    // Overwrite
    render(superCall) {
        super.render(true);

        // container
        this._captionContainerDom.renderTo(this._dom.node);

        // caption dom
        this._captionDom.renderTo(this._captionContainerDom.node);

        // sort dom
        this._sortDom.renderTo(this._captionContainerDom.node);

        // dropdown
        this._menuButtonEl.renderTo(this._dom.node);

        // Splitter
        this._splitterDom.renderTo(this._dom.node);

        // Breite
        this._dom.width = this._columnConfig.width;

        // sichtbar?
        this.visible = this._columnConfig.visible;

        // Event afterRender auslösen
        if (!superCall) {
            this.raiseEvent('afterRender');
        }
    }

    // overwrite
    unrender(superCall) {
        // Event auslösen.
        if (!superCall) {
            this.raiseEvent('unrender');
        }

        this._captionDom.unrender();
        this._captionContainerDom.unrender();
        this._menuButtonEl.unrender();
        this._splitterDom.unrender();

        super.unrender(true);
    }


    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(superCall) {
        if (!superCall) {
            // unrendern
            this.unrender(superCall);

            // Event auslösen.
            this.raiseEvent('destruct');
        }

        this._captionDom.destruct();
        this._captionContainerDom.destruct();
        this._menuButtonEl.destruct();
        this._splitterDom.destruct();

        // Variablen (Objekte/Arrays) leeren
        this._captionDom = null;
        this._menuButtonEl = null;
        this._splitterDom = null;

        // Basisklasse entladen
        super.destruct(true);
    }
};
/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.grid.Row
// --------------------------------------------------------------
/**
 * EVENTS
 * ----------
 *
 */
kijs.gui.grid.Row = class kijs_gui_grid_Row extends kijs.gui.Element {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        // dom type
        this._dom.nodeTagName = 'tr';

        this._dataRow = null;
        this._cells = [];

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            dataRow: true
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }
    }

    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------

    get cells() {
        let cells = [];
        for (let i=0; i<this._cells.length; i++) {
            cells.push(this._cells[i].cell);
        }
        return cells;
    }

    get current() { return !!this._dom.clsHas('kijs-current'); }
    set current(val) {
        if (val) {
            this._dom.clsAdd('kijs-current');
        } else {
            this._dom.clsRemove('kijs-current');
        }
    }

    get grid() { return this.parent; }

    get dataRow() { return this._dataRow; }
    set dataRow(val) { this._dataRow = val; }

    get impair() {
        return this.rowIndex % 2 === 0;
    }

    get isDirty() {
        let isDirty = false;
        kijs.Array.each(this._cells, function(cell) {
            if (cell.isDirty) {
                isDirty = true;
                return false;
            }
        }, this);
        return isDirty;
    }

    get next() {
        let i = this.rowIndex + 1;
        if (i > this.grid.rows.length -1) {
            return null;
        }
        return this.grid.rows[i];
    }

    get previous() {
        let i = this.rowIndex - 1;
        if (i < 0) {
            return null;
        }
        return this.grid.rows[i];
    }

    get rowIndex() {
        return this.grid.rows.indexOf(this);
    }

    get selected() { return !!this._dom.clsHas('kijs-selected'); }
    set selected(val) {
        if (val) {
            this._dom.clsAdd('kijs-selected');
        } else {
            this._dom.clsRemove('kijs-selected');
        }
    }
    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------

    /**
     * Aktualisiert die DataRow. Falls an der Row etwas geändert hat,
     * wird die Zeile neu gerendert.
     * @param {Object} newDataRow
     * @returns {undefined}
     */
    updateDataRow(newDataRow) {
        let isChanged = false;

        // Wenn bereits gerendert, vergleichen und falls geändert neu rendern
        if (this.isRendered) {
            kijs.Array.each(this.grid.columnConfigs, function(columnConfig) {
                if (newDataRow[columnConfig.valueField] !== this.dataRow[columnConfig.valueField]) {
                    isChanged = true;
                    return false;
                }
            }, this);
        }

        // aktualisieren
        this.dataRow = newDataRow;

        // rendern
        if (isChanged) {
            this.render();
        }
    }

    // PROTECTED
    _createCells() {
        let newColumnConfigs = [];

        // Prüfen, ob für jede columnConfig eine cell existiert.
        // Wenn nicht, in Array schreiben.
        kijs.Array.each(this.grid.columnConfigs, function(columnConfig) {
            let exist = false;
            for (let i=0; i<this._cells.length; i++) {
                if (this._cells[i].columnConfig === columnConfig) {
                    exist = true;
                    break;
                }
            }
            if (!exist) {
                newColumnConfigs.push(columnConfig);
            }
        }, this);

        // Falls cell noch nicht vorhanden, neue cell erstellen.
        kijs.Array.each(newColumnConfigs, function(columnConfig) {
            let cellConfig = columnConfig.cellConfig;
            let constr = kijs.getObjectFromNamespace(cellConfig.xtype);

            if (!constr) {
                throw new kijs.Error('invalid cell xtype for column ' + columnConfig.caption);
            }

            // change listener
            columnConfig.on('change', this._onColumnConfigChange, this);

            cellConfig.parent = this;
            delete cellConfig.xtype;

            let cell = new constr(cellConfig);
            cell.loadFromDataRow();

            this._cells.push({columnConfig: columnConfig, cell: cell});
        }, this);
    }

    _sortCells() {
        this._cells.sort(function(a, b) {
            if (a.columnConfig.position < b.columnConfig.position) {
                return -1;
            }
            if (a.columnConfig.position > b.columnConfig.position) {
                return 1;
            }
            return 0;
        });
    }

    // EVENTS
    _onColumnConfigChange(e) {
        if ('visible' in e || 'width' in e) {
            kijs.Array.each(this.cells, function(cell) {
                if (e.columnConfig === cell.columnConfig) {
                    cell.render();
                    return false;
                }
            }, this);

        }
        if ('position' in e) {
            this.render();
        }
    }

    // Overwrite
    render(superCall) {
        super.render(true);

        // cells erstellen
        this._createCells();

        // cells sortieren
        this._sortCells();

        // cells rendern
        kijs.Array.each(this.cells, function(cell) {
            cell.renderTo(this._dom.node);
        }, this);

        // Event afterRender auslösen
        if (!superCall) {
            this.raiseEvent('afterRender');
        }
    }

    // overwrite
    unrender(superCall) {
        // Event auslösen.
        if (!superCall) {
            this.raiseEvent('unrender');
        }

        // cells unrendern
        kijs.Array.each(this.cells, function(cell) {
            cell.unrender();
        }, this);

        super.unrender(true);
    }


    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(superCall) {
        if (!superCall) {
            // unrendern
            this.unrender(superCall);

            // Event auslösen.
            this.raiseEvent('destruct');
        }

        // cells destructen
        kijs.Array.each(this.cells, function(cell) {
            cell.columnConfig.off('change', this._onColumnConfigChange, this);
            cell.destruct();
        }, this);

        // Variablen (Objekte/Arrays) leeren
        this._cells = null;
        this._dataRow = null;

        // Basisklasse entladen
        super.destruct(true);
    }
};
/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.grid.cell.Cell (Abstract)
// --------------------------------------------------------------
/**
 * EVENTS
 * ----------
 *
 */
kijs.gui.grid.cell.Cell = class kijs_gui_grid_cell_Cell extends kijs.gui.Element {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        // DOM type
        this._dom.nodeTagName = 'td';

        this._originalValue = null;
        this._columnConfig = null;
        this._editorXType = 'kijs.gui.field.Text';
        this._editorArgs = null;

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            htmlDisplayType: 'code'
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            columnConfig: true,
            editorXType: true,
            editorArgs: true
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }

        // Events
        this._dom.on('dblClick', this._onDblClick, this);
    }

    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------

    get columnConfig() { return this._columnConfig; }
    set columnConfig(val) { this._columnConfig = val; }

    get isDirty() { return this._originalValue !== this.value; }
    set isDirty(val) {
        if (val === false) {
            this._originalValue = this.value;
        } else {
            this._originalValue = null;
        }
    }

    get originalValue() { return this._originalValue; }

    get row() { return this.parent; }

    get value() { return this._dom.html; }
    set value(val) { this.setValue(val); }


    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------

    /**
     * Setzt den Wert auf den Standardwert zurück
     * @param {Boolean} [silent=false] true, falls kein change-event ausgelöst werden soll.
     * @returns {undefined}
     */
    resetValue(silent=false) {
        this.setValue(this.originalValue, silent);
    }

    /**
     * Setzt das value der Zelle.
     * @param {String} value
     * @param {Boolean} [silent=false] true, falls kein change-event ausgelöst werden soll.
     * @param {Boolean} [markDirty=true] false, falls der Eintrag nicht als geändert markiert werden soll.
     * @param {Boolean} [updateDataRow=true] false, falls die dataRow nicht aktualisiert werden soll.
     * @returns {undefined}
     */
    setValue(value, silent=false, markDirty=true, updateDataRow=true) {
        // HTML aktualisieren
        this._setDomHtml(value);

        // dataRow aktualisieren
        if (updateDataRow) {
            this._setRowDataRow(value);
        }

        if (!markDirty) {
            this.isDirty = false;
        }

        if (!silent) {
            this.raiseEvent('change', {value: this.value});
        }

        if (this.isRendered) {
            this.render();
        }
    }

    /**
     * Lädt das value von der dataRow
     * @returns {undefined}
     */
    loadFromDataRow() {
        let vF = this._columnConfig.valueField;
        if (this.row && this.row.dataRow && kijs.isDefined(this.row.dataRow[vF])) {
            this.setValue(this.row.dataRow[vF], true, false, false);
        }
    }

    // PROTECTED

    /**
     * Argumente, welche dem Editor beim Instanzieren übergeben werden.
     * @returns {Object}
     */
    _getEditorArgs() {
        return {
            labelHide: true,
            value: this.value,
            parent: this,
            on: {
                blur: this._onFieldBlur,
                keyDown: function(e) { e.nodeEvent.stopPropagation(); }, // keyDown event stoppen, damit grid keyDown nicht nimmt.
                click: function(e) { e.nodeEvent.stopPropagation(); }, // click event stoppen, damit row focus nicht nimmt.
                context: this
            }
        };
    }

    /**
     * Setzt das HTML im DOM. Kann in abgeleiteter Klasse überschrieben werden,
     * falls ein anderer Wert angezeigt werden soll als das Value.
     * @param {String} value
     * @returns {undefined}
     */
    _setDomHtml(value) {
        this._dom.html = value;
    }

    /**
     * Schreibt das value zurück in die DataRow
     * @param {String} value
     * @returns {undefined}
     */
    _setRowDataRow(value) {
        let vF = this._columnConfig.valueField;
        if (this.row) {
            this.row.dataRow[vF] = value;
        }
    }

    // EVENTS

    _onDblClick(e) {
        if (this.row.grid.editable) {
            // editor starten
            let editor = kijs.getObjectFromNamespace(this._editorXType);

            if (!editor) {
                throw new kijs.Error('invalid xtype for cell editor');
            }

            let eArgs = this._getEditorArgs();
            if (kijs.isObject(this._editorArgs)) {
                eArgs = Object.assign(eArgs, this._editorArgs);
            }

            let edInst = new editor(eArgs);

            // Inhalt Löschen und Textfeld in dom rendern
            kijs.Dom.removeAllChildNodes(this._dom.node);
            edInst.renderTo(this._dom.node);

        }
    }

    _onFieldBlur(e) {
        let fld = e.element;

        let val = fld.value;
        fld.unrender();

        this.setValue(val);
    }


    // Overwrite
    render(superCall) {
        super.render(true);

        // breite
        this._dom.width = this._columnConfig.width;

        // sichtbar?
        this.visible = this._columnConfig.visible;

        // dirty  zeilen: Klasse hinzufügen
        if (this.isDirty) {
            this._dom.clsAdd('kijs-grid-cell-dirty');
        } else {
            this._dom.clsRemove('kijs-grid-cell-dirty');
        }

        // Event afterRender auslösen
        if (!superCall) {
            this.raiseEvent('afterRender');
        }
    }

    // overwrite
    unrender(superCall) {
        // Event auslösen.
        if (!superCall) {
            this.raiseEvent('unrender');
        }

        super.unrender(true);
    }


    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(superCall) {
        if (!superCall) {
            // unrendern
            this.unrender(superCall);

            // Event auslösen.
            this.raiseEvent('destruct');
        }


        // Variablen (Objekte/Arrays) leeren


        // Basisklasse entladen
        super.destruct(true);
    }
};
/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.grid.column.Column
// --------------------------------------------------------------
/**
 * EVENTS
 * ----------
 *
 */
kijs.gui.grid.columnConfig.Checkbox = class kijs_gui_grid_columnConfig_Checkbox extends kijs.gui.grid.columnConfig.ColumnConfig {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        // default xtype
        this._cellXtype = 'kijs.gui.grid.cell.Checkbox';
        this._filterXtype = 'kijs.gui.grid.filter.Checkbox';

        this._disabled = false;

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            disabled: true
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }

        this.cellConfig = {
            disabled: this._disabled
        };
    }
};
/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.grid.column.Column
// --------------------------------------------------------------
/**
 * EVENTS
 * ----------
 *
 */
kijs.gui.grid.columnConfig.Date = class kijs_gui_grid_columnConfig_Date extends kijs.gui.grid.columnConfig.ColumnConfig {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        // default xtype
        this._cellXtype = 'kijs.gui.grid.cell.Date';
        this._filterXtype = 'kijs.gui.grid.filter.Date';

        this._hasTime = false;
        this._format = 'd.m.Y';

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            hasTime: true,
            format: true
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }

        this.cellConfig = {
            hasTime: this._hasTime,
            format: this._format
        };
    }
};
/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.grid.column.Column
// --------------------------------------------------------------
/**
 * EVENTS
 * ----------
 *
 */
kijs.gui.grid.columnConfig.Icon = class kijs_gui_grid_columnConfig_Icon extends kijs.gui.grid.columnConfig.ColumnConfig {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        // default xtype
        this._cellXtype = 'kijs.gui.grid.cell.Icon';
        this._filterXtype = 'kijs.gui.grid.filter.Icon';
        this._iconCharField = null;
        this._iconClsField = null;
        this._iconColorField = null;
        this._iconsCnt = null;
        this._captionField = null;

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            iconsCnt: 155
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            iconCharField:  true,
            iconClsField:  true,
            iconColorField: true,
            iconsCnt: true,
            captionField: true
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }
    }
    
    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------

    get captionField() { return this._captionField; }
    set captionField(val) { this._captionField = val; }

    get iconCharField() { return this._iconCharField; }
    set iconCharField(val) { this._iconCharField = val;}

    get iconClsField() { return this._iconClsField; }
    set iconClsField(val) { this._iconClsField = val; }

    get iconColorField() { return this._iconColorField; }
    set iconColorField(val) { this._iconColorField = val; }
    
    get iconsCnt() { return this._iconsCnt; }
    set iconsCnt(val) { this._iconsCnt = val; }
    
    get valueField() { return this._valueField; }
    set valueField(val) { this._valueField = val; }
};

/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.grid.column.Column
// --------------------------------------------------------------
/**
 * EVENTS
 * ----------
 *
 */
kijs.gui.grid.columnConfig.Number = class kijs_gui_grid_columnConfig_Number extends kijs.gui.grid.columnConfig.ColumnConfig {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        // default xtype
        this._cellXtype = 'kijs.gui.grid.cell.Number';
        this._filterXtype = 'kijs.gui.grid.filter.Number';

        this._decimalPrecision = null;
        this._decimalPoint = '.';
        this._decimalThousandSep = '\'';

        this._numberStyles = [];

        this._unitBefore = '';
        this._unitAfter = '';

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            decimalPrecision: true,
            decimalPoint: true,
            decimalThousandSep: true,
            numberStyles: true,
            unitBefore: true,
            unitAfter: true
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }

        this.cellConfig = {
            decimalPrecision: this._decimalPrecision,
            decimalPoint: this._decimalPoint,
            decimalThousandSep: this._decimalThousandSep,
            numberStyles: this._numberStyles,
            unitBefore: this._unitBefore,
            unitAfter: this._unitAfter
        };
    }
};
/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.grid.column.Column
// --------------------------------------------------------------
/**
 * EVENTS
 * ----------
 *
 */
kijs.gui.grid.columnConfig.Text = class kijs_gui_grid_columnConfig_Text extends kijs.gui.grid.columnConfig.ColumnConfig {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        // default xtype
        this._cellXtype = 'kijs.gui.grid.cell.Text';
        this._filterXtype = 'kijs.gui.grid.filter.Text';

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            // Keine
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }
    }
};
/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.grid.filter.Filter (Abstract)
// --------------------------------------------------------------
/**
 * EVENTS
 * ----------
 *
 */
kijs.gui.grid.filter.Filter = class kijs_gui_grid_filter_Filter extends kijs.gui.Element {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        // DOM type
        this._dom.nodeTagName = 'td';
        this._columnConfig;
        this._filter = {};

        this._searchContainer = new kijs.gui.Dom();
        this._removeFilterIcon = new kijs.gui.Dom({
            cls: 'kijs-grid-filter-reset'
        });

        this._menuButton = new kijs.gui.MenuButton({
            parent: this,
            icon2Char: '&#xf0b0', // fa-filter
            elements: this._getMenuButtons()
        });


        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {

        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            columnConfig: true
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }
    }

    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------

    get columnConfig() { return this._columnConfig; }
    get filter() {
        return {
            type: '',
            valueField: this._columnConfig.valueField
        };
    }
    get isFiltered() { return false; }


    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------

    reset() {
        // Filter zurücksetzen
        // muss in abgeleiteter Klasse überschrieben werden
        this._applyToGrid();
    }

    // wendet den Filter auf das grid an.
    _applyToGrid() {
        this.raiseEvent('filter', this.filter);
    }

    _getDefaultMenuButtons() {
        return [{
            caption : kijs.getText('Filter löschen'),
            iconChar: '&#xf00d', // fa-times
            on: {
                click: function() {
                    this.reset();
                    this._menuButton.menuCloseAll();
                },
                context: this
            }
        },{
            caption : kijs.getText('Alle Filter löschen'),
            iconChar: '&#xf00d', // fa-times
            on: {
                click: function() {
                    this.parent.reset();
                    this._menuButton.menuCloseAll();
                },
                context: this
            }
        }];
    }

    _getMenuButtons() {
        return this._getDefaultMenuButtons();
    }

    // Overwrite
    render(superCall) {
        super.render(true);

        this._searchContainer.renderTo(this._dom.node);
        this._removeFilterIcon.renderTo(this._dom.node);

        this._menuButton.renderTo(this._removeFilterIcon.node);

        // breite
        this._dom.width = this._columnConfig.width;

        // sichtbar?
        this.visible = this._columnConfig.visible;

        // Event afterRender auslösen
        if (!superCall) {
            this.raiseEvent('afterRender');
        }
    }

    // overwrite
    unrender(superCall) {
        // Event auslösen.
        if (!superCall) {
            this.raiseEvent('unrender');
        }

        this._searchContainer.unrender();
        this._removeFilterIcon.unrender();

        super.unrender(true);
    }


    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(superCall) {
        if (!superCall) {
            // unrendern
            this.unrender(superCall);

            // Event auslösen.
            this.raiseEvent('destruct');
        }

        this._searchContainer.destruct();
        this._removeFilterIcon.destruct();

        // Variablen (Objekte/Arrays) leeren
        this._searchContainer = null;
        this._removeFilterIcon = null;

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
        Object.assign(this._defaultConfig, {
            // keine
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            caption: { target: 'html', context: this._captionDom },
            captionCls: { fn: 'function', target: this._captionDom.clsAdd, context: this._captionDom },
            captionHtmlDisplayType: { target: 'htmlDisplayType', context: this._captionDom },
            captionStyle: { fn: 'assign', target: 'style', context: this._captionDom }
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
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
    render(superCall) {
        super.render(true);

        // Span caption rendern (kijs.guiDom)
        if (!this._captionDom.isEmpty) {
            this._captionDom.renderTo(this._dom.node, this._innerDom.node);
        } else {
            this._captionDom.unrender();
        }

        // Event afterRender auslösen
        if (!superCall) {
            this.raiseEvent('afterRender');
        }
    }

    // overwrite
    unrender(superCall) {
        // Event auslösen.
        if (!superCall) {
            this.raiseEvent('unrender');
        }

        this._captionDom.unrender();
        super.unrender(true);
    }


    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(superCall) {
        if (!superCall) {
            // unrendern
            this.unrender(superCall);

            // Event auslösen.
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
// kijs.gui.ContainerStack
// --------------------------------------------------------------
/**
 * Container Element, dass untergeordnete Elemente beinhalten kann.
 * Es wird jeweils nur ein Element angezeigt, die Elemente können
 * animiert gewechselt werden.
 * Das Element besteht aus der innerNode des Containers, in dem sich
 * pro Element eine DOM-Node befindet, in der sich das Element befindet.
 *
 * KLASSENHIERARCHIE
 * kijs.gui.Element
 *  kijs.gui.BoxElement
 *   kijs.gui.Container
 *    kijs.gui.ContainerStack
 *
 * CONFIG-Parameter (es gelten auch die Config-Parameter der Basisklassen)
 * ----------------
 * defaultAnimation    String [optional]    Typ der Animation. Gültige Werte:
 *                                              none:           Keine Animation (default)
 *                                              fade:           Überblenden
 *                                              slideLeft:      Ausfahren nach Links
 *                                              slideRight:     Ausfahren nach Rechts
 *                                              slideTop:       Ausfahren nach oben
 *                                              slideBottom:    Ausfahren nach unten
 *
 * defaultDuration     Integer [optional]   Dauer der Animation in Milisekunden (default: 1000).
 * activeEl            Mixed [optional]     Element, das als erstes angezeigt wird (default: 0 = erstes Element)
 *                                              String = Name des Elements
 *                                              Int = Index des Elements
 *                                              Object = Verweis auf das Element
 *
 *
 * FUNKTIONEN (es gelten auch die Funktionen der Basisklassen)
 * ----------
 * activateAnimated                         Zeigt ein Panel animiert an
 *  Args: element   Mixed                   Element, das als erstes angezeigt wird.
 *                                              String = Name des Elements
 *                                              Int = Index des Elements
 *                                              Object = Verweis auf das Element
 *        animation String [optional]       Art der Animation
 *        duration  Integer [optional]      Dauer der Animation in Milisekunden
 *

 * EIGENSCHAFTEN (es gelten auch die Eigenschaften der Basisklassen)
 * -------------
 *  activeEl         Object                 Gibt das zurzeit aktive Element zurück oder setzt es
 *  defaultAnimation String                 Gibt die Standardanimation zurück oder setzt sie
 *  defaultDuration  Integer                Gibt die Standarddauer zurück oder setzt sie
 *
 *
 * EVENTS
 * ----------

 *
 *
 */
kijs.gui.ContainerStack = class kijs_gui_ContainerStack extends kijs.gui.Container {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        this._activeElOnConstruct = null;
        this._animationTypes = [
            'none',
            'fade',
            'slideLeft',   // gegen links fahren
            'slideRight',  // gegen rechts fahren
            'slideTop',    // gegen oben fahren
            'slideBottom'  // gegen unten fahren
        ];
        this._afterAnimationDefer = null;
        this._defaultAnimation = 'none';
        this._defaultDuration = 500;
        this._domElements = [];
        this._topZIndex = 1;

        // CSS
        this._dom.clsAdd('kijs-containerstack');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            activeEl: 0
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            defaultAnimation: { target: 'defaultAnimation' },
            defaultDuration: { target: 'defaultDuration' },
            activeEl: { target: '_activeElOnConstruct' }
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }

        // Default-Element aktivieren, falls elements vorhanden sind.
        if (this._elements.length > 0 && this._activeElOnConstruct !== null) {
            this.activateAnimated(this._activeElOnConstruct, 'none');
        }
    }


    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------

    get activeEl() { return this._getTopElement(); }
    set activeEl(val) { this.activateAnimated(val); }

    get defaultAnimation() { return this._defaultAnimation; }
    set defaultAnimation(val) {
        if (!kijs.Array.contains(this._animationTypes, val)) {
            throw new kijs.Error(`config "defaultAnimation" is not valid.`);
        }
        this._defaultAnimation = val;
    }

    get defaultDuration() { return this._defaultDuration; }
    set defaultDuration(val) { this._defaultDuration = val; };

    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------

    /**
     * Fügt ein neues Element hinzu.
     * @param {Array|Object} elements
     * @param {Integer|null} index
     * @returns {undefined}
     */
    add(elements, index=null) {
        super.add(elements, index);

        // falls Element in Hintergrund kommt,
        // wird es ausgeblendet.
        this._setSubElementsVisible();
    }

    /**
     * Aktiviert
     * @param {Integer|String|Object} el
     * @param {String} animation
     * @param {Integer} duration Zeit in Milisekunden
     * @returns {undefined}
     */
    activateAnimated(el, animation=null, duration=null) {
        animation = animation || this._defaultAnimation;
        duration = duration || this._defaultDuration;
        let activeEl = this.activeEl;

        if (!kijs.Array.contains(this._animationTypes, animation)) {
            throw new kijs.Error(`animation type not valid.`);
        }

        // by index
        if (kijs.isInteger(el)) {
            el = this._elements[el];

        // by name
        } else if (kijs.isString(el)) {
            el = this.getElementsByName(el, 0, true).shift();
        }

        // Prüfen, ob element in den elements ist ist.
        if (!el || !kijs.Array.contains(this._elements, el)) {
            throw new kijs.Error(`element for animated activation not found.`);
        }

        // falls das neue das alte ist, nichts tun.
        if (activeEl === el) {
            return;
        }

        // Dauer ist 0, wenn ohne Animation
        duration = animation === 'none' ? 0 : duration;

        // DOM-Container-Element abfragen oder erstellen
        let dom = this._getDomOfElement(el);

        // alle animation class entfernen
        kijs.Array.each(this._animationTypes, function(at) {
            dom.clsRemove([
                'kijs-animation-' + at.toLowerCase(),
                'kijs-animation-' + at.toLowerCase() + '-out'
            ]);
        }, this);

        // animation class hinzufügen
        dom.clsAdd('kijs-animation-' + animation.toLowerCase());
        dom.style.animationDuration = duration + 'ms';

        // Element ganz nach oben
        this._topZIndex++;
        dom.style.zIndex = this._topZIndex;

        // element anzeigen
        el.visible = true;

        // beim aktuellen element die 'animation-out' Klasse hinzufügen
        if (activeEl) {
            let activeDom = this._getDomOfElement(activeEl);

            // alle animation class entfernen
            kijs.Array.each(this._animationTypes, function(at) {
                activeDom.clsRemove([
                    'kijs-animation-' + at.toLowerCase(),
                    'kijs-animation-' + at.toLowerCase() + '-out'
                ]);
            }, this);

            // 'out' Klasse hinzufügen
            activeDom.clsAdd('kijs-animation-' + animation.toLowerCase() + '-out');
            activeDom.style.animationDuration = duration+ 'ms';
        }

        // nach der Animation die Elemente ausblenden
        if (this._afterAnimationDefer) {
            window.clearTimeout(this._afterAnimationDefer);
        }
        this._afterAnimationDefer = kijs.defer(function() {
            this._afterAnimationDefer = null;
            this._setSubElementsVisible();
            this._removeAllAnimationClasses();
        }, duration, this);


        // Falls der DOM gemacht ist, wird neu gerendert.
        if (this._innerDom.node) {
            this.render();
        }
    }

    // Overwrite
    remove(elements) {
        if (!kijs.isArray(elements)) {
            elements = [elements];
        }

        // Parent
        super.remove(elements);

        // Element aus dem DOM-Stack entfernen
        kijs.Array.each(elements, function(element) {
            kijs.Array.removeIf(this._domElements, function(domEl) {
                if (domEl.element === element) {
                    domEl.dom.unrender();
                    domEl.dom.destruct();
                    return true;
                }
            }, this);
        }, this);

        // Top-Element sichtbar machen
        this._setSubElementsVisible();
    }

    // Overwrite
    removeAll(preventRender) {

        // Parent
        super.removeAll(preventRender);

        // DOM-Elemente entfernen
        kijs.Array.each(this._domElements, function(domEl) {
            domEl.dom.unrender();
            domEl.dom.destruct();
        }, this);
        kijs.Array.clear(this._domElements);

    }

    // Overwrite
    render(superCall) {
        // Renderer vom Container überspringen, damit
        // elements nicht in innerDom gerendert werden.
        kijs.gui.Element.prototype.render.call(this, arguments);

        // innerDOM rendern
        this._innerDom.renderTo(this._dom.node);

        // die Elemente in die DOM-Elemente rendern
        kijs.Array.each(this._elements, function(element) {
            let dom = this._getDomOfElement(element);
            dom.renderTo(this._innerDom.node);
            element.renderTo(dom.node);
        }, this);

        // Event afterRender auslösen
        if (!superCall) {
            this.raiseEvent('afterRender');
        }
    }


    // PROTECTED
    /**
     * Gibt das DOM-Element zurück, das ein Element kapselt
     * @param {Object} element
     * @returns {kijs.gui.Dom}
     */
    _getDomOfElement(element) {
        for (let i=0; i<this._domElements.length; i++) {
            if (this._domElements[i].element === element) {
                return this._domElements[i].dom;
            }
        }

        // element nicht gefunden, erstellen
        let newDom = new kijs.gui.Dom({
            cls: ['kijs-containerstack-element'],
            style: {
                zIndex: 0
            }
        });

        this._domElements.push({element: element, dom: newDom});
        return newDom;
    }

    /**
     * Liefert das Element mit dem höchsten z-index (=sichtbares element)
     * @returns {element}
     */
    _getTopElement() {
        let topIndex = 0, topElement = null;
        kijs.Array.each(this._elements, function(element) {
            let domEl = this._getDomOfElement(element);
            if (kijs.isNumeric(domEl.style.zIndex) && parseInt(domEl.style.zIndex) >= topIndex) {
                topIndex = parseInt(domEl.style.zIndex);
                topElement = element;
            }
        }, this);
        return topElement;
    }

    /**
     * Setzt die Sichtbarkeit aller unterelemente auf false,
     * ausser vom top-element.
     * @returns {undefined}
     */
    _setSubElementsVisible() {
        let topEl = this._getTopElement();
        kijs.Array.each(this._elements, function(element) {
            if (element !== topEl && kijs.isBoolean(element.visible)) {
                element.visible = false;

            } else if (element === topEl && kijs.isBoolean(element.visible)) {
                element.visible = true;
            }
        }, this);
    }

    /**
     * Entfernt alle CSS Animationen
     * @returns {undefined}
     */
    _removeAllAnimationClasses() {
        kijs.Array.each(this._elements, function(element) {
            kijs.Array.each(this._animationTypes, function(at) {
                this._getDomOfElement(element).clsRemove([
                    'kijs-animation-' + at.toLowerCase(),
                    'kijs-animation-' + at.toLowerCase() + '-out'
                ]);
            }, this);
        }, this);
    }


    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------

    destruct(superCall) {
        if (!superCall) {
            // unrendern
            this.unrender(superCall);

            // Event auslösen.
            this.raiseEvent('destruct');
        }

        // Elemente/DOM-Objekte entladen
        kijs.Array.each(this._innerDomStack, function(dom) {
           dom.destruct();
        }, this);

        // Variablen (Objekte/Arrays) leeren
        this._innerDomStack = null;

        // Basisklasse entladen
        super.destruct(true);
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
        super(false);

        this._dismissDelay = null;

        this._dom.clsRemove('kijs-container');
        this._dom.clsAdd('kijs-cornertipcontainer');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            dismissDelay: 5000,
            width: 230
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            dismissDelay: true
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
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
                throw new kijs.Error(`Unknown value on argument "icon"`);
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
     * @param {String} caption
     * @param {String} msg
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
     * @param {String} caption
     * @param {String} msg
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
     * @param {String} caption
     * @param {String} msg
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
     * @param {Object} config
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
     * @param {String} caption
     * @param {String} msg
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
        if (messages.length === 1) {
            return messages[0];
        }

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
        super.destruct();
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

        this._data = [];
        this._facadeFnLoad = null;
        this._facadeFnArgs = {};
        this._filters = [];
        this._focusable = true;
        this._rpc = null;           // Instanz von kijs.gui.Rpc
        this._selectType = 'none';

        this._dom.clsRemove('kijs-container');
        this._dom.clsAdd('kijs-dataview');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            focusable: true,
            selectType: 'single'
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            autoLoad: { target: 'autoLoad' },   // Soll nach dem ersten Rendern automatisch die Load-Funktion aufgerufen werden?
            data: { target: 'data' },   // Recordset-Array [{id:1, caption:'Wert 1'}] oder Werte-Array ['Wert 1']
            disabled: { target: 'disabled'},
            facadeFnLoad: true,         // Name der Facade-Funktion. Bsp: 'address.load'
            facadeFnArgs: true,         // Objekt mit Argumenten für die FacadeFn
            focusable: { target: 'focusable'},  // Kann das Dataview den Fokus erhalten?
            rpc: { target: 'rpc' },     // Instanz von kijs.gui.Rpc
            selectType: true            // 'none': Es kann nichts selektiert werden
                                        // 'single' (default): Es kann nur ein Datensatz selektiert werden
                                        // 'multi': Mit den Shift- und Ctrl-Tasten können mehrere Datensätze selektiert werden.
                                        // 'simple': Es können mehrere Datensätze selektiert werden. Shift- und Ctrl-Tasten müssen dazu nicht gedrückt werden.
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }

        // Events
        this.on('keyDown', this._onKeyDown, this);
        this.on('elementClick', this._onElementClick, this);
        //this.on('elementFocus', this._onElementFocus, this);
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
     * Setzt das aktuelle Element, dass den Fokus erhalten wird.
     * Null = automatische Ermittlung
     * Um den Fokus zu setzen verwenden sie stattdessen die Funktion .focus() vom Element.
     * @param {kijs.gui.DataViewElement|null} el
     * @returns {undefined}
     */
    set current(el) {
        // Falls kein el übergeben wurde:
        if (!el && !kijs.isEmpty(this._elements)) {
            // Falls es schon ein gültiges Current-Element gibt, dieses nehmen
            if (this._currentEl && kijs.Array.contains(this._elements, this._currentEl)) {
                el = this._currentEl;
            }
            // Sonst das erste selektierte Element
            if (!el) {
                let sel = this.getSelected();
                if (!kijs.isEmpty(sel)) {
                    if (kijs.isArray(sel)) {
                        sel = sel[0];
                    }
                    el = sel;
                }
            }
            // Sonst halt das erste Element
            if (!el) {
                el = this._elements[0];
            }
        }

        this._currentEl = el;
        kijs.Array.each(this._elements, function(elem) {
            if (elem === el) {
                elem.dom.clsAdd('kijs-current');
            } else {
                elem.dom.clsRemove('kijs-current');
            }
            // Nur das currentEl darf den Fokus erhalten können
            if (this._focusable && elem === el) {
                el.dom.nodeAttributeSet('tabIndex', 0);
            } else {
                elem.dom.nodeAttributeSet('tabIndex', undefined);
            }
        }, this);
    }


    get data() { return this._data; }
    set data(val) {
        this._data = val;

        this._createElements(this._data);

        // Current Element ermitteln und setzen
        this.current = null;
    }

    get disabled() { return this._dom.clsHas('kijs-disabled'); }
    set disabled(val) {
        if (val) {
            this._dom.clsAdd('kijs-disabled');
        } else {
            this._dom.clsRemove('kijs-disabled');
        }

        // Elements auch aktivieren/deaktivieren
        kijs.Array.each(this._elements, function(el) {
            if ('disabled' in el) {
                el.disabled = !!val;
            }
        }, this);
    }

    get facadeFnArgs() { return this._facadeFnArgs; }
    set facadeFnArgs(val) { this._facadeFnArgs = val; }

    get facadeFnLoad() { return this._facadeFnLoad; }
    set facadeFnLoad(val) { this._facadeFnLoad = val; }

    get filters() { return this._filters; }
    set filters(val) {
        if (!val) {
            this._filters = [];
        } else {
            if (!kijs.isArray(val)) {
                val = [val];
            }

            // einzelne Filter validieren
            kijs.Array.each(val, function(filter) {
                if (!kijs.isObject(filter) || !('field' in filter) || !('value' in filter) || !kijs.isString(filter.field) || !kijs.isString(filter.value)) {
                    throw new kijs.Error(`invalid argument for filters in kijs.gui.DataView`);
                }
                if (!('compare' in filter) || !kijs.Array.contains(['begin', 'part', 'end', 'full'], filter.compare)) {
                    filter.compare = 'begin';
                }
            }, this);

            this._filters = val;
        }

    }

    get focusable() { return this._focusable; }
    set focusable(val) {
        this._focusable = val;
        if (val) {
            //this._dom.nodeAttributeSet('tabIndex', -1);
        } else {
            //this._dom.nodeAttributeSet('tabIndex', undefined);
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
            throw new kijs.Error(`Unkown format on config "rpc"`);

        }
    }

    get selectType() { return this._selectType; }
    set selectType(val) { this._selectType = val; }


    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------

    /**
     * Wendet Filter auf das DataView an.
     * @param {Array|Object} filters
     * @returns {undefined}
     */
    applyFilters(filters) {
        this.filters = filters;
        if (this.isRendered) {
            this._createElements(this._data);
            this.render();
        }
    }

    /**
     * Fügt Daten hinzu
     * @param {type} data
     * @returns {undefined}
     */
    addData(data){
        if (!kijs.isArray(data)) {
            data = [data];
        }

        this._data = kijs.Array.concat(this._data, data);

        this._createElements(data, false);
    }


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
     * @returns {Array|kijs.gui.DataViewElement|null}
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
     * @returns {Promise}
     */
    load(args) {
        return new Promise((resolve) => {
            // Standardargumente anhängen
            if (kijs.isObject(this._facadeFnArgs) && !kijs.isEmpty(this._facadeFnArgs)) {
                if (kijs.isObject(args)) {
                    Object.assign(args, this._facadeFnArgs);

                } else if (kijs.isArray(args)) {
                    args.push(kijs.Object.clone(this._facadeFnArgs));

                } else {
                    args = kijs.Object.clone(this._facadeFnArgs);
                }
            }

            this._rpc.do(this._facadeFnLoad, args, function(response) {
                this.data = response.rows;
                if (!kijs.isEmpty(response.selectFilters)) {
                    this.selectByFilters(response.selectFilters);
                }

                // Promise ausführen
                resolve(this.data);

                this.raiseEvent('afterLoad', {response: response});
            }, this, true, this, 'dom', false);
        });
    }

    /**
     * Selektiert ein oder mehrere Elemente
     * @param {kijs.gui.Element|Array} elements Element oder Array mit Elementen, die selektiert werden sollen
     * @param {Boolean} [keepExisting=false]            Soll die bestehende selektion belassen werden?
     * @param {Boolean} [preventSelectionChange=false]  Soll das SelectionChange-Event verhindert werden?
     * @returns {undefined}
     */
    select(elements, keepExisting=false, preventSelectionChange=false) {
        if (kijs.isEmpty(elements)) {
            elements = [];
        }

        if (!kijs.isArray(elements)) {
            elements = [elements];
        }

        if (!keepExisting){
            this.clearSelections(true);
        }

        var changed = false;
        kijs.Array.each(elements, function(el) {
            changed = changed || !el.selected;
            el.selected = true;
        }, this);

        // current aktualisieren
        this._currentEl = null;
        this.current = null;

        // SelectionChange auslösen
        if (!preventSelectionChange && changed) {
            this.raiseEvent('selectionChange', { elements: elements, unSelect: false } );
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
            filters = [];
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
        if (!kijs.isEmpty(filters)) {
            kijs.Array.each(this._elements, function(el) {
                if (el instanceof kijs.gui.DataViewElement) {
                    const row = el.dataRow;

                    kijs.Array.each(filters, function(filterFields) {
                        let ok = false;
                        kijs.Array.each(filterFields, function(filterField) {
                            if (kijs.isEmpty(filterField.value) || kijs.isEmpty(filterField.field)) {
                                throw new kijs.Error(`Unkown filter format.`);
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
                }
            }, this);
        }

        // Elemente selektieren
        this.select(selElements, keepExisting, preventSelectionChange);

        // Element mit Fokus neu ermitteln
        this._currentEl = null;
        this.current = null;
    }

    /**
     * Selektiert ein oder mehrere Elemente
     * @param {Array|Int} indexes Index oder Array mit Indexes, die selektiert werden sollen
     * @param {Boolean} [keepExisting=false]            Soll die bestehende selektion belassen werden?
     * @param {Boolean} [preventSelectionChange=false]  Soll das SelectionChange-Event verhindert werden?
     * @returns {undefined}
     */
    selectByIndex(indexes, keepExisting=false, preventSelectionChange=false) {
        if (!kijs.isArray(indexes)) {
            indexes = [indexes];
        }
        let selectElements = [];
        kijs.Array.each(indexes, function(index) {
            kijs.Array.each(this.elements, function(element) {
                if (element.index === index) {
                    selectElements.push(element);
                    return false;
                }
            }, this);
        }, this);

        this.select(selectElements, keepExisting, preventSelectionChange);
    }

    /**
     * Selektiert alle Elemente zwischen el1 und el2
     * @param {kijs.gui.Element} el1
     * @param {kijs.gui.Element} el2
     * @param {bool} [preventSelectionChange=false]     Soll das SelectionChange-Event verhindert werden?
     * @returns {undefined}
     */
    selectBetween(el1, el2, preventSelectionChange=false) {
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
     * und bei allen anderen Elementen auf undefined
     * @param {Object} el
     * @returns {undefined}
     */
    /*setFocusableElement(el) {
        // Sicherstellen, dass alle anderen Elemente den Fokus nicht mehr über die Tabulator-Taste erhalten können
        kijs.Array.each(this._elements, function(elem) {
            elem.dom.nodeAttributeSet('tabIndex', undefined);
        }, this);

        //if (!el && !kijs.isEmpty(this._elements)) {
        //    el = this._elements[0];
        //}

        // Beim neuen Element: tabIndex einschalten
        // kann nun auch über die Tastatur und Maus fokussiert werden.
        if (this._focusable) {
            if (el) {
                el.dom.nodeAttributeSet('tabIndex', 0);
                //this._dom.nodeAttributeSet('tabIndex', undefined);
            } else {
                //this._dom.nodeAttributeSet('tabIndex', 0);
            }
        } else {
            //this._dom.nodeAttributeSet('tabIndex', undefined);
        }
    }*/

    /**
     * Deselektiert ein oder mehrere Elemente
     * @param {kijs.gui.Element|Array} elements Element oder Array mit Elementen, die deselektiert werden sollen
     * @param {bool} [preventSelectionChange=false]     Soll das SelectionChange-Event verhindert werden?
     * @returns {undefined}
     */
    unSelect(elements, preventSelectionChange) {
        if (!kijs.isArray(elements)) {
            elements = [elements];
        }

        kijs.Array.each(elements, function(el) {
            if ('selected' in el) {
                el.selected = false;
            }
        }, this);

        // aktuelles Element neu wählen.
        this.current = null;

        if (!preventSelectionChange) {
            this.raiseEvent('selectionChange', { elements: elements, unSelect: true } );
        }
    }


    // PROTECTED
    /**
     * Erstellt die Elemente
     * @param {array|string} data
     * @param {bool}  removeElements
     * @returns {undefined}
     */
    _createElements(data, removeElements = true) {

        // index des aktuell selektierten Elements
        let selectIndex = null;
        if (this._currentEl && this._currentEl instanceof kijs.gui.DataViewElement && kijs.isDefined(this._currentEl.index)) {
            selectIndex = this._currentEl.index;
        }

        // Bestehende Elemente löschen
        if (this.elements && removeElements) {
            this.removeAll(true);
            this._currentEl = null;
        }

        // Neue Elemente generieren
        let newElements = [];
        for (let i=0, len=data.length; i<len; i++) {

            // Zeile überspringen, falls sie im Filter hängen bleibt.
            if (this._filterMatch(data[i])) {
                continue;
            }

            const newEl = this.createElement(data[i], i);
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

        // selektion wiederherstellen
        if (selectIndex !== null) {
            this.selectByIndex(selectIndex, !removeElements, !removeElements);
        }
    }


    /**
     * Prüft, ob ein Filter auf einen Record matcht
     * @param {Object} record
     * @returns {Boolean}
     */
    _filterMatch(record) {
        let filterMatch = false;

        kijs.Array.each(this.filters, function(filter) {
            if (!kijs.isDefined(record[filter.field])) {
                filterMatch = true;
            }

            let rgx;
            if (filter.compare === 'begin') {
                rgx = new RegExp('^' + kijs.Char.getRegexPattern(kijs.String.regexpEscape(filter.value)), 'i');

            } else if (filter.compare === 'part') {
                rgx = new RegExp(kijs.Char.getRegexPattern(kijs.String.regexpEscape(filter.value)), 'i');

            } else if (filter.compare === 'end') {
                rgx = new RegExp(kijs.Char.getRegexPattern(kijs.String.regexpEscape(filter.value)) + '$', 'i');

            } else if (filter.compare === 'full') {
                rgx = new RegExp('^' + kijs.Char.getRegexPattern(kijs.String.regexpEscape(filter.value)) + '$', 'i');

            } else {
                throw new kijs.Error(`invalid value for filter.compare in kijs.gui.DataView`);
            }

            if (!kijs.toString(record[filter.field]).match(rgx)) {
                filterMatch = true;
            }
        }, this);

        return filterMatch;
    }

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
        if (!this.disabled) {
            this.current = e.raiseElement;
            if (this._focusable) {
                e.raiseElement.focus();
            }
            this._selectEl(this._currentEl, e.nodeEvent.shiftKey, e.nodeEvent.ctrlKey);
        }
    }

    /*_onElementFocus(e) {
        if (!this.disabled) {
            // Element festlegen, welches über die Tabulator-Taste den Fokus erhält
            //this.setFocusableElement(e.raiseElement);
        }
    }*/

    _onKeyDown(e) {
        if (!this.disabled) {
            switch (e.nodeEvent.keyCode) {
                case kijs.keys.LEFT_ARROW:
                    if (this._currentEl) {
                        const prev = this._currentEl.previous;
                        if (prev) {
                            this.current = prev;
                            if (this._focusable) {
                                prev.focus();
                            }
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
                                    if (this._focusable) {
                                        el.focus();
                                    }
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
                            if (this._focusable) {
                                next.focus();
                            }
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
                                    if (this._focusable) {
                                        el.focus();
                                    }
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
                    break;

            }
        }
    }


    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(superCall) {
        if (!superCall) {
            // unrendern
            this.unrender(superCall);

            // Event auslösen.
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
// kijs.gui.DropZone
// --------------------------------------------------------------
/**
 * DropZone für Dateitransfer. Dem Container wird beim Dragover eine CSS-Klasse zugewiesen, um die Zone zu markieren.
 *
 * KLASSENHIERARCHIE
 * kijs.gui.Element
 *  kijs.gui.Container
 *   kijs.gui.DropZone
 *
 * CONFIG-Parameter (es gelten auch die Config-Parameter der Basisklassen)
 * ----------------
 * contentTypes    Array|String Ein (oder ein Array von) Content-Types. z.B. "image/jpeg" für JPG's oder nur "image" alle Bildtypen.
 *
 * FUNKTIONEN (es gelten auch die Funktionen der Basisklassen)
 * ----------
 *
 *
 * EIGENSCHAFTEN (es gelten auch die Eigenschaften der Basisklassen)
 * -------------
 * contentTypes
 *
 *
 * EVENTS
 * ----------
 *
 *
 */
kijs.gui.DropZone = class kijs_gui_DropZone extends kijs.gui.Container {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        this._dragOverCls = 'kijs-dragover';
        this._dragOverForbiddenCls = 'kijs-dragover-forbidden';
        this._contentTypes = [];
        this._validMediaTypes = [
            'application',
            'audio',
            'example',
            'image',
            'message',
            'model',
            'multipart',
            'text',
            'video'
        ];

        // CSS
        this._dom.clsAdd('kijs-dropzone');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            dragOverCls: true,
            dragOverForbiddenCls: true,
            contentTypes: { target: 'contentTypes' }
        });

        // Drag-Events kommen nicht vom Element, sondern von dieser Klasse
         this._eventForwardsRemove('dragEnter', this._dom);
         this._eventForwardsRemove('dragOver', this._dom);
         this._eventForwardsRemove('dragLeave', this._dom);
         this._eventForwardsRemove('drop', this._dom);

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }

        // Events für DOM mappen
        this._dom.on('dragEnter', this._onDragEnter, this);
        this._dom.on('dragOver', this._onDragOver, this);
        this._dom.on('dragLeave', this._onDragLeave, this);
        this._dom.on('drop', this._onDrop, this);

    }


    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------

    get contentTypes() { return this._contentTypes; }
    set contentTypes(val) {
        if (!kijs.isArray(val)) {
            val = [val];
        }

        kijs.Array.each(val, function(contentType) {
            let parts = contentType.toLowerCase().split('/', 2);
            if (!kijs.Array.contains(this._validMediaTypes, parts[0])) {
                throw new kijs.Error('invalid content type "' + contentType + '"');
            }
            this._contentTypes.push(parts.join('/'));
        }, this);
    }

    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------


    _checkMime(dataTransferItems) {
        for (let i=0; i<dataTransferItems.length; i++) {
            if (dataTransferItems[i].type) {
                let parts = dataTransferItems[i].type.split('/', 2);
                if (!kijs.Array.contains(this._contentTypes, parts[0]) && !kijs.Array.contains(this._contentTypes, parts.join('/'))) {
                    return false;
                }
            }
        }
        return true;
    }

    // EVENTS
    _onDragEnter(e) {
        this._dom.clsAdd(this._dragOverCls);
        this.raiseEvent('dragEnter', e);
    }

    _onDragOver(e) {
        e.nodeEvent.preventDefault();

        // 'forbidden' Klasse, falls ungültiger Dateityp
        if (e.nodeEvent.dataTransfer && e.nodeEvent.dataTransfer.items && this._contentTypes.length > 0) {
            if (!this._checkMime(e.nodeEvent.dataTransfer.items)) {
                this._dom.clsAdd(this._dragOverForbiddenCls);
            }
        }

        this._dom.clsAdd(this._dragOverCls);
        this.raiseEvent('dragOver', e);
    }

    _onDragLeave(e) {
        this._dom.clsRemove(this._dragOverCls);
        this._dom.clsRemove(this._dragOverForbiddenCls);
        this.raiseEvent('dragLeave', e);
    }

    _onDrop(e) {
        e.nodeEvent.preventDefault();
        this._dom.clsRemove(this._dragOverCls);
        this._dom.clsRemove(this._dragOverForbiddenCls);

        let valid = true;
        if (e.nodeEvent.dataTransfer && e.nodeEvent.dataTransfer.items && this._contentTypes.length > 0) {
            if (!this._checkMime(e.nodeEvent.dataTransfer.items)) {
                valid = false;
            }
        }

        e.validMime = valid;
        this.raiseEvent('drop', e);
    }

    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------

    destruct(superCall) {
        if (!superCall) {
            // unrender
            this.unrender(superCall);

            // Event auslösen.
            this.raiseEvent('destruct');
        }

        // Basisklasse entladen
        super.destruct(true);
    }

};
/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.MenuButton
// --------------------------------------------------------------
kijs.gui.MenuButton = class kijs_gui_MenuButton extends kijs.gui.Button {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        this._spinbox = new kijs.gui.SpinBox({
            cls: ['kijs-flexcolumn', 'kijs-menubutton-spinbox'],
            parent: this,
            target: this,
            ownerNodes: [this]
        });
        this._direction = null;
        this._expandOnHover = null;
        this._expandTimer = null;

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });

        // default xtype der Unterelemente soll der Button sein.
        if (kijs.isObject(config)) {
            if (kijs.isObject(config.defaults) && !kijs.isDefined(config.defaults.xtype)) {
                config.defaults.xtype = 'kijs.gui.Button';

            } else if (!kijs.isDefined(config.defaults)) {
                config.defaults = {
                    xtype: 'kijs.gui.Button'
                };
            }
        }

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            direction: { target: 'direction', context: this},
            expandOnHover: { target: 'expandOnHover', context: this},

            // Attribute für Container weiterreichen
            autoScroll: { target: 'autoScroll', context: this._spinbox },
            defaults: { target: 'defaults', context: this._spinbox, prio: 1},
            elements: { target: 'elements', prio: 2},
            html: { target: 'html', context: this._spinbox },
            htmlDisplayType: { target: 'htmlDisplayType', context: this._spinbox },
            innerCls: { target: 'innerCls', context: this._spinbox },
            innerStyle : { target: 'innerStyle', context: this._spinbox }
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }

        // falls wir in einem Untermenu sind, ist der default gegen rechts
        if (this._direction === null) {
            if (this.upX('kijs.gui.MenuButton')) {
                this.direction = 'right';
            } else {
                this.direction = 'down';
            }
        }

        // falls wir in einem Untermenu sind, wird das Menu beim Hoover automatisch geöffnet
        if (this._expandOnHover === null) {
            if (this.upX('kijs.gui.MenuButton')) {
                this.expandOnHover = true;
            } else {
                this.expandOnHover = false;
            }
        }

        // Klick Event
        this.on('click', this._onBtnClick, this);
    }


    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get direction() { return this._direction; }
    set direction(val) {
        let iconChar = this._getIconChar(val);
        if (!iconChar) {
            throw new kijs.Error('invalid argument for direction attribute');
        }
        if (!this.icon2Char) {
            this.icon2Char = iconChar;
        }
        this._direction = val;

        switch (val) {
            case 'left':
                this._spinbox.ownPos = 'tr';
                this._spinbox.targetPos = 'tl';
                this._spinbox.offsetX = -5;
                break;
            case 'right':
                this._spinbox.ownPos = 'tl';
                this._spinbox.targetPos = 'tr';
                this._spinbox.offsetX = -5;
                break;
            case 'up':
                this._spinbox.ownPos = 'bl';
                this._spinbox.targetPos = 'tl';
                this._spinbox.offsetX = 0;
                break;
            case 'down':
                this._spinbox.ownPos = 'tl';
                this._spinbox.targetPos = 'bl';
                this._spinbox.offsetX = 0;
                break;
        }
    }

    get elements() { return this._spinbox.elements; }
    set elements(val) {
        this._spinbox.removeAll();
        this.add(val);
    }


    get expandOnHover() { return this._expandOnHover; }
    set expandOnHover(val) {
        // listeners setzen
        if (val) {
            this.on('mouseEnter', this._onMouseEnter, this);
            this.on('mouseLeave', this._onMouseLeave, this);

        // listeners entfernen
        } else {
            this.off('mouseEnter', this._onMouseEnter, this);
            this.off('mouseLeave', this._onMouseLeave, this);
        }

        this._expandOnHover = !!val;
    }

    get spinbox() { return this._spinbox; }

    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------

    /**
     * Fügt dem Menu neue Elemente hinzu.
     * @param {Object|Array} elements
     * @returns {undefined}
     */
    add(elements) {
        if (!kijs.isArray(elements)) {
            elements = [elements];
        }

        let newElements = [];
        kijs.Array.each(elements, function(element) {

            // Linie
            if (kijs.isString(element) && element === '-') {
                newElements.push(new kijs.gui.Element({
                    name: '<hr>',
                    cls:  'separator',
                    html: '<hr />'
                }));

            // Sonstiger Text
            } else if (kijs.isString(element)) {
                newElements.push(new kijs.gui.Element({
                    html: element
                }));

            // Sonstiges Element
            } else {
                newElements.push(element);
            }
        });

        this._spinbox.add(newElements);
    }

    /**
     * Schliesst das Dropdownmenu und alle Untermenus
     * @returns {undefined}
     */
    menuClose() {
        this._spinbox.close();

        // timeout löschen
        if (this._expandTimer) {
            window.clearTimeout(this._expandTimer);
            this._expandTimer = null;
        }

        let p = this.parent;
        while (p) {
            if (p instanceof kijs.gui.MenuButton) {
                p.spinbox.ownerNodeRemove(this._spinbox);
            }
            p = p.parent;
        }
    }

    /**
     * Schliesst das Dropdownmenu und alle unter- und übergeordneten Menus
     * @returns {undefined}
     */
    menuCloseAll() {
        let m = this, p=this.parent;
        while (p) {
            if (p instanceof kijs.gui.MenuButton) {
                m = p;
            }
            p = p.parent;
        }
        m.menuClose();
    }

    /**
     * Zeigt das Dropdownmenu an.
     * @returns {undefined}
     */
    menuShow() {
        this._spinbox.show();

        // den übergeordneten MenuButtons mitteilen, dass beim Klick auf dieses Element
        // das Menu nicht geschlossen werden soll.
        let p = this.parent;
        while (p) {
            if (p instanceof kijs.gui.MenuButton) {
                p.spinbox.ownerNodeAdd(this._spinbox);
            }
            p = p.parent;
        }
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
            if (elements[i] === '-'){
                for (let y=0; y<this.elements.length; y++) {
                    if (this.elements[y].name === '<hr>'){
                        removeElements.push(this.elements[y]);
                    }
                };
            } else if (kijs.Array.contains(this.elements, elements[i])) {
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
            if (el.unrender) {
                el.unrender();
            }
            kijs.Array.remove(this.elements, el);
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
        if (this.raiseEvent('beforeRemove', {elements: this.elements}) === false) {
            return;
        }

        // leeren
        kijs.Array.each(this.elements, function(el) {
            el.off(null, null, this);
            if (el.unrender) {
                el.unrender();
            }
        }, this);
        kijs.Array.clear(this.elements);

        // Falls der DOM gemacht ist, wird neu gerendert.
        if (this.dom && !preventRender) {
            this.render();
        }

        // Gelöscht, Event ausführen
        this.raiseEvent('remove');
    }


    // Overwrite
    render(superCall) {
        // dom mit elements rendern (innerDom)
        super.render(true);

        // Event afterRender auslösen
        if (!superCall) {
            this.raiseEvent('afterRender');
        }
    }


    // overwrite
    unrender(superCall) {
        // Event auslösen.
        if (!superCall) {
            this.raiseEvent('unrender');
        }

        // Spinbox schliessen und bei owner abmelden
        this.menuClose();

        // Button unrendern
        super.unrender(true);
    }


    // PROTECTED
    _onBtnClick() {
        if (this._spinbox.dom.node) {
            this.menuClose();
        } else {
            this.menuShow();
        }
    }

    _onMouseEnter() {
        if (!this._expandTimer) {
            this._expandTimer = kijs.defer(function() {
                if (!this._spinbox.dom.node) {
                    this.menuShow();
                }
            }, 500, this);
        }
    }

    _onMouseLeave() {
        if (this._expandTimer) {
            window.clearTimeout(this._expandTimer);
            this._expandTimer = null;
        }
    }


    _getIconChar(direction) {
        switch (direction) {
            case 'left': return '&#xf104';
            case 'right': return '&#xf105';
            case 'up': return '&#xf106';
            case 'down': return '&#xf107';
        }
        return '';
    }


    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(superCall) {
        if (!superCall) {
            // unrender
            this.unrender(superCall);

            // Event auslösen.
            this.raiseEvent('destruct');
        }

        // Elemente/DOM-Objekte entladen
        if (this._spinbox) {
            this._spinbox.destruct();
        }

        // Variablen (Objekte/Arrays) leeren
        this._spinbox = null;

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
        super(false);

        this._headerBarEl = new kijs.gui.PanelBar({
            cls: 'kijs-headerbar',
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

        this._footerBarEl = new kijs.gui.PanelBar({
            cls: 'kijs-footerbar',
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
        Object.assign(this._defaultConfig, {
            collapseHeight: 50,
            collapseWidth: 50
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            // headerBar
            caption: { target: 'html', context: this._headerBarEl },
            headerBarElements: { fn: 'function', target: this._headerBarEl.containerRightEl.add, context: this._headerBarEl.containerRightEl },
            headerBarStyle: { fn: 'assign', target: 'style', context: this._headerBarEl.dom },
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
            footerCaption: { target: 'html', context: this._footerBarEl },
            footerBarElements: { fn: 'function', target: this._footerBarEl.containerLeftEl.add, context: this._footerBarEl.containerLeftEl },
            footerBarStyle: { fn: 'assign', target: 'style', context: this._footerBarEl.dom },

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
            config = Object.assign({}, this._defaultConfig, config);
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
            this._headerBarEl.containerRightEl.remove(this._closeButtonEl);
            this._closeButtonEl = null;

        // Instanz von kijs.gui.Button
        } else if (val instanceof kijs.gui.Button) {
            if (this._closeButtonEl) {
                this._headerBarEl.containerRightEl.remove(this._closeButtonEl);
            }
            this._closeButtonEl = val;
            this._closeButtonEl.on('click', this._onCloseClick, this);
            this._headerBarEl.containerRightEl.add(this._closeButtonEl);

        // Config-Objekt
        } else if (kijs.isObject(val)) {
            if (this._closeButtonEl) {
                this._closeButtonEl.applyConfig(val);
            } else {
                this._closeButtonEl = new kijs.gui.Button(val);
                this._closeButtonEl.on('click', this._onCloseClick, this);
                this._headerBarEl.containerRightEl.add(this._closeButtonEl);
            }

        } else {
            throw new kijs.Error(`Unkown format on config "closeButton"`);
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
                throw new kijs.Error(`Unkown pos on config "collapsible"`);
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
            this._headerBarEl.containerRightEl.remove(this._collapseButtonEl);
            this._collapseButtonEl = null;

        // Instanz von kijs.gui.Button
        } else if (val instanceof kijs.gui.Button) {
            if (this._collapseButtonEl) {
                this._headerBarEl.containerRightEl.remove(this._collapseButtonEl);
            }
            this._collapseButtonEl = val;
            this._collapseButtonEl.on('click', this._onCollapseClick, this);
            this._headerBarEl.containerRightEl.add(this._collapseButtonEl);

        // Config-Objekt
        } else if (kijs.isObject(val)) {
            if (this._collapseButtonEl) {
                this._collapseButtonEl.applyConfig(val);
            } else {
                this._collapseButtonEl = new kijs.gui.Button(val);
                this._collapseButtonEl.on('click', this._onCollapseClick, this);
                this._headerBarEl.containerRightEl.add(this._collapseButtonEl);
            }

        } else {
            throw new kijs.Error(`Unkown format on config "collapseButton"`);
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
            this._headerBarEl.containerRightEl.remove(this._maximizeButtonEl);
            this._maximizeButtonEl = null;

        // Instanz von kijs.gui.Button
        } else if (val instanceof kijs.gui.Button) {
            if (this._maximizeButtonEl) {
                this._headerBarEl.containerRightEl.remove(this._maximizeButtonEl);
            }
            this._maximizeButtonEl = val;
            this._maximizeButtonEl.on('click', this._onMaximizeClick, this);
            this._headerBarEl.containerRightEl.add(this._maximizeButtonEl);

        // Config-Objekt
        } else if (kijs.isObject(val)) {
            if (this._maximizeButtonEl) {
                this._maximizeButtonEl.applyConfig(val);
            } else {
                this._maximizeButtonEl = new kijs.gui.Button(val);
                this._maximizeButtonEl.on('click', this._onMaximizeClick, this);
                this._headerBarEl.containerRightEl.add(this._maximizeButtonEl);
            }

        } else {
            throw new kijs.Error(`Unkown format on config "maximizeButton"`);
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
     * @param {bool} [preventEvent=false] Kein 'close' Event auslösen
     * @returns {undefined}
     */
    close(preventEvent=false) {
        if (!preventEvent) {
            this.raiseEvent('close');
        }
        
        if (this._parentEl && this._parentEl instanceof kijs.gui.Container && this._parentEl.hasChild(this)) {
            this._parentEl.remove(this);
        } else {
            this.unrender();
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
     * @param {Number} size [optional] Breite oder Höhe in die das Panel wiederhergestellt werden soll
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
    render(superCall) {
        // dom mit elements rendern (innerDom)
        super.render(true);

        // HeaderBar rendern (kijs.gui.Bar)
        if (!this._headerBarEl.isEmpty) {
            this._headerBarEl.renderTo(this._dom.node, this._innerDom.node);
        } else {
            this._headerBarEl.unrender();
        }

        // Header rendern (kijs.gui.Container)
        if (!this._headerEl.isEmpty) {
            this._headerEl.renderTo(this._dom.node, this._innerDom.node);
        } else {
            this._headerEl.unrender();
        }

        // Footer rendern (kijs.gui.Container)
        if (!this._footerEl.isEmpty) {
            this._footerEl.renderTo(this._dom.node);
        } else {
            this._footerEl.unrender();
        }

        // FooterBar rendern (kijs.gui.Bar)
        if (!this._footerBarEl.isEmpty) {
            this._footerBarEl.renderTo(this._dom.node);
        } else {
            this._footerBarEl.unrender();
        }

        // resizer
        if (this._resizerEl) {
            this._resizerEl.renderTo(this._dom.node);
        }

        // Event afterRender auslösen
        if (!superCall) {
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
    unrender(superCall) {
        // Event auslösen.
        if (!superCall) {
            this.raiseEvent('unrender');
        }

        this._headerBarEl.unrender();
        this._headerEl.unrender();
        this._footerEl.unrender();
        this._footerBarEl.unrender();
        if (this._resizerEl) {
            this._resizerEl.unrender();
        }
        super.unrender(true);
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

                    // Wenn der Fokus nicht auf dem Element, Click-Event werfen
                    if (document.activeElement !== el.dom.node) {
                        el.raiseEvent('click');
                    }
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
    destruct(superCall) {
        if (!superCall) {
            // unrender
            this.unrender(superCall);

            // Event auslösen.
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
/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.PanelBar
// --------------------------------------------------------------
kijs.gui.PanelBar = class kijs_gui_PanelBar extends kijs.gui.Container {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        this._iconEl = new kijs.gui.Icon({ parent: this });
        this._containerLeftEl = new kijs.gui.Container({
            cls: 'kijs-container-left',
            parent: this
        });
        this._containerLeftEl.dom.clsRemove('kijs-container');

        this._containerRightEl = new kijs.gui.Container({
            cls: 'kijs-container-right',
            parent: this
        });
        this._containerRightEl.dom.clsRemove('kijs-container');

        this._dom.clsRemove('kijs-container');
        this._dom.clsAdd('kijs-panelbar');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            icon: { target: 'icon' },
            iconChar: { target: 'iconChar', context: this._iconEl },
            iconCls: { target: 'iconCls', context: this._iconEl },
            iconColor: { target: 'iconColor', context: this._iconEl },

            elementsLeft: { fn: 'function', target: this._containerLeftEl.add, context: this._containerLeftEl },
            elementsRight: { fn: 'function', target: this._containerRightEl.add, context: this._containerRightEl }
        });

        // click- und mouseDown-Event soll nur auf dem label und icon kommen. Bei den elements nicht.
        this._eventForwardsRemove('click', this._dom);
        this._eventForwardsAdd('click', this._innerDom);
        this._eventForwardsAdd('click', this._iconEl.dom);

        this._eventForwardsRemove('dblClick', this._dom);
        this._eventForwardsAdd('dblClick', this._innerDom);
        this._eventForwardsAdd('dblClick', this._iconEl.dom);

        this._eventForwardsRemove('mouseDown', this._dom);
        this._eventForwardsAdd('mouseDown', this._innerDom);
        this._eventForwardsAdd('mouseDown', this._iconEl.dom);

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }
    }


    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
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
            throw new kijs.Error(`config "icon" is not valid.`);

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
    get isEmpty() { return super.isEmpty && this._iconEl.isEmpty && this._containerLeftEl.isEmpty && this._containerRightEl.isEmpty; }

    get containerLeftEl() { return this._containerLeftEl; }

    get containerRightEl() { return this._containerRightEl; }


    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // Overwrite
    render(superCall) {
        // Schematischer Aufbau des DOMs:
        // + panelBar
        //   + icon
        //   + containerLeft
        //   + innerDom
        //   + containerRight

        // dom rendern. Im innerDom ist die Bezeichnung (html). Links und rechts davon sind die Tools
        super.render(true);

        // Span icon rendern (icon kijs.gui.Icon)
        if (!this._iconEl.isEmpty) {
            this._iconEl.renderTo(this._dom.node, this._innerDom.node);
        } else {
            this._iconEl.unrender();
        }

        // ToolsLeft rendern (kijs.gui.Container)
        if (!this._containerLeftEl.isEmpty) {
            this._containerLeftEl.renderTo(this._dom.node, this._innerDom.node);
        } else {
            this._containerLeftEl.unrender();
        }

        // ToolsRight rendern (kijs.gui.Container)
        if (!this._containerRightEl.isEmpty) {
            this._containerRightEl.renderTo(this._dom.node);
        } else {
            this._containerRightEl.unrender();
        }

        // Event afterRender auslösen
        if (!superCall) {
            this.raiseEvent('afterRender');
        }
    }

    // overwrite
    unrender(superCall) {
        // Event auslösen.
        if (!superCall) {
            this.raiseEvent('unrender');
        }

        this._iconEl.unrender();
        this._containerLeftEl.unrender();
        this._containerRightEl.unrender();
        super.unrender(true);
    }


    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(superCall) {
        if (!superCall) {
            // unrendern
            this.unrender(superCall);

            // Event auslösen.
            this.raiseEvent('destruct');
        }

        // Elemente/DOM-Objekte entladen
        if (this._iconEl) {
            this._iconEl.destruct();
        }
        if (this._containerLeftEl) {
            this._containerLeftEl.destruct();
        }
        if (this._containerRightEl) {
            this._containerRightEl.destruct();
        }

        // Variablen (Objekte/Arrays) leeren
        this._iconEl = null;
        this._containerLeftEl = null;
        this._containerRightEl = null;

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

        this._autoSize = 'min';     // Grösse (ja nach Pos die Breite oder Höhe) an das targetEl anpassen.
                                    // Werte: 'min' Grösse ist mind. wie beim targetEl
                                    //        'max' Grösse ist höchstens wie beim targetEl
                                    //        'fit' Grösse ist gleich wie beim targetEl
                                    //        'none' Grösse wird nicht angepasst

        this._offsetX = 0;           // Verschiebung aus dem Ankerpunkt auf der X-Achse
        this._offsetY = 0;           // Verschiebung aus dem Ankerpunkt auf der Y-Achse

        this._ownerNodes = [this._dom]; // Events auf diesen kijs.gui.Dom oder HTMLNodes werden ignoriert, die SpinBox wird nicht geschlossen

        this._openOnInput = true;   // Soll beim Texteingeben in Inputfield die SpinBox automatisch geöffnet werden?

        this._preventHide = false;  // das Ausblenden der SpinBox verhindern

        this._targetEl = null;              // Zielelement (kijs.gui.Element)
        this._targetDomProperty = 'dom';    // Dom-Eigenschaft im Zielelement (String)
        this._autoWidth = true;

        this._dom.clsRemove('kijs-container');
        this._dom.clsAdd('kijs-spinbox');


        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            allowSwapX: true,
            allowSwapY: true,
            autoSize: { target: 'autoSize' },
            offsetX: true,
            offsetY: true,
            ownPos: true,
            openOnInput: true,
            targetPos: true,
            target: { target: 'target' },
            targetDomProperty: true,
            ownerNodes: { fn: 'appendUnique', target: '_ownerNodes' }
        });

        // Listener
        this.on('keyDown', this._onElKeyDown, this);

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
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

    get autoSize() { return this._autoSize; }
    set autoSize(val) {
        if (kijs.Array.contains(['min', 'max', 'fit', 'none'], val)) {
            this._autoSize = val;
        } else {
            throw new kijs.Error(`Unkown format on config "autoSize"`);
        }
    }

    get offsetX() { return this._offsetX; }
    set offsetX(val) { this._offsetX = val; }

    get offsetY() { return this._offsetY; }
    set offsetY(val) { this._offsetY = val; }

    get ownPos() { this._ownPos; }
    set ownPos(val) {
        if (kijs.Array.contains(['tl', 't', 'tr', 'l', 'c', 'r', 'bl', 'b', 'br'], val)) {
            this._ownPos = val;
        } else {
            throw new kijs.Error(`Unkown format on config "pos"`);
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
            this._targetEl.off('keyDown', this._onElKeyDown, this);
        }

        if (val instanceof kijs.gui.Element) {
            this._targetEl = val;
            this._targetEl.on('input', this._onTargetElInput, this);
            this._targetEl.on('keyDown', this._onElKeyDown, this);

        } else {
            throw new kijs.Error(`Unkown format on config "target"`);

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
            throw new kijs.Error(`Unkown format on config "targetPos"`);
        }
    }

    // overwrite
    set width(val) {
        this._autoWidth = kijs.isNumeric(val) ? false : true;
        super.width = val;
    }


    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    /**
     * Schliesst die SpinBox
     * @returns {undefined}
     */
    close() {
        this.unrender();
        this.raiseEvent('close');
    }

    /**
     * Fügt eine Node hinzu, bei Klick auf diese wird das Fenster nicht geschlossen.
     * @param {kijs.gui.Element|kijs.gui.Dom|DOMElement} ownerNode
     * @returns {undefined}
     */
    ownerNodeAdd(ownerNode) {
        if (!kijs.Array.contains(this._ownerNodes, ownerNode)) {
            this._ownerNodes.push(ownerNode);
        }

        if (ownerNode instanceof kijs.gui.Element) {
            ownerNode = ownerNode.dom;
        }
        if (ownerNode instanceof kijs.gui.Dom) {
            ownerNode = ownerNode.node;
        }
        if (ownerNode) {
            kijs.Dom.addEventListener('mousedown', ownerNode, this._onNodeMouseDown, this);
            kijs.Dom.addEventListener('resize', ownerNode, this._onNodeResize, this);
            kijs.Dom.addEventListener('wheel', ownerNode, this._onNodeWheel, this);
        }
    }

    /**
     * Entfernt eine Node aus den überwachten elementen
     * @param {kijs.gui.Element|kijs.gui.Dom|DOMElement} ownerNode
     * @param {Bool} removeFromObservedNodes soll die Node von der Überwachung entfernt werden?
     * @returns {undefined}
     */
    ownerNodeRemove(ownerNode, removeFromObservedNodes=true) {
        if (removeFromObservedNodes) {
            kijs.Array.remove(this._ownerNodes, ownerNode);
        }

        if (ownerNode instanceof kijs.gui.Element) {
            ownerNode = ownerNode.dom;
        }
        if (ownerNode instanceof kijs.gui.Dom) {
            ownerNode = ownerNode.node;
        }
        if (ownerNode) {
            kijs.Dom.removeEventListener('mousedown', ownerNode, this);
            kijs.Dom.removeEventListener('resize', ownerNode, this);
            kijs.Dom.removeEventListener('wheel', ownerNode, this);
        }
    }

    /**
     * Zeigt die SpinBox an
     * @returns {undefined}
     */
    show() {
        // SpinBox anzeigen
        this.renderTo(document.body);

        // Breite rechnen
        this._calculateWidth();

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
        kijs.Array.each(this._ownerNodes, function(ownerNode) {
            this.ownerNodeAdd(ownerNode);
        }, this);

        this.raiseEvent('show');
    }

    unrender(superCall) {
        // Event auslösen.
        if (!superCall) {
            this.raiseEvent('unrender');
        }

        kijs.Dom.removeEventListener('mousedown', document.body, this);
        kijs.Dom.removeEventListener('resize', window, this);
        kijs.Dom.removeEventListener('wheel', window, this);

        kijs.Array.each(this._ownerNodes, function(ownerNode) {
            this.ownerNodeRemove(ownerNode, false);
        }, this);

        super.unrender(true);
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

        // Evtl. Grösse automatisch anpassen
        if (this._autoSize !== 'none') {
            // Breite anpassen
            if ( (this._targetPos.indexOf('t') !== -1 || this._targetPos.indexOf('b') !== -1) &&
                    (this._ownPos.indexOf('t') !== -1 || this._ownPos.indexOf('b') !== -1) ) {
                const width = this._targetEl.spinBoxWidth;
                switch (this._autoSize) {
                    case 'min': this.style.minWidth = width + 'px'; break;
                    case 'max': this.style.maxWidth = width + 'px'; break;
                    case 'fit': this.style.width = width + 'px'; break;
                }

            // Höhe anpassen
            } else if ( (this._targetPos.indexOf('l') !== -1 || this._targetPos.indexOf('r') !== -1) &&
                    (this._ownPos.indexOf('l') !== -1 || this._ownPos.indexOf('r') !== -1) ) {
                let height = this._targetEl.spinBoxHeight;
                switch (this._autoSize) {
                    case 'min': this.style.minHeight = height + 'px'; break;
                    case 'max': this.style.maxHeight = height + 'px'; break;
                    case 'fit': this.style.height = height + 'px'; break;
                }
            }
        }

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

    /**
     * Schaut, wie breit das Element ohne Scrollbar ist, und stellt diese Fix ein.
     * Dies wird benötigt, das Firefox die Scrollbar nicht in die Breite einrechnet.
     * @returns {undefined}
     */
    _calculateWidth() {
        if (this._autoWidth) {
            this._dom.node.style.overflow = 'hidden';
            this._dom.width = null;
            let pos = kijs.Dom.getAbsolutePos(this._dom.node);
            let sbw = kijs.Dom.getScrollbarWidth();
            let w = pos.w + sbw + 10;

            // Firefox macht die scrollbar innerhalb
            // vom Container, deshalb benötigt er mehr Breite.
            if (kijs.Navigator.isFirefox) {
                w += 7;
            }

            this._dom.width = w;
            this._dom.node.style.overflow = 'auto';
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

    _onNodeWheel(e) {
        this._preventHide = true;
    }

    _onTargetElInput(e) {
        if (this._openOnInput && !this.isRendered) {
            this.show();
        }
    }

    _onElKeyDown(e) {
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

            case kijs.keys.DOWN_ARROW:
                if (!this.isRendered) {
                    this.show();
                }
                break;

            default:
                if (kijs.isString(e.nodeEvent.key) && e.nodeEvent.key.length === 1) {
                    if (!this.isRendered) {
                        this.show();
                    }
                }
                break;
        }
    }


    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(superCall) {
        if (!superCall) {
            // unrender
            this.unrender(superCall);

            // Event auslösen.
            this.raiseEvent('destruct');
        }

        // Event-Listeners entfernen
        if (this._targetEl) {
            this._targetEl.off(null, null, this);
        }


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
        Object.assign(this._defaultConfig, {
            disableDrop: true,
            disableContextMenu: false
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            disableDrop: { target: 'disableDrop' },
            disableContextMenu: { target: 'disableContextMenu' }
        });

        // onResize überwachen
        kijs.Dom.addEventListener('resize', window, this._onWindowResize, this);

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }
    }

    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------

    set disableContextMenu(val) {
        if (val === true) {
            // Standardmässig öffnet der Browser das Kontextmenu
            kijs.Dom.addEventListener('contextmenu', document.body, function(e) {
                e.nodeEvent.preventDefault();
            }, this);

        } else if (val === false) {
            kijs.Dom.removeEventListener('contextmenu', document.body, this);

        } else {
           throw new kijs.Error('invalid value for property "disableContextMenu" in kijs.gui.ViewPort');
        }
    }

    get disableContextMenu() {
        return kijs.Dom.hasEventListener('contextmenu', document.body, this);
    }

    set disableDrop(val) {
        if (val === true) {
            // Standardmässig öffnet der Browser das Dokument, wenn
            // es über einer Webseite verschoben wird. Mittels preventDefault
            // wird sichergestellt, dass in diesem Fall nichts passiert.
            kijs.Dom.addEventListener('dragover', window, function(e) {
                e.nodeEvent.preventDefault();
            }, this);
            kijs.Dom.addEventListener('drop', window, function(e) {
                e.nodeEvent.preventDefault();
            }, this);

        } else if (val === false) {
            kijs.Dom.removeEventListener('dragover', window, this);
            kijs.Dom.removeEventListener('drop', window, this);

        } else {
           throw new kijs.Error('invalid value for property "disableDrop" in kijs.gui.ViewPort');
        }
    }

    get disableDrop() {
        return kijs.Dom.hasEventListener('dragover', window, this) && kijs.Dom.hasEventListener('drop', window, this);
    }

    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // overwrite
    render(superCall) {
        super.render(true);

        // innerDOM Rendern
        this._innerDom.render();
        this._dom.node.appendChild(this._innerDom.node);

        // elements im innerDOM rendern
        kijs.Array.each(this._elements, function(el) {
            el.renderTo(this._innerDom.node);
        }, this);

        // Event afterRender auslösen
        if (!superCall) {
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
    destruct(superCall) {
        if (!superCall) {
            // unrender
            this.unrender(superCall);

            // Event auslösen.
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
// kijs.gui.field.Field (Abstract)
// --------------------------------------------------------------
/**
 * EVENTS
 * ----------
 * // Geerbte Events
 * add
 * afterFirstRenderTo
 * afterRender
 * afterResize
 * beforeAdd
 * beforeRemove
 * changeVisibility
 * childElementAfterResize
 * dblClick
 * destruct
 * drag
 * dragEnd
 * dragLeave
 * dragOver
 * dragStart
 * drop
 * focus
 * mouseDown
 * mouseLeave
 * mouseMove
 * mouseUp
 * remove
 * wheel
 *
 * // key events
 * keyDown
 * enterPress
 * enterEscPress
 * escPress
 * spacePress
 */
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

        this._maxLength = null;
        this._required = false;
        this._submitValue = true;
        this._originalValue = null;

        this._dom.clsRemove('kijs-container');
        this._dom.clsAdd('kijs-field');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            isDirty: false
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            disabled: { target: 'disabled' },   // deaktiviert das Feld mit den Buttons (siehe auch readOnly)

            label: { target: 'html', context: this._labelDom },
            labelCls: { fn: 'function', target: this._labelDom.clsAdd, context: this._labelDom },
            labelHide: true,
            labelHtmlDisplayType: { target: 'htmlDisplayType', context: this._labelDom },
            labelStyle: { fn: 'assign', target: 'style', context: this._labelDom },
            labelWidth: { target: 'labelWidth' },
            value: { target: 'value', prio: 1000 },

            errorIcon: { target: 'errorIcon' },
            errorIconChar: { target: 'errorIconChar', context: this._errorIconEl },
            errorIconCls: { target: 'errorIconCls', context: this._errorIconEl },
            errorIconColor: { target: 'errorIconColor', context: this._errorIconEl },

            helpIcon: { target: 'helpIcon' },
            helpIconChar: { target: 'helpIconChar', context: this._helpIconEl },
            helpIconCls: { target: 'helpIconCls', context: this._helpIconEl },
            helpIconColor: { target: 'helpIconColor', context: this._helpIconEl },

            helpText: { target: 'helpText' },

            isDirty: { target: 'isDirty', prio: 1001 },

            maxLength: true,
            readOnly: { target: 'readOnly' },   // deaktiviert das Feld, die Buttons bleiben aber aktiv (siehe auch disabled)
            required: true,
            submitValue: true,

            spinIcon: { target: 'spinIcon' },
            spinIconChar: { target: 'iconChar', context: this._spinIconEl },
            spinIconCls: { target: 'iconCls', context: this._spinIconEl },
            spinIconColor: { target: 'iconColor', context: this._spinIconEl },
            spinIconVisible: { target: 'visible', context: this._spinIconEl }
        });

        // Listeners
        this._spinIconEl.on('click', this._onSpinButtonClick, this);

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
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

        if (this._spinBoxEl && 'disabled' in this._spinBoxEl) {
            this._spinBoxEl.disabled = val;
        }

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
            throw new kijs.Error(`config "errorIcon" is not valid.`);

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
            throw new kijs.Error(`config "helpIcon" is not valid.`);

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

    get isDirty() { return this._originalValue !== this.value; }
    set isDirty(val) {
        if (val) { // mark as dirty
            this._originalValue = this.value === null ? '' : null;

        } else { // mark as not dirty
            this._originalValue = this.value;
        }
    }

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
                this._labelDom.unrender();
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

    get required() { return this._required; }
    set required(val) { this._required = !!val; }

    /**
     * Berechnet die Höhe für die spinBox
     * @returns {Number}
     */
    get spinBoxHeight() {
        return this._inputWrapperDom.height;
    }

    /**
     * Berechnet die Breite für die spinBox
     * @returns {Number}
     */
    get spinBoxWidth() {
        let width = this._inputWrapperDom.width;
        if (this._spinIconEl.visible) {
            width += this._spinIconEl.width;
        }
        return width;
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
            throw new kijs.Error(`config "spinIcon" is not valid.`);

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
        }
    }

    // false, falls der Wert vom Feld nicht übermittelt werden soll.
    get submitValue() { return this._submitValue; }
    set submitValue(val) { this._submitValue = !!val; }

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
    render(superCall) {
        // dom mit elements rendern (innerDom)
        super.render(true);

        // Label rendern (kijs.guiDom)
        if (!this._labelHide) {
            this._labelDom.renderTo(this._dom.node, this._innerDom.node);
        } else {
            this._labelDom.unrender();
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
        if (!superCall) {
            this.raiseEvent('afterRender');
        }
    }

    /**
     * Setzt den Wert zurück.
     * @returns {undefined}
     */
    reset() {
        this.value = this._originalValue;
    }

    /**
     * Zeigt eine individuelle Fehlermeldung an. Wenn keine Meldung
     * übergeben wird, wird die Fehlermeldung zurückgesetzt.
     * Diese Methode hat keinen Einfluss auf die 'validate' Methode; ein
     * Formular kann trotz Fehlermeldung abgesendet werden.
     * @param msg {string|null} [msg] Anzuzeigende Nachricht
     * @returns {undefined}
     */
    markInvalid(msg=null) {
        this._errors = [];

        if (kijs.isString(msg) && msg) {
            this._errors.push(msg);
        }

        this._displayErrors();
    }


    // overwrite
    unrender(superCall) {
        // Event auslösen.
        if (!superCall) {
            this.raiseEvent('unrender');
        }

        this._labelDom.unrender();
        this._inputWrapperDom.unrender();
        if (this._spinBoxEl) {
            this._spinBoxEl.unrender();
        }
        this._spinIconEl.unrender();
        this._errorIconEl.unrender();
        this._helpIconEl.unrender();
        super.unrender(true);
    }

    /**
     * Validiert den Inhalt des Felds
     * @returns {Boolean}
     */
    validate() {
        this._errors = [];

        // Validierungen anwenden
        if (this.visible) {
            this._validationRules(this.value);
        }

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
     * @param {String} value
     * @returns {undefined}
     */
    _validationRules(value) {

        // Eingabe erforderlich
        if (this._required) {
            if (kijs.isEmpty(value)) {
                this._errors.push(kijs.getText('Dieses Feld darf nicht leer sein'));
            }
        }

        // Maximale Länge
        if (!kijs.isEmpty(this._maxLength)) {
            if (!kijs.isEmpty(value) && value.length > this._maxLength) {
                this._errors.push(kijs.getText('Dieses Feld darf maximal %1 Zeichen enthalten', '', this._maxLength));
            }
        }
    }


    // LISTENERS
    _onSpinButtonClick(e) {
        if (this.disabled || this.readOnly) {
             return;
        }
        if (this._spinBoxEl) {
            if (this._spinBoxEl.isRendered) {
                this._spinBoxEl.close();
            } else {
                this._spinBoxEl.show();
            }
        }
    }


    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(superCall) {
        if (!superCall) {
            // unrendern
            this.unrender(superCall);

            // Event auslösen.
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

        // Basisklasse entladen
        super.destruct(true);
    }
};

/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.grid.cell.Checkbox
// --------------------------------------------------------------
/**
 * EVENTS
 * ----------
 *
 */
kijs.gui.grid.cell.Checkbox = class kijs_gui_grid_cell_Checkbox extends kijs.gui.grid.cell.Cell {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        // value
        this._checked = false;
        this._disabled = false;

        // class
        this._dom.clsAdd('kijs-grid-cell-checkbox');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            disabled: {target: 'disabled'}
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }

        // Events
        this._dom.on('click', this._onClick, this);
    }

    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------

    // Overwrite
    get value() { return this._checked; }
    set value(val) { super.value = val; }

    get disabled() { return this._disabled; }
    set disabled(val) {
        if (val) {
            this._dom.clsAdd('kijs-disabled');
        } else {
            this._dom.clsRemove('kijs-disabled');
        }
        this._disabled = !!val;
    }

    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------

    /**
     * Setzt das value der Zelle.
     * @param {String} value
     * @param {Boolean} [silent=false] true, falls kein change-event ausgelöst werden soll.
     * @param {Boolean} [markDirty=true] false, falls der Eintrag nicht als geändert markiert werden soll.
     * @param {Boolean} [updateDataRow=true] false, falls die dataRow nicht aktualisiert werden soll.
     * @returns {undefined}
     */
    setValue(value, silent=false, markDirty=true, updateDataRow=true) {
        value = (value === true || value === 1 || value === '1');
        this._checked = value;
        return super.setValue(value, silent, markDirty, updateDataRow);
    }

    // Overwrite
    _getEditorArgs() {
        let eArgs = super._getEditorArgs();

        eArgs.hasTime = this._hasTime;
        eArgs.displayFormat = this._format;

        return eArgs;
    }

    /**
     * icon rendern
     * @param {String|Number} value
     * @returns {undefined}
     */
    _setDomHtml(value) {
        if (value === true || value === 1 || value === '1') {
            this._dom.html = String.fromCharCode(0xf046); // fa-check-square-o
        } else {
            this._dom.html = String.fromCharCode(0xf096); // fa-square-o
        }
    }


    _onClick() {
        if (this._disabled) {
            return;
        }

        let value = this.value;
        this.value = !(value === true || value === 1 || value === '1');
    }

    /**
     * overwrite
     * prevent edit
     */
    _onDblClick() {
        return;
    }
};
/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.grid.cell.Date
// --------------------------------------------------------------
/**
 * EVENTS
 * ----------
 *
 */
kijs.gui.grid.cell.Date = class kijs_gui_grid_cell_Date extends kijs.gui.grid.cell.Cell {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        // default xtype
        this._editorXType = 'kijs.gui.field.Date';
        this._hasTime = false;
        this._format = 'd.m.Y';

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            hasTime: true,
            format: true
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }
    }

    // Overwrite
    _getEditorArgs() {
        let eArgs = super._getEditorArgs();

        eArgs.hasTime = this._hasTime;
        eArgs.displayFormat = this._format;

        return eArgs;
    }

    /**
     * Zahl rendern
     * @param {String|Number} value
     * @returns {undefined}
     */
    _setDomHtml(value) {
        let date = kijs.Date.create(value);

        if (kijs.isDate(date)) {
            this._dom.html = kijs.Date.format(date, this._format);
        } else {
            this._dom.html = value;
        }
    }
};
/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.grid.cell.Icon
// --------------------------------------------------------------
/**
 * EVENTS
 * ----------
 *
 */
kijs.gui.grid.cell.Icon = class kijs_gui_grid_cell_Icon extends kijs.gui.grid.cell.Cell {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        this._iconCls = null;
        this._icon = null;
        this._originalIcon = null;
        this._iconColor = null;
        this._caption = null;

        //this._dom.nodeTagName = 'span';
        this._dom.clsAdd('kijs-icon');

        // class
        this.dom.clsAdd('kijs-grid-cell-icon');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            iconChar: true,   // Alias für html
            iconCls: { target: this._iconCls },
            iconColor: { target: 'iconColor' },
            iconCharField: true,
            iconClsField: true,
            iconColorField: true,
            caption: { target: 'caption' }
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }
    }

    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------

    get icon() { return this._icon; }

    get originalIcon() { return this._originalIcon; }

    set caption(val) { this._caption = val; }
    get caption() { return this._caption; }

    set iconColor(val) { this._dom.style.color = val; this._iconColor = val; }
    get iconColor() { return this._iconColor; }

    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------


    // Overwrite

     loadFromDataRow() {
        super.loadFromDataRow();

        if (this.row && this.row.dataRow && kijs.isDefined(this.row.dataRow[this.columnConfig.iconColorField])) {
           this._iconColor = this.row.dataRow[this.columnConfig.iconColorField];
           this._dom.style.color = this._iconColor;
        }

        let value = null;
        if (!value && this.row && this.row.dataRow && kijs.isDefined(this.row.dataRow[this.columnConfig.iconCharField])) {
           value = this.row.dataRow[this.columnConfig.iconCharField];
        } else if (!value && this.row && this.row.dataRow && kijs.isDefined(this.row.dataRow[this.columnConfig.iconClsField])) {
           value = this.row.dataRow[this.columnConfig.iconClsField];
        }
        this._caption = this.row.dataRow[this.columnConfig.valueField];
        this._setDomHtml(value);
    }

    /**
     * Icon rendern
     * @param {String|Number} value
     * @returns {undefined}
     */
    _setDomHtml(value) {
        this._originalIcon = value;

        if (kijs.isInteger(value)){
            value = String.fromCodePoint(value);

        } else if (kijs.isString(value)) {
            value = kijs.String.htmlentities_decode(value);
        }

        this._icon = value;
        this._dom.html = this._icon;
    }

    _iconCls(val) {
        if (kijs.isEmpty(val)) {
            val = null;
        }
        if (!kijs.isString && !val) {
            throw new kijs.Error(`config "iconCls" is not a string`);
        }
        if (this._iconCls) {
            this._dom.clsRemove(this._iconCls);
        }
        this._iconCls = val;
        if (this._iconCls) {
            this._dom.clsAdd(this._iconCls);
        }
    }
};

/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.grid.cell.Number
// --------------------------------------------------------------
/**
 * EVENTS
 * ----------
 *
 */
kijs.gui.grid.cell.Number = class kijs_gui_grid_cell_Number extends kijs.gui.grid.cell.Cell {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        // value
        this._numValue = null;

        // default xtype
        this._editorXType = 'kijs.gui.field.Number';

        // Nummer-Einstellungen
        this._decimalPrecision = null;
        this._decimalPoint = '.';
        this._decimalThousandSep = '\'';

        this._numberStyles = [];
        this._unitBefore = '';
        this._unitAfter = '';

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            cls: 'kijs-grid-cell-number'
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            decimalPrecision: true,
            decimalPoint: true,
            decimalThousandSep: true,
            numberStyles: {target: 'numberStyles'},
            unitBefore: true,
            unitAfter: true
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }
    }


    // --------------------------------------------------------------
    // GETTER/SETTER
    // --------------------------------------------------------------

    get numberStyles() { return this._numberStyles; }
    set numberStyles(val) {
        if (!kijs.isArray(val)) {
            val = [val];
        }
        this._numberStyles = val;
    }

    get value() { return this._numValue; }
    set value(val) { super.value = val; }

    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------

    // overwrite
    setValue(value, silent=false, markDirty=true, updateDataRow=true) {
        let num = parseFloat(value);
        if (kijs.isNumber(num)) {
            this._numValue = num;
        } else {
            this._numValue = value;
        }

        super.setValue(this._numValue, silent, markDirty, updateDataRow);
    }

    // PRIVATE
    // Overwrite
    _getEditorArgs() {
        let eArgs = super._getEditorArgs();

        eArgs.allowDecimals = this._decimalPrecision > 0;
        eArgs.alwaysDisplayDecimals = this._decimalPrecision > 0;
        eArgs.decimalPrecision = this._decimalPrecision;
        eArgs.decimalSeparator = this._decimalPoint;
        eArgs.thousandsSeparator = this._decimalThousandSep;

        return eArgs;
    }

    /**
     * Zahl rendern
     * @param {String|Number} value
     * @returns {undefined}
     */
    _setDomHtml(value) {
        let num = parseFloat(value);

        if (kijs.isNumber(num)) {
            this._dom.html = this._unitBefore + kijs.Number.format(num, this._decimalPrecision, this._decimalPoint, this._decimalThousandSep) + this._unitAfter;

            // styles anwenden
            let numberStyle = this._getNumberStyle(num);
            for (let styleKey in numberStyle) {
                this._dom.style[styleKey] = numberStyle[styleKey];
            }

        } else if (value) {
            this._dom.html = this._unitBefore + kijs.toString(value) + this._unitAfter;

        } else {
            this._dom.html = value;
        }
    }

    /**
     * Gibt den Style für eine Nummer zurück
     * @param {Number} number
     * @returns {Object}
     */
    _getNumberStyle(number) {
        let style = {};

        kijs.Array.each(this._numberStyles, function(numberStyle) {
            let from = kijs.isNumber(numberStyle.from) ? numberStyle.from : Number.MIN_VALUE,
                to = kijs.isNumber(numberStyle.to) ? numberStyle.to : Number.MAX_VALUE;

            if (number >= from && number <= to) {
                for (let key in numberStyle) {
                    if (key !== 'from' && key !== 'to') {
                        style[key] = numberStyle[key];
                    }
                }
            }
        }, this);

        return style;
    }
};
/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.grid.cell.Text
// --------------------------------------------------------------
/**
 * EVENTS
 * ----------
 *
 */
kijs.gui.grid.cell.Text = class kijs_gui_grid_cell_Text extends kijs.gui.grid.cell.Cell {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {

        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }
    }


};
/* global kijs */

// --------------------------------------------------------------
// kijs.gui.grid.filter.Checkbox
// --------------------------------------------------------------
/**
 * EVENTS
 * ----------
 *
 */
kijs.gui.grid.filter.Checkbox = class kijs_gui_grid_filter_Checkbox extends kijs.gui.grid.filter.Filter {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        this._checkedType = '';
        this._searchContainer.clsAdd('kijs-icon');
        this._compare = null;

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {

        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }
    }

    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------

    get filter() {
        return Object.assign(super.filter, {
            type: 'checkbox',
            checkbox: this._compare
        });
    }

    get isFiltered() { return this._compare !== null; }

    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------

    reset() {
        this._compare = '';
        super.reset();
    }

    _applyToGrid() {
        if (this._compare === 'checked') {
            this._searchContainer.html = String.fromCharCode(0xf046);
        } else if (this._compare === 'unchecked') {
            this._searchContainer.html = String.fromCharCode(0xf096);
        } else {
            this._searchContainer.html = '';
        }

        super._applyToGrid();
    }

    // overwrite
    _getMenuButtons() {
        return kijs.Array.concat(this._getDefaultMenuButtons(), ['-',{
            name: 'btn_compare_checked',
            caption : kijs.getText('Alle angewählten'),
            iconChar: '&#xf096', //  fa-square-o
            on: {
                click: this._onFilterChange,
                context: this
            }
        },{
            caption : kijs.getText('Alle nicht angewählten'),
            name: 'btn_compare_unchecked',
            iconChar: '&#xf096', // fa-square-o
            on: {
                click: this._onFilterChange,
                context: this
            }
        }]);
    }

    _onFilterChange(e) {
        if (e.element.name === 'btn_compare_checked') {
            this._compare = 'checked';
        } else if (e.element.name === 'btn_compare_unchecked') {
            this._compare = 'unchecked';
        }

        kijs.Array.each(e.element.parent.elements, function(element) {
            if (element.name === e.element.name) {
                element.iconChar = '&#xf046';
            } else if (kijs.Array.contains(['btn_compare_checked', 'btn_compare_unchecked'], element.name)) {
                element.iconChar = '&#xf096';
            }
        });

        this._applyToGrid();
    }
};
/* global kijs */

// --------------------------------------------------------------
// kijs.gui.grid.filter.Icon
// --------------------------------------------------------------
/**
 * EVENTS
 * ----------
 *
 */
kijs.gui.grid.filter.Icon = class kijs_gui_grid_filter_Icon extends kijs.gui.grid.filter.Filter {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        this._compare = 'begin'; // full, part
        this._searchField = new kijs.gui.field.Text({disabled: true});
        this._checkboxGroup = null;

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            //keine
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            //keine
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }
        
        this.parent.grid.on('afterLoad', this._onAfterLoad, this);
    }

    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------

    get filter() {
        return Object.assign(super.filter, {
            type: 'icon',
            icons: this._checkboxGroup ? this._checkboxGroup.value : null
        });
    }

    get isFiltered() { return this._checkboxGroup ? this._checkboxGroup.value ? true : false : false; }

    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------

    reset() {
        if (this._checkboxGroup) {
            this._checkboxGroup.checkedAll = true;
        }
        super.reset();
    }
    
    // Private
    _checkIcons() {
        let icons = [];
        let iconsCheck = [];
        let dataCnt = this._checkboxGroup ? this._checkboxGroup.data.length : 0;

        if (dataCnt <= this.columnConfig.iconsCnt) {

            // Alle Zeilen und Zellen vom Grid durchsuchen
            kijs.Array.each(this.parent.grid.rows, function(row) {
                    kijs.Array.each(row.cells, function(cell) {

                        // Überprüfen ob Zelle mit dem iconCharField übereinstimmt
                        if (cell.columnConfig.iconCharField === this.columnConfig.iconCharField){
                            let contains = false;

                            // Überprüfen ob Icon schon in einem der Arrays ist
                            if (icons.length > 0) {
                                kijs.Array.each(icons, function(value){
                                        if (value.id === cell.originalIcon && value.icon === cell.icon && value.color === cell.iconColor && value.caption === cell.caption){
                                            contains = true;
                                        }
                                }, this);
                            }
                            if (this._checkboxGroup && !contains){
                                kijs.Array.each(this._checkboxGroup.data, function(data){
                                    if (data.id === cell.originalIcon && data.icon === cell.icon && data.color === cell.iconColor  && data.caption === cell.caption){
                                        contains = true;
                                    }
                                }, this);
                            }

                            // Icon dem Filter hinzufügen
                            if (!contains){
                                icons.push({id:cell.originalIcon, icon: cell.icon, color: cell.iconColor, caption: cell.caption});
                                iconsCheck.push(cell.originalIcon);
                            }
                        }
                    }, this);
            }, this);
        }
        return [icons, iconsCheck, dataCnt];
    }
  
    // Events

    _onAfterLoad() {;
        let checkIcons = this._checkIcons();
        let icons = checkIcons[0];
        let iconsCheck = checkIcons[1];
        let dataCnt = checkIcons[2];

        // CheckboxGroup erstellen
        if (this._checkboxGroup === null && dataCnt + icons.length <= this.columnConfig.iconsCnt) {
            this._checkboxGroup = new kijs.gui.field.CheckboxGroup ({
                name: 'icons',
                valueField: 'id',
                iconCharField: 'icon',
                iconColorField: 'color',
                captionField: 'caption',
                data: icons,
                cls: 'kijs-filter-icon-checkboxgroup',
                checkedAll: true,
                on: {
                    change: this._onFilterChange,
                    context: this
                }
            });
            this._menuButton.add(['-', this._checkboxGroup]);
        
        } else if (this._checkboxGroup && icons.length > 0 ) {

            // Daten hinzufügen
            if (dataCnt + icons.length <= this.columnConfig.iconsCnt){
                this._checkboxGroup.addData(icons);
                this._checkboxGroup.checkedValues = iconsCheck;

            // CheckboxGroup entfernen
            } else {
                this._menuButton.remove(['-', this._checkboxGroup]);
                this._checkboxGroup = null;
            }
        }
    }
    
    _onFilterChange() {
       this._applyToGrid();
    }

    _onKeyDown(e) {
        e.nodeEvent.stopPropagation();
        if (e.nodeEvent.key === 'Enter') {
            e.nodeEvent.preventDefault();
            this._applyToGrid();
        }
    }


    // overwrite
    render(superCall) {
        super.render(true);

        this._searchField.renderTo(this._searchContainer.node);
        
        // Event afterRender auslösen
        if (!superCall) {
            this.raiseEvent('afterRender');
        }
    }
};

/* global kijs */

// --------------------------------------------------------------
// kijs.gui.grid.filter.Text
// --------------------------------------------------------------
/**
 * EVENTS
 * ----------
 *
 */
kijs.gui.grid.filter.Text = class kijs_gui_grid_filter_Text extends kijs.gui.grid.filter.Filter {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        this._compare = 'begin'; // full, part
        this._searchField = new kijs.gui.field.Text({
            on: {
                change: function() {
                    this._applyToGrid();
                },
                keyDown: this._onKeyDown,
                context: this
            }
        });

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            placeholder: kijs.getText('Suche') + '...'
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            placeholder: {target: 'placeholder'}
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }
    }

    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------

    get filter() {
        return Object.assign(super.filter, {
            type: 'text',
            search: this._searchField.value,
            compare: this._compare
        });
    }

    get isFiltered() { return this._searchField.value !== ''; }

    get placeholder() { return this._searchField.placeholder; }
    set placeholder(val) { this._searchField.placeholder = val; }

    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------

    reset() {
        this._searchField.value = '';
        super.reset();
    }

    // overwrite
    _getMenuButtons() {
        return kijs.Array.concat(this._getDefaultMenuButtons(), ['-',{
            name: 'btn_compare_begin',
            caption : kijs.getText('Feldanfang'),
            iconChar: '&#xf046', //  fa-check-square-o
            on: {
                click: this._onCompareBtnClick,
                context: this
            }
        },{
            caption : kijs.getText('Beliebiger Teil'),
            name: 'btn_compare_part',
            iconChar: '&#xf096', // fa-square-o
            on: {
                click: this._onCompareBtnClick,
                context: this
            }
        },{
            caption : kijs.getText('Ganzes Feld'),
            name: 'btn_compare_full',
            iconChar: '&#xf096', // fa-square-o
            on: {
                click: this._onCompareBtnClick,
                context: this
            }
        }]);
    }

    _onCompareBtnClick(e) {
        this._menuButton.menuCloseAll();

        if (e.element.name === 'btn_compare_begin') {
            this._compare = 'begin';
        } else if (e.element.name === 'btn_compare_part') {
            this._compare = 'part';
        } else if (e.element.name === 'btn_compare_full') {
            this._compare = 'full';
        }

        kijs.Array.each(e.element.parent.elements, function(element) {
            if (element.name === e.element.name) {
                element.iconChar = '&#xf046';
            } else if (kijs.Array.contains(['btn_compare_begin', 'btn_compare_part', 'btn_compare_full'], element.name)) {
                element.iconChar = '&#xf096';
            }
        });
    }

    _onKeyDown(e) {
        e.nodeEvent.stopPropagation();
        if (e.nodeEvent.key === 'Enter') {
            e.nodeEvent.preventDefault();
            this._applyToGrid();
        }
    }


    // overwrite
    render(superCall) {
        super.render(true);

        this._searchField.renderTo(this._searchContainer.node);

        // Event afterRender auslösen
        if (!superCall) {
            this.raiseEvent('afterRender');
        }
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
        super(false);

        this._data = {};
        this._facadeFnLoad = null;  // Name der Facade-Funktion. Bsp: 'address.load'
        this._facadeFnSave = null;  // Name der Facade-Funktion. Bsp: 'address.save'
        this._fields = null;        // Array mit kijs.gui.field.Fields-Elementen
        this._rpc = null;           // Instanz von kijs.gui.Rpc
        this._rpcArgs = {};         // Standard RPC-Argumente
        this._errorMsg = kijs.getText('Es wurden noch nicht alle Felder richtig ausgefüllt') + '.';

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            autoLoad: { target: 'autoLoad' },   // Soll nach dem ersten Rendern automatisch die Load-Funktion aufgerufen werden?
            data: { target: 'data', prio: 2000}, // Recordset-Row-Objekt {id:1, caption:'Wert 1'}
            errorMsg: true,                     // Meldung, wenn nicht ausgefüllte Felder vorhanden sind. null wenn keine Meldung.
            facadeFnLoad: true,
            facadeFnSave: true,
            rpc: { target: 'rpc' },
            rpcArgs: true
        });

        // Listeners auf Kindelemente
        this.on('add', this._observChilds, this);

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
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

        if (kijs.isEmpty(this._fields)) {
            this.searchFields();
        }

        // Evtl. Daten aus Formular holen
        if (!kijs.isEmpty(this._fields)) {
            kijs.Array.each(this._fields, function(field) {
                if (field.submitValue !== false) {
                    data[field.name] = field.value;
                } else {
                    // Wert soll nicht übermittelt werden.
                    delete this._data[field.name];
                }
            }, this);
        }
        // Bestehendes Recordset mit Daten aus Formular ergänzen
        Object.assign(this._data, data);
        return this._data;
    }
    set data(val) {
        this._data = val;

        if (this._fields === null) {
            this.searchFields();
        }

        // Evtl. Daten in Formular einfüllen
        if (!kijs.isEmpty(this._fields)) {
            kijs.Array.each(this._fields, function(field) {
                if (field.name in this._data) {
                    field.value = this._data[field.name];
                    field.isDirty = false;
                }
            }, this);
        }
    }

    get disabled() {
        if (kijs.isEmpty(this.fields)){
            this.searchFields();
        }

        let fieldCnt = 0, disabledCnt = 0;
        kijs.Array.each(this.fields, function(element) {
            if (element instanceof kijs.gui.field.Field) {
                fieldCnt++;
                if (element.disabled) {
                    disabledCnt++;
                }
            }
        }, this);
        return disabledCnt > (fieldCnt/2);
    }

    set disabled(value) {
        if (kijs.isEmpty(this.fields)){
            this.searchFields();
        }

        kijs.Array.each(this.fields, function(element) {
            if (element instanceof kijs.gui.field.Field) {
                element.disabled = !!value;
            }
        }, this);
    }

    get fields() {
        if (kijs.isEmpty(this._fields)) {
            this.searchFields();
        }

        return this._fields;
    }

    get facadeFnLoad() { return this._facadeFnLoad; }
    set facadeFnLoad(val) { this._facadeFnLoad = val; }

    get facadeFnSave() { return this._facadeFnSave; }
    set facadeFnSave(val) { this._facadeFnSave = val; }

    get isDirty() {
        if (kijs.isEmpty(this._fields)) {
            this.searchFields();
        }

        for (let i = 0; i < this._fields.length; i++) {
            if (this._fields[i].isDirty) {
                return true;
            }
        }

        return false;
    }

    set isDirty(val) {
        if (kijs.isEmpty(this._fields)) {
            this.searchFields();
        }

        for (let i=0; i<this._fields.length; i++) {
            this._fields[i].isDirty = !!val;
        }
    }

    get isEmpty() {
        let empty = true;

        if (kijs.isEmpty(this._fields)) {
            this.searchFields();
        }

        for (let i = 0; i < this._fields.length; i++) {
            if (!this._fields[i].isEmpty) {
                empty = false;
            }
        }

        return empty;
    }

    get readOnly(){
        if (kijs.isEmpty(this.fields)){
            this.searchFields();
        }

        let readOnly = 0;
        kijs.Array.each(this.fields, function(element) {
            if (element instanceof kijs.gui.field.Field) {
                if (element.readOnly){
                    readOnly ++;
                }
            }
        }, this);
        if (readOnly > (this.fields.length / 2)){
            return true;
        } else {
            return false;
        }
    }

    set readOnly(value){
        if (kijs.isEmpty(this.fields)){
            this.searchFields();
        }

        kijs.Array.each(this.fields, function(element) {
            if (element instanceof kijs.gui.field.Field) {
                element.readOnly = value;
            }
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
            throw new kijs.Error(`Unkown format on config "rpc"`);

        }
    }


    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------

    /**
     * Löscht allen inhalt aus dem Formular
     * @returns {undefined}
     */
    clear() {
        if (kijs.isEmpty(this._fields)) {
            this.searchFields();
        }

        for (let i = 0; i < this._fields.length; i++) {
            if (this._fields[i].xtype !== 'kijs.gui.field.Display') {
                this._fields[i].value = null;
            }
        }

        this._data = {};

        this.resetValidation();
    }

    /**
     * Lädt das Formular mit Daten vom Server
     * @param {Object|null} args
     * @param {Boolean} [searchFields=false] Sollen die Formularfelder neu gesucht werden?
     * @param {Boolean} [resetValidation=false] Sollen die Formularfelder als invalid markiert werden?
     * @returns {Promise}
     */
    load(args=null, searchFields=false, resetValidation=false) {
        return new Promise((resolve, reject) => {
            if (this._facadeFnLoad) {

                if (!kijs.isObject(args)) {
                    args = {};
                }
                args = Object.assign(args, this._rpcArgs);

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

                    // Validierung zurücksetzen?
                    if (resetValidation) {
                        this.resetValidation();
                    }

                    // 'Dirty' zurücksetzen
                    this.isDirty = false;

                    // load event
                    this.raiseEvent('afterLoad', {response: response});

                    // promise ausführen
                    resolve(response);
                }, this, true, this, 'dom', false, this._onRpcBeforeMessages);
            }
        });
    }

    /**
     * Setzt den Feldwert zurück.
     * @returns {undefined}
     */
    reset() {
        if (kijs.isEmpty(this._fields)) {
            this.searchFields();
        }

        for (let i=0; i<this._fields.length; i++) {
            this._fields[i].reset();
        }

        this.raiseEvent('change');
    }

    /**
     * Setzt die Validierung zurück.
     * @returns {undefined}
     */
    resetValidation() {
        if (kijs.isEmpty(this._fields)) {
            this.searchFields();
        }

        for (let i=0; i<this._fields.length; i++) {
            if (kijs.isFunction(this._fields[i].markInvalid)) {
                this._fields[i].markInvalid();
            }
        }
    }

    /**
     * Sendet die Formulardaten an den Server
     * @param {Boolean} [searchFields=false] Sollen die Formularfelder neu gesucht werden?
     * @param {Object|null} [args=null] Argumente für den RPC
     * @returns {Promise}
     */
    save(searchFields=false, args=null) {
        return new Promise((resolve, reject) => {
            if (!kijs.isObject(args)) {
                args = {};
            }

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

                    // 'dirty' zurücksetzen
                    this.isDirty = false;

                    // event
                    this.raiseEvent('afterSave', {response: response});
                    resolve(response);

                }, this, false, this, 'dom', false, this._onRpcBeforeMessages);
            } else {
                kijs.gui.MsgBox.error(kijs.getText('Fehler'), kijs.getText('Es wurden noch nicht alle Felder richtig ausgefüllt') + '.');
            }
        });
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

        if (kijs.isEmpty(this._fields)) {
            this.searchFields();
        }

        for (let i=0; i<this._fields.length; i++) {
            if (!this._fields[i].validate()) {
                ret = false;
            }
        }

        return ret;
    }

    // PROTECTED

    /**
     * Fügt für alle Unterelemente listeners hinzu.
     */
    _observChilds() {
        kijs.Array.each(this.getElements(), function(el) {
            if (el instanceof kijs.gui.Container && !(el instanceof kijs.gui.field.Field)) {
                if (!el.hasListener('add', this._onChildAdd, this)) {
                    el.on('add', this._onChildAdd, this);
                }

            } else if (el instanceof kijs.gui.field.Field) {
                if (!el.hasListener('change', this._onChildChange, this)) {
                    el.on('change', this._onChildChange, this);
                }
            }
        }, this);
    }

    // EVENTS
    /**
     * callback-fnBeforeMessages, die eventuelle Fehler direkt im Formular anzeigt
     * @param {Object} response
     * @returns {undefined}
     */
    _onRpcBeforeMessages(response) {
        if (response.responseData && !kijs.isEmpty(response.responseData.fieldErrors)) {
            // Fehler bei den entsprechenden Feldern anzeigen
            if (!kijs.isEmpty(this._fields)) {
                kijs.Array.each(this._fields, function(field) {
                    if (response.responseData.fieldErrors[field.name]) {
                        field.addValidateErrors(response.responseData.fieldErrors[field.name]);
                    }
                }, this);
            }

            if (kijs.isEmpty(response.errorMsg) && !kijs.isEmpty(this._errorMsg)) {
                response.errorMsg = this._errorMsg;
            }
        }
    }

    _onAfterFirstRenderTo(e) {
        this.load();
    }


    _onChildAdd() {
        this._observChilds();
    }

    _onChildChange(e) {
        this.raiseEvent('change', e);
    }


    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(superCall) {
        if (!superCall) {
            // unrender
            this.unrender(superCall);

            // Event auslösen.
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
/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.ListView
// --------------------------------------------------------------
kijs.gui.ListView = class kijs_gui_ListView extends kijs.gui.DataView {


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
        this._toolTipField = null;
        this._showCheckBoxes = false;
        this._value = null;
        this._ddSort = false;

        this._dom.clsRemove('kijs-dataview');
        this._dom.clsAdd('kijs-listview');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            selectType: 'single'
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            captionField: true,
            iconCharField: true,
            iconClsField: true,
            iconColorField: true,
            showCheckBoxes: true,
            toolTipField: true,
            valueField: true,
            ddSort: true,

            value: { target: 'value' }
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }

        this.applyConfig(config);

        // Events
        this.on('afterLoad', this._onAfterLoad, this);
    }


    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get captionField() { return this._captionField; }
    set captionField(val) { this._captionField = val; }

    get ddSort() { return this._ddSort; }
    set ddSort(val) { this._ddSort = !!val; }

    get iconCharField() { return this._iconCharField; }
    set iconCharField(val) { this._iconCharField = val; }

    get iconClsField() { return this._iconClsField; }
    set iconClsField(val) { this._iconClsField = val; }

    get iconColorField() { return this._iconColorField; }
    set iconColorField(val) { this._iconColorField = val; }

    get showCheckBoxes() { return this._showCheckBoxes; }
    set showCheckBoxes(val) { this._showCheckBoxes = val; }

    get toolTipField() { return this._toolTipField; }
    set toolTipField(val) { this._toolTipField = val; }

    get valueField() { return this._valueField; }
    set valueField(val) { this._valueField = val; }

    get value() {
        let val = null;

        if (this._valueField) {
            let selElements = this.getSelected();
            if (kijs.isArray(selElements)) {
                val = [];
                kijs.Array.each(selElements, function(el) {
                    val.push(el.dataRow[this._valueField]);
                }, this);
            } else if (!kijs.isEmpty(selElements)) {
                val = selElements.dataRow[this._valueField];
            }
        }

        return val;
    }
    set value(val) {
        if (kijs.isEmpty(this._valueField)) {
            throw new kijs.Error(`Es wurde kein "valueField" definiert.`);
        }

        this._value = val;

        let filters = [];

        if (kijs.isArray(val)) {
            kijs.Array.each(val, function(v) {
                filters.push({
                    field: this._valueField,
                    value: v
                });
            }, this);
        } else if (!kijs.isEmpty(val)) {
            filters = {
                field: this._valueField,
                value: val
            };
        }
        this.selectByFilters(filters, false, true);
    }


    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // overwrite
    createElement(dataRow, index) {
        let html = '';

        // Icon/Color
        html += '<span class="kijs-icon';
        if (!kijs.isEmpty(this._iconClsField) && !kijs.isEmpty(dataRow[this._iconClsField])) {
            html += ' ' + dataRow[this._iconClsField];
        }
        html += '"';

        if (!kijs.isEmpty(this._iconColorField) && !kijs.isEmpty(dataRow[this._iconColorField])) {
            html += ' style="color:' + dataRow[this._iconColorField] + '"';
        }
        html += '>';
        if (!kijs.isEmpty(this._iconCharField) && !kijs.isEmpty(dataRow[this._iconCharField])) {
            html += dataRow[this._iconCharField];
        }
        html += '</span>';

        // Caption
        html += '<span class="kijs-caption">';
        if (!kijs.isEmpty(this._captionField) && !kijs.isEmpty(dataRow[this._captionField])) {
            html += dataRow[this._captionField];
        }
        html += '</span>';

        // ToolTip
        let toolTip = '';
        if (!kijs.isEmpty(this._toolTipField) && !kijs.isEmpty(dataRow[this._toolTipField])) {
            toolTip = dataRow[this._toolTipField];
        }

        // Checkbox
        let cls = '';
        if (this._showCheckBoxes) {
            switch (this._selectType) {
                case 'single':
                    cls = 'kijs-display-options';
                    break;

                case 'simple':
                case 'multi':
                    cls = 'kijs-display-checkboxes';
                    break;

            }
        }

        let dve = new kijs.gui.DataViewElement({
            dataRow: dataRow,
            html: html,
            toolTip: toolTip,
            cls: cls
        });

        // Drag-Drop Events setzen
        kijs.DragDrop.addDragEvents(dve, dve.dom);
        kijs.DragDrop.addDropEvents(dve, dve.dom);

        dve.on('ddOver', this._onDdOver, this);
        dve.on('ddDrop', this._onDdDrop, this);

        return dve;
    }

    // LISTENERS
    _onAfterLoad(e) {
        if (!kijs.isEmpty(this._value)) {
            this.value = this._value;
        }
    }

    _onDdDrop(e) {
        let tIndex = this._elements.indexOf(e.targetElement);
        let sIndex = this._elements.indexOf(e.sourceElement);
        let pos = e.position.position;

        if (this.raiseEvent('ddDrop', e) === false) {
            return;
        }

        if (this._ddSort && tIndex !== -1 && sIndex !== -1 && tIndex !== sIndex && (pos === 'above' || pos === 'below')) {
            if (pos === 'below') {
                tIndex += 1;
            }

            // Element im Array an richtige Position schieben
            kijs.Array.move(this._elements, sIndex, tIndex);

            if (this.isRendered) {
                this.render();
            }

        }
    }

    _onDdOver(e) {
        if (!this._ddSort || this._elements.indexOf(e.sourceElement) === -1 || this.raiseEvent('ddOver', e) === false) {
            // fremdes Element, kein Drop.
            e.position.allowAbove = false;
            e.position.allowBelow = false;
            e.position.allowLeft = false;
            e.position.allowOnto = false;
            e.position.allowRight = false;

        } else {
            // erlaubte Positionen (ober-, unterhalb)
            e.position.allowAbove = true;
            e.position.allowBelow = true;
            e.position.allowLeft = false;
            e.position.allowOnto = false;
            e.position.allowRight = false;
        }
    }




    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(superCall) {
        if (!superCall) {
            // unrender
            this.unrender(superCall);

            // Event auslösen.
            this.raiseEvent('destruct');
        }

        // Variablen (Objekte/Arrays) leeren
        this._value = null;

        // Basisklasse entladen
        super.destruct(true);
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
        super(false);

        this._resizeDeferHandle = null;   // intern
        this._dragInitialPos = null;      // intern

        this._modalMaskEl = null;

        this._draggable = false;
        //this._focusDelay = 300;    // Delay zwischen dem rendern und dem setzen vom Fokus
        this._resizeDelay = 300;    // min. Delay zwischen zwei Resize-Events

        this._targetX = null;           // Zielelement (kijs.gui.Element) oder Body (HTMLElement)
        this._targetDomProperty = 'dom'; // Dom-Eigenschaft im Zielelement (String) (Spielt bei Body als target keine Rolle)

        this._dom.clsAdd('kijs-window');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            draggable: true,
            target: document.body,

            // defaults overwrite kijs.gui.Panel
            closable: true,
            maximizable: true,
            resizable: true,
            shadow: true
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            draggable: { target: 'draggable' },
            //focusDelay: true,
            modal: { target: 'modal' },     // Soll das Fenster modal geöffnet werden (alles Andere wird mit einer halbtransparenten Maske verdeckt)?
            resizeDelay: true,
            target: { target: 'target' },
            targetDomProperty: true
        });

        // Listeners
        this.on('mouseDown', this._onMouseDown, this);

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
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

    //get focusDelay() { return this._focusDelay; }
    //set focusDelay(val) { this._focusDelay = val; }

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
            throw new kijs.Error(`Unkown format on config "target"`);

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
    }

    toFront() {
        if (this._dom.node && this._dom.node.parentNode &&
                (!this.resizer || (this.resizer && !this.resizer.domOverlay))) {
            new kijs.gui.LayerManager().setActive(this);
        }
    }


    // overwrite
    unrender(superCall) {
        // Event auslösen.
        if (!superCall) {
            this.raiseEvent('unrender');
        }

        // Elemente/DOM-Objekte entladen
        if (this._modalMaskEl) {
            this._modalMaskEl.unrender();
        }

        super.unrender(true);
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
    destruct(superCall) {
        if (!superCall) {
            // unrender
            this.unrender();

            // Event auslösen.
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
/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.field.Checkbox
// --------------------------------------------------------------
/**
 * EVENTS
 * ----------
 * // Geerbte Events
 * add
 * afterFirstRenderTo
 * afterRender
 * afterResize
 * beforeAdd
 * beforeRemove
 * changeVisibility
 * childElementAfterResize
 * dblClick
 * destruct
 * drag
 * dragEnd
 * dragLeave
 * dragOver
 * dragStart
 * drop
 * focus
 * mouseDown
 * mouseLeave
 * mouseMove
 * mouseUp
 * remove
 * wheel
 *
 * // key events
 * keyDown
 * enterPress
 * enterEscPress
 * escPress
 * spacePress
 */
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
            config = Object.assign({}, this._defaultConfig, config);
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
                this._captionDom.unrender();
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
            throw new kijs.Error(`config "checked" is not valid.`);
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
            throw new kijs.Error(`config "icon" is not valid.`);

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
    
    get inputWrapperDom() { return this._inputWrapperDom; }

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
        if (val === this._valueUnchecked || val === false || val === 0 || val === '0') {
            this._checked = 0;
        } else if (val === this._valueChecked || val === true || val === 1 || val === '1') {
            this._checked = 1;
        } else if (val === this._valueDeterminated ||val === 2) {
            this._checked = 2;
        } else if (val === null) {
            this._checked = 0;
        } else {
            throw new kijs.Error(`config "value" is not valid.`);
        }
        this._updateCheckboxIcon();
        this.validate();
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
    render(superCall) {
        super.render(true);

        // Checkbox rendern (kijs.guiDom)
        this._checkboxIconEl.renderTo(this._inputWrapperDom.node);
        this._updateCheckboxIcon();

        // Span icon rendern (kijs.gui.Icon)
        if (!this._iconEl.isEmpty) {
            this._iconEl.renderTo(this._inputWrapperDom.node);
        } else {
            this._iconEl.unrender();
        }

        // Span caption rendern (kijs.guiDom)
        if (!this._captionHide) {
            this._captionDom.renderTo(this._inputWrapperDom.node);
        } else {
            this._captionDom.unrender();
        }

        // Event afterRender auslösen
        if (!superCall) {
            this.raiseEvent('afterRender');
        }
    }

    // overwrite
    unrender(superCall) {
        // Event auslösen.
        if (!superCall) {
            this.raiseEvent('unrender');
        }

        this._checkboxIconEl.unrender();
        this._iconEl.unrender();
        this._captionDom.unrender();
        super.unrender(true);
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

            this.raiseEvent(['input', 'change'], { oldChecked: oldChecked, checked: this._checked, oldValue: oldValue, value: this.value } );
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

            this.raiseEvent(['input', 'change'], { oldChecked: oldChecked, checked: this._checked, oldValue: oldValue, value: this.value } );
        }
        // Bildlauf der Space-Taste verhindern
        e.nodeEvent.preventDefault();
    }


    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(superCall) {
        if (!superCall) {
            // unrender
            this.unrender(superCall);

            // Event auslösen.
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
// kijs.gui.field.Combo
// --------------------------------------------------------------
kijs.gui.field.Combo = class kijs_gui_field_Combo extends kijs.gui.field.Field {

    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        this._minChars = null;
        this._minSelectCount = null;
        this._maxSelectCount = null;
        this._caption = null;
        this._oldCaption = null;
        this._oldValue = null;
        this._value = '';
        this._keyUpDefer = null;
        this._remoteSort = false;
        this._forceSelection = true;
        this._firstLoaded = false;
        this._showPlaceholder = true;
        this._selectFirst = false;

        this._inputDom = new kijs.gui.Dom({
            disableEscBubbeling: true,
            nodeTagName: 'input',
            nodeAttribute: {
                id: this._inputId
            }
        });

        this._listViewEl = new kijs.gui.ListView({
            cls: 'kijs-field-combo',
            autoLoad: false,
            focusable: false
        });

        this._spinBoxEl = new kijs.gui.SpinBox({
            target: this,
            targetDomProperty: 'inputWrapperDom',
            ownerNodes: [this._inputWrapperDom, this._spinIconEl.dom],
            openOnInput: true,
            elements: [
                this._listViewEl
            ],
            style: {
                maxHeight: '400px'
            }
        });

        this._dom.clsAdd('kijs-field-combo');


        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            spinIconVisible: true,
            minChars: 'auto',
            valueField: 'value',
            captionField: 'caption'
        });

       // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            autoLoad: { target: 'autoLoad' },
            remoteSort: true,
            showPlaceholder: true,
            forceSelection: true,
            selectFirst: true,

            showCheckBoxes: { target: 'showCheckBoxes', context: this._listViewEl },
            selectType: { target: 'selectType', context: this._listViewEl },

            facadeFnLoad: { target: 'facadeFnLoad', context: this._listViewEl },
            facadeFnArgs: { target: 'facadeFnArgs', context: this._listViewEl },
            rpc: { target: 'rpc', context: this._listViewEl },

            minChars: { target: 'minChars', prio: 2},

            captionField: { target: 'captionField', context: this._listViewEl },
            iconCharField: { target: 'iconCharField', context: this._listViewEl },
            iconClsField: { target: 'iconClsField', context: this._listViewEl },
            iconColorField: { target: 'iconColorField', context: this._listViewEl },
            toolTipField: { target: 'toolTipField', context: this._listViewEl },
            valueField: { target: 'valueField', context: this._listViewEl },

            minSelectCount: true,
            maxSelectCount: true,

            data: { prio: 1000, target: 'data' },
            value: { prio: 1001, target: 'value' }
        });

        // Event-Weiterleitungen von this._inputDom
        this._eventForwardsAdd('input', this._inputDom);
        this._eventForwardsAdd('blur', this._inputDom);
        this._eventForwardsAdd('keyDown', this._inputDom);
        this._eventForwardsAdd('afterLoad', this._listViewEl);

//        this._eventForwardsRemove('enterPress', this._dom);
//        this._eventForwardsRemove('enterEscPress', this._dom);
//        this._eventForwardsRemove('escPress', this._dom);
//        this._eventForwardsAdd('enterPress', this._inputDom);
//        this._eventForwardsAdd('enterEscPress', this._inputDom);
//        this._eventForwardsAdd('escPress', this._inputDom);



        // Listeners
        //this.on('input', this._onInput, this);
        this._inputDom.on('keyUp', this._onInputKeyUp, this);
        this._inputDom.on('keyDown', this._onInputKeyDown, this);
        this._inputDom.on('change', this._onInputChange, this);
        this._spinBoxEl.on('click', this._onSpinBoxClick, this);
        this._listViewEl.on('click', this._onListViewClick, this);
        this._listViewEl.on('afterLoad', this._onListViewAfterLoad, this);
        this._spinBoxEl.on('show', this._onSpinBoxShow, this);
        //this._listViewEl.on('selectionChange', this._onListViewSelectionChange, this);

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
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

    get captionField() { return this._listViewEl.captionField; }
    set captionField(val) { this._listViewEl.captionField = val; }

    get valueField() { return this._listViewEl.valueField; }
    set valueField(val) { this._listViewEl.valueField = val; }

    // overwrite
    set data(val) {
        this._listViewEl.data = val;
        if (this._selectFirst) {
            this.value = this._listViewEl.data[0].value;
        }
    }

    // overwrite
    get disabled() { return super.disabled; }
    set disabled(val) {
        super.disabled = !!val;
        if (val) {
            this._inputDom.nodeAttributeSet('disabled', true);
        } else {
            this._inputDom.nodeAttributeSet('disabled', false);
        }

        this._listViewEl.disabled = !!val;
    }

    get facadeFnArgs() { return this._listViewEl.facadeFnArgs; }
    set facadeFnArgs(val) { this._listViewEl.facadeFnArgs = val; }

    get facadeFnLoad() { return this._listViewEl.facadeFnLoad; }
    set facadeFnLoad(val) { this._listViewEl.facadeFnLoad = val; }

    get inputDom() { return this._inputDom; }

    get minChars() { return this._minChars; }
    set minChars(val) {
        if (val === 'auto') {
            // remote combo
            if (this._listViewEl.facadeFnLoad) {
                this._minChars = 4;

            // local combo
            } else {
                this._minChars = 0;
            }
        } else if (kijs.isInteger(val) && val > 0) {
            this._minChars = val;

        } else {
            throw new kijs.Error(`invalid argument for parameter minChars in kijs.gui.field.Combo`);
        }
    }

    // overwrite
    get isEmpty() { return kijs.isEmpty(this.value); }

    // overwrite
    get readOnly() { return super.readOnly; }
    set readOnly(val) {
        super.readOnly = !!val;
        this._listViewEl.disabled = !!val;
        if (val) {
            this._inputDom.nodeAttributeSet('readOnly', true);
        } else {
            this._inputDom.nodeAttributeSet('readOnly', false);
        }
    }

    get rpc() { return this._listViewEl.rpc; }
    set rpc(val) { this._listViewEl.rpc = val; }

    // overwrite
    get value() { return this._value; }
    set value(val) {
        let valueIsInStore = val === '' || val === null || this._isValueInStore(val);
        this._oldCaption = this._caption;
        this._oldValue = this._value;
        this._caption  = this._getCaptionFromValue(val);
        this._value = val;
        this._listViewEl.value = val;

        // falls das value nicht im store ist, vom server laden
        if (this._remoteSort) {
            if (!valueIsInStore && this._firstLoaded) {
                this.load(null, true);
            }
            // store leeren, wenn value gelöscht wird.
            if (this._value === '' || this._value === null) {
//                this._listViewEl.data = [];
            }
        }

        this._inputDom.nodeAttributeSet('value', this._caption);
    }

    get oldValue() { return this._oldValue; }


    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    /**
     * Füllt das Combo mit Daten vom Server
     * @param {Array} args Array mit Argumenten, die an die Facade übergeben werden
     * @param {Boolean} forceLoad true, wenn immer geladen werden soll
     * @param {String} query Suchstring
     * @returns {undefined}
     */
    load(args=null, forceLoad=false, query=null) {
        args = kijs.isObject(args) ? args : {};
        args.remoteSort = !!this._remoteSort;

        // Flag setzen
        this._firstLoaded = true;

        if (this._remoteSort) {
            args.query = kijs.toString(query);
            args.value = this.value;

            // Wenn eine Eingabe erfolgt, oder bei forceLoad, laden
            if (forceLoad || args.query.length >= this._minChars) {
                this._listViewEl.load(args).then(() => {

                    // Nach dem Laden das value neu setzen,
                    // damit das Label erscheint
                    if (query === null && this._isValueInStore(this.value)) {
                        this.value = this._value;
                    }
                });

            } else {
                this._listViewEl.data = [];
                this._addPlaceholder(kijs.getText('Schreiben Sie mindestens %1 Zeichen, um die Suche zu starten', '', this._minChars) + '.');
            }

        } else {

            // alle Datensätze laden
            this._listViewEl.load(args);
        }
    }

    // overwrite
    render(superCall) {
        super.render(true);

        // Input rendern (kijs.guiDom)
        this._inputDom.renderTo(this._inputWrapperDom.node);

        // Event afterRender auslösen
        if (!superCall) {
            this.raiseEvent('afterRender');
        }
    }


    // overwrite
    unrender(superCall) {
        // Event auslösen.
        if (!superCall) {
            this.raiseEvent('unrender');
        }

        this._inputDom.unrender();
        super.unrender(true);
    }


    // PROTECTED
    /**
     * Fügt dem listView einen Platzhalter hinzu.
     * @param {String} text Nachricht, die angezeigt wird.
     */
    _addPlaceholder(text) {
        if (this._showPlaceholder) {

            if (this._listViewEl.down('kijs-gui-field-combo-placeholder')) {
                this._listViewEl.down('kijs-gui-field-combo-placeholder').html = text;

            } else {
                this._listViewEl.add({
                    xtype: 'kijs.gui.Container',
                    name: 'kijs-gui-field-combo-placeholder',
                    cls: 'kijs-placeholder',
                    html: text,
                    htmlDisplayType: 'code'
                });
            }
        }
    }

    /**
     * Caption zu einem Value ermitteln
     * @param {String|Number|null} val
     * @returns {String}
     */
    _getCaptionFromValue(val) {
        let found = false;
        let caption = null;
        kijs.Array.each(this._listViewEl.data, function(row) {
            if (row[this.valueField] === val) {
                found = true;
                caption = row[this.captionField];
                return false;
            }
        }, this);

        // Falls kein Datensatz existiert, zeigen wir halt den value an
        if (!found) {
            caption = val;
        }

        return kijs.toString(caption);
    }

    /**
     * Prüft, ob ein value im Store ist.
     * @param {String|Number|null} val
     * @returns {Boolean}
     */
    _isValueInStore(val) {
        let found = false;

        kijs.Array.each(this._listViewEl.data, function(row) {
            if (row[this.valueField] === val) {
                found = true;
                return false;
            }
        }, this);

        return found;
    }

    /**
     * Schreibt einen Vorschlag ins Textfeld.
     * Funktion wird vom KeyDown verzögert ausgeführt.
     * @param {String} key
     * @returns {undefined}
     */
    _setProposal(key) {
        let inputVal = this._inputDom.nodeAttributeGet('value'), matchVal='';
        inputVal = kijs.toString(inputVal).trim();

        // Exakten Wert suchen
        if (inputVal && key !== 'Backspace' && key !== 'Delete') {
            kijs.Array.each(this._listViewEl.data, function(row) {
                if (kijs.isString(row[this.captionField]) && row[this.captionField].toLowerCase() === inputVal.toLowerCase()) {
                    matchVal = row[this.captionField];
                    return false;
                }
            }, this);

            // Selber Beginn suchen
            if (matchVal === '') {
                kijs.Array.each(this._listViewEl.data, function(row) {
                    let caption = row[this.captionField];

                    if (kijs.isString(row[this.captionField])
                            && inputVal.length <= caption.length
                            && caption.substr(0, inputVal.length).toLowerCase() === inputVal.toLowerCase()) {
                        matchVal = row[this.captionField];
                        return false;
                    }
                }, this);
            }

            // Es wurde eine Übereinstimmung gefunden
            if (matchVal) {
                this._inputDom.nodeAttributeSet('value', matchVal);

                // Differenz selektieren
                if (matchVal.length !== inputVal.length) {
                    this._inputDom.node.setSelectionRange(inputVal.length, matchVal.length);
                }
            }

            // Elemente des Dropdowns filtern
            this._listViewEl.applyFilters({field:this.captionField, value: inputVal});

        } else if (key === 'Backspace' || key === 'Delete') {
            this._listViewEl.applyFilters({field:this.captionField, value: inputVal});

        } else {
            // Filter des Dropdowns zurücksetzen
            this._listViewEl.applyFilters(null);
        }
    }

    _setScrollPositionToSelection() {
        let sel = this._listViewEl.getSelected();
        if (kijs.isObject(sel) && sel instanceof kijs.gui.DataViewElement) {
            if (kijs.isNumber(sel.top) && this._spinBoxEl.isRendered) {
                let spH = this._spinBoxEl.dom.height, spSt = this._spinBoxEl.dom.node.scrollTop;

                let minScrollValue = sel.top;
                let maxScrollValue = sel.top - spH + sel.height;

                // prüfen, ob selektion ausserhalb von Scrollbar
                if (this._spinBoxEl.dom.node.scrollTop === 0 || this._spinBoxEl.dom.node.scrollTop > minScrollValue) {
                    this._spinBoxEl.dom.node.scrollTop = minScrollValue;

                } else if (this._spinBoxEl.dom.node.scrollTop < maxScrollValue) {
                    this._spinBoxEl.dom.node.scrollTop = maxScrollValue+5;
                }
            }
        }
    }

    // overwrite
    _validationRules(value) {

        // Eingabe erforderlich
        if (this._required) {
            if (kijs.isEmpty(value)) {
                this._errors.push(kijs.getText('Dieses Feld darf nicht leer sein'));
            }
        }

        // Ein Datensatz muss ausgewählt werden.
        if (this._forceSelection && !this._remoteSort && !kijs.isEmpty(value)) {
            let match = false;
            kijs.Array.each(this._listViewEl.data, function(row) {
                if (row[this.valueField] === value) {
                    match = true;
                    return false;
                }
            }, this);

            if (!match) {
                this._errors.push(kijs.getText('Der Wert "%1" ist nicht in der Liste enthalten', '', value) + '.');
            }
        }

        // minSelectCount
        if (!kijs.isEmpty(this._minSelectCount) && this._minSelectCount >= 0) {
            if (kijs.isArray(value)) {
                if (kijs.isEmpty(value) && this._minSelectCount > 0 || value.length < this._minSelectCount) {
                    this._errors.push(kijs.getText('Min. %1 Datensätze müssen ausgewählt werden', '', this._minSelectCount));
                }
            }
        }

        // maxSelectCount
        if (!kijs.isEmpty(this._maxSelectCount) && this._maxSelectCount > 0) {
            if (kijs.isArray(value)) {
                if (value.length > this._maxSelectCount) {
                    this._errors.push(kijs.getText('Max. %1 Datensätze dürfen ausgewählt werden', '', this._maxSelectCount));
                }
            }
        }
    }


    // LISTENERS
    _onAfterFirstRenderTo(e) {
        // forceLoad, wenn value vorhanden ist (damit label geladen wird)
        this.load(null, this.value !== '');
    }

    _onInputKeyDown(e) {
        // event beim listView ausführen, damit selektion geändert werden kann.

        if (this._listViewEl.getSelected()) {
            this._listViewEl._onKeyDown(e);

        } else if (e.nodeEvent.key === 'ArrowDown') {
            let indx = this._listViewEl.elements.length > 0 && kijs.isDefined(this._listViewEl.elements[0].index) ? this._listViewEl.elements[0].index : null;
            if (indx !== null) {
                this._listViewEl.selectByIndex(indx);
            }
        }

        // Scroll
        if (e.nodeEvent.key === 'ArrowDown' || e.nodeEvent.key === 'ArrowUp') {
            // scrollen
            this._setScrollPositionToSelection();
        }

        // wenn Enter gedrückt wird, listview schliessen und ausgewählten Datensatz übernehmen.
        if (e.nodeEvent.key === 'Enter') {
            let dataViewElement = this._listViewEl.getSelected();
            this._spinBoxEl.close();

            if (dataViewElement && dataViewElement instanceof kijs.gui.DataViewElement) {
                let newVal = dataViewElement.dataRow[this.valueField];
                let changed = newVal !== this.value;
                this.value = newVal;

                if (changed) {
                    this.raiseEvent('change');
                }
            }

            // event stoppen
            e.nodeEvent.stopPropagation();

        // Esc: Schliessen
        } else if (e.nodeEvent.key === 'Escape') {
            this._spinBoxEl.close();

            // Selektion zurücksetzen
            this._listViewEl.value = this.value;

            // event stoppen
            e.nodeEvent.stopPropagation();
        }
    }

    _onInputKeyUp(e) {
        // Steuerbefehle ignorieren
        let specialKeys = [
            'ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'ContextMenu',
            'Delete', 'Insert', 'Home', 'End', 'Alt', 'NumpadEnter',
            'AltGraph', 'ContextMenu', 'Control', 'Shift',
            'Enter', 'CapsLock', 'Tab', 'OS', 'Escape', 'Space'
        ];
        if (kijs.Array.contains(specialKeys, e.nodeEvent.code) || kijs.Array.contains(specialKeys, e.nodeEvent.key)) {
            return;
        }

        // bestehendes Defer löschen
        if (this._keyUpDefer) {
            window.clearTimeout(this._keyUpDefer);
            this._keyUpDefer = null;
        }

        // neues Defer schreiben
        this._keyUpDefer = kijs.defer(function() {
            if (this._remoteSort) {
                this.load(null, false, this._inputDom.nodeAttributeGet('value'));

            } else {
                this._setProposal(e.nodeEvent.key);
            }
        }, this._remoteSort ? 1000 : 500, this);

    }

    _onInputChange(e) {

        // change event nicht berücksichtigen, wenn die spinbox
        // offen ist.
        if (this._spinBoxEl.isRendered) {
            return;
        }

        let inputVal = this._inputDom.nodeAttributeGet('value'), match=false, matchVal='', changed=false;
        inputVal = kijs.toString(inputVal).trim();

        // Leerer Wert = feld löschen
        if (inputVal === '') {
            match = true;

        } else {

            // Wert im Store suchen.
            kijs.Array.each(this._listViewEl.data, function(row) {
                if (kijs.isString(row[this.captionField]) && row[this.captionField].toLowerCase() === inputVal.toLowerCase()) {
                    match = true;
                    matchVal = row[this.valueField];
                    return false;
                }
            }, this);
        }

        if (match && matchVal !== this.value) {
            this.value = matchVal;
            changed = true;

        // Es wurde ein Wert eingegeben, der nicht im Store ist, und das ist erlaubt.
        } else if (!match && !this._forceSelection) {
            if (inputVal !== this.value) {
                this.value = inputVal;
                changed = true;
            }

        // Es wurde ein Wert eingegeben, der nicht im Store ist, daher Feld
        // auf letzten gültigen Wert zurücksetzen.
        } else {
            this.value = this._value;
        }

        // validieren
        this.validate();

        // change-event
        if (changed) {
            this.raiseEvent('change');
        }
    }

    _onListViewAfterLoad(e) {
        if (!this._remoteSort) {
            this.value = this._value;
        }

        if (this._selectFirst) {
            this.value = this._listViewEl.data[0].value;
        }

        // Spinbox Nachricht anhängen
        if (e.response && e.response.spinboxMessage) {
            this._addPlaceholder(e.response.spinboxMessage);
        }
    }

    _onListViewClick(e) {
        this._spinBoxEl.close();

        if (this.value !== this._listViewEl.value) {
            this.value = this._listViewEl.value;

            // validieren
            this.validate();

            this.raiseEvent('change');
        }
    }

    _onSpinBoxClick() {
        this._inputDom.focus();
    }

    _onSpinBoxShow() {
        this._setScrollPositionToSelection();
    }

    // overwrite
    _onSpinButtonClick(e) {
        super._onSpinButtonClick(e);
        this._listViewEl.applyFilters();

        if (this._listViewEl.data.length === 0) {
            this._addPlaceholder(kijs.getText('Schreiben Sie mindestens %1 Zeichen, um die Suche zu starten', '', this._minChars) + '.');
        }
    }


    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(superCall) {
        if (!superCall) {
            // unrendern
            this.unrender(superCall);

            // Event auslösen.
            this.raiseEvent('destruct');
        }

        // Elemente/DOM-Objekte entladen
        if (this._inputDom) {
            this._inputDom.destruct();
        }

        // Variablen (Objekte/Arrays) leeren
        this._inputDom = null;
        this._listViewEl = null;
        this._oldValue = null;

        // Basisklasse entladen
        super.destruct(true);
    }
};

/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.field.DateTime
// --------------------------------------------------------------
/**
 * EVENTS
 * ----------
 * blur
 * input
 *
 * // Geerbte Events
 * add
 * afterFirstRenderTo
 * afterRender
 * afterResize
 * beforeAdd
 * beforeRemove
 * changeVisibility
 * childElementAfterResize
 * dblClick
 * destruct
 * drag
 * dragEnd
 * dragLeave
 * dragOver
 * dragStart
 * drop
 * focus
 * mouseDown
 * mouseLeave
 * mouseMove
 * mouseUp
 * remove
 * wheel
 *
 * // key events
 * keyDown
 * enterPress
 * enterEscPress
 * escPress
 * spacePress
 */
kijs.gui.field.DateTime = class kijs_gui_field_DateTime extends kijs.gui.field.Field {

    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        this._hasTime = true;
        this._hasDate = true;
        this._hasSeconds = false;
        this._timeRequired = false;
        this._changeBufferTimeout = null;
        this._destroyInterval = null;
        let useDefaultSpinIcon = !kijs.isDefined(config.spinIconChar);

        this._inputDom = new kijs.gui.Dom({
            disableEscBubbeling: true,
            nodeTagName: 'input',
            nodeAttribute: {
                id: this._inputId
            },
            on: {
                change: this._onChange,
                context: this
            }
        });
        this._dom.clsAdd('kijs-field-datetime');

        this._timePicker = new kijs.gui.TimePicker({
            on: {
                change: this._onTimePickerChange,
                afterRender: this._onTimePickerAfterRender,
                context: this
            }
        });

        this._spBxSeparator = new kijs.gui.Element({
            cls: 'kijs-separator'
        });

        this._datePicker = new kijs.gui.DatePicker({
            on: {
                dateSelected: this._onDatePickerSelected,
                dateChanged: this._onDatePickerChange,
                context: this
            }
        });

        this._spinBoxEl = new kijs.gui.SpinBox({
            target: this,
            width: 383,
            height: 260,
            cls: ['kijs-flexrow', 'kijs-spinbox-datetime'],
            targetDomProperty: 'inputWrapperDom',
            ownerNodes: [this._inputWrapperDom, this._spinIconEl.dom],
            openOnInput: false,
            parent: this,
            elements: [
                this._datePicker,
                this._spBxSeparator,
                this._timePicker
            ],
            on: {
                show: this._onSpinBoxShow,
                context: this
            }
        });

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            //autoLoad: true,
            spinIconVisible: true,
            spinIconChar: '&#xf073', // calendar
            displayFormat: 'd.m.Y H:i:s', // Format, das angezeigt wird
            valueFormat: 'Y-m-d H:i:s'  // Format, das mit value ausgeliefert wird
        });

       // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            hasTime: true,    // Enthält das Feld die Uhrzeit?
            hasDate: true,    // Enthält das Feld das Datum?
            hasSeconds: true, // Hat das Uhrzeitfeld Sekunden?
            timeRequired: true, // Muss die Zeit eingegeben werden?
            displayFormat: true,
            valueFormat: true
        });

        // Event-Weiterleitungen von this._inputDom
        this._eventForwardsAdd('blur', this._inputDom);
        this._eventForwardsAdd('change', this._inputDom);
        this._eventForwardsAdd('input', this._inputDom);

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
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }

        if (!this._hasDate && !this._hasTime) {
            throw new kijs.Error('hasDate and hasTime is false, nothing to display');
        }
        if (useDefaultSpinIcon && !this._hasDate) {
            this.spinIconChar = '&#xf017'; // clock
        }

        if (this._hasDate) {
            this._spinBoxEl.add(this._datePicker);
            this._spinBoxEl.width = 187;
        } else {
            this._spinBoxEl.remove(this._datePicker);
        }

        if (this._hasTime) {
            this._spinBoxEl.add(this._timePicker);
            this._spinBoxEl.width = 157;
        } else {
            this._spinBoxEl.remove(this._timePicker);
        }

        if (this._hasDate && this._hasTime) {
            this._spinBoxEl.add(this._spBxSeparator);
            this._spinBoxEl.width = 187+157+3;
        } else {
            this._spinBoxEl.remove(this._spBxSeparator);
        }

        this._timePicker.hasSeconds = !!this._hasSeconds;
    }


    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    // overwrite
    get disabled() { return super.disabled; }
    set disabled(val) {
        super.disabled = !!val;
        if (val) {
            this._inputDom.nodeAttributeSet('disabled', true);
        } else {
            this._inputDom.nodeAttributeSet('disabled', false);
        }
    }

    get hasDate() { return this._hasDate; }
    set hasDate(val) { this._hasDate = !!val; }

    get hasSeconds() { return this._hasSeconds; }
    set hasSeconds(val) { this._hasSeconds = !!val; }

    get hasTime() { return this._hasTime; }
    set hasTime(val) { this._hasTime = !!val; }

    // overwrite
    get isEmpty() { return kijs.isEmpty(this._inputDom.value); }

    get inputDom() { return this._inputDom; }

    // overwrite
    get readOnly() { return super.readOnly; }
    set readOnly(val) {
        super.readOnly = !!val;
        if (val) {
            this._inputDom.nodeAttributeSet('readonly', true);
        } else {
            this._inputDom.nodeAttributeSet('readonly', false);
        }
    }

    get timeRequired() { return this._timeRequired; }
    set timeRequired(val) { this._timeRequired = !!val; }

    // overwrite
    get value() {
        let val = this._inputDom.nodeAttributeGet('value');
        val = this._getDateTimeByString(val);
        if (val instanceof Date) {
            return this._format(this._valueFormat, val);
        }
        return '';
    }
    set value(val) {
        let display='';

        // Datum aus String
        if (kijs.isString(val) && val !== '') {
            val = this._getDateTimeByString(val);
        }

        // Datum aus Timestamp
        if (kijs.isInteger(val)) {
            val = new Date(val*1000);
            val.timeMatch = true;
        }

        if (val instanceof Date) {
            display = this._format(this._displayFormat, val);
        }
        this._inputDom.nodeAttributeSet('value', display);
        this.validate();
    }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------

    // overwrite
    render(superCall) {
        super.render(true);

        // Input rendern (kijs.guiDom)
        this._inputDom.renderTo(this._inputWrapperDom.node);

        // Event afterRender auslösen
        if (!superCall) {
            this.raiseEvent('afterRender');
        }
    }


    // overwrite
    unrender(superCall) {
        // Event auslösen.
        if (!superCall) {
            this.raiseEvent('unrender');
        }

        this._inputDom.unrender();
        super.unrender(true);
    }


    _bufferChangeEvent(value) {
        clearTimeout(this._changeBufferTimeout);
        this._changeBufferTimeout = setTimeout(this.raiseEvent, 50, 'change', {value: value});
    }

    /**
     * Formatiert ein Datum im angegebenen Format
     * @param {String} format
     * @param {Date} datetime
     * @returns {String}
     */
    _format(format, datetime) {
        format = this._getFormat(format, datetime);
        if (format !== '' && datetime instanceof Date) {
            return kijs.Date.format(datetime, format);
        }
        return '';
    }

    /**
     * Entfernt Datums- oder Zeitbuchstaben vom Format,
     * wenn diese nicht aktiv sind.
     * @param {String} format
     * @param {Date|null} datetime
     * @returns {String}
     */
    _getFormat(format, datetime=null) {
        let hasNoTime = false;

        // Wenn keine Uhrzeit gefunden wurde und diese nicht nötig
        // ist, wird die Zeit abgeschnitten.
        if (datetime instanceof Date && !this._timeRequired) {
            if (datetime.timeMatch === false) {
                hasNoTime = true;
            }
        }

        // alle Datumszeichen entfernen
        if (!this._hasDate) {
            format = format.replace(/[^a-zA-Z]?[dDjlFmMnWYyL][^a-zA-Z]?/gu, '').trim();
        }

        // alle Zeitzeichen entfernen
        if (!this._hasTime || hasNoTime) {
            format = format.replace(/[^a-zA-Z]?[His][^a-zA-Z]?/gu, '').trim();
        }

        // Sekunden entfernen
        if (!this._hasSeconds) {
            format = format.replace(/[^a-zA-Z]?s[^a-zA-Z]?/gu, '').trim();
        }

        return format;
    }

    /**
     * parst ein String und liest ein Datum
     * @param {String} dateTimeStr
     * @returns {Date|Boolean}
     */
    _getDateTimeByString(dateTimeStr) {
        let year=null, month=null, day=null, hour=0, minute=0, second=0, timeMatch = false, dateTimeAr, timeStr, dateStr;
        dateTimeStr = kijs.toString(dateTimeStr);

            if (dateTimeStr.includes(" ") && this._hasDate) {
                dateTimeAr = dateTimeStr.split(" ");
                dateStr = dateTimeAr[0];

                if (dateTimeAr.length > 1) {
                    kijs.Array.each(dateTimeAr, function(item, i) {

                        if (i > 0) {
                            timeStr = timeStr + dateTimeAr[i];
                        }
                    });

                } else {
                    timeStr = dateTimeAr[1];
                }

            } else {
                timeStr = dateTimeStr;
                dateStr = dateTimeStr;
            }

        // Uhrzeit
        if (this._hasTime) {

            // Uhrzeit lesen (12:12)
            dateTimeStr = dateTimeStr.replace(/([0-9]{1,2}):([0-9]{1,2})(?::([0-9]{1,2}))?/, function(match, h, i, s) {
                timeMatch = true;
                h = parseInt(h);
                i = parseInt(i);
                s = s ? parseInt(s) : 0;
                if (h === 24) {
                    h = 0;
                }
                if (h >= 0 && h <= 23) {
                    hour = h;
                }
                if (i >= 0 && i < 60) {
                    minute = i;
                }
                if (s >= 0 && s < 60) {
                    second = s;
                }
                return '';
            }).trim();

            // Falls die Urzeit eine Lücke hat, Uhrzeit zusammensetzen
            if (!timeMatch && timeStr.includes(" ")) {

                let tm = timeStr.split(" ");
                if (tm) {
                    let tH = tm[0];
                    let tI = tm[1];

                    if (tH >= 0 && tH <= 24 && tI >= 0 && tI <= 59) {
                        hour = tH;
                        minute = tI;
                        timeMatch = true;
                    } else {
                        return false;
                    }
                } else {
                    return false;
                }
            }

            // Falls nur eine Uhrzeit gesucht ist, versuchen die Uhrzeit zu lesen.
            // Wenn eine einzelne Zahl eingegeben wurde, diese als Stunde handeln
            if (!timeMatch && !this._hasDate) {
                let tm = timeStr.match(/[0-9]+/);
                if (tm) {
                    let tH = parseInt(tm[0]);
                    if (tH >= 0 && tH <= 24) {
                        hour = tH === 24 ? 0 : tH;
                        timeMatch = true;
                    }
                }
            }

            // drei oder vier Ziffern als [H]HMM handeln
            if (!timeMatch && kijs.isString(timeStr)) {
                let tm = timeStr.match(/([0-9]{1,2})([0-9]{2})/);
                if (tm) {
                    let tH = parseInt(tm[1]);
                    let tI = parseInt(tm[2]);

                    if (tH >= 0 && tH <= 24 && tI >= 0 && tI <= 59) {
                        hour = tH;
                        minute = tI;
                        timeMatch = true;
                    } else {
                        return false;
                    }
                } else {
                    return false;
                }
            }
        }

        // Datum im DB-Format (2019-01-10) lesen
        dateStr.replace(/([0-9]{2}|[0-9]{4})-([0-9]{1,2})-([0-9]{1,2})/, function(match, Y, m, d) {
            year = parseInt(Y);
            month = parseInt(m);
            day = parseInt(d);
            return match;
        });

        // Datum ansonsten im Format Tag . Monat . Jahr lesen
        if (!year) {
            let dp = dateStr.match(/([\d]+)[^\d]*([\d]*)[^\d]*([\d]*)/);
            day = dp && dp[1] ? parseInt(dp[1]) : null;
            month = dp && dp[2] ? parseInt(dp[2]) : null;
            year = dp && dp[3] ? parseInt(dp[3]) : null;
        }

        // Jahr anpassen
        if (year !== null && year > 0 && year < 30) {
            year = 2000 + year;
        } else if (year !== null && year >= 30 && year < 100) {
            year = 1900 + year;
        } else if (year === null || year < 0 || year > 3000) {
            year = (new Date()).getFullYear();
        }

        // Monat
        if (month === null || month === 0 || month > 12 || month < 0) {
            month = (new Date()).getMonth()+1;
        }

        // Tag
        if (day === null || day < 0 || day === 0 || day > 31) {
            if (this._hasDate) {
                return false;
            } else {
                day = (new Date()).getDate();
            }
        }

        let datetime = new Date(year, month-1, day, hour, minute, second);
        datetime.timeMatch = timeMatch; // Uhrzeit definiert oder default (00:00)
        return datetime;
    }


    _validationRules(value) {
        let rawValue = this._inputDom.nodeAttributeGet('value');

        super._validationRules(rawValue);

        // Eingabe erforderlich
        if (rawValue !== '' && this._getDateTimeByString(rawValue) === false) {
            this._errors.push('Ungültiges Format.');
        }
    }


    // LISTENERS
    _onInput(e) {
        this.validate();
    }

    _onChange(e) {
        let dateTime = this._getDateTimeByString(e.nodeEvent.target.value);
        if (dateTime) {
            // formatieren
            this.value = dateTime;
        }

        this._bufferChangeEvent(this.value);
    }

    _onTimePickerAfterRender() {
        let v = this._getDateTimeByString(this.value);
        this._timePicker.value = v ? this._format('H:i:s', v) : '00:00:00';

    }

    _onTimePickerChange(e) {
        let v = this._getDateTimeByString(this.value) || new Date();
        this.value = this._format('Y-m-d', v) + ' ' + e.value;
        this._spinBoxEl.close();
        this.validate();

        this._bufferChangeEvent(this.value);
    }

    _onDatePickerChange(e) {
        if (e instanceof Date) {
            let v = this._getDateTimeByString(this.value);

            if (!v) {
                v =  kijs.Date.getDatePart(new Date());
                v.timeMatch = false;
            }

            this.value = this._format('Y-m-d', e) + ' ' + this._format('H:i:s', v);
        }
        this.validate();

        this._bufferChangeEvent(this.value);
    }

    _onDatePickerSelected(e) {
        this._spinBoxEl.close();
    }

    _onSpinBoxShow() {
        let v = this._getDateTimeByString(this.value);
        if (v && this._hasDate) {
            this._datePicker.value = v;
        }

        if (v && this._hasTime) {
            this._timePicker.value = this._format('H:i:s', v);
        }
    }


    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(superCall) {
        if (this._changeBufferTimeout) {
            if (this._destroyInterval) {
                return;
            } else {
                this._destroyInterval = setInterval(this.destruct, 10, superCall);
            }
        }
        if (this._destroyInterval) {
            clearInterval(this._destroyInterval);
        }

        if (!superCall) {
            // unrendern
            this.unrender(superCall);

            // Event auslösen.
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
// kijs.gui.field.Display
// --------------------------------------------------------------
/**
 * EVENTS
 * ----------
 * blur
 * input
 *
 * // Geerbte Events
 * add
 * afterFirstRenderTo
 * afterRender
 * afterResize
 * beforeAdd
 * beforeRemove
 * changeVisibility
 * childElementAfterResize
 * dblClick
 * destruct
 * drag
 * dragEnd
 * dragLeave
 * dragOver
 * dragStart
 * drop
 * focus
 * mouseDown
 * mouseLeave
 * mouseMove
 * mouseUp
 * remove
 * wheel
 *
 * // key events
 * keyDown
 * enterPress
 * enterEscPress
 * escPress
 * spacePress
 */
kijs.gui.field.Display = class kijs_gui_field_Display extends kijs.gui.field.Field {

    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        this._inputDom = new kijs.gui.Dom({
            nodeAttribute: {
                id: this._inputId,
                cls: 'kijs-displayvalue'
            },
            on: {
                click: this._onDomClick,
                context: this
            }
        });

        this._trimValue = true;

        this._dom.clsAdd('kijs-field-display');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            htmlDisplayType: 'html',
            submitValue: false,
            link: false,
            linkType: 'auto'
        });

       // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            trimValue: true,             // Sollen Leerzeichen am Anfang und Ende des Values automatisch entfernt werden?
            link: true,                  // Weblink zum anklicken machen
            linkType: true,              // Art des Links: tel, mail, web (default: automatisch)
            htmlDisplayType: { target: 'htmlDisplayType', context: this._inputDom }
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
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
        if (val) {
            this._inputDom.nodeAttributeSet('disabled', true);
        } else {
            this._inputDom.nodeAttributeSet('disabled', false);
        }
    }

    get htmlDisplayType() { return this._inputDom.htmlDisplayType; }
    set htmlDisplayType(val) { this._inputDom.htmlDisplayType = val; }

    // overwrite
    get isEmpty() { return kijs.isEmpty(this._inputDom.html); }

    get inputDom() { return this._inputDom; }

    // overwrite
    get readOnly() { return super.readOnly; }
    set readOnly(val) {
        super.readOnly = !!val;
        if (val) {
            this._inputDom.nodeAttributeSet('readonly', true);
        } else {
            this._inputDom.nodeAttributeSet('readonly', false);
        }
    }

    get trimValue() { return this._trimValue; }
    set trimValue(val) { this._trimValue = val; }

    // overwrite
    get value() {
        let val = this._inputDom.html;
        return val === null ? '' : val;
    }
    set value(val) {
        this._inputDom.html = val;
        this._setLinkClass();
    }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // overwrite
    render(superCall) {
        super.render(true);

        // Input rendern (kijs.guiDom)
        this._inputDom.renderTo(this._inputWrapperDom.node);

        // Event afterRender auslösen
        if (!superCall) {
            this.raiseEvent('afterRender');
        }

        this._setLinkClass();
    }


    // overwrite
    unrender(superCall) {
        // Event auslösen.
        if (!superCall) {
            this.raiseEvent('unrender');
        }

        this._inputDom.unrender();
        super.unrender(true);
    }

    // overwrite
    validate() {
        // display kann nicht invalid sein,
        // da der User nichts ändern kann.
        return true;
    }

    _setLinkClass() {
        let autoLinkType = this._getLinkType(this.value);
        if (this._link && ((this._linkType === 'auto' && autoLinkType !== false) || this._linkType === autoLinkType)) {
            this._inputDom.clsAdd('kijs-link');
        } else {
            this._inputDom.clsRemove('kijs-link');
        }
    }

    /**
     * Prüft, ob ein Wert ein Link ist.
     * @param {String} value
     * @returns {String|false} tel|mail|web
     */
    _getLinkType(value) {
        value = kijs.toString(value);

        // Telefon
        if (value.match(/^\s*\+?[0-9\s]+$/i)) {
            return 'tel';
        }

        // Email
        if (value.match(/^[^@]+@[\w\-\.àáâãäåæçèéêëìíîïðñòóôõöøœùúûüýÿ]+\.[a-z]{2,}$/i)) {
            return 'mail';
        }

        // Webseite
        if (value.match(/^[\w\-\.àáâãäåæçèéêëìíîïðñòóôõöøœùúûüýÿ]+\.[a-z]{2,}$/i)) {
            return 'web';
        }

        return false;
    }

    /**
     * Öffnet ein Link (beim Klick)
     * @param {String} link
     * @param {String} type
     * @returns {undefined}
     */
    _openLink(link, type) {
        if (type === 'tel') {
            window.open('tel:' + link.replace(/[^\+0-9]/i, ''), '_self');

        } else if (type === 'mail') {
            window.open('mailto:' + link, '_self');

        }  else if (type === 'web' && link.match(/^(http|ftp)s?:\/\//i)) {
            window.open(link, '_blank');

        }  else if (type === 'web') {
            window.open('http://' + link, '_blank');
        }
    }

    _onDomClick() {
        if (this._link && !this.disabled && !this.readOnly) {
            let linkType = this._linkType === 'auto' ? this._getLinkType(this.value) : this._linkType;
            this._openLink(kijs.toString(this.value), linkType);
        }
    }


    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(superCall) {
        if (!superCall) {
            // unrendern
            this.unrender(superCall);

            // Event auslösen.
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

/* global kijs, this, ace */

// --------------------------------------------------------------
// kijs.gui.field.Editor
// --------------------------------------------------------------
kijs.gui.field.Editor = class kijs_gui_field_Editor extends kijs.gui.field.Field {

    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        this._aceEditor = null;
        this._aceEditorNode = null;
        this._mode = null;
        this._theme = null;
        this._value = null;

        this._dom.clsAdd('kijs-field-editor');

       // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            mode: true,          // 'javascript', 'json', 'css', 'html', 'php', 'mysql', 'plain_text' (weitere siehe Ordner kijs\lib\ace)
            theme: true          // (siehe Ordner kijs\lib\ace)
        });

        // Listeners
        this.on('input', this._onInput, this);

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
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
            this._aceEditor.setReadOnly(true);
        } else {
            this._aceEditor.setReadOnly(false);
        }
    }

    // overwrite
    get isEmpty() { return kijs.isEmpty(this.value); }

    get mode() { return this._mode; }
    set mode(val) { this._mode = val; }

    // overwrite
    get readOnly() { return super.readOnly; }
    set readOnly(val) {
        super.readOnly = !!val;
        if (val || this._dom.clsHas('kijs-disabled')) {
            this._aceEditor.setReadOnly(true);
        } else {
            this._aceEditor.setReadOnly(false);
        }
    }

    get theme() { return this._theme; }
    set theme(val) { this._theme = val; }

    get trimValue() { return this._trimValue; }
    set trimValue(val) { this._trimValue = val; }

    // overwrite
    get value() {
        if (this._aceEditor) {
            return this._aceEditor.getValue();
        } else {
            return this._value;
        }
    }
    set value(val) {
        this._value = val;
        if (this._aceEditor) {
            this._aceEditor.setValue(val, 1);
        }
    }


    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // overwrite
    render(superCall) {
        super.render(true);

        // aceEditor erstellen
        if (!this._aceEditor) {
            this._aceEditorNode = document.createElement('div');
            this._inputWrapperDom.node.appendChild(this._aceEditorNode);

            this._aceEditor = ace.edit(this._aceEditorNode);
            let inputNode = this._aceEditorNode.firstChild;
            inputNode.id = this._inputId;

            // Zeitverzögert den Listener erstellen
            kijs.defer(function() {
                var _this = this;
                this._aceEditor.getSession().on('change', function() {
                    _this.raiseEvent(['input', 'change']);
                });
            }, 200, this);
        }

        this._aceEditor.setHighlightActiveLine(false);
        //this._aceEditor.$blockScrolling = Infinity;

        if (this._theme) {
            this._aceEditor.setTheme('ace/theme/' + this._theme);
        }
        if (this._mode) {
            this._aceEditor.session.setMode('ace/mode/' + this._mode);
        }

        this.value = this._value;

        // Event afterRender auslösen
        if (!superCall) {
            this.raiseEvent('afterRender');
        }
    }


    // LISTENERS
    _onInput(e) {
        this.validate();
    }

    // PROTECTED
    // overwrite
    _validationRules(value) {
        super._validationRules(value);

        // Fehler des Editors auch übernehmen
        if (this._aceEditor) {
            const annot = this._aceEditor.getSession().getAnnotations();
            for (let key in annot) {
                if (annot.hasOwnProperty(key)) {
                    this._errors.push("'" + annot[key].text + "'" + ' in Zeile ' + (annot[key].row+1));
                }
            }
        }
    }


    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(superCall) {
        if (!superCall) {
            // unrendern
            this.unrender(superCall);

            // Event auslösen.
            this.raiseEvent('destruct');
        }

        // Elemente/DOM-Objekte entladen

        // Variablen (Objekte/Arrays) leeren
        this._aceEditor = null;
        this._aceEditorNode = null;

        // Basisklasse entladen
        super.destruct(true);
    }
};
/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.field.ListView
// --------------------------------------------------------------
kijs.gui.field.ListView = class kijs_gui_field_ListView extends kijs.gui.field.Field {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        this._minSelectCount = null;
        this._maxSelectCount = null;
        this._oldValue = [];

        this._listView = new kijs.gui.ListView({});

        this._dom.clsAdd('kijs-field-listview');

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            autoLoad: { target: 'autoLoad', context: this._listView },

            ddSort: { target: 'ddSort', context: this._listView },

            showCheckBoxes: { target: 'showCheckBoxes', context: this._listView },
            selectType: { target: 'selectType', context: this._listView },

            facadeFnLoad: { target: 'facadeFnLoad', context: this._listView },
            rpc: { target: 'rpc', context: this._listView },

            captionField: { target: 'captionField', context: this._listView },
            iconCharField: { target: 'iconCharField', context: this._listView },
            iconClsField: { target: 'iconClsField', context: this._listView },
            iconColorField: { target: 'iconColorField', context: this._listView },
            toolTipField: { target: 'toolTipField', context: this._listView },
            valueField: { target: 'valueField', context: this._listView },

            minSelectCount: true,
            maxSelectCount: true,

            data: { prio: 1000, target: 'data', context: this._listView },
            value: { prio: 1001, target: 'value' }
        });

        // Listeners
        this._listView.on('selectionChange', this._onListViewSelectionChange, this);
        this._eventForwardsAdd('ddOver', this._listView);
        this._eventForwardsAdd('ddDrop', this._listView.dom);

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }
    }


    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get autoLoad() { return this._listView.autoLoad; }
    set autoLoad(val) { this._listView.autoLoad = val; }

    get data() { return this._listView.data; }
    set data(val) { this._listView.data = val; }

    get captionField() { return this._listView.captionField; }
    set captionField(val) { this._listView.captionField = val; }

    get valueField() { return this._listView.valueField; }
    set valueField(val) { this._listView.valueField = val; }

    // overwrite
    get disabled() { return super.disabled; }
    set disabled(val) {
        super.disabled = !!val;
        this._listView.disabled = val || this._dom.clsHas('kijs-readonly');
    }

    get elements() { return this._listView.elements; }

    get facadeFnLoad() { return this._listView.facadeFnLoad; }
    set facadeFnLoad(val) { this._listView.facadeFnLoad = val; }

    // overwrite
    get isEmpty() { return kijs.isEmpty(this.value); }

    // overwrite
    get readOnly() { return super.readOnly; }
    set readOnly(val) {
        super.readOnly = !!val;
        this._listView.disabled = val || this._dom.clsHas('kijs-disabled');
    }

    get rpc() { return this._listView.rpc; }
    set rpc(val) { this._listView.rpc = val; }

    // overwrite
    get value() { return this._listView.value; }
    set value(val) {
        this._listView.value = val;
        this._oldValue = this._listView.value;
    }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------

    /**
     * Fügt Daten hinzu
     * @param {Array} data
     * @returns {undefined}
     */
    addData(data) {
        this._listView.addData(data);
    }

    /**
     * Füllt das Combo mit Daten vom Server
     * @param {Array} args Array mit Argumenten, die an die Facade übergeben werden
     * @returns {undefined}
     */
    load(args) {
        this._listView.load(args);
    }

    // overwrite
    render(superCall) {
        super.render(true);

        this._listView.renderTo(this._inputWrapperDom.node);

        // Event afterRender auslösen
        if (!superCall) {
            this.raiseEvent('afterRender');
        }
    }

    // overwrite
    unrender(superCall) {
        // Event auslösen.
        if (!superCall) {
            this.raiseEvent('unrender');
        }

        this._listView.unrender();
        super.unrender(true);
    }


    // PROTECTED
    // overwrite
    _validationRules(value) {
        super._validationRules(value);

        // minSelectCount
        if (!kijs.isEmpty(this._minSelectCount)) {
            const minSelectCount = this._minSelectCount;

            if (kijs.isArray(value)) {
                if (value.length < minSelectCount) {
                    this._errors.push(`Min. ${minSelectCount} müssen ausgewählt werden`);
                }
            } else if (kijs.isEmpty(value) && minSelectCount > 0) {
                this._errors.push(`Min. ${minSelectCount} müssen ausgewählt werden`);
            }
        }

        // maxSelectCount
        if (!kijs.isEmpty(this._maxSelectCount)) {
            const maxSelectCount = this._maxSelectCount;

            if (kijs.isArray(value)) {
                if (value.length > maxSelectCount) {
                    this._errors.push(`Max. ${maxSelectCount} dürfen ausgewählt werden`);
                }
            } else if (!kijs.isEmpty(value) && maxSelectCount < 1) {
                this._errors.push(`Max. ${maxSelectCount} dürfen ausgewählt werden`);
            }
        }
    }

    // LISTENERS
    _onAfterFirstRenderTo(e) {
        this.load();
    }

    _onListViewSelectionChange(e) {
        const val = this.value;

        this.raiseEvent(['input', 'change'], { oldValue: this._oldValue, value: val });
        this._oldValue = val;

        this.validate();
    }


    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(superCall) {
        if (!superCall) {
            // unrendern
            this.unrender(superCall);

            // Event auslösen.
            this.raiseEvent('destruct');
        }

        // Elemente/DOM-Objekte entladen
        if (this._listView) {
            this._listView.destruct();
        }

        // Variablen (Objekte/Arrays) leeren
        this._listView = null;
        this._oldValue = null;

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
            disableEnterBubbeling: true,
            disableEscBubbeling: true,
            nodeTagName: 'textarea',
            nodeAttribute: {
                id: this._inputId
            }
        });

        this._trimValue = true;

        this._dom.clsAdd('kijs-field-memo');

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            trimValue: true,             // Sollen Leerzeichen am Anfang und Ende des Values automatisch entfernt werden?
            placeholder: { target: 'placeholder' }
        });

        // Event-Weiterleitungen von this._inputDom
        this._eventForwardsAdd('blur', this._inputDom);
        this._eventForwardsAdd('change', this._inputDom);
        this._eventForwardsAdd('focus', this._inputDom);
        this._eventForwardsAdd('input', this._inputDom);

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
            config = Object.assign({}, this._defaultConfig, config);
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

    get placeholder() { this._inputDom.nodeAttributeGet('placeholder'); }
    set placeholder(val) { this._inputDom.nodeAttributeSet('placeholder', val); }

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
        return val === null ? '' : val;
    }
    set value(val) {
        this._inputDom.nodeAttributeSet('value', val);
        this.validate();
    }


    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // overwrite
    render(superCall) {
        super.render(true);

        // Input rendern (kijs.guiDom)
        this._inputDom.renderTo(this._inputWrapperDom.node);

        // Event afterRender auslösen
        if (!superCall) {
            this.raiseEvent('afterRender');
        }
    }


    // overwrite
    unrender(superCall) {
        if (!superCall) {
            // Event auslösen.
            this.raiseEvent('unrender');
        }

        this._inputDom.unrender();
        super.unrender(true);
    }


    // LISTENERS
    _onInput(e) {
        this.validate();
    }


    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(superCall) {
        if (!superCall) {
            // unrendern
            this.unrender(superCall);

            // Event auslösen.
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
            disableEscBubbeling: true,
            nodeTagName: 'input',
            nodeAttribute: {
                id: this._inputId,
                type: 'password'
            }
        });

        this._disableBrowserSecurityWarning = false;
        this._passwordChar = '•';
        this._trimValue = false;

        this._value = null;

        this._dom.clsAdd('kijs-field-password');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            disableBrowserSecurityWarning: 'auto'
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            disableBrowserSecurityWarning: { prio: -1, target: 'disableBrowserSecurityWarning' },  // false: Nimmt das Standard Passwort-Feld
                                                                    // true:  Eigenes Feld, dass nicht als Kennwort-Feld erkannt wird und
                                                                    //        deshalb auch keine Warnung bei unsicherer Verbindung ausgibt
                                                                    // 'auto' bei unsicherer Verbindung && Firefox = true sonst false
            passwordChar: true,
            trimValue: true,             // Sollen Leerzeichen am Anfang und Ende des Values automatisch entfernt werden?
            placeholder: { target: 'placeholder' }
        });

        // Event-Weiterleitungen von this._inputDom
        //this._eventForwardsAdd('input', this._inputDom);
        this._eventForwardsAdd('blur', this._inputDom);
        this._eventForwardsAdd('change', this._inputDom);

        this._eventForwardsRemove('enterPress', this._dom);
        this._eventForwardsRemove('enterEscPress', this._dom);
        this._eventForwardsRemove('escPress', this._dom);
        this._eventForwardsAdd('enterPress', this._inputDom);
        this._eventForwardsAdd('enterEscPress', this._inputDom);
        this._eventForwardsAdd('escPress', this._inputDom);

        // Listeners
        this._inputDom.on('input', this._onDomInput, this);
        this.on('input', this._onInput, this);

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }
    }


    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get disableBrowserSecurityWarning() { return this._disableBrowserSecurityWarning; }
    set disableBrowserSecurityWarning(val) {
        if (val === 'auto') {
            val = kijs.Navigator.isFirefox && window.isSecureContext === false;
        }

        // Evtl. eigenes Passwort-Feld ohne Sicherheitswarnung erstellen
        if (val) {
            this._inputDom.nodeAttributeSet('type', 'text');

            // DOM-Events
            this._inputDom.on('keyUp', this._onKeyUp, this);
            this._inputDom.on('mouseUp', this._onMouseUp, this);
            this._inputDom.on('input', this._onInput, this);
        } else {
            this._inputDom.nodeAttributeSet('type', 'password');

            // DOM-Events
            this._inputDom.off('keyUp', this._onKeyUp, this);
            this._inputDom.off('mouseUp', this._onMouseUp, this);
            this._inputDom.off('input', this._onInput, this);

        }

        this._disableBrowserSecurityWarning = !!val;
    }

    // overwrite
    get disabled() { return super.disabled; }
    set disabled(val) {
        super.disabled = !!val;
        if (val) {
            this._inputDom.nodeAttributeSet('disabled', true);
        } else {
            this._inputDom.nodeAttributeSet('disabled', false);
        }
    }

    // overwrite
    get isEmpty() { return kijs.isEmpty(this._inputDom.value); }

    get inputDom() { return this._inputDom; }

    get passwordChar() { return this._passwordChar; }
    set passwordChar(val) { this._passwordChar = val; }

    get placeholder() { this._inputDom.nodeAttributeGet('placeholder'); }
    set placeholder(val) { this._inputDom.nodeAttributeSet('placeholder', val); }

    // overwrite
    get readOnly() { return super.readOnly; }
    set readOnly(val) {
        super.readOnly = !!val;
        if (val) {
            this._inputDom.nodeAttributeSet('readonly', true);
        } else {
            this._inputDom.nodeAttributeSet('readonly', false);
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

        return val === null ? '' : val;
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
        this.validate();
    }


    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // overwrite
    render(superCall) {
        super.render(true);

        // Input rendern (kijs.guiDom)
        this._inputDom.renderTo(this._inputWrapperDom.node);

        // Event afterRender auslösen
        if (!superCall) {
            this.raiseEvent('afterRender');
        }
    }


    // overwrite
    unrender(superCall) {
        // Event auslösen.
        if (!superCall) {
            this.raiseEvent('unrender');
        }

        this._inputDom.unrender();
        super.unrender(true);
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
    destruct(superCall) {
        if (!superCall) {
            // unrendern
            this.unrender(superCall);

            // Event auslösen.
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
// kijs.gui.field.Text
// --------------------------------------------------------------
/**
 * EVENTS
 * ----------
 * blur
 * input
 *
 * // Geerbte Events
 * add
 * afterFirstRenderTo
 * afterRender
 * afterResize
 * beforeAdd
 * beforeRemove
 * changeVisibility
 * childElementAfterResize
 * dblClick
 * destruct
 * drag
 * dragEnd
 * dragLeave
 * dragOver
 * dragStart
 * drop
 * focus
 * mouseDown
 * mouseLeave
 * mouseMove
 * mouseUp
 * remove
 * wheel
 *
 * // key events
 * keyDown
 * enterPress
 * enterEscPress
 * escPress
 * spacePress
 */
kijs.gui.field.Text = class kijs_gui_field_Text extends kijs.gui.field.Field {

    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        this._inputDom = new kijs.gui.Dom({
            disableEscBubbeling: true,
            nodeTagName: 'input',
            nodeAttribute: {
                id: this._inputId
            }
        });

        this._trimValue = true;

        this._dom.clsAdd('kijs-field-text');

       // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            trimValue: true,             // Sollen Leerzeichen am Anfang und Ende des Values automatisch entfernt werden?
            placeholder: { target: 'placeholder' }
        });

        // Event-Weiterleitungen von this._inputDom
        this._eventForwardsAdd('blur', this._inputDom);
        this._eventForwardsAdd('change', this._inputDom);
        this._eventForwardsAdd('focus', this._inputDom);
        this._eventForwardsAdd('input', this._inputDom);

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
            config = Object.assign({}, this._defaultConfig, config);
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
        if (val || this._dom.clsHas('kijs-disabled')) {
            this._inputDom.nodeAttributeSet('disabled', true);
        } else {
            this._inputDom.nodeAttributeSet('disabled', false);
        }
    }

    // overwrite
    get isEmpty() { return kijs.isEmpty(this._inputDom.value); }

    get inputDom() { return this._inputDom; }

    get placeholder() { this._inputDom.nodeAttributeGet('placeholder'); }
    set placeholder(val) { this._inputDom.nodeAttributeSet('placeholder', val); }

    // overwrite
    get readOnly() { return super.readOnly; }
    set readOnly(val) {
        super.readOnly = !!val;
        if (val) {
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
        return val === null ? '' : val;
    }
    set value(val) {
        this._inputDom.nodeAttributeSet('value', val);
        this.validate();
    }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // overwrite
    render(superCall) {
        super.render(true);

        // Input rendern (kijs.guiDom)
        this._inputDom.renderTo(this._inputWrapperDom.node);

        // Event afterRender auslösen
        if (!superCall) {
            this.raiseEvent('afterRender');
        }
    }


    // overwrite
    unrender(superCall) {
        // Event auslösen.
        if (!superCall) {
            this.raiseEvent('unrender');
        }

        this._inputDom.unrender();
        super.unrender(true);
    }


    // LISTENERS
    _onInput(e) {
        this.validate();
    }


    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(superCall) {
        if (!superCall) {
            // unrendern
            this.unrender(superCall);

            // Event auslösen.
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

/* global kijs */

// --------------------------------------------------------------
// kijs.gui.grid.filter.Number
// --------------------------------------------------------------
/**
 * EVENTS
 * ----------
 *
 */
kijs.gui.grid.filter.Number = class kijs_gui_grid_filter_Number extends kijs.gui.grid.filter.Text {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        this._compare = 'equal';

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            placeholder: kijs.getText('Filtern') + '...'
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {

        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }
    }

    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------

    get filter() {
        return Object.assign(super.filter, {
            type: 'number',
            search: this._searchField.value,
            compare: this._compare
        });
    }

    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------

    // overwrite
    _getMenuButtons() {
        return kijs.Array.concat(this._getDefaultMenuButtons(), ['-',{
            name: 'btn_compare_equal',
            caption : kijs.getText('Gleich'),
            iconChar: '&#xf046', //  fa-check-square-o
            on: {
                click: this._onCompareBtnClick,
                context: this
            }
        },{
            name: 'btn_compare_unequal',
            caption : kijs.getText('Ungleich'),
            iconChar: '&#xf096', // fa-square-o
            on: {
                click: this._onCompareBtnClick,
                context: this
            },
        },{
            caption : kijs.getText('Kleiner als'),
            name: 'btn_compare_smaller',
            iconChar: '&#xf096', // fa-square-o
            on: {
                click: this._onCompareBtnClick,
                context: this
            }
        },{
            caption : kijs.getText('Grösser als'),
            name: 'btn_compare_bigger',
            iconChar: '&#xf096', // fa-square-o
            on: {
                click: this._onCompareBtnClick,
                context: this
            }
        }]);
    }

    _onCompareBtnClick(e) {
        this._menuButton.menuCloseAll();

        if (e.element.name === 'btn_compare_equal') {
            this._compare = 'equal';
        } else if (e.element.name === 'btn_compare_unequal') {
            this._compare = 'unequal';
        } else if (e.element.name === 'btn_compare_smaller') {
            this._compare = 'smaller';
        } else if (e.element.name === 'btn_compare_bigger') {
            this._compare = 'bigger';
        }

        kijs.Array.each(e.element.parent.elements, function(element) {
            if (element.name === e.element.name) {
                element.iconChar = '&#xf046';
            } else if (kijs.Array.contains(['btn_compare_equal', 'btn_compare_unequal', 'btn_compare_smaller', 'btn_compare_bigger'], element.name)) {
                element.iconChar = '&#xf096';
            }
        });
    }

};
/* global kijs, this, HTMLElement */

// --------------------------------------------------------------
// kijs.gui.FileUpload
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
kijs.gui.FileUpload = class kijs_gui_FileUpload extends kijs.gui.Window {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        this._fileUpload = null;   // intern
        this._uploads = [];          // intern
        this._autoClose = true;      // intern
        this._uploadRunning = true;  // intern

        this._dom.clsAdd('kijs-uploadwindow');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            caption: kijs.getText('Upload'),
            iconChar: '&#xf093',
            fileUpload: null,
            closable: false,
            maximizable: false,
            resizable: false,
            modal: true,
            width: 250,
            autoClose: true,
            innerStyle: {
                padding: '10px'
            },
            footerStyle: {
                padding: '10px'
            },
            footerElements:[
                {
                    xtype: 'kijs.gui.Button',
                    caption: 'OK',
                    isDefault: true,
                    on: {
                        click: function() {
                            if (this._uploadRunning !== true && this._dom.node) {
                                this.unrender();
                            }
                        },
                        context: this
                    }
                }
            ]
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            fileUpload: { target: 'fileUpload' },
            autoClose: true
        });

        // Listeners
        this.on('mouseDown', this._onMouseDown, this);

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }
    }


    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------

    get fileUpload() { return this._fileUpload; }
    set fileUpload(val) {
        // falls bereits verknüpft, events entfernen
        if (this._fileUpload instanceof kijs.FileUpload) {
            this._fileUpload.off(null, null, this);
        }

        this._fileUpload = val;
        if (kijs.isDefined(val)) {
            if (!(val instanceof kijs.FileUpload)) {
                throw new kijs.Error('fileUpload must be of type kijs.FileUpload');
            }

            this._fileUpload.on('startUpload', this._onStartUpload, this);
            this._fileUpload.on('failUpload', this._onFailUpload, this);
            this._fileUpload.on('upload', this._onUpload, this);
            this._fileUpload.on('endUpload', this._onEndUpload, this);
        }
    }

    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------

    /**
     * Zeigt das Fenster zur Dateiauswahl an.
     * @param {Boolean} multiple Dürfen mehrere Dateien ausgewählt werden?
     * @param {Boolean} directory Soll statt eine Datei ein Verzeichnis hochgeladen werden?
     * @returns {undefined}
     */
    showFileOpenDialog(multiple=null, directory=null) {
        if (!(this._fileUpload instanceof kijs.FileUpload)) {
            this._fileUpload = new kijs.FileUpload();
        }

        this._fileUpload.showFileOpenDialog(multiple, directory);
    }

    // PROTECTED
    _getUploadProgressBar(uploadId) {
        for (let i=0; i<this._uploads.length; i++) {
            if (this._uploads[i].uploadId === uploadId)  {
                return this._uploads[i].progressBar;
            }
        }
        return null;
    }

    _onStartUpload(ud, filename, filedir, filetype, uploadId) {
        let progressBar = new kijs.gui.ProgressBar({
            caption: kijs.String.htmlspecialchars(filename),
            fileUpload: this._fileUpload,
            fileUploadId: uploadId,
            style: {
                marginBottom: '10px'
            }
        });


        this._uploads.push({
            progressBar: progressBar,
            uploadId: uploadId
        });

        this.add(progressBar);

        if (!this._dom.node) {
            this.show();
        }

        this.center();

        // uploads laufen
        this._uploadRunning = true;
    }

    _onFailUpload(ud, filename, filetype) {
        this._autoClose = false;
    }

    _onUpload(ud, response, errorMsg, uploadId) {
        let pg = this._getUploadProgressBar(uploadId);
        if (errorMsg && pg) {
            this._autoClose = false;
            pg.bottomCaption = '<span class="error">' + kijs.String.htmlspecialchars(errorMsg) + '</span>';
        }
    }

    _onEndUpload() {
        // uploads fertig
        this._uploadRunning = false;
        if (this._autoClose) {
            kijs.defer(function() {
                if (this._dom.node) {
                    this.unrender();
                }
            }, 1000, this);
        }
    }


    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(superCall) {
        if (!superCall) {
            // unrender
            this.unrender(superCall);

            // Event auslösen.
            this.raiseEvent('destruct');
        }

        // Basisklasse auch entladen
        super.destruct(true);
    }
};
/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.field.CheckboxGroup
// --------------------------------------------------------------
kijs.gui.field.CheckboxGroup = class kijs_gui_field_CheckboxGroup extends kijs.gui.field.ListView {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        this._dom.clsRemove('kijs-field-listview');
        this._dom.clsAdd('kijs-field-checkboxgroup');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            showCheckBoxes: true,
            selectType: 'simple'
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            checkedAll: { target: 'checkedAll', prio: 1001 }
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }
    }

    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------

    // Alle Checkboxen ausgewähen / sind ausgewählt
    get checkedAll () { return this.value.length === this.data.length ? true : false; }
    set checkedAll (val) {
        let ids = [];

        if (val){
            kijs.Array.each(this.data, function(row) {
                ids.push(row.id);
            }, this);
            this.value = ids;
        } else {
            this.value = [];
        }
    }

    // Checkboxen die ausgewählt werden sollen / sind
    // TODO: unterschied zu value?
    get checkedValues () { return this.value.length ? this.value : []; }
    set checkedValues (val) {
        let value = this.value;

        if (!kijs.isArray(val)){
            val = [val];
        }
        kijs.Array.each(val, function(v){
            if (kijs.Array.contains(value, v)){
                kijs.Array.remove(value, v);
            } else {
                value.push(v);
            }

        }, this);

        this.value = value;
    }
};

/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.field.Number
// --------------------------------------------------------------
/**
 * EVENTS
 * ----------
 *
 * // Geerbte Events
 * add
 * afterFirstRenderTo
 * afterRender
 * afterResize
 * beforeAdd
 * beforeRemove
 * blur
 * changeVisibility
 * childElementAfterResize
 * dblClick
 * destruct
 * drag
 * dragEnd
 * dragLeave
 * dragOver
 * dragStart
 * drop
 * focus
 * input
 * mouseDown
 * mouseLeave
 * mouseMove
 * mouseUp
 * remove
 * wheel
 *
 * // key events
 * keyDown
 * enterPress
 * enterEscPress
 * escPress
 * spacePress
 */
kijs.gui.field.Number = class kijs_gui_field_Number extends kijs.gui.field.Text {

    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        this._dom.clsAdd('kijs-field-number');

        // config
        this._allowDecimals = false;
        this._alwaysDisplayDecimals = false;
        this._decimalPrecision = 2;
        this._decimalSeparator = '.';
        this._minValue = null;
        this._maxValue = null;
        this._thousandsSeparator = '';


        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });

       // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            allowDecimals: true,
            alwaysDisplayDecimals: true,
            decimalPrecision: { target: 'decimalPrecision'},
            decimalSeparator: true,
            minValue: { target: 'minValue'},
            maxValue: { target: 'maxValue'},
            thousandsSeparator: true
        });

        // Listeners
        this.on('blur', this._onBlur, this);

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }
    }


    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------

    get allowDecimals() { return this._allowDecimals; }
    set allowDecimals(val) { this._allowDecimals = !!val; }

    get alwaysDisplayDecimals() { return this._alwaysDisplayDecimals; }
    set alwaysDisplayDecimals(val) { this._alwaysDisplayDecimals = !!val; }

    get decimalPrecision() { return this._decimalPrecision; }
    set decimalPrecision(val) { this._decimalPrecision = kijs.isNumeric(val) ? parseInt(val) : 2; }

    get maxValue() { return this._maxValue; }
    set maxValue(val) { this._maxValue = val === null ? null : parseFloat(val); }

    get minValue() { return this._minValue; }
    set minValue(val) { this._minValue = val === null ? null : parseFloat(val); }

    get value() {
        let val=super.value, nr=null;
        if (val !== null) {
            nr = kijs.Number.parse(val, this._decimalPrecision, this._decimalSeparator, this._thousandsSeparator);
        }
        return nr !== null ? nr : val;
    }
    set value(val) {
        if (!kijs.isNumber(val) && kijs.isString(val)) {
            val = kijs.Number.parse(val, this._decimalPrecision, this._decimalSeparator, this._thousandsSeparator);
        }
        if (kijs.isNumber(val)) {
            super.value = kijs.Number.format(val, (this._alwaysDisplayDecimals ? this._decimalPrecision : null), this._decimalSeparator, this._thousandsSeparator);

        } else if (val === null) {
            super.value = '';

        } else {
            super.value = val;
        }
    }

    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------

    _validationRules(originalValue) {
        super._validationRules(originalValue);

        let value = kijs.toString(originalValue);
        if (value.trim() !== '') {

            // Zahl parsen
            if (this._thousandsSeparator !== '') {
                value = kijs.String.replaceAll(value, this._thousandsSeparator, '');
            }
            if (this._decimalSeparator !== '.' && this._decimalSeparator !== '') {
                 value = kijs.String.replaceAll(value, this._decimalSeparator, '.');
            }
            value = value.replace(/[^\-0-9\.]/, '');

            if (this._allowDecimals) {
                value = window.parseFloat(value);
            } else {
                value = window.parseInt(value);
            }

            if (window.isNaN(value)) {
                this._errors.push(kijs.getText('%1 ist keine gültige Nummer', '', originalValue));

            } else {

                // Min. value
                if (this._minValue !== null && value < this._minValue) {
                    this._errors.push(kijs.getText('Der minimale Wert für dieses Feld ist %1', '', this._minValue));
                }

                // Max. value
                if (this._maxValue !== null && value > this._maxValue) {
                    this._errors.push(kijs.getText('Der maximale Wert für dieses Feld ist %1', '', this._maxValue));
                }
            }
        }
    }

    // EVENTS
    _onBlur() {
        // Beim verlassen des Feldes zahl auf eingestelltes Format ändern.
        let val = this.value;
        if (super.value !== val) {
            this.value = val;
        }
    }

    // overwrite
    render(superCall) {
        super.render(true);

        // Event afterRender auslösen
        if (!superCall) {
            this.raiseEvent('afterRender');
        }
    }


    // overwrite
    unrender(superCall) {
        // Event auslösen.
        if (!superCall) {
            this.raiseEvent('unrender');
        }

        super.unrender(true);
    }



    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(superCall) {
        if (!superCall) {
            // unrendern
            this.unrender(superCall);

            // Event auslösen.
            this.raiseEvent('destruct');
        }

        // Basisklasse entladen
        super.destruct(true);
    }
};

/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.field.OptionGroup
// --------------------------------------------------------------
kijs.gui.field.OptionGroup = class kijs_gui_field_OptionGroup extends kijs.gui.field.ListView {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        this._dom.clsRemove('kijs-field-listview');
        this._dom.clsAdd('kijs-field-optiongroup');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            showCheckBoxes: true,
            selectType: 'single'
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }
    }
};
/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.field.Range
// --------------------------------------------------------------
/**
 * EVENTS
 * ----------
 * blur
 * input
 *
 * // Geerbte Events
 * add
 * afterFirstRenderTo
 * afterRender
 * afterResize
 * beforeAdd
 * beforeRemove
 * changeVisibility
 * childElementAfterResize
 * dblClick
 * destruct
 * drag
 * dragEnd
 * dragLeave
 * dragOver
 * dragStart
 * drop
 * focus
 * mouseDown
 * mouseLeave
 * mouseMove
 * mouseUp
 * remove
 * wheel
 *
 * // key events
 * keyDown
 * enterPress
 * enterEscPress
 * escPress
 * spacePress
 */
kijs.gui.field.Range = class kijs_gui_field_Range extends kijs.gui.field.Text {

    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        this._inputDom.nodeAttributeSet('type', 'range');
        this._dom.clsRemove('kijs-field-text');
        this._dom.clsAdd('kijs-field-range');

       // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            min: { target: 'min' },
            max: { target: 'max' },
            step: { target: 'step' }
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }
    }


    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------

    // overwrite
    get isEmpty() { return false; }

    set min(val) { this._inputDom.nodeAttributeSet('min', val); }
    get min() { return this._inputDom.nodeAttributeGet('min'); }

    set max(val) { this._inputDom.nodeAttributeSet('max', val); }
    get max() { return this._inputDom.nodeAttributeGet('max'); }

    set step(val) { this._inputDom.nodeAttributeSet('step', val); }
    get step() { return this._inputDom.nodeAttributeGet('step'); }

    // overwrite
    // 'range' kennt das HTML-Attribut readOnly nicht,
    // darum disabled benutzen.
    get readOnly() { return super.readOnly; }
    set readOnly(val) {
        super.readOnly = !!val;
        if (val) {
            this._inputDom.nodeAttributeSet('disabled', true);
        } else {
            this._inputDom.nodeAttributeSet('disabled', false);
        }
    }
};

/* global kijs, this, HTMLElement */

// --------------------------------------------------------------
// kijs.gui.grid.columnWindow
// --------------------------------------------------------------


// --------------------------------------------------------------
kijs.gui.grid.columnWindow = class kijs_gui_grid_columnWindow extends kijs.gui.Window {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);


        this._dom.clsAdd('kijs-columnwindow');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            caption: 'Spalten',
            iconChar: '&#xf0db', // fa-columns
            closable: true,
            maximizable: false,
            autoScroll: true,
            resizable: false,
            modal: true,
            width: 200,

            innerStyle: {
                padding: '10px'
            },
            footerStyle: {
                padding: '10px'
            },
            footerElements:[
                {
                    xtype: 'kijs.gui.Button',
                    caption: 'OK',
                    isDefault: true,
                    on: {
                        click: this._onOkClick,
                        context: this
                    }
                }
            ]
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {

        });


        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }
    }


    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------

    get grid() { return this.parent.header.grid; }

    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------

    show() {
        let data = [];
        let values = [];
        kijs.Array.each(this.grid.columnConfigs, function(columnConfig) {
            data.push({valueField: columnConfig.valueField, caption: columnConfig.caption });
            if (columnConfig.visible) {
                values.push(columnConfig.valueField);
            }
        }, this);

        this.add({
            xtype: 'kijs.gui.field.CheckboxGroup',
            name: 'fields',
            valueField: 'valueField',
            captionField: 'caption',
            data: data,
            value: values,
            ddSort: true
        });

        this.down('fields').on('ddOver', this._onDdOver, this);
        this.down('fields').on('change', this._onCheckChange, this);

        // anzeigen
        super.show();
    }

    // EVENTS
    _onOkClick() {
        let flds = this.down('fields').value;

        // Sichtbarkeit übernehmen
        kijs.Array.each(this.grid.columnConfigs, function(columnConfig) {
            columnConfig.visible = kijs.Array.contains(flds, columnConfig.valueField);
        }, this);

        // Sortierung übernehmen
        let elements = this.down('fields').elements;
        for (let i=0; i<elements.length; i++) {
            let vF = elements[i].dataRow.valueField;

            // columnConfig Suchen und Position schreiben
            let columnConfig = this.grid.getColumnConfigByValueField(vF);
            if (columnConfig) {
                columnConfig.position = i;
            }
        }

        // Fenster schliessen
        this.destruct();
    }

    _onDdOver(e) {
        const vF = e.sourceElement ? e.sourceElement.dataRow.valueField : null;

        // columnConfig Suchen und prüfen ob sortierbar
        let columnConfig = this.grid.getColumnConfigByValueField(vF);
        let allowDd = columnConfig ? columnConfig.sortable : false;

        return allowDd;
    }

    _onCheckChange(e) {
        let unchecked = kijs.Array.diff(e.oldValue, e.value);

        kijs.Array.each(unchecked, function(valueField) {
            let columnConfig = this.grid.getColumnConfigByValueField(valueField);

            // uncheck verhindern, hacken wieder setzen
            if (!columnConfig.hideable) {
                kijs.defer(function() {
                    let flds = this.down('fields').value;
                    flds.push(valueField);
                    this.down('fields').value = flds;
                },20, this);
            }

        }, this);
    }

    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(superCall) {
        if (!superCall) {
            // unrender
            this.unrender(superCall);

            // Event auslösen.
            this.raiseEvent('destruct');
        }

        // Basisklasse auch entladen
        super.destruct(true);
    }
};
/* global kijs */

// --------------------------------------------------------------
// kijs.gui.grid.filter.Date
// --------------------------------------------------------------
/**
 * EVENTS
 * ----------
 *
 */
kijs.gui.grid.filter.Date = class kijs_gui_grid_filter_Date extends kijs.gui.grid.filter.Number {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {

        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }
    }

    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------

    get filter() {
        return Object.assign(super.filter, {
            type: 'date'
        });
    }

};
/* global kijs */

// --------------------------------------------------------------
// kijs.Error
// --------------------------------------------------------------
kijs.Error = class kijs_Error extends Error {

    // overwrite
    constructor(message, fileName, lineNumber) {
        super(message, fileName, lineNumber);
    }
};
// --------------------------------------------------------------
// Internet Explorer 11 murgs
// --------------------------------------------------------------

// Erstellt die Funktion Object.assign für den IE 11
if (typeof Object.assign !== 'function') {
  // Must be writable: true, enumerable: false, configurable: true
  Object.defineProperty(Object, "assign", {
    value: function assign(target, varArgs) { // .length of function is 2
      'use strict';
      if (target === null) { // TypeError if undefined or null
        throw new TypeError('Cannot convert undefined or null to object');
      }

      var to = Object(target);

      for (var index = 1; index < arguments.length; index++) {
        var nextSource = arguments[index];

        if (nextSource !== null) { // Skip over if undefined or null
          for (var nextKey in nextSource) {
            // Avoid bugs when hasOwnProperty is shadowed
            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
              to[nextKey] = nextSource[nextKey];
            }
          }
        }
      }
      return to;
    },
    writable: true,
    configurable: true
  });
}
