Erste Schritte mit kijs
=======================

Willkommen bei kijs! Diese Seite zeigt, wie du am besten einsteigst und in welcher 
Reihenfolge du die Leitfäden lesen kannst.  


Was ist kijs?
-------------
kijs ist ein JavaScript-Framework für Web-Applikationen mit einer grafischen 
Benutzeroberfläche, wie man sie von Desktop-Programmen kennt: Fenster, Panels, 
Formulare, Grids, Bäume, Menüs ...  

Es besteht aus zwei Teilen:  

| Teil     | Ordner        | Inhalt                                                     |
|----------|---------------|------------------------------------------------------------|
| **Core** | ```js/```     | Hilfsklassen ohne GUI: ```kijs.Array```, ```kijs.Date```, ```kijs.Observable```, ```kijs.Rpc``` ... |
| **GUI**  | ```js/gui/``` | Die Komponenten: ```kijs.gui.Button```, ```kijs.gui.Panel```, ```kijs.gui.field.Text``` ... |

Das Wichtigste in drei Sätzen:  
- Jede Komponente wird mit einem **Config-Objekt** erstellt: ```new kijs.gui.Button({ caption: 'OK' })```.  
- Komponenten werden zu einem **Baum** zusammengesetzt. Kind-Elemente können statt 
  als Instanz auch als Config mit ```xtype``` angegeben werden.  
- Komponenten kommunizieren über **Ereignisse**: ```button.on('click', ...)```.  


1\. Die Home-App kennenlernen
-----------------------------
Die Home-App (diese Seite) ist der beste Ort zum Ausprobieren. Links in der 
Navigation gibt es vier Bereiche:  

| Icon | Bereich       | Inhalt                                                   |
|------|---------------|----------------------------------------------------------|
| Auge | **Showcase**  | Jede Komponente mit vielen Beispielen                    |
| Code | **Tests**     | Spezielle Testfälle                                      |
| Buch | **Doku**      | Diese Dokumentation und die Leitfäden                    |
| Würfel | **API**     | Alle Klassen mit Configs, Getter/Setter, Funktionen und Events, dazu der Lückenbericht |

Oben rechts sucht das Suchfeld (Enter) gleichzeitig in API, Leitfäden, Showcase 
und Tests.  

**Tipp:** Rechts in jedem Tab lässt sich das Panel **Source-Code** aufklappen. Dort 
kannst du den Code des Beispiels ändern und mit dem Play-Button sofort ausführen. 
Mit dem Pfeil-Button wird der ursprüngliche Code wiederhergestellt.  

Schau dir zuerst im Showcase diese Komponenten an:  
- [Button](../showcase/Button.js)  
- [Panel](../showcase/Panel.js)  
- [Container](../showcase/Container.js)  
- [Window](../showcase/Window.js)  
- [MsgBox](../showcase/MsgBox.js)  
- [field.Text](../showcase/field/field_Text.js)  
- [container.Form](../showcase/container/container_Form.js)  

Die meisten Leitfäden haben am Schluss einen Abschnitt **Beispiele** mit Links auf 
passende Showcase- und Test-Seiten.  


2\. Die erste eigene Seite
--------------------------
Eine minimale Applikation ist eine einfache HTML-Datei, es braucht kein PHP. Sie 
zeigt ein Panel mit einem Textfeld und einer Schaltfläche. Die Pfade gehen davon 
aus, dass kijs auf dem Webserver im Ordner ```/kijs``` liegt.  

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Hallo kijs</title>

    <!-- Reihenfolge der CSS-Ebenen: App überschreibt Theme, Theme überschreibt kijs -->
    <style>
        @layer kijs, kijs-theme, app;
    </style>

    <!-- CSS -->
    <link rel="stylesheet" href="/kijs/css/kijs.theme.default.css">
    <link rel="stylesheet" href="/kijs/css/kijs.gui.css">

    <!-- kijs Core -->
    <script src="/kijs/js/kijs.js"></script>
    <script src="/kijs/js/kijs.Error.js"></script>
    <script src="/kijs/js/kijs.String.js"></script>
    <script src="/kijs/js/kijs.Array.js"></script>
    <script src="/kijs/js/kijs.Object.js"></script>
    <script src="/kijs/js/kijs.Dom.js"></script>
    <script src="/kijs/js/kijs.Graphic.js"></script>
    <script src="/kijs/js/kijs.Navigator.js"></script>
    <script src="/kijs/js/kijs.Observable.js"></script>
    <script src="/kijs/js/kijs.Ajax.js"></script>
    <script src="/kijs/js/kijs.Rpc.js"></script>

    <!-- Icons -->
    <script src="/kijs/js/iconMap/kijs.iconMap.js"></script>
    <script src="/kijs/js/iconMap/kijs.iconMap.Fa.js"></script>

    <!-- kijs GUI -->
    <script src="/kijs/js/gui/kijs.gui.js"></script>
    <script src="/kijs/js/gui/kijs.gui.DragDrop.js"></script>
    <script src="/kijs/js/gui/dragDrop/kijs.gui.dragDrop.js"></script>
    <script src="/kijs/js/gui/dragDrop/kijs.gui.dragDrop.Source.js"></script>
    <script src="/kijs/js/gui/kijs.gui.Dom.js"></script>
    <script src="/kijs/js/gui/kijs.gui.Tooltip.js"></script>
    <script src="/kijs/js/gui/kijs.gui.Element.js"></script>
    <script src="/kijs/js/gui/kijs.gui.Container.js"></script>
    <script src="/kijs/js/gui/kijs.gui.Separator.js"></script>
    <script src="/kijs/js/gui/kijs.gui.Spacer.js"></script>
    <script src="/kijs/js/gui/container/kijs.gui.container.js"></script>
    <script src="/kijs/js/gui/container/kijs.gui.container.Scrollable.js"></script>
    <script src="/kijs/js/gui/kijs.gui.SpinBox.js"></script>
    <script src="/kijs/js/gui/kijs.gui.ViewPort.js"></script>
    <script src="/kijs/js/gui/kijs.gui.Icon.js"></script>
    <script src="/kijs/js/gui/kijs.gui.Button.js"></script>
    <script src="/kijs/js/gui/kijs.gui.Menu.js"></script>
    <script src="/kijs/js/gui/kijs.gui.PanelBar.js"></script>
    <script src="/kijs/js/gui/kijs.gui.Resizer.js"></script>
    <script src="/kijs/js/gui/kijs.gui.Panel.js"></script>
    <script src="/kijs/js/gui/kijs.gui.Mask.js"></script>
    <script src="/kijs/js/gui/kijs.gui.LayerManager.js"></script>
    <script src="/kijs/js/gui/kijs.gui.Window.js"></script>
    <script src="/kijs/js/gui/kijs.gui.MsgBox.js"></script>
    <script src="/kijs/js/gui/kijs.gui.CornerTipContainer.js"></script>
    <script src="/kijs/js/gui/kijs.gui.Rpc.js"></script>
    <script src="/kijs/js/gui/field/kijs.gui.field.js"></script>
    <script src="/kijs/js/gui/field/kijs.gui.field.Field.js"></script>
    <script src="/kijs/js/gui/field/kijs.gui.field.Text.js"></script>

    <!-- Applikation -->
    <script>
        kijs.isReady(function() {
            const viewport = new kijs.gui.ViewPort({
                cls: 'kijs-flexfit',
                elements: [
                    {
                        xtype: 'kijs.gui.Panel',
                        caption: 'Hallo kijs',
                        cls: 'kijs-flexform',
                        innerStyle: { padding: '10px' },
                        elements: [
                            {
                                xtype: 'kijs.gui.field.Text',
                                name: 'name',
                                label: 'Name'
                            },{
                                xtype: 'kijs.gui.Button',
                                caption: 'Begrüssen',
                                on: {
                                    click: function(e) {
                                        const name = viewport.down('name').value;
                                        kijs.gui.MsgBox.alert('Hallo', 'Hallo ' + name + '!');
                                    }
                                }
                            }
                        ]
                    }
                ]
            });
            viewport.render();
        });
    </script>
</head>
<body>
</body>
</html>
```

Was hier passiert:  
- ```@layer``` legt die Reihenfolge der CSS-Ebenen fest: Das CSS der Applikation 
  (```app```) überschreibt das Theme, das Theme überschreibt kijs.  
- **CSS:** Es braucht ein Theme (```kijs.theme.default.css```) und das CSS von 
  kijs (```kijs.gui.css```). Die Schriften werden von dort automatisch geladen.  
- **JavaScript:** Eingebunden sind nur die 42 Dateien, die dieses Beispiel 
  braucht (von insgesamt 98 in den Modulen core und gui). Die Reihenfolge ist 
  wichtig: Eine Datei muss immer nach den Dateien kommen, von denen sie abhängt. 
  Die Reihenfolge in ```files.json``` ist dafür die Vorlage.  
- ```kijs.isReady()``` wartet, bis das HTML geladen ist.  
- Der ```kijs.gui.ViewPort``` ist das oberste Element und füllt das ganze 
  Browserfenster. Er muss als einziges Element selbst gerendert werden.  
- Mit ```name``` und ```down()``` wird ein Element im Baum gefunden.  

### Weitere Komponenten verwenden
Werden weitere Komponenten verwendet, müssen auch deren Dateien eingebunden 
werden, inklusive aller Dateien, von denen sie abhängen. Fehlt eine Datei, zeigt 
die Browser-Konsole z.B. ```Unknown xtype "kijs.gui.field.Combo"``` oder 
```Cannot read properties of undefined```.  

Am einfachsten ist es, alle Dateien der benötigten Module aus ```files.json``` 
einzubinden (```core```, ```gui``` und bei Bedarf ```grid```, ```aceEditor```, 
```quillEditor```, ```translations``` für andere Sprachen als Deutsch). Mit PHP 
kann ```tools/getDebugHead.php``` die ```<script>```-Tags dafür automatisch 
erzeugen, so wie es die Home-App in ```home/index.php``` macht:  

```php
<?php
    echo file_get_contents('http://localhost/kijs/tools/getDebugHead.php?modules=core,gui&fileType=js');
?>
```

Grössere Applikationen bestehen aus eigenen Klassen (z.B. ```myApp.App```), so wie 
die Home-App in ```home/app/home.App.js```.  


3\. Die Leitfäden lesen
-----------------------
Die Leitfäden sind in vier Stufen gegliedert. Stufe A und B solltest du der Reihe 
nach lesen, C und D bei Bedarf.  

### A. Grundlagen: So wird in kijs programmiert
Diese Regeln gelten für jeden Code, auch für den Code deiner Applikation.  

| # | Leitfaden | Worum geht es? |
|---|-----------|----------------|
| 1 | [Namensgebung](Leitfäden/Namensgebung.md) | Namen von Variablen, Funktionen, Klassen; public/protected/private |
| 2 | [Aufbau einer Klasse](Leitfäden/Aufbau_einer_Klasse.md) | Gliederung und Reihenfolge innerhalb einer Klasse |
| 3 | [Kapselung](Leitfäden/Kapselung.md) | Wer darf auf wen zugreifen? |
| 4 | [Kommentare](Leitfäden/Kommentare.md) | Was wird wo dokumentiert? |
| 5 | [Ereignisse](Leitfäden/Ereignisse.md) | ```on()```, ```raiseEvent()```, ```before...```-Events |

### B. Das GUI verstehen und verwenden

| # | Leitfaden | Worum geht es? |
|---|-----------|----------------|
| 6 | [Element, Dom und Container](Leitfäden/Element_Dom_und_Container.md) | Die drei Grundklassen, ```elements```, ```xtype```, ```down()``` |
| 7 | [Config-System](Leitfäden/Config-System.md) | Wie Config-Objekte funktionieren, ```defaults```. Für die Verwendung reicht der Anfang, der Rest ist für Stufe C |
| 8 | [Layout](Leitfäden/Layout.md) | CSS-Klassen wie ```kijs-flexrow``` und ```kijs-flexform``` |
| 9 | [Disabled und ReadOnly](Leitfäden/Disabled_und_ReadOnly.md) | Unterschied und Weitergabe an Kind-Elemente |
| 10 | [Ajax und RPC](Leitfäden/Ajax_und_RPC.md) | Kommunikation mit dem Server |
| 11 | [Fehlerbehandlung](Leitfäden/Fehlerbehandlung.md) | ```error``` und ```errorNotice``` |

### C. Eigene Komponenten entwickeln
Wenn du eigene Komponenten schreiben oder kijs selbst erweitern willst.  

| # | Leitfaden | Worum geht es? |
|---|-----------|----------------|
| 12 | [Config-System](Leitfäden/Config-System.md) | Diesmal ganz: ```_configMap```, ```prio```, ```applyConfig()``` |
| 13 | [Lebenszyklus](Leitfäden/Lebenszyklus.md) | ```render```, ```unrender```, ```destruct``` und ```superCall``` |
| 14 | [Tutorial Eigene Komponente](Leitfäden/Tutorial_Eigene_Komponente.md) | Alles zusammen an einem Beispiel, Schritt für Schritt |

### D. Nachschlagen bei Bedarf

| Leitfaden | Worum geht es? |
|-----------|----------------|
| [Formatierung von Formularfeldern](Leitfäden/Formulare/Formatierung_von_Formularfeldern.md) | ```formatRegExp```, ```formatFn``` |
| [Validierung von Formularfeldern](Leitfäden/Formulare/Validierung_von_Formularfeldern.md) | ```required```, ```validationFn``` ... |
| [isDirty](Leitfäden/Formulare/isDirty.md) | Wurde ein Feld geändert? |
| [Combo](Leitfäden/Felder/Combo.md) | Lokale und Remote-Daten in einer Combo |
| [Daten](Leitfäden/Daten.md) | Recordsets, Primärschlüssel, Filtern, Sortieren |
| [Drag and Drop](Leitfäden/Drag_and_Drop.md) | Elemente ziehen und ablegen |
| [Mehrsprachigkeit](Leitfäden/Mehrsprachigkeit.md) | ```kijs.getText()``` und Übersetzungen |
| [Schriften](Leitfäden/Schriften.md) | Schriftgrössen und -arten |


4\. Wo finde ich was?
---------------------
| Frage                                      | Antwort                                        |
|--------------------------------------------|------------------------------------------------|
| Welche Config-Eigenschaften hat Klasse X?  | Im Tab **API** auf der Seite der Klasse, z.B. [kijs.gui.Button](api:kijs.gui.Button). Die Doku stammt aus den Kommentaren im Code (siehe Leitfaden [Kommentare](Leitfäden/Kommentare.md)) |
| Wie sieht Komponente X aus, wie verwende ich sie? | Im Showcase, mit Quellcode            |
| Was hat sich in einer Version geändert?    | [History](History.md)                          |
| In welchen Dateien steckt ein Modul?       | ```files.json``` im Hauptordner von kijs       |


5\. Typische Stolpersteine
--------------------------
| Fehlermeldung / Problem             | Ursache                                                 |
|-------------------------------------|---------------------------------------------------------|
| ```Unknown config "xy"```           | Tippfehler im Namen einer Config-Eigenschaft oder die Klasse kennt sie nicht |
| ```config missing "xtype"```        | Ein Config-Objekt in ```elements``` hat kein ```xtype``` |
| ```Unknown xtype "xy"```            | Klassenname falsch geschrieben oder die Datei ist nicht geladen |
| Element wird nicht angezeigt        | Es wurde keinem Container hinzugefügt bzw. das oberste Element (ViewPort, Window) wurde nicht gerendert bzw. angezeigt |
| ```down('xy')``` gibt ```null``` zurück | Das Element hat keinen ```name``` oder liegt nicht unterhalb dieses Containers |
| Ein Listener wird nie aufgerufen    | Falscher Event-Name. kijs-Events sind camelCase: ```dblClick```, nicht ```dblclick``` |
