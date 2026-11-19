/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.field.Month
// --------------------------------------------------------------
/**
 * Feld für einen Monat. Die Eingabe erfolgt als Text (Monatsname oder Abkürzung in der aktuellen
 * Sprache, optional mit Jahr, z.B. 'Mai 2024') oder über die aufklappbare Auswahl
 * (kijs.gui.MonthPicker). Angezeigt wird der Monat ausgeschrieben mit Jahr. Der Wert ist ein
 * String im Format valueFormat (Default 'Y-m-d') mit dem 1. Tag des Monats bzw. mit
 * lastDayOfMonthAsValue mit dem letzten Tag.
 *
 * @example
 * new kijs.gui.field.Month({ label: 'Monat', name: 'monat', minValue: '2024-01-01' });
 *
 * @fires blur  Weitergeleitet vom input-Node
 * @fires change  Nach einer Änderung durch den Benutzer (Verlassen des Textfelds bzw. Auswahl im
 *                MonthPicker) und nach clear(). e: date, oldDate, value, oldValue
 * @fires input  Bei jeder Eingabe im Textfeld (weitergeleitet) und bei einer Änderung im
 *               MonthPicker zusammen mit change (e: date, oldDate, value, oldValue)
 */
kijs.gui.field.Month = class kijs_gui_field_Month extends kijs.gui.field.Field {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        // overwrite
        this._valuesMapping = {
            name: { valueProperty: 'value', emptyValue: '' }
        };

        this._previousChangeDate = null;  // Wird verwendet, um das Change Event nur bei einer Wertänderung auszulösen

        this._year2000Threshold = 30;     // Wenn zweistellige Jahreszahlen eingegeben werden,
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

        this._spinButtonEl = new kijs.gui.Button({
            parent: this,
            iconMap: 'kijs.iconMap.Fa.calendar-days',
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
            targetDomProperty: 'inputWrapperDom',
            ownerNodes: [this._inputWrapperDom, this._spinButtonEl.dom],
            elements: [
                this._monthPicker
            ]
        });

        this._dom.clsAdd('kijs-field-month');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            spinButtonCls: 'kijs-inline',
            autocomplete: false,
            disableFlex: true
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            autocomplete: { target: 'autocomplete' },   // De-/aktiviert die Browser-Vorschläge
            name: { target: 'name' },
            year2000Threshold: true,    // {Number|null} Zweistellige Jahre ab diesem Wert werden 19xx, sonst 20xx. null = keine Umwandlung. Default: 30
            emptyBtnHide: { target: 'maxDate', context: this._monthPicker },
            inputMode: { target: 'inputMode' },
            valueFormat: { target: 'valueFormat', context: this._monthPicker },
            lastDayOfMonthAsValue: { target: 'lastDayOfMonthAsValue', context: this._monthPicker },
            maxDate: { target: 'maxDate', context: this._monthPicker },     // {Date|null} Spätester wählbarer Monat (siehe kijs.gui.MonthPicker.maxDate)
            minDate: { target: 'minDate', context: this._monthPicker },     // {Date|null} Frühester wählbarer Monat (siehe kijs.gui.MonthPicker.minDate)
            maxValue: { target: 'maxValue', context: this._monthPicker },   // {String|null} maxDate als String im Format valueFormat
            minValue: { target: 'minValue', context: this._monthPicker },   // {String|null} minDate als String im Format valueFormat

            spinButtonCls: { fn: 'function', target: this._spinButtonEl.dom.clsAdd, context: this._spinButtonEl.dom },   // {String|Array} CSS-Klassen des Buttons zum Aufklappen. Default: 'kijs-inline'
            spinButtonHide: { target: 'spinButtonHide' },
            spinButtonIconChar: { target: 'iconChar', context: this._spinButtonEl },
            spinButtonIconCls: { target: 'iconCls', context: this._spinButtonEl },
            spinButtonIconColor: { target: 'iconColor', context: this._spinButtonEl },
            spinButtonIconMap: { target: 'iconMap', context: this._spinButtonEl },
            
            placeholder: { target: 'placeholder' },
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
    }



    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    /**
     * Vorschläge des Browsers: true (Attribut 'on'), false ('off') oder ein Wert für das
     * Attribut autocomplete. Default: false
     * @type {Boolean|String}
     */
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

    /**
     * Gewählter Monat als Date: der 1. Tag bzw. mit lastDayOfMonthAsValue der letzte Tag des
     * Monats. Der Setter akzeptiert ein beliebiges Datum des Monats (alles, was kijs.Date.create() kennt).
     * @type {Date|null}
     */
    get date() {
        return this._monthPicker.date;
    }
    set date(val) {
        this._monthPicker.date = val;
        this._updateInputValue();
        this._previousChangeDate = this._monthPicker.date;
        this._updateClearButtonVisibility();
    }

    /**
     * Button Leeren im MonthPicker ausblenden?
     * @type {Boolean}
     */
    get emptyBtnHide() { return this._monthPicker.emptyBtnHide; }
    set emptyBtnHide(val) { this._monthPicker.emptyBtnHide = !!val; }

    // overwrite
    get hasFocus() { return this._inputDom.hasFocus; }

    /**
     * kijs.gui.Dom des input-Nodes
     * @type {kijs.gui.Dom}
     */
    get inputDom() { return this._inputDom; }

    /**
     * Attribut inputmode des input-Nodes (virtuelle Tastatur)
     * @type {String}
     */
    get inputMode() { return this._inputDom.nodeAttributeGet('inputMode'); }
    set inputMode(val) { this._inputDom.nodeAttributeSet('inputMode', val); }

    // overwrite
    get isEmpty() { return kijs.isEmpty(this.value); }

    /**
     * Gibt date bzw. value den letzten statt den ersten Tag des Monats zurück? Default: false
     * @type {Boolean}
     */
    get lastDayOfMonthAsValue() { return this._monthPicker.lastDayOfMonthAsValue; }
    set lastDayOfMonthAsValue(val) { this._monthPicker.lastDayOfMonthAsValue = !!val; }

    // overwrite
    get name() { return this._name; }
    set name(val) {
        super.name = val;
        this._inputDom.nodeAttributeSet('name', kijs.toString(val));
    }

    /**
     * Platzhaltertext im leeren Feld
     * @type {String}
     */
    get placeholder() { this._inputDom.nodeAttributeGet('placeholder'); }
    set placeholder(val) { this._inputDom.nodeAttributeSet('placeholder', kijs.toString(val)); }

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

    /**
     * Button zum Aufklappen der Auswahl
     * @type {kijs.gui.Button}
     */
    get spinButton() { return this._spinButtonEl; }

    /**
     * Button zum Aufklappen ausblenden?
     * @type {Boolean}
     */
    get spinButtonHide() { return !this._spinButtonEl.visible; }
    set spinButtonHide(val) { this._spinButtonEl.visible = !val; }

    /**
     * Zeichen des Icons im Button zum Aufklappen
     * @type {Number}
     */
    get spinButtonIconChar() { return this._spinButtonEl.iconChar; }
    set spinButtonIconChar(val) { this._spinButtonEl.iconChar = val; }

    /**
     * CSS-Klasse des Icons im Button zum Aufklappen
     * @type {String|null}
     */
    get spinButtonIconCls() { return this._spinButtonEl.iconCls; }
    set spinButtonIconCls(val) { this._spinButtonEl.iconCls = val; }

    /**
     * Farbe des Icons im Button zum Aufklappen
     * @type {String}
     */
    get spinButtonIconColor() { return this._spinButtonEl.iconColor; }
    set spinButtonIconColor(val) { this._spinButtonEl.iconColor = val; }

    /**
     * Icon des Buttons zum Aufklappen. Default: Kalender
     * @type {String|Object}
     */
    get spinButtonIconMap() { return this._spinButtonEl.iconMap; }
    set spinButtonIconMap(val) { this._spinButtonEl.iconMap = val; }

    /**
     * Gewählter Monat als String im Format valueFormat (1. bzw. letzter Tag des Monats, siehe
     * lastDayOfMonthAsValue). Leer: ''. Der Setter verhält sich wie date.
     * @type {String}
     */
    // overwrite
    get value() {
        return this._monthPicker.value;
    }
    set value(val) {
        this.date = val;
    }

    /**
     * Format von value, minValue und maxValue (siehe kijs.Date.format()). Default: 'Y-m-d'
     * @type {String}
     */
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

        // Spin Button rendern (kijs.gui.Button)
        this._spinButtonEl.renderTo(this._contentDom.node, this._innerDom.node, 'before');

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
        this._inputDom.unrender();

        if (this._spinBoxEl) {
            this._spinBoxEl.unrender();
        }

        super.unrender(true);
    }


    // PROTECTED
    // overwrite
    _hasClearableContent() {
        // Der eingegebene Text ergibt erst ein Datum, wenn er als Monat erkannt wird
        return super._hasClearableContent() || !kijs.isEmpty(this._inputDom.nodeAttributeGet('value'));
    }

    /**
     * Erkennt einen Monat in einem Text: ein Monatsname oder eine Abkürzung in der aktuellen
     * Sprache und optional ein Jahr (durch Leerzeichen getrennt, Reihenfolge beliebig). Ohne Jahr
     * gilt das aktuelle Jahr, zweistellige Jahre werden nach year2000Threshold umgewandelt.
     * @param {String} strInput
     * @returns {Date|null}  1. Tag des Monats oder null, wenn kein Monat erkannt wurde
     */
    _parseStringToMonth(strInput) {
        let year = null;
        let monthIndex = null; // 0=Jan, 1=Feb, ...
        let index;

        const months = [];
        const monthsShort = [];
        for (let i=0; i<12; i++) {
            months[i] = kijs.Date.getMonthName(new Date(2000, i, 1), 'long');
            monthsShort[i] = kijs.Date.getMonthName(new Date(2000, i, 1), 'short');
        }

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
                    // Evtl. aus zweistelliger Jahreszahl eine vierstellige machen
                    if (!kijs.isEmpty(this._year2000Threshold) && year >= 0 && year <= 99) {
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

    /**
     * Schreibt den gewählten Monat ausgeschrieben mit Jahr (z.B. 'Mai 2024') in das Textfeld.
     * @returns {undefined}
     */
    _updateInputValue() {
        let val = '';
        if (!kijs.isEmpty(this._monthPicker.date)) {
            val = this._monthPicker.date.toLocaleDateString(kijs.language, {
                month: 'long',
                year: 'numeric'
            });
        }
        this._inputDom.nodeAttributeSet('value', val);
    }

    // overwrite
    _validationRules(value, ignoreEmpty) {
        if (ignoreEmpty && kijs.isEmpty(value)) {
            return;
        }

        if (!kijs.isEmpty(value)) {
            const date = kijs.Date.create(value);

            // Min. value
            if (this._monthPicker.minDate !== null && date < this._monthPicker.minDate) {
                this._errors.push(
                    kijs.getText('Der minimale Wert für dieses Feld ist %1',
                        '',
                        this._monthPicker.minDate.toLocaleDateString(kijs.language, {
                            month: 'long',
                            year: 'numeric'
                        })
                    )
                );
            }

            // Max. value
            if (this._monthPicker.maxDate !== null && date > this._monthPicker.maxDate) {
                this._errors.push(
                    kijs.getText('Der maximale Wert für dieses Feld ist %1',
                        '',
                        this._monthPicker.maxDate.toLocaleDateString(kijs.language, {
                            month: 'long',
                            year: 'numeric'
                        })
                    )
                );
            }
        }

        super._validationRules(value, ignoreEmpty);
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
        this._updateClearButtonVisibility();

        if (!kijs.Date.compare(this._monthPicker.date, oldDate)) {
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

        this.errorsReset();

        this._monthPicker.date = date;

        this._updateClearButtonVisibility();
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
            this.raiseEvent('input', {
                date: this.date,
                oldDate: oldDate,
                value: this.value,
                oldValue: oldValue
            });
            this.raiseEvent('change', {
                date: this.date,
                oldDate: oldDate,
                value: this.value,
                oldValue: oldValue
            });
        }
    }

    #onMonthPickerCurrentClick(e) {
        this._spinBoxEl.close();
        this._inputDom.focus();
    }

    #onMonthPickerEmptyClick(e) {
        this._spinBoxEl.close();
        this._inputDom.focus();
    }

    #onMonthPickerMonthClick(e) {
        this._spinBoxEl.close();
        this._inputDom.focus();
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
        if (this._monthPicker) {
            this._monthPicker.destruct();
        }
        if (this._spinBoxEl) {
            this._spinBoxEl.destruct();
        }
        if (this._spinButtonEl) {
            this._spinButtonEl.destruct();
        }
        
        // Variablen (Objekte/Arrays) leeren
        this._inputDom = null;
        this._monthPicker = null;
        this._spinBoxEl = null;
        this._spinButtonEl = null;
        
        // Basisklasse entladen
        super.destruct(true);
    }

};
