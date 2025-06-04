/* global kijs, marked */

// --------------------------------------------------------------
// home.TabContainer
// --------------------------------------------------------------
window.home = {};
home.TabContainer = class home_TabContainer extends kijs.gui.container.tab.Container {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        this._app;

        this._filetype = 'text'; // 'text', 'html', 'js' oder 'md'
        this._namespace = '';    // Nur bei JS: Namespace
        this._className = '';    // Nur bei JS: Klassenname

        // Buttons
        this._btnRun = new kijs.gui.Button({
            iconMap: 'kijs.iconMap.Fa.circle-play',
            tooltip: 'Code ausführen',
            on: {
                click: this.#onRunClick,
                context: this
            }
        });

        this._btnReset = new kijs.gui.Button({
            iconMap: 'kijs.iconMap.Fa.rotate-right',
            tooltip: 'Code zurücksetzen',
            on: {
                click: this.#onResetClick,
                context: this
            }
        });

        // Panel mit ausgeführtem Beispiel
        this._contSandbox = new kijs.gui.Container({
            style: {
                flex: 1
            }
        });


        // Quellcode Panel mit Editor
        this._editorSource = new kijs.gui.field.AceEditor({
            mode: 'text'
            //theme: 'monokai'
        });

        this._contSource = new kijs.gui.Panel({
            caption: 'Source-Code',
            iconMap: 'kijs.iconMap.Fa.code',
            collapsible: 'right',
            collapsed: true,
            width: 500,
            cls: ['home-tabcontainer-source', 'kijs-borderless', 'kijs-flexfit'],
            style: {
                flex: 'none'
            },
            headerBarElements: [
                this._btnRun,
                this._btnReset
            ],
            elements: [
                this._editorSource
            ]
        });

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            cls: 'kijs-flexrow',
            style: {
                flex: 1,
                minHeight: '40px'
            },
            elements: [
                this._contSandbox,
                {
                    xtype: 'kijs.gui.Splitter',
                    targetPos: 'right'
                },
                this._contSource
            ]
        });

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            app: true
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }


    }



    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get app() { return this._app; }

    get className() { return this._className; }
    set className(val) { this._className = val; }

    get filetype() {
        return this._filetype;
    }
    set filetype(val) {
        this._filetype = val;

        let mode = '';
        switch (val) {
            case 'html': mode = 'html'; break;
            case 'js': mode = 'javascript'; break;
            case 'md': mode = 'markdown'; break;
            default: mode = 'text'; break;
        }

        this._editorSource.mode = mode;
    }

    get namespace() { return this._namespace; }
    set namespace(val) { this._namespace = val; }

    get source() { return this._editorSource.value };
    set source(val) { this._editorSource.value = val; }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // Lädt wieder den Ursprünglichen Code
    async reset() {
        const f = await fetch(this._name);

        this.displayWaitMask = true;
        let rawCode = await f.text();
        this._editorSource.value = rawCode;
        this.displayWaitMask = false;

        this.run();
    }

    // Führt den aktuellen Code aus.
    run() {
        let rawCode = this._editorSource.value;

        switch (this._filetype) {
            case 'html':
                this._contSandbox.scrollableY = 'auto';
                this._contSandbox.innerDom.clsAdd('markdown');
                this._contSandbox.html = rawCode;
                break;

            case 'js':
                // falls bereits geladen: destruct
                this._contSandbox.removeAll();

                // Code ausführen
                eval(rawCode);

                this._contSandbox.dom.clsAdd('kijs-flexrow');
                this._contSandbox.userData = new window.home[this._namespace][this._className]({app: this._app});
                this._contSandbox.add(this._contSandbox.userData.getContent());
                if (this._contSandbox.userData.run) {
                    this._contSandbox.userData.run();
                }
                break;

            case 'md':
                this._contSandbox.scrollableY = 'auto';
                this._contSandbox.html = '<div class="markdown">' +
                        marked.parse(rawCode) + '</div>';
                break;

        }

        
    }


    // PROTECTED

    // PRIVATE
    // LISTENERS
    #onResetClick(e) {
        this.reset();
    }

    #onRunClick(e) {
        this.run();
    }



    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct() {

    }

};

