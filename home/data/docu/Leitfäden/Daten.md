Daten
=====================

Die Klasse ```kijs.Data``` enthält einige statische Funktionen, die den Umgang mit 
Daten erleichtern. Diese sind hier Dokumentiert.  

Namensgebungen/Konventionen
---------------------------
### data oder recordset
Array mit mehreren Datensätzen ```rows```.  
Beispiel:

    [
     { "addressId":1, "name":"Max", "vorname":"Muster" },
     { "addressId":2, "name":"Vreni", "vorname":"Muster" },
     { "addressId":3, "name":"Kurtli", "vorname":"Mustermann" }
    ]

### row
Beinhaltet einen Datensatz.  
Beispiel:

    { "addressId":1, "name":"Max", "vorname":"Muster" }

### primaryKey
Beinhaltet einen String mit einem Primärschlüssel eines Datensatzes.
Beispiel:

    "1"

Siehe dazu auch weiter unten ```Identifizieren von Datensätzen```->```Primärschlüssel```.  

### primaryKeyFields
Beinhaltet ein Array mit den Feldnamen aus denen der Primärschlüssel zusammengesetzt 
ist.  
Beispiel:  

    ["name","vorname"]


Filtern
-------
Um Daten in einem Recordset zu filtern, werden folgende Funktionen zur verfügung 
gestellt:  
 - ```getRowByPrimaryKey(rows, primaryKey, primaryKeyFields)```  
   Gibt den Datensatz zurück, der dem primaryKey entspricht.  

 - ```filterByPrimaryKeys(rows, primaryKeys, primaryKeyFields)```  
   Gibt die Datensätze zurück, die den primaryKeys entsprechen.  

 - ```filter(rows, filters)```  
   Filtert ein Recordset und gibt die Datensätze zurück, die durch den Filter passen.  

 - ```rowMatchFilters(row, filters)```
   Überprüft, ob ein einzelner Datensatz (row) einem Filter entspricht.  

 - ```search(rows, filters)```  
   Filtert ein Recordset und gibt die Indexe der Datensätze zurück, die durch den Filter passen.  

### Aufbau eines Filters
Beispiel:

    "filters":{
     "operator":"AND",
     "parts":[
      { "field":"Name", "operator":"=", "value":"Muster" }
      { "field":"Vorname", "operator":"=", "value":"Max" },
      { "field":"Anrede", "operator":"IN", "value":["Herr","Frau"] },
      {
       "operator":"OR",
       "parts":[
        { "field":"Kanton", "operator":"=", "value":"BE" },
        { "field":"Kanton", "operator":"=", "value":"SO" }
       ]
      }
     ]
    }

Filter sind aus ```parts``` aufgebaut. Es gibt zwei verschiedene Arten von ```parts```,  
Klammern und Vergleichsoperationen:

#### Klammern
Klammern werden verwendet um parts zu gruppieren und mit AND oder OR zu verknüpfen.
    {
     "operator":"AND",  Logischer Operator: "AND", "OR" default: "AND"
     "parts":[ ... ]    Array mit untergeordneten Parts.
    }

#### Vergleichsoperationen
Eine Vergleichsoperation wird zum Vergleichen der Zelle im Recordset mit
einem vorgegebenen Wert benutzt.

    {
     "field":"Vorname",  Feldname
     "operator":"=",     Vergleichsoperator: default: bei einem Array als value "IN", sonst 
                         "MATCH"

                         "=", "!=",

                         ">", ">=", "<", "<=",

                         "BEGIN",               der Anfang muss übereinstimmen (CI)
                         "PART",                ein beliebiger Teil muss übereinstimmen (CI)
                         "END",                 das Ende muss übereinstimmen (CI)
                         "MATCH",               Wert muss übereinstimmen (CI)
                         "NOT",                 Wert darf nicht übereinstimmen (CI)

                         "IN", "NOT IN",        Der Wert muss im Array vorkommen.
                                                Value muss ein Array sein.

                         "LIKE", NOT LIKE",     Im value können wie in SQL
                                                % und _ als Platzhalter
                                                verwendet werden. (CI)

                         "REGEXP", "NOT REGEXP" Der value muss ein RegExp
                                                (oder RegExp als String) sein
                                                Beispiel: '/^[0-9A-Z]{3,4}$/gmi'

                                                (CI) = case-insensitive = Gross 
                                                und Kleinschreibung muss nicht 
                                                übereinstimmen

                         Default: Wenn value ein Array ist: "IN" sonst "="

     "value":"Max"       beliebiger Datentyp mit dem verglichen wird.
    }


Sortieren
---------
Um Daten in einem Recordset zu sortieren, wird die Funktion sort zur Verfügung gestellt:  
```sort(rows, sortFields, clone=true)```

### Argumente
 - ```rows```       Recordset das sortiert werden soll (Array)
 - ```sortFields``` Array mit der Sortierungskonfiguration (Array)
 - ```clone```      Soll das original rows-Array unverändert bleiben (true, false. Default=true)

Beispiel für eine sortFields-Konfiguration:

    [
     { "field":"Alter", "desc":true },  // Absteigend nach Alter
     { "field":"Ort", "desc":false },   // Aufsteigend nach Ort
     { "field":"Name" },                // Aufsteigend nach Name
     "Vorname"                          // Aufsteigend nach Vorname (Kurzschreibweise)
    ]


Identifizieren von Datensätzen
------------------------------
Es gibt verschiedene Ansätze um Datensätze in einem Recordset zu identifizieren:
 - ```primaryKey```: Die Datensätze werden über den Primärschlüssel angesprochen
 - ```dataRows```: Die Datensätze werden via Verweis auf die Datenzeile (row) identifiziert
 - ```index```: Die Datensätze werden über den Index 0 bis ... angesprochen

Die Ansätze haben Vor- und Nachteile:

| Art        | Vorteile           | Nachteile |
|------------|--------------------|-----------|
| primaryKey | beste Lösung       | es muss ein Primärschlüssel definiert werden |
| dataRow    | einfach            | nach dem neu Laden via RPC stimmen die Verweise nicht mehr. Siehe dazu die Funktion ```kijs.Data.updateRowsReferences()``` |
| index      | schnell            | funktioniert nicht mehr, wenn Zeilen eingefügt oder gelöscht wurden oder anders sortiert wurde |

### Primärschlüssel
Primärschlüssel bestehen aus einem String, der den Primärschlüssel des Datensatzes 
enthält.  
Beispiel: ```"Muster"```  

Falls der Primärschlüssel über mehrere Felder geht, werden die Inhalte der 
betroffenen Felder zusammengesetzt. Getrennt werden sie duch eine definierte 
Zeichenkette, den ```primaryKeyDelimiter```. Dieser ist Standardmässig  
```"#|[kijs]|#"```.  
Beispiel: ```"Muster#|[kijs]|#Max"```  

### Erstellen eines Primärschlüssel-Strings
Dafür kann die Funktion ```kijs.Data.getPrimaryKeyString(row, primaryKeyFields)``` 
verwendet werden.  


Rekursive Datensätze
--------------------
kijs unterstützt auch rekursive Datensätze. Z.B. für ```kijs.gui.Tree```.  
Bei den Funktionen in ```kijs.Data``` kann dafür das optionale Argument ```childsField``` 
angegeben werden. Es enthält den Feldnamen des Felds, dass das Recordset der Kinder 
enthält.  

Beispiel für ein Recordset mit ```childsField = 'kinder'```:  

    [
     {
      "addressId":1,
      "name":"Max",
      "vorname":"Mustermann",
      "kinder":[
       {
        "addressId":2,
        "name":"Hansli",
        "vorname":"Mustermann",
        "kinder":[]
       },{
        "addressId":3,
        "name":"Susi",
        "vorname":"Mustermann",
        "kinder":[]
       }
      ]
     }
    ]
