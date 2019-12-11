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
            cls: 'kijs-field-combo',
            autoLoad: false,
            focusable: false
        });

        this._spinBoxEl = new kijs.gui.SpinBox({
            target: this,
            targetDomProperty: 'inputWrapperDom',
            ownerNodes: [this._inputWrapperDom, this._spinIconEl.dom],
            openOnInput: true,
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
            spinIconVisible: true,
            minChars: 'auto',
            valueField: 'value',
            captionField: 'caption'
        });

       // Mapping für die Zuweisung der Config-Eigenschaften
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

            minChars: { target: 'minChars', prio: 2},

            captionField: { target: 'captionField', context: this._listViewEl },
            iconCharField: { target: 'iconCharField', context: this._listViewEl },
            iconClsField: { target: 'iconClsField', context: this._listViewEl },
            iconColorField: { target: 'iconColorField', context: this._listViewEl },
            toolTipField: { target: 'toolTipField', context: this._listViewEl },
            valueField: { target: 'valueField', context: this._listViewEl },

            minSelectCount: true,
            maxSelectCount: true,

            data: { prio: 1000, target: 'data' },
            value: { prio: 1001, target: 'value' }
        });

        // Event-Weiterleitungen von this._inputDom
        this._eventForwardsAdd('input', this._inputDom);
        this._eventForwardsAdd('blur', this._inputDom);
        this._eventForwardsAdd('keyDown', this._inputDom);

//        this._eventForwardsRemove('enterPress', this._dom);
//        this._eventForwardsRemove('enterEscPress', this._dom);
//        this._eventForwardsRemove('escPress', this._dom);
//        this._eventForwardsAdd('enterPress', this._inputDom);
//        this._eventForwardsAdd('enterEscPress', this._inputDom);
//        this._eventForwardsAdd('escPress', this._inputDom);



        // Listeners
        //this.on('input', this._onInput, this);
        this._inputDom.on('keyUp', this._onInputKeyUp, this);
        this._inputDom.on('keyDown', this._onInputKeyDown, this);
        this._inputDom.on('change', this._onInputChange, this);
        this._spinBoxEl.on('click', this._onSpinBoxClick, this);
        this._listViewEl.on('click', this._onListViewClick, this);
        this._listViewEl.on('afterLoad', this._onListViewAfterLoad, this);
        this._spinBoxEl.on('show', this._onSpinBoxShow, this);
        //this._listViewEl.on('selectionChange', this._onListViewSelectionChange, this);

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
        if (val || this._dom.clsHas('kijs-readonly')) {
            this._inputDom.nodeAttributeSet('readOnly', true);
        } else {
            this._inputDom.nodeAttributeSet('readOnly', false);
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
        this._listViewEl.disabled = val || this._dom.clsHas('kijs-disabled');
        if (val || this._dom.clsHas('kijs-disabled')) {
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
        this._oldCaption = this._caption;
        this._oldValue = this._value;
        this._caption  = this._getCaptionFromValue(val);
        this._value = val;
        this._listViewEl.value = val;
        this._inputDom.nodeAttributeSet('value', this._caption);
    }

    get oldValue() { return this._oldValue; }


    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    /**
     * Füllt das Combo mit Daten vom Server
     * @param {Array} args Array mit Argumenten, die an die Facade übergeben werden
     * @param {Boolean} firstLoad true, wenn es das erste Laden ist
     * @returns {undefined}
     */
    load(args, firstLoad) {
        args = args ? args : {};
        args.remoteSort = !!this._remoteSort;

        if (this._remoteSort) {
            let query = this._inputDom.nodeAttributeGet('value');
            args.query = kijs.isString(query) ? query : '';
            args.value = this.value;

            // Wenn eine Eingabe erfolgt, laden
            // Beim ersten laden auch laden, wenn ein value vorhanden ist, damit das displayField geladen wird.
            if (args.query.length >= this._minChars || (firstLoad && this._value !== '' && this._value !== null)) {
                this._listViewEl.load(args);

            } else {
                this._listViewEl.removeAll();
                this._addPlaceholder(kijs.getText('Schreiben Sie mindestens %1 Zeichen, um die Suche zu starten', '', this._minChars) + '.');
            }

        } else {

            // alle Datensätze laden
            this._listViewEl.load(args);
        }
    }

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


    // PROTECTED
    /**
     * Fügt dem listView einen Platzhalter hinzu.
     * @param {String} text Nachricht, die angezeigt wird.
     */
    _addPlaceholder(text) {
        if (this._showPlaceholder) {
            this._listViewEl.add({
                xtype: 'kijs.gui.Container',
                cls: 'kijs-placeholder',
                html: text,
                htmlDisplayType: 'code'
            });
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

        return caption;
    }

    /**
     * Schreibt einen Vorschlag ins Textfeld.
     * Funktion wird vom KeyDown verzögert ausgeführt.
     * @param {String} key
     * @returns {undefined}
     */
    _setProposal(key) {
        let inputVal = this._inputDom.nodeAttributeGet('value'), matchVal='';
        inputVal = kijs.toString(inputVal).trim();

        // Exakten Wert suchen
        if (inputVal && key !== 'Backspace' && key !== 'Delete') {
            kijs.Array.each(this._listViewEl.data, function(row) {
                if (kijs.isString(row[this.captionField]) && row[this.captionField].toLowerCase() === inputVal.toLowerCase()) {
                    matchVal = row[this.captionField];
                    return false;
                }
            }, this);

            // Selber Beginn suchen
            if (matchVal === '') {
                kijs.Array.each(this._listViewEl.data, function(row) {
                    let caption = row[this.captionField];

                    if (kijs.isString(row[this.captionField])
                            && inputVal.length <= caption.length
                            && caption.substr(0, inputVal.length).toLowerCase() === inputVal.toLowerCase()) {
                        matchVal = row[this.captionField];
                        return false;
                    }
                }, this);
            }

            // Es wurde eine Übereinstimmung gefunden
            if (matchVal) {
                this._inputDom.nodeAttributeSet('value', matchVal);

                // Differenz selektieren
                if (matchVal.length !== inputVal.length) {
                    this._inputDom.node.setSelectionRange(inputVal.length, matchVal.length);
                }
            }

            // Elemente des Dropdowns filtern
            this._listViewEl.applyFilters({field:this.captionField, value: inputVal});

        } else if (key === 'Backspace' || key === 'Delete') {
            this._listViewEl.applyFilters({field:this.captionField, value: inputVal});

        } else {
            // Filter des Dropdowns zurücksetzen
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

                // prüfen, ob selektion ausserhalb von Scrollbar
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

        // Ein Datensatz muss ausgewählt werden.
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
                    this._errors.push(kijs.getText('Min. %1 Datensätze müssen ausgewählt werden', '', this._minSelectCount));
                }
            }
        }

        // maxSelectCount
        if (!kijs.isEmpty(this._maxSelectCount) && this._maxSelectCount > 0) {
            if (kijs.isArray(value)) {
                if (value.length > this._maxSelectCount) {
                    this._errors.push(kijs.getText('Max. %1 Datensätze dürfen ausgewählt werden', '', this._maxSelectCount));
                }
            }
        }
    }


    // LISTENERS
    _onAfterFirstRenderTo(e) {
        this.load(null, true);
    }

    _onInputKeyDown(e) {
        // event beim listView ausführen, damit selektion geändert werden kann.

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

        // wenn Enter gedrückt wird, listview schliessen und ausgewählten Datensatz übernehmen.
        if (e.nodeEvent.key === 'Enter') {
            let dataViewElement = this._listViewEl.getSelected();
            this._spinBoxEl.close();

            if (dataViewElement && dataViewElement instanceof kijs.gui.DataViewElement) {
                this.value = dataViewElement.dataRow[this.valueField];
            }

            // event stoppen
            e.nodeEvent.stopPropagation();

        // Esc: Schliessen
        } else if (e.nodeEvent.key === 'Escape') {
            this._spinBoxEl.close();

            // Selektion zurücksetzen
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

        // bestehendes Defer löschen
        if (this._keyUpDefer) {
            window.clearTimeout(this._keyUpDefer);
            this._keyUpDefer = null;
        }

        // neues Defer schreiben
        this._keyUpDefer = kijs.defer(function() {
            if (this._remoteSort) {
                this.load();

            } else {
                this._setProposal(e.nodeEvent.key);
            }
        }, this._remoteSort ? 1000 : 500, this);

    }

    _onInputChange(e) {
        let inputVal = this._inputDom.nodeAttributeGet('value'), match=false, matchVal='', changed=false;
        inputVal = kijs.toString(inputVal).trim();

        // Leerer Wert = feld löschen
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
        // auf letzten gültigen Wert zurücksetzen.
        } else {
            this.value = this._value;
        }

        // validieren
        this.validate();

        // change-event
        if (changed) {
            this.raiseEvent('change');
        }
    }

    _onListViewAfterLoad(e) {
        if (!this._remoteSort) {
            this.value = this._value;
        }

        if (this._selectFirst) {
            this.value = this._listViewEl.data[0].value;
        }

        // Spinbox Nachricht anhängen
        if (e.response && e.response.spinboxMessage) {
            this._addPlaceholder(e.response.spinboxMessage);
        }
    }

    _onListViewClick(e) {
        this._spinBoxEl.close();

        if (this.value !== this._listViewEl.value) {
            this.value = this._listViewEl.value;

            // validieren
            this.validate();

            this.raiseEvent('change');
        }
    }

    _onSpinBoxClick() {
        this._inputDom.focus();
    }

    _onSpinBoxShow() {
        this._setScrollPositionToSelection();
    }

    // overwrite
    _onSpinButtonClick(e) {
        super._onSpinButtonClick(e);
        this._listViewEl.applyFilters();
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
        this._listViewEl = null;
        this._oldValue = null;

        // Basisklasse entladen
        super.destruct(true);
    }
};
