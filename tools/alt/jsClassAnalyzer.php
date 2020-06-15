<?php

/**
 * Analisiert eine JavaScript-Klasse
 * @author Lukas Buchs
 */
class jsClassAnalyzer {
    protected $jsCode = null;
    protected $className = '';
    protected $internalClassName = '';
    protected $extends = null;
    protected $path = null;

    public function analyzeFile(string $path) {
        $this->path = $path;
        return $this->analyzeJs(file_get_contents($path));
    }

    public function analyzeJs(string $jsCode) {
        $this->jsCode = $jsCode;

        $matches = array();
        if (preg_match('/(\S+)\s+=\s+class\s+(\S+)(?:\s+extends\s+(\S+)){0,1}\s*{/iu', $jsCode, $matches)) {
            $this->className = $matches[1];
            $this->internalClassName = $matches[2];
            $this->extends = $matches[3] ?: null;
        }

        if (mb_substr($this->className, 0, mb_strlen('window.')) === 'window.') {
            $this->className = mb_substr($this->className, mb_strlen('window.'));
        }
    }

    public function getClassName() {
        return $this->className;
    }

    public function getJs() {
        return $this->jsCode;
    }

    public function getPath() {
        return $this->path;
    }

    public function extends() {
        return $this->extends;
    }
}
