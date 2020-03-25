/* global kijs, this */

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
    constructor(config={}) {
        super(false);
        this._rpc = null;
        this._facadeFnLoad = null;
        this._facadeFnSave = null;
        this._loaded = false;
        this._nodeId = null;
        this._leaf = true;

        this._nodeDom = new kijs.gui.Dom({cls: 'kijs-node'});
        this._elementsDom = new kijs.gui.Dom({cls: 'kijs-expandcontainer'});
        this._treeCaptionDom = new kijs.gui.Dom({cls: 'kijs-treecaption'});
        this._expandIconDom = new kijs.gui.Dom({cls: 'kijs-expandicon'});

        this._iconEl = new kijs.gui.Icon();
        this._expandedIconEl = new kijs.gui.Icon();

        this._dom.clsAdd('kijs-tree');

        // Events
        this._expandIconDom.on('click', this._onExpandClick, this);

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
         //   waitMaskTarget           : this,
          //  waitMaskTargetDomProperty: 'dom',
            expandIconChar           : '&#xf105;'
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            autoLoad                  : true,
            rpc                       : true,
            facadeFnLoad              : true,
            facadeFnSave              : true,
            nodeId                    : true,
            leaf                      : true,
            caption                   : { target: 'html', context: this._treeCaptionDom },
            expandIconChar            : { target: 'html', context: this._expandIconDom },
            iconChar                  : { target: 'iconChar', context: this._iconEl },
            iconCls                   : { target: 'iconCls', context: this._iconEl },
            iconColor                 : { target: 'iconColor', context: this._iconEl }
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

    get expanded() { return !!this._innerDom.clsHas('kijs-expanded'); }
    set expanded(val) {
        if (val) {
            this._innerDom.clsAdd('kijs-expanded');
        } else {
            this._innerDom.clsRemove('kijs-expanded');
        }
    }

    get facadeFnLoad() {
        if (this._facadeFnLoad) {
            return this._facadeFnLoad;
        }
        if (this.parent && this.parent instanceof kijs.gui.Tree) {
            return this.parent.facadeFnLoad;
        }
    }

    get isLeaf() { return this.elements.length === 0 && this._leaf; }
    get isRemote() { return !!(this._facadeFnLoad || (this.parent && (this.parent instanceof kijs.gui.Tree) && this.parent.isRemote)); }

    get nodeId() { return this._nodeId; }
    set nodeId(val) { this._nodeId = val; }
    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------

    /**
     * Fügt ein oder mehrere Elemente hinzu.
     * @param {Object|Array} elements
     * @param {Number} [index=null] Position an der Eingefügt werden soll null=am Schluss
     * @returns {undefined}
     */
    add(elements, index=null) {
        elements = this._recursiveSetXType(elements);
        super.add(elements, index);
    }

    load(args=null, force=false) {
        return new Promise((resolve, reject) => {
            if (!this.isRemote) {
                reject('tree not remotable');

            } else  if (!this._loaded || force) {
                this._loaded = true;

                if (!kijs.isObject(args)) {
                    args = {};
                }
                args = Object.assign(args, this._rpcArgs);

                this._rpc.do(this.facadeFnLoad, args, function (response) {
                    if (response.tree) {
                        this.add(response.tree);
                    }
                    resolve(response);
                }, this);
            } else {
                resolve(null);
            }
        });
    }


    /**
     * Klick auf den 'expand' button
     * @private
     */
    _onExpandClick() {
        if (this.isRemote) {
            this.load().then(() => {
                this.expanded = !this.expanded;
            });
        } else {
            this.expanded = !this.expanded;
        }
    }

    /**
     *
     * @param elements
     * @returns {mixed}
     * @private
     */
    _recursiveSetXType(elements) {
        if (kijs.isObject(elements)) {
            elements = [elements];
        }
        if (kijs.isArray(elements)) {
            for (let i = 0; i < elements.length; i++) {
                let element = elements[i];
                if (kijs.isObject(element)) {
                    if (element.elements) {
                        element.elements = this._recursiveSetXType(element.elements);
                    }
                    if (!element.xtype) {
                        element.xtype = 'kijs.gui.Tree';
                    }
                }
            }
        }
        return elements;
    }

    // Overwrite
    render(superCall) {
        // render vom Container überspringen,
        // damit elemente nicht in den innerDom gerendert werden
        kijs.gui.Element.prototype.render.call(this, true);

        // innerDOM rendern
        this._innerDom.renderTo(this._dom.node);

        // node in den innerDom
        this._nodeDom.renderTo(this._innerDom.node);

        // elementDom in den innerDom
        this._elementsDom.renderTo(this._innerDom.node);

        // elements im elementDom rendern
        kijs.Array.each(this._elements, function(el) {
            el.renderTo(this._elementsDom.node);
        }, this);

        this._expandIconDom.renderTo(this._nodeDom.node);
        this._iconEl.renderTo(this._nodeDom.node);
        this._treeCaptionDom.renderTo(this._nodeDom.node);

        // leerer ordner
        if (this.isLeaf) {
            this._expandIconDom.clsAdd('kijs-leaf');
        } else {
            this._expandIconDom.clsRemove('kijs-leaf');
        }

        // Event afterRender auslösen
        if (!superCall) {
            this.raiseEvent('afterRender');
        }
    }

    // overwrite
    unrender(superCall) {
        // Event auslösen.
        if (!superCall) {
            this.raiseEvent('unrender');
        }

        super.unrender(true);
    }


    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(superCall) {
        if (!superCall) {
            // unrendern
            this.unrender(superCall);

            // Event auslösen.
            this.raiseEvent('destruct');
        }

        // Basisklasse entladen
        super.destruct(true);
    }
};
