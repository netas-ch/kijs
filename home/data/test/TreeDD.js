/* global kijs, home */

home.test.TreeDD = class home_test_TreeDD {
    
    
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
        // SOURCE
        this._treeSource = new kijs.gui.Tree({
            xtype: 'kijs.gui.Tree',
            valueField: 'key',
            displayTextField: 'key',
            childrenField: 'children',
            selectType: 'simple-singleAndEmpty',
            elementDdSourceConfig: {
                name: 'kijs.gui.Tree.Test',
                allowMove: false,
                allowCopy: true,
                allowLink: false
            },
            //sortable: true,
            data: [{key:'A1',children:[{key:'A1.1'},{key:'A1.2'},{key:'A1.3'}]}, {key:'A2',children:[{key:'A2.1'},{key:'A2.2'},{key:'A2.3'}]}, {key:'A3'}],
            expandFilters: { field:'key', operator:'IN', value:['A1'] },
            style: {
                flex: 1,
                borderRight: '1px solid var(--panel-borderColor)'
            },
            innerStyle: {
                padding: '4px'
            }
        });


        // TARGET
        this._treeTarget = new kijs.gui.Tree({
            xtype: 'kijs.gui.Tree',
            valueField: 'key',
            displayTextField: 'key',
            childrenField: 'children',
            selectType: 'simple-singleAndEmpty',
            data: [{key:'B1'}, {key:'B2'}, {key:'B3',children:[{key:'B3.1'},{key:'B3.2'},{key:'B3.3'}]}],
            expandFilters: { field:'key', operator:'IN', value:['B3'] },
            style: {
                flex: 1
            },
            innerStyle: {
                padding: '4px'
            },

            // drop zwischen zwei Elemente oder Zuoberst oder Zuunterst
            ddTarget: {
                posBeforeFactor: 0.5,
                posAfterFactor: 0.8,
                on: {
                    drop: this.#onTreeTargetDrop,
                    context: this
                },
                mapping: {
                    'kijs.gui.Tree.Test': {
                        allowMove: false,
                        allowCopy: true,
                        allowLink: false/*,
                        disableMarker: true*/
                    }
                }
            },

            // Drop auf ein Element
            elementDdTargetConfig: {
                posBeforeFactor: 0.5,
                posAfterFactor: 0.8,
                on: {
                    drop: this.#onTreeTargetElementDrop,
                    context: this
                },
                mapping: {
                    'kijs.gui.Tree.Test': {
                        allowMove: false,
                        allowCopy: true,
                        allowLink: false,
                        disableMarker: true
                    }
                }
            }
        });


        // PANEL
        this._content = new kijs.gui.Panel({
            caption: '2x kijs.gui.Tree local mit Drag&Drop von links nach rechts',
            scrollableY: 'auto',
            cls: ['kijs-borderless', 'kijs-flexrowwrap'],
            style: {
                flex: 1
            },
            headerElements: this._getHeaderElements(),
            elements:[
                this._treeSource,
                this._treeTarget
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


    // PRIVATE
    // LISTENERS
    #onTreeTargetDrop(e) {
        if (e.source.name === 'kijs.gui.Tree.Test') {
            let dataRows = [];
            let targetIndex = null;

            let dataRow = kijs.Object.clone(e.source.ownerEl.dataRow);

            // after auf einen geöffneten Ordner: einfügen als 1. Kind
            if (e.target.targetPos === 'after' && e.target.targetEl.expanded) {

                // betroffene dataRows ermitteln
                dataRows = e.target.targetEl.dataRow['children'];

                targetIndex = 0;

                // dataRow bei gewünschtem Index einfügen
                dataRows.splice(targetIndex, 0, dataRow);

            // before oder after
            } else if (e.target.targetPos === 'before' || e.target.targetPos === 'after') {
                // betroffene dataRows ermitteln
                if (e.target.targetEl.parentElement) {
                    dataRows = e.target.targetEl.parentElement.dataRow['children'];
                } else {
                    dataRows = this._treeTarget.data;
                }

                // target index ermitteln
                targetIndex = dataRows.indexOf(e.target.targetEl.dataRow);
                if (e.target.targetPos === 'after') {
                    targetIndex++;
                }

                // dataRow bei gewünschtem Index einfügen
                dataRows.splice(targetIndex, 0, dataRow);

            // child
            } else if (e.target.targetPos === 'child') {
                // betroffene dataRow ermitteln
                dataRows = e.target.targetEl.dataRow['children'];

                dataRows.push(dataRow);

            }

            // neu laden
            this._treeTarget.reload({ noRpc:true });

            // speichern
            if (this._treeTarget.autoSave && this._treeTarget.rpcSaveFn) {
                this._treeTarget.save();
            }
        }
    }

    #onTreeTargetElementDrop(e) {
        if (e.source.name === 'kijs.gui.Tree.Test') {
            let dataRow = kijs.Object.clone(e.source.ownerEl.dataRow);

            // dataRow am Ende anfügen
            if (e.target.ownerEl) {
                if (kijs.isEmpty(e.target.ownerEl.dataRow['children'])) {
                    e.target.ownerEl.dataRow['children'] = [];
                }
                e.target.ownerEl.dataRow['children'].push(dataRow);
            }

            // neu laden
            this._treeTarget.reload({ noRpc:true });

            // speichern
            if (this._treeTarget.autoSave && this._treeTarget.rpcSaveFn) {
                this._treeTarget.save();
            }
        }
    }
    
    

    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct() {
        this._content = null;
    }
    
};
