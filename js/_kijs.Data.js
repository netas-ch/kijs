/* global kijs, this */

// --------------------------------------------------------------
// kijs.Data
// --------------------------------------------------------------
kijs.Data = class kijs_Data {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        this._columns = [];      // Array mit Spaltennamen
        this._rows = [];         // Recordset-Array
        this._primary = [];      // Array mit Namen der Primärschlüssel

        this._disableDuplicateCheck = false;    // Duplikat-Kontrolle ausschalten

        // Mapping für die Zuweisung der Config-Eigenschaften
        this._configMap = {
            disableDuplicateCheck: true,
            rows: true,
            columns: true,
            primary: true
        };

        // Config anwenden
        if (kijs.isObject(config)) {
            this.applyConfig(config);
        }
    }


    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get columns() { return this._columns; }
    set columns(val) { this._columns = val; }

    get disableDuplicateCheck() { return this._disableDuplicateCheck; }
    set disableDuplicateCheck(val) { this._disableDuplicateCheck = !!val; }

    get rows() { return this._rows; }

    /**
     * Setzt die Rows-Datenquelle.Das Array muss in einem der folgenden Formate sein:
     * - einfaches Wertearray = ['Herr', 'Frau', 'Familie'] (nur ein Wert pro Zeile)
     * - mehrdimensionales Wertearray = [['Herr', 'Muster'], ['Frau', 'Müller']]
     * - Recordset-Array = [{Anrede: 'Herr', Name='Muster'}, {Anrede: 'Frau', Name='Müller'}]
     * Alle Datensätze im Array müssen das gleiche Format haben.
     * @param {Array} val
     * @returns {undefined}
     */
    set rows(val) {
        if (kijs.isEmpty(val)) {
            this._rows = [];
            return;
        }

        if (!kijs.isArray(val)) {
            val = [val];
        }

        // Falls ein anderes Format als unser erwartetes Recordset-Array übergeben wurde: konvertieren
        this._convertFromAnyDataArray(val);

        // Sicherstellen, dass es keine duplikate im Primary gibt
        if (!this._disableDuplicateCheck) {
            if (this.duplicateCheck(val)) {
                throw new Error('Not unique primary-key on (' + this._primary.join(', ') + ').');
            }
        }

        this._rows = val;
    }

    get primary() { return this._primary; }
    set primary(val) { this._primary = val; }


    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    /**
    * Fügt eine oder mehrere neue rows hinzu. Das Array muss in einem der folgenden Formate sein:
    * - einfaches Wertearray = ['Herr', 'Frau', 'Familie'] (nur ein Wert pro Zeile)
    * - mehrdimensionales Wertearray = [['Herr', 'Muster'], ['Frau', 'Müller']]
    * - Recordset-Array = [{Anrede:'Herr', Name:'Muster'}, {Anrede:'Frau', Name:'Müller'}]
    * Alle Datensätze im Array müssen das gleiche Format haben.
    * @param {Object|Array} rows
    * @param {Boolean|null} [duplicateCheck=false]
    * @returns {undefined}
    */
    add(rows, duplicateCheck) {
        if (kijs.isEmpty(rows)) {
            return;
        }

        if (!kijs.isArray(rows)) {
            rows = [rows];
        }

        // Falls ein anderes Format als unser erwartetes Recordset-Array übergeben wurde: konvertieren
        this._convertFromAnyDataArray(rows);

        // Sicherstellen, dass es keine duplikate im Primary gibt
        if (duplicateCheck) {
            if (this.duplicateCheck(rows)) {
                throw new Error('Not unique primary-key on (' + this.primary.join(', ') + ').');
            }
        }

        // einfügen
        for (let i=0; i<rows.length; i++) {
            let row = rows[i];
            this.rows.push(row);
        }
    }


    /**
     * Wendet die Konfigurations-Eigenschaften an
     * @param {Object} config
     * @returns {undefined}
     */
    applyConfig(config={}) {
        kijs.Object.assignConfig(this, config, this._configMap);

        // Evtl. die Rows in win Recordset-Array konvertieren
        this._convertFromAnyDataArray(this._rows);

        // Falls nur rows übergeben wurden und keine columns: Die columns automatisch generieren
        if (kijs.isEmpty(this._columns)) {
            this._columns = this._getColumnsFromRows(this._rows);
        }
    }

    /**
     * Prüft, ob eine Spalte existiert
     * @param {String} columnName
     * @returns {Boolean}
     */
    columnExist(columnName) {
        return kijs.Array.contains(this._columns, columnName);
    }

    /**
     * Prüft, ob ein Primary einer Row schon im Recordset ist.
     * @param {Array|Object} rows   // einzelnes row-Objekt oder rows-Array
     * @returns {Boolean} true, falls bereits enthalten
     */
    duplicateCheck(rows) {
        let hasDuplicate = false;

        if (kijs.isEmpty(rows)) {
            return false;
        }

        if (!kijs.isArray(rows)) {
            rows = [rows];
        }

        kijs.Array.each(this._rows, function(item) {
            let match = 0;
            for (let i=0; i<this._primary.length; i++) {
                let pk = this._primary[i];
                if (rows[pk] === item[pk]) {
                    match++;
                }
            }

            if (match === this._primary.length) {
                hasDuplicate = true;
                return false; // schlaufe brechen
            }
        }, this);

        return hasDuplicate;
    }


    /**
     * Eine Funktion auf jede Row ausführen
     * @param {Function} fn Als argument wird die Row übergeben.
     * @param {Object} context
     * @returns {Number|Boolean}
     */
    each(fn, context) {
        if (kijs.isEmpty(this._rows)) {
            return;
        }
        return kijs.Array.each(this._rows, fn, context);
    }

    /**
     * Gibt die Anzahl Zeilen zurück
     * @returns {Number}
     */
    getCount() {
        return this._rows.length;
    }


    /**
     * gibt ein leeres Row-Objekt zurück.
     * @returns {Object}
     */
    getEmptyRowObject() {
        const o = {};
        for (let i=0; i<this._columns.length; i++) {
            o[this._columns[i]] = null;
        }
        return o;
    }

    /**
     * gibt Zeilen zurück, deren Inhalt dem Value entspricht
     * @param {String} columnName Spaltenname
     * @param {Number|String|NULL} value
     * @returns {Array}
     */
    getRowsByFieldValue(columnName, value) {
        const len = this._rows.length;
        const ret = [];

        // Zeilen durchgehen
        for (let i=0, len; i<len; i++) {
            if (kijs.toString(this._rows[i][columnName]) === kijs.toString(value)) {
                ret.push(this._rows[i]);
            }
        }

        return ret;
    }

    /**
     * gibt eine Zeile aufgrund des Primary zurück
     * @param {String|Number|Array|Object} primary
     * @returns {Object}
     */
    getRowByPrimary(primary) {
        let keys = {};

        // Wenn kein Primary definiert ist: Fehler
        if (kijs.isEmpty(this._primary)) {
            throw new Error('No primary key is defined in this data object.');
        }

        // String oder Number
        if (kijs.isString(primary) || kijs.isNumber(primary)) {
            keys[this._primary[0]] = primary;
        }

        // Array
        if (kijs.isArray(primary)) {
            for (let i=0; i< primary.length; i++) {
                keys[this._primary[i]] = primary;
            }
        }

        // Objekt
        if (kijs.isObject(primary)) {
            keys = primary;
        }

        // Kontrollieren ob die Parameter stimmen
        for (let i=0; i< this._primary.length; i++) {
            if (kijs.isEmpty(keys[this._primary[i]])) {
                throw new Error('Number of primary-columns does not match.');
            }
        }

        // Zeilen durchgehen, bis die erste passt
        const len = this._rows.length;
        for (let i=0, len; i<len; i++) {
            let ok = true;
            for (let j=0; j<this._primary.length; j++) {
                const col = this._primary[j];
                if (kijs.toString(this._rows[i][col]) !== kijs.toString(keys[col])) {
                    ok = false;
                    break;
                }
            }
            if (ok) {
                return this._rows[i];
            }
        }

        return null;
    }

    /**
     * Fügt eine Row vor eine andere ein.
     * @param {Object} newRow
     * @param {Object} row
     * @returns {Boolean}
     */
    insertBefore(newRow, row) {
        this._completeRowObject(newRow);
        if (this._duplicateCheck(row)) {
            return false;
        }

        const pos = this._rows.indexOf(row);
        if (pos === -1) {
            this._rows.push(row);
        } else {
            this._rows.splice(pos, 0, newRow);
        }
        return true;
    }

    /**
     * Löscht eine Zeile
     * @param {Object} row
     * @returns {Array}
     */
    remove(row) {
        const pos = this._rows.indexOf(row);
        if (pos === -1) return false;

        this._rows.splice(pos, 1);
        return true;
    }

    /**
     * Löscht alle Zeilen
     * @returns {undefined}
     */
    removeAll() {
        this._rows = [];
    }


    // PROTECTED
    /**
     * Prüft, ob in einem Row-Object alle columns existieren, oder erstellt diese.
     * @param {Object} row
     * @returns {Boolean} Wurde etwas geändert?
     */
    _completeRowObject(row) {
        let ret = false;
        for (let i=0; i<this._columns.length; i++) {
            let col = this._columns[i];

            if (!kijs.isDefined(row[col])) {
                row[col] = null;
                ret = true;
            }
        }
        return ret;
    }

    /**
     * Konvertiert ein Daten-Array aus einem der folgenden Formate in unser Recordset-Array
     * - einfaches Wertearray = ['Herr', 'Frau', 'Familie'] (nur ein Wert pro Zeile)
     * - mehrdimensionales Wertearray = [['Herr', 'Muster'], ['Frau', 'Müller']]
     * - Recordset-Array = [{Anrede:'Herr', Name:'Muster'}, {Anrede:'Frau', Name:'Müller'}]
     * @param {Array} rows
     * @returns {undefined}
     */
    _convertFromAnyDataArray(rows) {
        if (kijs.isEmpty(rows)) {
            return;
        }

        // Die erste Zeile im Array bestimmt das Format.
        // Ein Mix von Formaten im selben Array ist deshalb nicht erlaubt.
        let format;

        // Objekt -> keine Konventierung notwendig
        if (kijs.isObject(rows[0])) {
            format = 'object';

        // Array mit Werten -> konvertieren
        } else if (kijs.isArray(rows[0])) {
            // Spaltenanzahl muss übereinstimmen
            if (!kijs.isEmpty(this._columns) && rows[0].length === this._columns.length) {
                format = 'array';
            } else {
                throw new Error('The number of columns does not match.');
            }

        // alle anderen Datentypen (String, Number, Boolean) -> enthalten direkt den Wert, sie werden konventiert.
        } else {
            format = 'value';

        }


        // Daten evtl. in den richtigen Datentyp konvertieren
        switch (format) {
            // Objekt -> keine Konventierung notwendig
            case 'object':
                // Sicherstellen, dass die Zeilen auch alle erforderlichen Spalten haben.
                if (this._completeRowObject(rows[0]) && rows.length>1) {
                    for (let i=1; i<rows.length; i++) {
                        this._completeRowObject(rows[i]);
                    }
                }
                break;

            // Array mit Werten -> konvertieren
            case 'array':
                // Daten konvertieren
                for (let i=0; i<rows.length; i++) {
                    let row = {};

                    for (let j=0; j<this._columns.length; j++) {
                        const name = this._columns[j];
                        row[name] = rows[i][j];
                    }

                    rows[i] = row;
                }
                break;

            // alle anderen Datentypen -> enthalten direkt den Wert (nur ein Wert pro Zeile), sie werden konventiert.
            case 'value':
                // Feldname ermitteln
                let name;

                // 1. Priorität: 1. Primary nehmen
                if (!kijs.isEmpty(this._primary)) {
                    name = this._primary[0];

                // 2. Priorität: 1. Spalte nehmen
                } else if (!kijs.isEmpty(this._columns)) {
                    name = this._columns[0];

                // sonst 'id' nehmen
                } else {
                    name = 'id';
                    this._columns.push(name);

                    // Daten konvertieren
                    for (let i=0; i<rows.length; i++) {
                        let row = this.getEmptyRowObject();
                        row[name] = rows[i];

                        // Sicherstellen, dass die neue Zeile auch alle erforderlichen Spalten hat.
                        this._completeRowObject(row);

                        rows[i] = row;
                    }

                }
                break;
        }
    }

    /**
     * Die Columns automatisch anhand der rows ermitteln
     * @param {Array} rows
     * @returns {Array} Array mit den Spaltennamen
     */
    _getColumnsFromRows(rows) {
        const columns = [];

        // Falls nur rows übergeben wurden und keine columns: Die columns automatisch generieren
        if (rows.length > 0) {
            for (let argName in rows[0]) {
                columns.push(argName);
            }
        }

        return columns;
    }


    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct() {
        // Variablen
        this._columns = null;
        this._rows = null;
        this._primary = null;
    }

};
