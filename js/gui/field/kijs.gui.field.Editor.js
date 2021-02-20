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
        this._mode = 'javascript';
        this._theme = null;
        this._value = null;
        this._oldValue = null;

        this._dom.clsAdd('kijs-field-editor');

       // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            mode: true,          // 'javascript' (Default), 'json', 'css', 'html', 'php', 'mysql', 'plain_text' (weitere siehe Ordner kijs\lib\ace)
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
        if (this._aceEditor) {
            if (val || this._dom.clsHas('kijs-disabled')) {
                this._aceEditor.setReadOnly(true);
            } else {
                this._aceEditor.setReadOnly(false);
            }
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
        if (this._aceEditor) {
            this._aceEditor.setReadOnly(!!val);
        }
    }

    get theme() { return this._theme; }
    set theme(val) { this._theme = val; }

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
            if (!val) {
                val = '';
            }
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
            let inputNode = this._aceEditorNode.firstChild;
            inputNode.id = this._inputId;

            // Zeitverzögert den Listener erstellen
            kijs.defer(function() {
                this._aceEditor.on('change', () => { this.raiseEvent('input'); });
                this._aceEditor.getSession().on('changeAnnotation', () => { this._onAnnotationChange() });

                kijs.Dom.addEventListener('focus', inputNode, this._onInputNodeFocus, this);
                kijs.Dom.addEventListener('blur', inputNode, this._onInputNodeBlur, this);
            }, 200, this);
        } else {
            this._inputWrapperDom.node.appendChild(this._aceEditorNode);
        }

        this._aceEditor.setHighlightActiveLine(false);
        //this._aceEditor.$blockScrolling = Infinity;

        if (this._theme) {
            this._aceEditor.setTheme('ace/theme/' + this._theme);
        }
        if (this._mode) {
            this._aceEditor.session.setMode('ace/mode/' + this._mode);
        }

        this.value = this._value ? this._value : '';
        this._aceEditor.setReadOnly(this.readOnly || this.disabled);

        // Event afterRender auslösen
        if (!superCall) {
            this.raiseEvent('afterRender');
        }
    }


    // LISTENERS
    _onAnnotationChange() {
        if (this._value) {
            this.validate();
        }
    }

    _onInput() {
        this.validate();
    }

    _onInputNodeFocus() {
        this._oldValue = this._value;
    }

    _onInputNodeBlur() {
        if (this.value !== this._oldValue) {
            this._oldValue = this.value;
            this.raiseEvent('change', {value: this.value});
        }
    }

    // PROTECTED
    // overwrite
    _validationRules(value) {
        super._validationRules(value);

        // Fehler des Editors auch übernehmen
        if (this._aceEditor) {
            const annot = this._aceEditor.session.getAnnotations();
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

        kijs.Dom.removeEventListener('change', this._aceEditorNode.firstChild, this);

        // Elemente/DOM-Objekte entladen
        this._aceEditor.destroy();
        this._aceEditor.container.remove();

        // Variablen (Objekte/Arrays) leeren
        this._aceEditor = null;
        this._aceEditorNode = null;
        this._mode = null;
        this._theme = null;
        this._value = null;
        this._oldValue = null;

        // Basisklasse entladen
        super.destruct(true);
    }
};
