/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.field.Switch
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
kijs.gui.field.Switch = class kijs_gui_field_Switch extends kijs.gui.field.Field {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        this._checked = 0;                          // 0=unchecked, 1=checked

        this._valueChecked = true;
        this._valueUnchecked = false;
        this._dragPosXStart = null;
        this._dragHasDistance = false;
        
        this._inputDom = new kijs.gui.Dom({
            cls: 'kijs-toggleBorder',
            nodeTagName: 'div'
        });
        this._inputDom.nodeAttributeSet('tabIndex', 0);

        this._togglePointDom = new kijs.gui.Dom({
            cls: 'kijs-togglePoint',
            nodeTagName: 'div',
            on: {
                mouseDown: this.#onMouseDown,
                context: this
            }
        });
        
        // Touch-Devices
        if (kijs.Navigator.isTouch) {
            this._togglePointDom.on('touchStart', this.#onTouchStart, this);
        }

        this._iconEl = new kijs.gui.Icon({
            parent: this
        });

        this._captionDom = new kijs.gui.Dom({
            cls: 'kijs-caption',
            nodeTagName: 'span',
            htmlDisplayType: 'code'
        });

        this._dom.clsAdd('kijs-field-switch');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            captionDisplayType: 'code',
            disableFlex: true
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            caption: { target: 'html', context: this._captionDom, prio: 2 },
            captionCls: { fn: 'function', target: this._captionDom.clsAdd, context: this._captionDom },
            captionHide: true,
            captionDisplayType: { target: 'htmlDisplayType', context: this._captionDom, prio: 1 },
            captionStyle: { fn: 'assign', target: 'style', context: this._captionDom },
            captionWidth: { target: 'captionWidth' },

            icon: { target: 'icon' },
            iconChar: { target: 'iconChar', context: this._iconEl },
            iconCls: { target: 'iconCls', context: this._iconEl },
            iconAnimationCls: { target: 'iconAnimationCls', context: this._iconEl },
            iconColor: { target: 'iconColor', context: this._iconEl },
            iconMap: { target: 'iconMap', context: this._iconEl },

            valueChecked: { prio: 1002, target: '_valueChecked' },
            valueUnchecked: { prio: 1002, target: '_valueUnchecked' },

            value: { prio: 1003, target: 'value' },
            checked: { prio: 1004, target: 'checked' }
        });

        // Event-Weiterleitungen von this._inputDom
        this._eventForwardsAdd('focus', this._inputDom);
        this._eventForwardsAdd('blur', this._inputDom);

        // Listeners
        this._labelDom.on('click', this.#onClick, this);
        this._inputWrapperDom.on('click', this.#onClick, this);
        this._inputDom.on('spacePress', this.#onSpacePress, this);

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

    get checked() { return this._checked; }
    set checked(val) {
        if (val === 1 || val === '1' || val === true) {
            this._checked = 1;
        } else if (val === 0 || val === '0' || val === false || kijs.isEmpty(val)) {
            this._checked = 0;
        } else {
            throw new kijs.Error(`config "checked" is not valid.`);
        }
        this._updateTogglePoint(this._checked);
    }

    // overwrite
    get hasFocus() { return this._inputDom.hasFocus; }

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

    // overwrite
    get value() {
        switch (this._checked) {
            case 0: return this._valueUnchecked;
            case 1: return this._valueChecked;
        }
    }
    set value(val) {
        if (val === this._valueUnchecked || val === false || val === 0 || val === '0') {
            this._checked = 0;
        } else if (val === this._valueChecked || val === true || val === 1 || val === '1') {
            this._checked = 1;
        } else if (val === null) {
            this._checked = 0;
        } else {
            throw new kijs.Error(`config "value" is not valid.`);
        }
        this._updateTogglePoint(this._checked);
    }

    get valueChecked() { return this._valueChecked; }
    set valueChecked(val) { this._valueChecked = val; }

    get valueUnchecked() { return this._valueUnchecked; }
    set valueUnchecked(val) { this._valueUnchecked = val; }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // overwrite
    focus(alsoSetIfNoTabIndex) {
        return this._inputDom.focus(alsoSetIfNoTabIndex);
    }

    // overwrite
    render(superCall) {
        super.render(true);

        // Toggle-Border rendern (kijs.guiDom)
        this._inputDom.renderTo(this._inputWrapperDom.node);

        // Toggle-Punkt rendern (kijs.guiDom)
        this._togglePointDom.renderTo(this._inputDom.node);
        this._updateTogglePoint(this._checked);

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

        this._togglePointDom.unrender();
        this._inputDom.unrender();
        this._iconEl.unrender();
        this._captionDom.unrender();
        super.unrender(true);
    }


    // PROTECTED
    _dragEnd(e) {
        const checked = this._dom.clsHas('kijs-checked') ? 1 : 0;

        this._togglePointDom.style.marginLeft = null;
        
        // Wurde ein Weg von mehr als 1 Pixel zurückgelegt: Click-Event verhindern
        if (this._dragHasDistance) {
            kijs.defer(function(){
                this._dragHasDistance = false;
            }, 50, this);
        }
        
        if (checked !== this._checked) {
            // focus setzen
            this.focus();

            const oldChecked = this._checked;
            const oldValue = this.value;

            this._checked = checked;

            //this._updateTogglePoint(this._checked);
            this.validate();

            this.raiseEvent('change', {
                checked: this._checked,
                oldChecked: oldChecked,
                value: this.value,
                oldValue: oldValue
            });
        }
        this._dragPosXStart = null;
    }
    
    _dragMove(x) {
        let deltaX = x - this._dragPosXStart;

        // Max Position berechnen
        const max = this._inputDom.width - this._togglePointDom.height;

        // Falls checked muss noch das bestehende margin addiert wird
        if (this._checked) {
            deltaX += max;
        }

        // Begrenzen auf Min/Max-Werte
        if (deltaX > max) {
            deltaX = max;
        } else if (deltaX < 0) {
            deltaX = 0;
        }
        
        // Wurde ein Weg von mehr als 1 Pixel zurückgelegt, dann wird später das
        // Click-Event verhindert.
        if (deltaX > 1) {
            this._dragHasDistance = true;
        }
        
        // In der Mitte ist die Schaltschwelle
        const checked = deltaX > max/2 ? 1 : 0;
        this._updateTogglePoint(checked);

        this._togglePointDom.style.marginLeft = deltaX + 'px';
    }
    
    _dragStart(x) {
        // Startposition merken
        this._dragPosXStart = x;
    }

    _updateTogglePoint(checked) {
        let cls;
        
        if (checked) {
            cls = 'kijs-checked';
        } else {
            cls = 'kijs-unchecked';
        }

        this._dom.clsRemove(['kijs-checked', 'kijs-unchecked']);
        this._dom.clsAdd(cls);
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
        if (!this.readOnly && !this.disabled && !this._dragHasDistance) {
            const oldChecked = this._checked;
            const oldValue = this.value;

            this._checked = this._checked ? 0 : 1;

            this._updateTogglePoint(this._checked);
            this._inputDom.focus();
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

            this._checked = this._checked ? 0 : 1;

            this._updateTogglePoint(this._checked);
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
    
    #onMouseDown(e) {
        if (!this.readOnly && !this.disabled) {
            this._dragStart(e.nodeEvent.clientX);
        
            // mouseMove und mouseUp Listeners aufs document setzen
            kijs.Dom.addEventListener('mousemove', document, this.#onMouseMove, this);
            kijs.Dom.addEventListener('mouseup', document, this.#onMouseUp, this);
        }
    }
    
    #onMouseMove(e) {
        if (!this.readOnly && !this.disabled && this._dragPosXStart !== null) {
            this._dragMove(e.nodeEvent.clientX);
        }
    }
    
    #onMouseUp(e) {
        // Beim ersten Auslösen des Listeners, gleich wieder entfernen
        kijs.Dom.removeEventListener('mousemove', document, this);
        kijs.Dom.removeEventListener('mouseup', document, this);

        if (!this.readOnly && !this.disabled && this._dragPosXStart !== null) {
            this._dragEnd(e);
        }
    }
    
    #onTouchEnd(e) {
        // Beim ersten Auslösen des Listeners, gleich wieder entfernen
        this._inputWrapperDom.off('touchMove', this.#onTouchMove, this);
        this._inputWrapperDom.off('touchEnd', this.#onTouchEnd, this);
        
        if (!this.readOnly && !this.disabled && this._dragPosXStart !== null) {
            this._dragEnd(e);
        }
    }
    
    #onTouchMove(e) {
        if (!this.readOnly && !this.disabled && this._dragPosXStart !== null) {
            this._dragMove(e.nodeEvent.touches[0].clientX);

            // Bubbeling und native Listeners verhindern
            e.nodeEvent.stopPropagation();
            e.nodeEvent.preventDefault();
        }
    }
    
    #onTouchStart(e) {
        if (!this.readOnly && !this.disabled) {
            this._dragStart(e.nodeEvent.touches[0].clientX);
            
            // touchMove und touchEnd Listeners setzen
            this._inputWrapperDom.on('touchMove', this.#onTouchMove, this);
            this._inputWrapperDom.on('touchEnd', this.#onTouchEnd, this);
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

        // Elemente/DOM-Objekte entladen
        if (this._togglePointDom) {
            this._togglePointDom.destruct();
        }

        if (this._inputDom) {
            this._inputDom.destruct();
        }

        if (this._iconEl) {
            this._iconEl.destruct();
        }

        if (this._captionDom) {
            this._captionDom.destruct();
        }

        // Variablen (Objekte/Arrays) leeren
        this._togglePointDom = null;
        this._inputDom = null;
        this._iconEl = null;
        this._captionDom = null;

        // Basisklasse entladen
        super.destruct(true);
    }

};
