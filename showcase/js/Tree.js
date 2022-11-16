/* global kijs */

window.sc = {};
sc.Tree = class sc_Tree {
    
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
            caption: 'kijs.gui.Tree',
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
                    html: 'Tree mit RPC:',
                    style: { margin: '0 0 4px 0'}
                },{
                    xtype: 'kijs.gui.Tree',
                    caption: 'Element 1',
                    //iconChar: 0xf114,
                    //elements: this.createTreeRecursive(6, 3),
                    //iconCls: 'icoFolder32',
                    //expandedIconCls: 'icoFolderOpen32',
                    //iconSize: 16,
                    rpc: this._app.rpc,
                    facadeFnLoad: 'tree.load',
                    draggable: true,
                    on: {
                        expand: function(){ console.log('expand event'); },
                        collapse: function(){ console.log('collapse event'); },
                        select: function(){ console.log('select event'); },
                        dragDrop: function(s) { console.log('dragDrop event'); console.log(s); },
                        context: this
                    },
                    style: {
                        flex: 1
                    }
                },
                
                {
                    xtype: 'kijs.gui.Element',
                    html: 'Tree local:',
                    style: { margin: '10px 0 4px 0'}
                },{
                    xtype: 'kijs.gui.Tree',
                    caption: 'Element 1',
                    iconMap: 'kijs.iconMap.Fa.face-smile',
                    elements: this._createTreeRecursive(6, 3),
                    iconCls: 'icoFolder32',
                    expandedIconCls: 'icoFolderOpen32',
                    iconSize: 16,
                    facadeFnLoad: 'tree.load',
                    draggable: true,
                    on: {
                        expand: function(){ console.log('expand event'); },
                        collapse: function(){ console.log('collapse event'); },
                        select: function(){ console.log('select event'); },
                        dragDrop: function(s) { console.log('dragDrop event'); console.log(s); },
                        context: this
                    },
                    style: {
                        flex: 1
                    }
                }
            ]
        });
        
        return this._content;
    }
    
    run() {

    }
    
    
    // PROTECTED
    _createTreeRecursive(maxDeep, maxSubitem=15, currentDeep=0) {
        if (currentDeep > maxDeep) {
            return [];
        }
        let treeElements = [];
        let random = kijs.Number.random(0, maxSubitem);
        for (var i=0; i<random; i++) {
            treeElements.push({
                caption: 'Baum ' + currentDeep + '-' + i,
                elements: this._createTreeRecursive(maxDeep, maxSubitem, currentDeep+1)
            });
        }

        return treeElements;
    }
    
    
    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct() {
        this._content = null;
    }
};