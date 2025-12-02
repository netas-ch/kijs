/* global kijs, this */


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

        this._value = null;             // Wert
        this._valueRow = null;          // Ganzer Datensatz zum value

        this._allowNewValues = false;   // Dürfen auch Werte eingegeben werden,
                                        // die in der Liste nicht vorhanden sind?
                                        
        this._displayLimit = 30;        // Max Anzahl Datensätze, die im ListView
                                        // angezeigt werden.

        this._queryOperator = 'BEGIN';  // Art des Vergleichs beim Tippen: 'BEGIN' oder 'PART'

        this._enableRemoteFiltering = false; // Soll beim Tippen auf dem Server gefiltert werden?
        this._remoteFilteringDefer = 200;    // Delay zwischen dem Tippen und dem RPC bei remoteFiltering
        this._remoteFilteringDeferId = null;

        this._valueSource = 'listView'; // Von wo soll der Wert beim Schliessen der SpinBox geholt werden?
                                        // - 'listView', 'listView force' // Wert kommt vom ListView
                                        // - 'text', 'text force'         // Wert kommt vom Textfeld
                                        // - 'cancel'                     // Wert zurücksetzen
                                        //                      --> 'force' = Wert zwingend übernehmen

        this._whileTyping = false;      // Wird gerade ein Buchstabe geschrieben?
        this._lastRpcValue = null;      // letzter Wert der via RPC an den Server
                                        // geschickt wurde. Wird intern verwendet
                                        // damit nicht mehrere gleiche Requests
                                        // gesendet werden, wenn die Antwort keine
                                        // valueRow enthält

        this._data = [];                // Recordset mit Daten

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

        this._writeForMoreEl = new kijs.gui.Element({
            cls: 'kijs-field-combo-writeForMore',
            html: kijs.getText('Schreiben für Daten') + '...'
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
            target: this,
            targetDomProperty: 'inputWrapperDom',
            ownerNodes: [this._inputWrapperDom, this._spinButtonEl.dom],
            cls: 'kijs-field-combo-spinbox',
            scrollableY: 'auto',
            elements: [
                this._listViewEl,
                this._writeForMoreEl
            ],
            style: {
                maxHeight: '210px'
            }
        });

        this._dom.clsAdd('kijs-field-combo');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            spinButtonCls: 'kijs-inline',
            autocomplete: false,
            scrollableY: 'auto',
            selectType: 'single'
        });

       // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            allowNewValues: true,                       // Dürfen auch Werte eingegeben werden,
                                                        // die in der Liste nicht vorhanden sind?

            autocomplete: { target: 'autocomplete' },   // De-/aktiviert die Browser-Vorschläge
            inputMode: { target: 'inputMode' },

            displayLimit: { target: 'displayLimit' },
            queryOperator: { target: 'queryOperator' },
            enableRemoteFiltering: { target: 'enableRemoteFiltering' }, // Sollen bim Tippen RPC-Requests gemacht werden?
            remoteFilteringDefer:  { target: 'remoteFilteringDefer' }, // Verzögerung beim Tippen zwischen des Requests

            selectType: { target: 'selectType', context: this._listViewEl },

            valueField: { target: 'valueField', context: this._listViewEl },
            displayTextField: { target: 'displayTextField', context: this._listViewEl },
            displayTextDisplayType: { target: 'displayTextDisplayType', context: this._listViewEl },

            clsField: { target: 'clsField', context: this._listViewEl },
            iconMapField: { target: 'iconMapField', context: this._listViewEl },
            iconCharField: { target: 'iconCharField', context: this._listViewEl },
            iconClsField: { target: 'iconClsField', context: this._listViewEl },
            iconAnimationClsField: { target: 'iconAnimationClsField', context: this._listViewEl },
            iconColorField: { target: 'iconColorField', context: this._listViewEl },
            tooltipField: { target: 'tooltipField', context: this._listViewEl },
            disabledField: { target: 'disabledField', context: this._listViewEl },  // Feldnamen für disabled (optional)
           
            data: { prio: 80, target: 'data' },
            valueRow: { prio: 199, target: 'valueRow' },   // Datensatz zum value. Ist nötig,
                                                           // wenn der value-Datensatz in data
                                                           // fehlt. Z.B. weil deaktiviert
            value: { prio: 200, target: 'value' },

            spinButtonCls: { fn: 'function', target: this._spinButtonEl.dom.clsAdd, context: this._spinButtonEl.dom },
            spinButtonHide: { target: 'spinButtonHide' },
            spinButtonIconChar: { target: 'iconChar', context: this._spinButtonEl },
            spinButtonIconCls: { target: 'iconCls', context: this._spinButtonEl },
            spinButtonIconColor: { target: 'iconColor', context: this._spinButtonEl },
            spinButtonIconMap: { target: 'iconMap', context: this._spinButtonEl },

            virtualKeyboardPolicy: { target: 'virtualKeyboardPolicy' }
        });

        // Event-Weiterleitungen von this._inputDom
        this._eventForwardsAdd('focus', this._inputDom);
        this._eventForwardsAdd('input', this._inputDom);

        this._eventForwardsRemove('enterPress', this._dom);
        this._eventForwardsRemove('enterEscPress', this._dom);
        this._eventForwardsRemove('escPress', this._dom);
        this._eventForwardsAdd('enterPress', this._inputDom);
        this._eventForwardsAdd('enterEscPress', this._inputDom);
        this._eventForwardsAdd('escPress', this._inputDom);

        // Listeners
        this._inputDom.on('blur', this.#onInputDomBlur, this);
        this._inputDom.on('input', this.#onInputDomInput, this);
        this._inputDom.on('keyDown', this.#onInputDomKeyDown, this);

        this._spinBoxEl.on('click', this.#onSpinBoxElClick, this);
        this._spinBoxEl.on('close', this.#onSpinBoxElClose, this);
        this._spinBoxEl.on('show', this.#onSpinBoxElShow, this);

        this._listViewEl.on('elementClick', this.#onListViewElClick, this);

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

        // De-/aktiviert die Browser-Vorschläge
        this._inputDom.nodeAttributeSet('autocomplete', value);
    }

    get data() {
        return this._data;
    }
    set data(val) {
        this._data = val;

        // Evtl. valueRow aktualisieren
        if (!kijs.isEmpty(this._value)) {
            this._valueRow = this._getValueRowFromValue(this._value);
        }

        // Wert anzeigen/selektieren
        this._listViewEl.value = this._value;

        // Daten ins ListView übernehmen
        this._applyFilterData();
    }

    get displayLimit() { return this._displayLimit; }
    set displayLimit(val) { this._displayLimit = parseInt(val); }

    // Gibt den aktuellen displayText zurück
    get displayText() {
        return kijs.toString(this._inputDom.nodeAttributeGet('value'));
    }

    get displayTextField() { return this._listViewEl.displayTextField; }
    set displayTextField(val) { this._listViewEl.displayTextField = val; }

    get enableRemoteFiltering() { return this._enableRemoteFiltering; }
    set enableRemoteFiltering(val) { this._enableRemoteFiltering = !!val; }

    // Gibt die row zum aktuellen Wert zurück
    get valueRow() {
        return this._valueRow;
    }
    set valueRow(val) {
        this._valueRow = val;

        let displayText = this._getDisplayTextFromValue();
        this._inputDom.nodeAttributeSet('value', displayText);
    }

    // overwrite
    get hasFocus() { return this._inputDom.hasFocus; }

    // overwrite
    get isEmpty() { return kijs.isEmpty(this._value); }

    get inputDom() { return this._inputDom; }

    get inputMode() { return this._inputDom.nodeAttributeGet('inputMode'); }
    set inputMode(val) { this._inputDom.nodeAttributeSet('inputMode', val); }

    get queryOperator() { return this._queryOperator; }
    set queryOperator(val) {
        if (!kijs.Array.contains(['BEGIN', 'PART'], val)) {
            throw new kijs.Error(`Ungültiger "queryOperator".`);
        }
        this._queryOperator = val;
    }

    // overwrite
    get readOnly() { return super.readOnly; }
    set readOnly(val) {
        super.readOnly = !!val;
        this._listViewEl.disabled = !!val;
        this._inputDom.nodeAttributeSet('readOnly', !!val);
    }

    get remoteFilteringDefer() { return this._remoteFilteringDefer; }
    set remoteFilteringDefer(val) {
        this._remoteFilteringDefer = parseInt(val);
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
        this._value = val;
        this._valueRow = this._getValueRowFromValue(val);

        this._listViewEl.value = val;

        // Daten ins ListView übernehmen
        this._applyFilterData();

        // displayText aktualisieren
        let displayText = this._getDisplayTextFromValue();

        this._inputDom.nodeAttributeSet('value', displayText);
        this._updateClearButtonVisibility();
    }

    get valueField() { return this._listViewEl.valueField; }
    set valueField(val) { this._listViewEl.valueField = val; }

    /**
     * Die virtual keyboard policy bestimmt, ob beim focus die virtuelle
     * Tastatur geöffnet wird ('auto', default) oder nicht ('manual'). (Nur Mobile, Chrome)
     */
    get virtualKeyboardPolicy() { 
        return this._inputDom.nodeAttributeGet('virtualKeyboardPolicy');
    }
    set virtualKeyboardPolicy(val) {
        this._inputDom.nodeAttributeSet('virtualKeyboardPolicy', val);
    }



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
     * @param {Object|Null} [args] Objekt mit Argumenten, die an die remoteFn übergeben werden
     * @param {Boolean} [superCall=false]
     * @returns {Promise}
     */
    load(args, superCall=false) {
        return new Promise((resolve, reject) => {

            if (kijs.isEmpty(args)) {
                args = {};
            }

            // Standard-Argumente für den Request
            // -----------------------------------
            // Abfragen der valueRow
            if (!kijs.isEmpty(args.value)) {
                // Wird das 1. mal geladen?
                if (kijs.isEmpty(args.initialLoad)) {
                    args.initialLoad = false;
                }

            // normaler Request
            } else {
                // Wird das 1. mal geladen?
                if (kijs.isEmpty(args.initialLoad)) {
                    args.initialLoad = true;

                    // evtl. auch die valueRow abfragen
                    if (!kijs.isEmpty(this._value)) {
                        args.value = this._value;
                    }
                }

                // Serverseitiges Filtern während dem Tippen
                if (this._enableRemoteFiltering) {
                    // Suchbegriff, nach dem auf dem Server gefiltert werden soll
                    if (kijs.isEmpty(args.query)) {
                        args.query = '';
                    }

                    // Art des Vergleichs 'BEGIN' oder 'PART'
                    if (kijs.isEmpty(args.queryOperator)) {
                        args.queryOperator = this._queryOperator;
                    }

                    // Das query Limit sagt dem Server wie viele Datensätze max
                    // zurückgegeben werden dürfen.
                    // Wenn eins mehr zurückgeben wird als mit displayLimit definiert
                    // ist, wissen wir, dass es noch mehr Datensätze als die angezeigten
                    // gibt, denn dann wird writeForMoreEl angezeigt.
                    args.queryLimit = this._displayLimit + 1;

                }

            }


            // Lademaske auf SpinBox anzeigen
            // -----------------------------------
            if (this._spinBoxEl) {
                this._spinBoxEl.waitMaskAdd();
            }


            // Laden
            // -----------------------------------
            super.load(args, true).then((e) => {
                if (e.response && e.response.config && 
                        !kijs.isEmpty(e.response.config.valueRow)) {
                    this._lastRpcValue = null;
                }

                // Lademaske auf SpinBox entfernen
                if (this._spinBoxEl) {
                    this._spinBoxEl.waitMaskRemove();
                }

                // 'afterLoad' auslösen
                if (!superCall) {
                    this.raiseEvent('afterLoad', Object.assign({}, e));
                }

                // Promise ausführen
                resolve(e);

            }).catch((ex) => {
                // Lademaske auf SpinBox entfernen
                if (this._spinBoxEl) {
                    this._spinBoxEl.waitMaskRemove();
                }

                reject(ex);
            });
        });
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

        // timer abbrechen
        if (this._remoteFilteringDeferId) {
            window.clearTimeout(this._remoteFilteringDeferId);
            this._remoteFilteringDeferId = null;
        }

        if (this._inputDom) {
            this._inputDom.unrender();
        }
        if (this._spinButtonEl) {
            this._spinButtonEl.unrender();
        }
        if (this._listViewEl) {
            this._listViewEl.unrender();
        }
        if (this._writeForMoreEl) {
            this._writeForMoreEl.unrender();
        }
        if (this._spinBoxEl) {
            this._spinBoxEl.unrender();
        }

        super.unrender(true);
    }


    // PROTECTED
    /**
     * Weist this._data dem ListView zu und berücksichtigt dabei den eingegebenen
     * Text und das displayLimit
     * @param {String} text DisplayText im Input Feld, nachdem gefiltert wird
     * @returns {undefined}
     */
    _applyFilterData(text='') {
        let data = this._data;

        // Falls nicht getippt wird, nehmen wir den displayText des aktuellen Werts
        if (kijs.isEmpty(text) && !this._whileTyping) {
            text = this._getDisplayTextFromValue();
        }

        let visibleWriteForMoreEl = !!this._enableRemoteFiltering ||
                data.length > this._displayLimit;


        // Lokal Filtern
        let doFiltering = false;

        // Während des Tippens...
        if (this._whileTyping) {
            // Wenn lokal gefiltert werden soll
            if (!this._enableRemoteFiltering) {
                doFiltering = !this._enableRemoteFiltering;
            }

        // Wenn nicht getippt wird (beim zuweisen von data)
        } else {
            // Wenn mehr Daten vorhanden sind als displayLimit,
            // damit der ausgewählte Wert auch in der Liste erscheint
            if (data.length > this._displayLimit) {
                doFiltering = true;
            }

        }
        
        // Evtl. Daten filtern
        if (doFiltering) {
            // Operator: 'BEGIN' oder 'PART'
            data = kijs.Data.filter(data, {
                field: this._listViewEl.displayTextField,
                value: text,
                operator: this._queryOperator
            });
        }

        // displayLimit berücksichtigen
        if (!kijs.isEmpty(this._displayLimit) && !kijs.isEmpty(data)) {
            if (data.length > this._displayLimit) {
                data = kijs.Array.slice(data, 0, this._displayLimit);
            }
        }

        // Daten zuweisen
        this._listViewEl.data = data;

        // Evtl. writeForMoreEl anzeigen
        this._writeForMoreEl.visible = visibleWriteForMoreEl;

        // Falls kein Element selektiert ist: 1. Element selektieren, dass nicht deaktiviert ist
        this._selectFirstEnabledElement();

        // Falls nicht getippt wird: displayText aktualisieren
        if (!this._whileTyping) {
            this._inputDom.nodeAttributeSet('value', text);
        }
        this._whileTyping = false;
    }

    /**
     * DisplayText zum aktuellen value ermitteln
     * @returns {String}
     */
    _getDisplayTextFromValue() {
        let displayText = '';

        if (kijs.isEmpty(this._value)) {
            return '';
        }

        // valueRow ermitteln
        let valueRow = this._getValueRowFromValue(this._value);

        if (!kijs.isEmpty(valueRow)) {
            displayText = valueRow[this._listViewEl.displayTextField];
        }

        // Falls kein displayText ermittelt werden konnte, wird der value angezeigt
        if (kijs.isEmpty(displayText)) {
            displayText = this._value;
        }

        return kijs.toString(displayText);
    }

    /**
     * valueRow zu einem Wert ermitteln
     * @param {String|Number|Null} val
     * @returns {Array}
     */
    _getValueRowFromValue(val) {
        if (kijs.isEmpty(val)) {
            return {};
        }

        // Zuerst in this._valueRow suchen
        if (!kijs.isEmpty(this._valueRow)) {
            if (this._valueRow[this._listViewEl.valueField] === val) {
                return this._valueRow;
            }
        }

        // Sonst in _data suchen
        for (let i=0; i<this._data.length; i++) {
            if (this._data[i][this._listViewEl.valueField] === val) {
                return this._data[i];
            }
        }

        // Zuerst in this._valueRow suchen, ohne Unterscheidung der Gross-/Kleinschreibung
        if (!kijs.isEmpty(this._valueRow)) {
            if ( (this._valueRow[this._listViewEl.valueField]+'').toLowerCase() === (val+'').toLowerCase() ) {
                return this._valueRow;
            }
        }

        // Sonst in _data suchen, ohne Unterscheidung der Gross-/Kleinschreibung
        for (let i=0; i<this._data.length; i++) {
            if ( (this._data[i][this._listViewEl.valueField]+'').toLowerCase() === (val+'').toLowerCase() ) {
                return this._data[i];
            }
        }

        // Sonst, wenn remoteFiltering:true versuchen die valueRow per RPC zu holen
        if (!kijs.isEmpty(this._rpcLoadFn)) {
            // Sicherstellen, dass nicht mehrmals die gleiche Anfrage geschickt wird.
            if (kijs.isEmpty(this._lastRpcValue) || this._lastRpcValue !== val) {

                this._lastRpcValue = val;

                let args = {
                    initialLoad: false,
                    value: this._value
                };
                this.load(args);
            }
        }

        return {};
    }


    // Falls kein Element selektiert ist: 1. Element selektieren, dass nicht deaktiviert ist
    _selectFirstEnabledElement() {
        if (kijs.isEmpty(this._listViewEl.getSelected())) {
            kijs.Array.each(this._listViewEl.elements, function(el) {
                if (!el.disabled) {
                    this._listViewEl.select(el, false, false);

                    // Hinscrollen
                    this._listViewEl.scrollToFocus();
                    
                    return false;
                }
            }, this);
        }
    }


    // PRIVATE
    // LISTENERS
    #onInputDomBlur() {
        // blur nur ausführen, wenn Trigger nicht offen ist und Feld kein Focus hat
        kijs.defer(function() {
            if (this._spinBoxEl && this._inputDom && !this._spinBoxEl.isRendered && !this._inputDom.hasFocus) {
               this.raiseEvent('blur');
            }
        }, 200, this);
    }

    #onInputDomInput(e) {
        // Es wird ein Text eingegeben
        this._whileTyping = true;

        // Eingegebener Text ermitteln
        let text = kijs.toString(this._inputDom.nodeAttributeGet('value'));

        // SpinBox anzeigen
        this._spinBoxEl.show();

        // bei enableRemoteFiltering Argumente an den Server senden
        // das ganze verögert machen, damit nicht zu viele requests gesendet werden
        if (this._enableRemoteFiltering) {
            // timer abbrechen
            if (this._remoteFilteringDeferId) {
                window.clearTimeout(this._remoteFilteringDeferId);
                this._remoteFilteringDeferId = null;
            }
            // Request verzögert starten
            this._remoteFilteringDeferId = kijs.defer(function() {
                let args = {
                    initialLoad: false,
                    query: text
                };
                
                this.load(args);
            }, this._remoteFilteringDefer, this);

        // Sonst alles lokal machen
        } else {
            // Daten an ListView übergeben
            this._applyFilterData(text);

        }
    }

    #onInputDomKeyDown(e) {
        switch (e.nodeEvent.key) {

            // Enter: Ausgewählten Datensatz übernehmen und SpinBox schliessen
            case 'Enter':
            case 'Tab':
                if (this._valueSource === 'text') {
                    this._valueSource = 'text force';
                }
                if (this._valueSource === 'listView') {
                    this._valueSource = 'listView force';
                }

                // SpinBox schliessen
                this._spinBoxEl.close();

                // event stoppen
                e.nodeEvent.stopPropagation();
                break;

            // Esc: SpinBox schliessen
            case 'Escape':
                this._valueSource = 'cancel';

                // SpinBox schliessen
                this._spinBoxEl.close();

                // event stoppen
                e.nodeEvent.stopPropagation();
                break;

            // ArrowUp und ArrowDown an ListView weitergeben
            case 'ArrowUp':
            case 'ArrowDown':
                // Event weitergeben
                if (this._spinBoxEl.isRendered) {
                    this._valueSource = 'listView';
                    this._listViewEl.handleKeyDown(e.nodeEvent);
                }
                break;

            default:
                this._valueSource = 'text';
                break;
                
        }
    }

    #onListViewElClick(e) {
        if (!e.raiseElement.disabled) {
            this._valueSource = 'listView force';

            // SpinBox schliessen
            this._spinBoxEl.close();
        }
    }

    #onSpinBoxElClick() {
        this._inputDom.focus();
    }

    #onSpinBoxElClose() {
        let oldVal = this._value;

        switch (this._valueSource) {
            case 'text':
            case 'text force':
                const force = this._valueSource === 'text force';

                // Eingegebener Text ermitteln
                const text = kijs.toString(this._inputDom.nodeAttributeGet('value'));

                // Leerer Wert immer übernehmen
                if (kijs.isEmpty(text)) {
                    this.value = null;

                // Wert aus ListView übernehmen, wenn vorhanden
                } else if (!kijs.isEmpty(this._listViewEl.data)) {
                    this.value = this._listViewEl.value;

                // Sonst den bestehenden Wert belassen
                } else {
                    this.value = this._value;

                }

                if (!kijs.isEmpty(text)) {
                    // Entspricht der eingegebene Text einem Wert in der Liste?
                    let isInData = false;
                    let displayText = this._getDisplayTextFromValue();
                    isInData = (text+'').toLowerCase() === (displayText+'').toLowerCase();

                    if (!force) {
                        if (!isInData) {
                            this.value = oldVal;
                        }
                    }

                    // Nicht vorhandene Werte sind erlaubt
                    if (!isInData && this._allowNewValues) {
                        let displayText = this._getDisplayTextFromValue();

                        // Wert ist nicht in der Liste (Neuer Wert)
                        if (text !== displayText) {
                            // Wert übernehmen
                            this.value = text;
                        }

                    }
                }

                break;

            case 'listView force':
                this.value = this._listViewEl.value;
                break;

            case 'listView':
            case 'cancel':
                this.value = oldVal;
                break;

        }

        // evtl. events auslösen
        if (this._value !== oldVal) {
            this.raiseEvent('input', { value: this._value, oldValue: oldVal });
            this.raiseEvent('change', { value: this._value, oldValue: oldVal });
        }

        this._inputDom.focus();

        this.validate();
    }

    #onSpinBoxElShow() {
        kijs.defer(function() {
            if (this._listViewEl) {

                // Falls kein Element selektiert ist: 1. Element selektieren, dass nicht deaktiviert ist
                this._selectFirstEnabledElement();
            }
        }, 50, this);
    }

    #onSpinButtonClick(e) {
        if (this.disabled || this.readOnly) {
             return;
        }
        if (this._spinBoxEl) {
            if (this._spinBoxEl.isRendered) {
                this._spinBoxEl.close();
            } else {
                this._valueSource = 'listView';
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
        if (this._spinButtonEl) {
            this._spinButtonEl.destruct();
        }
        if (this._listViewEl) {
            this._listViewEl.destruct();
        }
        if (this._writeForMoreEl) {
            this._writeForMoreEl.destruct();
        }
        if (this._spinBoxEl) {
            this._spinBoxEl.destruct();
        }

        // Variablen (Objekte/Arrays) leeren
        this._inputDom = null;
        this._spinButtonEl = null;
        this._listViewEl = null;
        this._writeForMoreEl = null;
        this._spinBoxEl = null;

        this._valueRow = null;

        // Basisklasse entladen
        super.destruct(true);
    }

};
