import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { UserStatus } from 'src/modules/auth/entities/auth.entity';

export class UpdateUserStatusDto {
  @ApiProperty({
    enum: UserStatus,
    enumName: 'UserStatus',
    example: UserStatus.ACTIVE,
    description: 'وضعیت جدید کاربر',
  })
  @IsEnum(UserStatus)
  @IsNotEmpty({ message: 'تعیین وضعیت الزامی است' })
  status: UserStatus;
}
