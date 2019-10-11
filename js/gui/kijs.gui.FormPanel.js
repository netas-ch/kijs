/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.FormPanel
// --------------------------------------------------------------
kijs.gui.FormPanel = class kijs_gui_FormPanel extends kijs.gui.Panel {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super();

        this._data = {};
        this._facadeFnLoad = null;  // Name der Facade-Funktion. Bsp: 'address.load'
        this._facadeFnSave = null;  // Name der Facade-Funktion. Bsp: 'address.save'
        this._fields = null;        // Array mit kijs.gui.field.Fields-Elementen
        this._rpc = null;           // Instanz von kijs.gui.Rpc
        this._rpcArgs = {};         // Standard RPC-Argumente
        this._errorMsg = kijs.getText('Es wurden noch nicht alle Felder richtig ausgefüllt.');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            autoLoad: { target: 'autoLoad' },   // Soll nach dem ersten Rendern automatisch die Load-Funktion aufgerufen werden?
            data: { target: 'data', prio: 2000}, // Recordset-Row-Objekt {id:1, caption:'Wert 1'}
            errorMsg: true,                     // Meldung, wenn nicht ausgefüllte Felder vorhanden sind. null wenn keine Meldung.
            facadeFnLoad: true,
            facadeFnSave: true,
            rpc: { target: 'rpc' },
            rpcArgs: true
        });

        // Listeners auf Kindelemente
        this.on('add', this._observChilds, this);

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

    get data() {
        let data = {};
        // Evtl. Daten aus Formular holen
        if (!kijs.isEmpty(this._fields)) {
            kijs.Array.each(this._fields, function(field) {
                if (field.submitValue !== false) {
                    data[field.name] = field.value;
                } else {
                    // Wert soll nicht übermittelt werden.
                    delete this._data[field.name];
                }
            }, this);
        }
        // Bestehendes Recordset mit Daten aus Formular ergänzen
        Object.assign(this._data, data);
        return this._data;
    }
    set data(val) {
        this._data = val;

        if (this._fields === null) {
            this.searchFields();
        }

        // Evtl. Daten in Formular einfüllen
        if (!kijs.isEmpty(this._fields)) {
            kijs.Array.each(this._fields, function(field) {
                if (field.name in this._data) {
                    field.value = this._data[field.name];
                    field.isDirty = false;
                }
            }, this);
        }
    }
    
    get disabled(){
        if (kijs.isEmpty(this.fields)){
            this.searchFields();
        }

        let disabled = 0;
        let notDisabled = 0;
        kijs.Array.each(this.fields, function(element) {
            if (element instanceof kijs.gui.field.Field) {
                if (element.disabled){
                    disabled ++;
                } else {
                    notDisabled ++;
                }
            }
        }, this);
        if (disabled > (this.fields.length / 2)){
            return true;
        } else {
            return false;
        }
    }
    
    set disabled(value){
        if (kijs.isEmpty(this.fields)){
            this.searchFields();
        }
        
        kijs.Array.each(this.fields, function(element) {
            if (element instanceof kijs.gui.field.Field) {
                element.disabled = value;
            }
        }, this);
    }

    get fields() { return this._fields; }

    get facadeFnLoad() { return this._facadeFnLoad; }
    set facadeFnLoad(val) { this._facadeFnLoad = val; }

    get facadeFnSave() { return this._facadeFnSave; }
    set facadeFnSave(val) { this._facadeFnSave = val; }

    get isDirty() {
        if (kijs.isEmpty(this._fields)) {
            this.searchFields();
        }

        for (let i=0; i<this._fields.length; i++) {
            if (this._fields[i].isDirty) {
                return true;
            }
        }

        return false;
    }
    set isDirty(val) {
        if (kijs.isEmpty(this._fields)) {
            this.searchFields();
        }

        for (let i=0; i<this._fields.length; i++) {
            this._fields[i].isDirty = !!val;
        }
    }
    
    get readOnly(){
        if (kijs.isEmpty(this.fields)){
            this.searchFields();
        }

        let readOnly = 0;
        kijs.Array.each(this.fields, function(element) {
            if (element instanceof kijs.gui.field.Field) {
                if (element.readOnly){
                    readOnly ++;
                }
            }
        }, this);
        if (readOnly > (this.fields.length / 2)){
            return true;
        } else {
            return false;
        }
    }
    
    set readOnly(value){
        if (kijs.isEmpty(this.fields)){
            this.searchFields();
        }
        
        kijs.Array.each(this.fields, function(element) {
            if (element instanceof kijs.gui.field.Field) {
                element.readOnly = value;
            }
        }, this);
    }
    
    get rpc() { return this._rpc;}
    set rpc(val) {
        if (val instanceof kijs.gui.Rpc) {
            this._rpc = val;

        } else if (kijs.isString(val)) {
            if (this._rpc) {
                this._rpc.url = val;
            } else {
                this._rpc = new kijs.gui.Rpc({
                    url: val
                });
            }

        } else {
            throw new kijs.Error(`Unkown format on config "rpc"`);

        }
    }


    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------

    /**
     * Löscht allen inhalt aus dem Formular
     * @returns {undefined}
     */
    clear() {
        if (kijs.isEmpty(this._fields)) {
            this.searchFields();
        }

        for (let i=0; i<this._fields.length; i++) {
            this._fields[i].value = null;
        }

        this._data = {};

        this.resetValidation();
    }

    /**
     * Lädt das Formular mit Daten vom Server
     * @param {Object|null} args
     * @param {Boolean} [searchFields=false] Sollen die Formularfelder neu gesucht werden?
     * @param {Boolean} [resetValidation=false] Sollen die Formularfelder als invalid markiert werden?
     * @returns {Promise}
     */
    load(args=null, searchFields=false, resetValidation=false) {
        return new Promise((resolve, reject) => {
            if (this._facadeFnLoad) {

                if (!kijs.isObject(args)) {
                    args = {};
                }
                args = Object.assign(args, this._rpcArgs);

                this._rpc.do(this._facadeFnLoad, args, function(response) {

                    // Formular
                    if (response.form) {
                        this.removeAll();
                        this.add(response.form);
                    }

                    if (searchFields || response.form || kijs.isEmpty(this._fields)) {
                        this.searchFields();
                    }

                    // Formulardaten in Formular einfüllen
                    if (response.formData) {
                        this.data = response.formData;
                    }

                    // Validierung zurücksetzen?
                    if (resetValidation) {
                        this.resetValidation();
                    }

                    // 'Dirty' zurücksetzen
                    this.isDirty = false;

                    // load event
                    this.raiseEvent('afterLoad', {response: response});

                    // promise ausführen
                    resolve(response);
                }, this, true, this, 'dom', false, this._onRpcBeforeMessages);
            }
        });
    }

    /**
     * Setzt den Feldwert zurück.
     * @returns {undefined}
     */
    reset() {
        if (kijs.isEmpty(this._fields)) {
            this.searchFields();
        }

        for (let i=0; i<this._fields.length; i++) {
            this._fields[i].reset();
        }

        this.raiseEvent('change');
    }

    /**
     * Setzt die Validierung zurück.
     * @returns {undefined}
     */
    resetValidation() {
        if (kijs.isEmpty(this._fields)) {
            this.searchFields();
        }

        for (let i=0; i<this._fields.length; i++) {
            if (kijs.isFunction(this._fields[i].markInvalid)) {
                this._fields[i].markInvalid();
            }
        }
    }

    /**
     * Sendet die Formulardaten an den Server
     * @param {Boolean} [searchFields=false] Sollen die Formularfelder neu gesucht werden?
     * @param {Object|null} [args=null] Argumente für den RPC
     * @returns {Promise}
     */
    save(searchFields=false, args=null) {
        return new Promise((resolve, reject) => {
            if (!kijs.isObject(args)) {
                args = {};
            }

            if (searchFields || kijs.isEmpty(this._fields)) {
                this.searchFields();
            }

            // Zuerst lokal validieren
            let ok = this.validate();

            // formData ermitteln
            args.formData = this.data;

            // Wenn die lokale Validierung ok ist, an den Server senden
            if (ok) {
                this._rpc.do(this.facadeFnSave, args, function(response) {

                    // 'dirty' zurücksetzen
                    this.isDirty = false;

                    // event
                    this.raiseEvent('afterSave', {response: response});
                    resolve(response);

                }, this, false, this, 'dom', false, this._onRpcBeforeMessages);
            } else {
                kijs.gui.MsgBox.error(kijs.getText('Fehler'), kijs.getText('Es wurden noch nicht alle Felder richtig ausgefüllt.'));
            }
        });
    }

    /**
     * Sucht alle Felder im Formular und schreibt einen Verweis darauf in this._fields
     * @param {kijs.gui.Container} [parent=this]
     * @returns {Array}
     */
    searchFields(parent=this) {
        let ret = [];

        for (let i=0; i<parent.elements.length; i++) {
            let el = parent.elements[i];
            if (el instanceof kijs.gui.field.Field && !kijs.isEmpty(el.name)) {
                ret.push(el);
            } else if (el instanceof kijs.gui.Container) {
                ret = ret.concat(this.searchFields(el));
            }
        }

        if (parent === this) {
            this._fields = ret;
        }

        return ret;
    }

    /**
     * Validiert das Formular (Validierung nur im JavaScript)
     * @returns {Boolean}
     */
    validate() {
        let ret = true;

        if (kijs.isEmpty(this._fields)) {
            this.searchFields();
        }

        for (let i=0; i<this._fields.length; i++) {
            if (!this._fields[i].validate()) {
                ret = false;
            }
        }

        return ret;
    }

    // PROTECTED

    /**
     * Fügt für alle Unterelemente listeners hinzu.
     */
    _observChilds() {
        kijs.Array.each(this.getElements(), function(el) {
            if (el instanceof kijs.gui.Container && !(el instanceof kijs.gui.field.Field)) {
                if (!el.hasListener('add', this._onChildAdd, this)) {
                    el.on('add', this._onChildAdd, this);
                }

            } else if (el instanceof kijs.gui.field.Field) {
                if (!el.hasListener('change', this._onChildChange, this)) {
                    el.on('change', this._onChildChange, this);
                }
            }
        }, this);
    }

    // EVENTS
    /**
     * callback-fnBeforeMessages, die eventuelle Fehler direkt im Formular anzeigt
     * @param {Object} response
     * @returns {undefined}
     */
    _onRpcBeforeMessages(response) {
        if (response.responseData && !kijs.isEmpty(response.responseData.fieldErrors)) {
            // Fehler bei den entsprechenden Feldern anzeigen
            if (!kijs.isEmpty(this._fields)) {
                kijs.Array.each(this._fields, function(field) {
                    if (response.responseData.fieldErrors[field.name]) {
                        field.addValidateErrors(response.responseData.fieldErrors[field.name]);
                    }
                }, this);
            }

            if (kijs.isEmpty(response.errorMsg) && !kijs.isEmpty(this._errorMsg)) {
                response.errorMsg = this._errorMsg;
            }
        }
    }

    _onAfterFirstRenderTo(e) {
        this.load();
    }


    _onChildAdd() {
        this._observChilds();
    }

    _onChildChange(e) {
        this.raiseEvent('change', e);
    }


    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(superCall) {
        if (!superCall) {
            // unrender
            this.unrender(superCall);

            // Event auslösen.
            this.raiseEvent('destruct');
        }

        // Variablen (Objekte/Arrays) leeren
        this._data = null;
        this._fields = null;
        this._rpc = null;

        // Basisklasse entladen
        super.destruct(true);
    }

};