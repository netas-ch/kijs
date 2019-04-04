/* global kijs, this, HTMLElement */

// --------------------------------------------------------------
// kijs.gui.grid.columnWindow
// --------------------------------------------------------------


// --------------------------------------------------------------
kijs.gui.grid.columnWindow = class kijs_gui_grid_columnWindow extends kijs.gui.Window {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super();


        this._dom.clsAdd('kijs-columnwindow');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            caption: 'Spalten',
            iconChar: '&#xf0db', // fa-columns
            closable: true,
            maximizable: false,
            autoScroll: true,
            resizable: false,
            modal: true,
            width: 200,

            innerStyle: {
                padding: '10px'
            },
            footerStyle: {
                padding: '10px'
            },
            footerElements:[
                {
                    xtype: 'kijs.gui.Button',
                    caption: 'OK',
                    isDefault: true,
                    on: {
                        click: this._onOkClick,
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
            valueField: 'valueField',
            captionField: 'caption',
            data: data,
            value: values,
            ddSort: true
        });

        this.down('fields').on('ddOver', this._onDdOver, this);
        this.down('fields').on('change', this._onCheckChange, this);

        // anzeigen
        super.show();
    }

    // EVENTS
    _onOkClick() {
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
        this.destruct();
    }

    _onDdOver(e) {
        const vF = e.sourceElement ? e.sourceElement.dataRow.valueField : null;

        // columnConfig Suchen und prüfen ob sortierbar
        let columnConfig = this.grid.getColumnConfigByValueField(vF);
        let allowDd = columnConfig ? columnConfig.sortable : false;

        return allowDd;
    }

    _onCheckChange(e) {
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

        // Basisklasse auch entladen
        super.destruct(true);
    }
};