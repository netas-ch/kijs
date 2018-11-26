<?php


/**
 * Standard-RPC-Response für individuelle Rückgaben.
 * Es können dynamisch Attribute hinzugefügt werden, welche
 * ans Javascript übermittelt werden.
 * @author Lukas Buchs
 */
class RpcResponseDefault extends RpcResponseBase {
    protected $parameters = array();
    
    /**
     * Setzt einen Rückgabewert
     * @param string $name
     * @param mixed $value
     */
    public function setResponseParameter($name, $value) {
        $this->parameters[$name] = $value;
    }

    // -----------------
    // getter/setter
    // -----------------

    public function __set($name, $value) {
        $this->parameters[$name] = $value;
    }

    public function __get($name) {
        if (array_key_exists($name, $this->parameters)) {
            return $this->parameters[$name];
        }
        return null;
    }

    public function __isset($name) {
        return isset($this->parameters[$name]);
    }

    public function __unset($name) {
        unset($this->parameters[$name]);
    }

    // -----------------
    // protected
    // -----------------

    /**
     * overwrite
     * @return \stdClass
     */
    public function jsonSerialize() {
        return (object) $this->parameters;
    }
}
