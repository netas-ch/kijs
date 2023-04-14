/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.field.Email
// --------------------------------------------------------------
kijs.gui.field.Email = class kijs_gui_field_Email extends kijs.gui.field.Text {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        this._linkButtonVisible = true;
        
        this._linkButtonEl = new kijs.gui.Button({
            iconMap: 'kijs.iconMap.Fa.envelope',
            cls: 'kijs-inline',
            tooltip: kijs.getText('E-Mail erstellen'),
            nodeAttribute: {
                tabIndex: -1
            },
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
            inputMode: 'email',
            validationRegExp: { // Validierung ist hier, damit sie überschrieben werden kann
                regExp: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                msg: kijs.getText('Ungültige E-Mail-Adresse')
            }
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
    
    get linkButtonVisible() { return this._linkButtonEl.visible; }
    set linkButtonVisible(val) { this._linkButtonEl.visible = val; }
    
    

    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // PRIVATE
    // LISTENERS
    #onLinkButtonClick() {
        let val = this.value;
        if (!this.disabled && !kijs.isEmpty(val) && this.validate(val)) {
            kijs.Navigator.openEmailPhoneLink('mailto:' + val);
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
