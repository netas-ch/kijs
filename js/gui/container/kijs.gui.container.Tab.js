/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.container.Tab
// --------------------------------------------------------------
/**
 * Tab Container. 
 * Es können nur kijs.gui.container.tab.Container hinzugefügt werden (xtype kann
 * auch weggelassen werden).
 *
 * KLASSENHIERARCHIE
 * kijs.gui.Element
 *  kijs.gui.Container
 *   kijs.gui.container.Stack
 *    kijs.gui.container.Tab
 *
 *
 */
kijs.gui.container.Tab = class kijs_gui_container_Tab extends kijs.gui.container.Stack {
    
    
    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        this._tabBarEl = new kijs.gui.container.tab.Bar({
            parent: this,
            on: {
                context: this
            }
        });
        
        this._tabBarPos = 'top';
        
        this._dom.clsRemove('kijs-container-stack');
        this._dom.clsAdd('kijs-container-tab');
        
        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            animation: 'fade',
            animationDuration: 300,
            tabBarPos: 'top',
            tabBarScrollableX: 'auto',
            tabBarScrollableY: 'auto'
        });
        
        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            tabBarPos: { target: 'tabBarPos' }, // Position der TabBar 'top', 'left', 
                                                // 'bottom' oder 'right' (default: 'top')
            tabBarScrollableX: { target: 'scrollableX', context: this._tabBarEl },
            tabBarScrollableY: { target: 'scrollableY', context: this._tabBarEl }
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
    get tabBarPos() { return this._tabBarPos; }
    set tabBarPos(val) {
        
        if (!kijs.Array.contains(['top','topCenter','right','rightCenter','bottom', 'bottomCenter','left', 'leftCenter'], val)) {
            throw new kijs.Error(`unknown tabBarPos.`);
        }
        
        let oldTabParPos = this._tabBarPos;
        this._tabBarPos = val;
        
        // bestehende CSS-Klassen entfernen
        this._dom.clsRemove(['kijs-pos-top','kijs-pos-top-center','kijs-pos-right','kijs-pos-right-center','kijs-pos-bottom','kijs-pos-bottom-center','kijs-pos-left','kijs-pos-left-center']);
        
        // neue hinzufügen
        this._dom.clsAdd('kijs-pos-' + val.replace(/([A-Z])/g, '-$1').toLowerCase());
        
        if (val !== oldTabParPos) {
            this._tabBarEl.render();
        }
    }
    
    
    
    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // overwrite
    add(elements, index=null, preventRender=false) {
        if (!kijs.isArray(elements)) {
            elements = [elements];
        }
        
        const newElements = [];
        const newTabBarButtons = [];
        kijs.Array.each(elements, function(el) {
            
            // Es dürfen nur kijs.gui.container.tab.Container hinzugefügt werden
            if ((el instanceof kijs.gui.Element)) {
                if (!(el instanceof kijs.gui.container.tab.Container)) {
                    throw new kijs.Error(`Element must be an instance of kijs.gui.container.tab.Container.`);
                }
                
            // Falls eine Config übergeben wird den xtype checken.
            // Falls kein xtype angegeben wurde, kijs.gui.container.tab.Container
            // als Standard nehmen.
            } else {
                if (el.xtype) {
                    if (el.xtype !== 'kijs.gui.container.tab.Container') {
                        throw new kijs.Error(`Element must be an instance of kijs.gui.container.tab.Container.`);
                    }
                } else {
                    el.xtype = 'kijs.gui.container.tab.Container';
                }
                
                // element erstellen
                el = this._getInstanceForAdd(el);
            }
            
            newElements.push(el);
            
            // Button für tabBar erstellen
            el.tabButtonEl.on('click', this.#onTabButtonElClick, this);
            el.tabButtonEl.icon2.on('click', this.#onTabButtonElCloseClick, this);
            newTabBarButtons.push(el.tabButtonEl);
        }, this);
        
        // Buttons zu tabBar hinzufügen
        this._tabBarEl.add(newTabBarButtons, index, true);
        
        // Elemente hinzufügen
        super.add(newElements, index, preventRender);
    }
    
    // overwrite
    changeDisabled(val, callFromParent) {
        super.changeDisabled(!!val, callFromParent);
        this._tabBarEl.changeDisabled(!!val, true);
    }

    // overwrite
    remove(elements, preventRender, preventDestruct, preventEvents, superCall) {
        if (!superCall) {
            if (!kijs.isArray(elements)) {
                elements = [elements];
            }
            
            if (!preventEvents) {
                // beforeRemove Event. Bei Rückgabe=false -> abbrechen
                if (this.raiseEvent('beforeRemove', {removeElements: elements}) === false) {
                    return;
                }
            }
        }
        
        // tabBarButton entfernen
        kijs.Array.each(elements, function(el) {
            this._tabBarEl.remove(el.tabButtonEl, preventRender, preventDestruct);
        }, this);
        
        super.remove(elements, preventRender, preventDestruct, preventEvents, true);
    }
    
    // overwrite
    render(superCall) {
        super.render(true);
        
        // TabBar rendern (kijs.gui.container.tab.Bar)
        this._tabBarEl.renderTo(this._dom.node, this._innerDom.node);
    }
    
    // overwrite
    unrender(superCall) {
        // Event auslösen.
        if (!superCall) {
            this.raiseEvent('unrender');
        }
        
        if (this._tabBarEl) {
            this._tabBarEl.unrender();
        }
        
        super.unrender(true);
    }
    
    
    // PROTECTED
    // Ermittelt das Element zu einem TabButton
    _getElFromTabButton(elButton) {
        let ret = null;
        
        kijs.Array.each(this._elements, function(el) {
            if (el.tabButtonEl === elButton) {
                ret = el;
                return false;
            }
        }, this);
        
        return ret;
    }
    
    
    // Ermittelt den Index eines TabButtons
    _getTabButtonElIndex(el) {
        let index = null;
        
        for (let i=0; i<this._tabBarEl.elements.length; i++) {
            if (this._tabBarEl.elements[i] === el) {
                index = i;
                break;
            }
        }
        
        return index;
    }
    
    // overwrite
    _setCurrent(element) {
        super._setCurrent(element);
        
        // Aktueller TabButton hervorheben
        kijs.Array.each(this._tabBarEl.elements, function(el) {
            if (element && el === element.tabButtonEl) {
                el.dom.clsAdd('kijs-current');
            } else {
                el.dom.clsRemove('kijs-current');
            }
        }, this);
        
        // In den sichtbaren bereich scrollen, wenn nötig
        if (element && element.tabButtonEl && element.tabButtonEl.isRendered) {
            element.tabButtonEl.dom.scrollIntoView();
        }
    }
    
    
    // PRIVATE
    // LISTENERS
    #onTabButtonElClick(e) {
        let el = this._getElFromTabButton(e.element);
        
        // Element wechseln
        this.setCurrentAnimated(el);
    }
    
    #onTabButtonElCloseClick(e) {
        let el = this._getElFromTabButton(e.element.parent);
        
        // Tab schliessen
        this.remove(el);
        
        // bubbeling verhindern, damit nicht das click-Event des Buttons 
        // auch noch ausgelöst wird
        e.nodeEvent.stopPropagation();
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
        if (this._tabBarEl) {
            this._tabBarEl.destruct();
        }
        
        // Variablen (Objekte/Arrays) leeren
        this._tabBarEl = null;
        this._tabBarPos = null;
        
        // Basisklasse entladen
        super.destruct(true);
    }
    
};
