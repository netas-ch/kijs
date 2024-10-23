/* global kijs */

// --------------------------------------------------------------
// kijs.Object (Static)
// --------------------------------------------------------------
kijs.Object = class kijs_Object {


    // --------------------------------------------------------------
    // STATICS
    // --------------------------------------------------------------
    /**
     * Wendet Konfigurations-Eigenschaften auf ein Objekt an
     * @param {Object} object       Ziel Objekt
     * @param {Object} config       Config Objekt
     * @param {Object} configMap    Config Map
     * @returns {undefined}
     */
    static assignConfig(object, config, configMap) {

        // 1. Shortcuts auflösen, Standardwerte übernehmen und configs in temporäres Array 'tmpConfigs' übernehmen
        let tmpConfigs = [];
        kijs.Object.each(config, function(cfgKey, cfgVal){

            if (!configMap.hasOwnProperty(cfgKey)) {
                // skipUnknownConfigs immer ignorieren
                if (cfgKey === 'skipUnknownConfigs') {
                    return;
                }
                
                // Bei unbekannten Config-Eigenschaften nur einen Fehler ausgeben, wenn
                // der Propertyname nicht in der Eigenschaft skipUnknownConfigs steht.
                // (Array wird bei der Zuweisung der defaults vom ki.gui.Container gefüllt)
                if ( kijs.isArray(config.skipUnknownConfigs) 
                        && kijs.Array.contains(config.skipUnknownConfigs, cfgKey) ) {
                    return;
                }
                
                // sonst Fehler
                throw new kijs.Error(`Unknown config "${cfgKey}"`);
            }

            // fn und target ermitteln
            // -----------------------
            let prio = Number.MIN_SAFE_INTEGER;
            let fn = 'replace';
            let target = '_' + cfgKey;
            let context = object;
            let map = configMap[cfgKey];

            // True
            if (map === true) {
                // Standards nehmen

            } else if (map === false) {
                fn = 'error';

            // String (mit Target
            } else if (kijs.isString(map)) {
                target = map;

            // Objekt im Format { fn: '...', target:'...' }
            } else if (kijs.isObject(map)) {
                if (kijs.isNumeric(map.prio)) {
                    prio = Number(map.prio);
                }
                if (map.fn) {
                    fn = map.fn;
                }
                if (map.target) {
                    target = map.target;
                }
                if (map.context) {
                    context = map.context;
                }
            } else {
                throw new kijs.Error(`Unknown format on configMap "${cfgKey}"`);

            }

            tmpConfigs.push({
                prio: prio,
                key: cfgKey,
                fn: fn,
                target: target,
                context: context,
                value: cfgVal
            });
        }, this);

        // 2. Sortieren nach Priorität je grösser die Zahl, desto später wird die Eigenschaft zugewiesen
        tmpConfigs.sort(function(a, b) {
            return a.prio - b.prio;
        });

        // 3. Eigenschaften in der Reihenfolge ihrer Priorität zuweisen
        kijs.Array.each(tmpConfigs, function(cfg) {

            // Je nach fn den Wert zuweisen
            // ----------------------------
            switch (cfg.fn) {
                // Manuelle Zuweisung. Hier muss nichts getan werden
                case 'manual':
                    break;

                // Bestehenden Wert ersetzen
                case 'replace':
                    cfg.context[cfg.target] = cfg.value;
                    break;

                // zum Array hinzufügen
                case 'append':
                    if (kijs.isArray(cfg.context[cfg.target])) {
                        if (kijs.isArray(cfg.value)) {
                            cfg.context[cfg.target] = kijs.Array.concat(cfg.context[cfg.target], cfg.value);
                        } else if (cfg.value) {
                            cfg.context[cfg.target].push(cfg.value);
                        }

                    } else {
                        if (kijs.isArray(cfg.value)) {
                            cfg.context[cfg.target] = cfg.value;
                        } else if (cfg.value) {
                            cfg.context[cfg.target] = [cfg.value];
                        }

                    }
                    break;

                // zum Array hinzufügen und duplikate entfernen
                case 'appendUnique':
                    if (kijs.isArray(cfg.context[cfg.target])) {
                        if (kijs.isArray(cfg.value)) {
                            cfg.context[cfg.target] = kijs.Array.concatUnique(cfg.context[cfg.target], cfg.value);
                        } else if (cfg.value) {
                            cfg.context[cfg.target].push(cfg.value);
                            kijs.Array.unique(cfg.context[cfg.target]);
                        }

                    } else {
                        if (kijs.isArray(cfg.value)) {
                            cfg.context[cfg.target] = cfg.value;
                            kijs.Array.unique(cfg.context[cfg.target]);
                        } else if (cfg.value) {
                            cfg.context[cfg.target] = [cfg.value];
                        }

                    }
                    break;

                // Objekt mergen (nur 1. Hierarchiestufe)
                case 'assign':
                    if (kijs.isObject(cfg.context[cfg.target])) {
                        if (kijs.isObject(cfg.value)) {
                            Object.assign(cfg.context[cfg.target], cfg.value);
                        } else if (cfg.value) {
                            throw new kijs.Error(`config "${cfg.key}" is not an object`);
                        }
                    } else {
                        if (kijs.isObject(cfg.value)) {
                            cfg.context[cfg.target] = cfg.value;
                        } else if (cfg.value) {
                            throw new kijs.Error(`config "${cfg.key}" is not an object`);
                        }
                    }
                    break;

                // Objekt mergen (ganze Hierarchie)
                case 'assignDeep':
                    if (kijs.isObject(cfg.context[cfg.target])) {
                        if (kijs.isObject(cfg.value)) {
                            kijs.Object.assignDeep(cfg.context[cfg.target], cfg.value);
                        } else if (cfg.value) {
                            throw new kijs.Error(`config "${cfg.key}" is not an object`);
                        }
                    } else {
                        if (kijs.isObject(cfg.value)) {
                            cfg.context[cfg.target] = cfg.value;
                        } else if (cfg.value) {
                            throw new kijs.Error(`config "${cfg.key}" is not an object`);
                        }
                    }
                    break;
                    
                // Listeners des "on"-Objekts mergen
                case 'assignListeners':
                    if (kijs.isObject(cfg.value)) {
                        // context ermitteln
                        let fnContext = null;
                        if (kijs.isEmpty(cfg.value.context)) {
                            fnContext = cfg.context;
                        } else {
                            fnContext = kijs.getObjectFromString(cfg.value.context);
                            if (!kijs.isObject(fnContext)) {
                                throw new kijs.Error('Context of listener ist not valid.');
                            }
                        }
                        
                        // Listeners durchgehen und übernehmen
                        for (let k in cfg.value) {
                            if (k !== 'context') {
                                let fn = kijs.getFunctionFromString(cfg.value[k]);
                                if (!kijs.isFunction(fn)) {
                                    throw new kijs.Error('Listener "' + k + '" ist not valid.');
                                }
                                cfg.context.on(k, fn, fnContext);
                            }
                        }
                    }
                    break;
                    
                // Funktion ausführen
                case 'function':
                    if (kijs.isFunction(cfg.target)) {
                        cfg.target.call(cfg.context, cfg.value);
                    } else {
                        throw new kijs.Error(`config "${cfg.key}" is not a function`);
                    }
                    break;

                // Zuweisung der Eigenschaft verbieten: Fehler ausgeben
                case 'error':
                    throw new kijs.Error(`Assignment of config "${cfg.key}" is prohibited`);
                    break;

            }
        }, this);
        tmpConfigs = null;
    }

    /**
    * Kopiert alle Eigenschaften des source-Objekts in das target-Objekt (rekursiv)
    * @param {Object} target Ziel-Objekt
    * @param {Object} source Quell-Objekt
    * @param {Boolean} [overwrite=true] Sollen bereits existierende Objekte überschrieben werden?
    * @return {Object} Erweitertes Ziel-Objekt
    */
    static assignDeep(target, source, overwrite=true) {
        kijs.Object.each(source, function(key, val){

            // Object -> mergen oder überschreiben mit Klon
            if (kijs.isObject(val)) {
                if (kijs.isObject(target[key])) {
                    kijs.Object.assignDeep(target[key], val, overwrite);
                } else {
                    target[key] = kijs.Object.clone(val);
                }

            // Array -> überschreiben per Klon
            } else if (kijs.isArray(val)) {
                if (overwrite || target[key] === undefined) {
                    target[key] = kijs.Array.clone(val);
                }

            // alles andere (inkl. Funktionen) -> überschreiben
            } else {
                if (overwrite || target[key] === undefined) {
                    target[key] = val;
                }

            }
        }, this);

        return target;
    }

    /**
     * Klont das übergebene Objekt
     * @param {Object} object
     * @returns {Object}
     */
    static clone(object) {
        return JSON.parse(JSON.stringify(object));
    }

    /**
     * Zählt die Anzahl Attribute in einem Objekt
     * @param {Object} object
     * @param {Boolean} [ownPropertysOnly=false]  count only own properties, ignore inherited properties
     * @returns {Number}
     */
    static count(object, ownPropertysOnly=false) {
        if (ownPropertysOnly) {
            let cnt=0;
            if (kijs.isObject(object)) {
                for (let key in object) {
                    if (object.hasOwnProperty(key)) {
                        cnt++;
                    }
                }
            }
            return cnt;
        } else {
            return kijs.isObject(object) ? Object.keys(object).length : 0;
        }
    }

    /**
     * Durchläuft ein Objekt, ruft pro Element die callback-Funktion auf.
     * Die Iteration kann durch die Rückgabe von false gestoppt werden.
     * @param {Object} object
     * @param {Function} fn - Callback Funktion
     * @param {Object} context - Gültigkeitsbereich
     * @returns {undefined}
     */
    static each(object, fn, context) {
        for (let key in object) {
            if (object.hasOwnProperty(key)) {
                if (fn.call(context, key, object[key]) === false) {
                    return;
                }
            }
        }
    }

};
