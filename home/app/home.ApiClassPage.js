/* global kijs, marked */

// --------------------------------------------------------------
// home.ApiClassPage
// --------------------------------------------------------------
/**
 * Tab mit der API-Dokumentation einer Klasse: Kopf mit Vererbung und Links,
 * Filter und die Abschnitte Configs/Getter/Setter, Funktionen und Events.
 * Die Einträge werden mit <details> auf- und zugeklappt.
 *
 * @example
 * const page = new home.ApiClassPage({ app: app, className: 'kijs.gui.Button' });
 * page.load();
 */
home.ApiClassPage = class home_ApiClassPage extends kijs.gui.container.tab.Container {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        this._app = null;
        this._className = '';
        this._data = null;
        this._expandMember = null;  // Eintrag, der nach dem Laden aufgeklappt wird

        this._headerEl = new kijs.gui.Element({
            cls: ['markdown', 'home-api-header'],
            nodeAttribute: { lang: 'de' }
        });

        this._filterField = new kijs.gui.field.Text({
            placeholder: 'Einträge filtern …',
            cls: 'home-api-search-field',
            style: { flex: 1 },
            on: {
                input: this.#onFilterChange,
                context: this
            }
        });

        // Chips zum Ein- und Ausblenden: Art der Einträge (Abschnitt) und vererbte Einträge
        this._chips = [
            { name: 'property',  caption: 'Configs' },
            { name: 'function',  caption: 'Funktionen' },
            { name: 'event',     caption: 'Events' },
            { name: 'inherited', caption: 'vererbte', iconMap: 'kijs.iconMap.Fa.code-merge',
                tooltip: 'Einträge aus den Basisklassen anzeigen' }
        ].map(c => new kijs.gui.Button(Object.assign({
            cls: ['home-api-chip', 'home-api-chip-on'],
            on: {
                click: this.#onChipClick,
                context: this
            }
        }, c)));

        this._listEl = new kijs.gui.Element({
            cls: ['markdown', 'home-api-list'],
            nodeAttribute: { lang: 'de' },
            on: {
                // Filter nach erneutem Rendern wieder anwenden
                afterRender: this.#onListAfterRender,
                context: this
            }
        });

        this._pageEl = new kijs.gui.Container({
            cls: 'home-api-page',
            scrollableY: 'auto',
            style: { flex: 1 },
            elements: [
                {
                    // Hinweis bei en/fr: Die API-Dokumentation gibt es nur auf Deutsch
                    xtype: 'kijs.gui.Element',
                    html: home.TabContainer.getGermanOnlyHintHtml(),
                    visible: home.TabContainer.getGermanOnlyHintHtml() !== ''
                },
                this._headerEl,
                {
                    xtype: 'kijs.gui.Container',
                    cls: ['kijs-flexrow', 'home-api-toolbar'],
                    elements: [
                        {
                            xtype: 'kijs.gui.Container',
                            cls: ['kijs-flexrow', 'home-api-search'],
                            elements: [
                                { xtype: 'kijs.gui.Icon', iconMap: 'kijs.iconMap.Fa.magnifying-glass' },
                                this._filterField
                            ]
                        },
                        ...this._chips
                    ]
                },
                this._listEl
            ]
        });
        this._pageEl.on('click', this.#onPageClick, this);

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            cls: 'kijs-flexcolumn',
            style: {
                flex: 1,
                minHeight: '40px'
            },
            elements: [
                this._pageEl
            ]
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            app: true,
            className: true,
            expandMember: true
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
     * Name der Klasse, z.B. 'kijs.gui.Button'
     * @type {String}
     */
    get className() { return this._className; }
    set className(val) { this._className = val; }

    /**
     * Name des Eintrags, der nach dem Laden aufgeklappt wird
     * @type {String|null}
     */
    get expandMember() { return this._expandMember; }
    set expandMember(val) { this._expandMember = val; }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    /**
     * Klappt einen Eintrag auf und scrollt zu ihm
     * @param {String} name  Name des Eintrags (Config, Funktion oder Event)
     * @returns {Boolean}    false, wenn es den Eintrag nicht gibt
     */
    expandEntry(name) {
        if (!this._listEl.node) {
            this._expandMember = name;
            return false;
        }
        const entry = this._listEl.node.querySelector('details[data-name="' + CSS.escape(name) + '"]');
        if (!entry) {
            return false;
        }
        entry.hidden = false;
        entry.open = true;
        entry.scrollIntoView({ block: 'start' });
        return true;
    }

    /**
     * Lädt die Daten der Klasse und zeigt sie an
     * @returns {Promise}
     */
    async load() {
        const rpcData = await kijs.getRpc('app').do({
            remoteFn: 'api.class',
            requestData: { name: this._className },
            waitMaskTarget: this
        });
        if (!kijs.isEmpty(rpcData.response.errorType)) {
            this._headerEl.html = '<h1>' + kijs.String.htmlspecialchars(this._className) + '</h1>'
                    + '<p class="home-api-nodoc">Die Klasse gibt es nicht in der API.</p>';
            return;
        }
        this._data = rpcData.response.data;

        // HTML zuerst in einem Hilfs-Node aufbauen und einfärben, damit es
        // auch bei einem erneuten Rendern (z.B. Tab-Wechsel) erhalten bleibt
        this._headerEl.html = await this._highlight(this._getHeaderHtml());
        this._listEl.html = await this._highlight(this._getListHtml());

        this._applyFilter();

        if (this._expandMember) {
            this.expandEntry(this._expandMember);
            this._expandMember = null;
        }
    }


    // PROTECTED
    /**
     * Blendet Einträge aus, die nicht zum Filter passen
     */
    _applyFilter() {
        if (!this._listEl.node) {
            return;
        }
        const text = (this._filterField.value || '').toLowerCase().trim();
        const isOn = (name) => {
            const chip = this._chips.find(c => c.name === name);
            return !chip || chip.dom.clsHas('home-api-chip-on');
        };
        const showInherited = isOn('inherited');

        kijs.Array.each(this._listEl.node.querySelectorAll('section'), function(section) {
            // ganzer Abschnitt ausgeblendet (Chip Configs, Funktionen bzw. Events)
            section.hidden = !isOn(section.dataset.kind);

            let visible = 0;
            kijs.Array.each(section.querySelectorAll('details'), function(entry) {
                let show = true;
                if (!showInherited && entry.dataset.inherited) {
                    show = false;
                }
                if (show && text && !entry.dataset.search.includes(text)) {
                    show = false;
                }
                entry.hidden = !show;
                if (show) {
                    visible++;
                }
            }, this);
            section.querySelector('.home-api-count').textContent = '(' + visible + ')';
        }, this);
    }

    /**
     * Bereitet eine Beschreibung für die Anzeige auf und gibt sie als HTML zurück (Markdown):
     *  - Klassennamen (kijs.gui.Button, kijs.gui.DataView.selectType) werden zu Links
     *  - «Leitfaden Drag and Drop» verlinkt den Leitfaden
     *  - null, true, false, undefined und Strings in einfachen Anführungszeichen ('auto') werden als Code markiert
     * Bestehendes Markdown (`Code`, [Links](...)) bleibt unverändert.
     * @param {String} text
     * @returns {String}
     */
    _formatDescription(text) {
        const links = this._data && this._data.textLinks ? this._data.textLinks : { classes: [], guides: {} };
        const classes = new Set(links.classes);
        const guideTitles = Object.keys(links.guides);
        const esc = kijs.String.htmlspecialchars;

        // Leitfaden am Anfang einer Wortfolge suchen: längster Titel, mit dem sie beginnt,
        // sonst ein eindeutiger Titel, der mit dem ersten Wort beginnt (z.B. «Element»)
        const titlesByLength = guideTitles.slice().sort((a, b) => b.length - a.length);
        const findGuide = (phrase) => {
            for (const title of titlesByLength) {
                // Wörter des Titels, im Text auch durch Komma getrennt («Element, Dom und Container»)
                const words = title.split(' ').map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
                const m = phrase.match(new RegExp('^' + words.join('[\\s,]+') + '(?![\\wÄÖÜäöü-])', 'i'));
                if (m) {
                    return { title: title, text: m[0], rest: phrase.substring(m[0].length) };
                }
            }
            const word = (phrase.match(/^[\wÄÖÜäöü-]+/) || [''])[0];
            const starts = word ? guideTitles.filter(t => t.toLowerCase().startsWith(word.toLowerCase() + ' ')) : [];
            if (starts.length === 1) {
                return { title: starts[0], text: word, rest: phrase.substring(word.length) };
            }
            return null;
        };

        // neue RegExp pro Aufruf, weil fmt() für den Rest nach einem Leitfaden rekursiv aufgerufen wird
        const fmt = (str0) => str0.replace(/(`[^`]*`)|(\[[^\]]*\]\([^)]*\))|(Leitf[aä]den\s+)([A-Za-zÄÖÜäöü](?:(?!\bkijs\.)[^.;:()\n])*)|(\bkijs(?:\.[A-Za-z_$][\w$]*)+)|\b(null|true|false|undefined)\b|((?<![\w'])'[^'\s]*'(?![\w']))/g, (match, code, mdLink, guideWord, guidePhrase, cls, keyword, str) => {
            // bestehendes Markdown
            if (code || mdLink) {
                return match;
            }

            // Leitfaden, auch mehrere: «Leitfäden Daten und Drag and Drop», «Leitfäden A, B und C»
            if (guideWord) {
                let html = guideWord;
                let phrase = guidePhrase;
                let g = findGuide(phrase);
                if (!g) {
                    return guideWord + fmt(guidePhrase);
                }
                while (g) {
                    html += '<a href="#" data-home-file="' + esc(links.guides[g.title]) + '">' + esc(g.text) + '</a>';
                    phrase = g.rest;
                    const sep = phrase.match(/^(\s*(?:,|\bund\b|\boder\b)\s*)(\S.*)$/);
                    g = sep ? findGuide(sep[2]) : null;
                    if (g) {
                        html += sep[1];
                    }
                }
                return html + fmt(phrase);
            }

            // Klasse, evtl. mit Eintrag: längster bekannter Klassenname
            if (cls) {
                const parts = cls.split('.');
                for (let n = parts.length; n > 1; n--) {
                    const name = parts.slice(0, n).join('.');
                    if (classes.has(name)) {
                        const member = parts[n] || null;
                        const rest = parts.slice(n + (member ? 1 : 0)).map(p => '.' + p).join('');
                        return this._getClassLinkHtml(name, member) + rest;
                    }
                }
                return match;
            }

            // Werte
            return '`' + (keyword || str) + '`';
        });

        return marked.parse(fmt(text));
    }

    /**
     * Gibt die Argumente einer Funktion als Liste zurück
     * @param {Array} args
     * @returns {String}
     */
    _getArgumentsHtml(args) {
        const esc = kijs.String.htmlspecialchars;
        let html = '<ul class="home-api-arglist">';
        kijs.Array.each(args, function(a) {
            html += '<li><code>' + esc(a.name) + '</code>';
            if (a.type) {
                html += ' ' + this._getTypeHtml(a.type);
            }
            if (a.isOptional) {
                html += ' <span class="home-api-optional">optional'
                        + (a.defaultValue !== null ? ', Standard: <code>' + esc(a.defaultValue) + '</code>' : '')
                        + '</span>';
            }
            if (a.description) {
                html += ' – ' + esc(a.description);
            }
            html += '</li>';
        }, this);
        return html + '</ul>';
    }

    /**
     * Link auf eine Klasse (und optional einen Eintrag)
     * @param {String} className
     * @param {String} [member]
     * @returns {String}
     */
    _getClassLinkHtml(className, member) {
        const esc = kijs.String.htmlspecialchars;
        return '<a href="#" data-api-class="' + esc(className) + '"'
                + (member ? ' data-api-member="' + esc(member) + '"' : '') + '>'
                + esc(className) + (member ? '.' + esc(member) : '') + '</a>';
    }

    /**
     * Ziel einer Config-Eigenschaft, z.B. _captionDom.html (fn: assign)
     * @param {Object} m
     * @returns {String}
     */
    _getConfigTargetHtml(m) {
        const esc = kijs.String.htmlspecialchars;
        let target = m.configTarget || m.name;
        if (m.configContext) {
            target = m.configContext.replace(/^this\./, '') + '.' + target.replace(/^this\.[\w$.]*?\.(?=\w+$)/, '');
        }
        let html = '<code>' + esc(target) + '</code>';
        if (m.configFn) {
            html += ' (fn: <code>' + esc(m.configFn) + '</code>)';
        }
        return html;
    }

    /**
     * Gibt das HTML für einen Eintrag (Config/Getter/Setter, Funktion oder Event) zurück
     * @param {Object} m     Eintrag aus api.class
     * @returns {String}
     */
    _getEntryHtml(m) {
        const esc = kijs.String.htmlspecialchars;
        let summary = '<span class="home-api-name">' + esc(m.name);
        if (m.kind === 'function') {
            summary += '<span class="home-api-args">(' + this._getSignatureHtml(m) + ')</span>';
        }
        summary += '</span>';
        summary += '<span class="home-api-tags">' + this._getTagsHtml(m) + '</span>';
        summary += '<span class="home-api-type">' + this._getTypeHtml(m.type) + '</span>';

        // Aufgeklappter Teil
        let body = '';
        if (m.deprecated) {
            body += '<p class="home-api-deprecated"><b>Deprecated:</b> ' + esc(m.deprecated) + '</p>';
        }
        body += m.description ? this._formatDescription(m.description) : '<p class="home-api-nodoc">Keine Beschreibung</p>';

        const rows = [];
        if (m.kind === 'property') {
            if (m.type) {
                rows.push(['Typ', this._getTypeHtml(m.type)]);
            }
            if (m.defaultValue !== null) {
                let dflt = '<code>' + esc(m.defaultValue) + '</code>';
                // weitergeleitet an ein Unterelement: Quelle anzeigen
                if (m.defaultFrom) {
                    const pos = m.defaultFrom.lastIndexOf('.');
                    dflt += ' (von ' + this._getClassLinkHtml(m.defaultFrom.substring(0, pos), m.defaultFrom.substring(pos + 1)) + ')';
                }
                rows.push(['Standardwert', dflt]);
            }
            if (m.isConfig && (m.configContext || m.configFn || (m.configTarget && m.configTarget !== m.name && m.configTarget !== '_' + m.name))) {
                rows.push(['Config-Ziel', this._getConfigTargetHtml(m)]);
            }
            if (m.configPrio !== null) {
                rows.push(['Config-Priorität', esc(m.configPrio)]);
            }
        }
        if (m.kind === 'function') {
            if (m.arguments.length) {
                rows.push(['Argumente', this._getArgumentsHtml(m.arguments)]);
            }
            if (this._getTypeHtml(m.type) || m.returnsDescription) {
                rows.push(['Rückgabe', this._getTypeHtml(m.type) + (m.returnsDescription ? ' ' + esc(m.returnsDescription) : '')]);
            }
        }
        if (m.kind === 'event') {
            if (m.isForwarded) {
                rows.push(['Herkunft', 'weitergeleitet von einem Unterobjekt (<code>_eventForwardsAdd</code>)']);
            }
            if (m.raisedIn.length) {
                rows.push(['Ausgelöst in', m.raisedIn.map(n => '<code>' + esc(n) + '</code>').join(', ')]);
            }
        }
        if (m.inheritedFrom) {
            rows.push(['Vererbt von', this._getClassLinkHtml(m.inheritedFrom)]);
        }
        if (m.docSource === 'base' && m.docFrom) {
            rows.push(['Doku von', this._getClassLinkHtml(m.docFrom, m.name)]);
        }
        if (m.line) {
            rows.push(['Quelle', '<a href="#" data-src-file="' + esc(m.file) + '" data-src-line="' + m.line + '">'
                    + esc(m.file) + ':' + m.line + '</a>']);
        }
        if (rows.length) {
            body += '<table class="home-api-props">';
            kijs.Array.each(rows, function(r) {
                body += '<tr><th>' + r[0] + '</th><td>' + r[1] + '</td></tr>';
            }, this);
            body += '</table>';
        }

        kijs.Array.each(m.examples || [], function(ex) {
            body += '<pre><code class="language-javascript">' + esc(ex) + '</code></pre>';
        }, this);

        const search = (m.name + ' ' + (m.description || '')).toLowerCase();
        return '<details class="home-api-entry' + (m.deprecated ? ' home-api-isdeprecated' : '') + '"'
                + ' data-name="' + esc(m.name) + '"'
                + (m.inheritedFrom ? ' data-inherited="1"' : '')
                + ' data-search="' + esc(search) + '">'
                + '<summary>' + summary + '</summary>'
                + '<div class="home-api-body">' + body + '</div>'
                + '</details>';
    }

    /**
     * Kopf der Seite: Name, Vererbung, abgeleitete Klassen, Beschreibung, Links
     * @returns {String}
     */
    _getHeaderHtml() {
        const esc = kijs.String.htmlspecialchars;
        const d = this._data;
        let html = '<h1>' + esc(d.name) + '</h1>';

        // Vererbung
        const chain = d.chain.map(c => c.name === d.name ? '<b>' + esc(c.name) + '</b>'
                : (c.exists ? this._getClassLinkHtml(c.name) : esc(c.name)));
        html += '<p class="home-api-chain">' + chain.join(' › ') + '</p>';

        if (d.subclasses.length) {
            html += '<p>Abgeleitet: ' + d.subclasses.map(n => this._getClassLinkHtml(n)).join(', ') + '</p>';
        }

        if (d.deprecated) {
            html += '<p class="home-api-deprecated"><b>Deprecated:</b> ' + esc(d.deprecated) + '</p>';
        }

        if (d.description) {
            html += this._formatDescription(d.description);
        } else {
            html += '<p class="home-api-nodoc">Noch keine Beschreibung (Klassenkommentar fehlt).</p>';
        }

        kijs.Array.each(d.examples, function(ex) {
            html += '<pre><code class="language-javascript">' + esc(ex) + '</code></pre>';
        }, this);

        // Links
        const links = [];
        if (d.showcase) {
            links.push('Beispiele: <a href="#" data-home-file="' + esc(d.showcase) + '">Showcase ' + esc(d.showcase.split('/').pop().replace(/\.js$/, '').replace(/_/g, ' ')) + '</a>');
        }
        links.push('Quelle: <a href="#" data-src-file="' + esc(d.file) + '" data-src-line="' + d.line + '">' + esc(d.file) + '</a>');
        html += '<p class="home-api-links">' + links.join(' · ') + '</p>';

        return html;
    }

    /**
     * Die drei Abschnitte mit allen Einträgen
     * @returns {String}
     */
    _getListHtml() {
        const sections = [
            { kind: 'property', caption: 'Configs/Getter/Setter', items: this._data.properties },
            { kind: 'function', caption: 'Funktionen', items: this._data.functions },
            { kind: 'event', caption: 'Events', items: this._data.events }
        ];
        let html = '';
        kijs.Array.each(sections, function(s) {
            html += '<section data-kind="' + s.kind + '"><h2>' + s.caption + ' <span class="home-api-count"></span></h2>';
            if (s.items.length) {
                kijs.Array.each(s.items, function(m) {
                    html += this._getEntryHtml(m);
                }, this);
            } else {
                html += '<p class="home-api-nodoc">Keine</p>';
            }
            html += '</section>';
        }, this);
        return html;
    }

    /**
     * Argumente in der Kopfzeile einer Funktion: optionale in [ ]
     * @param {Object} m
     * @returns {String}
     */
    _getSignatureHtml(m) {
        const esc = kijs.String.htmlspecialchars;
        return m.arguments.filter(a => !a.name.includes('.')).map(a => a.isOptional ? '[' + esc(a.name) + ']' : esc(a.name)).join(', ');
    }

    /**
     * Farbige Tags eines Eintrags
     * @param {Object} m
     * @returns {String}
     */
    _getTagsHtml(m) {
        const tags = [];
        const tag = (cls, text, title) => tags.push('<span class="home-api-tag home-api-tag-' + cls + '"'
                + (title ? ' title="' + kijs.String.htmlspecialchars(title) + '"' : '') + '>' + text + '</span>');

        if (m.isConfig) {
            tag('config', 'Config');
        }
        if (m.hasGetter) {
            tag('getter', 'Getter');
        }
        if (m.hasSetter) {
            tag('setter', 'Setter');
        }
        if (m.isReadOnly) {
            tag('readonly', 'readonly');
        }
        if (m.isStatic) {
            tag('static', 'static');
        }
        if (m.isAsync) {
            tag('static', 'async');
        }
        if (m.isOverwrite) {
            tag('overwrite', 'overwrite');
        }
        if (m.inheritedFrom) {
            tag('inherited', 'Vererbt', 'von ' + m.inheritedFrom);
        }
        if (m.deprecated) {
            tag('deprecated', 'deprecated');
        }
        return tags.join('');
    }

    /**
     * Typ mit Links auf kijs-Klassen, z.B. {kijs.gui.Element[]|null}
     * @param {String|null} type
     * @returns {String}
     */
    _getTypeHtml(type) {
        if (!type || type === 'undefined') {
            return '';
        }
        return kijs.String.htmlspecialchars(type).replace(/\b(kijs(?:\.\w+)+)\b/g, (match) => this._getClassLinkHtml(match));
    }

    /**
     * Färbt die Code-Blöcke in einem HTML-String ein
     * @param {String} html
     * @returns {Promise}  eingefärbtes HTML
     */
    async _highlight(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        try {
            await home.TabContainer.highlightCodeBlocks(div);
        } catch (ex) {
            console.warn('Syntax highlighting failed', ex);
        }
        home.TabContainer.markGermanContent(div, false);
        return div.innerHTML;
    }


    // PRIVATE
    // LISTENERS
    #onChipClick(e) {
        e.element.dom.clsToggle('home-api-chip-on');
        this._applyFilter();
    }

    #onFilterChange(e) {
        this._applyFilter();
    }

    #onListAfterRender(e) {
        if (this._data) {
            this._applyFilter();
        }
    }

    #onPageClick(e) {
        if (!e.nodeEvent || !e.nodeEvent.target.closest) {
            return;
        }
        const a = e.nodeEvent.target.closest('a');
        if (!a) {
            return;
        }
        const href = a.getAttribute('href') || '';

        // Link api:... in einer Beschreibung (Markdown)
        if (/^api:/i.test(href)) {
            e.nodeEvent.preventDefault();
            this._app.openApiLink(href);

        // Link auf eine andere Klasse oder einen Eintrag
        } else if (a.dataset.apiClass) {
            e.nodeEvent.preventDefault();
            if (a.dataset.apiClass === this._className && a.dataset.apiMember) {
                this.expandEntry(a.dataset.apiMember);
            } else {
                this._app.openApiClass(a.dataset.apiClass, a.dataset.apiMember || null);
            }

        // Quellcode
        } else if (a.dataset.srcFile) {
            e.nodeEvent.preventDefault();
            this._app.openSource(a.dataset.srcFile, parseInt(a.dataset.srcLine) || 1);

        // Showcase-Seite
        } else if (a.dataset.homeFile) {
            e.nodeEvent.preventDefault();
            this._app.openLinkedFile(a.dataset.homeFile);
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
        this._chips = null;
        this._data = null;
        this._filterField = null;
        this._headerEl = null;
        this._listEl = null;
        this._pageEl = null;

        // Basisklasse entladen
        super.destruct(true);
    }

};
