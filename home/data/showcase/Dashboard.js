/* global kijs, this */

// Hilfsklasse home.sc.DashboardItemPanel
home.sc.DashboardItemPanel = class home_sc_DashboardItemPanel extends kijs.gui.dashboard.Panel {
    // overwrite
    constructor(config={}) {
        super(false);
        
        this.ddTarget = {
            posBeforeFactor: 0.666,
            posAfterFactor: 0.666,
            mapping: {
                dashboardItem:{
                    allowMove: true,
                    allowCopy: true,
                    allowLink: true,
                    disableMarkerAutoSize: true
                }
            },
            on: {
                drop: this.#onPanelDrop,
                context: this
            }
        };
        
        this._dom.clsAdd('dashboardItemPanel');
        
        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            iconMap: 'kijs.iconMap.Fa.location-pin',
            closable: true,
            collapsible: 'top',
            scrollableY: 'auto',
            resizableHeight: true,
            cls: 'kijs-flexcolumn',
            style: {
                minHeight: '100px'
            },
            innerStyle: { 
                padding: '10px',
                gap: '2px'
            }
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            ddTarget: { target: 'ddTarget' }
        });
        
        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }
    }
    
    get ddTarget() { 
        return this._ddTarget; 
    }
    set ddTarget(val) {
        // config-object
        if (kijs.isObject(val)) {
            if (kijs.isEmpty(this._ddTarget)) {
                val.ownerEl = this;
                if (kijs.isEmpty(val.ownerDomProperty)) {
                    val.ownerDomProperty = 'innerDom';
                }
                this._ddTarget = new kijs.gui.dragDrop.Target(val);
            } else {
                this._ddTarget.applyConfig(val);
            }

        // null
        } else if (val === null) {
            if (this._ddTarget) {
                this._ddTarget.destruct();
            }
            this._ddTarget = null;

        } else {
            throw new kijs.Error(`ddTarget must be a object or null`);

        }
    }
    
    #onPanelDrop(e) {
        switch (e.operation) {
            case 'move':
                kijs.gui.DragDrop.dropFnMoveEl(e);
                break;
                
            case 'copy':
                const sourceEl = e.source.ownerEl;
                
                let html = '';
                if (sourceEl.ddSource.allowMove) {
                    if (html) {
                        html += ', ';
                    }
                    html += 'move';
                }
                if (sourceEl.ddSource.allowCopy) {
                    if (html) {
                        html += ', ';
                    }
                    html += 'copy';
                }
                html = 'new item (' + html + ')';
                
                
                const cloneEl = new kijs.gui.Element({
                    height: 31,
                    ddSource:{
                        name: sourceEl.ddSource.name,
                        allowMove: sourceEl.ddSource.allowMove,
                        allowCopy: sourceEl.ddSource.allowCopy,
                        allowLink: sourceEl.ddSource.allowLink
                    },
                    html: html,
                    style: {
                        padding: '4px 10px',
                        border: '1px solid var(--panel-borderColor)',
                        borderRadius: '5px',
                        backgroundColor: 'var(--viewport-bkgrndColor)'
                    }
                });
                
                // beim neuen Ort einfügen
                switch (e.target.targetPos){
                    case 'child':
                        e.target.targetEl.add(cloneEl);
                        break;

                    case 'before':
                        e.target.targetEl.parent.add(cloneEl, e.target.targetEl.index);
                        break;

                    case 'after':
                        e.target.targetEl.parent.add(cloneEl, e.target.targetEl.index+1);
                        break;
                }
                break;
                
            case 'link':
                throw new kijs.Error(`operation 'link' is not supported in this example`);
                break;
        }
        //this.save();
    }
    
    // DESTRUCTOR
    // overwrite
    destruct(superCall) {
        if (!superCall) {
            // unrender
            this.unrender(superCall);

            // Event auslösen.
            this.raiseEvent('destruct');
        }
        
        // Elemente/DOM-Objekte entladen
        if (this._ddTarget) {
            this._ddTarget.destruct();
        }
        
        // Variablen (Objekte/Arrays) leeren
        this._ddTarget = null;
        
        // Basisklasse entladen
        super.destruct(true);
    }
};

// Hilfsklasse home.sc.DashboardFormPanel
home.sc.DashboardFormPanel = class home_sc_DashboardFormPanel extends kijs.gui.dashboard.Panel {
    // overwrite
    constructor(config={}) {
        super(false);
        
        this._form = new kijs.gui.container.Form({
            cls: 'kijs-flexform',
            innerStyle: { padding: '10px' },
            elements: [
                {
                    xtype: 'kijs.gui.field.Memo',
                    name: 'memo'
                }
            ]
        });
        this.add(this._form);
        
        this._dom.clsAdd('kijs-flexfit');
        
        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            iconMap: 'kijs.iconMap.Fa.rectangle-list',
            closable: true,
            collapsible: 'top',
            footerElements:[
                {
                    xtype: 'kijs.gui.Button',
                    caption: 'Übernehmen',
                    on: {
                        click: this.#onBtnSaveClick,
                        context: this
                    }
                }
            ]
        });
        
        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            rpc: { target: 'rpc', context: this._form },
            rpcLoadFn: { target: 'rpcLoadFn', context: this._form },
            rpcLoadArgs: { target: 'rpcLoadArgs', context: this._form },
            rpcSaveFn: { target: 'rpcSaveFn', context: this._form },
            rpcSaveArgs: { target: 'rpcSaveArgs', context: this._form },
            autoLoad: { target: 'autoLoad', context: this._form }
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }

        
    }
    
    // GETTER / SETTER
    get autoLoad() { return this._form.autoLoad; }
    set autoLoad(val) { this._form.autoLoad = val; }

    get rpc() { return this._form.rpc; }
    set rpc(val) { this._form.rpc = val; }

    get rpcLoadArgs() { return this._form.rpcLoadArgs; }
    set rpcLoadArgs(val) { this._form.rpcLoadArgs = val; }
    
    get rpcLoadFn() { return this._form.rpcLoadFn; }
    set rpcLoadFn(val) { this._form.rpcLoadFn = val; }
    
    get rpcSaveArgs() { return this._form.rpcSaveArgs; }
    set rpcSaveArgs(val) { this._form.rpcSaveArgs = val; }

    get rpcSaveFn() { return this._form.rpcSaveFn; }
    set rpcSaveFn(val) { this._form.rpcSaveFn = val; }
    
    // LISTENERS
    #onBtnSaveClick(e) {
        this._form.save();
    }

};


// Testklasse
home.sc.Dashboard = class home_sc_Dashboard {
    
    
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
            caption: 'kijs.gui.Dashboard',
            scrollableY: false,
            cls: ['kijs-borderless', 'kijs-flexfit'],
            style: {
                flex: 1
            },
            headerElements: this._getHeaderElements(),
            elements:[
                {
                    xtype: 'kijs.gui.Dashboard',
                    rpcLoadFn: 'dashboard.load',
                    rpcSaveFn: 'dashboard.save',
                    autoLoad: true,
                    autoSave: true
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
            },{
                xtype: 'kijs.gui.Separator'
            },{
                xtype: 'kijs.gui.Element',
                height: 31,
                ddSource:{
                    name: 'dashboardItem',
                    allowMove: true,
                    allowCopy: true,
                    allowLink: true
                },
                html: 'Item (move or copy)',
                style: {
                    padding: '4px 10px',
                    border: '1px solid var(--panel-borderColor)',
                    borderRadius: '5px',
                    backgroundColor: 'var(--viewport-bkgrndColor)'
                }
            },{
                xtype: 'kijs.gui.Element',
                height: 31,
                ddSource:{
                    name: 'dashboardItem2',
                    allowMove: true,
                    allowCopy: true,
                    allowLink: true
                },
                html: 'Item (cannot move to Dasboard)',
                style: {
                    padding: '4px 10px',
                    border: '1px solid var(--panel-borderColor)',
                    borderRadius: '5px',
                    backgroundColor: 'var(--viewport-bkgrndColor)'
                }
            }
        ];
    }
    
    #onPanelDrop(e) {
        kijs.gui.DragDrop.dropFnMoveEl(e);
    }
    
    
    
    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct() {
        this._content = null;
    }
    
};