import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, Max, Min } from 'class-validator';

export class LeaderboardQueryDto {
  @ApiProperty({ example: 10, description: 'تعداد بازیکنان در لیدربورد' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsNotEmpty({ message: 'تعداد بازیکنان الزامی است' })
  limit: number = 10;
}
