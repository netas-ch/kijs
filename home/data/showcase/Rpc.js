/* global kijs */

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
                    value: 'RPC:'
                },{
                    xtype: 'kijs.gui.Button',
                    caption: 'RPC mit Promise',
                    on: {
                        click: function() {
                            kijs.getRpc('default').do({
                                remoteFn:'rpc.simple', 
                                data: 'RPC mit Promise'
                            }).then((e) => {
                                if (kijs.isEmpty(e.response.errorType)) {
                                    kijs.gui.CornerTipContainer.show('RPC OK', e.response.data);
                                }
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
                                remoteFn:'rpc.simple', 
                                data: 'RPC mit Promise und async/await'
                            });
                            if (kijs.isEmpty(rpcData.response.errorType)) {
                                kijs.gui.CornerTipContainer.show('RPC OK', rpcData.response.data);
                            }
                        },
                        context: this
                    }
                },{
                    xtype: 'kijs.gui.Button',
                    caption: 'RPC mit callback function',
                    on: {
                        click: function() {
                            kijs.getRpc('default').do({
                                remoteFn:'rpc.simple', 
                                data: 'RPC mit callback function',
                                fn: function(e) {
                                    if (kijs.isEmpty(e.response.errorType)) {
                                        kijs.gui.CornerTipContainer.show('RPC OK', e.response.data);
                                    }
                                }
                            });
                        },
                        context: this
                    }
                },{
                    xtype: 'kijs.gui.Button',
                    caption: 'RPC verzögert mit Wartemaske',
                    on: {
                        click: function() {
                            kijs.getRpc('default').do({ 
                                remoteFn: 'rpc.delay', 
                                data: 'RPC verzögert mit Wartemaske'
                            }).then((e) => {
                                if (kijs.isEmpty(e.response.errorType)) {
                                    kijs.gui.CornerTipContainer.show('RPC OK', e.response.data);
                                }
                            });
                        },
                        context: this
                    }
                },{
                    xtype: 'kijs.gui.Button',
                    caption: 'RPC verzögert ohne Wartemaske, mit cancelRunningRpcs=true',
                    on: {
                        click: function() {
                            kijs.getRpc('default').do({ 
                                remoteFn: 'rpc.delay', 
                                data: 'RPC verzögert ohne Wartemaske, mit cancelRunningRpcs=true',
                                waitMaskTarget: 'none',
                                cancelRunningRpcs: true
                            }).then((e) => {
                                if (kijs.isEmpty(e.response.errorType)) {
                                    kijs.gui.CornerTipContainer.show('RPC OK', e.response.data);
                                }
                            });
                        },
                        context: this
                    }
                },{
                    xtype: 'kijs.gui.Button',
                    caption: '2 RPCs verzögert mit Wartemaske und cancelRunningRpcs=true',
                    on: {
                        click: function() {
                            kijs.getRpc('default').do({ 
                                remoteFn: 'rpc.delay', 
                                data: '2 RPCs verzögert mit Wartemaske und cancelRunningRpcs=true 1/2',
                                cancelRunningRpcs: true
                            }).then((e) => {
                                if (kijs.isEmpty(e.response.errorType)) {
                                    kijs.gui.CornerTipContainer.show('RPC OK', e.response.data);
                                }
                            });
                            kijs.getRpc('default').do({ 
                                remoteFn: 'rpc.delay', 
                                data: '2 RPCs verzögert mit Wartemaske und cancelRunningRpcs=true 2/2',
                                cancelRunningRpcs: true
                            }).then((e) => {
                                if (kijs.isEmpty(e.response.errorType)) {
                                    kijs.gui.CornerTipContainer.show('RPC OK', e.response.data);
                                }
                            });
                        },
                        context: this
                    }
                },
                
                {
                    xtype: 'kijs.gui.field.Display',
                    cls: 'kijs-titleLarge',
                    value: 'RPCs automatisch zusammenfassen (RPCs innerhalb von 10ms werden zusammengefasst:',
                    style: { margin: '10px 0 0 0'}
                },{
                    xtype: 'kijs.gui.Button',
                    caption: 'Sende 3 RPCs',
                    on: {
                        click: function() {
                            kijs.getRpc('default').do({
                                remoteFn: 'rpc.simple',
                                data: 'RPC 1/3'
                            }).then((e) => {
                                if (kijs.isEmpty(e.response.errorType)) {
                                    kijs.gui.CornerTipContainer.show('RPC OK', e.response.data);
                                }
                            });
                            kijs.getRpc('default').do({
                                remoteFn: 'rpc.simple',
                                data: 'RPC 2/3'
                            }).then((e) => {
                                if (kijs.isEmpty(e.response.errorType)) {
                                    kijs.gui.CornerTipContainer.show('RPC OK', e.response.data);
                                }
                            });
                            kijs.getRpc('default').do({
                                remoteFn: 'rpc.simple',
                                data: 'RPC 3/3'
                            }).then((e) => {
                                if (kijs.isEmpty(e.response.errorType)) {
                                    kijs.gui.CornerTipContainer.show('RPC OK', e.response.data);
                                }
                            });
                        },
                        context: this
                    }
                },

                {
                    xtype: 'kijs.gui.field.Display',
                    cls: 'kijs-titleLarge',
                    value: 'Exklusiver RPC. Der nicht mit anderen zusammenfasst wird:',
                    style: { margin: '10px 0 0 0'}
                },{
                    xtype: 'kijs.gui.Button',
                    caption: 'Sende 3 RPCs. Der zweite davon ist exklusiv',
                    on: {
                        click: function() {
                            kijs.getRpc('default').do({
                                remoteFn: 'rpc.simple',
                                data: 'RPC 1/3'
                            }).then((e) => {
                                if (kijs.isEmpty(e.response.errorType)) {
                                    kijs.gui.CornerTipContainer.show('RPC OK', e.response.data);
                                }
                            });
                            kijs.getRpc('default').do({
                                remoteFn: 'rpc.simple',
                                data: 'RPC 2/3',
                                exclusive: true
                            }).then((e) => {
                                if (kijs.isEmpty(e.response.errorType)) {
                                    kijs.gui.CornerTipContainer.show('RPC OK', e.response.data);
                                }
                            });
                            kijs.getRpc('default').do({
                                remoteFn: 'rpc.simple',
                                data: 'RPC 3/3'
                            }).then((e) => {
                                if (kijs.isEmpty(e.response.errorType)) {
                                    kijs.gui.CornerTipContainer.show('RPC OK', e.response.data);
                                }
                            });
                        },
                        context: this
                    }
                },
                
                {
                    xtype: 'kijs.gui.field.Display',
                    cls: 'kijs-titleLarge',
                    value: 'RPC Meldungen:',
                    style: { margin: '10px 0 0 0'}
                },{
                    xtype: 'kijs.gui.Button',
                    caption: 'infoMsg',
                    on: {
                        click: function() {
                            kijs.getRpc('default').do({
                                remoteFn: 'rpc.infoMsg',
                                data: 'infoMsg'
                            }).then((e) => {
                                if (kijs.isEmpty(e.response.errorType)) {
                                    kijs.gui.CornerTipContainer.show('RPC OK', e.response.data);
                                }
                            });
                        },
                        context: this
                    }
                },{
                    xtype: 'kijs.gui.Button',
                    caption: 'cornerTipMsg',
                    on: {
                        click: function() {
                            kijs.getRpc('default').do({ 
                                remoteFn: 'rpc.cornerTipMsg', 
                                data: 'cornerTipMsg'
                            }).then((e) => {
                                if (kijs.isEmpty(e.response.errorType)) {
                                    kijs.gui.CornerTipContainer.show('RPC OK', e.response.data);
                                }
                            });
                        },
                        context: this
                    }
                },{
                    xtype: 'kijs.gui.Button',
                    caption: 'warningMsg',
                    on: {
                        click: function() {
                            kijs.getRpc('default').do({ 
                                remoteFn: 'rpc.warningMsg', 
                                data: 'warningMsg' 
                            }).then((e) => {
                                if (kijs.isEmpty(e.response.errorType)) {
                                    kijs.gui.CornerTipContainer.show('RPC OK', e.response.data);
                                }
                            });
                        },
                        context: this
                    }
                },{
                    xtype: 'kijs.gui.Button',
                    caption: 'errorMsg',
                    on: {
                        click: function() {
                            kijs.getRpc('default').do({ 
                                remoteFn: 'rpc.errorMsg', 
                                data: 'errorMsg' 
                            }).then((e) => {
                                if (kijs.isEmpty(e.response.errorType)) {
                                    kijs.gui.CornerTipContainer.show('RPC OK', e.response.data);
                                }
                            });
                        },
                        context: this
                    }
                },
                
                
                {
                    xtype: 'kijs.gui.field.Display',
                    cls: 'kijs-titleLarge',
                    value: 'Fehlerbehandlung (errorTypes):',
                    style: { margin: '10px 0 0 0'}
                },{
                    xtype: 'kijs.gui.Button',
                    caption: 'errorNotice',
                    on: {
                        click: function() {
                            kijs.getRpc('default').do({ 
                                remoteFn: 'rpc.errorNotice', 
                                data: 'error' 
                            }).then((e) => {
                                if (kijs.isEmpty(e.response.errorType)) {
                                    kijs.gui.CornerTipContainer.show('RPC OK', e.response.data);
                                }
                            });
                        },
                        context: this
                    }
                },{
                    xtype: 'kijs.gui.Button',
                    caption: 'error',
                    on: {
                        click: function() {
                            kijs.getRpc('default').do({ 
                                remoteFn: 'rpc.error', 
                                data: 'errorNotice' 
                            }).
                                then((e) => {
                                    if (kijs.isEmpty(e.response.errorType)) {
                                        kijs.gui.CornerTipContainer.show('RPC OK', e.response.data);
                                    }
                                });
                        },
                        context: this
                    }
                },
                
                {
                    xtype: 'kijs.gui.field.Display',
                    cls: 'kijs-titleLarge',
                    value: 'RPC mit individueller Lademaske:',
                    style: { margin: '10px 0 0 0'}
                },{
                    xtype: 'kijs.gui.Button',
                    caption: 'RPC verzögert mit Lademaske auf einem individuellen Element',
                    on: {
                        click: function() {
                            kijs.getRpc('default').do({ 
                                remoteFn: 'rpc.delay',
                                data: 'RPC verzögert mit Lademaske auf einem individuellen Element',
                                waitMaskTarget: this._content.down('waitMaskTarget'),
                                waitMaskTargetDomProperty: 'innerDom'
                            }).then((e) => {
                                if (kijs.isEmpty(e.response.errorType)) {
                                    kijs.gui.CornerTipContainer.show('RPC OK', e.response.data);
                                }
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