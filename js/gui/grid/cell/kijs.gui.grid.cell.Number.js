/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.grid.cell.Number
// --------------------------------------------------------------
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
            decimalPrecision: true,
            decimalSeparator: true,
            thousandsSeparator: true,
            numberStyles: {target: 'numberStyles'},
            unitBefore: true,
            unitAfter: true
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }
    }



    // --------------------------------------------------------------
    // GETTER/SETTER
    // --------------------------------------------------------------
    get numberStyles() { return this._numberStyles; }
    set numberStyles(val) {
        if (!kijs.isArray(val)) {
            val = [val];
        }
        this._numberStyles = val;
    }

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