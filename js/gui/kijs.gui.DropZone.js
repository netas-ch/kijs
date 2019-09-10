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
    constructor(config={}) {
        super(false);

        this._dragOverCls = 'kijs-dragover';
        this._dragOverForbiddenCls = 'kijs-dragover-forbidden';
        this._contentTypes = [];
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
        this._dom.on('dragEnter', this._onDragEnter, this);
        this._dom.on('dragOver', this._onDragOver, this);
        this._dom.on('dragLeave', this._onDragLeave, this);
        this._dom.on('drop', this._onDrop, this);

    }


    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------

    get contentTypes() { return this._contentTypes; }
    set contentTypes(val) {
        if (!kijs.isArray(val)) {
            val = [val];
        }

        kijs.Array.each(val, function(contentType) {
            let parts = contentType.toLowerCase().split('/', 2);
            if (!kijs.Array.contains(this._validMediaTypes, parts[0])) {
                throw new kijs.Error('invalid content type "' + contentType + '"');
            }
            this._contentTypes.push(parts.join('/'));
        }, this);
    }

    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------


    _checkMime(dataTransferItems) {
        for (let i=0; i<dataTransferItems.length; i++) {
            if (dataTransferItems[i].type) {
                let parts = dataTransferItems[i].type.split('/', 2);
                if (!kijs.Array.contains(this._contentTypes, parts[0]) && !kijs.Array.contains(this._contentTypes, parts.join('/'))) {
                    return false;
                }
            }
        }
        return true;
    }

    // EVENTS
    _onDragEnter(e) {
        this._dom.clsAdd(this._dragOverCls);
        this.raiseEvent('dragEnter', e);
    }

    _onDragOver(e) {
        e.nodeEvent.preventDefault();

        // 'forbidden' Klasse, falls ungültiger Dateityp
        if (e.nodeEvent.dataTransfer && e.nodeEvent.dataTransfer.items && this._contentTypes.length > 0) {
            if (!this._checkMime(e.nodeEvent.dataTransfer.items)) {
                this._dom.clsAdd(this._dragOverForbiddenCls);
            }
        }

        this._dom.clsAdd(this._dragOverCls);
        this.raiseEvent('dragOver', e);
    }

    _onDragLeave(e) {
        this._dom.clsRemove(this._dragOverCls);
        this._dom.clsRemove(this._dragOverForbiddenCls);
        this.raiseEvent('dragLeave', e);
    }

    _onDrop(e) {
        e.nodeEvent.preventDefault();
        this._dom.clsRemove(this._dragOverCls);
        this._dom.clsRemove(this._dragOverForbiddenCls);

        let valid = true;
        if (e.nodeEvent.dataTransfer && e.nodeEvent.dataTransfer.items && this._contentTypes.length > 0) {
            if (!this._checkMime(e.nodeEvent.dataTransfer.items)) {
                valid = false;
            }
        }

        e.validMime = valid;
        this.raiseEvent('drop', e);
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

        // Basisklasse entladen
        super.destruct(true);
    }

};