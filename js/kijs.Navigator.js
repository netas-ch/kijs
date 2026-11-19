/* global kijs */

// --------------------------------------------------------------
// kijs.Navigator (Static)
// --------------------------------------------------------------
/**
 * Statische Klasse mit Angaben zu Browser und Betriebssystem (aus dem User-Agent) sowie
 * Hilfsfunktionen für GET-Parameter und mailto-/tel-Links.
 *
 * @example
 * if (kijs.Navigator.isFirefox) { ... }
 * console.log(kijs.Navigator.browser + ' ' + kijs.Navigator.browserVersion + ' auf ' + kijs.Navigator.os);
 */
kijs.Navigator = class kijs_Navigator {


    // --------------------------------------------------------------
    // STATIC GETTERS / SETTERS
    // --------------------------------------------------------------
    /**
     * Name des Browsers: 'Edge', 'Firefox', 'Internet Explorer', 'Vivaldi', 'Opera',
     * 'Internet Browser' (Samsung), 'Chrome', 'Safari' oder '' (unbekannt)
     * @type {String}
     */
    static get browser() { return kijs.Navigator.getBrowserInfo().browser; }
    /**
     * Hersteller des Browsers, z.B. 'Google', 'Mozilla', 'Microsoft', 'Apple'. '' = unbekannt
     * @type {String}
     */
    static get browserVendor() { return kijs.Navigator.getBrowserInfo().browserVendor; }
    /**
     * Version des Browsers, z.B. '120.0.0.0'. '' = unbekannt
     * @type {String}
     */
    static get browserVersion() { return kijs.Navigator.getBrowserInfo().browserVersion; }

    /**
     * Ist es Google Chrome? (Andere Chromium-Browser: siehe isChromium)
     * @type {Boolean}
     */
    static get isChrome() { return kijs.Navigator.getBrowserInfo().isChrome; }
    /**
     * Ist es ein Chromium-Browser (Chrome, Edge ab Chromium, Vivaldi, Opera, Samsung)?
     * @type {Boolean}
     */
    static get isChromium() { return kijs.Navigator.getBrowserInfo().isChromium; }
    /**
     * Ist es Microsoft Edge (alt oder Chromium)?
     * @type {Boolean}
     */
    static get isEdge() { return kijs.Navigator.getBrowserInfo().isEdge; }
    /**
     * Ist es Firefox?
     * @type {Boolean}
     */
    static get isFirefox() { return kijs.Navigator.getBrowserInfo().isFirefox; }
    /**
     * Ist es Internet Explorer 11?
     * @type {Boolean}
     */
    static get isIE() { return kijs.Navigator.getBrowserInfo().isIE; }
    /**
     * Ist es Safari?
     * @type {Boolean}
     */
    static get isSafari() { return kijs.Navigator.getBrowserInfo().isSafari; }

    /**
     * Ist das Betriebssystem Android?
     * @type {Boolean}
     */
    static get isAndroid() { return kijs.Navigator.getBrowserInfo().isAndroid; }
    /**
     * Ist das Betriebssystem iOS bzw. iPadOS?
     * @type {Boolean}
     */
    static get isIOS() { return kijs.Navigator.getBrowserInfo().isIOS; }
    /**
     * Ist das Betriebssystem Linux (ohne Android)?
     * @type {Boolean}
     */
    static get isLinux() { return kijs.Navigator.getBrowserInfo().isLinux; }
    /**
     * Ist das Betriebssystem macOS?
     * @type {Boolean}
     */
    static get isMac() { return kijs.Navigator.getBrowserInfo().isMac; }
    /**
     * Ist das Betriebssystem Windows?
     * @type {Boolean}
     */
    static get isWindows() { return kijs.Navigator.getBrowserInfo().isWindows; }

    /**
     * Unterstützt das Gerät Touch-Eingaben (navigator.maxTouchPoints > 0)?
     * @type {Boolean}
     */
    static get isTouch() { return navigator.maxTouchPoints > 0;}
    
    /**
     * Name des Betriebssystems: 'Windows', 'iOS', 'iPadOS', 'macOS', 'Android', 'Linux' oder '' (unbekannt)
     * @type {String}
     */
    static get os() { return kijs.Navigator.getBrowserInfo().os; }
    /**
     * Hersteller des Betriebssystems: 'Microsoft', 'Apple', 'Google' oder '' (auch bei Linux)
     * @type {String}
     */
    static get osVendor()  { return kijs.Navigator.getBrowserInfo().osVendor; }
    /**
     * Version des Betriebssystems, bei Windows z.B. 'XP', '7', '10' (Windows 11 meldet sich als '10'),
     * sonst aus dem User-Agent. Unter Linux leer (der User-Agent enthält keine Version).
     * @type {String}
     */
    static get osVersion() { return kijs.Navigator.getBrowserInfo().osVersion; }

    /**
     * Alle GET-Parameter der URL als Objekt (siehe getGetParameter())
     * @type {Object}
     */
    static get getParams() { return kijs.Navigator.getGetParameter(); }



    // --------------------------------------------------------------
    // STATICS
    // --------------------------------------------------------------
    /**
     * Ermittelt Browser und Betriebssystem aus einem User-Agent. Das Ergebnis für den eigenen
     * Browser wird zwischengespeichert.
     * @param {String|null} [userAgent=null]  null = window.navigator.userAgent
     * @returns {Object}  {browser, browserVendor, browserVersion, os, osVendor, osVersion, isChrome,
     *                    isChromium, isEdge, isFirefox, isIE, isSafari, isAndroid, isIOS, isLinux,
     *                    isMac, isWindows} (Bedeutung siehe gleichnamige Getter)
     */
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
            // Der User-Agent enthält keine Linux-Version ('rv:' ist die Version von Firefox)
        }

        // Speichern für schnellerer Zugriff
        if (userAgent === null) {
            kijs.Navigator._bi = bi;
        }

        return bi;
    }

    /**
     * Fragt 'GET' Parameter aus der URL ab.
     * @param {String} [parameterName]  Name des Parameters. Ohne Angabe werden alle zurückgegeben.
     * @returns {Object|String|null|undefined}  Ohne parameterName: Objekt mit allen Parametern.
     *                                          Sonst der Wert, null bei Parameter ohne Wert,
     *                                          undefined, wenn er nicht vorhanden ist.
     */
    static getGetParameter(parameterName) {
        const params = {};
        if ('search' in window.location && window.location.search && 
                window.location.search.length > 1) {
            const pt = window.location.search.substr(1).split('&');
            for (let i=0; i<pt.length; i++) {
                let tmp = pt[i].split('='), key, val;
                key = decodeURIComponent(tmp[0]);
                val = tmp.length === 2 ? decodeURIComponent(tmp[1]) : null;
                params[key] = val;
            };
        }

        if (!kijs.isDefined(parameterName)) {
            return params;
        } else {
            return params[parameterName];
        }
    }

    /**
     * Öffnet einen mailto oder tel Link so, dass kein neues Fenster geöffnet wird
     * und auch das beforeunload Event nicht ausgelöst wird.
     * @param {String} href
     * @returns {undefined}
     */
    static openEmailPhoneLink(href) {
        // kleiner Murks, damit das Event window.onbeforeunload abgemurkst wird.
        // Dafür werden im Listener kijs.Navigator.__onWindowBeforeUnload alle 
        // anderen Listeners ausschaltet.
        kijs.Navigator.__disableBeforeUnload = true;
        
        // Link öffnen
        window.location.href = href;
        
        kijs.Navigator.__disableBeforeUnload = false;
    }


    // PROTECTED
    /**
     * Gibt die Version nach 'browser/' im User-Agent zurück.
     * @param {String} ua  User-Agent
     * @param {String} browser  Token, z.B. 'Firefox'
     * @returns {String}  Version oder '', wenn das Token fehlt
     */
    static _browserVersion(ua, browser) {
        let re = new RegExp(browser + '/([0-9\\.]+)', 'i');
        let match = ua.match(re);

        if (match && match[1]) {
            return match[1];
        }
        return '';
    }
    
    
    // LISTENERS
    /**
     * Listener, der verhindert, dass beim Aufruf von kijs.Navigator.openEmailPhoneLink()
     * ein anderer beforeunload Listener aufgerufen werden kann.
     * @param {Event} nodeEvent
     * @returns {undefined}
     */
    static __onWindowBeforeUnload(nodeEvent) {
        if (kijs.Navigator.__disableBeforeUnload) {
            nodeEvent.stopImmediatePropagation();
        }
    }
    
};

// Fügt den Listener kijs.Navigator.__onWindowBeforeUnload hinzu. 
// Dies muss hier geschehen, damit er noch vor allen anderen Listener gesetzt
// wird und dann auch aufgerufen wird.
addEventListener("beforeunload", kijs.Navigator.__onWindowBeforeUnload);
