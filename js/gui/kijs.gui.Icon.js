/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.Icon
// --------------------------------------------------------------
/**
 * Icon als Zeichen einer Icon-Schrift (iconChar, z.B. Font Awesome) oder als CSS-Klasse
 * mit Hintergrundbild (iconCls). Am einfachsten wird es über iconMap zugewiesen.
 *
 * @example
 * new kijs.gui.Icon({ iconMap: 'kijs.iconMap.Fa.house', iconColor: '#f80' });
 */
kijs.gui.Icon = class kijs_gui_Icon extends kijs.gui.Element {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        this._iconCls = null;
        this._iconAnimationCls = null;    // 'kijs-spin' oder 'kijs-pulse'
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
            iconAnimationCls: { target: 'iconAnimationCls', prio: 2 },
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
    /**
     * CSS-Klasse für eine Animation, z.B. 'kijs-spin' oder 'kijs-pulse'
     * @type {String|null}
     */
    get iconAnimationCls() { return this._iconAnimationCls; }
    set iconAnimationCls(val) {
        if (kijs.isEmpty(val)) {
            val = null;
        }
        if (!kijs.isString && !val) {
            throw new kijs.Error(`config "iconAnimationCls" is not a string`);
        }
        if (this._iconAnimationCls) {
            this._dom.clsRemove(this._iconAnimationCls);
        }
        this._iconAnimationCls = val;
        if (this._iconAnimationCls) {
            this._dom.clsAdd(this._iconAnimationCls);
        }
    }

    /**
     * Unicode-Codepoint des Zeichens, z.B. 0xf015.
     * Die Angabe als HTML-Entity (z.B. '&#xf015;') ist deprecated.
     * @type {Number}
     */
    get iconChar() {
        let chr = kijs.toString(this._dom.html);
        if (chr.length > 0) {
            return chr.codePointAt(0);
        }
        return '';
    }
    set iconChar(val) {
        if (kijs.isString(val) && val.substr(0,2) === '&#') {
            console.warn('DEPRECATED: set iconChar with a Number (code point) instead of an HTML entity');
            val = kijs.String.htmlentities_decode(val).codePointAt(0);

        } else if (!kijs.isInteger(val)) {
            val = parseInt(val);
        }

        this._dom.html = kijs.isInteger(val) ? String.fromCodePoint(val) : '';
    }

    /**
     * CSS-Klasse des Icons, z.B. für ein Icon als Hintergrundbild oder die Schrift 'fa-solid'
     * @type {String|null}
     */
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

    /**
     * Farbe des Icons (CSS color)
     * @type {String}
     */
    get iconColor() { return this._dom.style.color; }
    set iconColor(val) { this._dom.style.color = val; }

    /**
     * Icon aus einer iconMap: Name als String, z.B. 'kijs.iconMap.Fa.house', oder Objekt
     * { char, cls, color, style }. Leer entfernt das Zeichen.
     * Der Getter gibt ein Objekt mit char, cls und color zurück.
     * @type {String|Object}
     */
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
    
    /**
     * Name der zugewiesenen iconMap, z.B. 'kijs.iconMap.Fa.house'. Der Setter weist iconMap zu.
     * @type {String|null}
     */
    get iconMapName() { return this._iconMapName; }
    set iconMapName(val) { this.iconMap = val; }

    /**
     * Grösse in Pixel (ganze Zahl). Bei iconChar wird fontSize gesetzt, bei iconCls Breite,
     * Höhe und Grösse des Hintergrundbilds. Gilt für das beim Zuweisen vorhandene Zeichen bzw. iconCls.
     * @type {Number|null}
     */
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

    /**
     * Leer, wenn weder iconChar noch iconCls gesetzt ist
     * @type {Boolean}
     */
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
