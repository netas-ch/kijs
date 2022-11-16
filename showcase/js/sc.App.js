/* global kijs */

// --------------------------------------------------------------
// sc.App
// --------------------------------------------------------------
window.sc = {};
sc.App = class sc_App {

    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {

        this._content = null;
        this._header = null;
        this._navigation = null;
        this._viewport = null;
        
        this._currentContentCls = null;
        
        // RPC-Instanz
        var rpcConfig = {};
        if (config.ajaxUrl) {
            rpcConfig.url = config.ajaxUrl;
        }
        this._rpc = new kijs.gui.Rpc(rpcConfig);
        
    }
    
    
    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get rpc() { return this._rpc; }


    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    run() {
        document.title = 'kijs ' + kijs.version + ' - Showcase';
        
        this._header = this._createHeader();
        this._navigation = this._createNavigation();
        this._content = this._createContent();
        this._viewport = this._createViewport();
        
        this._viewport.render();
    }
    
    
    // PROTECTED
    _createContent() {
        return new kijs.gui.Container({
            cls: 'kijs-flexrow',
            style: {
                flex: 1
            },
            elements:[
                {
                    xtype: 'kijs.gui.Element',
                    style:{
                        flex: 1,
                        background: '#fff url(img/background.jpg) scroll no-repeat 0% 0%'
                    },
                    html: '<div style="margin: 420px 0 0 370px"><a href="../testApp">Test-App</a><br><a href="../testViewPort/test_afterResize.php">ViewPort afterResize Events</a></div>'
                }
            ]
        });
    }
    
    _createHeader() {
        return new kijs.gui.PanelBar({
            html: 'kijs ' + kijs.version + ' - Showcase',
            iconCls: 'icoKijs16',
            style: {
                fontSize: '16px',
                marginBottom: '4px'
            },
            elementsRight:[
                {
                    xtype: 'kijs.gui.Button',
                    name: 'btnTheme',
                    iconMap: 'kijs.iconMap.Fa.palette',
                    tooltip: 'Design wählen',
                    on: {
                        click: this._onBtnThemeClick,
                        context: this
                    }
                }
            ]
        });
    }
    
    _createNavigation() {
        return new kijs.gui.Panel({
            caption: 'Navigation',
            collapsible: 'left',
            width: 180,
            cls: 'kijs-flexcolumn',
            style: {
                flex: 'none'
            },
            elements:[
                {
                    xtype: 'kijs.gui.Tree',
                    caption: 'Element 1',
                    rpc: this._rpc,
                    facadeFnLoad: 'navigation.load',
                    style: {
                        flex: 1
                    },
                    on: {
                        select: this._onTreeNodeSelect,
                        context: this
                    }
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
    
    
    // LISTENERS
    _onBtnThemeClick(e) {
        const spinBox = new kijs.gui.SpinBox({
            target: e.element,
            ownerNodes: e.element,
            elements: [
                {
                    xtype: 'kijs.gui.field.OptionGroup',
                    name: 'cssFile',
                    label: 'Design',
                    labelWidth: 74,
                    valueField: 'id',
                    captionField: 'Bezeichnung',
                    style: {
                        margin: '10px'
                    },
                    data: [
                        { id:'kijs.theme.default.css', Bezeichnung:'Standard' },
                        { id:'kijs.theme.old.css', Bezeichnung:'Alt' },
                        { id:'kijs.theme.joel.css', Bezeichnung:'Joel' }
                    ],
                    value: this._currentDesign ? this._currentDesign : 'kijs.theme.default.css',
                    on: {
                        input: function(e) {
                            this._currentDesign = e.value;
                            kijs.Dom.cssFileReplace(e.oldValue, e.value)
                                .then((node) => {
                                    if (this._viewport.isRendered) {
                                        this._viewport.render();
                                    }
                                })
                                .catch((error) => {
                                    throw error;
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
                    style: {
                        margin: '10px'
                    },
                    on: {
                        input: function(e) {
                            if (e.value) {
                                this._viewport.theme = 'dark';
                            } else {
                                this._viewport.theme = 'light';
                            }
                        },
                        context: this
                    }
                }
            ]
        });
        spinBox.show();
    }
    
    _onTreeNodeSelect(e) {
        const node = this._navigation.downX('kijs.gui.Tree').getSelected();
        
        const isFolder = !node.leaf;
        
        // Aktuelle Klassen entladen
        this._content.removeAll(true, true);
        if(this._currentContentCls) {
            this._currentContentCls.destruct();
            this._currentContentCls = null;
        }

        // Neue Klasse laden
        if (isFolder) {
            if (node.expanded) {
                node.collapse();
            } else {
                node.expand();
            }
            
        } else {
            const nodeId = node.nodeId;
            const caption = node.caption;
            const className = kijs.String.replaceAll(caption, ' ', '_');
            const jsFilePath = 'js/' + nodeId;
            
            // Wurde die Datei bereits geladen?
            if (window.sc[className]) {
                this._currentContentCls = new window.sc[className]({app: this});
                this._content.add(this._currentContentCls.getContent());
                if (this._currentContentCls.run) {
                    this._currentContentCls.run();
                }
                
            // Wenn nicht: laden
            } else {
                this._content.displayWaitMask = true;

                kijs.Dom.jsFileAdd(jsFilePath)
                    .then((node) => {
                        this._content.displayWaitMask = false;

                        this._currentContentCls = new window.sc[className]({app: this});
                        this._content.add(this._currentContentCls.getContent());
                        if (this._currentContentCls.run) {
                            this._currentContentCls.run();
                        }
                        
                    })
                    .catch((error) => {
                        throw error;
                    });
            }
        }
        
    }

    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct() {
        if (this._currentContentCls) {
            this._currentContentCls.destruct();
        }
        
        this._viewport.destruct();
        this._rpc.destruct();
        
        this._currentContentCls = null;
        this._header = null;
        this._navigation = null;
        this._content = null;
        this._viewport = null;
        this._rpc = null;
    }

};

