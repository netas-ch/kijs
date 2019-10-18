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
    constructor(config={}) {
        super(false);

        this._captionHide = false;                  // caption ausblenden?

        this._checked = 0;                          // 0=checked, 1=unchecked, 2=indeterminated

        this._checkedIconChar = '&#xf046';          // Radio-Style: '&#xf05d' oder '&#xf111'
        this._checkedIconCls = null;
        this._determinatedIconChar = '&#xf147';
        this._determinatedIconCls = null;
        this._uncheckedIconChar = '&#xf096';        // Radio-Style: '&#xf10c'
        this._uncheckedIconCls = null;

        this._threeState = false;                   // Erreichen des dritte Status "Intermediate" per Klick möglich?

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
            nodeTagName: 'span'
        });

        this._dom.clsAdd('kijs-field-checkbox');

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            caption: { target: 'html', context: this._captionDom },
            captionCls: { fn: 'function', target: this._captionDom.clsAdd, context: this._captionDom },
            captionHide: true,
            captionHtmlDisplayType: { target: 'htmlDisplayType', context: this._captionDom },
            captionStyle: { fn: 'assign', target: 'style', context: this._captionDom },
            captionWidth: { target: 'captionWidth' },

            checkedIconChar: true,
            checkedIconCls: true,
            determinatedIconChar: true,
            determinatedIconCls: true,
            uncheckedIconChar: true,
            uncheckedIconCls: true,

            icon: { target: 'icon' },
            iconChar: { target: 'iconChar', context: this._iconEl },
            iconCls: { target: 'iconCls', context: this._iconEl },
            iconColor: { target: 'iconColor', context: this._iconEl },

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
        this._inputWrapperDom.on('click', this._onClick, this);
        this._inputWrapperDom.on('spacePress', this._onSpacePress, this);

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

    get captionHide() { return this._captionHide; }
    set captionHide(val) {
        this._captionHide = val;
        if (this.isRendered) {
            if (val) {
                this._captionDom.renderTo(this._inputWrapperDom.node, this._inputDom.node);
            } else {
                this._captionDom.unrender();
            }
        }
    }

    get captionDom() { return this._captionDom; }

    get captionHtmlDisplayType() { return this._captionDom.htmlDisplayType; }
    set captionHtmlDisplayType(val) { this._captionDom.htmlDisplayType = val; }

    get captionWidth() { return this._captionDom.width; }
    set captionWidth(val) { this._captionDom.width = val; }

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

    get checkboxIcon() { return this._checkboxIconEl; }

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
            this._iconEl.iconColor = null;
            if (this.isRendered) {
                this.render();
            }

        // kijs.gui.Icon Instanz
        } else if (val instanceof kijs.gui.Icon) {
            this._iconEl.destruct();
            this._iconEl = val;
            if (this.isRendered) {
                this.render();
            }

        // Config Objekt
        } else if (kijs.isObject(val)) {
            this._iconEl.applyConfig(val);
            if (this.isRendered) {
                this.render();
            }

        } else {
            throw new kijs.Error(`config "icon" is not valid.`);

        }
    }

    get iconChar() { return this._iconEl.iconChar; }
    set iconChar(val) {
        this._iconEl.iconChar = val;
        if (this.isRendered) {
            this.render();
        }
    }

    get iconCls() { return this._iconEl.iconCls; }
    set iconCls(val) {
        this._iconEl.iconCls = val;
        if (this.isRendered) {
            this.render();
        }
    }

    get iconColor() { return this._iconEl.iconColor; }
    set iconColor(val) {
        this._iconEl.iconColor = val;
        if (this.isRendered) {
            this.render();
        }
    }

    // overwrite
    get isEmpty() { return kijs.isEmpty(this._checked === 0); }

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
        this.validate();
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
    render(superCall) {
        super.render(true);

        // Checkbox rendern (kijs.guiDom)
        this._checkboxIconEl.renderTo(this._inputWrapperDom.node);
        this._updateCheckboxIcon();

        // Span icon rendern (kijs.gui.Icon)
        if (!this._iconEl.isEmpty) {
            this._iconEl.renderTo(this._inputWrapperDom.node);
        } else {
            this._iconEl.unrender();
        }

        // Span caption rendern (kijs.guiDom)
        if (!this._captionHide) {
            this._captionDom.renderTo(this._inputWrapperDom.node);
        } else {
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
        let cls, iconChar, iconCls;

        switch (this._checked) {
            case 0:
                cls = 'kijs-unchecked';
                iconChar = this._uncheckedIconChar;
                iconCls = this._uncheckedIconCls;
                break;

            case 1:
                cls = 'kijs-checked';
                iconChar = this._checkedIconChar;
                iconCls = this._checkedIconCls;
                break;

            case 2:
                cls = 'kijs-determinated';
                iconChar = this._determinatedIconChar;
                iconCls = this._determinatedIconCls;
                break;
        }

        this._dom.clsRemove(['kijs-checked', 'kijs-determinated', 'kijs-unchecked']);
        this._dom.clsAdd(cls);
        this._checkboxIconEl.iconChar = iconChar;
        this._checkboxIconEl.iconCls = iconCls;
    }


    // LISTENERS
    _onClick(e) {
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

            this.raiseEvent(['input', 'change'], { oldChecked: oldChecked, checked: this._checked, oldValue: oldValue, value: this.value } );
        }
    }

    _onSpacePress(e) {
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

            this.raiseEvent(['input', 'change'], { oldChecked: oldChecked, checked: this._checked, oldValue: oldValue, value: this.value } );
        }
        // Bildlauf der Space-Taste verhindern
        e.nodeEvent.preventDefault();
    }


    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
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
