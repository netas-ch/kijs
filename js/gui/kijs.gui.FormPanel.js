/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.FormPanel
// --------------------------------------------------------------
kijs.gui.FormPanel = class kijs_gui_FormPanel extends kijs.gui.Panel {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        this._data = {};
        this._facadeFnLoad = null;  // Name der Facade-Funktion. Bsp: 'address.load'
        this._facadeFnSave = null;  // Name der Facade-Funktion. Bsp: 'address.save'
        this._fields = [];          // Array mit kijs.gui.field.Fields-Elementen
        this._rpc = null;           // Instanz von kijs.gui.Rpc
        this._rpcArgs = {};         // Standard RPC-Argumente
        this._errorMsg = kijs.getText('Es wurden noch nicht alle Felder richtig ausgefüllt') + '.';
        this._errorTitle = kijs.getText('Fehler') + '.';

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
            rpc: { target: 'rpc' },             // Instanz von kijs.gui.Rpc oder Name einer RPC
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
        if (kijs.isEmpty(this._fields)) {
            this.searchFields();
        }

        // Evtl. Daten aus Formular holen
        kijs.Array.each(this._fields, function(field) {
            if (field.submitValueEnable && !field.disabled) {
                // Bestehendes Recordset mit Daten aus dem Feld ergänzen
                Object.assign(this._data, field.values);
            } else {
                // Wert soll nicht übermittelt werden.
                delete this._data[field.name];
            }
        }, this);

        return this._data;
    }
    set data(val) {
        this._data = val;

        if (kijs.isEmpty(this._fields)) {
            this.searchFields();
        }

        // Daten in Formular einfüllen
        kijs.Array.each(this._fields, function(field) {
            field.values = this._data;
            // Feld validieren, wenn nicht leer
            field.validate(true);
            // nicht 'dirty'
            field.isDirty = false;
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

    // gibt es ein Feld, dass verändert wurde?
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
    // setzt bei allen Felder isDirty auf true oder false
    set isDirty(val) {
        if (kijs.isEmpty(this._fields)) {
            this.searchFields();
        }

        for (let i=0; i<this._fields.length; i++) {
            this._fields[i].isDirty = !!val;
        }
    }

    // sind alle Felder leer?
    get isEmpty() {
        if (kijs.isEmpty(this._fields)) {
            this.searchFields();
        }

        for (let i=0; i<this._fields.length; i++) {
            if (this._fields[i].xtype !== 'kijs.gui.field.Display') {
                if (!this._fields[i].isEmpty) {
                    return false;
                }
            }
        }

        return true;
    }

    // sind alle Felder readOnly?
    get readOnly(){
        if (kijs.isEmpty(this._fields)) {
            this.searchFields();
        }

        for (let i=0; i<this._fields.length; i++) {
            if (this._fields[i].xtype !== 'kijs.gui.field.Display') {
                if (!this._fields[i].readOnly) {
                    return false;
                }
            }
        }

        return true;
    }
    // setzt bei allen Felder readOnly auf true oder false
    set readOnly(val){
        if (kijs.isEmpty(this._fields)) {
            this.searchFields();
        }

        for (let i=0; i<this._fields.length; i++) {
            if (this._fields[i].xtype !== 'kijs.gui.field.Display') {
                this._fields[i].readOnly = !!val;
            }
        }
    }

    get rpc() {
        return this._rpc || kijs.getRpc('default');
    }
    set rpc(val) {
        if (kijs.isString(val)) {
            val = kijs.getRpc(val);
        }

        if (val instanceof kijs.gui.Rpc) {
            this._rpc = val;
        } else {
            throw new kijs.Error(`Unkown format on config "rpc"`);
        }
    }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    /**
     * Löscht allen Werte aus dem Formular
     * @returns {undefined}
     */
    clear() {
        if (kijs.isEmpty(this._fields)) {
            this.searchFields();
        }

        for (let i=0; i<this._fields.length; i++) {
            if (this._fields[i].xtype !== 'kijs.gui.field.Display') {
                this._fields[i].clear();
                this._fields[i].errorsClear();
            }
        }

        this._data = {};

        // Validierungsfehler auch zurücksetzen
        this.errorsClear();
    }

    /**
     * Setzt die Validierungsfehler zurück.
     * @returns {undefined}
     */
    errorsClear() {
        if (kijs.isEmpty(this._fields)) {
            this.searchFields();
        }

        for (let i=0; i<this._fields.length; i++) {
            this._fields[i].errorsClear();
        }
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

                this.rpc.do({
                    facadeFn: this._facadeFnLoad,
                    owner: this,
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
                        this.errorsClear();
                    }

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
     * Sucht alle Felder im Formular und schreibt einen Verweis darauf in this._fields
     * (rekursiv)
     * @param {kijs.gui.Container} [parent=this]
     * @returns {Array}
     */
    searchFields(parent=this) {
        let ret = [];

        for (let i=0; i<parent.elements.length; i++) {
            let el = parent.elements[i];

            // field
            if (el instanceof kijs.gui.field.Field && !kijs.isEmpty(el.name)) {
                ret.push(el);

                // blur listener
                if (!el.hasListener('blur', this.#onFieldBlur, this)) {
                    el.on('blur', this.#onFieldBlur, this);
                }

                // change listener
                if (!el.hasListener('change', this.#onFieldChange, this)) {
                    el.on('change', this.#onFieldChange, this);
                }

            // container
            } else if (el instanceof kijs.gui.Container) {
                ret = ret.concat(this.searchFields(el));

            }
        }

        if (parent === this) {
            // Felder, die nicht mehr gefunden wurden, werden nicht mehr überwacht.
            if (!kijs.isEmpty(this._fields)) {
                this._fields.forEach((oldField) => {
                    if (ret.indexOf(oldField) === -1) {
                        oldField.off('change', this.#onFieldChange, this);
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
                kijs.gui.MsgBox.error(this._errorTitle, this._errorMsg);
                return;
            }

            // formData ermitteln
            args.formData = this.data;

            // an den Server senden
            this.rpc.do({
                facadeFn: this.facadeFnSave,
                owner: this,
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
                                field.errorsAdd(e.responseData.fieldErrors[field.name]);
                            }
                        }, this);
                    }

                    // Falls keine errorMsg übergeben wurde, die Standardmeldung nehmen
                    if (kijs.isEmpty(e.errorTitle) && !kijs.isEmpty(this._errorTitle)) {
                        e.errorTitle = this._errorTitle;
                    }
                    if (kijs.isEmpty(e.errorMsg) && !kijs.isEmpty(this._errorMsg)) {
                        e.errorMsg = this._errorMsg;
                    }
                    if (kijs.isEmpty(e.errorType)) {
                        e.errorType = 'errorNotice';
                    }
                }

                // Falls alles OK: 'dirty' zurücksetzen
                if (kijs.isEmpty(e.errorType)) {
                    this.isDirty = false;
                }
                
                // 'afterSave' auslösen
                this.raiseEvent('afterSave', e);

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

    #onFieldBlur(e) {
        this.raiseEvent('blur', e);
    }

    #onFieldChange(e) {
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
