/* global kijs, netas */

// --------------------------------------------------------------
// kijs.gui.TabPanel
// --------------------------------------------------------------
kijs.gui.TabPanel = class kijs_gui_TabPanel extends kijs.gui.Panel {

    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config = {}) {
        super(false);

        this._activeTab = null;
        this._animation = 'none';
        this._closableButtonsContainer = null;
        this._data = null;
        this._draggable = false;
        this._mode = 'horizontal';
        this._tabButtonContainer = null;
        this._tabContainer = null;
        this._tabs = null;

        // Config generieren
        config = Object.assign({}, {
            cls: 'kijs-tabpanel',
            elements: this._createElements()
        }, config);

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            animation: true,
            data: true,
            draggable: true,
            mode: true
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            this.applyConfig(config, true);
        }

        // Tabs erstellen
        this._createTabs();
    }


    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------

    get activeTab() {
        return this._activeTab;
    }

    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------

    activateTab(tab) {

        if (kijs.isString(tab)) {
            tab = this._tabButtonContainer.down(tab);
        } else if (kijs.isNumeric(tab)) {
            tab = this._tabButtonContainer.elements[tab];
        }

        if (tab instanceof kijs.gui.Element) {
            if (tab !== this._activeTab) {
                kijs.Array.each(this._tabButtonContainer.elements, function (element) {
                    if (element instanceof kijs.gui.Button || element instanceof kijs.gui.Container) {
                        if (element === tab) {
                            element.dom.clsAdd('kijs-active');
                        } else {
                            element.dom.clsRemove('kijs-active');
                        }
                    }
                }, this);

                let tabElement = this._tabContainer.getElementsByName(tab.name, 0, true).shift();
                if (tabElement) {
                    this._tabContainer.visible = true;
                    this._tabContainer.activateAnimated(tabElement, this._animation);
                } else {
                    this._tabContainer.visible = false;
                }

                this._activeTab = tab;

                // Event auslösen
                this.raiseEvent('tabChanged', { tab: this._activeTab });
            }
        }
    }

    addTab(tabConfig, index = null) {
        let elements = null;
        let tabContainer = null

        if (!tabConfig.hasOwnProperty('name') || !tabConfig.name) {
            tabConfig.name = kijs.uniqId('tab_');
        }

        if (tabConfig.hasOwnProperty('elements') && tabConfig.elements) {
            elements = tabConfig.elements;
            delete tabConfig.elements;

            if (!kijs.isArray(elements)) {
                elements = [elements];
            }

            tabContainer = new kijs.gui.Container({
                name: tabConfig.name,
                cls: 'kijs-tab-container',
                elements: elements
            });
        }

        if (!tabConfig.hasOwnProperty('mode')) {
            tabConfig.mode = this._mode;
        }

        let tab = new kijs.gui.TabButton(tabConfig);
        tab.on('click', this._onTabClick, this);
        tab.on('closeClick', this._onTabCloseClick, this);

        if (this._draggable) {

            // DragDrop-Events hinzufügen
            tab.dom.nodeAttributeSet('draggable', true);
            kijs.DragDrop.addDragEvents(tab, tab.dom);
            kijs.DragDrop.addDropEvents(tab, tab.dom);
            tab.on('ddOver', this._onTabDdOver, this);
            tab.on('ddDrop', this._onTabDdDrop, this);
        }

        this._tabButtonContainer.add(tab, index);

        if (elements) {
            this._tabContainer.add(tabContainer);
        }
    }

    removeTab(tab) {

        // Button entfernen
        if (kijs.Array.contains(this._tabButtonContainer.elements, tab)) {
            this._tabButtonContainer.remove(tab);
        }
    }


    // Protected

    _createTabs() {
        this._tabButtonContainer.removeAll();

        this.dom.clsAdd('kijs-' + this._mode);

        if (this._data) {
            if (!kijs.isArray(this._data)) {
                this._data = [this._data];
            }

            kijs.Array.each(this._data, function (tabConfig) {
                this.addTab(tabConfig);
            }, this);
        }

        // Ersten Tab aktivieren
        this.activateTab(0);
    }

    _createElements() {

        this._tabButtonContainer = new kijs.gui.Container(
            {
                name: 'tabPanelButtonContainer',
                cls: 'kijs-tabpanel-button-container',
            }
        );

        this._tabContainer = new kijs.gui.ContainerStack(
            {
                name: 'tabPanelContainer',
                cls: 'kijs-tabpanel-container',
                visible: false
            }
        );

        return [this._tabButtonContainer, this._tabContainer];
    }

    // Listener
    _onTabCloseClick(e) {

        // Tab entfernen
        this.removeTab(e.element);

        // Event auslösen
        this.raiseEvent('closeTab', e);
    }

    _onTabClick(e) {

        // Tab aktivieren
        this.activateTab(e.element);

        // Event auslösen
        this.raiseEvent('tabClick', e);
    }

    // Tab wird verschoben
    _onTabDdOver(dd) {
        if (dd.sourceElement instanceof kijs.gui.Tab) {
            dd.position.allowAbove = false;
            dd.position.allowBelow = this._mode === 'vertical';
            dd.position.allowOnto = false;
            dd.position.allowLeft = false;
            dd.position.allowRight = this._mode === 'horizontal';

            // Kein Drop erlauben
        } else {
            dd.position.allowAbove = false;
            dd.position.allowBelow = false;
            dd.position.allowOnto = false;
            dd.position.allowLeft = false;
            dd.position.allowRight = false;
        }
    }

    // Ein anderer Tab wurde auf diesem Tab abgeladen.
    _onTabDdDrop(dd) {
        let pos = dd.position.position, movedElement = dd.sourceElement, targetElement = dd.targetElement;

        if (movedElement instanceof kijs.gui.Tab) {

            // Tab entfernen
            this._tabButtonContainer.remove(movedElement);
            let targetPos = this._tabButtonContainer.elements.indexOf(targetElement);
            if (pos === 'right') {
                targetPos += 1;
            }

            // Tab an neuer Position hinzufügen
            this._tabButtonContainer.add(movedElement, targetPos);

            // Event
            this.raiseEvent('sortChanged');
        }
    }

    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct() {
        super.destruct();

        this._activeTab = null;
        this._animation = null;
        this._closableButtonsContainer = null;
        this._data = null;
        this._draggable = null;
        this._mode = null;
        this._tabButtonContainer = null;
        this._tabContainer = null;
        this._tabs = null;

    }
}
