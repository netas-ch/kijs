/* global kijs */

home.test.ContainerStack = class home_test_ContainerStack {
    
    
    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        this._app = config.app;
        this._containerStack = null;
        this._content = null;

        this.__testState = 0;
    }
    
    
    
    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    getContent() {
        this._content = new kijs.gui.Panel({
            caption: 'Test für Container Stack',
            cls: 'kijs-borderless',
            scrollableY: 'auto',
            style: {
                flex: 1
            },
            innerStyle: {
                display: 'flex',
                padding: '10px'
            },
            elements: this._createElements()
        });
        
        return this._content;
    }
    
    
    run() {

    }
    

    // PROTECTED
    _createElements() {
        this._containerStack = new kijs.gui.container.Stack(
            {
                width: 100,
                elements: [
                    {
                        xtype: 'kijs.gui.Container',
                        name: 'container1',
                        elements: [
                            {
                                xtype: 'kijs.gui.Button',
                                iconMap: 'kijs.iconMap.Fa.calendar',
                                caption: 'Button 1',
                                on: {
                                    click: this.#onBtnClick,
                                    context: this
                                }
                            },{
                                xtype: 'kijs.gui.Button',
                                iconMap: 'kijs.iconMap.Fa.calendar',
                                caption: 'Button 2',
                                on: {
                                    click: this.#onBtnClick,
                                    context: this
                                }
                            }
                        ]
                    },{
                        xtype: 'kijs.gui.Container',
                        name: 'container2',
                        elements: [
                            {
                                xtype: 'kijs.gui.Button',
                                iconMap: 'kijs.iconMap.Fa.calendar',
                                caption: 'Button 1',
                                on: {
                                    click: this.#onBtnClick,
                                    context: this
                                }
                            },{
                                xtype: 'kijs.gui.Button',
                                iconMap: 'kijs.iconMap.Fa.calendar',
                                caption: 'Button 2',
                                on: {
                                    click: this.#onBtnClick,
                                    context: this
                                }
                            },{
                                xtype: 'kijs.gui.Button',
                                iconMap: 'kijs.iconMap.Fa.calendar',
                                caption: 'Button 3',
                                on: {
                                    click: this.#onBtnClick,
                                    context: this
                                }
                            },{
                                xtype: 'kijs.gui.Button',
                                iconMap: 'kijs.iconMap.Fa.calendar',
                                caption: 'Button 4',
                                on: {
                                    click: this.#onBtnClick,
                                    context: this
                                }
                            },{
                                xtype: 'kijs.gui.Button',
                                iconMap: 'kijs.iconMap.Fa.calendar',
                                caption: 'Button 5',
                                on: {
                                    click: this.#onBtnClick,
                                    context: this
                                }
                            }
                        ]
                    }
                ]
            }
        );

        return this._containerStack;
    }

    // LISTENERS
    #onBtnClick(e) {
        if (e.raiseElement.parent.name === 'container1') {
            this._containerStack.setCurrentAnimated(this._containerStack.down('container2'), 'slideRight');
        } else {
            this._containerStack.setPreviousAnimated('slideLeft');
        }
        console.log(e);
    }
    
    
    
    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct() {
        this._containerStack = null;
        this._content = null;
    }
    
};
