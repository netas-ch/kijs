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
                    error = kijs.getText('Der Server hat mit einem Fehler geantwortet:') + ' ' + xmlhttp.statusText + ' (Code ' + xmlhttp.status + ')';

                } else if (config.abortHappened) {
                    error = kijs.getText('Die Verbindung wurde abgebrochen.');

                } else if (config.timeoutHappened) {
                    error = kijs.getText('Der Server brauchte zu lange, um eine Antwort zu senden.') + ' ' +
                            kijs.getText('Die Verbindung wurde abgebrochen.');

                } else {
                    error = kijs.getText('Die Verbindung konnte nicht aufgebaut werden.');
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