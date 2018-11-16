<?php

/**
 * Klasse für ein RPC-Response an ein Formular
 * @author Lukas Buchs
 */
class RpcResponseForm extends RpcResponseBase {
    public $items = array();
    public $formData = array();
    public $fieldErrors = array();

    // -----------------
    // Public
    // -----------------

    /**
     * Fügt ein Item zum Form hinzu
     * @param array|stdClass $items Ein Item oder ein array von items anhängen
     */
    public function addItems($items) {

        // array von items: alle items anhängen
        if (is_array($items) && $this->isSequential($items)) {
            foreach ($items as $item) {
                $this->items[] = $item;
            }

        // Einzelnes Item: anfügen
        } else {
            $this->items[] = $items;
        }
    }

    /**
     * Setzt das value eines Forms
     * @param array $values array mit key => value
     */
    public function setFormData($values) {
        foreach ($values as $key => $value) {
            $this->formData[$key] = $value;
        }
    }

    /**
     * Setzt die Fehlermeldungen bei einem Form
     * @param array $errors
     */
    public function setFieldErrors($errors) {
        foreach ($errors as $key => $error) {
            $this->fieldErrors[$key] = $error;
        }
    }


    // -----------------
    // Protected
    // -----------------

    /**
     * overwrite: Werte für callback-Funktion aufbereiten
     * @return \stdClass
     */
    protected function prepareCallbackData() {
        $cbData = new stdClass();
        if ($this->items) {
            $cbData->items = $this->items;
        }
        if ($this->formData) {
            $cbData->formData = $this->formData;
        }
        if ($this->fieldErrors) {
            $cbData->fieldErrors = $this->fieldErrors;
        }
        return $cbData;
    }

    // -----------------
    // Private
    // -----------------

    /**
     * prüft ob ein array numerische Schlüssel hat.
     * @param array $arr
     * @return bool
     */
    private function isSequential($arr) {
        if (count($arr) === 0) {
            return true;
        }
        return array_keys($arr) === range(0, count($arr) - 1);
    }

}
