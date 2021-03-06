/* global kijs */

// --------------------------------------------------------------
// kijs.Observable (Abstract)
// --------------------------------------------------------------
kijs.Observable = class kijs_Observable {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor() {
        this._nodeEventListeners = {};
        this._events = this._events || {};  // Beispiel: {
                                            //              click: [
                                            //                {
                                            //                  callback: fn,
                                            //                  context: context
                                            //                },{
                                            //                  callback: fn,
                                            //                  context: context
                                            //                }
                                            //              ],
                                            //              mouseOver: [
                                            //                {
                                            //                  callback: fn,
                                            //                  context: context
                                            //                },{
                                            //                  callback: fn,
                                            //                  context: context
                                            //                }
                                            //              ]
                                            //           }
    }

    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------

    /**
     * Gibt den Namen der Javascript-Klasse zur??ck
     * @returns {String|null}
     */
    get jsClassName() {
        if (kijs.isString(this.constructor.name)) {
            return kijs.String.replaceAll(this.constructor.name, '_', '.');
        }

        return null;
    }

    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    /**
     * ??berpr??ft ob ein Listener existiert
     * @param {String} name                     Name des Listeners
     * @param {function|null} [callback=null]   Callback Funktion oder null f??r alle
     * @param {object|null} [context=null]      Kontext oder null f??r alle
     * @returns {Boolean}
     */
    hasListener(name, callback=null, context=null) {
        let listeners = this._events[name];

        if (listeners) {
            if (!callback && !context) {
                return true;

            } else {
                for (let i=0; i<listeners.length; i++) {
                    let listener = listeners[i];

                    const callbackOk = !callback || callback === listener.callback;
                    const contextOk = !context || context === listener.context;

                    if (callbackOk && contextOk) {
                        return true;
                    }
                }

            }
        }

        return false;
    }

    /**
     * Entfernt ein oder mehrere Listeners
     * @param {string|array|null} [names] - Name oder Array mit Namen der Listeners oder leer um alle zu l??schen.
     *
     * @param {function|null} [callback]  - Callback Funktion, deren Listeners gel??scht werden sollen.
     *                                      Wenn leer, werden alle gel??scht.
     *
     * @param {object|null} [context]     - Kontext der Callback Funktion, deren Listeners gel??scht werden sollen.
     *                                      Wenn leer, werden alle gel??scht.
     *
     * @returns {undefined}
     */
    off(names=null, callback=null, context=null) {

        // Wenn kein Argument ??bergeben wurde: alle Listeners entfernen
        if (!names && !callback && !context) {
            this._events = {};
            return;
        }

        if (kijs.isEmpty(names)) {
            names = Object.keys(this._events);
        } else if (!kijs.isArray(names)) {
            names = [names];
        }

        // Listeners duchgehen und wenn sie mit den ??bergebenen Argumenten ??bereinstimmen: entfernen
        kijs.Array.each(names, function(name) {
            let skip = false;

            // Wenn kein Listener existiert: skip
            let listeners = this._events[name];
            if (!listeners) {
                skip = true;
            }

            // Wenn alle callbacks & context entfernt werden k??nnen: entfernen
            if (!skip && !callback && !context) {
                delete this._events[name];
                skip = true;
            }

            // ... sonst nur die listeners entfernen, die den Argumenten entsprechen
            // daf??r die Listeners durchgehen und die noch gew??nschten merken
            if (!skip) {
                let remaining = [];
                for (let j=0; j<listeners.length; j++) {
                    let listener = listeners[j];
                    if ( (callback && callback !== listener.callback)
                            || (context && context !== listener.context) ) {
                        remaining.push(listener);
                    }
                }

                if (remaining.length) {
                    this._events[name] = remaining;
                } else {
                    delete this._events[name];
                }
            }
        }, this);
    }

    /**
     * Erstellt einen Listener
     * @param {string|array} names - Name oder Array mit Namen des Listeners
     * @param {function} callback - Callback-Funktion oder bei name=Object: Standard-Callback-Fn
     * @param {Object} context - Kontext f??r die Callback-Funktion
     * @returns {undefined}
     */
    on(names, callback, context) {

        if (!kijs.isString(names) && !kijs.isArray(names)) {
            throw new kijs.Error(`invalid argument 1 for on(names, callback, context): string or array expected`);
        }
        if (!kijs.isFunction(callback)) {
            throw new kijs.Error(`invalid argument 2 for on(names, callback, context): function expected`);
        }

        names = kijs.isArray(names) ? names : [names];

        kijs.Array.each(names, function(name) {
            // Falls der Listener noch nicht existiert: einf??gen
            if (!this.hasListener(name, callback, context)) {
                if (!this._events[name]) {
                    this._events[name] = [];
                }

                this._events[name].push({
                    callback: callback,
                    context: context
                });
            }

        }, this);
    }

    /**
     * Erstellt einen Listener, der nur einmal ausgef??hrt wird und sich dann selber wieder entfernt
     * @param {string|array} names - Name oder Array mit Namen des Listeners
     * @param {function} callback - Callback-Funktion oder bei name=Object: Standard-Callback-Fn
     * @param {Object} context - Kontext f??r die Callback-Funktion
     * @returns {undefined}
     */
    once(names, callback, context) {
        // Wrapper, der anstelle der Callback-Funktion aufgerufen wird.
        // Dieser entfernt den Listener und ruft die Callback-Funktion auf.
        const callbackWrapper = function(e) {
            this.off(names, callbackWrapper, context);
            return callback.apply(context, arguments);
        };

        this.on(names, callbackWrapper, this);
    }

    /**
     * L??st einen Event aus
     * @param {String} [name] - Name des Events oder leer um alle Events auszul??sen
     * @param {Mixed} [args] - beliebig viele Argumente, die dem Event ??bergeben werden
     * @returns {Boolean} - Falls ein Listener false zur??ckgibt, ist die R??ckgabe false, sonst true
     */
    raiseEvent(name, ...args) {
        this._events = this._events || {};

        if (kijs.isEmpty(this._events)) {
            return true;
        }

        // Wenn kein Name ??bergeben wurde: alle Events ausl??sen
        if (!kijs.isDefined(name)) {
            name = Object.keys(this._events);
        }

        if (!kijs.isArray(name)) {
            name = [name];
        }

        // Listeners durchgehen und ausl??sen
        const names = name;
        let returnValue = true;
        for (let i=0; i<names.length; i++) {
            name = names[i];
            const listeners = this._events[name];
            if (listeners) {
                for (let j=0; j<listeners.length; j++) {
                    const listener = listeners[j];
                    if (listener.callback.apply(listener.context, args) === false) {
                        returnValue = false;
                    }
                }
            }

        }

        return returnValue;
    }


    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct() {
        this.off();
    }

};