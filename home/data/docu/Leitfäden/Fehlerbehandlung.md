Fehlerbehandlung
==================

Es wird zwischen zwei Fehlertypen (errorType) unterschieden
-----------------------------------------------------------
- ```errorNotice```  
  Benutzerfehler, der für uns Entwickler NICHT wichtig ist und deshalb auch nicht 
  geloggt werden muss.  
  z.B. wenn ein Pflichtfeld nicht ausgefüllt wurde.  
  errorNotice-Meldungen haben als Icon ein rotes Dreieck mit Ausrufezeichen.

- ```error```  
  Unerwarteter Fehler, der für uns Entwickler wichtig ist und deshalb in der regel 
  geloggt wird.  
  error-Meldungen haben als Icon einen roten Kreis mit Ausrufezeichen.  

Beispiel Fehlerbehandlung in PHP
--------------------------------
    try {
        throw new ki_Exception_Notice('Fehler, aber nicht tragisch.');
        throw new Exception('Fehler! Schrecklich!!!');
    } catch (Exception $ex) {
        $response->errorMsg = $ex->getMessage();
        $response->errorType = $ex instanceof ki_Exception_Notice ? 'errorNotice' : 'error';
        //$response->errorTitle = 'Mein eigener Fehlertitel'; // optional
    }

Damit in PHP ki_Exception_Notice geworfen werden kann muss folgende Klasse in 
PHP deklariert sein:  
    ```class ki_Exception_Notice extends Exception {}```
