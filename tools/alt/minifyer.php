<?php
require_once 'jsClassAnalyzer.php';
require_once '../../lib/jsmin/JSMin.php';

new minifyer('../../files.json', 'kijs-min.js', 'kijs-debug.js');


/**
 * Klasse zum Minimieren. Dabei wird beachtet, von welcher Klasse
 * eine Klasse erbt und die Reihenfolge wird eingehalten.
 */
class minifyer {

    protected array $files               = [];
    protected array $recognizedClasses   = [];
    protected array $unrecognizedClasses = [];
    protected array $orderedClassNames   = [];


    /**
     * @throws JsonException
     */
    public function __construct($file, $outputFile, $outputFileDebug) {

        if (is_file($file)) {
            $json = json_decode(file_get_contents($file), true, 512, JSON_THROW_ON_ERROR);

            $parts = ['core', 'translations', 'gui', 'grid', 'grid', 'aceEditor', 'quillEditor'];
            $filesToMerge = [];

            foreach ($parts as $part) {
                if (!empty($json['js'][$part]) && is_array($json['js'][$part])) {
                    $filesToMerge[] = $json['js'][$part];
                }
            }

            $this->files = array_merge(...$filesToMerge);

            $js = $this->getCode();
            $jsMin = $this->min($js);

            if ($outputFile) {
                file_put_contents($outputFile, $jsMin);
            }

            if ($outputFileDebug) {
                file_put_contents($outputFileDebug, $js);
            }
        } else {
            throw new Exception('File not exists');
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
     *
     * @param array $stack
     * @param Int   $repeat
     */
    protected function order($stack, $repeat = 1) {
        $nextTurn = [];
        $newOrderedFiles = [];
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
            $this->order($nextTurn, $repeat + 1);

            // klassen, deren parent nicht gefunden werden konnte, hängen wir hinten
            // auch noch an.
        } else {
            foreach ($nextTurn as $ntF) {
                $this->orderedClassNames[] = $ntF->getClassName();
            }
        }
    }


    protected function getCode(): string {
        $js = '';
        foreach ($this->files as $file) {
            $js .= file_get_contents('../../' . $file);
        }

        return $js;
    }


    protected function min($code): string {
        return \JShrink\Minifier::minify($code);
    }


    protected function getByClassName($className) {
        foreach ($this->recognizedClasses as $recognizedClass) {
            if ($recognizedClass->getClassName() === $className) {
                return $recognizedClass;
            }
        }
    }

}


