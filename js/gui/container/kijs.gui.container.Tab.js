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
                sourceDrop: this.#onTabBarSourceDrop,
                targetDrop: this.#onTabBarTargetDrop,
                context: this
            }
        });
        
        this._tabBarPos = 'top';
        this._tabBarAlign = 'start';
        
        this._rpcSaveFn = null;     // Name der remoteFn. Bsp: 'myTabs.save'
        this._rpcSaveArgs = {};     // Standard RPC-Argumente fürs Speichern
        this._autoSave = false;     // Automatisches Speichern bei Änderungen
        
        this._dom.clsRemove('kijs-container-stack');
        this._dom.clsAdd('kijs-container-tab');
        
        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            animation: 'fade',
            animationDuration: 300,
            tabBarPos: 'top',
            tabBarAlign: 'start',
            tabBarScrollableX: 'auto',
            tabBarScrollableY: 'auto'
        });
        
        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            tabBarPos: { target: 'tabBarPos' }, // Position der TabBar 'top', 'left', 
                                                // 'bottom' oder 'right' (default: 'top')
            tabBarAlign: { target: 'tabBarAlign'},// Ausrichtung der Tabs 'start', 
                                                  // center oder 'end' (default: 'start')
            tabBarScrollableX: { target: 'scrollableX', context: this._tabBarEl },
            tabBarScrollableY: { target: 'scrollableY', context: this._tabBarEl },
            
            ddName: { target: 'ddName', context: this._tabBarEl },
            ddPosBeforeAfterFactor: { target: 'ddPosBeforeAfterFactor', context: this._tabBarEl },
            ddMapping: { target: 'ddMapping', context: this._tabBarEl },
            
            rpcSaveFn: true,    // Name der remoteFn. Bsp: 'myTabs.save'
            rpcSaveArgs: true,  // Standard RPC-Argumente fürs Speichern
            autoSave: true,     // Automatisches Speichern bei Änderungen
            
            sortable: { prio: 90, target: 'sortable', context: this._tabBarEl }
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
    get autoSave() { return this._autoSave; }
    set autoSave(val) { this._autoSave = !!val; }
    
    get rpcSaveArgs() { return this._rpcSaveArgs; }
    set rpcSaveArgs(val) { this._rpcSaveArgs = val; }
    
    get rpcSaveFn() { return this._rpcSaveFn; }
    set rpcSaveFn(val) { this._rpcSaveFn = val; }

    get tabBarAlign() { return this._tabBarAlign; }
    set tabBarAlign(val) {
        if (!kijs.Array.contains(['start','center','end'], val)) {
            throw new kijs.Error(`unknown tabBarAlign.`);
        }
        
        let oldTabParAlign = this._tabBarAlign;
        this._tabBarAlign = val;
        
        // bestehende CSS-Klassen entfernen
        this._dom.clsRemove(['kijs-align-start','kijs-align-center','kijs-align-end']);

        // neue hinzufügen
        this._dom.clsAdd('kijs-align-' + val.toLowerCase());
        
        if (val !== oldTabParAlign) {
            this._tabBarEl.render();
        }
    }
    
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
        
        // Drag&Drop direction von tabBar nachführen
        switch (val) {
            case 'top':
            case 'bottom':
                this._tabBarEl.ddDirection = 'horizontal';
                break;
                
            case 'left':
            case 'right':
                this._tabBarEl.ddDirection = 'vertical';
                break;
                       
        }
        
        
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
        
        // speichern
        if (this._autoSave && this._rpcSaveFn && !preventEvents) {
            this.save();
        }
    }
    
    // overwrite
    render(superCall) {
        super.render(true);
        
        // TabBar rendern (kijs.gui.container.tab.Bar)
        this._tabBarEl.renderTo(this._dom.node, this._innerDom.node);
    }
    
    save() {
        return new Promise((resolve, reject) => {
            let args = {};
            
            args = Object.assign({}, args, this._rpcSaveArgs);
            
            // Positionsdaten der Spalten + Panels ermitteln
            args.elements = [];
            kijs.Array.each(this._elements, function(el) {
                args.elements.push(el.posData);
            }, this);
            
            // an den Server senden
            this.rpc.do({
                remoteFn: this.rpcSaveFn,
                owner: this,
                data: args,
                cancelRunningRpcs: false,
                waitMaskTarget: this,
                waitMaskTargetDomProperty: 'dom',
                context: this
                
            }).then((e) => {
                // 'afterSave' auslösen
                this.raiseEvent('afterSave', e);
                
                // Promise auslösen
                resolve(e);
                
            }).catch((ex) => {
                reject(ex);
                
            });
        });
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
    #onTabBarSourceDrop(e) {
        // Source Button+Container
        let sourceButton = e.source.ownerEl;
        let sourceContainer = sourceButton.parent.parent.elements[sourceButton.index];
        
        // Source Container merken, damit er beim Ziel wieder eingefügt werden kann
        kijs.gui.DragDrop.data.sourceContainer = sourceContainer;
                
        // Events vom sourceButton entfernen
        sourceButton.off('click', this.#onTabButtonElClick, this);
        sourceButton.icon2.off('click', this.#onTabButtonElCloseClick, this);
        sourceButton.ddSource.off('drop');
        
        // Container vom alten Ort entfernen
        sourceContainer.parent.remove(sourceContainer, false, true, true);
        
        // speichern
        if (this._autoSave && this._rpcSaveFn) {
            // nur speichern, wenn das Target ein anderes Element ist
            // (sonst wird ja beim target bereits gespeichert)
            if (e.target.ownerEl !== this._tabBarEl) {
                this.save();
            }
        }
    }
    
    #onTabBarTargetDrop(e) {
        // target index ermitteln
        let targetIndex = kijs.gui.DragDrop.dropFnGetTargetIndex(e);
        
        // Container, des gezogenen Tab-Buttons ermitteln
        let sourceContainer = kijs.gui.DragDrop.data.sourceContainer;
        
        // Ist das geogene Tab das aktuell selektierte?
        const isCurrent = e.source.ownerEl.dom.clsHas('kijs-current');
        
        // Container am neuen Ort wieder einfügen
        this.add(sourceContainer, targetIndex);
        
        // in sichtbaren Bereich scrollen
        sourceContainer.tabButtonEl.dom.scrollIntoView();
        
        // Fall der aktuelle Container gezigen wurde: wieder auswählen
        if (isCurrent) {
            this.currentEl = sourceContainer;
        }
        
        // speichern
        if (this._autoSave && this._rpcSaveFn) {
            this.save();
        }
    }
    
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
        this._rpcSaveArgs = null;
        this._tabBarEl = null;
        this._tabBarPos = null;
        
        // Basisklasse entladen
        super.destruct(true);
    }
    
};
