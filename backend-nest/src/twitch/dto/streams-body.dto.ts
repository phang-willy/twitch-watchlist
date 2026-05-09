import { IsArray, IsString } from 'class-validator';

export class StreamsBodyDto {
  @IsArray()
  @IsString({ each: true })
  logins!: string[];
}
