/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.dataView.element.Base
// --------------------------------------------------------------
/**
 * Basisklasse für ein Element (einen Datensatz) in kijs.gui.DataView. Abgeleitete Klassen erstellen
 * den Inhalt in update(). Der Typ wird mit elementXType der DataView bestimmt.
 */
kijs.gui.dataView.element.Base = class kijs_gui_dataView_element_Base extends kijs.gui.Container {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        this._dataRow = {};     // Verweis auf den Data-Datensatz
        this._primaryKey = null; // PrimaryKey-String

        this._dom.clsRemove('kijs-container');
        this._dom.clsAdd('kijs-dataview-element');
        this._dom.htmlDisplayType = 'html';

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            dataRow: { target: 'dataRow', prio: 1000 },
            selected: { target: 'selected' }
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
     * Datensatz des Elements. Beim Setzen wird primaryKey aus den primaryKeyFields der DataView berechnet.
     * @type {Object}
     */
    get dataRow() { return this._dataRow; }
    set dataRow(val) {
        this._dataRow = val;
        this._primaryKey = kijs.Data.getPrimaryKeyString(this._dataRow, this._parentEl.primaryKeyFields);
    }

    /**
     * primaryKey, falls die DataView primaryKeyFields hat, sonst dataRow
     * @type {String|Object}
     */
    get keyRow() {
        if (this._parentEl.primaryKeyFields) {
            return this.primaryKey;
        } else {
            return this.dataRow;
        }
    }

    /**
     * Primärschlüssel als String (siehe kijs.Data.getPrimaryKeyString())
     * @type {String|null}
     */
    get primaryKey() { return this._primaryKey; }

    /**
     * Ist das Element selektiert? Beim Setzen wird auch selectedKeysRows der DataView angepasst.
     * @type {Boolean}
     */
    get selected() { return this._dom.clsHas('kijs-selected'); }
    set selected(val) {
        if (val) {
            this._dom.clsAdd('kijs-selected');

            if (!kijs.isEmpty(this._parentEl.primaryKeyFields)) {
                this._parentEl.selectedKeysRows.push(this.primaryKey);
            } else {
                this._parentEl.selectedKeysRows.push(this.dataRow);
            }

        } else {
            this._dom.clsRemove('kijs-selected');

            if (!kijs.isEmpty(this._parentEl.primaryKeyFields)) {
                kijs.Array.remove(this._parentEl.selectedKeysRows, this.primaryKey);
            } else {
                kijs.Array.remove(this._parentEl.selectedKeysRows, this.dataRow);
            }

        }
    }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    /**
     * Erstellt den Inhalt.
     * Diese Funktion muss überschrieben werden.
     * @returns {undefined}
     */
    update() {

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

        // Variablen (Objekte/Arrays) leeren
        this._dataRow = null;

        // Basisklasse entladen
        super.destruct(true);
    }

};
