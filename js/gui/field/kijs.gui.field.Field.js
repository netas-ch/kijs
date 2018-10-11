/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.field.Field (Abstract)
// --------------------------------------------------------------
kijs.gui.field.Field = class kijs_gui_field_Field extends kijs.gui.Container {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);
        
        this._labelHide = false;
        
        this._inputId = kijs.uniqId('kijs_-_input_');
        
        this._inputWrapperDom = new kijs.gui.Dom({
            cls: 'kijs-inputwrapper'
        });
        
        this._labelDom = new kijs.gui.Dom({
            cls: 'kijs-label',
            nodeTagName: 'label',
            nodeAttribute: {
                htmlFor: this._inputId
            }
        });
        
        this._spinIconEl = new kijs.gui.Icon({
            parent: this,
            iconChar: '&#xf0d7',
            cls: 'kijs-icon-spindown',
            visible: false
        });
        
        this._errorIconEl = new kijs.gui.Icon({
            parent: this,
            iconChar: '&#xf05a',
            cls: 'kijs-icon-error',
            toolTip: new kijs.gui.ToolTip({ cls: 'kijs-error' }),
            visible: false
        });
        
        this._errors = [];
        
        this._helpIconEl = new kijs.gui.Icon({
            parent: this,
            iconChar: '&#xf059',
            cls: 'kijs-icon-help',
            toolTip: new kijs.gui.ToolTip({ cls: 'kijs-help' }),
            visible: false
        });
        
        this._spinBoxEl = null;
        /*this._spinBoxEl = new kijs.gui.SpinBox({
            target: this,
            targetDomProperty: 'inputWrapperDom',
            ownerNodes: [this._inputWrapperDom, this._spinIconEl.dom],
            openOnInput: true,
            style: {
                padding: '10px'
            },
            html: 'XXXX<br>XXXX<br><br><br><br>XX<br>XX<br>XXX<br><br>XXX<br>XX<br><br>XXXXXXXX'
        });*/
        
        this._maxLength = null;
        this._required = false;


        this._dom.clsRemove('kijs-container');
        this._dom.clsAdd('kijs-field');

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            disabled: { target: 'disabled' },   // deaktiviert das Feld mit den Buttons (siehe auch readOnly)
            
            label: { target: 'html', context: this._labelDom },
            labelCls: { fn: 'function', target: this._labelDom.clsAdd, context: this._labelDom },
            labelHide: true,
            labelHtmlDisplayType: { target: 'htmlDisplayType', context: this._labelDom },
            labelStyle: { fn: 'assign', target: 'style', context: this._labelDom },
            labelWidth: { target: 'labelWidth' },
            value: { target: 'value' },
            
            errorIcon: { target: 'errorIcon' },
            errorIconChar: { target: 'errorIconChar', context: this._errorIconEl },
            errorIconCls: { target: 'errorIconCls', context: this._errorIconEl },
            errorIconColor: { target: 'errorIconColor', context: this._errorIconEl },

            helpIcon: { target: 'helpIcon' },
            helpIconChar: { target: 'helpIconChar', context: this._helpIconEl },
            helpIconCls: { target: 'helpIconCls', context: this._helpIconEl },
            helpIconColor: { target: 'helpIconColor', context: this._helpIconEl },
            
            helpText: { target: 'helpText' },
            
            maxLength: true,
            readOnly: { target: 'readOnly' },   // deaktiviert das Feld, die Buttons bleiben aber aktiv (siehe auch disabled)
            required: true,
            
            spinIcon: { target: 'spinIcon' },
            spinIconChar: { target: 'iconChar', context: this._spinIconEl },
            spinIconCls: { target: 'iconCls', context: this._spinIconEl },
            spinIconColor: { target: 'iconColor', context: this._spinIconEl },
            spinIconVisible: { target: 'visible', context: this._spinIconEl }
        });
        
        // Listeners
        this._spinIconEl.on('click', this._onSpinButtonClick, this);
        
        //this.on('keyDown', function() { console.log('keyDown Field'); }, this);
        
        // Config anwenden
        if (kijs.isObject(config)) {
            this.applyConfig(config, true);
        }
    }


    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get disabled() { return this._dom.clsHas('kijs-disabled'); }
    set disabled(val) {
        if (val) {
            this._dom.clsAdd('kijs-disabled');
        } else {
            this._dom.clsRemove('kijs-disabled');
        }
        
        // Icons auch aktivieren/deaktivieren
        this._spinIconEl.disabled = val;
        this._errorIconEl.disabled = val;
        this._helpIconEl.disabled = val;
        
        // Buttons auch aktivieren/deaktivieren
        const buttons = this.getElementsByXtype('kijs.gui.Button', 1);
        kijs.Array.each(buttons, function(button) {
            button.disabled = val;
        }, this);
    }

    get errorIcon() { return this._errorIconEl; }
    /**
     * Icon zuweisen
     * @param {kijs.gui.Icon|Object} val     Icon als icon-Config oder kijs.gui.Icon Element
     */
    set errorIcon(val) {
        // Icon zurücksetzen?
        if (kijs.isEmpty(val)) {
            this._errorIconEl.iconChar = null;
            this._errorIconEl.iconCls = null;
            this._errorIconEl.iconColor = null;
            if (this.isRendered) {
                this.render();
            }
            
        // kijs.gui.Icon Instanz
        } else if (val instanceof kijs.gui.Icon) {
            this._errorIconEl.destruct();
            this._errorIconEl = val;
            if (this.isRendered) {
                this.render();
            }
            
        // Config Objekt
        } else if (kijs.isObject(val)) {
            this._errorIconEl.applyConfig(val);
            if (this.isRendered) {
                this.render();
            }
            
        } else {
            throw new Error(`config "errorIcon" is not valid.`);
            
        }
    }
    
    get errorIconChar() { return this._errorIconEl.iconChar; }
    set errorIconChar(val) { 
        this._errorIconEl.iconChar = val;
        if (this.isRendered) {
            this.render();
        }
    }

    get errorIconCls() { return this._errorIconEl.iconCls; }
    set errorIconCls(val) {
        this._errorIconEl.iconCls = val;
        if (this.isRendered) {
            this.render();
        }
    }
    
    get errorIconColor() { return this._errorIconEl.iconColor; }
    set errorIconColor(val) {
        this._errorIconEl.iconColor = val;
        if (this.isRendered) {
            this.render();
        }
    }
    
    
    get helpIcon() { return this._helpIconEl; }
    /**
     * Icon zuweisen
     * @param {kijs.gui.Icon|Object} val     Icon als icon-Config oder kijs.gui.Icon Element
     */
    set helpIcon(val) {
        // Icon zurücksetzen?
        if (kijs.isEmpty(val)) {
            this._helpIconEl.iconChar = null;
            this._helpIconEl.iconCls = null;
            this._helpIconEl.iconColor = null;
                        
        // kijs.gui.Icon Instanz
        } else if (val instanceof kijs.gui.Icon) {
            this._helpIconEl.destruct();
            this._helpIconEl = val;
            if (this.isRendered) {
                this.render();
            }
            
        // Config Objekt
        } else if (kijs.isObject(val)) {
            this._helpIconEl.applyConfig(val);
            if (this.isRendered) {
                this._helpIconEl.render();
            }
            
        } else {
            throw new Error(`config "helpIcon" is not valid.`);
            
        }
    }
    
    get helpIconChar() { return this._helpIconEl.iconChar; }
    set helpIconChar(val) { 
        this._helpIconEl.iconChar = val;
    }

    get helpIconCls() { return this._helpIconEl.iconCls; }
    set helpIconCls(val) {
        this._helpIconEl.iconCls = val;
    }
    
    get helpIconColor() { return this._helpIconEl.iconColor; }
    set helpIconColor(val) {
        this._helpIconEl.iconColor = val;
        if (this.isRendered) {
            this.render();
        }
    }
    
    get helpText() { return this._helpIconEl.toolTip.html; }
    set helpText(val) {
        this._helpIconEl.toolTip = val;
        this._helpIconEl.visible = !kijs.isEmpty(this._helpIconEl.toolTip.html);
    }

    get inputWrapperDom() { return this._inputWrapperDom; }
    
    get label() { return this._labelDom.html; }
    set label(val) { 
        this._labelDom.html = val; 
    }
    
    get labelHide() { return this._labelHide; }
    set labelHide(val) { 
        this._labelHide = val;
        if (this.isRendered) {
            if (val) {
                this._labelDom.renderTo(this._dom.node, this._inputWrapperDom.node);
            } else {
                this._labelDom.unRender();
            }
        }
    }
    
    get labelDom() { return this._labelDom; }

    get labelHtmlDisplayType() { return this._labelDom.htmlDisplayType; }
    set labelHtmlDisplayType(val) { this._labelDom.htmlDisplayType = val; }

    get labelWidth() { return this._labelDom.width; }
    set labelWidth(val) { this._labelDom.width = val; }
    
    get readOnly() { return this._dom.clsHas('kijs-readonly'); }
    set readOnly(val) {
        if (val) {
            this._dom.clsAdd('kijs-readonly');
        } else {
            this._dom.clsRemove('kijs-readonly');
        }
    }
    
    /**
     * Berechnet die Höhe für die spinBox
     * @returns {Number}
     */
    get spinBoxHeight() {
        return this._inputWrapperDom.height;
    }
    
    /**
     * Berechnet die Breite für die spinBox
     * @returns {Number}
     */
    get spinBoxWidth() {
        let width = this._inputWrapperDom.width;
        if (this._spinIconEl.visible) {
            width += this._spinIconEl.width;
        }
        return width;
    }
    
    get spinIcon() { return this._spinIconEl; }
    /**
     * Button zuweisen
     * @param {kijs.gui.Button|Object} val     Button als icon-Config oder kijs.gui.Button Element
     */
    set spinIcon(val) {
        // Button zurücksetzen?
        if (kijs.isEmpty(val)) {
            this._spinIconEl.iconChar = null;
            this._spinIconEl.iconCls = null;
            this._spinIconEl.iconColor = null;
            if (this.isRendered) {
                this.render();
            }
            
        // kijs.gui.Button Instanz
        } else if (val instanceof kijs.gui.Button) {
            this._spinIconEl.destruct();
            this._spinIconEl = val;
            if (this.isRendered) {
                this.render();
            }
            
        // Config Objekt
        } else if (kijs.isObject(val)) {
            this._spinIconEl.applyConfig(val);
            if (this.isRendered) {
                this.render();
            }
            
        } else {
            throw new Error(`config "spinIcon" is not valid.`);
            
        }
    }
    
    get spinIconChar() { return this._spinIconEl.iconChar; }
    set spinIconChar(val) { 
        this._spinIconEl.iconChar = val;
        if (this.isRendered) {
            this.render();
        }
    }

    get spinIconCls() { return this._spinIconEl.iconCls; }
    set spinIconCls(val) {
        this._spinIconEl.iconCls = val;
        if (this.isRendered) {
            this.render();
        }
    }
    
    get spinIconColor() { return this._spinIconEl.iconColor; }
    set spinIconColor(val) {
        this._spinIconEl.iconColor = val;
        if (this.isRendered) {
            this.render();
        }
    }
    
    get spinIconVisible() { return !!this._spinIconEl.visible; }
    set spinIconVisible(val) { 
        this._spinIconEl.visible = !!val;
        if (this.isRendered) {
            this.render();
        } }
    
    // Muss überschrieben werden
    get value() { return null; }
    set value(val) {}


    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    /**
     * Fügt Fehler aus einer externen Validation hinzu
     * @param {String|Array} errors
     */
    addValidateErrors(errors) {
        if (!errors) {
            return;
        }

        if (!kijs.isArray(errors)) {
            errors = [errors];
        }

        this._errors = this._errors.concat(errors);

        // Fehler anzeigen, falls vorhanden
        this._displayErrors();
    }

    // overwrite
    render(preventAfterRender) {
        // dom mit elements rendern (innerDom)
        super.render(true);
        
        // Label rendern (kijs.guiDom)
        if (!this._labelHide) {
            this._labelDom.renderTo(this._dom.node, this._innerDom.node);
        } else {
            this._labelDom.unRender();
        }
        
        // InputWrapper rendern (kijs.guiDom)
        this._inputWrapperDom.renderTo(this._dom.node, this._innerDom.node);
        
         // Spin icon rendern (kijs.gui.Icon)
        this._spinIconEl.renderTo(this._dom.node, this._innerDom.node);
        
        // Help icon rendern (kijs.gui.Icon)
        this._helpIconEl.renderTo(this._dom.node);
        
        // Error icon rendern (kijs.gui.Icon)
        this._errorIconEl.renderTo(this._dom.node);
        
        // Event afterRender auslösen
        if (!preventAfterRender) {
            this.raiseEvent('afterRender');
        }
    }


    // overwrite
    unRender() {
        this._labelDom.unRender();
        this._inputWrapperDom.unRender();
        if (this._spinBox) {
            this._spinBox.unRender();
        }
        this._spinIconEl.unRender();
        this._errorIconEl.unRender();
        this._helpIconEl.unRender();
        super.unRender();
    }

    /**
     * Validiert den Inhalt des Felds
     * @returns {Boolean}
     */
    validate() {
        this._errors = [];

        // Validierungen anwenden
        this._validationRules(this.value);
        
        // Fehler anzeigen, falls vorhanden
        this._displayErrors();
        
        return kijs.isEmpty(this._errors);
    }


    // PROTECTED
    /**
     * Zeigt die Fehler aus this._errors im errorIcon an
     * @returns {undefined}
     */
    _displayErrors() {
        if (!kijs.isEmpty(this._errors)) {
            this._dom.clsAdd('kijs-error');
            this._errorIconEl.toolTip = this._errors;
            this._errorIconEl.visible = true;
        } else {
            this._dom.clsRemove('kijs-error');
            this._errorIconEl.visible = false;
        }
    }
    
   /**
     * Diese Funktion ist zum Überschreiben gedacht
     * @param {type} value
     * @returns {undefined}
     */
    _validationRules(value) {

        // Eingabe erforderlich
        if (this._required) {
            if (kijs.isEmpty(value)) {
                this._errors.push('Dieses Feld darf nicht leer sein');
            }
        }

        // Maximale Länge
        if (!kijs.isEmpty(this._maxLength)) {
            if (!kijs.isEmpty(value) && value.length > this._maxLength) {
                this._errors.push('Dieses Feld darf maximal ' + this._maxLength + ' Zeichen enthalten');
            }
        }
    }
    
    
    // LISTENERS
    _onSpinButtonClick(e) {
        if (this._spinBoxEl) {
            if (this._spinBoxEl.isRendered) {
                this._spinBoxEl.close();
            } else {
                this._spinBoxEl.show();
            }
        }
    }
    
    
    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(preventDestructEvent) {
        // Event auslösen.
        if (!preventDestructEvent) {
            this.raiseEvent('destruct');
        }
        
        // Elemente/DOM-Objekte entladen
        if (this._labelDom) {
            this._labelDom.destruct();
        }
        if (this._inputWrapperDom) {
            this._inputWrapperDom.destruct();
        }
        if (this._spinBoxEl) {
            this._spinBoxEl.destruct();
        }
        if (this._spinIconEl) {
            this._spinIconEl.destruct();
        }
        if (this._errorIconEl) {
            this._errorIconEl.destruct();
        }
        if (this._helpIconEl) {
            this._helpIconEl.destruct();
        }
            
        // Variablen (Objekte/Arrays) leeren
        this._errors = null;
        this._labelDom = null;
        this._inputWrapperDom = null;
        this._spinBoxEl = null;
        this._spinIconEl = null;
        this._errorIconEl = null;
        this._helpIconEl = null;
        this._value = null;
        
        // Basisklasse entladen
        super.destruct(true);
    }
};
