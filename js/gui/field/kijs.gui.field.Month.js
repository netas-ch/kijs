/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.field.Month
// --------------------------------------------------------------
/**
 * CONFIG-Parameter
 * ----------
 * date                     aktueller Wert als JavaScript Date-Objekt.
 * value                    aktueller Wert als SQL-String (siehe auch "valueFormat")
 * displayFormat            Format der Darstellung im Feld. Default="H Y"
 * valueFormat              Format des SQL-Strings default:'Y-m-d (gilt für value, minValue und maxValue)
 * lastDayOfMonthAsValue    als date oder value wird normalerweise der 1. Tag des Monats zurückgegeben,
 *                          falls der letzte Tag gewünscht wird, lastDayOfMonthAsValue=true setzen.
 * emptyBtnHide             damit kann die "Leeren"-Schaltfläche ausgeblendet werden.
 * minDate, maxDate         min- und max Datum als JavaScript Date-Objekt oder null, für keine Einschränkung.
 *                          Beim minDate wird fix der 1. Tag des Monats genommen, bei maxDate der letzte Tag des Monats.
 * minValue, maxValue       gleich wie minDate und maxDate, hier aber als SQL-String (siehe auch "valueFormat").
 * year2000Threshold        Wenn zweistellige Jahreszahlen eingegeben werden, können sie automatisch in vierstellige
 *                          umgewandelt werden. Dazu kann hier der Schwellwert angegeben werden. Default=30. Keine Umwandlung=Null
 *
 * EVENTS
 * ----------
 * blur
 * change
 * focus
 * input
 *
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
kijs.gui.field.Month = class kijs_gui_field_Month extends kijs.gui.field.Field {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        this._previousChangeDate = null;  // Wird verwendet um das Change Event nur bei einer Wertänderung auszulösen

        this._year2000Threshold = 30;   // Wenn zweistellige Jahreszahlen eingegeben werden,
                                        // wird bei Zahlen >= diesem Wert eine 1900er Jahreszahl erstellt, sonst eine 2000er.
                                        // Null=Umwandlung ausgeschaltet.

        this._inputDom = new kijs.gui.Dom({
            nodeTagName: 'input',
            nodeAttribute: {
                id: this._inputId
            },
            on: {
                change: this.#onInputDomChange,
                input: this.#onInputDomInput,
                context: this
            }
        });
        this._dom.clsAdd('kijs-field-month');

        this._monthPicker = new kijs.gui.MonthPicker({
            headerBarHide: true,
            currentBtnHide: false,
            closeBtnHide: true,
            cls: ['kijs-borderless'],
            on: {
                monthClick: this.#onMonthPickerMonthClick,
                currentClick: this.#onMonthPickerCurrentClick,
                emptyClick: this.#onMonthPickerEmptyClick,
                change: this.#onMonthPickerChange,
                context: this
            }
        });

        this._spinBoxEl = new kijs.gui.SpinBox({
            target: this,
            autoSize: 'none',
            targetDomProperty: 'inputWrapperDom',
            ownerNodes: [this._inputWrapperDom, this._spinIconEl.dom],
            parent: this
        });
        this._spinBoxEl.add(this._monthPicker);

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            autocomplete: false,
            disableFlex: true,
            spinIconVisible: true,
            spinIconMap: 'kijs.iconMap.Fa.calendar-days'
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            autocomplete: { target: 'autocomplete' },   // De-/aktiviert die Browservorschläge
            year2000Threshold: true,
            emptyBtnHide: { target: 'maxDate', context: this._monthPicker },
            displayFormat: { target: 'headerBarFormat', context: this._monthPicker },
            inputMode: { target: 'inputMode' },
            valueFormat: { target: 'valueFormat', context: this._monthPicker },
            lastDayOfMonthAsValue: { target: 'lastDayOfMonthAsValue', context: this._monthPicker },
            maxDate: { target: 'maxDate', context: this._monthPicker },
            minDate: { target: 'minDate', context: this._monthPicker },
            maxValue: { target: 'maxValue', context: this._monthPicker },
            minValue: { target: 'minValue', context: this._monthPicker },
            placeholder: { target: 'placeholder' }
        });

        // Event-Weiterleitungen von this._inputDom
        this._eventForwardsAdd('blur', this._inputDom);
        this._eventForwardsAdd('focus', this._inputDom);
        this._eventForwardsAdd('input', this._inputDom);

        this._eventForwardsRemove('enterPress', this._dom);
        this._eventForwardsRemove('enterEscPress', this._dom);
        this._eventForwardsRemove('escPress', this._dom);
        this._eventForwardsAdd('enterPress', this._inputDom);
        this._eventForwardsAdd('enterEscPress', this._inputDom);
        this._eventForwardsAdd('escPress', this._inputDom);

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
    
    get date() {
        return this._monthPicker.date;
    }
    set date(val) {
        this._monthPicker.date = val;
        this._updateInputValue();
        this._previousChangeDate = this._monthPicker.date;
        this._isDirty = false;
    }
    
    get displayFormat() { return this._monthPicker.headerBarFormat; }
    set displayFormat(val) { this._monthPicker.headerBarFormat = val; }

    get emptyBtnHide() { return this._monthPicker.emptyBtnHide; }
    set emptyBtnHide(val) { this._monthPicker.emptyBtnHide = !!val; }

    // overwrite
    get hasFocus() { return this._inputDom.hasFocus; }
    
    get inputDom() { return this._inputDom; }

    get inputMode() { return this._inputDom.nodeAttributeGet('inputMode'); }
    set inputMode(val) { this._inputDom.nodeAttributeSet('inputMode', val); }

    // overwrite
    get isEmpty() { return kijs.isEmpty(this.value); }

    get lastDayOfMonthAsValue() { return this._monthPicker.lastDayOfMonthAsValue; }
    set lastDayOfMonthAsValue(val) { this._monthPicker.lastDayOfMonthAsValue = !!val; }

    get placeholder() { this._inputDom.nodeAttributeGet('placeholder'); }
    set placeholder(val) { this._inputDom.nodeAttributeSet('placeholder', kijs.toString(val)); }

    // overwrite
    get readOnly() { return super.readOnly; }
    set readOnly(val) {
        super.readOnly = !!val;
        this._inputDom.nodeAttributeSet('readOnly', !!val);
    }

    // overwrite
    get value() {
        return this._monthPicker.value;
    }
    set value(val) {
        this.date = val;
    }

    get valueFormat() { return this._monthPicker.valueFormat; }
    set valueFormat(val) { this._monthPicker.valueFormat = val; }

    /**
     * Die virtual keyboard policy bestimmt, ob beim focus die virtuelle
     * Tastatur geöffnet wird ('auto', default) oder nicht ('manual'). (Nur Mobile, Chrome)
     */
    get virtualKeyboardPolicy() { return this._inputDom.nodeAttributeGet('virtualKeyboardPolicy'); }
    set virtualKeyboardPolicy(val) { this._inputDom.nodeAttributeSet('virtualKeyboardPolicy', val); }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // overwrite
    changeDisabled(val, callFromParent) {
        super.changeDisabled(!!val, callFromParent);
        this._inputDom.changeDisabled(!!val, true);
    }
    
    /**
     * Setzt den Focus auf das Feld. Optional wird der Text selektiert.
     * @param {Boolean} [alsoSetIfNoTabIndex=false]
     * @param {Boolean} [selectText=false]
     * @returns {undefined}
     * @overwrite
     */
    focus(alsoSetIfNoTabIndex, selectText) {
        let nde = this._inputDom.focus(alsoSetIfNoTabIndex);
        if (selectText) {
            if (nde) {
                nde.select();
            }
        }
        return nde;
    }
    
    // overwrite
    render(superCall) {
        super.render(true);

        // Input rendern (kijs.guiDom)
        this._inputDom.renderTo(this._inputWrapperDom.node);

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
        this._monthPicker.unrender();
        this._spinBoxEl.unrender();
        this._inputDom.unrender();

        super.unrender(true);
    }


    // PROTECTED
    _parseStringToMonth(strInput) {
        let year = null;
        let monthIndex = null; // 0=Jan, 1=Feb, ...
        let index;

        const months = kijs.Date.months;
        const monthsShort = kijs.Date.months_short;

        // String in Bestandteile (Wörter) aufteilen
        strInput = kijs.toString(strInput).trim();
        let arr = strInput.split(' ');

        // Der String darf aus ein oder zwei Bestandteilen bestehen
        if (arr.length < 1 || arr.length > 2) {
            return null;
        }

        // Bestandteile duchgehen und versuchen den Monat und das Jahr zu ermitteln
        for (let i=0; i<arr.length; i++) {
            let str = arr[i];

            // Handelt es sich um eine Jahreszahl?
            if (kijs.isNumeric(str)) {
                if (kijs.isEmpty(year)) {
                    year = parseInt(str);
                    // Evtl. aus zweistelliger Jahrezahl eine vierstellige machen
                    if (!kijs.isEmpty(this._year2000Threshold) && year >= 10 && year <= 99) {
                        if (year >= this._year2000Threshold) {
                            year += 1900;
                        } else {
                            year += 2000;
                        }
                    }
                } else {
                    return null;
                }
            }

            // Handelt es sich um einen Monatsnamen
            index = months.findIndex(month => month.toLowerCase() === str.toLowerCase());
            if (index === -1) {
                index = monthsShort.findIndex(month => month.toLowerCase() === str.toLowerCase());
            }
            if (index >= 0) {
                if (kijs.isEmpty(monthIndex)) {
                    monthIndex = index;
                } else {
                    return null;
                }
            }
        }

        // Das Jahr ist optional
        if (kijs.isEmpty(year)) {
            year = (new Date()).getFullYear();
        }

        // Der Monat nicht
        if (kijs.isEmpty(monthIndex)) {
            return null;
        }

        return new Date(year, monthIndex, 1);
    }

    _updateInputValue() {
        let val = kijs.isEmpty(this._monthPicker.date) ? '' : kijs.Date.format(this._monthPicker.date, this._monthPicker.headerBarFormat);
        this._inputDom.nodeAttributeSet('value', val);
    }

    // overwrite
    _validationRules(value) {
        if (!kijs.isEmpty(value)) {
            const date = kijs.Date.create(value);

            // Min. value
            if (this._monthPicker.minDate !== null && date < this._monthPicker.minDate) {
                this._errors.push(
                        kijs.getText('Der minimale Wert für dieses Feld ist %1',
                        '',
                        kijs.Date.format(this._monthPicker.minDate, this._monthPicker.headerBarFormat)));
            }

            // Max. value
            if (this._monthPicker.maxDate !== null && date > this._monthPicker.maxDate) {
                this._errors.push(
                        kijs.getText('Der maximale Wert für dieses Feld ist %1',
                        '',
                        kijs.Date.format(this._monthPicker.maxDate, this._monthPicker.headerBarFormat)));
            }
        }

        super._validationRules(value);
    }


    // PRIVATE
    // LISTENERS
    #onInputDomChange(e) {
        let oldDate = this._previousChangeDate;
        let oldValue = '';
        if (!kijs.isEmpty(oldDate)) {
            oldValue = kijs.Date.format(oldDate, this._monthPicker.valueFormat);
        };
        
        this._previousChangeDate = this._monthPicker.date;
        
        this._updateInputValue();
        this.validate();

        if (!kijs.Date.compare(this._monthPicker.date, oldDate)) {
            this._isDirty = true;
            this.raiseEvent('change', {
                date: this.date,
                oldDate: oldDate,
                value: this.value, 
                oldValue: oldValue
            });
        }
    }

    #onInputDomInput(e) {
        const rawValue = this._inputDom.nodeAttributeGet('value');
        const date = this._parseStringToMonth(rawValue);

        this.resetErrors();

        this._monthPicker.date = date;
    }

    #onMonthPickerChange(e) {
        let oldDate = this._previousChangeDate;
        let oldValue = '';
        if (!kijs.isEmpty(oldDate)) {
            oldValue = kijs.Date.format(oldDate, this._monthPicker.valueFormat);
        };
        
        this._previousChangeDate = this._monthPicker.date;
        
        this._updateInputValue();
        this.validate();

        if (!kijs.Date.compare(this._monthPicker.date, oldDate)) {
            this._isDirty = true;
            this.raiseEvent('change', { 
                date: this.date,
                oldDate: oldDate,
                value: this.value, 
                oldValue: oldValue
            });
        }
    }

    #onMonthPickerEmptyClick(e) {
        this._spinBoxEl.close();
        this._inputDom.focus();
    }

    #onMonthPickerCurrentClick(e) {
        this._spinBoxEl.close();
        this._inputDom.focus();
    }

    #onMonthPickerMonthClick(e) {
        this._spinBoxEl.close();
        this._inputDom.focus();
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
        if (this._inputDom) {
            this._inputDom.destruct();
        }
        if (this._spinBoxEl) {
            this._spinBoxEl.destruct();
        }
        if (this._monthPicker) {
            this._monthPicker.destruct();
        }

        // Variablen (Objekte/Arrays) leeren
        this._inputDom = null;
        this._spinBoxEl = null;
        this._monthPicker = null;

        // Basisklasse entladen
        super.destruct(true);
    }
    
};
