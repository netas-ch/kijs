/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.field.Url
// --------------------------------------------------------------
kijs.gui.field.Url = class kijs_gui_field_Url extends kijs.gui.field.Text {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        this._defaultProtocol = 'https://';
        this._linkButtonVisible = true;
        
        this._linkButtonEl = new kijs.gui.Button({
            iconMap: 'kijs.iconMap.Fa.arrow-up-right-from-square',
            cls: 'kijs-inline',
            tooltip: kijs.getText('Link in neuem Tab öffnen'),
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
        this._dom.clsAdd('kijs-field-url');
        
        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            inputMode: 'url'
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            defaultProtocol: true,  // Standardprotokoll für URLs ohne Protokoll (default = 'https://')
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
    get defaultProtocol() { return this._defaultProtocol; }
    set defaultProtocol(val) { this._defaultProtocol = val; }
    
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
            // Evt. Standardprotocol hinzufügen
            if (!kijs.isEmpty(this._defaultProtocol)) {
                if (!val.match(/^[a-z0-9]+\:\/\//i)) {
                    val = this._defaultProtocol + val;
                }
            }
            window.open(val, '_blank');
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
