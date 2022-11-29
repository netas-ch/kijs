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
     * @param {Object} config   onfig-Objekt mit folgenden Eingenschaften
     *     {String} facadeFn         Modul/Facaden-name und Methodenname Bsp: 'address.save'
     *     {Mixed} data              Argumente/Daten, die an die Server-RPC Funktion übergeben werden.
     *     {Function} fn             Callback-Funktion
     *     {Object} context          Kontext für die Callback-Funktion
     *     {Boolean} [cancelRunningRpcs=false] Bei true, werden alle laufenden Requests an die selbe facadeFn abgebrochen
     *     {kijs.gui.BoxElement|HTMLElement} [waitMaskTarget=document.body]  Ziel-BoxElement oder Ziel-Node
     *                                                                          für Lademaske, NULL=document.body, 'none' für keine Maske.
     *     {String} [waitMaskTargetDomProperty='dom']        Name der DOM-Eigenschaft in der die Lademaske
     *                                                          angezeigt werden soll.
     *     {Boolean} [ignoreWarnings=false]  Sollen Warnungen ignoriert werden?
     *     {Function} [fnBeforeMessages]     Callback-Funktion, die vor der Ausgabe von Meldungsfenstern ausgeführt wird.
     *                                          Wird z.B. verwendet um bei Formularen die Fehler bei den einzelnen Feldern
     *                                          anzuzeigen.
     * @returns {Promise}
     */
    // overwrite (Vorsicht andere Argumente!)
    do(config) {
        return new Promise((resolve) => {
            
            // DEPRECATED: Rückwärtskompatibilität
            if (kijs.isString(config)) {
                config = {
                    facadeFn: arguments[0],
                    data: arguments[1],
                    fn: arguments[2],
                    context: arguments[3],
                    cancelRunningRpcs: arguments[4],
                    waitMaskTarget: arguments[5],
                    waitMaskTargetDomProperty: arguments[6],
                    ignoreWarnings: arguments[7],
                    fnBeforeMessages: arguments[8]
                };
                console.warn('DEPRECATED: kijs.gui.Rpc.do(), please use only 1 argument (config)');
            }

            // Validierung
            if (!kijs.isObject(config)) {
                throw new kijs.Error('RPC call without config object');
            }

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
            cancelRunningRpcs: config.cancelRunningRpcs,
            rpcParams: {ignoreWarnings: !!config.ignoreWarnings},
            responseArgs: {waitMask: waitMask}
        })
        .then((rpcData) => {
            // Lademaske entfernen
            if (rpcData.request.responseArgs && rpcData.request.responseArgs.waitMask) {
                if (rpcData.request.responseArgs.waitMask.target instanceof kijs.gui.Element) {
                    rpcData.request.responseArgs.waitMask.target.waitMaskRemove();
                } else {
                    rpcData.request.responseArgs.waitMask.destruct();
                }
            }

            if (!rpcData.response.canceled) {

                // Evtl. callback-fnBeforeMessages ausführen
                if (config.fnBeforeMessages && kijs.isFunction(config.fnBeforeMessages)) {
                    config.fnBeforeMessages.call(config.context || this, rpcData.response || null);
                }

                // Fehler --> FehlerMsg + Abbruch
                // rpcData.response.errorMsg (String oder Array mit Strings, die mit Aufzählungszeichen angezeigt werden)
                if (rpcData.response.errorMsg) {
                    let err = this._getMsg(rpcData.response.errorMsg, kijs.getText('Fehler'));
                    kijs.gui.MsgBox.error(err.title, err.msg);
                    if (rpcData.response.errorMsg.cancelCb !== false) {
                        return;
                    }
                }

                // Warning --> WarnungMsg mit OK, Cancel. Bei Ok wird der gleiche request nochmal gesendet mit dem Flag ignoreWarnings
                // rpcData.response.warningMsg (String oder Array mit Strings, die mit Aufzählungszeichen angezeigt werden)
                if (rpcData.response.warningMsg) {
                    let warn = this._getMsg(rpcData.response.warningMsg, kijs.getText('Warnung'));
                    kijs.gui.MsgBox.warning(warn.title, warn.msg, function(e) {
                        if (e.btn === 'ok') {
                            // Request nochmal senden mit Flag ignoreWarnings
                            this._doRpc({
                                facadeFn: config.facadeFn,
                                data: config.data,
                                fn: config.fn,
                                context: config.context,
                                cancelRunningRpcs: config.cancelRunningRpcs,
                                waitMaskTarget: config.waitMaskTarget,
                                waitMaskTargetDomProperty: config.waitMaskTargetDomProperty,
                                ignoreWarnings: true
                            }, resolve);
                        }
                    }, this);

                    // promise nicht auslösen
                    rpcData.request.promiseResolve = null;

                    return;
                }

                // Info --> Msg ohne Icon kein Abbruch
                // rpcData.response.infoMsg (String oder Array mit Strings, die mit Aufzählungszeichen angezeigt werden)
                if (rpcData.response.infoMsg) {
                    let info = this._getMsg(rpcData.response.infoMsg, kijs.getText('Info'));
                    kijs.gui.MsgBox.info(info.title, info.msg);
                }

                // Tip -> Msg, die automatisch wieder verschwindet kein Abbruch
                // rpcData.response.tipMsg (String oder Array mit Strings, die mit Aufzählungszeichen angezeigt werden)
                if (rpcData.response.cornerTipMsg) {
                    let info = this._getMsg(rpcData.response.cornerTipMsg, kijs.getText('Info'));
                    kijs.gui.CornerTipContainer.show(info.title, info.msg, 'info');
                }


                // callback-fn ausführen
                if (config.fn && kijs.isFunction(config.fn)) {
                    config.fn.call(config.context || this, rpcData.response.responseData || null);
                }

                // Promise auslösen
                resolve(rpcData.response.responseData);
            }
        });
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
