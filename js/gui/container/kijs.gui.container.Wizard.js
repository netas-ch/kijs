/* global kijs, this, HTMLElement */

// --------------------------------------------------------------
// kijs.gui.container.Wizard
// --------------------------------------------------------------
// Kann als Update-Infofenster oder als Erst-Fenster verwendet werden
// --------------------------------------------------------------
kijs.gui.container.Wizard = class kijs_gui_container_Wizard extends kijs.gui.container.Tab {

    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config = {}) {
        super(false);

        this._navigable = true;

        // Pfeile
        this._arrowLeft = new kijs.gui.Icon(
            {
                name: 'previous',
                iconMap: 'kijs.iconMap.Fa.chevron-left',
                cls: 'kijs-arrow-left',
                parent: this,
                visible: false,
                on: {
                    click: this.previous,
                    context: this
                }
            }
        );
        this._arrowRight = new kijs.gui.Icon(
            {
                name: 'next',
                iconMap: 'kijs.iconMap.Fa.chevron-right',
                cls: 'kijs-arrow-right',
                parent: this,
                visible: false,
                on: {
                    click: this.next,
                    context: this
                }
            }
        );

        this._dom.clsAdd('kijs-container-wizard');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            tabBarPos: 'bottom',
            tabBarAlign: 'center'
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            navigable: true
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

    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // overwrite
    add(elements, index = null, preventRender = false) {
        super.add(elements, index, preventRender);

        kijs.Array.each(this.elements, function (element) {
            element.tabClosable = false;

            if (!this._navigable) {
                element.tabButtonEl.off();
                element.tabButtonEl.dom.clsAdd('kijs-disabled');
            } else {
                element.tabButtonEl.dom.clsRemove('kijs-disabled');
            }

            if (kijs.isEmpty(element.tabButtonEl.iconMap)) {
                element.tabButtonEl.iconMap = 'kijs.iconMap.Fa.circle';
            }
        }, this);

        this._updateArrows();
    }

    next() {
        let index = this.currentIndex + 1;

        if (index < this.elements.length) {
            this.setCurrentAnimated(this._getElFromIndexNameEl(index));
        }
    }

    previous() {
        let index = this.currentIndex - 1;

        if (index >= 0) {
            this.setCurrentAnimated(this._getElFromIndexNameEl(index));
        }
    }

    // overwrite
    render(superCall) {
        super.render(true);

        // Pfeile rendern
        if (this._navigable) {
            this._arrowLeft.renderTo(this._dom.node, this._innerDom.node);
            this._arrowRight.renderTo(this._dom.node, this._innerDom.node);
        }

        this._updateArrows();
    }

    // overwrite
    setCurrentAnimated(el, animation = null, duration = null) {
        const currentEl = this.currentEl;
        if (currentEl) {
            const currentIndex = this._getTabButtonElIndex(currentEl.tabButtonEl);
            const newIndex = this._getTabButtonElIndex(el.tabButtonEl);

            if (!animation) {
                animation = 'slideLeft';
            }

            if (animation === 'slideLeft') {
                if (newIndex < currentIndex) {
                    animation = 'slideRight';
                }
            }
        }
        const promise = super.setCurrentAnimated(el, animation, duration);

        this._updateArrows();

        return promise;
    }

    // overwrite
    unrender(superCall) {
        // Event auslösen.
        if (!superCall) {
            this.raiseEvent('unrender');
        }

        if (this._arrowLeft) {
            this._arrowLeft.unrender();
        }

        if (this._arrowRight) {
            this._arrowRight.unrender();
        }

        super.unrender(true);
    }

    // PROTECTED
    _updateArrows() {

        // Sichtbarkeit der Pfeile
        if (this._navigable) {
            this._arrowLeft.visible = this.currentIndex > 0;
            this._arrowRight.visible = this.currentIndex !== this.elements.length - 1;
        } else {
            this._arrowLeft.visible = false;
            this._arrowRight.visible = false;
        }
    }

    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    destruct(superCall) {
        if (!superCall) {
            // unrender
            this.unrender();

            // Event auslösen.
            this.raiseEvent('destruct');
        }

        if (this._arrowLeft) {
            this._arrowLeft.destruct();
        }

        if (this._arrowRight) {
            this._arrowRight.destruct();
        }

        // Variablen (Objekte/Arrays) leeren
        this._arrowLeft = null;
        this._arrowRight = null;
        this._navigable = null;

        // Basisklasse auch entladen
        super.destruct(true);
    }

};
