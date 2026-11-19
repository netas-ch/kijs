/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.field.Range
// --------------------------------------------------------------

// TODO: Besser direkt von kijs.gui.field.Field erben?
// TODO: Vertikale Schieber?
// TODO: Wert anzeigen
// TODO: der default von disableFlex sollte false sein

/**
 * Schieberegler (HTML input type="range") für ganze Zahlen zwischen min und max.
 * Defaults: min 0, max 100, step 1, value 50.
 *
 * @example
 * new kijs.gui.field.Range({ label: 'Lautstärke', min: 0, max: 10, value: 5 });
 */
kijs.gui.field.Range = class kijs_gui_field_Range extends kijs.gui.field.Text {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        this._inputDom.nodeAttributeSet('type', 'range');
        this._dom.clsRemove('kijs-field-text');
        this._dom.clsAdd('kijs-field-range');

         // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            clearButtonCls: '',
            min  : 0,
            max  : 100,
            step : 1,
            value: 50
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            min: { target: 'min' },
            max: { target: 'max' },
            step: { target: 'step' }
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
     * Ein Schieberegler ist nie leer
     * @type {Boolean}
     */
    // overwrite
    get isEmpty() { return false; }

    /**
     * Grösster Wert (Attribut max). Default: 100
     * @type {Number|String}
     */
    set max(val) { this._inputDom.nodeAttributeSet('max', val); }
    get max() { return this._inputDom.nodeAttributeGet('max'); }

    /**
     * Kleinster Wert (Attribut min). Default: 0
     * @type {Number|String}
     */
    set min(val) { this._inputDom.nodeAttributeSet('min', val); }
    get min() { return this._inputDom.nodeAttributeGet('min'); }

    /**
     * Schreibgeschützt. Weil input type="range" kein Attribut readOnly kennt, wird der
     * input-Node dafür deaktiviert.
     * @type {Boolean}
     */
    // overwrite
    get readOnly() { return super.readOnly; }
    set readOnly(val) {
        super.readOnly = !!val;
        if (val) {
            this._inputDom.disabled = true;
        } else {
            this._inputDom.disabled = false;
        }
    }

    /**
     * Schrittweite (Attribut step). Der Getter gibt sie als ganze Zahl zurück (parseInt). Default: 1
     * @type {Number}
     */
    set step(val) { this._inputDom.nodeAttributeSet('step', val); }
    get step() { return parseInt(this._inputDom.nodeAttributeGet('step')); }

    /**
     * Wert als ganze Zahl (parseInt)
     * @type {Number}
     */
    set value(val) { super.value = val; }
    get value() { return parseInt(super.value); }

};
