/* global kijs */

// --------------------------------------------------------------
// kijs.gui.grid.filter.Text
// --------------------------------------------------------------
/**
 * EVENTS
 * ----------
 *
 */
kijs.gui.grid.filter.Text = class kijs_gui_grid_filter_Text extends kijs.gui.grid.filter.Filter {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        // compare types
        this._compareTypes = {
            full: kijs.getText('Ist gleich...'),
            notfull: kijs.getText('Ist nicht gleich...'),
            begin: kijs.getText('Beginnt mit...'),
            end: kijs.getText('Endet mit...'),
            part: kijs.getText('Enthält...'),
            notpart: kijs.getText('Enthält nicht...')
        };

        this._applyFilter = true;
        this._compare = 'begin';
        this._searchField = new kijs.gui.field.Text({
            on: {
                change: function() {
                    if (this._applyFilter) {
                        this._applyToGrid();
                    }
                    this._applyFilter = true;
                },
                keyDown: this._onKeyDown,
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
            compare: true
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

    get filter() {
        return Object.assign(super.filter, {
            type: 'text',
            search: this._searchField.value,
            compare: this._compare
        });
    }

    get isFiltered() { return super.isFiltered || this._searchField.value !== ''; }

    get placeholder() { return this._searchField.placeholder; }
    set placeholder(val) { this._searchField.placeholder = val; }

    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------

    hasFocus() {
        if (super.hasFocus() || this._searchField.hasFocus) {
            return true;
        }

        return false;
    }

    reset() {
        this._searchField.value = '';
        super.reset();
    }

    // overwrite
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
                        click: this._onCompareBtnClick,
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

    _onCompareBtnClick(e) {
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

    _onKeyDown(e) {
        e.nodeEvent.stopPropagation();
        if (e.nodeEvent.key === 'Enter') {
            e.nodeEvent.preventDefault();
            this._applyToGrid(true);
            this._applyFilter = false;
        }
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


};
