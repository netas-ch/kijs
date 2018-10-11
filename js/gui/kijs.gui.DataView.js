/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.DataView
// --------------------------------------------------------------
kijs.gui.DataView = class kijs_gui_DataView extends kijs.gui.Container {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);
        
        this._currentEl = null;         // Aktuelles Element (Wenn der Fokus auf dem DataView ist, 
                                        // hat dieses Element den Fokus)
        this._lastSelectedEl = null;    // Letztes Element das Selektiert wurde. Wird gebraucht, 
                                        // wenn mit der Shift-Taste mehrere selektiert werden.


        
        this._currentEl = null;
        this._data = [];
        this._facadeFnLoad = null;
        this._rpc = null;           // Instanz von kijs.gui.Rpc
        this._selectType = 'none';
        
        this._dom.clsRemove('kijs-container');
        this._dom.clsAdd('kijs-dataview');
        
        this._dom.nodeAttributeSet('tabIndex', -1);
        
        // Standard-config-Eigenschaften mergen
        config = Object.assign({}, {
            selectType: 'single'
        }, config);
        
        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            autoLoad: { target: 'autoLoad' },   // Soll nach dem ersten Rendern automatisch die Load-Funktion aufgerufen werden?
            data: { target: 'data' },   // Recordset-Array [{id:1, caption:'Wert 1'}] oder Werte-Array ['Wert 1']
            facadeFnLoad: true,         // Name der Facade-Funktion. Bsp: 'address.load'
            rpc: { target: 'rpc' },     // Instanz von kijs.gui.Rpc
            selectType: true            // 'none': Es kann nichts selektiert werden
                                        // 'single' (default): Es kann nur ein Datensatz selektiert werden
                                        // 'multi': Mit den Shift- und Ctrl-Tasten können mehrere Datensätze selektiert werden.
                                        // 'simple': Es können mehrere Datensätze selektiert werden. Shift- und Ctrl-Tasten müssen dazu nicht gedrückt werden.
        });
        
        // Config anwenden
        if (kijs.isObject(config)) {
            this.applyConfig(config, true);
        }
        
        this.applyConfig(config);
        
        // Events
        this.on('keyDown', this._onKeyDown, this);
        this.on('elementClick', this._onElementClick, this);
        this.on('elementFocus', this._onElementFocus, this);
    }
    
    
    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get autoLoad() {
        return this.hasListener('afterFirstRenderTo', this._onAfterFirstRenderTo, this);
    }
    set autoLoad(val) {
        if (val) {
            this.on('afterFirstRenderTo', this._onAfterFirstRenderTo, this);
        } else {
            this.off('afterFirstRenderTo', this._onAfterFirstRenderTo, this);
        }
    }
    

    get current() { return this._currentEl; }
    /**
     * Setzt das aktuelle Element, dass den Fokus erhalten wird
     * Um den Fokus zu setzen verwenden sie stattdessen die Funktion .focus() vom Element.
     * @param {kijs.gui.DataViewElement} el
     * @returns {undefined}
     */
    set current(el) {
        this._currentEl = el;
        kijs.Array.each(this._elements, function(elem) {
            if (elem === el) {
                elem.dom.clsAdd('kijs-current');
            } else {
                elem.dom.clsRemove('kijs-current');
            }
        }, this);
        
        if (el) {
            this.setFocussableElement(el);
        }
    }
    
    
    get data() { return this._data; }
    set data(val) { 
        this._data = val;
        
        // Bestehende Elemente löschen
        if (this._elements) {
            this.removeAll(true);
        }

        // Neue Elemente generieren
        let newElements = [];
        for (let i=0, len=this._data.length; i<len; i++) {
            const newEl = this.createElement(this._data[i], i);
            newEl.index = i;
            newEl.parent = this;
            
            // click-Event
            newEl.on('click', function(e) {
                return this.raiseEvent('elementClick', e);
            }, this);

            // dblclick-Event
            newEl.on('dblClick', function(e) {
                return this.raiseEvent('elementDblClick', e);
            }, this);

            // focus-Event
            newEl.on('focus', function(e) {
                return this.raiseEvent('elementFocus', e);
            }, this);

            // dragstart-Event
            newEl.on('dragStart', function(e) {
                return this.raiseEvent('elementDragStart', e);
            }, this);

            // dragover-Event
            newEl.on('dragOver', function(e) {
                return this.raiseEvent('elementDragOver', e);
            }, this);

            // drag-Event
            newEl.on('drag', function(e) {
                return this.raiseEvent('elementDrag', e);
            }, this);

            // dragleave-Event
            newEl.on('dragLeave', function(e) {
                return this.raiseEvent('elementDragLeave', e);
            }, this);

            // dragend-Event
            newEl.on('dragEnd', function(e) {
                return this.raiseEvent('elementDragEnd', e);
            }, this);

            // drop-Event
            newEl.on('drop', function(e) {
                return this.raiseEvent('elementDrop', e);
            }, this);

            newElements.push(newEl);
        }
        
        // neue Elemente einfügen
        this.add(newElements);
        
        // Current = erstes Element
        this.current = !kijs.isEmpty(this._elements) ? this._elements[0] : null;
    }
    
    get facadeFnLoad() { return this._facadeFnLoad; }
    set facadeFnLoad(val) { this._facadeFnLoad = val; }

    get rpc() { return this._rpc;}
    set rpc(val) {
        if (val instanceof kijs.gui.Rpc) {
            this._rpc = val;
            
        } else if (kijs.isString(val)) {
            if (this._rpc) {
                this._rpc.url = val;
            } else {
                this._rpc = new kijs.gui.Rpc({
                    url: val
                });
            }
            
        } else {
            throw new Error(`Unkown format on config "rpc"`);
            
        }
    }

    get selectType() { return this._selectType; }
    set selectType(val) { this._selectType = val; }
    
    
    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    /**
     * Entfernt alle Selektionen
     * @param {Boolean} [preventSelectionChange=false]    Soll das SelectionChange-Event verhindert werden?
     * @returns {undefined}
     */
    clearSelections(preventSelectionChange) {
        this.unSelect(this._elements, preventSelectionChange);
    }

    /**
     * Erstellt aus einem Recordset ein getDataViewElement
     * Diese Funktion muss überschrieben werden.
     * @param {Array} dataRow   Datensatz, der gerendert werden soll
     * @param {Number} index    Index des Datensatzes. Die Datensätze werden durchnummeriert 0 bis ...
     * @returns {kijs.gui.getDataViewElement}
     */
    createElement(dataRow, index) {
        let html = '';

        html += '<div>';
        html += ' <span class="label">Nr. ' + index + '</span>';
        html += '</div>';

        kijs.Object.each(dataRow, function(key, val) {
            html += '<div>';
            html += ' <span class="label">' + key + ': </span>';
            html += ' <span class="value">' + val + '</span>';
            html += '</div>';
        }, this);
        
        return new kijs.gui.DataViewElement({
            dataRow: dataRow,
            html: html
        });
    }

    /**
     * Gibt die selektieten Elemente zurück
     * Bei selectType='single' wird das Element direkt zurückgegeben sonst ein Array mit den Elementen
     * @returns {Array|kijs.gui.DataViewElement|Null}
     */
    getSelected() {
        let ret = [];
        for (let i=0, len=this._elements.length; i<len; i++) {
            if (this._elements[i].selected) {
                ret.push(this._elements[i]);
            }
        }

        if (this._selectType === 'none') {
            return null;

        } else if (this._selectType === 'single') {
            return ret.length ? ret[0] : null ;

        } else {
            return ret;

        }
    }

    /**
     * Füllt das Dataview mit Daten vom Server
     * @param {Array} args Array mit Argumenten, die an die Facade übergeben werden
     * @returns {undefined}
     */
    load(args) {
        this._rpc.do(this._facadeFnLoad, args, function(response) {
            this.data = response.rows;
            if (!kijs.isEmpty(response.selectFilters)) {
                this.selectByFilters(response.selectFilters);
            }
        }, this, true, this, 'dom', false);
    }


    /**
     * Selektiert ein oder mehrere Elemente
     * @param {kijs.gui.Element|Array} elements Element oder Array mit Elementen, die selektiert werden sollen
     * @param {Boolean} [keepExisting=false]            Soll die bestehende selektion belassen werden?
     * @param {Boolean} [preventSelectionChange=false]  Soll das SelectionChange-Event verhindert werden?
     * @returns {undefined}
     */
    select(elements, keepExisting, preventSelectionChange) {
        if (kijs.isEmpty(elements)) {
            elements = [];
        }

        if (!kijs.isArray(elements)) {
            elements = [elements];
        }

        if (!keepExisting){
            this.clearSelections(true);
        }

        kijs.Array.each(elements, function(el) {
            el.selected = true;
        }, this);

        if (!preventSelectionChange) {
            this.raiseEvent('selectionChange', { elements: elements, unSelect: false } );
        }
    }
    
    /**
     * Selektiert ein oder mehrere Elemente
     * @param {Array|Object} filters                    Array mit Objektdefinitionen der Elemente, die selektiert werden sollen
     *                                                  Beispiel 1 (nur ein Datensatz wird selektiert bei nur einem Primary-Field):
     *                                                  { field: "Id", value: 123 }
     *                                                  
     *                                                  Beispiel 2 (mehrere werden selektiert bei nur einem Primary-Field):
     *                                                  [ { field: "Id", value: 123 }, { field: "Id", value: 124 } ]
     *                                                  
     *                                                  Beispiel 3 (nur ein Datensatz wird selektiert bei mehreren Primary-Fields):
     *                                                  [
     *                                                    { field: "Name", value: "Muster" },
     *                                                    { field: "Vorname", value: "Max" }
     *                                                  ]
     *                                                  
     *                                                  Beispiel 4 (mehrere Datensätze werden selektiert bei mehreren Primary-Fields):
     *                                                  [
     *                                                    [
     *                                                      { field: "Name", value: "Muster" },
     *                                                      { field: "Vorname", value: "Max" }
     *                                                    ],[
     *                                                      { field: "Name", value: "Muster" },
     *                                                      { field: "Vorname", value: "Max" }
     *                                                    ]
     *                                                  ]
     * 
     * @param {Boolean} [keepExisting=false]            Soll die bestehende selektion belassen werden?
     * @param {Boolean} [preventSelectionChange=false]  Soll das SelectionChange-Event verhindert werden?
     * @returns {undefined}
     */
    selectByFilters(filters, keepExisting, preventSelectionChange) {
        if (kijs.isEmpty(filters)) {
            return;
        }
        
        // Evtl. das Format ändern auf: [ [{...}, {...}], [{...}, {...}] ]
        if (kijs.isObject(filters)) {
            filters = [filters];
        }
        for (let i=0; i<filters.length; i++) {
            if (kijs.isObject(filters[i])) {
                filters[i] = [filters[i]];
            }
        }
        
        // Nun die Elemente durchgehen und wenn sie zum Filter passen: das Element vormerken
        const selElements = [];
        kijs.Array.each(this._elements, function(el) {
            const row = el.dataRow;

            kijs.Array.each(filters, function(filterFields) {
                let ok = false;
                kijs.Array.each(filterFields, function(filterField) {
                    if (kijs.isEmpty(filterField.value) || kijs.isEmpty(filterField.field)) {
                        throw new Error(`Unkown filter format.`);
                    }
                    
                    if (filterField.value === row[filterField.field]) {
                        ok = true;
                    } else {
                        ok = false;
                        return false;
                    }
                }, this);
                if (ok) {
                    selElements.push(el);
                    return false;
                }
            }, this);

        }, this);
        
        // Elemente selektieren
        if (!kijs.isEmpty(selElements)) {
            this.select(selElements, keepExisting, preventSelectionChange);
        }
    }

    /**
     * Selektiert alle Elemente zwischen el1 und el2
     * @param {kijs.gui.Element} el1
     * @param {kijs.gui.Element} el2
     * @param {type} [preventSelectionChange=false]     Soll das SelectionChange-Event verhindert werden?
     * @returns {undefined}
     */
    selectBetween(el1, el2, preventSelectionChange) {
        let found = false;
        let elements = [];

        // Alle Elemente zwischen dem vorher selektierten Element und dem aktuellen Element selektieren
        kijs.Array.each(this._elements, function(el) {
            if (!found) {
                if (el === el1) {
                    found = 'el1';
                } else if (el === el2) {
                    found = 'el2';
                }
            }

            if (found) {
                elements.push(el);
            }

            if ((found==='el1' && el===el2) || (found==='el2' && el===el1)) {
                return false;
            }
        }, this);
        

        if (!kijs.isEmpty(elements)) {
            this.select(elements, true, preventSelectionChange);
        }
    }

    /**
     * Element festlegen, welches über die Tabulator-Taste den Fokus erhält
     * Setzt den tabIndex des Elements auf 0
     * und bei allen anderen Elementen auf -1
     * @param {type} el
     * @returns {undefined}
     */
    setFocussableElement(el) {
        // Sicherstellen, dass alle anderen Elemente den Fokus nicht mehr über die Tabulator-Taste erhalten können
        kijs.Array.each(this._elements, function(elem) {
            elem.dom.nodeAttributeSet('tabIndex', -1);
        }, this);
        
        if (!el && !kijs.isEmpty(this._elements)) {
            el = this._elements[0];
        }

        // Beim neuen Element: tabIndex einschalten
        // kann nun auch über die Tastatur und Maus fokussiert werden.
        if (el) {
            el.dom.nodeAttributeSet('tabIndex', 0);
        }
    }

    /**
     * Deselektiert ein oder mehrere Elemente
     * @param {kijs.gui.Element|Array} elements Element oder Array mit Elementen, die deselektiert werden sollen
     * @param {type} [preventSelectionChange=false]     Soll das SelectionChange-Event verhindert werden?
     * @returns {undefined}
     */
    unSelect(elements, preventSelectionChange) {
        if (!kijs.isArray(elements)) {
            elements = [elements];
        }

        kijs.Array.each(elements, function(el) {
            el.selected = false;
        }, this);
        
        if (!preventSelectionChange) {
            this.raiseEvent('selectionChange', { elements: elements, unSelect: true } );
        }
    }


    // PROTECTED
    /**
     * Selektiert ein Element und berücksichtigt dabei die selectType und die tasten shift und ctrl
     * @param {kijs.gui.Element} el
     * @param {boolean} shift   // Shift gedrückt?
     * @param {boolean} ctrl    // Ctrl gedrückt?
     * @returns {undefined}
     */
    _selectEl(el, shift, ctrl) {
        if (!el) {
            return;
        }

        // darf überhaupt selektiert werden?
        switch (this._selectType) {
            case 'single':
                shift = false;
                ctrl = false;
                break;
                
            case 'multi':
                // nix
                break;
                
            case 'simple':
                ctrl = true;
                break;
                
            case 'none':
            default:
                return;
        }
        

        if (shift && this._lastSelectedEl) {
            // bestehende Selektierung entfernen
            if (!ctrl) {
                this.clearSelections(true);
            }

            // selektieren
            this.selectBetween(this._lastSelectedEl, el);

        } else {

            // bestehende Selektierung entfernen
            if (!ctrl) {
                this.clearSelections(true);
            }

            if (el.selected) {
                this.unSelect(el);
                if (el === this._lastSelectedEl) {
                    this._lastSelectedEl = null;
                }
            } else {
                this.select(el, true);
                this._lastSelectedEl = el;
            }
        }
    }


    // EVENTS
    _onAfterFirstRenderTo(e) {
        this.load();
    }
    
    _onElementClick(e) {
        this.current = e.raiseElement;
        e.raiseElement.focus();
        this._selectEl(this._currentEl, e.nodeEvent.shiftKey, e.nodeEvent.ctrlKey);
    }

    _onElementFocus(e) {
        // Element festlegen, welches über die Tabulator-Taste den Fokus erhält
        this.setFocussableElement(e.raiseElement);
    }

    _onKeyDown(e) {
        switch (e.nodeEvent.keyCode) {
            case kijs.keys.LEFT_ARROW:
                if (this._currentEl) {
                    const prev = this._currentEl.previous;
                    if (prev) {
                        this.current = prev;
                        prev.focus();
                    }

                    if (e.nodeEvent.shiftKey || (!e.nodeEvent.ctrlKey && (this.selectType === 'single' || this.selectType === 'multi'))) {
                        this._selectEl(this._currentEl, e.nodeEvent.shiftKey, e.nodeEvent.ctrlKey);
                    }
                }
                e.nodeEvent.preventDefault();
                break;
                
            case kijs.keys.UP_ARROW:
                if (this._currentEl && this._elements) {
                    let found = false;
                    
                    kijs.Array.each(this._elements, function(el) {
                        if (found) {
                            if (el.top < this._currentEl.top && el.left === this._currentEl.left) {
                                this.current = el;
                                el.focus();
                                return false;
                            }
                        } else {
                            if (el === this._currentEl) {
                                found = true;
                            }
                        }
                    }, this, true);


                    if (e.nodeEvent.shiftKey || (!e.nodeEvent.ctrlKey && (this._selectType === 'single' || this._selectType === 'multi'))) {
                        this._selectEl(this._currentEl, e.nodeEvent.shiftKey, e.nodeEvent.ctrlKey);
                    }
                }
                e.nodeEvent.preventDefault();
                break;
            
            case kijs.keys.RIGHT_ARROW:
                if (this._currentEl) {
                    const next = this._currentEl.next;
                    if (next) {
                        this.current = next;
                        next.focus();
                    }

                    if (e.nodeEvent.shiftKey || (!e.nodeEvent.ctrlKey && (this._selectType === 'single' || this._selectType === 'multi'))) {
                        this._selectEl(this._currentEl, e.nodeEvent.shiftKey, e.nodeEvent.ctrlKey);
                    }
                }
                e.nodeEvent.preventDefault();
                break;
                
            case kijs.keys.DOWN_ARROW:
                if (this._currentEl && this._elements) {
                    let found = false;
                    kijs.Array.each(this._elements, function(el) {
                        if (found) {
                            if (el.top > this._currentEl.top && el.left === this._currentEl.left) {
                                this.current = el;
                                el.focus();
                                return false;
                            }
                        } else {
                            if (el === this._currentEl) {
                                found = true;
                            }
                        }
                    }, this);
                    
                    if (e.nodeEvent.shiftKey || (!e.nodeEvent.ctrlKey && (this._selectType === 'single' || this._selectType === 'multi'))) {
                        this._selectEl(this._currentEl, e.nodeEvent.shiftKey, e.nodeEvent.ctrlKey);
                    }
                }
                e.nodeEvent.preventDefault();
                break;

            case kijs.keys.SPACE:
                this._selectEl(this._currentEl, e.nodeEvent.shiftKey, e.nodeEvent.ctrlKey);
                e.nodeEvent.preventDefault();
                break;
                
        }
    }
    
    
    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(preventDestructEvent) {
        // Event auslösen.
        if (!preventDestructEvent) {
            this.raiseEvent('destruct');
        }
            
        // Variablen (Objekte/Arrays) leeren
        this._currentEl = null;
        this._lastSelectedEl = null;
        this._data = null;
        this._rpc = null;
        
        // Basisklasse entladen
        super.destruct(true);
    }
    
};