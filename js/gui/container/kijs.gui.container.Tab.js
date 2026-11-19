/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.container.Tab
// --------------------------------------------------------------
/**
 * Container mit Registerkarten: Eine Tab-Bar (kijs.gui.container.tab.Bar) zeigt für jedes
 * Element einen Tab-Button, ein Klick darauf zeigt das Element an (wie kijs.gui.container.Stack,
 * Default-Animation 'fade').
 *
 * - Es können nur kijs.gui.container.tab.Container hinzugefügt werden (xtype kann auch
 *   weggelassen werden).
 * - Tabs können über den Schliessen-Button bzw. das Kontextmenü geschlossen und mit sortable per
 *   Drag&Drop verschoben werden, auch in einen anderen Tab-Container mit dem gleichen ddName.
 * - Mit rpcSaveFn und autoSave werden die Positionen (posData) nach Änderungen an den Server
 *   gesendet.
 *
 * @example
 * new kijs.gui.container.Tab({
 *     tabBarPos: 'left',
 *     sortable: true,
 *     elements: [
 *         { tabCaption: 'Adresse', html: '...' },
 *         { tabCaption: 'Notizen', tabClosable: false, html: '...' }
 *     ]
 * });
 *
 * @fires afterSave  Nach dem Speichern mit save(). e: Antwort des RPC
 * @fires change  Zusätzlich zu kijs.gui.container.Stack: nach dem Einfügen eines gezogenen Tabs.
 *                e: tabContainer, index
 * @fires tabBarContextMenu  Kontextmenü auf der Tab-Bar (weitergeleitet)
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
                contextMenu: this.#onTabBarContextMenu,
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
            tabBarPos: { target: 'tabBarPos' },
            tabBarAlign: { target: 'tabBarAlign'},
            tabBarScrollableX: { target: 'scrollableX', context: this._tabBarEl },  // {Boolean|String} Horizontal scrollbare Tab-Bar (siehe kijs.gui.container.Scrollable.scrollableX). Default: 'auto'
            tabBarScrollableY: { target: 'scrollableY', context: this._tabBarEl },  // {Boolean|String} Vertikal scrollbare Tab-Bar (siehe kijs.gui.container.Scrollable.scrollableY). Default: 'auto'

            ddName: { target: 'ddName', context: this._tabBarEl },  // {String} Name für Drag&Drop der Tabs. Tab-Container mit gleichem ddName können Tabs austauschen. Default: eindeutige ID
            ddPosBeforeAfterFactor: { target: 'ddPosBeforeAfterFactor', context: this._tabBarEl },  // {Number} Position auf dem Ziel-Tab, ab der nachher statt vorher eingefügt wird. Default: 0.666
            ddMapping: { target: 'ddMapping', context: this._tabBarEl },    // {Object} Zusätzliches Drag&Drop-Mapping der Tab-Bar (siehe kijs.gui.container.tab.Bar.ddMapping)

            rpcSaveFn: true,
            rpcSaveArgs: true,
            autoSave: true,

            sortable: { prio: 90, target: 'sortable', context: this._tabBarEl }  // {Boolean} Tabs per Drag&Drop verschiebbar? Default: false
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
     * Nach Änderungen (Tab geschlossen oder verschoben) automatisch save() aufrufen? Nur mit rpcSaveFn. Default: false
     * @type {Boolean}
     */
    get autoSave() { return this._autoSave; }
    set autoSave(val) { this._autoSave = !!val; }

    /**
     * Positionsdaten aller Tabs in der aktuellen Reihenfolge (posData der tab.Container)
     * @type {Object[]}
     */
    get posData() {
        // Positionsdaten der Tabs ermitteln
        let data = [];
        kijs.Array.each(this._elements, function(el) {
            data.push(el.posData);
        }, this);

        return data;
    }

    /**
     * Zusätzliche RPC-Argumente fürs Speichern. Überschreiben gleichnamige Argumente von save().
     * @type {Object}
     */
    get rpcSaveArgs() { return this._rpcSaveArgs; }
    set rpcSaveArgs(val) { this._rpcSaveArgs = val; }

    /**
     * Name der remoteFn zum Speichern, z.B. 'myTabs.save'
     * @type {String|null}
     */
    get rpcSaveFn() { return this._rpcSaveFn; }
    set rpcSaveFn(val) { this._rpcSaveFn = val; }

    /**
     * Ausrichtung der Tabs: 'start', 'center' oder 'end'. Andere Werte werfen einen kijs.Error. Default: 'start'
     * @type {String}
     */
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

    /**
     * Position der Tab-Bar: 'top', 'right', 'bottom' oder 'left'. Andere Werte werfen einen kijs.Error. Default: 'top'
     * @type {String}
     */
    get tabBarPos() { return this._tabBarPos; }
    set tabBarPos(val) {

        if (!kijs.Array.contains(['top','right','bottom','left'], val)) {
            throw new kijs.Error(`unknown tabBarPos.`);
        }

        let oldTabParPos = this._tabBarPos;
        this._tabBarPos = val;

        // bestehende CSS-Klassen entfernen
        this._dom.clsRemove(['kijs-pos-top','kijs-pos-right','kijs-pos-bottom','kijs-pos-left']);

        // neue hinzufügen
        this._dom.clsAdd('kijs-pos-' + val.toLowerCase());

        if (val !== oldTabParPos) {
            this._tabBarEl.render();
        }
    }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // overwrite
    add(elements, index=null, options={}) {
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

            // Falls eine Config übergeben wurde, den xtype checken.
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
            el.tabButtonEl.on('closeClick', this.#onTabButtonElCloseClick, this);
            el.tabButtonEl.on('closeAllClick', this.#onTabButtonElCloseAllClick, this);
            el.tabButtonEl.on('closeOtherClick', this.#onTabButtonElCloseOtherClick, this);
            newTabBarButtons.push(el.tabButtonEl);
        }, this);

        // Buttons zu tabBar hinzufügen
        this._tabBarEl.add(newTabBarButtons, index, { preventRender: true });

        // Elemente hinzufügen
        super.add(newElements, index, options);
    }

    // overwrite
    changeDisabled(val, callFromParent) {
        super.changeDisabled(!!val, callFromParent);
        this._tabBarEl.changeDisabled(!!val, true);
    }

    // overwrite
    remove(elements, options={}, superCall) {
        if (!superCall) {
            if (!kijs.isArray(elements)) {
                elements = [elements];
            }

            if (!options.preventEvents) {
                // beforeRemove Event. Bei Rückgabe=false -> abbrechen
                if (this.raiseEvent('beforeRemove', {removeElements: elements}) === false) {
                    return;
                }
            }
        }

        // tabBarButton entfernen
        kijs.Array.each(elements, function(el) {
            this._tabBarEl.remove(el.tabButtonEl, options);
        }, this);

        super.remove(elements, options, true);

        // speichern
        if (this._autoSave && this._rpcSaveFn && !options.preventEvents) {
            this.save();
        }
    }

    // overwrite
    render(superCall) {
        super.render(true);

        // TabBar rendern (kijs.gui.container.tab.Bar)
        this._tabBarEl.renderTo(this._dom.node, this._innerDom.node);
    }

    /**
     * Sendet die Positionsdaten (posData) an rpcSaveFn. Enthält die Antwort config, wird sie
     * angewendet. Danach wird afterSave ausgelöst.
     * @param {Object|null} [args=null]  Argumente für den Server (rpcSaveArgs haben Vorrang)
     * @returns {Promise}  Wird mit der Antwort des RPC aufgelöst
     */
    save(args=null) {
        return new Promise((resolve, reject) => {
            // Args
            if (!kijs.isObject(args)) {
                args = {};
            }
            args = Object.assign({}, args, this._rpcSaveArgs);

            // Positionsdaten der Tabs
            let posData = this.posData;

            // an den Server senden
            this.rpc.do({
                remoteFn: this.rpcSaveFn,
                owner: this,
                requestData: {
                    posData: posData,
                    args: args
                },
                cancelRunningRpcs: false,
                waitMaskTarget: this,
                waitMaskTargetDomProperty: 'dom',
                context: this

            }).then((e) => {
                // config Properties anwenden, falls vorhanden
                if (e.response.config) {
                    // config Properties übernehmen
                    this.applyConfig(e.response.config);
                }

                // 'afterSave' auslösen
                this.raiseEvent('afterSave', Object.assign({}, e));

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
    /**
     * Ermittelt den Index eines Tab-Buttons in der Tab-Bar
     * @param {kijs.gui.container.tab.Button} el
     * @returns {Number|null}  null, wenn nicht gefunden
     */
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
        let ret = super._setCurrent(element);

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

        return ret;
    }


    // PRIVATE
    // LISTENERS
    #onTabBarContextMenu(e) {
        // Event werfen
        this.raiseEvent('tabBarContextMenu', e);
    }

    #onTabBarSourceDrop(e) {
        if (e.source.name === this._tabBarEl.ddName && e.operation === 'move') {
            // Source Button+Container
            let sourceButton = e.source.ownerEl;
            let sourceContainer = sourceButton.parent.parent.elements[sourceButton.index];

            // Source Container merken, damit er beim Ziel wieder eingefügt werden kann
            kijs.gui.DragDrop.data.sourceContainer = sourceContainer;

            // Alle Listeners dieses Tab-Containers vom sourceButton entfernen
            // (click, closeClick, closeAllClick, closeOtherClick). Beim Ziel werden sie neu gesetzt.
            sourceButton.off(null, null, this);
            sourceButton.ddSource.off('drop');

            // Container vom alten Ort entfernen
            sourceContainer.parent.remove(sourceContainer, {
                preventDestruct: true,
                preventUnrender: true,
                preventEvents: true
            });

            // speichern
            if (this._autoSave && this._rpcSaveFn) {
                // nur speichern, wenn das Target ein anderes Element ist
                // (sonst wird ja beim target bereits gespeichert)
                if (e.target.ownerEl !== this._tabBarEl) {
                    this.save();
                }
            }
        }
    }

    #onTabBarTargetDrop(e) {
        if (e.source.name === this._tabBarEl.ddName) {
            // target index ermitteln
            let targetIndex = kijs.gui.DragDrop.dropFnGetTargetIndex(e);

            // Container, des gezogenen Tab-Buttons ermitteln
            let sourceContainer = kijs.gui.DragDrop.data.sourceContainer;

            // Ist das geogene Tab das aktuell selektierte?
            const isCurrent = e.source.ownerEl.dom.clsHas('kijs-current');

            let newTabContainer = null;

            // Falls der Drag von einem anderen kijs.gui.container.Tab kommt, können
            // wir das vorhandene Tab gleich nehmen
            if (sourceContainer instanceof kijs.gui.container.tab.Container) {
                newTabContainer = sourceContainer;

            } else {
                throw new kijs.Error('Drag&Drop of elements other than kijs.gui.container.Tab.container is not yet implemented.');

            }

            // Container am neuen Ort einfügen
            this.add(newTabContainer, targetIndex);

            // Fall der aktuelle Container gezogen wurde: wieder auswählen
            if (isCurrent) {
                this.currentEl = newTabContainer;
            } else {
                // sonst nur in sichtbaren Bereich scrollen
                newTabContainer.tabButtonEl.dom.scrollIntoView();
            }

            // Event werfen
            this.raiseEvent('change', { tabContainer: newTabContainer, index: targetIndex });

            // speichern
            if (this._autoSave && this._rpcSaveFn) {
                this.save();
            }
        }
    }

    #onTabButtonElClick(e) {
        // Element wechseln
        this.setCurrentAnimated(e.element.tabContainerEl);
    }

    // Alle Tabs schliessen
    #onTabButtonElCloseAllClick(e) {
        let elements = [];
        
        // alle Tabs durchgehen und schliessen, wenn closable
        kijs.Array.each(this._tabBarEl.elements, function(el) {
            if (!el.closeButtonHide) {
                elements.push(el.tabContainerEl);
            }
        }, this);
        
        if (!kijs.isEmpty(elements)) {
            this.remove(elements);
        }
    }
    
    // ein Tab schliessen
    #onTabButtonElCloseClick(e) {
        // Tab schliessen
        this.remove(e.element.tabContainerEl);
    }
    
    // Alle anderen Tabs schliessen, die closable sind
    #onTabButtonElCloseOtherClick(e) {
        let elements = [];
        let elCur = e.element;
        
        // alle Tabs durchgehen und schliessen, wenn closable und nicht das aktuelle tab
        kijs.Array.each(this._tabBarEl.elements, function(el) {
            if (!el.closeButtonHide && el !== elCur) {
                elements.push(el.tabContainerEl);
            }
        }, this);
        
        if (!kijs.isEmpty(elements)) {
            this.remove(elements);
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
        if (this._tabBarEl) {
            this._tabBarEl.destruct();
        }

        // Variablen (Objekte/Arrays) leeren
        this._rpcSaveArgs = null;
        this._tabBarEl = null;

        // Basisklasse entladen
        super.destruct(true);
    }

};
