<?php

/**
 * Klasse für ein RPC-Response an ein Kombinationsfeld
 * @author Lukas Buchs
 */
class RpcResponseCombo extends RpcResponseBase {
    public $rows = array();

    // -----------------
    // Public
    // -----------------

    /**
     * Fügt eine row zum Combo hinzu.
     * @param array $rows eine Row oder ein array von Rows
     */
    public function addRows($rows) {
        // falls rows nur eine row ist, ist es nicht zweidimensional und wird erweitert
        $rows = $this->uniDimensionalToTwoDimensional($rows);

        foreach ($rows as $row) {
            $this->rows[] = $row;
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
        $cbData->rows = $this->rows;
        return $cbData;
    }

    // -----------------
    // Private
    // -----------------

    /**
     * Macht aus einem eindimensionalem Array ein zweidimensionales Array.
     * @param array $rows
     * @return array
     */
    private function uniDimensionalToTwoDimensional($rows) {
        if (is_array($rows) && count($rows) > 0 && !is_array($rows[array_keys($rows)[0]])) {
            return array($rows);
        }
        return $rows;
    }

}
