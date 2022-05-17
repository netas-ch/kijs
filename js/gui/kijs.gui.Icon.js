/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.Icon
// --------------------------------------------------------------
kijs.gui.Icon = class kijs_gui_Icon extends kijs.gui.Element {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        this._iconCls = null;
        this._iconSize = null;

        this._dom.nodeTagName = 'span';
        this._dom.clsAdd('kijs-icon');
        this._dom.htmlDisplayType = 'code';

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            disabled: { target: 'disabled' },
            iconChar: { target: 'iconChar' },
            iconCls: { target: 'iconCls' },
            iconColor: { target: 'iconColor' },
            iconSize: { target: 'iconSize', prio: 2 }
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
    get disabled() { return this._dom.clsHas('kijs-disabled'); }
    set disabled(val) {
        if (val) {
            this._dom.clsAdd('kijs-disabled');
        } else {
            this._dom.clsRemove('kijs-disabled');
        }
        this._dom.disabled = !!val;
    }

    get iconChar() {
        let chr = kijs.toString(this._dom.html);
        if (chr.length === 1) {
            return '&#x' + chr.codePointAt(0).toString(16);
        }
        return chr;
    }
    set iconChar(val) { this._dom.html = kijs.String.htmlentities_decode(val); }

    get iconCls() { return this._iconCls; }
    set iconCls(val) {
        if (kijs.isEmpty(val)) {
            val = null;
        }
        if (!kijs.isString && !val) {
            throw new kijs.Error(`config "iconCls" is not a string`);
        }
        if (this._iconCls) {
            this._dom.clsRemove(this._iconCls);
        }
        this._iconCls = val;
        if (this._iconCls) {
            this._dom.clsAdd(this._iconCls);
        }
    }

    get iconColor() { return this._dom.style.color; }
    set iconColor(val) { this._dom.style.color = val; }

    get isEmpty() {
        return kijs.isEmpty(this._dom.html) && kijs.isEmpty(this._iconCls);
    }

    get iconSize() { return this._iconSize; }
    set iconSize(val) {
        if (val && !kijs.isInteger(val)) {
            throw new kijs.Error(`invalid value for kijs.gui.Icon attribute: iconSize=` + val);
        }
        this._iconSize = val;

        // Buchstaben-Grösse mittels fontSize festlegen
        if (this.iconChar) {
            if (val === 16 || !val) { // 16: default css size
                this.style.fontSize = null;
            } else {
                this.style.fontSize = val + 'px';
            }

        // icon-Grösse mittels w&h festlegen
        } else if (this.iconCls) {
            if (!val) {
                this.style.width = null;
                this.style.height = null;
                this.style.backgroundSize = null;
            } else {
                this.style.width = val + 'px';
                this.style.height = val + 'px';
                this.style.backgroundSize = val + 'px ' + val + 'px';
            }
        }
    }
};
