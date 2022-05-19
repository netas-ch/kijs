/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.DatePicker
// --------------------------------------------------------------
kijs.gui.DatePicker = class kijs_gui_DatePicker extends kijs.gui.Element {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);
        this._weeksCount = 6; // Wir zeigen fix 6 Wochen an

        this._minDate = null; // Min Value (Date Object)
        this._maxDate = null; // Max Value (Date Object)
        this._weekNumbersHide = false;  // Wochennummern ausblenden?
        this._startWeekday = 1;         // Erster Tag in der Ansicht (1=Montag)
                                        // TODO: Falls mal ein anderer Tag als der Montag verwendet werden soll,
                                        // geht das im Moment nicht, weil noch die Funktion kijs.Date.getMonday()
                                        // verwendet wird. Diese berücksichtigt die Einstellung hier nicht.

        this._valueFormat = 'Y-m-d';    // Format, mit dem der value ausgeliefert wird
        this._headerBarFormat = 'F Y';  // Anzeige Format für die HeaderBar

        this._mode = 'date';             // Modus: 'date', 'week' oder 'range'

        this._date = null;              // Aktueller Wert (Bei mode 'week' und 'range' ist es das Startdatum)
        this._dateEnd = null;           // Enddatum des aktuellen Werts (nur bei Mode 'week' und 'range', sonst null

        this._headerBarHide = false;
        this._todayBtnHide = false;
        this._emptyBtnHide = false;
        this._closeBtnHide = true;

        // HeaderBar mit Buttons Previous und Next
        this._previousBtn = new kijs.gui.Button({
            iconMap: 'kijs.iconMap.Fa.circle-chevron-left',
            on: {
                click: this._onPreviousBtnClick,
                context: this
            }
        });
        this._previousBtn.dom.nodeAttributeSet('tabIndex', -1);

        this._nextBtn = new kijs.gui.Button({
            iconMap: 'kijs.iconMap.Fa.circle-chevron-right',
            on: {
                click: this._onNextBtnClick,
                context: this
            }
        });
        this._nextBtn.dom.nodeAttributeSet('tabIndex', -1);

        this._headerBar = new kijs.gui.PanelBar({
            cls: 'kijs-headerbar-center',
            elementsLeft: [this._previousBtn],
            elementsRight: [this._nextBtn],
            on: {
                click: this._onHeaderBarClick,
                context: this
            }
        });

        this._calendarDivDom = new kijs.gui.Dom({ cls: 'kijs-datepicker-calendardiv' });
        this._calendarWeekHeadersDivDom = new kijs.gui.Dom({ cls: 'kijs-datepicker-weakheadersdiv' });

        this._footerDivDom = new kijs.gui.Dom({ cls: 'kijs-datepicker-footerdiv' });


        // Array mit den 7 Zeilen (1 x Spaltenüberschrift + 6 x Wochenzeile)
        this._rowsDom = [];

        // Array mit den einzelnen Items (Spaltenüberschriften, Wochennummer und einzelne Tage)
        this._itemsDom = [];

        // MonthPicker
        this._monthPicker = new kijs.gui.MonthPicker({
            headerBarHide: true,
            currentBtnHide: false,
            emptyBtnHide: true,
            closeBtnHide: false,
            value: new Date(),
            on: {
                change: this._onMonthPickerChange,
                monthClick: this._onMonthPickerMonthClick,
                closeClick: this._onMonthPickerCloseClick,
                currentClick: this._onMonthPickerCurrentClick,
                context: this
            }
        });

        // Spinbox mit MonthPicker
        this._spinBoxEl = new kijs.gui.SpinBox({
            target: this._headerBar,
            autoSize: 'none',
            targetDomProperty: 'dom',
            ownerNodes: [this._headerBar.dom],
            cls: ['kijs-borderless'],
            parent: this
        });
        this._spinBoxEl.add(this._monthPicker);

        // Button Heute
        this._todayBtn = new kijs.gui.Button({
            html: kijs.getText('Heute'),
            on: {
                click: this._onTodayBtnClick,
                context: this
            }
        });
        this._todayBtn.dom.nodeAttributeSet('tabIndex', -1);

        // Button Leeren
        this._emptyBtn = new kijs.gui.Button({
            html: kijs.getText('Leeren'),
            on: {
                click: this._onEmptyBtnClick,
                context: this
            }
        });
        this._emptyBtn.dom.nodeAttributeSet('tabIndex', -1);

        // Button Schliessen
        this._closeBtn = new kijs.gui.Button({
            html: kijs.getText('Schliessen')
        });
        this._closeBtn.dom.nodeAttributeSet('tabIndex', -1);

        this._dom.clsAdd('kijs-datepicker');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            mode: true,                         // Modus: 'date', 'week' oder 'range'
            weekNumbersHide: true,              // Wochennummern ausblenden?
            valueFormat: true,                  // Format, mit dem der value ausgeliefert wird
            headerBarFormat: true,              // Anzeige Format für die HeaderBar
            minValue: { target: 'minValue' },   // Kleinster zu wählender Monat     (Date Object oder SQL-String mit einem beliebigen Datum des Monats)
            maxValue: { target: 'maxValue' },   // Grösster zu wählender Monat      (Date Object oder SQL-String mit einem beliebigen Datum des Monats)
            headerBarHide: true,                // HeaderBar ausblenden
            todayBtnHide: true,                 // Heute Button ausblenden
            emptyBtnHide: true,                 // Leer lassen Button ausblenden
            closeBtnHide: true,                 // Schliessen Button ausblenden
            date: { target: 'date' },           // Date Object
            dateEnd: { target: 'dateEnd' },     // Date Object
            value: { target: 'value' },         // SQL-String
            valueEnd: { target: 'valueEnd' }    // SQL-String
        });

        // Events weiterleiten
        this._eventForwardsAdd('closeClick', this._closeBtn, 'click');

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }
    }


    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get closeBtnHide() { return this._closeBtnHide; }
    set closeBtnHide(val) { this._closeBtnHide = !!val; }

    get emptyBtnHide() { return this._emptyBtnHide; }
    set emptyBtnHide(val) { this._emptyBtnHide = !!val; }

    get headerBarHide() { return this._headerBarHide; }
    set headerBarHide(val) { this._headerBarHide = !!val; }

    get date() {
        if (kijs.isEmpty(this._date)) {
            // Falls es ein End-Datum gibt dieses nehmen
            if (!kijs.isEmpty(this._dateEnd)) {
                return this._dateEnd;
            } else {
                return null;
            }
        } else {
            // Sicherstellen, dass das Enddatum hinter dem Startdatum liegt
            if (!kijs.isEmpty(this._dateEnd) && this._dateEnd < this._date) {
                return this._dateEnd;
            } else {
                return this._date;
            }
        }
    }
    set date(val) {
        if (kijs.isEmpty(val)) {
            this._date = null;
            this._monthPicker.date = new Date();
        } else {
            this._date = kijs.Date.getDatePart(kijs.Date.create(val));
            if (this._mode === 'week') {
                // Sicherstellen, dass die Woche mit dem Montag beginnt
                if (this._date.getDay() !== 1) {
                    this._date = kijs.Date.getMonday(this._date);
                }
                // Enddatum auch gleich setzen
                this._dateEnd = kijs.Date.addDays(this._date, 6);
            }
            this._monthPicker.date = this._date;
        }
        this._calculate();
    }

    get dateEnd() {
        if (kijs.isEmpty(this._dateEnd)) {
            return null;

        // Falls es kein Startdatum gibt, das Enddatum nicht zurückgeben (es wird als Startdatum zurückgegeben)
        } else if (kijs.isEmpty(this._date)) {
                return null;

        // Sicherstellen, dass das Enddatum hinter dem Startdatum liegt
        } else if (this._dateEnd < this._date) {
            return this._date;

        } else {
            return this._dateEnd;
        }
    }
    set dateEnd(val) {
        if (kijs.isEmpty(val)) {
            this._dateEnd = null;
        } else {
            this._dateEnd = kijs.Date.getDatePart(kijs.Date.create(val));
        }
        this._calculate();
    }

    get headerBar() { return this._headerBar; }

    get headerBarFormat() { return this._headerBarFormat; }
    set headerBarFormat(val) { this._headerBarFormat = val; }

    get maxDate() {
        return this._maxDate;
    }
    set maxDate(val) {
        this._maxDate = kijs.isEmpty(val) ? null : kijs.Date.create(val);
    }

    get minDate() {
        return this._minDate;
    }
    set minDate(val) {
        this._minDate = kijs.isEmpty(val) ? null : kijs.Date.create(val);
    }

    get maxValue() {
        return kijs.Date.format(this.maxDate, this._valueFormat);
    }
    set maxValue(val) {
        this.maxDate = val;
    }

    get minValue() {
        return kijs.Date.format(this.minDate, this._valueFormat);
    }
    set minValue(val) {
        this.minDate = val;
    }

    get mode() {
        return this._mode;
    }
    set mode(val) {
        this._mode = val;
        this._calculate();
    }

    get todayBtnHide() { return this._todayBtnHide; }
    set todayBtnHide(val) { this._todayBtnHide = !!val; }

    get value() {
        if (kijs.isEmpty(this._date)) {
            return '';
        } else {
            return kijs.Date.format(this._date, this._valueFormat);
        }
    }
    set value(val) {
        this.date = val;
    }

    get valueEnd() {
        if (kijs.isEmpty(this._dateEnd)) {
            return '';
        } else {
            return kijs.Date.format(this._dateEnd, this._valueFormat);
        }
    }
    set valueEnd(val) {
        this.dateEnd = val;
    }

    get valueFormat() { return this._valueFormat; }
    set valueFormat(val) { this._valueFormat = val; }

    get weekNumbersHide() { return this._weekNumbersHide; }
    set weekNumbersHide(val) { this._weekNumbersHide = !!val; }


    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // Falls value ausserhalb von minValue oder maxValue ist, wird er auf den nächst möglichen Wert verändert.
    getNextValidDate(value) {
        if (this._minDate && value < this._minDate) {
            value = this._minDate;
        }
        if (this._maxDate && value > this._maxDate) {
            value = this._maxDate;
        }
        return value;
    }

    // Overwrite
    render(superCall) {
        super.render(true);

        // HeaderBar rendern
        if (!this._headerBarHide) {
            this._headerBar.renderTo(this._dom.node);
        } else if (this._headerBar.isRendered) {
            this._headerBar.unrender();
        }

        // DIV's rendern
        this._calendarDivDom.renderTo(this._dom.node);
        this._footerDivDom.renderTo(this._dom.node);

        // Zeilen rendern
        this._renderRowsDom();

        // Items rendern
        this._renderItemsDom();

        // Items berechnen
        this._calculate();

        // todayBtn, emptyBtn, closeBtn
        if (!this._todayBtnHide) {
            this._todayBtn.renderTo(this._footerDivDom.node);
        } else {
            this._todayBtn.unrender();
        }
        if (!this._emptyBtnHide) {
            this._emptyBtn.renderTo(this._footerDivDom.node);
        } else {
            this._emptyBtn.unrender();
        }
        if (!this._closeBtnHide) {
            this._closeBtn.renderTo(this._footerDivDom.node);
        } else {
            this._closeBtn.unrender();
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

        this._headerBar.unrender();
        this._calendarDivDom.unrender();
        this._todayBtn.unrender();
        this._emptyBtn.unrender();
        this._closeBtn.unrender();
        this._footerDivDom.unrender();
        this._spinBoxEl.unrender();

        super.unrender(true);
    }


    // PROTECTED
    _calculate(tmpRangeEndDate = null) {
        if (!this.isRendered) {
            return;
        }

        // Sicherstellen, dass die Daten stimmen
        this._checkValueOrder();

        // Range ermitteln
        let rangeStartDate = this._date;
        let rangeEndDate = this._dateEnd;

        // Falls im Range-Modus nur das Startdatum vorhanden ist, als temporäres Enddatum das Datum unter dem Mauszeiger nehmen
        if (this._mode === 'range' && kijs.isEmpty(this._dateEnd)) {
            rangeEndDate = tmpRangeEndDate;
        }

        // Falls kein Enddatum vorhanden ist, nehmen wir das Startdatum auch als Enddatum
        if (kijs.isEmpty(rangeEndDate)) {
            rangeEndDate = rangeStartDate;
        }

        // Sicherstellen, dass das Enddatum hinter dem Startdatum liegt
        if (rangeEndDate < rangeStartDate) {
            let tmp = rangeStartDate;
            rangeStartDate = rangeEndDate;
            rangeEndDate = tmp;
            tmp = null;
        }

        const today = kijs.Date.getDatePart(new Date());
        const curMonthIndex = this._monthPicker.date.getMonth();
        const firstOfMonth = kijs.Date.getFirstOfMonth(this._monthPicker.date);
        const lastOfMonth = kijs.Date.getLastOfMonth(this._monthPicker.date);
        const monthDaysCount = lastOfMonth.getDate();
        const firstOfMonthWeekday = firstOfMonth.getDay();
        let firstOfCalendar;
        let offset, date;
        let index = 0;

        // Erster Tag im Kalender ermitteln
        firstOfCalendar = kijs.Date.clone(firstOfMonth);
        offset = firstOfMonthWeekday - this._startWeekday;
        if (offset < 0) {
            offset += 7;
        }
        firstOfCalendar = kijs.Date.addDays(firstOfCalendar, offset*-1);
        // falls im Kalender gar keine Tage des Vormonats angezeigt werden, fügen wir noch die letzte Woche des Vormonats hinzu.
        if (kijs.Date.compare(firstOfCalendar, firstOfMonth)) {
            firstOfCalendar = kijs.Date.addDays(firstOfCalendar, -7);
        }

        date = firstOfCalendar;


        // Spaltenüberschriften
        // Evtl. leere Wochennummer
        if (!this._weekNumbersHide) {
            const dom = this._itemsDom[index];
            dom.clsAdd('kijs-none');
            dom.html = '';
            index++;
        }
        // (Mo-So)
        for (let i=0; i<7; i++) {
            const dom = this._itemsDom[index];

            let weekDay = this._startWeekday + i;
            if (weekDay > 6) {
                weekDay -= 7;
            }


            dom.clsAdd('kijs-head');
            // Weekend?
            if (weekDay === 0 || weekDay === 6) {
                dom.clsAdd('kijs-weekend');
            } else {
                dom.clsRemove('kijs-weekend');
            }
            dom.html = kijs.Date.weekdays_short[weekDay];
            index++;
        }

        // Wochen durchgehen
        for (let week=0; week<this._weeksCount; week++) {
            // Evtl. Wochennummer
            if (!this._weekNumbersHide) {
                const dom = this._itemsDom[index];
                dom.clsAdd('kijs-weekno');
                dom.html = parseInt(kijs.Date.format(date, 'W'));
                index++;
            }

            // und die Tage der Woche (Mo-So)
            for (let i=0; i<7; i++) {
                const dom = this._itemsDom[index];
                dom.clsAdd('kijs-day');
                dom.html = date.getDate();
                dom.date = kijs.Date.clone(date);

                // Weekend?
                if (date.getDay() === 0 || date.getDay() === 6) {
                    dom.clsAdd('kijs-weekend');
                } else {
                    dom.clsRemove('kijs-weekend');
                }

                // Tag ausserhalb vom Monat?
                if (date.getMonth() !== curMonthIndex) {
                    dom.clsAdd('kijs-outofmonth');
                } else {
                    dom.clsRemove('kijs-outofmonth');
                }

                // aktueller Tag?
                if (kijs.Date.compare(date, today)) {
                    dom.clsAdd('kijs-today');
                } else {
                    dom.clsRemove('kijs-today');
                }

                // disabled
                if ( (this._minDate && this._minDate > date) || (this._maxDate && this._maxDate < date) ) {
                    dom.clsAdd('kijs-disabled');
                } else {
                    dom.clsRemove('kijs-disabled');
                }

                // Nur ein einzelnes Datum selektieren?
                if (kijs.Date.compare(rangeStartDate, rangeEndDate)) {
                    if (kijs.Date.compare(date, rangeStartDate)) {
                        dom.clsAdd('kijs-value');
                    } else {
                        dom.clsRemove('kijs-value');
                    }

                    dom.clsRemove('kijs-range');
                    dom.clsRemove('kijs-rangestart');
                    dom.clsRemove('kijs-rangeend');

                // Range selektieren
                } else {
                    // Liegt das Datum innerhalb des aktuellen Ranges?
                    if (!kijs.isEmpty(rangeStartDate) && rangeStartDate <= date && date <= rangeEndDate) {
                        dom.clsAdd('kijs-range');
                    } else {
                        dom.clsRemove('kijs-range');
                    }

                    // Stimmt das Datum mit dem Startdatum des Ranges überein?
                    if (kijs.Date.compare(date, rangeStartDate)) {
                        dom.clsAdd('kijs-rangestart');
                    } else {
                        dom.clsRemove('kijs-rangestart');
                    }

                    // Stimmt das Datum mit dem Enddatum des Ranges überein?
                    if (kijs.Date.compare(date, rangeEndDate)) {
                        dom.clsAdd('kijs-rangeend');
                    } else {
                        dom.clsRemove('kijs-rangeend');
                    }

                    dom.clsRemove('kijs-value');
                }

                index++;
                date = kijs.Date.addDays(date, 1);
            }

        }

        // Monat und Jahr in HeaderBar schreiben
        if (!this._headerBarHide) {
            if (kijs.isEmpty(this._monthPicker.date)) {
                this._headerBar.html = '';
            } else {
                this._headerBar.html = kijs.Date.format(this._monthPicker.date, this._headerBarFormat);
            }
        }
    }


    // Stellt sicher, dass das Enddatum hinter dem Startdatum liegt
    _checkValueOrder() {
        if (this._mode === 'date') {
            this._dateEnd = null;

        } else if (this._mode === 'week') {
            if (!kijs.isEmpty(this._date)) {

                // Sicherstellen, dass die Woche mit dem Montag beginnt
                if (this._date.getDay() !== 1) {
                    this._date = kijs.Date.getMonday(this._date);
                }
                // Enddatum
                this._dateEnd = kijs.Date.addDays(this._date, 6);
            }


        } else if (this._mode === 'range') {
            // Falls nur ein Enddatum vorhanden ist, nehmen wir das als Startdatum
            if (!kijs.isEmpty(this._dateEnd)) {
                if (kijs.isEmpty(this._date)) {
                    this._date = this._dateEnd;
                    this._dateEnd = null;

                // Falls Start- und Enddatum vorhanden sind, die Reihenfolge checken
                } else {
                    if (this._dateEnd < this._date) {
                        let tmp = this._dateEnd;
                        this._dateEnd = this._date;
                        this._date = tmp;
                    }
                }
            }
        }
    }

    // Erstellt die Kalender Items als kijs.gui.Dom
    _createItemsDom() {
        const rowsCount = this._weeksCount + 1;   // Anzahl Wochen + Spaltenheader
        const itemsCount = rowsCount * (this._weekNumbersHide ? 7 : 8);

        // Falls es schon items gibt: destruct
        if (this._itemsDom) {
            kijs.Array.each(this._itemsDom, function(dom) {
                dom.destruct();
            }, this);
            kijs.Array.clear(this._itemsDom);
        }

        // Items erstellen
        for (let i=0; i<itemsCount; i++) {
            const itm = new kijs.gui.Dom({
                on: {
                    click: this._onItemDomClick,
                    dblClick: this._onItemDomDblClick,
                    context: this
                }
            });
            itm.on('mouseEnter', this._onItemDomMouseEnter, this);
            this._itemsDom.push(itm);
        }
    }

    // Spaltenüberschrift + 6 Zeilen erstellen
    _createRowsDom() {
        const count = this._weeksCount + 1;

        // Falls es schon rows gibt: destruct
        if (this._rowsDom) {
            kijs.Array.each(this._rowsDom, function(dom) {
                dom.destruct();
            }, this);
            kijs.Array.clear(this._rowsDom);
        }

        // Rows erstellen
        for (let i=0; i<count; i++) {
            this._rowsDom.push(new kijs.gui.Dom());
        }
    }

    // Rendert die 12 Monate kijs.gui.Dom
    _renderItemsDom() {
        const rowsCount = this._weeksCount + 1;   // Anzahl Wochen + Spaltenheader
        const itemsPerRow = this._weekNumbersHide ? 7 : 8;
        const itemsCount = rowsCount * itemsPerRow;
        const curItemsCount = this._itemsDom.length;

        if (curItemsCount !== itemsCount) {
            this._createItemsDom();
        }

        for (let i=0; i<itemsCount; i++) {
            let rowIndex = Math.floor(i / itemsPerRow);
            this._itemsDom[i].renderTo(this._rowsDom[rowIndex].node);
        }
    }

    // Rendert die Zeilen
    _renderRowsDom() {
        const rowsCount = this._weeksCount + 1;   // Anzahl Wochen + Spaltenheader
        const curRowsCount = this._rowsDom.length;

        if (curRowsCount !== rowsCount) {
            this._createRowsDom();
        }

        for (let i=0; i<rowsCount; i++) {
            this._rowsDom[i].renderTo(this._calendarDivDom.node);
        }
    }

    // EVENTS
    _onTodayBtnClick(e) {
        const curDate = kijs.isEmpty(this._date) ? null : kijs.Date.clone(this._date);

        let date = kijs.Date.getDatePart(new Date());

        this._date = this.getNextValidDate(date);
        if (this._mode === 'range') {
            this._dateEnd = kijs.Date.clone(this._date);
        } else {
            this._dateEnd = null;
        }
        this._monthPicker.date = this._date;
        this._calculate(true);

        if (!kijs.Date.compare(this._date, curDate)) {
            this.raiseEvent('change', {value: this.value, valueEnd: this.valueEnd});
        }
        this.raiseEvent('todayClick');
    }

    _onEmptyBtnClick(e) {
        const curDate = kijs.isEmpty(this._date) ? null : kijs.Date.clone(this._date);

        this._date = null;
        this._dateEnd = null;
        this._monthPicker.date = new Date();
        this._calculate();

        if (!kijs.Date.compare(this._date, curDate)) {
            this.raiseEvent('change', {value: this.value, valueEnd: this.valueEnd});
        }
        this.raiseEvent('emptyClick');
    }

    _onHeaderBarClick() {
        if (this._spinBoxEl.isRendered) {
            this._spinBoxEl.close();
        } else {
            this._spinBoxEl.show();
            this._monthPicker.focus();
        }
    }

    _onItemDomClick(e) {
        if (e.dom.clsHas('kijs-day') && !e.dom.clsHas('kijs-disabled')) {
            const curDate = kijs.isEmpty(this._date) ? null : kijs.Date.clone(this._date);
            const curEndDate = kijs.isEmpty(this._dateEnd) ? null : kijs.Date.clone(this._dateEnd);
            let inputFinished = false;

            let date = this.getNextValidDate(e.dom.date);
            // nur das Datum übernehmen, wenn es gültig ist
            if (kijs.Date.compare(date, e.dom.date)) {

                // Wenn bei Range nur das Start und kein Enddatum gesetzt ist, setzen wir das Enddatum
                if (this._mode === 'range' && !kijs.isEmpty(this._date) && kijs.isEmpty(this._dateEnd)) {
                    this._dateEnd = date;
                    inputFinished = true;

                // sonst wird immer das Startdatum gesetzt
                } else {
                    this._date = date;
                    this._dateEnd = null;

                    if (this._mode !== 'range') {
                        inputFinished = true;
                    }
                }

                this._monthPicker.date = date;
                this._calculate();

                if (!kijs.Date.compare(this._date, curDate) || !kijs.Date.compare(this._enDate, curEndDate)) {
                    this.raiseEvent('change', {value: this.value, valueEnd: this.valueEnd});
                }
            }

            if (inputFinished) {
                this.raiseEvent('inputFinished');
            }
            this.raiseEvent('dayClick');
        }
    }

    _onItemDomDblClick(e) {
        if (e.dom.clsHas('kijs-day') && !e.dom.clsHas('kijs-disabled')) {
            this.raiseEvent('dayDblClick');
        }
    }

    _onItemDomMouseEnter(e) {
        if (this._mode === 'range') {
            if (e.dom.clsHas('kijs-day')) {
                const date = this.getNextValidDate(e.dom.date);
                this._calculate(date);
            }
        }
    }

    _onMonthPickerChange(e) {
        this._calculate();
    }

    _onMonthPickerCloseClick(e) {
        this._spinBoxEl.close();
    }

    _onMonthPickerCurrentClick(e) {
        this._spinBoxEl.close();
    }

    _onMonthPickerMonthClick(e) {
        this._spinBoxEl.close();
    }

    _onNextBtnClick(e) {
        this._monthPicker.date = kijs.Date.addMonths(this._monthPicker.date, 1);
        this._calculate();
    }

    _onPreviousBtnClick(e) {
        this._monthPicker.date = kijs.Date.addMonths(this._monthPicker.date, -1);
        this._calculate();
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
        if (this._itemsDom && this._itemsDom.length) {
            kijs.Array.each(this._itemsDom, function(dom) {
                dom.destruct();
            }, this);
        }

        if (this._rowsDom && this._rowsDom.length) {
            kijs.Array.each(this._rowsDom, function(dom) {
                dom.destruct();
            }, this);
        }

        if (this._todayBtn) {
            this._todayBtn.destruct();
        }

        if (this._emptyBtn) {
            this._emptyBtn.destruct();
        }

        if (this._closeBtn) {
            this._closeBtn.destruct();
        }

        if (this._headerBar) {
            this._headerBar.destruct();
        }

        if (this._calendarDivDom) {
            this._calendarDivDom.destruct();
        }

        if (this._footerDivDom) {
            this._footerDivDom.destruct();
        }

        if (this._spinBoxEl) {
            this._spinBoxEl.destruct();
        }

        // Variablen (Objekte/Arrays) leeren
        this._minDate = null;
        this._maxDate = null;
        this._date = null;
        this._dateEnd = null;

        this._previousBtn = null;
        this._nextBtn = null;
        this._headerBar = null;
        this._todayBtn = null;
        this._emptyBtn = null;
        this._closeBtn = null;

        this._itemsDom = null;
        this._rowsDom = null;
        this._calendarDivDom = null;
        this._footerDivDom = null;

        this._spinBoxEl = null;
        this._monthPicker = null;

        // Basisklasse entladen
        super.destruct(true);
    }

};
