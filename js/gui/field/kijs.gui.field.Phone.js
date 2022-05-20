/* global kijs, this */

// --------------------------------------------------------------
// kijs.gui.field.Phone
// --------------------------------------------------------------
/**
 * EVENTS
 * ----------
 * blur
 * input
 *
 * // Geerbte Events
 * add
 * afterFirstRenderTo
 * afterRender
 * afterResize
 * beforeAdd
 * beforeRemove
 * changeVisibility
 * childElementAfterResize
 * dblClick
 * rightClick
 * destruct
 * drag
 * dragEnd
 * dragLeave
 * dragOver
 * dragStart
 * drop
 * focus
 * mouseDown
 * mouseLeave
 * mouseMove
 * mouseUp
 * remove
 * wheel
 *
 * // key events
 * keyDown
 * enterPress
 * enterEscPress
 * escPress
 * spacePress
 */
kijs.gui.field.Phone = class kijs_gui_field_Phone extends kijs.gui.field.Text {

    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    constructor(config={}) {
        super(false);

        this._inputDom.nodeAttributeSet('type', 'tel');

        this._defaultCountryCallingCode = null;
        this._formatValue = true;
        this._replaceLeadingZeros = true;
        this._showLinkButton = false;

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            inputMode: 'tel'
        });

       // Mapping für die Zuweisung der Config-Eigenschaften
        Object.assign(this._configMap, {
            defaultCountryCallingCode: true,    // Standard Landesvorwahl welche entfernt wird
            formatValue: true,                  // Soll die Nummer automatisch formatiert werden
            replaceLeadingZeros: true,
            showLinkButton: true
        });

        // Listeners
        this.on('change', this._onChange, this);

        // Config anwenden
        if (kijs.isObject(config)) {
            config = Object.assign({}, this._defaultConfig, config);
            this.applyConfig(config, true);
        }

        if (this._showLinkButton) {
            this.add(this._createElements());
        }
    }


    // --------------------------------------------------------------
    // GETTERS / SETTERS
    // --------------------------------------------------------------
    get defaultCountryCallingCode() { return this._defaultCountryCallingCode; }
    set defaultCountryCallingCode(val) { this._defaultCountryCallingCode = val }

    get showLinkButton() { return this._showLinkButton; }
    set showLinkButton(val) { this._showLinkButton = !!val }

    get replaceLeadingZeros() { return this._replaceLeadingZeros; }
    set replaceLeadingZeros(val) { this._replaceLeadingZeros = !!val }


    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------

    _createElements() {
        return new kijs.gui.Button(
            {
                iconMap: 'kijs.iconMap.Fa.phone',
                on: {
                    click: this._onLinkButtonClick,
                    context: this
                }
            }
        );
    }

    // Protected
    _checkFormat(val) {
        let format = null;
        let delimiter = ' ';

        // Alles andere als Zahlen und das + am Anfang entfernen
        val = val.replace(/(?!^\+)[^0-9]+/g, '');

        // Eventuell Vorwahl entfernen
        if (this._defaultCountryCallingCode && val.substring(0, this._defaultCountryCallingCode.length) === this._defaultCountryCallingCode) {
            val = '0' + val.substring(this._defaultCountryCallingCode.length, val.length);
        }

        // Lokale Schweizernummer formatieren
        if (val.substring(0, 1) === '0' && val.length === 10) {
            format = [3, 3, 2, 2];
            val = this._format(val, format, delimiter);

        // Internationale Nummern formatieren
        } else if (val.substring(0, 1) === '+' || val.substring(0, 2) === '00') {

            switch (true) {
                case val.substring(0, 4) === '0041': // Schweiz
                case val.substring(0, 3) === '+41':
                    format = [3, 2, 3, 2, 2];
                    break;

                case val.substring(0, 5) === '00423': // Lichtenstein
                case val.substring(0, 4) === '+423':
                    format = [4, 3, 2, 2];
                    break;

                case val.substring(0, 4) === '0043': // Österreich
                case val.substring(0, 3) === '+43':
                    format = [3, 4, 6, 4];
                    break;

                case val.substring(0, 4) === '0049': // Deutschland
                case val.substring(0, 3) === '+49':
                    format = [3, 3, 11];
                    break;
            }

            if (format) {
                val = this._format(val, format, delimiter);
            }
        }

        return val;
    }

    // Formatiert die Nummer
    _format(val, format, delimiter) {
        let formattedVal = '';
        let offset = 0;

        // 00 am Anfang verarbeiten
        if (val.substring(0, 2) === '00') {
            format[0] += 1;
        }

        for (let i = 0; i < format.length; i++) {
            formattedVal += formattedVal ? delimiter : '';
            formattedVal += val.substr(offset, format[i]);

            offset += format[i];
        }

        return formattedVal.trim();
    }


    // LISTENERS
    _onChange() {
        let val = this.value;

        if (this._replaceLeadingZeros) {
            if (val.substring(0, 2) === '00') {
                val = '+' + val.substring(2, val.length);
            }
        }

        if (this._formatValue) {
            val = this._checkFormat(val);
        }

        this.value = val;
    }

    _onLinkButtonClick() {
        if (this.value) {
            let val = this.value.replace(/(?!^\+)[^0-9]+/g, '');
            window.open('tel:' + val);
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

        // Variablen (Objekte/Arrays) leeren
        this._defaultCountryCallingCode = null;
        this._formatValue = null;
        this._replaceLeadingZeros = null;
        this._showLinkButton = null;

        // Basisklasse entladen
        super.destruct(true);
    }
};
