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
                    caption: kijs.getText('Ja')
                },{
                    name: 'no',
                    caption: kijs.getText('Nein')
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
     * @returns {undefined}
     */
    static prompt(caption, msg, label, value, fn, context) {
        if (kijs.isArray(msg)) {
            msg = this._convertArrayToHtml(msg);
        }

        this.show({
            caption: caption,
            msg: msg,
            
            fieldXtype: 'kijs.gui.field.Text',
            label: label,
            value: value, 
            
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
     *     // Falls ein Input gewünscht wird, können noch folgende Eigenschaften verwendet werden:
     *     fieldXtype: 'kijs.gui.field.Text',
     *     label: 'Wert',
     *     value: 'Mein Testwert', 
     *     
     *     fn: function(e, el) {
     *         alert('Es wurde geklickt auf: ' + e.btn);
     *     },
     *     context: this,
     *     iconChar: '',
     *     icon: {
     *         iconChar: '&#xf071',
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
     * @returns {undefined}
     */
    static show(config) {
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
        
        if (config.fieldXtype) {
            // Beschrieb und Textfeld
            elements.push({
                xtype: 'kijs.gui.Container',
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
                    },{
                        xtype: config.fieldXtype,
                        name: 'field',
                        label: config.label,
                        value: config.value,
                        labelStyle: {
                            marginRight: '4px'
                        },
                        on: {
                            enterPress: function(e) {
                                if (config.fieldXtype) {
                                    btn = 'ok';
                                    value = e.element.upX('kijs.gui.Window').down('field').value;
                                    e.element.upX('kijs.gui.Window').destruct();
                                }
                            },
                            context: this
                        }
                    }
                ]
            });
            
        } else {
            // Text
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
                        if (config.fieldXtype) {
                            value = this.upX('kijs.gui.Window').down('field').value;
                        }
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
                e.value = value;
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