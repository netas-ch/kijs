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
    constructor(config={}) {
        super(false);

        this._showLinkButton = false;

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            inputMode: 'email'
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            showLinkButton: true
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }

        if (this._showLinkButton) {
            this.add(this._createLinkButton());
        }
    }


    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------

    _createLinkButton() {
        return new kijs.gui.Button(
            {
                iconMap: 'kijs.iconMap.Fa.envelope',
                on: {
                    click: this._onLinkButtonClick,
                    context: this
                }
            }
        );
    }

    // overwrite
    _validationRules(value) {
        super._validationRules(value);

        // Email validieren
        if (kijs.isEmpty(this._errors) && value && !this._isValidEmail(value)) {
            this._errors.push(kijs.getText('Ungültige E-Mail-Adresse'));
        }
    }

    _isValidEmail(val) {
        return !!kijs.toString(val).match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    }


    // LISTENERS
    _onInput() {
        // nichts
    }

    _onLinkButtonClick() {
        if (this._isValidEmail(this.value)) {
            window.open('mailto:' + this.value);
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

        // Variablen (Objekte/Arrays) leeren
        this._showLinkButton = null;

        // Basisklasse entladen
        super.destruct(true);
    }
};
