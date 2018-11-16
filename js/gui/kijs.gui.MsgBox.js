/* global kijs */

// --------------------------------------------------------------
// kijs.gui.MsgBox (static)
// --------------------------------------------------------------
kijs.gui.MsgBox = class kijs_gui_MsgBox {


    // --------------------------------------------------------------
    // STATICS
    // --------------------------------------------------------------
    /**
     * Zeigt ein normales Meldungsfenster mit OK-Schaltfläche
     * @param {String} caption
     * @param {String} msg
     * @param {Function} fn
     * @param {Object} context
     * @returns {undefined}
     */
    static alert(caption, msg, fn, context) {
        if (kijs.isArray(msg)) {
            msg = this._convertArrayToHtml(msg);
        }

        this.show({
            caption: caption,
            msg: msg,
            fn: fn,
            context: context,
            buttons: [
                {
                    name: 'ok',
                    caption: 'OK',
                    isDefault: true
                }
            ]
        });            
    }

    /**
     * Zeigt ein Meldungsfenster mit Ja/Nein-Schaltfläche und einem Fragezeichen-Symbol
     * @param {String} caption
     * @param {String} msg
     * @param {Function} fn
     * @param {Object} context
     * @returns {undefined}
     */
    static confirm(caption, msg, fn, context) {
        if (kijs.isArray(msg)) {
            msg = this._convertArrayToHtml(msg);
        }

        this.show({
            caption: caption,
            msg: msg,
            fn: fn,
            context: context,
            icon: {
                iconChar: '&#xf059',
                style: {
                    color: '#4398dd'
                }
            },
            buttons: [
                {
                    name: 'yes',
                    caption: 'Ja'
                },{
                    name: 'no',
                    caption: 'Nein'
                }
            ]
        });            
    }

    /**
     * Zeigt ein Meldungsfenster mit OK-Schaltfläche und einem Fehler-Symbol
     * @param {String} caption
     * @param {String} msg
     * @param {Function} fn
     * @param {Object} context
     * @returns {undefined}
     */
    static error(caption, msg, fn, context) {
        if (kijs.isArray(msg)) {
            msg = this._convertArrayToHtml(msg);
        }

        this.show({
            caption: caption,
            msg: msg,
            fn: fn,
            context: context,
            icon: {
                iconChar: '&#xf06a',
                style: {
                    color: '#be6280'
                }
            },
            buttons: [
                {
                    name: 'ok',
                    caption: 'OK',
                    isDefault: true
                }
            ]
        });            
    }

    /**
     * Zeigt ein Meldungsfenster mit OK-Schaltfläche und einem Info-Symbol
     * @param {String} caption
     * @param {String} msg
     * @param {Function} fn
     * @param {Object} context
     * @returns {undefined}
     */
    static info(caption, msg, fn, context) {
        if (kijs.isArray(msg)) {
            msg = this._convertArrayToHtml(msg);
        }

        this.show({
            caption: caption,
            msg: msg,
            fn: fn,
            context: context,
            icon: {
                iconChar: '&#xf05a',
                style: {
                    color: '#4398dd'
                }
            },
            buttons: [
                {
                    name: 'ok',
                    caption: 'OK',
                    isDefault: true
                }
            ]
        });            
    }

    /**
     * Zeigt ein individuelles Meldungsfenster
     * Beispiel config:
     * config = {
     *     caption = 'Testmeldung',
     *     msg = 'Hallo Welt!'
     *     fn = function(e, el) {
     *         alert('Es wurde geklickt auf: ' . e.btn);
     *     },
     *     context: this,
     *     iconChar: '',
     *     icon: {
     *         iconChar: '&#xf071',
     *         style: {
     *             color: '#ff9900'
     *         }
     *     }
     *     buttons: [
     *         {
     *             name: 'ok',
     *             caption: 'OK'
     *         },{
     *             name: 'cancel',
     *             caption: 'Abbrechen'
     *         }
     *     ]
     * }
     * @param {Object} config
     * @returns {undefined}
     */
    static show(config) {
        let btn = 'none';
        const elements = [];
        const footerElements = [];

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

        // Buttons
        kijs.Array.each(config.buttons, function(button) {
            if (!(button instanceof kijs.gui.Button)) {
                button.xtype = 'kijs.gui.Button';
                if (!button.on) {
                    button.on = {};
                }
                if (!button.on.click) {
                    button.on.click = function() {
                        btn = button.name;
                        this.upX('kijs.gui.Window').destruct();
                    };
                }
            }

            footerElements.push(button);
        }, this);

        // Fenster erstellen
        const win = new kijs.gui.Window({
            caption: config.caption,
            iconChar: config.iconChar ? config.iconChar : '',
            collapsible: false,
            resizable: false,
            maximizable: false,
            modal: true,
            cls: 'kijs-msgbox',
            elements: elements,
            footerElements: footerElements
        });

        // Listener
        if (config.fn) {
            win.on('destruct', function(e){
                e.btn = btn;
                config.fn.call(config.context, e);
            });
        }

        // Fenster anzeigen
        win.show();
    }


    /**
     * Zeigt ein Meldungsfenster mit OK/Abbrechen-Schaltflächen und einem Achtung-Symbol
     * @param {String} caption
     * @param {String} msg
     * @param {Function} fn
     * @param {Object} context
     * @returns {undefined}
     */
    static warning(caption, msg, fn, context) {
        if (kijs.isArray(msg)) {
            msg = this._convertArrayToHtml(msg);
        }

        this.show({
            caption: caption,
            msg: msg,
            fn: fn,
            context: context,
            icon: {
                iconChar: '&#xf071',
                style: {
                    color: '#ff9900'
                }
            },
            buttons: [
                {
                    name: 'ok',
                    caption: 'OK',
                    isDefault: true
                },{
                    name: 'cancel',
                    caption: 'Abbrechen'
                }
            ]
        });            
    }


    // PROTECTED
    static _convertArrayToHtml(messages) {
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

};