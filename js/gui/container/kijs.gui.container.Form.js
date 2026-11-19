/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.container.Form
// --------------------------------------------------------------
/**
 * Formular: Container, der alle enthaltenen Felder (kijs.gui.field.Field, auch verschachtelt)
 * findet und gemeinsam behandelt. Über data werden die Werte als Objekt (Feldname => Wert) gesetzt
 * bzw. gelesen, mit load() vom Server geladen und mit save() an rpcSaveFn gesendet. Vor dem Speichern
 * wird lokal validiert; Fehler des Servers (fieldErrors) werden bei den Feldern angezeigt.
 *
 * @example
 * const form = new kijs.gui.container.Form({
 *     rpcLoadFn: 'address.load',
 *     rpcSaveFn: 'address.save',
 *     elements: [
 *         { xtype: 'kijs.gui.field.Text', name: 'name', label: 'Name', required: true }
 *     ]
 * });
 * form.load({ id: 1 });
 *
 * @fires afterSave  Nach save(). e: Antwort des RPC (response, request)
 * @fires blur  Ein Feld hat den Fokus verloren (weitergeleitet vom Feld)
 * @fires change  Ein Feld wurde geändert (weitergeleitet vom Feld)
 */
kijs.gui.container.Form = class kijs_gui_container_Form extends kijs.gui.Container {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        this._data = {};
        this._rpcSaveFn = null;     // Name der remoteFn. Bsp: 'address.save'
        this._rpcSaveArgs = {};     // Standard RPC-Argumente
        this._fields = [];          // Array mit kijs.gui.field.Fields-Elementen
        this._defaultSaveErrorMsg = kijs.getText(`Es wurden noch nicht alle Felder richtig ausgefüllt`) + '.';
        this._defaultSaveErrorTitle = kijs.getText(`Fehler`);

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            nodeTagName: 'form'                // Die Form-Funktionalität wird von kijs nicht verwendet. Ein DIV funktioniert auch.
                                                // Es macht trotzdem Sinn für Screenreader, Passwortmanager und andere Browser-Plugins.
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            data: { target: 'data', prio: 2000},
            defaultSaveErrorMsg: true,
            rpcSaveFn: true,
            rpcSaveArgs: true
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
    /**
     * Daten des Formulars als Objekt, z.B. {id:1, name:'Muster'}. Der Getter ergänzt das zuletzt
     * gesetzte Objekt mit den Werten der Felder (ohne deaktivierte Felder und solche ohne
     * submitValueEnable). Der Setter füllt die Felder ab, validiert sie und setzt isDirty zurück.
     * @type {Object}
     */
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

    /**
     * Meldung, wenn beim Speichern nicht alle Felder gültig sind. Leer = keine Meldung, dann wird trotzdem
     * gespeichert. Default: 'Es wurden noch nicht alle Felder richtig ausgefüllt.'
     * @type {String|null}
     */
    get defaultSaveErrorMsg() { return this._defaultSaveErrorMsg; }
    set defaultSaveErrorMsg(val) { this._defaultSaveErrorMsg = val; }

    /**
     * Alle Felder im Formular (siehe searchFields())
     * @type {kijs.gui.field.Field[]}
     */
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

    /**
     * Zusätzliche RPC-Argumente fürs Speichern. Überschreiben gleichnamige Argumente von save().
     * @type {Object}
     */
    get rpcSaveArgs() { return this._rpcSaveArgs; }
    set rpcSaveArgs(val) { this._rpcSaveArgs = val; }

    /**
     * Name der remoteFn zum Speichern, z.B. 'address.save'
     * @type {String|null}
     */
    get rpcSaveFn() { return this._rpcSaveFn; }
    set rpcSaveFn(val) { this._rpcSaveFn = val; }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    /**
     * Löscht alle Werte aus dem Formular
     * @returns {undefined}
     */
    clear() {
        if (kijs.isEmpty(this._fields)) {
            this.searchFields();
        }

        for (let i=0; i<this._fields.length; i++) {
            if (this._fields[i].xtype !== 'kijs.gui.field.Display') {
                this._fields[i].clear();
                this._fields[i].isDirty = false;
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
     * @param {Object}  [args] Objekt mit Argumenten, die an die remoteFn übergeben werden
     * @param {Boolean} [searchFields=false] Sollen die Formularfelder neu gesucht werden?
     * @param {Boolean} [resetValidation=false] Sollen die Formularfelder als invalid markiert werden?
     * @param {Boolean} [superCall=false]
     * @returns {Promise}
     */
    // overwrite
    load(args=null, searchFields=false, resetValidation=false, superCall=false) {
        return new Promise((resolve) => {
            super.load(args, true).then((e) => {
                if (kijs.isEmpty(e.response.errorType)) {
                    // Falls das Formular destructed wurde: abbrechen
                    if (!this._dom) {
                        resolve(e);
                        return;
                    }

                    if (e.response.config && e.response.config.elements) {
                        searchFields = true;
                    }

                    if (searchFields || kijs.isEmpty(this._fields)) {
                        this.searchFields();
                    }

                    // Validierung zurücksetzen?
                    if (resetValidation) {
                        this.errorsClear();
                    }

                    // rendern
                    this.render();

                    // 'afterLoad' auslösen
                    if (!superCall) {
                        this.raiseEvent('afterLoad', Object.assign({}, e));
                    }
                }

                // promise ausführen
                resolve(e);
            });

        });
    }

    /**
     * Validiert das Formular und sendet die Daten (data) mit args an rpcSaveFn. Enthält die Antwort
     * config, wird sie angewendet; fieldErrors werden bei den Feldern angezeigt. Ohne Fehler wird
     * isDirty zurückgesetzt. Danach wird afterSave ausgelöst.
     * Ist das Formular ungültig und defaultSaveErrorMsg gesetzt, wird nur die Meldung angezeigt und
     * das Promise mit response.errorType 'errorNotice' erfüllt (ohne Request an den Server).
     * @param {Boolean} [searchFields=false]  Felder vorher neu suchen?
     * @param {Object|null} [args=null]  Argumente für den Server (rpcSaveArgs haben Vorrang)
     * @returns {Promise}
     */
    save(searchFields=false, args=null) {
        return new Promise((resolve, reject) => {
            // Args
            if (!kijs.isObject(args)) {
                args = {};
            }
            args = Object.assign({}, args, this._rpcSaveArgs);

            if (searchFields || kijs.isEmpty(this._fields)) {
                this.searchFields();
            }

            // Zuerst lokal validieren
            if (!this.validate() && !kijs.isEmpty(this._defaultSaveErrorMsg)) {
                kijs.gui.MsgBox.error(this._defaultSaveErrorTitle, this._defaultSaveErrorMsg);

                // Promise trotzdem erfüllen, damit ein await nicht hängen bleibt
                resolve({
                    response: { errorType: 'errorNotice', errorMsg: this._defaultSaveErrorMsg },
                    request: null
                });
                return;
            }

            // an den Server senden
            this.rpc.do({
                remoteFn: this.rpcSaveFn,
                owner: this,
                requestData: {
                    data: this.data,
                    args: args
                },
                cancelRunningRpcs: false,
                waitMaskTarget: this._waitMaskTarget,
                waitMaskTargetDomProperty: this._waitMaskTargetDomProperty,
                context: this

            }).then((e) => {
                // Falls des Formular destructed wurde: abbrechen
                if (!this._dom) {
                    resolve(e);
                    return;
                }

                // config Properties anwenden, falls vorhanden
                if (e.response.config) {
                    // config Properties übernehmen
                    this.applyConfig(e.response.config);
                }

                // Evtl. Fehler bei den entsprechenden Feldern anzeigen
                if (e.response && !kijs.isEmpty(e.response.fieldErrors)) {
                    if (!kijs.isEmpty(this._fields)) {
                        kijs.Array.each(this._fields, function(field) {
                            if (e.response.fieldErrors[field.name]) {
                                field.errorsAdd(e.response.fieldErrors[field.name]);
                            }
                        }, this);
                    }

                    // Falls keine errorMsg übergeben wurde, die Standardmeldung nehmen
                    if (kijs.isEmpty(e.errorTitle) && !kijs.isEmpty(this._defaultSaveErrorTitle)) {
                        e.errorTitle = this._defaultSaveErrorTitle;
                    }
                    if (kijs.isEmpty(e.errorMsg)) {
                        e.errorMsg = this._defaultSaveErrorMsg;
                    }
                }

                // Falls alles OK: 'dirty' zurücksetzen
                if (kijs.isEmpty(e.response.errorType)) {
                    this.isDirty = false;
                }

                // 'afterSave' auslösen
                this.raiseEvent('afterSave', Object.assign({}, e));

                // Promise auslösen
                resolve(e);

            }).catch((ex) => {
                reject(ex);

            });
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

            // Field
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
            }

            // Container: Rekursiv Unterelemente abfragen
            if (el instanceof kijs.gui.Container && el.elements.length > 0) {
                ret = ret.concat(this.searchFields(el));
            }
        }

        // Felder, die nicht mehr gefunden wurden, werden nicht mehr überwacht.
        if (parent === this) {
            if (!kijs.isEmpty(this._fields)) {
                this._fields.forEach((oldField) => {
                    if (ret.indexOf(oldField) === -1) {
                        oldField.off('change', this.#onFieldChange, this);
                        oldField.off('blur', this.#onFieldBlur, this);
                    }
                });
            }

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

    /**
     * Setzt die Werte der Felder auf den Originalwert zurück
     * @returns {undefined}
     */
    valuesReset() {
        if (kijs.isEmpty(this._fields)) {
            this.searchFields();
        }

        for (let i=0; i<this._fields.length; i++) {
            this._fields[i].valuesReset();
        }
    }


    // PRIVATE
    // LISTENERS
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
        this._rpcSaveArgs = null;

        // Basisklasse entladen
        super.destruct(true);
    }

};
