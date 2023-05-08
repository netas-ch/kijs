Version 2.1.2
===============
 - Neues Theme "Retro"  
 - Kleinere Fehlerbehebungen  
 - Kleinere CSS Anpassungen  
 - kijs.gui.grid.Grid: Zusätzliche Vergleichsfunktionen bei Textfeldern in Filterzeile  



Version 2.1.1
===============
Home App (NEU)
----------------
http://localhost/kijs/home/  

App mit 
 - **Showcase** Zu jeder gui-Klasse gibt es eine Testseite  
   Ordner: ```kijs/home/data/showcase```  
 - **Tests** Hier können Testskripts hinterlegt werden.  
   Ordner: ```kijs/home/data/test```  
 - **Dokumentation** Hier befindet sich neu die History und weitere Dokus. **Bitte lesen!**  
   Ordner: ```kijs/home/data/docu```  

**Das testApp sollte nun nicht mehr für Tests verwendet werden.**  
Es existiert weiterhin als Beispiel-App.


Neue Features
----------------
### kijs.Date
 - Neue Funktion ```getAge()``` Berechnet das Alter aus einem Geburtsdatum.

### kijs.Dom
 - Neue Funktionen: 
   - ```jsFileAdd()```
   - ```jsFileHas()```
   - ```jsFileRemove()```

 - Die Funktion ```cssFileReplace()``` gibt neu ein Promise zurück

### kijs.gui.MsgBox
- Neue Statische Funktion ```kijs.gui.MsgBox.errorNotice()```  
  Funktioniert gleich wie ```kijs.gui.MsgBox.error()```. Es wird aber ein anderes Icon 
  angezeigt (Dreieck statt Kreis).

### kijs.gui.CornerTipContainer
- Neue Funktion ```errorNotice()```  
- Neues Icon ```'errorNotice'``` bei der statischen Funktion 
  ```kijs.gui.CornerTipContainer.show()```

### globales RPC-Instanzen  
Damit nicht in jedem Element, dass ein RPC-Objekt benutzt eine Instanz von einem 
```kijs.gui.Rpc``` übergeben werden muss und es bisher auch nicht möglich war via 
RPC einem Element eine RPC-Instanz zuzuweisen, können nun ```kijs.gui.Rpc```-Objekte 
global mit einem Namen definiert werden.  
Bei allen Elementen kann anstelle ```kijs.gui.Rpc````-Instanz auch nur der Name der 
globalen Instanz übergeben werden. Wird gar nichts angegeben, wird standardmässig 
die globale Instanz ```'default'``` verwendet.  
Globale Instanzen können über folgende Funktionen definiert/abgerufen werden:  
 - ```kijs.setRpc(name, rpc)``` Erstellt eine neue globale Instanz.  
   Die Standard-Instanz muss ```'default'``` heissen.
 - ```kijs.getRpc(name)``` Gibt eine globale Instanz zurück. Falls kein ```name``` 
   angegeben wird, wird die globale Instanz ```'default'``` zurückgegeben.  

**ACHTUNG!** Die RPC Funktion wird nicht mehr von dem übergeordneten 
```kijs.gui.FormPanel``` geholt!

### kijs.gui.container.Scrollable (NEU)
Funktioniert wie der Container, anstelle von Scrollbars werden Scroll-Buttons 
angezeigt.

### kijs.gui.container.Tab (NEU)
- Funktioniert ähnlich wie ```kijs.gui.container.Stack```. Es werden aber Tabs angezeigt.

### kijs.gui.field.Url (NEU)
- Feld für Internetadressen aller Art mit Button zum öffnen des Links.

### kijs.gui.field.SozVersNr (NEU)
- Feld für die schweizer Sozialversicherungs-Nr. und AHV-Nr.

### kijs.gui.field.QuillEditor (NEU)
- WYSIWYG Editor **wird evtl. in Zukunft durch einen besseren Editor ersetzt!**  


Änderungen
-------------
### aceEditor (kijs.gui.field.AceEditor)
 - kijs-Modul ```'editor'``` umbenannt zu ```'aceEditor'```. Bitte beim einbinden in 
   die index.html berücksichtigen.  
 - AceEditor aktualisiert auf neuste Version 1.18.0.  
   Achtung Dateistruktur hat geändert! 
 - ```kijs.gui.field.Editor``` umbenannt zu ```kijs.gui.field.AceEditor```  

### Private Funktionen
 - kijs verwendet neu private Funktionen.
 - Sie sind an der Präfix ```#``` zu erkennen.
 - In einer Klasse kommen sie unter der Überschrift ```// PRIVATE``` 
   direkt nach ```// PROTECTED```.
 - Private Funktionen werden nativ von JavaScript unterstützt und können nicht 
   überschrieben werden, bzw. sind eine eigene Funktion, auch wenn sie den gleichen 
   Namen besitzen.

### Listeners sind neu alle private
 - Neu sind im kijs alle Listeners private (Präfix: ```#```)
 - Dadurch wird verhindert, dass sie versehentlich in einer vererbten Klasse
   überschrieben werden.

## Listeners und callbackFn können nun alle per String übergeben werden.  
Dadurch können via RPC Funktionen oder Verweise auf Funktionen übermittelt werden. 
Auch der Kontext zu einer Funktion kann per String übergeben werden.  

### RPC response
        response.errorMsg 
        response.warningMsg
        response.infoMsg
        response.cornerTipMsg

 - Bisher konnte bei diesen Eigenschaften anstelle eines Strings auch ein Objekt  
   ```{msg:'...', title:'...', cancelCb: false}``` übergeben werden.  
   Neu können nur noch Strings übergeben werden.  
 - Für einen individuelle Titel gibt es neue Eigenschaften im response:  
   - ```errorTitle```
   - ```warningTitle```
   - ```infoTitle```
   - ```cornerTipTitle```
 - ```cancelCb``` gibt es nicht mehr, weil
   - beim verwenden einer Callback-Fn, diese nun immer aufgerufen wird (auch im Fehlerfall).
   - beim verwenden des Promise, immer entweder resolve (auch bei errorNotice)  
     oder reject (nur bei error) aufgerufen wird

### Ereignisse afterLoad und afterSave
- ```afterLoad``` und ```afterSave``` events haben neu nur noch ein Argument ```e```

### kijs
 - ```kijs.getClassFromXtype(xtype)``` umbenannt zu ```kijs.getObjectFromString(str)```  

### kijs.Graphic
 - Die Funktion ```colorGetHex()``` gibt neu auch einen # zurück.  
   Beispiel früher: ```'fafafa'``` neu: ```'#fafafa'```  

### kijs.Navigator
 - Die Funktion ```openLink()``` gibt es nicht mehr. Stattdessen bitte 
   ```openemailPhoneLink(href)``` oder ```window.open(href, target)``` benutzen.

### kijs.gui.ApertureMask
 - Die Funktion ```_updatePosition()``` ist jetzt nicht mehr public.  
   Stattdessen ```render()``` benutzen!

### kijs.Ajax
 - Die Funktion ```request()``` gibt nicht mehr den ```XMLHttpRequest``` zurück, 
   sondern ein ```Promise```.  
   Beim Promise gibt es kein reject. Es wird immer ```resolve``` ausgeführt.  
 - Die ```callbackFn``` hat neu nur noch ein Argument:  
   ```{ response: ..., request: ..., errorMsg: ... }```
 - Die ```progressFn``` hat neu nur noch ein Argument:

        { 
            nodeEventName: 'onprogress', 
            ajaxConfig: ..., 
            useCapture: false, 
            nodeEvent: ...,
            context: ...
        }

### kijs.Rpc
 - Die Funktion ```do(config)``` hat neu nur noch ein Argument ```config```. **ACHTUNG!!!**  
 - Es gibt eine neues config-Property ```owner```. Diesem kann in der Regel ```this``` 
   übergeben werden. Es wird verwendet um bei cancelRunningRpcs den owner zu unterscheiden.  
 - Die callbackFn fn hat neu nur noch ein Argument ```{ response: ..., request: ... }```  
 - Falls config.fn übergeben wurde wird immer diese fn ausgeführt (auch im Fehlerfall).  
   Dann wird auch kein Promise, sondern Null zurückgegeben.  
 - Wird **keine** fn übergeben, so wird ein Promise zurückgegeben. Im Fehlerfall wird 
   unterschieden zwischen ```errorType```:  
   - ```'errorNotice'``` (default): Es wird resolve ausgeführt.  
     Die errorMsg befindet sich dann unter ```e.response.errorMsg```.
   - ```'error'```: Es wird reject ausgeführt mit einem Error Objekt als Argument.

### kijs.gui.Rpc
 - Die Funktion ```do(config)``` hat neu nur noch ein Argument ```config```. **ACHTUNG!!!**   
 - Es gibt eine neues config-Property ```owner```. Diesem kann in der Regel ```this``` 
   übergeben werden. Es wird verwendet um bei cancelRunningRpcs den owner zu unterscheiden.  
 - Die ```callbackFn``` hat neu ein anderes Argument! **ACHTUNG!!!**  
   Bisher: ```responseData```  
   Neu: ```{ responseData: ..., requestData: ..., errorType: ..., errorMsg: ... }```  
 - Die ```callbackFn``` wird nun immer ausgeführt! Auch in einem Fehlerfall! **ACHTUNG!!!**  
   Um den gleichen Effekt wie früher zu haben muss der Inhalt der CallbackFn in ein  

        if(kijs.isEmpty(rpcData.errorMsg)) {  
            ...  
        }  

 - Das Promise wird nur noch zurückgegeben, wenn keine callbackFn übergeben wurde.
 - Bei der Funktion ```do()``` gibt es beim Promise nun ein reject.  
   Dieses wird nur ausgelöst, wenn keine callbackFn angegeben wurde, ein Fehler 
   mit ```errorType='error'``` vom Server gemeldet wurde.  
   Eine MsgBox wird zwar von kijs.gui.Rpc angezeigt, die Ladeanzeige wird auch entfernt.  
   Das reject muss aber trotzdem bei jedem Aufruf abgefangen werden, damit kein 
   Javascript-Fehler entsteht.  
   Minimale Fehlerbehandlung: ```.catch(() => {});```  
   Oder, wenn die übergeordnete Funktion async ist und await verwendet wird, können 
   Fehler mit einem normalen ```try{} catch{}``` abgefangen werden.
 - das Argument bei ```load()``` ```fnBeforeMessages``` gibt es nicht mehr.  
   Es wird nicht mehr benötigt, weil die Load Funktion nun immer eine Antwort zurückgibt.

### kijs.gui.Dom
 - Neue config/getter/setter ```disabled```

### kijs.gui.Element
 - config/getter/setter ```toolTip``` entfernt. => ```tooltip``` verwenden.
 - Neue config/getter/setter ```disabled```
 - Neuer getter ```hasFocus```  

### kijs.gui.Button
- Wird neu intern mit CSS display: flex aufgebaut.
- Das hat zur Folge, dass Buttons neu ohne Flex nicht mehr nebeneinander, sondern
  untereinander angeordnet werden.
- Hat ein Button eine Fixe Breite (oder eine Maximalbreite) und der Text darin
  ist zu breit, so wird er automatisch gekürzt und ... angehängt.
- Neue config/getter/setter ```disableFlex```. Mit der gleichen Funktionalität wie die 
  gleichnamige config/getter/setter bei Formularfeldern. Standard: ```true```
- Neue config/getter/setter ```smallPaddings```. Sollen links/rechts nur kleine Abstände sein?
  - ```true```
  - ```false```
  - ```'auto'``` (default) true = wenn Button hat keine Caption und disableFlex:false

### kijs.gui.Container
 - Neue config/getter/setter: 
   - ```scrollableX``` (default: ```false```)
   - ```scrollableY``` (default: ```false```)

   Mögliche Werte:  
    - ```false``` (keine Scrollbar/Scroll-Buttons)
    - ```true``` (Scrollbar/Scroll-Buttons immer sichtbar)
    - ```'auto'``` (automatisch sichtbar, wenn nötig)

 - Die config/getter/setter autoScroll gibt es nicht mehr  
   ==> ```autoScroll```: true bitte ersetzen durch durch ```scrollableY: 'auto'```  

 - Die config/getter/setter ```disabled``` blendet nicht mehr eine Maske ein, 
   sondern gibt das disabled auch an die Kinder weiter.
   Dabei wird der vorherige disable-Wert der Kinder gemerkt, damit sie beim 
   zurücksetzen (```disable: false```) wieder den gleichen Wert wie vorher erhalten.  
   Um trotzdem eine Maske über ein ganzes Panel zu legen kann dafür folgender 
   Code verwendet werden:  

        let mask = new kijs.gui.Mask({  
            target: myPanel  
        });  
        mask.show();  

 - Methode getElements() umbenannt zu getElementsRec()

 - Bei der Methode ```remove()``` haben die Argumente geändert.  
   Früher:  ```remove(elements, preventRender=false, destruct=false)```  
   Jetzt: ```remove(elements, preventRender=false, preventDestruct=false, preventEvents=false, superCall=false)```  
   **Bitte berücksichtigen!** => Der Standard ist neu Destruct! Projekt durchsuchen nach ```remove(```  

 - Bei der Methode ```removeAll()``` hat der Standardwert von ```destruct``` geändert.  
   Früher:  ```removeAll(preventRender=false, destruct=false)```  
   Jetzt: ```removeAll(preventRender=false, preventDestruct=false, preventEvents=false)```   
   **Bitte berücksichtigen!** => Projekt durchsuchen nach ```removeAll(```  

 **VORSICHT!** Der Standard bei remove() und removeAll() ist neu preventDestruct=false **!!!**  

### kijs.gui.container.Stack
 - **Umbenannt!** Heisst neu ```kijs.gui.container.Stack``` 
   (früher: ```kijs.gui.ContainerStack```).  
 - ```defaultAnimation``` umbenannt zu ```animation``` 
 - ```defaultDuration``` umbenannt zu ```animationDuration``` 
 - ```activeEl``` umbenannt zu ```currentEl``` 
 - bei ```currentEl``` wird ein von ```kijs.gui.Container``` vererbtes Element erwartet.  
   Eine Zahl ist nicht mehr erlaubt. ==> ```currentIndex``` verwenden.  
   Ein String ist nicht mehr erlaubt. ==> ```currentName``` verwenden.  
 - neue config/getter/setter ```currentIndex```  
 - neue config/getter/setter ```currentName```  
 - ```activateAnimated()``` umbenannt zu ```setCurrentAnimated()```  
 - ```setCurrentAnimated()``` gibt neu ein Promise zurück  
 - Werden animierte Übergänge gewünscht, so muss die Funktion ```setCurrentAnimated()``` 
   verwendet werden. Die setter ```currentEl```, ```currentIndex``` und ```currentName``` 
   wechseln ohne Animation.  
 - Die Standard-Animation ist neu ```'fade'``` 
 - ```flex: 1``` ist nicht mehr Standard im CSS und muss deshalb, wenn nötig mit 
   ```style: { flex:1 }``` noch hinzugefügt werden.  
 - Bisher war jedes Element innerhalb zusätzlich noch in einem DIV.  
   Dieses wird jetzt nicht mehr benötigt. Evtl. muss dies in eigenen CSS-Styles 
   noch angepasst werden.  

### kijs.gui.Panel
 - Der ```header``` und ```footer``` sind neu ```kijs.gui.container.Scroll```. 
   Elemente. (Früher waren es ```kijs.gui.Container``` Elemente). Sie besitzen 
   aber die gleichen configs/getter/setter wie früher.  
   Der Unterschied ist, dass keine Scrollbars mehr angezeigt werden, sondern 
   Scroll-Buttons.  
   
 - Neue Configs: 
   - ```footerScrollableX``` (default: ```'auto'```)
   - ```footerScrollableY``` (default: ```false```)
   - ```headerScrollableX``` (default: ```'auto'```)
   - ```headerScrollableY``` (default: ```false```)
   - ```scrollableX``` (default: ```false```)
   - ```scrollableY``` (default: ```false```)

   Mögliche Werte:  
    - ```false``` (keine Scrollbar/Scroll-Buttons)
    - ```true``` (Scrollbar/Scroll-Buttons immer sichtbar)
    - ```'auto'``` (automatisch sichtbar, wenn nötig)

   Weitere neue Configs:
    - ```headerBarDefaults```
    - ```headerDefaults```
    - ```footerDefaults```
    - ```footerBarDefaults```
    - ```disabled``` deaktiviert das ganze Panel
    - ```headerBarDisabled``` deaktiviert die headerBar
    - ```headerDisabled``` deaktiviert den header
    - ```innerDisabled``` deaktiviert den inner Container
    - ```footerDisabled``` deaktiviert den footer
    - ```footerBarDisabled``` deaktiviert die footerBar

 - ```footerCaption``` umbenannt zu ```footerBarCaption```
 - Der header (container-inner) ist neu geflext mit folgenden CSS-Eigenschaften:

        display: flex;
        flex-direction: row;

 - Der footer (container-inner) ist neu geflext mit folgenden CSS-Eigenschaften:

        display: flex;
        flex-direction: row;
        justify-content: right;

 - Neues Event: ```beforeClose```   

 - Bei der Methode ```close()``` haben die Argumente geändert.  
   Früher:  ```close(preventEvent=false)```  
   Jetzt: ```close(preventDestruct=false, preventEvents=false, superCall=false)```  
   **Bitte berücksichtigen!** => Projekt durchsuchen nach ```close(```  

 **VORSICHT!** Der Standard bei close() ist neu preventDestruct=false **!!!**  


### kijs.gui.FormPanel
 - Argument umbenannt bei Event afterLoad ```response``` heisst neu ```responseData```  
 - Felder mit ```disabled: true``` werden nicht mehr übermittelt.  
   Felder mit ```readOnly: true``` aber immer noch.  
 - config/getter/setter ```disabled``` verhaltet sich anders. Es werden nicht mehr 
   nur die untergeordneten Felder disabled, sondern das ganze FormPanel, inkl. allen 
   untergeordneten Elementen. Um nur den Content des FormPanels (ohne headerBar, 
   header, footer, footerBar) zu disablen kann ```innerDisabled``` verwendet werden.  
 - config/getter/setter ```readOnly``` verhält sich anders. Es wird nur ```true``` zurückgegeben, 
   wenn alle untergeordneten Felder ```readOnly``` sind, sonst ```false```.  
 - Methode ```resetValidation()``` umbenannt zu ```errorsClear()```.  
 - Werden einem Formular neue Felder hinzugefügt oder entfernt, muss neu anschliessend 
   die Funktion ```searchFields()``` ausgeführt werden, damit das Formular wieder 
   weiss, welche Felder zu ihm gehören und welche nicht. Vorher wurde das automatisch 
   gemacht. Aus performancegründen, muss man das nun manuell machen.  
 - Methode ```reset()``` entfernt. Um das Formular zu leeren kann ```clear()``` benutzt 
   werden. Um wieder ursprüngliche Werte zu laden, kann ```load()``` benutzt werden.  

### kijs.gui.DataView
 - Argument umbenannt bei Event afterLoad ```response``` heisst neu ```responseData```

### kijs.gui.grid.Grid
 - Die config ```facadeFnBeforeMsgFn``` gibt es nicht mehr.  

### kijs.gui.field.*
 - Früher besassen alle Felder ein spacerDom. Dieser füllte bei ```disableFle:true``` 
   den restlichen Platz rechts vom Feld aus.  
   Diesen gibt es nun nicht mehr. Der gleiche Effekt wird mit der CSS-Eigenschaft 
   ```align-self: start;``` erreicht. Diese wird bei ```disableFle:true``` automatisch 
   zugewiesen. Die Änderung sollte deshalb rückwärtskompatibel sein.  
 - Neue config ```validationRegExp```. Damit können Reguläre Ausdrücke zur Validierung 
   definiert werden.  
 - Neue Methode ```addValidationRegExp()```. Hinzufügen eins Regulären Ausdrucks 
   zur Validierung.  
 - Methode ```addValidateErrors()``` umbenannt zu ```errorsAdd()```  
 - Neue Methode ```errorsClear()```. Setzt die Validierungsfehler zurück.  
 - Neue Methode ```clear()```. Setzt den Wert auf Null zurück.
 - Methode ```markInvalid()``` entfernt. Stattdessen ```errorsAdd()``` oder 
   ```errorsClear()``` benutzen.  
 - Methode ```setValue()``` entfernt. Um den gleichen Effekt zu haben, kann folgender 
   Code benutzt werden:

        if (kijs.toString(newValue) !== kijs.toString(myField.value)) {
            this.value = newValue;
            myField.raiseEvent('change');
        }

 - config/getter/setter ```submitValue``` umbenannt zu ```submitValueEnable```  
 - config/getter/setter ```autocomplete``` ist nicht mehr bei allen Feldern vorhanden 
   und der Standardwert ist überall ```false```.  
   Nur noch vorhanden bei:  
   - ```kijs.gui.field.Checkbox```
   - ```kijs.gui.field.Color```
   - ```kijs.gui.field.DateTime```
   - ```kijs.gui.field.Email```
   - ```kijs.gui.field.Iban```
   - ```kijs.gui.field.Memo```
   - ```kijs.gui.field.Month```
   - ```kijs.gui.field.Number```
   - ```kijs.gui.field.Phone```
   - ```kijs.gui.field.Range```
   - ```kijs.gui.field.Text```
 - Das Event ```change``` haben nun alle Fields einheitlich. Im Argument ```e``` gibt es 
   die Properties ```value``` und ```oldValue```.  
 - ```isDirty``` funktioniert nun anders. Neu wird nicht mehr der alte Wert verglichen, 
   sondern es wird beim ```change```-Event ein Flag gesetzt. Siehe dazu auch den 
   Leitfaden ```isDirty```.  
 - Methode ```reset()``` entfernt.  

### kijs.gui.field.Text
 - Neue config ```formatFn``` und ```formatFnContext```. Damit kann eine eigene 
   Funktion zur Formatierung definiert werden. Die Formatierung wird direkt während 
   der Eingabe angepasst.  
 - Neue config ```formatRegExp```. Damit können Reguläre Ausdrücke zur Formatierung 
   definiert werden. Die Formatierung wird direkt während der Eingabe angepasst.
 - Neue Methode ```addFormatRegExp()```. Hinzufügen eins Regulären Ausdrucks 
   zur Formatierung.  
 - config/getter/setter ```valueTrim``` umbenannt zu ```valueTrimEnable```

### kijs.gui.field.Number
 - Neue config ```formatFn``` und ```formatFnContext```. Damit kann eine eigene 
   Funktion zur Formatierung definiert werden. Die Formatierung wird direkt während 
   der Eingabe angepasst.  
 - Neue config ```formatRegExp```. Damit können Reguläre Ausdrücke zur Formatierung 
   definiert werden. Die Formatierung wird direkt während der Eingabe angepasst.
 - Neue Methode ```addFormatRegExp()```. Hinzufügen eins Regulären Ausdrucks 
   zur Formatierung.  
 - Neue config/getter/setter ```allowedDecimalSeparators```. Array, mit möglichen 
   Dezimaltrennzeichen, die beim Eingeben verwendet werden dürfen.  
 - Neue config/getter/setter ```allowedThousandsSeparators```. Array, mit möglichen 
   Tausendertrennzeichen, die beim Eingeben verwendet werden dürfen.  
 - Neue configs/getter/setter zum Anzeigen von Spin-Buttons:  
   - ```spinButtonsVisible``` Sichtbarkeit der Buttons (default: false)  
   - ```spinStep```           Schrittgrösse (default: 1)  
   - ```spinAcceleration```   Beschleunigung in % (default: 20)  
   - ```spinDelay```          Intervall in ms (default: 400)  

### kijs.gui.field.Checkbox
 - Die config/getter/sett ```captionHide``` gibt es nicht mehr.
 - Das Ereignis ```input``` gibt es nicht mehr. Stattdessen ```change```verwenden.

### kijs.gui.field.ListView
 - Neuer getter/setter ```selectType```
 - Das Ereignis ```input``` gibt es nicht mehr. Stattdessen ```change```verwenden.

### kijs.gui.field.Display
 - config/getter/setter ```htmlDisplayType``` gibt es nicht mehr.
 - config/getter/setter ```linkType``` gibt es nicht mehr.
 - config/getter/setter ```links``` umbenannt zu ```clickableLinks```   
   Damit werden neu alle Hyperlinks (http, https, www und email) durch klickbare 
   Links ersetzt. Früher wurde der Link nur ersetzt, wenn im Feld sonst kein anderer 
   Text war.
 - Neue config ```formatFn``` und ```formatFnContext```. Damit kann eine eigene 
   Funktion zur Formatierung definiert werden. Die Formatierung wird direkt während 
   der Eingabe angepasst. Die Funktion erwartet als Rückgabe true/false und hat 
   zwei Argumente:  
   - ```value``` Eingegebener Wert
   - ```whileTyping``` true=Aufruf der Funktion während der Eingabe (input), 
     false=Aufruf beim Verlassen des Felds (change) oder set value.
 - Neue config ```formatRegExp```. Damit können Reguläre Ausdrücke zur Formatierung 
   definiert werden. Die Formatierung wird direkt während der Eingabe angepasst.
 - Neue Methode ```addFormatRegExp()```. Hinzufügen eins Regulären Ausdrucks 
   zur Formatierung.  
 - config/getter/setter ```valueTrim``` umbenannt zu ```valueTrimEnable```

### kijs.gui.Field.Memo
 - config/getter/setter ```valueTrim``` umbenannt zu ```valueTrimEnable```

### kijs.gui.Field.Password
 - config/getter/setter ```valueTrim``` umbenannt zu ```valueTrimEnable```  
 - Standardwert für config ```disableBrowserSecurityWarning``` ist neu ```false```. 
   Früher: ```'auto'```.  
### kijs.gui.field.Email
 - Config ```showLinkButton``` umbenannt zu ```linkButtonVisible``` und default ist jetzt ```true```    
 - Neuer getter ```linkButton```  
 - hat neu die CSS Klasse ```kijs-field-email``` anstelle von ```kijs-field-text```  

### kijs.gui.field.Iban
 - config/getter/setter ```formatValue``` gibt es nicht mehr.  
   Falls eine unformatierte IBAN gewünscht wird, kann dies durch folgende config 
   erreicht werden:  

        formatRegExp:[
            { 
                regExp: /\s/g, // Whitespace entfernen
                replace: ''
            }
        ]

## kijs.gui.field.Phone
- config ```showLinkButton``` umbenannt zu ```linkButtonVisible``` und default ist jetzt ```true```    
- config/getter/setter ```replaceLeadingZeros``` entfernt.  
- config ```formatValue``` entfernt. Es wird jetzt immer formatiert, falls eine 
  Formatierungs-Regel zutrifft.  
- Neue config/getter/setter ```internationalCallPrefix``` Default='00'  
- Neue config ```formatRegExp``` damit können die bestehenden Regln zum Formatieren 
  überschrieben werden.  
- Neue Methode ```addFormatRegExp()```. Damit können weitere Formatierungs-Regeln 
  hinzugefügt werden.  
- config ```defaultCountryCallingCode``` aht neuen Standardwert ```'+41'```.  

### kijs.gui.field.Switch
 - Die config/getter/setter ```captionHide``` gibt es nicht mehr.

### kijs.gui.field.Combo
 - Beim Event ```change``` wurde die Eigenschaft ```e.oldVal``` umbenannt zu 
   ```e.oldValue```.  


Änderungen im CSS
--------------------
### Layers
Das CSS von kijs ist nun in einem Layer ```@layer kijs {...}```.  
Damit kann neu die Priorität der einzelnen CSS-Dateien definiert werden: 
```@layer kijs, myApp;``` (weiter hinten = grössere Priorität).  

CSS-Styles, die in keinem Layer sind, haben die höchste Priorität.  
Falls also zusätzliche CSS-Dateien eingebunden werden, haben sie immer eine höhere 
Priorität als das kijs-CSS. Falls dies mal nicht gewünscht sein sollte, kann darin auch 
ein Layer definiert werden. Dann kann die Priorität definiert werden.  

### kijs-autoscroll
- Die CSS-Klasse ```kijs-autoscroll``` gibt es nicht mehr.  
  ==> Bitte dafür die Config ```scrollableY``` von kijs.gui.Container benutzen.

### Schriftgrössen vereinheitlicht.
- ```defaultFontSize```, ```buttonFontSize``` und ```itemFontSize``` von 11px 
  auf 12px erhöht.

### Neue Variablen
**Bitte bei eigenen Templates auch einbauen!**
- ```--button-lineHeight: 13px;```  
- ```--item-lineHeight: 13px;```  
- ```--bar-disabled-bkgrndColor:```
- ```--window-footer-button-focus-borderColor: var(--grey9);```  

### Neue Standard CSS-Klassen für Container zum layouten
Sie sind im Leitfaden *Layout* näher beschrieben.  
- ```kijs-flexfit```
- ```kijs-flexrowwrap```
- ```kijs-flexform```
- ```kijs-flexline```



Version 1.3.1
===============
Neue Features
----------------
 - RPC-Funktionen und MsgBox-Funktionen geben ein Promise (statt undefined) zurück,
   welches mit await abgewartet werden kann.



Version 1.3.0
===============
Neue Features
----------------
### Themes (light und dark)
 - Das theme kann im viewport über die config theme gesetzt werden:  
   ```'light'```, ```'dark'``` oder ```null```=auto. Default=null
 - Falls kein Viewport verwendet wird, kann das Theme auch über 
   ```kijs.Dom.themeSet(...)``` gesetzt werden.

### Neues Design
 - Das Standard-Design wurde überarbeitet. Es werden etwas weniger Farben verwendet.
 - Die Farben sind etwas lebendiger.
 - Neue Schriftart: Roboto
 - Darkmode
 - Bitte die ```kijs.theme.default.css``` vor der bestehenden ```kijs.gui.css``` 
   einbinden !!!!

### Eigene Designs
 - Neu kann relativ einfach ein eigenes Design erstellt werden.
 - Es müssen neu immer zwei CSS-Dateien eingebunden werden. Zuerst die des
   gewünschten Designs (z.B. ```kijs.theme.default.css```) und dann ```die kijs.gui.css```.
- Designanpassungen sollten immer in der ```kijs.theme.xxx.css``` gemacht werden.
- Pro Design müssen immer beide Themes (light und dark) definiert werden.
- Ein ```kijs.theme.xxx.css``` ist in die zwei themes light und dark unterteilt.
  Darunter gibt es dann folgenden Aufbau:
    - Farbschema-Variablen mit den Akzentfarben und 10 Graustufen
    - Zuweisung der Farbschema-Variablen zu den Detailvariablen
    - Falls neben Farbanpassungen noch weitere Anpassungen nötig sind, können
      diese am Ende der Datei gemacht werden
- Das Design kann im betrieb durch austauschen der CSS-Datei gewechselt werden.
  Dafür kann die Funktion ```kijs.Dom.cssFileReplace(...)``` verwendet werden.
-- In der Test-App kann zwischen den Designs Standard, Alt und Joel gewechselt werden.

### Neue Eigenschaft bei Fields: disableFlex
 - Ist ```disableFlex```=true, dann wird das Feld nicht automatisch über die ganze breite
   angezeigt, dies macht Sinn bei Feldern mit fixer Breite.
 - Bei folgenden Feldern ist der Standardwert ```true```:
   - ```Checkbox```
   - ```ChekboxGroup```
   - ```Color```
   - ```DateTime```
   - ```Month```
   - ```OptionGroup```
   - ```Range```
   - ```Switch```
   Bei allen anderen ```false```.
 - Bitte bei allen Fields mit ```disableFlex```=true die Eigenschaft ```width``` 
   entfernen !!!!!

### kijs.gui.field.Switch
 - Neues Feld. Funktioniert wie eine Checkbox, sieht aber aus wie ein Slide-Button
 - Bitte neue Datei einbinden !!!!

### Viele kleinere Designanpassungen



Version 1.2.7
==============
Neue Features
----------------
 - der icon-column kann als icon ein iconMap übergeben werden
 - der icon-column kann ein tooltip definiert werden
 - Grid-Filter: Das Grid wird erst dann neu geladen, wenn alle Filter kein Fokus 
   mehr haben


Fehlerbehebungen
-------------------
 - kijs.gui.Window.visible = false blendet die Modal-Maske auch aus
 - LayerManager aktualisiert, wenn ein Element unrendert
 - kijs.gui.Mask übernimmt z-index von Target



Version 1.2.6
===============
Änderungen
-------------
 - kijs.gui.MenuButton entfernt. Es kann neu ein Menu in allen Buttons gemacht werden.
    > !!! ANPASSUNG !!! kijs.gui.MenuButton mit kijs.gui.Button ersetzen, 
    elements in menuElements verschieben
 - iconChar: Neu sollte nicht mehr das HTML-Entity angegeben werden, sondern der Hex-Wert als Zahl.
    > FA-Icons sollten neu mit iconMap: 'kijs.iconMap.Fa.icon-name-hier' 
    eingebunden werden.
 - kijs.getObjectFromNamespace() ersetzt mit kijs.getClassFromXtype()

Neue Klassen
---------------
 - kijs.gui.Menu für Kontextmenu und Dropdown-Menu



Version 1.2.5
===============
Änderungen
-------------
### Grid
 - Der Parameter `decimalThousandSep` heisst neu gleich wie beim Nummernfeld:
   `thousandsSeparator`
 - Editable: Navigation mit Enter und Tab

### Anderes
 - kijs.keys entfernt, da keyCodes deprecated sind und nicht mehr verwendet werden sollten.



Version 1.2.4
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



Version 1.2.3
===============
Fehlerbehebungen
-------------------
 - Memofeld nach disablen nicht mehr schreibbar behoben



Version 1.2.0
===============
Neue Klassen
---------------
 - kijs.gui.MonthPicker
 - kijs.gui.field.Month


Änderungen
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

### Neue Eigenschaft ```values``` bei Formularfeldern
   Das FormPanel setzt nun nicht mehr die value-Eigenschaft der Felder, sondern
   übergibt den ganzen Record an die neue ```values``` Eigenschaft.
   Das Feld nimmt sich selbstständig die benötigten Werte aus dem Record.
   Siehe dazu die Modulvariable ```this._valuesMapping``` im kijs.gui.field.Field und kijs.gui.field.DateTime

   Beim Abfragen der Werte wird nun auch die values Eigenschaft der einzelnen Felder abgefragt.

### Anpassungen an SpinBox
   Fehler beim ermitteln der Breite der SpinBox behoeben

   Wenn eine SpinBox eine weitere SpinBox enthält und in der Untergeordneten auf etwas geklickt wird,
   wird nun die übergeordnete SpinBox nicht mehr geschlossen.
   Das gleiche Problem bestand bereits früher beim kijs.gui.MenuButton. Den code dafür habe ich dort nun entfernt,$
   weil die Spinbox das nun selbstständig löst.

### ```kijs.getGetParameter``` -> nun ```kijs.Navigator.getGetParameter```

### default htmlDisplayType vom kijs.gui.field.Display ist neu ```code```.

### Neue Funktion für Browser-Sprache zu ermitteln: kijs.Navigator.getLanguageId


Anpassungen, die an Projekten vorgenommen werden müssen
---------------------------------------------------------
### Eigenschaft ```trimValue``` umbenennen zu ```valueTrimEnable```
Betrifft:
- kijs.gui.field.Display
- kijs.gui.field.Memo
- kijs.gui.field.Password
- kijs.gui.field.Text

### Eigenschaften ```selectDateInPast``` und ```selectDateInFuture``` gibt es nicht mehr.
Bitte dafür neu die Eigenschaften ```minValue``` und ```maxValue``` verwenden.
Beispiel: minValue:new Date()
Betrifft:
   - kijs.gui.field.DateTime
   - kijs.gui.DatePicker

### ```kijs.getGetParameter``` -> ändern zu ```kijs.Navigator.getGetParameter```



Version 1.1.3
===============
- toolTip in tooltip umbenannt (Muss in Projekten ersetzt werden, toolTip = DEPRECATED)
- kijs.Grafic in kijs.Graphic umbenannt (Muss in Projekten ersetzt werden!)
- Neue Funktionen für Manipulation von Farben in kijs.Graphic



Version 1.1.2
===============
- Dateien werden neu in der ```files.json``` aufgeführt.
  Es gibt verschiedene Module, deren zugehörigen Dateien aufgeführt sind.



Version 1.0.1
===============
Release kgweb
