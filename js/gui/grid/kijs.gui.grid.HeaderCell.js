/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.grid.HeaderCell
// --------------------------------------------------------------
/**
 * EVENTS
 * ----------
 *
 */
kijs.gui.grid.HeaderCell = class kijs_gui_grid_HeaderCell extends kijs.gui.Element {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        // DOM type
        this._dom.nodeTagName = 'td';
        this._columnConfig = null;

        // Standard-config-Eigenschaften mergen
        config = Object.assign({}, {
            // keine
        }, config);

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            columnConfig: true
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            this.applyConfig(config, true);
        }
    }

    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------

    get caption() { return this._dom.html; }
    set caption(val) { this.setCaption(val); }


    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------

    /**
     * Setzt das value der Zelle.
     * @param {String} value
     * @param {Boolean} [silent=false] true, falls kein change-event ausgelöst werden soll.
     * @param {Boolean} [markDirty=true] false, falls der Eintrag nicht als geändert markiert werden soll.
     * @param {Boolean} [updateDataRow=true] false, falls die dataRow nicht aktualisiert werden soll.
     * @returns {undefined}
     */
    setCaption(caption, updateColumnConfig=true) {
        // HTML aktualisieren
        this._dom.html = caption;

        if (updateColumnConfig) {
            this._columnConfig.caption = caption;
        }

        if (this.isRendered) {
            this.render();
        }
    }

    /**
     * Lädt das value von der dataRow
     * @returns {undefined}
     */
    loadFromColumnConfig() {
        let c = this._columnConfig.caption;
        this.setCaption(c, false);
    }

    // PROTECTED


    // LISTENER
    _onColumnConfigChange(e) {
        this.render();
    }

    // Overwrite
    render(superCall) {
        super.render(true);

        this._columnConfig.off('change', this._onColumnConfigChange, this);
        this._columnConfig.on('change', this._onColumnConfigChange, this);

        // breite
        this._dom.width = this._columnConfig.width;

        // sichtbar?
        this.visible = this._columnConfig.visible;

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

        super.unrender(true);
    }


    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(superCall) {
        if (!superCall) {
            // unrendern
            this.unrender(superCall);

            // Event auslösen.
            this.raiseEvent('destruct');
        }


        // Variablen (Objekte/Arrays) leeren


        // Basisklasse entladen
        super.destruct(true);
    }
};