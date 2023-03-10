Kapselung
===========
Um den Umgang mit Komplexität zu vereinfachen, werden komplexe Dinge gekapselt.  
In der Regel sind dies Klassen. Der Verwender einer Klasse muss nicht den ganzen 
Aufbau der Klasse verstehen, sondern kann nur ihre Schnittstellen (öffentliche 
Funktionen, Getter und Setter) verwenden.  
Dadurch wird die Komplexität stark vereinfacht.  

Im kijs gibt es mehrere Kapselungen, die eingehalten werden sollten.  


Klassen
-------
Es sollten nur Funktionen und Eigenschaften von Aussen verwendet werden, 
die dafür vorgesehen sind.  
Z.B. sollte nie auf eine Variable oder Funktion von aussen zugegriffen werden, 
deren Namen mit einem Unterstrich beginnt.  


Objekthierarchie
----------------
Grundsätzlich sollte nur auf untergeordnete Objekte zugegriffen werden.  
Dies sind in der Regel Instanzen von Klassen, die innerhalb der aktuellen 
Klassen erstellt werden.  
Auf den Zugriff von übergeordneten Objekten sollte verzichtet werden.  
Ein Listener ist hier meistens die richtige Lösung.  
Ausnahme: Oft macht es Sinn auf eine globale App-Instanz von überall her zugreifen 
zu können. Weil sie Funktionen enthält, die überall verwendet werden müssen.  


Modulhierarchie
---------------
Module in einem Projekt sollten auch eine definierte Hierarchie haben.  
Der Zugriff von einem Modul auf ein anderes sollte immer gut überlegt sein.  
Grundsätzlich sollte ein Projekt Basismodule bereitstellen, auf die von überall 
zugegriffen werden kann. Es sollte aber darauf geachtet werden, dass kein 
Wildwuchs entsteht.  


Hierarchie in kijs
------------------
Auch das kijs ist streng hierarchisch aufgebaut.  
Z.B. funktioniert der Core (Klassen direkt im js Ordner) auch ohne gui (Dateien 
im gui Ordner). Der Core verwendet das GUI nie, sondern das GUI verwendet den Core.  
