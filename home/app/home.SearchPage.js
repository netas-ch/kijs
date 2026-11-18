/* global kijs */

// --------------------------------------------------------------
// home.SearchPage
// --------------------------------------------------------------
/**
 * Tab mit den Treffern der globalen Suche, gruppiert nach API, Leitfäden,
 * Showcase und Tests. Ein Klick auf einen Treffer öffnet die Seite. Bei
 * API-Treffern wird der Eintrag aufgeklappt.
 *
 * @example
 * const page = new home.SearchPage({ app: app, query: 'caption' });
 * page.load();
 */
home.SearchPage = class home_SearchPage extends kijs.gui.container.tab.Container {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        this._app = null;
        this._query = '';

        this._resultEl = new kijs.gui.Element({
            cls: ['markdown', 'home-search']
        });
        this._resultEl.on('click', this.#onResultClick, this);

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            scrollableY: 'auto',
            style: {
                flex: 1,
                minHeight: '40px'
            },
            elements: [
                this._resultEl
            ]
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            app: true,
            query: true
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
     * Home-App
     * @type {home.App}
     */
    get app() { return this._app; }
    set app(val) { this._app = val; }

    /**
     * Suchbegriff
     * @type {String}
     */
    get query() { return this._query; }
    set query(val) { this._query = val; }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    /**
     * Führt die Suche aus und zeigt die Treffer an
     * @returns {Promise}
     */
    async load() {
        const rpcData = await kijs.getRpc('app').do({
            remoteFn: 'home.search',
            requestData: { query: this._query },
            waitMaskTarget: this
        });
        if (!kijs.isEmpty(rpcData.response.errorType)) {
            this._resultEl.html = '<p class="home-api-nodoc">Keine Suche möglich.</p>';
            return;
        }
        this._resultEl.html = this._getResultHtml(rpcData.response.data);
    }


    // PROTECTED
    /**
     * HTML für die API-Treffer
     * @param {Array} hits
     * @returns {String}
     */
    _getApiHtml(hits) {
        const esc = kijs.String.htmlspecialchars;
        const kinds = { 'class': 'Klasse', property: 'Config/Eigenschaft', 'function': 'Funktion', event: 'Event' };
        let html = '<ul class="home-search-list">';
        kijs.Array.each(hits.slice(0, 100), function(h) {
            const title = h.member ? h.className + '.' + h.member : h.className;
            html += '<li><a href="#" data-api-class="' + esc(h.className) + '"'
                    + (h.member ? ' data-api-member="' + esc(h.member) + '"' : '') + '>'
                    + this._mark(title) + '</a>'
                    + ' <span class="home-search-kind">' + (kinds[h.kind] || h.kind) + '</span>';
            if (h.snippet) {
                html += '<div class="home-search-snippet">' + this._mark(h.snippet) + '</div>';
            }
            html += '</li>';
        }, this);
        html += '</ul>';
        if (hits.length > 100) {
            html += '<p class="home-api-nodoc">Es gibt mehr als 100 Treffer. Bitte den Suchbegriff verfeinern.</p>';
        }
        return html;
    }

    /**
     * HTML für die Treffer in Dateien (Leitfäden, Showcase, Tests)
     * @param {Array} hits
     * @returns {String}
     */
    _getFilesHtml(hits) {
        const esc = kijs.String.htmlspecialchars;
        let html = '<ul class="home-search-list">';
        kijs.Array.each(hits, function(h) {
            html += '<li><a href="#" data-home-file="' + esc(h.path) + '">' + this._mark(h.title) + '</a>';
            if (h.folder) {
                html += ' <span class="home-search-kind">' + esc(h.folder.replace(/_/g, ' ')) + '</span>';
            }
            if (h.count) {
                html += ' <span class="home-search-kind">' + h.count + ' Treffer</span>';
            }
            if (h.snippet) {
                html += '<div class="home-search-snippet">' + this._mark(h.snippet) + '</div>';
            }
            html += '</li>';
        }, this);
        return html + '</ul>';
    }

    /**
     * HTML für alle Treffer
     * @param {Object} data  Antwort von home.search
     * @returns {String}
     */
    _getResultHtml(data) {
        const groups = [
            { caption: 'API', hits: data.api, fn: this._getApiHtml },
            { caption: 'Leitfäden und Doku', hits: data.docu, fn: this._getFilesHtml },
            { caption: 'Showcase', hits: data.showcase, fn: this._getFilesHtml },
            { caption: 'Tests', hits: data.test, fn: this._getFilesHtml }
        ];

        let html = '<h1>Suche: ' + kijs.String.htmlspecialchars(data.query) + '</h1>';
        const total = groups.reduce((sum, g) => sum + g.hits.length, 0);
        if (!total) {
            return html + '<p class="home-api-nodoc">Keine Treffer.</p>';
        }

        // Sprungmarken
        html += '<p>' + groups.filter(g => g.hits.length).map(g => '<a href="#" data-jump="' + g.caption + '">'
                + g.caption + ' (' + (g.hits.length > 100 ? '100+' : g.hits.length) + ')</a>').join(' · ') + '</p>';

        kijs.Array.each(groups, function(g) {
            if (g.hits.length) {
                html += '<h2 data-group="' + g.caption + '">' + g.caption + '</h2>';
                html += g.fn.call(this, g.hits);
            }
        }, this);
        return html;
    }

    /**
     * Maskiert einen Text und hebt den Suchbegriff hervor
     * @param {String} text
     * @returns {String}
     */
    _mark(text) {
        const esc = kijs.String.htmlspecialchars;
        const q = this._query.toLowerCase();
        if (!q) {
            return esc(text);
        }
        let html = '';
        let pos = 0;
        const lower = text.toLowerCase();
        let idx;
        while ((idx = lower.indexOf(q, pos)) > -1) {
            html += esc(text.substring(pos, idx)) + '<mark>' + esc(text.substring(idx, idx + q.length)) + '</mark>';
            pos = idx + q.length;
        }
        return html + esc(text.substring(pos));
    }


    // PRIVATE
    // LISTENERS
    #onResultClick(e) {
        if (!e.nodeEvent || !e.nodeEvent.target.closest) {
            return;
        }
        const a = e.nodeEvent.target.closest('a');
        if (!a) {
            return;
        }
        e.nodeEvent.preventDefault();

        if (a.dataset.apiClass) {
            this._app.openApiClass(a.dataset.apiClass, a.dataset.apiMember || null);

        } else if (a.dataset.homeFile) {
            this._app.openLinkedFile(a.dataset.homeFile);

        } else if (a.dataset.jump) {
            const h2 = this._resultEl.node.querySelector('h2[data-group="' + a.dataset.jump + '"]');
            if (h2) {
                h2.scrollIntoView({ block: 'start' });
            }
        }
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
        this._app = null;
        this._resultEl = null;

        // Basisklasse entladen
        super.destruct(true);
    }

};
