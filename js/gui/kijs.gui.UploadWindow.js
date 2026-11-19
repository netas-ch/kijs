/* global kijs, this, HTMLElement */

// --------------------------------------------------------------
// kijs.gui.UploadWindow
// --------------------------------------------------------------

// TODO: Umbenennen zu kijs.gui.FileUpload !!!!!
// TODO: Sollte von kijs.FileUpload erben !!!!!


/**
 * Modales Fenster, das den Fortschritt der Uploads eines kijs.UploadDialog anzeigt. Beim Start eines
 * Uploads wird für jede Datei ein kijs.gui.ProgressBar hinzugefügt und das Fenster angezeigt.
 * Fehlermeldungen werden unter dem Balken angezeigt. Ohne Fehler schliesst es sich mit autoClose
 * eine Sekunde nach dem letzten Upload, sonst über den Button OK.
 *
 * @example
 * const ud = new kijs.UploadDialog({ ajaxUrl: 'upload.php', contentTypes: ['image'] });
 * new kijs.gui.UploadWindow({ uploadDialog: ud });
 * ud.showFileSelectDialog();
 */
kijs.gui.UploadWindow = class kijs_gui_UploadWindow extends kijs.gui.Window {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        this._uploadDialog = null;   // intern
        this._uploads = [];          // intern
        this._autoClose = true;      // intern
        this._uploadRunning = true;  // intern

        this._dom.clsAdd('kijs-uploadwindow');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            caption: kijs.getText('Upload'),
            iconMap: 'kijs.iconMap.Fa.upload',
            uploadDialog: null,
            closable: false,
            maximizable: false,
            resizable: false,
            modal: true,
            width: 250,
            autoClose: true,
            innerStyle: {
                padding: '10px'
            },
            footerStyle: {
                padding: '10px'
            },
            footerElements:[
                '>',
                {
                    xtype: 'kijs.gui.Button',
                    caption: 'OK',
                    isDefault: true,
                    on: {
                        click: function() {
                            if (this._uploadRunning !== true && this._dom.node) {
                                this.unrender();
                            }
                        },
                        context: this
                    }
                }
            ]
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            uploadDialog: { target: 'uploadDialog' },
            autoClose: true     // {Boolean} Fenster nach dem letzten Upload automatisch schliessen, wenn kein Fehler aufgetreten ist. Default: true
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
     * kijs.UploadDialog, dessen Uploads angezeigt werden (Events uploadStart, uploadFailed, upload,
     * uploadEnd). Andere Werte werfen einen kijs.Error.
     * @type {kijs.UploadDialog|null}
     */
    get uploadDialog() { return this._uploadDialog; }
    set uploadDialog(val) {
        // falls bereits verknüpft, events entfernen
        if (this._uploadDialog instanceof kijs.UploadDialog) {
            this._uploadDialog.off(null, null, this);
        }

        this._uploadDialog = val || null;
        if (val) {
            if (!(val instanceof kijs.UploadDialog)) {
                throw new kijs.Error('uploadDialog must be of type kijs.UploadDialog');
            }

            this._uploadDialog.on('uploadStart', this.#onUploadStart, this);
            this._uploadDialog.on('uploadFailed', this.#onUploadFailed, this);
            this._uploadDialog.on('upload', this.#onUpload, this);
            this._uploadDialog.on('uploadEnd', this.#onUploadEnd, this);
        }
    }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    /**
     * Zeigt das Fenster zur Dateiauswahl an.
     * @param {Boolean} multiple Dürfen mehrere Dateien ausgewählt werden?
     * @param {Boolean} directory Soll statt eine Datei ein Verzeichnis hochgeladen werden?
     * @returns {undefined}
     */
    // TODO: Umbenennen zu showFileOpenDialog !!!!!
    showFileSelectDialog(multiple=null, directory=null) {
        if (!(this._uploadDialog instanceof kijs.UploadDialog)) {
            // über den Setter, damit die Listeners gesetzt werden
            this.uploadDialog = new kijs.UploadDialog();
        }

        this._uploadDialog.showFileSelectDialog(multiple, directory);
    }

    // overwrite
    unrender(superCall) {

        // Event auslösen.
        if (!superCall) {
            this.raiseEvent('unrender');
        }

        this.removeAll();
        this._uploads = [];

        super.unrender(superCall);
    }


    // PROTECTED
    /**
     * Gibt den Fortschrittsbalken eines Uploads zurück
     * @param {Number} uploadId
     * @returns {kijs.gui.ProgressBar|null}
     */
    _getUploadProgressBar(uploadId) {
        for (let i=0; i<this._uploads.length; i++) {
            if (this._uploads[i].uploadId === uploadId)  {
                return this._uploads[i].progressBar;
            }
        }
        return null;
    }


    // PRIVATE
    // LISTENERS
    #onUpload(e) {
        let pg = this._getUploadProgressBar(e.uploadId);
        if (e.errorMsg && pg) {
            this._autoClose = false;
            pg.bottomCaption = '<span class="error">' + kijs.String.htmlspecialchars(e.errorMsg) + '</span>';
        }
    }

    #onUploadEnd() {
        // uploads fertig
        this._uploadRunning = false;
        if (this._autoClose) {
            kijs.defer(function() {
                if (this._dom.node) {
                    this.unrender();
                }
            }, 1000, this);
        }
    }
    
    #onUploadFailed() {
        this._autoClose = false;
    }

    #onUploadStart(e) {
        const progressBar = new kijs.gui.ProgressBar({
            caption: kijs.String.htmlspecialchars(e.fileName),
            uploadDialog: this._uploadDialog,
            uploadDialogId: e.uploadId,
            style: {
                marginBottom: '10px'
            }
        });

        this._uploads.push({
            progressBar: progressBar,
            uploadId: e.uploadId
        });

        this.add(progressBar);

        if (!this._dom.node) {
            this.show();
        }

        this.center();

        // uploads laufen
        this._uploadRunning = true;
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
        
        // Variablen (Objekte/Arrays) leeren
        this._uploadDialog = null;   // intern
        this._uploads = [];          // intern
        this._autoClose = true;      // intern
        this._uploadRunning = true;  // intern
        
        // Basisklasse auch entladen
        super.destruct(true);
    }
    
};
