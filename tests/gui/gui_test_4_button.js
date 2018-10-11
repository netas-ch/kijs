/* global kijs */

// ---------------------------------
// Tests mit kijs.gui.Button
// ---------------------------------
function gui_test_4_button() {
    let tx = new kijs.Test();
    if (tx.hasTests()) {
        alert('Es wurden bereits Tests gemacht! Bitte laden sie die Seite neu.');
        return;
    }

    let testCont = document.createElement('div');
    testCont.className = 'testContainer kijs';
    testCont.innerHTML = '<a class="testContainerCloser" href="javascript:window.location.reload(true)">Reload</a>';
    document.body.appendChild(testCont);


    // --------------------------------------------------------------
    // Testanweisungen
    // --------------------------------------------------------------
    let button = new kijs.gui.Button({
        caption: 'Test Handler Funktion',
        badgeText: 'Hallo',
        style: { marginRight: '4px'},
        on: {
            click: function() {
                window.alert('Klick!');
            }
        }
    });
    button.renderTo(testCont);

    button = new kijs.gui.Button({
        caption: 'Test Context',
        badgeText: 5,
        style: { marginRight: '4px'},
        on: {
            click: function() {
                window.alert(this === document.body ? 'erfolgreich' : 'fehlgeschlagen');
            },
            context: document.body
        }
    });
    button.renderTo(testCont);

    button = new kijs.gui.Button({
        caption: 'isDefault',
        isDefault: true,
        toolTip: 'click to toggle isDefault',
        style: { marginRight: '4px'},
        on: {
            click: function() {
                console.log(this.xtype);
                this.isDefault = !this.isDefault;
            }
        }
    });
    button.renderTo(testCont);
    
    button = new kijs.gui.Button({
        caption: 'Disabled',
        badgeText: '4',
        toolTip: 'click to disable',
        style: { marginRight: '4px'},
        on: {
            click: function() {
                this.disabled = !this.disabled;
            }
        }
    });
    button.renderTo(testCont);
    
    button = new kijs.gui.Button({
        caption: 'Toggle Text',
        style: { marginRight: '4px'},
        on: {
            click: function() {
                if (this.caption === 'Text A') {
                    this.caption = 'Text B';
                } else {
                    this.caption = 'Text A';
                }
            }
        }
    });
    button.renderTo(testCont);


    button = new kijs.gui.Button({
        caption: 'Button with background-image-icon. Klick to hide',
        iconCls: 'icoWizard16',
        style: { marginRight: '4px'},
        on: {
            click: function() {
                this.visible = false;
            }
        }
    });
    button.renderTo(testCont);
    
    
    button = new kijs.gui.Button({
        caption: 'Create icon after render',
        style: { marginRight: '4px'},
        on: {
            click: function() {
                this.__testState = this.__testState || 0;
                switch (this.__testState) {
                    case 0:
                        this.icon = { iconChar: null, iconCls: 'icoWizard16' };
                        break;
                        
                    case 1:
                        this.icon = { iconChar: '&#xf02f', iconCls: null };
                        break;
                        
                    case 2:
                        this.icon = new kijs.gui.Icon({ iconChar: '&#xf164', iconCls: null });
                        break;
                        
                    case 3:
                        this.iconChar = null;
                        this.iconCls = 'icoWizard16';
                        this.caption = null;
                        break;
                        
                    case 4:
                        this.iconChar = '&#xf02f';
                        this.iconCls = null;
                        break;
                        
                    case 5:
                        this.iconChar = 'x';
                        this.iconCls = 'icoWizard16';
                        break;
                        
                    case 6:
                        this.caption = 'click to toggle icon';
                        this.icon = null;
                        break;
                }
                this.__testState++;
                if (this.__testState > 6) {
                    this.__testState = 0;
                }
            }
        }
    });
    button.renderTo(testCont);
    
    
    button = new kijs.gui.Button({
        caption: 'Button with font-icon. Klick to rotate',
        iconChar: '&#xf01a;',
        on: {
            click: function() {
                this.icon.dom.clsToggle('kijs-spin');
            }
        }
    });
    
    button.renderTo(testCont);

}

