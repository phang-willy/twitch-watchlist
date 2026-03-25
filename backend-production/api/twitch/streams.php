<?php

declare(strict_types=1);

require_once __DIR__ . '/../../lib/config.php';
require_once __DIR__ . '/../../lib/http.php';
require_once __DIR__ . '/../../lib/twitch.php';

load_env_file(dirname(__DIR__, 2) . '/.env');
handle_preflight();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Method not allowed'], 405);
}

$body = read_json_body();
$logins = $body['logins'] ?? null;
if (!is_array($logins)) {
    json_response(['error' => "Body must contain 'logins' array"], 400);
}

try {
    $result = get_streams($logins);
    json_response($result);
} catch (Throwable $e) {
    json_response(['error' => $e->getMessage()], 500);
}

