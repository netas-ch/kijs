/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.container.tab.Button
// --------------------------------------------------------------
/**
 * Tab-Button Element, das in kijs.gui.container.Tab.Elementen verwendet wird.
 *
 * KLASSENHIERARCHIE
 * kijs.gui.Element
 *  kijs.gui.Button
 *   kijs.gui.container.tab.Button
 *
 */
kijs.gui.container.tab.Button = class kijs_gui_container_tab_Button extends kijs.gui.Button {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);
        
        this._closeButtonHide = false;
        this._closeButtonIconMap = 'kijs.iconMap.Fa.xmark';
        this._tabContainerEl = null;
        
        this._menuHide = false;
        
        this._menuEl = new kijs.gui.Menu({
            closeOnClick: true,
            elements: [
                {
                    name: 'close',
                    caption: kijs.getText('Schliessen'),
                    on: {
                        click: this.#onMenuCloseButtonClick,
                        context: this
                    }
                },{
                    name: 'closeAll',
                    caption: kijs.getText('Alle schliessen'),
                    on: {
                        click: this.#onMenuCloseButtonClick,
                        context: this
                    }
                },{
                    name: 'closeOther',
                    caption: kijs.getText('Andere schliessen'),
                    on: {
                        click: this.#onMenuCloseButtonClick,
                        context: this
                    }
                }
            ]
        });
        
        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });
        
        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            closeButtonIconMap: { target: 'closeButtonIconMap' },
            closeButtonHide: { prio: 1000, target: 'closeButtonHide' },
            menuHide: true,
            tabContainerEl: true
        });
        
        // Listeners
        this.on('contextMenu', this.#onContextMenu, this);
        this._icon2El.on('click', this.#onCloseClick, this);
        
        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }
    }



    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get closeButtonHide() { return this._closeButtonHide; }
    set closeButtonHide(val) {
        this._closeButtonHide = val;
        if (val) {
            this.icon2Map = null;
        } else {
            this.icon2Map = this._closeButtonIconMap;
        }
    }
    
    get closeButtonIconMap() { return this._closeButtonIconMap; }
    set closeButtonIconMap(val) {
        this._closeButtonIconMap = val;
        if (!this._closeButtonHide) {
            this.icon2Map = val;
        }
    }

    get menuEl() { return this._menuEl; }

    get menuHide() { return !!this._menuHide; }
    set menuHide(val) { this._menuHide = !!val; }
    
    get tabContainerEl() { return this._tabContainerEl; }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // overwrite
    unrender(superCall) {
        // Event auslösen.
        if (!superCall) {
            this.raiseEvent('unrender');
        }

        if (this._menuEl) {
            this._menuEl.unrender();
        }

        super.unrender(true);
    }
    
    
    // PRIVATE
    // LISTENERS
    // es wurde auf den Schliessen-Button geklickt
    #onCloseClick(e) {
        this.raiseEvent('closeClick', e);
        
        // bubbeling verhindern, damit nicht das click-Event des Buttons
        // auch noch ausgelöst wird
        e.nodeEvent.stopPropagation();
    }
    
    // Menü anzeigen, falls es Elemente enthält
    #onContextMenu(e) {
        e.nodeEvent.preventDefault();
        
        if (!this._menuHide) {
            // ativiert/deaktiviert den Schliessen-Button
            this._menuEl.down('close').disabled = this.closeButtonHide;
            this._menuEl.down('closeAll').disabled = this.closeButtonHide;

            // Menü anzeigen
            this._menuEl.show(e.nodeEvent.pageX, e.nodeEvent.pageY);
        }
    }
    
    // es wurde auf einen Schliessen-Button im Menü geklickt
    #onMenuCloseButtonClick(e) {
        switch (e.element.name) {
            case 'close':
                this._menuEl.close();
                this.raiseEvent('closeClick', e);
                break;
                
            case 'closeAll':
                this._menuEl.close();
                this.raiseEvent('closeAllClick', e);
                break;
                
            case 'closeOther':
                this._menuEl.close();
                this.raiseEvent('closeOtherClick', e);
                break;
                
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
        
        // Variablen (Objekte/Arrays) leeren
        this._menuEl = null;
        this._closeButtonIconMap = null;
        this._tabContainerEl = null;
        
        // Basisklasse entladen
        super.destruct(true);
    }

};
