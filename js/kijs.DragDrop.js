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

    static _getDataFromNodeEvent(nodeEvent, targetElement, targetDom) {
        // eigener Transfer?
        if (nodeEvent.dataTransfer && kijs.Array.contains(nodeEvent.dataTransfer.types, 'application/kijs-dragdrop') && kijs.DragDrop._ddData) {
            kijs.DragDrop._ddData.nodeEvent = nodeEvent;
            kijs.DragDrop._ddData.targetElement = targetElement;
            kijs.DragDrop._ddData.targetDom = targetDom instanceof kijs.gui.Dom ? targetDom : null;
            kijs.DragDrop._ddData.targetNode = targetDom instanceof kijs.gui.Dom ? targetDom.node : targetDom;
            return kijs.DragDrop._ddData;

        // Anderer DragDrop (von Dateisystem etc)
        } else {
            return {
                nodeEvent       : nodeEvent,
                data            : null,
                sourceElement   : null,
                sourceDom       : null,
                sourceNode      : null,
                targetElement   : targetElement,
                targetDom       : targetDom instanceof kijs.gui.Dom ? targetDom : null,
                targetNode      : targetDom instanceof kijs.gui.Dom ? targetDom.node : targetDom,
                markTarget      : true,
                position        : {
                    allowOnto: false,
                    allowAbove: false,
                    allowBelow: false,
                    allowLeft: false,
                    allowRight: false,
                    margin: 0
                }
            };
        }
    }

    /**
     * Gibt die Seite an, an die ein element angehängt wird, wenn mit der Maus über
     * das Element gefahren wird.
     * @param {Int} w Elementbreite
     * @param {Int} h Elementhöhe
     * @param {Int} x Maus-X
     * @param {Int} y Maus-Y
     * @param {Boolean} hasOnto
     * @param {Boolean} hasAbove
     * @param {Boolean} hasBelow
     * @param {Boolean} hasLeft
     * @param {Boolean} hasRight
     * @param {Int} margin
     * @returns {String|Boolean}
     */
    static _getPosition(w, h, x, y, hasOnto, hasAbove, hasBelow, hasLeft, hasRight, margin) {
        let distToBt = h - y;
        let distToRt = w - x;
        let distToTp = y;
        let distToLt = x;

        // nur ein Wert gültig
        if (hasOnto && !hasAbove && !hasBelow && !hasLeft  && !hasRight) {
            return 'onto';
        } else if (!hasOnto && hasAbove && !hasBelow && !hasLeft  && !hasRight) {
            return 'above';
        } else if (!hasOnto && !hasAbove && hasBelow && !hasLeft  && !hasRight) {
            return 'below';
        } else if (!hasOnto && !hasAbove && !hasBelow && hasLeft  && !hasRight) {
            return 'left';
        } else if (!hasOnto && !hasAbove && !hasBelow && !hasLeft  && hasRight) {
            return 'right';
        }

        // maus auf allen achsen über margin
        if (hasOnto && distToLt > margin && distToTp > margin && distToBt > margin && distToRt > margin) {
            return 'onto';
        }

        // oberhalb?
        if (hasAbove
                && (!hasBelow || distToTp < distToBt)
                && (!hasRight || distToTp < distToRt)
                && (!hasLeft  || distToTp < distToLt)
            ) {
            return 'above';
        }

        // unterhalb?
        if (hasBelow
                && (!hasAbove || distToBt < distToTp)
                && (!hasRight || distToBt < distToRt)
                && (!hasLeft  || distToBt < distToLt)
            ) {
            return 'below';
        }

        // Links?
        if (hasLeft
                && (!hasAbove || distToLt < distToTp)
                && (!hasRight || distToLt < distToRt)
                && (!hasBelow || distToLt < distToBt)
            ) {
            return 'left';
        }

        // rechts?
        if (hasRight
                && (!hasAbove || distToRt < distToTp)
                && (!hasLeft  || distToRt < distToLt)
                && (!hasBelow || distToRt < distToBt)
            ) {
            return 'right';
        }

        return false;
    }

    /**
     * Markiert das Ziel-Element mit einem Rahmen
     * @param {Int} w
     * @param {Int} h
     * @param {Int} x
     * @param {Int} y
     * @param {String} pos
     * @returns {undefined}
     */
    static _markTargetShow(w, h, x, y, pos) {
        if (!kijs.DragDrop._ddMarker) {
            kijs.DragDrop._ddMarker = {};
            kijs.DragDrop._ddMarker.top = document.createElement('div');
            kijs.DragDrop._ddMarker.bottom = document.createElement('div');
            kijs.DragDrop._ddMarker.left = document.createElement('div');
            kijs.DragDrop._ddMarker.right = document.createElement('div');

            kijs.DragDrop._ddMarker.top.className = 'kijs-dragdrop-marker top';
            kijs.DragDrop._ddMarker.bottom.className = 'kijs-dragdrop-marker bottom';
            kijs.DragDrop._ddMarker.left.className = 'kijs-dragdrop-marker left';
            kijs.DragDrop._ddMarker.right.className = 'kijs-dragdrop-marker right';
        }

        kijs.DragDrop._ddMarker.top.style.width = w + 'px';
        kijs.DragDrop._ddMarker.top.style.left = x + 'px';
        kijs.DragDrop._ddMarker.top.style.top = (y-2) + 'px';

        kijs.DragDrop._ddMarker.bottom.style.width = w + 'px';
        kijs.DragDrop._ddMarker.bottom.style.left = x + 'px';
        kijs.DragDrop._ddMarker.bottom.style.top = (y + h) + 'px';

        kijs.DragDrop._ddMarker.left.style.height = (h+4) + 'px';
        kijs.DragDrop._ddMarker.left.style.left = (x-2) + 'px';
        kijs.DragDrop._ddMarker.left.style.top = (y-2) + 'px';

        kijs.DragDrop._ddMarker.right.style.height = (h+4) + 'px';
        kijs.DragDrop._ddMarker.right.style.left = (x + w) + 'px';
        kijs.DragDrop._ddMarker.right.style.top = (y-2) + 'px';

        if (pos === 'onto' || pos === 'above') {
            document.body.appendChild(kijs.DragDrop._ddMarker.top);
        } else if (kijs.DragDrop._ddMarker.top.parentNode === document.body) {
            document.body.removeChild(kijs.DragDrop._ddMarker.top);
        }

        if (pos === 'onto' || pos === 'below') {
            document.body.appendChild(kijs.DragDrop._ddMarker.bottom);

        } else if (kijs.DragDrop._ddMarker.bottom.parentNode === document.body) {
            document.body.removeChild(kijs.DragDrop._ddMarker.bottom);
        }

        if (pos === 'onto' || pos === 'left') {
            document.body.appendChild(kijs.DragDrop._ddMarker.left);

        } else if (kijs.DragDrop._ddMarker.left.parentNode === document.body) {
            document.body.removeChild(kijs.DragDrop._ddMarker.left);
        }

        if (pos === 'onto' || pos === 'right') {
            document.body.appendChild(kijs.DragDrop._ddMarker.right);

        } else if (kijs.DragDrop._ddMarker.right.parentNode === document.body) {
            document.body.removeChild(kijs.DragDrop._ddMarker.right);
        }
    }

    /**
     * Entfernt den Drag'n'Drop Marker
     * @returns {undefined}
     */
    static _markTargetHide() {
        if (kijs.DragDrop._ddMarker) {
            if (kijs.DragDrop._ddMarker.top.parentNode === document.body) {
                document.body.removeChild(kijs.DragDrop._ddMarker.top);
            }
            if (kijs.DragDrop._ddMarker.bottom.parentNode === document.body) {
                document.body.removeChild(kijs.DragDrop._ddMarker.bottom);
            }
            if (kijs.DragDrop._ddMarker.left.parentNode === document.body) {
                document.body.removeChild(kijs.DragDrop._ddMarker.left);
            }
            if (kijs.DragDrop._ddMarker.right.parentNode === document.body) {
                document.body.removeChild(kijs.DragDrop._ddMarker.right);
            }
        }
    }

    /**
     * Event vom Drag-Soruce
     * @param {DragEvent} nodeEvent
     * @param {kijs.Observable} element
     * @param {kijs.gui.Dom|DomNode} dom
     * @returns {undefined}
     */
    static _onDragStart(nodeEvent, element, dom) {
        // Daten für Listener vorbereiten
        kijs.DragDrop._ddData = {
            nodeEvent       : nodeEvent,
            data            : null,
            sourceElement   : element,
            sourceDom       : dom instanceof kijs.gui.Dom ? dom : null,
            sourceNode      : dom instanceof kijs.gui.Dom ? dom.node : dom,
            targetElement   : null,
            targetDom       : null,
            targetNode      : null,
            markTarget      : true,
            position        : {
                allowOnto: true,
                allowAbove: true,
                allowBelow: true,
                allowLeft: true,
                allowRight: true,
                margin: 8
            }
        };

        if (element.raiseEvent('ddStart', kijs.DragDrop._ddData)) {
            nodeEvent.dataTransfer.setData('application/kijs-dragdrop', '');

        } else {
            kijs.DragDrop._ddData = null;
        }
    }

    /**
     * Event vom Drag-Soruce
     * @param {DragEvent} nodeEvent
     * @param {kijs.Observable} element
     * @param {kijs.gui.Dom|DomNode} dom
     * @returns {undefined}
     */
    static _onDragEnd(nodeEvent, element, dom) {
        this._markTargetHide();
        kijs.DragDrop._ddData = null;
        kijs.DragDrop._ddMarker = null;
    }


    /**
     * Event vom Drag-Target
     * @param {DragEvent} nodeEvent
     * @param {kijs.Observable} element
     * @param {kijs.gui.Dom|DomNode} dom
     * @returns {undefined}
     */
    static _onDragEnter(nodeEvent, element, dom) {
        element.raiseEvent('ddEnter', this._getDataFromNodeEvent(nodeEvent, element, dom));
        nodeEvent.preventDefault();
        nodeEvent.stopPropagation();
    }

    /**
     * Event vom Drag-Target
     * @param {DragEvent} nodeEvent
     * @param {kijs.Observable} element
     * @param {kijs.gui.Dom|DomNode} dom
     * @returns {undefined}
     */
    static _onDragOver(nodeEvent, element, dom) {
        let dropData = this._getDataFromNodeEvent(nodeEvent, element, dom);
        element.raiseEvent('ddOver', dropData);

        // Falls das Element nicht gedropt werden darf, anzeigen
        if (!dropData.position.allowOnto && !dropData.position.allowAbove && !dropData.position.allowBelow
                && !dropData.position.allowLeft && !dropData.position.allowRight) {
            nodeEvent.dataTransfer.dropEffect  = 'none';
        }

        // Ziel markieren
        if (dropData.markTarget) {

            // mausposition des elements
            let absPos = kijs.Dom.getAbsolutePos(dom instanceof kijs.gui.Dom ? dom.node : dom);
            let x = nodeEvent.pageX - absPos.x, y = nodeEvent.pageY - absPos.y;


            let pos = this._getPosition(
                    absPos.w, absPos.h,
                    x, y,
                    dropData.position.allowOnto, dropData.position.allowAbove,
                    dropData.position.allowBelow, dropData.position.allowLeft,
                    dropData.position.allowRight, dropData.position.margin);

            this._markTargetShow(absPos.w, absPos.h, absPos.x, absPos.y, pos);
        }

        nodeEvent.preventDefault();
        nodeEvent.stopPropagation();
    }

    /**
     * Event vom Drag-Target
     * @param {DragEvent} nodeEvent
     * @param {kijs.Observable} element
     * @param {kijs.gui.Dom|DomNode} dom
     * @returns {undefined}
     */
    static _onDragLeave(nodeEvent, element, dom) {
        element.raiseEvent('ddLeave', this._getDataFromNodeEvent(nodeEvent, element, dom));
        this._markTargetHide();
        nodeEvent.preventDefault();
        nodeEvent.stopPropagation();
    }

    /**
     * Event vom Drag-Target
     * @param {DragEvent} nodeEvent
     * @param {kijs.Observable} element
     * @param {kijs.gui.Dom|DomNode} dom
     * @returns {undefined}
     */
    static _onDrop(nodeEvent, element, dom) {
        nodeEvent.preventDefault();
        let dropData = this._getDataFromNodeEvent(nodeEvent, element, dom);
        this._markTargetHide();

        // mausposition des elements
        let absPos = kijs.Dom.getAbsolutePos(dom instanceof kijs.gui.Dom ? dom.node : dom);
        let x = nodeEvent.pageX - absPos.x, y = nodeEvent.pageY - absPos.y;

        // position über dem Element
        dropData.position.position = this._getPosition(
                absPos.w, absPos.h,
                x, y,
                dropData.position.allowOnto, dropData.position.allowAbove,
                dropData.position.allowBelow, dropData.position.allowLeft,
                dropData.position.allowRight, dropData.position.margin);

        element.raiseEvent('ddDrop', dropData);
    }

};