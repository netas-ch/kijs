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
    
    


    // --------------------------------------------------------------
    // STATICS
    // --------------------------------------------------------------
    /**
     * Gibt Zeilen aus einem Recordset zurück, die einem Filter entsprechen
     * 
     * Beispiel:
     * "filter":{
     *  "operator":"AND",
     *  "parts":[
     *   { "name":"Name", "operator":"=", "value":"Muster" }
     *   { "name":"Vorname", "operator":"=", "value":"Max" },
     *   { "name":"Anrede", "operator":"IN", "value":["Herr","Frau"] },
     *   {
     *    "operator":"OR",
     *    "parts":[
     *     { "name":"Kanton", "operator":"=", "value":"BE" },
     *     { "name":"Kanton", "operator":"=", "value":"SO" }
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
     *  "name":"Vorname",  Feldname
     *  "operator":"=",    Vergleichsoperator: "=", "!=", ">", ">=", "<", "<=", 
     *                                         "IN", "NOT IN",
     *                                         "LIKE", NOT LIKE",       Im value können wie in SQL 
     *                                                                  % und _ als Platzhalter 
     *                                                                  verwendet werden.
     *                                         "REGEXP", "NOT REGEXP"   Der value muss ein RegExp 
     *                                                                  (oder RegExp als String) sein
     *                                                                  
     *                                         Default: Wenn value ein Array ist: "IN" sonst "="
     *                                         
     *  "value":"Max"                          beliebiger Datentyp mit dem verglichen wird.
     * }
     * 
     * @param {Array} rows
     * @param {Array|Object} filter
     * @returns {Array}
     */
    static filter(rows, filter) {
        let newRows = [];
        
        kijs.Array.each(rows, function(row){
            if (this.rowMatchFilter(row, filter)) {
                newRows.push(row);
            }
        });
        
        return newRows;
    }
    
    static rowMatchFilter(row, filter) {
        let parts = filter;
        
        if (!kijs.isArray(filter)) {
            parts = [parts];
        }
        
        return this._rowMatchFilterSub(row, parts);
    }
    
    /**
     * Gibt ein Array mit den indexen der datrensätzen zurück, die dem Filter entsprechen
     * @param {Array} rows
     * @param {Array|Object} filter
     * @returns {Array}
     */
    static search(rows, filter) {
        let indexes = [];
        
        for (let i=0; i<rows.length; i++) {
            if (this.rowMatchFilter(rows[i], filter)) {
                indexes.push(i);
            }
        }
        
        return indexes;
    }
    
    static sort(rows, columns) {
        // TODO !!!!!!!!!!!!!!!!
    }
    
    
    
    // PROTECTED
    // recursive
    static _rowMatchFilterSub(row, parts, bracketOperator) {
        if (!bracketOperator) {
            bracketOperator = 'AND';
        }
        
        let ret = bracketOperator === 'AND';
        
        kijs.Array.each(parts, function(part) {
            // Klammer
            if (kijs.isEmpty(part.name)) {
                // Standard-Operator für Klammern: AND
                if (!part.operator) {
                    part.operator = 'AND';
                }
                
                if (!kijs.isArray(part.parts)) {
                    throw new Error('Property "parts" must be an array in filter.');
                }
                
                ret = this.rowMatchFilterSub(row, part.parts, part.operator);
              
            // Vergleichsoperation
            } else {
                // Standard-Operator für Vergleixhsoperationen: IN bei Array, sonst =
                if (!part.operator) {
                    part.operator = kijs.isArray(part.value) ? 'IN' : '=';
                }
                
                if (!kijs.isDefined(part.name)) {
                    throw new Error('Property "name" missing in filter.');
                }
                
                if (!kijs.isDefined(part.value)) {
                    throw new Error('Property "value" missing in filter.');
                }
                
                if (!kijs.isDefined(row[part.name])) {
                    throw new Error('Column "' + part.name + '" does not exist in recordset.');
                }

                let ok = false;
                
                switch (part.operator) {
                    case '=': ok = row[part.name] === part.value; break;
                    case '!=': ok = row[part.name] !== part.value; break;
                    
                    case '>': ok = row[part.name] > part.value; break;
                    case '>=': ok = row[part.name] >= part.value; break;
                    case '<': ok = row[part.name] < part.value; break;
                    case '<=': ok = row[part.name] <= part.value; break;
                    
                    case 'IN': 
                        ok = kijs.Array.contains(kijs.isArray(part.value) ? part.value : [part.value], row[part.name]);
                        break;
                    
                    case 'NOT IN': 
                        ok = !kijs.Array.contains(kijs.isArray(part.value) ? part.value : [part.value], row[part.name]); 
                        break;
                        
                    case 'LIKE':
                    case 'NOT LIKE':
                        let regexp = String(part.value);
                        // Like in Regexp umwandeln
                        
                        // dazu zuerst die % und _ ersetzen
                        regexp = regexp.replace(/(\%)/gmi, '#[|>-.%.-<|]#');
                        regexp = regexp.replace(/(\_)/gmi, '#[|>-._.-<|]#');

                        // dann alle Sonderzeichen maskieren
                        regexp = regexp.replace(/([^a-z0-9])/gmi, '\\$1');
                        
                        // und die % und _ wiederherstellen als * und .
                        regexp = regexp.replace(/(\\#\\[\\|\\>\\-\\.\\%\\.\\-\\<\\|\\]\\#)/gmi, '*');
                        regexp = regexp.replace(/(\\#\\[\\|\\>\\-\\.\\_\\.\\-\\<\\|\\]\\#)/gmi, '.');

                        regexp = new RegExp(regexp, 'gmi');
                        
                        ok = String(row[part.name]).match(regexp) !== null;
                        
                        if (part.operator === 'NOT LIKE') {
                            ok = !ok;
                        }
                        break;
                        
                    case 'REGEXP':
                    case 'NOT REGEXP':
                        let regexp = '';
                        if (kijs.isRegExp(part.value)) {
                            regexp = part.value;
                        } else if (kijs.isString(part.value)) {
                            regexp = new RegExp(part.value, 'gmi');
                        } else {
                            throw new Error('Property "value" must be a valid RegExp in filter.');
                        }
                        
                        ok = String(row[part.name]).match(regexp) !== null;
                        
                        if (part.operator === 'NOT REGEXP') {
                            ok = !ok;
                        }
                        break;
                        
                    default:
                        throw new Error('Unknown operator "' + part.operator + '" in filter.');
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
                
            }
            
        });
        
        
        return ret;
    }
    
};
