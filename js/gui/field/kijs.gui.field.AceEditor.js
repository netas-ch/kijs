/* global kijs, this, ace */

// --------------------------------------------------------------
// kijs.gui.field.AceEditor
// --------------------------------------------------------------
/**
 * Editor für Text und Quellcode (Ace) mit Syntax-Hervorhebung je nach mode. Ace muss zusätzlich
 * geladen werden (lib/ace). Der Editor wird beim ersten Rendern erstellt.
 *
 * @example
 * new kijs.gui.field.AceEditor({ label: 'Code', name: 'code', mode: 'json', height: 300 });
 *
 * @fires change  Beim Verlassen des Editors, wenn der Wert geändert hat. e: value, oldValue
 * @fires input  Bei jeder Änderung des Texts (Ace-Event change, ohne Argumente)
 */
kijs.gui.field.AceEditor = class kijs_gui_field_AceEditor extends kijs.gui.field.Field {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        // overwrite
        this._valuesMapping = {
            name: { valueProperty: 'value', emptyValue: '' }
        };

        this._aceEditor = null;
        this._aceEditorNode = null;
        this._listenerDeferId = null;           // verzögertes Erstellen der Listener (siehe render)
        this._mode = 'javascript';
        this._theme = null;
        this._value = '';
        this._valueTrimEnable = true;
        this._virtualKeyboardPolicy = null;     // wird beim Rendern auf den Node angewendet
        this._previousChangeValue = '';

        this._dom.clsAdd('kijs-field-aceeditor');

       // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            mode: true,
            theme: true,
            valueTrimEnable: true,
            virtualKeyboardPolicy: { target: 'virtualKeyboardPolicy' }
        });

        // Listeners
        this.on('afterResize', this.#onAfterResize, this);
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
    get hasFocus() { return !!this._aceEditorNode && this._aceEditorNode.firstChild === document.activeElement; }

    // overwrite
    get isEmpty() { return kijs.isEmpty(this.value); }

    /**
     * Modus für die Syntax-Hervorhebung, z.B. 'javascript', 'json', 'css', 'html', 'php', 'mysql' oder
     * 'plain_text' (weitere siehe lib/ace). Default: 'javascript'
     * @type {String}
     */
    get mode() { 
        return this._mode;
    }
    set mode(val) {
        this._mode = val;
        if (!kijs.isEmpty(val) && this._aceEditor && this._aceEditor.session) {
            this._aceEditor.session.setMode('ace/mode/' + val);
        }
    }

    // overwrite
    get readOnly() { return super.readOnly; }
    set readOnly(val) {
        super.readOnly = !!val;
        if (this._aceEditor) {
            this._aceEditor.setReadOnly(!!val);
        }
    }

    /**
     * Ace-Theme (siehe lib/ace). null = Standard von Ace
     * @type {String|null}
     */
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
        this._updateClearButtonVisibility();
    }

    /**
     * Leerzeichen am Anfang und Ende des Werts automatisch entfernen? Default: true
     * @type {Boolean}
     */
    get valueTrimEnable() { return this._valueTrimEnable; }
    set valueTrimEnable(val) { this._valueTrimEnable = !!val; }

    /**
     * Die virtual keyboard policy bestimmt, ob beim focus die virtuelle
     * Tastatur geöffnet wird ('auto', default) oder nicht ('manual'). (Nur Mobile, Chrome)
     */
    get virtualKeyboardPolicy() {
        return this._aceEditorNode ? this._aceEditorNode.firstChild.virtualKeyboardPolicy : this._virtualKeyboardPolicy;
    }
    set virtualKeyboardPolicy(val) {
        // Der Node existiert erst nach dem Rendern: Wert merken und dort anwenden
        this._virtualKeyboardPolicy = val;
        if (this._aceEditorNode) {
            this._aceEditorNode.firstChild.virtualKeyboardPolicy = val;
        }
    }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // overwrite
    changeDisabled(val, callFromParent) {
        super.changeDisabled(!!val, callFromParent);
        if (this._aceEditor) {
            this._aceEditor.setReadOnly(!!val);
        }
    }

    // overwrite
    clear() {
        this._aceEditor.session.clearAnnotations();
        super.clear();
    }

    /**
     * Setzt den Focus auf das Feld. Optional wird der Text selektiert.
     * @param {Boolean} [alsoSetIfNoTabIndex=false]
     * @param {Boolean} [selectText=false]
     * @returns {undefined}
     * @overwrite
     */
    focus(alsoSetIfNoTabIndex, selectText) {
        if (this._aceEditor) {
            this._aceEditor.focus();
            if (selectText) {
                this._aceEditor.selectAll();
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
            if (!kijs.isEmpty(this._virtualKeyboardPolicy)) {
                inputNode.virtualKeyboardPolicy = this._virtualKeyboardPolicy;
            }

            // Zeitverzögert den Listener erstellen (wird in destruct() abgebrochen)
            this._listenerDeferId = kijs.defer(function() {
                this._listenerDeferId = null;
                if (!this._aceEditor) {
                    return;
                }
                this._aceEditor.on('change', () => { this.raiseEvent('input'); });
                this._aceEditor.getSession().on('changeAnnotation', () => { this.#onAnnotationChange(); });

                kijs.Dom.addEventListener('blur', inputNode, this.#onInputNodeBlur, this);
            }, 200, this);

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

            this._aceEditor.setReadOnly(this.readOnly || this.disabled);

            this.value = this._value ? this._value : '';
        } else {
            this._inputWrapperDom.node.appendChild(this._aceEditorNode);
        }

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
    #onAfterResize(e) {
        if (this._aceEditor) {
            this._aceEditor.resize();
        }
    }

    #onAnnotationChange() {
        if (this._value) {
            this.validate();
        }
    }

    #onInput() {
        this.validate();
        this._updateClearButtonVisibility();
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

        // verzögertes Erstellen der Listener abbrechen
        if (this._listenerDeferId) {
            window.clearTimeout(this._listenerDeferId);
            this._listenerDeferId = null;
        }

        // Elemente/DOM-Objekte entladen (nur falls der Editor gerendert wurde)
        if (this._aceEditorNode) {
            kijs.Dom.removeEventListener('blur', this._aceEditorNode.firstChild, this);
        }
        if (this._aceEditor) {
            this._aceEditor.destroy();
            this._aceEditor.container.remove();
        }

        // Variablen (Objekte/Arrays) leeren
        this._aceEditor = null;
        this._aceEditorNode = null;

        // Basisklasse entladen
        super.destruct(true);
    }

};
