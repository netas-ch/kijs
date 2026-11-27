/* global kijs */

home.sc.Menu = class home_sc_Menu {
    
    
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
            caption: 'kijs.gui.Menu',
            headerBarElements: [ this._app.createApiButton('kijs.gui.Menu') ],
            cls: 'kijs-borderless',
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
                    value: kijs.getText('Button mit %1:', '', 'menuElements'),
                    style: { margin: '0 0 4px 0'}
                },{
                    xtype: 'kijs.gui.Button',
                    caption: kijs.getText('Menü'),
                    iconMap: 'kijs.iconMap.Fa.bars',
                    menuElements: [
                        {
                            caption: kijs.getText('Hallo %1', '', 1)
                        },
                        {
                            caption: 'Text'
                        },
                        {
                            caption: kijs.getText('Hallo %1', '', 3),
                            iconMap: 'kijs.iconMap.Fa.brain'
                        }, '-', {
                            xtype: 'kijs.gui.Button',
                            caption: 'MULTI',
                            menuElements: (function(){
                                let steps=150, p = [];
                                for (let i=0; i<steps; i++) {
                                    p.push({
                                        caption: kijs.getText('El %1 von %2', '', [i, steps])
                                    });
                                }
                                return p;
                            })()
                        },{
                            xtype: 'kijs.gui.Button',
                            caption: 'ENDLESS',
                            menuElements: (function(){
                                let steps=20, p = [{
                                        caption: kijs.getText('ÄTSCH NICHTS DA')
                                    }];
                                for (let i=0; i<steps; i++) {
                                    p = [{
                                            caption: kijs.getText('Stufe %1 von %2', '', [i, steps])
                                        },{
                                            xtype: 'kijs.gui.Button',
                                            caption: kijs.getText('Nächste Stufe'),
                                            menuElements:p
                                        }];
                                }
                                return p;
                            })()
                        }
                    ]
                },
                
                {
                    xtype: 'kijs.gui.field.Display',
                    cls: 'kijs-titleLarge',
                    value: kijs.getText('Button mit manuellem Menü bei Rechtsklick:'),
                    style: { margin: '10px 0 4px 0'}
                },{
                    xtype: 'kijs.gui.Button',
                    caption: kijs.getText('Klicke mit Rechts oder long-touch'),
                    iconMap: 'kijs.iconMap.Fa.bars',
                    on: {
                        contextMenu: function(e) {
                            e.nodeEvent.preventDefault();

                            const menu = new kijs.gui.Menu({
                                closeOnClick: true,
                                elements: [
                                    {
                                        caption: 'Windows',
                                        iconMap: 'kijs.iconMap.Fa.windows',
                                        on: {click:() => { kijs.gui.MsgBox.alert(kijs.getText('Deine Wahl:'), 'Windows!'); }}
                                    },{
                                        caption: 'Apple',
                                        iconMap: 'kijs.iconMap.Fa.apple',
                                        on: {click:() => { kijs.gui.MsgBox.alert(kijs.getText('Deine Wahl:'), 'Apple!'); }}
                                    },{
                                        caption: kijs.getText('Weitere'),
                                        iconMap: 'kijs.iconMap.Fa.angles-right',
                                        menuElements: [
                                            {
                                                caption: 'Linux',
                                                iconMap: 'kijs.iconMap.Fa.linux',
                                                on: {click:() => {
                                                        kijs.gui.MsgBox.alert(kijs.getText('Deine Wahl:'), 'Linux!');
                                                    }}
                                            },{
                                                caption: 'Android',
                                                iconMap: 'kijs.iconMap.Fa.android',
                                                on: {click:() => {
                                                        kijs.gui.MsgBox.alert(kijs.getText('Deine Wahl:'), 'Android!');
                                                    }}
                                            },{
                                                caption: 'iOS',
                                                iconMap: 'kijs.iconMap.Fa.apple',
                                                on: {click:() => { kijs.gui.MsgBox.alert(kijs.getText('Deine Wahl:'), 'iOS!'); }}
                                            }
                                        ]
                                    }
                                ]
                            });
                            menu.show(e.nodeEvent.pageX, e.nodeEvent.pageY);

                        },
                        context: this
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