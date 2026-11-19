/* global kijs, this */

// --------------------------------------------------------------
// kijs.FileUpload
// --------------------------------------------------------------
/**
 * Lädt Dateien per Ajax auf den Server hoch. Die Dateien kommen aus dem Dialog des Browsers
 * (showFileOpenDialog()) oder werden direkt übergeben (upload()), z.B. von einer kijs.gui.DropZone
 * oder aus der Zwischenablage. Enthält keine Oberfläche, dafür gibt es kijs.gui.FileUpload.
 *
 * Jede Datei wird einzeln per POST an url gesendet: der Dateiinhalt als Body, Dateiname und
 * relativer Ordner URL-codiert in den Headern fileNameHeader und pathNameHeader. Die Antwort wird
 * als JSON-Objekt erwartet. Ist sie kein Objekt oder enthält sie errorMsg oder errorType, gilt der
 * Upload als fehlgeschlagen.
 * Die Eigenschaft upload der Antwort wird als uploadResponse weitergegeben.
 *
 * Erlaubt sind Dateien, die zu contentTypes oder fileExtensions passen. Ist beides leer, sind
 * alle Dateitypen erlaubt.
 *
 * @example
 * const fu = new kijs.FileUpload({
 *    url: 'upload.php',
 *    contentTypes: ['image']
 * });
 * fu.on('uploadEnd', function(e) {
 *     console.log(e.uploadResponses, e.errorMsgs);
 * });
 * fu.showFileOpenDialog();
 *
 * @fires beforeUpload  Vor dem Upload einer zugelassenen Datei. Gibt ein Listener false zurück,
 *                      wird die Datei nicht hochgeladen (z.B. um sie im Browser zu verarbeiten).
 *                      e: fileUpload, uploadId, file, fileName, fileDir, fileType
 * @fires fileRejected  Datei abgewiesen (Typ, Grösse oder Anzahl).
 *                      e: fileUpload, file, fileName, errorMsg
 * @fires progress  Fortschritt eines Uploads.
 *                  e: fileUpload, uploadId, loaded, total (oder null), percent (0-100 oder null)
 * @fires upload  Ein Upload ist abgeschlossen (auch im Fehlerfall).
 *                e: fileUpload, uploadId, response, uploadResponse, errorMsg ('' = kein Fehler)
 * @fires uploadEnd  Alle laufenden Uploads sind abgeschlossen. e: fileUpload,
 *                   uploadResponses (uploadId => uploadResponse), errorMsgs (uploadId => errorMsg)
 * @fires uploadStart  Der Upload einer Datei wurde gestartet.
 *                     e: fileUpload, uploadId, file, fileName, fileDir, fileType
 */
kijs.FileUpload = class kijs_FileUpload extends kijs.Observable {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        this._defaultConfig = {};

        this._contentTypes = [];
        this._directory = false;
        this._fileExtensions = [];
        this._fileNameHeader = 'X-Filename';
        this._headers = {};
        this._maxFileSize = null;
        this._multiple = true;
        this._parameters = {};
        this._pathNameHeader = 'X-Filepath';
        this._sanitizeFileName = false;
        this._url = '.';

        this._errorMsgs = {};           // intern: uploadId => errorMsg der laufenden Serie
        this._nextUploadId = 1;         // intern
        this._runningUploadIds = [];    // intern
        this._uploadResponses = {};     // intern: uploadId => uploadResponse der laufenden Serie

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        this._configMap = {
            contentTypes: { target: 'contentTypes' },
            directory: { target: 'directory' },
            fileExtensions: { target: 'fileExtensions' },
            fileNameHeader: true,   // {String} Name des Headers mit dem Dateinamen. Default: 'X-Filename'
            headers: { target: 'headers' },
            maxFileSize: { target: 'maxFileSize' },
            multiple: { target: 'multiple' },
            on: { prio: 1500, fn: 'assignListeners' },  // {Object} Listeners, z.B. { uploadEnd: fn, context: this }. Ohne context gilt dieses Objekt
            parameters: { target: 'parameters' },
            pathNameHeader: true,   // {String} Name des Headers mit dem relativen Ordner (bei Ordner-Upload). Default: 'X-Filepath'
            sanitizeFileName: { target: 'sanitizeFileName' },
            url: { target: 'url' }
        };

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config);
        }
    }



    // --------------------------------------------------------------
    // STATIC GETTERS / SETTERS
    // --------------------------------------------------------------
    /**
     * Gültige Media-Types (erster Teil eines MIME-Types)
     * @type {String[]}
     */
    static get validMediaTypes() {
        return ['application', 'audio', 'example', 'font', 'image', 'message', 'model', 'multipart', 'text', 'video'];
    }



    // --------------------------------------------------------------
    // STATICS
    // --------------------------------------------------------------
    /**
     * Normalisiert eine Liste von MIME-Types: Kleinschreibung, nur der Media-Type (z.B. 'image')
     * wird zu 'image/*'. Wirft einen kijs.Error bei ungültigem Media-Type.
     * @param {String|String[]|null} contentTypes
     * @returns {String[]}
     */
    static normalizeContentTypes(contentTypes) {
        if (kijs.isEmpty(contentTypes)) {
            return [];
        }
        if (!kijs.isArray(contentTypes)) {
            contentTypes = [contentTypes];
        }

        const ret = [];
        kijs.Array.each(contentTypes, function(contentType) {
            const parts = kijs.toString(contentType).trim().toLowerCase().split('/', 2);
            if (!kijs.Array.contains(kijs.FileUpload.validMediaTypes, parts[0])) {
                throw new kijs.Error(`invalid content type "${contentType}"`);
            }
            if (parts.length === 1 || parts[1] === '') {
                parts[1] = '*';
            }
            ret.push(parts.join('/'));
        }, this);

        return ret;
    }



    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    /**
     * Erlaubte MIME-Types, z.B. ['image/png'] oder ['image'] (= 'image/*'). Der Setter akzeptiert
     * auch einen String und wirft einen kijs.Error bei ungültigem Media-Type. Leer = keine
     * Einschränkung durch den MIME-Type. Default: []
     * @type {String[]}
     */
    get contentTypes() { return this._contentTypes; }
    set contentTypes(val) { this._contentTypes = kijs.FileUpload.normalizeContentTypes(val); }

    /**
     * Im Dialog des Browsers einen ganzen Ordner statt Dateien auswählen? Default: false
     * @type {Boolean}
     */
    get directory() { return this._directory; }
    set directory(val) { this._directory = !!val; }

    /**
     * Erlaubte Dateiendungen, z.B. ['.pdf'] oder ['pdf'] (der Punkt wird ergänzt, Gross-/Kleinschreibung
     * spielt keine Rolle). Der Setter akzeptiert auch einen String. Default: []
     * @type {String[]}
     */
    get fileExtensions() { return this._fileExtensions; }
    set fileExtensions(val) {
        if (kijs.isEmpty(val)) {
            val = [];
        }
        if (!kijs.isArray(val)) {
            val = [val];
        }

        this._fileExtensions = [];
        kijs.Array.each(val, function(ext) {
            ext = kijs.toString(ext).trim().toLowerCase();
            if (ext.charAt(0) !== '.') {
                ext = '.' + ext;
            }
            this._fileExtensions.push(ext);
        }, this);
    }

    /**
     * Zusätzliche Header, die bei jedem Upload mitgesendet werden. Kein Objekt = {}. Default: {}
     * @type {Object}
     */
    get headers() { return this._headers; }
    set headers(val) { this._headers = kijs.isObject(val) ? val : {}; }

    /**
     * Laufen gerade Uploads?
     * @type {Boolean}
     */
    get isUploading() { return this._runningUploadIds.length > 0; }

    /**
     * Maximale Dateigrösse in Bytes. null = keine Begrenzung. Default: null
     * @type {Number|null}
     */
    get maxFileSize() { return this._maxFileSize; }
    set maxFileSize(val) {
        if (kijs.isEmpty(val)) {
            this._maxFileSize = null;
            return;
        }
        val = parseInt(val);
        if (isNaN(val) || val < 0) {
            throw new kijs.Error(`config "maxFileSize" must be a positive number`);
        }
        this._maxFileSize = val;
    }

    /**
     * Dürfen mehrere Dateien gleichzeitig hochgeladen werden? Default: true
     * @type {Boolean}
     */
    get multiple() { return this._multiple; }
    set multiple(val) { this._multiple = !!val; }

    /**
     * Zusätzliche GET-Parameter für die URL. Kein Objekt = {}. Default: {}
     * @type {Object}
     */
    get parameters() { return this._parameters; }
    set parameters(val) { this._parameters = kijs.isObject(val) ? val : {}; }

    /**
     * Dateinamen bereinigen? Sonderzeichen werden ersetzt, alle Zeichen ausser a-z, A-Z, 0-9 und -
     * werden zu _. Default: false
     * @type {Boolean}
     */
    get sanitizeFileName() { return this._sanitizeFileName; }
    set sanitizeFileName(val) { this._sanitizeFileName = !!val; }

    /**
     * URL, an welche die Dateien gesendet werden. Default: '.'
     * @type {String}
     */
    get url() { return this._url; }
    set url(val) { this._url = val; }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    /**
     * Wendet die Konfigurations-Eigenschaften an
     * @param {Object} config
     * @returns {undefined}
     */
    applyConfig(config={}) {
        kijs.Object.assignConfig(this, config, this._configMap);
    }

    /**
     * Prüft, ob eine Datei hochgeladen werden darf (Typ und Grösse).
     * @param {File} file
     * @returns {String|null} Fehlermeldung oder null, wenn die Datei erlaubt ist
     */
    checkFile(file) {
        const fileName = this._getFileName(file.name);

        if (!this._isFileTypeAllowed(file)) {
            return kijs.getText('Der Dateityp von "%1" ist nicht erlaubt', '', fileName) + '.';
        }

        if (this._maxFileSize !== null && file.size > this._maxFileSize) {
            return kijs.getText('Die Datei "%1" ist zu gross (max. %2)', '', [fileName, this._formatFileSize(this._maxFileSize)]) + '.';
        }

        return null;
    }

    /**
     * Prüft, ob ein MIME-Type erlaubt sein könnte. Für Fälle, in denen nur der Typ bekannt ist,
     * z.B. beim Darüberziehen über eine kijs.gui.DropZone. Ist die Entscheidung ohne Dateinamen
     * nicht möglich (fileExtensions gesetzt oder Typ leer), wird true zurückgegeben.
     * @param {String} contentType
     * @returns {Boolean}
     */
    isContentTypeAllowed(contentType) {
        if (this._contentTypes.length === 0 || this._fileExtensions.length > 0 || !contentType) {
            return true;
        }
        return this._matchContentType(contentType);
    }

    /**
     * Öffnet den Dialog des Browsers zum Auswählen von Dateien. Die ausgewählten Dateien werden
     * mit upload() hochgeladen.
     * @param {Boolean|null} [multiple=null] Dürfen mehrere Dateien ausgewählt werden? null = this.multiple
     * @param {Boolean|null} [directory=null] Einen ganzen Ordner auswählen? null = this.directory
     * @returns {undefined}
     */
    showFileOpenDialog(multiple=null, directory=null) {
        multiple = multiple === null ? this._multiple : !!multiple;
        directory = directory === null ? this._directory : !!directory;

        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        if (multiple) {
            input.setAttribute('multiple', 'multiple');
        }
        if (directory) {
            input.setAttribute('webkitdirectory', 'webkitdirectory');
        }

        const acceptTypes = kijs.Array.concat(this._contentTypes, this._fileExtensions);
        if (acceptTypes.length > 0) {
            input.setAttribute('accept', acceptTypes.join(','));
        }

        input.addEventListener('change', () => {
            this.upload(input.files);
        }, { once: true });

        // öffnen
        input.click();
    }

    /**
     * Prüft die Dateien (Anzahl, Typ, Grösse) und lädt die zugelassenen hoch. Für die anderen wird
     * fileRejected ausgelöst.
     * @param {FileList|File[]|File} files
     * @returns {Number[]} uploadIds der gestarteten Uploads
     */
    upload(files) {
        const uploadIds = [];

        if (kijs.isEmpty(files)) {
            return uploadIds;
        }
        files = files instanceof File ? [files] : Array.from(files);

        // Anzahl
        if (!this._multiple && files.length > 1) {
            const errorMsg = kijs.getText('Es darf nur eine Datei hochgeladen werden') + '.';
            kijs.Array.each(files, function(file) {
                this._raiseFileRejected(file, errorMsg);
            }, this);
            return uploadIds;
        }

        kijs.Array.each(files, function(file) {
            const errorMsg = this.checkFile(file);
            if (errorMsg) {
                this._raiseFileRejected(file, errorMsg);
            } else {
                const uploadId = this._uploadFile(file);
                if (uploadId !== null) {
                    uploadIds.push(uploadId);
                }
            }
        }, this);

        return uploadIds;
    }


    // PROTECTED
    /**
     * Formatiert eine Dateigrösse für die Anzeige, z.B. '1.5 MB'
     * @param {Number} bytes
     * @returns {String}
     */
    _formatFileSize(bytes) {
        const units = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        let i = 0;
        while (bytes >= 1024 && i < units.length - 1) {
            bytes /= 1024;
            i++;
        }
        return kijs.Number.format(bytes, i === 0 ? 0 : 1) + ' ' + units[i];
    }

    /**
     * Gibt den relativen Ordner einer Datei zurück (nur bei Ordner-Upload, sonst '')
     * @param {File} file
     * @returns {String}
     */
    _getFileDir(file) {
        const path = file.webkitRelativePath || '';
        const pos = path.lastIndexOf('/');
        return pos > 0 ? path.substr(0, pos) : '';
    }

    /**
     * Gibt den Dateinamen zurück, mit sanitizeFileName bereinigt.
     * @param {String} fileName
     * @returns {String}
     */
    _getFileName(fileName) {
        if (this._sanitizeFileName) {
            fileName = kijs.Char.replaceSpecialChars(fileName);
            const fileNameParts = fileName.split('.');
            let extension = '';
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
     * Prüft, ob der Typ einer Datei erlaubt ist: passt der MIME-Type zu contentTypes
     * oder die Endung zu fileExtensions?
     * @param {File} file
     * @returns {Boolean}
     */
    _isFileTypeAllowed(file) {
        // Ohne Einschränkung sind alle Dateien erlaubt
        if (this._contentTypes.length === 0 && this._fileExtensions.length === 0) {
            return true;
        }

        if (file.type && this._contentTypes.length > 0 && this._matchContentType(file.type)) {
            return true;
        }

        const pos = file.name.lastIndexOf('.');
        if (pos > 0 && this._fileExtensions.length > 0) {
            const extension = file.name.substr(pos).toLowerCase();
            if (kijs.Array.contains(this._fileExtensions, extension)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Passt ein MIME-Type zu contentTypes (genauer Typ oder 'typ/*')?
     * @param {String} contentType
     * @returns {Boolean}
     */
    _matchContentType(contentType) {
        contentType = contentType.toLowerCase();
        const mediaType = contentType.split('/', 1)[0];
        return kijs.Array.contains(this._contentTypes, contentType) ||
                kijs.Array.contains(this._contentTypes, mediaType + '/*');
    }

    /**
     * Löst das Event fileRejected aus
     * @param {File} file
     * @param {String} errorMsg
     * @returns {undefined}
     */
    _raiseFileRejected(file, errorMsg) {
        this.raiseEvent('fileRejected', {
            fileUpload: this,
            file: file,
            fileName: this._getFileName(file.name),
            errorMsg: errorMsg
        });
    }

    /**
     * Löst beforeUpload aus und sendet die Datei an url.
     * @param {File} file
     * @returns {Number|null} uploadId oder null, wenn der Upload durch beforeUpload verhindert wurde
     */
    _uploadFile(file) {
        const uploadId = this._nextUploadId++;
        const fileName = this._getFileName(file.name);
        const fileDir = this._getFileDir(file);
        const fileType = file.type || 'application/octet-stream';

        const eventArgs = {
            fileUpload: this,
            uploadId: uploadId,
            file: file,
            fileName: fileName,
            fileDir: fileDir,
            fileType: fileType
        };

        if (this.raiseEvent('beforeUpload', Object.assign({}, eventArgs)) === false) {
            return null;
        }

        const headers = Object.assign({}, this._headers);
        headers[this._fileNameHeader] = encodeURIComponent(fileName);
        headers[this._pathNameHeader] = encodeURIComponent(fileDir);
        headers['Content-Type'] = fileType;

        this._runningUploadIds.push(uploadId);

        kijs.Ajax.request({
            url: this._url,
            parameters: Object.assign({}, this._parameters),
            method: 'POST',
            format: 'json',
            headers: headers,
            postData: file,
            uploadProgressFn: (e) => { this.#onUploadProgress(e, uploadId); }
        }).then((e) => {
            this.#onUploadEnd(e, uploadId);
        });

        this.raiseEvent('uploadStart', Object.assign({}, eventArgs));

        return uploadId;
    }


    // PRIVATE
    // LISTENERS
    #onUploadEnd(e, uploadId) {
        // Falls inzwischen zerstört
        if (!this._runningUploadIds) {
            return;
        }

        kijs.Array.remove(this._runningUploadIds, uploadId);

        // Fehlermeldung (Verbindung oder Server)
        let errorMsg = '';
        if (e.errorMsg) {
            errorMsg = e.errorMsg;
        } else if (kijs.isObject(e.response) && !kijs.isEmpty(e.response.errorMsg)) {
            errorMsg = e.response.errorMsg;
        } else if (!kijs.isObject(e.response) || !kijs.isEmpty(e.response.errorType)) {
            // keine oder ungültige Antwort (kein JSON-Objekt) oder errorType ohne errorMsg
            errorMsg = kijs.getText('Es ist ein unbekannter Fehler aufgetreten') + '.';
        }

        // Antwort vom Server
        const uploadResponse = kijs.isObject(e.response) && kijs.isDefined(e.response.upload) ? e.response.upload : null;

        this._uploadResponses[uploadId] = uploadResponse;
        if (errorMsg) {
            this._errorMsgs[uploadId] = errorMsg;
        }

        this.raiseEvent('upload', {
            fileUpload: this,
            uploadId: uploadId,
            response: e.response,
            uploadResponse: uploadResponse,
            errorMsg: errorMsg
        });

        // Wenn alle laufenden Uploads abgeschlossen sind: uploadEnd
        if (this._runningUploadIds && this._runningUploadIds.length === 0) {
            const uploadResponses = this._uploadResponses;
            const errorMsgs = this._errorMsgs;
            this._uploadResponses = {};
            this._errorMsgs = {};

            this.raiseEvent('uploadEnd', {
                fileUpload: this,
                uploadResponses: uploadResponses,
                errorMsgs: errorMsgs
            });
        }
    }

    #onUploadProgress(e, uploadId) {
        const nodeEvent = e.nodeEvent;
        let total = null;
        let percent = null;

        if (nodeEvent.lengthComputable && nodeEvent.total > 0) {
            total = nodeEvent.total;
            percent = Math.round(100 / total * nodeEvent.loaded);
            percent = Math.min(100, Math.max(0, percent));
        }

        this.raiseEvent('progress', {
            fileUpload: this,
            uploadId: uploadId,
            loaded: nodeEvent.loaded,
            total: total,
            percent: percent
        });
    }



    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct() {
        super.destruct();

        // Variablen (Objekte/Arrays) leeren
        this._contentTypes = null;
        this._errorMsgs = null;
        this._fileExtensions = null;
        this._headers = null;
        this._parameters = null;
        this._runningUploadIds = null;
        this._uploadResponses = null;
    }

};
