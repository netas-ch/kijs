/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.ViewPort
// --------------------------------------------------------------
/**
 * Container, der den ganzen Body (document.body) einnimmt. Basis jeder kijs-Oberfläche. Er
 * überwacht die Fenstergrösse (afterResize) und die Einstellung des Farbschemas des Betriebssystems.
 *
 * @example
 * const viewport = new kijs.gui.ViewPort({ cls: 'kijs-flexrow', elements: [ ... ] });
 * viewport.render();
 */
kijs.gui.ViewPort = class kijs_gui_ViewPort extends kijs.gui.Container {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        this._autoTheme = false;
        this._dom.node = document.body;

        this._dom.clsRemove('kijs-container');
        this._dom.clsAdd('kijs-viewport');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            disableDrop: true,
            disableContextMenu: false,
            theme: null
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            disableDrop: { target: 'disableDrop' },
            disableContextMenu: { target: 'disableContextMenu' },
            theme: { target: 'theme'}         // 'dark', 'light' oder null=auto oder ein benutzerdefiniertes Farbschema
        });

        // onResize überwachen
        kijs.Dom.addEventListener('resize', window, this.#onWindowResize, this);

        // dark mode change überwachen
        kijs.Dom.addEventListener('change', window.matchMedia('(prefers-color-scheme: dark)'), this.#onDarkModeChange, this);

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
     * Kontextmenü des Browsers auf dem Body unterdrücken? Nur true oder false, sonst kijs.Error. Default: false
     * @type {Boolean}
     */
    get disableContextMenu() {
        return kijs.Dom.hasEventListener('contextmenu', document.body, this);
    }
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

    /**
     * Verhindern, dass der Browser eine auf die Seite gezogene Datei öffnet? Gilt nur für Dateien
     * ausserhalb einer Ablagefläche (z.B. kijs.gui.DropZone): Dort zeigt der Browser an, dass nicht
     * abgelegt werden kann. Gezogener Text und kijs-Drag&Drop sind nicht betroffen.
     * Nur true oder false, sonst kijs.Error. Default: true
     * @type {Boolean}
     */
    get disableDrop() {
        return kijs.Dom.hasEventListener('dragover', window, this) && kijs.Dom.hasEventListener('drop', window, this);
    }
    set disableDrop(val) {
        if (val === true) {
            // Standardmässig öffnet der Browser eine Datei, die auf die Webseite gezogen
            // wird. Hat keine Ablagefläche das Event schon behandelt (preventDefault),
            // wird das hier verhindert.
            kijs.Dom.addEventListener('dragover', window, function(e) {
                if (this._isFileDrag(e.nodeEvent) && !e.nodeEvent.defaultPrevented) {
                    e.nodeEvent.preventDefault();
                    e.nodeEvent.dataTransfer.dropEffect = 'none';
                }
            }, this);
            kijs.Dom.addEventListener('drop', window, function(e) {
                if (this._isFileDrag(e.nodeEvent)) {
                    e.nodeEvent.preventDefault();
                }
            }, this);

        } else if (val === false) {
            kijs.Dom.removeEventListener('dragover', window, this);
            kijs.Dom.removeEventListener('drop', window, this);

        } else {
           throw new kijs.Error('invalid value for property "disableDrop" in kijs.gui.ViewPort');
        }
    }

    get theme() {
        return kijs.Dom.themeGet();
    }
    // Farbschema aktivieren. 'light', 'dark' oder null=auto oder ein benutzerdefiniertes Farbschema
    set theme(val) {
        kijs.Dom.themeSet(val);
        this._autoTheme = val === null;
        if (this.isRendered) {
            this.render();
        }
    }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // overwrite
    render(superCall) {
        super.render(true);

        // Event afterRender auslösen
        if (!superCall) {
            this.raiseEvent('afterRender');
        }

        // afterResize-Event auslösen
        this._raiseAfterResizeEvent(true);
    }


    // PROTECTED
    /**
     * Werden Dateien gezogen (nicht Text oder Elemente)?
     * @param {DragEvent} nodeEvent
     * @returns {Boolean}
     */
    _isFileDrag(nodeEvent) {
        const dt = nodeEvent.dataTransfer;
        return !!dt && kijs.Array.contains(Array.from(dt.types || []), 'Files');
    }


    // PRIVATE
    // LISTENERS
    #onDarkModeChange(e) {
        if (this._autoTheme) {
            this.theme = null; // set to null to get the current browser theme
        }
    }

    #onWindowResize(e) {
        this._raiseAfterResizeEvent(true, e);
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

        // Listener entfernen
        kijs.Dom.removeAllEventListenersFromContext(this);

        // Basisklasse auch entladen
        super.destruct(true);
    }

};
