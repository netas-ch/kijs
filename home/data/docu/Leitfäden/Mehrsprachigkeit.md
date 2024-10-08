Mehrsprachigkeit
================

Texte
-----
Alle Texte in kijs sind grundsätzlich in deutscher Sprache (de-CH) geschrieben.  
Sie können aber in eine beliebige Sprache übersetzt werden.

Technische Fehlermeldungen, die nicht zum übersetzen gedacht sind, sind  in 
Englisch (en-US) geschrieben. Sie können nicht übersetzt werden.  

Über die globale, statische Funktion ```kijs.getText(key, variant='', args=null, language=null)``` 
können Texte in eine beliebige Sprache übersetzt werden.  
Beispiel:   
```kijs.gui.msgbox.alert(kijs.getText('Der Vorgang wurde erfolgreich abgeschlossen.'));```  

Es wird dringend empfohlen alle Texte, im Quellcode mit einem ```kijs.getText(...)``` zu versehen, 
so kann das Programm einfach in eine beliebige Sprache übersetzt werden.  

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
Falls keine Sprache angegeben wird, wird die unter ```kijs.language``` gloabal 
eingestellte Sprache verwendet.  

Die language muss im Format BCP 47 angegeben werden.
Dieses besteht aus einem zweistelligen Sprachkürzel (in Kleinbuchstaben) und optional 
mit einer zweistelligen Region (in Grossbuchstaben), die mit einem Bidestrich angehängt ist.  

Beispiele:
 - ```'de'``` Sprache: Deutsch
 - ```'fr'``` Sprache: Französisch
 - ```'de-CH'``` Sprache: Deutsch, Region: Schweiz
 - ```'en-US'``` Sprache: Englisch, Region USA

### eigene getText()-Funktion
Bei Bedarf kann eine eigene getText-Funktion verwendet werden.  
Diese kann mit der Funktion ```kijs.setGetTextFn(fn, context)``` definiert werden.  
Falls keine eigene Funktion definiert wird, verwendet kijs die kijs-eigene Funktion.  
Diese bezieht die Texte von den Sprachdateien im Ordner: ```js/translation```  
Sie enthält aber natürlich nur Texte, die im kijs vorkommen. Es wird darum empfohlen 
eine eigene Funktion mit eigenen Sprachdateien zu verwenden.  

### Texte aus Quellcode extrahieren
Mit dem PHP-Skript ```tools/kilang/generateUsages.php``` kann automatisiert die Datei 
```tools/kilang/data/usages.php``` generiert werden. Diese durchsucht das kijs nach 
Texten und schreibt diese in die ```usages.php```.  

### Texte übersetzen
Mit dem Translate-App von Netas können aus der ```usages.php``` die Texte ausgelesen 
werden und in eine beliebige Sprache übersetzt werden. Es pro Sprache eine PHP-Sprachdatei
erstellt (```kijs_en.php```, ```kijs-fr.php```).  
Die PHP-Sprachdateien können dann mit dem PHP-Skript ```tools/kilang/convertPhpLanguageFilesToJs.php``` 
in JavaScript-Spachdateien konvertiert werden. Sie befinden sich im Ordner ```js/translation```.  
Für eigene Projekte empfiehlt es sich, eigene Sprachdateien in einem eigenen Ordner 
zu erstellen.  


Formatieren von Datum/Uhrzeit
-----------------------------
Je nach Sprache wird auch das Datum anders formatiert.  
Beispiel Deutsch: 31.08.2024  
Beispiel Englisch: 08/31/2024  

Folgende kijs-Elemente zeigen Datumswerte an:  
 - ```kijs.gui.DatePicker```
 - ```kijs.gui.MonthPicker```
 - ```kijs.gui.field.DateTime```
 - ```kijs.gui.field.Month```

Sie verwenden auch die unter ```kijs.language``` definierte Sprache.  


Native JavaScript-Funktionen für Mehrsprachigkeit
-------------------------------------------------
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleDateString
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat#parameters

Beispiel:  
Formatieren eines Datums in der aktuellen Sprache:  
    
    const dteToday = new Date();
    const strToday = dteToday.toLocaleDateString(kijs.language, {
        weekday: 'narrow',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    kijs.alert(kijs.getText('Das heutige Datum ist: %1'), '', [strToday]);
    

Die Browser-Sprache kann über ```navigator.language``` ermittelt werden:  
https://developer.mozilla.org/en-US/docs/Web/API/Navigator/language
