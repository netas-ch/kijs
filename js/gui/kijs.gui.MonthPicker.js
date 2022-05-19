/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.MonthPicker
// --------------------------------------------------------------
kijs.gui.MonthPicker = class kijs_gui_MonthPicker extends kijs.gui.Element {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        this._minDate = null; // Min Value (Date Object mit Datum vom 1. Tag des Monats)
        this._maxDate = null; // Max Value (Date Object mit Datum vom letzten Tag des Monats)
        this._valueFormat = 'Y-m-d';    // Format, mit dem der value ausgeliefert wird
        this._headerBarFormat = 'F Y';  // Anzeige Format für die HeaderBar
        this._lastDayOfMonthAsValue = false;   // Soll beim Abfragen des Value oder Date der letzte Tag des Monats zurückgegeben werden?

        this._date = null;
        this._startYear = (new Date()).getFullYear() - 1;

        this._headerBarHide = false;
        this._currentBtnHide = false;
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
            elementsRight: [this._nextBtn]
        });

        this._yearMonthDivDom = new kijs.gui.Dom({ cls: 'kijs-monthpicker-yearmonthdiv' });

        this._yearDivDom = new kijs.gui.Dom({
            cls: 'kijs-monthpicker-yeardiv',
            on: {
                wheel: this._onYearDivDomWheel,
                context: this
            }
        });

        this._yearDivInnerDom = new kijs.gui.Dom({ cls: 'kijs-monthpicker-yearinnerdiv' });

        this._monthDivDom = new kijs.gui.Dom({ cls: 'kijs-monthpicker-monthdiv' });

        this._footerDivDom = new kijs.gui.Dom({ cls: 'kijs-monthpicker-footerdiv' });


        // Arrays mit 5 kijs.gui.Dom der Jahre, die angezeigt werden
        this._yearsDom = [];

        // Arrays mit 12 kijs.gui.Dom der Monate, die angezeigt werden
        this._monthsDom = [];

        // Jahre Scroll-Button up
        this._yearsScrollUpBtn = new kijs.gui.Button({
            html: '▴',
            on: {
                click: this._onYearsScrollUpBtnClick,
                context: this
            }
        });
        this._yearsScrollUpBtn.dom.nodeAttributeSet('tabIndex', -1);

        // Jahre Scroll-Button down
        this._yearsScrollDownBtn = new kijs.gui.Button({
            html: '▾',
            on: {
                click: this._onYearsScrollDownBtnClick,
                context: this
            }
        });
        this._yearsScrollDownBtn.dom.nodeAttributeSet('tabIndex', -1);

        // Monate
        this._createMonthsDom();

        // Jahre
        this._createYearsDom();

        // Button Aktueller Monat
        this._currentBtn = new kijs.gui.Button({
            html: kijs.getText('Akt. Monat'),
            on: {
                click: this._onCurrentBtnClick,
                context: this
            }
        });
        this._currentBtn.dom.nodeAttributeSet('tabIndex', -1);

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

        this._dom.clsAdd('kijs-monthpicker');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            lastDayOfMonthAsValue: true,       // Soll beim Abfragen des Value oder Date der letzte Tag des Monats zurückgegeben werden?
            valueFormat: true,                  // Format, mit dem der value ausgeliefert wird
            headerBarFormat: true,              // Anzeige Format für die HeaderBar
            minValue: { target: 'minValue' },   // Kleinster zu wählender Monat     (Date Object oder SQL-String mit einem beliebigen Datum des Monats)
            maxValue: { target: 'maxValue' },   // Grösster zu wählender Monat      (Date Object oder SQL-String mit einem beliebigen Datum des Monats)
            headerBarHide: true,                // HeaderBar ausblenden
            currentBtnHide: true,               // Aktueller Monat Button ausblenden
            emptyBtnHide: true,                 // Leer lassen Button ausblenden
            closeBtnHide: true,                 // Schliessen Button ausblenden
            value: { target: 'value' }          // (Date Object oder SQL-String mit einem beliebigen Datum des Monats)
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

    get currentBtnHide() { return this._currentBtnHide; }
    set currentBtnHide(val) { this._currentBtnHide = !!val; }

    get emptyBtnHide() { return this._emptyBtnHide; }
    set emptyBtnHide(val) { this._emptyBtnHide = !!val; }

    get headerBarHide() { return this._headerBarHide; }
    set headerBarHide(val) { this._headerBarHide = !!val; }

    get date() {
        if (kijs.isEmpty(this._date)) {
            return null;
        } else {
            if (this._lastDayOfMonthAsValue) {
                return kijs.Date.getLastOfMonth(this._date);
            } else {
                return kijs.Date.getFirstOfMonth(this._date);
            }
        }
    }
    set date(val) {
        if (kijs.isEmpty(val)) {
            this._date = null;
            this._startYear = (new Date()).getFullYear() - 1;
        } else {
            this._date = kijs.Date.getFirstOfMonth(kijs.Date.create(val));
            this._startYear = (this._date).getFullYear() - 1;
        }
        this._calculate(true);
    }

    get headerBar() { return this._headerBar; }

    get headerBarFormat() { return this._headerBarFormat; }
    set headerBarFormat(val) { this._headerBarFormat = val; }

    get lastDayOfMonthAsValue() { return this._lastDayOfMonthAsValue; }
    set lastDayOfMonthAsValue(val) { this._lastDayOfMonthAsValue = !!val; }

    get maxDate() {
        return this._maxDate;
    }
    set maxDate(val) {
        this._maxDate = kijs.isEmpty(val) ? null : kijs.Date.getLastOfMonth(kijs.Date.create(val));
    }

    get minDate() {
        return this._minDate;
    }
    set minDate(val) {
        this._minDate = kijs.isEmpty(val) ? null : kijs.Date.getFirstOfMonth(kijs.Date.create(val));
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

    get value() {
        let date = this.date;
        if (kijs.isEmpty(date)) {
            return '';
        } else {
            return kijs.Date.format(date, this._valueFormat);
        }
    }
    set value(val) {
        this.date = val;
    }

    get valueFormat() { return this._valueFormat; }
    set valueFormat(val) { this._valueFormat = val; }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // overwrite
    focus(alsoSetIfNoTabIndex=false) {
        // Wenn möglich den Fokus auf einen Button setzen
        if (!this._closeBtnHide) {
            this._closeBtn.focus(true);

        } else if (!this._currentBtnHide) {
            this._currentBtn.focus(true);

        } else if (!this._emptyBtnHide) {
            this._emptyBtn.focus(true);

        } else {
            super.focus(alsoSetIfNoTabIndex);
        }
    }

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
        this._yearMonthDivDom.renderTo(this._dom.node);
        this._monthDivDom.renderTo(this._yearMonthDivDom.node);
        this._yearDivDom.renderTo(this._yearMonthDivDom.node);
        this._footerDivDom.renderTo(this._dom.node);

        // Scroll Buttons und inneres DIV rendern
        this._yearsScrollUpBtn.renderTo(this._yearDivDom.node);
        this._yearDivInnerDom.renderTo(this._yearDivDom.node);
        this._yearsScrollDownBtn.renderTo(this._yearDivDom.node);

        // Rendert die 12 Monate kijs.gui.Dom
        for (let i=0; i<12; i++) {
            this._monthsDom[i].renderTo(this._monthDivDom.node);
        }

        // Rendert die 5 Jahres kijs.gui.Dom
        for (let i=0; i<5; i++) {
            this._yearsDom[i].renderTo(this._yearDivInnerDom.node);
        }

        this._calculate(true);

        // currentBtn, emptyBtn, closeBtn
        if (!this._currentBtnHide) {
            this._currentBtn.renderTo(this._footerDivDom.node);
        } else if (this._currentBtn.isRendered) {
            this._currentBtn.unrender();
        }
        if (!this._emptyBtnHide) {
            this._emptyBtn.renderTo(this._footerDivDom.node);
        } else if (this._emptyBtn.isRendered) {
            this._emptyBtn.unrender();
        }
        if (!this._closeBtnHide) {
            this._closeBtn.renderTo(this._footerDivDom.node);
        } else if (this._closeBtn.isRendered) {
            this._closeBtn.unrender();
        }

        // Event afterRender auslösen
        if (!superCall) {
            this.raiseEvent('afterRender');
        }
    }


    // PROTECTED
    _calculate(scrollIntoView) {
        if (!this.isRendered) {
            return;
        }

        if (scrollIntoView) {
            if (kijs.isEmpty(this._date)) {
                this._startYear = (new Date()).getFullYear() - 1;
            } else {
                this._startYear = this._date.getFullYear() - 1;
            }
        }

        const curMonthIndex = kijs.isEmpty(this._date) ? null : this._date.getMonth();
        const curYear = kijs.isEmpty(this._date) ? (new Date()).getFullYear() : this._date.getFullYear();
        const curYearIndex = curYear - this._startYear;

        // Monate aktualisieren
        for (let i=0; i<12; i++) {
            let date = new Date(curYear, i, 1);

            // selected
            if (!kijs.isEmpty(this._date) && i === curMonthIndex) {
                this._monthsDom[i].clsAdd('kijs-selected');
            } else {
                this._monthsDom[i].clsRemove('kijs-selected');
            }

            // disabled
            if ( (this._minDate && this._minDate > date) || (this._maxDate && this._maxDate < date) ) {
                this._monthsDom[i].clsAdd('kijs-disabled');
            } else {
                this._monthsDom[i].clsRemove('kijs-disabled');
            }
        }

        // Jahre aktualisieren
        for (let i=0; i<5; i++) {
            let year = this._startYear + i;

            // html
            this._yearsDom[i].html = year;

            // selected
            if (i === curYearIndex) {
                this._yearsDom[i].clsAdd('kijs-selected');
            } else {
                this._yearsDom[i].clsRemove('kijs-selected');
            }

            // disabled
            if ( (this._minDate && this._minDate.getFullYear() > year) || (this._maxDate && this._maxDate.getFullYear() < year) ) {
                this._yearsDom[i].clsAdd('kijs-disabled');
            } else {
                this._yearsDom[i].clsRemove('kijs-disabled');
            }
        }

        if (!this._headerBarHide) {
            if (kijs.isEmpty(this._date)) {
                this._headerBar.html = '';
            } else {
                this._headerBar.html = kijs.Date.format(this._date, this._headerBarFormat);
            }
        }
    }

    // Erstellt die 12 Monate kijs.gui.Dom
    _createMonthsDom() {
        for (let i=0; i<12; i++) {
            this._monthsDom.push(new kijs.gui.Dom({
                html: kijs.Date.months_short[i],
                on: {
                    click: this._onMonthDomClick,
                    dblClick: this._onMonthDomDblClick,
                    context: this
                }
            }));
        }
    }

    // Erstellt die 5 Jahres kijs.gui.Dom beginnend bei startYear
    _createYearsDom() {
        for (let i=0; i<5; i++) {
            this._yearsDom.push(new kijs.gui.Dom({
                html: this._startYear + i,
                on: {
                    click: this._onYearDomClick,
                    dblClick: this._onYearDomDblClick,
                    context: this
                }
            }));
        }
    }


    // EVENTS
    _onCurrentBtnClick(e) {
        const curDate = kijs.isEmpty(this._date) ? null : kijs.Date.clone(this._date);
        let date = kijs.Date.getFirstOfMonth(new Date());

        this._date = this.getNextValidDate(date);
        this._calculate(true);

        if (!kijs.Date.compare(this._date, curDate)) {
            this.raiseEvent('change', {value: this.value});
        }
        this.raiseEvent('currentClick');
    }

    _onEmptyBtnClick(e) {
        const curDate = kijs.isEmpty(this._date) ? null : kijs.Date.clone(this._date);

        this._date = null;
        this._calculate(true);

        if (!kijs.Date.compare(this._date, curDate)) {
            this.raiseEvent('change', {value: this.value});
        }
        this.raiseEvent('emptyClick');
    }

    _onMonthDomClick(e) {
        if (!e.dom.clsHas('kijs-disabled')) {
            const curDate = kijs.isEmpty(this._date) ? null : kijs.Date.clone(this._date);
            const monthIndex = this._monthsDom.indexOf(e.dom);
            let date = null;

            if (kijs.isEmpty(this._date)) {
                date = new Date((new Date()).getFullYear(), monthIndex, 1);
            } else {
                date = kijs.Date.clone(this._date);
                date.setMonth(monthIndex);   // 0=Jan, 1=Feb, ...
            }

            this._date = this.getNextValidDate(date);
            this._calculate(true);

            if (!kijs.Date.compare(this._date, curDate)) {
                this.raiseEvent('change', {value: this.value});
            }
            this.raiseEvent('monthClick');
        }
    }
    _onMonthDomDblClick(e) {
        this.raiseEvent('monthDblClick');
    }

    _onNextBtnClick(e) {
        const curDate = kijs.isEmpty(this._date) ? null : kijs.Date.clone(this._date);
        let date = null;

        if (kijs.isEmpty(this._date)) {
            date = kijs.Date.getFirstOfMonth(new Date());
        } else {
            date = kijs.Date.addMonths(this._date, 1);
        }

        this._date = this.getNextValidDate(date);
        this._calculate(true);

        if (!kijs.Date.compare(this._date, curDate)) {
            this.raiseEvent('change', {value: this.value});
        }
    }

    _onPreviousBtnClick(e) {
        const curDate = kijs.isEmpty(this._date) ? null : kijs.Date.clone(this._date);
        let date = null;

        if (kijs.isEmpty(this._date)) {
            date = kijs.Date.getFirstOfMonth(new Date());
        } else {
            date = kijs.Date.addMonths(this._date, -1);
        }

        this._date = this.getNextValidDate(date);
        this._calculate(true);

        if (!kijs.Date.compare(this._date, curDate)) {
            this.raiseEvent('change', {value: this.value});
        }
    }

    _onYearDivDomWheel(e) {
        if (e.nodeEvent.deltaY < 0) {
            this._onYearsScrollUpBtnClick();
        } else {
            this._onYearsScrollDownBtnClick();
        }
        e.nodeEvent.preventDefault();
    }

    _onYearDomClick(e) {
        if (!e.dom.clsHas('kijs-disabled')) {
            const curDate = kijs.isEmpty(this._date) ? null : kijs.Date.clone(this._date);
            const year = parseInt(e.dom.html);
            let date = null;

            if (kijs.isEmpty(this._date)) {
                date = new Date(year, (new Date()).getMonth(), 1);
            } else {
                date = kijs.Date.clone(this._date);
                date.setYear(year);
            }

            this._date = this.getNextValidDate(date);
            this._calculate(true);

            if (!kijs.Date.compare(this._date, curDate)) {
                this.raiseEvent('change', {value: this.value});
            }
            this.raiseEvent('yearClick');
        }
    }
    _onYearDomDblClick(e) {
        this.raiseEvent('yearDblClick');
    }

    _onYearsScrollDownBtnClick(e) {
        this._startYear++;
        this._calculate(false);
    }

    _onYearsScrollUpBtnClick(e) {
        this._startYear--;
        this._calculate(false);
    }

    // overwrite
    unrender(superCall) {
        // Event auslösen.
        if (!superCall) {
            this.raiseEvent('unrender');
        }

        this._headerBar.unrender();
        this._yearMonthDivDom.unrender();
        this._footerDivDom.unrender();

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
        if (this._yearsDom && this._yearsDom.length) {
            kijs.Array.each(this._yearsDom, function(dom) {
                dom.destruct();
            }, this);
        }

        if (this._monthsDom && this._monthsDom.length) {
            kijs.Array.each(this._monthsDom, function(dom) {
                dom.destruct();
            }, this);
        }

        if (this._currentBtn) {
            this._currentBtn.destruct();
        }

        if (this._emptyBtn) {
            this._emptyBtn.destruct();
        }

        if (this._closeBtn) {
            this._closeBtn.destruct();
        }

        if (this._yearsScrollUpBtn) {
            this._yearsScrollUpBtn.destruct();
        }

        if (this._yearsScrollDownBtn) {
            this._yearsScrollDownBtn.destruct();
        }

        if (this._headerBar) {
            this._headerBar.destruct();
        }

        if (this._yearDivInnerDom) {
            this._yearDivInnerDom.destruct();
        }
        if (this._yearDivDom) {
            this._yearDivDom.destruct();
        }

        if (this._monthDivDom) {
            this._monthDivDom.destruct();
        }
        if (this._yearMonthDivDom) {
            this._yearMonthDivDom.destruct();
        }

        if (this._footerDivDom) {
            this._footerDivDom.destruct();
        }

        // Variablen (Objekte/Arrays) leeren
        this._minDate = null;
        this._maxDate = null;
        this._date = null;

        this._previousBtn = null;
        this._nextBtn = null;
        this._headerBar = null;
        this._currentBtn = null;
        this._emptyBtn = null;
        this._closeBtn = null;
        this._yearsScrollUpBtn = null;
        this._yearsScrollDownBtn = null;

        this._yearsDom = null;
        this._monthsDom = null;
        this._yearDivInnerDom = null;
        this._yearDivDom = null;
        this._monthDivDom = null;
        this._yearMonthDivDom = null;
        this._footerDivDom = null;

        // Basisklasse entladen
        super.destruct(true);
    }

};
