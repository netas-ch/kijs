Lebenszyklus eines GUI-Elements
================================

Jedes [```kijs.gui.Element```](api:kijs.gui.Element) (und damit fast jede GUI-Klasse) durchläuft die 
gleichen Phasen:  

| Phase           | Funktion                  | Was passiert                                        | Event                |
|-----------------|---------------------------|-----------------------------------------------------|----------------------|
| 1. Erstellen    | ```constructor(config)``` | Objekt und Unterobjekte werden erstellt, Config wird angewendet. Es gibt noch **keinen** DOM-Node. | – |
| 2. Rendern      | [```render()```](api:kijs.gui.Element#render) / [```renderTo(node)```](api:kijs.gui.Element#renderTo) | DOM-Node wird erstellt bzw. aktualisiert und eingefügt | ```afterRender```, ```afterFirstRenderTo``` |
| 3. Aktualisieren| Setter, ```render()```    | Änderungen werden in den DOM übernommen              | ```afterRender```, ```afterResize```  |
| 4. Unrendern    | [```unrender()```](api:kijs.gui.Element#unrender)          | DOM-Node wird entfernt. Das Objekt bleibt bestehen und kann wieder gerendert werden. | ```unrender``` |
| 5. Zerstören    | [```destruct()```](api:kijs.gui.Element#destruct)          | Objekt wird mitsamt allen Unterobjekten entladen     | ```destruct```       |

Wichtig ist die Trennung zwischen **Objekt** und **DOM-Node**: Das Objekt lebt von 
```constructor``` bis ```destruct```. Der DOM-Node lebt nur zwischen ```render``` und 
```unrender```. Ein Objekt kann mehrmals gerendert und unrendert werden und erhält dabei 
jedes Mal einen neuen Node.


1\. Erstellen
------------
Im Konstruktor werden alle Klassenvariablen deklariert, Unterobjekte (z.B. 
[```kijs.gui.Dom```](api:kijs.gui.Dom) oder weitere Elemente) erstellt und die Config angewendet 
(siehe Leitfaden [Config-System](Config-System.md)).  

Zu diesem Zeitpunkt existiert noch kein DOM-Node. Darum:  
- Im Konstruktor nie auf ```this._dom.node``` zugreifen.  
- Setter müssen auch funktionieren, wenn das Element noch nicht gerendert ist. 
  Sie speichern den Wert nur, das Rendern übernimmt ihn später.  


2\. Rendern
----------
### render() und renderTo()
- ```render()``` erstellt bzw. aktualisiert den DOM-Node, fügt ihn aber **nicht** 
  in das Dokument ein.  
- ```renderTo(targetNode, referenceNode, insertPosition)``` ruft ```render()``` auf 
  und fügt den Node anschliessend in ```targetNode``` ein (anhängen oder vor/nach 
  ```referenceNode```).  

Normalerweise muss man nur das oberste Element selbst rendern. Alles andere 
geschieht automatisch:  
- [```kijs.gui.ViewPort```](api:kijs.gui.ViewPort) verwendet ```document.body``` als eigenen Node. Hier 
  reicht ein ```render()```.  
- [```kijs.gui.Window.show()```](api:kijs.gui.Window#show) rendert das Fenster.  
- Ein [```kijs.gui.Container```](api:kijs.gui.Container) rendert in seinem ```render()``` alle ```elements``` 
  mit ```renderTo()``` in seinen inneren Node.  

### Was beim Rendern passiert
```kijs.gui.Dom.render()``` erstellt den Node nur beim ersten Mal 
(```document.createElement```). Dabei werden auch Style, Grösse, Position und 
```nodeAttribute``` übernommen. Bei jedem weiteren Aufruf von ```render()``` bleibt 
der Node bestehen, es werden aber ```html``` und die CSS-Klassen erneut zugewiesen.  

Ein bereits gerendertes Element kann also gefahrlos nochmals gerendert werden. 
```renderTo()``` mit einem bereits eingefügten Node verschiebt ihn einfach an die 
neue Position (```appendChild``` / ```insertBefore```).  

### Events
| Event                    | Wann                                                           |
|--------------------------|----------------------------------------------------------------|
| ```afterRender```        | Nach **jedem** Rendern                                         |
| ```afterFirstRenderTo``` | Nur beim **ersten** ```renderTo()```, also wenn der Node das erste Mal im Dokument ist |

Mit der Config ```autoLoad: true``` wird beim Event ```afterFirstRenderTo``` 
automatisch [```load()```](api:kijs.gui.Element#load) aufgerufen (z.B. um Daten via RPC zu laden).  

### render() überschreiben
Klassen mit eigenen Unterobjekten überschreiben ```render()```. Dabei gilt immer das 
gleiche Muster (gekürzt aus [```kijs.gui.Button```](api:kijs.gui.Button)):  

    // overwrite
    render(superCall) {
        // Vorbereitungen, die vor dem Rendern des eigenen Nodes nötig sind
        ...

        // Basisklasse rendern. Ab hier existiert this._dom.node
        super.render(true);

        // Unterobjekte in den eigenen Node rendern
        if (!this._captionDom.isEmpty) {
            this._captionDom.renderTo(this._dom.node);
        } else if (this._captionDom.isRendered) {
            this._captionDom.unrender();
        }

        // Event afterRender auslösen
        if (!superCall) {
            this.raiseEvent('afterRender');
        }
    }

Beachte:  
- ```super.render(true)``` wird immer mit ```true``` aufgerufen.  
- Unterobjekte, die leer sind, werden nicht gerendert bzw. wieder entfernt. So kann 
  ```render()``` auch nach einer Änderung aufgerufen werden und bringt den DOM 
  immer in den richtigen Zustand.  
- Die Reihenfolge der ```renderTo()```-Aufrufe bestimmt die Reihenfolge im DOM.  


Das superCall-Muster
--------------------
```render```, ```unrender``` und ```destruct``` haben alle das Argument ```superCall```. 
Es sorgt dafür, dass Events nur **einmal** ausgelöst werden, auch wenn die Funktion 
durch mehrere Klassen der Vererbungskette läuft.  

- Wer die Funktion von aussen aufruft, übergibt nichts (```superCall``` = ```undefined```).  
- Jede Klasse ruft die Funktion der Basisklasse mit ```super.xy(true)``` auf.  
- Nur wer mit ```!superCall``` aufgerufen wurde, löst das Event aus. Das ist also 
  immer die unterste (zuletzt abgeleitete) Klasse.  

| Funktion       | Event wird ausgelöst          | Aufruf der Basisklasse        |
|----------------|-------------------------------|-------------------------------|
| ```render```   | am **Ende** (Node ist fertig) | ```super.render(true)```      |
| ```unrender``` | am **Anfang** (Node ist noch da) | ```super.unrender(true)``` |
| ```destruct``` | am **Anfang**, nach dem ```unrender``` | ```super.destruct(true)``` |


3\. Aktualisieren
----------------
### Setter nach dem Rendern
Ändert sich eine Eigenschaft, nachdem das Element bereits gerendert ist, muss der 
DOM nachgeführt werden. Das übliche Muster:  

    set caption(val) {
        this._captionDom.html = val;
        if (this.isRendered) {
            this.render();
        }
    }

Einfache Änderungen, die nur ein ```kijs.gui.Dom```-Objekt betreffen (z.B. 
[```clsAdd()```](api:kijs.gui.Dom#clsAdd), ```style```, ```html```), schreibt das Dom-Objekt selbst direkt in 
den Node, falls er existiert. Hier ist kein ```render()``` nötig.  

### Zustand nie nur im DOM speichern
Weil der Node bei ```unrender()``` gelöscht und beim nächsten ```render()``` neu 
erstellt wird, muss jeder Zustand in einer Klassenvariable (oder einem 
```kijs.gui.Dom```-Objekt) gespeichert sein. Was nur im DOM steht, geht beim 
nächsten Unrendern verloren.  

```kijs.gui.Dom``` liest deshalb beim ```unrender()``` die aktuellen 
```nodeAttribute``` zurück, damit sie beim nächsten Rendern wieder vorhanden sind.  

### Elemente hinzufügen und entfernen
[```kijs.gui.Container.add()```](api:kijs.gui.Container#add) und [```remove()```](api:kijs.gui.Container#remove) rendern den Container automatisch 
neu, wenn er bereits gerendert ist. Werden mehrere Änderungen nacheinander gemacht, 
kann das mit ```{ preventRender: true }``` verhindert und am Schluss einmal 
```render()``` aufgerufen werden.  

### visible ist kein unrender
```visible: false``` setzt nur die CSS-Klasse ```kijs-hidden```. Der Node bleibt 
im DOM, samt allen Listeners und Kind-Elementen. Das Event heisst 
```changeVisibility```.  

### afterResize
Das Event ```afterResize``` wird ausgelöst, wenn sich die Grösse eines Elements 
geändert hat. Ablauf:  
1. ```kijs.gui.ViewPort``` hört auf das ```resize```-Event des Browserfensters.  
2. Jedes Element registriert beim Zuweisen von ```parent``` einen Listener auf 
   ```afterResize``` des Elternelements. So wird das Event im Baum nach unten 
   weitergegeben.  
3. Ein Element löst ```afterResize``` nur aus, wenn sich seine eigene Grösse 
   tatsächlich geändert hat (Vergleich mit der Grösse beim letzten Event).  
4. Beim Ursprung (z.B. ViewPort bei Änderung der Fenstergrösse, Setter ```width```/```height```) 
   wird das Event mit einer Verzögerung von ```afterResizeDelay``` (Standard 300 ms) 
   ausgelöst, damit es nicht bei jedem Pixel kommt. Die Weitergabe an die Kinder 
   erfolgt dann ohne weitere Verzögerung.  

Während [```applyConfig()```](api:kijs.gui.Element#applyConfig) im Konstruktor ist ```afterResize``` unterdrückt.  


4\. Unrendern
------------
```unrender()``` entfernt den DOM-Node aus dem Dokument:  
1. Event ```unrender``` auslösen  
2. Laufende Timer abbrechen  
3. Bei Containern: alle Kind-Elemente unrendern  
4. Node-Event-Listeners entfernen, Kind-Nodes und den Node selbst löschen  

Das Objekt bleibt dabei vollständig erhalten und kann mit ```render()``` bzw. 
```renderTo()``` wieder angezeigt werden. Das ist z.B. sinnvoll, wenn ein Element 
von einem Container in einen anderen verschoben wird.  

Beim Überschreiben gilt das gleiche Muster wie bei ```render```:  

    // overwrite
    unrender(superCall) {
        // Event auslösen
        if (!superCall) {
            this.raiseEvent('unrender');
        }

        // Unterobjekte unrendern
        if (this._captionDom) {
            this._captionDom.unrender();
        }

        super.unrender(true);
    }


5\. Zerstören
------------
```destruct()``` entlädt das Objekt endgültig. Ablauf in ```kijs.gui.Element```:  
1. ```afterResize``` unterdrücken  
2. ```unrender()``` aufrufen und Event ```destruct``` auslösen (nur bei ```!superCall```)  
3. Eigene Listeners auf **fremden** Objekten entfernen (z.B. auf dem Elternelement)  
4. Unterobjekte mit ```destruct()``` entladen  
5. Variablen mit Objekten/Arrays auf ```null``` setzen  
6. ```super.destruct(true)``` aufrufen. Ganz am Schluss entfernt 
   [```kijs.Observable```](api:kijs.Observable) alle Listeners, die **auf diesem Objekt** registriert sind.  

Das Muster dazu steht im Leitfaden [Aufbau einer Klasse](Aufbau_einer_Klasse.md).  

Nach ```destruct()``` darf das Objekt nicht mehr verwendet werden. Viele Variablen 
sind ```null``` und ein Zugriff führt zu Fehlern.  

### Listeners auf fremden Objekten
Listeners, die ein Objekt auf **sich selbst** registriert hat, werden automatisch 
entfernt. Listeners, die es auf einem **anderen** Objekt registriert hat, bleiben 
dort aber bestehen, solange das andere Objekt lebt. Sie müssen im ```destruct()``` 
entfernt werden, sonst ruft das andere Objekt später eine Funktion eines bereits 
zerstörten Objekts auf. Am einfachsten über den Kontext:  

    // Alle Listeners entfernen, die dieses Objekt auf dem Parent registriert hat
    if (this._parentEl) {
        this._parentEl.off(null, null, this);
    }

Dasselbe gilt für Listeners auf globalen Objekten (z.B. einer App-Instanz) und für 
Timer (```kijs.defer```, ```kijs.interval```).  

### Wer ruft destruct() auf?
| Situation                                  | destruct                                      |
|--------------------------------------------|-----------------------------------------------|
| Container wird zerstört                    | alle ```elements``` werden automatisch zerstört |
| ```container.remove(el)```                 | ```el``` wird zerstört, ausser mit ```{ preventDestruct: true }``` (dann nur unrender, ausser mit ```preventUnrender```) |
| ```window.close()```                       | Fenster wird unrendert und zerstört, ausser mit ```close(true)``` |
| Unterobjekte, die eine Klasse selbst erstellt | müssen im eigenen ```destruct()``` zerstört werden |
| Oberstes Objekt (z.B. ViewPort) oder ein frei erstelltes Element, das nie einem Container hinzugefügt wurde | muss vom Ersteller zerstört werden |

Grundregel: **Wer ein Objekt erstellt, ist auch für dessen Zerstörung zuständig.** 
Wird es einem Container übergeben, übernimmt der Container diese Aufgabe.  


Checkliste für eine eigene Klasse
---------------------------------
1. Im Konstruktor nicht auf den DOM zugreifen.  
2. Setter speichern den Wert in einer Variable und rufen bei Bedarf 
   ```if (this.isRendered) { this.render(); }``` auf.  
3. ```render(superCall)```: zuerst ```super.render(true)```, dann Unterobjekte 
   rendern, am Schluss ```afterRender``` bei ```!superCall```.  
4. ```render()``` muss beliebig oft aufgerufen werden können und den DOM jedes Mal 
   in den richtigen Zustand bringen.  
5. ```unrender(superCall)```: Event bei ```!superCall```, Unterobjekte unrendern, 
   ```super.unrender(true)```.  
6. ```destruct(superCall)```: Listeners auf fremden Objekten entfernen, Timer 
   abbrechen, Unterobjekte zerstören, Variablen auf ```null``` setzen, 
   ```super.destruct(true)```.  
