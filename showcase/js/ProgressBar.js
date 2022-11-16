/* global kijs */

window.sc = {};
sc.ProgressBar = class sc_ProgressBar {
    
    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        this._app = config.app;
        this._content = null;
        
        this._intervalId = null;
        
        this._win = null;
        this._winIntervalId = null;
    }
    
    
    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    getContent() {
        this._content = new kijs.gui.Panel({
            caption: 'kijs.gui.ProgressBar',
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
                    xtype: 'kijs.gui.ProgressBar',
                    name: 'prgBar',
                    caption: 'caption',
                    bottomCaption: 'bottomCaption',
                    style: {
                        marginTop:'10px'
                    }
                },
                
                {
                    xtype: 'kijs.gui.Button',
                    caption: 'Progress Bar',
                    iconMap: 'kijs.iconMap.Fa.bars-progress',
                    style: { margin: '10px 0 0 0'},
                    
                    on: {
                        click: function() {
                            if (this._win) {
                                this._win.destruct();
                                this._win = null;
                            } else {
                                this._win = new kijs.gui.Window({
                                    caption: 'Progressbar window',
                                    iconMap: 'kijs.iconMap.Fa.bars-progress',
                                    collapsible: 'top',
                                    modal: false,
                                    width: 250,
                                    innerStyle: {
                                        padding: '10px'
                                    },
                                    elements:[
                                        {
                                            xtype: 'kijs.gui.ProgressBar',
                                            name: 'pgBar1',
                                            showPercent: true
                                        },{
                                            xtype: 'kijs.gui.ProgressBar',
                                            name: 'pgBar2',
                                            caption: 'caption',
                                            bottomCaption: 'bottomCaption',
                                            style: {
                                                marginTop:'10px'
                                            }
                                        }
                                    ],
                                    footerElements:[
                                        {
                                            xtype: 'kijs.gui.Button',
                                            caption: 'OK',
                                            isDefault: true,
                                            on: {
                                                click: function() {
                                                    this._win.destruct();
                                                },
                                                context: this
                                            }
                                        }
                                    ]
                                });
                                this._win.show();

                                let perc1 = 0, perc2= 0;

                                this._winIntervalId = kijs.interval(function(){
                                    if (!this._win || !this._win.dom) {
                                        clearInterval(this._winIntervalId);
                                        return;
                                    }

                                    this._win.down('pgBar1').percent = perc1;
                                    this._win.down('pgBar2').percent = perc2;

                                    perc1 += 6;
                                    perc2 += 1;
                                    if (perc1 > 100)  perc1 -= 99;
                                    if (perc2 > 100)  perc2 = 1;
                                }, 900, this);
                            }
                        },
                        context: this
                    }
                }
            ]
        });
        
        return this._content;
    }
    
    run() {
        const prgBar = this._content.down('prgBar');
        let perc = 0;
        
        prgBar.percent = perc;
        
        kijs.interval(function(){
            if (!prgBar || !prgBar.dom) {
                clearInterval(this._intervalId);
                return;
            }
            
            perc += 10;
            if (perc > 100)  perc = 0;
            prgBar.percent = perc;
        }, 500, this);
    }


    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct() {
        if (this._intervalId) {
            clearInterval(this._intervalId);
        }
        if (this._win) {
            this._win.destruct();
        }
        
        this._intervalId = null;
        this._win = null;
        this._content = null;
    }
};