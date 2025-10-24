/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.field.Checkbox
// --------------------------------------------------------------
/**
 * EVENTS
 * ----------
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
 * contextMenu
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
kijs.gui.field.Checkbox = class kijs_gui_field_Checkbox extends kijs.gui.field.Field {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        this._checked = 0;                          // 0=unchecked, 1=checked, 2=indeterminated

        this._checkedIconMap = 'kijs.iconMap.Fa.check';
        this._determinatedIconMap = 'kijs.iconMap.Fa.minus';
        this._uncheckedIconMap = null;

        this._threeState = false;                   // Erreichen des dritten Statuses "Intermediate" per Klick möglich?

        this._valueChecked = true;
        this._valueDeterminated = 2;
        this._valueUnchecked = false;

        this._inputWrapperDom.nodeAttributeSet('tabIndex', 0);

        this._checkboxIconEl = new kijs.gui.Icon({
            parent: this,
            cls: 'kijs-checkbox-input'
        });

        this._iconEl = new kijs.gui.Icon({
            parent: this,
            cls: 'kijs-checkbox-icon'
        });

        this._captionDom = new kijs.gui.Dom({
            cls: 'kijs-caption',
            nodeTagName: 'span',
            htmlDisplayType: 'code'
        });

        this._dom.clsAdd('kijs-field-checkbox');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            autocomplete: false,
            captionDisplayType: 'code',
            disableFlex: true
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            autocomplete: { target: 'autocomplete' },   // De-/aktiviert die Browser-Vorschläge
            caption: { target: 'html', context: this._captionDom, prio: 2 },
            captionCls: { fn: 'function', target: this._captionDom.clsAdd, context: this._captionDom },
            captionHide: true,
            captionDisplayType: { target: 'htmlDisplayType', context: this._captionDom, prio: 1 },
            captionStyle: { fn: 'assign', target: 'style', context: this._captionDom },
            captionWidth: { target: 'captionWidth' },

            checkedIconMap: true,
            determinatedIconMap: true,
            uncheckedIconMap: true,

            icon: { target: 'icon' },
            iconChar: { target: 'iconChar', context: this._iconEl },
            iconCls: { target: 'iconCls', context: this._iconEl },
            iconAnimationCls: { target: 'iconAnimationCls', context: this._iconEl },
            iconColor: { target: 'iconColor', context: this._iconEl },
            iconMap: { target: 'iconMap', context: this._iconEl },

            threeState: { prio: 1001, target: '_threeState' },

            valueChecked: { prio: 1002, target: '_valueChecked' },
            valueUnchecked: { prio: 1002, target: '_valueUnchecked' },
            valueDeterminated: { prio: 1002, target: '_valueDeterminated' },

            value: { prio: 1003, target: 'value' },
            checked: { prio: 1004, target: 'checked' }
        });

        // Event-Weiterleitungen von this._inputWrapperDom
        this._eventForwardsAdd('focus', this._inputWrapperDom);
        this._eventForwardsAdd('blur', this._inputWrapperDom);

        // Listeners
        this._labelDom.on('click', this.#onClick, this);
        this._inputWrapperDom.on('click', this.#onClick, this);
        this._inputWrapperDom.on('spacePress', this.#onSpacePress, this);

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }
    }



    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get caption() { return this._captionDom.html; }
    set caption(val) {
        this._captionDom.html = val;
    }

    get captionDom() { return this._captionDom; }

    get captionDisplayType() { return this._captionDom.htmlDisplayType; }
    set captionDisplayType(val) { this._captionDom.htmlDisplayType = val; }

    get captionWidth() { return this._captionDom.width; }
    set captionWidth(val) { this._captionDom.width = val; }

    get checkboxIcon() { return this._checkboxIconEl; }

    get checked() { return this._checked; }
    set checked(val) {
        if (val === 2 || val === '2') {
            this._checked = 2;
        } else if (val === 1 || val === '1' || val === true) {
            this._checked = 1;
        } else if (val === 0 || val === '0' || val === false || kijs.isEmpty(val)) {
            this._checked = 0;
        } else {
            throw new kijs.Error(`config "checked" is not valid.`);
        }
        this._updateCheckboxIcon();
    }

    // overwrite
    get hasFocus() { return this._inputWrapperDom.hasFocus; }

    get icon() { return this._iconEl; }
    /**
     * Icon zuweisen
     * @param {kijs.gui.Icon|Object} val     Icon als icon-Config oder kijs.gui.Icon Element
     */
    set icon(val) {
        // Icon zurücksetzen?
        if (kijs.isEmpty(val)) {
            this._iconEl.iconChar = null;
            this._iconEl.iconCls = null;
            this._iconEl.iconAnimationCls = null;
            this._iconEl.iconColor = null;

        // kijs.gui.Icon Instanz
        } else if (val instanceof kijs.gui.Icon) {
            this._iconEl.destruct();
            this._iconEl = val;

        // Config Objekt
        } else if (kijs.isObject(val)) {
            this._iconEl.applyConfig(val);

        } else {
            throw new kijs.Error(`config "icon" is not valid.`);

        }
        
        if (this.isRendered) {
            this.render();
        }
    }

    get iconAnimationCls() { return this._iconEl.iconAnimationCls; }
    set iconAnimationCls(val) { this._iconEl.iconAnimationCls = val; }

    get iconChar() { return this._iconEl.iconChar; }
    set iconChar(val) { this._iconEl.iconChar = val; }

    get iconCls() { return this._iconEl.iconCls; }
    set iconCls(val) { this._iconEl.iconCls = val; }

    get iconColor() { return this._iconEl.iconColor; }
    set iconColor(val) { this._iconEl.iconColor = val; }

    get iconMap() { return this._iconEl.iconMap; }
    set iconMap(val) { this._iconEl.iconMap = val; }

    get inputWrapperDom() { return this._inputWrapperDom; }

    // overwrite
    get isEmpty() { return this._checked === 0; }

    get threeState() { return this._threeState; }
    set threeState(val) { this._threeState = val; }

    // overwrite
    get value() {
        switch (this._checked) {
            case 0: return this._valueUnchecked;
            case 1: return this._valueChecked;
            case 2: return this._valueDeterminated;
        }
    }
    set value(val) {
        if (val === this._valueUnchecked || val === false || val === 0 || val === '0') {
            this._checked = 0;
        } else if (val === this._valueChecked || val === true || val === 1 || val === '1') {
            this._checked = 1;
        } else if (val === this._valueDeterminated ||val === 2) {
            this._checked = 2;
        } else if (val === null) {
            this._checked = 0;
        } else {
            throw new kijs.Error(`config "value" is not valid.`);
        }
        this._updateCheckboxIcon();
    }

    get valueChecked() { return this._valueChecked; }
    set valueChecked(val) { this._valueChecked = val; }

    get valueDeterminated() { return this._valueDeterminated; }
    set valueDeterminated(val) { this._valueDeterminated = val; }

    get valueUnchecked() { return this._valueUnchecked; }
    set valueUnchecked(val) { this._valueUnchecked = val; }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // overwrite
    focus(alsoSetIfNoTabIndex) {
        return this._inputWrapperDom.focus(alsoSetIfNoTabIndex);
    }

    // overwrite
    render(superCall) {
        super.render(true);

        // Checkbox rendern (kijs.guiDom)
        this._checkboxIconEl.renderTo(this._inputWrapperDom.node);
        this._updateCheckboxIcon();

        // Span icon rendern (kijs.gui.Icon)
        if (!this._iconEl.isEmpty) {
            this._iconEl.renderTo(this._inputWrapperDom.node);
        } else if (this._iconEl.isRendered) {
            this._iconEl.unrender();
        }

        // Span caption rendern (kijs.guiDom)
        if (!this._captionDom.isEmpty) {
            this._captionDom.renderTo(this._inputWrapperDom.node);
        } else if (this._captionDom.isRendered) {
            this._captionDom.unrender();
        }

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

        this._checkboxIconEl.unrender();
        this._iconEl.unrender();
        this._captionDom.unrender();
        super.unrender(true);
    }


    // PROTECTED
    _updateCheckboxIcon() {
        let cls, iconMap;

        switch (this._checked) {
            case 0:
                cls = 'kijs-unchecked';
                iconMap = this._uncheckedIconMap;
                break;

            case 1:
                cls = 'kijs-checked';
                iconMap = this._checkedIconMap;
                break;

            case 2:
                cls = 'kijs-determinated';
                iconMap = this._determinatedIconMap;
                break;
        }

        this._dom.clsRemove(['kijs-checked', 'kijs-determinated', 'kijs-unchecked']);
        this._dom.clsAdd(cls);
        this._checkboxIconEl.iconMap = iconMap;
    }

    // overwrite
    _validateRequired(value, ignoreEmpty) {
        if (this._required) {
            if (!value) {
                this._errors.push(kijs.getText('Dieses Feld darf nicht leer sein'));
            }
        }
    }


    // PRIVATE
    // LISTENERS
    #onClick(e) {
        if (!this.readOnly && !this.disabled) {
            const oldChecked = this._checked;
            const oldValue = this.value;

            this._checked ++;

            if (this._threeState) {
                if (this._checked > 2) {
                    this._checked = 0;
                }
            } else {
                if (this._checked > 1) {
                    this._checked = 0;
                }
            }

            this._updateCheckboxIcon();
            this._checkboxIconEl.focus();
            this.validate();

            this.raiseEvent('input', {
                checked: this._checked,
                oldChecked: oldChecked,
                value: this.value,
                oldValue: oldValue
            });
            this.raiseEvent('change', {
                checked: this._checked,
                oldChecked: oldChecked,
                value: this.value,
                oldValue: oldValue
            });
        }
    }

    #onSpacePress(e) {
        if (!this.readOnly && !this.disabled) {
            const oldChecked = this._checked;
            const oldValue = this.value;

            this._checked ++;

            if (this._threeState) {
                if (this._checked > 2) {
                    this._checked = 0;
                }
            } else {
                if (this._checked > 1) {
                    this._checked = 0;
                }
            }

            this._updateCheckboxIcon();
            this.validate();

            this.raiseEvent('change', {
                checked: this._checked,
                oldChecked: oldChecked,
                value: this.value,
                oldValue: oldValue
            });
        }
        // Bildlauf der Space-Taste verhindern
        e.nodeEvent.preventDefault();
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

        // Elemente/DOM-Objekte entladen
        if (this._checkboxIconEl) {
            this._checkboxIconEl.destruct();
        }

        if (this._iconEl) {
            this._iconEl.destruct();
        }

        if (this._captionDom) {
            this._captionDom.destruct();
        }

        // Variablen (Objekte/Arrays) leeren
        this._checkboxIconEl = null;
        this._iconEl = null;
        this._captionDom = null;

        // Basisklasse entladen
        super.destruct(true);
    }

};
