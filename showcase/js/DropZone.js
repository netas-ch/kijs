/* global kijs */

window.sc = {};
sc.DropZone = class sc_DropZone {
    
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
            caption: 'kijs.gui.DropZone',
            autoScroll: true,
            style: {
                flex: 1
            },
            innerStyle: {
                padding: '10px'
            },
            elements:[
                {
                    xtype: 'kijs.gui.Panel',
                    caption: 'Panel mit DropZone',
                    iconCls: 'icoWizard16',
                    shadow: true,
                    closable: true,
                    collapsible: 'top',
                    collapsed: false,
                    maximizable: true,
                    maximized: false,
                    resizable: true,
                    autoScroll: true,
                    width: 500,
                    height: 400,
                    cls: 'kijs-flexrow',
                    
                    elements: [
                        {
                            xtype: 'kijs.gui.DropZone',
                            style: {
                                flex: 1,
                                margin: '20px',
                                borderRadius: '10px',
                                lineHeight: '150px',
                                fontFamily: '"Open Sans", "Helvetica Neue", helvetica, arial, verdana, sans-serif',
                                fontSize: '50px',
                                fontWeight: 'bold',
                                color: 'var(--panel-bkgrndColor)',
                                textAlign: 'center',
                                verticalAlign: 'center',
                                backgroundImage: 'repeating-linear-gradient(45deg, var(--panel-bkgrndColor) 0%, var(--panel-bkgrndColor) 0.1%, var(--panel-borderColor) 0.1%, var(--panel-borderColor) 2%, var(--panel-bkgrndColor) 2%)'
                            },
                            html: 'Drop Zone',
                            //contentTypes: 'image',
                            on: {
                                drop: function(e) {
                                    console.log(e);
                                    
                                    let files = [];
                                    
                                    kijs.Array.each(e.nodeEvent.dataTransfer.files, function(file) {
                                        files.push(file.name);
                                    }, this);
                                    
                                    if (e.validMime) {
                                        kijs.gui.CornerTipContainer.show('Drop (OK)', files.join('<br>'));
                                    } else {
                                        kijs.gui.CornerTipContainer.show('Drop (contentType fail)', files.join('<br>'), 'error');
                                    }
                                },
                                context: this
                            }
                        }
                    ],

                    footerCaption: 'Meine FooterBar'
                },
                
                {
                    xtype: 'kijs.gui.field.CheckboxGroup',
                    label: 'contentTypes',
                    cls: 'kijs-inline',
                    valueField: 'id',
                    captionField: 'id',
                    data: [
                        { id: 'application' },
                        { id: 'audio' },
                        { id: 'example' },
                        { id: 'image' },
                        { id: 'message' },
                        { id: 'model' },
                        { id: 'multipart' },
                        { id: 'text' }
                    ],
                    style:{
                        margin: '10px 0 0 0'
                    },
                    on: {
                        change: function(e) {
                            this._content.downX('kijs.gui.DropZone').contentTypes = e.element.value;
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