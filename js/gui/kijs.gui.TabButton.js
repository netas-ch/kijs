/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.TabButton
// --------------------------------------------------------------
kijs.gui.TabButton = class kijs_gui_TabButton extends kijs.gui.Button {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config = {}) {
        super(false);

        this._closable = false;
        this._closeIcon = new kijs.gui.Icon({
            iconChar: '&#xf00d',
            cls: 'kijs-tab-closeIcon',
            visible: false,
            on: {
                click: this._onCloseClick,
                context: this
            }
        });
        this._mode = 'horizontal';

        this._dom.clsRemove('kijs-button');
        this._dom.clsAdd('kijs-tab');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            closable: {target: 'closable'},
            mode: true
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }

        //this.on('click', this._onClick, this);
    }


    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get closable() {
        return this._closable;
    }
    set closable(val) {
        this._closeIcon.visible = !!val;
    }


    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------

    // overwrite
    render(superCall) {
        if (!this.isRendered) {
            super.render(true);

            this._closeIcon.renderTo(this._dom.node);

            this.dom.clsAdd('kijs-' + this._mode);

            // Event afterRender auslösen
            if (!superCall) {
                this.raiseEvent('afterRender');
            }
        }
    }

    // Listener
    _onCloseClick(e) {

        // Event auslösen
        this.raiseEvent('closeClick', e);
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
        this._closable = null;
        this._closeIcon = null;
        this._mode = null;

        // Basisklasse entladen
        super.destruct(true);
    }

};
