/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.ButtonGroup
// --------------------------------------------------------------
/**
 * Container, der Buttons (oder andere Elemente) mit einer Beschriftung in einem Raster mit columns
 * Spalten anordnet. Die Elemente werden spaltenweise von oben nach unten verteilt. Mit colSizes und
 * rowSizes kann ein Element mehrere Spalten bzw. Zeilen belegen.
 *
 * @example
 * new kijs.gui.ButtonGroup({
 *     caption: 'Ansicht',
 *     columns: 2,
 *     rowSizes: [2],
 *     elements: [
 *         { xtype: 'kijs.gui.Button', caption: 'Gross' },
 *         { xtype: 'kijs.gui.Button', caption: 'Liste' },
 *         { xtype: 'kijs.gui.Button', caption: 'Details' }
 *     ]
 * });
 */
kijs.gui.ButtonGroup = class kijs_gui_ButtonGroup extends kijs.gui.Container {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);
        
        this._columns = 1;
        this._rowSizes = [];
        this._colSizes = [];
        
        this._captionDom = new kijs.gui.Dom({
            cls: 'kijs-caption',
            nodeTagName: 'span'
        });

        this._dom.clsRemove('kijs-container');
        this._dom.clsAdd('kijs-buttongroup');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            columns: true,
            rowSizes: { target: 'rowSizes' },
            colSizes: { target: 'colSizes' },

            caption: { target: 'html', context: this._captionDom },
            captionCls: { fn: 'function', target: this._captionDom.clsAdd, context: this._captionDom },     // {String|Array} CSS-Klassen der Beschriftung
            captionDisplayType: { target: 'htmlDisplayType', context: this._captionDom },
            captionStyle: { fn: 'assign', target: 'style', context: this._captionDom }     // {Object} CSS-Styles der Beschriftung
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
    /**
     * Beschriftung der Gruppe
     * @type {String}
     */
    get caption() { return this._captionDom.html; }
    set caption(val) {
        this._captionDom.html = val;
        if (this.isRendered) {
            this.render();
        }
    }

    /**
     * Darstellung der Beschriftung (siehe kijs.gui.Dom.htmlDisplayType)
     * @type {String}
     */
    get captionDisplayType() { return this._captionDom.htmlDisplayType; }
    set captionDisplayType(val) { this._captionDom.htmlDisplayType = val; }

    /**
     * kijs.gui.Dom der Beschriftung
     * @type {kijs.gui.Dom}
     */
    get captionDom() { return this._captionDom; }

    /**
     * Anzahl belegte Spalten pro Element (Index wie elements). Der Getter ergänzt fehlende Werte mit 1.
     * Kein Array = [].
     * @type {Number[]}
     */
    get colSizes() {
        let rs = [];
        for (let i=0; i<this.elements.length; i++) {
            rs[i] = kijs.isDefined(this._colSizes[i]) ? this._colSizes[i] : 1;
        }
        return rs;
    }
    set colSizes(val) {
        this._colSizes = kijs.isArray(val) ? val : [];
    }

    /**
     * Anzahl Spalten. Nicht numerisch = 1. Default: 1
     * @type {Number}
     */
    get columns() { return this._columns; }
    set columns(val) { this._columns = kijs.isNumeric(val) ? window.parseInt(val) : 1; }

    // overwrite
    get isEmpty() { return this._captionDom.isEmpty && kijs.isEmpty(this._elements); }

    /**
     * Anzahl belegte Zeilen pro Element (Index wie elements). Der Getter ergänzt fehlende Werte mit 1.
     * Kein Array = [].
     * @type {Number[]}
     */
    get rowSizes() {
        let rs = [];
        for (let i=0; i<this.elements.length; i++) {
            rs[i] = kijs.isDefined(this._rowSizes[i]) ? this._rowSizes[i] : 1;
        }
        return rs;
    }
    set rowSizes(val) {
        this._rowSizes = kijs.isArray(val) ? val : [];
    }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // Overwrite
    render(superCall) {
        super.render(true);

        // Span caption rendern (kijs.guiDom)
        if (!this._captionDom.isEmpty) {
            this._captionDom.renderTo(this._dom.node, this._innerDom.node);
        } else if (this._captionDom.isRendered) {
            this._captionDom.unrender();
        }

        // Event afterRender auslösen
        if (!superCall) {
            this.raiseEvent('afterRender');
        }
    }

    // overwrite
    unrender(superCall) {
        // Event auslösen.
        if (!superCall) {
            this.raiseEvent('unrender');
        }

        this._captionDom.unrender();
        super.unrender(true);
    }


    // PROTECTED
    /**
     * Berechnet die Belegung des Rasters. Jede Zelle enthält den Index des Elements, das dort
     * beginnt, 'R' für eine weitere vom Element belegte Zelle oder ist leer.
     * @returns {Array[]}  matrix[Zeile][Spalte]
     */
    _getTableMatrix() {
        let colSizes = this.colSizes;
        let rowSizes = this.rowSizes;
        let matrix = [];

        // Anzahl Felder
        let cellCount = 0;
        for (let i=0; i<this.elements.length; i++) {
            cellCount += Math.max(1, colSizes[i] * rowSizes[i]);
        }

        // Anzahl rows
        let rowCount = Math.ceil(cellCount / this._columns);

        // rows in matrix
        for (let i=0; i<rowCount; i++) {
            matrix[i] = [];
        }

        // cells
        let rowPointer = 0;
        let colPointer = 0;
        for (let i=0; i<this.elements.length; i++) {
            let colSize = colSizes[i];
            let rowSize = rowSizes[i];

            // weitere benötigte Felder markieren
            for (let ri=0; ri<rowSize; ri++) {
                for (let ci=0; ci<colSize; ci++) {
                    if (!matrix[rowPointer + ri]) {
                        matrix[rowPointer + ri] = [];
                    }
                    matrix[rowPointer + ri][colPointer + ci] = (ri === 0 && ci === 0) ? i : 'R';
                }
            }

            // pointer erhöhen
            if (this.elements[i+1]) {
                let nextFound = false;
                while (!nextFound) {
                    rowPointer++;

                    if (rowPointer >= rowCount && (colPointer+1) < this._columns) {
                        colPointer++;
                        rowPointer = 0;
                    }

                    if (!matrix[rowPointer] || !matrix[rowPointer][colPointer]) {
                        nextFound = true;
                    }
                }
            }
        }

        return matrix;
    }

    // overwrite
    _renderElements() {
        let matrix = this._getTableMatrix();

        kijs.Dom.removeAllChildNodes(this._innerDom.node);

        // Grid-Grösse berechnen (Anzahl Rows und Columns)
        let maxR=0, maxC=0;

        // durchgehen und zählen
        for (let iR=0; iR<matrix.length; iR++) {
            for (let iC=0; iC<matrix[iR].length; iC++) {
                if (kijs.isInteger(matrix[iR][iC])) {
                    let elId = matrix[iR][iC];
                    let cS = this.colSizes[elId];
                    let rS = this.rowSizes[elId];

                    maxR = Math.max(maxR, (iR+rS));
                    maxC = Math.max(maxC, (iC+cS));
                }
            }
        }

        let gtr='', gtc=''; // CSS: grid-template-rows, grid-template-columns

        // Spalten
        for (let iR=0; iR<maxR; iR++) {
            gtr += '[kijs-row' + iR + '] auto ';
        }
        gtr += '[kijs-row' + maxR + ']';

        // Zeilen
        for (let iC=0; iC<maxC; iC++) {
            gtc += '[kijs-col' + iC + '] auto ';
        }
        gtc += '[kijs-col' + maxC + ']';

        this._innerDom.style.gridTemplateRows = gtr;
        this._innerDom.style.gridTemplateColumns = gtc;

        // Spalten durchgehen
        for (let iR=0; iR<matrix.length; iR++) {

            // Zeilen
            for (let iC=0; iC<matrix[iR].length; iC++) {

                if (kijs.isInteger(matrix[iR][iC])) {
                    let elId = matrix[iR][iC];
                    let cS = this.colSizes[elId];
                    let rS = this.rowSizes[elId];

                    let cellContainer = document.createElement('div');
                    cellContainer.style.gridRow = 'kijs-row' + iR + ' / kijs-row' + (iR+rS);
                    cellContainer.style.gridColumn = 'kijs-col' + iC + ' / kijs-col' + (iC+cS);

                    this.elements[elId].renderTo(cellContainer);
                    this._innerDom.node.appendChild(cellContainer);
                }
            }
        }
    }



    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    destruct(superCall) {
        if (!superCall) {
            // unrendern
            this.unrender(superCall);

            // Event auslösen.
            this.raiseEvent('destruct');
        }

        // Elemente/DOM-Objekte entladen
        if (this._captionDom) {
            this._captionDom.destruct();
        }

        // Variablen (Objekte/Arrays) leeren
        this._captionDom = null;

        // Basisklasse entladen
        super.destruct(true);
    }
    
};