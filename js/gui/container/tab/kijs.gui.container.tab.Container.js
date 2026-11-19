/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.container.tab.Container
// --------------------------------------------------------------
/**
 * Container für eine Seite von kijs.gui.container.Tab. Zusätzlich zum normalen Container
 * hat er einen Tab-Button (kijs.gui.container.tab.Button) für die Tab-Bar, der über die
 * Config-Eigenschaften tab... konfiguriert wird.
 *
 * @example
 * new kijs.gui.container.Tab({
 *     elements: [
 *         { xtype: 'kijs.gui.container.tab.Container', tabCaption: 'Adresse', tabClosable: true, html: '...' }
 *     ]
 * });
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
            tabClosableIconMap: { target: 'tabClosableIconMap' },
            tabBadgeText: { target: 'badgeText', context: this._tabButtonEl },   // {String} Badge-Text des Tab-Buttons (siehe kijs.gui.Button.badgeText)
            tabBadgeCls: { fn: 'function', target: this._tabButtonEl.badgeDom.clsAdd, context: this._tabButtonEl.badgeDom },   // {String|Array} CSS-Klassen des Badges
            tabBadgeTextDisplayType: { target: 'badgeTextDisplayType', context: this._tabButtonEl },   // {String} Darstellung des Badge-Texts (siehe kijs.gui.Button.badgeTextDisplayType)
            tabBadgeStyle: { fn: 'assign', target: 'style', context: this._tabButtonEl.badgeDom },   // {Object} CSS-Styles des Badges
            tabCaption: { target: 'caption', context: this._tabButtonEl },   // {String} Beschriftung des Tab-Buttons
            tabCaptionCls: { fn: 'function', target: this._tabButtonEl.captionDom.clsAdd, context: this._tabButtonEl.captionDom },   // {String|Array} CSS-Klassen der Beschriftung
            tabCaptionDisplayType: { target: 'captionDisplayType', context: this._tabButtonEl },   // {String} Darstellung der Beschriftung (siehe kijs.gui.Button.captionDisplayType)
            tabCaptionStyle: { fn: 'assign', target: 'style', context: this._tabButtonEl.captionDom },   // {Object} CSS-Styles der Beschriftung
            
            tabIcon: { target: 'icon', context: this._tabButtonEl },   // {kijs.gui.Icon|Object} Icon des Tab-Buttons (siehe kijs.gui.Button.icon)
            tabIconMap: { target: 'iconMap', context: this._tabButtonEl },   // {String} Icon aus einer IconMap, z.B. 'kijs.iconMap.Fa.house'
            tabIconChar: { target: 'iconChar', context: this._tabButtonEl },   // {String|Number} Zeichen des Icons
            tabIconCls: { target: 'iconCls', context: this._tabButtonEl },   // {String} CSS-Klasse des Icons
            tabIconAnimationCls: { target: 'iconAnimationCls', context: this._tabButtonEl },   // {String} Animations-Klasse des Icons (siehe kijs.gui.Icon.iconAnimationCls)
            tabIconColor: { target: 'iconColor', context: this._tabButtonEl },   // {String} Farbe des Icons
            tabStyle: { fn: 'assign', target: 'style', context: this._tabButtonEl },   // {Object} CSS-Styles des Tab-Buttons
            tabTooltip: { target: 'tooltip', context: this._tabButtonEl },   // {String|Object} Tooltip des Tab-Buttons (siehe kijs.gui.Element.tooltip)
            tabWidth: { target: 'width', context: this._tabButtonEl },   // {Number} Breite des Tab-Buttons in px
            
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
    /**
     * Grunddaten des Containers zum Speichern der Tab-Positionen: tabCaption, tabIconMap,
     * tabClosable und, falls vorhanden, name, disabled und userData.
     * @type {Object}
     */
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
    
    /**
     * Tab-Button in der Tab-Bar
     * @type {kijs.gui.container.tab.Button}
     */
    get tabButtonEl() { return this._tabButtonEl; }

    /**
     * Hat der Tab-Button einen Schliessen-Button? Default: true
     * @type {Boolean}
     */
    get tabClosable() { return !this._tabButtonEl.closeButtonHide; }
    set tabClosable(val) { this._tabButtonEl.closeButtonHide = !val; }

    /**
     * Icon des Schliessen-Buttons. Default: 'kijs.iconMap.Fa.xmark'
     * @type {String}
     */
    get tabClosableIconMap() { return this._tabButtonEl.closeButtonIconMap; }
    set tabClosableIconMap(val) { this._tabButtonEl.closeButtonIconMap = val; }

    /**
     * Kontextmenü (Schliessen, Alle schliessen …) des Tab-Buttons ausblenden?
     * @type {Boolean}
     */
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
