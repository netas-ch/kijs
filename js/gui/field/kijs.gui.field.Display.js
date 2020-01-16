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
    constructor(config={}) {
        super(false);

        this._inputDom = new kijs.gui.Dom({
            nodeAttribute: {
                id: this._inputId,
                cls: 'kijs-displayvalue'
            },
            on: {
                click: this._onDomClick,
                context: this
            }
        });

        this._trimValue = true;

        this._dom.clsAdd('kijs-field-display');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            htmlDisplayType: 'html',
            submitValue: false,
            link: false,
            linkType: 'auto'
        });

       // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            trimValue: true,             // Sollen Leerzeichen am Anfang und Ende des Values automatisch entfernt werden?
            link: true,                  // Weblink zum anklicken machen
            linkType: true,              // Art des Links: tel, mail, web (default: automatisch)
            htmlDisplayType: { target: 'htmlDisplayType', context: this._inputDom }
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
    // overwrite
    get disabled() { return super.disabled; }
    set disabled(val) {
        super.disabled = !!val;
        if (val) {
            this._inputDom.nodeAttributeSet('disabled', true);
        } else {
            this._inputDom.nodeAttributeSet('disabled', false);
        }
    }

    get htmlDisplayType() { return this._inputDom.htmlDisplayType; }
    set htmlDisplayType(val) { this._inputDom.htmlDisplayType = val; }

    // overwrite
    get isEmpty() { return kijs.isEmpty(this._inputDom.html); }

    get inputDom() { return this._inputDom; }

    // overwrite
    get readOnly() { return super.readOnly; }
    set readOnly(val) {
        super.readOnly = !!val;
        if (val) {
            this._inputDom.nodeAttributeSet('readonly', true);
        } else {
            this._inputDom.nodeAttributeSet('readonly', false);
        }
    }

    get trimValue() { return this._trimValue; }
    set trimValue(val) { this._trimValue = val; }

    // overwrite
    get value() {
        let val = this._inputDom.html;
        return val === null ? '' : val;
    }
    set value(val) {
        this._inputDom.html = val;
        this._setLinkClass();
    }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // overwrite
    render(superCall) {
        super.render(true);

        // Input rendern (kijs.guiDom)
        this._inputDom.renderTo(this._inputWrapperDom.node);

        // Event afterRender auslösen
        if (!superCall) {
            this.raiseEvent('afterRender');
        }

        this._setLinkClass();
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

    _setLinkClass() {
        let autoLinkType = this._getLinkType(this.value);
        if (this._link && ((this._linkType === 'auto' && autoLinkType !== false) || this._linkType === autoLinkType)) {
            this._inputDom.clsAdd('kijs-link');
        } else {
            this._inputDom.clsRemove('kijs-link');
        }
    }

    /**
     * Prüft, ob ein Wert ein Link ist.
     * @param {String} value
     * @returns {String|false} tel|mail|web
     */
    _getLinkType(value) {
        value = kijs.toString(value);

        // Telefon
        if (value.match(/^\s*\+?[0-9\s]+$/i)) {
            return 'tel';
        }

        // Email
        if (value.match(/^[^@]+@[\w\-\.àáâãäåæçèéêëìíîïðñòóôõöøœùúûüýÿ]+\.[a-z]{2,}$/i)) {
            return 'mail';
        }

        // Webseite
        if (value.match(/^[\w\-\.àáâãäåæçèéêëìíîïðñòóôõöøœùúûüýÿ]+\.[a-z]{2,}$/i)) {
            return 'web';
        }

        return false;
    }

    /**
     * Öffnet ein Link (beim Klick)
     * @param {String} link
     * @param {String} type
     * @returns {undefined}
     */
    _openLink(link, type) {
        if (type === 'tel') {
            window.open('tel:' + link.replace(/[^\+0-9]/i, ''), '_self');

        } else if (type === 'mail') {
            window.open('mailto:' + link, '_self');

        }  else if (type === 'web' && link.match(/^(http|ftp)s?:\/\//i)) {
            window.open(link, '_blank');

        }  else if (type === 'web') {
            window.open('http://' + link, '_blank');
        }
    }

    _onDomClick() {
        if (this._link && !this.disabled && !this.readOnly) {
            let linkType = this._linkType === 'auto' ? this._getLinkType(this.value) : this._linkType;
            this._openLink(kijs.toString(this.value), linkType);
        }
    }


    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
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
