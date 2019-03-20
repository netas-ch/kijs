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
        config = Object.assign({}, {
            caption: 'Spalten',
            iconChar: '&#xf0db', // fa-columns
            closable: true,
            maximizable: false,
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
        }, config);

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {

        });


        // Config anwenden
        if (kijs.isObject(config)) {
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
            value: values
        });

        // anzeigen
        super.show();


    }

    // EVENTS
    _onOkClick() {
        let flds = this.down('fields').value;

        // sichtbarkeit übernehmen
        kijs.Array.each(this.grid.columnConfigs, function(columnConfig) {
            columnConfig.visible = kijs.Array.contains(flds, columnConfig.valueField);
        }, this);

        // fenster schliessen
        this.destruct();
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