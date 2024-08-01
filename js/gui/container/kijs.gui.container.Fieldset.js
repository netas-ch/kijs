/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.container.Fieldset
// --------------------------------------------------------------
kijs.gui.container.Fieldset = class kijs_gui_container_Fieldset extends kijs.gui.Container {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        this._headerDom = new kijs.gui.Dom({
            cls: 'kijs-header'
        });
        
        this._iconEl = new kijs.gui.Icon({ 
            parent: this,
            on: {
                click: this.#onIconElClick,
                context: this
            }
        });
        
        this._captionDom = new kijs.gui.Dom({
            cls: 'kijs-caption',
            on: {
                click: this.#onCaptionDomClick,
                context: this
            }
        });
        
        this._collapseButtonEl = null;
        
        // Höhe, die bei collapse hier zwischengespeichert wird, damit sie dann bei 
        // expand wieder wie zugewiesen werden kann.
        this._expandedHeight = null;
        
        this._innerDisabled = false;

        this._dom.clsRemove('kijs-container');
        this._dom.clsAdd('kijs-container-fieldset');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            // caption
            caption: { target: 'html', context: this._captionDom },
            
            iconChar: { target: 'iconChar', context: this._iconEl },
            iconCls: { target: 'iconCls', context: this._iconEl },
            iconColor: { target: 'iconColor', context: this._iconEl },
            iconMap: { target: 'iconMap', context: this._iconEl },
            
            // inner
            innerDisabled: { target: 'innerDisabled' },
            
            collapsible: { prio: 1002, target: 'collapsible' },
            collapseButton: { prio: 1003, target: 'collapseButton' },
            collapsed: { prio: 1004, target: 'collapsed' }

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
    get caption() { return this._captionDom.html; }
    set caption(val) { this._captionDom.html = val; }

    get captionDom() { return this._captionDom; }

    get collapseButton() { return this._collapseButtonEl; }
    set collapseButton(val) {
        // Button entfernen
        if (kijs.isEmpty(val)) {
            if (this._collapseButtonEl) {
                this._collapseButtonEl.destruct();
            }
            this._collapseButtonEl = null;

        // Instanz von kijs.gui.Button
        } else if (val instanceof kijs.gui.Button) {
            if (this._collapseButtonEl) {
                this._collapseButtonEl.destruct();
            }
            this._collapseButtonEl = val;
            this._collapseButtonEl.on('click', this.#onCollapseButtonClick, this);

        // Config-Objekt
        } else if (kijs.isObject(val)) {
            if (this._collapseButtonEl) {
                this._collapseButtonEl.applyConfig(val);
            } else {
                this._collapseButtonEl = new kijs.gui.Button(val);
                this._collapseButtonEl.on('click', this.#onCollapseButtonClick, this);
            }

        } else {
            throw new kijs.Error(`Unkown format on config "collapseButton"`);
        }

        if (this.isRendered) {
            this.render();
        }
    }

    get collapsed() {
        return this._dom.clsHas('kijs-collapse-top');
    }
    set collapsed(val) {
        if (val) {
            if (val === 'toggle') {
                if (this.collapsed) {
                    this.expand();
                } else {
                    this.collapse();
                }
            } else {
                this.collapse();
            }
        } else {
            this.expand();
        }
    }

    get collapsible() { return !!this._collapseButtonEl; }
    set collapsible(val) {
        if (val) {
            if (!this._collapseButtonEl) {
                this.collapseButton = {
                    iconMap: this._getCollapseIconMap()
                };
            }
        } else {
            if (this._collapseButtonEl) {
                this.collapseButton = null;
            }
        }
    }
    

    get headerDom() { return this._headerDom; }

    // overwrite
    get height() { return super.height; }
    set height(val) {
        let doFn = false;

        if (this.collapsible && kijs.isNumber(this._collapseHeight)) {
            if (val <= this._collapseHeight) {
                doFn = 'collapse';
            } else if (this.collapsed) {
                doFn = 'expand';
            }
        }
        
        // Höhe merken, damit beim aufklappen, wieder die gleiche Höhe wiederhergestellt werden kann
        if (kijs.isNumber(this._collapseHeight) && val > kijs.isNumber(this._collapseHeight)) {
            this._expandedHeight = val;
        }
        
        if (doFn === 'collapse') {
            if (!this.collapsed) {
                this.collapse();
            }
        } else if (doFn === 'expand') {
            this.expand(val);
        } else {
            super.height = val;
        }
    }

    get innerDisabled() { return this._innerDisabled; }
    set innerDisabled(val) {
        this._innerDisabled = !!val;
        kijs.Array.each(this._elements, function(el) {
            el.changeDisabled(!!val, true);
        }, this);
    }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // overwrite
    changeDisabled(val, callFromParent) {
        super.changeDisabled(!!val, callFromParent);
        this._iconEl.changeDisabled(!!val, true);
        this._captionDom.changeDisabled(!!val, true);
        if (this._collapseButtonEl) {
            this._collapseButtonEl.changeDisabled(!!val, true);
        }
    }
    
    /**
     * Minimiert den Container
     * @returns {undefined}
     */
    collapse() {
        // afterResize-Event deaktivieren
        const prevAfterRes = this._preventAfterResize;
        this._preventAfterResize = true;

        this._dom.clsAdd('kijs-collapse-top');
        this._dom.height = null;
        
        // das richtige Icon in den Button
        if (this._collapseButtonEl) {
            this._collapseButtonEl.iconMap = this._getCollapseIconMap();
        }
        
        // Event werfen
        this.raiseEvent('collapse');

        // afterResize-Event wieder aktivieren
        this._preventAfterResize = prevAfterRes;
        
        // Evtl. afterResize-Event zeitversetzt auslösen
        this._raiseAfterResizeEvent(true);
    }

    /**
     * Expandiert den Container
     * @param {Number} size [optional] Höhe in die der Container wiederhergestellt werden soll
     * @returns {undefined}
     */
    expand(size) {
        // afterResize-Event deaktivieren
        const prevAfterRes = this._preventAfterResize;
        this._preventAfterResize = true;

        this._dom.clsRemove('kijs-collapse-top');

        // das richtige Icon in den Button
        if (this._collapseButtonEl) {
            this._collapseButtonEl.iconMap = this._getCollapseIconMap();
        }
        
        // falls kein size übergeben wurde, die letzte höhe nehmen
        if (kijs.isEmpty(size)) {
            if (!kijs.isEmpty(this._expandedHeight)) {
                size = this._expandedHeight;
            }
        }
        
        // Übergebene Grösse wiederherstellen
        if (!kijs.isEmpty(size)) {
            if (size > this._collapseHeight) {
                this.height = size;
            }
        }

        // Event werfen
        this.raiseEvent('expand');

        // afterResize-Event wieder aktivieren
        this._preventAfterResize = prevAfterRes;

        // Evtl. afterResize-Event zeitversetzt auslösen
        this._raiseAfterResizeEvent(true);
    }

    // overwrite
    focus(alsoSetIfNoTabIndex) {
        if (alsoSetIfNoTabIndex) {
            return super.focus(alsoSetIfNoTabIndex);

        } else {
            // Zuerst versuchen den Fokus auf ein Element im innerDom zu setzen
            let nde = this._innerDom.focus(false);
            // falls nicht erfolgreich. Den Fokus direkt auf das Fenster setzen
            if (!nde) {
                nde = super.focus(alsoSetIfNoTabIndex);
            }
            return nde;
        }

        // Darf der Node den Fokus erhalten?
        if (alsoSetIfNoTabIndex) {
            this._dom.node.focus();

        // sonst den Fokus auf den ersten möglichen untegeordneten Node settzen
        } else {
            const nde = kijs.Dom.getFirstFocusableNode(this._node);
            if (nde) {
                nde.focus();
                return nde;
            }
        }
        
        return false;
    }

    // Overwrite
    render(superCall) {
        // dom mit elements rendern (innerDom)
        super.render(true);

        // Header rendern (kijs.gui.Dom)
        this._headerDom.renderTo(this._dom.node, this._innerDom.node);

        // Icon rendern (kijs.gui.Icon)
        if (this._iconEl) {
            if (!this._iconEl.isEmpty) {
                this._iconEl.renderTo(this._headerDom.node);
            } else if (this._iconEl.isRendered) {
                this._iconEl.unrender();
            }
        }

        // Caption rendern (kijs.gui.Dom)
        if (this._captionDom) {
            if (!this._captionDom.isEmpty) {
                this._captionDom.renderTo(this._headerDom.node);
            } else if (this._captionDom.isRendered) {
                this._captionDom.unrender();
            }
        }
        
        // CollapseButton rendern (kijs.gui.Button)
        if (this._collapseButtonEl) {
            if (!this._collapseButtonEl.isEmpty) {
                this._collapseButtonEl.renderTo(this._headerDom.node);
            } else if (this._collapseButtonEl.isRendered) {
                this._collapseButtonEl.unrender();
            }
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
        
        if (this._iconEl) {
            this._iconEl.unrender();
        }
        if (this._captionDom) {
            this._captionDom.unrender();
        }
        if (this._collapseButtonEl) {
            this._collapseButtonEl.unrender();
        }
        if (this._headerDom) {
            this._headerDom.unrender();
        }
        super.unrender(true);
    }


    // PROTECTED
    /**
     * Gibt das Icon für den Collapse-Knopf zurück
     * @returns {undefined}
     */
    _getCollapseIconMap() {
        if (this.collapsed) {
            return 'kijs.iconMap.Fa.chevron-down';
        } else {
            return 'kijs.iconMap.Fa.chevron-up';
        }
    }
    
    // PRIVATE
    // LISTENERS
    #onCollapseButtonClick(e) {
        if (this.collapsed && !this._dom.disabled) {
            this.expand();
        } else {
            this.collapse();
        }
    }

    #onCaptionDomClick(e) {
        if (this.collapsible && !this._dom.disabled) {
            if (this.collapsed) {
                this.expand();
            } else {
                this.collapse();
            }
        }
    }
    
    #onIconElClick(e) {
        if (this.collapsible && !this._dom.disabled) {
            if (this.collapsed) {
                this.expand();
            } else {
                this.collapse();
            }
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
        if (this._captionDom) {
            this._captionDom.destruct();
        }

        // Variablen (Objekte/Arrays) leeren
        this._captionDom = null;
        this._collapseButtonEl = null;

        // Basisklasse entladen
        super.destruct(true);
    }

};
