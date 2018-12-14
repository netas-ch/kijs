/* global kijs, this */

// --------------------------------------------------------------
// kijs.UploadDialog
// --------------------------------------------------------------

/**
 * Die Klasse öffnet ein Fenster zum Auswählen einer Datei zum Upload
 * oder nimmt die Datei über eine Dropzone entgegen. Nach Auswahl wird
 * die Datei an den Server gesendet.
 * 
 *  * EVENTS
 * ----------
 * failUpload   -- MIME nicht erlaubt
 * startUpload  -- Upload wird gestartet
 * progress     -- Fortschritt beim Upload
 * upload       -- Upload abgeschlossen
 * endUpload    -- alle Uploads in der Schlange abgeschlossen
 *
 */
kijs.UploadDialog = class kijs_UploadDialog extends kijs.Observable {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        this._uploadId = 1;
        this._dropZones = [];
        this._contentTypes = [];
        this._currentUploadIds = [];
        this._uploadResponses = {};
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
            ajaxUrl: 'index.php',
            multiple: true,
            directory: false,
            dropZones: [],
            filenameHeader: 'X-Filename',
            pathnameHeader: 'X-Filepath',
            maxFilesize: null
        }, config);

        // Mapping für die Zuweisung der Config-Eigenschaften
        this._configMap = {
            ajaxUrl: true,
            multiple: true,
            directory: true,
            filenameHeader: true,
            pathnameHeader: true,
            maxFilesize: true,
            dropZones: { target: 'dropZone' },
            contentTypes: { target: 'contentTypes' }
        };

        // Config anwenden
        if (kijs.isObject(config)) {
            this.applyConfig(config, true);
        }
    }


    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------


    get contentTypes() { return this._contentTypes; }
    set contentTypes(val) {
        if (!kijs.isArray(val)) {
            val = [val];
        }

        // prüfen, ob der media-type gültig ist.
        kijs.Array.each(val, function(contentType) {
            let parts = contentType.toLowerCase().split('/', 2);
            if (!kijs.Array.contains(this._validMediaTypes, parts[0])) {
                throw new Error('invalid media type "' + contentType + '"');
            }
            this._contentTypes.push(parts.join('/'));
        }, this);
    }

    get dropZones() { return this._dropZones; }
    set dropZones(val) { this.addDropZone(val); }

    get directory() { return this._directory; }
    set directory(val) { this._directory = !!val; }

    get multiple() { return this._multiple; }
    set multiple(val) { 
        if (val === true && this._browserSupportsDirectoryUpload()) {
            this._multiple = true;             
        } else {
            this._multiple = false;
        }
    }

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
                throw new Error('added zone not of type kijs.gui.DropZone');
            }

            // hinzufügen falls noch nicht da.
            if (!kijs.Array.contains(this._dropZones, dropZone)) {
                
                // Events entfernen und wieder setzen.
                dropZone.off(null, null, this);
                dropZone.on('drop', this._onDropZoneDrop, this);
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
    showFileSelectDialog(multiple=null, directory=null) {
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

        kijs.Dom.addEventListener('change', input, function(e) {
            if (e.nodeEvent.target && e.nodeEvent.target.files) {
                this._uploadFiles(e.nodeEvent.target.files);
            }
        }, this);

        // öffnen
        input.click();
    }

    // PROTECTED
    /**
     * Prüft, ob der Browser das hochladen von ganzen Ordner unterstützt.
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
    
    _checkMime(filetype) {
        if (filetype && this._contentTypes.length > 0) {
            let parts = filetype.split('/', 2);
            if (!kijs.Array.contains(this._contentTypes, parts[0]) && !kijs.Array.contains(this._contentTypes, parts.join('/'))) {
                return false;
            }
        }
        return true;
    }

    _onDropZoneDrop(e) {
        this._uploadFiles(e.nodeEvent.files);
    }

    _uploadFiles(fileList) {
        this._uploadResponses = {};
        if (fileList) {            
            for (let i=0; i<fileList.length; i++) {
                if (this._checkMime(fileList[i].type)) {
                    this._uploadFile(fileList[i]);
                } else {
                    this.raiseEvent('failUpload', this, fileList[i].name, fileList[i].type);
                }
            }
        }
    }

    _uploadFile(file) {
        let uploadId = this._uploadId++,
            headers = {},
            filename = file.name,
            filedir = this._getRelativeDir(file.name, file.relativePath || file.webkitRelativePath),
            filetype = file.type || 'application/octet-stream';

        headers[this._filenameHeader] = filename;
        headers[this._pathnameHeader] = filedir;
        headers['Content-Type'] = filetype;

        kijs.Ajax.request({
            url: this._ajaxUrl,
            method: 'POST',
            format: 'json',
            headers: headers,
            postData: file,
            fn: this._onEndUpload,
            progressFn: this._onProgress,
            context: this,
            uploadId: uploadId
        });

        this._currentUploadIds.push(uploadId);
        this.raiseEvent('startUpload', this, filename, filedir, filetype, uploadId);
    }

    _onEndUpload(val, config, error) {
        kijs.Array.remove(this._currentUploadIds, config.uploadId);

        // Fehlermeldung vom server
        if (!val || !val.success) {
            error = error || val.msg || 'Es ist ein unbekannter Fehler aufgetreten.';
        }

        // Antwort vom Server
        let uploadResponse = val ? (val.upload || null) : null;

        // Responses in Objekt sammeln
        this._uploadResponses[config.uploadId] = uploadResponse;

        // Event werfen
        this.raiseEvent('upload', this, uploadResponse, error, config.uploadId);

        // wenn alle laufenden Uploads abgeschlossen sind, endUpload ausführen.
        if (this._currentUploadIds.length === 0) {
            this.raiseEvent('endUpload', this, this._uploadResponses);
        }
    }

    _onProgress(e, config) {
        let percent = null;

        if (e.lengthComputable && e.total > 0) {
            percent = Math.round(100 / e.total * e.loaded);
            percent = Math.min(100, Math.max(0, percent)); // Wert zwischen 0-100
        }

        this.raiseEvent('progress', this, e, config.uploadId, percent);
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



    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------

    destruct() {
        this._dropZones = [];
        this._contentTypes = [];
        super.destruct();
    }
};