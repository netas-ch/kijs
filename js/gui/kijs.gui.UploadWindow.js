/* global kijs, this, HTMLElement */

// --------------------------------------------------------------
// kijs.gui.UploadWindow
// --------------------------------------------------------------

// TODO: Umbenennen zu kijs.gui.FileUpload !!!!!
// TODO: Sollte von kijs.FileUpload erben !!!!!


// Das Fenster kann mit der Mehtode .show() angezeigt werden.
// Es wird dann in das target gerendert.
// Als target kann der document.body oder ein kijs.gui.Element angegeben
// werden.
// Beim Body als target ist der Body auch gleich der übergeordnete Node (parentNode).
// Beim einem kijs.gui.Element als target ist das übergeordnete Element nicht der node
// des Elements, sondern dessen parentNode.
// Deshalb gibt es die Eigenschaften targetNode und parentNode, welche bei einem
// kijs.gui.Element als target nicht den gleichen node als Inhalt haben. Beim body
// als target, hingegen schon.
// Mit der targetDomProperty kann noch festgelegt werden, welcher node eines Elements
// als target dient, wird nichts angegeben, so dient das ganze Element als target.
// Es kann z.B. bei einem kijs.gui.Panel nur der innere Teil als target angegeben werden.
// Dazu kann die Eigenschaft targetDomProperty="innerDom" definiert werden.
// --------------------------------------------------------------
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
            autoClose: true
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
    get uploadDialog() { return this._uploadDialog; }
    set uploadDialog(val) {
        // falls bereits verknüpft, events entfernen
        if (this._uploadDialog instanceof kijs.UploadDialog) {
            this._uploadDialog.off(null, null, this);
        }

        this._uploadDialog = val;
        if (kijs.isDefined(val)) {
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
            this._uploadDialog = new kijs.UploadDialog();
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
