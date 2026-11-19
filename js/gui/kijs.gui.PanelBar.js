/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.PanelBar
// --------------------------------------------------------------
/**
 * Leiste mit Icon, Beschriftung (html) und Elementen links (containerLeftEl) und rechts
 * (containerRightEl). Wird als Kopf- und Fusszeile von kijs.gui.Panel verwendet.
 * Die Events click, dblClick und mouseDown kommen nur von der Beschriftung und dem Icon,
 * nicht von den Elementen links und rechts.
 */
kijs.gui.PanelBar = class kijs_gui_PanelBar extends kijs.gui.Container {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        this._iconEl = new kijs.gui.Icon({ parent: this });
        this._containerLeftEl = new kijs.gui.Container({
            cls: 'kijs-container-left',
            parent: this
        });
        this._containerLeftEl.dom.clsRemove('kijs-container');

        this._containerRightEl = new kijs.gui.Container({
            cls: 'kijs-container-right',
            parent: this
        });
        this._containerRightEl.dom.clsRemove('kijs-container');

        this._dom.clsRemove('kijs-container');
        this._dom.clsAdd('kijs-panelbar');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            icon: { target: 'icon' },
            iconChar: { target: 'iconChar', context: this._iconEl },   // {Number} Zeichen des Icons (siehe kijs.gui.Icon.iconChar)
            iconCls: { target: 'iconCls', context: this._iconEl },   // {String} CSS-Klasse des Icons
            iconAnimationCls: { target: 'iconAnimationCls', context: this._iconEl },   // {String} CSS-Klasse für eine Animation des Icons
            iconColor: { target: 'iconColor', context: this._iconEl },   // {String} Farbe des Icons
            iconMap: { target: 'iconMap', context: this._iconEl },   // {String|Object} Icon aus einer iconMap, z.B. 'kijs.iconMap.Fa.house'

            elementsLeft: { fn: 'function', target: this._containerLeftEl.add, context: this._containerLeftEl },   // {Array} Elemente links (zwischen Icon und Beschriftung)
            elementsRight: { fn: 'function', target: this._containerRightEl.add, context: this._containerRightEl }   // {Array} Elemente rechts
        });

        // click- und mouseDown-Event soll nur auf dem label und icon kommen. Bei den elements nicht.
        this._eventForwardsRemove('click', this._dom);
        this._eventForwardsAdd('click', this._innerDom);
        this._eventForwardsAdd('click', this._iconEl.dom);

        this._eventForwardsRemove('dblClick', this._dom);
        this._eventForwardsAdd('dblClick', this._innerDom);
        this._eventForwardsAdd('dblClick', this._iconEl.dom);

        this._eventForwardsRemove('mouseDown', this._dom);
        this._eventForwardsAdd('mouseDown', this._innerDom);
        this._eventForwardsAdd('mouseDown', this._iconEl.dom);

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
     * Container für die Elemente links (zwischen Icon und Beschriftung)
     * @type {kijs.gui.Container}
     */
    get containerLeftEl() { return this._containerLeftEl; }

    /**
     * Container für die Elemente rechts
     * @type {kijs.gui.Container}
     */
    get containerRightEl() { return this._containerRightEl; }

    /**
     * Icon: Config-Objekt oder kijs.gui.Icon. Leer setzt das Icon zurück.
     * Der Getter gibt die kijs.gui.Icon-Instanz zurück.
     * @type {kijs.gui.Icon|Object|null}
     */
    get icon() { return this._iconEl; }
    set icon(val) {
        // Icon zurücksetzen?
        if (kijs.isEmpty(val)) {
            this._iconEl.iconChar = null;
            this._iconEl.iconCls = null;
            this._iconEl.iconAnimationCls = null;
            this._iconEl.iconColor = null;
            if (this.isRendered) {
                this.render();
            }

        // kijs.gui.Icon Instanz
        } else if (val instanceof kijs.gui.Icon) {
            this._iconEl.destruct();
            this._iconEl = val;
            if (this.isRendered) {
                this.render();
            }

        // Config Objekt
        } else if (kijs.isObject(val)) {
            this._iconEl.applyConfig(val);
            if (this.isRendered) {
                this.render();
            }

        } else {
            throw new kijs.Error(`config "icon" is not valid.`);

        }
    }

    get iconAnimationCls() { return this._iconEl.iconAnimationCls; }
    set iconAnimationCls(val) { this._iconEl.iconAnimationCls = val; }

    get iconChar() { return this._iconEl.iconChar; }
    set iconChar(val) {
        this._iconEl.iconChar = val;
        if (this.isRendered) {
            this.render();
        }
    }

    get iconCls() { return this._iconEl.iconCls; }
    set iconCls(val) { this._iconEl.iconCls = val; }

    get iconColor() { return this._iconEl.iconColor; }
    set iconColor(val) { this._iconEl.iconColor = val; }

    get iconMap() { return this._iconEl.iconMap; }
    set iconMap(val) {
        this._iconEl.iconMap = val;
        if (this.isRendered) {
            this.render();
        }
    }

    /**
     * Leer, wenn Beschriftung, Icon und die Elemente links und rechts leer sind
     * @type {Boolean}
     */
    // overwrite
    get isEmpty() { return super.isEmpty && this._iconEl.isEmpty && this._containerLeftEl.isEmpty && this._containerRightEl.isEmpty; }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // overwrite
    changeDisabled(val, callFromParent) {
        super.changeDisabled(!!val, callFromParent);
        this._iconEl.changeDisabled(!!val, true);
        this._containerLeftEl.changeDisabled(!!val, true);
        this._containerRightEl.changeDisabled(!!val, true);
    }

    // overwrite
    render(superCall) {
        // Schematischer Aufbau des DOMs:
        // + panelBar
        //   + icon
        //   + containerLeft
        //   + innerDom
        //   + containerRight

        // dom rendern. Im innerDom ist die Bezeichnung (html). Links und rechts davon sind die Tools
        super.render(true);

        // Span icon rendern (icon kijs.gui.Icon)
        if (!this._iconEl.isEmpty) {
            this._iconEl.renderTo(this._dom.node, this._innerDom.node);
        } else if (this._iconEl.isRendered) {
            this._iconEl.unrender();
        }

        // ToolsLeft rendern (kijs.gui.Container)
        if (!this._containerLeftEl.isEmpty) {
            this._containerLeftEl.renderTo(this._dom.node, this._innerDom.node);
        } else if (this._containerLeftEl.isRendered) {
            this._containerLeftEl.unrender();
        }

        // ToolsRight rendern (kijs.gui.Container)
        if (!this._containerRightEl.isEmpty) {
            this._containerRightEl.renderTo(this._dom.node);
        } else if (this._containerRightEl.isRendered) {
            this._containerRightEl.unrender();
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

        this._iconEl.unrender();
        this._containerLeftEl.unrender();
        this._containerRightEl.unrender();
        super.unrender(true);
    }



    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    destruct(superCall) {
        if (!superCall) {
            // unrendern
            this.unrender(superCall);

            // Event auslösen.
            this.raiseEvent('destruct');
        }

        // Elemente/DOM-Objekte entladen
        if (this._iconEl) {
            this._iconEl.destruct();
        }
        if (this._containerLeftEl) {
            this._containerLeftEl.destruct();
        }
        if (this._containerRightEl) {
            this._containerRightEl.destruct();
        }

        // Variablen (Objekte/Arrays) leeren
        this._iconEl = null;
        this._containerLeftEl = null;
        this._containerRightEl = null;

        // Basisklasse entladen
        super.destruct(true);
    }

};
