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

        this._hasSeconds = false;
        this._separator;
        this._hour = 0;
        this._minute = 0;
        this._second = 0;

        this._canvas = null;            // canvas context objekt
        this._canvasSize  = null;       // Grösse des Canvas
        this._clockRadius = null;       // Radius der Uhr
        this._clockColor = '#f6f6f6';   // Farbe des Ziffernblattes
        this._clockMode = 1;            // 1=Stunde 2=Minute 3=Sekunde
        this._distance = {
            hourAm: 32,                 // Distanz vom Kreisrand für Stunden 1-12
            hourPm: 12,                 // Distanz vom Kreisrand für Stunden 13-24
            minute: 20,                 // Distanz vom Kreisrand für Minuten
            second: 20                  // Distanz vom Kreisrand für Sekunden
        };

        this._headerBar = new kijs.gui.PanelBar({
            cls: 'kijs-headerbar-center'
        });

        this._timeDom = new kijs.gui.Dom({
            cls: 'kijs-inputcontainer'
        });
        this._inputHourDom = new kijs.gui.Dom({
            cls: 'kijs-hour',
            nodeTagName: 'input',
            nodeAttribute: {
                maxLength: 2
            },
            on: {
                blur: this._onTimeBlur,
                change: this._onTimeChange,
                click: this._onTimeClick,
                focus: this._onTimeFocus,
                keyUp: this._onTimeKeyUp,
                context: this
            }
        });
        this._inputMinuteDom = new kijs.gui.Dom({
            cls: 'kijs-minute',
            nodeTagName: 'input',
            nodeAttribute: {
                maxLength: 2
            },
            on: {
                blur: this._onTimeBlur,
                change: this._onTimeChange,
                click: this._onTimeClick,
                focus: this._onTimeFocus,
                keyUp: this._onTimeKeyUp,
                context: this
            }
        });
        this._inputSecondDom = new kijs.gui.Dom({
            cls: 'kijs-second',
            nodeTagName: 'input',
            nodeAttribute: {
                maxLength: 2
            },
            on: {
                blur: this._onTimeBlur,
                change: this._onTimeChange,
                click: this._onTimeClick,
                focus: this._onTimeFocus,
                keyUp: this._onTimeKeyUp,
                context: this
            }
        });

        this._canvasContainerDom = new kijs.gui.Dom({
            cls: 'kijs-canvascontainer'
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

        // Button 'jetzt'
        this._nowBtn = new kijs.gui.Button({
            parent: this,
            on: {
                click: this._onNowButtonClick,
                context: this
            }
        });

        this._dom.clsAdd('kijs-timepicker');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            headerText: kijs.getText('Uhrzeit'),
            nowText: kijs.getText('Jetzt'),
            separator: ':',
            value: '00:00'
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            nowText: { target: 'caption', context: this._nowBtn },
            headerText: { target: 'html', context: this._headerBar },
            value: { target: 'value' },
            hasSeconds: true,
            separator: true,
            clockColor: true
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

    get hasSeconds() { return this._hasSeconds; }
    set hasSeconds(val) { this._hasSeconds = !!val; }

    get value() {
        let val = '';
        val += this._zeroPad(this._hour) + this._separator + this._zeroPad(this._minute);
        if (this._hasSeconds) {
            val += this._separator + this._zeroPad(this._second);
        }
        return val;
    }

    set value(val) {
        val = kijs.toString(val);
        val = val.split(this._separator);

        this._hour = val[0] ? parseInt(val[0]) : 0;
        this._minute = val[1] ? parseInt(val[1]) : 0;
        this._second = val[2] && this._hasSeconds ? parseInt(val[2]) : 0;
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
            this.paint();
        }

        if (this._inputHourDom.node) {
            this._inputHourDom.node.value = this._zeroPad(this._hour);
        }
        if (this._inputMinuteDom.node) {
            this._inputMinuteDom.node.value = this._zeroPad(this._minute);
        }
        if (this._inputSecondDom.node) {
            this._inputSecondDom.node.value = this._zeroPad(this._second);
        }
        return;
    }

    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------

    // Overwrite
    render(superCall) {
        super.render(true);

        // HeaderBar
        if (!this._headerBar.isEmpty) {
            this._headerBar.renderTo(this._dom.node);
        } else {
            this._headerBar.unrender();
        }

        // Time DOM
        this._timeDom.renderTo(this._dom.node);
        this._inputHourDom.renderTo(this._timeDom.node);
        new kijs.gui.Dom({nodeTagName: 'span', html: this._separator}).renderTo(this._timeDom.node);
        this._inputMinuteDom.renderTo(this._timeDom.node);
        if (this._hasSeconds) {
            new kijs.gui.Dom({nodeTagName: 'span', html: this._separator}).renderTo(this._timeDom.node);
            this._inputSecondDom.renderTo(this._timeDom.node);
        } else {
            this._inputSecondDom.unrender();
        }

        // Canvas für timepicker
        this._canvasContainerDom.renderTo(this._dom.node);
        this._canvasDom.renderTo(this._canvasContainerDom.node);

        // Context
        this._canvas =  this._canvasDom.node.getContext('2d');

        // Button für "Jetzt"
        if (this._nowBtn.caption) {
            this._nowBtn.renderTo(this._dom.node);
        } else {
            this._nowBtn.unrender();
        }

        // Werte Schreiben
        if (this._inputHourDom.node) {
            this._inputHourDom.node.value = this._zeroPad(this._hour);
        }
        if (this._inputMinuteDom.node) {
            this._inputMinuteDom.node.value = this._zeroPad(this._minute);
        }
        if (this._inputSecondDom.node) {
            this._inputSecondDom.node.value = this._zeroPad(this._second);
        }

        // Event afterRender auslösen
        if (!superCall) {
            this.raiseEvent('afterRender');
        }

        // canvas zeichnen
        kijs.defer(function() {
            this.paint();
        }, 10, this);
    }

    // overwrite
    unrender(superCall) {
        // Event auslösen.
        if (!superCall) {
            this.raiseEvent('unrender');
        }

        this._headerBar.unrender();
        this._inputHourDom.unrender();
        this._inputMinuteDom.unrender();
        this._inputSecondDom.unrender();
        this._timeDom.unrender();
        this._canvasDom.unrender();
        this._canvasContainerDom.unrender();
        this._nowBtn.unrender();
        super.unrender(true);
    }

    paint(pointerPos=null) {
        // Grösse einstellen.
        this._canvasSize = Math.min(this._canvasContainerDom.width, this._canvasContainerDom.height);
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

    _drawBackground() {
        // Kreis für Uhr zeichnen
        this._canvas.beginPath();
        this._canvas.fillStyle = this._clockColor;
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
        for (let i=1;i<=24;i++) {
            let dist = i <= 12 ? this._distance.hourAm : this._distance.hourPm;
            let deg = i <= 12 ? i * 30 : (i*30)-360;
            let size = i <= 12 ? 15 : 10;
            let text = i != 24 ? i : '00';
            this._addTextToArc(text, size, deg, dist);
        }
    }

    _drawMinutes() {
        for (let i=0;i<12;i++) {
            let text = i != 0 ? i*5 : '00';
            this._addTextToArc(text, 15, (i*30), this._distance.minute);
        }
    }

    _drawSeconds() {
        for (let i=0;i<12;i++) {
            let text = i != 0 ? i*5 : '00';
            this._addTextToArc(text, 15, (i*30), this._distance.second);
        }
    }

    _drawPointer(degree, distance) {
        let coords = this._degreeToCoordinates(degree, distance);
        this._canvas.beginPath();
        this._canvas.strokeStyle = '#d9e7fd';
        this._canvas.lineWidth = 2.0;
        this._canvas.moveTo(this._clockRadius, this._clockRadius);
        this._canvas.lineTo(coords.x, coords.y);
        this._canvas.stroke();
        this._canvas.beginPath();
        this._canvas.fillStyle = '#d9e7fd';
        this._canvas.arc(coords.x, coords.y, 12, 0, Math.PI*2); // Kreis
        this._canvas.fill();
    }

    _addTextToArc(text, fontSize, degree, distance) {
        let coords = this._degreeToCoordinates(degree, distance);
        this._canvas.font = fontSize+'px Arial,sans-serif';
        this._canvas.fillStyle = '#000';

        let measure = this._canvas.measureText(text);
        this._canvas.fillText(text, coords.x - (measure.width /2), coords.y + (fontSize / 2));
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

        this.paint(pointerPos);
    }

    /**
     * Kelle zurücksetzen
     * @returns {undefined}
     */
    _onCanvasMouseLeave() {
        this.paint();
    }

    /**
     * Beim Klick wird die Uhrzeit übernommen.
     * @param {Object} e
     * @returns {undefined}
     */
    _onCanvasMouseClick(e) {
        let x = e.nodeEvent.layerX, y = e.nodeEvent.layerY;
        let dg = this._coordinatesToDegree(x, y);

        // ausserhalb kreis
        if (dg.distance < 0) {
            return;
        }

        // auf 30 grad runden
        dg.degree = Math.round(dg.degree / 30) * 30;

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
            this._inputHourDom.node.value = this._zeroPad(this._hour);
            this._inputMinuteDom.focus();

        // Minute
        } else if (this._clockMode === 2) {
            let min = 60 / 360 * dg.degree;
            this._minute = min === 60 ? 0 : min;
            this._inputMinuteDom.node.value = this._zeroPad(this._minute);

            if (this._inputSecondDom.node) {
                this._inputSecondDom.focus();
            } else {
                this._inputMinuteDom.focus();
                this.raiseEvent('change', {value: this.value});
            }

        // Sekunde
        } else if (this._clockMode === 3) {
            let sec = 60 / 360 * dg.degree;
            this._second = sec === 60 ? 0 : sec;
            if (this._inputSecondDom.node) {
                this._inputSecondDom.node.value = this._zeroPad(this._second);
                this._inputSecondDom.focus();
            }

            this.raiseEvent('change', {value: this.value});
        }
    }

    /**
     * Wenn die Uhrzeit mit Tastatur eingegeben wird
     * @param {Object} e
     * @returns {undefined}
     */
    _onTimeKeyUp(e) {
        let type, fld = e.context;
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
     * Beim Klick ins Zeitfeld wird alles selektiert, dass überschrieben werden kann.
     * @param {Object} e
     * @returns {undefined}
     */
    _onTimeClick(e) {
        e.context.node.select();
    }

    /**
     * Beim Fokussieren wird die passende Auswahl gezeigt.
     * @param {Object} e
     * @returns {undefined}
     */
    _onTimeFocus(e) {
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
        this.paint();
    }

    /**
     * Zahlen mit 0 padden, beim verlassen des Feldes
     * @param {Object} e
     * @returns {undefined}
     */
    _onTimeBlur(e) {
        let fld = e.context;
        // 0 padding
        if (fld.node.value.match(/^[0-9]$/)) {
            fld.node.value = '0' + fld.node.value;
        }
    }

    /**
     * Nach dem Ändern Zeit übernehmen
     * @param {Object} e
     * @returns {undefined}
     */
    _onTimeChange(e) {
        let fld = e.context;
        if (fld === this._inputHourDom) {
            this._hour = parseInt(fld.node.value);
        }
        if (fld === this._inputMinuteDom) {
            this._minute = fld.node.value ? parseInt(fld.node.value) : 0;

            if (!this._hasSeconds && fld.node.value !== '') {
                this.raiseEvent('change', {value: this.value});
            }
        }

        if (fld === this._inputSecondDom) {
            this._second = fld.node.value ? parseInt(fld.node.value) : 0;
            if (fld.node.value !== '') {
                this.raiseEvent('change', {value: this.value});
            }
        }

        // zeichnen
        this.paint();
    }

    /**
     * Die aktuelle Zeit übernehmen
     * @returns {undefined}
     */
    _onNowButtonClick() {
        let time = new Date();
        this.value =  '' + time.getHours() + this._separator + time.getMinutes() + this._separator + time.getSeconds();

        // Event
        this.raiseEvent('change', {value: this.value});
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
        if (this._inputMinuteDom) {
            this._inputMinuteDom.destruct();
        }
        if (this._inputSecondDom) {
            this._inputSecondDom.destruct();
        }
        if (this._timeDom) {
            this._timeDom.destruct();
        }
        if (this._canvasDom) {
            this._canvasDom.destruct();
        }
        if (this._canvasContainerDom) {
            this._canvasContainerDom.destruct();
        }
        if (this._nowBtn) {
            this._nowBtn.destruct();
        }

        // Variablen (Objekte/Arrays) leeren
        this._headerBar = null;
        this._inputHourDom = null;
        this._inputMinuteDom = null;
        this._inputSecondDom = null;
        this._timeDom = null;
        this._canvasDom = null;
        this._canvasContainerDom = null;
        this._nowBtn = null;

        // Basisklasse entladen
        super.destruct(true);
    }

};