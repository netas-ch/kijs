/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.field.Checkbox
// --------------------------------------------------------------
/**
 * Checkbox mit Beschriftung (caption) und optionalem Icon. Mit threeState gibt es einen
 * dritten Zustand (determinated). Umgeschaltet wird mit Klick auf Checkbox oder Label und mit
 * der Leertaste. Welcher Wert zu welchem Zustand gehört, bestimmen valueChecked,
 * valueUnchecked und valueDeterminated.
 *
 * @example
 * new kijs.gui.field.Checkbox({ label: 'Newsletter', caption: 'abonnieren', name: 'newsletter' });
 *
 * @fires blur  Weitergeleitet vom Eingabebereich
 * @fires change  Nach dem Umschalten durch den Benutzer (Klick oder Leertaste) und nach clear().
 *                e: checked, oldChecked, value, oldValue
 * @fires input  Nach dem Umschalten mit einem Klick (nicht mit der Leertaste).
 *               e: checked, oldChecked, value, oldValue
 */
kijs.gui.field.Checkbox = class kijs_gui_field_Checkbox extends kijs.gui.field.Field {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        // overwrite
        this._valuesMapping = {
            name: { valueProperty: 'value', emptyValue: false }
        };
        
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
            clearButtonCls: '',
            captionDisplayType: 'code',
            disableFlex: true
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            caption: { target: 'html', context: this._captionDom, prio: 2 },
            captionCls: { fn: 'function', target: this._captionDom.clsAdd, context: this._captionDom },   // {String|Array} CSS-Klassen der Beschriftung
            captionDisplayType: { target: 'htmlDisplayType', context: this._captionDom, prio: 1 },
            captionStyle: { fn: 'assign', target: 'style', context: this._captionDom },   // {Object} CSS-Styles der Beschriftung
            captionWidth: { target: 'captionWidth' },

            checkedIconMap: true,   // {String} Icon der Checkbox im Zustand checked. Default: 'kijs.iconMap.Fa.check'
            determinatedIconMap: true,   // {String} Icon der Checkbox im Zustand determinated. Default: 'kijs.iconMap.Fa.minus'
            uncheckedIconMap: true,   // {String|null} Icon der Checkbox im Zustand unchecked. Default: null

            icon: { target: 'icon' },
            iconChar: { target: 'iconChar', context: this._iconEl },   // {Number} Zeichen des Icons (siehe kijs.gui.Icon.iconChar)
            iconCls: { target: 'iconCls', context: this._iconEl },   // {String} CSS-Klasse des Icons
            iconAnimationCls: { target: 'iconAnimationCls', context: this._iconEl },   // {String} CSS-Klasse für eine Animation des Icons
            iconColor: { target: 'iconColor', context: this._iconEl },   // {String} Farbe des Icons
            iconMap: { target: 'iconMap', context: this._iconEl },   // {String|Object} Icon aus einer iconMap, z.B. 'kijs.iconMap.Fa.house'

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
    /**
     * Beschriftung rechts der Checkbox
     * @type {String}
     */
    get caption() { return this._captionDom.html; }
    set caption(val) {
        this._captionDom.html = val;
    }

    /**
     * Darstellung der Beschriftung: 'html', 'code' oder 'text'. Default: 'code'
     * @type {String}
     */
    get captionDisplayType() { return this._captionDom.htmlDisplayType; }
    set captionDisplayType(val) { this._captionDom.htmlDisplayType = val; }

    /**
     * kijs.gui.Dom der Beschriftung
     * @type {kijs.gui.Dom}
     */
    get captionDom() { return this._captionDom; }

    /**
     * Breite der Beschriftung in Pixel
     * @type {Number|null}
     */
    get captionWidth() { return this._captionDom.width; }
    set captionWidth(val) { this._captionDom.width = val; }

    /**
     * Icon der Checkbox selbst
     * @type {kijs.gui.Icon}
     */
    get checkboxIcon() { return this._checkboxIconEl; }

    /**
     * Zustand: 0 = unchecked, 1 = checked, 2 = determinated. Der Setter akzeptiert auch
     * true, false, leer und die Zahlen als String.
     * @type {Number}
     */
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
        this._updateClearButtonVisibility();
    }

    /**
     * Hat der Eingabebereich den Fokus?
     * @type {Boolean}
     */
    // overwrite
    get hasFocus() { return this._inputWrapperDom.hasFocus; }

    /**
     * Zusätzliches Icon vor der Beschriftung: Config-Objekt oder kijs.gui.Icon. Leer setzt es zurück.
     * Der Getter gibt die kijs.gui.Icon-Instanz zurück.
     * @type {kijs.gui.Icon|Object|null}
     */
    get icon() { return this._iconEl; }
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

    /**
     * CSS-Klasse für eine Animation des Icons
     * @type {String|null}
     */
    get iconAnimationCls() { return this._iconEl.iconAnimationCls; }
    set iconAnimationCls(val) { this._iconEl.iconAnimationCls = val; }

    /**
     * Zeichen des Icons (siehe kijs.gui.Icon.iconChar)
     * @type {Number}
     */
    get iconChar() { return this._iconEl.iconChar; }
    set iconChar(val) { this._iconEl.iconChar = val; }

    /**
     * CSS-Klasse des Icons
     * @type {String|null}
     */
    get iconCls() { return this._iconEl.iconCls; }
    set iconCls(val) { this._iconEl.iconCls = val; }

    /**
     * Farbe des Icons
     * @type {String}
     */
    get iconColor() { return this._iconEl.iconColor; }
    set iconColor(val) { this._iconEl.iconColor = val; }

    /**
     * Icon aus einer iconMap (siehe kijs.gui.Icon.iconMap)
     * @type {String|Object}
     */
    get iconMap() { return this._iconEl.iconMap; }
    set iconMap(val) { this._iconEl.iconMap = val; }

    /**
     * kijs.gui.Dom des Eingabebereichs (Checkbox, Icon und Beschriftung)
     * @type {kijs.gui.Dom}
     */
    get inputWrapperDom() { return this._inputWrapperDom; }

    /**
     * Leer im Zustand unchecked
     * @type {Boolean}
     */
    // overwrite
    get isEmpty() { return this._checked === 0; }

    /**
     * Kann der Benutzer auch den dritten Zustand (determinated) wählen? Default: false
     * @type {Boolean}
     */
    get threeState() { return this._threeState; }
    set threeState(val) { this._threeState = val; }

    /**
     * Wert des aktuellen Zustands (valueChecked, valueUnchecked oder valueDeterminated).
     * Der Setter akzeptiert diese Werte sowie true/false, 0/1/2, '0'/'1' und null.
     * @type {*}
     */
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
        this._updateClearButtonVisibility();
    }

    /**
     * Wert im Zustand checked. Default: true
     * @type {*}
     */
    get valueChecked() { return this._valueChecked; }
    set valueChecked(val) { this._valueChecked = val; }

    /**
     * Wert im Zustand determinated. Default: 2
     * @type {*}
     */
    get valueDeterminated() { return this._valueDeterminated; }
    set valueDeterminated(val) { this._valueDeterminated = val; }

    /**
     * Wert im Zustand unchecked. Default: false
     * @type {*}
     */
    get valueUnchecked() { return this._valueUnchecked; }
    set valueUnchecked(val) { this._valueUnchecked = val; }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    /**
     * Setzt den Fokus auf den Eingabebereich
     * @param {Boolean} [alsoSetIfNoTabIndex=false]  siehe kijs.gui.Dom.focus
     * @returns {HTMLElement|null|false}
     */
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
    /**
     * Setzt CSS-Klasse und Icon der Checkbox passend zum Zustand
     * @returns {undefined}
     */
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

    /**
     * Eingabe erforderlich validieren: Fehler, wenn der Wert falsy ist (z.B. unchecked mit valueUnchecked=false)
     * @param {*} value
     * @param {Boolean} ignoreEmpty
     * @returns {undefined}
     */
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
