/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.Rpc
// --------------------------------------------------------------
// Erweiterung von kijs.Rpc, der die Meldungsfenster anzeigt
kijs.gui.Rpc = class kijs_gui_Rpc extends kijs.Rpc {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);
        
        this._defaultCornerTipIcon = 'info';
        this._defaultCornerTipTitle = kijs.getText('Info');
        this._defaultErrorTitle = kijs.getText('Fehler');
        this._defaultInfoTitle = kijs.getText('Info');
        this._defaultWarningTitle = kijs.getText('Warnung');
        
        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });
        
        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            defaultCornerTipIcon: true,
            defaultCornerTipTitle: true,
            defaultErrorTitle: true,
            defaultInfoTitle: true,
            defaultWarningTitle: true
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config);
        }
    }


    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get defaultCornerTipIcon() { return this._defaultCornerTipIcon; }
    set defaultCornerTipIcon(val) { this._defaultCornerTipIcon = val; }

    get defaultCornerTipTitle() { return this._defaultCornerTipTitle; }
    set defaultCornerTipTitle(val) { this._defaultCornerTipTitle = val; }

    get defaultErrorTitle() { return this._defaultErrorTitle; }
    set defaultErrorTitle(val) { this._defaultErrorTitle = val; }

    get defaultInfoTitle() { return this._defaultInfoTitle; }
    set defaultInfoTitle(val) { this._defaultInfoTitle = val; }

    get defaultWarningTitle() { return this._defaultWarningTitle; }
    set defaultWarningTitle(val) { this._defaultWarningTitle = val; }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    /**
     * Führt einen RPC aus
     * - Wird eine fn übergeben, wird diese bei erhalt der Antwort ausgeführt (auch im Fehlerfall).
     *   Die Rückgabe der Funktion ist dann immer Null.
     * - Es wird ein Promise zurückgegeben. Bei diesem wird immer (auch im Fehlerfall) resolve ausgeführt.
     * - Um festzustellen, ob es einen Fehler gegeben hat können errorType und errorMsg abgefragen
     *   werden.
     * - Es gibt folgende errorTypes:
     *    - 'errorNotice'   Es wurde eine errorMsg vom Server zurückgegeben mit errorType='errorNotice' 
     *                      oder ohne errorType (dann wird der errorType automatisch auf 'errorNotice' 
     *                      gesetzt. 
     *    - 'error'         Es wurde eine errorMsg vom Server zurückgegeben mit errorType='error'.
     *    - 'warning'       Es wurde vom Server eine warningMsg zurückgegeben und der Benutzer 
     *                      hat auf Abbrechen geklickt.
     *   Es können auch eigene errorTypes verwendet werden.
     * 
     * @param {Object} config   onfig-Objekt mit folgenden Eingenschaften
     *     {String} facadeFn         Modul/Facaden-name und Methodenname Bsp: 'address.save'
     *     {Mixed} data              Argumente/Daten, die an die Server-RPC Funktion übergeben werden.
     *     {Object} [owner]          Verweis auf das Aufzurufende Element oder eine ID, die das Element eindeutig identifiziert.
     *                               Wird verwendet um bei cancelRunningRpcs den Eigentümmer zu identifizieren.
     *     {Function} fn             Callback-Funktion
     *     {Object} context          Kontext für die Callback-Funktion
     *     {Boolean} [cancelRunningRpcs=false] Bei true, werden alle laufenden Requests vom selben owner an dieselbe facadeFn abgebrochen
     *     {kijs.gui.BoxElement|HTMLElement} [waitMaskTarget=document.body]  Ziel-BoxElement oder Ziel-Node
     *                                                                       für Lademaske, NULL=document.body, 'none' für keine Maske.
     *     {String} [waitMaskTargetDomProperty='dom']        Name der DOM-Eigenschaft in der die Lademaske
     *                                                       angezeigt werden soll.
     *     {Boolean} [ignoreWarnings=false]  Sollen Warnungen ignoriert werden?
     * @returns {Promise}
     */
    // overwrite (Vorsicht andere Argumente!)
    do(config) {
        // Validierung
        if (!kijs.isObject(config)) {
            throw new kijs.Error('RPC call without config object');
        }

        return new Promise((resolve) => {
            this._doRpc(config, resolve);
        });
    }
    
    
    // PROTECTED
    _doRpc(config, resolve) {
        // Lademaske anzeigen
        let waitMask;
        if (config.waitMaskTarget === 'none') {
            waitMask = null;
        } else if (config.waitMaskTarget instanceof kijs.gui.Element) {
            waitMask = config.waitMaskTarget.waitMaskAdd();
        } else {
            waitMask = new kijs.gui.Mask({
                displayWaitIcon: true,
                target: config.waitMaskTarget,
                targetDomProperty: config.waitMaskTargetDomProperty
            });
            waitMask.show();
        }
        
        // RPC
        super.do({
            facadeFn: config.facadeFn,
            requestData: config.data,
            owner: config.owner,
            cancelRunningRpcs: config.cancelRunningRpcs,
            rpcParams: {ignoreWarnings: !!config.ignoreWarnings},
            responseArgs: {waitMask: waitMask},
            context: this,
            fn: function(rpcData) {
                // Lademaske entfernen
                if (rpcData.request.responseArgs && rpcData.request.responseArgs.waitMask) {
                    if (rpcData.request.responseArgs.waitMask.target instanceof kijs.gui.Element) {
                        rpcData.request.responseArgs.waitMask.target.waitMaskRemove();
                    } else {
                        rpcData.request.responseArgs.waitMask.destruct();
                    }
                }

                if (!rpcData.response.canceled) {
                    // Fehler --> FehlerMsg + Abbruch
                    // rpcData.response.errorMsg (String oder Array mit Strings, die mit Aufzählungszeichen angezeigt werden)
                    if (!kijs.isEmpty(rpcData.response.errorType) || !kijs.isEmpty(rpcData.response.errorMsg)) {
                        // Standard errorType
                        if (kijs.isEmpty(rpcData.response.errorType)) {
                            rpcData.response.errorType = this._defaultErrorType;
                        }
                        
                        // Standard errorTitle
                        if (kijs.isEmpty(rpcData.response.errorTitle)) {
                            rpcData.response.errorTitle = this._defaultErrorTitle;
                        }
                        
                        // Fehler anzeigen
                        if (rpcData.response.errorType === 'error') {
                            kijs.gui.MsgBox.error(rpcData.response.errorTitle, rpcData.response.errorMsg);
                        } else {
                            kijs.gui.MsgBox.errorNotice(rpcData.response.errorTitle, rpcData.response.errorMsg);
                        }

                    // Warning --> WarnungMsg mit OK, Cancel. Bei Ok wird der gleiche request nochmal gesendet mit dem Flag ignoreWarnings
                    // rpcData.response.warningMsg (String oder Array mit Strings, die mit Aufzählungszeichen angezeigt werden)
                    } else if (!kijs.isEmpty(rpcData.response.warningMsg)) {
                        // Standard warningTitle
                        if (kijs.isEmpty(rpcData.response.warningTitle)) {
                            rpcData.response.warningTitle = this._defaultWarningTitle;
                        }
                        
                        // Warnung anzeigen
                        kijs.gui.MsgBox.warning(rpcData.response.warningTitle, rpcData.response.warningMsg, function(e) {
                            // click auf Ok
                            if (e.btn === 'ok') {
                                // Request nochmal senden mit Flag ignoreWarnings
                                this._doRpc({
                                    facadeFn: config.facadeFn,
                                    data: config.data,
                                    owner: config.owner,
                                    fn: config.fn,
                                    context: config.context,
                                    cancelRunningRpcs: config.cancelRunningRpcs,
                                    waitMaskTarget: config.waitMaskTarget,
                                    waitMaskTargetDomProperty: config.waitMaskTargetDomProperty,
                                    ignoreWarnings: true
                                }, resolve);
                                
                            // click auf Abbrechen
                            } else {
                                // errorType ist fix 'warning'
                                rpcData.response.errorType = 'warning';
                                
                                // Argument vorbereiten
                                const e = {
                                    responseData: rpcData.response.responseData,
                                    requestData: rpcData.request.requestData,
                                    errorType: rpcData.response.errorType,
                                    errorMsg: rpcData.response.errorMsg
                                };

                                // callback-fn ausführen
                                if (kijs.isFunction(config.fn)) {
                                    config.fn.call(config.context || this, e);
                                }
                                
                                // Promise auslösen
                                resolve(e);
                            }
                        }, this);
                        
                        return;
                    }

                    // Info --> Msg ohne Icon
                    // rpcData.response.infoMsg (String oder Array mit Strings, die mit Aufzählungszeichen angezeigt werden)
                    if (!kijs.isEmpty(rpcData.response.infoMsg)) {
                        // Standard infoTitle
                        if (kijs.isEmpty(rpcData.response.infoTitle)) {
                            rpcData.response.infoTitle = this._defaultInfoTitle;
                        }
                        kijs.gui.MsgBox.info(rpcData.response.infoTitle, rpcData.response.infoMsg);
                    }

                    // CornerTip -> Msg, die automatisch wieder verschwindet kein Abbruch
                    // rpcData.response.tipMsg (String oder Array mit Strings, die mit Aufzählungszeichen angezeigt werden)
                    if (rpcData.response.cornerTipMsg) {
                        // Standard cornerTipIcon
                        if (kijs.isEmpty(rpcData.response.cornerTipIcon)) {
                            rpcData.response.cornerTipIcon = this._defaultCornerTipIcon;
                        }
                        
                        // Standard cornerTipTitle
                        if (kijs.isEmpty(rpcData.response.cornerTipTitle)) {
                            rpcData.response.cornerTipTitle = this._defaultCornerTipTitle;
                        }
                        
                        kijs.gui.CornerTipContainer.show(rpcData.response.cornerTipTitle, 
                                rpcData.response.cornerTipMsg, rpcData.response.cornerTipIcon);
                    }

                    // Argument vorbereiten
                    const e = {
                        responseData: rpcData.response.responseData,
                        requestData: rpcData.request.requestData,
                        errorType: rpcData.response.errorType,
                        errorMsg: rpcData.response.errorMsg
                    };

                    // callback-fn ausführen
                    if (kijs.isFunction(config.fn)) {
                        config.fn.call(config.context || this, e);
                    }
                    
                    // Promise auslösen
                    resolve(e);
                }
            }
        });
    }

};
