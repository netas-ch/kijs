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
        
        this._data = null;          // Instanz von kijs.Data
        this._facadeFnLoad = null;  // Name der Facade-Funktion. Bsp: 'address.load'
        this._facadeFnSave = null;  // Name der Facade-Funktion. Bsp: 'address.save'
        this._fields = null;        // Array mit kijs.gui.field.Fields-Elementen
        this._rpc = null;           // Instanz von kijs.gui.Rpc
        
        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            facadeFnLoad: true,
            facadeFnSave: true,
            rpc: { target: 'rpc' }
        });
        
        // Config anwenden
        if (kijs.isObject(config)) {
            this.applyConfig(config, true);
        }
    }
    
    
    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get data() { return this._data; }
    
    get fields() { return this._fields; }
    
    get facadeFnLoad() { return this._facadeFnLoad; }
    set facadeFnLoad(val) { this._facadeFnLoad = val; }

    get facadeFnSave() { return this._facadeFnSave; }
    set facadeFnSave(val) { this._facadeFnSave = val; }

    get rpc() { return !!this._rpc;}
    set rpc(val) {
        if (val instanceof kijs.gui.Rpc) {
            if (this._rpc) {
                this._rpc.destruct();
            }
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
            throw new Error(`Unkown format on config "rpc"`);
            
        }
    }
    

    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    /**
     * Lädt das Formular mit Daten vom Server
     * @param {Object} args
     * @param {Boolean} [searchFields=false] Sollen die Formularfelder neu gesucht werden?
     * @returns {undefined}
     */
    load(args, searchFields) {
        this._rpc.do(this._facadeFnLoad, args, function(response) {

            // Formular
            if (response.form) {
                this.removeAll();
                this.add(response.form);
            }

            if (searchFields || response.form || kijs.isEmpty(this._fields)) {
                this.searchFields();
            }

            // Formulardaten
            if (response.formData) {
                this._data = new kijs.Data({
                    rows: [response.formData]
                });
                kijs.Array.each(this._fields, function(field) {
                    if (this._data.columnExist(field.name)) {
                        field.value = this._data.rows[0][field.name];
                    }
                }, this);
            }

        }, this, true, this, 'dom', false, this._showFieldErrors);
    }


    /**
     * Sendet die Formulardaten an den Server
     * @param {Boolean} [searchFields=false] Sollen die Formularfelder neu gesucht werden?
     * @returns {undefined}
     */
    save(searchFields) {
        let args = {};
        args.formData = {};

        if (searchFields || kijs.isEmpty(this._fields)) {
            this.searchFields();
        }

        // Zuerst lokal validieren
        let ok = true;
        for (let i=0; i<this._fields.length; i++) {
            let fld = this._fields[i];
            if (!fld.validate()) {
                ok = false;
            }
            args.formData[fld.name] = fld.value;
        }

        // Wenn die lokale Validierung ok ist, an den Server senden
        if (ok) {
            this._rpc.do(this.facadeFnSave, args, function(response) {
                // nix tun
            }, this, false, this, 'dom', false, this._showFieldErrors);
        } else {
            kijs.gui.MsgBox.error('Fehler', 'Es wurden noch nicht alle Felder richtig ausgefüllt.');
        }
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

        for (let i=0; i<this._fields.length; i++) {
            if (!this._fields[i].validate()) {
                ret = false;
            }
        }

        return ret;
    }

    // PROTECTED
    /**
     * callback-fnBeforeDisplayError, die eventuelle Fehler direkt im Formular anzeigt
     * @param {type} response
     * @returns {undefined}
     */
    _showFieldErrors(response) {
        if (!kijs.isEmpty(response.fieldErrors)) {
            // Fehler bei den entsprechenden Feldern anzeigen
            for (let i=0; i<this._fields.length; i++) {
                if (response.fieldErrors[this._fields[i].name]) {
                    this._fields[i].addValidateErrors(response.fieldErrors[this._fields[i].name]);
                }
            }

            // Fehler als Meldung anzeigen
            const msg = 'Es wurden noch nicht alle Felder richtig ausgefüllt.';
            if (kijs.isEmpty(response.errorMsg)) {
                response.errorMsg = msg;
            } else {
                if (!kijs.isArray(response.errorMsg)) {
                    response.errorMsg = [response.errorMsg];
                }
                response.errorMsg.push(msg);
            }
        }
    }
    
    
    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(preventDestructEvent) {
        // Event auslösen.
        if (!preventDestructEvent) {
            this.raiseEvent('destruct');
        }
        
        // Elemente/DOM-Objekte entladen
        if (this._rpc) {
            this._rpc.destruct();
        }
        
        // Variablen (Objekte/Arrays) leeren
        this._data = null;
        this._fields = null;
        this._rpc = null;
        
        // Basisklasse entladen
        super.destruct(true);
    }
    
};