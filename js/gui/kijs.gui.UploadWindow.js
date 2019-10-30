/* global kijs, this, HTMLElement */

// --------------------------------------------------------------
// kijs.gui.UploadWindow
// --------------------------------------------------------------
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
            iconChar: '&#xf093',
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

        // Listeners
        this.on('mouseDown', this._onMouseDown, this);

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

            this._uploadDialog.on('startUpload', this._onStartUpload, this);
            this._uploadDialog.on('failUpload', this._onFailUpload, this);
            this._uploadDialog.on('upload', this._onUpload, this);
            this._uploadDialog.on('endUpload', this._onEndUpload, this);
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
    showFileSelectDialog(multiple=null, directory=null) {
        if (!(this._uploadDialog instanceof kijs.UploadDialog)) {
            this._uploadDialog = new kijs.UploadDialog();
        }

        this._uploadDialog.showFileSelectDialog(multiple, directory);
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

    _onStartUpload(ud, filename, filedir, filetype, uploadId) {
        let progressBar = new kijs.gui.ProgressBar({
            caption: kijs.String.htmlspecialchars(filename),
            uploadDialog: this._uploadDialog,
            uploadDialogId: uploadId,
            style: {
                marginBottom: '10px'
            }
        });


        this._uploads.push({
            progressBar: progressBar,
            uploadId: uploadId
        });

        this.add(progressBar);

        if (!this._dom.node) {
            this.show();
        }

        this.center();

        // uploads laufen
        this._uploadRunning = true;
    }

    _onFailUpload(ud, filename, filetype) {
        this._autoClose = false;
    }

    _onUpload(ud, response, errorMsg, uploadId) {
        let pg = this._getUploadProgressBar(uploadId);
        if (errorMsg && pg) {
            this._autoClose = false;
            pg.bottomCaption = '<span class="error">' + kijs.String.htmlspecialchars(errorMsg) + '</span>';
        }
    }

    _onEndUpload() {
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


    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(superCall) {
        if (!superCall) {
            // unrender
            this.unrender(superCall);

            // Event auslösen.
            this.raiseEvent('destruct');
        }

        // Basisklasse auch entladen
        super.destruct(true);
    }
};