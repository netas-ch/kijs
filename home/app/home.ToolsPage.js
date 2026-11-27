/* global kijs */

// --------------------------------------------------------------
// home.ToolsPage
// --------------------------------------------------------------
/**
 * Tab mit den Werkzeugen, die Dateien generieren (API-Dokumentation, Texte für die
 * Übersetzung, Sprachdateien, Font-Awesome-Icons, CSS). Zeigt pro Werkzeug, ob die
 * erzeugten Dateien aktuell sind, und führt es aus (nur lokal).
 *
 * @example
 * const page = new home.ToolsPage({ app: app });
 * page.load();
 */
home.ToolsPage = class home_ToolsPage extends kijs.gui.container.tab.Container {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        this._app = null;
        this._isLocal = false;

        this._listEl = new kijs.gui.Container({
            cls: 'home-tools-list'
        });

        this._pageEl = new kijs.gui.Container({
            cls: 'home-api-page',
            scrollableY: 'auto',
            style: { flex: 1 },
            elements: [
                {
                    xtype: 'kijs.gui.Element',
                    cls: ['markdown', 'home-api-header'],
                    html: '<h1>' + kijs.getText('Werkzeuge') + '</h1>'
                        + '<p>' + kijs.getText('Skripte, die Dateien von kijs und der Home-App erzeugen. Ein Werkzeug gilt als '
                        + 'veraltet, wenn seine Quelldateien neuer sind als die erzeugten Dateien.') + '</p>'
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
            app: true
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }
    }



    // --------------------------------------------------------------
    // STATICS
    // --------------------------------------------------------------
    // Beschreibung der Werkzeuge in der angezeigten Reihenfolge (id wie in HomeTools.php)
    // Als Getter, damit die Texte erst nach dem Setzen der Sprache übersetzt werden
    static get tools() {
        return {
            api: {
                caption: kijs.getText('API-Dokumentation'),
                iconMap: 'kijs.iconMap.Fa.cubes',
                html: kijs.getText('Liest die Kommentare aus dem Quellcode von kijs und speichert sie für den Tab API. '
                    + 'Erstellt auch den <a href="#" data-home-action="apiIssues">Lückenbericht</a>. '
                    + 'Siehe Leitfaden <a href="#" data-home-file="data/docu/Leitfäden/Kommentare.md">Kommentare</a>.'),
                runCaption: kijs.getText('Aktualisieren')
            },
            usages: {
                caption: kijs.getText('Texte für die Übersetzung'),
                iconMap: 'kijs.iconMap.Fa.language',
                html: kijs.getText('Sucht im Quellcode alle Texte von <code>kijs.getText()</code> und schreibt sie in die Dateien, '
                    + 'die mit der Translate-App von Netas übersetzt werden (<code>usages.php</code> für kijs, '
                    + '<code>home_usages.php</code> für die Home-App). Skript: '
                    + '<code>tools/kilang/generateUsages.php</code>. Siehe Leitfaden '
                    + '<a href="#" data-home-file="data/docu/Leitfäden/Mehrsprachigkeit.md">Mehrsprachigkeit</a>.'),
                runCaption: kijs.getText('Ausführen')
            },
            translations: {
                caption: kijs.getText('Sprachdateien'),
                iconMap: 'kijs.iconMap.Fa.earth-americas',
                html: kijs.getText('Wandelt die übersetzten PHP-Sprachdateien (<code>tools/kilang/data/kijs_*.php</code> und '
                    + '<code>home_*.php</code>) in die JavaScript-Sprachdateien von kijs und der Home-App um. Skript: '
                    + '<code>tools/kilang/convertPhpLanguageFilesToJs.php</code>.'),
                runCaption: kijs.getText('Ausführen')
            },
            fontawesome: {
                caption: kijs.getText('Font-Awesome-Icons'),
                iconMap: 'kijs.iconMap.Fa.font-awesome',
                html: kijs.getText('Erstellt den Inhalt der IconMap von Font Awesome (benötigt Internet). Im Skript '
                    + '<code>tools/getFontAwesomeIcons.php</code> die Version eintragen, das Skript öffnen und die '
                    + 'Ausgabe in die Datei kopieren.'),
                url: '../tools/getFontAwesomeIcons.php',
                urlCaption: kijs.getText('Skript öffnen')
            },
            css: {
                caption: 'CSS',
                iconMap: 'kijs.iconMap.Fa.palette',
                html: kijs.getText('Die CSS-Dateien werden aus den LESS-Dateien im Ordner <code>css</code> kompiliert. NetBeans '
                    + 'macht das beim Speichern, sonst z.B. <code>lessc css/kijs.gui.less css/kijs.gui.css</code>.')
            }
        };
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



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    /**
     * Lädt den Stand der Werkzeuge und zeigt ihn an
     * @returns {Promise}
     */
    async load() {
        const rpcData = await kijs.getRpc('app').do({
            remoteFn: 'tools.status',
            waitMaskTarget: this
        });
        if (!kijs.isEmpty(rpcData.response.errorType) || !this._listEl) {
            return;
        }
        const status = rpcData.response.data;
        this._isLocal = !!status.isLocal;

        const elements = [];
        if (!this._isLocal) {
            elements.push({
                xtype: 'kijs.gui.Element',
                cls: 'home-api-hint',
                html: kijs.getText('Die Werkzeuge können nur lokal (localhost) ausgeführt werden.')
            });
        }
        kijs.Array.each(status.tools, function(tool) {
            if (home_ToolsPage.tools[tool.id]) {
                elements.push(this._createToolElement(tool));
            }
        }, this);

        this._listEl.removeAll();
        this._listEl.add(elements);
    }


    // PROTECTED
    /**
     * Erstellt den Abschnitt eines Werkzeugs mit Beschreibung, Stand und Buttons
     * @param {Object} tool  Stand vom Server {id, outdated, info, version, files}
     * @returns {kijs.gui.Container}
     */
    _createToolElement(tool) {
        const def = home_ToolsPage.tools[tool.id];
        const esc = kijs.String.htmlspecialchars;

        // Stand
        let html = '<h2>' + esc(def.caption) + ' ';
        if (tool.outdated) {
            html += '<span class="home-tools-state home-tools-outdated">' + kijs.getText('veraltet') + '</span>';
        } else if (tool.id !== 'fontawesome') {
            html += '<span class="home-tools-state home-tools-ok">' + kijs.getText('aktuell') + '</span>';
        }
        html += '</h2><p>' + def.html + '</p>';
        if (tool.version) {
            html += '<p class="home-tools-version">' + kijs.getText('Version: %1', '', esc(tool.version)) + '</p>';
        }
        if (tool.info) {
            html += '<p class="home-tools-info">' + esc(tool.info) + '</p>';
        }
        if (tool.files.length) {
            html += '<ul class="home-tools-files">';
            kijs.Array.each(tool.files, function(f) {
                html += '<li><code>' + esc(f.file) + '</code> '
                        + (f.time ? kijs.Date.formatLocal(new Date(f.time * 1000), true) : kijs.getText('fehlt'))
                        + '</li>';
            }, this);
            html += '</ul>';
        }

        // Buttons
        const buttons = [];
        if (def.runCaption) {
            buttons.push({
                xtype: 'kijs.gui.Button',
                caption: def.runCaption,
                iconMap: 'kijs.iconMap.Fa.play',
                disabled: !this._isLocal,
                on: {
                    click: () => { this._runTool(tool.id); }
                }
            });
        }
        if (def.url) {
            buttons.push({
                xtype: 'kijs.gui.Button',
                caption: def.urlCaption,
                iconMap: 'kijs.iconMap.Fa.arrow-up-right-from-square',
                disabled: !this._isLocal,
                on: {
                    click: () => { window.open(def.url, '_blank'); }
                }
            });
        }

        return new kijs.gui.Container({
            cls: ['home-tools-tool', 'kijs-flexrow'],
            elements: [
                {
                    xtype: 'kijs.gui.Icon',
                    iconMap: def.iconMap,
                    cls: 'home-tools-icon'
                },{
                    xtype: 'kijs.gui.Container',
                    cls: 'kijs-flexcolumn',
                    style: { flex: 1 },
                    elements: [
                        {
                            xtype: 'kijs.gui.Element',
                            cls: 'markdown',
                            html: html
                        },{
                            xtype: 'kijs.gui.Container',
                            cls: ['kijs-flexrow', 'home-tools-buttons'],
                            elements: buttons
                        }
                    ]
                }
            ]
        });
    }

    /**
     * Führt ein Werkzeug aus und lädt danach den Stand neu
     * @param {String} id
     * @returns {Promise}
     */
    async _runTool(id) {
        if (id === 'api') {
            await this._app.updateApi();
        } else {
            const rpcData = await kijs.getRpc('app').do({
                remoteFn: 'tools.run',
                requestData: { id: id },
                waitMaskTarget: this
            });
            if (kijs.isEmpty(rpcData.response.errorType)) {
                kijs.gui.CornerTipContainer.show(home_ToolsPage.tools[id].caption,
                        kijs.getText('Die Dateien wurden erzeugt.'), 'info');
            }
        }
        this.load();
    }


    // PRIVATE
    // LISTENERS
    #onPageClick(e) {
        if (!e.nodeEvent || !e.nodeEvent.target.closest) {
            return;
        }
        const a = e.nodeEvent.target.closest('a');
        if (!a) {
            return;
        }
        if (a.dataset.homeAction === 'apiIssues') {
            e.nodeEvent.preventDefault();
            this._app.openApiIssues();
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
        this._listEl = null;
        this._pageEl = null;

        // Basisklasse entladen
        super.destruct(true);
    }

};
