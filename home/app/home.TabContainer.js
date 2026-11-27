/* global kijs, marked */

// --------------------------------------------------------------
// home.TabContainer
// --------------------------------------------------------------
window.home = {};
home.TabContainer = class home_TabContainer extends kijs.gui.container.tab.Container {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        this._app;

        this._filetype = 'text'; // 'text', 'html', 'js' oder 'md'
        this._namespace = '';    // Nur bei JS: Namespace
        this._className = '';    // Nur bei JS: Klassenname

        // Buttons
        this._btnRun = new kijs.gui.Button({
            iconMap: 'kijs.iconMap.Fa.circle-play',
            tooltip: kijs.getText('Code ausführen'),
            on: {
                click: this.#onRunClick,
                context: this
            }
        });

        this._btnReset = new kijs.gui.Button({
            iconMap: 'kijs.iconMap.Fa.rotate-right',
            tooltip: kijs.getText('Code zurücksetzen'),
            on: {
                click: this.#onResetClick,
                context: this
            }
        });

        // Panel mit ausgeführtem Beispiel
        this._contSandbox = new kijs.gui.Container({
            cls: 'home-page',
            style: {
                flex: 1
            }
        });
        this._contSandbox.on('click', this.#onContSandboxClick, this);


        // Quellcode Panel mit Editor
        this._editorSource = new kijs.gui.field.AceEditor({
            mode: 'text'
            //theme: 'monokai'
        });

        this._contSource = new kijs.gui.Panel({
            caption: 'Source-Code',
            iconMap: 'kijs.iconMap.Fa.code',
            collapsible: 'right',
            collapsed: true,
            width: 500,
            cls: ['home-tabcontainer-source', 'kijs-borderless', 'kijs-flexfit'],
            style: {
                flex: 'none'
            },
            headerBarElements: [
                this._btnRun,
                this._btnReset
            ],
            elements: [
                this._editorSource
            ]
        });

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            cls: 'kijs-flexrow',
            style: {
                flex: 1,
                minHeight: '40px'
            },
            elements: [
                this._contSandbox,
                {
                    xtype: 'kijs.gui.Splitter',
                    targetPos: 'right'
                },
                this._contSource
            ]
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            app: true
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
    get app() { return this._app; }

    get className() { return this._className; }
    set className(val) { this._className = val; }

    get filetype() {
        return this._filetype;
    }
    set filetype(val) {
        this._filetype = val;

        let mode = '';
        switch (val) {
            case 'html': mode = 'html'; break;
            case 'js': mode = 'javascript'; break;
            case 'md': mode = 'markdown'; break;
            default: mode = 'text'; break;
        }

        this._editorSource.mode = mode;
    }

    get namespace() { return this._namespace; }
    set namespace(val) { this._namespace = val; }

    get source() { return this._editorSource.value };
    set source(val) { this._editorSource.value = val; }



    // --------------------------------------------------------------
    // STATICS
    // --------------------------------------------------------------
    /**
     * Färbt alle Code-Blöcke (pre > code) in einem Node mit ACE ein.
     * Die Sprache kommt aus dem Code-Block (```css, ```html, ```php, ```json ...),
     * eingerückte Code-Blöcke ohne Sprache werden als JavaScript eingefärbt.
     * Die Farben sind in app/style.css definiert (hell und dunkel).
     * Wird auch von der API-Dokumentation verwendet.
     * @param {HTMLElement} node
     * @param {Boolean} [showGutter=false]  Zeilennummern anzeigen?
     * @returns {Promise}
     */
    static async highlightCodeBlocks(node, showGutter=false) {
        const blocks = node.querySelectorAll('pre > code');
        if (!blocks.length || !window.ace) {
            return;
        }

        const highlighter = await home_TabContainer.#aceLoadModule('ace/ext/static_highlight');

        // Theme ohne eigenes CSS: die Farben kommen aus style.css und passen sich
        // so beim Umschalten zwischen hell und dunkel automatisch an.
        const theme = { cssClass: 'home-code', cssText: '', isDark: false };

        for (const code of blocks) {
            const match = code.className.match(/language-([\w-]+)/);
            const lang = match ? match[1].toLowerCase() : 'javascript';
            const modeName = home_TabContainer.#languageModes[lang];
            if (!modeName) {
                continue;   // unbekannte Sprache: nicht einfärben
            }

            let text = code.textContent.replace(/\n$/, '');

            const modeModule = await home_TabContainer.#aceLoadModule('ace/mode/' + modeName);
            // PHP ohne '<?php' (reiner PHP-Code) als inline-PHP einfärben
            const mode = new modeModule.Mode(modeName === 'php' && !text.includes('<?') ? { inline: true } : undefined);

            const result = highlighter.render(text, mode, theme, 1, !showGutter);
            code.parentNode.classList.add('home-code-highlighted');
            code.innerHTML = result.html;
        }
    }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // Lädt wieder den Ursprünglichen Code
    async reset() {
        const f = await fetch(this._name);

        this.displayWaitMask = true;
        let rawCode = await f.text();
        this._editorSource.value = rawCode;
        this.displayWaitMask = false;

        this.run();
    }

    // Führt den aktuellen Code aus.
    run() {
        let rawCode = this._editorSource.value;

        switch (this._filetype) {
            case 'html':
                this._contSandbox.scrollableY = 'auto';
                this._contSandbox.innerDom.clsAdd('markdown');
                this._contSandbox.html = rawCode;
                break;

            case 'js':
                // falls bereits geladen: destruct
                this._destructShowcase();
                this._contSandbox.removeAll();

                // Code ausführen
                eval(rawCode);

                this._contSandbox.dom.clsAdd('kijs-flexrow');
                this._contSandbox.userData = new window.home[this._namespace][this._className]({app: this._app});
                this._contSandbox.add(this._contSandbox.userData.getContent());
                if (this._contSandbox.userData.run) {
                    this._contSandbox.userData.run();
                }
                break;

            case 'md':
                this._contSandbox.scrollableY = 'auto';
                this._renderMarkdown(rawCode);
                break;

        }

        
    }


    // PROTECTED
    /**
     * Entlädt die Showcase- bzw. Test-Klasse (z.B. home.sc.Button), falls eine geladen ist
     * @returns {undefined}
     */
    _destructShowcase() {
        const showcase = this._contSandbox ? this._contSandbox.userData : null;
        if (showcase && kijs.isFunction(showcase.destruct)) {
            showcase.destruct();
        }
        if (this._contSandbox) {
            this._contSandbox.userData = null;
        }
    }

    /**
     * Wandelt Markdown in HTML um, färbt die Code-Blöcke ein und zeigt das Ergebnis an
     * @param {String} rawCode
     * @returns {Promise}
     */
    async _renderMarkdown(rawCode) {
        const div = document.createElement('div');
        div.className = 'markdown';
        div.innerHTML = marked.parse(rawCode);

        try {
            await home_TabContainer.highlightCodeBlocks(div);
        } catch (ex) {
            // Falls das Einfärben nicht klappt, wird der Code einfach ohne Farben angezeigt
            console.warn('Syntax highlighting failed', ex);
        }

        this._contSandbox.html = div.outerHTML;
    }


    // PRIVATE
    // Cache der geladenen ACE-Module
    static #aceModules = {};

    // Sprachen in Code-Blöcken -> ACE-Modus
    static #languageModes = {
        css: 'css',
        html: 'html',
        javascript: 'javascript',
        js: 'javascript',
        json: 'json',
        less: 'css',
        php: 'php',
        sql: 'sql'
    };

    /**
     * Lädt ein ACE-Modul (nur beim ersten Mal, danach aus dem Cache)
     * @param {String} name  z.B. 'ace/mode/css'
     * @returns {Promise}
     */
    static #aceLoadModule(name) {
        if (!home_TabContainer.#aceModules[name]) {
            home_TabContainer.#aceModules[name] = new Promise((resolve) => {
                ace.config.loadModule(name, resolve);
            });
        }
        return home_TabContainer.#aceModules[name];
    }

    // LISTENERS
    // Relative Links auf Doku-, Showcase- und Test-Seiten in einem Tab öffnen
    // (in Markdown-Dateien und in Showcase-/Test-Seiten, z.B. Abschnitt "Siehe auch").
    // Links auf die API (api:kijs.gui.Button#caption) öffnen die Klassenseite.
    #onContSandboxClick(e) {
        if (!e.nodeEvent || !e.nodeEvent.target.closest) {
            return;
        }

        const a = e.nodeEvent.target.closest('a');
        const href = a ? a.getAttribute('href') : null;

        // Link auf die API
        if (href && /^api:/i.test(href)) {
            e.nodeEvent.preventDefault();
            this._app.openApiLink(href);
            return;
        }

        // Nur relative Links auf .md- und .js-Dateien. Alle anderen Links normal öffnen.
        if (!href || /^[a-z]+:/i.test(href) || !/\.(md|js)$/i.test(href.split('#')[0])) {
            return;
        }

        // Pfad relativ zur aktuellen Datei auflösen und relativ zum Ordner home zurückgeben
        const url = new URL(href, new URL(this._name, document.baseURI));
        const homePath = decodeURIComponent(new URL('.', document.baseURI).pathname);
        const path = decodeURIComponent(url.pathname).substring(homePath.length);

        if (this._app.openLinkedFile(path)) {
            e.nodeEvent.preventDefault();
        }
    }

    #onResetClick(e) {
        this.reset();
    }

    #onRunClick(e) {
        this.run();
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

        // Showcase entladen (z.B. Fenster, Listener auf window)
        this._destructShowcase();

        // Variablen (Objekte/Arrays) leeren
        this._app = null;

        // Basisklasse entladen (auch Sandbox, Editor und Buttons)
        super.destruct(true);
    }

};

