/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.container.tab.Container
// --------------------------------------------------------------
/**
 * Container Element, zur Verwendung in kijs.gui.container.Tab.Elementen.
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
        
        this._tabClosableIcon = 'kijs.iconMap.Fa.xmark';
        
        this._tabButtonEl = new kijs.gui.Button({
            on: {
                context: this
            }
        });
        
        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            tabClosable: { target: 'tabClosable' },
            tabClosableIcon: true,
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
            tabWidth: { target: 'width', context: this._tabButtonEl }
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
    get tabButtonEl() { return this._tabButtonEl; }
    
    get tabClosable() { return !!this._tabButtonEl.icon2Map; }
    set tabClosable(val) {
        this._tabButtonEl.icon2Map = this._tabClosableIcon;
    }
    
    get tabClosableIcon() { return this._tabClosableIcon; }
    set tabClosableIcon(val) { 
        this._tabClosableIcon = val;
        if (this._tabButtonEl.icon2Map) {
            this._tabButtonEl.icon2Map = val;
        }
    }
    
    
    
    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
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
        this._tabClosableIcon = null;
        
        // Basisklasse entladen
        super.destruct(true);
    }
    
};
