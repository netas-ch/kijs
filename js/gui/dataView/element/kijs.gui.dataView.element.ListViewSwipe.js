/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.dataView.element.ListViewSwipe
// --------------------------------------------------------------
kijs.gui.dataView.element.ListViewSwipe = class kijs_gui_dataView_element_ListViewSwipe extends kijs.gui.dataView.element.Base {

    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config = {}) {
        super(false);

        this._captionLeft = null;
        this._captionLeftField = null;
        this._captionRight = null;
        this._captionRightField = null;
        this._contentContainer = null;
        this._buttonsLeft = [];
        this._buttonsLeftField = null;
        this._buttonsRight = [];
        this._buttonsRightField = null;
        this._backgroundContainer = null;
        this._iconLeft = null;
        this._iconLeftField = null;
        this._iconRight = null;
        this._iconRightField = null;
        this._leftContainer = null;
        this._rightContainer = null;
        this._startX = null;

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            captionLeftField: 'captionLeft',
            captionRightField: 'captionRight',
            buttonsLeftField: 'buttonsLeft',
            buttonsRightField: 'buttonsRight',
            elements: this._createElements(),
            iconLeftField: 'iconLeft',
            iconRightField: 'iconRight'
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            captionLeftField: true,
            captionRightField: true,
            buttonsLeftField: true,
            buttonsRightField: true,
            iconLeftField: true,
            iconRightField: true
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }
    }

    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    update() {

        // Icon
        let iconMap = null;
        let iconChar = null;
        let iconCls = null;
        let iconAnimationCls = null;
        let iconColor = null;

        if (!kijs.isEmpty(this._parentEl.iconMapField)) {
            iconMap = this.dataRow[this._parentEl.iconMapField];
        } else {
            iconMap = this._parentEl.iconMap;
        }
        if (!kijs.isEmpty(this._parentEl.iconCharField)) {
            iconChar = this.dataRow[this._parentEl.iconCharField];
        } else {
            iconChar = this._parentEl.iconChar;
        }
        if (!kijs.isEmpty(this._parentEl.iconClsField)) {
            iconCls = this.dataRow[this._parentEl.iconClsField];
        } else {
            iconCls = this._parentEl.iconCls;
        }
        if (!kijs.isEmpty(this._parentEl.iconAnimationClsField)) {
            iconAnimationCls = this.dataRow[this._parentEl.iconAnimationClsField];
        } else {
            iconAnimationCls = this._parentEl.iconAnimationCls;
        }
        if (!kijs.isEmpty(this._parentEl.iconColorField)) {
            iconColor = this.dataRow[this._parentEl.iconColorField];
        } else {
            iconColor = this._parentEl.iconColor;
        }

        let iconArgs = { parent: this };
        if (!kijs.isEmpty(iconMap)) {
            iconArgs.iconMap = iconMap;
        }
        if (!kijs.isEmpty(iconChar)) {
            iconArgs.iconChar = iconChar;
        }
        if (!kijs.isEmpty(iconCls)) {
            iconArgs.iconCls = iconCls;
        }
        if (!kijs.isEmpty(iconAnimationCls)) {
            iconArgs.iconAnimationCls = iconAnimationCls;
        }
        if (!kijs.isEmpty(iconColor)) {
            iconArgs.iconColor = iconColor;
        }

        let iconEl = new kijs.gui.Icon(iconArgs);

        // Caption
        let caption = '';
        if (!kijs.isEmpty(this._parentEl.captionField) && !kijs.isEmpty(this.dataRow[this._parentEl.captionField])) {
            caption = this.dataRow[this._parentEl.captionField];
        }
        let captionEl = new kijs.gui.Element({
            htmlDisplayType: this._parentEl.captionHtmlDisplayType,
            nodeTagName: 'span',
            html: caption,
            cls: 'kijs-caption'
        });

        // Tooltip
        let tooltip = '';
        if (!kijs.isEmpty(this._parentEl.tooltipField) && !kijs.isEmpty(this.dataRow[this._parentEl.tooltipField])) {
            tooltip = this.dataRow[this._parentEl.tooltipField];
        }
        this.tooltip = tooltip;

        // cls
        if (!kijs.isEmpty(this._parentEl.clsField) && !kijs.isEmpty(this.dataRow[this._parentEl.clsField])) {
            this.dom.clsAdd(this.dataRow[this._parentEl.clsField]);
        }

        // Checkbox
        let cls = '';
        if (this._parentEl.showCheckBoxes) {
            switch (this._parentEl.selectType) {
                case 'single':
                case 'singleAndEmpty':
                    cls = 'kijs-display-options';
                    break;

                case 'simple':
                case 'multi':
                    cls = 'kijs-display-checkboxes';
                    break;

            }
        }

        this.dom.clsRemove(['kijs-display-options', 'kijs-display-checkboxes']);
        if (cls) {
            this.dom.clsAdd(cls);
        }

        this._contentContainer.removeAll();
        this._contentContainer.add([iconEl, captionEl]);

        // Swipe Elements
        this._leftContainer.removeAll({ preventDestruct: true });
        if (kijs.isEmpty(this._buttonsLeftField) || kijs.isEmpty(this.dataRow[this._buttonsLeftField])) {

            // Icon Left
            if (!kijs.isEmpty(this._iconLeftField) && !kijs.isEmpty(this.dataRow[this._iconLeftField])) {
                this._iconLeft.iconMap = this.dataRow[this._iconLeftField];
                this._leftContainer.add(this._iconLeft, 0);
            }

            // Caption Left
            if (!kijs.isEmpty(this._captionLeftField) && !kijs.isEmpty(this.dataRow[this._captionLeftField])) {
                this._captionLeft.html = this.dataRow[this._captionLeftField];
                this._leftContainer.add(this._captionLeft, 1);
            }
        } else {
            this._buttonsLeft = [];
            let buttons = this.dataRow[this._buttonsLeftField];
            if (!kijs.isArray(buttons)) {
                buttons = [buttons];
            }

            kijs.Array.each(buttons, button => {
                const btn = new kijs.gui.Button(button);
                btn.on('click', this.#onButtonClick, this);
                this._buttonsLeft.push(btn);
            }, this);

            if (!kijs.isEmpty(this._buttonsLeft)) {
                this._leftContainer.add(this._buttonsLeft);
            }
        }

        this._rightContainer.removeAll({ preventDestruct: true });
        if (kijs.isEmpty(this._buttonsRightField) || kijs.isEmpty(this.dataRow[this._buttonsRightField])) {

            // Caption Right
            if (!kijs.isEmpty(this._captionRightField) && !kijs.isEmpty(this.dataRow[this._captionRightField])) {
                this._captionRight.html = this.dataRow[this._captionRightField];
                this._rightContainer.add(this._captionRight);
            }

            // Icon Right
            if (!kijs.isEmpty(this._iconRightField) && !kijs.isEmpty(this.dataRow[this._iconRightField])) {
                this._iconRight.iconMap = this.dataRow[this._iconRightField];
                this._rightContainer.add(this._iconRight);
            }
        } else {
            this._buttonsRight = [];
            let buttons = this.dataRow[this._buttonsRightField];
            if (!kijs.isArray(buttons)) {
                buttons = [buttons];
            }

            kijs.Array.each(buttons, button => {
                const btn = new kijs.gui.Button(button);
                btn.on('click', this.#onButtonClick, this);
                this._buttonsRight.push(btn);
            }, this);

            if (!kijs.isEmpty(this._buttonsRight)) {
                this._rightContainer.add(this._buttonsRight);
            }
        }
    }

    // PROTECTED
    _createElements() {

        this._captionLeft = new kijs.gui.Element(
            {
                cls: ['kijs-caption', 'kijs-caption-left']
            }
        );

        this._captionRight = new kijs.gui.Element(
            {
                cls: ['kijs-caption', 'kijs-caption-right'],
            }
        );

        this._iconLeft = new kijs.gui.Icon(
            {
                cls: 'kijs-icon-left'
            }
        );

        this._iconRight = new kijs.gui.Icon(
            {
                cls: 'kijs-icon-right'
            }
        );

        this._leftContainer = new kijs.gui.Container(
            {
                cls: 'kijs-left-container'
            }
        );

        this._rightContainer = new kijs.gui.Container(
            {
                cls: 'kijs-right-container'
            }
        )

        this._contentContainer = new kijs.gui.Container(
            {
                cls: 'kijs-content-container',
                on: {
                    mouseDown: this.#onSwipeStart,
                    touchStart: this.#onSwipeStart,
                    context: this
                }
            }
        );

        this._backgroundContainer = new kijs.gui.Container(
            {
                cls: 'kijs-swipe-container',
                elements: [this._leftContainer, this._rightContainer, this._contentContainer],
            }
        );

        return this._backgroundContainer
    }

    // PRIVATE
    // LISTENERS
    #onButtonClick() {

        // Zurück in Ausgangsposition swipen
        this._contentContainer.dom.node.style.transform = 'translateX(0)';

        // Listener entfernen
        kijs.Dom.removeEventListener('mousedown', document, this);
        kijs.Dom.removeEventListener('touchstart', document, this);
    }

    #onClick(e) {

        // Prüfen, ob der Klick innerhalb des Swipe-Elements war
        if (this._backgroundContainer.dom.node.contains(e.nodeEvent.target)) {
            // Klick auf den Container oder Buttons → nichts tun
            return;
        }

        // Zurück in Ausgangsposition swipen
        this._contentContainer.dom.node.style.transform = 'translateX(0)';

        // Listener entfernen
        kijs.Dom.removeEventListener('mousedown', document, this);
        kijs.Dom.removeEventListener('touchstart', document, this);
    }

    #onSwipe(e) {
        if (this._startX === null) return;

        const touch = e.nodeEvent.changedTouches ? e.nodeEvent.changedTouches[0] : e.nodeEvent;
        const diffX = touch.clientX - this._startX;

        // Kleine Bewegungen ignorieren (z. B. Klick)
        if (Math.abs(diffX) < 5) return;

        // Bewegung begrenzen
        // max. 1/2 der Breite des Elements
        const elWidth = this._contentContainer.dom.node.offsetWidth;
        const maxSwipe = elWidth / 2;
        const moveX = Math.max(Math.min(diffX, maxSwipe), -maxSwipe);

        // Verschieben
        if ((moveX > 0 && !kijs.isEmpty(this._leftContainer.elements)) || (moveX < 0 && !kijs.isEmpty(this._rightContainer.elements))) {
            const node = this._contentContainer.dom.node;
            node.style.transform = `translateX(${moveX}px)`;

            // Verhindert Text-Selection bei Maus
            if (!e.touches) {
                e.nodeEvent.preventDefault();
            }
        }
    }

    #onSwipeEnd(e) {
        if (this._startX === null) return;

        const touch = e.nodeEvent.changedTouches ? e.nodeEvent.changedTouches[0] : e.nodeEvent;
        const diffX = touch.clientX - this._startX;
        const width = this._contentContainer.dom.node.offsetWidth / 2;
        this._startX = null;

        // Richtung bestimmen
        if (diffX > 50) {
            if (kijs.isEmpty(this._buttonsLeft) || diffX < width) {

                // Zurück in Ausgangsposition swipen
                this._contentContainer.dom.node.style.transform = 'translateX(0)';
            }

            if (!kijs.isEmpty(this._buttonsLeft)) {

                // Listener setzen
                kijs.Dom.addEventListener('mousedown', document, this.#onClick, this);
                kijs.Dom.addEventListener('touchstart', document, this.#onClick, this);
            }

            // Event werfen
            this.raiseEvent('swipe', { direction: 'right' });
            this.parent.raiseEvent('elementSwipe', { raiseElement: this, direction: 'right' });

        } else if (diffX < -50) {
            if (kijs.isEmpty(this._buttonsRight) || -diffX < width) {

                // Zurück in Ausgangsposition swipen
                this._contentContainer.dom.node.style.transform = 'translateX(0)';
            }

            if (!kijs.isEmpty(this._buttonsRight)) {

                // Listener setzen
                kijs.Dom.addEventListener('mousedown', document, this.#onClick, this);
                kijs.Dom.addEventListener('touchstart', document, this.#onClick, this);
            }

            // Event werfen
            this.raiseEvent('swipe', { direction: 'left' });
            this.parent.raiseEvent('elementSwipe', { raiseElement: this, direction: 'left' });

        } else {

            // Swipe zu klein → immer zurücksetzen
            this._contentContainer.dom.node.style.transform = 'translateX(0)';
        }

        // Listeners entfernen
        e.element.off('mouseMove', this.#onSwipe, this);
        e.element.off('touchMove', this.#onSwipe, this);
        e.element.off('mouseUp', this.#onSwipeEnd, this);
        e.element.off('touchEnd', this.#onSwipeEnd, this);
        e.element.off('mouseLeave', this.#onSwipeEnd, this);
    }

    #onSwipeStart(e) {

        if (!kijs.isEmpty(this._leftContainer.elements) || !kijs.isEmpty(this._rightContainer.elements)) {

            const touch = e.nodeEvent.touches ? e.nodeEvent.touches[0] : e.nodeEvent;
            this._startX = touch.clientX;

            // Übergang deaktivieren, damit die Bewegung direkt reagiert
            const node = this._contentContainer.dom.node;
            node.style.transition = 'none';

            e.element.on('mouseMove', this.#onSwipe, this);
            e.element.on('touchMove', this.#onSwipe, this);
            e.element.on('mouseUp', this.#onSwipeEnd, this);
            e.element.on('touchEnd', this.#onSwipeEnd, this);
            e.element.on('mouseLeave', this.#onSwipeEnd, this);
        }
    }

    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    destruct(superCall) {
        if (!superCall) {
            // unrender
            this.unrender(superCall);

            // Event auslösen.
            this.raiseEvent('destruct');
        }

        // Variablen (Objekte/Arrays) leeren
        this._captionLeft = null;
        this._captionRight = null;
        this._buttonsLeft = null;
        this._buttonsRight = null;
        this._backgroundContainer = null;
        this._iconLeft = null;
        this._iconRight = null;
        this._contentContainer = null;
        this._startX = null;

        // Basisklasse entladen
        super.destruct(true);
    }
};
