/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.FileUpload
// --------------------------------------------------------------
/**
 * kijs.FileUpload mit Oberfläche: Während des Uploads zeigt ein modales Fenster für jede Datei
 * einen kijs.gui.ProgressBar an, abgewiesene Dateien und Fehler vom Server stehen unter dem Balken.
 * Während des Uploads können alle laufenden Uploads mit dem Button Abbrechen abgebrochen werden.
 * Ohne Fehler schliesst sich das Fenster mit autoClose eine Sekunde nach dem letzten Upload,
 * sonst über den Button OK.
 *
 * Mit observePaste werden Dateien aus der Zwischenablage hochgeladen (Einfügen im Browserfenster).
 *
 * @example
 * const fu = new kijs.gui.FileUpload({
 *     url: 'upload.php',
 *     contentTypes: ['image']
 * });
 * fu.on('uploadEnd', function(e) {
 *     console.log(e.uploadResponses);
 * });
 * fu.showFileOpenDialog();
 *
 * // mit DropZone; Einfügen nur, solange die DropZone sichtbar ist
 * const dz = new kijs.gui.DropZone({
 *     html: 'Dateien hierher ziehen',
 *     fileUpload: fu
 * });
 * fu.observePaste = dz;
 */
kijs.gui.FileUpload = class kijs_gui_FileUpload extends kijs.FileUpload {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        this._autoClose = true;
        this._observePaste = false;
        this._showProgress = true;

        this._hasErrors = false;            // intern: Fehler seit dem Öffnen des Fensters?
        this._pasteListener = null;         // intern: Listener auf window
        this._progressBars = new Map();     // intern: uploadId => kijs.gui.ProgressBar
        this._win = null;                   // intern: kijs.gui.Window

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            autoClose: true,        // {Boolean} Fenster nach dem letzten Upload automatisch schliessen, wenn kein Fehler aufgetreten ist. Default: true
            observePaste: { target: 'observePaste' },
            showProgress: true      // {Boolean} Fenster mit dem Fortschritt anzeigen? Default: true
        });

        // Eigene Events für die Anzeige
        this.on('fileRejected', this.#onFileRejected, this);
        this.on('progress', this.#onProgress, this);
        this.on('upload', this.#onUpload, this);
        this.on('uploadEnd', this.#onUploadEnd, this);
        this.on('uploadStart', this.#onUploadStart, this);

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config);
        }
    }



    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    /**
     * Fenster nach dem letzten Upload automatisch schliessen, wenn kein Fehler aufgetreten ist? Default: true
     * @type {Boolean}
     */
    get autoClose() { return this._autoClose; }
    set autoClose(val) { this._autoClose = !!val; }

    /**
     * Dateien aus der Zwischenablage hochladen? true = immer, kijs.gui.Element = nur solange das
     * Element sichtbar ist (z.B. eine kijs.gui.DropZone), false = nie. Default: false
     * @type {Boolean|kijs.gui.Element}
     */
    get observePaste() { return this._observePaste; }
    set observePaste(val) {
        if (!(val instanceof kijs.gui.Element)) {
            val = !!val;
        }
        this._observePaste = val;

        if (val && !this._pasteListener) {
            this._pasteListener = this.#onWindowPaste.bind(this);
            window.addEventListener('paste', this._pasteListener);

        } else if (!val && this._pasteListener) {
            window.removeEventListener('paste', this._pasteListener);
            this._pasteListener = null;
        }
    }

    /**
     * Fenster mit dem Fortschritt anzeigen? Default: true
     * @type {Boolean}
     */
    get showProgress() { return this._showProgress; }
    set showProgress(val) { this._showProgress = !!val; }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // PROTECTED
    /**
     * Fügt dem Fenster einen Fortschrittsbalken hinzu und zeigt das Fenster an
     * @param {String} fileName
     * @returns {kijs.gui.ProgressBar}
     */
    _addProgressBar(fileName) {
        const progressBar = new kijs.gui.ProgressBar({
            caption: fileName,
            captionDisplayType: 'text',
            percent: 0,
            style: {
                marginBottom: '10px'
            }
        });

        const win = this._getWindow();
        win.add(progressBar);

        if (!win.isRendered) {
            win.show();
        }
        win.center();

        return progressBar;
    }

    /**
     * Schliesst das Fenster und setzt den Zustand zurück
     * @returns {undefined}
     */
    _closeWindow() {
        if (this._win) {
            this._win.close();
        }
        this._win = null;
        this._progressBars.clear();
        this._hasErrors = false;
    }

    /**
     * Gibt das Fenster zurück. Erstellt es, falls es noch nicht existiert.
     * @returns {kijs.gui.Window}
     */
    _getWindow() {
        if (!this._win) {
            this._win = new kijs.gui.Window({
                caption: kijs.getText('Upload'),
                iconMap: 'kijs.iconMap.Fa.upload',
                cls: 'kijs-fileupload',
                closable: false,
                maximizable: false,
                resizable: false,
                modal: true,
                width: 300,
                innerStyle: {
                    padding: '10px 10px 0 10px'
                },
                footerElements: [
                    '>',
                    {
                        xtype: 'kijs.gui.Button',
                        name: 'btnCancel',
                        caption: kijs.getText('Abbrechen'),
                        on: {
                            click: this.#onBtnCancelClick,
                            context: this
                        }
                    },{
                        xtype: 'kijs.gui.Button',
                        name: 'btnOk',
                        caption: kijs.getText('OK'),
                        isDefault: true,
                        disabled: true,
                        on: {
                            click: this.#onBtnOkClick,
                            context: this
                        }
                    }
                ]
            });
        }
        return this._win;
    }

    /**
     * Zeigt eine Fehlermeldung unter einem Fortschrittsbalken an
     * @param {kijs.gui.ProgressBar} progressBar
     * @param {String} errorMsg
     * @returns {undefined}
     */
    _setError(progressBar, errorMsg) {
        this._hasErrors = true;
        progressBar.bottomCaption = '<span class="error">' + kijs.String.htmlspecialchars(errorMsg) + '</span>';
    }

    /**
     * Aktiviert während des Uploads den Button Abbrechen, danach den Button OK
     * @returns {undefined}
     */
    _updateButtons() {
        if (this._win) {
            this._win.footer.down('btnCancel').disabled = !this.isUploading;
            this._win.footer.down('btnOk').disabled = this.isUploading;
        }
    }


    // PRIVATE
    // LISTENERS
    #onBtnCancelClick() {
        this.abort();
    }

    #onBtnOkClick() {
        if (!this.isUploading) {
            this._closeWindow();
        }
    }

    #onFileRejected(e) {
        if (!this._showProgress) {
            return;
        }

        const progressBar = this._addProgressBar(e.fileName);
        progressBar.showPercent = false;
        this._setError(progressBar, e.errorMsg);
        this._updateButtons();
    }

    #onProgress(e) {
        const progressBar = this._progressBars.get(e.uploadId);
        if (progressBar) {
            progressBar.percent = e.percent;
        }
    }

    #onUpload(e) {
        const progressBar = this._progressBars.get(e.uploadId);
        if (progressBar) {
            // abgebrochen: Balken bleibt stehen
            if (!e.isAborted) {
                progressBar.percent = 100;
            }
            if (e.errorMsg) {
                this._setError(progressBar, e.errorMsg);
            }
        }
    }

    #onUploadEnd() {
        this._updateButtons();

        if (this._win && this._autoClose && !this._hasErrors) {
            kijs.defer(function() {
                // inzwischen neue Uploads oder Fehler?
                if (this._win && !this.isUploading && !this._hasErrors) {
                    this._closeWindow();
                }
            }, 1000, this);
        }
    }

    #onUploadStart(e) {
        if (!this._showProgress) {
            return;
        }

        this._progressBars.set(e.uploadId, this._addProgressBar(e.fileName));
        this._updateButtons();
    }

    #onWindowPaste(e) {
        // Nur, wenn das Element sichtbar ist (z.B. nicht in einem inaktiven Tab)
        if (this._observePaste instanceof kijs.gui.Element) {
            const node = this._observePaste.dom.node;
            if (!node || !node.isConnected || !node.checkVisibility()) {
                return;
            }
        }

        // Dateien aus der Zwischenablage lesen
        const files = e.clipboardData ? e.clipboardData.files : null;
        if (!files || files.length === 0) {
            return;
        }

        e.preventDefault();
        this.upload(files);
    }



    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    destruct() {
        // Listener auf window entfernen
        this.observePaste = false;

        // Fenster entladen
        if (this._win) {
            this._win.destruct();
        }

        // Variablen (Objekte/Arrays) leeren
        this._observePaste = null;
        this._progressBars = null;
        this._win = null;

        // Basisklasse entladen
        super.destruct();
    }

};
