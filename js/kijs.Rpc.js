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