Schriften
=========

Einheit px
----------
Schriftgrössen sollten immer in px angegeben werden. Andere Einheiten machen für 
Webanwendungen wenig Sinn. Schriften werden bei anderen Einheiten als px nicht 
im gleichen Mass wie andere Inhalte skaliert. Dadurch geht das Layout kaput, 
dass bei kijs Pixelgenau aufgebaut ist.  
Menschen, die eine grössere Schriftgrösse benötigen, sollten die Möglichkeit haben 
das ganze Layout zu Zoomen (Ctrl+Mausrad). Damit werden die Schriften im gleichen 
Verhältnis wie die anderen Inhalte skaliert.  


Schriftgrössen
--------------
- ```11px``` grid, tree
- ```12px``` default (Buttons, Formularfelder, Labels, etc...)
- ```14px``` PanelHeader

Wichtig ist, dass verschiedene Schriftgrössen **nicht** gemischt werden.
**Ausnahmen:** 
 - Überschriften (wenn Fett nicht ausreicht)
 - Grid

### Vergleich Senche ExtJs 3.4.1
 - ```11px``` grid
 - ```12px``` Formularfelder, Labels

### Vergleich: Sencha Ext 7
 - ```13px``` Formularfelder, Labels, Grid
 - ```13.33px``` Buttons
 - ```14px``` Tree, Überschriften in Formularen


Schriftarten
------------
In kijs sind folgende Schriftarten eingebunden:
- Roboto (für Texte)
- Font Awesome (für Icons)
