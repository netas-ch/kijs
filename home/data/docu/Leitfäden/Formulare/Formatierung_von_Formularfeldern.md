Formatierung von Formularfeldern
===============================

Formularfelder werden bei folgenden Ereignissen formatiert:
- Zuweisung eines Werts (```value = ...```)
- Während der Eingabe
- beim Verlassen des Felds

Und auch bei folgenden Funktionen des container.Form:
- load()

Benutzerdefinierte Formatierungen sind nur in ```kijs.gui.field.Text``` Feldern, 
und davon vererbten Feldern möglich.  

### formatRegExp
Benutzerdefinierte reguläre Ausdrücke zur Formatierung.  
Beispiel:  

    formatRegExp: [
        { 
            regExp: /\s/g, // Whitespace entfernen
            replace: ''
        },{ 
            regExp: /(\S{3})/g, // alle 3 Zeichen eine Lücke einfügen
            replace: '$1 '
        },{ 
            regExp: /\s$/, // Whitespace am Ende entfernen
            replace: ''
        },{ 
            regExp: /(.*)/g, // Buchstaben in Grossbauchstaben umwandeln
            toUpperCase: true
        }
    ]

Es können ein oder mehrere Ausdrücke zur Formatierung angegeben werden.  
Alle Ausdrücke werden nacheinander abgearbeitet.  
Pro Ausdruck, kann entweder 
 - ```replace: '...'``` String der das Ergebnis ersetzt.
 - ```toUpperCase:true``` Konvertiert das Ergebnis in Grossbuchstaben.
 - ```toLowerCase:true``` Konvertiert das Ergebnis in Kleinbuchstaben.

angegeben werden. Mehrere gleichzeitig im gleichen Ausdruck sind nicht möglich.  
Dafür müssten mehrere Ausdrücke gemacht werden.  

### formatFn, formatFnContext
Benutzerdefinierte Funktion, die den Wert formatiert.  
Beispiel:  

    formatFn: function(value, whileTyping) {
        // alle Leerzeichen am Anfang und in der Mitte durch einen Punkt ersetzen
        value = value.replace(/\s*(?!$)/g, '.');

        // beim verlassen des Feldes das letzte Leerzeichen entfernen
        if (!whileTyping) {
            value = value.replace(/\s*$/g, '');
        }

        return value;
    },
    formatFnContext: this

