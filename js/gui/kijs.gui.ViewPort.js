/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.ViewPort
// --------------------------------------------------------------
kijs.gui.ViewPort = class kijs_gui_ViewPort extends kijs.gui.Container {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        this._dom.node = document.body;

        this._dom.clsRemove('kijs-container');
        this._dom.clsAdd('kijs-viewport');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            disableDrop: true,
            disableContextMenu: false
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            disableDrop: { target: 'disableDrop' },
            disableContextMenu: { target: 'disableContextMenu' }
        });

        // onResize überwachen
        kijs.Dom.addEventListener('resize', window, this._onWindowResize, this);

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }
    }

    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------

    set disableContextMenu(val) {
        if (val === true) {
            // Standardmässig öffnet der Browser das Kontextmenu
            kijs.Dom.addEventListener('contextmenu', document.body, function(e) {
                e.nodeEvent.preventDefault();
            }, this);

        } else if (val === false) {
            kijs.Dom.removeEventListener('contextmenu', document.body, this);

        } else {
           throw new kijs.Error('invalid value for property "disableContextMenu" in kijs.gui.ViewPort');
        }
    }

    get disableContextMenu() {
        return kijs.Dom.hasEventListener('contextmenu', document.body, this);
    }

    set disableDrop(val) {
        if (val === true) {
            // Standardmässig öffnet der Browser das Dokument, wenn
            // es über einer Webseite verschoben wird. Mittels preventDefault
            // wird sichergestellt, dass in diesem Fall nichts passiert.
            kijs.Dom.addEventListener('dragover', window, function(e) {
                e.nodeEvent.preventDefault();
            }, this);
            kijs.Dom.addEventListener('drop', window, function(e) {
                e.nodeEvent.preventDefault();
            }, this);

        } else if (val === false) {
            kijs.Dom.removeEventListener('dragover', window, this);
            kijs.Dom.removeEventListener('drop', window, this);

        } else {
           throw new kijs.Error('invalid value for property "disableDrop" in kijs.gui.ViewPort');
        }
    }

    get disableDrop() {
        return kijs.Dom.hasEventListener('dragover', window, this) && kijs.Dom.hasEventListener('drop', window, this);
    }

    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // overwrite
    render(superCall) {
        super.render(true);

        // innerDOM Rendern
        this._innerDom.render();
        this._dom.node.appendChild(this._innerDom.node);

        // elements im innerDOM rendern
        kijs.Array.each(this._elements, function(el) {
            el.renderTo(this._innerDom.node);
        }, this);

        // Event afterRender auslösen
        if (!superCall) {
            this.raiseEvent('afterRender');
        }

        // afterResize-Event zeitversetzt auslösen
        this._raiseAfterResizeEvent(true);
    }


    // PROTECTED
    _onWindowResize(e) {
        this._raiseAfterResizeEvent(true, e);
    }


    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(superCall) {
        if (!superCall) {
            // unrender
            this.unrender(superCall);

            // Event auslösen.
            this.raiseEvent('destruct');
        }

        // Node-Event Listener auf Window entfernen
        kijs.Dom.removeEventListener('resize', window, this);

        // Basisklasse auch entladen
        super.destruct(true);
    }

};
