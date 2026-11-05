import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, Min } from 'class-validator';

export class UpdateMatchStatsDto {
  @ApiProperty({
    example: 12,
    description: 'تعداد کیل‌ های کسب شده در این مسابقه',
  })
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  earnedKills: number;

  @ApiProperty({
    example: 5,
    description: 'تعداد مرگ‌های بازیکن در این مسابقه',
  })
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  earnedDeaths: number;

  @ApiProperty({ example: true, description: 'آیا مسابقه برنده شده است؟' })
  @IsBoolean()
  @IsNotEmpty()
  isMatchWon: boolean;

  @ApiProperty({ example: 250, description: 'مقدار XP کسب شده در این مسابقه' })
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  earnedXp: number;
}
