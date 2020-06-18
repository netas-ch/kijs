/* global kijs, this, quill */

// --------------------------------------------------------------
// kijs.gui.field.QuillEditor
// --------------------------------------------------------------
/**
 * TextEditor
 *
 *
 *
 *
 *
 *
 */
kijs.gui.field.QuillEditor = class kijs_gui_field_QuillEditor extends kijs.gui.field.Field {

    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        this._disabled = false;
        this._quillEditor = null;
        this._quillEditorNode = null;
        this._readOnly = false;
        this._theme = 'snow';
        this._value = null;
        this._oldValue = null;
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

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            cls: 'kijs-field-quilleditor'
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            disabled: true,
            readOnly: true,
            theme: true,          // snow (default), bubble
            toolbarOptions : true
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
        this._disabled = val;
        super.disabled = !!val;

        if (val || this._dom.clsHas('kijs-disabled')) {
            this._quillEditor.disable(true);
        } else {
            this._quillEditor.enable(true);
        }
    }

    // overwrite
    get isEmpty() { return kijs.isEmpty(this.value); }

    // overwrite
    get readOnly() { return this._readOnly; }
    set readOnly(val) {
        this._readOnly = val;
        super.readOnly = !!val;

        if (val || this._dom.clsHas('kijs-readonly')) {
            this._quillEditor.disable(true);
        } else {
            this._quillEditor.enable(true);
        }
    }

    get theme() { return this._theme; }
    set theme(val) { this._theme = val; }

    get trimValue() { return this._trimValue; }
    set trimValue(val) { this._trimValue = val; }

    // overwrite
    get value() {
        if (this._quillEditor) {
            return this._quillEditor.root.innerHTML;
        } else {
            return this._value;
        }
    }
    set value(val) {
        this._value = val;
        if (this._quillEditor) {
            this._quillEditor.setText(val);
        }
    }


    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // overwrite
    render(superCall) {
        super.render(true);

        // quillEditor erstellen
        if (!this._quillEditor) {

            // Container erstellen und dem Node anhängen
            let containerDiv = document.createElement('div');
            containerDiv.className = 'quilleditor';
            this._inputWrapperDom.node.appendChild(containerDiv);

            // DIV für Editor erstellen
            this._quillEditorNode = document.createElement('div');

            // Editor DIV anhängen
            containerDiv.appendChild(this._quillEditorNode);

            // Editor erstellen
            this._quillEditor = new Quill(this._quillEditorNode, {
                theme: this._theme,
                readOnly: this._readOnly || this._disabled,
                modules: {
                    toolbar: this._toolbarOptions
                }
            });
            let inputNode = this._quillEditorNode.firstChild;
            inputNode.id = this._inputId;

            kijs.Dom.addEventListener('focus', inputNode, this._onInputNodeFocus, this);
            kijs.Dom.addEventListener('blur', inputNode, this._onInputNodeBlur, this);

            // Listener setzen und Event weiterleiten
            this._quillEditor.on('text-change', function() { this.raiseEvent('input'); }, this);
        }

        // Inhalt einfügen
        this.value = this._value ? this._value : '';

        // Event afterRender auslösen
        if (!superCall) {
            this.raiseEvent('afterRender');
        }
    }


    // LISTENERS
    _onInput(e) {
        this.validate();
    }

    _onInputNodeFocus() {
        this._oldValue = this._value;
    }

    _onInputNodeBlur() {
        if (this.value !== this._oldValue) {
            this._oldValue = this.value;
            this.raiseEvent('change');
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
        this._disabled = false;
        this._readOnly = null;
        this._quillEditor = null;
        this._quillEditorNode = null;
        this._theme = null;
        this._toolbarOptions = null;
        this._value = null;
        this._oldValue = null;

        // Basisklasse entladen
        super.destruct(true);
    }
};