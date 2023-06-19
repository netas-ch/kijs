/* global kijs, this, HTMLElement */

// --------------------------------------------------------------
// kijs.gui.Wizard
// --------------------------------------------------------------
// Kann als Update-Infofenster oder als Erst-Fenster verwendet werden
// --------------------------------------------------------------
kijs.gui.Wizard = class kijs_gui_Wizard extends kijs.gui.Window {

    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config = {}) {
        super(false);

        this._animation = 'slideLeft';
        this._arrowLeft = null;
        this._arrowRight = null;
        this._containerStack = null;
        this._dotsContainer = null;
        this._navigable = true;

        this._dom.clsAdd('kijs-wizard');

        // Elemente hinzufügen
        this._createElements();

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // defaults overwrite kijs.gui.Window
            closable: false,
            maximizable: false,
            resizable: false,
            shadow: true,
            modal: true,
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            animation: {target: 'animation', context: this._containerStack},
            animationDuration: {target: 'animationDuration', context: this._containerStack},
            elements: {fn: 'function', target: this.addPage, context: this},
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
    addPage(elements, index = null) {
        this._containerStack.add(elements, index);

        if (this._containerStack.currentIndex === null) {
            this._containerStack.currentIndex = 0;
        }

        this._updateDotsContainer();
        this._updateArrows();
    }

    next() {
        let index = this._containerStack.currentIndex + 1;

        if (index > this._containerStack.elements.length) {
            this._changeContainer(index);
        }
    }

    previous() {
        let index = this._containerStack.currentIndex - 1;

        if (index < 0) {
            this._changeContainer(index);
        }
    }

    // PROTECTED
    _changeContainer(index, animation = null, duration = null) {

        if (!animation) {
            animation = this._animation;
        }

        if (animation === 'slideLeft') {
            if (index < this._containerStack.currentIndex) {
                animation = 'slideRight';
            }
        }

        this._containerStack.setCurrentAnimated(index, animation, duration);
        this._updateDots();
        this._updateArrows();
    }

    _createElements() {

        // Container Stack
        this._containerStack = new kijs.gui.container.Stack(
            {
                animation: this._animation
            }
        );
        this._containerStack.on('add', this.#onContainerStackUpdate, this);
        this.add(this._containerStack);

        // Punkte-Container
        this._dotsContainer = new kijs.gui.Container(
            {
                cls: 'kijs-dots-container'
            }
        )
        this.add(this._dotsContainer);

        // Pfeile
        if (this._navigable) {
            this._arrowLeft = new kijs.gui.Icon(
                {
                    name: 'previous',
                    iconMap: 'kijs.iconMap.Fa.chevron-left',
                    cls: 'kijs-arrow-left',
                    visible: false,
                    on: {
                        click: this.#onArrowClick,
                        context: this
                    }
                }
            );
            this.add(this._arrowLeft);
            this._arrowRight = new kijs.gui.Icon(
                {
                    name: 'next',
                    iconMap: 'kijs.iconMap.Fa.chevron-right',
                    cls: 'kijs-arrow-right',
                    visible: false,
                    on: {
                        click: this.#onArrowClick,
                        context: this
                    }
                }
            );
            this.add(this._arrowRight);
        }
    }

    _updateArrows() {

        // Sichtbarkeit der Pfeile
        if (this._navigable) {
            this._arrowLeft.visible = this._containerStack.currentIndex !== 0;
            this._arrowRight.visible = this._containerStack.currentIndex !== this._containerStack.elements.length - 1;
        }
    }

    _updateDots() {
        kijs.Array.each(this._dotsContainer.elements, function (element) {
            if (element instanceof kijs.gui.Icon) {
                element.dom.clsRemove('kijs-current');

                if (element.userData.index === this._containerStack.currentIndex) {
                    element.dom.clsAdd('kijs-current');
                }
            }
        }, this);
    }

    _updateDotsContainer() {
        if (this._dotsContainer.elements.length) {
            this._dotsContainer.removeAll();
        }

        let dots = [];
        kijs.Array.each(this._containerStack.elements, function (element, index) {
            let dot = new kijs.gui.Icon(
                {
                    iconMap: 'kijs.iconMap.Fa.circle',
                    cls: 'kijs-dot',
                    userData: {
                        index: index
                    }
                }
            );

            if (this._navigable) {
                dot.dom.clsAdd('kijs-selectable');
                dot.on('click', this.#onDotClick, this);
            }

            dots.push(dot);
        }, this);

        this._dotsContainer.add(dots);
        this._updateDots();
    }

    // LISTENERS
    #onArrowClick(e) {
        if (e.element.name === 'previous') {
            this.previous();
        } else {
            this.next();
        }
    }

    #onContainerStackUpdate() {
        this._updateDotsContainer();
    }

    #onDotClick(e) {
        this._changeContainer(e.element.userData.index);
        this._updateDots();
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

        // Variablen (Objekte/Arrays) leeren
        this._animation = null;
        this._arrowLeft = null;
        this._arrowRight = null;
        this._containerStack = null;
        this._dotsContainer = null;
        this._navigable = null;

        // Basisklasse auch entladen
        super.destruct(true);
    }

};
