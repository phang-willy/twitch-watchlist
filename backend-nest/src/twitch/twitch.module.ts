import { Module } from '@nestjs/common';
import { TwitchAuthService } from './twitch-auth.service';
import { TwitchController } from './twitch.controller';
import { TwitchService } from './twitch.service';

@Module({
  controllers: [TwitchController],
  providers: [TwitchService, TwitchAuthService],
})
export class TwitchModule {}
