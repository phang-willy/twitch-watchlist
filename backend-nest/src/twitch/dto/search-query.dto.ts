import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class SearchQueryDto {
  @Transform(({ value }: { value: string }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  q!: string;
}
