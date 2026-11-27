<?php
declare(strict_types=1);

// Bricht ab, wenn ein Werkzeug oder eine Testseite nicht lokal (Kommandozeile oder localhost) aufgerufen wird.
// Die Werkzeuge schreiben Dateien oder rufen externe Dienste auf und dürfen deshalb
// auf einem öffentlichen Server nicht von aussen ausgeführt werden.
// Einbinden mit: require_once __DIR__ . '/localOnly.php';
if (PHP_SAPI !== 'cli' && !in_array($_SERVER['REMOTE_ADDR'] ?? '', ['127.0.0.1', '::1', '::ffff:127.0.0.1'], true)) {
    http_response_code(403);
    header('Content-Type: text/plain; charset=utf-8');
    exit('This page can only be accessed locally (localhost).');
}
