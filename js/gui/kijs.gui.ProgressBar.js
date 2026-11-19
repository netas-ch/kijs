/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.ProgressBar
// --------------------------------------------------------------
/**
 * Fortschrittsbalken mit Beschriftung darüber (caption) und darunter (bottomCaption) sowie optional
 * der Prozentzahl im Balken. Kann an einen kijs.UploadDialog gebunden werden.
 *
 * @example
 * const pb = new kijs.gui.ProgressBar({ caption: 'Export', percent: 0 });
 * pb.percent = 50;
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
        this._uploadDialog = null;
        this._uploadDialogId = null;

        this._captionDom = new kijs.gui.Dom();
        this._bottomCaptionDom = new kijs.gui.Dom();

        this._fieldDom = new kijs.gui.Dom();
        this._barDom = new kijs.gui.Dom();
        this._textDom = new kijs.gui.Dom();

        this._dom.clsAdd('kijs-progressbar');
        this._captionDom.clsAdd('kijs-progressbar-caption');
        this._bottomCaptionDom.clsAdd('kijs-progressbar-caption-bottom');

        this._fieldDom.clsAdd('kijs-progressbar-field');
        this._barDom.clsAdd('kijs-progressbar-bar');
        this._textDom.clsAdd('kijs-progressbar-text');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            percent: 0,
            showPercent: true
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            showPercent: true,
            caption: { target: 'html', context: this._captionDom },
            bottomCaption: { target: 'html', context: this._bottomCaptionDom },
            percent: { target: 'percent' },
            uploadDialog: { target: 'uploadDialog' },
            uploadDialogId: { target: 'uploadDialogId' }
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
     * Beschriftung unter dem Balken (HTML)
     * @type {String}
     */
    get bottomCaption() { return this._bottomCaptionDom.html; }
    set bottomCaption(val) { this._bottomCaptionDom.html = val;  }

    /**
     * Beschriftung über dem Balken (HTML)
     * @type {String}
     */
    get caption() { return this._captionDom.html; }
    set caption(val) { this._captionDom.html = val;  }

    /**
     * Fortschritt in Prozent (0-100, siehe setProgress()). Default: 0
     * @type {Number}
     */
    get percent() { return this._percent; }
    set percent(val) { this.setProgress(val); }

    /**
     * Prozentzahl im Balken anzeigen? Default: true
     * @type {Boolean}
     */
    get showPercent() { return this._showPercent; }
    set showPercent(val) { this._showPercent = val; }

    /**
     * Verbundener kijs.UploadDialog, dessen Fortschritt angezeigt wird (siehe bindUploadDialog())
     * @type {kijs.UploadDialog|null}
     */
    get uploadDialog() { return this._uploadDialog; }
    set uploadDialog(val) { this.bindUploadDialog(val); }

    /**
     * uploadId des Uploads, dessen Fortschritt angezeigt wird. null = der erste
     * @type {Number|null}
     */
    get uploadDialogId() { return this._uploadDialogId; }
    set uploadDialogId(val) { this._uploadDialogId = val; }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    /**
     * Binden einen kijs.Uploaddialog an die Progressbar, um den Upload-Fortschritt
     * anzuzeigen.
     * @param {kijs.UploadDialog} uploadDialog
     * @param {Int} [uploadId] ID vom Upload. Wenn null übergeben wird, wird der erste genommen.
     * @returns {undefined}
     */
    bindUploadDialog(uploadDialog, uploadId=null) {
        if (!(uploadDialog instanceof kijs.UploadDialog)) {
            throw new kijs.Error('Upload Dialog must be of type kijs.UploadDialog');
        }

        // Events entfernen, wenn bereits eine Klasse verknüpft war.
        if (this._uploadDialog instanceof kijs.UploadDialog) {
            this._uploadDialog.off(null, null, this);
        }

        this._uploadDialog = uploadDialog;
        if (uploadId !== null) {
            this._uploadDialogId = uploadId;
        }

        uploadDialog.on('progress', this.#onUploadDialogProgress, this);
        uploadDialog.on('upload', this.#onUploadDialogUpload, this);
    }

    // overwrite
    render(superCall) {
        super.render(true);

        // innerDOM rendern
        this._captionDom.renderTo(this._dom.node);
        this._fieldDom.renderTo(this._dom.node);
        this._bottomCaptionDom.renderTo(this._dom.node);
        this._barDom.renderTo(this._fieldDom.node);
        if (this._showPercent) {
            this._textDom.renderTo(this._fieldDom.node);
        }

        this._barDom.node.style.width = this._percent + '%';

        if (this._showPercent && (this._barDom.width >= this._textDom.width+3 || this._percent === 100)) {
            this._textDom.node.style.opacity = 1;
        }

        // Event afterRender auslösen
        if (!superCall) {
            this.raiseEvent('afterRender');
        }
    }
    
    /**
     * aktualisiert den Balken
     * @param {int} percent Prozent zwischen 0-100
     * @returns {undefined}
     */
    setProgress(percent) {
        percent = window.parseInt(percent);
        if (window.isNaN(percent) || percent < 0 || percent > 100) {
            throw new kijs.Error('percent must be numeric between 0 and 100');
        }

        this._percent = percent;
        this._textDom.html = this._showPercent ? this._percent + '%' : '';

        if (this._barDom.node) {
            this._barDom.node.style.width = this._percent + '%';
        }

        if (this._showPercent && this._textDom.node) {
            if (this._barDom.width >= this._textDom.width+3 || this._percent === 100) {
                this._textDom.node.style.opacity = 1;

            } else {
                this._textDom.node.style.opacity = 0;
            }
        }
    }

    // overwrite
    unrender(superCall) {
        // Event auslösen.
        if (!superCall) {
            this.raiseEvent('unrender');
        }

        this._barDom.unrender();
        this._textDom.unrender();

        super.unrender(true);
    }


    // PRIVATE
    // LISTENERS
    #onUploadDialogProgress(e) {
        if (this._uploadDialogId === null) {
            this._uploadDialogId = e.uploadId;
        }

        if (kijs.isInteger(e.percent) && this._uploadDialogId === e.uploadId) {
            this.setProgress(e.percent);
        }
    }

    // Upload fertig
    #onUploadDialogUpload(e) {
        if (this._uploadDialogId === e.uploadId) {
            this.setProgress(100);
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

        // Events entfernen
        if (this._uploadDialog instanceof kijs.UploadDialog) {
            this._uploadDialog.off(null, null, this);
        }

        this._captionDom.destruct();
        this._bottomCaptionDom.destruct();

        this._fieldDom.destruct();
        this._barDom.destruct();
        this._textDom.destruct();

        this._captionDom = null;
        this._bottomCaptionDom = null;

        this._fieldDom = null;
        this._barDom = null;
        this._textDom = null;

        // Basisklasse entladen
        super.destruct(true);
    }
    
};
