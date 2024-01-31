/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.DropZone
// --------------------------------------------------------------
/**
 * DropZone für Dateitransfer. Dem Container wird beim Dragover eine CSS-Klasse zugewiesen, um die Zone zu markieren.
 *
 * KLASSENHIERARCHIE
 * kijs.gui.Element
 *  kijs.gui.Container
 *   kijs.gui.DropZone
 *
 * CONFIG-Parameter (es gelten auch die Config-Parameter der Basisklassen)
 * ----------------
 * contentTypes    Array|String Ein (oder ein Array von) Content-Types. z.B. "image/jpeg" für JPG's oder nur "image" alle Bildtypen.
 *
 * FUNKTIONEN (es gelten auch die Funktionen der Basisklassen)
 * ----------
 *
 *
 * EIGENSCHAFTEN (es gelten auch die Eigenschaften der Basisklassen)
 * -------------
 * contentTypes
 *
 *
 * EVENTS
 * ----------
 *
 *
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
        this._contentTypes = [];
        this._multiple = true;
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

        // CSS
        this._dom.clsAdd('kijs-dropzone');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            dragOverCls: true,
            dragOverForbiddenCls: true,
            contentTypes: { target: 'contentTypes' }
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
        this._dom.on('dragOver', this.#onDragOver, this);
        this._dom.on('dragLeave', this.#onDragLeave, this);
        this._dom.on('drop', this.#onDrop, this);

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
        
        kijs.Array.each(val, function(contentType) {
            let parts = contentType.toLowerCase().split('/', 2);
            if (!kijs.Array.contains(this._validMediaTypes, parts[0])) {
                throw new kijs.Error('invalid content type "' + contentType + '"');
            }
            this._contentTypes.push(parts.join('/'));
        }, this);
    }

    get multiple() { return this._multiple; }

    set multiple(val) { this._multiple = val; }

    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // PROTECTED
    _checkMime(dataTransferItems) {
        for (let i=0; i<dataTransferItems.length; i++) {
            if (dataTransferItems[i].type) {
                let mime = dataTransferItems[i].type.toLowerCase();
                let mimeParts = dataTransferItems[i].type.split('/', 2);
                if (!kijs.Array.contains(this._contentTypes, mime) && !kijs.Array.contains(this._contentTypes, mimeParts[0] + '/*')) {
                    return false;
                }
            }
        }
        return true;
    }


    // PRIVATE
    // LISTENERS
    #onDragEnter(e) {
        if (!this.disabled) {
            this._dom.clsAdd(this._dragOverCls);
            this.raiseEvent('dragEnter', e);
        }
    }

    #onDragLeave(e) {
        if (!this.disabled) {
            this._dom.clsRemove(this._dragOverCls);
            this._dom.clsRemove(this._dragOverForbiddenCls);
            this.raiseEvent('dragLeave', e);
        }
    }

    #onDragOver(e) {
        e.nodeEvent.preventDefault();

        if (!this.disabled) {
            // 'forbidden' Klasse, falls ungültiger Dateityp
            let valid = true;
            if (e.nodeEvent.dataTransfer && e.nodeEvent.dataTransfer.items && this._contentTypes.length > 0) {
                if (!this._checkMime(e.nodeEvent.dataTransfer.items)) {
                    valid = false;
                    this._dom.clsAdd(this._dragOverForbiddenCls);
                }
            }
            e.validMime = valid;

            // 'forbidden' Klasse, falls nicht mehrere Dateien hinzugefügt werden dürfen
            let allowed = true;
            if (e.nodeEvent.dataTransfer && e.nodeEvent.dataTransfer.items) {
                if (!this._multiple && e.nodeEvent.dataTransfer.items.length > 1) {
                    allowed = false;
                    this._dom.clsAdd(this._dragOverForbiddenCls);
                }
            }
            e.allowed = allowed;

            this._dom.clsAdd(this._dragOverCls);
            this.raiseEvent('dragOver', e);
        }
    }

    #onDrop(e) {
        e.nodeEvent.preventDefault();

        if (!this.disabled) {
            this._dom.clsRemove(this._dragOverCls);
            this._dom.clsRemove(this._dragOverForbiddenCls);

            // Dateityp überprüfen
            let valid = true;
            if (e.nodeEvent.dataTransfer && e.nodeEvent.dataTransfer.items && this._contentTypes.length > 0) {
                if (!this._checkMime(e.nodeEvent.dataTransfer.items)) {
                    valid = false;
                }
            }

            e.validMime = valid;

            // Mehrfachauswahl prüfen
            let allowed = true;
            if (!this._multiple && e.nodeEvent.dataTransfer && e.nodeEvent.dataTransfer.items && e.nodeEvent.dataTransfer.items.length > 1) {
                allowed = false;
            }
            e.allowed = allowed;

            this.raiseEvent('drop', e);
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
        this._dragOverCls = null;
        this._dragOverForbiddenCls = null;
        this._contentTypes = null;
        this._multiple = null;
        this._validMediaTypes = null;

        // Basisklasse entladen
        super.destruct(true);
    }

};
