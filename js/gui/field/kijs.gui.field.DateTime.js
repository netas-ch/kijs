/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.field.DateTime
// --------------------------------------------------------------
/**
 * EVENTS
 * ----------
 * blur
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
kijs.gui.field.DateTime = class kijs_gui_field_DateTime extends kijs.gui.field.Field {

    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        this._inputDom = new kijs.gui.Dom({
            disableEscBubbeling: true,
            nodeTagName: 'input',
            nodeAttribute: {
                id: this._inputId
            },
            on: {
                change: this._onChange,
                context: this
            }
        });

        this._dom.clsAdd('kijs-field-datetime');

        this._hasTime = true;
        this._hasDate = true;
        this._hasSeconds = false;
        this._timeRequired = false;


        this._timePicker = new kijs.gui.TimePicker({
            on: {
                change: this._onTimePickerChange,
                afterRender: this._onTimePickerAfterRender,
                context: this
            }
        });

        // TODO: datePicker

        this._spinBoxEl = new kijs.gui.SpinBox({
            target: this,
            width: 180,
            height: 260,
            cls: ['kijs-flexcolumn', 'kijs-spinbox-datetime'],
            targetDomProperty: 'inputWrapperDom',
            ownerNodes: [this._inputWrapperDom, this._spinIconEl.dom],
            openOnInput: false,
            elements: [
                this._timePicker
            ]
        });

       // Standard-config-Eigenschaften mergen
        config = Object.assign({}, {
            //autoLoad: true,
            spinIconVisible: true,
            spinIconChar: '&#xf073', // calendar
            displayFormat: 'd.m.Y H:i:s', // Format, das angezeigt wird
            valueFormat: 'Y-m-d H:i:s'  // Format, das mit value ausgeliefert wird
        }, config);

       // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            hasTime: true,    // Enthält das Feld die Uhrzeit?
            hasDate: true,    // Enthält das Feld das Datum?
            hasSeconds: true, // Hat das Uhrzeitfeld Sekunden?
            timeRequired: true, // Muss die Zeit eingegeben werden?
            displayFormat: true,
            valueFormat: true
        });

        // Event-Weiterleitungen von this._inputDom
        this._eventForwardsAdd('blur', this._inputDom);
        this._eventForwardsAdd('change', this._inputDom);
        this._eventForwardsAdd('input', this._inputDom);

        this._eventForwardsRemove('enterPress', this._dom);
        this._eventForwardsRemove('enterEscPress', this._dom);
        this._eventForwardsRemove('escPress', this._dom);
        this._eventForwardsAdd('enterPress', this._inputDom);
        this._eventForwardsAdd('enterEscPress', this._inputDom);
        this._eventForwardsAdd('escPress', this._inputDom);

        // Listeners
        this.on('input', this._onInput, this);

        // Config anwenden
        if (kijs.isObject(config)) {
            this.applyConfig(config, true);
        }

        if (!this._hasDate && !this._hasTime) {
            throw new Error('hasDate and hasTime is false, nothing to display');
        }
        if (!this._hasDate) {
            this.spinIconChar = '&#xf017'; // clock
        }

        this._timePicker.hasSeconds = !!this._hasSeconds;
    }


    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    // overwrite
    get disabled() { return super.disabled; }
    set disabled(val) {
        super.disabled = !!val;
        if (val || this._dom.clsHas('kijs-readonly')) {
            this._inputDom.nodeAttributeSet('readOnly', true);
        } else {
            this._inputDom.nodeAttributeSet('readOnly', false);
        }
    }

    get hasDate() { return this._hasDate; }
    set hasDate(val) { this._hasDate = !!val; }

    get hasSeconds() { return this._hasSeconds; }
    set hasSeconds(val) { this._hasSeconds = !!val; }

    get hasTime() { return this._hasTime; }
    set hasTime(val) { this._hasTime = !!val; }

    // overwrite
    get isEmpty() { return kijs.isEmpty(this._inputDom.value); }

    get inputDom() { return this._inputDom; }

    // overwrite
    get readOnly() { return super.readOnly; }
    set readOnly(val) {
        super.readOnly = !!val;
        if (val || this._dom.clsHas('kijs-disabled')) {
            this._inputDom.nodeAttributeSet('readOnly', true);
        } else {
            this._inputDom.nodeAttributeSet('readOnly', false);
        }
    }

    get timeRequired() { return this._timeRequired; }
    set timeRequired(val) { this._timeRequired = !!val; }

    // overwrite
    get value() {
        let val = this._inputDom.nodeAttributeGet('value');
        val = this._getDateTimeByString(val);
        if (val instanceof Date) {
            return this._format(this._valueFormat, val);
        }
        return '';
    }
    set value(val) {
        let display='';

        // Datum aus String
        if (kijs.isString(val) && val !== '') {
            val = this._getDateTimeByString(val);
        }

        if (val instanceof Date) {
            display = this._format(this._displayFormat, val);
        }
        this._inputDom.nodeAttributeSet('value', display);
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

        this._inputDom.unrender();
        super.unrender(true);
    }

    /**
     * Formatiert ein Datum im angegebenen Format
     * @param {String} format
     * @param {Date} datetime
     * @returns {String}
     */
    _format(format, datetime) {
        format = this._getFormat(format, datetime);
        if (format !== '' && datetime instanceof Date) {
            return kijs.Date.format(datetime, format, this._languageId);
        }
        return '';
    }

    /**
     * Entfernt Datums- oder Zeitbuchstaben vom Format,
     * wenn diese nicht aktiv sind.
     * @param {String} format
     * @param {Date|null} datetime
     * @returns {String}
     */
    _getFormat(format, datetime=null) {
        let hasNoTime = false;

        // Wenn keine Uhrzeit gefunden wurde und diese nicht nötig
        // ist, wird die Zeit abgeschnitten.
        if (datetime instanceof Date && !this._timeRequired) {
            if (datetime.timeMatch === false) {
                hasNoTime = true;
            }
        }

        // alle Datumszeichen entfernen
        if (!this._hasDate) {
            format = format.replace(/[^a-zA-Z]?[dDjlFmMnWYyL][^a-zA-Z]?/gu, '').trim();
        }

        // alle Zeitzeichen entfernen
        if (!this._hasTime || hasNoTime) {
            format = format.replace(/[^a-zA-Z]?[His][^a-zA-Z]?/gu, '').trim();
        }

        // Sekunden entfernen
        if (!this._hasSeconds) {
            format = format.replace(/[^a-zA-Z]?s[^a-zA-Z]?/gu, '').trim();
        }

        return format;
    }


    /**
     * parst ein String und liest ein Datum
     * @param {String} dateTimeStr
     * @returns {Date|Boolean}
     */
    _getDateTimeByString(dateTimeStr) {
        let year=null, month=null, day=null, hour=0, minute=0, second=0, timeMatch = false;

        // Uhrzeit
        if (this._hasTime) {

            // Uhrzeit lesen (12:12)
            dateTimeStr = dateTimeStr.replace(/([0-9]{1,2}):([0-9]{1,2})(?::([0-9]{1,2}))?/u, function(match, h, i, s) {
                timeMatch = true;
                h = parseInt(h);
                i = parseInt(i);
                s = s ? parseInt(s) : 0;
                if (h === 24) {
                    h = 0;
                }
                if (h >= 0 && h <= 23) {
                    hour = h;
                }
                if (i >= 0 && i < 60) {
                    minute = i;
                }
                if (s >= 0 && s < 60) {
                    second = s;
                }
                return '';
            }).trim();

            // Falls nur eine Uhrzeit gesucht ist, versuchen die Uhrzeit zu lesen.
            // Wenn eine einzelne Zahl eingegeben wurde, diese als Stunde handeln
            if (!timeMatch && !this._hasDate) {
                let tm = dateTimeStr.match(/[0-9]+/u);
                if (tm) {
                    let tH = parseInt(tm[0]);
                    if (tH >= 0 && tH <= 24) {
                        hour = tH === 24 ? 0 : tH;
                        timeMatch = true;
                    }
                }
            }

            // drei oder vier ziffern als [H]HMM handeln
            if (!timeMatch && !this._hasDate) {
                let tm = dateTimeStr.match(/([0-9]{1,2})([0-9]{2})/u);
                if (tm) {
                    let tH = parseInt(tm[1]);
                    let tI = parseInt(tm[2]);

                    if (tH >= 0 && tH <= 24 && tI >= 0 && tI <= 59) {
                        hour = tH;
                        minute = tI;
                    } else {
                        return false;
                    }
                } else {
                    return false;
                }
            }
        }

        // Datum im DB-Format (2019-01-10) lesen
        dateTimeStr.replace(/([0-9]{2}|[0-9]{4})-([0-9]{1,2})-([0-9]{1,2})/u, function(match, Y, m, d) {
            year = parseInt(Y);
            month = parseInt(m);
            day = parseInt(d);
            return match;
        });

        // Datum ansonsten im Format Tag . Monat . Jahr lesen
        if (!year) {
            let dp = dateTimeStr.match(/([\d]+)[^\d]*([\d]*)[^\d]*([\d]*)/u);
            day = dp && dp[1] ? parseInt(dp[1]) : null;
            month = dp && dp[2] ? parseInt(dp[2]) : null;
            year = dp && dp[3] ? parseInt(dp[3]) : null;
        }
        
        // Jahr anpassen
        if (year !== null && year > 0 && year < 30) {
            year = 2000 + year;
        } else if (year !== null && year >= 30 && year < 100) {
            year = 1900 + year;
        } else if (year === null || year < 0 || year > 3000) {
            year = (new Date()).getFullYear();
        }

        // Monat
        if (month === null || month === 0 || month > 12 || month < 0) {
            month = (new Date()).getMonth()+1;
        }

        // Tag
        if (day === null || day < 0 || day === 0 || day > 31) {
            if (this._hasDate) {
                return false;
            } else {
                day = (new Date()).getDate();
            }
        }

        let datetime = new Date(year, month-1, day, hour, minute, second);
        datetime.timeMatch = timeMatch; // Uhrzeit definiert oder default (00:00)
        return datetime;
    }

    _validationRules(value) {
        let rawValue = this._inputDom.nodeAttributeGet('value');

        // Eingabe erforderlich
        if (this._getDateTimeByString(rawValue) === false) {
            this._errors.push('Ungültiges Format.');
        }
    }


    // LISTENERS
    _onInput(e) {
        this.validate();
    }

    _onChange(e) {
        let dateTime = this._getDateTimeByString(e.nodeEvent.target.value);
        if (dateTime) {
            // formatierens
            this.value = dateTime;
        }
    }

    _onTimePickerAfterRender() {
        let v = this._getDateTimeByString(this.value);
        this._timePicker.value = v ? this._format('H:i:s', v) : '00:00:00';

    }

    _onTimePickerChange(e) {
        let v = this._getDateTimeByString(this.value) || new Date();
        this.value = this._format('Y-m-d', v) + ' ' + e.value;
        this._spinBoxEl.close();
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

        // Variablen (Objekte/Arrays) leeren
        this._inputDom = null;

        // Basisklasse entladen
        super.destruct(true);
    }
};
