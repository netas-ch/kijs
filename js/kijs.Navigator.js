/* global kijs */

// --------------------------------------------------------------
// kijs.Navigator (Static)
// --------------------------------------------------------------
/**
 * Klasse gibt Angaben zu Browser und Betriebssystem des Browsers zurück.
 */
kijs.Navigator = class kijs_Navigator {


    // --------------------------------------------------------------
    // STATIC GETTERS / SETTERS
    // --------------------------------------------------------------
    static get browser() { return kijs.Navigator.getBrowserInfo().browser; }
    static get browserVendor() { return kijs.Navigator.getBrowserInfo().browserVendor; }
    static get browserVersion() { return kijs.Navigator.getBrowserInfo().browserVersion; }

    static get isChrome() { return kijs.Navigator.getBrowserInfo().isChrome; }
    static get isChromium() { return kijs.Navigator.getBrowserInfo().isChromium; }
    static get isFirefox() { return kijs.Navigator.getBrowserInfo().isFirefox; }
    static get isEdge() { return kijs.Navigator.getBrowserInfo().isEdge; }
    static get isIE() { return kijs.Navigator.getBrowserInfo().isIE; }
    static get isSafari() { return kijs.Navigator.getBrowserInfo().isSafari; }

    static get isWindows() { return kijs.Navigator.getBrowserInfo().isWindows; }
    static get isMac() { return kijs.Navigator.getBrowserInfo().isMac; }
    static get isAndroid() { return kijs.Navigator.getBrowserInfo().isAndroid; }
    static get isIOS() { return kijs.Navigator.getBrowserInfo().isIOS; }
    static get isLinux() { return kijs.Navigator.getBrowserInfo().isLinux; }

    static get os() { return kijs.Navigator.getBrowserInfo().os; }
    static get osVendor()  { return kijs.Navigator.getBrowserInfo().osVendor; }
    static get osVersion() { return kijs.Navigator.getBrowserInfo().osVersion; }

    // --------------------------------------------------------------
    // STATICS
    // --------------------------------------------------------------

    static getBrowserInfo(userAgent=null) {
        let ua = userAgent || window.navigator.userAgent;

        // antwort aus cache
        if (userAgent === null && kijs.Navigator._bi) {
            return kijs.Navigator._bi;
        }

        let bi = {
            browserVersion: '',
            browserVendor: '',
            browser: '',
            os: '',
            osVersion: '',
            osVendor: '',
            isChrome: false,
            isChromium: false,
            isFirefox: false,
            isEdge: false,
            isIE: false,
            isSafari: false,
            isWindows: false,
            isMac: false,
            isAndroid: false,
            isIOS: false,
            isLinux: false
        };

        // Edge
        if (kijs.Navigator._browserVersion(ua, 'Edge')) {
            bi.browser = 'Edge';
            bi.browserVendor = 'Microsoft';
            bi.browserVersion = kijs.Navigator._browserVersion(ua, 'Edge');
            bi.isEdge = true;

        // Edge (Chromium)
        } else if (kijs.Navigator._browserVersion(ua, 'Edg')) {
            bi.browser = 'Edge';
            bi.browserVendor = 'Microsoft';
            bi.browserVersion = kijs.Navigator._browserVersion(ua, 'Edg');
            bi.isEdge = true;
            bi.isChromium = true;

        // Firefox
        } else if (kijs.Navigator._browserVersion(ua, 'Firefox')) {
            bi.browser = 'Firefox';
            bi.browserVendor = 'Mozilla';
            bi.browserVersion = kijs.Navigator._browserVersion(ua, 'Firefox');
            bi.isFirefox = true;

        // IE 11
        } else if (ua.match(/Trident/i) && ua.match(/rv:11/i)) {
            bi.browser = 'Internet Explorer';
            bi.browserVendor = 'Microsoft';
            bi.browserVersion = '11.0';
            bi.isIE = true;

        // Vivaldi (Chromium)
        } else if (kijs.Navigator._browserVersion(ua, 'Vivaldi')) {
            bi.browser = 'Vivaldi';
            bi.browserVendor = 'Vivaldi';
            bi.browserVersion = kijs.Navigator._browserVersion(ua, 'Vivaldi');
            bi.isChromium = true;

        // Opera (Chromium)
        } else if (kijs.Navigator._browserVersion(ua, 'Opera')) {
            bi.browser = 'Opera';
            bi.browserVendor = 'Opera';
            bi.browserVersion = kijs.Navigator._browserVersion(ua, 'Opera');
            bi.isChromium = true;

        // Samsung Browser (Chromium)
        } else if (kijs.Navigator._browserVersion(ua, 'SamsungBrowser')) {
            bi.browser = 'Internet Browser';
            bi.browserVendor = 'Samsung';
            bi.browserVersion = kijs.Navigator._browserVersion(ua, 'SamsungBrowser');
            bi.isChromium = true;

        // Chrome
        } else if (kijs.Navigator._browserVersion(ua, 'Chrome')) {
            bi.browser = 'Chrome';
            bi.browserVendor = 'Google';
            bi.browserVersion = kijs.Navigator._browserVersion(ua, 'Chrome');
            bi.isChrome = true;
            bi.isChromium = true;

        // Safari
        } else if (kijs.Navigator._browserVersion(ua, 'Safari')) {
            bi.browser = 'Safari';
            bi.browserVendor = 'Apple';
            bi.browserVersion = kijs.Navigator._browserVersion(ua, 'Version');
            if (!bi.browserVersion) {
                bi.browserVersion = kijs.Navigator._browserVersion(ua, 'Safari');
            }
            bi.isSafari = true;
        }

        // Windows
        let win = ua.match(/Windows NT ([0-9\.]+)/i);
        if (win && win[1]){
            let NtVersion = parseFloat(win[1]);
            bi.isWindows = true;
            bi.os = 'Windows';
            bi.osVendor = 'Microsoft';
            switch (NtVersion) {
                case 5.1:
                case 5.2: bi.osVersion = 'XP'; break;
                case 6.0: bi.osVersion = 'Vista'; break;
                case 6.1: bi.osVersion = '7'; break;
                case 6.2: bi.osVersion = '8'; break;
                case 6.3: bi.osVersion = '8.1'; break;
                case 6.4:
                case 10.0: bi.osVersion = '10'; break;
                default: bi.osVersion = 'NT ' + NtVersion; break;
            }
        }

        // iPad / Iphone
        if (!bi.os && ua.match(/(iPad|iPhone|iPod)/i)) {
            bi.isIOS = true;
            bi.os = ua.match(/iPad/i) ? 'iPadOS' : 'iOS';
            bi.osVendor = 'Apple';
            let os = ua.match(/OS ([0-9_]+)/i);
            if (os) {
                bi.osVersion = kijs.String.replaceAll(os[1], '_', '.');
            }
        }

        // Mac
        if (!bi.os && ua.match(/Macintosh/i)) {
            bi.isMac = true;
            bi.os = 'macOS';
            bi.osVendor = 'Apple';
            let os = ua.match(/OS (?:X )?([0-9_]+)/i);
            if (os) {
                bi.osVersion = kijs.String.replaceAll(os[1], '_', '.');
            }
        }

        // Android
        if (!bi.os && ua.match(/Android/i)) {
            bi.isAndroid = true;
            bi.os = 'Android';
            bi.osVendor = 'Google';
            let os = ua.match(/Android ([0-9\.]+)/i);
            if (os) {
                bi.osVersion = os[1];
            }
        }

        // Linux
        if (!bi.os && ua.match(/Linux/i)) {
            bi.isLinux = true;
            bi.os = 'Linux';
            let os = ua.match(/rv:([0-9\.]+)/i);
            if (os) {
                bi.osVersion = os[1];
            }
        }

        // Speichern für schnellerer Zugriff
        if (userAgent === null) {
            kijs.Navigator._bi = bi;
        }

        return bi;
    }

    static _browserVersion(ua, browser) {
        let re = new RegExp(browser + '/([0-9\\.]+)', 'i');
        let match = ua.match(re);

        if (match && match[1]) {
            return match[1];
        }
        return '';
    }
};