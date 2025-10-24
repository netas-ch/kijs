/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.dataView.element.Tree
// --------------------------------------------------------------
kijs.gui.dataView.element.Tree = class kijs_gui_dataView_element_Tree extends kijs.gui.dataView.element.Base {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        this._depth = 0;    // Stufe in der Hierarchie (0=oberste Stufe)

        this._parentElementEl = null; // Verweis auf den Eltern-Knoten

        this._ddName = kijs.uniqId('tree.element');
        this._ddTarget = null;

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            depth: true,
            parentElement: { target: '_parentElementEl' },
            ddName: true,
            ddTarget: { prio: 10, target: 'ddTarget' }
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
     * Sind Unterknoten erlaubt?
     * true=Ordner, false=Datei
     * @returns {Boolean}
     */
    get allowChildren() {
        if (this._parentEl.allowChildrenField) {
            return !!this._dataRow[this._parentEl.allowChildrenField];
        } else {
            return this.hasChildren;
        }
    }

    get ddTarget() {
        return this._ddTarget;
    }
    set ddTarget(val) {
        // config-object
        if (kijs.isObject(val)) {
            if (kijs.isEmpty(this._ddTarget)) {
                val.ownerEl = this;
                if (kijs.isEmpty(val.ownerDomProperty)) {
                    val.ownerDomProperty = 'innerDom';
                }
                this._ddTarget = new kijs.gui.dragDrop.Target(val);
            } else {
                this._ddTarget.applyConfig(val);
            }

        // null
        } else if (val === null) {
            if (this._ddTarget) {
                this._ddTarget.destruct();
            }
            this._ddTarget = null;

        } else {
            throw new kijs.Error(`ddTarget must be a object or null`);

        }
    }

    /**
     * Einrückungsstufe 0=Erste Ebene, 1=2. Ebene, ...
     * @returns {Number}
     */
    get depth() { return this._depth; }

    get expanded() {
        if (this._parentEl.primaryKeyFields) {
            if (kijs.Array.contains(this._parentEl.expandedKeysRows, this._primaryKey)) {
                return true;
            }
        } else {
            if (kijs.Array.contains(this._parentEl.expandedKeysRows, this._dataRow)) {
                return true;
            }
        }

        return false;
    }

    set expanded(val) {
        if (this.expanded !== !!val) {
            // expandieren
            if (val) {
                if (this._parentEl.primaryKeyFields) {
                    this._parentEl.expandedKeysRows.push(this._primaryKey);
                } else {
                    this._parentEl.expandedKeysRows.push(this._dataRow);
                }

            // zusammenklappen
            } else {
                if (this._parentEl.primaryKeyFields) {
                    kijs.Array.remove(this._parentEl.expandedKeysRows, this._primaryKey);
                } else {
                    kijs.Array.remove(this._parentEl.expandedKeysRows, this._dataRow);
                }

            }
        }
    }

    /**
     * Sind Kinder vorhanden?
     * @returns {Boolean}
     */
    get hasChildren() {
        if (!kijs.isEmpty(this._parentEl.childrenField)) {
            if (!kijs.isEmpty(this.dataRow[this._parentEl.childrenField])) {
                return true;
            }
        }
        return false;
    }

    /**
     * // Verweis auf den übergeordneten Knoten
     * @returns {kijs.gui.dataView.element.Tree}
     */
    get parentElement() { return this._parentElementEl; }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    /**
     * Klappt den Knoten zusammen
     * @returns {undefined}
     */
    collapse() {
        if (this.expanded) {
            this.expanded = false;
            this._parentEl.reload({ noRpc:true, skipExpandedFromExpandedField:true });
            this.raiseEvent('collapse');
        }
    }

    /**
     * Expandiert den Knoten
     * @returns {undefined}
     */
    expand() {
        if (!this.expanded) {
            this.expanded = true;
            this._parentEl.reload({ noRpc:true, skipExpandedFromExpandedField:true });
            this.raiseEvent('expand');
        }

    }

    update() {
        let iconArgs = null;
        let allowChildren = this.allowChildren;
        let expanded = this.expanded;
        let marginLeft = this._depth * this._parentEl.indent;

        // expand-Button Icon
        iconArgs = {
            parent: this,
            cls: 'kijs-expandIcon',
            iconMap: 'kijs.iconMap.blank',
            style: { marginLeft: marginLeft + 'px' },
            on: {
                context: this,
                mouseDown: this.#onExpandIconMouseDown
            }
        };
        if (this.hasChildren) {
            // Expandiert?
            if (expanded) {
                iconArgs.iconMap = this._parentEl.expandButtonExpandedIconMap;
            } else {
                iconArgs.iconMap = this._parentEl.expandButtonCollapsedIconMap;
            }
        }
        let expandIconEl = new kijs.gui.Icon(iconArgs);

        // Icon
        let iconMapField = null;
        let iconMap = null;
        let iconChar = null;
        let iconCls = null;
        let iconAnimationCls = null;
        let iconColor = null;

        if (allowChildren) {
            if (expanded) {
                iconMapField = this.parent.expandedIconMapField;
            } else {
                iconMapField = this.parent.collapsedIconMapField;
            }
        } else {
            iconMapField = this.parent.iconMapField;
        }

        if (!kijs.isEmpty(iconMapField)) {
            iconMap = this.dataRow[iconMapField];
        } else {
            if (allowChildren) {
                if (expanded) {
                    iconMap = this.parent.expandedIconMap;
                } else {
                    iconMap = this.parent.collapsedIconMap;
                }
            } else {
                iconMap = this.parent.iconMap;
            }
        }

        if (!kijs.isEmpty(this._parentEl.iconCharField)) {
            iconChar = this.dataRow[this._parentEl.iconCharField];
        } else {
            iconChar = this._parentEl.iconChar;
        }
        if (!kijs.isEmpty(this._parentEl.iconClsField)) {
            iconCls = this.dataRow[this._parentEl.iconClsField];
        } else {
            iconCls = this._parentEl.iconCls;
        }
        if (!kijs.isEmpty(this._parentEl.iconAnimationClsField)) {
            iconAnimationCls = this.dataRow[this._parentEl.iconAnimationClsField];
        } else {
            iconAnimationCls = this._parentEl.iconAnimationCls;
        }
        if (!kijs.isEmpty(this._parentEl.iconColorField)) {
            iconColor = this.dataRow[this._parentEl.iconColorField];
        } else {
            iconColor = this._parentEl.iconColor;
        }

        iconArgs = {parent: this};
        if (!kijs.isEmpty(iconMap)) {
            iconArgs.iconMap = iconMap;
        }
        if (!kijs.isEmpty(iconChar)) {
            iconArgs.iconChar = iconChar;
        }
        if (!kijs.isEmpty(iconCls)) {
            iconArgs.iconCls = iconCls;
        }
        if (!kijs.isEmpty(iconAnimationCls)) {
            iconArgs.iconAnimationCls = iconAnimationCls;
        }
        if (!kijs.isEmpty(iconColor)) {
            iconArgs.iconColor = iconColor;
        }

        let iconEl = new kijs.gui.Icon(iconArgs);


        // displayText
        let displayText = '';
        if (!kijs.isEmpty(this._parentEl.displayTextField) && !kijs.isEmpty(this.dataRow[this._parentEl.displayTextField])) {
            displayText = this.dataRow[this._parentEl.displayTextField];
        }
        let displayTextEl = new kijs.gui.Element({
            htmlDisplayType: this._parentEl.displayTextDisplayType,
            nodeTagName: 'span',
            html: displayText,
            cls: 'kijs-displayText'
        });


        // Tooltip
        let tooltip = '';
        if (!kijs.isEmpty(this._parentEl.tooltipField) && !kijs.isEmpty(this.dataRow[this._parentEl.tooltipField])) {
            tooltip = this.dataRow[this._parentEl.tooltipField];
        }
        this.tooltip = tooltip;

        // cls
        if (!kijs.isEmpty(this._parentEl.clsField) && !kijs.isEmpty(this.dataRow[this._parentEl.clsField])) {
            this._dom.clsAdd(this.dataRow[this._parentEl.clsField]);
        }

        // Checkbox
        let cls = '';
        if (this._parentEl.showCheckBoxes) {
            switch (this._parentEl.selectType) {
                case 'single':
                case 'singleAndEmpty':
                    cls = 'kijs-display-options';
                    break;

                case 'simple':
                case 'multi':
                    cls = 'kijs-display-checkboxes';
                    break;

            }
        }

        this._dom.clsRemove(['kijs-display-options', 'kijs-display-checkboxes']);
        if (cls) {
            this._dom.clsAdd(cls);
        }

        this.removeAll();
        this.add([expandIconEl, iconEl, displayTextEl]);
    }


    // PRIVATE
    // LISTENERS
    #onExpandIconMouseDown(e) {
        if (!this._parentEl.disabled && ! this.disabled) {
            if (this.expanded) {
                this.collapse();
            } else {
                this.expand();
            }

            // Bubbeling und native Listeners verhindern
            e.nodeEvent.stopPropagation();
            e.nodeEvent.preventDefault();
        }
    }



    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    destruct(superCall) {
        if (!superCall) {
            // unrender
            this.unrender(superCall);

            // Event auslösen.
            this.raiseEvent('destruct');
        }

        // Elemente/DOM-Objekte entladen
        if (this._ddTarget) {
            this._ddTarget.destruct();
        }

        // Variablen (Objekte/Arrays) leeren
        this._ddTarget = null;
        this._parentElementEl = null;

        // Basisklasse entladen
        super.destruct(true);
    }

};
