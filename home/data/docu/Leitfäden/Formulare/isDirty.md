isDirty
=======
Der boolsche getter/setter ```isDirty``` gibt an, ob der Inhalt eines Formularfeldes 
durch den Benutzer verändert wurde.  
 - ```true```: es wurde etwas verändert  
 - ```false```: es wurde nichts verändert  

**Hinweis:** Felder, mit ```disabled: true``` ist ```isDirty``` immer ```false```.  

```isDirty``` wird bei folgenden Aktionen verändert:  
 - Setzen der Feldwerte eines container.Form mittels ```data``` setter 
   (```isDirty``` wird auf false gesetzt).  
 - Erfolgreiches Ausführen der Funktion ```save()``` im kijs.gui.container.Form 
   (```isDirty``` wird auf false gesetzt).  
 - Direktes setzen via setter ```isDirty``` auf false. Dieser setter kann nicht 
   auf true gesetzt werden.  
   Ein Feld kann nur auf 'dirty' true gesetzt werden, indem der Wert verändert wird.  
