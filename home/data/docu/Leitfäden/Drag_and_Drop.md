Drag & Drop
===========

Einführung
----------
kijs verwendet eigene Klassen und Events für Drag&Drop.  
Diese basieren auf der nativen Drag&Drop Funktionalität von JavaScript.  
Beim realisieren einer Drag&Drop-Funktionalität sollte die kijs eigene 
Funktionalität verwendet werden.  

### Vorteile  
 - Einfach zu implementieren
 - Drag & Drop auch über unterschiedliche Elements möglich.

### Klassen
 - kijs.gui.dragDrop (Statische Klasse mit informationen zur aktuellen 
   DD-Operation und statischen Hilfsfunktionen)  
 - kijs.gui.dragDrop.Source (Klasse mit Drag&Drop-Events/Funktionen, für das 
   Element das gezogen wird)  
 - kijs.gui.dragDrop.Target (Klasse mit Drag&Drop-Events/Funktionen, für das 
   Ziel-Element)


Drag&Drop Source
----------------
Um ein Element draggable zu machen, genügt es ihm über die Eigenschaft ```ddSource``` 
die Einstellungen mitzuteilen, die es benötigt:

    let myElement = new kijs.gui.Element({
        ddSource: {
            name: 'myAwesomeElement', // Drag&Drop Name
            allowMove: true,    // Darf das Element per Drag&Drop verschoben werden?
            allowCopy: false,   // Darf das Element per Drag&Drop kopiert werden?
            allowLink: false,   // Darf per Drag&Drop eine Verknüpfung erstellt werden?
            ownerDomProperty: 'dom' // Property-Name des draggable DOM-Elements.
            on: {
                drop: function(e) { // Falls beim Drop auch beim Source etwas gemacht 
                                    // werden muss. Kann hier ein Listener gemacht werden.
                    console.log('source save');
                },
                context: this
            }
        }
    });

Mehr ist beim Source nicht nötig.  

Hier noch ein genauer Beschrieb der möglichen ddSource-Einstellungen:  

### name
Beliebiger Name (String) für das Source-Element. Dieser Name muss dann beim Ziel-Element 
im Mapping definiert werden, damit ein Drop darauf möglich ist.  

### allowMove, allowCopy, allowLink
Hier kann eingestellt werden, ob verschieben oder kopiert werden soll. Auch eine 
Verknüpfung ist möglich.  Standard = move
Falls mehrere Möglich ist, kann via Tastenkombination während des Ziehens die 
gewünschte Operation gewählt werden:  
 - move: keine Taste  
 - copy: Ctrl  
 - link: Ctrl + Shift  

### ownerDomProperty
Falls nicht das ganze Element draggable sein soll, kann hier der Name des 
Properties angegeben werden (Standard='dom').  

Wenn z.B. ein Panel nur via Klicken und Ziehen auf dem PanelHeader gezogen werden 
kann, kann dafür ```ownerDomProperty='headerBar.dom'``` eingestellt werden.  

### Listeners (on)
Es gibt zwei Events, die über Listeners abgefragt werden können:  
 - ```destruct``` Wird ausgelöst, wenn das Drag&Drop-Source entladen wird.  
 - ```drop```     Wird bei einem erfolgreichen Drop ausgelöst. Damit können beim 
   Source Operationen gemacht werden.  


Drag&Drop Target
----------------
Targets sind meist Container, in die die Elemente gedroppt werden können.  
Anhand der Mauszeigerposition wird die Position im Container ermittelt, an welcher 
das Element gedroppt wird.  
Folgende drop-Positionen sind möglich:  
 - before = Element wird vor einem bestehenden Element gedroppt.  
 - after = Element wird nach einem bestehenden Element gedroppt (oder falls noch kein 
   Element im Container ist, als erstes Kind eingefügt)  
 - child = Element wird als Kind bei einem bestehenden Element angehängt.  

Um ein Container als Ziel zu aktivieren, reicht eine einfache config nicht aus. Es muss 
eine eigene Klasse erstellt werden.  
Diese muss das property, getter/setter ```ddTarget``` enthalten und einen Drop-Listener 
auf das ddTarget.  
Hier ist ein Beispiel, dass für eigene Klassen verwendet werden kann:  

    myApp.myDdTarget = class myApp_myDdTarget extends kijs.gui.Container {

        // --------------------------------------------------------------
        // CONSTRUCTOR
        // --------------------------------------------------------------
        // overwrite
        constructor(config={}) {
            super(false);

            this.ddTarget = {
                posBeforeFactor: 0.666,
                posAfterFactor: 0.666,
                mapping: {
                    myAwesomeElement:{
                        allowMove: true,
                        allowCopy: false,
                        allowLink: false,
                        disableMarkerAutoSize: false,
                        markerWidth: 100,
                        markerHeight: 50,
                        markerCls: 'myCssClass',
                        markerHtml: '<b>Ich bin ein Marker</b>'
                    }
                },
                on: {
                    drop: this.#onDrop,
                    context: this
                }
            };

            // Standard-config-Eigenschaften mergen
            Object.assign(this._defaultConfig, {
                // nix
            });

            // Mapping für die Zuweisung der Config-Eigenschaften
            Object.assign(this._configMap, {
                ddTarget: { target: 'ddTarget' }
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
        get ddTarget() { 
            return this._ddTarget; 
        }
        set ddTarget(val) {
            // config-object
            if (kijs.isObject(val)) {
                if (kijs.isEmpty(this._ddTarget)) {
                    val.ownerEl = this;
                    if (kijs.isEmpty(val.ownerDomProperty)) {
                        val.ownerDomProperty = 'innerDom';
                    }
                    this._ddTarget = new kijs.gui.dragDrop.Target(val);
                } else {
                    this._ddTarget.applyConfig(val);
                }

            // null
            } else if (val === null) {
                if (this._ddTarget) {
                    this._ddTarget.destruct();
                }
                this._ddTarget = null;

            } else {
                throw new kijs.Error(`ddTarget must be a object or null`);

            }
        }



        // --------------------------------------------------------------
        // MEMBERS
        // --------------------------------------------------------------
        // PRIVATE
        // LISTENERS
        #onDrop(e) {
            // Hilfsfunktion, die das Element an den neuen Ort verschiebt
            kijs.gui.DragDrop.dropFnMoveEl(e);
            
            console.log('target save');
        }



        // --------------------------------------------------------------
        // DESTRUCTOR
        // --------------------------------------------------------------
        // overwrite
        destruct(superCall) {
            if (!superCall) {
                // unrender
                this.unrender(superCall);

                // Event auslösen.
                this.raiseEvent('destruct');
            }

            // Elemente/DOM-Objekte entladen
            if (this._ddTarget) {
                this._ddTarget.destruct();
            }

            // Variablen (Objekte/Arrays) leeren
            this._ddTarget = null;

            // Basisklasse entladen
            super.destruct(true);
        }

    };


Hier noch ein genauer Beschrieb der möglichen ddTarget-Einstellungen:  

### ownerDomProperty
Falls nicht das ganze Element als Ziel sein soll, kann hier der Name des 
Properties angegeben werden (Z.B. 'innerDom').  

Wenn z.B. bei einem Panel nur der innerDom als Ziel dienen soll, kann dafür 
```ownerDomProperty='innerDom'``` eingestellt werden.  

### posBeforeFactor
Zahl zwischen 0 und 1. Default=0.666  
Muss <= als ```posAfterFactor``` sein.  
Position des Splittpunkts für das Einfügen voher (before).  
Wird vor dieser Position gedroppt, so wird das Element vorher eingefügt.  
Wird nachher gedroppt, geschieht nichts.  

### posAfterFactor
Zahl zwischen 0 und 1. Default=0.666  
Muss >= als ```posBeforeFactor``` sein.  
Position des Splittpunkts für das Einfügen nachher (after).  
Wird vor nach Position gedroppt, so wird das Element nach eingefügt.  
Wird vorher gedroppt, geschieht nichts.  

    flex-direction: 'column'    flex-direction: 'row'
    mit posBeforeFactor=0.333   mit posBeforeFactor=0.666
    und posAfterFactor=0.666    und posAfterFactor=0.666
    ----------------------      ------------------------------
    |    drop before     |      |                  |         |
    |--------------------|      |       drop       |  drop   |
    |     kein Drop*     |      |      before      |  after  |
    |--------------------|      |                  |         |
    |     drop after     |      ------------------------------
    ----------------------
    
    *der kein Drop-Bereich kann benutzt werden, wenn das Element selbst wieder ein 
     Target ist.

### mapping
Mit dem Mapping kann definiert werden, welche Source-Elemente auf dieses Element 
verschoben, kopiert oder verknüpft werden dürfen.  
Im Mapping wird für jeden ddSource-```name``` folgende Eigenschaften definiert:  

#### allowMove, allowCopy, allowLink
Hier kann eingestellt werden, ob verschieben, kopieren oder verknüpfen auf dieses 
Ziel erlaubt ist.  

#### disableMarkerAutoSize
Boolscher Wert. Default=false  
Falls der Platzhalter für die Einfügeposition (DropMarker) nicht die gleiche Grösse, 
wie das Quell-Element haben soll, kann dies hiermit ausgeschltet werden. Die Grösse 
der DropMarkers muss dann mittels CSS definiert werden.  

#### markerWidth
Zahl. Default=null  
Falls ein Wert angegeben wird, hat der Marker eine fixe Breite.  
Damit kann die automatische Breite oder die Breite aus dem CSS übersteuert werden.  

#### markerHeight
Zahl. Default=null  
Falls ein Wert angegeben wird, hat der Marker eine fixe Höhe.  
Damit kann die automatische Höhe oder die Höhe aus dem CSS übersteuert werden.  

#### markerCls
String oder Array mit Strings. Default=null  
Damit kann dem Marker eine oder mehrere zusätzliche CSS-Klasse zu ```kijs-dropmarker``` 
zugewiesen werden.  

#### markerHtml
String. Default=null  
Damit kann dem Marker ein HTMl-Inhalt zugewiesen werden.  


### Listeners (on)
Es gibt zwei Events, die über Listeners abgefragt werden können:  
 - ```destruct``` Wird ausgelöst, wenn das Drag&Drop-Target entladen wird.  
 - ```drop```     Wird bei einem erfolgreichen Drop ausgelöst. Damit können beim 
   Target Operationen gemacht werden.  


CSS
---
kijs weist automatisch elementen automatisch CSS-Klassen zu:

### kijs-dragging
Dem Source-Element wärend des ganzen Drag&Drop Vorgangs.  

### kijs-dragover
Dem Source-Element, wenn sich der Mauszeiger über ihm befindet.  

### kijs-dropmarker
An der neuen Einfügeposition wird ein Platzhalter angezeigt. Dies ist ein 
kijs.gui.Dom, dessen HTML-Node direkt in den Dom gerendert wird.  
Dieses DIV hat die CSS-Klasse ```kijs-dropmarker```.  


### Beispiel CSS
    .myContainer {
        > .kijs-container-inner {

            > .myItem {
                &.kijs-dragging {
                    opacity: 0.6
                }

                &.kijs-dragover {
                    border: 2px solid var(--accentColor3);
                }
            }

            /* Drop Marker */
            > .kijs-dropmarker {
                flex: none;
                height: 30px;
                border: 2px solid var(--accentColor3);
                border-radius: 5px;
            }

        }
    }


sortable
--------
In kijs gibt es einige Elemente, die ein sortieren per Elemente per Drag&Drop 
unterstützen:  
 - kijs.gui.Dashboard  
 - kijs.gui.container.Tab  
 - kijs.gui.Tree (TODO)  
 - kijs.gui.Grid (TODO)  
 - kijs.gui.DataView (TODO)  
 - kijs.gui.ListView (TODO)  
 - kijs.gui.field.ListView (TODO)  
 - kijs.gui.field.CheckboxGroup (TODO)  
 - kijs.gui.field.OptionGroup (TODO)  
 
Dafür kann einfach das property ```sortable``` auf ```true``` gesetzt werden.  


disabled
--------
Source-Elemente die disabled sind, können auch gezogen werden.  
Auf Target-Elemente die disabled sind, können keine Elemente gezogen werden.  
