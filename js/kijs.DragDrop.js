/* global kijs */

// --------------------------------------------------------------
// kijs.Dom (Static)
// --------------------------------------------------------------
kijs.DragDrop = class kijs_DragDrop {

    // --------------------------------------------------------------
    // STATICS GETTERS
    // --------------------------------------------------------------


    // --------------------------------------------------------------
    // STATICS
    // --------------------------------------------------------------

    /**
     * Fügt dem element einen 'ddStart'-Event hinzu.
     * sofern der ddStart-Event nicht false zurückgibt, wird das DragDrop gestartet.
     * @param {kijs.Observable} element
     * @param {HTMLElement|kijs.gui.Dom} dom
     * @returns {undefined}
     */
    static addDragEvents(element, dom) {
        // Event von DOM-Element
        if (dom instanceof kijs.gui.Dom) {
            dom.on('dragStart', function(e) {
                this._onDragStart(e.nodeEvent, element, dom);
            }, this);

            dom.on('dragEnd', function(e) {
                this._onDragEnd(e.nodeEvent, element, dom);
            }, this);

        // Event von HTML-Node
        } else {
            dom.addEventListener('dragstart', this._onDragStart.bind(this, element, dom));
            dom.addEventListener('dragend', this._onDragEnd.bind(this, element, dom));
        }
    }

    /**
     * Fügt dem Element die Drop-Events hinzu, damit dieses als Drop-Zone genutzt werden kann.
     * @param {kijs.Observable} element
     * @param {HTMLElement|kijs.gui.Dom} dom
     * @returns {undefined}
     */
    static addDropEvents(element, dom) {
        // Event von DOM-Element
        if (dom instanceof kijs.gui.Dom) {
            dom.on('dragEnter', function(e) {
                this._onDragEnter(e.nodeEvent, element, dom);
            }, this);

            dom.on('dragOver', function(e) {
                this._onDragOver(e.nodeEvent, element, dom);
            }, this);

            dom.on('dragLeave', function(e) {
                this._onDragLeave(e.nodeEvent, element, dom);
            }, this);

            dom.on('drop', function(e) {
                this._onDrop(e.nodeEvent, element, dom);
            }, this);

        // Event von HTML-Node
        } else {
            dom.addEventListener('dragenter', this._onDragEnter.bind(this, element, dom));
            dom.addEventListener('dragover', this._onDragOver.bind(this, element, dom));
            dom.addEventListener('dragleave', this._onDragLeave.bind(this, element, dom));
            dom.addEventListener('drop', this._onDrop.bind(this, element, dom));
        }
    }



    // PROTECTED

    static _getDataFromNodeEvent(nodeEvent) {
        // eigener Transfer?
        if (nodeEvent.dataTransfer && kijs.Array.contains(nodeEvent.dataTransfer.types, 'application/kijs-dragdrop') && kijs.DragDrop._ddData) {
            kijs.DragDrop._ddData.nodeEvent = nodeEvent;
            return kijs.DragDrop._ddData;

        // Anderer DragDrop (von Dateisystem etc)
        } else {
            return {
                nodeEvent       : nodeEvent,
                data            : null,
                sourceElement   : null,
                sourceDom       : null,
                sourceNode      : null
            };
        }
    }

    static _onDragStart(nodeEvent, element, dom) {
        console.log('drag start');
        // Daten für Listener vorbereiten
        kijs.DragDrop._ddData = {
            nodeEvent       : nodeEvent,
            data            : null,
            sourceElement   : element,
            sourceDom       : dom instanceof kijs.gui.Dom ? dom : null,
            sourceNode      : dom instanceof kijs.gui.Dom ? dom.node : dom
        };

        if (element.raiseEvent('ddStart', kijs.DragDrop._ddData)) {
            nodeEvent.dataTransfer.effectAllowed  = 'none';
            nodeEvent.dataTransfer.setData('application/kijs-dragdrop', '');

        } else {
            kijs.DragDrop._ddData = null;
        }
    }

    static _onDragEnd(nodeEvent, element, dom) {
        kijs.DragDrop._ddData = null;
    }

    static _onDragEnter(nodeEvent, element, dom) {
        nodeEvent.dataTransfer.dropEffect  = 'copy';
        element.raiseEvent('ddEnter', this._getDataFromNodeEvent(nodeEvent));
    }

    static _onDragOver(nodeEvent, element, dom) {
        console.log('drag over');
        nodeEvent.dataTransfer.dropEffect  = 'copy';
        nodeEvent.preventDefault();
    }

    static _onDragLeave(nodeEvent, element, dom) {
        element.raiseEvent('ddLeave', this._getDataFromNodeEvent(nodeEvent));
        console.log('drag exit');
    }

    static _onDrop(nodeEvent, element, dom) {
        element.raiseEvent('ddDrop', this._getDataFromNodeEvent(nodeEvent));
        console.log('drop');
    }

};