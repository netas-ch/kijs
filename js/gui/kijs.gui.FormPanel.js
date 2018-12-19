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
        
        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            autoLoad: { target: 'autoLoad' },   // Soll nach dem ersten Rendern automatisch die Load-Funktion aufgerufen werden?
            data: { target: 'data'},    //Recordset-Row-Objekt {id:1, caption:'Wert 1'}
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
        // Evtl. Daten in Formular einfüllen
        if (!kijs.isEmpty(this._fields)) {
            kijs.Array.each(this._fields, function(field) {
                if (field.name in this._data) {
                    field.value = this._data[field.name];
                }
            }, this);
        }
    }
    
    get fields() { return this._fields; }
    
    get facadeFnLoad() { return this._facadeFnLoad; }
    set facadeFnLoad(val) { this._facadeFnLoad = val; }

    get facadeFnSave() { return this._facadeFnSave; }
    set facadeFnSave(val) { this._facadeFnSave = val; }

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
        if (this._facadeFnLoad) {
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

                this.raiseEvent('afterLoad');
            }, this, true, this, 'dom', false, this._onRpcBeforeMessages);
        }
    }

    /**
     * Sendet die Formulardaten an den Server
     * @param {Boolean} [searchFields=false] Sollen die Formularfelder neu gesucht werden?
     * @returns {undefined}
     */
    save(searchFields) {
        let args = {
            formData: null
        };

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
                this.raiseEvent('afterSave', {response: response});
            }, this, false, this, 'dom', false, this._onRpcBeforeMessages);
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

    // EVENTS
    /**
     * callback-fnBeforeMessages, die eventuelle Fehler direkt im Formular anzeigt
     * @param {type} response
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
        }
    }

    _onAfterFirstRenderTo(e) {
        this.load();
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