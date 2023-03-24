/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.field.Email
// --------------------------------------------------------------

// TODO: Es wird beim verlassen des Feldes nicht die Email validiert
// TODO: Beim klick auf den linkButton wird ein Browser-Fenster geöffnet
// TODO: Besser direkt von kijs.gui.field.Field erben?

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
kijs.gui.field.Email = class kijs_gui_field_Email extends kijs.gui.field.Text {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        this._showLinkButton = false;
        
        this._linkButtonEl = new kijs.gui.Icon({
            iconMap: 'kijs.iconMap.Fa.envelope',
            cls: 'kijs-inline',
            tooltip: kijs.getText('E-Mail erstellen'),
            on: {
                click: this.#onLinkButtonClick,
                context: this
            }
        });
        
        this.add(this._linkButtonEl);
        
        this._dom.clsRemove('kijs-field-text');
        this._dom.clsAdd('kijs-field-email');
        
        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            inputMode: 'email'
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            linkButtonVisible: { target: 'visible', context: this._linkButtonEl }
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
    get linkButton() { return this._linkButtonEl; }
    


    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // PROTECTED
    _isValidEmail(val) {
        return !!kijs.toString(val).match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    }
    
    // overwrite
    _validationRules(value) {
        super._validationRules(value);

        // Email validieren
        if (kijs.isEmpty(this._errors) && value && !this._isValidEmail(value)) {
            this._errors.push(kijs.getText('Ungültige E-Mail-Adresse'));
        }
    }


    // PRIVATE
    // LISTENERS
    #onLinkButtonClick() {
        if (!this.disabled && this.validate(this.value) && !kijs.isEmpty(this.value)) {
            kijs.Navigator.openLink('mailto:' + this.value);
        }
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
        if (this._linkButtonEl) {
            this._linkButtonEl.destruct();
        }
        
        // Variablen (Objekte/Arrays) leeren
        this._linkButtonEl = null;

        // Basisklasse entladen
        super.destruct(true);
    }
    
};
