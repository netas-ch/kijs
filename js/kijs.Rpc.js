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
                            this._queue[i].state = 3; // canceled before transmit
                            this._receive([{tid: this._queue[i].tid}], {postData:[this._queue[i]]});
                            break;

                        case 2: // transmitted
                            this._queue[i].state = 4; // canceled after transmit
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
            state: 1 // queue
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
            if (subRequest.state === 3 || subRequest.state === 4) {
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
            if (this._queue[i].state === 1) {
                const subRequest = kijs.isObject(this._queue[i].rpcParams) ? this._queue[i].rpcParams : {};
                subRequest.facadeFn = this._queue[i].facadeFn;
                subRequest.data = this._queue[i].data;
                subRequest.type = this._queue[i].type;
                subRequest.tid = this._queue[i].tid;
                
                transmitData.push(subRequest);
                this._queue[i].state = 2; // transmitted
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