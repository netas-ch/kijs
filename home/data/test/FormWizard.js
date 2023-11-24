/* global kijs */

home.test.FormWizard = class home_test_FormWizard {
    
    
    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        this._app = config.app;
        
        this._formPanel = null;
        this._containerStack = null;
        this._btnPrevious = null;
        this._btnNext = null;
    }
    
    
    
    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    getContent() {
        
        // ContainerStack
        this._containerStack = new kijs.gui.container.Stack({
            xtype: 'kijs.gui.container.Stack',
            style: { flex: 1 },
            animation: 'fade',
            currentName: 's1',
            on: {
                // Schaltfläche Weiter/Zurück aktivieren/deaktivieren
                change: this.#onContainerStackChange,
                context: this
            },
            elements: [
                { 
                    xtype: 'kijs.gui.Panel',
                    name:'s1', 
                    caption: 'Seite 1',
                    cls: 'kijs-flexform',
                    scrollableY: 'auto',
                    innerStyle: { padding:'10px' },
                    elements:[
                        {
                            xtype: 'kijs.gui.field.Text',
                            name: 'field1',
                            label: 'mein Feld 1',
                            required: true
                        }
                    ]
                },{ 
                    xtype: 'kijs.gui.Panel',
                    name:'s2', 
                    caption: 'Seite 2',
                    cls: 'kijs-flexform',
                    scrollableY: 'auto',
                    innerStyle: { padding:'10px' },
                    elements:[
                        {
                            xtype: 'kijs.gui.field.Text',
                            name: 'field2',
                            label: 'mein Feld 2',
                            required: true
                        }
                    ]
                },{ 
                    xtype: 'kijs.gui.Panel',
                    name:'s3', 
                    caption: 'Seite 3',
                    cls: 'kijs-flexform',
                    scrollableY: 'auto',
                    innerStyle: { padding:'10px' },
                    elements:[
                        {
                            xtype: 'kijs.gui.field.Text',
                            name: 'field3',
                            label: 'mein Feld 3',
                            required: true
                        }
                    ]
                }
            ]
        });
        
        // Schaltfläche zurück
        this._btnPrevious = new kijs.gui.Button({
            caption: 'zurück',
            iconMap: 'kijs.iconMap.Fa.circle-chevron-left',
            disabled: true,
            on: {
                click: this.#onBtnPreviousClick,
                context: this
            }
        });

        // Schaltfläche weiter
        this._btnNext = new kijs.gui.Button({
            caption: 'weiter',
            iconMap: 'kijs.iconMap.Fa.circle-chevron-right',
            on: {
                click: this.#onBtnNextClick,
                context: this
            }
        });
        
        // FormPanel
        this._formPanel = new kijs.gui.FormPanel({
            cls: 'kijs-flexcolumn',
            rpcSaveFn: 'form.save',
            style: {
                flex: 1
            },
            elements:[
                this._containerStack
            ],
            footerElements:[
                this._btnPrevious,
                this._btnNext
            ]
        });
        
        return this._formPanel;
    }

    
    // PROTECTED
    // Sucht alle Felder in einem Container und gibt sie als Array zurück
    // (rekursiv)
    _searchFieldsInContainer(parent) {
        let fields = [];

        for (let i=0; i<parent.elements.length; i++) {
            let el = parent.elements[i];

            // field
            if (el instanceof kijs.gui.field.Field && !kijs.isEmpty(el.name)) {
                fields.push(el);
                
            // container
            } else if (el instanceof kijs.gui.Container) {
                fields = fields.concat(this._searchFieldsInContainer(el));

            }
        }

        return fields;
    }
    
    // Validiert die Felder in einem Container
    _validateContainerFields(containerEl) {
        let ret = true;
        
        const fields = this._searchFieldsInContainer(containerEl);
        
        for (let i=0; i<fields.length; i++) {
            if (!fields[i].validate()) {
                ret = false;
            }
        }

        return ret;
    }
    
    
    // PRIVATE
    // Listeners
    
    // Schaltflächge Weiter click
    #onBtnNextClick(e) {
        const curContainer = this._containerStack.elements[this._containerStack.currentIndex];
        let i = this._containerStack.currentIndex;
        
        const isLastEl = i === this._containerStack.elements.length-1;
        
        // Validierung ok
        if (this._validateContainerFields(curContainer)) {
            if (isLastEl) {
                // Weiter Schaltfläche deaktivieren, damit nicht nochmal geklickt werden kann
                this._btnNext.disabled = false;
                
                // Speichern
                this._formPanel.save().then((e) => {
                    // alles ok
                    if (kijs.isEmpty(e.errorType)) {
                        kijs.gui.CornerTipContainer.show('Titel', 'Daten wurden verschickt!');
                        
                    // nicht alles ok
                    } else {
                        // Weiter Schaltfläche wieder aktivieren
                        this._btnNext.disabled = false;
                        
                    }
                });
                
                
            } else {
                i++;
                this._containerStack.setCurrentAnimated(i).then((e) => {
                    // animation fertig
                    // Fokus auf 1. Feld
                    this._containerStack.currentEl.focus();
                });
            }
            
        // Validierung fehlerhaft
        } else {
            // MsgBox anzeigen
            kijs.gui.MsgBox.errorNotice('Titel', 'Es wurden noch nicht alle Felder richtig ausgefüllt!');
            // oder CornerTipContainer
            //kijs.gui.CornerTipContainer.show('Titel', 'Es wurden noch nicht alle Felder richtig ausgefüllt!', 'errorNotice');
            
        }
    }
    
    // Schaltflächge Zurück click
    #onBtnPreviousClick(e) {
        let i = this._containerStack.currentIndex;
        
        i--;
        if (i < 0) {
            i = this._containerStack.elements.length - 1;
        }
        this._containerStack.setCurrentAnimated(i).then((e) => {
            // animation fertig
            // Fokus auf 1. Feld
            this._containerStack.currentEl.focus();
        });
    }
    
    // Wechseln des aktiven Containers 
    // (Schaltfläche Weiter/Zurück aktivieren/deaktivieren)
    #onContainerStackChange(e) {
        const isFirstEl = e.currentEl === this._containerStack.elements[0];
        const isLastEl = e.currentEl === this._containerStack.elements[this._containerStack.elements.length-1];

        this._btnPrevious.disabled = isFirstEl;
        
        this._btnNext.caption = isLastEl ? 'abschliessen' : 'weiter';
    }

    

    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct() {
        this._formPanel = null;
        this._containerStack = null;
        this._btnPrevious = null;
        this._btnNext = null;
    }
    
};