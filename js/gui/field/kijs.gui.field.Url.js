/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.field.Url
// --------------------------------------------------------------
/**
 * Textfeld für eine URL mit einem Button, der die gültige URL in einem neuen Tab öffnet. Fehlt das
 * Protokoll, wird defaultProtocol ergänzt.
 *
 * @example
 * new kijs.gui.field.Url({ label: 'Webseite', name: 'url' });
 */
kijs.gui.field.Url = class kijs_gui_field_Url extends kijs.gui.field.Text {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        // overwrite
        this._valuesMapping = {
            name: { valueProperty: 'value', emptyValue: '' }
        };

        this._defaultProtocol = 'https://';
        
        this._linkButtonEl = new kijs.gui.Button({
            parent: this,
            iconMap: 'kijs.iconMap.Fa.arrow-up-right-from-square',
            tooltip: kijs.getText('Link in neuem Tab öffnen'),
            disableFlex: true,
            nodeAttribute: {
                tabIndex: -1
            },
            on: {
                click: this.#onLinkButtonClick,
                context: this
            }
        });

        this._dom.clsRemove('kijs-field-text');
        this._dom.clsAdd('kijs-field-url');
        
        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            linkButtonCls: 'kijs-inline',
            inputMode: 'url'
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            defaultProtocol: true,

            linkButtonCls: { fn: 'function', target: this._linkButtonEl.dom.clsAdd, context: this._linkButtonEl.dom },  // {String|Array} CSS-Klassen des Link-Buttons. Default: 'kijs-inline'
            linkButtonHide: { target: 'linkButtonHide' },
            linkButtonIconChar: { target: 'iconChar', context: this._linkButtonEl },
            linkButtonIconCls: { target: 'iconCls', context: this._linkButtonEl },
            linkButtonIconColor: { target: 'iconColor', context: this._linkButtonEl },
            linkButtonIconMap: { target: 'iconMap', context: this._linkButtonEl }
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
    /**
     * Protokoll, das beim Öffnen einer URL ohne Protokoll ergänzt wird. Leer = nichts ergänzen. Default: 'https://'
     * @type {String}
     */
    get defaultProtocol() { return this._defaultProtocol; }
    set defaultProtocol(val) { this._defaultProtocol = val; }
    
    /**
     * Button, der die URL in einem neuen Tab öffnet
     * @type {kijs.gui.Button}
     */
    get linkButton() { return this._linkButtonEl; }
    
    /**
     * Link-Button ausblenden?
     * @type {Boolean}
     */
    get linkButtonHide() { return !this._linkButtonEl.visible; }
    set linkButtonHide(val) { this._linkButtonEl.visible = !val; }

    /**
     * Zeichen des Icons im Link-Button
     * @type {String|Number}
     */
    get linkButtonIconChar() { return this._linkButtonEl.iconChar; }
    set linkButtonIconChar(val) { this._linkButtonEl.iconChar = val; }

    /**
     * CSS-Klasse des Icons im Link-Button
     * @type {String|null}
     */
    get linkButtonIconCls() { return this._linkButtonEl.iconCls; }
    set linkButtonIconCls(val) { this._linkButtonEl.iconCls = val; }

    /**
     * Farbe des Icons im Link-Button
     * @type {String|null}
     */
    get linkButtonIconColor() { return this._linkButtonEl.iconColor; }
    set linkButtonIconColor(val) { this._linkButtonEl.iconColor = val; }

    /**
     * Icon des Link-Buttons. Default: 'kijs.iconMap.Fa.arrow-up-right-from-square'
     * @type {String}
     */
    get linkButtonIconMap() { return this._linkButtonEl.iconMap; }
    set linkButtonIconMap(val) { this._linkButtonEl.iconMap = val; }
    
    
    
    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // overwrite
    changeDisabled(val, callFromParent) {
        super.changeDisabled(!!val, callFromParent);
        this._linkButtonEl.changeDisabled(!!val, true);
    }
    
    // overwrite
    render(superCall) {
        super.render(true);
        
        // Link Button rendern (kijs.gui.Button)
        this._linkButtonEl.renderTo(this._contentDom.node, this._innerDom.node, 'before');

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

        super.unrender(true);
    }


    // PRIVATE
    // LISTENERS
    #onLinkButtonClick() {
        let val = this.value;
        
        if (!this.disabled && !kijs.isEmpty(val) && this.validate(val)) {
            // Evt. Standardprotokoll hinzufügen
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
