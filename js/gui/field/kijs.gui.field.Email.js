/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.field.Email
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
kijs.gui.field.Email = class kijs_gui_field_Email extends kijs.gui.field.Text {

    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        this._showLinkButton = true;

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
            this.add(this._createElements());
        }
    }


    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------

    _createElements() {
        return new kijs.gui.Button(
            {
                iconChar: '&#xf0e0',
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
        if (!this._errors && !value.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) {
            this._errors.push(kijs.getText('Falsches Emailformat'));
        }
    }


    // LISTENERS
    _onLinkButtonClick() {
        if (this.value) {
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
