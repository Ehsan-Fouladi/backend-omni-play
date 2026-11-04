import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

export class VerificationEmailDto {
  @ApiProperty({ example: 'example@gmail.com' })
  @IsEmail()
  @IsNotEmpty({ message: 'ایمیل الزامی است' })
  email: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @IsNotEmpty({ message: 'کد تایید الزامی است' })
  @Matches(/^\d{6}$/, {
    message: 'کد تأیید باید دقیقاً ۶ رقم باشد',
  })
  code: string;
}
