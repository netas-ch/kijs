# Version 1.4.1
===============

## Leitfäden
------------
Im Ordner /_documents/Leitfaden gibt es neu Leitfäden zu verschiedenen Themen.
Bitte diese lesen und berücksichtigen.


## Neue Features
----------------
### Showcase App (http://localhost/kijs/showcase/)
 - Zu jeder gui-Klasse gibt es eine Testseite
 - Weitere Testseiten können im Ordner kijs/showcase/js erstellt werden.
   sie werden automatisch eingebunden.
 - Das testApp sollte nun nicht mehr für Tests verwendet werden.
   Es existiert weiterhin als Beispiel-App.

### kijs.Dom
 - Neue Funktionen: jsFileAdd(), jsFileHas(), jsFileRemove()
 - Die Funktion cssFileReplace() gibt neu ein Promise zurück

### kijs.gui.field.ListView
 - Neuer Getter/Setter selectType

### kijs.gui.MsgBox
- Neue Statische Funktion kijs.gui.MsgBox.errorNotice() 
  Funnktioniert gleich wie kijs.gui.MsgBox.error(). Es wird aber ein anderes Icon 
  angezeigt (Dreieck statt Kreis).

### kijs.gui.CornerTipContainer
- Neue Funktion errorNotice()
- Neues Icon 'errorNotice' bei der statischen Funktion kijs.gui.CornerTipContainer.show();


## Änderungen
-------------
### RPC response.errorMsg,response.errorMsg .warningMsg, .infoMsg, .cornerTipMsg
 - Bisher konnte bei diesen Eigenschaften anstelle eines Strings auch ein Objekt 
   {msg:'...', title:'...', cancelCb: false} übergeben werden.
   Neu können nur noch Strings übergeben werden.
 - Für einen individuelle Titel gibt es neue Eigenschaften im response:
   - errorTitle
   - warningTitle
   - infoTitle
   - cornerTipTitle
 - cancelCb gibt es nicht mehr, weil
   - beim verwenden einer Callback-Fn, diese nun immer aufgerufen wird (auch im Fehlerfall).
   - beim verwenden des Promise, immer entweder resolve (auch bei errorNotice) 
     oder reject (nur bei error) aufgerufen wird

### kijs.gui.ApertureMask
 - Die Funktion _updatePosition() ist jetzt nicht mehr public.
   Stattdessen render() benutzen!

### kijs.Ajax
 - Die Funktion request() gibt nicht mehr den XMLHttpRequest zurück, sondern ein Promise
   Beim Promise gibt es kein reject. Es wird immer resolve ausgeführt.
 - Die callbackFn fn hat neu nur noch ein Argument { response: ..., request: ..., errorMsg: ... }
 - Die progressFn hat neu nur noch ein Argument 
   { nodeEventName: 'onprogress', ajaxConfig: ..., useCapture: false, nodeEvent: ..., context: ... }

### kijs.Rpc
 - Die Funktion do(config) hat neu nur noch ein Argument (config). Die alten Argumente
   werden noch eine Zeitlang unterstützt, sollten aber angepasst werden. 
   In der Console wird eine DEPRECATED-Meldung angezeigt.
 - Die callbackFn fn hat neu nur noch ein Argument { response: ..., request: ... }
 - Falls config.fn übergeben wurde wird immer diese fn ausgeführt (auch im Fehlerfall).
   Dann wird auch kein Promise, sondern Null zurückgegeben.
 - Wird KEINE fn übergeben, so wird ein Promise zurückgegeben. Im Fehlerfall wird 
   unterschieden zwischen errorType:
   - 'errorNotice' (default): Es wird resolve ausgeführt. Die errorMsg befindet 
                              sich dann unter e.response.errorMsg.
   - 'error':                 Es wird reject ausgeführt mit einem Error Objekt 
                              als Argument

### kijs.gui.Rpc
- Die Funktion do(config) hat neu nur noch ein Argument (config). Die alten Argumente 
  werden noch eine Zeitlang unterstützt, sollten aber angepasst werden. In der 
  Console wird eine DEPRECATED-Meldung angezeigt.
- Die callbackFn fn hat neu ein anderes Argument!!!!!! ACHTUNG! 
  Bisher: responseData
  Neu: { responseData: ..., requestData: ..., errorType: ..., errorMsg: ... }
- Die callbackFn wird nun immer ausgeführt! Auch in einem Fehlerfall!!!!! ACHTUNG!
  Um den gleichen Effekt wie früher zu haben muss der Inhalt der CallbackFn in ein
  if(kijs.isEmpty(rpcData.errorMsg)) {
      ...
  }
- Das Promise wird nur noch zurückgegeben, wenn keine callbackFn übergeben wurde
- Bei der Funktion do() gibt es beim Promise nun ein reject. Dieses wird nur ausgelöst, wenn
  keine callbackFn angegeben wurde, ein Fehler mit errorType='error' vom Server gemeldet wurde.
  Eine MsgBox wird zwar von kijs.gui.Rpc angezeigt, die Ladeanzeige wird auch entfernt.
  Das reject muss aber trotzdem bei jedem Aufruf abgefangen werden, damit kein 
  Javascript-Fehler entsteht.
  Minimale Fehlerbehandlung: .catch(() => {});
  Oder, wenn die übergeordnete Funktion async ist und await verwendet wird, können 
  Fehler mit einem normalen try{} catch{} abgefangen werden.
- das Argument bei load() fnBeforeMessages gibt es nicht mehr. Es wird nicht mehr benötigt,
  weil die Load Funktion nun immer eine Antwort zurückgibt.

### kijs.gui.DataView
 - Argument umbenannt bei Event afterLoad "response" heisst neu "responseData"

### kijs.gui.FormPanel
 - Argument umbenannt bei Event afterLoad "response" heisst neu "responseData"

### kijs.gui.grid.Grid
 - Die config "facadeFnBeforeMsgFn" gibt es nicht mehr.

### kijs.gui.Container (und alle verebten Klassen)
 - Neue Eigenschaften: scrollableX und scrollableY
   Mögliche Werte: - false (keine Scrollbar)
                   - true (Scrollbar immer sichtbar)
                   - auto (automatisch sichtbar, wenn nötig)
 - Die Config/Eigenschaft autoScroll gibt es nicht mehr 
   ==> "autoScroll": true bitte ersetzen durch durch "scrollableY": "auto"
 - Die Config/Eigenschaft "disabled" gibt es beim Container nicht mehr. 
   Diese Eigenschaft gibt es nur bei Formularen, Formularfeldern, Buttons und Icons. 
   Wenn ein ganzes Formular auf Disabled gestellt werden soll, kann dafür die
   "disabled"-Eigenschaft des kijs.gui.FormPanel verwendet werden. 
   Um trotzdem eine Maske über ein ganzes Panel zu legen kann dafür folgender 
   Code verwendet werden:
   (Vorsicht, die Elemente darunter können aber mit der Tastatur immer noch bedient werden!)
        let mask = new kijs.gui.Mask({
            target: myPanel
        });
        mask.show();
 - Methode getElements() umbenannt zu getElementsRec()

### kijs.gui.container.Scrollable
NEU! Funktioniert wie der Container, anstelle von Scrollbars werden Scroll-Buttons 
angezeigt.

### kijs.gui.container.Stack
Umbenannt!!! hiess früher kijs.gui.ContainerStack.
Eigenschaften/Methoden umbenannt:
- activeEl => currentEl
- bei currentEl wird ein von kijs.gui.Container vererbtes Element erwartet. 
  Eine Zahl ist nicht mehr erlaubt. ==> currentIndex verwenden
  Ein String ist nicht mehr erlaubt. ==> currentName verwenden
- neue Eigenschaft currentIndex
- neue Eigenschaft currentName
- activateAnimated() => setCurrentAnimated()
- setCurrentAnimated() gibt neu ein Promise zurück
- Werden animierte Übergänge gewünscht, so muss die Funktion setCurrentAnimated()
  verwendet werden. Die Setter currentEl, currentIndex und currentName wechseln 
  ohne Animation.
- Die Standard-Animation ist neu 'fade'
- flex: 1 ist nicht mehr Standard im CSS und muss deshalb mit 
  style: { flex:1 } noch hinzugefügt werden, wenn nötig
- Bisher war jedes Element innerhalb zusätzlich noch in einem DIV. 
  Dieses wird jetzt nicht mehr benötigt. Evtl. muss dies in CSS-Styles
  noch angepasst werden.

### Ereignisse afterLoad und afterSave
- afterLoad und afterSave events haben neu nur noch ein Argument e


## Änderungen im CSS
--------------------
- Die CSS-Klasse "kijs-autoscroll" gibt es nicht mehr. 
  ==> Bitte direkt die JS-Eigenschaft "scrollableY" von kijs.gui.Container benutzen

- Schriftgrössen vereinheitlicht.
  - defaultFontSize, buttonFontSize und itemFontSize von 11px auf 12px erhöht.

- Neue Variablen (bitte bei eigenen Templates auch einbauen)
  --button-lineHeight: 13px;
  --item-lineHeight: 13px;




# Version 1.3.1
===============
## Neue Features
----------------
 - RPC-Funktionen und MsgBox-Funktionen geben ein Promise (statt undefined) zurück,
   welches mit await abgewartet werden kann.



# Version 1.3.0
===============
## Neue Features
----------------
### Themes (light und dark)
 - Das theme kann im viewport über die config theme gesetzt werden:
   'light', 'dark' oder null=auto. Default=null
 - Falls kein Viewport verwendet wird, kann das Theme auch über
   kijs.Dom.themeSet(...) gesetzt werden.

### Neues Design
 - Das Standard-Design wurde überarbeitet. Es werden etwas weniger Farben verwendet.
 - Die Farben sind etwas lebendiger.
 - Neue Schriftart: Roboto
 - Darkmode
 - Bitte die kijs.theme.default.css vor der bestehenden kijs.gui.css einbinden !!!!

### Eigene Designs
 - Neu kann relativ einfach ein eigenes Design erstellt werden.
 - Es müssen neu immer zwei CSS-Dateien eingebunden werden. Zuerst die des
   gewünschten Designs (z.B. kijs.theme.default.css) und dann die kijs.gui.css.
- Designanpassungen sollten immer in der kijs.theme.xxx.css gemacht werden.
- Pro Design müssen immer beide Themes (light und dark) definiert werden.
- Ein kijs.theme.xxx.css ist in die zwei themes light und dark unterteilt.
  Darunter gibt es dann folgenden Aufbau:
    - Farbschema-Variablen mit den Akzentfarben und 10 Graustufen
    - Zuweisung der Farbschema-Variablen zu den Detailvariablen
    - Falls neben Farbanpassungen noch weitere Anpassungen nötig sind, können
      diese am Ende der Datei gemacht werden
- Das Design kann im betrieb durch austauschen der CSS-Datei gewechselt werden.
  Dafür kann die Funktion kijs.Dom.cssFileReplace(...) verwendet werden.
-- In der Test-App kann zwischen den Designs Standard, Alt und Joel gewechselt werden.

### Neue Eigenschaft bei Fields: disableFlex
 - Ist disableFlex=true, dann wird das Feld nicht automatisch über die ganze breite
   angezeigt, dies macht Sinn bei Feldern mit fixer Breite.
 - Bei folgenden Feldern ist der Standardwert true:
   Checkbox, ChekboxGroup, Color, DateTime, Month, OptionGroup, Range, Switch
   Bei allen anderen false.
 - Bitte bei allen Fields mit disableFlex=true die Eigenschaft "width" entfernen !!!!!

### kijs.gui.field.Switch
 - Neues Feld. Funktioniert wie eine Checkbox, sieht aber aus wie ein Slide-Button
 - Bitte neue Datei einbinden !!!!

### Viele kleinere Designanpassungen



#Version 1.2.7
==============
## Neue Features
----------------
 - der icon-column kann als icon ein iconMap übergeben werden
 - der icon-column kann ein tooltip definiert werden
 - Grid-Filter: Das Grid wird erst dann neu geladen, wenn alle Filter kein Fokus 
   mehr haben


## Fehlerbehebungen
-------------------
 - kijs.gui.Window.visible = false blendet die Modal-Maske auch aus
 - LayerManager aktualisiert, wenn ein Element unrendert
 - kijs.gui.Mask übernimmt z-index von Target



# Version 1.2.6
===============
## Änderungen
-------------
 - kijs.gui.MenuButton entfernt. Es kann neu ein Menu in allen Buttons gemacht werden.
    > !!! ANPASSUNG !!! kijs.gui.MenuButton mit kijs.gui.Button ersetzen, 
    elements in menuElements verschieben
 - iconChar: Neu sollte nicht mehr das HTML-Entity angegeben werden, sondern der Hex-Wert als Zahl.
    > FA-Icons sollten neu mit iconMap: 'kijs.iconMap.Fa.icon-name-hier' 
    eingebunden werden.
 - kijs.getObjectFromNamespace() ersetzt mit kijs.getClassFromXtype()

## Neue Klassen
---------------
 - kijs.gui.Menu für Kontextmenu und Dropdown-Menu



# Version 1.2.5
===============
## Änderungen
-------------
### Grid
 - Der Parameter `decimalThousandSep` heisst neu gleich wie beim Nummernfeld:
   `thousandsSeparator`
 - Editable: Navigation mit Enter und Tab

### Anderes
 - kijs.keys entfernt, da keyCodes deprecated sind und nicht mehr verwendet werden sollten.



# Version 1.2.4
===============
### Grid
- Grid-Remote-Loading optimiert. Reload ohne resetData lädt nun alle Rows im 
  Grid neu und selektiert die letzte Zeile erneut.
- Daten neu Laden (z.B. nach Filter change) setzt nun Scrolling zurück.
- Text-Filter lädt nun Daten nicht neu, wenn mit Enter gefiltert wird und danach 
  das Change-Event beim Verlieren des Fokus neu laden will.

### Combo
- onChange mit oldVal

### Anderes
- Maske weniger schwarz
- File-Upload decodiert neu Pfad und Dateiname. !!! ANPASSUNG PHP NÖTIG (urldecode) !!!
- Tooltip für Tabellenspalten



# Version 1.2.3
===============

## Fehlerbehebungen
-------------------
 - Memofeld nach "disablen" nicht mehr schreibbar behoben



# Version 1.2.0
===============
## Neue Klassen
---------------
 - kijs.gui.MonthPicker
 - kijs.gui.field.Month


## Änderungen
------------
### kijs.gui.DatePicker
    Überarbeitet

### kijs.gui.field.DateTime
    Überarbeitet. Viele Eigenschaften verändert.
    Hat neu eine mode Eigenschaft ('range', 'week', 'date', 'dateTime', 'time')

### Neue Funktionen in kijs.Date
- kijs.Date.diff(date1, date2);
- kijs.Date.getSqlDate(date);
- kijs.Date.getSqlDateTime(date);
- kijs.Date.getSqlTime(time);

### Neue Eigenschaft "values" bei Formularfeldern
   Das FormPanel setzt nun nicht mehr die value-Eigenschaft der Felder, sondern
   übergibt den ganzen Record an die neue "values" Eigenschaft.
   Das Feld nimmt sich selbstständig die benötigten Werte aus dem Record.
   Siehe dazu die Modulvariable "this._valuesMapping" im kijs.gui.field.Field und kijs.gui.field.DateTime

   Beim Abfragen der Werte wird nun auch die values Eigenschaft der einzelnen Felder abgefragt.

### Anpassungen an SpinBox
   Fehler beim ermitteln der Breite der SpinBox behoeben

   Wenn eine SpinBox eine weitere SpinBox enthält und in der Untergeordneten auf etwas geklickt wird,
   wird nun die übergeordnete SpinBox nicht mehr geschlossen.
   Das gleiche Problem bestand bereits früher beim kijs.gui.MenuButton. Den code dafür habe ich dort nun entfernt,$
   weil die Spinbox das nun selbstständig löst.

### "kijs.getGetParameter" -> nun "kijs.Navigator.getGetParameter"

### default htmlDisplayType vom kijs.gui.field.Display ist neu "code".

### Neue Funktion für Browser-Sprache zu ermitteln: kijs.Navigator.getLanguageId


##Anpassungen, die an Projekten vorgenommen werden müssen
---------------------------------------------------------
### Eigenschaft "trimValue" umbenennen zu "valueTrim"
Betrifft:
- kijs.gui.field.Display
- kijs.gui.field.Memo
- kijs.gui.field.Password
- kijs.gui.field.Text

### Eigenschaften "selectDateInPast" und "selectDateInFuture" gibt es nicht mehr.
Bitte dafür neu die Eigenschaften "minValue" und "maxValue" verwenden.
Beispiel: minValue:new Date()
Betrifft:
   - kijs.gui.field.DateTime
   - kijs.gui.DatePicker

### "kijs.getGetParameter" -> ändern zu "kijs.Navigator.getGetParameter"



# Version 1.1.3
===============
- toolTip in tooltip umbenannt (Muss in Projekten ersetzt werden, toolTip = DEPRECATED)
- kijs.Grafic in kijs.Graphic umbenannt (Muss in Projekten ersetzt werden!)
- Neue Funktionen für Manipulation von Farben in kijs.Graphic



# Version 1.1.2
===============
- Dateien werden neu in der "files.json" aufgeführt.
  Es gibt verschiedene Module, deren zugehörigen Dateien aufgeführt sind.



# Version 1.0.1
===============
Release kgweb
