/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.TimePicker
// --------------------------------------------------------------
kijs.gui.TimePicker = class kijs_gui_TimePicker extends kijs.gui.Element {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        this._secondsHide = true;
        this._minutesHide = false;
        this._separator = ':';
        this._empty = true,
        this._hour = 0;
        this._minute = 0;
        this._second = 0;

        this._canvas = null;            // canvas context objekt
        this._canvasSize  = null;       // Grösse des Canvas
        this._clockRadius = null;       // Radius der Uhr
        this._clockMode = 1;            // 1=Stunde 2=Minute 3=Sekunde
        this._distance = {
            hourAm: 32,                 // Distanz vom Kreisrand für Stunden 1-12
            hourPm: 12,                 // Distanz vom Kreisrand für Stunden 13-24
            minute: 20,                 // Distanz vom Kreisrand für Minuten
            second: 20                  // Distanz vom Kreisrand für Sekunden
        };

        this._headerBarHide = false;
        this._inputHide = false;
        this._nowBtnHide = false;
        this._emptyBtnHide = false;
        this._closeBtnHide = true;

        this._headerBar = new kijs.gui.PanelBar({
            cls: 'kijs-headerbar-center'
        });

        // inputDiv
        this._inputDivDom = new kijs.gui.Dom({
            cls: 'kijs-timepicker-inputdiv'
        });
        this._inputHourDom = new kijs.gui.Dom({
            cls: 'kijs-timepicker-hour',
            nodeTagName: 'input',
            nodeAttribute: {
                maxLength: 2
            },
            on: {
                change: this._onInputChange,
                click: this._onInputClick,
                focus: this._onInputFocus,
                keyUp: this._onInputKeyUp,
                context: this
            }
        });
        this._inputSeparator1 = new kijs.gui.Dom({
            nodeTagName: 'span',
            html: this._separator
        });
        this._inputMinuteDom = new kijs.gui.Dom({
            cls: 'kijs-timepicker-minute',
            nodeTagName: 'input',
            nodeAttribute: {
                maxLength: 2
            },
            on: {
                change: this._onInputChange,
                click: this._onInputClick,
                focus: this._onInputFocus,
                keyUp: this._onInputKeyUp,
                context: this
            }
        });
        this._inputSeparator2 = new kijs.gui.Dom({
            nodeTagName: 'span',
            html: this._separator
        });
        this._inputSecondDom = new kijs.gui.Dom({
            cls: 'kijs-timepicker-second',
            nodeTagName: 'input',
            nodeAttribute: {
                maxLength: 2
            },
            on: {
                change: this._onInputChange,
                click: this._onInputClick,
                focus: this._onInputFocus,
                keyUp: this._onInputKeyUp,
                context: this
            }
        });

        // canvasDiv
        this._canvasDivDom = new kijs.gui.Dom({
            cls: 'kijs-timepicker-canvasdiv'
        });
        this._canvasDom = new kijs.gui.Dom({
            nodeTagName: 'canvas',
            on: {
                mouseMove: this._onCanvasMouseMove,
                mouseLeave: this._onCanvasMouseLeave,
                click: this._onCanvasMouseClick,
                context: this
            }
        });

        // footerDiv
        this._footerDivDom = new kijs.gui.Dom({ cls: 'kijs-timepicker-footerdiv' });

        // Button Jetzt
        this._nowBtn = new kijs.gui.Button({
            html: kijs.getText('Jetzt'),
            on: {
                click: this._onNowBtnClick,
                context: this
            }
        });
        this._nowBtn.dom.nodeAttributeSet('tabIndex', -1);

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

        this._dom.clsAdd('kijs-timepicker');


        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            headerText: kijs.getText('Uhrzeit')
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            headerBarHide: true,                // HeaderBar ausblenden
            inputHide: true,                    // Input-Felder ausblenden
            nowBtnHide: true,                   // Jetzt Button ausblenden
            emptyBtnHide: true,                 // Leer lassen Button ausblenden
            closeBtnHide: true,                 // Schliessen Button ausblenden
            headerText: { target: 'html', context: this._headerBar },
            value: { target: 'value' },
            secondsHide: true,                  // Sekunden auch erfassen?
            minutesHide: true,                  // Minuten auch erfassen?
            separator: true
        });

        // Events weiterleiten
        this._eventForwardsAdd('closeClick', this._closeBtn, 'click');

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }

        // Damit nach dem Rendern die Input-Felder auch den Wert enthalten
        this.on('afterRender', this._updateInputFields, this);
    }


    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get closeBtnHide() { return this._closeBtnHide; }
    set closeBtnHide(val) { this._closeBtnHide = !!val; }

    get emptyBtnHide() { return this._emptyBtnHide; }
    set emptyBtnHide(val) { this._emptyBtnHide = !!val; }

    get headerBar() { return this._headerBar; }

    get headerBarHide() { return this._headerBarHide; }
    set headerBarHide(val) { this._headerBarHide = !!val; }

    get inputHide() { return this._inputHide; }
    set inputHide(val) { this._inputHide = !!val; }

    get minutesHide() { return this._minutesHide; }
    set minutesHide(val) { this._minutesHide = !!val; }

    get nowBtnHide() { return this._nowBtnHide; }
    set nowBtnHide(val) { this._nowBtnHide = !!val; }

    get secondsHide() { return this._secondsHide; }
    set secondsHide(val) { this._secondsHide = !!val; }

    get value() {
        let val = '';
        if (!this._empty) {
            val += this._zeroPad(this._hour);
            if (!this._minutesHide) {
                val += this._separator + this._zeroPad(this._minute);
            }
            if (!this._secondsHide) {
                val += this._separator + this._zeroPad(this._second);
            }
        }
        return val;
    }

    set value(val) {
        this._empty = kijs.isEmpty(val);
        val = kijs.toString(val);
        val = val.split(this._separator);

        this._hour = val[0] ? parseInt(val[0]) : 0;
        this._minute = val[1] && !this._minutesHide ? parseInt(val[1]) : 0;
        this._second = val[2] && !this._secondsHide ? parseInt(val[2]) : 0;
        this._clockMode = 1;

        if (this._hour === 24) {
            this._hour = 0;
        }
        if (this._minute === 60) {
            this._minute = 0;
        }
        if (this._second === 60) {
            this._second = 0;
        }

        if (this._hour > 23 || this._hour < 0) {
            throw new kijs.Error('invalid time: hour');
        }
        if (this._minute > 60 || this._minute < 0) {
            throw new kijs.Error('invalid time: minute');
        }
        if (this._second > 60 || this._second < 0) {
            throw new kijs.Error('invalid time: second');
        }

        // zeichnen falls gerendert
        if (this._dom.node) {
            this._calculate();
        }

        // Input Felder aktualisieren
        this._updateInputFields();

        return;
    }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // Overwrite
    render(superCall) {
        super.render(true);

        // HeaderBar rendern
        if (!this._headerBarHide) {
            this._headerBar.renderTo(this._dom.node);
        } else if (this._headerBar.isRendered) {
            this._headerBar.unrender();
        }

        // inputDiv
        if (!this._inputHide) {
            this._inputDivDom.renderTo(this._dom.node);
            this._inputHourDom.renderTo(this._inputDivDom.node);
            if (this._minutesHide) {
                this._inputSeparator1.unrender();
                this._inputMinuteDom.unrender();
            } else {
                this._inputSeparator1.renderTo(this._inputDivDom.node);
                this._inputMinuteDom.renderTo(this._inputDivDom.node);
            }
            if (this._secondsHide) {
                this._inputSeparator2.unrender();
                this._inputSecondDom.unrender();
            } else {
                this._inputSeparator2.renderTo(this._inputDivDom.node);
                this._inputSecondDom.renderTo(this._inputDivDom.node);
            }
        } else {
            this._inputDivDom.unrender();
        }

        // Canvas für timepicker
        this._canvasDivDom.renderTo(this._dom.node);
        this._canvasDom.renderTo(this._canvasDivDom.node);

        // Context
        this._canvas =  this._canvasDom.node.getContext('2d');

        // Footer
        this._footerDivDom.renderTo(this._dom.node);

        // nowBtn, emptyBtn, closeBtn
        if (!this._nowBtnHide) {
            this._nowBtn.renderTo(this._footerDivDom.node);
        } else if (this._nowBtn.isRendered) {
            this._nowBtn.unrender();
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

        // canvas zeichnen
        kijs.defer(function() {
            this._calculate();
        }, 10, this);
    }

    // overwrite
    unrender(superCall) {
        // Event auslösen.
        if (!superCall) {
            this.raiseEvent('unrender');
        }
        
        if (this._headerBar) {
            this._headerBar.unrender();
        }
        if (this._inputHourDom) {
            this._inputHourDom.unrender();
        }
        if (this._inputMinuteDom) {
            this._inputMinuteDom.unrender();
        }
        if (this._inputSecondDom) {
            this._inputSecondDom.unrender();
        }
        if (this._inputDivDom) {
            this._inputDivDom.unrender();
        }
        if (this._canvasDom) {
            this._canvasDom.unrender();
        }
        if (this._canvasDivDom) {
            this._canvasDivDom.unrender();
        }
        if (this._footerDivDom) {
            this._footerDivDom.unrender();
        }
        
        super.unrender(true);
    }


    // PROTECTED
    _addTextToArc(text, fontSize, degree, distance) {
        let coords = this._degreeToCoordinates(degree, distance);
        this._canvas.font = fontSize+'px Arial,sans-serif';
        this._canvas.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--clock-fontColor');

        let measure = this._canvas.measureText(text);
        this._canvas.fillText(text, coords.x - (measure.width /2), coords.y + (fontSize / 2));
    }

    _calculate(pointerPos=null) {
        // Grösse einstellen.
        this._canvasSize = Math.min(this._canvasDivDom.width, this._canvasDivDom.height);
        if (this._canvasSize === 0 || !this._canvasDom.node) {
            return;
        }

        this._canvasDom.node.width = this._canvasSize;
        this._canvasDom.node.height = this._canvasSize;
        this._clockRadius = this._canvasSize / 2 - 1;

        // Löschen
        this._canvas.clearRect(0, 0, this._canvasSize, this._canvasSize);

        // Hintergrund
        this._drawBackground();

        // zeiger-pos von Uhrzeit
        if (pointerPos === null && this._clockMode === 1) {
            pointerPos = this._degreeByHour(this._hour);
        }
        if (pointerPos === null && this._clockMode === 2) {
            pointerPos = this._degreeByMinute(this._minute);
        }
        if (pointerPos === null && this._clockMode === 3) {
            pointerPos = this._degreeBySecond(this._second);
        }

        // Zeiger
        this._drawPointer(pointerPos.degree, pointerPos.distance);

        // Stunden
        if (this._clockMode === 1) {
            this._drawHours();
        }
        if (this._clockMode === 2) {
            this._drawMinutes();
        }
        if (this._clockMode === 3) {
            this._drawSeconds();
        }
    }

    _coordinatesToDegree(ox, oy) {
        let x = ox - (this._canvasSize / 2);
        let y = (this._canvasSize / 2) - oy;

        let c = Math.sqrt(Math.pow(y,2) + Math.pow(x,2));
        let distance = this._clockRadius - c;
        let alphaRad =  Math.asin(y/c);
        let degree = 90 - (alphaRad / (Math.PI/180));

        if (ox < (this._canvasSize /2)) {
            degree = (180 - degree) + 180;
        }

        return {degree: degree, distance: distance};
    }

    _degreeByHour(hour) {
        let ret = {degree: 0, distance: 0};
        ret.distance = hour < 13 && hour > 0 ? this._distance.hourAm : this._distance.hourPm;
        if (hour > 11) {
            hour -= 12;
        }
        ret.degree = hour * 30;
        return ret;
    }

    _degreeByMinute(minute) {
        return {degree: minute / 60 * 360, distance: this._distance.minute};
    }

    _degreeBySecond(second) {
        return {degree: second / 60 * 360, distance: this._distance.second};
    }

    _degreeToCoordinates(degree, distance) {
        degree = degree+90;
        // h = c * sinus(degree)
        let a = (this._clockRadius - distance) * Math.sin(degree * ((Math.PI)/180));
        let b = Math.sqrt(Math.pow((this._clockRadius - distance),2) - Math.pow(a,2));

        let x=0,y=0;
        if (degree <= 270) {
            x = (this._canvasSize / 2)+b, y = (this._canvasSize / 2) - a;
        } else {
            x = (this._canvasSize / 2)-b, y = (this._canvasSize / 2) - a;
        }

        return {x: x, y: y};
    }

    _drawBackground() {
        // Kreis für Uhr zeichnen
        this._canvas.beginPath();
        this._canvas.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--clock-bkgrndColor');
        this._canvas.arc(
                (this._canvasSize / 2),
                (this._canvasSize / 2),
                this._clockRadius,
                0,
                Math.PI*2
            );
        this._canvas.fill();
    }

    _drawHours() {
        for (let i=1; i<=24; i++) {
            let dist = i<=12 ? this._distance.hourAm : this._distance.hourPm;
            let deg = i<=12 ? i * 30 : (i*30)-360;
            let size = i<=12 ? 15 : 10;
            let text = i!==24 ? i : '00';
            this._addTextToArc(text, size, deg, dist);
        }
    }

    _drawMinutes() {
        for (let i=0;i<12;i++) {
            let text = i!==0 ? i*5 : '00';
            this._addTextToArc(text, 15, (i*30), this._distance.minute);
        }
    }

    _drawPointer(degree, distance) {
        let coords = this._degreeToCoordinates(degree, distance);
        this._canvas.beginPath();
        this._canvas.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--clock-pointer-bkgrndColor');
        this._canvas.lineWidth = 2.0;
        this._canvas.moveTo(this._clockRadius, this._clockRadius);
        this._canvas.lineTo(coords.x, coords.y);
        this._canvas.stroke();
        this._canvas.beginPath();
        this._canvas.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--clock-pointer-bkgrndColor');
        this._canvas.arc(coords.x, coords.y, 12, 0, Math.PI*2); // Kreis
        this._canvas.fill();
    }

    _drawSeconds() {
        for (let i=0; i<12; i++) {
            let text = i!==0 ? i*5 : '00';
            this._addTextToArc(text, 15, (i*30), this._distance.second);
        }
    }

    _updateInputFields() {
        if (this._inputHourDom.isRendered) {
            this._inputHourDom.nodeAttributeSet('value', this._empty ? '' : this._zeroPad(this._hour));
        }
        if (this._inputMinuteDom.isRendered) {
            this._inputMinuteDom.nodeAttributeSet('value', this._empty ? '' : this._zeroPad(this._minute));
        }
        if (this._inputSecondDom.isRendered) {
            this._inputSecondDom.nodeAttributeSet('value', this._empty ? '' : this._zeroPad(this._second));
        }
    }



    // EVENTS
    /**
     * Beim bewegen der Maus wird die Kelle darunter angezeigt.
     * @param {Object} e
     * @returns {undefined}
     */
    _onCanvasMouseMove(e) {
        let x = e.nodeEvent.layerX, y = e.nodeEvent.layerY, pointerPos = {};
        let dg = this._coordinatesToDegree(x, y);

        // auf 30 grad runden
        pointerPos.degree = Math.round(dg.degree / 30) * 30;

        if (this._clockMode === 1) {
            pointerPos.distance = dg.distance > ((this._distance.hourAm+this._distance.hourPm)/2) ? this._distance.hourAm : this._distance.hourPm;

        } else if (this._clockMode === 2) {
            pointerPos.distance = this._distance.minute;

        } else if (this._clockMode ===  3) {
            pointerPos.distance = this._distance.second;

        } else {
            throw new kijs.Error('invalid clock mode');
        }

        this._calculate(pointerPos);
    }

    /**
     * Kelle zurücksetzen
     * @returns {undefined}
     */
    _onCanvasMouseLeave() {
        this._calculate();
    }

    /**
     * Beim Klick wird die Uhrzeit übernommen.
     * @param {Object} e
     * @returns {undefined}
     */
    _onCanvasMouseClick(e) {
        const curValue = this.value;
        let x = e.nodeEvent.layerX, y = e.nodeEvent.layerY;
        let dg = this._coordinatesToDegree(x, y);
        let inputFinished = false;

        // ausserhalb kreis
        if (dg.distance < 0) {
            return;
        }

        // auf 30 grad runden
        dg.degree = Math.round(dg.degree / 30) * 30;

        this._empty = false;

        // Stunde
        if (this._clockMode === 1) {
            let hour = 12 / 360 * dg.degree;
            if (dg.distance < ((this._distance.hourAm+this._distance.hourPm)/2)) {
                if (hour !== 0) {
                    hour += 12;
                }
            } else if (hour === 0) {
                hour += 12;
            }

            this._hour = hour;
            if (this._inputHourDom.isRendered) {
                if (this._minutesHide) {
                    inputFinished = true;
                    this._inputHourDom.focus();
                } else {
                    this._inputMinuteDom.focus();
                }

            } else {
                if (this._minutesHide) {
                    this._clockMode = 1;
                    inputFinished = true;
                } else {
                    this._clockMode = 2;
                }
            }

        // Minute
        } else if (this._clockMode === 2) {
            let min = 60 / 360 * dg.degree;
            this._minute = min === 60 ? 0 : min;
            if (this._inputMinuteDom.isRendered) {
                if (this._secondsHide) {
                    inputFinished = true;
                    this._inputMinuteDom.focus();
                } else {
                    this._inputSecondDom.focus();
                }

            } else {
                if (this._secondsHide) {
                    inputFinished = true;
                    this._clockMode = 2;
                } else {
                    this._clockMode = 3;
                }
            }


        // Sekunde
        } else if (this._clockMode === 3) {
            let sec = 60 / 360 * dg.degree;
            this._second = sec === 60 ? 0 : sec;
            if (this._inputSecondDom.isRendered) {
                this._inputSecondDom.focus();
            } else {
                this._clockMode = 3;
            }
            inputFinished = true;
        }

        if (inputFinished) {
            if (this._inputHourDom.isRendered) {
                this._inputHourDom.focus();
            } else {
                this._clockMode = 1;
            }
        }

        // Input Felder aktualisieren
        this._updateInputFields();

        // Events
        if (curValue !== this.value) {
            this.raiseEvent('change', {value: this.value});
        }
        if (inputFinished) {
            this.raiseEvent('inputFinished');
        }
    }

    _onEmptyBtnClick(e) {
        const curValue = this.value;

        this.value = '';

        // Event
        if (curValue !== this.value) {
            this.raiseEvent('change', {value: this.value});
        }
        this.raiseEvent('emptyClick');
    }

    /**
     * Nach dem Ändern Zeit übernehmen
     * @param {Object} e
     * @returns {undefined}
     */
    _onInputChange(e) {
        const curValue = this.value;
        const fld = e.context;
        let inputFinished = false;

        this._empty = kijs.isEmpty(fld.node.value);
        if (this._empty) {
            this._hour = 0;
            this._minute = 0;
            this._second = 0;
            this._clockMode = 1;
        } else {
            if (fld === this._inputHourDom) {
                this._hour = parseInt(fld.node.value);
                if (this._minutesHide) {
                    inputFinished = true;
                }
            }
            if (fld === this._inputMinuteDom) {
                this._minute = fld.node.value ? parseInt(fld.node.value) : 0;
                if (this._secondsHide) {
                    inputFinished = true;
                }
            }
            if (fld === this._inputSecondDom) {
                this._second = fld.node.value ? parseInt(fld.node.value) : 0;
                inputFinished = true;
            }
        }

        // zeichnen
        this._calculate();

        // Input Felder aktualisieren
        this._updateInputFields();

        // Events
        if (curValue !== this.value) {
            this.raiseEvent('change', {value: this.value});
        }
        if (inputFinished) {
            this.raiseEvent('inputFinished');
        }
    }

    /**
     * Beim Klick ins Zeitfeld wird alles selektiert, dass überschrieben werden kann.
     * @param {Object} e
     * @returns {undefined}
     */
    _onInputClick(e) {
        e.context.node.select();
    }

    /**
     * Beim Fokussieren wird die passende Auswahl gezeigt.
     * @param {Object} e
     * @returns {undefined}
     */
    _onInputFocus(e) {
        let fld = e.context;
        if (fld === this._inputHourDom) {
            this._clockMode = 1;
        }
        if (fld === this._inputMinuteDom) {
            this._clockMode = 2;
        }
        if (fld === this._inputSecondDom) {
            this._clockMode = 3;
        }

        // zeichnen
        this._calculate();
    }

    /**
     * Wenn die Uhrzeit mit Tastatur eingegeben wird
     * @param {Object} e
     * @returns {undefined}
     */
    _onInputKeyUp(e) {
        const fld = e.context;
        let type;
        if (fld === this._inputHourDom) {
            type = 'hour';
        }
        if (fld === this._inputMinuteDom) {
            type = 'minute';
        }
        if (fld === this._inputSecondDom) {
            type = 'second';
        }

        // Falsche Zeichen ersetzen
        fld.node.value = fld.node.value.replace(/[^0-9]/, '');

        // Stunden 00 - 23
        if (type === 'hour') {
            // Wenn eine Zahl > 2 eingegeben wurde, 0 padden
            if (fld.node.value.match(/^[3-9]$/)) {
                fld.node.value = '0' + fld.node.value;
            }

            // Wenn zu Grosse zahl eingegeben
            if (fld.node.value.match(/^[0-9]+$/) && parseInt(fld.node.value) > 23) {
                fld.node.value = '00';
            }

        // Minuten/Sekunden 00-59
        } else {
            // Wenn zu Grosse zahl eingegeben
            if (fld.node.value.match(/^[0-9]+$/) && parseInt(fld.node.value) > 59) {
                fld.node.value = '00';
            }
        }

        // wenn eine zahl eingegeben wurde, fokus evtl auf nächstes Feld.
        if (kijs.isString(e.nodeEvent.key) && e.nodeEvent.key.match(/^[0-9]$/)) {
            if (fld.node.value.length === 2) {
                switch (type) {
                    case 'hour':
                        this._inputMinuteDom.focus();
                        this._inputMinuteDom.node.select();
                        break;
                    case 'minute':
                        if (this._inputSecondDom.node) {
                            this._inputSecondDom.focus();
                            this._inputSecondDom.node.select();
                        }
                        break;
                    case 'second':
                        break;
                }
            }

        // ins vordere Feld springen beim Löschen
        } else if (e.nodeEvent.key === 'Backspace' && fld.node.value === '' && (type === 'minute' || type === 'second')) {
            switch (type) {
                case 'minute': this._inputHourDom.focus(); break;
                case 'second': this._inputMinuteDom.focus(); break;
            }
        }
    }

    /**
     * Die aktuelle Zeit übernehmen
     * @returns {undefined}
     */
    _onNowBtnClick(e) {
        const curValue = this.value;
        let time = new Date();
        this.value =  '' + time.getHours() + this._separator + time.getMinutes() + this._separator + time.getSeconds();

        // Event
        if (curValue !== this.value) {
            this.raiseEvent('change', {value: this.value});
        }
        this.raiseEvent('nowClick');
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
        if (this._inputHourDom) {
            this._inputHourDom.destruct();
        }
        if (this._inputSeparator1) {
            this._inputSeparator1.destruct();
        }
        if (this._inputMinuteDom) {
            this._inputMinuteDom.destruct();
        }
        if (this._inputSecondDom) {
            this._inputSecondDom.destruct();
        }
        if (this._inputSeparator2) {
            this._inputSeparator2.destruct();
        }
        if (this._inputDivDom) {
            this._inputDivDom.destruct();
        }
        if (this._canvasDom) {
            this._canvasDom.destruct();
        }
        if (this._canvasDivDom) {
            this._canvasDivDom.destruct();
        }
        if (this._footerDivDom) {
            this._footerDivDom.destruct();
        }
        if (this._nowBtn) {
            this._nowBtn.destruct();
        }

        if (this._emptyBtn) {
            this._emptyBtn.destruct();
        }

        if (this._closeBtn) {
            this._closeBtn.destruct();
        }

        // Variablen (Objekte/Arrays) leeren
        this._headerBar = null;
        this._inputHourDom = null;
        this._inputSeparator1 = null;
        this._inputMinuteDom = null;
        this._inputSeparator2 = null;
        this._inputSecondDom = null;
        this._inputDivDom = null;
        this._canvasDom = null;
        this._canvasDivDom = null;
        this._footerDivDom = null;
        this._nowBtn = null;
        this._emptyBtn = null;
        this._closeBtn = null;

        // Basisklasse entladen
        super.destruct(true);
    }

};
