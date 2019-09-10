/* global kijs */

// --------------------------------------------------------------
// kijs.Storage (Static)
// --------------------------------------------------------------
/**
 * Klasse zum Lesen und Schreiben in den Local- oder Sessionstorage.
 * Damit keine Konflikte entstehen, wenn mehrere KIJS-Frameworks unter
 * der selben Domain laufen, wird standardmässig der Titel der Webseite
 * als prefix verwendet. Wenn dieses nicht sein soll, kann als argument
 * ein anderes Prefix übergeben werden.
 */
kijs.Storage = class kijs_Storage {


    // --------------------------------------------------------------
    // STATICS
    // --------------------------------------------------------------

    /**
     * Liest einen Wert aus dem Storage.
     * @param {String} key
     * @param {String} [mode]                  'local' für LocalStorage oder 'session' für SessionStorage
     * @param {Boolean|String} [keyPrefix]     individuelles prefix, falls nicht der titel verwendet werden soll.
     * @returns {Mixed}
     */
    static getItem(key, mode='local', keyPrefix=true) {
        let prefix = kijs.Storage._getPrefix(keyPrefix),
                storage = kijs.Storage._getStorage(mode);
        try {
            if (!storage) {
                return false;
            }

            let val = storage.getItem(prefix + key);
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
     * @param {String} [mode]                  'local' für LocalStorage oder 'session' für SessionStorage
     * @param {Boolean|String} [keyPrefix]     individuelles prefix, falls nicht der titel verwendet werden soll.
     * @returns {Array}
     */
    static getKeys(mode='local', keyPrefix=true) {
        let prefix = kijs.Storage._getPrefix(keyPrefix),
                storage = kijs.Storage._getStorage(mode);
        try {
            if (!storage || !storage.key) {
                return false;
            }
            let keys = [], i, k;
            for (i=0; i< storage.length; i++) {
                k = storage.key(i);
                if (k && k.substr(0, prefix.length) === prefix) {
                    keys.push(k.substr(prefix.length));
                }
            }
            return keys;

        } catch (e) {
            return false;
        }
    }

    /**
     * Löscht alle Elemente aus dem localStorage.
     * @param {String} [mode]                  'local' für LocalStorage oder 'session' für SessionStorage
     * @param {Boolean|String} [keyPrefix]     individuelles prefix, falls nicht der titel verwendet werden soll.
     * @returns {Boolean}
     */
    static removeAll(mode='local', keyPrefix=true) {
        let keys = kijs.Storage.getKeys(mode, keyPrefix);

        if (keys === false) {
            return false;
        }

        for (let i=0; i<keys.length; i++) {
            kijs.Storage.removeItem(keys[i], mode, keyPrefix);
        }
        return true;
    }

    /**
     * Löscht ein Wert aus dem LocalStorage.
     * @param {String} key
     * @param {String} [mode]                  'local' für LocalStorage oder 'session' für SessionStorage
     * @param {Boolean|String} [keyPrefix]     individuelles prefix, falls nicht der titel verwendet werden soll.
     * @returns {Boolean}
     */
    static removeItem(key, mode='local', keyPrefix=true) {
        let prefix = kijs.Storage._getPrefix(keyPrefix),
                storage = kijs.Storage._getStorage(mode);
        try {
            if (!storage) {
                return false;
            }
            storage.removeItem(prefix + key);

        } catch (e) {
            return false;
        }
    }

    /**
     * Speichert einen Wert im LocalStorage.
     * @param {String} key
     * @param {Mixed} value
     * @param {String} [mode]                  'local' für LocalStorage oder 'session' für SessionStorage
     * @param {Boolean|String} [keyPrefix]     individuelles prefix, falls nicht der titel verwendet werden soll.
     * @returns {Boolean}
     */
    static setItem(key, value, mode='local', keyPrefix=true) {
        let prefix = kijs.Storage._getPrefix(keyPrefix),
                storage = kijs.Storage._getStorage(mode);
        try {
            if (!storage || !storage.setItem) {
                return false;
            }
            storage.setItem(prefix + key, JSON.stringify({value: value}));
            return true;

        } catch (e) {
            return false;
        }
    }

    /**
     * Aktualisiert ein Objekt im LocalStorage
     * @param {String} key
     * @param {Object} value
     * @param {String} [mode]                  'local' für LocalStorage oder 'session' für SessionStorage
     * @param {Boolean|String} [keyPrefix]     individuelles prefix, falls nicht der titel verwendet werden soll.
     * @returns {Boolean}
     */
    static updateItem(key, value, mode='local', keyPrefix=true) {
        if (!kijs.isObject(value)) {
            return false;
        }
        
        let oldValue = kijs.Storage.getItem(key, mode, keyPrefix);
        if (!kijs.isObject(oldValue)) {
            oldValue = {};
        }

        // update
        for (let k in value) {
            oldValue[k] = value[k];
        }

        return kijs.Storage.setItem(key, oldValue, mode, keyPrefix);
    }

    // --------------------------------------------------------------
    // PROTECTED STATICS
    // --------------------------------------------------------------

    /**
     * Gibt die instanz auf den Storage zurück.
     * @returns {window.localStorage|window.sessionStorage}
     */
    static _getStorage(mode) {
        if (!kijs.Array.contains(['session', 'local'], mode)) {
            throw new kijs.Error('invalid storage mode');
        }
        return mode === 'session' ? window.sessionStorage : window.localStorage;
    }

    /**
     * Gibt das Prefix zurück
     * @param {String|Boolean} prefix
     * @returns {String}
     */
    static _getPrefix(pref) {
        let prefix = 'kijs-';
        if (pref === true && document.title) {
            prefix += document.title.toLowerCase().replace(/[^a-z0-9]/, '') + '-';
        } else if (kijs.isString(pref) && pref) {
            prefix += pref + '-';
        }
        return prefix;
    }
};