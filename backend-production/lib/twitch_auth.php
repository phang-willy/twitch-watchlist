<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';

const TWITCH_TOKEN_URL = 'https://id.twitch.tv/oauth2/token';

function token_cache_path(): string
{
    return sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'twitch_watchlist_token_cache.json';
}

function get_cached_token(): ?array
{
    $path = token_cache_path();
    if (!is_file($path)) {
        return null;
    }

    $raw = file_get_contents($path);
    if ($raw === false) {
        return null;
    }

    $decoded = json_decode($raw, true);
    if (!is_array($decoded)) {
        return null;
    }

    return $decoded;
}

function set_cached_token(string $token, int $expiresIn): void
{
    $payload = [
        'accessToken' => $token,
        'expiresAt' => time() + $expiresIn,
    ];
    file_put_contents(token_cache_path(), json_encode($payload));
}

function fetch_new_token(): array
{
    $clientId = env('TWITCH_CLIENT_ID');
    $clientSecret = env('TWITCH_CLIENT_SECRET');

    if (!$clientId || !$clientSecret) {
        throw new RuntimeException('Missing TWITCH_CLIENT_ID or TWITCH_CLIENT_SECRET');
    }

    $query = http_build_query([
        'client_id' => $clientId,
        'client_secret' => $clientSecret,
        'grant_type' => 'client_credentials',
    ]);

    $url = TWITCH_TOKEN_URL . '?' . $query;
    $context = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => "Content-Type: application/x-www-form-urlencoded\r\n",
            'ignore_errors' => true,
        ],
    ]);

    $response = file_get_contents($url, false, $context);
    if ($response === false) {
        throw new RuntimeException('Failed to fetch Twitch token');
    }

    $decoded = json_decode($response, true);
    if (!is_array($decoded) || empty($decoded['access_token'])) {
        throw new RuntimeException('Invalid Twitch token response');
    }

    return [
        'accessToken' => (string) $decoded['access_token'],
        'expiresIn' => isset($decoded['expires_in']) ? (int) $decoded['expires_in'] : 3600,
    ];
}

function get_access_token(): string
{
    $cached = get_cached_token();
    if ($cached && isset($cached['accessToken'], $cached['expiresAt'])) {
        $expiresAt = (int) $cached['expiresAt'];
        if ($expiresAt > (time() + 60)) {
            return (string) $cached['accessToken'];
        }
    }

    $newToken = fetch_new_token();
    set_cached_token($newToken['accessToken'], $newToken['expiresIn']);
    return $newToken['accessToken'];
}

