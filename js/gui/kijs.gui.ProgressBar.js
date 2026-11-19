/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.ProgressBar
// --------------------------------------------------------------
/**
 * Fortschrittsbalken mit Beschriftung darüber (caption) und darunter (bottomCaption) sowie optional
 * der Prozentzahl im Balken. Ist percent null, läuft der Balken unbestimmt durch (Fortschritt
 * unbekannt).
 *
 * @example
 * const pb = new kijs.gui.ProgressBar({ caption: 'Export', percent: 0 });
 * pb.percent = 50;
 * pb.percent = null;  // unbestimmt
 */
kijs.gui.ProgressBar = class kijs_gui_ProgressBar extends kijs.gui.Element {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        this._percent = 0;
        this._showPercent = true;

        this._barDom = new kijs.gui.Dom();
        this._bottomCaptionDom = new kijs.gui.Dom();
        this._captionDom = new kijs.gui.Dom();
        this._fieldDom = new kijs.gui.Dom();
        this._textDom = new kijs.gui.Dom();

        this._dom.clsAdd('kijs-progressbar');
        this._barDom.clsAdd('kijs-progressbar-bar');
        this._bottomCaptionDom.clsAdd('kijs-progressbar-caption-bottom');
        this._captionDom.clsAdd('kijs-progressbar-caption');
        this._fieldDom.clsAdd('kijs-progressbar-field');
        this._textDom.clsAdd('kijs-progressbar-text');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            bottomCaption: { target: 'bottomCaption' },
            bottomCaptionDisplayType: { target: 'bottomCaptionDisplayType' },
            caption: { target: 'caption' },
            captionDisplayType: { target: 'captionDisplayType' },
            percent: { target: 'percent' },
            showPercent: { target: 'showPercent' }
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
     * Beschriftung unter dem Balken
     * @type {String}
     */
    get bottomCaption() { return this._bottomCaptionDom.html; }
    set bottomCaption(val) {
        this._bottomCaptionDom.html = val;
        if (this.isRendered) {
            this.render();
        }
    }

    /**
     * Darstellung von bottomCaption: 'html', 'code', 'text' oder 'textNl'. Default: 'html'
     * @type {String}
     */
    get bottomCaptionDisplayType() { return this._bottomCaptionDom.htmlDisplayType; }
    set bottomCaptionDisplayType(val) { this._bottomCaptionDom.htmlDisplayType = val; }

    /**
     * Beschriftung über dem Balken
     * @type {String}
     */
    get caption() { return this._captionDom.html; }
    set caption(val) {
        this._captionDom.html = val;
        if (this.isRendered) {
            this.render();
        }
    }

    /**
     * Darstellung von caption: 'html', 'code', 'text' oder 'textNl'. Default: 'html'
     * @type {String}
     */
    get captionDisplayType() { return this._captionDom.htmlDisplayType; }
    set captionDisplayType(val) { this._captionDom.htmlDisplayType = val; }

    /**
     * Fortschritt in Prozent (0-100). Werte ausserhalb werden begrenzt. null = unbestimmt
     * (der Balken läuft durch). Default: 0
     * @type {Number|null}
     */
    get percent() { return this._percent; }
    set percent(val) {
        if (val === null) {
            this._percent = null;

        } else {
            val = Number(val);
            if (isNaN(val)) {
                throw new kijs.Error(`config "percent" must be numeric or null`);
            }
            this._percent = Math.min(100, Math.max(0, val));
        }

        this._updateBar();
    }

    /**
     * Prozentzahl im Balken anzeigen? Default: true
     * @type {Boolean}
     */
    get showPercent() { return this._showPercent; }
    set showPercent(val) {
        this._showPercent = !!val;
        this._updateBar();
    }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // overwrite
    render(superCall) {
        super.render(true);

        // caption rendern (kijs.gui.Dom)
        if (!this._captionDom.isEmpty) {
            this._captionDom.renderTo(this._dom.node);
        } else if (this._captionDom.isRendered) {
            this._captionDom.unrender();
        }

        // Balken rendern (kijs.gui.Dom)
        this._fieldDom.renderTo(this._dom.node);
        this._barDom.renderTo(this._fieldDom.node);
        this._textDom.renderTo(this._fieldDom.node);

        // bottomCaption rendern (kijs.gui.Dom)
        if (!this._bottomCaptionDom.isEmpty) {
            this._bottomCaptionDom.renderTo(this._dom.node);
        } else if (this._bottomCaptionDom.isRendered) {
            this._bottomCaptionDom.unrender();
        }

        this._updateBar();

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

        this._barDom.unrender();
        this._bottomCaptionDom.unrender();
        this._captionDom.unrender();
        this._textDom.unrender();
        this._fieldDom.unrender();

        super.unrender(true);
    }


    // PROTECTED
    /**
     * Aktualisiert Breite des Balkens und Prozentzahl
     * @returns {undefined}
     */
    _updateBar() {
        const indeterminate = this._percent === null;
        const percent = indeterminate ? 0 : Math.round(this._percent);

        if (indeterminate) {
            this._dom.clsAdd('kijs-indeterminate');
        } else {
            this._dom.clsRemove('kijs-indeterminate');
        }

        // ohne Prozentzahl ein geschütztes Leerzeichen, damit der Balken die gleiche Höhe hat
        this._textDom.html = this._showPercent && !indeterminate ? percent + '%' : '&nbsp;';

        if (this._barDom.node) {
            this._barDom.node.style.width = indeterminate ? '' : percent + '%';
        }

        // Prozentzahl erst anzeigen, wenn sie im Balken Platz hat
        if (this._textDom.node) {
            if (this._showPercent && !indeterminate && (this._barDom.width >= this._textDom.width+3 || percent === 100)) {
                this._textDom.node.style.opacity = 1;
            } else {
                this._textDom.node.style.opacity = 0;
            }
        }
    }



    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    destruct(superCall) {
        if (!superCall) {
            // unrender
            this.unrender(superCall);

            // Event auslösen.
            this.raiseEvent('destruct');
        }

        // Elemente/DOM-Objekte entladen
        this._barDom.destruct();
        this._bottomCaptionDom.destruct();
        this._captionDom.destruct();
        this._fieldDom.destruct();
        this._textDom.destruct();

        // Variablen (Objekte/Arrays) leeren
        this._barDom = null;
        this._bottomCaptionDom = null;
        this._captionDom = null;
        this._fieldDom = null;
        this._textDom = null;

        // Basisklasse entladen
        super.destruct(true);
    }

};
