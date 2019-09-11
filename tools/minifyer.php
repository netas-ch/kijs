<?php
require_once 'jsClassAnalyzer.php';
require_once '../lib/jsmin/JSMin.php';

new minifyer('../js', 'kijs-min.js', 'kijs-debug.js');


/**
 * Klasse zum Minimieren. Dabei wird beachtet, von welcher Klasse
 * eine Klasse erbt und die Reihenfolge wird eingehalten.
 */
class minifyer {
    protected $jsDir = null;
    protected $files = array();
    protected $recognizedClasses = array();
    protected $unrecognizedClasses = array();
    protected $orderedClassNames = array();

    public function __construct($dir, $outputFile, $outputFileDebug) {
        $this->jsDir = $dir;

        $this->scan($this->jsDir);
        $this->analyze();
        $this->order($this->recognizedClasses);
        $js = $this->getCode();
        $jsMin = $this->min($js);

        print('<pre>');
        print_r($this->orderedClassNames);
        print('</pre>');

        if ($outputFile) {
            file_put_contents($outputFile, $jsMin);
        }

        if ($outputFileDebug) {
            file_put_contents($outputFileDebug, $js);
        }
    }


    protected function scan($dir) {
        $files = scandir($dir);
        foreach ($files as $file) {
            if (!in_array($file, array('.', '..'))) {
                if (is_dir($dir . '/' . $file)) {
                    $this->scan($dir . '/' . $file);
                }

                if (is_file($dir . '/' . $file) && mb_substr($file, -3) === '.js' && mb_substr($file, -6) !== 'ALT.js') {
                    $this->files[] = $dir . '/' . $file;
                }
            }
        }
    }

    protected function analyze() {
        foreach ($this->files as $file) {
            $jsClass = new jsClassAnalyzer();
            $jsClass->analyzeFile($file);

            if ($jsClass->getClassName()) {
                $this->recognizedClasses[] = $jsClass;
            } else {
                $this->unrecognizedClasses[] = $jsClass;
            }
        }
    }

    /**
     * Ordnet die Klassen so an, dass der Parent früher eingebunden wird.
     * @param Array $stack
     * @param Int $repeat
     */
    protected function order($stack, $repeat=1) {
        $nextTurn = array();
        $newOrderedFiles = array();
        foreach ($stack as $jsClass) {
            if ($jsClass->extends() && !in_array($jsClass->extends(), $this->orderedClassNames)) {
                $nextTurn[] = $jsClass;
            } else {
                $newOrderedFiles[] = $jsClass->getClassName();
            }
        }

        // sortierung der neuen
        sort($newOrderedFiles);

        $this->orderedClassNames = array_merge($this->orderedClassNames, $newOrderedFiles);

        if ($nextTurn && $repeat < 20) {
            $this->order($nextTurn, $repeat+1);

        // klassen, deren parent nicht gefunden werden konnte, hängen wir hinten
        // auch noch an.
        } else {
            foreach ($nextTurn as $ntF) {
                $this->orderedClassNames[] = $ntF->getClassName();
            }
        }
    }

    protected function getCode() {
        $js = '';
        foreach ($this->orderedClassNames as $className) {
            $cls = $this->getByClassName($className);
            $js .= $cls->getJs() . "\n";
        }

        foreach ($this->unrecognizedClasses as $cls) {
            $js .= $cls->getJs() . "\n";
        }

        return $js;
    }

    protected function min($code) {
        return JSMin::minify($code);
    }

    protected function getByClassName($className) {
        foreach ($this->recognizedClasses as $recognizedClass) {
            if ($recognizedClass->getClassName() === $className) {
                return $recognizedClass;
            }
        }
    }

}


