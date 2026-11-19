/* global kijs */

// --------------------------------------------------------------
// kijs.Number (Static)
// --------------------------------------------------------------
/**
 * Statische Klasse mit Hilfsfunktionen für Zahlen: formatieren, parsen, runden und Zufallszahlen.
 * Ohne Angabe der Trennzeichen gelten die der Sprache kijs.language (z.B. 'de-CH': 1'234.5,
 * 'de': 1.234,5, 'fr': 1 234,5).
 */
kijs.Number = class kijs_Number {


    // --------------------------------------------------------------
    // STATICS
    // --------------------------------------------------------------

    /**
     * Formatiert eine Zahl
     * @param {Number} number
     * @param {Number|String|null} [decimals=0]     // Anzahl Kommastellen '' oder null = auto
     * @param {String|null} [decPoint=null]         // Dezimaltrennzeichen. null = aus kijs.language
     * @param {String|null} [thousandsSep=null]     // Tausendertrennzeichen. null = aus kijs.language,
     *                                              // '' = keines
     * @returns {String}
     */
    static format(number, decimals=0, decPoint=null, thousandsSep=null) {
        let ret = '';

        if (decPoint === null) {
            decPoint = kijs.Number.getDecimalSeparator();
        }
        if (thousandsSep === null) {
            thousandsSep = kijs.Number.getThousandsSeparator();
        }

        // Bei decimals==='' oder null automatisch die Anzahl Kommastellen ermitteln
        if (decimals==='' || decimals===null) {
            let tmp = kijs.toString(number).split('.');
            if (tmp.length > 1) {
                decimals = tmp[1].length;
            } else {
                decimals = 0;
            }
        } else {
            decimals = Number(decimals);
        }

        // Zahl auf gegebene Präzision runden und in Array wandeln.
        let tmp = kijs.toString(Math.abs(kijs.Number.round(number, decimals))).split('.');

        // Tausendertrennzeichen einfügen
        if (!kijs.isEmpty(thousandsSep) && !kijs.isEmpty(tmp[0])) {
            const len = kijs.toString(tmp[0]).length;
            for (let i=len-1; i>=0; i--) {
                ret = tmp[0].substr(i, 1) + ret;
                if ((len-i) % 3 === 0 && i > 0) {
                    ret = thousandsSep + ret;
                }
            }
        } else {
            ret = tmp[0]+'';
        }

        // Anzahl Kommastellen
        if (decimals > 0 && !kijs.isEmpty(ret) && !kijs.isEmpty(decPoint)) {
            let digits = tmp.length > 1 ? kijs.toString(tmp[1]) : '';
            digits = kijs.String.padding(digits.substr(0, decimals), decimals, '0', 'right');
            ret += decPoint + digits;
        }


        // Negative Nummer
        if (kijs.Number.round(number, decimals) < 0) {
            ret = '-' + ret;
        }

        return ret;
    }
    
    /**
     * Gibt das Dezimaltrennzeichen einer Sprache zurück, z.B. '.' für 'de-CH' oder ',' für 'de'
     * @param {String|null} [language=null]  null = kijs.language
     * @returns {String}
     */
    static getDecimalSeparator(language=null) {
        return kijs.Number.#getSeparators(language).decimal;
    }

    /**
     * Gibt das Tausendertrennzeichen einer Sprache zurück, z.B. "'" für 'de-CH', '.' für 'de' oder
     * ein schmales Leerzeichen für 'fr'
     * @param {String|null} [language=null]  null = kijs.language
     * @returns {String}
     */
    static getThousandsSeparator(language=null) {
        return kijs.Number.#getSeparators(language).thousands;
    }

    /**
     * Parst ein String zu einer Nummer und rundet auf die angegebenen Decimals.
     * Die Funktion rundet kaufmännisch, d.H. 0.5 wird immer aufgerundet.
     * Ist das Tausendertrennzeichen ein Leerzeichen oder Apostroph, werden alle Varianten davon
     * entfernt (z.B. auch ein normales Leerzeichen statt des schmalen bei 'fr').
     * @param {String} number
     * @param {Number} [decimals=0]
     * @param {String|null} [decPoint=null]      Dezimaltrennzeichen. null = aus kijs.language
     * @param {String|null} [thousandsSep=null]  Tausendertrennzeichen. null = aus kijs.language
     * @returns {Number|null}
     */
    static parse(number, decimals=0, decPoint=null, thousandsSep=null) {
        if (decPoint === null) {
            decPoint = kijs.Number.getDecimalSeparator();
        }
        if (thousandsSep === null) {
            thousandsSep = kijs.Number.getThousandsSeparator();
        }

        number = kijs.toString(number);
        if (thousandsSep !== '') {
            number = kijs.String.replaceAll(number, thousandsSep, '');
            // Varianten von Leerzeichen und Apostroph
            if (/^[\s\u00a0\u202f'’]$/.test(thousandsSep)) {
                number = number.replace(/[\s\u00a0\u202f'’]/g, '');
            }
        }
        if (decPoint !== '.' && decPoint !== '') {
            number = kijs.String.replaceAll(number, decPoint, '.');
        }
        number = number.replace(/[^\-0-9\.]/g, '');
        number = window.parseFloat(number);

        if (!window.isNaN(number)) {
            if (decimals === 0) {
                number = window.parseInt(number.toFixed(0));
            } else {
                number = window.parseFloat(number.toFixed(decimals));
            }

            return number;
        }

        return null;
    }

    /**
     * Gibt eine Zufallszahl zwischen min und max (inklusiv) zurück
     * @param {Number} min
     * @param {Number} max
     * @returns {Number}
     */
    static random(min, max) {
        if (!kijs.isNumber(min)) {
            min = 0;
        }
        if (!kijs.isNumber(max)) {
            max = Number.MAX_SAFE_INTEGER;
        }
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min +1)) + min;
    }

    /**
     * Rundet einen Fliesskomma-Wert.
     * Halbe werden aufgerundet: Somit wird 1.5 zu 2 und -1.5 zu -2 (Kaufmännisches Runden).
     * @param {Number} number
     * @param {Number} precision
     * @returns {Number}
     */
    static round(number, precision=0) {
        return Number(Math.round(number + 'e' + precision) + 'e-' + precision);
    }

    /**
     * Rundet eine Zahl auf eine angegebene Präzision
     * @param {Number} number
     * @param {Number} roundTo Auf 5er Runden:0.05 auf 10er Runden:0.1 auf Franken:1
     * @returns {Number}
     */
    static roundTo(number, roundTo=0) {
        if (roundTo > 0) {
            return kijs.Number.round(number/roundTo) * roundTo;
        } else {
            return kijs.Number.round(number);
        }
    }


    // PRIVATE
    static #separators = {};    // Cache: Sprache => { decimal, thousands }

    /**
     * Ermittelt die Trennzeichen einer Sprache mit Intl.NumberFormat (mit Cache)
     * @param {String|null} language  null = kijs.language
     * @returns {Object} { decimal, thousands }
     */
    static #getSeparators(language) {
        language = language || kijs.language;

        if (!kijs.Number.#separators[language]) {
            let decimal = '.';
            let thousands = '\'';
            try {
                const parts = new Intl.NumberFormat(language).formatToParts(1234567.8);
                const d = parts.find(p => p.type === 'decimal');
                const g = parts.find(p => p.type === 'group');
                decimal = d ? d.value : decimal;
                thousands = g ? g.value : '';
            } catch (ex) {
                // unbekannte Sprache: Schweizer Format
            }
            kijs.Number.#separators[language] = { decimal: decimal, thousands: thousands };
        }

        return kijs.Number.#separators[language];
    }

};
