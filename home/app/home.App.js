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

        this._content = null;
        this._header = null;
        this._navigation = null;
        this._tabShowcase = null;
        this._tabTest = null;
        this._tabDocu = null;

        this._viewport = null;

        // Sprache
        kijs.language = config.language ? config.language : 'de';

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
    run() {
        document.title = 'kijs ' + kijs.version + ' - Home';

        this._header = this._createHeader();
        this._navigation = this._createNavigation();
        this._content = this._createContent();
        this._viewport = this._createViewport();

        this._viewport.render();
    }


    // PROTECTED
    _createContent() {
        let html = '';
        html += '<div style="margin: 420px 0 0 370px">';
        html += ' <a href="../testViewPort/test_afterResize.php">ViewPort afterResize Events</a><br>';
        html += ' <br>';
        html += ' <a href="https://kanboard.netas.ch/?controller=BoardViewController&action=readonly&token=7a2e745689468ddd16fa8dd741fcabe65b7983e8c735ab02023e338cdc67" target="blank">Kanboard (public, read only)</a><br>';
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
                    html: html
                }
            ]
        });
    }

    _createHeader() {
        return new kijs.gui.PanelBar({
            html: 'kijs ' + kijs.version + ' - Home',
            iconCls: 'icoKijs16',
            style: {
                fontSize: '16px',
                marginBottom: '4px'
            },
            elementsRight:[
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
                        this._tabDocu
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

    _getTreeByName(name) {
        let el = null;

        switch (name) {
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
            let userData = focusEl.dataRow['userData'];

            // Wenn die Datei bereits offen ist: selektieren
            if (this._content.down(userData.path)) {
                this._content.currentName = userData.path;

            // sonst öffnen
            } else {
                // Neues Tab erstellen
                let tabCont = new home.TabContainer({
                    app: this,
                    name: userData.path,
                    tabCaption: userData.displayText,
                    tabClosable: true,
                    userData: userData,
                    on: {
                        destruct: this.#onContentTabContainerDestruct,
                        context: this
                    }
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

            // TreeElement selektieren
            focusEl.parent.select(focusEl, false, false);
        }
    }


    // PRIVATE
    // LISTENERS
    #onBtnThemeClick(e) {
        const spinBox = new kijs.gui.SpinBox({
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
        spinBox.show();
    }

    #onBtnLanguageClick(e) {
        const spinBox = new kijs.gui.SpinBox({
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
                        { id:'de', Bezeichnung:'Deutsch' },
                        { id:'en', Bezeichnung:'English' },
                        { id:'fr', Bezeichnung:'Français' }
                    ],
                    value: kijs.language,
                    on: {
                        change: function(e) {
                            var loc = window.location;
                            window.location = loc.protocol + '//' + loc.host + loc.pathname + '?lang=' + e.value;
                        },
                        context: this
                    }
                }
            ]
        });
        spinBox.show();
    }

    #onContentTabChange(e) {
        let oldTreeEl = null;
        let newTreeEl = null;

        // betroffene Trees ermitteln
        if (!kijs.isEmpty(e.oldEl.userData) && e.oldEl.userData.treeName) {
            oldTreeEl = this._getTreeByName(e.oldEl.userData.treeName);
        }
        if (!kijs.isEmpty(e.currentEl.userData) && e.currentEl.userData.treeName) {
            newTreeEl = this._getTreeByName(e.currentEl.userData.treeName);
        }

        // vorheriges und aktuelles Tab sind im gleichen Tree
        if (oldTreeEl === newTreeEl) {
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

    #onContentTabContainerDestruct(e) {
        if (e.element.userData && e.element.userData.destruct) {
            e.element.userData.destruct();
        }
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

        this._header = null;
        this._tabShowcase = null;
        this._tabTest = null;
        this._tabDocu = null;
        this._navigation = null;
        this._content = null;
        this._viewport = null;
    }

};

