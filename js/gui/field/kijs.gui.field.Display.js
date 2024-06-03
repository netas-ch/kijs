/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.field.Display
// --------------------------------------------------------------
/**
 * EVENTS
 * ----------
 * blur
 * input
 *
 * // Geerbte Events
 * add
 * afterFirstRenderTo
 * afterRender
 * afterResize
 * beforeAdd
 * beforeRemove
 * changeVisibility
 * childElementAfterResize
 * dblClick
 * contextMenu
 * destruct
 * drag
 * dragEnd
 * dragLeave
 * dragOver
 * dragStart
 * drop
 * focus
 * mouseDown
 * mouseLeave
 * mouseMove
 * mouseUp
 * remove
 * wheel
 *
 * // key events
 * keyDown
 * enterPress
 * enterEscPress
 * escPress
 * spacePress
 */
kijs.gui.field.Display = class kijs_gui_field_Display extends kijs.gui.field.Field {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        this._clickableLinks = false;
        this._formatFn = null;
        this._formatFnContext = this;
        this._formatRegExps = [];
        this._value = '';
        this._valueDisplayType = 'code';    // Darstellung der Eigenschaft 'value'. Default: 'code'
                                            // html: als html-Inhalt (innerHtml)
                                            // code: Tags werden als Text angezeigt
                                            // text: Tags werden entfernt
        this._valueTrimEnable = true;


        this._inputDom = new kijs.gui.Dom({
            nodeTagName: 'div',
            htmlDisplayType: 'html',
            nodeAttribute: {
                id: this._inputId
            }
        });

        this._dom.clsAdd('kijs-field-display');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            submitValueEnable: false
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            clickableLinks: true,         // Weblink zum anklicken machen
            formatFn: { target: 'formatFn' },
            formatFnContext: { target: 'formatFnContext' },
            formatRegExp: { fn: 'function', target: this.addFormatRegExp, context: this },
            valueDisplayType: true,
            valueTrimEnable: true       // Sollen Leerzeichen am Anfang und Ende des Values automatisch entfernt werden?
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }
    }



    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get clickableLinks() { return this._clickableLinks; }
    set clickableLinks(val) {
        this._clickableLinks = !!val;
        if (this.isRendered) {
            this.value = this._value;
        }
    }

    get formatFn() { return this._formatFn; }
    set formatFn(val) {
        let fn = kijs.getFunctionFromString(val);
        if (kijs.isFunction(fn)) {
            this._formatFn = fn;
        } else {
            throw new kijs.Error(`config "formatFn" is not valid.`);
        }
    }

    get formatFnContext() { return this._formatFnContext; }
    set formatFnContext(val) {
        let context = kijs.getObjectFromString(val);
        if (kijs.isObject(context)) {
            this._formatFnContext = context;
        } else {
            throw new kijs.Error(`config "formatFnContext" is not valid.`);
        }
    }

    // overwrite
    get hasFocus() { return this._inputDom.hasFocus; }

    get inputDom() { return this._inputDom; }

    // overwrite
    get isEmpty() { return kijs.isEmpty(this._inputDom.html); }

    // overwrite
    get value() {
        let val = kijs.toString(this._value);
        if (this._valueTrimEnable) {
            val = val.trim();
        }
        return val;
    }
    set value(val) {
        val = kijs.toString(val);
        val = this._formatRules(val);
        this._value = val;
        
        switch (this._valueDisplayType) {
            case 'code':
                val = kijs.String.htmlspecialchars(val);
                break;

            case 'text':
                let d = document.createElement('div');
                d.innerHTML = val;
                val = d.innerText || d.textContent || '';
                d = null;
                break;

            case 'html':
            default:
                // nix
                break;
        }
        
        // Hyperlinks einfügen
        if (this._clickableLinks) {
            val = this._linkify(val);
        }

        // Zeilenumbrüche einfügen
        val = this._insertLineBreaks(val);

        this._inputDom.html = val;
    }

    get valueDisplayType() { return this._valueDisplayType; }
    set valueDisplayType(val) { this._valueDisplayType = val; }

    get valueTrimEnable() { return this._valueTrimEnable; }
    set valueTrimEnable(val) { this._valueTrimEnable = !!val; }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    /**
     * Fügt einen oder mehrere regulären Ausdruck (replace) zum Formatieren hinzu
     * @param {Object|Array} regExps
     *                       Beispiel: { regExp: '/([0-9]{3})([0-9]{3})/', replace: '$1 $2'  }
     *                       Wenn das literal /g vorhanden ist, wird replaceAll ausgeführt,
     *                       sonst replace()
     * @returns {undefined}
     */
    addFormatRegExp(regExps) {
        if (!kijs.isArray(regExps)) {
            regExps = [regExps];
        }

        kijs.Array.each(regExps, function(regExp) {
            let ok = true;

            if (typeof regExp !== 'object') {
                ok = false;
            }

            if (ok) {
                if (kijs.isRegExp(regExp.regExp)) {
                    regExp.regExp = regExp.regExp.toString();
                } else if (!kijs.isString(regExp.regExp)) {
                    ok = false;
                }
            }

            if (ok) {
                if (kijs.isString(regExp.replace) && (regExp.toUpperCase || regExp.toLowerCase)) {
                    throw new kijs.Error(`"formatRegExp" must not have a "toUpperCase" or "toLowerCase" and a "replace" at the same time.`);
                } else if (!kijs.isString(regExp.replace) && !regExp.toUpperCase && !regExp.toLowerCase) {
                    ok = false;
                }
            }

            if (ok) {
                this._formatRegExps.push(regExp);
            } else {
                throw new kijs.Error(`"formatRegExp" is not valid.`);
            }
        }, this);
    }

    // overwrite
    changeDisabled(val, callFromParent) {
        super.changeDisabled(!!val, callFromParent);
        this._inputDom.changeDisabled(!!val, true);
    }

    /**
     * Setzt den Focus auf das Feld. Optional wird der Text selektiert.
     * @param {Boolean} [alsoSetIfNoTabIndex=false]
     * @param {Boolean} [selectText=false]
     * @returns {undefined}
     * @overwrite
     */
    focus(alsoSetIfNoTabIndex, selectText) {
        let nde = this._inputDom.focus(alsoSetIfNoTabIndex);
        if (selectText) {
            if (nde) {
                nde.select();
            }
        }
        return nde;
    }

    // overwrite
    render(superCall) {
        super.render(true);

        // Input-DIV rendern (kijs.guiDom)
        this._inputDom.renderTo(this._inputWrapperDom.node);

        // Event afterRender auslösen
        if (!superCall) {
            this.raiseEvent('afterRender');
        }
    }

    // overwrite
    unrender(superCall) {
        // Event auslösen.
        if (!superCall) {
            this.raiseEvent('unrender');
        }

        this._inputDom.unrender();
        super.unrender(true);
    }

    // overwrite
    validate() {
        // display kann nicht invalid sein,
        // da der User nichts ändern kann.
        return true;
    }


    // PROTECTED
    _applyReplaceRegExps(regExps, value) {
        if (!kijs.isEmpty(regExps)) {
            value = value.toString();
            if (value !== '') {
                kijs.Array.each(regExps, function(regExp) {
                    let r = this._stringToRegExp(regExp.regExp);

                    // in Grossbuchstaben umwandeln
                    if (regExp.toUpperCase) {
                        // Wenn das literal /g vorhanden ist, wird replaceAll ausgeführt
                        if (kijs.String.contains(r.flags, 'g')) {
                            value = value.replaceAll(r, function(v) { return v.toUpperCase(); });
                        // sonst nur replace
                        } else {
                            value = value.replace(r, function(v) { return v.toUpperCase(); });
                        }

                    // oder in Kleinbuchstaben umwandeln
                    } else if (regExp.toUpperCase) {
                        // Wenn das literal /g vorhanden ist, wird replaceAll ausgeführt
                        if (kijs.String.contains(r.flags, 'g')) {
                            value = value.replaceAll(r, function(v) { return v.toLowerCase(); });
                        // sonst nur replace
                        } else {
                            value = value.replace(r, function(v) { return v.toLowerCase(); });
                        }

                    // oder durch String ersetzen
                    } else {
                        // Wenn das literal /g vorhanden ist, wird replaceAll ausgeführt
                        if (kijs.String.contains(r.flags, 'g')) {
                            value = value.replaceAll(r, regExp.replace);
                        // sonst nur replace
                        } else {
                            value = value.replace(r, regExp.replace);
                        }

                    }
                }, this);
            }
        }
        return value;
    }

    /**
     * Diese Funktion ist zum Überschreiben gedacht
     * @param {String} value
     * @returns {undefined}
     */
    _formatRules(value) {
        // formatRegExps
        if (!kijs.isEmpty(this._formatRegExps)) {
            value = this._applyReplaceRegExps(this._formatRegExps, value);
        }

        // formatFn
        if (kijs.isFunction(this._formatFn)) {
            if (value !== null && value.toString() !== '') {
                value = this._formatFn.call(this._formatFnContext || this, value);
            }
        }

        return value;
    }

    // Ersetzt /n durch <br>
    _insertLineBreaks(txt) {
        return txt.replace(/\n/gim, '<br>');
    }

    // Ersetzt Links durch <a>-Tags
    _linkify(txt) {
        let pattern;
        
        // URLs, beginnend mit 'http://', 'https://' oder 'ftp://'
        pattern = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
        txt = txt.replace(pattern, '<a href="$1" target="_blank" tabindex="-1">$1</a>');
        
        // URLs beginnend mit 'www.' Vorher darf kein '/' sein
        pattern = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
        txt = txt.replace(pattern, '$1<a href="http://$2" target="_blank" tabindex="-1">$2</a>');

        // E-Mailadressen
        // https://stackoverflow.com/questions/42407785/regex-extract-email-from-strings
        pattern = /((?:[a-z0-9+!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\]))/gim;
        txt = txt.replace(pattern, '<a href="mailto:$1" tabindex="-1">$1</a>');
        return txt;
    }



    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    destruct(superCall) {
        if (!superCall) {
            // unrendern
            this.unrender(superCall);

            // Event auslösen.
            this.raiseEvent('destruct');
        }

        // Elemente/DOM-Objekte entladen
        if (this._inputDom) {
            this._inputDom.destruct();
        }

        // Variablen (Objekte/Arrays) leeren
        this._inputDom = null;
        this._formatFn = null;
        this._formatFnContext = null;
        this._formatRegExps = null;

        // Basisklasse entladen
        super.destruct(true);
    }

};
