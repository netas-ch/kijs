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
     * Konvertiert einen HTML-String in einen String, in dem Unicode-Zeichen durch HTML-Entities ersetzt werden
     * Es werden folgende Zeichen ersetzt
     *  - Unicode 00A0 - 9999
     *  - < und >
     *  - &
     *  - "
     *  - '
     * Beispiel: '<p>Test</p>' => '&#60;p&#62;Test&#60;/p&#62;'
     * @param {String} html
     * @returns {String}
     */
    static htmlentities(html) {
        return kijs.toString(html).replace(/[\u00A0-\u9999<>\&\'\"]/gim, function(i) {
            return '&#x' + i.codePointAt(0).toString(16) + ';';
        });
    }

    /**
     * Konvertiert einen HTML-String in einen String, in dem die HTML-Entities durch die entsprechenden Unicode-Zeichen ersetzt sind
     *
     * @param {String} html
     * @returns {String}
     */
    static htmlentities_decode(html) {

        // Geschwindigkeit optimieren, falls der String nur aus einem einzelen entity ("&#xabab;") besteht
        if (kijs.isString(html) && (html.length === 7 || (html.length === 8 && html[7] === ';')) && html.substr(0,3) === '&#x') {
            return String.fromCodePoint(window.parseInt(html.substr(3,4), 16));
        }

        // HTML-Entities suchen und ersetzen
        let decoded = kijs.toString(html).replace(/&#(x[0-9a-f]+|[0-9]+)(;|$)/gim, function(entity, number) {
            let nr = null;
            if (number.substr(0,1).toLowerCase() === 'x') {
                nr = window.parseInt(number.substr(1), 16);
            } else {
                nr = window.parseInt(number, 10);
            }

            if (kijs.isNumber(nr)) {
                return String.fromCodePoint(nr);
            } else {
                return entity;
            }
        });

        // benannte Entities
        if (decoded.length > 3) {
            let namedEntity = [
                ['nbsp', 160],
                ['lt',   60],
                ['gt',   62],
                ['amp',  38],
                ['quot', 34],
                ['apos', 39],
                ['euro', 8364],
                ['copy', 169],
                ['reg',  174]
            ];
            for (let i=0; i < namedEntity.length; i++) {
                decoded = kijs.String.replaceAll(decoded, '&' + namedEntity[i][0] + ';',  String.fromCodePoint(namedEntity[i][1]));
            }
        }

        return decoded;
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
     * Fügt vor allen Zeilenumbrüchen eines Strings HTML-Zeilenumbrüche ein
     * @param {String} text
     * @returns {String}
     */
    static nl2br(text) {
        return kijs.toString(text).replace(/(?:\r\n|\n\r|\n|\r)/g, "<br />\n");
    }

    /**
     * Ergänzt eine Zahl mit vorangestellten Nullen
     * @param {String} text
     * @param {Number} length
     * @param {String} [padString=' ']
     * @param {String} [type='right'] 'left', 'right' oder 'both'
     * @returns {String}
     */
    static padding(text, length, padString=' ', type='right') {
        length = length || 0;
        text = kijs.toString(text);
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
     * Maskiert Zeichen regulärer Ausdrücke
     * @param {String} text
     * @returns {String}
     */
    static regexpEscape(text) {
        return kijs.toString(text).replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&');
    }

    /**
     * Wiederholt einen String.
     * Gibt text multiplier mal wiederholt zurück.
     * @param {String} text
     * @param {Number} multiplier
     * @returns {String}
     */
    static repeat(text, multiplier) {
        let ret = '';
        for (let i=0; i<multiplier; i++) {
            ret += kijs.toString(text);
        }
        return ret;
    }

    /**
     * Ersetzt alle Vorkommen in einem String ohne reguläre Ausdrücke
     * @param {String} text
     * @param {String} search
     * @param {String} replace
     * @returns {String} replace
     */
    static replaceAll(text, search, replace) {
        text = kijs.toString(text);
        search = kijs.toString(search);
        replace = kijs.toString(replace);
        return kijs.isFunction(text.replaceAll) ? text.replaceAll(search, replace) : text.split(search).join(replace);
    }
    
    /**
     * Konventiert einen String in einen Regulären Ausdruck (RegExp)
     * @param {String} text Regulärer Ausdruck als String Beispiel: '/^[0-9A-Z]{3,4}$/i'
     * @returns {RegExp|Boolean} Regulärer Ausdruck oder false bei Fehler
     */
    static toRegExp(text) {
        // Falls es bereits ein RegExp ist: direkt zurückgeben
        if (kijs.isRegExp(text)) {
            return text;
        }
        
        // Es muss ein String sein!
        if (!kijs.isString(text)) {
            return false;
        }
        
        // Der RegExp muss mit / eingeschlossen sein. Dahinter können noch modifiers sein.
        if (text[0] !== '/') {
            return false;
        }
        let i = text.lastIndexOf('/');
        if (i <= 0) {
            return false;
        }
        
        // RegExp erstellen
        try {
            return new RegExp(text.slice(1, i), text.slice(i+1));
        } catch (ex) {
            return false;
        }
    }

    /**
     * Kürzt eine Zeichenkette auf eine maximale Länge und fügt ein "…"-Zeichen an
     * @param {String} text
     * @param {Number} length maximale Länge
     * @param {Boolean} [useWordBoundary=false] Nur bei Leerzeichen abschneiden
     * @param {String} [postFixChar='…'] Zeichen, dass beim Abschneiden angehängt wird
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
     * @param {String} text
     * @param {Number} length Anzahl Zeichen pro Zeile
     * @param {Boolean} [useWordBoundary=true] Nur bei Leerzeichen Umbrüche einfügen
     * @returns {String}
     */
    static wrap(text, length, useWordBoundary=true) {
        if (useWordBoundary) {
            return text.replace(new RegExp(`(?![^\\n]{1,${length}}$)([^\\n]{1,${length}})\\s`, 'g'), '$1\n');
        } else {
            return text.replace(new RegExp(`(?![^\\n]{1,${length}}$)([^\\n]{1,${length}})`, 'g'), '$1\n');
        }
    }
};
