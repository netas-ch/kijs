/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.grid.filter.Text
// --------------------------------------------------------------
/**
 * Textfilter für kijs.gui.grid.Grid mit Suchfeld und Auswahl der Vergleichsart im Menü. Gefiltert wird
 * beim Verlassen des Suchfelds (change) oder sofort mit Enter.
 */
kijs.gui.grid.filter.Text = class kijs_gui_grid_filter_Text extends kijs.gui.grid.filter.Filter {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        // compare types
        this._compareTypes = {
            equal: kijs.getText('Ist gleich...'),
            unequal: kijs.getText('Ist nicht gleich...'),
            begin: kijs.getText('Beginnt mit...'),
            end: kijs.getText('Endet mit...'),
            part: kijs.getText('Enthält...'),
            notpart: kijs.getText('Enthält nicht...')
        };

        this._applyFilter = true;
        this._compare = 'begin'; // full, part
        this._searchField = new kijs.gui.field.Text({
            labelHide: true,
            on: {
                change: function() {
                    if (this._applyFilter) {
                        this._applyToGrid();
                    }
                    this._applyFilter = true;
                },
                keyDown: this.#onKeyDown,
                context: this
            }
        });

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            placeholder: kijs.getText('Suche') + '...'
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            placeholder: {target: 'placeholder'},
            compare: true   // {String|Boolean} Vergleichsart: 'equal', 'unequal', 'begin', 'end', 'part' oder 'notpart'. false = keine Auswahl im Menü. Default: 'begin'
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
     * Filter-Objekt für den Server: zusätzlich type 'text', search (Suchtext) und compare
     * @type {Object}
     */
    get filter() {
        return Object.assign(super.filter, {
            type: 'text',
            search: this._searchField.value,
            compare: this._compare
        });
    }

    /**
     * Ist der Filter aktiv (Suchtext oder Auswahl fester Werte)?
     * @type {Boolean}
     */
    get isFiltered() { return super.isFiltered || this._searchField.value !== ''; }

    /**
     * Platzhaltertext im Suchfeld. Default: 'Suche...'
     * @type {String}
     */
    get placeholder() { return this._searchField.placeholder; }
    set placeholder(val) { this._searchField.placeholder = val; }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    /**
     * Hat der Filter den Fokus (Menü offen oder Suchfeld)?
     * @returns {Boolean}
     */
    hasFocus() {
        if (super.hasFocus() || this._searchField.hasFocus) {
            return true;
        }

        return false;
    }

    // overwrite
    render(superCall) {
        super.render(true);

        this._searchField.renderTo(this._searchContainer.node);

        // Event afterRender auslösen
        if (!superCall) {
            this.raiseEvent('afterRender');
        }
    }

    /**
     * Leert das Suchfeld und setzt den Filter zurück.
     * @returns {undefined}
     */
    reset() {
        this._searchField.value = '';
        super.reset();
    }


    // PROTECTED
    // overwrite
    /**
     * Gibt die Menü-Elemente zurück, mit den Buttons für die Vergleichsart
     * @returns {Array}
     */
    _getMenuButtons() {
        let compareButtons = [];

        if (this._compare !== false && this._compareTypes) {
            compareButtons.push('-');

            for (const compareType in this._compareTypes) {
                compareButtons.push({
                    name: 'btn_compare_' + compareType,
                    caption : this._compareTypes[compareType],
                    iconMap: this._compare === compareType ? 'kijs.iconMap.Fa.square-check' : 'kijs.iconMap.Fa.square',
                    on: {
                        click: this.#onCompareBtnClick,
                        context: this
                    }
                });
            }
        }

        return kijs.Array.concat(this._getDefaultMenuButtons(),
            compareButtons,
            this._getCheckboxMenuButtons()
        );
    }


    // PRIVATE
    // LISTENERS
    #onCompareBtnClick(e) {
        this._menuButton.menu.close();

        if (e.element.name && e.element.name.substring(0, 'btn_compare_'.length) === 'btn_compare_') {
            this._compare = e.element.name.substring('btn_compare_'.length);
        }

        kijs.Array.each(e.element.parent.elements, function(element) {
            if (element.name === e.element.name) {
                element.iconMap = 'kijs.iconMap.Fa.square-check';

            } else if (element.name && element.name.substr(0, 'btn_compare_'.length) === 'btn_compare_') {
                element.iconMap = 'kijs.iconMap.Fa.square';
            }
        });
    }

    #onKeyDown(e) {
        e.nodeEvent.stopPropagation();
        if (e.nodeEvent.key === 'Enter') {
            e.nodeEvent.preventDefault();
            this._applyToGrid(true);
            this._applyFilter = false;
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
        if (this._searchField) {
            this._searchField.destruct();
        }

        // Variablen (Objekte/Arrays) leeren
        this._searchField = null;

        // Basisklasse entladen
        super.destruct(true);
    }

};
