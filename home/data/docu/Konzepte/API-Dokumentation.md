Konzept API-Dokumentation
=========================

**Status:** Umgesetzt (Schritte 1 bis 7). Offen: Direktlinks über die URL  

Ziel ist eine API-Dokumentation aller kijs-Klassen in der Home-App, ähnlich der 
Doku von Sencha Ext JS. Sie wird automatisch aus dem Quellcode und den Kommentaren 
erzeugt (siehe Leitfaden [Kommentare](../Leitfäden/Kommentare.md)).  


1\. Übersicht
-------------
| Teil                  | Beschreibung                                                     |
|-----------------------|------------------------------------------------------------------|
| **Parser** (PHP)      | Liest die JS-Dateien aus ```files.json``` und extrahiert Klassen, Configs, Getter/Setter, Funktionen und Events mit ihren Kommentaren |
| **Datenbank** (SQLite)| Speichert das Ergebnis (Klassen, Einträge, Vererbung, Lücken)   |
| **Update**            | Wird per Klick in der Home-App gestartet, mit Fortschrittsanzeige |
| **API-Tab**           | Neuer Bereich in der Navigation mit einem Baum aller Klassen     |
| **Klassenseite**      | Doku einer Klasse in einem eigenen Tab, mit Filter               |
| **Globale Suche**     | Sucht in API, Leitfäden, Showcase und Tests                      |


2\. Benutzeroberfläche
----------------------
### Navigation
- Neuer Tab **API** in der Navigation, neben Showcase, Tests und Dokumentation.  
- Darunter ein Baum mit den Klassen, gegliedert nach Namespace:  

```text
kijs
├─ Ajax
├─ Array
├─ ...
└─ gui
   ├─ Button
   ├─ Container
   ├─ ...
   ├─ container
   │  ├─ Form
   │  └─ ...
   └─ field
      ├─ Combo
      └─ ...
```

- In der Kopfzeile des Tabs eine Schaltfläche **API aktualisieren** und das Datum 
  des letzten Updates (als Tooltip).  

### Klassenseite
Ein Klick auf eine Klasse öffnet die Doku in einem eigenen Tab (wie die Leitfäden).  

```text
┌──────────────────────────────────────────────────────────────────┐
│ kijs.gui.Button                                                  │
│ kijs.Observable > kijs.gui.Element > kijs.gui.Button             │
│ Abgeleitet: kijs.gui.container.tab.Button, ...                   │
│ Beschreibung aus dem Klassenkommentar ...                        │
│ Beispiele: Showcase Button · Quelle: js/gui/kijs.gui.Button.js   │
├──────────────────────────────────────────────────────────────────┤
│ [Filter: ______________]  [x] Vererbte anzeigen                  │
├──────────────────────────────────────────────────────────────────┤
│ Configs/Getter/Setter                                            │
│  ▸ badgeText      Config Getter Setter            String         │
│  ▾ caption        Config Getter Setter            String         │
│      Beschriftung (HTML). Leer = keine Beschriftung              │
│      Quelle: js/gui/kijs.gui.Button.js:104                       │
│  ▸ disabled       Config Getter Setter  Vererbt   Boolean        │
│  ▸ isEmpty        Getter readonly                 Boolean        │
│                                                                  │
│ Funktionen                                                       │
│  ▸ focus(alsoSetIfNoTabIndex)          Vererbt    HTMLElement    │
│  ▸ render(superCall)                   overwrite                 │
│                                                                  │
│ Events                                                           │
│  ▸ click                               Vererbt                   │
└──────────────────────────────────────────────────────────────────┘
```

**Kopf:** Klassenname, Vererbungskette und abgeleitete Klassen (alles Links), 
Beschreibung, Link auf passende Showcase-Seiten und auf die Quelldatei.  

**Abschnitte:**  

| Abschnitt                 | Inhalt                                                       |
|---------------------------|--------------------------------------------------------------|
| **Configs/Getter/Setter** | Alle Config-Eigenschaften und öffentlichen Getter/Setter, alphabetisch. **Ein Eintrag pro Name**, auch wenn er Config, Getter und Setter zugleich ist |
| **Funktionen**            | Alle öffentlichen Funktionen, alphabetisch. Protected (```_xy```) und private (```#xy```) erscheinen nicht |
| **Events**                | Alle Events, die die Klasse auslöst, alphabetisch            |

Jeder Eintrag zeigt in der Kopfzeile Name, Tags und Typ. Ein Klick klappt ihn auf.  

**Aufgeklappt** werden je nach Art angezeigt:  
- Beschreibung (Markdown, mit Syntax-Highlighting in Code-Blöcken)  
- Typ und Standardwert (aus ```_defaultConfig```)  
- Argumente mit Typ, Standardwert und Beschreibung, Rückgabewert  
- bei vererbten Einträgen: von welcher Klasse  
- bei Configs mit Weiterleitung: Ziel (z.B. ```caption``` → ```_captionDom.html```)  
- Link **Quelle: Datei:Zeile**, öffnet den Code in einem Tab  

Klassennamen in Typen (z.B. ```{kijs.gui.Element}```) werden automatisch zu Links.  

### Tags
| Tag           | Farbe  | Bedeutung                                              |
|---------------|--------|--------------------------------------------------------|
| Config        | blau   | Kann in der Config angegeben werden                    |
| Getter        | grün   | Kann gelesen werden                                    |
| Setter        | orange | Kann geschrieben werden                                |
| readonly      | grau   | Getter ohne Setter                                     |
| static        | violett| Statische Eigenschaft/Funktion (z.B. ```kijs.Array.each```) |
| overwrite     | gelb   | Überschreibt die Funktion der Basisklasse              |
| Vererbt       | grau, nur Rahmen | Stammt aus einer Basisklasse (mit Name als Tooltip) |
| deprecated    | rot    | Nicht mehr verwenden (```@deprecated```)               |

Die Farben werden als CSS-Variablen definiert, damit sie im hellen und dunklen 
Theme passen.  

### Filter auf der Klassenseite
- Ein Textfeld filtert die Einträge aller Abschnitte. Gesucht wird in Name und 
  Beschreibung. Nicht passende Einträge werden ausgeblendet.  
- Der Schalter **Vererbte anzeigen** blendet vererbte Einträge aus.  
- Der Filter läuft im Browser, ohne Anfrage an den Server.  

### Globale Suche
- Ein Suchfeld in der Kopfzeile der Home-App (neben Sprache und Theme).  
- Enter öffnet einen neuen Tab **Suche: xy** mit den Treffern, gruppiert nach  
  API, Leitfäden, Showcase und Tests.  
- Jeder Treffer zeigt einen Textausschnitt mit hervorgehobenem Suchbegriff.  
- Ein Klick öffnet die Seite. Bei API-Treffern wird der Eintrag aufgeklappt.  


3\. Woher kommen die Daten?
---------------------------
| Information            | Quelle im Code                                                   |
|------------------------|------------------------------------------------------------------|
| Klasse, Basisklasse    | ```xy.Name = class xy_Name extends Basis```                      |
| Beschreibung, Beispiel | Klassenkommentar (```/** ... */``` über der Klasse), ```@example``` |
| Events                 | ```@fires``` im Klassenkommentar; zusätzlich werden ```raiseEvent('xy')``` und ```_eventForwardsAdd('xy', ...)``` im Code gesucht |
| Config-Eigenschaften   | Einträge in ```_configMap``` (inkl. ```Object.assign(this._configMap, ...)```), Kommentar ```// {Typ} Text``` |
| Standardwerte          | ```_defaultConfig```                                              |
| Getter/Setter          | ```get xy()``` / ```set xy()```, JSDoc beim Getter (```@type```) |
| Funktionen             | Methoden ohne ```_``` und ```#```, JSDoc (```@param```, ```@returns```) |
| static, overwrite      | Schlüsselwort ```static```, Kommentar ```// overwrite```         |
| deprecated             | ```@deprecated```                                                |

Hat eine Config keinen Kommentar, wird die Doku vom gleichnamigen Getter übernommen. 
Hat eine überschriebene Funktion keinen eigenen JSDoc, wird die Doku der 
Basisklasse übernommen.  

Der alte Kopfkommentar (Abschnitt ```CONFIG-Parameter``` usw.) wird **nicht** 
ausgewertet, da er oft nicht mehr aktuell ist. Fehlt die neue Doku, bleibt der 
Eintrag ohne Beschreibung und erscheint im Lückenbericht.  


4\. Parser
----------
Grundlage ist der Parser aus ```htdocs/kijs-api``` (2021):  

| Teil                 | Vorgehen                                                       |
|----------------------|----------------------------------------------------------------|
| ```FileParser.php``` | **Übernehmen.** Tokenizer, der Kommentare, Strings, Template-Literals, Regex, Zahlen und Operatoren erkennt und einen Baum aus ```{}```, ```()``` und ```[]``` aufbaut. Vorher testen mit aktuellem Code (```#private```, ```static #feld```, ```async```) |
| ```ClassParser.php```| **Umbauen** auf die neuen Kommentar-Regeln (JSDoc, ```// {Typ}``` in der configMap, ```@fires```) |
| ```ProjectParser.php```| **Neu** für SQLite, ohne Änderungshistorie                    |

Neuer Ort: ```home/app/api/``` (PHP), eingebunden über ```home/app/ajax.php```.  


5\. Datenbank (SQLite)
----------------------
Die Datenbank wird bei jedem Update **komplett neu aufgebaut**. Eine 
Änderungshistorie braucht es nicht.  

```sql
-- Metadaten: Datum des Updates, kijs-Version, Dauer
meta (key TEXT PRIMARY KEY, value TEXT)

-- Klassen
class (
    classId INTEGER PRIMARY KEY,
    name TEXT UNIQUE,           -- kijs.gui.Button
    namespace TEXT,             -- kijs.gui
    extends TEXT,               -- kijs.gui.Element
    description TEXT,           -- Markdown
    example TEXT,
    isDeprecated INTEGER,
    file TEXT, line INTEGER
)

-- Eigene Einträge einer Klasse (ohne vererbte)
member (
    memberId INTEGER PRIMARY KEY,
    classId INTEGER,
    name TEXT,
    kind TEXT,                  -- 'property' (Config/Getter/Setter), 'function', 'event'
    isConfig INTEGER, hasGetter INTEGER, hasSetter INTEGER,
    isStatic INTEGER, isOverwrite INTEGER, isDeprecated INTEGER,
    type TEXT,                  -- Typ bzw. Rückgabetyp
    defaultValue TEXT,
    description TEXT,           -- Markdown
    returnsDescription TEXT,
    configTarget TEXT,          -- z.B. '_captionDom.html'
    docSource TEXT,             -- 'jsdoc', 'configMap', 'getter', 'getterComment', 'comment', 'base'
    file TEXT, line INTEGER
)

-- Argumente von Funktionen
argument (memberId INTEGER, idx INTEGER, name TEXT, type TEXT,
          isOptional INTEGER, defaultValue TEXT, description TEXT)

-- Alle Einträge einer Klasse inkl. vererbte (beim Update berechnet)
class_member (classId INTEGER, memberId INTEGER, inheritedFromClassId INTEGER)

-- Lückenbericht
issue (classId INTEGER, memberId INTEGER, type TEXT, message TEXT)
```

Die Datei liegt unter ```home/data/api.sqlite```.  

Für die globale Suche gibt es **keinen** Volltext-Index. Die API wird mit 
```LIKE``` in den Tabellen ```class``` und ```member``` gesucht (rund 2200 Einträge), 
Leitfäden, Showcase und Tests direkt in den Dateien (rund 90 Dateien). Eine Suche 
dauert so etwa 20 ms, die Doku ist ohne Update immer aktuell, und die Datenbank 
bleibt klein (rund 0.8 MB statt 4.4 MB mit Index), was wichtig ist, weil sie ins 
Git eingecheckt wird.  


6\. Update mit Fortschrittsanzeige
----------------------------------
Das Update läuft in mehreren RPC-Aufrufen, damit die Fortschrittsanzeige ohne 
spezielle Technik funktioniert:  

| Schritt | RPC                  | Aufgabe                                                   |
|---------|----------------------|-----------------------------------------------------------|
| 1       | ```api.updateStart```  | Sperrdatei setzen, leere temporäre DB anlegen, Dateiliste aus ```files.json``` zurückgeben (Module ```core```, ```translations```, ```gui```, ```grid```, ```aceEditor```, ```quillEditor```) |
| 2       | ```api.updateFile```   | Eine Datei parsen und in die temporäre DB schreiben (einmal pro Datei) |
| 3       | ```api.updateFinish``` | Vererbung auflösen (```class_member```), Doku übernehmen, Lückenbericht, temporäre DB umbenennen, Sperre aufheben |

Die Home-App zeigt dazu ein Fenster mit ```kijs.gui.ProgressBar```, der aktuellen 
Datei und am Schluss einer Zusammenfassung (Anzahl Klassen, Warnungen, Lücken).  

Weil die neue DB erst am Schluss umbenannt wird, ist die API während des Updates 
weiter benutzbar und es gibt nie einen halb aktualisierten Stand.  

Das Update ist **nur lokal** möglich: Die Schaltfläche **API aktualisieren** wird 
nur angezeigt, wenn die Home-App über ```localhost```, ```127.0.0.1``` oder ```::1``` 
aufgerufen wird. Zusätzlich prüfen die drei RPCs ```$_SERVER['REMOTE_ADDR']``` und 
lehnen Aufrufe von anderen Adressen ab.  

Die Datei ```home/data/api.sqlite``` wird ins Git eingecheckt, damit die API nach 
dem Klonen sofort verfügbar ist. Nach einer Änderung am kijs-Code wird das Update 
lokal ausgeführt und die Datei mitcommittet. Fehlt die Datei trotzdem, zeigt der 
API-Tab einen Hinweis mit der Schaltfläche **API aktualisieren**.  


7\. Lückenbericht
-----------------
Beim Update wird festgehalten, was noch nicht dokumentiert ist:  
- Config-Eigenschaften ohne Kommentar und ohne dokumentierten Getter  
- öffentliche Funktionen ohne JSDoc  
- Events ohne ```@fires```  
- Klassen ohne Klassenkommentar  
- Klassen, die noch einen alten Kopfkommentar haben (zum Aufräumen)  

Der Bericht wird als eigene Seite in der API angezeigt, sortiert nach Klasse. Er ist 
zuoberst im API-Baum erreichbar und kann nach Klasse und Art der Lücke gefiltert 
werden. Ein Klick auf einen Eintrag öffnet die Klassenseite und klappt ihn auf.  


8\. Umsetzung in Schritten
--------------------------
| Schritt | Inhalt                                                          |
|---------|-----------------------------------------------------------------|
| 1       | Alten Parser übernehmen und mit dem aktuellen kijs testen, Ausgabe als JSON (**erledigt**: ```home/app/api/```) |
| 2       | SQLite-Datenbank und Update mit Fortschrittsanzeige (**erledigt**: ```ApiDatabase.php```, ```ApiUpdate.php```, ```home.ApiUpdate.js```, API-Tab mit Schaltfläche und Stand) |
| 3       | API-Tab mit Baum und Klassenseite (Abschnitte, Tags, aufklappen) (**erledigt**: ```ApiReader.php```, ```home.ApiClassPage.js```, ```home.ApiSourcePage.js```; Filter auf der Klassenseite ist schon dabei) |
| 4       | Filter auf der Klassenseite (**erledigt** mit Schritt 3)         |
| 5       | Globale Suche (**erledigt**: ```HomeSearch.php```, RPC ```home.search```, ```home.SearchPage.js```) |
| 6       | Lückenbericht (**erledigt**: Eintrag zuoberst im API-Baum, RPC ```api.issues```, ```home.ApiIssuesPage.js```) |
| 7       | Links ```api:``` in Leitfäden und Showcase-Seiten (**erledigt**: ```home.App.openApiLink()```, Format im Leitfaden [Kommentare](../Leitfäden/Kommentare.md)) |
| später  | Direktlinks über die URL (z.B. ```#api/kijs.gui.Button/caption```), dann auch für Leitfäden, Showcase und Tests |

Jeder Schritt ist für sich testbar.  


9\. Entscheide
-------------
| Frage | Entscheid |
|-------|-----------|
| Alter Kopfkommentar als Quelle? | Nein, wird nicht ausgewertet (oft nicht aktuell) |
| Kommt die SQLite-Datei ins Git? | Ja, ```home/data/api.sqlite``` wird mitcommittet |
| Welche Module kommen in die API? | Alle aus ```files.json```: ```core```, ```translations```, ```gui```, ```grid```, ```aceEditor```, ```quillEditor``` |
| Wer darf das Update auslösen? | Nur lokal (```localhost```), Schaltfläche und RPCs sind sonst gesperrt |
| Ist PHP mit ```pdo_sqlite``` installiert? | Ja: PHP 8.5.12, SQLite 3.53.4, FTS5 vorhanden |
| Links aus Leitfäden und Showcase auf API-Einträge? | Ja, mit Links wie ```api:kijs.gui.Button#caption``` (Schritt 7) |
| Direktlinks über die URL? | Später |
