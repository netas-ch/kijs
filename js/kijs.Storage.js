/* global kijs */

// --------------------------------------------------------------
// kijs.Storage
// --------------------------------------------------------------

/**
 * Klasse zum Lesen und Schreiben in den Local- oder Sessionstorage.
 * Beim Instanzieren kann angegeben werden, ob der Sessionstorage
 * verwendet werden soll.
 */
kijs.Storage = class kijs_Storage {

    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------

    /**
     * @param {Boolean} useSessionStorage true, falls der session-storage verwendet werden soll
     * @param {Boolean} useTitlePrefix, false, falls kein titel verwendet werden soll.
     * @returns {kijs_Storage}
     */
    constructor(useSessionStorage=false, useTitlePrefix=true) {
        this._storage = useSessionStorage ? window.sessionStorage : window.localStorage;
        this._prefix = 'socialoffice-';
        if (useTitlePrefix && document.title) {
            this._prefix = document.title.toLowerCase().replace(/[^a-z0-9]/, '') + '-';
        }
    }


    // --------------------------------------------------------------
    // PUBLIC
    // --------------------------------------------------------------

    /**
     * Liest einen Wert aus dem LocalStorage.
     * @param {String} key
     * @returns {Mixed}
     */
    getItem(key) {
        try {
            if (!this._storage) {
                return false;
            }

            let val = this._storage.getItem(this._prefix + key);
            if (val) {
                val = JSON.parse(val);
                if (val && kijs.isObject(val) && val.value !== undefined) {
                    return val.value;
                }
            }
            return null;

        } catch (e) {
            return false;
        }
    }

    /**
     * Gibt alle gespeicherten Schlüssel in einem Array zurück
     * @returns {Array|Boolean} die Keys oder false, falls kein localStorage unterstüzt wird
     */
    getKeys() {
        try {
            if (!this._storage || !this._storage.key) {
                return false;
            }
            let keys = [], i, k;
            for (i=0; i< this._storage.length; i++) {
                k = this._storage.key(i);
                if (k && k.substr(0, this._prefix.length) === this._prefix) {
                    keys.push(k.substr(this._prefix.length));
                }
            }
            return keys;

        } catch (e) {
            return false;
        }
    }

    /**
     * Löscht alle Elemente aus dem localStorage.
     * @returns {Boolean}
     */
    removeAll() {
        let keys = this.getKeys();

        if (keys === false) {
            return false;
        }

        for (let i=0; i<keys.length; i++) {
            this.removeItem(keys[i]);
        }
        return true;
    }

    /**
     * Löscht ein Wert aus dem LocalStorage.
     * @param {String} key
     * @returns {Boolean}
     */
    removeItem(key) {
        try {
            if (!this._storage) {
                return false;
            }
            this._storage.removeItem(this._prefix + key);

        } catch (e) {
            return false;
        }
    }

    /**
     * Speichert einen Wert im LocalStorage.
     * @param {String} key
     * @param {Mixed} value
     * @returns {Boolean}
     */
    setItem(key, value) {
        try {
            if (!this._storage) {
                return false;
            }
            this._storage.setItem(this._prefix + key, JSON.stringify({value: value}));
            return true;

        } catch (e) {
            return false;
        }
    }

    /**
     * Aktualisiert ein Objekt im LocalStorage
     * @param {String} key
     * @param {Object} value
     * @returns {Boolean}
     */
    updateItem(key, value) {
        if (!kijs.isObject(value)) {
            return false;
        }
        let oldValue = this.getItem(key);
        if (!kijs.isObject(oldValue)) {
            oldValue = {};
        }
        // update
        for (let k in value) {
            oldValue[k] = value[k];
        }
        return this.setItem(key, oldValue);
    }
};