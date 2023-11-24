/* global kijs, this */

// TODO: load() Funktion überarbeiten, so dass sie einen Basisklassenaufruf macht.
// TODO: force-Argument bei Load entfernen. Die Anzahl eingegebenen Zeichen nicht
//       in der Load Funktion überprüfen, sondern in #onInputDomKeyUp

// --------------------------------------------------------------
// kijs.gui.field.Combo
// --------------------------------------------------------------
kijs.gui.field.Combo = class kijs_gui_field_Combo extends kijs.gui.field.Field {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        this._minChars = null;
        this._minSelectCount = null;
        this._maxSelectCount = null;
        this._caption = null;
        this._oldCaption = null;
        this._oldValue = null;
        this._value = '';
        this._keyUpDeferId = null;
        this._remoteSort = false;   // TODO: umbenennen nach remoteFilter
        this._forceSelection = true;
        this._firstLoaded = false;
        this._showPlaceholder = true; // TODO: umbenennen nach placeholder, wo ein Text übergeben werden kann, wie in kijs.gui.field.Text?
        this._selectFirst = false;

        this._inputDom = new kijs.gui.Dom({
            disableEscBubbeling: true,
            nodeTagName: 'input',
            nodeAttribute: {
                id: this._inputId
            }
        });

        this._listViewEl = new kijs.gui.ListView({
            scrollableY: false,
            autoLoad: false,
            focusable: false
        });
        
        this._spinButtonEl = new kijs.gui.Button({
            parent: this,
            iconMap: 'kijs.iconMap.Fa.caret-down',
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
            cls: 'kijs-field-combo-spinbox',
            scrollableY: 'auto',
            target: this,
            targetDomProperty: 'inputWrapperDom',
            ownerNodes: [this._inputWrapperDom, this._spinButtonEl.dom],
            elements: [
                this._listViewEl
            ],
            style: {
                maxHeight: '400px'
            }
        });
        
        this._buttonsDom = new kijs.gui.Dom({
            cls: 'kijs-buttons'
        });

        this._dom.clsAdd('kijs-field-combo');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            autocomplete: false,
            scrollableY: 'auto',
            minChars: 'auto',
            valueField: 'value',
            captionField: 'caption',
            iconCharField: 'iconChar',
            iconMapField: 'iconMap'
        });

       // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            autocomplete: { target: 'autocomplete' },   // De-/aktiviert die Browservorschläge
            autoLoad: { target: 'autoLoad' },
            inputMode: { target: 'inputMode' },
            remoteSort: true,
            showPlaceholder: true,
            forceSelection: true,
            selectFirst: true,

            showCheckBoxes: { target: 'showCheckBoxes', context: this._listViewEl },
            selectType: { target: 'selectType', context: this._listViewEl },

            rpcLoadFn: { target: 'rpcLoadFn', context: this._listViewEl },
            rpcLoadArgs: { target: 'rpcLoadArgs', context: this._listViewEl },
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
            
            spinButtonHide: { target: 'spinButtonHide' },
            spinButtonIconChar: { target: 'iconChar', context: this._spinButtonEl },
            spinButtonIconCls: { target: 'iconCls', context: this._spinButtonEl },
            spinButtonIconColor: { target: 'iconColor', context: this._spinButtonEl },
            spinButtonIconMap: { target: 'iconMap', context: this._spinButtonEl },

            // Attribute für SpinBoxEl weiterreichen
            scrollableX: { target: 'scrollableX', context: this._spinboxEl },
            scrollableY: { target: 'scrollableY', context: this._spinboxEl },

            virtualKeyboardPolicy: { target: 'virtualKeyboardPolicy' }
        });

        // Event-Weiterleitungen von this._inputDom
        this._eventForwardsAdd('focus', this._inputDom);
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
        this._inputDom.on('blur', this.#onInputDomBlur, this);
        this._inputDom.on('change', this.#onInputDomChange, this);
        this._inputDom.on('input', this.#onInputDomInput, this);
        this._inputDom.on('keyUp', this.#onInputDomKeyUp, this);
        this._inputDom.on('keyDown', this.#onInputDomKeyDown, this);
        this._listViewEl.on('afterLoad', this.#onListViewElAfterLoad, this);
        this._listViewEl.on('click', this.#onListViewElClick, this);
        this._spinBoxEl.on('click', this.#onSpinBoxElClick, this);
        this._spinBoxEl.on('close', this.#onSpinBoxElClose, this);
        this._spinBoxEl.on('show', this.#onSpinBoxElShow, this);
        
        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }
    }



    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get autocomplete() { return this._inputDom.nodeAttributeGet('autocomplete'); }
    set autocomplete(val) {
        let value = 'on';

        if (kijs.isString(val)) {
            value = val;
        } else if (val === false) {
            value = 'off';
        }

        // De-/aktiviert die Browservorschläge
        this._inputDom.nodeAttributeSet('autocomplete', value);
    }

    get autoLoad() {
        return this.hasListener('afterFirstRenderTo', this.#onAfterFirstRenderTo, this);
    }
    set autoLoad(val) {
        if (val) {
            this.on('afterFirstRenderTo', this.#onAfterFirstRenderTo, this);
        } else {
            this.off('afterFirstRenderTo', this.#onAfterFirstRenderTo, this);
        }
    }

    get buttonsDom() { return this._buttonsDom; }
    
    get captionField() { return this._listViewEl.captionField; }
    set captionField(val) { this._listViewEl.captionField = val; }

    // overwrite
    get data() {
        return this._listViewEl.data;
    }
    set data(val) {
        this._listViewEl.data = val;
        if (this._selectFirst) {
            this.value = this._listViewEl.data[0].value;
        }
    }

   // overwrite
    get hasFocus() { return this._inputDom.hasFocus; }

    // overwrite
    get isEmpty() { return kijs.isEmpty(this.value); }

    get inputDom() { return this._inputDom; }

    get inputMode() { return this._inputDom.nodeAttributeGet('inputMode'); }
    set inputMode(val) { this._inputDom.nodeAttributeSet('inputMode', val); }

    get minChars() { return this._minChars; }
    set minChars(val) {
        if (val === 'auto') {
            // remote combo
            if (this._listViewEl.rpcLoadFn) {
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

    get oldValue() { return this._oldValue; }

    // overwrite
    get readOnly() { return super.readOnly; }
    set readOnly(val) {
        super.readOnly = !!val;
        this._listViewEl.disabled = !!val;
        this._inputDom.nodeAttributeSet('readOnly', !!val);
    }

    get rpc() { return this._listViewEl.rpc; }
    set rpc(val) { this._listViewEl.rpc = val; }

    get rpcLoadArgs() { return this._listViewEl.rpcLoadArgs; }
    set rpcLoadArgs(val) { this._listViewEl.rpcLoadArgs = val; }

    get rpcLoadFn() { return this._listViewEl.rpcLoadFn; }
    set rpcLoadFn(val) { this._listViewEl.rpcLoadFn = val; }

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

    get spinButton() { return this._spinButtonEl; }

    get spinButtonHide() { return !this._spinButtonEl.visible; }
    set spinButtonHide(val) { this._spinButtonEl.visible = !val; }

    get spinButtonIconChar() { return this._spinButtonEl.iconChar; }
    set spinButtonIconChar(val) { this._spinButtonEl.iconChar = val; }

    get spinButtonIconCls() { return this._spinButtonEl.iconCls; }
    set spinButtonIconCls(val) { this._spinButtonEl.iconCls = val; }

    get spinButtonIconColor() { return this._spinButtonEl.iconColor; }
    set spinButtonIconColor(val) { this._spinButtonEl.iconColor = val; }

    get spinButtonIconMap() { return this._spinButtonEl.iconMap; }
    set spinButtonIconMap(val) { this._spinButtonEl.iconMap = val; }

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
            // store leeren, wenn value gelöscht wird.
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

    get valueField() { return this._listViewEl.valueField; }
    set valueField(val) { this._listViewEl.valueField = val; }

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

    /**
     * Füllt das Combo mit Daten vom Server
     * TODO: Funktion sollte folgende Argumente haben: load(args=null, superCall=false)
     * TODO: Die Anzahl getippten Zeichen sollten vorher gezählt werden.
     * @param {Array} args Array mit Argumenten, die an die remoteFn übergeben werden
     * @param {Boolean} forceLoad true, wenn immer geladen werden soll
     * @param {String} query Suchstring
     * @returns {undefined}
     */
    load(args=null, forceLoad=false, query=null) {
        args = kijs.isObject(args) ? args : {};
        args.remoteSort = !!this._remoteSort;
        args.value = this.value;
        args.query = null;
        
        if (this._remoteSort) {
            args.query = kijs.toString(query);

            // Wenn eine Eingabe erfolgt, oder bei forceLoad, laden
            if (forceLoad || args.query.length >= this._minChars) {
                this._listViewEl.load(args).then((e) => {
                    let config = e.responseData.config ?? {};
                    
                    // Nach dem Laden das value neu setzen,
                    // damit die caption erscheint (ohne change-event)
                    if (query === null && this._isValueInStore(this.value)) {
                        this.value = this._value;

                    // value mit dem RPC zurückgeben (mit change-event)
                    } else if (query === null && kijs.isDefined(config.value) && config.value !== null && this._isValueInStore(config.value)) {
                        if (kijs.toString(config.value) !== kijs.toString(this.value)) {
                            this.value = config.value;
                        }

                    }
                });

            } else {
                this._listViewEl.data = [];
                this._addPlaceholder(kijs.getText('Schreiben Sie mindestens %1 Zeichen, um die Suche zu starten', '', this._minChars) + '.');
            }

        } else if (!this._firstLoaded || forceLoad) {
            // alle Datensätze laden
            this._listViewEl.load(args)
                .then((e) => {
                    let config = e.responseData.config ?? {};
            
                    // Nach dem Laden das value neu setzen,
                    // damit das Label erscheint (ohne change-event)
                    if (query === null && this._isValueInStore(this.value)) {
                        this.value = this._value;

                    // value mit dem RPC zurückgeben (mit change-event)
                    } else if (query === null && kijs.isDefined(config.value) && config.value !== null && this._isValueInStore(config.value)) {
                        if (kijs.toString(config.value) !== kijs.toString(this.value)) {
                            this.value = config.value;
                        }
                    }

                    this.validate(true);
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

        // Buttons-Container rendern (kijs.gui.Dom)
        this._buttonsDom.renderTo(this._contentDom.node, this._inputWrapperDom.node, 'after');
        
        // Spin Button rendern (kijs.gui.Button)
        this._spinButtonEl.renderTo(this._buttonsDom.node);

        // Event afterRender auslösen
        if (!superCall) {
            this.raiseEvent('afterRender');
        }
    }

    // overwrite
    unrender(superCall) {
        // timer abbrechen
        if (this._keyUpDeferId) {
            window.clearTimeout(this._keyUpDeferId);
            this._keyUpDeferId = null;
        }

        // Event auslösen.
        if (!superCall) {
            this.raiseEvent('unrender');
        }

        this._inputDom.unrender();
        this._buttonsDom.unrender();
        
        if (this._spinBoxEl) {
            this._spinBoxEl.unrender();
        }
        
        super.unrender(true);
    }


    // PROTECTED
    /**
     * Fügt dem listView einen Platzhalter hinzu.
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
     * Prüft, ob ein value im Store ist.
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
     * Funktion wird vom KeyDown verzögert ausgeführt.
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

            // Es wurde eine Übereinstimmung gefunden
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

            // Filter des Dropdowns zurücksetzen
            this._listViewEl.applyFilters(null);
        }
    }

    _setScrollPositionToSelection() {
        let sel = this._listViewEl.getSelected();
        if (kijs.isObject(sel) && (sel instanceof kijs.gui.dataView.Element)) {
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
    _validationRules(value, ignoreEmpty) {
        if (ignoreEmpty && kijs.isEmpty(value)) {
            return;
        }

        // Eingabe erforderlich
        if (this._required) {
            if (kijs.isEmpty(value)) {
                this._errors.push(kijs.getText('Dieses Feld darf nicht leer sein'));
            }
        }

        // Wert muss in der Liste vorhanden sein.
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


    // PRIVATE
    // LISTENERS
    #onAfterFirstRenderTo(e) {
        // forceLoad, wenn value vorhanden ist (damit label geladen wird)
        this.load(null, this.value !== '');
    }

    #onInputDomBlur() {
        // blur nur ausführen, wenn Trigger nicht offen ist und Feld kein Focus hat
        kijs.defer(function() {
            if (this._spinBoxEl && this._inputDom && !this._spinBoxEl.isRendered && !this._inputDom.hasFocus) {
               this.raiseEvent('blur');
            }
        }, 200, this);
    }

    #onInputDomChange(e) {
        // change event nicht berücksichtigen, wenn die spinbox
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
            this.raiseEvent('input', { value: this.value, oldValue: oldVal });
            this.raiseEvent('change', { value: this.value, oldValue: oldVal });
        }
    }

    #onInputDomInput(e) {
        this._spinBoxEl.show();
    }

    #onInputDomKeyDown(e) {
        // event beim listView ausführen, damit selektion geändert werden kann.
        if (this._listViewEl.getSelected()) {
            this._listViewEl.handleKeyDown(e.nodeEvent);

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

            if (dataViewElement && (dataViewElement instanceof kijs.gui.dataView.Element)) {
                let newVal = dataViewElement.dataRow[this.valueField],
                    oldVal = this.value,
                    changed = newVal !== this.value;
                this.value = newVal;

                if (changed) {
                    this.raiseEvent('change', {value: this.value, oldValue: oldVal});
                }
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

    #onInputDomKeyUp(e) {
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
        if (this._keyUpDeferId) {
            window.clearTimeout(this._keyUpDeferId);
            this._keyUpDeferId = null;
        }

        // neues Defer schreiben
        this._keyUpDeferId = kijs.defer(function() {
            if (this._remoteSort) {
                this.load(null, false, this._inputDom.nodeAttributeGet('value'));

            } else {
                this._setProposal(e.nodeEvent.key);
            }
        }, this._remoteSort ? 1000 : 500, this);
    }

    #onListViewElAfterLoad(e) {
        if (!this._remoteSort) {
            this.value = this._value;
        }

        if (this._selectFirst) {
            this.value = this._listViewEl.data[0].value;
        }

        // Spinbox Nachricht anhängen
        if (e.responseData && e.responseData.spinboxMessage) {
            this._addPlaceholder(e.responseData.spinboxMessage);
        }
    }

    #onListViewElClick(e) {
        this._spinBoxEl.close();

        if (this.value !== this._listViewEl.value) {
            let oldVal = this.value;
            this.value = this._listViewEl.value;

            // validieren
            this.validate();

            this.raiseEvent('input', {value: this.value, oldValue: oldVal});
            this.raiseEvent('change', {value: this.value, oldValue: oldVal});
        }
    }

    #onSpinBoxElClick() {
        this._inputDom.focus();
    }

    #onSpinBoxElClose() {
        this._inputDom.focus();
        this.#onInputDomBlur();
    }

    #onSpinBoxElShow() {
        this._setScrollPositionToSelection();
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
        
        this._listViewEl.applyFilters();

        if (this._listViewEl.data.length === 0 && this._remoteSort) {
            this._addPlaceholder(kijs.getText('Schreiben Sie mindestens %1 Zeichen, um die Suche zu starten', '', this._minChars) + '.');
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
        if (this._spinBoxEl) {
            this._spinBoxEl.destruct();
        }
        if (this._buttonsDom) {
            this._buttonsDom.destruct();
        }
        if (this._spinButtonEl) {
            this._spinButtonEl.destruct();
        }
        
        // Variablen (Objekte/Arrays) leeren
        this._inputDom = null;
        this._listViewEl = null;
        this._oldValue = null;
        this._spinBoxEl = null;
        this._buttonsDom = null;
        this._spinButtonEl = null;

        // Basisklasse entladen
        super.destruct(true);
    }

};
