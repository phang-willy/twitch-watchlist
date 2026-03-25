<?php

declare(strict_types=1);

require_once __DIR__ . '/lib/config.php';
require_once __DIR__ . '/lib/http.php';

load_env_file(__DIR__ . '/.env');
handle_preflight();
json_response(['ok' => true]);

