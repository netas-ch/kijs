/* global kijs */

// --------------------------------------------------------------
// kijs.Date (Static)
// --------------------------------------------------------------
/*
 * Datumsformatierung
 * ------------------
 * date.format(date, 'd.m.Y H:i', de);
 *
 * Tag
 * d   Tag des Monats, 2-stellig mit führender Null  01 bis 31
 * D   Wochentag, gekürzt auf zwei Buchstaben  Mo bis So
 * j   Tag des Monats ohne führende Nullen    1 bis 31
 * l   (kleines 'L') Ausgeschriebener Wochentag Montag bis Sontag
 *
 * Monat
 * F   Monat als ganzes Wort, wie Januar bis Dezember
 * m   Monat als Zahl, mit führenden Nullen  01 bis 12
 * M   Monatsname mit drei Buchstaben  Jan bis Dez
 * n   Monatszahl, ohne führende Nullen  1 bis 12
 *
 * Woche
 * W  ISO-8601 Wochennummer des Jahres, die Woche beginnt am Montag
 *
 * Jahr
 * Y   Vierstellige Jahreszahl  Beispiele: 1999 oder 2003
 * y   Jahreszahl, zweistellig  Beispiele: 99 oder 03
 * L   Schaltjahr oder nicht  1 für ein Schaltjahr, ansonsten 0
 *
 * Uhrzeit
 * G   Stunde im 24-Stunden-Format, ohne führende Nullen  0 bis 23
 * H   Stunde im 24-Stunden-Format, mit führenden Nullen  00 bis 23
 * i   Minuten, mit führenden Nullen  00 bis 59
 * s   Sekunden, mit führenden Nullen  00 bis 59
 */
kijs.Date = class kijs_Date {

    // --------------------------------------------------------------
    // STATICS
    // --------------------------------------------------------------
    /**
     * Addiert oder subtrahiert Tage zu einem Datum
     * @param {Date} date
     * @param {Number} days
     * @returns {Date}
     */
    static addDays(date, days) {
        const ret = new Date(date.valueOf());
        ret.setDate(ret.getDate() + days);
        return ret;
    }

    /**
     * Addiert oder subtrahiert Monate zu einem Datum
     * @param {Date} date
     * @param {Number} months
     * @returns {Date}
     */
    static addMonths(date, months) {
        const ret = new Date(date.valueOf());
        ret.setMonth(ret.getMonth() + months);
        return ret;
    }

    /**
     * Addiert oder subtrahiert Jahre zu einem Datum
     * @param {Date} date
     * @param {Number} yars
     * @returns {Date}
     */
    static addYears(date, yars) {
        const ret = new Date(date.valueOf());
        ret.setFullYear(ret.getFullYear() + yars);
        return ret;
    }

    /**
     * Klont ein Datumsobjekt
     * @param {Date} date
     * @returns {Date}
     */
    static clone(date) {
        return new Date(date.getTime());
    }

    /**
     * Vergleicht zwei Datumswerte und gibt bei identischem Wert true zurück
     * @param {Date|null} date1
     * @param {Date|null} date2
     * @returns {Boolean}
     */
    static compare(date1, date2) {
        if (date1 instanceof Date !== date2 instanceof Date) {
            return false;
        }

        if (date1 instanceof Date) {
            return date1.getTime() === date2.getTime();
        } else {
            return date1 === date2;
        }
    }

    /**
     * Erstellt ein Datum aus
     *  - Datum: Datum wird geklont
     *  - Unix-Zeitstempel (Sekunden)
     *  - SQL-Datums-String "2017-01-01 10:00:00"
     *  - Array mit folgenden Werten [Jahr, Monat, Tag, Stunden, Minuten, Sekunden]
     *  @param {String|Date|Number} arg
     * @returns {Date|null}
     */
    static create(arg) {
        let ret = null;

        // Date übergeben: Klonen
        if (arg instanceof Date) {
            ret = this.clone(arg);

        // Unix-Zeitstempel (Sekunden)
        } else if (kijs.isNumber(arg)) {
            ret = new Date(arg*1000);

        // SQL-Zeitstempel '2017-01-01' oder '2017-01-01 10:00:00'
        } else if (kijs.isString(arg) && arg.match(/^[0-9]{4}-[0-9]{2}-[0-9]{2}/)) {
            ret = this.getDateFromSqlString(arg);

        // Array
        // Beispiele: [2018, 05, 26, 14, 57, 12] => "2018-05-26 14:57:12"
        //            [2018, 05] => "2018-05-01 00:00:00"
        //            [2018] => "2018-01-01 00:00:00"
        } else if (kijs.isArray(arg) && arg.length > 0) {
            let year = parseInt(arg[0]);
            let month = 1;
            let day = 1;
            let hour = 0;
            let minute = 0;
            let second = 0;

            if (arg.length > 1) month = parseInt(arg[1]);
            if (arg.length > 2) day = parseInt(arg[2]);
            if (arg.length > 3) hour = parseInt(arg[3]);
            if (arg.length > 4) minute = parseInt(arg[4]);
            if (arg.length > 5) second = parseInt(arg[5]);

            ret = new Date(year, month-1, day, hour, minute, second);
        }

        // Ist das Datum ungültig?
        if (!kijs.isDate(ret)) {
            ret = null;
        }

        return ret;
    }

    /**
     * Gibt die Anzahl Tage zwischen zwei Daten zurück (date2 - date1)
     * @param {Date} date1
     * @param {Date} date2
     * @return {Number}
     */
    static diff(date1, date2) {
        return Math.round((date2-date1)/(1000*60*60*24));
    }

    /**
     * Gibt ein formatierter Datumsstring zurück.
     * Parameterliste siehe PHP
     * @param {Date} date
     * @param {String} format
     * @returns {String}
     */
    static format(date, format) {
        return kijs.toString(format).replace(/[a-zA-Z]/g, (letter) => {
            return this.#formatReplace(letter, date);
        });
    }

    /**
     * Berechnet das Alter aus einem Geburtsdatum
     * @param {String|Date|Number} birthday
     * @param {String|Date|Number|Null} [curDate=Now]
     * @returns {Number|Null}
     */
    static getAge(birthday, curDate) {
        if (kijs.isEmpty(birthday)) {
            return null;
        } else {
            birthday = kijs.Date.getDatePart(birthday);
        }
        
        if (kijs.isEmpty(curDate)) {
            curDate = Date.now();
        } else {
            curDate = kijs.Date.getDatePart(curDate);
        }
        
        if (birthday > curDate) {
            return null;
        }
        
        const ageDifMs = curDate - birthday;
        const ageDate = new Date(ageDifMs);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    }
    
    /**
     * Konvertiert eine Wochennummer ein Datum-Objekt
     * Format: [A-Z ]+([0-9]+) ([0-9]+)
     *         Prefix  Woche   Jahr
     *
     * Es muss mit einem beliebigen String begonnen werden.
     * Darauf folgt die Wochen-Nr und mit einem Leerzeichen getrennt das Jahr.
     * Anschliessend können noch andere Texte/Zahlen/Zeichen sein, diese werden aber ignoriert.
     * Beispiele: 'Woche 4 2017', 'W4 17', 'W 4 2017', 'Wo 4 17'
     * Weitere Beispiele: 'Wo 4 2017 vom 23.01.2017'
     * @param {String} strWeek
     * @returns {Date}  Datum des Montags der gewählten Woche
     */
    static getDateFromWeekString(strWeek) {
        const matches = strWeek.match(/^[^0-9]+([0-9]{1,2})[^0-9]?([0-9]{2,4})?/);
        const week = parseInt(matches[1]);
        let year = matches[2] ? parseInt(matches[2]) : (new Date).getFullYear();

        // Kurzschreibweisen vom Jahr konvertieren
        if (year < 100) {
            if (year < 70) {
                year += 2000;
            } else if (year >= 70) {
                year += 1900;
            }
        }

        return this.getFirstOfWeek(week, year);
    }

    /**
     * Konvertiert ein SQL-Datum im Format '2016-01-01' oder '2016-01-01 08:55:00' in ein Datum-Objekt
     * @param {String} sqlDate
     * @returns {Date}
     */
    static getDateFromSqlString(sqlDate) {
        let year = parseInt(sqlDate.substr(0,4));
        let month = parseInt(sqlDate.substr(5,2));
        let day = parseInt(sqlDate.substr(8,2));
        let hours = 0;
        let minutes = 0;
        let seconds = 0;

        if (sqlDate.length >= 13) {
            hours = parseInt(sqlDate.substr(11,2));
        }
        if (sqlDate.length >= 16) {
            minutes = parseInt(sqlDate.substr(14,2));
        }
        if (sqlDate.length >= 19) {
            seconds = parseInt(sqlDate.substr(17,2));
        }
        
        return new Date(year, month-1, day, hours, minutes, seconds, 0);
    }

    /**
     * Gibt ein Datum ohne Uhrzeit zurück
     * @param {Date} date
     * @returns {Date}
     */
    static getDatePart(date) {
        return new Date(date.getFullYear(),date.getMonth(),date.getDate());
    }

    /**
     * Gibt das Datum des ersten Tags eines Monats zurück
     * @param {Date} date
     * @returns {Date} letztes Datum des Monats
     */
    static getFirstOfMonth(date) {
        return new Date(date.getFullYear(), date.getMonth(), 1);
    }

    /**
     * Gibt das Datum des ersten Tags einer Kalenderwoche nach ISO-8601 zurück
     * @param {Number} week
     * @param {Number} year
     * @returns {Date} Montag der Woche
     */
    static getFirstOfWeek(week, year) {
        // Der 4. Januar ist immer in der ersten Woche
        let date = new Date(year, 0, 4, 0, 0, 0, 0);

        // Montag dieser Woche ermitteln
        date = this.getMonday(date);

        // Wochen addieren
        return this.addDays(date, (week-1) * 7);
    }

    /**
     * BUG: Rechnet die Sommerzeit falsch. Deshalb wurde diese Funktion ersetzt.
     * Gibt das Datum des ersten Tags einer Kalenderwoche nach ISO-8601 zurück
     * @param {Number} week
     * @param {Number} year
     * @returns {Date} Montag der Woche
     */
    /*static getFirstOfWeek_OLD(week, year) {
        // Der 4. Januar ist immer in der ersten Woche
        let u = parseInt(Date.UTC(year,0,4,0,0,0,0)/1000), d = new Date(u*1000).getUTCDay();
        // Auf den Montag zurückrechnen
        if (d > 1) {
            u -= (d - 1) * 3600 * 24;
        }
        if (d === 0) {
            u -= 6 * 3600 * 24;
        }
        // Wochen dazuzählen
        u += (week-1) * (7 * 24 * 3600);

        return new Date(this.create(u));
    }*/

    /**
     * Gibt das Datum des letzten Tags eines Monats zurück
     * @param {Date} date
     * @returns {Date} letztes Datum des Monats
     */
    static getLastOfMonth(date) {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0);
    }

    /**
     * Gibt das Datum des ersten Tags (Montag) einer Kalenderwoche nach ISO-8601 zurück
     * @param {Date} date Beliebiges Datum in der Woche
     * @returns {Date} Montag der Woche
     */
    static getMonday(date) {
        const day = date.getDay(),
            diff = date.getDate() - day + (day === 0 ? -6:1);
        return new Date(date.setDate(diff));
    }

    /**
     * Gibt den Namen eines Monats zurück
     * @param {Date} date                   Datum
     * @param {String} [format='long']      Länge
     *                      'narrow': 1 Zeichen. Bsp: 'J'
     *                      'short': 2-3 Zeichen. Bsp: 'Jan'
     *                      'long': Ausgeschrieben. Bsp: 'Januar'
     *                      'numeric': '1'
     *                      '2-digit': '01'
     * @returns {String}
     */
    static getMonthName(date, format='long') {
        return date.toLocaleDateString(kijs.language, { month: format });
    }

    /**
     * Gibt zurück, ob ein Jahr nach ISO-8601 52 oder 53 Wochen hat.
     * @param {Number} year
     * @returns {Number}
     */
    static getNumberOfWeeks(year) {
        const fd = new Date(year,0,1).getDay(); // first day
        const ld = new Date(year,11,31).getDay(); // last day
        const ly = this.isLeapYear(new Date(year, 0, 1)); //leap year
        if (ly) {
            if (fd === 3 && ld === 4) return 53;
            if (fd === 4 && ld === 5) return 53;
        } else {
            if (fd === 4 && ld === 4) return 53;
        }
        return 52;
    }
    
    /**
     * Gibt das Datum als SQL-String im Format "Y-m-d" zurück
     * @param {Date} date
     * @return {String}
     */
    static getSqlDate(date) {
        return kijs.isEmpty(date) ? '' : this.format(date, 'Y-m-d');
    }
    
    /**
     * Gibt das Datum mit Uhrzeit als SQL-String im Format "Y-m-d H:i:s" zurück
     * @param {Date} date
     * @return {String}
     */
    static getSqlDateTime(date) {
        return kijs.isEmpty(date) ? '' : this.format(date, 'Y-m-d H:i:s');
    }
    
    /*
     * Gibt die Uhrzeit als SQL-String im Format "H:i:s" zurück
     * @param {Time} time
     * @return {String}
     */
    static getSqlTime(time) {
        return kijs.isEmpty(time) ? '' : this.format(time, 'H:i:s');
    }

    /**
     * Gibt das Datum des letzten Tags (Sonntag) einer Kalenderwoche nach ISO-8601 zurück
     * @param {Date} date Beliebiges Datum in der Woche
     * @returns {Date} Sonntag der Woche
     */
    static getSunday(date) {
        const f = this.getMonday(date);
        f.setDate(f.getDate()+6);
        return f;
    }

    /**
     * Gibt den Namen eines Wochentags zurück
     * @param {Date} date                   Datum
     * @param {String} [format='long']      Länge
     *                      'narrow': 1 Zeichen. Bsp: 'M'
     *                      'short': 2-3 Zeichen. Bsp: 'Mo'
     *                      'long': Ausgeschrieben. Bsp: 'Montag'
     * @returns {String}
     */
    static getWeekday(date, format='long') {
        return date.toLocaleDateString(kijs.language, { weekday: format });
    }

    /**
     * Gibt die ISO-8601 Wochennummer zurück
     * @param {Date} date
     * @return {Number} 1 to 53
     */
    static getWeekOfYear(date) {
        // adapted from http://www.merlyn.demon.co.uk/weekcalc.htm
        const ms1d = 864e5;    // milliseconds in a day
        const ms7d = 7 * ms1d; // milliseconds in a week

        const DC3 = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate() + 3) / ms1d; // an Absolute Day Number
        const AWN = Math.floor(DC3 / 7); // an Absolute Week Number
        const Wyr = new Date(AWN * ms7d).getUTCFullYear();

        return AWN - Math.floor(Date.UTC(Wyr, 0, 7) / ms7d) + 1;
    }

    /**
     * Gibt zurück, ob das Datum in einem Schaltjahr liegt
     * @param {Date} date
     * @returns {Boolean}
     */
    static isLeapYear(date) {
        const year = date.getFullYear();
        return !!((year & 3) === 0 && (year % 100 || (year % 400 === 0 && year)));
    }


    /**
     * Erstellt ein Datum aus einem Länderspezifischen String
     * @param {String} strInput Datum in einem länder-spezifischen Format
     * @param {String} [language='auto'] Sprache. z.B: 'de', 'en-US' oder 'auto'=kijs.language
     * @param {Number} year2000Threshold Wenn zweistellige Jahreszahlen eingegeben werden,
     *                                   können sie automatisch in vierstellige umgewandelt
     *                                   werden. Dazu kann hier der Schwellwert angegeben werden.
     *                                   Ein guter Wert ist 30. Keine Umwandlung=Null
     * @returns {Date|Null}
     */
    static parseLocalDateString(strInput, year2000Threshold, language='auto') {
        let day = null;
        let month = null;
        let year = null;

        // Lokales Datumsformat ohne Trennzeichen ermitteln:
        // 'dmY', 'dYm', 'mdY', 'mYt', 'Ydm', 'Ymt' oder null
        const format = this.#getLocalDateFormat(language);

        if (format === null) {
            return;
        }

        // Alle Trennzeichen durch Leerzeichen ersetzen
        strInput = strInput.replace(/[^0-9]+/g, ' ');

        // Sicherstellen, dass jeweils nur ein Leerzeichen vorkommt
        // und Leerzeichen am Anfang und Ende entfernen
        strInput = strInput.replace(/[ ]+/g, ' ').trim();

        // Splitten nach Leerzeichen
        const arr = strInput.split(' ');

        // Der String darf aus ein bis drei Bestandteilen bestehen
        if (arr.length < 1 || arr.length > 3) {
            return null;
        }

        // Bestandteile durchgehen
        for (let i=0; i<arr.length; i++) {
            if (!kijs.isNumeric(arr[i])) {
                return null;
            }

            switch (format[i]) {
                // Tag
                case 'd':
                    day = parseInt(arr[i]);
                    if (day < 1 || day > 31) {
                        return null;
                    }
                    break;

                // Monat
                case 'm':
                    month = parseInt(arr[i]);
                    if (month < 1 || month > 12) {
                        return null;
                    }
                    break;

                // Jahr
                case 'Y':
                    year = parseInt(arr[i]);
                    // Evtl. aus zweistelliger Jahreszahl eine vierstellige machen
                    if (!kijs.isEmpty(year2000Threshold) && year >= 0 && year <= 99) {
                        if (year >= year2000Threshold) {
                            year += 1900;
                        } else {
                            year += 2000;
                        }
                    }
                    break;

            }
        }

        // Fehlende Bestandteile vom aktuellen Datum nehmen
        if (day === null) {
            day = (new Date()).getDate();
        }
        if (month === null) {
            month = (new Date()).getMonth() + 1;
        }
        if (year === null) {
            year = (new Date()).getFullYear();
        }

        // Daraus nun ein Datum erstellen
        return new Date(year, month-1, day);
    }

     /**
     * Erstellt ein Datum mit Uhrzeit aus einem Länderspezifischen String
     * @param {String} strInput Datum und Uhrzeit in einem länder-spezifischen Format
     * @param {String} [language='auto'] Sprache. z.B: 'de', 'en-US' oder 'auto'=kijs.language
     * @param {Number} year2000Threshold Wenn zweistellige Jahreszahlen eingegeben werden,
     *                                   können sie automatisch in vierstellige umgewandelt
     *                                   werden. Dazu kann hier der Schwellwert angegeben werden.
     *                                   Ein guter Wert ist 30. Keine Umwandlung=Null
     * @returns {Date|Null}
     */
    static parseLocalDateTimeString(strInput, year2000Threshold, language='auto') {
        const seperators = [' '];
        let date = null;
        let time = '';

        // Zulässige Trennzeichen durch #|@# ersetzen
        for (let i=0; i<seperators.length; i++) {
            strInput = kijs.String.replaceAll(strInput, seperators[i], '#|@#');
        }

        // Splitten nach #|@#
        let arr = strInput.split('#|@#');

        // Der String darf aus ein bis drei Bestandteilen bestehen (Datum, Uhrzeit, AM/PM)
        if (arr.length < 1 || arr.length > 3) {
            return null;
        }

         // Datum
        if (arr.length >= 1) {
            date = this.parseLocalDateString(arr[0], year2000Threshold);
            if (kijs.isEmpty(date)) {
                return null;
            }
        }

        // Uhrzeit
        if (arr.length >= 2) {
            let tmp = arr[1];
            // evtl. noch AM oder PM anhängen
            if (arr.length >= 3) {
                tmp += ' ' + arr[2];
            }

            time = this.parseLocalTimeString(tmp);
            if (kijs.isEmpty(time)) {
                return null;
            }
        }

        return new Date(this.format(date, 'Y-m-d') + ' ' + time);
    }

    /**
     * Erstellt ein Uhrzeit-String im Format 'H:i:s aus einem Länderspezifischen String
     * @param {String} strInput Uhrzeit in einem länder-spezifischen Format
     * @param {String} [language='auto'] Sprache. z.B: 'de', 'en-US' oder 'auto'=kijs.language
     * @returns {String|Null}
     */
    static parseLocalTimeString(strInput, language='auto') {
        let isPm = false;
        let hour = null;
        let minute = null;
        let second = null;

        // Lokales Uhrzeitformat ohne Trennzeichen ermitteln:
        // 'His', 'Hsi', 'iHs', 'isH', 'sHi', 'siH' oder null
        const format = this.#getLocalTimeFormat(language);

        if (format === null) {
            return;
        }

        // PM?
        isPm = !!strInput.match(/PM/gi);

        // Alle Trennzeichen durch Leerzeichen ersetzen
        strInput = strInput.replace(/[^0-9]+/g, ' ');

        // Sicherstellen, dass jeweils nur ein Leerzeichen vorkommt
        // und Leerzeichen am Anfang und Ende entfernen
        strInput = strInput.replace(/[ ]+/g, ' ').trim();

        // Splitten nach Leerzeichen
        let arr = strInput.split(' ');

        // Der String darf aus ein bis drei Bestandteilen bestehen
        if (arr.length < 1 || arr.length > 3) {
            return null;
        }

        // Bestandteile durchgehen
        for (let i=0; i<arr.length; i++) {
            if (!kijs.isNumeric(arr[i])) {
                return null;
            }

            switch (format[i]) {
                // Stunde 24-Stunden-Format
                case 'H':
                    hour = parseInt(arr[i]);
                    if (hour < 0 || hour > 23) {
                        return null;
                    }
                    break;

                // Stunde 12-Stunden-Format
                case 'h':
                    hour = parseInt(arr[i]);
                    if (hour < 0 || hour > 23) {
                        return null;
                    }
                    if (hour < 12 && isPm) {
                        hour += 12;
                    }
                    break;

                // Minute
                case 'm':
                    minute = parseInt(arr[i]);
                    if (minute < 0 || minute > 60) {
                        return null;
                    }
                    break;

                // Sekunde
                case 'i':
                    second = parseInt(arr[i]);
                    if (second < 0 || second > 60) {
                        return null;
                    }
                    break;

            }
        }

        // Fehlende Bestandteile vom aktuellen Datum nehmen
        if (hour === null) {
            hour = 0;
        }
        if (minute === null) {
            minute = 0;
        }
        if (second === null) {
            second = 0;
        }

        // Daraus nun ein Datum erstellen
        let date = new Date(2000, 1, 1, hour, minute, second);

        // und daraus die Uhrzeit im Format H:i:s zurückgeben
        return this.format(date, 'H:i:s');
    }

    /**
     * Erstellt ein Datum aus einem Länderspezifischen Wochen-String z.B. 'KW 5 2024'
     * Dabei wird der 1. Tag der Woche als Datum zurückgegeben.
     * @param {String} strInput Woche in einem länder-spezifischen Format
     * @param {String} [language='auto'] Sprache. z.B: 'de', 'en-US' oder 'auto'=kijs.language
     * @param {Number} year2000Threshold Wenn zweistellige Jahreszahlen eingegeben werden,
     *                                   können sie automatisch in vierstellige umgewandelt
     *                                   werden. Dazu kann hier der Schwellwert angegeben werden.
     *                                   Ein guter Wert ist 30. Keine Umwandlung=Null
     * @returns {Date|Null}
     */
    static parseLocalWeekString(strInput, year2000Threshold, language='auto') {
        let matches = strInput.match(/^[^0-9]*([0-9]{1,2})[^0-9]?([0-9]{2,4})?/);
        if (!matches) {
            return null;
        }

        // Wochen-Nr.
        let week = parseInt(matches[1]);

        // Jahr (wenn leer = aktuelles Jahr
        let year = matches[2] ? parseInt(matches[2]) : (new Date).getFullYear();

        // Evtl. aus zweistelliger Jahreszahl eine vierstellige machen
        if (!kijs.isEmpty(year2000Threshold) && year >= 0 && year <= 99) {
            if (year >= year2000Threshold) {
                year += 1900;
            } else {
                year += 2000;
            }
        }

        // Datum vom ersten Wochentag zurückgeben
        return kijs.Date.getFirstOfWeek(week, year);
    }

    /**
     * Gibt die Anzahl Sekunden seit dem 01.01.1970 zurück
     * @param {Date} date
     * @returns {Number}
     */
    static unixTimestamp(date) {
        return Math.round(date.getTime() / 1000);
    }


    // PRIVATE
    static #formatReplace(letter, date) {
        switch (letter) {
            // Tag
            // d  Tag des Monats, 2-stellig mit führender Null  01 bis 31
            case 'd': return kijs.String.padding(date.getDate(), 2, '0', 'left');
            // D  Wochentag, gekürzt auf zwei-drei Buchstaben  Mo bis So
            case 'D': return this.getWeekday(date, 'short');
            // j  Tag des Monats ohne führende Nullen  1 bis 31
            case 'j': return date.getDate();
            // l (kleines 'L')  Ausgeschriebener Wochentag  Montag bis Sontag
            case 'l': return this.getWeekday(date, 'long');

            // Monat
            // F  Monat als ganzes Wort, wie Januar bis Dezember
            case 'F': return this.getMonthName(date, 'long');
            // m  Monat als Zahl, mit führenden Nullen  01 bis 12
            case 'm': return kijs.String.padding(date.getMonth()+1, 2, '0', 'left');
            // M  Monatsname mit drei Buchstaben  Jan bis Dez
            case 'M': return this.getMonthName(date, 'short');
            // n  Monatszahl, ohne führende Nullen  1 bis 12
            case 'n': return (date.getMonth()+1);

            // Woche
            // W  ISO-8601 Wochennummer des Jahres, die Woche beginnt am Montag
            case 'W': return kijs.String.padding(this.getWeekOfYear(date), 2, '0', 'left');

            // Jahr
            // Y  Vierstellige Jahreszahl  Beispiele: 1999 oder 2003
            case 'Y': return date.getFullYear();
            // y  Jahreszahl, zweistellig  Beispiele: 99 oder 03
            case 'y': return kijs.toString(date.getFullYear()).substr(2);
            // L  Schaltjahr oder nicht  1 für ein Schaltjahr, ansonsten 0
            case 'L': return this.isLeapYear(date) ? '1' : '0';

            // Uhrzeit
            // G  Stunde im 24-Stunden-Format, ohne führende Nullen  0 bis 23
            case 'G': return date.getHours();
            // H  Stunde im 24-Stunden-Format, mit führenden Nullen  00 bis 23
            case 'H': return kijs.String.padding(date.getHours(), 2, '0', 'left');
            // i  Minuten, mit führenden Nullen  00 bis 59
            case 'i': return kijs.String.padding(date.getMinutes(), 2, '0', 'left');
            // s  Sekunden, mit führenden Nullen  00 bis 59
            case 's': return kijs.String.padding(date.getSeconds(), 2, '0', 'left');

            // Vollständige(s) Datum/Uhrzeit
            // c  ISO 8601 Datum (2011-10-05T14:48:00.000Z)
            case 'c': return date.toISOString();
            // r  Gemäß RFC 2822 formatiertes Datum (Tue Aug 19 1975 23:15:30 GMT+0200 (CEST))
            case 'r': return date.toString();
            // U  Sekunden seit Beginn der UNIX-Epoche
            case 'U': return kijs.toString(kijs.Date.unixTimestamp(date));

            default: return letter;
        }
    }

    /**
     * Ermittelt das Datumsformat zu einer Sprache
     * @param {String} [language='auto'] Sprache. z.B: 'de', 'en-US' oder 'auto'=kijs.language
     * @returns {String|Null}
     */
    static #getLocalDateFormat(language='auto') {
        if (language === 'auto') {
            language = kijs.language;
        }

        // Reihenfolge von d,m,Y ermitteln
        // dazu das Datum 2000-01-02 in ein lokales Datum umwandeln
        let format = new Date(2000, 0, 2);
        format = format.toLocaleDateString(language, { day: '2-digit', month: '2-digit', year: 'numeric'  });
        // 2000 durch Y ersetzen
        format = format.replace(/2000/g, 'Y');
        // 01 durch m ersetzen
        format = format.replace(/01/g, 'm');
        // 02 durch d ersetzen
        format = format.replace(/02/g, 'd');
        // Trennzeichen entfernen
        format = format.replace(/[^Ymd]+/g, '').trim();

        // Jetzt sollte tmp entweder 'dmY', 'dYm', 'mdY', 'mYt', 'Ydm' oder 'Ymt' sein
        if (format.length !== 3) {
            return null;
        }
        
        return format;
    }

    /**
     * Ermittelt das Uhrzeitformat zu einer Sprache
     * @param {String} [language='auto'] Sprache. z.B: 'de', 'en-US' oder 'auto'=kijs.language
     * @returns {String|Null}
     */
    static #getLocalTimeFormat(language='auto') {
        if (language === 'auto') {
            language = kijs.language;
        }

        // Reihenfolge von H,i,s ermitteln
        // dazu das Datum, Uhrzeit 2000-01-02 18:17:16 in eine lokale Uhrzeit umwandeln
        let format = new Date(2000, 0, 2, 18, 17, 16);
        format = format.toLocaleTimeString(language, {
            hour: '2-digit',
            minute: '2-digit',
            second: 'numeric'
        });
        // 18 durch H ersetzen (25-Stundenformat)
        format = format.replace(/18/g, 'H');
        // 06 durch h ersetzen (12-Stundenformat)
        format = format.replace(/06/g, 'h');
        // 17 durch m ersetzen
        format = format.replace(/17/g, 'm');
        // 16 durch i ersetzen
        format = format.replace(/16/g, 'i');
        // AM/PM entfernen
        format = format.replace(/AM/gi, '');
        format = format.replace(/PM/gi, '');

        // Trennzeichen entfernen
        format = format.replace(/[^Hhmi]+/g, '').trim();

        // Jetzt sollte tmp entweder  'His', 'Hsi', 'iHs', 'isH', 'sHi' oder 'siH' sein
        // oder dasselbe mit einem kleinen h
        if (format.length !== 3) {
            return null;
        }
        
        return format;
    }

};
