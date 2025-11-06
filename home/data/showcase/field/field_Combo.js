/* global kijs */

home.sc.field_Combo = class home_sc_field_Combo {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        this._app = config.app;
        this._content = null;
    }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    getContent() {
        let Laender = [
            {"ISO":"AF", "Land":"Afghanistan"},
            {"ISO":"EG", "Land":"Ägypten"},
            {"ISO":"AX", "Land":"Åland"},
            {"ISO":"AL", "Land":"Albanien"},
            {"ISO":"DZ", "Land":"Algerien"},
            {"ISO":"VI", "Land":"Amerikanische Jungferninseln"},
            {"ISO":"AS", "Land":"Amerikanisch-Samoa"},
            {"ISO":"AD", "Land":"Andorra"},
            {"ISO":"AO", "Land":"Angola"},
            {"ISO":"AI", "Land":"Anguilla"},
            {"ISO":"AQ", "Land":"Antarktika"},
            {"ISO":"AG", "Land":"Antigua und Barbuda"},
            {"ISO":"GQ", "Land":"Äquatorialguinea"},
            {"ISO":"AR", "Land":"Argentinien"},
            {"ISO":"AM", "Land":"Armenien"},
            {"ISO":"AW", "Land":"Aruba"},
            {"ISO":"AZ", "Land":"Aserbaidschan"},
            {"ISO":"ET", "Land":"Äthiopien"},
            {"ISO":"AU", "Land":"Australien"},
            {"ISO":"BS", "Land":"Bahamas"},
            {"ISO":"BH", "Land":"Bahrain"},
            {"ISO":"BD", "Land":"Bangladesch"},
            {"ISO":"BB", "Land":"Barbados"},
            {"ISO":"BY", "Land":"Belarus"},
            {"ISO":"BE", "Land":"Belgien"},
            {"ISO":"BZ", "Land":"Belize"},
            {"ISO":"BJ", "Land":"Benin"},
            {"ISO":"BM", "Land":"Bermuda"},
            {"ISO":"BT", "Land":"Bhutan"},
            {"ISO":"BO", "Land":"Bolivien"},
            {"ISO":"BA", "Land":"Bosnien und Herzegowina"},
            {"ISO":"BW", "Land":"Botsuana"},
            {"ISO":"BV", "Land":"Bouvetinsel"},
            {"ISO":"BR", "Land":"Brasilien"},
            {"ISO":"VG", "Land":"Britische Jungferninseln"},
            {"ISO":"IO", "Land":"Britisches Territorium im Indischen Ozean"},
            {"ISO":"BN", "Land":"Brunei Darussalam"},
            {"ISO":"BG", "Land":"Bulgarien"},
            {"ISO":"BF", "Land":"Burkina Faso"},
            {"ISO":"BI", "Land":"Burundi"},
            {"ISO":"CV", "Land":"Cabo Verde"},
            {"ISO":"CL", "Land":"Chile"},
            {"ISO":"CN", "Land":"China"},
            {"ISO":"CK", "Land":"Cookinseln"},
            {"ISO":"CR", "Land":"Costa Rica"},
            {"ISO":"CI", "Land":"Côte d'Ivoire"},
            {"ISO":"DK", "Land":"Dänemark"},
            {"ISO":"DE", "Land":"Deutschland"},
            {"ISO":"DM", "Land":"Dominica"},
            {"ISO":"DO", "Land":"Dominikanische Republik"},
            {"ISO":"DJ", "Land":"Dschibuti"},
            {"ISO":"EC", "Land":"Ecuador"},
            {"ISO":"SV", "Land":"El Salvador"},
            {"ISO":"ER", "Land":"Eritrea"},
            {"ISO":"EE", "Land":"Estland"},
            {"ISO":"SZ", "Land":"Eswatini"},
            {"ISO":"FK", "Land":"Falklandinseln"},
            {"ISO":"FO", "Land":"Färöer"},
            {"ISO":"FJ", "Land":"Fidschi"},
            {"ISO":"FI", "Land":"Finnland"},
            {"ISO":"FR", "Land":"Frankreich"},
            {"ISO":"FX", "Land":"Frankreich (metropolitanes)"},
            {"ISO":"GF", "Land":"Französisch-Guayana"},
            {"ISO":"PF", "Land":"Französisch-Polynesien"},
            {"ISO":"GA", "Land":"Gabun"},
            {"ISO":"GM", "Land":"Gambia"},
            {"ISO":"GE", "Land":"Georgien"},
            {"ISO":"GH", "Land":"Ghana"},
            {"ISO":"GI", "Land":"Gibraltar"},
            {"ISO":"GD", "Land":"Grenada"},
            {"ISO":"GR", "Land":"Griechenland"},
            {"ISO":"GL", "Land":"Grönland"},
            {"ISO":"GB", "Land":"Großbritannien"},
            {"ISO":"GP", "Land":"Guadeloupe"},
            {"ISO":"GU", "Land":"Guam"},
            {"ISO":"GT", "Land":"Guatemala"},
            {"ISO":"GG", "Land":"Guernsey"},
            {"ISO":"GN", "Land":"Guinea"},
            {"ISO":"GW", "Land":"Guinea-Bissau"},
            {"ISO":"GY", "Land":"Guyana"},
            {"ISO":"HT", "Land":"Haiti"},
            {"ISO":"HM", "Land":"Heard und McDonaldinseln"},
            {"ISO":"HN", "Land":"Honduras"},
            {"ISO":"HK", "Land":"Hongkong"},
            {"ISO":"IN", "Land":"Indien"},
            {"ISO":"ID", "Land":"Indonesien"},
            {"ISO":"IM", "Land":"Insel Man"},
            {"ISO":"IQ", "Land":"Irak"},
            {"ISO":"IR", "Land":"Iran"},
            {"ISO":"IE", "Land":"Irland"},
            {"ISO":"IS", "Land":"Island"},
            {"ISO":"IL", "Land":"Israel"},
            {"ISO":"IT", "Land":"Italien"},
            {"ISO":"JM", "Land":"Jamaika"},
            {"ISO":"JP", "Land":"Japan"},
            {"ISO":"YE", "Land":"Jemen"},
            {"ISO":"JE", "Land":"Jersey"},
            {"ISO":"JO", "Land":"Jordanien"},
            {"ISO":"KY", "Land":"Kaimaninseln"},
            {"ISO":"KH", "Land":"Kambodscha"},
            {"ISO":"CM", "Land":"Kamerun"},
            {"ISO":"CA", "Land":"Kanada"},
            {"ISO":"KZ", "Land":"Kasachstan"},
            {"ISO":"QA", "Land":"Katar"},
            {"ISO":"KE", "Land":"Kenia"},
            {"ISO":"KG", "Land":"Kirgisistan"},
            {"ISO":"KI", "Land":"Kiribati"},
            {"ISO":"UM", "Land":"Kleinere Amerikanische Überseeinseln"},
            {"ISO":"CC", "Land":"Kokosinseln (Keelinginseln)"},
            {"ISO":"CO", "Land":"Kolumbien"},
            {"ISO":"KM", "Land":"Komoren"},
            {"ISO":"CG", "Land":"Kongo"},
            {"ISO":"CD", "Land":"Kongo, Demokratische Republik"},
            {"ISO":"KP", "Land":"Korea, Demokratische Volksrepublik"},
            {"ISO":"KR", "Land":"Korea, Republik"},
            {"ISO":"HR", "Land":"Kroatien"},
            {"ISO":"CU", "Land":"Kuba"},
            {"ISO":"KW", "Land":"Kuwait"},
            {"ISO":"LA", "Land":"Laos"},
            {"ISO":"LS", "Land":"Lesotho"},
            {"ISO":"LV", "Land":"Lettland"},
            {"ISO":"LB", "Land":"Libanon"},
            {"ISO":"LR", "Land":"Liberia"},
            {"ISO":"LY", "Land":"Libyen"},
            {"ISO":"LI", "Land":"Liechtenstein"},
            {"ISO":"LT", "Land":"Litauen"},
            {"ISO":"LU", "Land":"Luxemburg"},
            {"ISO":"MO", "Land":"Macau"},
            {"ISO":"MG", "Land":"Madagaskar"},
            {"ISO":"MW", "Land":"Malawi"},
            {"ISO":"MY", "Land":"Malaysia"},
            {"ISO":"MV", "Land":"Malediven"},
            {"ISO":"ML", "Land":"Mali"},
            {"ISO":"MT", "Land":"Malta"},
            {"ISO":"MA", "Land":"Marokko"},
            {"ISO":"MH", "Land":"Marshallinseln"},
            {"ISO":"MQ", "Land":"Martinique"},
            {"ISO":"MR", "Land":"Mauretanien"},
            {"ISO":"MU", "Land":"Mauritius"},
            {"ISO":"YT", "Land":"Mayotte"},
            {"ISO":"MX", "Land":"Mexiko"},
            {"ISO":"FM", "Land":"Mikronesien"},
            {"ISO":"MD", "Land":"Moldau"},
            {"ISO":"MC", "Land":"Monaco"},
            {"ISO":"MN", "Land":"Mongolei"},
            {"ISO":"ME", "Land":"Montenegro"},
            {"ISO":"MS", "Land":"Montserrat"},
            {"ISO":"MZ", "Land":"Mosambik"},
            {"ISO":"MM", "Land":"Myanmar"},
            {"ISO":"NA", "Land":"Namibia"},
            {"ISO":"NR", "Land":"Nauru"},
            {"ISO":"NP", "Land":"Nepal"},
            {"ISO":"NC", "Land":"Neukaledonien"},
            {"ISO":"NZ", "Land":"Neuseeland"},
            {"ISO":"NI", "Land":"Nicaragua"},
            {"ISO":"NL", "Land":"Niederlande"},
            {"ISO":"AN", "Land":"Niederländische Antillen"},
            {"ISO":"NE", "Land":"Niger"},
            {"ISO":"NG", "Land":"Nigeria"},
            {"ISO":"NU", "Land":"Niue"},
            {"ISO":"MP", "Land":"Nördliche Marianen"},
            {"ISO":"MK", "Land":"Nordmazedonien"},
            {"ISO":"NF", "Land":"Norfolkinsel"},
            {"ISO":"NO", "Land":"Norwegen"},
            {"ISO":"OM", "Land":"Oman"},
            {"ISO":"AT", "Land":"Österreich"},
            {"ISO":"PK", "Land":"Pakistan"},
            {"ISO":"PW", "Land":"Palau"},
            {"ISO":"PA", "Land":"Panama"},
            {"ISO":"PG", "Land":"Papua-Neuguinea"},
            {"ISO":"PY", "Land":"Paraguay"},
            {"ISO":"PE", "Land":"Peru"},
            {"ISO":"PH", "Land":"Philippinen"},
            {"ISO":"PN", "Land":"Pitcairninseln"},
            {"ISO":"PL", "Land":"Polen"},
            {"ISO":"PT", "Land":"Portugal"},
            {"ISO":"PR", "Land":"Puerto Rico"},
            {"ISO":"RE", "Land":"Réunion"},
            {"ISO":"RW", "Land":"Ruanda"},
            {"ISO":"RO", "Land":"Rumänien"},
            {"ISO":"RU", "Land":"Russische Föderation"},
            {"ISO":"MF", "Land":"Saint-Martin"},
            {"ISO":"SB", "Land":"Salomonen"},
            {"ISO":"ZM", "Land":"Sambia"},
            {"ISO":"WS", "Land":"Samoa"},
            {"ISO":"SM", "Land":"San Marino"},
            {"ISO":"ST", "Land":"São Tomé und Príncipe"},
            {"ISO":"SA", "Land":"Saudi-Arabien"},
            {"ISO":"SE", "Land":"Schweden"},
            {"ISO":"CH", "Land":"Schweiz"},
            {"ISO":"SN", "Land":"Senegal"},
            {"ISO":"RS", "Land":"Serbien"},
            {"ISO":"CS", "Land":"Serbien und Montenegro"},
            {"ISO":"SC", "Land":"Seychellen"},
            {"ISO":"SL", "Land":"Sierra Leone"},
            {"ISO":"ZW", "Land":"Simbabwe"},
            {"ISO":"SG", "Land":"Singapur"},
            {"ISO":"SK", "Land":"Slowakei"},
            {"ISO":"SI", "Land":"Slowenien"},
            {"ISO":"SO", "Land":"Somalia"},
            {"ISO":"ES", "Land":"Spanien"},
            {"ISO":"SJ", "Land":"Spitzbergen"},
            {"ISO":"LK", "Land":"Sri Lanka"},
            {"ISO":"BL", "Land":"St. Barthélemy"},
            {"ISO":"SH", "Land":"St. Helena, Ascension und Tristan da Cunha"},
            {"ISO":"KN", "Land":"St. Kitts und Nevis"},
            {"ISO":"LC", "Land":"St. Lucia"},
            {"ISO":"PM", "Land":"St. Pierre und Miquelon"},
            {"ISO":"VC", "Land":"St. Vincent und die Grenadinen"},
            {"ISO":"ZA", "Land":"Südafrika"},
            {"ISO":"SD", "Land":"Sudan"},
            {"ISO":"GS", "Land":"Südgeorgien und die Südlichen Sandwichinseln"},
            {"ISO":"SS", "Land":"Südsudan"},
            {"ISO":"SR", "Land":"Suriname"},
            {"ISO":"SY", "Land":"Syrien"},
            {"ISO":"TJ", "Land":"Tadschikistan"},
            {"ISO":"TW", "Land":"Taiwan"},
            {"ISO":"TZ", "Land":"Tansania"},
            {"ISO":"TH", "Land":"Thailand"},
            {"ISO":"TL", "Land":"Timor-Leste"},
            {"ISO":"TG", "Land":"Togo"},
            {"ISO":"TK", "Land":"Tokelau"},
            {"ISO":"TO", "Land":"Tonga"},
            {"ISO":"TT", "Land":"Trinidad und Tobago"},
            {"ISO":"TD", "Land":"Tschad"},
            {"ISO":"CZ", "Land":"Tschechische Republik"},
            {"ISO":"TN", "Land":"Tunesien"},
            {"ISO":"TR", "Land":"Türkei"},
            {"ISO":"TM", "Land":"Turkmenistan"},
            {"ISO":"TC", "Land":"Turks- und Caicosinseln"},
            {"ISO":"TV", "Land":"Tuvalu"},
            {"ISO":"UG", "Land":"Uganda"},
            {"ISO":"UA", "Land":"Ukraine"},
            {"ISO":"HU", "Land":"Ungarn"},
            {"ISO":"UY", "Land":"Uruguay"},
            {"ISO":"UZ", "Land":"Usbekistan"},
            {"ISO":"VU", "Land":"Vanuatu"},
            {"ISO":"VA", "Land":"Vatikanstadt"},
            {"ISO":"VE", "Land":"Venezuela"},
            {"ISO":"AE", "Land":"Vereinigte Arabische Emirate"},
            {"ISO":"US", "Land":"Vereinigte Staaten"},
            {"ISO":"VN", "Land":"Vietnam"},
            {"ISO":"WF", "Land":"Wallis und Futuna"},
            {"ISO":"CX", "Land":"Weihnachtsinsel"},
            {"ISO":"PS", "Land":"Westjordanland"},
            {"ISO":"EH", "Land":"Westsahara"},
            {"ISO":"CF", "Land":"Zentralafrikanische Republik"},
            {"ISO":"CY", "Land":"Zypern"}
        ];

        this._content = new kijs.gui.Panel({
            caption: 'kijs.gui.field.Combo',
            cls: ['kijs-borderless', 'kijs-flexform'],
            scrollableY: 'auto',
            style: {
                flex: 1
            },
            innerStyle: {
                padding: '10px'
            },
            headerElements: this._getHeaderElements(),
            elements:[
                {
                    xtype: 'kijs.gui.field.Display',
                    cls: 'kijs-titleLarge',
                    value: 'Minimalkonfiguration:'
                },{
                    xtype: 'kijs.gui.field.Combo',
                    data: [
                        { displayText: 'Apple', value: 1},
                        { displayText: 'Linux', value: 2},
                        { displayText: 'Windows', value: 3}
                    ]
                },

                {
                    xtype: 'kijs.gui.field.Display',
                    cls: 'kijs-titleLarge',
                    value: 'ohne RPC',
                    style: { margin: '10px 0 0 0'}
                },{
                    xtype: 'kijs.gui.field.Display',
                    value: 'Mit Wert (Unix) den es nicht mehr gibt.',
                    style: { margin: '10px 0 0 0'}
                },{
                    xtype: 'kijs.gui.field.Combo',
                    label: 'Label',
                    valueField: 'value',
                    displayTextField: 'displayText',
                    iconMapField: 'iconMap',
                    iconColorField: '',
                    value: 4,
                    valueRow: { displayText: 'Unix', iconMap: 'kijs.iconMap.Fa.skull', value: 4},
                    data: [
                        { displayText: 'Apple', iconMap: 'kijs.iconMap.Fa.apple', value: 1},
                        { displayText: 'Linux', iconMap: 'kijs.iconMap.Fa.linux', value: 2},
                        { displayText: 'Windows', iconMap: 'kijs.iconMap.Fa.windows', value: 3}
                    ],
                    elements:[
                        {
                            xtype: 'kijs.gui.Button',
                            iconMap: 'kijs.iconMap.Fa.stamp',
                            smallPaddings: false,
                            cls: 'kijs-inline',
                            on: {
                                click: function(e) {
                                    kijs.gui.CornerTipContainer.show('value', e.raiseElement.parent.value);
                                },
                                context: this
                            }
                        },{
                            xtype: 'kijs.gui.Button',
                            iconMap: 'kijs.iconMap.Fa.stamp'
                        }
                    ],
                    on: {
                        focus:  console.log,

                        keyDown:  console.log,
                        enterPress:  console.log,
                        enterEscPress:  console.log,
                        escPress:  console.log,
                        spacePress:  console.log,

                        blur:  console.log,
                        change: console.log,
                        input:  console.log,

                        context: this
                    }
                },{
                    xtype: 'kijs.gui.field.Display',
                    value: 'Viele Datensätze',
                    style: { margin: '10px 0 0 0'}
                },{
                    xtype: 'kijs.gui.field.Combo',
                    label: 'mit value',
                    valueField: 'ISO',
                    displayTextField: 'Land',
                    value: 'FR',
                    data: Laender
                },{
                    xtype: 'kijs.gui.field.Combo',
                    label: 'ohne value',
                    valueField: 'ISO',
                    displayTextField: 'Land',
                    data: Laender
                },{
                    xtype: 'kijs.gui.field.Display',
                    value: 'Disabled Values und queryOperator:"PART"',
                    style: { margin: '10px 0 0 0'}
                },{
                    xtype: 'kijs.gui.field.Combo',
                    label: 'Label',
                    valueField: 'value',
                    displayTextField: 'displayText',
                    iconMapField: 'iconMap',
                    iconColorField: '',
                    disabledField: 'disabled',
                    queryOperator: 'PART',
                    value: 3,
                    data: [
                        { displayText: 'Apple OSx', iconMap: 'kijs.iconMap.Fa.apple', value: 1 },
                        { displayText: 'Apple iOS', iconMap: 'kijs.iconMap.Fa.apple', value: 2, disabled: true },
                        { displayText: 'Google ChromeOS', iconMap: 'kijs.iconMap.Fa.chrome', value: 3 },
                        { displayText: 'Google Android', iconMap: 'kijs.iconMap.Fa.android', value: 4, disabled: true },
                        { displayText: 'Linux', iconMap: 'kijs.iconMap.Fa.linux', value: 5 },
                        { displayText: 'Windows', iconMap: 'kijs.iconMap.Fa.windows', value: 6 }
                    ]
                },

                {
                    xtype: 'kijs.gui.field.Display',
                    cls: 'kijs-titleLarge',
                    value: 'RPC mit enableRemoteFiltering:false',
                    style: { margin: '10px 0 0 0'}
                },{
                    xtype: 'kijs.gui.field.Combo',
                    label: 'Farben',
                    //rpc: 'default'
                    rpcLoadFn: 'combo.farbe.load',
                    valueField: 'color',
                    iconMapField: 'iconMap',
                    iconColorField: 'color',
                    tooltipField: 'color',
                    displayTextField: 'displayText',
                    autoLoad: true,
                    value: '#0f0'
                },{
                    xtype: 'kijs.gui.field.Combo',
                    label: 'Stadt',
                    //rpc: 'default'
                    rpcLoadFn: 'combo.stadt.load',
                    valueField: 'Stadt',
                    displayTextField: 'Stadt',
                    value: 'Hinwil',
                    autoLoad: true
                },{
                    xtype: 'kijs.gui.field.Combo',
                    label: 'Land',
                    //rpc: 'default'
                    rpcLoadFn: 'combo.land.load',
                    valueField: 'ISO',
                    displayTextField: 'Land',
                    value: 'CH',
                    autoLoad: true
                },{
                    xtype: 'kijs.gui.field.Combo',
                    label: 'Berufe',
                    //rpc: 'default'
                    rpcLoadFn: 'combo.beruf.load',
                    valueField: 'BerufId',
                    displayTextField: 'Beruf',
                    autoLoad: true,
                    displayLimit: 30
                },

                {
                    xtype: 'kijs.gui.field.Display',
                    cls: 'kijs-titleLarge',
                    value: 'RPC mit enableRemoteFiltering:true und autoLoad:true',
                    style: { margin: '10px 0 0 0'}
                },{
                    xtype: 'kijs.gui.field.Combo',
                    label: 'Berufe',
                    //rpc: 'default'
                    rpcLoadFn: 'combo.beruf.load',
                    valueField: 'BerufId',
                    displayTextField: 'Beruf',
                    enableRemoteFiltering: true,
                    autoLoad: true
                },{
                    xtype: 'kijs.gui.field.Display',
                    cls: 'kijs-titleLarge',
                    value: 'RPC mit enableRemoteFiltering:true und autoLoad:false',
                    style: { margin: '10px 0 0 0'}
                },{
                    xtype: 'kijs.gui.field.Combo',
                    label: 'Berufe',
                    //rpc: 'default'
                    rpcLoadFn: 'combo.beruf.load',
                    valueField: 'BerufId',
                    displayTextField: 'Beruf',
                    enableRemoteFiltering: true,
                    autoLoad: false//,
                    //valueRow: {value: 1889, displayText: 'Anknüpfer'}
                }
            ]
        });

        return this._content;
    }

    run() {

    }


    // PROTECTED
    _callFunction(fnName) {
        kijs.Array.each(this._content.elements, function(el) {
            if (el instanceof kijs.gui.field.Field) {
                el[fnName]();
            }
        }, this);
    }

    _getHeaderElements() {
        return [
            {
                xtype: 'kijs.gui.field.Switch',
                label: 'disabled',
                on: {
                    change: function(e) {
                        this._content.innerDisabled = !!e.element.value;
                    },
                    context: this
                }
            },{
                xtype: 'kijs.gui.field.Switch',
                label: 'disableFlex',
                on: {
                    change: function(e) {
                        this._updateProperty('disableFlex', e.element.value);
                    },
                    context: this
                }
            },{
                xtype: 'kijs.gui.field.Switch',
                label: 'labelHide',
                on: {
                    change: function(e) {
                        this._updateProperty('labelHide', e.element.value);
                    },
                    context: this
                }
            },{
                xtype: 'kijs.gui.field.Switch',
                label: 'labelWidth = 120',
                on: {
                    change: function(e) {
                        this._updateProperty('labelWidth', e.element.value ? 120 : null);
                    },
                    context: this
                }
            },{
                xtype: 'kijs.gui.field.Switch',
                label: 'readOnly',
                on: {
                    change: function(e) {
                        this._updateProperty('readOnly', e.element.value);
                    },
                    context: this
                }
            },{
                xtype: 'kijs.gui.field.Switch',
                label: 'required',
                on: {
                    change: function(e) {
                        this._updateProperty('required', e.element.value);
                        this._callFunction('validate');
                    },
                    context: this
                }
            },{
                xtype: 'kijs.gui.field.Switch',
                label: 'showHelp',
                on: {
                    change: function(e) {
                        let value = '';
                        if (e.element.value) {
                            value = 'Dies ist ein Hilfetext';
                        }
                        this._updateProperty('helpText', value);
                    },
                    context: this
                }
            },{
                xtype: 'kijs.gui.field.Switch',
                label: 'spinIconVisible',
                value: true,
                on: {
                    change: function(e) {
                        this._updateProperty('spinIconVisible', e.element.value);
                    },
                    context: this
                }
            },{
                xtype: 'kijs.gui.field.Switch',
                label: 'Debug-Buttons',
                on: {
                    change: function(e) {
                        kijs.Array.each(this._content.elements, function(el) {
                            if (el instanceof kijs.gui.field.Field) {
                                if (e.value) {
                                    el.add(new kijs.gui.Button({
                                        name: 'showValue',
                                        tooltip: 'value anzeigen',
                                        iconMap: 'kijs.iconMap.Fa.eye',
                                        on: {
                                            click: function(e) {
                                                kijs.gui.CornerTipContainer.show('value', '<pre style="border:1px solid #000">'+el.value+'</pre>');
                                            },
                                            context: this
                                        }
                                    }));
                                    el.add(new kijs.gui.Button({
                                        name: 'setValue',
                                        tooltip: 'value neu setzen (value=value)',
                                        iconMap: 'kijs.iconMap.Fa.pen',
                                        on: {
                                            click: function(e) {
                                                let val = el.value;
                                                el.value = val;
                                                this._updateIsDirtyButton(el, e.value);
                                            },
                                            context: this
                                        }
                                    }));
                                    el.add(new kijs.gui.Button({
                                        name: 'resetValue',
                                        tooltip: 'valuesReset',
                                        iconMap: 'kijs.iconMap.Fa.arrow-rotate-left',
                                        on: {
                                            click: function(e) {
                                                el.valuesReset();
                                                this._updateIsDirtyButton(el, e.value);
                                            },
                                            context: this
                                        }
                                    }));
                                    el.on('input', this.#onInputForIsDirty, this);
                                } else {
                                    el.remove([
                                        el.down('showValue'),
                                        el.down('setValue'),
                                        el.down('resetValue')
                                    ]);
                                    
                                    el.off('input', this.#onInputForIsDirty, this);
                                }
                                this._updateIsDirtyButton(el, e.value);
                            }
                        }, this);
                    },
                    context: this
                }
            },{
                xtype: 'kijs.gui.Button',
                caption: 'Validate',
                on: {
                    click: function(e) {
                        this._callFunction('validate');
                    },
                    context: this
                }
            },{
                xtype: 'kijs.gui.Button',
                caption: 'valuesReset',
                on: {
                    click: function(e) {
                        kijs.Array.each(this._content.elements, function(el) {
                            if (el instanceof kijs.gui.field.Field) {
                                el.valuesReset();
                            }
                        }, this);
                    },
                    context: this
                }
            }
        ];
    }

    // Zeigt beim Übergebenen Feld einen isDirty-Button an, wenn etwas geändert wurde
    _updateIsDirtyButton(el, addRemove=null) {
        let btn = el.down('isDirtyResetButton');
        
        // button erstellen
        if (addRemove===true && !btn) {
            btn = new kijs.gui.Button({
                xtype: 'kijs.gui.Button',
                name: 'isDirtyResetButton',
                caption: 'isDirty',
                tooltip: 'isDirty zurücksetzen',
                style: { borderColor: '#ff8800' },
                captionStyle: { color: '#ff8800' },
                on: {
                    click: (e) => {
                        e.element.parent.isDirty = false;
                        this._updateIsDirtyButton(el);
                    },
                    context: this
                }
            });
            el.add(btn);
        }
        
        // button ein-/ausblenden
        if (btn) {
            btn.visible = el.isDirty;
        }
        
        // button entfernen
        if (addRemove===false && btn) {
            el.remove(btn);
        }
    }
    
    _updateProperty(propertyName, value) {
        kijs.Array.each(this._content.elements, function(el) {
            if (el instanceof kijs.gui.field.Field) {
                el[propertyName] = value;
            }
        }, this);
    }
    
    
    // PRIVATE
    // LISTENERS
    #onInputForIsDirty(e) {
        this._updateIsDirtyButton(e.element);
    }
    


    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct() {
        this._content = null;
    }

};
