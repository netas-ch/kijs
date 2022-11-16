/* global kijs */

window.sc = {};
sc.Button = class sc_Button {
    
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
            autoScroll: true,
            style: {
                flex: 1
            },
            innerStyle: {
                padding: '10px'
            },
            elements:[
                {
                    xtype: 'kijs.gui.Element',
                    html: 'Buttons:',
                    style: { margin: '0 0 4px 0'}
                },{
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
                    caption: 'Test Context',
                    badgeText: 5,
                    on: {
                        click: function() {
                            window.alert(this === document.body ? 'erfolgreich' : 'fehlgeschlagen');
                        },
                        context: document.body
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
                            this.disabled = !this.disabled;
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
                }
            ]
        });
        
        return this._content;
    }
    
    run() {

    }


    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct() {
        this._content = null;
    }
};