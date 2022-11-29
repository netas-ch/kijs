/* global kijs */

window.sc = {};
sc.Rpc = class sc_Rpc {
    
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
                    html: 'RPC:',
                    style: { margin: '0 0 4px 0'}
                },{
                    xtype: 'kijs.gui.Button',
                    caption: 'RPC mit Promise',
                    on: {
                        click: function() {
                            this._app.rpc.do({
                                facadeFn:'rpc.simple', 
                                data: 'RPC mit Promise'
                            }).then((responseData) => {
                                kijs.gui.CornerTipContainer.show('RPC OK', JSON.stringify(responseData));
                            });
                        },
                        context: this
                    }
                },{
                    xtype: 'kijs.gui.Button',
                    caption: 'RPC mit callback function',
                    on: {
                        click: function() {
                            this._app.rpc.do({
                                facadeFn:'rpc.simple', 
                                data: 'RPC mit callback function',
                                fn: function(responseData) {
                                    kijs.gui.CornerTipContainer.show('RPC OK', JSON.stringify(responseData));
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
                            this._app.rpc.do({ facadeFn: 'rpc.delay', data: 'RPC verzögert mit Ladeanzeige' }).then((responseData) => {
                                kijs.gui.CornerTipContainer.show('RPC OK', JSON.stringify(responseData));
                            });
                        },
                        context: this
                    }
                },{
                    xtype: 'kijs.gui.Button',
                    caption: 'RPC verzögert ohne Ladeanzeige, mit cancelRunningRpcs=true',
                    on: {
                        click: function() {
                            this._app.rpc.do({ 
                                facadeFn: 'rpc.delay', 
                                data: 'RPC verzögert ohne Ladeanzeige, mit cancelRunningRpcs=true',
                                waitMaskTarget: 'none',
                                cancelRunningRpcs: true
                            }).then((responseData) => {
                                kijs.gui.CornerTipContainer.show('RPC OK', JSON.stringify(responseData));
                            });
                        },
                        context: this
                    }
                },
                
                {
                    xtype: 'kijs.gui.Element',
                    html: 'RPCs automatisch zusammenfassen (RPCs innerhalb von 10ms werden zusammengefasst:',
                    style: { margin: '10px 0 4px 0'}
                },{
                    xtype: 'kijs.gui.Button',
                    caption: 'Sende 3 RPCs',
                    on: {
                        click: function() {
                            this._app.rpc.do({ facadeFn: 'rpc.simple', data: 'RPC 1/3' }).then((responseData) => {
                                kijs.gui.CornerTipContainer.show('RPC OK', JSON.stringify(responseData));
                            });
                            this._app.rpc.do({ facadeFn: 'rpc.simple', data: 'RPC 2/3' }).then((responseData) => {
                                kijs.gui.CornerTipContainer.show('RPC OK', JSON.stringify(responseData));
                            });
                            this._app.rpc.do({ facadeFn: 'rpc.simple', data: 'RPC 3/3' }).then((responseData) => {
                                kijs.gui.CornerTipContainer.show('RPC OK', JSON.stringify(responseData));
                            });
                        },
                        context: this
                    }
                },
                
                {
                    xtype: 'kijs.gui.Element',
                    html: 'RPC Meldungen:',
                    style: { margin: '10px 0 4px 0'}
                },{
                    xtype: 'kijs.gui.Button',
                    caption: 'infoMsg',
                    on: {
                        click: function() {
                            this._app.rpc.do({ facadeFn: 'rpc.infoMsg', data: 'infoMsg' }).then((responseData) => {
                                kijs.gui.CornerTipContainer.show('RPC OK', JSON.stringify(responseData));
                            });
                        },
                        context: this
                    }
                },{
                    xtype: 'kijs.gui.Button',
                    caption: 'cornerTipMsg',
                    on: {
                        click: function() {
                            this._app.rpc.do({ facadeFn: 'rpc.cornerTipMsg', data: 'cornerTipMsg' }).then((responseData) => {
                                kijs.gui.CornerTipContainer.show('RPC OK', JSON.stringify(responseData));
                            });
                        },
                        context: this
                    }
                },{
                    xtype: 'kijs.gui.Button',
                    caption: 'warningMsg',
                    on: {
                        click: function() {
                            this._app.rpc.do({ facadeFn: 'rpc.warningMsg', data: 'warningMsg' }).then((responseData) => {
                                kijs.gui.CornerTipContainer.show('RPC OK', JSON.stringify(responseData));
                            });
                        },
                        context: this
                    }
                },{
                    xtype: 'kijs.gui.Button',
                    caption: 'errorMsg',
                    on: {
                        click: function() {
                            this._app.rpc.do({ facadeFn: 'rpc.errorMsg', data: 'errorMsg' }).then((responseData) => {
                                kijs.gui.CornerTipContainer.show('RPC OK', JSON.stringify(responseData));
                            });
                        },
                        context: this
                    }
                },
                
                
                {
                    xtype: 'kijs.gui.Element',
                    html: 'RPC mit individueller Lademaske:',
                    style: { margin: '10px 0 4px 0'}
                },{
                    xtype: 'kijs.gui.Button',
                    caption: 'RPC verzögert mit Lademaske auf einem individuellen Element',
                    on: {
                        click: function() {
                            this._app.rpc.do({ 
                                facadeFn: 'rpc.delay',
                                data: 'RPC verzögert mit Lademaske auf einem individuellen Element',
                                waitMaskTarget: this._content.down('waitMaskTarget'),
                                waitMaskTargetDomProperty: 'innerDom'
                            }).then((responseData) => {
                                kijs.gui.CornerTipContainer.show('RPC OK', JSON.stringify(responseData));
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
    

    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct() {
        this._content = null;
    }
};