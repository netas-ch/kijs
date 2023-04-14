isDirty
=======
Der boolsche getter/setter ```isDirty``` gibt an, ob der Inhalt eines Formularfeldes 
durch den Benutzer verändert wurde.  
 - ```true```: es wurde etwas verändert  
 - ```false```: es wurde nichts verändert  

```isDirty``` wird bei folgenden Aktionen verändert:  
 - Beim ```change``` Event, wenn der neue Wert anders als der Alte ist. ```isDirty``` 
   wird auf ```true``` gesetzt.  
 - Beim setzen eines neuen Werts via setter ```value``` oder ```values```. ```isDirty``` 
   wird auf ```false``` gesetzt.  
 - Direktes setzen via setter ```ìsDirty```.  
