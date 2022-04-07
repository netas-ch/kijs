/* global kijs */

// --------------------------------------------------------------
// kijs.Graphic (Static)
// --------------------------------------------------------------
kijs.Graphic = class kijs_Graphic {


    // --------------------------------------------------------------
    // STATICS
    // --------------------------------------------------------------
    /**
     * Gibt die Positionierung für ein Rechteck zurück, wenn dieses anhand eines anderen Rechtecks positioniert werden soll
     * @param {Object} rect im Format: {x:..., y:..., w:..., h:...}
     * @param {Object} targetRect im Format: {x:..., y:..., w:..., h:...}
     * @param {String} [targetPos='bl'] Ankerpunkt beim Zielelement
     *                                   tl --- t --- tr
     *                                   |             |
     *                                   l      c      r
     *                                   |             |
     *                                   bl --- b --- br
     *
     * @param {String} [pos='tl'] Ankerpunkt beim neuen Element
     * @param {Number} [offsetX=0]
     * @param {Number} [offsetY=0]
     * @returns {Object} {x:..., y:..., w:..., h:...}
     */
    static alignRectToRect(rect, targetRect, targetPos, pos, offsetX, offsetY) {
        const ret = {
            x: rect.x,
            y: rect.y,
            w: rect.w,
            h: rect.h
        };
        targetPos = targetPos || 'bl';
        pos = pos || 'tl';

        offsetX = offsetX || 0;
        offsetY = offsetY || 0;

        // Position des Zielankers ermitteln
        const tAnchor = this.getAnchorPos(targetRect, targetPos);

        // Position des Element-Ankers ermitteln
        const eAnchor = this.getAnchorPos({x:0, y:0, w:rect.w, h:rect.h}, pos);

        ret.x = tAnchor.x - eAnchor.x + offsetX;
        ret.y = tAnchor.y - eAnchor.y + offsetY;

        return ret;
    }


    /**
     * Gibt die Position eines Ankers zu einem Rechteck zurück
     * @param {Object} rect       Rechteck  im Format: {x:..., y:..., w:..., h:...}
     * @param {String} [pos='tl'] Ankerpunkt
     *                            tl --- t --- tr
     *                            |             |
     *                            l      c      r
     *                            |             |
     *                            bl --- b --- br
     * @returns {Object} Position im Format {x:..., y:...}
     */
    static getAnchorPos(rect, pos) {
        const ret = { x: 0, y: 0 };

        // Y-Achse oben
        if (pos.indexOf('t') !== -1) {
            ret.y = rect.y;

        // Y-Achse unten
        } else if (pos.indexOf('b') !== -1) {
            ret.y = rect.y + rect.h;

        // Y-Achse mitte
        } else {
            ret.y = rect.y + Math.floor(rect.h / 2);

        }

        // X-Achse links
        if (pos.indexOf('l') !== -1) {
            ret.x = rect.x;

        // X-Achse rechts
        } else if (pos.indexOf('r') !== -1) {
            ret.x = rect.x + rect.w;

        // X-Achse mitte
        } else {
            ret.x = rect.x + Math.floor(rect.w / 2);

        }

        return ret;
    }


    /**
     * Schaut ob ein Rechteck in einem anderen Platz hat
     * @param {Object} rect Masse des Rechtecks im Format: {x:..., y:..., w:..., h:...}
     * @param {Object} rectOuter Masse des äusseren Rechtecks im Format: {x:..., y:..., w:..., h:...}
     * @returns {Object} Beispiel: {
     *                              fit: false      // Hat das Rechteck ganz im äusseren platz?
     *                              fitX: false,    // Hat es auf der X-Achse platz?
     *                              fitY: true,     // Hat es auf der Y-Achse platz?
     *                              sizeL: 0,       // Abstand zwischen den linken Rändern der beiden Rechtecke (Minuswert=inneres ragt heraus)
     *                              sizeR: -10,
     *                              sizeT: 10,
     *                              sizeB: 0,
     *                             }
     *
     */
    static rectsOverlap(rect, rectOuter) {
        const ret = {};

        ret.sizeL = rect.x - rectOuter.x;
        ret.sizeR = (rectOuter.x + rectOuter.w) - (rect.x + rect.w);

        ret.sizeT = rect.y - rectOuter.y;
        ret.sizeB = (rectOuter.y + rectOuter.h) - (rect.y + rect.h);


        ret.fitX = ret.sizeL >= 0 && ret.sizeR >= 0;
        ret.fitY = ret.sizeT >= 0 && ret.sizeB >= 0;

        ret.fit = ret.fitX && ret.fitY;

        return ret;
    }


    // FUNKTIONEN ZUR MANIPULATION VON FARBEN
    // --------------------------------------

    /**
     * Ändert die Helligkeit einer Farbe.
     * @param {String|Object} color
     * @param {Number} brightness Helligkeit 0-100%
     * @returns {Object}
     */
    static colorChangeBrightness(color, brightness) {
        let hsv = kijs.Graphic.colorRGBtoHSV(kijs.Graphic.colorGet(color));
        hsv.v = 1 / 100 * brightness;
        return kijs.Graphic.colorHSVtoRGB(hsv);
    }


    /**
     * Gibt die Helligkeit einer Farbe zurück (0-100)
     * @param {String|Object} color
     * @returns {Number}
     */
    static colorGetBrightness(color) {
        let hsv = kijs.Graphic.colorRGBtoHSV(kijs.Graphic.colorGet(color));
        return Math.round(100 * hsv.v);
    }

    /**
     * Gibt den Hex-String einer Farbe zurück.
     * @param {String|Object} color
     * @returns {String}
     */
    static colorGetHex(color) {
        color = kijs.Graphic.colorGet(color);
        let hex = '';
        hex += kijs.String.padding(color.r.toString(16), 2, '0', 'left');
        hex += kijs.String.padding(color.g.toString(16), 2, '0', 'left');
        hex += kijs.String.padding(color.b.toString(16), 2, '0', 'left');
        return hex.toUpperCase();
    }


    /**
     * Parst eine Farbe in einem beliebigen Format zu einem RGB-Objekt
     * @param {String|Array|Object} color
     * @returns {Object|null}
     */
    static colorGet(color) {
        if (kijs.isString(color)) {
            switch (color.toLowerCase()) {
                case 'black':     color = '#000000'; break;
                case 'blue':      color = '#0000FF'; break;
                case 'brown':     color = '#A52A2A'; break;
                case 'cyan':      color = '#00FFFF'; break;
                case 'gold':      color = '#FFD700'; break;
                case 'gray':      color = '#808080'; break;
                case 'grey':      color = '#808080'; break;
                case 'green':     color = '#008000'; break;
                case 'lime':      color = '#00FF00'; break;
                case 'magenta':   color = '#FF00FF'; break;
                case 'navy':      color = '#000080'; break;
                case 'olive':     color = '#808000'; break;
                case 'orange':    color = '#FFA500'; break;
                case 'orchid':    color = '#DA70D6'; break;
                case 'pink':      color = '#FFC0CB'; break;
                case 'red':       color = '#FF0000'; break;
                case 'silver':    color = '#C0C0C0'; break;
                case 'snow':      color = '#FFFAFA'; break;
                case 'turquoise': color = '#40E0D0'; break;
                case 'violet':    color = '#EE82EE'; break;
                case 'white':     color = '#FFFFFF'; break;
                case 'yellow':    color = '#FFFF00'; break;
            }

            if (color.match(/^#?[0-9a-f]{3}$/i)) { // #FFF
                let mt = color.match(/^#?([0-9a-f])([0-9a-f])([0-9a-f])$/i);
                return {
                    r: parseInt(mt[1] + '' + mt[1], 16),
                    g: parseInt(mt[2] + '' + mt[2], 16),
                    b: parseInt(mt[3] + '' + mt[3], 16)
                };

            } else if (color.match(/^#?[0-9a-f]{6}$/i)) { // #FF0011
                let mt = color.match(/^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
                return {
                    r: parseInt(mt[1], 16),
                    g: parseInt(mt[2], 16),
                    b: parseInt(mt[3], 16)
                };

            } else if (color.match(/^rgb\s*\(\s*([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\s*\)$/i)) { // rgb(0,255,255)
                let mt = color.match(/^rgb\s*\(\s*([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\s*\)$/i);
                return {
                    r: parseInt(mt[1], 10),
                    g: parseInt(mt[2], 10),
                    b: parseInt(mt[3], 10)
                };
            }

        } else if (kijs.isArray(color) && kijs.isNumber(color[0])  && kijs.isNumber(color[1])  && kijs.isNumber(color[2])) {
            return {
                r: parseInt(color[0], 10),
                g: parseInt(color[1], 10),
                b: parseInt(color[2], 10)
            };

        } else if (kijs.isObject(color) && kijs.isDefined(color.r)  && kijs.isDefined(color.g)  && kijs.isDefined(color.b)) {
            return color;

        } else if (kijs.isObject(color) && kijs.isDefined(color.h)  && kijs.isDefined(color.s)  && kijs.isDefined(color.v)) {
            return kijs.Graphic.colorHSVtoRGB(color);
        }

        throw new kijs.Error('kijs.Graphic: invalid argument for color');
    }

    /**
     * HSV in RGB konvertieren
     * @param {Number} h 0-1
     * @param {Number} s 0-1
     * @param {Number} v 0-1
     * @returns {Object}
     */
    static colorHSVtoRGB(h, s, v) {
        let r, g, b, i, f, p, q, t;

        if (arguments.length === 1) {
            s = h.s, v = h.v, h = h.h;
        }

        i = Math.floor(h * 6);
        f = h * 6 - i;
        p = v * (1 - s);
        q = v * (1 - f * s);
        t = v * (1 - (1 - f) * s);
        switch (i % 6) {
            case 0: r = v, g = t, b = p; break;
            case 1: r = q, g = v, b = p; break;
            case 2: r = p, g = v, b = t; break;
            case 3: r = p, g = q, b = v; break;
            case 4: r = t, g = p, b = v; break;
            case 5: r = v, g = p, b = q; break;
        }
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }


    /**
     * RGB in HSV konvertieren
     * @param {Number} r 0-255
     * @param {Number} g 0-255
     * @param {Number} b 0-255
     * @returns {Object}
     */
    static colorRGBtoHSV(r, g, b) {
        if (arguments.length === 1) {
            g = r.g, b = r.b, r = r.r;
        }

        let max = Math.max(r, g, b), min = Math.min(r, g, b),
            d = max - min,
            h,
            s = (max === 0 ? 0 : d / max),
            v = max / 255;

        switch (max) {
            case min: h = 0; break;
            case r: h = (g - b) + d * (g < b ? 6: 0); h /= 6 * d; break;
            case g: h = (b - r) + d * 2; h /= 6 * d; break;
            case b: h = (r - g) + d * 4; h /= 6 * d; break;
        }

        return {
            h: h,
            s: s,
            v: v
        };
    }

};