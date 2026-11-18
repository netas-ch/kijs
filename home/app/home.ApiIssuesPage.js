/* global kijs */

// --------------------------------------------------------------
// home.ApiIssuesPage
// --------------------------------------------------------------
/**
 * Tab mit dem Lückenbericht der API-Dokumentation: was im Code noch nicht
 * dokumentiert ist, sortiert nach Klasse. Mit Filter nach Klasse und Art der Lücke.
 *
 * @example
 * const page = new home.ApiIssuesPage({ app: app });
 * page.load();
 */
home.ApiIssuesPage = class home_ApiIssuesPage extends kijs.gui.container.tab.Container {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        this._app = null;
        this._data = null;

        this._filterField = new kijs.gui.field.Text({
            label: 'Klasse',
            placeholder: 'z.B. kijs.gui.field',
            style: { width: '280px' },
            on: {
                input: this.#onFilterChange,
                context: this
            }
        });

        this._typesField = new kijs.gui.field.CheckboxGroup({
            label: 'Art',
            valueField: 'id',
            displayTextField: 'caption',
            cls: 'kijs-inline',
            on: {
                change: this.#onFilterChange,
                context: this
            }
        });

        this._listEl = new kijs.gui.Element({
            cls: ['markdown', 'home-api-list', 'home-api-issues'],
            on: {
                afterRender: this.#onListAfterRender,
                context: this
            }
        });

        this._pageEl = new kijs.gui.Container({
            cls: 'home-api-page',
            scrollableY: 'auto',
            style: { flex: 1 },
            elements: [
                {
                    xtype: 'kijs.gui.Element',
                    cls: ['markdown', 'home-api-header'],
                    html: '<h1>Lückenbericht</h1>'
                        + '<p>Was im Code noch nicht nach dem Leitfaden '
                        + '<a href="#" data-home-file="data/docu/Leitfäden/Kommentare.md">Kommentare</a> '
                        + 'dokumentiert ist. Der Bericht wird bei «API aktualisieren» neu erstellt.</p>'
                },
                {
                    xtype: 'kijs.gui.Container',
                    cls: ['kijs-flexcolumn', 'home-api-toolbar'],
                    elements: [
                        this._filterField,
                        this._typesField
                    ]
                },
                this._listEl
            ]
        });
        this._pageEl.on('click', this.#onPageClick, this);

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            cls: 'kijs-flexcolumn',
            style: {
                flex: 1,
                minHeight: '40px'
            },
            elements: [
                this._pageEl
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
    // STATICS
    // --------------------------------------------------------------
    // Bezeichnungen der Arten von Lücken
    static typeCaptions = {
        classNoDoc: 'Klasse ohne Kommentar',
        oldHeader: 'Alter Kopfkommentar',
        propertyNoDoc: 'Config/Eigenschaft ohne Doku',
        functionNoDoc: 'Funktion ohne JSDoc',
        functionNoJsDoc: 'Funktion nur mit //-Kommentar',
        argumentNoDoc: 'Argument ohne @param',
        eventNoDoc: 'Event ohne @fires'
    };



    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    /**
     * Home-App
     * @type {home.App}
     */
    get app() { return this._app; }
    set app(val) { this._app = val; }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    /**
     * Lädt den Bericht und zeigt ihn an
     * @returns {Promise}
     */
    async load() {
        const rpcData = await kijs.getRpc('app').do({
            remoteFn: 'api.issues',
            waitMaskTarget: this
        });
        if (!kijs.isEmpty(rpcData.response.errorType)) {
            return;
        }
        this._data = rpcData.response.data;

        // Arten mit Anzahl im Filter
        const types = [];
        kijs.Object.each(this._data.types, function(type, count) {
            types.push({ id: type, caption: (home_ApiIssuesPage.typeCaptions[type] || type) + ' (' + count + ')' });
        }, this);
        this._typesField.data = types;
        this._typesField.value = types.map(t => t.id);

        this._listEl.html = this._getListHtml();
        this._applyFilter();
    }


    // PROTECTED
    /**
     * Blendet Lücken und Klassen aus, die nicht zum Filter passen
     */
    _applyFilter() {
        if (!this._listEl.node || !this._data) {
            return;
        }
        const text = (this._filterField.value || '').toLowerCase().trim();
        const types = this._typesField.value || [];

        let total = 0;
        let classes = 0;
        kijs.Array.each(this._listEl.node.querySelectorAll('section'), function(section) {
            let visible = 0;
            const classMatch = !text || section.dataset.class.toLowerCase().includes(text);
            kijs.Array.each(section.querySelectorAll('li'), function(li) {
                const show = classMatch && types.includes(li.dataset.type);
                li.hidden = !show;
                if (show) {
                    visible++;
                }
            }, this);
            section.hidden = !visible;
            section.querySelector('.home-api-count').textContent = '(' + visible + ')';
            total += visible;
            if (visible) {
                classes++;
            }
        }, this);

        this._listEl.node.querySelector('.home-api-issues-total').textContent =
                total + ' Lücken in ' + classes + ' Klassen';
    }

    /**
     * HTML mit allen Lücken, gruppiert nach Klasse
     * @returns {String}
     */
    _getListHtml() {
        const esc = kijs.String.htmlspecialchars;
        let html = '<p class="home-api-issues-total"></p>';
        let curClass = null;

        kijs.Array.each(this._data.issues, function(i) {
            if (i.className !== curClass) {
                if (curClass !== null) {
                    html += '</ul></section>';
                }
                curClass = i.className;
                html += '<section data-class="' + esc(i.className) + '">'
                        + '<h2><a href="#" data-api-class="' + esc(i.className) + '">' + esc(i.className) + '</a>'
                        + ' <span class="home-api-count"></span></h2><ul>';
            }
            html += '<li data-type="' + esc(i.type) + '">';
            if (i.memberName && i.memberName.startsWith('_')) {
                // protected: erscheint nicht auf der Klassenseite, darum ohne Link
                html += '<code>' + esc(i.memberName) + '</code>: ';
            } else if (i.memberName) {
                html += '<a href="#" data-api-class="' + esc(i.className) + '" data-api-member="' + esc(i.memberName) + '">'
                        + esc(i.memberName) + '</a>: ';
            }
            html += esc(i.message) + '</li>';
        }, this);
        if (curClass !== null) {
            html += '</ul></section>';
        }
        return html;
    }


    // PRIVATE
    // LISTENERS
    #onFilterChange(e) {
        this._applyFilter();
    }

    #onListAfterRender(e) {
        this._applyFilter();
    }

    #onPageClick(e) {
        if (!e.nodeEvent || !e.nodeEvent.target.closest) {
            return;
        }
        const a = e.nodeEvent.target.closest('a');
        if (!a) {
            return;
        }
        if (a.dataset.apiClass) {
            e.nodeEvent.preventDefault();
            this._app.openApiClass(a.dataset.apiClass, a.dataset.apiMember || null);
        } else if (a.dataset.homeFile) {
            e.nodeEvent.preventDefault();
            this._app.openLinkedFile(a.dataset.homeFile);
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

        // Variablen (Objekte/Arrays) leeren
        this._app = null;
        this._data = null;
        this._filterField = null;
        this._listEl = null;
        this._pageEl = null;
        this._typesField = null;

        // Basisklasse entladen
        super.destruct(true);
    }

};
