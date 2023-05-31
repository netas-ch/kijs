/* global kijs, this */

// --------------------------------------------------------------
// kijs.Rpc
// --------------------------------------------------------------
kijs.Rpc = class kijs_Rpc {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        this._defaultConfig = {};
        
        this._url = '.';                    // URL Beispiel: '.' oder 'index.php'
        this._parameters = {};              // Objekt mit optionalem GET-Parametern
        this._defaultErrorType = 'errorNotice';
        this._defer = 10;
        this._timeout = 0;

        this._deferId = null;
        this._tid = 0;

        this._queue = [];
        
        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });
        
        // Mapping für die Zuweisung der Config-Eigenschaften
        this._configMap = {
            defaultErrorType: true, // Standard errorType, wenn eine errorMsg vorhanden ist ohne errorType
            defer: true,        // millisekunden, in denen auf weitere RPC gewartet wird
            timeout: true,      // millisekunden, nach denen der RPC abgebrochen wird
            url: true,          // server URL
            parameters: true    // optionale GET-Parameter
        };

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
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
    get defaultErrorType() { return this._defaultErrorType; }
    set defaultErrorType(val) { this._defaultErrorType = val; }
    
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
     * - Wird eine fn übergeben, wird diese bei erhalt der Antwort ausgeführt (auch im Fehlerfall).
     *   Die Rückgabe der Funktion ist dann immer Null.
     * - Es wird ein Promise zurückgegeben. Bei diesem wird immer (auch im Fehlerfall) resolve ausgeführt.
     * - Um festzustellen, ob es einen Fehler gegeben hat können errorType und errorMsg abgefragen
     *   werden.
     * 
     * @param {Object} config   onfig-Objekt mit folgenden Eingenschaften
     *     {String} facadeFn                     Modul/Facaden-name und Methodenname Bsp: 'address.save'
     *     {Mixed} requestData                   Argumente/Daten, die an die Server-RPC Funktion übergeben werden.
     *     {Object} [owner]                      Verweis auf das Aufzurufende Element oder eine ID, 
     *                                           die das Element eindeutig identifiziert.
     *                                           Wird verwendet um bei cancelRunningRpcs den Eigentümmer zu identifizieren.
     *     {Function} [fn]                       Callback-Funktion
     *     {Object} [context]                    Kontext für die Callback-Funktion
     *     {Boolean} [cancelRunningRpcs=false]   Bei true, werden alle laufenden Requests vom selben owner an dieselbe facadeFn abgebrochen
     *     {Object} [rpcParams]                  Hier können weitere Argumente, zum Datenverkehr (z.B. ignoreWarnings)
     *     {Mixed} [responseArgs]                Hier können Daten übergeben werden,
     *                                           die in der Callback-Fn dann wieder zur Verfügung stehen.
     *                                           z.B. die loadMask, damit sie in der Callback-fn wieder entfernt 
     *                                           werden kann.
     * @returns {Promise|Null}
     */
    do(config) {
        // Validierung / Pflichtfelder
        if (!kijs.isObject(config)) {
            throw new kijs.Error('RPC call without config object');
        }
        if (!config.facadeFn) {
            throw new kijs.Error('RPC call without facade function');
        }

        if (this._deferId) {
            clearTimeout(this._deferId);
        }

        // Evtl. bestehende RPCs vom gleichen owner an die gleiche facadeFn abbrechen
        // Der  owner ist wichtig, weil z.B. mehrere Combos in einem Formular existieren, 
        // die die gleiche facadeFn benutzen. 
        if (config.cancelRunningRpcs) {
            for (let i=0; i<this._queue.length; i++) {
                if (this._queue[i].owner === config.owner && this._queue[i].facadeFn === config.facadeFn) {
                    switch (this._queue[i].state) {
                        case 1: // queue
                            this._queue[i].state = kijs.Rpc.states.CANCELED_BEFORE_TRANSMIT;
                            this._receive({
                                response: [ { tid: this._queue[i].tid } ], 
                                request: { postData:[this._queue[i]] }
                            });
                            break;

                        case 2: // transmitted
                            this._queue[i].state = kijs.Rpc.states.CANCELED_AFTER_TRANSMIT;
                            break;
                    }
                }
            }
        }
        
        const queueEl = {
            facadeFn: config.facadeFn,
            requestData: config.requestData,
            type: 'rpc',
            tid: this._createTid(),
            owner: config.owner,
            fn: config.fn,
            context: config.context,
            rpcParams: config.rpcParams,
            responseArgs: config.responseArgs,
            state: kijs.Rpc.states.QUEUE
        };
        
        let ret = new Promise((resolve) => {
            queueEl.promiseResolve = resolve;
        });
        
        this._queue.push(queueEl);

        this._deferId = kijs.defer(this._transmit, this.defer, this);
        
        return ret;
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
     * @param {Object} ajaxData Objekt mit folgenden Eigenschaften
     *     {Array} response Array mit den Antworten (subResponses) auf die einzelnen subRequests
     *     {Object} request Request der gesendet wurde
     *     {String} errorMsg Falls ein übertragungsfehler vorliegt, wird hier der Fehlertext übergeben
     * @returns {undefined}
     */
   _receive(ajaxData) {
        // Antworten für die einzelnen Requests durchgehen
        for (let i=0; i<ajaxData.request.postData.length; i++) {
            let subResponse = kijs.isArray(ajaxData.response) ? ajaxData.response[i] : null;

            // Passenden subRequest aus Queue holen
            let subRequest = this._getByTid(ajaxData.request.postData[i].tid);

            if (!kijs.isObject(subResponse)) {
                subResponse = {
                    errorMsg: 'RPC response in wrong format'
                };
            }

            // Behandlung von Übertragungsfehlern
            if (ajaxData.errorMsg) {
                subResponse.errorMsg = ajaxData.errorMsg;
            } else if (!subResponse.errorMsg && subResponse.tid !== subRequest.tid) {
                subResponse.errorMsg = 'The RPC response does not match the request';
            }

            // Abbruch durch neueren Request?
            if (subRequest.state === kijs.Rpc.states.CANCELED_BEFORE_TRANSMIT ||
                    subRequest.state === kijs.Rpc.states.CANCELED_AFTER_TRANSMIT) {
                subResponse.errorType = 'cancel';
                //subResponse.canceled = true;
            }

            // Transfer-ID aus der Queue entfernen
            this._removeTid(subRequest.tid);
            
            
            //if (!subResponse.canceled) {
                // Standard errorType
                if (!kijs.isEmpty(subResponse.errorMsg) && kijs.isEmpty(subResponse.errorType)) {
                    subResponse.errorType = this._defaultErrorType;
                }
                
                // Argument vorbereiten
                const e = {
                    response: subResponse,
                    request: subRequest,
                    errorType: subResponse.errorType,
                    errorMsg: subResponse.errorMsg
                };
                
                // callback-fn ausführen
                if (kijs.isFunction(subRequest.fn)) {
                    subRequest.fn.call(subRequest.context || this, e);
                }
                
                // Promise auslösen
                if (subRequest.promiseResolve) {
                    subRequest.promiseResolve(e);
                }
            //}
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
        // timer abbrechen
        if (this._deferId) {
            clearTimeout(this._deferId);
            this._deferId = null;
        }

        // Variablen
        this._parameters = null;
        this._queue = null;
    }
};
