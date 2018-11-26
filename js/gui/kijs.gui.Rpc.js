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
     * @param {Function} [fnBeforeMessages]     Callback-Funktion, die vor der Ausgabe von Meldungsfenstern ausgeführt wird
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
                    let err = this._getMsg(response.errorMsg, 'Fehler');
                    kijs.gui.MsgBox.error(err.title, err.msg);
                    if (response.errorMsg.cancelCb !== false) {
                        return;
                    }
                }

                // Warning --> WarnungMsg mit OK, Cancel. Bei Ok wird der gleiche request nochmal gesendet mit dem Flag ignoreWarnings
                // response.warningMsg (String oder Array mit Strings, die mit Aufzählungszeichen angezeigt werden)
                if (response.warningMsg) {
                    let warn = this._getMsg(response.warningMsg, 'Warnung');
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
                    let info = this._getMsg(response.infoMsg, 'Info');
                    kijs.gui.MsgBox.info(info.title, info.msg);
                }

                // Tip -> Msg, die automatisch wieder verschwindet kein Abbruch
                // response.tipMsg (String oder Array mit Strings, die mit Aufzählungszeichen angezeigt werden)
                if (response.cornerTipMsg) {
                    let info = this._getMsg(response.cornerTipMsg, 'Info');
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
