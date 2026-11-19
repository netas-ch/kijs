/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.DropZone
// --------------------------------------------------------------
/**
 * Container, auf den Dateien gezogen werden können. Beim Darüberziehen erhält er die CSS-Klasse
 * dragOverCls. Ist ein fileUpload zugewiesen, werden die abgelegten Dateien damit hochgeladen.
 * Dessen contentTypes und multiple bestimmen auch, ob die Dateien abgelegt werden dürfen:
 * wenn nicht, erhält die DropZone zusätzlich dragOverForbiddenCls und der Browser zeigt
 * an, dass nicht abgelegt werden kann.
 *
 * Reagiert nur auf Dateien, nicht auf gezogenen Text oder Elemente. Ist die DropZone deaktiviert,
 * werden keine Events ausgelöst und es kann nichts abgelegt werden.
 *
 * @example
 * const fu = new kijs.FileUpload({ url: 'upload.php', contentTypes: ['image'] });
 * new kijs.gui.DropZone({ html: 'Bilder hierher ziehen', fileUpload: fu });
 *
 * @fires dragEnter  Dateien werden über die DropZone gezogen. e: dropZone, nodeEvent, allowed
 * @fires dragLeave  Dateien werden aus der DropZone gezogen. e: dropZone, nodeEvent
 * @fires dragOver  Laufend beim Darüberziehen. e: dropZone, nodeEvent, allowed
 * @fires drop  Dateien wurden abgelegt. Gibt ein Listener false zurück, werden sie nicht an den
 *              fileUpload übergeben. e: dropZone, nodeEvent, files, allowed
 */
kijs.gui.DropZone = class kijs_gui_DropZone extends kijs.gui.Container {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        this._dragOverCls = 'kijs-dragover';
        this._dragOverForbiddenCls = 'kijs-dragover-forbidden';
        this._fileUpload = null;

        this._allowed = true;       // intern: dürfen die gezogenen Dateien abgelegt werden?
        this._dragEnterCount = 0;   // intern: dragenter/dragleave kommen auch von Kindelementen

        // CSS
        this._dom.clsAdd('kijs-dropzone');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            dragOverCls: true,              // {String} CSS-Klasse beim Darüberziehen. Default: 'kijs-dragover'
            dragOverForbiddenCls: true,     // {String} CSS-Klasse, wenn die Dateien nicht abgelegt werden dürfen. Default: 'kijs-dragover-forbidden'
            fileUpload: { target: 'fileUpload' }
        });

        // Drag-Events kommen nicht vom Element, sondern von dieser Klasse
        this._eventForwardsRemove('dragEnter', this._dom);
        this._eventForwardsRemove('dragOver', this._dom);
        this._eventForwardsRemove('dragLeave', this._dom);
        this._eventForwardsRemove('drop', this._dom);

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }

        // Events für DOM mappen
        this._dom.on('dragEnter', this.#onDragEnter, this);
        this._dom.on('dragLeave', this.#onDragLeave, this);
        this._dom.on('dragOver', this.#onDragOver, this);
        this._dom.on('drop', this.#onDrop, this);
    }



    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    /**
     * kijs.FileUpload, mit dem die abgelegten Dateien hochgeladen werden. null = die Dateien
     * werden nur mit dem Event drop weitergegeben. Andere Werte werfen einen kijs.Error.
     * @type {kijs.FileUpload|null}
     */
    get fileUpload() { return this._fileUpload; }
    set fileUpload(val) {
        if (!kijs.isEmpty(val) && !(val instanceof kijs.FileUpload)) {
            throw new kijs.Error(`config "fileUpload" must be of type kijs.FileUpload`);
        }
        this._fileUpload = val || null;
    }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // PROTECTED
    /**
     * Prüft, ob die gezogenen Dateien abgelegt werden dürfen (multiple und contentTypes vom
     * fileUpload). Ohne fileUpload ist alles erlaubt.
     * @param {DataTransfer} dataTransfer
     * @returns {Boolean}
     */
    _checkAllowed(dataTransfer) {
        if (!this._fileUpload || !dataTransfer || !dataTransfer.items) {
            return true;
        }

        const items = Array.from(dataTransfer.items).filter(item => item.kind === 'file');

        if (!this._fileUpload.multiple && items.length > 1) {
            return false;
        }

        for (const item of items) {
            if (!this._fileUpload.isContentTypeAllowed(item.type)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Werden Dateien gezogen?
     * @param {DataTransfer} dataTransfer
     * @returns {Boolean}
     */
    _isFileDrag(dataTransfer) {
        return !!dataTransfer && kijs.Array.contains(Array.from(dataTransfer.types || []), 'Files');
    }

    /**
     * Entfernt die CSS-Klassen und setzt den Zustand zurück
     * @returns {undefined}
     */
    _resetDragOver() {
        this._allowed = true;
        this._dragEnterCount = 0;
        this._dom.clsRemove(this._dragOverCls);
        this._dom.clsRemove(this._dragOverForbiddenCls);
    }


    // PRIVATE
    // LISTENERS
    #onDragEnter(e) {
        if (this.disabled || !this._isFileDrag(e.nodeEvent.dataTransfer)) {
            return;
        }

        this._dragEnterCount++;
        if (this._dragEnterCount > 1) {
            return;
        }

        this._allowed = this._checkAllowed(e.nodeEvent.dataTransfer);

        this._dom.clsAdd(this._dragOverCls);
        if (!this._allowed) {
            this._dom.clsAdd(this._dragOverForbiddenCls);
        }

        this.raiseEvent('dragEnter', { dropZone: this, nodeEvent: e.nodeEvent, allowed: this._allowed });
    }

    #onDragLeave(e) {
        if (this._dragEnterCount === 0) {
            return;
        }

        this._dragEnterCount--;
        if (this._dragEnterCount > 0) {
            return;
        }

        this._resetDragOver();
        this.raiseEvent('dragLeave', { dropZone: this, nodeEvent: e.nodeEvent });
    }

    #onDragOver(e) {
        if (!this._isFileDrag(e.nodeEvent.dataTransfer)) {
            return;
        }

        // Ohne preventDefault würde der Browser die Datei selbst öffnen
        e.nodeEvent.preventDefault();

        if (this.disabled || !this._allowed) {
            e.nodeEvent.dataTransfer.dropEffect = 'none';
            return;
        }

        e.nodeEvent.dataTransfer.dropEffect = 'copy';
        this.raiseEvent('dragOver', { dropZone: this, nodeEvent: e.nodeEvent, allowed: this._allowed });
    }

    #onDrop(e) {
        if (!this._isFileDrag(e.nodeEvent.dataTransfer)) {
            return;
        }

        e.nodeEvent.preventDefault();

        const allowed = this._allowed;
        this._resetDragOver();

        if (this.disabled || !allowed) {
            return;
        }

        const files = Array.from(e.nodeEvent.dataTransfer.files);

        if (this.raiseEvent('drop', { dropZone: this, nodeEvent: e.nodeEvent, files: files, allowed: allowed }) === false) {
            return;
        }

        if (this._fileUpload) {
            this._fileUpload.upload(files);
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

        // Variablen (Objekte/Arrays) leeren
        this._fileUpload = null;

        // Basisklasse entladen
        super.destruct(true);
    }

};
