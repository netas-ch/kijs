/* global kijs */

// --------------------------------------------------------------
// home.ApiSourcePage
// --------------------------------------------------------------
/**
 * Tab mit dem eingefärbten Quellcode einer kijs-Datei (mit Zeilennummern).
 * Wird von der API-Dokumentation über die Links «Quelle» geöffnet.
 *
 * @example
 * const page = new home.ApiSourcePage({ file: 'js/gui/kijs.gui.Button.js', line: 104 });
 * page.load();
 */
home.ApiSourcePage = class home_ApiSourcePage extends kijs.gui.container.tab.Container {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        this._file = '';
        this._line = 1;

        this._codeEl = new kijs.gui.Element({
            cls: ['markdown', 'home-api-source']
        });

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            cls: 'home-page',
            scrollableY: 'auto',
            style: {
                flex: 1,
                minHeight: '40px'
            },
            elements: [
                this._codeEl
            ]
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            file: true,
            line: true
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }
    }



    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    /**
     * Datei relativ zum kijs-Ordner, z.B. 'js/gui/kijs.gui.Button.js'
     * @type {String}
     */
    get file() { return this._file; }
    set file(val) { this._file = val; }

    /**
     * Zeile, die markiert und angezeigt wird
     * @type {Number}
     */
    get line() { return this._line; }
    set line(val) { this._line = val; }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    /**
     * Markiert eine Zeile und scrollt zu ihr
     * @param {Number} line
     */
    gotoLine(line) {
        this._line = line;
        if (!this._codeEl.node) {
            return;
        }
        const lines = this._codeEl.node.querySelectorAll('.ace_line');
        kijs.Array.each(this._codeEl.node.querySelectorAll('.home-api-source-current'), function(el) {
            el.classList.remove('home-api-source-current');
        }, this);
        const el = lines[line - 1];
        if (el) {
            el.classList.add('home-api-source-current');
            el.scrollIntoView({ block: 'center' });
        }
    }

    /**
     * Lädt die Datei, färbt sie ein und springt zur Zeile
     * @returns {Promise}
     */
    async load() {
        this.displayWaitMask = true;
        try {
            const response = await fetch('../' + this._file + '?v=' + Date.now());
            const text = await response.text();

            const div = document.createElement('div');
            div.innerHTML = '<pre translate="no"><code class="language-javascript">' + kijs.String.htmlspecialchars(text) + '</code></pre>';
            await home.TabContainer.highlightCodeBlocks(div, true);
            this._codeEl.html = div.innerHTML;

        } finally {
            this.displayWaitMask = false;
        }

        // Nach dem Rendern zur Zeile springen
        kijs.defer(function() {
            this.gotoLine(this._line);
        }, 0, this);
    }



    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    destruct(superCall) {
        if (!superCall) {
            // unrendern
            this.unrender(superCall);

            // Event auslösen.
            this.raiseEvent('destruct');
        }

        // Variablen (Objekte/Arrays) leeren
        this._codeEl = null;

        // Basisklasse entladen
        super.destruct(true);
    }

};
