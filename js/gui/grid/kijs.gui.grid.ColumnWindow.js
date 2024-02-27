/* global kijs, this, HTMLElement */

// --------------------------------------------------------------
// kijs.gui.grid.ColumnWindow
// --------------------------------------------------------------
kijs.gui.grid.ColumnWindow = class kijs_gui_grid_ColumnWindow extends kijs.gui.Window {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        this._dom.clsAdd('kijs-columnwindow');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            caption: kijs.getText('Spalten'),
            iconMap: 'kijs.iconMap.Fa.table-columns',
            closable: true,
            maximizable: false,
            scrollableY: 'auto',
            resizable: false,
            modal: true,
            width: 200,

            innerStyle: {
                padding: '10px'
            },

            footerElements:[
                {
                    xtype: 'kijs.gui.Button',
                    caption: kijs.getText('OK'),
                    style: { flex: 1 },
                    isDefault: true,
                    on: {
                        click: this.#onOkClick,
                        context: this
                    }
                },{
                    xtype: 'kijs.gui.Button',
                    caption: kijs.getText('Abbrechen'),
                    isDefault: false,
                    on: {
                        click: this.#onCancelClick,
                        context: this
                    }
                }
            ]
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {

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
    get grid() { return this.parent.header.grid; }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    show() {
        let data = [];
        let values = [];
        kijs.Array.each(this.grid.columnConfigs, function(columnConfig) {
            data.push({valueField: columnConfig.valueField, caption: columnConfig.caption });
            if (columnConfig.visible) {
                values.push(columnConfig.valueField);
            }
        }, this);

        this.add({
            xtype: 'kijs.gui.field.CheckboxGroup',
            name: 'fields',
            labelHide: true,
            valueField: 'valueField',
            captionField: 'caption',
            data: data,
            value: values,
            sortable: true
        });

        this.down('fields').on('ddOver', this.#onDdOver, this);
        this.down('fields').on('change', this.#onCheckChange, this);

        // anzeigen
        super.show();
    }


    // PRIVATE
    // LISTENERS
    #onCheckChange(e) {
        let unchecked = kijs.Array.diff(e.oldValue, e.value);

        kijs.Array.each(unchecked, function(valueField) {
            let columnConfig = this.grid.getColumnConfigByValueField(valueField);

            // uncheck verhindern, hacken wieder setzen
            if (!columnConfig.hideable) {
                kijs.defer(function() {
                    let flds = this.down('fields').value;
                    flds.push(valueField);
                    this.down('fields').value = flds;
                },20, this);
            }

        }, this);
    }
    
    #onDdOver(e) {
        const vF = e.sourceElement ? e.sourceElement.dataRow.valueField : null;

        // columnConfig Suchen und prüfen ob sortierbar
        let columnConfig = this.grid.getColumnConfigByValueField(vF);
        let allowDd = columnConfig ? columnConfig.sortable : false;

        return allowDd;
    }
    
    #onOkClick() {
        let flds = this.down('fields').value;
        
        // Sichtbarkeit übernehmen
        kijs.Array.each(this.grid.columnConfigs, function(columnConfig) {
            columnConfig.visible = kijs.Array.contains(flds, columnConfig.valueField);
        }, this);
        
        // Sortierung übernehmen
        let elements = this.down('fields').elements;
        for (let i=0; i<elements.length; i++) {
            let vF = elements[i].dataRow.valueField;

            // columnConfig Suchen und Position schreiben
            let columnConfig = this.grid.getColumnConfigByValueField(vF);
            if (columnConfig) {
                columnConfig.position = i;
            }
        }

        // Fenster schliessen
        this.close();
    }
    
    #onCancelClick(e) {
        // Fenster schliessen
        this.close();
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

        // Basisklasse auch entladen
        super.destruct(true);
    }
    
};
