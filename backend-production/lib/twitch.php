<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/twitch_auth.php';

function twitch_fetch(string $endpoint): array
{
    $apiUrl = env('TWITCH_API_URL', 'https://api.twitch.tv/helix');
    $clientId = env('TWITCH_CLIENT_ID');
    if (!$clientId) {
        throw new RuntimeException('Missing TWITCH_CLIENT_ID');
    }

    $token = get_access_token();
    $url = str_starts_with($endpoint, 'http') ? $endpoint : rtrim($apiUrl, '/') . $endpoint;

    $context = stream_context_create([
        'http' => [
            'method' => 'GET',
            'ignore_errors' => true,
            'header' => implode("\r\n", [
                'Client-Id: ' . $clientId,
                'Authorization: Bearer ' . $token,
                'Content-Type: application/json',
            ]),
        ],
    ]);

    $response = file_get_contents($url, false, $context);
    if ($response === false) {
        throw new RuntimeException('Twitch API request failed');
    }

    $decoded = json_decode($response, true);
    if (!is_array($decoded)) {
        throw new RuntimeException('Invalid Twitch API response');
    }
    return $decoded;
}

function search_users(string $login): ?array
{
    $data = twitch_fetch('/users?login=' . rawurlencode(strtolower($login)));
    $user = $data['data'][0] ?? null;
    if (!$user) {
        return null;
    }

    return [
        'id' => (string) $user['id'],
        'login' => (string) $user['login'],
        'displayName' => (string) $user['display_name'],
        'profileImageUrl' => (string) $user['profile_image_url'],
        'twitchUrl' => 'https://www.twitch.tv/' . $user['login'],
    ];
}

function get_streams(array $logins): array
{
    $userLogins = array_values(array_filter(array_map(
        static fn ($l) => strtolower(trim((string) $l)),
        $logins
    )));

    if (count($userLogins) === 0) {
        return ['live' => [], 'offline' => [], 'liveCount' => 0];
    }

    $streamParams = implode('&', array_map(
        static fn ($l) => 'user_login=' . rawurlencode($l),
        $userLogins
    ));
    $streamsData = twitch_fetch('/streams?' . $streamParams);
    $streams = $streamsData['data'] ?? [];

    $liveLogins = [];
    foreach ($streams as $s) {
        $liveLogins[strtolower((string) $s['user_login'])] = true;
    }

    $userParams = implode('&', array_map(
        static fn ($l) => 'login=' . rawurlencode($l),
        $userLogins
    ));
    $usersData = twitch_fetch('/users?' . $userParams);
    $users = $usersData['data'] ?? [];

    $usersById = [];
    $usersByLogin = [];
    foreach ($users as $u) {
        $usersById[(string) $u['id']] = $u;
        $usersByLogin[strtolower((string) $u['login'])] = $u;
    }

    usort($streams, static fn ($a, $b) => ((int) $b['viewer_count']) <=> ((int) $a['viewer_count']));

    $live = [];
    foreach ($streams as $s) {
        $userId = (string) $s['user_id'];
        $userLogin = strtolower((string) $s['user_login']);
        $u = $usersById[$userId] ?? ($usersByLogin[$userLogin] ?? null);
        $live[] = [
            'id' => $userId,
            'login' => (string) $s['user_login'],
            'displayName' => (string) $s['user_name'],
            'profileImageUrl' => $u['profile_image_url'] ?? '',
            'twitchUrl' => 'https://www.twitch.tv/' . $s['user_login'],
            'viewerCount' => (int) $s['viewer_count'],
            'gameName' => (string) ($s['game_name'] ?? 'Unknown'),
            'streamTitle' => (string) ($s['title'] ?? ''),
            'startedAt' => (string) $s['started_at'],
        ];
    }

    $offline = [];
    foreach ($userLogins as $login) {
        if (isset($liveLogins[$login])) {
            continue;
        }

        $u = $usersByLogin[$login] ?? null;
        if (!$u) {
            $offline[] = [
                'id' => $login,
                'login' => $login,
                'displayName' => $login,
                'profileImageUrl' => '',
                'twitchUrl' => 'https://www.twitch.tv/' . $login,
            ];
            continue;
        }

        $lastStreamedAt = null;
        try {
            $videos = twitch_fetch('/videos?user_id=' . rawurlencode((string) $u['id']) . '&first=1&type=archive');
            $lastStreamedAt = $videos['data'][0]['created_at'] ?? null;
        } catch (Throwable $e) {
            $lastStreamedAt = null;
        }

        $item = [
            'id' => (string) $u['id'],
            'login' => (string) $u['login'],
            'displayName' => (string) $u['display_name'],
            'profileImageUrl' => (string) $u['profile_image_url'],
            'twitchUrl' => 'https://www.twitch.tv/' . $u['login'],
        ];
        if ($lastStreamedAt) {
            $item['lastStreamedAt'] = (string) $lastStreamedAt;
        }
        $offline[] = $item;
    }

    return [
        'live' => $live,
        'offline' => $offline,
        'liveCount' => count($live),
    ];
}

