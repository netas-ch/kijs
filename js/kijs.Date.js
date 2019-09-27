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
    // STATIC GETTERS / SETTERS
    // --------------------------------------------------------------
    static get weekdays() {
        return [
            kijs.getText('Sonntag'),
            kijs.getText('Montag'),
            kijs.getText('Dienstag'),
            kijs.getText('Mittwoch'),
            kijs.getText('Donnerstag'),
            kijs.getText('Freitag'),
            kijs.getText('Samstag')
        ];
        /*{
            en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            de: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
            fr: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
        };*/
    }

    static get weekdays_short() {
        return [
            kijs.getText('So', '3'),
            kijs.getText('Mo', '3'),
            kijs.getText('Di', '3'),
            kijs.getText('Mi', '3'),
            kijs.getText('Do', '3'),
            kijs.getText('Fr', '3'),
            kijs.getText('Sa', '3')
        ];
        /*{
            en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            de: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
            fr: ['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa']
        };*/
    }

    static get months() {
        return [
            kijs.getText('Januar'),
            kijs.getText('Februar'),
            kijs.getText('März'),
            kijs.getText('April'),
            kijs.getText('Mai'),
            kijs.getText('Juni'),
            kijs.getText('Juli'),
            kijs.getText('August'),
            kijs.getText('September'),
            kijs.getText('Oktober'),
            kijs.getText('November'),
            kijs.getText('Dezember')
        ];
        /*{
            en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            de: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
            fr: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
        };*/
    }

    static get months_short() {
        return [
            kijs.getText('Jan', '3'),
            kijs.getText('Feb', '3'),
            kijs.getText('Mär', '3'),
            kijs.getText('Apr', '3'),
            kijs.getText('Mai', '3'),
            kijs.getText('Jun', '3'),
            kijs.getText('Jul', '3'),
            kijs.getText('Aug', '3'),
            kijs.getText('Sep', '3'),
            kijs.getText('Okt', '3'),
            kijs.getText('Nov', '3'),
            kijs.getText('Dez', '3')
        ];
        /*{
            en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            de: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
            fr: ['JAN', 'FÉV', 'MAR', 'AVR', 'MAI', 'JUN', 'JUL', 'AOÛ', 'SEP', 'OCT', 'NOV', 'DÉC']
        };*/
    }


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
     *  - Deutscher Datums-String "01.04.2017"
     *  - Deutscher Wochen-String "KW 4 2017"
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

        // Deutsches Datum (d.m.Y) Beispiele: '1.1.16', '01.04.2017', '2.4', '02.04.', '06', '6.'
        // Falls Teile des Datums weggelassen wedrden, wird der aktuelle Monat/Jahr genommen.
        } else if (kijs.isString(arg) && arg.match(/^[0-9]{1,2}\.?([0-9]{1,2}\.?([0-9]{2,4})?)?/)) {
            ret = this.getDateFromGermanString(arg);

        // Woche
        // Beispiel: 'Woche 3 2017', 'W3 17', 'Wo 3 2017'
        } else if (kijs.isString(arg) && arg.match(/^[^0-9]+[0-9]{1,2}[^0-9]?([0-9]{2,4})?/)) {
            ret = this.getDateFromWeekString(arg);

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
        if (ret && isNaN(ret.valueOf())) {
            ret = null;
        }

        return ret;
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
            return this.__formatReplace(letter, date);
        });
    }

    /**
     * Konvertiert ein Datum im Format 'd.m.Y' oder 'd.m.Y h:i:s' in ein Datum-Objekt
     * Die Uhrzeit kann hinten mit einem Leerzeichen getrennt angehängt werden. Sie muss mind. ein : enthalten,
     * damit sie als Uhrzeit erkannt wird.
     * Beispiele: '1.1.16', '01.04.2017', '2.4', '02.04.', '06', '6.'
     * Beispiele mit Zeit: '1.1.16 20:00', '01.04.2017 20:00:05', '2.4 8:5', '20:07'
     * @param {String} strDate
     * @returns {Date}
     */
    static getDateFromGermanString(strDate) {
        const args = strDate.split(' ');
        let argsTmp;
        let strTime = '';

        // Teil 1 (kann Datum oder Uhrzeit sein
        if (args.length >= 1) {
            // Handelt es sich um eine Uhrzeit?
            if (args[0].indexOf(':') >= 0) {
                strTime = args[0];
            } else {
                strDate = args[0];
            }
        }

        // Teil 2 (kann nur Uhrzeit sein
        if (args.length >= 2) {
            if (args[1].indexOf(':') >= 0) {
                strTime = args[1];
            }
        }

        // Datum ermitteln
        argsTmp = strDate.split('.');
        let day = argsTmp.length >= 1 && argsTmp[0] ? parseInt(argsTmp[0]) : (new Date).getDate();
        let month = argsTmp.length >= 2 && argsTmp[1] ? parseInt(argsTmp[1]) : (new Date).getMonth()+1;
        let year = argsTmp.length >= 3 && argsTmp[2] ? parseInt(argsTmp[2]) : (new Date).getFullYear();

        // Kurzschreibweisen vom Jahr konventieren
        if (year < 100) {
            if (year < 70) {
                year += 2000;
            } else if (year >= 70) {
                year += 1900;
            }
        }

        // Uhrzeit ermitteln
        argsTmp = strTime.split(':');
        let hours = argsTmp.length >= 2 ? parseInt(argsTmp[0]) : 0;
        let minutes = argsTmp.length >= 2 ? parseInt(argsTmp[1]) : 0;
        let seconds = argsTmp.length >= 3 ? parseInt(argsTmp[2]) : 0;

        return new Date(year, month-1, day, hours, minutes, seconds, 0);
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

        // Kurzschreibweisen vom Jahr konventieren
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

        if (sqlDate.length > 10) {
            hours = parseInt(sqlDate.substr(11,2));
            minutes = parseInt(sqlDate.substr(14,2));
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
     * @param {Boolean} [short=false]       Kurzform
     * @returns {String}
     */
    static getMonthName(date, short=false) {
        if (short) {
            return this.months_short[date.getMonth()];
        } else {
            return this.months[date.getMonth()];
        }
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
     * @param {Boolean} [short=false]       Kurzform
     * @returns {String}
     */
    static getWeekday(date, short) {
        if (short) {
            return this.weekdays_short[date.getDay()];
        } else {
            return this.weekdays[date.getDay()];
        }
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
     * Gibt die Anzahl Sekunden seit dem 01.01.1970 zurück
     * @param {Date} date
     * @returns {Number}
     */
    static unixTimestamp(date) {
        return Math.round(date.getTime() / 1000);
    }


    // PRIVATE
    static __formatReplace(letter, date) {
        switch (letter) {
            // Tag
            // d  Tag des Monats, 2-stellig mit führender Null  01 bis 31
            case 'd': return kijs.String.padding(date.getDate(), 2, '0', 'left');
            // D  Wochentag, gekürzt auf zwei Buchstaben  Mo bis So
            case 'D': return this.getWeekday(date, true);
            // j  Tag des Monats ohne führende Nullen  1 bis 31
            case 'j': return date.getDate();
            // l (kleines 'L')  Ausgeschriebener Wochentag  Montag bis Sontag
            case 'l': return this.getWeekday(date, false);

            // Monat
            // F  Monat als ganzes Wort, wie Januar bis Dezember
            case 'F': return this.getMonthName(date, false);
            // m  Monat als Zahl, mit führenden Nullen  01 bis 12
            case 'm': return kijs.String.padding(date.getMonth()+1, 2, '0', 'left');
            // M  Monatsname mit drei Buchstaben  Jan bis Dez
            case 'M': return this.getMonthName(date, true);
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
};

