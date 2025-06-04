/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.grid.filter.Icon
// --------------------------------------------------------------
kijs.gui.grid.filter.Icon = class kijs_gui_grid_filter_Icon extends kijs.gui.grid.filter.Filter {

    
    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        this._compare = 'begin'; // full, part
        this._searchField = new kijs.gui.field.Text({disabled: true});
        this._checkboxGroup = null;

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            // keine
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }

        this.parent.grid.on('afterLoad', this.#onAfterLoad, this);
    }
    
    

    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get filter() {
        return Object.assign(super.filter, {
            type: 'icon',
            icons: this._checkboxGroup ? this._checkboxGroup.value : null
        });
    }

    get isFiltered() { return this._checkboxGroup ? this._checkboxGroup.value ? true : false : false; }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // overwrite
    render(superCall) {
        super.render(true);

        this._searchField.renderTo(this._searchContainer.node);

        // Event afterRender auslösen
        if (!superCall) {
            this.raiseEvent('afterRender');
        }
    }
    
    reset() {
        if (this._checkboxGroup) {
            this._checkboxGroup.checkedAll = true;
        }
        super.reset();
    }


    // PROTECTED
    _checkIcons() {
        let icons = [];
        let iconsCheck = [];
        let dataCnt = this._checkboxGroup ? this._checkboxGroup.data.length : 0;

        if (dataCnt <= this.columnConfig.iconsCnt) {

            // Alle Zeilen und Zellen vom Grid durchsuchen
            kijs.Array.each(this.parent.grid.rows, function(row) {
                    kijs.Array.each(row.cells, function(cell) {

                        // Überprüfen ob Zelle mit dem iconCharField übereinstimmt
                        if (cell.columnConfig.iconCharField === this.columnConfig.iconCharField){
                            let contains = false;

                            // Überprüfen, ob Icon schon in einem der Arrays ist
                            if (icons.length > 0) {
                                kijs.Array.each(icons, function(value){
                                        if (value.id === cell.originalIcon && value.icon === cell.icon && value.color === cell.iconColor && value.caption === cell.caption){
                                            contains = true;
                                        }
                                }, this);
                            }
                            if (this._checkboxGroup && !contains){
                                kijs.Array.each(this._checkboxGroup.data, function(data){
                                    if (data.id === cell.originalIcon && data.icon === cell.icon && data.color === cell.iconColor  && data.caption === cell.caption){
                                        contains = true;
                                    }
                                }, this);
                            }

                            // Icon dem Filter hinzufügen
                            if (!contains){
                                icons.push({id:cell.originalIcon, icon: cell.icon, color: cell.iconColor, caption: cell.caption});
                                iconsCheck.push(cell.originalIcon);
                            }
                        }
                    }, this);
            }, this);
        }
        return [icons, iconsCheck, dataCnt];
    }


    // PRIVATE
    // LISTENERS
    #onAfterLoad(e) {;
        let checkIcons = this._checkIcons();
        let icons = checkIcons[0];
        let iconsCheck = checkIcons[1];
        let dataCnt = checkIcons[2];

        // CheckboxGroup erstellen
        if (this._checkboxGroup === null && dataCnt + icons.length <= this.columnConfig.iconsCnt) {
            this._checkboxGroup = new kijs.gui.field.CheckboxGroup ({
                name: 'icons',
                valueField: 'id',
                iconCharField: 'icon',
                iconColorField: 'color',
                captionField: 'caption',
                data: icons,
                cls: 'kijs-filter-icon-checkboxgroup',
                checkedAll: true,
                on: {
                    change: this.#onFilterChange,
                    context: this
                }
            });
            this._menuButton.menu.add(['-', this._checkboxGroup]);

        } else if (this._checkboxGroup && icons.length > 0 ) {

            // Daten hinzufügen
            if (dataCnt + icons.length <= this.columnConfig.iconsCnt){
                this._checkboxGroup.addData(icons);
                this._checkboxGroup.checkedValues = iconsCheck;

            // CheckboxGroup entfernen
            } else {
                this._menuButton.menu.remove(['-', this._checkboxGroup]);
                this._checkboxGroup = null;
            }
        }
    }

    #onFilterChange() {
       this._applyToGrid();
    }

    #onKeyDown(e) {
        e.nodeEvent.stopPropagation();
        if (e.nodeEvent.key === 'Enter') {
            e.nodeEvent.preventDefault();
            this._applyToGrid();
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
        if (this._checkboxGroup) {
            this._checkboxGroup.destruct();
        }
        
        // Variablen (Objekte/Arrays) leeren
        this._searchField = null;
        this._checkboxGroup = null;
        
        // Basisklasse entladen
        super.destruct(true);
    }
    
};
