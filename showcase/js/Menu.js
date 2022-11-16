/* global kijs */

window.sc = {};
sc.Menu = class sc_Menu {
    
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
                    html: 'Button mit menuElements:',
                    style: { margin: '0 0 4px 0'}
                },{
                    xtype: 'kijs.gui.Button',
                    caption: 'Menue',
                    iconMap: 'kijs.iconMap.Fa.bars',
                    menuElements: [
                        {
                            caption:'Hallo 1'
                        },{
                            caption:'Hallo 3',
                            iconMap: 'kijs.iconMap.Fa.brain',
                        }, '-', {
                            xtype: 'kijs.gui.Button',
                            caption:'MULTI',
                            menuElements: (function(){
                                let steps=150, p = [];
                                for (let i=0; i<steps; i++) {
                                    p.push({
                                        caption: 'El ' + i + ' von ' + steps
                                    });
                                }
                                return p;
                            })()
                        },{
                            xtype: 'kijs.gui.Button',
                            caption:'ENDLESS',
                            menuElements: (function(){
                                let steps=20, p = [{
                                        caption:'ÄTSCH NICHTS DA'
                                    }];
                                for (let i=0; i<steps; i++) {
                                    p = [{
                                            caption: 'Stufe ' + i + ' von ' + steps
                                        },{
                                            xtype: 'kijs.gui.Button',
                                            caption:'Nächste Stufe',
                                            menuElements:p
                                        }];
                                }
                                return p;
                            })()
                        }
                    ]
                },
                
                {
                    xtype: 'kijs.gui.Element',
                    html: 'Button mit manuellem Menü bei Rechtsklick:',
                    style: { margin: '10px 0 4px 0'}
                },{
                    xtype: 'kijs.gui.Button',
                    caption: 'Klicke mit Rechts',
                    iconMap: 'kijs.iconMap.Fa.bars',
                    on: {
                        rightClick: function(e) {
                            e.nodeEvent.preventDefault();

                            const menu = new kijs.gui.Menu({
                                closeOnClick: true,
                                elements: [
                                    {
                                        caption:'Windows',
                                        iconMap: 'kijs.iconMap.Fa.windows',
                                        on: {click:() => { kijs.gui.MsgBox.alert('You choose:', 'Windows!'); }}
                                    },{
                                        caption:'Apple',
                                        iconMap: 'kijs.iconMap.Fa.apple',
                                        on: {click:() => { kijs.gui.MsgBox.alert('You choose:', 'Apple!'); }}
                                    },{
                                        caption:'Weitere',
                                        iconMap: 'kijs.iconMap.Fa.angles-right',
                                        menuElements: [
                                            {
                                                caption:'Linux',
                                                iconMap: 'kijs.iconMap.Fa.linux',
                                                on: {click:() => {
                                                        kijs.gui.MsgBox.alert('You choose:', 'Linux!');
                                                    }}
                                            },{
                                                caption:'Android',
                                                iconMap: 'kijs.iconMap.Fa.android',
                                                on: {click:() => {
                                                        kijs.gui.MsgBox.alert('You choose:', 'Android!');
                                                    }}
                                            },{
                                                caption:'iOS',
                                                iconMap: 'kijs.iconMap.Fa.apple',
                                                on: {click:() => { kijs.gui.MsgBox.alert('You choose:', 'iOS!'); }}
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


    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct() {
        this._content = null;
    }
};