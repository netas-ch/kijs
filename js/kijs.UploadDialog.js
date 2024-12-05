/* global kijs, this */

// --------------------------------------------------------------
// kijs.UploadDialog
// --------------------------------------------------------------

// TODO: Umbenennen zu kijs.FileUpload !!!!!


/**
 * Die Klasse öffnet ein Fenster zum Auswählen einer Datei zum Upload
 * oder nimmt die Datei über eine Dropzone entgegen. Nach Auswahl wird
 * die Datei an den Server gesendet.
 *
 *  * EVENTS
 * ----------
 * fileSelected -- wird ausgeführt, wenn eine Datei ausgewählt wurde
 * uploadFailed -- MIME nicht erlaubt
 * uploadStart  -- Upload wird gestartet
 * progress     -- Fortschritt beim Upload
 * upload       -- Upload abgeschlossen
 * uploadEnd    -- alle Uploads in der Schlange abgeschlossen
 *
 */
kijs.UploadDialog = class kijs_UploadDialog extends kijs.Observable {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        this._ajaxUrl = 'index.php';
        this._contentTypes = [];
        this._currentUploadIds = [];
        this._directory = false;
        this._disabled = false;
        this._dropZones = [];
        this._fileExtensions = [];
        this._maxFilesize = null;
        this._multiple = true;
        this._sanitizeFilename = false;
        this._uploadId = 1;
        this._uploadResponses = {};

        this._observePaste = false;
        this._pasteCb = null;

        this._fileNameHeader = 'X-Filename';
        this._pathNameHeader = 'X-Filepath';

        this._validMediaTypes = [
            'application',
            'audio',
            'example',
            'image',
            'message',
            'model',
            'multipart',
            'text',
            'video'
        ];

        // Standard-config-Eigenschaften mergen
        config = Object.assign({}, {
            // keine
        }, config);

        // Mapping für die Zuweisung der Config-Eigenschaften
        this._configMap = {
            ajaxUrl: true,
            directory: { target: 'directory' },
            multiple: { target: 'multiple' },
            fileExtensions:  { target: 'fileExtensions' },
            fileNameHeader: true,
            pathNameHeader: true,
            maxFilesize: true,
            sanitizeFilename: true,
            dropZones: { target: 'dropZones' },
            contentTypes: { target: 'contentTypes' },
            observePaste: { target: 'observePaste' }
        };

        // Config anwenden
        if (kijs.isObject(config)) {
            this.applyConfig(config, true);
        }

        // Paste überwachen (Dateien ab Chrome 91)
        this._pasteCb = this.#onFilePaste.bind(this);
        window.addEventListener('paste', this._pasteCb);

    }



    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get contentTypes() { return this._contentTypes; }
    set contentTypes(val) {
        if (!kijs.isArray(val)) {
            val = [val];
        }

        this._contentTypes = [];

        // prüfen, ob der media-type gültig ist.
        kijs.Array.each(val, function(contentType) {
            let parts = contentType.toLowerCase().split('/', 2);
            if (!kijs.Array.contains(this._validMediaTypes, parts[0])) {
                throw new kijs.Error('invalid content type "' + contentType + '"');
            }
            if (parts.length === 1) {
                parts.push('*');
            }
            this._contentTypes.push(parts.join('/'));
        }, this);
    }

    get disabled() { return this._disabled; }
    set disabled(val) {
        this._disabled = val;

        kijs.Array.each(this._dropZones, dropZone => {
            dropZone.disabled = val;
        }, this);
    }

    get dropZones() { return this._dropZones; }
    set dropZones(val) { this.bindDropZones(val); }

    get directory() { return this._directory; }
    set directory(val) { this._directory = !!val && this._browserSupportsDirectoryUpload(); }

    get fileExtensions() { return this._fileExtensions; }
    set fileExtensions(val) {
        if (!kijs.isArray(val)) {
            val = [val];
        }

        this._fileExtensions = [];

        kijs.Array.each(val, function(type) {
            if (type.charAt(0) !== '.') {
                type = '.' + type;
            }

            this._fileExtensions.push(type);
        }, this);
    }

    get maxFilesize() {
        return this._maxFilesize;
    }

    set maxFilesize(val) {
        this._maxFilesize = val;
    }

    get multiple() { return this._multiple; }
    set multiple(val) { this._multiple = !!val; }

    get observePaste() { return this._observePaste; }
    set observePaste(val) { this._observePaste = !!val; }


    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    /**
     * Verbindet eine Dropzone mit dem UploadDialog. Wird eine
     * Datei auf die Dropzone gezogen, wird sie mit der Upload-Funktion
     * von dieser Klasse hochgeladen.
     * @param {kijs.gui.DropZone|Array} dropZones
     * @returns {undefined}
     */
    bindDropZones(dropZones) {
        if (!kijs.isArray(dropZones)) {
            dropZones = [dropZones];
        }
        kijs.Array.each(dropZones, function(dropZone) {
            if (!(dropZone instanceof kijs.gui.DropZone)) {
                throw new kijs.Error('added zone not of type kijs.gui.DropZone');
            }

            // hinzufügen falls noch nicht da.
            if (!kijs.Array.contains(this._dropZones, dropZone)) {

                // Events entfernen und wieder setzen.
                dropZone.off(null, null, this);
                dropZone.on('drop', this.#onDropZoneDrop, this);
                this._dropZones.push(dropZone);
            }
        }, this);
    }

    /**
     * Wendet die Konfigurations-Eigenschaften an
     * @param {Object} config
     * @returns {undefined}
     */
    applyConfig(config={}) {
        kijs.Object.assignConfig(this, config, this._configMap);
    }

    /**
     * Zeit den "Datei öffnen" Dialog vom Browser an.
     * @param {Boolean} [multiple] Dürfen mehrere Dateien ausgewählt werden?
     * @param {Boolean} [directory] Soll statt einer Datei ein ganzer Ordner hochgeladen werden?
     * @returns {undefined}
     */
    // TODO: Umbenennen zu showFileOpenDialog !!!!!
    showFileSelectDialog(multiple=null, directory=null) {
        if (!this.disabled) {
            multiple = multiple === null ? this._multiple : multiple;
            directory = directory === null ? this._directory : directory;

            let input = document.createElement('input');
            input.setAttribute('type', 'file');
            if (multiple) {
                input.setAttribute('multiple', 'multiple');
            }
            if (directory) {
                input.setAttribute('directory', 'directory');
                input.setAttribute('webkitdirectory', 'webkitdirectory');
                input.setAttribute('mozdirectory', 'mozdirectory');
            }

            let acceptTypes = kijs.Array.concat(this._contentTypes, this._fileExtensions);

            if (acceptTypes.length > 0) {
                input.setAttribute('accept', acceptTypes.join(','));
            }

            kijs.Dom.addEventListener('change', input, function (e) {
                if (e.nodeEvent.target && e.nodeEvent.target.files) {
                    this._uploadFiles(e.nodeEvent.target.files);
                }
            }, this);

            // öffnen
            input.click();
        }
    }


    // PROTECTED
    /**
     * Prüft, ob der Browser das Hochladen von ganzen Ordner unterstützt.
     * @returns {Boolean}
     */
    _browserSupportsDirectoryUpload() {
        let uploadEl = document.createElement('input'), support = false;
        uploadEl.setAttribute('type', 'file');
        uploadEl.setAttribute('multiple', 'multiple');

        if (kijs.isBoolean(uploadEl.webkitdirectory) || kijs.isBoolean(uploadEl.directory)) {
            support = true;
        }
        uploadEl = null;
        return support;
    }

    /**
     * Prüft, ob der übergebene MIME type einem der erlaubten MIME entspricht
     * @param {String} mime
     * @returns {Boolean}
     */
    _checkMime(mime) {
        let match=false;
        if (mime.type && this._contentTypes.length > 0) {
            mime = mime.type.toLowerCase();
            let mimeParts = mime.split('/', 2);

            kijs.Array.each(this._contentTypes, function(contentType) {
                if (mime === contentType || contentType === mimeParts[0] + '/*') {
                    match = true;
                }
            }, this);
        } else {

            let extension = mime.name.split('.').pop();

            if (extension && this._fileExtensions.length > 0) {
                kijs.Array.each(this._fileExtensions, function(ext) {
                    if (ext === '.' + extension) {
                        match = true;
                    }
                }, this);
            }
        }

        return match;
    }

    /**
     * Prüft, ob die übergebene MIME-Grösse der maximal erlaubten Grösse entspricht
     * @param {String} mime
     * @returns {Boolean}
     */
    _checkSize(mime) {
        if (this._maxFilesize) {
            if (mime.size > this._maxFilesize) {
                return false;
            }
        }

        return true;
    }

    _getFilename(fileName) {
        if (this._sanitizeFilename) {
            fileName = kijs.Char.replaceSpecialChars(fileName);
            let fileNameParts = fileName.split('.'), extension = '';
            if (fileNameParts.length > 1) {
                extension = fileNameParts.pop().replace(/[^a-zA-Z0-9]/g, '');
            }
            fileName = fileNameParts.join('_').replace(/[^a-zA-Z0-9\-]/g, '_');

            if (extension) {
                fileName += '.' + extension;
            }
        }

        return fileName;
    }

    /**
     * Schneidet den Dateinamen vom Pfad ab,
     * gibt das Verzeichnis zurück.
     * @param {String} name
     * @param {String} path
     * @returns {String}
     */
    _getRelativeDir(name, path) {
        if (path && path.substr(path.length - name.length) === name) {
            return path.substr(0, path.length - name.length - 1);
        }
        return '';
    }

    _uploadFile(file) {
        let uploadId = this._uploadId++,
            headers = {},
            fileName = this._getFilename(file.name),
            fileDir = this._getRelativeDir(file.name, file.relativePath || file.webkitRelativePath),
            fileType = file.type || 'application/octet-stream';

        // event
        this.raiseEvent('fileSelected', { uploadDialog: this, fileName: fileName, fileDir: fileDir, fileType: fileType, file: file });

        // Upload
        if (this._ajaxUrl) {
            headers[this._fileNameHeader] = encodeURIComponent(fileName);
            headers[this._pathNameHeader] = encodeURIComponent(fileDir);
            headers['Content-Type'] = fileType;

            kijs.Ajax.request({
                url: this._ajaxUrl,
                method: 'POST',
                format: 'json',
                headers: headers,
                postData: file,
                fn: this.#onUploadEnd,
                progressFn: this.#onProgress,
                context: this,
                uploadId: uploadId
            });

            this._currentUploadIds.push(uploadId);
            this.raiseEvent('uploadStart', { uploadDialog: this, fileName: fileName, fileDir: fileDir, fileType: fileType, uploadId: uploadId });
        }
    }

    _uploadFiles(fileList) {
        this._uploadResponses = {};
        if (fileList) {
            for (let i=0; i<fileList.length; i++) {
                if (this._checkMime(fileList[i])) {
                    if (this._checkSize(fileList[i])) {
                        this._uploadFile(fileList[i]);
                    } else {
                        const errMsg = this._getFilename(fileList[i].name) + ' ' + kijs.getText('ist zu gross');
                        this.raiseEvent('uploadFailed', { errMsg: errMsg });
                    }
                } else {
                    this.raiseEvent('uploadFailed', { uploadDialog: this, fileName: this._getFilename(fileList[i].name), fileType: fileList[i].type });
                }
            }
        }
    }


    // PRIVATE
    // LISTENERS
    #onDropZoneDrop(e) {
        if (!this.disabled && e.validMime && e.allowed) {
            this._uploadFiles(e.nodeEvent.dataTransfer.files);
        }
    }

    #onFilePaste(e) {
        if (this.disabled || !this._observePaste || !kijs.isArray(this._dropZones)) {
            return;
        }

        // Wenn die Klasse mit einer DropZone verknüpft ist, nur pasten, wenn gerendert
        if (this._dropZones.length > 0) {
            let rendered = false;
            kijs.Array.each(this._dropZones, function(dz) {
                if (dz.parent) {
                    rendered = true;
                }
            }, this);

            if (!rendered) {
                return;
            }
        }

        // Dateien aus Zwischenablage lesen
        let files = e.clipboardData ? e.clipboardData.files : null;
        if (!files || !files.length || files.length === 0) {
            return;
        }

        e.preventDefault();
        this._uploadFiles(files);
    }

    #onProgress(e) {
        let percent = null;

        if (e.nodeEvent.lengthComputable && e.nodeEvent.total > 0) {
            percent = Math.round(100 / e.nodeEvent.total * e.nodeEvent.loaded);
            percent = Math.min(100, Math.max(0, percent)); // Wert zwischen 0-100
        }

        this.raiseEvent('progress', { uploadDialog: this, nodeEvent: e.nodeEvent, uploadId: e.ajaxConfig.uploadId, percent: percent });
    }

    #onUploadEnd(e) {
        kijs.Array.remove(this._currentUploadIds, e.request.uploadId);

        // Fehlermeldung vom Server
        let errorMsg = '';
        if (!e.response || !kijs.isEmpty(e.errorType)) {
            errorMsg = errorMsg || e.errorMsg || kijs.getText('Es ist ein unbekannter Fehler aufgetreten') + '.';
        }

        // Antwort vom Server
        let uploadResponse = e.response ? (e.response.upload || null) : null;

        // Responses in Objekt sammeln
        this._uploadResponses[e.request.uploadId] = uploadResponse;

        // Event werfen
        this.raiseEvent('upload', { uploadDialog: this, uploadResponse: uploadResponse, errorMsg: errorMsg, uploadId: e.request.uploadId });

        // Wenn alle laufenden Uploads abgeschlossen sind, uploadEnd ausführen.
        if (this._currentUploadIds.length === 0) {
            this.raiseEvent('uploadEnd', { uploadDialog: this, uploadResponses: this._uploadResponses });
        }
    }



    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct() {
        this._dropZones = null;
        this._contentTypes = null;
        this._currentUploadIds = null;
        this._directory = null;
        this._disabled = null;
        this._dropZones = null;
        this._fileExtensions = null;
        this._maxFilesize = null;
        this._multiple = null;
        this._sanitizeFilename = null;
        this._uploadId = null;
        this._uploadResponses = null;
        this._fileNameHeader = null;
        this._pathNameHeader = null;
        this._validMediaTypes = null;
        super.destruct();

        // remove paste listener
        if (this._pasteCb) {
            window.removeEventListener('paste', this._pasteCb);
            this._pasteCb = null;
        }
    }
};
