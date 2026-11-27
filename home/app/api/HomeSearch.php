<?php
declare(strict_types=1);
/**
 * Globale Suche der Home-App über API, Leitfäden, Showcase und Tests.
 *
 * Die API wird in der SQLite-Datenbank gesucht (Klassen und eigene Einträge).
 * Leitfäden, Showcase und Tests werden direkt in den Dateien gesucht, damit sie
 * ohne Update immer aktuell sind (nur rund 90 Dateien).
 */
class HomeSearch {
    const MAX_API = 100;        // max. Treffer in der API
    const SNIPPET_LENGTH = 160; // Länge eines Textausschnitts

    protected string $_dataDir = '';


    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    public function __construct() {
        $this->_dataDir = realpath(__DIR__ . '/../../data') ?: '';
    }


    // --------------------------------------------------------------
    // PUBLIC
    // --------------------------------------------------------------
    /**
     * Sucht einen Begriff (ohne Gross-/Kleinschreibung)
     * @param string $query
     * @return stdClass  {query, api: [...], docu: [...], showcase: [...], test: [...]}
     */
    public function search(string $query): stdClass {
        $query = trim($query);
        if (mb_strlen($query) < 2) {
            throw new Exception('The query must contain at least 2 characters.');
        }

        return (object)[
            'query' => $query,
            'api' => $this->_searchApi($query),
            'docu' => $this->_searchFiles('docu', 'md', $query),
            'showcase' => $this->_searchFiles('showcase', 'js', $query),
            'test' => $this->_searchFiles('test', 'js', $query)
        ];
    }


    // --------------------------------------------------------------
    // PROTECTED
    // --------------------------------------------------------------
    /**
     * Gibt einen Textausschnitt rund um die erste Fundstelle zurück
     * @param string $text
     * @param string $query
     * @return string
     */
    protected function _getSnippet(string $text, string $query): string {
        $text = (string)preg_replace('/\s+/u', ' ', $text);
        $pos = mb_stripos($text, $query);
        if ($pos === false) {
            return mb_substr($text, 0, self::SNIPPET_LENGTH) . (mb_strlen($text) > self::SNIPPET_LENGTH ? ' …' : '');
        }
        $start = max(0, $pos - (int)(self::SNIPPET_LENGTH / 3));
        $snippet = mb_substr($text, $start, self::SNIPPET_LENGTH);
        return ($start > 0 ? '… ' : '') . trim($snippet) . ($start + self::SNIPPET_LENGTH < mb_strlen($text) ? ' …' : '');
    }

    /**
     * Sucht in der API: Klassennamen sowie Name und Beschreibung der eigenen
     * Einträge (ohne vererbte und ohne protected Funktionen).
     * Sortierung: gleicher Name, Name beginnt mit, Name enthält, Beschreibung enthält.
     * @param string $query
     * @return array
     */
    protected function _searchApi(string $query): array {
        $dbPath = $this->_dataDir . '/api.sqlite';
        if (!is_file($dbPath)) {
            return [];
        }
        $pdo = new PDO('sqlite:' . $dbPath, null, null, [Pdo\Sqlite::ATTR_OPEN_FLAGS => Pdo\Sqlite::OPEN_READONLY]);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_OBJ);

        $like = '%' . str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $query) . '%';
        $params = [
            ':q' => mb_strtolower($query),
            ':qs' => mb_strtolower($query) . '%',
            ':like' => $like
        ];

        $sql = "
            SELECT * FROM (
                SELECT c.name AS className, NULL AS member, 'class' AS kind, c.description AS description,
                    CASE WHEN lower(c.name) = :q OR lower(c.name) LIKE '%.' || :q THEN 0
                         WHEN lower(c.name) LIKE :qs THEN 1
                         WHEN c.name LIKE :like ESCAPE '\\' THEN 2
                         ELSE 3 END AS rank
                FROM class c
                WHERE c.name LIKE :like ESCAPE '\\' OR c.description LIKE :like ESCAPE '\\'

                UNION ALL

                SELECT c.name, m.name, m.kind, m.description,
                    CASE WHEN lower(m.name) = :q THEN 0
                         WHEN lower(m.name) LIKE :qs THEN 1
                         WHEN m.name LIKE :like ESCAPE '\\' THEN 2
                         ELSE 3 END
                FROM member m
                JOIN class c ON c.classId = m.classId
                WHERE (m.kind <> 'function' OR m.visibility = 'public')
                  AND (m.name LIKE :like ESCAPE '\\' OR m.description LIKE :like ESCAPE '\\')
            )
            ORDER BY rank, member IS NOT NULL, lower(coalesce(member, '')), lower(className)
            LIMIT " . (self::MAX_API + 1);

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();

        $hits = [];
        foreach ($rows as $r) {
            $hits[] = (object)[
                'className' => $r->className,
                'member' => $r->member,
                'kind' => $r->kind,
                'snippet' => $r->description ? $this->_getSnippet($r->description, $query) : ''
            ];
        }
        return $hits;
    }

    /**
     * Sucht in den Dateien eines Bereichs (Dateiname und Inhalt)
     * @param string $area   'docu', 'showcase' oder 'test'
     * @param string $ext    Dateiendung ('md' oder 'js')
     * @param string $query
     * @return array  sortiert nach Anzahl Treffer
     */
    protected function _searchFiles(string $area, string $ext, string $query): array {
        $dir = $this->_dataDir . '/' . $area;
        if (!is_dir($dir)) {
            return [];
        }

        $hits = [];
        $it = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dir, FilesystemIterator::SKIP_DOTS));
        foreach ($it as $file) {
            if (strtolower($file->getExtension()) !== $ext) {
                continue;
            }
            $title = str_replace('_', ' ', $file->getBasename('.' . $file->getExtension()));
            $content = (string)file_get_contents($file->getPathname());

            $count = mb_substr_count(mb_strtolower($content), mb_strtolower($query));
            $inTitle = mb_stripos($title, $query) !== false;
            if (!$count && !$inTitle) {
                continue;
            }

            $relPath = 'data/' . $area . str_replace('\\', '/', substr($file->getPathname(), strlen($dir)));
            $hits[] = (object)[
                'title' => $title,
                'path' => $relPath,
                'folder' => trim(dirname(substr($relPath, strlen('data/' . $area))), '/.'),
                'count' => $count,
                'inTitle' => $inTitle,
                'snippet' => $count ? $this->_getSnippet($content, $query) : ''
            ];
        }

        // Treffer im Titel zuerst, dann nach Anzahl
        usort($hits, function($a, $b) {
            if ($a->inTitle !== $b->inTitle) {
                return $a->inTitle ? -1 : 1;
            }
            return $b->count <=> $a->count ?: strcasecmp($a->path, $b->path);
        });
        return $hits;
    }

}
