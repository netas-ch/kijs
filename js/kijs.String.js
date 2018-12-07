/* global kijs */

// --------------------------------------------------------------
// kijs.String (Static)
// --------------------------------------------------------------
kijs.String = class kijs_String {


    // --------------------------------------------------------------
    // STATICS
    // --------------------------------------------------------------
    
    /**
     * Überprüft, ob ein String mit einem gesuchten String beginnt
     * @param {String} text
     * @param {String} search
     * @returns {Boolean}
     */
    static beginsWith(text, search) {
        return text.indexOf(search) === 0;
    }
    
    /**
     * Überprüft, ob ein String einen gesuchten String enthält
     * @param {String} text
     * @param {String} search
     * @returns {Boolean}
     */
    static contains(text, search) {
        return text.indexOf(search) >= 0;
    }
    
    /**
     * Überprüft, ob ein String mit einem gesuchten String endet
     * @param {String} text
     * @param {String} search
     * @returns {Boolean}
     */
    static endsWith(text, search) {
        return text.indexOf(search, text.length - search.length) !== -1;
    }

    /**
     * Wandelt Sonderzeichen in HTML-Codes um
     * @param {String}  text           Die zu konvertierende Zeichenkette.
     * @param {Boolean} [doubleEncode] Wird der Parameter doubleEncode ausgeschaltet,
     *                                 kodiert es bereits existierende HTML-Entities
     *                                 nicht noch einmal. Standardmässig werden
     *                                 jedoch alle Zeichen konvertiert.
     * @returns {String}
     */
    static htmlspecialchars(text, doubleEncode=true) {
        let replaces = [
            {f:'&', t: '&amp;'},
            {f:'"', t: '&quot;'},
            {f:'\'', t: '&apos;'},
            {f:'<', t: '&lt;'},
            {f:'>', t: '&gt;'}
        ];

        if (!doubleEncode) {
            kijs.Array.each(replaces, function(replace) {
                text = kijs.String.replaceAll(text, replace.t, replace.f);
            }, this);
        }

        kijs.Array.each(replaces, function(replace) {
            text = kijs.String.replaceAll(text, replace.f, replace.t);
        }, this);

        return text;
    }
    
    /**
     * Ergänzt eine Zahl mit vorangestellten Nullen
     * @param {String} text
     * @param {Number} length
     * @param {String} [padString=' ']
     * @param {String} [type='right'] 'left', 'right' oder 'both'
     * @returns {String}
     */
    static padding(text, length, padString, type) {
        length = length || 0;
        text = text + '';
        while (text.length < length) {
            if (type === 'left' || type === 'both') {
                text = padString + text;
            }
            
            if (!type || type === 'right' || type === 'both') {
                text = text + padString;
            }
        }
        return text;
    }

    /**
     * Ersetzt alle Vorkommen in einem String ohne reguläre Ausdrücke
     * @param {String} text
     * @param {String} search
     * @param {String} replace
     * @returns {String} replace
     */
    static replaceAll(text, search, replace) {
        text = kijs.isEmpty(text) ? '' : text;
        search = kijs.isEmpty(search) ? '' : search;
        replace = kijs.isEmpty(replace) ? '' : replace;
        return text.split(search).join(replace);
    }
    
    /**
     * Kürzt eine Zeichenkette auf eine maximale Länge und fügt ein "…"-Zeichen an
     * @param {string} text
     * @param {number} length maximlae Länge
     * @param {boolean} [useWordBoundary=false] Nur bei Leerzeichen abschnieden
     * @param {string} [postFixChar='…'] Zeichen, dass beim Abschneiden angehängt wird
     * @returns {String}
     */
    static trunc(text, length, useWordBoundary=false, postFixChar='…') {
        if (kijs.isEmpty(text) || !length || text.length <= length) {
            return text;
        }
        let subString = text.substr(0, length-1);
        if (useWordBoundary) {
            subString = subString.substr(0, subString.lastIndexOf(' '));
        }
        return subString + '' + postFixChar;
    }

    /**
     * Fügt Zeilenumbrüche in eine Zeichenkette ein
     * https://stackoverflow.com/a/51506718
     * @param {string} text
     * @param {number} length Anzahl Zeichen pro Zeile
     * @param {boolean} [useWordBoundary=true] Nur bei Leerzeichen Umbrüche einfügen
     * @returns {string}
     */
    static wrap(text, length, useWordBoundary=true) {
        if (useWordBoundary) {
            return text.replace(new RegExp(`(?![^\\n]{1,${length}}$)([^\\n]{1,${length}})\\s`, 'g'), '$1\n');
        } else {
            return text.replace(new RegExp(`(?![^\\n]{1,${length}}$)([^\\n]{1,${length}})`, 'g'), '$1\n');
        }
    }
};