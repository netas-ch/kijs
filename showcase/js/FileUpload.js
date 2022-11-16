/* global kijs */

window.sc = {};
sc.FileUpload = class sc_FileUpload {
    
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
            caption: 'kijs.gui.FileUpload',
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
                    html: '<b>TODO</b><ul><li>kijs.UploadDialog umbenennen zu kijs.FileUpload</li><li>kijs.gui.UploadWindow umbenennen zu kijs.gui.FileUpload</li><li>kijs.gui.FileUpload sollte von kijs.FileUpload erben</li><li>kijs.Ajax hat Events mit mehr als einem Argument</li><li>Einer kijs.gui.DropBox sollte ein kijs.gui.FileUpload zugewiesen werden können</li></ul>'
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