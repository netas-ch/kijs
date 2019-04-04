/* global kijs, this, ace */

// --------------------------------------------------------------
// kijs.gui.field.Editor
// --------------------------------------------------------------
kijs.gui.field.Editor = class kijs_gui_field_Editor extends kijs.gui.field.Field {

    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);
        
        this._aceEditor = null;
        this._aceEditorNode = null;
        this._mode = null;
        this._theme = null;
        this._value = null;
        
        this._dom.clsAdd('kijs-field-editor');
       
       // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            mode: true,          // 'javascript', 'json', 'css', 'html', 'php', 'mysql', 'plain_text' (weitere siehe Ordner kijs\lib\ace)
            theme: true          // (siehe Ordner kijs\lib\ace)
        });
        
        // Listeners
        this.on('input', this._onInput, this);
        
        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }
    }
    
    
    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    // overwrite
    get disabled() { return super.disabled; }
    set disabled(val) {
        super.disabled = !!val;
        if (val || this._dom.clsHas('kijs-readonly')) {
            this._aceEditor.setReadOnly(true);
        } else {
            this._aceEditor.setReadOnly(false);
        }
    }
    
    // overwrite
    get isEmpty() { return kijs.isEmpty(this.value); }
    
    get mode() { return this._mode; }
    set mode(val) { this._mode = val; }
    
    // overwrite
    get readOnly() { return super.readOnly; }
    set readOnly(val) {
        super.readOnly = !!val;
        if (val || this._dom.clsHas('kijs-disabled')) {
            this._aceEditor.setReadOnly(true);
        } else {
            this._aceEditor.setReadOnly(false);
        }
    }
    
    get theme() { return this._theme; }
    set theme(val) { this._theme = val; }
    
    get trimValue() { return this._trimValue; }
    set trimValue(val) { this._trimValue = val; }
    
    // overwrite
    get value() {
        if (this._aceEditor) {
            return this._aceEditor.getValue();
        } else {
            return this._value;
        }
    }
    set value(val) { 
        this._value = val;
        if (this._aceEditor) {
            this._aceEditor.setValue(val, 1);
        }
    }


    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // overwrite
    render(superCall) {
        super.render(true);
        
        // aceEditor erstellen
        if (!this._aceEditor) {
            this._aceEditorNode = document.createElement('div');
            this._inputWrapperDom.node.appendChild(this._aceEditorNode);
            
            this._aceEditor = ace.edit(this._aceEditorNode);
            this._inputNode = this._aceEditorNode.firstChild;
            this._inputNode.id = this._inputId;

            // Zeitverzögert den Listener erstellen
            kijs.defer(function() {
                var _this = this;
                this._aceEditor.getSession().on('change', function() {
                    _this.raiseEvent(['input', 'change']);
                });
            }, 200, this);
        }
        
        this._aceEditor.setHighlightActiveLine(false);
        //this._aceEditor.$blockScrolling = Infinity;

        if (this._theme) {
            this._aceEditor.setTheme('ace/theme/' + this._theme);
        }
        if (this._mode) {
            this._aceEditor.session.setMode('ace/mode/' + this._mode);
        }

        this.value = this._value;
        
        // Event afterRender auslösen
        if (!superCall) {
            this.raiseEvent('afterRender');
        }
    }
    

    // LISTENERS
    _onInput(e) {
        this.validate();
    }
    
    // PROTECTED
    // overwrite
    _validationRules(value) {
        super._validationRules(value);

        // Fehler des Editors auch übernehmen
        if (this._aceEditor) {
            const annot = this._aceEditor.getSession().getAnnotations();
            for (let key in annot) {
                if (annot.hasOwnProperty(key)) {
                    this._errors.push("'" + annot[key].text + "'" + ' in Zeile ' + (annot[key].row+1));
                }
            }
        }
    }


    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(superCall) {
        if (!superCall) {
            // unrendern
            this.unrender(superCall);

            // Event auslösen.
            this.raiseEvent('destruct');
        }
        
        // Elemente/DOM-Objekte entladen
            
        // Variablen (Objekte/Arrays) leeren
        this._aceEditor = null;
        this._aceEditorNode = null;

        // Basisklasse entladen
        super.destruct(true);
    }
};