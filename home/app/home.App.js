/* global kijs, marked */

// --------------------------------------------------------------
// home.App
// --------------------------------------------------------------
window.home = window.home ?? {};
window.home.sc = {};
window.home.test = {};
home.App = class home_App {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {

        this._apiFooterEl = null;   // Fusszeile im Tab API mit Version und Datum der API
        this._apiHintEl = null;     // Hinweis im Tab API, wenn die Datenbank fehlt
        this._btnTools = null;      // Zahnrad in der Kopfzeile (Werkzeuge, nur lokal)
        this._content = null;
        this._header = null;
        this._navigation = null;
        this._tabShowcase = null;
        this._tabTest = null;
        this._tabDocu = null;
        this._tabApi = null;

        this._viewport = null;

        this._spinBox = null; // aktuell geöffnete spinBox (Sprache oder Design)

        // Sprache
        // Sprache mit Region, damit Zahlen und Datum im Schweizer Format angezeigt werden
        kijs.language = config.language ? config.language : 'de-CH';

        // RPC-Instanz für das App
        let appRpcConfig = {};
        if (config.appAjaxUrl) {
            appRpcConfig.url = config.appAjaxUrl;
        }
        kijs.setRpc('app', new kijs.gui.Rpc(appRpcConfig));

        // RPC-Instanz für den Inhalt (data)
        let dataRpcConfig = {};
        if (config.dataAjaxUrl) {
            dataRpcConfig.url = config.dataAjaxUrl;
        }
        kijs.setRpc('default', new kijs.gui.Rpc(dataRpcConfig));
    }



    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get viewport() {
        return this._viewport;
    }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    /**
     * Erstellt die Config eines Buttons, der die API-Dokumentation öffnet (z.B. für die Kopfzeile
     * einer Showcase-Seite). Bei mehreren Klassen öffnet der Button ein Menü mit allen Klassen.
     * @param {String|String[]} classNames  z.B. 'kijs.gui.Button'
     * @returns {Object}  Config für kijs.gui.Button
     */
    createApiButton(classNames) {
        if (!kijs.isArray(classNames)) {
            classNames = [classNames];
        }

        const config = {
            xtype: 'kijs.gui.Button',
            caption: 'API',
            iconMap: 'kijs.iconMap.Fa.cubes'
        };

        if (classNames.length === 1) {
            config.tooltip = 'API-Dokumentation von ' + classNames[0];
            config.on = {
                click: () => { this.openApiClass(classNames[0]); }
            };
        } else {
            config.tooltip = 'API-Dokumentation';
            config.menu = {
                closeOnClick: true,
                elements: classNames.map(className => ({
                    caption: className,
                    iconMap: 'kijs.iconMap.Fa.cube',
                    on: {
                        click: () => { this.openApiClass(className); }
                    }
                }))
            };
        }

        return config;
    }

    /**
     * Öffnet die API-Dokumentation einer Klasse in einem Tab
     * @param {String} className     z.B. 'kijs.gui.Button'
     * @param {String} [memberName]  Eintrag, der aufgeklappt wird, z.B. 'caption'
     */
    openApiClass(className, memberName=null) {
        this._openFile({
            nodeId: 'api:' + className,
            treeName: 'treeApi',
            path: 'api:' + className,
            displayText: className,
            filetype: 'api',
            iconMap: 'kijs.iconMap.Fa.cube',
            className: className,
            memberName: memberName
        });
    }

    /**
     * Öffnet den Lückenbericht der API-Dokumentation in einem Tab
     */
    openApiIssues() {
        this._openFile({
            nodeId: 'apiissues',
            treeName: 'treeApi',
            path: 'apiissues',
            displayText: 'Lückenbericht',
            filetype: 'apiissues',
            iconMap: 'kijs.iconMap.Fa.list-check'
        });
    }

    /**
     * Öffnet einen Link auf die API, z.B. aus einem Leitfaden oder einer Showcase-Seite.
     * Formate: 'api:kijs.gui.Button' oder 'api:kijs.gui.Button#caption'
     * @param {String} href
     * @returns {Boolean}  false, wenn der Link ungültig ist
     */
    openApiLink(href) {
        const match = /^api:([\w$.]+)(?:#([\w$]+))?$/i.exec((href || '').trim());
        if (!match) {
            kijs.gui.CornerTipContainer.show('API', 'Ungültiger Link: ' + kijs.String.htmlspecialchars(href), 'alert');
            return false;
        }
        this.openApiClass(match[1], match[2] || null);
        return true;
    }

    /**
     * Öffnet eine Datei aus der Navigation in einem Tab (z.B. über einen Link in einem Leitfaden).
     * Unterstützt werden Markdown-Dateien der Doku sowie JS-Dateien aus Showcase, Tests und Doku.
     * @param {String} path   Pfad relativ zum Ordner home.
     *                        Bsp: 'data/docu/Leitfäden/Config-System.md' oder 'data/showcase/field/field_Text.js'
     * @returns {Boolean}     false, wenn die Datei nicht unterstützt wird
     */
    openLinkedFile(path) {
        // Bereiche der Navigation (gleich wie in app/ajax.php)
        const roots = [
            { dir: 'data/docu/',     treeName: 'treeDocu',     namespace: 'docu' },
            { dir: 'data/showcase/', treeName: 'treeShowcase', namespace: 'sc' },
            { dir: 'data/test/',     treeName: 'treeTest',     namespace: 'test' }
        ];
        const root = roots.find(r => path.startsWith(r.dir));

        const filename = path.split('/').pop();
        const dotPos = filename.lastIndexOf('.');
        const filetype = dotPos > -1 ? filename.substring(dotPos + 1).toLowerCase() : '';
        const baseName = dotPos > -1 ? filename.substring(0, dotPos) : filename;

        if (!root || !['md', 'js'].includes(filetype) || (filetype === 'md' && root.namespace !== 'docu')) {
            return false;
        }

        const userData = {
            nodeId: path,           // damit das Element in der Navigation selektiert wird
            treeName: root.treeName,
            path: path + '?v=' + Date.now(),
            displayText: baseName.replace(/_/g, ' '),
            filetype: filetype
        };

        if (filetype === 'md') {
            userData.iconMap = 'kijs.iconMap.Fa.markdown';
        } else {
            userData.iconMap = 'kijs.iconMap.Fa.js';
            userData.namespace = root.namespace;
            userData.className = baseName;   // Bsp: 'field_Text' -> home.sc.field_Text
        }

        this._openFile(userData);
        return true;
    }

    /**
     * Sucht einen Begriff in API, Leitfäden, Showcase und Tests und zeigt die
     * Treffer in einem Tab an
     * @param {String} query
     */
    openSearch(query) {
        query = (query || '').trim();
        if (query.length < 2) {
            kijs.gui.CornerTipContainer.show('Suche', 'Bitte mindestens 2 Zeichen eingeben.', 'info');
            return;
        }
        this._openFile({
            path: 'search:' + query.toLowerCase(),
            displayText: 'Suche: ' + query,
            filetype: 'search',
            iconMap: 'kijs.iconMap.Fa.magnifying-glass',
            query: query
        });
    }

    /**
     * Öffnet den Quellcode einer kijs-Datei in einem Tab und springt zur Zeile
     * @param {String} file  Pfad relativ zum kijs-Ordner, z.B. 'js/gui/kijs.gui.Button.js'
     * @param {Number} [line=1]
     */
    openSource(file, line=1) {
        this._openFile({
            path: 'src:' + file,
            displayText: file.split('/').pop(),
            filetype: 'source',
            iconMap: 'kijs.iconMap.Fa.file-code',
            file: file,
            line: line
        });
    }

    /**
     * Öffnet die Werkzeuge (Generatoren für API, Sprachdateien usw.) in einem Tab
     */
    openTools() {
        this._openFile({
            path: 'tools',
            displayText: 'Werkzeuge',
            filetype: 'tools',
            iconMap: 'kijs.iconMap.Fa.gear'
        });
    }

    run() {
        document.title = 'kijs ' + kijs.version + ' - Home';

        this._header = this._createHeader();
        this._navigation = this._createNavigation();
        this._content = this._createContent();
        this._viewport = this._createViewport();

        this._viewport.render();

        this._updateApiStatus();

        // Direktlink in der Adresse (#api/kijs.gui.Button, #showcase/Button ...) öffnen
        this._openLink(this._getLocationLink());
        window.addEventListener('hashchange', () => this.#onHashChange());
    }

    /**
     * Aktualisiert die API-Dokumentation mit Fortschrittsanzeige und lädt danach den
     * Klassenbaum und einen offenen Lückenbericht neu.
     * @returns {Promise}  Zusammenfassung oder null bei Abbruch oder Fehler
     */
    async updateApi() {
        const update = new home.ApiUpdate();
        const stats = await update.run();
        this._updateApiStatus();
        if (stats) {
            this._getTreeByName('treeApi').load();

            // offenen Lückenbericht neu laden
            kijs.Array.each(this._content.elements, function(el) {
                if (el instanceof home.ApiIssuesPage) {
                    el.load();
                }
            }, this);
        }
        return stats;
    }


    // PROTECTED
    _createContent() {
        // Schriftzug als Text (nicht im Hintergrundbild), damit er auf allen
        // Bildschirmen scharf ist
        let html = '';
        html += '<div class="home-start">';
        html += ' <div class="home-start-title">kijs</div>';
        html += ' <div class="home-start-subtitle">the new aera of multidevice apps</div>';
        html += ' <ul class="home-start-links">';
        html += '  <li><a href="#" data-home-action="firstSteps">Erste Schritte mit kijs</a></li>';
        html += '  <li><a href="#" data-home-action="showcase">Showcase</a></li>';
        html += '  <li><a href="#" data-home-action="docu">Dokumentation</a></li>';
        html += '  <li><a href="#" data-home-action="api">API-Dokumentation</a></li>';
        html += ' </ul>';
        html += ' <ul class="home-start-links home-start-links-more">';
        html += '  <li><a href="../testViewport/test_afterResize.php">ViewPort afterResize Events</a></li>';
        html += '  <li><a href="https://kanboard.netas.ch/?controller=BoardViewController&action=readonly&token=7a2e745689468ddd16fa8dd741fcabe65b7983e8c735ab02023e338cdc67" target="blank">Kanboard (public, read only)</a></li>';
        html += ' </ul>';
        html += '</div>';

        return new kijs.gui.container.Tab({
            sortable: true,
            style: {
                flex: 1
            },
            on: {
                change: this.#onContentTabChange,
                context: this
            },
            elements:[
                {
                    tabIconMap: 'kijs.iconMap.Fa.house',
                    tabTooltip: 'Home',
                    tabClosable: false,
                    scrollableY: 'auto',
                    cls: 'tabHome',
                    style:{
                        flex: 1
                    },
                    html: html,
                    on: {
                        click: this.#onHomeClick,
                        context: this
                    }
                }
            ]
        });
    }

    _createHeader() {
        // Zahnrad für die Werkzeuge, nur lokal sichtbar (siehe _updateApiStatus)
        this._btnTools = new kijs.gui.Button({
            name: 'btnTools',
            iconMap: 'kijs.iconMap.Fa.gear',
            tooltip: 'Werkzeuge',
            visible: false,
            on: {
                click: this.#onBtnToolsClick,
                context: this
            }
        });

        return new kijs.gui.PanelBar({
            html: 'kijs ' + kijs.version + ' - Home',
            iconCls: 'icoKijs16',
            style: {
                fontSize: '16px',
                marginBottom: '4px'
            },
            elementsRight:[
                {
                    xtype: 'kijs.gui.field.Text',
                    name: 'searchField',
                    placeholder: 'Suchen (Enter)',
                    cls: 'home-search-field',
                    style: {
                        width: '200px'
                    },
                    on: {
                        enterPress: this.#onSearchEnterPress,
                        context: this
                    }
                },
                this._btnTools,
                {
                    xtype: 'kijs.gui.Button',
                    name: 'btnLanguage',
                    iconMap: 'kijs.iconMap.Fa.earth-americas',
                    tooltip: 'Sprache',
                    on: {
                        click: this.#onBtnLanguageClick,
                        context: this
                    }
                },{
                    xtype: 'kijs.gui.Button',
                    name: 'btnTheme',
                    iconMap: 'kijs.iconMap.Fa.palette',
                    tooltip: 'Design',
                    on: {
                        click: this.#onBtnThemeClick,
                        context: this
                    }
                }
            ]
        });
    }

    _createNavigation() {
        this._tabShowcase = new kijs.gui.container.tab.Container({
            //tabCaption: 'Showcase',
            tabIconMap: 'kijs.iconMap.Fa.eye',
            tabTooltip: 'Showcase',
            cls: 'kijs-flexcolumn',
            elements: [
                {
                    xtype: 'kijs.gui.Tree',
                    name: 'treeShowcase',
                    cls: 'kijs-transparentborder',
                    selectType: 'simple-single',
                    primaryKeyFields: ['nodeId'],
                    valueField: 'nodeId',
                    displayTextField: 'displayText',
                    iconMapField: 'iconMap',
                    allowChildrenField: 'allowChildren',
                    childrenField: 'children',
                    rpc: 'app',
                    rpcLoadFn: 'naviShowcase.load',
                    autoLoad: true,
                    style: {
                        flex: 1
                    },
                    on: {
                        keyDown: this.#onTreeKeyDown,
                        elementClick: this.#onTreeElementClick,
                        context: this
                    }
                }
            ]
        });

        this._tabTest = new kijs.gui.container.tab.Container({
            //tabCaption: 'Tests',
            tabIconMap: 'kijs.iconMap.Fa.code',
            tabTooltip: 'Tests',
            cls: 'kijs-flexcolumn',
            elements: [
                {
                    xtype: 'kijs.gui.Tree',
                    name: 'treeTest',
                    cls: 'kijs-transparentborder',
                    selectType: 'manual',
                    primaryKeyFields: ['nodeId'],
                    valueField: 'nodeId',
                    displayTextField: 'displayText',
                    iconMapField: 'iconMap',
                    allowChildrenField: 'allowChildren',
                    childrenField: 'children',
                    rpc: 'app',
                    rpcLoadFn: 'naviTest.load',
                    autoLoad: true,
                    style: {
                        flex: 1
                    },
                    on: {
                        keyDown: this.#onTreeKeyDown,
                        elementClick: this.#onTreeElementClick,
                        context: this
                    }
                }
            ]
        });

        this._tabDocu = new kijs.gui.container.tab.Container({
            //tabCaption: 'Doku',
            tabIconMap: 'kijs.iconMap.Fa.book',
            tabTooltip: 'Dokumentation',
            cls: 'kijs-flexcolumn',
            elements: [
                {
                    xtype: 'kijs.gui.Tree',
                    name: 'treeDocu',
                    cls: 'kijs-transparentborder',
                    selectType: 'manual',
                    primaryKeyFields: ['nodeId'],
                    valueField: 'nodeId',
                    displayTextField: 'displayText',
                    iconMapField: 'iconMap',
                    allowChildrenField: 'allowChildren',
                    childrenField: 'children',
                    rpc: 'app',
                    rpcLoadFn: 'naviDocu.load',
                    autoLoad: true,
                    style: {
                        flex: 1
                    },
                    on: {
                        keyDown: this.#onTreeKeyDown,
                        elementClick: this.#onTreeElementClick,
                        context: this
                    }
                }
            ]
        });

        this._apiHintEl = new kijs.gui.Element({
            cls: 'home-api-hint',
            visible: false
        });

        this._apiFooterEl = new kijs.gui.Element({
            cls: 'home-api-footer',
            visible: false
        });

        this._tabApi = new kijs.gui.container.tab.Container({
            //tabCaption: 'API',
            tabIconMap: 'kijs.iconMap.Fa.cubes',
            tabTooltip: 'API',
            cls: 'kijs-flexcolumn',
            elements: [
                this._apiHintEl,
                {
                    xtype: 'kijs.gui.Tree',
                    name: 'treeApi',
                    cls: 'kijs-transparentborder',
                    selectType: 'manual',
                    primaryKeyFields: ['nodeId'],
                    valueField: 'nodeId',
                    displayTextField: 'displayText',
                    iconMapField: 'iconMap',
                    allowChildrenField: 'allowChildren',
                    childrenField: 'children',
                    rpc: 'app',
                    rpcLoadFn: 'naviApi.load',
                    expandedField: 'expanded',
                    autoLoad: true,
                    style: {
                        flex: 1
                    },
                    on: {
                        keyDown: this.#onTreeKeyDown,
                        elementClick: this.#onTreeElementClick,
                        context: this
                    }
                },
                this._apiFooterEl
            ]
        });

        return new kijs.gui.Panel({
            caption: 'Navigation',
            collapsible: 'left',
            width: 180,
            cls: ['kijs-borderless', 'kijs-flexcolumn'],
            style: {
                flex: 'none'
            },
            elements:[
                {
                    xtype: 'kijs.gui.container.Tab',
                    style:{
                        flex: 1
                    },
                    elements:[
                        this._tabShowcase,
                        this._tabTest,
                        this._tabDocu,
                        this._tabApi
                    ]
                }
            ]
        });
    }

    _createViewport() {
        return new kijs.gui.ViewPort({
            cls: 'kijs-flexcolumn',
            elements: [
                // TOP: Header
                this._header,

                {
                    xtype: 'kijs.gui.Container',
                    cls: 'kijs-flexrow',
                    style: {
                        flex: 1,
                        minHeight: '40px'
                    },
                    elements: [
                        // LEFT: Navigation
                        this._navigation,
                        {
                            xtype: 'kijs.gui.Splitter',
                            targetPos: 'left'
                        },
                        // CENTER: Content
                        this._content
                    ]
                }
            ]
        });
    }

    /**
     * Gibt den Direktlink aus der Adresse zurück (Teil nach #, dekodiert)
     * @returns {String}  z.B. 'api/kijs.gui.Button' oder '' ohne Link
     */
    _getLocationLink() {
        try {
            return decodeURIComponent(window.location.hash.replace(/^#/, ''));
        } catch (ex) {
            return '';
        }
    }

    /**
     * Gibt den Direktlink eines Tabs zurück (Teil nach # in der Adresse)
     *   API:          'api/kijs.gui.Button' bzw. 'api/kijs.gui.Button/caption'
     *   Lückenbericht 'api-issues'
     *   Showcase:     'showcase/field/field_Text'     (data/showcase/field/field_Text.js)
     *   Tests:        'test/test_Grid'                (data/test/test_Grid.js)
     *   Doku:         'docu/Leitfäden/Config-System'  (data/docu/Leitfäden/Config-System.md)
     *   Suche:        'search/Combo'
     *   Quellcode:    'src/js/gui/kijs.gui.Button.js'
     *   Werkzeuge:    'tools'
     * @param {kijs.gui.Element} tabEl
     * @returns {String}  '' für die Startseite bzw. ein Tab ohne Link
     */
    _getTabLink(tabEl) {
        const d = tabEl ? tabEl.userData : null;
        if (kijs.isEmpty(d)) {
            return '';
        }
        switch (d.filetype) {
            case 'api':       return 'api/' + d.className + (d.memberName ? '/' + d.memberName : '');
            case 'apiissues': return 'api-issues';
            case 'search':    return 'search/' + d.query;
            case 'source':    return 'src/' + d.file;
            case 'tools':     return 'tools';
        }
        const path = (d.nodeId || d.path || '').split('?')[0];
        const m = /^data\/(showcase|test|docu)\/(.+)\.(js|md)$/.exec(path);
        return m ? m[1] + '/' + m[2] : '';
    }

    _getTreeByName(name) {
        let el = null;

        switch (name) {
            case 'treeApi':
                el = this._tabApi.downX('kijs.gui.Tree');
                break;

            case 'treeDocu':
                el = this._tabDocu.downX('kijs.gui.Tree');
                break;

            case 'treeShowcase':
                el = this._tabShowcase.downX('kijs.gui.Tree');
                break;

            case 'treeTest':
                el = this._tabTest.downX('kijs.gui.Tree');
                break;

        }

        return el;
    }

    /**
     * Öffnet eine Datei in einem Tab oder selektiert das Tab, falls sie bereits offen ist
     * @param {Object} userData   userData aus der Navigation (path, displayText, filetype, ...)
     * @returns {undefined}
     */
    _openFile(userData) {
        // Wenn die Datei bereits offen ist: selektieren
        // (Vergleich ohne den Parameter '?v=...')
        const basePath = userData.path.split('?')[0];
        let openTab = null;
        kijs.Array.each(this._content.elements, function(el) {
            if (el.name && el.name.split('?')[0] === basePath) {
                openTab = el;
                return false;
            }
        }, this);

        if (openTab) {
            this._content.currentName = openTab.name;
            if (userData.filetype === 'api' && userData.memberName) {
                openTab.expandEntry(userData.memberName);
            } else if (userData.filetype === 'source') {
                openTab.gotoLine(userData.line);
            }
            return;
        }

        // API-Dokumentation einer Klasse
        if (userData.filetype === 'api') {
            const page = new home.ApiClassPage({
                app: this,
                name: userData.path,
                className: userData.className,
                expandMember: userData.memberName || null,
                tabCaption: userData.displayText,
                tabIconMap: userData.iconMap,
                tabClosable: true,
                userData: userData
            });
            this._content.add(page);
            this._content.currentName = userData.path;
            page.load();
            return;
        }

        // Lückenbericht der API-Dokumentation
        if (userData.filetype === 'apiissues') {
            const page = new home.ApiIssuesPage({
                app: this,
                name: userData.path,
                tabCaption: userData.displayText,
                tabIconMap: userData.iconMap,
                tabClosable: true,
                userData: userData
            });
            this._content.add(page);
            this._content.currentName = userData.path;
            page.load();
            return;
        }

        // Werkzeuge
        if (userData.filetype === 'tools') {
            const page = new home.ToolsPage({
                app: this,
                name: userData.path,
                tabCaption: userData.displayText,
                tabIconMap: userData.iconMap,
                tabClosable: true,
                userData: userData
            });
            this._content.add(page);
            this._content.currentName = userData.path;
            page.load();
            return;
        }

        // Treffer der globalen Suche
        if (userData.filetype === 'search') {
            const page = new home.SearchPage({
                app: this,
                name: userData.path,
                query: userData.query,
                tabCaption: kijs.String.htmlspecialchars(userData.displayText),
                tabIconMap: userData.iconMap,
                tabClosable: true,
                userData: userData
            });
            this._content.add(page);
            this._content.currentName = userData.path;
            page.load();
            return;
        }

        // Quellcode einer kijs-Datei
        if (userData.filetype === 'source') {
            const page = new home.ApiSourcePage({
                name: userData.path,
                file: userData.file,
                line: userData.line,
                tabCaption: userData.displayText,
                tabIconMap: userData.iconMap,
                tabClosable: true,
                userData: userData
            });
            this._content.add(page);
            this._content.currentName = userData.path;
            page.load();
            return;
        }

        // sonst in einem neuen Tab öffnen
        let tabCont = new home.TabContainer({
            app: this,
            name: userData.path,
            tabCaption: userData.displayText,
            tabClosable: true,
            userData: userData
        });
        if (userData.iconMap) {
            tabCont.tabButtonEl.iconMap = userData.iconMap;
        }
        if (userData.filetype) {
            tabCont.filetype = userData.filetype;
        }
        if (userData.namespace) {
            tabCont.namespace = userData.namespace;
        }
        if (userData.className) {
            tabCont.className = userData.className;
        }
        this._content.add(tabCont);
        this._content.currentName = userData.path;

        // html/js/md laden und ausführen
        tabCont.reset();
    }

    _openFocusTreeElement(focusEl) {
        // Ordner: Auf-/Zuklappen
        if (focusEl.hasChildren) {
            if (focusEl.expanded) {
                focusEl.collapse();
            } else {
                focusEl.expand();
            }

        // Datei
        } else {
            this._openFile(focusEl.dataRow['userData']);

            // TreeElement selektieren
            focusEl.parent.select(focusEl, false, false);
        }
    }

    /**
     * Öffnet die Seite zu einem Direktlink (Format siehe _getTabLink()). Ein leerer Link
     * zeigt die Startseite.
     * @param {String} link
     * @returns {Boolean}  false, wenn der Link ungültig ist
     */
    _openLink(link) {
        link = (link || '').trim();
        if (!link) {
            this._content.currentEl = this._content.elements[0];
            return true;
        }

        const pos = link.indexOf('/');
        const type = pos > -1 ? link.substring(0, pos) : link;
        const rest = pos > -1 ? link.substring(pos + 1) : '';

        switch (type) {
            case 'api': {
                const parts = rest.split('/');
                if (!/^[\w$.]+$/.test(parts[0])) {
                    break;
                }
                this._showNavigationTab(this._tabApi);
                this.openApiClass(parts[0], parts[1] || null);
                return true;
            }

            case 'api-issues':
                this._showNavigationTab(this._tabApi);
                this.openApiIssues();
                return true;

            case 'showcase':
            case 'test':
            case 'docu': {
                const ext = type === 'docu' ? '.md' : '.js';
                const tabs = { showcase: this._tabShowcase, test: this._tabTest, docu: this._tabDocu };
                if (rest && !rest.includes('..') && this.openLinkedFile('data/' + type + '/' + rest + ext)) {
                    this._showNavigationTab(tabs[type]);
                    return true;
                }
                break;
            }

            case 'search':
                if (rest) {
                    this.openSearch(rest);
                    return true;
                }
                break;

            case 'src':
                if (/^js\/[\w\/.-]+\.js$/.test(rest) && !rest.includes('..')) {
                    this.openSource(rest);
                    return true;
                }
                break;

            case 'tools':
                this.openTools();
                return true;
        }

        kijs.gui.CornerTipContainer.show('Link', 'Ungültiger Link: ' + kijs.String.htmlspecialchars(link), 'alert');
        return false;
    }

    /**
     * Zeigt einen Bereich der Navigation an (Showcase, Tests, Doku oder API)
     * @param {kijs.gui.container.tab.Container} tabEl  z.B. this._tabShowcase
     */
    _showNavigationTab(tabEl) {
        if (this._navigation.collapsed) {
            this._navigation.collapsed = false;
        }
        tabEl.parent.currentEl = tabEl;
    }

    /**
     * Zeigt den Stand der API-Datenbank im Tab API und beim Zahnrad (Werkzeuge) an.
     * Das Zahnrad ist nur lokal sichtbar.
     * @returns {Promise}
     */
    async _updateApiStatus() {
        const rpcData = await kijs.getRpc('app').do({
            remoteFn: 'api.status',
            waitMaskTarget: 'none'
        });
        if (!kijs.isEmpty(rpcData.response.errorType)) {
            return;
        }
        const status = rpcData.response.data;

        // Tooltip mit dem Stand der API, Badge bei einem Problem
        let html = '<b>Werkzeuge</b><br>API-Dokumentation ';
        let problem = false;
        if (status.exists) {
            html += 'vom ' + kijs.Date.format(new Date(status.updated), 'd.m.Y H:i') + '<br>';
            html += 'kijs ' + kijs.String.htmlspecialchars(status.kijsVersion || '?');
            if (status.stats) {
                html += ', ' + status.stats.classes + ' Klassen';
            }
            if (status.kijsVersion !== kijs.version) {
                html += '<br><b>Version stimmt nicht mit kijs ' + kijs.version + ' überein.</b>';
                problem = true;
            }
        } else {
            html += 'fehlt noch.';
            problem = true;
        }
        if (status.isRunning) {
            html += '<br>Es läuft gerade ein Update.';
        }
        this._btnTools.tooltip = html;
        this._btnTools.badgeText = problem ? '!' : '';
        this._btnTools.visible = !!status.isLocal;

        // Hinweis im Tab API, wenn die Datenbank fehlt
        if (!status.exists) {
            this._apiHintEl.html = 'Die API-Datenbank fehlt noch. '
                    + (status.isLocal
                        ? 'Sie kann über das Zahnrad oben rechts (Werkzeuge) erstellt werden.'
                        : 'Sie kann nur lokal (localhost) erstellt werden.');
        }
        this._apiHintEl.visible = !status.exists;

        // Fusszeile mit Version und Datum
        if (status.exists) {
            this._apiFooterEl.html = 'kijs ' + kijs.String.htmlspecialchars(status.kijsVersion || '?')
                    + ' · ' + kijs.Date.format(new Date(status.updated), 'd.m.Y H:i');
            this._apiFooterEl.tooltip = 'Version und Datum der API-Dokumentation';
        }
        this._apiFooterEl.visible = !!status.exists;
    }


    // PRIVATE
    // LISTENERS
    #onBtnLanguageClick(e) {
        if (this._spinBox) {
            this._spinBox.destruct();
        }

        this._spinBox = new kijs.gui.SpinBox({
            target: e.element,
            ownerNodes: e.element,
            cls: 'kijs-flexform',
            innerStyle: {
                padding: '10px'
            },
            elements: [
                {
                    xtype: 'kijs.gui.field.OptionGroup',
                    name: 'cssFile',
                    label: 'Design',
                    labelHide: true,
                    valueField: 'id',
                    displayTextField: 'Bezeichnung',
                    required: true,
                    data: [
                        { id:'de-CH', Bezeichnung:'Deutsch' },
                        { id:'en', Bezeichnung:'English' },
                        { id:'fr-CH', Bezeichnung:'Français' }
                    ],
                    value: kijs.language,
                    on: {
                        change: function(e) {
                            var loc = window.location;
                            // Direktlink (#...) behalten, damit die Seite offen bleibt
                            window.location = loc.protocol + '//' + loc.host + loc.pathname + '?lang=' + e.value + loc.hash;
                        },
                        context: this
                    }
                }
            ]
        });
        this._spinBox.show();
    }

    #onBtnThemeClick(e) {
        if (this._spinBox) {
            this._spinBox.destruct();
        }

        this._spinBox = new kijs.gui.SpinBox({
            target: e.element,
            ownerNodes: e.element,
            cls: 'kijs-flexform',
            innerStyle: {
                padding: '10px'
            },
            elements: [
                {
                    xtype: 'kijs.gui.field.OptionGroup',
                    name: 'cssFile',
                    label: 'Design',
                    labelWidth: 74,
                    valueField: 'id',
                    displayTextField: 'Bezeichnung',
                    required: true,
                    data: [
                        { id:'kijs.theme.default.css', Bezeichnung:'Standard' },
                        {id:'kijs.theme.retro.css', Bezeichnung:'Retro' },
                        { id:'kijs.theme.black.css', Bezeichnung:'Black' }
                    ],
                    value: this._currentDesign ? this._currentDesign : 'kijs.theme.default.css',
                    on: {
                        change: function(e) {
                            this._currentDesign = e.value;
                            kijs.Dom.cssFileReplace(e.oldValue, e.value)
                                .then((node) => {
                                    if (this._viewport.isRendered) {
                                        this._viewport.render();
                                    }
                                })
                                .catch((ex) => {
                                    throw ex;
                                });
                        },
                        context: this
                    }
                },{
                    xtype: 'kijs.gui.field.Switch',
                    name: 'darkMode',
                    label: 'Dark mode',
                    labelWidth: 74,
                    value: kijs.Dom.themeGet() === 'dark',
                    on: {
                        change: function(e) {
                            if (e.value) {
                                this._viewport.theme = 'dark';
                            } else {
                                this._viewport.theme = 'light';
                            }
                        },
                        context: this
                    }
                },{
                    xtype: 'kijs.gui.container.Fieldset',
                    caption: 'Akzentfarben',
                    collapsible: true,
                    collapsed: true,
                    elements:[
                        {
                            xtype: 'kijs.gui.field.Color',
                            name: 'color1',
                            label: 'Farbe 1',
                            labelWidth: 74,
                            value: getComputedStyle(document.body).getPropertyValue('--accentColor'),
                            on: {
                                change: function(e) {
                                    document.documentElement.style.setProperty('--accentColor', e.value);
                                },
                                context: this
                            }
                        },{
                            xtype: 'kijs.gui.field.Color',
                            name: 'color2',
                            label: 'Farbe 2',
                            labelWidth: 74,
                            value: getComputedStyle(document.body).getPropertyValue('--accentColor2'),
                            on: {
                                change: function(e) {
                                    document.documentElement.style.setProperty('--accentColor2', e.value);
                                },
                                context: this
                            }
                        },{
                            xtype: 'kijs.gui.field.Color',
                            name: 'color3',
                            label: 'Farbe 3',
                            labelWidth: 74,
                            value: getComputedStyle(document.body).getPropertyValue('--accentColor3'),
                            on: {
                                change: function(e) {
                                    document.documentElement.style.setProperty('--accentColor3', e.value);
                                },
                                context: this
                            }
                        }
                    ]
                }
            ]
        });
        this._spinBox.show();
    }

    #onBtnToolsClick(e) {
        this.openTools();
    }

    #onContentTabChange(e) {
        let oldTreeEl = null;
        let newTreeEl = null;

        // Direktlink in der Adresse nachführen (neuer Eintrag in der History des Browsers,
        // damit Zurück und Vor funktionieren)
        const link = this._getTabLink(e.currentEl);
        if (link !== this._getLocationLink()) {
            const url = window.location.pathname + window.location.search + (link ? '#' + encodeURI(link) : '');
            window.history.pushState(null, '', url);
        }

        // betroffene Trees ermitteln
        if (!kijs.isEmpty(e.oldEl.userData) && e.oldEl.userData.treeName) {
            oldTreeEl = this._getTreeByName(e.oldEl.userData.treeName);
        }
        if (!kijs.isEmpty(e.currentEl.userData) && e.currentEl.userData.treeName) {
            newTreeEl = this._getTreeByName(e.currentEl.userData.treeName);
        }

        // vorheriges und aktuelles Tab sind im gleichen Tree
        if (newTreeEl && oldTreeEl === newTreeEl) {
            newTreeEl.selectByPrimaryKeys(e.currentEl.userData.nodeId, false, false);
            newTreeEl.reassignCurrent();
            newTreeEl.scrollToFocus();

        // vorheriges und aktuelles Tab sind in unterschiedlichen Trees
        } else {
            // alter Tree aktualisieren
            if (oldTreeEl) {
                oldTreeEl.clearSelections(false);
            }

            // neuer Tree aktualisieren
            if (newTreeEl) {
                newTreeEl.selectByPrimaryKeys(e.currentEl.userData.nodeId, false, false);
                newTreeEl.reassignCurrent();
                newTreeEl.scrollToFocus();
            }
        }
    }

    // Zurück/Vor im Browser bzw. geänderter Link in der Adresse
    #onHashChange() {
        // Klick auf einen internen Link href="#" ohne preventDefault(): ignorieren und den
        // Link des aktuellen Tabs wiederherstellen
        if (window.location.href.endsWith('#')) {
            const current = this._getTabLink(this._content.currentEl);
            window.history.replaceState(null, '', window.location.pathname + window.location.search
                    + (current ? '#' + encodeURI(current) : ''));
            return;
        }

        const link = this._getLocationLink();
        if (link !== this._getTabLink(this._content.currentEl)) {
            this._openLink(link);
        }
    }

    // Links auf der Startseite
    #onHomeClick(e) {
        const a = e.nodeEvent && e.nodeEvent.target.closest ? e.nodeEvent.target.closest('a[data-home-action]') : null;
        if (!a) {
            return;
        }
        e.nodeEvent.preventDefault();

        switch (a.dataset.homeAction) {
            case 'firstSteps':
                this._showNavigationTab(this._tabDocu);
                this.openLinkedFile('data/docu/Erste_Schritte.md');
                break;

            case 'showcase':
                this._showNavigationTab(this._tabShowcase);
                break;

            case 'docu':
                this._showNavigationTab(this._tabDocu);
                break;

            case 'api':
                this._showNavigationTab(this._tabApi);
                break;
        }
    }

    #onSearchEnterPress(e) {
        this.openSearch(e.element.value);
    }

    #onTreeElementClick(e) {
        let focusEl = this._getTreeByName(e.element.name).current;

        if (focusEl) {
            this._openFocusTreeElement(focusEl);
        }
    }

    #onTreeKeyDown(e) {
        switch (e.nodeEvent.code) {
            case 'Enter':
            case 'Space':
                let focusEl = this._getTreeByName(e.element.name).current;

                if (focusEl) {
                    this._openFocusTreeElement(focusEl);
                }
                break;
        }
    }



    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct() {
        this._viewport.destruct();

        // Elemente/DOM-Objekte entladen
        if (this._spinBox) {
            this._spinBox.destruct();
        }

        // Variablen (Objekte/Arrays) leeren
        this._apiFooterEl = null;
        this._apiHintEl = null;
        this._btnTools = null;
        this._header = null;
        this._tabShowcase = null;
        this._tabTest = null;
        this._tabDocu = null;
        this._tabApi = null;
        this._navigation = null;
        this._content = null;
        this._viewport = null;
        this._spinBox = null;
    }

};

