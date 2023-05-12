/* global kijs, this, ace */

// --------------------------------------------------------------
// kijs.gui.field.AceEditor
// --------------------------------------------------------------
// Text/Sourcecode Editor
kijs.gui.field.AceEditor = class kijs_gui_field_AceEditor extends kijs.gui.field.Field {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        this._aceEditor = null;
        this._aceEditorNode = null;
        this._mode = 'javascript';
        this._theme = null;
        this._value = '';
        this._valueTrimEnable = true;
        this._previousChangeValue = '';

        this._dom.clsAdd('kijs-field-aceeditor');

       // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            mode: true,          // 'javascript' (Default), 'json', 'css', 'html', 'php', 'mysql', 'plain_text' (weitere siehe Ordner kijs\lib\ace)
            theme: true,         // (siehe Ordner kijs\lib\ace)
            valueTrimEnable: true // Sollen Leerzeichen am Anfang und Ende des Values automatisch entfernt werden?
        });

        // Listeners
        this.on('input', this.#onInput, this);

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }
    }



    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get hasFocus() { return this._aceEditorNode.firstChild === document.activeElement; }

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
    set theme(val) {
        this._theme = val;
        if (this._aceEditor) {
            this._aceEditor.setTheme('ace/theme/' + val);
        }
    }

    // overwrite
    get value() {
        let val = '';
        if (this._aceEditor) {
            val = this._aceEditor.getValue();
        } else {
            val = kijs.toString(this._value);
        }
        if (this._valueTrimEnable) {
            val = val.trim();
        }
        return val;
    }
    set value(val) {
        val = kijs.toString(val);
        this._value = val;
        this._previousChangeValue = val;
        if (this._aceEditor) {
            this._aceEditor.setValue(val, 1);
        }
    }

    get valueTrimEnable() { return this._valueTrimEnable; }
    set valueTrimEnable(val) { this._valueTrimEnable = !!val; }

    /**
     * Die virtual keyboard policy bestimmt, ob beim focus die virtuelle
     * Tastatur geöffnet wird ('auto', default) oder nicht ('manual'). (Nur Mobile, Chrome)
     */
    get virtualKeyboardPolicy() {
        return this._aceEditorNode.firstChild.virtualKeyboardPolicy;
    }
    set virtualKeyboardPolicy(val) {
        this._aceEditorNode.firstChild.virtualKeyboardPolicy = val;
    }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // overwrite
    changeDisabled(val, callFromParent) {
        super.changeDisabled(!!val, callFromParent);
        this._aceEditor.setReadOnly(!!val);
    }

    /**
     * Setzt den Focus auf das Feld. Optional wird der Text selektiert.
     * @param {Boolean} [alsoSetIfNoTabIndex=false]
     * @param {Boolean} [selectText=false]
     * @returns {undefined}
     * @overwrite
     */
    focus(alsoSetIfNoTabIndex, selectText) {
        let nde = this._aceEditorNode && this._aceEditorNode.firstChild ?
                this._aceEditorNode.firstChild : null;

        if (nde) {
            if (alsoSetIfNoTabIndex) {
                nde.focus();
                if (selectText) {
                    nde.select();
                }
                return nde;
            }
        }
        return false;
    }

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
                this._aceEditor.getSession().on('changeAnnotation', () => { this.#onAnnotationChange() });

                kijs.Dom.addEventListener('blur', inputNode, this.#onInputNodeBlur, this);
            }, 200, this);
        } else {
            this._inputWrapperDom.node.appendChild(this._aceEditorNode);
        }

        this._aceEditor.setHighlightActiveLine(false);
        //this._aceEditor.$blockScrolling = Infinity;

        if (this._theme) {
            this._aceEditor.setTheme('ace/theme/' + this._theme);
        } else {
            if (kijs.Dom.themeGet() === 'dark') {
                this._aceEditor.setTheme('ace/theme/ambiance');
            } else {
                this._aceEditor.setTheme('');
            }
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


    // PROTECTED
    // overwrite
    _validationRules(value, ignoreEmpty) {
        if (ignoreEmpty && kijs.isEmpty(value)) {
            return;
        }

        super._validationRules(value, ignoreEmpty);

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


    // PRIVATE
    // LISTENERS
    #onAnnotationChange() {
        if (this._value) {
            this.validate();
        }
    }

    #onInput() {
        this.validate();
    }


    #onInputNodeBlur() {
        if (this.value !== this._previousChangeValue) {
            this.raiseEvent('change', { value: this.value, oldValue: this._previousChangeValue });
            this._previousChangeValue = this.value;
        }
    }



    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    // overwrite
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

        // Basisklasse entladen
        super.destruct(true);
    }

};
