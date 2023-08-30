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
     * @returns {Promise}
     */
    static alert(caption, msg, fn, context) {
        if (kijs.isArray(msg)) {
            msg = this._convertArrayToHtml(msg);
        }

        return this.show({
            caption: caption,
            msg: msg,
            closable: true,
            fn: fn,
            context: context,
            buttons: [
                {
                    name: 'ok',
                    caption: kijs.getText('OK'),
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
     * @returns {Promise}
     */
    static confirm(caption, msg, fn, context) {
        if (kijs.isArray(msg)) {
            msg = this._convertArrayToHtml(msg);
        }

        return this.show({
            caption: caption,
            msg: msg,
            closable: true,
            fn: fn,
            context: context,
            icon: {
                iconMap: 'kijs.iconMap.Fa.circle-question',
                iconColor: '#4398dd'
            },
            buttons: [
                {
                    name: 'yes',
                    caption: kijs.getText('Ja')
                },{
                    name: 'no',
                    caption: kijs.getText('Nein')
                }
            ]
        });
    }

    /**
     * Zeigt ein Meldungsfenster mit OK-Schaltfläche und einem "unerwarteten Fehler"-Symbol
     * @param {String} caption
     * @param {String} msg
     * @param {Function} fn
     * @param {Object} context
     * @returns {Promise}
     */
    static error(caption, msg, fn, context) {
        if (kijs.isArray(msg)) {
            msg = this._convertArrayToHtml(msg);
        }

        return this.show({
            caption: caption,
            msg: msg,
            closable: true,
            fn: fn,
            context: context,
            icon: {
                iconMap: 'kijs.iconMap.Fa.circle-exclamation',
                iconColor: '#be6280'
            },
            buttons: [
                {
                    name: 'ok',
                    caption: kijs.getText('OK'),
                    isDefault: true
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
     * @returns {Promise}
     */
    static errorNotice(caption, msg, fn, context) {
        if (kijs.isArray(msg)) {
            msg = this._convertArrayToHtml(msg);
        }

        return this.show({
            caption: caption,
            msg: msg,
            closable: true,
            fn: fn,
            context: context,
            icon: {
                iconMap: 'kijs.iconMap.Fa.triangle-exclamation',
                iconColor: '#be6280'
            },
            buttons: [
                {
                    name: 'ok',
                    caption: kijs.getText('OK'),
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
     * @returns {Promise}
     */
    static info(caption, msg, fn, context) {
        if (kijs.isArray(msg)) {
            msg = this._convertArrayToHtml(msg);
        }

        return this.show({
            caption: caption,
            msg: msg,
            closable: true,
            fn: fn,
            context: context,
            icon: {
                iconMap: 'kijs.iconMap.Fa.circle-info',
                iconColor: '#4398dd'
            },
            buttons: [
                {
                    name: 'ok',
                    caption: kijs.getText('OK'),
                    isDefault: true
                }
            ]
        });
    }

    /**
     * Zeigt ein Eingabefenster mit OK/Abbrechen-Schaltflächen und einem Achtung-Symbol
     * @param {String} caption
     * @param {String} msg
     * @param {String} label
     * @param {String} value
     * @param {Function} fn
     * @param {Object} context
     * @returns {Promise}
     */
    static prompt(caption, msg, label, value, fn, context) {
        if (kijs.isArray(msg)) {
            msg = this._convertArrayToHtml(msg);
        }

        return this.show({
            caption: caption,
            msg: msg,

            closable: true,
            fieldConfig: {
                xtype: 'kijs.gui.field.Text',
                label: label,
                value: value
            },

            fn: fn,
            context: context,
            icon: {
                iconMap: 'kijs.iconMap.Fa.circle-question',
                iconColor: '#4398dd'
            },
            buttons: [
                {
                    name: 'ok',
                    caption: kijs.getText('OK'),
                    isDefault: true
                },{
                    name: 'cancel',
                    caption: kijs.getText('Abbrechen')
                }
            ]
        });
    }

    /**
     * Zeigt ein individuelles Meldungsfenster
     * Beispiel config:
     * config = {
     *     caption: 'Testmeldung',
     *     msg: 'Hallo Welt!',
     *
     *     closable: true, // Soll das Fenster ein X zum Schliessen haben?
     *
     *     //Falls ein Input-Field gewünscht wird, können in einem Objekt die 
     *     // Eigenschaften des Fields angegeben werden:
     *     fieldConfig: {
     *         xtype: 'kijs.gui.field.Text',
     *         label: 'Wert',
     *         value: 'Mein Testwert'
     *     }
     *
     *     fn: function(e, el) {
     *         alert('Es wurde geklickt auf: ' + e.btn);
     *     },
     *     context: this,
     *     iconMap: '',
     *     icon: {
     *         iconMap: 'kijs.iconMap.Fa.circle-question',
     *         style: {
     *             color: '#ff9900'
     *         }
     *     },
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
     * @returns {Promise}
     */
    static show(config) {
        return new Promise((resolve) => {
            let btn = 'none';
            let value = null;
            const elements = [];
            const footerElements = [];

            // Icon
            if (config.icon) {
                if (!(config.icon instanceof kijs.gui.Icon)) {
                    config.icon.xtype = 'kijs.gui.Icon';
                }
                elements.push(config.icon);
            }
            
            // Benutzerdefiniertes Feld aus fieldConfig
            if (config.fieldConfig && config.fieldConfig.xtype) {
                
                // Konstruktor ermitteln
                const constr = kijs.getObjectFromString(config.fieldConfig.xtype);
                if (!kijs.isFunction(constr)) {
                    throw new kijs.Error(`Unknown xtype "${config.fieldConfig.xtype}".`);
                }

                // fixe Properties
                config.fieldConfig.name = 'field';
                
                // Field erstellen
                const fld = new constr(config.fieldConfig);
                fld.on('enterPress', (e) => {
                    btn = 'ok';
                    value = fld.value;
                    fld.upX('kijs.gui.Window').destruct();
                });
                
                // Container mit Beschrieb und Field
                elements.push(new kijs.gui.Container(
                    {
                        htmlDisplayType: 'html',
                        cls: 'kijs-msgbox-inner',
                        elements:[
                            {
                                xtype: 'kijs.gui.Element',
                                html: config.msg,
                                htmlDisplayType: 'html',
                                style: {
                                    marginBottom: '4px'
                                }
                            },
                            fld
                        ]
                    }
                ));
                
            // nur ein Element mit Html
            } else {
                elements.push({
                    xtype: 'kijs.gui.Element',
                    html: config.msg,
                    htmlDisplayType: 'html',
                    cls: 'kijs-msgbox-inner'
                });
                
            }
            
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
                            if (config.fieldConfig && config.fieldConfig.xtype) {
                                const fld = this.upX('kijs.gui.Window').down('field');
                                value = fld.value;

                                if (!fld.validate()) {
                                    return;
                                }
                            }

                            this.upX('kijs.gui.Window').destruct();
                        };
                    }
                }

                footerElements.push(button);
            }, this);

            // Fenster erstellen
            const win = new kijs.gui.Window({
                caption: kijs.isEmpty(config.caption) ? ' ' :  config.caption,
                iconMap: config.iconMap ? config.iconMap : '',
                closable: config.hasOwnProperty('closable') ? !!config.closable : true,
                collapsible: false,
                resizable: false,
                maximizable: false,
                modal: true,
                cls: 'kijs-msgbox',
                elements: elements,
                footerElements: footerElements,
                moveWhenVirtualKeyboard: true
            });

            // Listener
            win.on('destruct', function(e){
                e.btn = btn;
                e.value = value;
                if (config.fn) {
                    config.fn.call(config.context, e);
                }

                // Promise auflösen
                resolve(e);
            });

            // Fenster anzeigen
            win.show();
        });
    }

    /**
     * Zeigt ein Meldungsfenster mit OK/Abbrechen-Schaltflächen und einem Achtung-Symbol
     * @param {String} caption
     * @param {String} msg
     * @param {Function} fn
     * @param {Object} context
     * @returns {Promise}
     */
    static warning(caption, msg, fn, context) {
        if (kijs.isArray(msg)) {
            msg = this._convertArrayToHtml(msg);
        }

        return this.show({
            caption: caption,
            msg: msg,
            closable: true,
            fn: fn,
            context: context,
            icon: {
                iconMap: 'kijs.iconMap.Fa.circle-exclamation',
                iconColor: '#ff9900'
            },
            buttons: [
                {
                    name: 'ok',
                    caption: kijs.getText('OK'),
                    isDefault: true
                },{
                    name: 'cancel',
                    caption: kijs.getText('Abbrechen')
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