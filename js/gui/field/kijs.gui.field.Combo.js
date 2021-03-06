/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.field.Combo
// --------------------------------------------------------------
kijs.gui.field.Combo = class kijs_gui_field_Combo extends kijs.gui.field.Field {

    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        this._minChars = null;
        this._minSelectCount = null;
        this._maxSelectCount = null;
        this._caption = null;
        this._oldCaption = null;
        this._oldValue = null;
        this._value = '';
        this._keyUpDefer = null;
        this._remoteSort = false;
        this._forceSelection = true;
        this._firstLoaded = false;
        this._showPlaceholder = true;
        this._selectFirst = false;

        this._inputDom = new kijs.gui.Dom({
            disableEscBubbeling: true,
            nodeTagName: 'input',
            nodeAttribute: {
                id: this._inputId
            }
        });

        this._listViewEl = new kijs.gui.ListView({
            autoScroll: false,
            cls: 'kijs-field-combo',
            autoLoad: false,
            focusable: false
        });

        this._spinBoxEl = new kijs.gui.SpinBox({
            autoScroll: true,
            parent: this,
            target: this,
            targetDomProperty: 'inputWrapperDom',
            ownerNodes: [this._inputWrapperDom, this._spinIconEl.dom],
            elements: [
                this._listViewEl
            ],
            style: {
                maxHeight: '400px'
            }
        });

        this._dom.clsAdd('kijs-field-combo');


        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            autocomplete: false,
            autoScroll: true,
            spinIconVisible: true,
            minChars: 'auto',
            valueField: 'value',
            captionField: 'caption',
            iconCharField: 'iconChar',
            iconMapField: 'iconMap'
        });

       // Mapping f??r die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            autoLoad: { target: 'autoLoad' },
            remoteSort: true,
            showPlaceholder: true,
            forceSelection: true,
            selectFirst: true,

            showCheckBoxes: { target: 'showCheckBoxes', context: this._listViewEl },
            selectType: { target: 'selectType', context: this._listViewEl },

            facadeFnLoad: { target: 'facadeFnLoad', context: this._listViewEl },
            facadeFnArgs: { target: 'facadeFnArgs', context: this._listViewEl },
            rpc: { target: 'rpc', context: this._listViewEl },

            minChars: { target: 'minChars', prio: 2}, // Nicht beachtet, wenn remoteSort false ist

            captionField: { target: 'captionField', context: this._listViewEl },
            iconCharField: { target: 'iconCharField', context: this._listViewEl },
            iconClsField: { target: 'iconClsField', context: this._listViewEl },
            iconColorField: { target: 'iconColorField', context: this._listViewEl },
            iconMapField: { target: 'iconMapField', context: this._listViewEl },
            tooltipField: { target: 'tooltipField', context: this._listViewEl },
            valueField: { target: 'valueField', context: this._listViewEl },

            minSelectCount: true,
            maxSelectCount: true,

            data: { prio: 1000, target: 'data' },
            value: { prio: 1001, target: 'value' },

            // Attribute f??r SpinBoxEl weiterreichen
            autoScroll: { target: 'autoScroll', context: this._spinboxEl }
        });

        // Event-Weiterleitungen von this._inputDom
        this._eventForwardsAdd('input', this._inputDom);
        this._eventForwardsAdd('keyDown', this._inputDom);
        this._eventForwardsAdd('afterLoad', this._listViewEl);

//        this._eventForwardsRemove('enterPress', this._dom);
//        this._eventForwardsRemove('enterEscPress', this._dom);
//        this._eventForwardsRemove('escPress', this._dom);
//        this._eventForwardsAdd('enterPress', this._inputDom);
//        this._eventForwardsAdd('enterEscPress', this._inputDom);
//        this._eventForwardsAdd('escPress', this._inputDom);



        // Listeners
        this._inputDom.on('blur', this._onInputBlur, this);
        this._inputDom.on('change', this._onInputChange, this);
        this._inputDom.on('input', this._onInputInput, this);
        this._inputDom.on('keyUp', this._onInputKeyUp, this);
        this._inputDom.on('keyDown', this._onInputKeyDown, this);
        this._listViewEl.on('afterLoad', this._onListViewAfterLoad, this);
        this._listViewEl.on('click', this._onListViewClick, this);
        this._spinBoxEl.on('click', this._onSpinBoxClick, this);
        this._spinBoxEl.on('close', this._onSpinBoxClose, this);
        this._spinBoxEl.on('show', this._onSpinBoxShow, this);

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }
    }


    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get autoLoad() {
        return this.hasListener('afterFirstRenderTo', this._onAfterFirstRenderTo, this);
    }
    set autoLoad(val) {
        if (val) {
            this.on('afterFirstRenderTo', this._onAfterFirstRenderTo, this);
        } else {
            this.off('afterFirstRenderTo', this._onAfterFirstRenderTo, this);
        }
    }

    get captionField() { return this._listViewEl.captionField; }
    set captionField(val) { this._listViewEl.captionField = val; }

    get valueField() { return this._listViewEl.valueField; }
    set valueField(val) { this._listViewEl.valueField = val; }

    // overwrite
    set data(val) {
        this._listViewEl.data = val;
        if (this._selectFirst) {
            this.value = this._listViewEl.data[0].value;
        }
    }

    // overwrite
    get disabled() { return super.disabled; }
    set disabled(val) {
        super.disabled = !!val;
        if (val) {
            this._inputDom.nodeAttributeSet('disabled', true);
        } else {
            this._inputDom.nodeAttributeSet('disabled', false);
        }

        this._listViewEl.disabled = !!val;
    }

    get facadeFnArgs() { return this._listViewEl.facadeFnArgs; }
    set facadeFnArgs(val) { this._listViewEl.facadeFnArgs = val; }

    get facadeFnLoad() { return this._listViewEl.facadeFnLoad; }
    set facadeFnLoad(val) { this._listViewEl.facadeFnLoad = val; }

    get inputDom() { return this._inputDom; }

    get minChars() { return this._minChars; }
    set minChars(val) {
        if (val === 'auto') {
            // remote combo
            if (this._listViewEl.facadeFnLoad) {
                this._minChars = 4;

            // local combo
            } else {
                this._minChars = 0;
            }
        } else if (kijs.isInteger(val) && val > 0) {
            this._minChars = val;

        } else {
            throw new kijs.Error(`invalid argument for parameter minChars in kijs.gui.field.Combo`);
        }
    }

    // overwrite
    get isEmpty() { return kijs.isEmpty(this.value); }

    // overwrite
    get readOnly() { return super.readOnly; }
    set readOnly(val) {
        super.readOnly = !!val;
        this._listViewEl.disabled = !!val;
        if (val) {
            this._inputDom.nodeAttributeSet('readOnly', true);
        } else {
            this._inputDom.nodeAttributeSet('readOnly', false);
        }
    }

    get rpc() { return this._listViewEl.rpc; }
    set rpc(val) { this._listViewEl.rpc = val; }

    // overwrite
    get value() { return this._value; }
    set value(val) {
        let valueIsInStore = val === '' || val === null || this._isValueInStore(val);
        this._oldCaption = this._caption;
        this._oldValue = this._value;
        this._caption  = this._getCaptionFromValue(val);
        this._value = val;
        this._listViewEl.value = val;

        // falls das value nicht im store ist, vom server laden
        if (this._remoteSort) {
            if (!valueIsInStore && this._firstLoaded) {
                this.load(null, true);
            }
            // store leeren, wenn value gel??scht wird.
            if (this._value === '' || this._value === null) {
//                this._listViewEl.data = [];
            }
        }

        this._inputDom.nodeAttributeSet('value', kijs.toString(this._caption));
    }

    // overwrite
    get valueDisplay() {
        return this._caption;
    }

    get oldValue() { return this._oldValue; }


    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    /**
     * F??llt das Combo mit Daten vom Server
     * @param {Array} args Array mit Argumenten, die an die Facade ??bergeben werden
     * @param {Boolean} forceLoad true, wenn immer geladen werden soll
     * @param {String} query Suchstring
     * @returns {undefined}
     */
    load(args=null, forceLoad=false, query=null) {
        args = kijs.isObject(args) ? args : {};
        args.remoteSort = !!this._remoteSort;

        if (this._remoteSort) {
            args.query = kijs.toString(query);
            args.value = this.value;

            // Wenn eine Eingabe erfolgt, oder bei forceLoad, laden
            if (forceLoad || args.query.length >= this._minChars) {
                this._listViewEl.load(args).then((response) => {

                    // Nach dem Laden das value neu setzen,
                    // damit das Label erscheint (ohne change-event)
                    if (query === null && this._isValueInStore(this.value)) {
                        this.value = this._value;

                    // value mit dem RPC zur??ckgeben (mit change-event)
                    } else if (query === null && kijs.isDefined(response.value) && response.value !== null && this._isValueInStore(response.value)) {
                        this.setValue(response.value);
                    }
                });

            } else {
                this._listViewEl.data = [];
                this._addPlaceholder(kijs.getText('Schreiben Sie mindestens %1 Zeichen, um die Suche zu starten', '', this._minChars) + '.');
            }

        } else if (!this._firstLoaded || forceLoad) {

            // alle Datens??tze laden
            this._listViewEl.load(args).then((response) => {

                // Nach dem Laden das value neu setzen,
                // damit das Label erscheint (ohne change-event)
                if (query === null && this._isValueInStore(this.value)) {
                    this.value = this._value;

                // value mit dem RPC zur??ckgeben (mit change-event)
                } else if (query === null && kijs.isDefined(response.value) && response.value !== null && this._isValueInStore(response.value)) {
                    this.setValue(response.value);
                }

            });
        }

        // Flag setzen
        this._firstLoaded = true;
    }

    // overwrite
    render(superCall) {
        super.render(true);

        // Input rendern (kijs.guiDom)
        this._inputDom.renderTo(this._inputWrapperDom.node);

        // Event afterRender ausl??sen
        if (!superCall) {
            this.raiseEvent('afterRender');
        }
    }

    // overwrite
    unrender(superCall) {
        // Event ausl??sen.
        if (!superCall) {
            this.raiseEvent('unrender');
        }

        this._inputDom.unrender();
        super.unrender(true);
    }


    // PROTECTED
    /**
     * F??gt dem listView einen Platzhalter hinzu.
     * @param {String} text Nachricht, die angezeigt wird.
     */
    _addPlaceholder(text) {
        if (this._showPlaceholder) {

            if (this._listViewEl.down('kijs-gui-field-combo-placeholder')) {
                this._listViewEl.down('kijs-gui-field-combo-placeholder').html = text;

            } else {
                this._listViewEl.add({
                    xtype: 'kijs.gui.Container',
                    name: 'kijs-gui-field-combo-placeholder',
                    cls: 'kijs-placeholder',
                    html: text,
                    htmlDisplayType: 'code'
                });
            }
        }
    }

    /**
     * Caption zu einem Value ermitteln
     * @param {String|Number|null} val
     * @returns {String}
     */
    _getCaptionFromValue(val) {
        let found = false;
        let caption = null;
        kijs.Array.each(this._listViewEl.data, function(row) {
            if (row[this.valueField] === val) {
                found = true;
                caption = row[this.captionField];
                return false;
            }
        }, this);

        // Falls kein Datensatz existiert, zeigen wir halt den value an
        if (!found) {
            caption = val;
        }

        return kijs.toString(caption);
    }

    /**
     * Pr??ft, ob ein value im Store ist.
     * @param {String|Number|null} val
     * @returns {Boolean}
     */
    _isValueInStore(val) {
        let found = false;

        kijs.Array.each(this._listViewEl.data, function(row) {
            if (row[this.valueField] === val) {
                found = true;
                return false;
            }
        }, this);

        return found;
    }

    /**
     * Schreibt einen Vorschlag ins Textfeld.
     * Funktion wird vom KeyDown verz??gert ausgef??hrt.
     * @param {String} key
     * @returns {undefined}
     */
    _setProposal(key) {
        let inputVal = this._inputDom.nodeAttributeGet('value'),
            matchVal='';

        inputVal = kijs.toString(inputVal).trim();

        // Exakten Wert suchen
        if (inputVal && key !== 'Backspace' && key !== 'Delete') {
            kijs.Array.each(this._listViewEl.data, function(row) {
                if (kijs.isString(row[this.captionField]) && row[this.captionField].toLowerCase() === inputVal.toLowerCase()) {
                    matchVal = row[this.captionField];
                    return false;
                }
            }, this);

            // Beginn suchen
            if (matchVal === '') {
                kijs.Array.each(this._listViewEl.data, function(row) {
                    let caption = row[this.captionField];

                    if (
                        kijs.isString(caption)
                        && inputVal.length <= caption.length
                        && caption.substr(0, inputVal.length).toLowerCase() === inputVal.toLowerCase()
                    ) {
                        matchVal = caption;
                        return false;
                    }

                }, this);
            }

            // Es wurde eine ??bereinstimmung gefunden
            if (matchVal) {
                this._inputDom.nodeAttributeSet('value', kijs.toString(matchVal));

                // Differenz selektieren
                if (matchVal.length !== inputVal.length) {
                    this._inputDom.node.setSelectionRange(inputVal.length, matchVal.length);
                }
            }

            // Elemente des Dropdowns filtern
            this._listViewEl.applyFilters({field:this.captionField, value: inputVal, compare: 'part'});

        } else if (key === 'Backspace' || key === 'Delete') {
            this._listViewEl.applyFilters({field:this.captionField, value: inputVal, compare: 'part'});

        } else {

            // Filter des Dropdowns zur??cksetzen
            this._listViewEl.applyFilters(null);
        }
    }

    _setScrollPositionToSelection() {
        let sel = this._listViewEl.getSelected();
        if (kijs.isObject(sel) && sel instanceof kijs.gui.DataViewElement) {
            if (kijs.isNumber(sel.top) && this._spinBoxEl.isRendered) {
                let spH = this._spinBoxEl.dom.height, spSt = this._spinBoxEl.dom.node.scrollTop;

                let minScrollValue = sel.top;
                let maxScrollValue = sel.top - spH + sel.height;

                // pr??fen, ob selektion ausserhalb von Scrollbar
                if (this._spinBoxEl.dom.node.scrollTop === 0 || this._spinBoxEl.dom.node.scrollTop > minScrollValue) {
                    this._spinBoxEl.dom.node.scrollTop = minScrollValue;

                } else if (this._spinBoxEl.dom.node.scrollTop < maxScrollValue) {
                    this._spinBoxEl.dom.node.scrollTop = maxScrollValue+5;
                }
            }
        }
    }

    // overwrite
    _validationRules(value) {

        // Eingabe erforderlich
        if (this._required) {
            if (kijs.isEmpty(value)) {
                this._errors.push(kijs.getText('Dieses Feld darf nicht leer sein'));
            }
        }

        // Ein Datensatz muss ausgew??hlt werden.
        if (this._forceSelection && !this._remoteSort && !kijs.isEmpty(value)) {
            let match = false;
            kijs.Array.each(this._listViewEl.data, function(row) {
                if (row[this.valueField] === value) {
                    match = true;
                    return false;
                }
            }, this);

            if (!match) {
                this._errors.push(kijs.getText('Der Wert "%1" ist nicht in der Liste enthalten', '', value) + '.');
            }
        }

        // minSelectCount
        if (!kijs.isEmpty(this._minSelectCount) && this._minSelectCount >= 0) {
            if (kijs.isArray(value)) {
                if (kijs.isEmpty(value) && this._minSelectCount > 0 || value.length < this._minSelectCount) {
                    this._errors.push(kijs.getText('Min. %1 Datens??tze m??ssen ausgew??hlt werden', '', this._minSelectCount));
                }
            }
        }

        // maxSelectCount
        if (!kijs.isEmpty(this._maxSelectCount) && this._maxSelectCount > 0) {
            if (kijs.isArray(value)) {
                if (value.length > this._maxSelectCount) {
                    this._errors.push(kijs.getText('Max. %1 Datens??tze d??rfen ausgew??hlt werden', '', this._maxSelectCount));
                }
            }
        }
    }


    // LISTENERS
    _onAfterFirstRenderTo(e) {
        // forceLoad, wenn value vorhanden ist (damit label geladen wird)
        this.load(null, this.value !== '');
    }

    _onInputBlur() {

        // blur nur ausf??hren, wenn Trigger nicht offen ist und Feld kein Focus hat
        kijs.defer(function() {
            if (this._spinBoxEl && this._inputDom && !this._spinBoxEl.isRendered && !this._inputDom.hasFocus) {
               this.raiseEvent('blur');
            }
        }, 200, this);
    }

    _onInputInput(e) {
        this._spinBoxEl.show();
    }

    _onInputKeyDown(e) {
        // event beim listView ausf??hren, damit selektion ge??ndert werden kann.
        if (this._listViewEl.getSelected()) {
            this._listViewEl._onKeyDown(e);

        } else if (e.nodeEvent.key === 'ArrowDown') {
            let indx = this._listViewEl.elements.length > 0 && kijs.isDefined(this._listViewEl.elements[0].index) ? this._listViewEl.elements[0].index : null;
            if (indx !== null) {
                this._listViewEl.selectByIndex(indx);
            }
        }

        // Scroll
        if (e.nodeEvent.key === 'ArrowDown' || e.nodeEvent.key === 'ArrowUp') {
            // scrollen
            this._setScrollPositionToSelection();
        }

        // wenn Enter gedr??ckt wird, listview schliessen und ausgew??hlten Datensatz ??bernehmen.
        if (e.nodeEvent.key === 'Enter') {
            let dataViewElement = this._listViewEl.getSelected();
            this._spinBoxEl.close();

            if (dataViewElement && dataViewElement instanceof kijs.gui.DataViewElement) {
                let newVal = dataViewElement.dataRow[this.valueField],
                    oldVal = this.value,
                    changed = newVal !== this.value;
                this.value = newVal;

                if (changed) {
                    this.raiseEvent('change', {value: this.value, oldVal: oldVal});
                }
            }

            // event stoppen
            e.nodeEvent.stopPropagation();

        // Esc: Schliessen
        } else if (e.nodeEvent.key === 'Escape') {
            this._spinBoxEl.close();

            // Selektion zur??cksetzen
            this._listViewEl.value = this.value;

            // event stoppen
            e.nodeEvent.stopPropagation();
        }
    }

    _onInputKeyUp(e) {
        // Steuerbefehle ignorieren
        let specialKeys = [
            'ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'ContextMenu',
            'Delete', 'Insert', 'Home', 'End', 'Alt', 'NumpadEnter',
            'AltGraph', 'ContextMenu', 'Control', 'Shift',
            'Enter', 'CapsLock', 'Tab', 'OS', 'Escape', 'Space'
        ];
        if (kijs.Array.contains(specialKeys, e.nodeEvent.code) || kijs.Array.contains(specialKeys, e.nodeEvent.key)) {
            return;
        }

        // bestehendes Defer l??schen
        if (this._keyUpDefer) {
            window.clearTimeout(this._keyUpDefer);
            this._keyUpDefer = null;
        }

        // neues Defer schreiben
        this._keyUpDefer = kijs.defer(function() {
            if (this._remoteSort) {
                this.load(null, false, this._inputDom.nodeAttributeGet('value'));

            } else {
                this._setProposal(e.nodeEvent.key);
            }
        }, this._remoteSort ? 1000 : 500, this);

    }

    _onInputChange(e) {

        // change event nicht ber??cksichtigen, wenn die spinbox
        // offen ist.
        if (this._spinBoxEl.isRendered) {
            return;
        }

        let inputVal = this._inputDom.nodeAttributeGet('value'),
            match = false,
            matchVal = '',
            oldVal = this.value,
            changed = false;

        inputVal = kijs.toString(inputVal).trim();

        // Leerer Wert = feld l??schen
        if (inputVal === '') {
            match = true;

        } else {

            // Wert im Store suchen.
            kijs.Array.each(this._listViewEl.data, function(row) {
                if (kijs.isString(row[this.captionField]) && row[this.captionField].toLowerCase() === inputVal.toLowerCase()) {
                    match = true;
                    matchVal = row[this.valueField];
                    return false;
                }
            }, this);
        }

        if (match && matchVal !== this.value) {
            this.value = matchVal;
            changed = true;

        // Es wurde ein Wert eingegeben, der nicht im Store ist, und das ist erlaubt.
        } else if (!match && !this._forceSelection) {
            if (inputVal !== this.value) {
                this.value = inputVal;
                changed = true;
            }

        // Es wurde ein Wert eingegeben, der nicht im Store ist, daher Feld
        // auf letzten g??ltigen Wert zur??cksetzen.
        } else {
            this.value = this._value;
        }

        // validieren
        this.validate();

        // change-event
        if (changed) {
            this.raiseEvent('change', {value: this.value, oldVal: oldVal});
        }
    }

    _onListViewAfterLoad(e) {
        if (!this._remoteSort) {
            this.value = this._value;
        }

        if (this._selectFirst) {
            this.value = this._listViewEl.data[0].value;
        }

        // Spinbox Nachricht anh??ngen
        if (e.response && e.response.spinboxMessage) {
            this._addPlaceholder(e.response.spinboxMessage);
        }
    }

    _onListViewClick(e) {
        this._spinBoxEl.close();

        if (this.value !== this._listViewEl.value) {
            let oldVal = this.value;
            this.value = this._listViewEl.value;

            // validieren
            this.validate();

            this.raiseEvent('change', {value: this.value, oldVal: oldVal});
        }
    }

    _onSpinBoxClick() {
        this._inputDom.focus();
    }

    _onSpinBoxShow() {
        this._setScrollPositionToSelection();
    }

    _onSpinBoxClose() {
        this._inputDom.focus();
        this._onInputBlur();
    }

    // overwrite
    _onSpinButtonClick(e) {
        super._onSpinButtonClick(e);
        this._listViewEl.applyFilters();

        if (this._listViewEl.data.length === 0 && this._remoteSort) {
            this._addPlaceholder(kijs.getText('Schreiben Sie mindestens %1 Zeichen, um die Suche zu starten', '', this._minChars) + '.');
        }
    }


    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(superCall) {
        if (!superCall) {
            // unrendern
            this.unrender(superCall);

            // Event ausl??sen.
            this.raiseEvent('destruct');
        }

        // Elemente/DOM-Objekte entladen
        if (this._inputDom) {
            this._inputDom.destruct();
        }

        // Variablen (Objekte/Arrays) leeren
        this._inputDom = null;
        this._listViewEl = null;
        this._oldValue = null;

        // Basisklasse entladen
        super.destruct(true);
    }
};
