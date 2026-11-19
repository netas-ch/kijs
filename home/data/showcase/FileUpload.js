/* global kijs */

home.sc.FileUpload = class home_sc_FileUpload {


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
        // Der Endpunkt speichert die Dateien nicht, er gibt nur Name und Grösse zurück
        this._fileUpload = new kijs.gui.FileUpload({
            url: 'dataResources/php/upload.php',
            on: {
                uploadEnd: function(e) {
                    this._log('uploadEnd', { uploadResponses: e.uploadResponses, errorMsgs: e.errorMsgs });
                },
                fileRejected: function(e) {
                    this._log('fileRejected', { fileName: e.fileName, errorMsg: e.errorMsg });
                },
                context: this
            }
        });

        this._content = new kijs.gui.Panel({
            caption: 'kijs.gui.FileUpload',
            headerBarElements: [ this._app.createApiButton(['kijs.gui.FileUpload', 'kijs.FileUpload']) ],
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
                    xtype: 'kijs.gui.Element',
                    html: 'Die Dateien werden nicht gespeichert. Dateien mit «fehler» im Namen lösen eine '
                        + 'Fehlermeldung vom Server aus. Dateien können auch auf die DropZone gezogen oder '
                        + 'mit Ctrl+V eingefügt werden.'
                },{
                    xtype: 'kijs.gui.Container',
                    cls: 'kijs-flexrow',
                    style: {
                        margin: '10px 0 0 0'
                    },
                    innerStyle: {
                        gap: '6px'
                    },
                    elements: [
                        {
                            xtype: 'kijs.gui.Button',
                            caption: 'Dateien auswählen',
                            iconMap: 'kijs.iconMap.Fa.file-arrow-up',
                            on: {
                                click: function() {
                                    this._fileUpload.showFileOpenDialog();
                                },
                                context: this
                            }
                        },{
                            xtype: 'kijs.gui.Button',
                            caption: 'Ordner auswählen',
                            iconMap: 'kijs.iconMap.Fa.folder-open',
                            on: {
                                click: function() {
                                    this._fileUpload.showFileOpenDialog(null, true);
                                },
                                context: this
                            }
                        }
                    ]
                },{
                    xtype: 'kijs.gui.DropZone',
                    name: 'dropZone',
                    html: 'Dateien hierher ziehen',
                    fileUpload: this._fileUpload,
                    style: {
                        margin: '10px 0 0 0',
                        height: '100px',
                        lineHeight: '100px',
                        textAlign: 'center',
                        border: '1px dashed var(--panel-borderColor)',
                        borderRadius: '6px'
                    }
                },{
                    xtype: 'kijs.gui.field.CheckboxGroup',
                    label: 'contentTypes',
                    cls: 'kijs-inline',
                    valueField: 'id',
                    displayTextField: 'id',
                    data: [
                        { id: 'application' },
                        { id: 'audio' },
                        { id: 'image' },
                        { id: 'text' },
                        { id: 'video' }
                    ],
                    style: {
                        margin: '10px 0 0 0'
                    },
                    on: {
                        change: function(e) {
                            this._fileUpload.contentTypes = e.element.value;
                        },
                        context: this
                    }
                },{
                    xtype: 'kijs.gui.Element',
                    name: 'log',
                    htmlDisplayType: 'code',
                    style: {
                        margin: '10px 0 0 0',
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'monospace'
                    }
                }
            ]
        });

        // Einfügen nur, solange die DropZone angezeigt wird
        this._fileUpload.observePaste = this._content.down('dropZone');

        return this._content;
    }

    run() {

    }


    // PROTECTED
    _getHeaderElements() {
        return [
            {
                xtype: 'kijs.gui.field.Switch',
                label: 'multiple',
                value: true,
                on: {
                    change: function(e) {
                        this._fileUpload.multiple = !!e.element.value;
                    },
                    context: this
                }
            },{
                xtype: 'kijs.gui.field.Switch',
                label: 'autoClose',
                value: true,
                on: {
                    change: function(e) {
                        this._fileUpload.autoClose = !!e.element.value;
                    },
                    context: this
                }
            },{
                xtype: 'kijs.gui.field.Switch',
                label: 'maxFileSize 1 MB',
                on: {
                    change: function(e) {
                        this._fileUpload.maxFileSize = e.element.value ? 1024*1024 : null;
                    },
                    context: this
                }
            }
        ];
    }

    _log(eventName, data) {
        const logEl = this._content ? this._content.down('log') : null;
        if (logEl) {
            logEl.html = eventName + ': ' + JSON.stringify(data, null, 2) + '\n\n' + logEl.html;
        }
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
