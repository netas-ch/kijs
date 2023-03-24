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
 * rightClick
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

        this._value = '';
        this._valueTrim = true;
        this._clickableLinks = false;
        
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
            submitValue: false
        });

       // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            valueTrim: true,             // Sollen Leerzeichen am Anfang und Ende des Values automatisch entfernt werden?
            clickableLinks: true         // Weblink zum anklicken machen
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
    
    get inputDom() { return this._inputDom; }

    // overwrite
    get isEmpty() { return kijs.isEmpty(this._inputDom.html); }

    // overwrite
    get value() {
        let val = this._value;
        if (this._valueTrim && kijs.isString(val)) {
            val = val.trim();
        }
        return val;
    }
    set value(val) {
        if (val === null) {
            val = '';
        }
        this._value = val;
        
        // Sicherstellen, dass kein HTML-Code drin ist.
        val = kijs.String.htmlspecialchars(val);
        
        // Hyperlinks einfügen
        if (this._clickableLinks) {
            val = this._linkify(val);
        }
        
        // Zeilenumbrüche einfügen
        val = this._insertLineBreaks(val);
        
        this._inputDom.html = val;
    }
    
    get valueTrim() { return this._valueTrim; }
    set valueTrim(val) { this._valueTrim = !!val; }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // overwrite
    changeDisabled(val, callFromParent) {
        super.changeDisabled(val, callFromParent);
        this._inputDom.disabled = !!val;
    }
    
    // overwrite
    render(superCall) {
        super.render(true);

        // Input rendern (kijs.guiDom)
        this._inputDom.renderTo(this._inputWrapperDom.node);

        // Event afterRender auslösen
        if (!superCall) {
            this.raiseEvent('afterRender');
        }

        //this._setLinkClass();
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
    // Ersetzt /n durch <br>
    _insertLineBreaks(txt) {
        return txt.replace(/\n/gim, '<br>');
    }
    
    // Ersetzt Links durch <a>-Tags
    _linkify(txt) {
        let pattern;
        
        // URLs, beginnend mit 'http://', 'https://' oder 'ftp://'
        pattern = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
        txt = txt.replace(pattern, '<a href="$1" target="_blank">$1</a>');

        // URLs beginnend mit 'www.'
        // (without // before it, or it'd re-link the ones done above).
        pattern = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
        txt = txt.replace(pattern, '$1<a href="http://$2" target="_blank">$2</a>');

        // E-Mailadressen
        pattern = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
        txt = txt.replace(pattern, '<a href="mailto:$1">$1</a>');

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

        // Basisklasse entladen
        super.destruct(true);
    }
    
};
