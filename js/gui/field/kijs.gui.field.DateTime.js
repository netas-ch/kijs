/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.field.DateTime
// --------------------------------------------------------------
kijs.gui.field.DateTime = class kijs_gui_field_DateTime extends kijs.gui.field.Field {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        // overwrite
        this._valuesMapping = [
            { nameProperty: 'name' , valueProperty: 'value' },
            { nameProperty: 'nameEnd' , valueProperty: 'valueEnd' }
        ];

        this._nameEnd = '';

        this._mode = 'date';             // Modus: 'date', 'time', 'dateTime', 'week' oder 'range'

        this._timeRequired = false;

        this._displayWeekFormat = 'W Y'; // Anzeigeformat für die Woche (nur bei mode='week')
        this._displayWeekPrefix = '';    // Präfix für die Anzeige der Woche (nur bei mode='week')
        this._valueDateFormat = '';     // Format für den Datums-Teil des value (leer=auto)
        this._valueTimeFormat = '';     // Format für den Uhrzeit-Teil des value (leer=auto)

        this._year2000Threshold = 30;   // Wenn zweistellige Jahreszahlen eingegeben werden,
                                        // wird bei Zahlen >= diesem Wert eine 1900er Jahreszahl erstellt, sonst eine 2000er.
                                        // Null=Umwandlung ausgeschaltet.

        this._useDefaultSpinButtonIcon = !kijs.isDefined(config.spinButtonIconChar);

        this._previousChangeValue = null;         // Wird verwendet, um das Change Event nur bei einer Wertänderung auszulösen
        this._previousChangeValueEnd = null;      // Wird verwendet, um das Change Event nur bei einer Wertänderung auszulösen

        this._inputDom = new kijs.gui.Dom({
            nodeTagName: 'input',
            nodeAttribute: {
                id: this._inputId
            },
            on: {
                change: this.#onInputDomChange,
                input: this.#onInputDomInput,
                dblClick: this.#onInputDomDblClick,
                context: this
            }
        });
        this._dom.clsAdd('kijs-field-datetime');

        this._datePicker = new kijs.gui.DatePicker({
            parent: this,
            on: {
                change: this.#onDatePickerChange,
                inputFinished: this.#onDatePickerInputFinished,
                todayClick: this.#onDatePickerTodayClick,
                emptyClick: this.#onDatePickerEmptyClick,
                context: this
            }
        });

        this._seperatorEl = new kijs.gui.Separator({});

        this._timePicker = new kijs.gui.TimePicker({
            parent: this,
            inputHide: false,
            on: {
                change: this.#onTimePickerChange,
                inputFinished: this.#onTimePickerInputFinished,
                nowClick: this.#onTimePickerNowClick,
                emptyClick: this.#onTimePickerEmptyClick,
                context: this
            }
        });

        this._spinButtonEl = new kijs.gui.Button({
            parent: this,
            cls: 'kijs-inline',
            iconMap: 'kijs.iconMap.Fa.calendar',
            disableFlex: true,
            nodeAttribute: {
                tabIndex: -1
            },
            on: {
                click: this.#onSpinButtonClick,
                context: this
            }
        });
        
        this._spinBoxEl = new kijs.gui.SpinBox({
            parent: this,
            target: this,
            autoSize: 'none',
            cls: ['kijs-flexrow', 'kijs-spinbox-datetime'],
            targetDomProperty: 'inputWrapperDom',
            ownerNodes: [this._inputWrapperDom, this._spinButtonEl.dom],
            elements: [
                this._datePicker,
                this._seperatorEl,
                this._timePicker
            ],
            on: {
                close: this.#onSpinBoxElClose,
                context: this
            }
        });
        
        this._buttonsDom = new kijs.gui.Dom({
            cls: 'kijs-buttons'
        });
        
        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            autocomplete: false,
            disableFlex: true,
            mode: 'date',
            displayWeekPrefix: kijs.getText('KW %1', 'week number'),
            virtualKeyboardPolicy: 'manual'      // Mobile: Tastatur nicht automatisch öffnen
        });

       // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            autocomplete: { target: 'autocomplete' },   // De-/aktiviert die Browser-Vorschläge
            inputMode: { target: 'inputMode' },
            nameEnd: true,
            mode: { target: 'mode' },           // Modus: 'date', 'time', 'dateTime', 'week' oder 'range'
            secondsHide: { target: 'secondsHide', context: this._timePicker },   // Sekunden auch erfassen?
            minutesHide: { target: 'minutesHide', context: this._timePicker },   // Minuten auch erfassen?
            timeRequired: true,                 // Muss die Zeit eingegeben werden?
            maxValue: { target: 'maxValue', context: this._datePicker },
            minValue: { target: 'minValue', context: this._datePicker },
            year2000Threshold: true,
            displayWeekFormat: true,            // Anzeigeformat für die Woche (nur bei mode='week')
            displayWeekPrefix: true,            // Präfix für die Anzeige der Woche (nur bei mode='week')
            valueDateFormat: true,              // Format für den Datums-Teil des value (leer=auto)
            valueTimeFormat: true,              // Format für den Uhrzeit-Teil des value (leer=auto)
            emptyBtnHide: { target: 'emptyBtnHide', context: this._datePicker },
            date: { target: 'date' },           // Date Object
            dateEnd: { target: 'dateEnd' },     // Date Object
            value: { target: 'value' },         // Datum als SQL-String
            valueEnd: { target: 'valueEnd' },    // End-Datum als SQL-String
            
            spinButtonHide: { target: 'spinButtonHide' },
            spinButtonIconChar: { target: 'iconChar', context: this._spinButtonEl },
            spinButtonIconCls: { target: 'iconCls', context: this._spinButtonEl },
            spinButtonIconColor: { target: 'iconColor', context: this._spinButtonEl },
            spinButtonIconMap: { target: 'iconMap', context: this._spinButtonEl },
            
            virtualKeyboardPolicy: { target: 'virtualKeyboardPolicy' }
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

        this._createSpinBoxElements();
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

        // De-/aktiviert die Browser-Vorschläge
        this._inputDom.nodeAttributeSet('autocomplete', value);
    }
    
    get buttonsDom() { return this._buttonsDom; }
    
    // Gibt das Datum zurück. Falls nur eine Uhrzeit existiert, wird das Datum vom 01.01.1970 genommen
    get date() {
        let date = null;

        if (this._hasDate()) {
            date = this._datePicker.date;
        }

        if (this._hasTime() && !kijs.isEmpty(this._timePicker.value)) {
            if (kijs.isEmpty(date)) {
                date = kijs.Date.getDatePart(new Date('1970-01-01'));
            }

            // Datum und Uhrzeit zusammenfügen
            let sqlDate = kijs.Date.getSqlDate(date);
            sqlDate += ' ' + this._timePicker.value;
            date = kijs.Date.create(sqlDate);
        }

        return date;
    }
    set date(val) {
        const datetime = kijs.Date.create(val);

        if (kijs.isEmpty(datetime)) {
            this._datePicker.date = null;
            this._timePicker.value = '';
        } else {
            if (this._hasDate()) {
                this._datePicker.date = kijs.Date.getDatePart(datetime);
            } else {
                this._datePicker.date = null;
            }

            if (this._hasTime()) {
                this._timePicker.value = kijs.Date.format(datetime, 'H:i:s');
            } else {
                this._timePicker.value = '';
            }
        }

        this._previousChangeValue = this.value;
        this._inputDom.nodeAttributeSet('value', this._getDisplayValue());
    }

    get dateEnd() {
        let date = null;
        if (this._hasDate()) {
            date = this._datePicker.dateEnd;
        }
        return date;
    }
    set dateEnd(val) {
        const date = kijs.Date.create(val);

        if (kijs.isEmpty(date)) {
            this._datePicker.dateEnd = null;
        } else {
            if (this._hasDate()) {
                this._datePicker.dateEnd = kijs.Date.getDatePart(date);
            } else {
                this._datePicker.dateEnd = null;
            }
            // Wenn es ein end-Datum gibt, gibt es nie eine Uhrzeit
            this._timePicker.value = '';
        }

        this._previousChangeValueEnd = this.valueEnd;
        this._inputDom.nodeAttributeSet('value', this._getDisplayValue());
    }

    // overwrite
    get datePicker() { return this._datePicker; }

   // overwrite
    get hasFocus() { return this._inputDom.hasFocus; }

    get inputDom() { return this._inputDom; }

    get inputMode() { return this._inputDom.nodeAttributeGet('inputMode'); }
    set inputMode(val) { this._inputDom.nodeAttributeSet('inputMode', val); }

    get isEmpty() { return kijs.isEmpty(this.value); }

    get maxDate() { return this._datePicker.maxDate; }
    set maxDate(val) { this._datePicker.maxDate = val; }

    get maxValue() { return this._datePicker.maxValue; }
    set maxValue(val) { this._datePicker.maxalue = val; }

    get minDate() { return this._datePicker.minDate; }
    set minDate(val) { this._datePicker.minDate = val; }

    get minValue() { return this._datePicker.minValue; }
    set minValue(val) { this._datePicker.minValue = val; }

    get mode() {
        return this._mode;
    }
    set mode(val) {
        if (!kijs.Array.contains(['date','time','dateTime','week','range'], val)) {
            throw new kijs.Error('unknown mode');
        }

        this._mode = val;

        this._dom.clsRemove(['kijs-date','kijs-time','kijs-dateTime','kijs-week','kijs-range']);
        this._dom.clsAdd('kijs-' + val);

        this._createSpinBoxElements();
        this.value = this.value;
    }

    get nameEnd() { return this._nameEnd; }
    set nameEnd(val) { this._nameEnd = val; }

    // overwrite
    get readOnly() { return super.readOnly; }
    set readOnly(val) {
        super.readOnly = !!val;
        this._inputDom.nodeAttributeSet('readOnly', !!val);
    }

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
        if (this._spinButtonEl.visible) {
            width += this._spinButtonEl.width;
        }
        return width;
    }

    get spinButton() { return this._spinButtonEl; }
    
    get spinButtonHide() { return !this._spinButtonEl.visible; }
    set spinButtonHide(val) { this._spinButtonEl.visible = !val; }

    get spinButtonIconChar() { return this._spinButtonEl.iconChar; }
    set spinButtonIconChar(val) { this._spinButtonEl.iconChar = val; }

    get spinButtonIconCls() { return this._spinButtonEl.iconCls; }
    set spinButtonIconCls(val) { this._spinButtonEl.iconCls = val; }

    get spinButtonIconColor() { return this._spinButtonEl.iconColor; }
    set spinButtonIconColor(val) { this._spinButtonEl.iconColor = val; }

    get spinButtonIconMap() { return this._spinButtonEl.iconMap; }
    set spinButtonIconMap(val) { this._spinButtonEl.iconMap = val; }

    get timePicker() { return this._timePicker; }

    get timeRequired() { return this._timeRequired; }
    set timeRequired(val) { this._timeRequired = !!val; }

    // overwrite
    get value() {
        const valDateStart = this._datePicker.date;
        const valDateEnd = this._datePicker.dateEnd;
        const valTime = this._timePicker.value;
        let ret = '';
        let format = '';

        let datetime = null;
        let dateFormat = '';
        let timeFormat = '';

        // Startdatum (und evtl. -Uhrzeit)
        // Wenn noch eine Uhrzeit verwendet wird: mit Uhrzeit ergänzen
        if (this._hasTime()) {
            // falls kein Datum existiert, den 01.01.1970 nehmen
            if (kijs.isEmpty(valDateStart)) {
                datetime = kijs.Date.getDatePart(new Date('1970-01-01'));
            } else {
                datetime = kijs.Date.getDatePart(valDateStart);
            }

            // Datum und Uhrzeit zusammenfügen
            if (!kijs.isEmpty(valTime)) {
                let sqlDate = kijs.Date.getSqlDate(datetime);
                sqlDate += ' ' + valTime;
                datetime = kijs.Date.create(sqlDate);
            }

        // sonst nur das Datum
        } else {
            if (kijs.isEmpty(valDateStart)) {
                datetime = null;
            } else {
                datetime = kijs.Date.getDatePart(valDateStart);
            }
        }

        // Format für den Datums-Teil ermitteln
        if (!kijs.isEmpty(valDateStart)) {
            if (kijs.isEmpty(this._valueDateFormat)) {
                switch (this._mode) {
                    case 'range':
                    case 'week':
                    case 'date':
                    case 'dateTime':
                        dateFormat = 'Y-m-d';
                        break;
                }
            } else {
                dateFormat = this._valueDateFormat;
            }
        }

        // Format für den Uhrzeit-Teil ermitteln
        if (!kijs.isEmpty(valTime)) {
            if (kijs.isEmpty(this._valueTimeFormat)) {
                switch (this._mode) {
                    // Falls ein ganzer SQL-Date-String verlangt wird, die komplette Uhrzeit nehmen
                    case 'dateTime':
                        timeFormat = 'H:i:s';
                        break;

                    // Wenn nur die Uhrzeit verlangt wird: anhand der Stellen automatisch ermitteln
                    case 'time':
                        if (this._timePicker.minutesHide) {
                            timeFormat = 'H';
                        } else if (this._timePicker.secondsHide) {
                            timeFormat = 'H:i';
                        } else {
                            timeFormat = 'H:i:s';
                        }
                        break;
                }
            } else {
                timeFormat = this._valueTimeFormat;
            }
        }

        // Datums- und Uhrzeitformat zusammenfügen
        if (dateFormat && timeFormat) {
            format = dateFormat + ' ' + timeFormat;
        } else if (dateFormat) {
            format = dateFormat;
        } else if (timeFormat) {
            format = timeFormat;
        }

        if (format) {
            ret = kijs.Date.format(datetime, format);
        }

        // Falls leer
        if (kijs.isEmpty(ret)) {
            // bei nur Uhrzeit = Leerstring
            if (this._mode === 'time') {
                ret = '';
            // sonst immer = Null
            } else {
                ret = null;
            }
        }

        return ret;
    }
    set value(val) {
        let arr;
        let ok = kijs.isString(val);

        // Splitten nach ' '
        if (ok) {
            arr = val.split(' ');
        }

        // index des Datums und Uhrzeit ermitteln
        let dateIndex = null;
        let timeIndex = null;
        if (this._hasDate()) {
            dateIndex = 0;
            if (this._hasTime()) {
                timeIndex = 1;
            }
        } else {
            timeIndex = 0;
        }

        // Anzahl Bestandteile des Strings überprüfen
        if (timeIndex === 1) {
            // Der String darf aus ein bis zwei Bestandteilen bestehen
            if (ok && (arr.length < 1 || arr.length > 2)) {
                ok = false;
            }
        }

        // Datum
        if (ok && dateIndex !== null && arr.length >= dateIndex+1) {
            this._datePicker.value = arr[dateIndex];
            if (kijs.isEmpty(this._datePicker.date)) {
                ok = false;
            }
        } else {
            this._datePicker.value = null;
        }

        // Uhrzeit
        if (ok && timeIndex !== null && arr.length >= timeIndex+1) {
            this._timePicker.value = arr[timeIndex];
        } else {
            this._timePicker.value = '';
        }

        this._previousChangeValue = this.value;
        this._inputDom.nodeAttributeSet('value', this._getDisplayValue());
    }

    get valueEnd() {
        let date = null;
        let dateFormat = this._valueDateFormat;

        if (this._hasDate()) {
            date = this._datePicker.dateEnd;
        }

        if (kijs.isEmpty(dateFormat)) {
            dateFormat = 'Y-m-d';
        }

        if (kijs.isEmpty(date)) {
            return null;
        } else {
            return kijs.Date.format(date, dateFormat);
        }
    }
    set valueEnd(val) {
        this.dateEnd = val;
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
    // overwrite
    changeDisabled(val, callFromParent) {
        super.changeDisabled(!!val, callFromParent);
        this._spinButtonEl.changeDisabled(!!val, true);
        
        if (this._spinBoxEl) {
            this._spinBoxEl.changeDisabled(!!val, true);
        }
        
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

        // Buttons-Container rendern (kijs.gui.Dom)
        this._buttonsDom.renderTo(this._contentDom.node, this._inputWrapperDom.node, 'after');
        
        // Spin Button rendern (kijs.gui.Button)
        this._spinButtonEl.renderTo(this._buttonsDom.node);

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

        this._datePicker.unrender();
        this._seperatorEl.unrender();
        this._timePicker.unrender();
        this._spinBoxEl.unrender();
        this._inputDom.unrender();
        this._buttonsDom.unrender();
        
        if (this._spinBoxEl) {
            this._spinBoxEl.unrender();
        }
        
        super.unrender(true);
    }


    // PROTECTED
    _createSpinBoxElements() {
        const hasDate = this._hasDate();
        const hasTime = this._hasTime();
        
        // spinIcon
        if (this._useDefaultSpinButtonIcon) {
            this.spinButtonIconMap = hasDate ? 'kijs.iconMap.Fa.calendar' : 'kijs.iconMap.Fa.clock';
        }

        // Inhalt zuerst entfernen
        this._spinBoxEl.removeAll({
            preventRender: true,
            preventDestruct: true
        });

        if (hasDate) {
            this._spinBoxEl.add(this._datePicker, null, { preventRender: true });
        }

        if (hasDate && hasTime) {
            this._spinBoxEl.add(this._seperatorEl, null, { preventRender: true });
        }

        if (hasTime) {
            this._spinBoxEl.add(this._timePicker, null, { preventRender: true });
        }

        if (this._spinBoxEl.isRendered) {
            this._spinBoxEl.render();
        }

        switch (this._mode) {
            case 'range':
            case 'week':
            case 'date':
                this._datePicker.mode = this._mode;
                break;
            case 'time':
            case 'dateTime':
                this._datePicker.mode = 'date';
                break;
        }
    }

    /**
     * Ermittelt den Wert für die Anzeige (display) im entsprechenden Format.
     * Falls kein Format definiert wurde, wird aufgrund der Einstellungen eines definiert
     * @return {String}
     */
    _getDisplayValue() {
        const valDateStart = this._datePicker.date;
        const valDateEnd = this._datePicker.dateEnd;
        const valTime = this._timePicker.value;

        let ret = '';

        // DisplayValue zurückgeben
        switch (this._mode) {
            // range
            case 'range':
                let txtStart = '';
                let txtEnd = '';

                if (!kijs.isEmpty(valDateStart)) {
                    txtStart = valDateStart.toLocaleDateString(kijs.language, {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    });
                }

                if (!kijs.isEmpty(valDateEnd)) {
                    txtEnd = valDateEnd.toLocaleDateString(kijs.language, {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    });
                }

                ret = kijs.getText('%1 bis %2', '', [txtStart, txtEnd]).trim();
                break;

            // week
            case 'week':
                if (!kijs.isEmpty(valDateStart) && !kijs.isEmpty(valDateEnd)) {
                   
                    // Der 1.1. eines Jahres kann noch zur letzten Woche des Vorjahres gehören
                    // und der 31.12. bereits zur 1. Woche des nächsten Jahres.
                    // damit das richtige Jahr angezeigt wird, je nachdem das start- oder enddatum nehmen.
                    if (valDateStart.getMonth >= 6) {
                        ret = kijs.Date.format(valDateEnd, this._displayWeekFormat);
                    } else {
                        ret = kijs.Date.format(valDateStart, this._displayWeekFormat);
                    }

                    // Evtl. Präfix einfügen
                    if (!kijs.isEmpty(this._displayWeekPrefix)) {
                        ret = kijs.String.replaceAll(this._displayWeekPrefix, '%1', ret);
                    }
                }
                break;

            // date, time und dateTime
            case 'date':
            case 'time':
            case 'dateTime':
                let datetime = null;
                let formatOptions = {};

                // Startdatum (und evtl. -Uhrzeit)
                // Wenn noch eine Uhrzeit verwendet wird: mit Uhrzeit ergänzen
                if (this._hasTime()) {
                    // falls kein Datum existiert, den 01.01.1970 nehmen
                    if (kijs.isEmpty(valDateStart)) {
                        datetime = kijs.Date.getDatePart(new Date('1970-01-01'));
                    } else {
                        datetime = kijs.Date.getDatePart(valDateStart);
                    }

                    // Datum und Uhrzeit zusammenfügen
                    if (!kijs.isEmpty(valTime)) {
                        let sqlDate = kijs.Date.getSqlDate(datetime);
                        sqlDate += ' ' + valTime;
                        datetime = kijs.Date.create(sqlDate);
                    }

                // sonst nur das Datum
                } else {
                    if (kijs.isEmpty(valDateStart)) {
                        datetime = null;
                    } else {
                        datetime = kijs.Date.getDatePart(valDateStart);
                    }
                }

                // Format für den Datums-Teil ermitteln
                if (!kijs.isEmpty(valDateStart)) {
                    switch (this._mode) {
                        case 'date':
                        case 'dateTime':
                            formatOptions.day = '2-digit';
                            formatOptions.month = '2-digit';
                            formatOptions.year = 'numeric';
                            break;
                    }
                }

                // Format für den Uhrzeit-Teil ermitteln
                if (!kijs.isEmpty(valTime)) {
                    switch (this._mode) {
                        case 'dateTime':
                        case 'time':
                            if (this._timePicker.minutesHide) {
                                formatOptions.hour = '2-digit';
                            } else if (this._timePicker.secondsHide) {
                                formatOptions.hour = '2-digit';
                                formatOptions.minute = '2-digit';
                            } else {
                                formatOptions.hour = '2-digit';
                                formatOptions.minute = '2-digit';
                                formatOptions.second = '2-digit';
                            }
                            break;
                    }
                }

                if (!kijs.isEmpty(formatOptions)) {
                    if (formatOptions.year || formatOptions.month || formatOptions.day ) {
                        ret = datetime.toLocaleDateString(kijs.language, formatOptions);
                    } else {
                        ret = datetime.toLocaleTimeString(kijs.language, formatOptions);
                    }
                }

            break;
        }

        return ret;
    }

    /**
     * Wird der DatePicker angezeigt?
     * @return {unresolved}
     */
    _hasDate() {
        return this._mode === 'date' || this._mode === 'dateTime' || this._mode === 'week' || this._mode === 'range';
    }

    /**
     * Wird der TimePicker angezeigt?
     * @return {unresolved}
     */
    _hasTime() {
        return this._mode === 'time' || this._mode === 'dateTime';
    }

    _parseString(strInput) {
        let ok = false;

        switch (this._mode) {
            case 'date':
                this._datePicker.value = kijs.Date.parseLocalDateString(strInput, this._year2000Threshold);
                this._datePicker.valueEnd = null;
                this._timePicker.value = '';
                break;

            case 'time':
                this._datePicker.value = null;
                this._datePicker.valueEnd = null;
                this._timePicker.value = kijs.Date.parseLocalTimeString(strInput);
                break;

            case 'dateTime':
                let dateTime = kijs.Date.parseLocalDateTimeString(strInput, this._year2000Threshold);
                if (dateTime) {
                    this._datePicker.value = kijs.Date.getDatePart(dateTime);
                    this._datePicker.valueEnd = null;
                    this._timePicker.value = kijs.Date.format(dateTime, 'H:i:s');
                } else {
                    this._datePicker.value = null;
                    this._datePicker.valueEnd = null;
                    this._timePicker.value = '';
                }
                break;

            case 'week':
                let date = kijs.Date.parseLocalWeekString(strInput, this._year2000Threshold);

                if (date) {
                    this._datePicker.value = date;
                    this._datePicker.valueEnd = kijs.Date.getSunday(date);
                    this._timePicker.value = '';
                } else {
                    this._datePicker.value = null;
                    this._datePicker.valueEnd = null;
                    this._timePicker.value = '';
                }
                break;
                
            case 'range':
                let seperators = ['-', 'bis', 'to', 'until', 'till', 'by', 'jusqu\'au', 'jusque', 'fino al', 'fino a', 'al', 'au', 'à'];
                let dateStart = null;
                let dateEnd = null;
                let arr;
                
                ok = true;

                // Falls noch nicht vorhanden, den Separator der aktuellen Sprache hinzufügen.
                let sep = kijs.getText('%1 bis %2');
                sep = sep.replace('%1', '');
                sep = sep.replace('%2', '');
                sep = sep.trim();
                if (!kijs.Array.contains(seperators, sep)) {
                    seperators.push(sep);
                }

                // Zulässige Trennzeichen durch #|@# ersetzen
                for (let i=0; i<seperators.length; i++) {
                    strInput = kijs.String.replaceAll(strInput, seperators[i], '#|@#');
                }

                // Splitten nach #|@#
                arr = strInput.split('#|@#');

                // Werte Trimmen
                for (let i=0; i<arr.length; i++) {
                    arr[i] = arr[i].trim();
                }

                // Der String muss aus zwei Bestandteilen bestehen
                if (arr.length !== 2) {
                    ok = false;
                }

                // Datum von
                if (ok) {
                    dateStart = kijs.Date.parseLocalDateString(arr[0], this._year2000Threshold);
                    if (kijs.isEmpty(dateStart)) {
                        ok = false;
                    }
                }

                // Datum bis
                if (ok) {
                    dateEnd = kijs.Date.parseLocalDateString(arr[1], this._year2000Threshold);
                    if (kijs.isEmpty(dateEnd)) {
                        ok = false;
                    }
                }

                if (ok) {
                    this._datePicker.value = dateStart;
                    this._datePicker.valueEnd = dateEnd;
                    this._timePicker.value = '';
                } else {
                    this._datePicker.value = null;
                    this._datePicker.valueEnd = null;
                    this._timePicker.value = '';
                }
                break;
        }
    }
    
    // overwrite
    _validationRules(value, ignoreEmpty) {
        if (ignoreEmpty && kijs.isEmpty(value)) {
            return;
        }

        const date = this._datePicker.date;
        const dateEnd = this._datePicker.dateEnd;
        const time = this._timePicker.value;

        // Datum validieren
        if (this._hasDate()) {
            if (!kijs.isEmpty(date) || !kijs.isEmpty(dateEnd)) {

                // Start- und Enddatum validieren
                if (this._mode === 'range' || this._mode === 'week') {

                    // Es fehlt das Start- oder Enddatum
                    if (kijs.isEmpty(date) || kijs.isEmpty(dateEnd)) {
                        this._errors.push(kijs.getText('Es fehlt das Start- oder Enddatum'));
                    }

                    // Min. value
                    if ( (!kijs.isEmpty(date) && !kijs.isEmpty(this._datePicker.minDate) && date < this._datePicker.minDate)
                            || (!kijs.isEmpty(dateEnd) && !kijs.isEmpty(this._datePicker.minDate) && dateEnd < this._datePicker.minDate) ) {

                        this._errors.push(
                            kijs.getText('Der minimale Wert für dieses Feld ist %1',
                                '',
                                this._datePicker.minDate.toLocaleDateString(kijs.language, {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric'
                                })
                            )
                        );
                    }

                    // Max. value
                    if ( (!kijs.isEmpty(date) && !kijs.isEmpty(this._datePicker.maxDate) && date > this._datePicker.maxDate)
                            || (!kijs.isEmpty(dateEnd) && !kijs.isEmpty(this._datePicker.maxDate) && dateEnd < this._datePicker.maxDate) ) {

                        this._errors.push(
                            kijs.getText('Der maximale Wert für dieses Feld ist %1',
                                '',
                                this._datePicker.maxDate.toLocaleDateString(kijs.language, {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric'
                                })
                            )
                        );
                    }

                // nur Startdatum validieren
                } else {

                    // Min. value
                    if (!kijs.isEmpty(date) && !kijs.isEmpty(this._datePicker.minDate) && date < this._datePicker.minDate) {
                        this._errors.push(
                            kijs.getText('Der minimale Wert für dieses Feld ist %1',
                                '',
                                this._datePicker.minDate.toLocaleDateString(kijs.language, {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric'
                                })
                            )
                        );
                    }

                    // Max. value
                    if (!kijs.isEmpty(date) && !kijs.isEmpty(this._datePicker.maxDate) && date > this._datePicker.maxDate) {
                        this._errors.push(
                            kijs.getText('Der maximale Wert für dieses Feld ist %1',
                                '',
                                this._datePicker.maxDate.toLocaleDateString(kijs.language, {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric'
                                })
                            )
                        );
                    }

                }

            } else if (kijs.isEmpty(date) && !kijs.isEmpty(value)) {
                this._errors.push(kijs.getText('Das Datum darf nicht leer sein'));

            }
        }

        // Uhrzeit validieren
        if (this._hasTime()) {
            if (this._timeRequired && kijs.isEmpty(time) && !kijs.isEmpty(value)) {
                this._errors.push(kijs.getText('Die Uhrzeit darf nicht leer sein'));
            }
        }

        super._validationRules(value, ignoreEmpty);
    }

    /**
     * Ergänzt die 0 einer Zahl.
     * @param {Integer|String} number
     * @param {Integer} lenght
     * @returns {String}
     */
    _zeroPad(number, lenght=2) {
        number = kijs.toString(number);
        while (number.length < lenght) {
            number = '0' + number;
        }
        return number;
    }


    // PRIVATE
    // LISTENERS
    #onDatePickerChange(e) {
        this._inputDom.nodeAttributeSet('value', this._getDisplayValue());
    }

    #onDatePickerEmptyClick(e) {
        this._timePicker.value = '';

        this._inputDom.nodeAttributeSet('value', this._getDisplayValue());

        this._spinBoxEl.close();
    }

    #onDatePickerInputFinished(e) {
        if (!this._hasTime()) {
            this._spinBoxEl.close();
        }
    }

    #onDatePickerTodayClick(e) {
        if (!this._hasTime()) {
            this._spinBoxEl.close();
        }
    }

    #onInputDomChange(e) {
        this._parseString(e.nodeEvent.target.value);

        this._inputDom.nodeAttributeSet('value', this._getDisplayValue());

        this.validate();

        // Falls etwas geändert hat: Change Event auslösen
        const value = this.value;
        const valueEnd = this.valueEnd;
        if (this._previousChangeValue !== value || this._previousChangeValueEnd !== valueEnd) {
            this.raiseEvent('input', {
                value: value,
                valueEnd: valueEnd,
                oldValue: this._previousChangeValue,
                oldValueEnd: this._previousChangeValueEnd
            });
            this.raiseEvent('change', {
                value: value,
                valueEnd: valueEnd,
                oldValue: this._previousChangeValue,
                oldValueEnd: this._previousChangeValueEnd
            });
            this._previousChangeValue = value;
            this._previousChangeValueEnd = valueEnd;
        }
    }

    #onInputDomDblClick() {
        // Mobile: Tastatur anzeigen beim Doppelklick
        // Funktioniert nur in Chrome
        if ('virtualKeyboard' in window.navigator) {
            window.navigator.virtualKeyboard.show();
        }
    }

    #onInputDomInput(e) {
        this.errorsReset();
    }

    #onSpinBoxElClose(e) {
        this.validate();

        // Falls etwas geändert hat: Change Event auslösen
        const value = this.value;
        const valueEnd = this.valueEnd;
        if (this._previousChangeValue !== value || this._previousChangeValueEnd !== valueEnd) {
            this.raiseEvent('input', {
                value: value,
                valueEnd: valueEnd,
                oldValue: this._previousChangeValue,
                oldValueEnd: this._previousChangeValueEnd
            });
            this.raiseEvent('change', {
                value: value,
                valueEnd: valueEnd,
                oldValue: this._previousChangeValue,
                oldValueEnd: this._previousChangeValueEnd
            });
            this._previousChangeValue = value;
            this._previousChangeValueEnd = valueEnd;
        }
    }

    #onSpinButtonClick(e) {
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
    
    #onTimePickerChange(e) {
        this._inputDom.nodeAttributeSet('value', this._getDisplayValue());
    }

    #onTimePickerEmptyClick(e) {
        this._spinBoxEl.close();
    }
    #onTimePickerInputFinished(e) {
        this._spinBoxEl.close();
    }

    #onTimePickerNowClick(e) {
        if (!this._hasDate() || !kijs.isEmpty(this._datePicker.date)) {
            this._spinBoxEl.close();
        }
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
        if (this._datePicker) {
            this._datePicker.destruct();
        }
        if (this._seperatorEl) {
            this._seperatorEl.destruct();
        }
        if (this._timePicker) {
            this._timePicker.destruct();
        }
        if (this._spinBoxEl) {
            this._spinBoxEl.destruct();
        }
        if (this._buttonsDom) {
            this._buttonsDom.destruct();
        }
        if (this._spinButtonEl) {
            this._spinButtonEl.destruct();
        }

        // Variablen (Objekte/Arrays) leeren
        this._inputDom = null;
        this._datePicker = null;
        this._seperatorEl = null;
        this._timePicker = null;
        this._spinBoxEl = null;
        this._buttonsDom = null;
        this._spinButtonEl = null;
        
        // Basisklasse entladen
        super.destruct(true);
    }

};
