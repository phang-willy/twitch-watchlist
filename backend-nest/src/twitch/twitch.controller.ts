import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { SearchQueryDto } from './dto/search-query.dto';
import { StreamsBodyDto } from './dto/streams-body.dto';
import { TwitchService } from './twitch.service';

@Controller('api/twitch')
export class TwitchController {
  constructor(private readonly twitch: TwitchService) {}

  @Get('search')
  async search(@Query() query: SearchQueryDto) {
    try {
      const result = await this.twitch.searchUsers(query.q);
      return result ?? [];
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      throw new HttpException(
        { error: message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('streams')
  async streams(@Body() body: StreamsBodyDto) {
    try {
      return await this.twitch.getStreams(body.logins);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      throw new HttpException(
        { error: message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
