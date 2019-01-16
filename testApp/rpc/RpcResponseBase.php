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
     * Gibt die Nachrichten als stdClass zurück.
     * Funktion wird vom Router aufgerufen, um die Nachrichten
     * an den RPC zu übergeben.
     * @return \stdClass
     */
    public function getMessages() {
        $messages = new \stdClass();
        if ($this->cornerTipMsgs) {
            $messages->cornerTipMsg = array('msg' => $this->cornerTipMsgs, 'title' => $this->cornerTipTitle);
        }

        if ($this->errorMsgs) {
            $messages->errorMsg = array('msg' => $this->errorMsgs, 'title' => $this->errorTitle, 'cancelCb' => $this->errorCancelCallback);
        }

        if ($this->infoMsgs) {
            $messages->infoMsg = array('msg' => $this->infoMsgs, 'title' => $this->infoTitle);
        }

        if ($this->warningMsgs) {
            $messages->warningMsg = array('msg' => $this->warningMsgs, 'title' => $this->warningTitle);
        }

        return $messages;
    }

    /**
     * Zeigt eine Meldung als Tiptext unten Links an.
     * @param string $message
     * @param string|null $title
     */
    public function showCornerTipMsg($message, $title=null) {
        $this->cornerTipMsgs[] = $message;
        if ($title) {
            $this->cornerTipTitle = $title;
        }
    }

    /**
     * Zeigt eine Fehlermeldung an. Die Callback-Fn wird nicht aufgerufen.
     * @param string $message
     * @param string|null $title
     * @param bool $cancelCallback false, falls die callback-Fn trotzdem aufgerufen werden soll.
     */
    public function showErrorMsg($message, $title=null, $cancelCallback=true) {
        $this->errorMsgs[] = $message;
        if ($title) {
            $this->errorTitle = $title;
        }
        $this->errorCancelCallback = !!$cancelCallback;
    }

    /**
     * Zeigt eine Info-Meldung mit einem 'ok' Button an
     * @param string $message
     * @param string|null $title
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
     * @param string|null $title
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
     * Bereitet Argumente für die Rückgabe an die callback-Funktion auf.
     * Methode kann in abgeleiteter Klasse überschrieben werden, falls
     * Daten an die Callback-Funktion übergeben werden sollen.
     * @return null|object
     */
    public function jsonSerialize() {
        return null;
    }
}
