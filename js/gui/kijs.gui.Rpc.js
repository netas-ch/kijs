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
     * - Wird eine fn übergeben, wird diese bei erhalt der Antwort ausgeführt, auch im Fehlerfall.
     *   Die Rückgabe der Funktion ist dann immer Null.
     * - Wird KEINE fn übergeben, so wird ein Promise zurückgegeben. Im Fehlerfall wird unterschieden zwischen zwei errorType:
     *   - 'errorNotice' (default): Es wird resolve ausgeführt. Die errorMsg befindet sich dann unter e.errorMsg.
     *   - 'error':                 Es wird reject ausgeführt mit einem Error Objekt als Argument.

     * 
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
     *                                                          angezeigt werden soll.
     *     {Boolean} [ignoreWarnings=false]  Sollen Warnungen ignoriert werden?
     * @returns {Promise}
     */
    // overwrite (Vorsicht andere Argumente!)
    do(config) {
        // Validierung
        if (!kijs.isObject(config)) {
            throw new kijs.Error('RPC call without config object');
        }

        let ret = null;
        if (kijs.isFunction(config.fn)) {
            this._doRpc(config, null, null);
        } else {
            ret = new Promise((resolve, reject) => {
                this._doRpc(config, resolve, reject);
            });
        }
        
        return ret;
    }
    
    
    // PROTECTED
    _doRpc(config, resolve, reject) {
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
                    if (rpcData.response.errorMsg) {
                        let errorTitle = rpcData.response.errorTitle;
                        if (rpcData.response.errorType === 'error') {
                            errorTitle = kijs.isEmpty(errorTitle) ? kijs.getText('Unerwarteter Fehler'): errorTitle;
                            kijs.gui.MsgBox.error(errorTitle, rpcData.response.errorMsg);
                        } else {
                            errorTitle = kijs.isEmpty(errorTitle) ? kijs.getText('Fehler'): errorTitle;
                            kijs.gui.MsgBox.errorNotice(errorTitle, rpcData.response.errorMsg);
                        }
                    }

                    // Warning --> WarnungMsg mit OK, Cancel. Bei Ok wird der gleiche request nochmal gesendet mit dem Flag ignoreWarnings
                    // rpcData.response.warningMsg (String oder Array mit Strings, die mit Aufzählungszeichen angezeigt werden)
                    if (rpcData.response.warningMsg) {
                        let warningTitle = rpcData.response.warningTitle;
                        warningTitle = kijs.isEmpty(warningTitle) ? kijs.getText('Warnung'): warningTitle;
                        kijs.gui.MsgBox.warning(warningTitle, rpcData.response.warningMsg, function(e) {
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
                                }, resolve, reject);
                            }
                        }, this);

                        // promise nicht auslösen
                        rpcData.request.promiseResolve = null;
                        rpcData.request.promiseReject = null;

                        return;
                    }

                    // Info --> Msg ohne Icon kein Abbruch
                    // rpcData.response.infoMsg (String oder Array mit Strings, die mit Aufzählungszeichen angezeigt werden)
                    if (rpcData.response.infoMsg) {
                        let infoTitle = rpcData.response.infoTitle;
                        infoTitle = kijs.isEmpty(infoTitle) ? kijs.getText('Info'): infoTitle;
                        kijs.gui.MsgBox.info(infoTitle, rpcData.response.infoMsg);
                    }

                    // CornerTip -> Msg, die automatisch wieder verschwindet kein Abbruch
                    // rpcData.response.tipMsg (String oder Array mit Strings, die mit Aufzählungszeichen angezeigt werden)
                    if (rpcData.response.cornerTipMsg) {
                        let tipTitle = rpcData.response.cornerTipTitle;
                        tipTitle = kijs.isEmpty(tipTitle) ? kijs.getText('Info'): tipTitle;
                        kijs.gui.CornerTipContainer.show(tipTitle, rpcData.response.cornerTipMsg, 'info');
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

                    // Promise auslösen
                    } else {
                        if (e.errorMsg && e.errorType === 'error') {
                            reject( new Error(e.errorMsg) );
                        } else {
                            resolve(e);
                        }

                    }
                }
            }
        });
    }

};
