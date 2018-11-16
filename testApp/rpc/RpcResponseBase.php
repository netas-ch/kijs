<?php

/**
 * Die RpcResponse-Klasse dient zur Daten-Rückgabe vom Server an den Browser.
 * @author Lukas Buchs
 */
abstract class RpcResponseBase implements \JsonSerializable {
    protected $jsonType = 'RpcResponse';

    protected $errorTitle = 'Fehler';
    protected $errorMsgs = array();
    protected $errorCancelCallback = true;

    protected $infoTitle = 'Info';
    protected $infoMsgs = array();

    protected $cornerTipTitle = 'Info';
    protected $cornerTipMsgs = array();

    protected $warningTitle = 'Warnung';
    protected $warningMsgs = array();

    // -----------------
    // Public
    // -----------------

    /**
     * Zeigt eine Meldung als Tiptext unten Links an.
     * @param string $message
     * @param string $title
     */
    public function showCornerTipMsg($message, $title=null) {
        $this->cornerTipMsgs[] = $message;
        if ($title) {
            $this->cornerTipTitle = $title;
        }
    }

    /**
     * Zeigt eine Fehlermeldung an. Die Callback-Fn wird nicht aufgerufen.
     * @param string|Throwable $message
     * @param string $title
     * @param bool $cancelCallback false, falls die callback-Fn trotzdem aufgerufen werden soll.
     */
    public function showErrorMsg($message, $title=null, $cancelCallback=true) {
        if ($message instanceof Throwable) {
            $message = $message->getMessage();
        }
        $this->errorMsgs[] = $message;
        if ($title) {
            $this->errorTitle = $title;
        }
        $this->errorCancelCallback = !!$cancelCallback;
    }

    /**
     * Zeigt eine Info-Meldung mit einem 'ok' Button an
     * @param string $message
     * @param string $title
     */
    public function showInfoMsg($message, $title=null) {
        $this->infoMsgs[] = $message;
        if ($title) {
            $this->infoTitle = $title;
        }
    }

    /**
     * Zeigt eine Warnung mit einem 'ok' und einem 'Abbrechen' Button an.
     * @param string $message
     * @param string $title
     */
    public function showWarningMsg($message, $title=null) {
        $this->warningMsgs[] = $message;
        if ($title) {
            $this->warningTitle = $title;
        }
    }


    // -----------------
    // Implementierung
    // -----------------

    /**
     * Funktion wird vom json_encode aufgerufen, um die Daten
     * ans JavaScript zu übertragen.
     * @return \stdClass
     */
    public function jsonSerialize() {
        $json = new \stdClass();
        $json->type = $this->jsonType;
        $json->callbackData = $this->prepareCallbackData();

        if ($this->cornerTipMsgs) {
            $json->cornerTipMsg = array('msg' => $this->cornerTipMsgs, 'title' => $this->cornerTipTitle);
        }

        if ($this->errorMsgs) {
            $json->errorMsg = array('msg' => $this->errorMsgs, 'title' => $this->errorTitle, 'cancelCb' => $this->errorCancelCallback);
        }

        if ($this->infoMsgs) {
            $json->infoMsg = array('msg' => $this->infoMsgs, 'title' => $this->infoTitle);
        }

        if ($this->warningMsgs) {
            $json->warningMsg = array('msg' => $this->warningMsgs, 'title' => $this->warningTitle);
        }

        return $json;
    }

    // -----------------
    // Protected
    // -----------------

    /**
     * Bereitet Argumente für die Rückgabe an die callback-Funktion auf.
     * Methode kann in abgeleiteter Klasse überschrieben werden, falls
     * Daten an die Callback-Funktion übergeben werden sollen.
     * @return null|stdClass
     */
    protected function prepareCallbackData() {
        return null;
    }
}
