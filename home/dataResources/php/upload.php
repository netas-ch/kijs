<?php
declare(strict_types=1);

// --------------------------------------------------------------
// Upload-Endpunkt für den Showcase kijs.gui.FileUpload
// --------------------------------------------------------------
// Erwartet den Dateiinhalt als Body und den Dateinamen bzw. Ordner URL-codiert in den
// Headern X-Filename und X-Filepath (siehe kijs.FileUpload).
// Die Dateien werden NICHT gespeichert, es wird nur gelesen und die Grösse zurückgegeben.
// Enthält der Dateiname «fehler», wird zum Testen eine Fehlermeldung zurückgegeben.

header('Content-Type: application/json; charset=utf-8');

$response = new stdClass();

try {
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
        throw new Exception('Nur POST ist erlaubt');
    }

    $fileName = rawurldecode((string)($_SERVER['HTTP_X_FILENAME'] ?? ''));
    $filePath = rawurldecode((string)($_SERVER['HTTP_X_FILEPATH'] ?? ''));
    $fileType = (string)($_SERVER['CONTENT_TYPE'] ?? '');

    if ($fileName === '') {
        throw new Exception('Der Header X-Filename fehlt');
    }

    // Body lesen, ohne ihn zu speichern
    $size = 0;
    $input = fopen('php://input', 'rb');
    if ($input === false) {
        throw new Exception('Die Daten konnten nicht gelesen werden');
    }
    while (!feof($input)) {
        $chunk = fread($input, 65536);
        $size += $chunk === false ? 0 : strlen($chunk);
    }
    fclose($input);

    if (stripos($fileName, 'fehler') !== false) {
        throw new Exception('Testfehler: Der Dateiname enthält «fehler»');
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
