import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const TWITCH_TOKEN_URL = 'https://id.twitch.tv/oauth2/token';

@Injectable()
export class TwitchAuthService {
  private cache: { accessToken: string; expiresAt: number } | null = null;

  constructor(private readonly config: ConfigService) {}

  async getAccessToken(): Promise<string> {
    const nowSec = Math.floor(Date.now() / 1000);
    if (this.cache && this.cache.expiresAt > nowSec + 60) {
      return this.cache.accessToken;
    }

    const clientId = this.config.get<string>('TWITCH_CLIENT_ID');
    const clientSecret = this.config.get<string>('TWITCH_CLIENT_SECRET');
    if (!clientId || !clientSecret) {
      throw new Error('Missing TWITCH_CLIENT_ID or TWITCH_CLIENT_SECRET');
    }

    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials',
    });

    const res = await fetch(`${TWITCH_TOKEN_URL}?${params.toString()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to fetch Twitch token: ${res.status} ${text}`);
    }

    const decoded = (await res.json()) as {
      access_token?: string;
      expires_in?: number;
    };
    if (!decoded.access_token) {
      throw new Error('Invalid Twitch token response');
    }

    const expiresIn = decoded.expires_in ?? 3600;
    this.cache = {
      accessToken: decoded.access_token,
      expiresAt: nowSec + expiresIn,
    };
    return this.cache.accessToken;
  }
}
