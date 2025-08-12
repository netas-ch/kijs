/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.dataView.element.ListView
// --------------------------------------------------------------
kijs.gui.dataView.element.Tree = class kijs_gui_dataView_element_Tree extends kijs.gui.dataView.element.Base {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        this._depth = 0;    // Stufe in der Hierarchie (0=oberste Stufe)

        this._parentNodeEl = null; // Verweis auf den Eltern-Knoten


        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            depth: true,
            parentNode: { target: '_parentNodeEl' }
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
    get allowChilds() {
        if (this._parentEl.allowChildsField) {
            return !!this._dataRow[this._parentEl.allowChildsField];
        } else {
            return this.hasChilds;
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
    get hasChilds() {
        if (!kijs.isEmpty(this._parentEl.childsField)) {
            if (!kijs.isEmpty(this.dataRow[this._parentEl.childsField])) {
                return true;
            }
        }
        return false;
    }

    /**
     * // Verweis auf den übergeordneten Knoten
     * @returns {kijs.gui.dataView.element.Tree}
     */
    get parentNodeEl() { return this._parentNodeEl; }



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
            this._parentEl.reload(true);
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
            this._parentEl.reload(true);
            this.raiseEvent('expand');
        }

    }

    update() {
        let iconArgs = null;
        let allowChilds = this.allowChilds;
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
        if (this.hasChilds) {
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

        if (allowChilds) {
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
            if (allowChilds) {
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


        // Caption
        let caption = '';
        if (!kijs.isEmpty(this._parentEl.captionField) && !kijs.isEmpty(this.dataRow[this._parentEl.captionField])) {
            caption = this.dataRow[this._parentEl.captionField];
        }
        let captionEl = new kijs.gui.Element({
            htmlDisplayType: this._parentEl.captionHtmlDisplayType,
            nodeTagName: 'span',
            html: caption,
            cls: 'kijs-caption'
        });


        // Tooltip
        let tooltip = '';
        if (!kijs.isEmpty(this._parentEl.tooltipField) && !kijs.isEmpty(this.dataRow[this._parentEl.tooltipField])) {
            tooltip = this.dataRow[this._parentEl.tooltipField];
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

        this.tooltip = tooltip;

        // Navigation mit Pfeiltasten
        this.on('keyDown', this.#onKeyDown, this);

        this.removeAll();
        this.add([expandIconEl, iconEl, captionEl]);
    }


    // PRIVATE
    // LISTENERS
    #onExpandIconMouseDown(e) {
        if (this.expanded) {
            this.collapse();
        } else {
            this.expand();
        }
        
        // Bubbeling und native Listeners verhindern
        e.nodeEvent.stopPropagation();
        e.nodeEvent.preventDefault();
    }

    #onKeyDown(e) {
        let isShiftPress = !!e.nodeEvent.shiftKey;
        let isCtrlPress = !!e.nodeEvent.ctrlKey;

        if (kijs.Navigator.isMac) {
            isCtrlPress = !!e.nodeEvent.metaKey;
        }

        let expanded = this.expanded;

        if (!this.disabled) {
            switch (e.nodeEvent.code) {
                // falls expandiert: zusammenklappen
                // sonst den Fokus auf Eltern-Knoten setzen
                case 'ArrowLeft':
                    if (expanded) {
                        this.collapse();

                    } else if (this._parentNodeEl) {
                        this._parentEl.current = this._parentNodeEl;
                        if (this._parentEl.focusable) {
                            this._parentNodeEl.focus();
                        }

                        if (isShiftPress || (!isCtrlPress && kijs.Array.contains(['single', 'singleAndEmpty', 'multi'], this._parentEl.selectType))) {
                            this._parentEl.selectEl(this._parentNodeEl, isShiftPress, isCtrlPress);
                        }

                    }

                    // Bubbeling und native Listeners verhindern
                    e.nodeEvent.stopPropagation();
                    e.nodeEvent.preventDefault();
                    break;

                // expandieren
                case 'ArrowRight':
                    if (!expanded) {
                        this.expand();
                    }

                    // Bubbeling und native Listeners verhindern
                    e.nodeEvent.stopPropagation();
                    e.nodeEvent.preventDefault();
                    break;

            }
        }
    }

};
