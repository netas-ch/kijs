/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.FormPanel
// --------------------------------------------------------------
kijs.gui.FormPanel = class kijs_gui_FormPanel extends kijs.gui.Panel {


    // TODO: disabled hat keine Auswirkungen auf Felder in Containern.
    // TODO: Dynamisches Laden von ganzen Formularen mit load() testen
    // TODO: Neuer Container für die Verwendung von Feldern nebeneinander
    //       - Es muss eine Spaltenzahl angegeben werden können. Der Container hat dann soviele Spalten (Untercontainer)
    //       - Standardwerte müssen an untergeordnete Elemente weitergegeben werden
    // TODO: Abstände zwischen Feldern müssen automatisch gemacht werden, 
    //       es sollten keine Style-Eigenschaften verwendet werden müssen.
    // TODO: Das automatische Aufrufen von searchFields bei den Listeners "add" und "remove"
    //       wieder entfernen. Diese Funktion solle aus performancegründen manuell
    //       aufgerufen werden
    // TODO: BUG: Wenn ein neues Formularfeld hinzugefügt wird, ist das Feld dirty 
    //       (checkbox, combo, ?).

    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        this._data = {};
        this._facadeFnLoad = null;  // Name der Facade-Funktion. Bsp: 'address.load'
        this._facadeFnSave = null;  // Name der Facade-Funktion. Bsp: 'address.save'
        this._fields = null;        // Array mit kijs.gui.field.Fields-Elementen
        this._rpc = null;           // Instanz von kijs.gui.Rpc
        this._rpcArgs = {};         // Standard RPC-Argumente
        this._errorMsg = kijs.getText('Es wurden noch nicht alle Felder richtig ausgefüllt') + '.';

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

        // Beim Hinzufügen oder Löschen von Kindelementen Felder neu suchen
        this.on('add', () => { this.searchFields(); }, this);
        this.on('remove', () => { this.searchFields(); }, this);

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
        return this.hasListener('afterFirstRenderTo', this.#onAfterFirstRenderTo, this);
    }
    set autoLoad(val) {
        if (val) {
            this.on('afterFirstRenderTo', this.#onAfterFirstRenderTo, this);
        } else {
            this.off('afterFirstRenderTo', this.#onAfterFirstRenderTo, this);
        }
    }

    get data() {
        let data = {};

        if (kijs.isEmpty(this._fields)) {
            this.searchFields();
        }

        // Evtl. Daten aus Formular holen
        if (!kijs.isEmpty(this._fields)) {
            kijs.Array.each(this._fields, function(field) {
                if (field.submitValue && !field.disabled) {
                    // Bestehendes Recordset mit Daten aus dem Feld ergänzen
                    Object.assign(this._data, field.values);
                } else {
                    // Wert soll nicht übermittelt werden.
                    delete this._data[field.name];
                }
            }, this);
        }
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
                field.values = this._data;
                field.isDirty = false;
            }, this);
        }
    }

    get disabled() {
        if (kijs.isEmpty(this.fields)){
            this.searchFields();
        }

        let fieldCnt = 0, disabledCnt = 0;
        kijs.Array.each(this.fields, function(element) {
            if (element instanceof kijs.gui.field.Field) {
                fieldCnt++;
                if (element.disabled) {
                    disabledCnt++;
                }
            }
        }, this);
        return disabledCnt > (fieldCnt/2);
    }
    set disabled(value) {
        if (kijs.isEmpty(this.fields)){
            this.searchFields();
        }

        kijs.Array.each(this.fields, function(element) {
            if (element instanceof kijs.gui.field.Field) {
                element.disabled = !!value;
            }
        }, this);
    }

    get facadeFnLoad() { return this._facadeFnLoad; }
    set facadeFnLoad(val) { this._facadeFnLoad = val; }

    get facadeFnSave() { return this._facadeFnSave; }
    set facadeFnSave(val) { this._facadeFnSave = val; }

    get fields() {
        if (kijs.isEmpty(this._fields)) {
            this.searchFields();
        }

        return this._fields;
    }
    
    get isDirty() {
        if (kijs.isEmpty(this._fields)) {
            this.searchFields();
        }

        for (let i = 0; i < this._fields.length; i++) {
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

    get isEmpty() {
        let empty = true;

        if (kijs.isEmpty(this._fields)) {
            this.searchFields();
        }

        for (let i = 0; i < this._fields.length; i++) {
            if (!this._fields[i].isEmpty) {
                empty = false;
            }
        }

        return empty;
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

        for (let i = 0; i < this._fields.length; i++) {
            if (this._fields[i].xtype !== 'kijs.gui.field.Display') {
                this._fields[i].value = null;
            }
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

                this._rpc.do({
                    facadeFn: this._facadeFnLoad,
                    data: args, 
                    cancelRunningRpcs: true, 
                    waitMaskTarget: this,
                    waitMaskTargetDomProperty: 'dom', 
                    context: this
                    
                }).then((e) => {
                    // Formular
                    if (e.responseData.form) {
                        this.removeAll(true);
                        this.add(e.responseData.form, true);
                    }

                    if (searchFields || e.responseData.form || kijs.isEmpty(this._fields)) {
                        this.searchFields();
                    }

                    // Formulardaten in Formular einfüllen
                    if (e.responseData.formData) {
                        this.data = e.responseData.formData;
                    }

                    // Validierung zurücksetzen?
                    if (resetValidation) {
                        this.resetValidation();
                    }

                    // 'Dirty' zurücksetzen
                    this.isDirty = false;
                    
                    // rendern
                    this.render();

                    // load event
                    this.raiseEvent('afterLoad', e);
                    
                    // promise ausführen
                    resolve(e);
                    
                }).catch((ex) => {
                    reject(ex);
                    
                });
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
     * Sucht alle Felder im Formular und schreibt einen Verweis darauf in this._fields (rekursiv)
     * @param {kijs.gui.Container} [parent=this]
     * @returns {Array}
     */
    searchFields(parent=this) {
        let ret = [];

        for (let i=0; i<parent.elements.length; i++) {
            let el = parent.elements[i];
            if (el instanceof kijs.gui.field.Field && !kijs.isEmpty(el.name)) {
                ret.push(el);
            }

            if (el instanceof kijs.gui.Container) {
                ret = ret.concat(this.searchFields(el));

                // untergeordnete Container überwachen, bei neuen oder gelöschten Felder array neu aufbauen
                if (el !== this) {
                    if (!el.hasListener('add', this.#onChildAdd, this)) {
                        el.on('add', this.#onChildAdd, this);
                    }
                    if (!el.hasListener('remove', this.#onChildRemove, this)) {
                        el.on('remove', this.#onChildRemove, this);
                    }
                }
            }

            // Felder auf den Change-Event überwachen
            if (el instanceof kijs.gui.field.Field) {
                if (!el.hasListener('change', this.#onChildChange, this)) {
                    el.on('change', this.#onChildChange, this);
                }
            }

        }

        if (parent === this) {

            // Felder, die nicht mehr gefunden wurden, werden nicht mehr überwacht.
            if (!kijs.isEmpty(this._fields)) {
                this._fields.forEach((oldField) => {
                    if (ret.indexOf(oldField) === -1) {
                        oldField.off('change', this.#onChildChange, this);
                        oldField.off('add', this.#onChildAdd, this);
                        oldField.off('remove', this.#onChildRemove, this);
                    }
                });
            }

            this._fields = ret;
        }

        return ret;
    }
    
    /**
     * Sendet die Formulardaten an den Server
     * @param {type} searchFields
     * @param {type} args
     * @param {type} waitMaskTarget
     * @returns {Promise}
     */
    save(searchFields=false, args=null, waitMaskTarget=null) {
        return new Promise((resolve, reject) => {
            if (!kijs.isObject(args)) {
                args = {};
            }

            if (!waitMaskTarget) {
                waitMaskTarget = this;
            }

            if (searchFields || kijs.isEmpty(this._fields)) {
                this.searchFields();
            }

            // Zuerst lokal validieren
            if (!this.validate()) {
                kijs.gui.MsgBox.error(kijs.getText('Fehler'), kijs.getText('Es wurden noch nicht alle Felder richtig ausgefüllt') + '.');
                return;
            }

            // formData ermitteln
            args.formData = this.data;

            // an den Server senden
            this._rpc.do({
                facadeFn: this.facadeFnSave,
                data: args, 
                cancelRunningRpcs: false, 
                waitMaskTarget: waitMaskTarget, 
                waitMaskTargetDomProperty: 'dom', 
                context: this
                
            }).then((e) => {
                // Evtl. Fehler bei den entsprechenden Feldern anzeigen
                if (e.responseData && !kijs.isEmpty(e.responseData.fieldErrors)) {
                    if (!kijs.isEmpty(this._fields)) {
                        kijs.Array.each(this._fields, function(field) {
                            if (e.responseData.fieldErrors[field.name]) {
                                field.addValidateErrors(e.responseData.fieldErrors[field.name]);
                            }
                        }, this);
                    }

                    if (kijs.isEmpty(e.errorMsg) && !kijs.isEmpty(this._errorMsg)) {
                        e.errorMsg = this._errorMsg;
                    }
                }
                
                // Falls alles OK
                if (kijs.isEmpty(e.errorMsg)) {
                    // 'dirty' zurücksetzen
                    this.isDirty = false;
                
                    // event
                    this.raiseEvent('afterSave', e);
                }
                
                resolve(e);
                
            }).catch((ex) => {
                reject(ex);
            });
        });
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
 
 
    // LISTENERS
    // EVENTS
    #onAfterFirstRenderTo(e) {
        this.load().catch(() => {});
    }

    #onChildAdd() {
        this.searchFields();
    }

    #onChildRemove() {
        this.searchFields();
    }

    #onChildChange(e) {
        this.raiseEvent('change', e);
    }



    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    // overwrite
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
