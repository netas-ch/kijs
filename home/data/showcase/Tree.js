/* global kijs */

home.sc.Tree = class home_sc_Tree {
    
    
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
                    html: 'Tree mit RPC:'
                },{
                    xtype: 'kijs.gui.Tree',
                    caption: 'Element 1',
                    //iconChar: 0xf114,
                    //elements: this.createTreeRecursive(6, 3),
                    //iconCls: 'icoFolder32',
                    //expandedIconCls: 'icoFolderOpen32',
                    //iconSize: 16,
                    //rpc: 'default',
                    rpcLoadFn: 'tree.load',
                    on: {
                        expand: function(){ console.log('expand event'); },
                        collapse: function(){ console.log('collapse event'); },
                        select: function(){ console.log('select event'); },
                        context: this
                    },
                    style: {
                        flex: 1
                    }
                },
                
                {
                    xtype: 'kijs.gui.Element',
                    html: 'Tree local:',
                    style: { margin: '10px 0 0 0'}
                },{
                    xtype: 'kijs.gui.Tree',
                    caption: 'Element 1',
                    iconMap: 'kijs.iconMap.Fa.face-smile',
                    elements: this._createTreeRecursive(6, 3),
                    iconCls: 'icoFolder32',
                    expandedIconCls: 'icoFolderOpen32',
                    iconSize: 16,
                    rpcLoadFn: 'tree.load',
                    on: {
                        expand: function(){ console.log('expand event'); },
                        collapse: function(){ console.log('collapse event'); },
                        select: function(){ console.log('select event'); },
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