/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.field.Range
// --------------------------------------------------------------

// TODO: Besser direkt von kijs.gui.field.Field erben?
// TODO: Vertikale Schieber?
// TODO: Wert anzeigen
// TODO: der default von disableFlex sollte false sein

/**
 * EVENTS
 * ----------
 * blur
 * input
 *
 * // Geerbte Events
 * add
 * afterFirstRenderTo
 * afterRender
 * afterResize
 * beforeAdd
 * beforeRemove
 * changeVisibility
 * childElementAfterResize
 * dblClick
 * contextMenu
 * destruct
 * drag
 * dragEnd
 * dragLeave
 * dragOver
 * dragStart
 * drop
 * focus
 * mouseDown
 * mouseLeave
 * mouseMove
 * mouseUp
 * remove
 * wheel
 *
 * // key events
 * keyDown
 * enterPress
 * enterEscPress
 * escPress
 * spacePress
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
    // overwrite
    get isEmpty() { return false; }

    set max(val) { this._inputDom.nodeAttributeSet('max', val); }
    get max() { return this._inputDom.nodeAttributeGet('max'); }

    set min(val) { this._inputDom.nodeAttributeSet('min', val); }
    get min() { return this._inputDom.nodeAttributeGet('min'); }

    // overwrite
    // 'range' kennt das HTML-Attribut readOnly nicht,
    // darum disabled benutzen.
    get readOnly() { return super.readOnly; }
    set readOnly(val) {
        super.readOnly = !!val;
        if (val) {
            this._inputDom.disabled = true;
        } else {
            this._inputDom.disabled = false;
        }
    }

    set step(val) { this._inputDom.nodeAttributeSet('step', val); }
    get step() { return parseInt(this._inputDom.nodeAttributeGet('step')); }

    set value(val) { super.value = val; }
    get value() { return parseInt(super.value); }

};
