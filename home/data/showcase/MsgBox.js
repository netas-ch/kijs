/* global kijs */

window.home.sc = {};
home.sc.MsgBox = class home_sc_MsgBox {
    
    
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
        this._content = new kijs.gui.Panel({
            caption: 'kijs.gui.MsgBox',
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
                    html: 'Message Box standard:'
                },{
                    xtype: 'kijs.gui.Button',
                    caption: 'alert',
                    on: {
                        click: function() {
                            kijs.gui.MsgBox.alert('Test', 'Alert! Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans... Hans geht fischen. So fischt Hans...')
                                .then((e) => {
                                    kijs.gui.CornerTipContainer.show('Es wurde geklickt auf', e.btn);
                                });
                        }
                    }
                },{
                    xtype: 'kijs.gui.Button',
                    caption: 'info',
                    on: {
                        click: function() {
                            kijs.gui.MsgBox.info('Test', 'Info!').then((e) => {
                                kijs.gui.CornerTipContainer.show('Es wurde geklickt auf', e.btn);
                            });
                        }
                    }
                },{
                    xtype: 'kijs.gui.Button',
                    caption: 'warning',
                    on: {
                        click: function() {
                            kijs.gui.MsgBox.warning('Test', 'Warning!').then((e) => {
                                kijs.gui.CornerTipContainer.show('Es wurde geklickt auf', e.btn);
                            });
                        }
                    }
                },{
                    xtype: 'kijs.gui.Button',
                    caption: 'errorNotice',
                    on: {
                        click: function() {
                            kijs.gui.MsgBox.errorNotice('Test', 'ErrorNotice!').then((e) => {
                                kijs.gui.CornerTipContainer.show('Es wurde geklickt auf', e.btn);
                            });
                        }
                    }
                },{
                    xtype: 'kijs.gui.Button',
                    caption: 'error',
                    on: {
                        click: function() {
                            kijs.gui.MsgBox.error('Test', 'Error!').then((e) => {
                                kijs.gui.CornerTipContainer.show('Es wurde geklickt auf', e.btn);
                            });
                        }
                    }
                },{
                    xtype: 'kijs.gui.Button',
                    caption: 'confirm',
                    on: {
                        click: function(e) {
                            kijs.gui.MsgBox.confirm('Test', 'Confirm!').then((e) => {
                                kijs.gui.CornerTipContainer.show('Es wurde geklickt auf ', e.btn);
                            });
                        }
                    }
                },{
                    xtype: 'kijs.gui.Button',
                    caption: 'prompt',
                    on: {
                        click: function(e) {
                            kijs.gui.MsgBox.prompt('Test', 'Confirm!', 'Eingabe', 'Wert!', function(e) {
                                kijs.gui.CornerTipContainer.show('Es wurde geklickt auf ', e.btn + ' / Eingabe ' + e.value);
                            });
                        }
                    }
                },
                
                {
                    xtype: 'kijs.gui.Element',
                    html: 'Message Box mit Callback Function:',
                    style: { margin: '10px 0 0 0'}
                },{
                    xtype: 'kijs.gui.Button',
                    caption: 'alert',
                    on: {
                        click: function(e) {
                            kijs.gui.MsgBox.alert('Test', 'Alert!', function(e) {
                                kijs.gui.CornerTipContainer.show('Es wurde geklickt auf ', e.btn);
                            }, this);
                        }
                    }
                },
                
                {
                    xtype: 'kijs.gui.Element',
                    html: 'Message Box individuell:',
                    style: { margin: '10px 0 0 0'}
                },{
                    xtype: 'kijs.gui.Button',
                    caption: 'show',
                    on: {
                        click: function() {
                            kijs.gui.MsgBox.show({
                                caption: 'Testmeldung',
                                msg: 'Hallo Welt!',

                                closable: true, // Soll das Fenster ein X zum Schliessen haben?

                                // Falls ein Input gewünscht wird, können noch folgende Eigenschaften verwendet werden:
                                fieldXtype: 'kijs.gui.field.Text',
                                label: 'Wert',
                                value: 'Mein Testwert',

                                //fn: function(e, el) {
                                //    kijs.gui.CornerTipContainer.show('Es wurde geklickt auf', e.btn);
                                //},
                                //context: this,
                                iconMap: '',
                                icon: {
                                    iconMap: 'kijs.iconMap.Fa.circle-question',
                                    style: {
                                        color: '#ff9900'
                                    }
                                },
                                buttons: [
                                    {
                                        name: 'ok',
                                        caption: 'OK'
                                    },{
                                        name: 'cancel',
                                        caption: 'Abbrechen'
                                    }
                                ]
                            }).then((e) => {
                                kijs.gui.CornerTipContainer.show('Es wurde geklickt auf', e.btn);
                            });
                        }
                    }
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
            }
        ];
    }
    
    

    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct() {
        this._content = null;
    }
    
};