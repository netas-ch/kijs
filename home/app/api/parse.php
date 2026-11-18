<?php
/**
 * Parst kijs und gibt das Ergebnis als JSON aus (Test für Schritt 1).
 *
 * Aufruf auf der Kommandozeile:
 *   php home/app/api/parse.php                     alles ausgeben
 *   php home/app/api/parse.php kijs.gui.Button     nur eine Klasse
 *   php home/app/api/parse.php --issues            nur den Lückenbericht
 *   php home/app/api/parse.php --stats             nur die Zusammenfassung
 */
if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit;
}

require_once __DIR__ . '/ProjectParser.php';

$pp = new ProjectParser(realpath(__DIR__ . '/../../..'));
$result = $pp->parseAll();

$arg = $argv[1] ?? null;
if ($arg === '--issues') {
    $out = $result->issues;
} elseif ($arg === '--stats') {
    $out = ['stats' => $result->stats, 'errors' => $result->errors];
} elseif ($arg) {
    $out = null;
    foreach ($result->classes as $cls) {
        if ($cls->name === $arg) {
            $out = $cls;
        }
    }
    if (!$out) {
        fwrite(STDERR, 'Klasse ' . $arg . " nicht gefunden\n");
        exit(1);
    }
} else {
    $out = $result;
}

echo json_encode($out, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), "\n";
fwrite(STDERR, sprintf("%d Dateien, %d Klassen, %d Lücken, %d Fehler, %.2f s\n",
    $result->stats->files, $result->stats->classes, $result->stats->issues, $result->stats->errors, $result->stats->seconds));
