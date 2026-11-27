<?php
declare(strict_types=1);

// --------------------------------------------------------------
// Upload-Endpunkt für den Showcase kijs.gui.FileUpload
// --------------------------------------------------------------
// Erwartet den Dateiinhalt als Body und den Dateinamen bzw. Ordner URL-codiert in den
// Headern X-Filename und X-Filepath (siehe kijs.FileUpload).
// Die Dateien werden NICHT gespeichert, es wird nur gelesen und die Grösse zurückgegeben.
// Enthält der Dateiname «fehler», wird zum Testen eine Fehlermeldung zurückgegeben.
// Mit dem GET-Parameter slow=1 wartet der Server 3 Sekunden, bevor er antwortet
// (zum Testen von Abbrechen).

header('Content-Type: application/json; charset=utf-8');

$response = new stdClass();

try {
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
        throw new Exception('Only POST is allowed');
    }

    $fileName = rawurldecode((string)($_SERVER['HTTP_X_FILENAME'] ?? ''));
    $filePath = rawurldecode((string)($_SERVER['HTTP_X_FILEPATH'] ?? ''));
    $fileType = (string)($_SERVER['CONTENT_TYPE'] ?? '');

    if ($fileName === '') {
        throw new Exception('The header X-Filename is missing');
    }

    // Body lesen, ohne ihn zu speichern
    $size = 0;
    $input = fopen('php://input', 'rb');
    if ($input === false) {
        throw new Exception('The data could not be read');
    }
    while (!feof($input)) {
        $chunk = fread($input, 65536);
        $size += $chunk === false ? 0 : strlen($chunk);
    }
    fclose($input);

    // Langsamer Server simulieren
    if ((string)($_GET['slow'] ?? '') === '1') {
        sleep(3);
    }

    if (stripos($fileName, 'fehler') !== false) {
        throw new Exception('Test error: the file name contains «fehler»');
    }

    $response->upload = [
        'fileName' => $fileName,
        'filePath' => $filePath,
        'fileType' => $fileType,
        'size' => $size
    ];

} catch (Throwable $ex) {
    $response->errorMsg = $ex->getMessage();
}

echo json_encode($response);
