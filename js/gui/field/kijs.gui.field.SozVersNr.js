/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.field.SozVersNr
// --------------------------------------------------------------
kijs.gui.field.SozVersNr = class kijs_gui_field_SozVersNr extends kijs.gui.field.Text {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        this._allowAhvNr = true;        // darf eine alte AHV-Nr eingegeben werden?
        this._allowSozVersNr = true;    // darf eine neue Soz.vers.-Nr. eingegeben werden?
        
        this._dom.clsRemove('kijs-field-text');
        this._dom.clsAdd('kijs-field-sozversnr');
        
        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            disableFlex: true,
            formatFn: this._formatNr,
            formatFnContext: this/*,
            formatRegExp:[  // Formatierung (kann mit config ersetzt werden)
                {   // neue Soz.vers.-Nr. (Format: xxx.xxxx.xxxx.xx)
                    regExp: /^([0-9]{3})[ \.]*([0-9]{4})[ \.]*([0-9]{4})[ \.]*([0-9]{2})[ \.]*$/, // Whitespace am Ende entfernen
                    replace: '$1.$2.$3.$4'
                },{   // alte AHV-Nr.(Format: xxx.xx.xxx.xxx)
                    regExp: /^([0-9]{3})[ \.]*([0-9]{2})[ \.]*([0-9]{3})[ \.]*([0-9]{3})[ \.]*$/, // Whitespace am Ende entfernen
                    replace: '$1.$2.$3.$4'
                }
            ]*/
        });
        
        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            allowAhvNr: true,       // darf eine alte AHV-Nr eingegeben werden?
            allowSozVersNr: true    // darf eine neue Soz.vers.-Nr. eingegeben werden?
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }
    }



    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get allowAhvNr() { return this._allowAhvNr; }
    set allowAhvNr(val) { this._allowAhvNr = val; }

    get allowSozVersNr() { return this._allowSozVersNr; }
    set allowSozVersNr(val) { this._allowSozVersNr = val; }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // PROTECTED
    _formatNr(value, whileTyping) {
        let origValue = value;
        
        // Leerzeichen und Punkte entfernen
        value = kijs.toString(value).replace(/[ \.]*/g, '');
        
        // Zwischenstand merken
        let val = value;
        
        // neue Soz.vers.-Nr. (Format: xxx.xxxx.xxxx.xx)
        if (this._allowSozVersNr) {
            val = val.replace(/^([0-9]{3})([0-9]{4})([0-9]{4})([0-9]{2})$/, '$1.$2.$3.$4');
        }

        // alte AHV-Nr.(Format: xxx.xx.xxx.xxx)
        // während der Eingabe nur formatieren, wenn die neue nicht möglich ist, 
        // weil sonst bereits nach 11 Zeichen die alte formatiert wird.
        // bei set value oder beim verlassen des Feldes wird aber richtig formatiert.
        if (this._allowAhvNr && (!this._allowSozVersNr || !whileTyping)) {
            val = val.replace(/^([0-9]{3})([0-9]{2})([0-9]{3})([0-9]{3})$/, '$1.$2.$3.$4');
        }
        
        
        
        // konnte eine Formatierung angewendet werden?
        // Wenn ja, diese zurückgeben, sonst den ursprünglichen Wert
        if (val !== value) {
            return val;
        } else {
            return origValue;
        }
    }
    
    // alte AHV-Nr. validieren
    _validateAhvNr(value) {
        value = kijs.toString(value).replace(/[ \.]*/g, '');

        // Nicht erlaubte Zeichen?
        if (!value || /[^0-9]/.test(value)) {
            return false;
        }
        
        // Länge
        if (value.length !== 11) {
            return false;
        }
        
        let x = 0;
        let z = value.substr(0,10);
        let pz = parseInt(value.substr(10));   // Prüfziffer

        x += parseInt(z.substr(0,1)) * 5;
        x += parseInt(z.substr(1,1)) * 4;
        x += parseInt(z.substr(2,1)) * 3;
        x += parseInt(z.substr(3,1)) * 2;
        x += parseInt(z.substr(4,1)) * 7;
        x += parseInt(z.substr(5,1)) * 6;
        x += parseInt(z.substr(6,1)) * 5;
        x += parseInt(z.substr(7,1)) * 4;
        x += parseInt(z.substr(8,1)) * 3;
        x += parseInt(z.substr(9,1)) * 2;

        x = 11 - (x % 11);
        if (x === 11) {
            x = 0;
        }
        if(x === 10) {
            x = -1; // Ungültige Nummer
        }
        if (x !== pz) {
            return false;
        }
        
        return true;
    }
    
    // neue Sozialversicherungs-Nr. validieren
    _validateSozVersNr(value) {
        value = kijs.toString(value).replace(/[ \.]*/g, '');
        
        // Nicht erlaubte Zeichen?
        if (!value || /[^0-9]/.test(value)) {
            return false;
        }
        
        // Länge
        if (value.length !== 13) {
            return false;
        }
        
        let x = 0;
        let z = value.substr(0,12);
        let pz = parseInt(value.substr(12));   // Prüfziffer
        
        // die einzelnen Ziffern werden von rechts nach links,
        // beginnend mit der vorletzten Ziffer, abwechselnd mit 3
        // und mit 1 multipliziert
        for (let i=11; i>=0; i--) {
            if (i%2 === 0) {
                x += parseInt(z.substr(i,1)) * 1;
            } else {
                x += parseInt(z.substr(i,1)) * 3;
            }
        }
        
        // die Prüfziffer ergänzt diese Summe dann zum nächsten
        // Vielfachen von 10
        x = parseInt(x.toString().substr(x.toString().length-1, 1));
        if (x > 0) {
            x = 10 - x;
        }
        
        if (x !== pz) {
            return false;
        }
        
        return true;
    }
    
    // overwrite
    _validationRules(value) {
        super._validationRules(value);

        // SozVersNr validieren
        if (!kijs.isEmpty(value)) {
            let val = kijs.toString(value).replace(/[ \.]*/g, '');
            let ok = false;
            
            // neue Sozialversicherungs-Nr.
            if (val.length === 13 && this._allowSozVersNr) {
                ok = this._validateSozVersNr(value);
                
            // alte AHV-Nr.
            } else if (val.length === 11 && this._allowAhvNr) {
                ok = this._validateAhvNr(value);
                
            }
            
            if (!ok) {
                this._errors.push(kijs.getText('Ungültige Sozialversicherungs-Nr.'));
            }
        }
    }


    // PRIVATE
    // LISTENERS
    // overwrite
    #onInputDomChange(e) {
        // Sicherstellen, dass beim Verlassen des Feldes noch getrimmt und formatiert wird.
        let val = this.value;
        let oldVal = this._previousChangeValue;
        
        // Wert neu reinschreiben (evtl. wurde er getrimmt oder formatiert)
        this.value = val;
        
        // und das change event auslösen
        if (val !== oldVal) {
            this.raiseEvent('change', { oldValue: oldVal, value: val } );
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

        // Basisklasse entladen
        super.destruct(true);
    }
    
};
