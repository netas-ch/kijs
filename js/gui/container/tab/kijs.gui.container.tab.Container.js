/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.container.tab.Container
// --------------------------------------------------------------
/**
 * Container Element, zur Verwendung in kijs.gui.container.tab.Elementen.
 * Es hat zusätzlich zum normalen Container noch ein paar Eigenschaften, für den
 * Tab-Button in der Tab-Bar.
 *
 * KLASSENHIERARCHIE
 * kijs.gui.Element
 *  kijs.gui.Container
 *   kijs.gui.container.tab.Container
 *
 */
kijs.gui.container.tab.Container = class kijs_gui_container_tab_Container extends kijs.gui.Container {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        this._tabButtonEl = new kijs.gui.container.tab.Button({
            parent: this,
            tabContainerEl: this
        });
        
        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            tabClosable: { target: 'tabClosable' },
            tabClosableIconMap: { target: 'closableIconMap', context: this._tabButtonEl },
            tabBadgeText: { target: 'badgeText', context: this._tabButtonEl },
            tabBadgeCls: { target: 'badgeCls', context: this._tabButtonEl },
            tabBadgeTextHtmlDisplayType: { target: 'badgeTextHtmlDisplayType', context: this._tabButtonEl },
            tabBadgeStyle: { target: 'badgeStyle', context: this._tabButtonEl },
            tabCaption: { target: 'caption', context: this._tabButtonEl },
            tabCaptionCls: { target: 'captionCls', context: this._tabButtonEl },
            tabCaptionHtmlDisplayType: { target: 'captionHtmlDisplayType', context: this._tabButtonEl },
            tabCaptionStyle: { target: 'captionStyle', context: this._tabButtonEl },
            
            tabIcon: { target: 'icon', context: this._tabButtonEl },
            tabIconMap: { target: 'iconMap', context: this._tabButtonEl },
            tabIconChar: { target: 'iconChar', context: this._tabButtonEl },
            tabIconCls: { target: 'iconCls', context: this._tabButtonEl },
            tabIconColor: { target: 'iconColor', context: this._tabButtonEl },
            tabStyle: { fn: 'assign', target: 'style', context: this._tabButtonEl },
            tabTooltip: { target: 'tooltip', context: this._tabButtonEl },
            tabWidth: { target: 'width', context: this._tabButtonEl },
            
            tabMenuHide: { target: 'menuHide', context: this._tabButtonEl }
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
    // gibt Grund-Daten zum Container zurück, wie caption und Position.
    get posData() {
        let ret = {
            tabCaption: this._tabButtonEl.caption,
            tabIconMap: this._tabButtonEl.icon.iconMapName ?? null,
            tabClosable: this.tabClosable
        };
        if (!kijs.isEmpty(this.name)) {
            ret.name = this.name;
        }
        if (this.disabled) {
            ret.disabled = this.disabled;
        }
        if (this.userData) {
            ret.userData = this.userData;
        }
        return ret;
    }
    
    get tabButtonEl() { return this._tabButtonEl; }

    get tabClosable() { return !this._tabButtonEl.closeButtonHide; }
    set tabClosable(val) { this._tabButtonEl.closeButtonHide = !val; }

    get tabClosableIconMap() { return this._tabButtonEl.closeButtonIconMap; }
    set tabClosableIconMap(val) { this._tabButtonEl.closeButtonIconMap = val; }

    get tabMenuHide() { return this._tabButtonEl.menuHide; }
    set tabMenuHide(val) { this._tabButtonEl.menuHide = val; }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // overwrite
    changeDisabled(val, callFromParent) {
        super.changeDisabled(!!val, callFromParent);
        this._tabButtonEl.changeDisabled(!!val, true);
    }
    
    // overwrite
    unrender(superCall) {
        // Event auslösen.
        if (!superCall) {
            this.raiseEvent('unrender');
        }

        if (this._tabButtonEl) {
            this._tabButtonEl.unrender();
        }

        super.unrender(true);
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
        if (this._tabButtonEl) {
            this._tabButtonEl.destruct();
        }

        // Variablen (Objekte/Arrays) leeren
        this._tabButtonEl = null;

        // Basisklasse entladen
        super.destruct(true);
    }

};
