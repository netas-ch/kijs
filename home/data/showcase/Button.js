/* global kijs */

home.sc.Button = class home_sc_Button {
    
    
    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        this._app = config.app;
        this._content = null;
        
        this.__testState = 0;
    }
    
    
    
    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    getContent() {
        this._content = new kijs.gui.Panel({
            caption: 'kijs.gui.Button',
            headerBarElements: [ this._app.createApiButton('kijs.gui.Button') ],
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
                    value: kijs.getText('Buttons:')
                },
                
                {
                    xtype: 'kijs.gui.Button',
                    iconMap:'kijs.iconMap.Fa.house'
                },
                
                {
                    xtype: 'kijs.gui.Button',
                    iconMap:'kijs.iconMap.Fa.house',
                    icon2Map:'kijs.iconMap.Fa.user'
                },

                {
                    xtype: 'kijs.gui.Button',
                    caption: kijs.getText('2 Icons') + ' + disableFlex:false',
                    iconMap:'kijs.iconMap.Fa.house',
                    icon2Map:'kijs.iconMap.Fa.user',
                    disableFlex: false
                },
                
                {
                    xtype: 'kijs.gui.Button',
                    caption: kijs.getText('Icon rechts'),
                    icon2Map:'kijs.iconMap.Fa.house'
                },
                
                {
                    xtype: 'kijs.gui.Button',
                    caption: kijs.getText('2 Icons'),
                    iconMap:'kijs.iconMap.Fa.house',
                    icon2Map:'kijs.iconMap.Fa.user'
                },
                
                {
                    xtype: 'kijs.gui.Button',
                    caption: kijs.getText('Handler-Funktion testen'),
                    badgeText: kijs.getText('Hallo'),
                    on: {
                        click: function() {
                            window.alert(kijs.getText('Klick!'));
                        }
                    }
                },
                
                {
                    xtype: 'kijs.gui.Button',
                    caption: 'isDefault',
                    isDefault: true,
                    tooltip: kijs.getText('Klicken, um %1 umzuschalten', '', 'isDefault'),
                    on: {
                        click: function() {
                            console.log(home.sc.Container);
                            console.log(this.xtype);
                            this.isDefault = !this.isDefault;
                        }
                    }
                },
                
                {
                    xtype: 'kijs.gui.Button',
                    caption: kijs.getText('Deaktivieren'),
                    badgeText: '4',
                    tooltip: kijs.getText('Klicken, um %1 zu setzen', '', 'disabled=true'),
                    on: {
                        click: function() {
                            this.disabled = true;
                            
                            kijs.defer(function(){
                                this.disabled = false;
                            }, 1000, this);
                        }
                    }
                },
                
                {
                    xtype: 'kijs.gui.Button',
                    caption: kijs.getText('Ausblenden'),
                    tooltip: kijs.getText('Klicken, um %1 zu setzen', '', 'visible=false'),
                    on: {
                        click: function() {
                            this.visible = false;
                            
                            kijs.defer(function(){
                                this.visible = true;
                            }, 1000, this);
                        }
                    }
                },
                
                {
                    xtype: 'kijs.gui.Button',
                    caption: kijs.getText('Text umschalten'),
                    on: {
                        click: function() {
                            if (this.caption === kijs.getText('Text A')) {
                                this.caption = kijs.getText('Text B');
                            } else {
                                this.caption = kijs.getText('Text A');
                            }
                        }
                    }
                },
                
                {
                    xtype: 'kijs.gui.Button',
                    caption: kijs.getText('Button mit Hintergrundbild-Icon. Klicken zum Ausblenden'),
                    iconCls: 'icoWizard16',
                    on: {
                        click: function() {
                            this.visible = false;
                        }
                    }
                },
                
                {
                    xtype: 'kijs.gui.Button',
                    caption: kijs.getText('Icon nach dem Rendern erstellen'),
                    on: {
                        click: function(e) {
                            switch (this.__testState) {
                                case 0:
                                    e.element.icon = { iconMap: null, iconCls: 'icoWizard16' };
                                    break;

                                case 1:
                                    e.element.icon = { iconMap: 'kijs.iconMap.Fa.gamepad' };
                                    break;

                                case 2:
                                    e.element.icon = new kijs.gui.Icon({ iconMap: 'kijs.iconMap.Fa.masks-theater' });
                                    break;

                                case 3:
                                    e.element.iconMap = null;
                                    e.element.iconCls = 'icoWizard16';
                                    e.element.caption = null;
                                    break;

                                case 4:
                                    e.element.iconMap = 'kijs.iconMap.Fa.masks-theater';
                                    break;

                                case 5:
                                    e.element.caption = kijs.getText('Klicken, um das Icon zu wechseln');
                                    e.element.icon = null;
                                    break;
                            }
                            this.__testState++;
                            if (this.__testState > 5) {
                                this.__testState = 0;
                            }
                        },
                        context: this
                    }
                },
                
                {
                    xtype: 'kijs.gui.Button',
                    caption: kijs.getText('Button mit Font-Icon. Klicken zum Drehen'),
                    iconMap: 'kijs.iconMap.Fa.masks-theater',
                    on: {
                        click: function() {
                            this.icon.dom.clsToggle('kijs-spin');
                        }
                    }
                },
                
                {
                    xtype: 'kijs.gui.Button',
                    caption: 'smallPaddings: false',
                    smallPaddings: false
                },{
                    xtype: 'kijs.gui.Button',
                    caption: 'smallPaddings: true',
                    smallPaddings: true
                },{
                    xtype: 'kijs.gui.Button',
                    caption: "smallPaddings: 'auto'",
                    smallPaddings: 'auto'
                }
            ]
        });
        
        return this._content;
    }
    
    run() {

    }
    
    
    // PROTECTED
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
                value: true,
                on: {
                    change: function(e) {
                        this._updateProperty('disableFlex', e.element.value);
                    },
                    context: this
                }
            }
        ];
    }
    
    _updateProperty(propertyName, value) {
        kijs.Array.each(this._content.elements, function(el) {
            if (el instanceof kijs.gui.Button) {
                el[propertyName] = value;
            }
        }, this);
    }
    
    

    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct() {
        this._content = null;
    }
    
};