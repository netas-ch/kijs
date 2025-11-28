/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.field.Field (Abstract)
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
kijs.gui.field.Field = class kijs_gui_field_Field extends kijs.gui.Container {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        // Falls ein Feld mehrere Werte zurückgibt oder einen anderen Wert als null bei leer hat,
        // muss diese Variable in der abgeleiteten Klasse überschrieben werden
        this._valuesMapping = {
            name: { valueProperty: 'value', emptyValue: null }
        };

        this._labelHide = false;
        this._clearable = false;
        this._errors = [];
        this._maxLength = null;
        this._minLength = null;
        this._initialValues = {};
        this._required = false;
        this._submitValueEnable = true;
        this._validationFn = null;
        this._validationFnContext = this;
        this._validationRegExps = [];

        this._inputId = kijs.uniqId('kijs_-_input_');

        this._labelDom = new kijs.gui.Dom({
            cls: 'kijs-label',
            nodeTagName: 'label',
            htmlDisplayType: 'code',
            nodeAttribute: {
                htmlFor: this._inputId
            }
        });
        
        this._contentDom = new kijs.gui.Dom({
            cls: 'kijs-content'
        });

        this._inputWrapperDom = new kijs.gui.Dom({
            cls: 'kijs-inputwrapper'
        });

        this._clearButtonEl = new kijs.gui.Button({
            parent: this,
            iconMap: 'kijs.iconMap.Fa.xmark',
            disableFlex: true,
            visible: false,
            nodeAttribute: {
                tabIndex: -1
            },
            on: {
                click: this.#onClearButtonClick,
                context: this
            }
        });

        this._errorIconEl = new kijs.gui.Icon({
            parent: this,
            iconMap: 'kijs.iconMap.Fa.circle-info',
            cls: 'kijs-icon-error',
            tooltip: new kijs.gui.Tooltip({ cls: 'kijs-error' }),
            visible: false
        });

        this._helpIconEl = new kijs.gui.Icon({
            parent: this,
            iconMap: 'kijs.iconMap.Fa.circle-question',
            cls: 'kijs-icon-help',
            tooltip: new kijs.gui.Tooltip({ cls: 'kijs-help' }),
            visible: false
        });
        
        this._dom.clsRemove('kijs-container');
        this._dom.clsAdd('kijs-field');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            waitMaskTargetDomProperty: 'inputWrapperDom',
            isDirty: false
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            disableFlex: { target: 'disableFlex' }, // false=ganze Breite wird genutzt, true=nur die benötigte Breite wird genutzt
            labelPosition: { target: 'labelPosition' },
            isDirty: { target: 'isDirty', prio: 3000 },
            
            inputHeight: { target: 'inputHeight' },
            inputWidth: { target: 'inputWidth' },
            
            label: { target: 'html', context: this._labelDom, prio: 2 },
            labelCls: { fn: 'function', target: this._labelDom.clsAdd, context: this._labelDom },
            labelHide: true,
            labelDisplayType: { target: 'htmlDisplayType', context: this._labelDom },
            labelStyle: { fn: 'assign', target: 'style', context: this._labelDom },
            labelWidth: { target: 'labelWidth' },

            clearable: { target: 'clearable' }, // Button zum Leeren anzeigen?
            clearButtonIconChar: { target: 'iconChar', context: this._clearButtonEl },
            clearButtonIconCls: { target: 'iconCls', context: this._clearButtonEl },
            clearButtonIconColor: { target: 'iconColor', context: this._clearButtonEl },
            clearButtonIconMap: { target: 'iconMap', context: this._clearButtonEl },

            errorIcon: { target: 'errorIcon' },
            errorIconChar: { target: 'iconChar', context: this._errorIconEl },
            errorIconCls: { target: 'iconCls', context: this._errorIconEl },
            errorIconColor: { target: 'iconColor', context: this._errorIconEl },
            errorIconMap: { target: 'iconMap', context: this._errorIconEl },

            helpIcon: { target: 'helpIcon' },
            helpIconChar: { target: 'iconChar', context: this._helpIconEl },
            helpIconCls: { target: 'iconCls', context: this._helpIconEl },
            helpIconColor: { target: 'iconColor', context: this._helpIconEl },
            helpIconMap: { target: 'iconMap', context: this._helpIconEl },
            helpText: { target: 'helpText' },

            value: { target: 'value', prio: 1000 },

            maxLength: true,
            minLength: true,
            readOnly: { target: 'readOnly' },   // deaktiviert das Feld, die Buttons bleiben aber aktiv (siehe auch disabled)
            required: { target: 'required' },   // Eingabe erforderlich?
            submitValueEnable: true,    // Soll der Wert in einem container.Form übermittelt werden?

            validationFn: { target: 'validationFn' },
            validationFnContext: { target: 'validationFnContext' },
            validationRegExp: { fn: 'function', target: this.addValidationRegExp, context: this }
        });

        // Listeners
        this.on('change', this.#onChange, this);
        
        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }
    }



    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get clearable() { return this._clearable; }
    set clearable(val) {
        let doRender = this._clearable !== !!val;

        this._clearable = !!val;

        if (doRender && this.isRendered) {
            this.render();
        }
    }

    get clearButtonIconChar() { return this._clearButtonEl.iconChar; }
    set clearButtonIconChar(val) { this._clearButtonEl.iconChar = val; }

    get clearButtonIconCls() { return this._clearButtonEl.iconCls; }
    set clearButtonIconCls(val) { this._clearButtonEl.iconCls = val; }

    get clearButtonIconColor() { return this._clearButtonEl.iconColor; }
    set clearButtonIconColor(val) { this._clearButtonEl.iconColor = val; }

    get clearButtonIconMap() { return this._clearButtonEl.iconMap; }
    set clearButtonIconMap(val) { this._clearButtonEl.iconMap = val; }


    get contentDom() { return this._contentDom; }
    
    get disableFlex() { return this._dom.clsHas('kijs-disableFlex'); }
    set disableFlex(val) {
        if (val) {
            this._dom.clsAdd('kijs-disableFlex');
        } else {
            this._dom.clsRemove('kijs-disableFlex');
        }
        if (this.isRendered) {
            this.render();
        }
    }

    get errorIcon() { return this._errorIconEl; }
    /**
     * Icon zuweisen
     * @param {kijs.gui.Icon|Object} val     Icon als icon-Config oder kijs.gui.Icon Element
     */
    set errorIcon(val) {
        // Icon zurücksetzen?
        if (kijs.isEmpty(val)) {
            this._errorIconEl.iconChar = null;
            this._errorIconEl.iconCls = null;
            this._errorIconEl.iconColor = null;
            if (this.isRendered) {
                this.render();
            }

        // kijs.gui.Icon Instanz
        } else if (val instanceof kijs.gui.Icon) {
            this._errorIconEl.destruct();
            this._errorIconEl = val;
            if (this.isRendered) {
                this.render();
            }

        // Config Objekt
        } else if (kijs.isObject(val)) {
            this._errorIconEl.applyConfig(val);
            if (this.isRendered) {
                this.render();
            }

        } else {
            throw new kijs.Error(`config "errorIcon" is not valid.`);

        }
    }

    get errorIconChar() { return this._errorIconEl.iconChar; }
    set errorIconChar(val) { this._errorIconEl.iconChar = val; }

    get errorIconCls() { return this._errorIconEl.iconCls; }
    set errorIconCls(val) { this._errorIconEl.iconCls = val; }

    get errorIconColor() { return this._errorIconEl.iconColor; }
    set errorIconColor(val) { this._errorIconEl.iconColor = val;}

    get errorIconMap() { return this._errorIconEl.iconMap; }
    set errorIconMap(val) { this._errorIconEl.iconMap = val;}

    get helpIcon() { return this._helpIconEl; }
    /**
     * Icon zuweisen
     * @param {kijs.gui.Icon|Object} val     Icon als icon-Config oder kijs.gui.Icon Element
     */
    set helpIcon(val) {
        // Icon zurücksetzen?
        if (kijs.isEmpty(val)) {
            this._helpIconEl.iconChar = null;
            this._helpIconEl.iconCls = null;
            this._helpIconEl.iconColor = null;

        // kijs.gui.Icon Instanz
        } else if (val instanceof kijs.gui.Icon) {
            this._helpIconEl.destruct();
            this._helpIconEl = val;
            if (this.isRendered) {
                this.render();
            }

        // Config Objekt
        } else if (kijs.isObject(val)) {
            this._helpIconEl.applyConfig(val);
            if (this.isRendered) {
                this._helpIconEl.render();
            }

        } else {
            throw new kijs.Error(`config "helpIcon" is not valid.`);

        }
    }

    get helpIconChar() { return this._helpIconEl.iconChar; }
    set helpIconChar(val) { this._helpIconEl.iconChar = val; }

    get helpIconCls() { return this._helpIconEl.iconCls; }
    set helpIconCls(val) { this._helpIconEl.iconCls = val; }

    get helpIconColor() { return this._helpIconEl.iconColor; }
    set helpIconColor(val) { this._helpIconEl.iconColor = val; }

    get helpIconMap() { return this._helpIconEl.iconMap; }
    set helpIconMap(val) { this._helpIconEl.iconMap = val; }

    get helpText() { return this._helpIconEl.tooltip.html; }
    set helpText(val) {
        this._helpIconEl.tooltip = val;
        this._helpIconEl.visible = this._helpIconEl.tooltip && !kijs.isEmpty(this._helpIconEl.tooltip.html);
    }
    
    get inputHeight() { return this._inputWrapperDom.height; }
    set inputHeight(val) {
        this._inputWrapperDom.height = val;
        // Evtl. afterResize-Event zeitversetzt auslösen
        if (this.isRendered && this._hasSizeChanged(null, val)) {
            this._raiseAfterResizeEvent(true);
        }
    }

    get inputWidth() { return this._inputWrapperDom.width; }
    set inputWidth(val) {
        this._inputWrapperDom.width = val;
        // Bei fixer Breite: flex:none verwenden
        if (!kijs.isEmpty(val)) {
            this._inputWrapperDom.style.flex = 'none';
        } else {
            this._inputWrapperDom.style.flex = null;
        }
        // Evtl. afterResize-Event zeitversetzt auslösen
        if (this.isRendered && this._hasSizeChanged(null, val)) {
            this._raiseAfterResizeEvent(true);
        }
    }
    get inputWrapperDom() { return this._inputWrapperDom; }

    get isDirty() {
        let isDirty = false;
        if (!this.disabled) {
            kijs.Object.each(this._valuesMapping, function(key, map) {
                isDirty = isDirty || this._compareIsDirty(this._initialValues[map.valueProperty], this[map.valueProperty]);
            }, this);
        }
        return isDirty;
    }
    set isDirty(val) {
        if (val) {
            throw new Error(`"isDirty" cannot be set to true.`);

        } else {
            this._initialValues = {};
            kijs.Object.each(this._valuesMapping, function(key, map) {
                this._initialValues[map.valueProperty] = this[map.valueProperty];
            }, this);
        }
    }

    get label() { return this._labelDom.html; }
    set label(val) {
        this._labelDom.html = val;
    }

    get labelDom() { return this._labelDom; }

    get labelHide() { return this._labelHide; }
    set labelHide(val) {
        this._labelHide = val;
        if (this.isRendered) {
            if (val) {
                this._labelDom.unrender();
            } else {
                this._labelDom.renderTo(this._dom.node, this._contentDom.node);
            }
        }
    }

    get labelDisplayType() { return this._labelDom.htmlDisplayType; }
    set labelDisplayType(val) { this._labelDom.htmlDisplayType = val; }

    get labelPosition() {
        if (this._dom.clsHas('kijs-labelpos-top')) {
            return 'top';
        } else if (this._dom.clsHas('kijs-labelpos-auto')) {
             return 'auto';
        } else {
            return 'left';
        }
    }
    set labelPosition(val) {
        if (!kijs.Array.contains(['auto', 'left', 'top'], val)) {
            throw new kijs.Error(`config "labelPosition" is not valid.`);
        }
        
        let cls = '';
        switch (val) {
            case 'top':
                cls = 'kijs-labelpos-top';
                break;
                
            case 'auto':
                cls = 'kijs-labelpos-auto';
                break;
                
            case 'left':
                cls = '';
                break;
                
        }
        
        this._dom.clsRemove('kijs-labelpos-top');
        this._dom.clsRemove('kijs-labelpos-auto');
        
        if (cls) {
            this._dom.clsAdd(cls);
        }
        
        if (this.isRendered) {
            this.render();
        }
    }
    
    get labelWidth() { return this._labelDom.width; }
    set labelWidth(val) { this._labelDom.width = val; }

    get readOnly() { return this._dom.clsHas('kijs-readonly'); }
    set readOnly(val) {
        if (val) {
            this._dom.clsAdd('kijs-readonly');
        } else {
            this._dom.clsRemove('kijs-readonly');
        }
    }

    get required() { return this._required; }
    set required(val) { this._required = !!val; }

    // false, falls der Wert vom Feld nicht übermittelt werden soll.
    get submitValueEnable() { return this._submitValueEnable; }
    set submitValueEnable(val) { this._submitValueEnable = !!val; }

    get validationFn() { return this._validationFn; }
    set validationFn(val) {
        let fn = kijs.getFunctionFromString(val);
        if (kijs.isFunction(fn)) {
            this._validationFn = fn;
        } else {
            throw new kijs.Error(`config "validationFn" is not valid.`);
        }
    }

    get validationFnContext() { return this._validationFnContext; }
    set validationFnContext(val) {
        let context = kijs.getObjectFromString(val);
        if (kijs.isObject(context)) {
            this._validationFnContext = context;
        } else {
            throw new kijs.Error(`config "validationFnContext" is not valid.`);
        }
    }

    // Muss überschrieben werden
    get value() { return null; }
    set value(val) {
        this.isDirty = false;
        this._updateClearButtonVisibility();
    }

    /**
     * TODO: gehört nicht hier hin: löschen!!!!
     * gibt den angezeigten Wert zurück. (z.B. Combo-Anzeigewert)
     * bei einem Textfeld entspricht dies dem value.
     * @returns {String}
     */
    get valueDisplay() { return this.value; }

    /**
     * TODO: gehört nicht hier hin: löschen!!!!
     * gibt den angezeigten Wert als HTML zurück. (z.B. Combo-Anzeigewert)
     * bei einem Textfeld entspricht dies dem value.
     * @returns {String}
     */
    get valueDisplayHtml() { return kijs.String.htmlspecialchars(this.value); }

    /**
     * Gibt ein Objekt zurück mit den Werten des Felds
     * Format {name: value}
     * Beispiel nur ein Wert: {value:'2021-02-01'}
     * Beispiel mehrere Werte: {value:'2021-02-01', valueEnd:'2021-02-03'}
     * @return {undefined}
     */
    get values() {
        let ret = {};
        kijs.Object.each(this._valuesMapping, function(key, map) {
            const fieldName = this[key];
            if (!kijs.isEmpty(fieldName)) {
                ret[fieldName] = this[map.valueProperty];
            }
        }, this);

        return ret;
    }

    /**
     * Für Felder mit mehreren Werten: Damit können mehrere Werte gleichzeitig
     * zugewiesen werden.
     * Beispiel mehrere Werte: {value:'2021-02-01', valueEnd:'2021-02-03'}
     * @param {Object} val
     */
    set values(val) {
        kijs.Object.each(this._valuesMapping, function(key, map) {
            const fieldName = this[key];
            if (!kijs.isEmpty(fieldName) && val.hasOwnProperty(fieldName)) {
                this[map.valueProperty] = val[fieldName];
            }
        }, this);
        this.isDirty = false;
    }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    /**
     * Fügt einen oder mehrere reguläre Ausdrücke zum Validieren hinzu
     * @param {Object|String|Array} regExps Beispiel: { regExp: '/^[0-9]{3,4}$/', msg: 'Vierstellige Zahl erforderlich' }
     * @returns {undefined}
     */
    addValidationRegExp(regExps) {
        if (!kijs.isArray(regExps)) {
            regExps = [regExps];
        }

        kijs.Array.each(regExps, function(regExp) {
            let ok = true;

            if (typeof regExp !== 'object') {
                ok = false;
            }

            if (ok) {
                // Falls der RegExp als String übergeben wurde: konvertieren
                if (kijs.isString(regExp.regExp)) {
                    regExp.regExp = kijs.String.toRegExp(regExp.regExp);
                }
                
                if (kijs.isRegExp(regExp.regExp)) {
                    regExp.regExp = regExp.regExp.toString();
                } else {
                    ok = false;
                }
            }

            if (ok) {
                this._validationRegExps.push(regExp);
            } else {
                throw new kijs.Error(`"validationRegExp" is not valid.`);
            }
        }, this);
    }

    // overwrite
    changeDisabled(val, callFromParent) {
        super.changeDisabled(!!val, callFromParent);

        this._clearButtonEl.changeDisabled(!!val, true);

        // Buttons auch aktivieren/deaktivieren
        const buttons = this.getElementsByXtype('kijs.gui.Button', 1);
        kijs.Array.each(buttons, function(button) {
            button.changeDisabled(!!val, true);
        }, this);

        // Icons auch aktivieren/deaktivieren
        this._errorIconEl.changeDisabled(!!val, true);
        this._helpIconEl.changeDisabled(!!val, true);
    }

    /**
     * Setz den Wert auf null
     * @returns {undefined}
     */
    clear() {
        const emptyValue = this._valuesMapping.name.emptyValue;

        let oldVal = this.value;

        kijs.Object.each(this._valuesMapping, function(key, map) {
            this[map.valueProperty] = map.emptyValue;
        }, this);

        this.validate();

        // Falls etwas geändert hat: Change Event auslösen
        if (emptyValue !== oldVal) {
            this.raiseEvent('change', { oldValue: oldVal, value: emptyValue } );
        }
    }

    /**
     * Fügt Fehler aus einer externen Validation hinzu
     * @param {String|Array} errors
     */
    errorsAdd(errors) {
        if (!errors) {
            return;
        }

        if (!kijs.isArray(errors)) {
            errors = [errors];
        }

        this._errors = this._errors.concat(errors);

        // Fehler anzeigen, falls vorhanden
        this._displayErrors();
    }

    /**
     * Setzt die Validierungsfehler zurück
     * @returns {undefined}
     */
    errorsClear() {
        this._errors = [];

        // Fehler anzeigen, falls vorhanden
        this._displayErrors();
    }

    // overwrite
    render(superCall) {
        // Grosselternklassenaufruf von kijs.gui.Elements.render()
        // den Aufruf von kijs.gui.Container überspringen
        kijs.gui.Element.prototype.render.call(this, true);

        // Label rendern (kijs.guiDom)
        if (!this._labelHide) {
            this._labelDom.renderTo(this._dom.node);
        } else if (this._labelDom.isRendered) {
            this._labelDom.unrender();
        }
        
        // content rendern (kijs.guiDom)
        this._contentDom.renderTo(this._dom.node);
        
        // InputWrapper rendern (kijs.guiDom)
        this._inputWrapperDom.renderTo(this._contentDom.node);

        // clearButton rendern (kijs.gui.Button)
        if (this._clearable) {
            this._clearButtonEl.renderTo(this._contentDom.node);
        }
        
        // innerDOM rendern (kijs.guiDom)
        this._innerDom.renderTo(this._contentDom.node);

        // Help icon rendern (kijs.gui.Icon)
        this._helpIconEl.renderTo(this._contentDom.node);

        // Error icon rendern (kijs.gui.Icon)
        this._errorIconEl.renderTo(this._contentDom.node);
        
        // Render der Elemente als Funktion, damit dies
        // in Vererbungen überschrieben werden könnte.
        this._renderElements();

        // Event afterRender auslösen
        if (!superCall) {
            this.raiseEvent('afterRender');
        }
    }

    /**
     * Setzt die Fehleranzeige zurück
     * @return {undefined}
     */
    errorsReset() {
        this._dom.clsRemove('kijs-error');
        this._errorIconEl.visible = false;
    }

    // overwrite
    unrender(superCall) {
        // Event auslösen.
        if (!superCall) {
            this.raiseEvent('unrender');
        }

        if (this._labelDom) {
            this._labelDom.unrender();
        }
        if (this._inputWrapperDom) {
            this._inputWrapperDom.unrender();
        }
        if (this._errorIconEl) {
            this._errorIconEl.unrender();
        }
        if (this._helpIconEl) {
            this._helpIconEl.unrender();
        }
        if (this._contentDom) {
            this._contentDom.unrender();
        }
        super.unrender(true);
    }

    /**
     * Validiert den Inhalt des Felds
     * @param {Boolean} [ignoreEmpty=false] nicht validieren, wenn das Feld leer ist.
     * @returns {Boolean}
     */
    validate(ignoreEmpty) {
        this._errors = [];

        // Validierungen anwenden
        if (!this.disabled) {
            this._validationRules(this.value, ignoreEmpty);
        }

        // Fehler anzeigen, falls vorhanden
        this._displayErrors();

        return kijs.isEmpty(this._errors);
    }

    /**
     * Setzt den Wert des Feldes auf den Originalwert zurück (not dirty).
     * @returns {undefined}
     */
    valuesReset() {
        kijs.Object.each(this._valuesMapping, function(key, map) {
            if (kijs.isDefined(this._initialValues[map.valueProperty])) {
                this[map.valueProperty] = this._initialValues[map.valueProperty];
            }
        }, this);
        // Fehler nicht mehr anzeigen
        this._dom.clsRemove('kijs-error');
        this._errorIconEl.visible = false;
    }


    // PROTECTED
    /**
     * compares the current value to the initial value.
     * @param {String|Number|Array|Object|Null} initialValue
     * @param {String|Number|Array|Object|Null} currentValue
     * @returns {Boolean}
     */
    _compareIsDirty(initialValue, currentValue) {
        if (kijs.isArray(initialValue) && kijs.isArray(currentValue)) {
            if (initialValue.length !== currentValue.length) {
                return true;
            }
            for (let i=0; i < initialValue.length; i++) {
                if (currentValue.indexOf(initialValue[i]) === -1) {
                    return true;
                }
            }
        } else if (kijs.isObject(initialValue) && kijs.isObject(currentValue)) {
            const allKeys = kijs.Array.concatUnique(Object.keys(initialValue), Object.keys(currentValue));
            for (let key of allKeys) {
                if (this._compareIsDirty(initialValue[key], currentValue[key])) {
                    return true;
                }
            }
        } else {
            if (kijs.toString(initialValue) !== kijs.toString(currentValue)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Zeigt die Fehler aus this._errors im errorIcon an
     * @returns {undefined}
     */
    _displayErrors() {
        if (!kijs.isEmpty(this._errors)) {
            this._dom.clsAdd('kijs-error');
            this._errorIconEl.tooltip = this._errors;
            this._errorIconEl.visible = true;
        } else {
            this._dom.clsRemove('kijs-error');
            this._errorIconEl.visible = false;
        }
    }

    /**
     * Bei clearable und wenn das Feld nicht leer ist, wird der clearButton angezeigt
     * @returns {undefined}
     */
    _updateClearButtonVisibility() {
        if (this._clearable) {
            let hasValue = false;
            kijs.Object.each(this._valuesMapping, function(key, map) {
console.log(this[map.valueProperty]);
                if (this[map.valueProperty] !== map.emptyValue) {
                    hasValue = true;
                    return;
                }
            }, this);
            
            this._clearButtonEl.visible = hasValue;
        }
    }

    /**
     * Maximale Länge validieren
     * Wird aufgerufen von _validationRules
     * @param {String} value
     * @param {Boolean} ignoreEmpty
     * @returns {undefined}
     */
    _validateMaxLength(value, ignoreEmpty) {
        if (!kijs.isEmpty(this._maxLength)) {
            if (!kijs.isEmpty(value) && value.length > this._maxLength) {
                this._errors.push(kijs.getText('Dieses Feld darf maximal %1 Zeichen enthalten', '', this._maxLength));
            }
        }
    }
    
    /**
     * Minimale Länge validieren
     * Wird aufgerufen von _validationRules
     * @param {String} value
     * @param {Boolean} ignoreEmpty
     * @returns {undefined}
     */
    _validateMinLength(value, ignoreEmpty) {
        if (!kijs.isEmpty(this._minLength)) {
            if (!kijs.isEmpty(value) && value.length < this._minLength) {
                this._errors.push(kijs.getText('Dieses Feld muss mindestens %1 Zeichen enthalten', '', this._minLength));
            }
        }
    }
    
    /**
     * Eingabe erforderlich validieren.
     * Wird aufgerufen von _validationRules
     * @param {String} value
     * @param {Boolean} ignoreEmpty
     * @returns {undefined}
     */
    _validateRequired(value, ignoreEmpty) {
        if (this._required) {
            if (kijs.isEmpty(value)) {
                this._errors.push(kijs.getText('Dieses Feld darf nicht leer sein'));
            }
        }
    }

    /**
     * mit validationFn validieren
     * Wird aufgerufen von _validationRules
     * @param {String} value
     * @param {Boolean} ignoreEmpty
     * @returns {undefined}
     */
    _validateValidationFn(value, ignoreEmpty) {
        if (kijs.isFunction(this._validationFn)) {
            if (value !== null && value.toString() !== '') {
                let error = this._validationFn.call(this._validationFnContext || this, value);
                if (error) {
                    if (kijs.isString(error)) {
                        this._errors.push(error);

                    } else if (kijs.isArray(error)) {
                        this._errors = kijs.Array.concat(this._errors, error);
                    }
                }
            }
        }
    }

    /**
     * mit validationRegExps validieren
     * Wird aufgerufen von _validationRules
     * @param {String} value
     * @param {Boolean} ignoreEmpty
     * @returns {undefined}
     */
    _validateValidationRegExps(value, ignoreEmpty) {
        if (!kijs.isEmpty(this._validationRegExps)) {
            if (value !== null && value.toString() !== '') {
                kijs.Array.each(this._validationRegExps, function(regExp) {
                    let r = kijs.String.toRegExp(regExp.regExp);
                    if (!r.exec(value.toString())) {
                        if (!kijs.isEmpty(regExp.msg)) {
                            this._errors.push(regExp.msg);
                        } else {
                            this._errors.push(kijs.getText('Dieses Feld hat einen ungültigen Wert'));
                        }
                        return;
                    }
                }, this);
            }
        }
    }
    

    
   /**
     * Diese Funktion ist zum Überschreiben gedacht
     * @param {String} value
     * @param {Boolean} [ignoreEmpty=false] nicht validieren, wenn das Feld leer ist.
     * @returns {undefined}
     */
    _validationRules(value, ignoreEmpty) {
        if (ignoreEmpty && kijs.isEmpty(value)) {
            return;
        }

        // Eingabe erforderlich
        this._validateRequired(value, ignoreEmpty);

        // Minimale Länge
        this._validateMinLength(value, ignoreEmpty);

        // Maximale Länge
        this._validateMaxLength(value, ignoreEmpty);

        // validationRegExps
        this._validateValidationRegExps(value, ignoreEmpty);

        // validationFn
        this._validateValidationFn(value, ignoreEmpty);
    }


    // PRIVATE
    // LISTENERS
    #onClearButtonClick(e) {
        if (this.disabled || this.readOnly) {
             return;
        }

        this.clear();
    }

    #onChange(e) {
        this._updateClearButtonVisibility();
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
        if (this._labelDom) {
            this._labelDom.destruct();
        }
        if (this._inputWrapperDom) {
            this._inputWrapperDom.destruct();
        }
        if (this._clearButtonEl) {
            this._clearButtonEl.destruct();
        }
        if (this._errorIconEl) {
            this._errorIconEl.destruct();
        }
        if (this._helpIconEl) {
            this._helpIconEl.destruct();
        }
        if (this._contentDom) {
            this._contentDom.destruct();
        }

        // Variablen (Objekte/Arrays) leeren
        this._errors = null;
        this._labelDom = null;
        this._inputWrapperDom = null;
        this._clearButtonEl = null;
        this._errorIconEl = null;
        this._helpIconEl = null;
        this._contentDom = null;
        this._validationFn = null;
        this._validationFnContext = null;
        this._validationRegExps = null;

        // Basisklasse entladen
        super.destruct(true);
    }

};
