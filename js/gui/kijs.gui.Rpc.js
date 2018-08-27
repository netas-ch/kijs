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
     *                                                                          für Lademaske, NULL=document.body
     * @param {String} [waitMaskTargetDomPropertyName='dom']                    Name der DOM-Eigenschaft in der die Lademaske 
     *                                                                          angezeigt werden soll.
     * @param {Boolean} [ignoreWarnings=false]  Sollen Warnungen ignoriert werden?
     * @param {Function} [fnBeforeDisplayError] Callback-Funktion, die vor der Ausgabe von Fehlern ausgeführt wird
     *                                          Wird z.B. verwendet um bei Formularen die Fehler bei den einzelnen Feldern
     *                                          anzuzeigen.
     * @returns {undefined}
     */
    // overwrite (Vorsicht andere Argumente!)
    do(facadeFn, data, fn, context, cancelRunningRpcs, waitMaskTarget, waitMaskTargetDomPropertyName='dom', ignoreWarnings, fnBeforeDisplayError) {
        // Lademaske anzeigen
        let waitMask;
        if (waitMaskTarget instanceof kijs.gui.Element) {
            waitMask = waitMaskTarget.waitMaskAdd();
        } else {
            waitMask = new kijs.gui.Mask({
                displayWaitIcon: true,
                target: waitMaskTarget,
                targetDomPropertyName: waitMaskTargetDomPropertyName
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
                // Evtl.  callback-fnBeforeDisplayError ausführen
                if (fnBeforeDisplayError && kijs.isFunction(fnBeforeDisplayError)) {
                    fnBeforeDisplayError.call(context || this, response || null);
                }

                // Fehler --> FehlerMsg + Abbruch
                // response.errorMsg (String oder Array mit Strings, die mit Aufzählungszeichen angezeigt werden)
                if (!kijs.isEmpty(response.errorMsg)) {
                    kijs.gui.MsgBox.error('Fehler', response.errorMsg);
                    return;
                }

                // Warning --> WarnungMsg mit OK, Cancel. Bei Ok wird der gleiche request nochmal gesendet mit dem Flag ignoreWarnings
                // response.warningMsg (String oder Array mit Strings, die mit Aufzählungszeichen angezeigt werden)
                if (!kijs.isEmpty(response.warningMsg)) {
                    kijs.gui.MsgBox.warning('Warnung', response.warningMsg, function(e) {
                        if (e.btn === 'ok') {
                            // Request nochmal senden mit Flag ignoreWarnings
                            this.do(facadeFn, data, fn, context, cancelRunningRpcs, waitMaskTarget, waitMaskTargetDomPropertyName, true);
                        }
                    }, this);
                    return;
                }

                // Info --> Msg ohne Icon kein Abbruch
                // response.infoMsg (String oder Array mit Strings, die mit Aufzählungszeichen angezeigt werden)
                if (!kijs.isEmpty(response.infoMsg)) {
                    kijs.gui.MsgBox.info('Info', response.infoMsg);

                }
                // Tip -> Msg, die automatisch wieder verschwindet kein Abbruch
                // response.tipMsg (String oder Array mit Strings, die mit Aufzählungszeichen angezeigt werden)
                if (!kijs.isEmpty(response.cornerTipMsg)) {
                    kijs.gui.CornerTipContainer.show('Info', response.cornerTipMsg, 'info');
                }

                // callback-fn ausführen
                if (fn && kijs.isFunction(fn)) {
                    fn.call(context || this, response || null);
                }
            }

        }, this, cancelRunningRpcs, {ignoreWarnings: !!ignoreWarnings}, {waitMask: waitMask});
        
    }

};
