/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.MenuButton
// --------------------------------------------------------------
kijs.gui.MenuButton = class kijs_gui_MenuButton extends kijs.gui.Button {


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super();

        this._spinbox = new kijs.gui.SpinBox({
            cls: ['kijs-flexcolumn', 'kijs-menubutton-spinbox'],
            parent: this,
            target: this,
            ownerNodes: [this]
        });
        this._direction = null;
        this._expandOnHover = null;
        this._expandTimer = null;

        // Standard-config-Eigenschaften mergen
        config = Object.assign({}, {
            // Keine
        }, config);

        // default xtype der Unterelemente soll der Button sein.
        if (kijs.isObject(config)) {
            if (kijs.isObject(config.defaults) && !kijs.isDefined(config.defaults.xtype)) {
                config.defaults.xtype = 'kijs.gui.Button';

            } else if (!kijs.isDefined(config.defaults)) {
                config.defaults = {
                    xtype: 'kijs.gui.Button'
                };
            }
        }

        // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            direction: { target: 'direction', context: this},
            expandOnHover: { target: 'expandOnHover', context: this},

            // Attribute für Container weiterreichen
            autoScroll: { target: 'autoScroll', context: this._spinbox },
            defaults: { target: 'defaults', context: this._spinbox, prio: 1},
            elements: { target: this._spinbox.add, fn: 'function', context: this._spinbox, prio: 2},
            html: { target: 'html', context: this._spinbox },
            htmlDisplayType: { target: 'htmlDisplayType', context: this._spinbox },
            innerCls: { target: 'innerCls', context: this._spinbox },
            innerStyle : { target: 'innerStyle', context: this._spinbox }
        });

        // Config anwenden
        if (kijs.isObject(config)) {
            this.applyConfig(config, true);
        }

        // falls wir in einem Untermenu sind, ist der default gegen rechts
        if (this._direction === null) {
            if (this.upX('kijs.gui.MenuButton')) {
                this.direction = 'right';
            } else {
                this.direction = 'down';
            }
        }
        
        // falls wir in einem Untermenu sind, wird das Menu beim Hoover automatisch geöffnet
        if (this._expandOnHover === null) {
            if (this.upX('kijs.gui.MenuButton')) {
                this.expandOnHover = true;
            } else {
                this.expandOnHover = false;
            }
        }

        // Klick Event
        this.on('click', this._onBtnClick, this);
    }


    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get spinbox() { return this._spinbox; }
    set spinbox(val) {
        if (!(val instanceof kijs.gui.SpinBox)) {
            throw new Error('invalid type for spinbox attribute');
        }
        this._spinbox = val;
    }

    get direction() { return this._direction; }
    set direction(val) {
        let iconChar = this._getIconChar(val);
        if (!iconChar) {
            throw new Error('invalid argument for direction attribute');
        }
        this.icon2Char = iconChar;
        this._direction = val;

        switch (val) {
            case 'left':
                this._spinbox.ownPos = 'tr';
                this._spinbox.targetPos = 'tl';
                this._spinbox.offsetX = -5;
                break;
            case 'right':
                this._spinbox.ownPos = 'tl';
                this._spinbox.targetPos = 'tr';
                this._spinbox.offsetX = -5;
                break;
            case 'up':
                this._spinbox.ownPos = 'bl';
                this._spinbox.targetPos = 'tl';
                this._spinbox.offsetX = 0;
                break;
            case 'down':
                this._spinbox.ownPos = 'tl';
                this._spinbox.targetPos = 'bl';
                this._spinbox.offsetX = 0;
                break;
        }
    }

    get expandOnHover() { return this._expandOnHover; }
    set expandOnHover(val) {
        // listeners setzen
        if (val) {
            this.on('mouseEnter', this._onMouseEnter, this);
            this.on('mouseLeave', this._onMouseLeave, this);

        // listeners entfernen
        } else {
            this.off('mouseEnter', this._onMouseEnter, this);
            this.off('mouseLeave', this._onMouseLeave, this);
        }

        this._expandOnHover = !!val;
    }

    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------

    /**
     * Schliesst das Dropdownmenu und alle Untermenus
     * @returns {undefined}
     */
    menuClose() {
        this._spinbox.close();

        // timeout löschen
        if (this._expandTimer) {
            window.clearTimeout(this._expandTimer);
            this._expandTimer = null;
        }

        let p = this.parent;
        while (p) {
            if (p instanceof kijs.gui.MenuButton) {
                p.spinbox.ownerNodeRemove(this._spinbox);
            }
            p = p.parent;
        }
    }

    /**
     * Schliesst das Dropdownmenu und alle unter- und übergeordneten Menus
     * @returns {undefined}
     */
    menuCloseAll() {
        let m = this, p=this.parent;
        while (p) {
            if (p instanceof kijs.gui.MenuButton) {
                m = p;
            }
            p = p.parent;
        }
        m.menuClose();
    }

    /**
     * Zeigt das Dropdownmenu an.
     * @returns {undefined}
     */
    menuShow() {
        this._spinbox.show();

        // den übergeordneten MenuButtons mitteilen, dass beim Klick auf dieses Element
        // das Menu nicht geschlossen werden soll.
        let p = this.parent;
        while (p) {
            if (p instanceof kijs.gui.MenuButton) {
                p.spinbox.ownerNodeAdd(this._spinbox);
            }
            p = p.parent;
        }
    }

    // Overwrite
    render(superCall) {
        // dom mit elements rendern (innerDom)
        super.render(true);

        // Event afterRender auslösen
        if (!superCall) {
            this.raiseEvent('afterRender');
        }
    }


    // overwrite
    unrender(superCall) {
        // Event auslösen.
        if (!superCall) {
            this.raiseEvent('unrender');
        }

        // Spinbox schliessen und bei owner abmelden
        this.menuClose();

        // Button unrendern
        super.unrender(true);
    }


    // PROTECTED
    _onBtnClick() {
        if (this._spinbox.dom.node) {
            this.menuClose();
        } else {
            this.menuShow();
        }
    }

    _onMouseEnter() {
        if (!this._expandTimer) {
            this._expandTimer = kijs.defer(function() {
                if (!this._spinbox.dom.node) {
                    this.menuShow();
                }
            }, 500, this);
        }
    }

    _onMouseLeave() {
        if (this._expandTimer) {
            window.clearTimeout(this._expandTimer);
            this._expandTimer = null;
        }
    }


    _getIconChar(direction) {
        switch (direction) {
            case 'left': return '&#xf104';
            case 'right': return '&#xf105';
            case 'up': return '&#xf106';
            case 'down': return '&#xf107';
        }
        return '';
    }


    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct(superCall) {
        if (!superCall) {
            // unrender
            this.unrender(superCall);

            // Event auslösen.
            this.raiseEvent('destruct');
        }

        // Elemente/DOM-Objekte entladen
        if (this._spinbox) {
            this._spinbox.destruct();
        }

        // Variablen (Objekte/Arrays) leeren
        this._spinbox = null;

        // Basisklasse entladen
        super.destruct(true);
    }

};