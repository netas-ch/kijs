/* global kijs */

window.home.sc = {};
home.sc.container_Wizard = class home_sc_container_Wizard {
    
    
    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        this._app = config.app;
        this._content = null;
        this._wizard = null;
    }
    
    
    
    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    getContent() {
        this._content = new kijs.gui.Panel({
            caption: 'kijs.gui.container.Tab',
            scrollableY: 'auto',
            style: {
                flex: 1
            },
            innerStyle: {
                padding: '10px'
            },
            elements:[
                {
                    xtype: 'kijs.gui.Container',
                    cls: 'kijs-flexcolumn',
                    height: 200,
                    width: 600,
                    style: {
                        border: '1px solid black'
                    },
                    elements:[
                        {
                            xtype: 'kijs.gui.container.Wizard',
                            name: 'tab',
                            style: { flex: 1 },
                            defaults:{
                                innerStyle: { padding:'10px' }
                            },
                            on: {
                                change: function(e) {
                                    console.log(e);
                                },
                                context: this
                            },
                            elements: [
                                { name:'s1', tabCaption:'Seite 1', tabIconMap:'kijs.iconMap.Fa.house', html:'Seite 1', innerStyle:{ color:'#f99'} },
                                // { name:'s2', tabCaption:'Seite 2', tabIconMap:'kijs.iconMap.Fa.user', html:'Seite 2', innerStyle:{ color:'#9f9'} },
                                // { name:'s3', tabCaption:'Seite 3', tabIconMap:'kijs.iconMap.Fa.phone', html:'Seite 3', innerStyle:{ color:'#99f'} },
                                // { name:'s4', tabCaption:'Seite 4', tabIconMap:'kijs.iconMap.Fa.envelope', html:'Seite 4', innerStyle:{ color:'#f9f'} },
                                // { name:'s5', tabCaption:'Seite 5', tabIconMap:'kijs.iconMap.Fa.location-dot', html:'Seite 5', innerStyle:{ color:'#9ff'} }
                                // { name:'s1', html:'Seite 1', innerStyle:{ color:'#f99'} },
                                { name:'s2', html:'Seite 2', innerStyle:{ color:'#9f9'} },
                                { name:'s3', html:'Seite 3', innerStyle:{ color:'#99f'} },
                                { name:'s4', html:'Seite 4', innerStyle:{ color:'#f9f'} },
                                { name:'s5', html:'Seite 5', innerStyle:{ color:'#9ff'} }
                            ]
                        }
                    ]
                }
            ]
        });

        return this._content;
    }
    
    run() {
        // this._wizard = new kijs.gui.Wizard({
        //     width: 450,
        //     height: 450,
        //     elements: [
        //         {
        //             xtype: 'kijs.gui.container.tab.Container',
        //             height: null,
        //             width: 200,
        //             style: {
        //                 margin: '10px'
        //             },
        //             elements: [
        //                 {
        //                     xtype: 'kijs.gui.Element',
        //                     html: 'A1',
        //                     style: {border: '1px solid #f00'}
        //                 }, {
        //                     xtype: 'kijs.gui.Element',
        //                     html: 'B1',
        //                     style: {border: '1px solid #0f0'}
        //                 }, {
        //                     xtype: 'kijs.gui.Element',
        //                     html: 'C1',
        //                     style: {border: '1px solid #00f'}
        //                 }, {
        //                     xtype: 'kijs.gui.Element',
        //                     html: 'D1',
        //                     style: {border: '1px solid #ff0'}
        //                 }
        //             ]
        //         }, {
        //             xtype: 'kijs.gui.container.tab.Container',
        //             height: null,
        //             width: 200,
        //             style: {
        //                 margin: '10px',
        //                 border: '1px solid #000',
        //                 backgroundColor: '#ffd'
        //             },
        //             defaults: {
        //                 width: 80
        //             },
        //             elements: [
        //                 {
        //                     xtype: 'kijs.gui.Element',
        //                     html: 'A1',
        //                     style: {border: '1px solid #f00'}
        //                 }, {
        //                     xtype: 'kijs.gui.Element',
        //                     html: 'B1',
        //                     style: {border: '1px solid #0f0'}
        //                 }, {
        //                     xtype: 'kijs.gui.Element',
        //                     html: 'C1',
        //                     style: {border: '1px solid #00f'}
        //                 }, {
        //                     xtype: 'kijs.gui.Element',
        //                     html: 'D1',
        //                     style: {border: '1px solid #ff0'}
        //                 }
        //             ]
        //         }
        //     ]
        // });
    }


    // PROTECTED



    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct() {
        if (this._wizard) {
            this._wizard.destruct();
        }

        this._app = null;
        this._wizard = null;
        this._content = null;
    }
    
};
