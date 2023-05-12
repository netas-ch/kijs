isDirty
=======
Der boolsche getter/setter ```isDirty``` gibt an, ob der Inhalt eines Formularfeldes 
durch den Benutzer verändert wurde.  
 - ```true```: es wurde etwas verändert  
 - ```false```: es wurde nichts verändert  

```isDirty``` wird bei folgenden Aktionen verändert:  
 - Setzen der Feldwerte eines FormPanel mittels ```data``` setter (```ìsDirty``` wird auf false gesetzt).
 - Erfolgreiches Ausführen der Funktion ```save()``` im kijs.gui.FormPanel (```ìsDirty``` wird auf false gesetzt).
 - Direktes setzen via setter ```ìsDirty```.
