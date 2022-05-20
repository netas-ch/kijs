/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.field.DateTime
// --------------------------------------------------------------
kijs.gui.field.DateTime = class kijs_gui_field_DateTime extends kijs.gui.field.Field {

    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
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

        this._displayDateFormat = '';   // Anzeigeformat für Datums-Teil (leer=auto)
        this._displayTimeFormat = '';   // Anzeigeformat für Uhrzeit-Teil (leer=auto)
        this._displayWeekFormat = 'W Y'; // Anzeigeformat für die Woche (nur bei mode='week')
        this._displayWeekPrefix = 'KW '; // Präfix für die Anzeige der Woche (nur bei mode='week')
        this._valueDateFormat = '';     // Format für den Datums-Teil des value (leer=auto)
        this._valueTimeFormat = '';     // Format für den Uhrzeit-Teil des value (leer=auto)

        this._year2000Threshold = 30;   // Wenn zweistellige Jahreszahlen eingegeben werden,
                                        // wird bei Zahlen >= diesem Wert eine 1900er Jahreszahl erstellt, sonst eine 2000er.
                                        // Null=Umwandlung ausgeschaltet.

        this._useDefaultSpinIcon = !kijs.isDefined(config.spinIconChar);

        this._lastValue = null;         // Wird verwendet um das Change Event nur bei einer Wertänderung auszulösen
        this._lastValueEnd = null;      // Wird verwendet um das Change Event nur bei einer Wertänderung auszulösen

        this._inputDom = new kijs.gui.Dom({
            nodeTagName: 'input',
            nodeAttribute: {
                id: this._inputId
            },
            on: {
                change: this._onInputDomChange,
                input: this._onInputDomInput,
                dblClick: this._onInputDomDblClick,
                context: this
            }
        });
        this._dom.clsAdd('kijs-field-datetime');

        this._datePicker = new kijs.gui.DatePicker({
            on: {
                change: this._onDatePickerChange,
                inputFinished: this._onDatePickerInputFinished,
                todayClick: this._onDatePickerTodayClick,
                emptyClick: this._onDatePickerEmptyClick,
                context: this
            }
        });

        this._seperatorEl = new kijs.gui.Element({
            cls: 'kijs-separator'
        });

        this._timePicker = new kijs.gui.TimePicker({
            inputHide: false,
            on: {
                change: this._onTimePickerChange,
                inputFinished: this._onTimePickerInputFinished,
                nowClick: this._onTimePickerNowClick,
                emptyClick: this._onTimePickerEmptyClick,
                context: this
            }
        });

        this._spinBoxEl = new kijs.gui.SpinBox({
            target: this,
            autoSize: 'none',
            cls: ['kijs-flexrow', 'kijs-spinbox-datetime'],
            targetDomProperty: 'inputWrapperDom',
            ownerNodes: [this._inputWrapperDom, this._spinIconEl.dom],
            parent: this,
            elements: [
                this._datePicker,
                this._seperatorEl,
                this._timePicker
            ],
            on: {
                close: this._onSpinBoxElClose,
                context: this
            }
        });

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            autocomplete: false,
            spinIconVisible: true,
            spinIconMap: 'kijs.iconMap.Fa.calendar',
            virtualKeyboardPolicy: 'manual'      // Mobile: Tastatur nicht automatisch öffnen
        });

       // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            nameEnd: true,
            mode: { target: 'mode' },           // Modus: 'date', 'time', 'dateTime', 'week' oder 'range'
            secondsHide: { target: 'secondsHide', context: this._timePicker },   // Sekunden auch erfassen?
            minutesHide: { target: 'minutesHide', context: this._timePicker },   // Minuten auch erfassen?
            timeRequired: true,                 // Muss die Zeit eingegeben werden?
            maxValue: { target: 'maxValue', context: this._datePicker },
            minValue: { target: 'minValue', context: this._datePicker },
            year2000Threshold: true,
            displayDateFormat: true,            // Anzeigeformat für Datums-Teil (leer=auto)
            displayTimeFormat: true,            // Anzeigeformat für Uhrzeit-Teil (leer=auto)
            displayWeekFormat: true,            // Anzeigeformat für die Woche (nur bei mode='week')
            displayWeekPrefix: true,            // Präfix für die Anzeige der Woche (nur bei mode='week')
            valueDateFormat: true,              // Format für den Datums-Teil des value (leer=auto)
            valueTimeFormat: true,              // Format für den Uhrzeit-Teil des value (leer=auto)
            emptyBtnHide: { target: 'emptyBtnHide', context: this._datePicker },
            date: { target: 'date' },           // Date Object
            dateEnd: { target: 'dateEnd' },     // Date Object
            value: { target: 'value' },         // Datum als SQL-String
            valueEnd: { target: 'valueEnd' }    // End-Datum als SQL-String
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

        this._lastValue = this.value;
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

        this._timePicker.value = '';
        if (kijs.isEmpty(date)) {
            this._datePicker.dateEnd = null;
        } else {
            if (this._hasDate()) {
                this._datePicker.dateEnd = kijs.Date.getDatePart(date);
            } else {
                this._datePicker.dateEnd = null;
            }
        }

        this._lastValueEnd = this.valueEnd;
        this._inputDom.nodeAttributeSet('value', this._getDisplayValue());
    }

    // overwrite
    get datePicker() { return this._datePicker; }

    // overwrite
    get disabled() { return super.disabled; }
    set disabled(val) {
        super.disabled = !!val;
        if (val) {
            this._inputDom.nodeAttributeSet('disabled', true);
        } else {
            this._inputDom.nodeAttributeSet('disabled', false);
        }
    }

    get inputDom() { return this._inputDom; }

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
        this._createSpinBoxElements();
    }

    get nameEnd() { return this._nameEnd; }
    set nameEnd(val) { this._nameEnd = val; }

    // overwrite
    get readOnly() { return super.readOnly; }
    set readOnly(val) {
        super.readOnly = !!val;
        if (val) {
            this._inputDom.nodeAttributeSet('readonly', true);
        } else {
            this._inputDom.nodeAttributeSet('readonly', false);
        }
    }

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
                    // Falls ein ganzer SQL-Date-String verlangt wird, die komplete Uhrzeit nehmen
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

        this._lastValue = this.value;

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


    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
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

        this._datePicker.unrender();
        this._seperatorEl.unrender();
        this._timePicker.unrender();
        this._spinBoxEl.unrender();
        this._inputDom.unrender();

        super.unrender(true);
    }


    // Protected
    _createSpinBoxElements() {
        const hasDate = this._hasDate();
        const hasTime = this._hasTime();

        // spinIcon
        if (this._useDefaultSpinIcon && !hasDate) {
            this.spinIconMap = 'kijs.iconMap.Fa.clock';
        }

        if (hasDate) {
            this._spinBoxEl.add(this._datePicker);
        } else {
            this._spinBoxEl.remove(this._datePicker);
        }

        if (hasDate && hasTime) {
            this._spinBoxEl.add(this._seperatorEl);
        } else {
            this._spinBoxEl.remove(this._seperatorEl);
        }

        if (hasTime) {
            this._spinBoxEl.add(this._timePicker);
        } else {
            this._spinBoxEl.remove(this._timePicker);
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
     * Falls keine Format definiert wurde, wird aufgrund der Einstellungen eines definiert
     * @return {String}
     */
    _getDisplayValue() {
        const valDateStart = this._datePicker.date;
        const valDateEnd = this._datePicker.dateEnd;
        const valTime = this._timePicker.value;

        let ret = '';
        let format = '';

        // DisplayValue zurückgeben
        switch (this._mode) {
            // range
            case 'range':
                format = this._displayDateFormat ? this._displayDateFormat : 'd.m.Y';
                if (!kijs.isEmpty(valDateStart)) {
                    ret += kijs.Date.format(valDateStart, format);
                }
                if (!kijs.isEmpty(valDateStart) || !kijs.isEmpty(valDateEnd)) {
                    if (ret) {
                        ret += ' ';
                    }
                    ret += 'bis';
                }
                if (!kijs.isEmpty(valDateEnd)) {
                    if (ret) {
                        ret += ' ';
                    }
                    ret += kijs.Date.format(valDateEnd, format);
                }
                break;

            // week
            case 'week':
                format = this._displayWeekFormat;
                if (!kijs.isEmpty(valDateStart) && !kijs.isEmpty(valDateEnd)) {
                    if (!kijs.isEmpty(this._displayWeekPrefix)) {
                        ret += this._displayWeekPrefix;
                    }
                    // Der 1.1. eines Jahres kann noch zur letzten Woche des Vorjahres gehören
                    // und der 31.12. bereits zur 1. Woche des nächsten Jahres.
                    // damit das richtige Jahr angezeigt wird, je nachdem das start- oder enddatum nehmen.
                    if (valDateStart.getMonth >= 6) {
                        ret += kijs.Date.format(valDateEnd, format);
                    } else {
                        ret += kijs.Date.format(valDateStart, format);
                    }
                }
                break;

            // date, time und dateTime
            case 'date':
            case 'time':
            case 'dateTime':
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
                    if (kijs.isEmpty(this._displayDateFormat)) {
                        switch (this._mode) {
                            case 'date':
                            case 'dateTime':
                                dateFormat = 'd.m.Y';
                                break;
                        }
                    } else {
                        dateFormat = this._displayDateFormat;
                    }
                }

                // Format für den Uhrzeit-Teil ermitteln
                if (!kijs.isEmpty(valTime)) {
                    if (kijs.isEmpty(this._displayTimeFormat)) {
                        switch (this._mode) {
                            case 'dateTime':
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
                        timeFormat = this._displayTimeFormat;
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
        let seperators, arr, matches, date, dateEnd, time, year, week, ok;

        switch (this._mode) {
            case 'date':
                this._datePicker.value = this._parseStringToDate(strInput);
                this._datePicker.valueEnd = null;
                this._timePicker.value = '';
                break;

            case 'time':
                this._datePicker.value = null;
                this._datePicker.valueEnd = null;
                this._timePicker.value = this._parseStringToTime(strInput);
                break;

            case 'dateTime':
                seperators = [' '];
                date = null;
                time = '';
                ok = true;

                // Zulässige Trennzeichen durch #|@# ersetzen
                for (let i=0; i<seperators.length; i++) {
                    strInput = kijs.String.replaceAll(strInput, seperators[i], '#|@#');
                }

                // Splitten nach #|@#
                arr = strInput.split('#|@#');

                // Der String darf aus ein bis zwei Bestandteilen bestehen
                if (arr.length < 1 || arr.length > 2) {
                    ok = false;
                }

                // Datum
                if (ok && arr.length >= 1) {
                    date = this._parseStringToDate(arr[0]);
                    if (kijs.isEmpty(date)) {
                        ok = false;
                    }
                }

                // Uhrzeit
                if (ok && arr.length >= 2) {
                    time = this._parseStringToTime(arr[1]);
                    if (kijs.isEmpty(time)) {
                        ok = false;
                    }
                }

                if (ok) {
                    this._datePicker.value = date;
                    this._datePicker.valueEnd = null;
                    this._timePicker.value = time;
                } else {
                    this._datePicker.value = null;
                    this._datePicker.valueEnd = null;
                    this._timePicker.value = '';
                }
                break;

            case 'week':
                ok = true;

                matches = strInput.match(/^[^0-9]*([0-9]{1,2})[^0-9]?([0-9]{2,4})?/);
                if (!matches) {
                    ok = false;
                }

                if (ok) {
                    // Wochen-Nr.
                    week = parseInt(matches[1]);

                    // Jahr (wenn leer = aktuelles Jahr
                    year = matches[2] ? parseInt(matches[2]) : (new Date).getFullYear();

                    // Evtl. aus zweistelliger Jahrezahl eine vierstellige machen
                    if (!kijs.isEmpty(this._year2000Threshold) && year >= 10 && year <= 99) {
                        if (year >= this._year2000Threshold) {
                            year += 1900;
                        } else {
                            year += 2000;
                        }
                    }
                    date = kijs.Date.getFirstOfWeek(week, year);
                }

                if (ok) {
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
                seperators = ['-', 'bis', 'to', 'until', 'till', 'by', 'jusqu\'au', 'jusque', 'fino al', 'fino a', 'al', 'au', 'à'];
                date = null;
                dateEnd = null;
                ok = true;

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
                    date = this._parseStringToDate(arr[0]);
                    if (kijs.isEmpty(date)) {
                        ok = false;
                    }
                }

                // Datum bis
                if (ok) {
                    dateEnd = this._parseStringToDate(arr[1]);
                    if (kijs.isEmpty(dateEnd)) {
                        ok = false;
                    }
                }

                if (ok) {
                    this._datePicker.value = date;
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

    _parseStringToDate(strInput) {
        const seperators = ['.', '/', ','];
        let day = null;
        let month = null;
        let year = null;

        // Zulässige Trennzeichen durch #|@# ersetzen
        for (let i=0; i<seperators.length; i++) {
            strInput = kijs.String.replaceAll(strInput, seperators[i], '#|@#');
        }

        // Splitten nach #|@#
        const arr = strInput.split('#|@#');

        // Der String darf aus ein bis drei Bestandteilen bestehen
        if (arr.length < 1 || arr.length > 3) {
            return null;
        }

        // Tag
        if (arr.length >= 1) {
            if (!kijs.isNumeric(arr[0])) {
                return null;
            }
            day = parseInt(arr[0]);
            if (day < 1 || day > 31) {
                return null;
            }
        }

        // Monat
        if (arr.length >= 2 && !kijs.isEmpty(arr[1])) {
            if (!kijs.isNumeric(arr[1])) {
                return null;
            }
            month = parseInt(arr[1]);
            if (month < 1 || month > 12) {
                return null;
            }
        } else {
            month = (new Date()).getMonth() + 1;
        }

        // Jahr
        if (arr.length >= 3 && !kijs.isEmpty(arr[2])) {
            if (!kijs.isNumeric(arr[2])) {
                return null;
            }
            year = parseInt(arr[2]);

            // Evtl. aus zweistelliger Jahrezahl eine vierstellige machen
            if (!kijs.isEmpty(this._year2000Threshold) && year >= 10 && year <= 99) {
                if (year >= this._year2000Threshold) {
                    year += 1900;
                } else {
                    year += 2000;
                }
            }
        } else {
            year = (new Date()).getFullYear();
        }

        // Daraus nun ein Datum erstellen
        return new Date(year, month-1, day);
    }

    _parseStringToTime(strInput) {
        const seperators = [':', '.'];
        let hours = null;
        let minutes = null;
        let seconds = null;

        // Zulässige Trennzeichen durch #|@# ersetzen
        for (let i=0; i<seperators.length; i++) {
            strInput = kijs.String.replaceAll(strInput, seperators[i], '#|@#');
        }

        // Splitten nach #|@#
        const arr = strInput.split('#|@#');

        // Der String darf aus ein bis drei Bestandteilen bestehen
        if (arr.length < 1 || arr.length > 3) {
            return '';
        }

        // Stunden
        if (arr.length >= 1) {
            if (!kijs.isNumeric(arr[0])) {
                return '';
            }
            hours = parseInt(arr[0]);
            if (hours < 0 || hours > 24) {
                return '';
            }
            if (hours === 24) {
                hours = 0;
            }
        }

        // Minuten
        if (arr.length >= 2) {
            if (!kijs.isNumeric(arr[1])) {
                return '';
            }
            minutes = parseInt(arr[1]);
            if (minutes < 0 || minutes > 59) {
                return '';
            }
        } else {
            minutes = 0;
        }

        // Sekunden
        if (arr.length >= 3) {
            if (!kijs.isNumeric(arr[2])) {
                return '';
            }
            seconds = parseInt(arr[2]);
            if (seconds < 0 || seconds > 59) {
                return '';
            }
        } else {
            seconds = 0;
        }

        // Uhrzeit als String zurückgeben
        return this._zeroPad(hours) + ':' + this._zeroPad(minutes) + ':' + this._zeroPad(seconds);
    }

    // overwrite
    _validationRules(value) {
        const date = this._datePicker.date;
        const dateEnd = this._datePicker.dateEnd;
        const time = this._timePicker.value;
        const dateFormat = this._displayDateFormat ? this._displayDateFormat : 'd.m.Y';

        // Datum validieren
        if ((!kijs.isEmpty(date) || !kijs.isEmpty(dateEnd)) && this._hasDate()) {

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
                            kijs.Date.format(this._datePicker.minDate, dateFormat)));
                }

                // Max. value
                if ( (!kijs.isEmpty(date) && !kijs.isEmpty(this._datePicker.maxDate) && date > this._datePicker.maxDate)
                        || (!kijs.isEmpty(dateEnd) && !kijs.isEmpty(this._datePicker.maxDate) && dateEnd < this._datePicker.maxDate) ) {

                    this._errors.push(
                            kijs.getText('Der maximale Wert für dieses Feld ist %1',
                            '',
                            kijs.Date.format(this._datePicker.maxDate, dateFormat)));
                }

            // nur Startdatum validieren
            } else {

                // Min. value
                if (!kijs.isEmpty(date) && !kijs.isEmpty(this._datePicker.minDate) && date < this._datePicker.minDate) {
                    this._errors.push(
                            kijs.getText('Der minimale Wert für dieses Feld ist %1',
                            '',
                            kijs.Date.format(this._datePicker.minDate, dateFormat)));
                }

                // Max. value
                if (!kijs.isEmpty(date) && !kijs.isEmpty(this._datePicker.maxDate) && date > this._datePicker.maxDate) {
                    this._errors.push(
                            kijs.getText('Der maximale Wert für dieses Feld ist %1',
                            '',
                            kijs.Date.format(this._datePicker.maxDate, dateFormat)));
                }

            }
        } else if (this._hasDate() && this._required && kijs.isEmpty(date)) {
            this._errors.push(kijs.getText('Das Datum darf nicht leer sein'));
        }

        // Uhrzeit validieren
        if (this._hasTime()) {
            if (this._required && this._timeRequired && kijs.isEmpty(time)) {
                this._errors.push(kijs.getText('Die Uhrzeit darf nicht leer sein'));
            }
        }

        super._validationRules(value);
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


    // LISTENERS
    _onDatePickerChange(e) {
        this._inputDom.nodeAttributeSet('value', this._getDisplayValue());
    }

    _onDatePickerEmptyClick(e) {
        this._timePicker.value = '';

        this._inputDom.nodeAttributeSet('value', this._getDisplayValue());

        this._spinBoxEl.close();
    }

    _onDatePickerInputFinished(e) {
        if (!this._hasTime()) {
            this._spinBoxEl.close();
        }
    }

    _onDatePickerTodayClick(e) {
        if (!this._hasTime()) {
            this._spinBoxEl.close();
        }
    }

    _onInputDomChange(e) {
        this._parseString(e.nodeEvent.target.value);

        this._inputDom.nodeAttributeSet('value', this._getDisplayValue());

        this.validate();

        // Falls etwas geändert hat: Change Event auslösen
        const value = this.value;
        const valueEnd = this.valueEnd;
        if (this._lastValue !== value || this._lastValueEnd !== valueEnd) {
            this.raiseEvent('change', {value: value, valueEnd: valueEnd});
            this._lastValue = value;
            this._lastValueEnd = valueEnd;
        }
    }

    _onInputDomInput(e) {
        this.resetErrors();
    }

    _onInputDomDblClick() {

        // Mobile: Tastatur anzeigen beim Doppelklick
        // Funktioniert nur in Chrome
        if ('virtualKeyboard' in window.navigator) {
            window.navigator.virtualKeyboard.show();
        }
    }

    _onSpinBoxElClose(e) {
        this.validate();

        // Falls etwas geändert hat: Change Event auslösen
        const value = this.value;
        const valueEnd = this.valueEnd;
        if (this._lastValue !== value || this._lastValueEnd !== valueEnd) {
            this.raiseEvent('change', {value: value, valueEnd: valueEnd});
            this._lastValue = value;
            this._lastValueEnd = valueEnd;
        }
    }

    _onTimePickerChange(e) {
        this._inputDom.nodeAttributeSet('value', this._getDisplayValue());
    }

    _onTimePickerEmptyClick(e) {
        this._spinBoxEl.close();
    }
    _onTimePickerInputFinished(e) {
        this._spinBoxEl.close();
    }

    _onTimePickerNowClick(e) {
        if (!this._hasDate() || !kijs.isEmpty(this._datePicker.date)) {
            this._spinBoxEl.close();
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

        // Variablen (Objekte/Arrays) leeren
        this._inputDom = null;
        this._datePicker = null;
        this._seperatorEl = null;
        this._timePicker = null;
        this._spinBoxEl = null;

        // Basisklasse entladen
        super.destruct(true);
    }
};
