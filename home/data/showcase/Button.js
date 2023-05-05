/* global kijs */

window.home.sc = {};
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
            scrollableY: 'auto',
            cls: 'kijs-flexform',
            style: {
                flex: 1
            },
            innerStyle: {
                padding: '10px'
            },
            headerElements: this._getHeaderElements(),
            elements:[
                {
                    xtype: 'kijs.gui.Element',
                    html: 'Buttons:'
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
                    caption: '2 Icons + disableFlex:false',
                    iconMap:'kijs.iconMap.Fa.house',
                    icon2Map:'kijs.iconMap.Fa.user',
                    disableFlex: false
                },
                
                {
                    xtype: 'kijs.gui.Button',
                    caption: '2 Icons',
                    icon2Map:'kijs.iconMap.Fa.house'
                },
                
                {
                    xtype: 'kijs.gui.Button',
                    caption: '2 Icons',
                    iconMap:'kijs.iconMap.Fa.house',
                    icon2Map:'kijs.iconMap.Fa.user'
                },
                
                {
                    xtype: 'kijs.gui.Button',
                    caption: 'Test Handler Funktion',
                    badgeText: 'Hallo',
                    on: {
                        click: function() {
                            window.alert('Klick!');
                        }
                    }
                },
                
                {
                    xtype: 'kijs.gui.Button',
                    caption: 'isDefault',
                    isDefault: true,
                    tooltip: 'click to toggle isDefault',
                    on: {
                        click: function() {
                            console.log(this.xtype);
                            this.isDefault = !this.isDefault;
                        }
                    }
                },
                
                {
                    xtype: 'kijs.gui.Button',
                    caption: 'Disabled',
                    badgeText: '4',
                    tooltip: 'click to disable',
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
                    caption: 'Hide',
                    tooltip: 'click to set visible=false',
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
                    caption: 'Toggle Text',
                    on: {
                        click: function() {
                            if (this.caption === 'Text A') {
                                this.caption = 'Text B';
                            } else {
                                this.caption = 'Text A';
                            }
                        }
                    }
                },
                
                {
                    xtype: 'kijs.gui.Button',
                    caption: 'Button with background-image-icon. Klick to hide',
                    iconCls: 'icoWizard16',
                    on: {
                        click: function() {
                            this.visible = false;
                        }
                    }
                },
                
                {
                    xtype: 'kijs.gui.Button',
                    caption: 'Create icon after render',
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
                                    e.element.caption = 'click to toggle icon';
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
                    caption: 'Button with font-icon. Klick to rotate',
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