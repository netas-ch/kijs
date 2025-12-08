/* global kijs */

// --------------------------------------------------------------
// kijs.Data (Static)
// --------------------------------------------------------------
/*
 *
 */
kijs.Data = class kijs_Data {

    // --------------------------------------------------------------
    // STATIC GETTERS / SETTERS
    // --------------------------------------------------------------
    static primaryKeyDelimiter = '#|[kijs]|#';



    // --------------------------------------------------------------
    // STATICS
    // --------------------------------------------------------------
    /**
     * Gibt Zeilen aus einem Recordset zurück, die einem Filter entsprechen
     *
     * Beispiel:
     * "filters":{
     *  "operator":"AND",
     *  "parts":[
     *   { "field":"Name", "operator":"=", "value":"Muster" }
     *   { "field":"Vorname", "operator":"=", "value":"Max" },
     *   { "field":"Anrede", "operator":"IN", "value":["Herr","Frau"] },
     *   {
     *    "operator":"OR",
     *    "parts":[
     *     { "field":"Kanton", "operator":"=", "value":"BE" },
     *     { "field":"Kanton", "operator":"=", "value":"SO" }
     *    ]
     *   }
     *  ]
     * }
     *
     * Filter sind aus parts aufgebaut. Es gibt zwei verschiedene parts:
     *
     * Klammer
     * -------
     * Klammern werden verwendet um parts zu gruppieren und mit AND oder OR zu verknüpfen.
     * {
     *  "operator":"AND",  Logischer Operator: "AND", "OR" default: "AND"
     *  "invert":true,     Soll das Ergebnis der Gruppe invertiert werden? default: false
     *  "parts":[ ... ]    Array mit untergeordneten Parts.
     * }
     *
     *
     * Vergleichsoperation
     * -------------------
     * Eine Vergleichsoperation wird zum Vergleichen der Zelle im Recordset mit
     * einem vorgegebenen Wert benutzt.
     * {
     *  "field":"Vorname",  Feldname
     *  "operator":"=",    Vergleichsoperator: default: bei einem Array als value "IN", sonst "MATCH"
     *
     *                                         "=", "!=",
     *
     *                                         ">", ">=", "<", "<=",
     *
     *                                         "BEGIN",                 der Anfang muss übereinstimmen (CI)
     *                                         "PART",                  ein beliebiger Teil muss übereinstimmen (CI)
     *                                         "END",                   das Ende muss übereinstimmen (CI)
     *                                         "MATCH",                 Wert muss übereinstimmen (CI)
     *                                         "NOT",                   Wert darf nicht übereinstimmen (CI)
     *
     *                                         "IN", "NOT IN",          Der Wert muss im Array vorkommen.
     *                                                                  Value muss ein Array sein.
     *
     *                                         "LIKE", NOT LIKE",       Im value können wie in SQL
     *                                                                  % und _ als Platzhalter
     *                                                                  verwendet werden. (CI)
     *
     *                                         "REGEXP", "NOT REGEXP"   Der value muss ein RegExp
     *                                                                  (oder RegExp als String) sein
     *                                                                  Beispiel: '/^[0-9A-Z]{3,4}$/gmi'
     *
     *                                                                  (CI) = case-insensitive = Gross und Kleinschreibung muss nicht übereinstimmen
     *
     *                                         Default: Wenn value ein Array ist: "IN" sonst "="
     *
     *  "value":"Max"                          beliebiger Datentyp mit dem verglichen wird.
     * }
     *
     * @param {Array} rows
     * @param {Array|Object} filters
     * @param {Array|String|null} [childrenField=null] Für rekursives Filtern: Name des
     *                                               Feldes, dass die Kinder enthält
     * @returns {Array}
     */
    static filter(rows, filters, childrenField=null) {
        if (kijs.isEmpty(filters)) {
            return [];
        }

        let newRows = [];

        kijs.Array.each(rows, function(row){
            if (kijs.Data.rowMatchFilters(row, filters)) {
                newRows.push(row);
            }

            // Falls auch Kinder durchsucht werden sollen: Rekursiver Aufruf
            if (!kijs.isEmpty(childrenField) && !kijs.isEmpty(row[childrenField])) {
                let childrenRows = kijs.Data.filter(row[childrenField],
                        filters, childrenField);
                if (!kijs.isEmpty(childrenRows)) {
                    newRows = kijs.Array.concat(newRows, childrenRows);
                }
            }
        });

        return newRows;
    }

    /**
     * Gibt Zeilen aus einem Recordset zurück, die einem übergebenen primaryKey entsprechen
     * @param {Array} rows
     * @param {Array} primaryKeys
     * @param {Array|String} primaryKeyFields
     * @param {Array|String|null} [childrenField=null] Für rekursives Filtern: Name des
     *                                               Feldes, dass die Kinder enthält
     * @returns {Array}
     */
    static filterByPrimaryKeys(rows, primaryKeys, primaryKeyFields, childrenField=null) {
        let newRows = [];

        if (kijs.isString(primaryKeyFields)) {
            primaryKeyFields = [primaryKeyFields];
        }

        kijs.Array.each(rows, function(row) {
            let key = kijs.Data.getPrimaryKeyString(row, primaryKeyFields);

            if (kijs.Array.contains(primaryKeys, key)) {
                newRows.push(row);
            }

            // Falls auch Kinder durchsucht werden sollen: Rekursiver Aufruf
            if (!kijs.isEmpty(childrenField) && !kijs.isEmpty(row[childrenField])) {
                let childrenRows = kijs.Data.filterByPrimaryKeys(row[childrenField],
                        primaryKeys, primaryKeyFields, childrenField);
                if (!kijs.isEmpty(childrenRows)) {
                    newRows = kijs.Array.concat(newRows, childrenRows);
                }
            }
        });

        return newRows;
    }

    /**
     * Generiert einen PrimaryKey-String aus den Primärschlüssel-Daten
     * @param {Array} row
     * @param {Array|String} primaryKeyFields
     * @returns {String}
     */
    static getPrimaryKeyString(row, primaryKeyFields) {
        let key = '';

        if (kijs.isString(primaryKeyFields)) {
            primaryKeyFields = [primaryKeyFields];
        }

        if (kijs.isEmpty(primaryKeyFields)) {
            primaryKeyFields = [];
        }

        if (!kijs.isArray(primaryKeyFields)) {
            throw new kijs.Error(`primaryKeyFields must be a string or an array.`);
        }

        kijs.Array.each(primaryKeyFields, function(field){
            if (!field in row) {
                throw new kijs.Error(`primaryKey-field dosent exist in row.`);
            }

            if (!kijs.isEmpty(key)) {
                key += this.primaryKeyDelimiter;
            }
            key += row[field];
        }, this);

        return key;
    }

    /**
     * Gibt die Zeile aus einem Recordset zurück, die dem übergebenen primaryKey entspricht
     * @param {Array} rows
     * @param {String} primaryKey
     * @param {Array|String} primaryKeyFields
     * @param {Array|String|null} [childrenField=null] Für rekursive Recordsets: Name des
     *                                               Feldes, dass die Kinder enthält
     * @returns {Array}
     */
    getRowByPrimaryKey(rows, primaryKey, primaryKeyFields, childrenField=null) {
        if (kijs.isString(primaryKeyFields)) {
            primaryKeyFields = [primaryKeyFields];
        }

        for (let i=0; i<rows.length; i++) {
            let key = kijs.Data.getPrimaryKeyString(rows[i], primaryKeyFields);

            if (primaryKey === key) {
                return rows[i];
            }

            // Falls auch Kinder durchsucht werden sollen: Rekursiver Aufruf
            if (!kijs.isEmpty(childrenField) && !kijs.isEmpty(rows[i][childrenField])) {
                let childRow = kijs.Data.getRowByPrimaryKey(rows[i][childrenField],
                        primaryKey, primaryKeyFields, childrenField);
                if (!kijs.isEmpty(childRow)) {
                    return childRow;
                }
            }
        }

        return null;
    }

    /**
     * Passiert eine Data-Row einen Filter?
     * @param {Array} row
     * @param {Array|Object} filters
     * @returns {Boolean}
     */
    static rowMatchFilters(row, filters) {
        if (kijs.isEmpty(filters)) {
            return false;
        }

        let parts = null;
        let bracketOperator = null;

        // Was wurde übergeben?

        // parts Array (Klammer nur das parts-Array)
        if (kijs.isArray(filters)) {
            bracketOperator = 'AND';
            parts = filters;

        // part objekt
        } else if (kijs.isObject(filters)) {
            bracketOperator = 'AND';
            parts = [filters];

        // ungültig
        } else {
            throw new Error('Invalid filter.');

        }

        return kijs.Data._rowMatchFiltersSub(row, parts, bracketOperator);
    }

    /**
     * Gibt ein Array mit den indexen der Datensätzen zurück, die dem Filter entsprechen
     * Achtung: Funktioniert nicht mit rekursiven Recordsets!
     * @param {Array} rows
     * @param {Array|Object} filters
     * @returns {Array}
     */
    static search(rows, filters) {
        if (kijs.isEmpty(filters)) {
            return [];
        }

        let indexes = [];

        for (let i=0; i<rows.length; i++) {
            if (kijs.Data.rowMatchFilters(rows[i], filters)) {
                indexes.push(i);
            }
        }

        return indexes;
    }

    /**
     * Sortiert ein Recordset
     *
     * Beispiel:
     *  [
     *   { "field":"Alter", "desc":true },  // Absteigend nach Alter
     *   { "field":"Ort", "desc":false },   // Aufsteigend nach Ort
     *   { "field":"Name" },                // Aufsteigend nach Name
     *   "Vorname"                          // Aufsteigend nach Vorname (Kurzschreibweise)
     *  ]
     *
     * "field"      Feldname des zu sortierenden Felds
     * "desc"       Aufsteigend (false, default) oder Absteigend (true) sortieren
     *      *
     * @param {Array} rows
     * @param {Array} sortFields   Array mit der Sortierungskonfiguration
     *                             Beispiel: [ { "field":"Alter", "desc":true }, "Vorname" ]
     * @param {Array|String|null} [childrenField=null] Für rekursive Recordsets: Name des
     *                                               Feldes, dass die Kinder enthält
     * @param {Array} [clone=true] Soll das original-Array rows unverändert bleiben?
     * @returns {Array}
     */
    static sort(rows, sortFields, childrenField=null, clone=true) {
        let ret;

        // Evtl. Kopie des Arrays erstellen
        if (clone) {
            ret = [...rows];
        } else {
            ret = rows;
        }

        // Funktion zum Sortieren basierend auf den Feldern und Sortierrichtungen
        ret.sort((a, b) => {
            for (let field of sortFields) {
                let fieldName = field.field;
                let desc = field.desc;

                if (kijs.isObject(field)) {
                    fieldName = field.field;
                    desc = field.desc ?? false;

                } else {
                    fieldName = field;
                    desc = false;

                }

                // Vergleich der Werte
                let comparison = 0;
                if (a[fieldName] > b[fieldName]) {
                    comparison = 1;
                } else if (a[fieldName] < b[fieldName]) {
                    comparison = -1;
                }

                // Evtl. Sortierrichtung drehen
                if (desc) {
                    comparison = -comparison;
                }

                // Wenn ein Unterschied gefunden wurde, den Vergleich zurückgeben
                if (comparison !== 0) {
                    return comparison;
                }
            }

            // Wenn alle Felder gleich sind, keine Änderung vornehmen
            return 0;
        });

        // Falls auch Kinder sortiert werden sollen: Rekursiver Aufruf
        if (!kijs.isEmpty(childrenField)) {
            for (let i=0, len=ret.length; i<len; i++) {
                if (!kijs.isEmpty(ret[i][childrenField])) {
                    let childrenRows = kijs.Data.sort(ret[i][childrenField], sortFields, childrenField, clone);
                    if (clone) {
                        ret[i][childrenField] = childrenRows;
                    }
                }
            }
        }

        return ret;
    }

    /**
     * Verweise in einem Recordset aktualiseren
     * Falls kein Primärschlüssel definiert wurde, arbeitet kijs mit den Verweisen
     * auf die einzelnen Zeilen (row). Werden die Daten neu via RPC geladen,
     * stimmen die Verweise nicht mehr, da sie auf das alte Recordset verweisen.
     * Mit dieser Funktion können die Verweise aktualisiert werden.
     * @param {Array} rows Array mit alten Verweisen
     * @param {Array} data Array mit dem neuen Recordset
     * @param {Array|String|null} [childrenField=null] Für rekursive Recordsets: Name des
     *                                               Feldes, dass die Kinder enthält
     * @returns {Array} Gibt ein Array mit den neuen Verweisen zurück
     */
    static updateRowsReferences(rows, data, childrenField=null) {
        if (kijs.isEmpty(rows) || kijs.isEmpty(data)) {
            return [];
        }

        // ein PrimaryKey über alle Spalten anlegen
        let tempPrimaryKeyFields = Object.keys(rows[0]);

        // Die PrimaryKeys der Zeilen ermitteln
        let tempPrimaryKeys = [];
        for (let i=0, len=rows.length; i<len; i++) {
            tempPrimaryKeys.push(kijs.Data.getPrimaryKeyString(rows[i], tempPrimaryKeyFields));
        }

        // Die Zeilen zu den erstellten PrimaryKeys aus dem neuen Recordset ermitteln
        return kijs.Data.filterByPrimaryKeys(data, tempPrimaryKeys, tempPrimaryKeyFields, childrenField);
    }


    // PROTECTED
    // recursive
    static _rowMatchFiltersSub(row, parts, bracketOperator) {
        if (bracketOperator) {
            bracketOperator = bracketOperator.toUpperCase();
        } else {
            bracketOperator = 'AND';
        }

        let ret = bracketOperator === 'AND';

        kijs.Array.each(parts, function(part) {
            let ok = false;
            let regexp = null;

            // Klammer
            if (kijs.isEmpty(part.field)) {
                // Standard-Operator für Klammern: AND
                if (!part.operator) {
                    part.operator = 'AND';
                }

                if (!kijs.isArray(part.parts)) {
                    throw new Error('Property "parts" must be an array in filter.');
                }

                ok = kijs.Data._rowMatchFiltersSub(row, part.parts, part.operator);

                // evtl. negieren
                if (part.invert) {
                    ok = !ok;
                }

            // Vergleichsoperation
            } else {
                // Standard-Operator für Vergleixhsoperationen: IN bei Array, sonst =
                if (part.operator) {
                    part.operator = part.operator.toUpperCase();
                } else {
                    part.operator = kijs.isArray(part.value) ? 'IN' : 'MATCH';
                }

                if (!kijs.isDefined(part.field)) {
                    throw new Error('Property "field" missing in filter.');
                }

                if (!kijs.isDefined(part.value)) {
                    throw new Error('Property "value" missing in filter.');
                }

                if (!kijs.isDefined(row[part.field])) {
                    throw new Error('Column "' + part.field + '" does not exist in recordset.');
                }

                switch (part.operator) {
                    case '=':       // case-sensitive
                        ok = row[part.field] === part.value;
                        break;
                    case '!=':      // case-sensitive
                        ok = row[part.field] !== part.value;
                        break;

                    case '>':       // case-sensitive
                        ok = row[part.field] > part.value;
                        break;
                    case '>=':      // case-sensitive
                        ok = row[part.field] >= part.value;
                        break;
                    case '<':       // case-sensitive
                        ok = row[part.field] < part.value;
                        break;
                    case '<=':      // case-sensitive
                        ok = row[part.field] <= part.value;
                        break;

                    case 'BEGIN':   // case-insensitive !
                        ok = kijs.String.beginsWith(row[part.field], part.value, true);
                        break;
                    case 'PART':    // case-insensitive !
                        ok = kijs.String.contains(row[part.field], part.value, true);
                        break;
                    case 'END':     // case-insensitive !
                        ok = kijs.String.endsWith(row[part.field], part.value, true);
                        break;
                    case 'MATCH':   // case-insensitive !
                        ok = kijs.String.match(row[part.field], part.value, true);
                        break;
                    case 'NOT':     // case-insensitive !
                        ok = !kijs.String.match(row[part.field], part.value, true);
                        break;

                    case 'IN':      // case-sensitive
                    case 'NOT IN':  // case-sensitive
                        ok = kijs.Array.contains(kijs.isArray(part.value) ? part.value : [part.value], row[part.field]);
                        if (part.operator === 'NOT IN') {
                            ok = !ok;
                        }
                        break;

                    case 'LIKE':    // case-insensitive !
                    case 'NOT LIKE':// case-insensitive !
                        regexp = String(part.value);
                        // Like in Regexp umwandeln

                        // dazu zuerst die % und _ ersetzen
                        regexp = regexp.replace(/(\%)/g, '#[|>-.%.-<|]#');
                        regexp = regexp.replace(/(\_)/g, '#[|>-._.-<|]#');

                        // dann alle Sonderzeichen maskieren
                        regexp = regexp.replace(/([^a-z0-9])/gi, '\\$1');

                        // und die % und _ wiederherstellen als .* und .
                        regexp = regexp.replace(/(\\#\\\[\\\|\\\>\\\-\\\.\\\%\\\.\\\-\\\<\\\|\\\]\\\#)/gi, '.*');
                        regexp = regexp.replace(/(\\#\\\[\\\|\\\>\\\-\\\.\\\_\\\.\\\-\\\<\\\|\\\]\\\#)/gi, '.');

                        // Sicherstellen, dass vorher und nachher keine Zeichen sind
                        regexp = '^' + regexp + '$';

                        regexp = new RegExp(regexp, 'gi');

                        ok = String(row[part.field]).match(regexp) !== null;

                        if (part.operator === 'NOT LIKE') {
                            ok = !ok;
                        }
                        break;

                    case 'REGEXP':
                    case 'NOT REGEXP':
                        regexp = '';
                        if (kijs.isRegExp(part.value)) {
                            regexp = part.value;
                        } else if (kijs.isString(part.value)) {
                            regexp = kijs.String.toRegExp(part.value);
                        } else {
                            throw new Error('Property "value" must be a valid RegExp in filter.');
                        }

                        ok = String(row[part.field]).match(regexp) !== null;

                        if (part.operator === 'NOT REGEXP') {
                            ok = !ok;
                        }
                        break;

                    default:
                        throw new Error('Unknown operator "' + part.operator + '" in filter.');
                }

                // evtl. negieren
                if (part.invert) {
                    ok = !ok;
                }
            }

            switch (bracketOperator) {
                case 'AND':
                    ret = ret && ok;
                    break;

                case 'OR':
                    ret = ret || ok;
                    break;

                default:
                    throw new Error('Unknown operator "' + bracketOperator + '" in filter.');
            }

        });

        return ret;
    }

};
