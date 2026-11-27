Mehrsprachigkeit
================
Die Sprache [```kijs.language```](api:kijs#language) bestimmt zwei Dinge:  
- die **Übersetzung** der Texte (```kijs.getText()```)  
- das **Format** von Zahlen und Datum (z.B. ```1'234.5``` oder ```1.234,5```)  

Die Formate liefert der Browser (```Intl```). kijs braucht dafür keine eigenen Einstellungen.  


Sprache einstellen
------------------
Die Sprache wird beim Start der App gesetzt, bevor die Oberfläche erstellt wird:  

    kijs.language = 'de-CH';

Sie wird im Format BCP 47 angegeben: ein zweistelliges Sprachkürzel (in Kleinbuchstaben), 
optional mit einer Region (in Grossbuchstaben), die mit einem Bindestrich angehängt ist.  

| ```kijs.language``` | Texte       | Zahl          | Datum                |
|---------------------|-------------|---------------|----------------------|
| ```'de-CH'```       | Deutsch     | 1'234'567.89  | 19.11.2026, 14:05    |
| ```'de'```          | Deutsch     | 1.234.567,89  | 19.11.2026, 14:05    |
| ```'fr-CH'```       | Französisch | 1 234 567,89  | 19.11.2026 14:05     |
| ```'fr'```          | Französisch | 1 234 567,89  | 19/11/2026 14:05     |
| ```'en-US'```       | Englisch    | 1,234,567.89  | 11/19/2026, 02:05 PM |

**Wichtig:** Für das Schweizer Format die Region angeben (```'de-CH'```, ```'fr-CH'```, 
```'it-CH'```). Mit ```'de'``` werden Zahlen deutsch formatiert (```1.234,5```).  

Ohne Angabe gilt ```'de'```. Die Sprache des Browsers liefert 
[```navigator.language```](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/language), 
z.B. ```'de-CH'```.  

### Sprache wechseln
Texte und Formate werden beim Erstellen der Elemente eingesetzt. Ein Wechsel der Sprache wirkt 
darum nicht auf bestehende Elemente. Für einen Wechsel die Seite neu laden bzw. die 
Oberfläche neu aufbauen. Die Home-App macht das so:  

    // beim Start: Sprache aus der URL (?lang=fr-CH), sonst die zuletzt gewählte,
    // sonst die erste Sprache des Browsers, die die App anbietet, sonst Standard
    const languages = { de: 'de-CH', en: 'en', fr: 'fr-CH' };
    const browserLanguage = navigator.languages.map(l => l.split('-')[0]).find(l => languages[l]);
    kijs.language = kijs.Navigator.getGetParameter('lang')
            || localStorage.getItem('kijs-home-language')
            || languages[browserLanguage]
            || 'de-CH';

    // beim Wechsel: Wahl merken und Seite mit der neuen Sprache neu laden
    localStorage.setItem('kijs-home-language', newLanguage);
    window.location = window.location.pathname + '?lang=' + newLanguage;

Die vollständige Umsetzung steht in ```home.App.getLanguage()```.  


Texte
-----
Alle Texte in kijs sind grundsätzlich in deutscher Sprache (de-CH) geschrieben.  
Sie können aber in eine beliebige Sprache übersetzt werden.

Technische Fehlermeldungen, die nicht zum Übersetzen gedacht sind, sind in 
Englisch (en-US) geschrieben. Sie können nicht übersetzt werden.  

Über die globale, statische Funktion [```kijs.getText(key, variant='', args=null, language=null)```](api:kijs#getText) 
können Texte in eine beliebige Sprache übersetzt werden.  
Beispiel:   
```kijs.gui.MsgBox.alert(kijs.getText('Info'), kijs.getText('Der Vorgang wurde erfolgreich abgeschlossen.'));```  

Es wird dringend empfohlen, alle Texte im Quellcode mit einem ```kijs.getText(...)``` zu versehen. 
So kann das Programm einfach in eine beliebige Sprache übersetzt werden.  

### getText() Argumente
#### key
Gewünschter Text der übersetzt werden soll.  
Wichtig ist, dass dieser aus einem einzigen String besteht.  
Also keine Funktionsaufrufe, Variablen oder zusammengesetzte Strings verwenden, 
denn dieser Text muss von einem Übersetzungstool automatisch übersetzt werden können.  

Variablen können aber verwendet werden.  
Beispiel:  
```kijs.getText('Der Datensatz %1 %2 wurde gelöscht.', '', [vorname, name])```  

#### variant
Variantenbezeichnung (optional)  
Beispiele:  
| variant      | Beschrieb                                                             |
|--------------|-----------------------------------------------------------------------|
| '3'          | Der Text darf höchstens 3 Zeichen lang sein                           |
| 's' oder 'p' | Singular oder Plural. Der Text ist in Einzahl/Mehrzahl                |
| '5 p'        | max. 5 Zeichen + Mehrzahl                                             | 
| 'Wochentag 2'| max. 2 Zeichen + bei der Abkürzung handelt es sich um einen Wochentag |

#### args
String/Zahl mit Argument oder Array mit Argumenten (optional)  
Die Argumente werden durchnummeriert und können im Text mit der entsprechenden Nummer 
eingebunden werden: ```%1```, ```%2```, usw.  

#### language
Gewünschte Sprache (optional)  
Falls keine Sprache angegeben wird, wird die unter [```kijs.language```](api:kijs#language) global 
eingestellte Sprache verwendet.  

Gibt es für eine Sprache mit Region (z.B. ```'fr-CH'```) keine eigene Sprachdatei, wird die 
Sprache ohne Region verwendet (```'fr'```). Die Sprachdateien von kijs gibt es für ```en``` und 
```fr```; Deutsch ist die Originalsprache.  

### eigene getText()-Funktion
Bei Bedarf kann eine eigene getText-Funktion verwendet werden.  
Diese kann mit der Funktion [```kijs.setGetTextFn(fn, context)```](api:kijs#setGetTextFn) definiert werden.  
Falls keine eigene Funktion definiert wird, verwendet kijs die kijs-eigene Funktion.  
Diese bezieht die Texte von den Sprachdateien im Ordner: ```js/translation```  
Sie enthält aber natürlich nur Texte, die im kijs vorkommen. Es wird darum empfohlen, 
eine eigene Funktion mit eigenen Sprachdateien zu verwenden.  
Die eigene Funktion erhält die Sprache so, wie sie in ```kijs.language``` steht, also evtl. mit 
Region. Den Rückfall auf die Sprache ohne Region muss sie selbst machen.  

### Texte aus Quellcode extrahieren
Mit dem PHP-Skript ```tools/kilang/generateUsages.php``` kann automatisiert die Datei 
```tools/kilang/data/usages.php``` generiert werden. Diese durchsucht das kijs nach 
Texten und schreibt diese in die ```usages.php```. Lokal geht das auch in der 
Home-App über das Zahnrad oben rechts (**Werkzeuge**).  

### Texte übersetzen
Mit dem Translate-App von Netas können aus der ```usages.php``` die Texte ausgelesen 
und in eine beliebige Sprache übersetzt werden. Dabei wird pro Sprache eine PHP-Sprachdatei
erstellt (```kijs_en.php```, ```kijs_fr.php```).  
Die PHP-Sprachdateien können dann mit dem PHP-Skript ```tools/kilang/convertPhpLanguageFilesToJs.php``` 
in JavaScript-Sprachdateien konvertiert werden (auch über die **Werkzeuge** der Home-App). 
Sie befinden sich im Ordner ```js/translation```.  
Für eigene Projekte empfiehlt es sich, eigene Sprachdateien in einem eigenen Ordner 
zu erstellen.  


Zahlen
------
Dezimal- und Tausendertrennzeichen kommen aus der Sprache. Wer ein festes Format braucht, 
gibt die Trennzeichen selbst an.  

### Funktionen
- [```kijs.Number.format(number, decimals, decPoint, thousandsSep)```](api:kijs.Number#format): 
  ohne Angabe von ```decPoint``` und ```thousandsSep``` (bzw. mit ```null```) die Trennzeichen 
  der Sprache. ```''``` = kein Tausendertrennzeichen.  
- [```kijs.Number.parse(number, decimals, decPoint, thousandsSep)```](api:kijs.Number#parse): 
  liest eine Zahl im Format der Sprache. Ist das Tausendertrennzeichen ein Leerzeichen oder 
  Apostroph, werden alle Varianten davon akzeptiert (z.B. ein normales Leerzeichen statt des 
  schmalen bei ```'fr'```).  
- [```kijs.Number.getDecimalSeparator()```](api:kijs.Number#getDecimalSeparator) und 
  [```kijs.Number.getThousandsSeparator()```](api:kijs.Number#getThousandsSeparator): die 
  Trennzeichen der Sprache.  

Beispiel:  

    kijs.Number.format(1234.5, 2);              // 'de-CH': "1'234.50", 'de': "1.234,50"
    kijs.Number.format(1234.5, 2, '.', '');     // immer "1234.50"
    kijs.Number.parse("1'234.50", 2);           // 'de-CH': 1234.5

### Elemente
- [```kijs.gui.field.Number```](api:kijs.gui.field.Number): zeigt die Zahl mit dem 
  Dezimaltrennzeichen der Sprache an (ohne Tausendertrennzeichen, ausser mit 
  ```thousandsSeparator```). Bei der Eingabe gelten das Dezimaltrennzeichen der Sprache und 
  zusätzlich ```.``` bzw. ```,```, sofern es nicht das Tausendertrennzeichen ist. Bei ```'de'``` 
  ist ```1.500``` also 1500, bei ```'de-CH'``` 1.5. Der Wert (```value```) ist immer ein String 
  mit ```.``` als Dezimaltrennzeichen, z.B. ```'1234.5'```.  
- [```kijs.gui.grid.columnConfig.Number```](api:kijs.gui.grid.columnConfig.Number): Spalten im 
  Grid mit Trennzeichen der Sprache, ausser mit ```decimalSeparator``` und ```thousandsSeparator```.  


Datum und Uhrzeit
-----------------
Auch Datum und Uhrzeit werden im Format der Sprache angezeigt und eingelesen.  
Beispiel Deutsch (Schweiz): 31.08.2024  
Beispiel Englisch (USA): 08/31/2024  

Monats- und Wochentagnamen liefert ebenfalls der Browser, sie stimmen darum für jede Sprache, 
auch ohne Sprachdatei von kijs (z.B. Italienisch).  

### Elemente
Folgende kijs-Elemente zeigen Datumswerte im Format der Sprache an:  
 - [```kijs.gui.DatePicker```](api:kijs.gui.DatePicker)
 - [```kijs.gui.MonthPicker```](api:kijs.gui.MonthPicker)
 - [```kijs.gui.field.DateTime```](api:kijs.gui.field.DateTime) (auch die Eingabe wird im Format 
   der Sprache gelesen)
 - [```kijs.gui.field.Month```](api:kijs.gui.field.Month)
 - [```kijs.gui.grid.columnConfig.Date```](api:kijs.gui.grid.columnConfig.Date), sofern kein 
   ```format``` angegeben ist

Der Wert der Felder (```value```) hat immer ein festes Format (```valueFormat```, Standard 
```'Y-m-d'```), unabhängig von der Sprache.  

### Funktionen
- [```kijs.Date.formatLocal(date, hasTime)```](api:kijs.Date#formatLocal): Datum (und Uhrzeit) 
  im Format der Sprache, z.B. ```'19.11.2026'``` bzw. ```'11/19/2026'```.  
- [```kijs.Date.format(date, format)```](api:kijs.Date#format): festes Muster wie in PHP, z.B. 
  ```'d.m.Y'```. Monats- und Wochentagnamen (```F```, ```M```, ```l```, ```D```) werden 
  übersetzt, das Muster selbst aber nicht. ```'l, j. F Y'``` ergibt auf Französisch 
  «jeudi, 19. novembre 2026» (mit dem deutschen Punkt nach dem Tag). Für ein sprachgerechtes 
  Format mit Namen darum ```toLocaleDateString()``` verwenden (siehe unten).  
- [```kijs.Date.getMonthName(date, format)```](api:kijs.Date#getMonthName) und 
  [```kijs.Date.getWeekday(date, format)```](api:kijs.Date#getWeekday): Namen in der Sprache.  
- ```kijs.Date.parseLocalDateString()```, ```parseLocalTimeString()```, 
  ```parseLocalDateTimeString()``` und ```parseLocalWeekString()```: lesen eine Eingabe im 
  Format der Sprache. Ungültige Eingaben (z.B. ```31.02.```) ergeben ```null```.  


Native JavaScript-Funktionen für Mehrsprachigkeit
-------------------------------------------------
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleDateString
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat#parameters
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat

Beispiel:  
Formatieren eines Datums mit Wochentag und ausgeschriebenem Monat in der aktuellen Sprache:  
    
    const strToday = new Date().toLocaleDateString(kijs.language, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    // 'de-CH': 'Donnerstag, 19. November 2026', 'fr-CH': 'jeudi, 19 novembre 2026'
    kijs.gui.MsgBox.alert(kijs.getText('Info'), kijs.getText('Das heutige Datum ist: %1', '', strToday));

Formatieren eines Geldbetrags:  

    const strAmount = new Intl.NumberFormat(kijs.language, {
        style: 'currency',
        currency: 'CHF'
    }).format(1234.5);
    // 'de-CH': "CHF 1'234.50", 'fr-CH': '1 234.50 CHF'


Beispiele
---------
- [Showcase field Number](../../showcase/field/field_Number.js)  
- [Showcase field DateTime](../../showcase/field/field_DateTime.js)  
- [Showcase grid Grid](../../showcase/grid/grid_Grid.js)  
- In der Home-App lässt sich die Sprache über die Weltkugel oben rechts umstellen.  
