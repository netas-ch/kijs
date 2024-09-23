/* global kijs, this */

// TODO: Grundsätzlich überarbeiten
// TODO: load() ist nicht kompatibel mit Basisklasse
// --------------------------------------------------------------
// kijs.gui.Tree
// --------------------------------------------------------------
/**
 * EVENTS
 * ----------
 * afterLoad
 * beforeSelectionChange
 * selectionChange
 * rowClick
 * rowDblClick
 *
 */
kijs.gui.Tree = class kijs_gui_Tree extends kijs.gui.Container {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);
        this._rpc = null;   // Instanz von kijs.gui.Rpc
        this._rpcLoadFn = null;
        this._rpcLoadArgs = null;
        this._rpcSaveFn = null;
        this._rpcSaveArgs = null;
        this._autoLoad = true;
        this._loaded = false;
        this._nodeId = null;
        this._leaf = true;
        this._rootVisible = false;

        this._nodeDom = new kijs.gui.Dom({cls: 'kijs-node'});
        this._elementsDom = new kijs.gui.Dom({cls: 'kijs-expandcontainer'});
        this._treeCaptionDom = new kijs.gui.Dom({cls: 'kijs-treecaption', htmlDisplayType: 'code'});

        this._iconEl = new kijs.gui.Icon({cls: 'fa-regular'});
        this._expandIconEl = new kijs.gui.Icon({cls: 'kijs-expandicon', iconMap: 'kijs.iconMap.Fa.angle-right'});
        this._expandedIconEl = new kijs.gui.Icon({cls: 'kijs-expandedicon fa-regular'});
        this._spinnerIconEl = new kijs.gui.Icon({cls: 'kijs-spinnericon kijs-pulse fa-solid', iconMap: 'kijs.iconMap.Fa.spinner'});

        this._dom.clsRemove('kijs-container');
        this._dom.clsAdd('kijs-tree');

        // Events
        this._expandIconEl.on('click', this.#onExpandClick, this);

        this._iconEl.on('dblClick', this.#onNodeDblClick, this);
        this._expandedIconEl.on('dblClick', this.#onNodeDblClick, this);
        this._treeCaptionDom.on('dblClick', this.#onNodeDblClick, this);

        this._iconEl.on('singleClick', this.#onNodeSingleClick, this);
        this._expandedIconEl.on('singleClick', this.#onNodeSingleClick, this);
        this._treeCaptionDom.on('singleClick', this.#onNodeSingleClick, this);

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            scrollableY: 'auto',
          //  waitMaskTarget           : this,
          //  waitMaskTargetDomProperty: 'dom',
            folderIcon               : 'auto'
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            autoLoad                  : true,
            rootVisible               : true,

            rpc                       : { target: 'rpc' },  // Instanz von kijs.gui.Rpc oder Name einer RPC
            rpcLoadFn                 : true,
            rpcLoadArgs               : true,
            rpcSaveFn                 : true,
            rpcSaveArgs               : true,
            nodeId                    : true,

            // leaf = true = keine Kindknoten
            leaf                      : true,

            // Bezeichnung des node
            caption                   : { target: 'html', context: this._treeCaptionDom },

            // Pfeil-Icon im Baum
            expandIconMap             : { target: 'iconMap', context: this._expandIconEl },
            expandIconChar            : { target: 'iconChar', context: this._expandIconEl },
            expandIconCls             : { target: 'iconCls', context: this._expandIconEl },
            expandIconColor           : { target: 'iconColor', context: this._expandIconEl },

            // icon bei geschlossenem Baum
            iconMap                   : { target: 'iconMap', context: this._iconEl },
            iconChar                  : { target: 'iconChar', context: this._iconEl },
            iconCls                   : { target: 'iconCls', context: this._iconEl },
            iconColor                 : { target: 'iconColor', context: this._iconEl },

            // icon bei offenem Baum
            expandedIconMap           : { target: 'iconMap', context: this._expandedIconEl },
            expandedIconChar          : { target: 'iconChar', context: this._expandedIconEl },
            expandedIconCls           : { target: 'iconCls', context: this._expandedIconEl },
            expandedIconColor         : { target: 'iconColor', context: this._expandedIconEl },

            // setzt das 'iconChar' und das 'expandedIconChar' auf ein Ordner-Symbol.
            folderIcon                : { target: 'folderIcon', prio: 10 },

            iconSize                  : { target: 'iconSize' }
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }

        if (this.isRoot) {
            this._dom.clsAdd('kijs-tree-root');
        }
    }



    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get caption() { return this._treeCaptionDom.html; }

    get expanded() { return !!this._innerDom.clsHas('kijs-expanded'); }
    set expanded(val) {
        if (val) {
            this._innerDom.clsAdd('kijs-expanded');
        } else {
            this._innerDom.clsRemove('kijs-expanded');
        }
    }

    set folderIcon(val) {
        if (val === 'auto') {
            val = (!this._iconEl.iconChar && !this._iconEl.iconCls);
        }

        if (val) {
            this._iconEl.iconMap = 'kijs.iconMap.Fa.folder';
            this._expandedIconEl.iconMap = 'kijs.iconMap.Fa.folder-open';
        }
    }
    get folderIcon() {
        return (this._iconEl.iconChar === kijs.iconMap.Fa.folder.char && this._expandedIconEl.iconChar === kijs.iconMap.Fa['folder-open'].char);
    }

    get leaf() { return this.elements.length === 0 && this._leaf; }
    set leaf(val) { this._leaf = !!val; }

    get loadSpinner() { return !!this._innerDom.clsHas('kijs-loading'); }
    set loadSpinner(val) {
        if (val) {
            this._innerDom.clsAdd('kijs-loading');
        } else {
            this._innerDom.clsRemove('kijs-loading');
        }
    }

    get iconChar() { return this._iconEl.iconChar; }
    set iconChar(val) { this._iconEl.iconChar = val; }

    get iconCls() { return this._iconEl.iconCls; }
    set iconCls(val) { this._iconEl.iconCls = val; }

    get iconColor() { return this._iconEl.iconColor; }
    set iconColor(val) { this._iconEl.iconColor = val; }

    get iconMap() { return this._iconEl.iconMap; }
    set iconMap(val) { this._iconEl.iconMap = val; }

    get expandedIconChar() { return this._expandedIconEl.iconChar; }
    set expandedIconChar(val) { this._expandedIconEl.iconChar = val; }

    get expandedIconCls() { return this._expandedIconEl.iconCls; }
    set expandedIconCls(val) { this._expandedIconEl.iconCls = val; }

    get expandedIconColor() { return this._expandedIconEl.iconColor; }
    set expandedIconColor(val) { this._expandedIconEl.iconColor = val; }

    get expandedIconMap() { return this._expandedIconEl.iconMap; }
    set expandedIconMap(val) { this._expandedIconEl.iconMap = val; }

    get iconSize() { return this._iconEl.iconSize; }
    set iconSize(val) {
        this._iconEl.iconSize = val;
        this._expandedIconEl.iconSize = val;
        this._spinnerIconEl.iconSize = val;
    }

    get isRemote() { return !!(this._rpcLoadFn || (this.parent &&
                (this.parent instanceof kijs.gui.Tree) && this.parent.isRemote)); }

    get isRoot() { return !this.parent || !(this.parent instanceof kijs.gui.Tree); }

    get nodeId() { return this._nodeId; }
    set nodeId(val) { this._nodeId = val; }


    get rpc() {
        if (this._rpc) {
            return this._rpc;
        } else if (this.parent && (this.parent instanceof kijs.gui.Tree)) {
            return this.parent.rpc;
        } else {
            return kijs.getRpc('default');
        }
    }
    set rpc(val) {
        if (kijs.isString(val)) {
            val = kijs.getRpc(val);
        }

        if (val instanceof kijs.gui.Rpc) {
            this._rpc = val;
        } else {
            throw new kijs.Error(`Unknown format on config "rpc"`);
        }
    }

    get rpcLoadArgs() {
        if (this._rpcLoadArgs) {
            return this._rpcLoadArgs;
        }
        if (this.parent && (this.parent instanceof kijs.gui.Tree)) {
            return this.parent.rpcLoadArgs;
        }
        return null;
    }
    set rpcLoadArgs(val) { this._rpcLoadArgs = val; }

    get rpcLoadFn() {
        if (this._rpcLoadFn) {
            return this._rpcLoadFn;
        }
        if (this.parent && (this.parent instanceof kijs.gui.Tree)) {
            return this.parent.rpcLoadFn;
        }
        return null;
    }

    get rpcSaveArgs() {
        if (this._rpcSaveArgs) {
            return this._rpcSaveArgs;
        }
        if (this.parent && (this.parent instanceof kijs.gui.Tree)) {
            return this.parent.rpcLoadArgs;
        }
        return null;
    }
    set rpcSaveArgs(val) { this._rpcSaveArgs = val; }

    get rpcSaveFn() {
        if (this._rpcSaveFn) {
            return this._rpcSaveFn;
        }
        if (this.parent && (this.parent instanceof kijs.gui.Tree)) {
            return this.parent.rpcSaveFn;
        }
        return null;
    }


    get selected() { return !!this._innerDom.clsHas('kijs-selected'); }
    set selected(val) {
        if (val) {
            this._innerDom.clsAdd('kijs-selected');
        } else {
            this._innerDom.clsRemove('kijs-selected');
        }
    }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // overwrite
    add(elements, index=null, options={}) {
        elements = this._recursiveSetProperties(elements);
        super.add(elements, index, options);
    }

    /**
     * Klappt die Node zu.
     * @returns {undefined}
     */
    collapse() {
        if (this.expanded) {
            this.expanded = false;
            this._raiseRootEvent('collapse');
        }
    }

    /**
     * Klappt die Node auf.
     * @returns {undefined}
     */
    expand() {
        if (!this.leaf) {
            if (this.isRemote && !this.expanded) {
                this.load().then(() => {
                    this.expanded = true;
                    this._raiseRootEvent('expand');
                });
            } else if (!this.expanded) {
                this.expanded = true;
                this._raiseRootEvent('expand');
            }
        }
    }

    /**
     * Gibt den Pfad im Baum zur aktuellen Node zurück.
     * @param {String} separator
     * @returns {String}
     */
    getPath(separator='/') {
        let path = '';
        if (this.isRoot) {
            path += separator;
        } else {
            path += this.parent.getPath(separator) + separator;
        }

        if (this._nodeId !== null) {
            path += kijs.toString(this._nodeId);

        } else if (this.isRoot) {
            path += 'root';

        } else {
            path += '<no-id>';
        }

        return path;
    }

    /**
     * Gibt die Root-Node des aktuellen Baums zurück.
     * @returns {kijs_gui_Tree}
     */
    getRootNode() {
        if (this.parent && (this.parent instanceof kijs.gui.Tree)) {
            return this.parent.getRootNode();
        }

        return this;
    }

    /**
     * Gibt den aktuell Selektierten Node zurück (Sollte vom Root-Node aus aufgerufen werden!)
     * @returns {kijs_gui_Tree|null}
     */
    getSelected() {
        if (this.selected) {
            return this;

        } else {
            let selectedNode = null;

            kijs.Array.each(this.elements, function(el) {
                if (el.selected) {
                    selectedNode = el;
                    return false;
                } else {
                    selectedNode = el.getSelected();
                    if (selectedNode) {
                        return false;
                    }
                }
            }, this);

            return selectedNode;
        }
    }


    /**
     * Lädt die Daten vom RPC
     * @param {Object|null} args
     * @param {bool} force
     * @returns {Promise}
     */
    load(args=null, force=false) {
        return new Promise((resolve, reject) => {
            if (!this.isRemote) {
                reject(new kijs.Error('tree not remotable'));

            } else  if ((!this._loaded && this.elements.length === 0) || force) {
                this._loaded = true;

                if (!kijs.isObject(args)) {
                    args = {};
                }

                let defaultRpcArgs = this.rpcLoadArgs;
                if (kijs.isObject(defaultRpcArgs)) {
                    args = Object.assign(args, defaultRpcArgs);
                }

                args.nodeId = this._nodeId;

                // spinner icon aktivieren
                this.loadSpinner = true;

                this.rpc.do({
                    remoteFn: this.rpcLoadFn,
                    owner: this,
                    data: args,
                    waitMaskTarget: (!this._rootVisible && this.isRoot) ? this : 'none'

                }).then((e) => {
                    this.loadSpinner = false;

                    // alle unterelemente entfernen und destructen
                    this.removeAll();

                    if (e.responseData.tree) {
                        this.add(e.responseData.tree);
                    }
                    resolve(e.responseData);

                }).catch((ex) => {
                    this.loadSpinner = false;
                    this.removeAll();
                    reject(ex);
                });

            } else {
                resolve(null);
            }
        });
    }

    // overwrite
    remove(elements, options={}, superCall) {
        super.remove(elements, options, superCall);

        if (this._elements.length === 0) {
            this.collapse();
        }
    }

    // Overwrite
    render(superCall) {
        super.render(true);

        // leerer ordner
        if (this.leaf) {
            this._expandIconEl.dom.clsAdd('kijs-leaf');
        } else {
            this._expandIconEl.dom.clsRemove('kijs-leaf');
        }

        // Event afterRender auslösen
        if (!superCall) {
            this.raiseEvent('afterRender');
        }

        if (this._autoLoad && this.isRemote && this.isRoot) {
            this.load();
        }
    }

    // Setzt den 'selected' Status rekursiv
    setSelected(selected, recursive=false) {
        this.selected = !!selected;
        if (recursive) {
            kijs.Array.each(this.elements, function(element) {
                if (element instanceof kijs.gui.Tree) {
                    element.setSelected(!!selected, true);
                }
            }, this);
        }

    }

    // overwrite
    unrender(superCall) {
        // Event auslösen.
        if (!superCall) {
            this.raiseEvent('unrender');
        }

        this._nodeDom.unrender();
        this._elementsDom.unrender();
        this._expandIconEl.unrender();
        this._iconEl.unrender();
        this._expandedIconEl.unrender();
        this._spinnerIconEl.unrender();
        this._treeCaptionDom.unrender();

        super.unrender(true);
    }


    // PROTECTED
    /**
     * Führt einen Event nicht nur beim aktuellen, sondern auch beim root-Element aus.
     * @param {Mixed} args
     * @returns {unresolved}
     */
    _raiseRootEvent(...args) {
        let ret = this.raiseEvent.apply(this, args);

        if (!this.isRoot) {
            this.getRootNode().raiseEvent.apply(this.getRootNode(), args);
        }
        return ret;
    }

    /**
     * Setzt den xtype von Unterelementen
     * @param elements
     * @returns {mixed}
     * @private
     */
    _recursiveSetProperties(elements) {
        if (kijs.isObject(elements)) {
            elements = [elements];
        }
        if (kijs.isArray(elements)) {
            for (let i = 0; i < elements.length; i++) {
                let element = elements[i];
                if (kijs.isStandardObject(element)) {
                    if (element.elements) {
                        element.elements = this._recursiveSetProperties(element.elements);
                    }

                    element.xtype = element.xtype ? element.xtype : 'kijs.gui.Tree';
                    element.scrollableY = false;

                    //element.iconChar = element.iconChar ? element.iconChar : this.getRootNode().iconChar;
                    //element.iconCls = element.iconCls ? element.iconCls : this.getRootNode().iconCls;
                    //element.iconColor = element.iconColor ? element.iconColor : this.getRootNode().iconColor;
                    element.iconMap = element.iconMap ? element.iconMap : this.getRootNode().iconMap;

                    //element.expandedIconChar = element.expandedIconChar ? element.expandedIconChar : this.getRootNode().expandedIconChar;
                    //element.expandedIconCls = element.expandedIconCls ? element.expandedIconCls : this.getRootNode().expandedIconCls;
                    //element.expandedIconColor = element.expandedIconColor ? element.expandedIconColor : this.getRootNode().expandedIconColor;
                    element.expandedIconMap = element.expandedIconMap ? element.expandedIconMap : this.getRootNode().expandedIconMap;

                    if (!element.iconSize && this.getRootNode().iconSize) {
                        element.iconSize = this.getRootNode().iconSize;
                    }
                }
            }
        }
        return elements;
    }

    // overwrite
    _renderElements() {
        // Beim Root-Element werden die Nodes
        // direkt in den innerDom gerendert.
        // Es gibt kein Icon, etc.
        if (!this._rootVisible && this.isRoot) {
            // elements im innerDom rendern
            kijs.Array.each(this._elements, function(el) {
                el.renderTo(this._innerDom.node);
            }, this);

        } else {
            // node in den innerDom
            this._nodeDom.renderTo(this._innerDom.node);

            // elementDom in den innerDom
            this._elementsDom.renderTo(this._innerDom.node);

            // elements im elementDom rendern
            kijs.Array.each(this._elements, function(el) {
                el.renderTo(this._elementsDom.node);
            }, this);

            this._expandIconEl.renderTo(this._nodeDom.node);
            this._iconEl.renderTo(this._nodeDom.node);
            this._expandedIconEl.renderTo(this._nodeDom.node);
            this._spinnerIconEl.renderTo(this._nodeDom.node);
            this._treeCaptionDom.renderTo(this._nodeDom.node);
        }
    }


    // PRIVATE
    // LISTENERS
    /**
     * Klick auf den 'expand' button
     * Öffnet die Node, selektion wird nicht verändert
     * @private
     */
    #onExpandClick() {
        if (this.loadSpinner || this.disabled) {
            return;
        }

        if (this.expanded) {
            this.collapse();
        } else {
            this.expand();
        }

        // Event beim Root auslösen
        this._raiseRootEvent('nodeClick');
    }

    /**
     * Öffnet die Node
     * @returns {undefined}
     */
    #onNodeDblClick() {
        if (this.loadSpinner || this.disabled) {
            return;
        }
        if (this.expanded) {
            this.collapse();
        } else {
            this.expand();
        }

        // Event beim Root auslösen
        this._raiseRootEvent('nodeDblClick');
    }

    // Selektiert die Node
    #onNodeSingleClick() {
        if (this.loadSpinner || this.disabled) {
            return;
        }
        // alles deselektieren, nur aktuelle selektiert
        this.getRootNode().setSelected(false, true);
        this.selected = true;
        this._raiseRootEvent('select');
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

        this._nodeDom.destruct();
        this._elementsDom.destruct();
        this._expandIconEl.destruct();
        this._iconEl.destruct();
        this._expandedIconEl.destruct();
        this._spinnerIconEl.destruct();
        this._treeCaptionDom.destruct();

        // Variablen (Objekte/Arrays) leeren
        this._rpc = null;
        this._rpcLoadArgs = null;
        this._rpcSaveArgs = null;

        // Basisklasse entladen
        super.destruct(true);
    }

};
