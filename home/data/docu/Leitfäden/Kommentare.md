Kommentare
==========

Kommentare haben in kijs zwei Aufgaben:  
1. Den Code für Entwickler verständlich machen  
2. Als Quelle für eine automatisch erstellte API-Dokumentation dienen  

Dafür gilt ein Grundsatz:  

**Jede Information wird genau einmal dokumentiert, und zwar dort, wo sie im Code 
definiert ist.**  


Übersicht
---------
| Was                       | Wo                                   | Art                     |
|---------------------------|--------------------------------------|-------------------------|
| Klasse, Events, Beispiel  | direkt über der Klasse               | JSDoc ```/** ... */```  |
| Config-Eigenschaften      | in der ```_configMap```              | ```// {Typ} Text```     |
| Eigenschaften (Getter/Setter) | über dem Getter                  | JSDoc                   |
| Funktionen                | über der Funktion                    | JSDoc                   |
| Erklärungen im Code       | im Code                              | ```// Text```           |


1\. Klassenkommentar
--------------------
Steht direkt über der Klasse und enthält nur, was nirgends sonst im Code steht:  
- eine kurze Beschreibung (1-3 Sätze)  
- optional ein Beispiel mit ```@example```  
- die Events, die die Klasse **selbst** auslöst, mit ```@fires```  

Events brauchen einen Kommentar, weil sie im Code nirgends deklariert sind (siehe 
Leitfaden [Ereignisse](Ereignisse.md)). Pro Event: Name, wann es ausgelöst wird und welche 
zusätzlichen Eigenschaften ```e``` hat. Bei ```before...```-Events erwähnen, was 
die Rückgabe ```false``` bewirkt.  

    // --------------------------------------------------------------
    // kijs.gui.field.Text
    // --------------------------------------------------------------
    /**
     * Einzeiliges Textfeld.
     *
     * @example
     * new kijs.gui.field.Text({ label: 'Name', required: true });
     *
     * @fires change  Nach einer Änderung durch den Benutzer. e: oldValue, value
     * @fires input   Bei jeder Eingabe (weitergeleitet vom Eingabefeld)
     */
    kijs.gui.field.Text = class kijs_gui_field_Text extends kijs.gui.field.Field {

Zu den eigenen Events gehören auch die, die mit ```_eventForwardsAdd()``` von 
Unterobjekten weitergeleitet werden. Der Generator findet die Aufrufe von 
[```raiseEvent()```](api:kijs.Observable#raiseEvent) und ```_eventForwardsAdd()``` im Code und kann so Events melden, 
die noch kein ```@fires``` haben.  

**Nicht** in den Klassenkommentar gehören:  
- Klassenhierarchie (ergibt sich aus ```extends```)  
- Listen mit CONFIG-Parametern, Funktionen oder Eigenschaften  
- geerbte Events  


2\. Config-Eigenschaften
------------------------
Die ```_configMap``` ist die einzige vollständige Liste aller Config-Eigenschaften 
einer Klasse. Darum werden sie dort dokumentiert.  

### Config mit gleichnamigem Getter/Setter: kein Kommentar
Die meisten Config-Eigenschaften haben einen Getter/Setter mit demselben Namen. 
Dann wird nur der Getter dokumentiert (siehe Punkt 3). Der Generator übernimmt 
diese Doku auch für die Config.  

    caption: { target: 'caption' },
    disableFlex: { target: 'disableFlex' },

Das gilt auch für Einträge mit ```true```, wenn es einen gleichnamigen Getter gibt.  

### Config ohne eigenen Getter/Setter: Kommentar am Zeilenende
Das betrifft vor allem Weiterleitungen an Unterobjekte (```context```) und 
```fn: 'function'```:  

    badgeCls: { fn: 'function', target: this._badgeDom.clsAdd, context: this._badgeDom }, // {String|Array} CSS-Klassen des Badges
    captionStyle: { fn: 'assign', target: 'style', context: this._captionDom },         // {Object} CSS-Styles der Beschriftung

Format: ```// {Typ} Beschreibung```  

Ist die Beschreibung zu lang für eine Zeile, steht sie als ```//```-Zeilen 
**direkt über** dem Eintrag:  

    // {Boolean|String} Abstände:
    // true=schmal, false=breit, 'auto'=abhängig davon, ob eine Beschriftung vorhanden ist
    smallPaddings: true,

### Standardwerte
Standardwerte liest der Generator selbst: aus ```_defaultConfig```, sonst aus der 
Zuweisung im Constructor (```this._columns = 1;```) und bei Configs, die an ein 
Unterelement weitergeleitet werden, aus dessen Klasse. Nur wenn der Standardwert so 
nicht ermittelt werden kann (z.B. Setter ohne Feld oder berechnete Werte), wird er in 
der Beschreibung angegeben: ```Default: 0```.  


3\. Eigenschaften (Getter/Setter)
---------------------------------
Ein Getter/Setter-Paar wird **einmal** dokumentiert, und zwar beim Getter. Der Typ 
wird mit ```@type``` angegeben.  

    /**
     * Beschriftung (HTML). Leer = keine Beschriftung
     * @type {String}
     */
    get caption() { return this._captionDom.html; }
    set caption(val) { ... }

Ein Getter ohne Setter ist ```readonly```. Das erkennt der Generator selbst.  


4\. Funktionen
--------------
Funktionen erhalten einen JSDoc-Kommentar mit Beschreibung, Argumenten und 
Rückgabewert:  

    /**
     * Gibt untergeordnete Elemente aufgrund ihres 'name' zurück
     * @param {String} name
     * @param {Number} [deep=-1]              Suchtiefe. 0=nur direkte Kinder, -1=unendlich
     * @param {Boolean} [breakOnFirst=false]  Nur das erste Element zurückgeben?
     * @returns {kijs.gui.Element[]}
     */
    getElementsByName(name, deep=-1, breakOnFirst=false) {

| Sichtbarkeit             | JSDoc         |
|--------------------------|---------------|
| public                   | Pflicht       |
| protected (```_xy```)    | Pflicht       |
| private (```#xy```)      | optional      |
| Listeners (```#onXy```)  | nicht nötig   |

Optionale Argumente stehen in eckigen Klammern, mit Standardwert: ```[deep=-1]```.  
Ein Argument ```options``` (Objekt) wird mit Unterpunkten dokumentiert:  

    /**
     * @param {Object} [options={}]
     * @param {Boolean} [options.preventRender=false]   render verhindern?
     * @param {Boolean} [options.preventEvents=false]   Events verhindern?
     */

### Überschriebene Funktionen
Überschriebene Funktionen werden wie bisher mit ```// overwrite``` gekennzeichnet 
(siehe Leitfaden [Namensgebung](Namensgebung.md)). Ein JSDoc-Kommentar ist nur nötig, wenn sich 
das Verhalten gegenüber der Basisklasse ändert. Sonst übernimmt der Generator die 
Doku der Basisklasse.  

    // overwrite
    render(superCall) {


5\. Kommentare im Code
----------------------
Normale ```//```-Kommentare im Code erklären, **warum** etwas so gemacht wird oder 
gliedern längere Funktionen. Sie erscheinen nicht in der API-Dokumentation.  

    // Erst nach min und max zuweisen, damit der Wert begrenzt werden kann
    value: { target: 'value', prio: 100 }

Die Abschnitts-Überschriften (```// CONSTRUCTOR```, ```// MEMBERS```, 
```// PROTECTED``` ...) bleiben wie im Leitfaden [Aufbau einer Klasse](Aufbau_einer_Klasse.md) beschrieben.  


Typen
-----
Typen werden wie in JSDoc in geschweiften Klammern angegeben:  

| Schreibweise                    | Bedeutung                              |
|---------------------------------|----------------------------------------|
| ```{String}```, ```{Number}```, ```{Boolean}``` | einfache Typen         |
| ```{Object}```, ```{Array}```, ```{Function}``` | Objekte                |
| ```{kijs.gui.Element}```        | Instanz einer Klasse                   |
| ```{kijs.gui.Element[]}```      | Array von Instanzen                    |
| ```{String\|Array}```           | mehrere mögliche Typen                 |
| ```{Number\|null}```            | darf auch ```null``` sein              |
| ```{*}```                       | beliebiger Typ                         |


Weitere JSDoc-Tags
------------------
| Tag                 | Verwendung                                              |
|---------------------|---------------------------------------------------------|
| ```@deprecated```   | Nicht mehr verwenden, mit Hinweis auf die Alternative   |
| ```@example```      | Beispielcode (im Klassen- oder Funktionskommentar)      |
| ```@see```          | Verweis auf eine andere Klasse oder Funktion            |


Formatierung der Beschreibungen
-------------------------------
Beschreibungen in JSDoc-Kommentaren sind Markdown.  
- Eine **Leerzeile** (```*``` allein auf der Zeile) beginnt einen neuen Absatz. Ein 
  Zeilenumbruch ohne Leerzeile bleibt im gleichen Absatz, so können die Zeilen frei 
  umbrochen werden.  
- Aufzählungen (z.B. die möglichen Werte einer Eigenschaft) als **Liste** mit ```- ```.  
- Der erste Satz fasst kurz zusammen, worum es geht. Längere Erklärungen folgen in 
  eigenen Absätzen.  

Für Code-Markierungen und Links ist im Kommentar nichts nötig. Die API-Dokumentation 
verlinkt Klassennamen (```kijs.gui.Button```, ```kijs.gui.DataView.selectType```) und 
«Leitfaden Name» automatisch und markiert ```null```, ```true```, ```false```, 
```undefined``` und Strings in einfachen Anführungszeichen als Code.  

    /**
     * Art der Selektion:
     * - 'none' nichts selektierbar
     * - 'single' ein Datensatz, Abwählen nicht möglich (Default)
     * - 'multi' mehrere mit Shift- und Ctrl-Taste
     *
     * Siehe Leitfaden Daten.
     * @type {String}
     */


Links auf die API
-----------------
In Leitfäden, Showcase-Seiten und Beschreibungen in JSDoc-Kommentaren kann direkt 
auf die API-Dokumentation einer Klasse oder eines Eintrags verlinkt werden:  

| Link                               | Öffnet                                         |
|------------------------------------|------------------------------------------------|
| ```api:kijs.gui.Button```          | die Seite der Klasse                           |
| ```api:kijs.gui.Button#caption```  | die Seite der Klasse, ```caption``` aufgeklappt |

In Markdown:  

```text
Siehe [caption](api:kijs.gui.Button#caption) und [kijs.gui.Element](api:kijs.gui.Element).
```

In einer Showcase-Seite (HTML):  

```html
<a href="api:kijs.gui.Button#caption">caption</a>
```

Beispiel: [kijs.gui.Element › applyConfig](api:kijs.gui.Element#applyConfig)  


Übergang
--------
Viele Klassen haben noch den alten Kopfkommentar mit den Abschnitten 
```CONFIG-Parameter```, ```FUNKTIONEN```, ```EIGENSCHAFTEN``` und ```EVENTS```. 
Sie werden schrittweise umgestellt, jeweils wenn eine Klasse ohnehin bearbeitet wird:  
1. Beschreibung und eigene Events in den neuen Klassenkommentar übernehmen  
2. Beschreibungen der Config-Parameter beim Getter bzw. in der ```_configMap``` 
   ergänzen, falls dort noch nichts steht  
3. Fehlende JSDoc-Kommentare bei public und protected Funktionen ergänzen  
4. Den alten Kopfkommentar löschen  

Der geplante Generator soll zusätzlich einen Bericht mit den Lücken erstellen 
(Config-Eigenschaften ohne Doku, Funktionen ohne JSDoc). So ist jederzeit 
ersichtlich, welche Klassen noch umgestellt werden müssen.  
