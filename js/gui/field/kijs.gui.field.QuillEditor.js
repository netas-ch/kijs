/* global kijs, this, quill */

// --------------------------------------------------------------
// kijs.gui.field.QuillEditor
// --------------------------------------------------------------
// WYSIWYG Editor
kijs.gui.field.QuillEditor = class kijs_gui_field_QuillEditor extends kijs.gui.field.Field {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        // overwrite
        this._valuesMapping = {
            name: { valueProperty: 'value', emptyValue: '' }
        };

        this._disabled = false;

        this._quillEditor = null;
        this._quillEditorContainerNode = null;
        this._quillEditorNode = null;

        this._placeholder = '';
        this._theme = 'snow';
        this._value = '';
        this._valueTrimEnable = true;
        this._previousChangeValue = '';

        this._toolbarOptions = [
            ['bold',  'underline', 'strike'],              // toggled buttons
            ['blockquote', 'code-block'],

            [{ header: 1 }, { header: 2 }],                // custom button values
            [{ list: 'ordered'}, { list: 'bullet' }],
            [{ script: 'sub'}, { script: 'super' }],       // superscript/subscript
            [{ indent: '-1'}, { indent: '+1' }],           // outdent/indent
            [{ direction: 'rtl' }],                        // text direction

            [{ size: ['small', false, 'large', 'huge'] }], // custom dropdown
            [{ header: [1, 2, 3, 4, 5, 6, false] }],

            [{ color: [] }, { background: [] }],           // dropdown with defaults from theme
            [{ font: [] }],
            [{ align: [] }],

            ['clean']                                      // remove formatting button
        ];

        // CSS Klasse hinzufügen
        this.dom.clsAdd('kijs-field-quilleditor');

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            // keine
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            placeholder: true,
            theme: true,          // snow (default), bubble
            toolbarOptions : true,
            valueTrimEnable: true // Sollen Leerzeichen am Anfang und Ende des Values automatisch entfernt werden?
        });

        // Listeners
        this.on('input', this.#onInput, this);

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }

        // Listener
        this.on('afterRender', this.#onAfterRender, this);
    }


    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------

    get content() {
        return this._quillEditor.getContents();
    }

    set content(val) {
        this._quillEditor.setContents(val);
    }
    get hasFocus() {
        if (this._quillEditor) {
            return this._quillEditor.hasFocus();
        }
        return false;
    }

    // overwrite
    get isEmpty() { return kijs.isEmpty(this.value); }

    // overwrite
    get readOnly() { return super.readOnly; }
    set readOnly(val) {
        super.readOnly = !!val;
        if (this._quillEditor) {
            this._quillEditor.setReadOnly(!!val);
        }
    }

    get theme() { return this._theme; }
    set theme(val) { this._theme = val; }

    // overwrite
    get value() {
        let val = '';
        if (this._quillEditor) {
            val = this._quillEditor.root.innerHTML;
        } else {
            val = kijs.toString(this._value);
        }
        if (val === '<p><br></p>') {
            val = '';
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
        if (this._quillEditor) {
            this._quillEditor.setContents([]);
            this._quillEditor.clipboard.dangerouslyPasteHTML(0, val);
        }
        this.isDirty = false;
        this._updateClearButtonVisibility();
    }

    get valueTrimEnable() { return this._valueTrimEnable; }
    set valueTrimEnable(val) { this._valueTrimEnable = !!val; }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // overwrite
    changeDisabled(val, callFromParent) {
        super.changeDisabled(!!val, callFromParent);

        this._disabled = !!val;
        if (this._quillEditor) {
            if (this._disabled) {
                this._quillEditor.disable(true);
            } else {
                this._quillEditor.enable(true);
            }
        }
    }

    /**
     * Setzt den Focus auf das Feld. Optional wird der Text selektiert.
     * @param {Boolean} [alsoSetIfNoTabIndex=false]
     * @param {Boolean} [selectText=false]
     * @returns {HTMLElement|false}
     * @overwrite
     */
    focus(alsoSetIfNoTabIndex, selectText) {
        if (this._quillEditor) {
            this._quillEditor.focus();

            if (selectText) {
                this._quillEditor.setSelection(0, this._quillEditor.getLength());
            }

            return this._quillEditorNode.firstChild;

        } else {
            return false;

        }
    }

    // overwrite
    render(superCall) {
        super.render(true);

        // quillEditor erstellen
        if (!this._quillEditor) {

            // dirty?
            const isDirtyBeforeRender = this.isDirty;

            // Container erstellen
            //this._quillEditorContainerNode = document.createElement('div');
            //this._quillEditorContainerNode.className = 'quill-editor-container';

            // Div für Editor erstellen
            this._quillEditorNode = document.createElement('div');
            //this._quillEditorContainerNode.appendChild(this._quillEditorNode);

            //this._inputWrapperDom.node.appendChild(this._quillEditorContainerNode);
            this._inputWrapperDom.node.appendChild(this._quillEditorNode);

            // Editor erstellen
            this._quillEditor = new Quill(this._quillEditorNode, {
                theme: this._theme,
                bounds: this._quillEditorNode,
                placeholder: this._placeholder,
                //readOnly: this.readOnly || this.disabled,
                //scrollingContainer: this._quillEditorContainerNode,
                modules: {
                    toolbar: this._toolbarOptions
                }
            });
            let inputNode = this._quillEditorNode.firstChild;
            //inputNode.tabIndex = 0;
            inputNode.id = this._inputId;

            kijs.Dom.addEventListener('blur', inputNode, this.#onInputNodeBlur, this);

            // Listener setzen und Event weiterleiten
            this._quillEditor.on('text-change', function() { this.raiseEvent('input'); }, this);

            // Inhalt einfügen
            this.value = !kijs.isEmpty(this._value) ? this._value : '';

            // reset isDirty flag
            if (!isDirtyBeforeRender) {
                this.isDirty = false;
            }
        } else {
            this._inputWrapperDom.node.appendChild(this._quillEditorNode);
        }

        // Event afterRender auslösen
        if (!superCall) {
            this.raiseEvent('afterRender');
        }
    }


    // PRIVATE
    // LISTENERS
    #onAfterRender() {
        if (this._disabled) {
            this._quillEditor.disable(true);
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
    destruct(superCall) {
        if (!superCall) {
            // unrendern
            this.unrender(superCall);

            // Event auslösen.
            this.raiseEvent('destruct');
        }

        // Elemente/DOM-Objekte entladen

        // Variablen (Objekte/Arrays) leeren
        this._disabled = null;
        this._quillEditor = null;
        this._quillEditorNode = null;
        this._quillEditorContainerNode = null;
        this._toolbarOptions = null;
        this._value = null;
        this._previousChangeValue = null;

        // Basisklasse entladen
        super.destruct(true);
    }

};
