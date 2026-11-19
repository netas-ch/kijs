/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.grid.cell.Number
// --------------------------------------------------------------
/**
 * Zelle für Zahlen in kijs.gui.grid.Grid (siehe kijs.gui.grid.columnConfig.Number). Zahlen werden mit
 * kijs.Number.format() formatiert, mit unitBefore/unitAfter ergänzt und je nach numberStyles gestaltet.
 */
kijs.gui.grid.cell.Number = class kijs_gui_grid_cell_Number extends kijs.gui.grid.cell.Cell {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        // value
        this._numValue = null;

        // Nummer-Einstellungen
        this._decimalPrecision = null;
        this._decimalSeparator = '.';
        this._thousandsSeparator = '\'';

        this._numberStyles = [];
        this._unitBefore = '';
        this._unitAfter = '';

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            cls: 'kijs-grid-cell-number'
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            decimalPrecision: true,     // {Number|null} Anzahl Nachkommastellen. null = unverändert
            decimalSeparator: true,     // {String} Dezimaltrennzeichen. Default: '.'
            thousandsSeparator: true,   // {String} Tausendertrennzeichen. Default: "'"
            numberStyles: {target: 'numberStyles'},
            unitBefore: true,           // {String} Text vor der Zahl, z.B. 'CHF '
            unitAfter: true             // {String} Text nach der Zahl, z.B. ' %'
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
     * CSS-Styles je nach Wert: Array mit Objekten {from, to, …Styles}, z.B.
     * [{ to: -0.01, color: 'red' }]. Fehlt from bzw. to, gilt keine Grenze.
     * @type {Object[]}
     */
    get numberStyles() { return this._numberStyles; }
    set numberStyles(val) {
        if (!kijs.isArray(val)) {
            val = [val];
        }
        this._numberStyles = val;
    }

    /**
     * Wert als Zahl (bzw. unverändert, wenn er keine Zahl ist)
     * @type {Number|String|null}
     */
    get value() { return this._numValue; }
    set value(val) { super.value = val; }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // overwrite
    setValue(value, silent=false, markDirty=true, updateDataRow=true) {
        let num = parseFloat(value);
        if (kijs.isNumber(num)) {
            this._numValue = num;
        } else {
            this._numValue = value;
        }

        super.setValue(this._numValue, silent, markDirty, updateDataRow);
    }


    // PROTECTED
    // Overwrite
    _getEditorArgs() {
        let eArgs = super._getEditorArgs();

        eArgs.allowDecimals = this._decimalPrecision > 0;
        eArgs.alwaysDisplayDecimals = this._decimalPrecision > 0;
        eArgs.decimalPrecision = this._decimalPrecision;
        eArgs.decimalSeparator = this._decimalSeparator;
        eArgs.thousandsSeparator = this._thousandsSeparator;

        return eArgs;
    }
    
    /**
     * Gibt den Style für eine Nummer zurück
     * @param {Number} number
     * @returns {Object}
     */
    _getNumberStyle(number) {
        let style = {};

        kijs.Array.each(this._numberStyles, function(numberStyle) {
            let from = kijs.isNumber(numberStyle.from) ? numberStyle.from : Number.MIN_SAFE_INTEGER,
                to = kijs.isNumber(numberStyle.to) ? numberStyle.to : Number.MAX_SAFE_INTEGER;

            if (number >= from && number <= to) {
                for (let key in numberStyle) {
                    if (key !== 'from' && key !== 'to') {
                        style[key] = numberStyle[key];
                    }
                }
            }
        }, this);

        return style;
    }

    /**
     * Zahl rendern
     * @param {String|Number} value
     * @returns {undefined}
     */
    _setDomHtml(value) {
        let num = parseFloat(value);

        if (kijs.isNumber(num)) {
            this._dom.html = this._unitBefore + kijs.Number.format(num, this._decimalPrecision, this._decimalSeparator, this._thousandsSeparator) + this._unitAfter;

            // styles anwenden
            let numberStyle = this._getNumberStyle(num);
            for (let styleKey in numberStyle) {
                this._dom.style[styleKey] = numberStyle[styleKey];
            }

        } else if (value) {
            this._dom.html = this._unitBefore + kijs.toString(value) + this._unitAfter;

        } else {
            this._dom.html = value;
        }
    }

};