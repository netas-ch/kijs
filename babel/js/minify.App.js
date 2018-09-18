
/* global kijs, Babel */

// --------------------------------------------------------------
// minify.App
// --------------------------------------------------------------
minify = {};
minify.App = class minify_App {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {

        // RPC-Instanz
        var rpcConfig = {};
        if (config.ajaxUrl) {
            rpcConfig.url = config.ajaxUrl;
        }
        this._rpc = new kijs.gui.Rpc(rpcConfig);
    }


    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    run() {
        // ViewPort erstellen
        this._viewport = new kijs.gui.ViewPort({
            cls: 'kijs-flexcolumn',
            elements: [                
                {
                    xtype: 'kijs.gui.FormPanel',
                    name: 'mainPanel',
                    caption: 'Minifier & Babel Converter &#x21e8; Konvertiert ES2015 (ES6) JavaScript-Code in IE fähigen Code',
                    iconChar: '&#xf066',
                    footerCaption: '&#169; 2018 by <a href="https://www.kipferinformatik.ch">Kipfer Informatik</a>',
                    cls: 'kijs-flexrow',
                    rpc: this._rpc,
                    facadeFnLoad: 'minify.load',
                    autoLoad: true,
                    style: {
                        flex: 1
                    },
                    headerElements: [
                        {
                            xtype: 'kijs.gui.Button',
                            iconChar: '&#xf01d',
                            caption: 'Konvertiere',
                            style: {
                                margin: '4px 10px'
                            },
                            on: {
                                click: function(e) {
                                    this.convert();
                                },
                                context: this
                            }
                        }
                    ],
                    elements:[
                        // Left Settings
                        {
                            xtype: 'kijs.gui.Panel',
                            caption: 'Einstellungen',
                            iconChar: '&#xf013',
                            width: 250,
                            collapsible: 'left',
                            innerStyle: {
                                padding: '10px'
                            },
                            elements:[
                                {
                                    xtype: 'kijs.gui.field.Checkbox',
                                    name: 'es2015',
                                    caption: 'Convert ES2015 (ES6) to IE',
                                    value: true
                                },{
                                    xtype: 'kijs.gui.field.Checkbox',
                                    name: 'minifyJs',
                                    caption: 'Minify',
                                    value: true
                                }
                            ]
                        },{
                            xtype: 'kijs.gui.Splitter',
                            targetPos: 'left'
                        },
                        // Middle Input
                        {
                            xtype: 'kijs.gui.Panel',
                            caption: 'Quellcode (ES2015)',
                            iconChar: '&#xf090',
                            cls: 'kijs-flexrow',
                            style: {
                                flex: 1
                            },
                            elements:[
                                {
                                    xtype: 'kijs.gui.field.Memo',
                                    name: 'input',
                                    style: {
                                        flex: 1,
                                        height: 'auto'
                                    }
                                }
                            ]
                        },{
                            xtype: 'kijs.gui.Splitter',
                            targetPos: 'left'
                        },
                        // Right Output
                        {
                            xtype: 'kijs.gui.Panel',
                            caption: 'Zielcode (für IE)',
                            iconChar: '&#xf08b',
                            cls: 'kijs-flexrow',
                            style: {
                                flex: 1
                            },
                            elements:[
                               {
                                    xtype: 'kijs.gui.field.Memo',
                                    name: 'output',
                                    style: {
                                        flex: 1,
                                        height: 'auto'
                                    }
                                }
                            ]
                        }
                    ]
                }
            ]
        });
        this._viewport.render();
    }
    

    convert() {
        const mainPanel = this._viewport.down('mainPanel');
        
        mainPanel.waitMaskAdd();
        
        try {
            // Source einlesen
            let val = mainPanel.down('input').value;
            
            // Konvertiere ES 2015 zu IE kompatiblem Code
            if (mainPanel.down('es2015').value) {
                val = this.convertEs2015(val);
            }
            
            // Minimieren
            if (mainPanel.down('minifyJs').value) {
                this.minifyJs(val, function(newVal) {
                    // Ergebnis ausgeben
                    mainPanel.waitMaskRemove();
                    mainPanel.down('output').value = newVal;
                    kijs.gui.CornerTipContainer.show('Info', 'Konvertierung erfolgreich.' , 'info');
                });
                
            } else {
                // Ergebnis ausgeben
                mainPanel.waitMaskRemove();
                mainPanel.down('output').value = val;
                kijs.gui.CornerTipContainer.show('Info', 'Konvertierung erfolgreich.' , 'info');
            }
            
        } catch (err) {
            mainPanel.waitMaskRemove();
            kijs.gui.CornerTipContainer.show('Konvertierungsfehler', err.message, 'error');
            
        }
    }

    
    convertEs2015(input) {
        return Babel.transform(input, { presets: ['es2015'] }).code;
    }
    
    minifyCss(input, fn) {
        this.rpc('minify.minifyCss', input, function(response) {
            fn.call(this, response.data);
        }, this);
    }
    
    minifyJs(input, fn) {
        this.rpc('minify.minifyJs', input, function(response) {
            fn.call(this, response.data);
        }, this);
    }

    rpc(facadeFn, data, fn, context, cancelRunningRpcs, waitMaskTarget, waitMaskTargetDomPropertyName='dom', ignoreWarnings, fnBeforeDisplayError) {
        if (!waitMaskTarget) {
            waitMaskTarget = this._viewport.down('mainPanel');
        }
        this._rpc.do(facadeFn, data, fn, context, cancelRunningRpcs, waitMaskTarget, waitMaskTargetDomPropertyName, ignoreWarnings, fnBeforeDisplayError);
    }
    
    
    
    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct() {
        // RPC entladen
        this._rpc.destruct();
        
        // Variablen
        this._rpc = null;
    }
    
};