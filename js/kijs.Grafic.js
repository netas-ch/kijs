/* global kijs */

// --------------------------------------------------------------
// kijs.Grafic (Static)
// --------------------------------------------------------------
kijs.Grafic = class kijs_Grafic {


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
    
};