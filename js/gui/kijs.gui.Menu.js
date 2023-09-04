/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.Menu
// --------------------------------------------------------------

kijs.gui.Menu = class kijs_gui_Menu extends kijs.gui.SpinBox {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    // overwrite
    constructor(config={}) {
        super(false);

        this._direction = '';
        this._expandOnHover = false;
        this._closeOnClick = false;
        this._expandDeferId = null;

        // Button, von dem aus dieses Menu geöffnet wird
        this._button = null;

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            scrollableY: 'auto',
            direction: 'auto',
            expandOnHover: 'auto',
            cls: ['kijs-flexcolumn', 'kijs-menu-spinbox']
        });

        // default xtype der Unterelemente soll der Button sein.
        // kann nicht ins defaultConfig, weils ein unterobjekt ist.
        if (kijs.isObject(config)) {
            if (kijs.isObject(config.defaults) && !kijs.isDefined(config.defaults.xtype)) {
                config.defaults.xtype = 'kijs.gui.Button';
                config.defaults.disableFlex = false;
                config.defaults.smallPaddings = false;
            } else if (!kijs.isDefined(config.defaults)) {
                config.defaults = {
                    xtype: 'kijs.gui.Button',
                    disableFlex: false,
                    smallPaddings: false
                };
            }
        }

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            button: { target: 'button', prio: 1},
            direction: { target: 'direction', prio: 2},
            expandOnHover: { target: 'expandOnHover', prio: 3},
            closeOnClick: { target: 'closeOnClick', prio: 1001} // prio: nach den elements (1000)
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
    get button() { return this._button; }
    set button(val) {
        if (!(val instanceof kijs.gui.Button)) {
            throw new kijs.Error(`invalid value for kijs.gui.Menu::button`);
        }

        // change button?
        if (this._button !== null) {
            this._button.off('click', this.#onBtnClick, this);
            this._button = null;
        }

        this._button = val;
        this._button.on('click', this.#onBtnClick, this);
        this.target = this._button;
        this.ownerNodeAdd(this._button);
    }

    get closeOnClick() { return this._closeOnClick; }
    set closeOnClick(val) {
        val = !!val;

        if (val !== this._closeOnClick) {
            kijs.Array.each(this.elements, function(element) {
                if (element instanceof kijs.gui.Button) {

                    // sub-buttons überwachen
                    if (val && !element.hasListener('click', this.#onSubButtonClick, this)) {
                        element.on('click', this.#onSubButtonClick, this);
                    } else if (!val) {
                        element.off('click', this.#onSubButtonClick, this);
                    }

                    // closeOnClick den Untermenus weitergeben
                    if (element.menu) {
                        element.menu.closeOnClick = val;
                    }
                }
            }, this);
        }

        this._closeOnClick = val;
    }

    get direction() { return this._direction; }
    set direction(val) {
        // auto: Falls der Button nicht im Menu ist ist, nach unten, sonst nach rechts
        if (val === 'auto') {
            if (this._button && !this.upX('kijs.gui.Menu')) {
                val = 'down';
            } else {
                val = 'right';
            }
        }

        switch (val) {
            case 'left':
                this.ownPos = 'tr';
                this.targetPos = 'tl';
                this.offsetX = -5;
                break;
            case 'right':
                this.ownPos = 'tl';
                this.targetPos = 'tr';
                this.offsetX = -5;
                break;
            case 'up':
                this.ownPos = 'bl';
                this.targetPos = 'tl';
                this.offsetX = 0;
                break;
            case 'down':
                this.ownPos = 'tl';
                this.targetPos = 'bl';
                this.offsetX = 0;
                break;
            default:
                throw new kijs.Error(`invalid value for kijs.gui.Menu::direction`);
        }
        this._direction = val;
    }

    get expandOnHover() { return this._expandOnHover; }
    set expandOnHover(val) {
        if (this._button) {
            // auto: falls in einem Untermenu ja, sonst nein.
            if (val === 'auto') {
                val = this.upX('kijs.gui.Menu') !== null;
            }

            // listeners setzen
            if (val) {
                this._button.on('mouseEnter', this.#onBtnMouseEnter, this);
                this._button.on('mouseLeave', this.#onBtnMouseLeave, this);

            // listeners entfernen
            } else {
                this._button.off('mouseEnter', this.#onBtnMouseEnter, this);
                this._button.off('mouseLeave', this.#onBtnMouseLeave, this);
            }

            this._expandOnHover = !!val;
        }
    }



    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    // overwerite
    /*add(elements) {
        if (!kijs.isArray(elements)) {
            elements = [elements];
        }

        let newElements = [];
        kijs.Array.each(elements, function(element) {

            // Linie
            if (kijs.isString(element) && element === '-') {
                newElements.push(new kijs.gui.Element({
                    name: '<hr>',
                    cls:  'separator',
                    htmlDisplayType: 'html',
                    html: '<hr />'
                }));

            // Sonstiger Text
            } else if (kijs.isString(element)) {
                newElements.push(new kijs.gui.Element({
                    html: element
                }));

            // Sonstiges Element
            } else {
                newElements.push(element);
                
            }
        });

        // parent
        super.add(newElements);
    }*/

    /**
     * Schliesst das Dropdownmenu und alle Untermenus
     * @returns {undefined}
     */
    close() {
        // Untermenu Schliessen
        this.closeSubMenus();

        // selber schliessen
        super.close();
    }

    /**
     * Schliesst das Dropdownmenu und alle unter- und übergeordneten Menus
     * @returns {undefined}
     */
    closeAll() {
        // alle Parents durchsuchen, beim höchsten vom Typ Menu 'Schliessen'
        let topMostMenu=this, p=this;
        while (p.parent) {
            if (p.parent instanceof kijs.gui.Menu) {
                topMostMenu = p.parent;
            }
            p=p.parent;
        }

        topMostMenu.close();
    }

    /**
     * Schliesst alle Untermenus
     * @param {kijs.gui.Menu|kijs.gui.Button|null} exeption Instanz, welche nicht geschlossen werden soll.
     * @returns {undefined}
     */
    closeSubMenus(exeption=null) {
        // Untermenu Schliessen
        kijs.Array.each(this.elements, function(element) {
            if ((element instanceof kijs.gui.Button) && element.menu && element.menu !== exeption && element !== exeption) {
                element.menu.close();
            }
        }, this);
    }
    
    /**
     * Gibt das Icon fürs öffen für die entsprechende Richtung zurück
     * @returns {String}
     */
    getIconMap() {
        switch (this._direction) {
            case 'left': return 'kijs.iconMap.Fa.angle-left';
            case 'right': return 'kijs.iconMap.Fa.angle-right';
            case 'up': return 'kijs.iconMap.Fa.angle-up';
            case 'down': return 'kijs.iconMap.Fa.angle-down';
        }
        return '';
    }

    /**
     * Zeigt das Menu an
     * @param {Number|null} x X-Koordinate (null, falls an target ausgerichtet werden soll)
     * @param {Number|null} y Y-Koordinate (null, falls an target ausgerichtet werden soll)
     * @returns {undefined}
     */
    show(x=null, y=null) {
        super.show(x, y);

        // Falls dieses Menu ein Untermenu ist: beim Öffnen
        // alle andere Untermenus ausser dieses schliessen
        if (this._button && (this._button.parent instanceof kijs.gui.Menu)) {
            this._button.parent.closeSubMenus(this);
        }
    }
    
    // overwerite
    unrender(superCall) {
        // timer abbrechen
        if (this._expandDeferId) {
            window.clearTimeout(this._expandDeferId);
            this._expandDeferId = null;
        }
        
        // Event auslösen.
        if (!superCall) {
            this.raiseEvent('unrender');
        }

        super.unrender(true);
    }


    // PRIVATE
    // LISTENERS
    #onBtnClick() {
        if (this.dom.node) {
            this.close();
        } else {
            this.show();
        }
    }

    #onBtnMouseEnter() {
        if (!this._expandDeferId) {
            this._expandDeferId = kijs.defer(function() {
                if (!this.isRendered) {
                    this.show();
                }
            }, 500, this);
        }
    }

    #onBtnMouseLeave() {
        if (this._expandDeferId) {
            window.clearTimeout(this._expandDeferId);
            this._expandDeferId = null;
        }
    }

    #onSubButtonClick(e) {
        // Falls auf ein Button ohne Untermenu geklickt wird, schliessen
        if (this._closeOnClick && (e.element instanceof kijs.gui.Button) && e.element.menu === null) {
            this.closeAll();
        }
    }



    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    // overwerite
    destruct(superCall) {
        if (!superCall) {
            // unrender
            this.unrender(superCall);

            // Event auslösen.
            this.raiseEvent('destruct');
        }

        // Variablen (Objekte/Arrays) leeren
        this._button = null;

        // Basisklasse entladen
        super.destruct(true);
    }

};