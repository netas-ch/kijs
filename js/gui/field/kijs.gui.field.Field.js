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
 * rightClick
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
    constructor(config={}) {
        super(false);
        
        // Falls ein Feld mehrere Werte zurückgibt, muss diese Variable in
        // der abgeleiteten Klasse überschrieben werden
        this._valuesMapping = [{ nameProperty: 'name' , valueProperty: 'value' }];

        this._labelHide = false;

        this._inputId = kijs.uniqId('kijs_-_input_');

        this._inputWrapperDom = new kijs.gui.Dom({
            cls: 'kijs-inputwrapper'
        });

        // Muss in der abgeleiteten Klasse überschrieben werden
        this._inputDom = new kijs.gui.Dom();

        this._labelDom = new kijs.gui.Dom({
            cls: 'kijs-label',
            nodeTagName: 'label',
            htmlDisplayType: 'code',
            nodeAttribute: {
                htmlFor: this._inputId
            }
        });

        this._spinIconEl = new kijs.gui.Icon({
            parent: this,
            iconMap: 'kijs.iconMap.Fa.caret-down',
            cls: 'kijs-icon-spindown',
            visible: false
        });

        this._errorIconEl = new kijs.gui.Icon({
            parent: this,
            iconMap: 'kijs.iconMap.Fa.circle-info',
            cls: 'kijs-icon-error',
            tooltip: new kijs.gui.Tooltip({ cls: 'kijs-error' }),
            visible: false
        });

        this._errors = [];

        this._helpIconEl = new kijs.gui.Icon({
            parent: this,
            iconMap: 'kijs.iconMap.Fa.circle-question',
            cls: 'kijs-icon-help',
            tooltip: new kijs.gui.Tooltip({ cls: 'kijs-help' }),
            visible: false
        });

        this._spinBoxEl = null;
        
        // Bei disableFlex=true, wird der Restliche Platz mit diesem leeren DIV gefüllt
        this._spacerDom = new kijs.gui.Dom({
            cls: 'kiis-spacer'
        });   
        
        this._maxLength = null;
        this._required = false;
        this._submitValue = true;
        this._originalValue = null;
        this._validationFn = null;
        this._validationFnContext = null;

        this._dom.clsRemove('kijs-container');
        this._dom.clsAdd('kijs-field');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            isDirty: false
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            autocomplete: { target: 'autocomplete' },   // De-/aktiviert die Browservorschläge
            disabled: { target: 'disabled' },           // deaktiviert das Feld mit den Buttons (siehe auch readOnly)
            
            disableFlex: { target: 'disableFlex' }, // false=ganze Breite wird genutzt, true=nur die benötigte Breite wird genutzt
            
            label: { target: 'html', context: this._labelDom, prio: 2 },
            labelCls: { fn: 'function', target: this._labelDom.clsAdd, context: this._labelDom },
            labelHide: true,
            labelHtmlDisplayType: { target: 'htmlDisplayType', context: this._labelDom },
            labelStyle: { fn: 'assign', target: 'style', context: this._labelDom },
            labelWidth: { target: 'labelWidth' },
            value: { target: 'value', prio: 1000 },

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

            isDirty: { target: 'isDirty', prio: 1001 },

            inputMode: { target: 'inputMode' },

            maxLength: true,
            readOnly: { target: 'readOnly' },   // deaktiviert das Feld, die Buttons bleiben aber aktiv (siehe auch disabled)
            required: true,
            submitValue: true,

            spinIcon: { target: 'spinIcon' },
            spinIconChar: { target: 'iconChar', context: this._spinIconEl },
            spinIconCls: { target: 'iconCls', context: this._spinIconEl },
            spinIconColor: { target: 'iconColor', context: this._spinIconEl },
            spinIconMap: { target: 'iconMap', context: this._spinIconEl },
            spinIconVisible: { target: 'visible', context: this._spinIconEl },

            validationFn: true,
            validationFnContext: true,

            virtualKeyboardPolicy: { target: 'virtualKeyboardPolicy' }
        });

        // Listeners
        this._spinIconEl.on('click', this._onSpinButtonClick, this);

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }
    }


    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get autocomplete() { return this._inputDom.nodeAttributeGet('autocomplete'); }
    set autocomplete(val) {
        let value = 'on';

        if (kijs.isString(val)) {
            value = val;
        } else if (val === false) {
            value = 'off';
        }

        // De-/aktiviert die Browservorschläge
        this._inputDom.nodeAttributeSet('autocomplete', value);
    }

    get disabled() { return this._dom.clsHas('kijs-disabled'); }
    set disabled(val) {
        if (val) {
            this._dom.clsAdd('kijs-disabled');
        } else {
            this._dom.clsRemove('kijs-disabled');
        }

        // Icons auch aktivieren/deaktivieren
        this._spinIconEl.disabled = val;
        this._errorIconEl.disabled = val;
        this._helpIconEl.disabled = val;

        if (this._spinBoxEl && 'disabled' in this._spinBoxEl) {
            this._spinBoxEl.disabled = val;
        }

        // Buttons auch aktivieren/deaktivieren
        const buttons = this.getElementsByXtype('kijs.gui.Button', 1);
        kijs.Array.each(buttons, function(button) {
            button.disabled = val;
        }, this);
    }
    
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

    get hasFocus() { return this._inputDom.hasFocus; }

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
        this._helpIconEl.visible = !kijs.isEmpty(this._helpIconEl.tooltip.html);
    }

    get inputWrapperDom() { return this._inputWrapperDom; }

    get inputMode() { return this._inputDom.nodeAttributeGet('inputMode'); }
    set inputMode(val) { this._inputDom.nodeAttributeSet('inputMode', val); }

    get isDirty() {
        if (this.disabled) {
            return false;
        } else {
            return this._originalValue !== this.value;
        }
    }
    set isDirty(val) {
        if (val) { // mark as dirty
            this._originalValue = this.value === null ? '' : null;

        } else { // mark as not dirty
            this._originalValue = this.value;
        }
    }

    get label() { return this._labelDom.html; }
    set label(val) {
        this._labelDom.html = val;
    }

    get labelHide() { return this._labelHide; }
    set labelHide(val) {
        this._labelHide = val;
        if (this.isRendered) {
            if (val) {
                this._labelDom.renderTo(this._dom.node, this._inputWrapperDom.node);
            } else {
                this._labelDom.unrender();
            }
        }
    }

    get labelDom() { return this._labelDom; }

    get labelHtmlDisplayType() { return this._labelDom.htmlDisplayType; }
    set labelHtmlDisplayType(val) { this._labelDom.htmlDisplayType = val; }

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

    /**
     * Berechnet die Höhe für die spinBox
     * @returns {Number}
     */
    get spinBoxHeight() {
        return this._inputWrapperDom.height;
    }

    /**
     * Berechnet die Breite für die spinBox
     * @returns {Number}
     */
    get spinBoxWidth() {
        let width = this._inputWrapperDom.width;
        if (this._spinIconEl.visible) {
            width += this._spinIconEl.width;
        }
        return width;
    }

    get spinIcon() { return this._spinIconEl; }
    /**
     * Button zuweisen
     * @param {kijs.gui.Button|Object} val     Button als icon-Config oder kijs.gui.Button Element
     */
    set spinIcon(val) {
        // Button zurücksetzen?
        if (kijs.isEmpty(val)) {
            this._spinIconEl.iconChar = null;
            this._spinIconEl.iconCls = null;
            this._spinIconEl.iconColor = null;
            if (this.isRendered) {
                this.render();
            }

        // kijs.gui.Button Instanz
        } else if (val instanceof kijs.gui.Button) {
            this._spinIconEl.destruct();
            this._spinIconEl = val;
            if (this.isRendered) {
                this.render();
            }

        // Config Objekt
        } else if (kijs.isObject(val)) {
            this._spinIconEl.applyConfig(val);
            if (this.isRendered) {
                this.render();
            }

        } else {
            throw new kijs.Error(`config "spinIcon" is not valid.`);

        }
    }

    get spinIconChar() { return this._spinIconEl.iconChar; }
    set spinIconChar(val) { this._spinIconEl.iconChar = val; }

    get spinIconCls() { return this._spinIconEl.iconCls; }
    set spinIconCls(val) { this._spinIconEl.iconCls = val; }

    get spinIconColor() { return this._spinIconEl.iconColor; }
    set spinIconColor(val) { this._spinIconEl.iconColor = val; }

    get spinIconMap() { return this._spinIconEl.iconMap; }
    set spinIconMap(val) { this._spinIconEl.iconMap = val; }

    get spinIconVisible() { return !!this._spinIconEl.visible; }
    set spinIconVisible(val) { this._spinIconEl.visible = !!val; }

    // false, falls der Wert vom Feld nicht übermittelt werden soll.
    get submitValue() { return this._submitValue; }
    set submitValue(val) { this._submitValue = !!val; }

    // Muss überschrieben werden
    get value() { return null; }
    set value(val) {}

    /**
     * gibt den angezeigten Wert zurück. (z.B. Combo-Anzeigewert)
     * bei einem Textfeld entspricht dies dem value.
     * @returns {String}
     */
    get valueDisplay() { return this.value; }

    /**
     * gibt den angezeigten Wert als HTML zurück. (z.B. Combo-Anzeigewert)
     * bei einem Textfeld entspricht dies dem value.
     * @returns {String}
     */
    get valueDisplayHtml() { return kijs.String.htmlspecialchars(this.value); }

    /**
     * Gibt einen Record zurück mit den Werten des Felds
     * Format {name: value}
     * Beispiel nur ein Wert: {value:'2021-02-01'}
     * Beispiel mehrere Werte: {value:'2021-02-01', valueEnd:'2021-02-03'}
     * @return {undefined}
     */
    get values() {
        let ret = {};
        kijs.Array.each(this._valuesMapping, function(map) {
            const fieldName = this[map.nameProperty];
            if (!kijs.isEmpty(fieldName)) {
                ret[fieldName] = this[map.valueProperty];
            }
        }, this);

        return ret;
    }

    /**
     * Holt die Werte für das Feld aus dem übergebenen Records
     * @param {Object} val
     */
    set values(val) {
        kijs.Array.each(this._valuesMapping, function(map) {
            const fieldName = this[map.nameProperty];
            if (!kijs.isEmpty(fieldName) && val.hasOwnProperty(fieldName)) {
                this[map.valueProperty] = val[fieldName];
            }
        }, this);
    }

    /**
     * Die virtual keyboard policy bestimmt, ob beim focus die virtuelle
     * Tastatur geöffnet wird ('auto', default) oder nicht ('manual'). (Nur Mobile, Chrome)
     */
    get virtualKeyboardPolicy() { return this._inputDom.nodeAttributeGet('virtualKeyboardPolicy'); }
    set virtualKeyboardPolicy(val) { this._inputDom.nodeAttributeSet('virtualKeyboardPolicy', val); }

    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------

    /**
     * Fügt Fehler aus einer externen Validation hinzu
     * @param {String|Array} errors
     */
    addValidateErrors(errors) {
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
     * Setzt den Focus auf das Feld. Optional wird der Text selektiert.
     * @param {Boolean} alsoSetIfNoTabIndex
     * @param {Boolean} selectText
     * @returns {undefined}
     * @overwrite
     */
    focus(alsoSetIfNoTabIndex=false, selectText=false) {
        super.focus(alsoSetIfNoTabIndex);
        if (selectText) {
            if (this._inputDom.node && kijs.isFunction(this._inputDom.node.select)) {
                this._inputDom.node.select();
            }
        }
    }

    // overwrite
    render(superCall) {
        // dom mit elements rendern (innerDom)
        super.render(true);

        // Label rendern (kijs.guiDom)
        if (!this._labelHide) {
            this._labelDom.renderTo(this._dom.node, this._innerDom.node);
        } else if (this._labelDom.isRendered) {
            this._labelDom.unrender();
        }

        // InputWrapper rendern (kijs.guiDom)
        this._inputWrapperDom.renderTo(this._dom.node, this._innerDom.node);

         // Spin icon rendern (kijs.gui.Icon)
        this._spinIconEl.renderTo(this._dom.node, this._innerDom.node);

        // Help icon rendern (kijs.gui.Icon)
        this._helpIconEl.renderTo(this._dom.node);

        // Error icon rendern (kijs.gui.Icon)
        this._errorIconEl.renderTo(this._dom.node);
        
        // Bei disableFlex=true, wird der Restliche Platz mit diesem leeren DIV gefüllt
        if (this.disableFlex) {
            this._spacerDom.renderTo(this._dom.node);
        }
        
        // Event afterRender auslösen
        if (!superCall) {
            this.raiseEvent('afterRender');
        }
    }

    /**
     * Setzt den Wert zurück.
     * @returns {undefined}
     */
    reset() {
        this.value = this._originalValue;
    }

    /**
     * Setzt die Fehleranzeige zurück
     * @return {undefined}
     */
    resetErrors() {
        this._dom.clsRemove('kijs-error');
        this._errorIconEl.visible = false;
    }

    /**
     * Setzt das value und ruft das change-event auf.
     * Mit dem setter wird das change-event nicht aufgerufen.
     * @param {Mixed} value
     * @returns {undefined}
     */
    setValue(value) {
        let oldVal = this.value;
        if (kijs.toString(value) !== kijs.toString(oldVal)) {
            this.value = value;
            this.raiseEvent('change', {value: this.value, oldVal: oldVal});
        }
    }

    /**
     * Zeigt eine individuelle Fehlermeldung an. Wenn keine Meldung
     * übergeben wird, wird die Fehlermeldung zurückgesetzt.
     * Diese Methode hat keinen Einfluss auf die 'validate' Methode; ein
     * Formular kann trotz Fehlermeldung abgesendet werden.
     * @param msg {string|null} [msg] Anzuzeigende Nachricht
     * @returns {undefined}
     */
    markInvalid(msg=null) {
        this._errors = [];

        if (kijs.isString(msg) && msg) {
            this._errors.push(msg);
        }

        this._displayErrors();
    }


    // overwrite
    unrender(superCall) {
        // Event auslösen.
        if (!superCall) {
            this.raiseEvent('unrender');
        }

        this._labelDom.unrender();
        this._inputWrapperDom.unrender();
        if (this._spinBoxEl) {
            this._spinBoxEl.unrender();
        }
        this._spinIconEl.unrender();
        this._errorIconEl.unrender();
        this._helpIconEl.unrender();
        this._spacerDom.unrender();
        super.unrender(true);
    }

    /**
     * Validiert den Inhalt des Felds
     * @returns {Boolean}
     */
    validate() {
        this._errors = [];

        // Validierungen anwenden
        if (this.visible && !this.readOnly && !this.disabled) {
            this._validationRules(this.value);
        }

        // Fehler anzeigen, falls vorhanden
        this._displayErrors();

        return kijs.isEmpty(this._errors);
    }


    // PROTECTED
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
     * Diese Funktion ist zum Überschreiben gedacht
     * @param {String} value
     * @returns {undefined}
     */
    _validationRules(value) {

        // Eingabe erforderlich
        if (this._required) {
            if (kijs.isEmpty(value)) {
                this._errors.push(kijs.getText('Dieses Feld darf nicht leer sein'));
            }
        }

        // Maximale Länge
        if (!kijs.isEmpty(this._maxLength)) {
            if (!kijs.isEmpty(value) && value.length > this._maxLength) {
                this._errors.push(kijs.getText('Dieses Feld darf maximal %1 Zeichen enthalten', '', this._maxLength));
            }
        }

        if (kijs.isFunction(this._validationFn)) {
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


    // LISTENERS
    _onSpinButtonClick(e) {
        if (this.disabled || this.readOnly) {
             return;
        }
        if (this._spinBoxEl) {
            if (this._spinBoxEl.isRendered) {
                this._spinBoxEl.close();
            } else {
                this._spinBoxEl.show();
            }
        }
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

        // Elemente/DOM-Objekte entladen
        if (this._labelDom) {
            this._labelDom.destruct();
        }
        if (this._inputWrapperDom) {
            this._inputWrapperDom.destruct();
        }
        if (this._spinBoxEl) {
            this._spinBoxEl.destruct();
        }
        if (this._spinIconEl) {
            this._spinIconEl.destruct();
        }
        if (this._errorIconEl) {
            this._errorIconEl.destruct();
        }
        if (this._helpIconEl) {
            this._helpIconEl.destruct();
        }
        if (this._spacerDom) {
            this._spacerDom.destruct();
        }

        // Variablen (Objekte/Arrays) leeren
        this._errors = null;
        this._labelDom = null;
        this._inputWrapperDom = null;
        this._spinBoxEl = null;
        this._spinIconEl = null;
        this._errorIconEl = null;
        this._helpIconEl = null;
        this._spacerDom = null;
        this._validationFn = null;
        this._validationFnContext = null;

        // Basisklasse entladen
        super.destruct(true);
    }
};
