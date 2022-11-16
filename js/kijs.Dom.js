/* global kijs */

// --------------------------------------------------------------
// kijs.Dom (Static)
// --------------------------------------------------------------
kijs.Dom = class kijs_Dom {

    // --------------------------------------------------------------
    // STATICS GETTERS
    // --------------------------------------------------------------
    /**
     * Array mit den Propertys, die nicht direkt gesetzt werden können (node.Eigenschaft = Wert), sondern
     * via die Funktion node.setAttribute(Eigenschaft, Wert) gesetzt werden müssen.
     * @returns {Array}
     */
    //static get murgsPropertyNames() { return ['for']; }


    // --------------------------------------------------------------
    // STATICS
    // --------------------------------------------------------------

    // Static Properties in this Class
    //__scrollbarWidth {Number|null}    Damit die Funktion getScrollbarWidth() nur einmal rechnen muss,
    //                                  wird das ergebnis hier gemerkt.

    /**
     * Lesen einer Eigenschaft eines Nodes.
     * Dabei werden Murgs-Attribute automatisch anders gelesen.
     * @param {Node} node
     * @param {String} name
     * @returns {String|null|Boolean|undefined}
     */
    /*static getAttribute(node, name) {
        // Murgs-Attribute
        if (kijs.Array.contains(this.murgsPropertyNames, name)) {
            if (node.hasAttribute(name)) {
                return node.getAttribute(name);
            } else {
                return null;
            }

        // Normale Attribute
        } else {
            return node[name];

        }
    }*/

    /**
     * Zuweisen einer Eigenschaft zu einem node.
     * Dabei werden Murgs-Attribute automatisch anders zugewiesen.
     * @param {Node} node
     * @param {String} name
     * @param {String|null|Boolean|undefined} value
     * @returns {undefined}
     */
    /*static setAttribute(node, name, value) {
        // Murgs-Attribute müssen über node.setAttribute(name, value) gesetzt werden.
        if (kijs.Array.contains(this.murgsPropertyNames, name)) {
            if (!kijs.isEmpty(value)) {
                node.setAttribute(name, value);
            } else {
                node.removeAttribute(name);
            }

        // alle anderen können normal zugewiesen werden
        } else {
            node[name] = value;

        }
    }*/

    /**
     * Überprüft ob ein Node über eine Eigenschaft verfügt.
     * Dabei werden Murgs-Attribute automatisch anders gelesen.
     * @param {Node} node
     * @param {String} name
     * @returns {Boolean}
     */
    /*static hasAttribute(node, name) {
        // Murgs-Attribute
        if (kijs.Array.contains(this.murgsPropertyNames, name)) {
            return node.hasAttribute(name);

        // Normale Attribute
        } else {
            return kijs.isEmpty(node[name]);

        }
    }*/


    /**
     * Erstellt einen Event-Listener auf ein HTMLElement
     *
     * Die Delegates werden dann in der Eigenschaft context._nodeEventListeners gespeichert,
     * damit kann dann ein Listener später auch wieder entfernt werden.
     *
     * context._nodeEventListeners: {
     *     click: [
     *         {node: ..., useCapture: true/false, delegate: ...},
     *         {node: ..., useCapture: true/false, delegate: ...}
     *     ],
     *
     *     mousemove: [
     *         {node: ..., useCapture: true/false, delegate: ...},
     *         {node: ..., useCapture: true/false, delegate: ...}
     *     ]
     * }
     *
     * @param {String} eventName Name des DOM-Events
     * @param {Node} node DOM-Node
     * @param {Function|String} fn  Funktion oder Name des kijs-Events das ausgelöst werden soll
     * @param {kijs.Observable} context
     * @param {Boolean} [useCapture=false] false: Event wird in Bubbeling-Phase ausgelöst
     *                                     true:  Event wird in Capturing-Phase ausgelöst
     * @returns {undefined}
     */
    static addEventListener(eventName, node, fn, context, useCapture) {
        useCapture = !!useCapture;

        context._nodeEventListeners = context._nodeEventListeners || {};
        context._nodeEventListeners[eventName] = context._nodeEventListeners[eventName] || [];

        // Wenn noch kein Delegate existiert: eines erstellen
        if (!this.hasEventListener(eventName, node, context, useCapture)) {
            let delegate = null;

            // Falls keine Funktion, sondern ein kijs-Eventname übergeben wurde, so wird ein kijs-Event ausgelöst
            if (kijs.isString(fn)) {
                let kijsEventName = fn;
                delegate = function(e) {
                    return context.raiseEvent(kijsEventName, {
                        eventName: kijsEventName,
                        nodeEventName: eventName,
                        useCapture: useCapture,
                        nodeEvent: e,
                        context: context
                    }, this);
                };
            } else if (kijs.isFunction(fn)) {
                delegate = function(e) {
                    return fn.apply(context, [{
                        nodeEventName: eventName,
                        useCapture: useCapture,
                        nodeEvent: e,
                        context: context
                    }]);
                };

            } else {
                throw new kijs.Error(`Parameter "fn" can not be empty`);
            }

            context._nodeEventListeners[eventName].push({node:node, useCapture:useCapture, delegate:delegate });
            node.addEventListener(eventName, delegate, useCapture);
        }
    }


    /**
     * Fügt eine CSS Datei hinzu
     * @param {String} src Beispiel: 'kijs.theme.myTheme.css'
     * @param {String} [srcReference=''] Referenznode vor oder nach diesem wird eingefügt. Beispiel: 'kijs.gui.css'
     * @param {Boolean} [before=false] Vor oder nach dem Referenznode
     * @returns {Promise}
     */
    static cssFileAdd(src, srcReference='', before=false) {
        return new Promise((resolve, reject) => {
            let nodeReference = null;
            if (srcReference) {
                nodeReference = document.querySelector('link[href*="' + srcReference + '"]');
            }
           
            let node = document.createElement('link');
            node.href = src;
            node.rel = 'stylesheet';
            
            node.onload = () => resolve(node);
            node.onerror = () => reject(new Error(`CSS-File load error for "${src}"`));

            if (nodeReference) {
                if (before) {
                    document.head.insertBefore(node, nodeReference);
                } else if (nodeReference.nextElementSibling) {
                    document.head.insertBefore(node, nodeReference.nextElementSibling);
                } else {
                    nodeReference = null;
                }
                
            } else {
                document.head.append(node);
                
            }
        });
    }
    
    /**
     * Gibt zurück, ob sich eine CSS-Datei im DOM befindet
     * @param {String} src Beispiel: 'kijs.theme.myTheme.css'
     * @returns {Boolean}
     */
    static cssFileHas(src) {
        return !!document.querySelector('link[href*="' + src + '"]');
    }
    
    /**
     * Entfernt eine CSS Datei
     * @param {String} src Beispiel: 'kijs.theme.myTheme.css'
     * @returns {undefined}
     */
    static cssFileRemove(src) {
        let node = document.querySelector('link[href*="' + src + '"]');
        if (node) {
            node.parentNode.removeChild(node);
        }
    }
    
    /**
     * Ersetzt eine CSS-Datei durch eine andere
     * @param {String} srcOld   Beispiel: 'kijs.theme.default.css'
     * @param {String} srcNew   Beispiel: 'kijs.theme.myTheme.css'
     * @param {Boolean} [sameBaseDir=true]
     * @returns {Promise}
     */
    static cssFileReplace(srcOld, srcNew, sameBaseDir=true) {
        return new Promise((resolve, reject) => {
            let node = document.querySelector('link[href*="' + srcOld + '"]');
            
            if (node) {
                if (sameBaseDir) {
                    let baseDir = node.href;
                    baseDir = baseDir.split('?')[0];                            // remove any ?query
                    baseDir = baseDir.split('/').slice(0, -1).join('/')+'/';    // remove last filename part of path
                    srcNew = baseDir + srcNew;
                }

                node.href = srcNew;
                node.onload = () => resolve(node);
                node.onerror = () => reject(new Error(`CSS-File load error for "${srcNew}"`));
                 
            } else {
                reject(new Error(`CSS-File "${srcOld}" not found`));
                
            }
        });
    }



    /**
     * Gibt die absolute Position eines HTMLElements bezogen zum Browserrand zurück
     * @param {Node} node
     * @returns {Object} im Format {x: 100, y: 80, w: 20, h: 40}
     */
    static getAbsolutePos(node) {
        let x = 0;
        let y = 0;
        let w = node.offsetWidth;
        let h = node.offsetHeight;

        while (node) {
            x += node.offsetLeft - node.scrollLeft;
            y += node.offsetTop - node.scrollTop;
            node = node.offsetParent;
        }
        return {x: x,y: y, w: w, h: h};
    }

    /**
     * Gibt das erste untegeordnete Element zurück, dass Selektiert werden kann (tabIndex >= 0).
     *     undefined: nicht fokussierbar (bei undefined muss die Eigenschaft mit removeAttribute('tabIndex') entfernt werden. Sonst klappts nicht)
     *     tabIndex -1: nur via focus() Befehl fokussierbar
     *     tabIndex  0: Fokussierbar - Browser betimmt die Tabreihenfolge
     *     tabIndex >0: Fokussierbar - in der Reihenfolge wie der tabIndex
     * @param {Node} node
     * @returns {Node|null}
     */
    static getFirstFocusableNode(node) {
        let subNode = null;

        if (node.tabIndex >= 0) {
            return node;

        } else {
            if (node.hasChildNodes()) {
                for (let i=0, len=node.children.length; i<len; i++) {
                    subNode = this.getFirstFocusableNode(node.children[i]);
                    if (subNode) {
                        return subNode;
                    }
                }
            }
        }

        return null;
    }

    /**
     * Berechnet die Breite einer Scrollbar und gibt diese zurück
     * @returns {Number}
     */
    static getScrollbarWidth() {
        // Scrollbarbreite berechnen, falls noch nicht geschehen
        if (!this.__scrollbarWidth) {
            // Siehe https://stackoverflow.com/questions/13382516/getting-scroll-bar-width-using-javascript#13382873
            const outer = document.createElement("div");
            outer.style.visibility = "hidden";
            outer.style.width = "100px";
            outer.style.msOverflowStyle = "scrollbar"; // needed for WinJS apps

            document.body.appendChild(outer);

            const widthNoScroll = outer.offsetWidth;
            // Scrollbar einschalten
            outer.style.overflow = "scroll";

            // inner-DIV einfügen
            const inner = document.createElement("div");
            inner.style.width = "100%";
            outer.appendChild(inner);

            const widthWithScroll = inner.offsetWidth;

            // Aufräumen
            outer.parentNode.removeChild(outer);

            // Breite der Scrollbar berechnen
            this.__scrollbarWidth = widthNoScroll - widthWithScroll;
        }

        return this.__scrollbarWidth;
    }
    
    /**
     * Überprüft, ob ein Event-Listener auf ein HTMLElement existiert
     * @param {String} eventName Name des DOM-Events
     * @param {Node} node DOM-Node
     * @param {kijs.Observable} context
     * @param {Boolean} [useCapture=false] false: Event wird in Bubbeling-Phase ausgelöst
     *                                     true:  Event wird in Capturing-Phase ausgelöst
     * @returns {undefined}
     */
    static hasEventListener(eventName, node, context, useCapture) {
        useCapture = !!useCapture;

        context._nodeEventListeners = context._nodeEventListeners || {};
        context._nodeEventListeners[eventName] = context._nodeEventListeners[eventName] || [];

        // Ist der Listener bereits vorhanden?
        let ret = false;
        if (context._nodeEventListeners[eventName]) {
            kijs.Array.each(context._nodeEventListeners[eventName], function(listener) {
                if (listener.node === node && listener.useCapture === useCapture) {
                    ret = true;
                    return false;
                }
            }, this);
        }

        return ret;
    }

    /**
     * Gibt den index einer childNode in einer Node oder NodeList zurück
     * @param {Node|NodeList} parentNode
     * @param {Node} childNode
     * @returns {Number} -1, wenn nicht gefunden
     */
    static indexOf(parentNode, childNode) {
        let nodeList = parentNode instanceof NodeList ? parentNode : parentNode.childNodes;

        if (nodeList) {
            for (let i=0; i<nodeList.length; i++) {
                if (nodeList[i] === childNode) {
                    return i;
                }
            }
        }
        return -1;
    }

    /**
     * Fügt einen Node in den Dom ein, direkt nach einem anderen Knoten
     * @param {Node} node
     * @param {Node} targetNode
     * @returns {undefined}
     */
    static insertNodeAfter(node, targetNode) {
        targetNode.parentNode.insertBefore(node, targetNode.nextSibling);
    }

    /**
     * Schaut, ob ein Node ein Kindknoten (oder Grosskind, etc.) von einem anderen Node ist (rekursiv).
     * @param {Node} childNode
     * @param {Node} parentNode
     * @param {Boolean} [sameAlso=false] Soll bei childNode===parentNode auch true zurückgegeben werden?
     * @returns {Boolean}
     */
    static isChildOf(childNode, parentNode, sameAlso) {
        if (childNode === parentNode) {
            return !!sameAlso;
        }

        if (childNode.parentNode) {
            if (this.isChildOf(childNode.parentNode, parentNode, true)) {
                return true;
            }
        }

        return false;
    }
    
    /**
     * Fügt eine Javascript Datei hinzu
     * @param {String} src Beispiel: 'myFile.js'
     * @param {String} [srcReference=''] Referenznode vor oder nach diesem wird eingefügt. Beispiel: 'myPreviousFile.js'
     * @param {Boolean} [before=false] Vor oder nach dem Referenznode
     * @returns {Promise}
     */
    static jsFileAdd(src, srcReference='', before=false) {
        return new Promise((resolve, reject) => {
            let nodeReference = null;
            if (srcReference) {
                nodeReference = document.querySelector('script[src*="' + srcReference + '"]');
            }
           
            let node = document.createElement('script');
            node.src = src;
            node.type = 'text/javascript';
            
            node.onload = () => resolve(node);
            node.onerror = () => reject(new Error(`Script-File load error for "${src}"`));

            if (nodeReference) {
                if (before) {
                    document.head.insertBefore(node, nodeReference);
                } else if (nodeReference.nextElementSibling) {
                    document.head.insertBefore(node, nodeReference.nextElementSibling);
                } else {
                    nodeReference = null;
                }
                
            } else {
                document.head.append(node);
                
            }
        });
    }
    
    /**
     * Gibt zurück, ob sich eine Javascript-Datei im DOM befindet
     * @param {String} src Beispiel: 'myFile.js'
     * @returns {Boolean}
     */
    static jsFileHas(src) {
        return !!document.querySelector('script[src*="' + src + '"]');
    }
    
    /**
     * Entfernt eine Javascript Datei
     * @param {String} src Beispiel: 'myFile.js'
     * @returns {undefined}
     */
    static jsFileRemove(src) {
        let node = document.querySelector('script[src*="' + src + '"]');
        if (node) {
            node.parentNode.removeChild(node);
        }
    }
    
    /**
     * Ersetzt eine Javascript-Datei durch eine andere
     * @param {String} srcOld   Beispiel: 'myOldFile.js'
     * @param {String} srcNew   Beispiel: 'myFile.js'
     * @param {Boolean} [sameBaseDir=true]
     * @returns {Promise}
     */
    static jsFileReplace(srcOld, srcNew, sameBaseDir=true) {
        return new Promise((resolve, reject) => {
            let node = document.querySelector('script[src*="' + srcOld + '"]');
            
            if (node) {
                if (sameBaseDir) {
                    let baseDir = node.src;
                    baseDir = baseDir.split('?')[0];                            // remove any ?query
                    baseDir = baseDir.split('/').slice(0, -1).join('/')+'/';    // remove last filename part of path
                    srcNew = baseDir + srcNew;
                }

                node.src = srcNew;
                node.onload = () => resolve(node);
                node.onerror = () => reject(new Error(`Script-File load error for "${srcNew}"`));
                 
            } else {
                reject(new Error(`Script-File "${srcOld}" not found`));
                
            }
        });
    }
    
    
    

    /**
     * Entfernt alle Unterelemente eines DOM-Elements
     * @param {Node} node
     */
    static removeAllChildNodes(node) {
        if (node.replaceChildren) {
            // faster (firefox 78+, chrome 86+, ..)
            node.replaceChildren();
        }

        // Bugfix: replaceChildren funktioniert in Safari 14.0.1 nicht korrekt,
        // daher das while auch ausführen, wenn replaceChildren ausgeführt wurde.
        while (node.hasChildNodes()) {
            node.removeChild(node.lastChild);
        }
    }

    /**
     * Entfernt alle Event-Listeners eines Context
     * @param {kijs.Observable} context
     * @returns {undefined}
     */
    static removeAllEventListenersFromContext(context) {
        if (!kijs.isEmpty(context._nodeEventListeners)) {
            kijs.Object.each(context._nodeEventListeners, function(eventName, listeners) {
                kijs.Array.each(listeners, function(listener) {
                    listener.node.removeEventListener(eventName, listener.delegate, listener.useCapture);
                }, this);
            }, this);
        }

        context._nodeEventListeners = {};
    }
    
    
    /**
     * Entfernt einen Event-Listener von einem Node
     * @param {String} eventName
     * @param {Node} node
     * @param {kijs.Observable} context
     * @param {Boolean} [useCapture=false] false: Event wird in Bubbeling-Phase ausgelöst
     *                                     true:  Event wird in Capturing-Phase ausgelöst
     * @returns {undefined}
     */
    static removeEventListener(eventName, node, context, useCapture) {
        useCapture = !!useCapture;

        context._nodeEventListeners = context._nodeEventListeners || {};
        context._nodeEventListeners[eventName] = context._nodeEventListeners[eventName] || [];

        // Delegate ermitteln und Listener aus Array entfernen
        let delegate = null;
        if (!kijs.isEmpty(context._nodeEventListeners[eventName])) {
            const arr = [];

            kijs.Array.each(context._nodeEventListeners[eventName], function(listener) {
                if (listener.node === node && listener.useCapture === useCapture) {
                    delegate = listener.delegate;
                } else {
                    arr.push(listener);
                }
            }, this);

            context._nodeEventListeners[eventName] = arr;
        }

        // Listener entfernen
        if (delegate) {
            node.removeEventListener(eventName, delegate, useCapture);
        }
    }


    /**
     * Fügt html-Code in einen Node. Je nach htmlDisplayType geschieht dies auf unterschiedliche Weise.
     * Bereits vorhandener Inhalt wird gelöscht.
     * @param {HTMLELement} node
     * @param {String} html
     * @param {String} htmlDisplayType [optional]   'html': als html-Inhalt (innerHtml)
     *                                              'code': Tags werden als als Text angezeigt
     *                                              'text': Tags werden entfernt
     * @returns {undefined}
     */
    static setInnerHtml(node, html, htmlDisplayType) {
        html = kijs.toString(html);

        switch (htmlDisplayType) {
            case 'code':
                node.textContent = html;
                break;

            case 'text':
                let d = document.createElement('div');
                d.innerHTML = html;
                node.textContent = d.innerText || d.textContent || '';
                d = null;
                break;

            case 'html':
            default:
                node.innerHTML = html;
                break;
        }
    }
    

    // Aktuelles Farbschema zurückgeben
    static themeGet() {
        return document.querySelector('html').dataset.theme;
    }

    // Farbschema aktivieren. 'light', 'dark' oder null=auto oder einen benutzerdefiniertes Farbschema
    static themeSet(theme) {
        if (theme === null) {
            if (!!window.matchMedia('(prefers-color-scheme: dark)').matches) {
                theme = 'dark';
            } else {
                theme = 'light';
            }
        }
        document.querySelector('html').dataset.theme = theme;
    }

};
