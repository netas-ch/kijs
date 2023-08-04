/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.Icon
// --------------------------------------------------------------
kijs.gui.Icon = class kijs_gui_Icon extends kijs.gui.Element {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        this._iconCls = null;
        this._iconSize = null;
        this._iconMapName = null;

        this._dom.nodeTagName = 'span';
        this._dom.clsAdd('kijs-icon');
        this._dom.htmlDisplayType = 'code';

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            iconMap: { target: 'iconMap', prio: 1 },
            iconChar: { target: 'iconChar', prio: 2 },
            iconCls: { target: 'iconCls', prio: 2 },
            iconColor: { target: 'iconColor', prio: 2 },
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
    get iconChar() {
        let chr = kijs.toString(this._dom.html);
        if (chr.length > 0) {
            return chr.codePointAt(0);
        }
        return '';
    }
    set iconChar(val) {
        if (kijs.isString(val) && val.substr(0,2) === '&#') {
            console.warn('DEPRECATED: set iconChar with HTML entity instead of Number');
            val = kijs.String.htmlentities_decode(val).codePointAt(0);

        } else if (!kijs.isInteger(val)) {
            val = parseInt(val);
        }

        this._dom.html = kijs.isInteger(val) ? String.fromCodePoint(val) : '';
    }

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

    get iconMap() {
        let ret = {};
        if (this.iconChar) {
            ret.char = this.iconChar;
        }
        if (this.iconCls) {
            ret.cls = this.iconCls;
        }
        if (this.iconColor) {
            ret.color = this.iconColor;
        }
        if (this.iconStyle) {
            ret.style = this.iconStyle;
        }
        return ret;
    }
    set iconMap(val) {
        if (kijs.isString(val) && val) {
            const obj = kijs.getObjectFromString(val);
            if (kijs.isEmpty(obj)) {
                throw new kijs.Error(`Unknown iconMap "${val}".`);
            }
            this._iconMapName = val;
            val = obj;
        } else {
            this._iconMapName = null;
        }

        if (kijs.isEmpty(val)) {
            this.iconChar = '';
            
        } else {
            if (kijs.isDefined(val.char)) {
                this.iconChar = val.char;
            }
            if (kijs.isDefined(val.cls)) {
                this.iconCls = val.cls;
            }
            if (kijs.isDefined(val.color)) {
                this.iconColor = val.color;
            }
            if (kijs.isDefined(val.style)) {
                Object.assign(this.style, val.style);
            }
        }
    }
    
    get iconMapName() { return this._iconMapName; }
    set iconMapName(val) { this.iconMap = val; }

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

    get isEmpty() {
        return kijs.isEmpty(this._dom.html) && kijs.isEmpty(this._iconCls);
    }
    
    
    
    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // overwrite
    changeDisabled(val, callFromParent) {
        super.changeDisabled(!!val, callFromParent);
        this._dom.changeDisabled(!!val, true);
    }
    
};
