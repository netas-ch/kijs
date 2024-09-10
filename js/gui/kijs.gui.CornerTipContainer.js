/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.CornerTipContainer
// --------------------------------------------------------------
kijs.gui.CornerTipContainer = class kijs_gui_CornerTipContainer extends kijs.gui.Container {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        this._dismissDelay = null;

        this._dom.clsRemove('kijs-container');
        this._dom.clsAdd('kijs-cornertipcontainer');
        this._dom.nodeAttributeSet('popover', 'manual');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            dismissDelay: 5000,
            width: 240
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            dismissDelay: true
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }
    }



    // --------------------------------------------------------------
    // STATICS
    // --------------------------------------------------------------
    /**
     * Zeigt einen CornerTip an und erstellt dafür eine Singleton-Instanz
     * @param {String} caption
     * @param {String} html
     * @param {String} [icon='alert'] 'alert', 'info', 'errorNotice' oder 'error'
     * @returns {undefined}
     */
    static show(caption, html, icon='alert') {
        // Singleton-Instanz ermitteln oder erstellen
        let instance = kijs.gui.CornerTipContainer._singletonInstance;
        if (!instance) {
            instance = new kijs.gui.CornerTipContainer();
            instance.renderTo(document.body);
            kijs.gui.CornerTipContainer._singletonInstance = instance;

        } else {
            // als letzte node anhängen
            document.body.appendChild(instance.dom.node);
        }

        switch (icon) {
            case 'alert': instance.alert(caption, html); break;
            case 'info': instance.info(caption, html); break;
            case 'warning': instance.warning(caption, html); break;
            case 'error': instance.error(caption, html); break;
            case 'errorNotice': instance.errorNotice(caption, html); break;
            default:
                throw new kijs.Error(`Unknown value on argument "icon"`);
        }
    }



    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get dismissDelay() { return this._dismissDelay; }
    set dismissDelay(val) { this._dismissDelay = val; }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
     /**
     * Zeigt ein normaler CornerTip
     * @param {String} caption
     * @param {String} msg
     * @returns {undefined}
     */
    alert(caption, msg) {
        if (kijs.isArray(msg)) {
            msg = this._convertArrayToHtml(msg);
        }

        this.show({
            caption: caption,
            msg: msg
        });
    }

    /**
     * Zeigt ein CornerTip mit einem "unerwarteten Fehler"-Symbol
     * @param {String} caption
     * @param {String} msg
     * @returns {undefined}
     */
    error(caption, msg) {
        if (kijs.isArray(msg)) {
            msg = this._convertArrayToHtml(msg);
        }

        this.show({
            caption: caption,
            msg: msg,
            icon: {
                iconMap: 'kijs.iconMap.Fa.circle-exclamation',
                iconColor: '#be6280'
            }
        });
    }
    
    /**
     * Zeigt ein CornerTip mit einem Fehler-Symbol
     * @param {String} caption
     * @param {String} msg
     * @returns {undefined}
     */
    errorNotice(caption, msg) {
        if (kijs.isArray(msg)) {
            msg = this._convertArrayToHtml(msg);
        }

        this.show({
            caption: caption,
            msg: msg,
            icon: {
                iconMap: 'kijs.iconMap.Fa.triangle-exclamation',
                iconColor: '#be6280'
            }
        });
    }

    /**
     * Zeigt ein CornerTip mit einem Info-Symbol
     * @param {String} caption
     * @param {String} msg
     * @returns {undefined}
     */
    info(caption, msg) {
        if (kijs.isArray(msg)) {
            msg = this._convertArrayToHtml(msg);
        }

        this.show({
            caption: caption,
            msg: msg,
            icon: {
                iconMap: 'kijs.iconMap.Fa.circle-info',
                iconColor: '#4398dd'
            }
        });
    }

    /**
     * Zeigt ein individueller CornerTip
     * Beispiel config:
     * config = {
     *     caption = 'Testmeldung',
     *     msg = 'Hallo Welt!'
     *     iconChar: '',
     *     icon: {
     *         iconChar: 0xf071,
     *         style: {
     *             color: '#ff9900'
     *         }
     *     }
     * }
     * @param {Object} config
     * @returns {undefined}
     */
    show(config) {
        const elements = [];

        // Icon
        if (config.icon) {
            if (!(config.icon instanceof kijs.gui.Icon)) {
                config.icon.xtype = 'kijs.gui.Icon';
            }
            elements.push(config.icon);
        }

        // Text
        elements.push({
            xtype: 'kijs.gui.Element',
            html: config.msg,
            htmlDisplayType: 'html',
            cls: 'kijs-msgbox-inner'
        });

        // CornerTip erstellen
        const tip = new kijs.gui.Panel({
            caption: config.caption,
            iconMap: config.iconMap ? config.iconMap : '',
            closable: true,
            elements: elements
        });

        // CornerTip anzeigen
        this.add(tip);

        // Nach einer bestimmten Zeit wieder automatisch schliessen
        if (this._dismissDelay) {
            kijs.defer(function() {
                if (this.hasChild(tip)) {
                    this.remove(tip);
                }

                // Singleton löschen, wenn nicht mehr benötigt.
                if (this.elements.length === 0 && kijs.gui.CornerTipContainer._singletonInstance === this) {
                    this.unrender();
                    delete kijs.gui.CornerTipContainer._singletonInstance;
                }

            }, this._dismissDelay, this);
        }
    }

    /**
     * Zeigt ein CornerTip mit einem Warnungs-Symbol
     * @param {String} caption
     * @param {String} msg
     * @returns {undefined}
     */
    warning(caption, msg) {
        if (kijs.isArray(msg)) {
            msg = this._convertArrayToHtml(msg);
        }

        this.show({
            caption: caption,
            msg: msg,
            icon: {
                iconMap: 'kijs.iconMap.Fa.triangle-exclamation',
                iconColor: '#ff9900'
            }
        });
    }

    // overwrite
    render(superCall) {
        super.render(true);

        // popover
        if (this._dom.node && this._dom.node.parentNode) {
            this._dom.node.showPopover();
        }

        // Event afterRender auslösen
        if (!superCall) {
            this.raiseEvent('afterRender');
        }
    }


    // PROTECTED
    _convertArrayToHtml(messages) {
        if (messages.length === 1) {
            return messages[0];
        }

        let ret = '<ul>';
        kijs.Array.each(messages, function(msg) {
            ret += '<li>' + msg + '</li>';
        }, this);
         ret += '</ul>';
        return ret;
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

        // Variablen (Objekte/Arrays) leeren

        // Basisklasse entladen
        super.destruct(true);
    }
    
};