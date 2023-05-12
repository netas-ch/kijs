/* global kijs */

window.home.sc = {};
home.sc.Rpc = class home_sc_Rpc {
    
    
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
            caption: 'kijs.gui.Rpc',
            cls: 'kijs-flexform',
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
                    xtype: 'kijs.gui.Element',
                    html: 'RPC:'
                },{
                    xtype: 'kijs.gui.Button',
                    caption: 'RPC mit Promise',
                    on: {
                        click: function() {
                            kijs.getRpc('default').do({
                                facadeFn:'rpc.simple', 
                                data: 'RPC mit Promise'
                            }).then((e) => {
                                kijs.gui.CornerTipContainer.show('RPC OK', JSON.stringify(e.responseData));
                            });
                        },
                        context: this
                    }
                },{
                    xtype: 'kijs.gui.Button',
                    caption: 'RPC mit Promise und async/await',
                    on: {
                        click: async function() {
                            const rpcData = await kijs.getRpc('default').do({
                                facadeFn:'rpc.simple', 
                                data: 'RPC mit Promise'
                            });
                            kijs.gui.CornerTipContainer.show('RPC OK', JSON.stringify(rpcData.responseData));
                        },
                        context: this
                    }
                },{
                    xtype: 'kijs.gui.Button',
                    caption: 'RPC mit callback function',
                    on: {
                        click: function() {
                            kijs.getRpc('default').do({
                                facadeFn:'rpc.simple', 
                                data: 'RPC mit callback function',
                                fn: function(e) {
                                    kijs.gui.CornerTipContainer.show('RPC OK', JSON.stringify(e.responseData));
                                }
                            });
                        },
                        context: this
                    }
                },{
                    xtype: 'kijs.gui.Button',
                    caption: 'RPC verzögert mit Ladeanzeige',
                    on: {
                        click: function() {
                            kijs.getRpc('default').do({ facadeFn: 'rpc.delay', data: 'RPC verzögert mit Ladeanzeige' }).then((e) => {
                                kijs.gui.CornerTipContainer.show('RPC OK', JSON.stringify(e.responseData));
                            });
                        },
                        context: this
                    }
                },{
                    xtype: 'kijs.gui.Button',
                    caption: 'RPC verzögert ohne Ladeanzeige, mit cancelRunningRpcs=true',
                    on: {
                        click: function() {
                            kijs.getRpc('default').do({ 
                                facadeFn: 'rpc.delay', 
                                data: 'RPC verzögert ohne Ladeanzeige, mit cancelRunningRpcs=true',
                                waitMaskTarget: 'none',
                                cancelRunningRpcs: true
                            }).then((e) => {
                                kijs.gui.CornerTipContainer.show('RPC OK', JSON.stringify(e.responseData));
                            });
                        },
                        context: this
                    }
                },
                
                {
                    xtype: 'kijs.gui.Element',
                    html: 'RPCs automatisch zusammenfassen (RPCs innerhalb von 10ms werden zusammengefasst:',
                    style: { margin: '10px 0 0 0'}
                },{
                    xtype: 'kijs.gui.Button',
                    caption: 'Sende 3 RPCs',
                    on: {
                        click: function() {
                            kijs.getRpc('default').do({ facadeFn: 'rpc.simple', data: 'RPC 1/3' }).then((e) => {
                                kijs.gui.CornerTipContainer.show('RPC OK', JSON.stringify(e.responseData));
                            });
                            kijs.getRpc('default').do({ facadeFn: 'rpc.simple', data: 'RPC 2/3' }).then((e) => {
                                kijs.gui.CornerTipContainer.show('RPC OK', JSON.stringify(e.responseData));
                            });
                            kijs.getRpc('default').do({ facadeFn: 'rpc.simple', data: 'RPC 3/3' }).then((e) => {
                                kijs.gui.CornerTipContainer.show('RPC OK', JSON.stringify(e.responseData));
                            });
                        },
                        context: this
                    }
                },
                
                {
                    xtype: 'kijs.gui.Element',
                    html: 'RPC Meldungen:',
                    style: { margin: '10px 0 0 0'}
                },{
                    xtype: 'kijs.gui.Button',
                    caption: 'infoMsg',
                    on: {
                        click: function() {
                            kijs.getRpc('default').do({ facadeFn: 'rpc.infoMsg', data: 'infoMsg' }).then((e) => {
                                kijs.gui.CornerTipContainer.show('RPC OK', JSON.stringify(e.responseData));
                            });
                        },
                        context: this
                    }
                },{
                    xtype: 'kijs.gui.Button',
                    caption: 'cornerTipMsg',
                    on: {
                        click: function() {
                            kijs.getRpc('default').do({ facadeFn: 'rpc.cornerTipMsg', data: 'cornerTipMsg' }).then((e) => {
                                kijs.gui.CornerTipContainer.show('RPC OK', JSON.stringify(e.responseData));
                            });
                        },
                        context: this
                    }
                },{
                    xtype: 'kijs.gui.Button',
                    caption: 'warningMsg',
                    on: {
                        click: function() {
                            kijs.getRpc('default').do({ facadeFn: 'rpc.warningMsg', data: 'warningMsg' }).then((e) => {
                                kijs.gui.CornerTipContainer.show('RPC OK', JSON.stringify(e.responseData));
                            });
                        },
                        context: this
                    }
                },{
                    xtype: 'kijs.gui.Button',
                    caption: 'errorMsg',
                    on: {
                        click: function() {
                            kijs.getRpc('default').do({ facadeFn: 'rpc.errorMsg', data: 'errorMsg' }).then((e) => {
                                kijs.gui.CornerTipContainer.show('RPC OK', JSON.stringify(e.responseData));
                            });
                        },
                        context: this
                    }
                },
                
                
                {
                    xtype: 'kijs.gui.Element',
                    html: 'Fehlerbehandlung (errorTypes):',
                    style: { margin: '10px 0 0 0'}
                },{
                    xtype: 'kijs.gui.Button',
                    caption: 'errorNotice',
                    on: {
                        click: function() {
                            kijs.getRpc('default').do({ facadeFn: 'rpc.errorNotice', data: 'error' }).then((e) => {
                                kijs.gui.CornerTipContainer.show('RPC OK', JSON.stringify(e.responseData));
                            });
                        },
                        context: this
                    }
                },{
                    xtype: 'kijs.gui.Button',
                    caption: 'error',
                    on: {
                        click: function() {
                            kijs.getRpc('default').do({ facadeFn: 'rpc.error', data: 'errorNotice' }).
                                then((e) => {
                                    kijs.gui.CornerTipContainer.show('RPC OK', JSON.stringify(e.responseData));
                                })
                                .catch((ex) => {
                                    kijs.gui.CornerTipContainer.show('Unerwarteter Fehler', JSON.stringify(ex.message));
                                });
                        },
                        context: this
                    }
                },
                
                {
                    xtype: 'kijs.gui.Element',
                    html: 'Minimale Fehlerbehandlung:',
                    style: { margin: '10px 0 0 0'}
                },{
                    xtype: 'kijs.gui.Button',
                    caption: 'error ohne Fehlerbehandlung',
                    on: {
                        click: function() {
                            try {
                                kijs.getRpc('default').do({ facadeFn: 'rpc.error', data: 'error' }).then((e) => {
                                    kijs.gui.CornerTipContainer.show('RPC OK', JSON.stringify(e.responseData));
                                });
                            } catch(ex) {
                                console.log('Fehler wurde abgefangen');
                            } 
                        },
                        context: this
                    }
                },{
                    xtype: 'kijs.gui.Button',
                    caption: 'error mit minimaler Fehlerbehandlung (es ist min. ein catch(() => {}) nötig!)',
                    on: {
                        click: function() {
                            kijs.getRpc('default').do({ facadeFn: 'rpc.error', data: 'error' }).then((e) => {
                                kijs.gui.CornerTipContainer.show('RPC OK', JSON.stringify(e.responseData));
                            }).catch(() => {});
                        },
                        context: this
                    }
                },{
                    xtype: 'kijs.gui.Button',
                    caption: 'oder die übergeordnete Funktion ist async!',
                    on: {
                        click: async function() {
                            try {
                                const rpcData = await kijs.getRpc('default').do({ facadeFn: 'rpc.error', data: 'error' });
                                kijs.gui.CornerTipContainer.show('RPC OK', JSON.stringify(rpcData.responseData));
                            } catch(ex) {
                                console.log('Fehler wurde abgefangen');
                            }        
                        },
                        context: this
                    }
                },
                
                
                
                {
                    xtype: 'kijs.gui.Element',
                    html: 'RPC mit individueller Lademaske:',
                    style: { margin: '10px 0 0 0'}
                },{
                    xtype: 'kijs.gui.Button',
                    caption: 'RPC verzögert mit Lademaske auf einem individuellen Element',
                    on: {
                        click: function() {
                            kijs.getRpc('default').do({ 
                                facadeFn: 'rpc.delay',
                                data: 'RPC verzögert mit Lademaske auf einem individuellen Element',
                                waitMaskTarget: this._content.down('waitMaskTarget'),
                                waitMaskTargetDomProperty: 'innerDom'
                            }).then((e) => {
                                kijs.gui.CornerTipContainer.show('RPC OK', JSON.stringify(e.responseData));
                            });
                        },
                        context: this
                    }
                },{
                    xtype: 'kijs.gui.Container',
                    name: 'waitMaskTarget',
                    html: 'Ziel für Lademaske',
                    width: 120,
                    style: {
                        margin: '10px 0 0 0',
                        border: '1px solid #999',
                        borderRadius: '10px',
                        padding: '10px'
                    },
                    innerStyle: {
                        color: '#666',
                        textAlign: 'center'
                    }
                },
                
                {
                    xtype: 'kijs.gui.Button',
                    caption: 'Test fn',
                    on: {
                        click: function() {
                            kijs.getRpc('default').do({
                                facadeFn: 'rpc.warningMsg',
                                data: 'Test fn',
                                fn: function(e) {
                                    console.log('fn ' + (e.errorType ?? ''));
                                }
                            });
                        },
                        context: this
                    }
                },{
                    xtype: 'kijs.gui.Button',
                    caption: 'Test promise',
                    on: {
                        click: function() {
                            kijs.getRpc('default').do({
                                facadeFn: 'rpc.warningMsg',
                                data: 'Test promise'
                            }).then((e) => {
                                console.log('then ' + (e.errorType ?? ''));
                            }).catch((ex) => {
                                console.log('catch');
                            });
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