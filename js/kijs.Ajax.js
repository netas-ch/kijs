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