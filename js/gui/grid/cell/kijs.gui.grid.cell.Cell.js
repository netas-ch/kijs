/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.grid.cell.Cell (Abstract)
// --------------------------------------------------------------
/**
 * EVENTS
 * ----------
 *
 */
kijs.gui.grid.cell.Cell = class kijs_gui_grid_cell_Cell extends kijs.gui.Element {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        // DOM type
        this._dom.nodeTagName = 'td';

        this._originalValue = null;
        this._columnConfig = null;
        this._cellEditor = null;
        this._cellEditorValue = null;

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            htmlDisplayType: 'code'
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            columnConfig: true
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }

        // Events
        this._dom.on('dblClick', this._onDblClick, this);
        this._dom.on('click', this._onClick, this);
    }

    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------

    get columnConfig() { return this._columnConfig; }
    set columnConfig(val) { this._columnConfig = val; }

    get isDirty() { return kijs.toString(this._originalValue) !== kijs.toString(this.value); }
    set isDirty(val) {
        if (val === false) {
            this._originalValue = kijs.toString(this.value);
            this._dom.clsRemove('kijs-grid-cell-dirty');
        } else {
            this._originalValue = null;
            this._dom.clsAdd('kijs-grid-cell-dirty');
        }
    }

    get originalValue() { return this._originalValue; }

    get row() { return this.parent; }

    get rowIndex() { return this.row.rowIndex; }
    get cellIndex() { return this.row.grid.columnConfigs.indexOf(this._columnConfig); }

    get value() { return this._dom.html; }
    set value(val) { this.setValue(val); }


    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------

    /**
     * Setzt den Wert auf den Standardwert zurück
     * @param {Boolean} [silent=false] true, falls kein change-event ausgelöst werden soll.
     * @returns {undefined}
     */
    resetValue(silent=false) {
        this.setValue(this.originalValue, silent);
    }

    /**
     * Setzt das Display-Value der Zelle.
     * @param {String} value
     * @param {Boolean} [silent=false] true, falls kein change-event ausgelöst werden soll.
     * @param {Boolean} [markDirty=true] false, falls der Eintrag nicht als geändert markiert werden soll.
     * @param {Boolean} [updateDataRow=true] false, falls die dataRow nicht aktualisiert werden soll.
     * @returns {undefined}
     */
    setValue(value, silent=false, markDirty=true, updateDataRow=true) {
        let changed = kijs.toString(value) !== kijs.toString(this._dom.html);

        // HTML aktualisieren
        this._setDomHtml(value);

        // dataRow aktualisieren
        if (updateDataRow) {
            this._writeDisplayValueToRow(value);
        }

        if (!markDirty) {
            this.isDirty = false;
        }

        // change event bei cell, row und grid aufrufen.
        if (!silent && changed) {
            this.raiseEvent('change', {value: value, valueDisplay: value});
            this.row.raiseEvent('change', {value: value, valueDisplay: value, cell: this});
            this.row.grid.raiseEvent('change', {value: value, valueDisplay: value, row: this.row, cell: this});
        }

        if (this.isRendered) {
            this.render();
        }
    }

    /**
     * Lädt das value von der dataRow
     * @returns {undefined}
     */
    loadFromDataRow() {
        let dF = this._columnConfig.displayField;
        if (this.row && this.row.dataRow && kijs.isDefined(this.row.dataRow[dF])) {
            this.setValue(this.row.dataRow[dF], true, false, false);
        }
    }

    startCellEdit() {
        if (this._columnConfig.editorXtype) {
            // editor starten
            let editor = kijs.getClassFromXtype(this._columnConfig.editorXtype);

            if (!editor) {
                throw new kijs.Error('invalid xtype for cell editor');
            }

            let eArgs = this._getEditorArgs();
            if (kijs.isObject(this._columnConfig.editorConfig)) {
                eArgs = Object.assign(eArgs, this._columnConfig.editorConfig);
            }

            // value speichern, um Änderungen nachzuverfolgen
            this._cellEditorValue = eArgs.value;

            this._cellEditor = new editor(eArgs);

            // Nach dem rendern den focus aufs Feld legen, damit beim blur der Editor wieder geschlossen wird.
            this._cellEditor.on('afterRender', function() {
                kijs.defer(function() {
                    this._cellEditor.focus(false, true);
                }, 100, this);
            }, this);

            // Inhalt Löschen und Textfeld in dom rendern
            kijs.Dom.removeAllChildNodes(this._dom.node);
            this._cellEditor.renderTo(this._dom.node);

            this.dom.clsAdd('kijs-celledit');

            // Event auf dem Grid aufrufen
            this.row.grid.raiseEvent('startCellEdit', {cell: this});

            // falls bei einer anderen cell der edit gestartet wird, diesen hier beenden
            this.row.grid.once('startCellEdit', function(e) {
                if (e.cell !== this) {
                    this.stopCellEdit();
                }
            }, this);
        }
    }

    stopCellEdit(cancelEdit=false) {
        if (this._cellEditor) {

            // value lesen und Editor schliessen
            let val = this._cellEditor.value,
                valDsp = this._cellEditor.valueDisplay,
                valDspHtml = this._cellEditor.valueDisplayHtml;

            this._cellEditor.unrender();
            this._cellEditor = null;

            this.dom.clsRemove('kijs-celledit');

            if (cancelEdit) {
                this.setValue(this.value, true, false, false);

            } else {

                // in Row setzen
                let dtRw = this.row.dataRow;

                if (kijs.isObject(dtRw)) {
                    dtRw[this._columnConfig.valueField] = val;

                    // falls der Wert eines abweichenden Displayfield gespeichert werden soll.
                    if (this._columnConfig.displayField !== this._columnConfig.valueField) {
                        dtRw[this._columnConfig.displayField] = this.htmlDisplayType === 'html' ? valDspHtml : valDsp;
                    }
                }

                // Cell-Value setzen
                // wird mit silent aufgerufen, damit der Event separat aufgerufen und valueDisplay mitgegeben werden kann.
                if (this.htmlDisplayType === 'html') {
                    this.setValue(valDspHtml, true, true, false);
                } else {
                    this.setValue(valDsp, true, true, false);
                }

                // Event auf dem Grid aufrufen
                this.row.grid.raiseEvent('stopCellEdit', {cell: this});

                // Änderung: Event aufrufen
                if (kijs.toString(val) !== kijs.toString(this._cellEditorValue)) {
                    this.raiseEvent('change', {value: val, valueDisplay: valDsp});
                    this.row.raiseEvent('change', {value: val, valueDisplay: valDsp, cell: this});
                    this.row.grid.raiseEvent('change', {value: val, valueDisplay: valDsp, row: this.row, cell: this});
                }
                this._cellEditorValue = null;
            }
        }
    }

    // PROTECTED

    /**
     * Argumente, welche dem Editor beim Instanzieren übergeben werden.
     * @returns {Object}
     */
    _getEditorArgs() {
        return {
            labelHide: true,
            value: this.row.dataRow[this._columnConfig.valueField],
            parent: this,
            on: {
                blur: this._onFieldBlur,
                keyDown: this._onFieldKeyDown,
                click: function(e) { e.nodeEvent.stopPropagation(); }, // click event stoppen, damit row focus nicht nimmt.
                context: this
            }
        };
    }

    /**
     * Setzt das HTML im DOM. Kann in abgeleiteter Klasse überschrieben werden,
     * falls ein anderer Wert angezeigt werden soll als das Value.
     * @param {String} value
     * @returns {undefined}
     */
    _setDomHtml(value) {
        this._dom.html = value;
    }

    /**
     * Schreibt das value zurück in die DataRow
     * @param {String} value
     * @returns {undefined}
     */
    _writeDisplayValueToRow(value) {
        let vF = this._columnConfig.displayField;
        if (this.row) {
            this.row.dataRow[vF] = value;
        }
    }

    // EVENTS

    _onClick() {
        if (this._columnConfig.editable && !this._cellEditor && this._columnConfig.clicksToEdit === 1) {
            this.startCellEdit();
        }
    }

    _onDblClick() {
        if (this._columnConfig.editable && !this._cellEditor && this._columnConfig.clicksToEdit === 2) {
            this.startCellEdit();
        }
    }

    _onFieldBlur() {
        kijs.defer(function() {
            this.stopCellEdit();
        }, 200, this);
    }

    _onFieldKeyDown(e) {
        // keyDown event stoppen, damit grid keyDown nicht nimmt.
        e.nodeEvent.stopPropagation();

        // Mit Tab-Taste ins nächste editierbare Feld springen.
        if (e.nodeEvent.key === 'Tab' && e.nodeEvent.ctrlKey === false) {
            this.stopCellEdit();
            this.row.grid.startCellEdit(this, e.nodeEvent.shiftKey === true);

        } else if (e.nodeEvent.key === 'Enter') {
            this.stopCellEdit();
            this.row.grid.startCellEdit([this.rowIndex+1, this.cellIndex]);

        } else if (e.nodeEvent.key === 'Escape') {
            this.stopCellEdit(true);
            this.row.focus();
        }
    }


    // Overwrite
    render(superCall) {
        super.render(true);

        // breite
        this._dom.width = this._columnConfig.width;

        // sichtbar?
        this.visible = this._columnConfig.visible;

        // Editable-Zeilen: Klasse hinzufügen
        if (this._columnConfig.editable) {
            this._dom.clsAdd('kijs-grid-cell-editable');
        } else {
            this._dom.clsRemove('kijs-grid-cell-editable');
        }

        // Dirty-Zeilen: Klasse hinzufügen
        if (this.isDirty) {
            this._dom.clsAdd('kijs-grid-cell-dirty');
        } else {
            this._dom.clsRemove('kijs-grid-cell-dirty');
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

        if (this._cellEditor) {
            this._cellEditor.unrender();
            this._cellEditor = null;
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
