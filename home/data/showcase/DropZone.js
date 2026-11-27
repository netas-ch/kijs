/* global kijs */

home.sc.DropZone = class home_sc_DropZone {
    
    
    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        this._app = config.app;
        this._content = null;
        this._fileUpload = null;
    }
    
    
    
    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    getContent() {
        // FileUpload ohne Server: die Dateien werden nur angezeigt
        this._fileUpload = new kijs.FileUpload({
            on: {
                beforeUpload: function(e) {
                    kijs.gui.CornerTipContainer.show('Drop (OK)', kijs.String.htmlspecialchars(e.fileName));
                    return false;
                },
                fileRejected: function(e) {
                    kijs.gui.CornerTipContainer.show('Drop (' + kijs.getText('abgewiesen') + ')', kijs.String.htmlspecialchars(e.errorMsg), 'error');
                },
                context: this
            }
        });

        this._content = new kijs.gui.Panel({
            caption: 'kijs.gui.DropZone',
            headerBarElements: [ this._app.createApiButton('kijs.gui.DropZone') ],
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
                    xtype: 'kijs.gui.Panel',
                    caption: kijs.getText('Panel mit DropZone'),
                    iconCls: 'icoWizard16',
                    closable: true,
                    collapsible: 'top',
                    collapsed: false,
                    maximizable: true,
                    maximized: false,
                    resizable: true,
                    scrollableY: 'auto',
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
                                backgroundImage: 'repeating-linear-gradient(45deg, var(--panel-bkgrndColor) 0%, var(--panel-bkgrndColor) 0.1%, var(--panel-borderColor) 0.1%, var(--panel-borderColor) 2%, var(--panel-bkgrndColor) 2%)'
                            },
                            innerStyle:{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '50px',
                                fontWeight: 'bold',
                                color: 'var(--panel-bkgrndColor)'
                            },
                            html: 'Drop Zone',
                            fileUpload: this._fileUpload,
                            on: {
                                drop: function(e) {
                                    console.log(e);
                                },
                                context: this
                            }
                        }
                    ],

                    footerBarCaption: kijs.getText('Meine FooterBar')
                },
                
                {
                    xtype: 'kijs.gui.field.CheckboxGroup',
                    label: 'contentTypes',
                    cls: 'kijs-inline',
                    valueField: 'id',
                    displayTextField: 'id',
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
                            this._fileUpload.contentTypes = e.element.value;
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
        if (this._fileUpload) {
            this._fileUpload.destruct();
        }

        this._content = null;
        this._fileUpload = null;
    }
    
};