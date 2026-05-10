import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601 } from 'class-validator';

export class ScheduleBlogDto {
  @ApiProperty({
    description: 'Future date/time when the blog should become published.',
  })
  @IsISO8601()
  scheduledPublishAt: string;
}
