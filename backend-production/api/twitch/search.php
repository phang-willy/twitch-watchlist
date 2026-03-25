<?php

declare(strict_types=1);

require_once __DIR__ . '/../../lib/config.php';
require_once __DIR__ . '/../../lib/http.php';
require_once __DIR__ . '/../../lib/twitch.php';

load_env_file(dirname(__DIR__, 2) . '/.env');
handle_preflight();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(['error' => 'Method not allowed'], 405);
}

$q = $_GET['q'] ?? null;
if (!is_string($q) || trim($q) === '') {
    json_response(['error' => 'Missing or invalid query parameter q'], 400);
}

try {
    $result = search_users(trim($q));
    json_response($result ?? []);
} catch (Throwable $e) {
    json_response(['error' => $e->getMessage()], 500);
}

