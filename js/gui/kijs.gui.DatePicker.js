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

        this._startWeekday = 1; // Erster Tag in der Ansicht (1=Montag)
        this._showWeekNumbers = true; // Wochennummern
        this._weekSelect = false; // ganze Woche auswählen?
        this._showCalendar = true; // Kalender oder Monatswahl?

        this._visibleMonthDate = kijs.Date.getFirstOfMonth(new Date()); // Sichtbarer Monat

        this._value = new Date(); //null; // ausgewähltes Datum
        this._rangeFrom = null; //new Date(2019, 0, 1);
        this._rangeTo = null; // new Date(2019, 0, 10);


        this._nextBtn = new kijs.gui.Button({
            iconChar: '&#xf138', // fa-chevron-circle-right
            on: {
                click: this._onNextBtnClick,
                context: this
            }
        });

        this._previousBtn = new kijs.gui.Button({
            iconChar: '&#xf137', // fa-chevron-circle-left
            on: {
                click: this._onPreviousBtnClick,
                context: this
            }
        });

        this._headerBar = new kijs.gui.PanelBar({
            cls: 'kijs-headerbar-center',
            elementsLeft: [this._previousBtn],
            elementsRight: [this._nextBtn],
            on: {
                click: this._onHeaderBarClick,
                context: this
            }
        });

        this._calendarDom = new kijs.gui.Dom({
            cls: 'kijs-datepicker-calendar',
            on: {
                mouseLeave: this._onCalendarMouseLeave,
                wheel: this._onCalendarWheel,
                context: this
            }
        });

        // Zweidimensionales Grid-Array aufbauen
        this._gridColumns = [];
        for (let y=0; y<7; y++) { // max 6 Datumzeilen + 1 Header
            let rows = [];

            // Dom-Element für Zeile
            let colDom = new kijs.gui.Dom();

            // Dom-Elemente für Spalten
            for (let x=0; x<8; x++) { // 7 Tage + 1 Wochen-Nr.
                rows.push({
                    x: x,
                    y: y,
                    dom: new kijs.gui.Dom({
                        on: {
                            mouseEnter: this._onDateMouseEnter,
                            click: this._onDateMouseClick,
                            context: this
                        }
                    }),
                    isHeader: y===0,
                    isWeekNr: x===0,
                    date: null
                });
            }

            this._gridColumns.push({
                y: y,
                dom: colDom,
                rows: rows
            });
        }

        // Selector für Monat / Jahr
        this._yearMonthDom = new kijs.gui.Dom({
            cls: 'kijs-datepicker-monthyearselector'
        });
        this._monthDom = new kijs.gui.Dom({
            cls: 'kijs-datepicker-monthselector'
        });
        this._yearDom = new kijs.gui.Dom({
            cls: 'kijs-datepicker-yearselector'
        });

        this._monthSelector = [];
        for (let m=0; m<12; m++) { // Jan-Dez
            this._monthSelector.push({
                month: m,
                dom: new kijs.gui.Dom({
                    html: kijs.Date.months_short[m],
                    on: {
                        click: this._onMonthSelectorClick,
                        context: this
                    }
                })
            });
        }

        // Selector für Jahr
        this._yearSelector = [];


        // Knopf auf
        this._yearSelector.push({
            dir: 'up',
            dom: new kijs.gui.Dom({
                cls: 'kijs-btn-up',
                html: '▴',
                on: {
                    click: this._onYearSelectorUpClick,
                    context: this
                }
            })
        });

        // 5 Jahre
        for (let y=0; y < 5; y++) {
            this._yearSelector.push({
                year: (new Date()).getFullYear() - 2 + y,
                dom: new kijs.gui.Dom({
                    html: (new Date()).getFullYear() - 2 + y,
                    on: {
                        click: this._onYearSelectorClick,
                        wheel: this._onYearSelectorWheel,
                        context: this
                    }
                })
            });
        }


        // Knopf ab
        this._yearSelector.push({
            dir: 'down',
            dom: new kijs.gui.Dom({
                cls: 'kijs-btn-down',
                html: '▾',
                on: {
                    click: this._onYearSelectorDownClick,
                    context: this
                }
            })
        });


        // Button 'heute'
        this._todayBtn = new kijs.gui.Button({
            parent: this,
            caption: kijs.getText('Heute'),
            on: {
                click: this._onTodayButtonClick,
                context: this
            }
        });

        this._dom.clsAdd('kijs-datepicker');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            rangeFrom: true,
            rangeTo: true,
            value: { target: 'value' }
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }

    }


    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get value() { return this._value;}

    set value(val) {
        this._value = kijs.Date.create(val);
        this._visibleMonthDate = kijs.Date.getFirstOfMonth(this._value);
        this._calculateCalendar();
    }

    get inputField() {
        let p = this;
        while (p.parent) {
            if (p.parent instanceof kijs.gui.field.Field) {
                return p.parent;
            }
            p = p.parent;
        }
    }


    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // Overwrite
    render(superCall) {
        super.render(true);

        // Header rendern
        this._headerBar.renderTo(this._dom.node);

        // Kalender berechnen
        this._calculateCalendar();

        // Picker berechnen
        this._calculateMonthYearPicker();

        // Calendar Container
        if (this._showCalendar) {
        this._yearMonthDom.unrender();
        this._calendarDom.renderTo(this._dom.node);

            // Einzelne Elemente
            kijs.Array.each(this._gridColumns, function(column) {
                column.dom.renderTo(this._calendarDom.node);

                kijs.Array.each(column.rows, function(row) {
                    row.dom.renderTo(column.dom.node);
                }, this);
            }, this);
        } else {
            this._calendarDom.unrender();
            this._yearMonthDom.renderTo(this._dom.node);

            this._monthDom.renderTo(this._yearMonthDom.node);
            this._yearDom.renderTo(this._yearMonthDom.node);

            for (let i=0; i<this._monthSelector.length; i++) {
                this._monthSelector[i].dom.renderTo(this._monthDom.node);
            }
            for (let i=0; i<this._yearSelector.length; i++) {
                this._yearSelector[i].dom.renderTo(this._yearDom.node);
            }
        }

        // Button für "Heute"
        if (!this._todayBtn.isEmpty) {
            this._todayBtn.renderTo(this._dom.node);
        } else {
            this._todayBtn.unrender();
        }

        // Event afterRender auslösen
        if (!superCall) {
            this.raiseEvent('afterRender');
        }

        let ip = this.inputField;
        if (ip) {
            ip.on('keyUp', this._onInputKeyUp, this);
        }

    }

    _calculateMonthYearPicker() {
        // Monat
        for (let i=0; i<this._monthSelector.length; i++) {

            // Text
            this._monthSelector[i].dom.html = kijs.Date.months_short[this._monthSelector[i].month];

            // aktueller monat
            if (this._visibleMonthDate && this._visibleMonthDate.getMonth() === this._monthSelector[i].month) {
                this._monthSelector[i].dom.clsAdd('kijs-value');
            } else {
                this._monthSelector[i].dom.clsRemove('kijs-value');
            }
        }

        // Jahr aktualisieren
        for (let i=1; i<this._yearSelector.length-1; i++) {
            // jahr schreiben
            this._yearSelector[i].dom.html = this._yearSelector[i].year;

            // aktuelles Jahr
            if (this._visibleMonthDate && this._visibleMonthDate.getFullYear() === this._yearSelector[i].year) {
                this._yearSelector[i].dom.clsAdd('kijs-value');
            } else {
                this._yearSelector[i].dom.clsRemove('kijs-value');
            }
        }
    }

    _calculateCalendar(rangeTo=null) {
        let offset;
        let day, firstDay, lastDay, monthIndex;

        // Aufbereiten
        rangeTo = rangeTo ? rangeTo : this._rangeTo;

        // Titel schreiben
        this._headerBar.html = kijs.Date.format(this._visibleMonthDate, 'F Y');

        monthIndex = this._visibleMonthDate.getMonth(); // Vorsicht: 0-basierend

        // Erster Tag im Kalender ermitteln
       firstDay = kijs.Date.clone(this._visibleMonthDate);
       offset = firstDay.getDay() - this._startWeekday;
       if (offset < 0) offset += 7;
       firstDay = kijs.Date.addDays(firstDay, offset*-1);


       // letzter Tag im Kalender ermitteln
       lastDay = kijs.Date.getLastOfMonth(this._visibleMonthDate);
       offset = this._startWeekday - lastDay.getDay() - 1;
       if (offset < 0) offset += 7;
       lastDay = kijs.Date.addDays(lastDay, offset);

       // Spaltenüberschriften (Mo-Fr)
       for (let i=0; i<this._gridColumns[0].rows.length; i++) {
           let fldDom = this._gridColumns[0].rows[i].dom;
           fldDom.clsAdd('kijs-head');
           if (i === 0)  {
               fldDom.clsAdd('kijs-weekno');
               fldDom.html = this._showWeekNumbers ? '&nbsp;' : '';

           } else {
               let wdNo = (i - 1) + this._startWeekday;
               if (wdNo > 6) {
                   wdNo -= 7;
               }
               fldDom.html = kijs.Date.weekdays_short[wdNo];

                if (wdNo === 0 || wdNo === 6) {
                    fldDom.clsAdd('kijs-weekend');
                } else {
                    fldDom.clsRemove('kijs-weekend');
                }
           }
       }

       day = kijs.Date.clone(firstDay);

       // Kalender-Zeilen
       for (let i=1; i < this._gridColumns.length; i++) {

           if (this._weekSelect) {
               this._gridColumns[i].dom.clsAdd('kijs-weekselect');
               this._gridColumns[i].dom.clsRemove('kijs-dayselect');
           } else {
               this._gridColumns[i].dom.clsAdd('kijs-dayselect');
               this._gridColumns[i].dom.clsRemove('kijs-weekselect');
           }

           // Kalender-Spalten
           for (let x=1; x<8; x++) {
               let fldDom = this._gridColumns[i].rows[x].dom;

               // datum eintragen
               this._gridColumns[i].rows[x].date = kijs.Date.clone(day);

               // Tag schreiben
               fldDom.html = kijs.Date.format(day, 'j');

               // Tag ausserhalb vom Monat?
               if (day.getMonth() !== monthIndex) {
                    fldDom.clsAdd('kijs-outofmonth');
               } else {
                    fldDom.clsRemove('kijs-outofmonth');
               }

               // aktueller Tag?
               if (kijs.Date.getDatePart(day).getTime() === kijs.Date.getDatePart(new Date()).getTime()) {
                   fldDom.clsAdd('kijs-today');
               } else {
                   fldDom.clsRemove('kijs-today');
               }

               // Weekend?
               if (day.getDay() === 0 || day.getDay() === 6) {
                   fldDom.clsAdd('kijs-weekend');
               } else {
                   fldDom.clsRemove('kijs-weekend');
               }

               // selektiertes Datum?
                if (this._value instanceof Date && kijs.Date.getDatePart(day).getTime() === kijs.Date.getDatePart(this._value).getTime()) {
                    fldDom.clsAdd('kijs-value');
                } else {
                    fldDom.clsRemove('kijs-value');
                }

                // range start
                if (this._rangeFrom && rangeTo && kijs.Date.getDatePart(day).getTime() === kijs.Date.getDatePart(this._rangeFrom).getTime()) {
                    fldDom.clsAdd('kijs-range-start');
                } else {
                    fldDom.clsRemove('kijs-range-start');
                }

                // range end
                if (this._rangeFrom && rangeTo && kijs.Date.getDatePart(day).getTime() === kijs.Date.getDatePart(rangeTo).getTime()) {
                    fldDom.clsAdd('kijs-range-end');
                } else {
                    fldDom.clsRemove('kijs-range-end');
                }

                // range between
                if (this._rangeFrom && rangeTo && kijs.Date.getDatePart(day).getTime() > kijs.Date.getDatePart(this._rangeFrom).getTime()
                        && kijs.Date.getDatePart(day).getTime() < kijs.Date.getDatePart(rangeTo).getTime()) {
                    fldDom.clsAdd('kijs-range-between');
                } else {
                    fldDom.clsRemove('kijs-range-between');
                }

               // Wochen-Nummer schreiben
               if (x===1) {
                   this._gridColumns[i].rows[0].dom.html = this._showWeekNumbers ? parseInt(kijs.Date.format(day, 'W')) : '';
                   this._gridColumns[i].rows[0].dom.clsAdd('kijs-weekno');
               }

               // 1 Tag addieren
               day.setDate(day.getDate()+1);
           }


       }

    }

    _getElementByDom(dom) {
        for (let y=0; y < this._gridColumns.length; y++) {
            for (let x=0; x < this._gridColumns[y].rows.length; x++) {
                if (dom === this._gridColumns[y].rows[x].dom || dom === this._gridColumns[y].rows[x].dom.dom) {
                    return this._gridColumns[y].rows[x];
                }
            }
        }

        for (let i=0; i<this._monthSelector.length; i++) {
            if (this._monthSelector[i].dom === dom ||this._monthSelector[i].dom.dom === dom) {
                return this._monthSelector[i];
            }
        }

        for (let i=0; i<this._yearSelector.length; i++) {
            if (this._yearSelector[i].dom === dom || this._yearSelector[i].dom.dom === dom) {
                return this._yearSelector[i];
            }
        }

        return null;
    }

    _setYearPicker(year) {
        year -= 2;
        for (let i=1; i<this._yearSelector.length-1; i++) {
            this._yearSelector[i].year = year;
            year++;
        }
    }

    // EVENTS
    _onNextBtnClick() {
        this._visibleMonthDate.setMonth(this._visibleMonthDate.getMonth()+1);
        this._setYearPicker(this._visibleMonthDate.getFullYear());
        this._calculateCalendar();
        this._calculateMonthYearPicker();
    }

    _onPreviousBtnClick() {
        this._visibleMonthDate.setMonth(this._visibleMonthDate.getMonth()-1);
        this._setYearPicker(this._visibleMonthDate.getFullYear());
        this._calculateCalendar();
        this._calculateMonthYearPicker();
    }
    _onDateMouseClick(e) {
        let dt = this._getElementByDom(e.dom);
        if (dt && dt.date instanceof Date) {
            this.value = dt.date;
        }
        if (this.inputField) {
            this.inputField.focus();
        }

        this.raiseEvent('dateChanged', this.value);
    }

    _onDateMouseEnter(e) {
        let dt = this._getElementByDom(e.dom);

        // range zeichen
        if (!dt.isHeader && !dt.isWeekNr && dt.date instanceof Date) {
            this._calculateCalendar(dt.date);
        }
    }

    _onCalendarMouseLeave() {
        // Kalender mit standardwerten zeichnen
        this._calculateCalendar();
    }

    _onInputKeyUp(e) {
        if (this._dom.node && kijs.Array.contains(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'], e.nodeEvent.key)) {
            e.nodeEvent.preventDefault();
            if (this.value instanceof Date) {
                switch (e.nodeEvent.key) {
                    case 'ArrowUp': this.value = kijs.Date.addDays(this.value, -7); break;
                    case 'ArrowDown': this.value = kijs.Date.addDays(this.value, 7); break;
                    case 'ArrowLeft': this.value = kijs.Date.addDays(this.value, -1); break;
                    case 'ArrowRight': this.value = kijs.Date.addDays(this.value, 1); break;
                }
                this.raiseEvent('dateChanged', this.value);
            }
        } else if (this._dom.node && e.nodeEvent.key === 'Enter') {
            this.raiseEvent('dateSelected', this.value);
        }
    }

    _onCalendarWheel(e) {
        if (e.nodeEvent.deltaY < 0) {
            this._onPreviousBtnClick();
        } else {
            this._onNextBtnClick()
        }
    }

    _onHeaderBarClick() {
        this._showCalendar = !this._showCalendar;
        this.render();
    }

    _onTodayButtonClick(e) {
        this._value = kijs.Date.getDatePart(new Date());
        this._visibleMonthDate = kijs.Date.getFirstOfMonth(this._value);
        this._setYearPicker(this._visibleMonthDate.getFullYear());
        this._calculateCalendar();
        this._calculateMonthYearPicker();

        if (this.inputField) {
            this.inputField.focus();
        }
        this.raiseEvent('dateChanged', this.value);
        this.raiseEvent('dateSelected', this.value);
    }

    _onMonthSelectorClick(e) {
        let m = this._getElementByDom(e.dom);
        if (m.month || m.month === 0) {
            this._visibleMonthDate.setMonth(m.month);
            this._calculateCalendar();
            this._calculateMonthYearPicker();
        }

        if (this.inputField) {
            this.inputField.focus();
        }
    }

    _onYearSelectorClick(e) {
        let y = this._getElementByDom(e.dom);
        if (y.year) {
            this._visibleMonthDate.setFullYear(y.year);
            this._calculateCalendar();
            this._calculateMonthYearPicker();
        }

        if (this.inputField) {
            this.inputField.focus();
        }
    }

    _onYearSelectorUpClick() {
        for (let i=1; i<this._yearSelector.length-1; i++) {
            this._yearSelector[i].year--;
        }
        this._calculateCalendar();
        this._calculateMonthYearPicker();

        if (this.inputField) {
            this.inputField.focus();
        }
    }

    _onYearSelectorDownClick() {
        for (let i=1; i<this._yearSelector.length-1; i++) {
            this._yearSelector[i].year++;
        }
        this._calculateCalendar();
        this._calculateMonthYearPicker();

        if (this.inputField) {
            this.inputField.focus();
        }
    }

    _onYearSelectorWheel(e) {
        if (e.nodeEvent.deltaY < 0) {
            this._onYearSelectorUpClick();
        } else {
            this._onYearSelectorDownClick();
        }
    }


    // overwrite
    unrender(superCall) {
        // Event auslösen.
        if (!superCall) {
            this.raiseEvent('unrender');
        }

        this._headerBar.unrender();
        this._calendarDom.unrender();
        this._todayBtn.unrender();
        super.unrender(true);
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
        if (this._headerBar) {
            this._headerBar.destruct();
        }
        if (this._calendarDom) {
            this._calendarDom.destruct();
        }
        if (this._todayBtn) {
            this._todayBtn.destruct();
        }


        // Variablen (Objekte/Arrays) leeren
        this._nextBtn = null;
        this._previousBtn = null;
        this._headerBar = null;

        this._calendarDom = null;
        this._todayBtn = null;

        // Basisklasse entladen
        super.destruct(true);
    }

};