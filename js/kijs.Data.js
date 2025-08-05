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
     * @returns {Array}
     */
    static filter(rows, filters) {
        if (kijs.isEmpty(filters)) {
            return rows;
        }

        let newRows = [];

        kijs.Array.each(rows, function(row){
            if (kijs.Data.rowMatchFilters(row, filters)) {
                newRows.push(row);
            }
        });

        return newRows;
    }

    /**
     * Generiert einen Primary-Key-String aus den Primärschlüssel-Daten
     * @param {Array} row
     * @param {Array} primaryKeyFields
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
            key + row[field];
        }, this);

        return key;
    }

    /**
     * Passiert eine Data-Row einen Filter
     * @param {Array} row
     * @param {Array|Object} filters
     * @returns {Boolean}
     */
    static rowMatchFilters(row, filters) {
        if (kijs.isEmpty(filters)) {
            return true;
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
            // Klammer
            if (kijs.isEmpty(filters.field)) {
                if (filters.operator) {
                    bracketOperator = filters.operator;
                } else {
                    bracketOperator = 'AND';
                }
                parts = filters.parts;

            // Vergleichsoperation: Darum eine Klammer erstellen
            } else {
                parts = [filters];
                bracketOperator = 'AND';

            }

        // ungültig
        } else {
            throw new Error('Invalid filter.');

        }

        return kijs.Data._rowMatchFiltersSub(row, parts, bracketOperator);
    }

    /**
     * Gibt ein Array mit den indexen der Datensätzen zurück, die dem Filter entsprechen
     * @param {Array} rows
     * @param {Array|Object} filters
     * @returns {Array}
     */
    static search(rows, filters) {
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
     * @param {Array} [clone=true] Soll das original-Array rows unverändert bleiben?
     * @returns {Array}
     */
    static sort(rows, sortFields, clone=true) {
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

        return ret;
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

                        // und die % und _ wiederherstellen als * und .
                        regexp = regexp.replace(/(\\#\\[\\|\\>\\-\\.\\%\\.\\-\\<\\|\\]\\#)/gi, '*');
                        regexp = regexp.replace(/(\\#\\[\\|\\>\\-\\.\\_\\.\\-\\<\\|\\]\\#)/gi, '.');

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
