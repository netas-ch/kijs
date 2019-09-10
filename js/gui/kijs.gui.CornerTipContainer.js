/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.CornerTipContainer
// --------------------------------------------------------------
kijs.gui.CornerTipContainer = class kijs_gui_CornerTipContainer extends kijs.gui.Container {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super();

        this._dismissDelay = null;

        this._dom.clsRemove('kijs-container');
        this._dom.clsAdd('kijs-cornertipcontainer');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            dismissDelay: 5000,
            width: 230
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
     * @param {String} [icon='alert'] 'alert', 'info' oder 'error'
     * @returns {undefined}
     */
    static show(caption, html, icon='alert') {
        // Singleton-Instanz ermitteln oder erstellen
        let instance = kijs_gui_CornerTipContainer._singletonInstance;
        if (!instance) {
            instance = new kijs.gui.CornerTipContainer();
            instance.renderTo(document.body);
            kijs_gui_CornerTipContainer._singletonInstance = instance;
        }

        switch (icon) {
            case 'alert': instance.alert(caption, html); break;
            case 'info': instance.info(caption, html); break;
            case 'warning': instance.warning(caption, html); break;
            case 'error': instance.error(caption, html); break;
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
     * Zeigt ein CornerTip mit einem Fehler-Symbol
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
                iconChar: '&#xf06a',
                style: {
                    color: '#be6280'
                }
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
                iconChar: '&#xf05a',
                style: {
                    color: '#4398dd'
                }
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
     *         iconChar: '&#xf071',
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
            iconChar: config.iconChar ? config.iconChar : '',
            closable: true,
            shadow: true,
            elements: elements,
            on: {
                destruct: this._onCornerTipDestruct,
                context: this
            }
        });

        // CornerTip anzeigen
        this.add(tip);

        // Nach einer bestimmten Zeit wieder automatisch schliessen
        if (this._dismissDelay) {
            kijs.defer(function() {
                if (tip) {
                    tip.destruct();
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
                iconChar: '&#xf071',
                style: {
                    color: '#ff9900'
                }
            }
        });
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


    // LISTENERS
    _onCornerTipDestruct(e) {
        this.remove(e.element);
    }


    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct() {
        super.destruct();
    }

};