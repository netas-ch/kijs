Neuerungen mit dem Vermerk **UPDATE TIPP:** ... sind nicht rückwärtskompatibel.
Es sind evtl. Anpassungen am Projekt nötig.


Version 2.8.0 (ist noch in Entwicklung)
=============
### Anpassungen CSS
 - Font Awesome Update auf Version 6.5.2.
  **UPDATE TIPP:**: Neue Fonts in files.json eintragen.

 - Neue CSS-Variablen:
    - ```--mask-bkgrndColor: rgba(0, 0, 0, 0.35);```
    - ```--mask-fontColor: #fff;```
    - ```--mask-icon-fontColor: #fff;```
    - ```--checkbox-height: 20px;```
    - ```--checkbox-lineHeight: 18px;```
    - ```--range-btnHeight: 20px;```

 - Geänderte CSS-Variablen:
    - ```--checkbox-fontSize: 14px;```  (alter Wert: 20px)
    - ```--range-btnColor: var(--grey09);```  (alter Wert: var(--grey10))

**UPDATE TIPP:**: Die obigen Variablen in eigene Themes übernehmen. Siehe Beispiel
in kijs.theme.default.css.

### kijs.gui.field.Checkbox
 - Die Checkbox wird neu mit einem Border gezeichnet.
 - Folgende configs wurden entfernt:
    - ```checkedIconCls```
    - ```determinatedIconCls```
    - ```uncheckedIconCls```

### kijs.gui.ListView
 - Checkboxen/Optionen werden neu mit einem Border gezeichnet.

### kijs.gui.field.OptionGroup
 - Neu kann die gewählte Option wieder abgewählt werden.
   Ist ```required: true```, kann der Wert nicht abgewählt werden.

### kijs.gui.field.Number
 - Beim Drücken auf die Spinner-Buttons kommt nun auch das input-event.  

### kijs.gui.field.Range
 - CSS Überarbeitet, so dass das Feld in allen Browsern gleich aussieht.  

### kijs.gui.Container
 - Die Funktion ```add()```hat eine neue Anordnung der Argumente:
   Früher:
    ```add(elements, index=null, preventRender=false)```
   Neu:
    ```add(elements, index=null, options={})```

   options Eigenschaften:
    - ```preventRender```   render verhindern? (Boolean, Default=false)
    - ```preventEvents```   Das Auslösen des beforeAdd und add-Events verhindern? (Boolean, Default=false)

   **UPDATE TIPP:** Projekt nach ```add(``` durchsuchen und die Argumente anpassen:

        {
            preventRender: ...,   // war in Argument 3
            preventEvents: ...,   // ist neu
        }

### kijs.gui.Window
 - Alle Fenster werden neu nicht mehr mit einem ```DIV``` gemacht, sondern mit einem 
   ```DIALOG```. Bei Modalen Fenstern ist es darum nicht mehr möglich mit der Tastatur 
   zu verdeckten Elementen zu Navigieren.  
 - Fenster können nun auch auf Touch-Geräten verschoben werden.  

**UPDATE TIPP:** LESS/CSS-Dateien nach folgenden Wörtern durchsuchen und wie 
folgt ersetzen:  
 - ```div.kijs-window``` --> ```dialog.kijs-window```  
 - ```div.kijs-panel``` --> ```div.kijs-panel, dialog.kijs-panel```  
 - ```div.kijs-msgox``` --> ```dialog.kijs-msgbox```  

### kijs.gui.Mask
Wenn eine Maske den ganzen document.body abdeckt, wird sie neu mit einem dialog-Tag 
erstellt (sonst div-Tag). Bei einem dialog-Tag wird verhindert, dass mit der Tastatur 
hinter die Maske navigiert werden kann.  
Masken haben neu ein zusätzliches div, in dem das Icon und der Text angezeigt wird.  

### kijs.gui.Splitter
 - Splitter können nun auch auf Touch-Geräten verschoben werden.  

### kijs.gui.Resizer
 - Splitter können nun auch auf Touch-Geräten bedient werden.  

### kijs.gui.dataView.Element entfernt
Stattdessen gibt es neu verschiedene Möglichkeiten:
 - ```kijs.gui.dataView.element.Base```     Basisklasse, die für eigene Klassen vererbt
                                            werden kann.
 - ```kijs.gui.dataView.element.autoHtml``` Erstellt automatisch aus dem Datensatz
                                            HTML-Code (wie bisher).
 - ```kijs.gui.dataView.element.ListView``` Wird für das kijs.gui.ListView verwendet.

### kijs.gui.DataView
 - Neue config/getter/setter ```elementXType```. xtype (String) des Elements,
   dass verwendet werden soll. Muss von kijs.gui.dataView.element.Base vererbt sein.
   Standard: ```kijs.gui.dataView.element.AutoHtml```
 - Zusätzlicher möglicher Wert für ```selectType```: ```'singleAndEmpty'```
   Verhält sich gleich wie ```'single'``` der aktuelle Datensatz kann aber wieder
   abgewählt werden.
 - Funktion ```createElement()``` ist jetzt Protected: ```_createElement()```

**UPDATE TIPP:**: Falls kijs.gui.DataView vererbt wurde und darin die Funktion
```createElement()``` verwendet wurde. Gibt es zwei Möglichkeiten:
- Möglichkeit einfach
  ```createElement()``` umbenennen zu ```_createElement()```

- Möglichkeit schön und besser
  - Die eigene Funktion ```createElement()``` löschen.
  - Eine eigene Element Klasse erstellen: ```kijs.gui.dataView.element.MeinElement```
    und darin, in der Funktion ```update()``` den Inhalt generieren.

  - Im DataView dann im Konstruktor folgendes einfügen:

        // Standard-config-Eigenschaften mergen
        Object.assign(this._defaultConfig, {
            elementXType: 'kijs.gui.dataView.element.MeinElement'
        });

    Als Beispiel siehe ```kijs.gui.dataView.element.ListView```

### kijs.String
 - Neue Funktion ```kijs.String.toRegExp()```



Version 2.7.4
=============
### kijs.Rpc, kijs.gui.Rpc
 - Zusätzliche config bei do(): ```exclusive``` (boolean)  
   RPC können nun exklusiv geschickt werden.  
   Exklusive RPCs werden sofort geschickt und nicht mit anderen RPCs zusammengefasst.  
   Damit können z.B. Anfragen, die eine lange Verarbeitungszeit auf dem Server haben 
   getrennt von anderen Anfragen abgehandelt werden.  
   Beispiel:  

        kijs.getRpc('default').do({
            ...
            exclusive: true
        });



Version 2.7.3
=============
### kijs.gui.grid.Grid
Bugfix: Navigation mit Pfeiltasten



Version 2.7.2
=============
### kijs.gui.Rpc
 - Die Standardwerte folgender Configs, werden nun erst gesetzt, wenn Sie verwendet 
   werden:  
    - ```defaultCornerTipTitle```  
    - ```defaultErrorTitle```  
    - ```defaultInfoTitle```  
    - ```defaultWarningTitle```  



Version 2.7.1
=============
### kijs.gui.container.Fieldset (NEU)
Neue CSS-Variablen:

    --container-fieldset-label-height: 16px;
    --container-fieldset-icon-fontSize: 16px;
    --container-fieldset-caption-fontSize: 12px;
    --container-fieldset-caption-lineHeight: 16px;
    --container-fieldset-caption-paddingTop: 0px;

    --container-fieldset-borderColor: var(--grey07);

**UPDATE TIPP:**: Die obigen Variablen in eigene Themes übernehmen. Siehe Beispiel
in kijs.theme.default.css.

**UPDATE TIPP:** Neue Datei kijs.gui.container.Fieldset.js einbinden.



Version 2.7.0
=============
### Neue CSS-Variablen
 - ```--icon-fontSize: 20px;```
 - ```--button-height: 30px;```
 - ```--field-height: 30px;```
 - ```--field-label-paddingTop: 7px;``` ->Y-Position des Labels an Feld anpassen
 - ```--checkbox-fontSize: 20px;```
 - ```--switch-height: 28px;```

Variablen für Standard-Feldbreiten:
 - ```--defaultField-inputWidth: 220px;```
 - ```--defaultNumber-inputWidth: 100px;```
 - ```--defaultMonth-inputWidth: 130px;```
 - ```--defaultDate-inputWidth: 90px;```
 - ```--defaultTime-inputWidth: 70px;```
 - ```--defaultDateTime-inputWidth: 150px;```
 - ```--defaultWeek-inputWidth: 90px;```
 - ```--defaultDateRange-inputWidth: 190px;```
 - ```--defaultPhone-inputWidth: 150px;```
 - ```--defaultSozVersNr-inputWidth: 140px;```

**UPDATE TIPP:**: Die obigen Variablen in eigene Themes übernehmen. Siehe Beispiel
in kijs.theme.default.css.


### Theme kijs.theme.default.css angepasst
Alles wurde um ca. 20% vergrössert, damit die Bedienung auf Mobilen-Geräten
besser ist.
Die Masse können nun mit CSS-Variablen individuell eingestellt werden.
Hier die vorgenommenen Anpassungen:
| CSS Variable                  | alter Wert | neuer Wert |
| ----------------------------- | ---------- | ---------- |
| --default-fontSize            | 12px       | 14px       |
| --default-lineHeight          | 14px       | 16px       |
| --icon-fontSize               | 16px       | 20px       |
| --button-fontSize             | 12px       | 14px       |
| --button-lineHeight           | 14px       | 16px       |
| --button-height               | 25px       | 30px       |
| --field-fontSize              | 12px       | 14px       |
| --field-lineHeight            | 14px       | 16px       |
| --field-height                | 25px       | 30px       |
| --field-label-paddingTop      | 6px        | 7px        |
| --checkbox-fontSize           | 15px       | 20px       |
| --switch-height               | 20px       | 28px       |
| --badge-fontSize              | 10px       | 12px       |
| --badge-lineHeight            | 14px       | 16px       |
| --headerBar-fontSize          | 14px       | 16px       |
| --footerBar-fontSize          | 12px       | 14px       |
| --msgbox-fontSize             | 12px       | 14px       |
| --msgbox-lineHeight           | 14px       | 16px       |
| --item-fontSize               | 12px       | 14px       |
| --item-lineHeight             | 14px       | 16px       |
| --item-label-fontSize         | 10px       | 12px       |
| --panel-collapse-height       | 30px       | 36px       |
| --panel-collapse-width        | 30px       | 36px       |
| --defaultField-inputWidth     | 180px      | 220px      |
| --defaultNumber-inputWidth    | 80px       | 100px      |
| --defaultMonth-inputWidth     | 130px      | 130px      |
| --defaultDate-inputWidth      | 80px       | 90px       |
| --defaultTime-inputWidth      | 80px       | 70px       |
| --defaultDateTime-inputWidth  | 130px      | 150px      |
| --defaultWeek-inputWidth      | 80px       | 90px       |
| --defaultDateRange-inputWidth | 170px      | 190px      |
| --defaultPhone-inputWidth     | 130px      | 150px      |
| --defaultSozVersNr-inputWidth | 120px      | 140px      |


### kijs.gui.Spacer (NEU!)
Ein Spacer ist ein leeres Element mit ```flex: 1```.
Er kann verwendet werden um z.B. in einer Toolbar eine Lücke einzufügen.
Die Elemente links vom Spacer sind dann Linksbündig und die rechts davon sind
rechtsbündig ausgerichtet.

Für den Spacer gibt es auch eine Kurzform: ```">"```.

**Hinweis:**
Damit gibt es nun zwei Kurzformen:
| Kurzform | Element            |
| -------- | ------------------ |
| "-"      | kijs.gui.Separator |
| ">"      | kijs.gui.Spacer    |

Siehe dazu auch die Beispiele im Showcase.

**UPDATE TIPP:** Neue Datei kijs.gui.Spacer.js einbinden.


### kijs.gui.Panel: die footerElements werden nicht mehr rechtsbündig ausgerichtet
Bisher wurden footerElements mit ```justify-content: end``` rechtsbündig
ausgerichtet. Falls die Elements nicht genügend Platz hatten, erschien aber keine
Scrollbar. Der Grund ist, dass die Browser nicht in Minus scrollen können.
Wenn gesrollt werden soll, sollte ein Element dehalb immer ```justify-content: start```
haben.
Die Funktionsweise des Footers ist damit nun identisch mit der des Headers.
Um die Elemente trotzdem rechtsbündig auszurichten, kann als erstes Kind ein
```kijs.gui.Spacer``` eingefügt werden (Kurzform = ```">"```).

**UPDATE TIPP:** Quellcode nach ```footerElements``` durchsuchen und überall zu
Beginn folgendes Element einfügen: ```">"```


### kijs Event ```rightClick``` umbenannt zu ```contextMenu```
Das Event ```contextMenu``` kommt beim
 - drücken der Rechten Maustaste
 - drücken der Kontext-Menü-Taste auf der Tastatur
 - einem longTouch auf Touch-Geräten

**UPDATE TIPP:** Quellcode nach ```rightClick``` durchsuchen und durch
```contextMenu``` ersetzen.


### kijs.Navigator
- Neuer Getter ```isTouch```. Bei Touch-Geräten ist diese Eigenschaft auf true.


### kijs.gui.field.Display
- Neue CSS-Klasse ```kijs-titleLarge```. Damit wird die font-size auf 16px gestellt.


### Die meisten Texte können nun vom Benutzer mit der Maus selektiert werden


### kijs.gui.container.Scroll
Funktioniert jetzt auch auf Mobilen Geräten.


### kijs.gui.field.Switch
Der Knopf kann neu mit der Maus oder per Touch gezogen werden.


### kleinere Anpassungen
 - initial-scale der Home-App auf 1 geändert
 - Schriftgrössen in Home-App Dokumentation vergrössert
 - Theme kijs.theme.old.css gelöscht



Version 2.6.0
=============
### Argumente bei der Funktion kijs.getText() haben geändert
Früher: ```getText(key, variant='', args=null, comment='', languageId=null)```
Neu: ```getText(key, variant='', args=null, languageId=null)```

**UPDATE TIPP:** Quellcode nach ```getText(``` durchsuchen und falls irgendwo
ein Aufruf mit 4 oder mehr Argumenten existiert, das vierte Argument (comment)
löschen.



Version 2.5.6
=============
### kijs.gui.field.DateTime
 - Beim zuweisen eines Werts beim Setter ```mode```, wird neu der ```value```auf
   ```null``` gesetzt.

### kijs.gui.field.*
 - CSS von zusätzlichen Buttons bei allen Formularfeldern vereinheitlicht.
   Buttons mit der CSS-Klasse ```kijs-inline``` übernehmen nun die Höhe
   ```inputHeight```.



Version 2.5.5
=============
kleinere Änderungen



Version 2.5.4
=============
### kijs.gui.DataView
 - neue Events:
    - ```elementMouseDown```
    - ```elementMouseUp```
 - Eine Zeile wird neu bei ```elementMouseDown``` selektiert und nicht mehr bei
   ```elementClick```.

## kijs.gui.Grid
BugFix: Der ```beforeSelectionChange```-Event wird nun immer vor dem Ändern der
Selektierung ausgeführt.

## CSS
 - Neue Variablen: ```--panel-collapse-height``` und ```--panel-collapse-width```



Version 2.5.3
=============
### kijs.gui.field.*
 - neue config/getter/setter ```inputHeight```
   Setzt die Höhe des Input-Feldes.
 - bei ```labelPosition='top'``` wird neu die ```labelWidth``` ignoriert und das
   Label kann so breit sein, wie das ganze Feld.

### kijs.gui.field.Number
 - Die Spin-Buttons werden nun auch bei einem mehrzeiligen Label korrekt angezeigt.

### kijs.gui.Resizer
 - Das Resizer-Overlay wird nun über allem angezeigt.
   Früher war es hinter anderen Fenstern.



Version 2.5.2
=============
### FontAwesome
 - Neue Fonts waren nicht richtig in der files.json

### kijs.gui.Dashboard
 - Panels haben neu im Retro Design einen weissen Hintergrund



Version 2.5.1
=============
### Anpassungen CSS
 - Font Awesome Update auf Version 6.5.1.

 - Das Theme Retro ist nun in einem CSS-Layer kijs-theme.

   **UPDATE TIPP:** Damit die CSS in der richtigen Reihenfolge geladen werden,
   sollte in das ```<head>```-Tag der index.html folgender Code:

        <style>
            @layer kijs, kijs-theme, app;
        </style>

 - CSS Variablen wurden anders durchnummeriert und es gibt neue.

   **UPDATE TIPP:**
   Suchen und ersetzen verwenden:
    - ```--grey9``` umbenennen zu ```--grey11```
    - ```--grey8``` umbenennen zu ```--grey09```
    - ```--grey7``` umbenennen zu ```--grey08```
    - ```--grey6``` umbenennen zu ```--grey07```
    - ```--grey5``` umbenennen zu ```--grey06```
    - ```--grey4``` umbenennen zu ```--grey05```
    - ```--grey3``` umbenennen zu ```--grey04```
    - ```--grey2``` umbenennen zu ```--grey03```
    - ```--grey1``` umbenennen zu ```--grey02```
    - ```--grey0``` umbenennen zu ```--grey00```

   Neue Variablen in eigenen Themes erstellen:
    - ```--grey01```
    - ```--grey10```
    - ```--icon-fontColor```
    - ```--icon-disabled-fontColor```
    - ```--bar-icon-fontColor```
    - ```--bar-icon-disabled-fontColor```

 - viele weitere kleinere CSS-Anpassungen.



### kijs.gui.Panel
 - Panels haben neu Standardmässig einen Rahmen!
   Der Rahmen kann mit der CSS-Klasse ```kijs-borderless``` ausgeschaltet werden.

   **UPDATE TIPP:** Alle GUI-Ansichten im Programm manuell kontrollieren und dort
   wo nötig die CSS-Klasse ```kijs-borderless``` hinzufügen.

 - Das config/getter/setter ```shadow``` gibt es nicht mehr.
   Mit der CSS-Klasse ```kijs-shadow``` kann der Schatten hinzugefügt werden.

   **UPDATE TIPP:** Projekt nach ```shadow``` durchsuchen und überall die Eigenschaft
   ```shadow: true``` entfernen und dafür die CSS-Klasse ```kijs-shadow``` hinzufügen.
   Dies kann über ```cls: 'kijs-shadow``` geschehen oder falls schon eine Klasse
   vorhanden ist: ```cls: ['kijs-shadow', 'andereKlasse']```


### kijs.gui.FormPanel umbennannt zu kijs.gui.container.Form
Das ```kijs.gui.FormPanel``` gibt es nicht mehr.
Dafür gibt es neu das ```kijs.gui.container.Form```. Dieses ist diekt vom
```kijs.gui.Container``` vererbt und hat somit keine Panel-Funktionen mehr.

**UPDATE TIPP:** Das Projekt nach ```FormPanel``` durchsuchen und den xtype ändern.
Falls auch Panel-Funktionen (caption, headerbar, header, footer, footerbar, etc.)
verwendet werden, muss das container.Form in ein neues Panel getan werden:

    {
        xtype: 'kijs.gui.Panel',
        cls: 'kijs-flexfit',
        ... andere Eigenschaften des Panels, die im FormPanel waren
        elements: [
            {
                xtype: 'kijs.container.Form',
                cls: 'kijs-flexform',
                ... weitere Eigenschaften des Forms
            }
        ]
    }

### weitere Anpassungen
 - Die alte testApp wurde gelöscht.



Version 2.4.1
=============
### Anpassungen an Drag&Drop
 - CSS Klasse ```kijs-dragover``` umbenannt zu ```kijs-sourceDragOver```
 - CSS Klasse ```kijs-dropmarker``` umbenannt zu ```kijs-dropMarker```
   **UPDATE TIPP:** CSS nach ```kijs-dragover``` und ```kijs-dropmarker```
   durchsuchen und umbenennen.

 - Verschiedene zusätzliche Funktionen. Siehe dazu den Leitfaden ```Drag and Drop```

### Anpassungen CSS
 - CSS von kijs.gui.grid.Grid angepasst
 - CSS von kijs.gui.Button angepasst
 - CSS von kijs.gui.field.Range angepasst
 - weitere kleinere CSS anpassungen
 - Retro Theme überarbeitet

### kijs.gui.field.*
 - neue config/getter/setter ```labelPosition```
   Mögliche Werte:
    - ```'left'``` das Label befindet sich auf der Linken Seite (Standard)
    - ```'top'``` das Label befindet sich oberhalb
    - ```'auto'``` bei einer Fensterbreite < 500px befindet sich das Label
      oberhalb, sonst links
 - neue config/getter/setter ```inputWidth```. Damit kann die Breite des
   inputWrappers direkt eingestellt werden.
   Dies sollte in Kombination mit ```disableFlex: true``` gemacht werden.
 - Neuer DOM-Node mit CSS-Klasse ```kijs-content```, indem alle Elemente ausser
   das Label sind und einen neuen DOM-Node mit CSS-Klasse ```kijs-buttons```,
   indem, falls vorhanden fixe Buttons, wie z.B. der Spin-Button sind.
   Aufbau der DOM-Nodes (Namen der CSS-Klassen):
   - kijs-field
     - kijs-label
     - **kijs-content**
       - kijs-inputwrapper (wrapper-DIV, das den INPUT-Node enthält)
       - kijs-buttons (fixe Buttons, wie z.B. Spin-Button. Nicht in jedem Feld vorhanden.)
       - kijs-container-inner (mit benutzerdefinierten elements)
       - kijs-icon-help
       - kijs-icon-error

   **UPDATE TIPP:** Evtl. muss eigener CSS-Code von Fields angepasst werden.

 - Das Spin-Icon ist jetzt ein Spin-Button. Dadurch ändern sich folgende
   config/getter/setter:
    - ```spinIcon``` -> ```spinButton``` (die config und den setter gibt es nicht mehr)
    - ```spinIconChar``` -> ```spinButtonIconChar```
    - ```spinIconCls``` -> ```spinButtonIconCls```
    - ```spinIconColor``` -> ```spinButtonIconColor```
    - ```spinIconMap``` -> ```spinButtonIconMap```
    - ```spinIconVisible``` -> ```spinButtonHide``` (Vorsicht: Wert ist negiert)
    - ```spinButtonsVisible``` -> ```spinButtonsHide``` (Vorsicht: Wert ist negiert)
    - ```linkButtonVisible``` -> ```linkButtonHide``` (Vorsicht: Wert ist negiert)

    **UPDATE TIPP:** Suchen & ersetzen in Projekt.

### kijs.gui.container.Tab
 - Es gibt jetzt ein Kontext-Menü auf den Tab-Buttons, mit dem mehrere Tabs
   geschlossen werden können.
 - Beim ```kijs.gui.container.tab.Container``` gibt es eine neue config/getter/setter
   ```tabMenuHide```, mit dem das Menü ausgeblendet werden kann.
 - Neue Klasse kijs.gui.container.tab.Button für den Tab-Button.
   **UPDATE TIPP:** kijs.gui.container.tab.Button.js in Projekt aufnehmen.

### kijs.gui.grid.Grid
 - Argumente des RPC load angepasst:
   Früher:
    - sort
    - getMetaData
    - filter
    - start
    - limit
    - ... evtl. weitere eigene Argumente

   Neu:
    - config ```{ sort:... , getMetaData:..., filter:..., start:..., limit:... }```
    - ... evtl. weitere eigene Argumente

   **UPDATE TIPP:** In allen Facaden-Funktionen für grid.load die Argumente
   entsprechend  anpassen.


Version 2.3.1
=============
### Neue Benennungen von RPC-configs/getters/setters
 - ```facadeFnLoad``` heisst nun ```rpcLoadFn```
 - ```facadeFnSave``` heisst nun ```rpcSaveFn```
 - ```rpcArgs``` heisst nun ```rpcLoadArgs```. Bei save-Funktionen gibt es neu eine
   eigene ```rpcSaveArgs``` config/getter/setter.

**UPDATE TIPP:** Folgende Texte im ganzen Projekt durch suchen/ersetzen ändern
(dabei nur nach ganzen Wörtern suchen):
 - ```facadeFnLoad``` ersetzen durch ```rpcLoadFn```
 - ```facadeFnSave``` ersetzen durch ```rpcSaveFn```
 - ```rpcArgs``` ersetzen durch ```rpcLoadArgs```
 - ```facadeFnArgs``` ersetzen durch ```rpcLoadArgs``` (hiess bei kijs.gui.Grid so)

### kijs.rpc und kijs.gui.rpc
- Bei allen ```save()``` Funktionen kann neu in der Antwort ein ```responseData.config```
  sein, dass angewendet wird (wie bei ```load()```).
- Bei der Funktion ```do(config)``` die config-Property ```facadeFn``` umbenannt
  nach ```remoteFn```.

  **UPDATE TIPP:** Projekt nach ```facadeFn``` durchsuchen und ersetzen durch
  ```remoteFn```. Vorsicht! Nur ersetzen, wenn ein Argument von do(config)!

**UPDATE TIPP:** Zur Kontrolle kann im Projekt noch nach ```facade``` gesucht werden.
Dieses Wort/Wortbestandteil sollte nun nirgends mehr vorkommen.


### andere Benennung von Properties in RPC Antworten
Betrifft alle kijs Klassen mit RPC!!!
Ausnahme: kijs.gui.Tree und kijs.gui.grid.Grid (diese werden erst in einer
zukünftigen Version überarbeitet)

 - ```responseData->rows``` NEU: ```responseData->config->data```
 - ```responseData->selectFilters``` NEU: ```responseData->config->selectFilters```
 - ```responseData->formData``` NEU: ```responseData->config->formData```

**UPDATE TIPP:** PHP nach ```responseData``` durchsuchen und ```rows``` und
```selectFilters``` umbenennen.

Vorsicht: Das RPC Argument beim Speichern eines FormPanels heisst immer noch
```requestData->formData```.


### Drag&Drop
Unterstützung von Drag&Drop. Dazu gibt es folgende neuen Klassen:
 - kijs.gui.DragDrop
 - kijs.gui.dragDrop.Source
 - kijs.gui.dragDrop.Target
Siehe dazu den Leitfaden 'Drag&Drop'.
Die alte Klasse ```kijs.DragDrop``` gibt es nicht mehr!

### kijs.gui.Container
 - Beim einfügen neuer Elemente in den Container wird neu noch das ```afterResize```-Event
   auf dem Container ausgelöst. Dieses wird auch an alle elements weitergericht.
 - Die Funktionen ```remove()``` und ```removeAll()``` haben eine neue Anordnung
   der Argumente:
   Früher:
    ```remove(elements, preventRender, preventDestruct, preventEvents)```
    ```removeAll(preventRender, preventDestruct, preventEvents)```
   Neu:
    ```remove(elements, options={})```
    ```removeAll(options={})```

   options Eigenschaften:
    - ```preventDestruct``` desctruct verhindern? (Boolean, Default=false)
    - ```preventUnrender``` unrender verhindern? (Boolean, Default=false)
    - ```preventRender```   render verhindern? (Boolean, Default=false)
    - ```preventEvents```   Das Auslösen des beforeRemove und remove-Events verhindern? (Boolean, Default=false)

   **UPDATE TIPP:** Projekt nach ```remove``` durchsuchen und die Argumente anpassen:

        {
            preventRender: ...,   // Argument 1 bei removeAll / 2 bei remove
            preventDestruct: ..., // Argument 2 bei removeAll / 3 bei remove
            preventEvents: ...,   // Argument 3 bei removeAll / 4 bei remove
        }

 - kijs.gui.Separator können neu einfach als ```'-'``` hinzugefügt werden.
   Beispiel:

        elements: [
            { xtype: 'kijs.gui.Button', caption: 'Button 1' },
            '-',
            { xtype: 'kijs.gui.Button', caption: 'Button 2' }
        ]

### kijs.gui.Element
 - Neue config/getter/setter ```ddSource```. Siehe dazu den Leitfaden 'Drag&Drop'.
 - Neuer getter ```index```. Gibt den Index des Elements im elements-Array des parent
   an oder ```null```.
 - getter ```isAppended``` gibt es nicht mehr. Dieser getter gab nur zurück, ob
   der node ein parent node hat. Dies hiess aber nicht unbedingt, dass der node
   auch sichtbar war, denn es konnt sein, dass der parent node selbst noch kein
   parent node hat.
   Da beim hinzufügen von neuen Elementen in einen container neu das ```afterresize```
   Event kommt, solte nun alles auch ohne diesen getter funktionieren.
   **UPDATE TIPP:** Projekt nach ```isAppended``` durchsuchen.
 - Neue config/getter/setter, mit denen der die Configs des Elements (oder von
   vererbten Klassen) via RPC geladen werden können:
    - ```rpc```
    - ```rpcLoadFn```
    - ```rpcLoadArgs```
    - ```autoLoad```
   Siehe dazu auch den Leitfaden "Ajax und RPC" unter "Laden von configs".
   Dies funktioniert natürlich auch in allen abgeleiteten Klassen.
   Ausnahmen, wo es im Moment noch nicht funktioniert:
    - kijs.gui.grid.Grid
    - kijs.gui.Tree
    - kijs.gui.field.Combo
 - Wegen der neuen Drag&Drop-Unterstützung gibt es folgende Events im
   ```kijs.gui.Element``` und allen vererbten Klassen nicht mehr:
    - ```drag```
    - ```dragEnter```
    - ```dragOver```
    - ```dragStart```
    - ```dragLeave```
    - ```dragEnd```
    - ```drop```
   Falls sie trotzdem noch verwendet werden, kann ein Listener auf den ```kijs.gui.Dom```
   erstellt werden (dort gibt es sie noch).

### kijs.gui.Dom
 - getter ```isAppended``` gibt es nicht mehr. Sie dazu auch den Kommentar unter
   kijs.gui.Element.
 - Die Methode ```scrollIntoView()``` hat neu ein optionales Argument ```options```
   Sie verhält sich nun anderes, als vorher. Standardmässig wird jetzt nur noch der
   erste 'Elterncontainer mit Scrollbar' gescrollt. Übergeordnete Container werden
   nicht mehr gescrollt.

   **UPDATE TIPP:** um die gleiche Funktionalität wie vorher zu haben:
   Projekt nach ```dom.scrollIntoView()``` durchsuchen und durch
   ```dom.scrollIntoView({ scrollParentsTo: true })``` ersetzen.

### kijs.Dom
 - Neue statische Funktion ```scrollIntoView(node, options)```

### kijs.gui.MsgBox
 - config-Argumente der statischen Funktion ```kijs.gui.MsgBox.show(config)```
   geändert:
    - ```fieldConfig``` NEU! Objekt mit Eigenschaften für das Field
    - ```fieldXtype``` GELÖSCHT! Bitte fieldConfig -> ```xtype``` verwenden
    - ```label```  GELÖSCHT! Bitte fieldConfig -> ```label``` verwenden
    - ```value```  GELÖSCHT! Bitte fieldConfig -> ```value``` verwenden
    - ```required```  GELÖSCHT! Bitte fieldConfig -> ```required``` verwenden
    - ```facadeFnArgs```  GELÖSCHT! Bitte fieldConfig -> ```rpcLoadArgs``` verwenden

   **UPDATE TIPP:** Projekt nach ```kijs.gui.MsgBox.show(``` durchsuchen, und die
   Argumente anpassen.

### kijs.gui.FormPanel
 - Property in RPC Antwort von load() umbenannt.
   alt: ```responseData.form = [...]```
   neu: ```responseData.config.elements = [...]```
   Damit ist load() kompatibel mit load() der Basisklasse kijs.gui.Element.
   Neu können damit neben den elements auch andere configs gesendet werden.

   **UPDATE TIPP:** PHP nach ```form``` durchsuchen und ersetzen durch
   ```config.elements```.

### kijs.gui.field.Display
 - Neue config/getter/setter ```valueDisplayType```
   Darstellung der Eigenschaft ```value```  (Default='code')
   Mögliche Werte:
    - ```html```: als html-Inhalt (innerHtml)
    - ```code```: Tags werden als Text angezeigt
    - ```text```: Tags werden entfernt
 - Vorgefertigte Formatierungen mit CSS-Klassen:
    - ```kijs-title``` Text wird fett dargestellt
    - ```kijs-help```  Text wird blau dargestellt
    - ```kijs-error```  Text wird rot dargestellt
   (es können auch Klassen kombiniert werden: ```cls: ['kijs-title', 'kijs-error']```

### kijs.gui.Icon
 - Neuer getter ```iconMapName```. Falls an die config/setter ```iconMap``` ein
   String übergeben wurde, kann mit ```iconMapName``` dieser wieder abgerufen
   werden. Sonst wird ```null``` zurückgegeben.

### kijs.gui.container.Tab
 - Bietet neu die Möglichkeit Tabs per Drag&Drop zu verschieben. Falls mehrere
   Tab-Elemente den gleichen ddName haben können auch Tabs auf ein anderes
   Tab-Element gezeogen werden.
 - Neue config/getter/setter:
    - ```tabBarAlign``` Ausrichtung der Tabs 'start' (default), 'end' oder 'center'
    - ```rpcSaveFn```
    - ```rpcSaveArgs```
    - ```autoSave``` Automatisches Speichern bei Drag&Drop oder dem Schliessen
                     Tabs. Boolean, default: false
    - ```sortable``` Richtet Drag&Drop ein, so dass die Tabs verschoben werden
                     können. Boolean, default: false

    - ```ddName```   Siehe Leitfaden 'Drag & Drop'. Falls kein ddName angegeben
                     wird, wird automatisch eineindeutiger Name vergeben.
    - ```ddPosBeforeAfterFactor``` Siehe Leitfaden 'Drag & Drop'
    - ```ddMapping``` Siehe Leitfaden 'Drag & Drop'

### kijs.gui.Dashboard (NEU)
Siehe Beispiel im Showcase.

### kijs.gui.field.ChekboxGroup
Funktion checkedValues() ist nun DEPRECATED

### kijs.gui.Separator (NEU)
Einfaches Element um Trennlinien in Toolbars oder Formularen einzufügen.

### CSS Anpassungen
 - Foglender globaler CSS-Code entfernt und direkt bei den Elementen eingefügt, wo
   nötig:

    .kijs div, .kijs-viewport, .kijs-viewport div {
        overflow: hidden;
        margin: 0;
        padding: 0;
    }

 - ```lineHeight``` von 13px auf 14px erhöht. Damit werden nun Buchstaben unten
   nicht mehr abgeschnitten. **UPDATE TIPP:** Bei eigenen CSS-Templates evtl.
   auch anpassen.

 - Die Bestandteile des kijs.gui.Button sind neu durch einen ```gap: 4px``` getrennt.

 - verschiedene weitere kleinere CSS-Anpassungen.

### kijs.gui.DataView
 - Unterstützt neu Drag&Drop
 - Neue config/getter/setter
    - ```rpcSaveFn```
    - ```rpcSaveArgs```
    - ```autoSave``` Automatisches Speichern bei Drag&Drop oder dem Schliessen
                     Tabs. Boolean, default: false
    - ```sortable``` Richtet Drag&Drop ein, so dass die Tabs verschoben werden
                     können. Boolean, default: false

    - ```ddName```   Siehe Leitfaden 'Drag & Drop'. Falls kein ddName angegeben
                     wird, wird automatisch eineindeutiger Name vergeben.
    - ```ddPosBeforeFactor``` Siehe Leitfaden 'Drag & Drop'
    - ```ddPosAfterFactor``` Siehe Leitfaden 'Drag & Drop'
    - ```ddMapping``` Siehe Leitfaden 'Drag & Drop'

### kijs.gui.dataView.Element
 - ```kijs.gui.DataViewElement``` umenannt zu ```kijs.gui.dataView.Element```
   **UPDATE TIPP:**
     - Projekt nach ```kijs.gui.DataViewElement``` duchsuchen und durch
       ```kijs.gui.dataView.Element``` ersetzen.
     - CSS nach ```kijs-dataviewelement``` durchsuchen und durch
       ```kijs-dataview-element``` ersetzen.

### kijs.gui.ListView
 - Unterstützt das neue Drag&Drop, Siehe dazu die Änderungen bei ```kijs.gui.DataView```
   (Basisklasse).
   **UPDATE TIPP:** Projekt nach ```ddSort``` durchsuchen, und durch ```sortable```
   ersetzen.

### kijs.gui.field.ListView, kijs.gui.field.CheckboxGroup, kijs.gui.field.OptionGroup
 - Unterstützt das neue Drag&Drop.
   **UPDATE TIPP:** Projekt nach ```ddSort``` durchsuchen, und durch ```sortable```
   ersetzen.

### kijs.gui.Tree
Unterstützt vorerst kein Drag&Drop mehr.
Der kijs.gui.Tree wird noch komplett überarbeitet. Dann wird auch das neue Drag&Drop
eingebaut.

### kijs.gui.Menu
 - Verwendet nun auch den ```kijs.gui.Separator``` für Trennlinien.
 - Als Element kann nun kein einfacher String mit einem Text mehr übergeben werden.
   Es muss ein Objekt sein.
   **UPDATE TIPP:** Projekt nach ```kijs.gui.Menu``` durchsuchen, und als String
   definierte Elemente in Objekte umwandeln:
   ```'Mein Menüpunkt'``` ==> ```{ caption: 'Text' }```
 - Als String werden nur noch Trennzeichen (kijs.gui.Separator) '-' unterstützt.



Version 2.2.3
=============
### kijs.gui.Resizer
Neue config/getter/setter:
 - allowResizeWidth (Boolean, Default=true)
 - allowResizeHeight (Boolean, Default=true)

### kijs.gui.Panel
Neue config/getter/setter:
Damit kann eingestellt werden, dass nur die Höhe oder die Breite verändert werden kann.
 - resizableWidth (Boolean, Default=false)
 - resizableHeight (Boolean, Default=false)


### kijs.gui.Window
Fenster haben neu runde Ecken.



Version 2.2.2
===============
### kijs.gui.field.*
 - Alle fields haben jetzt ein input-Event. Dieses kommt während der Eingabe und
   auch bei jeder Änderung (z.B. beim Wählen eines Werts aus der Liste eines Combos)

### kijs.gui.FormPanel
 - Fields mit ```disabled=true``` werden neu bei ```save()```auch übermittelt.
 - neue Methode ```valuesReset()```. Setzt die Felder auf den Usprungswert zurück.

### kijs.Rpc und kijs.gui.Rpc
Wird ein Request bei cancelRunningRpcs=true durch einen neueren Request abgebrochen,
neu die callbackFn und auch das resolve des Promise ausgeführt. Der errorType ist
'cancel'.



Version 2.2.1
===============
### kijs.gui.field.*
 - Methode ```resetErrors()``` umbenannt zu ```errorsReset()```
 - ```isDirty``` wird vom ```value```-setter nicht zurückgesetzt
 - Dem ```isDirty``` setter kann nur noch false übergeben werden

### kijs.Rpc und kijs.gui.Rpc
 - Die callback-fn und das Promise werden nun immer ausgeführt. Selbst, wenn der
   Server keine Antwort gibt oder ein Fehler auftritt.

   ```catch()``` wird nie mehr aufgerufen.

   In der callback-fn oder im then() muss deshalb kontrolliert werden, ob ein Fehler
   aufgetreten ist:

        if (kijs.isEmpty(e.errorType)) {
            ...
        }

### kijs.gui.FormPanel
 - config ```errorMsg``` umbenannt nach ```defaultSaveErrorMsg```
 - Das Event ```afterLoad``` wird nun immer ausgeführt. Auch wenn ein Fehler aufgetreten ist.
 - Bei der Funktion ```load()``` gibt es kein catch() mehr. Es wird nun immer
   ```resolve()``` ausgeführt.
 - Das Event ```afterSave``` wird nun immer ausgeführt. Auch wenn ein Fehler aufgetreten ist.
 - Bei der Funktion ```save()``` gibt es kein catch() mehr. Es wird nun immer
   ```resolve()``` ausgeführt.



Version 2.1.2
===============
 - Neues Theme "Retro"
 - Kleinere Fehlerbehebungen
 - Kleinere CSS Anpassungen
 - kijs.gui.grid.Grid: Zusätzliche Vergleichsfunktionen bei Textfeldern in Filterzeile
 - Die Theme-Datei ```kijs.theme.default.css``` ist nun nicht mehr in der ```files.json```
   **Achtung!** Die gewünschte Theme-Datei muss nun direkt in die index.php eingebunden
   werden!



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

### globale RPC-Instanzen
Damit nicht in jedem Element, dass ein RPC-Objekt benutzt eine Instanz von einem
```kijs.gui.Rpc``` übergeben werden muss und es bisher auch nicht möglich war via
RPC einem Element eine RPC-Instanz zuzuweisen, können nun ```kijs.gui.Rpc```-Objekte
global mit einem Namen definiert werden.
Bei allen Elementen kann anstelle einer ```kijs.gui.Rpc```-Instanz auch nur der
Name der globalen Instanz übergeben werden. Wird gar nichts angegeben, wird
standardmässig die globale Instanz ```'default'``` verwendet.
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

### Listeners und callbackFn können nun alle per String übergeben werden.
Dadurch können via RPC Funktionen oder Verweise auf Funktionen übermittelt werden.
Auch der Kontext zu einer Funktion kann per String übergeben werden.
Siehe dazu auch den Leitfaden "Ereignisse" im Kapitel "on(names, callback, context)"

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
   ```openEmailPhoneLink(href)``` oder ```window.open(href, target)``` benutzen.

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
   Mapping:
   1. facadeFn
   2. requestData
   3. fn
   4. context
   5. cancelRunningRpcs
   6. rpcParams
   7. responseArgs

 - Es gibt eine neues config-Property ```owner```. Diesem kann in der Regel ```this```
   übergeben werden. Es wird verwendet um bei cancelRunningRpcs den owner zu unterscheiden.
 - Die callbackFn fn hat neu nur noch ein Argument ```e```. Inhalt: ```{ response: ..., request: ... }```
 - Falls config.fn übergeben wurde wird immer diese fn ausgeführt (auch im Fehlerfall).
   Dann wird auch kein Promise, sondern Null zurückgegeben.
 - Wird **keine** fn übergeben, so wird ein Promise zurückgegeben. Im Fehlerfall wird
   unterschieden zwischen ```errorType```:
   - ```'errorNotice'``` (default): Es wird resolve ausgeführt.
     Die errorMsg befindet sich dann unter ```e.response.errorMsg```.
   - ```'error'```: Es wird reject ausgeführt mit einem Error Objekt als Argument.

### kijs.gui.Rpc
 - Die Funktion ```do(config)``` hat neu nur noch ein Argument ```config```. **ACHTUNG!!!**
   Mapping:
   1. facadeFn
   2. data
   3. fn
   4. context
   5. cancelRunningRpcs
   6. waitMaskTarget
   7. waitMaskTargetDomProperty
   8. ignoreWarnings

 - Es gibt eine neues config-Property ```owner```. Diesem kann in der Regel ```this```
   übergeben werden. Es wird verwendet um bei cancelRunningRpcs den owner zu unterscheiden.
 - Die ```callbackFn``` hat neu ein anderes Argument! **ACHTUNG!!!**
   Bisher: ```responseData```
   Neu: ```e```. Inhalt: ```{ responseData: ..., requestData: ..., errorType: ..., errorMsg: ... }```
 - Die ```callbackFn``` wird nun immer ausgeführt! Auch in einem Fehlerfall! **ACHTUNG!!!**
   Um den gleichen Effekt wie früher zu haben muss der Inhalt der CallbackFn in ein

        if (kijs.isEmpty(e.errorType)) {
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

### kijs.gui.field.Phone
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
