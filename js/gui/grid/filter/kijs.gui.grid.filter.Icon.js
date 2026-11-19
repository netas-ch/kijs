/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.grid.filter.Icon
// --------------------------------------------------------------
/**
 * Filter für Icon-Spalten in kijs.gui.grid.Grid: Nach jedem Laden werden die vorkommenden Icons als
 * Auswahl (Checkboxen) im Menü angeboten. Die Auswahl erscheint nur, wenn columnConfig.iconsCnt
 * gesetzt ist und nicht mehr verschiedene Icons vorkommen. Als Text der Checkboxen dient der Tooltip
 * (columnConfig.tooltipField). Der Server muss den Filter mit type 'icon' auswerten.
 *
 * @example
 * columnConfigs: [{
 *     xtype: 'kijs.gui.grid.columnConfig.Icon',
 *     caption: 'Status',
 *     iconMapField: 'icon',
 *     tooltipField: 'statusText',
 *     iconsCnt: 20
 * }]
 */
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
        this._separatorEl = null;

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
    /**
     * Filter-Objekt für den Server: zusätzlich type 'icon' und icons (ausgewählte Icons oder null).
     * Ist bei der Spalte kein valueField gesetzt, wird iconMapField bzw. iconCharField verwendet.
     * @type {Object}
     */
    get filter() {
        let flt = Object.assign(super.filter, {
            type: 'icon',
            icons: this._checkboxGroup ? this._checkboxGroup.value : null
        });
        if (!flt.valueField) {
            flt.valueField = this.columnConfig.iconMapField || this.columnConfig.iconCharField || '';
        }
        return flt;
    }

    /**
     * Ist nicht alles ausgewählt?
     * @type {Boolean}
     */
    get isFiltered() { return this._checkboxGroup ? !this._checkboxGroup.checkedAll : false; }



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
    
    /**
     * Wählt alle Icons aus und setzt den Filter zurück.
     * @returns {undefined}
     */
    reset() {
        if (this._checkboxGroup) {
            this._checkboxGroup.checkedAll = true;
        }
        super.reset();
    }


    // PROTECTED
    /**
     * Sucht in den Zellen der Spalte die Icons, die noch nicht in der Auswahl sind.
     * @returns {Array}  [icons, iconsCheck, dataCnt]: neue Icons, deren IDs und Anzahl bisheriger Einträge
     */
    _checkIcons() {
        let icons = [];
        let iconsCheck = [];
        let dataCnt = this._checkboxGroup ? this._checkboxGroup.data.length : 0;

        if (kijs.isNumber(this.columnConfig.iconsCnt) && dataCnt <= this.columnConfig.iconsCnt) {

            // Alle Zeilen und Zellen vom Grid durchsuchen
            kijs.Array.each(this.parent.grid.rows, function(row) {
                    kijs.Array.each(row.cells, function(cell) {

                        // Nur Zellen dieser Spalte
                        if (cell.columnConfig === this.columnConfig){
                            let contains = false;

                            // Text der Checkbox: Tooltip
                            let caption = '';
                            if (this.columnConfig.tooltipField && row.dataRow
                                    && !kijs.isEmpty(row.dataRow[this.columnConfig.tooltipField])) {
                                caption = String(row.dataRow[this.columnConfig.tooltipField]);
                            }

                            // Überprüfen, ob Icon schon in einem der Arrays ist
                            if (icons.length > 0) {
                                kijs.Array.each(icons, function(value){
                                        if (value.id === cell.originalIcon && value.icon === cell.icon && value.color === cell.iconColor && value.caption === caption){
                                            contains = true;
                                        }
                                }, this);
                            }
                            if (this._checkboxGroup && !contains){
                                kijs.Array.each(this._checkboxGroup.data, function(data){
                                    if (data.id === cell.originalIcon && data.icon === cell.icon && data.color === cell.iconColor  && data.caption === caption){
                                        contains = true;
                                    }
                                }, this);
                            }

                            // Icon dem Filter hinzufügen
                            if (!contains){
                                icons.push({id:cell.originalIcon, icon: cell.icon, color: cell.iconColor, caption: caption, cls: cell.iconCls});
                                iconsCheck.push(cell.originalIcon);
                            }
                        }
                    }, this);
            }, this);
        }
        return [icons, iconsCheck, dataCnt];
    }

    // overwrite
    /**
     * Gibt die Menü-Elemente zurück, mit der Icon-Auswahl (falls vorhanden)
     * @returns {Array}
     */
    _getMenuButtons() {
        let buttons = super._getMenuButtons();
        if (this._checkboxGroup) {
            buttons = kijs.Array.concat(buttons, [this._separatorEl, this._checkboxGroup]);
        }
        return buttons;
    }


    // PRIVATE
    // LISTENERS
    #onAfterLoad(e) {
        if (kijs.isEmpty(e.response.errorType)) {
            let checkIcons = this._checkIcons();
            let icons = checkIcons[0];
            let iconsCheck = checkIcons[1];
            let dataCnt = checkIcons[2];

            // Ohne iconsCnt keine Auswahl
            if (!kijs.isNumber(this.columnConfig.iconsCnt)) {
                return;
            }

            // CheckboxGroup erstellen
            if (this._checkboxGroup === null && icons.length > 0 && dataCnt + icons.length <= this.columnConfig.iconsCnt) {
                this._separatorEl = new kijs.gui.Separator();
                this._checkboxGroup = new kijs.gui.field.CheckboxGroup ({
                    name: 'icons',
                    valueField: 'id',
                    iconCharField: 'icon',
                    iconClsField: 'cls',
                    iconColorField: 'color',
                    displayTextField: 'caption',
                    data: icons,
                    cls: 'kijs-filter-icon-checkboxgroup',
                    checkedAll: true,
                    on: {
                        change: this.#onFilterChange,
                        context: this
                    }
                });
                this._menuButton.menu.add([this._separatorEl, this._checkboxGroup]);

            } else if (this._checkboxGroup && icons.length > 0 ) {

                // Daten hinzufügen
                if (dataCnt + icons.length <= this.columnConfig.iconsCnt){
                    // neue Icons ausgewählt hinzufügen
                    this._checkboxGroup.addData(icons);
                    this._checkboxGroup.value = kijs.Array.concat(this._checkboxGroup.value, iconsCheck);

                // CheckboxGroup entfernen
                } else {
                    this._menuButton.menu.remove([this._separatorEl, this._checkboxGroup]);
                    this._checkboxGroup = null;
                    this._separatorEl = null;
                }
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
        
        // Variablen (Objekte/Arrays) leeren
        this._searchField = null;
        
        // Basisklasse entladen
        super.destruct(true);
    }
    
};
