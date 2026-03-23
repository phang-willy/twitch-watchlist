const TWITCH_TOKEN_URL = "https://id.twitch.tv/oauth2/token";
const TOKEN_CACHE_KEY = "twitch_token_cache";

interface CachedToken {
  accessToken: string;
  expiresAt: number;
}

let tokenCache: CachedToken | null = null;

async function fetchNewToken(): Promise<string> {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Missing TWITCH_CLIENT_ID or TWITCH_CLIENT_SECRET in environment"
    );
  }

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "client_credentials",
  });

  const res = await fetch(`${TWITCH_TOKEN_URL}?${params}`, {
    method: "POST",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Twitch auth failed: ${res.status} ${text}`);
  }

  const data = (await res.json()) as {
    access_token: string;
    expires_in: number;
  };

  return data.access_token;
}

export async function getAccessToken(): Promise<string> {
  const now = Date.now();
  const bufferMs = 60 * 1000; // Refresh 1 min before expiry

  if (
    tokenCache &&
    tokenCache.expiresAt &&
    tokenCache.expiresAt > now + bufferMs
  ) {
    return tokenCache.accessToken;
  }

  const accessToken = await fetchNewToken();
  tokenCache = {
    accessToken,
    expiresAt: now + 3600 * 1000, // Twitch tokens expire in 3600s
  };
  return accessToken;
}
