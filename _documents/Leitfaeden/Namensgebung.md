# Namensgebung bei Variablen, Funktionen und Klassen
====================================================
Namen werden grunsätzlich in Camel Case notiert.
https://en.wikipedia.org/wiki/Camel_case
Dabei ist der 1. Buchstaben immer klein.
Sie enthalten keine Sonderzeichen. Ziffern sind möglich, aber nicht an der 1. Stelle.

Boolsche Variablen müssen mit einer der folgenden Präfix beginnen:
- has... 
- is...

Es ist sinnvoll die Rehenfolg von Wörtern in einem Namen überlegt anzuordnen.
Beispiel: Bei folgende Namen, ist bei alphabetischer Reihenfolge der Zusammenhang
nicht gut ersichtlich:
    clearForm()
    drawGui()
    loadForm()
    resetGui()
    saveForm()

viel besser:
    formClear()
    formLoad()
    formSave()
    guiDraw()
    guiReset()


## Variablen
------------
Im kijs unterscheiden wir Variablen mit unterschiedlichen Gültigkeitsbereichen:

### Funktionsvariable
Diese Variablen verden innerhalb einer Funktion deklariert und verwendet.
Sie werden mit let oder const deklariert und sind nur innerhalb der Funktion gültig.
Beispiel: let myVar=1;

### Klassenvariablen
Innerhalb einer Klasse verwenden wir protected Variablen.
Sie erkennt man an dem Unterstrich als erstes Zeichen.
Alle Klassenvariablen müssen im constructor deklariert werden.
Arrays und Objekte müssen im destructor immer entladen werden.

Deklaration:
this._meineVariable = null;  // andere Werte sind auch möglich

Zugriff:
console.log(this._meineVariable)

Auf diese Modulvariablen darf von ausserhalb **nicht** zugegriffen werden!
Dafür gibt es Getter und Setter.

Private Variablen verwenden wir nicht. => Protected nehmen.
Öffentliche Variablen verwenden wir nicht. Dafür gibt es Getter und Setter.


## Funktionen
Bei Funktionen gilt die gleiche Namensgebung wie bei Variablen.
Der Name sollte aber aussagen, dass etwas ausgeführt wird. Beispiele:
- loadData()
- doLayout()
- reload()

Funktionen können öffentlich sein.
- rechneDies()
oder protected
- _rechneDas()

Funktionen sollten nicht zu viele Argumente haben, sonst wir es unübersichtlich.
Stattdessen kann ein config-Argument benutzt werden.


## Getter und Setter
Die Namensgebung von Getter/Setter ist die gleiche wie bei Variablen. 
Sie sind immer Public.


## Ereignisse
Namen von Listeners von Ereignissen beginnen immer mit on...
Darauf folgt der Name des Elements und dann der Name des Ereignisses.
Sie sind immer protected. 
Sie haben immer nur ein Argument e.
Beispiel _onGridLoad(e)


## Fehlerbehandlung Catch
Catch Anweisungen haben immer nur ein Argument ex.
Beispiel:
    this._rpc.do({
        ...
    }).then((e) => {
        ...
    }).catch((ex) => {
       ...
    });


## Überschrieben von Funktionen
Wird in einer vererbten Klasse eine Funktion überschrieben, wird dies für andere
Entwickler immer mit einem Kommentar ersichtlich gemacht:
// overwrite


## Zugriff auf Getter/Modulvariablen
Innerhalb einer Klasse sollte grundsätzlich direkt auf Klassenvariablen zugegriffen 
werden und nicht über einen Getter.
Ausnahmen:
- Macnhmal gibt es nur einen Getter ohne entsprechende Variable
- Der Getter führt noch etwas aus


## Klassen
Bei Klassen gilt die gleiche Namensgebung wie bei Variablen.
Jedoch ist der erste Buchstabe immer gross.